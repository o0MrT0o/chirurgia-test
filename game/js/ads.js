'use strict';
/* =====================================================================
   ADS.JS — warstwa reklam z nagrodą (AdMob).
   W przeglądarce: symulacja (odliczanie 3 s) — tak testujemy na telefonie
   bez kompilowania APK.
   W APK (Capacitor): prawdziwe reklamy z nagrodą przez wtyczkę
   @capacitor-community/admob (dodaną w .github/workflows/build-apk.yml).

   ID reklamy poniżej to OFICJALNE TESTOWE ID Google — zawsze zwracają
   reklamę testową, nigdy prawdziwą, bezpieczne do budowania i klikania
   ile chcesz. PRZED PUBLIKACJĄ podmień na własne ID z konta AdMob
   (patrz README.md, sekcja „AdMob") i ustaw isTesting na false.
   ===================================================================== */

const ADMOB_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917'; // testowe ID Google
const ADMOB_IS_TESTING = true; // PRZED PUBLIKACJĄ: false (po podmianie ID powyżej na własne)

const IS_NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
let admobReady = false;

const Ads = {
  // Wołane raz przy starcie gry (main.js). W przeglądarce nic nie robi.
  async init() {
    if (!IS_NATIVE || !window.Capacitor.Plugins.AdMob) return;
    try {
      await window.Capacitor.Plugins.AdMob.initialize({ initializeForTesting: ADMOB_IS_TESTING });
      admobReady = true;
    } catch (e) {
      console.warn('AdMob init nieudany:', e);
    }
  },

  showRewarded(onRewardRaw) {
    // każda obejrzana reklama liczy się do misji dziennej "Obejrzyj reklamę"
    const onReward = () => { missionBump('ads'); onRewardRaw(); };
    if (IS_NATIVE && admobReady) showNativeRewarded(onReward);
    else showSimulatedRewarded(onReward);
  },
};

// ---------- APK: prawdziwa reklama z nagrodą przez AdMob ----------
async function showNativeRewarded(onReward) {
  const { AdMob } = window.Capacitor.Plugins;
  let rewardListener, failListener;
  try {
    rewardListener = await AdMob.addListener('onRewardedVideoAdReward', () => {
      rewardListener.remove();
      if (failListener) failListener.remove();
      onReward();
    });
    failListener = await AdMob.addListener('onRewardedVideoAdFailedToLoad', () => {
      failListener.remove();
      rewardListener.remove();
      toast(t('adFailed'));
    });
    await AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED_ID, isTesting: ADMOB_IS_TESTING });
    await AdMob.showRewardVideoAd();
  } catch (e) {
    console.warn('Reklama AdMob nieudana:', e);
    if (rewardListener) rewardListener.remove();
    if (failListener) failListener.remove();
    toast(t('adFailed'));
  }
}

// ---------- Przeglądarka: symulacja (odliczanie 3 s) ----------
function showSimulatedRewarded(onReward) {
  showOverlay(`
    <h2>${t('adTitle')}</h2>
    <p>${t('adBody')}</p>
    <button class="bigBtn" id="adDone" disabled>${t('adWait', 3)}</button>
  `);
  let secs = 3;
  const btn = $('#adDone');
  const iv = setInterval(() => {
    secs--;
    if (secs <= 0) {
      clearInterval(iv);
      btn.disabled = false;
      btn.textContent = t('adReady');
      btn.onclick = () => { hideOverlay(); onReward(); };
    } else btn.textContent = t('adWait', secs);
  }, 1000);
}

function adBoost() {
  Ads.showRewarded(() => {
    S.boostUntil = now() + boostDuration() * 1000; // czas z talentem Wieczny boost
    toast(`⚡ Boost ×${BALANCE.adBoostMult} aktywny przez ${Math.round(boostDuration())} s!`);
    save();
  });
}

function adAutoClick() {
  Ads.showRewarded(() => {
    S.autoClickUntil = now() + BALANCE.autoClickSeconds * 1000;
    toast(t('autoClickToast', BALANCE.autoClickSeconds));
    Sound.buy();
    save();
  });
}
