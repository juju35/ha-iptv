// Unit tests for the card translations: the card file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

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
vm.runInContext(`${source}\nthis.iptv = { IptvCard, IptvCardI18n, iptvErr, iptvLang, iptvT };`, context);
const { IptvCard, IptvCardI18n, iptvErr, iptvLang, iptvT } = context.iptv;

const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('I18N parity: every language has exactly the English keys and placeholders', () => {
  const en = IptvCardI18n.en;
  assert.deepEqual(Object.keys(IptvCardI18n).sort(), ['de', 'en', 'es', 'fr']);
  for (const lang of ['fr', 'de', 'es']) {
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
