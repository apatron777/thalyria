// Elementos de escenario de Hondaroca (capítulo 6): forjas, chimeneas, yunques, braseros, grúa con crisol,
// casas hundidas y la cabeza de piedra del Padre Yunque asomando del mar. «lavaglow» solo da luz y chispas a los fosos.
(function () {
  'use strict';
  const TH = window.TH, P = TH.props, D = P.defs;
  const px = (g, x, y, c, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w || 1, h || 1); };
  const ell = (g, x, y, rx, ry, c) => TH.ell(g, x, y, rx, ry, c);
  const L = (k, build) => ({ k, build, sway: 0 });
  const FL = ['#fff4b0', '#ffd34a', '#ff8a2a', '#e2482a'];
  const flames = (ctx, x, y, t, s) => {
    for (let i = 0; i < 14; i++) {
      const a = Math.sin(t * 13 + i * 2.3) * 0.5 + 0.5, h = ((i % 5) + 2 + Math.round(a * 3)) * s;
      px(ctx, x + Math.round(Math.sin(i * 1.9 + t * 8) * 3 * s), y - h, FL[Math.min(3, Math.floor(h / (3 * s)))]);
    }
  };
  const bricks = (g, x, y, w, h, a, b, c) => {
    px(g, x, y, a, w, h);
    for (let r = 0; r < h; r += 4) for (let k = ((r / 4) % 2) * 3; k < w; k += 6) { px(g, x + k, y + r, b, 5, 3); px(g, x + k, y + r, c, 5, 1); }
  };

  // Gran horno de forja: bloque de piedra con boca en arco al rojo y chimenea
  function forge(g) {
    bricks(g, 6, 22, 52, 40, '#2a2420', '#4a423a', '#625850');
    px(g, 4, 20, '#1a1614', 56, 3); px(g, 4, 20, '#7a7068', 56, 1);
    // boca en arco
    for (let y = 0; y < 18; y++) { const w = y < 6 ? 12 + y * 2 : 24; px(g, 32 - w / 2, 40 + y, '#120806', w, 1); }
    for (let y = 2; y < 17; y++) { const w = y < 6 ? 8 + y * 2 : 20; px(g, 32 - w / 2, 41 + y, y > 10 ? '#ff7a2a' : '#c8401a', w, 1); }
    px(g, 25, 50, '#ffd04a', 14, 6); px(g, 28, 52, '#fff2b0', 8, 3);
    for (let i = 0; i < 4; i++) px(g, 22 + i * 6, 40, '#6a5a4a', 1, 18);
    // chimenea
    bricks(g, 38, 0, 14, 22, '#2a2420', '#3e3630', '#564c44');
    px(g, 36, 0, '#1a1614', 18, 3); px(g, 36, 0, '#7a7068', 18, 1);
    // herramientas colgadas
    px(g, 10, 28, '#7a7a7a', 1, 10); px(g, 8, 37, '#9a9a9a', 5, 3); px(g, 15, 28, '#7a7a7a', 1, 12); px(g, 14, 39, '#5a3a22', 3, 2);
  }
  D.forge = { w: 64, h: 64, ax: 32, ay: 62, shadow: [26, 4, 1], layers: [L('b', forge)], box: [-26, -8, 26, 1], occluder: true,
    emissive: [{ dx: -10, dy: -22, w: 20, h: 16 }], lights: [{ dx: 0, dy: -14, r: 90, c: [255, 130, 50], a: 1, always: 0.45, flicker: 2 }],
    smoke: [13, -64], sparks: [0, -20] };

  // Chimenea alta de ladrillo
  function chimney(g) { bricks(g, 3, 6, 12, 50, '#2a2420', '#4a3a30', '#6a5446'); px(g, 1, 4, '#1a1614', 16, 4); px(g, 1, 4, '#8a7a6a', 16, 1); px(g, 5, 2, '#ff8a3a', 8, 2); }
  D.chimney = { w: 18, h: 58, ax: 9, ay: 56, shadow: [7, 2, 1], layers: [L('b', chimney)], box: [-6, -4, 6, 1], occluder: true,
    lights: [{ dx: 0, dy: -54, r: 26, c: [255, 140, 60], a: 0.8, always: 0.3, flicker: 1 }], smoke: [0, -58], sparks: [0, -56] };

  // Yunque sobre tocón
  function anvil(g) {
    ell(g, 12, 15, 8, 3, '#2a1a10'); px(g, 6, 10, '#5a3a22', 12, 6); px(g, 6, 10, '#7a5432', 12, 1);
    px(g, 3, 4, '#1e1c1c', 18, 4); px(g, 4, 4, '#4a4642', 16, 3); px(g, 4, 4, '#8a8682', 16, 1); for (let i = 0; i < 5; i++) px(g, i, 5 + Math.round(i * 0.3), '#4a4642', 5 - i, 2);
    px(g, 9, 8, '#2a2826', 6, 2); px(g, 14, 2, '#ff8a3a', 3, 1); px(g, 16, 1, '#ffd04a', 1, 1);
  }
  D.anvil = { w: 24, h: 18, ax: 12, ay: 16, shadow: [9, 2, 1], layers: [L('b', anvil)], box: [-8, -4, 8, 1] };

  // Brasero de hierro con llamas vivas
  function brazier(g) {
    px(g, 4, 10, '#1e1a18', 1, 12); px(g, 13, 10, '#1e1a18', 1, 12); px(g, 8, 12, '#1e1a18', 2, 10);
    ell(g, 9, 9, 7, 3, '#2a2420'); ell(g, 9, 8, 6, 2, '#ff6a1a'); px(g, 5, 7, '#ffd04a', 8, 1);
    px(g, 2, 9, '#4a423a', 14, 2);
  }
  D.brazier = { w: 18, h: 24, ax: 9, ay: 22, shadow: [6, 2, 1], layers: [L('b', brazier)], box: [-5, -3, 5, 1],
    lights: [{ dx: 0, dy: -18, r: 60, c: [255, 150, 60], a: 1, always: 0.3, flicker: 2 }], emissive: [{ dx: -5, dy: -16, w: 10, h: 3 }],
    live: (ctx, x, y, t) => flames(ctx, x, y - 15, t, 1), sparks: [0, -22] };

  // Grúa de la forja con crisol de metal fundido
  function crucible(g) {
    px(g, 34, 6, '#3a2616', 4, 50); px(g, 35, 6, '#6a4a2a', 1, 50); px(g, 30, 52, '#2a1a10', 12, 4);
    px(g, 6, 6, '#3a2616', 32, 3); px(g, 6, 6, '#7a5432', 32, 1); for (let i = 0; i < 6; i++) px(g, 28 - i * 2, 9 + i * 2, '#3a2616', 2, 2);
    for (let i = 0; i < 6; i++) px(g, 11, 9 + i * 3, i % 2 ? '#5a5a5a' : '#7a7a7a', 2, 2);
    ell(g, 12, 30, 8, 6, '#1e1c1c'); ell(g, 12, 29, 7, 5, '#3a3634'); ell(g, 12, 26, 6, 2, '#ff7a2a'); px(g, 8, 25, '#ffd04a', 8, 1);
  }
  D.crucible = { w: 44, h: 58, ax: 30, ay: 56, shadow: [10, 2, 1], layers: [L('b', crucible)], box: [-2, -4, 10, 1], occluder: true,
    lights: [{ dx: -18, dy: -30, r: 50, c: [255, 140, 50], a: 0.9, always: 0.3, flicker: 1 }], emissive: [{ dx: -24, dy: -32, w: 12, h: 3 }],
    live: (ctx, x, y, t) => {
      // chorro de metal fundido que cae del crisol
      const k = (t * 1.3) % 1;
      for (let i = 0; i < 10; i++) px(ctx, x - 20 + (i % 2), y - 22 + i * 2 + Math.round(k * 2), i < 6 ? FL[1] : FL[2], 2, 2);
      px(ctx, x - 22, y - 2, FL[2], 6, 1);
    }, sparks: [-18, -4] };

  // Casa hundida: solo asoman el tejado, la chimenea y una ventana
  function ruin(g, v) {
    const R = v ? ['#2a3a5a', '#3e5272', '#5a6e90'] : ['#5a2418', '#7a3424', '#a24a30'];
    px(g, 10, 18, '#8a7c66', 32, 12); px(g, 10, 18, '#a89a82', 32, 1); px(g, 16, 21, '#2a2018', 6, 6); px(g, 17, 22, '#4a6a7a', 4, 4); px(g, 30, 21, '#2a2018', 6, 6);
    for (let i = 0; i < 12; i++) px(g, 6 + i, 18 - i, i % 2 ? R[1] : R[2], 40 - i * 2, 1);
    px(g, 6, 18, R[0], 40, 1); px(g, 36, 2, '#5a5048', 5, 12); px(g, 35, 1, '#3a3430', 7, 2);
    px(g, 14, 10, '#3a2a1a', 3, 2); px(g, 30, 14, R[0], 4, 1); // tejas que faltan
    for (let i = 0; i < 4; i++) px(g, 9 + i * 9, 29, '#2c5a3a', 4, 2);
  }
  D.ruin = { w: 52, h: 34, ax: 26, ay: 30, layers: [L('b', ruin)], reflect: true, ripple: true, box: [-20, -6, 20, 1] };

  // Cabeza de piedra colosal del Padre Yunque asomando del mar
  function giantHead(g) {
    ell(g, 30, 30, 26, 22, '#3a3632'); ell(g, 29, 28, 24, 20, '#5a544c'); ell(g, 24, 22, 14, 10, '#7a7268');
    px(g, 8, 18, '#3a3632', 46, 6); px(g, 8, 18, '#8a8278', 46, 1); // ceño
    ell(g, 18, 26, 5, 3, '#1a1816'); ell(g, 40, 26, 5, 3, '#1a1816'); px(g, 16, 25, '#5af0d8', 2, 1); // un ojo aún brilla
    px(g, 26, 26, '#4a443e', 6, 10); // nariz
    for (let i = 0; i < 9; i++) px(g, 12 + i * 4, 38 + (i % 2) * 2, '#4a443e', 3, 10); // barba de piedra
    for (let i = 0; i < 6; i++) px(g, 6 + i * 9, 6 + (i % 3) * 3, '#2c5a3a', 6, 3); // musgo
    px(g, 44, 10, '#6a645c', 10, 3); px(g, 50, 6, '#6a645c', 3, 6); // corona rota
    px(g, 4, 46, '#2a2622', 52, 4);
  }
  D.giant_head = { w: 60, h: 52, ax: 30, ay: 48, layers: [L('b', giantHead)], reflect: true, ripple: true, box: [-24, -8, 24, 1],
    lights: [{ dx: -14, dy: -22, r: 22, c: [90, 240, 216], a: 0.8, always: 0.4 }] };

  // Luz y chispas de los fosos de magma (sin dibujo)
  D.lavaglow = { w: 2, h: 2, ax: 1, ay: 1, layers: [], lights: [{ dx: 0, dy: 0, r: 70, c: [255, 110, 40], a: 1, always: 0.55, flicker: 1 }], sparks: [0, -2] };
})();

// ---------- Capítulo 7: Aldea de los Faroleros y Torre del Motor ----------
(function () {
  'use strict';
  const TH = window.TH, D = TH.props.defs;
  const px = (g, x, y, c, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w || 1, h || 1); };
  const ell = (g, x, y, rx, ry, c) => TH.ell(g, x, y, rx, ry, c);
  const L = (k, build) => ({ k, build, sway: 0 });
  const COLS = ['#ff9a3a', '#ffd04a', '#ff6a6a', '#ffb0d0', '#8ad8ff'];
  // Guirnalda de farolillos entre dos postes (64 px)
  function garland(g, v) {
    px(g, 1, 4, '#3a2416', 3, 34); px(g, 60, 4, '#3a2416', 3, 34); px(g, 1, 4, '#6a4a2a', 1, 34); px(g, 60, 4, '#6a4a2a', 1, 34);
    px(g, 0, 3, '#5a3a22', 5, 2); px(g, 59, 3, '#5a3a22', 5, 2);
    for (let x = 4; x < 60; x++) { const y = 6 + Math.round(Math.sin(((x - 4) / 56) * Math.PI) * 8); px(g, x, y, '#2a1a10'); }
    for (let i = 0; i < 7; i++) { const x = 8 + i * 8, y = 7 + Math.round(Math.sin(((x - 4) / 56) * Math.PI) * 8); const c = COLS[(i + (v || 0)) % COLS.length]; px(g, x - 2, y + 1, '#3a2416', 5, 1); px(g, x - 2, y + 2, c, 5, 5); px(g, x - 1, y + 2, '#fff4d0', 1, 4); px(g, x - 2, y + 7, '#3a2416', 5, 1); }
  }
  const gLights = []; for (let i = 0; i < 7; i++) { const x = 8 + i * 8, y = 7 + Math.round(Math.sin(((x - 4) / 56) * Math.PI) * 8); gLights.push({ dx: x - 32, dy: y + 4 - 38, r: 22, c: [255, 190, 110], a: 0.7, always: 0.25, flicker: 1 }); }
  D.garland = { w: 64, h: 40, ax: 32, ay: 38, layers: [L('b', garland)], box: [-31, -2, -28, 1], lights: gLights,
    emissive: gLights.map((l) => ({ dx: l.dx - 2, dy: l.dy - 2, w: 5, h: 5 })) };
  // Farol alto de la aldea (poste curvo con farolillo de papel)
  function lanternPost(g) {
    px(g, 6, 8, '#3a2416', 3, 40); px(g, 6, 8, '#6a4a2a', 1, 40); px(g, 3, 46, '#2a1a10', 9, 3);
    px(g, 8, 6, '#3a2416', 8, 2); px(g, 15, 7, '#3a2416', 1, 4);
    px(g, 12, 11, '#3a2416', 7, 1); px(g, 12, 12, '#ff9a3a', 7, 9); px(g, 13, 12, '#ffd04a', 2, 9); px(g, 12, 21, '#3a2416', 7, 1); px(g, 15, 22, '#3a2416', 1, 2);
  }
  D.lantern_post = { w: 22, h: 50, ax: 8, ay: 48, shadow: [4, 1, 1], layers: [L('b', lanternPost)], box: [-2, -2, 2, 1],
    lights: [{ dx: 7, dy: -32, r: 46, c: [255, 180, 100], a: 0.95, always: 0.3, flicker: 1 }], emissive: [{ dx: 4, dy: -36, w: 7, h: 9 }] };
  // Torre del Motor: aguja dorada colosal con ventanas encendidas y un gran engranaje
  function motorTower(g) {
    const G = ['#3a2408', '#7a5418', '#c8962e', '#f4d27a'];
    for (let y = 30; y < 158; y++) { const k = (y - 30) / 128, w = Math.round(18 + k * 30); px(g, 40 - w / 2, y, G[1], w, 1); px(g, 40 - w / 2, y, G[2], 3, 1); px(g, 40 + w / 2 - 3, y, G[0], 3, 1); }
    for (let i = 0; i < 7; i++) { const y = 46 + i * 16, w = 18 + ((y - 30) / 128) * 30; px(g, 40 - w / 2 - 2, y, G[0], w + 4, 3); px(g, 40 - w / 2 - 2, y, G[3], w + 4, 1); }
    for (let i = 0; i < 6; i++) { const y = 52 + i * 16; px(g, 37, y, '#1a1006', 6, 8); px(g, 38, y + 1, i % 2 ? '#ffd27a' : '#ffe8a0', 4, 6); }
    ell(g, 40, 28, 14, 14, G[0]); ell(g, 40, 28, 12, 12, G[2]); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ell(g, 40 + Math.cos(a) * 14, 28 + Math.sin(a) * 14, 2, 2, G[1]); }
    ell(g, 40, 28, 8, 8, '#fffaf0'); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; px(g, 40 + Math.cos(a) * 6, 28 + Math.sin(a) * 6, '#3a2408'); }
    px(g, 40, 22, '#3a2408', 1, 6); px(g, 40, 28, '#7a1a1a', 4, 1);
    for (let i = 0; i < 14; i++) px(g, 40 - (14 - i) / 2, 13 - i, G[i % 2 ? 2 : 3], 14 - i, 1);
    px(g, 39, 0, G[3], 2, 4); ell(g, 40, 1, 2, 2, '#ffffff');
  }
  D.motor_tower = { w: 80, h: 160, ax: 40, ay: 158, layers: [L('b', motorTower)], box: [-14, -2, 14, 1], occluder: true,
    lights: [{ dx: 0, dy: -130, r: 70, c: [255, 220, 140], a: 1, always: 0.5 }, { dx: 0, dy: -60, r: 40, c: [255, 200, 120], a: 0.8, always: 0.3 }],
    emissive: [{ dx: -8, dy: -138, w: 16, h: 16 }] };
  // Faro de piedra que se enciende con su bandera (prop.lit → luz y haz solo cuando arde)
  function beacon(g, v) {
    const C = [['#2a3a5a', '#4a6a9a'], ['#4a2a5a', '#7a4a9a'], ['#5a2a1a', '#9a4a2a'], ['#2a4a3a', '#4a8a6a']][v || 0];
    for (let y = 22; y < 70; y++) { const w = Math.round(12 + ((y - 22) / 48) * 10); px(g, 20 - w / 2, y, ((y >> 3) % 2) ? '#d8d0c0' : C[1], w, 1); px(g, 20 - w / 2, y, '#ffffff', 1, 1); }
    px(g, 10, 68, '#4a443e', 20, 4); px(g, 11, 18, '#2a2622', 18, 4); px(g, 11, 18, '#8a8278', 18, 1);
    px(g, 13, 8, '#1a1612', 14, 10); px(g, 14, 9, '#3a5a6a', 12, 8); for (let i = 0; i < 3; i++) px(g, 14 + i * 5, 9, '#1a1612', 1, 8);
    for (let i = 0; i < 6; i++) px(g, 14 + i, 7 - i, C[0], 12 - i * 2, 1);
  }
  for (let v = 0; v < 4; v++) {}
  D.beacon = { w: 40, h: 74, ax: 20, ay: 72, shadow: [9, 2, 1], layers: [L('b', beacon)], box: [-8, -6, 8, 1], occluder: true,
    lights: [{ dx: 0, dy: -60, r: 80, c: [255, 230, 160], a: 1, always: 0.4 }], emissive: [{ dx: -6, dy: -63, w: 12, h: 8 }], beam: { dx: 0, dy: -60 } };
})();
