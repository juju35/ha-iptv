"""Constants for the IPTV integration."""

DOMAIN = "iptv_xtream"
VERSION = "2.4.0"

CONF_SCAN_INTERVAL = "scan_interval"
DEFAULT_SCAN_INTERVAL = 60  # minutes
MIN_SCAN_INTERVAL = 5

# Provider type and its credentials
CONF_PROVIDER = "provider"
CONF_MAC = "mac"
PROVIDER_XTREAM = "xtream"
PROVIDER_STALKER = "stalker"
PROVIDERS = [PROVIDER_XTREAM, PROVIDER_STALKER]

CARD_URL = f"/{DOMAIN}/iptv-card.js"
LOGO_URL = f"/{DOMAIN}/logo.png"

STATUSES = ["active", "expired", "banned", "disabled", "invalid_auth"]
