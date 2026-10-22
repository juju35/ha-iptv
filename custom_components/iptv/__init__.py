"""IPTV integration: subscription sensors and the bundled Lovelace card."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import CARD_URL, DOMAIN, LOGO_URL, VERSION
from .coordinator import IptvConfigEntry, IptvCoordinator
from .health import HealthMonitor
from .migrate import LEGACY_DOMAIN, async_migrate_legacy, async_restore_snapshot
from .notify_expiry import ExpiryNotifier, notification_id

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the card and its logo, and load the card on every dashboard."""
    base = Path(__file__).parent
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(CARD_URL, str(base / "frontend" / "iptv-card.js"), True),
            StaticPathConfig(LOGO_URL, str(base / "brand" / "icon@2x.png"), True),
        ]
    )

    async def _register(_: Event | None = None) -> None:
        if not await _async_register_resource(hass):
            # Dashboard resources in YAML mode: load the card on every page instead
            add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")

    if hass.state is CoreState.running:
        await _register()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register)

    # Accounts created before 3.0 under the former iptv_xtream domain
    await async_migrate_legacy(hass)
    return True


def _storage_resources(hass: HomeAssistant) -> Any | None:
    """Return the dashboard resources collection when it is editable from the UI."""
    lovelace = hass.data.get("lovelace")
    if getattr(lovelace, "resource_mode", None) != "storage":
        return None
    return getattr(lovelace, "resources", None)


async def _async_register_resource(hass: HomeAssistant) -> bool:
    """Add or update the card in Settings → Dashboards → Resources."""
    resources = _storage_resources(hass)
    if resources is None:
        return False
    url = f"{CARD_URL}?v={VERSION}"
    try:
        await resources.async_get_info()  # loads the collection from storage
        for item in list(resources.async_items()):
            if item.get("url", "").startswith(f"/{LEGACY_DOMAIN}/"):
                await resources.async_delete_item(item["id"])
        existing = [
            item
            for item in resources.async_items()
            if item.get("url", "").split("?")[0] == CARD_URL
        ]
        if not existing:
            await resources.async_create_item({"res_type": "module", "url": url})
            return True
        if existing[0]["url"] != url:
            await resources.async_update_item(
                existing[0]["id"], {"res_type": "module", "url": url}
            )
        for duplicate in existing[1:]:
            await resources.async_delete_item(duplicate["id"])
    except Exception:  # noqa: BLE001 - never block the integration on the card
        _LOGGER.exception("Could not register the IPTV card as a dashboard resource")
        return False
    return True


async def async_setup_entry(hass: HomeAssistant, entry: IptvConfigEntry) -> bool:
    """Set up one IPTV account."""
    coordinator = IptvCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    coordinator.health = HealthMonitor(hass, coordinator)
    entry.async_on_unload(coordinator.health.async_start())

    notifier = ExpiryNotifier(hass, entry.entry_id, entry.title, dict(entry.options))
    notifier.update(coordinator.data)
    entry.async_on_unload(
        coordinator.async_add_listener(lambda: notifier.update(coordinator.data))
    )
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await async_restore_snapshot(hass, entry)
    entry.async_create_background_task(
        hass, coordinator.health.async_check_now(), f"{DOMAIN} first health check"
    )
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: IptvConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: IptvConfigEntry) -> None:
    """Drop the account notification, and the card resource with the last account."""
    persistent_notification.async_dismiss(hass, notification_id(entry.entry_id))
    if hass.config_entries.async_entries(DOMAIN):
        return
    if (resources := _storage_resources(hass)) is None:
        return
    for item in list(resources.async_items()):
        if item.get("url", "").split("?")[0] == CARD_URL:
            await resources.async_delete_item(item["id"])


async def _async_reload(hass: HomeAssistant, entry: IptvConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
