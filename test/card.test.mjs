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
vm.runInContext(`${source}\nthis.iptv = { IptvCard, IptvMiniCard, IptvCardI18n, iptvErr, iptvLang, iptvT, iptvFocusOf, iptvRefocus };`, context);
const { IptvCard, IptvMiniCard, IptvCardI18n, iptvErr, iptvLang, iptvT, iptvFocusOf, iptvRefocus } = context.iptv;

const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('I18N parity: every language has exactly the English keys and placeholders', () => {
  const en = IptvCardI18n.en;
  assert.deepEqual(Object.keys(IptvCardI18n).sort(), ['de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'sr', 'sr-Latn']);
  for (const lang of ['fr', 'de', 'es', 'it', 'nl', 'pt', 'pl', 'sr', 'sr-Latn']) {
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
  assert.deepEqual(options.slice(-6), [
    ['it', 'Italiano'],
    ['nl', 'Nederlands'],
    ['pt', 'Português'],
    ['pl', 'Polski'],
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
