import { IptvCardI18n } from "./i18n/iptvcardi18n.js";

// A language of the card: the full code when it has a table (sr-Latn), else its base (de-AT → de), else English
// The width of an element's whole text in its own font, in fractional pixels (scrollWidth is rounded).
export let textCtx;
export const textWidth = (el) => {
  const cs = getComputedStyle(el);
  textCtx ??= document.createElement('canvas').getContext?.('2d');
  if (!textCtx) return el.scrollWidth;
  textCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  return Math.max(el.scrollWidth, textCtx.measureText(el.textContent.trim()).width + pad);
};

export function iptvSupported(code) {
  if (!code) return null;
  if (IptvCardI18n[code]) return code;
  var base = code.split('-')[0];
  return IptvCardI18n[base] ? base : 'en';
}

export function iptvLang(config, hass) {
  return iptvSupported(config?.language || hass?.language || document.documentElement.lang) || 'en';
}

// Locale for Intl / toLocale*: the full Home Assistant locale when its language is the card's (fr-CA, de-CH),
// else the card language (the language option wins); a bare pt is European Portuguese (pt-PT), not Brazilian
export function iptvLocale(lang, hass) {
  var full = hass?.locale?.language || hass?.language || '';
  var latn = (c) => /-Latn/i.test(c);
  var same = full && full.split('-')[0] === lang.split('-')[0] && (lang.split('-')[0] !== 'sr' || latn(full) === latn(lang));
  var locale = same ? full : lang;
  return locale === 'pt' ? 'pt-PT' : locale;
}

export function iptvT(lang, key, vars) {
  var strings = IptvCardI18n[lang] || IptvCardI18n.en;
  var s = strings[key] || IptvCardI18n.en[key] || key;
  if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
  return s;
}

// Message of a service error code; an unknown code (e.g. already_in_progress) falls back to err_generic
export function iptvErr(lang, code) {
  var key = `err_${code || 'generic'}`;
  return iptvT(lang, IptvCardI18n.en[key] ? key : 'err_generic');
}

// Controls of a card that can hold the focus, in document order
export var IPTV_FOCUSABLE = 'button, [data-entity][tabindex]';

// What identifies a control across re-renders: its tag, classes (but the transient spin), entity and subscription
export function iptvFocusSig(el) {
  var cls = String(el.className || '').split(/\s+/).filter((c) => c && c !== 'spin').join('.');
  var sub = el.dataset?.sub ?? el.closest?.('[data-sub]')?.dataset.sub ?? '';
  return [el.tagName, cls, el.dataset?.entity ?? '', sub].join('|');
}

// The focused control of a card rendered with innerHTML, so the next render can give the focus back
export function iptvFocusOf(shadow, root) {
  var el = shadow?.activeElement;
  if (!el || !root?.contains(el)) return null;
  var list = [...root.querySelectorAll(IPTV_FOCUSABLE)];
  var index = list.indexOf(el);
  return index < 0 ? null : { index, sig: iptvFocusSig(el) };
}

export function iptvRefocus(root, focus) {
  if (!focus || !root) return;
  var el = [...root.querySelectorAll(IPTV_FOCUSABLE)][focus.index];
  if (el && iptvFocusSig(el) === focus.sig) el.focus({ preventScroll: true });
}

// Worst state of the subscriptions shown (error, then warning, then ok), idle when there are none
export function iptvWorstState(states) {
  return ['error', 'warning', 'ok'].find((s) => states.includes(s)) || 'idle';
}

// Header badge: the TV icon tinted with the card's state colour
export function iptvBadge(state) {
  return `<div class="badge ${state}"><ha-icon icon="mdi:television-play"></ha-icon></div>`;
}

// Icon of a subscription state (ok, warning, error)
export function iptvStateIcon(state) {
  return { ok: 'mdi:check-circle', warning: 'mdi:alert' }[state] || 'mdi:close-circle';
}

export function iptvEsc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Masked text of a secret row: the whole password, or the password=… parameter of a playlist / guide URL
export var IPTV_MASK = '••••••••';
export function iptvMask(value, whole) {
  if (whole) return IPTV_MASK;
  return String(value == null ? '' : value).replace(/([?&]password=)[^&#]*/g, `$1${IPTV_MASK}`);
}

// The card is a size container (for its narrow layouts), which a parent sizing it from its content (inline-block,
// flex row, grid auto column of a layout card or a button card) sees as 0 px wide. This empty, zero-height SVG
// asks such a parent for 400 px, while its max-width: 100% lets it shrink to any room.
export var IPTV_SIZER = '<svg class="sizer" aria-hidden="true" focusable="false"></svg>';
