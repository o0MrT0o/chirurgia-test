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
| `js/ads.js` | warstwa reklam (`=== ADMOB ===`) — tu podepniesz prawdziwy AdMob |
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
- [ ] **Etap 7 (finał)** — prawdziwy AdMob + podpisany AAB do publikacji

## 🎮 Mechaniki (zaprojektowane pod długą retencję graczy)

| Mechanika | Po co jest |
|---|---|
| Klikanie asteroidy | natychmiastowa frajda, klik daje też % produkcji pasywnej |
| 10 budynków pasywnych | klasyczna pętla idle — rosnące koszty (×1,15) |
| 17 ulepszeń | cele krótkoterminowe |
| ✨ Prestiż (gwiezdny pył) | długoterminowa pętla — reset za trwałe +5%/pyłek |
| 🌀 Odrodzenie (osobliwości) | endgame — głębszy reset (kasuje też prestiż/talenty/sektor) za +20% na zawsze za sztukę |
| 🏆 14 osiągnięć (+1% każde) | cele kolekcjonerskie |
| 🎁 Bonus dzienny z serią logowań | powód, by wracać codziennie |
| ☄️ Złota kometa (co 1–3 min) | losowe eventy — gracz nie odkłada telefonu |
| 🌙 Zarobki offline (50%, max 8 h) | gra "pracuje" gdy gracz śpi |
| 🔔 Powiadomienia push | przypominają o wyprawie, badaniu, pełnej kopalni i bonusie — **sprowadzają graczy z powrotem** |
| 🎬 Reklamy z nagrodą | ×2 zarobki offline, boost ×2 na 2 min — **tu zarabiasz** |

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

## 💰 Podpięcie prawdziwych reklam (AdMob)

W kodzie warstwa reklam to obiekt `Ads` (szukaj komentarza `=== ADMOB ===`).
W przeglądarce reklamy są symulowane. Aby zarabiać naprawdę:

1. Załóż konto na [admob.google.com](https://admob.google.com), dodaj aplikację
   i utwórz jednostkę **Rewarded** (reklama z nagrodą).
2. Do projektu Capacitor (buduje go workflow — możesz go też wygenerować
   lokalnie na komputerze) dodaj wtyczkę
   [`@capacitor-community/admob`](https://github.com/capacitor-community/admob):
   `npm install @capacitor-community/admob`.
3. W `Ads.showRewarded()` podmień symulację na wywołanie
   `AdMob.showRewardVideoAd()` z Twoim ID jednostki reklamowej i wywołaj
   `onReward()` w evencie nagrody.
4. Reklamy z nagrodą (rewarded) mają najwyższe stawki eCPM i nie irytują
   graczy — gracz sam wybiera, kiedy je oglądać.

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
