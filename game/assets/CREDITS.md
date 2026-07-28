# Grafiki / Art credits

## Kenney (CC0) — większość grafik w grze

Poniższe grafiki pochodzą od **Kenney (https://kenney.nl)** i są na licencji
**CC0 1.0 Universal (Public Domain)** —
https://creativecommons.org/publicdomain/zero/1.0/
CC0 nie wymaga atrybucji; podajemy ją dobrowolnie. Pliki zostały jedynie
przemianowane (bez modyfikacji samej grafiki).

## Sprite'y budynków (`assets/buildings/`)
- Pakiety: „Space Shooter Redux" / „Tappy Plane".

## Sprite'y artefaktów (`assets/artifacts/`)
- Pakiet: „Puzzle Pack" (kolorowe, błyszczące elementy-klejnoty).
- Te same pliki są reużyte jako ikony celów w zakładce Ekspedycje (Ceres, Mars,
  Tytan, Europa, Io) — pierwszy artefakt danej planety = jej ikona na liście
  (spójne kolorystycznie, bo artefakt narracyjnie pochodzi z tej planety).
  Duże, kinowo cieniowane planety z assets/space/ (Endless Sky) celowo nie są
  tu użyte — przy rozmiarze ikony listy (34px) ich ciemna, „nocna" strona
  wygląda jak zepsuty obrazek zamiast kolorowej planety.

## Sprite'y bossów (`assets/bosses/`) — UWAGA: inna licencja niż reszta (CC BY-SA 4.0)
Celowo INNY styl niż reszta gry (malarskie, szczegółowe statki zamiast płaskich
ikon Kenney) — bossowie mają wyglądać jak coś obcego/groźnego, nie jak kolejny
przedmiot ze sklepu. Grafiki pochodzą z gry open source **Endless Sky**
(https://github.com/endless-sky/endless-sky, katalog `images/ship/`), tak jak
planety w tle poniżej — pełne informacje o licencji i atrybucja w sekcji
„Planety i statki bossów" niżej.

## Sprite'y koła fortuny (`assets/wheel/`)
- Pakiety: „Puzzle Pack" (klejnoty), „Space Shooter Redux" (piorun/gwiazdy), „Medals" (jackpot).

## Sprite'y ulepszeń/talentów/badań (`assets/upgrades/`)
- Pakiet: „Generic Items" (110+ ikon przedmiotów — rękawica, kilof, nóż, obcęgi,
  kubek, moneta, mikroskop, wiertarka, chwytak robota) oraz „Platformer assets"
  (sprite kosmity — ulepszenie „Sojusz Kosmitów"/„Alien Alliance").
- Używane w Sklepie (zakładka Ulepszenia), drzewku talentów (Prestiż) i liście
  badań (Laboratorium) zamiast emoji. Część ikon jest dzielona (reużyta) z innych
  sekcji gry (budynki, koło fortuny, artefakty, tło) — te same pliki, ta sama
  licencja CC0.

## Ikony paska nawigacji (`assets/nav/`)
- Pakiet: „Holiday Pack" (prezent/present.png — użyty na zakładkę „Bonusy").
- Pozostałe ikony nawigacji to reużyte pliki z innych sekcji: kilof
  (`assets/upgrades/pickaxe.png` — Kopalnia), statek (`assets/buildings/ship.png`
  — Ulepszenia), stacja kosmiczna (`assets/buildings/station.png` — Baza),
  złota gwiazda (`assets/wheel/dust.png` — Prestiż), medal
  (`assets/achievements/medal4.png` — Sukcesy).

## Ikona aplikacji (`icon.png`, `../store-assets/`)
Kompozycja: asteroida (nowy plik z „Space Shooter Extension" — większa
rozdzielczość niż reszta meteorów w grze, żeby ikona była ostra), kryształ
(`assets/artifacts/art_e1.png`, ten sam co na liście Ekspedycji) i kilof
(`assets/upgrades/pickaxe.png`, ten sam co w Sklepie i na pasku nawigacji) na
gradientowym tle w barwach reszty gry. Tło ma osobną warstwę pierwszego planu
i tła (`store-assets/icon-src/icon-foreground.png` /
`icon-background.png`) do wygenerowania ikony adaptacyjnej Androida.
Wszystko CC0 Kenney, bez zmian w samych grafikach — tylko ułożone i
przeskalowane względem siebie.
- `icon.png` reużyte też na ekranach startowych (`#loader`, `#splash`) zamiast
  emotikony skały — plus `assets/space/jupiter.png` (Endless Sky, ta sama
  licencja CC BY-SA co planety w tle) jako subtelna dekoracja w rogu.

## Sprite'y misji dziennych (`assets/missions/`)
Świeże pakiety Kenney (jeszcze nieużyte gdzie indziej w grze — żeby ikony misji
nie powielały grafik z innych zakładek):
- „Space Shooter Extension" — rakieta (`rocket.png`, misja „Kup ulepszenia").
- „Abstract Platformer" — niebieski i żółty kryształ (`crystal.png` — misja
  „Wydobądź kryształy", `comet.png` — misja „Złap złote komety", kolor złoty
  nawiązuje do koloru samej komety w grze).
- „UI Pack: Space" — kursor z dłonią (`tap.png`, misja „Kliknij X razy").
- „Generic Items" — klucz płaski (`wrench.png`, misja „Zbuduj budynki";
  ten sam pakiet co ikony w Sklepie, ale inny, dotąd nieużyty plik).
- „Game Icons" — klaps filmowy (`adplay.png`, misja „Obejrzyj reklamę").

## Asteroidy/księżyc w tle (`assets/space/`, część Kenney CC0)
- Pakiety: „Background Elements Redux" (pełny księżyc), „Space Shooter Redux" (asteroidy/meteory,
  tekstura mgławicy `nebulaBlob.png` z archiwalnego „Space shooter assets (retired)").
- Używane w js/space.js zamiast rysowanych proceduralnie kółek. Dodatkowo rozrzucone drobne
  asteroidy w tle i wolno dryfujące statki (assets/buildings/) dla gęstszej, żywszej sceny.

## Planety i statki bossów (`assets/space/`, `assets/bosses/`) — UWAGA: inna licencja niż reszta

Osiem prawdziwie renderowanych planet w tle — po jednej „hero" planecie na
każdy z 8 sektorów (mercury.png, neptune.png, earth.png, mars.png, jupiter.png,
violetGasGiant.png, uranus.png, saturn.png) — oraz pięć statków-bossów
(`assets/bosses/boss0-4.png`) pochodzą z gry open source **Endless Sky**
(https://github.com/endless-sky/endless-sky, katalogi `images/planet/` i
`images/ship/`):
- boss0 (Obsydianowy Kolos) = `asteroid adult.png`
- boss1 (Strażnik Pierścieni) = `quarg wyvern.png`
- boss2 (Piroklast) = `aberrant chomper.png`
- boss3 (Lodowy Behemot) = `behemoth.png`
- boss4 (Pożeracz Światów) = `leviathan.png`

Te obrazy są na licencji **CC BY-SA 4.0** (Creative Commons
Uznanie autorstwa — Na tych samych warunkach) —
https://creativecommons.org/licenses/by-sa/4.0/
Autorzy (wg `copyright` projektu Endless Sky): planety i boss3/boss4 —
Michael Zahniser, Maximilian Korber, Iaz Poolar, Matthew Smestad, Amazinite;
boss0/boss2 — Becca Tommaso; boss1 — 1010todd (na bazie prac Michaela
Zahnisera, na tej samej licencji).

**W przeciwieństwie do reszty grafik w tym pliku (CC0), ta licencja WYMAGA
podania autorstwa** przy dystrybucji gry. Powyższy akapit stanowi tę
atrybucję — należy go zachować przy publikacji.
