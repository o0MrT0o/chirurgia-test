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
  cometsCaught: 0,
  loginStreak: 0,
  lastLoginDay: '',
  dailyClaimed: false,
  boostUntil: 0,        // timestamp końca boostu z reklamy
  frenzyUntil: 0,       // timestamp końca szału komety
  feverUntil: 0,        // timestamp końca gorączki kryształowej (klik ×5)
  dailyMissions: { date: '', missions: [] }, // misje dnia
  missionCounters: {},  // dzienne liczniki postępu misji
  missionsCompleted: 0, // wykonane misje łącznie (od początku gry)
  soundOn: true,        // dźwięki włączone?
  tutorialStep: 0,      // krok samouczka (99 = ukończony/pominięty)
  expedition: null,     // aktywna wyprawa: { planet, end } albo null
  expeditionsDone: 0,   // ukończone wyprawy łącznie
  artifacts: {},        // id artefaktu -> true (kolekcja)
  totalUpgradesBought: 0, // ulepszenia kupione łącznie (od początku gry)
  playSeconds: 0,       // łączny czas gry (sekundy)
  bestCps: 0,           // rekordowa produkcja na sekundę
  lastSeen: Date.now(),
});

let S = DEFAULT_STATE();

// ---------- Pomocnicze ----------
const $ = sel => document.querySelector(sel);
const now = () => Date.now();
const todayStr = () => new Date().toISOString().slice(0, 10);

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

const SUFFIXES = ['', ' tys.', ' mln', ' mld', ' bln', ' bld', ' tryl.'];
function fmt(n) {
  if (n < 1000) return (Math.floor(n * 10) / 10).toString().replace('.', ',');
  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIXES.length - 1);
  const scaled = n / Math.pow(1000, tier);
  return (Math.floor(scaled * 100) / 100).toString().replace('.', ',') + SUFFIXES[tier];
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
