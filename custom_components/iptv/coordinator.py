"""Data update coordinator for IPTV."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_PASSWORD, CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import StalkerClient, XtreamClient, IptvError
from .const import (
    CONF_MAC,
    CONF_PROVIDER,
    CONF_SCAN_INTERVAL,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MIN_SCAN_INTERVAL,
    PROVIDER_STALKER,
)

_LOGGER = logging.getLogger(__name__)

type IptvConfigEntry = ConfigEntry[IptvCoordinator]


class IptvCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Poll the IPTV server for one account."""

    config_entry: IptvConfigEntry
    health: Any  # HealthMonitor, set in async_setup_entry

    def __init__(self, hass: HomeAssistant, entry: IptvConfigEntry) -> None:
        minutes = max(
            MIN_SCAN_INTERVAL,
            int(entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)),
        )
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(minutes=minutes),
        )
        session = async_get_clientsession(hass)
        if entry.data.get(CONF_PROVIDER) == PROVIDER_STALKER:
            self.client = StalkerClient(session, entry.data[CONF_URL], entry.data[CONF_MAC])
        else:
            self.client = XtreamClient(
                session,
                entry.data[CONF_URL],
                entry.data[CONF_USERNAME],
                entry.data[CONF_PASSWORD],
            )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self.client.async_get_data()
        except IptvError as err:
            raise UpdateFailed(f"IPTV server unreachable: {err}") from err
