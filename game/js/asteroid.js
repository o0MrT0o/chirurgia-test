'use strict';
/* =====================================================================
   ASTEROID.JS — proceduralny generator asteroid (SVG), wersja v2.
   Realistyczna, oświetlona skała: faktura 3D z filtrów SVG
   (feTurbulence + feDiffuseLighting), kratery z uniesioną krawędzią
   i cieniem bryły, głazy, wielofasetkowe świecące kryształy, obwódka
   światła (fresnel) i cień terminatora. Każda z 10 skórek ma własny,
   deterministyczny kształt (seed = id skórki). Zero plików graficznych.

   Światło pada z góry-lewej (jak w całej grze): jasna strona = góra-lewo,
   cień = dół-prawo.
   ===================================================================== */

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

// Licznik zapewniający unikalne id filtrów/gradientów (SVG dzielą przestrzeń id
// w całym dokumencie — asteroida główna i 10 podglądów w galerii naraz).
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
  const rnd = seededRandom('asteroida-v2-' + skinId);
  const uid = 'ast' + skinId + '-' + (++__astUID);
  const seed = Math.floor(rnd() * 9999);

  // ---------- nieregularny obrys bryły (blob wygładzony krzywymi Beziera) ----------
  const n = 13 + Math.floor(rnd() * 5);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 74 + rnd() * 22;
    pts.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r * 0.98]);
  }
  const mids = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  });
  let body = `M ${mids[n - 1][0].toFixed(1)} ${mids[n - 1][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    body += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mids[i][0].toFixed(1)} ${mids[i][1].toFixed(1)}`;
  }
  body += ' Z';

  // Losowy punkt wewnątrz bryły.
  const inner = (maxR = 56) => {
    const a = rnd() * Math.PI * 2;
    const r = 10 + rnd() * maxR;
    return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];
  };

  // ---------- kratery: uniesiona krawędź (jasno góra-lewo, cień dół-prawo) + miska ----------
  let craters = '';
  const craterCount = st.holes ? 7 : 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < craterCount; i++) {
    const [cx, cy] = inner(50);
    const R = (st.holes ? 8 : 7) + rnd() * 11;
    const deep = st.holes;
    craters += `
      <g>
        <ellipse cx="${(cx + 1.6).toFixed(1)}" cy="${(cy + 1.9).toFixed(1)}" rx="${(R + 1.4).toFixed(1)}" ry="${(R + 1.2).toFixed(1)}" fill="${st.c4}" opacity="${deep ? 0.9 : 0.5}"/>
        <ellipse cx="${(cx - 1.2).toFixed(1)}" cy="${(cy - 1.5).toFixed(1)}" rx="${(R + 1).toFixed(1)}" ry="${(R + 0.9).toFixed(1)}" fill="${st.c0}" opacity="0.32"/>
        <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${R.toFixed(1)}" ry="${(R * 0.94).toFixed(1)}" fill="url(#${uid}-bowl)" opacity="${deep ? 0.96 : 0.82}"/>
        <ellipse cx="${(cx + R * 0.34).toFixed(1)}" cy="${(cy + R * 0.36).toFixed(1)}" rx="${(R * 0.34).toFixed(1)}" ry="${(R * 0.26).toFixed(1)}" fill="${st.c1}" opacity="${deep ? 0.12 : 0.4}"/>
      </g>`;
  }

  // ---------- głazy: wypukłe skały (jasno góra-lewo, cień dół-prawo) ----------
  let boulders = '';
  const boulderCount = 3 + Math.floor(rnd() * 4);
  for (let i = 0; i < boulderCount; i++) {
    const [bx, by] = inner(54);
    const R = 2.5 + rnd() * 4.5;
    boulders += `
      <g>
        <ellipse cx="${(bx + 1).toFixed(1)}" cy="${(by + 1.2).toFixed(1)}" rx="${(R + 0.6).toFixed(1)}" ry="${(R * 0.7).toFixed(1)}" fill="${st.c4}" opacity="0.45"/>
        <ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${R.toFixed(1)}" ry="${(R * 0.8).toFixed(1)}" fill="url(#${uid}-boulder)"/>
        <ellipse cx="${(bx - R * 0.3).toFixed(1)}" cy="${(by - R * 0.35).toFixed(1)}" rx="${(R * 0.35).toFixed(1)}" ry="${(R * 0.28).toFixed(1)}" fill="${st.c0}" opacity="0.55"/>
      </g>`;
  }

  // ---------- pęknięcia (w lawie żarzące) ----------
  let cracks = '';
  const crackCount = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < crackCount; i++) {
    let [x, y] = inner(42);
    let a = rnd() * Math.PI * 2;
    const seg = [`${x.toFixed(1)},${y.toFixed(1)}`];
    for (let j = 0; j < 4 + Math.floor(rnd() * 3); j++) {
      a += (rnd() - 0.5) * 1.6;
      x += Math.cos(a) * (7 + rnd() * 9);
      y += Math.sin(a) * (7 + rnd() * 9);
      seg.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const ptsStr = seg.join(' ');
    cracks += `<polyline points="${ptsStr}" fill="none" stroke="${st.c4}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
    if (st.glowCracks) {
      cracks += `<polyline points="${ptsStr}" fill="none" stroke="#ffcf6e" stroke-width="2.6" stroke-linecap="round" opacity="0.5" filter="url(#${uid}-blur)"/>
        <polyline points="${ptsStr}" fill="none" stroke="#fff2c0" stroke-width="0.9" stroke-linecap="round" opacity="0.95">
        <animate attributeName="opacity" values="0.45;1;0.45" dur="${(2 + rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/></polyline>`;
    }
  }

  // ---------- świecące, wielofasetkowe kryształy ----------
  let gems = '';
  const gemCount = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < gemCount; i++) {
    const [gx, gy] = inner(46);
    const s = 6 + rnd() * 7;
    const rot = Math.round(rnd() * 360);
    const pulse = (2 + rnd() * 2.5).toFixed(1);

    if (st.hearts && i === 0) {
      gems += `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${(s / 6.5).toFixed(2)})">
        <ellipse cx="0" cy="3" rx="9" ry="8" fill="${st.crystal}" opacity="0.35" filter="url(#${uid}-blur)"/>
        <path d="M 0 2.5 C -3.6 -2.6, -8.2 1.6, 0 8.4 C 8.2 1.6, 3.6 -2.6, 0 2.5 Z" fill="${st.crystal}" stroke="#ffffff" stroke-width="0.7" opacity="0.96">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="${pulse}s" repeatCount="indefinite"/></path>
        <path d="M -2 0.5 C -3 -1.2, -5.4 0.4, -2.4 3.4 Z" fill="#ffffff" opacity="0.55"/>
      </g>`;
      continue;
    }

    // klejnot: poświata + dwie fasetki (jasna/ciemna) rozdzielone grzbietem + błysk
    const p = k => (k * s).toFixed(1);
    gems += `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) rotate(${rot})">
      <ellipse cx="0" cy="0" rx="${(s * 1.15).toFixed(1)}" ry="${(s * 1.15).toFixed(1)}" fill="${st.crystal}" opacity="0.28" filter="url(#${uid}-blur)"/>
      <polygon points="0,${p(-1)} ${p(0.72)},${p(-0.28)} ${p(0.46)},${p(0.82)} 0,${p(0.62)}" fill="${st.crystal}" opacity="0.75"/>
      <polygon points="0,${p(-1)} 0,${p(0.62)} ${p(-0.46)},${p(0.82)} ${p(-0.72)},${p(-0.28)}" fill="#ffffff" opacity="0.9"/>
      <polygon points="0,${p(-1)} ${p(0.72)},${p(-0.28)} ${p(0.46)},${p(0.82)} 0,${p(0.62)} ${p(-0.46)},${p(0.82)} ${p(-0.72)},${p(-0.28)}"
        fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.85">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="${pulse}s" repeatCount="indefinite"/></polygon>
      <line x1="0" y1="${p(-1)}" x2="0" y2="${p(0.62)}" stroke="#ffffff" stroke-width="0.6" opacity="0.6"/>
      <circle cx="${p(-0.28)}" cy="${p(-0.34)}" r="${(s * 0.13).toFixed(1)}" fill="#ffffff" opacity="0.95"/>
    </g>`;
  }

  // ---------- tekstura: drobinki pyłu ----------
  let speckles = '';
  for (let i = 0; i < 16; i++) {
    const [sx, sy] = inner(60);
    speckles += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(0.6 + rnd() * 1.5).toFixed(1)}" fill="${rnd() < 0.5 ? st.c0 : st.c4}" opacity="0.22"/>`;
  }

  // ---------- iskrzące gwiazdki (lód / otchłań / gwiezdna) ----------
  let sparkles = '';
  if (st.sparkles) {
    for (let i = 0; i < 8; i++) {
      const [sx, sy] = inner(52);
      sparkles += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(0.8 + rnd()).toFixed(1)}" fill="#ffffff">
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
      <!-- grube nierówności skały jako mapa wysokości -> realne oświetlenie 3D -->
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.065" numOctaves="4" seed="${seed}" stitchTiles="stitch" result="turb"/>
      <feDiffuseLighting in="turb" surfaceScale="3.4" diffuseConstant="1.1" lighting-color="${st.lightCol}" result="lit">
        <feDistantLight azimuth="228" elevation="52"/>
      </feDiffuseLighting>
      <feComposite in="lit" in2="SourceAlpha" operator="in" result="litClip"/>
      <feBlend in="SourceGraphic" in2="litClip" mode="overlay" result="rough"/>
      <!-- drobne ziarno powierzchni (mikro-szczegół) -->
      <feTurbulence type="fractalNoise" baseFrequency="0.45 0.5" numOctaves="2" seed="${seed + 7}" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0" result="grainA"/>
      <feComposite in="grainA" in2="SourceAlpha" operator="in" result="grainClip"/>
      <feBlend in="rough" in2="grainClip" mode="multiply"/>
    </filter>`;
  const rockAttr = lite ? '' : ` filter="url(#${uid}-rock)"`;

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${bodyFill}
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
