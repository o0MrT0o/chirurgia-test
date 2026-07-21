'use strict';
/* =====================================================================
   MAIN.JS — start gry i pętla główna. Ten plik spina wszystko razem.
   Kolejność ładowania skryptów ustala index.html:
   config -> state -> logic -> ads -> ui -> main
   ===================================================================== */

// ---------- Pętla gry ----------
let lastTick = now();

function tick() {
  const dt = (now() - lastTick) / 1000;
  lastTick = now();
  const cps = totalCps();
  earn(cps * dt);
  S.playSeconds = (S.playSeconds || 0) + dt;
  if (cps > (S.bestCps || 0)) S.bestCps = cps;
  if (document.hidden) return; // w tle: licz zarobki, ale nie rysuj (oszczędność CPU)
  renderHeader();
  updateTutorial();
  for (const a of checkAchievements()) {
    toast(`🏆 Osiągnięcie: ${a.name}! (+${BALANCE.achievementBonus * 100}% produkcji)`);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    Sound.fanfare();
    spawnConfetti(18);
  }
}

// ---------- Start ----------
function startGame() {
  load();
  checkDaily();
  // Zamień statyczne emoji w HTML (splash, nawigacja, kometa, orbita) na ikony.
  document.querySelectorAll('#splash, nav, #comet, #orbitRing').forEach(el => { el.innerHTML = deEmoji(el.innerHTML); });
  makeStars();
  scheduleShootingStar();
  initTabs();
  applySkin();
  renderHeader();
  renderPanel();
  scheduleComet();
  scheduleRandomEvent();
  scheduleBoss();

  // Ekran startowy: pierwsze dotknięcie odblokowuje audio (wymóg przeglądarek),
  // a okno zarobków offline pokazujemy dopiero po jego zamknięciu.
  const splash = $('#splash');
  splash.addEventListener('pointerdown', () => {
    Sound.unlock();
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
    showOfflineWindow();
  }, { once: true });

  $('#soundBtn').innerHTML = ic(S.soundOn ? 'soundOn' : 'soundOff');
  $('#soundBtn').onclick = toggleSound;

  const ast = $('#asteroid');
  ast.addEventListener('touchstart', e => { e.preventDefault(); onTap(e); }, { passive: false });
  ast.addEventListener('mousedown', e => { if (!('ontouchstart' in window)) onTap(e); });

  setInterval(tick, 100);
  setInterval(save, 5000);
  setInterval(() => { if (!document.hidden && !wheelSpinning && ['bonus', 'mine', 'exp'].includes(activeTab)) renderPanel(); }, 2000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => {
    // W tle: zapisz i wygaś animacje tła (oszczędność baterii/CPU).
    document.documentElement.classList.toggle('bg-paused', document.hidden);
    if (document.hidden) save();
  });
}

startGame();
