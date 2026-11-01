/*
 * IPTV sidebar panel — every IPTV account in one page (administrators only).
 *
 * Left: the bundled iptv-card, which already adds, views, edits and removes accounts.
 * Right: one settings form per account (name, polling, expiration notice, health check,
 * stream test) and a "check now" action, through the iptv/accounts, iptv/update_account
 * and iptv/check_account WebSocket commands. The list follows config entry changes
 * (config_entries/subscribe), so an account added or removed from the card shows up here.
 *
 * https://github.com/juju35/ha-iptv
 */
var IPTV_PANEL_VERSION = '3.22.4';

var IptvPanelI18n = {
  en: {
    title: 'IPTV',
    accounts: 'Subscriptions',
    settings: 'Settings',
    none: 'No account yet: add one with the + button of the card.',
    loading: 'Loading…',
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
  },
  fr: {
    title: 'IPTV',
    accounts: 'Abonnements',
    settings: 'Réglages',
    none: 'Aucun compte : ajoutez-en un avec le bouton + de la carte.',
    loading: 'Chargement…',
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
  },
  de: {
    title: 'IPTV',
    accounts: 'Abonnements',
    settings: 'Einstellungen',
    none: 'Noch kein Konto: füge eines mit der +-Schaltfläche der Karte hinzu.',
    loading: 'Wird geladen…',
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
  },
  es: {
    title: 'IPTV',
    accounts: 'Suscripciones',
    settings: 'Ajustes',
    none: 'Aún no hay cuentas: añade una con el botón + de la tarjeta.',
    loading: 'Cargando…',
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
  },
  it: {
    title: 'IPTV',
    accounts: 'Abbonamenti',
    settings: 'Impostazioni',
    none: 'Ancora nessun account: aggiungine uno con il pulsante + della scheda.',
    loading: 'Caricamento…',
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
  },
  nl: {
    title: 'IPTV',
    accounts: 'Abonnementen',
    settings: 'Instellingen',
    none: 'Nog geen account: voeg er een toe met de knop + van de kaart.',
    loading: 'Laden…',
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
  },
  pt: {
    title: 'IPTV',
    accounts: 'Subscrições',
    settings: 'Definições',
    none: 'Ainda não há contas: adicione uma com o botão + do cartão.',
    loading: 'A carregar…',
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
  },
  pl: {
    title: 'IPTV',
    accounts: 'Subskrypcje',
    settings: 'Ustawienia',
    none: 'Brak kont: dodaj konto przyciskiem + na karcie.',
    loading: 'Ładowanie…',
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
  },
  sr: {
    title: 'IPTV',
    accounts: 'Претплате',
    settings: 'Подешавања',
    none: 'Још нема налога: додајте га дугметом + на картици.',
    loading: 'Учитавање…',
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
  },
  'sr-Latn': {
    title: 'IPTV',
    accounts: 'Pretplate',
    settings: 'Podešavanja',
    none: 'Još nema naloga: dodajte ga dugmetom + na kartici.',
    loading: 'Učitavanje…',
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
  },
};

// Same limits as the options flow (const.py)
var IPTV_PANEL_LIMITS = {
  scan_interval: [5, 1440],
  notify_days: [0, 60],
  health_interval: [1, 60],
};

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

// Tone of a config entry state, for its pill
function iptvPanelTone(state) {
  if (state === 'loaded') return 'good';
  if (state === 'setup_retry' || state === 'not_loaded') return 'warn';
  return 'bad';
}

class IptvPanel extends HTMLElement {
  static STYLE = `
    :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color);
            --tone-good: var(--success-color, #43a047); --tone-warn: var(--warning-color, #ffa600); --tone-bad: var(--error-color, #db4437); }
    .toolbar { height:var(--header-height, 56px); display:flex; align-items:center; gap:8px; padding:0 12px; box-sizing:border-box;
               background:var(--app-header-background-color, var(--primary-color)); color:var(--app-header-text-color, #fff);
               border-bottom:var(--app-header-border-bottom, none); font-size:20px; }
    .toolbar .grow { flex:1; }
    .toolbar a { color:inherit; display:flex; padding:8px; border-radius:50%; --mdc-icon-size:22px; }
    .toolbar a:hover { background:rgba(255,255,255,.12); }
    main { max-width:1200px; margin:0 auto; padding:16px; box-sizing:border-box; display:grid; gap:16px; grid-template-columns:minmax(0, 1fr); }
    @media (min-width: 960px) { main { grid-template-columns:minmax(0, 5fr) minmax(0, 6fr); align-items:start; } }
    h2 { margin:0 0 8px 4px; font-size:14px; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--secondary-text-color); }
    .column { display:flex; flex-direction:column; gap:12px; min-width:0; }
    .note { padding:16px; color:var(--secondary-text-color); }
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
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._accounts = null;
    // Fields the user edited, per account: the rest of a form always shows the stored values
    this._drafts = {};
    this._status = {};
    this._busy = {};
    // Passwords revealed on request ({password, updatedAt}), kept in memory only while shown
    this._secrets = {};
  }

  set hass(hass) {
    var first = !this._hass;
    var langBefore = this._lang();
    this._hass = hass;
    if (this._card) this._card.hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (first) this._start();
    else if (this._lang() !== langBefore) this._render();
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
  }

  set panel(panel) {
    this._panel = panel;
  }

  connectedCallback() {
    if (this._hass && !this._unsub) this._subscribe();
  }

  disconnectedCallback() {
    this._secrets = {};
    if (this._unsub) {
      this._unsub.then((off) => off()).catch(() => {});
      this._unsub = null;
    }
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

  async _start() {
    this._render();
    var version = this._panel?.config?.version || IPTV_PANEL_VERSION;
    try {
      if (!customElements.get('iptv-card')) await import(`/iptv/iptv-card.js?v=${version}`);
    } catch (err) {
      console.error('IPTV panel: could not load the card', err);
    }
    this._mountCard();
    this._subscribe();
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
    try {
      var res = await this._hass.callWS({ type: 'iptv/accounts' });
      this._accounts = res.accounts || [];
    } catch (err) {
      console.error('IPTV panel: could not list the accounts', err);
      this._accounts = this._accounts || [];
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
      <div class="toolbar">
        <ha-menu-button></ha-menu-button>
        <span class="grow">${iptvPanelEsc(this._t('title'))}</span>
        <a href="/config/integrations/integration/iptv" title="${iptvPanelEsc(this._t('open_integration'))}"><ha-icon icon="mdi:cog"></ha-icon></a>
      </div>
      <main>
        <section class="column"><h2>${iptvPanelEsc(this._t('accounts'))}</h2><div id="card"></div></section>
        <section class="column"><h2>${iptvPanelEsc(this._t('settings'))}</h2><div id="accounts" class="column"></div></section>
      </main>`;
    this._menu = root.querySelector('ha-menu-button');
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    if (this._card) root.getElementById('card').appendChild(this._card);
    this._renderAccounts();
  }

  _mountCard() {
    if (!customElements.get('iptv-card')) return;
    this._card = document.createElement('iptv-card');
    // No `language`: the card follows hass.language, so it switches language with the panel
    this._card.setConfig({});
    this._card.hass = this._hass;
    this.shadowRoot.getElementById('card')?.appendChild(this._card);
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

  _number(acc, key, label, hint, unit) {
    var [lo, hi] = IPTV_PANEL_LIMITS[key];
    var value = this._draft(acc)[key];
    var n = Number(value);
    var ok = Number.isInteger(n) && n >= lo && n <= hi;
    return `
      <label class="ctl">
        <span>${iptvPanelEsc(this._t(label))}</span>
        <div class="box${ok ? '' : ' bad-value'}">
          <input type="number" inputmode="numeric" min="${lo}" max="${hi}" step="1" data-key="${key}" value="${iptvPanelEsc(value)}">
          <em>${iptvPanelEsc(this._t(unit))}</em>
        </div>
        <small>${iptvPanelEsc(this._t(hint, { min: lo, max: hi }))}</small>
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
    if (stalker) return `<div class="creds">${login}</div>`;
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

  _accountHtml(acc) {
    var d = this._draft(acc);
    var esc = iptvPanelEsc;
    var state = this._t(`st_${acc.state}`) === `st_${acc.state}` ? this._t('st_other') : this._t(`st_${acc.state}`);
    var status = this._status[acc.entry_id];
    var busy = this._busy[acc.entry_id];
    var canSave = !busy && this._changed(acc) && this._valid(acc);
    var icon = acc.provider === 'stalker' ? 'mdi:router-network' : 'mdi:account-key';
    return `
      <ha-card class="account" data-id="${esc(acc.entry_id)}">
        <div class="acc-head">
          <div class="avatar"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="who">
            <div class="n">${esc(acc.title)}</div>
            <div class="s">${esc(acc.provider === 'stalker' ? 'Stalker' : 'Xtream')} · ${esc(acc.url)}</div>
          </div>
          <span class="pill ${iptvPanelTone(acc.state)}">${esc(state)}</span>
        </div>
        ${this._credsHtml(acc)}
        <div class="grid">
          <label class="ctl wide">
            <span>${esc(this._t('f_name'))}</span>
            <div class="box"><input type="text" data-key="title" value="${esc(d.title)}" placeholder="${esc(acc.auto_title)}"></div>
            <small>${esc(this._t('f_name_hint'))}</small>
          </label>
          ${this._number(acc, 'scan_interval', 'f_scan', 'f_scan_hint', 'u_min')}
          ${this._number(acc, 'notify_days', 'f_notify', 'f_notify_hint', 'u_days')}
          ${this._number(acc, 'health_interval', 'f_health', 'f_health_hint', 'u_min')}
          <label class="toggle wide">
            <div><span>${esc(this._t('f_stream'))}</span><small class="msg">${esc(this._t('f_stream_hint'))}</small></div>
            <ha-switch data-key="stream_check"${d.stream_check ? ' checked' : ''}></ha-switch>
          </label>
        </div>
        <div class="bar">
          <div class="links">
            ${acc.device_id ? `<a href="/config/devices/device/${esc(acc.device_id)}"><ha-icon icon="mdi:devices"></ha-icon>${esc(this._t('open_device'))}</a>` : ''}
            ${status ? `<span class="msg ${status.tone || ''}">${esc(status.text)}</span>` : ''}
          </div>
          <button class="act quiet" data-do="check"${busy ? ' disabled' : ''}><ha-icon icon="mdi:stethoscope"></ha-icon>${esc(this._t(busy === 'check' ? 'checking' : 'check'))}</button>
          <button class="act" data-do="save"${canSave ? '' : ' disabled'}><ha-icon icon="mdi:content-save"></ha-icon>${esc(this._t(busy === 'save' ? 'saving' : 'save'))}</button>
        </div>
      </ha-card>`;
  }

  _renderAccounts() {
    var box = this.shadowRoot.getElementById('accounts');
    if (!box) return;
    if (this._accounts === null) {
      box.innerHTML = `<ha-card class="note">${iptvPanelEsc(this._t('loading'))}</ha-card>`;
      return;
    }
    if (!this._accounts.length) {
      box.innerHTML = `<ha-card class="note">${iptvPanelEsc(this._t('none'))}</ha-card>`;
      return;
    }
    var focus = this._focusOf(box);
    box.innerHTML = this._accounts.map((acc) => this._accountHtml(acc)).join('');
    this._accounts.forEach((acc) => {
      this._bind(acc, box.querySelector(`ha-card[data-id="${CSS.escape(acc.entry_id)}"]`));
    });
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
    el.querySelectorAll('input').forEach((input) => {
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
    el.querySelectorAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', () => this._copy(acc, button.dataset.copy, button));
    });
    el.querySelector('[data-do="save"]').addEventListener('click', () => this._save(acc));
    el.querySelector('[data-do="check"]').addEventListener('click', () => this._check(acc));
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
