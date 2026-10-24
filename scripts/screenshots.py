"""Render the IPTV card with mock subscriptions and save the README screenshots.

Usage: python scripts/screenshots.py  (needs `pip install playwright` and `playwright install chromium`)
The clock is frozen so the days left stay the same.
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CARD_JS = (ROOT / "custom_components/iptv/frontend/iptv-card.js").read_text()
LOGO = (ROOT / "custom_components/iptv/brand/icon@2x.png").read_bytes()
BASE_URL = "http://ha.local/"
NOW = "2026-10-10T09:00:00+02:00"
WIDTH = 388

THEMES = {
    "light": {
        "--primary-background-color": "#f4f4f4",
        "--secondary-background-color": "#efefef",
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
      "box-shadow:0 1px 4px rgba(0,0,0,.08);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
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
    {"file": "card", "theme": "light", "lang": "en", "config": {"devices": ["iptv"]}},
    {"file": "card-multi", "theme": "light", "lang": "en", "config": {}},
]


def page_html(theme):
    variables = "".join(f"{k}:{v};" for k, v in {**THEMES[theme], **COMMON}.items())
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
  :root {{ {variables} }}
  body {{ margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: {WIDTH}px; }}
</style></head><body><div id="root"></div></body></html>"""


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
        page = context.new_page()
        page.clock.set_fixed_time(NOW)
        # The card loads its logo from /iptv/logo.png, served by the integration:
        # open a page on an http origin so the relative URL resolves
        page.route("**/iptv/logo.png*", lambda route: route.fulfill(body=LOGO, content_type="image/png"))
        page.route(BASE_URL, lambda route: route.fulfill(body="<!doctype html>", content_type="text/html"))
        page.goto(BASE_URL)
        for shot in SHOTS:
            page.set_content(page_html(shot["theme"]))
            page.add_script_tag(content=HA_ELEMENTS)
            page.add_script_tag(content=CARD_JS)
            page.evaluate(
                """({states, entities, devices, lang, config}) => {
                  const el = document.createElement("iptv-card");
                  el.setConfig({type: "custom:iptv-card", ...config});
                  el.hass = {states, entities, devices, user: {is_admin: true}, language: lang, locale: {language: lang}, callService: () => Promise.resolve()};
                  document.getElementById("root").appendChild(el);
                }""",
                {
                    "states": STATES,
                    "entities": ENTITIES,
                    "devices": DEVICES,
                    "lang": shot["lang"],
                    "config": shot["config"],
                },
            )
            page.wait_for_timeout(300)
            page.locator("iptv-card").screenshot(path=str(out_dir / f"{shot['file']}.png"), animations="disabled")
            print(f"screenshots/{shot['file']}.png")
        browser.close()


if __name__ == "__main__":
    main()
