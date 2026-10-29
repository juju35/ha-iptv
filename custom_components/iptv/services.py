"""Account services and the card's admin WebSocket commands.

``edit_account`` called with only a device returns the account's current URL
and username / MAC (never the password) to pre-fill a form. Called with new
values it runs the same checks as adding an account (credentials, French
lists, video stream) and, on success, updates the entry.

The services (``iptv.add_account`` / ``edit_account`` / ``remove_account`` /
``get_credentials``) are kept for automations and scripts. Home Assistant
fires a ``call_service`` event with the raw service data before running a
service, and the recorder stores it: a password given to ``add_account`` or
``edit_account`` ends up in the database. The card therefore uses the
``iptv/add_account``, ``iptv/edit_account`` and ``iptv/get_credentials``
WebSocket commands, which run the same code without that event.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_PASSWORD, CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.util import dt as dt_util

from .api import (
    IptvAuthError,
    IptvError,
    StalkerClient,
    XtreamClient,
    normalize_mac,
    normalize_url,
    valid_mac,
    validate_catalogue,
)
from .const import (
    CONF_ADDED_AT,
    CONF_MAC,
    CONF_PROVIDER,
    CONF_UPDATED_AT,
    DOMAIN,
    PROVIDER_STALKER,
    PROVIDER_XTREAM,
)
from .registry_compat import entry_for_device

SERVICE_EDIT_ACCOUNT = "edit_account"
SERVICE_REMOVE_ACCOUNT = "remove_account"
SERVICE_ADD_ACCOUNT = "add_account"
SERVICE_GET_CREDENTIALS = "get_credentials"

EDIT_SCHEMA = vol.Schema(
    {
        vol.Required("device_id"): cv.string,
        vol.Optional(CONF_URL): cv.string,
        vol.Optional(CONF_USERNAME): cv.string,
        vol.Optional(CONF_PASSWORD): cv.string,
        vol.Optional(CONF_MAC): cv.string,
    }
)

REMOVE_SCHEMA = vol.Schema({vol.Required("device_id"): cv.string})
CREDENTIALS_SCHEMA = vol.Schema({vol.Required("device_id"): cv.string})

ADD_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_PROVIDER): vol.In([PROVIDER_XTREAM, PROVIDER_STALKER]),
        vol.Required(CONF_URL): cv.string,
        vol.Optional(CONF_USERNAME): cv.string,
        vol.Optional(CONF_PASSWORD): cv.string,
        vol.Optional(CONF_MAC): cv.string,
    }
)


def _entry_for_device(hass: HomeAssistant, device_id: str) -> ConfigEntry | None:
    return entry_for_device(hass, device_id, DOMAIN)


async def _validate(hass: HomeAssistant, provider: str, data: dict[str, Any]) -> str | None:
    """Same checks as adding an account; return an error key or None."""
    session = async_get_clientsession(hass)
    url = normalize_url(data[CONF_URL])
    if provider == PROVIDER_STALKER:
        if not valid_mac(data.get(CONF_MAC, "")):
            return "invalid_mac"
        client: XtreamClient | StalkerClient = StalkerClient(
            session, url, normalize_mac(data[CONF_MAC]), tz=hass.config.time_zone
        )
    else:
        client = XtreamClient(session, url, data[CONF_USERNAME], data[CONF_PASSWORD])
    try:
        await client.async_get_user_info()
    except IptvAuthError:
        return "invalid_auth"
    except IptvError:
        return "cannot_connect"
    error, _ = await validate_catalogue(client)
    return error


async def _edit_account(hass: HomeAssistant, params: dict[str, Any]) -> dict[str, Any]:
    entry = _entry_for_device(hass, params["device_id"])
    if entry is None:
        return {"ok": False, "error": "not_found"}
    provider = entry.data.get(CONF_PROVIDER, "xtream")
    fields = (CONF_URL, CONF_USERNAME, CONF_PASSWORD, CONF_MAC)
    given = {k: params[k] for k in fields if k in params}

    # No new value: return the current account for the form to pre-fill
    if not given:
        return {
            "ok": True,
            "provider": provider,
            CONF_URL: entry.data.get(CONF_URL, ""),
            CONF_USERNAME: entry.data.get(CONF_USERNAME, ""),
            CONF_MAC: entry.data.get(CONF_MAC, ""),
        }

    data = dict(entry.data)
    data[CONF_URL] = normalize_url(given.get(CONF_URL, entry.data.get(CONF_URL, "")))
    if provider == PROVIDER_STALKER:
        data[CONF_MAC] = normalize_mac(given.get(CONF_MAC, entry.data.get(CONF_MAC, "")))
        login = data[CONF_MAC]
    else:
        if CONF_USERNAME in given:
            data[CONF_USERNAME] = given[CONF_USERNAME]
        if CONF_PASSWORD in given:
            data[CONF_PASSWORD] = given[CONF_PASSWORD]
        login = data.get(CONF_USERNAME, "")

    if (error := await _validate(hass, provider, data)) is not None:
        return {"ok": False, "error": error}

    unique_id = f"{data[CONF_URL]}|{login}".lower()
    for other in hass.config_entries.async_entries(DOMAIN):
        if other.entry_id != entry.entry_id and other.unique_id == unique_id:
            return {"ok": False, "error": "already_configured"}

    data[CONF_ADDED_AT] = entry.data.get(CONF_ADDED_AT)
    data[CONF_UPDATED_AT] = dt_util.utcnow().replace(microsecond=0).isoformat()
    hass.config_entries.async_update_entry(entry, data=data, unique_id=unique_id)
    await hass.config_entries.async_reload(entry.entry_id)
    return {"ok": True}


async def _async_remove_account(call: ServiceCall) -> ServiceResponse:
    hass = call.hass
    entry = _entry_for_device(hass, call.data["device_id"])
    if entry is None:
        return {"ok": False, "error": "not_found"}
    await hass.config_entries.async_remove(entry.entry_id)
    return {"ok": True}


def _get_credentials(hass: HomeAssistant, params: dict[str, Any]) -> dict[str, Any]:
    """Return the full credentials of an account (password included) for viewing."""
    entry = _entry_for_device(hass, params["device_id"])
    if entry is None:
        return {"ok": False, "error": "not_found"}
    return {
        "ok": True,
        "provider": entry.data.get(CONF_PROVIDER, "xtream"),
        CONF_URL: entry.data.get(CONF_URL, ""),
        CONF_USERNAME: entry.data.get(CONF_USERNAME, ""),
        CONF_PASSWORD: entry.data.get(CONF_PASSWORD, ""),
        CONF_MAC: entry.data.get(CONF_MAC, ""),
    }


async def _add_account(hass: HomeAssistant, params: dict[str, Any]) -> dict[str, Any]:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "card_add"}, data=params)
    if result["type"] == FlowResultType.CREATE_ENTRY:
        return {"ok": True}
    if result["type"] == FlowResultType.ABORT:
        reason = result.get("reason") or "generic"
        return {"ok": True} if reason == "account_updated" else {"ok": False, "error": reason}
    return {"ok": False, "error": "generic"}


async def _async_edit_account(call: ServiceCall) -> ServiceResponse:
    return await _edit_account(call.hass, dict(call.data))


async def _async_get_credentials(call: ServiceCall) -> ServiceResponse:
    return _get_credentials(call.hass, dict(call.data))


async def _async_add_account(call: ServiceCall) -> ServiceResponse:
    return await _add_account(call.hass, dict(call.data))


# ── WebSocket commands used by the card (no call_service event) ─────────────


def _ws_params(msg: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in msg.items() if k not in ("id", "type")}


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/edit_account", **EDIT_SCHEMA.schema})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_edit_account(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    connection.send_result(msg["id"], await _edit_account(hass, _ws_params(msg)))


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/add_account", **ADD_SCHEMA.schema})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_add_account(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], await _add_account(hass, _ws_params(msg)))


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get_credentials", **CREDENTIALS_SCHEMA.schema})
@websocket_api.require_admin
@callback
def _ws_get_credentials(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], _get_credentials(hass, _ws_params(msg)))


def async_register_services(hass: HomeAssistant) -> None:
    """Register the integration services (once).

    They read the password or change config entries: administrators only.
    """
    if hass.services.has_service(DOMAIN, SERVICE_ADD_ACCOUNT):
        return
    for service, func, schema, response in (
        (SERVICE_EDIT_ACCOUNT, _async_edit_account, EDIT_SCHEMA, SupportsResponse.OPTIONAL),
        (SERVICE_REMOVE_ACCOUNT, _async_remove_account, REMOVE_SCHEMA, SupportsResponse.OPTIONAL),
        (SERVICE_ADD_ACCOUNT, _async_add_account, ADD_SCHEMA, SupportsResponse.OPTIONAL),
        (SERVICE_GET_CREDENTIALS, _async_get_credentials, CREDENTIALS_SCHEMA, SupportsResponse.ONLY),
    ):
        async_register_admin_service(hass, DOMAIN, service, func, schema=schema, supports_response=response)
    for command in (_ws_edit_account, _ws_add_account, _ws_get_credentials):
        websocket_api.async_register_command(hass, command)
