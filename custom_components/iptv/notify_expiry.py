"""Persistent notification when a subscription is about to expire."""

from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import CONF_NOTIFY_DAYS, DEFAULT_NOTIFY_DAYS, DOMAIN

MESSAGES = {
    "en": {
        "title": "IPTV subscription {name}",
        "soon": "The subscription **{name}** expires on {date}: {days} day(s) left.",
        "expired": "The subscription **{name}** expired on {date}.",
    },
    "fr": {
        "title": "Abonnement IPTV {name}",
        "soon": "L’abonnement **{name}** expire le {date} : encore {days} jour(s).",
        "expired": "L’abonnement **{name}** a expiré le {date}.",
    },
    "de": {
        "title": "IPTV-Abonnement {name}",
        "soon": "Das Abonnement **{name}** läuft am {date} ab: noch {days} Tag(e).",
        "expired": "Das Abonnement **{name}** ist am {date} abgelaufen.",
    },
    "es": {
        "title": "Suscripción IPTV {name}",
        "soon": "La suscripción **{name}** caduca el {date}: quedan {days} día(s).",
        "expired": "La suscripción **{name}** caducó el {date}.",
    },
}

DATE_FORMATS = {"en": "%Y-%m-%d", "fr": "%d/%m/%Y", "de": "%d.%m.%Y", "es": "%d/%m/%Y"}


def message_language(language: str | None) -> str:
    """Supported language of a Home Assistant language code (``de-CH`` → ``de``), English otherwise."""
    lang = (language or "").split("-")[0].lower()
    return lang if lang in MESSAGES else "en"


OFF = (0, 0)


def notification_id(entry_id: str) -> str:
    """One notification per account."""
    return f"{DOMAIN}_expiring_{entry_id}"


class ExpiryNotifier:
    """Create, refresh or dismiss the expiration notification of one account.

    The notification is (re)created once per day while the account is inside
    the warning window, so dismissing it silences it until the next day.
    """

    def __init__(self, hass: HomeAssistant, entry_id: str, name: str, options: dict[str, Any]) -> None:
        self._hass = hass
        self._id = notification_id(entry_id)
        self._name = name
        self._threshold = int(options.get(CONF_NOTIFY_DAYS, DEFAULT_NOTIFY_DAYS))
        self._last: tuple[int, int] | None = None  # None: unknown yet

    @callback
    def update(self, data: dict[str, Any] | None) -> None:
        exp = (data or {}).get("exp_date")
        try:
            exp = int(exp) if exp else None
        except (TypeError, ValueError):
            exp = None
        if not self._threshold or not exp or not (data or {}).get("auth"):
            self.dismiss()
            return
        expiration = datetime.fromtimestamp(exp, tz=UTC)
        days = math.ceil((expiration - dt_util.utcnow()).total_seconds() / 86400)
        if days > self._threshold:
            self.dismiss()
            return
        key = (exp, days)
        if key == self._last:
            return
        self._last = key
        lang = message_language(self._hass.config.language)
        text = MESSAGES[lang]
        date = dt_util.as_local(expiration).strftime(DATE_FORMATS[lang])
        message = (text["soon"] if days > 0 else text["expired"]).format(name=self._name, date=date, days=days)
        persistent_notification.async_create(
            self._hass,
            message,
            title=text["title"].format(name=self._name),
            notification_id=self._id,
        )

    @callback
    def rename(self, name: str, data: dict[str, Any] | None) -> None:
        """The account was renamed: show the new name in a current notification."""
        self._name = name
        if self._last != OFF:
            self._last = None
        self.update(data)

    @callback
    def dismiss(self) -> None:
        # The first call also clears a notification left over from before a restart
        if self._last != OFF:
            persistent_notification.async_dismiss(self._hass, self._id)
            self._last = OFF
