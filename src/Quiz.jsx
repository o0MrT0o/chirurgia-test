import { useState, useEffect } from "react";

const questions = [
  // === PDF - 14 pytań otwartych → format ABCD ===
  {
    id: 1,
    source: "PDF",
    question: "Jakie naczynia odpowiadają za unaczynienie wątroby?",
    options: [
      "Tętnica wątrobowa właściwa (odżywcze) i żyła wrotna (czynnościowe)",
      "Tętnica wątrobowa właściwa i żyła główna dolna",
      "Żyła wrotna i żyły wątrobowe",
      "Tętnica trzewna i żyła wrotna",
    ],
    correct: 0,
  },
  {
    id: 2,
    source: "PDF",
    question: "Co to jest laparoskopia?",
    options: [
      "Chirurgiczne otwarcie powłok jamy brzusznej",
      "Technika małoinwazyjna – wprowadzenie optyki i narzędzi przez małe nacięcia pod kontrolą monitora",
      "Endoskopowe badanie jelita grubego",
      "Drenaż jamy brzusznej pod kontrolą USG",
    ],
    correct: 1,
  },
  {
    id: 3,
    source: "PDF",
    question: "Co to jest rektoskopia?",
    options: [
      "Endoskopowe badanie żołądka i dwunastnicy",
      "Badanie jelita cienkiego kapsułką endoskopową",
      "Endoskopowe badanie kanału odbytu i odbytnicy przy użyciu sztywnego wziernika",
      "Laparoskopowa ocena odbytnicy i esicy",
    ],
    correct: 2,
  },
  {
    id: 4,
    source: "PDF",
    question: "Do czego służy skala Forresta?",
    options: [
      "Oceny głębokości śpiączki u chorych neurologicznych",
      "Klasyfikacji zaawansowania nowotworów jelita grubego",
      "Oceny stopnia oparzeń skóry",
      "Endoskopowej klasyfikacji krwawień z górnego odcinka przewodu pokarmowego",
    ],
    correct: 3,
  },
  {
    id: 5,
    source: "PDF",
    question: "Termoablację w chirurgii stosuje się do:",
    options: [
      "Leczenia kamicy żółciowej i przewodowej",
      "Miejscowego niszczenia guzów nowotworowych w narządach miąższowych (np. wątrobie)",
      "Tamowania krwawień z naczyń obwodowych",
      "Leczenia przepuklin metodą beznapięciową",
    ],
    correct: 1,
  },
  {
    id: 6,
    source: "PDF",
    question: "Jak powinno być leczone żółciopochodne zapalenie trzustki?",
    options: [
      "Wyłącznie lekami przeciwbólowymi i nawodnieniem, bez interwencji",
      "Natychmiastową cholecystektomią w fazie ostrej zapalenia",
      "ECPW (sfinkterotomia) przy zapaleniu dróg żółciowych/uwięźniętym złogu, następnie cholecystektomia laparoskopowa",
      "Resekcją trzustki jako leczenie przyczynowe",
    ],
    correct: 2,
  },
  {
    id: 7,
    source: "PDF",
    question:
      "Jakie postępowanie przy zaawansowanym raku głowy trzustki z nieresekcyjnością i żółtaczką mechaniczną?",
    options: [
      "Resekcja paliatywna głowy trzustki z zespoleniem",
      "Chemioterapia jako jedyne postępowanie",
      "Protezowanie dróg żółciowych endoskopowo (stent), drenaż przezskórny (PTD) lub zespolenie omijające",
      "Przeszczep wątroby i dróg żółciowych",
    ],
    correct: 2,
  },
  {
    id: 8,
    source: "PDF",
    question:
      "Jaką metodę oceny powierzchni oparzenia stosuje się u dzieci (w odróżnieniu od dorosłych)?",
    options: [
      "Regułę dziewiątek Wallace'a – taką samą jak u dorosłych",
      "Wyłącznie regułę dłoni pacjenta (1% powierzchni ciała)",
      "Tabele Lunda i Browdera, uwzględniające większą proporcję głowy u dzieci",
      "Skalę Parklanda przeliczaną na kilogram masy ciała",
    ],
    correct: 2,
  },
  {
    id: 9,
    source: "PDF",
    question: "Czym charakteryzują się oparzenia głębokie stopnia IIb?",
    options: [
      "Obejmują wyłącznie naskórek; silny ból, gojenie bez blizn",
      "Sięgają głęboko do skóry właściwej; blada rana, mniejszy ból, gojenie z pozostawieniem blizny",
      "Obejmują tkanki podskórne i mięśnie; wymagają amputacji",
      "Są bezbolesne (uszkodzenie receptorów) i wymagają natychmiastowego przeszczepu skóry",
    ],
    correct: 1,
  },
  {
    id: 10,
    source: "PDF",
    question:
      "Jakie są wskazania do operacyjnego leczenia choroby wrzodowej żołądka i dwunastnicy?",
    options: [
      "Każdy wrzód potwierdzony endoskopowo, bez względu na objawy",
      "Wrzód oporny na leczenie farmakologiczne przez 2 tygodnie",
      "Powikłania: perforacja, masywny krwotok nieopanowany endoskopowo, zwężenie odźwiernika",
      "Zakażenie H. pylori oporne na dwie linie antybiotyków",
    ],
    correct: 2,
  },
  {
    id: 11,
    source: "PDF",
    question:
      "Zespół Boerhaavego – co oznacza to eponiomiczne określenie kliniczne?",
    options: [
      "Podłużne pęknięcie błony śluzowej wpustu żołądka po wymiotach (bez perforacji)",
      "Samoistne pełnościenne pęknięcie przełyku, zwykle po gwałtownych wymiotach",
      "Perforacja wrzodu żołądka do jamy otrzewnej",
      "Pęknięcie śledziony po tępym urazie brzucha",
    ],
    correct: 1,
  },
  {
    id: 12,
    source: "PDF",
    question: "Na czym polega reguła Goodsalla w diagnostyce przetok odbytu?",
    options: [
      "Klasyfikuje hemoroidy na podstawie stopnia wypadania",
      "Przewiduje przebieg kanału przetoki na podstawie lokalizacji jej ujścia zewnętrznego względem linii poprzecznej odbytu",
      "Określa stopień zaawansowania raka kanału odbytu",
      "Wskazuje metodę leczenia szczeliny odbytu w zależności od czasu trwania",
    ],
    correct: 1,
  },
  {
    id: 13,
    source: "PDF",
    question: "Na czym polega radykalne leczenie operacyjne raka okrężnicy?",
    options: [
      "Resekcja guza z marginesem 1 cm i usunięcie minimum 5 węzłów chłonnych",
      "Chemioterapia neoadjuwantowa bez resekcji jako standard",
      "Resekcja odcinka jelita z marginesem min. 5 cm i limfadenektomia (min. 12 węzłów chłonnych)",
      "Napromienianie guza bez chirurgii jako jedyna metoda radykalna",
    ],
    correct: 2,
  },
  {
    id: 14,
    source: "PDF",
    question:
      "Klasyfikacja CEAP żylaków kończyn dolnych – co oznacza stopień C6?",
    options: [
      "Brak widocznych lub wyczuwalnych zmian żylnych",
      "Obecność żylaków bez objawów skórnych",
      "Owrzodzenie żylne wygojone (zamknięte)",
      "Czynne owrzodzenie żylne",
    ],
    correct: 3,
  },

  // === DOCX - 95 pytań wielokrotnego wyboru ===
  {
    id: 15,
    source: "DOCX",
    question:
      "Krwotok z żylaków przełyku najczęściej występuje u chorych:",
    options: [
      "z torbielowatością wątroby",
      "z marskością wątroby",
      "z niedrożnością żyły wrotnej (tzw. blok przedwątrobowy)",
      "prawidłowe B i C",
    ],
    correct: 3,
  },
  {
    id: 16,
    source: "DOCX",
    question:
      "U chorego z zatorem tętnicy udowej trzeba doraźnie wykonać:",
    options: ["amputację kończyny", "embolektomię", "trombektomię", "embolizację"],
    correct: 1,
  },
  {
    id: 17,
    source: "DOCX",
    question:
      "Jednym z celów opieki nad chorą po mastektomii jest zapobieganie obrzękowi limfatycznemu kończyny górnej. Które działanie musi podjąć pielęgniarka?",
    options: [
      "wysokie ułożenie chorej",
      "płaskie ułożenie chorej",
      "ułożenie kończyny górnej wzdłuż tułowia",
      "ułożenie kończyny górnej na klinie",
    ],
    correct: 3,
  },
  {
    id: 18,
    source: "DOCX",
    question: "Wymioty fusowate są charakterystycznym objawem dla:",
    options: [
      "krwawienia z wrzodu żołądka",
      "stenozy odźwiernika",
      "guza jelita grubego",
      "mechanicznej niedrożności jelit",
    ],
    correct: 0,
  },
  {
    id: 19,
    source: "DOCX",
    question: "Najczęstszą przyczyną zwężenia dużych tętnic jest:",
    options: [
      "zwężające zapalenie tętnic",
      "miażdżyca tętnic",
      "kiłowe zapalenie tętnic",
      "zatrucie sporyszem",
    ],
    correct: 1,
  },
  {
    id: 20,
    source: "DOCX",
    question:
      "Rolą pielęgniarki w zapobieganiu zakrzepowemu zapaleniu żył głębokich jest:",
    options: [
      "wczesne uruchamianie chorego po operacji",
      "unieruchomienie chorego w łóżku",
      "wykonywanie wszystkich czynności higienicznych przy chorym",
      "ułożenie kończyny na szynie",
    ],
    correct: 0,
  },
  {
    id: 21,
    source: "DOCX",
    question:
      "Bóle kolkowe w prawym podżebrzu promieniujące pod prawą łopatkę są typowym objawem:",
    options: [
      "niestrawności",
      "choroby wrzodowej",
      "zapalenia wyrostka robaczkowego",
      "kamicy pęcherzyka żółciowego",
    ],
    correct: 3,
  },
  {
    id: 22,
    source: "DOCX",
    question:
      "W celu rozpoznania kamicy pęcherzyka żółciowego jako pierwsze należy wykonać:",
    options: [
      "badanie górnego odcinka przewodu pokarmowego z barytem",
      "badanie USG",
      "badanie tomografii komputerowej",
      "przeglądowe zdjęcie jamy brzusznej",
    ],
    correct: 1,
  },
  {
    id: 23,
    source: "DOCX",
    question: "Pole operacyjne do zabiegu pielęgniarka opatrunkowa przygotowuje:",
    options: [
      "w dniu operacji w bloku operacyjnym",
      "wieczorem dzień przed operacją",
      "w dniu operacji przed zawiezieniem chorego do bloku operacyjnego",
      "pielęgniarka nie przygotowuje pola do operacji",
    ],
    correct: 0,
  },
  {
    id: 24,
    source: "DOCX",
    question:
      "Powikłaniem zmian miażdżycowych w tętnicach obwodowych może być:",
    options: [
      "zwężenie tętnicy",
      "niedrożność tętnicy",
      "tętniak",
      "wszystkie powyższe",
    ],
    correct: 3,
  },
  {
    id: 25,
    source: "DOCX",
    question:
      "Leczenie objawowych żylaków kończyn dolnych polega na usunięciu:",
    options: [
      "układu żył powierzchownych",
      "układu żył głębokich",
      "niewydolnych zastawek żylnych",
      "układu żył przeszywających",
    ],
    correct: 0,
  },
  {
    id: 26,
    source: "DOCX",
    question:
      "Chory oddał obfity stolec smolisty, wymiotował treścią fusowatą i zasłabł. Objawy te mogą świadczyć o:",
    options: [
      "krwotoku z żylaków przełyku",
      "krwotoku z uchyłków jelita grubego",
      "krwotoku z żylaków odbytu",
      "krwotoku z pękniętej śledziony",
    ],
    correct: 0,
  },
  {
    id: 27,
    source: "DOCX",
    question:
      "Chory podczas przetaczania krwi zgłasza duszność i przyspieszenie akcji serca. Pielęgniarka powinna:",
    options: [
      "zmniejszyć prędkość przetaczania krwi i powiadomić lekarza",
      "powiadomić lekarza",
      "przerwać toczenie krwi",
      "przerwać toczenie krwi i powiadomić lekarza",
    ],
    correct: 3,
  },
  {
    id: 28,
    source: "DOCX",
    question:
      "Które badanie nie wymaga specjalnego przygotowania przewodu pokarmowego przez pielęgniarkę?",
    options: [
      "kolonoskopia",
      "przeglądowe zdjęcie jamy brzusznej",
      "pasaż przewodu pokarmowego",
      "wlew doodbytniczy",
    ],
    correct: 1,
  },
  {
    id: 29,
    source: "DOCX",
    question:
      "U chorego z założonym cewnikiem do pęcherza zebrało się 500 ml moczu w ciągu 24 godzin. Świadczy to o:",
    options: ["bezmoczu", "wielomoczu", "skąpomoczu", "utrudnionym oddawaniu moczu"],
    correct: 2,
  },
  {
    id: 30,
    source: "DOCX",
    question: "Do objawów ogólnych zapalenia otrzewnej nie zalicza się:",
    options: [
      "przyspieszonego oddechu i tętna",
      "spadku ciśnienia tętniczego krwi",
      "skąpomoczu",
      "wilgotnego języka",
    ],
    correct: 3,
  },
  {
    id: 31,
    source: "DOCX",
    question: "Pobrany jednorazowo mocz do badania należy odesłać do laboratorium:",
    options: [
      "zaraz po pobraniu",
      "do dwóch godzin po pobraniu",
      "w dowolnym czasie",
      "wszystkie nieprawdziwe",
    ],
    correct: 1,
  },
  {
    id: 32,
    source: "DOCX",
    question:
      "Choremu przed usunięciem zaciśnięto dren Khera na kilka godzin. Pielęgniarka powinna zwrócić uwagę, czy chory nie skarży się na:",
    options: [
      "ból, uczucie rozpierania w prawym podżebrzu",
      "uczucie pełności w nadbrzuszu",
      "uczucie rozpierania w lewym podżebrzu",
      "uczucie rozpierania i pełności w podbrzuszu",
    ],
    correct: 0,
  },
  {
    id: 33,
    source: "DOCX",
    question:
      "Pielęgniarka po operacji tarczycy zauważyła znaczne przyspieszenie czynności serca i wysoką gorączkę. Objawy świadczą o:",
    options: [
      "niewydolności oddechowej",
      "krwotoku pooperacyjnym",
      "przełomie tyreotoksycznym",
      "są typowe po operacji tarczycy",
    ],
    correct: 2,
  },
  {
    id: 34,
    source: "DOCX",
    question: "Najczęściej wykonywanym zabiegiem laparoskopowym w Polsce jest:",
    options: [
      "nefrektomia",
      "plastyka przepukliny powłok brzusznych",
      "cholecystektomia",
      "appendektomia",
    ],
    correct: 2,
  },
  {
    id: 35,
    source: "DOCX",
    question: "Przed usunięciem sondy z żołądka pielęgniarka powinna:",
    options: [
      "przepłukać sondę 0,9% NaCl",
      "odessać treść zalegającą w sondzie",
      "odessać treść zalegającą w żołądku i w sondzie",
      "wykonać toaletę jamy ustnej",
    ],
    correct: 2,
  },
  {
    id: 36,
    source: "DOCX",
    question: "Pierwszy posiłek po operacji pielęgniarka może podać choremu:",
    options: [
      "w zależności od rodzaju operacji około 3 doby",
      "po powrocie perystaltyki jelit na zlecenie lekarza",
      "po powrocie perystaltyki jelit",
      "następnego dnia po operacji",
    ],
    correct: 1,
  },
  {
    id: 37,
    source: "DOCX",
    question:
      "Przygotowując pacjenta do gastroskopii pielęgniarka powinna zwrócić uwagę na to, aby:",
    options: [
      "wykonana była enema",
      "chory był na czczo",
      "chory był po śniadaniu",
      "chory przed badaniem oddał mocz",
    ],
    correct: 1,
  },
  {
    id: 38,
    source: "DOCX",
    question:
      "Pielęgniarka zespołu żywienia pozajelitowego nie podejmuje się u pacjenta:",
    options: [
      "zmiany opatrunku wokół kaniuli/cewnika",
      "kontroli szybkości wlewu",
      "prowadzenia bilansu wodno-elektrolitowego",
      "samodzielnego ustalenia szybkości wlewu",
    ],
    correct: 3,
  },
  {
    id: 39,
    source: "DOCX",
    question:
      "Szeroka źrenica w jednym oku u chorego nieprzytomnego może świadczyć o:",
    options: [
      "przebytym urazie bezpośrednim oka",
      "krwiaku śródczaszkowym po przebytym urazie głowy",
      "prawidłowe A i B",
      "przyjmowaniu środków narkotycznych",
    ],
    correct: 2,
  },
  {
    id: 40,
    source: "DOCX",
    question: "Perforacja wrzodu trawiennego dwunastnicy wymaga:",
    options: [
      "operacji doraźnej",
      "operacji planowej",
      "leczenia zachowawczego",
      "endoskopii w celu potwierdzenia rozpoznania",
    ],
    correct: 0,
  },
  {
    id: 41,
    source: "DOCX",
    question:
      "W 40 ml 0,5% roztworu lidokainy znajduje się czystej substancji:",
    options: ["10 mg", "200 mg", "100 mg", "0,02 g"],
    correct: 1,
  },
  {
    id: 42,
    source: "DOCX",
    question:
      "W celu ustalenia przyczyny krwawienia z górnego odcinka przewodu pokarmowego należy w pierwszym rzędzie wykonać:",
    options: [
      "RTG z kontrastem górnego odcinka przewodu pokarmowego",
      "arteriografię pnia trzewnego",
      "gastroskopię",
      "kolonoskopię",
    ],
    correct: 2,
  },
  {
    id: 43,
    source: "DOCX",
    question: "Ostre zapalenie wyrostka robaczkowego należy różnicować z:",
    options: [
      "zapaleniem przydatków po stronie prawej",
      "kolką nerkową prawostronną",
      "zapaleniem węzłów chłonnych krezki jelita cienkiego",
      "wszystkimi wymienionymi wyżej chorobami",
    ],
    correct: 3,
  },
  {
    id: 44,
    source: "DOCX",
    question:
      "Wzdęcie brzucha i brak perystaltyki w okresie pooperacyjnym najczęściej są spowodowane:",
    options: [
      "perforacją żołądka lub dwunastnicy",
      "niedrożnością porażenną jelit",
      "krwawieniem z wrzodu dwunastnicy",
      "powietrzem w jamie brzusznej pozostałym po operacji",
    ],
    correct: 1,
  },
  {
    id: 45,
    source: "DOCX",
    question:
      "Nagłe zasinienie i oziębienie kończyny dolnej u chorego z migotaniem przedsionków może wskazywać na:",
    options: [
      "zator tętniczy",
      "zakrzepowe zapalenie żył głębokich",
      "zatorowość płucną",
      "wszystkie powyższe odpowiedzi są prawidłowe",
    ],
    correct: 0,
  },
  {
    id: 46,
    source: "DOCX",
    question: "Krwiste stolce mogą być wynikiem:",
    options: [
      "żylaków odbytu",
      "nowotworów dolnego odcinka przewodu pokarmowego",
      "uchyłkowatości jelita grubego",
      "wszystkie powyższe odpowiedzi są prawidłowe",
    ],
    correct: 3,
  },
  {
    id: 47,
    source: "DOCX",
    question:
      "Najczęstszą przyczyną krwawienia z górnego odcinka przewodu pokarmowego jest:",
    options: [
      "rak żołądka",
      "żylaki przełyku",
      "wrzód żołądka lub dwunastnicy",
      "rak przełyku",
    ],
    correct: 2,
  },
  {
    id: 48,
    source: "DOCX",
    question: "Pierwszym objawem raka nerki jest zwykle:",
    options: [
      "bezbólowy krwiomocz",
      "ból",
      "zakażenie dróg moczowych",
      "zatrzymanie moczu",
    ],
    correct: 0,
  },
  {
    id: 49,
    source: "DOCX",
    question: "Do sposobów leczenia hiperkaliemii nie należy:",
    options: [
      "dożylne podanie roztworu glukozy z insuliną",
      "doodbytnicze podanie roztworu żywicy jonowymiennej",
      "donosowe podanie wazopresyny",
      "hemodializa",
    ],
    correct: 2,
  },
  {
    id: 50,
    source: "DOCX",
    question: "Zanokcica to:",
    options: [
      "zapalenie paznokcia palca wskazującego",
      "zapalenie wału paznokciowego",
      "zapalenie skóry kciuka",
      "wszystkie powyższe odpowiedzi są prawidłowe",
    ],
    correct: 1,
  },
  {
    id: 51,
    source: "DOCX",
    question:
      "Wyjaławianie (sterylizację) prowadzimy przy pomocy niżej wymienionych środków z wyjątkiem:",
    options: [
      "gotowania (100°C)",
      "tlenku etylenu",
      "gorącego suchego powietrza (170°C)",
      "wysokiej temperatury w parze wodnej (121 lub 134°C)",
    ],
    correct: 0,
  },
  {
    id: 52,
    source: "DOCX",
    question: "Dren Redona jest zakładany po operacji w celu:",
    options: [
      "odsysania powietrza",
      "odprowadzania żółci z przewodów żółciowych",
      "drenażu ropnia pośladka po jego nacięciu",
      "drenażu płynów ustrojowych (w tym krwi) z miejsca operowanego",
    ],
    correct: 3,
  },
  {
    id: 53,
    source: "DOCX",
    question: "Oznaczenie grupy krwi jest zbędne przy podawaniu:",
    options: [
      "osocza mrożonego",
      "albumin",
      "masy erytrocytarnej",
      "koncentratu płytek krwi",
    ],
    correct: 1,
  },
  {
    id: 54,
    source: "DOCX",
    question: "Wskazaniem do założenia drenażu opłucnej nie jest:",
    options: [
      "odma wentylowa",
      "odma zamknięta",
      "odma podskórna",
      "odma pod ciśnieniem",
    ],
    correct: 2,
  },
  {
    id: 55,
    source: "DOCX",
    question: "Oddech paradoksalny (opaczny) jest objawem:",
    options: [
      "złamania jednego żebra",
      "złamania co najmniej dwóch żeber w co najmniej dwóch miejscach",
      "ostrego zapalenia otrzewnej",
      "ciała obcego w górnych drogach oddechowych",
    ],
    correct: 1,
  },
  {
    id: 56,
    source: "DOCX",
    question: "W czasie tępego urazu jamy brzusznej najczęściej ulega uszkodzeniu:",
    options: ["jelito cienkie", "jelito grube", "trzustka", "śledziona"],
    correct: 3,
  },
  {
    id: 57,
    source: "DOCX",
    question: "Skala Glasgow jest sposobem oceniania:",
    options: [
      "stanu zaawansowania ostrego zapalenia trzustki",
      "stopnia ostrego niedokrwienia kończyny",
      "stanu świadomości (głębokości śpiączki) pacjenta",
      "poziomu glikemii",
    ],
    correct: 2,
  },
  {
    id: 58,
    source: "DOCX",
    question:
      "Po przetoczeniu krwi konserwowanej mogą wystąpić wszystkie poniższe powikłania z wyjątkiem:",
    options: [
      "wstrząsu hemolitycznego",
      "wstrząsu septycznego",
      "zaburzeń krzepnięcia",
      "hipokaliemii",
    ],
    correct: 3,
  },
  {
    id: 59,
    source: "DOCX",
    question:
      "Pielęgniarka powinna natychmiast powiadomić lekarza, jeśli stężenie potasu w surowicy wynosi:",
    options: [">5,5 mEq/l", "<5,0 mEq/l", ">4,0 mEq/l", ">3,5 mEq/l"],
    correct: 0,
  },
  {
    id: 60,
    source: "DOCX",
    question: "Decydujące o rozpoznaniu raka sutka jest:",
    options: [
      "badanie przedmiotowe",
      "USG",
      "mammografia",
      "badanie histopatologiczne",
    ],
    correct: 3,
  },
  {
    id: 61,
    source: "DOCX",
    question:
      "Najczęstszym powikłaniem stanowiącym największe zagrożenie u noworodków z wrodzoną niedrożnością przełyku lub dwunastnicy jest:",
    options: [
      "zapalenie płuc",
      "przedziurawienie przewodu pokarmowego",
      "zapalenie otrzewnej",
      "krwawienie do OUN",
    ],
    correct: 0,
  },
  {
    id: 62,
    source: "DOCX",
    question:
      "Obserwując pacjenta w pierwszej dobie po operacji pielęgniarka nie spodziewa się wystąpienia:",
    options: [
      "odleżyn",
      "niewydolności oddechowej",
      "niewydolności krążenia",
      "wymiotów",
    ],
    correct: 0,
  },
  {
    id: 63,
    source: "DOCX",
    question:
      "Pierwotny rak wątrobowo-komórkowy najczęściej rozwija się w wątrobie:",
    options: [
      "zdrowej",
      "uszkodzonej wirusami hepatotropowymi",
      "stłuszczałej",
      "z licznymi torbielami prostymi",
    ],
    correct: 1,
  },
  {
    id: 64,
    source: "DOCX",
    question: "Badania endoskopowe dolnego odcinka przewodu pokarmowego to:",
    options: [
      "rektoskopia, kolonoskopia, gastroskopia",
      "sigmoidoskopia, rektoskopia, duodenoskopia",
      "sigmoidoskopia, rektoskopia, kolonoskopia",
      "ezofagoskopia, kolonoskopia, sigmoidoskopia",
    ],
    correct: 2,
  },
  {
    id: 65,
    source: "DOCX",
    question: "Krwista wydzielina z brodawki sutka najczęściej występuje w:",
    options: [
      "raku przewodowym",
      "raku brodawczakowatym",
      "raku rdzeniastym",
      "brodawczaku",
    ],
    correct: 3,
  },
  {
    id: 66,
    source: "DOCX",
    question:
      "U dziecka z odpływem pęcherzowo-moczowodowym najczęstszym objawem jest:",
    options: [
      "ból w okolicy lędźwiowej",
      "wymioty",
      "niewydolność nerek",
      "zakażenie układu moczowego",
    ],
    correct: 3,
  },
  {
    id: 67,
    source: "DOCX",
    question:
      "Typowy zespół objawów najczęściej występujący u dzieci ze wstrząśnieniem mózgu to:",
    options: [
      "zaburzenia widzenia, wymioty, niedowłady kończyn, zaburzenia świadomości",
      "utrata przytomności, niepamięć wsteczna, bóle głowy, wymioty",
      "bóle brzucha, bóle głowy, gorączka, zaburzenia świadomości",
      "zawroty głowy, drgawki, bóle brzucha, zez zbieżny",
    ],
    correct: 1,
  },
  {
    id: 68,
    source: "DOCX",
    question: "Objawy nagłego zatrzymania krążenia to:",
    options: [
      "utrata przytomności, bezdech, drgawki",
      "bezdech, wiotkość mięśni, brak tętna na dużych tętnicach",
      "brak tętna na dużych tętnicach, kwaśny zapach, utrata przytomności",
      "szerokie sztywne źrenice, linia izoelektryczna w EKG, sztywność mięśni",
    ],
    correct: 1,
  },
  {
    id: 69,
    source: "DOCX",
    question:
      "W 20 ml 0,5% roztworu lidokainy znajduje się czystej substancji:",
    options: ["10 mg", "200 mg", "100 mg", "0,02 g"],
    correct: 2,
  },
  {
    id: 70,
    source: "DOCX",
    question: "Premedykacja przed operacją ma na celu:",
    options: [
      "uspokojenie chorego",
      "obniżenie ciśnienia tętniczego",
      "zniesienie bólu związanego z oczekiwaniem na operację i czynnościami przygotowawczymi",
      "prawidłowe A i C",
    ],
    correct: 3,
  },
  {
    id: 71,
    source: "DOCX",
    question: "Sepsa:",
    options: [
      "może wywołać gorączkę",
      "jej przyczyną jest najczęściej uogólnione zakażenie",
      "może prowadzić do uogólnionego wykrzepiania wewnątrznaczyniowego",
      "prawidłowe A i C",
    ],
    correct: 3,
  },
  {
    id: 72,
    source: "DOCX",
    question: "Przetoka zespolenia żołądkowo-dwunastniczego nie prowadzi do:",
    options: [
      "wystąpienia zaburzeń wodno-elektrolitowych",
      "niedożywienia",
      "zaburzeń odporności immunologicznej",
      "poprawy bilansu azotowego i stanu ogólnego chorego",
    ],
    correct: 3,
  },
  {
    id: 73,
    source: "DOCX",
    question:
      "Pielęgniarka zakłada opaski elastyczne lub bandażuje kończyny dolne przed zabiegiem operacyjnym:",
    options: [
      "wszystkim chorym",
      "chorym przed operacją usunięcia pęcherzyka żółciowego",
      "chorym z żylakami kończyn dolnych oraz z przewlekłą niewydolnością krążenia",
      "tylko chorym z żylakami kończyn dolnych",
    ],
    correct: 2,
  },
  {
    id: 74,
    source: "DOCX",
    question:
      "Spośród wymienionych chorób sutka okresowe dolegliwości bólowe daje:",
    options: [
      "włókniakogruczolak",
      "guz liściasty",
      "zwyrodnienie torbielowate",
      "brodawczak",
    ],
    correct: 2,
  },
  {
    id: 75,
    source: "DOCX",
    question:
      "Poprzez swoje działanie pielęgniarka może zapobiegać powikłaniom pooperacyjnym takim jak:",
    options: [
      "zapalenie otrzewnej, krwotok, zakażenie rany pooperacyjnej",
      "zakażenie dróg moczowych, niedrożność jelit, krwotok",
      "zapalenie płuc, zakażenie dróg moczowych, zakażenie rany operacyjnej",
      "niedrożność jelit, krwotok, zapalenie otrzewnej",
    ],
    correct: 2,
  },
  {
    id: 76,
    source: "DOCX",
    question: "W rozpoznaniu przetoki przewodu pokarmowego pomocnym nie jest:",
    options: [
      "badanie radiologiczne przewodu pokarmowego z barytem",
      "badanie radiologiczne z wodnym kontrastem (np. Uropoliną)",
      "podanie barwnika do światła przewodu pokarmowego",
      "wykonanie fistulografii pod kontrolą radiologiczną",
    ],
    correct: 0,
  },
  {
    id: 77,
    source: "DOCX",
    question:
      "Obserwując chorego po wycięciu pęcherzyka żółciowego pielęgniarka zwraca uwagę na:",
    options: [
      "pomiar ciśnienia tętniczego krwi i tętna",
      "kontrolę drenu Khera",
      "kontrolę parametrów RR i tętna, opatrunku i drenu Khera",
      "kontrolę opatrunku i diurezy",
    ],
    correct: 2,
  },
  {
    id: 78,
    source: "DOCX",
    question:
      "Pielęgnowanie nieprzytomnego chorego po urazie głowy ma na celu przede wszystkim:",
    options: [
      "zapobieganie powikłaniom ze strony układu oddechowego",
      "zapobieganie powikłaniom ze strony wielu kobiet",
      "zapobieganie powstawaniu odleżyn",
      "zapobieganie odwodnieniu",
    ],
    correct: 0,
  },
  {
    id: 79,
    source: "DOCX",
    question:
      "Jaki charakterystyczny problem dotyczy chorych po amputacji kończyny dolnej w następstwie choroby Bürgera?",
    options: [
      "ból rany pooperacyjnej",
      "bóle fantomowe",
      "trudności w poruszaniu się",
      "niechęć do współpracy z zespołem terapeutycznym",
    ],
    correct: 1,
  },
  {
    id: 80,
    source: "DOCX",
    question:
      "Pielęgnując chorego z rozległym oparzeniem można zapobiegać powikłaniom poprzez:",
    options: [
      "zapewnienie w otoczeniu chorego niskiej wilgotności powietrza",
      "unieruchomienie chorego",
      "przestrzeganie zasad aseptyki i antyseptyki",
      "podawanie choremu niskokalorycznych posiłków",
    ],
    correct: 2,
  },
  {
    id: 81,
    source: "DOCX",
    question:
      "Pielęgniarka współuczestniczy w ocenie stanu odżywienia chorego żywionego pozajelitowo poprzez:",
    options: [
      "prowadzenie bilansu wodnego",
      "pomiar masy ciała",
      "obserwację diurezy",
      "systematyczną kontrolę szybkości wlewu preparatów",
    ],
    correct: 1,
  },
  {
    id: 82,
    source: "DOCX",
    question:
      "Jednym z problemów pielęgnacyjnych u chorego po przeszczepie wątroby jest podatność na zakażenia. Celem działań pielęgniarskich jest:",
    options: [
      "zapobieganie powstawaniu odleżyn",
      "poprawa krążenia",
      "poprawa wentylacji",
      "zapobieganie infekcjom",
    ],
    correct: 3,
  },
  {
    id: 83,
    source: "DOCX",
    question:
      "Pielęgniarka podając choremu dożylnie cytostatyk zauważyła wydostanie leku poza naczynia. W takim przypadku pielęgniarce nie wolno:",
    options: [
      "obłożyć miejsca wydostania się leku lodem",
      "nałożyć suchego, ciepłego opatrunku",
      "zaaspirować podanego leku",
      "przepłukiwać naczynia krwionośnego solą fizjologiczną",
    ],
    correct: 3,
  },
  {
    id: 84,
    source: "DOCX",
    question: "Objawy ciężkiego wstrząsu krwotocznego to:",
    options: [
      "spadek ciśnienia skurczowego poniżej 100 mmHg",
      "przyspieszenie tętna",
      "spadek diurezy",
      "wszystkie prawidłowe",
    ],
    correct: 3,
  },
  {
    id: 85,
    source: "DOCX",
    question:
      "Najskuteczniejsza metoda diagnostyczna krwotoku z górnego odcinka przewodu pokarmowego to:",
    options: [
      "gastroduodenoskopia",
      "RTG górnego odcinka przewodu pokarmowego",
      "angiografia pnia trzewnego",
      "RTG przeglądowy jamy brzusznej",
    ],
    correct: 0,
  },
  {
    id: 86,
    source: "DOCX",
    question:
      "\"Triada Charcota\" (bóle w nadbrzuszu, gorączka, żółtaczka) – charakterystyczny dla:",
    options: [
      "kamicy pęcherzyka żółciowego",
      "wewnątrzwątrobowej kamicy przewodowej",
      "raka głowy trzustki",
      "ropnego zapalenia dróg żółciowych",
    ],
    correct: 3,
  },
  {
    id: 87,
    source: "DOCX",
    question:
      "Objaw Courvoisiera (duży niebolesny pęcherzyk żółciowy u chorego z żółtaczką) występuje typowo w przypadkach:",
    options: [
      "raka wnęki wątroby",
      "przetoki pęcherzykowo-dwunastniczej",
      "raka głowy trzustki",
      "pierwotnej marskości żółciowej",
    ],
    correct: 2,
  },
  {
    id: 88,
    source: "DOCX",
    question:
      "Spośród wszystkich guzów przerzutowych wątroby najczęstsze są przerzuty:",
    options: [
      "raka żołądka",
      "raka sutka",
      "raka jelita grubego",
      "czerniaka złośliwego",
    ],
    correct: 2,
  },
  {
    id: 89,
    source: "DOCX",
    question:
      "Największe szanse powodzenia operacyjnego leczenia przerzutów do wątroby istnieją, gdy są to przerzuty:",
    options: [
      "raka żołądka",
      "raka sutka",
      "raka jelita grubego",
      "czerniaka złośliwego",
    ],
    correct: 2,
  },
  {
    id: 90,
    source: "DOCX",
    question: "Rak wątrobowokomórkowy rozwija się najczęściej u pacjentów z:",
    options: [
      "marskością pozapalną wątroby",
      "przewlekłym stwardniającym zapaleniem dróg żółciowych",
      "zarzucaniem treści pokarmowej do dróg żółciowych",
      "żółtaczką hemolityczną",
    ],
    correct: 0,
  },
  {
    id: 91,
    source: "DOCX",
    question: "Przeciwwskazaniem do przeszczepienia wątroby jest:",
    options: [
      "rozpoznanie procesu nowotworowego poza wątrobą",
      "alkoholowa etiologia marskości wątroby",
      "nieleczone zakażenie wirusem C",
      "przebyte operacje wątroby lub dróg żółciowych",
    ],
    correct: 0,
  },
  {
    id: 92,
    source: "DOCX",
    question: "Pierwszym objawem raka głowy trzustki najczęściej jest:",
    options: [
      "opasujący ból w nadbrzuszu",
      "bezbólowa żółtaczka",
      "pojawienie się obfitych wymiotów",
      "biegunka, szczególnie po tłustych pokarmach",
    ],
    correct: 1,
  },
  {
    id: 93,
    source: "DOCX",
    question:
      "Radykalne leczenie raka głowy trzustki polega zwykle na usunięciu zmienionej chorobowo części narządu:",
    options: [
      "bez konieczności usuwania innych narządów",
      "wraz z pozostałymi częściami trzustki",
      "wraz z dwunastnicą",
      "wraz z dwunastnicą, pęcherzykiem żółciowym i częścią przewodu żółciowego wspólnego",
    ],
    correct: 3,
  },
  {
    id: 94,
    source: "DOCX",
    question:
      "Wskazaniem do leczenia operacyjnego w przypadku przewlekłego zapalenia trzustki są:",
    options: [
      "zaburzenia trawienne niedoborem enzymów",
      "cukrzyca",
      "stany hipoglikemiczne",
      "uporczywe bóle",
    ],
    correct: 3,
  },
  {
    id: 95,
    source: "DOCX",
    question:
      "Pojawienie się bezbólowej żółtaczki u 60-letniego pacjenta bez chorób wątroby i dróg żółciowych powinno budzić przede wszystkim podejrzenie:",
    options: [
      "kamicy dróg żółciowych",
      "nowotworu dróg żółciowych lub głowy trzustki",
      "ostrego zapalenia dróg żółciowych",
      "bliznowatego zwężenia dróg żółciowych",
    ],
    correct: 1,
  },
  {
    id: 96,
    source: "DOCX",
    question: "Najmniej prawdopodobną przyczyną trudności w połykaniu jest:",
    options: [
      "rak przełyku",
      "achalazja wpustu",
      "przebyte przed wielu laty oparzenia chemiczne przełyku",
      "obecność dużych żylaków przełyku",
    ],
    correct: 3,
  },
  {
    id: 97,
    source: "DOCX",
    question:
      "W leczeniu chirurgicznym raka żołądka najczęściej istnieją wskazania do wykonania:",
    options: [
      "wycięcia całego żołądka wraz z wpustem i odźwiernikiem",
      "resekcji górnej części żołądka wraz z wpustem",
      "resekcji dolnej części żołądka wraz z odźwiernikiem",
      "resekcji trzonu żołądka z pozostawieniem wpustu i odźwiernika",
    ],
    correct: 2,
  },
  {
    id: 98,
    source: "DOCX",
    question:
      "Spośród powikłań choroby wrzodowej leczenie operacyjne wskazane jest w przypadku:",
    options: [
      "przedziurawienia wrzodu z zapaleniem otrzewnej",
      "krwotoku nie dającego się opanować metodami endoskopowymi",
      "zwężenia odźwiernika",
      "wszystkich wymienionych",
    ],
    correct: 3,
  },
  {
    id: 99,
    source: "DOCX",
    question: "Spośród niżej wymienionych stanów leczenia chirurgicznego nie wymaga:",
    options: [
      "przepuklina rozworu przełykowego przepony z objawem refluksu",
      "achalazja wpustu powodująca dysfagię",
      "niepowikłany wrzód dwunastnicy",
      "śródściennie położony guz żołądka",
    ],
    correct: 2,
  },
  {
    id: 100,
    source: "DOCX",
    question:
      "65-letni mężczyzna po przejściu ok. 200 m odczuwa silny ból w łydce, ustępujący po odpoczynku. Prawdą jest, że pacjent:",
    options: [
      "najprawdopodobniej ma niedrożność tętnicy spowodowaną miażdżycą",
      "powinien mieć wykonane doplerowskie badanie tętnic",
      "może mieć wskazania do arteriografii",
      "wszystkie twierdzenia są prawdziwe",
    ],
    correct: 3,
  },
  {
    id: 101,
    source: "DOCX",
    question: "Przeciwwskazaniem do operacyjnego leczenia żylaków podudzi jest:",
    options: [
      "niewydolność zastawek żył powierzchownych",
      "niewydolność zastawek żył przeszywających",
      "zakrzepica żył głębokich",
      "wszystkie wymienione",
    ],
    correct: 2,
  },
  {
    id: 102,
    source: "DOCX",
    question: "Patologię jelita grubego najłatwiej rozpoznaje się wykonując:",
    options: [
      "przeglądowe zdjęcie jamy brzusznej",
      "USG",
      "wlew doodbytniczy lub kolonoskopię",
      "gastroskopię",
    ],
    correct: 2,
  },
  {
    id: 103,
    source: "DOCX",
    question: "Obecność świeżej krwi w stolcu może przemawiać za:",
    options: [
      "żylakami odbytu",
      "rakiem odbytu",
      "polipami esicy",
      "wszystkie prawidłowe",
    ],
    correct: 3,
  },
  {
    id: 104,
    source: "DOCX",
    question:
      "Celem potwierdzenia niedrożności przewodu pokarmowego należy wykonać:",
    options: [
      "USG",
      "USG-Doppler",
      "przeglądowe zdjęcie jamy brzusznej",
      "prawidłowe A i B",
    ],
    correct: 2,
  },
  {
    id: 105,
    source: "DOCX",
    question: "Najczęstszą przyczyną uszkodzenia nerwu promieniowego jest:",
    options: [
      "złamanie kości łokciowej",
      "złamanie kości promieniowej",
      "złamanie kości nadgarstka w miejscu typowym",
      "złamanie kości ramiennej",
    ],
    correct: 3,
  },
  {
    id: 106,
    source: "DOCX",
    question:
      "Podstawowym lekiem stosowanym w monoterapii i leczeniu skojarzonym w zgorzeli gazowej jest:",
    options: [
      "penicylina benzylowa",
      "dowolny antybiotyk o szerokim zakresie działania",
      "metronidazol",
      "penicylina w dużych dawkach w skojarzeniu z cefalosporyną",
    ],
    correct: 0,
  },
  {
    id: 107,
    source: "DOCX",
    question: "Do objawów wstrząśnienia mózgu należy:",
    options: [
      "dezorientacja",
      "niepamięć wsteczna i następcza",
      "utrata przytomności",
      "wszystkie prawidłowe",
    ],
    correct: 3,
  },
  {
    id: 108,
    source: "DOCX",
    question:
      "Badaniem obrazowym z wyboru w przypadku podejrzenia kamicy nerkowej jest:",
    options: [
      "tomografia komputerowa",
      "rezonans magnetyczny",
      "USG",
      "wlew doodbytniczy",
    ],
    correct: 2,
  },
  {
    id: 109,
    source: "DOCX",
    question: "W leczeniu wysokiej przetoki przewodu pokarmowego niezbędne jest:",
    options: [
      "drenaż okolicy miejsca przetoki",
      "zabezpieczenie skóry wokół przetoki",
      "uzyskanie prawidłowego bilansu wodno-elektrolitowego",
      "wszystkie prawidłowe",
    ],
    correct: 3,
  },
];

const LABELS = ["A", "B", "C", "D"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("menu"); // menu | quiz | review | result
  const [reviewFilter, setReviewFilter] = useState("all");
  const [questionCount, setQuestionCount] = useState(20);
  const [showExplanation, setShowExplanation] = useState(false);

  function startQuiz(count) {
    const shuffled = shuffle(questions).slice(0, count);
    setQuizQuestions(shuffled);
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setAnswers({});
    setPhase("quiz");
    setShowExplanation(false);
  }

  function handleSelect(idx) {
    if (confirmed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null) return;
    const q = quizQuestions[current];
    setAnswers((prev) => ({
      ...prev,
      [current]: { selected, correct: q.correct, isRight: selected === q.correct },
    }));
    setConfirmed(true);
  }

  function handleNext() {
    if (current + 1 < quizQuestions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setShowExplanation(false);
    } else {
      setPhase("result");
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent((c) => c - 1);
      const prevAnswer = answers[current - 1];
      setSelected(prevAnswer ? prevAnswer.selected : null);
      setConfirmed(!!prevAnswer);
      setShowExplanation(false);
    }
  }

  const q = quizQuestions[current];
  const score = Object.values(answers).filter((a) => a.isRight).length;
  const total = quizQuestions.length;
  const answered = Object.keys(answers).length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const filteredReview = quizQuestions.filter((_, i) => {
    if (reviewFilter === "wrong") return answers[i] && !answers[i].isRight;
    if (reviewFilter === "right") return answers[i] && answers[i].isRight;
    return true;
  });

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { background: #0d1117; }

    .quiz-root {
      min-height: 100vh;
      background: #0d1117;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px 16px 48px;
    }

    .container {
      width: 100%;
      max-width: 760px;
    }

    /* MENU */
    .menu-card {
      background: linear-gradient(135deg, #161d2a 0%, #1a2235 100%);
      border: 1px solid #2a3547;
      border-radius: 20px;
      padding: 48px 40px;
      text-align: center;
      margin-top: 40px;
    }

    .menu-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .menu-title {
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      color: #f0f4ff;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .menu-sub {
      color: #7a8fa6;
      font-size: 0.95rem;
      margin-bottom: 36px;
    }

    .count-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    .count-btn {
      background: #1e2b3e;
      border: 1px solid #2e3f56;
      border-radius: 12px;
      color: #a8c0d8;
      padding: 14px 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }

    .count-btn:hover, .count-btn.active {
      background: #1e4080;
      border-color: #3b82f6;
      color: #93c5fd;
    }

    .count-btn small {
      display: block;
      font-size: 0.7rem;
      font-weight: 400;
      color: #5a7a96;
      margin-top: 2px;
    }

    .start-btn {
      width: 100%;
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 1.05rem;
      font-weight: 600;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
      letter-spacing: 0.5px;
    }

    .start-btn:hover {
      background: linear-gradient(135deg, #1e40af, #1d4ed8);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(37,99,235,0.3);
    }

    .stats-row {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }

    .stat-pill {
      background: #161d2a;
      border: 1px solid #2a3547;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 0.8rem;
      color: #6b8299;
    }

    /* QUIZ HEADER */
    .quiz-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
    }

    .progress-wrap {
      flex: 1;
      background: #1e2b3e;
      border-radius: 8px;
      height: 6px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #38bdf8);
      border-radius: 8px;
      transition: width 0.4s ease;
    }

    .q-counter {
      font-size: 0.85rem;
      color: #7a8fa6;
      white-space: nowrap;
      font-weight: 500;
    }

    .source-badge {
      font-size: 0.7rem;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .badge-pdf {
      background: #1e3a5f;
      color: #60a5fa;
      border: 1px solid #2563eb40;
    }

    .badge-docx {
      background: #1e3d2f;
      color: #4ade80;
      border: 1px solid #16a34a40;
    }

    /* QUESTION CARD */
    .q-card {
      background: #161d2a;
      border: 1px solid #2a3547;
      border-radius: 18px;
      padding: 28px 28px 24px;
      margin-bottom: 16px;
    }

    .q-num {
      font-size: 0.75rem;
      color: #3b82f6;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .q-text {
      font-size: 1.05rem;
      color: #dde8f5;
      line-height: 1.6;
      font-weight: 400;
    }

    /* OPTIONS */
    .options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
    }

    .option-btn {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #161d2a;
      border: 1.5px solid #2a3547;
      border-radius: 14px;
      padding: 14px 18px;
      cursor: pointer;
      transition: all 0.18s;
      text-align: left;
      color: #c8d8e8;
      font-size: 0.95rem;
      line-height: 1.5;
      font-family: 'DM Sans', sans-serif;
    }

    .option-btn:hover:not(.disabled) {
      border-color: #3b82f6;
      background: #1a2540;
    }

    .option-btn.selected {
      border-color: #3b82f6;
      background: #1a2d4e;
    }

    .option-btn.correct {
      border-color: #22c55e;
      background: #0f2d1a;
      color: #86efac;
    }

    .option-btn.wrong {
      border-color: #ef4444;
      background: #2d0f0f;
      color: #fca5a5;
    }

    .option-btn.disabled {
      cursor: default;
    }

    .option-label {
      min-width: 26px;
      height: 26px;
      border-radius: 8px;
      background: #1e2b3e;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #7a8fa6;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .option-btn.selected .option-label {
      background: #2563eb;
      color: white;
    }

    .option-btn.correct .option-label {
      background: #16a34a;
      color: white;
    }

    .option-btn.wrong .option-label {
      background: #dc2626;
      color: white;
    }

    /* ACTIONS */
    .actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      border: none;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }

    .btn-outline {
      background: transparent;
      border: 1.5px solid #2a3547;
      color: #7a8fa6;
    }

    .btn-outline:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #60a5fa;
    }

    .btn-outline:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e40af, #1d4ed8);
    }

    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-success {
      background: linear-gradient(135deg, #15803d, #16a34a);
      color: white;
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #14532d, #15803d);
    }

    /* FEEDBACK */
    .feedback {
      background: #111827;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.88rem;
      color: #94a3b8;
      margin-bottom: 14px;
      border-left: 3px solid #2563eb;
      line-height: 1.5;
    }

    .feedback.right {
      border-left-color: #22c55e;
      color: #86efac;
    }

    .feedback.wrong {
      border-left-color: #ef4444;
      color: #fca5a5;
    }

    /* RESULT */
    .result-card {
      background: #161d2a;
      border: 1px solid #2a3547;
      border-radius: 20px;
      padding: 40px 32px;
      text-align: center;
      margin-top: 16px;
    }

    .result-emoji {
      font-size: 52px;
      margin-bottom: 16px;
    }

    .result-score {
      font-family: 'DM Serif Display', serif;
      font-size: 4rem;
      font-weight: 400;
      line-height: 1;
      margin-bottom: 6px;
    }

    .score-green { color: #4ade80; }
    .score-yellow { color: #facc15; }
    .score-red { color: #f87171; }

    .result-label {
      color: #7a8fa6;
      font-size: 0.95rem;
      margin-bottom: 28px;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }

    .result-stat {
      background: #1e2b3e;
      border-radius: 12px;
      padding: 16px 8px;
    }

    .result-stat .val {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .result-stat .lbl {
      font-size: 0.75rem;
      color: #6b8299;
    }

    .result-btns {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* REVIEW */
    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 8px;
      flex-wrap: wrap;
    }

    .review-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.4rem;
      color: #f0f4ff;
    }

    .filter-pills {
      display: flex;
      gap: 6px;
    }

    .filter-pill {
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid #2a3547;
      background: transparent;
      color: #7a8fa6;
      font-size: 0.78rem;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
    }

    .filter-pill.active {
      background: #1e2b3e;
      border-color: #3b82f6;
      color: #60a5fa;
    }

    .review-item {
      background: #161d2a;
      border: 1px solid #2a3547;
      border-radius: 14px;
      padding: 18px 20px;
      margin-bottom: 12px;
    }

    .review-item.item-right { border-left: 3px solid #22c55e; }
    .review-item.item-wrong { border-left: 3px solid #ef4444; }

    .review-q {
      font-size: 0.9rem;
      color: #c8d8e8;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .review-answer {
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .review-answer.ra { color: #4ade80; }
    .review-answer.wa { color: #f87171; }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1.5px solid #2a3547;
      border-radius: 10px;
      color: #7a8fa6;
      padding: 8px 14px;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      margin-bottom: 20px;
      transition: all 0.2s;
    }

    .back-btn:hover { border-color: #3b82f6; color: #60a5fa; }
  `;

  if (phase === "menu") {
    return (
      <>
        <style>{styles}</style>
        <div className="quiz-root">
          <div className="container">
            <div className="menu-card">
              <div className="menu-icon">🏥</div>
              <h1 className="menu-title">Test z Chirurgii Pielęgniarskiej</h1>
              <p className="menu-sub">109 pytań · PDF + DOCX · Wybierz liczbę pytań</p>
              <div className="count-grid">
                {[10, 20, 30, 50, 109].map((n) => (
                  <button
                    key={n}
                    className={`count-btn${questionCount === n ? " active" : ""}`}
                    onClick={() => setQuestionCount(n)}
                  >
                    {n}
                    <small>pytań</small>
                  </button>
                ))}
              </div>
              <button className="start-btn" onClick={() => startQuiz(questionCount)}>
                Rozpocznij test →
              </button>
              <div className="stats-row">
                <span className="stat-pill">📄 14 pyt. z PDF</span>
                <span className="stat-pill">📝 95 pyt. z DOCX</span>
                <span className="stat-pill">🎲 Losowa kolejność</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "result") {
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "📚" : "💪";
    const colorClass = pct >= 80 ? "score-green" : pct >= 60 ? "score-yellow" : "score-red";
    const msg =
      pct >= 90 ? "Doskonale! Jesteś gotowy/a na egzamin." :
      pct >= 75 ? "Bardzo dobrze! Jeszcze trochę powtórzeń." :
      pct >= 60 ? "Nieźle, ale warto przejrzeć błędy." :
      "Zalecane dodatkowe powtórzenie materiału.";
    return (
      <>
        <style>{styles}</style>
        <div className="quiz-root">
          <div className="container">
            <div className="result-card">
              <div className="result-emoji">{emoji}</div>
              <div className={`result-score ${colorClass}`}>{pct}%</div>
              <p className="result-label">{msg}</p>
              <div className="result-grid">
                <div className="result-stat">
                  <div className="val" style={{ color: "#4ade80" }}>{score}</div>
                  <div className="lbl">Poprawnych</div>
                </div>
                <div className="result-stat">
                  <div className="val" style={{ color: "#f87171" }}>{total - score}</div>
                  <div className="lbl">Błędnych</div>
                </div>
                <div className="result-stat">
                  <div className="val" style={{ color: "#60a5fa" }}>{total}</div>
                  <div className="lbl">Łącznie</div>
                </div>
              </div>
              <div className="result-btns">
                <button className="btn btn-primary" onClick={() => setPhase("review")}>
                  📋 Przejrzyj odpowiedzi
                </button>
                <button className="btn btn-success" onClick={() => startQuiz(questionCount)}>
                  🔄 Nowy test ({questionCount} pytań)
                </button>
                <button className="btn btn-outline" onClick={() => setPhase("menu")}>
                  ← Menu główne
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (phase === "review") {
    return (
      <>
        <style>{styles}</style>
        <div className="quiz-root">
          <div className="container">
            <button className="back-btn" onClick={() => setPhase("result")}>
              ← Powrót do wyników
            </button>
            <div className="review-header">
              <span className="review-title">Przegląd odpowiedzi</span>
              <div className="filter-pills">
                {["all", "wrong", "right"].map((f) => (
                  <button
                    key={f}
                    className={`filter-pill${reviewFilter === f ? " active" : ""}`}
                    onClick={() => setReviewFilter(f)}
                  >
                    {f === "all" ? "Wszystkie" : f === "wrong" ? "❌ Błędne" : "✅ Poprawne"}
                  </button>
                ))}
              </div>
            </div>
            {filteredReview.map((rq, ri) => {
              const origIdx = quizQuestions.indexOf(rq);
              const ans = answers[origIdx];
              const isRight = ans?.isRight;
              return (
                <div key={rq.id} className={`review-item ${isRight ? "item-right" : "item-wrong"}`}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "#5a7a96", fontWeight: 600 }}>
                      PYT. {rq.id}
                    </span>
                    <span className={`source-badge ${rq.source === "PDF" ? "badge-pdf" : "badge-docx"}`}>
                      {rq.source}
                    </span>
                  </div>
                  <p className="review-q">{rq.question}</p>
                  {!isRight && ans && (
                    <p className="review-answer wa">
                      ✗ Twoja odpowiedź: {LABELS[ans.selected]}. {rq.options[ans.selected]}
                    </p>
                  )}
                  <p className="review-answer ra">
                    ✓ Prawidłowa: {LABELS[rq.correct]}. {rq.options[rq.correct]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // QUIZ PHASE
  const progressPct = ((current) / total) * 100;
  const isLast = current === total - 1;
  const currAnswer = answers[current];

  function getOptionClass(idx) {
    if (!confirmed) {
      return selected === idx ? "selected" : "";
    }
    if (idx === q.correct) return "correct";
    if (idx === selected && selected !== q.correct) return "wrong";
    return "disabled";
  }

  return (
    <>
      <style>{styles}</style>
      <div className="quiz-root">
        <div className="container">
          <div className="quiz-header">
            <button className="btn btn-outline" style={{ flex: "none", padding: "8px 14px", fontSize: "0.8rem" }} onClick={() => setPhase("menu")}>
              ✕
            </button>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="q-counter">{current + 1}/{total}</span>
            <span style={{ color: "#facc15", fontSize: "0.85rem", fontWeight: 600 }}>
              {score}/{answered}
            </span>
          </div>

          <div className="q-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="q-num">PYTANIE {current + 1}</span>
              <span className={`source-badge ${q.source === "PDF" ? "badge-pdf" : "badge-docx"}`}>
                {q.source}
              </span>
            </div>
            <p className="q-text">{q.question}</p>
          </div>

          <div className="options">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn ${getOptionClass(idx)} ${confirmed ? "disabled" : ""}`}
                onClick={() => handleSelect(idx)}
              >
                <span className="option-label">{LABELS[idx]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {confirmed && (
            <div className={`feedback ${currAnswer?.isRight ? "right" : "wrong"}`}>
              {currAnswer?.isRight
                ? `✓ Poprawna odpowiedź! ${LABELS[q.correct]}. ${q.options[q.correct]}`
                : `✗ Błąd. Prawidłowa odpowiedź: ${LABELS[q.correct]}. ${q.options[q.correct]}`}
            </div>
          )}

          <div className="actions">
            <button className="btn btn-outline" onClick={handlePrev} disabled={current === 0}>
              ←
            </button>
            {!confirmed ? (
              <button className="btn btn-primary" onClick={handleConfirm} disabled={selected === null}>
                Sprawdź
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleNext}>
                {isLast ? "Zakończ test ✓" : "Następne →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
