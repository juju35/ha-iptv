"""Calendar of an IPTV subscription: its expiration day as an all-day event.

Shows in the Home Assistant calendar and in calendar cards, and calendar triggers can act on it (a reminder a few
days before with `offset`).
"""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .coordinator import IptvConfigEntry, IptvCoordinator
from .entity import IptvEntity
from .notify_expiry import supported_language

# Summary of the event, in Home Assistant's language: {name} is the subscription's title.
SUMMARIES = {
    "en": "{name} expires",
    "fr": "{name} expire",
    "de": "{name} läuft ab",
    "es": "{name} caduca",
    "sr": "{name} истиче",
    "sr-Latn": "{name} ističe",
    "it": "{name} scade",
    "nl": "{name} verloopt",
    "pt": "{name} expira",
    "pl": "{name} wygasa",
    "ro": "{name} expiră",
    "da": "{name} udløber",
    "sv": "{name} går ut",
    "bg": "{name} изтича",
    "ru": "{name} истекает",
    "uk": "{name} спливає",
    "hu": "{name} lejár",
    "sk": "{name} vyprší",
    "cs": "{name} vyprší",
    "sl": "{name} poteče",
    "lv": "{name} beidzas",
    "el": "Λήξη {name}",
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: IptvConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the calendar of one account."""
    async_add_entities([IptvExpirationCalendar(entry.runtime_data)])


class IptvExpirationCalendar(IptvEntity, CalendarEntity):
    """One all-day event on the day the subscription expires; none for an unlimited one."""

    def __init__(self, coordinator: IptvCoordinator) -> None:
        super().__init__(coordinator, "expiration_calendar")

    def _event(self) -> CalendarEvent | None:
        try:
            seconds = int((self.coordinator.data or {}).get("exp_date") or 0)
        except (TypeError, ValueError):
            return None
        if not seconds:
            return None
        day = dt_util.as_local(dt_util.utc_from_timestamp(seconds)).date()
        return CalendarEvent(
            start=day,
            end=day + timedelta(days=1),
            summary=SUMMARIES[supported_language(self.hass.config.language, SUMMARIES)].format(
                name=self.coordinator.config_entry.title
            ),
            uid=f"{self.coordinator.config_entry.entry_id}_expiration",
        )

    @property
    def event(self) -> CalendarEvent | None:
        """The expiration, while it has not passed."""
        event = self._event()
        if event is None or event.end <= dt_util.now().date():
            return None
        return event

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        event = self._event()
        if event is None:
            return []
        start = dt_util.start_of_local_day(event.start)
        end = dt_util.start_of_local_day(event.end)
        return [event] if start < end_date and end > start_date else []
