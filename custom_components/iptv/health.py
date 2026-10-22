"""Lightweight health check of one IPTV account.

Between the full refreshes (which download the catalogue lists), only the
account info is requested (``user_info`` for Xtream, the handshake and
``account_info`` for Stalker) and its response time is measured.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
import time
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .api import IptvAuthError, IptvError
from .const import (
    CONF_HEALTH_INTERVAL,
    DEFAULT_HEALTH_INTERVAL,
    DOMAIN,
    HEALTH_AUTH_FAILED,
    HEALTH_DEGRADED,
    HEALTH_OK,
    HEALTH_SLOW_MS,
    HEALTH_UNREACHABLE,
)

_LOGGER = logging.getLogger(__name__)


def health_signal(entry_id: str) -> str:
    """Dispatcher signal sent after each check of one account."""
    return f"{DOMAIN}_health_{entry_id}"


class HealthMonitor:
    """Check one account every few minutes and keep the last result."""

    def __init__(self, hass: HomeAssistant, coordinator: Any) -> None:
        self._hass = hass
        self._coordinator = coordinator
        entry = coordinator.config_entry
        self._entry_id = entry.entry_id
        self._interval = timedelta(
            minutes=max(1, int(entry.options.get(CONF_HEALTH_INTERVAL, DEFAULT_HEALTH_INTERVAL)))
        )
        self.status: str | None = None
        self.latency_ms: int | None = None
        self.checked_at: datetime | None = None
        self.error: str | None = None
        self._unsubs: list[CALLBACK_TYPE] = []

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        """Schedule the checks; return the function that stops them."""
        self._unsubs = [
            async_track_time_interval(
                self._hass, self._async_check, self._interval, name=f"{DOMAIN} health check"
            ),
            self._coordinator.async_add_listener(self._async_from_refresh),
        ]
        return self.async_stop

    @callback
    def async_stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    @callback
    def _async_from_refresh(self) -> None:
        """A failed full refresh also means the server is unreachable."""
        if not self._coordinator.last_update_success and self.status != HEALTH_UNREACHABLE:
            err = self._coordinator.last_exception
            self._set(HEALTH_UNREACHABLE, None, str(err) if err else None)

    async def _async_check(self, _now: datetime | None = None) -> None:
        start = time.monotonic()
        try:
            await self._coordinator.client.async_get_user_info()
        except IptvAuthError:
            self._set(HEALTH_AUTH_FAILED, self._elapsed(start), "credentials refused")
        except IptvError as err:
            self._set(HEALTH_UNREACHABLE, None, str(err) or type(err).__name__)
        else:
            latency = self._elapsed(start)
            self._set(HEALTH_DEGRADED if latency > HEALTH_SLOW_MS else HEALTH_OK, latency, None)
            if not self._coordinator.last_update_success:
                # Back online: refresh the account data right away
                await self._coordinator.async_request_refresh()

    async def async_check_now(self) -> None:
        await self._async_check()

    @staticmethod
    def _elapsed(start: float) -> int:
        return round((time.monotonic() - start) * 1000)

    @callback
    def _set(self, status: str, latency: int | None, error: str | None) -> None:
        if status != self.status:
            _LOGGER.debug("IPTV account %s health: %s (%s)", self._entry_id, status, error)
        self.status, self.latency_ms, self.error = status, latency, error
        self.checked_at = dt_util.utcnow()
        async_dispatcher_send(self._hass, health_signal(self._entry_id))
