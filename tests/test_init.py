"""Tests for the IPTV integration."""

import asyncio
import logging
import re
from unittest.mock import Mock, patch

import aiohttp
import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_PASSWORD, CONF_URL, CONF_USERNAME
from homeassistant.core import Context, HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import Unauthorized
from homeassistant.helpers import device_registry as dr
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from yarl import URL

from custom_components.iptv.api import StalkerClient, _probe_stream, _safe_err, stalker_expiry
from custom_components.iptv.const import CONF_PROVIDER, DOMAIN, PROVIDER_XTREAM

SERVER = "http://provider.example:8080"
API = f"{SERVER}/player_api.php"
USERNAME = "alex"
PASSWORD = "S3cretPassw0rd"
STREAM = f"{SERVER}/live/{USERNAME}/{PASSWORD}/1.ts"
DATA = {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: PASSWORD, CONF_PROVIDER: PROVIDER_XTREAM}

USER_INFO = {
    "user_info": {
        "auth": 1,
        "status": "Active",
        "exp_date": "4102444800",
        "created_at": "1700000000",
        "is_trial": "0",
        "active_cons": "0",
        "max_connections": "1",
    }
}
CATEGORIES = [{"category_name": "FR | Généraliste"}, {"category_name": "Sport"}]
LIVE = [{"stream_id": 1, "name": "Channel 1"}, {"stream_id": 2, "name": "Channel 2"}]


def _secret_error(status: int) -> aiohttp.ClientResponseError:
    """What aiohttp raises on an HTTP error: its text holds the full request URL."""
    url = URL(API).with_query({"username": USERNAME, "password": PASSWORD})
    err = aiohttp.ClientResponseError(Mock(real_url=url), (), status=status, message="Error")
    assert PASSWORD in str(err)
    return err


def _mock_server(aioclient_mock, user_info=USER_INFO) -> None:
    """A working Xtream server (specific actions first: the bare endpoint matches any query)."""
    for action in ("get_live_categories", "get_vod_categories", "get_series_categories"):
        aioclient_mock.get(API, params={"action": action}, json=CATEGORIES)
    aioclient_mock.get(API, params={"action": "get_live_streams"}, json=LIVE)
    aioclient_mock.get(API, params={"action": "get_vod_streams"}, json=[{"stream_id": 5}])
    aioclient_mock.get(API, params={"action": "get_series"}, json=[{"series_id": 7}])
    aioclient_mock.get(API, json=user_info)
    # Any account's stream (the path holds the username and password)
    aioclient_mock.get(re.compile(r"/live/.+\.ts$"), content=b"\x47" * 188, headers={"Content-Type": "video/mp2t"})


def _mock_failing_server(aioclient_mock, status: int) -> None:
    aioclient_mock.clear_requests()
    aioclient_mock.get(API, exc=_secret_error(status))


@pytest.fixture
def entry(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="provider.example",
        data=DATA,
        unique_id=f"{SERVER}|{USERNAME}".lower(),
    )
    entry.add_to_hass(hass)
    return entry


async def _setup(hass, aioclient_mock, entry) -> None:
    _mock_server(aioclient_mock)
    assert await async_setup_component(hass, "http", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


def _device_id(hass, entry) -> str:
    return dr.async_get(hass).async_get_device(identifiers={(DOMAIN, entry.entry_id)}).id


# ── setup / unload ──────────────────────────────────────────────────────────


async def test_setup_and_unload(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    assert entry.state is ConfigEntryState.LOADED
    assert hass.states.get("sensor.provider_example_status").state == "active"
    assert hass.states.get("sensor.provider_example_live_channels").state == "2"
    assert hass.states.get("sensor.provider_example_health").state == "ok"
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED


# ── no password in errors, health attribute or logs ─────────────────────────


@pytest.mark.parametrize("status", [401, 500])
async def test_http_error_hides_password_at_setup(hass, aioclient_mock, entry, caplog, status):
    caplog.set_level(logging.DEBUG)
    _mock_failing_server(aioclient_mock, status)
    assert await async_setup_component(hass, "http", {})
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_RETRY
    assert f"HTTP {status}" in caplog.text
    assert PASSWORD not in caplog.text
    assert PASSWORD not in str(entry.reason)


@pytest.mark.parametrize("status", [401, 500])
async def test_http_error_hides_password_after_setup(hass, aioclient_mock, entry, caplog, status):
    await _setup(hass, aioclient_mock, entry)
    caplog.set_level(logging.DEBUG)
    coordinator = entry.runtime_data
    _mock_failing_server(aioclient_mock, status)

    await coordinator.async_refresh()
    await hass.async_block_till_done()
    assert not coordinator.last_update_success
    assert str(coordinator.last_exception) == f"IPTV server unreachable: HTTP {status}"

    health = hass.states.get("sensor.provider_example_health")
    assert health.state == "unreachable"
    assert health.attributes["error"] == f"HTTP {status}"

    await coordinator.health.async_check_now()
    await hass.async_block_till_done()
    health = hass.states.get("sensor.provider_example_health")
    assert health.attributes["error"] == f"HTTP {status}"

    for state in hass.states.async_all():
        assert PASSWORD not in str(state.attributes)
    assert f"HTTP {status}" in caplog.text
    assert PASSWORD not in caplog.text


async def test_stream_probe_error_hides_url():
    err = aiohttp.TooManyRedirects(Mock(real_url=URL(STREAM)), ())
    assert PASSWORD in str(err)
    session = Mock()
    session.get = Mock(side_effect=err)
    res = await _probe_stream(session, STREAM, {})
    assert res == {"ok": False, "latency_ms": None, "error": "TooManyRedirects"}


def test_safe_err():
    assert _safe_err(_secret_error(403)) == "HTTP 403"
    assert _safe_err(TimeoutError()) == "TimeoutError"
    assert _safe_err(aiohttp.ClientConnectionError(f"cannot reach {STREAM}")) == "ClientConnectionError"
    assert _safe_err(ValueError(PASSWORD)) == "ValueError"


async def test_stream_probe_skipped_when_slots_full(hass, aioclient_mock, entry):
    info = {"user_info": {**USER_INFO["user_info"], "active_cons": "1", "max_connections": "1"}}
    _mock_server(aioclient_mock, user_info=info)
    assert await async_setup_component(hass, "http", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.provider_example_health").state == "ok"
    assert not any("/live/" in str(call[1]) for call in aioclient_mock.mock_calls)


# ── admin-only services ─────────────────────────────────────────────────────


@pytest.mark.parametrize(
    ("service", "data"),
    [
        ("get_credentials", {}),
        ("edit_account", {}),
        ("remove_account", {}),
        ("add_account", {CONF_PROVIDER: PROVIDER_XTREAM, CONF_URL: SERVER}),
    ],
)
async def test_services_refused_to_non_admin(hass, aioclient_mock, entry, hass_read_only_user, service, data):
    await _setup(hass, aioclient_mock, entry)
    if service != "add_account":
        data = {"device_id": _device_id(hass, entry)}
    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            DOMAIN,
            service,
            data,
            blocking=True,
            return_response=True,
            context=Context(user_id=hass_read_only_user.id),
        )
    assert entry.state is ConfigEntryState.LOADED


async def test_get_credentials_for_admin(hass, aioclient_mock, entry, hass_admin_user):
    await _setup(hass, aioclient_mock, entry)
    response = await hass.services.async_call(
        DOMAIN,
        "get_credentials",
        {"device_id": _device_id(hass, entry)},
        blocking=True,
        return_response=True,
        context=Context(user_id=hass_admin_user.id),
    )
    assert response["ok"] is True
    assert response[CONF_PASSWORD] == PASSWORD


async def test_edit_account_reloads_once(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    with patch.object(hass.config_entries, "async_reload", wraps=hass.config_entries.async_reload) as reload:
        response = await hass.services.async_call(
            DOMAIN,
            "edit_account",
            {"device_id": _device_id(hass, entry), CONF_PASSWORD: "new-password"},
            blocking=True,
            return_response=True,
        )
        await hass.async_block_till_done()
    assert response == {"ok": True}
    assert entry.data[CONF_PASSWORD] == "new-password"
    assert reload.call_count == 1
    assert entry.state is ConfigEntryState.LOADED


async def test_reconfigure_reloads_once(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    result = await entry.start_reconfigure_flow(hass)
    with patch.object(hass.config_entries, "async_reload", wraps=hass.config_entries.async_reload) as reload:
        await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: "new-password"}
        )
        await hass.async_block_till_done()
    assert reload.call_count == 1
    assert entry.state is ConfigEntryState.LOADED


async def test_options_change_reloads(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    with patch.object(hass.config_entries, "async_reload", wraps=hass.config_entries.async_reload) as reload:
        result = await hass.config_entries.options.async_configure(
            result["flow_id"],
            {"scan_interval": 30, "notify_days": 7, "health_interval": 5, "stream_check": False},
        )
        await hass.async_block_till_done()
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert reload.call_count == 1
    assert entry.runtime_data.update_interval.total_seconds() == 1800


# ── Stalker expiration ──────────────────────────────────────────────────────


def test_stalker_phone_number_is_not_an_expiry():
    assert stalker_expiry({"phone": "0612345678"}) is None
    assert stalker_expiry({"phone": "612345678"}) is None
    # Some panels write the expiration date in the phone field
    assert stalker_expiry({"phone": "2030-01-01"}) == 1893456000
    assert stalker_expiry({"end_date": "1893456000", "phone": "0612345678"}) == 1893456000


async def test_stalker_operations_do_not_overlap():
    """The coordinator and the health check share the client: a handshake must not run mid-refresh."""
    client = StalkerClient(Mock(), "http://portal.example", "00:1A:79:00:00:01")
    running = 0
    overlaps = 0

    async def call(portal, params, token=None):
        nonlocal running, overlaps
        running += 1
        overlaps += running > 1 and params.get("action") == "handshake"
        await asyncio.sleep(0)
        running -= 1
        if params.get("action") == "handshake":
            return {"token": "t"}
        if params.get("type") == "account_info":
            return {"phone": "0612345678"}
        return {"total_items": 3}

    with patch.object(client, "_call", side_effect=call):
        data, _ = await asyncio.gather(client.async_get_data(), client.async_get_user_info())
    assert overlaps == 0
    assert data["status"] == "active"
    assert data["exp_date"] is None
    assert data["channels"] == 3


# ── config flow ─────────────────────────────────────────────────────────────


async def _start_xtream(hass):
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.MENU
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"next_step_id": "xtream"})
    assert result["type"] is FlowResultType.FORM
    return result


async def test_config_flow(hass, aioclient_mock):
    _mock_server(aioclient_mock)
    result = await _start_xtream(hass)
    with patch("custom_components.iptv.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {CONF_URL: "provider.example:8080/", CONF_USERNAME: USERNAME, CONF_PASSWORD: PASSWORD}
        )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "provider.example"
    assert result["data"][CONF_URL] == SERVER
    assert result["data"][CONF_PASSWORD] == PASSWORD


async def test_config_flow_invalid_auth(hass, aioclient_mock):
    aioclient_mock.get(API, json={"user_info": {"auth": 0}})
    result = await _start_xtream(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: "bad"}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_auth"}


async def test_config_flow_cannot_connect(hass, aioclient_mock):
    aioclient_mock.get(API, exc=_secret_error(500))
    result = await _start_xtream(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: PASSWORD}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}


async def test_config_flow_duplicate(hass, aioclient_mock, entry):
    _mock_server(aioclient_mock)
    result = await _start_xtream(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: PASSWORD}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_reconfigure_updates_unique_id(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    result = await entry.start_reconfigure_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: "sam", CONF_PASSWORD: PASSWORD}
    )
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.unique_id == f"{SERVER}|sam".lower()
    assert entry.data[CONF_USERNAME] == "sam"


async def test_reconfigure_rejects_existing_account(hass, aioclient_mock, entry):
    other = MockConfigEntry(domain=DOMAIN, data={**DATA, CONF_USERNAME: "sam"}, unique_id=f"{SERVER}|sam".lower())
    other.add_to_hass(hass)
    await _setup(hass, aioclient_mock, entry)
    result = await entry.start_reconfigure_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: "sam", CONF_PASSWORD: PASSWORD}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"
    assert entry.data[CONF_USERNAME] == USERNAME


async def test_refused_credentials_start_reauth(hass, aioclient_mock, entry):
    aioclient_mock.get(API, json={"user_info": {"auth": 0}})
    assert await async_setup_component(hass, "http", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.provider_example_status").state == "invalid_auth"
    flows = [f for f in hass.config_entries.flow.async_progress() if f["context"]["source"] == "reauth"]
    assert len(flows) == 1

    aioclient_mock.clear_requests()
    _mock_server(aioclient_mock)
    result = await hass.config_entries.flow.async_configure(
        flows[0]["flow_id"], {CONF_URL: SERVER, CONF_USERNAME: USERNAME, CONF_PASSWORD: "renewed"}
    )
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"
    assert entry.data[CONF_PASSWORD] == "renewed"
