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
├── services.py        # iptv.add_account / edit_account / remove_account / get_credentials
├── migrate.py         # Moves accounts of the former iptv_xtream domain to iptv
├── config_flow.py     # Xtream Codes or Stalker portal, options
├── const.py           # Constants, VERSION (card cache-buster), CARD_URL / LOGO_URL
├── icons.json         # Entity and service icons
├── services.yaml / translations/{en,fr}.json
├── brand/             # Integration icon and logo
└── frontend/iptv-card.js   # Vanilla JS card, no dependencies
```

## Card
- Served from `/iptv/iptv-card.js` (logo from `/iptv/logo.png`) and added to the Lovelace resources at startup, URL versioned with `VERSION`. Falls back to `add_extra_js_url` when resources are in YAML mode.
- Popups (add, edit, confirmation) open at the top of the card, like the other ha-* cards.

## Release
HACS installs `iptv.zip` from the release. Bump the version in manifest.json, const.py (`VERSION`) and `IPTV_CARD_VERSION` in the card, add the CHANGELOG.md section, and push to main: the Release workflow publishes `vX.Y.Z` (tag, notes from the CHANGELOG, `iptv.zip`) when that tag doesn't exist yet, and fails if the three versions differ.
