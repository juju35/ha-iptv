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
var IPTV_PANEL_VERSION = '3.37.2';

var IptvPanelI18n = {
  en: {
    title: 'IPTV',
    accounts: 'Subscriptions',
    settings: 'Settings',
    none: 'No account yet: add one with “{add}” in the Subscriptions tab.',
    loading: 'Loading…',
    load_failed: 'Could not load: {error}. Trying again on its own.',
    retry: 'Retry',
    f_name: 'Name',
    f_name_hint: 'Leave blank to use the server name',
    f_scan: 'Polling interval',
    f_scan_hint: 'Subscription refresh, {min}–{max} min',
    f_notify: 'Expiration notice',
    f_notify_hint: 'Days before expiration, 0 = off',
    f_health: 'Health check interval',
    f_health_hint: 'Light server request, {min}–{max} min',
    f_stream: 'Test a channel stream during the health check',
    f_stream_hint: 'Uses one connection slot for a few seconds',
    u_min: 'min',
    u_days: 'days',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    check: 'Check now',
    checking: 'Checking…',
    checked_ok: 'Server answered',
    checked_ko: 'Server not reachable',
    cred_username: 'Username',
    cred_mac: 'MAC address',
    cred_password: 'Password',
    cred_show: 'Show the password',
    cred_hide: 'Hide the password',
    cred_copy: 'Copy',
    cred_copied: 'Copied',
    open_device: 'Device',
    open_integration: 'Devices & services',
    err_range: 'Value out of range',
    err_not_found: 'Account not found',
    err_generic: 'Something went wrong',
    st_loaded: 'Running',
    st_setup_retry: 'Retrying',
    st_setup_error: 'Setup failed',
    st_not_loaded: 'Stopped',
    st_other: 'Unavailable',
    remove: 'Remove',
    removing: 'Removing…',
    remove_title: 'Remove this account?',
    remove_msg: '{name} never finished its setup, so it has no device and no card entry. Remove it from Home Assistant?',
    cancel: 'Cancel',
    p_unavailable: 'IPTV server unreachable',
    p_refresh: 'Refresh',
    p_edit_btn: 'Edit credentials',
    p_edit_title: 'Edit account',
    p_edit_url: 'Server URL',
    p_edit_username: 'Username',
    p_edit_password: 'Password',
    p_edit_password_keep: 'Leave blank to keep',
    p_edit_mac: 'MAC address',
    p_edit_save: 'Save',
    p_edit_cancel: 'Cancel',
    p_edit_saving: 'Checking…',
    p_err_invalid_auth: 'Credentials refused',
    p_err_cannot_connect: 'Cannot reach the server',
    p_err_invalid_mac: 'Invalid MAC address',
    p_err_no_french_lists: 'No French list on this provider',
    p_err_french_unknown: 'Could not read the categories',
    p_err_stream_ko: 'The test channel does not play',
    p_err_already_configured: 'Another account already uses these credentials',
    p_err_not_found: 'Account not found',
    p_err_generic: 'Update failed',
    p_err_existing_longer: 'An account valid longer is already on this server',
    p_err_empty_catalogue: 'The provider has no usable catalogue',
    p_del_btn: 'Remove account',
    p_del_title: 'Remove account',
    p_del_confirm: 'The account and its entities will be removed.',
    p_del_delete: 'Delete',
    p_add_btn: 'Add account',
    p_add_title: 'Add account',
    p_add_provider: 'Provider type',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Add',
    p_status_active: 'Active',
    p_status_expired: 'Expired',
    p_status_banned: 'Banned',
    p_status_disabled: 'Disabled',
    p_status_unknown: 'Unknown',
    p_auth_failed: 'Invalid credentials',
    p_trial: 'Trial',
    p_expiration: 'Expiration',
    p_never: 'Never',
    p_unlimited: 'Unlimited',
    p_day_left: '{n} day left',
    p_days_left: '{n} days left',
    p_channels: 'channels',
    p_movies: 'movies',
    p_series: 'series',
    p_connections: 'connections',
    p_french_on: 'FR',
    p_french_off: 'No FR',
    p_french_title: 'French lists',
    p_last_check: 'Last check',
    p_health_ok: 'Online',
    p_health_degraded: 'Slow',
    p_health_unreachable: 'Unreachable',
    p_health_stream_ko: 'Stream down',
    p_health_auth_failed: 'Credentials refused',
    all_accounts: 'All accounts',
    panel_display: 'Panel',
    f_hide_toolbar: 'Hide the top bar',
    f_hide_toolbar_hint: 'The tabs stay; on a phone the sidebar menu moves next to them',
    hide_off: 'No',
    hide_all: 'For everyone',
    hide_non_admin: 'For non-admins',
    p_hero_none: 'No subscription yet',
    p_hero_one: '1 subscription',
    p_hero_many: '{n} subscriptions',
    p_hero_fix: 'To fix: {n}',
    p_hero_ok: 'All fine',
    p_count_active: 'Active: {n}',
    p_count_expiring: 'Expiring soon: {n}',
    p_count_ko: 'With a problem: {n}',
    p_next: 'Next expiration: {name}, {date}',
    p_filter_all: "All: {n}",
    p_tile_fix: "To fix",
    p_tile_expiry: "Next expiration",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} answering",
    p_tile_conn: "Connections",
    p_tile_conn_v: "{a} / {m} in use",
    p_checked: 'Checked {when}',
    p_alert_unreachable: 'The server is not answering: the figures are from the last successful check.',
    p_alert_auth: 'The provider refuses the credentials: edit them in {settings}.',
    p_alert_ended: 'The provider reports this subscription as ended.',
    p_alert_stream: 'The test channel does not play.',
    p_alert_expiring: 'Expires on {date}: renew it in time.',
    g_general: 'General',
    g_accounts: 'Accounts',
    g_credentials: 'Credentials',
    g_account: 'Account',
    g_health: 'Health check',
    panel_display_hint: 'Shared by every user',
    hide_off_hint: 'The IPTV bar stays',
    hide_all_hint: 'The tabs move to the very top',
    hide_non_admin_hint: 'Administrators keep the bar',
  },
  fr: {
    title: 'IPTV',
    accounts: 'Abonnements',
    settings: 'Réglages',
    none: 'Aucun compte : ajoutez-en un avec « {add} » dans l’onglet Abonnements.',
    loading: 'Chargement…',
    load_failed: 'Chargement impossible : {error}. Nouvel essai automatique.',
    retry: 'Réessayer',
    f_name: 'Nom',
    f_name_hint: 'Laisser vide pour reprendre le nom du serveur',
    f_scan: 'Intervalle d’interrogation',
    f_scan_hint: 'Rafraîchissement de l’abonnement, {min}–{max} min',
    f_notify: 'Alerte d’expiration',
    f_notify_hint: 'Jours avant l’expiration, 0 = désactivée',
    f_health: 'Intervalle du contrôle de santé',
    f_health_hint: 'Requête légère au serveur, {min}–{max} min',
    f_stream: 'Tester le flux d’une chaîne pendant le contrôle',
    f_stream_hint: 'Occupe une connexion quelques secondes',
    u_min: 'min',
    u_days: 'jours',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Enregistré',
    check: 'Vérifier maintenant',
    checking: 'Vérification…',
    checked_ok: 'Le serveur répond',
    checked_ko: 'Serveur injoignable',
    cred_username: 'Nom d’utilisateur',
    cred_mac: 'Adresse MAC',
    cred_password: 'Mot de passe',
    cred_show: 'Afficher le mot de passe',
    cred_hide: 'Masquer le mot de passe',
    cred_copy: 'Copier',
    cred_copied: 'Copié',
    open_device: 'Appareil',
    open_integration: 'Appareils et services',
    err_range: 'Valeur hors limites',
    err_not_found: 'Compte introuvable',
    err_generic: 'Une erreur est survenue',
    st_loaded: 'Actif',
    st_setup_retry: 'Nouvelle tentative',
    st_setup_error: 'Échec de configuration',
    st_not_loaded: 'Arrêté',
    st_other: 'Indisponible',
    remove: 'Supprimer',
    removing: 'Suppression…',
    remove_title: 'Supprimer ce compte ?',
    remove_msg: '{name} n’a jamais terminé sa configuration : il n’a ni appareil ni place dans la carte. Le supprimer de Home Assistant ?',
    cancel: 'Annuler',
    p_unavailable: 'Serveur IPTV injoignable',
    p_refresh: 'Actualiser',
    p_edit_btn: 'Modifier les identifiants',
    p_edit_title: 'Modifier le compte',
    p_edit_url: 'URL du serveur',
    p_edit_username: 'Identifiant',
    p_edit_password: 'Mot de passe',
    p_edit_password_keep: 'Laisser vide pour conserver',
    p_edit_mac: 'Adresse MAC',
    p_edit_save: 'Enregistrer',
    p_edit_cancel: 'Annuler',
    p_edit_saving: 'Vérification…',
    p_err_invalid_auth: 'Identifiants refusés',
    p_err_cannot_connect: 'Serveur injoignable',
    p_err_invalid_mac: 'Adresse MAC invalide',
    p_err_no_french_lists: 'Aucune liste française chez ce fournisseur',
    p_err_french_unknown: 'Impossible de lire les catégories',
    p_err_stream_ko: 'La chaîne de test ne se lit pas',
    p_err_already_configured: 'Un autre compte utilise déjà ces identifiants',
    p_err_not_found: 'Compte introuvable',
    p_err_generic: 'Échec de la mise à jour',
    p_err_existing_longer: 'Un compte valide plus longtemps existe déjà sur ce serveur',
    p_err_empty_catalogue: 'Le fournisseur n\'a pas de catalogue exploitable',
    p_del_btn: 'Supprimer le compte',
    p_del_title: 'Supprimer le compte',
    p_del_confirm: 'Le compte et ses entités seront supprimés.',
    p_del_delete: 'Supprimer',
    p_add_btn: 'Ajouter un compte',
    p_add_title: 'Ajouter un compte',
    p_add_provider: 'Type de fournisseur',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Ajouter',
    p_status_active: 'Actif',
    p_status_expired: 'Expiré',
    p_status_banned: 'Banni',
    p_status_disabled: 'Désactivé',
    p_status_unknown: 'Inconnu',
    p_auth_failed: 'Identifiants refusés',
    p_trial: 'Essai',
    p_expiration: 'Expiration',
    p_never: 'Jamais',
    p_unlimited: 'Illimité',
    p_day_left: '{n} jour restant',
    p_days_left: '{n} jours restants',
    p_channels: 'chaînes',
    p_movies: 'films',
    p_series: 'séries',
    p_connections: 'connexions',
    p_french_on: 'FR',
    p_french_off: 'Pas de FR',
    p_french_title: 'Listes françaises',
    p_last_check: 'Dernier contrôle',
    p_health_ok: 'En ligne',
    p_health_degraded: 'Lent',
    p_health_unreachable: 'Injoignable',
    p_health_stream_ko: 'Flux KO',
    p_health_auth_failed: 'Identifiants refusés',
    all_accounts: 'Tous les comptes',
    panel_display: 'Panneau',
    f_hide_toolbar: 'Masquer la barre du haut',
    f_hide_toolbar_hint: 'Les onglets restent ; sur téléphone, le menu latéral passe à côté d’eux',
    hide_off: 'Non',
    hide_all: 'Pour tout le monde',
    hide_non_admin: 'Pour les non-admins',
    p_hero_none: 'Aucun abonnement',
    p_hero_one: '1 abonnement',
    p_hero_many: '{n} abonnements',
    p_hero_fix: 'À traiter : {n}',
    p_hero_ok: 'Tout va bien',
    p_count_active: 'Actifs : {n}',
    p_count_expiring: 'Expirent bientôt : {n}',
    p_count_ko: 'En erreur : {n}',
    p_next: 'Prochaine échéance : {name}, le {date}',
    p_filter_all: "Tous : {n}",
    p_tile_fix: "À corriger",
    p_tile_expiry: "Prochaine expiration",
    p_tile_online: "En ligne",
    p_tile_online_v: "{n} / {t} répondent",
    p_tile_conn: "Connexions",
    p_tile_conn_v: "{a} / {m} utilisées",
    p_checked: 'Vérifié {when}',
    p_alert_unreachable: 'Le serveur ne répond pas : les chiffres sont ceux de la dernière vérification réussie.',
    p_alert_auth: 'Le fournisseur refuse les identifiants : modifiez-les dans {settings}.',
    p_alert_ended: 'Le fournisseur indique que cet abonnement est terminé.',
    p_alert_stream: 'La chaîne de test ne se lit pas.',
    p_alert_expiring: 'Expire le {date} : pensez à le renouveler.',
    g_general: 'Général',
    g_accounts: 'Comptes',
    g_credentials: 'Identifiants',
    g_account: 'Compte',
    g_health: 'Vérification de santé',
    panel_display_hint: 'Commun à tous les utilisateurs',
    hide_off_hint: 'La barre IPTV reste affichée',
    hide_all_hint: 'Les onglets montent tout en haut',
    hide_non_admin_hint: 'Les administrateurs gardent la barre',
  },
  de: {
    title: 'IPTV',
    accounts: 'Abonnements',
    settings: 'Einstellungen',
    none: 'Noch kein Konto: füge eines mit „{add}“ im Tab Abonnements hinzu.',
    loading: 'Wird geladen…',
    load_failed: 'Laden fehlgeschlagen: {error}. Wird automatisch erneut versucht.',
    retry: 'Erneut versuchen',
    f_name: 'Name',
    f_name_hint: 'Leer lassen, um den Servernamen zu verwenden',
    f_scan: 'Abfrageintervall',
    f_scan_hint: 'Aktualisierung des Abonnements, {min}–{max} Min.',
    f_notify: 'Ablaufhinweis',
    f_notify_hint: 'Tage vor Ablauf, 0 = aus',
    f_health: 'Intervall der Serverprüfung',
    f_health_hint: 'Leichte Serveranfrage, {min}–{max} Min.',
    f_stream: 'Bei der Serverprüfung den Stream eines Senders testen',
    f_stream_hint: 'Belegt einige Sekunden lang eine Verbindung',
    u_min: 'Min.',
    u_days: 'Tage',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert',
    check: 'Jetzt prüfen',
    checking: 'Wird geprüft…',
    checked_ok: 'Server antwortet',
    checked_ko: 'Server nicht erreichbar',
    cred_username: 'Benutzername',
    cred_mac: 'MAC-Adresse',
    cred_password: 'Passwort',
    cred_show: 'Passwort anzeigen',
    cred_hide: 'Passwort ausblenden',
    cred_copy: 'Kopieren',
    cred_copied: 'Kopiert',
    open_device: 'Gerät',
    open_integration: 'Geräte & Dienste',
    err_range: 'Wert außerhalb des Bereichs',
    err_not_found: 'Konto nicht gefunden',
    err_generic: 'Etwas ist schiefgelaufen',
    st_loaded: 'Aktiv',
    st_setup_retry: 'Neuer Versuch',
    st_setup_error: 'Einrichtung fehlgeschlagen',
    st_not_loaded: 'Gestoppt',
    st_other: 'Nicht verfügbar',
    remove: 'Entfernen',
    removing: 'Wird entfernt…',
    remove_title: 'Dieses Konto entfernen?',
    remove_msg: '{name} wurde nie fertig eingerichtet und hat daher weder Gerät noch Eintrag in der Karte. Aus Home Assistant entfernen?',
    cancel: 'Abbrechen',
    p_unavailable: 'IPTV-Server nicht erreichbar',
    p_refresh: 'Aktualisieren',
    p_edit_btn: 'Zugangsdaten bearbeiten',
    p_edit_title: 'Konto bearbeiten',
    p_edit_url: 'Server-URL',
    p_edit_username: 'Benutzername',
    p_edit_password: 'Passwort',
    p_edit_password_keep: 'Leer lassen, um es zu behalten',
    p_edit_mac: 'MAC-Adresse',
    p_edit_save: 'Speichern',
    p_edit_cancel: 'Abbrechen',
    p_edit_saving: 'Wird geprüft…',
    p_err_invalid_auth: 'Zugangsdaten abgelehnt',
    p_err_cannot_connect: 'Server nicht erreichbar',
    p_err_invalid_mac: 'Ungültige MAC-Adresse',
    p_err_no_french_lists: 'Keine französische Liste bei diesem Anbieter',
    p_err_french_unknown: 'Kategorien konnten nicht gelesen werden',
    p_err_stream_ko: 'Der Testsender wird nicht abgespielt',
    p_err_already_configured: 'Ein anderes Konto verwendet bereits diese Zugangsdaten',
    p_err_not_found: 'Konto nicht gefunden',
    p_err_generic: 'Aktualisierung fehlgeschlagen',
    p_err_existing_longer: 'Ein länger gültiges Konto existiert bereits auf diesem Server',
    p_err_empty_catalogue: 'Der Anbieter hat keinen nutzbaren Katalog',
    p_del_btn: 'Konto entfernen',
    p_del_title: 'Konto entfernen',
    p_del_confirm: 'Das Konto und seine Entitäten werden entfernt.',
    p_del_delete: 'Löschen',
    p_add_btn: 'Konto hinzufügen',
    p_add_title: 'Konto hinzufügen',
    p_add_provider: 'Anbietertyp',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Hinzufügen',
    p_status_active: 'Aktiv',
    p_status_expired: 'Abgelaufen',
    p_status_banned: 'Gesperrt',
    p_status_disabled: 'Deaktiviert',
    p_status_unknown: 'Unbekannt',
    p_auth_failed: 'Ungültige Zugangsdaten',
    p_trial: 'Testphase',
    p_expiration: 'Ablauf',
    p_never: 'Nie',
    p_unlimited: 'Unbegrenzt',
    p_day_left: 'Noch {n} Tag',
    p_days_left: 'Noch {n} Tage',
    p_channels: 'Sender',
    p_movies: 'Filme',
    p_series: 'Serien',
    p_connections: 'Verbindungen',
    p_french_on: 'FR',
    p_french_off: 'Kein FR',
    p_french_title: 'Französische Listen',
    p_last_check: 'Letzte Prüfung',
    p_health_ok: 'Online',
    p_health_degraded: 'Langsam',
    p_health_unreachable: 'Nicht erreichbar',
    p_health_stream_ko: 'Stream ausgefallen',
    p_health_auth_failed: 'Zugangsdaten abgelehnt',
    all_accounts: 'Alle Konten',
    panel_display: 'Panel',
    f_hide_toolbar: 'Obere Leiste ausblenden',
    f_hide_toolbar_hint: 'Die Tabs bleiben; auf dem Handy rückt das Seitenleistenmenü daneben',
    hide_off: 'Nein',
    hide_all: 'Für alle',
    hide_non_admin: 'Für Nicht-Admins',
    p_hero_none: 'Noch kein Abo',
    p_hero_one: '1 Abo',
    p_hero_many: '{n} Abos',
    p_hero_fix: 'Zu beheben: {n}',
    p_hero_ok: 'Alles in Ordnung',
    p_count_active: 'Aktiv: {n}',
    p_count_expiring: 'Läuft bald ab: {n}',
    p_count_ko: 'Mit Problem: {n}',
    p_next: 'Nächster Ablauf: {name}, am {date}',
    p_filter_all: "Alle: {n}",
    p_tile_fix: "Zu beheben",
    p_tile_expiry: "Nächster Ablauf",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} antworten",
    p_tile_conn: "Verbindungen",
    p_tile_conn_v: "{a} / {m} belegt",
    p_checked: 'Geprüft {when}',
    p_alert_unreachable: 'Der Server antwortet nicht: Die Zahlen stammen von der letzten erfolgreichen Prüfung.',
    p_alert_auth: 'Der Anbieter lehnt die Zugangsdaten ab: Ändern Sie sie unter {settings}.',
    p_alert_ended: 'Der Anbieter meldet dieses Abo als beendet.',
    p_alert_stream: 'Der Testkanal spielt nicht ab.',
    p_alert_expiring: 'Läuft am {date} ab: rechtzeitig verlängern.',
    g_general: 'Allgemein',
    g_accounts: 'Konten',
    g_credentials: 'Zugangsdaten',
    g_account: 'Konto',
    g_health: 'Zustandsprüfung',
    panel_display_hint: 'Für alle Benutzer gleich',
    hide_off_hint: 'Die IPTV-Leiste bleibt',
    hide_all_hint: 'Die Tabs rücken ganz nach oben',
    hide_non_admin_hint: 'Administratoren behalten die Leiste',
  },
  es: {
    title: 'IPTV',
    accounts: 'Suscripciones',
    settings: 'Ajustes',
    none: 'Aún no hay ninguna cuenta: añade una con «{add}» en la pestaña Suscripciones.',
    loading: 'Cargando…',
    load_failed: 'No se pudo cargar: {error}. Se reintenta automáticamente.',
    retry: 'Reintentar',
    f_name: 'Nombre',
    f_name_hint: 'Déjalo vacío para usar el nombre del servidor',
    f_scan: 'Intervalo de consulta',
    f_scan_hint: 'Actualización de la suscripción, {min}–{max} min',
    f_notify: 'Aviso de caducidad',
    f_notify_hint: 'Días antes de la caducidad, 0 = desactivado',
    f_health: 'Intervalo de la comprobación del servidor',
    f_health_hint: 'Consulta ligera al servidor, {min}–{max} min',
    f_stream: 'Probar la emisión de un canal durante la comprobación',
    f_stream_hint: 'Ocupa una conexión durante unos segundos',
    u_min: 'min',
    u_days: 'días',
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    check: 'Comprobar ahora',
    checking: 'Comprobando…',
    checked_ok: 'El servidor responde',
    checked_ko: 'Servidor inaccesible',
    cred_username: 'Usuario',
    cred_mac: 'Dirección MAC',
    cred_password: 'Contraseña',
    cred_show: 'Mostrar la contraseña',
    cred_hide: 'Ocultar la contraseña',
    cred_copy: 'Copiar',
    cred_copied: 'Copiado',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivos y servicios',
    err_range: 'Valor fuera de rango',
    err_not_found: 'Cuenta no encontrada',
    err_generic: 'Algo salió mal',
    st_loaded: 'Activa',
    st_setup_retry: 'Reintentando',
    st_setup_error: 'Error de configuración',
    st_not_loaded: 'Detenida',
    st_other: 'No disponible',
    remove: 'Eliminar',
    removing: 'Eliminando…',
    remove_title: '¿Eliminar esta cuenta?',
    remove_msg: '{name} nunca terminó su configuración, así que no tiene dispositivo ni entrada en la tarjeta. ¿Eliminarla de Home Assistant?',
    cancel: 'Cancelar',
    p_unavailable: 'Servidor IPTV inaccesible',
    p_refresh: 'Actualizar',
    p_edit_btn: 'Editar credenciales',
    p_edit_title: 'Editar cuenta',
    p_edit_url: 'URL del servidor',
    p_edit_username: 'Usuario',
    p_edit_password: 'Contraseña',
    p_edit_password_keep: 'Déjalo vacío para conservarla',
    p_edit_mac: 'Dirección MAC',
    p_edit_save: 'Guardar',
    p_edit_cancel: 'Cancelar',
    p_edit_saving: 'Comprobando…',
    p_err_invalid_auth: 'Credenciales rechazadas',
    p_err_cannot_connect: 'No se puede conectar con el servidor',
    p_err_invalid_mac: 'Dirección MAC no válida',
    p_err_no_french_lists: 'Ninguna lista francesa en este proveedor',
    p_err_french_unknown: 'No se han podido leer las categorías',
    p_err_stream_ko: 'El canal de prueba no se reproduce',
    p_err_already_configured: 'Otra cuenta ya usa estas credenciales',
    p_err_not_found: 'Cuenta no encontrada',
    p_err_generic: 'Error al actualizar',
    p_err_existing_longer: 'Ya existe en este servidor una cuenta válida durante más tiempo',
    p_err_empty_catalogue: 'El proveedor no tiene un catálogo utilizable',
    p_del_btn: 'Eliminar cuenta',
    p_del_title: 'Eliminar cuenta',
    p_del_confirm: 'Se eliminarán la cuenta y sus entidades.',
    p_del_delete: 'Eliminar',
    p_add_btn: 'Añadir cuenta',
    p_add_title: 'Añadir cuenta',
    p_add_provider: 'Tipo de proveedor',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Añadir',
    p_status_active: 'Activa',
    p_status_expired: 'Caducada',
    p_status_banned: 'Bloqueada',
    p_status_disabled: 'Desactivada',
    p_status_unknown: 'Desconocida',
    p_auth_failed: 'Credenciales no válidas',
    p_trial: 'Prueba',
    p_expiration: 'Caducidad',
    p_never: 'Nunca',
    p_unlimited: 'Ilimitada',
    p_day_left: 'Queda {n} día',
    p_days_left: 'Quedan {n} días',
    p_channels: 'canales',
    p_movies: 'películas',
    p_series: 'series',
    p_connections: 'conexiones',
    p_french_on: 'FR',
    p_french_off: 'Sin FR',
    p_french_title: 'Listas francesas',
    p_last_check: 'Última comprobación',
    p_health_ok: 'En línea',
    p_health_degraded: 'Lento',
    p_health_unreachable: 'Inaccesible',
    p_health_stream_ko: 'Flujo caído',
    p_health_auth_failed: 'Credenciales rechazadas',
    all_accounts: 'Todas las cuentas',
    panel_display: 'Panel',
    f_hide_toolbar: 'Ocultar la barra superior',
    f_hide_toolbar_hint: 'Las pestañas se mantienen; en el móvil, el menú lateral pasa junto a ellas',
    hide_off: 'No',
    hide_all: 'Para todos',
    hide_non_admin: 'Para no administradores',
    p_hero_none: 'Aún no hay suscripciones',
    p_hero_one: '1 suscripción',
    p_hero_many: '{n} suscripciones',
    p_hero_fix: 'Por resolver: {n}',
    p_hero_ok: 'Todo en orden',
    p_count_active: 'Activas: {n}',
    p_count_expiring: 'Caducan pronto: {n}',
    p_count_ko: 'Con problemas: {n}',
    p_next: 'Próximo vencimiento: {name}, el {date}',
    p_filter_all: "Todos: {n}",
    p_tile_fix: "Por corregir",
    p_tile_expiry: "Próximo vencimiento",
    p_tile_online: "En línea",
    p_tile_online_v: "{n} / {t} responden",
    p_tile_conn: "Conexiones",
    p_tile_conn_v: "{a} / {m} en uso",
    p_checked: 'Comprobado {when}',
    p_alert_unreachable: 'El servidor no responde: las cifras son de la última comprobación correcta.',
    p_alert_auth: 'El proveedor rechaza las credenciales: modifícalas en {settings}.',
    p_alert_ended: 'El proveedor indica que esta suscripción ha terminado.',
    p_alert_stream: 'El canal de prueba no se reproduce.',
    p_alert_expiring: 'Caduca el {date}: renuévala a tiempo.',
    g_general: 'General',
    g_accounts: 'Cuentas',
    g_credentials: 'Credenciales',
    g_account: 'Cuenta',
    g_health: 'Comprobación de estado',
    panel_display_hint: 'Común a todos los usuarios',
    hide_off_hint: 'La barra IPTV se mantiene',
    hide_all_hint: 'Las pestañas suben arriba del todo',
    hide_non_admin_hint: 'Los administradores conservan la barra',
  },
  it: {
    title: 'IPTV',
    accounts: 'Abbonamenti',
    settings: 'Impostazioni',
    none: 'Ancora nessun account: aggiungine uno con «{add}» nella scheda Abbonamenti.',
    loading: 'Caricamento…',
    load_failed: 'Caricamento non riuscito: {error}. Nuovo tentativo automatico.',
    retry: 'Riprova',
    f_name: 'Nome',
    f_name_hint: 'Lascia vuoto per usare il nome del server',
    f_scan: 'Intervallo di aggiornamento',
    f_scan_hint: 'Aggiornamento dell’abbonamento, {min}–{max} min',
    f_notify: 'Avviso di scadenza',
    f_notify_hint: 'Giorni prima della scadenza, 0 = disattivato',
    f_health: 'Intervallo del controllo del server',
    f_health_hint: 'Richiesta leggera al server, {min}–{max} min',
    f_stream: 'Prova lo stream di un canale durante il controllo',
    f_stream_hint: 'Occupa una connessione per qualche secondo',
    u_min: 'min',
    u_days: 'giorni',
    save: 'Salva',
    saving: 'Salvataggio…',
    saved: 'Salvato',
    check: 'Controlla ora',
    checking: 'Verifica…',
    checked_ok: 'Il server ha risposto',
    checked_ko: 'Server non raggiungibile',
    cred_username: 'Nome utente',
    cred_mac: 'Indirizzo MAC',
    cred_password: 'Password',
    cred_show: 'Mostra la password',
    cred_hide: 'Nascondi la password',
    cred_copy: 'Copia',
    cred_copied: 'Copiato',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivi e servizi',
    err_range: 'Valore fuori intervallo',
    err_not_found: 'Account non trovato',
    err_generic: 'Si è verificato un errore',
    st_loaded: 'In esecuzione',
    st_setup_retry: 'Nuovo tentativo',
    st_setup_error: 'Configurazione non riuscita',
    st_not_loaded: 'Arrestato',
    st_other: 'Non disponibile',
    remove: 'Rimuovi',
    removing: 'Rimozione…',
    remove_title: 'Rimuovere questo account?',
    remove_msg: '{name} non ha mai completato la configurazione, quindi non ha né dispositivo né voce nella scheda. Rimuoverlo da Home Assistant?',
    cancel: 'Annulla',
    p_unavailable: 'Server IPTV non raggiungibile',
    p_refresh: 'Aggiorna',
    p_edit_btn: 'Modifica le credenziali',
    p_edit_title: 'Modifica l’account',
    p_edit_url: 'URL del server',
    p_edit_username: 'Nome utente',
    p_edit_password: 'Password',
    p_edit_password_keep: 'Lascia vuoto per mantenerla',
    p_edit_mac: 'Indirizzo MAC',
    p_edit_save: 'Salva',
    p_edit_cancel: 'Annulla',
    p_edit_saving: 'Verifica…',
    p_err_invalid_auth: 'Credenziali rifiutate',
    p_err_cannot_connect: 'Impossibile raggiungere il server',
    p_err_invalid_mac: 'Indirizzo MAC non valido',
    p_err_no_french_lists: 'Nessuna lista francese presso questo fornitore',
    p_err_french_unknown: 'Impossibile leggere le categorie',
    p_err_stream_ko: 'Il canale di prova non viene riprodotto',
    p_err_already_configured: 'Un altro account usa già queste credenziali',
    p_err_not_found: 'Account non trovato',
    p_err_generic: 'Aggiornamento non riuscito',
    p_err_existing_longer: 'Su questo server esiste già un account valido più a lungo',
    p_err_empty_catalogue: 'Il fornitore non ha un catalogo utilizzabile',
    p_del_btn: 'Rimuovi l’account',
    p_del_title: 'Rimuovi l’account',
    p_del_confirm: 'L’account e le sue entità verranno rimossi.',
    p_del_delete: 'Elimina',
    p_add_btn: 'Aggiungi un account',
    p_add_title: 'Aggiungi un account',
    p_add_provider: 'Tipo di fornitore',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Aggiungi',
    p_status_active: 'Attivo',
    p_status_expired: 'Scaduto',
    p_status_banned: 'Bloccato',
    p_status_disabled: 'Disattivato',
    p_status_unknown: 'Sconosciuto',
    p_auth_failed: 'Credenziali non valide',
    p_trial: 'Prova',
    p_expiration: 'Scadenza',
    p_never: 'Mai',
    p_unlimited: 'Illimitato',
    p_day_left: '{n} giorno rimanente',
    p_days_left: '{n} giorni rimanenti',
    p_channels: 'canali',
    p_movies: 'film',
    p_series: 'serie',
    p_connections: 'connessioni',
    p_french_on: 'FR',
    p_french_off: 'Niente FR',
    p_french_title: 'Liste francesi',
    p_last_check: 'Ultimo controllo',
    p_health_ok: 'Online',
    p_health_degraded: 'Lento',
    p_health_unreachable: 'Non raggiungibile',
    p_health_stream_ko: 'Stream KO',
    p_health_auth_failed: 'Credenziali rifiutate',
    all_accounts: 'Tutti gli account',
    panel_display: 'Pannello',
    f_hide_toolbar: 'Nascondi la barra superiore',
    f_hide_toolbar_hint: 'Le schede restano; sul telefono il menu laterale passa accanto a loro',
    hide_off: 'No',
    hide_all: 'Per tutti',
    hide_non_admin: 'Per i non amministratori',
    p_hero_none: 'Nessun abbonamento',
    p_hero_one: '1 abbonamento',
    p_hero_many: '{n} abbonamenti',
    p_hero_fix: 'Da risolvere: {n}',
    p_hero_ok: 'Tutto a posto',
    p_count_active: 'Attivi: {n}',
    p_count_expiring: 'In scadenza: {n}',
    p_count_ko: 'Con problemi: {n}',
    p_next: 'Prossima scadenza: {name}, il {date}',
    p_filter_all: "Tutti: {n}",
    p_tile_fix: "Da correggere",
    p_tile_expiry: "Prossima scadenza",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} rispondono",
    p_tile_conn: "Connessioni",
    p_tile_conn_v: "{a} / {m} in uso",
    p_checked: 'Controllato {when}',
    p_alert_unreachable: 'Il server non risponde: i dati sono quelli dell’ultimo controllo riuscito.',
    p_alert_auth: 'Il fornitore rifiuta le credenziali: modificale in {settings}.',
    p_alert_ended: 'Il fornitore indica che questo abbonamento è terminato.',
    p_alert_stream: 'Il canale di prova non si riproduce.',
    p_alert_expiring: 'Scade il {date}: rinnovalo in tempo.',
    g_general: 'Generale',
    g_accounts: 'Account',
    g_credentials: 'Credenziali',
    g_account: 'Account',
    g_health: 'Controllo di stato',
    panel_display_hint: 'Comune a tutti gli utenti',
    hide_off_hint: 'La barra IPTV resta visibile',
    hide_all_hint: 'Le schede salgono in cima',
    hide_non_admin_hint: 'Gli amministratori mantengono la barra',
  },
  nl: {
    title: 'IPTV',
    accounts: 'Abonnementen',
    settings: 'Instellingen',
    none: 'Nog geen account: voeg er een toe met ‘{add}’ op het tabblad Abonnementen.',
    loading: 'Laden…',
    load_failed: 'Laden mislukt: {error}. Wordt automatisch opnieuw geprobeerd.',
    retry: 'Opnieuw proberen',
    f_name: 'Naam',
    f_name_hint: 'Leeg laten om de servernaam te gebruiken',
    f_scan: 'Bevragingsinterval',
    f_scan_hint: 'Vernieuwen van het abonnement, {min}–{max} min',
    f_notify: 'Melding bij verlopen',
    f_notify_hint: 'Dagen voor het verlopen, 0 = uit',
    f_health: 'Interval van de servercontrole',
    f_health_hint: 'Lichte aanvraag aan de server, {min}–{max} min',
    f_stream: 'Stream van een zender testen tijdens de controle',
    f_stream_hint: 'Gebruikt enkele seconden één verbinding',
    u_min: 'min',
    u_days: 'dagen',
    save: 'Opslaan',
    saving: 'Opslaan…',
    saved: 'Opgeslagen',
    check: 'Nu controleren',
    checking: 'Controleren…',
    checked_ok: 'Server heeft geantwoord',
    checked_ko: 'Server onbereikbaar',
    cred_username: 'Gebruikersnaam',
    cred_mac: 'MAC-adres',
    cred_password: 'Wachtwoord',
    cred_show: 'Wachtwoord tonen',
    cred_hide: 'Wachtwoord verbergen',
    cred_copy: 'Kopiëren',
    cred_copied: 'Gekopieerd',
    open_device: 'Apparaat',
    open_integration: 'Apparaten & diensten',
    err_range: 'Waarde buiten bereik',
    err_not_found: 'Account niet gevonden',
    err_generic: 'Er is iets misgegaan',
    st_loaded: 'Actief',
    st_setup_retry: 'Nieuwe poging',
    st_setup_error: 'Instellen mislukt',
    st_not_loaded: 'Gestopt',
    st_other: 'Niet beschikbaar',
    remove: 'Verwijderen',
    removing: 'Verwijderen…',
    remove_title: 'Dit account verwijderen?',
    remove_msg: '{name} is nooit volledig ingesteld en heeft dus geen apparaat en geen plek in de kaart. Verwijderen uit Home Assistant?',
    cancel: 'Annuleren',
    p_unavailable: 'IPTV-server onbereikbaar',
    p_refresh: 'Vernieuwen',
    p_edit_btn: 'Inloggegevens bewerken',
    p_edit_title: 'Account bewerken',
    p_edit_url: 'Server-URL',
    p_edit_username: 'Gebruikersnaam',
    p_edit_password: 'Wachtwoord',
    p_edit_password_keep: 'Leeg laten om te behouden',
    p_edit_mac: 'MAC-adres',
    p_edit_save: 'Opslaan',
    p_edit_cancel: 'Annuleren',
    p_edit_saving: 'Controleren…',
    p_err_invalid_auth: 'Inloggegevens geweigerd',
    p_err_cannot_connect: 'Kan de server niet bereiken',
    p_err_invalid_mac: 'Ongeldig MAC-adres',
    p_err_no_french_lists: 'Geen Franse lijst bij deze provider',
    p_err_french_unknown: 'Kon de categorieën niet lezen',
    p_err_stream_ko: 'Het testkanaal speelt niet af',
    p_err_already_configured: 'Een ander account gebruikt deze inloggegevens al',
    p_err_not_found: 'Account niet gevonden',
    p_err_generic: 'Bijwerken mislukt',
    p_err_existing_longer: 'Op deze server staat al een account dat langer geldig is',
    p_err_empty_catalogue: 'De provider heeft geen bruikbare catalogus',
    p_del_btn: 'Account verwijderen',
    p_del_title: 'Account verwijderen',
    p_del_confirm: 'Het account en zijn entiteiten worden verwijderd.',
    p_del_delete: 'Verwijderen',
    p_add_btn: 'Account toevoegen',
    p_add_title: 'Account toevoegen',
    p_add_provider: 'Type provider',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Toevoegen',
    p_status_active: 'Actief',
    p_status_expired: 'Verlopen',
    p_status_banned: 'Geblokkeerd',
    p_status_disabled: 'Uitgeschakeld',
    p_status_unknown: 'Onbekend',
    p_auth_failed: 'Ongeldige inloggegevens',
    p_trial: 'Proef',
    p_expiration: 'Vervaldatum',
    p_never: 'Nooit',
    p_unlimited: 'Onbeperkt',
    p_day_left: 'Nog {n} dag',
    p_days_left: 'Nog {n} dagen',
    p_channels: 'zenders',
    p_movies: 'films',
    p_series: 'series',
    p_connections: 'verbindingen',
    p_french_on: 'FR',
    p_french_off: 'Geen FR',
    p_french_title: 'Franse lijsten',
    p_last_check: 'Laatste controle',
    p_health_ok: 'Online',
    p_health_degraded: 'Traag',
    p_health_unreachable: 'Onbereikbaar',
    p_health_stream_ko: 'Geen stream',
    p_health_auth_failed: 'Inloggegevens geweigerd',
    all_accounts: 'Alle accounts',
    panel_display: 'Paneel',
    f_hide_toolbar: 'Bovenste balk verbergen',
    f_hide_toolbar_hint: 'De tabbladen blijven; op een telefoon komt het zijbalkmenu ernaast',
    hide_off: 'Nee',
    hide_all: 'Voor iedereen',
    hide_non_admin: 'Voor niet-beheerders',
    p_hero_none: 'Nog geen abonnement',
    p_hero_one: '1 abonnement',
    p_hero_many: '{n} abonnementen',
    p_hero_fix: 'Op te lossen: {n}',
    p_hero_ok: 'Alles in orde',
    p_count_active: 'Actief: {n}',
    p_count_expiring: 'Verloopt binnenkort: {n}',
    p_count_ko: 'Met probleem: {n}',
    p_next: 'Volgende vervaldatum: {name}, op {date}',
    p_filter_all: "Alle: {n}",
    p_tile_fix: "Te herstellen",
    p_tile_expiry: "Volgende vervaldatum",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} antwoorden",
    p_tile_conn: "Verbindingen",
    p_tile_conn_v: "{a} / {m} in gebruik",
    p_checked: 'Gecontroleerd {when}',
    p_alert_unreachable: 'De server reageert niet: de cijfers zijn van de laatste geslaagde controle.',
    p_alert_auth: 'De aanbieder weigert de inloggegevens: wijzig ze in {settings}.',
    p_alert_ended: 'De aanbieder meldt dat dit abonnement is beëindigd.',
    p_alert_stream: 'Het testkanaal speelt niet af.',
    p_alert_expiring: 'Verloopt op {date}: verleng op tijd.',
    g_general: 'Algemeen',
    g_accounts: 'Accounts',
    g_credentials: 'Inloggegevens',
    g_account: 'Account',
    g_health: 'Statuscontrole',
    panel_display_hint: 'Gedeeld door alle gebruikers',
    hide_off_hint: 'De IPTV-balk blijft staan',
    hide_all_hint: 'De tabbladen gaan helemaal naar boven',
    hide_non_admin_hint: 'Beheerders houden de balk',
  },
  pt: {
    title: 'IPTV',
    accounts: 'Subscrições',
    settings: 'Definições',
    none: 'Ainda não há contas: adicione uma com «{add}» no separador Subscrições.',
    loading: 'A carregar…',
    load_failed: 'Não foi possível carregar: {error}. Nova tentativa automática.',
    retry: 'Tentar novamente',
    f_name: 'Nome',
    f_name_hint: 'Deixe em branco para usar o nome do servidor',
    f_scan: 'Intervalo de consulta',
    f_scan_hint: 'Atualização da subscrição, {min}–{max} min',
    f_notify: 'Aviso de expiração',
    f_notify_hint: 'Dias antes da expiração, 0 = desativado',
    f_health: 'Intervalo da verificação do servidor',
    f_health_hint: 'Pedido leve ao servidor, {min}–{max} min',
    f_stream: 'Testar o stream de um canal durante a verificação',
    f_stream_hint: 'Ocupa uma ligação durante alguns segundos',
    u_min: 'min',
    u_days: 'dias',
    save: 'Guardar',
    saving: 'A guardar…',
    saved: 'Guardado',
    check: 'Verificar agora',
    checking: 'A verificar…',
    checked_ok: 'O servidor respondeu',
    checked_ko: 'Servidor inacessível',
    cred_username: 'Nome de utilizador',
    cred_mac: 'Endereço MAC',
    cred_password: 'Palavra-passe',
    cred_show: 'Mostrar a palavra-passe',
    cred_hide: 'Ocultar a palavra-passe',
    cred_copy: 'Copiar',
    cred_copied: 'Copiado',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivos e serviços',
    err_range: 'Valor fora do intervalo',
    err_not_found: 'Conta não encontrada',
    err_generic: 'Ocorreu um erro',
    st_loaded: 'Em execução',
    st_setup_retry: 'Nova tentativa',
    st_setup_error: 'Falha na configuração',
    st_not_loaded: 'Parado',
    st_other: 'Indisponível',
    remove: 'Remover',
    removing: 'A remover…',
    remove_title: 'Remover esta conta?',
    remove_msg: '{name} nunca concluiu a configuração, por isso não tem dispositivo nem entrada no cartão. Removê-la do Home Assistant?',
    cancel: 'Cancelar',
    p_unavailable: 'Servidor IPTV inacessível',
    p_refresh: 'Atualizar',
    p_edit_btn: 'Editar as credenciais',
    p_edit_title: 'Editar a conta',
    p_edit_url: 'URL do servidor',
    p_edit_username: 'Nome de utilizador',
    p_edit_password: 'Palavra-passe',
    p_edit_password_keep: 'Deixe em branco para manter',
    p_edit_mac: 'Endereço MAC',
    p_edit_save: 'Guardar',
    p_edit_cancel: 'Cancelar',
    p_edit_saving: 'A verificar…',
    p_err_invalid_auth: 'Credenciais recusadas',
    p_err_cannot_connect: 'Não é possível contactar o servidor',
    p_err_invalid_mac: 'Endereço MAC inválido',
    p_err_no_french_lists: 'Nenhuma lista francesa neste fornecedor',
    p_err_french_unknown: 'Não foi possível ler as categorias',
    p_err_stream_ko: 'O canal de teste não é reproduzido',
    p_err_already_configured: 'Outra conta já utiliza estas credenciais',
    p_err_not_found: 'Conta não encontrada',
    p_err_generic: 'Falha na atualização',
    p_err_existing_longer: 'Já existe neste servidor uma conta válida durante mais tempo',
    p_err_empty_catalogue: 'O fornecedor não tem um catálogo utilizável',
    p_del_btn: 'Remover a conta',
    p_del_title: 'Remover a conta',
    p_del_confirm: 'A conta e as suas entidades serão removidas.',
    p_del_delete: 'Eliminar',
    p_add_btn: 'Adicionar conta',
    p_add_title: 'Adicionar conta',
    p_add_provider: 'Tipo de fornecedor',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Adicionar',
    p_status_active: 'Ativa',
    p_status_expired: 'Expirada',
    p_status_banned: 'Banida',
    p_status_disabled: 'Desativada',
    p_status_unknown: 'Desconhecida',
    p_auth_failed: 'Credenciais inválidas',
    p_trial: 'Teste',
    p_expiration: 'Expiração',
    p_never: 'Nunca',
    p_unlimited: 'Ilimitada',
    p_day_left: 'Falta {n} dia',
    p_days_left: 'Faltam {n} dias',
    p_channels: 'canais',
    p_movies: 'filmes',
    p_series: 'séries',
    p_connections: 'ligações',
    p_french_on: 'FR',
    p_french_off: 'Sem FR',
    p_french_title: 'Listas francesas',
    p_last_check: 'Última verificação',
    p_health_ok: 'Online',
    p_health_degraded: 'Lento',
    p_health_unreachable: 'Inacessível',
    p_health_stream_ko: 'Sem stream',
    p_health_auth_failed: 'Credenciais recusadas',
    all_accounts: 'Todas as contas',
    panel_display: 'Painel',
    f_hide_toolbar: 'Ocultar a barra superior',
    f_hide_toolbar_hint: 'Os separadores mantêm-se; no telemóvel, o menu lateral passa para junto deles',
    hide_off: 'Não',
    hide_all: 'Para todos',
    hide_non_admin: 'Para não administradores',
    p_hero_none: 'Ainda sem subscrições',
    p_hero_one: '1 subscrição',
    p_hero_many: '{n} subscrições',
    p_hero_fix: 'Por resolver: {n}',
    p_hero_ok: 'Tudo em ordem',
    p_count_active: 'Ativas: {n}',
    p_count_expiring: 'Expiram em breve: {n}',
    p_count_ko: 'Com problemas: {n}',
    p_next: 'Próxima expiração: {name}, a {date}',
    p_filter_all: "Todos: {n}",
    p_tile_fix: "A corrigir",
    p_tile_expiry: "Próxima expiração",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} respondem",
    p_tile_conn: "Ligações",
    p_tile_conn_v: "{a} / {m} em uso",
    p_checked: 'Verificado {when}',
    p_alert_unreachable: 'O servidor não responde: os números são da última verificação bem-sucedida.',
    p_alert_auth: 'O fornecedor recusa as credenciais: altere-as em {settings}.',
    p_alert_ended: 'O fornecedor indica que esta subscrição terminou.',
    p_alert_stream: 'O canal de teste não reproduz.',
    p_alert_expiring: 'Expira a {date}: renove-a a tempo.',
    g_general: 'Geral',
    g_accounts: 'Contas',
    g_credentials: 'Credenciais',
    g_account: 'Conta',
    g_health: 'Verificação de estado',
    panel_display_hint: 'Comum a todos os utilizadores',
    hide_off_hint: 'A barra IPTV mantém-se',
    hide_all_hint: 'Os separadores sobem ao topo',
    hide_non_admin_hint: 'Os administradores mantêm a barra',
  },
  pl: {
    title: 'IPTV',
    accounts: 'Subskrypcje',
    settings: 'Ustawienia',
    none: 'Brak kont: dodaj je przyciskiem „{add}” na karcie Subskrypcje.',
    loading: 'Ładowanie…',
    load_failed: 'Nie udało się wczytać: {error}. Ponowna próba automatycznie.',
    retry: 'Spróbuj ponownie',
    f_name: 'Nazwa',
    f_name_hint: 'Pozostaw puste, aby użyć nazwy serwera',
    f_scan: 'Interwał odpytywania',
    f_scan_hint: 'Odświeżanie subskrypcji, {min}–{max} min',
    f_notify: 'Powiadomienie o wygaśnięciu',
    f_notify_hint: 'Dni przed wygaśnięciem, 0 = wyłączone',
    f_health: 'Interwał sprawdzania serwera',
    f_health_hint: 'Lekkie zapytanie do serwera, {min}–{max} min',
    f_stream: 'Testuj strumień kanału podczas sprawdzania',
    f_stream_hint: 'Zajmuje jedno połączenie na kilka sekund',
    u_min: 'min',
    u_days: 'dni',
    save: 'Zapisz',
    saving: 'Zapisywanie…',
    saved: 'Zapisano',
    check: 'Sprawdź teraz',
    checking: 'Sprawdzanie…',
    checked_ok: 'Serwer odpowiedział',
    checked_ko: 'Serwer jest nieosiągalny',
    cred_username: 'Nazwa użytkownika',
    cred_mac: 'Adres MAC',
    cred_password: 'Hasło',
    cred_show: 'Pokaż hasło',
    cred_hide: 'Ukryj hasło',
    cred_copy: 'Kopiuj',
    cred_copied: 'Skopiowano',
    open_device: 'Urządzenie',
    open_integration: 'Urządzenia oraz usługi',
    err_range: 'Wartość poza zakresem',
    err_not_found: 'Nie znaleziono konta',
    err_generic: 'Coś poszło nie tak',
    st_loaded: 'Działa',
    st_setup_retry: 'Ponowna próba',
    st_setup_error: 'Konfiguracja nie powiodła się',
    st_not_loaded: 'Zatrzymano',
    st_other: 'Niedostępne',
    remove: 'Usuń',
    removing: 'Usuwanie…',
    remove_title: 'Usunąć to konto?',
    remove_msg: '{name} nigdy nie zakończyło konfiguracji, więc nie ma urządzenia ani wpisu na karcie. Usunąć je z Home Assistant?',
    cancel: 'Anuluj',
    p_unavailable: 'Serwer IPTV jest nieosiągalny',
    p_refresh: 'Odśwież',
    p_edit_btn: 'Edytuj dane logowania',
    p_edit_title: 'Edytuj konto',
    p_edit_url: 'URL serwera',
    p_edit_username: 'Nazwa użytkownika',
    p_edit_password: 'Hasło',
    p_edit_password_keep: 'Pozostaw puste, aby zachować',
    p_edit_mac: 'Adres MAC',
    p_edit_save: 'Zapisz',
    p_edit_cancel: 'Anuluj',
    p_edit_saving: 'Sprawdzanie…',
    p_err_invalid_auth: 'Dane logowania odrzucone',
    p_err_cannot_connect: 'Nie można połączyć się z serwerem',
    p_err_invalid_mac: 'Nieprawidłowy adres MAC',
    p_err_no_french_lists: 'Ten dostawca nie ma francuskiej listy',
    p_err_french_unknown: 'Nie udało się odczytać kategorii',
    p_err_stream_ko: 'Kanał testowy się nie odtwarza',
    p_err_already_configured: 'Inne konto używa już tych danych logowania',
    p_err_not_found: 'Nie znaleziono konta',
    p_err_generic: 'Aktualizacja nie powiodła się',
    p_err_existing_longer: 'Na tym serwerze istnieje już konto ważne dłużej',
    p_err_empty_catalogue: 'Dostawca nie ma użytecznego katalogu',
    p_del_btn: 'Usuń konto',
    p_del_title: 'Usuń konto',
    p_del_confirm: 'Konto i jego encje zostaną usunięte.',
    p_del_delete: 'Usuń',
    p_add_btn: 'Dodaj konto',
    p_add_title: 'Dodaj konto',
    p_add_provider: 'Typ dostawcy',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Dodaj',
    p_status_active: 'Aktywna',
    p_status_expired: 'Wygasła',
    p_status_banned: 'Zablokowana',
    p_status_disabled: 'Wyłączona',
    p_status_unknown: 'Nieznana',
    p_auth_failed: 'Nieprawidłowe dane logowania',
    p_trial: 'Próbny',
    p_expiration: 'Wygaśnięcie',
    p_never: 'Nigdy',
    p_unlimited: 'Bez limitu',
    p_day_left: 'Pozostało dni: {n}',
    p_days_left: 'Pozostało dni: {n}',
    p_channels: 'kanały',
    p_movies: 'filmy',
    p_series: 'seriale',
    p_connections: 'połączenia',
    p_french_on: 'FR',
    p_french_off: 'Bez FR',
    p_french_title: 'Listy francuskie',
    p_last_check: 'Ostatnie sprawdzenie',
    p_health_ok: 'Online',
    p_health_degraded: 'Wolny',
    p_health_unreachable: 'Nieosiągalny',
    p_health_stream_ko: 'Brak streamu',
    p_health_auth_failed: 'Dane logowania odrzucone',
    all_accounts: 'Wszystkie konta',
    panel_display: 'Panel',
    f_hide_toolbar: 'Ukryj górny pasek',
    f_hide_toolbar_hint: 'Karty pozostają; na telefonie menu boczne przechodzi obok nich',
    hide_off: 'Nie',
    hide_all: 'Dla wszystkich',
    hide_non_admin: 'Dla nie-administratorów',
    p_hero_none: 'Brak subskrypcji',
    p_hero_one: '1 subskrypcja',
    p_hero_many: 'Subskrypcje: {n}',
    p_hero_fix: 'Do naprawy: {n}',
    p_hero_ok: 'Wszystko w porządku',
    p_count_active: 'Aktywne: {n}',
    p_count_expiring: 'Wkrótce wygasają: {n}',
    p_count_ko: 'Z problemem: {n}',
    p_next: 'Najbliższe wygaśnięcie: {name}, {date}',
    p_filter_all: "Wszystkie: {n}",
    p_tile_fix: "Do naprawy",
    p_tile_expiry: "Najbliższe wygaśnięcie",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} odpowiada",
    p_tile_conn: "Połączenia",
    p_tile_conn_v: "{a} / {m} w użyciu",
    p_checked: 'Sprawdzono {when}',
    p_alert_unreachable: 'Serwer nie odpowiada: dane pochodzą z ostatniego udanego sprawdzenia.',
    p_alert_auth: 'Dostawca odrzuca dane logowania: zmień je w {settings}.',
    p_alert_ended: 'Dostawca zgłasza, że ta subskrypcja się zakończyła.',
    p_alert_stream: 'Kanał testowy się nie odtwarza.',
    p_alert_expiring: 'Wygasa {date}: odnów ją na czas.',
    g_general: 'Ogólne',
    g_accounts: 'Konta',
    g_credentials: 'Dane logowania',
    g_account: 'Konto',
    g_health: 'Kontrola stanu',
    panel_display_hint: 'Wspólne dla wszystkich użytkowników',
    hide_off_hint: 'Pasek IPTV pozostaje',
    hide_all_hint: 'Karty przesuwają się na samą górę',
    hide_non_admin_hint: 'Administratorzy zachowują pasek',
  },
  ro: {
    title: 'IPTV',
    accounts: 'Abonamente',
    settings: 'Setări',
    none: 'Niciun cont încă: adăugați unul cu „{add}” în fila Abonamente.',
    loading: 'Se încarcă…',
    load_failed: 'Încărcarea a eșuat: {error}. Se reîncearcă automat.',
    retry: 'Reîncearcă',
    f_name: 'Nume',
    f_name_hint: 'Lasă gol pentru a folosi numele serverului',
    f_scan: 'Interval de interogare',
    f_scan_hint: 'Reîmprospătarea abonamentului, {min}–{max} min',
    f_notify: 'Notificare de expirare',
    f_notify_hint: 'Zile înainte de expirare, 0 = dezactivat',
    f_health: 'Interval de verificare a serverului',
    f_health_hint: 'Cerere ușoară către server, {min}–{max} min',
    f_stream: 'Testează fluxul unui canal în timpul verificării',
    f_stream_hint: 'Ocupă o conexiune timp de câteva secunde',
    u_min: 'min',
    u_days: 'zile',
    save: 'Salvează',
    saving: 'Se salvează…',
    saved: 'Salvat',
    check: 'Verifică acum',
    checking: 'Se verifică…',
    checked_ok: 'Serverul a răspuns',
    checked_ko: 'Serverul nu poate fi accesat',
    cred_username: 'Nume de utilizator',
    cred_mac: 'Adresă MAC',
    cred_password: 'Parolă',
    cred_show: 'Afișează parola',
    cred_hide: 'Ascunde parola',
    cred_copy: 'Copiază',
    cred_copied: 'Copiat',
    open_device: 'Dispozitiv',
    open_integration: 'Dispozitive și servicii',
    err_range: 'Valoare în afara intervalului',
    err_not_found: 'Contul nu a fost găsit',
    err_generic: 'Ceva nu a funcționat',
    st_loaded: 'Pornit',
    st_setup_retry: 'Se reîncearcă',
    st_setup_error: 'Configurare eșuată',
    st_not_loaded: 'Oprit',
    st_other: 'Indisponibil',
    remove: 'Elimină',
    removing: 'Se elimină…',
    remove_title: 'Elimini acest cont?',
    remove_msg: '{name} nu și-a terminat niciodată configurarea, deci nu are dispozitiv și nici intrare în card. Îl elimini din Home Assistant?',
    cancel: 'Anulează',
    p_unavailable: 'Server IPTV inaccesibil',
    p_refresh: 'Reîmprospătează',
    p_edit_btn: 'Editează datele de autentificare',
    p_edit_title: 'Editează contul',
    p_edit_url: 'URL server',
    p_edit_username: 'Nume de utilizator',
    p_edit_password: 'Parolă',
    p_edit_password_keep: 'Lasă gol pentru a o păstra',
    p_edit_mac: 'Adresă MAC',
    p_edit_save: 'Salvează',
    p_edit_cancel: 'Anulează',
    p_edit_saving: 'Se verifică…',
    p_err_invalid_auth: 'Date de autentificare respinse',
    p_err_cannot_connect: 'Serverul nu poate fi accesat',
    p_err_invalid_mac: 'Adresă MAC nevalidă',
    p_err_no_french_lists: 'Nicio listă franceză la acest furnizor',
    p_err_french_unknown: 'Categoriile nu au putut fi citite',
    p_err_stream_ko: 'Canalul de test nu pornește',
    p_err_already_configured: 'Un alt cont folosește deja aceste date de autentificare',
    p_err_not_found: 'Contul nu a fost găsit',
    p_err_generic: 'Actualizarea a eșuat',
    p_err_existing_longer: 'Pe acest server există deja un cont valabil mai mult timp',
    p_err_empty_catalogue: 'Furnizorul nu are un catalog utilizabil',
    p_del_btn: 'Elimină contul',
    p_del_title: 'Elimină contul',
    p_del_confirm: 'Contul și entitățile sale vor fi eliminate.',
    p_del_delete: 'Șterge',
    p_add_btn: 'Adaugă un cont',
    p_add_title: 'Adaugă un cont',
    p_add_provider: 'Tip de furnizor',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Adaugă',
    p_status_active: 'Activ',
    p_status_expired: 'Expirat',
    p_status_banned: 'Blocat',
    p_status_disabled: 'Dezactivat',
    p_status_unknown: 'Necunoscut',
    p_auth_failed: 'Autentificare eșuată',
    p_trial: 'Probă',
    p_expiration: 'Expirare',
    p_never: 'Niciodată',
    p_unlimited: 'Nelimitat',
    p_day_left: 'Zile rămase: {n}',
    p_days_left: 'Zile rămase: {n}',
    p_channels: 'canale',
    p_movies: 'filme',
    p_series: 'seriale',
    p_connections: 'conexiuni',
    p_french_on: 'FR',
    p_french_off: 'Fără FR',
    p_french_title: 'Liste franceze',
    p_last_check: 'Ultima verificare',
    p_health_ok: 'Online',
    p_health_degraded: 'Lent',
    p_health_unreachable: 'Inaccesibil',
    p_health_stream_ko: 'Flux oprit',
    p_health_auth_failed: 'Date de autentificare respinse',
    all_accounts: 'Toate conturile',
    panel_display: 'Panou',
    f_hide_toolbar: 'Ascunde bara de sus',
    f_hide_toolbar_hint: 'Filele rămân; pe telefon, meniul lateral trece lângă ele',
    hide_off: 'Nu',
    hide_all: 'Pentru toți',
    hide_non_admin: 'Pentru non-administratori',
    p_hero_none: 'Niciun abonament',
    p_hero_one: '1 abonament',
    p_hero_many: 'Abonamente: {n}',
    p_hero_fix: 'De rezolvat: {n}',
    p_hero_ok: 'Totul e în regulă',
    p_count_active: 'Active: {n}',
    p_count_expiring: 'Expiră curând: {n}',
    p_count_ko: 'Cu probleme: {n}',
    p_next: 'Următoarea expirare: {name}, pe {date}',
    p_filter_all: "Toate: {n}",
    p_tile_fix: "De corectat",
    p_tile_expiry: "Următoarea expirare",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} răspund",
    p_tile_conn: "Conexiuni",
    p_tile_conn_v: "{a} / {m} folosite",
    p_checked: 'Verificat {when}',
    p_alert_unreachable: 'Serverul nu răspunde: cifrele sunt de la ultima verificare reușită.',
    p_alert_auth: 'Furnizorul refuză datele de autentificare: modificați-le în {settings}.',
    p_alert_ended: 'Furnizorul raportează acest abonament ca încheiat.',
    p_alert_stream: 'Canalul de test nu pornește.',
    p_alert_expiring: 'Expiră pe {date}: reînnoiți-l la timp.',
    g_general: 'General',
    g_accounts: 'Conturi',
    g_credentials: 'Date de autentificare',
    g_account: 'Cont',
    g_health: 'Verificare de stare',
    panel_display_hint: 'Comun pentru toți utilizatorii',
    hide_off_hint: 'Bara IPTV rămâne',
    hide_all_hint: 'Filele urcă sus de tot',
    hide_non_admin_hint: 'Administratorii păstrează bara',
  },
  da: {
    title: 'IPTV',
    accounts: 'Abonnementer',
    settings: 'Indstillinger',
    none: 'Ingen konto endnu: tilføj en med “{add}” på fanen Abonnementer.',
    loading: 'Indlæser…',
    load_failed: 'Kunne ikke indlæse: {error}. Prøver igen automatisk.',
    retry: 'Prøv igen',
    f_name: 'Navn',
    f_name_hint: 'Lad stå tomt for at bruge serverens navn',
    f_scan: 'Opdateringsinterval',
    f_scan_hint: 'Opdatering af abonnementet, {min}–{max} min',
    f_notify: 'Varsel om udløb',
    f_notify_hint: 'Dage før udløb, 0 = slået fra',
    f_health: 'Interval for serverkontrol',
    f_health_hint: 'Let forespørgsel til serveren, {min}–{max} min',
    f_stream: 'Test en kanals stream under kontrollen',
    f_stream_hint: 'Optager én forbindelse i nogle sekunder',
    u_min: 'min',
    u_days: 'dage',
    save: 'Gem',
    saving: 'Gemmer…',
    saved: 'Gemt',
    check: 'Kontrollér nu',
    checking: 'Kontrollerer…',
    checked_ok: 'Serveren svarede',
    checked_ko: 'Serveren kan ikke nås',
    cred_username: 'Brugernavn',
    cred_mac: 'MAC-adresse',
    cred_password: 'Adgangskode',
    cred_show: 'Vis adgangskoden',
    cred_hide: 'Skjul adgangskoden',
    cred_copy: 'Kopiér',
    cred_copied: 'Kopieret',
    open_device: 'Enhed',
    open_integration: 'Enheder og tjenester',
    err_range: 'Værdien er uden for intervallet',
    err_not_found: 'Kontoen blev ikke fundet',
    err_generic: 'Noget gik galt',
    st_loaded: 'Kører',
    st_setup_retry: 'Prøver igen',
    st_setup_error: 'Opsætning mislykkedes',
    st_not_loaded: 'Stoppet',
    st_other: 'Utilgængelig',
    remove: 'Fjern',
    removing: 'Fjerner…',
    remove_title: 'Fjern denne konto?',
    remove_msg: '{name} blev aldrig færdigopsat og har derfor hverken enhed eller plads i kortet. Fjern den fra Home Assistant?',
    cancel: 'Annuller',
    p_unavailable: 'IPTV-serveren kan ikke nås',
    p_refresh: 'Opdater',
    p_edit_btn: 'Rediger loginoplysninger',
    p_edit_title: 'Rediger konto',
    p_edit_url: 'Server-URL',
    p_edit_username: 'Brugernavn',
    p_edit_password: 'Adgangskode',
    p_edit_password_keep: 'Lad stå tomt for at beholde',
    p_edit_mac: 'MAC-adresse',
    p_edit_save: 'Gem',
    p_edit_cancel: 'Annuller',
    p_edit_saving: 'Kontrollerer…',
    p_err_invalid_auth: 'Loginoplysninger afvist',
    p_err_cannot_connect: 'Kan ikke nå serveren',
    p_err_invalid_mac: 'Ugyldig MAC-adresse',
    p_err_no_french_lists: 'Ingen fransk liste hos denne udbyder',
    p_err_french_unknown: 'Kunne ikke læse kategorierne',
    p_err_stream_ko: 'Testkanalen kan ikke afspilles',
    p_err_already_configured: 'En anden konto bruger allerede disse loginoplysninger',
    p_err_not_found: 'Kontoen blev ikke fundet',
    p_err_generic: 'Opdateringen mislykkedes',
    p_err_existing_longer: 'Der findes allerede en konto med længere gyldighed på denne server',
    p_err_empty_catalogue: 'Udbyderen har intet brugbart katalog',
    p_del_btn: 'Fjern konto',
    p_del_title: 'Fjern konto',
    p_del_confirm: 'Kontoen og dens entiteter bliver fjernet.',
    p_del_delete: 'Slet',
    p_add_btn: 'Tilføj konto',
    p_add_title: 'Tilføj konto',
    p_add_provider: 'Udbydertype',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Tilføj',
    p_status_active: 'Aktiv',
    p_status_expired: 'Udløbet',
    p_status_banned: 'Spærret',
    p_status_disabled: 'Deaktiveret',
    p_status_unknown: 'Ukendt',
    p_auth_failed: 'Ugyldige loginoplysninger',
    p_trial: 'Prøve',
    p_expiration: 'Udløb',
    p_never: 'Aldrig',
    p_unlimited: 'Ubegrænset',
    p_day_left: '{n} dag tilbage',
    p_days_left: '{n} dage tilbage',
    p_channels: 'kanaler',
    p_movies: 'film',
    p_series: 'serier',
    p_connections: 'forbindelser',
    p_french_on: 'FR',
    p_french_off: 'Ingen FR',
    p_french_title: 'Franske lister',
    p_last_check: 'Seneste kontrol',
    p_health_ok: 'Online',
    p_health_degraded: 'Langsom',
    p_health_unreachable: 'Kan ikke nås',
    p_health_stream_ko: 'Stream nede',
    p_health_auth_failed: 'Loginoplysninger afvist',
    all_accounts: 'Alle konti',
    panel_display: 'Panel',
    f_hide_toolbar: 'Skjul den øverste bjælke',
    f_hide_toolbar_hint: 'Fanerne bliver; på en telefon flytter sidebjælkemenuen ved siden af dem',
    hide_off: 'Nej',
    hide_all: 'For alle',
    hide_non_admin: 'For ikke-administratorer',
    p_hero_none: 'Intet abonnement endnu',
    p_hero_one: '1 abonnement',
    p_hero_many: '{n} abonnementer',
    p_hero_fix: 'Skal løses: {n}',
    p_hero_ok: 'Alt i orden',
    p_count_active: 'Aktive: {n}',
    p_count_expiring: 'Udløber snart: {n}',
    p_count_ko: 'Med problemer: {n}',
    p_next: 'Næste udløb: {name}, den {date}',
    p_filter_all: "Alle: {n}",
    p_tile_fix: "Skal rettes",
    p_tile_expiry: "Næste udløb",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} svarer",
    p_tile_conn: "Forbindelser",
    p_tile_conn_v: "{a} / {m} i brug",
    p_checked: 'Tjekket {when}',
    p_alert_unreachable: 'Serveren svarer ikke: tallene er fra sidste vellykkede tjek.',
    p_alert_auth: 'Udbyderen afviser loginoplysningerne: ret dem under {settings}.',
    p_alert_ended: 'Udbyderen melder dette abonnement som afsluttet.',
    p_alert_stream: 'Testkanalen afspiller ikke.',
    p_alert_expiring: 'Udløber den {date}: forny det i tide.',
    g_general: 'Generelt',
    g_accounts: 'Konti',
    g_credentials: 'Loginoplysninger',
    g_account: 'Konto',
    g_health: 'Sundhedstjek',
    panel_display_hint: 'Fælles for alle brugere',
    hide_off_hint: 'IPTV-bjælken bliver',
    hide_all_hint: 'Fanerne rykker helt op',
    hide_non_admin_hint: 'Administratorer beholder bjælken',
  },
  sv: {
    title: 'IPTV',
    accounts: 'Abonnemang',
    settings: 'Inställningar',
    none: 'Inget konto än: lägg till ett med ”{add}” på fliken Abonnemang.',
    loading: 'Laddar…',
    load_failed: 'Kunde inte läsa in: {error}. Försöker igen automatiskt.',
    retry: 'Försök igen',
    f_name: 'Namn',
    f_name_hint: 'Lämna tomt för att använda serverns namn',
    f_scan: 'Uppdateringsintervall',
    f_scan_hint: 'Uppdatering av abonnemanget, {min}–{max} min',
    f_notify: 'Avisering före utgång',
    f_notify_hint: 'Dagar före utgång, 0 = av',
    f_health: 'Intervall för serverkontroll',
    f_health_hint: 'Lätt förfrågan till servern, {min}–{max} min',
    f_stream: 'Testa en kanals stream under kontrollen',
    f_stream_hint: 'Upptar en anslutning i några sekunder',
    u_min: 'min',
    u_days: 'dagar',
    save: 'Spara',
    saving: 'Sparar…',
    saved: 'Sparat',
    check: 'Kontrollera nu',
    checking: 'Kontrollerar…',
    checked_ok: 'Servern svarade',
    checked_ko: 'Servern går inte att nå',
    cred_username: 'Användarnamn',
    cred_mac: 'MAC-adress',
    cred_password: 'Lösenord',
    cred_show: 'Visa lösenordet',
    cred_hide: 'Dölj lösenordet',
    cred_copy: 'Kopiera',
    cred_copied: 'Kopierat',
    open_device: 'Enhet',
    open_integration: 'Enheter och tjänster',
    err_range: 'Värdet ligger utanför intervallet',
    err_not_found: 'Kontot hittades inte',
    err_generic: 'Något gick fel',
    st_loaded: 'Körs',
    st_setup_retry: 'Försöker igen',
    st_setup_error: 'Konfigurationen misslyckades',
    st_not_loaded: 'Stoppad',
    st_other: 'Otillgänglig',
    remove: 'Ta bort',
    removing: 'Tar bort…',
    remove_title: 'Ta bort det här kontot?',
    remove_msg: '{name} slutförde aldrig sin konfiguration och har därför varken enhet eller plats i kortet. Ta bort det från Home Assistant?',
    cancel: 'Avbryt',
    p_unavailable: 'IPTV-servern går inte att nå',
    p_refresh: 'Uppdatera',
    p_edit_btn: 'Redigera inloggningsuppgifter',
    p_edit_title: 'Redigera konto',
    p_edit_url: 'Server-URL',
    p_edit_username: 'Användarnamn',
    p_edit_password: 'Lösenord',
    p_edit_password_keep: 'Lämna tomt för att behålla',
    p_edit_mac: 'MAC-adress',
    p_edit_save: 'Spara',
    p_edit_cancel: 'Avbryt',
    p_edit_saving: 'Kontrollerar…',
    p_err_invalid_auth: 'Inloggningsuppgifterna nekades',
    p_err_cannot_connect: 'Kan inte nå servern',
    p_err_invalid_mac: 'Ogiltig MAC-adress',
    p_err_no_french_lists: 'Ingen fransk lista hos den här leverantören',
    p_err_french_unknown: 'Kunde inte läsa kategorierna',
    p_err_stream_ko: 'Testkanalen spelas inte upp',
    p_err_already_configured: 'Ett annat konto använder redan dessa inloggningsuppgifter',
    p_err_not_found: 'Kontot hittades inte',
    p_err_generic: 'Uppdateringen misslyckades',
    p_err_existing_longer: 'Det finns redan ett konto som gäller längre på den här servern',
    p_err_empty_catalogue: 'Leverantören har ingen användbar katalog',
    p_del_btn: 'Ta bort konto',
    p_del_title: 'Ta bort konto',
    p_del_confirm: 'Kontot och dess entiteter tas bort.',
    p_del_delete: 'Radera',
    p_add_btn: 'Lägg till konto',
    p_add_title: 'Lägg till konto',
    p_add_provider: 'Leverantörstyp',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Lägg till',
    p_status_active: 'Aktivt',
    p_status_expired: 'Utgånget',
    p_status_banned: 'Spärrat',
    p_status_disabled: 'Inaktiverat',
    p_status_unknown: 'Okänt',
    p_auth_failed: 'Ogiltig inloggning',
    p_trial: 'Provperiod',
    p_expiration: 'Utgång',
    p_never: 'Aldrig',
    p_unlimited: 'Obegränsat',
    p_day_left: '{n} dag kvar',
    p_days_left: '{n} dagar kvar',
    p_channels: 'kanaler',
    p_movies: 'filmer',
    p_series: 'serier',
    p_connections: 'anslutningar',
    p_french_on: 'FR',
    p_french_off: 'Ingen FR',
    p_french_title: 'Franska listor',
    p_last_check: 'Senaste kontroll',
    p_health_ok: 'Online',
    p_health_degraded: 'Långsam',
    p_health_unreachable: 'Går inte att nå',
    p_health_stream_ko: 'Stream nere',
    p_health_auth_failed: 'Inloggningsuppgifterna nekades',
    all_accounts: 'Alla konton',
    panel_display: 'Panel',
    f_hide_toolbar: 'Dölj det övre fältet',
    f_hide_toolbar_hint: 'Flikarna finns kvar; på en telefon flyttas sidofältsmenyn bredvid dem',
    hide_off: 'Nej',
    hide_all: 'För alla',
    hide_non_admin: 'För icke-administratörer',
    p_hero_none: 'Inga abonnemang än',
    p_hero_one: '1 abonnemang',
    p_hero_many: '{n} abonnemang',
    p_hero_fix: 'Att åtgärda: {n}',
    p_hero_ok: 'Allt är bra',
    p_count_active: 'Aktiva: {n}',
    p_count_expiring: 'Går ut snart: {n}',
    p_count_ko: 'Med problem: {n}',
    p_next: 'Nästa utgång: {name}, den {date}',
    p_filter_all: "Alla: {n}",
    p_tile_fix: "Att åtgärda",
    p_tile_expiry: "Nästa utgång",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} svarar",
    p_tile_conn: "Anslutningar",
    p_tile_conn_v: "{a} / {m} används",
    p_checked: 'Kontrollerad {when}',
    p_alert_unreachable: 'Servern svarar inte: siffrorna är från den senaste lyckade kontrollen.',
    p_alert_auth: 'Leverantören nekar inloggningsuppgifterna: ändra dem under {settings}.',
    p_alert_ended: 'Leverantören anger att abonnemanget har upphört.',
    p_alert_stream: 'Testkanalen spelas inte upp.',
    p_alert_expiring: 'Går ut den {date}: förnya i tid.',
    g_general: 'Allmänt',
    g_accounts: 'Konton',
    g_credentials: 'Inloggningsuppgifter',
    g_account: 'Konto',
    g_health: 'Hälsokontroll',
    panel_display_hint: 'Gemensamt för alla användare',
    hide_off_hint: 'IPTV-raden ligger kvar',
    hide_all_hint: 'Flikarna flyttas högst upp',
    hide_non_admin_hint: 'Administratörer behåller raden',
  },
  bg: {
    title: 'IPTV',
    accounts: 'Абонаменти',
    settings: 'Настройки',
    none: 'Все още няма акаунт: добавете един с „{add}“ в раздела Абонаменти.',
    loading: 'Зареждане…',
    load_failed: 'Неуспешно зареждане: {error}. Автоматичен нов опит.',
    retry: 'Опитай отново',
    f_name: 'Име',
    f_name_hint: 'Оставете празно, за да се използва името на сървъра',
    f_scan: 'Интервал на запитване',
    f_scan_hint: 'Обновяване на абонамента, {min}–{max} мин',
    f_notify: 'Известие за изтичане',
    f_notify_hint: 'Дни преди изтичане, 0 = изключено',
    f_health: 'Интервал на проверка на сървъра',
    f_health_hint: 'Леко запитване към сървъра, {min}–{max} мин',
    f_stream: 'Тест на потока на канал по време на проверката',
    f_stream_hint: 'Заема една връзка за няколко секунди',
    u_min: 'мин',
    u_days: 'дни',
    save: 'Запази',
    saving: 'Запазване…',
    saved: 'Запазено',
    check: 'Провери сега',
    checking: 'Проверка…',
    checked_ok: 'Сървърът отговори',
    checked_ko: 'Сървърът е недостъпен',
    cred_username: 'Потребителско име',
    cred_mac: 'MAC адрес',
    cred_password: 'Парола',
    cred_show: 'Покажи паролата',
    cred_hide: 'Скрий паролата',
    cred_copy: 'Копирай',
    cred_copied: 'Копирано',
    open_device: 'Устройство',
    open_integration: 'Устройства и услуги',
    err_range: 'Стойността е извън допустимия диапазон',
    err_not_found: 'Акаунтът не е намерен',
    err_generic: 'Нещо се обърка',
    st_loaded: 'Работи',
    st_setup_retry: 'Нов опит',
    st_setup_error: 'Неуспешна настройка',
    st_not_loaded: 'Спряна',
    st_other: 'Недостъпна',
    remove: 'Премахни',
    removing: 'Премахване…',
    remove_title: 'Да се премахне ли този акаунт?',
    remove_msg: '{name} така и не завърши настройката си, затова няма устройство, нито запис в картата. Да се премахне ли от Home Assistant?',
    cancel: 'Отказ',
    p_unavailable: 'IPTV сървърът е недостъпен',
    p_refresh: 'Обнови',
    p_edit_btn: 'Редактиране на данните за вход',
    p_edit_title: 'Промяна на акаунт',
    p_edit_url: 'URL на сървъра',
    p_edit_username: 'Потребителско име',
    p_edit_password: 'Парола',
    p_edit_password_keep: 'Оставете празно, за да я запазите',
    p_edit_mac: 'MAC адрес',
    p_edit_save: 'Запази',
    p_edit_cancel: 'Отказ',
    p_edit_saving: 'Проверка…',
    p_err_invalid_auth: 'Данните за вход са отхвърлени',
    p_err_cannot_connect: 'Няма връзка със сървъра',
    p_err_invalid_mac: 'Невалиден MAC адрес',
    p_err_no_french_lists: 'Няма френски списък при този доставчик',
    p_err_french_unknown: 'Категориите не можаха да бъдат прочетени',
    p_err_stream_ko: 'Тестовият канал не се възпроизвежда',
    p_err_already_configured: 'Друг акаунт вече използва тези данни за вход',
    p_err_not_found: 'Акаунтът не е намерен',
    p_err_generic: 'Актуализацията не бе успешна',
    p_err_existing_longer: 'На този сървър вече има акаунт, валиден по-дълго',
    p_err_empty_catalogue: 'Доставчикът няма използваем каталог',
    p_del_btn: 'Премахване на акаунта',
    p_del_title: 'Изтриване на акаунт',
    p_del_confirm: 'Акаунтът и неговите обекти ще бъдат премахнати.',
    p_del_delete: 'Изтрий',
    p_add_btn: 'Добавяне на акаунт',
    p_add_title: 'Добавяне на акаунт',
    p_add_provider: 'Тип доставчик',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Добави',
    p_status_active: 'Активен',
    p_status_expired: 'Изтекъл',
    p_status_banned: 'Блокиран',
    p_status_disabled: 'Деактивиран',
    p_status_unknown: 'Неизвестен',
    p_auth_failed: 'Невалидни данни за вход',
    p_trial: 'Пробен',
    p_expiration: 'Изтичане',
    p_never: 'Никога',
    p_unlimited: 'Неограничен',
    p_day_left: 'Оставащи дни: {n}',
    p_days_left: 'Оставащи дни: {n}',
    p_channels: 'канала',
    p_movies: 'филма',
    p_series: 'сериала',
    p_connections: 'връзки',
    p_french_on: 'FR',
    p_french_off: 'Без FR',
    p_french_title: 'Френски списъци',
    p_last_check: 'Последна проверка',
    p_health_ok: 'На линия',
    p_health_degraded: 'Бавен',
    p_health_unreachable: 'Недостъпен',
    p_health_stream_ko: 'Няма поток',
    p_health_auth_failed: 'Данните за вход са отхвърлени',
    all_accounts: 'Всички акаунти',
    panel_display: 'Панел',
    f_hide_toolbar: 'Скриване на горната лента',
    f_hide_toolbar_hint: 'Разделите остават; на телефон страничното меню се премества до тях',
    hide_off: 'Не',
    hide_all: 'За всички',
    hide_non_admin: 'За неадминистратори',
    p_hero_none: 'Все още няма абонаменти',
    p_hero_one: '1 абонамент',
    p_hero_many: 'Абонаменти: {n}',
    p_hero_fix: 'За решаване: {n}',
    p_hero_ok: 'Всичко е наред',
    p_count_active: 'Активни: {n}',
    p_count_expiring: 'Изтичат скоро: {n}',
    p_count_ko: 'С проблем: {n}',
    p_next: 'Следващо изтичане: {name}, на {date}',
    p_filter_all: "Всички: {n}",
    p_tile_fix: "За поправяне",
    p_tile_expiry: "Следващо изтичане",
    p_tile_online: "На линия",
    p_tile_online_v: "{n} / {t} отговарят",
    p_tile_conn: "Връзки",
    p_tile_conn_v: "{a} / {m} заети",
    p_checked: 'Проверено {when}',
    p_alert_unreachable: 'Сървърът не отговаря: данните са от последната успешна проверка.',
    p_alert_auth: 'Доставчикът отказва данните за вход: променете ги в {settings}.',
    p_alert_ended: 'Доставчикът съобщава, че абонаментът е приключил.',
    p_alert_stream: 'Тестовият канал не се възпроизвежда.',
    p_alert_expiring: 'Изтича на {date}: подновете го навреме.',
    g_general: 'Общи',
    g_accounts: 'Акаунти',
    g_credentials: 'Данни за вход',
    g_account: 'Акаунт',
    g_health: 'Проверка на състоянието',
    panel_display_hint: 'Общо за всички потребители',
    hide_off_hint: 'Лентата IPTV остава',
    hide_all_hint: 'Разделите се качват най-горе',
    hide_non_admin_hint: 'Администраторите запазват лентата',
  },
  ru: {
    title: 'IPTV',
    accounts: 'Подписки',
    settings: 'Настройки',
    none: 'Аккаунтов пока нет: добавьте его кнопкой «{add}» на вкладке «Подписки».',
    loading: 'Загрузка…',
    load_failed: 'Не удалось загрузить: {error}. Повтор выполняется автоматически.',
    retry: 'Повторить',
    f_name: 'Название',
    f_name_hint: 'Оставьте пустым, чтобы использовать имя сервера',
    f_scan: 'Интервал опроса',
    f_scan_hint: 'Обновление подписки, {min}–{max} мин',
    f_notify: 'Уведомление об окончании',
    f_notify_hint: 'Дней до окончания, 0 = выкл.',
    f_health: 'Интервал проверки сервера',
    f_health_hint: 'Лёгкий запрос к серверу, {min}–{max} мин',
    f_stream: 'Проверять поток канала во время проверки',
    f_stream_hint: 'Занимает одно подключение на несколько секунд',
    u_min: 'мин',
    u_days: 'дн.',
    save: 'Сохранить',
    saving: 'Сохранение…',
    saved: 'Сохранено',
    check: 'Проверить сейчас',
    checking: 'Проверка…',
    checked_ok: 'Сервер ответил',
    checked_ko: 'Сервер недоступен',
    cred_username: 'Имя пользователя',
    cred_mac: 'MAC-адрес',
    cred_password: 'Пароль',
    cred_show: 'Показать пароль',
    cred_hide: 'Скрыть пароль',
    cred_copy: 'Копировать',
    cred_copied: 'Скопировано',
    open_device: 'Устройство',
    open_integration: 'Устройства и службы',
    err_range: 'Значение вне допустимого диапазона',
    err_not_found: 'Учётная запись не найдена',
    err_generic: 'Что-то пошло не так',
    st_loaded: 'Работает',
    st_setup_retry: 'Повторная попытка',
    st_setup_error: 'Ошибка настройки',
    st_not_loaded: 'Остановлена',
    st_other: 'Недоступна',
    remove: 'Удалить',
    removing: 'Удаление…',
    remove_title: 'Удалить эту учётную запись?',
    remove_msg: '{name} так и не завершила настройку, поэтому у неё нет ни устройства, ни строки в карточке. Удалить её из Home Assistant?',
    cancel: 'Отмена',
    p_unavailable: 'IPTV-сервер недоступен',
    p_refresh: 'Обновить',
    p_edit_btn: 'Изменить учётные данные',
    p_edit_title: 'Изменить аккаунт',
    p_edit_url: 'URL сервера',
    p_edit_username: 'Имя пользователя',
    p_edit_password: 'Пароль',
    p_edit_password_keep: 'Оставьте пустым, чтобы не менять',
    p_edit_mac: 'MAC-адрес',
    p_edit_save: 'Сохранить',
    p_edit_cancel: 'Отмена',
    p_edit_saving: 'Проверка…',
    p_err_invalid_auth: 'Учётные данные отклонены',
    p_err_cannot_connect: 'Не удаётся подключиться к серверу',
    p_err_invalid_mac: 'Недопустимый MAC-адрес',
    p_err_no_french_lists: 'У этого провайдера нет французского списка',
    p_err_french_unknown: 'Не удалось прочитать категории',
    p_err_stream_ko: 'Тестовый канал не воспроизводится',
    p_err_already_configured: 'Эти учётные данные уже использует другая учётная запись',
    p_err_not_found: 'Учётная запись не найдена',
    p_err_generic: 'Не удалось обновить',
    p_err_existing_longer: 'На этом сервере уже есть учётная запись, действующая дольше',
    p_err_empty_catalogue: 'У провайдера нет пригодного каталога',
    p_del_btn: 'Удалить учётную запись',
    p_del_title: 'Удалить аккаунт',
    p_del_confirm: 'Учётная запись и её объекты будут удалены.',
    p_del_delete: 'Удалить',
    p_add_btn: 'Добавить учётную запись',
    p_add_title: 'Добавить аккаунт',
    p_add_provider: 'Тип провайдера',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Добавить',
    p_status_active: 'Активна',
    p_status_expired: 'Истекла',
    p_status_banned: 'Заблокирована',
    p_status_disabled: 'Отключена',
    p_status_unknown: 'Неизвестно',
    p_auth_failed: 'Ошибка входа',
    p_trial: 'Пробная',
    p_expiration: 'Окончание',
    p_never: 'Никогда',
    p_unlimited: 'Без ограничений',
    p_day_left: 'Осталось дней: {n}',
    p_days_left: 'Осталось дней: {n}',
    p_channels: 'каналы',
    p_movies: 'фильмы',
    p_series: 'сериалы',
    p_connections: 'подключения',
    p_french_on: 'FR',
    p_french_off: 'Без FR',
    p_french_title: 'Французские списки',
    p_last_check: 'Последняя проверка',
    p_health_ok: 'В сети',
    p_health_degraded: 'Медленно',
    p_health_unreachable: 'Недоступен',
    p_health_stream_ko: 'Нет потока',
    p_health_auth_failed: 'Учётные данные отклонены',
    all_accounts: 'Все аккаунты',
    panel_display: 'Панель',
    f_hide_toolbar: 'Скрыть верхнюю панель',
    f_hide_toolbar_hint: 'Вкладки остаются; на телефоне боковое меню переходит к ним',
    hide_off: 'Нет',
    hide_all: 'Для всех',
    hide_non_admin: 'Для не-администраторов',
    p_hero_none: 'Подписок пока нет',
    p_hero_one: '1 подписка',
    p_hero_many: 'Подписки: {n}',
    p_hero_fix: 'Требуют внимания: {n}',
    p_hero_ok: 'Всё в порядке',
    p_count_active: 'Активные: {n}',
    p_count_expiring: 'Скоро истекают: {n}',
    p_count_ko: 'С проблемами: {n}',
    p_next: 'Ближайшее окончание: {name}, {date}',
    p_filter_all: "Все: {n}",
    p_tile_fix: "Исправить",
    p_tile_expiry: "Ближайшее окончание",
    p_tile_online: "В сети",
    p_tile_online_v: "{n} / {t} отвечают",
    p_tile_conn: "Подключения",
    p_tile_conn_v: "{a} / {m} занято",
    p_checked: 'Проверено {when}',
    p_alert_unreachable: 'Сервер не отвечает: данные с последней успешной проверки.',
    p_alert_auth: 'Провайдер отклоняет учётные данные: измените их в разделе «{settings}».',
    p_alert_ended: 'Провайдер сообщает, что подписка закончилась.',
    p_alert_stream: 'Тестовый канал не воспроизводится.',
    p_alert_expiring: 'Истекает {date}: продлите вовремя.',
    g_general: 'Общие',
    g_accounts: 'Учётные записи',
    g_credentials: 'Учётные данные',
    g_account: 'Учётная запись',
    g_health: 'Проверка состояния',
    panel_display_hint: 'Общие для всех пользователей',
    hide_off_hint: 'Панель IPTV остаётся',
    hide_all_hint: 'Вкладки поднимаются в самый верх',
    hide_non_admin_hint: 'Администраторы сохраняют панель',
  },
  uk: {
    title: 'IPTV',
    accounts: 'Підписки',
    settings: 'Налаштування',
    none: 'Облікових записів ще немає: додайте його кнопкою «{add}» на вкладці «Підписки».',
    loading: 'Завантаження…',
    load_failed: 'Не вдалося завантажити: {error}. Повтор виконується автоматично.',
    retry: 'Повторити',
    f_name: 'Назва',
    f_name_hint: 'Залиште порожнім, щоб використати ім\'я сервера',
    f_scan: 'Інтервал опитування',
    f_scan_hint: 'Оновлення підписки, {min}–{max} хв',
    f_notify: 'Сповіщення про закінчення',
    f_notify_hint: 'Днів до закінчення, 0 = вимкнено',
    f_health: 'Інтервал перевірки сервера',
    f_health_hint: 'Легкий запит до сервера, {min}–{max} хв',
    f_stream: 'Перевіряти потік каналу під час перевірки',
    f_stream_hint: 'Займає одне з\'єднання на кілька секунд',
    u_min: 'хв',
    u_days: 'дн.',
    save: 'Зберегти',
    saving: 'Збереження…',
    saved: 'Збережено',
    check: 'Перевірити зараз',
    checking: 'Перевірка…',
    checked_ok: 'Сервер відповів',
    checked_ko: 'Сервер недоступний',
    cred_username: 'Ім\'я користувача',
    cred_mac: 'MAC-адреса',
    cred_password: 'Пароль',
    cred_show: 'Показати пароль',
    cred_hide: 'Приховати пароль',
    cred_copy: 'Копіювати',
    cred_copied: 'Скопійовано',
    open_device: 'Пристрій',
    open_integration: 'Пристрої та служби',
    err_range: 'Значення поза допустимим діапазоном',
    err_not_found: 'Обліковий запис не знайдено',
    err_generic: 'Щось пішло не так',
    st_loaded: 'Працює',
    st_setup_retry: 'Повторна спроба',
    st_setup_error: 'Помилка налаштування',
    st_not_loaded: 'Зупинено',
    st_other: 'Недоступно',
    remove: 'Видалити',
    removing: 'Видалення…',
    remove_title: 'Видалити цей обліковий запис?',
    remove_msg: '{name} так і не завершив налаштування, тому не має ні пристрою, ні рядка в картці. Видалити його з Home Assistant?',
    cancel: 'Скасувати',
    p_unavailable: 'IPTV-сервер недоступний',
    p_refresh: 'Оновити',
    p_edit_btn: 'Змінити облікові дані',
    p_edit_title: 'Змінити акаунт',
    p_edit_url: 'URL сервера',
    p_edit_username: 'Ім\'я користувача',
    p_edit_password: 'Пароль',
    p_edit_password_keep: 'Залиште порожнім, щоб не змінювати',
    p_edit_mac: 'MAC-адреса',
    p_edit_save: 'Зберегти',
    p_edit_cancel: 'Скасувати',
    p_edit_saving: 'Перевірка…',
    p_err_invalid_auth: 'Облікові дані відхилено',
    p_err_cannot_connect: 'Не вдається з\'єднатися із сервером',
    p_err_invalid_mac: 'Недійсна MAC-адреса',
    p_err_no_french_lists: 'У цього провайдера немає французького списку',
    p_err_french_unknown: 'Не вдалося прочитати категорії',
    p_err_stream_ko: 'Тестовий канал не відтворюється',
    p_err_already_configured: 'Ці облікові дані вже використовує інший обліковий запис',
    p_err_not_found: 'Обліковий запис не знайдено',
    p_err_generic: 'Не вдалося оновити',
    p_err_existing_longer: 'На цьому сервері вже є обліковий запис, що діє довше',
    p_err_empty_catalogue: 'Провайдер не має придатного каталогу',
    p_del_btn: 'Видалити обліковий запис',
    p_del_title: 'Видалити акаунт',
    p_del_confirm: 'Обліковий запис і його об\'єкти буде видалено.',
    p_del_delete: 'Видалити',
    p_add_btn: 'Додати обліковий запис',
    p_add_title: 'Додати акаунт',
    p_add_provider: 'Тип провайдера',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Додати',
    p_status_active: 'Активна',
    p_status_expired: 'Закінчилася',
    p_status_banned: 'Заблокована',
    p_status_disabled: 'Вимкнена',
    p_status_unknown: 'Невідомо',
    p_auth_failed: 'Помилка входу',
    p_trial: 'Пробна',
    p_expiration: 'Закінчення',
    p_never: 'Ніколи',
    p_unlimited: 'Без обмежень',
    p_day_left: 'Залишилося днів: {n}',
    p_days_left: 'Залишилося днів: {n}',
    p_channels: 'канали',
    p_movies: 'фільми',
    p_series: 'серіали',
    p_connections: 'з\'єднання',
    p_french_on: 'FR',
    p_french_off: 'Без FR',
    p_french_title: 'Французькі списки',
    p_last_check: 'Остання перевірка',
    p_health_ok: 'Онлайн',
    p_health_degraded: 'Повільно',
    p_health_unreachable: 'Недоступний',
    p_health_stream_ko: 'Немає потоку',
    p_health_auth_failed: 'Облікові дані відхилено',
    all_accounts: 'Усі облікові записи',
    panel_display: 'Панель',
    f_hide_toolbar: 'Приховати верхню панель',
    f_hide_toolbar_hint: 'Вкладки залишаються; на телефоні бічне меню переходить до них',
    hide_off: 'Ні',
    hide_all: 'Для всіх',
    hide_non_admin: 'Для не-адміністраторів',
    p_hero_none: 'Підписок ще немає',
    p_hero_one: '1 підписка',
    p_hero_many: 'Підписки: {n}',
    p_hero_fix: 'Потребують уваги: {n}',
    p_hero_ok: 'Усе гаразд',
    p_count_active: 'Активні: {n}',
    p_count_expiring: 'Скоро закінчуються: {n}',
    p_count_ko: 'З проблемами: {n}',
    p_next: 'Найближче закінчення: {name}, {date}',
    p_filter_all: "Усі: {n}",
    p_tile_fix: "Виправити",
    p_tile_expiry: "Найближче закінчення",
    p_tile_online: "У мережі",
    p_tile_online_v: "{n} / {t} відповідають",
    p_tile_conn: "Підключення",
    p_tile_conn_v: "{a} / {m} зайнято",
    p_checked: 'Перевірено {when}',
    p_alert_unreachable: 'Сервер не відповідає: дані з останньої успішної перевірки.',
    p_alert_auth: 'Провайдер відхиляє облікові дані: змініть їх у розділі «{settings}».',
    p_alert_ended: 'Провайдер повідомляє, що підписка закінчилася.',
    p_alert_stream: 'Тестовий канал не відтворюється.',
    p_alert_expiring: 'Закінчується {date}: продовжте вчасно.',
    g_general: 'Загальні',
    g_accounts: 'Облікові записи',
    g_credentials: 'Облікові дані',
    g_account: 'Обліковий запис',
    g_health: 'Перевірка стану',
    panel_display_hint: 'Спільні для всіх користувачів',
    hide_off_hint: 'Панель IPTV залишається',
    hide_all_hint: 'Вкладки піднімаються на самий верх',
    hide_non_admin_hint: 'Адміністратори зберігають панель',
  },
  hu: {
    title: 'IPTV',
    accounts: 'Előfizetések',
    settings: 'Beállítások',
    none: 'Még nincs fiók: adjon hozzá egyet a(z) „{add}” gombbal az Előfizetések lapon.',
    loading: 'Betöltés…',
    load_failed: 'A betöltés nem sikerült: {error}. Automatikus újrapróbálás.',
    retry: 'Újra',
    f_name: 'Név',
    f_name_hint: 'Hagyd üresen a szerver nevének használatához',
    f_scan: 'Lekérdezési időköz',
    f_scan_hint: 'Az előfizetés frissítése, {min}–{max} perc',
    f_notify: 'Értesítés lejárat előtt',
    f_notify_hint: 'Napok a lejárat előtt, 0 = kikapcsolva',
    f_health: 'Szerverellenőrzés időköze',
    f_health_hint: 'Könnyű lekérdezés a szerver felé, {min}–{max} perc',
    f_stream: 'Egy csatorna streamjének tesztelése ellenőrzéskor',
    f_stream_hint: 'Néhány másodpercre lefoglal egy kapcsolatot',
    u_min: 'perc',
    u_days: 'nap',
    save: 'Mentés',
    saving: 'Mentés…',
    saved: 'Mentve',
    check: 'Ellenőrzés most',
    checking: 'Ellenőrzés…',
    checked_ok: 'A szerver válaszolt',
    checked_ko: 'A szerver nem érhető el',
    cred_username: 'Felhasználónév',
    cred_mac: 'MAC-cím',
    cred_password: 'Jelszó',
    cred_show: 'Jelszó megjelenítése',
    cred_hide: 'Jelszó elrejtése',
    cred_copy: 'Másolás',
    cred_copied: 'Másolva',
    open_device: 'Eszköz',
    open_integration: 'Eszközök és szolgáltatások',
    err_range: 'Az érték a tartományon kívül esik',
    err_not_found: 'A fiók nem található',
    err_generic: 'Hiba történt',
    st_loaded: 'Fut',
    st_setup_retry: 'Újrapróbálkozás',
    st_setup_error: 'Sikertelen beállítás',
    st_not_loaded: 'Leállítva',
    st_other: 'Nem elérhető',
    remove: 'Eltávolítás',
    removing: 'Eltávolítás…',
    remove_title: 'Eltávolítod ezt a fiókot?',
    remove_msg: 'A(z) {name} beállítása sosem fejeződött be, ezért nincs eszköze és a kártyán sem szerepel. Eltávolítod a Home Assistantból?',
    cancel: 'Mégse',
    p_unavailable: 'Az IPTV-szerver nem érhető el',
    p_refresh: 'Frissítés',
    p_edit_btn: 'Hitelesítő adatok szerkesztése',
    p_edit_title: 'Fiók szerkesztése',
    p_edit_url: 'Szerver URL',
    p_edit_username: 'Felhasználónév',
    p_edit_password: 'Jelszó',
    p_edit_password_keep: 'Hagyd üresen a megtartásához',
    p_edit_mac: 'MAC-cím',
    p_edit_save: 'Mentés',
    p_edit_cancel: 'Mégse',
    p_edit_saving: 'Ellenőrzés…',
    p_err_invalid_auth: 'Elutasított hitelesítő adatok',
    p_err_cannot_connect: 'A szerver nem érhető el',
    p_err_invalid_mac: 'Érvénytelen MAC-cím',
    p_err_no_french_lists: 'Ennél a szolgáltatónál nincs francia lista',
    p_err_french_unknown: 'Nem sikerült beolvasni a kategóriákat',
    p_err_stream_ko: 'A tesztcsatorna nem játszható le',
    p_err_already_configured: 'Egy másik fiók már használja ezeket a hitelesítő adatokat',
    p_err_not_found: 'A fiók nem található',
    p_err_generic: 'A frissítés sikertelen',
    p_err_existing_longer: 'Ezen a szerveren már van egy tovább érvényes fiók',
    p_err_empty_catalogue: 'A szolgáltatónak nincs használható katalógusa',
    p_del_btn: 'Fiók eltávolítása',
    p_del_title: 'Fiók eltávolítása',
    p_del_confirm: 'A fiók és az entitásai el lesznek távolítva.',
    p_del_delete: 'Törlés',
    p_add_btn: 'Fiók hozzáadása',
    p_add_title: 'Fiók hozzáadása',
    p_add_provider: 'Szolgáltató típusa',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Hozzáadás',
    p_status_active: 'Aktív',
    p_status_expired: 'Lejárt',
    p_status_banned: 'Letiltva',
    p_status_disabled: 'Kikapcsolva',
    p_status_unknown: 'Ismeretlen',
    p_auth_failed: 'Érvénytelen hitelesítés',
    p_trial: 'Próba',
    p_expiration: 'Lejárat',
    p_never: 'Soha',
    p_unlimited: 'Korlátlan',
    p_day_left: '{n} nap van hátra',
    p_days_left: '{n} nap van hátra',
    p_channels: 'csatorna',
    p_movies: 'film',
    p_series: 'sorozat',
    p_connections: 'kapcsolat',
    p_french_on: 'FR',
    p_french_off: 'Nincs FR',
    p_french_title: 'Francia listák',
    p_last_check: 'Utolsó ellenőrzés',
    p_health_ok: 'Online',
    p_health_degraded: 'Lassú',
    p_health_unreachable: 'Nem érhető el',
    p_health_stream_ko: 'Stream leállt',
    p_health_auth_failed: 'Elutasított hitelesítő adatok',
    all_accounts: 'Összes fiók',
    panel_display: 'Panel',
    f_hide_toolbar: 'Felső sáv elrejtése',
    f_hide_toolbar_hint: 'A lapok megmaradnak; telefonon az oldalsáv menüje melléjük kerül',
    hide_off: 'Nem',
    hide_all: 'Mindenkinek',
    hide_non_admin: 'Nem rendszergazdáknak',
    p_hero_none: 'Még nincs előfizetés',
    p_hero_one: '1 előfizetés',
    p_hero_many: '{n} előfizetés',
    p_hero_fix: 'Javítandó: {n}',
    p_hero_ok: 'Minden rendben',
    p_count_active: 'Aktív: {n}',
    p_count_expiring: 'Hamarosan lejár: {n}',
    p_count_ko: 'Hibás: {n}',
    p_next: 'Következő lejárat: {name}, {date}',
    p_filter_all: "Mind: {n}",
    p_tile_fix: "Javítandó",
    p_tile_expiry: "Következő lejárat",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} válaszol",
    p_tile_conn: "Kapcsolatok",
    p_tile_conn_v: "{a} / {m} használatban",
    p_checked: 'Ellenőrizve: {when}',
    p_alert_unreachable: 'A szerver nem válaszol: az adatok az utolsó sikeres ellenőrzésből származnak.',
    p_alert_auth: 'A szolgáltató elutasítja a belépési adatokat: módosítsa őket itt: {settings}.',
    p_alert_ended: 'A szolgáltató szerint ez az előfizetés megszűnt.',
    p_alert_stream: 'A tesztcsatorna nem játszható le.',
    p_alert_expiring: 'Lejár: {date}, újítsa meg időben.',
    g_general: 'Általános',
    g_accounts: 'Fiókok',
    g_credentials: 'Belépési adatok',
    g_account: 'Fiók',
    g_health: 'Állapotellenőrzés',
    panel_display_hint: 'Minden felhasználónak közös',
    hide_off_hint: 'Az IPTV-sáv marad',
    hide_all_hint: 'A lapok a legtetejére kerülnek',
    hide_non_admin_hint: 'A rendszergazdák megtartják a sávot',
  },
  sk: {
    title: 'IPTV',
    accounts: 'Predplatné',
    settings: 'Nastavenia',
    none: 'Zatiaľ žiadny účet: pridajte ho tlačidlom „{add}“ na karte Predplatné.',
    loading: 'Načítava sa…',
    load_failed: 'Načítanie zlyhalo: {error}. Automaticky sa skúša znova.',
    retry: 'Skúsiť znova',
    f_name: 'Názov',
    f_name_hint: 'Ak chcete použiť názov servera, nechajte prázdne',
    f_scan: 'Interval dotazovania',
    f_scan_hint: 'Obnovenie predplatného, {min}–{max} min',
    f_notify: 'Upozornenie na vypršanie',
    f_notify_hint: 'Dni pred vypršaním, 0 = vypnuté',
    f_health: 'Interval kontroly servera',
    f_health_hint: 'Ľahká požiadavka na server, {min}–{max} min',
    f_stream: 'Počas kontroly otestovať stream kanála',
    f_stream_hint: 'Na niekoľko sekúnd obsadí jedno pripojenie',
    u_min: 'min',
    u_days: 'dní',
    save: 'Uložiť',
    saving: 'Ukladá sa…',
    saved: 'Uložené',
    check: 'Skontrolovať teraz',
    checking: 'Kontroluje sa…',
    checked_ok: 'Server odpovedal',
    checked_ko: 'Server je nedostupný',
    cred_username: 'Používateľské meno',
    cred_mac: 'MAC adresa',
    cred_password: 'Heslo',
    cred_show: 'Zobraziť heslo',
    cred_hide: 'Skryť heslo',
    cred_copy: 'Kopírovať',
    cred_copied: 'Skopírované',
    open_device: 'Zariadenie',
    open_integration: 'Zariadenia a služby',
    err_range: 'Hodnota je mimo rozsahu',
    err_not_found: 'Účet sa nenašiel',
    err_generic: 'Niečo sa pokazilo',
    st_loaded: 'Beží',
    st_setup_retry: 'Opakuje sa',
    st_setup_error: 'Nastavenie zlyhalo',
    st_not_loaded: 'Zastavené',
    st_other: 'Nedostupné',
    remove: 'Odstrániť',
    removing: 'Odstraňuje sa…',
    remove_title: 'Odstrániť tento účet?',
    remove_msg: '{name} nikdy nedokončil nastavenie, preto nemá zariadenie ani položku v karte. Odstrániť ho z Home Assistant?',
    cancel: 'Zrušiť',
    p_unavailable: 'Server IPTV je nedostupný',
    p_refresh: 'Obnoviť',
    p_edit_btn: 'Upraviť prihlasovacie údaje',
    p_edit_title: 'Upraviť účet',
    p_edit_url: 'URL servera',
    p_edit_username: 'Používateľské meno',
    p_edit_password: 'Heslo',
    p_edit_password_keep: 'Ak ho chcete zachovať, nechajte prázdne',
    p_edit_mac: 'MAC adresa',
    p_edit_save: 'Uložiť',
    p_edit_cancel: 'Zrušiť',
    p_edit_saving: 'Overuje sa…',
    p_err_invalid_auth: 'Prihlasovacie údaje boli odmietnuté',
    p_err_cannot_connect: 'Nedá sa pripojiť k serveru',
    p_err_invalid_mac: 'Neplatná MAC adresa',
    p_err_no_french_lists: 'U tohto poskytovateľa nie je žiadny francúzsky zoznam',
    p_err_french_unknown: 'Kategórie sa nepodarilo načítať',
    p_err_stream_ko: 'Testovací kanál sa neprehráva',
    p_err_already_configured: 'Tieto prihlasovacie údaje už používa iný účet',
    p_err_not_found: 'Účet sa nenašiel',
    p_err_generic: 'Aktualizácia zlyhala',
    p_err_existing_longer: 'Na tomto serveri už existuje účet s dlhšou platnosťou',
    p_err_empty_catalogue: 'Poskytovateľ nemá použiteľný katalóg',
    p_del_btn: 'Odstrániť účet',
    p_del_title: 'Odstrániť účet',
    p_del_confirm: 'Účet a jeho entity budú odstránené.',
    p_del_delete: 'Odstrániť',
    p_add_btn: 'Pridať účet',
    p_add_title: 'Pridať účet',
    p_add_provider: 'Typ poskytovateľa',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Pridať',
    p_status_active: 'Aktívne',
    p_status_expired: 'Vypršané',
    p_status_banned: 'Zablokované',
    p_status_disabled: 'Deaktivované',
    p_status_unknown: 'Neznáme',
    p_auth_failed: 'Neplatné prihlásenie',
    p_trial: 'Skúšobné',
    p_expiration: 'Platnosť do',
    p_never: 'Nikdy',
    p_unlimited: 'Neobmedzené',
    p_day_left: 'Zostávajúce dni: {n}',
    p_days_left: 'Zostávajúce dni: {n}',
    p_channels: 'kanály',
    p_movies: 'filmy',
    p_series: 'seriály',
    p_connections: 'pripojenia',
    p_french_on: 'FR',
    p_french_off: 'Bez FR',
    p_french_title: 'Francúzske zoznamy',
    p_last_check: 'Posledná kontrola',
    p_health_ok: 'Online',
    p_health_degraded: 'Pomalý',
    p_health_unreachable: 'Nedostupný',
    p_health_stream_ko: 'Stream nefunguje',
    p_health_auth_failed: 'Prihlasovacie údaje boli odmietnuté',
    all_accounts: 'Všetky účty',
    panel_display: 'Panel',
    f_hide_toolbar: 'Skryť horný panel',
    f_hide_toolbar_hint: 'Karty zostávajú; na telefóne sa bočná ponuka presunie vedľa nich',
    hide_off: 'Nie',
    hide_all: 'Pre všetkých',
    hide_non_admin: 'Pre neadministrátorov',
    p_hero_none: 'Zatiaľ žiadne predplatné',
    p_hero_one: '1 predplatné',
    p_hero_many: 'Predplatné: {n}',
    p_hero_fix: 'Na vyriešenie: {n}',
    p_hero_ok: 'Všetko v poriadku',
    p_count_active: 'Aktívne: {n}',
    p_count_expiring: 'Čoskoro vyprší: {n}',
    p_count_ko: 'S problémom: {n}',
    p_next: 'Najbližšie vypršanie: {name}, {date}',
    p_filter_all: "Všetky: {n}",
    p_tile_fix: "Na opravu",
    p_tile_expiry: "Najbližšie vypršanie",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} odpovedá",
    p_tile_conn: "Pripojenia",
    p_tile_conn_v: "{a} / {m} používa sa",
    p_checked: 'Skontrolované {when}',
    p_alert_unreachable: 'Server neodpovedá: údaje sú z poslednej úspešnej kontroly.',
    p_alert_auth: 'Poskytovateľ odmieta prihlasovacie údaje: zmeňte ich v {settings}.',
    p_alert_ended: 'Poskytovateľ hlási, že predplatné skončilo.',
    p_alert_stream: 'Testovací kanál sa neprehráva.',
    p_alert_expiring: 'Vyprší {date}: obnovte ho včas.',
    g_general: 'Všeobecné',
    g_accounts: 'Účty',
    g_credentials: 'Prihlasovacie údaje',
    g_account: 'Účet',
    g_health: 'Kontrola stavu',
    panel_display_hint: 'Spoločné pre všetkých používateľov',
    hide_off_hint: 'Panel IPTV zostáva',
    hide_all_hint: 'Karty sa presunú úplne hore',
    hide_non_admin_hint: 'Správcovia si panel ponechajú',
  },
  cs: {
    title: 'IPTV',
    accounts: 'Předplatná',
    settings: 'Nastavení',
    none: 'Zatím žádný účet: přidejte ho tlačítkem „{add}“ na kartě Předplatná.',
    loading: 'Načítání…',
    load_failed: 'Načtení se nezdařilo: {error}. Automaticky se zkouší znovu.',
    retry: 'Zkusit znovu',
    f_name: 'Název',
    f_name_hint: 'Chcete-li použít název serveru, nechte prázdné',
    f_scan: 'Interval dotazování',
    f_scan_hint: 'Obnovení předplatného, {min}–{max} min',
    f_notify: 'Upozornění na vypršení',
    f_notify_hint: 'Dny před vypršením, 0 = vypnuto',
    f_health: 'Interval kontroly serveru',
    f_health_hint: 'Lehký požadavek na server, {min}–{max} min',
    f_stream: 'Během kontroly otestovat stream kanálu',
    f_stream_hint: 'Na několik sekund obsadí jedno připojení',
    u_min: 'min',
    u_days: 'dní',
    save: 'Uložit',
    saving: 'Ukládání…',
    saved: 'Uloženo',
    check: 'Zkontrolovat nyní',
    checking: 'Kontrola…',
    checked_ok: 'Server odpověděl',
    checked_ko: 'Server je nedostupný',
    cred_username: 'Uživatelské jméno',
    cred_mac: 'MAC adresa',
    cred_password: 'Heslo',
    cred_show: 'Zobrazit heslo',
    cred_hide: 'Skrýt heslo',
    cred_copy: 'Kopírovat',
    cred_copied: 'Zkopírováno',
    open_device: 'Zařízení',
    open_integration: 'Zařízení a služby',
    err_range: 'Hodnota je mimo rozsah',
    err_not_found: 'Účet nebyl nalezen',
    err_generic: 'Něco se pokazilo',
    st_loaded: 'Běží',
    st_setup_retry: 'Opakování',
    st_setup_error: 'Nastavení selhalo',
    st_not_loaded: 'Zastaveno',
    st_other: 'Nedostupné',
    remove: 'Odebrat',
    removing: 'Odebírá se…',
    remove_title: 'Odebrat tento účet?',
    remove_msg: '{name} nikdy nedokončil nastavení, proto nemá zařízení ani položku v kartě. Odebrat ho z Home Assistant?',
    cancel: 'Zrušit',
    p_unavailable: 'Server IPTV je nedostupný',
    p_refresh: 'Obnovit',
    p_edit_btn: 'Upravit přihlašovací údaje',
    p_edit_title: 'Upravit účet',
    p_edit_url: 'URL serveru',
    p_edit_username: 'Uživatelské jméno',
    p_edit_password: 'Heslo',
    p_edit_password_keep: 'Chcete-li ho zachovat, nechte prázdné',
    p_edit_mac: 'MAC adresa',
    p_edit_save: 'Uložit',
    p_edit_cancel: 'Zrušit',
    p_edit_saving: 'Ověřování…',
    p_err_invalid_auth: 'Přihlašovací údaje byly odmítnuty',
    p_err_cannot_connect: 'Nelze se připojit k serveru',
    p_err_invalid_mac: 'Neplatná MAC adresa',
    p_err_no_french_lists: 'U tohoto poskytovatele není žádný francouzský seznam',
    p_err_french_unknown: 'Kategorie se nepodařilo načíst',
    p_err_stream_ko: 'Testovací kanál se nepřehrává',
    p_err_already_configured: 'Tyto přihlašovací údaje už používá jiný účet',
    p_err_not_found: 'Účet nebyl nalezen',
    p_err_generic: 'Aktualizace se nezdařila',
    p_err_existing_longer: 'Na tomto serveru už existuje účet s delší platností',
    p_err_empty_catalogue: 'Poskytovatel nemá použitelný katalog',
    p_del_btn: 'Odebrat účet',
    p_del_title: 'Odebrat účet',
    p_del_confirm: 'Účet a jeho entity budou odebrány.',
    p_del_delete: 'Smazat',
    p_add_btn: 'Přidat účet',
    p_add_title: 'Přidat účet',
    p_add_provider: 'Typ poskytovatele',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Přidat',
    p_status_active: 'Aktivní',
    p_status_expired: 'Vypršelo',
    p_status_banned: 'Zablokováno',
    p_status_disabled: 'Deaktivováno',
    p_status_unknown: 'Neznámé',
    p_auth_failed: 'Neplatné přihlášení',
    p_trial: 'Zkušební',
    p_expiration: 'Platnost do',
    p_never: 'Nikdy',
    p_unlimited: 'Neomezeno',
    p_day_left: 'Zbývající dny: {n}',
    p_days_left: 'Zbývající dny: {n}',
    p_channels: 'kanály',
    p_movies: 'filmy',
    p_series: 'seriály',
    p_connections: 'připojení',
    p_french_on: 'FR',
    p_french_off: 'Bez FR',
    p_french_title: 'Francouzské seznamy',
    p_last_check: 'Poslední kontrola',
    p_health_ok: 'Online',
    p_health_degraded: 'Pomalý',
    p_health_unreachable: 'Nedostupný',
    p_health_stream_ko: 'Stream nefunguje',
    p_health_auth_failed: 'Přihlašovací údaje byly odmítnuty',
    all_accounts: 'Všechny účty',
    panel_display: 'Panel',
    f_hide_toolbar: 'Skrýt horní lištu',
    f_hide_toolbar_hint: 'Karty zůstávají; na telefonu se boční nabídka přesune vedle nich',
    hide_off: 'Ne',
    hide_all: 'Pro všechny',
    hide_non_admin: 'Pro neadministrátory',
    p_hero_none: 'Zatím žádné předplatné',
    p_hero_one: '1 předplatné',
    p_hero_many: 'Předplatné: {n}',
    p_hero_fix: 'K vyřešení: {n}',
    p_hero_ok: 'Vše v pořádku',
    p_count_active: 'Aktivní: {n}',
    p_count_expiring: 'Brzy vyprší: {n}',
    p_count_ko: 'S problémem: {n}',
    p_next: 'Nejbližší vypršení: {name}, {date}',
    p_filter_all: "Vše: {n}",
    p_tile_fix: "K opravě",
    p_tile_expiry: "Nejbližší vypršení",
    p_tile_online: "Online",
    p_tile_online_v: "{n} / {t} odpovídá",
    p_tile_conn: "Připojení",
    p_tile_conn_v: "{a} / {m} používá se",
    p_checked: 'Zkontrolováno {when}',
    p_alert_unreachable: 'Server neodpovídá: údaje jsou z poslední úspěšné kontroly.',
    p_alert_auth: 'Poskytovatel odmítá přihlašovací údaje: změňte je v {settings}.',
    p_alert_ended: 'Poskytovatel hlásí, že předplatné skončilo.',
    p_alert_stream: 'Testovací kanál se nepřehrává.',
    p_alert_expiring: 'Vyprší {date}: obnovte ho včas.',
    g_general: 'Obecné',
    g_accounts: 'Účty',
    g_credentials: 'Přihlašovací údaje',
    g_account: 'Účet',
    g_health: 'Kontrola stavu',
    panel_display_hint: 'Společné pro všechny uživatele',
    hide_off_hint: 'Lišta IPTV zůstává',
    hide_all_hint: 'Karty se přesunou úplně nahoru',
    hide_non_admin_hint: 'Správci si lištu ponechají',
  },
  sl: {
    title: 'IPTV',
    accounts: 'Naročnine',
    settings: 'Nastavitve',
    none: 'Še ni računa: dodajte ga z »{add}« na zavihku Naročnine.',
    loading: 'Nalaganje …',
    load_failed: 'Nalaganje ni uspelo: {error}. Samodejno se poskuša znova.',
    retry: 'Poskusi znova',
    f_name: 'Ime',
    f_name_hint: 'Pustite prazno, da uporabite ime strežnika',
    f_scan: 'Interval poizvedovanja',
    f_scan_hint: 'Osvežitev naročnine, {min}–{max} min',
    f_notify: 'Obvestilo o poteku',
    f_notify_hint: 'Dnevi pred potekom, 0 = izklopljeno',
    f_health: 'Interval preverjanja strežnika',
    f_health_hint: 'Lahka zahteva strežniku, {min}–{max} min',
    f_stream: 'Med preverjanjem preizkusi pretok kanala',
    f_stream_hint: 'Za nekaj sekund zasede eno povezavo',
    u_min: 'min',
    u_days: 'dni',
    save: 'Shrani',
    saving: 'Shranjevanje …',
    saved: 'Shranjeno',
    check: 'Preveri zdaj',
    checking: 'Preverjanje …',
    checked_ok: 'Strežnik se je odzval',
    checked_ko: 'Strežnik ni dosegljiv',
    cred_username: 'Uporabniško ime',
    cred_mac: 'Naslov MAC',
    cred_password: 'Geslo',
    cred_show: 'Prikaži geslo',
    cred_hide: 'Skrij geslo',
    cred_copy: 'Kopiraj',
    cred_copied: 'Kopirano',
    open_device: 'Naprava',
    open_integration: 'Naprave in storitve',
    err_range: 'Vrednost je zunaj obsega',
    err_not_found: 'Računa ni mogoče najti',
    err_generic: 'Prišlo je do napake',
    st_loaded: 'Deluje',
    st_setup_retry: 'Ponovni poskus',
    st_setup_error: 'Nastavitev ni uspela',
    st_not_loaded: 'Ustavljeno',
    st_other: 'Ni na voljo',
    remove: 'Odstrani',
    removing: 'Odstranjevanje…',
    remove_title: 'Odstranim ta račun?',
    remove_msg: '{name} nikoli ni dokončal nastavitve, zato nima naprave ne vnosa na kartici. Ga odstranim iz Home Assistant?',
    cancel: 'Prekliči',
    p_unavailable: 'Strežnik IPTV ni dosegljiv',
    p_refresh: 'Osveži',
    p_edit_btn: 'Uredi poverilnice',
    p_edit_title: 'Uredi račun',
    p_edit_url: 'URL strežnika',
    p_edit_username: 'Uporabniško ime',
    p_edit_password: 'Geslo',
    p_edit_password_keep: 'Pustite prazno, da ga ohranite',
    p_edit_mac: 'Naslov MAC',
    p_edit_save: 'Shrani',
    p_edit_cancel: 'Prekliči',
    p_edit_saving: 'Preverjanje …',
    p_err_invalid_auth: 'Poverilnice so zavrnjene',
    p_err_cannot_connect: 'Strežnika ni mogoče doseči',
    p_err_invalid_mac: 'Neveljaven naslov MAC',
    p_err_no_french_lists: 'Ta ponudnik nima francoskega seznama',
    p_err_french_unknown: 'Kategorij ni bilo mogoče prebrati',
    p_err_stream_ko: 'Testni kanal se ne predvaja',
    p_err_already_configured: 'Te poverilnice že uporablja drug račun',
    p_err_not_found: 'Računa ni mogoče najti',
    p_err_generic: 'Posodobitev ni uspela',
    p_err_existing_longer: 'Na tem strežniku že obstaja račun z daljšo veljavnostjo',
    p_err_empty_catalogue: 'Ponudnik nima uporabnega kataloga',
    p_del_btn: 'Odstrani račun',
    p_del_title: 'Odstrani račun',
    p_del_confirm: 'Račun in njegove entitete bodo odstranjeni.',
    p_del_delete: 'Izbriši',
    p_add_btn: 'Dodaj račun',
    p_add_title: 'Dodaj račun',
    p_add_provider: 'Vrsta ponudnika',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Dodaj',
    p_status_active: 'Aktivna',
    p_status_expired: 'Potekla',
    p_status_banned: 'Blokirana',
    p_status_disabled: 'Onemogočena',
    p_status_unknown: 'Neznano',
    p_auth_failed: 'Neveljavne poverilnice',
    p_trial: 'Preizkus',
    p_expiration: 'Potek',
    p_never: 'Nikoli',
    p_unlimited: 'Neomejeno',
    p_day_left: 'Preostali dnevi: {n}',
    p_days_left: 'Preostali dnevi: {n}',
    p_channels: 'kanali',
    p_movies: 'filmi',
    p_series: 'serije',
    p_connections: 'povezave',
    p_french_on: 'FR',
    p_french_off: 'Brez FR',
    p_french_title: 'Francoski seznami',
    p_last_check: 'Zadnje preverjanje',
    p_health_ok: 'Na spletu',
    p_health_degraded: 'Počasen',
    p_health_unreachable: 'Nedosegljiv',
    p_health_stream_ko: 'Pretok ne deluje',
    p_health_auth_failed: 'Poverilnice so zavrnjene',
    all_accounts: 'Vsi računi',
    panel_display: 'Plošča',
    f_hide_toolbar: 'Skrij zgornjo vrstico',
    f_hide_toolbar_hint: 'Zavihki ostanejo; na telefonu se stranski meni premakne poleg njih',
    hide_off: 'Ne',
    hide_all: 'Za vse',
    hide_non_admin: 'Za neskrbnike',
    p_hero_none: 'Še ni naročnin',
    p_hero_one: '1 naročnina',
    p_hero_many: 'Naročnine: {n}',
    p_hero_fix: 'Za rešiti: {n}',
    p_hero_ok: 'Vse je v redu',
    p_count_active: 'Aktivne: {n}',
    p_count_expiring: 'Kmalu potečejo: {n}',
    p_count_ko: 'S težavo: {n}',
    p_next: 'Naslednji potek: {name}, {date}',
    p_filter_all: "Vsi: {n}",
    p_tile_fix: "Za popravilo",
    p_tile_expiry: "Naslednji potek",
    p_tile_online: "Na spletu",
    p_tile_online_v: "{n} / {t} odgovarja",
    p_tile_conn: "Povezave",
    p_tile_conn_v: "{a} / {m} v uporabi",
    p_checked: 'Preverjeno {when}',
    p_alert_unreachable: 'Strežnik se ne odziva: podatki so iz zadnjega uspešnega preverjanja.',
    p_alert_auth: 'Ponudnik zavrača prijavne podatke: spremenite jih v {settings}.',
    p_alert_ended: 'Ponudnik sporoča, da je naročnina potekla.',
    p_alert_stream: 'Testni kanal se ne predvaja.',
    p_alert_expiring: 'Poteče {date}: pravočasno jo podaljšajte.',
    g_general: 'Splošno',
    g_accounts: 'Računi',
    g_credentials: 'Prijavni podatki',
    g_account: 'Račun',
    g_health: 'Preverjanje stanja',
    panel_display_hint: 'Skupno za vse uporabnike',
    hide_off_hint: 'Vrstica IPTV ostane',
    hide_all_hint: 'Zavihki se pomaknejo čisto na vrh',
    hide_non_admin_hint: 'Skrbniki obdržijo vrstico',
  },
  lv: {
    title: 'IPTV',
    accounts: 'Abonementi',
    settings: 'Iestatījumi',
    none: 'Vēl nav konta: pievienojiet to ar “{add}” cilnē Abonementi.',
    loading: 'Ielādē…',
    load_failed: 'Neizdevās ielādēt: {error}. Automātiski mēģina vēlreiz.',
    retry: 'Mēģināt vēlreiz',
    f_name: 'Nosaukums',
    f_name_hint: 'Atstājiet tukšu, lai izmantotu servera nosaukumu',
    f_scan: 'Aptaujas intervāls',
    f_scan_hint: 'Abonementa atsvaidzināšana, {min}–{max} min',
    f_notify: 'Paziņojums par derīguma beigām',
    f_notify_hint: 'Dienas pirms derīguma beigām, 0 = izslēgts',
    f_health: 'Servera pārbaudes intervāls',
    f_health_hint: 'Viegls pieprasījums serverim, {min}–{max} min',
    f_stream: 'Pārbaudes laikā testēt kanāla straumi',
    f_stream_hint: 'Uz dažām sekundēm aizņem vienu savienojumu',
    u_min: 'min',
    u_days: 'dienas',
    save: 'Saglabāt',
    saving: 'Saglabā…',
    saved: 'Saglabāts',
    check: 'Pārbaudīt tagad',
    checking: 'Pārbauda…',
    checked_ok: 'Serveris atbildēja',
    checked_ko: 'Serveris nav sasniedzams',
    cred_username: 'Lietotājvārds',
    cred_mac: 'MAC adrese',
    cred_password: 'Parole',
    cred_show: 'Rādīt paroli',
    cred_hide: 'Slēpt paroli',
    cred_copy: 'Kopēt',
    cred_copied: 'Nokopēts',
    open_device: 'Ierīce',
    open_integration: 'Ierīces un pakalpojumi',
    err_range: 'Vērtība ārpus diapazona',
    err_not_found: 'Konts nav atrasts',
    err_generic: 'Kaut kas nogāja greizi',
    st_loaded: 'Darbojas',
    st_setup_retry: 'Atkārtots mēģinājums',
    st_setup_error: 'Iestatīšana neizdevās',
    st_not_loaded: 'Apturēts',
    st_other: 'Nav pieejams',
    remove: 'Noņemt',
    removing: 'Noņem…',
    remove_title: 'Noņemt šo kontu?',
    remove_msg: '{name} iestatīšana netika pabeigta, tāpēc tam nav ne ierīces, ne ieraksta kartē. Noņemt to no Home Assistant?',
    cancel: 'Atcelt',
    p_unavailable: 'IPTV serveris nepieejams',
    p_refresh: 'Atsvaidzināt',
    p_edit_btn: 'Rediģēt pieteikšanās datus',
    p_edit_title: 'Rediģēt kontu',
    p_edit_url: 'Servera URL',
    p_edit_username: 'Lietotājvārds',
    p_edit_password: 'Parole',
    p_edit_password_keep: 'Atstājiet tukšu, lai to saglabātu',
    p_edit_mac: 'MAC adrese',
    p_edit_save: 'Saglabāt',
    p_edit_cancel: 'Atcelt',
    p_edit_saving: 'Pārbauda…',
    p_err_invalid_auth: 'Pieteikšanās dati noraidīti',
    p_err_cannot_connect: 'Nevar sasniegt serveri',
    p_err_invalid_mac: 'Nederīga MAC adrese',
    p_err_no_french_lists: 'Šim pakalpojumu sniedzējam nav franču saraksta',
    p_err_french_unknown: 'Neizdevās nolasīt kategorijas',
    p_err_stream_ko: 'Testa kanāls netiek atskaņots',
    p_err_already_configured: 'Šos pieteikšanās datus jau izmanto cits konts',
    p_err_not_found: 'Konts nav atrasts',
    p_err_generic: 'Atjaunināšana neizdevās',
    p_err_existing_longer: 'Šajā serverī jau ir konts, kas ir derīgs ilgāk',
    p_err_empty_catalogue: 'Pakalpojumu sniedzējam nav izmantojama kataloga',
    p_del_btn: 'Noņemt kontu',
    p_del_title: 'Noņemt kontu',
    p_del_confirm: 'Konts un tā entītijas tiks noņemtas.',
    p_del_delete: 'Dzēst',
    p_add_btn: 'Pievienot kontu',
    p_add_title: 'Pievienot kontu',
    p_add_provider: 'Sniedzēja veids',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Pievienot',
    p_status_active: 'Aktīvs',
    p_status_expired: 'Beidzies',
    p_status_banned: 'Bloķēts',
    p_status_disabled: 'Atspējots',
    p_status_unknown: 'Nezināms',
    p_auth_failed: 'Nederīgi pieteikšanās dati',
    p_trial: 'Izmēģinājums',
    p_expiration: 'Derīguma beigas',
    p_never: 'Nekad',
    p_unlimited: 'Neierobežots',
    p_day_left: 'Vēl {n} d.',
    p_days_left: 'Vēl {n} d.',
    p_channels: 'kanāli',
    p_movies: 'filmas',
    p_series: 'seriāli',
    p_connections: 'savienojumi',
    p_french_on: 'FR',
    p_french_off: 'Nav FR',
    p_french_title: 'Franču saraksti',
    p_last_check: 'Pēdējā pārbaude',
    p_health_ok: 'Tiešsaistē',
    p_health_degraded: 'Lēns',
    p_health_unreachable: 'Nesasniedzams',
    p_health_stream_ko: 'Straume nedarbojas',
    p_health_auth_failed: 'Pieteikšanās dati noraidīti',
    all_accounts: 'Visi konti',
    panel_display: 'Panelis',
    f_hide_toolbar: 'Paslēpt augšējo joslu',
    f_hide_toolbar_hint: 'Cilnes paliek; tālrunī sānjoslas izvēlne pārvietojas blakus tām',
    hide_off: 'Nē',
    hide_all: 'Visiem',
    hide_non_admin: 'Ne-administratoriem',
    p_hero_none: 'Vēl nav abonementu',
    p_hero_one: '1 abonements',
    p_hero_many: 'Abonementi: {n}',
    p_hero_fix: 'Jānovērš: {n}',
    p_hero_ok: 'Viss kārtībā',
    p_count_active: 'Aktīvi: {n}',
    p_count_expiring: 'Drīz beigsies: {n}',
    p_count_ko: 'Ar problēmu: {n}',
    p_next: 'Nākamās beigas: {name}, {date}',
    p_filter_all: "Visi: {n}",
    p_tile_fix: "Jālabo",
    p_tile_expiry: "Nākamais termiņš",
    p_tile_online: "Tiešsaistē",
    p_tile_online_v: "{n} / {t} atbild",
    p_tile_conn: "Savienojumi",
    p_tile_conn_v: "{a} / {m} izmantoti",
    p_checked: 'Pārbaudīts {when}',
    p_alert_unreachable: 'Serveris neatbild: dati ir no pēdējās veiksmīgās pārbaudes.',
    p_alert_auth: 'Pakalpojumu sniedzējs noraida pieteikšanās datus: mainiet tos sadaļā {settings}.',
    p_alert_ended: 'Pakalpojumu sniedzējs ziņo, ka abonements ir beidzies.',
    p_alert_stream: 'Testa kanāls netiek atskaņots.',
    p_alert_expiring: 'Beidzas {date}: atjaunojiet laikus.',
    g_general: 'Vispārīgi',
    g_accounts: 'Konti',
    g_credentials: 'Pieteikšanās dati',
    g_account: 'Konts',
    g_health: 'Stāvokļa pārbaude',
    panel_display_hint: 'Kopīgs visiem lietotājiem',
    hide_off_hint: 'IPTV josla paliek',
    hide_all_hint: 'Cilnes pārvietojas pašā augšā',
    hide_non_admin_hint: 'Administratori saglabā joslu',
  },
  el: {
    title: 'IPTV',
    accounts: 'Συνδρομές',
    settings: 'Ρυθμίσεις',
    none: 'Δεν υπάρχει ακόμη λογαριασμός: προσθέστε έναν με «{add}» στην καρτέλα Συνδρομές.',
    loading: 'Φόρτωση…',
    load_failed: 'Αποτυχία φόρτωσης: {error}. Νέα αυτόματη προσπάθεια.',
    retry: 'Δοκιμή ξανά',
    f_name: 'Όνομα',
    f_name_hint: 'Αφήστε το κενό για να χρησιμοποιηθεί το όνομα του διακομιστή',
    f_scan: 'Διάστημα ερωτήματος',
    f_scan_hint: 'Ανανέωση συνδρομής, {min}–{max} λεπτά',
    f_notify: 'Ειδοποίηση λήξης',
    f_notify_hint: 'Ημέρες πριν από τη λήξη, 0 = ανενεργή',
    f_health: 'Διάστημα ελέγχου διακομιστή',
    f_health_hint: 'Ελαφρύ αίτημα προς τον διακομιστή, {min}–{max} λεπτά',
    f_stream: 'Δοκιμή της ροής ενός καναλιού κατά τον έλεγχο',
    f_stream_hint: 'Δεσμεύει μία σύνδεση για λίγα δευτερόλεπτα',
    u_min: 'λεπτά',
    u_days: 'ημέρες',
    save: 'Αποθήκευση',
    saving: 'Αποθήκευση…',
    saved: 'Αποθηκεύτηκε',
    check: 'Έλεγχος τώρα',
    checking: 'Έλεγχος…',
    checked_ok: 'Ο διακομιστής απάντησε',
    checked_ko: 'Ο διακομιστής δεν είναι προσβάσιμος',
    cred_username: 'Όνομα χρήστη',
    cred_mac: 'Διεύθυνση MAC',
    cred_password: 'Κωδικός',
    cred_show: 'Εμφάνιση κωδικού πρόσβασης',
    cred_hide: 'Απόκρυψη κωδικού πρόσβασης',
    cred_copy: 'Αντιγραφή',
    cred_copied: 'Αντιγράφηκε',
    open_device: 'Συσκευή',
    open_integration: 'Συσκευές & υπηρεσίες',
    err_range: 'Τιμή εκτός ορίων',
    err_not_found: 'Ο λογαριασμός δεν βρέθηκε',
    err_generic: 'Κάτι πήγε στραβά',
    st_loaded: 'Σε λειτουργία',
    st_setup_retry: 'Νέα προσπάθεια',
    st_setup_error: 'Η ρύθμιση απέτυχε',
    st_not_loaded: 'Σταματημένη',
    st_other: 'Μη διαθέσιμη',
    remove: 'Αφαίρεση',
    removing: 'Αφαίρεση…',
    remove_title: 'Αφαίρεση αυτού του λογαριασμού;',
    remove_msg: 'Το {name} δεν ολοκλήρωσε ποτέ τη ρύθμισή του, άρα δεν έχει συσκευή ούτε θέση στην κάρτα. Να αφαιρεθεί από το Home Assistant;',
    cancel: 'Άκυρο',
    p_unavailable: 'Διακομιστής IPTV μη προσβάσιμος',
    p_refresh: 'Ανανέωση',
    p_edit_btn: 'Επεξεργασία διαπιστευτηρίων',
    p_edit_title: 'Αλλαγή λογαριασμού',
    p_edit_url: 'URL διακομιστή',
    p_edit_username: 'Όνομα χρήστη',
    p_edit_password: 'Κωδικός',
    p_edit_password_keep: 'Αφήστε το κενό για να διατηρηθεί',
    p_edit_mac: 'Διεύθυνση MAC',
    p_edit_save: 'Αποθήκευση',
    p_edit_cancel: 'Άκυρο',
    p_edit_saving: 'Έλεγχος…',
    p_err_invalid_auth: 'Τα διαπιστευτήρια απορρίφθηκαν',
    p_err_cannot_connect: 'Δεν είναι δυνατή η σύνδεση με τον διακομιστή',
    p_err_invalid_mac: 'Μη έγκυρη διεύθυνση MAC',
    p_err_no_french_lists: 'Δεν υπάρχει γαλλική λίστα σε αυτόν τον πάροχο',
    p_err_french_unknown: 'Δεν ήταν δυνατή η ανάγνωση των κατηγοριών',
    p_err_stream_ko: 'Το δοκιμαστικό κανάλι δεν αναπαράγεται',
    p_err_already_configured: 'Άλλος λογαριασμός χρησιμοποιεί ήδη αυτά τα διαπιστευτήρια',
    p_err_not_found: 'Ο λογαριασμός δεν βρέθηκε',
    p_err_generic: 'Η ενημέρωση απέτυχε',
    p_err_existing_longer: 'Υπάρχει ήδη σε αυτόν τον διακομιστή λογαριασμός με μεγαλύτερη ισχύ',
    p_err_empty_catalogue: 'Ο πάροχος δεν έχει αξιοποιήσιμο κατάλογο',
    p_del_btn: 'Αφαίρεση λογαριασμού',
    p_del_title: 'Διαγραφή λογαριασμού',
    p_del_confirm: 'Ο λογαριασμός και οι οντότητές του θα αφαιρεθούν.',
    p_del_delete: 'Διαγραφή',
    p_add_btn: 'Προσθήκη λογαριασμού',
    p_add_title: 'Νέος λογαριασμός',
    p_add_provider: 'Τύπος παρόχου',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Προσθήκη',
    p_status_active: 'Ενεργή',
    p_status_expired: 'Έληξε',
    p_status_banned: 'Αποκλεισμένη',
    p_status_disabled: 'Ανενεργή',
    p_status_unknown: 'Άγνωστη',
    p_auth_failed: 'Μη έγκυρα διαπιστευτήρια',
    p_trial: 'Δοκιμαστική',
    p_expiration: 'Λήξη',
    p_never: 'Ποτέ',
    p_unlimited: 'Απεριόριστη',
    p_day_left: 'Ακόμη {n} ημ.',
    p_days_left: 'Ακόμη {n} ημ.',
    p_channels: 'κανάλια',
    p_movies: 'ταινίες',
    p_series: 'σειρές',
    p_connections: 'συνδέσεις',
    p_french_on: 'FR',
    p_french_off: 'Χωρίς FR',
    p_french_title: 'Γαλλικές λίστες',
    p_last_check: 'Τελ. έλεγχος',
    p_health_ok: 'Σε σύνδεση',
    p_health_degraded: 'Αργός',
    p_health_unreachable: 'Μη προσβάσιμος',
    p_health_stream_ko: 'Η ροή δεν λειτουργεί',
    p_health_auth_failed: 'Τα διαπιστευτήρια απορρίφθηκαν',
    all_accounts: 'Όλοι οι λογαριασμοί',
    panel_display: 'Πίνακας',
    f_hide_toolbar: 'Απόκρυψη της επάνω γραμμής',
    f_hide_toolbar_hint: 'Οι καρτέλες παραμένουν· στο κινητό το πλευρικό μενού μετακινείται δίπλα τους',
    hide_off: 'Όχι',
    hide_all: 'Για όλους',
    hide_non_admin: 'Για μη διαχειριστές',
    p_hero_none: 'Δεν υπάρχει συνδρομή ακόμη',
    p_hero_one: '1 συνδρομή',
    p_hero_many: '{n} συνδρομές',
    p_hero_fix: 'Προς επίλυση: {n}',
    p_hero_ok: 'Όλα καλά',
    p_count_active: 'Ενεργές: {n}',
    p_count_expiring: 'Λήγουν σύντομα: {n}',
    p_count_ko: 'Με πρόβλημα: {n}',
    p_next: 'Επόμενη λήξη: {name}, {date}',
    p_filter_all: "Όλα: {n}",
    p_tile_fix: "Προς διόρθωση",
    p_tile_expiry: "Επόμενη λήξη",
    p_tile_online: "Σε σύνδεση",
    p_tile_online_v: "{n} / {t} απαντούν",
    p_tile_conn: "Συνδέσεις",
    p_tile_conn_v: "{a} / {m} σε χρήση",
    p_checked: 'Ελέγχθηκε {when}',
    p_alert_unreachable: 'Ο διακομιστής δεν απαντά: τα στοιχεία είναι από τον τελευταίο επιτυχή έλεγχο.',
    p_alert_auth: 'Ο πάροχος απορρίπτει τα στοιχεία σύνδεσης: αλλάξτε τα στις {settings}.',
    p_alert_ended: 'Ο πάροχος αναφέρει ότι η συνδρομή έληξε.',
    p_alert_stream: 'Το δοκιμαστικό κανάλι δεν παίζει.',
    p_alert_expiring: 'Λήγει στις {date}: ανανεώστε την έγκαιρα.',
    g_general: 'Γενικά',
    g_accounts: 'Λογαριασμοί',
    g_credentials: 'Στοιχεία σύνδεσης',
    g_account: 'Λογαριασμός',
    g_health: 'Έλεγχος κατάστασης',
    panel_display_hint: 'Κοινό για όλους τους χρήστες',
    hide_off_hint: 'Η γραμμή IPTV παραμένει',
    hide_all_hint: 'Οι καρτέλες ανεβαίνουν στην κορυφή',
    hide_non_admin_hint: 'Οι διαχειριστές κρατούν τη γραμμή',
  },
  sr: {
    title: 'IPTV',
    accounts: 'Претплате',
    settings: 'Подешавања',
    none: 'Још нема налога: додајте га помоћу „{add}“ на картици Претплате.',
    loading: 'Учитавање…',
    load_failed: 'Учитавање није успело: {error}. Аутоматски се покушава поново.',
    retry: 'Покушај поново',
    f_name: 'Назив',
    f_name_hint: 'Оставите празно да се користи назив сервера',
    f_scan: 'Интервал освежавања',
    f_scan_hint: 'Освежавање претплате, {min}–{max} мин',
    f_notify: 'Обавештење о истеку',
    f_notify_hint: 'Дана пре истека, 0 = искључено',
    f_health: 'Интервал провере сервера',
    f_health_hint: 'Лаган захтев серверу, {min}–{max} мин',
    f_stream: 'Тестирај стрим канала током провере сервера',
    f_stream_hint: 'Заузима једну везу на неколико секунди',
    u_min: 'мин',
    u_days: 'дана',
    save: 'Сачувај',
    saving: 'Чување…',
    saved: 'Сачувано',
    check: 'Провери сада',
    checking: 'Провера…',
    checked_ok: 'Сервер је одговорио',
    checked_ko: 'Сервер није доступан',
    cred_username: 'Корисничко име',
    cred_mac: 'MAC адреса',
    cred_password: 'Лозинка',
    cred_show: 'Прикажи лозинку',
    cred_hide: 'Сакриј лозинку',
    cred_copy: 'Копирај',
    cred_copied: 'Копирано',
    open_device: 'Уређај',
    open_integration: 'Уређаји и услуге',
    err_range: 'Вредност је ван опсега',
    err_not_found: 'Налог није пронађен',
    err_generic: 'Дошло је до грешке',
    st_loaded: 'Ради',
    st_setup_retry: 'Поновни покушај',
    st_setup_error: 'Подешавање није успело',
    st_not_loaded: 'Заустављено',
    st_other: 'Недоступно',
    remove: 'Уклони',
    removing: 'Уклањање…',
    remove_title: 'Уклонити овај налог?',
    remove_msg: '{name} никада није завршио подешавање, па нема ни уређај ни ставку у картици. Уклонити га из Home Assistant?',
    cancel: 'Откажи',
    p_unavailable: 'IPTV сервер није доступан',
    p_refresh: 'Освежи',
    p_edit_btn: 'Измени податке за пријаву',
    p_edit_title: 'Измени налог',
    p_edit_url: 'URL сервера',
    p_edit_username: 'Корисничко име',
    p_edit_password: 'Лозинка',
    p_edit_password_keep: 'Оставите празно да задржите',
    p_edit_mac: 'MAC адреса',
    p_edit_save: 'Сачувај',
    p_edit_cancel: 'Откажи',
    p_edit_saving: 'Провера…',
    p_err_invalid_auth: 'Подаци за пријаву су одбијени',
    p_err_cannot_connect: 'Сервер није доступан',
    p_err_invalid_mac: 'Неважећа MAC адреса',
    p_err_no_french_lists: 'Овај провајдер нема ниједну француску листу',
    p_err_french_unknown: 'Није могуће прочитати категорије',
    p_err_stream_ko: 'Тест канал се не репродукује',
    p_err_already_configured: 'Други налог већ користи ове податке за пријаву',
    p_err_not_found: 'Налог није пронађен',
    p_err_generic: 'Ажурирање није успело',
    p_err_existing_longer: 'На овом серверу већ постоји налог који важи дуже',
    p_err_empty_catalogue: 'Провајдер нема употребљив каталог',
    p_del_btn: 'Уклони налог',
    p_del_title: 'Уклони налог',
    p_del_confirm: 'Налог и његови ентитети биће уклоњени.',
    p_del_delete: 'Обриши',
    p_add_btn: 'Додај налог',
    p_add_title: 'Додај налог',
    p_add_provider: 'Тип провајдера',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Додај',
    p_status_active: 'Активна',
    p_status_expired: 'Истекла',
    p_status_banned: 'Блокирана',
    p_status_disabled: 'Онемогућена',
    p_status_unknown: 'Непозната',
    p_auth_failed: 'Неважећи подаци за пријаву',
    p_trial: 'Пробни период',
    p_expiration: 'Истек',
    p_never: 'Никад',
    p_unlimited: 'Неограничено',
    p_day_left: 'Преостао {n} дан',
    p_days_left: 'Преостало дана: {n}',
    p_channels: 'канали',
    p_movies: 'филмови',
    p_series: 'серије',
    p_connections: 'везе',
    p_french_on: 'FR',
    p_french_off: 'Без FR',
    p_french_title: 'Француске листе',
    p_last_check: 'Последња провера',
    p_health_ok: 'На мрежи',
    p_health_degraded: 'Споро',
    p_health_unreachable: 'Недоступно',
    p_health_stream_ko: 'Стрим не ради',
    p_health_auth_failed: 'Подаци за пријаву одбијени',
    all_accounts: 'Сви налози',
    panel_display: 'Панел',
    f_hide_toolbar: 'Сакриј горњу траку',
    f_hide_toolbar_hint: 'Картице остају; на телефону бочни мени прелази поред њих',
    hide_off: 'Не',
    hide_all: 'За све',
    hide_non_admin: 'За кориснике који нису администратори',
    p_hero_none: 'Још нема претплата',
    p_hero_one: '1 претплата',
    p_hero_many: 'Претплате: {n}',
    p_hero_fix: 'За решавање: {n}',
    p_hero_ok: 'Све је у реду',
    p_count_active: 'Активне: {n}',
    p_count_expiring: 'Ускоро истичу: {n}',
    p_count_ko: 'Са проблемом: {n}',
    p_next: 'Следеће истицање: {name}, {date}',
    p_filter_all: "Сви: {n}",
    p_tile_fix: "За исправку",
    p_tile_expiry: "Следеће истицање",
    p_tile_online: "На мрежи",
    p_tile_online_v: "{n} / {t} одговара",
    p_tile_conn: "Везе",
    p_tile_conn_v: "{a} / {m} у употреби",
    p_checked: 'Проверено {when}',
    p_alert_unreachable: 'Сервер не одговара: подаци су са последње успешне провере.',
    p_alert_auth: 'Провајдер одбија податке за пријаву: измените их у {settings}.',
    p_alert_ended: 'Провајдер јавља да је претплата истекла.',
    p_alert_stream: 'Тест канал се не репродукује.',
    p_alert_expiring: 'Истиче {date}: обновите је на време.',
    g_general: 'Опште',
    g_accounts: 'Налози',
    g_credentials: 'Подаци за пријаву',
    g_account: 'Налог',
    g_health: 'Провера стања',
    panel_display_hint: 'Заједничко за све кориснике',
    hide_off_hint: 'Трака IPTV остаје',
    hide_all_hint: 'Картице се пењу скроз горе',
    hide_non_admin_hint: 'Администратори задржавају траку',
  },
  'sr-Latn': {
    title: 'IPTV',
    accounts: 'Pretplate',
    settings: 'Podešavanja',
    none: 'Još nema naloga: dodajte ga pomoću „{add}“ na kartici Pretplate.',
    loading: 'Učitavanje…',
    load_failed: 'Učitavanje nije uspelo: {error}. Automatski se pokušava ponovo.',
    retry: 'Pokušaj ponovo',
    f_name: 'Naziv',
    f_name_hint: 'Ostavite prazno da se koristi naziv servera',
    f_scan: 'Interval osvežavanja',
    f_scan_hint: 'Osvežavanje pretplate, {min}–{max} min',
    f_notify: 'Obaveštenje o isteku',
    f_notify_hint: 'Dana pre isteka, 0 = isključeno',
    f_health: 'Interval provere servera',
    f_health_hint: 'Lagan zahtev serveru, {min}–{max} min',
    f_stream: 'Testiraj strim kanala tokom provere servera',
    f_stream_hint: 'Zauzima jednu vezu na nekoliko sekundi',
    u_min: 'min',
    u_days: 'dana',
    save: 'Sačuvaj',
    saving: 'Čuvanje…',
    saved: 'Sačuvano',
    check: 'Proveri sada',
    checking: 'Provera…',
    checked_ok: 'Server je odgovorio',
    checked_ko: 'Server nije dostupan',
    cred_username: 'Korisničko ime',
    cred_mac: 'MAC adresa',
    cred_password: 'Lozinka',
    cred_show: 'Prikaži lozinku',
    cred_hide: 'Sakrij lozinku',
    cred_copy: 'Kopiraj',
    cred_copied: 'Kopirano',
    open_device: 'Uređaj',
    open_integration: 'Uređaji i usluge',
    err_range: 'Vrednost je van opsega',
    err_not_found: 'Nalog nije pronađen',
    err_generic: 'Došlo je do greške',
    st_loaded: 'Radi',
    st_setup_retry: 'Ponovni pokušaj',
    st_setup_error: 'Podešavanje nije uspelo',
    st_not_loaded: 'Zaustavljeno',
    st_other: 'Nedostupno',
    remove: 'Ukloni',
    removing: 'Uklanjanje…',
    remove_title: 'Ukloniti ovaj nalog?',
    remove_msg: '{name} nikada nije završio podešavanje, pa nema ni uređaj ni stavku u kartici. Ukloniti ga iz Home Assistant?',
    cancel: 'Otkaži',
    p_unavailable: 'IPTV server nije dostupan',
    p_refresh: 'Osveži',
    p_edit_btn: 'Izmeni podatke za prijavu',
    p_edit_title: 'Izmeni nalog',
    p_edit_url: 'URL servera',
    p_edit_username: 'Korisničko ime',
    p_edit_password: 'Lozinka',
    p_edit_password_keep: 'Ostavite prazno da zadržite',
    p_edit_mac: 'MAC adresa',
    p_edit_save: 'Sačuvaj',
    p_edit_cancel: 'Otkaži',
    p_edit_saving: 'Provera…',
    p_err_invalid_auth: 'Podaci za prijavu su odbijeni',
    p_err_cannot_connect: 'Server nije dostupan',
    p_err_invalid_mac: 'Nevažeća MAC adresa',
    p_err_no_french_lists: 'Ovaj provajder nema nijednu francusku listu',
    p_err_french_unknown: 'Nije moguće pročitati kategorije',
    p_err_stream_ko: 'Test kanal se ne reprodukuje',
    p_err_already_configured: 'Drugi nalog već koristi ove podatke za prijavu',
    p_err_not_found: 'Nalog nije pronađen',
    p_err_generic: 'Ažuriranje nije uspelo',
    p_err_existing_longer: 'Na ovom serveru već postoji nalog koji važi duže',
    p_err_empty_catalogue: 'Provajder nema upotrebljiv katalog',
    p_del_btn: 'Ukloni nalog',
    p_del_title: 'Ukloni nalog',
    p_del_confirm: 'Nalog i njegovi entiteti biće uklonjeni.',
    p_del_delete: 'Obriši',
    p_add_btn: 'Dodaj nalog',
    p_add_title: 'Dodaj nalog',
    p_add_provider: 'Tip provajdera',
    p_add_xtream: 'Xtream Codes',
    p_add_stalker: 'Stalker / Ministra',
    p_add_create: 'Dodaj',
    p_status_active: 'Aktivna',
    p_status_expired: 'Istekla',
    p_status_banned: 'Blokirana',
    p_status_disabled: 'Onemogućena',
    p_status_unknown: 'Nepoznata',
    p_auth_failed: 'Nevažeći podaci za prijavu',
    p_trial: 'Probni period',
    p_expiration: 'Istek',
    p_never: 'Nikad',
    p_unlimited: 'Neograničeno',
    p_day_left: 'Preostao {n} dan',
    p_days_left: 'Preostalo dana: {n}',
    p_channels: 'kanali',
    p_movies: 'filmovi',
    p_series: 'serije',
    p_connections: 'veze',
    p_french_on: 'FR',
    p_french_off: 'Bez FR',
    p_french_title: 'Francuske liste',
    p_last_check: 'Poslednja provera',
    p_health_ok: 'Na mreži',
    p_health_degraded: 'Sporo',
    p_health_unreachable: 'Nedostupno',
    p_health_stream_ko: 'Strim ne radi',
    p_health_auth_failed: 'Podaci za prijavu odbijeni',
    all_accounts: 'Svi nalozi',
    panel_display: 'Panel',
    f_hide_toolbar: 'Sakrij gornju traku',
    f_hide_toolbar_hint: 'Kartice ostaju; na telefonu bočni meni prelazi pored njih',
    hide_off: 'Ne',
    hide_all: 'Za sve',
    hide_non_admin: 'Za korisnike koji nisu administratori',
    p_hero_none: 'Još nema pretplata',
    p_hero_one: '1 pretplata',
    p_hero_many: 'Pretplate: {n}',
    p_hero_fix: 'Za rešavanje: {n}',
    p_hero_ok: 'Sve je u redu',
    p_count_active: 'Aktivne: {n}',
    p_count_expiring: 'Uskoro ističu: {n}',
    p_count_ko: 'Sa problemom: {n}',
    p_next: 'Sledeće isticanje: {name}, {date}',
    p_filter_all: "Svi: {n}",
    p_tile_fix: "Za ispravku",
    p_tile_expiry: "Sledeće isticanje",
    p_tile_online: "Na mreži",
    p_tile_online_v: "{n} / {t} odgovara",
    p_tile_conn: "Veze",
    p_tile_conn_v: "{a} / {m} u upotrebi",
    p_checked: 'Provereno {when}',
    p_alert_unreachable: 'Server ne odgovara: podaci su sa poslednje uspešne provere.',
    p_alert_auth: 'Provajder odbija podatke za prijavu: izmenite ih u {settings}.',
    p_alert_ended: 'Provajder javlja da je pretplata istekla.',
    p_alert_stream: 'Test kanal se ne reprodukuje.',
    p_alert_expiring: 'Ističe {date}: obnovite je na vreme.',
    g_general: 'Opšte',
    g_accounts: 'Nalozi',
    g_credentials: 'Podaci za prijavu',
    g_account: 'Nalog',
    g_health: 'Provera stanja',
    panel_display_hint: 'Zajedničko za sve korisnike',
    hide_off_hint: 'Traka IPTV ostaje',
    hide_all_hint: 'Kartice se penju skroz gore',
    hide_non_admin_hint: 'Administratori zadržavaju traku',
  },
};

// Same limits as the options flow (const.py)
var IPTV_PANEL_LIMITS = {
  scan_interval: [5, 1440],
  notify_days: [0, 60],
  health_interval: [1, 60],
};

var IPTV_PANEL_TABS = ['accounts', 'settings'];
// Who the top bar is hidden for (iptv/panel_settings): nobody, everyone, non-administrators only
var IPTV_PANEL_HIDE_TOOLBAR = ['off', 'all', 'non_admin'];
// The Panel entry of the Settings list (its own settings), beside the accounts
var IPTV_PANEL_GENERAL = '__panel__';
// Days left under which an active subscription is shown as expiring
var IPTV_PANEL_WARNING_DAYS = 7;

// The subscriptions: the iptv entities of each device, by translation key, sorted by device name
function iptvPanelSubscriptions(hass) {
  var byDevice = {};
  Object.values(hass?.entities || {}).forEach((entry) => {
    if (entry?.platform !== 'iptv' || !entry.translation_key || !entry.device_id) return;
    (byDevice[entry.device_id] ||= {})[entry.translation_key] = entry.entity_id;
  });
  return Object.entries(byDevice)
    .map(([device, ids]) => {
      var dev = hass?.devices?.[device];
      return { device, ids, name: dev?.name_by_user || dev?.name || '' };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// What a subscription looks like now, from its entity states; null without a status entity
function iptvPanelSummary(hass, ids, now = Date.now()) {
  var states = hass?.states || {};
  var status = states[ids.status];
  if (!status) return null;
  if (status.state === 'unavailable') return { tone: 'bad', unavailable: true };
  var value = (key) => {
    var st = ids[key] && states[ids[key]];
    return st && !['unknown', 'unavailable'].includes(st.state) ? st.state : null;
  };
  var number = (key) => (value(key) === null ? null : Number(value(key)));
  var expires = value('expiration') ? Date.parse(value('expiration')) : null;
  var created = value('created') ? Date.parse(value('created')) : null;
  var daysLeft = expires ? Math.ceil((expires - now) / 86400000) : null;
  var raw = String(value('status') || '').toLowerCase();
  var auth = status.state !== 'invalid_auth';
  var active = auth && raw === 'active' && (daysLeft === null || daysLeft > 0);
  var tone = !active ? 'bad' : daysLeft !== null && daysLeft <= IPTV_PANEL_WARNING_DAYS ? 'warn' : 'good';
  // How much of the subscription is left: from its start date, else the shortest usual length that covers it
  var left = null;
  if (expires && created && expires > created) left = (expires - now) / (expires - created);
  else if (expires && expires > now) {
    var period = [30, 91, 182, 365].map((n) => n * 86400000).find((p) => p >= expires - now) || Math.ceil((expires - now) / (365 * 86400000)) * 365 * 86400000;
    left = (expires - now) / period;
  }
  var health = states[ids.health];
  var french = states[ids.french_lists]?.state;
  return {
    tone,
    status: !auth ? 'p_auth_failed' : ['active', 'expired', 'banned', 'disabled'].includes(raw) ? `p_status_${raw}` : 'p_status_unknown',
    expires,
    daysLeft,
    left: left === null ? null : Math.min(1, Math.max(0, left)),
    trial: value('trial') === 'on',
    counts: { channels: number('channels'), movies: number('movies'), series: number('series') },
    connections: [number('active_connections'), number('max_connections')],
    health:
      health && !['unknown', 'unavailable'].includes(health.state)
        ? { state: health.state, ms: health.attributes?.response_time_ms ?? null, at: health.attributes?.last_check || null }
        : null,
    french: french === 'on' ? true : french === 'off' ? false : null,
  };
}

// The message of an error code from the add or edit command; an unknown one is a generic failure
function iptvPanelError(lang, code) {
  var key = `p_err_${code || 'generic'}`;
  return iptvPanelT(lang, IptvPanelI18n.en[key] ? key : 'p_err_generic');
}

function iptvPanelT(lang, key, vars) {
  var table = IptvPanelI18n[lang] || IptvPanelI18n.en;
  var text = table[key] || IptvPanelI18n.en[key] || key;
  Object.entries(vars || {}).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

function iptvPanelEsc(value) {
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (ch) => map[ch]);
}

// How bad a subscription is now: bad (refused, ended, unreachable, its stream down), warn (expiring) or good.
// `alert` names the message the tile shows for it.
function iptvPanelSeverity(summary) {
  if (!summary || summary.unavailable) return { tone: 'bad', alert: 'p_alert_unreachable' };
  var health = summary.health?.state;
  if (summary.status === 'p_auth_failed' || health === 'auth_failed') return { tone: 'bad', alert: 'p_alert_auth' };
  if (summary.tone === 'bad') return { tone: 'bad', alert: 'p_alert_ended' };
  if (health === 'unreachable') return { tone: 'bad', alert: 'p_alert_unreachable' };
  if (health === 'stream_ko') return { tone: 'bad', alert: 'p_alert_stream' };
  if (summary.tone === 'warn') return { tone: 'warn', alert: 'p_alert_expiring' };
  return { tone: 'good', alert: null };
}

// The picture of a state, as on the card: a live channel, a dark screen in standby, a red cross
function iptvPanelScene(tone) {
  return { bad: 'offline', idle: 'idle' }[tone] || 'playing';
}

// The card's living-room TV over its cabinet (the right 102 × 80 of a 200 × 80 picture). `uid` keeps clip paths apart.
function iptvPanelSceneSvg(state, uid) {
  var screen;
  if (state === 'offline') {
    screen = '<g class="tv-x" transform="translate(147 35)"><circle r="7"/><path d="M-3 -3 l6 6 M3 -3 l-6 6"/></g>';
  } else if (state === 'idle') {
    screen = '<path class="tv-glare" d="M150 13 h14 l-26 44 h-14 Z"/>';
  } else {
    screen = `<g clip-path="url(#tv-scr-${uid})"><g class="tv-show"><circle class="tv-sun" cx="128" cy="30" r="6"/>` +
      '<path class="tv-hill" d="M107 57 L130 40 L146 50 L164 36 L187 52 V57Z"/></g></g>' +
      '<g class="tv-live"><rect x="111" y="16" width="18" height="6" rx="1"/><text x="120" y="20.6" text-anchor="middle">LIVE</text></g>';
  }
  return `<svg class="scene ${state}" viewBox="98 0 102 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">` +
    `<defs><clipPath id="tv-scr-${uid}"><rect x="107" y="13" width="80" height="44"/></clipPath></defs>` +
    '<rect class="tv-frame" x="104" y="10" width="86" height="50" rx="2"/><rect class="tv-screen" x="107" y="13" width="80" height="44"/>' +
    `${screen}<circle class="tv-led" cx="186" cy="58.4" r=".9"/>` +
    '<rect class="tv-cab" x="120" y="63" width="54" height="17" rx="1.5"/><rect class="tv-cab-top" x="120" y="63" width="54" height="2.4" rx="1"/>' +
    '<path class="tv-cab-line" d="M147 67 V78 M124 71.5 H143 M151 71.5 H170"/></svg>';
}

// A small glyph on a tile's round icon: a tick, an exclamation mark or a cross, in a dot of the state colour
function iptvPanelGlyph(tone) {
  var d = { good: 'M7 12.5l3 3 7-7', warn: 'M12 7v6M12 16.5v.5' }[tone] || 'M8 8l8 8M16 8l-8 8';
  return `<span class="st-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></span>`;
}

// Tone of a config entry state, for its pill
function iptvPanelTone(state) {
  if (state === 'loaded') return 'good';
  if (state === 'setup_retry' || state === 'not_loaded') return 'warn';
  return 'bad';
}

class IptvPanel extends HTMLElement {
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
    if (this._hass && !this._unsub) this._subscribe();
    this._watchConnection(true);
    // Back on the panel after a failed load: try again now.
    if (this._hass && this._failed) this._reload();
  }

  disconnectedCallback() {
    this._watchConnection(false);
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
