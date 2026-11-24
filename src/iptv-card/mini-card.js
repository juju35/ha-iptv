// ── iptv-mini-card ────────────────────────────────────────────────────────────
// The full card on two lines: the logo, title and a global status pill, then one chip per
// subscription with its days left. Its detail button (top right, `zoom: false` removes it)
// switches it to the full card and back; a click anywhere else brings it back too, unless it
// lands in a dialog opened from the card (more-info) or a popup of the card is open.
import { IPTV_SIZER, iptvBadge, iptvEsc, iptvFocusOf, iptvRefocus, iptvStateIcon, iptvWorstState } from "./i18n-helpers.js";
import { IptvCard } from "./card.js";

export class IptvMiniCard extends IptvCard {
  static CSS = `${IptvCard.CSS}
    .mini { display: flex; align-items: center; gap: 10px; }
    /* The full card's badge (40 px), top-aligned: 12 px from the card's top edge, like the other cards (the two
       lines are taller than the badge) */
    .mini .badge { align-self: flex-start; }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    /* The title gives way first (down to its 4 characters), then the pill */
    .mini .name { flex: 1 1 0; min-width: 4.5ch; }
    :host([hide-title]) .mini .head > .name { visibility: hidden; }
    .head .chip { flex: 0 1 auto; min-width: 0; margin-left: auto; }
    /* The whole title and the pill's whole label do not fit on one row (measured, see _fitPill): the pill under the title */
    .mini .body.below .head { flex-wrap: wrap; row-gap: 4px; }
    .mini .body.below .head > .name { flex: 1 1 calc(100% - 32px); }
    .mini .body.below .head:not(:has(> .zoom)) > .name { flex-basis: 100%; }
    .mini .body.below .head > .chip { order: 3; margin-left: 0; }
    .mini .body.dot-only .head > .chip .tx { display: none; } .mini .body.dot-only .head > .chip { padding: 1px 5px; }
    .rs { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-left: -4px; }
    .mini .msg { padding: 0; font-size: 12px; }
    /* A chip never goes past the card: its name is truncated (whole in its tooltip), its figure stays whole */
    button.r { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0 6px 0 4px; border-radius: 999px;
               font-size: 12px; font-weight: 500; line-height: 18px; white-space: nowrap; color: var(--primary-text-color); --mdc-icon-size: 13px;
               box-sizing: border-box; max-width: 100%; min-width: 0; }
    .r ha-icon { color: var(--c); display: inline-flex; flex: none; }
    .r .rn { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    /* The figure only gives way when it alone is wider than the card */
    .r .fig { font-weight: 400; color: var(--secondary-text-color); flex: none; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
    .r.warning, .r.error { color: var(--ct); background: color-mix(in srgb, var(--c) 14%, transparent); }
    .r.warning .fig, .r.error .fig { color: inherit; }
    .r:hover { background: color-mix(in srgb, var(--c) 20%, var(--secondary-background-color, transparent)); }
    .r:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    button.zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
                  display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
    .zoom ha-icon { display: inline-flex; }
    .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
    .zoom:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    .header .zoom { align-self: flex-start; margin: 2px -4px 0 -6px; }
    /* 6 columns of a 500 px section: the title, the pill (whole) and the detail button share a tighter line */
    @container (max-width: 240px) {
      .head { gap: 4px; }
    }
    /* Phone width (its 6 columns: 156 to 178 px): no badge (the pill and chips carry the state), so the
       subscription chips keep their figures whole; the global pill keeps its icon only */
    @container (max-width: 200px) {
      .mini .badge { display: none; }
      .head .chip .tx { display: none; }
      .head .chip { padding: 1px 5px; }
    }
  `;

  static getConfigElement() {
    return document.createElement('iptv-mini-card-editor');
  }

  constructor() {
    super();
    this._zoomed = false;
    this._onUnzoom = (ev) => {
      if (!this._outside(ev)) return;
      this._zoomed = false;
      this._render();
    };
    // On iOS (Safari and the companion app) a tap on something that is not clickable sends no click to the page:
    // the press and the release outside the card count as a click elsewhere too.
    this._onDown = (ev) => {
      this._downOutside = this._outside(ev);
    };
    this._onUp = (ev) => {
      if (this._downOutside) this._onUnzoom(ev);
      this._downOutside = false;
    };
  }

  // A click elsewhere: zoomed in, no popup of the card open (it is closed first, by its backdrop or buttons),
  // outside the card and outside a Home Assistant dialog.
  _outside(ev) {
    var path = ev.composedPath();
    if (!this._zoomed || this._modal || path.includes(this)) return false;
    return !path.some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName));
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onUnzoom, true);
    document.addEventListener('pointerdown', this._onDown, true);
    document.addEventListener('pointerup', this._onUp, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onUnzoom, true);
    document.removeEventListener('pointerdown', this._onDown, true);
    document.removeEventListener('pointerup', this._onUp, true);
    // Back on the page in its compact view
    this._zoomed = false;
  }

  setConfig(config) {
    if (config?.zoom != null && typeof config.zoom !== 'boolean') throw new Error('zoom must be true or false');
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  // Half a section (zoomed in: the full card's sizes)
  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var focus = iptvFocusOf(this.shadowRoot, this._root);
    if (this._zoomed) super._render();
    else this._renderMini();
    this._addZoom();
    this._fitPill();
    iptvRefocus(this._root, focus);
  }

  // One chip per subscription: its name and days left (or why it is not active);
  // plain when fine, tinted when expiring or in error. It opens the entity shown.
  _miniChip(sub, v, i) {
    var fig;
    var entity = sub.ids.days_left ? 'days_left' : 'expiration';
    if (v.unavailable) [fig, entity] = [this._t('status_unknown'), 'status'];
    else if (v.state === 'error' && !v.expired) [fig, entity] = [v.statusLabel, 'status'];
    else if (v.expired) fig = this._t('status_expired');
    else fig = v.daysLeft === null ? this._t('unlimited') : this._t('mini_days', { n: v.daysLeft });
    var title = `${sub.name} · ${fig}`;
    return `<button class="r ${v.state}" data-sub="${i}" data-entity="${entity}" title="${iptvEsc(title)}"><ha-icon icon="${iptvStateIcon(v.state)}"></ha-icon><span class="rn">${iptvEsc(sub.name)}</span><span class="fig">${iptvEsc(fig)}</span></button>`;
  }

  _renderMini() {
    var subs = this._hass ? this._subs() : [];
    var views = this._views(subs);
    var title = this._config.title || this._t(subs.length > 1 ? 'default_title_multi' : 'default_title');
    var line = !this._hass
      ? `<div class="msg">${this._t('loading')}</div>`
      : !subs.length
        ? `<div class="msg">${this._t('no_device')}</div>`
        : subs.map((sub, i) => this._miniChip(sub, views[i], i)).join('');
    if (!this._root) { this._root = document.createElement('div'); this.shadowRoot.appendChild(this._root); }
    var worst = iptvWorstState(views.map((v) => v.state));
    var head = `<div class="head"><div class="name">${iptvEsc(title)}</div>${this._miniStatus(views)}</div>
            <div class="rs">${line}</div>`;
    // Illustrated: the same banner as the full card, the two lines on its wall (the detail button in its top-right corner)
    var illustrated = this._illustrated();
    var inner = illustrated
      ? this._banner(worst, head, '')
      : `<div class="mini">
          ${iptvBadge(worst)}
          <div class="body">
            ${head}
          </div>
        </div>`;
    this._root.innerHTML = `
      <style>${this.constructor.CSS}</style>
      <ha-card${illustrated ? ' class="ill mini-ill"' : ''}>
        ${inner}
      </ha-card>${IPTV_SIZER}`;
    this._bindMoreInfo(subs);
  }

  // Detail button at the end of the header, top right in both views
  _addZoom() {
    // The banner's button column first (its text also holds a .head), else the classic header
    var head = this._config.zoom !== false && (this._root?.querySelector('.acts') || this._root?.querySelector('.head, .header'));
    if (!head) return;
    var button = document.createElement('button');
    button.className = 'zoom';
    button.title = this._t(this._zoomed ? 'zoom_out' : 'zoom_in');
    button.setAttribute('aria-label', button.title);
    button.innerHTML = `<ha-icon icon="mdi:${this._zoomed ? 'arrow-collapse' : 'arrow-expand'}"></ha-icon>`;
    button.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this._zoomed = !this._zoomed;
      this._render();
      // Keyboard use (Enter / Space: no click count) keeps the focus on the new button
      if (ev.detail === 0) this._root.querySelector('button.zoom')?.focus({ preventScroll: true });
    });
    head.appendChild(button);
  }
}
