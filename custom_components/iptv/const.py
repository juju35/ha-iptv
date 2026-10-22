"""Constants for the IPTV integration."""

DOMAIN = "iptv"
VERSION = "3.2.0"

CONF_SCAN_INTERVAL = "scan_interval"
DEFAULT_SCAN_INTERVAL = 60  # minutes
MIN_SCAN_INTERVAL = 5

# Persistent notification this many days before expiration (0 = off)
CONF_NOTIFY_DAYS = "notify_days"
DEFAULT_NOTIFY_DAYS = 7

# Health check: account info only, every few minutes
CONF_HEALTH_INTERVAL = "health_interval"
DEFAULT_HEALTH_INTERVAL = 5  # minutes
HEALTH_SLOW_MS = 3000  # slower answers are "degraded"
HEALTH_OK = "ok"
HEALTH_DEGRADED = "degraded"
HEALTH_AUTH_FAILED = "auth_failed"
HEALTH_UNREACHABLE = "unreachable"
HEALTH_STATES = [HEALTH_OK, HEALTH_DEGRADED, HEALTH_AUTH_FAILED, HEALTH_UNREACHABLE]

# Provider type and its credentials
CONF_PROVIDER = "provider"
CONF_MAC = "mac"
PROVIDER_XTREAM = "xtream"
PROVIDER_STALKER = "stalker"
PROVIDERS = [PROVIDER_XTREAM, PROVIDER_STALKER]

CARD_URL = f"/{DOMAIN}/iptv-card.js"
LOGO_URL = f"/{DOMAIN}/logo.png"

STATUSES = ["active", "expired", "banned", "disabled", "invalid_auth"]
