# Changelog

## 3.13.2

### Maintenance
- Internal clean-up, no functional change: the shared add/edit checks (French lists, stream, catalogue counts) are factored into `validate_catalogue` instead of being duplicated in the config flow and the services; the card de-duplicates its HTML escaping, service calls and popup creation into helpers.

## 3.13.1

### Fixes
- When a provider has no connection limit, the connections tile is hidden instead of showing "—"; the grid keeps its fourth column empty so the tiles stay aligned with the other subscriptions.

## 3.13.0

### What's new
- Adding or editing an account also checks that the channel / movie / series counts look like a real catalogue; an empty provider is refused (`empty_catalogue`).
- New 👁 button on each subscription: a popup shows the server URL and username / password (or MAC) with a copy-to-clipboard button for each value. Backed by the `iptv.get_credentials` service.

### Changes
- More space between the view / edit / delete buttons on each subscription.

## 3.12.0

### What's new
- Manage accounts straight from the card: the **+** button in the header adds a new account (provider type, then credentials or MAC), the 🗑 button on each subscription removes it after a confirmation. Adding runs the same checks as the UI (credentials, French lists, video stream).
- New `iptv.add_account` and `iptv.remove_account` services behind these buttons (alongside `iptv.edit_account`).

## 3.11.0

### What's new
- Edit an account's credentials or MAC address from the card: the ✎ button on each subscription opens a popup with the server URL and username / password (or MAC) pre-filled (never the password). Saving runs the same checks as adding an account — credentials, French lists and video stream — and refuses the change if any fails. New `iptv.edit_account` service backs it.
- The native **Reconfigure** flow (Settings → Devices & services) now runs those same checks too.

## 3.10.0

### What's new
- Video stream check: the health check can open a real channel briefly to confirm it plays (Xtream and Stalker). On failure the health sensor reports `stream_ko` and the card pill turns red. The health sensor gains `stream_ok` and `stream_channel` attributes.
- Adding an account is refused when the test channel's video stream does not play.
- New **Test a channel's video stream** option (Configure, on by default) to enable or disable the periodic stream check per account. Opening a stream uses one of the account's connection slots, so disable it on accounts limited to a single connection if it interferes.

## 3.9.0

### Fixes
- The card no longer reserves empty space beneath it: its grid height follows the content (`rows: auto`) instead of a fixed estimate that was too large for the compact layout.

### Changes
- Slightly tighter layout (smaller paddings and tiles), for a shorter card.

## 3.8.0

### Changes
- More compact card: expiration date and days left share one line, the four tiles (channels, movies, series, connections) are a single row of icon + number with the label kept as a tooltip, and paddings are tighter. About 25 % shorter with two subscriptions; the last health check stays visible.

## 3.7.0

### Fixes
- The card no longer ends up empty when its configured `device` / `devices` no longer exist (e.g. after removing and re-adding an account, which changes the device id): it falls back to showing every subscription. A configuration that still matches at least one subscription is left untouched.

## 3.6.0

### What's new
- The date and time of the action are stored when an account is added (`added_at`) and each time its credentials change — same-server update or reconfigure (`updated_at`). Two diagnostic timestamp sensors expose them: `sensor.<account>_added` and `sensor.<account>_updated`.
- New `sensor.<account>_last_check` (timestamp) with the moment of the last health check, also shown on the card under each subscription.

## 3.5.0

### Changes
- An account is now named after its server (the host of the URL, e.g. `myserver.com`) instead of `<username> @ <server>`. Accounts added earlier are renamed on upgrade, unless you had renamed them yourself; the device name drives the card section titles.

## 3.4.0

### What's new
- Optional **Send the connection details to** field in the add form (Xtream and Stalker): the chosen notify service receives the provider, server URL, username / password or MAC address, expiration and French category counts once the account is added, or when an existing account on the same server takes the new credentials. Not stored; a failing or missing service never blocks the account.

## 3.3.0

### What's new
- French lists check: on each refresh the live, VOD and series categories are read and those that look French are counted, by marker (`FR`, `FRANCE`, `VF`, `VOSTFR`, 🇫🇷…) or as a category well known in French lists (TF1, M6, Canal+, Ciné+, Arte, BFM, Ligue 1…, Séries, Cinéma, Dessins animés…). New `binary_sensor.<account>_french_lists` with the counts per kind and a few examples.
- Adding an account is refused when the provider has no French list, or when its categories cannot be read.
- The card shows a French flag pill per subscription: **FR** (green) or **No FR** (red).

## 3.2.0

### What's new
- Health check per account: every 5 minutes (**Configure → Health check interval**), only the account info is requested and its response time measured. New `sensor.<account>_health` (`ok`, `degraded` above 3 s, `auth_failed`, `unreachable`) with `response_time_ms`, `last_check` and `error` attributes, and `sensor.<account>_response_time` (diagnostic).
- The health sensor stays available when the server is down, and a check that finds the server back refreshes the account data right away.
- The card shows a health pill next to the status (Online · response time, Slow, Unreachable); ⟳ also runs a health check.

## 3.1.0

### What's new
- Adding an account on a server that is already configured (same host and port) no longer creates a second account: once the new credentials are checked, they replace those of the existing account if the new one is valid longer (later expiration, unlimited, or the existing one no longer works). Same device and entities; a renamed title is kept. Otherwise nothing changes.

## 3.0.0

### Breaking changes
- The integration is renamed from **IPTV Xtream** (`iptv_xtream`) to **IPTV** (`iptv`): it handles Xtream Codes and Stalker portals. The card is now served at `/iptv/iptv-card.js` and the release asset is `iptv.zip`.

### What's new
- Migration from `iptv_xtream`: **Add integration → IPTV** moves the existing accounts (data, options, title) and keeps their entity ids, entity names and icons, device name and area. Old device ids are replaced by the new ones in UI-managed dashboards, and the old card resource and notifications are removed.
- Stalker devices show "Stalker portal" as manufacturer instead of "Xtream Codes".

## 2.5.0

### What's new
- Persistent notification when a subscription expires within a configurable number of days (**Configure → Notify before expiration**, 7 by default, `0` to disable), one per account.
- The notification is refreshed once a day while in that window, also reports an expired subscription, and is dismissed when the subscription is renewed or the account is removed.

## 2.4.1

### Fixes
- Stalker accounts show the expiration bar again. Without a start date, the card assumes the shortest usual subscription length (1, 3, 6 or 12 months, then whole years) that covers the days left.

## 2.4.0

### What's new
- **Stalker / Ministra portals** are supported alongside Xtream Codes: add an account with a portal URL and a MAC address. The provider type is chosen when adding the integration.
- The portal path (`/portal.php`, `/stalker_portal/server/load.php`, `/c/portal.php`) is detected automatically via the STB handshake.
- Stalker accounts expose status, expiration, days left and the live / VOD / series counts; the start date, connections and trial flag are not provided by the protocol and show as `—`.

### Changes
- Config flow starts with a provider menu (Xtream Codes / Stalker). Existing Xtream accounts are untouched and keep working.
- Screenshot mock data is fully anonymised; the multi-provider screenshot now shows a Stalker account next to an Xtream one.

## 2.3.0

### What's new
- The card shows several subscriptions: one section per provider, named after its device, with its own status pills, expiration and tiles.
- New `devices` option (multiple device picker in the visual editor) to choose which subscriptions to show and in which order; without it, every IPTV Xtream subscription is shown.
- The ⟳ button refreshes every shown subscription; the default title becomes "IPTV subscriptions" when there are several.

### Changes
- A card without `device` used to show only the first subscription found: it now shows all of them. The `device` option is still read when `devices` is not set; with a single subscription the card looks the same as before.

## 2.2.1

### Fixes
- The card header shows the integration logo instead of a generic icon; the integration serves it at `/iptv_xtream/logo.png`.

## 2.2.0

### Changes
- More compact layout with the same information, like the other ha-* cards: 12 px card padding, 36 px header icon, 16 px name and 12 px subtitle, 11 px pills, tighter tiles and sections.
- The four tiles (channels, movies, series, connections) on one row instead of two, figure next to the icon and label underneath; 4 px expiration bar.

## 2.1.1

### Maintenance
- CHANGELOG headings use the same plain English set as the other ha-* repositories.

## 2.1.0

### What's new
- Header shared with the other cards: 40 px icon tinted by the subscription status, 18 px name, status and trial as pills under the name.
- Colours follow the theme (`success`, `warning`, `error`) with Home Assistant's defaults as fallback, tints with `color-mix`.
- Tiles, labels and numbers use the same sizes as the other cards; sections view support (`getGridOptions`).

### Maintenance
- Pushing a new version to `main` publishes the release with `iptv_xtream.zip`; release notes can be rewritten with the **Update release notes** workflow.
- Merged branches are deleted by the **Clean up branches** workflow.
- README follows the same plan as the other repositories.

## 2.0.3

### Maintenance
- Python bytecode (`__pycache__`) is no longer shipped with the integration.
- `python scripts/screenshots.py` renders the README screenshot with a mock subscription.

## 2.0.2

### Fixes
- The card is now added to **Settings → Dashboards → Resources** when the integration is set up (and kept up to date on upgrades), so it shows up in the card picker without adding anything by hand. It is removed with the last account. Dashboards whose resources are managed in YAML still get the card loaded on every page.

## 2.0.1

### Fixes
- Clicking an item of the card (status, expiration, channels, movies, series, connections) now opens the details of the matching entity, with its history.

## 2.0.0

**IPTV Xtream is now a real Home Assistant integration.** The `shell_command` is gone: Home Assistant queries your Xtream server itself, and the card is installed with the integration.

### Breaking changes
- The repository is now a HACS **Integration** (it was a Dashboard plugin) and was renamed from `ha-iptv-card` to `ha-iptv`.
- The card no longer takes `url`, `username`, `password`, `refresh_interval` or `service`: it reads the entities of the integration.
- `shell_command.iptv_xtream` is no longer used.

### What's new
- **Setup from the UI**: Settings → Devices & services → Add integration → IPTV Xtream. The credentials are checked before the account is added, and can be changed later with *Reconfigure*.
- **One device per account** with sensors you can use in automations: status, expiration, days left, live channels, movies, series, active and max connections, subscription start and trial.
- **Refresh interval** set in the integration options (60 minutes by default, minimum 5).
- **Card bundled and loaded automatically**: no dashboard resource to add. With one account, `type: custom:iptv-card` is enough; with several, pick the account in the visual editor.
- The ⟳ button of the card asks the integration to query the server right away.
- The password is no longer stored in the dashboard configuration.
- English and French translations for the integration and its entities.

### Upgrading from 1.x
1. In HACS, remove the **IPTV Subscription Card** and the old `https://github.com/juju35/ha-iptv-card` custom repository, and the old card resource in Settings → Dashboards → Resources if it is still listed.
2. Add `https://github.com/juju35/ha-iptv` as an **Integration** custom repository, install **IPTV Xtream** and restart Home Assistant.
3. Add your account in Settings → Devices & services.
4. Remove `iptv_xtream:` from `shell_command:` in `configuration.yaml`.
5. In your cards, remove `url`, `username`, `password`, `refresh_interval` and `service`.

Requires Home Assistant 2025.2 or newer.

## 1.1.0

- Movie (VOD) and series counts next to live channels.

## 1.0.0

- First release: Lovelace card showing the status, expiration and live channel count of an Xtream Codes subscription, through `shell_command.iptv_xtream`.
