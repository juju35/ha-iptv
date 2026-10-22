"""Clients for the supported IPTV providers.

Two protocols, one normalised result so the sensors and the card do not care
which provider an account uses:

- Xtream Codes ``player_api.php`` (username / password), see :class:`XtreamClient`
- Stalker / Ministra portal (MAC address), see :class:`StalkerClient`

``async_get_data`` returns the same dict for both::

    {auth, status, exp_date, created_at, is_trial,
     active_cons, max_connections, channels, movies, series}

``exp_date`` and ``created_at`` are epoch seconds (or ``None``); the counts are
``None`` when the provider does not expose them.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import re
from typing import Any

import aiohttp

TIMEOUT = aiohttp.ClientTimeout(total=60)
HEADERS = {"User-Agent": "Mozilla/5.0"}


class XtreamError(Exception):
    """Server unreachable or invalid answer."""


class XtreamAuthError(XtreamError):
    """Credentials refused."""


# Neutral aliases: the errors are shared by both providers.
IptvError = XtreamError
IptvAuthError = XtreamAuthError


def normalize_url(url: str) -> str:
    """Strip spaces and trailing slashes, default to http://."""
    url = url.strip().rstrip("/")
    if "://" not in url:
        url = "http://" + url
    return url


# ── Xtream Codes ────────────────────────────────────────────────────────────


class XtreamClient:
    """Query player_api.php for the account info and catalogue sizes."""

    def __init__(
        self, session: aiohttp.ClientSession, url: str, username: str, password: str
    ) -> None:
        self._session = session
        self._endpoint = normalize_url(url) + "/player_api.php"
        self._auth = {"username": username, "password": password}

    async def _get(self, action: str | None = None) -> Any:
        params = dict(self._auth)
        if action:
            params["action"] = action
        try:
            async with self._session.get(
                self._endpoint, params=params, headers=HEADERS, timeout=TIMEOUT
            ) as resp:
                resp.raise_for_status()
                return await resp.json(content_type=None)
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
            raise XtreamError(str(err) or type(err).__name__) from err

    async def _count(self, action: str) -> int | None:
        try:
            result = await self._get(action)
        except XtreamError:
            return None
        return len(result) if isinstance(result, list) else None

    async def async_get_user_info(self) -> dict[str, Any]:
        """Return user_info, raise XtreamAuthError if credentials are refused."""
        data = await self._get()
        info = data.get("user_info") if isinstance(data, dict) else None
        if not isinstance(info, dict) or str(info.get("auth")) != "1":
            raise XtreamAuthError
        return info

    async def async_get_data(self) -> dict[str, Any]:
        """Return the account info plus live / VOD / series counts."""
        try:
            info = await self.async_get_user_info()
        except XtreamAuthError:
            return {"auth": False}
        channels, movies, series = await asyncio.gather(
            self._count("get_live_streams"),
            self._count("get_vod_streams"),
            self._count("get_series"),
        )
        return {
            "auth": True,
            "status": info.get("status"),
            "exp_date": info.get("exp_date"),
            "created_at": info.get("created_at"),
            "is_trial": info.get("is_trial"),
            "active_cons": info.get("active_cons"),
            "max_connections": info.get("max_connections"),
            "channels": channels,
            "movies": movies,
            "series": series,
        }


# ── Stalker / Ministra portal ───────────────────────────────────────────────

MAC_RE = re.compile(r"^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$")

# Portal entry points, tried in order until the handshake returns a token.
STALKER_PORTALS = (
    "/portal.php",
    "/stalker_portal/server/load.php",
    "/c/portal.php",
)
STB_UA = (
    "Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 "
    "(KHTML, like Gecko) MAG250 stbapp ver: 2 rev: 250 Safari/533.3"
)
# Date formats seen in Stalker account info across panels.
_DATE_FORMATS = (
    "%B %d, %Y, %I:%M %p",
    "%B %d, %Y",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d",
    "%d.%m.%Y",
    "%d/%m/%Y",
)
# account_info fields that may hold the expiration, best first.
_EXPIRY_FIELDS = ("end_date", "expire_billing_date", "exp_date", "phone")


def normalize_mac(mac: str) -> str:
    """Upper-case, colon-separated MAC."""
    return mac.strip().upper().replace("-", ":")


def valid_mac(mac: str) -> bool:
    """True for a well-formed ``AA:BB:CC:DD:EE:FF`` address."""
    return bool(MAC_RE.match(normalize_mac(mac)))


def parse_expiry(value: Any) -> int | None:
    """Parse a Stalker expiration into epoch seconds, or None.

    Accepts an epoch (int or digit string) or one of the dated string formats.
    A value that is not a recognisable date (e.g. a real phone number in the
    ``phone`` field) yields None rather than a wrong date.
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)) or (
        isinstance(value, str) and value.strip().lstrip("-").isdigit()
    ):
        seconds = int(value)
        return seconds if seconds > 1_000_000 else None
    text = str(value).strip()
    if not text:
        return None
    for fmt in _DATE_FORMATS:
        try:
            return int(datetime.strptime(text, fmt).replace(tzinfo=timezone.utc).timestamp())
        except ValueError:
            continue
    return None


def stalker_status(info: dict[str, Any], exp_date: int | None, now: int) -> str:
    """Derive an Xtream-style status from the Stalker account info."""
    if str(info.get("blocked")) == "1" or str(info.get("status")) in ("0", "2"):
        return "banned"
    if exp_date is not None and exp_date < now:
        return "expired"
    return "active"


def extract_count(js: Any) -> int | None:
    """Pull a catalogue size from a ``get_ordered_list`` answer."""
    if not isinstance(js, dict):
        return None
    total = js.get("total_items")
    try:
        return int(total)
    except (TypeError, ValueError):
        data = js.get("data")
        return len(data) if isinstance(data, list) else None


class StalkerClient:
    """Authenticate a MAC against a Stalker portal and read its account info."""

    def __init__(self, session: aiohttp.ClientSession, url: str, mac: str) -> None:
        self._session = session
        self._base = normalize_url(url)
        self._mac = normalize_mac(mac)
        self._portal: str | None = None
        self._token: str | None = None

    def _headers(self, token: str | None = None) -> dict[str, str]:
        headers = {
            "User-Agent": STB_UA,
            "Referer": self._base + "/c/",
            "X-User-Agent": "Model: MAG250; Link: WiFi",
            "Cookie": f"mac={self._mac}; stb_lang=en; timezone=Europe/Paris",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers

    async def _call(
        self, portal: str, params: dict[str, str], token: str | None = None
    ) -> Any:
        query = dict(params)
        query["JsHttpRequest"] = "1-xml"
        async with self._session.get(
            self._base + portal,
            params=query,
            headers=self._headers(token),
            timeout=TIMEOUT,
        ) as resp:
            resp.raise_for_status()
            data = await resp.json(content_type=None)
        return data.get("js") if isinstance(data, dict) else None

    async def _handshake(self) -> None:
        """Find the working portal path and get a session token."""
        for portal in STALKER_PORTALS:
            try:
                js = await self._call(
                    portal, {"type": "stb", "action": "handshake", "token": ""}
                )
            except (aiohttp.ClientError, asyncio.TimeoutError, ValueError):
                continue
            token = js.get("token") if isinstance(js, dict) else None
            if token:
                self._portal, self._token = portal, str(token)
                return
        raise XtreamError("no Stalker portal answered the handshake")

    async def _get(self, params: dict[str, str]) -> Any:
        if not self._token or not self._portal:
            await self._handshake()
        assert self._portal is not None
        try:
            return await self._call(self._portal, params, self._token)
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
            raise XtreamError(str(err) or type(err).__name__) from err

    async def _activate(self) -> None:
        """Call get_profile to validate the session; ignore if unsupported."""
        try:
            await self._get(
                {
                    "type": "stb",
                    "action": "get_profile",
                    "hd": "1",
                    "stb_type": "MAG250",
                    "client_type": "STB",
                    "auth_second_step": "0",
                    "not_valid_token": "0",
                }
            )
        except XtreamError:
            pass

    async def async_get_user_info(self) -> dict[str, Any]:
        """Return the account info, raise XtreamAuthError if the MAC is refused."""
        await self._handshake()
        await self._activate()
        try:
            info = await self._get({"type": "account_info", "action": "get_main_info"})
        except XtreamError:
            info = None
        if not isinstance(info, dict) or not info or str(info.get("blocked")) == "1":
            raise XtreamAuthError
        return info

    async def _count(self, kind: str) -> int | None:
        params = {"type": kind, "action": "get_ordered_list", "p": "1"}
        params["genre" if kind == "itv" else "category"] = "*"
        try:
            return extract_count(await self._get(params))
        except XtreamError:
            return None

    async def async_get_data(self) -> dict[str, Any]:
        """Return the account info plus live / VOD / series counts."""
        try:
            info = await self.async_get_user_info()
        except XtreamAuthError:
            return {"auth": False}
        channels, movies, series = await asyncio.gather(
            self._count("itv"), self._count("vod"), self._count("series")
        )
        exp_date = next(
            (p for f in _EXPIRY_FIELDS if (p := parse_expiry(info.get(f))) is not None),
            None,
        )
        now = int(datetime.now(timezone.utc).timestamp())
        return {
            "auth": True,
            "status": stalker_status(info, exp_date, now),
            "exp_date": exp_date,
            "created_at": None,
            "is_trial": None,
            "active_cons": None,
            "max_connections": None,
            "channels": channels,
            "movies": movies,
            "series": series,
        }
