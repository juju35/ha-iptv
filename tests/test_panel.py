"""Tests for the sidebar panel and its WebSocket commands."""

from unittest.mock import patch

import pytest
from homeassistant.components.frontend import DATA_PANELS
from homeassistant.const import CONF_PASSWORD
from homeassistant.helpers import device_registry as dr

from custom_components.iptv.const import DOMAIN, PANEL_PATH, VERSION
from custom_components.iptv.registry_compat import get_device

from . import test_init
from .test_init import PASSWORD, SERVER, USERNAME, _setup

entry = test_init.entry  # the account fixture of test_init


async def _ws(hass, hass_ws_client, payload, token=None):
    client = await hass_ws_client(hass, token) if token else await hass_ws_client(hass)
    await client.send_json_auto_id(payload)
    return await client.receive_json()


async def test_panel_registered_for_admins(hass, aioclient_mock, entry):
    await _setup(hass, aioclient_mock, entry)
    panel = hass.data[DATA_PANELS][PANEL_PATH]
    assert panel.require_admin
    assert panel.sidebar_title == "IPTV"
    assert panel.config["_panel_custom"]["module_url"] == f"/iptv/iptv-panel.js?v={VERSION}"


async def test_panel_served(hass, aioclient_mock, entry, hass_client):
    await _setup(hass, aioclient_mock, entry)
    resp = await (await hass_client()).get("/iptv/iptv-panel.js")
    assert resp.status == 200
    text = await resp.text()
    assert f"IPTV_PANEL_VERSION = '{VERSION}'" in text
    assert "customElements.define('iptv-panel'" in text


async def test_accounts_lists_without_password(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    msg = await _ws(hass, hass_ws_client, {"type": "iptv/accounts"})
    assert msg["success"]
    [account] = msg["result"]["accounts"]
    device = get_device(dr.async_get(hass), (DOMAIN, entry.entry_id), entry.entry_id)
    assert account["entry_id"] == entry.entry_id
    assert account["device_id"] == device.id
    assert account["login"] == USERNAME
    assert account["url"] == SERVER
    assert account["state"] == "loaded"
    assert account["options"] == {"scan_interval": 60, "notify_days": 7, "health_interval": 5, "stream_check": True}
    assert PASSWORD not in str(msg)
    assert CONF_PASSWORD not in account


async def test_update_account_renames_without_reload(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    with patch.object(hass.config_entries, "async_reload", wraps=hass.config_entries.async_reload) as reload:
        msg = await _ws(
            hass, hass_ws_client, {"type": "iptv/update_account", "entry_id": entry.entry_id, "title": "Salon"}
        )
        await hass.async_block_till_done()
    assert msg["result"]["ok"]
    assert entry.title == "Salon"
    assert reload.call_count == 0
    device = get_device(dr.async_get(hass), (DOMAIN, entry.entry_id), entry.entry_id)
    assert device.name == "Salon"

    # Blank: back to the server name
    msg = await _ws(hass, hass_ws_client, {"type": "iptv/update_account", "entry_id": entry.entry_id, "title": " "})
    await hass.async_block_till_done()
    assert entry.title == "provider.example"


async def test_update_account_options_reload_once(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    with patch.object(hass.config_entries, "async_reload", wraps=hass.config_entries.async_reload) as reload:
        msg = await _ws(
            hass,
            hass_ws_client,
            {"type": "iptv/update_account", "entry_id": entry.entry_id, "scan_interval": 30, "stream_check": False},
        )
        await hass.async_block_till_done()
    assert msg["result"]["ok"]
    assert reload.call_count == 1
    assert entry.options == {"scan_interval": 30, "notify_days": 7, "health_interval": 5, "stream_check": False}
    assert entry.runtime_data.update_interval.total_seconds() == 1800


async def test_update_account_unchanged_does_not_reload(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    with patch.object(hass.config_entries, "async_reload") as reload:
        msg = await _ws(
            hass,
            hass_ws_client,
            {"type": "iptv/update_account", "entry_id": entry.entry_id, "title": "", "scan_interval": 60},
        )
        await hass.async_block_till_done()
    assert msg["result"]["ok"]
    reload.assert_not_called()
    assert entry.options == {}


@pytest.mark.parametrize(
    "option", [{"scan_interval": 4}, {"scan_interval": 1441}, {"notify_days": 61}, {"health_interval": 0}]
)
async def test_update_account_rejects_out_of_range(hass, aioclient_mock, entry, hass_ws_client, option):
    await _setup(hass, aioclient_mock, entry)
    msg = await _ws(hass, hass_ws_client, {"type": "iptv/update_account", "entry_id": entry.entry_id, **option})
    assert not msg["success"]
    assert msg["error"]["code"] == "invalid_format"
    assert entry.options == {}


async def test_unknown_account(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    for command in ("iptv/update_account", "iptv/check_account"):
        msg = await _ws(hass, hass_ws_client, {"type": command, "entry_id": "nope"})
        assert msg["result"] == {"ok": False, "error": "not_found"}


async def test_check_account_refreshes_and_checks_health(hass, aioclient_mock, entry, hass_ws_client):
    await _setup(hass, aioclient_mock, entry)
    coordinator = entry.runtime_data
    with (
        patch.object(coordinator, "async_refresh", wraps=coordinator.async_refresh) as refresh,
        patch.object(coordinator.health, "async_check_now", wraps=coordinator.health.async_check_now) as check,
    ):
        msg = await _ws(hass, hass_ws_client, {"type": "iptv/check_account", "entry_id": entry.entry_id})
    assert msg["result"] == {"ok": True}
    refresh.assert_awaited_once()
    check.assert_awaited_once()


@pytest.mark.parametrize("command", ["iptv/accounts", "iptv/update_account", "iptv/check_account"])
async def test_panel_commands_refused_to_non_admin(
    hass, aioclient_mock, entry, hass_ws_client, hass_read_only_access_token, command
):
    await _setup(hass, aioclient_mock, entry)
    payload = {"type": command} if command == "iptv/accounts" else {"type": command, "entry_id": entry.entry_id}
    msg = await _ws(hass, hass_ws_client, payload, hass_read_only_access_token)
    assert not msg["success"]
    assert msg["error"]["code"] == "unauthorized"
