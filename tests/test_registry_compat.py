"""registry_compat on both device registry APIs, with fakes (the real one depends on the HA version)."""

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from custom_components.iptv import registry_compat
from custom_components.iptv.const import DOMAIN
from custom_components.iptv.registry_compat import entry_for_device, get_device


class NewDevice:
    """2026.8+ device: one config entry; reading the deprecated set is an error here.

    Slots like the real attrs class, so config_entry_id is a class attribute too.
    """

    __slots__ = ("config_entry_id", "id")

    def __init__(self, entry_id: str) -> None:
        self.id = "dev"
        self.config_entry_id = entry_id

    @property
    def config_entries(self) -> set[str]:
        raise AssertionError("deprecated DeviceEntry.config_entries read")


class OldDevice:
    """Pre-2026.8 device: a set of config entries, no config_entry_id."""

    def __init__(self, *entry_ids: str) -> None:
        self.id = "dev"
        self.config_entries = set(entry_ids)


class OldRegistry:
    """Pre-2026.8 registry: no async_get_device_by_identifier."""

    def __init__(self, device=None) -> None:
        self.device = device
        self.calls: list[tuple] = []

    def async_get(self, device_id):
        return self.device if self.device and self.device.id == device_id else None

    def async_get_device(self, **kwargs):
        self.calls.append(("async_get_device", kwargs))
        return "found"


class NewRegistry(OldRegistry):
    """2026.8+ registry: calling the deprecated lookup is an error here."""

    def async_get_device(self, **kwargs):
        raise AssertionError("deprecated DeviceRegistry.async_get_device called")

    def async_get_device_by_identifier(self, identifier, config_entry_id):
        self.calls.append(("async_get_device_by_identifier", identifier, config_entry_id))
        return "found"


ENTRIES = {
    "other": SimpleNamespace(entry_id="other", domain="hue"),
    "mine": SimpleNamespace(entry_id="mine", domain=DOMAIN),
}


def _hass():
    return SimpleNamespace(config_entries=SimpleNamespace(async_get_entry=ENTRIES.get))


def test_new_api_get_device():
    registry = NewRegistry()
    assert get_device(registry, (DOMAIN, "x"), "a") == "found"
    assert registry.calls == [("async_get_device_by_identifier", (DOMAIN, "x"), "a")]


def test_old_api_get_device():
    registry = OldRegistry()
    assert get_device(registry, (DOMAIN, "x"), "a") == "found"
    assert registry.calls == [("async_get_device", {"identifiers": {(DOMAIN, "x")}})]


def test_domain_helper_used_when_present():
    """With async_get_device_and_config_entry_for_domain, nothing else of the registry is read."""
    calls = []

    def helper(hass, device_id, *, domain):
        calls.append((device_id, domain))
        return NewDevice("mine"), ENTRIES["mine"]

    with (
        patch.object(registry_compat.dr, "async_get_device_and_config_entry_for_domain", helper, create=True),
        patch.object(registry_compat.dr, "async_get", side_effect=AssertionError("registry read")),
    ):
        assert entry_for_device(_hass(), "dev", DOMAIN) is ENTRIES["mine"]
    assert calls == [("dev", DOMAIN)]


@pytest.mark.parametrize(
    ("device", "expected"),
    [
        (NewDevice("mine"), "mine"),
        (NewDevice("other"), None),
        (OldDevice("other", "mine"), "mine"),
        (OldDevice("other"), None),
        (None, None),
    ],
)
def test_entry_for_device_without_domain_helper(device, expected):
    """2026.8 (config_entry_id, no domain helper yet) and older releases (config_entries)."""
    with patch.object(registry_compat, "dr", SimpleNamespace(async_get=lambda hass: NewRegistry(device))):
        entry = entry_for_device(_hass(), "dev", DOMAIN)
    assert (entry.entry_id if entry else None) == expected
