/*
 * IPTV sidebar panel — every IPTV account in one page (administrators only).
 *
 * Two tabs under the toolbar, as in Smart Comfort: Subscriptions, drawn by the panel itself from the subscription
 * entities (status, expiration, catalogue, connections, health) with Add, Edit credentials and Remove (iptv/add_account,
 * iptv/edit_account, the remove_account action); Settings, one form per account (name, polling, expiration notice, health
 * check, stream test) and a "check now" action, through the iptv/accounts, iptv/update_account and
 * iptv/check_account WebSocket commands; an account that never finished its setup (no device, so the card cannot
 * list it) gets a Remove action (iptv/remove_account). The list follows config entry changes
 * (config_entries/subscribe), so an account added or removed from the card shows up here. The tab is in the
 * address (/iptv-config/settings). Above the accounts, the Settings tab holds the panel's own settings, shared by every
 * user (iptv/panel_settings, iptv/update_panel_settings): its top bar hidden for nobody, everyone or non-administrators.
 *
 * https://github.com/juju35/ha-iptv
 */
export var IPTV_PANEL_VERSION = '3.38.6';
