// Capítulo 8 · Corazón del Motor más épico: relojes rotos y engranajes colosales flotando en el vacío,
// esquirlas de tiempo luminosas alrededor de la plataforma y luz más contrastada.
(function () {
  'use strict';
  const TH = window.TH, D = TH.props.defs;
  const px = (g, x, y, c, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w || 1, h || 1); };
  const ell = (g, x, y, rx, ry, c) => TH.ell(g, x, y, rx, ry, c);
  const L = (k, build) => ({ k, build, sway: 0 });

  // Esfera de reloj colosal, agrietada, flotando sobre el vacío
  function voidClock(g, v) {
    const cx = 40, cy = 38, r = 30;
    ell(g, cx, cy, r + 4, r + 4, '#3a2408'); ell(g, cx, cy, r + 2, r + 2, '#c8962e'); ell(g, cx, cy, r, r, '#120a1e'); ell(g, cx, cy, r - 3, r - 3, '#1e1430');
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; px(g, cx + Math.cos(a) * (r - 6) - 1, cy + Math.sin(a) * (r - 6) - 2, '#f4d27a', 3, i % 3 ? 2 : 5); }
    g.strokeStyle = '#f4d27a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(v ? -2.4 : -1.1) * 22, cy + Math.sin(v ? -2.4 : -1.1) * 22); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(v ? 0.5 : 2.6) * 14, cy + Math.sin(v ? 0.5 : 2.6) * 14); g.stroke();
    ell(g, cx, cy, 3, 3, '#f4d27a');
    // grieta y trozo que falta
    g.strokeStyle = '#c8a8ff'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 6, cy - r); g.lineTo(cx + 2, cy - 14); g.lineTo(cx + 10, cy - 6); g.lineTo(cx + 4, cy + 6); g.stroke();
    g.fillStyle = 'rgba(0,0,0,0)'; g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(cx + r + 5, cy + 4); g.lineTo(cx + 16, cy + 14); g.lineTo(cx + 24, cy + 28); g.lineTo(cx + r + 6, cy + 30); g.closePath(); g.fillStyle = '#000'; g.fill(); g.globalCompositeOperation = 'source-over';
    // fragmentos sueltos
    px(g, cx + 34, cy + 22, '#c8962e', 4, 3); px(g, cx + 38, cy + 30, '#1e1430', 5, 4); px(g, cx + 30, cy + 36, '#c8962e', 3, 2);
  }
  D.void_clock = { w: 84, h: 84, ax: 40, ay: 82, layers: [L('b', voidClock)], reflect: true,
    lights: [{ dx: 0, dy: -44, r: 60, c: [200, 160, 255], a: 0.9, always: 0.7 }] };

  // Engranaje colosal medio hundido en el vacío
  function voidGear(g) {
    const cx = 34, cy = 34, r = 24;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; ell(g, cx + Math.cos(a) * (r + 3), cy + Math.sin(a) * (r + 3), 4, 4, '#7a5418'); ell(g, cx + Math.cos(a) * (r + 3) - 1, cy + Math.sin(a) * (r + 3) - 1, 2, 2, '#c8962e'); }
    ell(g, cx, cy, r, r, '#3a2408'); ell(g, cx, cy, r - 2, r - 2, '#7a5418'); ell(g, cx - 3, cy - 3, r - 8, r - 8, '#a8782a');
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; ell(g, cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, 4, 4, '#1a1006'); }
    ell(g, cx, cy, 6, 6, '#1a1006'); ell(g, cx, cy, 3, 3, '#f4d27a');
  }
  D.void_gear = { w: 70, h: 70, ax: 34, ay: 68, layers: [L('b', voidGear)], reflect: true,
    lights: [{ dx: 0, dy: -34, r: 40, c: [255, 200, 120], a: 0.5, always: 0.3 }] };

  // Esquirla de tiempo: cristal violeta flotando, con luz
  function timeShard(g, v) {
    const C = v ? ['#2a0a4a', '#7a3ae0', '#d8b8ff'] : ['#0a2a4a', '#3a9ae0', '#c8f4ff'];
    g.fillStyle = C[0]; g.beginPath(); g.moveTo(8, 0); g.lineTo(15, 12); g.lineTo(8, 28); g.lineTo(1, 12); g.closePath(); g.fill();
    g.fillStyle = C[1]; g.beginPath(); g.moveTo(8, 2); g.lineTo(13, 12); g.lineTo(8, 25); g.closePath(); g.fill();
    px(g, 6, 5, C[2], 1, 9); px(g, 3, 31, C[1], 10, 1);
  }
  D.time_shard = { w: 16, h: 34, ax: 8, ay: 33, layers: [L('b', timeShard)], box: [-3, -2, 3, 1],
    lights: [{ dx: 0, dy: -18, r: 30, c: [170, 140, 255], a: 0.8, always: 0.4, flicker: 1 }] };

  const M = TH.data.maps.motor;
  if (M) {
    M.dark = 0.58;
    M.zones = [{ rect: [0, 0, 30, 20], tint: [1.12, 0.98, 1.18] }];
    M.props = M.props.concat([
      ['void_clock', 2.2, 3.2, { v: 0 }], ['void_clock', 27.6, 19, { v: 1 }],
      ['void_gear', 27.4, 3], ['void_gear', 1.8, 19.4],
      ['time_shard', 7, 5.4, { v: 1 }], ['time_shard', 23, 5.4, { v: 1 }], ['time_shard', 7, 14.6, { v: 0 }], ['time_shard', 23, 14.6, { v: 0 }],
      ['time_shard', 12.4, 2.8, { v: 0 }], ['time_shard', 17.6, 2.8, { v: 1 }],
    ]);
  }
})();
