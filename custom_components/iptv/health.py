"""Lightweight health check of one IPTV account.

Between the full refreshes (which download the catalogue lists), only the
account info is requested (``user_info`` for Xtream, the handshake and
``account_info`` for Stalker) and its response time is measured.

A Stalker client runs one operation at a time (the coordinator and the health
check share its session token). The response time is the one measured by the
client once it holds the client, so waiting for a refresh does not count; a
tick that comes while the previous check still runs is skipped. The stream
probe takes a connection slot: it is skipped when every slot is in use, and,
when the occupancy is unknown (Stalker portals do not report it), while a
refresh holds or waits for the client.
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .api import IptvAuthError, IptvError, _safe_err
from .const import (
    CONF_HEALTH_INTERVAL,
    CONF_STREAM_CHECK,
    DEFAULT_HEALTH_INTERVAL,
    DEFAULT_STREAM_CHECK,
    DOMAIN,
    HEALTH_AUTH_FAILED,
    HEALTH_DEGRADED,
    HEALTH_OK,
    HEALTH_SLOW_MS,
    HEALTH_STREAM_KO,
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
        self._stream_check = bool(entry.options.get(CONF_STREAM_CHECK, DEFAULT_STREAM_CHECK))
        self.status: str | None = None
        self.latency_ms: int | None = None
        self.checked_at: datetime | None = None
        self.error: str | None = None
        self.stream_ok: bool | None = None
        self.stream_channel: str | None = None
        self._unsubs: list[CALLBACK_TYPE] = []
        self._running = False

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        """Schedule the checks; return the function that stops them."""
        self._unsubs = [
            async_track_time_interval(self._hass, self._async_check, self._interval, name=f"{DOMAIN} health check"),
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
            # UpdateFailed wraps an IptvError: describe that one, never the raw text
            self._set(HEALTH_UNREACHABLE, None, _safe_err(err.__cause__ or err) if err else None)

    async def _async_check(self, _now: datetime | None = None) -> None:
        # A check can outlast the interval (unreachable portal): skip the tick
        # rather than queue checks behind the Stalker lock
        if self._running:
            return
        self._running = True
        try:
            await self._async_run_check()
        finally:
            self._running = False

    async def _async_run_check(self) -> None:
        client = self._coordinator.client
        start = time.monotonic()
        try:
            info = await client.async_get_user_info()
        except IptvAuthError:
            self._set(HEALTH_AUTH_FAILED, self._latency(client, start), "credentials refused")
        except IptvError as err:
            self._set(HEALTH_UNREACHABLE, None, _safe_err(err))
        else:
            latency = self._latency(client, start)
            status = HEALTH_DEGRADED if latency > HEALTH_SLOW_MS else HEALTH_OK
            error = None
            if self._stream_check and not self._slots_full(info) and not self._client_busy(info):
                stream = await self._coordinator.client.async_test_stream()
                self.stream_ok = stream.get("ok")
                self.stream_channel = stream.get("channel")
                if self.stream_ok is False:
                    status = HEALTH_STREAM_KO
                    error = "stream: " + (stream.get("error") or "unavailable")
            else:
                self.stream_ok = None
                self.stream_channel = None
            self._set(status, latency, error)
            if status != HEALTH_STREAM_KO and not self._coordinator.last_update_success:
                # Back online: refresh the account data right away
                await self._coordinator.async_request_refresh()

    def _slots_full(self, info: dict[str, Any]) -> bool:
        """True when every connection slot is in use: the stream probe would take one.

        Xtream returns the connections with the account info; otherwise the last
        refresh is used.
        """
        data = info if "max_connections" in info else (self._coordinator.data or {})
        try:
            return int(data["active_cons"]) >= int(data["max_connections"]) > 0
        except (KeyError, TypeError, ValueError):
            return False

    def _client_busy(self, info: dict[str, Any]) -> bool:
        """Unknown occupancy and a refresh using the client: do not take a slot too."""
        data = info if "max_connections" in info else (self._coordinator.data or {})
        known = data.get("max_connections") not in (None, "") and data.get("active_cons") not in (None, "")
        return not known and bool(getattr(self._coordinator.client, "busy", False))

    async def async_check_now(self) -> None:
        await self._async_check()

    @staticmethod
    def _latency(client: Any, start: float) -> int:
        """Response time measured by the client, or the time since `start`."""
        measured = getattr(client, "user_info_ms", None)
        return measured if isinstance(measured, int) else round((time.monotonic() - start) * 1000)

    @callback
    def _set(self, status: str, latency: int | None, error: str | None) -> None:
        if status != self.status:
            _LOGGER.debug("IPTV account %s health: %s (%s)", self._entry_id, status, error)
        self.status, self.latency_ms, self.error = status, latency, error
        self.checked_at = dt_util.utcnow()
        async_dispatcher_send(self._hass, health_signal(self._entry_id))
