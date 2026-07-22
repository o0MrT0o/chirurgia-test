'use strict';
/* =====================================================================
   I18N.JS — dwujęzyczność PL/EN. Ładowany PRZED config.js.
   • t(key, ...args) — teksty interfejsu ({0},{1} = podstawienia argumentów).
   • EN.names / EN.descs — angielskie nazwy i opisy treści (po id z config.js).
   • nm(item) / ds(item) / cd(skin) / effOf(talent,l) — zwracają tekst w
     aktualnym języku (EN gdy dostępny, inaczej oryginał z config.js).
   Polski to język bazowy (fallback), więc brak klucza nigdy nie psuje gry.
   ===================================================================== */

let LANG = 'pl';
function setLang(l) { LANG = (l === 'en') ? 'en' : 'pl'; }
// Wykryj język urządzenia przy pierwszym uruchomieniu (gdy brak zapisanego wyboru).
function detectLang() {
  const l = (navigator.language || navigator.userLanguage || 'pl').toLowerCase();
  return l.startsWith('pl') ? 'pl' : 'en';
}

// Podstawienie argumentów: t('x', 5) → "...{0}..." z 5 w miejsce {0}.
function t(key, ...a) {
  const table = STRINGS[LANG] || STRINGS.pl;
  let s = table[key];
  if (s == null) s = STRINGS.pl[key];
  if (s == null) return key;
  return s.replace(/\{(\d+)\}/g, (_, i) => (a[i] != null ? a[i] : ''));
}
// Alias na wypadek, gdy lokalna zmienna `t` (np. talent w pętli) przesłania t().
const tr = t;

// ---------- Teksty interfejsu ----------
const STRINGS = {
  pl: {
    // start / loader / nav
    brand: 'KOSMICZNY<br>GÓRNIK', tagline: 'Wydobywaj kryształy. Podbij galaktykę.',
    tapToPlay: '▶ Dotknij, aby grać',
    load1: 'Wczytywanie zapisu…', load2: 'Rozświetlanie gwiazd…', load3: 'Kalibracja sterowania…',
    load4: 'Uruchamianie kopalni…', load5: 'Wysyłanie sond…', load6: 'Gotowe!',
    navMine: 'Kopalnia', navUpg: 'Ulepszenia', navExp: 'Baza', navPrestige: 'Prestiż',
    navAchv: 'Sukcesy', navBonus: 'Bonusy',
    // header
    cpsLabel: '{0} / sek. • klik: +{1}',
    dustLabel: '✨ {0} pyłu do wydania • 🌟 talenty: {1} poz.',
    chipFrenzy: '☄️ SZAŁ ×{0} — {1}s', chipFever: '💥 GORĄCZKA: klik ×{0} — {1}s', chipBoost: '⚡ Boost ×{0} — {1}s',
    // achievements toast
    achToast: '🏆 Osiągnięcie: {0}! (+{1}% produkcji)',
    // mine
    unitMin: 'min', unitH: 'h',
    perSec: '{0} 💎/sek. {1}', together: '(razem)', gives: '• daje {0}/sek.',
    mineEmpty: 'Klikaj w asteroidę, aby odblokować pierwsze maszyny! ⛏️',
    // upgrades
    upgEmpty: 'Zdobywaj kryształy i rozbudowuj kopalnię, aby odkryć nowe ulepszenia! 🚀',
    upgBought: '— Kupione ({0}) —', upgToast: '🚀 Kupiono: {0}!',
    // prestige
    prestigeIntro: '✨ <b>Prestiż</b> resetuje kryształy, maszyny i ulepszenia,<br>ale daje <b>gwiezdny pył</b> — wydasz go w drzewku talentów poniżej.<br>Zdobyte w tej rundzie: <b>{0} 💎</b> • pył do zdobycia: <b style="color:#ffd76e">✨ {1}</b>',
    prestigeBtn: '✨ Prestiż — odbierz {0} pyłu', prestigeLocked: 'Zdobądź min. 10 mln 💎, aby odblokować',
    talentTree: '🌟 <b>Drzewko talentów</b> — do wydania: <b style="color:#ffd76e">✨ {0}</b> • prestiże: {1}',
    prestigeSure: '✨ Na pewno?', prestigeSureBody: 'Stracisz kryształy, maszyny i ulepszenia,<br>ale zyskasz <b>{0} pyłu</b> na talenty.<br>Talenty i osiągnięcia zostają!',
    yesReset: 'Tak, resetuj!', notYet: 'Jeszcze nie',
    talentCost: 'koszt: ✨ {0}', talentReq: '🔒 wymaga: {0} poz. {1}', maxed: 'MAX ✅',
    talentToast: '🌟 {0} → poziom {1} ({2})', prestigeDone: '✨ Prestiż! Zdobyto {0} gwiezdnego pyłu!',
    nowEff: 'teraz',
    // skins + achievements
    skinsHead: '🎨 <b>Skórki asteroidy</b> — {0}/{1} • masz ✨ {2}',
    skinSelected: '✅ wybrana', skinTapSelect: 'dotknij, aby wybrać', skinBuy: 'kup: ✨ {0}',
    skinToast: '🎨 Skórka: {0}!', skinBuyToast: '🎨 Kupiono skórkę {0} za ✨ {1}!',
    skinNeed: '✨ Potrzebujesz {0} pyłu (masz {1})', skinCond: '🔒 Warunek: {0}',
    achHead: '🏆 <b>Osiągnięcia</b> {0}/{1} — każde daje <b>+{2}% produkcji</b>',
    // expeditions
    expDone: '{0} Wyprawa na <b>{1}</b> zakończona!', expClaim: '📦 Odbierz łup: ~{0} 💎',
    expEnRoute: '{0} Statek w drodze na <b>{1}</b>', expReturn: 'Powrót za: <b>{0}</b>',
    watchRush: '🎬 Obejrzyj reklamę → skróć o {0} min',
    expIntro: '🚀 Wyślij statek na wyprawę — wróci z łupem i szansą na <b>artefakt</b> (każdy daje trwałe <b>+{0}% produkcji</b>)',
    expLoot: 'łup: ~{0} 💎 • artefakt: {1}% szansy', expNeed: '🔒 wymaga {0} 💎 łącznego wydobycia',
    send: '🚀 Wyślij',
    labHead: '🧪 Laboratorium', labResearchDone: '{0} Badanie <b>{1}</b> ukończone!',
    labClaim: '🎓 Odbierz: {0}', labInProgress: '{0} Trwa badanie: <b>{1}</b> ({2})',
    labEnd: 'Koniec za: <b>{0}</b>', labHeadCount: '🧪 Laboratorium — ukończone: {0}/{1}',
    labAllDone: '🎓 Wszystkie badania ukończone!', labQueue: '🔒 Kolejne badania odblokują się po ukończeniu poprzednich ({0} w kolejce)',
    resStarted: '🧪 Rozpoczęto badanie: {0}! Potrwa {1}.', resDoneTitle: '🎓 Badanie ukończone!',
    resPermaEff: 'Trwały efekt:', eureka: 'Eureka! 🎉', resShortened: '⏩ Badanie skrócone o {0} min!',
    artHead: '🏺 <b>Kolekcja artefaktów</b> — {0}/{1} (bonus: <b>+{2}% produkcji</b>) • duplikat = +{3} ✨',
    expShip: '🚀 Statek wyruszył na {0}! Wróci za {1}.',
    lootTitle: '📦 Łup z wyprawy!', lootDup: '{0} <b>{1}</b> — duplikat!<br>Zamieniono na <b>+{2} ✨ pyłu</b>',
    lootArt: 'Znaleziono artefakt:', lootArtBonus: '(+{0}% produkcji na zawsze!)', awesome: 'Super!',
    expShortened: '⏩ Wyprawa skrócona o {0} min!',
    // missions + wheel + bonus
    misHead: '🎯 <b>Misje dzienne</b> — komplet: <b>+{0} ✨ pyłu</b>{1}',
    misClaim: '🎁 Odbierz!', misSet: '🎯 Komplet misji dnia! +{0} 💎 i +{1} ✨ pyłu!', misOne: '🎯 Misja wykonana! +{0} 💎',
    mis_clicks: 'Kliknij {0} razy', mis_buildings: 'Kup {0} budynków', mis_earn: 'Wydobądź {0} kryształów',
    mis_comets: 'Złap {0} złote komety', mis_upgrades: 'Kup {0} ulepszenia', mis_ads: 'Obejrzyj {0} reklamę z nagrodą',
    wheelHead: '🎡 <b>Koło Fortuny</b> — 1 darmowy los dziennie{0}', wheelBonusSpins: ' (masz {0} bonusowych)',
    wheelSpinFree: '🎡 Zakręć za darmo!', wheelUsed: '✅ Darmowy los wykorzystany — wróć jutro',
    wheelAd: '🎬 Obejrzyj reklamę → dodatkowy los',
    dailyHead: '🎁 <b>Bonus dzienny</b> — seria: {0} {1}', dayS: 'dzień', dayP: 'dni',
    dailyClaimed: '✅ Odebrano — wróć jutro!', dailyClaim: '🎁 Odbierz {0} 💎',
    dailyToast: '🎁 Bonus dzienny: +{0} 💎 (seria: {1} dni)',
    calHead: '🎁 <b>Nagrody za logowanie</b> — seria: {0} {1}',
    calDay: 'Dzień {0}', calToday: 'DZIŚ', calClaim: 'Odbierz!',
    calBoost: '⚡ Boost', calSpin: '🎡 Los',
    calGotCrystals: '🎁 Dzień {0}: +{1} 💎!', calGotDust: '🎁 +{0} ✨ gwiezdnego pyłu!',
    calGotBoost: '🎁 Boost ×{0} aktywny!', calGotSpin: '🎁 Darmowy los dodany do koła!',
    boostHead: '⚡ <b>Boost reklamowy</b> — obejrzyj reklamę, aby podwoić produkcję na {0} s',
    boostActive: '⚡ Boost aktywny ({0}s)', boostWatch: '🎬 Obejrzyj reklamę → Boost ×{0}',
    statsHead: '📊 <b>Statystyki</b>',
    stAllTime: 'wydobyto od początku', stRound: 'w tej rundzie', stBestCps: 'rekord produkcji',
    stPlaytime: 'czas gry', stClicks: 'kliknięcia', stBestCombo: 'rekord kombosa', stBuildings: 'budynki',
    stUpgrades: 'kupione ulepszenia', stComets: 'złapane komety', stDust: 'pył zdobyty łącznie',
    stTalents: 'poziomy talentów', stPrestige: 'prestiże', stAchv: 'osiągnięcia', stExp: 'ukończone wyprawy',
    stArtifacts: 'artefakty', stBosses: 'pokonani bossowie', stStreak: 'seria logowań (dni)',
    stResearch: 'ukończone badania', stMissions: 'wykonane misje',
    settingsHint: '⚙️ Dźwięk, muzyka, powiadomienia i kopia zapasowa są teraz w <b>Ustawieniach</b> (ikona ⚙️ w rogu).',
    // combo / milestone / goal
    milestoneToast: '🏆 Kamień milowy: {0} 💎 wydobyte łącznie!',
    zoneNew: 'NOWY SEKTOR', zoneBonusMsg: '+{0}% produkcji na zawsze', zoneMax: 'ostatni sektor',
    goalGet: 'Zdobądź', goalUnlock: 'Odblokuj', goalBuilding: '🎯 {0}: <b>{1}</b> · {2}%',
    goalMilestone: '🎯 Kamień milowy: <b>{0} 💎</b> · {1}%',
    critShort: 'KRYT! ', // prefiks liczby przy krytyku klik
    // comet + events
    cometReward: '☄️ Złota kometa! +{0} 💎', cometFrenzy: '☄️ SZAŁ WYDOBYCIA! Produkcja ×{0} przez {1} sekund!',
    feverToast: '💥 GORĄCZKA KRYSZTAŁOWA! Klikanie ×{0} przez {1} sekund!',
    meteorToast: '🌠 DESZCZ METEORYTÓW! Łap spadające meteory!',
    // boss
    bossHit: 'Klikaj, aby zadawać obrażenia!', bossIncoming: '⚔️ {0} nadlatuje! Masz {1} sekund!',
    bossDefeated: '⚔️ {0} pokonany!', bossDrop: 'Boss upuścił artefakt:', bossDup: '{0} <b>{1}</b> — duplikat! +{2} ✨',
    victory: 'Zwycięstwo! 🎉', bossFled: '💨 {0} odleciał... Nagroda pocieszenia: +{0} 💎',
    bossFledMsg: '💨 {0} odleciał... Nagroda pocieszenia: +{1} 💎',
    critMinus: 'KRYT! −', minus: '−',
    // offline
    welcomeBack: '🌙 Witaj z powrotem!', offlineBody: 'Twoje maszyny pracowały pod Twoją nieobecność i wydobyły:<br><b style="font-size:22px;color:#8ff5ff">{0} 💎</b>',
    watchDouble: '🎬 Obejrzyj reklamę i odbierz ×2', claimPlain: 'Odbierz zwykłą kwotę',
    // tutorial
    tut1: '👆 Klikaj w asteroidę, aby wydobywać kryształy!',
    tut2: '⛏️ Super! Kup pierwszego Astro-górnika w zakładce Kopalnia.',
    tut3: '🤖 Maszyny kopią same! Kup teraz ulepszenie w zakładce Ulepszenia (potrzeba 100 💎).',
    tut4: '🎉 Świetnie Ci idzie! Zaglądaj do misji 🎁, wysyłaj wyprawy 🪐 i wracaj codziennie po bonusy!',
    tutOk: '✅ OK!',
    // settings
    settings: '⚙️ Ustawienia', setSound: 'Dźwięki', setSoundD: 'Efekty klikania, zakupów i sukcesów',
    setMusic: 'Muzyka', setMusicD: 'Spokojna ścieżka w tle', setVibro: 'Wibracje', setVibroD: 'Odzew dotykowy przy akcjach',
    setNotif: 'Powiadomienia', setNotifD: 'Przypomnienia o wyprawie, badaniu, bonusie',
    setLangLbl: 'Język', setLangD: 'Language — polski / English',
    backupHead: '💾 <b>Kopia zapasowa</b> — przenieś postęp na inny telefon',
    exportBtn: '📤 Eksportuj', importBtn: '📥 Importuj',
    resetHead: '⚠️ <b>Reset</b> — usuwa cały postęp, bez możliwości cofnięcia', resetBtn: '🗑️ Zresetuj grę',
    close: 'Zamknij',
    notifOnToast: '🔔 Powiadomienia włączone!', notifDenied: '🔕 Odmówiono zgody — sprawdź ustawienia telefonu',
    notifOffToast: '🔕 Powiadomienia wyłączone',
    resetTitle: '🗑️ Zresetować grę?', resetBody: 'Utracisz <b>cały postęp</b>: kryształy, budynki, prestiż, talenty, artefakty — wszystko. Tej operacji <b>nie da się cofnąć</b>.',
    resetTip: 'Wskazówka: najpierw możesz zrobić eksport zapisu.', resetYes: 'Tak, usuń wszystko', cancel: 'Anuluj',
    exportTitle: '📤 Eksport zapisu', exportBody: 'Skopiuj poniższy kod i schowaj w bezpiecznym miejscu<br>(np. w notatkach):',
    copyClip: '📋 Skopiuj do schowka', back: 'Wróć', copied: '📋 Zapis skopiowany do schowka!',
    importTitle: '📥 Import zapisu', importBody: 'Wklej kod zapisu. <b>Uwaga:</b> obecny postęp zostanie nadpisany!',
    importPlaceholder: 'Wklej kod tutaj...', importDo: '📥 Wczytaj zapis',
    importOk: '✅ Zapis wczytany pomyślnie!', importBad: '❌ Nieprawidłowy kod zapisu!',
    langSwitched: '🌐 Język zmieniony na polski',
    // wheel results (logic.js)
    wheelBoost: '⚡ Boost ×{0} na {1}s', wheelFrenzy: '☄️ Szał ×{0} na {1} s',
    wheelDust: '+{0} ✨ gwiezdnego pyłu', wheelAgain: '🔁 Darmowy los — kręć jeszcze raz!',
    wheelCrystals: '+{0} 💎', wheelJackpot: '🏆 JACKPOT! +{0} 💎, +2 ✨ i szał ×{1}!',
    // notifications (logic.js buildNotifications)
    notifExp: '☄️ Wyprawa{0} wróciła! Odbierz łup.', notifExpTo: ' na {0}',
    notifRes: '🧪 Badanie{0} ukończone! Odbierz nagrodę.', notifResName: ' „{0}”',
    notifFull: '💎 Twoja kopalnia jest pełna! Zbierz zarobki offline.',
    notifDaily: '🎁 Bonus dzienny i darmowy los czekają — wróć po nagrody!',
  },
  en: {
    brand: 'COSMIC<br>MINER', tagline: 'Mine crystals. Conquer the galaxy.',
    tapToPlay: '▶ Tap to play',
    load1: 'Loading save…', load2: 'Lighting up the stars…', load3: 'Calibrating controls…',
    load4: 'Starting the mine…', load5: 'Launching probes…', load6: 'Ready!',
    navMine: 'Mine', navUpg: 'Upgrades', navExp: 'Base', navPrestige: 'Prestige',
    navAchv: 'Awards', navBonus: 'Bonuses',
    cpsLabel: '{0} / sec • click: +{1}',
    dustLabel: '✨ {0} dust to spend • 🌟 talents: {1} lvl',
    chipFrenzy: '☄️ FRENZY ×{0} — {1}s', chipFever: '💥 FEVER: click ×{0} — {1}s', chipBoost: '⚡ Boost ×{0} — {1}s',
    achToast: '🏆 Achievement: {0}! (+{1}% production)',
    unitMin: 'min', unitH: 'h',
    perSec: '{0} 💎/sec {1}', together: '(total)', gives: '• gives {0}/sec',
    mineEmpty: 'Tap the asteroid to unlock your first machines! ⛏️',
    upgEmpty: 'Earn crystals and grow your mine to discover new upgrades! 🚀',
    upgBought: '— Owned ({0}) —', upgToast: '🚀 Purchased: {0}!',
    prestigeIntro: '✨ <b>Prestige</b> resets crystals, machines and upgrades,<br>but grants <b>stardust</b> — spend it in the talent tree below.<br>Earned this run: <b>{0} 💎</b> • dust to gain: <b style="color:#ffd76e">✨ {1}</b>',
    prestigeBtn: '✨ Prestige — claim {0} dust', prestigeLocked: 'Earn at least 10M 💎 to unlock',
    talentTree: '🌟 <b>Talent tree</b> — to spend: <b style="color:#ffd76e">✨ {0}</b> • prestiges: {1}',
    prestigeSure: '✨ Are you sure?', prestigeSureBody: 'You will lose crystals, machines and upgrades,<br>but gain <b>{0} dust</b> for talents.<br>Talents and achievements stay!',
    yesReset: 'Yes, reset!', notYet: 'Not yet',
    talentCost: 'cost: ✨ {0}', talentReq: '🔒 requires: {0} lvl {1}', maxed: 'MAX ✅',
    talentToast: '🌟 {0} → level {1} ({2})', prestigeDone: '✨ Prestige! Gained {0} stardust!',
    nowEff: 'now',
    skinsHead: '🎨 <b>Asteroid skins</b> — {0}/{1} • you have ✨ {2}',
    skinSelected: '✅ selected', skinTapSelect: 'tap to select', skinBuy: 'buy: ✨ {0}',
    skinToast: '🎨 Skin: {0}!', skinBuyToast: '🎨 Bought the {0} skin for ✨ {1}!',
    skinNeed: '✨ You need {0} dust (you have {1})', skinCond: '🔒 Condition: {0}',
    achHead: '🏆 <b>Achievements</b> {0}/{1} — each grants <b>+{2}% production</b>',
    expDone: '{0} Expedition to <b>{1}</b> complete!', expClaim: '📦 Claim loot: ~{0} 💎',
    expEnRoute: '{0} Ship en route to <b>{1}</b>', expReturn: 'Returns in: <b>{0}</b>',
    watchRush: '🎬 Watch an ad → shorten by {0} min',
    expIntro: '🚀 Send a ship on an expedition — it returns with loot and a chance at an <b>artifact</b> (each gives a permanent <b>+{0}% production</b>)',
    expLoot: 'loot: ~{0} 💎 • artifact: {1}% chance', expNeed: '🔒 requires {0} 💎 total mined',
    send: '🚀 Send',
    labHead: '🧪 Laboratory', labResearchDone: '{0} Research <b>{1}</b> complete!',
    labClaim: '🎓 Claim: {0}', labInProgress: '{0} Researching: <b>{1}</b> ({2})',
    labEnd: 'Ends in: <b>{0}</b>', labHeadCount: '🧪 Laboratory — completed: {0}/{1}',
    labAllDone: '🎓 All research complete!', labQueue: '🔒 Further research unlocks after finishing the previous ones ({0} queued)',
    resStarted: '🧪 Research started: {0}! Takes {1}.', resDoneTitle: '🎓 Research complete!',
    resPermaEff: 'Permanent effect:', eureka: 'Eureka! 🎉', resShortened: '⏩ Research shortened by {0} min!',
    artHead: '🏺 <b>Artifact collection</b> — {0}/{1} (bonus: <b>+{2}% production</b>) • duplicate = +{3} ✨',
    expShip: '🚀 Ship set off for {0}! Returns in {1}.',
    lootTitle: '📦 Expedition loot!', lootDup: '{0} <b>{1}</b> — duplicate!<br>Converted to <b>+{2} ✨ dust</b>',
    lootArt: 'Artifact found:', lootArtBonus: '(+{0}% production forever!)', awesome: 'Awesome!',
    expShortened: '⏩ Expedition shortened by {0} min!',
    misHead: '🎯 <b>Daily missions</b> — full set: <b>+{0} ✨ dust</b>{1}',
    misClaim: '🎁 Claim!', misSet: '🎯 Daily set complete! +{0} 💎 and +{1} ✨ dust!', misOne: '🎯 Mission done! +{0} 💎',
    mis_clicks: 'Click {0} times', mis_buildings: 'Buy {0} buildings', mis_earn: 'Mine {0} crystals',
    mis_comets: 'Catch {0} golden comets', mis_upgrades: 'Buy {0} upgrades', mis_ads: 'Watch {0} rewarded ad',
    wheelHead: '🎡 <b>Wheel of Fortune</b> — 1 free spin daily{0}', wheelBonusSpins: ' (you have {0} bonus)',
    wheelSpinFree: '🎡 Spin for free!', wheelUsed: '✅ Free spin used — come back tomorrow',
    wheelAd: '🎬 Watch an ad → extra spin',
    dailyHead: '🎁 <b>Daily bonus</b> — streak: {0} {1}', dayS: 'day', dayP: 'days',
    dailyClaimed: '✅ Claimed — come back tomorrow!', dailyClaim: '🎁 Claim {0} 💎',
    dailyToast: '🎁 Daily bonus: +{0} 💎 (streak: {1} days)',
    calHead: '🎁 <b>Login rewards</b> — streak: {0} {1}',
    calDay: 'Day {0}', calToday: 'TODAY', calClaim: 'Claim!',
    calBoost: '⚡ Boost', calSpin: '🎡 Spin',
    calGotCrystals: '🎁 Day {0}: +{1} 💎!', calGotDust: '🎁 +{0} ✨ stardust!',
    calGotBoost: '🎁 Boost ×{0} active!', calGotSpin: '🎁 Free spin added to the wheel!',
    boostHead: '⚡ <b>Ad boost</b> — watch an ad to double production for {0} s',
    boostActive: '⚡ Boost active ({0}s)', boostWatch: '🎬 Watch an ad → Boost ×{0}',
    statsHead: '📊 <b>Statistics</b>',
    stAllTime: 'mined all-time', stRound: 'this run', stBestCps: 'best production',
    stPlaytime: 'play time', stClicks: 'clicks', stBestCombo: 'best combo', stBuildings: 'buildings',
    stUpgrades: 'upgrades bought', stComets: 'comets caught', stDust: 'dust earned total',
    stTalents: 'talent levels', stPrestige: 'prestiges', stAchv: 'achievements', stExp: 'expeditions done',
    stArtifacts: 'artifacts', stBosses: 'bosses defeated', stStreak: 'login streak (days)',
    stResearch: 'research done', stMissions: 'missions done',
    settingsHint: '⚙️ Sound, music, notifications and backup are now in <b>Settings</b> (the ⚙️ icon in the corner).',
    milestoneToast: '🏆 Milestone: {0} 💎 mined in total!',
    zoneNew: 'NEW SECTOR', zoneBonusMsg: '+{0}% production forever', zoneMax: 'final sector',
    goalGet: 'Get', goalUnlock: 'Unlock', goalBuilding: '🎯 {0}: <b>{1}</b> · {2}%',
    goalMilestone: '🎯 Milestone: <b>{0} 💎</b> · {1}%',
    critShort: 'CRIT! ',
    cometReward: '☄️ Golden comet! +{0} 💎', cometFrenzy: '☄️ MINING FRENZY! Production ×{0} for {1} seconds!',
    feverToast: '💥 CRYSTAL FEVER! Clicking ×{0} for {1} seconds!',
    meteorToast: '🌠 METEOR SHOWER! Catch the falling meteors!',
    bossHit: 'Tap to deal damage!', bossIncoming: '⚔️ {0} incoming! You have {1} seconds!',
    bossDefeated: '⚔️ {0} defeated!', bossDrop: 'The boss dropped an artifact:', bossDup: '{0} <b>{1}</b> — duplicate! +{2} ✨',
    victory: 'Victory! 🎉', bossFledMsg: '💨 {0} flew away... Consolation reward: +{1} 💎',
    critMinus: 'CRIT! −', minus: '−',
    welcomeBack: '🌙 Welcome back!', offlineBody: 'Your machines kept working while you were away and mined:<br><b style="font-size:22px;color:#8ff5ff">{0} 💎</b>',
    watchDouble: '🎬 Watch an ad and claim ×2', claimPlain: 'Claim the normal amount',
    tut1: '👆 Tap the asteroid to mine crystals!',
    tut2: '⛏️ Nice! Buy your first Astro Miner in the Mine tab.',
    tut3: '🤖 Machines mine on their own! Now buy an upgrade in the Upgrades tab (need 100 💎).',
    tut4: '🎉 You are doing great! Check missions 🎁, send expeditions 🪐 and come back daily for bonuses!',
    tutOk: '✅ OK!',
    settings: '⚙️ Settings', setSound: 'Sound', setSoundD: 'Click, purchase and success effects',
    setMusic: 'Music', setMusicD: 'Calm background track', setVibro: 'Vibration', setVibroD: 'Haptic feedback on actions',
    setNotif: 'Notifications', setNotifD: 'Reminders about expeditions, research, bonuses',
    setLangLbl: 'Language', setLangD: 'Język — polski / English',
    backupHead: '💾 <b>Backup</b> — move your progress to another phone',
    exportBtn: '📤 Export', importBtn: '📥 Import',
    resetHead: '⚠️ <b>Reset</b> — erases all progress, cannot be undone', resetBtn: '🗑️ Reset game',
    close: 'Close',
    notifOnToast: '🔔 Notifications enabled!', notifDenied: '🔕 Permission denied — check your phone settings',
    notifOffToast: '🔕 Notifications disabled',
    resetTitle: '🗑️ Reset the game?', resetBody: 'You will lose <b>all progress</b>: crystals, buildings, prestige, talents, artifacts — everything. This <b>cannot be undone</b>.',
    resetTip: 'Tip: you can export your save first.', resetYes: 'Yes, erase everything', cancel: 'Cancel',
    exportTitle: '📤 Export save', exportBody: 'Copy the code below and keep it somewhere safe<br>(e.g. in your notes):',
    copyClip: '📋 Copy to clipboard', back: 'Back', copied: '📋 Save copied to clipboard!',
    importTitle: '📥 Import save', importBody: 'Paste a save code. <b>Warning:</b> your current progress will be overwritten!',
    importPlaceholder: 'Paste the code here...', importDo: '📥 Load save',
    importOk: '✅ Save loaded successfully!', importBad: '❌ Invalid save code!',
    langSwitched: '🌐 Language changed to English',
    wheelBoost: '⚡ Boost ×{0} for {1}s', wheelFrenzy: '☄️ Frenzy ×{0} for {1} s',
    wheelDust: '+{0} ✨ stardust', wheelAgain: '🔁 Free spin — spin again!',
    wheelCrystals: '+{0} 💎', wheelJackpot: '🏆 JACKPOT! +{0} 💎, +2 ✨ and frenzy ×{1}!',
    notifExp: '☄️ Expedition{0} is back! Claim your loot.', notifExpTo: ' to {0}',
    notifRes: '🧪 Research{0} complete! Claim your reward.', notifResName: ' “{0}”',
    notifFull: '💎 Your mine is full! Collect your offline earnings.',
    notifDaily: '🎁 A daily bonus and free spin await — come back for rewards!',
  },
};

// ---------- Angielskie nazwy i opisy treści (po id) ----------
const EN = {
  names: {
    // budynki
    robot: 'Astro Miner', drill: 'Laser Drill', drone: 'Mining Drone', moon: 'Lunar Mine',
    ship: 'Cargo Ship', station: 'Orbital Station', factory: 'Planetary Factory', portal: 'Dimensional Portal',
    sun: 'Artificial Star', hole: 'Black Hole',
    // ulepszenia
    c1: 'Reinforced Gloves', c2: 'Titanium Pickaxe', c3: 'Plasma Blade', c4: 'Power Gauntlet', c5: 'Supernova Touch',
    b1: 'Better Batteries', b2: 'Diamond Drills', b3: 'Drone Swarm', b4: 'Base Alpha', b5: 'FTL Drive',
    b6: 'XXL Solar Panels', b7: 'AI Automation', b8: 'Portal Stabilizer',
    g1: 'Cosmic Coffee', g2: 'Robot Unions', g3: 'Galactic Exchange', g4: 'Alien Favor',
    // planety
    ceres: 'Ceres', mars: 'Mars', tytan: 'Titan', europa: 'Europa', io: 'Io',
    // artefakty
    art_c1: 'Shard of Primordial Matter', art_c2: 'Starstorm Dust', art_c3: 'Silicon Rose',
    art_m1: 'Rusty Crystal', art_m2: 'Sand Hourglass', art_m3: 'Bronze Meteorite',
    art_t1: 'Methane Amber', art_t2: 'Ring of Titan', art_t3: 'Ice Monolith',
    art_e1: 'Ocean Tear', art_e2: 'Frozen Aurora', art_e3: 'Deep-Sea Pearl',
    art_i1: 'Heart of the Volcano', art_i2: 'Sulfur Diamond', art_i3: 'Eye of Io',
    // skórki
    classic: 'Classic', gold: 'Golden', ice: 'Icy', lava: 'Lava', cheese: 'Cheese',
    emerald: 'Emerald', heart: 'Crystal Heart', void: 'Void', star: 'Stellar', rainbow: 'Rainbow',
    // badania
    r1: 'Spectral Analysis', r2: 'Asteroid Geology', r3: 'Drill Optimization', r4: 'Nanobots',
    r5: 'Crystallography', r6: 'Comet Theory', r7: 'Quantum Physics', r8: 'Astro-economics',
    r9: 'Dark Matter', r10: 'Theory of Everything',
    // talenty
    tc1: 'Strong Hands', tc2: 'Click Echo', tc3: 'Golden Touch',
    tp1: 'Efficient Machines', tp2: 'Cheap Labor', tp3: 'Synergy',
    tt1: 'Night Shift', tt2: 'Comet Magnet', tt3: 'Eternal Boost',
    // sektory / strefy
    z0: 'Asteroid Belt', z1: 'Orion Nebula', z2: 'Emerald Fields', z3: 'Volcanic Zone',
    z4: 'Golden Reaches', z5: 'Rose Turbulence', z6: 'The Void', z7: 'Stellar Heart',
    // gałęzie talentów
    'branch_click': '⛏️ Click Power', 'branch_prod': '🏭 Production', 'branch_time': '🌙 Time & Bonuses',
    // bossowie
    'boss_Obsydianowy Kolos': 'Obsidian Colossus', 'boss_Strażnik Pierścieni': 'Ring Guardian',
    'boss_Piroklast': 'Pyroclast', 'boss_Lodowy Behemot': 'Ice Behemoth', 'boss_Pożeracz Światów': 'World Eater',
    // koło fortuny
    cr1: 'Crystals', boost: 'Boost ×2', cr2: 'Crystals ×4', dust: 'Stardust',
    frenzy: 'Frenzy ×7', again: 'Free spin!', cr3: 'Big Win', jackpot: 'JACKPOT',
    // osiągnięcia
    a_click1: 'First Strike', a_click2: 'Pro Clicker', a_click3: 'Fingers of Steel',
    a_cr1: 'Collector', a_cr2: 'Tycoon', a_cr3: 'Galactic Croesus',
    a_b1: 'Brigade', a_b2: 'Mining Empire', a_b3: 'Lord of Space', a_b4: 'Galactic Magnate',
    a_p1: 'A New Start', a_p2: 'Eternal Return', a_comet: 'Comet Hunter', a_streak: 'Loyal Miner',
    a_upg1: 'Modernizer', a_upg2: 'Perfect Engineer', a_time: 'Space Veteran',
    a_tal1: 'Student of Stars', a_dust: 'Stardust Alchemist', a_mis1: 'Diligent Contractor', a_mis2: 'Master of Orders',
    a_exp1: 'Explorer', a_exp2: 'System Conqueror', a_art1: 'Space Archaeologist', a_art2: 'Legend Collector',
    a_boss1: 'Colossus Slayer', a_boss2: 'Terror of the Galaxy', a_lab1: 'Young Scientist', a_lab2: 'Galactic Genius',
  },
  descs: {
    // ulepszenia (statyczne)
    c1: 'Clicking ×2', c2: 'Clicking ×3', c3: 'Clicking ×4', c4: 'Clicking ×5', c5: 'Clicking ×10',
    b1: 'Astro Miners ×2', b2: 'Drills ×2', b3: 'Drones ×2', b4: 'Lunar Mines ×2', b5: 'Ships ×2',
    b6: 'Stations ×2', b7: 'Factories ×2', b8: 'Portals ×2',
    g1: 'All production +10%', g2: 'All production +15%', g3: 'All production +20%', g4: 'All production +25%',
    // badania
    r1: 'production +5%', r2: 'click power +50%', r3: 'production +10%', r4: 'buildings 5% cheaper',
    r5: 'production +15%', r6: 'comets 15% more frequent', r7: 'click power +100%', r8: 'production +20%',
    r9: 'production +25%', r10: 'production +30% and click power +100%',
    // talenty (statyczny opis)
    tc1: '+25% click power per level', tc2: 'click gives an extra +1% production/sec per level',
    tc3: '+2% chance of a ×10 critical click per level',
    tp1: '+10% of all production per level', tp2: 'buildings 2% cheaper per level',
    tp3: '+2% production per owned building type, per level',
    tt1: 'offline earnings +5 pts per level', tt2: 'comets appear 8% more often per level',
    tt3: 'ad boost 15 s longer per level',
    // osiągnięcia
    a_click1: 'Click 100 times', a_click2: 'Click 2,500 times', a_click3: 'Click 15,000 times',
    a_cr1: 'Earn 10K crystals total', a_cr2: 'Earn 10M crystals total', a_cr3: 'Earn 10B crystals total',
    a_b1: 'Own 25 buildings', a_b2: 'Own 100 buildings', a_b3: 'Own 250 buildings', a_b4: 'Own 500 buildings',
    a_p1: 'Perform 1 prestige', a_p2: 'Perform 5 prestiges', a_comet: 'Catch 10 golden comets',
    a_streak: 'Login streak: 7 days', a_upg1: 'Buy 15 upgrades total', a_upg2: 'Buy 40 upgrades total',
    a_time: 'Play for 24 hours total', a_tal1: 'Buy 10 talent levels', a_dust: 'Earn 100 dust total',
    a_mis1: 'Complete 10 daily missions', a_mis2: 'Complete 50 daily missions',
    a_exp1: 'Complete 5 expeditions', a_exp2: 'Complete 25 expeditions',
    a_art1: 'Collect 5 artifacts', a_art2: 'Collect all 15 artifacts',
    a_boss1: 'Defeat 3 bosses', a_boss2: 'Defeat 20 bosses',
    a_lab1: 'Complete 3 research', a_lab2: 'Complete all 10 research',
  },
  // warunki skórek
  cond: {
    ice: 'login streak: 3 days', lava: 'defeat 3 bosses', cheese: '15K clicks',
    heart: 'login streak: 7 days', void: 'defeat 10 bosses', star: '5 prestiges',
  },
};

// Nazwa/opis w aktualnym języku (EN gdy dostępny, inaczej oryginał z config).
function nm(item) { return (LANG === 'en' && (item.enName || EN.names[item.id])) || item.name; }
function ds(item) { return (LANG === 'en' && (item.enDesc || EN.descs[item.id])) || item.desc; }
function bossName(def) { return (LANG === 'en' && EN.names['boss_' + def.name]) || def.name; }
function branchName(br) { return (LANG === 'en' && EN.names['branch_' + br.id]) || br.name; }
function skinCond(sk) { return (LANG === 'en' && EN.cond[sk.id]) || sk.condDesc; }
function effOf(talent, l) { return (LANG === 'en' && talent.effEn) ? talent.effEn(l) : talent.eff(l); }
// Czas trwania „X min / Y h” w bieżącym języku.
function durStr(hours) { return hours < 1 ? `${hours * 60} ${t('unitMin')}` : `${hours} ${t('unitH')}`; }
