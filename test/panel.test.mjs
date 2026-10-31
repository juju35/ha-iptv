// Unit tests for the sidebar panel: the panel file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../custom_components/iptv/frontend/iptv-panel.js', import.meta.url), 'utf8');
// attachShadow returns a root without elements: rendering is skipped (see _renderAccounts)
const shadow = { getElementById: () => null, querySelector: () => null };
const context = {
  HTMLElement: class {
    attachShadow() {
      this.shadowRoot = shadow;
      return shadow;
    }
  },
  customElements: { get: () => true, define() {} },
  structuredClone,
  console,
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.panel = { IptvPanel, IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone };`, context);
const { IptvPanel, IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone } = context.panel;

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

// --- Panel state against changes made elsewhere (card, Configure, another admin) -------------------------
// The panel is instantiated without a DOM: rendering is a no-op (no #accounts box), and an account form is a
// fake element whose inputs keep the listeners the panel binds, so typing can be replayed.

function account(overrides = {}) {
  return {
    entry_id: 'e1',
    device_id: 'd1',
    title: 'Provider A',
    auto_title: 'provider-a.example',
    provider: 'xtream',
    url: 'http://provider-a.example',
    login: 'user-a',
    state: 'loaded',
    updated_at: '2026-10-31T10:00:00+00:00',
    options: { scan_interval: 60, notify_days: 7, health_interval: 5, stream_check: true },
    ...overrides,
  };
}

// A panel whose iptv/accounts returns `server.accounts` (deep-copied, like a fresh WebSocket answer)
function panelWith(server) {
  const panel = new IptvPanel();
  const calls = [];
  panel._hass = {
    language: 'en',
    callWS: async (msg) => {
      calls.push(msg);
      if (msg.type === 'iptv/accounts') return { accounts: structuredClone(server.accounts) };
      if (msg.type === 'iptv/get_credentials') return { ok: true, password: server.password };
      if (msg.type === 'iptv/update_account') return { ok: true, account: structuredClone(server.accounts[0]) };
      return { ok: true };
    },
  };
  return { panel, calls };
}

function fakeForm() {
  const listeners = {};
  const on = (key) => ({
    dataset: { key },
    addEventListener: (type, fn) => {
      listeners[`${key}:${type}`] = fn;
    },
  });
  const inputs = ['title', 'scan_interval', 'notify_days', 'health_interval'].map(on);
  const el = {
    querySelectorAll: (sel) => (sel === 'input' ? inputs : []),
    querySelector: (sel) => {
      if (sel === 'ha-switch') return on('stream_check');
      if (sel === '[data-reveal]') return null;
      return { disabled: false, addEventListener() {} };
    },
  };
  const type = (key, value) => {
    inputs.find((i) => i.dataset.key === key).value = value;
    listeners[`${key}:input`]();
  };
  return { el, type };
}

test('a revealed password is forgotten when the account is updated elsewhere', async () => {
  const server = { accounts: [account()], password: 'old-secret' };
  const { panel } = panelWith(server);
  await panel._load();
  await panel._toggleSecret(panel._accounts[0]);
  assert.match(panel._credsHtml(panel._accounts[0]), /old-secret/);
  // Password changed with the card's edit button (or add_account / Reconfigure): updated_at moves
  server.accounts = [account({ updated_at: '2026-10-31T10:05:00+00:00' })];
  server.password = 'new-secret';
  await panel._load();
  const html = panel._credsHtml(panel._accounts[0]);
  assert.doesNotMatch(html, /old-secret/);
  assert.match(html, /••••••••/);
});

test('a revealed password stays shown across unrelated reloads (state change, same credentials)', async () => {
  const server = { accounts: [account()], password: 'secret' };
  const { panel } = panelWith(server);
  await panel._load();
  await panel._toggleSecret(panel._accounts[0]);
  server.accounts = [account({ state: 'setup_retry' })];
  await panel._load();
  assert.match(panel._credsHtml(panel._accounts[0]), /secret/);
});

test('an untouched form follows options changed elsewhere and keeps Save disabled', async () => {
  const server = { accounts: [account()] };
  const { panel } = panelWith(server);
  await panel._load();
  panel._accountHtml(panel._accounts[0]); // first render
  server.accounts = [account({ options: { ...account().options, scan_interval: 30 } })];
  await panel._load();
  const acc = panel._accounts[0];
  assert.equal(Number(panel._draft(acc).scan_interval), 30);
  assert.equal(panel._changed(acc), false);
  assert.match(panel._accountHtml(acc), /data-key="scan_interval" value="30"/);
});

test('Save only overrides the fields the user edited, not options changed elsewhere meanwhile', async () => {
  const server = { accounts: [account()] };
  const { panel, calls } = panelWith(server);
  await panel._load();
  panel._accountHtml(panel._accounts[0]);
  const form = fakeForm();
  panel._bind(panel._accounts[0], form.el);
  form.type('notify_days', '10');
  // Another admin sets the polling interval to 30 min, the list reloads and the form is bound again
  server.accounts = [account({ options: { ...account().options, scan_interval: 30 } })];
  await panel._load();
  const acc = panel._accounts[0];
  panel._bind(acc, fakeForm().el);
  assert.equal(Number(panel._draft(acc).notify_days), 10, 'the typed value is kept');
  assert.equal(panel._changed(acc), true);
  await panel._save(acc);
  const sent = calls.find((c) => c.type === 'iptv/update_account');
  assert.equal(sent.scan_interval, 30);
  assert.equal(sent.notify_days, 10);
  assert.equal(sent.title, 'Provider A');
});

test('a form edit is kept per account (two accounts)', async () => {
  const server = { accounts: [account(), account({ entry_id: 'e2', title: 'Provider B', auto_title: 'b.example' })] };
  const { panel } = panelWith(server);
  await panel._load();
  const form = fakeForm();
  panel._bind(panel._accounts[0], form.el);
  form.type('title', 'Renamed');
  await panel._load();
  const [a, b] = panel._accounts;
  assert.equal(panel._draft(a).title, 'Renamed');
  assert.equal(panel._changed(b), false);
});
