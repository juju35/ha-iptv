// ── Illustrated header ────────────────────────────────────────────────────────
// A living-room wall at the right of a 90 px banner: a wall-mounted TV over its cabinet, the cabinet standing on
// a 10 px parquet strip that runs edge to edge under the banner. The TV shows the state of the subscriptions:
// a live channel (playing), a dark screen with its standby light (idle) or a red cross (offline).
export var IPTV_THEMES = ['auto', 'day', 'night'];

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day picture after sunset)
export function iptvIsNight(hass, config) {
  var theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  return !!hass?.themes?.darkMode;
}

// State of the picture from the worst state of the subscriptions: an error is offline, no subscription is idle
export function iptvSceneState(state) {
  return { error: 'offline', idle: 'idle' }[state] || 'playing';
}

// The scene (the right 102 × 80 of a 200 × 80 picture, drawn from the right edge at the banner's height). `uid` keeps each card's clip path apart.
export function iptvSceneSvg(state, uid) {
  var screen;
  if (state === 'offline') {
    screen = '<g class="iptv-x" transform="translate(147 35)"><circle r="7"/><path d="M-3 -3 l6 6 M3 -3 l-6 6"/></g>';
  } else if (state === 'idle') {
    screen = '<path class="iptv-glare" d="M150 13 h14 l-26 44 h-14 Z"/>';
  } else {
    screen = `<g clip-path="url(#iptv-scr-${uid})"><g class="iptv-show"><circle class="iptv-sun" cx="128" cy="30" r="6"/>` +
      '<path class="iptv-hill" d="M107 57 L130 40 L146 50 L164 36 L187 52 V57Z"/></g></g>' +
      '<g class="iptv-live"><rect x="111" y="16" width="18" height="6" rx="1"/><text x="120" y="20.6" text-anchor="middle">LIVE</text></g>';
  }
  return `<svg class="scene ${state}" viewBox="98 0 102 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">` +
    `<defs><clipPath id="iptv-scr-${uid}"><rect x="107" y="13" width="80" height="44"/></clipPath></defs>` +
    '<rect class="iptv-frame" x="104" y="10" width="86" height="50" rx="2"/>' +
    '<rect class="iptv-screen" x="107" y="13" width="80" height="44"/>' +
    `${screen}<circle class="iptv-led" cx="186" cy="58.4" r=".9"/>` +
    '<rect class="iptv-cab" x="120" y="63" width="54" height="17" rx="1.5"/><rect class="iptv-cab-top" x="120" y="63" width="54" height="2.4" rx="1"/>' +
    '<path class="iptv-cab-line" d="M147 67 V78 M124 71.5 H143 M151 71.5 H170"/></svg>';
}

// Banner: wall colour, scene, ground strip, text on the left; day and night
export var IPTV_BANNER_CSS = `
    /* Illustrated card: the banner edge to edge at the top, the body under it keeps the card's 12 px margins */
    ha-card.ill { padding: 0 0 12px; overflow: hidden; }
    ha-card.ill > :not(.banner) { margin-left: 12px; margin-right: 12px; }
    ha-card.ill > .banner { margin-bottom: 2px; }
    ha-card.ill.mini-ill { padding: 0; }
    .banner { position: relative; overflow: hidden; flex: none; height: 90px; --iptv-g: 10px; --iptv-scene-w: min(102px, 40%);
              background: #f2eee8; color: #1f2a37; --iptv-sub: #4a5563; }
    .banner.night { background: #2a2f3d; color: #fff; --iptv-sub: rgba(255,255,255,.78); }
    .banner .scene { position: absolute; right: 0; bottom: var(--iptv-g); height: calc(100% - var(--iptv-g)); width: var(--iptv-scene-w); }
    .banner .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--iptv-g);
                      background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
    .banner.night .ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
    .htext { position: absolute; z-index: 1; left: 12px; top: 0; bottom: var(--iptv-g); right: calc(var(--iptv-scene-w) + 4px);
             display: flex; align-items: center; gap: 10px; min-width: 0; }
    .htext .titles { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .htext .name { color: inherit; }
    /* One line of pills: a pill that does not fit wraps out of sight rather than being cut (the first one shrinks) */
    .htext .chips { margin-top: 0; flex-wrap: wrap; max-height: 18px; overflow: hidden; }
    .htext .chips .chip { flex: none; }
    .htext .chips .chip:first-child { flex: 0 1 auto; min-width: 0; }
    /* The round icon on the wall, in the state colour (grey when idle), day and night */
    .htext .badge { position: relative; background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 24%, transparent); }
    .htext .badge.idle { --c: #7a828c; }
    .night .htext .badge { background: rgba(255,255,255,.12); color: color-mix(in srgb, var(--c) 78%, #fff);
                           box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
    .night .htext .badge.idle { --c: #a4adba; }
    /* Pills on the wall: a light (dark at night) tile, the text tinted with the state colour */
    .htext .chip { background: rgba(255,255,255,.72); color: color-mix(in srgb, var(--c) 55%, #1f2a37); }
    .night .htext .chip { background: rgba(10,16,30,.45); color: color-mix(in srgb, var(--c) 45%, #fff); }
    .htext .chip.idle { color: #4a5563; } .night .htext .chip.idle { color: rgba(255,255,255,.82); }
    /* Two lines of subscription chips at most (the detail button shows them all), so nothing is cut at the top */
    .htext .rs { max-height: 40px; overflow: hidden; }
    .htext .msg { padding: 0; font-size: 12px; line-height: 16px; max-height: 32px; overflow: hidden; color: var(--iptv-sub); }
    .htext button.r { color: inherit; }
    .htext .r .fig { color: var(--iptv-sub); }
    .htext .r.warning, .htext .r.error { color: color-mix(in srgb, var(--c) 55%, #1f2a37); background: rgba(255,255,255,.72); }
    .night .htext .r.warning, .night .htext .r.error { color: color-mix(in srgb, var(--c) 45%, #fff); background: rgba(10,16,30,.45); }
    :host([hide-title]) .htext .head > .name { visibility: hidden; }
    /* The card's buttons (add, refresh, detail), 24 px frosted rounds on one line in the banner's top-right corner */
    .banner > .acts { position: absolute; z-index: 2; top: 5px; right: 5px; display: flex; gap: 4px; }
    .banner > .acts:empty { display: none; }
    .banner > .acts button { all: unset; cursor: pointer; box-sizing: border-box; width: 24px; height: 24px; margin: 0; border-radius: 50%;
                             display: grid; place-items: center; --mdc-icon-size: 16px; color: #33506b; background: rgba(255,255,255,.55);
                             box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
    .banner > .acts button ha-icon { display: inline-flex; }
    .banner > .acts button:hover { background: rgba(255,255,255,.75); color: #33506b; }
    .night > .acts button { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
    .night > .acts button:hover { background: rgba(255,255,255,.22); color: #fff; }
    .banner > .acts button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    .banner > .acts button.spin ha-icon { animation: spin 1s linear infinite; }
    /* With buttons, the TV stands lower and smaller, under them; the text keeps clear of both */
    .banner:has(.acts > *) { --iptv-btns: 34px; --iptv-scene-w: min(66px, 30%); }
    .banner:has(.acts > :nth-child(2)) { --iptv-btns: 62px; }
    .banner:has(.acts > :nth-child(3)) { --iptv-btns: 90px; }
    .banner:has(.acts > *) .scene { height: calc(100% - var(--iptv-g) - 28px); }
    .banner:has(.acts > *) .htext { right: calc(max(var(--iptv-scene-w), var(--iptv-btns)) + 4px); }
    /* The status pill right after the title, a dot and its label in the state colour on frosted glass */
    .htext .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .htext .head > .name { flex: 0 1 auto; min-width: 4.5ch; }
    .htext .head > .chip.st { flex: none; margin-left: 0; max-width: none; gap: 5px; padding: 1px 8px; font-size: 11px; font-weight: 500; line-height: 16px;
                              background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
    .night .htext .head > .chip.st { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
    .htext .chip.st > ha-icon { display: none !important; }
    .htext .chip.st::before { content: ""; flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--c); }
    /* The whole title and the pill's whole label do not fit on one row (measured, see _fitPill): the pill on a line of
       its own under the other pills, which keep one line; when that does not fit above the floor, its dot alone, as on
       a card of 200 px or less */
    .htext .titles.below .head { display: contents; }
    .htext .titles.below .head > .chip.st { order: 2; align-self: flex-start; }
    .htext .titles.below > :not(.head) { order: 1; max-height: 18px; }
    .htext .titles.dot-only .head > .chip.st { padding: 4px; } .htext .titles.dot-only .head > .chip.st .tx { display: none; }
    @container (max-width: 200px) { .htext .head > .chip.st { padding: 4px; } .htext .head > .chip.st .tx { display: none; } }
    /* The TV, its cabinet and what it shows */
    .iptv-frame { fill: #20242c; }
    .iptv-screen { fill: #3d6ec9; } .night .iptv-screen { fill: #2b4a7a; }
    .scene.offline .iptv-screen, .scene.idle .iptv-screen { fill: #1a1d22; }
    .iptv-sun { fill: #ffd65a; } .iptv-hill { fill: #2e7d32; }
    .iptv-show { animation: iptv-show 4s ease-in-out infinite; }
    .iptv-live rect { fill: #e5484d; }
    .iptv-live text { font: 700 4.6px sans-serif; fill: #fff; }
    .iptv-x circle { fill: #e5484d; } .iptv-x path { stroke: #fff; stroke-width: 1.6; fill: none; }
    .iptv-glare { fill: #fff; opacity: .05; }
    .iptv-led { fill: #43a047; } .scene.offline .iptv-led { fill: #e5484d; }
    .scene.idle .iptv-led { fill: #ffa600; animation: iptv-led 3s ease-in-out infinite; }
    .iptv-cab { fill: #c9b79c; } .iptv-cab-top { fill: #b5a184; } .iptv-cab-line { stroke: #a8946f; stroke-width: .6; fill: none; }
    .night .iptv-cab { fill: #3c4558; } .night .iptv-cab-top { fill: #4a5468; } .night .iptv-cab-line { stroke: #2c3445; }
    @keyframes iptv-show { 50% { opacity: .2; } }
    @keyframes iptv-led { 50% { opacity: .25; } }
    /* Narrow card: no room for the TV beside the text, the wall and the floor stay */
    @container (max-width: 300px) {
      .banner .scene { display: none; }
      .htext, .banner:has(.acts > *) .htext { right: calc(var(--iptv-btns, 8px) + 4px); }
    }
    /* The narrowest cards: the pill keeps its dot alone (its label in its tooltip) */
    @container (max-width: 200px) {
      .htext .head > .chip.st { padding: 4px; }
      .htext .head > .chip.st .tx { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .iptv-show, .iptv-led, .banner > .acts button.spin ha-icon { animation: none !important; }
      .banner > .acts button.spin ha-icon { opacity: .5; }
    }
`;
