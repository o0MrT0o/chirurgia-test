'use strict';
/* =====================================================================
   LOGIC.JS — silnik gry: produkcja, zakupy, prestiż, bonusy, offline.
   Czysta logika — zero dotykania HTML (to robi ui.js).
   ===================================================================== */

// ---------- Produkcja ----------
function globalMult() {
  let m = 1 + S.stardust * BALANCE.stardustBonus;
  m *= 1 + Object.keys(S.achievements).length * BALANCE.achievementBonus;
  for (const u of UPGRADES) if (S.upgrades[u.id] && u.type === 'global') m *= u.mult;
  if (now() < S.frenzyUntil) m *= BALANCE.frenzyMult;
  if (now() < S.boostUntil) m *= BALANCE.adBoostMult;
  return m;
}

function buildingCps(b) {
  let m = 1;
  for (const u of UPGRADES) if (S.upgrades[u.id] && u.type === 'building' && u.target === b.id) m *= u.mult;
  return b.cps * (S.buildings[b.id] || 0) * m;
}

function totalCps() {
  return BUILDINGS.reduce((sum, b) => sum + buildingCps(b), 0) * globalMult();
}

function clickPower() {
  let p = 1;
  for (const u of UPGRADES) if (S.upgrades[u.id] && u.type === 'click') p *= u.mult;
  p += totalCps() * BALANCE.clickCpsBonus;
  return p * globalMult();
}

function buildingCost(b) {
  return Math.ceil(b.baseCost * Math.pow(BALANCE.costGrowth, S.buildings[b.id] || 0));
}

function earn(amount) {
  S.crystals += amount;
  S.totalEarned += amount;
  S.allTimeEarned += amount;
}

// ---------- Zakupy ----------
// Koszt kupna n sztuk naraz (suma ciągu geometrycznego).
function bulkCost(b, n) {
  const g = BALANCE.costGrowth;
  const owned = S.buildings[b.id] || 0;
  return Math.ceil(b.baseCost * Math.pow(g, owned) * (Math.pow(g, n) - 1) / (g - 1));
}

// Ile sztuk maksymalnie stać gracza.
function maxAffordable(b) {
  const g = BALANCE.costGrowth;
  const owned = S.buildings[b.id] || 0;
  const base = b.baseCost * Math.pow(g, owned);
  let n = Math.floor(Math.log(S.crystals * (g - 1) / base + 1) / Math.log(g));
  while (n > 0 && bulkCost(b, n) > S.crystals) n--; // korekta zaokrągleń
  return Math.max(n, 0);
}

function buyBuilding(id, n = 1) {
  const b = BUILDINGS.find(x => x.id === id);
  const cost = bulkCost(b, n);
  if (n < 1 || S.crystals < cost) return false;
  S.crystals -= cost;
  S.buildings[id] = (S.buildings[id] || 0) + n;
  save();
  return true;
}

// Czy ulepszenie ma się już pokazać w sklepie?
function upgradeVisible(u) {
  if (u.req) return (S.buildings[u.req.building] || 0) >= u.req.count;
  return S.totalEarned >= u.cost * 0.3;
}

function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  if (S.upgrades[id] || S.crystals < u.cost) return false;
  S.crystals -= u.cost;
  S.upgrades[id] = true;
  S.totalUpgradesBought = (S.totalUpgradesBought || 0) + 1;
  save();
  return true;
}

// ---------- Prestiż ----------
function stardustGain() {
  return Math.floor(Math.sqrt(S.totalEarned / BALANCE.stardustDivisor));
}

function doPrestige() {
  const gain = stardustGain();
  if (gain < 1) return 0;
  const keep = {
    stardust: S.stardust + gain,
    prestigeCount: S.prestigeCount + 1,
    allTimeEarned: S.allTimeEarned,
    totalClicks: S.totalClicks,
    achievements: S.achievements,
    cometsCaught: S.cometsCaught,
    loginStreak: S.loginStreak,
    lastLoginDay: S.lastLoginDay,
    dailyClaimed: S.dailyClaimed,
    totalUpgradesBought: S.totalUpgradesBought,
    playSeconds: S.playSeconds,
    bestCps: S.bestCps,
  };
  S = Object.assign(DEFAULT_STATE(), keep);
  save();
  return gain;
}

// ---------- Zarobki offline ----------
// Zwraca kwotę do odebrania (0 = nie pokazuj okna powitalnego).
function offlineEarnings() {
  const elapsed = Math.min((now() - S.lastSeen) / 1000, BALANCE.offlineMaxHours * 3600);
  if (elapsed > 60 && totalCps() > 0) return totalCps() * elapsed * BALANCE.offlineRate;
  return 0;
}

// ---------- Bonus dzienny ----------
function checkDaily() {
  const today = todayStr();
  if (S.lastLoginDay !== today) {
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.loginStreak = (S.lastLoginDay === yesterday) ? S.loginStreak + 1 : 1;
    S.lastLoginDay = today;
    S.dailyClaimed = false;
  }
}

function dailyReward() {
  return Math.max(500, totalCps() * 600) * Math.min(S.loginStreak, BALANCE.dailyStreakCap);
}

function claimDaily() {
  if (S.dailyClaimed) return 0;
  S.dailyClaimed = true;
  const r = dailyReward();
  earn(r);
  save();
  return r;
}

// ---------- Osiągnięcia ----------
// Zwraca listę świeżo zdobytych osiągnięć (do pokazania toastów).
function checkAchievements() {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (!S.achievements[a.id] && a.check(S)) {
      S.achievements[a.id] = true;
      fresh.push(a);
    }
  }
  return fresh;
}
