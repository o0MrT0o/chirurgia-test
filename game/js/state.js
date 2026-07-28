'use strict';
/* =====================================================================
   STATE.JS — stan gry, zapis/odczyt, funkcje pomocnicze.
   ===================================================================== */

const SAVE_KEY = 'kosmiczny_gornik_save_v1';

const DEFAULT_STATE = () => ({
  crystals: 0,          // aktualna waluta
  totalEarned: 0,       // łącznie w tej rundzie (do prestiżu)
  allTimeEarned: 0,     // łącznie od początku gry
  totalClicks: 0,
  buildings: {},        // id -> ilość
  upgrades: {},         // id -> true
  achievements: {},     // id -> true
  stardust: 0,          // gwiezdny pył do wydania (waluta prestiżu)
  totalStardustEarned: 0, // pył zdobyty łącznie od początku gry
  talents: {},          // id talentu -> poziom
  prestigeCount: 0,
  singularities: 0,          // waluta odrodzenia (druga warstwa prestiżu, nad pyłem/talentami)
  totalSingularitiesEarned: 0, // osobliwości zdobyte łącznie od początku gry
  rebirthCount: 0,
  stardustAtLastRebirth: 0,  // migawka totalStardustEarned z chwili ostatniego odrodzenia
  cometsCaught: 0,
  loginStreak: 0,
  lastLoginDay: '',
  dailyClaimed: false,
  boostUntil: 0,        // timestamp końca boostu z reklamy
  frenzyUntil: 0,       // timestamp końca szału komety
  feverUntil: 0,        // timestamp końca gorączki kryształowej (klik ×5)
  autoClickUntil: 0,    // timestamp końca auto-klikacza z reklamy
  dailyMissions: { date: '', missions: [] }, // misje dnia
  missionCounters: {},  // dzienne liczniki postępu misji
  missionsCompleted: 0, // wykonane misje łącznie (od początku gry)
  zone: 0,              // najwyższy odkryty sektor (indeks w ZONES)
  lang: '',             // '' = wykryj z urządzenia; 'pl' | 'en' = wybór gracza
  soundOn: true,        // dźwięki włączone?
  musicOn: true,        // muzyka w tle włączona?
  vibrateOn: true,      // wibracje włączone?
  soundVol: 0.8,        // głośność efektów (0–1)
  musicVol: 0.6,        // głośność muzyki (0–1)
  notifOn: true,        // powiadomienia przypominające włączone?
  notifAsked: false,    // czy pytaliśmy już o zgodę na powiadomienia?
  tutorialStep: 0,      // krok samouczka (99 = ukończony/pominięty)
  expedition: null,     // aktywna wyprawa: { planet, end } albo null
  expeditionsDone: 0,   // ukończone wyprawy łącznie
  artifacts: {},        // id artefaktu -> true (kolekcja)
  bossesKilled: 0,      // pokonani bossowie łącznie
  research: null,       // aktywne badanie: { id, end } albo null
  researchDone: {},     // id badania -> true (ukończone)
  skin: 'classic',      // wybrana skórka asteroidy
  skinsBought: {},      // skórki kupione za pył (te z warunkiem liczą się same)
  totalUpgradesBought: 0, // ulepszenia kupione łącznie (od początku gry)
  playSeconds: 0,       // łączny czas gry (sekundy)
  bestCps: 0,           // rekordowa produkcja na sekundę
  lastMilestone: 0,     // najwyższy osiągnięty kamień milowy (wartość)
  bestCombo: 0,         // rekordowy kombos klikania
  lastWheelSpinDay: '', // ostatni dzień darmowego zakręcenia kołem
  freeSpins: 0,         // dodatkowe darmowe zakręcenia (z segmentu „Darmowy los")
  totalSpins: 0,        // łącznie zakręceń kołem
  lastSeen: Date.now(),
});

let S = DEFAULT_STATE();

// ---------- Pomocnicze ----------
const $ = sel => document.querySelector(sel);
const now = () => Date.now();
const todayStr = () => new Date().toISOString().slice(0, 10);
// Wibracja z poszanowaniem ustawienia gracza (jedno miejsce zamiast rozsianych warunków).
const buzz = pattern => { if (S.vibrateOn && navigator.vibrate) navigator.vibrate(pattern); };

function totalBuildings(s) {
  return Object.values(s.buildings).reduce((a, b) => a + b, 0);
}

function fmtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h >= 24) return `${Math.floor(h / 24)} d ${h % 24} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

const SUFFIXES_PL = ['', ' tys.', ' mln', ' mld', ' bln', ' bld', ' tryl.'];
const SUFFIXES_EN = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
function fmt(n) {
  const en = (typeof LANG !== 'undefined' && LANG === 'en');
  const dec = s => en ? s : s.replace('.', ',');
  if (n < 1000) return dec((Math.floor(n * 10) / 10).toString());
  const suf = en ? SUFFIXES_EN : SUFFIXES_PL;
  const tier = Math.min(Math.floor(Math.log10(n) / 3), suf.length - 1);
  const scaled = n / Math.pow(1000, tier);
  return dec((Math.floor(scaled * 100) / 100).toString()) + suf[tier];
}

// ---------- Zapis / odczyt ----------
function save() {
  S.lastSeen = now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) S = Object.assign(DEFAULT_STATE(), JSON.parse(raw));
    // migracja starych zapisów: pył sprzed drzewka talentów liczy się jako zdobyty
    if (!S.totalStardustEarned && S.stardust > 0) S.totalStardustEarned = S.stardust;
    // migracja: doświadczeni gracze nie dostają samouczka
    if (S.tutorialStep === 0 && S.allTimeEarned > 1000) S.tutorialStep = 99;
  } catch (e) {}
  // Język: wybór gracza, a przy pierwszym uruchomieniu — wykryty z urządzenia.
  setLang(S.lang || detectLang());
}

// ---------- Kopia zapasowa (eksport/import zapisu) ----------
function exportSave() {
  return btoa(unescape(encodeURIComponent(JSON.stringify(S))));
}

function importSave(code) {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (typeof obj.crystals !== 'number' || typeof obj.totalEarned !== 'number') return false;
    S = Object.assign(DEFAULT_STATE(), obj);
    save();
    return true;
  } catch (e) {
    return false;
  }
}
