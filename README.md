<img src="custom_components/iptv_xtream/brand/icon.png" alt="" width="96" align="right">

# IPTV Xtream for Home Assistant

[![HACS Badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-iptv/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-iptv/actions/workflows/hacs.yml)
[![Hassfest](https://github.com/juju35/ha-iptv/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-iptv/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-iptv)](https://github.com/juju35/ha-iptv/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Home Assistant integration and Lovelace card that track an **IPTV subscription** using the **Xtream Codes API**: status, expiration date, days left, number of live channels, movies and series, and connections.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv&category=integration)

![iptv-card](https://raw.githubusercontent.com/juju35/ha-iptv/main/screenshots/card.png)

## Features

- **Home Assistant integration** (UI setup, no YAML): one device per Xtream account with sensors you can use in automations
- **Lovelace card bundled with the integration**, loaded automatically (no resource to add)
- Subscription status (Active, Expired, Banned, Disabled, invalid credentials) with color coding
- Expiration date, days left and a progress bar since the subscription started
- Number of live channels, movies (VOD) and series
- Active / maximum connections, trial badge
- Orange warning when the subscription expires soon (configurable)
- Visual editor, refresh button
- Fully compatible with Home Assistant dark mode
- English and French, auto-detected

Home Assistant queries the Xtream server itself, so it works even when the server is plain `http://` without CORS headers or is only reachable from your network. Only a small summary is stored: the full channel, movie and series lists never reach the browser.

## Installation

Requires Home Assistant 2025.2 or newer.

### Via HACS (recommended)

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv&category=integration)

Or manually:

1. Open HACS → **⋮** → **Custom repositories**
2. Add `https://github.com/juju35/ha-iptv` — Type: **Integration**
3. Search for **IPTV Xtream** and download it
4. Restart Home Assistant

### Manual

1. Download `iptv_xtream.zip` from the [latest release](https://github.com/juju35/ha-iptv/releases/latest)
2. Unzip it into `/config/custom_components/iptv_xtream/`
3. Restart Home Assistant

## Setup

[![Add the integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=iptv_xtream)

**Settings → Devices & services → Add integration → IPTV Xtream**, then enter:

| Field | Description |
|---|---|
| Xtream server URL | Including the port, e.g. `http://your-server:8080` |
| Username | Xtream username |
| Password | Xtream password |

The credentials are checked before the account is added. Add the integration once per account. The URL and credentials can be changed later with **⋮ → Reconfigure**, and the refresh interval (default 60 minutes, minimum 5) with **Configure**.

## Entities

Each account is a device named `<username> @ <server>`, with these entities. `<account>` below is that name as an entity id, e.g. `sensor.john_myserver_com_status` for `john @ myserver.com`; entity names follow your Home Assistant language.

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

## Card

The card is available in the card picker as **IPTV Subscription Card**, with a visual editor. With a single account no option is needed:

```yaml
type: custom:iptv-card
```

### Options reference

| Option | Required | Default | Description |
|---|---|---|---|
| `device` | ❌ | First IPTV Xtream device | Device of the account to show (pick it in the visual editor) |
| `title` | ❌ | Auto (i18n) | Card title |
| `warning_days` | ❌ | `7` | Turns orange when fewer days than this are left |
| `language` | ❌ | Auto | Force language: `en` or `fr` (auto-detects from HA settings) |

The ⟳ button asks the integration to query the server right away.

## Upgrading from 1.x (shell_command)

Version 2.0 replaces the `shell_command` with a real integration, and the repository was renamed from `ha-iptv-card` to `ha-iptv`:

1. In HACS, remove the old **IPTV Subscription Card** (Dashboard), then the old `https://github.com/juju35/ha-iptv-card` custom repository, and the `/hacsfiles/ha-iptv-card/iptv-card.js` or `/local/iptv-card.js` resource if it is still listed in **Settings → Dashboards → Resources**
2. Add `https://github.com/juju35/ha-iptv` as an **Integration** custom repository, install **IPTV Xtream**, restart and add your account
3. Remove `iptv_xtream:` from `shell_command:` in `configuration.yaml`
4. In your cards, remove `url`, `username`, `password`, `refresh_interval` and `service`: the card now reads the integration entities

## How it works

The integration polls the Xtream Codes `player_api.php` endpoint for the account info (`user_info`) and the live, VOD and series lists (`get_live_streams`, `get_vod_streams`, `get_series`, fetched in parallel) and keeps only their sizes. The card is served by the integration at `/iptv_xtream/iptv-card.js` and loaded on every dashboard.

## Removal

Delete the account in **Settings → Devices & services → IPTV Xtream**, then remove the integration in HACS and restart. Remove the cards from your dashboards first, or they will show a "no subscription found" message.

## Security notes

- The credentials are stored in Home Assistant's config entries, not in the dashboard configuration: people who can edit a dashboard no longer see the password.
- They are only sent to the Xtream server you configured, as `player_api.php` query parameters (that is how the Xtream API works, so prefer an `https://` URL when your provider offers one).

## Translations

The integration and the card auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)
