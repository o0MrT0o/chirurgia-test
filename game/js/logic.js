'use strict';
/* =====================================================================
   LOGIC.JS — silnik gry: produkcja, zakupy, prestiż, bonusy, offline.
   Czysta logika — zero dotykania HTML (to robi ui.js).
   ===================================================================== */

// ---------- Talenty ----------
function talentLevel(id) { return S.talents[id] || 0; }

function talentCost(t) { return t.costBase * (talentLevel(t.id) + 1); }

// Talent odblokowany, gdy spełnione jest jego wymaganie (req).
function talentUnlocked(t) {
  return !t.req || talentLevel(t.req.talent) >= t.req.level;
}

function buyTalent(id) {
  const t = TALENTS.find(x => x.id === id);
  if (talentLevel(id) >= t.max || !talentUnlocked(t) || S.stardust < talentCost(t)) return false;
  S.stardust -= talentCost(t);
  S.talents[id] = talentLevel(id) + 1;
  save();
  return true;
}

function talentLevelsTotal() {
  return Object.values(S.talents).reduce((a, b) => a + b, 0);
}

// ---------- Wydarzenia weekendowe ----------
// Piątek/sobota/niedziela (czas lokalny) — jeden z 3 typów, rotujący co tydzień.
// W pełni deterministyczne (numer tygodnia w roku), więc nie trzeba serwera.
const WEEKEND_DAYS = { 5: 2, 6: 1, 0: 0 }; // dzień tygodnia -> ile dni do końca (niedziela 23:59)
function activeWeekendEvent() {
  const day = new Date().getDay();
  if (!(day in WEEKEND_DAYS)) return null;
  const weekNum = Math.floor(now() / (7 * 24 * 3600 * 1000));
  return WEEKEND_EVENTS[weekNum % WEEKEND_EVENTS.length];
}
function weekendEventOfType(type) {
  const ev = activeWeekendEvent();
  return ev && ev.type === type ? ev : null;
}

// ---------- Produkcja ----------
function globalMult() {
  let m = 1 + Object.keys(S.achievements).length * BALANCE.achievementBonus;
  m *= 1 + talentLevel('tp1') * 0.10;                    // Wydajne maszyny
  const ownedTypes = BUILDINGS.filter(b => (S.buildings[b.id] || 0) > 0).length;
  m *= 1 + ownedTypes * talentLevel('tp3') * 0.02;       // Synergia
  m *= 1 + artifactCount() * BALANCE.artifactBonus;      // kolekcja artefaktów
  m *= researchMult('prod');                             // badania: produkcja
  m *= zoneBonus();                                       // odkryte sektory
  m *= 1 + (S.singularities || 0) * BALANCE.singularityBonus; // osobliwości (odrodzenie) — na zawsze
  for (const u of UPGRADES) if (S.upgrades[u.id] && u.type === 'global') m *= u.mult;
  if (now() < S.frenzyUntil) m *= BALANCE.frenzyMult;
  if (now() < S.boostUntil) m *= BALANCE.adBoostMult;
  if (weekendEventOfType('crystal')) m *= BALANCE.weekendMult;   // Kryształowy Weekend
  return m;
}

// ---------- Strefy / sektory ----------
function currentZone() { return ZONES[Math.min(S.zone || 0, ZONES.length - 1)] || ZONES[0]; }
function nextZone() { return ZONES[(S.zone || 0) + 1] || null; }
function zoneBonus() { return 1 + (S.zone || 0) * ZONE_BONUS_PER; } // +15% za każdy sektor
// Wejdź do kolejnego sektora, jeśli osiągnięto próg. Zwraca nowy sektor lub null.
function advanceZone() {
  const nz = ZONES[(S.zone || 0) + 1];
  if (nz && S.allTimeEarned >= nz.reach) { S.zone = (S.zone || 0) + 1; return ZONES[S.zone]; }
  return null;
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
  p *= 1 + talentLevel('tc1') * 0.25;                             // Silne dłonie
  p *= researchMult('click');                                     // badania: moc kliku
  p += totalCps() * (BALANCE.clickCpsBonus + talentLevel('tc2') * 0.01); // Echo kliknięcia
  if (now() < S.feverUntil) p *= BALANCE.feverMult;               // gorączka kryształowa
  return p * globalMult();
}

// Szansa na krytyczny klik ×10 (talent Złoty dotyk).
function critChance() { return talentLevel('tc3') * 0.02; }

// Rabat na budynki (talent Tania siła robocza + badanie Nanoroboty).
function costDiscount() {
  let d = 1 - talentLevel('tp2') * 0.02;
  for (const r of RESEARCH) if (isResearchDone(r.id) && r.costDisc) d *= 1 - r.costDisc;
  return d;
}

function buildingCost(b) {
  return Math.ceil(b.baseCost * costDiscount() * Math.pow(BALANCE.costGrowth, S.buildings[b.id] || 0));
}

function earn(amount) {
  S.crystals += amount;
  S.totalEarned += amount;
  S.allTimeEarned += amount;
  missionBump('earned', amount);
}

// ---------- Zakupy ----------
// Koszt kupna n sztuk naraz (suma ciągu geometrycznego).
function bulkCost(b, n) {
  const g = BALANCE.costGrowth;
  const owned = S.buildings[b.id] || 0;
  return Math.ceil(b.baseCost * costDiscount() * Math.pow(g, owned) * (Math.pow(g, n) - 1) / (g - 1));
}

// Ile sztuk maksymalnie stać gracza.
function maxAffordable(b) {
  const g = BALANCE.costGrowth;
  const owned = S.buildings[b.id] || 0;
  const base = b.baseCost * costDiscount() * Math.pow(g, owned);
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
  missionBump('buildings', n);
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
  missionBump('upgrades');
  save();
  return true;
}

// ---------- Prestiż ----------
function stardustGain() {
  const base = Math.sqrt(S.totalEarned / BALANCE.stardustDivisor);
  return Math.floor(base * (weekendEventOfType('stardust') ? BALANCE.weekendMult : 1));
}

function doPrestige() {
  const gain = stardustGain();
  if (gain < 1) return 0;
  const keep = {
    stardust: S.stardust + gain,
    totalStardustEarned: (S.totalStardustEarned || 0) + gain,
    talents: S.talents,
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
    lastMilestone: S.lastMilestone,
    bestCombo: S.bestCombo,
    arenaBest: S.arenaBest,
    dailyMissions: S.dailyMissions,
    missionCounters: S.missionCounters,
    missionsCompleted: S.missionsCompleted,
    expedition: S.expedition,
    expeditionsDone: S.expeditionsDone,
    artifacts: S.artifacts,
    bossesKilled: S.bossesKilled,
    zone: S.zone,
    lang: S.lang,
    soundOn: S.soundOn,
    musicOn: S.musicOn,
    vibrateOn: S.vibrateOn,
    soundVol: S.soundVol,
    musicVol: S.musicVol,
    notifOn: S.notifOn,
    notifAsked: S.notifAsked,
    tutorialStep: S.tutorialStep,
    research: S.research,
    researchDone: S.researchDone,
    skin: S.skin,
    skinsBought: S.skinsBought,
    lastWheelSpinDay: S.lastWheelSpinDay,
    freeSpins: S.freeSpins,
    totalSpins: S.totalSpins,
    singularities: S.singularities,
    totalSingularitiesEarned: S.totalSingularitiesEarned,
    rebirthCount: S.rebirthCount,
    stardustAtLastRebirth: S.stardustAtLastRebirth,
  };
  S = Object.assign(DEFAULT_STATE(), keep);
  save();
  return gain;
}

// ---------- Odrodzenie (druga warstwa prestiżu, nad pyłem/talentami) ----------
// Pył zdobyty od ostatniego odrodzenia (totalStardustEarned nigdy się nie resetuje,
// więc liczymy różnicę względem migawki sprzed ostatniego odrodzenia).
function stardustSinceRebirth() {
  return (S.totalStardustEarned || 0) - (S.stardustAtLastRebirth || 0);
}

function singularityGain() {
  return Math.floor(Math.sqrt(stardustSinceRebirth() / BALANCE.singularityDivisor));
}

function doRebirth() {
  const gain = singularityGain();
  if (gain < 1) return 0;
  const keep = {
    singularities: (S.singularities || 0) + gain,
    totalSingularitiesEarned: (S.totalSingularitiesEarned || 0) + gain,
    rebirthCount: (S.rebirthCount || 0) + 1,
    stardustAtLastRebirth: S.totalStardustEarned || 0,
    totalStardustEarned: S.totalStardustEarned || 0, // licznik od początku gry — nie resetujemy
    achievements: S.achievements,
    totalClicks: S.totalClicks,
    cometsCaught: S.cometsCaught,
    playSeconds: S.playSeconds,
    bestCps: S.bestCps,
    bestCombo: S.bestCombo,
    arenaBest: S.arenaBest,
    loginStreak: S.loginStreak,
    lastLoginDay: S.lastLoginDay,
    dailyClaimed: S.dailyClaimed,
    dailyMissions: S.dailyMissions,
    missionCounters: S.missionCounters,
    missionsCompleted: S.missionsCompleted,
    lang: S.lang,
    soundOn: S.soundOn,
    musicOn: S.musicOn,
    vibrateOn: S.vibrateOn,
    soundVol: S.soundVol,
    musicVol: S.musicVol,
    notifOn: S.notifOn,
    notifAsked: S.notifAsked,
    tutorialStep: S.tutorialStep,
    skin: S.skin,
    skinsBought: S.skinsBought,
    lastWheelSpinDay: S.lastWheelSpinDay,
    freeSpins: S.freeSpins,
    totalSpins: S.totalSpins,
  };
  S = Object.assign(DEFAULT_STATE(), keep);
  save();
  return gain;
}

// ---------- Zarobki offline ----------
// Zwraca kwotę do odebrania (0 = nie pokazuj okna powitalnego).
function offlineRate() {
  return Math.min(BALANCE.offlineRate + talentLevel('tt1') * 0.05, 0.95); // Nocna zmiana
}

function offlineEarnings() {
  const elapsed = Math.min((now() - S.lastSeen) / 1000, BALANCE.offlineMaxHours * 3600);
  if (elapsed > 60 && totalCps() > 0) return totalCps() * elapsed * offlineRate();
  return 0;
}

// Mnożnik odstępu między kometami (talent Magnes komet + badanie Teoria komet).
function cometDelayMult() {
  let d = 1 - talentLevel('tt2') * 0.08;
  for (const r of RESEARCH) if (isResearchDone(r.id) && r.cometFreq) d *= 1 - r.cometFreq;
  return d;
}

// Długość boostu reklamowego w sekundach (talent Wieczny boost).
function boostDuration() { return BALANCE.adBoostSeconds + talentLevel('tt3') * 15; }

// Dodatkowy dochód/sek. z auto-klikacza (symulowane kliknięcia mocą kliku).
// Liczone przez upływ czasu w tick() — działa poprawnie nawet po zwinięciu
// aplikacji w tło (tak jak cps), w przeciwieństwie do osobnego interwału.
function autoClickBonus() {
  return now() < S.autoClickUntil ? clickPower() * BALANCE.autoClickRate : 0;
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
  if (S.dailyMissions.date !== today) generateMissions();
}

// ---------- Misje dzienne ----------
function generateMissions() {
  const pool = [...MISSION_TYPES];
  const chosen = [];
  for (let i = 0; i < BALANCE.missionCount && pool.length; i++) {
    const mt = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const target = Math.round(mt.dynamicTarget ? mt.dynamicTarget() : mt.target);
    chosen.push({ type: mt.id, target, claimed: false });
  }
  S.dailyMissions = { date: todayStr(), missions: chosen };
  S.missionCounters = {};
  save();
}

// Zwiększ dzienny licznik postępu misji (wołane z akcji gracza).
function missionBump(counter, amount = 1) {
  S.missionCounters[counter] = (S.missionCounters[counter] || 0) + amount;
}

function missionProgress(m) {
  const mt = MISSION_TYPES.find(t => t.id === m.type);
  return Math.min(S.missionCounters[mt.counter] || 0, m.target);
}

function missionReward() {
  return Math.max(BALANCE.missionRewardMin, totalCps() * BALANCE.missionRewardCps);
}

// Odbierz nagrodę za misję; zwraca {reward, setDone} albo null.
function claimMission(i) {
  const m = S.dailyMissions.missions[i];
  if (!m || m.claimed || missionProgress(m) < m.target) return null;
  m.claimed = true;
  const reward = missionReward();
  earn(reward);
  S.missionsCompleted = (S.missionsCompleted || 0) + 1;
  const setDone = S.dailyMissions.missions.every(x => x.claimed);
  if (setDone) {
    S.stardust += BALANCE.missionSetBonus;
    S.totalStardustEarned = (S.totalStardustEarned || 0) + BALANCE.missionSetBonus;
  }
  save();
  return { reward, setDone };
}

// Pozycja w 7-dniowym kalendarzu (0–6), wyliczona z serii logowań.
function calIndex() { return (Math.max(1, S.loginStreak || 1) - 1) % 7; }

// Kwota nagrody kryształowej dla danego dnia (skaluje się z produkcją).
function calCrystals(r) { return Math.max(500 * r.day, totalCps() * r.mult); }

// Odbierz dzisiejszą nagrodę z kalendarza. Zwraca {kind, amount?} albo null.
function claimDaily() {
  if (S.dailyClaimed) return null;
  S.dailyClaimed = true;
  const r = DAILY_REWARDS[calIndex()];
  const out = { kind: r.kind, day: r.day };
  if (r.kind === 'crystals') { const a = calCrystals(r); earn(a); out.amount = a; }
  else if (r.kind === 'stardust') { S.stardust += r.amount; S.totalStardustEarned = (S.totalStardustEarned || 0) + r.amount; out.amount = r.amount; }
  else if (r.kind === 'boost') { S.boostUntil = now() + boostDuration() * 1000; }
  else if (r.kind === 'spin') { S.freeSpins = (S.freeSpins || 0) + 1; }
  save();
  return out;
}

// ---------- Powiadomienia: planowanie na podstawie stanu ----------
// Buduje listę przyszłych powiadomień przypominających o powrocie do gry.
function buildNotifications() {
  const list = [];
  const T = (LANG === 'en') ? 'Cosmic Miner' : 'Kosmiczny Górnik';
  if (S.expedition && S.expedition.end > now()) {
    const pl = PLANETS.find(p => p.id === S.expedition.planet);
    list.push({ id: 1, title: T, body: t('notifExp', pl ? t('notifExpTo', nm(pl)) : ''), at: S.expedition.end });
  }
  if (S.research && S.research.end > now()) {
    const r = RESEARCH.find(x => x.id === S.research.id);
    list.push({ id: 2, title: T, body: t('notifRes', r ? t('notifResName', nm(r)) : ''), at: S.research.end });
  }
  if (totalCps() > 0) {
    list.push({ id: 3, title: T, body: t('notifFull'), at: now() + BALANCE.offlineMaxHours * 3600 * 1000 });
  }
  list.push({ id: 4, title: T, body: t('notifDaily'), at: now() + 24 * 3600 * 1000 });
  return list;
}

// (Prze)planuj powiadomienia zgodnie z ustawieniem gracza.
function rescheduleNotifications() {
  if (typeof Notify === 'undefined') return;
  if (S.notifOn) Notify.scheduleAll(buildNotifications());
  else Notify.cancelAll();
}

// ---------- Koło Fortuny ----------
// Darmowy los, jeśli dziś jeszcze nie kręcono ALBO są bonusowe darmowe losy.
function wheelFreeAvailable() {
  return S.lastWheelSpinDay !== todayStr() || (S.freeSpins || 0) > 0;
}

// Zużyj darmowy los: najpierw bonusowe, potem dzienny.
function consumeFreeSpin() {
  if ((S.freeSpins || 0) > 0) S.freeSpins--;
  else S.lastWheelSpinDay = todayStr();
}

// Losuj segment ważony (weight). Zwraca indeks w WHEEL.
function pickWheelIndex() {
  const total = WHEEL.reduce((a, s) => a + s.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WHEEL.length; i++) {
    r -= WHEEL[i].weight;
    if (r < 0) return i;
  }
  return WHEEL.length - 1;
}

// Przyznaj nagrodę z segmentu. Zwraca { text, big } do pokazania.
function grantWheelReward(seg) {
  S.totalSpins = (S.totalSpins || 0) + 1;
  const crystals = m => Math.max(seg.min || 0, totalCps() * BALANCE.wheelCrystalCps * m);
  switch (seg.kind) {
    case 'crystals': {
      const a = crystals(seg.mult);
      earn(a);
      return { text: t('wheelCrystals', fmt(a)), big: seg.mult >= 15 };
    }
    case 'boost':
      S.boostUntil = now() + boostDuration() * 1000;
      return { text: t('wheelBoost', BALANCE.adBoostMult, Math.round(boostDuration())), big: false };
    case 'frenzy':
      S.frenzyUntil = now() + BALANCE.frenzySeconds * 1000;
      return { text: t('wheelFrenzy', BALANCE.frenzyMult, BALANCE.frenzySeconds), big: true };
    case 'stardust':
      S.stardust += seg.amount;
      S.totalStardustEarned = (S.totalStardustEarned || 0) + seg.amount;
      return { text: t('wheelDust', seg.amount), big: true };
    case 'again':
      S.freeSpins = (S.freeSpins || 0) + 1;
      return { text: t('wheelAgain'), big: false };
    case 'jackpot': {
      const a = crystals(30);
      earn(a);
      S.stardust += 2;
      S.totalStardustEarned = (S.totalStardustEarned || 0) + 2;
      S.frenzyUntil = now() + BALANCE.frenzySeconds * 1000;
      return { text: t('wheelJackpot', fmt(a), BALANCE.frenzyMult), big: true };
    }
  }
  return { text: '', big: false };
}

// ---------- Ekspedycje ----------
function planetUnlocked(pl) { return S.allTimeEarned >= pl.unlockEarned; }

function artifactCount() { return Object.keys(S.artifacts || {}).length; }

function startExpedition(planetId) {
  const pl = PLANETS.find(p => p.id === planetId);
  if (S.expedition || !pl || !planetUnlocked(pl)) return false;
  S.expedition = { planet: planetId, end: now() + pl.hours * 3600 * 1000 };
  save();
  return true;
}

function expeditionRemaining() {
  return S.expedition ? Math.max(0, S.expedition.end - now()) : 0;
}

function expeditionLoot(pl) {
  return Math.max(pl.lootMin, totalCps() * pl.lootCps);
}

// Reklama skraca wyprawę o BALANCE.rushMinutes.
function rushExpedition() {
  if (!S.expedition) return;
  S.expedition.end -= BALANCE.rushMinutes * 60 * 1000;
  save();
}

// Odbiór ukończonej wyprawy; zwraca { loot, artifact, duplicate, dust } albo null.
function claimExpedition() {
  if (!S.expedition || expeditionRemaining() > 0) return null;
  const pl = PLANETS.find(p => p.id === S.expedition.planet);
  const loot = expeditionLoot(pl);
  earn(loot);
  S.expeditionsDone = (S.expeditionsDone || 0) + 1;
  let artifact = null, duplicate = false, dust = 0;
  const artChance = pl.artChance * (weekendEventOfType('artifact') ? BALANCE.weekendMult : 1);
  if (Math.random() < artChance) {
    const pool = ARTIFACTS.filter(a => a.planet === pl.id);
    artifact = pool[Math.floor(Math.random() * pool.length)];
    if (S.artifacts[artifact.id]) {
      duplicate = true;
      dust = BALANCE.duplicateDust;
      S.stardust += dust;
      S.totalStardustEarned = (S.totalStardustEarned || 0) + dust;
    } else {
      S.artifacts[artifact.id] = true;
    }
  }
  S.expedition = null;
  save();
  return { loot, artifact, duplicate, dust };
}

// ---------- Laboratorium badań ----------
function isResearchDone(id) { return !!(S.researchDone && S.researchDone[id]); }

function researchUnlocked(r) { return !r.req || isResearchDone(r.req); }

function researchDoneCount() { return Object.keys(S.researchDone || {}).length; }

// Suma efektu danego typu ze wszystkich ukończonych badań (mnożnikowo).
function researchMult(field) {
  let m = 1;
  for (const r of RESEARCH) if (isResearchDone(r.id) && r[field]) m *= 1 + r[field];
  return m;
}

function startResearch(id) {
  const r = RESEARCH.find(x => x.id === id);
  if (!r || S.research || isResearchDone(id) || !researchUnlocked(r) || S.crystals < r.cost) return false;
  S.crystals -= r.cost;
  S.research = { id, end: now() + r.hours * 3600 * 1000 };
  save();
  return true;
}

function researchRemaining() {
  return S.research ? Math.max(0, S.research.end - now()) : 0;
}

function rushResearch() {
  if (!S.research) return;
  S.research.end -= BALANCE.rushMinutes * 60 * 1000;
  save();
}

// Odbiór ukończonego badania; zwraca definicję badania albo null.
function claimResearch() {
  if (!S.research || researchRemaining() > 0) return null;
  const r = RESEARCH.find(x => x.id === S.research.id);
  S.researchDone[r.id] = true;
  S.research = null;
  save();
  return r;
}

// ---------- Skórki ----------
function skinOwned(sk) {
  if (sk.id === 'classic') return true;
  if (sk.cost) return !!(S.skinsBought && S.skinsBought[sk.id]);
  return sk.cond ? sk.cond(S) : false;
}

function buySkin(id) {
  const sk = SKINS.find(x => x.id === id);
  if (!sk || !sk.cost || skinOwned(sk) || S.stardust < sk.cost) return false;
  S.stardust -= sk.cost;
  S.skinsBought[id] = true;
  save();
  return true;
}

function selectSkin(id) {
  const sk = SKINS.find(x => x.id === id);
  if (!sk || !skinOwned(sk)) return false;
  S.skin = id;
  save();
  return true;
}

function skinsOwnedCount() { return SKINS.filter(skinOwned).length; }

// ---------- Bossowie ----------
function bossMaxHp() {
  return clickPower() * BALANCE.bossHpTaps;
}

function bossReward() {
  return Math.max(BALANCE.bossRewardMin, totalCps() * BALANCE.bossRewardCps);
}

// Nagrody za pokonanie bossa; zwraca { loot, dust, artifact, duplicate }.
function grantBossWin() {
  const loot = bossReward();
  earn(loot);
  S.bossesKilled = (S.bossesKilled || 0) + 1;
  S.stardust += BALANCE.bossDust;
  S.totalStardustEarned = (S.totalStardustEarned || 0) + BALANCE.bossDust;
  let artifact = null, duplicate = false;
  const bossArtChance = BALANCE.bossArtChance * (weekendEventOfType('artifact') ? BALANCE.weekendMult : 1);
  if (Math.random() < bossArtChance) {
    const unlockedIds = PLANETS.filter(planetUnlocked).map(p => p.id);
    const pool = ARTIFACTS.filter(a => unlockedIds.includes(a.planet));
    if (pool.length) {
      artifact = pool[Math.floor(Math.random() * pool.length)];
      if (S.artifacts[artifact.id]) {
        duplicate = true;
        S.stardust += BALANCE.duplicateDust;
        S.totalStardustEarned += BALANCE.duplicateDust;
      } else {
        S.artifacts[artifact.id] = true;
      }
    }
  }
  save();
  return { loot, dust: BALANCE.bossDust, artifact, duplicate };
}

// Nagroda pocieszenia za nieudaną walkę.
function grantBossFail() {
  const loot = bossReward() * BALANCE.bossFailFraction;
  earn(loot);
  save();
  return loot;
}

// ---------- Arena bossów (tryb wyzwania: fale na czas, bez losowego oczekiwania) ----------
// Osobna pula od zwykłych bossów: nie liczy się do S.bossesKilled (odblokowań
// skórek/osiągnięć), a nagroda za falę jest mniejsza niż za zwykłego bossa —
// to dodatkowa, powtarzalna aktywność oparta na zręczności, nie substytut.
function arenaWaveHp(wave) {
  return clickPower() * BALANCE.arenaHpBase * Math.pow(BALANCE.arenaHpGrowth, wave - 1);
}

function arenaWaveReward() {
  return Math.max(BALANCE.arenaRewardMin, totalCps() * BALANCE.arenaRewardCps);
}

// Kończy przebieg areny: pył dostajesz TYLKO za fale ponad dotychczasowy
// rekord (powtarzanie znanych fal nie daje pyłu — chroni to przed farmieniem).
// Zwraca { isRecord, dust, newWaves, prevBest }.
function finishArenaRun(reachedWave) {
  const prevBest = S.arenaBest || 0;
  const newWaves = Math.max(0, reachedWave - prevBest);
  const dust = newWaves * BALANCE.arenaRecordDustPerWave;
  const isRecord = reachedWave > prevBest;
  if (isRecord) S.arenaBest = reachedWave;
  if (dust > 0) {
    S.stardust += dust;
    S.totalStardustEarned = (S.totalStardustEarned || 0) + dust;
  }
  save();
  return { isRecord, dust, newWaves, prevBest };
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
