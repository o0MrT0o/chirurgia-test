'use strict';
/* =====================================================================
   ASTEROID.JS — proceduralny generator asteroid (SVG).
   Każda skórka ma własny, deterministyczny kształt (seed = id skórki):
   nieregularna bryła, kratery z obwódkami, pęknięcia, żyły kryształów,
   tekstura pyłu i detale specjalne (żarzące się szczeliny lawy, dziury
   w serze, gwiazdy w otchłani...). Zero plików graficznych.
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

// Palety i detale specjalne per skórka.
const ASTEROID_STYLES = {
  classic: { light: '#b8c4e8', mid: '#6b7699', dark: '#3d4568', deep: '#232946', crystal: '#6ee7ff' },
  gold:    { light: '#fff3c4', mid: '#ffd76e', dark: '#c89018', deep: '#6b4e00', crystal: '#fffbe8' },
  ice:     { light: '#f0fcff', mid: '#a8e6f0', dark: '#4aa8c0', deep: '#1a4a5c', crystal: '#d8f6ff', sparkles: true },
  lava:    { light: '#ffb08f', mid: '#ff5f3c', dark: '#a8231a', deep: '#4a0d08', crystal: '#ffd76e', glowCracks: true },
  cheese:  { light: '#fff3b0', mid: '#ffd76e', dark: '#d4a017', deep: '#8a6508', crystal: '#ffffff', holes: true },
  emerald: { light: '#b8ffd8', mid: '#3ddc84', dark: '#1a8a4a', deep: '#0a3d20', crystal: '#d8ffe8' },
  heart:   { light: '#ffd8ec', mid: '#ff8fc8', dark: '#d4488f', deep: '#6b1a44', crystal: '#ffe8f4', hearts: true },
  void:    { light: '#6b4ea8', mid: '#3d2a6b', dark: '#241a4a', deep: '#0d0820', crystal: '#b8a0ff', sparkles: true },
  star:    { light: '#d8e4ff', mid: '#6b8fff', dark: '#2a3da8', deep: '#0d1448', crystal: '#ffffff', sparkles: true },
  rainbow: { light: '#ffffff', mid: '#6ee7ff', dark: '#3d4568', deep: '#262c4a', crystal: '#ffffff', rainbow: true },
};

function generateAsteroidSVG(skinId) {
  const st = ASTEROID_STYLES[skinId] || ASTEROID_STYLES.classic;
  const rnd = seededRandom('asteroida-' + skinId);
  const uid = 'a' + skinId; // unikalne id gradientów (SVG współdzielą przestrzeń id)

  // --- nieregularny obrys bryły (blob wygładzony krzywymi) ---
  const n = 12 + Math.floor(rnd() * 5);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 76 + rnd() * 20;
    pts.push([100 + Math.cos(a) * r, 100 + Math.sin(a) * r]);
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

  // Losowy punkt we wnętrzu bryły (promień do ~70 od środka).
  const inner = (maxR = 58) => {
    const a = rnd() * Math.PI * 2;
    const r = 12 + rnd() * maxR;
    return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];
  };

  // --- kratery (w serze: głębokie dziury) ---
  let craters = '';
  const craterCount = st.holes ? 8 : 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < craterCount; i++) {
    const [cx, cy] = inner(52);
    const rx = (st.holes ? 7 : 9) + rnd() * 12;
    const ry = rx * (0.72 + rnd() * 0.25);
    const rot = Math.round(rnd() * 60 - 30);
    craters += `
      <g transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})">
        <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
          fill="${st.deep}" opacity="${st.holes ? 0.85 : 0.55}"/>
        <ellipse cx="${cx.toFixed(1)}" cy="${(cy - ry * 0.18).toFixed(1)}" rx="${(rx * 0.82).toFixed(1)}" ry="${(ry * 0.72).toFixed(1)}"
          fill="${st.dark}" opacity="0.7"/>
        <ellipse cx="${cx.toFixed(1)}" cy="${(cy + ry * 0.28).toFixed(1)}" rx="${(rx * 0.85).toFixed(1)}" ry="${(ry * 0.5).toFixed(1)}"
          fill="none" stroke="${st.light}" stroke-width="1" opacity="0.22"/>
      </g>`;
  }

  // --- pęknięcia (w lawie: żarzące się) ---
  let cracks = '';
  const crackCount = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < crackCount; i++) {
    let [x, y] = inner(45);
    let a = rnd() * Math.PI * 2;
    const seg = [`${x.toFixed(1)},${y.toFixed(1)}`];
    for (let j = 0; j < 4 + Math.floor(rnd() * 3); j++) {
      a += (rnd() - 0.5) * 1.6;
      x += Math.cos(a) * (8 + rnd() * 10);
      y += Math.sin(a) * (8 + rnd() * 10);
      seg.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const ptsStr = seg.join(' ');
    cracks += `<polyline points="${ptsStr}" fill="none" stroke="${st.deep}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`;
    if (st.glowCracks) {
      cracks += `<polyline points="${ptsStr}" fill="none" stroke="#ffb46e" stroke-width="0.9" stroke-linecap="round" opacity="0.9">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="${(2 + rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/>
      </polyline>`;
    }
  }

  // --- żyły świecących kryształów ---
  let gems = '';
  const gemCount = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < gemCount; i++) {
    const [gx, gy] = inner(48);
    const s = 6 + rnd() * 7;
    const rot = Math.round(rnd() * 360);
    const pulse = (2 + rnd() * 2.5).toFixed(1);
    if (st.hearts && i === 0) {
      // serduszko zamiast kryształu (skórka Kryształowe serce)
      gems += `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${(s / 7).toFixed(2)})">
        <path d="M 0 2 C -3.5 -2.5, -8 1.5, 0 8 C 8 1.5, 3.5 -2.5, 0 2 Z"
          fill="${st.crystal}" stroke="#ffffff" stroke-width="0.8" opacity="0.95">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="${pulse}s" repeatCount="indefinite"/>
        </path>
      </g>`;
      continue;
    }
    gems += `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)}) rotate(${rot})">
      <polygon points="0,${-s} ${(s * 0.75).toFixed(1)},${(-s * 0.25).toFixed(1)} ${(s * 0.45).toFixed(1)},${(s * 0.8).toFixed(1)} ${(-s * 0.45).toFixed(1)},${(s * 0.8).toFixed(1)} ${(-s * 0.75).toFixed(1)},${(-s * 0.25).toFixed(1)}"
        fill="${st.crystal}" stroke="#ffffff" stroke-width="0.9" opacity="0.9">
        <animate attributeName="opacity" values="0.65;1;0.65" dur="${pulse}s" repeatCount="indefinite"/>
      </polygon>
      <line x1="0" y1="${-s}" x2="0" y2="${(s * 0.8).toFixed(1)}" stroke="#ffffff" stroke-width="0.6" opacity="0.5"/>
    </g>`;
  }

  // --- tekstura: drobinki pyłu ---
  let speckles = '';
  for (let i = 0; i < 14; i++) {
    const [sx, sy] = inner(62);
    speckles += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(0.7 + rnd() * 1.4).toFixed(1)}"
      fill="${rnd() < 0.5 ? st.light : st.deep}" opacity="0.25"/>`;
  }

  // --- iskrzące gwiazdki (lód / otchłań / gwiezdna) ---
  let sparkles = '';
  if (st.sparkles) {
    for (let i = 0; i < 7; i++) {
      const [sx, sy] = inner(55);
      sparkles += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(0.8 + rnd()).toFixed(1)}" fill="#ffffff">
        <animate attributeName="opacity" values="0.1;0.9;0.1" dur="${(1.5 + rnd() * 3).toFixed(1)}s"
          begin="${(rnd() * 2).toFixed(1)}s" repeatCount="indefinite"/>
      </circle>`;
    }
  }

  // --- gradient bryły ---
  const bodyFill = st.rainbow
    ? `<linearGradient id="${uid}-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff5f5f"/><stop offset="20%" stop-color="#ffd76e"/>
        <stop offset="40%" stop-color="#3ddc84"/><stop offset="60%" stop-color="#6ee7ff"/>
        <stop offset="80%" stop-color="#8a5fff"/><stop offset="100%" stop-color="#ff8fc8"/>
      </linearGradient>`
    : `<radialGradient id="${uid}-body" cx="0.34" cy="0.3" r="0.95">
        <stop offset="0%" stop-color="${st.light}"/><stop offset="38%" stop-color="${st.mid}"/>
        <stop offset="72%" stop-color="${st.dark}"/><stop offset="100%" stop-color="${st.deep}"/>
      </radialGradient>`;

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${bodyFill}
      <clipPath id="${uid}-clip"><path d="${body}"/></clipPath>
      <filter id="${uid}-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
    </defs>
    <path d="${body}" fill="url(#${uid}-body)"/>
    <g clip-path="url(#${uid}-clip)">
      <!-- miękki cień od dołu i światło od góry -->
      <ellipse cx="128" cy="146" rx="105" ry="72" fill="${st.deep}" opacity="0.5" filter="url(#${uid}-soft)"/>
      <ellipse cx="66" cy="52" rx="72" ry="52" fill="#ffffff" opacity="0.14" filter="url(#${uid}-soft)"/>
      ${speckles}
      ${craters}
      ${cracks}
      ${gems}
      ${sparkles}
      <!-- sunący refleks światła -->
      <path d="M 100 100 L 100 -30 A 130 130 0 0 1 178 22 Z" fill="#ffffff" opacity="0.07">
        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="9s" repeatCount="indefinite"/>
      </path>
    </g>
    <path d="${body}" fill="none" stroke="${st.deep}" stroke-width="2" opacity="0.6"/>
  </svg>`;
}
