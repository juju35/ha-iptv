// ── iptv-mini-card-editor ─────────────────────────────────────────────────────
// The full card's fields plus the detail button, shown on by default and not written
// to the YAML while it stays on
import { pickerDefine } from "./card-picker.js";
import { IPTV_CARD_VERSION } from "./core.js";
import { iptvLang, iptvT } from "./i18n-helpers.js";
import { IptvCard } from "./card.js";
import { IptvMiniCard } from "./mini-card.js";

export class IptvMiniCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      var form = IptvCard.getConfigForm();
      var lang = iptvLang(null, this._hass);
      this._form = document.createElement('ha-form');
      this._form.schema = [...form.schema, { name: 'zoom', selector: { boolean: {} } }];
      this._form.computeLabel = (schema) => iptvT(lang, `ed_${schema.name}`);
      this._form.addEventListener('value-changed', (ev) => {
        ev.stopPropagation();
        var value = { ...ev.detail.value };
        // Defaults stay out of the YAML
        if (value.zoom === true) delete value.zoom;
        if (value.illustration === true) delete value.illustration;
        if (value.illustration_theme === 'auto') delete value.illustration_theme;
        this._config = value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: value }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = { show_title: true, illustration: true, illustration_theme: 'auto', zoom: true, ...this._config };
  }
}

if (!customElements.get('iptv-mini-card-editor')) {
  pickerDefine('iptv-mini-card-editor', IptvMiniCardEditor);
}

// Each card is registered on its own: a page that already loaded an older copy of this
// file (a stale resource or a cached version without the mini card) still gets the mini card
window.customCards = window.customCards || [];
if (!customElements.get('iptv-card')) {
  pickerDefine('iptv-card', IptvCard);
  window.customCards.push({
    type: 'iptv-card',
    name: 'IPTV Subscription Card',
    description: 'Status, expiration date, channel, movie and series counts of one or several IPTV subscriptions (Xtream Codes or Stalker).',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });

  console.info(
    `%c IPTV-CARD %c v${IPTV_CARD_VERSION} `,
    'color:white;background:#3f51b5;font-weight:700',
    'color:#3f51b5;background:white',
  );
}
if (!customElements.get('iptv-mini-card')) {
  pickerDefine('iptv-mini-card', IptvMiniCard);
  window.customCards.push({
    type: 'iptv-mini-card',
    name: 'IPTV Subscription Mini Card',
    description: 'The IPTV subscriptions on two lines (status and days left of each provider), with a detail button showing the full card.',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });
}
