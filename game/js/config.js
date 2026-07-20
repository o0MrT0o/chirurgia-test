'use strict';
/* =====================================================================
   CONFIG.JS — cały balans gry w jednym miejscu.
   Chcesz zmienić koszty, produkcję, nagrody? Edytuj TYLKO ten plik.
   ===================================================================== */

// ---------- Stałe balansu ----------
const BALANCE = {
  costGrowth: 1.15,        // każdy kolejny budynek droższy o 15%
  clickCpsBonus: 0.02,     // klik daje dodatkowo 2% produkcji na sekundę
  offlineRate: 0.5,        // zarobki offline liczone na 50%
  offlineMaxHours: 8,      // maksymalnie 8 h zarobków offline
  stardustDivisor: 1e7,    // pył = sqrt(zarobki_rundy / ta_liczba)
  stardustBonus: 0.05,     // +5% produkcji za każdy pyłek
  achievementBonus: 0.01,  // +1% produkcji za każde osiągnięcie
  adBoostMult: 2,          // boost reklamowy ×2
  adBoostSeconds: 120,     // ...przez 2 minuty
  frenzyMult: 7,           // szał komety ×7
  frenzySeconds: 30,       // ...przez 30 sekund
  cometMinDelay: 60,       // kometa: min odstęp (sekundy)
  cometMaxDelay: 180,      // kometa: max odstęp (sekundy)
  cometLifetime: 12,       // ile sekund kometa jest widoczna
  dailyStreakCap: 7,       // bonus dzienny rośnie do 7 dni serii
};

// ---------- Budynki (produkcja pasywna) ----------
const BUILDINGS = [
  { id: 'robot',   name: 'Astro-górnik',        icon: '🤖', baseCost: 15,      cps: 0.1 },
  { id: 'drill',   name: 'Wiertło laserowe',    icon: '🔩', baseCost: 100,     cps: 1 },
  { id: 'drone',   name: 'Dron wydobywczy',     icon: '🛸', baseCost: 1100,    cps: 8 },
  { id: 'moon',    name: 'Kopalnia księżycowa', icon: '🌙', baseCost: 12000,   cps: 47 },
  { id: 'ship',    name: 'Statek towarowy',     icon: '🚀', baseCost: 130000,  cps: 260 },
  { id: 'station', name: 'Stacja orbitalna',    icon: '🛰️', baseCost: 1.4e6,  cps: 1400 },
  { id: 'factory', name: 'Fabryka planetarna',  icon: '🏭', baseCost: 2e7,     cps: 7800 },
  { id: 'portal',  name: 'Portal wymiarowy',    icon: '🌀', baseCost: 3.3e8,   cps: 44000 },
  { id: 'sun',     name: 'Sztuczna gwiazda',    icon: '☀️', baseCost: 5.1e9,  cps: 260000 },
  { id: 'hole',    name: 'Czarna dziura',       icon: '🕳️', baseCost: 7.5e10, cps: 1.6e6 },
];

// ---------- Ulepszenia (kupowane raz) ----------
// type: 'click' (mnoży klik) | 'building' (mnoży cps budynku target) | 'global' (mnoży wszystko)
const UPGRADES = [
  { id: 'c1', name: 'Wzmocnione rękawice', icon: '🧤', cost: 100,    type: 'click', mult: 2,  desc: 'Klikanie ×2' },
  { id: 'c2', name: 'Tytanowy kilof',      icon: '⛏️', cost: 2500,   type: 'click', mult: 3,  desc: 'Klikanie ×3' },
  { id: 'c3', name: 'Plazmowe ostrze',     icon: '🔪', cost: 80000,  type: 'click', mult: 4,  desc: 'Klikanie ×4' },
  { id: 'c4', name: 'Rękawica mocy',       icon: '🧿', cost: 5e6,    type: 'click', mult: 5,  desc: 'Klikanie ×5' },
  { id: 'c5', name: 'Dotyk supernowej',    icon: '💥', cost: 4e8,    type: 'click', mult: 10, desc: 'Klikanie ×10' },
  { id: 'b1', name: 'Lepsze akumulatory',  icon: '🔋', cost: 500,    type: 'building', target: 'robot',   mult: 2, desc: 'Astro-górnicy ×2' },
  { id: 'b2', name: 'Diamentowe wiertła',  icon: '💠', cost: 5000,   type: 'building', target: 'drill',   mult: 2, desc: 'Wiertła ×2' },
  { id: 'b3', name: 'Rój dronów',          icon: '🐝', cost: 55000,  type: 'building', target: 'drone',   mult: 2, desc: 'Drony ×2' },
  { id: 'b4', name: 'Baza Alfa',           icon: '🏗️', cost: 600000, type: 'building', target: 'moon',    mult: 2, desc: 'Kopalnie księżycowe ×2' },
  { id: 'b5', name: 'Napęd nadświetlny',   icon: '⚡', cost: 6.5e6,  type: 'building', target: 'ship',    mult: 2, desc: 'Statki ×2' },
  { id: 'b6', name: 'Panele słoneczne XXL',icon: '🔆', cost: 7e7,    type: 'building', target: 'station', mult: 2, desc: 'Stacje ×2' },
  { id: 'b7', name: 'Automatyzacja AI',    icon: '🧠', cost: 1e9,    type: 'building', target: 'factory', mult: 2, desc: 'Fabryki ×2' },
  { id: 'b8', name: 'Stabilizator portali',icon: '🔮', cost: 1.6e10, type: 'building', target: 'portal',  mult: 2, desc: 'Portale ×2' },
  { id: 'g1', name: 'Kosmiczna kawa',           icon: '☕', cost: 50000, type: 'global', mult: 1.1,  desc: 'Cała produkcja +10%' },
  { id: 'g2', name: 'Związki zawodowe robotów', icon: '🤝', cost: 5e6,   type: 'global', mult: 1.15, desc: 'Cała produkcja +15%' },
  { id: 'g3', name: 'Galaktyczna giełda',       icon: '📈', cost: 5e8,   type: 'global', mult: 1.2,  desc: 'Cała produkcja +20%' },
  { id: 'g4', name: 'Przychylność kosmitów',    icon: '👽', cost: 5e10,  type: 'global', mult: 1.25, desc: 'Cała produkcja +25%' },
];

// ---------- Osiągnięcia (każde daje +1% do produkcji) ----------
const ACHIEVEMENTS = [
  { id: 'a_click1', name: 'Pierwsze uderzenie',  icon: '👆', desc: 'Kliknij 100 razy',    check: s => s.totalClicks >= 100 },
  { id: 'a_click2', name: 'Zawodowy klikacz',    icon: '🖱️', desc: 'Kliknij 2 500 razy',  check: s => s.totalClicks >= 2500 },
  { id: 'a_click3', name: 'Palce ze stali',      icon: '🦾', desc: 'Kliknij 15 000 razy', check: s => s.totalClicks >= 15000 },
  { id: 'a_cr1',    name: 'Kolekcjoner',         icon: '💎', desc: 'Zdobądź łącznie 10 tys. kryształów', check: s => s.totalEarned >= 1e4 },
  { id: 'a_cr2',    name: 'Magnat',              icon: '💰', desc: 'Zdobądź łącznie 10 mln kryształów',  check: s => s.totalEarned >= 1e7 },
  { id: 'a_cr3',    name: 'Krezus galaktyki',    icon: '👑', desc: 'Zdobądź łącznie 10 mld kryształów',  check: s => s.totalEarned >= 1e10 },
  { id: 'a_b1',     name: 'Brygada',             icon: '🤖', desc: 'Posiadaj 25 budynków',  check: s => totalBuildings(s) >= 25 },
  { id: 'a_b2',     name: 'Imperium wydobywcze', icon: '🏭', desc: 'Posiadaj 100 budynków', check: s => totalBuildings(s) >= 100 },
  { id: 'a_b3',     name: 'Władca kosmosu',      icon: '🌌', desc: 'Posiadaj 250 budynków', check: s => totalBuildings(s) >= 250 },
  { id: 'a_p1',     name: 'Nowy początek',       icon: '✨', desc: 'Wykonaj 1 prestiż',     check: s => s.prestigeCount >= 1 },
  { id: 'a_p2',     name: 'Wieczny powrót',      icon: '🔄', desc: 'Wykonaj 5 prestiżów',   check: s => s.prestigeCount >= 5 },
  { id: 'a_comet',  name: 'Łowca komet',         icon: '☄️', desc: 'Złap 10 złotych komet', check: s => s.cometsCaught >= 10 },
  { id: 'a_streak', name: 'Wierny górnik',       icon: '📅', desc: 'Seria logowań: 7 dni',  check: s => s.loginStreak >= 7 },
];
