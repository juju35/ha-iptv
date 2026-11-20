"""The Xtream client tries other User-Agents when the provider filters one."""

import aiohttp
import pytest

from custom_components.iptv.api import USER_AGENTS, IptvError, XtreamClient

OK = {"user_info": {"auth": 1, "status": "Active"}}


class _Resp:
    def __init__(self, status: int, payload=None, html: bool = False) -> None:
        self.status, self._payload, self._html = status, payload, html

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    def raise_for_status(self) -> None:
        if self.status >= 400:
            raise aiohttp.ClientResponseError(None, (), status=self.status)  # type: ignore[arg-type]

    async def json(self, content_type=None):
        if self._html:
            raise ValueError("not json")
        return self._payload


class _Session:
    """Answers per User-Agent: {ua: status | 'html'}, default 461."""

    def __init__(self, rules: dict[str, object], default: object = 461) -> None:
        self.rules, self.default, self.seen = rules, default, []

    def get(self, url, params=None, headers=None, timeout=None):
        ua = headers["User-Agent"]
        self.seen.append(ua)
        rule = self.rules.get(ua, self.default)
        if rule == "html":
            return _Resp(200, html=True)
        if rule == 200:
            return _Resp(200, OK)
        return _Resp(int(rule))  # type: ignore[arg-type]


async def test_first_user_agent_accepted() -> None:
    session = _Session({USER_AGENTS[0]: 200})
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    assert (await client.async_get_user_info())["auth"] == 1
    assert session.seen == [USER_AGENTS[0]]


async def test_falls_back_and_remembers_the_accepted_one() -> None:
    session = _Session({USER_AGENTS[0]: 461, USER_AGENTS[1]: "html", USER_AGENTS[2]: 200})
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    await client.async_get_user_info()
    assert session.seen == list(USER_AGENTS[:3])
    session.seen.clear()
    await client.async_get_user_info()
    assert session.seen == [USER_AGENTS[2]]


async def test_real_outage_is_not_retried() -> None:
    session = _Session({}, default=503)
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    with pytest.raises(IptvError, match="HTTP 503"):
        await client.async_get_user_info()
    assert len(session.seen) == 1


async def test_all_refused_reports_the_http_status() -> None:
    session = _Session({}, default=461)
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    with pytest.raises(IptvError, match="HTTP 461"):
        await client.async_get_user_info()
    assert len(session.seen) == len(USER_AGENTS)


async def test_html_after_an_accepted_user_agent_is_not_retried() -> None:
    session = _Session({USER_AGENTS[0]: 200})
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    await client.async_get_user_info()
    session.rules[USER_AGENTS[0]] = "html"
    session.seen.clear()
    with pytest.raises(IptvError):
        await client.async_get_user_info()
    assert session.seen == [USER_AGENTS[0]]


async def test_a_filter_after_an_accepted_user_agent_is_still_retried() -> None:
    session = _Session({USER_AGENTS[0]: 200, USER_AGENTS[1]: 200})
    client = XtreamClient(session, "http://x", "u", "p")  # type: ignore[arg-type]
    await client.async_get_user_info()
    session.rules[USER_AGENTS[0]] = 461
    session.seen.clear()
    await client.async_get_user_info()
    assert session.seen == [USER_AGENTS[0], USER_AGENTS[1]]
