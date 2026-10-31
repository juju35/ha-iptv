"""Render the IPTV card, mini card and sidebar panel with mock subscriptions and save the README screenshots.

Usage: python scripts/screenshots.py  (needs `pip install playwright` and `playwright install chromium`)
The clock is frozen so the days left stay the same. Every shot is in English, with 16 px of theme
background around the card (full card 460 px wide, mini card 380 px, 460 px zoomed in).
"""

import os
import subprocess
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CARD_JS = (ROOT / "custom_components/iptv/frontend/iptv-card.js").read_text()
PANEL_JS = (ROOT / "custom_components/iptv/frontend/iptv-panel.js").read_text()
PANEL_WIDTH = 1100
NOW = "2026-10-10T09:00:00+02:00"
WIDTH = 460  # full card, and the mini card zoomed in
MINI_WIDTH = 380

THEMES = {
    "light": {
        "--primary-background-color": "#e8eaed",
        "--secondary-background-color": "#ececec",
        "--card-background-color": "#ffffff",
        "--primary-text-color": "#212121",
        "--secondary-text-color": "#727272",
        "--divider-color": "rgba(0,0,0,.12)",
    },
    "dark": {
        "--primary-background-color": "#111111",
        "--secondary-background-color": "#282828",
        "--card-background-color": "#1c1c1c",
        "--primary-text-color": "#e1e1e1",
        "--secondary-text-color": "#9b9b9b",
        "--divider-color": "rgba(225,225,225,.12)",
    },
}
COMMON = {
    "--primary-color": "#03a9f4",
    "--success-color": "#43a047",
    "--warning-color": "#ffa600",
    "--error-color": "#db4437",
}

# Material Design Icons paths used by the card (from @mdi/js).
ICONS = {
    "television-play": "M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7",
    "refresh": "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",
    "check-circle": "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
    "alert": "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
    "close-circle": "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z",
    "television-classic": "M8.16,3L6.75,4.41L9.34,7H4C2.89,7 2,7.89 2,9V19C2,20.11 2.89,21 4,21H20C21.11,21 22,20.11 22,19V9C22,7.89 21.11,7 20,7H14.66L17.25,4.41L15.84,3L12,6.84L8.16,3M4,9H17V19H4V9M19.5,9A1,1 0 0,1 20.5,10A1,1 0 0,1 19.5,11A1,1 0 0,1 18.5,10A1,1 0 0,1 19.5,9M19.5,12A1,1 0 0,1 20.5,13A1,1 0 0,1 19.5,14A1,1 0 0,1 18.5,13A1,1 0 0,1 19.5,12Z",
    "movie-open": "M20.84 2.18L16.91 2.96L19.65 6.5L21.62 6.1L20.84 2.18M13.97 3.54L12 3.93L14.75 7.46L16.71 7.07L13.97 3.54M9.07 4.5L7.1 4.91L9.85 8.44L11.81 8.05L9.07 4.5M4.16 5.5L3.18 5.69A2 2 0 0 0 1.61 8.04L2 10L6.9 9.03L4.16 5.5M2 10V20C2 21.11 2.9 22 4 22H20C21.11 22 22 21.11 22 20V10H2Z",
    "filmstrip-box-multiple": "M4,6H2V20A2,2 0 0,0 4,22H18V20H4V6M20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,15H18V13H20V15M20,11H18V9H20V11M20,7H18V5H20V7Z",
    "lan-connect": "M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M3,13V18L3,20H10V18H5V13H3M14,13C12.89,13 12,13.89 12,15V19C12,20.11 12.89,21 14,21H11V23H23V21H20C21.11,21 22,20.11 22,19V15C22,13.89 21.11,13 20,13H14M14,15H20V19H14V15Z",
    "speedometer-slow": "M12 16C13.66 16 15 14.66 15 13C15 11.88 14.39 10.9 13.5 10.39L3.79 4.77L9.32 14.35C9.82 15.33 10.83 16 12 16M12 3C10.19 3 8.5 3.5 7.03 4.32L9.13 5.53C10 5.19 11 5 12 5C16.42 5 20 8.58 20 13C20 15.21 19.11 17.21 17.66 18.65H17.65C17.26 19.04 17.26 19.67 17.65 20.06C18.04 20.45 18.68 20.45 19.07 20.07C20.88 18.26 22 15.76 22 13C22 7.5 17.5 3 12 3M2 13C2 15.76 3.12 18.26 4.93 20.07C5.32 20.45 5.95 20.45 6.34 20.06C6.73 19.67 6.73 19.04 6.34 18.65C4.89 17.2 4 15.21 4 13C4 12 4.19 11 4.54 10.1L3.33 8C2.5 9.5 2 11.18 2 13Z",
    "lan-disconnect": "M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M14,13C12.89,13 12,13.89 12,15V19C12,20.11 12.89,21 14,21H11V23H23V21H20C21.11,21 22,20.11 22,19V15C22,13.89 21.11,13 20,13H14M3.88,13.46L2.46,14.88L4.59,17L2.46,19.12L3.88,20.54L6,18.41L8.12,20.54L9.54,19.12L7.41,17L9.54,14.88L8.12,13.46L6,15.59L3.88,13.46M14,15H20V19H14V15Z",
    "trash-can-outline": "M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",
    "plus": "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
    "eye-outline": "M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z",
    "pencil": "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",
    "clock-outline": "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7H11V13L16.25,16.15L17,14.92L12.5,12.25V7Z",
    "arrow-expand": "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
    "arrow-collapse": "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
    "router-network": "M5,9H19A2,2 0 0,1 21,11V15A2,2 0 0,1 19,17H5A2,2 0 0,1 3,15V11A2,2 0 0,1 5,9M5,11V15H19V11H5M6,12H8V14H6V12M10,12H12V14H10V12M14,12H16V14H14V12M11,3H13V7H11V3Z",
    "account-key": "M11 10V12H9V14H7V12H5.8C5.4 13.2 4.3 14 3 14C1.3 14 0 12.7 0 11S1.3 8 3 8C4.3 8 5.4 8.8 5.8 10H11M3 10C2.4 10 2 10.4 2 11S2.4 12 3 12 4 11.6 4 11 3.6 10 3 10M16 14C18.7 14 24 15.3 24 18V20H8V18C8 15.3 13.3 14 16 14M16 12C13.8 12 12 10.2 12 8S13.8 4 16 4 20 5.8 20 8 18.2 12 16 12Z",
    "stethoscope": "M19,8C19.56,8 20,8.43 20,9A1,1 0 0,1 19,10C18.43,10 18,9.55 18,9C18,8.43 18.43,8 19,8M2,2V11C2,13.96 4.19,16.5 7.14,16.91C7.76,19.92 10.42,22 13.5,22A6.5,6.5 0 0,0 20,15.5V11.81C21.16,11.39 22,10.29 22,9A3,3 0 0,0 19,6A3,3 0 0,0 16,9C16,10.29 16.84,11.4 18,11.81V15.41C18,17.91 16,19.91 13.5,19.91C11.5,19.91 9.82,18.7 9.22,16.9C12,16.3 14,13.8 14,11V2H10V5H12V11A4,4 0 0,1 8,15A4,4 0 0,1 4,11V5H6V2H2Z",
    "content-save": "M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z",
    "devices": "M3,6H21V4H3C1.9,4 1,4.9 1,6V18A2,2 0 0,0 3,20H7V18H3V6M13,12H9V13.78C8.39,14.33 8,15.11 8,16C8,16.89 8.39,17.67 9,18.22V20H13V18.22C13.61,17.67 14,16.88 14,16C14,15.12 13.61,14.33 13,13.78V12M11,17.5A1.5,1.5 0 0,1 9.5,16A1.5,1.5 0 0,1 11,14.5A1.5,1.5 0 0,1 12.5,16A1.5,1.5 0 0,1 11,17.5M22,8H16A1,1 0 0,0 15,9V19A1,1 0 0,0 16,20H22A1,1 0 0,0 23,19V9A1,1 0 0,0 22,8M21,18H17V10H21V18Z",
    "cog": "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
    "content-copy": "M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z",
    "eye-off-outline": "M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z",
    "menu": "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
    "account-multiple": "M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z",
}

# Minimal stand-ins for Home Assistant's <ha-card> and <ha-icon>.
HA_ELEMENTS = (
    "const ICONS = "
    + __import__("json").dumps(ICONS)
    + ";"
    + """
customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});
customElements.define("ha-icon", class extends HTMLElement {
  static get observedAttributes() { return ["icon"]; }
  connectedCallback() { this._draw(); }
  attributeChangedCallback() { this._draw(); }
  _draw() {
    const path = ICONS[(this.getAttribute("icon") || "").replace("mdi:", "")] || "";
    this.style.display = "inline-flex";
    this.innerHTML = '<svg viewBox="0 0 24 24" style="width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);fill:currentColor"><path d="' + path + '"/></svg>';
  }
});
customElements.define("ha-switch", class extends HTMLElement {
  connectedCallback() {
    const on = this.hasAttribute("checked");
    this.style.cssText = "display:inline-block;width:36px;height:14px;border-radius:7px;position:relative;flex:none;" +
      "background:" + (on ? "color-mix(in srgb, var(--primary-color) 50%, transparent)" : "var(--divider-color)");
    this.innerHTML = '<span style="position:absolute;top:-3px;width:20px;height:20px;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.4);' +
      (on ? "right:-2px;background:var(--primary-color)" : "left:-2px;background:#fafafa") + '"></span>';
  }
});
customElements.define("ha-menu-button", class extends HTMLElement {
  connectedCallback() { this.style.display = "flex"; this.innerHTML = '<ha-icon icon="mdi:menu" style="padding:8px"></ha-icon>'; }
});"""
)

# Subscription devices: { device_id: (name, { translation_key: (domain, state) }) }.
# Fully anonymised mock data; no real provider, account or MAC appears here.
SUBSCRIPTIONS = {
    "iptv": (
        "Provider A",
        {
            "status": ("sensor", "active"),
            "expiration": ("sensor", "2027-03-07T00:00:00+00:00"),
            "created": ("sensor", "2026-03-07T00:00:00+00:00"),
            "trial": ("binary_sensor", "off"),
            "active_connections": ("sensor", "1"),
            "max_connections": ("sensor", "1"),
            "channels": ("sensor", "9831"),
            "movies": ("sensor", "54089"),
            "series": ("sensor", "20571"),
            "health": (
                "sensor",
                "ok",
                {"response_time_ms": 182, "last_check": "2026-10-10T08:57:00+02:00"},
            ),
            "french_lists": ("binary_sensor", "on"),
        },
    ),
    # A Stalker (MAC) account: no connection counts and no start date (the bar is estimated).
    "iptv2": (
        "Provider B",
        {
            "status": ("sensor", "active"),
            "expiration": ("sensor", "2026-10-29T00:00:00+00:00"),
            "created": ("sensor", "unknown"),
            "trial": ("binary_sensor", "off"),
            "active_connections": ("sensor", "unknown"),
            "max_connections": ("sensor", "unknown"),
            "channels": ("sensor", "4210"),
            "movies": ("sensor", "18342"),
            "series": ("sensor", "6125"),
            "health": (
                "sensor",
                "degraded",
                {"response_time_ms": 3420, "last_check": "2026-10-10T08:55:00+02:00"},
            ),
            "french_lists": ("binary_sensor", "off"),
        },
    ),
    # Shown by the mini card only: one account expiring within the warning delay, one expired.
    "iptv3": (
        "Provider C",
        {
            "status": ("sensor", "active"),
            "expiration": ("sensor", "2026-10-14T00:00:00+00:00"),
            "days_left": ("sensor", "4"),
            "created": ("sensor", "2026-09-14T00:00:00+00:00"),
            "active_connections": ("sensor", "0"),
            "max_connections": ("sensor", "2"),
            "channels": ("sensor", "7604"),
            "movies": ("sensor", "31270"),
            "series": ("sensor", "9488"),
            "health": ("sensor", "ok", {"response_time_ms": 240, "last_check": "2026-10-10T08:56:00+02:00"}),
            "french_lists": ("binary_sensor", "on"),
        },
    ),
    "iptv4": (
        "Provider D",
        {
            "status": ("sensor", "expired"),
            "expiration": ("sensor", "2026-10-02T00:00:00+00:00"),
            "days_left": ("sensor", "0"),
            "created": ("sensor", "2025-10-02T00:00:00+00:00"),
            "active_connections": ("sensor", "0"),
            "max_connections": ("sensor", "1"),
            "channels": ("sensor", "5122"),
            "movies": ("sensor", "12800"),
            "series": ("sensor", "3051"),
            "health": ("sensor", "ok", {"response_time_ms": 310, "last_check": "2026-10-10T08:54:00+02:00"}),
            "french_lists": ("binary_sensor", "on"),
        },
    ),
}
STATES, ENTITIES, DEVICES = {}, {}, {}
for device_id, (name, entities) in SUBSCRIPTIONS.items():
    DEVICES[device_id] = {"id": device_id, "name": name, "name_by_user": None}
    for key, (domain, value, *attrs) in entities.items():
        entity_id = f"{domain}.{device_id}_{key}"
        STATES[entity_id] = {
            "entity_id": entity_id,
            "state": value,
            "attributes": attrs[0] if attrs else {},
        }
        ENTITIES[entity_id] = {
            "entity_id": entity_id,
            "device_id": device_id,
            "platform": "iptv",
            "translation_key": key,
        }

SHOTS = [
    {"file": "card", "theme": "light", "config": {"devices": ["iptv"]}},
    {"file": "card-dark", "theme": "dark", "config": {"devices": ["iptv"]}},
    {"file": "card-multi", "theme": "light", "config": {"devices": ["iptv", "iptv2"]}},
    {"file": "card-multi-dark", "theme": "dark", "config": {"devices": ["iptv", "iptv2"]}},
    # The mini card, and the same card zoomed in (its detail button clicked).
    *[
        {
            "file": f"mini{suffix}{dark}",
            "theme": theme,
            "width": WIDTH if zoom else MINI_WIDTH,
            "tag": "iptv-mini-card",
            "zoom": zoom,
            "config": {"devices": ["iptv", "iptv3", "iptv4"]},
        }
        for suffix, zoom in (("", False), ("-zoom", True))
        for theme, dark in (("light", ""), ("dark", "-dark"))
    ],
]


# Accounts returned by the panel's iptv/accounts command (same anonymised providers as the cards).
PANEL_ACCOUNTS = [
    {
        "entry_id": "e1",
        "device_id": "iptv",
        "title": "Provider A",
        "auto_title": "provider-a.example",
        "provider": "xtream",
        "url": "http://provider-a.example:8080",
        "login": "user-a",
        "state": "loaded",
        "options": {"scan_interval": 60, "notify_days": 7, "health_interval": 5, "stream_check": True},
    },
    {
        "entry_id": "e2",
        "device_id": "iptv2",
        "title": "Provider B",
        "auto_title": "portal-b.example",
        "provider": "stalker",
        "url": "http://portal-b.example:80",
        "login": "00:1A:79:00:00:01",
        "state": "loaded",
        "options": {"scan_interval": 120, "notify_days": 14, "health_interval": 10, "stream_check": False},
    },
]
PANEL_SHOTS = [{"file": "panel", "theme": "light"}, {"file": "panel-dark", "theme": "dark"}]


def page_html(theme, width):
    variables = "".join(f"{k}:{v};" for k, v in {**THEMES[theme], **COMMON}.items())
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
  :root {{ {variables} }}
  body {{ margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: {width}px; }}
</style></head><body><div id="root"></div></body></html>"""


def mount(context, shot):
    """Open a fresh page (the card script declares top-level constants) and mount the card; return the page."""
    page = context.new_page()
    page.on("pageerror", lambda err: print(f"page error: {err}"))
    page.clock.set_fixed_time(NOW)
    width = shot.get("width", WIDTH)
    page.set_content(page_html(shot["theme"], width))
    page.add_script_tag(content=HA_ELEMENTS)
    page.add_script_tag(content=CARD_JS)
    page.evaluate(
        """({states, entities, devices, dark, config, tag, zoom}) => {
          const el = document.createElement(tag);
          el.setConfig({type: `custom:${tag}`, ...config});
          el.hass = {states, entities, devices, user: {is_admin: true}, language: "en", locale: {language: "en"}, themes: {darkMode: dark}, callService: () => Promise.resolve()};
          document.getElementById("root").appendChild(el);
          // A mouse click (detail: 1), so that no focus ring shows on the new button.
          if (zoom) el.shadowRoot.querySelector("button.zoom").dispatchEvent(new MouseEvent("click", {bubbles: true, composed: true, detail: 1}));
        }""",
        {
            "states": STATES,
            "entities": ENTITIES,
            "devices": DEVICES,
            "dark": shot["theme"] == "dark",
            "config": shot["config"],
            "tag": shot.get("tag", "iptv-card"),
            "zoom": shot.get("zoom", False),
        },
    )
    return page


def mount_panel(context, shot):
    """Open the sidebar panel with the two first subscriptions; return the page."""
    page = context.new_page()
    page.on("pageerror", lambda err: print(f"page error: {err}"))
    page.clock.set_fixed_time(NOW)
    page.set_viewport_size({"width": PANEL_WIDTH, "height": 1200})
    page.set_content(page_html(shot["theme"], PANEL_WIDTH).replace("padding: 16px;", "padding: 0;"))
    page.add_script_tag(content=HA_ELEMENTS)
    page.add_script_tag(content=CARD_JS)
    page.add_script_tag(content=PANEL_JS)
    shown = {"iptv", "iptv2"}
    page.evaluate(
        """({states, entities, devices, accounts, dark}) => {
          const el = document.createElement("iptv-panel");
          el.panel = {config: {}};
          el.narrow = false;
          el.hass = {states, entities, devices, user: {is_admin: true}, language: "en", locale: {language: "en"},
            themes: {darkMode: dark}, callService: () => Promise.resolve(),
            callWS: (msg) => Promise.resolve(msg.type === "iptv/accounts" ? {accounts}
              : msg.type === "iptv/get_credentials" ? {ok: true, password: "example-pass"} : {ok: true}),
            connection: {subscribeMessage: () => Promise.resolve(() => {})}};
          document.getElementById("root").appendChild(el);
          // Show the first account's password, as after a click on the eye
          setTimeout(() => el.shadowRoot.querySelector("[data-reveal]")?.click(), 100);
        }""",
        {
            "states": STATES,
            "entities": {k: v for k, v in ENTITIES.items() if v["device_id"] in shown},
            "devices": {k: v for k, v in DEVICES.items() if k in shown},
            "accounts": PANEL_ACCOUNTS,
            "dark": shot["theme"] == "dark",
        },
    )
    return page


def animate(context, shot, *, fps=20, seconds=2):
    """Record the refresh spinner as a looping screenshots/<file>.gif (needs ffmpeg). Every animation is paused and
    stepped frame by frame, so the GIF is identical whatever the machine's speed."""
    page = mount(context, shot)
    # Hold the refresh spinner: set the loading flag and re-render, with no service call or stop timer to clear it.
    page.evaluate(
        """() => { const el = document.getElementById("root").firstElementChild; el._loading = true; el._render(); }"""
    )
    page.wait_for_timeout(200)
    width = shot.get("width", WIDTH)
    box = page.locator("#root").bounding_box()
    clip = {"x": 0, "y": 0, "width": width + 32, "height": int(box["height"] + 0.999) + 32}
    frames = round(fps * seconds)
    with tempfile.TemporaryDirectory() as frame_dir:
        for i in range(frames):
            page.evaluate(
                "(t) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }",
                (i * 1000) / fps,
            )
            page.screenshot(path=f"{frame_dir}/f{i:03d}.png", clip=clip)
        page.close()
        out = str(ROOT / "screenshots" / f"{shot['file']}.gif")
        # Halve the retina capture and build a per-clip palette: the colours stay clean and the file stays small.
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-framerate",
                str(fps),
                "-i",
                f"{frame_dir}/f%03d.png",
                "-vf",
                f"scale={clip['width']}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
                "-loop",
                "0",
                out,
            ],
            check=True,
        )
    print(f"screenshots/{shot['file']}.gif")


def main():
    out_dir = ROOT / "screenshots"
    out_dir.mkdir(exist_ok=True)
    with sync_playwright() as p:
        path = os.environ.get("CHROMIUM_PATH")
        browser = p.chromium.launch(executable_path=path) if path else p.chromium.launch()
        context = browser.new_context(
            device_scale_factor=2,
            viewport={"width": 1000, "height": 1200},
            timezone_id="Europe/Paris",
        )
        for shot in SHOTS:
            page = mount(context, shot)
            page.wait_for_timeout(300)
            width = shot.get("width", WIDTH)
            # The card with 16 px of theme background around it
            box = page.locator("#root").bounding_box()
            page.screenshot(
                path=str(out_dir / f"{shot['file']}.png"),
                clip={"x": 0, "y": 0, "width": width + 32, "height": int(box["height"] + 0.999) + 32},
                animations="disabled",
            )
            print(f"screenshots/{shot['file']}.png")
            page.close()
        # The sidebar panel, full width
        for shot in PANEL_SHOTS:
            page = mount_panel(context, shot)
            page.wait_for_timeout(300)
            box = page.locator("#root").bounding_box()
            page.screenshot(
                path=str(out_dir / f"{shot['file']}.png"),
                clip={"x": 0, "y": 0, "width": PANEL_WIDTH, "height": int(box["height"] + 0.999)},
                animations="disabled",
            )
            print(f"screenshots/{shot['file']}.png")
            page.close()
        # The refresh button spinning while subscriptions reload, light and dark twins of the same state.
        for theme, dark in (("light", ""), ("dark", "-dark")):
            animate(context, {"file": f"refreshing{dark}", "theme": theme, "config": {"devices": ["iptv"]}})
        browser.close()


if __name__ == "__main__":
    main()
