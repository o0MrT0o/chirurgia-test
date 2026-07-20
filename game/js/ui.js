'use strict';
/* =====================================================================
   UI.JS — cały wygląd: nagłówek, zakładki, panele, efekty, kometa.
   Logika gry jest w logic.js — tutaj tylko rysowanie i obsługa dotyku.
   ===================================================================== */

// ---------- Nagłówek ----------
function renderHeader() {
  $('#crystalCount').innerHTML = `${fmt(S.crystals)} <span class="unit">💎</span>`;
  $('#cpsLabel').textContent = `${fmt(totalCps())} / sek. • klik: +${fmt(clickPower())}`;
  $('#stardustLabel').textContent = S.stardust > 0
    ? `✨ ${fmt(S.stardust)} gwiezdnego pyłu (+${Math.round(S.stardust * BALANCE.stardustBonus * 100)}% produkcji)` : '';
  const chips = [];
  if (now() < S.frenzyUntil) chips.push(`<span class="boostChip gold">☄️ SZAŁ ×${BALANCE.frenzyMult} — ${Math.ceil((S.frenzyUntil - now()) / 1000)}s</span>`);
  if (now() < S.boostUntil) chips.push(`<span class="boostChip">⚡ Boost ×${BALANCE.adBoostMult} — ${Math.ceil((S.boostUntil - now()) / 1000)}s</span>`);
  $('#boostBar').innerHTML = chips.join('');
}

// ---------- Zakładki ----------
let activeTab = 'mine';

function initTabs() {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b === btn));
      renderPanel();
    };
  });
}

function renderPanel() {
  const p = $('#panel');
  if (activeTab === 'mine') renderMine(p);
  else if (activeTab === 'upgrades') renderUpgrades(p);
  else if (activeTab === 'prestige') renderPrestige(p);
  else if (activeTab === 'achv') renderAchievements(p);
  else if (activeTab === 'bonus') renderBonus(p);
}

// ---------- Zakładka: Kopalnia ----------
function renderMine(p) {
  p.innerHTML = BUILDINGS.map(b => {
    const count = S.buildings[b.id] || 0;
    const cost = buildingCost(b);
    const visible = count > 0 || S.totalEarned >= b.baseCost * 0.5;
    if (!visible) return '';
    const can = S.crystals >= cost;
    return `<div class="item ${can ? '' : 'locked'}" data-buy="${b.id}">
      <div class="icon">${b.icon}</div>
      <div class="info">
        <div class="name">${b.name}</div>
        <div class="desc">${fmt(buildingCps(b) * globalMult())} 💎/sek. ${count ? '(razem)' : `• daje ${fmt(b.cps)}/sek.`}</div>
      </div>
      <div class="right">
        <div class="cost ${can ? '' : 'cant'}">${fmt(cost)} 💎</div>
        <div class="owned">${count || ''}</div>
      </div>
    </div>`;
  }).join('') || '<div class="note">Klikaj w asteroidę, aby odblokować pierwsze maszyny! ⛏️</div>';
  p.querySelectorAll('[data-buy]').forEach(el => el.onclick = () => {
    if (buyBuilding(el.dataset.buy)) {
      if (navigator.vibrate) navigator.vibrate(20);
      renderPanel();
    }
  });
}

// ---------- Zakładka: Ulepszenia ----------
function renderUpgrades(p) {
  const list = UPGRADES.filter(u => !S.upgrades[u.id] && S.totalEarned >= u.cost * 0.3);
  const bought = UPGRADES.filter(u => S.upgrades[u.id]);
  p.innerHTML = (list.map(u => {
    const can = S.crystals >= u.cost;
    return `<div class="item ${can ? '' : 'locked'}" data-upg="${u.id}">
      <div class="icon">${u.icon}</div>
      <div class="info"><div class="name">${u.name}</div><div class="desc">${u.desc}</div></div>
      <div class="right"><div class="cost ${can ? '' : 'cant'}">${fmt(u.cost)} 💎</div></div>
    </div>`;
  }).join('') || '<div class="note">Zdobywaj kryształy, aby odkryć nowe ulepszenia! 🚀</div>')
  + (bought.length ? '<div class="note">— Kupione —</div>' + bought.map(u =>
      `<div class="item bought"><div class="icon">${u.icon}</div>
       <div class="info"><div class="name">${u.name}</div><div class="desc">${u.desc}</div></div>
       <div class="right">✅</div></div>`).join('') : '');
  p.querySelectorAll('[data-upg]').forEach(el => el.onclick = () => {
    const u = UPGRADES.find(x => x.id === el.dataset.upg);
    if (buyUpgrade(el.dataset.upg)) {
      toast(`🚀 Kupiono: ${u.name}!`);
      if (navigator.vibrate) navigator.vibrate(30);
      renderPanel();
    }
  });
}

// ---------- Zakładka: Prestiż ----------
function renderPrestige(p) {
  const gain = stardustGain();
  p.innerHTML = `
    <div class="note" style="padding-top:10px">
      ✨ <b>Prestiż</b> resetuje kryształy, maszyny i ulepszenia,<br>
      ale daje <b>gwiezdny pył</b> — trwałe <b>+${BALANCE.stardustBonus * 100}% produkcji</b> za każdy pyłek, na zawsze.<br><br>
      Zdobyte w tej rundzie: <b>${fmt(S.totalEarned)} 💎</b><br>
      Pył do zdobycia teraz: <b style="color:#ffd76e">✨ ${fmt(gain)}</b>
    </div>
    <button class="bigBtn gold" id="prestigeBtn" ${gain < 1 ? 'disabled' : ''}>
      ${gain >= 1 ? `✨ Prestiż — odbierz ${fmt(gain)} pyłu` : 'Zdobądź min. 10 mln 💎, aby odblokować'}
    </button>
    <div class="note">Twój pył: ✨ ${fmt(S.stardust)} • Prestiże: ${S.prestigeCount}</div>`;
  const b = $('#prestigeBtn');
  if (b && gain >= 1) b.onclick = () => showOverlay(`
    <h2>✨ Na pewno?</h2>
    <p>Stracisz kryształy, maszyny i ulepszenia,<br>ale zyskasz <b>${fmt(gain)} pyłu</b> (+${fmt(gain * BALANCE.stardustBonus * 100)}% na zawsze).</p>
    <button class="bigBtn gold" onclick="hideOverlay(); uiDoPrestige()">Tak, resetuj!</button>
    <button class="bigBtn" onclick="hideOverlay()">Jeszcze nie</button>`);
}

function uiDoPrestige() {
  const gain = doPrestige();
  if (gain > 0) toast(`✨ Prestiż! Zdobyto ${fmt(gain)} gwiezdnego pyłu!`);
  renderPanel();
}

// ---------- Zakładka: Osiągnięcia ----------
function renderAchievements(p) {
  const doneCount = Object.keys(S.achievements).length;
  p.innerHTML = `<div class="note">🏆 ${doneCount}/${ACHIEVEMENTS.length} — każde osiągnięcie daje <b>+${BALANCE.achievementBonus * 100}% produkcji</b></div>`
    + ACHIEVEMENTS.map(a => `
      <div class="achv ${S.achievements[a.id] ? 'done' : ''}">
        <div class="icon">${a.icon}</div>
        <div><div class="t">${a.name}</div><div class="d">${a.desc}</div></div>
      </div>`).join('');
}

// ---------- Zakładka: Bonusy ----------
function renderBonus(p) {
  p.innerHTML = `
    <div class="note" style="padding-top:8px">🎁 <b>Bonus dzienny</b> — seria: ${S.loginStreak} ${S.loginStreak === 1 ? 'dzień' : 'dni'}</div>
    <button class="bigBtn" id="dailyBtn" ${S.dailyClaimed ? 'disabled' : ''}>
      ${S.dailyClaimed ? '✅ Odebrano — wróć jutro!' : `🎁 Odbierz ${fmt(dailyReward())} 💎`}
    </button>
    <div class="note">⚡ <b>Boost reklamowy</b> — obejrzyj reklamę, aby podwoić produkcję na ${BALANCE.adBoostSeconds / 60} min</div>
    <button class="bigBtn gold" id="adBoostBtn" ${now() < S.boostUntil ? 'disabled' : ''}>
      ${now() < S.boostUntil ? `⚡ Boost aktywny (${Math.ceil((S.boostUntil - now()) / 1000)}s)` : `🎬 Obejrzyj reklamę → Boost ×${BALANCE.adBoostMult}`}
    </button>
    <div class="note">Łącznie wydobyto (od początku): <b>${fmt(S.allTimeEarned)} 💎</b><br>
    Kliknięcia: <b>${fmt(S.totalClicks)}</b> • Komety: <b>${S.cometsCaught}</b></div>`;
  const d = $('#dailyBtn');
  if (d && !S.dailyClaimed) d.onclick = () => {
    const r = claimDaily();
    if (r > 0) toast(`🎁 Bonus dzienny: +${fmt(r)} 💎 (seria: ${S.loginStreak} dni)`);
    renderPanel();
  };
  const a = $('#adBoostBtn');
  if (a && now() >= S.boostUntil) a.onclick = adBoost;
}

// ---------- Klikanie asteroidy ----------
function onTap(e) {
  const p = clickPower();
  earn(p);
  S.totalClicks++;
  if (navigator.vibrate) navigator.vibrate(12);
  const ast = $('#asteroid');
  ast.classList.remove('pulse'); void ast.offsetWidth;
  ast.classList.add('pulse');
  const f = document.createElement('div');
  f.className = 'floatNum';
  f.textContent = '+' + fmt(p);
  const x = (e.touches ? e.touches[0].clientX : e.clientX) || window.innerWidth / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) || window.innerHeight / 3;
  f.style.left = (x - 20 + (Math.random() * 40 - 20)) + 'px';
  f.style.top = (y - 30) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

// ---------- Złota kometa ----------
function scheduleComet() {
  const delay = BALANCE.cometMinDelay + Math.random() * (BALANCE.cometMaxDelay - BALANCE.cometMinDelay);
  setTimeout(spawnComet, delay * 1000);
}

function spawnComet() {
  const c = $('#comet');
  c.style.display = 'block';
  c.style.left = (10 + Math.random() * 70) + 'vw';
  c.style.animation = 'none'; void c.offsetWidth; // restart animacji
  c.style.animation = '';
  const hide = setTimeout(() => { c.style.display = 'none'; scheduleComet(); }, BALANCE.cometLifetime * 1000);
  c.onclick = () => {
    clearTimeout(hide);
    c.style.display = 'none';
    S.cometsCaught++;
    if (Math.random() < 0.5) {
      const reward = Math.max(100, totalCps() * 90);
      earn(reward);
      toast(`☄️ Złota kometa! +${fmt(reward)} 💎`);
    } else {
      S.frenzyUntil = now() + BALANCE.frenzySeconds * 1000;
      toast(`☄️ SZAŁ WYDOBYCIA! Produkcja ×${BALANCE.frenzyMult} przez ${BALANCE.frenzySeconds} sekund!`);
    }
    if (navigator.vibrate) navigator.vibrate(60);
    save();
    scheduleComet();
  };
}

// ---------- Okno powitalne (zarobki offline) ----------
let pendingOffline = 0;

function showOfflineWindow() {
  pendingOffline = offlineEarnings();
  if (pendingOffline <= 0) return;
  showOverlay(`
    <h2>🌙 Witaj z powrotem!</h2>
    <p>Twoje maszyny pracowały pod Twoją nieobecność i wydobyły:<br>
    <b style="font-size:22px;color:#8ff5ff">${fmt(pendingOffline)} 💎</b></p>
    <button class="bigBtn gold" onclick="claimOffline(true)">🎬 Obejrzyj reklamę i odbierz ×2</button>
    <button class="bigBtn" onclick="claimOffline(false)">Odbierz zwykłą kwotę</button>
  `);
}

function claimOffline(doubled) {
  if (doubled) {
    Ads.showRewarded(() => { earn(pendingOffline * 2); pendingOffline = 0; hideOverlay(); });
  } else {
    earn(pendingOffline); pendingOffline = 0; hideOverlay();
  }
}

// ---------- Overlay / toast ----------
function showOverlay(html) { $('#overlayBox').innerHTML = html; $('#overlay').style.display = 'flex'; }
function hideOverlay() { $('#overlay').style.display = 'none'; }

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ---------- Tło: gwiazdy ----------
function makeStars() {
  const wrap = $('#stars');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 1;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;animation-delay:${Math.random() * 3}s`;
    wrap.appendChild(s);
  }
}
