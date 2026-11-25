"""A server that redirects to another site (a blocking page, a wrong URL) is reported as such."""

import logging
from types import SimpleNamespace

import pytest

from custom_components.iptv.api import (
    IptvError,
    IptvRedirectError,
    StalkerClient,
    XtreamClient,
    connect_error,
)

BLOCK_PAGE = "<html><body>Offre légale</body></html>"


class _Resp:
    """An answer that came through a redirect to `host` (no redirect when host is None)."""

    def __init__(self, text: str, host: str | None) -> None:
        self._text = text
        self.status = 200
        self.history = (object(),) if host else ()
        self.url = SimpleNamespace(host=host or "portal.example")

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    def raise_for_status(self) -> None:
        return None

    async def text(self) -> str:
        return self._text

    async def json(self, content_type=None):
        import json

        return json.loads(self._text)


class _Session:
    def __init__(self, text: str, host: str | None) -> None:
        self.text, self.host, self.calls = text, host, 0

    def get(self, url, params=None, headers=None, timeout=None):
        self.calls += 1
        return _Resp(self.text, self.host)


async def test_stalker_handshake_redirected_to_a_blocking_page() -> None:
    session = _Session(BLOCK_PAGE, "www.blocked.example")
    client = StalkerClient(session, "http://portal.example:80", "00:1A:79:00:00:01")  # type: ignore[arg-type]
    with pytest.raises(IptvRedirectError) as err:
        await client.async_get_user_info()
    assert err.value.host == "www.blocked.example"


async def test_stalker_html_without_redirect_stays_unreachable() -> None:
    session = _Session(BLOCK_PAGE, None)
    client = StalkerClient(session, "http://portal.example", "00:1A:79:00:00:01")  # type: ignore[arg-type]
    with pytest.raises(IptvError) as err:
        await client.async_get_user_info()
    assert not isinstance(err.value, IptvRedirectError)


async def test_stalker_json_through_a_redirect_is_accepted() -> None:
    """A portal moved to another host that still answers JSON is not an error."""
    session = _Session('{"js":{"token":"T"}}', "cdn.example")
    client = StalkerClient(session, "http://portal.example", "00:1A:79:00:00:01")  # type: ignore[arg-type]
    await client._handshake()
    assert client._token == "T"


async def test_xtream_redirect_is_not_retried_with_other_user_agents() -> None:
    session = _Session(BLOCK_PAGE, "www.blocked.example")
    client = XtreamClient(session, "http://portal.example", "u", "p")  # type: ignore[arg-type]
    with pytest.raises(IptvRedirectError):
        await client.async_get_user_info()
    assert session.calls == 1


def test_connect_error_keys_and_log(caplog: pytest.LogCaptureFixture) -> None:
    client = XtreamClient(None, "http://portal.example:8080", "user", "secret")  # type: ignore[arg-type]
    with caplog.at_level(logging.WARNING):
        assert connect_error(client, IptvRedirectError("www.blocked.example")) == "redirected"
        assert connect_error(client, IptvError("HTTP 503")) == "cannot_connect"
    assert "portal.example:8080 redirects to www.blocked.example" in caplog.text
    assert "portal.example:8080 did not answer: HTTP 503" in caplog.text
    assert "secret" not in caplog.text and "user" not in caplog.text
