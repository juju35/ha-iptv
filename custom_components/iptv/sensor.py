"""Sensors for an IPTV subscription."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
import math
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import HEALTH_STATES, STATUSES
from .coordinator import IptvConfigEntry
from .entity import IptvEntity
from .health import health_signal


def _int(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _timestamp(value: Any) -> datetime | None:
    seconds = _int(value)
    if not seconds:
        return None
    return datetime.fromtimestamp(seconds, tz=timezone.utc)


def _status(data: dict[str, Any]) -> str | None:
    if not data.get("auth"):
        return "invalid_auth"
    status = str(data.get("status") or "").lower()
    return status if status in STATUSES else None


def _days_left(data: dict[str, Any]) -> int | None:
    expiration = _timestamp(data.get("exp_date"))
    if expiration is None:
        return None
    return math.ceil((expiration - dt_util.utcnow()).total_seconds() / 86400)


@dataclass(frozen=True, kw_only=True)
class IptvSensorDescription(SensorEntityDescription):
    """Sensor reading one value of the coordinator data."""

    value_fn: Callable[[dict[str, Any]], Any]


SENSORS: tuple[IptvSensorDescription, ...] = (
    IptvSensorDescription(
        key="status",
        device_class=SensorDeviceClass.ENUM,
        options=STATUSES,
        value_fn=_status,
    ),
    IptvSensorDescription(
        key="expiration",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _timestamp(d.get("exp_date")),
    ),
    IptvSensorDescription(
        key="days_left",
        native_unit_of_measurement=UnitOfTime.DAYS,
        value_fn=_days_left,
    ),
    IptvSensorDescription(
        key="created",
        device_class=SensorDeviceClass.TIMESTAMP,
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: _timestamp(d.get("created_at")),
    ),
    IptvSensorDescription(
        key="active_connections",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: _int(d.get("active_cons")) if d.get("auth") else None,
    ),
    IptvSensorDescription(
        key="max_connections",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda d: _int(d.get("max_connections")),
    ),
    IptvSensorDescription(
        key="channels",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.get("channels"),
    ),
    IptvSensorDescription(
        key="movies",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.get("movies"),
    ),
    IptvSensorDescription(
        key="series",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d.get("series"),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: IptvConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the sensors of one account."""
    coordinator = entry.runtime_data
    async_add_entities(
        [IptvSensor(coordinator, desc) for desc in SENSORS]
        + [IptvHealthSensor(coordinator), IptvResponseTimeSensor(coordinator)]
    )


class IptvSensor(IptvEntity, SensorEntity):
    """IPTV subscription sensor."""

    entity_description: IptvSensorDescription

    def __init__(self, coordinator, description: IptvSensorDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)


class _IptvHealthEntity(IptvEntity, SensorEntity):
    """Reads the health monitor; stays available when the server is down."""

    def __init__(self, coordinator, key: str) -> None:
        super().__init__(coordinator, key)
        self._health = coordinator.health

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, health_signal(self.coordinator.config_entry.entry_id), self._on_health
            )
        )

    @callback
    def _on_health(self) -> None:
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """homeassistant.update_entity runs a health check now."""
        await self._health.async_check_now()


class IptvHealthSensor(_IptvHealthEntity):
    """ok, degraded (slow), auth_failed or unreachable."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = HEALTH_STATES

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "health")

    @property
    def available(self) -> bool:
        return self._health.status is not None

    @property
    def native_value(self) -> str | None:
        return self._health.status

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "response_time_ms": self._health.latency_ms,
            "last_check": self._health.checked_at.isoformat() if self._health.checked_at else None,
            "error": self._health.error,
        }


class IptvResponseTimeSensor(_IptvHealthEntity):
    """Response time of the last health check."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MILLISECONDS
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "response_time")

    @property
    def available(self) -> bool:
        return self._health.latency_ms is not None

    @property
    def native_value(self) -> int | None:
        return self._health.latency_ms
