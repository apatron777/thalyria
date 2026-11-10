// Diseños propios de los capítulos 4 y 5 (Ciudad Dorada, Biblioteca, el Fondo). Miran a la izquierda.
// · Engranaje vigía: araña de relojería con un engranaje por cuerpo y un ojo en el eje.
// · Engranaje mayor: dos engranajes engarzados, brazos-guadaña de minutero y vapor.
// · Polilla del tiempo: alas con esferas de reloj y polvo de arena dorada.
// · Polilla eterna: alas cósmicas con ojos, halo y bordes translúcidos.
// · Sombra del Fondo: espectro encorvado que sale de un charco negro, garras largas y ojos vacíos.
// · Sombra abisal: espectro encapuchado con muchos ojos, boca vertical y cuernos.
// · Cronoguardia: caballero-reloj con cara de esfera, péndulo en el pecho, alas de engranaje y falda-campana.
// · Aguja: manecilla gigante con punta de flor de lis y engranaje en la base (sus dos brazos).
// · Primer Abisal: horror del Fondo que emerge del agua negra: cuernos, seis ojos, fauces de agujas y tentáculos.
//   «abisal2» es el mismo ser en el presente (cap. 8): más podrido y con ojos rojos.
(function () {
  'use strict';
  const TH = window.TH;
  const seg = (E, x0, y0, x1, y1, r0, r1, c) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.4));
    for (let i = 0; i <= n; i++) { const k = i / n, r = r0 + (r1 - r0) * k; E(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
  };
  // engranaje: disco con dientes que gira según el fotograma
  const gear = (R, E, x, y, r, teeth, rot, C) => {
    for (let i = 0; i < teeth; i++) { const a = rot + (i / teeth) * Math.PI * 2; E(x + Math.cos(a) * (r + 1.5), y + Math.sin(a) * (r + 1.5), 2.2, 2.2, C[0]); E(x + Math.cos(a) * (r + 1), y + Math.sin(a) * (r + 1), 1.4, 1.4, C[2]); }
    E(x, y, r, r, C[0]); E(x, y, r - 1, r - 1, C[1]); E(x - r * 0.25, y - r * 0.25, r * 0.55, r * 0.55, C[2]);
    for (let i = 0; i < 4; i++) { const a = rot * 0.5 + (i / 4) * Math.PI * 2; seg(E, x, y, x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2), 0.8, 0.6, C[0]); }
    E(x, y, r * 0.35, r * 0.35, C[0]);
  };
  const GOLD = ['#3a2408', '#8a5a1a', '#d8a440', '#ffe08a'], BRASS = ['#2a1a08', '#6a4a1c', '#a8803a', '#e0c070'];

  // ================= CAPÍTULO 4 =================
  function engranaje(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, rot = f * 0.4 + (anim === 'attack' ? f * 0.6 : 0);
    const lunge = anim === 'attack' ? [2, -8, -3][f] : 0, cx = ox + 2 + lunge, cy = oy - 20 + (anim === 'idle' ? Math.round(Math.sin(t)) : 0);
    // patas de araña de latón
    for (let i = 0; i < 4; i++) {
      const s = i < 2 ? -1 : 1, k = i % 2, step = anim === 'idle' ? 0 : Math.round(Math.sin(t + i * 1.6) * 2);
      const kx = cx + s * (9 + k * 5), ky = cy - 8 - k * 2, fx = cx + s * (14 + k * 6) + step;
      seg(E, cx + s * 4, cy, kx, ky, 1.4, 1.2, BRASS[1]); seg(E, kx, ky, fx, oy - 1, 1.2, 0.6, BRASS[2]); R(fx - 1, oy - 1, 2, 1, BRASS[3]);
    }
    // cola-péndulo
    const sw = Math.sin(t) * 4; seg(E, cx + 8, cy + 4, cx + 12 + sw, cy + 12, 0.8, 0.6, BRASS[1]); E(cx + 12 + sw, cy + 13, 2.4, 2.4, GOLD[2]);
    gear(R, E, cx, cy, 10, 10, rot, GOLD);
    // ojo en el eje
    E(cx - 1, cy, 4, 4, '#140a04'); E(cx - 2, cy, 2.6, 2.6, '#ff4a3a'); R(cx - 3, cy - 1, 1, 1, '#ffffff');
    if (anim === 'cast') { R(cx - 18, cy - 1, 12, 2, '#ff8a6a'); R(cx - 20, cy, 3, 1, '#ffffff'); }
  }
  function engranajeMayor(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, rot = f * 0.35, lunge = anim === 'attack' ? [3, -10, -3][f] : 0;
    const cx = ox + 4 + lunge, cy = oy - 26 + (anim === 'idle' ? Math.round(Math.sin(t)) : 0);
    const D = ['#1e1206', '#5a3a12', '#9a6a2a', '#d8a850'];
    // patas gruesas
    for (const [dx, ph] of [[-12, 0], [-4, 1], [8, 2], [15, 3]]) { const st = anim === 'idle' ? 0 : Math.round(Math.sin(t + ph) * 2); seg(E, cx + dx * 0.6, cy + 6, cx + dx + st, oy - 2, 2.4, 1.4, D[1]); R(cx + dx + st - 3, oy - 2, 6, 2, D[0]); }
    // engranaje trasero pequeño y delantero grande
    gear(R, E, cx + 10, cy - 10, 7, 8, -rot * 1.6, BRASS);
    gear(R, E, cx, cy, 13, 12, rot, ['#2a1a06', '#a8762a', '#e8b850']);
    // chimeneas de vapor
    R(cx + 14, cy - 2, 4, 8, D[0]); R(cx + 15, cy - 2, 2, 8, D[2]);
    for (let i = 0; i < 3; i++) R(cx + 14 + i, cy - 6 - ((f * 3 + i * 4) % 10), 2, 2, i % 2 ? '#d8d8e0' : '#b0b0c0');
    // brazos-guadaña de minutero
    const sl = anim === 'attack' ? [-6, 10, 4][f] : anim === 'cast' ? -4 : 0;
    seg(E, cx - 8, cy - 4, cx - 18, cy - 14 + sl, 1.6, 1.2, D[1]);
    for (let i = 0; i < 14; i++) R(cx - 18 - i, cy - 15 + sl + Math.round(i * i * 0.05), 2, 2, i < 3 ? D[3] : '#f0e4c0');
    seg(E, cx - 6, cy + 4, cx - 18, cy + 8 - sl * 0.5, 1.4, 1, D[1]);
    for (let i = 0; i < 10; i++) R(cx - 18 - i, cy + 7 - sl * 0.5 + Math.round(i * i * 0.06), 2, 1, '#e0d0a8');
    // cara-esfera en el eje con dos ojos
    E(cx - 1, cy, 6, 6, '#f0e4c4'); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(cx - 1 + Math.cos(a) * 5, cy + Math.sin(a) * 5, 1, 1, '#5a3a12'); }
    R(cx - 4, cy - 2, 2, 2, '#ff3a2a'); R(cx + 1, cy - 2, 2, 2, '#ff3a2a'); R(cx - 3, cy + 2, 4, 1, '#3a2408');
  }
  // polillas: cuerpo peludo, antenas plumosas y alas con dibujo
  function moth(anim, f, R, E, ox, oy, eterna) {
    const t = (f / 4) * Math.PI * 2;
    const flap = anim === 'idle' ? Math.sin(t) : anim === 'attack' ? [0.8, -0.6, 0][f] : anim === 'cast' ? 1 : 0.2;
    const cx = ox + (anim === 'attack' ? [2, -8, -2][f] : 0), cy = oy - 30 + Math.round(Math.sin(t) * 2);
    const W = eterna ? ['#0c0828', '#241a5a', '#3e3a9a', '#7af0ff'] : ['#2a1430', '#5a2a5a', '#8a4a7a', '#ffd27a'];
    const wingSet = (back) => {
      const k = back ? 0.85 : 1, up = flap * 6 * k;
      // ala superior
      const ux = cx + (back ? 7 : 2), uy = cy - 2;
      E(ux + 12 * k, uy - 13 - up, 17 * k, 11 * k, back ? W[0] : W[1]);
      E(ux + 13 * k, uy - 14 - up, 15 * k, 9 * k, back ? W[1] : W[2]);
      E(ux + 22 * k, uy - 20 - up * 1.2, 7 * k, 5 * k, back ? W[0] : W[1]);
      // ala inferior
      E(ux + 9 * k, uy + 8 + up * 0.4, 12 * k, 8 * k, back ? W[0] : W[1]); E(ux + 9 * k, uy + 8 + up * 0.4, 10 * k, 6 * k, back ? W[1] : W[2]);
      E(ux + 15 * k, uy + 15 + up * 0.3, 4 * k, 5 * k, back ? W[0] : W[1]);
      if (!back) {
        // dibujo: esfera de reloj (tiempo) u ojo cósmico (eterna)
        const dx = ux + 13, dy = uy - 14 - up;
        if (!eterna) {
          E(dx, dy, 5, 5, '#f0e2c0'); E(dx, dy, 4, 4, '#f8f0dc');
          for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(dx + Math.cos(a) * 4, dy + Math.sin(a) * 4, 1, 1, '#5a2a5a'); }
          const h = f * 1.57; seg(E, dx, dy, dx + Math.cos(h) * 3, dy + Math.sin(h) * 3, 0.5, 0.5, '#2a1430'); seg(E, dx, dy, dx + Math.cos(h * 0.2 - 1.5) * 2, dy + Math.sin(h * 0.2 - 1.5) * 2, 0.6, 0.6, '#2a1430');
          E(ux + 9, uy + 8 + up * 0.4, 3, 2, W[3]);
        } else {
          E(dx, dy, 5, 4, '#06041a'); E(dx, dy, 3.4, 3, W[3]); E(dx - 1, dy, 1.6, 1.6, '#06041a'); R(dx, dy - 1, 1, 1, '#ffffff');
          E(ux + 9, uy + 8 + up * 0.4, 4, 3, '#06041a'); E(ux + 9, uy + 8 + up * 0.4, 2.4, 1.6, '#ff7ad8');
          for (let i = 0; i < 6; i++) R(ux + 2 + i * 3, uy - 18 - up + (i % 2) * 2, 1, 1, '#d8f8ff');
        }
        // borde festoneado
        for (let i = 0; i < 7; i++) R(ux + 2 + i * 4, uy - 3 - up * 0.3 - (i > 3 ? (i - 3) * 2 : 0), 2, 1, eterna ? '#a0f0ff' : W[3]);
      }
    };
    wingSet(true);
    // cuerpo peludo
    E(cx + 3, cy + 2, 3.4, 7, eterna ? '#1a1440' : '#3a2010'); for (let i = 0; i < 4; i++) R(cx + 1, cy - 2 + i * 3, 5, 1, eterna ? '#5a5aaa' : '#a87a3a');
    E(cx, cy - 5, 4, 3.6, eterna ? '#2a2468' : '#5a3418'); E(cx - 1, cy - 6, 2, 2, eterna ? '#5a5aaa' : '#c89a5a');
    R(cx - 3, cy - 6, 2, 2, eterna ? W[3] : '#ffd23a'); R(cx - 3, cy - 6, 1, 1, '#ffffff');
    // antenas plumosas
    for (const s of [0, 1]) { const ax = cx - 1 + s * 2, ex = ax - 6 + s * 2, ey = cy - 15 - s; seg(E, ax, cy - 8, ex, ey, 0.6, 0.5, eterna ? '#7af0ff' : '#c89a5a'); for (let i = 0; i < 4; i++) R(ex + i * 1.4 - 1, ey + i * 2 - 1, 2, 1, eterna ? '#bff4ff' : '#e8c88a'); }
    wingSet(false);
    if (eterna) { R(cx - 6, cy - 21, 12, 1, '#a0f0ff'); R(cx - 4, cy - 22, 8, 1, '#d8fbff'); R(cx - 7, cy - 20, 2, 1, '#a0f0ff'); R(cx + 5, cy - 20, 2, 1, '#a0f0ff'); }
    // polvo (arena dorada o estrellas)
    for (let i = 0; i < 6; i++) R(cx - 10 + ((i * 11 + f * 3) % 30), cy + 8 + ((i * 7 + f * 5) % 16), 1, 1, eterna ? '#bff4ff' : '#ffe08a');
  }
  const polilla = (a, f, R, E, ox, oy) => moth(a, f, R, E, ox, oy, false);
  const polillaE = (a, f, R, E, ox, oy) => moth(a, f, R, E, ox, oy, true);

  // sombras: espectros del Fondo
  function sombra(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, rise = anim === 'attack' ? [2, -4, 0][f] : anim === 'cast' ? -3 : 0;
    const lunge = anim === 'attack' ? [2, -9, -3][f] : 0, cx = ox + 2 + lunge, cy = oy - 32 + rise;
    const S = ['#05030c', '#140c26', '#2a1a48', '#5a3a8a'], GL = '#b07aff';
    // charco negro
    E(ox, oy - 2, 15, 3, S[0]); E(ox - 2, oy - 2, 10, 2, S[1]); R(ox - 8, oy - 3, 3, 1, GL);
    // cuerpo de humo que sube del charco
    for (let i = 0; i < 9; i++) { const k = i / 8, w = 10 - k * 2 + Math.sin(t + i) * 1.2; E(cx + Math.sin(t + i * 0.8) * 1.5, oy - 4 - k * 28 + rise * k, w, 4, i % 2 ? S[1] : S[0]); }
    // jirones
    for (let i = 0; i < 5; i++) seg(E, cx + 4 + i * 2, cy + 4 + i * 3, cx + 12 + i * 3 + Math.sin(t + i) * 2, cy + 1 + i * 4, 1.4, 0.4, S[1]);
    // torso encorvado y cabeza
    E(cx, cy, 11, 9, S[0]); E(cx - 1, cy - 1, 9, 7, S[2]); E(cx - 7, cy - 10, 7, 6, S[0]); E(cx - 8, cy - 11, 6, 5, S[1]); seg(E, cx - 4, cy - 15, cx + 2, cy - 22, 1.4, 0.5, S[1]); seg(E, cx - 10, cy - 15, cx - 14, cy - 22, 1.4, 0.5, S[1]);
    R(cx - 12, cy - 12, 3, 2, '#ffffff'); R(cx - 7, cy - 12, 3, 2, '#ffffff'); R(cx - 11, cy - 8, 6, 2, '#000000'); R(cx - 10, cy - 8, 1, 1, '#d8c8ff'); R(cx - 7, cy - 8, 1, 1, '#d8c8ff');
    E(cx, cy + 1, 2.4, 2.4, GL); R(cx, cy, 1, 1, '#ffffff');
    // brazos largos con garras hacia los héroes
    const reach = anim === 'attack' && f === 1 ? 8 : 0;
    for (const [dy, l] of [[-2, 16], [4, 13]]) {
      const ex = cx - 6 - l - reach, ey = cy + dy + 6;
      seg(E, cx - 5, cy + dy, ex, ey, 2, 1, S[1]);
      for (const [fx, fy] of [[-5, -2], [-5, 1], [-4, 4]]) { seg(E, ex, ey, ex + fx, ey + fy, 0.8, 0.4, S[2]); R(ex + fx - 1, ey + fy, 1, 1, '#d8c8ff'); }
    }
  }
  function sombraAbisal(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, rise = anim === 'attack' ? [3, -5, 0][f] : anim === 'cast' ? -4 : 0;
    const lunge = anim === 'attack' ? [2, -10, -3][f] : 0, cx = ox + 4 + lunge, cy = oy - 34 + rise;
    const S = ['#030208', '#0c0a1c', '#1c1a3a', '#3a3a6a'], GL = '#5af0d8', GL2 = '#c05aff';
    E(ox, oy - 2, 18, 3.4, S[0]); for (let i = 0; i < 6; i++) { const x = ox - 16 + i * 6, w = Math.sin(t + i) * 3; seg(E, x, oy - 2, x - 3 + w, oy - 12 - (i % 3) * 4, 1.6, 0.5, S[1]); R(x - 3 + w, oy - 13 - (i % 3) * 4, 1, 1, GL); }
    // manto encapuchado
    for (let y = cy - 14; y < oy - 3; y++) { const k = (y - (cy - 14)) / (oy - 3 - (cy - 14)), w = Math.round(12 + k * 10 + Math.sin(t + y * 0.3) * 1.5); R(cx - w / 2, y, w, 1, k > 0.85 ? S[0] : S[1]); R(cx - w / 2, y, 2, 1, S[0]); }
    for (let i = 0; i < 5; i++) R(cx - 10 + i * 5, oy - 6 - (i % 2) * 2, 2, 4, S[0]);
    // cuernos
    seg(E, cx - 4, cy - 18, cx - 14, cy - 30, 2, 0.6, S[2]); seg(E, cx + 4, cy - 18, cx + 10, cy - 32, 2, 0.6, S[2]); seg(E, cx, cy - 20, cx - 3, cy - 33, 1.6, 0.5, S[3]);
    // capucha y cara de muchos ojos
    E(cx, cy - 14, 10, 9, S[0]); E(cx - 1, cy - 14, 8, 7, '#000000');
    for (const [dx, dy] of [[-5, -17], [-1, -18], [3, -17], [-6, -13], [2, -13], [-3, -10]]) { R(cx + dx, cy + dy, 2, 1, GL); R(cx + dx, cy + dy, 1, 1, '#ffffff'); }
    // boca vertical
    const mo = anim === 'attack' && f === 1 ? 3 : anim === 'cast' ? 2 : 1;
    R(cx - 2, cy - 9, 2 + mo, 7, '#2a0418'); for (let i = 0; i < 3; i++) { R(cx - 2, cy - 8 + i * 2, 1, 1, '#f0e0ff'); R(cx - 1 + mo, cy - 7 + i * 2, 1, 1, '#f0e0ff'); }
    // núcleo y venas
    E(cx, cy + 4, 3, 3, GL2); R(cx, cy + 3, 1, 1, '#ffffff'); seg(E, cx, cy + 4, cx - 6, cy + 12, 0.6, 0.4, GL2); seg(E, cx, cy + 4, cx + 6, cy + 14, 0.6, 0.4, GL2);
    // garras
    const reach = anim === 'attack' && f === 1 ? 10 : 0;
    for (const [dy, l] of [[-4, 18], [4, 15]]) { const ex = cx - 8 - l - reach, ey = cy + dy + 4; seg(E, cx - 8, cy + dy, ex, ey, 2.4, 1.2, S[1]); for (const [fx, fy] of [[-6, -3], [-6, 1], [-5, 5]]) { seg(E, ex, ey, ex + fx, ey + fy, 0.9, 0.4, S[3]); R(ex + fx - 1, ey + fy, 1, 1, GL); } }
  }

  // ---- Cronoguardia ----
  function crono(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, hov = Math.round(Math.sin(t) * 2), cast = anim === 'cast' ? 1 : 0, lean = anim === 'attack' ? [0, -5, -2][f] : anim === 'hurt' ? 3 : 0;
    const G = ['#2a1a06', '#7a5418', '#c8962e', '#f4d27a', '#fff2c0'], STONE = ['#2a2a3a', '#4a4a64', '#7a7a9a'];
    const cx = ox + 4 + lean, base = oy - 6 + hov;
    // sombra de levitación y arena que cae
    for (let i = 0; i < 6; i++) R(cx - 12 + i * 5, oy - 2 - ((f * 4 + i * 5) % 12), 1, 2, G[3]);
    // alas de medios engranajes con cuchillas
    for (const s of [1, -1]) {
      const wx = cx + s * 8, wy = base - 70;
      for (let i = 0; i < 5; i++) {
        const a = (s > 0 ? -0.9 : Math.PI + 0.9) + s * (i * 0.32) - (cast ? s * 0.2 : 0), L = 34 - i * 3;
        seg(E, wx, wy, wx + Math.cos(a) * L, wy + Math.sin(a) * L, 2.6, 0.8, i % 2 ? G[1] : G[2]);
        R(wx + Math.cos(a) * L - 1, wy + Math.sin(a) * L - 1, 2, 2, G[4]);
      }
      gear(R, E, wx, wy, 7, 9, f * 0.3 * s, [G[0], G[1], G[2]]);
    }
    // falda-campana
    for (let y = base - 36; y <= base; y++) {
      const k = (y - (base - 36)) / 36, w = Math.round(20 + k * k * 30), x = Math.round(cx - w / 2);
      R(x, y, w, 1, G[1]); R(x, y, 3, 1, G[0]); R(x + w - 5, y, 4, 1, G[2]);
    }
    R(cx - 25, base - 3, 50, 3, G[3]); R(cx - 24, base - 1, 48, 1, G[0]);
    for (let i = 0; i < 7; i++) R(cx - 21 + i * 7, base - 10, 2, 6, G[2]);
    // badajo bajo la campana
    E(cx + Math.sin(t) * 3, base + 4, 3, 3, G[3]);
    // torso: caja de reloj con péndulo visible
    const ty = base - 58;
    R(cx - 15, ty - 18, 30, 40, G[0]); R(cx - 14, ty - 17, 28, 38, G[2]); R(cx - 14, ty - 17, 3, 38, G[3]);
    R(cx - 9, ty - 10, 18, 26, '#120c04');
    const pa = Math.sin(t) * 0.5, px = cx + Math.sin(pa) * 12, py = ty - 8 + Math.cos(pa) * 18;
    seg(E, cx, ty - 8, px, py, 0.7, 0.7, G[3]); E(px, py, 4, 4, G[2]); E(px - 1, py - 1, 2, 2, G[4]);
    for (let i = 0; i < 4; i++) R(cx - 13, ty - 14 + i * 9, 26, 1, G[1]);
    // reloj de arena en el cinturón
    R(cx - 4, ty + 18, 8, 2, G[3]); R(cx - 3, ty + 20, 6, 2, '#bfe8ff'); R(cx - 1, ty + 22, 2, 1, '#ffe08a'); R(cx - 3, ty + 23, 6, 2, '#ffe08a'); R(cx - 4, ty + 25, 8, 2, G[3]);
    // hombros-anillo (las agujas son piezas aparte)
    for (const s of [-1, 1]) { E(cx + s * 18, ty - 14, 7, 7, G[0]); E(cx + s * 18, ty - 14, 6, 6, G[2]); E(cx + s * 18, ty - 14, 3, 3, '#120c04'); R(cx + s * 18 - 1, ty - 15, 2, 2, '#7af4ff'); }
    // cabeza: yelmo con visor-esfera de reloj
    const hy = ty - 34 - cast * 2;
    E(cx, hy, 13, 13, G[0]); E(cx, hy, 12, 12, G[2]); E(cx - 3, hy - 3, 6, 6, G[3]);
    E(cx - 1, hy + 1, 9, 9, '#f6eedc'); E(cx - 1, hy + 1, 8, 8, '#fffaf0');
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(cx - 1 + Math.cos(a) * 7, hy + 1 + Math.sin(a) * 7, i % 3 ? 1 : 2, 1, '#3a2408'); }
    const hh = f * 1.5707 - 1.57, mm = f * 0.5 - 2.4;
    seg(E, cx - 1, hy + 1, cx - 1 + Math.cos(hh) * 6, hy + 1 + Math.sin(hh) * 6, 0.7, 0.5, '#1a1006'); seg(E, cx - 1, hy + 1, cx - 1 + Math.cos(mm) * 4, hy + 1 + Math.sin(mm) * 4, 0.9, 0.7, '#7a1a1a');
    E(cx - 1, hy + 1, 1.2, 1.2, '#7a1a1a');
    // ojos que brillan sobre la esfera
    R(cx - 6, hy - 2, 3, 1, '#7af4ff'); R(cx + 2, hy - 2, 3, 1, '#7af4ff');
    // cresta de agujas
    for (let i = 0; i < 5; i++) seg(E, cx - 6 + i * 3, hy - 11, cx - 10 + i * 5, hy - 22 - (i === 2 ? 5 : 0), 1, 0.5, G[3]);
    E(cx, hy - 26, 2, 2, '#7af4ff');
    if (cast) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f; R(cx + Math.cos(a) * 20, hy + Math.sin(a) * 20, 2, 2, '#bff4ff'); }
  }
  // Aguja: manecilla gigante flotante con flor de lis y engranaje
  function aguja(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, hov = Math.round(Math.sin(t) * 2);
    const swing = anim === 'attack' ? [-0.5, 0.6, 0.2][f] : anim === 'cast' ? -0.3 : Math.sin(t) * 0.08;
    const G = ['#2a1a06', '#7a5418', '#c8962e', '#f4d27a', '#fff2c0'];
    const gx = ox + 18, gy = oy - 24 + hov;
    const a = Math.PI + 0.1 + swing, L = 46, tx = gx + Math.cos(a) * L, ty = gy + Math.sin(a) * L;
    // hoja
    seg(E, gx, gy, tx, ty, 4.4, 2, G[0]); seg(E, gx, gy, tx, ty, 3.2, 1.3, G[2]); seg(E, gx, gy - 1, tx, ty - 1, 1, 0.5, G[4]);
    // calado del medio
    const mx = gx + Math.cos(a) * 22, my = gy + Math.sin(a) * 22; E(mx, my, 5, 4, G[0]); E(mx, my, 3.2, 2.2, '#120c04'); E(mx, my, 1.4, 1.4, '#7af4ff');
    // flor de lis
    E(tx, ty, 3, 3, G[3]); seg(E, tx, ty, tx + Math.cos(a) * 7, ty + Math.sin(a) * 7, 2, 0.4, G[3]);
    seg(E, tx, ty, tx + Math.cos(a + 1.2) * 5, ty + Math.sin(a + 1.2) * 5, 1.4, 0.4, G[2]); seg(E, tx, ty, tx + Math.cos(a - 1.2) * 5, ty + Math.sin(a - 1.2) * 5, 1.4, 0.4, G[2]);
    // contrapeso
    seg(E, gx, gy, gx - Math.cos(a) * 9, gy - Math.sin(a) * 9, 2, 1, G[1]); E(gx - Math.cos(a) * 10, gy - Math.sin(a) * 10, 3, 3, G[2]);
    gear(R, E, gx, gy, 9, 10, f * 0.5, [G[0], G[1], G[2]]); E(gx, gy, 3, 3, '#7af4ff'); E(gx, gy, 1.4, 1.4, '#ffffff');
    // runas de luz que dejan estela
    for (let i = 0; i < 3; i++) R(tx - 4 + i * 5, ty + 6 + i, 1, 1, '#bff4ff');
  }

  // ================= CAPÍTULO 5 · el Primer Abisal =================
  function abisalBody(anim, f, R, E, ox, oy, rot) {
    const t = (f / 4) * Math.PI * 2, sway = Math.sin(t) * 2;
    const rear = anim === 'attack' ? [4, -6, -2][f] : anim === 'cast' ? -5 : anim === 'hurt' ? 4 : 0;
    const P = rot ? ['#06040a', '#1a0e14', '#34182a', '#5a2a40'] : ['#03040c', '#0c1424', '#18263e', '#2c4060'];
    const VEIN = rot ? '#ff3a5a' : '#5af0d8', VEIN2 = rot ? '#ff9a4a' : '#b07aff', EYE = rot ? '#ff2a2a' : '#c8ff5a';
    const cx = ox + 4, wl = oy - 8;
    // tentáculos que salen del agua negra (detrás)
    for (let i = 0; i < 4; i++) {
      const x0 = cx + 18 + i * 8, w = Math.sin(t + i * 1.3) * 5;
      seg(E, x0, wl, x0 + 6 + w, wl - 30 - i * 6, 4, 1.2, P[1]);
      seg(E, x0 + 6 + w, wl - 30 - i * 6, x0 + w - 2, wl - 40 - i * 7, 1.2, 0.5, P[1]);
      for (let k = 0; k < 4; k++) R(x0 + 1 + w * (k / 4) + k, wl - 6 - k * 7, 1, 1, VEIN);
    }
    // cuerpo-columna que emerge, con placas y venas
    const top = wl - 74 + rear;
    for (let y = top; y < wl; y++) {
      const k = (y - top) / (wl - top), w = Math.round(22 + k * 18 + Math.sin(y * 0.2 + t) * 1.2), x = Math.round(cx - w / 2 + sway * (1 - k));
      R(x, y, w, 1, P[1]); R(x, y, 3, 1, P[0]); R(x + w - 4, y, 3, 1, P[2]);
    }
    for (let i = 0; i < 6; i++) { const y = top + 16 + i * 9; E(cx + sway * 0.6 - 2, y, 12 - i * 0.4, 3, P[2]); R(cx - 12 + sway * 0.6, y - 1, 20, 1, P[3]); }
    seg(E, cx - 6, top + 18, cx - 2, wl - 4, 0.7, 0.6, VEIN); seg(E, cx + 8, top + 22, cx + 10, wl - 6, 0.7, 0.6, VEIN2);
    // algas colgantes
    for (let i = 0; i < 5; i++) R(cx - 16 + i * 8, top + 30 + (i % 2) * 6, 2, 8 + (i % 3) * 3, rot ? '#3a1a10' : '#1a3a2a');
    // cabeza: cráneo enorme con cuernos y seis ojos
    const hx = cx - 12 + sway, hy = top - 2;
    for (const [a, b, c, d] of [[8, -10, 22, -34], [14, -8, 34, -22], [-2, -12, 2, -36], [20, -4, 40, -8]]) { seg(E, hx + a, hy + b, hx + c, hy + d, 3.2, 0.8, P[2]); R(hx + c - 1, hy + d - 1, 2, 2, P[3]); }
    E(hx + 6, hy, 22, 16, P[0]); E(hx + 5, hy - 1, 21, 15, P[1]); E(hx + 8, hy - 6, 14, 7, P[2]); R(hx - 6, hy - 10, 24, 1, P[3]);
    for (const [dx, dy, r] of [[-8, -6, 2.4], [-2, -9, 2.6], [5, -7, 2.2], [-10, 0, 2], [-3, -2, 2.2], [4, -1, 1.8]]) {
      E(hx + dx, hy + dy, r + 1.4, r + 0.6, '#000000'); E(hx + dx, hy + dy, r + 0.4, r, EYE); R(hx + dx - 1, hy + dy - 1, 1, 1, '#ffffff');
    }
    // fauces de agujas con garganta brillante
    const op = anim === 'attack' && f === 1 ? 12 : anim === 'cast' ? 10 : 6 + (f % 2);
    R(hx - 20, hy + 5, 26, 4, P[1]); R(hx - 20, hy + 8 + op, 24, 5, P[0]);
    R(hx - 18, hy + 9, 20, op, '#0a0004'); E(hx - 6, hy + 9 + op / 2, 6, Math.max(1, op / 2 - 1), VEIN2); E(hx - 6, hy + 9 + op / 2, 3, Math.max(1, op / 3), '#ffffff');
    for (let i = 0; i < 8; i++) { R(hx - 18 + i * 2.6, hy + 9, 1, 4 + (i % 2) * 3, '#e8e0ff'); R(hx - 17 + i * 2.6, hy + 4 + op - (i % 2) * 2, 1, 4 + ((i + 1) % 2) * 3, '#e8e0ff'); }
    // señuelo bioluminiscente que cuelga sobre las fauces
    seg(E, hx - 4, hy - 12, hx - 22, hy - 16 + sway, 1, 0.6, P[2]); seg(E, hx - 22, hy - 16 + sway, hx - 24, hy - 6 + sway, 0.6, 0.5, P[2]); E(hx - 24, hy - 4 + sway, 3, 3, VEIN); E(hx - 25, hy - 5 + sway, 1.4, 1.4, '#ffffff');
    // agua negra en la base con espuma
    E(cx + 6, wl + 2, 52, 7, '#020208'); E(cx + 6, wl, 46, 4, P[0]);
    for (let i = 0; i < 9; i++) R(cx - 40 + i * 10 + ((f * 3) % 6), wl - 1 + (i % 2), 5, 1, rot ? '#5a3a4a' : '#3a5a7a');
    for (let i = 0; i < 5; i++) R(cx - 30 + ((i * 17 + f * 7) % 70), wl - 20 - ((i * 13 + f * 6) % 50), 1, 1, VEIN);
  }
  const abisal = (a, f, R, E, ox, oy) => abisalBody(a, f, R, E, ox, oy, false);
  const abisal2 = (a, f, R, E, ox, oy) => abisalBody(a, f, R, E, ox, oy, true);

  TH.foePaint('engranaje', engranaje, [68, 56, 34, 52], '#120a02', [12, 3]);
  TH.foePaint('engranaje_mayor', engranajeMayor, [84, 66, 42, 62], '#0e0802', [16, 4]);
  TH.foePaint('polilla', polilla, [84, 76, 38, 72], '#140818', [9, 2]);
  TH.foePaint('polilla_eterna', polillaE, [88, 80, 40, 76], '#04021a', [10, 2]);
  TH.foePaint('sombra', sombra, [72, 72, 38, 68], '#000000', [14, 3]);
  TH.foePaint('sombra_abisal', sombraAbisal, [84, 80, 44, 76], '#000000', [18, 4]);
  TH.foePaint('crono', crono, [150, 150, 75, 146], '#140c02', [30, 6]);
  TH.foePaint('aguja', aguja, [92, 64, 56, 60], '#140c02', [12, 2]);
  TH.foePaint('abisal', abisal, [150, 132, 75, 128], '#000000', [48, 8]);
  TH.foePaint('abisal2', abisal2, [150, 132, 75, 128], '#000000', [48, 8]);
  const E0 = TH.data.enemies;
  if (E0.abisal) Object.assign(E0.abisal, { scale: 1, zoom: 1.1, camY: 14, markH: 110 });
  if (E0.abisal_eco) Object.assign(E0.abisal_eco, { scale: 1, zoom: 1.1, camY: 14, markH: 110 });
  if (E0.cronoguardia) Object.assign(E0.cronoguardia, { zoom: 1.05, camY: 18, markH: 130 });
})();
