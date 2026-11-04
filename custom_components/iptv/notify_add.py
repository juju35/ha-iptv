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
from .notify_expiry import DATE_FORMATS, supported_language

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
    "it": {
        "title_new": "IPTV: account aggiunto",
        "title_updated": "IPTV: account aggiornato",
        "provider": "Fornitore",
        "server": "Server",
        "username": "Nome utente",
        "mac": "Indirizzo MAC",
        "expiration": "Scadenza",
        "unlimited": "illimitato",
        "french": "Categorie francesi",
        "kinds": {"live": "live", "vod": "VOD", "series": "serie"},
    },
    "nl": {
        "title_new": "IPTV: account toegevoegd",
        "title_updated": "IPTV: account bijgewerkt",
        "provider": "Provider",
        "server": "Server",
        "username": "Gebruikersnaam",
        "mac": "MAC-adres",
        "expiration": "Vervaldatum",
        "unlimited": "onbeperkt",
        "french": "Franse categorieën",
        "kinds": {"live": "live", "vod": "VOD", "series": "series"},
    },
    "pt": {
        "title_new": "IPTV: conta adicionada",
        "title_updated": "IPTV: conta atualizada",
        "provider": "Fornecedor",
        "server": "Servidor",
        "username": "Nome de utilizador",
        "mac": "Endereço MAC",
        "expiration": "Expiração",
        "unlimited": "ilimitada",
        "french": "Categorias francesas",
        "kinds": {"live": "em direto", "vod": "VOD", "series": "séries"},
    },
    "pl": {
        "title_new": "IPTV: dodano konto",
        "title_updated": "IPTV: zaktualizowano konto",
        "provider": "Dostawca",
        "server": "Serwer",
        "username": "Nazwa użytkownika",
        "mac": "Adres MAC",
        "expiration": "Wygaśnięcie",
        "unlimited": "bez limitu",
        "french": "Kategorie francuskie",
        "kinds": {"live": "na żywo", "vod": "VOD", "series": "seriale"},
    },
    "ro": {
        "title_new": "IPTV: cont adăugat",
        "title_updated": "IPTV: cont actualizat",
        "provider": "Furnizor",
        "server": "Server",
        "username": "Nume de utilizator",
        "mac": "Adresă MAC",
        "expiration": "Expirare",
        "unlimited": "nelimitat",
        "french": "Categorii franceze",
        "kinds": {"live": "live", "vod": "VOD", "series": "seriale"},
    },
    "da": {
        "title_new": "IPTV: konto tilføjet",
        "title_updated": "IPTV: konto opdateret",
        "provider": "Udbyder",
        "server": "Server",
        "username": "Brugernavn",
        "mac": "MAC-adresse",
        "expiration": "Udløb",
        "unlimited": "ubegrænset",
        "french": "Franske kategorier",
        "kinds": {"live": "live", "vod": "VOD", "series": "serier"},
    },
    "sv": {
        "title_new": "IPTV: konto tillagt",
        "title_updated": "IPTV: konto uppdaterat",
        "provider": "Leverantör",
        "server": "Server",
        "username": "Användarnamn",
        "mac": "MAC-adress",
        "expiration": "Utgång",
        "unlimited": "obegränsat",
        "french": "Franska kategorier",
        "kinds": {"live": "live", "vod": "VOD", "series": "serier"},
    },
    "bg": {
        "title_new": "IPTV: акаунтът е добавен",
        "title_updated": "IPTV: акаунтът е актуализиран",
        "provider": "Доставчик",
        "server": "Сървър",
        "username": "Потребителско име",
        "mac": "MAC адрес",
        "expiration": "Изтичане",
        "unlimited": "неограничен",
        "french": "Френски категории",
        "kinds": {"live": "на живо", "vod": "VOD", "series": "сериали"},
    },
    "ru": {
        "title_new": "IPTV: учётная запись добавлена",
        "title_updated": "IPTV: учётная запись обновлена",
        "provider": "Провайдер",
        "server": "Сервер",
        "username": "Имя пользователя",
        "mac": "MAC-адрес",
        "expiration": "Окончание",
        "unlimited": "без ограничений",
        "french": "Французские категории",
        "kinds": {"live": "эфир", "vod": "VOD", "series": "сериалы"},
    },
    "uk": {
        "title_new": "IPTV: обліковий запис додано",
        "title_updated": "IPTV: обліковий запис оновлено",
        "provider": "Провайдер",
        "server": "Сервер",
        "username": "Ім'я користувача",
        "mac": "MAC-адреса",
        "expiration": "Закінчення",
        "unlimited": "без обмежень",
        "french": "Французькі категорії",
        "kinds": {"live": "ефір", "vod": "VOD", "series": "серіали"},
    },
    "hu": {
        "title_new": "IPTV: fiók hozzáadva",
        "title_updated": "IPTV: fiók frissítve",
        "provider": "Szolgáltató",
        "server": "Szerver",
        "username": "Felhasználónév",
        "mac": "MAC-cím",
        "expiration": "Lejárat",
        "unlimited": "korlátlan",
        "french": "Francia kategóriák",
        "kinds": {"live": "élő", "vod": "VOD", "series": "sorozat"},
    },
    "sk": {
        "title_new": "IPTV: účet pridaný",
        "title_updated": "IPTV: účet aktualizovaný",
        "provider": "Poskytovateľ",
        "server": "Server",
        "username": "Používateľské meno",
        "mac": "MAC adresa",
        "expiration": "Platnosť do",
        "unlimited": "neobmedzené",
        "french": "Francúzske kategórie",
        "kinds": {"live": "naživo", "vod": "VOD", "series": "seriály"},
    },
    "cs": {
        "title_new": "IPTV: účet přidán",
        "title_updated": "IPTV: účet aktualizován",
        "provider": "Poskytovatel",
        "server": "Server",
        "username": "Uživatelské jméno",
        "mac": "MAC adresa",
        "expiration": "Platnost do",
        "unlimited": "neomezeno",
        "french": "Francouzské kategorie",
        "kinds": {"live": "živě", "vod": "VOD", "series": "seriály"},
    },
    "sl": {
        "title_new": "IPTV: račun dodan",
        "title_updated": "IPTV: račun posodobljen",
        "provider": "Ponudnik",
        "server": "Strežnik",
        "username": "Uporabniško ime",
        "mac": "Naslov MAC",
        "expiration": "Potek",
        "unlimited": "neomejeno",
        "french": "Francoske kategorije",
        "kinds": {"live": "v živo", "vod": "VOD", "series": "serije"},
    },
    "lv": {
        "title_new": "IPTV: konts pievienots",
        "title_updated": "IPTV: konts atjaunināts",
        "provider": "Pakalpojumu sniedzējs",
        "server": "Serveris",
        "username": "Lietotājvārds",
        "mac": "MAC adrese",
        "expiration": "Derīguma beigas",
        "unlimited": "neierobežots",
        "french": "Franču kategorijas",
        "kinds": {"live": "tiešraide", "vod": "VOD", "series": "seriāli"},
    },
    "el": {
        "title_new": "IPTV: ο λογαριασμός προστέθηκε",
        "title_updated": "IPTV: ο λογαριασμός ενημερώθηκε",
        "provider": "Πάροχος",
        "server": "Διακομιστής",
        "username": "Όνομα χρήστη",
        "mac": "Διεύθυνση MAC",
        "expiration": "Λήξη",
        "unlimited": "απεριόριστη",
        "french": "Γαλλικές κατηγορίες",
        "kinds": {"live": "ζωντανά", "vod": "VOD", "series": "σειρές"},
    },
    "sr": {
        "title_new": "IPTV: налог је додат",
        "title_updated": "IPTV: налог је ажуриран",
        "provider": "Провајдер",
        "server": "Сервер",
        "username": "Корисничко име",
        "mac": "MAC адреса",
        "expiration": "Истек",
        "unlimited": "неограничено",
        "french": "Француске категорије",
        "kinds": {"live": "уживо", "vod": "VOD", "series": "серије"},
    },
    "sr-Latn": {
        "title_new": "IPTV: nalog je dodat",
        "title_updated": "IPTV: nalog je ažuriran",
        "provider": "Provajder",
        "server": "Server",
        "username": "Korisničko ime",
        "mac": "MAC adresa",
        "expiration": "Istek",
        "unlimited": "neograničeno",
        "french": "Francuske kategorije",
        "kinds": {"live": "uživo", "vod": "VOD", "series": "serije"},
    },
}


def text_language(language: str | None) -> str:
    """Supported language of a Home Assistant code (``sr-Latn`` as is, ``de-CH`` → ``de``), English otherwise."""
    return supported_language(language, TEXTS)


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
