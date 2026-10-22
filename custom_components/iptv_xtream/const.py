"""Constants for the IPTV Xtream integration."""

DOMAIN = "iptv_xtream"
VERSION = "2.3.0"

CONF_SCAN_INTERVAL = "scan_interval"
DEFAULT_SCAN_INTERVAL = 60  # minutes
MIN_SCAN_INTERVAL = 5

CARD_URL = f"/{DOMAIN}/iptv-card.js"
LOGO_URL = f"/{DOMAIN}/logo.png"

STATUSES = ["active", "expired", "banned", "disabled", "invalid_auth"]
