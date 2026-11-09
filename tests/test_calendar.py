"""The subscription's calendar: its expiration day as an all-day event."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from .test_init import USER_INFO, _mock_server, entry  # noqa: F401 - entry is a fixture

CALENDAR = "calendar.provider_example_expiration"


async def _setup_with(hass, aioclient_mock, entry, exp_date):  # noqa: F811
    _mock_server(aioclient_mock, user_info={"user_info": {**USER_INFO["user_info"], "exp_date": exp_date}})
    assert await async_setup_component(hass, "http", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_expiration_day_is_an_event(hass, aioclient_mock, entry):  # noqa: F811
    expires = dt_util.utcnow() + timedelta(days=10)
    await _setup_with(hass, aioclient_mock, entry, str(int(expires.timestamp())))
    state = hass.states.get(CALENDAR)
    day = dt_util.as_local(expires).date()
    assert state.state == "off"
    assert state.attributes["message"] == "provider.example expires"
    assert state.attributes["all_day"] is True
    assert state.attributes["start_time"].startswith(day.isoformat())

    start = dt_util.start_of_local_day(day - timedelta(days=1))
    result = await hass.services.async_call(
        CALENDAR_DOMAIN,
        "get_events",
        {"entity_id": CALENDAR, "start_date_time": start, "end_date_time": start + timedelta(days=3)},
        blocking=True,
        return_response=True,
    )
    [event] = result[CALENDAR]["events"]
    assert (event["start"], event["end"]) == (day.isoformat(), (day + timedelta(days=1)).isoformat())
    # Outside the range asked: nothing.
    result = await hass.services.async_call(
        CALENDAR_DOMAIN,
        "get_events",
        {
            "entity_id": CALENDAR,
            "start_date_time": start + timedelta(days=5),
            "end_date_time": start + timedelta(days=6),
        },
        blocking=True,
        return_response=True,
    )
    assert result[CALENDAR]["events"] == []


async def test_no_event_for_an_unlimited_subscription(hass, aioclient_mock, entry):  # noqa: F811
    await _setup_with(hass, aioclient_mock, entry, None)
    state = hass.states.get(CALENDAR)
    assert state.state == "off"
    assert "message" not in state.attributes
