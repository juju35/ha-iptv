"""Minimal client for the Xtream Codes player API."""

from __future__ import annotations

import asyncio
from typing import Any

import aiohttp

TIMEOUT = aiohttp.ClientTimeout(total=60)
HEADERS = {"User-Agent": "Mozilla/5.0"}


class XtreamError(Exception):
    """Server unreachable or invalid answer."""


class XtreamAuthError(XtreamError):
    """Credentials refused."""


def normalize_url(url: str) -> str:
    """Strip spaces and trailing slashes, default to http://."""
    url = url.strip().rstrip("/")
    if "://" not in url:
        url = "http://" + url
    return url


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
