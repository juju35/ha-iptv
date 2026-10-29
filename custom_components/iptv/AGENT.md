# IPTV Integration — Agent Context

## Purpose
Home Assistant custom integration that tracks one or several IPTV subscriptions, through the Xtream Codes API (username / password) or a Stalker / Ministra portal (MAC address): status, expiration, days left, live channels / movies / series counts, connections, health.
Ships its own Lovelace card (`frontend/iptv-card.js`), served by the integration itself. Domain `iptv`, formerly `iptv_xtream`.

## Architecture

```
custom_components/iptv/
├── __init__.py        # Setup, card and logo static paths, dashboard resource, platforms
├── api.py             # Clients for the supported providers (Xtream Codes, Stalker portal)
├── coordinator.py     # DataUpdateCoordinator, one per account
├── entity.py          # Base entity: one device per account
├── sensor.py          # Subscription sensors (status, expiration, days left, counts, connections)
├── binary_sensor.py   # Subscription binary sensors
├── health.py          # Lightweight health check of one account (reachability, response time, optional stream)
├── naming.py          # Automatic account title: the server name
├── notify_add.py      # Sends the connection details of a new account to a notify service
├── notify_expiry.py   # Persistent notification before the subscription expires
├── panel.py           # Sidebar panel registration and its admin WebSocket commands
│                      # iptv/accounts, iptv/update_account, iptv/check_account
├── services.py        # iptv.add_account / edit_account / remove_account / get_credentials services,
│                      # and the card's admin WebSocket commands iptv/add_account, edit_account, get_credentials
├── registry_compat.py # Device registry calls for HA before / since 2026.8 (single config entry per device)
├── migrate.py         # Moves accounts of the former iptv_xtream domain to iptv
├── config_flow.py     # Xtream Codes or Stalker portal, options
├── const.py           # Constants, VERSION (card cache-buster), CARD_URL / LOGO_URL
├── icons.json         # Entity and service icons
├── services.yaml / translations/{en,fr,de,es}.json
├── brand/             # Integration icon and logo
├── frontend/iptv-card.js   # Vanilla JS cards (iptv-card, iptv-mini-card), no dependencies
└── frontend/iptv-panel.js  # Vanilla JS sidebar panel (iptv-panel), embeds iptv-card
```

## Card
- Served from `/iptv/iptv-card.js` (the integration logo is still served at `/iptv/logo.png`, the card no longer uses it) and added to the Lovelace resources at startup, URL versioned with `VERSION`. Removing the last account deletes the resource; `async_setup_entry` adds it again (`CARD_LOADED` flag in `hass.data`) when an account is added later without a restart. Falls back to `add_extra_js_url` when resources are in YAML mode. `_storage_resources()` reads the mode from the `hass.data["lovelace"]` dataclass, whose `mode` field became `resource_mode` in Home Assistant 2026.2.
- Popups (add, edit, confirmation) open at the top of the card, like the other ha-* cards.
- Header icon (both cards): `mdi:television-play` in a round `.badge` (40 px, 32 px on the mini card) tinted with the worst state of the subscriptions shown (`iptvWorstState`: error, warning, ok; idle when there are none).
- `iptv-mini-card` (`IptvMiniCard extends IptvCard`, same file): two lines (badge, title, global status pill; one chip per subscription), detail button (`zoom`, default true) rendering the full card's `_render()`, collapsed by an outside click (capture-phase document listener) except in a dialog or while a popup (`_modal`) is open, like ha-zoraxy and ha-room-card. Each element is defined under its own `customElements.get` guard, so an older copy already loaded on the page doesn't hide the mini card.
- Add, view and edit go through the admin WebSocket commands (`hass.callWS({type: 'iptv/…'})`), never `callService`: a service call fires a `call_service` event with its raw data, which the recorder stores, password included. Remove still uses the `iptv.remove_account` service (no secret). The services stay for automations, with a recorder warning in the README and service descriptions.

## Sidebar panel
- Registered in `async_setup` (`panel_custom`, `require_admin`) at `/iptv-config` — its own path, not `/iptv`, so the frontend's panel route never shadows the files served under `/iptv/`. Module served from `/iptv/iptv-panel.js?v=VERSION`; `IPTV_PANEL_VERSION` is bumped with the others.
- The panel imports the card and embeds `iptv-card` for the account list and add / view / edit / remove (no duplicated code: jscpd is blocking), and adds a settings form per account through `iptv/accounts` (no password), `iptv/update_account` (title first: renamed in place, then options: one reload; blank title = `auto_title`; same limits as the options flow via the `MIN_* / MAX_*` constants) and `iptv/check_account` (refresh + `health.async_check_now`, or a reload when the entry is not loaded). Credentials block per account: login from `iptv/accounts`; the Xtream password is fetched with `iptv/get_credentials` (device id) only on show / copy, kept in `_secrets` while shown, dropped on hide and on disconnect. It follows `config_entries/subscribe` to reload the list when an account changes; drafts survive re-renders, and typing only refreshes the buttons.

## Health check
- A Stalker client runs one operation at a time (asyncio lock; the coordinator and the health check share its token). The health latency is measured by the client once it holds the lock (`user_info_ms`), a tick is skipped while the previous check still runs, and the stream probe is skipped when the slots are all in use or, with unknown occupancy (Stalker), while a refresh holds or waits for the client (`busy`).

## Renaming
- The update listener reloads only on an options change. A title change renames the device (`async_update_device`) and the expiration notification in place, without a reload.
- Reconfigure / reauth update the entry and call `async_schedule_reload` themselves, not `async_update_reload_and_abort`: HA reports that helper for an entry with an update listener (breaks in 2026.12).

## Device registry
- Always go through `registry_compat.py` (`get_device`, `entry_for_device`), never `async_get_device` or `DeviceEntry.config_entries` directly. HA 2026.8 gives a device one config entry (`config_entry_id`, lookups by `async_get_device_by_identifier(identifier, entry_id)`, `async_get_device_and_config_entry_for_domain`) and reports the old calls (reading `config_entries` reports since 2026.10); hacs.json still allows 2025.6, so the helpers pick the API by `hasattr` on the class / module, never by reading the deprecated attribute.

## Tests
`pip install -r requirements_test.txt && pytest` (job `tests`, Python 3.14 = latest Home Assistant; HA 2026.3+ needs Python 3.14); job `pytest-min-ha` runs the suite on HA 2025.6. An autouse fixture (`tests/conftest.py`, `no_deprecated_calls`) fails any test during which Home Assistant reports a deprecated call naming `iptv`, and CI turns those reports into annotations; `tests/test_registry_compat.py` covers both registry APIs with fakes.

## Release
HACS installs `custom_components/iptv/` from the release tag (hacs.json has no `zip_release`); `iptv.zip` is attached to the release for manual installation. Bump the version in manifest.json, const.py (`VERSION`) and `IPTV_CARD_VERSION` in the card, add the CHANGELOG.md section, and push to main: the Release workflow publishes `vX.Y.Z` (tag, notes from the CHANGELOG, `iptv.zip`) when that tag doesn't exist yet, and fails if the three versions differ.
