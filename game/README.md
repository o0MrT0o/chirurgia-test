# 💎 Kosmiczny Górnik — gra idle/clicker na Androida

Gra typu clicker/idle w klimacie kosmicznym — czysty HTML/CSS/JS, **bez
bibliotek i bez build stepu**. Dzięki temu możesz ją **tworzyć i testować
w całości na telefonie**, a APK zbuduje za Ciebie automatycznie GitHub Actions.

## 📁 Struktura kodu (co gdzie edytować)

| Plik | Co zawiera |
|---|---|
| `js/config.js` | **cały balans**: budynki, ulepszenia, osiągnięcia, stałe (koszty, mnożniki) |
| `js/state.js` | stan gry, zapis/odczyt (localStorage), formatowanie liczb |
| `js/logic.js` | silnik: produkcja, zakupy, prestiż, bonus dzienny, offline |
| `js/ads.js` | warstwa reklam — realny AdMob w APK, symulacja w przeglądarce |
| `js/playgames.js` | Google Play Games — logowanie, osiągnięcia, ranking, zapis w chmurze |
| `js/ui.js` | rysowanie: zakładki, panele, efekty, kometa |
| `js/main.js` | start gry i pętla główna |
| `css/style.css` | cały wygląd |
| `index.html` | szkielet strony (rzadko dotykany) |

Kolejność ładowania skryptów: `config → state → logic → ads → ui → main`.
Nowe mechaniki dodawaj tak: dane do `config.js`, obliczenia do `logic.js`,
ekran do `ui.js`.

## 🗺️ Plan rozbudowy (etapy)

- [x] **Etap 1** — fundament: architektura modułowa + rdzeń gry (klikanie, budynki, ulepszenia, prestiż, osiągnięcia, bonusy, offline, komety)
- [x] **Etap 2** — rozbudowa sklepu: kupowanie ×1/×10/Max, 50 ulepszeń progowych, ekran statystyk, 4 nowe osiągnięcia
- [x] **Etap 3** — duży prestiż: drzewko talentów (3 gałęzie, 9 talentów z poziomami, kryty, rabaty, dłuższe boosty)
- [x] **Etap 4** — misje dzienne (3/dzień, pył za komplet) + eventy losowe (deszcz meteorytów, gorączka kryształowa)
- [x] **Etap 5** — ekspedycje na 5 planet (wyprawy czasowe 15 min–24 h, skracanie reklamą) + kolekcja 15 artefaktów
- [x] **Etap 6** — oprawa: dźwięki WebAudio, ekran startowy, cząsteczki, wstrząs przy krycie, ikona (`icon.png`)
- [x] **Etap 8** — tutorial dla nowych graczy + eksport/import zapisu (kopia zapasowa)
- [x] **Etap 9** — bossowie-asteroidy: 5 bossów, walka na czas z paskiem HP, nagrody: kryształy + pył + szansa na artefakt
- [x] **Etap 10** — laboratorium badań: 10 badań czasowych (30 min–12 h) w łańcuchu, trwałe bonusy, skracanie reklamą; zakładka Wyprawy → „Baza"
- [x] **Etap 11** — 10 skórek asteroidy (za pył i warunki: bossowie, serie logowań, kliknięcia, prestiże)
- [x] **Etap 12** — 🌀 Odrodzenie: druga warstwa prestiżu nad pyłem/talentami — reset wszystkiego (w tym prestiżu) za osobliwości, trwały +20% produkcji/kliku na zawsze za każdą
- [x] **Etap 13** — 🎉 Wydarzenia weekendowe: piątek-niedziela, jeden z 3 typów rotujący co tydzień (kryształy ×2, artefakty ×2, pył z prestiżu ×2) — bez serwera, w pełni po stronie klienta
- [x] **Etap 14** — 🛡️ Arena bossów: powtarzalny tryb wyzwania — fale coraz silniejszych bossów na czas, osobny rekord, pył tylko za nowe fale ponad rekord
- [x] **Etap 7** — prawdziwy AdMob podpięty (`@capacitor-community/admob`, testowe ID Google — podmień na własne przed publikacją, patrz sekcja „Reklamy (AdMob)")
- [x] **Etap 15** — Google Play Games Services podpięte (logowanie, 8 osiągnięć, ranking, zapis w chmurze — wymaga Twojej konfiguracji w Play Console, patrz sekcja niżej); Capacitor podniesiony 6→8 (Node ≥22, Java 21)
- [ ] **Etap 7b (finał)** — podpisany AAB do publikacji (własny klucz + konto Google Play)

## 🎮 Mechaniki (zaprojektowane pod długą retencję graczy)

| Mechanika | Po co jest |
|---|---|
| Klikanie asteroidy | natychmiastowa frajda, klik daje też % produkcji pasywnej |
| 10 budynków pasywnych | klasyczna pętla idle — rosnące koszty (×1,15) |
| 17 ulepszeń | cele krótkoterminowe |
| ✨ Prestiż (gwiezdny pył) | długoterminowa pętla — reset za trwałe +5%/pyłek |
| 🌀 Odrodzenie (osobliwości) | endgame — głębszy reset (kasuje też prestiż/talenty/sektor) za +20% na zawsze za sztukę |
| 🎉 Wydarzenia weekendowe | powód, żeby wracać akurat w piątek/sobotę/niedzielę — inny bonus ×2 co tydzień |
| 🛡️ Arena bossów | powtarzalne wyzwanie zręcznościowe na żądanie, osobny rekord (fala) |
| 🏆 32 osiągnięcia (+1% każde) | cele kolekcjonerskie |
| 🎁 Bonus dzienny z serią logowań | powód, by wracać codziennie |
| ☄️ Złota kometa (co 1–3 min) | losowe eventy — gracz nie odkłada telefonu |
| 🌙 Zarobki offline (20%, max 4 h) | gra "pracuje" gdy gracz śpi, ale nie zastępuje aktywnej gry |
| 🔔 Powiadomienia push | przypominają o wyprawie, badaniu, pełnej kopalni i bonusie — **sprowadzają graczy z powrotem** |
| 🎬 Reklamy z nagrodą | ×2 zarobki offline, boost ×2 na 2 min — **tu zarabiasz** |
| 🎮 Google Play Games | logowanie, osiągnięcia, ranking, zapis w chmurze — retencja + social proof |

> Powiadomienia: w przeglądarce działają przez Web Notifications (póki karta
> żyje), a w APK przez wtyczkę `@capacitor/local-notifications` (dodaną w
> workflow) — wtedy przychodzą nawet przy zamkniętej aplikacji. Kod w
> `js/notify.js` wykrywa środowisko i sam wybiera właściwy sposób.

## 📱 Jak pracować nad grą z telefonu

1. **Edycja kodu**: aplikacja GitHub / github.com w przeglądarce → wybierz
   plik z tabeli powyżej → ✏️ edytuj → commit. Do zmiany balansu wystarczy
   `js/config.js`.
2. **Testowanie**: otwórz `index.html` w przeglądarce telefonu. Najprościej:
   włącz GitHub Pages (Settings → Pages → branch `main`), a gra będzie pod
   adresem `https://<twoja-nazwa>.github.io/<repo>/game/`.
3. **APK**: po każdym commicie w folderze `game/` workflow
   `.github/workflows/build-apk.yml` buduje APK. Wejdź w zakładkę **Actions**
   → ostatnie uruchomienie → sekcja **Artifacts** → pobierz
   `kosmiczny-gornik-apk` i zainstaluj na telefonie (zezwól na instalację
   z nieznanych źródeł).

## 💰 Reklamy (AdMob) — już podpięte, zostają 2 kroki przed publikacją

Warstwa reklam (`js/ads.js`, obiekt `Ads`) sama rozpoznaje środowisko:
- **W przeglądarce** — symulacja (odliczanie 3 s), do testowania bez budowania APK.
- **W APK** — prawdziwe reklamy z nagrodą przez wtyczkę
  [`@capacitor-community/admob`](https://github.com/capacitor-community/admob)
  (już w `npm install` w workflow) — `Ads.init()` inicjalizuje SDK przy starcie,
  `Ads.showRewarded()` woła `AdMob.showRewardVideoAd()` i odpala nagrodę
  dopiero w evencie `onRewardedVideoAdReward`. Workflow sam wstrzykuje App ID
  AdMob do `strings.xml`/`AndroidManifest.xml` (krok „Skonfiguruj AdMob").

Na razie wszędzie są **oficjalne testowe ID Google** — bezpieczne, można
klikać do woli, ale nigdy nie pokażą prawdziwej reklamy ani nie zarobią.
Przed publikacją:

1. Załóż konto na [admob.google.com](https://admob.google.com), dodaj aplikację
   i utwórz jednostkę **Rewarded** (reklama z nagrodą).
2. Podmień testowe ID na własne w dwóch miejscach:
   - `game/js/ads.js` — stałe `ADMOB_REWARDED_ID` (Twoje ID jednostki Rewarded)
     i `ADMOB_IS_TESTING` (ustaw na `false`).
   - `.github/workflows/build-apk.yml` — App ID (`ca-app-pub-...~...` z ustawień
     Twojej aplikacji w AdMob) w kroku „Skonfiguruj AdMob".
3. Reklamy z nagrodą (rewarded) mają najwyższe stawki eCPM i nie irytują
   graczy — gracz sam wybiera, kiedy je oglądać. **Nie klikaj własnych
   prawdziwych reklam** (nawet w testach) — to łamie zasady AdMob i grozi
   banem konta.

## 🎮 Google Play Games Services — podpięte, wymaga Twojego projektu w konsoli

W przeciwieństwie do AdMob, Play Games **nie ma bezpiecznego trybu testowego**
z gotowymi ID — logowanie i cała reszta zadziała dopiero po Twojej własnej
konfiguracji w Google Play Console. Do tego czasu wtyczka po prostu nic nie
robi (żadnych błędów, gra działa normalnie bez tych bonusów).

Warstwa (`js/playgames.js`, obiekt `PlayGames`) przez
[`@idleflowgames/capacitor-play-games`](https://github.com/idleflowgames/capacitor-play-games):
- **Ciche logowanie** przy starcie gry (bez okna — działa tylko, jeśli gracz już
  kiedyś zalogował się w tej grze); pełny ekran logowania to przycisk
  „Zaloguj się przez Google Play" w Ustawieniach.
- **Osiągnięcia** — zsynchronizowany jest celowo tylko wybrany zestaw ~8
  najbardziej „końcowych" osiągnięć (`GPG_ACHIEVEMENTS` w `config.js`), nie
  wszystkie 32 — mniej ID do ręcznego założenia w konsoli.
- **Ranking** — jeden, „łącznie wydobyte kryształy" (`GPG_LEADERBOARD_ID`),
  aktualizowany co ok. 3 minuty w tle.
- **Zapis w chmurze** — kopia zapasowa co ok. 3 minuty i przy zwinięciu
  aplikacji; przy świeżej instalacji z zalogowanym kontem gra pyta, czy
  przywrócić postęp z chmury (localStorage zawsze zostaje głównym, natychmiast
  zapisywanym źródłem prawdy — chmura to tylko backup/synchronizacja).

Przed publikacją:

1. W [Google Play Console](https://play.google.com/console) skonfiguruj
   **Play Games Services** dla swojej aplikacji (Growth → Play Games Services →
   Ustawienia), utwórz osiągnięcia i jeden ranking, skopiuj ich ID.
2. Podmień w `game/js/config.js`: `GPG_ACHIEVEMENTS` (ID przy każdym kluczu) i
   `GPG_LEADERBOARD_ID`.
3. Podmień numer projektu (`000000000000`) w
   `.github/workflows/build-apk.yml`, krok „Skonfiguruj Google Play Games
   Services", na prawdziwy z ustawień Play Games Services.
4. Logowanie działa tylko w buildzie podpisanym tym samym kluczem, który jest
   zarejestrowany w Play Console (patrz sekcja publikacji niżej) — debug APK
   z tego workflow **nie zaloguje gracza**, dopóki appka nie trafi choćby do
   testów wewnętrznych w Play Console z właściwym podpisem.

## 🏪 Publikacja w Google Play — krok po kroku

1. Konto dewelopera Google Play: [play.google.com/console](https://play.google.com/console)
   (jednorazowa opłata 25 USD).
2. Google Play wymaga **podpisanego** pliku **AAB** (nie debug APK). Na
   komputerze wygeneruj klucz (`keytool -genkey ...`), a w projekcie Capacitor
   uruchom `./gradlew bundleRelease`. (Workflow można rozszerzyć o podpisywanie
   — klucz trzymaj w GitHub Secrets, nigdy w repo.)
3. Zmień identyfikator aplikacji `com.mrt.kosmicznygornik` w
   `.github/workflows/build-apk.yml` na własny (musi być unikalny w Google Play).
4. Ikona aplikacji jest już gotowa i podpięta automatycznie: workflow
   `build-apk.yml` generuje z `store-assets/icon-src/` (tło + pierwszy plan +
   płaska wersja zapasowa) komplet ikon adaptacyjnych dla Androida krokiem
   „Wygeneruj ikonę aplikacji na Androida" (`@capacitor/assets`). Do samego
   wpisu w Google Play Console wgraj gotowy `store-assets/icon-512.png`
   (dokładnie 512×512, wymagany format). Do przygotowania: grafika promocyjna
   1024×500, min. 2 zrzuty ekranu, opis i polityka prywatności (wymagana przy
   AdMob — darmowe generatory online).

## ⚖️ Balans gry

Cały balans jest w `js/config.js`: `BALANCE` (stałe), `BUILDINGS` (koszty
i produkcja), `UPGRADES`, `ACHIEVEMENTS`. Zmieniasz liczby → commit → gotowe.
