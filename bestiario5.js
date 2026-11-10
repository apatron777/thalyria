// Diseños propios del capítulo 7 (Aldea de los Faroleros y Torre del Motor). Miran a la izquierda.
// · Farol errante: farol de papel y cristal que flota, con una llama-ojo, alas de papel y cadena colgando.
// · Farol corrupto: farol de hierro negro agrietado con llama violeta del Fondo, cara de calavera y zarcillos.
// · Guardián de marea: caballero de coral y conchas con tridente y escudo-caracola; gotea agua.
// · Guardián del abismo: caballero negro de runas violetas, yelmo de rape con señuelo y alabarda.
// · Coloso de guerra: máquina de asedio de hierro y bronce con cabina de cristal (Varek dentro), cañón al hombro,
//   chimeneas y núcleo del Fondo. Fase 2: placas rotas, cristal agrietado, chispas y fuego violeta.
// · Puño: puño mecánico con nudillos de púas sobre un pistón.
(function () {
  'use strict';
  const TH = window.TH;
  const seg = (E, x0, y0, x1, y1, r0, r1, c) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.4));
    for (let i = 0; i <= n; i++) { const k = i / n, r = r0 + (r1 - r0) * k; E(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
  };

  // ---------------- faroles ----------------
  function lantern(anim, f, R, E, ox, oy, bad) {
    const t = (f / 4) * Math.PI * 2, bob = Math.round(Math.sin(t) * 2);
    const lunge = anim === 'attack' ? [2, -9, -3][f] : 0, cx = ox + lunge, cy = oy - 30 + bob;
    const FR = bad ? ['#14101a', '#2a2430', '#46404e'] : ['#5a2a10', '#a8582a', '#e08a4a'];
    const GL = bad ? ['#3a0a5a', '#8a2ae0', '#d08aff', '#ffffff'] : ['#c83a10', '#ff9a2a', '#ffe27a', '#fffbe0'];
    const PAPER = bad ? '#2a2034' : '#f4d8a0';
    // cadena o zarcillos colgando
    if (bad) for (let i = 0; i < 4; i++) seg(E, cx - 4 + i * 3, cy + 10, cx - 6 + i * 3 + Math.sin(t + i) * 3, cy + 20 + (i % 2) * 4, 1, 0.4, '#140c1c');
    else for (let i = 0; i < 4; i++) R(cx - 1 + Math.round(Math.sin(t + i * 0.8)), cy + 11 + i * 3, 2, 2, i % 2 ? '#7a5a3a' : '#a8804a');
    // alas de papel (bueno) o jirones (corrupto)
    const wf = anim === 'idle' ? Math.sin(t * 2) * 3 : 2;
    for (const s of [1, -1]) {
      if (!bad) { E(cx + s * 11, cy - 2 - wf, 6, 3, '#d8b880'); E(cx + s * 11, cy - 3 - wf, 5, 2, PAPER); R(cx + s * 8, cy - 2 - wf, s * 6, 1, '#a8804a'); }
      else for (let k = 0; k < 3; k++) seg(E, cx + s * 7, cy - 4 + k * 3, cx + s * (14 + k * 2), cy - 8 + k * 4 + wf, 1, 0.4, '#1a1022');
    }
    // asa y tejadillo
    R(cx - 2, cy - 16, 4, 2, FR[0]); E(cx, cy - 18, 3, 2, FR[1]); R(cx - 1, cy - 19, 2, 1, FR[2]);
    for (let i = 0; i < 5; i++) R(cx - 9 + i, cy - 12 - i, 18 - i * 2, 1, i % 2 ? FR[1] : FR[2]);
    // cuerpo del farol
    R(cx - 8, cy - 11, 16, 20, FR[0]); R(cx - 7, cy - 10, 14, 18, PAPER);
    E(cx, cy - 1, 6, 8, GL[0]); E(cx, cy - 1, 5, 6, GL[1]);
    for (let i = 0; i < 3; i++) R(cx - 7, cy - 6 + i * 6, 14, 1, FR[1]);
    R(cx - 8, cy - 11, 1, 20, FR[2]); R(cx + 7, cy - 11, 1, 20, FR[0]);
    R(cx - 9, cy + 8, 18, 2, FR[1]); R(cx - 9, cy + 8, 18, 1, FR[2]);
    // llama-ojo
    const fl = 2 + (f % 2);
    E(cx, cy, 3, 4 + fl * 0.3, GL[2]); E(cx, cy + 1, 2, 2, GL[3]);
    if (bad) {
      R(cx - 4, cy - 4, 3, 2, '#000000'); R(cx + 1, cy - 4, 3, 2, '#000000'); R(cx - 3, cy + 2, 6, 1, '#000000'); for (let i = 0; i < 3; i++) R(cx - 3 + i * 2, cy + 3, 1, 1, '#000000');
      R(cx - 6, cy - 9, 1, 6, '#0a0610'); R(cx + 4, cy - 2, 1, 7, '#0a0610'); R(cx + 3, cy + 4, 3, 1, '#0a0610'); // grietas
    } else { R(cx - 1, cy - 1, 2, 2, '#3a1a08'); R(cx - 1, cy - 1, 1, 1, '#ffffff'); }
    for (let i = 0; i < 4; i++) R(cx - 10 + ((i * 7 + f * 3) % 20), cy - 20 - ((i * 5 + f * 4) % 10), 1, 1, GL[2]);
    if (anim === 'cast') for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; R(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 1, 1, GL[2]); }
  }
  const farolE = (a, f, R, E, ox, oy) => lantern(a, f, R, E, ox, oy, false);
  const farolC = (a, f, R, E, ox, oy) => lantern(a, f, R, E, ox, oy, true);

  // ---------------- guardianes ----------------
  function guardian(anim, f, R, E, ox, oy, abyss) {
    const t = (f / 4) * Math.PI * 2, bob = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const thrust = anim === 'attack' ? [4, -14, -4][f] : 0, cx = ox + 4, cy = oy - 26 - bob;
    const A = abyss ? ['#06060c', '#14142a', '#262646', '#3e3e6a'] : ['#0a2a2e', '#1a5a5a', '#2e8a86', '#5ac0b0'];
    const ACC = abyss ? '#b06aff' : '#ff8a8a', GL = abyss ? '#c88aff' : '#bff4ff', S = abyss ? 1.12 : 1;
    // piernas
    for (const lx of [cx - 5, cx + 5]) { R(lx - 3, cy + 12, 6, 13 + bob, A[1]); R(lx - 2, cy + 12, 2, 13 + bob, A[3]); R(lx - 5, oy - 3, 9, 3, A[0]); R(lx - 5, oy - 3, 9, 1, A[2]); }
    // capa / aletas a la espalda
    for (let i = 0; i < 4; i++) R(cx + 6 + i * 2, cy - 4, 2, 24 - i * 3, abyss ? '#1a0a2a' : '#1a4a6a');
    // torso de placas (conchas o placas negras)
    E(cx, cy + 2, 11 * S, 13 * S, A[0]); E(cx - 1, cy + 1, 10 * S, 12 * S, A[2]); E(cx - 3, cy - 2, 5, 6, A[3]);
    for (let i = 0; i < 3; i++) { E(cx - 2, cy - 4 + i * 6, 8, 2, A[1]); R(cx - 8, cy - 4 + i * 6, 14, 1, A[3]); }
    if (!abyss) { E(cx + 4, cy + 8, 3, 2, '#ff9a9a'); E(cx - 6, cy - 6, 2, 2, '#ffc0c0'); E(cx + 6, cy - 6, 2, 3, '#ff8a8a'); }
    else { seg(E, cx - 6, cy - 8, cx + 2, cy + 6, 0.6, 0.5, ACC); seg(E, cx + 6, cy - 6, cx - 2, cy + 10, 0.6, 0.5, ACC); }
    // yelmo
    const hy = cy - 16;
    E(cx - 1, hy, 7, 7, A[0]); E(cx - 2, hy - 1, 6, 6, A[2]);
    R(cx - 9, hy - 1, 8, 2, '#000000'); R(cx - 8, hy - 1, 3, 1, GL); R(cx - 4, hy - 1, 2, 1, GL);
    if (abyss) {
      // yelmo de rape con señuelo y dientes
      seg(E, cx, hy - 6, cx - 10, hy - 14, 1, 0.6, A[2]); seg(E, cx - 10, hy - 14, cx - 14, hy - 8, 0.6, 0.5, A[2]); E(cx - 14, hy - 6, 2.4, 2.4, ACC); R(cx - 15, hy - 7, 1, 1, '#ffffff');
      for (let i = 0; i < 4; i++) R(cx - 9 + i * 2, hy + 2, 1, 2, '#e8e0ff');
      for (let i = 0; i < 3; i++) seg(E, cx + 2 + i * 2, hy - 5, cx + 5 + i * 3, hy - 12 - i, 1, 0.4, A[3]);
    } else {
      // cresta de aleta y corales
      for (let i = 0; i < 5; i++) R(cx - 3 + i * 2, hy - 8 - (i % 2) * 2 - (i === 2 ? 2 : 0), 2, 3 + (i % 2), '#ff7a8a');
      R(cx + 4, hy - 4, 3, 2, '#ffb0b0');
    }
    // escudo
    const sx = cx - 10, sy = cy + 4;
    if (!abyss) { E(sx, sy, 7, 9, '#c8a07a'); E(sx - 1, sy - 1, 6, 8, '#f0d8b8'); E(sx + 1, sy + 4, 3, 3, '#e8b890'); E(sx + 1, sy + 4, 1.6, 1.6, '#c8906a'); for (let i = 0; i < 4; i++) { const a = -1.2 + i * 0.8; seg(E, sx + 2, sy + 6, sx + 2 + Math.cos(a) * 7, sy + 6 - Math.sin(a + 1.6) * 10, 0.5, 0.5, '#c8906a'); } }
    // arma: tridente o alabarda
    const wx = cx - 6 + thrust, wy = cy - 2;
    R(wx - 22, wy, 30, 2, abyss ? '#2a2a3a' : '#7a5a3a'); R(wx - 22, wy, 30, 1, abyss ? '#4a4a6a' : '#a8804a');
    if (!abyss) { R(wx - 26, wy - 6, 3, 14, '#c8c8d8'); for (const d of [-6, 0, 6]) { R(wx - 34, wy + d, 9, 2, '#e8e8f0'); R(wx - 36, wy + d, 2, 1, '#ffffff'); R(wx - 34, wy + d + (d < 0 ? 2 : d > 0 ? -1 : 2), 2, 1, '#e8e8f0'); } }
    else { E(wx - 25, wy, 5, 7, '#3a3a5a'); E(wx - 26, wy, 3, 5, '#5a5a8a'); R(wx - 32, wy - 1, 6, 3, '#6a6a9a'); R(wx - 26, wy - 8, 1, 4, ACC); }
    // goteo de agua / niebla
    for (let i = 0; i < 4; i++) R(cx - 8 + i * 5, cy + 14 + ((f * 3 + i * 5) % 10), 1, 2, abyss ? '#3a2a5a' : '#8ae0f0');
  }
  const guardM = (a, f, R, E, ox, oy) => guardian(a, f, R, E, ox, oy, false);
  const guardA = (a, f, R, E, ox, oy) => guardian(a, f, R, E, ox, oy, true);

  // ---------------- Coloso de guerra (Varek a los mandos) ----------------
  function warBody(anim, f, R, E, ox, oy, broken) {
    const t = (f / 4) * Math.PI * 2, hum = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const lean = anim === 'attack' ? [0, -6, -2][f] : anim === 'hurt' ? 3 : 0, cast = anim === 'cast' ? 1 : 0;
    const I = ['#14121a', '#2e2a38', '#4a4656', '#706a80'], BZ = ['#3a2410', '#7a5428', '#b8843a', '#e8c070'];
    const CORE = broken ? ['#ffffff', '#e0a0ff', '#a03aff', '#5a0aa0'] : ['#ffffff', '#c0a0ff', '#8a4aff', '#3a1a8a'];
    const cx = ox + 4 + lean, base = oy;
    // patas de araña mecánica (cuatro)
    for (const [dx, k] of [[-30, 0], [-14, 1], [14, 2], [30, 3]]) {
      const st = anim === 'idle' ? 0 : Math.round(Math.sin(t + k) * 2), kx = cx + dx * 0.6, ky = base - 34, fx = cx + dx + st;
      seg(E, kx, ky, cx + dx * 1.1, base - 22, 3.4, 3, I[1]); seg(E, cx + dx * 1.1, base - 22, fx, base - 2, 3, 2, I[2]);
      E(cx + dx * 1.1, base - 22, 3.6, 3.6, BZ[2]); R(fx - 5, base - 3, 10, 3, I[0]); R(fx - 6, base - 1, 2, 1, '#9a9aaa'); R(fx + 4, base - 1, 2, 1, '#9a9aaa');
    }
    // casco principal
    const ty = base - 56 - hum;
    E(cx, ty, 34, 22, I[0]); E(cx - 1, ty - 1, 33, 21, I[1]); E(cx - 8, ty - 8, 20, 11, I[2]);
    for (let i = 0; i < 4; i++) R(cx - 30, ty - 10 + i * 7, 60, 1, I[0]);
    for (let i = 0; i < 12; i++) R(cx - 28 + i * 5, ty + 16, 2, 2, BZ[3]);
    // púas del blindaje
    for (let i = 0; i < 7; i++) seg(E, cx - 24 + i * 8, ty - 18, cx - 26 + i * 8, ty - 28 - (i % 2) * 4, 2, 0.5, I[3]);
    // emblema de la Guardia tachado
    E(cx + 18, ty - 2, 5, 5, BZ[1]); E(cx + 18, ty - 2, 3, 3, BZ[3]); seg(E, cx + 13, ty - 7, cx + 23, ty + 3, 0.7, 0.6, CORE[2]);
    // núcleo del Fondo
    E(cx + 4, ty + 6, 8, 7, I[0]); E(cx + 4, ty + 6, 6, 5, CORE[3]); E(cx + 4, ty + 6, 4, 3, CORE[2]); E(cx + 3, ty + 5, 2, 1.6, CORE[0]);
    for (let i = 0; i < 4; i++) { const a = f * 0.6 + i * 1.57; R(cx + 4 + Math.cos(a) * 8, ty + 6 + Math.sin(a) * 6, 1, 1, CORE[1]); }
    // cabina de cristal con Varek
    const kx = cx - 14, ky = ty - 12;
    E(kx, ky, 13, 11, BZ[0]); E(kx, ky, 12, 10, BZ[2]); E(kx - 1, ky - 1, 10, 8, broken ? '#2a3a4a' : '#4a7a9a'); E(kx - 4, ky - 4, 3, 2, '#bfe4f4');
    R(kx - 3, ky - 3, 4, 5, '#2a1a10'); E(kx - 1, ky - 5, 2, 2, '#8a5a3a'); R(kx - 3, ky - 7, 4, 2, '#1a1a1a'); R(kx - 2, ky - 5, 1, 1, '#ff3a5a'); // Varek
    R(kx - 7, ky - 5, 3, 1, '#d8f0ff'); R(kx - 6, ky - 6, 2, 1, '#ffffff');
    if (broken) { seg(E, kx - 6, ky - 4, kx + 2, ky + 3, 0.5, 0.5, '#e8f4ff'); seg(E, kx + 2, ky - 5, kx - 2, ky + 1, 0.5, 0.5, '#e8f4ff'); }
    // ojo-faro frontal
    E(kx - 12, ky + 6, 4, 3, I[0]); E(kx - 12, ky + 6, 3, 2, broken ? '#ff3a3a' : '#ffd23a'); R(kx - 15 - (f % 2) * 3, ky + 5, 3, 2, broken ? '#ff8a8a' : '#fff0a0');
    // cañón al hombro
    const gx = cx + 12, gy = ty - 36 - cast * 3;
    R(gx - 2, gy + 4, 16, 12, I[1]); R(gx - 2, gy + 4, 16, 2, I[3]); E(gx + 6, gy + 10, 4, 4, BZ[2]);
    R(gx - 40, gy, 40, 9, BZ[0]); R(gx - 40, gy + 1, 40, 6, BZ[1]); R(gx - 40, gy + 1, 40, 2, BZ[3]); R(gx - 46, gy - 2, 8, 13, BZ[0]); R(gx - 45, gy - 1, 6, 11, BZ[2]); E(gx - 46, gy + 4, 2, 4, '#000000');
    for (let i = 0; i < 4; i++) R(gx - 34 + i * 8, gy, 2, 9, BZ[0]);
    if (anim === 'attack' && f === 1) { E(gx - 52, gy + 4, 7, 6, '#ffe27a'); E(gx - 52, gy + 4, 4, 3, '#ffffff'); }
    // chimeneas traseras
    for (let i = 0; i < 2; i++) { const sx = cx + 22 + i * 8, sy = ty - 24; R(sx, sy, 5, 14, I[1]); R(sx, sy, 5, 1, I[3]); E(sx + 2, sy - 4 - ((f * 4 + i * 5) % 12), 3, 2, broken ? '#8a3aff' : '#6a6a72'); }
    if (broken) {
      for (let i = 0; i < 6; i++) { const x0 = cx - 26 + ((i * 19) % 52), y0 = ty - 12 + ((i * 7) % 22); R(x0, y0, 6, 3, '#000000'); R(x0 + 1, y0 + 1, 3, 1, CORE[2]); }
      for (let i = 0; i < 6; i++) R(cx - 30 + ((i * 11 + f * 7) % 60), ty - 26 - ((i * 7 + f * 5) % 24), 1, 2, i % 2 ? '#ffd04a' : CORE[1]);
    }
  }
  const coloG = (a, f, R, E, ox, oy) => warBody(a, f, R, E, ox, oy, false);
  const coloG2 = (a, f, R, E, ox, oy) => warBody(a, f, R, E, ox, oy, true);
  function puno(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, up = anim === 'idle' ? Math.round(Math.sin(t) * 1.5) : anim === 'attack' ? [6, -2, 2][f] : anim === 'cast' ? 5 : 0;
    const punch = anim === 'attack' ? [5, -16, -4][f] : 0;
    const I = ['#0c0a10', '#1e1a24', '#34303c', '#524c5a'], BZ = ['#3a2410', '#7a5428', '#b8843a', '#e8c070'];
    const ex = ox + 18, ey = oy - 30 - up;
    // pistón y manguitos
    R(ex - 4, ey, 10, 26 + up, I[1]); R(ex - 3, ey, 2, 26 + up, I[3]); R(ex + 4, ey, 2, 26 + up, I[0]);
    E(ex, ey, 7, 7, I[0]); E(ex, ey, 5, 5, BZ[2]); E(ex, ey, 2, 2, '#8a4aff');
    R(ex - 26 + punch, ey - 4, 24, 8, I[1]); R(ex - 26 + punch, ey - 4, 24, 2, I[3]); R(ex - 18 + punch, ey - 2, 10, 4, BZ[1]); R(ex - 17 + punch, ey - 2, 8, 1, BZ[3]);
    // puño
    const fx = ex - 34 + punch, fy = ey;
    E(fx, fy, 12, 11, I[0]); E(fx - 1, fy - 1, 11, 10, I[2]); E(fx - 4, fy - 4, 5, 4, I[3]);
    for (let i = 0; i < 4; i++) { R(fx - 13, fy - 8 + i * 4, 6, 3, I[1]); seg(E, fx - 13, fy - 6 + i * 4, fx - 19, fy - 7 + i * 4, 1.2, 0.4, '#c8c8d8'); }
    R(fx + 2, fy + 3, 4, 2, BZ[2]); R(fx - 2, fy - 7, 2, 2, '#8a4aff');
  }

  TH.foePaint('farol_errante', farolE, [60, 64, 30, 60], '#2a1404', [7, 2]);
  TH.foePaint('farol_corrupto', farolC, [60, 68, 30, 64], '#06020a', [7, 2]);
  TH.foePaint('guardian_marea', guardM, [76, 64, 42, 60], '#041416', [12, 3]);
  TH.foePaint('guardian_abismo', guardA, [80, 70, 44, 66], '#020206', [13, 3]);
  TH.foePaint('coloso_guerra', coloG, [150, 128, 75, 124], '#040306', [46, 7]);
  TH.foePaint('coloso_guerra2', coloG2, [150, 128, 75, 124], '#040306', [46, 7]);
  TH.foePaint('puno', puno, [92, 64, 56, 60], '#040306', [14, 3]);
  const E0 = TH.data.enemies;
  if (E0.coloso_guerra) Object.assign(E0.coloso_guerra, { zoom: 1.12, camY: 12, markH: 104 });
})();
