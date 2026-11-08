"""Persistent notification and events when a subscription is about to expire."""

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
    "it": {
        "title": "Abbonamento IPTV {name}",
        "soon": "L’abbonamento **{name}** scade il {date} (giorni rimanenti: {days}).",
        "expired": "L’abbonamento **{name}** è scaduto il {date}.",
    },
    "nl": {
        "title": "IPTV-abonnement {name}",
        "soon": "Het abonnement **{name}** verloopt op {date}: nog {days} dag(en).",
        "expired": "Het abonnement **{name}** is verlopen op {date}.",
    },
    "pt": {
        "title": "Subscrição IPTV {name}",
        "soon": "A subscrição **{name}** expira a {date}: faltam {days} dia(s).",
        "expired": "A subscrição **{name}** expirou a {date}.",
    },
    "pl": {
        "title": "Subskrypcja IPTV {name}",
        "soon": "Subskrypcja **{name}** wygasa {date} (pozostało dni: {days}).",
        "expired": "Subskrypcja **{name}** wygasła {date}.",
    },
    "ro": {
        "title": "Abonament IPTV {name}",
        "soon": "Abonamentul **{name}** expiră pe {date} (zile rămase: {days}).",
        "expired": "Abonamentul **{name}** a expirat pe {date}.",
    },
    "da": {
        "title": "IPTV-abonnement {name}",
        "soon": "Abonnementet **{name}** udløber den {date}: {days} dag(e) tilbage.",
        "expired": "Abonnementet **{name}** udløb den {date}.",
    },
    "sv": {
        "title": "IPTV-abonnemang {name}",
        "soon": "Abonnemanget **{name}** går ut den {date}: {days} dag(ar) kvar.",
        "expired": "Abonnemanget **{name}** gick ut den {date}.",
    },
    "bg": {
        "title": "IPTV абонамент {name}",
        "soon": "Абонаментът **{name}** изтича на {date} (оставащи дни: {days}).",
        "expired": "Абонаментът **{name}** изтече на {date}.",
    },
    "ru": {
        "title": "IPTV-подписка {name}",
        "soon": "Подписка **{name}** истекает {date} (осталось дней: {days}).",
        "expired": "Подписка **{name}** истекла {date}.",
    },
    "uk": {
        "title": "IPTV-підписка {name}",
        "soon": "Підписка **{name}** закінчується {date} (залишилося днів: {days}).",
        "expired": "Підписка **{name}** закінчилася {date}.",
    },
    "hu": {
        "title": "IPTV-előfizetés {name}",
        "soon": "A(z) **{name}** előfizetés lejár: {date} (hátralévő napok: {days}).",
        "expired": "A(z) **{name}** előfizetés lejárt: {date}.",
    },
    "sk": {
        "title": "Predplatné IPTV {name}",
        "soon": "Predplatné **{name}** vyprší {date} (zostávajúce dni: {days}).",
        "expired": "Predplatné **{name}** vypršalo {date}.",
    },
    "cs": {
        "title": "Předplatné IPTV {name}",
        "soon": "Předplatné **{name}** vyprší {date} (zbývající dny: {days}).",
        "expired": "Předplatné **{name}** vypršelo {date}.",
    },
    "sl": {
        "title": "Naročnina IPTV {name}",
        "soon": "Naročnina **{name}** poteče {date} (preostali dnevi: {days}).",
        "expired": "Naročnina **{name}** je potekla {date}.",
    },
    "lv": {
        "title": "IPTV abonements {name}",
        "soon": "Abonementa **{name}** derīgums beidzas {date} (atlikušās dienas: {days}).",
        "expired": "Abonementa **{name}** derīgums beidzās {date}.",
    },
    "el": {
        "title": "Συνδρομή IPTV {name}",
        "soon": "Η συνδρομή **{name}** λήγει στις {date} (ημέρες που απομένουν: {days}).",
        "expired": "Η συνδρομή **{name}** έληξε στις {date}.",
    },
    "sr": {
        "title": "IPTV претплата {name}",
        "soon": "Претплата **{name}** истиче {date} (преостало дана: {days}).",
        "expired": "Претплата **{name}** је истекла {date}.",
    },
    "sr-Latn": {
        "title": "IPTV pretplata {name}",
        "soon": "Pretplata **{name}** ističe {date} (preostalo dana: {days}).",
        "expired": "Pretplata **{name}** je istekla {date}.",
    },
}

DATE_FORMATS = {
    "en": "%Y-%m-%d",
    "fr": "%d/%m/%Y",
    "de": "%d.%m.%Y",
    "es": "%d/%m/%Y",
    "it": "%d/%m/%Y",
    "nl": "%d-%m-%Y",
    "pt": "%d/%m/%Y",
    "pl": "%d.%m.%Y",
    "ro": "%d.%m.%Y",
    "da": "%d.%m.%Y",
    "sv": "%Y-%m-%d",
    "bg": "%d.%m.%Y",
    "ru": "%d.%m.%Y",
    "uk": "%d.%m.%Y",
    "hu": "%Y.%m.%d.",
    "sk": "%d. %m. %Y",
    "cs": "%d. %m. %Y",
    "sl": "%d. %m. %Y",
    "lv": "%d.%m.%Y.",
    "el": "%d/%m/%Y",
    "sr": "%d.%m.%Y.",
    "sr-Latn": "%d.%m.%Y.",
}


def supported_language(language: str | None, table: dict[str, Any]) -> str:
    """The full code when ``table`` has it (``sr-Latn``), else its base (``de-CH`` → ``de``), else English."""
    if language in table:
        return language
    lang = (language or "").split("-")[0].lower()
    return lang if lang in table else "en"


def message_language(language: str | None) -> str:
    """Supported language of a Home Assistant code (``sr-Latn`` as is, ``de-CH`` → ``de``), English otherwise."""
    return supported_language(language, MESSAGES)


OFF = (0, 0)

EVENT_EXPIRING = f"{DOMAIN}_expiring"
EVENT_EXPIRED = f"{DOMAIN}_expired"


def notification_id(entry_id: str) -> str:
    """One notification per account."""
    return f"{DOMAIN}_expiring_{entry_id}"


class ExpiryNotifier:
    """Create, refresh or dismiss the expiration notification of one account.

    The notification is (re)created once per day while the account is inside
    the warning window, so dismissing it silences it until the next day.

    ``iptv_expiring`` / ``iptv_expired`` are fired on the bus when the account
    enters the warning window or expires; the first known state (startup,
    reload) is only recorded, so a restart never fires them again.

    An expired line whose login is then refused keeps the last expiration date
    seen: it is still reported as expired, not as a line without expiration.
    """

    def __init__(self, hass: HomeAssistant, entry_id: str, name: str, options: dict[str, Any]) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._id = notification_id(entry_id)
        self._name = name
        self._threshold = int(options.get(CONF_NOTIFY_DAYS, DEFAULT_NOTIFY_DAYS))
        self._last: tuple[int, int] | None = None  # None: unknown yet
        self._phase: str | None = None  # "ok", "expiring" or "expired"; None: unknown yet
        self._exp: int | None = None  # last expiration date seen with a valid login

    @callback
    def update(self, data: dict[str, Any] | None) -> None:
        exp = (data or {}).get("exp_date")
        try:
            exp = int(exp) if exp else None
        except (TypeError, ValueError):
            exp = None
        if not (data or {}).get("auth"):
            # An expired line usually loses its authentication along with its expiration
            # date: it stays expired on the last date seen instead of looking fixed
            past = self._exp is not None and self._exp <= dt_util.utcnow().timestamp()
            exp = self._exp if past else None
        elif exp:
            self._exp = exp
        if not exp:
            self.dismiss()
            return
        expiration = datetime.fromtimestamp(exp, tz=UTC)
        days = math.ceil((expiration - dt_util.utcnow()).total_seconds() / 86400)
        self._fire_on_change(expiration, days)
        if not self._threshold or days > self._threshold:
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
    def _fire_on_change(self, expiration: datetime, days: int) -> None:
        """Fire iptv_expiring / iptv_expired when the account enters that phase."""
        if days <= 0:
            phase = "expired"
        elif self._threshold and days <= self._threshold:
            phase = "expiring"
        else:
            phase = "ok"
        previous, self._phase = self._phase, phase
        if previous is None or phase in (previous, "ok"):
            return
        self._hass.bus.async_fire(
            EVENT_EXPIRED if phase == "expired" else EVENT_EXPIRING,
            {
                "entry_id": self._entry_id,
                "name": self._name,
                "days_left": max(days, 0),
                "exp_date": expiration.isoformat(),
            },
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
