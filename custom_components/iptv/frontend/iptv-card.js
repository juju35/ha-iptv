/*
 * IPTV Subscription Card — Home Assistant Lovelace card for Xtream Codes and Stalker subscriptions.
 * Shows status, expiration date, days left, number of live channels, movies, series and connections
 * of one or several subscriptions (one section per provider).
 *
 * Bundled with the iptv integration, which polls the Xtream Codes or Stalker server:
 * the card only reads the entities of the subscription devices.
 *
 * https://github.com/juju35/ha-iptv
 */
var IPTV_CARD_VERSION = '3.4.0';
var IPTV_DOMAIN = 'iptv';
var IPTV_LOGO_URL = '/' + IPTV_DOMAIN + '/logo.png?v=' + IPTV_CARD_VERSION;

// ── i18n ──────────────────────────────────────────────────────────────────────
var IptvCardI18n = {
  en: {
    default_title: 'IPTV subscription',
    default_title_multi: 'IPTV subscriptions',
    loading: 'Loading…',
    no_device: 'No IPTV subscription found: add the IPTV integration in Settings → Devices & services.',
    unavailable: 'IPTV server unreachable',
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
    french_on: 'FR',
    french_off: 'No FR',
    french_title: 'French lists',
    health_ok: 'Online',
    health_degraded: 'Slow',
    health_unreachable: 'Unreachable',
    health_auth_failed: 'Credentials refused',
    ed_title: 'Title',
    ed_devices: 'Subscriptions (all if empty)',
    ed_warning_days: 'Warn before expiration',
    ed_language: 'Language',
  },
  fr: {
    default_title: 'Abonnement IPTV',
    default_title_multi: 'Abonnements IPTV',
    loading: 'Chargement…',
    no_device: 'Aucun abonnement IPTV : ajoute l’intégration IPTV dans Paramètres → Appareils et services.',
    unavailable: 'Serveur IPTV injoignable',
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
    french_on: 'FR',
    french_off: 'Pas de FR',
    french_title: 'Listes françaises',
    health_ok: 'En ligne',
    health_degraded: 'Lent',
    health_unreachable: 'Injoignable',
    health_auth_failed: 'Identifiants refusés',
    ed_title: 'Titre',
    ed_devices: 'Abonnements (tous si vide)',
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
        { name: 'devices', selector: { device: { integration: IPTV_DOMAIN, multiple: true } } },
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
    // Re-render only when one of our entities, a device name or the language changed
    var parts = [hass.language];
    this._subs().forEach(function (sub) {
      parts.push(sub.device + ':' + sub.name);
      Object.keys(sub.ids).forEach(function (k) {
        var st = hass.states[sub.ids[k]];
        parts.push(k + '=' + (st ? st.state + '@' + st.last_updated : ''));
      });
    });
    var sig = parts.join('|');
    if (sig === this._sig) return;
    this._sig = sig;
    this._loading = false;
    this._render();
  }

  getGridOptions() {
    var n = Math.max(1, this._hass ? this._subs().length : 1);
    return { columns: 6, min_columns: 4, rows: n > 1 ? 1 + 3 * n : 'auto' };
  }

  getCardSize() {
    var n = Math.max(1, this._hass ? this._subs().length : 1);
    return n > 1 ? 1 + 3 * n : 3;
  }

  _t(key, vars) {
    return iptvT(iptvLang(this._config, this._hass), key, vars);
  }

  // Devices to show: `devices` (list), the legacy `device`, or every IPTV device
  _wanted() {
    var c = this._config || {};
    var list = [].concat(c.devices || []).filter(Boolean);
    if (!list.length && c.device) list = [c.device];
    return list;
  }

  // [{ device, name, ids: { translation_key: entity_id } }] in the configured order,
  // or sorted by name when every subscription is shown
  _subs() {
    if (!this._hass || !this._hass.entities) return [];
    var wanted = this._wanted();
    var byDevice = {};
    Object.values(this._hass.entities).forEach(function (e) {
      if (e.platform !== IPTV_DOMAIN || !e.translation_key || !e.device_id) return;
      if (wanted.length && wanted.indexOf(e.device_id) < 0) return;
      (byDevice[e.device_id] = byDevice[e.device_id] || {})[e.translation_key] = e.entity_id;
    });
    var devices = this._hass.devices || {};
    var subs = Object.keys(byDevice).map(function (id) {
      var dev = devices[id];
      return { device: id, name: (dev && (dev.name_by_user || dev.name)) || '', ids: byDevice[id] };
    });
    if (wanted.length) subs.sort((a, b) => wanted.indexOf(a.device) - wanted.indexOf(b.device));
    else subs.sort((a, b) => a.name.localeCompare(b.name));
    return subs;
  }

  async _refresh() {
    var ids = [];
    this._subs().forEach((sub) => ids.push(sub.ids.status, sub.ids.health));
    ids = ids.filter(Boolean);
    if (!ids.length || this._loading) return;
    this._loading = true;
    this._render();
    try {
      await this._hass.callService('homeassistant', 'update_entity', { entity_id: ids });
    } finally {
      // A state change re-renders; stop the spinner anyway if nothing changed
      setTimeout(() => {
        if (!this._loading) return;
        this._loading = false;
        this._render();
      }, 2000);
    }
  }

  // Rebuild the account summary of one subscription from its entity states
  _data(ids) {
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

  // French lists of one subscription: true, false or null (unknown)
  _french(ids) {
    var st = ids.french_lists && this._hass.states[ids.french_lists];
    if (!st || (st.state !== 'on' && st.state !== 'off')) return null;
    return st.state === 'on';
  }

  // Last health check of one subscription: { status, ms } or null
  _health(ids) {
    var st = ids.health && this._hass.states[ids.health];
    if (!st || st.state === 'unknown' || st.state === 'unavailable') return null;
    var ms = st.attributes && st.attributes.response_time_ms;
    return { status: st.state, ms: ms == null ? null : Number(ms) };
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
    } else if (exp && exp > now) {
      // No start date (Stalker portals): assume the shortest usual subscription
      // length (1, 3, 6 or 12 months, then whole years) that covers the time left
      var day = 86400000;
      var left = exp - now;
      var period = [30, 91, 182, 365].map((n) => n * day).find((p) => p >= left) ||
        Math.ceil(left / (365 * day)) * 365 * day;
      pct = Math.min(100, (left / period) * 100);
    }
    return { exp: exp, daysLeft: daysLeft, state: state, statusLabel: statusLabel, pct: pct, d: d };
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var lang = iptvLang(this._config, this._hass);
    var locale = (this._hass && this._hass.locale && this._hass.locale.language) || lang;
    var fmtDate = (ms) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    var nf = new Intl.NumberFormat(locale);
    var esc = (s) =>
      String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    var subs = this._hass ? this._subs() : [];
    var multi = subs.length > 1;
    var title = this._config.title || this._t(multi ? 'default_title_multi' : 'default_title');

    var fmtMs = (ms) => (ms < 1000 ? nf.format(ms) + ' ms' : new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ms / 1000) + ' s');

    // Health pill: server reachability and response time
    var healthChip = (h, v) => {
      if (!h) return '';
      // Refused credentials are already shown by the status pill
      if (h.status === 'auth_failed' && v && !v.d.auth) return '';
      var cls = { ok: 'ok', degraded: 'warning' }[h.status] || 'error';
      var icon = { ok: 'mdi:lan-connect', degraded: 'mdi:speedometer-slow' }[h.status] || 'mdi:lan-disconnect';
      var label = this._t('health_' + h.status) + (h.ms != null && h.status !== 'unreachable' ? ' · ' + fmtMs(h.ms) : '');
      return `<span class="chip ${cls}" data-entity="health"><ha-icon icon="${icon}"></ha-icon>${esc(label)}</span>`;
    };

    // French flag pill: French lists found (green) or not (red)
    var frenchChip = (fr) =>
      fr === null || fr === undefined
        ? ''
        : `<span class="chip ${fr ? 'ok' : 'error'} fr" data-entity="french_lists" title="${esc(this._t('french_title'))}"><span class="flag${fr ? '' : ' off'}"></span>${esc(this._t(fr ? 'french_on' : 'french_off'))}</span>`;

    // Status, trial, French and health pills of one subscription
    var chips = (v, h, fr) => {
      if (!v && !h) return '';
      var icon = v ? (v.state === 'ok' ? 'mdi:check-circle' : v.state === 'warning' ? 'mdi:alert' : 'mdi:close-circle') : '';
      return `
        <div class="chips">
          ${v ? `<span class="chip ${v.state}" data-entity="status"><ha-icon icon="${icon}"></ha-icon>${esc(v.statusLabel)}</span>` : ''}
          ${v && v.d.is_trial ? '<span class="chip idle">' + this._t('trial') + '</span>' : ''}
          ${v ? frenchChip(fr) : ''}
          ${healthChip(h, v)}
        </div>`;
    };

    // Expiration and tiles of one subscription
    var details = (v) => {
      var remaining =
        v.daysLeft === null
          ? this._t('unlimited')
          : v.daysLeft > 0
            ? this._t(v.daysLeft > 1 ? 'days_left' : 'day_left', { n: v.daysLeft })
            : this._t('status_expired');
      var cons =
        v.d.max_connections != null ? (v.d.active_cons || 0) + ' / ' + v.d.max_connections : '—';
      var stat = (icon, n, key) => `
          <div class="stat" data-entity="${key}">
            <ha-icon icon="${icon}"></ha-icon>
            <div><div class="num">${n != null ? nf.format(n) : '—'}</div><div class="lbl">${this._t(key)}</div></div>
          </div>`;
      return `
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
    };

    var body;
    var status = '';
    if (!this._hass) {
      body = '<div class="msg">' + this._t('loading') + '</div>';
    } else if (!subs.length) {
      body = '<div class="msg">' + this._t('no_device') + '</div>';
    } else if (!multi) {
      // One subscription: pills under the card title, as before
      var v = this._view(this._data(subs[0].ids));
      status = chips(v, this._health(subs[0].ids), this._french(subs[0].ids));
      body = '<div class="sect" data-sub="0">' +
        (v ? details(v) : '<div class="msg err">' + this._t('unavailable') + '</div>') + '</div>';
    } else {
      // Several subscriptions: one section each, named after its device
      body = subs.map((sub, i) => {
        var v = this._view(this._data(sub.ids));
        return `
          <div class="sect multi" data-sub="${i}">
            <div class="sect-head">
              <div class="sect-name">${esc(sub.name)}</div>
              ${chips(v, this._health(sub.ids), this._french(sub.ids))}
            </div>
            ${v ? details(v) : '<div class="msg err">' + this._t('unavailable') + '</div>'}
          </div>`;
      }).join('');
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { --iptv-ok: var(--success-color, #43a047); --iptv-warn: var(--warning-color, #ffa600); --iptv-crit: var(--error-color, #db4437); }
        ha-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .ok { --c: var(--iptv-ok); } .warning { --c: var(--iptv-warn); } .error { --c: var(--iptv-crit); } .idle { --c: var(--secondary-text-color); }
        .header { display: flex; align-items: center; gap: 10px; }
        .logo { width: 36px; height: 36px; flex: none; object-fit: contain; }
        .titles { flex: 1; min-width: 0; }
        .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px 1px 5px; border-radius: 12px; font-size: 11px; font-weight: 500;
                color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent); --mdc-icon-size: 14px; }
        .chip.idle { padding-left: 10px; }
        .chip.fr { padding-left: 6px; gap: 5px; }
        .flag { width: 14px; height: 10px; border-radius: 2px; flex: none; box-shadow: 0 0 0 1px rgba(0,0,0,.12);
                background: linear-gradient(90deg, #0055a4 0 33.3%, #fff 33.3% 66.6%, #ef4135 66.6%); }
        .flag.off { filter: grayscale(1); opacity: .6; }
        .sect { display: flex; flex-direction: column; gap: 10px; }
        .sect.multi + .sect.multi { border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); padding-top: 10px; }
        .sect-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .sect-head .chips { margin-top: 0; flex: none; justify-content: flex-end; }
        .sect-name { font-size: 14px; font-weight: 500; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
          <img class="logo" src="${IPTV_LOGO_URL}" alt="">
          <div class="titles"><div class="name">${esc(title)}</div>${status}</div>
          <button class="${this._loading ? 'spin' : ''}" title="${this._t('refresh')}"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </div>
        ${body}
      </ha-card>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this._refresh());
    // Header pills (single subscription) belong to the first subscription
    this.shadowRoot.querySelectorAll('[data-entity]').forEach((el) => {
      var sect = el.closest('[data-sub]');
      var sub = subs[sect ? Number(sect.dataset.sub) : 0];
      var entityId = sub && sub.ids[el.dataset.entity];
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
    description: 'Status, expiration date, channel, movie and series counts of one or several IPTV subscriptions (Xtream Codes or Stalker).',
    preview: false,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });

  console.info(
    '%c IPTV-CARD %c v' + IPTV_CARD_VERSION + ' ',
    'color:white;background:#3f51b5;font-weight:700',
    'color:#3f51b5;background:white',
  );
}
