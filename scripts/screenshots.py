"""Render the IPTV card with mock subscriptions and save the README screenshots.

Usage: python scripts/screenshots.py  (needs `pip install playwright` and `playwright install chromium`)
The clock is frozen so the days left stay the same.
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CARD_JS = (ROOT / "custom_components/iptv_xtream/frontend/iptv-card.js").read_text()
LOGO = (ROOT / "custom_components/iptv_xtream/brand/icon@2x.png").read_bytes()
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
    "account-multiple": "M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z"
}

# Minimal stand-ins for Home Assistant's <ha-card> and <ha-icon>.
HA_ELEMENTS = "const ICONS = " + __import__("json").dumps(ICONS) + ";" + """
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

# Subscription devices: { device_id: (name, { translation_key: (domain, state) }) }.
# Fully anonymised mock data; no real provider, account or MAC appears here.
SUBSCRIPTIONS = {
    "iptv": ("Provider A", {
        "status": ("sensor", "active"),
        "expiration": ("sensor", "2027-03-07T00:00:00+00:00"),
        "created": ("sensor", "2026-03-07T00:00:00+00:00"),
        "trial": ("binary_sensor", "off"),
        "active_connections": ("sensor", "1"),
        "max_connections": ("sensor", "1"),
        "channels": ("sensor", "9831"),
        "movies": ("sensor", "54089"),
        "series": ("sensor", "20571"),
    }),
    # A Stalker (MAC) account: no connection counts, no start date, so no bar.
    "iptv2": ("Provider B", {
        "status": ("sensor", "active"),
        "expiration": ("sensor", "2026-10-29T00:00:00+00:00"),
        "created": ("sensor", "unknown"),
        "trial": ("binary_sensor", "off"),
        "active_connections": ("sensor", "unknown"),
        "max_connections": ("sensor", "unknown"),
        "channels": ("sensor", "4210"),
        "movies": ("sensor", "18342"),
        "series": ("sensor", "6125"),
    }),
}
STATES, ENTITIES, DEVICES = {}, {}, {}
for device_id, (name, entities) in SUBSCRIPTIONS.items():
    DEVICES[device_id] = {"id": device_id, "name": name, "name_by_user": None}
    for key, (domain, value) in entities.items():
        entity_id = f"{domain}.{device_id}_{key}"
        STATES[entity_id] = {"entity_id": entity_id, "state": value, "attributes": {}}
        ENTITIES[entity_id] = {"entity_id": entity_id, "device_id": device_id, "platform": "iptv_xtream", "translation_key": key}

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
        context = browser.new_context(device_scale_factor=2, viewport={"width": 1000, "height": 1200}, timezone_id="Europe/Paris")
        page = context.new_page()
        page.clock.set_fixed_time(NOW)
        # The card loads its logo from /iptv_xtream/logo.png, served by the integration:
        # open a page on an http origin so the relative URL resolves
        page.route("**/iptv_xtream/logo.png*", lambda route: route.fulfill(body=LOGO, content_type="image/png"))
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
                  el.hass = {states, entities, devices, language: lang, locale: {language: lang}, callService: () => Promise.resolve()};
                  document.getElementById("root").appendChild(el);
                }""",
                {"states": STATES, "entities": ENTITIES, "devices": DEVICES, "lang": shot["lang"], "config": shot["config"]},
            )
            page.wait_for_timeout(300)
            page.locator("iptv-card").screenshot(path=str(out_dir / f'{shot["file"]}.png'), animations="disabled")
            print(f'screenshots/{shot["file"]}.png')
        browser.close()


if __name__ == "__main__":
    main()
