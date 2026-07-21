'use strict';
/* =====================================================================
   ICONS.JS — wektorowy system ikon (SVG, styl liniowy) zastępujący emoji.
   ic(name)      -> zwraca <svg> danej ikony (dziedziczy kolor: currentColor)
   ico(emoji)    -> mapuje znak emoji na właściwą ikonę
   deEmoji(html) -> zamienia WSZYSTKIE emoji w tekście na ikony (gwarancja:
                    żadne emoji nie zostaje — nieznane trafiają na 'dot')
   ===================================================================== */

// Wnętrza ikon (viewBox 0 0 24 24). Domyślnie: obrys currentColor, bez wypełnienia.
const ICONS = {
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  crystal: '<path d="M12 2l8 6-8 14L4 8z" fill="currentColor" fill-opacity=".9" stroke="none"/><path d="M4 8h16M9 8l3 14 3-14" stroke="#07142e" stroke-opacity=".45"/><path d="M8.4 4.2L10 8M15.6 4.2L14 8" stroke="#ffffff" stroke-opacity=".55"/>',
  sparkle: '<path d="M12 2c.6 5 2.4 6.8 7.4 7.4C14.4 10 12.6 11.8 12 16.8 11.4 11.8 9.6 10 4.6 9.4 9.6 8.8 11.4 7 12 2z" fill="currentColor" stroke="none"/><path d="M18.5 14l.6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6z" fill="currentColor" stroke="none"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.2c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.5-2.5.6-2.5 1.6 1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.3c.2-1.6 1.4-2.6 2.9-2.6 1.6 0 2.9 1 2.9 2.6 0 1.9-2.6 2.2-2.6 4.2"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  forward: '<path d="M3 6l8 6-8 6zM13 6l8 6-8 6z"/>',
  video: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11M8.5 9C6 9 6 5.5 8.5 5.5 11 5.5 12 9 12 9s1-3.5 3.5-3.5S18 9 15.5 9"/>',
  soundOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" fill-opacity=".25"/><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" stroke-opacity=".7"/>',
  soundOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" fill-opacity=".25"/><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9.5l4 5M21 9.5l-4 5" stroke-opacity=".8"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 15l3-4 3 2 4-6" /><circle cx="8" cy="15" r=".3" fill="currentColor"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8 20h8M9 20v-1a3 3 0 0 1 6 0v1"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="M9 10L6 3M15 10l3-7M12 13l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" fill="currentColor" stroke="none"/>',
  crown: '<path d="M4 8l3 9h10l3-9-5 4-3-6-3 6-5-4z" fill="currentColor" fill-opacity=".2"/><path d="M4 8l3 9h10l3-9-5 4-3-6-3 6-5-4z"/><path d="M6 20h12" stroke-opacity=".7"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 3 2 3H6" fill="currentColor" fill-opacity=".2"/><path d="M6 21V4M6 5h11l-2 3 2 3H6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor" fill-opacity=".3"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  upload: '<path d="M12 16V5M8 9l4-4 4 4M5 19h14"/>',
  download: '<path d="M12 5v11M8 12l4 4 4-4M5 20h14"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M9 11h6M9 15h4" stroke-opacity=".6"/>',
  save: '<path d="M5 5h11l3 3v11H5z"/><path d="M8 5v5h7V5M8 19v-5h8v5" stroke-opacity=".7"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke-opacity=".6"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-.5-2 1-2h2a4 4 0 0 0 4-4c0-5-4-8-9-8z"/><circle cx="8" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="8" r="1.1" fill="currentColor"/><circle cx="16" cy="10" r="1.1" fill="currentColor"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke-opacity=".5"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 13a8 8 0 0 0 14 4l2-2"/><path d="M4 5v4h4M20 19v-4h-4"/>',
  graduation: '<path d="M2 9l10-4 10 4-10 4z" fill="currentColor" fill-opacity=".2"/><path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v5"/>',
  party: '<path d="M4 20l5-13 7 7z" fill="currentColor" fill-opacity=".2"/><path d="M4 20l5-13 7 7z"/><path d="M13 4l1 1M18 6l-1 1M20 11h-1.5M17 3v1.5" stroke-opacity=".8"/>',
  bolt: '<path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor" fill-opacity=".25"/><path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
  fire: '<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .3 1 1 1.5 1.5 1.5C10 8 11 5 12 3z" fill="currentColor" fill-opacity=".25"/><path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.7.6-2.8 1.3-3.5.2 1.1.9 1.6 1.4 1.6C10 8 11 5.2 12 3z"/>',
  boom: '<path d="M12 2l2 5 5-2-3 4 4 3-5 .5 1 5-4-3-4 3 1-5-5-.5 4-3-3-4 5 2z" fill="currentColor" fill-opacity=".25"/><path d="M12 2l2 5 5-2-3 4 4 3-5 .5 1 5-4-3-4 3 1-5-5-.5 4-3-3-4 5 2z"/>',
  pickaxe: '<path d="M3 21L14 10M4 8c4-4 12-4 16 0-3-1-6 0-8 2M20 8c-4-4-12-4-16 0 3-1 6 0 8 2"/>',
  sword: '<path d="M14 3h7v7l-9 9-2-2 4-4M8 15l-5 5 1 1 5-5M6.5 13.5l4 4"/>',
  tap: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a5 5 0 0 1-5 5h-1c-2 0-3-1-4-2l-3-4c-.7-1 .5-2.5 1.6-1.8L9 13V11"/>',
  muscle: '<path d="M4 18v-2c0-3 2-4 4-4 1.5 0 2-1 2-2.5V6a2 2 0 0 1 4 0c0 4 5 4 5 9v3z" fill="currentColor" fill-opacity=".18"/><path d="M4 18v-2c0-3 2-4 4-4 1.5 0 2-1 2-2.5V6a2 2 0 0 1 4 0c0 4 5 4 5 9v3z"/>',
  rocket: '<path d="M12 3c3 2 5 5 5 9l-2 3H9l-2-3c0-4 2-7 5-9z"/><circle cx="12" cy="10" r="1.5"/><path d="M9 15l-2 4 3-1M15 15l2 4-3-1" stroke-opacity=".8"/>',
  drone: '<ellipse cx="12" cy="13" rx="5" ry="3"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="7" r="2"/><path d="M7 8.5l3 2.5M17 8.5l-3 2.5"/>',
  drill: '<path d="M5 4h8v4H5zM7 8l3 4M11 8l-1 4M10 12l-1 8 2-3 1 3-1-8"/>',
  satellite: '<rect x="10" y="10" width="4" height="4" rx="1" transform="rotate(45 12 12)"/><path d="M6 6l3 3M18 18l-3-3M4 12a6 6 0 0 1 6-6M4 12a10 10 0 0 1 10-10" stroke-opacity=".8"/>',
  factory: '<path d="M4 20V10l5 3V10l5 3V7l6 4v9z" fill="currentColor" fill-opacity=".18"/><path d="M4 20V10l5 3V10l5 3V7l6 4v9z"/><path d="M4 20h16" /><path d="M7 4h2l-.5 4h-1z"/>',
  portal: '<ellipse cx="12" cy="12" rx="4" ry="9"/><ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2 2M17.1 17.1l2 2M19.1 4.9l-2 2M6.9 17.1l-2 2"/>',
  blackhole: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/><path d="M4.5 10c3 1.5 12 1.5 15 0" stroke-opacity=".5"/>',
  moon: '<path d="M16 3a9 9 0 1 0 5 8 6 6 0 0 1-5-8z" fill="currentColor" fill-opacity=".18"/><path d="M16 3a9 9 0 1 0 5 8 6 6 0 0 1-5-8z"/>',
  robot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 5v3M9 3h6"/><circle cx="9.5" cy="13" r="1.3" fill="currentColor"/><circle cx="14.5" cy="13" r="1.3" fill="currentColor"/><path d="M3 12v3M21 12v3"/>',
  comet: '<circle cx="16" cy="8" r="4"/><path d="M13 11L3 21M15 13l-6 6M12 12l-4 4" stroke-opacity=".8"/>',
  meteor: '<path d="M8 16a5 5 0 1 0 5-5 5 5 0 0 0-5 5z" fill="currentColor" fill-opacity=".18"/><path d="M8 16a5 5 0 1 0 5-5 5 5 0 0 0-5 5z"/><path d="M15 9l5-5M14 6l3-3M18 10l3-3" stroke-opacity=".7"/>',
  flask: '<path d="M9 3h6M10 3v6l-4.5 8a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3" /><path d="M7.5 15h9" stroke-opacity=".6"/>',
  microscope: '<path d="M6 20h12M9 20a6 6 0 0 0 8-5M9 4l4 4-3 3-4-4z" /><path d="M11 10l-3 3M6 17h4"/>',
  atom: '<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/>',
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 7 18a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 1.5-5.5A3 3 0 0 0 17.5 7a3 3 0 0 0-3-3 3 3 0 0 0-5 0z"/><path d="M12 5v14" stroke-opacity=".5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  dna: '<path d="M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/><path d="M8.5 6h7M8.5 18h7M7.5 9.5h9M7.5 14.5h9" stroke-opacity=".5"/>',
  planet: '<circle cx="11" cy="11" r="6"/><ellipse cx="11" cy="11" rx="10" ry="3.5" transform="rotate(-25 11 11)" stroke-opacity=".8"/>',
  ice: '<path d="M12 2l3 3-3 2-3-2zM12 22l3-3-3-2-3 2z" fill="currentColor" fill-opacity=".2"/><path d="M12 2v20M4 7l16 10M20 7L4 17"/>',
  volcano: '<path d="M8 9h8l5 11H3zM8 9l-1-3h2m6 3l1-3h2" fill="currentColor" fill-opacity=".18"/><path d="M8 9h8l5 11H3zM9 9l-1-4M15 9l1-4"/>',
  galaxy: '<path d="M12 12c3-4 8-3 8 0s-5 4-8 0-8-3-8 0 5 4 8 0z"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  coffee: '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2"/>',
  handshake: '<path d="M3 8l4-2 5 3 5-3 4 2v7l-4 2-3-3M12 9l-2 2a1.5 1.5 0 0 0 2 2l1-1 3 3"/>',
  alien: '<path d="M12 3c4 0 6 3 6 7 0 5-4 8-6 10-2-2-6-5-6-10 0-4 2-7 6-7z"/><path d="M8.5 11c1 1.5 2 1.5 2 0M15.5 11c-1 1.5-2 1.5-2 0" fill="currentColor" stroke="none"/>',
  crane: '<path d="M5 21V4h2l12 3-12 1M5 6h9M7 8l4 5M11 13v3a1.5 1.5 0 0 0 3 0" /><path d="M3 21h8"/>',
  battery: '<rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3"/><path d="M11 9l-2 4h3l-2 4" stroke="currentColor"/>',
  swarm: '<circle cx="8" cy="8" r="2.2"/><circle cx="15" cy="10" r="2.2"/><circle cx="10" cy="15" r="2.2"/><path d="M6.5 6.5l-2-2M17 8.5l2-2M8.5 16.5l-1 2.5" stroke-opacity=".7"/>',
  orb: '<circle cx="12" cy="12" r="7"/><path d="M9 9a4 4 0 0 1 3-1" stroke-opacity=".8"/><circle cx="12" cy="12" r="7" fill="currentColor" fill-opacity=".12"/>',
  blade: '<path d="M4 20l9-9 3 3-9 9-4 1zM13 11l5-5a2 2 0 0 0-3-3l-5 5"/>',
  gloves: '<path d="M7 21v-6l-2-1a2 2 0 0 1 2-3l2 1V5a1.5 1.5 0 0 1 3 0v5m0-3a1.5 1.5 0 0 1 3 0v3m0-2a1.5 1.5 0 0 1 3 0v6a5 5 0 0 1-5 5z"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" fill="currentColor" fill-opacity=".12"/>',
  wave: '<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  tag: '<path d="M4 4h8l8 8-8 8-8-8z" fill="currentColor" fill-opacity=".14"/><path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/>',
  link: '<path d="M9 15l6-6M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2"/>',
  night: '<path d="M17 5a7 7 0 1 0 3 6 4 4 0 0 1-3-6z"/><path d="M4 20h16M6 17l1 1M11 18l1 1" stroke-opacity=".7"/>',
  magnet: '<path d="M6 4v7a6 6 0 0 0 12 0V4h-4v7a2 2 0 0 1-4 0V4z"/><path d="M6 8h4M14 8h4"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="M9.5 8.5L12 4l2.5 4.5-2.5 2z" fill="currentColor" fill-opacity=".3"/><path d="M9.5 8.5L12 4l2.5 4.5"/>',
  monolith: '<path d="M8 21V6l4-3 4 3v15z" fill="currentColor" fill-opacity=".16"/><path d="M8 21V6l4-3 4 3v15z"/><path d="M8 9h8M8 14h8" stroke-opacity=".5"/>',
  drop: '<path d="M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z" fill="currentColor" fill-opacity=".2"/><path d="M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z"/>',
  rainbow: '<path d="M3 18a9 9 0 0 1 18 0M6 18a6 6 0 0 1 12 0M9 18a3 3 0 0 1 6 0"/>',
  shell: '<path d="M12 20C5 20 3 12 5 8c1.5 4 5 4 7 4s5.5 0 7-4c2 4 0 12-7 8z" fill="currentColor" fill-opacity=".16"/><path d="M12 20c-5 0-8-6-6-11M12 20c5 0 8-6 6-11M12 20V9"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/>',
  rose: '<circle cx="12" cy="8" r="4"/><path d="M12 8a2 2 0 0 1 2-2M12 12v9M12 16c-3 0-4-2-5-3M12 18c3 0 4-2 5-3"/>',
  fog: '<path d="M4 8h13M6 12h14M4 16h12M8 20h9" stroke-opacity=".8"/>',
  relic: '<path d="M12 3l7 5-2.5 9h-9L5 8z" fill="currentColor" fill-opacity=".18"/><path d="M12 3l7 5-2.5 9h-9L5 8z"/><path d="M9 8h6l-1 5h-4z" stroke-opacity=".6"/>',
  fireheart: '<path d="M12 20S5 15 5 9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 2.5C19 15 12 20 12 20z" fill="currentColor" fill-opacity=".2"/><path d="M12 20S5 15 5 9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 2.5C19 15 12 20 12 20z"/>',
  play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
  star4: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="currentColor"/>',
};

// Mapa: znak emoji (bez ️) -> nazwa ikony.
const EMOJI_MAP = {
  '💎':'crystal','💠':'crystal','✨':'sparkle','🌟':'sparkle','🌠':'sparkle','✦':'star4','⭐':'star4',
  '💰':'coin','💛':'coin','✅':'check','✖':'x','❌':'x','❔':'question','❓':'question',
  '🔒':'lock','→':'arrowRight','▶':'play','⏩':'forward','🎬':'video','🎁':'gift',
  '🔊':'soundOn','🔇':'soundOff','📊':'chart','📈':'chart','📅':'calendar','🎯':'target',
  '🏆':'trophy','🏅':'medal','👑':'crown','🚩':'flag','🧭':'compass','📤':'upload','📥':'download',
  '📋':'clipboard','💾':'save','📦':'box','🎨':'palette','🎡':'wheel','🎰':'wheel','🔁':'refresh','🔄':'refresh',
  '🎓':'graduation','🎉':'party','⚡':'bolt','🔥':'fire','💥':'boom','⛏':'pickaxe','⚔':'sword',
  '👆':'tap','🖱':'tap','💪':'muscle','🦾':'muscle','🚀':'rocket','🛸':'drone','🔩':'drill',
  '🛰':'satellite','🏭':'factory','🌀':'portal','☀':'sun','🔆':'sun','🕳':'blackhole','🌙':'moon','🌑':'moon',
  '🤖':'robot','☄':'comet','🪨':'meteor','🧪':'flask','🔬':'microscope','⚛':'atom','🧠':'brain',
  '⚙':'gear','🔧':'gear','🦠':'dna','🪐':'planet','🔴':'planet','🧊':'ice','🌋':'volcano','🌌':'galaxy',
  '☕':'coffee','🤝':'handshake','👽':'alien','🏗':'crane','🔋':'battery','🐝':'swarm','🔮':'orb','🧿':'orb',
  '🔪':'blade','🧤':'gloves','⏳':'hourglass','🌊':'wave','🏷':'tag','🔗':'link','🌃':'night','🧲':'magnet',
  '💍':'ring','🗿':'monolith','💧':'drop','🌈':'rainbow','🦪':'shell','👁':'eye','🌹':'rose','🌫':'fog',
  '🔶':'relic','🟤':'relic','🟠':'relic','🏺':'relic','💨':'fog','❤‍🔥':'fireheart','❤':'fireheart',
};

// Zwraca <svg> danej ikony. Dodaje klasę ic-<name> (kolor tematyczny w CSS).
function ic(name, cls) {
  const key = ICONS[name] ? name : 'dot';
  const inner = ICONS[key];
  return `<svg class="ic ic-${key}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"`
    + ` stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// Mapuje pojedynczy znak/sekwencję emoji na ikonę.
function ico(emoji, cls) {
  const key = emoji.replace(/️/g, '');
  const name = EMOJI_MAP[key] || EMOJI_MAP[emoji] || EMOJI_MAP[[...key][0]] || 'dot';
  return ic(name, cls);
}

// Regex łapiący emoji piktograficzne (z sekwencjami ZWJ/VS) oraz dodatkowe
// symbole spoza tej klasy (strzałki, dingbaty, gwiazdki), których używamy.
const EMOJI_RE = /(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*️?)|[←-⇿☀-➿⬀-⯿]/gu;

// Zamienia WSZYSTKIE emoji w tekście HTML na ikony (nic nie zostaje).
function deEmoji(str) {
  return String(str).replace(EMOJI_RE, m => ico(m));
}
