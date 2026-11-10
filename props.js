// Objetos del escenario. Cada definición se dibuja una vez en una caché y se reutiliza.
// Para sustituir por arte dibujado: cambiar build() por un drawImage de la imagen.
(function () {
  'use strict';
  const TH = window.TH, px = TH.px, ell = TH.ell, R = TH.util.rnd;
  const cache = new Map();
  function layerImg(key, w, h, fn) {
    let c = cache.get(key);
    if (!c) { const o = TH.makeCanvas(w, h); fn(o.g); c = o.c; cache.set(key, c); }
    return c;
  }

  // ---- árboles ----
  const TREE_PAL = [
    ['#1f4a35', '#2f6e40', '#45924a', '#6fb957', '#a6dc72', '#b8e47c'],
    ['#1d4038', '#2a5f4a', '#3f8156', '#5fa864', '#93cf7c', '#a9dd8a'],
    ['#1f4a35', '#2f6e40', '#45924a', '#6fb957', '#a6dc72', '#ffc2d6'],
  ];
  function treeTrunk(g) {
    const bx = 22, by = 50;
    px(g, bx - 3, by - 12, '#6b4430', 7, 12); px(g, bx - 3, by - 12, '#8f5d3c', 2, 12); px(g, bx + 3, by - 12, '#4a2c22', 1, 12);
    px(g, bx - 5, by - 1, '#4a2c22', 3, 1); px(g, bx + 3, by - 1, '#4a2c22', 3, 1); px(g, bx - 1, by - 7, '#4a2c22', 1, 2);
  }
  function treeCanopy(g, v) {
    const P = TREE_PAL[v % 3], bx = 22, cy = 28;
    const lumps = [[-9, 4, 6], [9, 3, 6], [0, -10, 7], [-6, -6, 6], [6, -7, 6]];
    for (const [dx, dy, r] of lumps) ell(g, bx + dx, cy + dy, r + 1, r + 1, P[0]);
    ell(g, bx, cy, 13, 12, P[0]);
    for (const [dx, dy, r] of lumps) ell(g, bx + dx, cy + dy, r, r, P[1]);
    ell(g, bx, cy, 12, 11, P[1]);
    ell(g, bx - 2, cy - 3, 9, 8, P[2]); ell(g, bx - 5, cy - 7, 5, 4, P[3]); ell(g, bx - 6, cy - 9, 2, 2, P[4]);
    for (let i = 0; i < 12; i++) px(g, bx - 10 + R(v, i, 600) * 18, cy - 10 + R(v, i, 610) * 13, i % 3 ? P[3] : P[5], v === 2 && i % 2 ? 2 : 1, 1);
    for (let i = 0; i < 10; i++) px(g, bx - 11 + R(v, i, 620) * 22, cy + 9 + (i % 3), P[0], 2, 1);
  }
  function pineCanopy(g, v) {
    const bx = 17;
    const tiers = [[44, 13], [36, 11], [28, 9], [20, 7], [13, 4]];
    for (const [ty, hw] of tiers) {
      for (let k = 0; k < 10; k++) {
        const w = Math.round(hw * (k / 10)) + 1;
        const y = ty - 10 + k;
        px(g, bx - w, y, '#1d4038', w * 2 + 1, 1);
        px(g, bx - w + 1, y, '#2a5f4a', Math.max(1, w * 2 - 1), 1);
        px(g, bx - w + 1, y, '#3f8156', Math.max(1, w - 1), 1);
        if (k === 9) px(g, bx - w, y, '#163430', w * 2 + 1, 1);
      }
      px(g, bx - Math.round(hw * 0.5), ty - 4, '#7fbf6a', 2, 1);
    }
    px(g, bx, 1, '#3f8156', 1, 3);
  }
  function pineTrunk(g) { px(g, 15, 44, '#5a3826', 5, 10); px(g, 15, 44, '#7a4c32', 1, 10); }

  // ---- casa ----
  const HOUSE_PAL = [
    { wall: '#efe2c8', wallS: '#d8c6a6', roof: ['#3f5f9e', '#4f6fb0', '#6f8fd0'], trim: '#6b4430' },
    { wall: '#f0d8c0', wallS: '#d9bea2', roof: ['#94402f', '#b0503c', '#d0705a'], trim: '#5a3826' },
    { wall: '#e6e2d0', wallS: '#cbc6b0', roof: ['#2f6f68', '#3f8a80', '#5fae9f'], trim: '#4f3a2e' },
  ];
  function house(g, v) {
    const P = HOUSE_PAL[v % 3];
    // cimientos
    px(g, 7, 58, '#6e6660', 46, 6); px(g, 7, 58, '#8d847c', 46, 2);
    for (let i = 0; i < 6; i++) px(g, 9 + i * 7, 61, '#5d5651', 1, 3);
    // pared frontal
    px(g, 8, 36, P.wall, 44, 22);
    px(g, 8, 36, P.wallS, 3, 22); px(g, 49, 36, P.wallS, 3, 22);
    // entramado de madera
    for (const bx of [8, 23, 36, 51]) px(g, bx, 36, P.trim, 2, 22);
    px(g, 8, 47, P.trim, 44, 1);
    // ventanas
    for (const wx of [12, 40]) {
      px(g, wx, 41, P.trim, 9, 9);
      px(g, wx + 1, 42, '#2e4a6a', 7, 7);
      px(g, wx + 1, 42, '#4d7aa0', 7, 2);
      px(g, wx + 4, 42, P.trim, 1, 7); px(g, wx + 1, 45, P.trim, 7, 1);
      px(g, wx - 1, 50, '#6b4430', 11, 2);
      for (let i = 0; i < 5; i++) px(g, wx + i * 2, 49, i % 2 ? '#f58aaa' : '#ffd36a');
    }
    // puerta
    px(g, 25, 44, '#3a2216', 10, 14); px(g, 26, 43, '#3a2216', 8, 1);
    px(g, 26, 45, '#7a4a2e', 8, 13); px(g, 27, 44, '#7a4a2e', 6, 1);
    px(g, 29, 45, '#5a3420', 1, 13); px(g, 32, 51, '#f2c14e');
    // farol junto a la puerta
    px(g, 37, 46, '#2b2236', 3, 4); px(g, 38, 47, '#ffd77a');
    // sombra del alero sobre la pared
    px(g, 8, 36, 'rgba(30,20,50,.35)', 44, 3);
    // tejado
    for (let y = 10; y <= 37; y++) {
      const t = (y - 10) / 27;
      const half = Math.round(16 + t * 11);
      const x0 = 30 - half, w = half * 2;
      px(g, x0, y, P.roof[1], w, 1);
      if ((y - 10) % 4 === 0) px(g, x0, y, P.roof[0], w, 1);
      else for (let s = ((y >> 2) % 2) * 2; s < w; s += 4) px(g, x0 + s, y, P.roof[0]);
      px(g, x0, y, P.roof[2], 2, 1);
      px(g, x0 + w - 2, y, P.roof[0], 2, 1);
    }
    px(g, 14, 9, P.roof[2], 32, 2); px(g, 14, 9, '#ffffff', 32, 1);
    px(g, 3, 37, P.roof[0], 54, 2);
    // chimenea
    px(g, 40, 2, '#5d5651', 7, 14); px(g, 40, 2, '#8d847c', 2, 14); px(g, 39, 1, '#4a4440', 9, 2);
  }

  // ---- faro ----
  function lighthouse(g) {
    const cx = 20;
    ell(g, cx, 98, 15, 4, '#5d5651'); ell(g, cx, 97, 14, 3, '#8d847c');
    for (let y = 34; y <= 96; y++) {
      const t = (y - 34) / 62;
      const half = Math.round(7 + t * 4);
      const band = Math.floor((96 - y) / 12) % 2;
      const base = band ? '#c8463c' : '#f2ece4';
      const dark = band ? '#8e2f2a' : '#c9c0b4';
      const lite = band ? '#e06a5c' : '#ffffff';
      px(g, cx - half, y, base, half * 2, 1);
      px(g, cx - half, y, lite, 2, 1);
      px(g, cx + half - 3, y, dark, 3, 1);
    }
    px(g, cx - 3, 86, '#3a2216', 6, 10); px(g, cx - 2, 85, '#3a2216', 4, 1); px(g, cx - 2, 87, '#6b4430', 4, 9);
    for (const wy of [52, 70]) { px(g, cx - 1, wy, '#2b2236', 3, 5); px(g, cx, wy + 1, '#ffd77a'); }
    // galería
    px(g, cx - 12, 30, '#2b2236', 24, 4); px(g, cx - 12, 30, '#4a4458', 24, 1);
    for (let i = 0; i < 6; i++) px(g, cx - 11 + i * 4, 26, '#2b2236', 1, 4);
    px(g, cx - 12, 26, '#2b2236', 24, 1);
    // linterna
    px(g, cx - 7, 16, '#2b2236', 14, 14);
    px(g, cx - 6, 17, '#ffe7a3', 12, 12);
    px(g, cx - 3, 19, '#fff6d6', 6, 8);
    px(g, cx - 1, 17, '#2b2236', 2, 12);
    // cúpula
    ell(g, cx, 14, 8, 5, '#8e2f2a'); ell(g, cx, 13, 7, 4, '#c8463c'); px(g, cx - 4, 11, '#e06a5c', 3, 1);
    px(g, cx, 3, '#2b2236', 1, 6); px(g, cx - 1, 4, '#f2c14e', 3, 2);
  }

  // ---- utilidades varias ----
  function boat(g, v) {
    ell(g, 17, 8, 15, 5, '#3a2216');
    ell(g, 17, 7, 14, 4, v ? '#3f6a8a' : '#8a5432');
    ell(g, 17, 6, 12, 3, '#5a3420');
    px(g, 7, 6, '#a8703f', 20, 1);
    px(g, 15, 3, '#7a4a2e', 4, 7);
    px(g, 8, 4, '#c9b28a', 1, 4); px(g, 26, 4, '#c9b28a', 1, 4);
    px(g, 4, 6, '#e8e0cc', 3, 1);
  }
  function crate(g) {
    px(g, 2, 3, '#4a2e1e', 12, 12); px(g, 3, 4, '#a8703f', 10, 10); px(g, 3, 4, '#c88a52', 10, 1);
    px(g, 3, 8, '#6e4429', 10, 1); px(g, 8, 4, '#6e4429', 1, 10); px(g, 3, 13, '#6e4429', 10, 1);
  }
  function barrel(g) {
    ell(g, 6, 9, 5, 6, '#4a2e1e'); ell(g, 6, 9, 4, 5, '#9b6a40'); px(g, 3, 6, '#c88a52', 1, 6);
    px(g, 2, 6, '#5d5651', 9, 1); px(g, 2, 12, '#5d5651', 9, 1); ell(g, 6, 4, 4, 1, '#6e4429');
  }
  function lamp(g) {
    px(g, 2, 27, '#2b2236', 6, 2); px(g, 4, 8, '#2b2236', 2, 20); px(g, 4, 8, '#4a4458', 1, 20);
    px(g, 2, 2, '#2b2236', 6, 7); px(g, 3, 3, '#ffd77a', 4, 5); px(g, 4, 4, '#fff3c4', 2, 3); px(g, 1, 1, '#2b2236', 8, 2);
  }
  function well(g) {
    ell(g, 13, 22, 11, 5, '#5d5651'); ell(g, 13, 21, 10, 4, '#8d847c'); ell(g, 13, 20, 7, 2, '#1d3a52');
    px(g, 3, 6, '#5a3826', 2, 16); px(g, 21, 6, '#5a3826', 2, 16);
    px(g, 1, 3, '#94402f', 24, 3); px(g, 2, 2, '#b0503c', 22, 2); px(g, 12, 6, '#c9b28a', 1, 10);
    px(g, 11, 15, '#6b4430', 3, 3);
  }
  function campfireBase(g) {
    const s = [[-6, -4], [-4, -1], [0, 0], [4, -1], [6, -4], [4, -7], [-4, -7], [0, -8]];
    for (let i = 0; i < s.length; i++) { ell(g, 10 + s[i][0], 12 + s[i][1], 2, 1, '#4a4658'); px(g, 9 + s[i][0], 11 + s[i][1], i % 2 ? '#9a96aa' : '#7d7990', 2, 1); }
    px(g, 5, 8, '#5b3626', 10, 2); px(g, 6, 7, '#7a4a2e', 8, 1); px(g, 8, 6, '#5b3626', 4, 4);
  }
  function campfireFlames(ctx, x, y, t) {
    const cols = ['#fff4b0', '#ffd34a', '#ff8a2a', '#e2482a'];
    for (let i = 0; i < 18; i++) {
      const a = Math.sin(t * 14 + i * 2.1) * 0.5 + 0.5, h = (i % 6) + 2 + Math.round(a * 3);
      const xo = Math.round(Math.sin(i * 1.7 + t * 9) * (3 - h * 0.25));
      px(ctx, x + xo, y - 6 - h, cols[Math.min(3, Math.floor(h / 3))]);
    }
    for (let k = 0; k < 4; k++) { const h = 9 + Math.round(Math.sin(t * 11 + k * 1.3) * 2); px(ctx, x - 1 + (k % 2), y - 6 - h + k * 2, cols[k], 1, h - k * 2); }
  }
  function log(g) { px(g, 2, 3, '#4a2e1e', 16, 6); px(g, 3, 4, '#8a5a36', 14, 4); px(g, 3, 4, '#a8703f', 14, 1); ell(g, 3, 6, 1, 2, '#c88a52'); }
  function netrack(g) {
    px(g, 3, 4, '#5a3826', 2, 20); px(g, 25, 4, '#5a3826', 2, 20); px(g, 3, 4, '#7a4c32', 24, 2);
    for (let y = 7; y < 20; y += 3) for (let x = 5; x < 25; x += 3) px(g, x, y, '#c9b28a');
    for (let x = 6; x < 25; x += 3) px(g, x, 6, '#a8946e', 1, 14);
  }
  function post(g) { px(g, 1, 0, '#3a2216', 4, 7); px(g, 1, 0, '#6e4429', 1, 7); px(g, 1, 0, '#8a5a36', 4, 1); }
  function sign(g) {
    px(g, 7, 9, '#4a2c22', 3, 10); px(g, 8, 9, '#7a4a2e', 1, 10);
    px(g, 1, 2, '#3a2216', 15, 8); px(g, 2, 3, '#b0703e', 13, 6); px(g, 2, 3, '#cf8f58', 13, 1);
    px(g, 4, 5, '#6b3f22', 9, 1); px(g, 4, 7, '#6b3f22', 6, 1);
  }
  function fence(g) {
    px(g, 1, 3, '#5a3826', 2, 10); px(g, 13, 3, '#5a3826', 2, 10);
    px(g, 0, 5, '#8a5a36', 16, 2); px(g, 0, 9, '#8a5a36', 16, 2); px(g, 0, 5, '#a8703f', 16, 1);
  }
  function bush(g) {
    ell(g, 10, 9, 8, 6, '#1f4a35'); ell(g, 10, 9, 7, 5, '#3f8a44'); ell(g, 8, 7, 3, 2, '#6cb04e');
    for (const [dx, dy] of [[-3, 1], [2, -2], [4, 2]]) { px(g, 10 + dx, 9 + dy, '#e84a5f', 2, 2); px(g, 10 + dx, 9 + dy, '#ffc2c8'); }
  }
  function rock(g) {
    ell(g, 10, 8, 8, 5, '#3d4258'); ell(g, 10, 8, 7, 4, '#7d86a0'); ell(g, 12, 10, 4, 2, '#636b85'); ell(g, 8, 6, 3, 2, '#aab3c8');
    px(g, 6, 3, '#79be52', 3, 1); px(g, 7, 2, '#a6dc72', 2, 1);
  }

  // coral rosado con ramas (v0 rosa, v1 turquesa)
  function coral(g, v) {
    const C = v ? ['#1d5a5a', '#2fa8a0', '#7fe6d4'] : ['#6a2440', '#d8507a', '#ffa8c0'];
    ell(g, 11, 17, 8, 2, '#3d4258');
    const br = [[11, 17, 0, 14], [11, 12, -5, 8], [11, 10, 5, 7], [7, 9, -2, 6], [15, 8, 2, 5]];
    for (const [x, y, dx, h] of br) for (let i = 0; i < h; i++) { const xx = Math.round(x + (dx * i) / h); px(g, xx - 1, y - i, C[0], 3, 1); px(g, xx, y - i, C[1], 1, 1); }
    for (const [x, y, dx, h] of br) { const xx = x + dx; px(g, xx - 1, y - h - 1, C[1], 3, 2); px(g, xx, y - h - 1, C[2], 1, 1); }
  }
  // racimo de cristales de gruta que brillan con luz propia (v0 turquesa, v1 violeta)
  function gem(g, v) {
    const C = v ? ['#2a1a4a', '#7a5ad0', '#c8b0ff', '#ffffff'] : ['#0e2a3a', '#2fa8c8', '#9ff0ff', '#ffffff'];
    ell(g, 10, 15, 8, 2, '#1a1a2a');
    const sp = [[10, 15, 0, 12, 3], [6, 15, -2, 7, 2], [14, 15, 2, 8, 2], [8, 15, -1, 10, 2], [12, 15, 1, 5, 2]];
    for (const [x, y, dx, h, w] of sp) for (let i = 0; i < h; i++) { const xx = Math.round(x + (dx * i) / h), ww = Math.max(1, Math.round(w * (1 - i / h))); px(g, xx - (ww >> 1), y - i, i > h - 3 ? C[2] : C[1], ww, 1); px(g, xx - (ww >> 1), y - i, C[0], 1, 1); }
    px(g, 10, 4, C[3], 1, 2); px(g, 14, 8, C[3], 1, 1); px(g, 6, 9, C[2], 1, 1);
  }
  // altar de piedra con un reloj de arena flotante
  function altar(g) {
    px(g, 2, 18, '#2a2238', 20, 6); px(g, 3, 19, '#8a7a9a', 18, 4); px(g, 3, 19, '#b8a8c8', 18, 1);
    px(g, 6, 8, '#2a2238', 12, 11); px(g, 7, 9, '#c8b8d8', 10, 9); px(g, 7, 9, '#e8dcf0', 10, 1);
    px(g, 9, 1, '#e8b84a', 6, 1); px(g, 9, 7, '#e8b84a', 6, 1); px(g, 10, 2, '#ffe8a0', 4, 2); px(g, 11, 4, '#ffe8a0', 2, 1); px(g, 10, 5, '#ffd070', 4, 2);
  }
  // cofre: v0 cerrado, v1 abierto
  function chest(g, v) {
    px(g, 1, 8, '#3a2216', 16, 9); px(g, 2, 9, '#8a5a36', 14, 7); px(g, 2, 9, '#a8703f', 14, 1);
    px(g, 2, 12, '#6e4429', 14, 1); px(g, 4, 9, '#c9a050', 2, 7); px(g, 12, 9, '#c9a050', 2, 7);
    if (!v) {
      px(g, 1, 3, '#3a2216', 16, 6); px(g, 2, 4, '#a8703f', 14, 4); px(g, 2, 4, '#cf8f58', 14, 1);
      px(g, 4, 4, '#e8c060', 2, 4); px(g, 12, 4, '#e8c060', 2, 4);
      px(g, 8, 7, '#3a2216', 2, 4); px(g, 8, 8, '#ffe08a', 2, 2);
    } else {
      px(g, 1, 0, '#3a2216', 16, 5); px(g, 2, 1, '#6e4429', 14, 3); px(g, 2, 1, '#8a5a36', 14, 1);
      px(g, 2, 7, '#1a1010', 14, 2);
    }
  }
  // puesto del mercado con toldo a rayas
  function stall(g) {
    px(g, 3, 12, '#4a2c22', 2, 22); px(g, 35, 12, '#4a2c22', 2, 22);
    for (let x = 0; x < 40; x += 6) { px(g, x, 4, '#e8e0cc', 3, 9); px(g, x + 3, 4, '#c8402c', 3, 9); }
    px(g, 0, 3, '#7a2418', 40, 1); for (let x = 0; x < 40; x += 3) px(g, x, 13, x % 6 ? '#c8402c' : '#e8e0cc', 3, 2);
    px(g, 1, 22, '#3a2216', 38, 12); px(g, 2, 23, '#8a5a36', 36, 10); px(g, 2, 23, '#b07a48', 36, 1);
    // género: frascos, pescado y telas
    const goods = [['#5fd6c4', 6], ['#e8b84a', 11], ['#c8382c', 16], ['#86a8e8', 25], ['#9fe0a0', 30]];
    for (const [c, x] of goods) { px(g, x, 18, '#2a1d2a', 4, 5); px(g, x + 1, 18, c, 2, 4); px(g, x + 1, 18, '#ffffff', 1, 1); }
    px(g, 19, 20, '#b8c8d8', 6, 2); px(g, 18, 21, '#8a9aa8', 2, 1);
  }

  const L = (k, build, sway) => ({ k, build, sway: sway || 0 });
  const D = (TH.props = {
    cache,
    defs: {
      tree: { w: 44, h: 52, ax: 22, ay: 50, shadow: [13, 4, 3], layers: [L('trunk', treeTrunk), L('canopy', treeCanopy, 1)], box: [-4, -3, 4, 1], occluder: true },
      pine: { w: 34, h: 56, ax: 17, ay: 54, shadow: [10, 3, 2], layers: [L('trunk', pineTrunk), L('canopy', pineCanopy, 1)], box: [-3, -3, 3, 1], occluder: true },
      bush: { w: 20, h: 16, ax: 10, ay: 14, shadow: [8, 3, 1], layers: [L('b', bush, 0.5)], box: [-6, -4, 6, 1] },
      altar: { w: 24, h: 24, ax: 12, ay: 22, shadow: [9, 2, 1], layers: [L('b', altar)], box: [-9, -4, 9, 1], lights: [{ dx: 0, dy: -18, r: 30, c: [255, 220, 150], a: 0.8, always: 0.2 }], emissive: [{ dx: -2, dy: -20, w: 4, h: 5 }] },
      gem: { w: 20, h: 18, ax: 10, ay: 16, shadow: [6, 2, 1], layers: [L('b', gem)], box: [-5, -3, 5, 1], lights: [{ dx: 0, dy: -8, r: 40, c: [120, 220, 255], a: 0.9, always: 0.9 }] },
      gem2: { w: 20, h: 18, ax: 10, ay: 16, shadow: [6, 2, 1], layers: [L('b', (g) => gem(g, 1))], box: [-5, -3, 5, 1], lights: [{ dx: 0, dy: -8, r: 40, c: [190, 150, 255], a: 0.9, always: 0.9 }] },
      coral: { w: 22, h: 20, ax: 11, ay: 18, shadow: [7, 2, 1], layers: [L('b', coral)], box: [-5, -3, 5, 1] },
      rock: { w: 20, h: 14, ax: 10, ay: 13, shadow: [8, 3, 1], layers: [L('b', rock)], box: [-6, -4, 6, 1] },
      house: {
        w: 60, h: 66, ax: 30, ay: 64, layers: [L('b', house)], box: [-22, -24, 22, 1], occluder: true,
        emissive: [{ dx: -17, dy: -22, w: 7, h: 7 }, { dx: 11, dy: -22, w: 7, h: 7 }, { dx: 8, dy: -17, w: 1, h: 1 }],
        lights: [{ dx: 8, dy: -16, r: 28, c: [255, 196, 120], a: 0.9 }, { dx: -13, dy: -12, r: 20, c: [255, 190, 110], a: 0.5 }, { dx: 15, dy: -12, r: 20, c: [255, 190, 110], a: 0.5 }],
        smoke: [13, -62],
      },
      lighthouse: {
        w: 40, h: 104, ax: 20, ay: 102, layers: [L('b', lighthouse)], box: [-12, -8, 12, 1], occluder: true,
        lights: [{ dx: 0, dy: -79, r: 64, c: [255, 230, 160], a: 1, always: 0.25 }],
        emissive: [{ dx: -6, dy: -85, w: 12, h: 12 }],
        beam: { dx: 0, dy: -79 },
      },
      boat: { w: 34, h: 16, ax: 17, ay: 12, layers: [L('b', boat)], bob: true, reflect: true },
      crate: { w: 16, h: 16, ax: 8, ay: 15, shadow: [7, 2, 1], layers: [L('b', crate)], box: [-6, -5, 6, 1] },
      barrel: { w: 12, h: 16, ax: 6, ay: 15, shadow: [5, 2, 1], layers: [L('b', barrel)], box: [-5, -4, 5, 1] },
      lamp: {
        w: 10, h: 30, ax: 5, ay: 29, shadow: [4, 1, 1], layers: [L('b', lamp)], box: [-2, -2, 2, 1],
        lights: [{ dx: 0, dy: -24, r: 44, c: [255, 200, 120], a: 0.95, flicker: 1 }], emissive: [{ dx: -2, dy: -26, w: 4, h: 5 }],
      },
      well: { w: 26, h: 30, ax: 13, ay: 28, shadow: [11, 3, 1], layers: [L('b', well)], box: [-10, -6, 10, 1] },
      campfire: {
        w: 20, h: 16, ax: 10, ay: 13, layers: [L('b', campfireBase)], box: [-7, -5, 7, 1],
        lights: [{ dx: 0, dy: -8, r: 72, c: [255, 150, 60], a: 1, always: 0.22, flicker: 2 }],
        live: (ctx, x, y, t) => campfireFlames(ctx, x, y + 1, t), sparks: [0, -12],
      },
      log: { w: 20, h: 10, ax: 10, ay: 8, shadow: [8, 2, 0], layers: [L('b', log)], box: [-8, -3, 8, 1] },
      netrack: { w: 30, h: 26, ax: 15, ay: 24, shadow: [12, 2, 1], layers: [L('b', netrack)], box: [-12, -3, 12, 1] },
      post: { w: 6, h: 12, ax: 3, ay: 7, layers: [L('b', post)], reflect: true, ripple: true },
      sign: { w: 16, h: 20, ax: 8, ay: 18, shadow: [5, 1, 1], layers: [L('b', sign)], box: [-3, -2, 3, 1] },
      chest: { w: 18, h: 18, ax: 9, ay: 16, shadow: [7, 2, 1], layers: [L('b', chest)], box: [-7, -4, 7, 1] },
      stall: { w: 40, h: 34, ax: 20, ay: 33, shadow: [17, 3, 1], layers: [L('b', stall)], box: [-18, -6, 18, 1], occluder: true },
      fence: { w: 16, h: 14, ax: 8, ay: 12, layers: [L('b', fence)], box: [-8, -2, 8, 1] },
    },
    // dibujo de una instancia en coordenadas de mundo (y ya desplazada por la altura)
    draw(ctx, inst, t, wind) {
      const d = inst.def;
      const x = inst.x, y = inst.sy + (d.bob ? Math.round(Math.sin(t * 1.8 + inst.seed * 6)) : 0);
      if (d.shadow) TH.shadow(ctx, x + (d.shadow[2] || 0), y - 1, d.shadow[0], d.shadow[1], 0.3);
      if (d.ripple) {
        const k = (t * 0.8 + inst.seed) % 1;
        ctx.globalAlpha = 0.6 * (1 - k);
        ell(ctx, x, y + 1, 3 + Math.round(k * 4), 1, '#d9f3f5');
        ctx.globalAlpha = 1;
        ell(ctx, x, y + 1, 3, 1, '#2a6f8f');
      }
      for (let i = 0; i < d.layers.length; i++) {
        const Lr = d.layers[i];
        const img = layerImg(inst.type + '|' + Lr.k + '|' + inst.v, d.w, d.h, (g) => Lr.build(g, inst.v));
        const ox = Lr.sway ? Math.round(Math.sin(t * 1.4 + inst.seed * 9) * wind * Lr.sway) : 0;
        ctx.drawImage(img, Math.round(x - d.ax + ox), Math.round(y - d.ay));
      }
      if (d.live) d.live(ctx, x, y, t, inst);
    },
    // reflejo invertido sobre el agua
    drawReflection(ctx, inst, t) {
      const d = inst.def;
      const y = inst.sy + (d.bob ? Math.round(Math.sin(t * 1.8 + inst.seed * 6)) : 0);
      ctx.save();
      ctx.translate(0, y * 2 + 1);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < d.layers.length; i++) {
        const Lr = d.layers[i];
        const img = layerImg(inst.type + '|' + Lr.k + '|' + inst.v, d.w, d.h, (g) => Lr.build(g, inst.v));
        ctx.drawImage(img, Math.round(inst.x - d.ax), Math.round(y - d.ay));
      }
      ctx.restore();
    },
  });
})();
