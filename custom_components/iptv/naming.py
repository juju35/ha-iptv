"""Automatic account title: the server name."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from homeassistant.const import CONF_URL, CONF_USERNAME

from .const import CONF_MAC, CONF_PROVIDER, PROVIDER_STALKER


def server_name(url: str) -> str:
    """Host of a server URL, e.g. ``myprovider.com``."""
    return urlparse(url).hostname or url


def auto_title(data: dict[str, Any]) -> str:
    """Title given to an account: the server name."""
    return server_name(data[CONF_URL])


def _legacy_title(data: dict[str, Any]) -> str:
    """Title format used before 3.5 (``<username or mac> @ <host>``)."""
    login = (
        data.get(CONF_MAC)
        if data.get(CONF_PROVIDER) == PROVIDER_STALKER
        else data.get(CONF_USERNAME)
    )
    return f"{login} @ {server_name(data[CONF_URL])}"


def is_auto_generated(title: str, data: dict[str, Any]) -> bool:
    """True when the title was set by the integration, not renamed by the user."""
    return title in (auto_title(data), _legacy_title(data))
