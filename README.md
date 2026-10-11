# ha-iptv-card

[![HACS Badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-iptv-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-iptv-card/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Custom Lovelace card for Home Assistant that tracks an **IPTV subscription** using the **Xtream Codes API**: status, expiration date, days left, number of live channels, movies and series, and connections.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv-card&category=plugin)

![iptv-card](https://raw.githubusercontent.com/juju35/ha-iptv-card/main/screenshots/card.png)

## Features

- Subscription status (Active, Expired, Banned, Disabled, invalid credentials) with color coding
- Expiration date, days left and a progress bar since the subscription started
- Number of live channels, movies (VOD) and series
- Active / maximum connections, trial badge
- Orange warning when the subscription expires soon (configurable)
- Visual editor, refresh button, automatic refresh
- Fully compatible with Home Assistant dark mode
- English and French, auto-detected
- HACS-ready, single file, no external dependencies

## Requirements

Xtream servers are usually plain `http://` and do not send CORS headers, so a browser cannot call them directly from a dashboard (especially one served over HTTPS). The card asks Home Assistant to query the API **server-side** through a `shell_command`, which returns only a small JSON summary (the full channel, movie and series lists never reach the browser).

Add this to your `configuration.yaml` under `shell_command:` (create the key if it does not exist):

```yaml
shell_command:
  iptv_xtream: >-
    python3 -c "import sys,json,urllib.request as u,urllib.parse as p,concurrent.futures as c;b=sys.argv[1].strip().rstrip('/');q=b+'/player_api.php?'+p.urlencode({'username':sys.argv[2],'password':sys.argv[3]});g=lambda a='':json.loads(u.urlopen(u.Request(q+a,headers={'User-Agent':'Mozilla/5.0'}),timeout=50).read().decode('utf-8','replace'));n=lambda a:(lambda r:len(r) if isinstance(r,list) else None)(g('&action='+a));i=g();ui=i.get('user_info') or {};ok=str(ui.get('auth'))=='1';x=c.ThreadPoolExecutor(3);f=[x.submit(n,a) for a in ('get_live_streams','get_vod_streams','get_series')] if ok else [];r=[None if k.exception() else k.result() for k in f] if ok else [None]*3;print(json.dumps({'auth':ok,'status':ui.get('status'),'exp_date':ui.get('exp_date'),'created_at':ui.get('created_at'),'is_trial':ui.get('is_trial'),'active_cons':ui.get('active_cons'),'max_connections':ui.get('max_connections'),'channels':r[0],'movies':r[1],'series':r[2]}))" {{ url | to_json }} {{ username | to_json }} {{ password | to_json }}
```

Then reload it: **Developer tools → YAML → Shell commands** (or restart Home Assistant if `shell_command:` is new in your configuration).

You can test it in **Developer tools → Actions**:

```yaml
action: shell_command.iptv_xtream
data:
  url: http://your-server:port
  username: your_username
  password: your_password
```

The response should look like:

```json
{"auth": true, "status": "Active", "exp_date": "1804458284", "created_at": "1767333333", "is_trial": "0", "active_cons": "1", "max_connections": "1", "channels": 9831, "movies": 54089, "series": 20571}
```

## Installation

### Via HACS (recommended)

Click the button below to add the repository directly:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-iptv-card&category=plugin)

Or manually:

1. Open HACS → **Frontend** → **⋮** → **Custom repositories**
2. Add `https://github.com/juju35/ha-iptv-card` — Category: **Lovelace**
3. Search for **IPTV Subscription Card** and install it
4. Clear your browser cache and refresh

### Manual

1. Download `dist/iptv-card.js` from the [latest release](https://github.com/juju35/ha-iptv-card/releases/latest)
2. Copy it to `/config/www/iptv-card.js`
3. Go to **Settings → Dashboards → Resources** → Add resource:
   - URL: `/local/iptv-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

The card is available in the card picker as **IPTV Subscription Card**, with a visual editor.

### Minimal

```yaml
type: custom:iptv-card
url: http://your-server:port
username: your_username
password: your_password
```

### Full options

```yaml
type: custom:iptv-card
title: IPTV
url: http://your-server:port
username: your_username
password: your_password
refresh_interval: 60
warning_days: 7
language: en
service: shell_command.iptv_xtream
```

### Options reference

| Option | Required | Default | Description |
|---|---|---|---|
| `url` | ✅ | — | Xtream server URL, including the port if any |
| `username` | ✅ | — | Xtream username |
| `password` | ✅ | — | Xtream password |
| `title` | ❌ | Auto (i18n) | Card title |
| `refresh_interval` | ❌ | `60` | Refresh interval in minutes (minimum 5) |
| `warning_days` | ❌ | `7` | Turns orange when fewer days than this are left |
| `language` | ❌ | Auto | Force language: `en` or `fr` (auto-detects from HA settings) |
| `service` | ❌ | `shell_command.iptv_xtream` | Action to call, if you named the shell command differently |

## How it works

The card calls `shell_command.iptv_xtream` over the Home Assistant WebSocket API with `return_response`. The command queries the Xtream Codes `player_api.php` endpoint for the account info (`user_info`) and the live, VOD and series lists (`get_live_streams`, `get_vod_streams`, `get_series`, fetched in parallel), and returns:

| Field | Meaning |
|---|---|
| `auth` | Credentials accepted |
| `status` | `Active`, `Expired`, `Banned`, `Disabled` |
| `exp_date` / `created_at` | Unix timestamps (`exp_date` is empty for unlimited accounts) |
| `active_cons` / `max_connections` | Current and maximum simultaneous connections |
| `is_trial` | `1` for a trial account |
| `channels` | Number of live channels |
| `movies` | Number of movies (VOD) |
| `series` | Number of series |

Results are cached in the browser for `refresh_interval` minutes and shared between cards with the same server and username. The ⟳ button forces a refresh.

## Security notes

- The password is stored in the dashboard configuration, like any card that takes credentials: anyone allowed to edit that dashboard can read it.
- The shell command passes its arguments directly to Python (no shell), so values entered in the card cannot inject shell commands.

## Upgrading from 1.0.0

Version 1.1.0 adds movie and series counts, which needs the updated `shell_command` above. Replace your `iptv_xtream` command with the new one and reload shell commands. With the old command the card still works and shows `—` for movies and series.

## Translations

The card auto-detects the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)
