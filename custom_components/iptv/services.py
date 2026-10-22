"""The ``iptv.edit_account`` service: edit an account's credentials / MAC.

Used by the card's edit popup. Called with only a device it returns the
account's current URL and username / MAC (never the password) to pre-fill the
form. Called with new values it runs the same checks as adding an account
(credentials, French lists, video stream) and, on success, updates the entry.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_PASSWORD, CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .api import (
    IptvAuthError,
    IptvError,
    StalkerClient,
    XtreamClient,
    normalize_mac,
    normalize_url,
    valid_mac,
)
from .const import (
    CONF_ADDED_AT,
    CONF_MAC,
    CONF_PROVIDER,
    CONF_UPDATED_AT,
    DOMAIN,
    PROVIDER_STALKER,
)

SERVICE_EDIT_ACCOUNT = "edit_account"

EDIT_SCHEMA = vol.Schema(
    {
        vol.Required("device_id"): cv.string,
        vol.Optional(CONF_URL): cv.string,
        vol.Optional(CONF_USERNAME): cv.string,
        vol.Optional(CONF_PASSWORD): cv.string,
        vol.Optional(CONF_MAC): cv.string,
    }
)


def _entry_for_device(hass: HomeAssistant, device_id: str) -> ConfigEntry | None:
    device = dr.async_get(hass).async_get(device_id)
    if not device:
        return None
    for entry_id in device.config_entries:
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry and entry.domain == DOMAIN:
            return entry
    return None


async def _validate(hass: HomeAssistant, provider: str, data: dict[str, Any]) -> str | None:
    """Same checks as adding an account; return an error key or None."""
    session = async_get_clientsession(hass)
    url = normalize_url(data[CONF_URL])
    if provider == PROVIDER_STALKER:
        if not valid_mac(data.get(CONF_MAC, "")):
            return "invalid_mac"
        client: XtreamClient | StalkerClient = StalkerClient(session, url, normalize_mac(data[CONF_MAC]))
    else:
        client = XtreamClient(session, url, data[CONF_USERNAME], data[CONF_PASSWORD])
    try:
        await client.async_get_user_info()
    except IptvAuthError:
        return "invalid_auth"
    except IptvError:
        return "cannot_connect"
    french = await client.async_get_french()
    if french is None:
        return "french_unknown"
    if not french["total"]:
        return "no_french_lists"
    stream = await client.async_test_stream()
    if stream.get("ok") is False:
        return "stream_ko"
    return None


async def _async_edit_account(call: ServiceCall) -> ServiceResponse:
    hass = call.hass
    entry = _entry_for_device(hass, call.data["device_id"])
    if entry is None:
        return {"ok": False, "error": "not_found"}
    provider = entry.data.get(CONF_PROVIDER, "xtream")
    fields = (CONF_URL, CONF_USERNAME, CONF_PASSWORD, CONF_MAC)
    given = {k: call.data[k] for k in fields if k in call.data}

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


def async_register_services(hass: HomeAssistant) -> None:
    """Register the integration services (once)."""
    if hass.services.has_service(DOMAIN, SERVICE_EDIT_ACCOUNT):
        return
    hass.services.async_register(
        DOMAIN,
        SERVICE_EDIT_ACCOUNT,
        _async_edit_account,
        schema=EDIT_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
