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
var IPTV_CARD_VERSION = '3.25.0';
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
    view_m3u: 'M3U playlist',
    view_xmltv: 'EPG guide (XMLTV)',
    view_title: 'Credentials',
    copy: 'Copy',
    view_show: 'Show',
    view_hide: 'Hide',
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
    view_m3u: 'Liste M3U',
    view_xmltv: 'Guide EPG (XMLTV)',
    view_title: 'Identifiants',
    copy: 'Copier',
    view_show: 'Afficher',
    view_hide: 'Masquer',
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
    view_m3u: 'M3U-Wiedergabeliste',
    view_xmltv: 'EPG-Programmführer (XMLTV)',
    view_title: 'Zugangsdaten',
    copy: 'Kopieren',
    view_show: 'Anzeigen',
    view_hide: 'Ausblenden',
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
    view_m3u: 'Lista M3U',
    view_xmltv: 'Guía EPG (XMLTV)',
    view_title: 'Credenciales',
    copy: 'Copiar',
    view_show: 'Mostrar',
    view_hide: 'Ocultar',
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
  it: {
    default_title: 'Abbonamento IPTV',
    default_title_multi: 'Abbonamenti IPTV',
    loading: 'Caricamento…',
    no_device: 'Nessun abbonamento IPTV: aggiungi l’integrazione IPTV in Impostazioni → Dispositivi e servizi.',
    unavailable: 'Server IPTV non raggiungibile',
    refresh: 'Aggiorna',
    edit_btn: 'Modifica le credenziali',
    edit_title: 'Modifica l’account',
    edit_url: 'URL del server',
    edit_username: 'Nome utente',
    edit_password: 'Password',
    edit_password_keep: 'Lascia vuoto per mantenerla',
    edit_mac: 'Indirizzo MAC',
    edit_save: 'Salva',
    edit_cancel: 'Annulla',
    edit_saving: 'Verifica…',
    err_invalid_auth: 'Credenziali rifiutate',
    err_cannot_connect: 'Impossibile raggiungere il server',
    err_invalid_mac: 'Indirizzo MAC non valido',
    err_no_french_lists: 'Nessuna lista francese presso questo fornitore',
    err_french_unknown: 'Impossibile leggere le categorie',
    err_stream_ko: 'Il canale di prova non viene riprodotto',
    err_already_configured: 'Un altro account usa già queste credenziali',
    err_not_found: 'Account non trovato',
    err_generic: 'Aggiornamento non riuscito',
    del_btn: 'Rimuovi l’account',
    del_title: 'Rimuovi l’account',
    del_confirm: 'L’account e le sue entità verranno rimossi.',
    del_delete: 'Elimina',
    add_btn: 'Aggiungi un account',
    add_title: 'Aggiungi un account',
    add_provider: 'Tipo di fornitore',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Aggiungi',
    err_existing_longer: 'Su questo server esiste già un account valido più a lungo',
    err_empty_catalogue: 'Il fornitore non ha un catalogo utilizzabile',
    view_btn: 'Mostra le credenziali',
    view_m3u: 'Playlist M3U',
    view_xmltv: 'Guida EPG (XMLTV)',
    view_title: 'Credenziali',
    copy: 'Copia',
    view_show: 'Mostra',
    view_hide: 'Nascondi',
    status_active: 'Attivo',
    status_expired: 'Scaduto',
    status_banned: 'Bloccato',
    status_disabled: 'Disattivato',
    status_unknown: 'Sconosciuto',
    auth_failed: 'Credenziali non valide',
    trial: 'Prova',
    expiration: 'Scadenza',
    never: 'Mai',
    unlimited: 'Illimitato',
    day_left: '{n} giorno rimanente',
    days_left: '{n} giorni rimanenti',
    channels: 'canali',
    movies: 'film',
    series: 'serie',
    connections: 'connessioni',
    french_on: 'FR',
    french_off: 'Niente FR',
    french_title: 'Liste francesi',
    last_check: 'Ultimo controllo',
    health_ok: 'Online',
    health_degraded: 'Lento',
    health_unreachable: 'Non raggiungibile',
    health_stream_ko: 'Stream KO',
    health_auth_failed: 'Credenziali rifiutate',
    ed_title: 'Titolo',
    ed_devices: 'Abbonamenti (tutti se vuoto)',
    ed_warning_days: 'Avviso prima della scadenza',
    ed_language: 'Lingua',
    ed_zoom: 'Pulsante dettagli',
    zoom_in: 'Mostra la scheda completa',
    zoom_out: 'Torna alla vista compatta',
    mini_all_active: 'Tutti attivi',
    mini_expiring: '{n} in scadenza',
    mini_expiring_plural: '{n} in scadenza',
    mini_expired: '{n} scaduto',
    mini_expired_plural: '{n} scaduti',
    mini_error: '{n} in errore',
    mini_error_plural: '{n} in errore',
    mini_days: '{n} g',
  },
  nl: {
    default_title: 'IPTV-abonnement',
    default_title_multi: 'IPTV-abonnementen',
    loading: 'Laden…',
    no_device: 'Geen IPTV-abonnement gevonden: voeg de IPTV-integratie toe via Instellingen → Apparaten & diensten.',
    unavailable: 'IPTV-server onbereikbaar',
    refresh: 'Vernieuwen',
    edit_btn: 'Inloggegevens bewerken',
    edit_title: 'Account bewerken',
    edit_url: 'Server-URL',
    edit_username: 'Gebruikersnaam',
    edit_password: 'Wachtwoord',
    edit_password_keep: 'Leeg laten om te behouden',
    edit_mac: 'MAC-adres',
    edit_save: 'Opslaan',
    edit_cancel: 'Annuleren',
    edit_saving: 'Controleren…',
    err_invalid_auth: 'Inloggegevens geweigerd',
    err_cannot_connect: 'Kan de server niet bereiken',
    err_invalid_mac: 'Ongeldig MAC-adres',
    err_no_french_lists: 'Geen Franse lijst bij deze provider',
    err_french_unknown: 'Kon de categorieën niet lezen',
    err_stream_ko: 'Het testkanaal speelt niet af',
    err_already_configured: 'Een ander account gebruikt deze inloggegevens al',
    err_not_found: 'Account niet gevonden',
    err_generic: 'Bijwerken mislukt',
    del_btn: 'Account verwijderen',
    del_title: 'Account verwijderen',
    del_confirm: 'Het account en zijn entiteiten worden verwijderd.',
    del_delete: 'Verwijderen',
    add_btn: 'Account toevoegen',
    add_title: 'Account toevoegen',
    add_provider: 'Type provider',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Toevoegen',
    err_existing_longer: 'Op deze server staat al een account dat langer geldig is',
    err_empty_catalogue: 'De provider heeft geen bruikbare catalogus',
    view_btn: 'Inloggegevens bekijken',
    view_m3u: 'M3U-afspeellijst',
    view_xmltv: 'EPG-gids (XMLTV)',
    view_title: 'Inloggegevens',
    copy: 'Kopiëren',
    view_show: 'Tonen',
    view_hide: 'Verbergen',
    status_active: 'Actief',
    status_expired: 'Verlopen',
    status_banned: 'Geblokkeerd',
    status_disabled: 'Uitgeschakeld',
    status_unknown: 'Onbekend',
    auth_failed: 'Ongeldige inloggegevens',
    trial: 'Proef',
    expiration: 'Vervaldatum',
    never: 'Nooit',
    unlimited: 'Onbeperkt',
    day_left: 'Nog {n} dag',
    days_left: 'Nog {n} dagen',
    channels: 'zenders',
    movies: 'films',
    series: 'series',
    connections: 'verbindingen',
    french_on: 'FR',
    french_off: 'Geen FR',
    french_title: 'Franse lijsten',
    last_check: 'Laatste controle',
    health_ok: 'Online',
    health_degraded: 'Traag',
    health_unreachable: 'Onbereikbaar',
    health_stream_ko: 'Geen stream',
    health_auth_failed: 'Inloggegevens geweigerd',
    ed_title: 'Titel',
    ed_devices: 'Abonnementen (alle indien leeg)',
    ed_warning_days: 'Waarschuwen voor het verlopen',
    ed_language: 'Taal',
    ed_zoom: 'Detailknop',
    zoom_in: 'Volledige kaart tonen',
    zoom_out: 'Terug naar de compacte weergave',
    mini_all_active: 'Alle actief',
    mini_expiring: '{n} bijna verlopen',
    mini_expiring_plural: '{n} bijna verlopen',
    mini_expired: '{n} verlopen',
    mini_expired_plural: '{n} verlopen',
    mini_error: '{n} met fout',
    mini_error_plural: '{n} met fout',
    mini_days: '{n} d',
  },
  pt: {
    default_title: 'Subscrição IPTV',
    default_title_multi: 'Subscrições IPTV',
    loading: 'A carregar…',
    no_device: 'Nenhuma subscrição IPTV: adicione a integração IPTV em Definições → Dispositivos e serviços.',
    unavailable: 'Servidor IPTV inacessível',
    refresh: 'Atualizar',
    edit_btn: 'Editar as credenciais',
    edit_title: 'Editar a conta',
    edit_url: 'URL do servidor',
    edit_username: 'Nome de utilizador',
    edit_password: 'Palavra-passe',
    edit_password_keep: 'Deixe em branco para manter',
    edit_mac: 'Endereço MAC',
    edit_save: 'Guardar',
    edit_cancel: 'Cancelar',
    edit_saving: 'A verificar…',
    err_invalid_auth: 'Credenciais recusadas',
    err_cannot_connect: 'Não é possível contactar o servidor',
    err_invalid_mac: 'Endereço MAC inválido',
    err_no_french_lists: 'Nenhuma lista francesa neste fornecedor',
    err_french_unknown: 'Não foi possível ler as categorias',
    err_stream_ko: 'O canal de teste não é reproduzido',
    err_already_configured: 'Outra conta já utiliza estas credenciais',
    err_not_found: 'Conta não encontrada',
    err_generic: 'Falha na atualização',
    del_btn: 'Remover a conta',
    del_title: 'Remover a conta',
    del_confirm: 'A conta e as suas entidades serão removidas.',
    del_delete: 'Eliminar',
    add_btn: 'Adicionar conta',
    add_title: 'Adicionar conta',
    add_provider: 'Tipo de fornecedor',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Adicionar',
    err_existing_longer: 'Já existe neste servidor uma conta válida durante mais tempo',
    err_empty_catalogue: 'O fornecedor não tem um catálogo utilizável',
    view_btn: 'Ver as credenciais',
    view_m3u: 'Lista M3U',
    view_xmltv: 'Guia EPG (XMLTV)',
    view_title: 'Credenciais',
    copy: 'Copiar',
    view_show: 'Mostrar',
    view_hide: 'Ocultar',
    status_active: 'Ativa',
    status_expired: 'Expirada',
    status_banned: 'Banida',
    status_disabled: 'Desativada',
    status_unknown: 'Desconhecida',
    auth_failed: 'Credenciais inválidas',
    trial: 'Teste',
    expiration: 'Expiração',
    never: 'Nunca',
    unlimited: 'Ilimitada',
    day_left: 'Falta {n} dia',
    days_left: 'Faltam {n} dias',
    channels: 'canais',
    movies: 'filmes',
    series: 'séries',
    connections: 'ligações',
    french_on: 'FR',
    french_off: 'Sem FR',
    french_title: 'Listas francesas',
    last_check: 'Última verificação',
    health_ok: 'Online',
    health_degraded: 'Lento',
    health_unreachable: 'Inacessível',
    health_stream_ko: 'Sem stream',
    health_auth_failed: 'Credenciais recusadas',
    ed_title: 'Título',
    ed_devices: 'Subscrições (todas se vazio)',
    ed_warning_days: 'Aviso antes da expiração',
    ed_language: 'Idioma',
    ed_zoom: 'Botão de detalhe',
    zoom_in: 'Mostrar o cartão completo',
    zoom_out: 'Voltar à vista compacta',
    mini_all_active: 'Todas ativas',
    mini_expiring: '{n} a expirar',
    mini_expiring_plural: '{n} a expirar',
    mini_expired: '{n} expirada',
    mini_expired_plural: '{n} expiradas',
    mini_error: '{n} com erro',
    mini_error_plural: '{n} com erro',
    mini_days: '{n} d',
  },
  pl: {
    default_title: 'Subskrypcja IPTV',
    default_title_multi: 'Subskrypcje IPTV',
    loading: 'Ładowanie…',
    no_device: 'Nie znaleziono subskrypcji IPTV: dodaj integrację IPTV w Ustawienia → Urządzenia oraz usługi.',
    unavailable: 'Serwer IPTV jest nieosiągalny',
    refresh: 'Odśwież',
    edit_btn: 'Edytuj dane logowania',
    edit_title: 'Edytuj konto',
    edit_url: 'URL serwera',
    edit_username: 'Nazwa użytkownika',
    edit_password: 'Hasło',
    edit_password_keep: 'Pozostaw puste, aby zachować',
    edit_mac: 'Adres MAC',
    edit_save: 'Zapisz',
    edit_cancel: 'Anuluj',
    edit_saving: 'Sprawdzanie…',
    err_invalid_auth: 'Dane logowania odrzucone',
    err_cannot_connect: 'Nie można połączyć się z serwerem',
    err_invalid_mac: 'Nieprawidłowy adres MAC',
    err_no_french_lists: 'Ten dostawca nie ma francuskiej listy',
    err_french_unknown: 'Nie udało się odczytać kategorii',
    err_stream_ko: 'Kanał testowy się nie odtwarza',
    err_already_configured: 'Inne konto używa już tych danych logowania',
    err_not_found: 'Nie znaleziono konta',
    err_generic: 'Aktualizacja nie powiodła się',
    del_btn: 'Usuń konto',
    del_title: 'Usuń konto',
    del_confirm: 'Konto i jego encje zostaną usunięte.',
    del_delete: 'Usuń',
    add_btn: 'Dodaj konto',
    add_title: 'Dodaj konto',
    add_provider: 'Typ dostawcy',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Dodaj',
    err_existing_longer: 'Na tym serwerze istnieje już konto ważne dłużej',
    err_empty_catalogue: 'Dostawca nie ma użytecznego katalogu',
    view_btn: 'Pokaż dane logowania',
    view_m3u: 'Lista M3U',
    view_xmltv: 'Przewodnik EPG (XMLTV)',
    view_title: 'Dane logowania',
    copy: 'Kopiuj',
    view_show: 'Pokaż',
    view_hide: 'Ukryj',
    status_active: 'Aktywna',
    status_expired: 'Wygasła',
    status_banned: 'Zablokowana',
    status_disabled: 'Wyłączona',
    status_unknown: 'Nieznana',
    auth_failed: 'Nieprawidłowe dane logowania',
    trial: 'Próbny',
    expiration: 'Wygaśnięcie',
    never: 'Nigdy',
    unlimited: 'Bez limitu',
    day_left: 'Pozostało dni: {n}',
    days_left: 'Pozostało dni: {n}',
    channels: 'kanały',
    movies: 'filmy',
    series: 'seriale',
    connections: 'połączenia',
    french_on: 'FR',
    french_off: 'Bez FR',
    french_title: 'Listy francuskie',
    last_check: 'Ostatnie sprawdzenie',
    health_ok: 'Online',
    health_degraded: 'Wolny',
    health_unreachable: 'Nieosiągalny',
    health_stream_ko: 'Brak streamu',
    health_auth_failed: 'Dane logowania odrzucone',
    ed_title: 'Tytuł',
    ed_devices: 'Subskrypcje (wszystkie, jeśli puste)',
    ed_warning_days: 'Ostrzeżenie przed wygaśnięciem',
    ed_language: 'Język',
    ed_zoom: 'Przycisk szczegółów',
    zoom_in: 'Pokaż pełną kartę',
    zoom_out: 'Wróć do widoku kompaktowego',
    mini_all_active: 'Wszystkie aktywne',
    mini_expiring: 'Wkrótce wygasa: {n}',
    mini_expiring_plural: 'Wkrótce wygasa: {n}',
    mini_expired: 'Wygasło: {n}',
    mini_expired_plural: 'Wygasło: {n}',
    mini_error: 'Z błędem: {n}',
    mini_error_plural: 'Z błędem: {n}',
    mini_days: '{n} d',
  },
  ro: {
    default_title: 'Abonament IPTV',
    default_title_multi: 'Abonamente IPTV',
    loading: 'Se încarcă…',
    no_device: 'Niciun abonament IPTV găsit: adaugă integrarea IPTV din Setări → Dispozitive și servicii.',
    unavailable: 'Server IPTV inaccesibil',
    refresh: 'Reîmprospătează',
    edit_btn: 'Editează datele de autentificare',
    edit_title: 'Editează contul',
    edit_url: 'URL server',
    edit_username: 'Nume de utilizator',
    edit_password: 'Parolă',
    edit_password_keep: 'Lasă gol pentru a o păstra',
    edit_mac: 'Adresă MAC',
    edit_save: 'Salvează',
    edit_cancel: 'Anulează',
    edit_saving: 'Se verifică…',
    err_invalid_auth: 'Date de autentificare respinse',
    err_cannot_connect: 'Serverul nu poate fi accesat',
    err_invalid_mac: 'Adresă MAC nevalidă',
    err_no_french_lists: 'Nicio listă franceză la acest furnizor',
    err_french_unknown: 'Categoriile nu au putut fi citite',
    err_stream_ko: 'Canalul de test nu pornește',
    err_already_configured: 'Un alt cont folosește deja aceste date de autentificare',
    err_not_found: 'Contul nu a fost găsit',
    err_generic: 'Actualizarea a eșuat',
    del_btn: 'Elimină contul',
    del_title: 'Elimină contul',
    del_confirm: 'Contul și entitățile sale vor fi eliminate.',
    del_delete: 'Șterge',
    add_btn: 'Adaugă un cont',
    add_title: 'Adaugă un cont',
    add_provider: 'Tip de furnizor',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Adaugă',
    err_existing_longer: 'Pe acest server există deja un cont valabil mai mult timp',
    err_empty_catalogue: 'Furnizorul nu are un catalog utilizabil',
    view_btn: 'Vezi datele de autentificare',
    view_m3u: 'Listă M3U',
    view_xmltv: 'Ghid EPG (XMLTV)',
    view_title: 'Date de autentificare',
    copy: 'Copiază',
    view_show: 'Afișează',
    view_hide: 'Ascunde',
    status_active: 'Activ',
    status_expired: 'Expirat',
    status_banned: 'Blocat',
    status_disabled: 'Dezactivat',
    status_unknown: 'Necunoscut',
    auth_failed: 'Autentificare eșuată',
    trial: 'Probă',
    expiration: 'Expirare',
    never: 'Niciodată',
    unlimited: 'Nelimitat',
    day_left: 'Zile rămase: {n}',
    days_left: 'Zile rămase: {n}',
    channels: 'canale',
    movies: 'filme',
    series: 'seriale',
    connections: 'conexiuni',
    french_on: 'FR',
    french_off: 'Fără FR',
    french_title: 'Liste franceze',
    last_check: 'Ultima verificare',
    health_ok: 'Online',
    health_degraded: 'Lent',
    health_unreachable: 'Inaccesibil',
    health_stream_ko: 'Flux oprit',
    health_auth_failed: 'Date de autentificare respinse',
    ed_title: 'Titlu',
    ed_devices: 'Abonamente (toate, dacă e gol)',
    ed_warning_days: 'Avertizare înainte de expirare',
    ed_language: 'Limbă',
    ed_zoom: 'Buton de detalii',
    zoom_in: 'Afișează cardul complet',
    zoom_out: 'Înapoi la vizualizarea compactă',
    mini_all_active: 'Toate active',
    mini_expiring: 'Expiră curând: {n}',
    mini_expiring_plural: 'Expiră curând: {n}',
    mini_expired: 'Expirate: {n}',
    mini_expired_plural: 'Expirate: {n}',
    mini_error: 'Cu erori: {n}',
    mini_error_plural: 'Cu erori: {n}',
    mini_days: '{n} z',
  },
  da: {
    default_title: 'IPTV-abonnement',
    default_title_multi: 'IPTV-abonnementer',
    loading: 'Indlæser…',
    no_device: 'Intet IPTV-abonnement fundet: tilføj IPTV-integrationen under Indstillinger → Enheder og tjenester.',
    unavailable: 'IPTV-serveren kan ikke nås',
    refresh: 'Opdater',
    edit_btn: 'Rediger loginoplysninger',
    edit_title: 'Rediger konto',
    edit_url: 'Server-URL',
    edit_username: 'Brugernavn',
    edit_password: 'Adgangskode',
    edit_password_keep: 'Lad stå tomt for at beholde',
    edit_mac: 'MAC-adresse',
    edit_save: 'Gem',
    edit_cancel: 'Annuller',
    edit_saving: 'Kontrollerer…',
    err_invalid_auth: 'Loginoplysninger afvist',
    err_cannot_connect: 'Kan ikke nå serveren',
    err_invalid_mac: 'Ugyldig MAC-adresse',
    err_no_french_lists: 'Ingen fransk liste hos denne udbyder',
    err_french_unknown: 'Kunne ikke læse kategorierne',
    err_stream_ko: 'Testkanalen kan ikke afspilles',
    err_already_configured: 'En anden konto bruger allerede disse loginoplysninger',
    err_not_found: 'Kontoen blev ikke fundet',
    err_generic: 'Opdateringen mislykkedes',
    del_btn: 'Fjern konto',
    del_title: 'Fjern konto',
    del_confirm: 'Kontoen og dens entiteter bliver fjernet.',
    del_delete: 'Slet',
    add_btn: 'Tilføj konto',
    add_title: 'Tilføj konto',
    add_provider: 'Udbydertype',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Tilføj',
    err_existing_longer: 'Der findes allerede en konto med længere gyldighed på denne server',
    err_empty_catalogue: 'Udbyderen har intet brugbart katalog',
    view_btn: 'Vis loginoplysninger',
    view_m3u: 'M3U-playliste',
    view_xmltv: 'EPG-guide (XMLTV)',
    view_title: 'Login',
    copy: 'Kopiér',
    view_show: 'Vis',
    view_hide: 'Skjul',
    status_active: 'Aktiv',
    status_expired: 'Udløbet',
    status_banned: 'Spærret',
    status_disabled: 'Deaktiveret',
    status_unknown: 'Ukendt',
    auth_failed: 'Ugyldige loginoplysninger',
    trial: 'Prøve',
    expiration: 'Udløb',
    never: 'Aldrig',
    unlimited: 'Ubegrænset',
    day_left: '{n} dag tilbage',
    days_left: '{n} dage tilbage',
    channels: 'kanaler',
    movies: 'film',
    series: 'serier',
    connections: 'forbindelser',
    french_on: 'FR',
    french_off: 'Ingen FR',
    french_title: 'Franske lister',
    last_check: 'Seneste kontrol',
    health_ok: 'Online',
    health_degraded: 'Langsom',
    health_unreachable: 'Kan ikke nås',
    health_stream_ko: 'Stream nede',
    health_auth_failed: 'Loginoplysninger afvist',
    ed_title: 'Titel',
    ed_devices: 'Abonnementer (alle, hvis tom)',
    ed_warning_days: 'Advar før udløb',
    ed_language: 'Sprog',
    ed_zoom: 'Detaljeknap',
    zoom_in: 'Vis hele kortet',
    zoom_out: 'Tilbage til kompakt visning',
    mini_all_active: 'Alle aktive',
    mini_expiring: '{n} udløber snart',
    mini_expiring_plural: '{n} udløber snart',
    mini_expired: '{n} udløbet',
    mini_expired_plural: '{n} udløbet',
    mini_error: '{n} med fejl',
    mini_error_plural: '{n} med fejl',
    mini_days: '{n} d',
  },
  sv: {
    default_title: 'IPTV-abonnemang',
    default_title_multi: 'IPTV-abonnemang',
    loading: 'Laddar…',
    no_device: 'Inget IPTV-abonnemang hittades: lägg till IPTV-integrationen under Inställningar → Enheter och tjänster.',
    unavailable: 'IPTV-servern går inte att nå',
    refresh: 'Uppdatera',
    edit_btn: 'Redigera inloggningsuppgifter',
    edit_title: 'Redigera konto',
    edit_url: 'Server-URL',
    edit_username: 'Användarnamn',
    edit_password: 'Lösenord',
    edit_password_keep: 'Lämna tomt för att behålla',
    edit_mac: 'MAC-adress',
    edit_save: 'Spara',
    edit_cancel: 'Avbryt',
    edit_saving: 'Kontrollerar…',
    err_invalid_auth: 'Inloggningsuppgifterna nekades',
    err_cannot_connect: 'Kan inte nå servern',
    err_invalid_mac: 'Ogiltig MAC-adress',
    err_no_french_lists: 'Ingen fransk lista hos den här leverantören',
    err_french_unknown: 'Kunde inte läsa kategorierna',
    err_stream_ko: 'Testkanalen spelas inte upp',
    err_already_configured: 'Ett annat konto använder redan dessa inloggningsuppgifter',
    err_not_found: 'Kontot hittades inte',
    err_generic: 'Uppdateringen misslyckades',
    del_btn: 'Ta bort konto',
    del_title: 'Ta bort konto',
    del_confirm: 'Kontot och dess entiteter tas bort.',
    del_delete: 'Radera',
    add_btn: 'Lägg till konto',
    add_title: 'Lägg till konto',
    add_provider: 'Leverantörstyp',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Lägg till',
    err_existing_longer: 'Det finns redan ett konto som gäller längre på den här servern',
    err_empty_catalogue: 'Leverantören har ingen användbar katalog',
    view_btn: 'Visa inloggningsuppgifter',
    view_m3u: 'M3U-spellista',
    view_xmltv: 'EPG-guide (XMLTV)',
    view_title: 'Inloggning',
    copy: 'Kopiera',
    view_show: 'Visa',
    view_hide: 'Dölj',
    status_active: 'Aktivt',
    status_expired: 'Utgånget',
    status_banned: 'Spärrat',
    status_disabled: 'Inaktiverat',
    status_unknown: 'Okänt',
    auth_failed: 'Ogiltig inloggning',
    trial: 'Provperiod',
    expiration: 'Utgång',
    never: 'Aldrig',
    unlimited: 'Obegränsat',
    day_left: '{n} dag kvar',
    days_left: '{n} dagar kvar',
    channels: 'kanaler',
    movies: 'filmer',
    series: 'serier',
    connections: 'anslutningar',
    french_on: 'FR',
    french_off: 'Ingen FR',
    french_title: 'Franska listor',
    last_check: 'Senaste kontroll',
    health_ok: 'Online',
    health_degraded: 'Långsam',
    health_unreachable: 'Går inte att nå',
    health_stream_ko: 'Stream nere',
    health_auth_failed: 'Inloggningsuppgifterna nekades',
    ed_title: 'Rubrik',
    ed_devices: 'Abonnemang (alla om tomt)',
    ed_warning_days: 'Varna före utgång',
    ed_language: 'Språk',
    ed_zoom: 'Detaljknapp',
    zoom_in: 'Visa hela kortet',
    zoom_out: 'Tillbaka till kompakt vy',
    mini_all_active: 'Alla aktiva',
    mini_expiring: '{n} går snart ut',
    mini_expiring_plural: '{n} går snart ut',
    mini_expired: '{n} utgånget',
    mini_expired_plural: '{n} utgångna',
    mini_error: '{n} med fel',
    mini_error_plural: '{n} med fel',
    mini_days: '{n} d',
  },
  bg: {
    default_title: 'IPTV абонамент',
    default_title_multi: 'IPTV абонаменти',
    loading: 'Зареждане…',
    no_device: 'Няма IPTV абонамент: добавете интеграцията IPTV от Настройки → Устройства и услуги.',
    unavailable: 'IPTV сървърът е недостъпен',
    refresh: 'Обнови',
    edit_btn: 'Редактиране на данните за вход',
    edit_title: 'Промяна на акаунт',
    edit_url: 'URL на сървъра',
    edit_username: 'Потребителско име',
    edit_password: 'Парола',
    edit_password_keep: 'Оставете празно, за да я запазите',
    edit_mac: 'MAC адрес',
    edit_save: 'Запази',
    edit_cancel: 'Отказ',
    edit_saving: 'Проверка…',
    err_invalid_auth: 'Данните за вход са отхвърлени',
    err_cannot_connect: 'Няма връзка със сървъра',
    err_invalid_mac: 'Невалиден MAC адрес',
    err_no_french_lists: 'Няма френски списък при този доставчик',
    err_french_unknown: 'Категориите не можаха да бъдат прочетени',
    err_stream_ko: 'Тестовият канал не се възпроизвежда',
    err_already_configured: 'Друг акаунт вече използва тези данни за вход',
    err_not_found: 'Акаунтът не е намерен',
    err_generic: 'Актуализацията не бе успешна',
    del_btn: 'Премахване на акаунта',
    del_title: 'Изтриване на акаунт',
    del_confirm: 'Акаунтът и неговите обекти ще бъдат премахнати.',
    del_delete: 'Изтрий',
    add_btn: 'Добавяне на акаунт',
    add_title: 'Добавяне на акаунт',
    add_provider: 'Тип доставчик',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Добави',
    err_existing_longer: 'На този сървър вече има акаунт, валиден по-дълго',
    err_empty_catalogue: 'Доставчикът няма използваем каталог',
    view_btn: 'Показване на данните за вход',
    view_m3u: 'Списък M3U',
    view_xmltv: 'Програма EPG (XMLTV)',
    view_title: 'Данни за вход',
    copy: 'Копирай',
    view_show: 'Покажи',
    view_hide: 'Скрий',
    status_active: 'Активен',
    status_expired: 'Изтекъл',
    status_banned: 'Блокиран',
    status_disabled: 'Деактивиран',
    status_unknown: 'Неизвестен',
    auth_failed: 'Невалидни данни за вход',
    trial: 'Пробен',
    expiration: 'Изтичане',
    never: 'Никога',
    unlimited: 'Неограничен',
    day_left: 'Оставащи дни: {n}',
    days_left: 'Оставащи дни: {n}',
    channels: 'канала',
    movies: 'филма',
    series: 'сериала',
    connections: 'връзки',
    french_on: 'FR',
    french_off: 'Без FR',
    french_title: 'Френски списъци',
    last_check: 'Последна проверка',
    health_ok: 'На линия',
    health_degraded: 'Бавен',
    health_unreachable: 'Недостъпен',
    health_stream_ko: 'Няма поток',
    health_auth_failed: 'Данните за вход са отхвърлени',
    ed_title: 'Заглавие',
    ed_devices: 'Абонаменти (всички, ако е празно)',
    ed_warning_days: 'Предупреждение преди изтичане',
    ed_language: 'Език',
    ed_zoom: 'Бутон за подробности',
    zoom_in: 'Покажи цялата карта',
    zoom_out: 'Обратно към компактния изглед',
    mini_all_active: 'Всички активни',
    mini_expiring: 'Изтичат скоро: {n}',
    mini_expiring_plural: 'Изтичат скоро: {n}',
    mini_expired: 'Изтекли: {n}',
    mini_expired_plural: 'Изтекли: {n}',
    mini_error: 'С грешка: {n}',
    mini_error_plural: 'С грешка: {n}',
    mini_days: '{n} д',
  },
  ru: {
    default_title: 'IPTV-подписка',
    default_title_multi: 'IPTV-подписки',
    loading: 'Загрузка…',
    no_device: 'IPTV-подписка не найдена: добавьте интеграцию IPTV в разделе Настройки → Устройства и службы.',
    unavailable: 'IPTV-сервер недоступен',
    refresh: 'Обновить',
    edit_btn: 'Изменить учётные данные',
    edit_title: 'Изменить аккаунт',
    edit_url: 'URL сервера',
    edit_username: 'Имя пользователя',
    edit_password: 'Пароль',
    edit_password_keep: 'Оставьте пустым, чтобы не менять',
    edit_mac: 'MAC-адрес',
    edit_save: 'Сохранить',
    edit_cancel: 'Отмена',
    edit_saving: 'Проверка…',
    err_invalid_auth: 'Учётные данные отклонены',
    err_cannot_connect: 'Не удаётся подключиться к серверу',
    err_invalid_mac: 'Недопустимый MAC-адрес',
    err_no_french_lists: 'У этого провайдера нет французского списка',
    err_french_unknown: 'Не удалось прочитать категории',
    err_stream_ko: 'Тестовый канал не воспроизводится',
    err_already_configured: 'Эти учётные данные уже использует другая учётная запись',
    err_not_found: 'Учётная запись не найдена',
    err_generic: 'Не удалось обновить',
    del_btn: 'Удалить учётную запись',
    del_title: 'Удалить аккаунт',
    del_confirm: 'Учётная запись и её объекты будут удалены.',
    del_delete: 'Удалить',
    add_btn: 'Добавить учётную запись',
    add_title: 'Добавить аккаунт',
    add_provider: 'Тип провайдера',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Добавить',
    err_existing_longer: 'На этом сервере уже есть учётная запись, действующая дольше',
    err_empty_catalogue: 'У провайдера нет пригодного каталога',
    view_btn: 'Показать учётные данные',
    view_m3u: 'Плейлист M3U',
    view_xmltv: 'Телепрограмма EPG (XMLTV)',
    view_title: 'Учётные данные',
    copy: 'Копировать',
    view_show: 'Показать',
    view_hide: 'Скрыть',
    status_active: 'Активна',
    status_expired: 'Истекла',
    status_banned: 'Заблокирована',
    status_disabled: 'Отключена',
    status_unknown: 'Неизвестно',
    auth_failed: 'Ошибка входа',
    trial: 'Пробная',
    expiration: 'Окончание',
    never: 'Никогда',
    unlimited: 'Без ограничений',
    day_left: 'Осталось дней: {n}',
    days_left: 'Осталось дней: {n}',
    channels: 'каналы',
    movies: 'фильмы',
    series: 'сериалы',
    connections: 'подключения',
    french_on: 'FR',
    french_off: 'Без FR',
    french_title: 'Французские списки',
    last_check: 'Последняя проверка',
    health_ok: 'В сети',
    health_degraded: 'Медленно',
    health_unreachable: 'Недоступен',
    health_stream_ko: 'Нет потока',
    health_auth_failed: 'Учётные данные отклонены',
    ed_title: 'Заголовок',
    ed_devices: 'Подписки (все, если пусто)',
    ed_warning_days: 'Предупреждать до окончания',
    ed_language: 'Язык',
    ed_zoom: 'Кнопка подробностей',
    zoom_in: 'Показать полную карточку',
    zoom_out: 'Вернуться к компактному виду',
    mini_all_active: 'Все активны',
    mini_expiring: 'Скоро истекают: {n}',
    mini_expiring_plural: 'Скоро истекают: {n}',
    mini_expired: 'Истекли: {n}',
    mini_expired_plural: 'Истекли: {n}',
    mini_error: 'С ошибкой: {n}',
    mini_error_plural: 'С ошибкой: {n}',
    mini_days: '{n} д',
  },
  uk: {
    default_title: 'IPTV-підписка',
    default_title_multi: 'IPTV-підписки',
    loading: 'Завантаження…',
    no_device: 'IPTV-підписку не знайдено: додайте інтеграцію IPTV у Налаштування → Пристрої та служби.',
    unavailable: 'IPTV-сервер недоступний',
    refresh: 'Оновити',
    edit_btn: 'Змінити облікові дані',
    edit_title: 'Змінити акаунт',
    edit_url: 'URL сервера',
    edit_username: 'Ім\'я користувача',
    edit_password: 'Пароль',
    edit_password_keep: 'Залиште порожнім, щоб не змінювати',
    edit_mac: 'MAC-адреса',
    edit_save: 'Зберегти',
    edit_cancel: 'Скасувати',
    edit_saving: 'Перевірка…',
    err_invalid_auth: 'Облікові дані відхилено',
    err_cannot_connect: 'Не вдається з\'єднатися із сервером',
    err_invalid_mac: 'Недійсна MAC-адреса',
    err_no_french_lists: 'У цього провайдера немає французького списку',
    err_french_unknown: 'Не вдалося прочитати категорії',
    err_stream_ko: 'Тестовий канал не відтворюється',
    err_already_configured: 'Ці облікові дані вже використовує інший обліковий запис',
    err_not_found: 'Обліковий запис не знайдено',
    err_generic: 'Не вдалося оновити',
    del_btn: 'Видалити обліковий запис',
    del_title: 'Видалити акаунт',
    del_confirm: 'Обліковий запис і його об\'єкти буде видалено.',
    del_delete: 'Видалити',
    add_btn: 'Додати обліковий запис',
    add_title: 'Додати акаунт',
    add_provider: 'Тип провайдера',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Додати',
    err_existing_longer: 'На цьому сервері вже є обліковий запис, що діє довше',
    err_empty_catalogue: 'Провайдер не має придатного каталогу',
    view_btn: 'Показати облікові дані',
    view_m3u: 'Плейлист M3U',
    view_xmltv: 'Телепрограма EPG (XMLTV)',
    view_title: 'Облікові дані',
    copy: 'Копіювати',
    view_show: 'Показати',
    view_hide: 'Приховати',
    status_active: 'Активна',
    status_expired: 'Закінчилася',
    status_banned: 'Заблокована',
    status_disabled: 'Вимкнена',
    status_unknown: 'Невідомо',
    auth_failed: 'Помилка входу',
    trial: 'Пробна',
    expiration: 'Закінчення',
    never: 'Ніколи',
    unlimited: 'Без обмежень',
    day_left: 'Залишилося днів: {n}',
    days_left: 'Залишилося днів: {n}',
    channels: 'канали',
    movies: 'фільми',
    series: 'серіали',
    connections: 'з\'єднання',
    french_on: 'FR',
    french_off: 'Без FR',
    french_title: 'Французькі списки',
    last_check: 'Остання перевірка',
    health_ok: 'Онлайн',
    health_degraded: 'Повільно',
    health_unreachable: 'Недоступний',
    health_stream_ko: 'Немає потоку',
    health_auth_failed: 'Облікові дані відхилено',
    ed_title: 'Заголовок',
    ed_devices: 'Підписки (усі, якщо порожньо)',
    ed_warning_days: 'Попереджати до закінчення',
    ed_language: 'Мова',
    ed_zoom: 'Кнопка подробиць',
    zoom_in: 'Показати повну картку',
    zoom_out: 'Повернутися до компактного вигляду',
    mini_all_active: 'Усі активні',
    mini_expiring: 'Закінчуються: {n}',
    mini_expiring_plural: 'Закінчуються: {n}',
    mini_expired: 'Закінчилися: {n}',
    mini_expired_plural: 'Закінчилися: {n}',
    mini_error: 'З помилкою: {n}',
    mini_error_plural: 'З помилкою: {n}',
    mini_days: '{n} д',
  },
  hu: {
    default_title: 'IPTV-előfizetés',
    default_title_multi: 'IPTV-előfizetések',
    loading: 'Betöltés…',
    no_device: 'Nem található IPTV-előfizetés: add hozzá az IPTV integrációt a Beállítások → Eszközök és szolgáltatások menüben.',
    unavailable: 'Az IPTV-szerver nem érhető el',
    refresh: 'Frissítés',
    edit_btn: 'Hitelesítő adatok szerkesztése',
    edit_title: 'Fiók szerkesztése',
    edit_url: 'Szerver URL',
    edit_username: 'Felhasználónév',
    edit_password: 'Jelszó',
    edit_password_keep: 'Hagyd üresen a megtartásához',
    edit_mac: 'MAC-cím',
    edit_save: 'Mentés',
    edit_cancel: 'Mégse',
    edit_saving: 'Ellenőrzés…',
    err_invalid_auth: 'Elutasított hitelesítő adatok',
    err_cannot_connect: 'A szerver nem érhető el',
    err_invalid_mac: 'Érvénytelen MAC-cím',
    err_no_french_lists: 'Ennél a szolgáltatónál nincs francia lista',
    err_french_unknown: 'Nem sikerült beolvasni a kategóriákat',
    err_stream_ko: 'A tesztcsatorna nem játszható le',
    err_already_configured: 'Egy másik fiók már használja ezeket a hitelesítő adatokat',
    err_not_found: 'A fiók nem található',
    err_generic: 'A frissítés sikertelen',
    del_btn: 'Fiók eltávolítása',
    del_title: 'Fiók eltávolítása',
    del_confirm: 'A fiók és az entitásai el lesznek távolítva.',
    del_delete: 'Törlés',
    add_btn: 'Fiók hozzáadása',
    add_title: 'Fiók hozzáadása',
    add_provider: 'Szolgáltató típusa',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Hozzáadás',
    err_existing_longer: 'Ezen a szerveren már van egy tovább érvényes fiók',
    err_empty_catalogue: 'A szolgáltatónak nincs használható katalógusa',
    view_btn: 'Hitelesítő adatok megtekintése',
    view_m3u: 'M3U lejátszási lista',
    view_xmltv: 'EPG műsorújság (XMLTV)',
    view_title: 'Hitelesítő adatok',
    copy: 'Másolás',
    view_show: 'Megjelenítés',
    view_hide: 'Elrejtés',
    status_active: 'Aktív',
    status_expired: 'Lejárt',
    status_banned: 'Letiltva',
    status_disabled: 'Kikapcsolva',
    status_unknown: 'Ismeretlen',
    auth_failed: 'Érvénytelen hitelesítés',
    trial: 'Próba',
    expiration: 'Lejárat',
    never: 'Soha',
    unlimited: 'Korlátlan',
    day_left: '{n} nap van hátra',
    days_left: '{n} nap van hátra',
    channels: 'csatorna',
    movies: 'film',
    series: 'sorozat',
    connections: 'kapcsolat',
    french_on: 'FR',
    french_off: 'Nincs FR',
    french_title: 'Francia listák',
    last_check: 'Utolsó ellenőrzés',
    health_ok: 'Online',
    health_degraded: 'Lassú',
    health_unreachable: 'Nem érhető el',
    health_stream_ko: 'Stream leállt',
    health_auth_failed: 'Elutasított hitelesítő adatok',
    ed_title: 'Cím',
    ed_devices: 'Előfizetések (üresen mind)',
    ed_warning_days: 'Figyelmeztetés lejárat előtt',
    ed_language: 'Nyelv',
    ed_zoom: 'Részletek gomb',
    zoom_in: 'A teljes kártya megjelenítése',
    zoom_out: 'Vissza a kompakt nézethez',
    mini_all_active: 'Mind aktív',
    mini_expiring: '{n} hamarosan lejár',
    mini_expiring_plural: '{n} hamarosan lejár',
    mini_expired: '{n} lejárt',
    mini_expired_plural: '{n} lejárt',
    mini_error: '{n} hibás',
    mini_error_plural: '{n} hibás',
    mini_days: '{n} n',
  },
  sk: {
    default_title: 'Predplatné IPTV',
    default_title_multi: 'Predplatné IPTV',
    loading: 'Načítava sa…',
    no_device: 'Nenašlo sa žiadne predplatné IPTV: pridajte integráciu IPTV v Nastavenia → Zariadenia a služby.',
    unavailable: 'Server IPTV je nedostupný',
    refresh: 'Obnoviť',
    edit_btn: 'Upraviť prihlasovacie údaje',
    edit_title: 'Upraviť účet',
    edit_url: 'URL servera',
    edit_username: 'Používateľské meno',
    edit_password: 'Heslo',
    edit_password_keep: 'Ak ho chcete zachovať, nechajte prázdne',
    edit_mac: 'MAC adresa',
    edit_save: 'Uložiť',
    edit_cancel: 'Zrušiť',
    edit_saving: 'Overuje sa…',
    err_invalid_auth: 'Prihlasovacie údaje boli odmietnuté',
    err_cannot_connect: 'Nedá sa pripojiť k serveru',
    err_invalid_mac: 'Neplatná MAC adresa',
    err_no_french_lists: 'U tohto poskytovateľa nie je žiadny francúzsky zoznam',
    err_french_unknown: 'Kategórie sa nepodarilo načítať',
    err_stream_ko: 'Testovací kanál sa neprehráva',
    err_already_configured: 'Tieto prihlasovacie údaje už používa iný účet',
    err_not_found: 'Účet sa nenašiel',
    err_generic: 'Aktualizácia zlyhala',
    del_btn: 'Odstrániť účet',
    del_title: 'Odstrániť účet',
    del_confirm: 'Účet a jeho entity budú odstránené.',
    del_delete: 'Odstrániť',
    add_btn: 'Pridať účet',
    add_title: 'Pridať účet',
    add_provider: 'Typ poskytovateľa',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Pridať',
    err_existing_longer: 'Na tomto serveri už existuje účet s dlhšou platnosťou',
    err_empty_catalogue: 'Poskytovateľ nemá použiteľný katalóg',
    view_btn: 'Zobraziť prihlasovacie údaje',
    view_m3u: 'Zoznam M3U',
    view_xmltv: 'Programový sprievodca EPG (XMLTV)',
    view_title: 'Prihlasovacie údaje',
    copy: 'Kopírovať',
    view_show: 'Zobraziť',
    view_hide: 'Skryť',
    status_active: 'Aktívne',
    status_expired: 'Vypršané',
    status_banned: 'Zablokované',
    status_disabled: 'Deaktivované',
    status_unknown: 'Neznáme',
    auth_failed: 'Neplatné prihlásenie',
    trial: 'Skúšobné',
    expiration: 'Platnosť do',
    never: 'Nikdy',
    unlimited: 'Neobmedzené',
    day_left: 'Zostávajúce dni: {n}',
    days_left: 'Zostávajúce dni: {n}',
    channels: 'kanály',
    movies: 'filmy',
    series: 'seriály',
    connections: 'pripojenia',
    french_on: 'FR',
    french_off: 'Bez FR',
    french_title: 'Francúzske zoznamy',
    last_check: 'Posledná kontrola',
    health_ok: 'Online',
    health_degraded: 'Pomalý',
    health_unreachable: 'Nedostupný',
    health_stream_ko: 'Stream nefunguje',
    health_auth_failed: 'Prihlasovacie údaje boli odmietnuté',
    ed_title: 'Názov',
    ed_devices: 'Predplatné (všetky, ak je prázdne)',
    ed_warning_days: 'Upozorniť pred vypršaním',
    ed_language: 'Jazyk',
    ed_zoom: 'Tlačidlo podrobností',
    zoom_in: 'Zobraziť celú kartu',
    zoom_out: 'Späť na kompaktné zobrazenie',
    mini_all_active: 'Všetky aktívne',
    mini_expiring: 'Čoskoro vyprší: {n}',
    mini_expiring_plural: 'Čoskoro vyprší: {n}',
    mini_expired: 'Vypršané: {n}',
    mini_expired_plural: 'Vypršané: {n}',
    mini_error: 'S chybou: {n}',
    mini_error_plural: 'S chybou: {n}',
    mini_days: '{n} d',
  },
  cs: {
    default_title: 'Předplatné IPTV',
    default_title_multi: 'Předplatná IPTV',
    loading: 'Načítání…',
    no_device: 'Nenalezeno žádné předplatné IPTV: přidejte integraci IPTV v Nastavení → Zařízení a služby.',
    unavailable: 'Server IPTV je nedostupný',
    refresh: 'Obnovit',
    edit_btn: 'Upravit přihlašovací údaje',
    edit_title: 'Upravit účet',
    edit_url: 'URL serveru',
    edit_username: 'Uživatelské jméno',
    edit_password: 'Heslo',
    edit_password_keep: 'Chcete-li ho zachovat, nechte prázdné',
    edit_mac: 'MAC adresa',
    edit_save: 'Uložit',
    edit_cancel: 'Zrušit',
    edit_saving: 'Ověřování…',
    err_invalid_auth: 'Přihlašovací údaje byly odmítnuty',
    err_cannot_connect: 'Nelze se připojit k serveru',
    err_invalid_mac: 'Neplatná MAC adresa',
    err_no_french_lists: 'U tohoto poskytovatele není žádný francouzský seznam',
    err_french_unknown: 'Kategorie se nepodařilo načíst',
    err_stream_ko: 'Testovací kanál se nepřehrává',
    err_already_configured: 'Tyto přihlašovací údaje už používá jiný účet',
    err_not_found: 'Účet nebyl nalezen',
    err_generic: 'Aktualizace se nezdařila',
    del_btn: 'Odebrat účet',
    del_title: 'Odebrat účet',
    del_confirm: 'Účet a jeho entity budou odebrány.',
    del_delete: 'Smazat',
    add_btn: 'Přidat účet',
    add_title: 'Přidat účet',
    add_provider: 'Typ poskytovatele',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Přidat',
    err_existing_longer: 'Na tomto serveru už existuje účet s delší platností',
    err_empty_catalogue: 'Poskytovatel nemá použitelný katalog',
    view_btn: 'Zobrazit přihlašovací údaje',
    view_m3u: 'Seznam M3U',
    view_xmltv: 'Programový průvodce EPG (XMLTV)',
    view_title: 'Přihlašovací údaje',
    copy: 'Kopírovat',
    view_show: 'Zobrazit',
    view_hide: 'Skrýt',
    status_active: 'Aktivní',
    status_expired: 'Vypršelo',
    status_banned: 'Zablokováno',
    status_disabled: 'Deaktivováno',
    status_unknown: 'Neznámé',
    auth_failed: 'Neplatné přihlášení',
    trial: 'Zkušební',
    expiration: 'Platnost do',
    never: 'Nikdy',
    unlimited: 'Neomezeno',
    day_left: 'Zbývající dny: {n}',
    days_left: 'Zbývající dny: {n}',
    channels: 'kanály',
    movies: 'filmy',
    series: 'seriály',
    connections: 'připojení',
    french_on: 'FR',
    french_off: 'Bez FR',
    french_title: 'Francouzské seznamy',
    last_check: 'Poslední kontrola',
    health_ok: 'Online',
    health_degraded: 'Pomalý',
    health_unreachable: 'Nedostupný',
    health_stream_ko: 'Stream nefunguje',
    health_auth_failed: 'Přihlašovací údaje byly odmítnuty',
    ed_title: 'Název',
    ed_devices: 'Předplatná (všechna, pokud je prázdné)',
    ed_warning_days: 'Upozornit před vypršením',
    ed_language: 'Jazyk',
    ed_zoom: 'Tlačítko podrobností',
    zoom_in: 'Zobrazit celou kartu',
    zoom_out: 'Zpět na kompaktní zobrazení',
    mini_all_active: 'Všechna aktivní',
    mini_expiring: 'Brzy vyprší: {n}',
    mini_expiring_plural: 'Brzy vyprší: {n}',
    mini_expired: 'Vypršelo: {n}',
    mini_expired_plural: 'Vypršelo: {n}',
    mini_error: 'S chybou: {n}',
    mini_error_plural: 'S chybou: {n}',
    mini_days: '{n} d',
  },
  sl: {
    default_title: 'Naročnina IPTV',
    default_title_multi: 'Naročnine IPTV',
    loading: 'Nalaganje …',
    no_device: 'Ni najdene naročnine IPTV: dodajte integracijo IPTV v Nastavitve → Naprave in storitve.',
    unavailable: 'Strežnik IPTV ni dosegljiv',
    refresh: 'Osveži',
    edit_btn: 'Uredi poverilnice',
    edit_title: 'Uredi račun',
    edit_url: 'URL strežnika',
    edit_username: 'Uporabniško ime',
    edit_password: 'Geslo',
    edit_password_keep: 'Pustite prazno, da ga ohranite',
    edit_mac: 'Naslov MAC',
    edit_save: 'Shrani',
    edit_cancel: 'Prekliči',
    edit_saving: 'Preverjanje …',
    err_invalid_auth: 'Poverilnice so zavrnjene',
    err_cannot_connect: 'Strežnika ni mogoče doseči',
    err_invalid_mac: 'Neveljaven naslov MAC',
    err_no_french_lists: 'Ta ponudnik nima francoskega seznama',
    err_french_unknown: 'Kategorij ni bilo mogoče prebrati',
    err_stream_ko: 'Testni kanal se ne predvaja',
    err_already_configured: 'Te poverilnice že uporablja drug račun',
    err_not_found: 'Računa ni mogoče najti',
    err_generic: 'Posodobitev ni uspela',
    del_btn: 'Odstrani račun',
    del_title: 'Odstrani račun',
    del_confirm: 'Račun in njegove entitete bodo odstranjeni.',
    del_delete: 'Izbriši',
    add_btn: 'Dodaj račun',
    add_title: 'Dodaj račun',
    add_provider: 'Vrsta ponudnika',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Dodaj',
    err_existing_longer: 'Na tem strežniku že obstaja račun z daljšo veljavnostjo',
    err_empty_catalogue: 'Ponudnik nima uporabnega kataloga',
    view_btn: 'Prikaži poverilnice',
    view_m3u: 'Seznam M3U',
    view_xmltv: 'Programski vodnik EPG (XMLTV)',
    view_title: 'Poverilnice',
    copy: 'Kopiraj',
    view_show: 'Prikaži',
    view_hide: 'Skrij',
    status_active: 'Aktivna',
    status_expired: 'Potekla',
    status_banned: 'Blokirana',
    status_disabled: 'Onemogočena',
    status_unknown: 'Neznano',
    auth_failed: 'Neveljavne poverilnice',
    trial: 'Preizkus',
    expiration: 'Potek',
    never: 'Nikoli',
    unlimited: 'Neomejeno',
    day_left: 'Preostali dnevi: {n}',
    days_left: 'Preostali dnevi: {n}',
    channels: 'kanali',
    movies: 'filmi',
    series: 'serije',
    connections: 'povezave',
    french_on: 'FR',
    french_off: 'Brez FR',
    french_title: 'Francoski seznami',
    last_check: 'Zadnje preverjanje',
    health_ok: 'Na spletu',
    health_degraded: 'Počasen',
    health_unreachable: 'Nedosegljiv',
    health_stream_ko: 'Pretok ne deluje',
    health_auth_failed: 'Poverilnice so zavrnjene',
    ed_title: 'Naslov',
    ed_devices: 'Naročnine (vse, če je prazno)',
    ed_warning_days: 'Opozorilo pred potekom',
    ed_language: 'Jezik',
    ed_zoom: 'Gumb za podrobnosti',
    zoom_in: 'Prikaži celotno kartico',
    zoom_out: 'Nazaj na strnjen pogled',
    mini_all_active: 'Vse aktivne',
    mini_expiring: 'Kmalu poteče: {n}',
    mini_expiring_plural: 'Kmalu poteče: {n}',
    mini_expired: 'Poteklo: {n}',
    mini_expired_plural: 'Poteklo: {n}',
    mini_error: 'Z napako: {n}',
    mini_error_plural: 'Z napako: {n}',
    mini_days: '{n} d',
  },
  lv: {
    default_title: 'IPTV abonements',
    default_title_multi: 'IPTV abonementi',
    loading: 'Ielādē…',
    no_device: 'Nav atrasts neviens IPTV abonements: pievienojiet IPTV integrāciju sadaļā Iestatījumi → Ierīces un pakalpojumi.',
    unavailable: 'IPTV serveris nepieejams',
    refresh: 'Atsvaidzināt',
    edit_btn: 'Rediģēt pieteikšanās datus',
    edit_title: 'Rediģēt kontu',
    edit_url: 'Servera URL',
    edit_username: 'Lietotājvārds',
    edit_password: 'Parole',
    edit_password_keep: 'Atstājiet tukšu, lai to saglabātu',
    edit_mac: 'MAC adrese',
    edit_save: 'Saglabāt',
    edit_cancel: 'Atcelt',
    edit_saving: 'Pārbauda…',
    err_invalid_auth: 'Pieteikšanās dati noraidīti',
    err_cannot_connect: 'Nevar sasniegt serveri',
    err_invalid_mac: 'Nederīga MAC adrese',
    err_no_french_lists: 'Šim pakalpojumu sniedzējam nav franču saraksta',
    err_french_unknown: 'Neizdevās nolasīt kategorijas',
    err_stream_ko: 'Testa kanāls netiek atskaņots',
    err_already_configured: 'Šos pieteikšanās datus jau izmanto cits konts',
    err_not_found: 'Konts nav atrasts',
    err_generic: 'Atjaunināšana neizdevās',
    del_btn: 'Noņemt kontu',
    del_title: 'Noņemt kontu',
    del_confirm: 'Konts un tā entītijas tiks noņemtas.',
    del_delete: 'Dzēst',
    add_btn: 'Pievienot kontu',
    add_title: 'Pievienot kontu',
    add_provider: 'Sniedzēja veids',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Pievienot',
    err_existing_longer: 'Šajā serverī jau ir konts, kas ir derīgs ilgāk',
    err_empty_catalogue: 'Pakalpojumu sniedzējam nav izmantojama kataloga',
    view_btn: 'Skatīt pieteikšanās datus',
    view_m3u: 'M3U saraksts',
    view_xmltv: 'EPG programma (XMLTV)',
    view_title: 'Pieteikšanās dati',
    copy: 'Kopēt',
    view_show: 'Rādīt',
    view_hide: 'Slēpt',
    status_active: 'Aktīvs',
    status_expired: 'Beidzies',
    status_banned: 'Bloķēts',
    status_disabled: 'Atspējots',
    status_unknown: 'Nezināms',
    auth_failed: 'Nederīgi pieteikšanās dati',
    trial: 'Izmēģinājums',
    expiration: 'Derīguma beigas',
    never: 'Nekad',
    unlimited: 'Neierobežots',
    day_left: 'Vēl {n} d.',
    days_left: 'Vēl {n} d.',
    channels: 'kanāli',
    movies: 'filmas',
    series: 'seriāli',
    connections: 'savienojumi',
    french_on: 'FR',
    french_off: 'Nav FR',
    french_title: 'Franču saraksti',
    last_check: 'Pēdējā pārbaude',
    health_ok: 'Tiešsaistē',
    health_degraded: 'Lēns',
    health_unreachable: 'Nesasniedzams',
    health_stream_ko: 'Straume nedarbojas',
    health_auth_failed: 'Pieteikšanās dati noraidīti',
    ed_title: 'Virsraksts',
    ed_devices: 'Abonementi (visi, ja tukšs)',
    ed_warning_days: 'Brīdināt pirms derīguma beigām',
    ed_language: 'Valoda',
    ed_zoom: 'Detaļu poga',
    zoom_in: 'Rādīt pilno kartīti',
    zoom_out: 'Atpakaļ uz kompakto skatu',
    mini_all_active: 'Visi aktīvi',
    mini_expiring: 'Drīz beigsies: {n}',
    mini_expiring_plural: 'Drīz beigsies: {n}',
    mini_expired: 'Beigušies: {n}',
    mini_expired_plural: 'Beigušies: {n}',
    mini_error: 'Ar kļūdu: {n}',
    mini_error_plural: 'Ar kļūdu: {n}',
    mini_days: '{n} d.',
  },
  el: {
    default_title: 'Συνδρομή IPTV',
    default_title_multi: 'Συνδρομές IPTV',
    loading: 'Φόρτωση…',
    no_device: 'Δεν βρέθηκε συνδρομή IPTV: προσθέστε την ενσωμάτωση IPTV από Ρυθμίσεις → Συσκευές & υπηρεσίες.',
    unavailable: 'Διακομιστής IPTV μη προσβάσιμος',
    refresh: 'Ανανέωση',
    edit_btn: 'Επεξεργασία διαπιστευτηρίων',
    edit_title: 'Αλλαγή λογαριασμού',
    edit_url: 'URL διακομιστή',
    edit_username: 'Όνομα χρήστη',
    edit_password: 'Κωδικός',
    edit_password_keep: 'Αφήστε το κενό για να διατηρηθεί',
    edit_mac: 'Διεύθυνση MAC',
    edit_save: 'Αποθήκευση',
    edit_cancel: 'Άκυρο',
    edit_saving: 'Έλεγχος…',
    err_invalid_auth: 'Τα διαπιστευτήρια απορρίφθηκαν',
    err_cannot_connect: 'Δεν είναι δυνατή η σύνδεση με τον διακομιστή',
    err_invalid_mac: 'Μη έγκυρη διεύθυνση MAC',
    err_no_french_lists: 'Δεν υπάρχει γαλλική λίστα σε αυτόν τον πάροχο',
    err_french_unknown: 'Δεν ήταν δυνατή η ανάγνωση των κατηγοριών',
    err_stream_ko: 'Το δοκιμαστικό κανάλι δεν αναπαράγεται',
    err_already_configured: 'Άλλος λογαριασμός χρησιμοποιεί ήδη αυτά τα διαπιστευτήρια',
    err_not_found: 'Ο λογαριασμός δεν βρέθηκε',
    err_generic: 'Η ενημέρωση απέτυχε',
    del_btn: 'Αφαίρεση λογαριασμού',
    del_title: 'Διαγραφή λογαριασμού',
    del_confirm: 'Ο λογαριασμός και οι οντότητές του θα αφαιρεθούν.',
    del_delete: 'Διαγραφή',
    add_btn: 'Προσθήκη λογαριασμού',
    add_title: 'Νέος λογαριασμός',
    add_provider: 'Τύπος παρόχου',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Προσθήκη',
    err_existing_longer: 'Υπάρχει ήδη σε αυτόν τον διακομιστή λογαριασμός με μεγαλύτερη ισχύ',
    err_empty_catalogue: 'Ο πάροχος δεν έχει αξιοποιήσιμο κατάλογο',
    view_btn: 'Προβολή διαπιστευτηρίων',
    view_m3u: 'Λίστα M3U',
    view_xmltv: 'Οδηγός EPG (XMLTV)',
    view_title: 'Διαπιστευτήρια',
    copy: 'Αντιγραφή',
    view_show: 'Εμφάνιση',
    view_hide: 'Απόκρυψη',
    status_active: 'Ενεργή',
    status_expired: 'Έληξε',
    status_banned: 'Αποκλεισμένη',
    status_disabled: 'Ανενεργή',
    status_unknown: 'Άγνωστη',
    auth_failed: 'Μη έγκυρα διαπιστευτήρια',
    trial: 'Δοκιμαστική',
    expiration: 'Λήξη',
    never: 'Ποτέ',
    unlimited: 'Απεριόριστη',
    day_left: 'Ακόμη {n} ημ.',
    days_left: 'Ακόμη {n} ημ.',
    channels: 'κανάλια',
    movies: 'ταινίες',
    series: 'σειρές',
    connections: 'συνδέσεις',
    french_on: 'FR',
    french_off: 'Χωρίς FR',
    french_title: 'Γαλλικές λίστες',
    last_check: 'Τελ. έλεγχος',
    health_ok: 'Σε σύνδεση',
    health_degraded: 'Αργός',
    health_unreachable: 'Μη προσβάσιμος',
    health_stream_ko: 'Η ροή δεν λειτουργεί',
    health_auth_failed: 'Τα διαπιστευτήρια απορρίφθηκαν',
    ed_title: 'Τίτλος',
    ed_devices: 'Συνδρομές (όλες αν είναι κενό)',
    ed_warning_days: 'Προειδοποίηση πριν από τη λήξη',
    ed_language: 'Γλώσσα',
    ed_zoom: 'Κουμπί λεπτομερειών',
    zoom_in: 'Εμφάνιση πλήρους κάρτας',
    zoom_out: 'Επιστροφή στη συμπαγή προβολή',
    mini_all_active: 'Όλες ενεργές',
    mini_expiring: 'Λήγουν σύντομα: {n}',
    mini_expiring_plural: 'Λήγουν σύντομα: {n}',
    mini_expired: 'Έληξαν: {n}',
    mini_expired_plural: 'Έληξαν: {n}',
    mini_error: 'Με σφάλμα: {n}',
    mini_error_plural: 'Με σφάλμα: {n}',
    mini_days: '{n} ημ.',
  },
  sr: {
    default_title: 'IPTV претплата',
    default_title_multi: 'IPTV претплате',
    loading: 'Учитавање…',
    no_device: 'Није пронађена ниједна IPTV претплата: додајте интеграцију IPTV у Подешавања → Уређаји и услуге.',
    unavailable: 'IPTV сервер није доступан',
    refresh: 'Освежи',
    edit_btn: 'Измени податке за пријаву',
    edit_title: 'Измени налог',
    edit_url: 'URL сервера',
    edit_username: 'Корисничко име',
    edit_password: 'Лозинка',
    edit_password_keep: 'Оставите празно да задржите',
    edit_mac: 'MAC адреса',
    edit_save: 'Сачувај',
    edit_cancel: 'Откажи',
    edit_saving: 'Провера…',
    err_invalid_auth: 'Подаци за пријаву су одбијени',
    err_cannot_connect: 'Сервер није доступан',
    err_invalid_mac: 'Неважећа MAC адреса',
    err_no_french_lists: 'Овај провајдер нема ниједну француску листу',
    err_french_unknown: 'Није могуће прочитати категорије',
    err_stream_ko: 'Тест канал се не репродукује',
    err_already_configured: 'Други налог већ користи ове податке за пријаву',
    err_not_found: 'Налог није пронађен',
    err_generic: 'Ажурирање није успело',
    del_btn: 'Уклони налог',
    del_title: 'Уклони налог',
    del_confirm: 'Налог и његови ентитети биће уклоњени.',
    del_delete: 'Обриши',
    add_btn: 'Додај налог',
    add_title: 'Додај налог',
    add_provider: 'Тип провајдера',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Додај',
    err_existing_longer: 'На овом серверу већ постоји налог који важи дуже',
    err_empty_catalogue: 'Провајдер нема употребљив каталог',
    view_btn: 'Прикажи податке за пријаву',
    view_m3u: 'M3U листа',
    view_xmltv: 'EPG водич (XMLTV)',
    view_title: 'Подаци за пријаву',
    copy: 'Копирај',
    view_show: 'Прикажи',
    view_hide: 'Сакриј',
    status_active: 'Активна',
    status_expired: 'Истекла',
    status_banned: 'Блокирана',
    status_disabled: 'Онемогућена',
    status_unknown: 'Непозната',
    auth_failed: 'Неважећи подаци за пријаву',
    trial: 'Пробни период',
    expiration: 'Истек',
    never: 'Никад',
    unlimited: 'Неограничено',
    day_left: 'Преостао {n} дан',
    days_left: 'Преостало дана: {n}',
    channels: 'канали',
    movies: 'филмови',
    series: 'серије',
    connections: 'везе',
    french_on: 'FR',
    french_off: 'Без FR',
    french_title: 'Француске листе',
    last_check: 'Последња провера',
    health_ok: 'На мрежи',
    health_degraded: 'Споро',
    health_unreachable: 'Недоступно',
    health_stream_ko: 'Стрим не ради',
    health_auth_failed: 'Подаци за пријаву одбијени',
    ed_title: 'Наслов',
    ed_devices: 'Претплате (све ако је празно)',
    ed_warning_days: 'Упозорење пре истека',
    ed_language: 'Језик',
    ed_zoom: 'Дугме за детаље',
    zoom_in: 'Прикажи целу картицу',
    zoom_out: 'Назад на компактни приказ',
    mini_all_active: 'Све активне',
    mini_expiring: '{n} ускоро истиче',
    mini_expiring_plural: 'Ускоро истиче: {n}',
    mini_expired: '{n} истекла',
    mini_expired_plural: 'Истекло: {n}',
    mini_error: '{n} са грешком',
    mini_error_plural: 'Са грешком: {n}',
    mini_days: '{n} д',
  },
  'sr-Latn': {
    default_title: 'IPTV pretplata',
    default_title_multi: 'IPTV pretplate',
    loading: 'Učitavanje…',
    no_device: 'Nije pronađena nijedna IPTV pretplata: dodajte integraciju IPTV u Podešavanja → Uređaji i usluge.',
    unavailable: 'IPTV server nije dostupan',
    refresh: 'Osveži',
    edit_btn: 'Izmeni podatke za prijavu',
    edit_title: 'Izmeni nalog',
    edit_url: 'URL servera',
    edit_username: 'Korisničko ime',
    edit_password: 'Lozinka',
    edit_password_keep: 'Ostavite prazno da zadržite',
    edit_mac: 'MAC adresa',
    edit_save: 'Sačuvaj',
    edit_cancel: 'Otkaži',
    edit_saving: 'Provera…',
    err_invalid_auth: 'Podaci za prijavu su odbijeni',
    err_cannot_connect: 'Server nije dostupan',
    err_invalid_mac: 'Nevažeća MAC adresa',
    err_no_french_lists: 'Ovaj provajder nema nijednu francusku listu',
    err_french_unknown: 'Nije moguće pročitati kategorije',
    err_stream_ko: 'Test kanal se ne reprodukuje',
    err_already_configured: 'Drugi nalog već koristi ove podatke za prijavu',
    err_not_found: 'Nalog nije pronađen',
    err_generic: 'Ažuriranje nije uspelo',
    del_btn: 'Ukloni nalog',
    del_title: 'Ukloni nalog',
    del_confirm: 'Nalog i njegovi entiteti biće uklonjeni.',
    del_delete: 'Obriši',
    add_btn: 'Dodaj nalog',
    add_title: 'Dodaj nalog',
    add_provider: 'Tip provajdera',
    add_xtream: 'Xtream Codes',
    add_stalker: 'Stalker / Ministra',
    add_create: 'Dodaj',
    err_existing_longer: 'Na ovom serveru već postoji nalog koji važi duže',
    err_empty_catalogue: 'Provajder nema upotrebljiv katalog',
    view_btn: 'Prikaži podatke za prijavu',
    view_m3u: 'M3U lista',
    view_xmltv: 'EPG vodič (XMLTV)',
    view_title: 'Podaci za prijavu',
    copy: 'Kopiraj',
    view_show: 'Prikaži',
    view_hide: 'Sakrij',
    status_active: 'Aktivna',
    status_expired: 'Istekla',
    status_banned: 'Blokirana',
    status_disabled: 'Onemogućena',
    status_unknown: 'Nepoznata',
    auth_failed: 'Nevažeći podaci za prijavu',
    trial: 'Probni period',
    expiration: 'Istek',
    never: 'Nikad',
    unlimited: 'Neograničeno',
    day_left: 'Preostao {n} dan',
    days_left: 'Preostalo dana: {n}',
    channels: 'kanali',
    movies: 'filmovi',
    series: 'serije',
    connections: 'veze',
    french_on: 'FR',
    french_off: 'Bez FR',
    french_title: 'Francuske liste',
    last_check: 'Poslednja provera',
    health_ok: 'Na mreži',
    health_degraded: 'Sporo',
    health_unreachable: 'Nedostupno',
    health_stream_ko: 'Strim ne radi',
    health_auth_failed: 'Podaci za prijavu odbijeni',
    ed_title: 'Naslov',
    ed_devices: 'Pretplate (sve ako je prazno)',
    ed_warning_days: 'Upozorenje pre isteka',
    ed_language: 'Jezik',
    ed_zoom: 'Dugme za detalje',
    zoom_in: 'Prikaži celu karticu',
    zoom_out: 'Nazad na kompaktni prikaz',
    mini_all_active: 'Sve aktivne',
    mini_expiring: '{n} uskoro ističe',
    mini_expiring_plural: 'Uskoro ističe: {n}',
    mini_expired: '{n} istekla',
    mini_expired_plural: 'Isteklo: {n}',
    mini_error: '{n} sa greškom',
    mini_error_plural: 'Sa greškom: {n}',
    mini_days: '{n} d',
  },
};

// A language of the card: the full code when it has a table (sr-Latn), else its base (de-AT → de), else English
function iptvSupported(code) {
  if (!code) return null;
  if (IptvCardI18n[code]) return code;
  var base = code.split('-')[0];
  return IptvCardI18n[base] ? base : 'en';
}

function iptvLang(config, hass) {
  return iptvSupported(config?.language || hass?.language || document.documentElement.lang) || 'en';
}

// Locale for Intl / toLocale*: the full Home Assistant locale when its language is the card's (fr-CA, de-CH),
// else the card language (the language option wins); a bare pt is European Portuguese (pt-PT), not Brazilian
function iptvLocale(lang, hass) {
  var full = hass?.locale?.language || hass?.language || '';
  var latn = (c) => /-Latn/i.test(c);
  var same = full && full.split('-')[0] === lang.split('-')[0] && (lang.split('-')[0] !== 'sr' || latn(full) === latn(lang));
  var locale = same ? full : lang;
  return locale === 'pt' ? 'pt-PT' : locale;
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

// Controls of a card that can hold the focus, in document order
var IPTV_FOCUSABLE = 'button, [data-entity][tabindex]';

// What identifies a control across re-renders: its tag, classes (but the transient spin), entity and subscription
function iptvFocusSig(el) {
  var cls = String(el.className || '').split(/\s+/).filter((c) => c && c !== 'spin').join('.');
  var sub = el.dataset?.sub ?? el.closest?.('[data-sub]')?.dataset.sub ?? '';
  return [el.tagName, cls, el.dataset?.entity ?? '', sub].join('|');
}

// The focused control of a card rendered with innerHTML, so the next render can give the focus back
function iptvFocusOf(shadow, root) {
  var el = shadow?.activeElement;
  if (!el || !root?.contains(el)) return null;
  var list = [...root.querySelectorAll(IPTV_FOCUSABLE)];
  var index = list.indexOf(el);
  return index < 0 ? null : { index, sig: iptvFocusSig(el) };
}

function iptvRefocus(root, focus) {
  if (!focus || !root) return;
  var el = [...root.querySelectorAll(IPTV_FOCUSABLE)][focus.index];
  if (el && iptvFocusSig(el) === focus.sig) el.focus({ preventScroll: true });
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

// Masked text of a secret row: the whole password, or the password=… parameter of a playlist / guide URL
var IPTV_MASK = '••••••••';
function iptvMask(value, whole) {
  if (whole) return IPTV_MASK;
  return String(value == null ? '' : value).replace(/([?&]password=)[^&#]*/g, `$1${IPTV_MASK}`);
}

// The card is a size container (for its narrow layouts), which a parent sizing it from its content (inline-block,
// flex row, grid auto column of a layout card or a button card) sees as 0 px wide. This empty, zero-height SVG
// asks such a parent for 400 px, while its max-width: 100% lets it shrink to any room.
var IPTV_SIZER = '<svg class="sizer" aria-hidden="true" focusable="false"></svg>';

// ── iptv-card ─────────────────────────────────────────────────────────────────
class IptvCard extends HTMLElement {
  static CSS = `
    :host { display: block; position: relative; --iptv-ok: var(--success-color, #43a047); --iptv-warn: var(--warning-color, #ffa600); --iptv-crit: var(--error-color, #db4437);
            /* Text in a state colour: half-way to the text colour, so it stays readable (4.5:1) in light and dark themes */
            --iptv-crit-text: color-mix(in srgb, var(--iptv-crit) 50%, var(--primary-text-color)); }
    /* A size container for the narrow layouts below; while a popup is open, the card grows to hold it */
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 6px; container-type: inline-size;
              box-sizing: border-box; min-height: var(--iptv-modal-h, 0px); }
    /* See IPTV_SIZER: a replaced element with max-width: 100% adds width only to a parent that has none to give */
    .sizer { display: block; width: 400px; max-width: 100%; height: 0; }
    .ok { --c: var(--iptv-ok); } .warning { --c: var(--iptv-warn); } .error { --c: var(--iptv-crit); } .idle { --c: var(--secondary-text-color); }
    .ok, .warning, .error, .idle { --ct: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
    /* 8 px to the body (the card gap is 6 px); the status pill ends the title line, before the buttons */
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
    .header > button:last-child:not(.zoom) { margin-right: -4px; }
    /* Icon buttons never shrink: the title and the status pill give way */
    .header > button { flex: none; }
    .badge { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
             background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); --mdc-icon-size: 24px; }
    .badge ha-icon { display: inline-flex; }
    /* The title block takes the room the badge and buttons leave (from 0, not from its text width) */
    .titles { flex: 1 1 0; min-width: 6ch; }
    .title-row { display: flex; align-items: center; gap: 10px; }
    /* The title gives way first (down to its 4 characters), then the pill */
    .title-row .name { flex: 1 1 0; }
    /* The status pill keeps its whole text while it fits; truncated only when the room really runs out (whole text in its tooltip) */
    .title-row > .chip { flex: 0 1 auto; min-width: 0; }
    /* At least about 4 characters of the title stay visible */
    .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 6ch; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px 1px 5px; border-radius: 12px; font-size: 11px; font-weight: 500; max-width: 100%; box-sizing: border-box;
            color: var(--ct); background: color-mix(in srgb, var(--c) 15%, transparent); --mdc-icon-size: 14px; }
    .chip ha-icon { color: var(--c); flex: none; }
    .chip .tx { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.idle { padding-left: 10px; }
    .chip.fr { padding-left: 6px; gap: 5px; }
    .checked { display: flex; align-items: center; gap: 4px; color: var(--secondary-text-color); font-size: 11px; --mdc-icon-size: 13px; }
    .flag { width: 14px; height: 10px; border-radius: 2px; flex: none; box-shadow: 0 0 0 1px rgba(0,0,0,.12);
            background: linear-gradient(90deg, #0055a4 0 33.3%, #fff 33.3% 66.6%, #ef4135 66.6%); }
    .flag.off { filter: grayscale(1); opacity: .6; }
    .sect { display: flex; flex-direction: column; gap: 5px; }
    .sect.multi + .sect.multi { border-top: 1px solid var(--divider-color, rgba(127,127,127,.25)); padding-top: 6px; }
    /* Narrow: the pills go under the subscription name rather than cutting it */
    .sect-head { display: flex; align-items: center; justify-content: space-between; gap: 4px 8px; flex-wrap: wrap; }
    .sect-head .chips { margin-top: 0; flex: 0 1 auto; flex-wrap: wrap; justify-content: flex-end; }
    .sect-name { font-size: 14px; font-weight: 500; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sect-head .sect-name { flex: 1 1 0; min-width: min(10ch, 100%); }
    button { background:none; border:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; align-self: flex-start; display: flex; }
    button:hover { background: var(--secondary-background-color); }
    button.spin ha-icon { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* Label and date share the line, the date goes under it when they no longer fit */
    .row { display:flex; flex-wrap: wrap; justify-content:space-between; align-items:baseline; gap: 0 8px; }
    .lbl { color: var(--secondary-text-color); font-size: 11px; }
    .exp .lbl { font-size: 12px; }
    .val { font-weight:500; font-size: 14px; }
    .bar { height:4px; border-radius:3px; background: var(--divider-color, rgba(127,127,127,.25)); margin-top:4px; overflow:hidden; }
    .rem { font-weight:400; font-size:12px; color: var(--secondary-text-color); }
    .rem.warning, .rem.error { color: var(--ct); }
    .fill { height:100%; border-radius:3px; background: var(--c, var(--iptv-ok)); transition: width .6s ease; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px; }
    .stat { display:flex; align-items:center; gap:5px; padding:3px 7px; border-radius:8px; min-width: 0;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
    .stat ha-icon { color: var(--primary-color); --mdc-icon-size: 15px; flex: none; }
    .num { font-size: 14px; font-weight: 500; line-height: 1.2; white-space:nowrap; }
    .msg { color: var(--secondary-text-color); padding:8px 0; }
    .msg.err { color: var(--iptv-crit-text); }
    [data-entity] { cursor:pointer; }
    [data-entity][tabindex]:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .stat:hover { filter: brightness(0.95); }
    /* Narrow: the buttons go under the last check (still on the right) rather than out of the card */
    .foot { display:flex; flex-wrap: wrap; align-items:center; justify-content:space-between; gap:4px 8px; min-height:20px; }
    .foot-actions { display:flex; align-items:center; gap:8px; margin-left: auto; }
    button.edit, button.del, button.view { padding:4px; margin:0; align-self:center; --mdc-icon-size:16px; }
    button.del:hover { color:var(--iptv-crit); background:color-mix(in srgb, var(--iptv-crit) 12%, transparent); }
    .backdrop { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:flex-start; justify-content:center; padding-top:12px; box-sizing:border-box; z-index:9; border-radius:var(--ha-card-border-radius, 12px); }
    .modal:focus { outline: none; }
    .modal { background:var(--card-background-color, #1c1c1c); color:var(--primary-text-color); width:min(92%, 340px); border-radius:14px; padding:16px; box-shadow:0 8px 30px rgba(0,0,0,.4); display:flex; flex-direction:column; gap:10px; }
    .modal h3 { margin:0; font-size:16px; font-weight:500; }
    .field { display:flex; flex-direction:column; gap:3px; }
    .field label { font-size:11px; color:var(--secondary-text-color); }
    .field input, .field select { font:inherit; font-size:14px; padding:8px 10px; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3)); background:var(--secondary-background-color, rgba(127,127,127,.08)); color:var(--primary-text-color); }
    .field .hint { font-size:10px; color:var(--secondary-text-color); }
    .modal .err { color:var(--iptv-crit-text); font-size:12px; min-height:14px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:2px; }
    .modal button.act { border-radius:8px; padding:8px 14px; font:inherit; font-size:13px; font-weight:500; width:auto; height:auto; }
    .modal button.cancel { background:var(--secondary-background-color, rgba(127,127,127,.12)); color:var(--primary-text-color); }
    .modal button.primary { background:color-mix(in srgb, var(--primary-color, #03a9f4) 16%, transparent); color:var(--primary-color, #03a9f4); }
    .modal button.primary:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent); }
    .modal button.primary[disabled], .modal button.danger[disabled] { opacity:.6; cursor:default; }
    .modal button.danger { background:color-mix(in srgb, var(--iptv-crit) 16%, transparent); color:var(--iptv-crit-text); }
    .modal button.danger:hover:not([disabled]) { background:color-mix(in srgb, var(--iptv-crit) 24%, transparent); }
    .view-row { display:flex; align-items:center; gap:8px; }
    .view-k { font-size:11px; color:var(--secondary-text-color); width:96px; flex:none; }
    .view-v { flex:1; min-width:0; font-size:13px; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; user-select:all; }
    .modal button.copy, .modal button.reveal { padding:4px; --mdc-icon-size:16px; width:auto; height:auto; background:none; color:var(--secondary-text-color); }
    .modal button.copy.ok { color:var(--iptv-ok); }
    /* Narrow card (inner width; 6 columns of a section = 132 to 220 px): the figures keep their room (no icon, then two tiles a row) */
    @container (max-width: 340px) {
      .stat { justify-content: center; }
      .stat ha-icon { display: none; }
    }
    /* Narrower (6 columns of a section, a phone at 156 px): the title and its pills get a line of their own,
       under the badge and the buttons, so the title and the pill text stay whole */
    @container (max-width: 260px) {
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .header { flex-wrap: wrap; row-gap: 6px; }
      .titles { order: 1; flex-basis: 100%; }
      .header > .titles + button { margin-left: auto; }
      .header, .title-row { gap: 6px; }
      .header > button:not(.zoom) { padding: 6px; }
      /* The pill goes under the title rather than leave it fewer than 4 characters */
      .title-row { flex-wrap: wrap; row-gap: 4px; }
    }
    /* Phone width: a smaller badge and buttons keep them (and the mini card's detail button) on one line */
    @container (max-width: 200px) {
      .header > .badge { width: 32px; height: 32px; --mdc-icon-size: 20px; }
      .header > button:not(.zoom) { padding: 4px; }
    }
    /* Last resort (narrower than any section column): the status pills keep their icon only */
    @container (max-width: 120px) {
      .title-row > .chip .tx, .titles .chips .chip:not(.fr):not(.idle) .tx { display: none; }
      .title-row > .chip, .titles .chips .chip:not(.fr):not(.idle) { padding: 1px 5px; }
    }
    /* Reduced motion: no spinning or sliding; the refresh button stays dimmed while it works */
    @media (prefers-reduced-motion: reduce) {
      button.spin ha-icon { animation: none; opacity: .5; }
      .fill { transition: none; }
    }
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
          { value: 'it', label: 'Italiano' },
          { value: 'nl', label: 'Nederlands' },
          { value: 'pt', label: 'Português (Portugal)' },
          { value: 'pl', label: 'Polski' },
          { value: 'ro', label: 'Română' },
          { value: 'da', label: 'Dansk' },
          { value: 'sv', label: 'Svenska' },
          { value: 'bg', label: 'Български' },
          { value: 'ru', label: 'Русский' },
          { value: 'uk', label: 'Українська' },
          { value: 'hu', label: 'Magyar' },
          { value: 'sk', label: 'Slovenčina' },
          { value: 'cs', label: 'Čeština' },
          { value: 'sl', label: 'Slovenščina' },
          { value: 'lv', label: 'Latviešu' },
          { value: 'el', label: 'Ελληνικά' },
          { value: 'sr', label: 'Српски' },
          { value: 'sr-Latn', label: 'Srpski (latinica)' },
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
    // Full width of a section by default; below 6 columns (246 px) the figures no longer fit
    return { columns: 12, min_columns: 6, rows: 'auto' };
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

  // Status pill of one subscription; on a narrow card only its icon shows, the label stays in its tooltip
  _statusChip(v) {
    if (!v) return '';
    var label = iptvEsc(v.statusLabel);
    return `<span class="chip ${v.state}" data-entity="status" title="${label}"><ha-icon icon="${iptvStateIcon(v.state)}"></ha-icon><span class="tx">${label}</span></span>`;
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    var lang = iptvLang(this._config, this._hass);
    var locale = iptvLocale(lang, this._hass);
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
      return `<span class="chip ${cls}" data-entity="health" title="${esc(label)}"><ha-icon icon="${icon}"></ha-icon><span class="tx">${esc(label)}</span></span>`;
    };

    // French flag pill: French lists found (green) or not (red)
    var frenchChip = (fr) =>
      fr === null || fr === undefined
        ? ''
        : `<span class="chip ${fr ? 'ok' : 'error'} fr" data-entity="french_lists" title="${esc(this._t('french_title'))}"><span class="flag${fr ? '' : ' off'}"></span><span class="tx">${esc(this._t(fr ? 'french_on' : 'french_off'))}</span></span>`;

    var statusChip = (v) => this._statusChip(v);
    // Trial, French and health pills of one subscription
    var infoChips = (v, h, fr) =>
      `${v?.d.is_trial ? `<span class="chip idle"><span class="tx">${esc(this._t('trial'))}</span></span>` : ''}${v ? frenchChip(fr) : ''}${healthChip(h, v)}`;
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
    var focus = iptvFocusOf(this.shadowRoot, this._root);
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
      </ha-card>${IPTV_SIZER}`;
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
    iptvRefocus(this._root, focus);
  }

  // [data-entity] elements open their subscription's entity; header pills (single
  // subscription) belong to the first subscription
  _bindMoreInfo(subs) {
    this._root.querySelectorAll('[data-entity]').forEach((el) => {
      var sect = el.closest('[data-sub]');
      var sub = subs[sect ? Number(sect.dataset.sub) : 0];
      var entityId = sub?.ids[el.dataset.entity];
      if (!entityId) return;
      // A button for the keyboard and screen readers too: Tab to reach it, Enter or Space to open it
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => this._moreInfo(entityId));
      el.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Enter' && ev.key !== ' ') return;
        ev.preventDefault();
        this._moreInfo(entityId);
      });
    });
  }

  // Open the Home Assistant entity dialog
  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entityId }, bubbles: true, composed: true }));
  }

  // ── Edit credentials popup ────────────────────────────────────────────────
  async _openEditor(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`<h3 id="iptv-dialog-title">${esc(this._t('edit_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
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
      <h3 id="iptv-dialog-title">${esc(this._t('edit_title'))}</h3>
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
    this._focusModal(modal, 'input');
  }

  // Close the open popup: the card gets its height and keyboard back, the focus returns to the button that opened it
  _closeEditor() {
    if (!this._modal) return;
    this._modal.remove();
    this._modal = null;
    this._modalObserver?.disconnect();
    this._modalObserver = null;
    this.style.removeProperty('--iptv-modal-h');
    if (this._root) this._root.inert = false;
    iptvRefocus(this._root, this._modalOpener);
    this._modalOpener = null;
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

  // Open a modal with the given inner HTML (wrapped in .modal) and return it. It is a modal dialog named by
  // its <h3 id="iptv-dialog-title">: the card under the veil is inert, Escape closes it, and the card grows
  // to hold it instead of letting it cover the next card.
  _openModal(innerHtml) {
    this._closeEditor();
    this._modalOpener = iptvFocusOf(this.shadowRoot, this._root);
    var modal = document.createElement('div');
    modal.className = 'backdrop';
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="iptv-dialog-title" tabindex="-1">${innerHtml}</div>`;
    modal.addEventListener('click', (e) => { if (e.target === modal) this._closeEditor(); });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') this._trapTab(e, modal);
      if (e.key !== 'Escape') return;
      // Only this popup: not a Home Assistant dialog the card is in
      e.stopPropagation();
      this._closeEditor();
    });
    this.shadowRoot.appendChild(modal);
    this._modal = modal;
    if (this._root) this._root.inert = true;
    var box = modal.querySelector('.modal');
    // 12 px above and below the popup; its height changes with its content (loading, fields, errors)
    var fit = () => this.style.setProperty('--iptv-modal-h', `${Math.ceil(box.offsetHeight) + 24}px`);
    if (typeof ResizeObserver === 'function') {
      this._modalObserver = new ResizeObserver(fit);
      this._modalObserver.observe(box);
    }
    fit();
    box.focus({ preventScroll: true });
    return modal;
  }

  // Tab and Shift+Tab go round the popup's controls instead of leaving it for the page
  _trapTab(e, modal) {
    var items = [...modal.querySelectorAll('input, select, button:not([disabled])')];
    if (!items.length) return;
    var active = this.shadowRoot.activeElement;
    var last = items[items.length - 1];
    if (e.shiftKey && (active === items[0] || !items.includes(active))) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && (active === last || !items.includes(active))) {
      e.preventDefault();
      items[0].focus({ preventScroll: true });
    }
  }

  // Focus the first control of a popup matching the selector (the popup itself keeps it otherwise);
  // never scrolls the page: the popup opens where the user just clicked
  _focusModal(modal, selector) {
    modal.querySelector(selector)?.focus({ preventScroll: true });
  }

  _confirmDelete(sub) {
    var esc = iptvEsc;
    var modal = this._openModal(`
        <h3 id="iptv-dialog-title">${esc(this._t('del_title'))}</h3>
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
    // Cancel, not Remove: Enter right after opening does not delete the account
    this._focusModal(modal, '.cancel');
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
        <h3 id="iptv-dialog-title">${esc(this._t('add_title'))}</h3>
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
    this._focusModal(modal, '.prov');
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
    var modal = this._openModal(`<h3 id="iptv-dialog-title">${esc(this._t('view_title'))}</h3><div class="hint">${esc(this._t('edit_saving'))}</div>`);
    var creds = await this._ws('get_credentials', { device_id: sub.device });
    if (this._modal !== modal) return;
    if (!creds.ok) return this._modalError(modal, 'view_title', creds.error);
    var close = `<div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    // [label, value, secret]: 'whole' masks the value, 'url' its password parameter
    var rows = creds.provider === 'stalker'
      ? [['edit_url', creds.url], ['edit_mac', creds.mac]]
      : [['edit_url', creds.url], ['edit_username', creds.username], ['edit_password', creds.password, 'whole']];
    // Xtream Codes: the playlist and the guide to paste into a player (VLC, TiviMate, Jellyfin…)
    if (creds.m3u_url) rows.push(['view_m3u', creds.m3u_url, 'url']);
    if (creds.xmltv_url) rows.push(['view_xmltv', creds.xmltv_url, 'url']);
    var rowsHtml = rows.map((r) => `
      <div class="view-row">
        <div class="view-k">${esc(this._t(r[0]))}</div>
        <div class="view-v">${esc(r[2] ? iptvMask(r[1], r[2] === 'whole') : r[1])}</div>
        ${r[2] ? `<button class="reveal" title="${esc(this._t('view_show'))}" aria-label="${esc(this._t('view_show'))}" aria-pressed="false"><ha-icon icon="mdi:eye"></ha-icon></button>` : ''}
        <button class="copy" title="${esc(this._t('copy'))}"><ha-icon icon="mdi:content-copy"></ha-icon></button>
      </div>`).join('');
    modal.querySelector('.modal').innerHTML = `<h3 id="iptv-dialog-title">${esc(this._t('view_title'))}</h3>${rowsHtml}${close}`;
    // The values stay in a closure: a secret is written into the DOM only while shown, and the popup
    // is rebuilt masked each time it opens
    modal.querySelectorAll('.view-row').forEach((row, i) => {
      var r = rows[i];
      var copy = row.querySelector('button.copy');
      copy.addEventListener('click', () => this._copy(copy, r[1]));
      var reveal = row.querySelector('button.reveal');
      if (reveal) reveal.addEventListener('click', () => this._toggleSecret(row, reveal, r));
    });
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    this._focusModal(modal, 'button.copy');
  }

  // Show or mask again one secret row of the view popup
  _toggleSecret(row, btn, r) {
    var shown = btn.getAttribute('aria-pressed') !== 'true';
    row.querySelector('.view-v').textContent = shown ? r[1] : iptvMask(r[1], r[2] === 'whole');
    var label = this._t(shown ? 'view_hide' : 'view_show');
    btn.setAttribute('aria-pressed', String(shown));
    btn.setAttribute('title', label);
    btn.setAttribute('aria-label', label);
    btn.querySelector('ha-icon').setAttribute('icon', shown ? 'mdi:eye-off' : 'mdi:eye');
  }

  // Error message in an open popup, with a close button
  _modalError(modal, titleKey, error) {
    var esc = iptvEsc;
    modal.querySelector('.modal').innerHTML = `<h3 id="iptv-dialog-title">${esc(this._t(titleKey))}</h3><div class="err">${esc(this._err(error))}</div><div class="modal-actions"><button class="act cancel">${esc(this._t('edit_cancel'))}</button></div>`;
    modal.querySelector('.cancel').addEventListener('click', () => this._closeEditor());
    this._focusModal(modal, '.cancel');
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
    /* The full card's badge (40 px), top-aligned: 12 px from the card's top edge, like the other cards (the two
       lines are taller than the badge) */
    .mini .badge { align-self: flex-start; }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    /* The title gives way first (down to its 4 characters), then the pill */
    .mini .name { flex: 1 1 0; min-width: 4.5ch; }
    .head .chip { flex: 0 1 auto; min-width: 0; margin-left: auto; }
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
    iptvRefocus(this._root, focus);
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
    label = iptvEsc(label);
    return `<span class="chip ${state}" title="${label}" aria-label="${label}"><ha-icon icon="${iptvStateIcon(state)}"></ha-icon><span class="tx">${label}</span></span>`;
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
      </ha-card>${IPTV_SIZER}`;
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
      if (ev.detail === 0) this._root.querySelector('button.zoom')?.focus({ preventScroll: true });
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
