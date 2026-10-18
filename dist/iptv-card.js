/*
 * IPTV Subscription Card — Home Assistant Lovelace card for Xtream Codes subscriptions.
 * Shows status, expiration date, days left, number of live channels, movies, series and connections.
 *
 * The Xtream API is queried server-side through shell_command.iptv_xtream (see README)
 * to avoid CORS / mixed-content (http) blocking in the browser.
 *
 * https://github.com/juju35/ha-iptv-card
 */
var IPTV_CARD_VERSION = '1.1.1';

// ── i18n ──────────────────────────────────────────────────────────────────────
var IptvCardI18n = {
  en: {
    default_title: 'IPTV subscription',
    loading: 'Loading…',
    error: 'Error',
    service_missing: 'Service {service} not found: add it to configuration.yaml (see README).',
    required: 'Required options: url, username, password',
    refresh: 'Refresh',
    status_active: 'Active',
    status_expired: 'Expired',
    status_banned: 'Banned',
    status_disabled: 'Disabled',
    status_unknown: 'Unknown',
    auth_failed: 'Invalid credentials',
    trial: 'Trial',
    expiration: 'Expiration',
    never: 'Never',
    unlimited: 'Unlimited',
    day_left: '{n} day left',
    days_left: '{n} days left',
    channels: 'channels',
    movies: 'movies',
    series: 'series',
    connections: 'connections',
    ed_title: 'Title',
    ed_url: 'Xtream URL (e.g. http://server:port)',
    ed_username: 'Username',
    ed_password: 'Password',
    ed_refresh_interval: 'Refresh interval',
    ed_warning_days: 'Warn before expiration',
    ed_language: 'Language',
  },
  fr: {
    default_title: 'Abonnement IPTV',
    loading: 'Chargement…',
    error: 'Erreur',
    service_missing: 'Service {service} introuvable : ajoute-le dans configuration.yaml (voir README).',
    required: 'Paramètres requis : url, username, password',
    refresh: 'Actualiser',
    status_active: 'Actif',
    status_expired: 'Expiré',
    status_banned: 'Banni',
    status_disabled: 'Désactivé',
    status_unknown: 'Inconnu',
    auth_failed: 'Identifiants refusés',
    trial: 'Essai',
    expiration: 'Expiration',
    never: 'Jamais',
    unlimited: 'Illimité',
    day_left: '{n} jour restant',
    days_left: '{n} jours restants',
    channels: 'chaînes',
    movies: 'films',
    series: 'séries',
    connections: 'connexions',
    ed_title: 'Titre',
    ed_url: 'URL Xtream (ex : http://serveur:port)',
    ed_username: 'Identifiant',
    ed_password: 'Mot de passe',
    ed_refresh_interval: 'Actualisation',
    ed_warning_days: 'Alerte avant expiration',
    ed_language: 'Langue',
  },
};

function iptvLang(config, hass) {
  if (config && config.language) return config.language;
  if (hass && hass.language) return hass.language.split('-')[0];
  var docLang = document.documentElement.lang;
  return docLang ? docLang.split('-')[0] : 'en';
}

function iptvT(lang, key, vars) {
  var strings = IptvCardI18n[lang] || IptvCardI18n.en;
  var s = strings[key] || IptvCardI18n.en[key] || key;
  if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
  return s;
}

// Shared cache between card instances (avoids calling the API on every render)
var IPTV_CACHE = new Map();

// ── iptv-card ─────────────────────────────────────────────────────────────────
class IptvCard extends HTMLElement {
  static getStubConfig() {
    return { url: 'http://', username: '', password: '' };
  }

  // Visual editor: native Home Assistant form (rendered by HA itself)
  static getConfigForm() {
    var ha = document.querySelector('home-assistant');
    var lang = iptvLang(null, ha && ha.hass);
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'url', required: true, selector: { text: { type: 'url' } } },
        { name: 'username', required: true, selector: { text: {} } },
        { name: 'password', required: true, selector: { text: { type: 'password' } } },
        {
          type: 'grid',
          name: '',
          schema: [
            { name: 'refresh_interval', selector: { number: { min: 5, max: 1440, unit_of_measurement: 'min', mode: 'box' } } },
            { name: 'warning_days', selector: { number: { min: 1, max: 60, mode: 'box' } } },
          ],
        },
        { name: 'language', selector: { select: { mode: 'dropdown', options: [
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'Français' },
        ] } } },
      ],
      computeLabel: (schema) => iptvT(lang, 'ed_' + schema.name),
    };
  }

  setConfig(config) {
    this._config = {
      refresh_interval: 60, // minutes
      warning_days: 7,
      service: 'shell_command.iptv_xtream',
      ...config,
    };
    this._missing = !config.url || !config.username || !config.password;
    var key = [this._config.url, this._config.username, this._config.password].join('|');
    if (key !== this._key) {
      this._data = null;
      this._error = null;
    }
    this._key = key;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._render();
    if (this._hass) this._load(false);
  }

  set hass(hass) {
    var first = !this._hass;
    var prevLang = this._hass && this._hass.language;
    this._hass = hass;
    if (first) this._load(false);
    else if (prevLang !== hass.language) this._render();
  }

  connectedCallback() {
    var minutes = Math.max(5, Number(this._config && this._config.refresh_interval) || 60);
    this._timer = setInterval(() => this._load(true), minutes * 60000);
    if (this._hass) this._load(false);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
  }

  getCardSize() {
    return 3;
  }

  _t(key, vars) {
    return iptvT(iptvLang(this._config, this._hass), key, vars);
  }

  async _load(force) {
    if (!this._hass || !this._config || this._loading || this._missing) return;
    var ttl = (Number(this._config.refresh_interval) || 60) * 60000;
    var cached = IPTV_CACHE.get(this._key);
    if (!force && cached && Date.now() - cached.at < ttl) {
      this._data = cached.data;
      this._error = null;
      this._render();
      return;
    }
    this._loading = true;
    this._render();
    try {
      var parts = this._config.service.split('.');
      var res = await this._hass.callWS({
        type: 'call_service',
        domain: parts[0],
        service: parts[1],
        service_data: {
          url: this._config.url,
          username: this._config.username,
          password: this._config.password,
        },
        return_response: true,
      });
      var out = (res && res.response) || res;
      if (out && out.returncode && out.returncode !== 0) {
        var lastLine = (out.stderr || '').split('\n').filter(Boolean).pop();
        throw new Error(lastLine || 'code ' + out.returncode);
      }
      var data = JSON.parse(out.stdout);
      IPTV_CACHE.set(this._key, { at: Date.now(), data: data });
      this._data = data;
      this._error = null;
    } catch (e) {
      var msg = (e && e.message) || String(e);
      this._error = /not found|Unable to find|service_not_found/i.test(msg)
        ? this._t('service_missing', { service: this._config.service })
        : this._t('error') + ': ' + msg;
    } finally {
      this._loading = false;
      this._render();
    }
  }

  _view() {
    var d = this._data;
    if (!d) return null;
    var exp = d.exp_date ? Number(d.exp_date) * 1000 : null;
    var created = d.created_at ? Number(d.created_at) * 1000 : null;
    var now = Date.now();
    var daysLeft = exp ? Math.ceil((exp - now) / 86400000) : null;
    var raw = String(d.status || '').toLowerCase();
    var state;
    if (!d.auth) state = 'error';
    else if (raw === 'active' && (daysLeft === null || daysLeft > 0)) {
      state = daysLeft !== null && daysLeft <= this._config.warning_days ? 'warning' : 'ok';
    } else state = 'error';

    var known = ['active', 'expired', 'banned', 'disabled'];
    var statusLabel = !d.auth
      ? this._t('auth_failed')
      : known.indexOf(raw) >= 0 ? this._t('status_' + raw) : d.status || this._t('status_unknown');
    var pct = null;
    if (exp && created && exp > created) {
      pct = Math.min(100, Math.max(0, ((exp - now) / (exp - created)) * 100));
    }
    return { exp: exp, daysLeft: daysLeft, state: state, statusLabel: statusLabel, pct: pct, d: d };
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var lang = iptvLang(this._config, this._hass);
    var locale = (this._hass && this._hass.locale && this._hass.locale.language) || lang;
    var v = this._view();
    var fmtDate = (ms) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    var nf = new Intl.NumberFormat(locale);
    var esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    var title = this._config.title || this._t('default_title');

    var body;
    if (this._missing) {
      body = '<div class="msg">' + this._t('required') + '</div>';
    } else if (this._error && !v) {
      body = '<div class="msg err">' + esc(this._error) + '</div>';
    } else if (!v) {
      body = '<div class="msg">' + this._t('loading') + '</div>';
    } else {
      var remaining =
        v.daysLeft === null
          ? this._t('unlimited')
          : v.daysLeft > 0
            ? this._t(v.daysLeft > 1 ? 'days_left' : 'day_left', { n: v.daysLeft })
            : this._t('status_expired');
      var cons =
        v.d.max_connections != null ? (v.d.active_cons || 0) + ' / ' + v.d.max_connections : '—';
      var icon = v.state === 'ok' ? 'mdi:check-circle' : v.state === 'warning' ? 'mdi:alert' : 'mdi:close-circle';
      var stat = (icon, n, key) => `
          <div class="stat">
            <ha-icon icon="${icon}"></ha-icon>
            <div><div class="num">${n != null ? nf.format(n) : '—'}</div><div class="lbl">${this._t(key)}</div></div>
          </div>`;
      var isTrial = v.d.is_trial === '1' || v.d.is_trial === 1;
      body = `
        <div class="status ${v.state}">
          <ha-icon icon="${icon}"></ha-icon>
          <span>${esc(v.statusLabel)}</span>
          ${isTrial ? '<span class="tag">' + this._t('trial') + '</span>' : ''}
        </div>
        <div class="exp">
          <div class="row">
            <span class="lbl">${this._t('expiration')}</span>
            <span class="val">${v.exp ? fmtDate(v.exp) : this._t('never')}</span>
          </div>
          <div class="sub ${v.state}">${esc(remaining)}</div>
          ${v.pct !== null ? `<div class="bar"><div class="fill ${v.state}" style="width:${v.pct.toFixed(1)}%"></div></div>` : ''}
        </div>
        <div class="stats">
          ${stat('mdi:television-classic', v.d.channels, 'channels')}
          ${stat('mdi:movie-open', v.d.movies, 'movies')}
          ${stat('mdi:filmstrip-box-multiple', v.d.series, 'series')}
          <div class="stat">
            <ha-icon icon="mdi:account-multiple"></ha-icon>
            <div><div class="num">${esc(cons)}</div><div class="lbl">${this._t('connections')}</div></div>
          </div>
        </div>
        ${this._error ? '<div class="msg err small">' + esc(this._error) + '</div>' : ''}`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        ha-card { padding: 16px; }
        .head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .title { display:flex; align-items:center; gap:8px; font-size:1.15em; font-weight:500; }
        .title ha-icon { color: var(--state-icon-color, var(--primary-color)); }
        button { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); padding:4px; border-radius:50%; }
        button:hover { background: var(--secondary-background-color); }
        button.spin ha-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:16px; font-weight:500; font-size:.95em; margin-bottom:14px; }
        .status ha-icon { --mdc-icon-size:18px; }
        .status.ok { color: var(--success-color, #2e7d32); background: rgba(76,175,80,.15); }
        .status.warning { color: var(--warning-color, #ef6c00); background: rgba(255,152,0,.15); }
        .status.error { color: var(--error-color, #c62828); background: rgba(244,67,54,.15); }
        .tag { font-size:.75em; padding:1px 6px; border-radius:8px; background: var(--secondary-background-color); color: var(--secondary-text-color); }
        .row { display:flex; justify-content:space-between; align-items:baseline; }
        .lbl { color: var(--secondary-text-color); font-size:.9em; }
        .val { font-weight:500; }
        .sub { font-size:.85em; margin-top:2px; text-align:right; color: var(--secondary-text-color); }
        .sub.warning { color: var(--warning-color, #ef6c00); }
        .sub.error { color: var(--error-color, #c62828); }
        .bar { height:6px; border-radius:3px; background: var(--secondary-background-color); margin-top:8px; overflow:hidden; }
        .fill { height:100%; border-radius:3px; background: var(--success-color, #4caf50); }
        .fill.warning { background: var(--warning-color, #ff9800); }
        .fill.error { background: var(--error-color, #f44336); }
        .stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
        .stat { display:flex; align-items:center; gap:10px; padding:10px; border-radius:12px; background: var(--secondary-background-color); }
        .stat ha-icon { color: var(--primary-color); }
        .num { font-size:1.25em; font-weight:600; line-height:1.2; }
        .msg { color: var(--secondary-text-color); padding:8px 0; }
        .msg.err { color: var(--error-color, #c62828); }
        .msg.small { font-size:.8em; padding-top:10px; }
      </style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:television-play"></ha-icon>${esc(title)}</div>
          <button class="${this._loading ? 'spin' : ''}" title="${this._t('refresh')}"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </div>
        ${body}
      </ha-card>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this._load(true));
  }
}

customElements.define('iptv-card', IptvCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'iptv-card',
  name: 'IPTV Subscription Card',
  description: 'Status, expiration date, channel, movie and series counts of an Xtream Codes IPTV subscription.',
  preview: false,
  documentationURL: 'https://github.com/juju35/ha-iptv-card',
});

console.info(
  '%c IPTV-CARD %c v' + IPTV_CARD_VERSION + ' ',
  'color:white;background:#3f51b5;font-weight:700',
  'color:#3f51b5;background:white',
);
