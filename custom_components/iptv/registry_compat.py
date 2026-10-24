"""Device registry calls that work before and after Home Assistant 2026.8.

2026.8 gives a device a single config entry (`DeviceEntry.config_entry_id`) and deprecates
`DeviceEntry.config_entries` and `DeviceRegistry.async_get_device` (removed from 2027.8-2027.10). The
minimum version in hacs.json predates the new API, so each helper uses the one the running
version has. Detection looks at the class, never at the deprecated attribute: reading it is
what reports the deprecation.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr


def get_device(registry: dr.DeviceRegistry, identifier: tuple[str, str], config_entry_id: str) -> dr.DeviceEntry | None:
    """The device with this identifier (2026.8+: the one owned by the config entry)."""
    if hasattr(type(registry), "async_get_device_by_identifier"):
        return registry.async_get_device_by_identifier(identifier, config_entry_id)
    return registry.async_get_device(identifiers={identifier})


def entry_for_device(hass: HomeAssistant, device_id: str, domain: str) -> ConfigEntry | None:
    """The config entry of `domain` that owns the device, if any.

    Uses the helper of the newer releases when present (it also resolves a device id from
    before the 2026.8 split), else the device's config entry or entries.
    """
    if hasattr(dr, "async_get_device_and_config_entry_for_domain"):
        return dr.async_get_device_and_config_entry_for_domain(hass, device_id, domain=domain)[1]
    device = dr.async_get(hass).async_get(device_id)
    if device is None:
        return None
    if hasattr(type(device), "config_entry_id"):
        entry_ids = {device.config_entry_id}
    else:
        entry_ids = device.config_entries
    for entry_id in entry_ids:
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry and entry.domain == domain:
            return entry
    return None
