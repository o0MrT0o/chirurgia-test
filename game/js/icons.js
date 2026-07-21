'use strict';
/* =====================================================================
   ICONS.JS — wektorowy system ikon (SVG) zastępujący emoji.
   Styl: wypełnione „duotone" z cieniowaniem i światłami (klimat gry).
   ic(name)      -> <svg> danej ikony (dziedziczy kolor: currentColor)
   ico(emoji)    -> mapuje znak emoji na właściwą ikonę
   deEmoji(html) -> zamienia WSZYSTKIE emoji na ikony (nic nie zostaje)
   ===================================================================== */

// Wnętrza ikon (viewBox 0 0 24 24). Baza: currentColor; #0a1330 = cień,
// #fff = światło, #7ff0ff = akcent energii.
const ICONS = {
  dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  crystal: '<path d="M12 2l8 6-8 14L4 8z" fill="currentColor" fill-opacity=".9" stroke="none"/><path d="M4 8h16M9 8l3 14 3-14" stroke="#07142e" stroke-opacity=".45"/><path d="M8.4 4.2L10 8M15.6 4.2L14 8" stroke="#ffffff" stroke-opacity=".6"/><path d="M6 8l1.4-2" stroke="#ffffff" stroke-opacity=".35"/>',
  sparkle: '<path d="M12 2c.6 5 2.4 6.8 7.4 7.4C14.4 10 12.6 11.8 12 16.8 11.4 11.8 9.6 10 4.6 9.4 9.6 8.8 11.4 7 12 2z" fill="currentColor" stroke="none"/><path d="M18.5 14l.6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6z" fill="currentColor" stroke="none"/><path d="M5 4l.4 1.4 1.4.4-1.4.4L5 7.6l-.4-1.4L3.2 5.8l1.4-.4z" fill="currentColor" stroke="none"/>',
  coin: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity=".9"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#0a1330" stroke-opacity=".3"/><circle cx="9.5" cy="9.5" r="1.6" fill="#fff" fill-opacity=".4" stroke="none"/><path d="M12 8.2v7.6M9.8 10.3c0-1 1-1.6 2.2-1.6s2.2.6 2.2 1.5-.9 1.4-2.2 1.4-2.2.6-2.2 1.5 1 1.6 2.2 1.6 2.2-.6 2.2-1.6" stroke="#0a1330" stroke-opacity=".55"/>',
  check: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".16"/><path d="M6.5 12.4l3.4 3.4 7-7.2" stroke-width="2.4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  question: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".14"/><circle cx="12" cy="12" r="9"/><path d="M9.2 9.3c.2-1.6 1.4-2.6 2.9-2.6 1.6 0 2.9 1 2.9 2.6 0 1.9-2.6 2.2-2.6 4.2"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" fill-opacity=".9"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3" fill="#0a1330" stroke="none"/><path d="M12 15.8v2" stroke="#0a1330" stroke-opacity=".7"/>',
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  forward: '<path d="M3 6l8 6-8 6z" fill="currentColor" fill-opacity=".85"/><path d="M13 6l8 6-8 6z" fill="currentColor" fill-opacity=".85"/>',
  video: '<rect x="2.5" y="6" width="14" height="12" rx="2" fill="currentColor" fill-opacity=".9"/><path d="M16.5 10l5-2.6v9.2l-5-2.6z" fill="currentColor" fill-opacity=".7"/><path d="M7 11.5l4 2.5-4 2.5z" fill="#fff" stroke="none"/><rect x="3.6" y="7.3" width="3" height="1.1" rx=".55" fill="#fff" fill-opacity=".35" stroke="none"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.6" fill="currentColor" fill-opacity=".9"/><path d="M4 12.6h16" stroke="#0a1330" stroke-opacity=".4"/><rect x="10.6" y="9" width="2.8" height="11" fill="#0a1330" fill-opacity=".35" stroke="none"/><path d="M8.6 9C6 9 6 5.4 8.6 5.4 11.2 5.4 12 9 12 9s.8-3.6 3.4-3.6S18 9 15.4 9"/><path d="M5 10.4l1.4-.5" stroke="#fff" stroke-opacity=".4"/>',
  soundOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" fill-opacity=".9"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" stroke-opacity=".8"/>',
  soundOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" fill-opacity=".9"/><path d="M17 9.5l4 5M21 9.5l-4 5" stroke-opacity=".85"/>',
  chart: '<path d="M4 3.5v17h16"/><rect x="7" y="12" width="2.4" height="5" rx=".5" fill="currentColor" fill-opacity=".85" stroke="none"/><rect x="11" y="9" width="2.4" height="8" rx=".5" fill="currentColor" fill-opacity=".85" stroke="none"/><rect x="15" y="6" width="2.4" height="11" rx=".5" fill="currentColor" fill-opacity=".85" stroke="none"/><path d="M7 10l4-3 3 2 4-5" stroke="#fff" stroke-opacity=".5"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2" fill="currentColor" fill-opacity=".9"/><path d="M4 9h16" stroke="#0a1330" stroke-opacity=".4"/><path d="M8 3v4M16 3v4"/><circle cx="9" cy="13" r="1" fill="#0a1330" stroke="none"/><circle cx="13" cy="13" r="1" fill="#0a1330" stroke="none"/><circle cx="9" cy="16.5" r="1" fill="#0a1330" fill-opacity=".6" stroke="none"/>',
  target: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity=".14"/><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10.6" cy="10.6" r=".6" fill="#fff" stroke="none"/>',
  trophy: '<path d="M7 3.5h10V8a5 5 0 0 1-10 0V3.5z" fill="currentColor" fill-opacity=".9"/><path d="M8.6 4.6l.4 3" stroke="#fff" stroke-opacity=".45"/><path d="M7 5.5H4v1.2a3 3 0 0 0 3 3M17 5.5h3v1.2a3 3 0 0 1-3 3"/><path d="M12 13v3.5" /><path d="M8.5 20.2h7M9.4 20.2v-1a2.6 2.6 0 0 1 5.2 0v1z" fill="currentColor" fill-opacity=".4"/>',
  medal: '<path d="M8.5 3l3.5 6 3.5-6"/><circle cx="12" cy="15" r="5.5" fill="currentColor" fill-opacity=".9"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 14.2l2-.3z" fill="#fff" fill-opacity=".85" stroke="none"/>',
  crown: '<path d="M3.5 8l3.2 8.5h10.6L20.5 8l-4.8 3.8L12 5.5 8.3 11.8z" fill="currentColor" fill-opacity=".9"/><path d="M6.5 19.5h11" stroke-width="1.7"/><circle cx="3.5" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="20.5" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="5.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.2" r="1" fill="#fff" fill-opacity=".55" stroke="none"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 3 2 3H6z" fill="currentColor" fill-opacity=".85"/><path d="M6 21V4M6 5h11l-2 3 2 3H6"/><path d="M8 6.2l4 0" stroke="#fff" stroke-opacity=".35"/>',
  compass: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".16"/><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor" fill-opacity=".55" stroke="none"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/><circle cx="12" cy="12" r=".9" fill="#fff" stroke="none"/>',
  upload: '<rect x="4" y="17" width="16" height="4" rx="1.5" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M12 16V5M8 9l4-4 4 4M5 19h14"/>',
  download: '<rect x="4" y="17" width="16" height="4" rx="1.5" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M12 5v11M8 12l4 4 4-4M5 20h14"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2" fill="currentColor" fill-opacity=".9"/><rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="currentColor"/><path d="M9 11h6M9 15h4" stroke="#0a1330" stroke-opacity=".5"/>',
  save: '<path d="M5 5h11l3 3v11H5z" fill="currentColor" fill-opacity=".9"/><path d="M8 5v5h7V5" stroke="#0a1330" stroke-opacity=".55"/><rect x="8" y="14" width="8" height="5" fill="#0a1330" fill-opacity=".35" stroke="none"/><rect x="13" y="6" width="1.6" height="2.6" fill="#fff" fill-opacity=".5" stroke="none"/>',
  box: '<path d="M12 2.6l8.4 4.7v9.4L12 21.4 3.6 16.7V7.3z" fill="currentColor" fill-opacity=".9"/><path d="M3.6 7.3L12 12l8.4-4.7M12 12v9.4" stroke="#0a1330" stroke-opacity=".4"/><path d="M12 2.6L3.6 7.3 12 12l8.4-4.7z" fill="#fff" fill-opacity=".14" stroke="none"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-.5-2 1-2h2a4 4 0 0 0 4-4c0-5-4-8-9-8z" fill="currentColor" fill-opacity=".85"/><circle cx="8" cy="11" r="1.2" fill="#ff9a6a" stroke="none"/><circle cx="12" cy="8" r="1.2" fill="#7cf0b0" stroke="none"/><circle cx="16" cy="10" r="1.2" fill="#c6a6ff" stroke="none"/>',
  wheel: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".16"/><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke-opacity=".5"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r=".6" fill="#fff" stroke="none"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 13a8 8 0 0 0 14 4l2-2"/><path d="M4 5v4h4M20 19v-4h-4"/>',
  graduation: '<path d="M2 9l10-4 10 4-10 4z" fill="currentColor" fill-opacity=".9"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v5"/><circle cx="22" cy="15" r=".9" fill="currentColor" stroke="none"/><path d="M4.5 8.6L12 6l7.5 2.6" stroke="#fff" stroke-opacity=".3"/>',
  party: '<path d="M4 20l5-13 7 7z" fill="currentColor" fill-opacity=".85"/><path d="M7.5 13l5-2M9 16l4-1.5" stroke="#fff" stroke-opacity=".35"/><path d="M13 4l1 1M18 6l-1 1M20 11h-1.5M17 3v1.5" stroke-opacity=".8"/>',
  bolt: '<path d="M13.2 2L4.5 13.6h5.3L8.6 22l9.4-12.4h-5.6z" fill="currentColor" fill-opacity=".9"/><path d="M13.2 2L4.5 13.6h5.3" stroke="#fff" stroke-opacity=".35"/>',
  fire: '<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.7.6-2.8 1.3-3.5.2 1.1.9 1.6 1.4 1.6C10 8 11 5.2 12 3z" fill="currentColor" fill-opacity=".9"/><path d="M12 20a2.4 2.4 0 0 0 2.4-2.4c0-1.6-2.4-3-2.4-3s-2.4 1.4-2.4 3A2.4 2.4 0 0 0 12 20z" fill="#fff" fill-opacity=".4" stroke="none"/>',
  boom: '<path d="M12 2l2 5 5-2-3 4 4 3-5 .5 1 5-4-3-4 3 1-5-5-.5 4-3-3-4 5 2z" fill="currentColor" fill-opacity=".9"/><circle cx="12" cy="12" r="2" fill="#fff" fill-opacity=".45" stroke="none"/>',
  pickaxe: '<path d="M3 21L14 10" stroke-width="2.4"/><path d="M4 8c4-4 12-4 16 0-3-1-6 0-8 2M20 8c-4-4-12-4-16 0 3-1 6 0 8 2" fill="currentColor" fill-opacity=".85"/>',
  sword: '<path d="M14 3h7v7l-9 9-2-2 4-4z" fill="currentColor" fill-opacity=".85"/><path d="M14 3h7v7l-9 9-2-2 4-4M8 15l-5 5 1 1 5-5M6.5 13.5l4 4"/>',
  tap: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a5 5 0 0 1-5 5h-1c-2 0-3-1-4-2l-3-4c-.7-1 .5-2.5 1.6-1.8L9 13V11z" fill="currentColor" fill-opacity=".85"/>',
  muscle: '<path d="M4 18v-2c0-3 2-4 4-4 1.5 0 2-1 2-2.5V6a2 2 0 0 1 4 0c0 4 5 4 5 9v3z" fill="currentColor" fill-opacity=".85"/><path d="M8 12c1 .6 2.5.6 3.5 0" stroke="#0a1330" stroke-opacity=".4"/>',
  rocket: '<path d="M12 2.5c3.2 2.3 4.8 5.4 4.8 9.3L15 15H9l-1.8-3.2c0-3.9 1.6-7 4.8-9.3z" fill="currentColor" fill-opacity=".9"/><circle cx="12" cy="9.8" r="1.7" fill="#0a1330" fill-opacity=".6" stroke="none"/><circle cx="12" cy="9.8" r=".8" fill="#7ff0ff" stroke="none"/><path d="M9 15l-2.2 4 3.1-1.1M15 15l2.2 4-3.1-1.1" fill="currentColor" fill-opacity=".7"/><path d="M11 17.6h2l-1 3.4z" fill="#ff9a6a" stroke="none"/>',
  drone: '<ellipse cx="12" cy="13" rx="5.2" ry="3.2" fill="currentColor" fill-opacity=".9"/><ellipse cx="10.3" cy="11.8" rx="1.6" ry="1" fill="#fff" fill-opacity=".4" stroke="none"/><circle cx="12" cy="13" r="1.2" fill="#7ff0ff" stroke="none"/><circle cx="4.8" cy="7" r="2" fill="currentColor" fill-opacity=".9"/><circle cx="19.2" cy="7" r="2" fill="currentColor" fill-opacity=".9"/><path d="M6.4 8.4l2.6 2.2M17.6 8.4l-2.6 2.2"/>',
  drill: '<rect x="6.5" y="3.5" width="7" height="4.3" rx="1.2" fill="currentColor" fill-opacity=".9"/><circle cx="8.4" cy="5.6" r=".5" fill="#0a1330" stroke="none"/><circle cx="11.6" cy="5.6" r=".5" fill="#0a1330" stroke="none"/><path d="M8 7.8h4l-1.1 3.4H9.1z" fill="currentColor" fill-opacity=".6" stroke="none"/><path d="M10 11.2V21l1.4-2.6"/><path d="M7.1 4l1-.35" stroke="#fff" stroke-opacity=".5"/>',
  satellite: '<rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1" transform="rotate(45 12 12)" fill="currentColor" fill-opacity=".9"/><rect x="2" y="10.6" width="4.6" height="2.8" rx=".6" transform="rotate(45 4.3 12)" fill="currentColor" fill-opacity=".7"/><rect x="17.4" y="10.6" width="4.6" height="2.8" rx=".6" transform="rotate(45 19.7 12)" fill="currentColor" fill-opacity=".7"/><path d="M15 6a4 4 0 0 1 3 3M15.5 3.5A8 8 0 0 1 20.5 8.5" stroke-opacity=".8"/><circle cx="12" cy="12" r=".9" fill="#7ff0ff" stroke="none"/>',
  factory: '<path d="M3.5 20.5V10l5 3V10l5 3V6.5l6 4v10z" fill="currentColor" fill-opacity=".9"/><path d="M3.5 20.5h17" stroke="#0a1330" stroke-opacity=".4"/><rect x="6" y="15" width="2.2" height="3.6" fill="#0a1330" fill-opacity=".4" stroke="none"/><rect x="11" y="15" width="2.2" height="3.6" fill="#0a1330" fill-opacity=".4" stroke="none"/><rect x="16" y="15" width="2.2" height="3.6" fill="#7ff0ff" fill-opacity=".5" stroke="none"/><path d="M6.5 4h2l-.4 3.5h-1.2z" fill="currentColor"/>',
  portal: '<ellipse cx="12" cy="12" rx="4" ry="9" fill="currentColor" fill-opacity=".16"/><ellipse cx="12" cy="12" rx="8.5" ry="3.8" fill="currentColor" fill-opacity=".16"/><ellipse cx="12" cy="12" rx="4" ry="9"/><ellipse cx="12" cy="12" rx="8.5" ry="3.8"/><ellipse cx="12" cy="12" rx="2" ry="4.2" fill="currentColor" fill-opacity=".5" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="#fff" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4.8" fill="currentColor" fill-opacity=".9"/><circle cx="10.4" cy="10.4" r="1.4" fill="#fff" fill-opacity=".4" stroke="none"/><path d="M12 2v3.2M12 18.8V22M2 12h3.2M18.8 12H22M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2"/>',
  blackhole: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4" fill="#05070f" stroke="none"/><circle cx="12" cy="12" r="4"/><path d="M4 10.5c3.2 1.6 12.8 1.6 16 0M4.5 14c3 1.4 12 1.4 15 0" stroke-opacity=".5"/><circle cx="14" cy="9.2" r=".7" fill="#fff" stroke="none"/>',
  moon: '<circle cx="12" cy="12" r="8.5" fill="currentColor" fill-opacity=".9"/><path d="M15 4.2A9 9 0 0 1 15 19.8 8.5 8.5 0 0 0 15 4.2z" fill="#fff" fill-opacity=".16" stroke="none"/><circle cx="9" cy="9.5" r="1.7" fill="#0a1330" fill-opacity=".35" stroke="none"/><circle cx="13.5" cy="14" r="1.1" fill="#0a1330" fill-opacity=".3" stroke="none"/><circle cx="8" cy="14.5" r=".8" fill="#0a1330" fill-opacity=".3" stroke="none"/>',
  robot: '<rect x="4.5" y="7.5" width="15" height="11" rx="2.5" fill="currentColor" fill-opacity=".9"/><path d="M12 4.8v2.7"/><circle cx="12" cy="3.6" r="1.2" fill="currentColor" stroke="none"/><rect x="7.3" y="10" width="9.4" height="4.6" rx="1.6" fill="#0a1330" fill-opacity=".6" stroke="none"/><circle cx="10" cy="12.3" r="1.15" fill="#7ff0ff" stroke="none"/><circle cx="14" cy="12.3" r="1.15" fill="#7ff0ff" stroke="none"/><path d="M9.6 16.6h4.8" stroke="#0a1330" stroke-opacity=".45"/><path d="M3 11.5v3.2M21 11.5v3.2"/>',
  comet: '<circle cx="16" cy="8" r="4" fill="currentColor" fill-opacity=".9"/><circle cx="14.6" cy="6.6" r="1.2" fill="#fff" fill-opacity=".4" stroke="none"/><path d="M13 11L3 21M15 13l-6 6M12 12l-4 4" stroke-opacity=".8"/>',
  meteor: '<path d="M8 16a5 5 0 1 0 5-5 5 5 0 0 0-5 5z" fill="currentColor" fill-opacity=".9"/><circle cx="11" cy="14" r="1" fill="#0a1330" fill-opacity=".4" stroke="none"/><circle cx="13.6" cy="17" r=".7" fill="#0a1330" fill-opacity=".35" stroke="none"/><path d="M15 9l5-5M14 6l3-3M18 10l3-3" stroke-opacity=".75"/>',
  flask: '<path d="M9.3 3h5.4M10.2 3v5.6l-4.4 7.8a2 2 0 0 0 1.8 3h8.8a2 2 0 0 0 1.8-3l-4.4-7.8V3"/><path d="M7.4 14.5h9.2l1.4 2.5a2 2 0 0 1-1.8 3H7.8a2 2 0 0 1-1.8-3z" fill="currentColor" fill-opacity=".55" stroke="none"/><circle cx="10" cy="17" r=".8" fill="#fff" fill-opacity=".6" stroke="none"/><circle cx="13.6" cy="16" r=".6" fill="#fff" fill-opacity=".5" stroke="none"/>',
  microscope: '<path d="M6 20h12M9 20a6 6 0 0 0 8-5"/><path d="M9 4l4 4-3 3-4-4z" fill="currentColor" fill-opacity=".85"/><path d="M11 10l-3 3M6 17h4"/>',
  atom: '<circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/>',
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 7 18a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 1.5-5.5A3 3 0 0 0 17.5 7a3 3 0 0 0-3-3 3 3 0 0 0-5 0z" fill="currentColor" fill-opacity=".2"/><path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 7 18a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 1.5-5.5A3 3 0 0 0 17.5 7a3 3 0 0 0-3-3 3 3 0 0 0-5 0z"/><path d="M12 5v14" stroke-opacity=".5"/>',
  gear: '<path d="M12 2.2l1.5 2.1 2.5-.6.4 2.6 2.5.9-.9 2.5 1.8 1.9-1.8 1.9.9 2.5-2.5.9-.4 2.6-2.5-.6L12 21.8l-1.5-2.1-2.5.6-.4-2.6-2.5-.9.9-2.5L4.2 12l1.8-1.9-.9-2.5 2.5-.9.4-2.6 2.5.6z" fill="currentColor" fill-opacity=".9"/><circle cx="12" cy="12" r="3.1" fill="#0a1330" fill-opacity=".55" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="#7ff0ff" stroke="none"/>',
  dna: '<path d="M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/><path d="M8.5 6h7M8.5 18h7M7.5 9.5h9M7.5 14.5h9" stroke-opacity=".5"/>',
  planet: '<circle cx="11" cy="11" r="6.2" fill="currentColor" fill-opacity=".9"/><circle cx="9" cy="9" r="1.5" fill="#fff" fill-opacity=".3" stroke="none"/><ellipse cx="11" cy="11" rx="10" ry="3.5" transform="rotate(-25 11 11)" stroke-opacity=".85"/>',
  ice: '<path d="M12 2l3 3-3 2-3-2zM12 22l3-3-3-2-3 2z" fill="currentColor" fill-opacity=".55" stroke="none"/><path d="M12 2v20M4 7l16 10M20 7L4 17"/>',
  volcano: '<path d="M8 9h8l5 11H3z" fill="currentColor" fill-opacity=".85"/><path d="M8 9h8l5 11H3zM9 9l-1-4M15 9l1-4"/><path d="M10 20l1-4 1 2 1-3 1 5z" fill="#ff9a6a" fill-opacity=".7" stroke="none"/>',
  galaxy: '<path d="M12 12c3-4 8-3 8 0s-5 4-8 0-8-3-8 0 5 4 8 0z" fill="currentColor" fill-opacity=".3"/><path d="M12 12c3-4 8-3 8 0s-5 4-8 0-8-3-8 0 5 4 8 0z"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  coffee: '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="currentColor" fill-opacity=".85"/><path d="M17 9h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2"/>',
  handshake: '<path d="M3 8l4-2 5 3 5-3 4 2v7l-4 2-3-3M12 9l-2 2a1.5 1.5 0 0 0 2 2l1-1 3 3" fill="currentColor" fill-opacity=".18"/><path d="M3 8l4-2 5 3 5-3 4 2v7l-4 2-3-3M12 9l-2 2a1.5 1.5 0 0 0 2 2l1-1 3 3"/>',
  alien: '<path d="M12 3c4 0 6 3 6 7 0 5-4 8-6 10-2-2-6-5-6-10 0-4 2-7 6-7z" fill="currentColor" fill-opacity=".9"/><path d="M8.5 11c1 1.5 2 1.5 2 0M15.5 11c-1 1.5-2 1.5-2 0" fill="#0a1330" stroke="none"/>',
  crane: '<path d="M5 21V4h2l12 3-12 1M5 6h9M7 8l4 5M11 13v3a1.5 1.5 0 0 0 3 0"/><path d="M3 21h8"/>',
  battery: '<rect x="3" y="8" width="16" height="9" rx="2" fill="currentColor" fill-opacity=".85"/><path d="M21 11v3"/><path d="M11 9l-2 4h3l-2 4" stroke="#0a1330" stroke-opacity=".6"/>',
  swarm: '<circle cx="8" cy="8" r="2.4" fill="currentColor" fill-opacity=".85"/><circle cx="15" cy="10" r="2.4" fill="currentColor" fill-opacity=".85"/><circle cx="10" cy="15" r="2.4" fill="currentColor" fill-opacity=".85"/><path d="M6.5 6.5l-2-2M17 8.5l2-2M8.5 16.5l-1 2.5" stroke-opacity=".7"/>',
  orb: '<circle cx="12" cy="12" r="7" fill="currentColor" fill-opacity=".35"/><circle cx="12" cy="12" r="7"/><circle cx="9.5" cy="9.5" r="1.6" fill="#fff" fill-opacity=".5" stroke="none"/>',
  blade: '<path d="M4 20l9-9 3 3-9 9-4 1z" fill="currentColor" fill-opacity=".7"/><path d="M4 20l9-9 3 3-9 9-4 1zM13 11l5-5a2 2 0 0 0-3-3l-5 5"/>',
  gloves: '<path d="M7 21v-6l-2-1a2 2 0 0 1 2-3l2 1V5a1.5 1.5 0 0 1 3 0v5m0-3a1.5 1.5 0 0 1 3 0v3m0-2a1.5 1.5 0 0 1 3 0v6a5 5 0 0 1-5 5z" fill="currentColor" fill-opacity=".85"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" fill="currentColor" fill-opacity=".18"/><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/><path d="M9 18.5h6" stroke="currentColor"/>',
  wave: '<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  tag: '<path d="M4 4h8l8 8-8 8-8-8z" fill="currentColor" fill-opacity=".85"/><path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.5" fill="#0a1330" stroke="none"/>',
  link: '<path d="M9 15l6-6M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2"/>',
  night: '<path d="M17 5a7 7 0 1 0 3 6 4 4 0 0 1-3-6z" fill="currentColor" fill-opacity=".85"/><path d="M4 20h16M6 17l1 1M11 18l1 1" stroke-opacity=".7"/>',
  magnet: '<path d="M6 4v7a6 6 0 0 0 12 0V4h-4v7a2 2 0 0 1-4 0V4z" fill="currentColor" fill-opacity=".85"/><path d="M6 8h4M14 8h4" stroke="#0a1330" stroke-opacity=".5"/>',
  ring: '<circle cx="12" cy="14.5" r="5.5" fill="currentColor" fill-opacity=".2"/><circle cx="12" cy="14.5" r="5.5"/><path d="M9.5 9L12 3.5 14.5 9l-2.5 2z" fill="currentColor" fill-opacity=".6" stroke="none"/><path d="M9.5 9L12 3.5 14.5 9"/>',
  monolith: '<path d="M8 21V6l4-3 4 3v15z" fill="currentColor" fill-opacity=".85"/><path d="M8 21V6l4-3 4 3v15z"/><path d="M8 9h8M8 14h8" stroke="#0a1330" stroke-opacity=".4"/>',
  drop: '<path d="M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z" fill="currentColor" fill-opacity=".8"/><path d="M9 13a3 3 0 0 0 1 3.4" stroke="#fff" stroke-opacity=".5"/>',
  rainbow: '<path d="M3 18a9 9 0 0 1 18 0" stroke="#ff9a6a"/><path d="M6 18a6 6 0 0 1 12 0" stroke="#ffd76e"/><path d="M9 18a3 3 0 0 1 6 0" stroke="#7cf0b0"/>',
  shell: '<path d="M12 20C5 20 3 12 5 8c1.5 4 5 4 7 4s5.5 0 7-4c2 4 0 12-7 8z" fill="currentColor" fill-opacity=".3"/><path d="M12 20c-5 0-8-6-6-11M12 20c5 0 8-6 6-11M12 20V9"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" fill="currentColor" fill-opacity=".2"/><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r=".7" fill="#fff" stroke="none"/>',
  rose: '<circle cx="12" cy="8" r="4" fill="currentColor" fill-opacity=".85"/><path d="M12 8a2 2 0 0 1 2-2" stroke="#0a1330" stroke-opacity=".4"/><path d="M12 12v9M12 16c-3 0-4-2-5-3M12 18c3 0 4-2 5-3"/>',
  fog: '<path d="M4 8h13M6 12h14M4 16h12M8 20h9" stroke-opacity=".85"/>',
  relic: '<path d="M12 3l7 5-2.5 9h-9L5 8z" fill="currentColor" fill-opacity=".85"/><path d="M12 3l7 5-2.5 9h-9L5 8z"/><path d="M9 8h6l-1 5h-4z" fill="#0a1330" fill-opacity=".35" stroke="none"/><path d="M7 7l2-2" stroke="#fff" stroke-opacity=".4"/>',
  fireheart: '<path d="M12 20S5 15 5 9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 2.5C19 15 12 20 12 20z" fill="currentColor" fill-opacity=".85"/><path d="M12 17c1.4-1 2.4-2.2 2.4-3.6 0-1.4-2.4-2.8-2.4-2.8s-2.4 1.4-2.4 2.8C9.6 14.8 10.6 16 12 17z" fill="#ffd76e" fill-opacity=".55" stroke="none"/>',
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
