// Unit tests for the card translations: the card file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { checkTextContrast } from './contrast.mjs';
import { checkSerbianTables } from './serbian.mjs';

const source = readFileSync(new URL('../custom_components/iptv/frontend/iptv-card.js', import.meta.url), 'utf8');
const context = {
  HTMLElement: class {},
  customElements: { get: () => true, define() {} },
  window: { customCards: [] },
  navigator: { language: 'en' },
  document: { documentElement: { lang: 'en' }, addEventListener() {}, removeEventListener() {} },
  console,
  setTimeout: () => 0,
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.iptv = { IptvCard, IptvMiniCard, IptvCardI18n, iptvErr, iptvLang, iptvLocale, iptvT, iptvFocusOf, iptvRefocus };`, context);
const { IptvCard, IptvMiniCard, IptvCardI18n, iptvErr, iptvLang, iptvLocale, iptvT, iptvFocusOf, iptvRefocus } = context.iptv;

const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('I18N parity: every language has exactly the English keys and placeholders', () => {
  const en = IptvCardI18n.en;
  assert.deepEqual(Object.keys(IptvCardI18n).sort(), ['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'lv', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-Latn', 'sv', 'uk']);
  for (const lang of ['fr', 'de', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'da', 'sv', 'bg', 'ru', 'uk', 'hu', 'sk', 'cs', 'sl', 'lv', 'el', 'sr', 'sr-Latn']) {
    const strings = IptvCardI18n[lang];
    assert.deepEqual(Object.keys(strings).sort(), Object.keys(en).sort(), `keys of ${lang}`);
    for (const key of Object.keys(en)) {
      assert.ok(strings[key], `${lang}.${key} is empty`);
      assert.deepEqual(placeholders(strings[key]), placeholders(en[key]), `placeholders of ${lang}.${key}`);
    }
  }
});

test('iptvLang follows the config, then the Home Assistant language', () => {
  assert.equal(iptvLang({ language: 'es' }, { language: 'fr' }), 'es');
  assert.equal(iptvLang({}, { language: 'de-AT' }), 'de');
  assert.equal(iptvLang({}, { language: 'es-419' }), 'es');
});

test('iptvLang keeps a full code that has a table (sr-Latn), else its base, else English', () => {
  assert.equal(iptvLang({}, { language: 'fr-FR' }), 'fr');
  assert.equal(iptvLang({}, { language: 'sr-Latn' }), 'sr-Latn');
  assert.equal(iptvLang({}, { language: 'sr' }), 'sr');
  assert.equal(iptvLang({}, { language: 'ja' }), 'en');
  assert.equal(iptvLang({ language: 'sr-Latn' }, { language: 'fr' }), 'sr-Latn');
  assert.equal(iptvT('sr-Latn', 'edit_password'), 'Lozinka');
});

test('iptvLang resolves Italian, Dutch, Portuguese and Polish codes', () => {
  assert.equal(iptvLang({}, { language: 'it-IT' }), 'it');
  assert.equal(iptvLang({}, { language: 'nl-BE' }), 'nl');
  assert.equal(iptvLang({}, { language: 'pt' }), 'pt');
  // Brazilian Portuguese falls back to the European Portuguese table on purpose
  assert.equal(iptvLang({}, { language: 'pt-BR' }), 'pt');
  assert.equal(iptvLang({}, { language: 'pl-PL' }), 'pl');
  assert.equal(iptvLang({}, { language: 'sr-Latn' }), 'sr-Latn');
  assert.equal(iptvLang({}, { language: 'ja' }), 'en');
  assert.equal(iptvT('pt', 'edit_password'), 'Palavra-passe');
});

test('iptvLang resolves Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek codes', () => {
  for (const code of ['ro', 'da', 'sv', 'bg', 'ru', 'uk', 'hu', 'sk', 'cs', 'sl', 'lv', 'el']) {
    assert.equal(iptvLang({}, { language: code }), code);
  }
  assert.equal(iptvLang({}, { language: 'ro-MD' }), 'ro');
  assert.equal(iptvLang({}, { language: 'sv-FI' }), 'sv');
  assert.equal(iptvLang({}, { language: 'el-CY' }), 'el');
  assert.equal(iptvLang({ language: 'uk' }, { language: 'ru' }), 'uk');
  assert.equal(iptvT('cs', 'edit_password'), 'Heslo');
  assert.equal(iptvT('el', 'edit_password'), 'Κωδικός');
});

test('iptvLocale formats pt as European Portuguese and keeps the language option first', () => {
  const loc = (config, hass) => iptvLocale(iptvLang(config, hass), hass);
  assert.equal(loc({}, { language: 'pt', locale: { language: 'pt' } }), 'pt-PT');
  assert.equal(loc({}, { language: 'pt' }), 'pt-PT');
  assert.equal(loc({}, { language: 'pt-BR', locale: { language: 'pt-BR' } }), 'pt-BR');
  assert.equal(loc({}, { language: 'fr', locale: { language: 'fr-CA' } }), 'fr-CA');
  assert.equal(loc({ language: 'de' }, { language: 'fr', locale: { language: 'fr' } }), 'de');
  assert.equal(loc({ language: 'pt' }, { language: 'en', locale: { language: 'en' } }), 'pt-PT');
  assert.equal(loc({ language: 'sr-Latn' }, { language: 'sr', locale: { language: 'sr' } }), 'sr-Latn');
  assert.equal(loc({}, { language: 'sr-Latn', locale: { language: 'sr-Latn' } }), 'sr-Latn');
  // pt alone gives the Brazilian formats (12.345); pt-PT groups thousands with a space
  assert.notEqual(new Intl.NumberFormat(loc({}, { language: 'pt' })).format(12345), '12.345');
});

test('I18N Serbian: the Latin card is the Cyrillic one letter for letter, each in its own script', () => {
  checkSerbianTables(IptvCardI18n);
});

test('dates in sr-Latn are written in Latin script, in sr in Cyrillic', () => {
  // The card formats dates with the Home Assistant locale (hass.locale.language), e.g. sr-Latn
  const date = new Date(2026, 10, 1);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  assert.match(date.toLocaleDateString('sr-Latn', options), /novembar/);
  assert.match(date.toLocaleDateString('sr', options), /новембар/);
});

test('the editor offers every language of the card, Serbian in Cyrillic and Latin script', () => {
  context.document.querySelector = () => null;
  const language = IptvCard.getConfigForm().schema.find((s) => s.name === 'language');
  const options = Array.from(language.selector.select.options, (o) => [o.value, o.label]);
  assert.deepEqual(options.slice(-18), [
    ['it', 'Italiano'],
    ['nl', 'Nederlands'],
    ['pt', 'Português (Portugal)'],
    ['pl', 'Polski'],
    ['ro', 'Română'],
    ['da', 'Dansk'],
    ['sv', 'Svenska'],
    ['bg', 'Български'],
    ['ru', 'Русский'],
    ['uk', 'Українська'],
    ['hu', 'Magyar'],
    ['sk', 'Slovenčina'],
    ['cs', 'Čeština'],
    ['sl', 'Slovenščina'],
    ['lv', 'Latviešu'],
    ['el', 'Ελληνικά'],
    ['sr', 'Српски'],
    ['sr-Latn', 'Srpski (latinica)'],
  ]);
  assert.deepEqual(options.map((o) => o[0]).filter(Boolean).sort(), Object.keys(IptvCardI18n).sort());
});

test('iptvT falls back to English for an unsupported language', () => {
  assert.equal(iptvT('ja', 'loading'), IptvCardI18n.en.loading);
  assert.equal(iptvT('de', 'loading'), IptvCardI18n.de.loading);
  assert.equal(iptvT('es', 'mini_days', { n: 3 }), IptvCardI18n.es.mini_days.replace('{n}', '3'));
});

test('iptvErr falls back to the generic message for an unknown error code', () => {
  assert.equal(iptvErr('en', 'already_in_progress'), IptvCardI18n.en.err_generic);
  assert.equal(iptvErr('es', 'already_in_progress'), IptvCardI18n.es.err_generic);
  assert.equal(iptvErr('fr', undefined), IptvCardI18n.fr.err_generic);
  const known = Object.keys(IptvCardI18n.en).find((k) => k.startsWith('err_') && k !== 'err_generic');
  assert.equal(iptvErr('de', known.slice(4)), IptvCardI18n.de[known]);
});

test('a failed refresh is caught and shown on the refresh button', async () => {
  const card = Object.create(IptvCard.prototype);
  let renders = 0;
  card._config = { language: 'en' };
  card._subs = () => [{ ids: { status: 'sensor.a_status', health: 'sensor.a_health' } }];
  card._render = () => {
    renders += 1;
  };
  card._hass = { callService: () => Promise.reject(new Error('Connection lost')) };
  const error = console.error;
  console.error = () => {};
  try {
    await card._refresh();
  } finally {
    console.error = error;
  }
  assert.equal(card._refreshFailed, true);
  assert.equal(card._loading, false);
  assert.ok(renders >= 2);
});

test('animations stop when the system asks for reduced motion', () => {
  const css = IptvCard.CSS;
  const block = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n {4}\}/)?.[1] || '';
  assert.match(block, /button\.spin ha-icon \{[^}]*animation: none/, 'the refresh spinner stops');
  assert.match(block, /\.fill \{[^}]*transition: none/, 'the expiration bar no longer slides');
});

// --- Keyboard: the chips and figures that open an entity -------------------------------------------------------

function fakeEl(props = {}) {
  const attrs = {};
  const listeners = {};
  return {
    dataset: {},
    tagName: 'SPAN',
    className: '',
    attrs,
    listeners,
    setAttribute: (k, v) => {
      attrs[k] = String(v);
    },
    getAttribute: (k) => attrs[k] ?? null,
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    closest: () => null,
    ...props,
  };
}

test('the elements that open an entity are buttons for the keyboard (role, tabindex, Enter and Space)', () => {
  const card = Object.create(IptvCard.prototype);
  const chip = fakeEl({ dataset: { entity: 'status' } });
  const orphan = fakeEl({ dataset: { entity: 'health' } }); // no such entity for this subscription
  card._root = { querySelectorAll: () => [chip, orphan] };
  const opened = [];
  card._moreInfo = (id) => opened.push(id);
  card._bindMoreInfo([{ ids: { status: 'sensor.a_status' } }]);
  assert.equal(chip.attrs.role, 'button');
  assert.equal(chip.attrs.tabindex, '0');
  for (const key of ['Enter', ' ']) {
    let prevented = false;
    chip.listeners.keydown({ key, preventDefault: () => (prevented = true) });
    assert.ok(prevented, `${JSON.stringify(key)} does not scroll the page`);
  }
  chip.listeners.keydown({ key: 'a', preventDefault() {} });
  assert.deepEqual(opened, ['sensor.a_status', 'sensor.a_status']);
  assert.equal(orphan.attrs.role, undefined, 'nothing to open: not announced as a button');
});

test('a re-render gives the focus back to the same control', () => {
  const make = () => {
    const status = fakeEl({ dataset: { entity: 'status' } });
    const refresh = fakeEl({ tagName: 'BUTTON', className: 'refresh' });
    const list = [refresh, status];
    list.forEach((el) => {
      el.focus = () => {
        shadow.activeElement = el;
      };
    });
    return { list, root: { contains: (el) => list.includes(el), querySelectorAll: () => list } };
  };
  const shadow = { activeElement: null };
  let dom = make();
  dom.list[1].focus();
  const focus = iptvFocusOf(shadow, dom.root);
  dom = make(); // innerHTML: every element is new
  shadow.activeElement = null;
  iptvRefocus(dom.root, focus);
  assert.equal(shadow.activeElement, dom.list[1]);
  // The refresh button spins while it works (class "refresh spin"): still the same control
  dom.list[0].focus();
  const spin = iptvFocusOf(shadow, dom.root);
  dom = make();
  dom.list[0].className = 'refresh spin';
  iptvRefocus(dom.root, spin);
  assert.equal(shadow.activeElement, dom.list[0]);
  // Focus elsewhere, or the control is gone: nothing is focused
  assert.equal(iptvFocusOf({ activeElement: null }, dom.root), null);
  shadow.activeElement = null;
  iptvRefocus({ querySelectorAll: () => [] }, focus);
  assert.equal(shadow.activeElement, null);
});

test('state-coloured text reaches 4.5:1 in light and dark themes', () => {
  const css = IptvCard.CSS;
  checkTextContrast(css, '--ct', 0.16);
  checkTextContrast(css, '--iptv-crit-text', 0.16);
  // The text of the chips, days left, mini chips and error messages uses the readable variant, not the raw colour
  assert.match(css, /\.chip \{[^}]*[^-]color: var\(--ct\)/);
  assert.match(css, /\.rem\.warning, \.rem\.error \{ color: var\(--ct\)/);
  assert.match(css, /\.msg\.err \{ color: var\(--iptv-crit-text\)/);
  assert.match(css, /\.modal \.err \{ color:var\(--iptv-crit-text\)/);
  assert.match(css, /\.modal button\.danger \{[^}]*[^-]color:var\(--iptv-crit-text\)/);
  assert.match(IptvMiniCard.CSS, /\.r\.warning, \.r\.error \{ color: var\(--ct\)/);
});

// --- Layout at the narrow widths of the Sections view (4 columns = 161 px, 6 = 246 px) ---------------------------

test('the full card defaults to the full width of a section, the mini card to half (6 columns minimum)', () => {
  const card = Object.create(IptvCard.prototype);
  assert.deepEqual({ ...card.getGridOptions() }, { columns: 12, min_columns: 6, rows: 'auto' });
  const mini = Object.create(IptvMiniCard.prototype);
  mini._zoomed = false;
  assert.deepEqual({ ...mini.getGridOptions() }, { columns: 6, min_columns: 6 });
  // Zoomed in, the mini card shows the full card: same sizes
  mini._zoomed = true;
  assert.deepEqual({ ...mini.getGridOptions() }, { columns: 12, min_columns: 6, rows: 'auto' });
});

const rule = (css, selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`(?:^|[\\s}])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(';');
};

test('a narrow header keeps the title readable and every button inside the card', () => {
  for (const css of [IptvCard.CSS, IptvMiniCard.CSS]) {
    assert.match(css, /ha-card \{[^}]*container-type: inline-size/, 'the card is a size container');
    // The title block takes the room left (from 0, not from its text width) and truncates, but keeps about 4 characters
    assert.match(rule(css, '.titles'), /flex: 1 1 0;/);
    assert.match(rule(css, '.titles'), /min-width: \d+(\.\d+)?ch/);
    assert.match(rule(css, '.title-row .name'), /flex: 1 1 0;/);
    assert.match(rule(css, '.name'), /min-width: \d+(\.\d+)?ch/);
    assert.match(rule(css, '.name'), /text-overflow: ellipsis/);
    // The status pill shrinks only when the room runs out, its text truncated
    const pill = rule(css, '.title-row > .chip');
    assert.match(pill, /flex: 0 1 auto/);
    assert.match(pill, /min-width: 0/);
    assert.match(rule(css, '.chip .tx'), /text-overflow: ellipsis/);
    // Under the threshold, only its coloured icon is left
    assert.match(css, /@container \(max-width: \d+px\) \{[^@]*\.title-row > \.chip \.tx[^{]*\{ display: none/);
    // Icon buttons never shrink
    assert.match(rule(css, '.header > button'), /flex: none/);
  }
  assert.match(rule(IptvMiniCard.CSS, '.head .chip'), /flex: 0 1 auto/);
  assert.match(rule(IptvMiniCard.CSS, '.mini .name'), /flex: 1 1 0;/);
  assert.match(IptvMiniCard.CSS, /@container \(max-width: \d+px\) \{[^@]*\.head \.chip \.tx[^{]*\{ display: none/);
});

test('the mini card keeps the full card badge (40 px, 24 px icon): only a width breakpoint touches it', () => {
  assert.match(rule(IptvMiniCard.CSS, '.badge'), /width: 40px; height: 40px;.*--mdc-icon-size: 24px;/s);
  assert.match(rule(IptvMiniCard.CSS, '.mini .badge'), /align-self: flex-start/);
  assert.doesNotMatch(rule(IptvMiniCard.CSS, '.mini .badge'), /width|height|--mdc-icon-size/);
});

test('the figures are never cut: the tiles lose their icon, then go two by two, on a narrow card', () => {
  const css = IptvCard.CSS;
  assert.doesNotMatch(rule(css, '.num'), /text-overflow: ellipsis/);
  assert.match(css, /@container \(max-width: 3\d\dpx\) \{[^@]*\.stat ha-icon \{ display: none/);
  assert.match(css, /@container \(max-width: 2\d\dpx\) \{[^@]*\.stats \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test('the status pill text is in its own element, and its label stays available when only the icon shows', () => {
  const card = Object.create(IptvCard.prototype);
  card._config = { language: 'en', warning_days: 7 };
  const html = card._statusChip({ state: 'ok', statusLabel: 'Active' });
  assert.match(html, /<span class="tx">Active<\/span>/);
  assert.match(html, /title="Active"/);
  const mini = Object.create(IptvMiniCard.prototype);
  mini._config = { language: 'en' };
  const pill = mini._miniStatus([{ state: 'warning' }, { state: 'ok' }]);
  assert.match(pill, /<span class="tx">1 expiring<\/span>/);
  assert.match(pill, /title="1 expiring"/);
  assert.match(pill, /aria-label="1 expiring"/);
});

test('the view, edit and remove buttons are at least 24 px (16 px icon, 4 px padding)', () => {
  assert.match(rule(IptvCard.CSS, 'button.edit, button.del, button.view'), /padding:4px/);
});

test('Serbian: an unknown subscription status agrees with "pretplata" (feminine)', () => {
  assert.equal(IptvCardI18n.sr.status_unknown, 'Непозната');
  assert.equal(IptvCardI18n['sr-Latn'].status_unknown, 'Nepoznata');
});

// --- Popups: a modal dialog sized into the card, usable with the keyboard ----------------------------------------

// A popup tree: querySelector gives the same fake child for a selector, the .modal box is 340 px high
function popupDom(shadow) {
  const make = (props = {}) => {
    const children = {};
    const el = fakeEl({
      ...props,
      querySelector: (sel) => {
        if (!children[sel]) children[sel] = make({ className: sel.replace(/^[a-z]*\./, '') });
        return children[sel];
      },
      querySelectorAll: () => [],
      remove() {
        el.removed = true;
      },
      focus() {
        shadow.activeElement = el;
      },
      offsetHeight: 340,
    });
    return el;
  };
  return make;
}

function popupCard() {
  const shadow = { activeElement: null, appended: [] };
  const make = popupDom(shadow);
  const add = make({ tagName: 'BUTTON', className: 'add' });
  const refresh = make({ tagName: 'BUTTON', className: 'refresh' });
  const card = Object.create(IptvCard.prototype);
  card._config = { language: 'en', warning_days: 7 };
  card._hass = { language: 'en' };
  const style = {};
  card.style = { setProperty: (k, v) => (style[k] = v), removeProperty: (k) => delete style[k] };
  shadow.appendChild = (el) => shadow.appended.push(el);
  card._root = { inert: false, contains: (el) => [add, refresh].includes(el), querySelectorAll: () => [add, refresh] };
  Object.defineProperty(card, 'shadowRoot', { value: shadow });
  context.document.createElement = () => make({ tagName: 'DIV' });
  return { card, shadow, style, add, refresh };
}

test('a popup is a modal dialog named by its title, takes the focus, and makes the card inert', () => {
  const { card, shadow, style, add } = popupCard();
  add.focus();
  card._openAdd();
  const backdrop = card._modal;
  assert.match(backdrop.innerHTML, /<div class="modal" role="dialog" aria-modal="true" aria-labelledby="iptv-dialog-title" tabindex="-1">/);
  assert.match(backdrop.innerHTML, /<h3 id="iptv-dialog-title">Add account<\/h3>/);
  assert.equal(shadow.activeElement, backdrop.querySelector('.prov'), 'the provider field has the focus');
  assert.equal(card._root.inert, true, 'Tab no longer goes through the card under the veil');
  // The card grows to hold the popup (340 px + 12 px above and below)
  assert.equal(style['--iptv-modal-h'], '364px');
});

test('Escape closes a popup and gives the focus back to the button that opened it', () => {
  const { card, shadow, style, add } = popupCard();
  add.focus();
  card._openAdd();
  const backdrop = card._modal;
  let stopped = false;
  backdrop.listeners.keydown({ key: 'a', stopPropagation() {} });
  assert.equal(card._modal, backdrop, 'another key does nothing');
  backdrop.listeners.keydown({ key: 'Escape', stopPropagation: () => (stopped = true) });
  assert.ok(backdrop.removed);
  assert.equal(card._modal, null);
  assert.ok(stopped, 'Escape does not also close a Home Assistant dialog around the card');
  assert.equal(card._root.inert, false);
  assert.equal(style['--iptv-modal-h'], undefined, 'the card gets its own height back');
  assert.equal(shadow.activeElement, add);
});

test('the remove popup focuses Cancel, the view popup its first copy button, an error its close button', async () => {
  const { card, shadow } = popupCard();
  card._confirmDelete({ name: 'Provider', device: 'd1' });
  assert.equal(shadow.activeElement, card._modal.querySelector('.cancel'));
  card._ws = () => Promise.resolve({ ok: true, provider: 'xtream', url: 'http://x', username: 'u', password: 'p' });
  await card._openView({ device: 'd1' });
  assert.equal(shadow.activeElement, card._modal.querySelector('button.copy'));
  card._ws = () => Promise.resolve({ ok: false, error: 'not_found' });
  await card._openView({ device: 'd1' });
  assert.equal(shadow.activeElement, card._modal.querySelector('.cancel'));
});

test('closing a popup whose button is gone (account removed) focuses nothing and does not throw', () => {
  const { card, shadow, add } = popupCard();
  add.focus();
  card._confirmDelete({ name: 'Provider', device: 'd1' });
  card._root.querySelectorAll = () => []; // re-rendered without this subscription
  shadow.activeElement = null;
  card._closeEditor();
  assert.equal(shadow.activeElement, null);
  assert.equal(card._root.inert, false);
  // Closing again (backdrop click after Escape) is harmless
  card._closeEditor();
});

test('Tab and Shift+Tab stay in the popup', () => {
  const { card, shadow } = popupCard();
  card._confirmDelete({ name: 'Provider', device: 'd1' });
  const backdrop = card._modal;
  const cancel = backdrop.querySelector('.cancel');
  const remove = backdrop.querySelector('.danger');
  backdrop.querySelectorAll = () => [cancel, remove];
  const key = (shiftKey) => {
    let prevented = false;
    backdrop.listeners.keydown({ key: 'Tab', shiftKey, preventDefault: () => (prevented = true), stopPropagation() {} });
    return prevented;
  };
  assert.equal(shadow.activeElement, cancel);
  assert.ok(key(true), 'Shift+Tab on the first control');
  assert.equal(shadow.activeElement, remove, 'goes round to the last one');
  assert.ok(key(false));
  assert.equal(shadow.activeElement, cancel, 'Tab on the last control goes back to the first');
  shadow.activeElement = cancel;
  assert.equal(key(false), false, 'between two controls, the browser moves the focus');
  assert.equal(card._modal, backdrop, 'Tab does not close the popup');
});

test('mini pill counts: 1 is singular in every language, Polish and Serbian put the count after a colon above 1', () => {
  const mini = Object.create(IptvMiniCard.prototype);
  const label = (lang, n) => {
    mini._config = { language: lang };
    const views = Array.from({ length: n }, () => ({ state: 'warning' }));
    return mini._miniStatus(views).match(/<span class="tx">([^<]*)<\/span>/)[1];
  };
  assert.equal(label('en', 1), '1 expiring');
  assert.equal(label('fr', 1), '1 expire bientôt');
  assert.equal(label('fr', 2), '2 expirent bientôt');
  assert.equal(label('de', 1), '1 läuft bald ab');
  assert.equal(label('es', 21), '21 caducan pronto');
  for (const n of [2, 5, 21, 22]) {
    assert.equal(label('pl', n), `Wkrótce wygasa: ${n}`);
    assert.equal(label('sr', n), `Ускоро истиче: ${n}`);
    assert.equal(label('sr-Latn', n), `Uskoro ističe: ${n}`);
  }
  assert.equal(label('sr-Latn', 1), '1 uskoro ističe');
});

// --- Phone widths (6 columns of a section on a phone: 156 to 178 px) ---------------------------------------------

// Rules inside the @container (max-width: Npx) block, N given
const containerBlock = (css, px) => {
  const start = css.indexOf(`@container (max-width: ${px}px) {`);
  if (start < 0) return '';
  return css.slice(start, css.indexOf('\n    }', start));
};

test('the status pill keeps its whole text: no half-line cap that cuts "Ready" to "Re…" at 320 px', () => {
  for (const css of [IptvCard.CSS, IptvMiniCard.CSS]) {
    assert.doesNotMatch(rule(css, '.title-row > .chip'), /max-width/);
  }
  assert.doesNotMatch(rule(IptvMiniCard.CSS, '.head .chip'), /max-width/);
  // The mini title shares its line with the pill and the detail button: it keeps 4 characters (4.5ch), not more,
  // so "Z błędem: 1" / "1 sa greškom" stay whole at 245 px (6ch cut them to 55 of 58 / 67 px)
  const miniName = rule(IptvMiniCard.CSS, '.mini .name').match(/min-width: ([\d.]+)ch/);
  assert.ok(miniName && Number(miniName[1]) >= 4 && Number(miniName[1]) <= 4.5, `mini title min-width ${miniName?.[1]}ch`);
  // ...and at 245 px its line is tighter, so the 4 characters really fit next to the whole Serbian pill
  assert.match(containerBlock(IptvMiniCard.CSS, 240), /\.head \{ gap: 4px; \}/);
  // Only its icon left: below any section column (6 columns on the smallest phone: 156 px, 132 px inside)
  const thresholds = [...IptvCard.CSS.matchAll(/@container \(max-width: (\d+)px\) \{[^@]*\.title-row > \.chip \.tx[^{]*\{ display: none/g)].map((m) => Number(m[1]));
  assert.ok(thresholds.length && thresholds.every((px) => px < 132), `icon-only below ${thresholds}`);
});

test('a phone-narrow header puts the title and its pill on a line of their own, buttons on the right', () => {
  for (const css of [IptvCard.CSS, IptvMiniCard.CSS]) {
    const narrow = containerBlock(css, 260);
    assert.match(narrow, /\.header \{ flex-wrap: wrap/);
    assert.match(narrow, /\.titles \{ order: 1; flex-basis: 100%/);
    assert.match(narrow, /\.header > \.titles \+ button \{ margin-left: auto/);
  }
});

test('a phone-narrow footer and expiry line wrap instead of pushing the buttons out of the card', () => {
  const css = IptvCard.CSS;
  assert.match(rule(css, '.foot'), /flex-wrap: wrap/);
  assert.match(rule(css, '.foot-actions'), /margin-left: auto/);
  assert.match(rule(css, '.row'), /flex-wrap: wrap/);
});

test('a mini card chip never goes past the card: its name is truncated, its figure kept', () => {
  const css = IptvMiniCard.CSS;
  assert.match(rule(css, 'button.r'), /max-width: 100%/);
  assert.match(rule(css, 'button.r'), /min-width: 0/);
  assert.match(rule(css, '.r .rn'), /text-overflow: ellipsis/);
  assert.match(rule(css, '.r .fig'), /flex: none/, 'the name gives way, not the figure');
  const mini = Object.create(IptvMiniCard.prototype);
  mini._config = { language: 'en' };
  const html = mini._miniChip({ name: 'Provider D', ids: { days_left: 'x' } }, { state: 'error', expired: true }, 0);
  assert.match(html, /<span class="rn">Provider D<\/span><span class="fig">Expired<\/span>/);
  assert.match(html, /title="Provider D · Expired"/, 'the whole text stays in the tooltip');
});

test('a focus moved by the card never scrolls the page (popups, Tab trap, detail button)', () => {
  // Every .focus( call in the card passes { preventScroll: true }
  const calls = [...source.matchAll(/\.focus\(([^)]*)\)/g)].map((m) => m[1]);
  assert.ok(calls.length >= 5);
  for (const args of calls) assert.match(args, /preventScroll: true/);
  // And in use: opening the popups and Tab round them
  const { card, shadow } = popupCard();
  const seen = [];
  const watch = (el) => {
    const focus = el.focus;
    el.focus = (opts) => {
      seen.push(opts);
      focus.call(el, opts);
    };
  };
  const real = context.document.createElement;
  context.document.createElement = () => {
    const el = real();
    const qs = el.querySelector;
    el.querySelector = (sel) => {
      const child = qs(sel);
      if (!child.watched) {
        child.watched = true;
        watch(child);
      }
      return child;
    };
    return el;
  };
  card._confirmDelete({ name: 'Provider', device: 'd1' });
  card._closeEditor();
  card._openAdd();
  const backdrop = card._modal;
  const first = backdrop.querySelector('.prov');
  const last = backdrop.querySelector('.cancel');
  backdrop.querySelectorAll = () => [first, last];
  shadow.activeElement = last;
  backdrop.listeners.keydown({ key: 'Tab', shiftKey: false, preventDefault() {}, stopPropagation() {} });
  assert.ok(seen.length >= 4, `${seen.length} focus calls`);
  for (const opts of seen) assert.deepEqual({ ...opts }, { preventScroll: true });
});

test('a parent that sizes the card from its content (inline-block, flex row, auto grid column) does not squeeze it to 0', () => {
  for (const css of [IptvCard.CSS, IptvMiniCard.CSS]) {
    // ha-card stays a size container (narrow layouts)...
    assert.match(css, /ha-card \{[^}]*container-type: inline-size/);
    // ...and an empty replaced element asks for 400 px, shrinking to any room there is (max-width: 100%)
    const sizer = rule(css, '.sizer');
    assert.match(sizer, /display: block/);
    assert.match(sizer, /width: 400px/);
    assert.match(sizer, /max-width: 100%/);
    assert.match(sizer, /height: 0/);
  }
  // Next to the ha-card of the full card and of the mini card
  assert.equal(source.split('</ha-card>${IPTV_SIZER}`').length - 1, 2);
  assert.match(source, /IPTV_SIZER = '<svg class="sizer" aria-hidden="true" focusable="false"><\/svg>'/);
});
