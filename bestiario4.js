// Diseños propios del capítulo 6 (Hondaroca hundida). Miran a la izquierda.
// · Medusa del Fondo: campana translúcida con borde luminoso, brazos de volantes y tentáculos largos.
// · Medusa reina: campana coronada de púas, núcleo con rostro, muchos tentáculos rosa y violeta.
// · Cangrejo abisal: caparazón negro con púas y venas luminosas, una pinza gigante, ojos en pedúnculo, percebes.
// · Cangrejo titán: un cangrejo ermitaño colosal que carga a la espalda un trozo de Hondaroca (tejado y chimenea).
// · Coloso de la Forja «Padre Yunque»: gólem de hierro y piedra, cabeza-yunque con ojo-rendija, chimeneas en los
//   hombros y horno en el pecho. Fase 2 (coloso2): fundido, grietas al rojo blanco y escoria que gotea.
// · Yunque: brazo del coloso que termina en un yunque, con cadenas y costuras de magma.
(function () {
  'use strict';
  const TH = window.TH;
  const seg = (E, x0, y0, x1, y1, r0, r1, c) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.4));
    for (let i = 0; i <= n; i++) { const k = i / n, r = r0 + (r1 - r0) * k; E(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
  };
  const wave = (E, x, y, len, amp, ph, r0, r1, c) => { let px = x, py = y; for (let i = 1; i <= 8; i++) { const k = i / 8, nx = x + Math.sin(ph + k * 4) * amp * k, ny = y + len * k; seg(E, px, py, nx, ny, r0 + (r1 - r0) * (k - 0.125), r0 + (r1 - r0) * k, c); px = nx; py = ny; } return [px, py]; };

  // ---------------- medusas ----------------
  function jelly(anim, f, R, E, ox, oy, queen) {
    const t = (f / 4) * Math.PI * 2, pulse = anim === 'idle' ? Math.sin(t) : anim === 'attack' ? [1, -1, 0][f] : anim === 'cast' ? 1.2 : 0;
    const cx = ox + (anim === 'attack' ? [2, -8, -2][f] : 0), cy = oy - (queen ? 42 : 34) + Math.round(Math.sin(t) * 2);
    const C = queen ? ['#2a0a3a', '#6a2a8a', '#b25ac8', '#ffb0f0', '#ffe0ff'] : ['#082a3a', '#1a6a8a', '#4ab8d0', '#a0f4ff', '#e8ffff'];
    const RW = queen ? 16 : 12, RH = queen ? 11 : 9, rw = RW + pulse * 1.5, rh = RH - pulse;
    // tentáculos largos (detrás)
    const n = queen ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const x = cx - rw + 3 + i * ((rw * 2 - 6) / (n - 1)), len = (queen ? 30 : 24) + (i % 3) * 5;
      const [ex, ey] = wave(E, x, cy + 2, len, 4 + (i % 2) * 2, t + i * 0.9, 1.2, 0.4, i % 2 ? C[1] : C[2]);
      R(ex, ey, 1, 1, C[3]);
    }
    // brazos orales de volantes
    for (let i = 0; i < 3; i++) { const x = cx - 4 + i * 4; wave(E, x, cy + 3, (queen ? 18 : 14) - i, 2.4, t * 1.3 + i, 2.4, 1, C[3]); }
    // campana
    E(cx, cy, rw + 1, rh + 1, C[0]); E(cx, cy, rw, rh, C[1]); E(cx - 1, cy - 2, rw - 2, rh - 3, C[2]); E(cx - 4, cy - 4, rw * 0.4, rh * 0.35, C[4]);
    for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI; R(cx + Math.cos(a) * (rw - 3), cy + Math.sin(a) * (rh - 3), 2, 1, C[3]); }
    // borde luminoso festoneado
    for (let i = 0; i < 9; i++) { const x = cx - rw + 1 + i * (rw * 2 - 2) / 8; E(x, cy + 2 + (i % 2), 2, 1.4, C[3]); R(x, cy + 3 + (i % 2), 1, 1, '#ffffff'); }
    // órganos internos (cuatro arcos)
    for (let i = 0; i < 4; i++) E(cx - 6 + i * 4, cy - 1, 1.6, 2.6, C[0]);
    if (queen) {
      // corona de púas y rostro en el núcleo
      for (let i = 0; i < 7; i++) { const x = cx - 12 + i * 4, h = 6 + (i === 3 ? 6 : (i % 2) * 3); seg(E, x, cy - rh + 2, x + (i - 3) * 0.6, cy - rh - h, 1.4, 0.4, C[3]); R(x + (i - 3) * 0.6, cy - rh - h - 1, 1, 1, '#ffffff'); }
      E(cx - 1, cy - 1, 5, 4, C[0]); R(cx - 4, cy - 2, 2, 1, '#fff060'); R(cx + 1, cy - 2, 2, 1, '#fff060'); R(cx - 3, cy + 1, 4, 1, C[4]);
    } else { R(cx - 3, cy - 1, 2, 2, '#e8ffff'); R(cx + 1, cy - 1, 2, 2, '#e8ffff'); }
    if (anim === 'cast') for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f; R(cx + Math.cos(a) * (rw + 6), cy + Math.sin(a) * (rh + 6), 1, 1, C[4]); }
  }
  const medusa = (a, f, R, E, ox, oy) => jelly(a, f, R, E, ox, oy, false);
  const medusaR = (a, f, R, E, ox, oy) => jelly(a, f, R, E, ox, oy, true);

  // ---------------- cangrejos ----------------
  function crabBody(anim, f, R, E, ox, oy, titan) {
    const t = (f / 4) * Math.PI * 2, bob = anim === 'idle' ? Math.round(Math.sin(t)) : anim === 'hurt' ? 2 : 0;
    const lunge = anim === 'attack' ? [3, -9, -3][f] : 0, S = titan ? 1.25 : 1;
    const P = titan ? ['#0c0a10', '#26222e', '#3e3848', '#5e566a'] : ['#08060e', '#1c1630', '#2e2650', '#4a3e78'];
    const GL = titan ? '#ff8a3a' : '#5af0d8';
    const cx = ox + 4 + lunge, cy = oy - Math.round(13 * S) + bob;
    // patas
    for (let i = 0; i < 4; i++) {
      const lx = cx - 10 * S + i * 7 * S, sw = anim === 'idle' ? 0 : Math.round(Math.sin(t + i * 2) * 2);
      seg(E, lx, cy + 4, lx - 5 + sw, cy + 8 * S, 2 * S, 1.6 * S, P[1]); seg(E, lx - 5 + sw, cy + 8 * S, lx - 7 + sw, oy - 1, 1.6 * S, 0.6, P[0]);
      R(lx - 6 + sw, cy + 7 * S, 2, 1, P[3]);
    }
    if (titan) {
      // trozo de Hondaroca a la espalda: roca, tejado, chimenea humeante y una ventana encendida
      const hx = cx + 6, hy = cy - 20;
      E(hx, cy - 6, 24, 12, '#2a241e'); E(hx - 1, cy - 8, 22, 10, '#4a4036'); for (let i = 0; i < 6; i++) R(hx - 18 + i * 7, cy - 10 + (i % 2) * 3, 5, 2, '#6a5c4c');
      R(hx - 14, hy, 24, 12, '#c8b89a'); R(hx - 14, hy, 24, 1, '#e8dcc0'); R(hx - 14, hy + 11, 24, 1, '#7a6a54');
      R(hx - 10, hy + 3, 5, 5, '#3a2a1a'); R(hx - 9, hy + 4, 3, 3, (f % 2) ? '#ffd06a' : '#ffb84a'); R(hx + 2, hy + 4, 4, 8, '#5a3a22');
      for (let i = 0; i < 9; i++) R(hx - 17 + i, hy - 1 - i, 30 - i * 2, 1, i % 2 ? '#8a2a1a' : '#b23a24');
      R(hx + 5, hy - 13, 4, 10, '#6a5c4c'); R(hx + 5, hy - 13, 4, 1, '#8a7c6c');
      for (let i = 0; i < 3; i++) E(hx + 7 + i, hy - 16 - ((f * 3 + i * 4) % 10), 2 + i * 0.5, 2, 'rgba(200,200,210,0.6)');
      for (let i = 0; i < 4; i++) R(hx - 22 + i * 12, cy - 4, 3, 2, '#2c5a3a');
    }
    // caparazón con púas
    E(cx + 2, cy, 15 * S, 9 * S, P[0]); E(cx + 2, cy - 1, 14 * S, 8 * S, P[1]); E(cx, cy - 3, 9 * S, 5 * S, P[2]);
    for (let i = 0; i < 7; i++) { const x = cx - 10 * S + i * 4 * S; seg(E, x, cy - 6 * S, x - 1, cy - 11 * S - (i % 2) * 2, 1.4, 0.4, P[3]); }
    // venas luminosas y percebes
    seg(E, cx - 8, cy - 1, cx + 8, cy - 4, 0.6, 0.5, GL); seg(E, cx - 2, cy + 3, cx + 12, cy + 1, 0.6, 0.5, GL);
    for (const [dx, dy] of [[8, -2], [12, 2], [-6, 3]]) { E(cx + dx * S, cy + dy * S, 2, 1.6, '#c8c0b0'); R(cx + dx * S, cy + dy * S - 1, 1, 1, '#4a4038'); }
    // ojos en pedúnculo
    for (const dx of [-8, -4]) { R(cx + dx * S, cy - 9 * S, 1, 5, P[2]); E(cx + dx * S, cy - 10 * S, 1.6, 1.6, GL); R(cx + dx * S, cy - 11 * S, 1, 1, '#ffffff'); }
    // pinza pequeña
    seg(E, cx - 10 * S, cy + 2, cx - 16 * S, cy + 4, 2, 1.6, P[1]); E(cx - 18 * S, cy + 4, 3, 2.4, P[2]);
    // pinza gigante
    const open = anim === 'attack' && f === 1 ? 1 : anim === 'cast' ? 6 : 4, ux = cx - 14 * S + lunge * 0.3, uy = cy - 6 * S - (anim === 'attack' && f === 0 ? 4 : 0);
    seg(E, cx - 6 * S, cy - 2, ux, uy, 3 * S, 2.4 * S, P[1]);
    E(ux - 4 * S, uy, 8 * S, 6 * S, P[0]); E(ux - 4 * S, uy - 1, 7 * S, 5 * S, P[2]); R(ux - 6 * S, uy - 4 * S, 4, 1, P[3]);
    R(ux - 20 * S, uy - open - 3 * S, 12 * S, 3 * S, P[1]); R(ux - 20 * S, uy - open - 3 * S, 12 * S, 1, P[3]);
    R(ux - 19 * S, uy + open, 10 * S, 3 * S, P[1]);
    for (let i = 0; i < 4; i++) { R(ux - 19 * S + i * 3 * S, uy - open, 1, 2, '#e8e0f0'); R(ux - 18 * S + i * 3 * S, uy + open - 1, 1, 2, '#e8e0f0'); }
    seg(E, ux - 6 * S, uy - 2, ux + 2, uy + 2, 0.6, 0.5, GL);
  }
  const cangrejoAbisal = (a, f, R, E, ox, oy) => crabBody(a, f, R, E, ox, oy, false);
  const cangrejoTitan = (a, f, R, E, ox, oy) => crabBody(a, f, R, E, ox, oy, true);

  // ---------------- Coloso de la Forja ----------------
  function colosoBody(anim, f, R, E, ox, oy, molten) {
    const t = (f / 4) * Math.PI * 2, hum = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const lean = anim === 'attack' ? [0, -5, -2][f] : anim === 'hurt' ? 3 : 0, cast = anim === 'cast' ? 1 : 0;
    const I = molten ? ['#1a0804', '#3a1408', '#5a2010', '#7a3018'] : ['#0e0c0c', '#24201e', '#3a3430', '#56504a'];
    const ST = molten ? ['#2a1008', '#4a1c0c', '#6a2a14'] : ['#2a2622', '#45403a', '#625a50'];
    const HOT = molten ? ['#ffffff', '#fff2a0', '#ffb040', '#ff5a1a'] : ['#fff2a0', '#ffc050', '#ff7a2a', '#c8301a'];
    const cx = ox + 4 + lean, base = oy;
    // piernas de piedra con grebas de hierro
    for (const lx of [cx - 18, cx + 14]) {
      E(lx, base - 18, 9, 16, I[0]); E(lx - 1, base - 18, 8, 15, ST[1]); R(lx - 8, base - 26, 16, 6, I[2]); R(lx - 8, base - 26, 16, 1, I[3]);
      R(lx - 11, base - 5, 22, 5, I[1]); R(lx - 11, base - 5, 22, 1, I[3]);
      seg(E, lx - 3, base - 14, lx + 2, base - 8, 0.6, 0.5, HOT[2]);
    }
    // torso: bloque de hierro y piedra
    const ty = base - 54 - hum;
    E(cx, ty, 30, 22, I[0]); E(cx - 1, ty - 1, 29, 21, I[1]); E(cx - 6, ty - 7, 18, 11, I[2]);
    for (let i = 0; i < 4; i++) R(cx - 26, ty - 12 + i * 8, 52, 1, I[0]);
    for (let i = 0; i < 10; i++) R(cx - 24 + i * 5, ty - 18, 2, 2, I[3]);
    // horno del pecho
    E(cx, ty + 2, 12, 10, I[0]); E(cx, ty + 2, 10, 8, HOT[3]); E(cx, ty + 3, 8, 6, HOT[2]); E(cx - 1, ty + 3, 5, 4, HOT[1]); E(cx - 2, ty + 2, 2, 2, HOT[0]);
    for (let i = 0; i < 5; i++) R(cx - 10 + i * 5, ty - 6, 1, 16, I[0]);
    // grietas de magma
    const cr = molten ? 6 : 3;
    for (let i = 0; i < cr; i++) { const x0 = cx - 24 + ((i * 17) % 46), y0 = ty - 14 + ((i * 11) % 24); seg(E, x0, y0, x0 + 5 - (i % 3) * 4, y0 + 7, 0.7, 0.5, HOT[2]); R(x0, y0, 1, 1, HOT[1]); }
    // hombros con chimeneas que escupen fuego
    for (const s of [-1, 1]) {
      const sx = cx + s * 30, sy = ty - 14;
      E(sx, sy, 15, 11, I[0]); E(sx, sy - 1, 14, 10, ST[1]); E(sx - s * 3, sy - 4, 7, 4, ST[2]); R(sx - 13, sy + 6, 26, 2, I[1]); for (let k = 0; k < 3; k++) seg(E, sx - 8 + k * 8, sy - 8, sx - 8 + k * 8 + s * 3, sy - 14, 1.8, 0.6, I[3]);
      R(sx - 3 + s * 2, sy - 22, 7, 16, ST[0]); R(sx - 2 + s * 2, sy - 22, 5, 16, ST[1]); R(sx - 4 + s * 2, sy - 24, 9, 3, I[3]);
      for (let i = 0; i < 4; i++) { const h = 3 + ((f + i) % 3) * 2; R(sx - 2 + s * 2 + i, sy - 25 - h, 1, h, HOT[i % 3 + 1]); }
      for (let i = 0; i < 2; i++) E(sx + s * 2 + i * 2, sy - 34 - ((f * 4 + i * 6) % 12), 3, 2, 'rgba(70,64,64,0.75)');
    }
    // cabeza-yunque enorme con ojo-rendija y barba de cadenas
    const hy = ty - 32 - cast * 2;
    R(cx - 10, hy + 8, 20, 8, I[1]);
    R(cx - 26, hy - 9, 50, 14, I[0]); R(cx - 25, hy - 9, 48, 13, I[2]); R(cx - 25, hy - 9, 48, 2, I[3]);
    for (let i = 0; i < 12; i++) R(cx - 36 + i, hy - 7 + Math.round(i * 0.45), 12 - i, 2, i < 3 ? I[3] : I[2]); // cuerno del yunque
    R(cx - 38, hy - 6, 3, 3, I[3]);
    R(cx + 20, hy - 9, 6, 4, I[1]); R(cx + 21, hy - 13, 4, 4, I[2]);
    for (let i = 0; i < 6; i++) R(cx - 20 + i * 8, hy + 2, 2, 2, I[3]);
    R(cx - 18, hy + 5, 30, 6, I[1]);
    R(cx - 21, hy - 3, 30, 4, '#000000'); R(cx - 20 + (f % 2) * 2, hy - 3, 22, 3, HOT[1]); R(cx - 16 + (f % 2) * 2, hy - 2, 7, 1, HOT[0]);
    for (let i = 0; i < 5; i++) { const x = cx - 14 + i * 6, l = 6 + (i % 2) * 4; for (let k = 0; k < l; k += 2) R(x, hy + 11 + k, 2, 1, k % 4 ? '#6a6a6a' : '#8a8a8a'); }
    if (molten) for (let i = 0; i < 6; i++) { const x = cx - 24 + i * 9, l = 3 + ((f + i) % 4) * 2; R(x, hy + 5, 2, l, HOT[2]); R(x, hy + 5 + l, 2, 2, HOT[3]); }
    // escoria/chispas
    for (let i = 0; i < 6; i++) R(cx - 34 + ((i * 13 + f * 7) % 68), ty - 40 - ((i * 9 + f * 5) % 30), 1, 1, HOT[1]);
    if (cast) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; R(cx + Math.cos(a) * 34, ty + Math.sin(a) * 24, 2, 2, HOT[1]); }
  }
  const coloso = (a, f, R, E, ox, oy) => colosoBody(a, f, R, E, ox, oy, false);
  const coloso2 = (a, f, R, E, ox, oy) => colosoBody(a, f, R, E, ox, oy, true);
  // Yunque: brazo del coloso que acaba en un yunque
  function yunque(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, up = anim === 'idle' ? Math.round(Math.sin(t) * 1.5) : anim === 'attack' ? [8, -4, 2][f] : anim === 'cast' ? 6 : 0;
    const slam = anim === 'attack' ? [4, -10, -3][f] : 0;
    const I = ['#0e0c0c', '#24201e', '#3a3430', '#56504a'], HOT = ['#fff2a0', '#ffc050', '#ff7a2a'];
    const sx = ox + 18, sy = oy - 34 - up;
    // cadenas que lo cuelgan
    for (let i = 0; i < 5; i++) { R(sx - 1, sy - 16 + i * 4, 3, 2, i % 2 ? '#5a5a5a' : '#7a7a7a'); }
    // brazo con costuras de magma
    seg(E, sx, sy, sx - 14 + slam, sy + 8, 5, 4, I[1]); seg(E, sx, sy, sx - 14 + slam, sy + 8, 2, 1.6, I[2]);
    seg(E, sx - 4, sy + 1, sx - 10 + slam, sy + 6, 0.6, 0.5, HOT[2]);
    E(sx, sy, 6, 6, I[0]); E(sx, sy, 4, 4, I[3]); E(sx, sy, 2, 2, HOT[1]);
    // yunque
    const ax = sx - 30 + slam, ay = sy + 14;
    R(ax - 6, ay - 11, 36, 8, I[0]); R(ax - 5, ay - 11, 34, 7, I[2]); R(ax - 5, ay - 11, 34, 2, I[3]);
    for (let i = 0; i < 12; i++) R(ax - 17 + i, ay - 10 + Math.round(i * 0.35), 12 - i, 2, I[2]);
    R(ax + 4, ay - 4, 18, 8, I[1]); R(ax - 1, ay + 4, 28, 6, I[0]); R(ax, ay + 4, 26, 2, I[3]);
    R(ax + 8, ay - 10, 4, 1, HOT[1]); R(ax - 8, ay - 10, 3, 1, HOT[2]); R(ax + 22, ay - 9, 2, 1, HOT[2]);
    if (anim === 'attack' && f === 1) for (let i = 0; i < 6; i++) R(ax - 10 + i * 6, ay + 9 + (i % 2), 2, 1, HOT[i % 3]);
  }

  TH.foePaint('medusa', medusa, [64, 76, 32, 72], '#04141c', [8, 2]);
  TH.foePaint('medusa_reina', medusaR, [76, 96, 38, 92], '#14041c', [10, 2]);
  TH.foePaint('cangrejo_abisal', cangrejoAbisal, [72, 52, 36, 48], '#020104', [16, 3]);
  TH.foePaint('cangrejo_titan', cangrejoTitan, [96, 84, 48, 80], '#020104', [22, 4]);
  TH.foePaint('coloso', coloso, [150, 132, 75, 128], '#060404', [44, 7]);
  TH.foePaint('coloso2', coloso2, [150, 132, 75, 128], '#0a0402', [44, 7]);
  TH.foePaint('yunque', yunque, [92, 72, 52, 68], '#060404', [16, 3]);
  const E0 = TH.data.enemies;
  if (E0.coloso) Object.assign(E0.coloso, { zoom: 1.12, camY: 14, markH: 112 });
  if (E0.cangrejo_titan) E0.cangrejo_titan.markH = 60;
  if (E0.medusa_reina) E0.medusa_reina.markH = 70;
})();
