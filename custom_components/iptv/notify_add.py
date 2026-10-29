"""Send the connection details of a newly added account to a notify service."""

from __future__ import annotations

import logging
import math
from datetime import UTC, datetime
from typing import Any

from homeassistant.const import CONF_URL, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import CONF_MAC, CONF_PROVIDER, PROVIDER_STALKER
from .notify_expiry import DATE_FORMATS

_LOGGER = logging.getLogger(__name__)

TEXTS = {
    "en": {
        "title_new": "IPTV: account added",
        "title_updated": "IPTV: account updated",
        "provider": "Provider",
        "server": "Server",
        "username": "Username",
        "mac": "MAC address",
        "expiration": "Expiration",
        "unlimited": "unlimited",
        "french": "French categories",
        "kinds": {"live": "live", "vod": "VOD", "series": "series"},
    },
    "fr": {
        "title_new": "IPTV : compte ajouté",
        "title_updated": "IPTV : compte mis à jour",
        "provider": "Fournisseur",
        "server": "Serveur",
        "username": "Identifiant",
        "mac": "Adresse MAC",
        "expiration": "Expiration",
        "unlimited": "illimitée",
        "french": "Catégories françaises",
        "kinds": {"live": "live", "vod": "VOD", "series": "séries"},
    },
    "de": {
        "title_new": "IPTV: Konto hinzugefügt",
        "title_updated": "IPTV: Konto aktualisiert",
        "provider": "Anbieter",
        "server": "Server",
        "username": "Benutzername",
        "mac": "MAC-Adresse",
        "expiration": "Ablauf",
        "unlimited": "unbegrenzt",
        "french": "Französische Kategorien",
        "kinds": {"live": "Live", "vod": "VOD", "series": "Serien"},
    },
    "es": {
        "title_new": "IPTV: cuenta añadida",
        "title_updated": "IPTV: cuenta actualizada",
        "provider": "Proveedor",
        "server": "Servidor",
        "username": "Usuario",
        "mac": "Dirección MAC",
        "expiration": "Caducidad",
        "unlimited": "ilimitada",
        "french": "Categorías francesas",
        "kinds": {"live": "directo", "vod": "VOD", "series": "series"},
    },
}


def text_language(language: str | None) -> str:
    """Supported language of a Home Assistant language code (``de-CH`` → ``de``), English otherwise."""
    lang = (language or "").split("-")[0].lower()
    return lang if lang in TEXTS else "en"


def notify_services(hass: HomeAssistant) -> list[str]:
    """Legacy notify services (notify.mobile_app_…), as ``notify.<name>``."""
    names = hass.services.async_services_for_domain("notify")
    return sorted(f"notify.{name}" for name in names if name != "send_message")


def build_message(
    lang: str,
    title: str,
    data: dict[str, Any],
    validity: float | None,
    french: dict[str, Any] | None,
) -> str:
    """Connection details, one per line."""
    lang = text_language(lang)
    t = TEXTS[lang]
    sep = " : " if lang == "fr" else ": "
    lines = [f"{t['provider']}{sep}{title}"]
    lines.append(f"{t['server']}{sep}{data[CONF_URL]}")
    if data.get(CONF_PROVIDER) == PROVIDER_STALKER:
        lines.append(f"{t['mac']}{sep}{data[CONF_MAC]}")
    else:
        # Never the password: the message is kept by the phone app and the push services
        lines.append(f"{t['username']}{sep}{data[CONF_USERNAME]}")
    if validity is not None and validity != -math.inf:
        if validity == math.inf:
            expiration = t["unlimited"]
        else:
            expiration = dt_util.as_local(datetime.fromtimestamp(validity, tz=UTC)).strftime(DATE_FORMATS[lang])
        lines.append(f"{t['expiration']}{sep}{expiration}")
    if french:
        counts = ", ".join(f"{t['kinds'][k]} {french[k]}" for k in ("live", "vod", "series") if french.get(k))
        lines.append(f"{t['french']}{sep}{french['total']} ({counts})")
    return "\n".join(lines)


async def async_send(
    hass: HomeAssistant,
    service: str,
    title: str,
    data: dict[str, Any],
    validity: float | None,
    french: dict[str, Any] | None,
    updated: bool = False,
) -> None:
    """Best effort: a failure is logged and never blocks the account."""
    domain, _, name = service.partition(".")
    if domain != "notify" or not hass.services.has_service(domain, name):
        _LOGGER.warning("IPTV: notify service %s not found, connection details not sent", service)
        return
    lang = text_language(hass.config.language)
    t = TEXTS[lang]
    try:
        await hass.services.async_call(
            domain,
            name,
            {
                "title": t["title_updated" if updated else "title_new"],
                "message": build_message(lang, title, data, validity, french),
            },
            blocking=True,
        )
    except Exception:  # noqa: BLE001 - the account is added anyway
        _LOGGER.exception("IPTV: could not send the connection details with %s", service)
