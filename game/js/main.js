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
  earn(totalCps() * dt);
  renderHeader();
  for (const a of checkAchievements()) {
    toast(`🏆 Osiągnięcie: ${a.name}! (+${BALANCE.achievementBonus * 100}% produkcji)`);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  }
}

// ---------- Start ----------
function startGame() {
  load();
  checkDaily();
  makeStars();
  initTabs();
  renderHeader();
  renderPanel();
  showOfflineWindow();
  scheduleComet();

  const ast = $('#asteroid');
  ast.addEventListener('touchstart', e => { e.preventDefault(); onTap(e); }, { passive: false });
  ast.addEventListener('mousedown', e => { if (!('ontouchstart' in window)) onTap(e); });

  setInterval(tick, 100);
  setInterval(save, 5000);
  setInterval(() => { if (activeTab === 'bonus' || activeTab === 'mine') renderPanel(); }, 2000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

startGame();
