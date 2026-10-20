# Changelog

## Unreleased

### 🐛 Fixes

- The card is now added to **Settings → Dashboards → Resources** when the integration is set up (and kept up to date on upgrades), so it shows up in the card picker without adding anything by hand. It is removed with the last account. Dashboards whose resources are managed in YAML still get the card loaded on every page.

## v2.0.1

### 🐛 Fixes

- Clicking an item of the card (status, expiration, channels, movies, series, connections) now opens the details of the matching entity, with its history.

## v2.0.0

**IPTV Xtream is now a real Home Assistant integration.** The `shell_command` is gone: Home Assistant queries your Xtream server itself, and the card is installed with the integration.

### ⚠️ Breaking changes

- The repository is now a HACS **Integration** (it was a Dashboard plugin) and was renamed from `ha-iptv-card` to `ha-iptv`.
- The card no longer takes `url`, `username`, `password`, `refresh_interval` or `service`: it reads the entities of the integration.
- `shell_command.iptv_xtream` is no longer used.

### ✨ New

- **Setup from the UI**: Settings → Devices & services → Add integration → IPTV Xtream. The credentials are checked before the account is added, and can be changed later with *Reconfigure*.
- **One device per account** with sensors you can use in automations: status, expiration, days left, live channels, movies, series, active and max connections, subscription start and trial.
- **Refresh interval** set in the integration options (60 minutes by default, minimum 5).
- **Card bundled and loaded automatically**: no dashboard resource to add. With one account, `type: custom:iptv-card` is enough; with several, pick the account in the visual editor.
- The ⟳ button of the card asks the integration to query the server right away.
- The password is no longer stored in the dashboard configuration.
- English and French translations for the integration and its entities.

### 🔁 Upgrading from 1.x

1. In HACS, remove the **IPTV Subscription Card** and the old `https://github.com/juju35/ha-iptv-card` custom repository, and the old card resource in Settings → Dashboards → Resources if it is still listed.
2. Add `https://github.com/juju35/ha-iptv` as an **Integration** custom repository, install **IPTV Xtream** and restart Home Assistant.
3. Add your account in Settings → Devices & services.
4. Remove `iptv_xtream:` from `shell_command:` in `configuration.yaml`.
5. In your cards, remove `url`, `username`, `password`, `refresh_interval` and `service`.

Requires Home Assistant 2025.2 or newer.

## v1.1.0

- Movie (VOD) and series counts next to live channels.

## v1.0.0

- First release: Lovelace card showing the status, expiration and live channel count of an Xtream Codes subscription, through `shell_command.iptv_xtream`.
