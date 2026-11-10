// Retratos de 64×64 con 4 expresiones, generados a partir de los mismos datos del personaje
(function () {
  'use strict';
  const TH = window.TH;
  const EXPR = ['neutral', 'happy', 'sad', 'angry'];
  const cache = new Map();
  let G = null;
  const R = (x, y, w, h, c) => { if (w <= 0 || h <= 0) return; G.fillStyle = c; G.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const E = (x, y, rx, ry, c) => TH.ell(G, x, y, rx, ry, c);
  const cx = 32;
  // mechón afilado: se estrecha hacia la punta
  function spikeP(x0, y0, x1, y1, w, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) {
      const k = i / n, s2 = Math.max(1, Math.round(w * (1 - k * 0.9)));
      R(Math.round(x0 + (x1 - x0) * k - (s2 >> 1)), Math.round(y0 + (y1 - y0) * k - (s2 >> 1)), s2, s2, c);
    }
  }

  function bust(def) {
    const P = def.pal, col = P.top, o = def.outfit, wide = def.m.sw > 14 ? 4 : 0;
    for (let y = 50; y < 64; y++) {
      const w = 14 + Math.round((y - 50) * 0.9) + wide;
      R(cx - w, y, w * 2, 1, col[1]); R(cx - w, y, 2, 1, col[2]); R(cx + w - 2, y, 2, 1, col[0]);
    }
    R(cx - 4, 44, 8, 8, P.skin[0]); R(cx - 3, 44, 6, 6, P.skin[1]);
    if (o === 'coat2') {
      // abrigo de cuello alto con forro turquesa y bordado blanco
      R(cx - 3, 48, 6, 16, P.inner); R(cx + 1, 48, 2, 16, P.innerS || P.inner); R(cx - 1, 46, 2, 4, P.skin[0]);
      for (let i = 0; i < 14; i++) { const d = i >> 1; R(cx - 9 + d, 48 + i, 4, 1, col[2]); R(cx + 5 - d, 48 + i, 4, 1, col[0]); if (i % 2 === 0) { R(cx - 6 + d, 48 + i, 1, 1, P.trim); R(cx + 5 - d, 48 + i, 1, 1, P.trim); } }
      R(cx - 15, 38, 7, 12, col[1]); R(cx + 8, 38, 7, 12, col[0]);
      R(cx - 9, 40, 2, 10, P.lining); R(cx + 7, 40, 2, 10, P.lining);
      R(cx - 15, 38, 7, 1, col[2]); R(cx + 8, 38, 7, 1, P.trim);
      for (let y = 40; y < 50; y += 2) { R(cx - 15, y, 1, 1, P.trim); R(cx + 14, y, 1, 1, P.trim); }
      for (let x = -24; x < 24; x += 3) R(cx + x, 58 + ((x / 3) & 1), 2, 1, P.trim);
      R(cx - 1, 54, 2, 2, '#e8b84a');
    } else if (o === 'coat') {
      R(cx - 10, 45, 6, 9, col[0]); R(cx + 4, 45, 6, 9, col[0]); R(cx - 10, 45, 6, 1, P.trim); R(cx + 4, 45, 6, 1, P.trim);
      R(cx - 3, 50, 6, 14, P.inner); for (let i = 0; i < 5; i++) { R(cx - 14 + i * 2, 58 + (i % 2), 1, 1, P.trim); R(cx + 6 + i * 2, 58 + (i % 2), 1, 1, P.trim); }
      R(cx - 16, 62, 32, 2, P.accent);
    } else if (o === 'armor') {
      E(cx - 18, 55, 7, 4, col[0]); E(cx + 18, 55, 7, 4, col[0]); E(cx - 18, 54, 6, 3, col[1]); E(cx + 18, 54, 6, 3, col[1]);
      R(cx - 24, 52, 12, 1, P.trim); R(cx + 12, 52, 12, 1, P.trim); R(cx - 2, 52, 4, 12, col[2]); R(cx - 9, 51, 18, 1, P.trim);
      R(cx - 22, 49, 10, 3, '#3a7ad0'); R(cx + 12, 49, 10, 3, '#3a7ad0');
    } else if (o === 'apron') {
      R(cx - 9, 52, 3, 12, P.apron[1]); R(cx + 6, 52, 3, 12, P.apron[1]); R(cx - 7, 57, 14, 7, P.apron[1]); R(cx - 7, 57, 14, 1, P.apron[2]);
    } else if (o === 'robe' || o === 'dress') {
      R(cx - 7, 50, 14, 2, P.trim); R(cx - 1, 52, 2, 12, P.trim);
    } else if (P.stripe) {
      for (let y = 52; y < 64; y += 3) R(cx - 22, y, 44, 1, P.stripe);
    }
    if (def.hair === 'hood') { E(cx, 60, 23, 7, P.hood[1]); R(cx - 3, 54, 6, 3, P.trim); }
  }

  function eye(x, y, P, expr) {
    const dark = P.lash || P.outline;
    if (expr === 'happy') { R(x - 2, y, 1, 1, dark); R(x - 1, y - 1, 3, 1, dark); R(x + 2, y, 1, 1, dark); return; }
    R(x - 2, y - 2, 5, 4, '#fbf6ee'); R(x - 1, y - 2, 3, 4, P.eye); R(x, y - 1, 1, 2, '#1a1428'); R(x - 1, y - 2, 1, 1, '#ffffff');
    R(x - 3, y - 3, 7, 1, dark); R(x + 3, y - 2, 1, 1, dark);
    if (expr === 'sad') { R(x - 2, y - 2, 5, 1, P.skin[1]); R(x - 3, y - 2, 7, 1, dark); }
    if (expr === 'angry') { R(x - 2, y - 2, 5, 1, dark); R(x - 2, y + 1, 5, 1, P.skin[1]); }
  }
  // ojo almendrado con pestaña gruesa (personajes detallados)
  function eyeHD(x, y, P, expr, mir) {
    const dark = P.lash || P.outline, s = mir ? 1 : -1;
    if (expr === 'happy') { R(x - 3, y, 1, 1, dark); R(x - 2, y - 1, 5, 1, dark); R(x + 3, y, 1, 1, dark); return; }
    R(x - 3, y - 2, 7, 4, '#fbf6ee');
    R(x - 2, y - 2, 4, 4, P.eye); R(x - 2, y, 4, 2, P.eyeD || P.eye);
    R(x - 1, y - 1, 2, 3, '#1a1428'); R(x - 2, y - 2, 1, 1, '#ffffff'); R(x + 1, y + 1, 1, 1, '#ffffff');
    R(x - 4, y - 3, 8, 1, dark); R(x - 3, y - 4, 6, 1, dark); R(x + 3 * s + (s > 0 ? 1 : -1), y - 3, 2, 2, dark);
    R(x - 3, y + 2, 6, 1, P.skin[0]);
    if (expr === 'sad') { R(x - 3, y - 2, 7, 1, dark); R(x + (s > 0 ? -3 : 2), y - 3, 2, 1, P.skin[1]); }
    if (expr === 'angry') { R(x - 3, y - 2, 7, 1, dark); R(x + (s > 0 ? -3 : 1), y - 1, 3, 1, dark); }
  }
  function brows(y, P, expr) {
    const c = P.hair[0], L = cx - 7, Rr = cx + 6;
    if (expr === 'angry') { R(L - 3, y - 1, 2, 1, c); R(L - 1, y, 2, 1, c); R(L + 1, y + 1, 2, 1, c); R(Rr + 2, y - 1, 2, 1, c); R(Rr, y, 2, 1, c); R(Rr - 2, y + 1, 2, 1, c); return; }
    if (expr === 'sad') { R(L - 3, y + 1, 2, 1, c); R(L - 1, y, 2, 1, c); R(L + 1, y - 1, 2, 1, c); R(Rr + 2, y + 1, 2, 1, c); R(Rr, y, 2, 1, c); R(Rr - 2, y - 1, 2, 1, c); return; }
    const dy = expr === 'happy' ? -1 : 0;
    R(L - 3, y + dy, 6, 1, c); R(Rr - 2, y + dy, 6, 1, c);
  }
  function mouth(P, expr, y) {
    const d = '#7a2a3a';
    if (expr === 'happy') { R(cx - 3, y, 1, 1, d); R(cx - 2, y + 1, 5, 1, d); R(cx + 3, y, 1, 1, d); R(cx - 1, y + 2, 3, 1, '#c8505a'); return; }
    if (expr === 'sad') { R(cx - 2, y, 5, 1, d); R(cx - 3, y + 1, 1, 1, d); R(cx + 3, y + 1, 1, 1, d); return; }
    if (expr === 'angry') { R(cx - 3, y, 7, 2, d); R(cx - 2, y, 5, 1, '#ffffff'); return; }
    R(cx - 1, y, 3, 1, P.skin[0]);
  }

  const FRONT = {
    spiky(P) {
      const H = P.hair;
      E(cx, 22, 17, 11, H[1]);
      for (const k of [-13, -7, -1, 5, 11]) for (let j = 0; j < 8; j++) { const w = (j >> 1) + 1; R(cx + k - (w >> 1) + 1, 6 + j, w, 1, H[1]); }
      for (let i = -16; i <= 13; i += 3) { const len = ((i + 16) / 3) % 2 ? 7 : 10; R(cx + i, 20, 3, len, H[1]); R(cx + i, 20 + len - 2, 3, 2, H[0]); }
      R(cx - 17, 22, 4, 18, H[1]); R(cx + 13, 22, 4, 18, H[1]);
      R(cx - 17, 30, 2, 12, P.streak); R(cx + 15, 30, 2, 12, P.streak);
      R(cx - 10, 14, 10, 1, H[2]); R(cx + 4, 16, 6, 1, H[2]);
    },
    long(P) {
      const H = P.hair;
      E(cx, 20, 16, 10, H[1]); R(cx - 15, 20, 30, 6, H[1]); R(cx, 15, 1, 9, H[0]);
      for (let i = -15; i < 15; i += 4) R(cx + i, 26, 2, 2, H[1]);
      R(cx - 18, 22, 5, 34, H[1]); R(cx + 13, 22, 5, 34, H[1]);
      R(cx - 18, 52, 5, 4, P.streak); R(cx + 13, 52, 5, 4, P.streak);
      R(cx - 10, 13, 8, 1, H[2]); R(cx + 9, 20, 4, 4, '#e8b84a'); R(cx + 10, 21, 2, 2, '#7fffe0');
    },
    beard(P) {
      const H = P.hair;
      E(cx, 19, 16, 8, H[1]); for (const k of [-10, -4, 2, 8]) R(cx + k, 9, 3, 4, H[1]);
      R(cx - 16, 20, 32, 5, P.accent); R(cx - 16, 20, 32, 1, '#ff8a7a'); R(cx + 14, 22, 5, 4, P.accent);
      E(cx, 47, 15, 9, H[1]); R(cx - 17, 30, 5, 16, H[1]); R(cx + 12, 30, 5, 16, H[1]);
      E(cx, 51, 10, 4, H[0]); R(cx - 7, 41, 15, 3, H[0]); R(cx - 12, 45, 3, 1, H[2]); R(cx + 7, 47, 3, 1, H[2]);
    },
    swept(P) {
      const H = P.hair;
      E(cx, 21, 16, 10, H[1]);
      for (let i = 0; i < 32; i++) R(cx - 16 + i, 16 + (i >> 2), 1, 4 + (i >> 3), H[1]);
      R(cx - 17, 22, 4, 14, H[1]); R(cx + 13, 22, 4, 12, H[1]);
      R(cx - 12, 15, 12, 1, H[2]); R(cx + 2, 20, 8, 1, H[2]);
    },
    hood(P) {
      const Hd = P.hood;
      E(cx, 16, 22, 10, Hd[1]); R(cx - 23, 18, 8, 40, Hd[1]); R(cx + 15, 18, 8, 40, Hd[1]);
      R(cx - 12, 9, 14, 1, Hd[2]);
      R(cx - 15, 22, 3, 14, '#e8e8f0'); R(cx + 12, 22, 3, 14, '#e8e8f0');
      R(cx - 11, 36, 2, 1, P.skin[0]); R(cx + 9, 36, 2, 1, P.skin[0]);
    },
    pigtails(P) {
      const H = P.hair;
      E(cx, 21, 16, 10, H[1]); R(cx - 15, 20, 30, 6, H[1]); R(cx - 6, 15, 8, 1, H[2]);
      E(cx - 20, 38, 6, 9, H[1]); E(cx + 20, 38, 6, 9, H[1]);
      R(cx - 22, 28, 5, 3, P.accent); R(cx + 17, 28, 5, 3, P.accent);
    },
    bun(P) {
      const H = P.hair;
      E(cx, 21, 16, 10, H[1]); R(cx - 15, 20, 30, 5, H[1]); E(cx, 9, 7, 6, H[1]); R(cx - 3, 5, 5, 1, H[2]);
      R(cx - 17, 22, 4, 14, H[1]); R(cx + 13, 22, 4, 14, H[1]);
    },
    cap(P) {
      R(cx - 17, 26, 4, 10, P.hair[1]); R(cx + 13, 26, 4, 10, P.hair[1]);
      E(cx, 18, 17, 9, P.hat[1]); R(cx - 18, 22, 36, 3, P.hat[0]); R(cx - 10, 12, 14, 1, P.hat[2]);
      if (P.beard) E(cx, 48, 13, 7, P.beard);
    },
    bald(P) {
      R(cx - 17, 26, 5, 12, P.hair[1]); R(cx + 12, 26, 5, 12, P.hair[1]); R(cx - 6, 16, 6, 2, '#fff1e0');
      E(cx, 48, 13, 8, P.hair[1]);
    },
    straw(P) {
      R(cx - 17, 26, 4, 10, P.hair[1]); R(cx + 13, 26, 4, 10, P.hair[1]);
      E(cx, 20, 26, 4, '#c9a050'); E(cx, 19, 25, 3, '#e8c870'); E(cx, 13, 14, 7, '#d8b060'); R(cx - 13, 17, 26, 2, '#b0503c');
    },
    short(P) {
      const H = P.hair;
      E(cx, 20, 16, 9, H[1]); R(cx - 15, 20, 30, 5, H[1]); R(cx - 17, 22, 3, 10, H[1]); R(cx + 14, 22, 3, 10, H[1]);
      R(cx - 8, 13, 10, 1, H[2]);
      if (P.band) { R(cx - 16, 20, 32, 4, P.band); R(cx + 14, 22, 4, 4, P.band); }
    },
  };
  // Oslo: gorro de lana de marinero, barba blanca enorme, bigote y un aro de oro
  FRONT.boatman = function (P) {
    const H = P.hair, K = ['#141c34', '#24345c', '#34487a', '#5a6ea0'];
    R(cx - 17, 25, 4, 9, H[1]); R(cx + 13, 25, 4, 9, H[1]); R(cx - 17, 25, 1, 9, H[2]);
    E(cx, 16, 17, 11, K[1]); R(cx - 17, 15, 34, 8, K[1]); R(cx - 9, 7, 12, 2, K[2]); R(cx - 6, 6, 6, 1, K[3]);
    for (let x = -16; x < 16; x += 4) R(cx + x, 10, 1, 12, K[0]);
    R(cx - 18, 20, 36, 7, K[2]); R(cx - 18, 20, 36, 1, K[3]); R(cx - 18, 26, 36, 1, K[0]);
    for (let x = -17; x < 18; x += 3) R(cx + x, 21, 1, 5, K[1]);
    R(cx + 8, 22, 4, 3, '#c89a3a'); R(cx + 9, 22, 2, 1, '#f0d080');
    R(cx - 13, 33, 2, 1, P.skin[0]); R(cx - 14, 35, 2, 1, P.skin[0]); R(cx + 12, 33, 2, 1, P.skin[0]); R(cx + 13, 35, 2, 1, P.skin[0]);
    E(cx + 1, 38, 3, 2, P.skin[0]); R(cx, 37, 2, 1, '#c89070');
    R(cx - 17, 32, 5, 16, H[1]); R(cx + 12, 32, 5, 16, H[1]);
    E(cx, 49, 17, 12, H[1]); E(cx, 54, 12, 6, H[0]); E(cx - 1, 47, 13, 7, H[1]);
    for (const [x, y] of [[-11, 46], [-6, 51], [4, 50], [9, 46], [-2, 56], [12, 52]]) R(cx + x, y, 3, 1, H[2]);
    for (const [x, y] of [[-8, 54], [2, 57], [7, 53]]) R(cx + x, y, 2, 1, H[0]);
    E(cx - 5, 41, 6, 2.5, H[2]); E(cx + 6, 41, 6, 2.5, H[2]); R(cx - 10, 42, 21, 1, H[0]); R(cx, 40, 2, 2, H[1]);
    R(cx + 16, 36, 2, 3, '#e8c050'); R(cx + 16, 36, 1, 1, '#fff0b0');
  };
  FRONT.spiky2 = function (P) {
    const H = P.hair, H3 = H[3] || H[2];
    E(cx, 18, 17, 8, H[1]);
    // pinchos hacia arriba y a los lados, con brillo en el lomo
    const tops = [[-14, 17, -27, 9], [-9, 12, -15, -1], [-2, 10, -1, -3], [5, 11, 11, -1], [12, 15, 25, 6], [15, 21, 28, 21], [-15, 22, -28, 23]];
    for (const [x0, y0, x1, y1] of tops) spikeP(cx + x0, y0, cx + x1, y1, 9, H[1]);
    for (const [x0, y0, x1, y1] of tops) spikeP(cx + x0 + Math.sign(x1 - x0), y0 + 1, cx + Math.round((x0 + x1 * 2) / 3), Math.round((y0 + y1 * 2) / 3) + 1, 2, H[2]);
    // flequillo en mechones con huecos que dejan ver la frente
    const bangs = [[-14, 18, -17, 39], [-9, 19, -12, 32], [-4, 19, -6, 30], [1, 19, 1, 29], [6, 19, 8, 30], [11, 19, 14, 33], [15, 20, 18, 39]];
    for (const [x0, y0, x1, y1] of bangs) spikeP(cx + x0, y0, cx + x1, y1, 6, H[1]);
    for (const [x0, y0, x1, y1] of [[-9, 20, -11, 27], [1, 20, 1, 25], [11, 20, 13, 28]]) spikeP(cx + x0, y0, cx + x1, y1, 1, H3);
    for (const [x0, y0, x1, y1] of [[-6, 21, -8, 28], [4, 21, 5, 27], [-12, 22, -14, 31]]) spikeP(cx + x0, y0, cx + x1, y1, 1, H[0]);
    R(cx - 9, 12, 10, 1, H[2]); R(cx - 11, 13, 3, 1, H3); R(cx + 4, 13, 5, 1, H[2]);
    // mechones turquesa
    spikeP(cx - 17, 28, cx - 19, 50, 1, P.streak); spikeP(cx - 15, 31, cx - 16, 45, 1, P.streak); spikeP(cx + 17, 30, cx + 18, 44, 1, P.streak);
  };
  const BACK = {
    spiky2(P) {
      const H = P.hair;
      E(cx, 27, 19, 16, H[0]);
      for (const [x0, y0, x1, y1] of [[-17, 32, -25, 44], [17, 32, 25, 42], [-12, 40, -15, 52], [12, 40, 15, 51]]) spikeP(cx + x0, y0, cx + x1, y1, 7, H[0]);
    },
    long(P) { const H = P.hair; E(cx, 32, 20, 22, H[1]); R(cx - 20, 32, 40, 28, H[1]); R(cx - 20, 56, 40, 4, P.streak); },
    hood(P) { E(cx, 32, 24, 26, P.hood[0]); },
    spiky(P) { const H = P.hair; for (const k of [-19, 15]) R(cx + k, 26, 4, 16, H[0]); },
  };

  function build(def, expr) {
    const o = TH.makeCanvas(64, 64);
    G = o.g;
    const P = def.pal, HK = (def.portrait && def.portrait.hair) || def.hair;
    if (BACK[HK]) BACK[HK](P);
    bust(def);
    if (def.hd) {
      // rostro con mandíbula marcada y mentón
      E(cx, 29, 15, 13, P.skin[0]); E(cx - 1, 28, 14, 12, P.skin[1]);
      for (let y = 36; y < 48; y++) {
        const k = (y - 36) / 11, w = Math.round(15 - Math.pow(k, 1.5) * 11);
        R(cx - w, y, w * 2, 1, P.skin[0]); R(cx - w + 1, y, Math.max(1, w * 2 - 4), 1, P.skin[1]);
      }
      E(cx - 15, 33, 2, 3, P.skin[0]); E(cx + 15, 33, 2, 3, P.skin[0]);
      R(cx + 1, 37, 1, 3, P.skin[0]); R(cx, 40, 2, 1, P.skin[0]);
      R(cx + 8, 38, 4, 1, P.skin[0]); R(cx - 12, 39, 2, 1, P.skin[0]);
    } else {
      E(cx, 31, 15, 17, P.skin[0]); E(cx - 1, 30, 14, 16, P.skin[1]);
      E(cx - 15, 33, 2, 3, P.skin[0]); E(cx + 15, 33, 2, 3, P.skin[0]);
      R(cx, 38, 1, 2, P.skin[0]);
    }
    if (def.hd) { eyeHD(cx - 7, 34, P, expr, false); eyeHD(cx + 7, 34, P, expr, true); }
    else { eye(cx - 7, 34, P, expr); eye(cx + 6, 34, P, expr); }
    brows(29, P, expr);
    if (expr === 'happy' || (def.portrait && def.portrait.blush)) { R(cx - 12, 38, 3, 1, '#f08a8a'); R(cx + 9, 38, 3, 1, '#f08a8a'); }
    mouth(P, expr, 43);
    (FRONT[HK] || FRONT.short)(P);
    if (HK === 'beard' || HK === 'bald' || (HK === 'cap' && P.beard)) mouth(P, expr, 44);
    if (HK === 'boatman') mouth(P, expr, 45);
    if (expr === 'sad') { R(cx + 9, 37, 1, 3, '#9fe0ff'); R(cx + 9, 40, 1, 1, '#d8f6ff'); }
    if (expr === 'angry') { R(cx + 11, 22, 3, 1, '#c8382c'); R(cx + 12, 21, 1, 3, '#c8382c'); }
    TH.outline(o.c, P.outline);
    G = null;
    return o.c;
  }

  TH.portraits = {
    EXPR,
    get(id, expr) {
      const key = id + '|' + expr;
      let c = cache.get(key);
      if (!c) { c = build(TH.chars.defs[id], expr); cache.set(key, c); }
      return c;
    },
  };
})();
