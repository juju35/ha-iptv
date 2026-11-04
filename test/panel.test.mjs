// Unit tests for the sidebar panel: the panel file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { checkTextContrast } from './contrast.mjs';
import { checkSerbianTables } from './serbian.mjs';

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
  CSS: { escape: (s) => String(s) },
  console,
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.panel = { IptvPanel, IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone };`, context);
const { IptvPanel, IptvPanelI18n, IPTV_PANEL_LIMITS, iptvPanelT, iptvPanelTone } = context.panel;

const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('panel i18n parity: every language has exactly the English keys and placeholders', () => {
  const en = IptvPanelI18n.en;
  assert.deepEqual(Object.keys(IptvPanelI18n).sort(), ['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'lv', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-Latn', 'sv', 'uk']);
  for (const lang of ['fr', 'de', 'es', 'it', 'nl', 'pt', 'pl', 'ro', 'da', 'sv', 'bg', 'ru', 'uk', 'hu', 'sk', 'cs', 'sl', 'lv', 'el', 'sr', 'sr-Latn']) {
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
  assert.equal(iptvPanelT('ja', 'save'), 'Save');
});

test('panel i18n Serbian: the Latin table is the Cyrillic one letter for letter, each in its own script', () => {
  checkSerbianTables(IptvPanelI18n);
});

test('the panel keeps a full code that has a table (sr-Latn), else its base, else English', () => {
  const panel = Object.create(IptvPanel.prototype);
  const lang = (language) => {
    panel._hass = { language };
    return panel._lang();
  };
  assert.equal(lang('fr-FR'), 'fr');
  assert.equal(lang('sr-Latn'), 'sr-Latn');
  assert.equal(lang('sr'), 'sr');
  assert.equal(panel._t('save'), 'Сачувај');
  lang('sr-Latn');
  assert.equal(panel._t('save'), 'Sačuvaj');
  lang('ja');
  assert.equal(panel._t('save'), 'Save');
});

test('the panel resolves Italian, Dutch, Portuguese and Polish codes', () => {
  const panel = Object.create(IptvPanel.prototype);
  const lang = (language) => {
    panel._hass = { language };
    return panel._lang();
  };
  assert.equal(lang('it-IT'), 'it');
  assert.equal(lang('nl-BE'), 'nl');
  assert.equal(lang('pt'), 'pt');
  // Brazilian Portuguese falls back to the European Portuguese table on purpose
  assert.equal(lang('pt-BR'), 'pt');
  assert.equal(panel._t('settings'), 'Definições');
  assert.equal(lang('pl-PL'), 'pl');
  assert.equal(lang('sr-Latn'), 'sr-Latn');
  assert.equal(lang('ja'), 'en');
});

test('the panel resolves the 12 languages added in 3.22.7', () => {
  const panel = Object.create(IptvPanel.prototype);
  const lang = (language) => {
    panel._hass = { language };
    return panel._lang();
  };
  for (const code of ['ro', 'da', 'sv', 'bg', 'ru', 'uk', 'hu', 'sk', 'cs', 'sl', 'lv', 'el']) {
    assert.equal(lang(code), code);
  }
  assert.equal(lang('sv-FI'), 'sv');
  assert.equal(panel._t('settings'), 'Inställningar');
  assert.equal(lang('el-CY'), 'el');
  assert.equal(panel._t('settings'), 'Ρυθμίσεις');
  assert.equal(lang('ja'), 'en');
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

// --- Re-rendering the account forms (fake shadow DOM) ----------------------------------------------------------
// A minimal shadow root: each innerHTML of #accounts replaces every element (like the browser does), the focused
// element is dropped when it leaves the tree, and focus()/setSelectionRange() are recorded.
function fakeShadow() {
  const root = { activeElement: null, generation: 0 };
  const make = (props) => {
    const el = {
      gen: root.generation,
      listeners: {},
      dataset: {},
      disabled: false,
      value: '',
      parentElement: { classList: { toggle() {} } },
      ...props,
      get isConnected() {
        return this.gen === root.generation;
      },
      addEventListener(type, fn) {
        this.listeners[type] = fn;
      },
      focus() {
        if (!this.disabled && this.isConnected) root.activeElement = this;
      },
      setSelectionRange(start, end, dir) {
        this.selection = [start, end, dir];
      },
    };
    return el;
  };
  const box = {
    cards: [],
    contains: (el) => !!el && el.gen === root.generation,
    querySelector(sel) {
      const id = sel.match(/data-id="([^"]+)"/)?.[1];
      return this.cards.find((c) => c.dataset.id === id) || null;
    },
    set innerHTML(html) {
      root.generation += 1;
      if (root.activeElement && !root.activeElement.isConnected) root.activeElement = null;
      this.html = html;
      this.cards = [...html.matchAll(/<ha-card class="account" data-id="([^"]+)">([\s\S]*?)<\/ha-card>/g)].map(
        ([, id, body]) => {
          const card = make({ dataset: { id } });
          const attr = (name) =>
            [...body.matchAll(new RegExp(`<(\\w[\\w-]*)([^>]*?)\\s${name}(?:="([^"]*)")?([^>]*)>`, 'g'))].map((m) =>
              make({
                tag: m[1],
                attrs: m[2] + m[4],
                dataset: { [name.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())]: m[3] ?? '' },
                disabled: /\sdisabled/.test(m[2] + m[4]),
                value: (m[2] + m[4]).match(/value="([^"]*)"/)?.[1] ?? '',
                closest: () => card,
              }),
            );
          card.parts = [...attr('data-key'), ...attr('data-do'), ...attr('data-copy'), ...attr('data-reveal')];
          card.querySelectorAll = (sel) =>
            card.parts.filter(
              (p) => p.tag === 'input' && (sel === 'input' || (sel === 'input[type="number"]' && /type="number"/.test(p.attrs))),
            );
          card.querySelector = (sel) => {
            if (sel === 'ha-switch') return card.parts.find((p) => p.tag === 'ha-switch');
            const m = sel.match(/^\[(data-[\w-]+)(?:="([^"]*)")?\]$/);
            if (!m) return null;
            const key = m[1].slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase());
            return card.parts.find((p) => key in p.dataset && (m[2] == null || p.dataset[key] === m[2])) || null;
          };
          return card;
        },
      );
    },
  };
  root.getElementById = (id) => (id === 'accounts' ? box : null);
  return { root, box };
}

function renderedPanel(server) {
  const { panel, calls } = panelWith(server);
  const { root, box } = fakeShadow();
  panel.shadowRoot = root;
  return { panel, calls, root, box };
}

const field = (box, id, key) => box.querySelector(`ha-card[data-id="${id}"]`).querySelector(`[data-key="${key}"]`);

test('typing in a form keeps the focus and the caret when another account changes state', async () => {
  const server = { accounts: [account(), account({ entry_id: 'e2', title: 'Provider B', auto_title: 'b.example' })] };
  const { panel, root, box } = renderedPanel(server);
  await panel._load();
  const input = field(box, 'e1', 'scan_interval');
  input.focus();
  input.value = '3';
  input.selectionStart = 1;
  input.selectionEnd = 1;
  input.listeners.input();
  // The other account is retried by Home Assistant (setup_retry): config_entries/subscribe reloads the list
  server.accounts[1].state = 'setup_retry';
  await panel._load();
  const now = field(box, 'e1', 'scan_interval');
  assert.equal(root.activeElement, now, 'the field being typed in is focused again');
  assert.equal(now.value, '3', 'the typed value is kept');
  assert.deepEqual(now.selection?.slice(0, 2), [1, 1], 'the caret is put back');
});

test('a number field whose selection cannot be read still gets the focus back', async () => {
  const { panel, root, box } = renderedPanel({ accounts: [account()] });
  await panel._load();
  const input = field(box, 'e1', 'notify_days');
  Object.defineProperty(input, 'selectionStart', {
    get() {
      throw new Error('InvalidStateError');
    },
  });
  input.focus();
  panel._renderAccounts();
  assert.equal(root.activeElement, field(box, 'e1', 'notify_days'));
});

test('typing in account B is not interrupted by Check now on account A', async () => {
  const server = { accounts: [account(), account({ entry_id: 'e2', title: 'Provider B', auto_title: 'b.example' })] };
  const { panel, root, box } = renderedPanel(server);
  await panel._load();
  field(box, 'e2', 'title').focus();
  await panel._check(panel._accounts[0]);
  assert.equal(root.activeElement, field(box, 'e2', 'title'));
});

test('the focused Check now button gets the focus back once the check is over', async () => {
  const { panel, root, box } = renderedPanel({ accounts: [account()] });
  await panel._load();
  box.querySelector('ha-card[data-id="e1"]').querySelector('[data-do="check"]').focus();
  await panel._check(panel._accounts[0]);
  const button = box.querySelector('ha-card[data-id="e1"]').querySelector('[data-do="check"]');
  assert.equal(button.disabled, false);
  assert.equal(root.activeElement, button);
});

test('nothing is focused by a re-render when the focus was elsewhere', async () => {
  const { panel, root } = renderedPanel({ accounts: [account()] });
  await panel._load();
  await panel._load();
  assert.equal(root.activeElement, null);
});

test('a removed account does not break the focus restore', async () => {
  const server = { accounts: [account()] };
  const { panel, root, box } = renderedPanel(server);
  await panel._load();
  field(box, 'e1', 'title').focus();
  server.accounts = [];
  await panel._load();
  assert.equal(root.activeElement, null);
});

// --- Language of the bundled card ----------------------------------------------------------------------------

test('the bundled card follows a change of the Home Assistant language', () => {
  const configs = [];
  const card = {
    setConfig: (c) => configs.push({ ...c }),
  };
  context.document = { createElement: () => card };
  const panel = new IptvPanel();
  panel._render = () => {};
  panel._start = () => {};
  panel.hass = { language: 'fr' };
  panel._mountCard();
  panel.hass = { language: 'de' };
  // The card picks config.language first, then hass.language (iptvLang in iptv-card.js)
  const lang = configs.at(-1).language || card.hass.language;
  assert.equal(lang, 'de');
});

test('a Save button disabled after saving does not grab the focus on a later render', async () => {
  const server = { accounts: [account()] };
  const { panel, root, box } = renderedPanel(server);
  await panel._load();
  const input = field(box, 'e1', 'notify_days');
  input.value = '10';
  input.listeners.input();
  box.querySelector('ha-card[data-id="e1"]').querySelector('[data-do="save"]').focus();
  server.accounts = [account({ options: { ...account().options, notify_days: 10 } })];
  await panel._save(panel._accounts[0]);
  assert.equal(root.activeElement, null, 'the disabled Save button cannot keep the focus');
  await panel._load();
  assert.equal(root.activeElement, null);
  assert.ok(!panel._pendingFocus, "no focus is left waiting for the button");
});

test('state-coloured text of the panel reaches 4.5:1 in light and dark themes', () => {
  checkTextContrast(IptvPanel.STYLE, '--tone-text', 0.15);
  assert.match(IptvPanel.STYLE, /\.pill \{[^}]*[^-]color:var\(--tone-text\)/);
  assert.match(IptvPanel.STYLE, /\.msg\.good, \.msg\.bad \{ color:var\(--tone-text\)/);
});

test('on a phone the credential label shrinks to its text, so a MAC address is not cut', () => {
  const css = IptvPanel.STYLE;
  // Wide: a 130 px column so the values line up
  assert.match(css, /\.cred > span \{ width:130px;/);
  const narrow = css.match(/@media \(max-width: 4\d\dpx\) \{([^@]*?)\n {4}\}/)?.[1] || '';
  assert.match(narrow, /\.cred > span \{[^}]*width:auto/);
  assert.match(narrow, /\.cred > span \{[^}]*max-width:40%/);
});
