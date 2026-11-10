// Datos de personajes: medidas, paleta, piezas y cadenas de viento.
// m: leg/torso/headW/headH/sw (ancho de hombros)/legW/armW · chains.dirs: [dx, dy desde los pies, 'back'|'front']
(function () {
  'use strict';
  const TH = window.TH;
  const D = TH.chars.defs;
  const add = (id, o) => { o.id = id; D[id] = o; };

  // ---------- grupo ----------
  add('kaelen', {
    name: 'Kaelen', hair: 'spiky2', outfit: 'coat2', extras: ['spear2'], hd: true,
    m: { leg: 15, torso: 13, headW: 15, headH: 13, sw: 13, legW: 4, armW: 3, coat: 8 },
    pal: {
      skin: ['#8a5434', '#b97a50'], hair: ['#111736', '#22306a', '#3f62b0', '#78a4f2'], streak: '#5fd6c4', eye: '#f6b83a', eyeD: '#b0661a',
      brow: '#111736', mouth: '#5a2a22',
      top: ['#1a3470', '#2a58a8', '#4f86d6'], trim: '#e4ecff', lining: '#2f9a92', inner: '#e2e8f2', innerS: '#a9b4c8',
      accent: '#86e6c8', accent2: '#3fa88e', accentL: '#c8fff0', bracer: ['#3e3434', '#665650', '#8c7a70'],
      legs: ['#97a2b8', '#cfd7e4'], boots: ['#2a2630', '#45404c', '#68606e'], wrap: '#8a8070', outline: '#14132e',
    },
    chains: [
      // colas del fajín y mechón turquesa
      { dirs: { down: [-6, -17, 'front'], up: [-2, -18, 'front'], side: [-5, -18, 'back'] }, n: 6, seg: 2, w: 2, c: ['#86e6c8', '#3fa88e'] },
      { dirs: { down: [4, -17, 'front'], up: [2, -18, 'front'], side: [-4, -17, 'back'] }, n: 5, seg: 2, w: 2, c: ['#86e6c8', '#3fa88e'] },
      { dirs: { side: [-7, -35, 'back'], up: [-7, -34, 'front'], down: [-8, -34, 'back'] }, n: 5, seg: 2, w: 1, c: ['#5fd6c4', '#3fa8a0'], g: 0.6 },
    ],
    portrait: { blush: false },
  });
  add('elara', {
    name: 'Elara', hair: 'long', outfit: 'robe', extras: [], hd: true,
    m: { leg: 13, torso: 12, headW: 12, headH: 12, sw: 10, legW: 3, armW: 2 },
    pal: {
      skin: ['#d9a88a', '#f3cdb0'], hair: ['#a9a6c8', '#e4e2f2', '#ffffff'], streak: '#5fd6e8', eye: '#9a6ad6',
      top: ['#aeb9d0', '#eef2f8', '#ffffff'], sleeve: ['#aeb9d0', '#e2e8f2', '#ffffff'], trim: '#e8b84a', accent: '#3fb8b0',
      legs: ['#5a6a8a', '#7a8aaa'], boots: ['#4a3a5a', '#6a5a7a', '#8a7a9a'], wrap: '#c8b8e0', outline: '#2a2448', lash: '#4a3a6a',
      eyeD: '#5a3a8a', brow: '#a9a6c8', mouth: '#b85a6a',
    },
    chains: [
      { dirs: { down: [-8, -17, 'back'], up: [-4, -16, 'front'], side: [-7, -18, 'back'] }, n: 5, seg: 2, w: 2, c: ['#e4e2f2', '#5fd6e8'], g: 0.8 },
      { dirs: { down: [8, -17, 'back'], up: [4, -16, 'front'], side: [-5, -16, 'back'] }, n: 5, seg: 2, w: 2, c: ['#e4e2f2', '#5fd6e8'], g: 0.8 },
      { dirs: { down: [3, -18, 'front'], up: [0, -18, 'front'], side: [-3, -18, 'back'] }, n: 5, seg: 2, w: 1, c: ['#3fb8b0', '#2a8a86'] },
    ],
    portrait: { blush: true },
  });
  add('flint', {
    name: 'Flint', hair: 'beard', outfit: 'apron', extras: ['hammer'], big: true, hd: true,
    m: { leg: 12, torso: 13, headW: 13, headH: 12, sw: 16, legW: 4, armW: 4, cuff: 4 },
    pal: {
      skin: ['#b0705a', '#e0a080'], hair: ['#6a2a14', '#a8481e', '#d8743a'], accent: '#c8382c', eye: '#5a8a4a',
      top: ['#b8a888', '#e0d4b8', '#f4ecd8'], apron: ['#4a2e1e', '#7a4a2e', '#9a6a40'], belt: '#3a2416',
      legs: ['#3a3a4a', '#555566'], boots: ['#2a1d16', '#4a3428', '#6a4c3a'], wrap: '#8a6a50', outline: '#2a1610',
      eyeD: '#2a5a2a', brow: '#6a2a14', bracer: ['#4a3428', '#6a4c3a', '#9a7a5a'],
    },
    chains: [
      { dirs: { down: [5, -32, 'back'], up: [1, -32, 'front'], side: [-6, -32, 'back'] }, n: 4, seg: 2, w: 2, c: ['#c8382c', '#8a2018'] },
      { dirs: { down: [6, -31, 'back'], up: [-1, -32, 'front'], side: [-6, -31, 'back'] }, n: 4, seg: 2, w: 1, c: ['#c8382c', '#8a2018'] },
    ],
  });
  add('firion', {
    name: 'Firion', hair: 'swept', outfit: 'armor', extras: ['sword'], hd: true,
    m: { leg: 14, torso: 12, headW: 12, headH: 12, sw: 13, legW: 3, armW: 3 },
    pal: {
      skin: ['#c8906a', '#efc29c'], hair: ['#9a8a66', '#d8c89a', '#f4ecc8'], eye: '#4a8ad8',
      top: ['#8a92a8', '#d4d9e4', '#ffffff'], trim: '#e8b84a', belt: '#5a3826',
      legs: ['#3a4a6a', '#5a6a8a'], boots: ['#5a6272', '#8a92a8', '#c4cad8'], wrap: '#e8b84a', outline: '#1a2238',
      eyeD: '#1a4a8a', brow: '#9a8a66', bracer: ['#5a6272', '#a8b0c4', '#e4e8f0'],
    },
    chains: [
      { dirs: { down: [-6, -25, 'back'], up: [-5, -25, 'front'], side: [-3, -25, 'back'] }, n: 7, seg: 2, w: 3, c: ['#3a7ad0', '#6aaaf0'], wind: 0.8 },
      { dirs: { down: [0, -25, 'back'], up: [0, -25, 'front'], side: [-4, -24, 'back'] }, n: 8, seg: 2, w: 3, c: ['#3a7ad0', '#6aaaf0'], wind: 0.8 },
      { dirs: { down: [6, -25, 'back'], up: [5, -25, 'front'], side: [-5, -23, 'back'] }, n: 7, seg: 2, w: 3, c: ['#3a7ad0', '#6aaaf0'], wind: 0.8 },
    ],
  });

  // ---------- NPCs del prólogo ----------
  add('ilun', {
    name: 'Ilun', hair: 'hood', outfit: 'robe', extras: ['staff'],
    m: { leg: 10, torso: 11, headW: 12, headH: 11, sw: 11, legW: 3, armW: 2 },
    pal: {
      skin: ['#b08868', '#d8b090'], hood: ['#2b2046', '#3b2d5e', '#55438a'], hair: ['#b8b8c8', '#e8e8f0', '#ffffff'], eye: '#5a4a7a',
      top: ['#3a2d64', '#4a3a78', '#6250a0'], trim: '#c9a4ff', accent: '#c9a4ff',
      legs: ['#2a2036', '#3a2d46'], boots: ['#2a2036', '#3a2d46', '#4a3d56'], outline: '#140f24',
    },
    light: { dx: 8, dy: -34, r: 34, c: [255, 210, 120] },
  });
  add('mira', {
    name: 'Mira', hair: 'pigtails', outfit: 'dress', extras: [],
    m: { leg: 6, torso: 7, headW: 11, headH: 11, sw: 9, legW: 2, armW: 2 },
    pal: {
      skin: ['#c8906a', '#f0c4a0'], hair: ['#5a3420', '#8a5432', '#b07a50'], accent: '#e84a5f', eye: '#4a9a5a',
      top: ['#d8a020', '#f2c84a', '#ffe08a'], trim: '#ffffff',
      legs: ['#e0b090', '#f0c4a0'], boots: ['#6a3a2a', '#8a4a32', '#a8603f'], outline: '#3a1a10',
    },
    chains: [
      { dirs: { down: [-8, -19, 'back'], up: [-7, -19, 'front'], side: [-7, -19, 'back'] }, n: 3, seg: 2, w: 1, c: ['#e84a5f', '#b02a40'] },
      { dirs: { down: [8, -19, 'back'], up: [7, -19, 'front'] }, n: 3, seg: 2, w: 1, c: ['#e84a5f', '#b02a40'] },
    ],
    portrait: { blush: true },
  });
  const VM = { leg: 11, torso: 11, headW: 12, headH: 11, sw: 12, legW: 3, armW: 3 };
  add('fisher', {
    name: 'Pescador', hair: 'cap', outfit: 'tunic', m: VM,
    pal: {
      skin: ['#a8704e', '#d09a72'], hair: ['#6a6a72', '#9a9aa4', '#c8c8d0'], hat: ['#1d2a4a', '#2f4070', '#4f6aa0'], beard: '#a8a8b2', eye: '#3a5a7a',
      top: ['#b08a20', '#e0b830', '#f4d860'], belt: '#5a3826', legs: ['#2a3450', '#3f4c70'], boots: ['#1d1a24', '#2f2a36', '#4a4452'], outline: '#1d1a2a',
    },
  });
  add('woman', {
    name: 'Vecina', hair: 'bun', outfit: 'robe', m: { ...VM, leg: 11, torso: 10, sw: 10 },
    pal: {
      skin: ['#c08a68', '#e8b890'], hair: ['#4a2a1a', '#7a4a2a', '#a06a40'], eye: '#5a7a3a',
      top: ['#3a6a3a', '#5a9a4a', '#8ac86a'], trim: '#f4ecd8', accent: '#f4ecd8',
      legs: ['#3a3a4a', '#555566'], boots: ['#3a2a20', '#5a4030', '#7a5a40'], outline: '#1a2a1a',
    },
    chains: [{ dirs: { down: [4, -16, 'front'], side: [-4, -16, 'back'], up: [0, -16, 'front'] }, n: 4, seg: 2, w: 1, c: ['#f4ecd8', '#d8ccb0'] }],
  });
  add('oldman', {
    name: 'Anciano', hair: 'bald', outfit: 'tunic', m: { ...VM, torso: 10 },
    pal: {
      skin: ['#b07a5a', '#d8a888'], hair: ['#c8c8d0', '#ececf2', '#ffffff'], eye: '#4a4a5a',
      top: ['#5a3a24', '#7a5034', '#9a6a48'], belt: '#3a2416', legs: ['#4a4a52', '#66666e'], boots: ['#2a2018', '#4a3828', '#6a5038'], outline: '#20160f',
    },
  });
  add('farmer', {
    name: 'Granjero', hair: 'straw', outfit: 'tunic', m: VM,
    pal: {
      skin: ['#b07050', '#e0a078'], hair: ['#5a3a1a', '#7a5228', '#9a6a3a'], eye: '#4a6a2a',
      top: ['#8a2a20', '#c04030', '#e06050'], apron: ['#6a5a3a', '#8a7a52', '#a89a70'], belt: '#3a2416',
      legs: ['#5a4428', '#7a5c38'], boots: ['#2a1d16', '#4a3428', '#6a4c3a'], outline: '#24120c',
    },
  });
  add('sailor', {
    name: 'Marinera', hair: 'short', outfit: 'tunic', m: VM,
    pal: {
      skin: ['#8a5434', '#b47850'], hair: ['#1a1418', '#2e2428', '#4a3c40'], band: '#c8382c', eye: '#3a2a1a',
      top: ['#c8ccd8', '#f0f2f6', '#ffffff'], stripe: '#2f4070', belt: '#2a2030',
      legs: ['#2a3450', '#3f4c70'], boots: ['#1d1a24', '#2f2a36', '#4a4452'], outline: '#14121e',
    },
    chains: [{ dirs: { down: [5, -32, 'back'], side: [-6, -31, 'back'], up: [0, -31, 'front'] }, n: 3, seg: 2, w: 1, c: ['#c8382c', '#8a2018'] }],
  });
  add('kid', {
    name: 'Niño', hair: 'short', outfit: 'tunic', m: { leg: 6, torso: 7, headW: 11, headH: 11, sw: 9, legW: 2, armW: 2 },
    pal: {
      skin: ['#c08a68', '#ecbc94'], hair: ['#a87a30', '#d8a848', '#f4d070'], eye: '#3a6aaa',
      top: ['#2f5aa0', '#4a7ac8', '#7aa0e0'], belt: '#5a3826', legs: ['#5a4428', '#7a5c38'], boots: ['#3a2a20', '#5a4030', '#7a5a40'], outline: '#1a1830',
    },
  });

  // aldeanos genéricos: misma base con la paleta desplazada en tono y brillo
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function shift(h, deg, lum) {
    let [r, g, b] = hex(h).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let hh = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    }
    hh = (hh * 60 + deg + 360) % 360;
    const L = Math.min(0.92, Math.max(0.06, l * lum));
    const C = (1 - Math.abs(2 * L - 1)) * s, X = C * (1 - Math.abs(((hh / 60) % 2) - 1)), m = L - C / 2;
    const k = (hh / 60) | 0;
    [r, g, b] = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][k];
    return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  }
  const SH = (v, deg, lum) => (Array.isArray(v) ? v.map((c) => shift(c, deg, lum)) : shift(v, deg, lum));
  const SHIFT_KEYS = { top: 1, trim: 1, apron: 1, band: 1, stripe: 1, hat: 1, legs: 2, hair: 3, beard: 3 };
  TH.chars.variant = function (baseId, k) {
    const id = baseId + '#' + k;
    if (D[id]) return id;
    const b = D[baseId], pal = {};
    const r = TH.util.rnd(k, baseId.length, 71), r2 = TH.util.rnd(k, 3, 72);
    for (const key in b.pal) {
      const grp = SHIFT_KEYS[key];
      pal[key] = !grp ? b.pal[key] : grp === 1 ? SH(b.pal[key], 60 + r * 240, 0.9 + r2 * 0.25) : grp === 2 ? SH(b.pal[key], r2 * 180, 0.85 + r * 0.3) : SH(b.pal[key], 0, 0.7 + r * 0.6);
    }
    D[id] = { ...b, id, pal, portrait: b.portrait };
    return id;
  };

  // orden inicial del grupo
  TH.chars.PARTY = ['kaelen', 'elara', 'flint', 'firion'];
  // Halvard, el viejo farero de Bruma Salada (el narrador)
  add('halvard', {
    name: 'Halvard', hair: 'cap', outfit: 'tunic', m: { ...VM, torso: 11 },
    pal: {
      skin: ['#a06a4a', '#cc9670'], hair: ['#b8b8c0', '#e0e0e8', '#ffffff'], hat: ['#1d1a2a', '#2f2a46', '#4f4a70'], beard: '#ececf2', eye: '#4a6a8a',
      top: ['#1d2a4a', '#2f4070', '#5a78b0'], belt: '#c89a3a', legs: ['#2a2836', '#3a3848'], boots: ['#1d1a24', '#2f2a36', '#4a4452'], outline: '#121020',
    },
  });
  // cara detallada (mandíbula, ojos con brillo, cejas y boca) también para la gente del pueblo
  for (const id of ['ilun', 'mira', 'fisher', 'woman', 'oldman', 'farmer', 'sailor', 'kid', 'halvard']) if (D[id]) D[id].hd = true;
})();
