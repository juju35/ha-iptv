"""Migration of the former ``iptv_xtream`` accounts to ``iptv`` (versions before 3.0)."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.iptv.const import DOMAIN
from custom_components.iptv.migrate import (
    LEGACY_DOMAIN,
    PENDING,
    _async_replace_in_dashboards,
    _replace,
    async_migrate_legacy,
)

from .test_init import DATA, SERVER, USERNAME, _mock_server

UNIQUE = f"{SERVER}|{USERNAME}".lower()


def _dashboard(config, mode="storage", load_error=None, save_error=None):
    return SimpleNamespace(
        mode=mode,
        async_load=AsyncMock(side_effect=load_error, return_value=config),
        async_save=AsyncMock(side_effect=save_error),
    )


def test_replace_swaps_exact_values_only():
    mapping = {"old": "new"}
    node = {"a": "old", "b": ["x", "old", {"c": "old"}], "d": "older", "e": 3}
    out, changed = _replace(node, mapping)
    assert changed is True
    assert out == {"a": "new", "b": ["x", "new", {"c": "new"}], "d": "older", "e": 3}
    assert _replace({"a": ["x"], "b": None}, mapping) == ({"a": ["x"], "b": None}, False)


async def test_dashboards_device_ids_replaced_in_storage_mode_only(hass, caplog):
    storage = _dashboard({"views": [{"cards": [{"type": "custom:iptv-card", "device_id": "old"}]}]})
    untouched = _dashboard({"views": [{"cards": [{"type": "entities"}]}]})
    yaml_mode = _dashboard({"device_id": "old"}, mode="yaml")
    empty = _dashboard(None, load_error=ValueError("no config"))
    failing = _dashboard({"device_id": "old"}, save_error=OSError("read-only"))
    hass.data["lovelace"] = SimpleNamespace(
        dashboards={"a": storage, "b": untouched, "c": yaml_mode, "d": empty, "e": failing}
    )
    await _async_replace_in_dashboards(hass, {"old": "new"})
    storage.async_save.assert_awaited_once_with({"views": [{"cards": [{"type": "custom:iptv-card", "device_id": "new"}]}]})
    untouched.async_save.assert_not_awaited()
    yaml_mode.async_load.assert_not_awaited()
    empty.async_save.assert_not_awaited()
    failing.async_save.assert_awaited_once()
    assert "Could not update the IPTV device ids in a dashboard" in caplog.text


async def test_dashboards_without_lovelace(hass):
    """No dashboards loaded (no lovelace data): nothing to do, no error."""
    hass.data.pop("lovelace", None)
    await _async_replace_in_dashboards(hass, {"old": "new"})


async def test_no_legacy_entry(hass):
    assert await async_migrate_legacy(hass) == 0
    assert PENDING not in hass.data


async def test_legacy_entry_moved_with_its_registry_details(hass, aioclient_mock, tmp_path, monkeypatch):
    """The account comes back under ``iptv`` with its entity ids, names, icons, device name and area."""
    legacy = MockConfigEntry(domain=LEGACY_DOMAIN, title="provider.example", data=DATA, unique_id=UNIQUE)
    legacy.add_to_hass(hass)
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    old_device = dev_reg.async_get_or_create(
        config_entry_id=legacy.entry_id, identifiers={(LEGACY_DOMAIN, legacy.entry_id)}, name="provider.example"
    )
    dev_reg.async_update_device(old_device.id, name_by_user="Living room IPTV", area_id="living_room")
    ent_reg.async_get_or_create(
        "sensor",
        LEGACY_DOMAIN,
        f"{legacy.entry_id}_status",
        config_entry=legacy,
        device_id=old_device.id,
        suggested_object_id="my_iptv_status",
    )
    ent_reg.async_update_entity("sensor.my_iptv_status", name="My status", icon="mdi:television")
    replaced = []

    async def replace(_hass, mapping):
        replaced.append(mapping)

    monkeypatch.setattr("custom_components.iptv.migrate._async_replace_in_dashboards", replace)
    notes = []
    monkeypatch.setattr(
        "custom_components.iptv.migrate.persistent_notification.async_create",
        lambda _hass, message, **kw: notes.append((message, kw)),
    )
    # The old custom_components/iptv_xtream folder is still there: a notification asks to delete it.
    (tmp_path / "custom_components" / LEGACY_DOMAIN).mkdir(parents=True)
    monkeypatch.setattr(hass.config, "config_dir", str(tmp_path))

    _mock_server(aioclient_mock)
    assert await async_setup_component(hass, "http", {})
    assert await async_migrate_legacy(hass) == 1
    await hass.async_block_till_done()

    assert not hass.config_entries.async_entries(LEGACY_DOMAIN)
    [new] = hass.config_entries.async_entries(DOMAIN)
    assert new.unique_id == UNIQUE
    assert dict(new.data) == DATA
    assert hass.data[PENDING] == {}
    status = ent_reg.async_get("sensor.my_iptv_status")
    assert status is not None
    assert status.platform == DOMAIN
    assert status.unique_id == f"{new.entry_id}_status"
    assert (status.name, status.icon) == ("My status", "mdi:television")
    [device] = dr.async_entries_for_config_entry(dev_reg, new.entry_id)
    assert (device.name_by_user, device.area_id) == ("Living room IPTV", "living_room")
    # The old device id is swapped for the new one in the dashboards.
    assert replaced == [{old_device.id: device.id}]
    [(message, kw)] = notes
    assert f"custom_components/{LEGACY_DOMAIN}" in message
    assert kw["notification_id"] == f"{DOMAIN}_legacy_folder"
