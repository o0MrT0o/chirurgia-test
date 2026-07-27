'use strict';
/* =====================================================================
   SPACE.JS — bogate, wydajne tło kosmiczne na canvasie.
   Zamiast ~80 animowanych elementów DOM: dwa canvasy.
   - #skyCanvas: statyczne, rysowane raz (gradient, mgławice, droga mleczna,
     setki gwiazd, galaktyki, planeta) — zero kosztu na klatkę.
   - #fxCanvas: lekka animacja ~25 fps (migotanie jasnych gwiazd, dryfujący
     pył, spadające gwiazdy) — kilkadziesiąt tanich elementów.
   ===================================================================== */

const Space = (() => {
  let sky, fx, sctx, fctx, W, H, dpr;
  let twinkle = [], motes = [], shooters = [];
  let running = false, lastFx = 0, nextShooter = 0;
  let theme = null; // motyw kolorystyczny tła (per sektor); null = domyślny

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // Gotowe sprite'y poświaty (rysowane raz) — zamiast tworzenia gradientu
  // na każdą klatkę dla każdej gwiazdy (to był główny koszt animacji).
  const glowCache = {};
  function glowSprite(rgb) {
    if (glowCache[rgb]) return glowCache[rgb];
    const S = 32, c = document.createElement('canvas');
    c.width = c.height = S;
    const cx = c.getContext('2d');
    const g = cx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.35, `rgba(${rgb},0.5)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    cx.fillStyle = g; cx.fillRect(0, 0, S, S);
    glowCache[rgb] = c;
    return c;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    for (const c of [sky, fx]) {
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      c.style.width = W + 'px'; c.style.height = H + 'px';
    }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------- rysowanie statycznego nieba ----------
  function nebula(x, y, r, rgb, a) {
    const g = sctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(0.5, `rgba(${rgb},${a * 0.35})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    sctx.fillStyle = g;
    sctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function star(ctx, x, y, r, color, a) {
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // jasna gwiazda z poświatą i (opcjonalnie) krzyżowym błyskiem
  function brightStar(ctx, x, y, r, color, flare) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    g.addColorStop(0, color);
    g.addColorStop(0.25, color.replace('1)', '0.5)'));
    g.addColorStop(1, color.replace('1)', '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    star(ctx, x, y, r, '#ffffff', 1);
    if (flare) {
      ctx.strokeStyle = color.replace('1)', '0.5)');
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x - r * 7, y); ctx.lineTo(x + r * 7, y);
      ctx.moveTo(x, y - r * 7); ctx.lineTo(x, y + r * 7);
      ctx.stroke();
    }
  }

  // ---------- Ciała niebieskie w tle: prawdziwe grafiki (CC0), nie kółka ----------
  // Ładowane raz i buforowane; różne w każdym sektorze (theme.worlds z config.js).
  const WORLD_BASE = 'assets/space/';
  const worldImgCache = {};
  function worldImg(file) {
    if (worldImgCache[file]) return worldImgCache[file];
    const img = new Image();
    img.decoding = 'async';
    img.src = WORLD_BASE + file;
    // Obrazek ładuje się async — gdy skończy, przerysuj niebo (jeśli jeszcze
    // nie zdążyło go narysować przy pierwszym buildSky()). Tanie, bo dzieje
    // się to raz na start/zmianę sektora, nie w pętli animacji.
    img.onload = () => { if (sctx) buildSky(); };
    worldImgCache[file] = img;
    return img;
  }

  // Podbarwienie sprite'a kolorem otoczenia (nebuli sektora) dla spójności —
  // rysowane raz na małym canvasie i buforowane per (obrazek, kolor).
  const tintCache = {};
  function tintedWorld(img, rgb) {
    const key = img.src + '|' + rgb;
    if (tintCache[key]) return tintCache[key];
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    cx.globalCompositeOperation = 'source-atop';
    cx.fillStyle = `rgba(${rgb},0.22)`;
    cx.fillRect(0, 0, c.width, c.height);
    tintCache[key] = c;
    return c;
  }

  function drawWorld(x, y, r, file, tintRgb) {
    const img = worldImg(file);
    if (!img.complete || img.naturalWidth === 0) return; // jeszcze się ładuje — dorysuje się przy onload
    // miękki cień/poświata pod ciałem dla głębi (jak wcześniej dla rysowanych planet)
    const sh = sctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.7);
    sh.addColorStop(0, 'rgba(0,0,0,0.3)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = sh; sctx.fillRect(x - r * 1.7, y - r * 1.7, r * 3.4, r * 3.4);
    const sprite = tintRgb ? tintedWorld(img, tintRgb) : img;
    // dopasuj proporcje oryginału (nie rozciągaj meteorów do kwadratu — "contain", nie "stretch")
    const ar = img.naturalWidth / img.naturalHeight;
    const w = ar >= 1 ? r * 2 : r * 2 * ar, h = ar >= 1 ? r * 2 / ar : r * 2;
    sctx.drawImage(sprite, x - w / 2, y - h / 2, w, h);
  }

  function galaxy(x, y, r, tilt, rgb) {
    sctx.save();
    sctx.translate(x, y); sctx.rotate(tilt); sctx.scale(1, 0.4);
    const g = sctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, `rgba(255,255,255,0.8)`);
    g.addColorStop(0.2, `rgba(${rgb},0.5)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    sctx.fillStyle = g;
    sctx.beginPath(); sctx.arc(0, 0, r, 0, 7); sctx.fill();
    sctx.restore();
  }

  function buildSky() {
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, W, H);
    // tło — głęboki gradient + wineta (kolory z motywu sektora lub domyślne)
    const bgc = (theme && theme.bg) || ['#1c2560', '#101740', '#080d24', '#04060f'];
    const bg = sctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.95);
    bg.addColorStop(0, bgc[0]); bg.addColorStop(0.45, bgc[1]); bg.addColorStop(0.8, bgc[2]); bg.addColorStop(1, bgc[3]);
    sctx.fillStyle = bg; sctx.fillRect(0, 0, W, H);

    // mgławice (addytywne, dla świetlistości) — kolory z motywu sektora
    sctx.globalCompositeOperation = 'lighter';
    const M = Math.max(W, H);
    const nb = (theme && theme.neb) || ['120,70,200', '30,120,180', '40,150,150', '190,60,150', '60,90,220', '200,120,90'];
    nebula(W * 0.18, H * 0.24, M * 0.55, nb[0], 0.20);
    nebula(W * 0.86, H * 0.46, M * 0.5, nb[1], 0.18);
    nebula(W * 0.6, H * 0.12, M * 0.42, nb[2], 0.14);
    nebula(W * 0.42, H * 0.72, M * 0.5, nb[3], 0.13);
    nebula(W * 0.08, H * 0.85, M * 0.4, nb[4], 0.14);
    nebula(W * 0.95, H * 0.9, M * 0.38, nb[5], 0.10);

    // droga mleczna — miękkie obłoki wzdłuż ukośnej osi (bez ostrych krawędzi)
    const mcx = W * 0.5, mcy = H * 0.42, mang = -0.5;
    for (let i = 0; i <= 8; i++) {
      const s = (i / 8 - 0.5) * 2;
      const bx = mcx + Math.cos(mang) * s * M * 0.62;
      const by = mcy + Math.sin(mang) * s * M * 0.62;
      nebula(bx, by, M * 0.26, '205,218,255', 0.055);
    }
    sctx.globalCompositeOperation = 'source-over';

    // odległe galaktyki
    galaxy(W * 0.72, H * 0.2, 46, 0.6, '180,150,255');
    galaxy(W * 0.22, H * 0.62, 34, -0.4, '150,200,255');

    // gęstsze gwiazdy wzdłuż drogi mlecznej
    const colors = ['rgba(255,255,255,', 'rgba(255,255,255,', 'rgba(200,225,255,', 'rgba(255,240,210,', 'rgba(255,215,235,'];
    for (let i = 0; i < 160; i++) {
      // punkt blisko ukośnej osi drogi mlecznej
      const t = Math.random();
      const ax = W * (0.05 + t * 0.9), ay = H * (0.75 - t * 0.55) + rnd(-H * 0.09, H * 0.09);
      star(sctx, ax, ay, rnd(0.3, 1.0), '#ffffff', rnd(0.15, 0.6));
    }
    // pole gwiazd na całym niebie
    const fieldCount = Math.round(W * H / 2600);
    for (let i = 0; i < fieldCount; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = rnd(0.35, 1.5);
      const c = pick(colors) + rnd(0.25, 0.9) + ')';
      star(sctx, x, y, r, c, 1);
    }
    // kilkanaście jasnych gwiazd z poświatą, część z błyskiem
    for (let i = 0; i < 16; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      brightStar(sctx, x, y, rnd(1, 1.8), pick(['rgba(255,255,255,1)', 'rgba(190,220,255,1)', 'rgba(255,235,200,1)', 'rgba(255,200,230,1)']), Math.random() < 0.5);
    }

    // dwa ciała niebieskie w tle — prawdziwe grafiki, różne w każdym sektorze
    const worlds = (theme && theme.worlds) || ['meteorGrey1.png', 'meteorBrown1.png'];
    const accent = nb[0]; // podbarwienie kolorem dominującej mgławicy sektora
    drawWorld(W * 0.84, H * 0.13, 32, worlds[0], accent);
    drawWorld(W * 0.12, H * 0.34, 18, worlds[1], accent);

    // przygotuj elementy animowane (fx)
    twinkle = [];
    for (let i = 0; i < 42; i++) {
      const c = pick(['255,255,255', '190,220,255', '255,235,200', '255,205,230']);
      twinkle.push({
        x: Math.random() * W, y: Math.random() * H,
        r: rnd(0.7, 1.7), sp: rnd(0.6, 2), ph: rnd(0, 7),
        c, sprite: glowSprite(c),
      });
    }
    motes = [];
    for (let i = 0; i < 14; i++) {
      motes.push({ x: Math.random() * W, y: Math.random() * H, r: rnd(0.6, 1.4), v: rnd(3, 9) });
    }
  }

  // ---------- animowana warstwa fx ----------
  function spawnShooter() {
    const fromLeft = Math.random() < 0.5;
    shooters.push({
      x: rnd(W * 0.2, W * 0.9), y: rnd(0, H * 0.35),
      vx: (fromLeft ? 1 : -1) * rnd(6, 10), vy: rnd(3, 6),
      life: 0, max: rnd(40, 70),
    });
  }

  function drawFx(t) {
    fctx.clearRect(0, 0, W, H);
    // migotanie jasnych gwiazd — tanie drawImage z gotowego sprite'a
    for (const s of twinkle) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph));
      const sz = s.r * 8;
      fctx.globalAlpha = a;
      fctx.drawImage(s.sprite, s.x - sz / 2, s.y - sz / 2, sz, sz);
      fctx.fillStyle = '#ffffff';
      fctx.beginPath(); fctx.arc(s.x, s.y, s.r * 0.7, 0, 7); fctx.fill();
      fctx.globalAlpha = 1;
    }
    // dryfujący pył
    for (const m of motes) {
      m.y -= m.v * 0.016; m.x += Math.sin(t * 0.0006 + m.y) * 0.12;
      if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
      star(fctx, m.x, m.y, m.r, '#bfe0ff', 0.25);
    }
    // spadające gwiazdy
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx; s.y += s.vy; s.life++;
      const p = s.life / s.max;
      const a = Math.sin(p * Math.PI) * 0.9;
      const tx = s.x - s.vx * 6, ty = s.y - s.vy * 6;
      const g = fctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(155,220,255,0)');
      fctx.strokeStyle = g; fctx.lineWidth = 2; fctx.lineCap = 'round';
      fctx.beginPath(); fctx.moveTo(s.x, s.y); fctx.lineTo(tx, ty); fctx.stroke();
      if (s.life >= s.max) shooters.splice(i, 1);
    }
  }

  function loop(t) {
    if (!running) return;
    if (t - lastFx >= 38) { // ~26 fps — płynnie i oszczędnie
      lastFx = t;
      drawFx(t);
      if (t >= nextShooter) { spawnShooter(); nextShooter = t + rnd(5000, 13000); }
    }
    requestAnimationFrame(loop);
  }

  function start() { if (running) return; running = true; lastFx = 0; nextShooter = performance.now() + 2500; requestAnimationFrame(loop); }
  function stop() { running = false; }

  function init() {
    sky = document.getElementById('skyCanvas');
    fx = document.getElementById('fxCanvas');
    if (!sky || !fx) return;
    sctx = sky.getContext('2d'); fctx = fx.getContext('2d');
    resize(); buildSky();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); buildSky(); }, 200); });
    start();
  }

  // Ustaw motyw sektora i przerysuj statyczne tło.
  function setTheme(th) { theme = th || null; if (sctx) buildSky(); }

  return { init, start, stop, setTheme };
})();
