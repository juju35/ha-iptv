"""Binary sensors for an Xtream subscription."""

from __future__ import annotations

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
    async_add_entities([IptvTrialSensor(entry.runtime_data)])


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
