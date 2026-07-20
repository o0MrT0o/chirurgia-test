'use strict';
/* =====================================================================
   UI.JS — cały wygląd: nagłówek, zakładki, panele, efekty, kometa.
   Logika gry jest w logic.js — tutaj tylko rysowanie i obsługa dotyku.
   ===================================================================== */

// ---------- Nagłówek ----------
function renderHeader() {
  $('#crystalCount').innerHTML = `${fmt(S.crystals)} <span class="unit">💎</span>`;
  $('#cpsLabel').textContent = `${fmt(totalCps())} / sek. • klik: +${fmt(clickPower())}`;
  $('#stardustLabel').textContent = (S.stardust > 0 || talentLevelsTotal() > 0)
    ? `✨ ${fmt(S.stardust)} pyłu do wydania • 🌟 talenty: ${talentLevelsTotal()} poz.` : '';
  const chips = [];
  if (now() < S.frenzyUntil) chips.push(`<span class="boostChip gold">☄️ SZAŁ ×${BALANCE.frenzyMult} — ${Math.ceil((S.frenzyUntil - now()) / 1000)}s</span>`);
  if (now() < S.feverUntil) chips.push(`<span class="boostChip gold">💥 GORĄCZKA: klik ×${BALANCE.feverMult} — ${Math.ceil((S.feverUntil - now()) / 1000)}s</span>`);
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

let lastPanelTab = null;

function renderPanel() {
  const p = $('#panel');
  if (activeTab === 'mine') renderMine(p);
  else if (activeTab === 'upgrades') renderUpgrades(p);
  else if (activeTab === 'exp') renderExpeditions(p);
  else if (activeTab === 'prestige') renderPrestige(p);
  else if (activeTab === 'achv') renderAchievements(p);
  else if (activeTab === 'bonus') renderBonus(p);
  // kaskadowy wjazd kart tylko przy zmianie zakładki (nie przy odświeżaniu)
  if (lastPanelTab !== activeTab) {
    [...p.children].forEach((el, i) => {
      el.style.animationDelay = Math.min(i * 25, 250) + 'ms';
      el.classList.add('enter');
    });
    p.scrollTop = 0;
  }
  lastPanelTab = activeTab;
}

// ---------- Konfetti (wielkie momenty) ----------
function spawnConfetti(n = 24) {
  const colors = ['#6ee7ff', '#ffd76e', '#3ddc84', '#ff8fc8', '#8a5fff', '#ffffff'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText = `left:${Math.random() * 100}vw;background:${colors[i % colors.length]};`
      + `width:${5 + Math.random() * 5}px;height:${8 + Math.random() * 6}px;`
      + `animation-duration:${1.6 + Math.random() * 1.4}s;animation-delay:${Math.random() * 0.4}s;`
      + `--rx:${Math.round(Math.random() * 720 - 360)}deg;--dx:${Math.round(Math.random() * 16 - 8)}vw;`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3600);
  }
}

// ---------- Zakładka: Wyprawy ----------
function fmtCountdown(ms) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
               : `${m}:${String(sec).padStart(2, '0')}`;
}

function renderExpeditions(p) {
  let topHtml;
  if (S.expedition) {
    const pl = PLANETS.find(x => x.id === S.expedition.planet);
    const remaining = expeditionRemaining();
    const total = pl.hours * 3600 * 1000;
    const pct = Math.min(100, Math.round((1 - remaining / total) * 100));
    if (remaining <= 0) {
      topHtml = `
        <div class="note" style="padding-top:8px">${pl.icon} Wyprawa na <b>${pl.name}</b> zakończona!</div>
        <button class="bigBtn gold" id="claimExpBtn">📦 Odbierz łup: ~${fmt(expeditionLoot(pl))} 💎</button>`;
    } else {
      topHtml = `
        <div class="note" style="padding-top:8px">${pl.icon} Statek w drodze na <b>${pl.name}</b></div>
        <div class="mbar" style="height:10px"><div class="mfill" style="width:${pct}%"></div></div>
        <div class="note">Powrót za: <b>${fmtCountdown(remaining)}</b></div>
        <button class="bigBtn gold" id="rushExpBtn">🎬 Obejrzyj reklamę → skróć o ${BALANCE.rushMinutes} min</button>`;
    }
  } else {
    topHtml = `<div class="note" style="padding-top:8px">🚀 Wyślij statek na wyprawę — wróci z łupem
      i szansą na <b>artefakt</b> (każdy daje trwałe <b>+${BALANCE.artifactBonus * 100}% produkcji</b>)</div>`
      + PLANETS.map(pl => {
        const unlocked = planetUnlocked(pl);
        const time = pl.hours < 1 ? `${pl.hours * 60} min` : `${pl.hours} h`;
        return `<div class="item ${unlocked ? '' : 'locked'}" ${unlocked ? `data-planet="${pl.id}"` : ''}>
          <div class="icon">${pl.icon}</div>
          <div class="info">
            <div class="name">${pl.name} <span class="qty">${time}</span></div>
            <div class="desc">${unlocked
              ? `łup: ~${fmt(expeditionLoot(pl))} 💎 • artefakt: ${Math.round(pl.artChance * 100)}% szansy`
              : `🔒 wymaga ${fmt(pl.unlockEarned)} 💎 łącznego wydobycia`}</div>
          </div>
          <div class="right"><div class="cost">${unlocked ? '🚀 Wyślij' : ''}</div></div>
        </div>`;
      }).join('');
  }

  // — Laboratorium —
  let labHtml;
  if (S.research) {
    const r = RESEARCH.find(x => x.id === S.research.id);
    const remaining = researchRemaining();
    const total = r.hours * 3600 * 1000;
    const pct = Math.min(100, Math.round((1 - remaining / total) * 100));
    labHtml = remaining <= 0
      ? `<div class="note branchHead">🧪 Laboratorium</div>
         <div class="note">${r.icon} Badanie <b>${r.name}</b> ukończone!</div>
         <button class="bigBtn gold" id="claimResBtn">🎓 Odbierz: ${r.desc}</button>`
      : `<div class="note branchHead">🧪 Laboratorium</div>
         <div class="note">${r.icon} Trwa badanie: <b>${r.name}</b> (${r.desc})</div>
         <div class="mbar" style="height:10px"><div class="mfill" style="width:${pct}%"></div></div>
         <div class="note">Koniec za: <b>${fmtCountdown(remaining)}</b></div>
         <button class="bigBtn gold" id="rushResBtn">🎬 Obejrzyj reklamę → skróć o ${BALANCE.rushMinutes} min</button>`;
  } else {
    const next = RESEARCH.filter(r => !isResearchDone(r.id) && researchUnlocked(r));
    const locked = RESEARCH.filter(r => !isResearchDone(r.id) && !researchUnlocked(r));
    labHtml = `<div class="note branchHead">🧪 Laboratorium — ukończone: ${researchDoneCount()}/${RESEARCH.length}</div>`
      + (next.length === 0 && locked.length === 0
        ? '<div class="note">🎓 Wszystkie badania ukończone!</div>'
        : next.map(r => {
            const can = S.crystals >= r.cost;
            const time = r.hours < 1 ? `${r.hours * 60} min` : `${r.hours} h`;
            return `<div class="item ${can ? '' : 'locked'}" data-research="${r.id}">
              <div class="icon">${r.icon}</div>
              <div class="info">
                <div class="name">${r.name} <span class="qty">${time}</span></div>
                <div class="desc">${r.desc}</div>
              </div>
              <div class="right"><div class="cost ${can ? '' : 'cant'}">${fmt(r.cost)} 💎</div></div>
            </div>`;
          }).join('')
          + (locked.length ? `<div class="note">🔒 Kolejne badania odblokują się po ukończeniu poprzednich (${locked.length} w kolejce)</div>` : ''));
  }

  const artHtml = `<div class="note">🏺 <b>Kolekcja artefaktów</b> — ${artifactCount()}/${ARTIFACTS.length}
    (bonus: <b>+${Math.round(artifactCount() * BALANCE.artifactBonus * 100)}% produkcji</b>)
    • duplikat = +${BALANCE.duplicateDust} ✨</div>
    <div class="artGrid">${ARTIFACTS.map(a =>
      `<div class="art ${S.artifacts[a.id] ? 'owned' : ''}" title="${a.name}">
        <div class="ai">${S.artifacts[a.id] ? a.icon : '❔'}</div>
        <div class="an">${S.artifacts[a.id] ? a.name : '???'}</div>
      </div>`).join('')}</div>`;

  p.innerHTML = topHtml + labHtml + artHtml;

  p.querySelectorAll('[data-research]').forEach(el => el.onclick = () => {
    const r = RESEARCH.find(x => x.id === el.dataset.research);
    if (startResearch(el.dataset.research)) {
      toast(`🧪 Rozpoczęto badanie: ${r.name}! Potrwa ${r.hours < 1 ? r.hours * 60 + ' min' : r.hours + ' h'}.`);
      Sound.buy();
      if (navigator.vibrate) navigator.vibrate(30);
      renderPanel();
    }
  });
  const claimRes = $('#claimResBtn');
  if (claimRes) claimRes.onclick = () => {
    const r = claimResearch();
    if (!r) return;
    showOverlay(`<h2>🎓 Badanie ukończone!</h2>
      <p><span style="font-size:34px">${r.icon}</span><br><b>${r.name}</b><br>
      Trwały efekt: <b style="color:#8ff5ff">${r.desc}</b></p>
      <button class="bigBtn gold" onclick="hideOverlay(); renderPanel()">Eureka! 🎉</button>`);
    Sound.fanfare();
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  };
  const rushRes = $('#rushResBtn');
  if (rushRes) rushRes.onclick = () => Ads.showRewarded(() => {
    rushResearch();
    toast(`⏩ Badanie skrócone o ${BALANCE.rushMinutes} min!`);
    renderPanel();
  });

  p.querySelectorAll('[data-planet]').forEach(el => el.onclick = () => {
    if (startExpedition(el.dataset.planet)) {
      const pl = PLANETS.find(x => x.id === el.dataset.planet);
      toast(`🚀 Statek wyruszył na ${pl.name}! Wróci za ${pl.hours < 1 ? pl.hours * 60 + ' min' : pl.hours + ' h'}.`);
      if (navigator.vibrate) navigator.vibrate(30);
      renderPanel();
    }
  });
  const claimBtn = $('#claimExpBtn');
  if (claimBtn) claimBtn.onclick = () => {
    const res = claimExpedition();
    if (!res) return;
    let html = `<h2>📦 Łup z wyprawy!</h2><p><b style="font-size:22px;color:#8ff5ff">+${fmt(res.loot)} 💎</b>`;
    if (res.artifact && res.duplicate) html += `<br><br>${res.artifact.icon} <b>${res.artifact.name}</b> — duplikat!<br>Zamieniono na <b>+${res.dust} ✨ pyłu</b>`;
    else if (res.artifact) html += `<br><br>Znaleziono artefakt:<br><span style="font-size:34px">${res.artifact.icon}</span><br><b>${res.artifact.name}</b> (+${BALANCE.artifactBonus * 100}% produkcji na zawsze!)`;
    html += `</p><button class="bigBtn" onclick="hideOverlay(); renderPanel()">Super!</button>`;
    showOverlay(html);
    if (res.artifact && !res.duplicate) spawnConfetti(22);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    Sound.fanfare();
  };
  const rushBtn = $('#rushExpBtn');
  if (rushBtn) rushBtn.onclick = () => Ads.showRewarded(() => {
    rushExpedition();
    toast(`⏩ Wyprawa skrócona o ${BALANCE.rushMinutes} min!`);
    renderPanel();
  });
}

// ---------- Zakładka: Kopalnia ----------
let buyMode = 1; // 1 | 10 | 'max'

function renderMine(p) {
  const toggle = `<div class="buyToggle">
    ${[1, 10, 'max'].map(m =>
      `<button data-mode="${m}" class="${buyMode === m ? 'active' : ''}">${m === 'max' ? 'MAX' : '×' + m}</button>`
    ).join('')}
  </div>`;

  const rows = BUILDINGS.map(b => {
    const count = S.buildings[b.id] || 0;
    const visible = count > 0 || S.totalEarned >= b.baseCost * 0.5;
    if (!visible) return '';
    // ile sztuk kupimy przy obecnym trybie
    let qty = buyMode === 'max' ? maxAffordable(b) : buyMode;
    const shownQty = Math.max(qty, 1);          // przy MAX=0 pokazujemy koszt 1 szt.
    const cost = bulkCost(b, shownQty);
    const can = qty >= 1 && S.crystals >= cost;
    return `<div class="item ${can ? '' : 'locked'}" data-buy="${b.id}" data-qty="${shownQty}">
      <div class="icon">${b.icon}</div>
      <div class="info">
        <div class="name">${b.name}${shownQty > 1 ? ` <span class="qty">+${shownQty}</span>` : ''}</div>
        <div class="desc">${fmt(buildingCps(b) * globalMult())} 💎/sek. ${count ? '(razem)' : `• daje ${fmt(b.cps)}/sek.`}</div>
      </div>
      <div class="right">
        <div class="cost ${can ? '' : 'cant'}">${fmt(cost)} 💎</div>
        <div class="owned">${count || ''}</div>
      </div>
    </div>`;
  }).join('');

  p.innerHTML = toggle + (rows || '<div class="note">Klikaj w asteroidę, aby odblokować pierwsze maszyny! ⛏️</div>');

  p.querySelectorAll('.buyToggle button').forEach(el => el.onclick = () => {
    buyMode = el.dataset.mode === 'max' ? 'max' : Number(el.dataset.mode);
    renderPanel();
  });
  p.querySelectorAll('[data-buy]').forEach(el => el.onclick = () => {
    if (buyBuilding(el.dataset.buy, Number(el.dataset.qty))) {
      if (navigator.vibrate) navigator.vibrate(20);
      Sound.buy();
      renderPanel();
    }
  });
}

// ---------- Zakładka: Ulepszenia ----------
function renderUpgrades(p) {
  const list = UPGRADES.filter(u => !S.upgrades[u.id] && upgradeVisible(u))
    .sort((a, b) => a.cost - b.cost);
  const bought = UPGRADES.filter(u => S.upgrades[u.id]);
  p.innerHTML = (list.map(u => {
    const can = S.crystals >= u.cost;
    return `<div class="item ${can ? '' : 'locked'}" data-upg="${u.id}">
      <div class="icon">${u.icon}</div>
      <div class="info"><div class="name">${u.name}</div><div class="desc">${u.desc}</div></div>
      <div class="right"><div class="cost ${can ? '' : 'cant'}">${fmt(u.cost)} 💎</div></div>
    </div>`;
  }).join('') || '<div class="note">Zdobywaj kryształy i rozbudowuj kopalnię, aby odkryć nowe ulepszenia! 🚀</div>')
  + (bought.length ? `<div class="note">— Kupione (${bought.length}) —</div>` + bought.map(u =>
      `<div class="item bought"><div class="icon">${u.icon}</div>
       <div class="info"><div class="name">${u.name}</div><div class="desc">${u.desc}</div></div>
       <div class="right">✅</div></div>`).join('') : '');
  p.querySelectorAll('[data-upg]').forEach(el => el.onclick = () => {
    const u = UPGRADES.find(x => x.id === el.dataset.upg);
    if (buyUpgrade(el.dataset.upg)) {
      toast(`🚀 Kupiono: ${u.name}!`);
      if (navigator.vibrate) navigator.vibrate(30);
      Sound.buy();
      renderPanel();
    }
  });
}

// ---------- Zakładka: Prestiż + drzewko talentów ----------
function renderPrestige(p) {
  const gain = stardustGain();

  const treeHtml = TALENT_BRANCHES.map(br => {
    const rows = TALENTS.filter(t => t.branch === br.id).map(t => {
      const lvl = talentLevel(t.id);
      const maxed = lvl >= t.max;
      const unlocked = talentUnlocked(t);
      const cost = talentCost(t);
      const can = unlocked && !maxed && S.stardust >= cost;
      const reqTalent = t.req ? TALENTS.find(x => x.id === t.req.talent) : null;
      const status = maxed ? '' : unlocked
        ? `koszt: ✨ ${cost}`
        : `🔒 wymaga: ${reqTalent.name} poz. ${t.req.level}`;
      return `<div class="item ${maxed ? 'bought' : can ? '' : 'locked'}" data-talent="${t.id}">
        <div class="icon">${t.icon}</div>
        <div class="info">
          <div class="name">${t.name} <span class="qty">${lvl}/${t.max}</span></div>
          <div class="desc">${t.desc}${lvl > 0 ? ` • teraz: <b>${t.eff(lvl)}</b>` : ''}</div>
        </div>
        <div class="right"><div class="cost ${can || maxed ? '' : 'cant'}">${maxed ? 'MAX ✅' : status}</div></div>
      </div>`;
    }).join('');
    return `<div class="note branchHead">${br.name}</div>` + rows;
  }).join('');

  p.innerHTML = `
    <div class="note" style="padding-top:10px">
      ✨ <b>Prestiż</b> resetuje kryształy, maszyny i ulepszenia,<br>
      ale daje <b>gwiezdny pył</b> — wydasz go w drzewku talentów poniżej.<br>
      Zdobyte w tej rundzie: <b>${fmt(S.totalEarned)} 💎</b> •
      pył do zdobycia: <b style="color:#ffd76e">✨ ${fmt(gain)}</b>
    </div>
    <button class="bigBtn gold" id="prestigeBtn" ${gain < 1 ? 'disabled' : ''}>
      ${gain >= 1 ? `✨ Prestiż — odbierz ${fmt(gain)} pyłu` : 'Zdobądź min. 10 mln 💎, aby odblokować'}
    </button>
    <div class="note">🌟 <b>Drzewko talentów</b> — do wydania: <b style="color:#ffd76e">✨ ${fmt(S.stardust)}</b>
    • prestiże: ${S.prestigeCount}</div>
    ${treeHtml}`;

  const b = $('#prestigeBtn');
  if (b && gain >= 1) b.onclick = () => showOverlay(`
    <h2>✨ Na pewno?</h2>
    <p>Stracisz kryształy, maszyny i ulepszenia,<br>ale zyskasz <b>${fmt(gain)} pyłu</b> na talenty.<br>Talenty i osiągnięcia zostają!</p>
    <button class="bigBtn gold" onclick="hideOverlay(); uiDoPrestige()">Tak, resetuj!</button>
    <button class="bigBtn" onclick="hideOverlay()">Jeszcze nie</button>`);

  p.querySelectorAll('[data-talent]').forEach(el => el.onclick = () => {
    const t = TALENTS.find(x => x.id === el.dataset.talent);
    if (buyTalent(el.dataset.talent)) {
      toast(`🌟 ${t.name} → poziom ${talentLevel(t.id)} (${t.eff(talentLevel(t.id))})`);
      if (navigator.vibrate) navigator.vibrate(30);
      Sound.buy();
      renderPanel();
    }
  });
}

function uiDoPrestige() {
  const gain = doPrestige();
  if (gain > 0) { toast(`✨ Prestiż! Zdobyto ${fmt(gain)} gwiezdnego pyłu!`); spawnConfetti(32); }
  renderPanel();
}

// ---------- Zakładka: Sukcesy (skórki + osiągnięcia) ----------
function applySkin() {
  const ast = $('#asteroid');
  const sk = SKINS.find(x => x.id === S.skin) || SKINS[0];
  SKINS.forEach(s => ast.classList.remove(s.css));
  if (sk.id !== 'classic') ast.classList.add(sk.css);
  document.body.dataset.skin = sk.id; // tło (poświata) dopasowuje się do skórki
}

function renderSkins() {
  return `<div class="note" style="padding-top:8px">🎨 <b>Skórki asteroidy</b> — ${skinsOwnedCount()}/${SKINS.length}
    • masz ✨ ${fmt(S.stardust)}</div>
    <div class="skinGrid">${SKINS.map(sk => {
      const owned = skinOwned(sk);
      const sel = S.skin === sk.id;
      const status = sel ? '✅ wybrana'
        : owned ? 'dotknij, aby wybrać'
        : sk.cost ? `kup: ✨ ${sk.cost}`
        : `🔒 ${sk.condDesc}`;
      return `<div class="skinTile ${sel ? 'sel' : ''} ${owned || sk.cost ? '' : 'lockedSkin'}" data-skin="${sk.id}">
        <div class="skinPrev ${sk.css !== 'skin-classic' ? sk.css : ''}"></div>
        <div class="sn">${sk.name}</div>
        <div class="ss">${status}</div>
      </div>`;
    }).join('')}</div>`;
}

function renderAchievements(p) {
  const doneCount = Object.keys(S.achievements).length;
  p.innerHTML = renderSkins()
    + `<div class="note">🏆 <b>Osiągnięcia</b> ${doneCount}/${ACHIEVEMENTS.length} — każde daje <b>+${BALANCE.achievementBonus * 100}% produkcji</b></div>`
    + ACHIEVEMENTS.map(a => `
      <div class="achv ${S.achievements[a.id] ? 'done' : ''}">
        <div class="icon">${a.icon}</div>
        <div><div class="t">${a.name}</div><div class="d">${a.desc}</div></div>
      </div>`).join('');

  p.querySelectorAll('[data-skin]').forEach(el => el.onclick = () => {
    const sk = SKINS.find(x => x.id === el.dataset.skin);
    if (skinOwned(sk)) {
      if (selectSkin(sk.id)) {
        applySkin();
        toast(`🎨 Skórka: ${sk.name}!`);
        Sound.buy();
        renderPanel();
      }
    } else if (sk.cost) {
      if (buySkin(sk.id)) {
        selectSkin(sk.id);
        applySkin();
        toast(`🎨 Kupiono skórkę ${sk.name} za ✨ ${sk.cost}!`);
        Sound.fanfare();
        if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
        renderPanel();
      } else {
        toast(`✨ Potrzebujesz ${sk.cost} pyłu (masz ${fmt(S.stardust)})`);
      }
    } else {
      toast(`🔒 Warunek: ${sk.condDesc}`);
    }
  });
}

// ---------- Zakładka: Bonusy ----------
function renderMissions() {
  const missions = S.dailyMissions.missions || [];
  if (!missions.length) return '';
  const allDone = missions.every(m => m.claimed);
  return `<div class="note" style="padding-top:8px">🎯 <b>Misje dzienne</b> — komplet: <b>+${BALANCE.missionSetBonus} ✨ pyłu</b>${allDone ? ' ✅' : ''}</div>`
    + missions.map((m, i) => {
      const mt = MISSION_TYPES.find(t => t.id === m.type);
      const prog = missionProgress(m);
      const done = prog >= m.target;
      const pct = Math.round(prog / m.target * 100);
      return `<div class="item ${m.claimed ? 'bought' : done ? 'ready' : ''}" data-mission="${i}">
        <div class="icon">${mt.icon}</div>
        <div class="info">
          <div class="name">${mt.desc(m.target)}</div>
          <div class="mbar"><div class="mfill" style="width:${pct}%"></div></div>
          <div class="desc">${fmt(prog)} / ${fmt(m.target)}</div>
        </div>
        <div class="right"><div class="cost">${m.claimed ? '✅' : done ? '🎁 Odbierz!' : fmt(missionReward()) + ' 💎'}</div></div>
      </div>`;
    }).join('');
}

function renderBonus(p) {
  p.innerHTML = renderMissions() + `
    <div class="note" style="padding-top:8px">🎁 <b>Bonus dzienny</b> — seria: ${S.loginStreak} ${S.loginStreak === 1 ? 'dzień' : 'dni'}</div>
    <button class="bigBtn" id="dailyBtn" ${S.dailyClaimed ? 'disabled' : ''}>
      ${S.dailyClaimed ? '✅ Odebrano — wróć jutro!' : `🎁 Odbierz ${fmt(dailyReward())} 💎`}
    </button>
    <div class="note">⚡ <b>Boost reklamowy</b> — obejrzyj reklamę, aby podwoić produkcję na ${Math.round(boostDuration())} s</div>
    <button class="bigBtn gold" id="adBoostBtn" ${now() < S.boostUntil ? 'disabled' : ''}>
      ${now() < S.boostUntil ? `⚡ Boost aktywny (${Math.ceil((S.boostUntil - now()) / 1000)}s)` : `🎬 Obejrzyj reklamę → Boost ×${BALANCE.adBoostMult}`}
    </button>
    <div class="note">📊 <b>Statystyki</b></div>
    <div class="statGrid">
      <div class="stat"><div class="v">${fmt(S.allTimeEarned)} 💎</div><div class="k">wydobyto od początku</div></div>
      <div class="stat"><div class="v">${fmt(S.totalEarned)} 💎</div><div class="k">w tej rundzie</div></div>
      <div class="stat"><div class="v">${fmt(S.bestCps || 0)}/s</div><div class="k">rekord produkcji</div></div>
      <div class="stat"><div class="v">${fmtTime(S.playSeconds || 0)}</div><div class="k">czas gry</div></div>
      <div class="stat"><div class="v">${fmt(S.totalClicks)}</div><div class="k">kliknięcia</div></div>
      <div class="stat"><div class="v">${totalBuildings(S)}</div><div class="k">budynki</div></div>
      <div class="stat"><div class="v">${S.totalUpgradesBought || 0}</div><div class="k">kupione ulepszenia</div></div>
      <div class="stat"><div class="v">${S.cometsCaught}</div><div class="k">złapane komety</div></div>
      <div class="stat"><div class="v">✨ ${fmt(S.totalStardustEarned || 0)}</div><div class="k">pył zdobyty łącznie</div></div>
      <div class="stat"><div class="v">🌟 ${talentLevelsTotal()}</div><div class="k">poziomy talentów</div></div>
      <div class="stat"><div class="v">${S.prestigeCount}</div><div class="k">prestiże</div></div>
      <div class="stat"><div class="v">${Object.keys(S.achievements).length}/${ACHIEVEMENTS.length}</div><div class="k">osiągnięcia</div></div>
      <div class="stat"><div class="v">🧭 ${S.expeditionsDone || 0}</div><div class="k">ukończone wyprawy</div></div>
      <div class="stat"><div class="v">🏺 ${artifactCount()}/${ARTIFACTS.length}</div><div class="k">artefakty</div></div>
      <div class="stat"><div class="v">⚔️ ${S.bossesKilled || 0}</div><div class="k">pokonani bossowie</div></div>
      <div class="stat"><div class="v">📅 ${S.loginStreak}</div><div class="k">seria logowań (dni)</div></div>
      <div class="stat"><div class="v">🧪 ${researchDoneCount()}/${RESEARCH.length}</div><div class="k">ukończone badania</div></div>
      <div class="stat"><div class="v">🎯 ${S.missionsCompleted || 0}</div><div class="k">wykonane misje</div></div>
    </div>
    <div class="note">💾 <b>Kopia zapasowa</b> — przenieś postęp na inny telefon</div>
    <div class="saveBtns">
      <button class="bigBtn" id="exportBtn">📤 Eksportuj</button>
      <button class="bigBtn" id="importBtn">📥 Importuj</button>
    </div>`;
  const d = $('#dailyBtn');
  if (d && !S.dailyClaimed) d.onclick = () => {
    const r = claimDaily();
    if (r > 0) { toast(`🎁 Bonus dzienny: +${fmt(r)} 💎 (seria: ${S.loginStreak} dni)`); Sound.claim(); }
    renderPanel();
  };
  const a = $('#adBoostBtn');
  if (a && now() >= S.boostUntil) a.onclick = adBoost;
  p.querySelectorAll('[data-mission]').forEach(el => el.onclick = () => {
    const res = claimMission(Number(el.dataset.mission));
    if (res) {
      toast(res.setDone
        ? `🎯 Komplet misji dnia! +${fmt(res.reward)} 💎 i +${BALANCE.missionSetBonus} ✨ pyłu!`
        : `🎯 Misja wykonana! +${fmt(res.reward)} 💎`);
      if (res.setDone) spawnConfetti(24);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      Sound.claim();
      renderPanel();
    }
  });
  const ex = $('#exportBtn'); if (ex) ex.onclick = showExportOverlay;
  const im = $('#importBtn'); if (im) im.onclick = showImportOverlay;
}

// ---------- Klikanie asteroidy ----------
function spawnParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'particle';
    s.textContent = Math.random() < 0.3 ? '💎' : '✦';
    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    s.style.cssText = `left:${x}px;top:${y}px;`
      + `--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 30}px;`
      + `--rot:${Math.random() * 360 - 180}deg`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
}

function onTap(e) {
  let p = clickPower();
  const crit = Math.random() < critChance(); // talent Złoty dotyk
  if (crit) p *= 10;
  earn(p);
  S.totalClicks++;
  missionBump('clicks');
  if (navigator.vibrate) navigator.vibrate(crit ? 40 : 12);
  if (crit) Sound.crit(); else Sound.click();
  const ast = $('#asteroid');
  ast.classList.remove('pulse'); void ast.offsetWidth;
  ast.classList.add('pulse');
  const x = (e.touches ? e.touches[0].clientX : e.clientX) || window.innerWidth / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) || window.innerHeight / 3;
  spawnParticles(x, y, crit ? 10 : 3);
  if (crit) {
    document.body.classList.remove('shake'); void document.body.offsetWidth;
    document.body.classList.add('shake');
  }
  const f = document.createElement('div');
  f.className = 'floatNum' + (crit ? ' crit' : '');
  f.textContent = (crit ? 'KRYT! +' : '+') + fmt(p);
  f.style.left = (x - 20 + (Math.random() * 40 - 20)) + 'px';
  f.style.top = (y - 30) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

// ---------- Złota kometa ----------
function scheduleComet() {
  const delay = (BALANCE.cometMinDelay + Math.random() * (BALANCE.cometMaxDelay - BALANCE.cometMinDelay))
    * cometDelayMult(); // talent Magnes komet
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
    missionBump('comets');
    if (Math.random() < 0.5) {
      const reward = Math.max(100, totalCps() * 90);
      earn(reward);
      toast(`☄️ Złota kometa! +${fmt(reward)} 💎`);
    } else {
      S.frenzyUntil = now() + BALANCE.frenzySeconds * 1000;
      toast(`☄️ SZAŁ WYDOBYCIA! Produkcja ×${BALANCE.frenzyMult} przez ${BALANCE.frenzySeconds} sekund!`);
    }
    if (navigator.vibrate) navigator.vibrate(60);
    Sound.comet();
    save();
    scheduleComet();
  };
}

// ---------- Eventy losowe: deszcz meteorytów i gorączka kryształowa ----------
function scheduleRandomEvent() {
  const delay = BALANCE.eventMinDelay + Math.random() * (BALANCE.eventMaxDelay - BALANCE.eventMinDelay);
  setTimeout(() => {
    if (Math.random() < 0.5) startMeteorShower(); else startCrystalFever();
    scheduleRandomEvent();
  }, delay * 1000);
}

function startCrystalFever() {
  S.feverUntil = now() + BALANCE.feverSeconds * 1000;
  toast(`💥 GORĄCZKA KRYSZTAŁOWA! Klikanie ×${BALANCE.feverMult} przez ${BALANCE.feverSeconds} sekund!`);
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  save();
}

function startMeteorShower() {
  toast('🌠 DESZCZ METEORYTÓW! Łap spadające meteory!');
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  for (let i = 0; i < BALANCE.meteorCount; i++) {
    setTimeout(spawnMeteor, i * 600 + Math.random() * 300);
  }
}

function spawnMeteor() {
  const m = document.createElement('div');
  m.className = 'meteor';
  m.textContent = '🪨';
  m.style.left = (5 + Math.random() * 85) + 'vw';
  m.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
  m.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    const reward = Math.max(50, totalCps() * 15 + clickPower() * 5);
    earn(reward);
    if (navigator.vibrate) navigator.vibrate(25);
    Sound.meteor();
    spawnParticles(ev.clientX, ev.clientY, 5);
    const f = document.createElement('div');
    f.className = 'floatNum';
    f.textContent = '+' + fmt(reward);
    f.style.left = ev.clientX - 20 + 'px';
    f.style.top = ev.clientY - 30 + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1000);
    m.remove();
  });
  document.body.appendChild(m);
  setTimeout(() => m.remove(), 4500);
}

// ---------- Bossowie ----------
let boss = null; // { def, hp, maxHp, end, timer } — walka jest ulotna (nie zapisujemy)

function scheduleBoss() {
  const delay = BALANCE.bossMinDelay + Math.random() * (BALANCE.bossMaxDelay - BALANCE.bossMinDelay);
  setTimeout(spawnBoss, delay * 1000);
}

function spawnBoss() {
  if (boss) { scheduleBoss(); return; }
  const def = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  boss = { def, maxHp: bossMaxHp(), hp: bossMaxHp(), end: now() + BALANCE.bossTime * 1000 };
  $('#asteroid').style.display = 'none';
  const box = document.createElement('div');
  box.id = 'bossBox';
  box.innerHTML = `
    <div class="bossName">⚔️ ${def.name}</div>
    <div class="bossBar"><div class="bossHp" id="bossHp"></div></div>
    <div class="bossBar timer"><div class="bossTimer" id="bossTimer"></div></div>
    <div class="bossFace" id="bossFace">${def.icon}</div>
    <div class="note">Klikaj, aby zadawać obrażenia!</div>`;
  $('#tapArea').appendChild(box);
  const face = $('#bossFace');
  face.addEventListener('touchstart', e => { e.preventDefault(); hitBoss(e); }, { passive: false });
  face.addEventListener('mousedown', e => { if (!('ontouchstart' in window)) hitBoss(e); });
  toast(`⚔️ ${def.name} nadlatuje! Masz ${BALANCE.bossTime} sekund!`);
  Sound.alarm();
  if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
  boss.timer = setInterval(updateBossBars, 100);
  updateBossBars();
}

function updateBossBars() {
  if (!boss) return;
  const hpEl = $('#bossHp'), tEl = $('#bossTimer');
  if (hpEl) hpEl.style.width = Math.max(0, boss.hp / boss.maxHp * 100) + '%';
  if (tEl) tEl.style.width = Math.max(0, (boss.end - now()) / (BALANCE.bossTime * 1000) * 100) + '%';
  if (now() >= boss.end && boss.hp > 0) endBoss(false);
}

function hitBoss(e) {
  if (!boss) return;
  let dmg = clickPower();
  const crit = Math.random() < critChance();
  if (crit) dmg *= 10;
  boss.hp -= dmg;
  S.totalClicks++;
  missionBump('clicks');
  Sound.hit();
  if (navigator.vibrate) navigator.vibrate(crit ? 40 : 15);
  const x = (e.touches ? e.touches[0].clientX : e.clientX) || window.innerWidth / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) || window.innerHeight / 3;
  spawnParticles(x, y, crit ? 8 : 2);
  const f = document.createElement('div');
  f.className = 'floatNum' + (crit ? ' crit' : '');
  f.textContent = (crit ? 'KRYT! −' : '−') + fmt(dmg);
  f.style.left = (x - 20) + 'px';
  f.style.top = (y - 30) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
  const face = $('#bossFace');
  if (face) { face.classList.remove('hurt'); void face.offsetWidth; face.classList.add('hurt'); }
  updateBossBars();
  if (boss.hp <= 0) endBoss(true);
}

function endBoss(won) {
  if (!boss) return;
  clearInterval(boss.timer);
  const name = boss.def.name;
  boss = null;
  const box = $('#bossBox');
  if (box) box.remove();
  $('#asteroid').style.display = '';
  if (won) {
    const res = grantBossWin();
    let html = `<h2>⚔️ ${name} pokonany!</h2>
      <p><b style="font-size:22px;color:#8ff5ff">+${fmt(res.loot)} 💎</b><br>
      <b style="color:#ffd76e">+${res.dust} ✨ pyłu</b>`;
    if (res.artifact && res.duplicate) html += `<br><br>${res.artifact.icon} <b>${res.artifact.name}</b> — duplikat! +${BALANCE.duplicateDust} ✨`;
    else if (res.artifact) html += `<br><br>Boss upuścił artefakt:<br><span style="font-size:34px">${res.artifact.icon}</span><br><b>${res.artifact.name}</b>!`;
    html += `</p><button class="bigBtn gold" onclick="hideOverlay()">Zwycięstwo! 🎉</button>`;
    showOverlay(html);
    Sound.fanfare();
    spawnConfetti(26);
    if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 120]);
  } else {
    const loot = grantBossFail();
    toast(`💨 ${name} odleciał... Nagroda pocieszenia: +${fmt(loot)} 💎`);
    Sound.lose();
  }
  scheduleBoss();
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

// ---------- Samouczek ----------
const TUTORIAL_STEPS = [
  { text: '👆 Klikaj w asteroidę, aby wydobywać kryształy!', done: () => S.totalClicks >= 10 },
  { text: '⛏️ Super! Kup pierwszego Astro-górnika w zakładce Kopalnia.', done: () => totalBuildings(S) >= 1, glow: 'mine' },
  { text: '🤖 Maszyny kopią same! Kup teraz ulepszenie w zakładce Ulepszenia (potrzeba 100 💎).', done: () => (S.totalUpgradesBought || 0) >= 1, glow: 'upgrades' },
  { text: '🎉 Świetnie Ci idzie! Zaglądaj do misji 🎁, wysyłaj wyprawy 🪐 i wracaj codziennie po bonusy!', done: null },
];

let lastCoachStep = -1;

function updateTutorial() {
  const coach = $('#coach');
  if (S.tutorialStep >= TUTORIAL_STEPS.length || S.tutorialStep === 99) {
    if (coach.style.display !== 'none') {
      coach.style.display = 'none';
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('glow'));
    }
    return;
  }
  const step = TUTORIAL_STEPS[S.tutorialStep];
  if (step.done && step.done()) {
    S.tutorialStep++;
    Sound.claim();
    save();
    return;
  }
  if (lastCoachStep !== S.tutorialStep) {
    lastCoachStep = S.tutorialStep;
    coach.style.display = 'flex';
    $('#coachText').textContent = step.text;
    const isLast = S.tutorialStep === TUTORIAL_STEPS.length - 1;
    $('#coachBtn').textContent = isLast ? '✅ OK!' : '✖';
    $('#coachBtn').onclick = () => { S.tutorialStep = 99; save(); updateTutorial(); };
    document.querySelectorAll('nav button').forEach(b =>
      b.classList.toggle('glow', !!step.glow && b.dataset.tab === step.glow));
  }
}

// ---------- Kopia zapasowa (eksport/import) ----------
function showExportOverlay() {
  const code = exportSave();
  showOverlay(`
    <h2>📤 Eksport zapisu</h2>
    <p>Skopiuj poniższy kod i schowaj w bezpiecznym miejscu<br>(np. w notatkach):</p>
    <textarea class="saveArea" id="exportArea" readonly>${code}</textarea>
    <button class="bigBtn" id="copySaveBtn">📋 Skopiuj do schowka</button>
    <button class="bigBtn" onclick="hideOverlay()">Zamknij</button>`);
  $('#copySaveBtn').onclick = () => {
    const area = $('#exportArea');
    area.select();
    const done = () => toast('📋 Zapis skopiowany do schowka!');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, () => { document.execCommand('copy'); done(); });
    } else { document.execCommand('copy'); done(); }
  };
}

function showImportOverlay() {
  showOverlay(`
    <h2>📥 Import zapisu</h2>
    <p>Wklej kod zapisu. <b>Uwaga:</b> obecny postęp zostanie nadpisany!</p>
    <textarea class="saveArea" id="importArea" placeholder="Wklej kod tutaj..."></textarea>
    <button class="bigBtn gold" id="doImportBtn">📥 Wczytaj zapis</button>
    <button class="bigBtn" onclick="hideOverlay()">Anuluj</button>`);
  $('#doImportBtn').onclick = () => {
    if (importSave($('#importArea').value)) {
      hideOverlay();
      checkDaily();
      renderHeader();
      renderPanel();
      toast('✅ Zapis wczytany pomyślnie!');
      Sound.fanfare();
    } else {
      toast('❌ Nieprawidłowy kod zapisu!');
    }
  };
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

// ---------- Tło: gwiazdy w 3 warstwach + błyski + pył kosmiczny ----------
function makeStars() {
  const wrap = $('#stars');
  wrap.innerHTML = '';
  const colors = ['#ffffff', '#ffffff', '#ffffff', '#9adcff', '#ffe9a8', '#ffc8e0'];
  const layers = [
    { n: 55, min: 1.0, max: 1.6, cls: 'l1' }, // dalekie, drobne
    { n: 26, min: 1.8, max: 2.6, cls: 'l2' }, // średnie
    { n: 9,  min: 2.8, max: 3.6, cls: 'l3' }, // bliskie, z poświatą
  ];
  for (const L of layers) {
    const layer = document.createElement('div');
    layer.className = 'starLayer ' + L.cls;
    for (let i = 0; i < L.n; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = L.min + Math.random() * (L.max - L.min);
      const c = colors[Math.floor(Math.random() * colors.length)];
      s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;`
        + `background:${c};animation-duration:${2 + Math.random() * 3}s;animation-delay:${Math.random() * 3}s;`
        + (size > 2.6 ? `box-shadow:0 0 ${Math.round(size * 3)}px ${c};` : '');
      layer.appendChild(s);
    }
    wrap.appendChild(layer);
  }
  // gwiazdy-błyski (krzyżyki)
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('div');
    s.className = 'sparkStar';
    s.textContent = '✦';
    s.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;`
      + `font-size:${7 + Math.random() * 6}px;animation-delay:${Math.random() * 5}s;`
      + `color:${colors[Math.floor(Math.random() * colors.length)]}`;
    wrap.appendChild(s);
  }
  // pyłki unoszące się ku górze
  for (let i = 0; i < 12; i++) {
    const d = document.createElement('div');
    d.className = 'dust';
    d.style.cssText = `left:${Math.random() * 100}vw;`
      + `animation-duration:${18 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s;`;
    wrap.appendChild(d);
  }
}

// Spadająca gwiazda przecina tło co kilkanaście sekund.
function scheduleShootingStar() {
  setTimeout(() => {
    const s = document.createElement('div');
    s.className = 'shootingStar';
    s.style.left = (40 + Math.random() * 55) + 'vw';
    s.style.top = (Math.random() * 30) + 'vh';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
    scheduleShootingStar();
  }, (6 + Math.random() * 14) * 1000);
}
