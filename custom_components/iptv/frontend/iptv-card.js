/*
 * IPTV Subscription Card — Home Assistant Lovelace card for Xtream Codes and Stalker subscriptions.
 * Shows status, expiration date, days left, number of live channels, movies, series and connections
 * of one or several subscriptions (one section per provider).
 *
 * Bundled with the iptv integration, which polls the Xtream Codes or Stalker server:
 * the card only reads the entities of the subscription devices.
 *
 * https://github.com/juju35/ha-iptv
 */
var IPTV_CARD_VERSION = '3.22.1';
var IPTV_DOMAIN = 'iptv';

// ── i18n ──────────────────────────────────────────────────────────────────────
var IptvCardI18n = {
  en: {
    default_title: 'IPTV subscription',
    default_title_multi: 'IPTV subscriptions',
    loading: 'Loading…',
    no_device: 'No IPTV subscription found: add the IPTV integration in Settings → Devices & services.',
    unavailable: 'IPTV server unreachable',
    refresh: 'Refresh',
    edit_btn: 'Edit credentials',
    edit_title: 'Edit account',
    edit_url: 'Server URL',
    edit_username: 'Username',
    edit_password: 'Password',
    edit_password_keep: 'Leave blank to keep',
    edit_mac: 'MAC address',
    edit_save: 'Save',
    edit_cancel: 'Cancel',
    edit_saving: 'Checking…',
    err_invalid_auth: 'Credentials refused',
    err_cannot_connect: 'Cannot reach the server',
    err_invalid_mac: 'Invalid MAC address',
    err_no_french_lists: 'No French list on this provider',
    err_french_unknown: 'Could not read the categories',
    err_stream_ko: 'The test channel does not play',
    err_already_configured: 'Another account already uses these credentials',
    err_not_found: 'Account not found',
    err_generic: 'Update failed',
    del_btn: 'Remove account',
    del_title: 'Remove account',
    del_confirm: 'The account and its entities will be removed.',
    del_delete: 'Delete',
    add_btn: 'Add account',
    add_title: 'Add account',
    add_provider: 'Provider type',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Add',
    err_existing_longer: 'An account valid longer is already on this server',
    err_empty_catalogue: 'The provider has no usable catalogue',
    view_btn: 'View credentials',
    view_title: 'Credentials',
    copy: 'Copy',
    status_active: 'Active',
    status_expired: 'Expired',
    status_banned: 'Banned',
    status_disabled: 'Disabled',
    status_unknown: 'Unknown',
    auth_failed: 'Invalid credentials',
    trial: 'Trial',
    expiration: 'Expiration',
    never: 'Never',
    unlimited: 'Unlimited',
    day_left: '{n} day left',
    days_left: '{n} days left',
    channels: 'channels',
    movies: 'movies',
    series: 'series',
    connections: 'connections',
    french_on: 'FR',
    french_off: 'No FR',
    french_title: 'French lists',
    last_check: 'Last check',
    health_ok: 'Online',
    health_degraded: 'Slow',
    health_unreachable: 'Unreachable',
    health_stream_ko: 'Stream down',
    health_auth_failed: 'Credentials refused',
    ed_title: 'Title',
    ed_devices: 'Subscriptions (all if empty)',
    ed_warning_days: 'Warn before expiration',
    ed_language: 'Language',
    ed_zoom: 'Detail button',
    zoom_in: 'Show the full card',
    zoom_out: 'Back to the compact view',
    mini_all_active: 'All active',
    mini_expiring: '{n} expiring',
    mini_expiring_plural: '{n} expiring',
    mini_expired: '{n} expired',
    mini_expired_plural: '{n} expired',
    mini_error: '{n} in error',
    mini_error_plural: '{n} in error',
    mini_days: '{n} d',
  },
  fr: {
    default_title: 'Abonnement IPTV',
    default_title_multi: 'Abonnements IPTV',
    loading: 'Chargement…',
    no_device: 'Aucun abonnement IPTV : ajoute l’intégration IPTV dans Paramètres → Appareils et services.',
    unavailable: 'Serveur IPTV injoignable',
    refresh: 'Actualiser',
    edit_btn: 'Modifier les identifiants',
    edit_title: 'Modifier le compte',
    edit_url: 'URL du serveur',
    edit_username: 'Identifiant',
    edit_password: 'Mot de passe',
    edit_password_keep: 'Laisser vide pour conserver',
    edit_mac: 'Adresse MAC',
    edit_save: 'Enregistrer',
    edit_cancel: 'Annuler',
    edit_saving: 'Vérification…',
    err_invalid_auth: 'Identifiants refusés',
    err_cannot_connect: 'Serveur injoignable',
    err_invalid_mac: 'Adresse MAC invalide',
    err_no_french_lists: 'Aucune liste française chez ce fournisseur',
    err_french_unknown: 'Impossible de lire les catégories',
    err_stream_ko: 'La chaîne de test ne se lit pas',
    err_already_configured: 'Un autre compte utilise déjà ces identifiants',
    err_not_found: 'Compte introuvable',
    err_generic: 'Échec de la mise à jour',
    del_btn: 'Supprimer le compte',
    del_title: 'Supprimer le compte',
    del_confirm: 'Le compte et ses entités seront supprimés.',
    del_delete: 'Supprimer',
    add_btn: 'Ajouter un compte',
    add_title: 'Ajouter un compte',
    add_provider: 'Type de fournisseur',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Ajouter',
    err_existing_longer: 'Un compte valide plus longtemps existe déjà sur ce serveur',
    err_empty_catalogue: 'Le fournisseur n\'a pas de catalogue exploitable',
    view_btn: 'Voir les identifiants',
    view_title: 'Identifiants',
    copy: 'Copier',
    status_active: 'Actif',
    status_expired: 'Expiré',
    status_banned: 'Banni',
    status_disabled: 'Désactivé',
    status_unknown: 'Inconnu',
    auth_failed: 'Identifiants refusés',
    trial: 'Essai',
    expiration: 'Expiration',
    never: 'Jamais',
    unlimited: 'Illimité',
    day_left: '{n} jour restant',
    days_left: '{n} jours restants',
    channels: 'chaînes',
    movies: 'films',
    series: 'séries',
    connections: 'connexions',
    french_on: 'FR',
    french_off: 'Pas de FR',
    french_title: 'Listes françaises',
    last_check: 'Dernier contrôle',
    health_ok: 'En ligne',
    health_degraded: 'Lent',
    health_unreachable: 'Injoignable',
    health_stream_ko: 'Flux KO',
    health_auth_failed: 'Identifiants refusés',
    ed_title: 'Titre',
    ed_devices: 'Abonnements (tous si vide)',
    ed_warning_days: 'Alerte avant expiration',
    ed_language: 'Langue',
    ed_zoom: 'Bouton détail',
    zoom_in: 'Afficher la carte complète',
    zoom_out: 'Revenir à la vue compacte',
    mini_all_active: 'Tous actifs',
    mini_expiring: '{n} expire bientôt',
    mini_expiring_plural: '{n} expirent bientôt',
    mini_expired: '{n} expiré',
    mini_expired_plural: '{n} expirés',
    mini_error: '{n} en erreur',
    mini_error_plural: '{n} en erreur',
    mini_days: '{n} j',
  },
  de: {
    default_title: 'IPTV-Abonnement',
    default_title_multi: 'IPTV-Abonnements',
    loading: 'Wird geladen…',
    no_device: 'Kein IPTV-Abonnement gefunden: Füge die IPTV-Integration unter Einstellungen → Geräte & Dienste hinzu.',
    unavailable: 'IPTV-Server nicht erreichbar',
    refresh: 'Aktualisieren',
    edit_btn: 'Zugangsdaten bearbeiten',
    edit_title: 'Konto bearbeiten',
    edit_url: 'Server-URL',
    edit_username: 'Benutzername',
    edit_password: 'Passwort',
    edit_password_keep: 'Leer lassen, um es zu behalten',
    edit_mac: 'MAC-Adresse',
    edit_save: 'Speichern',
    edit_cancel: 'Abbrechen',
    edit_saving: 'Wird geprüft…',
    err_invalid_auth: 'Zugangsdaten abgelehnt',
    err_cannot_connect: 'Server nicht erreichbar',
    err_invalid_mac: 'Ungültige MAC-Adresse',
    err_no_french_lists: 'Keine französische Liste bei diesem Anbieter',
    err_french_unknown: 'Kategorien konnten nicht gelesen werden',
    err_stream_ko: 'Der Testsender wird nicht abgespielt',
    err_already_configured: 'Ein anderes Konto verwendet bereits diese Zugangsdaten',
    err_not_found: 'Konto nicht gefunden',
    err_generic: 'Aktualisierung fehlgeschlagen',
    del_btn: 'Konto entfernen',
    del_title: 'Konto entfernen',
    del_confirm: 'Das Konto und seine Entitäten werden entfernt.',
    del_delete: 'Löschen',
    add_btn: 'Konto hinzufügen',
    add_title: 'Konto hinzufügen',
    add_provider: 'Anbietertyp',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Hinzufügen',
    err_existing_longer: 'Ein länger gültiges Konto existiert bereits auf diesem Server',
    err_empty_catalogue: 'Der Anbieter hat keinen nutzbaren Katalog',
    view_btn: 'Zugangsdaten anzeigen',
    view_title: 'Zugangsdaten',
    copy: 'Kopieren',
    status_active: 'Aktiv',
    status_expired: 'Abgelaufen',
    status_banned: 'Gesperrt',
    status_disabled: 'Deaktiviert',
    status_unknown: 'Unbekannt',
    auth_failed: 'Ungültige Zugangsdaten',
    trial: 'Testphase',
    expiration: 'Ablauf',
    never: 'Nie',
    unlimited: 'Unbegrenzt',
    day_left: 'Noch {n} Tag',
    days_left: 'Noch {n} Tage',
    channels: 'Sender',
    movies: 'Filme',
    series: 'Serien',
    connections: 'Verbindungen',
    french_on: 'FR',
    french_off: 'Kein FR',
    french_title: 'Französische Listen',
    last_check: 'Letzte Prüfung',
    health_ok: 'Online',
    health_degraded: 'Langsam',
    health_unreachable: 'Nicht erreichbar',
    health_stream_ko: 'Stream ausgefallen',
    health_auth_failed: 'Zugangsdaten abgelehnt',
    ed_title: 'Titel',
    ed_devices: 'Abonnements (alle, wenn leer)',
    ed_warning_days: 'Warnung vor Ablauf',
    ed_language: 'Sprache',
    ed_zoom: 'Detail-Schaltfläche',
    zoom_in: 'Vollständige Karte anzeigen',
    zoom_out: 'Zurück zur kompakten Ansicht',
    mini_all_active: 'Alle aktiv',
    mini_expiring: '{n} läuft bald ab',
    mini_expiring_plural: '{n} laufen bald ab',
    mini_expired: '{n} abgelaufen',
    mini_expired_plural: '{n} abgelaufen',
    mini_error: '{n} mit Fehler',
    mini_error_plural: '{n} mit Fehler',
    mini_days: '{n} T',
  },
  es: {
    default_title: 'Suscripción IPTV',
    default_title_multi: 'Suscripciones IPTV',
    loading: 'Cargando…',
    no_device: 'No se ha encontrado ninguna suscripción IPTV: añade la integración IPTV en Ajustes → Dispositivos y servicios.',
    unavailable: 'Servidor IPTV inaccesible',
    refresh: 'Actualizar',
    edit_btn: 'Editar credenciales',
    edit_title: 'Editar cuenta',
    edit_url: 'URL del servidor',
    edit_username: 'Usuario',
    edit_password: 'Contraseña',
    edit_password_keep: 'Déjalo vacío para conservarla',
    edit_mac: 'Dirección MAC',
    edit_save: 'Guardar',
    edit_cancel: 'Cancelar',
    edit_saving: 'Comprobando…',
    err_invalid_auth: 'Credenciales rechazadas',
    err_cannot_connect: 'No se puede conectar con el servidor',
    err_invalid_mac: 'Dirección MAC no válida',
    err_no_french_lists: 'Ninguna lista francesa en este proveedor',
    err_french_unknown: 'No se han podido leer las categorías',
    err_stream_ko: 'El canal de prueba no se reproduce',
    err_already_configured: 'Otra cuenta ya usa estas credenciales',
    err_not_found: 'Cuenta no encontrada',
    err_generic: 'Error al actualizar',
    del_btn: 'Eliminar cuenta',
    del_title: 'Eliminar cuenta',
    del_confirm: 'Se eliminarán la cuenta y sus entidades.',
    del_delete: 'Eliminar',
    add_btn: 'Añadir cuenta',
    add_title: 'Añadir cuenta',
    add_provider: 'Tipo de proveedor',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Añadir',
    err_existing_longer: 'Ya existe en este servidor una cuenta válida durante más tiempo',
    err_empty_catalogue: 'El proveedor no tiene un catálogo utilizable',
    view_btn: 'Ver credenciales',
    view_title: 'Credenciales',
    copy: 'Copiar',
    status_active: 'Activa',
    status_expired: 'Caducada',
    status_banned: 'Bloqueada',
    status_disabled: 'Desactivada',
    status_unknown: 'Desconocida',
    auth_failed: 'Credenciales no válidas',
    trial: 'Prueba',
    expiration: 'Caducidad',
    never: 'Nunca',
    unlimited: 'Ilimitada',
    day_left: 'Queda {n} día',
    days_left: 'Quedan {n} días',
    channels: 'canales',
    movies: 'películas',
    series: 'series',
    connections: 'conexiones',
    french_on: 'FR',
    french_off: 'Sin FR',
    french_title: 'Listas francesas',
    last_check: 'Última comprobación',
    health_ok: 'En línea',
    health_degraded: 'Lento',
    health_unreachable: 'Inaccesible',
    health_stream_ko: 'Flujo caído',
    health_auth_failed: 'Credenciales rechazadas',
    ed_title: 'Título',
    ed_devices: 'Suscripciones (todas si está vacío)',
    ed_warning_days: 'Aviso antes de la caducidad',
    ed_language: 'Idioma',
    ed_zoom: 'Botón de detalle',
    zoom_in: 'Mostrar la tarjeta completa',
    zoom_out: 'Volver a la vista compacta',
    mini_all_active: 'Todas activas',
    mini_expiring: '{n} caduca pronto',
    mini_expiring_plural: '{n} caducan pronto',
    mini_expired: '{n} caducada',
    mini_expired_plural: '{n} caducadas',
    mini_error: '{n} con error',
    mini_error_plural: '{n} con errores',
    mini_days: '{n} d',
  },
};

function iptvLang(config, hass) {
  if (config?.language) return config.language;
  if (hass?.language) return hass.language.split('-')[0];
  var docLang = document.documentElement.lang;
  return docLang ? docLang.split('-')[0] : 'en';
}

function iptvT(lang, key, vars) {
  var strings = IptvCardI18n[lang] || IptvCardI18n.en;
  var s = strings[key] || IptvCardI18n.en[key] || key;
  if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
  return s;
}

// Message of a service error code; an unknown code (e.g. already_in_progress) falls back to err_generic
function iptvErr(lang, code) {
  var key = `err_${code || 'generic'}`;
  return iptvT(lang, IptvCardI18n.en[key] ? key : 'err_generic');
}

// Worst state of the subscriptions shown (error, then warning, then ok), idle when there are none
function iptvWorstState(states) {
  return ['error', 'warning', 'ok'].find((s) => states.includes(s)) || 'idle';
}

// Header badge: the TV icon tinted with the card's state colour
function iptvBadge(state) {
  return `<div class="badge ${state}"><ha-icon icon="mdi:television-play"></ha-icon></div>`;
}

// Icon of a subscription state (ok, warning, error)
function iptvStateIcon(state) {
  return { ok: 'mdi:check-circle', warning: 'mdi:alert' }[state] || 'mdi:close-circle';
}

function iptvEsc(x) {
  return String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ── iptv-card ─────────────────────────────────────────────────────────────────
class IptvCard extends HTMLElement {
  static CSS = `
    :host { display: block; position: relative; --iptv-ok: var(--success-color, #43a047); --iptv-warn: var(--warning-color, #ffa600); --iptv-crit: var(--error-color, #db4437); }
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
    .ok { --c: var(--iptv-ok); } .warning { --c: var(--iptv-warn); } .error { --c: var(--iptv-crit); } .idle { --c: var(--secondary-text-color); }
    /* 8 px to the body (the card gap is 6 px); the status pill ends the title line, before the buttons */
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
    .header > button:last-child:not(.zoom) { margin-right: -4px; }
    .badge { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
             background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 24px; }
    .badge ha-icon { display: inline-flex; }
    .titles { flex: 1; min-width: 0; }
    .title-row { display: flex; align-items: center; gap: 10px; }
    .title-row .name { flex: 1; min-width: 0; }
    .title-row > .chip { flex: none; }
    .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px 1px 5px; border-radius: 12px; font-size: 11px; font-weight: 500;
            color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent); --mdc-icon-size: 14px; }
    .chip.idle { padding-left: 10px; }
    .chip.fr { padding-left: 6px; gap: 5px; }
    .checked { display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 11px; --mdc-icon-size: 13px; }
    .flag { width: 14px; height: 10px; border-radius: 2px; flex: none; box-shadow: 0 0 0 1px rgba(0,0,0,.12);
            background: linear-gradient(90deg, #0055a4 0 33.3%, #fff 33.3% 66.6%, #ef4135 66.6%); }
    .flag.off { filter: grayscale(1); opacity: .6; }
    .sect { display: flex; flex-direction: column; gap: 5px; }
    .sect.multi + .sect.multi { border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); padding-top: 6px; }
    .sect-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .sect-head .chips { margin-top: 0; flex: none; justify-content: flex-end; }
    .sect-name { font-size: 14px; font-weight: 500; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    button { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; align-self: flex-start; display: flex; }
    button:hover { background: var(--secondary-background-color); }
    button.spin ha-icon { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .row { display:flex; justify-content:space-between; align-items:baseline; gap: 8px; }
    .lbl { color: var(--secondary-text-color); font-size: 11px; }
    .exp .lbl { font-size: 12px; }
    .val { font-weight:500; font-size: 14px; }
    .bar { height:4px; border-radius:3px; background: var(--divider-color, rgba(127,127,127,.25)); margin-top:4px; overflow:hidden; }
    .rem { font-weight:400; font-size:12px; color: var(--secondary-text-color); }
    .rem.warning, .rem.error { color: var(--c); }
    .fill { height:100%; border-radius:3px; background: var(--c, var(--iptv-ok)); transition: width .6s ease; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px; }
    .stat { display:flex; align-items:center; gap:5px; padding:3px 7px; border-radius:8px; min-width: 0;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .stat ha-icon { color: var(--primary-color); --mdc-icon-size: 15px; flex: none; }
    .num { font-size: 14px; font-weight: 500; line-height: 1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .msg { color: var(--secondary-text-color); padding:8px 0; }
    .msg.err { color: var(--iptv-crit); }
    [data-entity] { cursor:pointer; }
    .stat:hover { filter: brightness(0.95); }
    .foot { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:20px; }
    .foot-actions { display:flex; align-items:center; gap:8px; }
    button.edit, button.del, button.view { padding:3px; margin:0; align-self:center; --mdc-icon-size:16px; }
    button.del:hover { color:var(--iptv-crit); background:color-mix(in srgb, var(--iptv-crit) 12%, transparent); }
    .backdrop { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:flex-start; justify-content:center; padding-top:12px; box-sizing:border-box; z-index:9; border-radius:var(--ha-card-border-radius, 12px); }
    .modal { background:var(--card-background-color, #1c1c1c); color:var(--primary-text-color); width:min(92%, 340px); border-radius:14px; padding:16px; box-shadow:0 8px 30px rgba(0,0,0,.4); display:flex; flex-direction:column; gap:10px; }
    .modal h3 { margin:0; font-size:16px; font-weight:500; }
    .field { display:flex; flex-direction:column; gap:3px; }
    .field label { font-size:11px; color:var(--secondary-text-color); }
    .field input, .field select { font:inherit; font-size:14px; padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3)); background:var(--secondary-background-color, rgba(127,127,127,.08)); color:var(--primary-text-color); }
    .field .hint { font-size:10px; color:var(--secondary-text-color); }
    .modal .err { color:var(--iptv-crit); font-size:12px; min-height:14px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:2px; }
    .modal button.act { border-radius:8px; padding:8px 14px; font:inherit; font-size:13px; font-weight:500; width:auto; height:auto; }
    .modal button.cancel { background:var(--secondary-background-color, rgba(127,127,127,.12)); color:var(--primary-text-color); }
    .modal button.primary { background:color-mix(in srgb, var(--primary-color, #03a9f4) 16%, transparent); color:var(--primary-color, #03a9f4); }
    .modal button.primary:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent); }
    .modal button.primary[disabled], .modal button.danger[disabled] { opacity:.6; cursor:default; }
    .modal button.danger { background:color-mix(in srgb, var(--iptv-crit) 16%, transparent); color:var(--iptv-crit); }
    .modal button.danger:hover:not([disabled]) { background:color-mix(in srgb, var(--iptv-crit) 24%, transparent); }
    .view-row { display:flex; align-items:center; gap:8px; }
    .view-k { font-size:11px; color:var(--secondary-text-color); width:96px; flex:none; }
    .view-v { flex:1; min-width:0; font-size:13px; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; user-select:all; }
    .modal button.copy { padding:4px; --mdc-icon-size:16px; width:auto; height:auto; background:none; color:var(--secondary-text-color); }
    .modal button.copy.ok { color:var(--iptv-ok); }
  `;

  static getStubConfig() {
    return {};
  }

  // Visual editor: native Home Assistant form (rendered by HA itself)
  static getConfigForm() {
    var ha = document.querySelector('home-assistant');
    var lang = iptvLang(null, ha?.hass);
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'devices', selector: { device: { integration: IPTV_DOMAIN, multiple: true } } },
        { name: 'warning_days', selector: { number: { min: 1, max: 60, mode: 'box' } } },
        { name: 'language', selector: { select: { mode: 'dropdown', options: [
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'es', label: 'Español' },
        ] } } },
      ],
      computeLabel: (schema) => iptvT(lang, `ed_${schema.name}`),
    };
  }

  setConfig(config) {
    this._config = { warning_days: 7, ...config };
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._sig = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Re-render only when one of our entities, a device name or the language changed
    var parts = [hass.language, !!hass.user?.is_admin];
    this._subs().forEach((sub) => {
      parts.push(`${sub.device}:${sub.name}`);
      Object.keys(sub.ids).forEach((k) => {
        var st = hass.states[sub.ids[k]];
        parts.push(`${k}=${st ? `${st.state}@${st.last_updated}` : ''}`);
      });
    });
    var sig = parts.join('|');
    if (sig === this._sig) return;
    this._sig = sig;
    this._loading = false;
    this._render();
  }

  getGridOptions() {
    return { columns: 6, min_columns: 4, rows: 'auto' };
  }

  getCardSize() {
    var n = Math.max(1, this._hass ? this._subs().length : 1);
    return n > 1 ? 1 + 2 * n : 3;
  }

  _t(key, vars) {
    return iptvT(iptvLang(this._config, this._hass), key, vars);
  }

  _err(code) {
    return iptvErr(iptvLang(this._config, this._hass), code);
  }

  // Devices to show: `devices` (list), the legacy `device`, or every IPTV device
  _wanted() {
    var c = this._config || {};
    var list = [].concat(c.devices || []).filter(Boolean);
    if (!list.length && c.device) list = [c.device];
    return list;
  }

  // [{ device, name, ids: { translation_key: entity_id } }] in the configured order,
  // or sorted by name when every subscription is shown
  _subs() {
    if (!this._hass?.entities) return [];
    var wanted = this._wanted();
    var subs = this._collect(wanted);
    // Configured devices all gone (e.g. account removed, or re-added with a new
    // id): fall back to every subscription instead of showing an empty card
    if (wanted.length && !subs.length) subs = this._collect([]);
    return subs;
  }

  // Subscriptions matching `wanted` (device ids), or all when `wanted` is empty,
  // in the configured order or by name
  _collect(wanted) {
    var byDevice = {};
    Object.values(this._hass.entities).forEach((e) => {
      if (e.platform !== IPTV_DOMAIN || !e.translation_key || !e.device_id) return;
      if (wanted.length && wanted.indexOf(e.device_id) < 0) return;
      (byDevice[e.device_id] = byDevice[e.device_id] || {})[e.translation_key] = e.entity_id;
    });
    var devices = this._hass.devices || {};
    var subs = Object.keys(byDevice).map((id) => {
      var dev = devices[id];
      return { device: id, name: (dev && (dev.name_by_user || dev.name)) || '', ids: byDevice[id] };
    });
    if (wanted.length) subs.sort((a, b) => wanted.indexOf(a.device) - wanted.indexOf(b.device));
    else subs.sort((a, b) => a.name.localeCompare(b.name));
    return subs;
  }

  async _refresh() {
    var ids = [];
    this._subs().forEach((sub) => {
      ids.push(sub.ids.status, sub.ids.health);
    });
    ids = ids.filter(Boolean);
    if (!ids.length || this._loading) return;
    this._loading = true;
    this._refreshFailed = false;
    this._render();
    try {
      await this._hass.callService('homeassistant', 'update_entity', { entity_id: ids });
    } catch (err) {
      // WebSocket down or server error: say so on the button instead of an unhandled rejection
      console.error('iptv-card: refresh failed', err);
      this._refreshFailed = true;
      this._loading = false;
      this._render();
    } finally {
      // A state change re-renders; stop the spinner anyway if nothing changed
      setTimeout(() => {
        if (!this._loading) return;
        this._loading = false;
        this._render();
      }, 2000);
    }
  }

  // Rebuild the account summary of one subscription from its entity states
  _data(ids) {
    if (!ids.status) return null;
    var states = this._hass.states;
    var status = states[ids.status];
    if (!status || status.state === 'unavailable') return { unavailable: true };
    var val = (k) => {
      var st = ids[k] && states[ids[k]];
      return st && st.state !== 'unknown' && st.state !== 'unavailable' ? st.state : null;
    };
    var time = (k) => (val(k) !== null ? Date.parse(val(k)) / 1000 : null);
    var num = (k) => (val(k) !== null ? Number(val(k)) : null);
    return {
      auth: status.state !== 'invalid_auth',
      status: val('status'),
      exp_date: time('expiration'),
      created_at: time('created'),
      is_trial: val('trial') === 'on',
      active_cons: num('active_connections'),
      max_connections: num('max_connections'),
      channels: num('channels'),
      movies: num('movies'),
      series: num('series'),
    };
  }

  // French lists of one subscription: true, false or null (unknown)
  _french(ids) {
    var st = ids.french_lists && this._hass.states[ids.french_lists];
    if (!st || (st.state !== 'on' && st.state !== 'off')) return null;
    return st.state === 'on';
  }

  // Last health check of one subscription: { status, ms } or null
  _health(ids) {
    var st = ids.health && this._hass.states[ids.health];
    if (!st || st.state === 'unknown' || st.state === 'unavailable') return null;
    var attrs = st.attributes || {};
    var ms = attrs.response_time_ms;
    return { status: st.state, ms: ms == null ? null : Number(ms), at: attrs.last_check || null };
  }

  _view(d) {
    if (!d || d.unavailable) return null;
    var exp = d.exp_date ? d.exp_date * 1000 : null;
    var created = d.created_at ? d.created_at * 1000 : null;
    var now = Date.now();
    var daysLeft = exp ? Math.ceil((exp - now) / 86400000) : null;
    var raw = String(d.status || '').toLowerCase();
    var state;
    if (!d.auth) state = 'error';
    else if (raw === 'active' && (daysLeft === null || daysLeft > 0)) {
      state = daysLeft !== null && daysLeft <= this._config.warning_days ? 'warning' : 'ok';
    } else state = 'error';

    var known = ['active', 'expired', 'banned', 'disabled'];
    var statusLabel = !d.auth
      ? this._t('auth_failed')
      : known.indexOf(raw) >= 0 ? this._t(`status_${raw}`) : this._t('status_unknown');
    var pct = null;
    if (exp && created && exp > created) {
      pct = Math.min(100, Math.max(0, ((exp - now) / (exp - created)) * 100));
    } else if (exp && exp > now) {
      // No start date (Stalker portals): assume the shortest usual subscription
      // length (1, 3, 6 or 12 months, then whole years) that covers the time left
      var day = 86400000;
      var left = exp - now;
      var period = [30, 91, 182, 365].map((n) => n * day).find((p) => p >= left) ||
        Math.ceil(left / (365 * day)) * 365 * day;
      pct = Math.min(100, (left / period) * 100);
    }
    return { exp: exp, daysLeft: daysLeft, state: state, statusLabel: statusLabel, pct: pct, d: d };
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var lang = iptvLang(this._config, this._hass);
    var locale = (this._hass?.locale?.language) || lang;
    var fmtDate = (ms) =>
      new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    var nf = new Intl.NumberFormat(locale);
    var esc = iptvEsc;
    var subs = this._hass ? this._subs() : [];
    var multi = subs.length > 1;
    var title = this._config.title || this._t(multi ? 'default_title_multi' : 'default_title');

    var fmtMs = (ms) => (ms < 1000 ? `${nf.format(ms)} ms` : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(ms / 1000)} s`);

    // Health pill: server reachability and response time
    var healthChip = (h, v) => {
      if (!h) return '';
      // Refused credentials are already shown by the status pill
      if (h.status === 'auth_failed' && v && !v.d.auth) return '';
      var cls = { ok: 'ok', degraded: 'warning' }[h.status] || 'error';
      var icon = { ok: 'mdi:lan-connect', degraded: 'mdi:speedometer-slow', stream_ko: 'mdi:television-off' }[h.status] || 'mdi:lan-disconnect';
      var label = this._t(`health_${h.status}`) + (h.ms != null && h.status !== 'unreachable' ? ` · ${fmtMs(h.ms)}` : '');
      return `<span class="chip ${cls}" data-entity="health"><ha-icon icon="${icon}"></ha-icon>${esc(label)}</span>`;
    };

    // French flag pill: French lists found (green) or not (red)
    var frenchChip = (fr) =>
      fr === null || fr === undefined
        ? ''
        : `<span class="chip ${fr ? 'ok' : 'error'} fr" data-entity="french_lists" title="${esc(this._t('french_title'))}"><span class="flag${fr ? '' : ' off'}"></span>${esc(this._t(fr ? 'french_on' : 'french_off'))}</span>`;

    // Status pill of one subscription
    var statusChip = (v) =>
      v ? `<span class="chip ${v.state}" data-entity="status"><ha-icon icon="${iptvStateIcon(v.state)}"></ha-icon>${esc(v.statusLabel)}</span>` : '';
    // Trial, French and health pills of one subscription
    var infoChips = (v, h, fr) =>
      `${v?.d.is_trial ? `<span class="chip idle">${esc(this._t('trial'))}</span>` : ''}${v ? frenchChip(fr) : ''}${healthChip(h, v)}`;
    // Every pill of one subscription, in a row
    var chips = (v, h, fr) => (!v && !h ? '' : `<div class="chips">${statusChip(v)}${infoChips(v, h, fr)}</div>`);

    // Expiration and tiles of one subscription
    var details = (v) => {
      var remaining =
        v.daysLeft === null
          ? this._t('unlimited')
          : v.daysLeft > 0
            ? this._t(v.daysLeft > 1 ? 'days_left' : 'day_left', { n: v.daysLeft })
            : this._t('status_expired');
      var cons =
        v.d.max_connections != null ? `${v.d.active_cons || 0} / ${v.d.max_connections}` : '—';
      var stat = (icon, n, key) => `
          <div class="stat" data-entity="${key}" title="${esc(this._t(key))}">
            <ha-icon icon="${icon}"></ha-icon>
            <div class="num">${n != null ? nf.format(n) : '—'}</div>
          </div>`;
      return `
        <div class="exp" data-entity="expiration">
          <div class="row">
            <span class="lbl">${this._t('expiration')}</span>
            <span class="val">${v.exp ? fmtDate(v.exp) : this._t('never')} <span class="rem ${v.state}">· ${esc(remaining)}</span></span>
          </div>
          ${v.pct !== null ? `<div class="bar"><div class="fill ${v.state}" style="width:${v.pct.toFixed(1)}%"></div></div>` : ''}
        </div>
        <div class="stats">
          ${stat('mdi:television-classic', v.d.channels, 'channels')}
          ${stat('mdi:movie-open', v.d.movies, 'movies')}
          ${stat('mdi:filmstrip-box-multiple', v.d.series, 'series')}
          ${v.d.max_connections != null
            ? `<div class="stat" data-entity="active_connections" title="${esc(this._t('connections'))}">
            <ha-icon icon="mdi:account-multiple"></ha-icon>
            <div class="num">${esc(cons)}</div>
          </div>`
            : ''}
        </div>`;
    };

    var fmtCheck = (iso) => {
      var when = new Date(iso);
      if (Number.isNaN(when.getTime())) return '';
      var sameDay = when.toDateString() === new Date().toDateString();
      return sameDay
        ? when.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
        : when.toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };
    // Account management (view / edit / remove / add) uses admin-only services
    var admin = !!this._hass?.user?.is_admin;
    var footer = (h, i) => `
        <div class="foot">
          ${h?.at
            ? `<div class="checked" data-entity="last_check"><ha-icon icon="mdi:clock-outline"></ha-icon>${esc(this._t('last_check'))} · ${esc(fmtCheck(h.at))}</div>`
            : '<span></span>'}
          ${admin
            ? `<div class="foot-actions">
            <button class="view" data-sub="${i}" title="${esc(this._t('view_btn'))}"><ha-icon icon="mdi:eye-outline"></ha-icon></button>
            <button class="edit" data-sub="${i}" title="${esc(this._t('edit_btn'))}"><ha-icon icon="mdi:pencil"></ha-icon></button>
            <button class="del" data-sub="${i}" title="${esc(this._t('del_btn'))}"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
          </div>`
            : ''}
        </div>`;

    var body;
    // One subscription: its status pill ends the title line, the other pills go under it
    var status = '';
    var info = '';
    // State of each subscription shown (an unreachable one counts as an error), for the header badge
    var states = [];
    if (!this._hass) {
      body = `<div class="msg">${this._t('loading')}</div>`;
    } else if (!subs.length) {
      body = `<div class="msg">${this._t('no_device')}</div>`;
    } else if (!multi) {
      var v = this._view(this._data(subs[0].ids));
      var h0 = this._health(subs[0].ids);
      states.push(v ? v.state : 'error');
      status = statusChip(v);
      info = infoChips(v, h0, this._french(subs[0].ids)).trim();
      if (info) info = `<div class="chips">${info}</div>`;
      body = '<div class="sect" data-sub="0">' +
        (v ? details(v) : `<div class="msg err">${this._t('unavailable')}</div>`) +
        footer(h0, 0) + '</div>';
    } else {
      // Several subscriptions: one section each, named after its device
      body = subs.map((sub, i) => {
        var v = this._view(this._data(sub.ids));
        var h = this._health(sub.ids);
        states.push(v ? v.state : 'error');
        return `
          <div class="sect multi" data-sub="${i}">
            <div class="sect-head">
              <div class="sect-name">${esc(sub.name)}</div>
              ${chips(v, h, this._french(sub.ids))}
            </div>
            ${v ? details(v) : `<div class="msg err">${this._t('unavailable')}</div>`}
            ${footer(h, i)}
          </div>`;
      }).join('');
    }

    if (!this._root) { this._root = document.createElement('div'); this.shadowRoot.appendChild(this._root); }
    this._root.innerHTML = `
      <style>${this.constructor.CSS}</style>
      <ha-card>
        <div class="header">
          ${iptvBadge(iptvWorstState(states))}
          <div class="titles"><div class="title-row"><div class="name">${esc(title)}</div>${status}</div>${info}</div>
          ${admin ? `<button class="add" title="${esc(this._t('add_btn'))}"><ha-icon icon="mdi:plus"></ha-icon></button>` : ''}
          <button class="refresh ${this._loading ? 'spin' : ''}" title="${esc(this._t(this._refreshFailed ? 'err_generic' : 'refresh'))}"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </div>
        ${body}
      </ha-card>`;
    this._root.querySelector('button.refresh').addEventListener('click', () => this._refresh());
    this._root.querySelector('button.add')?.addEventListener('click', () => this._openAdd());
    this._root.querySelectorAll('button.edit').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._openEditor(sub));
    });
    this._root.querySelectorAll('button.del').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._confirmDelete(sub));
    });
    this._root.querySelectorAll('button.view').forEach((el) => {
      var sub = subs[Number(el.dataset.sub)];
      if (sub) el.addEventListener('click', () => this._openView(sub));
    });
    this._bindMoreInfo(subs);
  }

  // [data-entity] elements open their subscription's entity; header pills (single
  // subscription) belong to the first subscription
  _bindMoreInfo(subs) {
    this._root.querySelectorAll('[data-entity]').forEach((el) => {
      var sect = el.closest('[data-sub]');
      var sub = subs[sect ? Number(sect.dataset.sub) : 0];
      var entityId = sub?.ids[el.dataset.entity];
      if (entityId) el.addEventListener('click', () => this._moreInfo(entityId));
    });
  }

  // Open the Home Assistant entity dialog
  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entityId }, bubbles: true, composed: true }));
  }

  // ── Edit credentials popup ────────────────────────────────────────────────
  async _openEditor(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`<h3>${esc(this._t('edit_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
    this._editDevice = sub.device;

    var prefill = await this._ws('edit_account', { device_id: sub.device });
    if (this._modal !== modal) return;
    // not_found / generic: the error, as in the view popup, instead of an empty form
    if (!prefill.ok) return this._modalError(modal, 'edit_title', prefill.error);

    var provider = prefill.provider === 'stalker' ? 'stalker' : 'xtream';
    this._editProvider = provider;
    var field = (key, type, value) => `
      <div class="field">
        <label>${esc(this._t(`edit_${key}`))}</label>
        <input data-k="${key}" type="${type}" value="${esc(value)}" autocomplete="off" autocapitalize="off" spellcheck="false"
               ${type === 'password' ? `placeholder="${esc(this._t('edit_password_keep'))}"` : ''}>
      </div>`;
    var fields =
      provider === 'stalker'
        ? field('url', 'text', prefill.url) + field('mac', 'text', prefill.mac)
        : field('url', 'text', prefill.url) + field('username', 'text', prefill.username) + field('password', 'password', '');
    modal.querySelector('.modal').innerHTML = `
      <h3>${esc(this._t('edit_title'))}</h3>
      ${fields}
      <div class="err"></div>
      <div class="modal-actions">
        <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
        <button class="act primary">${esc(this._t('edit_save'))}</button>
      </div>`;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.primary').addEventListener('click', () => this._submitEditor());
    modal.querySelectorAll('input').forEach((el) => {
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submitEditor(); });
    });
    var firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  _closeEditor() {
    if (this._modal) { this._modal.remove(); this._modal = null; }
  }

  // Call an iptv service that returns a response; {} or {ok:false} on failure
  async _svc(service, data) {
    try {
      var res = await this._hass.callService('iptv', service, data, undefined, false, true);
      return (res?.response) || {};
    } catch (_e) {
      return { ok: false, error: 'generic' };
    }
  }

  // Admin WebSocket command (iptv/<command>): unlike a service call, it fires no
  // call_service event, so the password never reaches the recorder database
  async _ws(command, data) {
    try {
      return (await this._hass.callWS({ type: `iptv/${command}`, ...data })) || {};
    } catch (_e) {
      return { ok: false, error: 'generic' };
    }
  }

  // Open a modal with the given inner HTML (wrapped in .modal) and return it
  _openModal(innerHtml) {
    this._closeEditor();
    var modal = document.createElement('div');
    modal.className = 'backdrop';
    modal.innerHTML = `<div class="modal">${innerHtml}</div>`;
    modal.addEventListener('click', (e) => { if (e.target === modal) this._closeEditor(); });
    this.shadowRoot.appendChild(modal);
    this._modal = modal;
    return modal;
  }

  _confirmDelete(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`
        <h3>${esc(this._t('del_title'))}</h3>
        <div class="hint">${esc(sub.name)} — ${esc(this._t('del_confirm'))}</div>
        <div class="err"></div>
        <div class="modal-actions">
          <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
          <button class="act danger">${esc(this._t('del_delete'))}</button>
        </div>
      `);
    this._delDevice = sub.device;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.danger').addEventListener('click', () => this._deleteAccount());
  }

  async _deleteAccount() {
    var modal = this._modal;
    if (!modal) return;
    var btn = modal.querySelector('.danger');
    var errEl = modal.querySelector('.err');
    errEl.textContent = '';
    btn.setAttribute('disabled', '');
    btn.textContent = this._t('edit_saving');
    var out = await this._svc('remove_account', { device_id: this._delDevice });
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null;
      return;
    }
    btn.removeAttribute('disabled');
    btn.textContent = this._t('del_delete');
    errEl.textContent = this._err(out.error);
  }

  // ── Add account popup ─────────────────────────────────────────────────────
  _openAdd() {
    var esc = iptvEsc;
    var modal = this._openModal(`
        <h3>${esc(this._t('add_title'))}</h3>
        <div class="field">
          <label>${esc(this._t('add_provider'))}</label>
          <select class="prov">
            <option value="xtream">${esc(this._t('add_xtream'))}</option>
            <option value="stalker">${esc(this._t('add_stalker'))}</option>
          </select>
        </div>
        <div class="addfields"></div>
        <div class="err"></div>
        <div class="modal-actions">
          <button class="act cancel">${esc(this._t('edit_cancel'))}</button>
          <button class="act primary">${esc(this._t('add_create'))}</button>
        </div>
      `);
    var sel = modal.querySelector('.prov');
    var renderFields = () => {
      var field = (key, type) => `
        <div class="field">
          <label>${esc(this._t(`edit_${key}`))}</label>
          <input data-k="${key}" type="${type}" autocomplete="off" autocapitalize="off" spellcheck="false">
        </div>`;
      modal.querySelector('.addfields').innerHTML =
        sel.value === 'stalker'
          ? field('url', 'text') + field('mac', 'text')
          : field('url', 'text') + field('username', 'text') + field('password', 'password');
    };
    sel.addEventListener('change', renderFields);
    renderFields();
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    modal.querySelector('.primary').addEventListener('click', () => this._submitAdd());
  }

  async _submitAdd() {
    var modal = this._modal;
    if (!modal) return;
    var provider = modal.querySelector('.prov').value;
    var vals = {};
    modal.querySelectorAll('input[data-k]').forEach((el) => { vals[el.dataset.k] = el.value; });
    var payload = { provider: provider, url: (vals.url || '').trim() };
    if (provider === 'stalker') {
      payload.mac = (vals.mac || '').trim();
    } else {
      payload.username = (vals.username || '').trim();
      payload.password = vals.password || '';
    }
    var errEl = modal.querySelector('.err');
    var btn = modal.querySelector('.primary');
    errEl.textContent = '';
    btn.setAttribute('disabled', '');
    btn.textContent = this._t('edit_saving');
    var out = await this._ws('add_account', payload);
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null;
      return;
    }
    btn.removeAttribute('disabled');
    btn.textContent = this._t('add_create');
    errEl.textContent = this._err(out.error);
  }

  // ── View credentials popup ────────────────────────────────────────────────
  async _openView(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`<h3>${esc(this._t('view_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
    var creds = await this._ws('get_credentials', { device_id: sub.device });
    if (this._modal !== modal) return;
    if (!creds.ok) return this._modalError(modal, 'view_title', creds.error);
    var close = `<div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    var rows = creds.provider === 'stalker'
      ? [['edit_url', creds.url], ['edit_mac', creds.mac]]
      : [['edit_url', creds.url], ['edit_username', creds.username], ['edit_password', creds.password]];
    var rowsHtml = rows.map((r) => `
      <div class="view-row">
        <div class="view-k">${esc(this._t(r[0]))}</div>
        <div class="view-v">${esc(r[1])}</div>
        <button class="copy" title="${esc(this._t('copy'))}"><ha-icon icon="mdi:content-copy"></ha-icon></button>
      </div>`).join('');
    modal.querySelector('.modal').innerHTML = `<h3>${esc(this._t('view_title'))}</h3>${rowsHtml}${close}`;
    // The value stays in a closure: the password is never written into the DOM
    modal.querySelectorAll('button.copy').forEach((el, i) => {
      el.addEventListener('click', () => this._copy(el, rows[i][1]));
    });
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
  }

  // Error message in an open popup, with a close button
  _modalError(modal, titleKey, error) {
    var esc = iptvEsc;
    modal.querySelector('.modal').innerHTML = `<h3>${esc(this._t(titleKey))}</h3><div class="err">${esc(this._err(error))}</div><div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
  }

  async _copy(el, text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_e) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        this.shadowRoot.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      } catch (_e2) { /* ignore */ }
    }
    var icon = el.querySelector('ha-icon');
    icon.setAttribute('icon', 'mdi:check');
    el.classList.add('ok');
    setTimeout(() => { icon.setAttribute('icon', 'mdi:content-copy'); el.classList.remove('ok'); }, 1200);
  }

  async _submitEditor() {
    var modal = this._modal;
    if (!modal) return;
    var vals = {};
    modal.querySelectorAll('input[data-k]').forEach((el) => { vals[el.dataset.k] = el.value; });
    var payload = { device_id: this._editDevice, url: (vals.url || '').trim() };
    if (this._editProvider === 'stalker') {
      payload.mac = (vals.mac || '').trim();
    } else {
      payload.username = (vals.username || '').trim();
      if (vals.password) payload.password = vals.password; // blank keeps the current password
    }
    var errEl = modal.querySelector('.err');
    var primary = modal.querySelector('.primary');
    errEl.textContent = '';
    primary.setAttribute('disabled', '');
    primary.textContent = this._t('edit_saving');
    var out = await this._ws('edit_account', payload);
    if (this._modal !== modal) return;
    if (out.ok) {
      this._closeEditor();
      this._sig = null; // the entry reloaded; re-render on the next state
      return;
    }
    primary.removeAttribute('disabled');
    primary.textContent = this._t('edit_save');
    errEl.textContent = this._err(out.error);
  }
}

// ── iptv-mini-card ────────────────────────────────────────────────────────────
// The full card on two lines: the logo, title and a global status pill, then one chip per
// subscription with its days left. Its detail button (top right, `zoom: false` removes it)
// switches it to the full card and back; a click anywhere else brings it back too, unless it
// lands in a dialog opened from the card (more-info) or a popup of the card is open.
class IptvMiniCard extends IptvCard {
  static CSS = `${IptvCard.CSS}
    .mini { display: flex; align-items: center; gap: 10px; }
    /* Top-aligned: 12 px from the card's top edge, like the other cards (the two lines are taller than the badge) */
    .mini .badge { width: 32px; height: 32px; --mdc-icon-size: 20px; align-self: flex-start; }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .mini .name { flex: 0 1 auto; }
    .head .chip { flex: none; margin-left: auto; }
    .rs { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-left: -4px; }
    .mini .msg { padding: 0; font-size: 12px; }
    button.r { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0 6px 0 4px; border-radius: 999px;
               font-size: 12px; font-weight: 500; line-height: 18px; white-space: nowrap; color: var(--primary-text-color); --mdc-icon-size: 13px; }
    .r ha-icon { color: var(--c); display: inline-flex; }
    .r .fig { font-weight: 400; color: var(--secondary-text-color); }
    .r.warning, .r.error { color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); }
    .r.warning .fig, .r.error .fig { color: inherit; }
    .r:hover { background: color-mix(in srgb, var(--c) 20%, var(--secondary-background-color, transparent)); }
    .r:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    button.zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
                  display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
    .zoom ha-icon { display: inline-flex; }
    .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
    .zoom:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    .header .zoom { align-self: flex-start; margin: 2px -4px 0 -6px; }
  `;

  static getConfigElement() {
    return document.createElement('iptv-mini-card-editor');
  }

  constructor() {
    super();
    this._zoomed = false;
    this._onUnzoom = (ev) => {
      var path = ev.composedPath();
      // An open popup of the card is closed first (its backdrop or buttons), as in the full card
      if (!this._zoomed || this._modal || path.includes(this)) return;
      if (path.some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName))) return;
      this._zoomed = false;
      this._render();
    };
  }

  connectedCallback() {
    document.addEventListener('click', this._onUnzoom, true);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onUnzoom, true);
  }

  setConfig(config) {
    if (config?.zoom != null && typeof config.zoom !== 'boolean') throw new Error('zoom must be true or false');
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    if (this._zoomed) super._render();
    else this._renderMini();
    this._addZoom();
  }

  // Global pill: the worst state of the subscriptions, with how many are in it
  _miniStatus(views) {
    if (!views.length) return '';
    var count = (state) => views.filter((v) => v.state === state).length;
    var n = (key, k) => this._t(k > 1 ? `${key}_plural` : key, { n: k });
    var state;
    var label;
    if (views.every((v) => v.unavailable)) [state, label] = ['error', this._t('unavailable')];
    else if (count('error')) {
      var expired = views.filter((v) => v.expired).length;
      [state, label] = ['error', expired === count('error') ? n('mini_expired', expired) : n('mini_error', count('error'))];
    } else if (count('warning')) [state, label] = ['warning', n('mini_expiring', count('warning'))];
    else [state, label] = ['ok', views.length > 1 ? this._t('mini_all_active') : this._t('status_active')];
    return `<span class="chip ${state}"><ha-icon icon="${iptvStateIcon(state)}"></ha-icon>${iptvEsc(label)}</span>`;
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
    return `<button class="r ${v.state}" data-sub="${i}" data-entity="${entity}" title="${iptvEsc(title)}"><ha-icon icon="${iptvStateIcon(v.state)}"></ha-icon>${iptvEsc(sub.name)} <span class="fig">${iptvEsc(fig)}</span></button>`;
  }

  _renderMini() {
    var subs = this._hass ? this._subs() : [];
    var views = subs.map((sub) => {
      var v = this._view(this._data(sub.ids));
      if (!v) return { unavailable: true, state: 'error' };
      v.expired = v.state === 'error' && v.d.auth && (String(v.d.status).toLowerCase() === 'expired' || (v.daysLeft !== null && v.daysLeft <= 0));
      return v;
    });
    var title = this._config.title || this._t(subs.length > 1 ? 'default_title_multi' : 'default_title');
    var line = !this._hass
      ? `<div class="msg">${this._t('loading')}</div>`
      : !subs.length
        ? `<div class="msg">${this._t('no_device')}</div>`
        : subs.map((sub, i) => this._miniChip(sub, views[i], i)).join('');
    if (!this._root) { this._root = document.createElement('div'); this.shadowRoot.appendChild(this._root); }
    this._root.innerHTML = `
      <style>${this.constructor.CSS}</style>
      <ha-card>
        <div class="mini">
          ${iptvBadge(iptvWorstState(views.map((v) => v.state)))}
          <div class="body">
            <div class="head"><div class="name">${iptvEsc(title)}</div>${this._miniStatus(views)}</div>
            <div class="rs">${line}</div>
          </div>
        </div>
      </ha-card>`;
    this._bindMoreInfo(subs);
  }

  // Detail button at the end of the header, top right in both views
  _addZoom() {
    var head = this._config.zoom !== false && this._root?.querySelector('.head, .header');
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
      if (ev.detail === 0) this._root.querySelector('button.zoom')?.focus();
    });
    head.appendChild(button);
  }
}

// ── iptv-mini-card-editor ─────────────────────────────────────────────────────
// The full card's fields plus the detail button, shown on by default and not written
// to the YAML while it stays on
class IptvMiniCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      var form = IptvCard.getConfigForm();
      var lang = iptvLang(null, this._hass);
      this._form = document.createElement('ha-form');
      this._form.schema = [...form.schema, { name: 'zoom', selector: { boolean: {} } }];
      this._form.computeLabel = (schema) => iptvT(lang, `ed_${schema.name}`);
      this._form.addEventListener('value-changed', (ev) => {
        ev.stopPropagation();
        var value = { ...ev.detail.value };
        if (value.zoom === true) delete value.zoom;
        this._config = value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: value }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = { zoom: true, ...this._config };
  }
}

if (!customElements.get('iptv-mini-card-editor')) {
  customElements.define('iptv-mini-card-editor', IptvMiniCardEditor);
}

// Each card is registered on its own: a page that already loaded an older copy of this
// file (a stale resource or a cached version without the mini card) still gets the mini card
window.customCards = window.customCards || [];
if (!customElements.get('iptv-card')) {
  customElements.define('iptv-card', IptvCard);
  window.customCards.push({
    type: 'iptv-card',
    name: 'IPTV Subscription Card',
    description: 'Status, expiration date, channel, movie and series counts of one or several IPTV subscriptions (Xtream Codes or Stalker).',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });

  console.info(
    `%c IPTV-CARD %c v${IPTV_CARD_VERSION} `,
    'color:white;background:#3f51b5;font-weight:700',
    'color:#3f51b5;background:white',
  );
}
if (!customElements.get('iptv-mini-card')) {
  customElements.define('iptv-mini-card', IptvMiniCard);
  window.customCards.push({
    type: 'iptv-mini-card',
    name: 'IPTV Subscription Mini Card',
    description: 'The IPTV subscriptions on two lines (status and days left of each provider), with a detail button showing the full card.',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-iptv',
  });
}
