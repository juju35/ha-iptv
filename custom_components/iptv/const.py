"""Constants for the IPTV integration."""

DOMAIN = "iptv"
VERSION = "3.21.0"

CONF_SCAN_INTERVAL = "scan_interval"
DEFAULT_SCAN_INTERVAL = 60  # minutes
MIN_SCAN_INTERVAL = 5
MAX_SCAN_INTERVAL = 1440

# Persistent notification this many days before expiration (0 = off)
CONF_NOTIFY_DAYS = "notify_days"
DEFAULT_NOTIFY_DAYS = 7
MAX_NOTIFY_DAYS = 60

# Health check: account info only, every few minutes
CONF_HEALTH_INTERVAL = "health_interval"
DEFAULT_HEALTH_INTERVAL = 5  # minutes
MIN_HEALTH_INTERVAL = 1
MAX_HEALTH_INTERVAL = 60
HEALTH_SLOW_MS = 3000  # slower answers are "degraded"
HEALTH_OK = "ok"
HEALTH_DEGRADED = "degraded"
HEALTH_AUTH_FAILED = "auth_failed"
HEALTH_UNREACHABLE = "unreachable"
HEALTH_STREAM_KO = "stream_ko"
HEALTH_STATES = [
    HEALTH_OK,
    HEALTH_DEGRADED,
    HEALTH_AUTH_FAILED,
    HEALTH_UNREACHABLE,
    HEALTH_STREAM_KO,
]

# Probe a channel's video stream during the health check (uses a connection slot)
CONF_STREAM_CHECK = "stream_check"
DEFAULT_STREAM_CHECK = True

# Provider type and its credentials
CONF_PROVIDER = "provider"
CONF_MAC = "mac"
# Add form only, not stored: notify service that receives the connection details
CONF_NOTIFY_SERVICE = "notify_service"
# Stored in the entry data: when the account was added / last updated (ISO 8601)
CONF_ADDED_AT = "added_at"
CONF_UPDATED_AT = "updated_at"
PROVIDER_XTREAM = "xtream"
PROVIDER_STALKER = "stalker"

CARD_URL = f"/{DOMAIN}/iptv-card.js"
LOGO_URL = f"/{DOMAIN}/logo.png"

# Sidebar panel (administrators only); its own path, so it never shadows the files under /iptv/
PANEL_URL = f"/{DOMAIN}/iptv-panel.js"
PANEL_PATH = f"{DOMAIN}-config"

STATUSES = ["active", "expired", "banned", "disabled", "invalid_auth"]
