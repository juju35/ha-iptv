import { IptvPanelI18n } from "./i18n/iptvpaneli18n.js";

// Same limits as the options flow (const.py)
export var IPTV_PANEL_LIMITS = {
  scan_interval: [5, 1440],
  notify_days: [0, 60],
  health_interval: [1, 60],
};

export var IPTV_PANEL_TABS = ['accounts', 'settings'];
// Who the top bar is hidden for (iptv/panel_settings): nobody, everyone, non-administrators only
export var IPTV_PANEL_HIDE_TOOLBAR = ['off', 'all', 'non_admin'];
// The Panel entry of the Settings list (its own settings), beside the accounts
export var IPTV_PANEL_GENERAL = '__panel__';
// Days left under which an active subscription is shown as expiring
export var IPTV_PANEL_WARNING_DAYS = 7;

// The subscriptions: the iptv entities of each device, by translation key, sorted by device name
export function iptvPanelSubscriptions(hass) {
  var byDevice = {};
  Object.values(hass?.entities || {}).forEach((entry) => {
    if (entry?.platform !== 'iptv' || !entry.translation_key || !entry.device_id) return;
    (byDevice[entry.device_id] ||= {})[entry.translation_key] = entry.entity_id;
  });
  return Object.entries(byDevice)
    .map(([device, ids]) => {
      var dev = hass?.devices?.[device];
      return { device, ids, name: dev?.name_by_user || dev?.name || '' };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// What a subscription looks like now, from its entity states; null without a status entity
export function iptvPanelSummary(hass, ids, now = Date.now()) {
  var states = hass?.states || {};
  var status = states[ids.status];
  if (!status) return null;
  if (status.state === 'unavailable') return { tone: 'bad', unavailable: true };
  var value = (key) => {
    var st = ids[key] && states[ids[key]];
    return st && !['unknown', 'unavailable'].includes(st.state) ? st.state : null;
  };
  var number = (key) => (value(key) === null ? null : Number(value(key)));
  var expires = value('expiration') ? Date.parse(value('expiration')) : null;
  var created = value('created') ? Date.parse(value('created')) : null;
  var daysLeft = expires ? Math.ceil((expires - now) / 86400000) : null;
  var raw = String(value('status') || '').toLowerCase();
  var auth = status.state !== 'invalid_auth';
  var active = auth && raw === 'active' && (daysLeft === null || daysLeft > 0);
  var tone = !active ? 'bad' : daysLeft !== null && daysLeft <= IPTV_PANEL_WARNING_DAYS ? 'warn' : 'good';
  // How much of the subscription is left: from its start date, else the shortest usual length that covers it
  var left = null;
  if (expires && created && expires > created) left = (expires - now) / (expires - created);
  else if (expires && expires > now) {
    var period = [30, 91, 182, 365].map((n) => n * 86400000).find((p) => p >= expires - now) || Math.ceil((expires - now) / (365 * 86400000)) * 365 * 86400000;
    left = (expires - now) / period;
  }
  var health = states[ids.health];
  var french = states[ids.french_lists]?.state;
  return {
    tone,
    status: !auth ? 'p_auth_failed' : ['active', 'expired', 'banned', 'disabled'].includes(raw) ? `p_status_${raw}` : 'p_status_unknown',
    expires,
    daysLeft,
    left: left === null ? null : Math.min(1, Math.max(0, left)),
    trial: value('trial') === 'on',
    counts: { channels: number('channels'), movies: number('movies'), series: number('series') },
    connections: [number('active_connections'), number('max_connections')],
    health:
      health && !['unknown', 'unavailable'].includes(health.state)
        ? { state: health.state, ms: health.attributes?.response_time_ms ?? null, at: health.attributes?.last_check || null }
        : null,
    french: french === 'on' ? true : french === 'off' ? false : null,
  };
}

// The message of an error code from the add or edit command; an unknown one is a generic failure
export function iptvPanelError(lang, code) {
  var key = `p_err_${code || 'generic'}`;
  return iptvPanelT(lang, IptvPanelI18n.en[key] ? key : 'p_err_generic');
}

export function iptvPanelT(lang, key, vars) {
  var table = IptvPanelI18n[lang] || IptvPanelI18n.en;
  var text = table[key] || IptvPanelI18n.en[key] || key;
  Object.entries(vars || {}).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

export function iptvPanelEsc(value) {
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (ch) => map[ch]);
}

// How bad a subscription is now: bad (refused, ended, unreachable, its stream down), warn (expiring) or good.
// `alert` names the message the tile shows for it.
export function iptvPanelSeverity(summary) {
  if (!summary || summary.unavailable) return { tone: 'bad', alert: 'p_alert_unreachable' };
  var health = summary.health?.state;
  if (summary.status === 'p_auth_failed' || health === 'auth_failed') return { tone: 'bad', alert: 'p_alert_auth' };
  if (summary.tone === 'bad') return { tone: 'bad', alert: 'p_alert_ended' };
  if (health === 'unreachable') return { tone: 'bad', alert: 'p_alert_unreachable' };
  if (health === 'stream_ko') return { tone: 'bad', alert: 'p_alert_stream' };
  if (summary.tone === 'warn') return { tone: 'warn', alert: 'p_alert_expiring' };
  return { tone: 'good', alert: null };
}

// The picture of a state, as on the card: a live channel, a dark screen in standby, a red cross
export function iptvPanelScene(tone) {
  return { bad: 'offline', idle: 'idle' }[tone] || 'playing';
}

// The card's living-room TV over its cabinet (the right 102 × 80 of a 200 × 80 picture). `uid` keeps clip paths apart.
export function iptvPanelSceneSvg(state, uid) {
  var screen;
  if (state === 'offline') {
    screen = '<g class="tv-x" transform="translate(147 35)"><circle r="7"/><path d="M-3 -3 l6 6 M3 -3 l-6 6"/></g>';
  } else if (state === 'idle') {
    screen = '<path class="tv-glare" d="M150 13 h14 l-26 44 h-14 Z"/>';
  } else {
    screen = `<g clip-path="url(#tv-scr-${uid})"><g class="tv-show"><circle class="tv-sun" cx="128" cy="30" r="6"/>` +
      '<path class="tv-hill" d="M107 57 L130 40 L146 50 L164 36 L187 52 V57Z"/></g></g>' +
      '<g class="tv-live"><rect x="111" y="16" width="18" height="6" rx="1"/><text x="120" y="20.6" text-anchor="middle">LIVE</text></g>';
  }
  return `<svg class="scene ${state}" viewBox="98 0 102 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">` +
    `<defs><clipPath id="tv-scr-${uid}"><rect x="107" y="13" width="80" height="44"/></clipPath></defs>` +
    '<rect class="tv-frame" x="104" y="10" width="86" height="50" rx="2"/><rect class="tv-screen" x="107" y="13" width="80" height="44"/>' +
    `${screen}<circle class="tv-led" cx="186" cy="58.4" r=".9"/>` +
    '<rect class="tv-cab" x="120" y="63" width="54" height="17" rx="1.5"/><rect class="tv-cab-top" x="120" y="63" width="54" height="2.4" rx="1"/>' +
    '<path class="tv-cab-line" d="M147 67 V78 M124 71.5 H143 M151 71.5 H170"/></svg>';
}

// A small glyph on a tile's round icon: a tick, an exclamation mark or a cross, in a dot of the state colour
export function iptvPanelGlyph(tone) {
  var d = { good: 'M7 12.5l3 3 7-7', warn: 'M12 7v6M12 16.5v.5' }[tone] || 'M8 8l8 8M16 8l-8 8';
  return `<span class="st-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></span>`;
}

// Tone of a config entry state, for its pill
export function iptvPanelTone(state) {
  if (state === 'loaded') return 'good';
  if (state === 'setup_retry' || state === 'not_loaded') return 'warn';
  return 'bad';
}
