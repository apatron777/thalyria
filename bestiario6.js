// Diseños propios del capítulo 8 (Ciudad Congelada y Corazón del Motor). Miran a la izquierda.
// · Cristal de tiempo / eterno: cristal flotante facetado con una esfera de reloj dentro y esquirlas en órbita.
// · Eco helado / glacial: espectro de hielo encapuchado, congelado a medio gesto, que se deshace en jirones.
// · Corazón del Fondo: corazón colosal de carne negra y engranajes, con arterias, raíces y un reloj-ojo que late.
// · Tentáculo: tentáculo del Fondo que surge de un charco negro, con ventosas y una aguja de reloj por punta.
(function () {
  'use strict';
  const TH = window.TH;
  const poly = (g, pts, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
  const line = (g, pts, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  const seg = (E, x0, y0, x1, y1, r0, r1, c) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.4));
    for (let i = 0; i <= n; i++) { const k = i / n, r = r0 + (r1 - r0) * k; E(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
  };
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
  // esfera de reloj con manecillas
  function clock(g, R, E, cx, cy, r, f, C, stop) {
    E(cx, cy, r + 1, r + 1, C.rim); E(cx, cy, r, r, C.face);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(cx + Math.cos(a) * (r - 1.5) - 0.5, cy + Math.sin(a) * (r - 1.5) - 0.5, 1, 1, i % 3 ? C.tick : C.rim); }
    const a1 = stop ? -2.2 : (f / 4) * Math.PI * 2 - Math.PI / 2, a2 = stop ? -0.9 : (f / 16) * Math.PI * 2 - Math.PI / 2;
    line(g, [[cx, cy], [cx + Math.cos(a1) * r * 0.8, cy + Math.sin(a1) * r * 0.8]], C.hand, 1);
    line(g, [[cx, cy], [cx + Math.cos(a2) * r * 0.5, cy + Math.sin(a2) * r * 0.5]], C.hand, 1.6);
    R(cx - 0.5, cy - 0.5, 1, 1, C.rim);
  }

  // ---------------- cristales de tiempo ----------------
  function crystal(anim, f, R, E, ox, oy, g, big) {
    const S = big ? 1.3 : 1, t = (f / 4) * Math.PI * 2, bob = Math.round(Math.sin(t) * 2);
    const lunge = anim === 'attack' ? [2, -8, -2][f] : 0, cx = ox + lunge, cy = oy - 28 * S + bob - (anim === 'cast' ? 3 : 0);
    const C = big ? { d: '#1a0a3a', m: '#4a2a9a', l: '#8a6ae0', h: '#d8c8ff', glow: '#ffd27a' } : { d: '#0a2a4a', m: '#2a7ab4', l: '#6ad0f0', h: '#e0fbff', glow: '#bff4ff' };
    // halo
    E(cx, cy, 15 * S, 15 * S, big ? 'rgba(140,100,255,0.16)' : 'rgba(120,220,255,0.15)');
    if (big) { g.strokeStyle = '#c8a040'; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, 19, 6, -0.3 + Math.sin(t) * 0.1, 0, Math.PI * 2); g.stroke(); }
    // cristal facetado (rombo alargado)
    const top = [cx, cy - 22 * S], bot = [cx, cy + 18 * S], lf = [cx - 11 * S, cy - 2 * S], rt = [cx + 11 * S, cy - 2 * S];
    poly(g, [top, lf, bot, rt], C.d);
    poly(g, [[top[0], top[1] + 1], [lf[0] + 1, lf[1]], [cx, cy], ], C.l);
    poly(g, [[top[0], top[1] + 1], [cx, cy], [rt[0] - 1, rt[1]]], C.m);
    poly(g, [[lf[0] + 1, lf[1]], [bot[0], bot[1] - 1], [cx, cy]], C.m);
    poly(g, [[cx, cy], [bot[0], bot[1] - 1], [rt[0] - 1, rt[1]]], C.d);
    line(g, [top, [cx - 3 * S, cy - 8 * S]], C.h, 1);
    // reloj interior
    clock(g, R, E, cx, cy - 2 * S, 6 * S, anim === 'cast' ? f * 3 : f, { rim: big ? '#ffd27a' : '#e0fbff', face: big ? 'rgba(30,10,60,0.85)' : 'rgba(10,40,70,0.85)', tick: C.l, hand: C.glow }, false);
    // esquirlas en órbita
    for (let i = 0; i < (big ? 5 : 3); i++) {
      const a = t + (i / (big ? 5 : 3)) * Math.PI * 2, rx = (big ? 22 : 17), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * rx * 0.35;
      poly(g, [[x, y - 4], [x - 2, y], [x, y + 3], [x + 2, y]], Math.sin(a) > 0 ? C.l : C.m); R(x - 0.5, y - 3, 1, 1, C.h);
    }
    if (anim === 'cast' || (anim === 'attack' && f === 1)) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f; R(cx + Math.cos(a) * 14 * S, cy + Math.sin(a) * 14 * S, 2, 2, C.glow); }
  }

  // ---------------- ecos de hielo ----------------
  function eco(anim, f, R, E, ox, oy, g, big) {
    const S = big ? 1.35 : 1, t = (f / 4) * Math.PI * 2, bob = Math.round(Math.sin(t) * 1.5);
    const lunge = anim === 'attack' ? [3, -10, -3][f] : 0, cx = ox + lunge, cy = oy - 30 * S + bob;
    const C = big ? { d: '#0a1438', m: '#2a4a9a', l: '#7aa8e8', h: '#e8f4ff', eye: '#7af0ff' } : { d: '#1a3a5a', m: '#4a8ab8', l: '#a8dcf4', h: '#f4fcff', eye: '#bff4ff' };
    // jirones de la capa (abajo)
    for (let i = 0; i < 5; i++) { const x = cx - 8 * S + i * 4 * S, w = Math.sin(t + i) * 2; poly(g, [[x - 2 * S, cy + 8 * S], [x + 2 * S, cy + 8 * S], [x + w, cy + (20 + (i % 2) * 5) * S]], i % 2 ? C.m : C.d); }
    // capa encapuchada
    poly(g, [[cx, cy - 22 * S], [cx - 12 * S, cy - 4 * S], [cx - 11 * S, cy + 10 * S], [cx + 11 * S, cy + 10 * S], [cx + 13 * S, cy - 6 * S]], C.d);
    poly(g, [[cx, cy - 21 * S], [cx - 10 * S, cy - 4 * S], [cx - 9 * S, cy + 8 * S], [cx + 2 * S, cy + 8 * S], [cx + 4 * S, cy - 8 * S]], C.m);
    line(g, [[cx - 6 * S, cy - 10 * S], [cx - 7 * S, cy + 6 * S]], C.l, 1);
    // esquirlas clavadas en la espalda
    for (let i = 0; i < 3; i++) poly(g, [[cx + (6 + i * 2) * S, cy - (12 - i * 6) * S], [cx + (18 + i * 2) * S, cy - (20 - i * 6) * S], [cx + (8 + i * 2) * S, cy - (8 - i * 6) * S]], i % 2 ? C.l : C.h);
    // corona de carámbanos (glacial)
    if (big) for (let i = 0; i < 5; i++) { const x = cx - 8 + i * 4; poly(g, [[x - 1.5, cy - 24], [x + 1.5, cy - 24], [x, cy - 32 - (i === 2 ? 5 : i % 2 ? 2 : 0)]], C.h); }
    // rostro: máscara pálida y ojos huecos
    E(cx - 2 * S, cy - 10 * S, 5 * S, 6 * S, '#02060e'); E(cx - 3 * S, cy - 10 * S, 4 * S, 5 * S, '#cfe4f0');
    R(cx - 6 * S, cy - 12 * S, 2 * S, 2 * S, '#02060e'); R(cx - 2 * S, cy - 12 * S, 2 * S, 2 * S, '#02060e');
    R(cx - 5.5 * S, cy - 11.5 * S, 1, 1, C.eye); R(cx - 1.5 * S, cy - 11.5 * S, 1, 1, C.eye);
    line(g, [[cx - 5 * S, cy - 7 * S], [cx - 3 * S, cy - 6 * S], [cx - 1 * S, cy - 7 * S]], '#02060e', 1);
    // brazo helado que se estira con garras
    const reach = anim === 'attack' ? [4, 10, 6][f] : 2 + Math.sin(t) * 1;
    seg(E, cx - 6 * S, cy - 2 * S, cx - (14 + reach) * S, cy - 4 * S, 2.4 * S, 1.6 * S, C.l);
    for (let i = 0; i < 3; i++) line(g, [[cx - (14 + reach) * S, cy - 4 * S], [cx - (19 + reach) * S, cy - (7 - i * 3) * S]], C.h, 1);
    if (big) { seg(E, cx + 6, cy, cx + 12, cy + 8, 2.6, 1.6, C.l); for (let i = 0; i < 3; i++) line(g, [[cx + 12, cy + 8], [cx + 10 + i * 3, cy + 14]], C.h, 1); }
    // escarcha flotando
    for (let i = 0; i < (big ? 6 : 4); i++) { const a = rnd(i * 7 + f); R(cx - 16 * S + a * 32 * S, cy - 20 * S + rnd(i * 3 + f * 2) * 40 * S, 1, 1, C.h); }
    if (anim === 'cast') for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + f; poly(g, [[cx + Math.cos(a) * 16, cy + Math.sin(a) * 16 - 3], [cx + Math.cos(a) * 16 - 2, cy + Math.sin(a) * 16], [cx + Math.cos(a) * 16, cy + Math.sin(a) * 16 + 3], [cx + Math.cos(a) * 16 + 2, cy + Math.sin(a) * 16]], C.h); }
  }

  // ---------------- Corazón del Fondo ----------------
  function corazon(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, beat = anim === 'idle' ? (f % 2 === 0 ? 1.06 : 0.98) : anim === 'cast' ? 1.1 : anim === 'attack' ? [1.0, 1.12, 1.04][f] : 0.96;
    const cx = ox + (anim === 'hurt' ? 4 : 0), cy = oy - 78;
    const F = { d: '#0a020e', m: '#2a0a2e', l: '#5a1a52', h: '#9a3a7a', vein: '#c84aff', vein2: '#ff9aff', gold: '#c8a040', gold2: '#ffd27a' };
    // charco y raíces que lo anclan al suelo
    E(ox, oy - 2, 60, 7, '#04000a'); E(ox, oy - 3, 50, 4, '#14061e');
    for (let i = 0; i < 6; i++) { const x = cx - 30 + i * 12, sw = Math.sin(t + i) * 2; seg(E, x * 0.6 + cx * 0.4, cy + 34, x + sw, oy - 3, 4, 1.5, i % 2 ? F.d : F.m); }
    // arterias / cables hacia arriba
    for (const [x0, mx, my, tx, ty, r] of [[-14, -30, -46, -58, -62, 6], [4, 10, -52, -4, -76, 7], [18, 34, -40, 56, -50, 5]]) {
      const w = Math.sin(t + x0) * 2, P = [[cx + x0, cy - 22], [cx + mx + w, cy + my], [cx + tx + w, cy + ty]];
      for (let s2 = 0; s2 < 2; s2++) { seg(E, P[s2][0], P[s2][1], P[s2 + 1][0], P[s2 + 1][1], r + 1, r, F.d); seg(E, P[s2][0] - 1, P[s2][1] - 1, P[s2 + 1][0] - 1, P[s2 + 1][1] - 1, r * 0.55, r * 0.5, F.l); }
      for (let k = 1; k < 4; k++) { const q = k / 4, s2 = q < 0.5 ? 0 : 1, qq = (q - s2 * 0.5) * 2; R(P[s2][0] + (P[s2 + 1][0] - P[s2][0]) * qq - r, P[s2][1] + (P[s2 + 1][1] - P[s2][1]) * qq, r * 2, 1.4, F.gold); }
      E(P[2][0], P[2][1], r + 1, r * 0.7, F.d); E(P[2][0], P[2][1], r * 0.6, r * 0.4, f % 2 ? F.vein : F.vein2);
    }
    g.save(); g.translate(cx, cy); g.scale(beat, beat); g.translate(-cx, -cy);
    // engranajes incrustados a los lados (detrás)
    for (const [gx, gy, gr, sp] of [[-36, -6, 14, 1], [34, 10, 11, -1.4], [-20, 30, 9, 1.8]]) {
      const a0 = t * sp * 0.25;
      for (let i = 0; i < 10; i++) { const a = a0 + (i / 10) * Math.PI * 2; R(cx + gx + Math.cos(a) * gr - 1.5, cy + gy + Math.sin(a) * gr - 1.5, 3, 3, F.gold); }
      E(cx + gx, cy + gy, gr - 1, gr - 1, '#6a5020'); E(cx + gx, cy + gy, gr - 4, gr - 4, '#2a1a08'); E(cx + gx, cy + gy, 2, 2, F.gold2);
    }
    // cuerpo del corazón: dos lóbulos y punta
    poly(g, [[cx - 38, cy - 10], [cx + 38, cy - 10], [cx + 4, cy + 44]], F.d);
    E(cx - 18, cy - 14, 24, 22, F.d); E(cx + 18, cy - 12, 22, 20, F.d);
    poly(g, [[cx - 35, cy - 8], [cx + 35, cy - 8], [cx + 3, cy + 40]], F.m);
    E(cx - 18, cy - 14, 22, 20, F.m); E(cx + 18, cy - 12, 20, 18, F.m);
    E(cx - 22, cy - 22, 12, 9, F.l); E(cx + 12, cy - 22, 9, 6, F.l); R(cx - 28, cy - 28, 6, 2, F.h);
    // venas que brillan con el latido
    const vc = anim === 'cast' || f % 2 === 0 ? F.vein2 : F.vein;
    for (const v of [[[-30, -4], [-18, 6], [-8, 2], [-2, 18], [2, 34]], [[30, -2], [20, 10], [10, 8], [6, 24]], [[-10, -30], [-6, -16], [-12, -6]], [[22, -28], [16, -16], [22, -6]]]) line(g, v.map(([x, y]) => [cx + x, cy + y]), vc, 1.4);
    // reloj-ojo en el centro, agrietado y detenido
    E(cx, cy - 2, 17, 17, '#000000');
    clock(g, R, E, cx, cy - 2, 15, f, { rim: F.gold2, face: '#1a0624', tick: F.gold, hand: F.gold2 }, anim !== 'cast');
    // pupila del ojo (mira al grupo)
    const pr = anim === 'attack' && f === 1 ? 3 : 5;
    E(cx - 3, cy - 2, 7, 8, 'rgba(200,74,255,0.55)'); E(cx - 3, cy - 2, pr * 0.5, pr, '#000000'); R(cx - 6, cy - 6, 2, 2, '#ffffff');
    line(g, [[cx + 4, cy - 16], [cx + 1, cy - 8], [cx + 6, cy - 4], [cx + 3, cy + 4]], '#e8d8ff', 0.8);
    g.restore();
    // partículas del instante que gotean hacia arriba
    for (let i = 0; i < 8; i++) { const a = rnd(i * 5.3), y = cy + 40 - ((f * 9 + i * 13) % 110); R(cx - 44 + a * 88, y, 1, 2, i % 2 ? F.vein : F.gold2); }
    if (anim === 'cast') for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,154,255,' + (0.6 - i * 0.18) + ')'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(cx, cy - 2, 30 + i * 12 + f * 4, 26 + i * 10 + f * 3, 0, 0, Math.PI * 2); g.stroke(); }
  }

  // ---------------- Tentáculo ----------------
  function tentaculo(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, sw = anim === 'idle' ? Math.sin(t) * 5 : anim === 'attack' ? [6, -14, -4][f] : anim === 'hurt' ? 6 : 0;
    E(ox, oy - 2, 16, 4, '#04000a'); E(ox, oy - 3, 12, 2.4, '#1a0624');
    const N = 14, pts = [];
    for (let i = 0; i <= N; i++) { const k = i / N; pts.push([ox + Math.sin(k * 2.6 + t * 0.5) * 6 * k + sw * k * k, oy - 4 - k * 62]); }
    for (let i = 0; i < N; i++) { const k = i / N, r = 7 - k * 5; seg(E, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r + 1, r - 4 / N + 1, '#0a020e'); }
    for (let i = 0; i < N; i++) { const k = i / N, r = 6 - k * 5; seg(E, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r, Math.max(0.8, r - 0.4), '#3a0e3e'); seg(E, pts[i][0] + r * 0.3, pts[i][1], pts[i + 1][0] + r * 0.3, pts[i + 1][1], r * 0.4, r * 0.3, '#6a2a62'); }
    // ventosas (lado izquierdo)
    for (let i = 1; i < N - 2; i += 2) { const k = i / N, r = 6 - k * 5; E(pts[i][0] - r * 0.8, pts[i][1], 1.6, 1.6, '#c87aa8'); R(pts[i][0] - r * 0.8 - 0.5, pts[i][1] - 0.5, 1, 1, '#2a0a2e'); }
    // venas violetas
    line(g, pts.slice(1, N - 2).map(([x, y], i) => [x + (i % 2 ? 1 : -1), y]), f % 2 ? '#c84aff' : '#8a2ae0', 0.8);
    // aguja de reloj por punta
    const tip = pts[N], prev = pts[N - 2], dx = tip[0] - prev[0], dy = tip[1] - prev[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    poly(g, [[tip[0] - uy * 3, tip[1] + ux * 3], [tip[0] + ux * 14, tip[1] + uy * 14], [tip[0] + uy * 3, tip[1] - ux * 3]], '#c8a040');
    line(g, [[tip[0], tip[1]], [tip[0] + ux * 12, tip[1] + uy * 12]], '#ffd27a', 1);
    E(tip[0], tip[1], 2.4, 2.4, '#ffd27a'); R(tip[0] - 0.5, tip[1] - 0.5, 1, 1, '#2a1a08');
  }

  TH.foePaint('cristal_tiempo', (a, f, R, E, ox, oy, g) => crystal(a, f, R, E, ox, oy, g, false), [56, 64, 28, 60], '#02060e', [10, 3]);
  TH.foePaint('cristal_eterno', (a, f, R, E, ox, oy, g) => crystal(a, f, R, E, ox, oy, g, true), [72, 80, 36, 76], '#04020e', [13, 3]);
  TH.foePaint('eco_helado', (a, f, R, E, ox, oy, g) => eco(a, f, R, E, ox, oy, g, false), [56, 60, 30, 56], '#02060e', [10, 3]);
  TH.foePaint('eco_glacial', (a, f, R, E, ox, oy, g) => eco(a, f, R, E, ox, oy, g, true), [72, 84, 38, 80], '#02040e', [13, 3]);
  TH.foePaint('corazon', corazon, [150, 168, 75, 164], '#000000', [56, 7]);
  TH.foePaint('tentaculo', tentaculo, [48, 84, 24, 80], '#000000', [12, 3]);
  const E0 = TH.data.enemies;
  if (E0.corazon) Object.assign(E0.corazon, { scale: 1, zoom: 1, camY: 24, markH: 140 });
  for (const k of ['tentaculo_izq', 'tentaculo_der']) if (E0[k]) Object.assign(E0[k], { scale: 1, markH: 66 });
  for (const k of ['cristal_tiempo', 'cristal_eterno', 'eco_helado', 'eco_glacial']) if (E0[k]) E0[k].scale = 1;
})();
