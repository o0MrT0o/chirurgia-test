'use strict';
/* =====================================================================
   CONFIG.JS — cały balans gry w jednym miejscu.
   Chcesz zmienić koszty, produkcję, nagrody? Edytuj TYLKO ten plik.
   ===================================================================== */

// ---------- Stałe balansu ----------
const BALANCE = {
  costGrowth: 1.15,        // każdy kolejny budynek droższy o 15%
  clickCpsBonus: 0.02,     // klik daje dodatkowo 2% produkcji na sekundę
  offlineRate: 0.2,        // zarobki offline liczone na 20%
  offlineMaxHours: 4,      // maksymalnie 4 h zarobków offline
  stardustDivisor: 2e5,    // pył = sqrt(zarobki_rundy / ta_liczba); niżej = szybszy, hojniejszy pierwszy prestiż
  achievementBonus: 0.01,  // +1% produkcji za każde osiągnięcie
  adBoostMult: 2,          // boost reklamowy ×2
  adBoostSeconds: 120,     // ...przez 2 minuty
  autoClickSeconds: 60,    // auto-klikacz: czas trwania po obejrzeniu reklamy
  autoClickRate: 2.2,      // auto-klikacz: symulowane kliknięcia/sek (dochód = moc kliku × ta liczba)
  frenzyMult: 7,           // szał komety ×7
  frenzySeconds: 30,       // ...przez 30 sekund
  cometMinDelay: 60,       // kometa: min odstęp (sekundy)
  cometMaxDelay: 180,      // kometa: max odstęp (sekundy)
  cometLifetime: 12,       // ile sekund kometa jest widoczna
  dailyStreakCap: 7,       // bonus dzienny rośnie do 7 dni serii
  tierThresholds: [10, 25, 50, 100, 200], // progi posiadania budynku odblokowujące ulepszenia
  tierMult: 2,             // każde ulepszenie progowe: produkcja budynku ×2
  tierCostFactor: 8,       // koszt ulepszenia progowego = baseCost × próg × ta_liczba
  missionCount: 3,         // ile misji dziennie
  missionRewardCps: 900,   // nagroda za misję = produkcja/sek. × ta_liczba
  missionRewardMin: 2500,  // ...ale nie mniej niż tyle
  missionSetBonus: 1,      // pył za wykonanie kompletu misji dnia
  eventMinDelay: 180,      // eventy losowe: min odstęp (sekundy)
  eventMaxDelay: 360,      // eventy losowe: max odstęp (sekundy)
  feverMult: 5,            // gorączka kryształowa: klik ×5
  feverSeconds: 20,        // ...przez 20 sekund
  meteorCount: 12,         // deszcz meteorytów: ile meteorów spada
  artifactBonus: 0.02,     // +2% produkcji za każdy artefakt w kolekcji
  duplicateDust: 1,        // pył za wylosowanie duplikatu artefaktu
  rushMinutes: 30,         // reklama skraca wyprawę o tyle minut
  bossMinDelay: 480,       // boss: min odstęp między pojawieniami (sekundy)
  bossMaxDelay: 900,       // boss: max odstęp (sekundy)
  bossTime: 30,            // ile sekund na pokonanie bossa
  bossHpTaps: 45,          // HP bossa = moc kliku × ta liczba (zawsze wyzwanie)
  bossRewardCps: 600,      // nagroda = produkcja/sek. × ta liczba
  bossRewardMin: 5000,     // ...ale nie mniej niż tyle
  bossDust: 2,             // pył za pokonanie bossa
  bossArtChance: 0.2,      // szansa na artefakt z bossa
  bossFailFraction: 0.1,   // nagroda pocieszenia przy porażce (ułamek pełnej)
  wheelCrystalCps: 400,    // bazowa nagroda kryształowa z koła = produkcja/sek. × ta liczba
  comboWindowMs: 1300,     // okno na utrzymanie kombosa (ms od ostatniego kliknięcia)
  comboBonusPer: 0.03,     // +3% mocy kliku za każdy poziom kombosa
  comboMaxLevel: 50,       // maks. poziom kombosa liczony do bonusu (×2,5 przy 50)
  singularityDivisor: 500, // osobliwość = sqrt(pył_zdobyty_od_ostatniego_odrodzenia / ta_liczba)
  singularityBonus: 0.20,  // +20% całej produkcji/mocy kliku na zawsze za każdą osobliwość
  weekendMult: 2,          // mnożnik wydarzenia weekendowego (piątek-niedziela)
  arenaTimePerWave: 15,    // arena: sekund na pokonanie fali (krócej niż zwykły boss — więcej napięcia)
  arenaHpBase: 18,         // arena: HP fali 1 = moc kliku × ta liczba (łatwiejsza niż zwykły boss)
  arenaHpGrowth: 1.30,     // arena: HP rośnie o tyle razy z każdą kolejną falą
  arenaRewardCps: 80,      // arena: nagroda za falę = produkcja/sek. × ta liczba (mniej niż zwykły boss)
  arenaRewardMin: 200,     // ...ale nie mniej niż tyle
  arenaRecordDustPerWave: 1, // arena: pył za KAŻDĄ falę powyżej dotychczasowego rekordu (tylko przy biciu rekordu)
};

// ---------- Kamienie milowe (łączne wydobycie) — celebracja przekroczenia ----------
const MILESTONES = [1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14];

// ---------- Wydarzenia weekendowe ----------
// Aktywne w piątek/sobotę/niedzielę (czas lokalny gracza, bez serwera).
// Który typ akurat trwa, wybiera activeWeekendEvent() na podstawie numeru
// tygodnia — więc każdy weekend jest inny, ale wciąż w pełni deterministyczny.
const WEEKEND_EVENTS = [
  { id: 'we_crystal',  type: 'crystal',  icon: '💎', name: 'Kryształowy Weekend',  desc: 'cała produkcja i moc kliku ×{0}' },
  { id: 'we_artifact', type: 'artifact', icon: '🏺', name: 'Weekend Artefaktów',   desc: 'szansa na artefakt ×{0}' },
  { id: 'we_stardust', type: 'stardust', icon: '✨', name: 'Weekend Gwiezdnego Pyłu', desc: 'pył z prestiżu ×{0}' },
];

// ---------- Strefy / sektory kosmosu ----------
// Odkrywane po przekroczeniu progu łącznego wydobycia (reach). Każdy sektor
// zmienia wygląd asteroidy (style z asteroid.js) i tło (theme dla space.js)
// oraz daje trwały bonus do produkcji (+15% za każdy odkryty sektor).
// flash = kolor rozbłysku przy wejściu. style musi mieć odpowiednik skin-* w CSS.
// theme.worlds = [duże ciało, małe ciało] — prawdziwe grafiki (CC0, assets/space/)
// zamiast rysowanych proceduralnie kółek; różne w każdym sektorze.
const ZONE_BONUS_PER = 0.15;
const ZONES = [
  { id: 'z0', name: 'Pas Planetoid', icon: '🪨', reach: 0, style: 'classic', flash: '#8ea0d0',
    theme: { bg: ['#1c2560', '#101740', '#080d24', '#04060f'], neb: ['120,70,200', '30,120,180', '40,150,150', '190,60,150', '60,90,220', '200,120,90'],
      worlds: ['mercury.png', 'meteorBrown1.png'] } },
  { id: 'z1', name: 'Mgławica Oriona', icon: '🌫️', reach: 2.5e4, style: 'ice', flash: '#7fe3ff',
    theme: { bg: ['#123050', '#0c2036', '#06121f', '#03080f'], neb: ['40,150,200', '30,120,180', '60,180,200', '80,160,220', '40,120,180', '120,200,230'],
      worlds: ['neptune.png', 'meteorGrey2.png'] } },
  { id: 'z2', name: 'Pola Szmaragdowe', icon: '🟢', reach: 1e6, style: 'emerald', flash: '#5cf0a0',
    theme: { bg: ['#0e3a2a', '#0a2a1e', '#061a12', '#030d09'], neb: ['40,200,120', '30,160,100', '60,200,140', '80,180,120', '40,150,110', '120,220,160'],
      worlds: ['earth.png', 'moonFull.png'] } },
  { id: 'z3', name: 'Strefa Wulkaniczna', icon: '🌋', reach: 5e7, style: 'lava', flash: '#ff8a5c',
    theme: { bg: ['#3a1410', '#2a0e0a', '#1a0806', '#0d0403'], neb: ['220,80,40', '200,60,30', '230,100,50', '200,50,60', '180,70,40', '230,140,90'],
      worlds: ['mars.png', 'meteorBrown3.png'] } },
  { id: 'z4', name: 'Złote Rubieże', icon: '🟡', reach: 2e9, style: 'gold', flash: '#ffd76e',
    theme: { bg: ['#3a300f', '#2a220a', '#1a1506', '#0d0a03'], neb: ['220,180,60', '200,150,40', '230,190,80', '200,160,50', '180,140,60', '230,210,120'],
      worlds: ['jupiter.png', 'meteorBrown4.png'] } },
  { id: 'z5', name: 'Różowa Turbulencja', icon: '🌸', reach: 8e10, style: 'heart', flash: '#ff8fc8',
    theme: { bg: ['#3a1030', '#2a0a24', '#1a0616', '#0d030b'], neb: ['220,60,150', '200,50,130', '230,80,170', '200,60,140', '180,50,120', '230,120,190'],
      worlds: ['violetGasGiant.png', 'moonFull.png'] } },
  { id: 'z6', name: 'Otchłań', icon: '🕳️', reach: 3e12, style: 'void', flash: '#b8a0ff',
    theme: { bg: ['#1a1040', '#120a2e', '#0a061c', '#04030d'], neb: ['120,80,220', '100,60,190', '140,90,230', '110,60,200', '90,60,180', '160,120,240'],
      worlds: ['uranus.png', 'meteorGrey2.png'] } },
  { id: 'z7', name: 'Gwiezdne Serce', icon: '⭐', reach: 1e14, style: 'star', flash: '#eaf2ff',
    theme: { bg: ['#20306a', '#141f48', '#0a1030', '#04060f'], neb: ['120,150,255', '90,120,255', '150,180,255', '110,140,255', '90,110,240', '180,200,255'],
      worlds: ['saturn.png', 'moonFull.png'] } },
];

// ---------- Kalendarz nagród za logowanie (cykl 7-dniowy) ----------
// Dzień w cyklu wyliczamy z serii logowań: ((loginStreak-1) % 7). Nagrody
// rosną, a dzień 7 daje wielką nagrodę — klasyczny hak „wróć jutro".
// kind: crystals (mult × produkcja/sek.) | spin (darmowy los) | boost | stardust.
const DAILY_REWARDS = [
  { day: 1, kind: 'crystals', mult: 600,  icon: '💎' },
  { day: 2, kind: 'crystals', mult: 1200, icon: '💎' },
  { day: 3, kind: 'spin',                 icon: '🎡' },
  { day: 4, kind: 'crystals', mult: 2600, icon: '💠' },
  { day: 5, kind: 'boost',                icon: '⚡' },
  { day: 6, kind: 'crystals', mult: 5200, icon: '💰' },
  { day: 7, kind: 'stardust', amount: 2,  icon: '✨' },
];

// ---------- Koło Fortuny ----------
// Codziennie 1 darmowy los + dodatkowe za reklamę. weight = szansa (im
// większa, tym częstszy segment). kind: crystals | boost | frenzy |
// stardust | again | jackpot. mult = mnożnik nagrody kryształowej.
const WHEEL = [
  { id: 'cr1',    name: 'Kryształy',       icon: '💎', sprite: 'assets/wheel/cr1.png',     color: '#3d9bff', weight: 26, kind: 'crystals', mult: 1,  min: 2000 },
  { id: 'boost',  name: 'Boost ×2',        icon: '⚡', sprite: 'assets/wheel/boost.png',   color: '#8a5fff', weight: 15, kind: 'boost' },
  { id: 'cr2',    name: 'Kryształy ×4',    icon: '💠', sprite: 'assets/wheel/cr2.png',     color: '#6ee7ff', weight: 18, kind: 'crystals', mult: 4,  min: 15000 },
  { id: 'dust',   name: 'Gwiezdny pył',    icon: '✨', sprite: 'assets/wheel/dust.png',    color: '#ffd76e', weight: 12, kind: 'stardust', amount: 1 },
  { id: 'frenzy', name: 'Szał ×7',         icon: '☄️', sprite: 'assets/wheel/frenzy.png',  color: '#ff8fc8', weight: 9,  kind: 'frenzy' },
  { id: 'again',  name: 'Darmowy los!',    icon: '🔁', sprite: 'assets/wheel/again.png',   color: '#3ddc84', weight: 8,  kind: 'again' },
  { id: 'cr3',    name: 'Wielka wygrana',  icon: '💰', sprite: 'assets/wheel/cr3.png',     color: '#ff9f43', weight: 6,  kind: 'crystals', mult: 15, min: 100000 },
  { id: 'jackpot',name: 'JACKPOT',         icon: '🏆', sprite: 'assets/wheel/jackpot.png', color: '#ffe08a', weight: 2,  kind: 'jackpot' },
];

// ---------- Bossowie ----------
const BOSSES = [
  { name: 'Obsydianowy Kolos',   icon: '🌑', sprite: 'assets/bosses/boss0.png' },
  { name: 'Strażnik Pierścieni', icon: '🪐', sprite: 'assets/bosses/boss1.png' },
  { name: 'Piroklast',           icon: '🌋', sprite: 'assets/bosses/boss2.png' },
  { name: 'Lodowy Behemot',      icon: '🧊', sprite: 'assets/bosses/boss3.png' },
  { name: 'Pożeracz Światów',    icon: '🕳️', sprite: 'assets/bosses/boss4.png' },
];

// ---------- Budynki (produkcja pasywna) ----------
// sprite = grafika (CC0 Kenney) w assets/buildings/; icon (emoji) to fallback.
const BUILDINGS = [
  { id: 'robot',   name: 'Astro-górnik',        icon: '🤖', sprite: 'assets/buildings/robot.png',   baseCost: 15,      cps: 0.1 },
  { id: 'drill',   name: 'Wiertło laserowe',    icon: '🔩', sprite: 'assets/buildings/drill.png',   baseCost: 100,     cps: 1 },
  { id: 'drone',   name: 'Dron wydobywczy',     icon: '🛸', sprite: 'assets/buildings/drone.png',   baseCost: 1100,    cps: 8 },
  { id: 'moon',    name: 'Kopalnia księżycowa', icon: '🌙', sprite: 'assets/buildings/moon.png',    baseCost: 12000,   cps: 47 },
  { id: 'ship',    name: 'Statek towarowy',     icon: '🚀', sprite: 'assets/buildings/ship.png',    baseCost: 130000,  cps: 260 },
  { id: 'station', name: 'Stacja orbitalna',    icon: '🛰️', sprite: 'assets/buildings/station.png', baseCost: 1.4e6,  cps: 1400 },
  { id: 'factory', name: 'Fabryka planetarna',  icon: '🏭', sprite: 'assets/buildings/factory.png', baseCost: 2e7,     cps: 7800 },
  { id: 'portal',  name: 'Portal wymiarowy',    icon: '🌀', sprite: 'assets/buildings/portal.png',  baseCost: 3.3e8,   cps: 44000 },
  { id: 'sun',     name: 'Sztuczna gwiazda',    icon: '☀️', sprite: 'assets/buildings/sun.png',    baseCost: 5.1e9,  cps: 260000 },
  { id: 'hole',    name: 'Czarna dziura',       icon: '🕳️', sprite: 'assets/buildings/hole.png',   baseCost: 7.5e10, cps: 1.6e6 },
];

// ---------- Ulepszenia (kupowane raz) ----------
// type: 'click' (mnoży klik) | 'building' (mnoży cps budynku target) | 'global' (mnoży wszystko)
const UPGRADES = [
  { id: 'c1', name: 'Wzmocnione rękawice', icon: '🧤', sprite: 'assets/upgrades/mitt.png',     cost: 100,    type: 'click', mult: 2,  desc: 'Klikanie ×2' },
  { id: 'c2', name: 'Tytanowy kilof',      icon: '⛏️', sprite: 'assets/upgrades/pickaxe.png',  cost: 2500,   type: 'click', mult: 3,  desc: 'Klikanie ×3' },
  { id: 'c3', name: 'Plazmowe ostrze',     icon: '🔪', sprite: 'assets/upgrades/blade.png',    cost: 80000,  type: 'click', mult: 4,  desc: 'Klikanie ×4' },
  { id: 'c4', name: 'Rękawica mocy',       icon: '🧿', sprite: 'assets/upgrades/gauntlet.png', cost: 5e6,    type: 'click', mult: 5,  desc: 'Klikanie ×5' },
  { id: 'c5', name: 'Dotyk supernowej',    icon: '💥', sprite: 'assets/wheel/dust.png',        cost: 4e8,    type: 'click', mult: 10, desc: 'Klikanie ×10' },
  { id: 'b1', name: 'Lepsze akumulatory',  icon: '🔋', cost: 500,    type: 'building', target: 'robot',   mult: 2, desc: 'Astro-górnicy ×2' },
  { id: 'b2', name: 'Diamentowe wiertła',  icon: '💠', cost: 5000,   type: 'building', target: 'drill',   mult: 2, desc: 'Wiertła ×2' },
  { id: 'b3', name: 'Rój dronów',          icon: '🐝', cost: 55000,  type: 'building', target: 'drone',   mult: 2, desc: 'Drony ×2' },
  { id: 'b4', name: 'Baza Alfa',           icon: '🏗️', cost: 600000, type: 'building', target: 'moon',    mult: 2, desc: 'Kopalnie księżycowe ×2' },
  { id: 'b5', name: 'Napęd nadświetlny',   icon: '⚡', cost: 6.5e6,  type: 'building', target: 'ship',    mult: 2, desc: 'Statki ×2' },
  { id: 'b6', name: 'Panele słoneczne XXL',icon: '🔆', cost: 7e7,    type: 'building', target: 'station', mult: 2, desc: 'Stacje ×2' },
  { id: 'b7', name: 'Automatyzacja AI',    icon: '🧠', cost: 1e9,    type: 'building', target: 'factory', mult: 2, desc: 'Fabryki ×2' },
  { id: 'b8', name: 'Stabilizator portali',icon: '🔮', cost: 1.6e10, type: 'building', target: 'portal',  mult: 2, desc: 'Portale ×2' },
  { id: 'g1', name: 'Kosmiczna kawa',           icon: '☕', sprite: 'assets/upgrades/mug.png',    cost: 50000, type: 'global', mult: 1.1,  desc: 'Cała produkcja +10%' },
  { id: 'g2', name: 'Związki zawodowe robotów', icon: '🤝', sprite: 'assets/buildings/robot.png', cost: 5e6,   type: 'global', mult: 1.15, desc: 'Cała produkcja +15%' },
  { id: 'g3', name: 'Galaktyczna giełda',       icon: '📈', sprite: 'assets/upgrades/coin.png',   cost: 5e8,   type: 'global', mult: 1.2,  desc: 'Cała produkcja +20%' },
  { id: 'g4', name: 'Przychylność kosmitów',    icon: '👽', sprite: 'assets/upgrades/alien.png',  cost: 5e10,  type: 'global', mult: 1.25, desc: 'Cała produkcja +25%' },
];

// Ulepszenia budynków (b1-b8) dziedziczą sprite z odpowiedniego budynku —
// ta sama spójność wizualna co ulepszenia progowe poniżej.
(function inheritBuildingUpgradeSprites() {
  for (const u of UPGRADES) {
    if (u.type === 'building' && !u.sprite) {
      const b = BUILDINGS.find(x => x.id === u.target);
      if (b) u.sprite = b.sprite;
    }
  }
})();

// ---------- Ulepszenia progowe (generowane automatycznie) ----------
// Każdy budynek dostaje ulepszenie ×2 za osiągnięcie progu posiadania
// (10, 25, 50, 100, 200 sztuk) — łącznie 50 dodatkowych ulepszeń.
// Ulepszenie pojawia się w sklepie dopiero po osiągnięciu progu (pole req).
(function generateTierUpgrades() {
  const roman = ['II', 'III', 'IV', 'V', 'VI'];
  for (const b of BUILDINGS) {
    BALANCE.tierThresholds.forEach((th, i) => {
      const enBase = (typeof EN !== 'undefined' && EN.names[b.id]) || b.name;
      UPGRADES.push({
        id: `t_${b.id}_${th}`,
        name: `${b.name} ${roman[i]}`,
        enName: `${enBase} ${roman[i]}`,
        icon: b.icon,
        sprite: b.sprite,
        cost: Math.round(b.baseCost * th * BALANCE.tierCostFactor),
        type: 'building',
        target: b.id,
        mult: BALANCE.tierMult,
        req: { building: b.id, count: th },
        desc: `${b.name}: produkcja ×${BALANCE.tierMult} (nagroda za ${th} szt.)`,
        enDesc: `${enBase}: production ×${BALANCE.tierMult} (reward for ${th})`,
      });
    });
  }
})();

// ---------- Ekspedycje: planety ----------
// hours = czas wyprawy, unlockEarned = wymagane łączne wydobycie,
// łup = max(lootMin, produkcja/sek. × lootCps), artChance = szansa na artefakt.
const PLANETS = [
  { id: 'ceres',  name: 'Ceres',  icon: '🌑', sprite: 'assets/artifacts/art_c1.png', hours: 0.25, unlockEarned: 0,    lootCps: 900,    lootMin: 3000, artChance: 0.20 },
  { id: 'mars',   name: 'Mars',   icon: '🔴', sprite: 'assets/artifacts/art_m1.png', hours: 1,    unlockEarned: 1e6,  lootCps: 4000,   lootMin: 5e4,  artChance: 0.30 },
  { id: 'tytan',  name: 'Tytan',  icon: '🪐', sprite: 'assets/artifacts/art_t1.png', hours: 3,    unlockEarned: 1e8,  lootCps: 14000,  lootMin: 2e6,  artChance: 0.40 },
  { id: 'europa', name: 'Europa', icon: '🧊', sprite: 'assets/artifacts/art_e1.png', hours: 8,    unlockEarned: 1e10, lootCps: 40000,  lootMin: 1e8,  artChance: 0.50 },
  { id: 'io',     name: 'Io',     icon: '🌋', sprite: 'assets/artifacts/art_i1.png', hours: 24,   unlockEarned: 1e12, lootCps: 130000, lootMin: 5e9,  artChance: 0.60 },
];

// ---------- Artefakty (kolekcja; każdy daje trwały bonus do produkcji) ----------
const ARTIFACTS = [
  { id: 'art_c1', planet: 'ceres',  name: 'Odłamek pramaterii',  icon: '🪨', sprite: 'assets/artifacts/art_c1.png' },
  { id: 'art_c2', planet: 'ceres',  name: 'Pył gwiezdnej burzy', icon: '🌫️', sprite: 'assets/artifacts/art_c2.png' },
  { id: 'art_c3', planet: 'ceres',  name: 'Krzemowa róża',       icon: '🌹', sprite: 'assets/artifacts/art_c3.png' },
  { id: 'art_m1', planet: 'mars',   name: 'Rdzawy kryształ',     icon: '🔶', sprite: 'assets/artifacts/art_m1.png' },
  { id: 'art_m2', planet: 'mars',   name: 'Piaskowy zegar',      icon: '⏳', sprite: 'assets/artifacts/art_m2.png' },
  { id: 'art_m3', planet: 'mars',   name: 'Spiżowy meteoryt',    icon: '🟤', sprite: 'assets/artifacts/art_m3.png' },
  { id: 'art_t1', planet: 'tytan',  name: 'Bursztyn metanowy',   icon: '🟠', sprite: 'assets/artifacts/art_t1.png' },
  { id: 'art_t2', planet: 'tytan',  name: 'Pierścień Tytana',    icon: '💍', sprite: 'assets/artifacts/art_t2.png' },
  { id: 'art_t3', planet: 'tytan',  name: 'Lodowy monolit',      icon: '🗿', sprite: 'assets/artifacts/art_t3.png' },
  { id: 'art_e1', planet: 'europa', name: 'Łza oceanu',          icon: '💧', sprite: 'assets/artifacts/art_e1.png' },
  { id: 'art_e2', planet: 'europa', name: 'Zamarznięta zorza',   icon: '🌈', sprite: 'assets/artifacts/art_e2.png' },
  { id: 'art_e3', planet: 'europa', name: 'Perła głębin',        icon: '🦪', sprite: 'assets/artifacts/art_e3.png' },
  { id: 'art_i1', planet: 'io',     name: 'Serce wulkanu',       icon: '❤️‍🔥', sprite: 'assets/artifacts/art_i1.png' },
  { id: 'art_i2', planet: 'io',     name: 'Siarkowy diament',    icon: '💛', sprite: 'assets/artifacts/art_i2.png' },
  { id: 'art_i3', planet: 'io',     name: 'Oko Io',              icon: '👁️', sprite: 'assets/artifacts/art_i3.png' },
];

// ---------- Skórki asteroidy (kosmetyka) ----------
// Odblokowanie: cost = kup za gwiezdny pył, cond = spełnij warunek (auto).
// css = klasa nadawana asteroidzie i podglądowi (style w style.css).
const SKINS = [
  { id: 'classic', name: 'Klasyczna',         css: 'skin-classic' },
  { id: 'gold',    name: 'Złota',             css: 'skin-gold',    cost: 5 },
  { id: 'ice',     name: 'Lodowa',            css: 'skin-ice',     cond: s => s.loginStreak >= 3,            condDesc: 'seria logowań: 3 dni' },
  { id: 'lava',    name: 'Lawowa',            css: 'skin-lava',    cond: s => (s.bossesKilled || 0) >= 3,    condDesc: 'pokonaj 3 bossów' },
  { id: 'cheese',  name: 'Serowa',            css: 'skin-cheese',  cond: s => s.totalClicks >= 15000,        condDesc: '15 tys. kliknięć' },
  { id: 'emerald', name: 'Szmaragdowa',       css: 'skin-emerald', cost: 10 },
  { id: 'heart',   name: 'Kryształowe serce', css: 'skin-heart',   cond: s => s.loginStreak >= 7,            condDesc: 'seria logowań: 7 dni' },
  { id: 'void',    name: 'Otchłań',           css: 'skin-void',    cond: s => (s.bossesKilled || 0) >= 10,   condDesc: 'pokonaj 10 bossów' },
  { id: 'star',    name: 'Gwiezdna',          css: 'skin-star',    cond: s => s.prestigeCount >= 5,          condDesc: '5 prestiżów' },
  { id: 'rainbow', name: 'Tęczowa',           css: 'skin-rainbow', cost: 25 },
];

// ---------- Laboratorium badań ----------
// Badania trwają realny czas i dają trwałe bonusy. Jedno naraz.
// req = id badania, które trzeba ukończyć wcześniej (łańcuch).
// Efekty: prod (+% produkcji), click (+% kliku), costDisc (tańsze budynki),
// cometFreq (częstsze komety) — działają na zawsze po ukończeniu.
const RESEARCH = [
  { id: 'r1',  name: 'Analiza spektralna',    icon: '🔬', sprite: 'assets/upgrades/microscope.png', hours: 0.5, cost: 5000, prod: 0.05,
    desc: 'produkcja +5%' },
  { id: 'r2',  name: 'Geologia asteroid',     icon: '🪨', sprite: 'assets/space/meteorGrey1.png', hours: 1,  cost: 25000, click: 0.5,  req: 'r1',
    desc: 'moc kliku +50%' },
  { id: 'r3',  name: 'Optymalizacja wierteł', icon: '⚙️', sprite: 'assets/upgrades/drilltool.png', hours: 2,  cost: 150000, prod: 0.10, req: 'r2',
    desc: 'produkcja +10%' },
  { id: 'r4',  name: 'Nanoroboty',            icon: '🦠', sprite: 'assets/upgrades/roboclaw.png', hours: 3,  cost: 1e6,  costDisc: 0.05, req: 'r3',
    desc: 'budynki tańsze o 5%' },
  { id: 'r5',  name: 'Krystalografia',        icon: '💎', sprite: 'assets/artifacts/art_e1.png', hours: 4,  cost: 8e6,  prod: 0.15, req: 'r4',
    desc: 'produkcja +15%' },
  { id: 'r6',  name: 'Teoria komet',          icon: '☄️', sprite: 'assets/space/meteorBrown2.png', hours: 5,  cost: 5e7,  cometFreq: 0.15, req: 'r5',
    desc: 'komety częstsze o 15%' },
  { id: 'r7',  name: 'Fizyka kwantowa',       icon: '⚛️', hours: 6,  cost: 4e8,  click: 1, req: 'r6',
    desc: 'moc kliku +100%' },
  { id: 'r8',  name: 'Astro-ekonomia',        icon: '📊', sprite: 'assets/upgrades/coin.png', hours: 8,  cost: 1.5e9, prod: 0.20, req: 'r7',
    desc: 'produkcja +20%' },
  { id: 'r9',  name: 'Ciemna materia',        icon: '🌌', hours: 10, cost: 1e10, prod: 0.25, req: 'r8',
    desc: 'produkcja +25%' },
  { id: 'r10', name: 'Teoria wszystkiego',    icon: '🧠', hours: 12, cost: 5e10, prod: 0.30, click: 1, req: 'r9',
    desc: 'produkcja +30% i moc kliku +100%' },
];

// ---------- Misje dzienne ----------
// Codziennie losowane są 3 z poniższych typów. counter = licznik dzienny,
// desc(n) = opis z celem, dynamicTarget = cel liczony z produkcji gracza.
const MISSION_TYPES = [
  { id: 'clicks',    icon: '👆', sprite: 'assets/missions/tap.png',    target: 200, counter: 'clicks',    desc: n => t('mis_clicks', fmt(n)) },
  { id: 'buildings', icon: '🏗️', sprite: 'assets/missions/wrench.png', target: 30,  counter: 'buildings', desc: n => t('mis_buildings', fmt(n)) },
  { id: 'earn',      icon: '💎', sprite: 'assets/missions/crystal.png', target: 0,   counter: 'earned',    desc: n => t('mis_earn', fmt(n)),
    dynamicTarget: () => Math.max(10000, totalCps() * 1800) },
  { id: 'comets',    icon: '☄️', sprite: 'assets/missions/comet.png',  target: 2,   counter: 'comets',    desc: n => t('mis_comets', n) },
  { id: 'upgrades',  icon: '🚀', sprite: 'assets/missions/rocket.png', target: 2,   counter: 'upgrades',  desc: n => t('mis_upgrades', n) },
  { id: 'ads',       icon: '🎬', sprite: 'assets/missions/adplay.png', target: 1,   counter: 'ads',       desc: n => t('mis_ads', n) },
];

// ---------- Drzewko talentów (kupowane za gwiezdny pył z prestiżu) ----------
// Koszt poziomu = costBase × (aktualny_poziom + 1).
// req = wymagany poziom innego talentu, zanim ten się odblokuje.
// eff(lvl) zwraca opis łącznego efektu na danym poziomie (do UI).
const TALENT_BRANCHES = [
  { id: 'click', name: '⛏️ Moc klikania' },
  { id: 'prod',  name: '🏭 Produkcja' },
  { id: 'time',  name: '🌙 Czas i bonusy' },
];

const TALENTS = [
  // — Moc klikania —
  { id: 'tc1', branch: 'click', name: 'Silne dłonie',    icon: '💪', sprite: 'assets/upgrades/mitt.png', max: 10, costBase: 1,
    desc: '+25% mocy kliku za poziom',                    eff: l => `+${l * 25}% kliku`,          effEn: l => `+${l * 25}% click` },
  { id: 'tc2', branch: 'click', name: 'Echo kliknięcia', icon: '🌊', max: 5,  costBase: 2, req: { talent: 'tc1', level: 5 },
    desc: 'klik daje dodatkowo +1% produkcji/sek. za poziom', eff: l => `+${2 + l}% produkcji/klik`, effEn: l => `+${2 + l}% production/click` },
  { id: 'tc3', branch: 'click', name: 'Złoty dotyk',     icon: '✨', sprite: 'assets/upgrades/coin.png', max: 5,  costBase: 5, req: { talent: 'tc2', level: 3 },
    desc: '+2% szansy na krytyczny klik ×10 za poziom',   eff: l => `${l * 2}% szansy na kryt`,   effEn: l => `${l * 2}% crit chance` },
  // — Produkcja —
  { id: 'tp1', branch: 'prod', name: 'Wydajne maszyny',    icon: '⚙️', sprite: 'assets/buildings/factory.png', max: 10, costBase: 1,
    desc: '+10% całej produkcji za poziom',               eff: l => `+${l * 10}% produkcji`,      effEn: l => `+${l * 10}% production` },
  { id: 'tp2', branch: 'prod', name: 'Tania siła robocza', icon: '🏷️', max: 8, costBase: 2, req: { talent: 'tp1', level: 5 },
    desc: 'budynki tańsze o 2% za poziom',                eff: l => `-${l * 2}% kosztów`,         effEn: l => `-${l * 2}% costs` },
  { id: 'tp3', branch: 'prod', name: 'Synergia',           icon: '🔗', max: 5, costBase: 5, req: { talent: 'tp2', level: 3 },
    desc: '+2% produkcji za każdy posiadany typ budynku, za poziom', eff: l => `+${l * 2}% za typ budynku`, effEn: l => `+${l * 2}% per building type` },
  // — Czas i bonusy —
  { id: 'tt1', branch: 'time', name: 'Nocna zmiana',  icon: '🌃', sprite: 'assets/space/moonFull.png', max: 8, costBase: 1,
    desc: 'zarobki offline lepsze o 5 p.p. za poziom',    eff: l => `offline: ${20 + l * 5}% stawki`, effEn: l => `offline: ${20 + l * 5}% rate` },
  { id: 'tt2', branch: 'time', name: 'Magnes komet',  icon: '🧲', sprite: 'assets/space/meteorBrown1.png', max: 5, costBase: 2, req: { talent: 'tt1', level: 4 },
    desc: 'komety pojawiają się częściej o 8% za poziom', eff: l => `komety −${l * 8}% odstępu`,  effEn: l => `comets −${l * 8}% interval` },
  { id: 'tt3', branch: 'time', name: 'Wieczny boost', icon: '🔥', sprite: 'assets/wheel/boost.png', max: 6, costBase: 3, req: { talent: 'tt2', level: 2 },
    desc: 'boost reklamowy dłuższy o 15 s za poziom',     eff: l => `boost: ${120 + l * 15} s`,   effEn: l => `boost: ${120 + l * 15} s` },
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
  { id: 'a_b4',     name: 'Galaktyczny potentat',icon: '🪐', desc: 'Posiadaj 500 budynków', check: s => totalBuildings(s) >= 500 },
  { id: 'a_upg1',   name: 'Modernizator',        icon: '🔧', desc: 'Kup łącznie 15 ulepszeń',  check: s => (s.totalUpgradesBought || 0) >= 15 },
  { id: 'a_upg2',   name: 'Inżynier doskonały',  icon: '⚙️', desc: 'Kup łącznie 40 ulepszeń',  check: s => (s.totalUpgradesBought || 0) >= 40 },
  { id: 'a_time',   name: 'Weteran kosmosu',     icon: '⏳', desc: 'Graj łącznie 24 godziny',  check: s => (s.playSeconds || 0) >= 86400 },
  { id: 'a_tal1',   name: 'Uczeń gwiazd',        icon: '🌟', desc: 'Kup 10 poziomów talentów', check: s => Object.values(s.talents || {}).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'a_dust',   name: 'Gwiezdny alchemik',   icon: '🌠', desc: 'Zdobądź łącznie 100 pyłu', check: s => (s.totalStardustEarned || 0) >= 100 },
  { id: 'a_mis1',   name: 'Sumienny wykonawca',  icon: '🎯', desc: 'Wykonaj 10 misji dziennych',  check: s => (s.missionsCompleted || 0) >= 10 },
  { id: 'a_mis2',   name: 'Mistrz zleceń',       icon: '🏅', desc: 'Wykonaj 50 misji dziennych',  check: s => (s.missionsCompleted || 0) >= 50 },
  { id: 'a_exp1',   name: 'Odkrywca',            icon: '🧭', desc: 'Ukończ 5 ekspedycji',         check: s => (s.expeditionsDone || 0) >= 5 },
  { id: 'a_exp2',   name: 'Zdobywca układu',     icon: '🚩', desc: 'Ukończ 25 ekspedycji',        check: s => (s.expeditionsDone || 0) >= 25 },
  { id: 'a_art1',   name: 'Archeolog kosmosu',   icon: '🏺', desc: 'Zdobądź 5 artefaktów',        check: s => Object.keys(s.artifacts || {}).length >= 5 },
  { id: 'a_art2',   name: 'Kolekcjoner legend',  icon: '💠', desc: 'Zbierz wszystkie 15 artefaktów', check: s => Object.keys(s.artifacts || {}).length >= 15 },
  { id: 'a_boss1',  name: 'Pogromca kolosów',    icon: '⚔️', desc: 'Pokonaj 3 bossów',            check: s => (s.bossesKilled || 0) >= 3 },
  { id: 'a_boss2',  name: 'Postrach galaktyki',  icon: '👑', desc: 'Pokonaj 20 bossów',           check: s => (s.bossesKilled || 0) >= 20 },
  { id: 'a_lab1',   name: 'Młody naukowiec',     icon: '🧪', desc: 'Ukończ 3 badania',            check: s => Object.keys(s.researchDone || {}).length >= 3 },
  { id: 'a_lab2',   name: 'Geniusz galaktyki',   icon: '🎓', desc: 'Ukończ wszystkie 10 badań',   check: s => Object.keys(s.researchDone || {}).length >= 10 },
  { id: 'a_rebirth', name: 'Osobliwy początek',  icon: '🌀', desc: 'Wykonaj pierwsze odrodzenie', check: s => (s.rebirthCount || 0) >= 1 },
  { id: 'a_arena1', name: 'Wojownik areny',  icon: '🛡️', desc: 'Dotrzyj do fali 5 w Arenie bossów',  check: s => (s.arenaBest || 0) >= 5 },
  { id: 'a_arena2', name: 'Mistrz areny',    icon: '🏵️', desc: 'Dotrzyj do fali 15 w Arenie bossów', check: s => (s.arenaBest || 0) >= 15 },
];

// ---------- Google Play Games Services ----------
// Zestaw ID trzeba utworzyć samemu w Google Play Console (Play Games Services
// -> Osiągnięcia/Rankingi) i wkleić tutaj — poniższe to tylko PLACEHOLDERY.
// Zsynchronizowany jest celowo tylko wybrany zestaw najbardziej "końcowych"
// osiągnięć (nie wszystkie 32) — mniej ID do ręcznego założenia w konsoli,
// a to i tak te, którymi naprawdę warto się pochwalić.
const GPG_ACHIEVEMENTS = {
  a_cr3:     'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Krezus galaktyki
  a_b4:      'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Galaktyczny potentat
  a_p2:      'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Wieczny powrót
  a_rebirth: 'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Osobliwy początek
  a_boss2:   'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Postrach galaktyki
  a_art2:    'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Kolekcjoner legend
  a_lab2:    'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Geniusz galaktyki
  a_arena2:  'REPLACE_WITH_YOUR_ACHIEVEMENT_ID', // Mistrz areny
};
const GPG_LEADERBOARD_ID = 'REPLACE_WITH_YOUR_LEADERBOARD_ID'; // ranking: łącznie wydobyte kryształy

// Grafiki osiągnięć: medale CC0 (Kenney). Numer medalu rośnie z prestiżem
// osiągnięcia (brąz → srebro → złoto, z gwiazdką/krzyżem/rozetą).
(function assignMedals() {
  const M = {
    a_click1: 1, a_click2: 6, a_click3: 7, a_cr1: 1, a_cr2: 2, a_cr3: 3,
    a_b1: 1, a_b2: 4, a_b3: 5, a_b4: 9, a_p1: 6, a_p2: 7, a_comet: 8, a_streak: 3,
    a_upg1: 2, a_upg2: 5, a_time: 9, a_tal1: 6, a_dust: 7, a_mis1: 4, a_mis2: 5,
    a_exp1: 8, a_exp2: 9, a_art1: 2, a_art2: 3, a_boss1: 4, a_boss2: 7, a_lab1: 8, a_lab2: 9,
    a_rebirth: 9, a_arena1: 4, a_arena2: 7,
  };
  for (const a of ACHIEVEMENTS) if (M[a.id]) a.sprite = `assets/achievements/medal${M[a.id]}.png`;
})();
