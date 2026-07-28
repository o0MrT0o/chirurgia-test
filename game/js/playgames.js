'use strict';
/* =====================================================================
   PLAYGAMES.JS — Google Play Games Services (osiągnięcia, ranking,
   zapis w chmurze) przez wtyczkę @idleflowgames/capacitor-play-games.

   W przeglądarce i gdy wtyczka/konfiguracja nie jest gotowa: wszystko
   po cichu nic nie robi (gra działa normalnie, tylko bez tych bonusów).

   Zanim to zadziała naprawdę, trzeba samemu (patrz README.md, sekcja
   „Google Play Games Services"):
   1. skonfigurować Play Games Services w Google Play Console,
   2. podmienić GPG_ACHIEVEMENTS / GPG_LEADERBOARD_ID w config.js,
   3. podmienić projectId w .github/workflows/build-apk.yml.
   ===================================================================== */

const IS_NATIVE_PG = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
let pgSignedIn = false;
let pgReady = false;

const PlayGames = {
  // Wołane raz przy starcie gry (main.js). Ciche logowanie — bez okna logowania,
  // działa tylko jeśli gracz już kiedyś zalogował się w tej grze.
  async init() {
    if (!IS_NATIVE_PG || !window.Capacitor.Plugins.PlayGames) return;
    const { PlayGames: PG } = window.Capacitor.Plugins;
    try {
      await PG.initialize();
      pgReady = true;
      const res = await PG.signIn({ silent: true });
      pgSignedIn = !!res.signedIn;
      if (pgSignedIn) await tryCloudRestore();
    } catch (e) {
      console.warn('Play Games init nieudany:', e);
    }
  },

  // Wywołanie z przycisku w Ustawieniach — pełny, interaktywny ekran logowania.
  async signInManually() {
    if (!pgReady) return false;
    try {
      const { PlayGames: PG } = window.Capacitor.Plugins;
      const res = await PG.signIn({ silent: false });
      pgSignedIn = !!res.signedIn;
      if (pgSignedIn) await tryCloudRestore();
      return pgSignedIn;
    } catch (e) {
      console.warn('Logowanie Play Games nieudane:', e);
      return false;
    }
  },

  isSignedIn() { return pgSignedIn; },

  // Odpalane z checkAchievements() dla każdego świeżo zdobytego osiągnięcia.
  // Zsynchronizowany jest tylko wybrany zestaw (patrz GPG_ACHIEVEMENTS) —
  // reszta osiągnięć zostaje wyłącznie lokalna, bez błędu.
  async syncAchievement(localId) {
    if (!pgSignedIn) return;
    const gpgId = GPG_ACHIEVEMENTS[localId];
    if (!gpgId || gpgId.startsWith('REPLACE_')) return;
    try {
      await window.Capacitor.Plugins.PlayGames.unlockAchievement({ id: gpgId });
    } catch (e) { /* brak sieci, brak konfiguracji w konsoli itp. — nieszkodliwe */ }
  },

  // Wołane okresowo (main.js) z S.allTimeEarned — ranking "łącznie wydobyte kryształy".
  async submitScore(score) {
    if (!pgSignedIn || !GPG_LEADERBOARD_ID || GPG_LEADERBOARD_ID.startsWith('REPLACE_')) return;
    try {
      await window.Capacitor.Plugins.PlayGames.submitScore({ leaderboardId: GPG_LEADERBOARD_ID, score: Math.floor(score) });
    } catch (e) {}
  },

  async showAchievements() {
    if (!pgSignedIn) return;
    try { await window.Capacitor.Plugins.PlayGames.showAchievements(); } catch (e) {}
  },

  async showLeaderboard() {
    if (!pgSignedIn || !GPG_LEADERBOARD_ID || GPG_LEADERBOARD_ID.startsWith('REPLACE_')) return;
    try { await window.Capacitor.Plugins.PlayGames.showLeaderboard({ leaderboardId: GPG_LEADERBOARD_ID }); } catch (e) {}
  },

  // Kopia zapasowa stanu gry w chmurze Google — wołane okresowo (main.js),
  // NIE zastępuje localStorage (ten zawsze zostaje główny, natychmiastowy zapis).
  async cloudSave() {
    if (!pgSignedIn) return;
    try {
      await window.Capacitor.Plugins.PlayGames.saveSnapshot({
        name: 'main-save',
        data: JSON.stringify(S),
        description: `Kosmiczny Górnik — ${fmt(S.allTimeEarned)} kryształów`,
      });
    } catch (e) {}
  },
};

// Świeża instalacja (brak lokalnego postępu) + jest zapis w chmurze -> zapytaj,
// zanim cokolwiek nadpiszemy. Nie robi nic przy istniejącym lokalnym postępie.
async function tryCloudRestore() {
  const looksFresh = S.totalClicks < 5 && totalBuildings(S) === 0;
  if (!looksFresh) return;
  try {
    const { snapshot } = await window.Capacitor.Plugins.PlayGames.loadSnapshot({ name: 'main-save' });
    if (!snapshot || !snapshot.data) return;
    const cloud = JSON.parse(snapshot.data);
    showOverlay(`
      <h2>${t('gpgRestoreTitle')}</h2>
      <p>${t('gpgRestoreBody', fmt(cloud.allTimeEarned || 0))}</p>
      <button class="bigBtn gold" id="gpgRestoreYes">${t('gpgRestoreYes')}</button>
      <button class="bigBtn" id="gpgRestoreNo">${t('gpgRestoreNo')}</button>
    `);
    $('#gpgRestoreYes').onclick = () => {
      S = Object.assign(DEFAULT_STATE(), cloud);
      save();
      hideOverlay();
      renderHeader(); renderPanel();
      toast(t('gpgRestoreDone'));
    };
    $('#gpgRestoreNo').onclick = () => hideOverlay();
  } catch (e) {}
}
