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
import contextlib
import re
import time
from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlparse

import aiohttp

TIMEOUT = aiohttp.ClientTimeout(total=60)
HEADERS = {"User-Agent": "Mozilla/5.0"}


class IptvError(Exception):
    """Server unreachable or invalid answer."""


class IptvAuthError(IptvError):
    """Credentials refused."""


def _safe_err(err: BaseException) -> str:
    """Describe an error without leaking the credentials.

    Xtream Codes sends the username and password in the query string, and the
    stream URLs carry them in the path: the text of an aiohttp error contains
    the request URL, so it is never used. An IptvError message is built here.
    """
    if isinstance(err, IptvError):
        return str(err) or type(err).__name__
    if isinstance(err, aiohttp.ClientResponseError) and err.status:
        return f"HTTP {err.status}"
    return type(err).__name__


def normalize_url(url: str) -> str:
    """Strip spaces and trailing slashes, default to http://."""
    url = url.strip().rstrip("/")
    if "://" not in url:
        url = "http://" + url
    return url


# ── French lists ────────────────────────────────────────────────────────────

# Whole-word markers of a French category ("FR | TF1", "[VOSTFR] Séries",
# "FRANCE 4K", "🇫🇷 Sport"); "AFRICA" or "FREE" do not match.
_FRENCH_RE = re.compile(r"(?<![A-Z0-9])(FR|FRA|FRANCE|FRENCH|FRAN[CÇ]AISE?S?|VF|VFF|VOSTFR)(?![A-Z0-9])")
# Categories well known in French lists, even without an FR marker: French
# channels and bouquets, and French-only category words (accented, so that
# English "CINEMA" or "SERIES" do not match).
_KNOWN_FRENCH_RE = re.compile(
    r"(?<![A-Z0-9])("
    r"TF1|M6|W9|TMC|TFX|TF1 SERIES FILMS|C8|CSTAR|NRJ ?12|GULLI|ARTE|LCI|LCP|BFM ?TV|BFM|CNEWS|"
    r"RMC|RMC STORY|RMC SPORT|CANAL ?\+|CANAL PLUS|CANALSAT|CINE ?\+|CINÉ ?\+|OCS|PARIS PREMIERE|"
    r"PARIS PREMIÈRE|TV5 ?MONDE|FRANCE ?TV|FRANCE ?INFO|MOLOTOV|SALTO|TELETOON|TÉLÉTOON|PIWI|"
    r"TIJI|CANAL J|LIGUE ?1|TOP 14|"
    r"SÉRIES?|CINÉMA|DESSINS? ANIMÉS?|DOCUMENTAIRES?|JEUNESSE|ENFANTS|ÉMISSIONS?|TÉLÉRÉALITÉ|"
    r"TÉLÉ-RÉALITÉ|ACTUALITÉS?|CHAÎNES?"
    r")(?![A-Z0-9])"
)
FRENCH_FLAG = "\U0001f1eb\U0001f1f7"
FRENCH_KINDS = ("live", "vod", "series")


def is_french(name: Any) -> bool:
    """True for a category name that looks French (marker or known French category)."""
    text = str(name or "")
    upper = text.upper()
    return FRENCH_FLAG in text or bool(_FRENCH_RE.search(upper)) or bool(_KNOWN_FRENCH_RE.search(upper))


def french_summary(categories: dict[str, list[str] | None]) -> dict[str, Any] | None:
    """Count the French categories per kind; None when no list could be read."""
    if all(names is None for names in categories.values()):
        return None
    summary: dict[str, Any] = {}
    examples: list[str] = []
    for kind in FRENCH_KINDS:
        names = categories.get(kind)
        french = [n for n in names or [] if is_french(n)]
        summary[kind] = None if names is None else len(french)
        examples += french[:3]
    summary["total"] = sum(v for k in FRENCH_KINDS if (v := summary[k]))
    summary["examples"] = examples[:6]
    return summary


# ── Video stream probe ──────────────────────────────────────────────────────

STREAM_TIMEOUT = aiohttp.ClientTimeout(total=15, sock_connect=6, sock_read=10)


async def _probe_stream(session: aiohttp.ClientSession, url: str, headers: dict[str, str]) -> dict[str, Any]:
    """Open a channel stream, read a little, and tell whether it plays.

    Opening a stream uses one of the account's connection slots, briefly.
    Returns {ok: bool, latency_ms, error}.
    """
    start = time.monotonic()
    ms = lambda: round((time.monotonic() - start) * 1000)  # noqa: E731
    try:
        async with session.get(url, headers=headers, timeout=STREAM_TIMEOUT, allow_redirects=True) as resp:
            if resp.status >= 400:
                return {"ok": False, "latency_ms": ms(), "error": f"HTTP {resp.status}"}
            ctype = (resp.headers.get("Content-Type") or "").lower()
            chunk = await resp.content.read(16384)
            if not chunk:
                return {"ok": False, "latency_ms": ms(), "error": "empty stream"}
            if ctype.startswith("text/") or "html" in ctype or "json" in ctype:
                return {"ok": False, "latency_ms": ms(), "error": "not a media stream"}
            return {"ok": True, "latency_ms": ms(), "error": None}
    except (TimeoutError, aiohttp.ClientError) as err:
        return {"ok": False, "latency_ms": None, "error": _safe_err(err)}


def counts_ok(counts: dict[str, Any]) -> bool:
    """True when the channel / movie / series counts look like a real catalogue."""
    chans = counts.get("channels") or 0
    movies = counts.get("movies") or 0
    series = counts.get("series") or 0
    return chans > 0 and (movies > 0 or series > 0)


async def validate_catalogue(
    client: XtreamClient | StalkerClient,
) -> tuple[str | None, dict[str, Any] | None]:
    """Shared add/edit checks: French lists, video stream, catalogue counts.

    Returns (error key or None, French summary). The credentials must already
    have been verified by the caller.
    """
    french = await client.async_get_french()
    if french is None:
        return "french_unknown", None
    if not french["total"]:
        return "no_french_lists", french
    stream = await client.async_test_stream()
    if stream.get("ok") is False:
        return "stream_ko", french
    if not counts_ok(await client.async_get_counts()):
        return "empty_catalogue", french
    return None, french


def server_key(url: str) -> str:
    """``host:port`` of a server URL, to spot two accounts on the same server."""
    parsed = urlparse(normalize_url(url))
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    return f"{(parsed.hostname or '').lower()}:{port}"


# ── Xtream Codes ────────────────────────────────────────────────────────────


class XtreamClient:
    """Query player_api.php for the account info and catalogue sizes."""

    def __init__(self, session: aiohttp.ClientSession, url: str, username: str, password: str) -> None:
        self._session = session
        self._base = normalize_url(url)
        self._endpoint = self._base + "/player_api.php"
        self._username = username
        self._password = password
        self._auth = {"username": username, "password": password}

    async def _get(self, action: str | None = None) -> Any:
        params = dict(self._auth)
        if action:
            params["action"] = action
        try:
            async with self._session.get(self._endpoint, params=params, headers=HEADERS, timeout=TIMEOUT) as resp:
                resp.raise_for_status()
                return await resp.json(content_type=None)
        except (TimeoutError, aiohttp.ClientError, ValueError) as err:
            # from None: the chained aiohttp error would print the URL in a traceback
            raise IptvError(_safe_err(err)) from None

    async def _count(self, action: str) -> int | None:
        try:
            result = await self._get(action)
        except IptvError:
            return None
        return len(result) if isinstance(result, list) else None

    async def _categories(self, action: str) -> list[str] | None:
        try:
            result = await self._get(action)
        except IptvError:
            return None
        if not isinstance(result, list):
            return None
        return [str(c.get("category_name", "")) for c in result if isinstance(c, dict)]

    async def async_get_french(self) -> dict[str, Any] | None:
        """French categories among the live, VOD and series categories."""
        live, vod, series = await asyncio.gather(
            self._categories("get_live_categories"),
            self._categories("get_vod_categories"),
            self._categories("get_series_categories"),
        )
        return french_summary({"live": live, "vod": vod, "series": series})

    async def async_get_counts(self) -> dict[str, Any]:
        """Channel / movie / series counts, for validating a real catalogue."""
        channels, movies, series = await asyncio.gather(
            self._count("get_live_streams"),
            self._count("get_vod_streams"),
            self._count("get_series"),
        )
        return {"channels": channels, "movies": movies, "series": series}

    async def async_test_stream(self) -> dict[str, Any]:
        """Probe the first live channel. ok True/False, or None when untestable."""
        try:
            streams = await self._get("get_live_streams")
        except IptvError as err:
            return {"ok": None, "channel": None, "latency_ms": None, "error": _safe_err(err)}
        first = (
            next((s for s in streams if isinstance(s, dict) and s.get("stream_id") is not None), None)
            if isinstance(streams, list)
            else None
        )
        if not first:
            return {"ok": None, "channel": None, "latency_ms": None, "error": "no channel"}
        sid = first["stream_id"]
        name = str(first.get("name") or sid)
        url = f"{self._base}/live/{self._username}/{self._password}/{sid}.ts"
        res = await _probe_stream(self._session, url, HEADERS)
        res["channel"] = name
        return res

    async def async_get_user_info(self) -> dict[str, Any]:
        """Return user_info, raise IptvAuthError if credentials are refused."""
        data = await self._get()
        info = data.get("user_info") if isinstance(data, dict) else None
        if not isinstance(info, dict) or str(info.get("auth")) != "1":
            raise IptvAuthError
        return info

    async def async_get_data(self) -> dict[str, Any]:
        """Return the account info plus live / VOD / series counts."""
        try:
            info = await self.async_get_user_info()
        except IptvAuthError:
            return {"auth": False}
        channels, movies, series, french = await asyncio.gather(
            self._count("get_live_streams"),
            self._count("get_vod_streams"),
            self._count("get_series"),
            self.async_get_french(),
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
            "french": french,
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
_EXPIRY_FIELDS = ("end_date", "expire_billing_date", "exp_date")
# Some panels write the expiration date in the ``phone`` field; only a dated
# string is read there, never digits (a real phone number is not an epoch).
_PHONE_FIELD = "phone"


def normalize_mac(mac: str) -> str:
    """Upper-case, colon-separated MAC."""
    return mac.strip().upper().replace("-", ":")


def valid_mac(mac: str) -> bool:
    """True for a well-formed ``AA:BB:CC:DD:EE:FF`` address."""
    return bool(MAC_RE.match(normalize_mac(mac)))


def parse_expiry(value: Any) -> int | None:
    """Parse a Stalker expiration into epoch seconds, or None.

    Accepts an epoch (int or digit string) or one of the dated string formats;
    anything else yields None rather than a wrong date.
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)) or (isinstance(value, str) and value.strip().lstrip("-").isdigit()):
        seconds = int(value)
        return seconds if seconds > 1_000_000 else None
    return _parse_date(value)


def _parse_date(value: Any) -> int | None:
    """Parse one of the dated string formats into epoch seconds, or None."""
    text = str(value or "").strip()
    for fmt in _DATE_FORMATS:
        try:
            return int(datetime.strptime(text, fmt).replace(tzinfo=UTC).timestamp())
        except ValueError:
            continue
    return None


def stalker_expiry(info: dict[str, Any]) -> int | None:
    """Expiration of a Stalker account (epoch seconds), None when unknown or unlimited."""
    found = next(
        (p for f in _EXPIRY_FIELDS if (p := parse_expiry(info.get(f))) is not None),
        None,
    )
    return found if found is not None else _parse_date(info.get(_PHONE_FIELD))


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
        # The coordinator and the health check share this client: a handshake
        # replaces the token, so one operation runs at a time
        self._lock = asyncio.Lock()

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

    async def _call(self, portal: str, params: dict[str, str], token: str | None = None) -> Any:
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
                js = await self._call(portal, {"type": "stb", "action": "handshake", "token": ""})
            except (TimeoutError, aiohttp.ClientError, ValueError):
                continue
            token = js.get("token") if isinstance(js, dict) else None
            if token:
                self._portal, self._token = portal, str(token)
                return
        raise IptvError("no Stalker portal answered the handshake")

    async def _get(self, params: dict[str, str]) -> Any:
        if not self._token or not self._portal:
            await self._handshake()
        assert self._portal is not None
        try:
            return await self._call(self._portal, params, self._token)
        except (TimeoutError, aiohttp.ClientError, ValueError) as err:
            raise IptvError(_safe_err(err)) from None

    async def _activate(self) -> None:
        """Call get_profile to validate the session; ignore if unsupported."""
        with contextlib.suppress(IptvError):
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

    async def async_get_user_info(self) -> dict[str, Any]:
        """Return the account info, raise IptvAuthError if the MAC is refused."""
        async with self._lock:
            return await self._user_info()

    async def _user_info(self) -> dict[str, Any]:
        await self._handshake()
        await self._activate()
        try:
            info = await self._get({"type": "account_info", "action": "get_main_info"})
        except IptvError:
            info = None
        if not isinstance(info, dict) or not info or str(info.get("blocked")) == "1":
            raise IptvAuthError
        return info

    async def _categories(self, kind: str) -> list[str] | None:
        action = "get_genres" if kind == "itv" else "get_categories"
        try:
            js = await self._get({"type": kind, "action": action})
        except IptvError:
            return None
        if not isinstance(js, list):
            return None
        return [str(c.get("title", "")) for c in js if isinstance(c, dict)]

    async def async_get_french(self) -> dict[str, Any] | None:
        """French genres / categories among live, VOD and series."""
        async with self._lock:
            return await self._french()

    async def _french(self) -> dict[str, Any] | None:
        if not self._token:
            await self._handshake()
        live, vod, series = await asyncio.gather(
            self._categories("itv"), self._categories("vod"), self._categories("series")
        )
        return french_summary({"live": live, "vod": vod, "series": series})

    async def async_get_counts(self) -> dict[str, Any]:
        """Channel / movie / series counts, for validating a real catalogue."""
        async with self._lock:
            if not self._token:
                await self._handshake()
            channels, movies, series = await asyncio.gather(
                self._count("itv"), self._count("vod"), self._count("series")
            )
        return {"channels": channels, "movies": movies, "series": series}

    async def async_test_stream(self) -> dict[str, Any]:
        """Probe the first live channel via create_link. ok True/False/None."""
        async with self._lock:
            return await self._test_stream()

    async def _test_stream(self) -> dict[str, Any]:
        try:
            js = await self._get({"type": "itv", "action": "get_ordered_list", "genre": "*", "p": "1"})
        except IptvError as err:
            return {"ok": None, "channel": None, "latency_ms": None, "error": _safe_err(err)}
        data = js.get("data") if isinstance(js, dict) else None
        first = data[0] if isinstance(data, list) and data else None
        if not isinstance(first, dict) or not first.get("cmd"):
            return {"ok": None, "channel": None, "latency_ms": None, "error": "no channel"}
        name = str(first.get("name") or first.get("id") or "")
        try:
            link = await self._get(
                {
                    "type": "itv",
                    "action": "create_link",
                    "cmd": str(first["cmd"]),
                    "forced_storage": "0",
                    "disable_ad": "0",
                }
            )
        except IptvError as err:
            return {"ok": None, "channel": name, "latency_ms": None, "error": _safe_err(err)}
        cmd = link.get("cmd") if isinstance(link, dict) else None
        url = cmd.split()[-1] if isinstance(cmd, str) and cmd else None
        if not url or "://" not in url:
            return {"ok": False, "channel": name, "latency_ms": None, "error": "no stream link"}
        res = await _probe_stream(self._session, url, self._headers(self._token))
        res["channel"] = name
        return res

    async def _count(self, kind: str) -> int | None:
        params = {"type": kind, "action": "get_ordered_list", "p": "1"}
        params["genre" if kind == "itv" else "category"] = "*"
        try:
            return extract_count(await self._get(params))
        except IptvError:
            return None

    async def async_get_data(self) -> dict[str, Any]:
        """Return the account info plus live / VOD / series counts."""
        async with self._lock:
            try:
                info = await self._user_info()
            except IptvAuthError:
                return {"auth": False}
            channels, movies, series, french = await asyncio.gather(
                self._count("itv"), self._count("vod"), self._count("series"), self._french()
            )
        exp_date = stalker_expiry(info)
        now = int(datetime.now(UTC).timestamp())
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
            "french": french,
        }
