"""Move accounts of the former ``iptv_xtream`` domain to ``iptv``.

Before 3.0 the integration was called ``iptv_xtream``. Home Assistant only loads
``iptv`` once it has an entry, so the migration runs from the "Add integration"
flow (and again at startup, for leftovers). Every ``iptv_xtream`` config entry is
removed and re-created under ``iptv`` with the same data, options and title. The
entity ids, entity names and icons, the device name and area are carried over,
and the old device ids are replaced by the new ones in UI-managed dashboards, so
automations, history and cards keep working.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

LEGACY_DOMAIN = "iptv_xtream"
# hass.data key: { config entry unique_id: snapshot of the legacy entry }
PENDING = f"{DOMAIN}_legacy_snapshots"
# Entity registry fields carried over to the new entities
ENTITY_FIELDS = ("name", "icon", "area_id", "hidden_by", "disabled_by", "labels")
DEVICE_FIELDS = ("name_by_user", "area_id", "disabled_by", "labels")


async def async_migrate_legacy(hass: HomeAssistant) -> int:
    """Remove the legacy entries, start an import flow for each, return their count."""
    legacy = hass.config_entries.async_entries(LEGACY_DOMAIN)
    if not legacy:
        return 0
    pending: dict[str, dict[str, Any]] = hass.data.setdefault(PENDING, {})
    for old in legacy:
        snapshot = _snapshot(hass, old)
        key = old.unique_id or old.entry_id
        # Remove first so the entity ids are free for the new entities
        await hass.config_entries.async_remove(old.entry_id)
        persistent_notification.async_dismiss(hass, f"{LEGACY_DOMAIN}_expiring_{old.entry_id}")
        pending[key] = snapshot
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": SOURCE_IMPORT},
                data={
                    "unique_id": key,
                    "title": old.title,
                    "data": dict(old.data),
                    "options": dict(old.options),
                },
            ),
            f"{DOMAIN} import of {old.title}",
        )
        _LOGGER.info("Migrating IPTV entry %s from %s to %s", old.entry_id, LEGACY_DOMAIN, DOMAIN)

    old_folder = Path(hass.config.path("custom_components", LEGACY_DOMAIN))
    if await hass.async_add_executor_job(old_folder.exists):
        persistent_notification.async_create(
            hass,
            f"{len(legacy)} IPTV account(s) moved from `{LEGACY_DOMAIN}` to `{DOMAIN}`. "
            f"Delete the old `custom_components/{LEGACY_DOMAIN}` folder and restart "
            "Home Assistant.",
            title="IPTV: integration renamed",
            notification_id=f"{DOMAIN}_legacy_folder",
        )
    return len(legacy)


def _snapshot(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Registry details of a legacy entry, keyed like the new unique ids."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    prefix = f"{entry.entry_id}_"
    entities = {
        e.unique_id.removeprefix(prefix): {"entity_id": e.entity_id} | {f: getattr(e, f) for f in ENTITY_FIELDS}
        for e in er.async_entries_for_config_entry(ent_reg, entry.entry_id)
    }
    devices = dr.async_entries_for_config_entry(dev_reg, entry.entry_id)
    device = {"id": devices[0].id} | {f: getattr(devices[0], f) for f in DEVICE_FIELDS} if devices else None
    return {"entities": entities, "device": device}


async def async_restore_snapshot(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Apply the legacy registry details to the entities of a migrated entry."""
    snapshot = hass.data.get(PENDING, {}).pop(entry.unique_id or "", None)
    if not snapshot:
        return
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    prefix = f"{entry.entry_id}_"
    for new in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
        old = snapshot["entities"].get(new.unique_id.removeprefix(prefix))
        if not old:
            continue
        changes = {f: old[f] for f in ENTITY_FIELDS if old[f] != getattr(new, f)}
        if old["entity_id"] != new.entity_id and not ent_reg.async_get(old["entity_id"]):
            changes["new_entity_id"] = old["entity_id"]
        if changes:
            ent_reg.async_update_entity(new.entity_id, **changes)

    old_device = snapshot["device"]
    devices = dr.async_entries_for_config_entry(dev_reg, entry.entry_id)
    if not old_device or not devices:
        return
    device = devices[0]
    changes = {f: old_device[f] for f in DEVICE_FIELDS if old_device[f] != getattr(device, f)}
    if changes:
        dev_reg.async_update_device(device.id, **changes)
    await _async_replace_in_dashboards(hass, {old_device["id"]: device.id})


def _replace(node: Any, mapping: dict[str, str]) -> tuple[Any, bool]:
    """Replace exact string values found in ``mapping``, recursively."""
    if isinstance(node, str):
        return (mapping[node], True) if node in mapping else (node, False)
    if isinstance(node, list):
        out = [_replace(v, mapping) for v in node]
        return [v for v, _ in out], any(c for _, c in out)
    if isinstance(node, dict):
        out = {k: _replace(v, mapping) for k, v in node.items()}
        return {k: v for k, (v, _) in out.items()}, any(c for _, c in out.values())
    return node, False


async def _async_replace_in_dashboards(hass: HomeAssistant, mapping: dict[str, str]) -> None:
    """Swap old device ids for new ones in UI-managed dashboards."""
    lovelace = hass.data.get("lovelace")
    dashboards = getattr(lovelace, "dashboards", None) or {}
    for dashboard in list(dashboards.values()):
        if getattr(dashboard, "mode", None) != "storage":
            continue
        try:
            config = await dashboard.async_load(False)
        except Exception:  # noqa: BLE001 - empty or auto-generated dashboard
            continue
        new_config, changed = _replace(config, mapping)
        if changed:
            try:
                await dashboard.async_save(new_config)
            except Exception:  # noqa: BLE001 - never block the integration on a dashboard
                _LOGGER.exception("Could not update the IPTV device ids in a dashboard")
