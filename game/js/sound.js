'use strict';
/* =====================================================================
   SOUND.JS — dźwięki syntezowane na żywo przez WebAudio.
   Zero plików audio = zero dodatkowych megabajtów w APK.
   Przeglądarka wymaga gestu użytkownika, więc Sound.unlock() wołamy
   przy pierwszym dotknięciu (ekran startowy).
   ===================================================================== */

const Sound = (() => {
  let ctx = null;

  function ensure() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
    return ctx;
  }

  // Pojedynczy ton: częstotliwość, długość, barwa, głośność, opóźnienie.
  function beep(freq, dur = 0.08, type = 'sine', vol = 0.12, delay = 0) {
    if (!S.soundOn) return;
    const c = ensure();
    if (!c) return;
    try {
      const t = c.currentTime + delay;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (e) {}
  }

  // Szybkie klikanie potrafi zasypać WebAudio setkami węzłów na sekundę,
  // co powoduje mikroprzycięcia. Ograniczamy dźwięk kliknięcia do ~18/s —
  // ucho i tak nie rozróżni gęstszych, a CPU oddycha.
  let _lastClick = 0;

  return {
    unlock() { ensure(); },
    ctx() { return ensure(); },   // współdzielony kontekst dla muzyki (music.js)
    click()   {
      const t = now();
      if (t - _lastClick < 55) return;
      _lastClick = t;
      beep(550 + Math.random() * 250, 0.05, 'triangle', 0.07);
    },
    crit()    { beep(880, 0.09, 'square', 0.1); beep(1320, 0.12, 'square', 0.09, 0.05); },
    buy()     { beep(440, 0.06, 'sine', 0.11); beep(660, 0.08, 'sine', 0.11, 0.06); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, 'triangle', 0.11, i * 0.09)); },
    comet()   { beep(1200, 0.15, 'sine', 0.11); beep(1600, 0.2, 'sine', 0.09, 0.08); },
    meteor()  { beep(220, 0.12, 'sawtooth', 0.13); beep(140, 0.14, 'sawtooth', 0.1, 0.05); },
    claim()   { [392, 523, 659].forEach((f, i) => beep(f, 0.1, 'sine', 0.11, i * 0.07)); },
    alarm()   { [330, 330, 330].forEach((f, i) => beep(f, 0.14, 'square', 0.12, i * 0.2)); },
    hit()     { beep(180 + Math.random() * 60, 0.07, 'sawtooth', 0.1); },
    lose()    { beep(220, 0.25, 'sawtooth', 0.12); beep(165, 0.35, 'sawtooth', 0.12, 0.2); },
  };
})();

function toggleSound() {
  S.soundOn = !S.soundOn;
  if (S.soundOn) Sound.buy();
  save();
  return S.soundOn;
}
