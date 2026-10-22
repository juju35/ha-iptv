"""Binary sensors for an IPTV subscription."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import IptvConfigEntry
from .entity import IptvEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: IptvConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the binary sensors of one account."""
    coordinator = entry.runtime_data
    async_add_entities([IptvTrialSensor(coordinator), IptvFrenchListsSensor(coordinator)])


class IptvTrialSensor(IptvEntity, BinarySensorEntity):
    """On for a trial account."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "trial")

    @property
    def is_on(self) -> bool | None:
        if not self.coordinator.data.get("auth"):
            return None
        return str(self.coordinator.data.get("is_trial")) == "1"


class IptvFrenchListsSensor(IptvEntity, BinarySensorEntity):
    """On when the provider has French live, VOD or series categories."""

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "french_lists")

    @property
    def _french(self) -> dict[str, Any] | None:
        return self.coordinator.data.get("french") if self.coordinator.data.get("auth") else None

    @property
    def is_on(self) -> bool | None:
        french = self._french
        return None if french is None else french["total"] > 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        french = self._french or {}
        return {
            "live": french.get("live"),
            "vod": french.get("vod"),
            "series": french.get("series"),
            "examples": french.get("examples", []),
        }
