// ── End of the folded top bar ──
import { IPTV_PANEL_GENERAL, IPTV_PANEL_HIDE_TOOLBAR, IPTV_PANEL_LIMITS, IPTV_PANEL_TABS, IPTV_PANEL_WARNING_DAYS, iptvPanelError, iptvPanelEsc, iptvPanelGlyph, iptvPanelScene, iptvPanelSceneSvg, iptvPanelSeverity, iptvPanelSubscriptions, iptvPanelSummary, iptvPanelT, iptvPanelTone } from "./core.js";
import { IPTV_PANEL_VERSION } from "./version.js";
import { iptvPanelFold } from "./fold.js";
import { IptvPanelI18n } from "./i18n/iptvpaneli18n.js";

export class IptvPanel extends HTMLElement {
  // The release checks it matches the other versions; the panel no longer loads the card with it
  static VERSION = IPTV_PANEL_VERSION;

  static STYLE = `
    :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color);
            --tone-good: var(--success-color, #43a047); --tone-warn: var(--warning-color, #ffa600); --tone-bad: var(--error-color, #db4437); }
    /* The top bar: the card's living room across the page (title, status, Add / Refresh / settings in its corner),
       as on the ENT ONE panel; the tabs under it, sticky */
    .topbar { position:relative; }
    .banner.page { height:90px; --scene-w:min(150px, 30%); }
    .banner.page .htext { left:8px; }
    .banner.page .hmenu { flex:none; color:inherit; align-self:center; }
    .banner.page .hmenu:empty { display:none; }
    /* The name at 20px, as the other ha-* panels' top bars (ENT ONE, GitHub, Smart Comfort) */
    .banner.page .head > .name { font-size:20px; }
    .banner.page:has(.acts > :nth-child(2)) .scene { right:calc(var(--acts-w, 130px) + 8px); bottom:var(--g); height:calc(100% - var(--g) - 6px); }
    .banner.page:has(.acts > :nth-child(2)) .htext { right:calc(var(--scene-w) + var(--acts-w, 130px) + 24px); }
    .banner.page .acts { top:calc((100% - var(--g)) / 2 - 17px); right:12px; }
    .banner.page .acts a { all:unset; cursor:pointer; box-sizing:border-box; width:34px; height:34px; border-radius:50%; display:grid; place-items:center;
                           color:#33506b; background:rgba(255,255,255,.55); box-shadow:inset 0 0 0 1px rgba(255,255,255,.7); --mdc-icon-size:20px; }
    .banner.page.night .acts a { color:#fff; background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
    .banner.page .acts a:hover { background:rgba(255,255,255,.82); }
    .banner.page .acts a ha-icon { display:inline-flex; }
    /* Tabs under the top bar: text, the active one underlined in the IPTV indigo, sticky at the top */
    .tabs { display:flex; align-items:center; gap:4px; padding:0 12px; overflow-x:auto; background:var(--primary-background-color);
            border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12)); position:sticky; top:0; z-index:2; }
    .tablist { display:flex; gap:4px; }
    .tabs .tab { color:var(--secondary-text-color); }
    .tabs .tab.active { color:var(--primary-text-color); border-bottom-color:#3f51b5; }
    .tabs .tab .cnt { display:inline-block; min-width:18px; padding:1px 5px; margin-left:5px; border-radius:9px; font-size:11px; text-align:center; box-sizing:border-box;
                      color:color-mix(in srgb, var(--tone-bad) 60%, var(--primary-text-color)); background:color-mix(in srgb, var(--tone-bad) 16%, transparent); }
    /* The menu button is wrapped: its own styles (inline display) cannot show it while the top bar is there */
    .tabmenu { display:none; color:var(--primary-text-color); margin-left:-4px; align-self:center; }
    /* Top bar hidden (Settings → Panel): the tabs alone at the top, the sidebar menu in front of them */
    :host([hide-toolbar]) .topbar { display:none; }
    :host([hide-toolbar]) .tabmenu { display:flex; }
    :host([hide-toolbar]) .md-list { top:56px; }
    .general .acc-head .msg { flex:none; }
    .general .box select { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .general .box select option { color:initial; }
    .tab { background:none; border:none; border-bottom:2px solid transparent; padding:12px 12px 10px; font:inherit; font-size:14px; font-weight:500;
           cursor:pointer; white-space:nowrap; }
    .tab:hover { color:var(--primary-text-color); }
    .tab:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
    main { max-width:1040px; margin:0 auto; padding:16px; box-sizing:border-box; }
    section[hidden] { display:none; }
    .column { display:flex; flex-direction:column; gap:12px; min-width:0; }
    .note { padding:16px; color:var(--secondary-text-color); }
    .note.error { display:flex; flex-direction:column; gap:10px; align-items:flex-start; color:var(--primary-text-color); border-left:3px solid var(--error-color, #db4437); }
    .account { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
    .acc-head { display:flex; align-items:center; gap:12px; }
    .avatar { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
              color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 15%, transparent); }
    .who { flex:1; min-width:0; }
    .who .n { font-size:16px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .who .s { font-size:12px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:monospace; }
    .pill { flex:none; font-size:11px; font-weight:500; padding:2px 10px; border-radius:12px; color:var(--tone-text); background:color-mix(in srgb, var(--tone) 15%, transparent); }
    .good { --tone:var(--tone-good); } .warn { --tone:var(--tone-warn); } .bad { --tone:var(--tone-bad); }
    /* Text in a state colour: half-way to the text colour, so it stays readable (4.5:1) in light and dark themes */
    .good, .warn, .bad { --tone-text: color-mix(in srgb, var(--tone) 50%, var(--primary-text-color)); }
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:10px 14px; }
    .wide { grid-column:1 / -1; }
    .ctl { display:flex; flex-direction:column; gap:4px; min-width:0; }
    .ctl > span { font-size:12px; color:var(--secondary-text-color); }
    .ctl small { font-size:11px; color:var(--secondary-text-color); opacity:.85; }
    .box { display:flex; align-items:center; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3));
           background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .box:focus-within { border-color:var(--primary-color); }
    .box.bad-value { border-color:var(--tone-bad); }
    .box input { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .box em { font-style:normal; font-size:12px; color:var(--secondary-text-color); padding-right:10px; }
    .toggle { display:flex; align-items:center; gap:12px; cursor:pointer; }
    .toggle > div { flex:1; display:flex; flex-direction:column; gap:2px; font-size:14px; }
    .bar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid var(--divider-color, rgba(127,127,127,.2)); padding-top:10px; }
    .bar .links { flex:1; display:flex; gap:4px; flex-wrap:wrap; }
    .bar .links a { font-size:12px; color:var(--secondary-text-color); text-decoration:none; display:inline-flex; align-items:center; gap:4px;
                    padding:4px 8px; border-radius:8px; --mdc-icon-size:15px; }
    .bar .links a:hover { background:var(--secondary-background-color); color:var(--primary-text-color); }
    .msg { font-size:12px; color:var(--secondary-text-color); }
    .msg.good, .msg.bad { color:var(--tone-text); }
    .act { display:inline-flex; align-items:center; gap:6px; border:0; cursor:pointer; font:inherit; font-size:13px; font-weight:500;
           padding:7px 12px; border-radius:8px; --mdc-icon-size:16px; color:var(--primary-color);
           background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .act:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .act.quiet { color:var(--primary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.12)); }
    .act[disabled] { opacity:.5; cursor:default; }
    .act.bad { color:var(--tone-text); background:color-mix(in srgb, var(--tone) 14%, transparent); }
    .act.bad:hover:not([disabled]) { background:color-mix(in srgb, var(--tone) 22%, transparent); }
    /* Confirmation at the top of the account, like the card's popups */
    .confirm { display:flex; flex-direction:column; gap:8px; padding:10px 12px; border-radius:10px;
               border:1px solid color-mix(in srgb, var(--tone-bad) 45%, transparent); background:color-mix(in srgb, var(--tone-bad) 8%, transparent); }
    .confirm .cf-t { font-size:14px; font-weight:500; }
    .confirm .cf-b { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
    .creds { display:flex; flex-direction:column; gap:2px; padding:6px 10px; border-radius:10px;
             background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .cred { display:flex; align-items:center; gap:10px; min-height:32px; }
    .cred > span { width:130px; flex:none; font-size:12px; color:var(--secondary-text-color); }
    .cred code { flex:1; min-width:0; font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; user-select:all; }
    /* Phone: the label takes only its own width, the value (a MAC address) the rest */
    @media (max-width: 420px) {
      .cred > span { width:auto; max-width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    }
    .cred code.masked { letter-spacing:.15em; color:var(--secondary-text-color); user-select:none; }
    .ico { border:0; background:none; cursor:pointer; color:var(--secondary-text-color); padding:5px; border-radius:50%; display:flex; --mdc-icon-size:18px; }
    .ico:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color) 12%, transparent); color:var(--primary-color); }
    .ico.done { color:var(--tone-good); }
    .ico[disabled] { opacity:.4; cursor:default; }
    /* Subscriptions tab: the tools, the add form, then one card per subscription in a grid */
    .tools { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .tools .grow { flex:1; }
    .subs { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 330px), 1fr)); gap:12px; align-items:start; }
    .sub { padding:14px 16px; display:flex; flex-direction:column; gap:12px; min-width:0; }
    .sub .who .s { font-family:inherit; }
    .sub .avatar { color:var(--tone-text); background:color-mix(in srgb, var(--tone) 15%, transparent); }
    .pill { display:inline-flex; align-items:center; gap:4px; --mdc-icon-size:14px; }
    button.pill { border:0; cursor:pointer; font:inherit; font-size:11px; font-weight:500; }
    button.pill:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    .expiry { display:flex; flex-direction:column; gap:6px; }
    .expiry .line { display:flex; justify-content:space-between; gap:8px; font-size:13px; }
    .expiry .line b { font-weight:500; color:var(--tone-text); white-space:nowrap; }
    .meter { height:6px; border-radius:3px; background:color-mix(in srgb, var(--tone) 18%, transparent); overflow:hidden; }
    .meter i { display:block; height:100%; width:var(--p); background:var(--tone); border-radius:3px; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:6px; }
    .stat { display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 4px; border-radius:10px; min-width:0;
            background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .stat b { font-size:16px; font-weight:500; font-variant-numeric:tabular-nums; }
    .stat span { font-size:11px; color:var(--secondary-text-color); max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .facts { display:flex; flex-wrap:wrap; gap:6px; font-size:12px; color:var(--secondary-text-color); }
    .fact { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:10px; --mdc-icon-size:14px;
            background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .fact.good, .fact.warn, .fact.bad { color:var(--tone-text); background:color-mix(in srgb, var(--tone) 12%, transparent); }
    .form { display:flex; flex-direction:column; gap:10px; padding:12px; border-radius:10px; border:1px solid var(--divider-color, rgba(127,127,127,.3)); }
    .form .t { font-size:14px; font-weight:500; }
    .form .b { display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap; }
    .form .err { font-size:12px; color:var(--tone-text); --tone:var(--tone-bad); }
    .form select { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .form select option { color:initial; }
    .addcard { padding:14px 16px; }
    /* Settings tab: the accounts on the left, the selected one on the right; on a phone, one then the other */
    .md { display:grid; grid-template-columns:minmax(220px, 300px) minmax(0, 1fr); gap:12px; align-items:start; }
    .md-list { padding:6px; display:flex; flex-direction:column; gap:2px; position:sticky; top:56px; }
    .md-item { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:0; border-radius:10px; background:none;
               color:inherit; font:inherit; text-align:left; cursor:pointer; }
    .md-item:hover { background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .md-item.active { background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .md-item:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
    .md-item .who .n { font-size:14px; }
    .md-item .who .n, .md-item .who .s { display:block; }
    .md-ico { flex:none; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:18px;
              color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 12%, transparent); }
    .md-item .dot { flex:none; width:8px; height:8px; border-radius:50%; background:var(--tone); }
    .md-back { display:none; align-self:flex-start; margin-bottom:8px; }
    .md-detail { display:flex; flex-direction:column; min-width:0; }
    .cred.edit { justify-content:flex-end; }
    @media (max-width: 720px) {
      .md { grid-template-columns:minmax(0, 1fr); }
      .md-list { position:static; }
      .md.open .md-list { display:none; }
      .md:not(.open) .md-detail { display:none; }
      .md-back { display:inline-flex; }
    }
    .addcard .form { border:0; padding:0; }
    @media (max-width: 600px) {
      main { padding:12px 8px; }
    }
    /* ── Redesign (3.36): the charte of the ha-* cards — illustrated banners, calm tiles, a glyph of state on each icon ── */
    .idle { --tone: #8a939e; }
    .idle { --tone-text: color-mix(in srgb, var(--tone) 50%, var(--primary-text-color)); }
    /* The living-room banner of the card: a wall, the TV over its cabinet, a parquet strip; day and night */
    .banner { position:relative; overflow:hidden; height:90px; --g:10px; --scene-w:min(102px, 34%);
              background:#f2eee8; color:#1f2a37; --sub:#4a5563; }
    .banner.big { height:130px; --scene-w:min(150px, 34%); }
    .banner.night { background:#2a2f3d; color:#fff; --sub:rgba(255,255,255,.78); }
    .banner .scene { position:absolute; right:12px; bottom:var(--g); height:calc(100% - var(--g) - 6px); width:var(--scene-w); }
    .banner .ground { position:absolute; left:0; right:0; bottom:0; height:var(--g);
                      background:repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow:inset 0 2px 0 #a97c50; }
    .banner.night .ground { background:repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow:inset 0 2px 0 #5c4836; }
    .banner .htext { position:absolute; z-index:1; left:16px; top:0; bottom:var(--g); right:calc(var(--scene-w) + 60px);
                     display:flex; align-items:center; gap:14px; min-width:0; }
    .banner .titles { display:flex; flex-direction:column; gap:5px; min-width:0; }
    .banner .head { display:flex; align-items:center; gap:10px; min-width:0; flex-wrap:wrap; }
    .banner .name { font-size:18px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
    .banner.big .name { font-size:22px; }
    .banner .sub-l { font-size:12px; color:var(--sub); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .banner .sub-l.mono { font-family:monospace; }
    .banner .chips { display:flex; gap:6px; flex-wrap:wrap; max-height:22px; overflow:hidden; }
    /* Pills on the wall: frosted, the text in the state colour */
    .banner .chip { display:inline-flex; align-items:center; gap:5px; padding:2px 9px; border-radius:12px; font-size:11.5px; font-weight:500;
                    white-space:nowrap; background:rgba(255,255,255,.72); color:color-mix(in srgb, var(--tone) 55%, #1f2a37); }
    .banner.night .chip { background:rgba(10,16,30,.45); color:color-mix(in srgb, var(--tone) 45%, #fff); }
    .banner .chip.st { background:color-mix(in srgb, var(--tone) 18%, rgba(255,255,255,.8)); }
    .banner.night .chip.st { background:color-mix(in srgb, var(--tone) 30%, rgba(8,18,38,.55)); }
    .banner .chip.st::before, .chip .dot, .fact .dot { content:""; flex:none; width:7px; height:7px; border-radius:50%; background:var(--tone); }
    .banner .badge { flex:none; width:44px; height:44px; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
                     color:var(--tone); background:rgba(255,255,255,.62); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--tone) 26%, transparent); }
    .banner.big .badge { width:52px; height:52px; --mdc-icon-size:26px; }
    .banner.night .badge { background:rgba(255,255,255,.12); color:color-mix(in srgb, var(--tone) 78%, #fff); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); }
    /* The buttons of a banner: frosted rounds in its top-right corner */
    .banner .acts { position:absolute; z-index:2; top:8px; right:8px; display:flex; gap:6px; }
    .banner .acts button { all:unset; cursor:pointer; box-sizing:border-box; width:34px; height:34px; border-radius:50%; display:grid; place-items:center;
                           --mdc-icon-size:18px; color:#33506b; background:rgba(255,255,255,.6); box-shadow:inset 0 0 0 1px rgba(255,255,255,.8); backdrop-filter:blur(4px); }
    .banner .acts button:hover:not([disabled]) { background:rgba(255,255,255,.82); }
    .banner .acts button[disabled] { opacity:.6; cursor:default; }
    .banner.night .acts button { color:#fff; background:rgba(255,255,255,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.2); }
    .banner .acts button:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    .banner .acts button ha-icon { display:inline-flex; }
    .spin ha-icon { animation:tv-spin 1s linear infinite; }
    /* One button (an account): the TV stands left of it; two (the big banner): under them */
    .banner:has(.acts > *) .scene { right:54px; }
    .banner:has(.acts > *) .htext { right:calc(var(--scene-w) + 70px); }
    .banner:has(.acts > :nth-child(2)) .scene { right:14px; bottom:var(--g); height:calc(100% - var(--g) - 46px); }
    .banner:has(.acts > :nth-child(2)) .htext { right:calc(var(--scene-w) + 40px); }
    /* The TV, its cabinet and what it shows (the card's picture) */
    .tv-frame { fill:#20242c; } .tv-screen { fill:#3d6ec9; } .night .tv-screen { fill:#2b4a7a; }
    .scene.offline .tv-screen, .scene.idle .tv-screen { fill:#1a1d22; }
    .tv-sun { fill:#ffd65a; } .tv-hill { fill:#2e7d32; } .tv-show { animation:tv-show 4s ease-in-out infinite; }
    .tv-live rect { fill:#e5484d; } .tv-live text { font:700 4.6px sans-serif; fill:#fff; }
    .tv-x circle { fill:#e5484d; } .tv-x path { stroke:#fff; stroke-width:1.6; fill:none; }
    .tv-glare { fill:#fff; opacity:.05; } .tv-led { fill:#43a047; } .scene.offline .tv-led { fill:#e5484d; }
    .scene.idle .tv-led { fill:#ffa600; animation:tv-led 3s ease-in-out infinite; }
    .tv-cab { fill:#c9b79c; } .tv-cab-top { fill:#b5a184; } .tv-cab-line { stroke:#a8946f; stroke-width:.6; fill:none; }
    .night .tv-cab { fill:#3c4558; } .night .tv-cab-top { fill:#4a5468; } .night .tv-cab-line { stroke:#2c3445; }
    @keyframes tv-show { 50% { opacity:.2; } }
    @keyframes tv-led { 50% { opacity:.25; } }
    @keyframes tv-spin { to { transform:rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .tv-show, .tv-led, .spin ha-icon { animation:none !important; } }
    @media (max-width: 600px) {
      .banner.big { height:150px; --scene-w:min(96px, 30%); }
      .banner.big .htext { right:calc(var(--scene-w) + 16px); left:14px; align-items:flex-end; padding-bottom:12px; }
      .banner.big .badge { display:none; }
      .banner .htext { right:calc(var(--scene-w) + 20px); }
      .banner.big .name { font-size:19px; }
    }
    /* Subscriptions: the banner, then one calm tile per subscription */
    /* Over the subscriptions: state filter and tiles of the chart (as on the ENT ONE panel) */
    #overview { display:flex; flex-direction:column; gap:12px; } #overview:empty { display:none; }
    .filters { display:flex; flex-wrap:wrap; gap:8px; }
    .fchip { all:unset; cursor:pointer; display:inline-flex; align-items:center; gap:6px; min-height:30px; padding:0 12px; border-radius:16px; font-size:13px; box-sizing:border-box;
             color:var(--secondary-text-color); background:var(--card-background-color, #fff); border:1px solid var(--divider-color, #e0e0e0); }
    .fchip.on { color:var(--primary-text-color); border:1.5px solid #3f51b5; }
    .fchip:focus-visible { outline:2px solid var(--primary-color); }
    .fchip .dot { width:7px; height:7px; border-radius:50%; background:var(--tone); }
    .fchip .dot.good { --tone:var(--tone-good); } .fchip .dot.warn { --tone:var(--tone-warn); } .fchip .dot.bad { --tone:var(--tone-bad); }
    .otiles { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:12px; }
    .otile { all:unset; box-sizing:border-box; display:flex; align-items:center; gap:12px; min-width:0; padding:12px 14px; border-radius:12px; cursor:pointer;
             background:var(--card-background-color, #fff); border:1px solid var(--divider-color, #e0e0e0); --c:#8a96a3; }
    .otile[disabled] { cursor:default; }
    .otile:not([disabled]):hover { border-color:color-mix(in srgb, var(--c) 55%, var(--divider-color, #e0e0e0)); }
    .otile:focus-visible { outline:2px solid var(--primary-color); }
    .otile.bad { --c:var(--tone-bad); } .otile.warn { --c:var(--tone-warn); } .otile.good { --c:var(--tone-good); } .otile.blue { --c:#2f80ed; }
    .otile .pastille { position:relative; flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
                       color:var(--c); background:color-mix(in srgb, var(--c) 16%, transparent); }
    .otile .pbadge { position:absolute; top:-3px; right:-5px; min-width:18px; height:18px; padding:0 4px; box-sizing:border-box; border-radius:9px; font-size:11px; font-weight:600;
                     line-height:18px; text-align:center; color:#fff; background:var(--c); box-shadow:0 0 0 2px var(--card-background-color, #fff); }
    .otile .tl { display:flex; flex-direction:column; min-width:0; }
    .otile .tn { font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .otile .ts { font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:color-mix(in srgb, var(--c) 65%, var(--primary-text-color)); }
    .otile.rest .ts { color:var(--secondary-text-color); }
    @media (max-width: 900px) { .otiles { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .banner.page { --scene-w:0px; } .banner.page .scene { display:none; } .banner.page .htext { right:calc(var(--acts-w, 130px) + 12px); }
      .banner.page .badge { display:none; } }
    .subs { gap:14px; }
    .sub { padding:16px; gap:14px; }
    .t-head { display:flex; align-items:center; gap:12px; }
    .t-head .who .n { font-size:16px; font-weight:700; }
    .avatar, .md-ico { position:relative; }
    .sub .avatar, .md-ico.good, .md-ico.warn, .md-ico.bad { color:var(--tone); background:color-mix(in srgb, var(--tone) 16%, transparent); }
    .sub .avatar { width:42px; height:42px; }
    .st-badge { position:absolute; right:-3px; bottom:-3px; width:17px; height:17px; border-radius:50%; display:grid; place-items:center;
                background:var(--tone); box-shadow:0 0 0 2px var(--card-background-color, #fff); }
    .st-badge svg { width:11px; height:11px; fill:none; stroke:#fff; stroke-width:3.2; stroke-linecap:round; stroke-linejoin:round; }
    .md-ico .st-badge { width:14px; height:14px; right:-2px; bottom:-2px; } .md-ico .st-badge svg { width:9px; height:9px; }
    .state { display:block; border:0; padding:0; background:none; font:inherit; font-size:13px; font-weight:500; text-align:left; cursor:pointer;
             color:var(--tone-text); max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .state:hover { text-decoration:underline; } .state:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; border-radius:4px; }
    .t-acts { display:flex; gap:6px; flex:none; }
    .ico-btn { width:36px; height:36px; border:0; border-radius:10px; display:grid; place-items:center; cursor:pointer; --mdc-icon-size:18px;
               color:var(--primary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.12)); }
    .ico-btn:hover { background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .ico-btn.bad { color:var(--tone-text); background:color-mix(in srgb, var(--tone) 12%, transparent); }
    .ico-btn:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
    .alert { display:flex; align-items:center; flex-wrap:wrap; gap:10px; padding:10px 12px; border-radius:12px; font-size:12.5px; line-height:1.4;
             color:var(--tone-text); background:color-mix(in srgb, var(--tone) 11%, transparent); --mdc-icon-size:18px; }
    .alert > span { flex:1; min-width:180px; }
    .alert .act { padding:6px 10px; }
    .act.bad.spin, .act.spin { opacity:.7; }
    .expiry .line b { font-weight:700; }
    .stats { gap:8px; }
    .stat { align-items:flex-start; padding:9px 10px; border-radius:12px; gap:3px; }
    .stat .k { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--secondary-text-color); --mdc-icon-size:13px; max-width:100%;
               overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .stat b { display:flex; align-items:center; gap:7px; }
    .stat.dim { opacity:.45; }
    .slots { display:inline-flex; gap:3px; } .slots i { width:8px; height:8px; border-radius:50%; box-shadow:inset 0 0 0 1.5px var(--tone); }
    .slots i.on { background:var(--tone); }
    .t-foot { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
    .t-foot .grow { flex:1; } .t-foot .when { font-size:11.5px; color:var(--secondary-text-color); }
    .fact { padding:3px 9px; border-radius:12px; font-size:11.5px; font-weight:500; gap:5px; }
    @media (max-width: 1000px) { .stats { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
    /* Settings: General, then Accounts, in the list; the page of the selected entry */
    .md-cap { font-size:11px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary-text-color); padding:10px 10px 4px; }
    .md-none { font-size:12.5px; color:var(--secondary-text-color); padding:4px 10px 10px; }
    .md-item .who .s.plain, .who .s.plain { font-family:inherit; }
    .account { padding:0; gap:0; overflow:hidden; }
    .account .banner { border-radius:0; }
    .account .body { padding:16px; display:flex; flex-direction:column; gap:16px; }
    .account.general { padding:16px; gap:14px; }
    .acc-head.plain .who .s { white-space:normal; }
    .group { display:flex; flex-direction:column; gap:6px; }
    .g-t { font-size:11.5px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary-text-color); padding-left:4px; }
    .g-hint { font-size:11.5px; color:var(--secondary-text-color); padding-left:4px; }
    .g-box { border-radius:12px; background:var(--secondary-background-color, rgba(127,127,127,.06));
             box-shadow:inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.18)); overflow:hidden; }
    .g-box .creds { background:none; padding:6px 14px; }
    .g-box .creds-form { border:0; }
    .row { display:flex; align-items:center; gap:16px; padding:11px 14px; border-top:1px solid var(--divider-color, rgba(127,127,127,.18)); cursor:pointer; }
    .g-box > .row:first-child { border-top:0; }
    .row .lbl { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
    .row .lbl .l { font-size:14px; } .row .lbl small { font-size:11.5px; color:var(--secondary-text-color); }
    .row .box { background:var(--card-background-color, #fff); flex:none; }
    .row .box.num { width:140px; } .row .box.num input { text-align:right; }
    .row .box.text { width:min(280px, 50%); }
    .row.radio { gap:12px; } .row.radio input { width:18px; height:18px; margin:0; accent-color:var(--primary-color); flex:none; }
    @media (max-width: 600px) {
      .row { flex-wrap:wrap; gap:8px; } .row .box.text { width:100%; }
    }
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._accounts = null;
    // Fields the user edited, per account: the rest of a form always shows the stored values
    this._drafts = {};
    this._status = {};
    this._busy = {};
    // Account whose removal is being confirmed
    this._confirm = null;
    // Passwords revealed on request ({password, updatedAt}), kept in memory only while shown
    this._secrets = {};
    this._tab = 'accounts';
    // The panel's own settings, shared by every user (iptv/panel_settings)
    this._panelSettings = { hide_toolbar: 'off' };
    this._generalStatus = null;
    this._generalBusy = false;
  }

  // /iptv-config/<tab> opens that tab (Home Assistant sets the route; the base address is Subscriptions)
  set route(route) {
    var path = (route?.path || '').split('/').filter(Boolean)[0];
    var tab = IPTV_PANEL_TABS.includes(path) ? path : 'accounts';
    if (tab !== this._tab) this._showTab(tab);
  }

  // Shows a tab; `focus` moves the keyboard to its button (arrow keys). The address follows, so a reload or a link
  // comes back to the same tab.
  _goTab(tab, focus) {
    if (!IPTV_PANEL_TABS.includes(tab)) return;
    this._showTab(tab, focus);
    var base = (this._panel?.url_path || 'iptv-config').replace(/^\//, '');
    try {
      history.replaceState(history.state, '', `/${base}${tab === 'accounts' ? '' : `/${tab}`}`);
    } catch (_err) {
      // no history (a test, a sandboxed page): the tab still shows
    }
  }

  _showTab(tab, focus) {
    this._tab = tab;
    var root = this.shadowRoot;
    root.querySelectorAll?.('.tab').forEach((button) => {
      var selected = button.dataset.tab === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    IPTV_PANEL_TABS.forEach((name) => {
      var panel = root.getElementById(`tab-${name}`);
      if (panel) panel.hidden = name !== tab;
    });
  }

  _tabHtml(tab) {
    var selected = tab === this._tab;
    return `<button class="tab${selected ? ' active' : ''}" role="tab" id="tabbtn-${tab}" data-tab="${tab}" aria-selected="${selected}" aria-controls="tab-${tab}" tabindex="${selected ? 0 : -1}">${iptvPanelEsc(this._t(tab))}</button>`;
  }

  set hass(hass) {
    var first = !this._hass;
    var langBefore = this._lang();
    var darkBefore = !!this._hass?.themes?.darkMode;
    this._hass = hass;
    (this._menus || []).forEach((menu) => {
      menu.hass = hass;
    });
    this._applyToolbar();
    if (first) this._start();
    else if (this._lang() !== langBefore || !!hass?.themes?.darkMode !== darkBefore) this._render();
    // Home Assistant makes a new state object only when an entity changes: the cards are drawn again only then
    else if (this._subsSignature() !== this._drawnSubs) this._renderSubs();
  }

  set narrow(narrow) {
    this._narrow = narrow;
    (this._menus || []).forEach((menu) => {
      menu.narrow = narrow;
    });
  }

  // The settings in the panel config (updated on save), so the top bar is right from the first render
  set panel(panel) {
    this._panel = panel;
    var mode = panel?.config?.hide_toolbar;
    if (IPTV_PANEL_HIDE_TOOLBAR.includes(mode)) this._panelSettings = { ...this._panelSettings, hide_toolbar: mode };
    this._applyToolbar();
  }

  // Whether the top bar is hidden for the current user
  _toolbarHidden() {
    var mode = this._panelSettings.hide_toolbar;
    // Non-administrators only: decided once the user is known (Home Assistant sets hass before the first render),
    // so an administrator never sees the bar hidden then shown again
    return mode === 'all' || (mode === 'non_admin' && !!this._hass?.user && !this._hass.user.is_admin);
  }

  // The top bar hidden: the tabs stick to the top, the sidebar menu (a phone) moves in front of them
  _applyToolbar() {
    this.toggleAttribute?.('hide-toolbar', this._toolbarHidden());
  }

  async _loadPanelSettings() {
    try {
      var res = await this._hass.callWS({ type: 'iptv/panel_settings' });
      var changed = IPTV_PANEL_HIDE_TOOLBAR.includes(res?.hide_toolbar) && res.hide_toolbar !== this._panelSettings.hide_toolbar;
      if (changed) this._panelSettings = { ...this._panelSettings, ...res };
    } catch (err) {
      // an older backend or the connection down: keep what the panel config said
      console.error('IPTV panel: could not read the panel settings', err);
    }
    this._applyToolbar();
    // Drawn again only when the setting changed meanwhile (the Panel entry shows it): no needless re-render
    if (changed) this._renderGeneral();
  }

  async _savePanelSettings(changes) {
    var before = this._panelSettings;
    this._panelSettings = { ...before, ...changes };
    this._applyToolbar();
    this._generalBusy = true;
    this._generalStatus = null;
    this._renderGeneral();
    try {
      var res = await this._hass.callWS({ type: 'iptv/update_panel_settings', ...changes });
      if (res?.settings) this._panelSettings = { ...this._panelSettings, ...res.settings };
      this._generalStatus = { tone: 'good', text: this._t('saved') };
    } catch (err) {
      console.error('IPTV panel: could not save the panel settings', err);
      this._panelSettings = before;
      this._generalStatus = { tone: 'bad', text: this._t('err_generic') };
    }
    this._generalBusy = false;
    this._applyToolbar();
    this._renderGeneral();
  }

  // The Panel entry of the Settings list: drawn with the accounts (its subtitle in the list follows the setting)
  _renderGeneral() {
    if (this.shadowRoot) this._renderAccounts();
  }

  // The Panel entry's page: who the top bar is hidden for, saved at once for every user
  _generalHtml() {
    var esc = iptvPanelEsc;
    var mode = this._panelSettings.hide_toolbar;
    var status = this._generalStatus;
    var rows = IPTV_PANEL_HIDE_TOOLBAR.map(
      (value) => `<label class="row radio">
          <input type="radio" name="hide_toolbar" value="${value}" data-general="hide_toolbar"${value === mode ? ' checked' : ''}${this._generalBusy ? ' disabled' : ''}>
          <span class="lbl"><span class="l">${esc(this._t(`hide_${value}`))}</span><small>${esc(this._t(`hide_${value}_hint`))}</small></span>
        </label>`,
    );
    return `<ha-card class="account general" data-id="${IPTV_PANEL_GENERAL}">
        <div class="acc-head plain">
          <div class="avatar"><ha-icon icon="mdi:page-layout-header"></ha-icon></div>
          <div class="who"><div class="n">${esc(this._t('panel_display'))}</div><div class="s plain">${esc(this._t('panel_display_hint'))}</div></div>
          ${status ? `<span class="msg ${status.tone}" role="status">${esc(status.text)}</span>` : ''}
        </div>
        <div class="group"><div class="g-t" id="g-hide">${esc(this._t('f_hide_toolbar'))}</div>
          <div class="g-box" role="radiogroup" aria-labelledby="g-hide">${rows.join('')}</div>
          <small class="g-hint">${esc(this._t('f_hide_toolbar_hint'))}</small></div>
      </ha-card>`;
  }

  _bindGeneral(el) {
    el?.querySelectorAll?.('[data-general="hide_toolbar"]').forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked && IPTV_PANEL_HIDE_TOOLBAR.includes(input.value)) this._savePanelSettings({ hide_toolbar: input.value });
      });
    });
  }

  // Home Assistant creates the panel as soon as its file has run and sets panel, narrow, route and hass right away.
  // In the release, the element is only defined once the page's language file is in (scripts/i18n-split.mjs): the
  // values set before land as plain properties on the not-yet-defined element and hide the setters, so the panel
  // stayed empty on its first opening. They are passed through the setters now (hass last: it starts the panel).
  _upgradeProperties() {
    ['panel', 'narrow', 'route', 'hass'].forEach((name) => {
      if (!Object.hasOwn(this, name)) return;
      var value = this[name];
      delete this[name];
      this[name] = value;
    });
  }

  connectedCallback() {
    this._upgradeProperties();
    if (!this._fold && this.shadowRoot?.querySelector?.(".topbar")) this._attachFold();
    if (this._hass && !this._unsub) this._subscribe();
    this._watchConnection(true);
    // Back on the panel after a failed load: try again now.
    if (this._hass && this._failed) this._reload();
  }

  disconnectedCallback() {
    this._watchConnection(false);
    this._fold?.detach();
    this._fold = null;
    clearTimeout(this._retryTimer);
    this._secrets = {};
    if (this._unsub) {
      this._unsub.then((off) => off()).catch(() => {});
      this._unsub = null;
    }
  }


  // The connection back (Home Assistant restarted, the app resumed): load again, the data may have changed meanwhile.
  _watchConnection(on) {
    var connection = this._hass?.connection;
    if (!connection?.addEventListener) return;
    this._onReady = this._onReady || (() => this._reload());
    connection.removeEventListener('ready', this._onReady);
    if (on) connection.addEventListener('ready', this._onReady);
  }

  // A load that failed (Home Assistant still starting, the connection dropped) is tried again after 2 s, 5 s, 15 s,
  // then every 30 s while the panel is shown, instead of leaving it empty.
  _retry(failed) {
    clearTimeout(this._retryTimer);
    this._failed = failed;
    if (!failed) {
      this._retries = 0;
      return;
    }
    var delay = [2000, 5000, 15000, 30000][Math.min(this._retries || 0, 3)];
    this._retries = (this._retries || 0) + 1;
    this._retryTimer = setTimeout(() => {
      if (this.isConnected) this._reload();
    }, delay);
  }

  _reload() {
    this._load();
  }
  // Full code when it has a table (sr-Latn), else its base (de-AT → de), else English
  _lang() {
    var code = this._hass?.language || 'en';
    if (IptvPanelI18n[code]) return code;
    var base = code.split('-')[0];
    return IptvPanelI18n[base] ? base : 'en';
  }

  _t(key, vars) {
    return iptvPanelT(this._lang(), key, vars);
  }

  // The subscriptions are drawn at once from their entities; the accounts of the Settings tab load alongside.
  _start() {
    this._render();
    this._subscribe();
    this._watchConnection(this.isConnected);
    this._load();
  }

  // Reload the list when an IPTV account is added, removed, renamed or changes state
  _subscribe() {
    if (this._unsub || !this._hass?.connection) return;
    this._unsub = this._hass.connection
      .subscribeMessage(
        (events) => {
          if ([].concat(events || []).some((ev) => ev?.entry?.domain === 'iptv')) this._load();
        },
        { type: 'config_entries/subscribe', type_filter: ['service'] },
      )
      .catch(() => () => {});
  }

  async _load() {
    this._loadPanelSettings();
    try {
      var res = await this._hass.callWS({ type: 'iptv/accounts' });
      this._accounts = res.accounts || [];
      this._loadError = null;
      this._retry(false);
    } catch (err) {
      console.error('IPTV panel: could not list the accounts', err);
      this._retry(true);
      // Never listed: the error with a Retry button, not "No account". Listed before: kept.
      if (this._accounts === null) {
        this._loadError = String(err?.message || err).replace(/\.\s*$/, '');
        this._renderAccounts();
        return;
      }
    }
    var byId = new Map(this._accounts.map((a) => [a.entry_id, a]));
    [this._drafts, this._secrets].forEach((store) => {
      Object.keys(store).forEach((id) => {
        if (!byId.has(id)) delete store[id];
      });
    });
    // Credentials changed since the password was shown (card edit, add_account, Reconfigure): forget it
    Object.entries(this._secrets).forEach(([id, secret]) => {
      if (secret.updatedAt !== byId.get(id).updated_at) delete this._secrets[id];
    });
    this._renderAccounts();
  }

  /** The top bar folds on scroll into one bar with the tabs as icon pills (see iptvPanelFold). */
  _attachFold() {
    this._fold?.detach();
    this._fold = iptvPanelFold(this, {
      top: ".topbar",
      tabs: ".tabs",
      tab: ".tab",
      key: (b) => b.dataset.tab,
      icons: { accounts: "mdi:playlist-play", settings: "mdi:cog" },
      badge: ".cnt",
      name: ".topbar .name",
      sub: ".topbar .sub-l",
      icon: ".topbar .badge",
      status: ".topbar .chip.st",
      acts: ".topbar .acts > *",
      accent: "#5c6bc0",
      css: ":host([pf-folded]) .md-list { top:calc(var(--pf-h) + 8px); }",
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: true }),
    });
  }

  _render() {
    var root = this.shadowRoot;
    root.innerHTML = `
      <style>${IptvPanel.STYLE}</style>
      <div class="topbar"><div class="banner page${this._hass?.themes?.darkMode ? ' night' : ''}" id="hero"></div></div>
      <div class="tabs"><span class="tabmenu"><ha-menu-button></ha-menu-button></span><div class="tablist" role="tablist">${IPTV_PANEL_TABS.map((tab) => this._tabHtml(tab)).join('')}</div></div>
      <main>
        <section class="column" id="tab-accounts" role="tabpanel" aria-labelledby="tabbtn-accounts">${this._subsShell()}</section>
        <section class="column" id="tab-settings" role="tabpanel" aria-labelledby="tabbtn-settings"><div id="accounts" class="column"></div></section>
      </main>`;
    this._drawnSubs = null;
    this._renderSubs(true);
    // Two menu buttons: the top bar's, and the one in front of the tabs when the top bar is hidden
    this._menus = [...root.querySelectorAll('ha-menu-button')];
    this._menus.forEach((menu) => {
      menu.hass = this._hass;
      menu.narrow = this._narrow;
    });
    root.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => this._goTab(button.dataset.tab));
      // Left and right arrows move between the tabs, as in a native tab bar
      button.addEventListener('keydown', (ev) => {
        var step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        ev.preventDefault();
        var i = IPTV_PANEL_TABS.indexOf(this._tab);
        this._goTab(IPTV_PANEL_TABS[(i + step + IPTV_PANEL_TABS.length) % IPTV_PANEL_TABS.length], true);
      });
    });
    this._showTab(this._tab);
    this._bindSubs();
    this._renderAdd();
    this._renderSubs();
    this._renderAccounts();
    this._attachFold();
  }

  _subsShell() {
    return `<div id="overview"></div><div id="add"></div><div class="subs" id="subs"></div>`;
  }

  _bindSubs() {
    var tab = this.shadowRoot.getElementById?.('tab-accounts');
    var onClick = (ev) => {
      var el = ev.target.closest?.('button');
      if (!el) return;
      var device = el.closest('[data-device]')?.dataset.device;
      if (el.dataset.filter !== undefined) {
        // A state chip or tile: only that state (again: all of them)
        this._filter = this._filter === el.dataset.filter ? '' : el.dataset.filter;
        this._renderSubs(true);
      } else if (el.dataset.add !== undefined) {
        // Add from the top bar opens the form on the Subscriptions tab
        if (this._tab !== 'accounts') this._goTab('accounts');
        this._openAdd(true);
      }
      else if (el.dataset.refresh !== undefined) this._refreshSubs(el);
      else if (el.dataset.check !== undefined) this._refreshSubs(el, device);
      else if (el.dataset.addCancel !== undefined) this._openAdd(false);
      else if (el.dataset.addSubmit !== undefined) this._submitAdd(el);
      else if (el.dataset.settings !== undefined) this._openSettings(device);
      else if (el.dataset.delCancel !== undefined) this._closeSubForm(device);
      else if (el.dataset.del !== undefined) this._openDelete(device);
      else if (el.dataset.delSubmit !== undefined) this._submitDelete(device, el);
      else if (el.dataset.entity) this._moreInfo(el.dataset.entity);
    };
    tab?.addEventListener('click', onClick);
    // The top bar's Add and Refresh
    this.shadowRoot.getElementById?.('hero')?.addEventListener('click', onClick);
    tab?.addEventListener('change', (ev) => {
      if (ev.target.matches?.('select[data-provider]')) {
        this._adding = { provider: ev.target.value };
        this._renderAdd();
      }
    });
    tab?.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' || !ev.target.matches?.('.form input')) return;
      ev.preventDefault();
      ev.target.closest('.form').querySelector('[data-add-submit]')?.click();
    });
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
  }

  // The subscriptions are read from the registries once, not at every state change of Home Assistant
  _subscriptions() {
    var hass = this._hass;
    if (!this._subsCache || this._subsCache.entities !== hass?.entities || this._subsCache.devices !== hass?.devices) {
      this._subsCache = { entities: hass?.entities, devices: hass?.devices, list: iptvPanelSubscriptions(hass) };
    }
    return this._subsCache.list;
  }

  _subsSignature() {
    var states = this._hass?.states || {};
    var subs = this._subscriptions();
    // The day turns the days left: part of what is drawn
    return [Math.floor(Date.now() / 3600000), ...subs.map((sub) => [sub.name, ...Object.values(sub.ids).map((id) => states[id]?.last_updated)].join(','))].join('|');
  }

  // Refresh every subscription, or one (`device`): its status and a health check right away
  async _refreshSubs(button, device) {
    var subs = this._subscriptions().filter((sub) => !device || sub.device === device);
    var ids = subs.flatMap((sub) => [sub.ids.status, sub.ids.health]).filter(Boolean);
    if (!ids.length) return;
    button.disabled = true;
    button.classList.add('spin');
    try {
      await this._hass.callService('homeassistant', 'update_entity', { entity_id: ids });
    } catch (err) {
      console.error('IPTV panel: refresh failed', err);
    }
    button.disabled = false;
    button.classList.remove('spin');
  }

  _field(key, type, value = '', hint = '') {
    var esc = iptvPanelEsc;
    return `<label class="ctl"><span>${esc(this._t(`p_edit_${key}`))}</span>
      <div class="box"><input data-k="${key}" type="${type}" value="${esc(value)}" autocomplete="off" autocapitalize="off" spellcheck="false"${
        hint ? ` placeholder="${esc(hint)}"` : ''
      }></div></label>`;
  }

  _credentialFields(provider, values = {}, keepPassword = false) {
    return provider === 'stalker'
      ? this._field('url', 'url', values.url) + this._field('mac', 'text', values.mac)
      : this._field('url', 'url', values.url) +
          this._field('username', 'text', values.username) +
          this._field('password', 'password', '', keepPassword ? this._t('p_edit_password_keep') : '');
  }

  // The values typed in a form, trimmed but the password; a blank password is left out (kept when editing)
  _formValues(form) {
    var values = {};
    form.querySelectorAll('input[data-k]').forEach((input) => {
      var v = input.dataset.k === 'password' ? input.value : input.value.trim();
      if (v || input.dataset.k !== 'password') values[input.dataset.k] = v;
    });
    return values;
  }

  // ── Add ──
  _openAdd(open) {
    this._adding = open ? { provider: 'xtream' } : null;
    this._renderAdd();
    if (open) this.shadowRoot.querySelector('#add select')?.focus();
  }

  _renderAdd() {
    var box = this.shadowRoot?.getElementById?.('add');
    if (!box) return;
    if (!this._adding) {
      box.innerHTML = '';
      return;
    }
    var esc = iptvPanelEsc;
    var provider = this._adding.provider;
    var option = (value, key) => `<option value="${value}"${value === provider ? ' selected' : ''}>${esc(this._t(key))}</option>`;
    box.innerHTML = `<ha-card class="addcard"><div class="form">
      <div class="t">${esc(this._t('p_add_title'))}</div>
      <label class="ctl"><span>${esc(this._t('p_add_provider'))}</span>
        <div class="box"><select data-provider>${option('xtream', 'p_add_xtream')}${option('stalker', 'p_add_stalker')}</select></div></label>
      ${this._credentialFields(provider)}
      <div class="err" role="alert">${esc(this._adding.error || '')}</div>
      <div class="b"><button class="act quiet" data-add-cancel>${esc(this._t('p_edit_cancel'))}</button>
        <button class="act" data-add-submit>${esc(this._t('p_add_create'))}</button></div>
    </div></ha-card>`;
  }

  async _submitAdd(button) {
    var form = button.closest('.form');
    var payload = { provider: this._adding.provider, ...this._formValues(form) };
    if (payload.provider !== 'stalker') payload.password ||= '';
    button.disabled = true;
    button.textContent = this._t('p_edit_saving');
    var out = await this._command('add_account', payload);
    if (out.ok) {
      this._adding = null;
      this._renderAdd();
      return;
    }
    // The typed values stay: only the error is written
    button.disabled = false;
    button.textContent = this._t('p_add_create');
    form.querySelector('.err').textContent = iptvPanelError(this._lang(), out.error);
  }

  // An admin WebSocket command (iptv/<command>): unlike an action, it fires no call_service event, so the
  // password never reaches the recorder. { ok: false, error } on failure.
  async _command(command, data) {
    try {
      return (await this._hass.callWS({ type: `iptv/${command}`, ...data })) || {};
    } catch (err) {
      return { ok: false, error: err?.code || 'generic' };
    }
  }

  // ── Edit and remove, in the subscription's card ──
  // The Settings tab on this subscription's account: its credentials and options
  _openSettings(device) {
    var acc = (this._accounts || []).find((a) => a.device_id === device);
    if (acc) this._selected = acc.entry_id;
    this._mdOpen = true;
    this._renderAccounts();
    this._goTab('settings');
  }

  _openDelete(device) {
    this._subForms = { [device]: { kind: 'delete' } };
    this._renderSubs(true);
    // Cancel, not Delete: Enter right after opening does not remove the account
    this.shadowRoot.querySelector(`[data-device="${CSS.escape(device)}"] [data-del-cancel]`)?.focus();
  }

  async _submitDelete(device, button) {
    button.disabled = true;
    button.textContent = this._t('p_edit_saving');
    var error = '';
    try {
      var res = await this._hass.callService('iptv', 'remove_account', { device_id: device }, undefined, false, true);
      if (res?.response?.ok === false) error = res.response.error;
    } catch (err) {
      error = err?.code || 'generic';
    }
    if (!error) {
      this._closeSubForm(device);
      return;
    }
    button.disabled = false;
    button.textContent = this._t('p_del_delete');
    button.closest('.form').querySelector('.err').textContent = iptvPanelError(this._lang(), error);
  }

  _closeSubForm(device) {
    if (this._subForms) delete this._subForms[device];
    this._renderSubs(true);
  }

  _subForm(device) {
    if (this._subForms?.[device]?.kind !== 'delete') return '';
    var esc = iptvPanelEsc;
    return `<div class="form confirm"><div class="t">${esc(this._t('p_del_title'))}</div><div class="msg">${esc(this._t('p_del_confirm'))}</div>
      <div class="err" role="alert"></div>
      <div class="b"><button class="act quiet" data-del-cancel>${esc(this._t('p_edit_cancel'))}</button>
        <button class="act bad" data-del-submit>${esc(this._t('p_del_delete'))}</button></div></div>`;
  }

  // ── The cards ──
  _date(ms) {
    try {
      return new Date(ms).toLocaleDateString(this._hass?.language || 'en', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (_err) {
      return new Date(ms).toISOString().slice(0, 10);
    }
  }

  _figure(value) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    try {
      return new Intl.NumberFormat(this._hass?.language || 'en', { notation: value >= 10000 ? 'compact' : 'standard' }).format(value);
    } catch (_err) {
      return String(value);
    }
  }

  // "2 minutes ago", in the language of Home Assistant
  _ago(at) {
    var ms = Date.parse(at);
    if (Number.isNaN(ms)) return '';
    var s = Math.round((ms - Date.now()) / 1000);
    var [value, unit] = Math.abs(s) < 60 ? [s, 'second'] : Math.abs(s) < 3600 ? [Math.round(s / 60), 'minute'] : Math.abs(s) < 86400 ? [Math.round(s / 3600), 'hour'] : [Math.round(s / 86400), 'day'];
    try {
      return new Intl.RelativeTimeFormat(this._hass?.language || 'en', { numeric: 'auto' }).format(value, unit);
    } catch (_err) {
      return '';
    }
  }

  // A subscription tile: its state (a glyph on the round icon, a coloured line), what is wrong, the expiration, the
  // catalogue and the connections, then the health check and the French lists
  _subCard(sub) {
    var esc = iptvPanelEsc;
    var summary = iptvPanelSummary(this._hass, sub.ids);
    var sev = iptvPanelSeverity(summary);
    var tone = sev.tone;
    var form = this._subForm(sub.device);
    var acts = `<div class="t-acts">
        <button class="ico-btn" data-settings title="${esc(this._t('settings'))}" aria-label="${esc(this._t('settings'))}"><ha-icon icon="mdi:cog"></ha-icon></button>
        <button class="ico-btn bad" data-del title="${esc(this._t('p_del_btn'))}" aria-label="${esc(this._t('p_del_btn'))}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
      </div>`;
    var stateText = !summary || summary.unavailable ? this._t('p_unavailable') : this._t(summary.status);
    if (summary && !summary.unavailable && tone === 'warn' && summary.daysLeft > 0) {
      stateText += ` · ${this._t(summary.daysLeft === 1 ? 'p_day_left' : 'p_days_left', { n: summary.daysLeft })}`;
    }
    var state = sub.ids.status
      ? `<button class="state ${tone}" data-entity="${esc(sub.ids.status)}">${esc(stateText)}</button>`
      : `<span class="state ${tone}">${esc(stateText)}</span>`;
    var head = `<div class="t-head">
        <span class="avatar ${tone}"><ha-icon icon="mdi:television-play"></ha-icon>${iptvPanelGlyph(tone)}</span>
        <div class="who"><div class="n">${esc(sub.name)}</div>${state}</div>
        ${acts}
      </div>`;
    var alert = '';
    if (sev.alert) {
      var check = tone === 'bad' ? `<button class="act ${tone}" data-check><ha-icon icon="mdi:refresh"></ha-icon>${esc(this._t('check'))}</button>` : '';
      var text = this._t(sev.alert, { settings: this._t('settings'), date: summary?.expires ? this._date(summary.expires) : '' });
      alert = `<div class="alert ${tone}" role="status"><ha-icon icon="${tone === 'bad' ? 'mdi:lan-disconnect' : 'mdi:clock-outline'}"></ha-icon><span>${esc(text)}</span>${check}</div>`;
    }
    if (!summary || summary.unavailable) {
      return `<ha-card class="sub ${tone}" data-device="${esc(sub.device)}">${head}${form}${alert}</ha-card>`;
    }
    var mtone = tone === 'bad' ? 'idle' : tone;
    var left =
      summary.expires === null
        ? this._t('p_unlimited')
        : summary.daysLeft > 0
          ? this._t(summary.daysLeft === 1 ? 'p_day_left' : 'p_days_left', { n: summary.daysLeft })
          : this._t('p_status_expired');
    var expiry = `<div class="expiry ${mtone}">
        <div class="line"><span>${esc(this._t('p_expiration'))} · ${esc(summary.expires === null ? this._t('p_never') : this._date(summary.expires))}</span><b>${esc(left)}</b></div>
        ${summary.left === null ? '' : `<div class="meter"><i style="--p:${Math.round(summary.left * 100)}%"></i></div>`}
      </div>`;
    var dim = tone === 'bad' ? ' dim' : '';
    var stat = (value, key, icon) =>
      `<div class="stat${dim}" title="${esc(this._t(key))}"><span class="k"><ha-icon icon="${icon}"></ha-icon>${esc(this._t(key))}</span><b>${esc(value)}</b></div>`;
    var [active, max] = summary.connections;
    // The connection slots as dots (filled = in use), up to 6; beyond, the figures alone
    var slots = active !== null && max && max <= 6
      ? `<span class="slots ${active ? mtone : 'idle'}">${Array.from({ length: max }, (_, i) => `<i class="${i < active ? 'on' : ''}"></i>`).join('')}</span>`
      : '';
    var stats = `<div class="stats">
        ${stat(this._figure(summary.counts.channels), 'p_channels', 'mdi:television-classic')}
        ${stat(this._figure(summary.counts.movies), 'p_movies', 'mdi:movie-open')}
        ${stat(this._figure(summary.counts.series), 'p_series', 'mdi:filmstrip-box-multiple')}
        <div class="stat" title="${esc(this._t('p_connections'))}"><span class="k"><ha-icon icon="mdi:account-multiple"></ha-icon>${esc(this._t('p_connections'))}</span>
          <b>${esc(active === null ? '—' : `${active}/${max ?? '∞'}`)}${slots}</b></div>
      </div>`;
    var facts = [];
    var h = summary.health;
    if (h) {
      var htone = h.state === 'ok' ? 'good' : h.state === 'degraded' ? 'warn' : 'bad';
      facts.push(`<span class="fact ${htone}"><i class="dot"></i>${esc(this._t(`p_health_${h.state}`))}${h.ms === null ? '' : ` · ${Math.round(h.ms)} ms`}</span>`);
    }
    if (summary.french !== null) {
      facts.push(`<span class="fact ${summary.french ? 'good' : 'bad'}" title="${esc(this._t('p_french_title'))}">${esc(this._t(summary.french ? 'p_french_on' : 'p_french_off'))}</span>`);
    }
    if (summary.trial) facts.push(`<span class="fact warn">${esc(this._t('p_trial'))}</span>`);
    var when = h?.at ? this._ago(h.at) : '';
    var foot = `<div class="t-foot">${facts.join('')}<span class="grow"></span>${when ? `<span class="when">${esc(this._t('p_checked', { when }))}</span>` : ''}</div>`;
    return `<ha-card class="sub ${tone}" data-device="${esc(sub.device)}">${head}${form}${alert}${expiry}${stats}${foot}</ha-card>`;
  }

  // The top bar: the living-room TV shows the worst state, the title its status, the line under it how many
  // subscriptions and the next expiration; Add, Refresh and the integration in its corner (as on the ENT ONE panel)
  _heroHtml(subs, counts) {
    var esc = iptvPanelEsc;
    var next = null;
    var now = Date.now();
    subs.forEach(({ sub, summary }) => {
      if (summary?.expires && summary.expires > now && (!next || summary.expires < next.expires)) next = { name: sub.name, expires: summary.expires };
    });
    var worst = !subs.length ? 'idle' : counts.bad ? 'bad' : counts.warn ? 'warn' : 'good';
    var n = subs.length;
    var main = counts.bad
      ? `<span class="chip st bad">${esc(this._t('p_hero_fix', { n: counts.bad }))}</span>`
      : n
        ? `<span class="chip st ${worst}">${esc(this._t('p_hero_ok'))}</span>`
        : '';
    var line = [this._t(n === 0 ? 'p_hero_none' : n === 1 ? 'p_hero_one' : 'p_hero_many', { n })];
    if (next) line.push(this._t('p_next', { name: next.name, date: this._date(next.expires) }));
    var refresh = esc(this._t('p_refresh'));
    var add = esc(this._t('p_add_btn'));
    var cog = esc(this._t('open_integration'));
    return `<div class="htext">
          <span class="hmenu"></span>
          <span class="badge ${worst}"><ha-icon icon="mdi:television-play"></ha-icon></span>
          <div class="titles">
            <div class="head"><span class="name">${esc(this._t('title'))}</span>${main}</div>
            <div class="sub-l">${esc(line.join(' · '))}</div>
          </div>
        </div>
        ${iptvPanelSceneSvg(iptvPanelScene(worst), 'hero')}
        <div class="acts">
          <button data-add title="${add}" aria-label="${add}"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button data-refresh title="${refresh}" aria-label="${refresh}"><ha-icon icon="mdi:refresh"></ha-icon></button>
          <a href="/config/integrations/integration/iptv" title="${cog}" aria-label="${cog}"><ha-icon icon="mdi:cog"></ha-icon></a>
        </div>
        <div class="ground"></div>`;
  }

  // Over the subscriptions: a filter by state (All, To fix, Expiring soon, Active) and four tiles of the chart —
  // what to fix, the next expiration, how many answer, the connections in use
  _overviewHtml(subs, counts) {
    var esc = iptvPanelEsc;
    if (!subs.length) return '';
    var now = Date.now();
    var chip = (tone, label) => {
      var on = (this._filter || '') === tone;
      return `<button class="fchip${on ? ' on' : ''}" data-filter="${tone}" aria-pressed="${on}">${tone ? `<i class="dot ${tone}"></i>` : ''}${esc(label)}</button>`;
    };
    var chips = `<div class="filters">${chip('', this._t('p_filter_all', { n: subs.length }))}${[
      ['bad', 'p_hero_fix'],
      ['warn', 'p_count_expiring'],
      ['good', 'p_count_active'],
    ]
      .filter(([tone]) => counts[tone])
      .map(([tone, key]) => chip(tone, this._t(key, { n: counts[tone] })))
      .join('')}</div>`;
    var firstBad = subs.find((x) => x.sev.tone === 'bad');
    var soon = subs
      .filter((x) => x.summary?.expires && x.summary.expires > now)
      .sort((a, b) => a.summary.expires - b.summary.expires)[0];
    var health = subs.map((x) => x.summary?.health).filter(Boolean);
    var up = health.filter((h) => h.state === 'ok' || h.state === 'degraded');
    var ms = up.map((h) => h.ms).filter((v) => v !== null);
    var conns = subs.map((x) => x.summary?.connections || [null, null]).filter(([a]) => a !== null);
    var active = conns.reduce((t, [a]) => t + a, 0);
    var max = conns.every(([, m]) => m) ? conns.reduce((t, [, m]) => t + m, 0) : null;
    var tile = (tone, icon, name, state, count, filter) =>
      `<button class="otile ${count ? tone : 'rest'}"${filter ? ` data-filter="${filter}"` : ' disabled'}><span class="pastille"><ha-icon icon="${icon}"></ha-icon>${count ? `<span class="pbadge">${count}</span>` : ''}</span>` +
      `<span class="tl"><span class="tn">${esc(name)}</span><span class="ts">${esc(state)}</span></span></button>`;
    var tiles = [
      tile('bad', 'mdi:alert-outline', this._t('p_tile_fix'), firstBad ? firstBad.sub.name : this._t('p_hero_ok'), counts.bad, 'bad'),
      tile(
        soon && soon.summary.daysLeft <= IPTV_PANEL_WARNING_DAYS ? 'warn' : 'good',
        'mdi:clock-outline',
        this._t('p_tile_expiry'),
        soon ? `${soon.sub.name} · ${this._t(soon.summary.daysLeft === 1 ? 'p_day_left' : 'p_days_left', { n: soon.summary.daysLeft })}` : this._t('p_unlimited'),
        soon ? 1 : 0,
        soon && soon.summary.daysLeft <= IPTV_PANEL_WARNING_DAYS ? 'warn' : '',
      ).replace('<span class="pbadge">1</span>', ''),
      tile('good', 'mdi:lan-connect', this._t('p_tile_online'), health.length ? `${this._t('p_tile_online_v', { n: up.length, t: health.length })}${ms.length ? ` · ${Math.round(ms.reduce((t, v) => t + v, 0) / ms.length)} ms` : ''}` : '—', health.length ? 1 : 0, '').replace('<span class="pbadge">1</span>', ''),
      tile('blue', 'mdi:account-multiple', this._t('p_tile_conn'), conns.length ? this._t('p_tile_conn_v', { a: active, m: max ?? '∞' }) : '—', active, ''),
    ];
    return `${chips}<div class="otiles">${tiles.join('')}</div>`;
  }

  // `force`: a form opened or closed; otherwise only a change of the entities redraws (typed values stay).
  // The tiles come by severity: failing first, then expiring, then the fine ones.
  _renderSubs(force) {
    var box = this.shadowRoot?.getElementById?.('subs');
    if (!box) return;
    var signature = `${this._subsSignature()}|${!!this._hass?.themes?.darkMode}`;
    if (!force && signature === this._drawnSubs) return;
    // An open form keeps what is typed in it: the cards wait until it is closed
    if (!force && Object.keys(this._subForms || {}).length) return;
    this._drawnSubs = signature;
    var rank = { bad: 0, warn: 1, good: 2 };
    var subs = this._subscriptions()
      .map((sub) => {
        var summary = iptvPanelSummary(this._hass, sub.ids);
        return { sub, summary, sev: iptvPanelSeverity(summary) };
      })
      .sort((a, b) => rank[a.sev.tone] - rank[b.sev.tone]);
    var counts = { good: 0, warn: 0, bad: 0 };
    subs.forEach(({ sev }) => {
      counts[sev.tone] += 1;
    });
    if (this._filter && !counts[this._filter]) this._filter = '';
    var hero = this.shadowRoot.getElementById?.('hero');
    if (hero) {
      // The menu button stays (its hass and narrow are set once): only the rest of the top bar is drawn again
      var menu = hero.querySelector('ha-menu-button') || this._menus?.[0];
      hero.innerHTML = this._heroHtml(subs, counts);
      var slot = hero.querySelector('.hmenu');
      if (slot) slot.appendChild(menu || document.createElement('ha-menu-button'));
    }
    var overview = this.shadowRoot.getElementById?.('overview');
    if (overview) overview.innerHTML = this._overviewHtml(subs, counts);
    var tab = this.shadowRoot.getElementById?.('tabbtn-accounts');
    if (tab) tab.innerHTML = `${iptvPanelEsc(this._t('accounts'))}${counts.bad ? `<span class="cnt">${counts.bad}</span>` : ''}`;
    var shown = subs.filter(({ sev }) => !this._filter || sev.tone === this._filter);
    box.innerHTML = subs.length
      ? shown.map(({ sub }) => this._subCard(sub)).join('')
      : `<ha-card class="note">${iptvPanelEsc(this._t('none', { add: this._t('p_add_btn') }))}</ha-card>`;
  }

  // An account's form: the fields the user typed over the stored values (so a change made elsewhere shows up)
  _draft(acc) {
    return {
      title: acc.title === acc.auto_title ? '' : acc.title,
      ...acc.options,
      ...this._drafts[acc.entry_id],
    };
  }

  _edit(acc, key, value) {
    this._drafts[acc.entry_id] = { ...this._drafts[acc.entry_id], [key]: value };
  }

  _changed(acc) {
    var d = this._draft(acc);
    var title = d.title.trim() || acc.auto_title;
    return title !== acc.title || Object.keys(acc.options).some((k) => String(d[k]) !== String(acc.options[k]));
  }

  _valid(acc) {
    var d = this._draft(acc);
    return Object.entries(IPTV_PANEL_LIMITS).every(([k, [lo, hi]]) => {
      var n = Number(d[k]);
      return Number.isInteger(n) && n >= lo && n <= hi;
    });
  }

  // A settings row: its label and hint on the left, the field on the right
  _number(acc, key, label, hint, unit) {
    var [lo, hi] = IPTV_PANEL_LIMITS[key];
    var value = this._draft(acc)[key];
    var n = Number(value);
    var ok = Number.isInteger(n) && n >= lo && n <= hi;
    var esc = iptvPanelEsc;
    return `
      <label class="row">
        <span class="lbl"><span class="l">${esc(this._t(label))}</span><small>${esc(this._t(hint, { min: lo, max: hi }))}</small></span>
        <div class="box num${ok ? '' : ' bad-value'}">
          <input type="number" inputmode="numeric" min="${lo}" max="${hi}" step="1" data-key="${key}" value="${esc(value)}">
          <em>${esc(this._t(unit))}</em>
        </div>
      </label>`;
  }

  // Login and password of an account; the password is only fetched (iptv/get_credentials) when shown or copied
  _credsHtml(acc) {
    var esc = iptvPanelEsc;
    var stalker = acc.provider === 'stalker';
    var copy = (field) =>
      `<button class="ico" data-copy="${field}" title="${esc(this._t('cred_copy'))}"${field === 'password' && !acc.device_id ? ' disabled' : ''}><ha-icon icon="mdi:content-copy"></ha-icon></button>`;
    var login = `
      <div class="cred">
        <span>${esc(this._t(stalker ? 'cred_mac' : 'cred_username'))}</span>
        <code>${esc(acc.login)}</code>
        ${copy('login')}
      </div>`;
    var edit = acc.device_id
      ? `<div class="cred edit"><button class="act quiet" data-cred-edit><ha-icon icon="mdi:pencil"></ha-icon>${esc(this._t('p_edit_btn'))}</button></div>`
      : '';
    if (stalker) return `<div class="creds">${login}${edit}</div>`;
    var secret = this._secrets[acc.entry_id]?.password;
    var shown = secret != null;
    return `
      <div class="creds">
        ${login}
        <div class="cred">
          <span>${esc(this._t('cred_password'))}</span>
          <code class="${shown ? '' : 'masked'}">${shown ? esc(secret) : '••••••••'}</code>
          <button class="ico" data-reveal title="${esc(this._t(shown ? 'cred_hide' : 'cred_show'))}"${acc.device_id ? '' : ' disabled'}><ha-icon icon="${shown ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}"></ha-icon></button>
          ${copy('password')}
        </div>
        ${edit}
      </div>`;
  }

  async _password(acc) {
    var res = await this._hass.callWS({ type: 'iptv/get_credentials', device_id: acc.device_id });
    if (!res?.ok) throw new Error(this._t(`err_${res?.error || 'generic'}`));
    return res.password || '';
  }

  async _toggleSecret(acc) {
    if (this._secrets[acc.entry_id] != null) {
      delete this._secrets[acc.entry_id];
    } else {
      try {
        this._secrets[acc.entry_id] = { password: await this._password(acc), updatedAt: acc.updated_at };
      } catch (err) {
        this._status[acc.entry_id] = { tone: 'bad', text: err.message };
      }
    }
    this._renderAccounts();
  }

  async _copy(acc, field, button) {
    try {
      var text = field === 'login' ? acc.login : (this._secrets[acc.entry_id]?.password ?? (await this._password(acc)));
      await navigator.clipboard.writeText(text);
      button.classList.add('done');
      button.title = this._t('cred_copied');
      setTimeout(() => {
        button.classList.remove('done');
        button.title = this._t('cred_copy');
      }, 1500);
    } catch (err) {
      this._status[acc.entry_id] = { tone: 'bad', text: err?.message || this._t('err_generic') };
      this._renderAccounts();
    }
  }

  // An account's page: a banner with its state (the TV of the card), then its credentials, its options and its health
  // check, each in a group of rows; Save at the bottom, Check now in the banner
  _accountHtml(acc) {
    var d = this._draft(acc);
    var esc = iptvPanelEsc;
    var state = this._t(`st_${acc.state}`) === `st_${acc.state}` ? this._t('st_other') : this._t(`st_${acc.state}`);
    var status = this._status[acc.entry_id];
    var busy = this._busy[acc.entry_id];
    var canSave = !busy && this._changed(acc) && this._valid(acc);
    var icon = acc.provider === 'stalker' ? 'mdi:router-network' : 'mdi:account-key';
    var tone = iptvPanelTone(acc.state);
    var scene = acc.state === 'loaded' ? 'playing' : tone === 'warn' ? 'idle' : 'offline';
    var night = this._hass?.themes?.darkMode ? ' night' : '';
    var checkLabel = esc(this._t(busy === 'check' ? 'checking' : 'check'));
    // Only an account without a device: the others are removed with the card, which lists them
    var remove = acc.device_id
      ? ''
      : `<button class="act bad" data-do="remove"${busy ? ' disabled' : ''}><ha-icon icon="mdi:trash-can-outline"></ha-icon>${esc(this._t(busy === 'remove' ? 'removing' : 'remove'))}</button>`;
    return `
      <ha-card class="account" data-id="${esc(acc.entry_id)}">
        <div class="banner${night}">
          <div class="htext">
            <span class="badge ${tone}"><ha-icon icon="${icon}"></ha-icon></span>
            <div class="titles">
              <div class="head"><span class="name">${esc(acc.title)}</span><span class="chip st ${tone}">${esc(state)}</span></div>
              <div class="sub-l mono">${esc(acc.provider === 'stalker' ? 'Stalker' : 'Xtream')} · ${esc(acc.url)}</div>
            </div>
          </div>
          ${iptvPanelSceneSvg(scene, `acc-${esc(acc.entry_id)}`)}
          <div class="acts"><button data-do="check" class="${busy === 'check' ? 'spin' : ''}" title="${checkLabel}" aria-label="${checkLabel}"${busy ? ' disabled' : ''}><ha-icon icon="mdi:stethoscope"></ha-icon></button></div>
          <div class="ground"></div>
        </div>
        <div class="body">
          ${this._confirm === acc.entry_id && !acc.device_id ? this._confirmHtml(acc) : ''}
          <div class="group"><div class="g-t">${esc(this._t('g_credentials'))}</div>
            <div class="g-box">${this._credEdit?.entry_id === acc.entry_id ? this._credEditHtml() : this._credsHtml(acc)}</div></div>
          <div class="group"><div class="g-t">${esc(this._t('g_account'))}</div>
            <div class="g-box">
              <label class="row">
                <span class="lbl"><span class="l">${esc(this._t('f_name'))}</span><small>${esc(this._t('f_name_hint'))}</small></span>
                <div class="box text"><input type="text" data-key="title" value="${esc(d.title)}" placeholder="${esc(acc.auto_title)}"></div>
              </label>
              ${this._number(acc, 'scan_interval', 'f_scan', 'f_scan_hint', 'u_min')}
              ${this._number(acc, 'notify_days', 'f_notify', 'f_notify_hint', 'u_days')}
            </div></div>
          <div class="group"><div class="g-t">${esc(this._t('g_health'))}</div>
            <div class="g-box">
              ${this._number(acc, 'health_interval', 'f_health', 'f_health_hint', 'u_min')}
              <label class="row toggle">
                <span class="lbl"><span class="l">${esc(this._t('f_stream'))}</span><small class="msg">${esc(this._t('f_stream_hint'))}</small></span>
                <ha-switch data-key="stream_check"${d.stream_check ? ' checked' : ''}></ha-switch>
              </label>
            </div></div>
          <div class="bar">
            <div class="links">
              ${acc.device_id ? `<a href="/config/devices/device/${esc(acc.device_id)}"><ha-icon icon="mdi:devices"></ha-icon>${esc(this._t('open_device'))}</a>` : ''}
              ${status ? `<span class="msg ${status.tone || ''}">${esc(status.text)}</span>` : ''}
            </div>
            ${remove}
            <button class="act" data-do="save"${canSave ? '' : ' disabled'}><ha-icon icon="mdi:content-save"></ha-icon>${esc(this._t(busy === 'save' ? 'saving' : 'save'))}</button>
          </div>
        </div>
      </ha-card>`;
  }

  // An account of the list: its type, name, login, and its state on the round icon
  _listItem(acc) {
    var esc = iptvPanelEsc;
    var selected = acc.entry_id === this._selected;
    var icon = acc.provider === 'stalker' ? 'mdi:router-network' : 'mdi:account-key';
    var tone = iptvPanelTone(acc.state);
    var dirty = this._drafts[acc.entry_id] && this._changed(acc);
    return `<button class="md-item ${tone}${selected ? ' active' : ''}" role="option" aria-selected="${selected}" tabindex="${selected ? 0 : -1}"
        data-select="${esc(acc.entry_id)}">
        <span class="md-ico ${tone}"><ha-icon icon="${icon}"></ha-icon>${iptvPanelGlyph(tone)}</span>
        <span class="who"><span class="n">${esc(acc.title)}${dirty ? ' •' : ''}</span>
          <span class="s">${esc(acc.provider === 'stalker' ? 'Stalker' : 'Xtream')} · ${esc(acc.login)}</span></span>
      </button>`;
  }

  // The Panel entry, first of the list: its subtitle says who the top bar is hidden for
  _generalItem() {
    var esc = iptvPanelEsc;
    var selected = this._selected === IPTV_PANEL_GENERAL;
    return `<button class="md-item general${selected ? ' active' : ''}" role="option" aria-selected="${selected}" tabindex="${selected ? 0 : -1}"
        data-select="${IPTV_PANEL_GENERAL}">
        <span class="md-ico"><ha-icon icon="mdi:page-layout-header"></ha-icon></span>
        <span class="who"><span class="n">${esc(this._t('panel_display'))}</span>
          <span class="s plain">${esc(this._t('f_hide_toolbar'))} · ${esc(this._t(`hide_${this._panelSettings.hide_toolbar}`))}</span></span>
      </button>`;
  }

  // Another account: its form keeps what was typed (drafts are per account), its password is hidden again
  _select(entryId, open = true) {
    if (this._credEdit && this._credEdit.entry_id !== entryId) this._credEdit = null;
    this._selected = entryId;
    if (open) this._mdOpen = true;
    this._confirm = null;
    this._renderAccounts();
  }

  // ── Credentials: edited in place, in the selected account ──
  async _openCredEdit(acc) {
    var state = { entry_id: acc.entry_id, loading: true };
    this._credEdit = state;
    this._renderAccounts();
    var prefill = await this._command('edit_account', { device_id: acc.device_id });
    if (this._credEdit !== state) return;
    this._credEdit = prefill.ok
      ? { entry_id: acc.entry_id, provider: prefill.provider === 'stalker' ? 'stalker' : 'xtream', values: prefill }
      : { entry_id: acc.entry_id, error: iptvPanelError(this._lang(), prefill.error) };
    this._renderAccounts();
    this.shadowRoot.querySelector('.md-detail .form input')?.focus();
  }

  async _submitCredEdit(acc, button) {
    var state = this._credEdit;
    var form = button.closest('.form');
    var payload = { device_id: acc.device_id, ...this._formValues(form) };
    button.disabled = true;
    button.textContent = this._t('p_edit_saving');
    var out = await this._command('edit_account', payload);
    if (this._credEdit !== state) return;
    if (out.ok) {
      this._credEdit = null;
      delete this._secrets[acc.entry_id];
      this._status[acc.entry_id] = { tone: 'good', text: this._t('saved') };
      await this._load();
      return;
    }
    button.disabled = false;
    button.textContent = this._t('p_edit_save');
    form.querySelector('.err').textContent = iptvPanelError(this._lang(), out.error);
  }

  _credEditHtml() {
    var state = this._credEdit;
    var esc = iptvPanelEsc;
    var body = state.loading
      ? `<div class="msg">${esc(this._t('p_edit_saving'))}</div>`
      : state.provider
        ? this._credentialFields(state.provider, state.values, true)
        : '';
    return `<div class="form creds-form"><div class="t">${esc(this._t('p_edit_title'))}</div>${body}
      <div class="err" role="alert">${esc(state.error || '')}</div>
      <div class="b"><button class="act quiet" data-cred-cancel>${esc(this._t('p_edit_cancel'))}</button>
        ${state.provider ? `<button class="act" data-cred-submit>${esc(this._t('p_edit_save'))}</button>` : ''}</div></div>`;
  }

  _confirmHtml(acc) {
    var esc = iptvPanelEsc;
    var id = esc(acc.entry_id);
    return `
      <div class="confirm" role="dialog" aria-modal="true" aria-labelledby="cf-t-${id}" aria-describedby="cf-m-${id}">
        <div class="cf-t" id="cf-t-${id}">${esc(this._t('remove_title'))}</div>
        <div class="msg" id="cf-m-${id}">${esc(this._t('remove_msg', { name: acc.title }))}</div>
        <div class="cf-b">
          <button class="act quiet" data-do="cancel">${esc(this._t('cancel'))}</button>
          <button class="act bad" data-do="confirm-remove"><ha-icon icon="mdi:delete-outline"></ha-icon>${esc(this._t('remove'))}</button>
        </div>
      </div>`;
  }

  _renderAccounts() {
    var box = this.shadowRoot.getElementById('accounts');
    if (!box) return;
    if (this._accounts === null && this._loadError) {
      box.innerHTML = `<ha-card class="note error" role="alert">${iptvPanelEsc(this._t('load_failed', { error: this._loadError }))}
        <button class="act" data-retry><ha-icon icon="mdi:refresh"></ha-icon>${iptvPanelEsc(this._t('retry'))}</button></ha-card>`;
      box.querySelector('[data-retry]').addEventListener('click', () => this._reload());
      return;
    }
    if (this._accounts === null) {
      box.innerHTML = `<ha-card class="note" aria-busy="true">${iptvPanelEsc(this._t('loading'))}</ha-card>`;
      return;
    }
    // One page at a time: the Panel entry and the accounts listed, then the selected one's page (the first account by
    // default, the Panel entry while there is none)
    var ids = [IPTV_PANEL_GENERAL, ...this._accounts.map((a) => a.entry_id)];
    if (!ids.includes(this._selected)) this._selected = ids[1] || IPTV_PANEL_GENERAL;
    var general = this._selected === IPTV_PANEL_GENERAL;
    var acc = general ? null : this._accounts.find((a) => a.entry_id === this._selected);
    var focus = this._focusOf(box);
    var esc = iptvPanelEsc;
    var none = this._accounts.length ? '' : `<div class="md-none">${esc(this._t('none', { add: this._t('p_add_btn') }))}</div>`;
    box.innerHTML = `<div class="md${this._mdOpen ? ' open' : ''}">
        <ha-card class="md-list" role="listbox" aria-label="${esc(this._t('all_accounts'))}">
          <div class="md-cap" aria-hidden="true">${esc(this._t('g_general'))}</div>${this._generalItem()}
          <div class="md-cap" aria-hidden="true">${esc(this._t('g_accounts'))}</div>${this._accounts.map((a) => this._listItem(a)).join('')}${none}
        </ha-card>
        <div class="md-detail">
          <button class="act quiet md-back" data-back><ha-icon icon="mdi:arrow-left"></ha-icon>${esc(this._t('all_accounts'))}</button>
          ${general ? this._generalHtml() : this._accountHtml(acc)}
        </div>
      </div>`;
    box.querySelectorAll('[data-select]').forEach((item) => {
      item.addEventListener('click', () => this._select(item.dataset.select));
      // Up and down move between the accounts, as in a list
      item.addEventListener('keydown', (ev) => {
        var step = ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        ev.preventDefault();
        var next = ids[(ids.indexOf(this._selected) + step + ids.length) % ids.length];
        this._select(next, false);
        box.querySelector(`[data-select="${CSS.escape(next)}"]`)?.focus();
      });
    });
    box.querySelector('[data-back]').addEventListener('click', () => {
      this._mdOpen = false;
      this._renderAccounts();
      box.querySelector(`[data-select="${CSS.escape(this._selected)}"]`)?.focus();
    });
    if (general) this._bindGeneral(box.querySelector('ha-card.general'));
    else this._bind(acc, box.querySelector(`ha-card[data-id="${CSS.escape(acc.entry_id)}"]`));
    this._refocus(box, focus);
  }

  // The focused field or button of a form (account, attribute, caret), so a re-render can give the focus back.
  // A button disabled meanwhile (Check now while it runs) gets it back on the next render that enables it again.
  _focusOf(box) {
    var el = this.shadowRoot.activeElement;
    if (!el || !box.contains(el)) {
      var pending = this._pendingFocus;
      return pending && !el ? pending : null;
    }
    var id = el.closest?.('ha-card[data-id]')?.dataset.id;
    var attr = ['key', 'do', 'copy', 'reveal'].find((a) => el.dataset?.[a] != null);
    if (id == null || !attr) return null;
    var focus = { id, attr: `data-${attr}`, value: el.dataset[attr], range: null };
    try {
      // Number inputs have no selection (null, or an exception in some browsers)
      if (el.selectionStart != null) focus.range = [el.selectionStart, el.selectionEnd, el.selectionDirection];
    } catch (_err) {
      focus.range = null;
    }
    return focus;
  }

  _refocus(box, focus) {
    this._pendingFocus = null;
    if (!focus) return;
    var card = box.querySelector(`ha-card[data-id="${CSS.escape(focus.id)}"]`);
    var el = card?.querySelector(focus.value ? `[${focus.attr}="${CSS.escape(focus.value)}"]` : `[${focus.attr}]`);
    if (!el) return;
    if (el.disabled) {
      // Only while the account is busy: a Save left disabled after saving must not grab the focus later
      if (this._busy[focus.id]) this._pendingFocus = focus;
      return;
    }
    el.focus({ preventScroll: true });
    if (!focus.range) return;
    try {
      el.setSelectionRange(...focus.range);
    } catch (_err) {
      // the caret cannot be set on this field type
    }
  }

  // Refresh only the buttons of one account, so typing keeps the focus
  _refreshBar(acc, el) {
    var save = el.querySelector('[data-do="save"]');
    save.disabled = !!this._busy[acc.entry_id] || !this._changed(acc) || !this._valid(acc);
    el.querySelectorAll('input[type="number"]').forEach((input) => {
      var [lo, hi] = IPTV_PANEL_LIMITS[input.dataset.key];
      var n = Number(input.value);
      input.parentElement.classList.toggle('bad-value', !(Number.isInteger(n) && n >= lo && n <= hi));
    });
  }

  _bind(acc, el) {
    if (!el) return;
    el.querySelectorAll('input[data-key]').forEach((input) => {
      input.addEventListener('input', () => {
        this._edit(acc, input.dataset.key, input.value);
        delete this._status[acc.entry_id];
        this._refreshBar(acc, el);
      });
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !el.querySelector('[data-do="save"]').disabled) this._save(acc);
      });
    });
    el.querySelector('ha-switch').addEventListener('change', (ev) => {
      this._edit(acc, 'stream_check', !!ev.target.checked);
      this._refreshBar(acc, el);
    });
    el.querySelector('[data-reveal]')?.addEventListener('click', () => this._toggleSecret(acc));
    el.querySelector('[data-cred-edit]')?.addEventListener('click', () => this._openCredEdit(acc));
    el.querySelector('[data-cred-cancel]')?.addEventListener('click', () => {
      this._credEdit = null;
      this._renderAccounts();
      this.shadowRoot.querySelector('[data-cred-edit]')?.focus();
    });
    el.querySelector('[data-cred-submit]')?.addEventListener('click', (ev) => this._submitCredEdit(acc, ev.currentTarget));
    el.querySelector('.creds-form')?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && ev.target.matches('input')) {
        ev.preventDefault();
        ev.stopPropagation();
        el.querySelector('[data-cred-submit]')?.click();
      }
    });
    el.querySelectorAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', () => this._copy(acc, button.dataset.copy, button));
    });
    el.querySelector('[data-do="save"]').addEventListener('click', () => this._save(acc));
    el.querySelector('[data-do="check"]').addEventListener('click', () => this._check(acc));
    el.querySelector('[data-do="remove"]')?.addEventListener('click', () => this._askRemove(acc));
    el.querySelector('[data-do="cancel"]')?.addEventListener('click', () => this._closeConfirm(acc));
    el.querySelector('[data-do="confirm-remove"]')?.addEventListener('click', () => this._remove(acc));
    // Escape closes the confirmation, Tab stays on its two buttons
    el.querySelector('.confirm')?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        this._closeConfirm(acc);
      } else if (ev.key === 'Tab') {
        ev.preventDefault();
        var next = this.shadowRoot.activeElement?.dataset?.do === 'cancel' ? 'confirm-remove' : 'cancel';
        this._focusAction(acc, next);
      }
    });
  }

  _focusAction(acc, action) {
    var card = this.shadowRoot.getElementById('accounts')?.querySelector(`ha-card[data-id="${CSS.escape(acc.entry_id)}"]`);
    card?.querySelector(`[data-do="${action}"]`)?.focus({ preventScroll: true });
  }

  _askRemove(acc) {
    this._confirm = acc.entry_id;
    this._renderAccounts();
    this._focusAction(acc, 'cancel');
  }

  // Back to the Remove button that opened it
  _closeConfirm(acc) {
    this._confirm = null;
    this._renderAccounts();
    this._focusAction(acc, 'remove');
  }

  _remove(acc) {
    this._confirm = null;
    return this._run(acc, 'remove', async () => {
      var res = await this._hass.callWS({ type: 'iptv/remove_account', entry_id: acc.entry_id });
      if (!res?.ok) return { tone: 'bad', text: this._t(`err_${res?.error || 'generic'}`) };
      await this._load();
      return null;
    });
  }

  async _run(acc, kind, call) {
    this._busy[acc.entry_id] = kind;
    this._renderAccounts();
    try {
      this._status[acc.entry_id] = await call();
    } catch (err) {
      this._status[acc.entry_id] = { tone: 'bad', text: err?.message || this._t('err_generic') };
    }
    delete this._busy[acc.entry_id];
    this._renderAccounts();
  }

  _save(acc) {
    var d = this._draft(acc);
    return this._run(acc, 'save', async () => {
      var res = await this._hass.callWS({
        type: 'iptv/update_account',
        entry_id: acc.entry_id,
        title: d.title.trim(),
        scan_interval: Number(d.scan_interval),
        notify_days: Number(d.notify_days),
        health_interval: Number(d.health_interval),
        stream_check: !!d.stream_check,
      });
      if (!res.ok) return { tone: 'bad', text: this._t(`err_${res.error}`) };
      delete this._drafts[acc.entry_id];
      Object.assign(acc, res.account);
      return { tone: 'good', text: this._t('saved') };
    });
  }

  _check(acc) {
    return this._run(acc, 'check', async () => {
      var res = await this._hass.callWS({ type: 'iptv/check_account', entry_id: acc.entry_id });
      if (res.error) return { tone: 'bad', text: this._t(`err_${res.error}`) };
      return res.ok ? { tone: 'good', text: this._t('checked_ok') } : { tone: 'bad', text: this._t('checked_ko') };
    });
  }
}

if (!customElements.get('iptv-panel')) {
  customElements.define('iptv-panel', IptvPanel);
}
