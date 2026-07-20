'use strict';
/* =====================================================================
   ASTEROID.JS — proceduralny generator asteroid (SVG), wersja v3.
   Realistyczna, oświetlona skała: faktura 3D z filtrów SVG
   (feTurbulence + feDiffuseLighting), tarasowane kratery z centralnym
   szczytem, głazy, kamyki, wielofasetkowe klastry kryształów, rysy
   powierzchni, obwódka światła (fresnel) i cień terminatora.

   NOWE w v3:
   - cechy NIE nachodzą na siebie (odrzucanie kolidujących pozycji),
   - rysy/pęknięcia zatrzymują się na kraterach zamiast je przecinać,
   - więcej szczegółów (tarasy, szczyty, klastry, kamyki).

   Światło pada z góry-lewej: jasna strona = góra-lewo, cień = dół-prawo.
   Każda z 10 skórek ma własny, deterministyczny kształt (seed = id).
   Zero plików graficznych.
   ===================================================================== */

const TAU = Math.PI * 2;

// Deterministyczny generator liczb pseudolosowych (ten sam seed = ten sam kształt).
function seededRandom(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (s === 0) s = 12345;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Licznik zapewniający unikalne id filtrów/gradientów (asteroida + 10 podglądów naraz).
let __astUID = 0;

// Palety per skórka: c0 (rozświetlenie) → c4 (najgłębszy cień), kolor kryształu,
// kolor światła (lighting-color feDiffuseLighting) i detale specjalne.
const ASTEROID_STYLES = {
  classic: { c0:'#e6ebff', c1:'#aab6de', c2:'#6b7699', c3:'#3d4568', c4:'#1e2340', crystal:'#7ff0ff', lightCol:'#eef1ff' },
  gold:    { c0:'#fff7d6', c1:'#ffe08a', c2:'#e8b13e', c3:'#a06f14', c4:'#5c4200', crystal:'#fffbe8', lightCol:'#fff4cc' },
  ice:     { c0:'#f4feff', c1:'#c2f0f8', c2:'#8bd6e6', c3:'#4088a0', c4:'#173f52', crystal:'#e6fbff', lightCol:'#eafcff', sparkles:true },
  lava:    { c0:'#ffd0a8', c1:'#ff8a5c', c2:'#e8432a', c3:'#8f1a12', c4:'#3d0a05', crystal:'#ffe08a', lightCol:'#ffd0a0', glowCracks:true },
  cheese:  { c0:'#fff6c8', c1:'#ffe07a', c2:'#e8bc3a', c3:'#b0851a', c4:'#6e5008', crystal:'#ffffff', lightCol:'#fff2c0', holes:true },
  emerald: { c0:'#d6ffe8', c1:'#7cf0b0', c2:'#33c877', c3:'#177a42', c4:'#08341c', crystal:'#e0ffee', lightCol:'#e4fff0' },
  heart:   { c0:'#ffe2f0', c1:'#ffa8d4', c2:'#f070ac', c3:'#b83a78', c4:'#5e163a', crystal:'#ffe8f4', lightCol:'#ffe6f2', hearts:true },
  void:    { c0:'#9a7ee0', c1:'#6b4ea8', c2:'#402d70', c3:'#231847', c4:'#0c0820', crystal:'#c8b0ff', lightCol:'#b8a0ff', sparkles:true },
  star:    { c0:'#eef3ff', c1:'#a8c0ff', c2:'#6b8fff', c3:'#2f43a8', c4:'#0f1848', crystal:'#ffffff', lightCol:'#e8efff', sparkles:true },
  rainbow: { c0:'#ffffff', c1:'#9ad8ff', c2:'#6ee7ff', c3:'#3d4568', c4:'#20263f', crystal:'#ffffff', lightCol:'#ffffff', rainbow:true },
};

function generateAsteroidSVG(skinId, opts) {
  opts = opts || {};
  const lite = !!opts.lite;                 // podglądy w galerii: bez ciężkich filtrów
  const st = ASTEROID_STYLES[skinId] || ASTEROID_STYLES.classic;
  const rnd = seededRandom('asteroida-v3-' + skinId);
  const uid = 'ast' + skinId + '-' + (++__astUID);
  const seed = Math.floor(rnd() * 9999);
  const f1 = k => (+k).toFixed(1);

  // ---------- nieregularny obrys bryły (blob wygładzony krzywymi Beziera) ----------
  const n = 13 + Math.floor(rnd() * 5);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const r = 74 + rnd() * 22;
    pts.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r * 0.98]);
  }
  const mids = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  });
  let body = `M ${f1(mids[n - 1][0])} ${f1(mids[n - 1][1])}`;
  for (let i = 0; i < n; i++) {
    body += ` Q ${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(mids[i][0])} ${f1(mids[i][1])}`;
  }
  body += ' Z';

  // ---------- rozmieszczanie cech BEZ nakładania (odrzucanie kolizji) ----------
  const placed = [];  // wszystkie bryłowe cechy — blokują kolejne
  const major = [];   // kratery/kryształy/duże głazy — omijane przez linie

  // Znajdź pozycję dla cechy o promieniu r, tak by nie kolidowała z już postawionymi.
  function place(r, maxDist, gap, tries) {
    tries = tries || 40;
    for (let t = 0; t < tries; t++) {
      const a = rnd() * TAU;
      const d = rnd() * maxDist;
      const x = 100 + Math.cos(a) * d;
      const y = 100 + Math.sin(a) * d * 0.98;
      let ok = true;
      for (const g of placed) {
        if (Math.hypot(x - g.x, y - g.y) < r + g.r + gap) { ok = false; break; }
      }
      if (ok) { const feat = { x, y, r }; placed.push(feat); return feat; }
    }
    return null; // nie znaleziono wolnego miejsca — pomiń tę cechę
  }
  // Czy punkt wpada w krater/kryształ (do omijania przez linie)?
  function inMajor(x, y, pad) {
    for (const m of major) if (Math.hypot(x - m.x, y - m.y) < m.r + (pad || 0)) return true;
    return false;
  }

  // ---------- KRYSZTAŁY: klastry wielofasetkowych świecących shardów ----------
  // Rozmieszczane JAKO PIERWSZE — mają najwyższy priorytet, żeby zawsze
  // znalazły miejsce; kolejne cechy (kratery, głazy) je omijają.
  const shard = (cx, cy, s, rot) => {
    const p = k => f1(k * s);
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${rot})">
      <polygon points="0,${p(-1)} ${p(0.72)},${p(-0.28)} ${p(0.46)},${p(0.82)} 0,${p(0.62)}" fill="${st.crystal}" opacity="0.72"/>
      <polygon points="0,${p(-1)} 0,${p(0.62)} ${p(-0.46)},${p(0.82)} ${p(-0.72)},${p(-0.28)}" fill="#ffffff" opacity="0.9"/>
      <polygon points="0,${p(-1)} ${p(0.72)},${p(-0.28)} ${p(0.46)},${p(0.82)} 0,${p(0.62)} ${p(-0.46)},${p(0.82)} ${p(-0.72)},${p(-0.28)}" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.85"/>
      <line x1="0" y1="${p(-1)}" x2="0" y2="${p(0.62)}" stroke="#ffffff" stroke-width="0.5" opacity="0.6"/>
      <circle cx="${p(-0.28)}" cy="${p(-0.34)}" r="${f1(s * 0.12)}" fill="#ffffff" opacity="0.95"/>
    </g>`;
  };
  let gems = '';
  const gemCount = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < gemCount; i++) {
    const s = 6 + rnd() * 5;
    const f = place(s * 1.1, 52, 4);
    if (!f) continue;
    major.push({ x: f.x, y: f.y, r: s });
    const gx = f.x, gy = f.y, rot = Math.round(rnd() * 360);
    const pulse = (2 + rnd() * 2.5).toFixed(1);
    gems += `<ellipse cx="${f1(gx)}" cy="${f1(gy)}" rx="${f1(s * 1.3)}" ry="${f1(s * 1.3)}" fill="${st.crystal}" opacity="0.26" filter="url(#${uid}-blur)">
      <animate attributeName="opacity" values="0.14;0.34;0.14" dur="${pulse}s" repeatCount="indefinite"/></ellipse>`;
    if (st.hearts && i === 0) {
      gems += `<g transform="translate(${f1(gx)} ${f1(gy)}) scale(${(s / 6.5).toFixed(2)})">
        <path d="M 0 2.5 C -3.6 -2.6, -8.2 1.6, 0 8.4 C 8.2 1.6, 3.6 -2.6, 0 2.5 Z" fill="${st.crystal}" stroke="#ffffff" stroke-width="0.7" opacity="0.96"/>
        <path d="M -2 0.5 C -3 -1.2, -5.4 0.4, -2.4 3.4 Z" fill="#ffffff" opacity="0.55"/></g>`;
      continue;
    }
    // klaster: główny shard + 1-2 mniejsze obok
    gems += shard(gx, gy, s, rot);
    gems += shard(gx + s * 0.7, gy + s * 0.55, s * 0.55, rot + 42);
    if (rnd() < 0.6) gems += shard(gx - s * 0.6, gy + s * 0.5, s * 0.42, rot - 55);
  }

  // ---------- KRATERY: taras + centralny szczyt (jasna krawędź góra-lewo) ----------
  let craters = '';
  const craterCount = st.holes ? 7 : 5 + Math.floor(rnd() * 3);
  for (let i = 0; i < craterCount; i++) {
    const R = (st.holes ? 8 : 7) + rnd() * 11;
    const f = place(R, 60 - R, 5);
    if (!f) continue;
    major.push({ x: f.x, y: f.y, r: R });
    const cx = f.x, cy = f.y, deep = st.holes;
    let g = `<g>
      <ellipse cx="${f1(cx + 1.6)}" cy="${f1(cy + 2)}" rx="${f1(R + 1.6)}" ry="${f1(R + 1.3)}" fill="${st.c4}" opacity="${deep ? 0.9 : 0.5}"/>
      <ellipse cx="${f1(cx - 1.3)}" cy="${f1(cy - 1.6)}" rx="${f1(R + 1.1)}" ry="${f1(R + 1)}" fill="${st.c0}" opacity="0.34"/>
      <ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R)}" ry="${f1(R * 0.94)}" fill="url(#${uid}-bowl)" opacity="${deep ? 0.96 : 0.84}"/>
      <ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R)}" ry="${f1(R * 0.94)}" fill="none" stroke="${st.c4}" stroke-width="0.6" opacity="0.35"/>`;
    if (!deep && R > 9.5) { // tarasowana ściana
      g += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R * 0.62)}" ry="${f1(R * 0.58)}" fill="none" stroke="${st.c4}" stroke-width="0.8" opacity="0.4"/>
        <ellipse cx="${f1(cx - 0.6)}" cy="${f1(cy - 0.7)}" rx="${f1(R * 0.62)}" ry="${f1(R * 0.58)}" fill="none" stroke="${st.c0}" stroke-width="0.6" opacity="0.22"/>`;
    }
    if (!deep && R > 12.5) { // centralny szczyt (jak w prawdziwych dużych kraterach)
      g += `<ellipse cx="${f1(cx + 0.7)}" cy="${f1(cy + 0.8)}" rx="${f1(R * 0.2)}" ry="${f1(R * 0.16)}" fill="${st.c4}" opacity="0.45"/>
        <ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(R * 0.2)}" ry="${f1(R * 0.17)}" fill="url(#${uid}-boulder)"/>
        <ellipse cx="${f1(cx - R * 0.06)}" cy="${f1(cy - R * 0.06)}" rx="${f1(R * 0.09)}" ry="${f1(R * 0.07)}" fill="${st.c0}" opacity="0.5"/>`;
    } else { // rozświetlenie dna od strony przeciwnej do światła
      g += `<ellipse cx="${f1(cx + R * 0.34)}" cy="${f1(cy + R * 0.36)}" rx="${f1(R * 0.34)}" ry="${f1(R * 0.26)}" fill="${st.c1}" opacity="${deep ? 0.12 : 0.42}"/>`;
    }
    craters += g + '</g>';
  }

  // ---------- GŁAZY: wypukłe skały (jasno góra-lewo, cień dół-prawo) ----------
  let boulders = '';
  const boulderCount = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < boulderCount; i++) {
    const R = 2.5 + rnd() * 4.5;
    const f = place(R, 58, 3);
    if (!f) continue;
    if (R > 4) major.push({ x: f.x, y: f.y, r: R });
    const bx = f.x, by = f.y;
    boulders += `<g>
      <ellipse cx="${f1(bx + 1)}" cy="${f1(by + 1.2)}" rx="${f1(R + 0.6)}" ry="${f1(R * 0.7)}" fill="${st.c4}" opacity="0.45"/>
      <ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(R)}" ry="${f1(R * 0.8)}" fill="url(#${uid}-boulder)"/>
      <ellipse cx="${f1(bx - R * 0.3)}" cy="${f1(by - R * 0.35)}" rx="${f1(R * 0.35)}" ry="${f1(R * 0.28)}" fill="${st.c0}" opacity="0.55"/>
    </g>`;
  }

  // ---------- KAMYKI: drobne kamienie rozsiane po powierzchni (wypełniają luki) ----------
  let pebbles = '';
  const pebbleCount = 12 + Math.floor(rnd() * 7);
  for (let i = 0; i < pebbleCount; i++) {
    const R = 1.1 + rnd() * 1.9;
    const f = place(R, 60, 1.5);
    if (!f) continue;
    pebbles += `<ellipse cx="${f1(f.x + 0.4)}" cy="${f1(f.y + 0.5)}" rx="${f1(R)}" ry="${f1(R * 0.8)}" fill="${st.c4}" opacity="0.4"/>
      <ellipse cx="${f1(f.x)}" cy="${f1(f.y)}" rx="${f1(R)}" ry="${f1(R * 0.8)}" fill="${st.c1}" opacity="0.55"/>`;
  }

  // ---------- RYSY / PĘKNIĘCIA: zatrzymują się na kraterach i kryształach ----------
  let cracks = '';
  const crackCount = st.glowCracks ? 2 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 2);
  for (let i = 0; i < crackCount; i++) {
    // znajdź start poza cechami i w obrębie bryły
    let sx, sy, found = false;
    for (let t = 0; t < 30; t++) {
      const a = rnd() * TAU, d = rnd() * 56;
      const x = 100 + Math.cos(a) * d, y = 100 + Math.sin(a) * d;
      if (!inMajor(x, y, 3) && Math.hypot(x - 100, y - 100) < 62) { sx = x; sy = y; found = true; break; }
    }
    if (!found) continue;
    let x = sx, y = sy, ang = rnd() * TAU;
    const seg = [[x, y]];
    for (let j = 0; j < 6 + Math.floor(rnd() * 3); j++) {
      ang += (rnd() - 0.5) * 1.5;
      const nx = x + Math.cos(ang) * (6 + rnd() * 7);
      const ny = y + Math.sin(ang) * (6 + rnd() * 7);
      if (inMajor(nx, ny, 2) || Math.hypot(nx - 100, ny - 100) > 64) break; // zatrzymaj na kraterze/krawędzi
      x = nx; y = ny; seg.push([x, y]);
    }
    if (seg.length < 2) continue;
    const ptsStr = seg.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ');
    if (st.glowCracks) {
      cracks += `<polyline points="${ptsStr}" fill="none" stroke="#ffcf6e" stroke-width="2.6" stroke-linecap="round" opacity="0.5" filter="url(#${uid}-blur)"/>
        <polyline points="${ptsStr}" fill="none" stroke="#fff2c0" stroke-width="1" stroke-linecap="round" opacity="0.95">
        <animate attributeName="opacity" values="0.45;1;0.45" dur="${(2 + rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/></polyline>`;
    } else {
      cracks += `<polyline points="${ptsStr}" fill="none" stroke="${st.c4}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
        <polyline points="${ptsStr}" fill="none" stroke="${st.c0}" stroke-width="0.5" stroke-linecap="round" opacity="0.2"/>`;
    }
  }

  // ---------- tekstura: drobinki pyłu (poza kraterami) ----------
  let speckles = '';
  for (let i = 0; i < 20; i++) {
    const a = rnd() * TAU, d = rnd() * 60;
    const sx = 100 + Math.cos(a) * d, sy = 100 + Math.sin(a) * d;
    if (inMajor(sx, sy, 1)) continue;
    speckles += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(0.5 + rnd() * 1.3)}" fill="${rnd() < 0.5 ? st.c0 : st.c4}" opacity="0.22"/>`;
  }

  // ---------- iskrzące gwiazdki (lód / otchłań / gwiezdna) ----------
  let sparkles = '';
  if (st.sparkles) {
    for (let i = 0; i < 8; i++) {
      const a = rnd() * TAU, d = rnd() * 52;
      const sx = 100 + Math.cos(a) * d, sy = 100 + Math.sin(a) * d;
      if (inMajor(sx, sy, 1)) continue;
      sparkles += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(0.8 + rnd())}" fill="#ffffff">
        <animate attributeName="opacity" values="0.1;0.95;0.1" dur="${(1.5 + rnd() * 3).toFixed(1)}s" begin="${(rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    }
  }

  // ---------- gradient bryły ----------
  const bodyFill = st.rainbow
    ? `<linearGradient id="${uid}-body" x1="0.15" y1="0.1" x2="0.9" y2="0.95">
        <stop offset="0%" stop-color="#ff7a7a"/><stop offset="20%" stop-color="#ffd76e"/>
        <stop offset="40%" stop-color="#5fe39a"/><stop offset="60%" stop-color="#6ee7ff"/>
        <stop offset="80%" stop-color="#9a7ee0"/><stop offset="100%" stop-color="#ff8fc8"/>
      </linearGradient>`
    : `<radialGradient id="${uid}-body" cx="0.34" cy="0.28" r="0.92">
        <stop offset="0%" stop-color="${st.c0}"/><stop offset="26%" stop-color="${st.c1}"/>
        <stop offset="55%" stop-color="${st.c2}"/><stop offset="80%" stop-color="${st.c3}"/>
        <stop offset="100%" stop-color="${st.c4}"/>
      </radialGradient>`;

  // filtr skalnej faktury 3D (feTurbulence jako mapa wysokości + feDiffuseLighting)
  const rockFilter = lite ? '' : `
    <filter id="${uid}-rock" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.065" numOctaves="4" seed="${seed}" stitchTiles="stitch" result="turb"/>
      <feDiffuseLighting in="turb" surfaceScale="3.4" diffuseConstant="1.1" lighting-color="${st.lightCol}" result="lit">
        <feDistantLight azimuth="228" elevation="52"/>
      </feDiffuseLighting>
      <feComposite in="lit" in2="SourceAlpha" operator="in" result="litClip"/>
      <feBlend in="SourceGraphic" in2="litClip" mode="overlay" result="rough"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.45 0.5" numOctaves="2" seed="${seed + 7}" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0" result="grainA"/>
      <feComposite in="grainA" in2="SourceAlpha" operator="in" result="grainClip"/>
      <feBlend in="rough" in2="grainClip" mode="multiply"/>
    </filter>`;
  const rockAttr = lite ? '' : ` filter="url(#${uid}-rock)"`;

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${bodyFill}
      ${rockFilter}
      <linearGradient id="${uid}-bowl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${st.c4}"/><stop offset="55%" stop-color="${st.c3}"/><stop offset="100%" stop-color="${st.c2}"/>
      </linearGradient>
      <linearGradient id="${uid}-boulder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${st.c1}"/><stop offset="60%" stop-color="${st.c2}"/><stop offset="100%" stop-color="${st.c3}"/>
      </linearGradient>
      <radialGradient id="${uid}-shade" cx="0.33" cy="0.27" r="0.95">
        <stop offset="42%" stop-color="#000000" stop-opacity="0"/><stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
      </radialGradient>
      <radialGradient id="${uid}-hi" cx="0.32" cy="0.24" r="0.5">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${uid}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
        <stop offset="42%" stop-color="#ffffff" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
      </linearGradient>
      <clipPath id="${uid}-clip"><path d="${body}"/></clipPath>
      <filter id="${uid}-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.4"/></filter>
    </defs>

    <path d="${body}" fill="url(#${uid}-body)"${rockAttr}/>
    <g clip-path="url(#${uid}-clip)">
      ${speckles}
      ${pebbles}
      ${craters}
      ${boulders}
      ${cracks}
      ${gems}
      ${sparkles}
      <path d="${body}" fill="url(#${uid}-shade)"/>
      <path d="${body}" fill="url(#${uid}-hi)"/>
    </g>
    <path d="${body}" fill="none" stroke="url(#${uid}-rim)" stroke-width="2.4"/>
  </svg>`;
}
