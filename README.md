<img src="custom_components/iptv/brand/icon.png" alt="" width="96" align="right">

# ha-iptv

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-iptv/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-iptv/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-iptv/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-iptv/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-iptv)](https://github.com/juju35/ha-iptv/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Home Assistant integration and Lovelace card that track one or several **IPTV subscriptions** using the **Xtream Codes API** or a **Stalker / Ministra portal** (MAC address): status, expiration date, days left, number of live channels, movies and series, and connections.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv&category=integration)

## Features

- **Two provider types**: Xtream Codes (username / password) and Stalker / Ministra portal (MAC address)
- **Home Assistant integration** (UI setup, no YAML): one device per account with sensors you can use in automations
- **Lovelace card bundled with the integration**, added automatically to the dashboard resources (nothing to add by hand)
- Subscription status (Active, Expired, Banned, Disabled, invalid credentials) with color coding
- Expiration date, days left and a progress bar since the subscription started (estimated on Stalker portals)
- Number of live channels, movies (VOD) and series
- Active / maximum connections, trial badge
- Several providers in one card, one section per subscription
- Orange warning when the subscription expires soon (configurable)
- Persistent notification a configurable number of days before expiration (7 by default)
- Visual editor, refresh button
- Fully compatible with Home Assistant dark mode
- English and French, auto-detected

Home Assistant queries the Xtream server itself, so it works even when the server is plain `http://` without CORS headers or is only reachable from your network. Only a small summary is stored: the full channel, movie and series lists never reach the browser.

## Prerequisites

- Home Assistant 2025.2 or newer
- An IPTV subscription with **Xtream Codes API** access (server URL, username and password), **or** a **Stalker / Ministra portal** (portal URL and a registered MAC address)

## Installation

### Via HACS (recommended)

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv&category=integration)

Or manually:

1. Open HACS → **⋮** → **Custom repositories**
2. Add `https://github.com/juju35/ha-iptv` — Type: **Integration**
3. Search for **IPTV** and download it
4. Restart Home Assistant

### Manual

1. Download `iptv.zip` from the [latest release](https://github.com/juju35/ha-iptv/releases/latest)
2. Unzip it into `/config/custom_components/iptv/`
3. Restart Home Assistant

### Upgrading from 2.x (IPTV Xtream)

Version 3.0 renames the integration from **IPTV Xtream** (`iptv_xtream`) to **IPTV** (`iptv`), since it handles Stalker portals too. Your accounts are moved over with the same entity ids, so automations, history and statistics keep working:

1. Update the integration in HACS and restart Home Assistant
2. **Settings → Devices & services → Add integration → IPTV** (or the button below): the existing accounts are moved and the flow closes with "N account(s) moved"

   [![Add the integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=iptv)
3. If `/config/custom_components/iptv_xtream/` is still there, delete it and restart

The data, options (refresh interval, notification delay), entity ids, entity names and icons, device name and area are carried over. The device ids change: they are replaced automatically in UI-managed dashboards (`device` / `devices` card options); update them by hand in YAML dashboards and in device-based automations.

### Upgrading from 1.x (shell_command)

Version 2.0 replaces the `shell_command` with a real integration, and the repository was renamed from `ha-iptv-card` to `ha-iptv`:

1. In HACS, remove the old **IPTV Subscription Card** (Dashboard), then the old `https://github.com/juju35/ha-iptv-card` custom repository, and the `/hacsfiles/ha-iptv-card/iptv-card.js` or `/local/iptv-card.js` resource if it is still listed in **Settings → Dashboards → Resources**
2. Add `https://github.com/juju35/ha-iptv` as an **Integration** custom repository, install **IPTV**, restart and add your account
3. Remove `iptv_xtream:` from `shell_command:` in `configuration.yaml`
4. In your cards, remove `url`, `username`, `password`, `refresh_interval` and `service`: the card now reads the integration entities

### Removal

Delete the account in **Settings → Devices & services → IPTV**, then remove the integration in HACS and restart. Deleting the last account also removes the card resource. Remove the cards from your dashboards first, or they will show a "no subscription found" message.

## Configuration

[![Add the integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=iptv)

**Settings → Devices & services → Add integration → IPTV**, then choose the provider type.

**Xtream Codes** (username / password):

| Field | Description |
|---|---|
| Xtream server URL | Including the port, e.g. `http://your-server:8080` |
| Username | Xtream username |
| Password | Xtream password |

**Stalker / Ministra** (MAC address):

| Field | Description |
|---|---|
| Portal URL | Including the port, e.g. `http://your-portal:80` (the portal path like `/c/` or `/portal.php` is found automatically) |
| MAC address | The MAC registered with the provider, format `AA:BB:CC:DD:EE:FF` |

The credentials are checked before the account is added, and stored in the config entry together with the server URL (username / password, or MAC address).

**Same server already configured** (same host and port): the new credentials are checked, then compared with the account already on that server. When the new account is valid longer (later expiration, unlimited, or the existing one no longer works), the existing account takes the new username / password or MAC address and is reloaded: same device, same entities, and its title is kept if you renamed it. Otherwise nothing changes and the flow says which account is valid longer. With several accounts on the server, the one valid the shortest is the one compared. Add the integration once per account; both provider types can live side by side and share the same card. The URL and credentials can be changed later with **⋮ → Reconfigure**, and with **Configure**:

| Option | Default | Description |
|---|---|---|
| Refresh interval | `60` min | How often the server is queried (minimum 5) |
| Notify before expiration | `7` days | Persistent notification when the subscription expires within this many days, `0` to disable |

The notification names the account and its expiration date, is refreshed once a day while the account is in that window (dismissing it silences it until the next day), also reports an expired account, and disappears once the subscription is renewed.

> **Stalker portals** do not expose a start date, the connection counts or the trial flag, so those are shown as `—` (the expiration progress bar then assumes the shortest usual subscription length, 1, 3, 6 or 12 months, that covers the days left). Expiration and the live / VOD / series counts are read from the portal's `account_info` and `get_ordered_list` endpoints.

### Entities

Each account is a device named `<username> @ <server>` (Xtream) or `<mac> @ <portal>` (Stalker), with these entities. On a Stalker portal the start date, connection and trial entities stay `unknown`. `<account>` below is that name as an entity id, e.g. `sensor.john_myserver_com_status` for `john @ myserver.com`; entity names follow your Home Assistant language.

| Entity | Description |
|---|---|
| `sensor.<account>_status` | `active`, `expired`, `banned`, `disabled` or `invalid_auth` |
| `sensor.<account>_expiration` | Expiration date (unknown for unlimited accounts) |
| `sensor.<account>_days_left` | Days left before expiration |
| `sensor.<account>_live_channels` | Number of live channels |
| `sensor.<account>_movies` | Number of movies (VOD) |
| `sensor.<account>_series` | Number of series |
| `sensor.<account>_active_connections` | Current connections |
| `sensor.<account>_max_connections` | Maximum simultaneous connections (diagnostic) |
| `sensor.<account>_created` | Subscription start date (diagnostic) |
| `binary_sensor.<account>_trial` | On for a trial account (diagnostic) |

Example automation, a reminder 7 days before expiration:

```yaml
triggers:
  - trigger: numeric_state
    entity_id: sensor.my_account_days_left
    below: 8
actions:
  - action: notify.notify
    data:
      message: "IPTV subscription expires in {{ states('sensor.my_account_days_left') }} days"
```

### Card

The card is available in the card picker as **IPTV Subscription Card**, with a visual editor. With no option it shows every IPTV subscription, one section per provider named after its device (rename the device to change it):

```yaml
type: custom:iptv-card
```

To show only some subscriptions, in a given order, list their devices (pick them in the visual editor):

```yaml
type: custom:iptv-card
devices:
  - 0123456789abcdef0123456789abcdef
  - fedcba9876543210fedcba9876543210
```

#### Options reference

| Option | Required | Default | Description |
|---|---|---|---|
| `devices` | ❌ | All IPTV devices | Devices of the accounts to show, in this order (pick them in the visual editor) |
| `device` | ❌ | — | Legacy single-device option, still read when `devices` is not set |
| `title` | ❌ | Auto (i18n) | Card title |
| `warning_days` | ❌ | `7` | Turns orange when fewer days than this are left |
| `language` | ❌ | Auto | Force language: `en` or `fr` (auto-detects from HA settings) |

The ⟳ button asks the integration to query every shown server right away.

## Screenshots

![iptv-card](https://raw.githubusercontent.com/juju35/ha-iptv/main/screenshots/card.png)

![iptv-card with two providers](https://raw.githubusercontent.com/juju35/ha-iptv/main/screenshots/card-multi.png)

## How it works

For **Xtream Codes**, the integration polls the `player_api.php` endpoint for the account info (`user_info`) and the live, VOD and series lists (`get_live_streams`, `get_vod_streams`, `get_series`, fetched in parallel) and keeps only their sizes.

For a **Stalker / Ministra portal**, it performs the STB handshake with the MAC to get a session token, then reads `account_info/get_main_info` for the expiration and `itv` / `vod` / `series` `get_ordered_list` for the catalogue sizes. Only the summary is kept, never the channel lists.

The card is served by the integration at `/iptv/iptv-card.js` and registered in **Settings → Dashboards → Resources** when the integration starts (with YAML-managed resources, it is loaded on every page instead).

### Security notes

- The credentials are stored in Home Assistant's config entries, not in the dashboard configuration: people who can edit a dashboard no longer see the password.
- They are only sent to the Xtream server you configured, as `player_api.php` query parameters (that is how the Xtream API works, so prefer an `https://` URL when your provider offers one).

## Development

```bash
pip install playwright && playwright install chromium
python scripts/screenshots.py   # renders screenshots/card.png and card-multi.png with mock subscriptions
```

The card is plain JavaScript (`custom_components/iptv/frontend/iptv-card.js`), served by the integration: no build step.

### Releasing

1. Bump the version in `custom_components/iptv/manifest.json`, `VERSION` in `const.py` and `IPTV_CARD_VERSION` in `frontend/iptv-card.js`
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow creates the tag and the GitHub release with `iptv.zip` and the changelog section as notes

## Translations

The integration and the card auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)
