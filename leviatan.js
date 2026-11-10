// Leviatán Primordial (postgame): serpiente marina colosal enroscada, de escamas azul abisal con vientre claro,
// aletas dorsales membranosas, cabeza de dragón con fauces abiertas, corona de perlas, aletas-oreja y relámpagos
// que le recorren el cuerpo. También sus Aletas (partes) y la Cría de Leviatán. Miran a la izquierda.
(function () {
  'use strict';
  const TH = window.TH;
  // spline de Catmull-Rom por puntos de control → puntos densos
  const spline = (pts, n) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  };
  const poly = (g, pts, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
  const line = (g, pts, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  const SC = { back: '#08142e', mid: '#163a78', lit: '#2a62b4', hi: '#5aa8ec', belly: '#8ad4cc', belly2: '#c8f0e2', fin: '#1a4c96', finEdge: '#7ad0ff', spine: '#06102a' };

  // cuerpo de serpiente a lo largo de una curva: escamas, vientre, aletas dorsales y relámpagos
  function serpent(R, E, g, path, rAt, fins, f, bolts) {
    const N = path.length;
    const dir = (i) => { const a = path[Math.max(0, i - 1)], b = path[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
    // aletas dorsales (detrás del cuerpo)
    if (fins) for (let i = Math.floor(N * 0.12); i < N * 0.96; i += Math.max(3, Math.floor(N / 16))) {
      const k = i / (N - 1), [dx, dy] = dir(i), out = [-dy, dx], r = rAt(k), p = path[i];
      const b0 = [p[0] + out[0] * r * 0.6 - dx * r * 0.6, p[1] + out[1] * r * 0.6 - dy * r * 0.6];
      const b1 = [p[0] + out[0] * r * 0.6 + dx * r * 0.9, p[1] + out[1] * r * 0.6 + dy * r * 0.9];
      const L = 7 + r * 1.1, tip = [p[0] + out[0] * (r + L) - dx * L * 0.7, p[1] + out[1] * (r + L) - dy * L * 0.7];
      poly(g, [b0, tip, b1], SC.fin); line(g, [[p[0], p[1]], tip], SC.spine, 1.2);
      R(tip[0] - 0.5, tip[1] - 0.5, 1, 1, SC.finEdge);
    }
    // cuerpo
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1), r = rAt(k), p = path[i], [dx, dy] = dir(i), inn = [dy, -dx];
      E(p[0], p[1], r + 0.8, r + 0.8, SC.back);
    }
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1), r = rAt(k), p = path[i], [dx, dy] = dir(i), inn = [dy, -dx];
      E(p[0], p[1], r, r, SC.mid);
      E(p[0] - inn[0] * r * 0.25 - 0.6, p[1] - inn[1] * r * 0.25 - 0.8, r * 0.6, r * 0.6, SC.lit);
      E(p[0] + inn[0] * r * 0.55, p[1] + inn[1] * r * 0.55, r * 0.45, r * 0.45, SC.belly);
    }
    // escamas y placas del vientre
    for (let i = 2; i < N; i += 3) {
      const k = i / (N - 1), r = rAt(k), p = path[i], [dx, dy] = dir(i), inn = [dy, -dx];
      R(p[0] - inn[0] * r * 0.35, p[1] - inn[1] * r * 0.35, 2, 1, SC.hi);
      R(p[0] - inn[0] * r * 0.7, p[1] - inn[1] * r * 0.7, 1, 1, SC.back);
      R(p[0] + inn[0] * r * 0.7, p[1] + inn[1] * r * 0.7, 1, 1, SC.belly2);
      if (i % 6 === 2) line(g, [[p[0] + inn[0] * r * 0.3 - dx * 2, p[1] + inn[1] * r * 0.3 - dy * 2], [p[0] + inn[0] * r * 0.85 - dx * 2, p[1] + inn[1] * r * 0.85 - dy * 2]], '#5a9a98', 1);
    }
    // relámpagos que recorren las escamas
    for (let b = 0; b < bolts; b++) {
      const s = f * 7.1 + b * 13.3, i0 = Math.floor(rnd(s) * (N - 12)), len = 6 + Math.floor(rnd(s + 1) * 10), pts = [];
      for (let i = i0; i < Math.min(N, i0 + len); i += 2) {
        const k = i / (N - 1), r = rAt(k), p = path[i], [dx, dy] = dir(i), inn = [dy, -dx], j = (rnd(s + i) - 0.5) * r * 1.4;
        pts.push([p[0] + inn[0] * j, p[1] + inn[1] * j]);
      }
      if (pts.length > 1) { line(g, pts, '#ffd23a', 1.6); line(g, pts, '#fffbe0', 0.6); }
    }
  }

  function leviatan(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, sw = anim === 'idle' ? Math.sin(t) * 3 : 0;
    const lunge = anim === 'attack' ? [6, -16, -5][f] : anim === 'hurt' ? 8 : 0, rise = anim === 'cast' ? -8 : anim === 'attack' && f === 0 ? -6 : 0;
    const open = anim === 'attack' ? [6, 16, 9][f] : anim === 'cast' ? 13 : 7 + (f % 2) * 2;
    const X = (x) => ox - 90 + x, Y = (y) => oy - 166 + y;
    // agua bajo la espiral
    E(X(100), Y(160), 74, 8, '#04101e'); E(X(100), Y(158), 66, 5, '#0a2440');
    // cuerpo enroscado (cola → cuello)
    const ctrl = [[18, 148], [52, 158], [100, 158], [142, 148], [166, 124], [160, 98], [136, 90], [118, 106], [126, 128], [150, 124], [156, 98], [142, 72], [118 + sw * 0.4, 56], [100 + sw + lunge * 0.4, 44 + rise * 0.5], [92 + sw + lunge * 0.7, 34 + rise]].map(([x, y]) => [X(x), Y(y)]);
    const path = spline(ctrl, 9);
    const rAt = (k) => (k < 0.1 ? 2 + k * 100 : k < 0.8 ? 12 + Math.sin(k * 5) * 2 : 14 - (k - 0.8) * 12);
    // aleta caudal en la punta de la cola
    const tp = path[0];
    poly(g, [[tp[0] + 2, tp[1]], [tp[0] - 14, tp[1] - 14], [tp[0] - 8, tp[1]], [tp[0] - 16, tp[1] + 8]], SC.fin);
    line(g, [[tp[0], tp[1]], [tp[0] - 14, tp[1] - 14]], SC.spine, 1); line(g, [[tp[0], tp[1]], [tp[0] - 16, tp[1] + 8]], SC.spine, 1);
    serpent(R, E, g, path, rAt, true, f, anim === 'cast' ? 6 : 3);
    // cabeza de dragón marino
    const hp = path[path.length - 1], hx = hp[0] - 6, hy = hp[1] - 6;
    g.save(); g.translate(hx, hy); g.scale(1.45, 1.45); g.translate(-hx, -hy);
    // aletas-oreja (detrás)
    for (const [a, b, c] of [[[10, -6], [34, -20], [30, 0]], [[10, 2], [36, 6], [24, 14]]]) {
      poly(g, [[hx + a[0], hy + a[1]], [hx + b[0], hy + b[1]], [hx + c[0], hy + c[1]]], SC.fin);
      for (let s = 0; s < 3; s++) { const q = s / 2; line(g, [[hx + a[0], hy + a[1]], [hx + b[0] + (c[0] - b[0]) * q, hy + b[1] + (c[1] - b[1]) * q]], SC.spine, 1); }
      R(hx + b[0] - 1, hy + b[1], 2, 1, SC.finEdge);
    }
    // cuernos hacia atrás
    line(g, [[hx + 2, hy - 8], [hx + 20, hy - 22], [hx + 32, hy - 24]], '#c8d8e8', 2.4); line(g, [[hx + 2, hy - 8], [hx + 20, hy - 22], [hx + 32, hy - 24]], '#ffffff', 0.8);
    // cráneo
    E(hx + 2, hy, 13, 10, SC.back); E(hx + 1, hy - 1, 12, 9, SC.mid); E(hx - 2, hy - 4, 7, 4, SC.lit);
    // mandíbula superior y hocico
    poly(g, [[hx + 6, hy - 8], [hx - 22, hy - 6], [hx - 32, hy - 1], [hx - 28, hy + 2], [hx + 8, hy + 2]], SC.mid);
    poly(g, [[hx + 2, hy - 7], [hx - 22, hy - 5], [hx - 28, hy - 2], [hx - 4, hy - 3]], SC.lit);
    R(hx - 30, hy - 2, 2, 1, '#000000'); R(hx - 22, hy - 6, 6, 1, SC.hi);
    // boca abierta y mandíbula inferior
    const jo = open;
    poly(g, [[hx + 6, hy + 2], [hx - 28, hy + 2], [hx - 22, hy + 2 + jo], [hx + 4, hy + 6 + jo * 0.5]], '#5a0a14');
    poly(g, [[hx + 2, hy + 3], [hx - 22, hy + 3], [hx - 18, hy + 1 + jo], [hx, hy + 5 + jo * 0.4]], '#c82a3a');
    E(hx - 8, hy + 3 + jo * 0.6, 5, 2, '#ff6a7a');
    poly(g, [[hx + 8, hy + 4 + jo * 0.4], [hx - 26, hy + 3 + jo], [hx - 24, hy + 7 + jo], [hx + 6, hy + 10 + jo * 0.4]], SC.mid);
    poly(g, [[hx + 4, hy + 7 + jo * 0.4], [hx - 22, hy + 6 + jo], [hx - 20, hy + 8 + jo], [hx + 2, hy + 10 + jo * 0.4]], SC.belly);
    // colmillos
    for (let i = 0; i < 7; i++) { const x = hx - 26 + i * 4, big = i === 0 || i === 3; poly(g, [[x, hy + 2], [x + 2, hy + 2], [x + 1, hy + 2 + (big ? 6 : 3)]], '#f4f0e0'); }
    for (let i = 0; i < 6; i++) { const x = hx - 22 + i * 4, yb = hy + 3 + jo * (1 - i / 9), big = i === 0 || i === 3; poly(g, [[x, yb], [x + 2, yb], [x + 1, yb - (big ? 6 : 3)]], '#f4f0e0'); }
    // ojo feroz
    E(hx - 6, hy - 5, 4, 2.6, '#000000'); E(hx - 6, hy - 5, 3, 2, '#ffd23a'); R(hx - 6, hy - 6, 1, 3, '#000000'); R(hx - 8, hy - 6, 1, 1, '#ffffff');
    line(g, [[hx - 12, hy - 8], [hx - 2, hy - 9], [hx + 4, hy - 7]], SC.back, 1.6);
    // corona de perlas
    for (let i = 0; i < 4; i++) { const px = hx - 6 + i * 5, py = hy - 10 - (i === 1 || i === 2 ? 2 : 0); poly(g, [[px - 2, py + 2], [px, py - 6 - (i % 2) * 2], [px + 2, py + 2]], '#2a5a9a'); E(px, py - 6 - (i % 2) * 2, 1.6, 1.6, '#f0f4ff'); R(px - 1, py - 7 - (i % 2) * 2, 1, 1, '#ffffff'); }
    // barbas
    line(g, [[hx - 24, hy + 1], [hx - 30, hy + 8], [hx - 28 + Math.sin(t) * 2, hy + 16]], '#3a7ac0', 1); line(g, [[hx - 18, hy + 9 + jo], [hx - 20, hy + 18 + jo]], '#3a7ac0', 1);
    // aliento: rocío y chispas
    if (anim === 'attack' && f === 1 || anim === 'cast') for (let i = 0; i < 10; i++) { const a = -0.4 + rnd(f + i) * 0.8, d = 8 + rnd(i * 3 + f) * 22; R(hx - 30 - Math.cos(a) * d, hy + 2 + Math.sin(a) * d, 2, 1, i % 2 ? '#bff4ff' : '#ffe27a'); }
    else for (let i = 0; i < 3; i++) R(hx - 34 - i * 3, hy + 2 - i + Math.round(Math.sin(t + i) * 1), 1, 1, '#d8f4ff');
    g.restore();
    // relámpago grande al lanzar
    if (anim === 'cast') { const pts = [[hx + 4, hy - 30], [hx - 6, hy - 18], [hx + 2, hy - 14], [hx - 10, hy]]; line(g, pts, '#ffd23a', 2); line(g, pts, '#ffffff', 0.8); }
    // espuma
    for (let i = 0; i < 10; i++) R(X(40 + i * 13 + ((f * 4) % 8)), Y(156 + (i % 2)), 5, 1, '#9ad8f0');
  }

  // Aleta del Leviatán (parte): gran aleta membranosa que surge del agua, con púas y chispas
  function aleta(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, sw = anim === 'idle' ? Math.sin(t) * 3 : anim === 'attack' ? [4, -10, -3][f] : 0;
    const bx = ox + 6, by = oy - 6;
    E(bx, by + 2, 20, 4, '#04101e'); E(bx, by + 1, 16, 2.6, '#0a2440');
    const tips = [[-24 + sw, -54], [-8 + sw * 0.8, -62], [8 + sw * 0.6, -50], [18 + sw * 0.4, -30]];
    const base = [[bx - 14, by], [bx + 16, by]];
    poly(g, [base[0]].concat(tips.map(([x, y]) => [bx + x, by + y])).concat([base[1]]), SC.fin);
    for (const [x, y] of tips) { line(g, [[bx, by - 2], [bx + x, by + y]], SC.spine, 1.6); R(bx + x - 1, by + y - 1, 2, 2, '#e8f4ff'); }
    poly(g, [[bx - 6, by], [bx - 2 + sw * 0.3, by - 22], [bx + 6, by]], SC.mid);
    // borde luminoso y relámpagos
    line(g, tips.map(([x, y]) => [bx + x, by + y]), SC.finEdge, 1);
    const bolt = [[bx - 16 + sw, by - 40], [bx - 6, by - 30], [bx - 10, by - 24], [bx + 2, by - 12]];
    if ((f + (anim === 'cast' ? 1 : 0)) % 2 === 0) { line(g, bolt, '#ffd23a', 1.6); line(g, bolt, '#fffbe0', 0.6); }
    for (let i = 0; i < 6; i++) R(bx - 16 + i * 6, by - 1, 3, 1, '#9ad8f0');
  }

  // Cría de Leviatán: serpiente marina joven enroscada
  function cria(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, sw = anim === 'idle' ? Math.sin(t) * 2 : 0, lunge = anim === 'attack' ? [3, -9, -3][f] : 0;
    const X = (x) => ox - 32 + x, Y = (y) => oy - 52 + y;
    E(X(34), Y(50), 22, 3, '#04101e');
    const path = spline([[12, 48], [30, 50], [48, 46], [54, 36], [44, 28], [34 + sw + lunge * 0.5, 22], [28 + sw + lunge, 14]].map(([x, y]) => [X(x), Y(y)]), 8);
    serpent(R, E, g, path, (k) => (k < 0.15 ? 1 + k * 26 : 5 - (k - 0.15) * 1.5), true, f, 1);
    const hp = path[path.length - 1], hx = hp[0] - 2, hy = hp[1] - 2, jo = anim === 'attack' && f === 1 ? 6 : 3;
    E(hx, hy, 6, 5, SC.back); E(hx - 1, hy - 1, 5, 4, SC.mid);
    poly(g, [[hx + 2, hy - 3], [hx - 13, hy - 2], [hx - 14, hy + 1], [hx + 2, hy + 1]], SC.mid);
    poly(g, [[hx + 2, hy + 1], [hx - 12, hy + 1], [hx - 10, hy + 1 + jo], [hx + 2, hy + 4]], '#c82a3a');
    poly(g, [[hx + 2, hy + 3], [hx - 11, hy + 1 + jo], [hx - 10, hy + 3 + jo], [hx + 2, hy + 5]], SC.belly);
    for (let i = 0; i < 3; i++) R(hx - 12 + i * 4, hy + 1, 1, 2, '#f4f0e0');
    E(hx - 3, hy - 2, 1.6, 1.4, '#ffd23a'); R(hx - 3, hy - 2, 1, 1, '#000000');
    poly(g, [[hx + 2, hy - 4], [hx + 12, hy - 10], [hx + 8, hy]], SC.fin); R(hx - 2, hy - 7, 2, 2, '#f0f4ff');
  }

  TH.foePaint('leviatan', leviatan, [180, 172, 90, 166], '#02060e', [56, 8]);
  TH.foePaint('aleta', aleta, [72, 76, 38, 72], '#02060e', [14, 3]);
  TH.foePaint('cria_leviatan', cria, [64, 60, 32, 56], '#02060e', [14, 3]);
  const E0 = TH.data.enemies;
  if (E0.leviatan) Object.assign(E0.leviatan, { scale: 0.8, zoom: 1, camY: 30, markH: 124 });
  if (E0.cria_leviatan) E0.cria_leviatan.name = 'Cría de Leviatán';
})();
(function () { const E0 = window.TH.data.enemies; for (const k of ['aleta_izq', 'aleta_der']) if (E0[k]) Object.assign(E0[k], { scale: 0.75, markH: 58 }); })();
