"""Sidebar panel: every account, its settings and a check-now action (administrators only).

The panel (``frontend/iptv-panel.js``) shows the accounts with the bundled card,
which already adds, views, edits and removes them, and a settings form per
account backed by the WebSocket commands below:

- ``iptv/accounts``: the accounts with their provider, server, login (never the
  password), state and options (defaults filled in);
- ``iptv/update_account``: renames an account (blank = back to the server name)
  and changes its options, with the same limits as the options flow;
- ``iptv/check_account``: refreshes the subscription and runs a health check now.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .const import (
    CONF_ADDED_AT,
    CONF_HEALTH_INTERVAL,
    CONF_MAC,
    CONF_NOTIFY_DAYS,
    CONF_PROVIDER,
    CONF_SCAN_INTERVAL,
    CONF_STREAM_CHECK,
    CONF_UPDATED_AT,
    DEFAULT_HEALTH_INTERVAL,
    DEFAULT_NOTIFY_DAYS,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_STREAM_CHECK,
    DOMAIN,
    MAX_HEALTH_INTERVAL,
    MAX_NOTIFY_DAYS,
    MAX_SCAN_INTERVAL,
    MIN_HEALTH_INTERVAL,
    MIN_SCAN_INTERVAL,
    PANEL_PATH,
    PANEL_URL,
    PROVIDER_STALKER,
    PROVIDER_XTREAM,
    VERSION,
)
from .naming import auto_title
from .registry_compat import get_device

OPTION_DEFAULTS = {
    CONF_SCAN_INTERVAL: DEFAULT_SCAN_INTERVAL,
    CONF_NOTIFY_DAYS: DEFAULT_NOTIFY_DAYS,
    CONF_HEALTH_INTERVAL: DEFAULT_HEALTH_INTERVAL,
    CONF_STREAM_CHECK: DEFAULT_STREAM_CHECK,
}

OPTIONS_SCHEMA = {
    vol.Optional(CONF_SCAN_INTERVAL): vol.All(vol.Coerce(int), vol.Range(MIN_SCAN_INTERVAL, MAX_SCAN_INTERVAL)),
    vol.Optional(CONF_NOTIFY_DAYS): vol.All(vol.Coerce(int), vol.Range(0, MAX_NOTIFY_DAYS)),
    vol.Optional(CONF_HEALTH_INTERVAL): vol.All(vol.Coerce(int), vol.Range(MIN_HEALTH_INTERVAL, MAX_HEALTH_INTERVAL)),
    vol.Optional(CONF_STREAM_CHECK): bool,
}


async def async_register_panel(hass: HomeAssistant) -> None:
    """Add the IPTV entry to the sidebar (administrators only) and its commands."""
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="iptv-panel",
        sidebar_title="IPTV",
        sidebar_icon="mdi:television-play",
        module_url=f"{PANEL_URL}?v={VERSION}",
        require_admin=True,
        config={"version": VERSION},
    )
    for command in (_ws_accounts, _ws_update_account, _ws_check_account):
        websocket_api.async_register_command(hass, command)


def _account(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """What the panel shows of one account: no password."""
    data = entry.data
    provider = data.get(CONF_PROVIDER, PROVIDER_XTREAM)
    device = get_device(dr.async_get(hass), (DOMAIN, entry.entry_id), entry.entry_id)
    return {
        "entry_id": entry.entry_id,
        "device_id": device.id if device else None,
        "title": entry.title,
        "auto_title": auto_title(dict(data)) if data.get(CONF_URL) else entry.title,
        "provider": provider,
        "url": data.get(CONF_URL, ""),
        "login": data.get(CONF_MAC if provider == PROVIDER_STALKER else CONF_USERNAME, ""),
        "state": entry.state.value,
        "added_at": data.get(CONF_ADDED_AT),
        "updated_at": data.get(CONF_UPDATED_AT),
        "options": {key: entry.options.get(key, default) for key, default in OPTION_DEFAULTS.items()},
    }


def _entry(hass: HomeAssistant, entry_id: str) -> ConfigEntry | None:
    entry = hass.config_entries.async_get_entry(entry_id)
    return entry if entry and entry.domain == DOMAIN else None


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/accounts"})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_accounts(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    entries = sorted(hass.config_entries.async_entries(DOMAIN), key=lambda e: e.title.casefold())
    connection.send_result(msg["id"], {"accounts": [_account(hass, e) for e in entries]})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/update_account",
        vol.Required("entry_id"): str,
        vol.Optional("title"): str,
        **OPTIONS_SCHEMA,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_update_account(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (entry := _entry(hass, msg["entry_id"])) is None:
        connection.send_result(msg["id"], {"ok": False, "error": "not_found"})
        return
    # The title first: the update listener renames the device and the
    # notification in place; an options change then reloads the account once
    if "title" in msg:
        title = msg["title"].strip() or auto_title(dict(entry.data))
        if title != entry.title:
            hass.config_entries.async_update_entry(entry, title=title)
    current = {**OPTION_DEFAULTS, **entry.options}
    options = {**current, **{key: msg[key] for key in OPTION_DEFAULTS if key in msg}}
    if options != current:
        hass.config_entries.async_update_entry(entry, options=options)
    connection.send_result(msg["id"], {"ok": True, "account": _account(hass, entry)})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/check_account", vol.Required("entry_id"): str})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_check_account(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_result(msg["id"], {"ok": False, "error": "not_found"})
        return
    if entry.state is not ConfigEntryState.LOADED:
        # Setup failed or retrying: try again now
        await hass.config_entries.async_reload(entry.entry_id)
        connection.send_result(msg["id"], {"ok": entry.state is ConfigEntryState.LOADED})
        return
    coordinator = entry.runtime_data
    await coordinator.async_refresh()
    await coordinator.health.async_check_now()
    connection.send_result(msg["id"], {"ok": coordinator.last_update_success})
