// ── iptv-card ─────────────────────────────────────────────────────────────────
import { IPTV_DOMAIN } from "./core.js";
import { IPTV_SIZER, iptvBadge, iptvErr, iptvEsc, iptvFocusOf, iptvLang, iptvLocale, iptvMask, iptvRefocus, iptvStateIcon, iptvT, iptvWorstState, textWidth } from "./i18n-helpers.js";
import { IPTV_BANNER_CSS, IPTV_THEMES, iptvIsNight, iptvSceneState, iptvSceneSvg } from "./illustrated-header.js";

export var iptvUidSeq = 0;

export class IptvCard extends HTMLElement {
  static CSS = `
    :host { display: block; position: relative; --iptv-ok: var(--success-color, #43a047); --iptv-warn: var(--warning-color, #ffa600); --iptv-crit: var(--error-color, #db4437);
            /* Text in a state colour: half-way to the text colour, so it stays readable (4.5:1) in light and dark themes */
            --iptv-crit-text: color-mix(in srgb, var(--iptv-crit) 50%, var(--primary-text-color)); }
    /* A size container for the narrow layouts below; while a popup is open, the card grows to hold it */
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 6px; container-type: inline-size;
              box-sizing: border-box; min-height: var(--iptv-modal-h, 0px); }
    /* See IPTV_SIZER: a replaced element with max-width: 100% adds width only to a parent that has none to give */
    .sizer { display: block; width: 400px; max-width: 100%; height: 0; }
    .ok { --c: var(--iptv-ok); } .warning { --c: var(--iptv-warn); } .error { --c: var(--iptv-crit); } .idle { --c: var(--secondary-text-color); }
    .ok, .warning, .error, .idle { --ct: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
    /* 8 px to the body (the card gap is 6 px); the status pill ends the title line, before the buttons */
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
    .header > button:last-child:not(.zoom) { margin-right: -4px; }
    /* Icon buttons never shrink: the title and the status pill give way */
    .header > button { flex: none; }
    .badge { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
             background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 24px; }
    .badge ha-icon { display: inline-flex; }
    /* The title block takes the room the badge and buttons leave (from 0, not from its text width) */
    .titles { flex: 1 1 0; min-width: 6ch; }
    :host([hide-title]) .titles .name { display: none; }
    .title-row { display: flex; align-items: center; gap: 10px; }
    /* The title gives way first (down to its 4 characters), then the pill */
    .title-row .name { flex: 1 1 0; }
    /* The status pill keeps its whole text while it fits; truncated only when the room really runs out (whole text in its tooltip) */
    .title-row > .chip { flex: 0 1 auto; min-width: 0; }
    /* The whole title and its whole text do not fit on one row (measured, see _fitPill): the pill goes under the title */
    .title-row.below { flex-wrap: wrap; row-gap: 4px; }
    .title-row.below > .name { flex-basis: 100%; }
    .title-row.dot-only > .chip .tx { display: none; } .title-row.dot-only > .chip { padding: 1px 5px; }
    /* At least about 4 characters of the title stay visible */
    .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 6ch; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px 1px 5px; border-radius: 12px; font-size: 11px; font-weight: 500; max-width: 100%; box-sizing: border-box;
            color: var(--ct); background: color-mix(in srgb, var(--c) 15%, transparent); --mdc-icon-size: 14px; }
    .chip ha-icon { color: var(--c); flex: none; }
    .chip .tx { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.idle { padding-left: 10px; }
    .chip.fr { padding-left: 6px; gap: 5px; }
    .checked { display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 11px; --mdc-icon-size: 13px; }
    .flag { width: 14px; height: 10px; border-radius: 2px; flex: none; box-shadow: 0 0 0 1px rgba(0,0,0,.12);
            background: linear-gradient(90deg, #0055a4 0 33.3%, #fff 33.3% 66.6%, #ef4135 66.6%); }
    .flag.off { filter: grayscale(1); opacity: .6; }
    .sect { display: flex; flex-direction: column; gap: 5px; }
    .sect.multi + .sect.multi { border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); padding-top: 6px; }
    /* Narrow: the pills go under the subscription name rather than cutting it */
    .sect-head { display: flex; align-items: center; justify-content: space-between; gap: 4px 8px; flex-wrap: wrap; }
    .sect-head .chips { margin-top: 0; flex: 0 1 auto; flex-wrap: wrap; justify-content: flex-end; }
    .sect-name { font-size: 14px; font-weight: 500; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sect-head .sect-name { flex: 1 1 0; min-width: min(10ch, 100%); }
    button { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; align-self: flex-start; display: flex; }
    button:hover { background: var(--secondary-background-color); }
    button.spin ha-icon { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Label and date share the line, the date goes under it when they no longer fit */
    .row { display:flex; flex-wrap: wrap; justify-content:space-between; align-items:baseline; gap: 0 8px; }
    .lbl { color: var(--secondary-text-color); font-size: 11px; }
    .exp .lbl { font-size: 12px; }
    .val { font-weight:500; font-size: 14px; }
    .bar { height:4px; border-radius:3px; background: var(--divider-color, rgba(127,127,127,.25)); margin-top:4px; overflow:hidden; }
    .rem { font-weight:400; font-size:12px; color: var(--secondary-text-color); }
    .rem.warning, .rem.error { color: var(--ct); }
    .fill { height:100%; border-radius:3px; background: var(--c, var(--iptv-ok)); transition: width .6s ease; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px; }
    .stat { display:flex; align-items:center; gap:5px; padding:3px 7px; border-radius:8px; min-width: 0;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .stat ha-icon { color: var(--primary-color); --mdc-icon-size: 15px; flex: none; }
    .num { font-size: 14px; font-weight: 500; line-height: 1.2; white-space:nowrap; }
    .msg { color: var(--secondary-text-color); padding:8px 0; }
    .msg.err { color: var(--iptv-crit-text); }
    [data-entity] { cursor:pointer; }
    [data-entity][tabindex]:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .stat:hover { filter: brightness(0.95); }
    /* Narrow: the buttons go under the last check (still on the right) rather than out of the card */
    .foot { display:flex; flex-wrap: wrap; align-items:center; justify-content:space-between; gap:4px 8px; min-height:20px; }
    .foot-actions { display:flex; align-items:center; gap:8px; margin-left: auto; }
    button.edit, button.del, button.view { padding:4px; margin:0; align-self:center; --mdc-icon-size:16px; }
    button.del:hover { color:var(--iptv-crit); background:color-mix(in srgb, var(--iptv-crit) 12%, transparent); }
    .backdrop { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:flex-start; justify-content:center; padding-top:12px; box-sizing:border-box; z-index:9; border-radius:var(--ha-card-border-radius, 12px); }
    .modal:focus { outline: none; }
    .modal { background:var(--card-background-color, #1c1c1c); color:var(--primary-text-color); width:min(92%, 340px); border-radius:14px; padding:16px; box-shadow:0 8px 30px rgba(0,0,0,.4); display:flex; flex-direction:column; gap:10px; }
    .modal h3 { margin:0; font-size:16px; font-weight:500; }
    .field { display:flex; flex-direction:column; gap:3px; }
    .field label { font-size:11px; color:var(--secondary-text-color); }
    .field input, .field select { font:inherit; font-size:14px; padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3)); background:var(--secondary-background-color, rgba(127,127,127,.08)); color:var(--primary-text-color); }
    .field .hint { font-size:10px; color:var(--secondary-text-color); }
    .modal .err { color:var(--iptv-crit-text); font-size:12px; min-height:14px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:2px; }
    .modal button.act { border-radius:8px; padding:8px 14px; font:inherit; font-size:13px; font-weight:500; width:auto; height:auto; }
    .modal button.cancel { background:var(--secondary-background-color, rgba(127,127,127,.12)); color:var(--primary-text-color); }
    .modal button.primary { background:color-mix(in srgb, var(--primary-color, #03a9f4) 16%, transparent); color:var(--primary-color, #03a9f4); }
    .modal button.primary:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent); }
    .modal button.primary[disabled], .modal button.danger[disabled] { opacity:.6; cursor:default; }
    .modal button.danger { background:color-mix(in srgb, var(--iptv-crit) 16%, transparent); color:var(--iptv-crit-text); }
    .modal button.danger:hover:not([disabled]) { background:color-mix(in srgb, var(--iptv-crit) 24%, transparent); }
    .view-row { display:flex; align-items:center; gap:8px; }
    .view-k { font-size:11px; color:var(--secondary-text-color); width:96px; flex:none; }
    .view-v { flex:1; min-width:0; font-size:13px; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; user-select:all; }
    .modal button.copy, .modal button.reveal { padding:4px; --mdc-icon-size:16px; width:auto; height:auto; background:none; color:var(--secondary-text-color); }
    .modal button.copy.ok { color:var(--iptv-ok); }
    /* Narrow card (inner width; 6 columns of a section = 132 to 220 px): the figures keep their room (no icon, then two tiles a row) */
    @container (max-width: 340px) {
      .stat { justify-content: center; }
      .stat ha-icon { display: none; }
    }
    /* Narrower (6 columns of a section, a phone at 156 px): the title and its pills get a line of their own,
       under the badge and the buttons, so the title and the pill text stay whole */
    @container (max-width: 260px) {
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .header { flex-wrap: wrap; row-gap: 6px; }
      .titles { order: 1; flex-basis: 100%; }
      .header > .titles + button { margin-left: auto; }
      .header, .title-row { gap: 6px; }
      .header > button:not(.zoom) { padding: 6px; }
    }
    /* Phone width: a smaller badge and buttons keep them (and the mini card's detail button) on one line */
    @container (max-width: 200px) {
      .header > .badge { width: 32px; height: 32px; --mdc-icon-size: 20px; }
      .header > button:not(.zoom) { padding: 4px; }
    }
    /* Last resort (narrower than any section column): the status pills keep their icon only */
    @container (max-width: 120px) {
      .title-row > .chip .tx, .titles .chips .chip:not(.fr):not(.idle) .tx { display: none; }
      .title-row > .chip, .titles .chips .chip:not(.fr):not(.idle) { padding: 1px 5px; }
    }
    /* Reduced motion: no spinning or sliding; the refresh button stays dimmed while it works */
    @media (prefers-reduced-motion: reduce) {
      button.spin ha-icon { animation: none; opacity: .5; }
      .fill { transition: none; }
    }
    ${IPTV_BANNER_CSS}`;

  static getStubConfig() {
    return {};
  }

  // Visual editor: native Home Assistant form (rendered by HA itself)
  static getConfigForm() {
    var ha = document.querySelector('home-assistant');
    var lang = iptvLang(null, ha?.hass);
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'show_title', default: true, selector: { boolean: {} } },
        { name: 'illustration', default: true, selector: { boolean: {} } },
        { name: 'illustration_theme', default: 'auto', selector: { select: { mode: 'dropdown', options:
          IPTV_THEMES.map((v) => ({ value: v, label: iptvT(lang, `theme_${v}`) })) } } },
        { name: 'devices', selector: { device: { integration: IPTV_DOMAIN, multiple: true } } },
        { name: 'warning_days', selector: { number: { min: 1, max: 60, mode: 'box' } } },
        { name: 'language', selector: { select: { mode: 'dropdown', options: [
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'es', label: 'Español' },
          { value: 'it', label: 'Italiano' },
          { value: 'nl', label: 'Nederlands' },
          { value: 'pt', label: 'Português (Portugal)' },
          { value: 'pl', label: 'Polski' },
          { value: 'ro', label: 'Română' },
          { value: 'da', label: 'Dansk' },
          { value: 'sv', label: 'Svenska' },
          { value: 'bg', label: 'Български' },
          { value: 'ru', label: 'Русский' },
          { value: 'uk', label: 'Українська' },
          { value: 'hu', label: 'Magyar' },
          { value: 'sk', label: 'Slovenčina' },
          { value: 'cs', label: 'Čeština' },
          { value: 'sl', label: 'Slovenščina' },
          { value: 'lv', label: 'Latviešu' },
          { value: 'el', label: 'Ελληνικά' },
          { value: 'sr', label: 'Српски' },
          { value: 'sr-Latn', label: 'Srpski (latinica)' },
        ] } } },
      ],
      computeLabel: (schema) => iptvT(lang, `ed_${schema.name}`),
    };
  }

  setConfig(config) {
    if (config?.illustration_theme != null && !IPTV_THEMES.includes(config.illustration_theme)) {
      throw new Error('illustration_theme must be auto, day or night');
    }
    if (this._uid == null) this._uid = ++iptvUidSeq;
    this._config = { warning_days: 7, ...config };
    // show_title: the header's title, hidden by the stylesheet
    this.toggleAttribute?.('hide-title', config.show_title === false);
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._sig = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Re-render only when one of our entities, a device name or the language changed
    // (and the dark mode, for the illustration's night picture)
    var parts = [hass.language, !!hass.user?.is_admin, !!hass.themes?.darkMode];
    this._subs().forEach((sub) => {
      parts.push(`${sub.device}:${sub.name}`);
      Object.keys(sub.ids).forEach((k) => {
        var st = hass.states[sub.ids[k]];
        parts.push(`${k}=${st ? `${st.state}@${st.last_updated}` : ''}`);
      });
    });
    var sig = parts.join('|');
    if (sig === this._sig) return;
    this._sig = sig;
    this._loading = false;
    this._render();
  }

  getGridOptions() {
    // Full width of a section by default; below 6 columns (246 px) the figures no longer fit
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  getCardSize() {
    var n = Math.max(1, this._hass ? this._subs().length : 1);
    return n > 1 ? 1 + 2 * n : 3;
  }

  _t(key, vars) {
    return iptvT(iptvLang(this._config, this._hass), key, vars);
  }

  _err(code) {
    return iptvErr(iptvLang(this._config, this._hass), code);
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
    if (!this._hass?.entities) return [];
    var wanted = this._wanted();
    var subs = this._collect(wanted);
    // Configured devices all gone (e.g. account removed, or re-added with a new
    // id): fall back to every subscription instead of showing an empty card
    if (wanted.length && !subs.length) subs = this._collect([]);
    return subs;
  }

  // Subscriptions matching `wanted` (device ids), or all when `wanted` is empty,
  // in the configured order or by name
  _collect(wanted) {
    var byDevice = {};
    Object.values(this._hass.entities).forEach((e) => {
      if (e.platform !== IPTV_DOMAIN || !e.translation_key || !e.device_id) return;
      if (wanted.length && wanted.indexOf(e.device_id) < 0) return;
      (byDevice[e.device_id] = byDevice[e.device_id] || {})[e.translation_key] = e.entity_id;
    });
    var devices = this._hass.devices || {};
    var subs = Object.keys(byDevice).map((id) => {
      var dev = devices[id];
      return { device: id, name: (dev && (dev.name_by_user || dev.name)) || '', ids: byDevice[id] };
    });
    if (wanted.length) subs.sort((a, b) => wanted.indexOf(a.device) - wanted.indexOf(b.device));
    else subs.sort((a, b) => a.name.localeCompare(b.name));
    return subs;
  }

  async _refresh() {
    var ids = [];
    this._subs().forEach((sub) => {
      ids.push(sub.ids.status, sub.ids.health);
    });
    ids = ids.filter(Boolean);
    if (!ids.length || this._loading) return;
    this._loading = true;
    this._refreshFailed = false;
    this._render();
    try {
      await this._hass.callService('homeassistant', 'update_entity', { entity_id: ids });
    } catch (err) {
      // WebSocket down or server error: say so on the button instead of an unhandled rejection
      console.error('iptv-card: refresh failed', err);
      this._refreshFailed = true;
      this._loading = false;
      this._render();
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
    var attrs = st.attributes || {};
    var ms = attrs.response_time_ms;
    return { status: st.state, ms: ms == null ? null : Number(ms), at: attrs.last_check || null };
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
      : known.indexOf(raw) >= 0 ? this._t(`status_${raw}`) : this._t('status_unknown');
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

  // Status pill of one subscription; on a narrow card only its icon shows, the label stays in its tooltip
  _statusChip(v) {
    if (!v) return '';
    var label = iptvEsc(v.statusLabel);
    return `<span class="chip st ${v.state}" data-entity="status" title="${label}"><ha-icon icon="${iptvStateIcon(v.state)}"></ha-icon><span class="tx">${label}</span></span>`;
  }

  // The illustrated header is on unless `illustration: false`
  _illustrated() {
    return this._config.illustration !== false;
  }

  // The banner: the wall and its TV (in the picture of `state`), the icon and `titles` on the left, `acts` (buttons) in
  // its top-right corner
  _banner(state, titles, acts) {
    var night = iptvIsNight(this._hass, this._config);
    return `<div class="banner${night ? ' night' : ''}">${iptvSceneSvg(iptvSceneState(state), this._uid)}` +
      `<div class="htext">${iptvBadge(state)}<div class="titles">${titles}</div></div><div class="acts">${acts}</div>` +
      '<div class="ground"></div></div>';
  }

  // Views of the subscriptions for the summary pill: an unreachable one is an error, an expired one says so
  _views(subs) {
    return subs.map((sub) => {
      var v = this._view(this._data(sub.ids));
      if (!v) return { unavailable: true, state: 'error' };
      v.expired = v.state === 'error' && v.d.auth && (String(v.d.status).toLowerCase() === 'expired' || (v.daysLeft !== null && v.daysLeft <= 0));
      return v;
    });
  }

  // Global pill: the worst state of the subscriptions, with how many are in it
  _miniStatus(views) {
    if (!views.length) return '';
    var count = (state) => views.filter((v) => v.state === state).length;
    var n = (key, k) => this._t(k > 1 ? `${key}_plural` : key, { n: k });
    var state;
    var label;
    if (views.every((v) => v.unavailable)) [state, label] = ['error', this._t('unavailable')];
    else if (count('error')) {
      var expired = views.filter((v) => v.expired).length;
      [state, label] = ['error', expired === count('error') ? n('mini_expired', expired) : n('mini_error', count('error'))];
    } else if (count('warning')) [state, label] = ['warning', n('mini_expiring', count('warning'))];
    else [state, label] = ['ok', views.length > 1 ? this._t('mini_all_active') : this._t('status_active')];
    label = iptvEsc(label);
    return `<span class="chip st ${state}" title="${label}" aria-label="${label}"><ha-icon icon="${iptvStateIcon(state)}"></ha-icon><span class="tx">${label}</span></span>`;
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var lang = iptvLang(this._config, this._hass);
    var locale = iptvLocale(lang, this._hass);
    var fmtDate = (ms) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    var nf = new Intl.NumberFormat(locale);
    var esc = iptvEsc;
    var subs = this._hass ? this._subs() : [];
    var multi = subs.length > 1;
    var title = this._config.title || this._t(multi ? 'default_title_multi' : 'default_title');

    var fmtMs = (ms) => (ms < 1000 ? `${nf.format(ms)} ms` : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ms / 1000)} s`);

    // Health pill: server reachability and response time
    var healthChip = (h, v) => {
      if (!h) return '';
      // Refused credentials are already shown by the status pill
      if (h.status === 'auth_failed' && v && !v.d.auth) return '';
      var cls = { ok: 'ok', degraded: 'warning' }[h.status] || 'error';
      var icon = { ok: 'mdi:lan-connect', degraded: 'mdi:speedometer-slow', stream_ko: 'mdi:television-off' }[h.status] || 'mdi:lan-disconnect';
      var label = this._t(`health_${h.status}`) + (h.ms != null && h.status !== 'unreachable' ? ` · ${fmtMs(h.ms)}` : '');
      return `<span class="chip ${cls}" data-entity="health" title="${esc(label)}"><ha-icon icon="${icon}"></ha-icon><span class="tx">${esc(label)}</span></span>`;
    };

    // French flag pill: French lists found (green) or not (red)
    var frenchChip = (fr) =>
      fr === null || fr === undefined
        ? ''
        : `<span class="chip ${fr ? 'ok' : 'error'} fr" data-entity="french_lists" title="${esc(this._t('french_title'))}"><span class="flag${fr ? '' : ' off'}"></span><span class="tx">${esc(this._t(fr ? 'french_on' : 'french_off'))}</span></span>`;

    var statusChip = (v) => this._statusChip(v);
    // Trial, French and health pills of one subscription
    var infoChips = (v, h, fr) =>
      `${v?.d.is_trial ? `<span class="chip idle"><span class="tx">${esc(this._t('trial'))}</span></span>` : ''}${v ? frenchChip(fr) : ''}${healthChip(h, v)}`;
    // Every pill of one subscription, in a row
    var chips = (v, h, fr) => (!v && !h ? '' : `<div class="chips">${statusChip(v)}${infoChips(v, h, fr)}</div>`);

    // Expiration and tiles of one subscription
    var details = (v) => {
      var remaining =
        v.daysLeft === null
          ? this._t('unlimited')
          : v.daysLeft > 0
            ? this._t(v.daysLeft > 1 ? 'days_left' : 'day_left', { n: v.daysLeft })
            : this._t('status_expired');
      var cons =
        v.d.max_connections != null ? `${v.d.active_cons || 0} / ${v.d.max_connections}` : '—';
      var stat = (icon, n, key) => `
          <div class="stat" data-entity="${key}" title="${esc(this._t(key))}">
            <ha-icon icon="${icon}"></ha-icon>
            <div class="num">${n != null ? nf.format(n) : '—'}</div>
          </div>`;
      return `
        <div class="exp" data-entity="expiration">
          <div class="row">
            <span class="lbl">${this._t('expiration')}</span>
            <span class="val">${v.exp ? fmtDate(v.exp) : this._t('never')} <span class="rem ${v.state}">· ${esc(remaining)}</span></span>
          </div>
          ${v.pct !== null ? `<div class="bar"><div class="fill ${v.state}" style="width:${v.pct.toFixed(1)}%"></div></div>` : ''}
        </div>
        <div class="stats">
          ${stat('mdi:television-classic', v.d.channels, 'channels')}
          ${stat('mdi:movie-open', v.d.movies, 'movies')}
          ${stat('mdi:filmstrip-box-multiple', v.d.series, 'series')}
          ${v.d.max_connections != null
            ? `<div class="stat" data-entity="active_connections" title="${esc(this._t('connections'))}">
            <ha-icon icon="mdi:account-multiple"></ha-icon>
            <div class="num">${esc(cons)}</div>
          </div>`
            : ''}
        </div>`;
    };

    var fmtCheck = (iso) => {
      var when = new Date(iso);
      if (Number.isNaN(when.getTime())) return '';
      var sameDay = when.toDateString() === new Date().toDateString();
      return sameDay
        ? when.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
        : when.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };
    // Account management (view / edit / remove / add) uses admin-only services
    var admin = !!this._hass?.user?.is_admin;
    var footer = (h, i) => `
        <div class="foot">
          ${h?.at
            ? `<div class="checked" data-entity="last_check"><ha-icon icon="mdi:clock-outline"></ha-icon>${esc(this._t('last_check'))} · ${esc(fmtCheck(h.at))}</div>`
            : '<span></span>'}
          ${admin
            ? `<div class="foot-actions">
            <button class="view" data-sub="${i}" title="${esc(this._t('view_btn'))}"><ha-icon icon="mdi:eye-outline"></ha-icon></button>
            <button class="edit" data-sub="${i}" title="${esc(this._t('edit_btn'))}"><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="del" data-sub="${i}" title="${esc(this._t('del_btn'))}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
          </div>`
            : ''}
        </div>`;

    var body;
    // One subscription: its status pill ends the title line, the other pills go under it
    var status = '';
    var info = '';
    var infoRaw = '';
    // State of each subscription shown (an unreachable one counts as an error), for the header badge
    var states = [];
    if (!this._hass) {
      body = `<div class="msg">${this._t('loading')}</div>`;
    } else if (!subs.length) {
      body = `<div class="msg">${this._t('no_device')}</div>`;
    } else if (!multi) {
      var v = this._view(this._data(subs[0].ids));
      var h0 = this._health(subs[0].ids);
      states.push(v ? v.state : 'error');
      status = statusChip(v);
      info = infoChips(v, h0, this._french(subs[0].ids)).trim();
      infoRaw = info;
      if (info) info = `<div class="chips">${info}</div>`;
      body = '<div class="sect" data-sub="0">' +
        (v ? details(v) : `<div class="msg err">${this._t('unavailable')}</div>`) +
        footer(h0, 0) + '</div>';
    } else {
      // Several subscriptions: one section each, named after its device
      body = subs.map((sub, i) => {
        var v = this._view(this._data(sub.ids));
        var h = this._health(sub.ids);
        states.push(v ? v.state : 'error');
        return `
          <div class="sect multi" data-sub="${i}">
            <div class="sect-head">
              <div class="sect-name">${esc(sub.name)}</div>
              ${chips(v, h, this._french(sub.ids))}
            </div>
            ${v ? details(v) : `<div class="msg err">${this._t('unavailable')}</div>`}
            ${footer(h, i)}
          </div>`;
      }).join('');
    }

    if (!this._root) { this._root = document.createElement('div'); this.shadowRoot.appendChild(this._root); }
    var focus = iptvFocusOf(this.shadowRoot, this._root);
    var buttons = `${admin ? `<button class="add" title="${esc(this._t('add_btn'))}"><ha-icon icon="mdi:plus"></ha-icon></button>` : ''}
          <button class="refresh ${this._loading ? 'spin' : ''}" title="${esc(this._t(this._refreshFailed ? 'err_generic' : 'refresh'))}"><ha-icon icon="mdi:refresh"></ha-icon></button>`;
    var worst = iptvWorstState(states);
    var header;
    if (this._illustrated()) {
      // On the title row: the status pill of the subscription, or the summary pill of several (each one keeps its
      // pills in its section); under it, the other pills of a single subscription
      var pill = multi ? this._miniStatus(this._views(subs)) : status;
      header = this._banner(worst, `<div class="head"><div class="name">${esc(title)}</div>${pill}</div>${!multi && infoRaw ? `<div class="chips">${infoRaw}</div>` : ''}`, buttons);
    } else {
      header = `<div class="header">
          ${iptvBadge(worst)}
          <div class="titles"><div class="title-row"><div class="name">${esc(title)}</div>${multi ? this._miniStatus(this._views(subs)) : status}</div>${info}</div>
          ${buttons}
        </div>`;
    }
    this._root.innerHTML = `
      <style>${this.constructor.CSS}</style>
      <ha-card${this._illustrated() ? ' class="ill"' : ''}>
        ${header}
        ${body}
      </ha-card>${IPTV_SIZER}`;
    this._root.querySelector('button.refresh').addEventListener('click', () => this._refresh());
    this._root.querySelector('button.add')?.addEventListener('click', () => this._openAdd());
    this._root.querySelectorAll('button.edit').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._openEditor(sub));
    });
    this._root.querySelectorAll('button.del').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._confirmDelete(sub));
    });
    this._root.querySelectorAll('button.view').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._openView(sub));
    });
    this._bindMoreInfo(subs);
    this._fitPill();
    iptvRefocus(this._root, focus);
  }

  // The banner's status pill, measured after each render and on a new width (in every language): it sits on the
  // title's row, right after the title, only when the whole title and the pill's whole label fit there; otherwise it
  // takes a line of its own under the subtitle (.below), the title whole on its row (cut only when it does not fit
  // alone) and the subtitle on one line. When the three lines do not fit in the banner above the ground strip, or
  // the label does not fit its line, the pill shows its dot alone (.dot-only): beside the title when the whole title
  // leaves it room, else under the subtitle.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.('.htext .titles, .header .title-row, .mini .body') || []) {
      const row = t.matches('.title-row') ? t : t.querySelector('.head');
      const chips = row ? [...row.querySelectorAll(':scope > .chip.st')] : [];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove('below', 'dot-only');
      const name = row.querySelector('.name');
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const outer = (c) => c.getBoundingClientRect().width + (parseFloat(getComputedStyle(c).marginLeft) || 0) + (parseFloat(getComputedStyle(c).marginRight) || 0);
      const others = [...row.children].filter((c) => c !== name && !chips.includes(c) && c.getClientRects().length);
      const room = row.getBoundingClientRect().width - others.reduce((w, c) => w + outer(c) + gap, 0);
      const title = name && getComputedStyle(name).display !== 'none' ? textWidth(name) + gap : 0;
      const pills = () => chips.reduce((w, c) => w + c.getBoundingClientRect().width, gap * (chips.length - 1));
      if (title + pills() <= room) continue;
      t.classList.add('below');
      const banner = t.closest('.banner') || t;
      const ground = banner.querySelector('.ground');
      const floor = ground ? ground.getBoundingClientRect().top : banner.getBoundingClientRect().bottom;
      const box = t.getBoundingClientRect();
      // Whole: the label not cut and the pill not past the title block (into the picture).
      const whole = chips.every((c) => {
        const tx = c.querySelector('.tx');
        return (!tx || tx.scrollWidth <= tx.clientWidth + 0.5) && c.getBoundingClientRect().right <= box.right + 0.5;
      });
      if (whole && box.bottom <= floor + 0.5 && box.top >= banner.getBoundingClientRect().top - 0.5) continue;
      t.classList.add('dot-only');
      if (title + pills() <= room) t.classList.remove('below');
    }
  }

  connectedCallback() {
    if (!this._fitObserver && typeof ResizeObserver === 'function') this._fitObserver = new ResizeObserver(() => this._fitPill());
    this._fitObserver?.observe(this);
    document.fonts?.ready?.then(() => this._fitPill());
  }

  disconnectedCallback() {
    this._fitObserver?.disconnect();
    // Left (another view, a conditional card hidden): an open popup closes without doing anything
    this._closeEditor();
  }

  // [data-entity] elements open their subscription's entity; header pills (single
  // subscription) belong to the first subscription
  _bindMoreInfo(subs) {
    this._root.querySelectorAll('[data-entity]').forEach((el) => {
      var sect = el.closest('[data-sub]');
      var sub = subs[sect ? Number(sect.dataset.sub) : 0];
      var entityId = sub?.ids[el.dataset.entity];
      if (!entityId) return;
      // A button for the keyboard and screen readers too: Tab to reach it, Enter or Space to open it
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => this._moreInfo(entityId));
      el.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Enter' && ev.key !== ' ') return;
        ev.preventDefault();
        this._moreInfo(entityId);
      });
    });
  }

  // Open the Home Assistant entity dialog
  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entityId }, bubbles: true, composed: true }));
  }

  // ── Edit credentials popup ────────────────────────────────────────────────
  async _openEditor(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`<h3 id="iptv-dialog-title">${esc(this._t('edit_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
    this._editDevice = sub.device;

    var prefill = await this._ws('edit_account', { device_id: sub.device });
    if (this._modal !== modal) return;
    // not_found / generic: the error, as in the view popup, instead of an empty form
    if (!prefill.ok) return this._modalError(modal, 'edit_title', prefill.error);

    var provider = prefill.provider === 'stalker' ? 'stalker' : 'xtream';
    this._editProvider = provider;
    var field = (key, type, value) => `
      <div class="field">
        <label>${esc(this._t(`edit_${key}`))}</label>
        <input data-k="${key}" type="${type}" value="${esc(value)}" autocomplete="off" autocapitalize="off" spellcheck="false"
               ${type === 'password' ? `placeholder="${esc(this._t('edit_password_keep'))}"` : ''}>
      </div>`;
    var fields =
      provider === 'stalker'
        ? field('url', 'text', prefill.url) + field('mac', 'text', prefill.mac)
        : field('url', 'text', prefill.url) + field('username', 'text', prefill.username) + field('password', 'password', '');
    modal.querySelector('.modal').innerHTML = `
      <h3 id="iptv-dialog-title">${esc(this._t('edit_title'))}</h3>
      ${fields}
      <div class="err"></div>
      <div class="modal-actions">
        <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
        <button class="act primary">${esc(this._t('edit_save'))}</button>
      </div>`;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.primary').addEventListener('click', () => this._submitEditor());
    modal.querySelectorAll('input').forEach((el) => {
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submitEditor(); });
    });
    this._focusModal(modal, 'input');
  }

  // Close the open popup: the card gets its height and keyboard back, the focus returns to the button that opened it
  _closeEditor() {
    if (!this._modal) return;
    this._modal.remove();
    this._modal = null;
    this._modalObserver?.disconnect();
    this._modalObserver = null;
    this.style.removeProperty('--iptv-modal-h');
    if (this._root) this._root.inert = false;
    iptvRefocus(this._root, this._modalOpener);
    this._modalOpener = null;
  }

  // Call an iptv service that returns a response; {} or {ok:false} on failure
  async _svc(service, data) {
    try {
      var res = await this._hass.callService('iptv', service, data, undefined, false, true);
      return (res?.response) || {};
    } catch (_e) {
      return { ok: false, error: 'generic' };
    }
  }

  // Admin WebSocket command (iptv/<command>): unlike a service call, it fires no
  // call_service event, so the password never reaches the recorder database
  async _ws(command, data) {
    try {
      return (await this._hass.callWS({ type: `iptv/${command}`, ...data })) || {};
    } catch (_e) {
      return { ok: false, error: 'generic' };
    }
  }

  // Open a modal with the given inner HTML (wrapped in .modal) and return it. It is a modal dialog named by
  // its <h3 id="iptv-dialog-title">: the card under the veil is inert, Escape closes it, and the card grows
  // to hold it instead of letting it cover the next card.
  _openModal(innerHtml) {
    this._closeEditor();
    this._modalOpener = iptvFocusOf(this.shadowRoot, this._root);
    var modal = document.createElement('div');
    modal.className = 'backdrop';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="iptv-dialog-title" tabindex="-1">${innerHtml}</div>`;
    modal.addEventListener('click', (e) => { if (e.target === modal) this._closeEditor(); });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') this._trapTab(e, modal);
      if (e.key !== 'Escape') return;
      // Only this popup: not a Home Assistant dialog the card is in
      e.stopPropagation();
      this._closeEditor();
    });
    this.shadowRoot.appendChild(modal);
    this._modal = modal;
    if (this._root) this._root.inert = true;
    var box = modal.querySelector('.modal');
    // 12 px above and below the popup; its height changes with its content (loading, fields, errors)
    var fit = () => this.style.setProperty('--iptv-modal-h', `${Math.ceil(box.offsetHeight) + 24}px`);
    if (typeof ResizeObserver === 'function') {
      this._modalObserver = new ResizeObserver(fit);
      this._modalObserver.observe(box);
    }
    fit();
    box.focus({ preventScroll: true });
    return modal;
  }

  // Tab and Shift+Tab go round the popup's controls instead of leaving it for the page
  _trapTab(e, modal) {
    var items = [...modal.querySelectorAll('input, select, button:not([disabled])')];
    if (!items.length) return;
    var active = this.shadowRoot.activeElement;
    var last = items[items.length - 1];
    if (e.shiftKey && (active === items[0] || !items.includes(active))) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && (active === last || !items.includes(active))) {
      e.preventDefault();
      items[0].focus({ preventScroll: true });
    }
  }

  // Focus the first control of a popup matching the selector (the popup itself keeps it otherwise);
  // never scrolls the page: the popup opens where the user just clicked
  _focusModal(modal, selector) {
    modal.querySelector(selector)?.focus({ preventScroll: true });
  }

  _confirmDelete(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`
        <h3 id="iptv-dialog-title">${esc(this._t('del_title'))}</h3>
        <div class="hint">${esc(sub.name)} — ${esc(this._t('del_confirm'))}</div>
        <div class="err"></div>
        <div class="modal-actions">
          <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
          <button class="act danger">${esc(this._t('del_delete'))}</button>
        </div>
      `);
    this._delDevice = sub.device;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.danger').addEventListener('click', () => this._deleteAccount());
    // Cancel, not Remove: Enter right after opening does not delete the account
    this._focusModal(modal, '.cancel');
  }

  async _deleteAccount() {
    var modal = this._modal;
    if (!modal) return;
    var btn = modal.querySelector('.danger');
    var errEl = modal.querySelector('.err');
    errEl.textContent = '';
    btn.setAttribute('disabled', '');
    btn.textContent = this._t('edit_saving');
    var out = await this._svc('remove_account', { device_id: this._delDevice });
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null;
      return;
    }
    btn.removeAttribute('disabled');
    btn.textContent = this._t('del_delete');
    errEl.textContent = this._err(out.error);
  }

  // ── Add account popup ─────────────────────────────────────────────────────
  _openAdd() {
    var esc = iptvEsc;
    var modal = this._openModal(`
        <h3 id="iptv-dialog-title">${esc(this._t('add_title'))}</h3>
        <div class="field">
          <label>${esc(this._t('add_provider'))}</label>
          <select class="prov">
            <option value="xtream">${esc(this._t('add_xtream'))}</option>
            <option value="stalker">${esc(this._t('add_stalker'))}</option>
          </select>
        </div>
        <div class="addfields"></div>
        <div class="err"></div>
        <div class="modal-actions">
          <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
          <button class="act primary">${esc(this._t('add_create'))}</button>
        </div>
      `);
    var sel = modal.querySelector('.prov');
    var renderFields = () => {
      var field = (key, type) => `
        <div class="field">
          <label>${esc(this._t(`edit_${key}`))}</label>
          <input data-k="${key}" type="${type}" autocomplete="off" autocapitalize="off" spellcheck="false">
        </div>`;
      modal.querySelector('.addfields').innerHTML =
        sel.value === 'stalker'
          ? field('url', 'text') + field('mac', 'text')
          : field('url', 'text') + field('username', 'text') + field('password', 'password');
    };
    sel.addEventListener('change', renderFields);
    renderFields();
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.primary').addEventListener('click', () => this._submitAdd());
    this._focusModal(modal, '.prov');
  }

  async _submitAdd() {
    var modal = this._modal;
    if (!modal) return;
    var provider = modal.querySelector('.prov').value;
    var vals = {};
    modal.querySelectorAll('input[data-k]').forEach((el) => { vals[el.dataset.k] = el.value; });
    var payload = { provider: provider, url: (vals.url || '').trim() };
    if (provider === 'stalker') {
      payload.mac = (vals.mac || '').trim();
    } else {
      payload.username = (vals.username || '').trim();
      payload.password = vals.password || '';
    }
    var errEl = modal.querySelector('.err');
    var btn = modal.querySelector('.primary');
    errEl.textContent = '';
    btn.setAttribute('disabled', '');
    btn.textContent = this._t('edit_saving');
    var out = await this._ws('add_account', payload);
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null;
      return;
    }
    btn.removeAttribute('disabled');
    btn.textContent = this._t('add_create');
    errEl.textContent = this._err(out.error);
  }

  // ── View credentials popup ────────────────────────────────────────────────
  async _openView(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`<h3 id="iptv-dialog-title">${esc(this._t('view_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
    var creds = await this._ws('get_credentials', { device_id: sub.device });
    if (this._modal !== modal) return;
    if (!creds.ok) return this._modalError(modal, 'view_title', creds.error);
    var close = `<div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    // [label, value, secret]: 'whole' masks the value, 'url' its password parameter
    var rows = creds.provider === 'stalker'
      ? [['edit_url', creds.url], ['edit_mac', creds.mac]]
      : [['edit_url', creds.url], ['edit_username', creds.username], ['edit_password', creds.password, 'whole']];
    // Xtream Codes: the playlist and the guide to paste into a player (VLC, TiviMate, Jellyfin…)
    if (creds.m3u_url) rows.push(['view_m3u', creds.m3u_url, 'url']);
    if (creds.xmltv_url) rows.push(['view_xmltv', creds.xmltv_url, 'url']);
    var rowsHtml = rows.map((r) => `
      <div class="view-row">
        <div class="view-k">${esc(this._t(r[0]))}</div>
        <div class="view-v">${esc(r[2] ? iptvMask(r[1], r[2] === 'whole') : r[1])}</div>
        ${r[2] ? `<button class="reveal" title="${esc(this._t('view_show'))}" aria-label="${esc(this._t('view_show'))}" aria-pressed="false"><ha-icon icon="mdi:eye"></ha-icon></button>` : ''}
        <button class="copy" title="${esc(this._t('copy'))}"><ha-icon icon="mdi:content-copy"></ha-icon></button>
      </div>`).join('');
    modal.querySelector('.modal').innerHTML = `<h3 id="iptv-dialog-title">${esc(this._t('view_title'))}</h3>${rowsHtml}${close}`;
    // The values stay in a closure: a secret is written into the DOM only while shown, and the popup
    // is rebuilt masked each time it opens
    modal.querySelectorAll('.view-row').forEach((row, i) => {
      var r = rows[i];
      var copy = row.querySelector('button.copy');
      copy.addEventListener('click', () => this._copy(copy, r[1]));
      var reveal = row.querySelector('button.reveal');
      if (reveal) reveal.addEventListener('click', () => this._toggleSecret(row, reveal, r));
    });
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    this._focusModal(modal, 'button.copy');
  }

  // Show or mask again one secret row of the view popup
  _toggleSecret(row, btn, r) {
    var shown = btn.getAttribute('aria-pressed') !== 'true';
    row.querySelector('.view-v').textContent = shown ? r[1] : iptvMask(r[1], r[2] === 'whole');
    var label = this._t(shown ? 'view_hide' : 'view_show');
    btn.setAttribute('aria-pressed', String(shown));
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    btn.querySelector('ha-icon').setAttribute('icon', shown ? 'mdi:eye-off' : 'mdi:eye');
  }

  // Error message in an open popup, with a close button
  _modalError(modal, titleKey, error) {
    var esc = iptvEsc;
    modal.querySelector('.modal').innerHTML = `<h3 id="iptv-dialog-title">${esc(this._t(titleKey))}</h3><div class="err">${esc(this._err(error))}</div><div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    this._focusModal(modal, '.cancel');
  }

  async _copy(el, text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_e) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        this.shadowRoot.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      } catch (_e2) { /* ignore */ }
    }
    var icon = el.querySelector('ha-icon');
    icon.setAttribute('icon', 'mdi:check');
    el.classList.add('ok');
    setTimeout(() => { icon.setAttribute('icon', 'mdi:content-copy'); el.classList.remove('ok'); }, 1200);
  }

  async _submitEditor() {
    var modal = this._modal;
    if (!modal) return;
    var vals = {};
    modal.querySelectorAll('input[data-k]').forEach((el) => { vals[el.dataset.k] = el.value; });
    var payload = { device_id: this._editDevice, url: (vals.url || '').trim() };
    if (this._editProvider === 'stalker') {
      payload.mac = (vals.mac || '').trim();
    } else {
      payload.username = (vals.username || '').trim();
      if (vals.password) payload.password = vals.password; // blank keeps the current password
    }
    var errEl = modal.querySelector('.err');
    var primary = modal.querySelector('.primary');
    errEl.textContent = '';
    primary.setAttribute('disabled', '');
    primary.textContent = this._t('edit_saving');
    var out = await this._ws('edit_account', payload);
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null; // the entry reloaded; re-render on the next state
      return;
    }
    primary.removeAttribute('disabled');
    primary.textContent = this._t('edit_save');
    errEl.textContent = this._err(out.error);
  }
}
