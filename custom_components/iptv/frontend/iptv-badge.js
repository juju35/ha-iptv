// IPTV's sidebar badge, loaded on every page: the number of accounts whose health check is failing (KO) on the
// panel's sidebar item, in the danger colour, like Home Assistant's own notifications count. An account is KO when
// its health sensor reads auth_failed, unreachable or stream_ko (a slow "degraded" account still works, so it does
// not count). The count is read from the accounts' health sensors, which Home Assistant keeps up to date; the badge
// follows them. The last value is kept by the browser, so the sidebar shows it at once.
var IPTV_COUNT_KEY = 'iptv-ko-count';
var IPTV_EVERY_MS = 15000;
// A failing health state. "degraded" (slow) is left out: the account still works.
var IPTV_KO_STATES = new Set(['auth_failed', 'unreachable', 'stream_ko']);
// The badge is always danger (red); its text is white.
var IPTV_BADGE_COLOR = 'var(--error-color, #db4437)';

function iptvBadgeSaved() {
  try {
    var n = parseInt(localStorage.getItem(IPTV_COUNT_KEY), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch (_err) {
    return 0;
  }
}
window.__iptvBadgeCount ??= iptvBadgeSaved();

// The IPTV item in Home Assistant's sidebar, or null until the sidebar is drawn. The recent sidebar gives each item
// the id `sidebar-panel-<path>` and sets its href as a property (not an attribute), so the id is the reliable hook;
// `[href]` and `[data-panel]` catch the older sidebars (an <a> wrapping a paper-icon-item).
function iptvSidebarItem() {
  var ha = document.querySelector('home-assistant')?.shadowRoot;
  var sidebar = ha?.querySelector('home-assistant-main')?.shadowRoot?.querySelector('ha-sidebar')?.shadowRoot;
  if (!sidebar) return null;
  return (
    sidebar.querySelector('#sidebar-panel-iptv-config') ||
    sidebar.querySelector('[href="/iptv-config"]') ||
    sidebar.querySelector('[data-panel="iptv-config"]')
  );
}

// One badge span, styled as Home Assistant's own sidebar badge (class `badge`, so the sidebar's CSS places it and
// shows or hides it by slot and expanded state) but in the danger colour instead of the accent colour.
function iptvBadgeSpan(text, slot, key) {
  var el = document.createElement('span');
  el.className = 'badge iptv-badge';
  el.slot = slot;
  el.dataset.key = key;
  el.textContent = text;
  el.style.cssText = `min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; align-items:center; border-radius:9px; font-size:11px; font-weight:500; line-height:1; color:#fff; background:${IPTV_BADGE_COLOR};`;
  return el;
}

// The badge on the sidebar item: the number of KO accounts, like the notifications count; none when all are healthy.
// On the recent sidebar (ha-list-item-button / ha-md-list-item) it mirrors Home Assistant's own badge — a span in
// the start slot (shown when the sidebar is collapsed, over the icon) and one in the end slot (shown when expanded) —
// so the sidebar's CSS handles the placement and the collapsed/expanded switch. On the older sidebar (an <a>) a
// single span is placed at the right. Redrawn when Home Assistant rebuilds its items; unchanged, it writes nothing
// (so the observer below does not loop).
function iptvBadgeRedraw() {
  var item = iptvSidebarItem();
  if (!item) return false;
  var count = window.__iptvBadgeCount;
  var spans = item.querySelectorAll(':scope > .iptv-badge');
  if (!count) {
    for (var b of spans) b.remove();
    return true;
  }
  var text = count > 99 ? '99+' : String(count);
  var key = text;
  if (item.localName === 'a') {
    var badge = spans[0];
    if (badge && badge.dataset.key === key) return true;
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'iptv-badge';
      item.style.position = 'relative';
      item.appendChild(badge);
    }
    badge.dataset.key = key;
    badge.textContent = text;
    badge.style.cssText = `position:absolute; right:12px; top:50%; transform:translateY(-50%); min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; display:inline-flex; align-items:center; justify-content:center; border-radius:9px; font-size:11px; font-weight:500; line-height:1; pointer-events:none; z-index:1; color:#fff; background:${IPTV_BADGE_COLOR};`;
    return true;
  }
  if (spans.length === 2 && spans[0].dataset.key === key) return true;
  for (var old of spans) old.remove();
  // The start badge goes right after the icon, so the sidebar's `ha-svg-icon + .badge` rule places it over the icon.
  var icon = item.querySelector(':scope > ha-svg-icon[slot="start"]') || item.querySelector(':scope > ha-icon[slot="start"]');
  var start = iptvBadgeSpan(text, 'start', key);
  if (icon) item.insertBefore(start, icon.nextSibling);
  else item.appendChild(start);
  item.appendChild(iptvBadgeSpan(text, 'end', key));
  return true;
}

// Until the sidebar has drawn the item (it may come after this module): every 250 ms for 5 seconds
function iptvBadgeRedrawSoon(tries = 20) {
  if (iptvBadgeRedraw() || tries <= 1) return;
  setTimeout(() => iptvBadgeRedrawSoon(tries - 1), 250);
}

// The sidebar rebuilds its items (opened, folded, panels changed): the badge is added again when it is dropped
function iptvBadgeObserve() {
  var item = iptvSidebarItem();
  var sidebar = item?.getRootNode();
  if (!sidebar) {
    setTimeout(iptvBadgeObserve, 500);
    return;
  }
  if (sidebar.__iptvBadgeObserved) return;
  sidebar.__iptvBadgeObserved = true;
  new MutationObserver(() => {
    if (window.__iptvBadgeRaf) return;
    window.__iptvBadgeRaf = requestAnimationFrame(() => {
      window.__iptvBadgeRaf = 0;
      iptvBadgeRedraw();
    });
  }).observe(sidebar, { childList: true, subtree: true });
}

// The KO count: the badge drawn again when it changes, kept for the next page
function iptvSetBadge(count) {
  count = Math.max(0, parseInt(count, 10) || 0);
  if (window.__iptvBadgeCount === count) return;
  window.__iptvBadgeCount = count;
  try {
    localStorage.setItem(IPTV_COUNT_KEY, String(count));
  } catch (_err) {
    // drawn anyway, not kept
  }
  iptvBadgeRedraw();
}

// The number of IPTV accounts whose health sensor is in a failing state. A KO health value never collides with the
// account-status sensor's values (active, expired…), so the state alone identifies a failing health sensor; the
// platform is checked too when the registry is loaded.
function iptvKoCount(hass) {
  var states = hass?.states;
  if (!states) return 0;
  var count = 0;
  for (var id in states) {
    if (!id.startsWith('sensor.')) continue;
    if (!IPTV_KO_STATES.has(states[id]?.state)) continue;
    if (hass.entities?.[id] && hass.entities[id].platform !== 'iptv') continue;
    count += 1;
  }
  return count;
}

// The KO accounts read from the health sensors, reported for the sidebar badge
function iptvFollow() {
  var hass = document.querySelector('home-assistant')?.hass;
  if (!hass?.user?.is_admin || document.hidden) return;
  iptvSetBadge(iptvKoCount(hass));
}

if (!window.__iptvBadge_init) {
  window.__iptvBadge_init = true;
  iptvBadgeRedrawSoon();
  iptvBadgeObserve();
  // The health read a few seconds after the page, once Home Assistant has drawn it, then every 15 seconds
  setTimeout(iptvFollow, 3000);
  setInterval(iptvFollow, IPTV_EVERY_MS);
}
