'use strict';
/* =====================================================================
   MUSIC.JS — spokojna, zapętlona muzyka ambient generowana na żywo
   przez WebAudio. Zero plików = zero dodatkowych megabajtów w APK.

   Budowa ścieżki:
   • Pad (4 głosy) — powolny, morfujący dron akordowy z falującym filtrem.
   • Bas — miękka nuta podstawowa akordu.
   • Dzwonki — rzadka, losowa melodia z pentatoniki (planowana z wyprzedzeniem
     klasycznym schedulerem „lookahead”, więc rytm jest równy mimo jittera JS).
   • Pogłos — konwolucja z proceduralnym impulsem daje kosmiczną przestrzeń.

   Współdzieli AudioContext z Sound (Sound.ctx()), więc nie mnożymy kontekstów
   i korzystamy z tego samego odblokowania gestem użytkownika.
   ===================================================================== */

const Music = (() => {
  let ctx = null;
  let master = null, wet = null, reverb = null; // sumy: sucho + pogłos
  let padGain = null, padFilter = null, padLfo = null;
  const padVoices = [];                 // { osc, gain }
  let bassOsc = null, bassGain = null;
  let running = false;
  let schedTimer = null;
  let nextNoteTime = 0;                 // czas kolejnej nuty melodii (w sek. kontekstu)
  let step = 0;                         // licznik kroków sekwencera
  let chordIdx = 0;                     // aktualny akord w progresji
  let nextChordStep = 0;                // krok, na którym zmienimy akord

  // Progresja akordów (Am – F – C – G): [bas, oraz nuty padu].
  const CHORDS = [
    { bass: 55.00, pad: [110.00, 164.81, 220.00, 261.63] }, // Am
    { bass: 43.65, pad: [ 87.31, 130.81, 174.61, 261.63] }, // F
    { bass: 65.41, pad: [130.81, 196.00, 261.63, 329.63] }, // C
    { bass: 49.00, pad: [ 98.00, 146.83, 196.00, 293.66] }, // G
  ];
  // Pentatonika A-moll (dwie oktawy) — z niej losujemy dzwonki.
  const SCALE = [220.00, 261.63, 293.66, 329.63, 392.00,
                 440.00, 523.25, 587.33, 659.25, 783.99];

  const BEAT = 0.5;                      // długość kroku (sek.) — ~120 „tików”, spokojnie
  const CHORD_STEPS = 32;                // co ile kroków zmiana akordu (~16 s)

  // Proceduralny impuls pogłosu (delikatny, długi ogon).
  function makeReverb() {
    const len = Math.floor(ctx.sampleRate * 3.2);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    const cv = ctx.createConvolver();
    cv.buffer = buf;
    return cv;
  }

  function build() {
    ctx = Sound.ctx();
    if (!ctx) return false;

    master = ctx.createGain();
    master.gain.value = 0;               // start z ciszy, wchodzimy fade-in
    master.connect(ctx.destination);

    reverb = makeReverb();
    wet = ctx.createGain();
    wet.gain.value = 0.9;
    reverb.connect(wet).connect(master);

    // ---- Pad: wspólny filtr z powolnym LFO ----
    padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 700;
    padFilter.Q.value = 0.7;
    padGain = ctx.createGain();
    padGain.gain.value = 0.14;
    padFilter.connect(padGain);
    padGain.connect(master);             // sucho
    padGain.connect(reverb);             // + pogłos

    padLfo = ctx.createOscillator();
    const padLfoGain = ctx.createGain();
    padLfo.frequency.value = 0.05;       // ~20 s cykl
    padLfoGain.gain.value = 260;
    padLfo.connect(padLfoGain).connect(padFilter.frequency);
    padLfo.start();

    const ch = CHORDS[0];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = i < 2 ? 'sine' : 'triangle';
      osc.frequency.value = ch.pad[i];
      osc.detune.value = (i - 1.5) * 6; // lekki rozstrój = szerokość
      const g = ctx.createGain();
      g.gain.value = 0.25;
      osc.connect(g).connect(padFilter);
      osc.start();
      padVoices.push({ osc, gain: g });
    }

    // ---- Bas ----
    bassOsc = ctx.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = ch.bass;
    bassGain = ctx.createGain();
    bassGain.gain.value = 0.16;
    bassOsc.connect(bassGain).connect(master);
    bassOsc.start();

    return true;
  }

  // Jedna nuta-dzwonek: miękki atak, długi ogon, do sucha i do pogłosu.
  function bell(freq, t) {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(g);
    g.connect(master);
    const send = ctx.createGain();
    send.gain.value = 0.6;
    g.connect(send);
    send.connect(reverb); // do wejścia konwolwera → realny pogłos
    o.start(t);
    o.stop(t + 2.6);
  }

  function morphChord(t) {
    const ch = CHORDS[chordIdx];
    for (let i = 0; i < padVoices.length; i++) {
      // portamento — płynne przejście, bez klików
      padVoices[i].osc.frequency.exponentialRampToValueAtTime(ch.pad[i], t + 4);
    }
    bassOsc.frequency.exponentialRampToValueAtTime(ch.bass, t + 4);
  }

  // Scheduler „lookahead”: planuje zdarzenia audio z wyprzedzeniem 0.1 s.
  function scheduler() {
    while (nextNoteTime < ctx.currentTime + 0.15) {
      // zmiana akordu
      if (step >= nextChordStep) {
        chordIdx = (chordIdx + 1) % CHORDS.length;
        nextChordStep = step + CHORD_STEPS;
        morphChord(nextNoteTime);
      }
      // rzadka melodia: dzwonek mniej więcej co 2 kroki, losowo
      const inChord = CHORDS[chordIdx];
      if (Math.random() < 0.45) {
        // preferuj nuty pasujące do klimatu — cała pentatonika i tak pasuje
        let f = SCALE[(Math.random() * SCALE.length) | 0];
        // czasem oktawa niżej dla wypełnienia
        if (Math.random() < 0.2) f *= 0.5;
        bell(f, nextNoteTime + (Math.random() * 0.06));
      }
      // sporadyczne „iskry” wysoko dla przestrzeni
      if (Math.random() < 0.08) bell(SCALE[SCALE.length - 1] * 2, nextNoteTime + 0.12);

      nextNoteTime += BEAT;
      step++;
    }
  }

  const BASE_VOL = 0.16;                 // maks. poziom przy suwaku na 100%
  const target = () => Math.max(0.0001, BASE_VOL * (S.musicVol != null ? S.musicVol : 1));

  return {
    // Uruchom (lub wznów) muzykę, jeśli włączona w ustawieniach.
    start() {
      if (running || !S.musicOn) return;
      if (!ctx && !build()) return;
      if (!ctx) return;
      running = true;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(target(), t + 2.5); // łagodne wejście
      nextNoteTime = ctx.currentTime + 0.1;
      schedTimer = setInterval(scheduler, 30);
    },
    // Ustaw głośność na żywo (suwak w ustawieniach).
    setVolume() {
      if (!ctx || !master || !running) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(target(), t + 0.15);
    },
    // Zatrzymaj z krótkim wyciszeniem (np. gdy gra idzie w tło).
    stop() {
      if (!running) return;
      running = false;
      if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
      if (ctx && master) {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      }
    },
    // Przełącznik z przycisku/ustawień.
    toggle() {
      S.musicOn = !S.musicOn;
      if (S.musicOn) this.start(); else this.stop();
      save();
      return S.musicOn;
    },
    isOn() { return !!S.musicOn; },
    isRunning() { return running; },
  };
})();
