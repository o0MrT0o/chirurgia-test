'use strict';
/* =====================================================================
   UI.JS — cały wygląd: nagłówek, zakładki, panele, efekty, kometa.
   Logika gry jest w logic.js — tutaj tylko rysowanie i obsługa dotyku.
   ===================================================================== */

// ---------- Nagłówek ----------
// Optymalizacja: struktura licznika budowana raz, potem aktualizujemy tylko
// tekst (tanie textContent zamiast przebudowy innerHTML 10×/s); pozostałe
// pola i chipy zapisujemy do DOM wyłącznie, gdy realnie się zmieniły.
let _hdrReady = false, _lastCps = '', _lastDust = '', _lastBoost = '', _lastCrStr = '';
let cachedClick = 1; // buforowana moc kliku (odświeżana w renderHeader ~10×/s)
let dispCrystals = 0; // wyświetlana liczba kryształów (płynnie „nabija się” do S.crystals)
function renderHeader() {
  if (!_hdrReady) {
    $('#crystalCount').innerHTML = '<span id="crAmt"></span> <span class="unit">💎</span>';
    _hdrReady = true;
    dispCrystals = S.crystals;
  }
  // Płynny licznik: zbliżaj wyświetlaną wartość do rzeczywistej (jak w topowych idle).
  // Duży skok (zarobki offline, prestiż) ustawiamy od razu, drobne przyrosty animujemy.
  const diff = S.crystals - dispCrystals;
  if (Math.abs(diff) < 0.5 || Math.abs(diff) > dispCrystals * 0.5 + 1e6) dispCrystals = S.crystals;
  else dispCrystals += diff * 0.28;
  const crStr = fmt(dispCrystals);
  if (crStr !== _lastCrStr) { $('#crAmt').textContent = crStr; _lastCrStr = crStr; }

  cachedClick = clickPower();       // bufor: onTap/hitBoss nie przeliczają tego per klik
  const cps = t('cpsLabel', fmt(totalCps()), fmt(cachedClick));
  if (cps !== _lastCps) { $('#cpsLabel').textContent = cps; _lastCps = cps; }

  const dust = (S.stardust > 0 || talentLevelsTotal() > 0)
    ? t('dustLabel', fmt(S.stardust), talentLevelsTotal()) : '';
  if (dust !== _lastDust) { $('#stardustLabel').textContent = dust; _lastDust = dust; }

  const chips = [];
  if (now() < S.frenzyUntil) chips.push(`<span class="boostChip gold">${t('chipFrenzy', BALANCE.frenzyMult, Math.ceil((S.frenzyUntil - now()) / 1000))}</span>`);
  if (now() < S.feverUntil) chips.push(`<span class="boostChip gold">${t('chipFever', BALANCE.feverMult, Math.ceil((S.feverUntil - now()) / 1000))}</span>`);
  if (now() < S.boostUntil) chips.push(`<span class="boostChip">${t('chipBoost', BALANCE.adBoostMult, Math.ceil((S.boostUntil - now()) / 1000))}</span>`);
  const bhtml = chips.join('');
  if (bhtml !== _lastBoost) { $('#boostBar').innerHTML = bhtml; _lastBoost = bhtml; }

  // Klimatyczna poświata na krawędziach ekranu podczas szału/gorączki.
  document.body.classList.toggle('frenzyOn', now() < S.frenzyUntil);
  document.body.classList.toggle('feverOn', now() < S.feverUntil);
}

// Pomija przebudowę panelu, gdy wygenerowana treść jest identyczna jak
// ostatnio (unika kosztownego parsowania HTML i ponownego podłączania zdarzeń).
let _panelSig = '';
function panelUnchanged(content) {
  const sig = activeTab + '|' + content;
  if (sig === _panelSig) return true;
  _panelSig = sig;
  return false;
}

// ---------- Zakładki ----------
let activeTab = 'mine';
let wheelDeg = 0;          // skumulowany obrót koła (utrzymuje pozycję między odświeżeniami)
let wheelSpinning = false; // trwa animacja kręcenia? (blokuje odświeżanie panelu)

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
  if (lastPanelTab !== activeTab) _panelSig = ''; // zmiana zakładki: wymuś przerysowanie
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

// ---------- Efekty na wielkie momenty ----------
// Krótki błysk całego ekranu (kamień milowy, boss itp.).
function screenFlash(color = '#ffffff', dur = 500) {
  const f = document.createElement('div');
  f.className = 'screenFx';
  f.style.background = `radial-gradient(circle at 50% 40%, ${color}, transparent 70%)`;
  document.body.appendChild(f);
  if (f.animate) f.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: dur, easing: 'ease-out' });
  setTimeout(() => f.remove(), dur + 60);
}

// Szybki „pop” elementu po zakupie — daje satysfakcję dotyku.
function flashEl(el) {
  if (!el || !el.animate) return;
  el.animate(
    [{ transform: 'scale(1)', filter: 'brightness(1)' },
     { transform: 'scale(1.04)', filter: 'brightness(1.6)', offset: 0.35 },
     { transform: 'scale(1)', filter: 'brightness(1)' }],
    { duration: 260, easing: 'ease-out' });
}

// Cutscena prestiżu — rozbłysk supernowej z falą uderzeniową.
function prestigeCutscene() {
  const wrap = document.createElement('div');
  wrap.className = 'prestigeFx';
  wrap.innerHTML = '<div class="pfCore"></div><div class="pfRing"></div>';
  document.body.appendChild(wrap);
  const core = wrap.querySelector('.pfCore'), ring = wrap.querySelector('.pfRing');
  if (core.animate) {
    core.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 1100, easing: 'ease-out' });
    ring.animate([{ transform: 'scale(0)', opacity: 0.9 }, { transform: 'scale(6)', opacity: 0 }], { duration: 1100, easing: 'ease-out' });
  }
  setTimeout(() => wrap.remove(), 1200);
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
        <div class="note" style="padding-top:8px">${t('expDone', pl.icon, nm(pl))}</div>
        <button class="bigBtn gold" id="claimExpBtn">${t('expClaim', fmt(expeditionLoot(pl)))}</button>`;
    } else {
      topHtml = `
        <div class="note" style="padding-top:8px">${t('expEnRoute', pl.icon, nm(pl))}</div>
        <div class="mbar" style="height:10px"><div class="mfill" style="width:${pct}%"></div></div>
        <div class="note">${t('expReturn', fmtCountdown(remaining))}</div>
        <button class="bigBtn gold" id="rushExpBtn">${t('watchRush', BALANCE.rushMinutes)}</button>`;
    }
  } else {
    topHtml = `<div class="note" style="padding-top:8px">${t('expIntro', BALANCE.artifactBonus * 100)}</div>`
      + PLANETS.map(pl => {
        const unlocked = planetUnlocked(pl);
        const time = durStr(pl.hours);
        return `<div class="item ${unlocked ? '' : 'locked'}" ${unlocked ? `data-planet="${pl.id}"` : ''}>
          <div class="icon">${pl.icon}</div>
          <div class="info">
            <div class="name">${nm(pl)} <span class="qty">${time}</span></div>
            <div class="desc">${unlocked
              ? t('expLoot', fmt(expeditionLoot(pl)), Math.round(pl.artChance * 100))
              : t('expNeed', fmt(pl.unlockEarned))}</div>
          </div>
          <div class="right"><div class="cost">${unlocked ? t('send') : ''}</div></div>
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
      ? `<div class="note branchHead">${t('labHead')}</div>
         <div class="note">${t('labResearchDone', r.icon, nm(r))}</div>
         <button class="bigBtn gold" id="claimResBtn">${t('labClaim', ds(r))}</button>`
      : `<div class="note branchHead">${t('labHead')}</div>
         <div class="note">${t('labInProgress', r.icon, nm(r), ds(r))}</div>
         <div class="mbar" style="height:10px"><div class="mfill" style="width:${pct}%"></div></div>
         <div class="note">${t('labEnd', fmtCountdown(remaining))}</div>
         <button class="bigBtn gold" id="rushResBtn">${t('watchRush', BALANCE.rushMinutes)}</button>`;
  } else {
    const next = RESEARCH.filter(r => !isResearchDone(r.id) && researchUnlocked(r));
    const locked = RESEARCH.filter(r => !isResearchDone(r.id) && !researchUnlocked(r));
    labHtml = `<div class="note branchHead">${t('labHeadCount', researchDoneCount(), RESEARCH.length)}</div>`
      + (next.length === 0 && locked.length === 0
        ? `<div class="note">${t('labAllDone')}</div>`
        : next.map(r => {
            const can = S.crystals >= r.cost;
            const time = durStr(r.hours);
            return `<div class="item ${can ? '' : 'locked'}" data-research="${r.id}">
              <div class="icon">${r.icon}</div>
              <div class="info">
                <div class="name">${nm(r)} <span class="qty">${time}</span></div>
                <div class="desc">${ds(r)}</div>
              </div>
              <div class="right"><div class="cost ${can ? '' : 'cant'}">${fmt(r.cost)} 💎</div></div>
            </div>`;
          }).join('')
          + (locked.length ? `<div class="note">${t('labQueue', locked.length)}</div>` : ''));
  }

  const artHtml = `<div class="note">${t('artHead', artifactCount(), ARTIFACTS.length, Math.round(artifactCount() * BALANCE.artifactBonus * 100), BALANCE.duplicateDust)}</div>
    <div class="artGrid">${ARTIFACTS.map(a =>
      `<div class="art ${S.artifacts[a.id] ? 'owned' : ''}" title="${nm(a)}">
        <div class="ai">${S.artifacts[a.id] ? a.icon : '❔'}</div>
        <div class="an">${S.artifacts[a.id] ? nm(a) : '???'}</div>
      </div>`).join('')}</div>`;

  const expContent = topHtml + labHtml + artHtml;
  if (panelUnchanged(expContent)) return;
  p.innerHTML = expContent;

  p.querySelectorAll('[data-research]').forEach(el => el.onclick = () => {
    const r = RESEARCH.find(x => x.id === el.dataset.research);
    if (startResearch(el.dataset.research)) {
      toast(t('resStarted', nm(r), durStr(r.hours)));
      Sound.buy();
      buzz(30);
      renderPanel();
    }
  });
  const claimRes = $('#claimResBtn');
  if (claimRes) claimRes.onclick = () => {
    const r = claimResearch();
    if (!r) return;
    showOverlay(`<h2>${t('resDoneTitle')}</h2>
      <p><span style="font-size:34px">${r.icon}</span><br><b>${nm(r)}</b><br>
      ${t('resPermaEff')} <b style="color:#8ff5ff">${ds(r)}</b></p>
      <button class="bigBtn gold" onclick="hideOverlay(); renderPanel()">${t('eureka')}</button>`);
    Sound.fanfare();
    buzz([40, 60, 40]);
  };
  const rushRes = $('#rushResBtn');
  if (rushRes) rushRes.onclick = () => Ads.showRewarded(() => {
    rushResearch();
    toast(t('resShortened', BALANCE.rushMinutes));
    renderPanel();
  });

  p.querySelectorAll('[data-planet]').forEach(el => el.onclick = () => {
    if (startExpedition(el.dataset.planet)) {
      const pl = PLANETS.find(x => x.id === el.dataset.planet);
      toast(t('expShip', nm(pl), durStr(pl.hours)));
      buzz(30);
      renderPanel();
    }
  });
  const claimBtn = $('#claimExpBtn');
  if (claimBtn) claimBtn.onclick = () => {
    const res = claimExpedition();
    if (!res) return;
    let html = `<h2>${t('lootTitle')}</h2><p><b style="font-size:22px;color:#8ff5ff">+${fmt(res.loot)} 💎</b>`;
    if (res.artifact && res.duplicate) html += `<br><br>${t('lootDup', res.artifact.icon, nm(res.artifact), res.dust)}`;
    else if (res.artifact) html += `<br><br>${t('lootArt')}<br><span style="font-size:34px">${res.artifact.icon}</span><br><b>${nm(res.artifact)}</b> ${t('lootArtBonus', BALANCE.artifactBonus * 100)}`;
    html += `</p><button class="bigBtn" onclick="hideOverlay(); renderPanel()">${t('awesome')}</button>`;
    showOverlay(html);
    if (res.artifact && !res.duplicate) spawnConfetti(22);
    buzz([40, 60, 40]);
    Sound.fanfare();
  };
  const rushBtn = $('#rushExpBtn');
  if (rushBtn) rushBtn.onclick = () => Ads.showRewarded(() => {
    rushExpedition();
    toast(t('expShortened', BALANCE.rushMinutes));
    renderPanel();
  });
}

// Ikona pozycji: grafika (sprite CC0) jeśli jest, inaczej emoji (fallback).
function iconHtml(item, cls) {
  if (item && item.sprite) return `<img class="sprite${cls ? ' ' + cls : ''}" src="${item.sprite}" alt="" decoding="async">`;
  return (item && item.icon) || '';
}

// ---------- Zakładka: Kopalnia ----------
let buyMode = 1; // 1 | 10 | 'max'

// „Żywa” hala produkcyjna: każdy posiadany typ budynku to animowana maszyna,
// która się kołysze i wypuszcza kryształy — widać, że kopalnia pracuje.
function renderMineScene() {
  const owned = BUILDINGS.filter(b => (S.buildings[b.id] || 0) > 0);
  if (!owned.length) return '';
  const tiles = owned.map((b, i) => {
    const count = S.buildings[b.id] || 0;
    const dur = (2.6 - Math.min(count, 40) * 0.03).toFixed(2);   // więcej sztuk = żwawiej
    const del = (i * 0.35).toFixed(2);
    return `<div class="machine" style="--d:${dur}s;--del:${del}s" title="${nm(b)}">
      <span class="mCryst">💎</span>
      <div class="mIco">${iconHtml(b, 'mSprite')}</div>
      <div class="mCount">×${count}</div>
    </div>`;
  }).join('');
  return `<div class="mineScene">${tiles}</div>`;
}

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
      <div class="icon">${iconHtml(b)}</div>
      <div class="info">
        <div class="name">${nm(b)}${shownQty > 1 ? ` <span class="qty">+${shownQty}</span>` : ''}</div>
        <div class="desc">${t('perSec', fmt(buildingCps(b) * globalMult()), count ? t('together') : t('gives', fmt(b.cps)))}</div>
      </div>
      <div class="right">
        <div class="cost ${can ? '' : 'cant'}">${fmt(cost)} 💎</div>
        <div class="owned">${count || ''}</div>
      </div>
    </div>`;
  }).join('');

  const mineContent = renderMineScene() + toggle + (rows || `<div class="note">${t('mineEmpty')}</div>`);
  if (panelUnchanged(mineContent)) return;
  p.innerHTML = mineContent;

  p.querySelectorAll('.buyToggle button').forEach(el => el.onclick = () => {
    buyMode = el.dataset.mode === 'max' ? 'max' : Number(el.dataset.mode);
    renderPanel();
  });
  p.querySelectorAll('[data-buy]').forEach(el => el.onclick = () => {
    const id = el.dataset.buy;
    if (buyBuilding(id, Number(el.dataset.qty))) {
      buzz(20);
      Sound.buy();
      renderPanel();
      flashEl(p.querySelector(`[data-buy="${id}"]`)); // „pop” kupionego wiersza
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
      <div class="icon">${iconHtml(u)}</div>
      <div class="info"><div class="name">${nm(u)}</div><div class="desc">${ds(u)}</div></div>
      <div class="right"><div class="cost ${can ? '' : 'cant'}">${fmt(u.cost)} 💎</div></div>
    </div>`;
  }).join('') || `<div class="note">${t('upgEmpty')}</div>`)
  + (bought.length ? `<div class="note">${t('upgBought', bought.length)}</div>` + bought.map(u =>
      `<div class="item bought"><div class="icon">${iconHtml(u)}</div>
       <div class="info"><div class="name">${nm(u)}</div><div class="desc">${ds(u)}</div></div>
       <div class="right">✅</div></div>`).join('') : '');
  p.querySelectorAll('[data-upg]').forEach(el => el.onclick = () => {
    const u = UPGRADES.find(x => x.id === el.dataset.upg);
    if (buyUpgrade(el.dataset.upg)) {
      toast(t('upgToast', nm(u)));
      buzz(30);
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
        ? tr('talentCost', cost)
        : tr('talentReq', nm(reqTalent), t.req.level);
      return `<div class="item ${maxed ? 'bought' : can ? '' : 'locked'}" data-talent="${t.id}">
        <div class="icon">${t.icon}</div>
        <div class="info">
          <div class="name">${nm(t)} <span class="qty">${lvl}/${t.max}</span></div>
          <div class="desc">${ds(t)}${lvl > 0 ? ` • ${tr('nowEff')}: <b>${effOf(t, lvl)}</b>` : ''}</div>
        </div>
        <div class="right"><div class="cost ${can || maxed ? '' : 'cant'}">${maxed ? tr('maxed') : status}</div></div>
      </div>`;
    }).join('');
    return `<div class="note branchHead">${branchName(br)}</div>` + rows;
  }).join('');

  p.innerHTML = `
    <div class="note" style="padding-top:10px">
      ${tr('prestigeIntro', fmt(S.totalEarned), fmt(gain))}
    </div>
    <button class="bigBtn gold" id="prestigeBtn" ${gain < 1 ? 'disabled' : ''}>
      ${gain >= 1 ? tr('prestigeBtn', fmt(gain)) : tr('prestigeLocked')}
    </button>
    <div class="note">${tr('talentTree', fmt(S.stardust), S.prestigeCount)}</div>
    ${treeHtml}`;

  const b = $('#prestigeBtn');
  if (b && gain >= 1) b.onclick = () => showOverlay(`
    <h2>${tr('prestigeSure')}</h2>
    <p>${tr('prestigeSureBody', fmt(gain))}</p>
    <button class="bigBtn gold" onclick="hideOverlay(); uiDoPrestige()">${tr('yesReset')}</button>
    <button class="bigBtn" onclick="hideOverlay()">${tr('notYet')}</button>`);

  p.querySelectorAll('[data-talent]').forEach(el => el.onclick = () => {
    const talent = TALENTS.find(x => x.id === el.dataset.talent);
    if (buyTalent(el.dataset.talent)) {
      toast(tr('talentToast', nm(talent), talentLevel(talent.id), effOf(talent, talentLevel(talent.id))));
      buzz(30);
      Sound.buy();
      renderPanel();
      flashEl(p.querySelector(`[data-talent="${talent.id}"]`));
    }
  });
}

function uiDoPrestige() {
  const gain = doPrestige();
  if (gain > 0) {
    prestigeCutscene();
    Sound.prestige();
    buzz([80, 50, 80, 50, 160]);
    setTimeout(() => { toast(t('prestigeDone', fmt(gain))); spawnConfetti(36); }, 350);
  }
  renderPanel();
}

// ---------- Zakładka: Sukcesy (skórki + osiągnięcia) ----------
function applySkin() {
  const ast = $('#asteroid');
  SKINS.forEach(s => ast.classList.remove(s.css));
  // Gdy gracz nie wybrał własnej skórki ('classic'), wygląd asteroidy nadaje
  // aktualny sektor; wybrana skórka zawsze ma pierwszeństwo (kosmetyka gracza).
  const styleId = (S.skin === 'classic') ? currentZone().style : S.skin;
  if (styleId !== 'classic') ast.classList.add('skin-' + styleId); // klasa daje kolor poświaty (--glow)
  // Rasteryzacja: kosztowny filtr SVG (feTurbulence + feDiffuseLighting)
  // liczony JEDEN RAZ do bitmapy. Usuwamy animacje SMIL — w <img> nadal by
  // działały i zmuszały do ponownego renderu filtra co klatkę. Wszystkie
  // detale (kratery, kryształy, tekstura) zostają; znika tylko pulsowanie.
  const svg = generateAsteroidSVG(styleId).replace(/<animate[^>]*>/g, '').replace(/<\/animate>/g, '');
  const img = new Image();
  img.decoding = 'async';
  img.alt = '';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  ast.replaceChildren(img);
  document.body.dataset.skin = styleId; // tło (poświata) dopasowuje się do wyglądu
}

function renderSkins() {
  return `<div class="note" style="padding-top:8px">${t('skinsHead', skinsOwnedCount(), SKINS.length, fmt(S.stardust))}</div>
    <div class="skinGrid">${SKINS.map(sk => {
      const owned = skinOwned(sk);
      const sel = S.skin === sk.id;
      const status = sel ? t('skinSelected')
        : owned ? t('skinTapSelect')
        : sk.cost ? t('skinBuy', sk.cost)
        : `🔒 ${skinCond(sk)}`;
      return `<div class="skinTile ${sel ? 'sel' : ''} ${owned || sk.cost ? '' : 'lockedSkin'}" data-skin="${sk.id}">
        <div class="skinPrev">${generateAsteroidSVG(sk.id, { lite: true })}</div>
        <div class="sn">${nm(sk)}</div>
        <div class="ss">${status}</div>
      </div>`;
    }).join('')}</div>`;
}

function renderAchievements(p) {
  const doneCount = Object.keys(S.achievements).length;
  p.innerHTML = renderSkins()
    + `<div class="note">${t('achHead', doneCount, ACHIEVEMENTS.length, BALANCE.achievementBonus * 100)}</div>`
    + ACHIEVEMENTS.map(a => `
      <div class="achv ${S.achievements[a.id] ? 'done' : ''}">
        <div class="icon">${a.icon}</div>
        <div><div class="t">${nm(a)}</div><div class="d">${ds(a)}</div></div>
      </div>`).join('');

  p.querySelectorAll('[data-skin]').forEach(el => el.onclick = () => {
    const sk = SKINS.find(x => x.id === el.dataset.skin);
    if (skinOwned(sk)) {
      if (selectSkin(sk.id)) {
        applySkin();
        toast(t('skinToast', nm(sk)));
        Sound.buy();
        renderPanel();
      }
    } else if (sk.cost) {
      if (buySkin(sk.id)) {
        selectSkin(sk.id);
        applySkin();
        toast(t('skinBuyToast', nm(sk), sk.cost));
        Sound.fanfare();
        buzz([40, 60, 40]);
        renderPanel();
      } else {
        toast(t('skinNeed', sk.cost, fmt(S.stardust)));
      }
    } else {
      toast(t('skinCond', skinCond(sk)));
    }
  });
}

// ---------- Zakładka: Bonusy ----------
function renderMissions() {
  const missions = S.dailyMissions.missions || [];
  if (!missions.length) return '';
  const allDone = missions.every(m => m.claimed);
  return `<div class="note" style="padding-top:8px">${t('misHead', BALANCE.missionSetBonus, allDone ? ' ✅' : '')}</div>`
    + missions.map((m, i) => {
      const mt = MISSION_TYPES.find(x => x.id === m.type);
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
        <div class="right"><div class="cost">${m.claimed ? '✅' : done ? t('misClaim') : fmt(missionReward()) + ' 💎'}</div></div>
      </div>`;
    }).join('');
}

// ---------- Koło Fortuny ----------
function buildWheelSVG() {
  const N = WHEEL.length, seg = 360 / N, R = 94;
  const pt = (ang, r) => [100 + Math.cos(ang * Math.PI / 180) * r, 100 + Math.sin(ang * Math.PI / 180) * r];
  let slices = '';
  for (let i = 0; i < N; i++) {
    const a0 = -90 + i * seg, a1 = -90 + (i + 1) * seg, am = -90 + (i + 0.5) * seg;
    const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), [lx, ly] = pt(am, R * 0.66);
    slices += `<path d="M 100 100 L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z"
      fill="${WHEEL[i].color}" stroke="#0b1026" stroke-width="1.5"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" font-size="19" text-anchor="middle">${WHEEL[i].icon}</text>`;
  }
  return `<div class="wheelWrap">
    <svg class="wheelSvg" id="wheelSvg" viewBox="0 0 200 200" style="transform:rotate(${wheelDeg}deg)">
      <circle cx="100" cy="100" r="97" fill="#0b1026"/>
      <g>${slices}</g>
      <circle cx="100" cy="100" r="97" fill="none" stroke="#6ee7ff55" stroke-width="3"/>
    </svg>
    <div class="wheelHub">🎰</div>
    <div class="wheelPointer"></div>
  </div>`;
}

function renderWheel() {
  const free = wheelFreeAvailable();
  const bonus = (S.freeSpins || 0) > 0 ? t('wheelBonusSpins', S.freeSpins) : '';
  return `<div class="note" style="padding-top:8px">${t('wheelHead', bonus)}</div>`
    + buildWheelSVG()
    + `<button class="bigBtn ${free ? 'gold' : ''}" id="wheelFreeBtn" ${free ? '' : 'disabled'}>
        ${free ? t('wheelSpinFree') : t('wheelUsed')}
      </button>
      <button class="bigBtn" id="wheelAdBtn">${t('wheelAd')}</button>`;
}

// Uruchom animację kręcenia; isFree = czy zużywamy darmowy los.
function spinWheel(isFree) {
  if (wheelSpinning) return;
  wheelSpinning = true;
  if (isFree) consumeFreeSpin();
  const k = pickWheelIndex();
  const segAngle = 360 / WHEEL.length;
  const targetMod = ((-(k + 0.5) * segAngle) % 360 + 360) % 360;
  let final = wheelDeg - (wheelDeg % 360) + targetMod;
  while (final < wheelDeg + 360 * 4) final += 360;      // min. 4 pełne obroty
  final += (Math.random() * 2 - 1) * (segAngle * 0.32); // wyląduj wyraźnie w segmencie
  wheelDeg = final;
  const svg = $('#wheelSvg');
  if (svg) svg.style.transform = `rotate(${final}deg)`;
  // wyłącz przyciski na czas kręcenia
  document.querySelectorAll('#wheelFreeBtn, #wheelAdBtn').forEach(b => b.disabled = true);
  buzz(20);
  setTimeout(() => {
    const seg = WHEEL[k];
    const res = grantWheelReward(seg);
    wheelSpinning = false;
    save();
    if (seg.kind === 'jackpot') spawnConfetti(44);
    else if (res.big) spawnConfetti(24);
    Sound.fanfare();
    buzz(res.big ? [60, 40, 60, 40, 120] : [40, 60, 40]);
    showOverlay(`<h2>${seg.icon} ${nm(seg)}</h2>
      <p><b style="font-size:20px;color:#8ff5ff">${res.text}</b></p>
      <button class="bigBtn gold" onclick="hideOverlay(); if (activeTab === 'bonus') renderPanel();">${t('awesome')} 🎉</button>`);
  }, 4600);
}

// Kalendarz nagród — czytelna siatka 7 dni z rosnącymi nagrodami.
function calRewardLabel(r) {
  if (r.kind === 'crystals') return fmt(calCrystals(r)) + ' 💎';
  if (r.kind === 'stardust') return '✨ ' + r.amount;
  if (r.kind === 'boost') return t('calBoost');
  if (r.kind === 'spin') return t('calSpin');
  return '';
}
function renderCalendar() {
  const idx = calIndex();
  const tiles = DAILY_REWARDS.map((r, i) => {
    let cls = 'future', st = '';
    if (i < idx || (i === idx && S.dailyClaimed)) { cls = 'done'; st = '✅'; }
    else if (i === idx) { cls = 'today'; st = t('calClaim'); }
    return `<div class="calTile ${cls}${r.day === 7 ? ' big' : ''}" ${cls === 'today' ? 'data-cal="1"' : ''}>
      <div class="calDay">${i === idx ? t('calToday') : t('calDay', r.day)}</div>
      <div class="calIco">${r.icon}</div>
      <div class="calRew">${calRewardLabel(r)}</div>
      <div class="calSt">${st}</div>
    </div>`;
  }).join('');
  return `<div class="note" style="padding-top:8px">${t('calHead', S.loginStreak, S.loginStreak === 1 ? t('dayS') : t('dayP'))}</div>
    <div class="calGrid">${tiles}</div>`;
}

function renderBonus(p) {
  const bonusContent = renderMissions() + renderWheel() + renderCalendar() + `
    <div class="note">${t('boostHead', Math.round(boostDuration()))}</div>
    <button class="bigBtn gold" id="adBoostBtn" ${now() < S.boostUntil ? 'disabled' : ''}>
      ${now() < S.boostUntil ? t('boostActive', Math.ceil((S.boostUntil - now()) / 1000)) : t('boostWatch', BALANCE.adBoostMult)}
    </button>
    <div class="note">${t('statsHead')}</div>
    <div class="statGrid">
      <div class="stat"><div class="v">${fmt(S.allTimeEarned)} 💎</div><div class="k">${t('stAllTime')}</div></div>
      <div class="stat"><div class="v">${fmt(S.totalEarned)} 💎</div><div class="k">${t('stRound')}</div></div>
      <div class="stat"><div class="v">${fmt(S.bestCps || 0)}/s</div><div class="k">${t('stBestCps')}</div></div>
      <div class="stat"><div class="v">${fmtTime(S.playSeconds || 0)}</div><div class="k">${t('stPlaytime')}</div></div>
      <div class="stat"><div class="v">${fmt(S.totalClicks)}</div><div class="k">${t('stClicks')}</div></div>
      <div class="stat"><div class="v">×${S.bestCombo || 0}</div><div class="k">${t('stBestCombo')}</div></div>
      <div class="stat"><div class="v">${totalBuildings(S)}</div><div class="k">${t('stBuildings')}</div></div>
      <div class="stat"><div class="v">${S.totalUpgradesBought || 0}</div><div class="k">${t('stUpgrades')}</div></div>
      <div class="stat"><div class="v">${S.cometsCaught}</div><div class="k">${t('stComets')}</div></div>
      <div class="stat"><div class="v">✨ ${fmt(S.totalStardustEarned || 0)}</div><div class="k">${t('stDust')}</div></div>
      <div class="stat"><div class="v">🌟 ${talentLevelsTotal()}</div><div class="k">${t('stTalents')}</div></div>
      <div class="stat"><div class="v">${S.prestigeCount}</div><div class="k">${t('stPrestige')}</div></div>
      <div class="stat"><div class="v">${Object.keys(S.achievements).length}/${ACHIEVEMENTS.length}</div><div class="k">${t('stAchv')}</div></div>
      <div class="stat"><div class="v">🧭 ${S.expeditionsDone || 0}</div><div class="k">${t('stExp')}</div></div>
      <div class="stat"><div class="v">🏺 ${artifactCount()}/${ARTIFACTS.length}</div><div class="k">${t('stArtifacts')}</div></div>
      <div class="stat"><div class="v">⚔️ ${S.bossesKilled || 0}</div><div class="k">${t('stBosses')}</div></div>
      <div class="stat"><div class="v">📅 ${S.loginStreak}</div><div class="k">${t('stStreak')}</div></div>
      <div class="stat"><div class="v">🧪 ${researchDoneCount()}/${RESEARCH.length}</div><div class="k">${t('stResearch')}</div></div>
      <div class="stat"><div class="v">🎯 ${S.missionsCompleted || 0}</div><div class="k">${t('stMissions')}</div></div>
    </div>
    <div class="note">${t('settingsHint')}</div>`;
  if (panelUnchanged(bonusContent)) return;
  p.innerHTML = bonusContent;
  const today = p.querySelector('.calTile[data-cal]');
  if (today) today.onclick = () => {
    const res = claimDaily();
    if (!res) return;
    let msg;
    if (res.kind === 'crystals') msg = t('calGotCrystals', res.day, fmt(res.amount));
    else if (res.kind === 'stardust') msg = t('calGotDust', res.amount);
    else if (res.kind === 'boost') msg = t('calGotBoost', BALANCE.adBoostMult);
    else msg = t('calGotSpin');
    toast(msg);
    Sound.claim();
    buzz([40, 60, 40]);
    if (res.day === 7) spawnConfetti(28); // wielka nagroda na koniec cyklu
    renderPanel();
  };
  const a = $('#adBoostBtn');
  if (a && now() >= S.boostUntil) a.onclick = adBoost;
  const wf = $('#wheelFreeBtn');
  if (wf && wheelFreeAvailable()) wf.onclick = () => spinWheel(true);
  const wa = $('#wheelAdBtn');
  if (wa) wa.onclick = () => Ads.showRewarded(() => spinWheel(false));
  p.querySelectorAll('[data-mission]').forEach(el => el.onclick = () => {
    const res = claimMission(Number(el.dataset.mission));
    if (res) {
      toast(res.setDone
        ? t('misSet', fmt(res.reward), BALANCE.missionSetBonus)
        : t('misOne', fmt(res.reward)));
      if (res.setDone) spawnConfetti(24);
      buzz([40, 60, 40]);
      Sound.claim();
      renderPanel();
    }
  });
}

// ---------- Klikanie asteroidy ----------
let _partN = 0, _floatN = 0; // limity elementów, by szybkie klikanie nie zapychało DOM
let combo = 0, comboEnd = 0; // stan kombosa klikania (sesyjny)

// Odświeża wskaźnik kombosa (pasek zaniku); wołane z pętli gry.
function refreshCombo() {
  const m = $('#comboMeter');
  if (!m) return;
  const left = comboEnd - now();
  if (left <= 0) { if (combo) combo = 0; m.classList.remove('show'); return; }
  if (combo < 3) { m.classList.remove('show'); return; } // pokazuj dopiero od ×3
  m.classList.add('show');
  const bonus = Math.round(Math.min(combo, BALANCE.comboMaxLevel) * BALANCE.comboBonusPer * 100);
  const el = $('#comboText'); if (el) el.innerHTML = `COMBO ×${combo} <b>+${bonus}%</b>`;
  const fill = $('#comboFill'); if (fill) fill.style.width = Math.max(0, left / BALANCE.comboWindowMs * 100) + '%';
}

// Celebracja przekroczenia kamienia milowego łącznego wydobycia.
// Przy dużym skoku (np. zarobki offline) świętujemy tylko NAJWYŻSZY nowy próg.
function checkMilestones() {
  let hit = 0;
  for (const m of MILESTONES) {
    if (S.allTimeEarned >= m && (S.lastMilestone || 0) < m) hit = m;
  }
  if (!hit) return;
  S.lastMilestone = hit;
  toast(t('milestoneToast', fmt(hit)));
  Sound.milestone();
  screenFlash('#ffe08a', 620);
  spawnConfetti(30);
  buzz([50, 60, 50]);
}

// Wskaźnik „następny cel" — aspiracyjny i stabilny (nie powtarza tego samego
// budynku): pierwszy typ budynku, którego jeszcze NIE masz; gdy masz wszystkie
// — następny kamień milowy.
let _lastGoal = '';
function updateGoal() {
  const g = $('#goalBar');
  if (!g) return;
  let html = '';
  const nb = BUILDINGS.find(b => (S.buildings[b.id] || 0) === 0);
  if (nb) {
    const visible = S.totalEarned >= nb.baseCost * 0.5;
    const cost = visible ? buildingCost(nb) : nb.baseCost * 0.5;
    const have = visible ? S.crystals : S.totalEarned;
    const pct = Math.min(100, have / cost * 100);
    html = t('goalBuilding', visible ? t('goalGet') : t('goalUnlock'), nm(nb), Math.floor(pct))
      + `<span class="goalTrack"><span class="goalFill" style="width:${pct.toFixed(1)}%"></span></span>`;
  } else {
    const next = MILESTONES.find(m => (S.lastMilestone || 0) < m);
    if (next) {
      const pct = Math.min(100, S.allTimeEarned / next * 100);
      html = t('goalMilestone', fmt(next), Math.floor(pct))
        + `<span class="goalTrack"><span class="goalFill" style="width:${pct.toFixed(1)}%"></span></span>`;
    }
  }
  if (html !== _lastGoal) { g.innerHTML = html; _lastGoal = html; }
}

// Znaczniki na zakładkach — czerwona kropka, gdy jest coś do zrobienia/odebrania.
// To klasyczny chwyt idle clickerów: gracz od razu widzi, gdzie czeka nagroda.
function badgeMine() {
  return BUILDINGS.some(b => {
    const visible = (S.buildings[b.id] || 0) > 0 || S.totalEarned >= b.baseCost * 0.5;
    return visible && S.crystals >= buildingCost(b);
  });
}
function badgeUpg() {
  return UPGRADES.some(u => !S.upgrades[u.id] && upgradeVisible(u) && S.crystals >= u.cost);
}
function badgeExp() {
  return (S.expedition && expeditionRemaining() <= 0) || (S.research && researchRemaining() <= 0);
}
function badgePrestige() {
  return TALENTS.some(t => talentUnlocked(t) && talentLevel(t.id) < t.max && S.stardust >= talentCost(t));
}
function badgeAchv() {
  return SKINS.some(sk => sk.cost && !skinOwned(sk) && S.stardust >= sk.cost);
}
function badgeBonus() {
  if (wheelFreeAvailable() || !S.dailyClaimed) return true;
  const ms = (S.dailyMissions.missions || []);
  return ms.some(m => !m.claimed && missionProgress(m) >= m.target);
}

const _badgeFns = { mine: badgeMine, upgrades: badgeUpg, exp: badgeExp, prestige: badgePrestige, achv: badgeAchv, bonus: badgeBonus };
let _badgeAt = 0;
function updateBadges() {
  // Znaczniki nie muszą odświeżać się 10×/s — ~3×/s wystarcza i oszczędza CPU
  // (każde wywołanie przechodzi po wszystkich budynkach/ulepszeniach/talentach).
  const nowT = now();
  if (nowT - _badgeAt < 320) return;
  _badgeAt = nowT;
  document.querySelectorAll('nav button').forEach(b => {
    const fn = _badgeFns[b.dataset.tab];
    b.classList.toggle('badge', !!(fn && fn()));
  });
}

// ---------- Strefy / sektory (progresja celu) ----------
// Sprawdza awans do kolejnego sektora i odświeża tabliczkę postępu.
function updateZone() {
  let entered = null, z;
  while ((z = advanceZone())) entered = z;   // duży skok (offline) może przeskoczyć kilka
  if (entered) onZoneEntered(entered);
  updateZonePlate();
}

function onZoneEntered(z) {
  applySkin();               // nowy wygląd asteroidy (gdy skórka = domyślna)
  Space.setTheme(z.theme);   // nowe tło/klimat
  Sound.milestone();
  screenFlash(z.flash, 700);
  zoneCutscene(z);
  buzz([60, 40, 60, 40, 120]);
  spawnConfetti(30);
  save();
}

// Efektowna zapowiedź nowego sektora (baner „NOWY SEKTOR").
function zoneCutscene(z) {
  const el = document.createElement('div');
  el.className = 'zoneFx';
  el.innerHTML = `<div class="zoneCard">
    <div class="zcIco">${z.icon}</div>
    <div class="zcTag">${t('zoneNew')}</div>
    <div class="zcName">${nm(z)}</div>
    <div class="zcBonus">${t('zoneBonusMsg', Math.round(ZONE_BONUS_PER * 100))}</div>
  </div>`;
  document.body.appendChild(el);
  const card = el.querySelector('.zoneCard');
  if (card.animate) card.animate(
    [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)', offset: 0.18 },
     { opacity: 1, transform: 'scale(1)', offset: 0.8 }, { opacity: 0, transform: 'scale(1.05)' }],
    { duration: 2300, easing: 'ease-out' });
  setTimeout(() => el.remove(), 2400);
}

let _lastZonePlate = '';
function updateZonePlate() {
  const el = $('#zonePlate');
  if (!el) return;
  const z = currentZone(), nz = nextZone();
  let pct = 100, max = '';
  if (nz) {
    const span = nz.reach - z.reach;
    pct = span > 0 ? Math.max(0, Math.min(100, (S.allTimeEarned - z.reach) / span * 100)) : 100;
  } else {
    max = t('zoneMax');
  }
  const html = `<span class="zpName">${z.icon} ${nm(z)}${max ? ` · ${max}` : ''}</span>`
    + `<span class="zoneTrack"><span class="zoneFill" style="width:${pct.toFixed(1)}%"></span></span>`;
  if (html !== _lastZonePlate) { el.innerHTML = html; _lastZonePlate = html; }
}

function spawnParticles(x, y, count) {
  if (_partN > 55) return; // nie mnóż w nieskończoność przy szybkim klikaniu
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
    _partN++;
    setTimeout(() => { s.remove(); _partN--; }, 700);
  }
}

function onTap(e) {
  let p = cachedClick;               // z bufora — bez kosztownego przeliczania per klik
  const crit = Math.random() < critChance(); // talent Złoty dotyk
  if (crit) p *= 10;
  // Kombos: szybkie klikanie buduje mnożnik (zanika po chwili bez kliknięć).
  combo = (now() < comboEnd) ? combo + 1 : 1;
  comboEnd = now() + BALANCE.comboWindowMs;
  if (combo > (S.bestCombo || 0)) S.bestCombo = combo;
  p *= 1 + Math.min(combo, BALANCE.comboMaxLevel) * BALANCE.comboBonusPer;
  earn(p);
  S.totalClicks++;
  missionBump('clicks');
  buzz(crit ? 40 : 12);
  if (crit) Sound.crit(); else Sound.click();
  // Impuls kliknięcia przez Web Animations API (bez wymuszania reflow
  // przez void offsetWidth) — skala + błysk, tanio i płynnie.
  const img = $('#asteroid').firstElementChild;
  if (img && img.animate) {
    img.animate(
      [{ transform: 'scale(1)' }, { transform: `scale(${crit ? 1.07 : 1.04})`, offset: 0.35 }, { transform: 'scale(1)' }],
      { duration: crit ? 220 : 150, easing: 'ease-out' });
  }
  const x = (e.touches ? e.touches[0].clientX : e.clientX) || window.innerWidth / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) || window.innerHeight / 3;
  spawnParticles(x, y, crit ? 10 : 3);
  if (crit && document.body.animate) {
    document.body.animate(
      [{ transform: 'translate(0,0)' }, { transform: 'translate(-5px,3px)' }, { transform: 'translate(4px,-3px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }],
      { duration: 300, easing: 'ease-in-out' });
  }
  if (_floatN < 24) {
    const f = document.createElement('div');
    f.className = 'floatNum' + (crit ? ' crit' : '');
    f.textContent = (crit ? t('critShort') + '+' : '+') + fmt(p);
    f.style.left = (x - 20 + (Math.random() * 40 - 20)) + 'px';
    f.style.top = (y - 30) + 'px';
    document.body.appendChild(f);
    _floatN++;
    setTimeout(() => { f.remove(); _floatN--; }, 1000);
  }
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
      toast(t('cometReward', fmt(reward)));
    } else {
      S.frenzyUntil = now() + BALANCE.frenzySeconds * 1000;
      toast(t('cometFrenzy', BALANCE.frenzyMult, BALANCE.frenzySeconds));
    }
    buzz(60);
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
  toast(t('feverToast', BALANCE.feverMult, BALANCE.feverSeconds));
  buzz([50, 50, 50]);
  save();
}

function startMeteorShower() {
  toast(t('meteorToast'));
  buzz([50, 50, 50]);
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
    buzz(25);
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
  const zp = $('#zonePlate'); if (zp) zp.style.display = 'none'; // nie zasłaniaj walki z bossem
  const box = document.createElement('div');
  box.id = 'bossBox';
  box.innerHTML = `
    <div class="bossName">⚔️ ${bossName(def)}</div>
    <div class="bossBar"><div class="bossHp" id="bossHp"></div></div>
    <div class="bossBar timer"><div class="bossTimer" id="bossTimer"></div></div>
    <div class="bossFace" id="bossFace">${def.icon}</div>
    <div class="note">${t('bossHit')}</div>`;
  $('#tapArea').appendChild(box);
  const face = $('#bossFace');
  face.addEventListener('touchstart', e => { e.preventDefault(); hitBoss(e); }, { passive: false });
  face.addEventListener('mousedown', e => { if (!('ontouchstart' in window)) hitBoss(e); });
  toast(t('bossIncoming', bossName(def), BALANCE.bossTime));
  Sound.alarm();
  buzz([80, 60, 80]);
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
  let dmg = cachedClick;
  const crit = Math.random() < critChance();
  if (crit) dmg *= 10;
  boss.hp -= dmg;
  S.totalClicks++;
  missionBump('clicks');
  Sound.hit();
  buzz(crit ? 40 : 15);
  const x = (e.touches ? e.touches[0].clientX : e.clientX) || window.innerWidth / 2;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) || window.innerHeight / 3;
  spawnParticles(x, y, crit ? 8 : 2);
  if (_floatN < 24) {
    const f = document.createElement('div');
    f.className = 'floatNum' + (crit ? ' crit' : '');
    f.textContent = (crit ? t('critMinus') : t('minus')) + fmt(dmg);
    f.style.left = (x - 20) + 'px';
    f.style.top = (y - 30) + 'px';
    document.body.appendChild(f);
    _floatN++;
    setTimeout(() => { f.remove(); _floatN--; }, 1000);
  }
  const face = $('#bossFace');
  if (face && face.animate) {
    face.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2)', offset: 0.5 }, { filter: 'brightness(1)' }], { duration: 150 });
  }
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
  const zp = $('#zonePlate'); if (zp) { zp.style.display = ''; _lastZonePlate = ''; } // przywróć tabliczkę sektora
  if (won) {
    const res = grantBossWin();
    const nameL = bossName({ name });
    let html = `<h2>${t('bossDefeated', nameL)}</h2>
      <p><b style="font-size:22px;color:#8ff5ff">+${fmt(res.loot)} 💎</b><br>
      <b style="color:#ffd76e">+${res.dust} ✨</b>`;
    if (res.artifact && res.duplicate) html += `<br><br>${t('bossDup', res.artifact.icon, nm(res.artifact), BALANCE.duplicateDust)}`;
    else if (res.artifact) html += `<br><br>${t('bossDrop')}<br><span style="font-size:34px">${res.artifact.icon}</span><br><b>${nm(res.artifact)}</b>!`;
    html += `</p><button class="bigBtn gold" onclick="hideOverlay()">${t('victory')}</button>`;
    showOverlay(html);
    Sound.fanfare();
    spawnConfetti(26);
    buzz([60, 40, 60, 40, 120]);
  } else {
    const loot = grantBossFail();
    toast(t('bossFledMsg', bossName({ name }), fmt(loot)));
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
    <h2>${t('welcomeBack')}</h2>
    <p>${t('offlineBody', fmt(pendingOffline))}</p>
    <button class="bigBtn gold" onclick="claimOffline(true)">${t('watchDouble')}</button>
    <button class="bigBtn" onclick="claimOffline(false)">${t('claimPlain')}</button>
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
  { text: () => t('tut1'), done: () => S.totalClicks >= 10 },
  { text: () => t('tut2'), done: () => totalBuildings(S) >= 1, glow: 'mine' },
  { text: () => t('tut3'), done: () => (S.totalUpgradesBought || 0) >= 1, glow: 'upgrades' },
  { text: () => t('tut4'), done: null },
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
    $('#coachText').textContent = step.text();
    const isLast = S.tutorialStep === TUTORIAL_STEPS.length - 1;
    $('#coachBtn').textContent = isLast ? t('tutOk') : '✖';
    $('#coachBtn').onclick = () => { S.tutorialStep = 99; save(); updateTutorial(); };
    document.querySelectorAll('nav button').forEach(b =>
      b.classList.toggle('glow', !!step.glow && b.dataset.tab === step.glow));
  }
}

// ---------- Kopia zapasowa (eksport/import) ----------
// ---------- Ekran ustawień ----------
// Jedno miejsce na wszystkie przełączniki i kopię zapasową.
function showSettings() {
  const row = (id, icon, label, on, desc) => `
    <div class="setRow">
      <div class="setInfo"><span class="setLbl">${icon} ${label}</span>${desc ? `<span class="setDesc">${desc}</span>` : ''}</div>
      <button class="toggle${on ? ' on' : ''}" id="${id}" role="switch" aria-checked="${on}"><span class="knob"></span></button>
    </div>`;
  // Wiersz języka z dwoma przyciskami-flagami (PL / EN).
  const langRow = `
    <div class="setRow">
      <div class="setInfo"><span class="setLbl">🌐 ${t('setLangLbl')}</span><span class="setDesc">${t('setLangD')}</span></div>
      <div class="langBtns">
        <button class="langBtn${LANG === 'pl' ? ' on' : ''}" data-lang="pl">Polski</button>
        <button class="langBtn${LANG === 'en' ? ' on' : ''}" data-lang="en">English</button>
      </div>
    </div>`;
  const vol = (id, v) => `<div class="volRow"><input type="range" min="0" max="100" value="${Math.round((v != null ? v : 1) * 100)}" id="${id}" class="vol" aria-label="volume"></div>`;
  showOverlay(`
    <h2>${t('settings')}</h2>
    <div class="setList">
      ${langRow}
      ${row('setSound', '🔊', t('setSound'), S.soundOn, t('setSoundD'))}
      ${vol('volSound', S.soundVol)}
      ${row('setMusic', '🎵', t('setMusic'), S.musicOn, t('setMusicD'))}
      ${vol('volMusic', S.musicVol)}
      ${row('setVibro', '📳', t('setVibro'), S.vibrateOn, t('setVibroD'))}
      ${row('setNotif', '🔔', t('setNotif'), S.notifOn, t('setNotifD'))}
    </div>
    <div class="note">${t('backupHead')}</div>
    <div class="saveBtns">
      <button class="bigBtn" id="setExport">${t('exportBtn')}</button>
      <button class="bigBtn" id="setImport">${t('importBtn')}</button>
    </div>
    <div class="note danger-note">${t('resetHead')}</div>
    <button class="bigBtn danger" id="setReset">${t('resetBtn')}</button>
    <button class="bigBtn" onclick="hideOverlay()">${t('close')}</button>`);

  const setUI = (id, on) => {
    const b = $('#' + id);
    if (b) { b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }
  };
  document.querySelectorAll('.langBtn').forEach(b => b.onclick = () => {
    const l = b.dataset.lang;
    if (l === LANG) return;
    setLang(l); S.lang = l; save();
    // Przerysuj wszystko w nowym języku i pokaż ustawienia ponownie.
    renderHeader(); renderPanel(); applyStaticI18n();
    lastCoachStep = -1; updateTutorial();
    showSettings();
    toast(t('langSwitched'));
  });
  $('#setSound').onclick = () => setUI('setSound', toggleSound());
  $('#setMusic').onclick = () => setUI('setMusic', Music.toggle());
  $('#setVibro').onclick = () => {
    S.vibrateOn = !S.vibrateOn; save();
    if (S.vibrateOn) buzz(30);
    setUI('setVibro', S.vibrateOn);
  };
  $('#setNotif').onclick = () => {
    if (!S.notifOn) {
      S.notifAsked = true;
      Notify.requestPermission().then(ok => {
        S.notifOn = ok; save(); rescheduleNotifications();
        setUI('setNotif', ok);
        toast(ok ? t('notifOnToast') : t('notifDenied'));
      });
    } else {
      S.notifOn = false; save(); rescheduleNotifications();
      setUI('setNotif', false);
      toast(t('notifOffToast'));
    }
  };
  const vs = $('#volSound');
  if (vs) {
    let tickAt = 0;
    vs.oninput = () => {
      S.soundVol = Number(vs.value) / 100;
      if (S.soundOn && now() - tickAt > 90) { Sound.click(); tickAt = now(); } // podgląd głośności
    };
    vs.onchange = () => save();
  }
  const vm = $('#volMusic');
  if (vm) {
    vm.oninput = () => { S.musicVol = Number(vm.value) / 100; Music.setVolume(); };
    vm.onchange = () => save();
  }
  $('#setExport').onclick = showExportOverlay;
  $('#setImport').onclick = showImportOverlay;
  $('#setReset').onclick = confirmReset;
}

// Reset z podwójnym potwierdzeniem — usuwa zapis i przeładowuje grę.
function confirmReset() {
  showOverlay(`
    <h2>${t('resetTitle')}</h2>
    <p>${t('resetBody')}</p>
    <p style="opacity:.8">${t('resetTip')}</p>
    <button class="bigBtn danger" id="resetYes">${t('resetYes')}</button>
    <button class="bigBtn" onclick="showSettings()">${t('cancel')}</button>`);
  $('#resetYes').onclick = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    location.reload();
  };
}

function showExportOverlay() {
  const code = exportSave();
  showOverlay(`
    <h2>${t('exportTitle')}</h2>
    <p>${t('exportBody')}</p>
    <textarea class="saveArea" id="exportArea" readonly>${code}</textarea>
    <button class="bigBtn" id="copySaveBtn">${t('copyClip')}</button>
    <button class="bigBtn" onclick="showSettings()">${t('back')}</button>`);
  $('#copySaveBtn').onclick = () => {
    const area = $('#exportArea');
    area.select();
    const done = () => toast(t('copied'));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, () => { document.execCommand('copy'); done(); });
    } else { document.execCommand('copy'); done(); }
  };
}

function showImportOverlay() {
  showOverlay(`
    <h2>${t('importTitle')}</h2>
    <p>${t('importBody')}</p>
    <textarea class="saveArea" id="importArea" placeholder="${t('importPlaceholder')}"></textarea>
    <button class="bigBtn gold" id="doImportBtn">${t('importDo')}</button>
    <button class="bigBtn" onclick="showSettings()">${t('cancel')}</button>`);
  $('#doImportBtn').onclick = () => {
    if (importSave($('#importArea').value)) {
      // Import może zawierać inny język — zastosuj go i przerysuj wszystko.
      setLang(S.lang || detectLang());
      hideOverlay();
      checkDaily();
      renderHeader();
      renderPanel();
      applyStaticI18n();
      toast(t('importOk'));
      Sound.fanfare();
    } else {
      toast(t('importBad'));
    }
  };
}

// Podmienia statyczne teksty w HTML (nagłówki, nawigacja, splash) na bieżący język.
function applyStaticI18n() {
  document.querySelectorAll('nav button').forEach(b => {
    const key = { mine: 'navMine', upgrades: 'navUpg', exp: 'navExp', prestige: 'navPrestige', achv: 'navAchv', bonus: 'navBonus' }[b.dataset.tab];
    const ico = b.querySelector('.ico');
    if (key && ico) b.innerHTML = ico.outerHTML + t(key);
  });
  const brand = $('#splash h1'); if (brand) brand.innerHTML = '💎 ' + t('brand');
  const tag = $('#splash .tagline'); if (tag) tag.textContent = t('tagline');
  const hint = $('#splash .tapHint'); if (hint) hint.textContent = t('tapToPlay');
  const lbrand = $('#loader h1'); if (lbrand) lbrand.innerHTML = '💎 ' + t('brand');
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

// (Tło gwiazd i spadające gwiazdy obsługuje teraz js/space.js na canvasie —
//  stare funkcje DOM makeStars/scheduleShootingStar zostały usunięte.)
