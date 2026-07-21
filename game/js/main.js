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

// Podłączenie interakcji i pętli — po zakończeniu ładowania.
function wireGame() {
  // Ekran startowy: pierwsze dotknięcie odblokowuje audio (wymóg przeglądarek),
  // a okno zarobków offline pokazujemy dopiero po jego zamknięciu.
  const splash = $('#splash');
  splash.addEventListener('pointerdown', () => {
    Sound.unlock();
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
    showOfflineWindow();
  }, { once: true });

  $('#soundBtn').textContent = S.soundOn ? '🔊' : '🔇';
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

// ---------- Start z ekranem ładowania (etapy rozłożone na klatki) ----------
function startGame() {
  const bar = $('#loaderBar'), tip = $('#loaderTip'), loader = $('#loader');
  // Każdy etap: [opis, funkcja]. Rozłożenie na klatki wygładza start i pokazuje postęp.
  const steps = [
    ['Wczytywanie zapisu…', () => { load(); checkDaily(); }],
    ['Rozświetlanie gwiazd…', () => { makeStars(); scheduleShootingStar(); }],
    ['Kalibracja sterowania…', () => { initTabs(); applySkin(); }],
    ['Uruchamianie kopalni…', () => { renderHeader(); renderPanel(); }],
    ['Wysyłanie sond…', () => { scheduleComet(); scheduleRandomEvent(); scheduleBoss(); }],
    ['Gotowe!', () => { wireGame(); }],
  ];
  let i = 0;
  function step() {
    if (i < steps.length) {
      if (tip) tip.textContent = steps[i][0];
      steps[i][1]();
      i++;
      if (bar) bar.style.width = Math.round(i / steps.length * 100) + '%';
      requestAnimationFrame(() => setTimeout(step, 90));
    } else if (loader) {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 500);
    }
  }
  step();
}

startGame();
