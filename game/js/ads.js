'use strict';
/* =====================================================================
   ADS.JS — === ADMOB === warstwa reklam.
   W przeglądarce: symulacja (odliczanie 3 s).
   W wersji APK: podmień ciało showRewarded() na wywołanie wtyczki
   @capacitor-community/admob — instrukcja w game/README.md.
   ===================================================================== */

const Ads = {
  showRewarded(onReward) {
    // --- WERSJA APK: tutaj AdMob.showRewardVideoAd(), a onReward() w evencie nagrody ---
    showOverlay(`
      <h2>🎬 Reklama</h2>
      <p>Tu w wersji na Google Play wyświetli się prawdziwa reklama z nagrodą (AdMob).<br>W przeglądarce — symulacja.</p>
      <button class="bigBtn" id="adDone" disabled>Poczekaj 3 s…</button>
    `);
    let t = 3;
    const btn = $('#adDone');
    const iv = setInterval(() => {
      t--;
      if (t <= 0) {
        clearInterval(iv);
        btn.disabled = false;
        btn.textContent = '✅ Odbierz nagrodę';
        btn.onclick = () => { hideOverlay(); onReward(); };
      } else btn.textContent = `Poczekaj ${t} s…`;
    }, 1000);
  },
};

function adBoost() {
  Ads.showRewarded(() => {
    S.boostUntil = now() + boostDuration() * 1000; // czas z talentem Wieczny boost
    toast(`⚡ Boost ×${BALANCE.adBoostMult} aktywny przez ${Math.round(boostDuration())} s!`);
    save();
  });
}
