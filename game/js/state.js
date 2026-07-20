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
  stardust: 0,          // waluta prestiżu
  prestigeCount: 0,
  cometsCaught: 0,
  loginStreak: 0,
  lastLoginDay: '',
  dailyClaimed: false,
  boostUntil: 0,        // timestamp końca boostu z reklamy
  frenzyUntil: 0,       // timestamp końca szału komety
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
  } catch (e) {}
}
