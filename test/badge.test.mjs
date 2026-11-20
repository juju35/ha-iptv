// Unit tests for the sidebar badge module: the file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../custom_components/iptv/frontend/iptv-badge.js', import.meta.url), 'utf8');
const context = {
  // Already initialised: the module only defines its functions (no timers, no DOM).
  window: { __iptvBadge_init: true, __iptvBadgeCount: 0 },
  localStorage: { getItem: () => null, setItem() {} },
  document: { querySelector: () => null },
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.badge = { iptvKoCount };`, context);
const { iptvKoCount } = context.badge;

const states = {
  'sensor.box_health': { state: 'unreachable' },
  'sensor.box_status': { state: 'active' },
  'sensor.other_health': { state: 'stream_ko' },
  'sensor.router_link': { state: 'unreachable' },
  'sensor.template_ping': { state: 'unreachable' },
  'binary_sensor.x': { state: 'auth_failed' },
};

test('KO count: every failing health state while the registry is not loaded', () => {
  assert.equal(iptvKoCount({ states }), 4);
  assert.equal(iptvKoCount({ states, entities: {} }), 4);
  assert.equal(iptvKoCount({}), 0);
});

test('KO count: only the iptv sensors once the registry is loaded', () => {
  const entities = {
    'sensor.box_health': { platform: 'iptv' },
    'sensor.other_health': { platform: 'iptv' },
    'sensor.router_link': { platform: 'ping' },
  };
  // sensor.template_ping has no registry entry (no unique id): not an IPTV sensor.
  assert.equal(iptvKoCount({ states, entities }), 2);
});
