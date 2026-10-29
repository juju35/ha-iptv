// Unit tests for the sidebar panel: the panel file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../custom_components/iptv/frontend/iptv-panel.js', import.meta.url), 'utf8');
const context = { HTMLElement: class {}, customElements: { get: () => true, define() {} }, console };
vm.createContext(context);
vm.runInContext(`${source}\nthis.panel = { IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone };`, context);
const { IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone } = context.panel;

const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('panel i18n parity: every language has exactly the English keys and placeholders', () => {
  const en = IptvPanelI18n.en;
  assert.deepEqual(Object.keys(IptvPanelI18n).sort(), ['de', 'en', 'es', 'fr']);
  for (const lang of ['fr', 'de', 'es']) {
    const strings = IptvPanelI18n[lang];
    assert.deepEqual(Object.keys(strings).sort(), Object.keys(en).sort(), `keys of ${lang}`);
    for (const key of Object.keys(en)) {
      assert.ok(strings[key], `${lang}.${key} is empty`);
      assert.deepEqual(placeholders(strings[key]), placeholders(en[key]), `placeholders of ${lang}.${key}`);
    }
  }
});

test('iptvPanelT fills placeholders and falls back to English', () => {
  assert.equal(iptvPanelT('fr', 'f_scan_hint', { min: 5, max: 1440 }), 'Rafraîchissement de l’abonnement, 5–1440 min');
  assert.equal(iptvPanelT('it', 'save'), 'Save');
});

test('panel limits match the options flow (const.py)', () => {
  const constants = readFileSync(new URL('../custom_components/iptv/const.py', import.meta.url), 'utf8');
  const value = (name) => Number(constants.match(new RegExp(`^${name} = (\\d+)`, 'm'))[1]);
  assert.deepEqual([...IPTV_PANEL_LIMITS.scan_interval], [value('MIN_SCAN_INTERVAL'), value('MAX_SCAN_INTERVAL')]);
  assert.deepEqual([...IPTV_PANEL_LIMITS.notify_days], [0, value('MAX_NOTIFY_DAYS')]);
  assert.deepEqual([...IPTV_PANEL_LIMITS.health_interval], [value('MIN_HEALTH_INTERVAL'), value('MAX_HEALTH_INTERVAL')]);
});

test('entry state tones', () => {
  assert.equal(iptvPanelTone('loaded'), 'good');
  assert.equal(iptvPanelTone('setup_retry'), 'warn');
  assert.equal(iptvPanelTone('setup_error'), 'bad');
});
