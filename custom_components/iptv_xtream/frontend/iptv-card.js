/*
 * IPTV Subscription Card — Home Assistant Lovelace card for Xtream Codes subscriptions.
 * Shows status, expiration date, days left, number of live channels, movies, series and connections.
 *
 * Bundled with the iptv_xtream integration, which polls the Xtream API server-side:
 * the card only reads the entities of one subscription device.
 *
 * https://github.com/juju35/ha-iptv
 */
var IPTV_CARD_VERSION = '2.2.0';
var IPTV_DOMAIN = 'iptv_xtream';

// ── i18n ──────────────────────────────────────────────────────────────────────
var IptvCardI18n = {
  en: {
    default_title: 'IPTV subscription',
    loading: 'Loading…',
    no_device: 'No IPTV Xtream subscription found: add the IPTV Xtream integration in Settings → Devices & services.',
    unavailable: 'Xtream server unreachable',
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
    ed_device: 'Subscription',
    ed_warning_days: 'Warn before expiration',
    ed_language: 'Language',
  },
  fr: {
    default_title: 'Abonnement IPTV',
    loading: 'Chargement…',
    no_device: 'Aucun abonnement IPTV Xtream : ajoute l’intégration IPTV Xtream dans Paramètres → Appareils et services.',
    unavailable: 'Serveur Xtream injoignable',
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
    ed_device: 'Abonnement',
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

// ── iptv-card ─────────────────────────────────────────────────────────────────
class IptvCard extends HTMLElement {
  static getStubConfig() {
    return {};
  }

  // Visual editor: native Home Assistant form (rendered by HA itself)
  static getConfigForm() {
    var ha = document.querySelector('home-assistant');
    var lang = iptvLang(null, ha && ha.hass);
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'device', selector: { device: { integration: IPTV_DOMAIN } } },
        { name: 'warning_days', selector: { number: { min: 1, max: 60, mode: 'box' } } },
        { name: 'language', selector: { select: { mode: 'dropdown', options: [
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'Français' },
        ] } } },
      ],
      computeLabel: (schema) => iptvT(lang, 'ed_' + schema.name),
    };
  }

  setConfig(config) {
    this._config = { warning_days: 7, ...config };
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._sig = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Re-render only when one of our entities (or the language) changed
    var ids = this._entities();
    var sig = [hass.language].concat(Object.keys(ids).map(function (k) {
      var st = hass.states[ids[k]];
      return k + '=' + (st ? st.state + '@' + st.last_updated : '');
    })).join('|');
    if (sig === this._sig) return;
    this._sig = sig;
    this._loading = false;
    this._render();
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4 };
  }

  getCardSize() {
    return 3;
  }

  _t(key, vars) {
    return iptvT(iptvLang(this._config, this._hass), key, vars);
  }

  // { translation_key: entity_id } of the configured device, or of the first one found
  _entities() {
    var out = {};
    if (!this._hass || !this._hass.entities) return out;
    var device = this._config && this._config.device;
    Object.values(this._hass.entities).forEach(function (e) {
      if (e.platform !== IPTV_DOMAIN || !e.translation_key || !e.device_id) return;
      if (!device) device = e.device_id;
      if (e.device_id === device) out[e.translation_key] = e.entity_id;
    });
    return out;
  }

  async _refresh() {
    var ids = this._entities();
    if (!ids.status || this._loading) return;
    this._loading = true;
    this._render();
    try {
      await this._hass.callService('homeassistant', 'update_entity', { entity_id: ids.status });
    } finally {
      // A state change re-renders; stop the spinner anyway if nothing changed
      setTimeout(() => {
        if (!this._loading) return;
        this._loading = false;
        this._render();
      }, 2000);
    }
  }

  // Rebuild the Xtream account summary from the entity states
  _data() {
    var ids = this._entities();
    if (!ids.status) return null;
    var states = this._hass.states;
    var status = states[ids.status];
    if (!status || status.state === 'unavailable') return { unavailable: true };
    var val = (k) => {
      var st = ids[k] && states[ids[k]];
      return st && st.state !== 'unknown' && st.state !== 'unavailable' ? st.state : null;
    };
    var time = (k) => (val(k) !== null ? Date.parse(val(k)) / 1000 : null);
    var num = (k) => (val(k) !== null ? Number(val(k)) : null);
    return {
      auth: status.state !== 'invalid_auth',
      status: val('status'),
      exp_date: time('expiration'),
      created_at: time('created'),
      is_trial: val('trial') === 'on',
      active_cons: num('active_connections'),
      max_connections: num('max_connections'),
      channels: num('channels'),
      movies: num('movies'),
      series: num('series'),
    };
  }

  _view(d) {
    if (!d || d.unavailable) return null;
    var exp = d.exp_date ? d.exp_date * 1000 : null;
    var created = d.created_at ? d.created_at * 1000 : null;
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
      : known.indexOf(raw) >= 0 ? this._t('status_' + raw) : this._t('status_unknown');
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
    var data = this._hass ? this._data() : null;
    var v = this._view(data);
    var fmtDate = (ms) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    var nf = new Intl.NumberFormat(locale);
    var esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    var title = this._config.title || this._t('default_title');

    var body;
    var status = '';
    var level = v ? v.state : 'idle';
    if (!this._hass) {
      body = '<div class="msg">' + this._t('loading') + '</div>';
    } else if (!data) {
      body = '<div class="msg">' + this._t('no_device') + '</div>';
    } else if (!v) {
      body = '<div class="msg err">' + this._t('unavailable') + '</div>';
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
          <div class="stat" data-entity="${key}">
            <ha-icon icon="${icon}"></ha-icon>
            <div><div class="num">${n != null ? nf.format(n) : '—'}</div><div class="lbl">${this._t(key)}</div></div>
          </div>`;
      status = `
        <div class="chips">
          <span class="chip ${v.state}" data-entity="status"><ha-icon icon="${icon}"></ha-icon>${esc(v.statusLabel)}</span>
          ${v.d.is_trial ? '<span class="chip idle">' + this._t('trial') + '</span>' : ''}
        </div>`;
      body = `
        <div class="exp" data-entity="expiration">
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
          <div class="stat" data-entity="active_connections">
            <ha-icon icon="mdi:account-multiple"></ha-icon>
            <div><div class="num">${esc(cons)}</div><div class="lbl">${this._t('connections')}</div></div>
          </div>
        </div>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { --iptv-ok: var(--success-color, #43a047); --iptv-warn: var(--warning-color, #ffa600); --iptv-crit: var(--error-color, #db4437); }
        ha-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .ok { --c: var(--iptv-ok); } .warning { --c: var(--iptv-warn); } .error { --c: var(--iptv-crit); } .idle { --c: var(--secondary-text-color); }
        .header { display: flex; align-items: center; gap: 10px; }
        .hicon { width: 36px; height: 36px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center;
                 color: var(--c, var(--primary-color)); background: color-mix(in srgb, var(--c, var(--primary-color)) 15%, transparent); --mdc-icon-size: 24px; }
        .hicon.idle { --c: var(--primary-color); }
        .titles { flex: 1; min-width: 0; }
        .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px 1px 5px; border-radius: 12px; font-size: 11px; font-weight: 500;
                color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent); --mdc-icon-size: 14px; }
        .chip.idle { padding-left: 10px; }
        button { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; align-self: flex-start; display: flex; }
        button:hover { background: var(--secondary-background-color); }
        button.spin ha-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .row { display:flex; justify-content:space-between; align-items:baseline; gap: 8px; }
        .lbl { color: var(--secondary-text-color); font-size: 11px; }
        .exp .lbl { font-size: 12px; }
        .val { font-weight:500; font-size: 15px; }
        .sub { font-size: 12px; margin-top:2px; text-align:right; color: var(--secondary-text-color); }
        .sub.warning, .sub.error { color: var(--c); }
        .bar { height:4px; border-radius:3px; background: var(--divider-color, rgba(127,127,127,.25)); margin-top:6px; overflow:hidden; }
        .fill { height:100%; border-radius:3px; background: var(--c, var(--iptv-ok)); transition: width .6s ease; }
        .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px; }
        .stat { display:grid; align-items:center; gap:10px; padding:6px 8px; border-radius:10px; min-width: 0;
                background: var(--secondary-background-color, rgba(127,127,127,.08)); grid-template-columns: auto minmax(0, 1fr); column-gap: 6px; }
        .stat .lbl { grid-column: 1 / -1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stat > div { display: contents; }
        .stat ha-icon { color: var(--primary-color); --mdc-icon-size: 16px; flex: none; }
        .num { font-size: 14px; font-weight: 500; line-height: 1.2; }
        .msg { color: var(--secondary-text-color); padding:8px 0; }
        .msg.err { color: var(--iptv-crit); }
        [data-entity] { cursor:pointer; }
        .stat:hover { filter: brightness(0.95); }
      </style>
      <ha-card>
        <div class="header">
          <div class="hicon ${level}"><ha-icon icon="mdi:television-play"></ha-icon></div>
          <div class="titles"><div class="name">${esc(title)}</div>${status}</div>
          <button class="${this._loading ? 'spin' : ''}" title="${this._t('refresh')}"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </div>
        ${body}
      </ha-card>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this._refresh());
    var ids = this._entities();
    this.shadowRoot.querySelectorAll('[data-entity]').forEach((el) => {
      var entityId = ids[el.dataset.entity];
      if (entityId) el.addEventListener('click', () => this._moreInfo(entityId));
    });
  }

  // Open the Home Assistant entity dialog
  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entityId }, bubbles: true, composed: true }));
  }
}

if (!customElements.get('iptv-card')) {
  customElements.define('iptv-card', IptvCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'iptv-card',
    name: 'IPTV Subscription Card',
    description: 'Status, expiration date, channel, movie and series counts of an Xtream Codes IPTV subscription.',
    preview: false,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });

  console.info(
    '%c IPTV-CARD %c v' + IPTV_CARD_VERSION + ' ',
    'color:white;background:#3f51b5;font-weight:700',
    'color:#3f51b5;background:white',
  );
}
