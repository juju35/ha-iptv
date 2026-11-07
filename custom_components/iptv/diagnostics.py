"""Diagnostics of one IPTV account, with the server, credentials and URLs redacted."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_PASSWORD, CONF_TOKEN, CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant

from .const import CONF_MAC, CONF_NOTIFY_SERVICE
from .coordinator import IptvConfigEntry

# The title and unique id are the server name / URL with the login: redacted as well.
TO_REDACT = {
    CONF_URL,
    CONF_USERNAME,
    CONF_PASSWORD,
    CONF_MAC,
    CONF_TOKEN,
    CONF_NOTIFY_SERVICE,
    "m3u_url",
    "xmltv_url",
    "title",
    "unique_id",
}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: IptvConfigEntry) -> dict[str, Any]:
    """Return the account's settings, last refresh and health check."""
    diagnostics: dict[str, Any] = {
        "entry": async_redact_data(
            {
                "title": entry.title,
                "unique_id": entry.unique_id,
                "version": entry.version,
                "data": dict(entry.data),
                "options": dict(entry.options),
            },
            TO_REDACT,
        ),
    }
    coordinator = getattr(entry, "runtime_data", None)
    if coordinator is None:  # account not loaded (setup failed)
        return diagnostics
    diagnostics["coordinator"] = {
        "last_update_success": coordinator.last_update_success,
        "update_interval": str(coordinator.update_interval),
        "data": async_redact_data(coordinator.data or {}, TO_REDACT),
    }
    if (health := getattr(coordinator, "health", None)) is not None:
        diagnostics["health"] = {
            "status": health.status,
            "latency_ms": health.latency_ms,
            "checked_at": health.checked_at.isoformat() if health.checked_at else None,
            "error": health.error,
            "stream_ok": health.stream_ok,
            "stream_channel": health.stream_channel,
        }
    return diagnostics
