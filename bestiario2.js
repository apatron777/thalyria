// Diseños propios (antes recoloreados) de los capítulos 2 y 3. Miran a la izquierda.
// Capítulo 2 · bosque: Brote espinoso (vaina con púas), Lobo de tronco viejo (tocón con setas), Lobo alfa (corona de espinas).
// Capítulo 3 · ruinas de bronce: Halcón de las ruinas, Halcón de tormenta, Centinela de bronce, Centinela mayor,
// y el Vigía de Bronce: un coloso con un faro por cabeza y horno en el pecho (fase 2: sobrecalentado), con sus brazos.
(function () {
  'use strict';
  const TH = window.TH;
  const seg = (E, x0, y0, x1, y1, r0, r1, c) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.4));
    for (let i = 0; i <= n; i++) { const k = i / n, r = r0 + (r1 - r0) * k; E(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, r, c); }
  };
  const ring = (n, f) => { const o = []; for (let i = 0; i < n; i++) o.push(f(i, (i / n) * Math.PI * 2)); return o; };

  // ================= CAPÍTULO 2 =================
  // Brote espinoso: vaina granate cubierta de púas, un ojo y una boca vertical
  function broteEspina(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, puff = anim === 'idle' ? Math.sin(t) * 0.8 : 0;
    const lunge = anim === 'attack' ? [2, -6, -2][f] : 0, flare = anim === 'attack' && f === 1 ? 3 : anim === 'cast' ? 2 : 0;
    const cx = ox - 1 + lunge, cy = oy - 18 - (anim === 'attack' && f === 0 ? 2 : 0);
    // raíces-tentáculo
    for (const [dx, dy] of [[-12, 1], [-5, 2], [6, 2], [12, 0]]) seg(E, ox, oy - 4, ox + dx, oy + dy - 1, 2, 0.6, '#2a120e');
    E(ox, oy - 2, 10, 3, '#1a0a08');
    seg(E, ox + 1, oy - 4, cx + 2, cy + 8, 3, 2.4, '#3a1a14');
    // púas (detrás)
    ring(14, (i, a) => {
      const L = 6 + (i % 3) * 2 + flare, x0 = cx + Math.cos(a) * 9, y0 = cy + Math.sin(a) * 8;
      seg(E, x0, y0, cx + Math.cos(a) * (9 + L), cy + Math.sin(a) * (8 + L), 1.6, 0.4, '#5a2016');
      R(cx + Math.cos(a) * (9 + L) - 0.5, cy + Math.sin(a) * (8 + L) - 0.5, 1, 1, '#f0e2c0');
    });
    // vaina
    E(cx, cy, 11 + puff, 10 + puff, '#3a0e14'); E(cx, cy - 1, 10 + puff, 9 + puff, '#7a1a26'); E(cx + 2, cy - 3, 6, 5, '#a8324a'); R(cx + 2, cy - 7, 3, 1, '#e86a7a');
    for (let i = 0; i < 5; i++) R(cx - 6 + i * 3, cy + 4 + (i % 2), 1, 2, '#4a1018');
    // ojo único
    E(cx - 3, cy - 3, 3, 3, '#1a0408'); R(cx - 5, cy - 4, 3, 2, '#ffd23a'); R(cx - 5, cy - 4, 1, 1, '#ffffff'); R(cx - 4, cy - 4, 1, 2, '#1a0408');
    // boca vertical con dientes
    const mo = anim === 'attack' && f === 1 ? 3 : anim === 'cast' ? 2 : 1;
    R(cx - 9, cy - 1, 2 + mo, 8, '#14040a');
    for (let i = 0; i < 4; i++) { R(cx - 9, cy + i * 2, 1, 1, '#f4ecd0'); R(cx - 8 + mo, cy + 1 + i * 2, 1, 1, '#f4ecd0'); }
    // flor de la corona
    for (const [dx, dy] of [[-3, -12], [0, -14], [3, -12], [0, -11]]) E(cx + dx, cy + dy, 2.4, 2, '#e8344a');
    R(cx - 1, cy - 13, 2, 2, '#ffd23a');
    if (anim === 'attack' && f === 1) for (let i = 0; i < 4; i++) R(cx - 22 - i * 4, cy - 6 + i * 4, 3, 1, '#f0e2c0');
  }

  // Lobo de tronco viejo: mole de corteza gris con un tocón en el lomo lleno de setas
  function loboViejo(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, br = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const lunge = anim === 'attack' ? [4, -10, -3][f] : 0, low = anim === 'attack' && f === 0 ? 3 : anim === 'hurt' ? 2 : 0;
    const B = ['#1e1a16', '#3a342c', '#585044', '#7a7060'], MOSS = ['#2a3a1a', '#4a6a2a', '#7a9a3a'];
    const bx = ox + 6 + lunge, by = oy - 18 + low - br;
    const leg = (x, ph, front) => {
      const sw = anim === 'idle' ? 0 : Math.round(Math.sin(t + ph) * 2);
      seg(E, x, by + 4, x - 1 + sw, oy - 3, 3.6, 2.6, front ? B[1] : B[0]);
      R(x - 5 + sw, oy - 2, 8, 2, B[0]); for (let i = 0; i < 3; i++) R(x - 5 + sw + i * 3, oy - 1, 1, 1, '#d8ccb0');
    };
    leg(bx + 12, 1, false); leg(bx - 10, 3, false);
    // cuerpo-tronco con anillos
    E(bx, by, 19, 10, B[0]); E(bx - 1, by - 1, 18, 9, B[1]); E(bx - 3, by - 3, 13, 6, B[2]);
    for (let i = 0; i < 7; i++) R(bx - 14 + i * 4, by - 6 + (i % 2), 1, 10, B[0]);
    for (let i = 0; i < 3; i++) E(bx + 6 - i * 9, by + 2, 2, 1, MOSS[1]);
    // tocón del lomo con setas
    R(bx - 2, by - 17, 10, 9, B[0]); R(bx - 1, by - 17, 8, 8, B[2]); E(bx + 3, by - 17, 5, 2, B[3]); E(bx + 3, by - 17, 3, 1, '#a89878');
    for (const [dx, dy, r] of [[-5, -12, 3], [10, -12, 2.5], [8, -6, 2], [-8, -6, 2]]) { E(bx + dx, by + dy, r, r * 0.7, '#c8282a'); R(bx + dx - 1, by + dy - 1, 1, 1, '#ffffff'); R(bx + dx, by + dy + r * 0.7, 1, 2, '#e8dcc0'); }
    for (let i = 0; i < 6; i++) R(bx - 12 + i * 5, by - 9 + (i % 2), 3, 2, MOSS[i % 2 + 1]);
    leg(bx + 6, 2, true); leg(bx - 4, 0, true);
    // cabeza baja con cuernos rotos y barba de musgo
    const hx = bx - 22, hy = by + 1 + (anim === 'attack' && f === 1 ? 3 : 0);
    E(hx + 3, hy, 9, 7, B[0]); E(hx + 2, hy - 1, 8, 6, B[2]);
    seg(E, hx + 4, hy - 5, hx - 4, hy - 12, 2, 1, B[1]); seg(E, hx + 8, hy - 5, hx + 4, hy - 13, 2, 1, B[1]); R(hx - 5, hy - 13, 2, 1, B[3]);
    const op = anim === 'attack' && f === 1 ? 4 : 1;
    R(hx - 9, hy - 1 - op, 10, 3, B[1]); R(hx - 8, hy + 2 + op, 9, 2, B[0]); R(hx - 8, hy + 2 - op, 9, op * 2, '#140a06');
    for (let i = 0; i < 4; i++) R(hx - 8 + i * 2, hy + 2 - op, 1, 2, '#efe6d0');
    for (let i = 0; i < 5; i++) R(hx - 4 + i * 2, hy + 4 + op, 1, 3 + (i % 3), MOSS[1]);
    R(hx - 2, hy - 3, 3, 2, '#e8c040'); R(hx - 1, hy - 3, 1, 1, '#fff6c0');
  }

  // Lobo alfa: grande, crin de espinas negras, runas verdes en el costado y máscara de hueso
  function loboAlfa(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, br = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const lunge = anim === 'attack' ? [4, -14, -4][f] : 0, low = anim === 'attack' && f === 0 ? 3 : 0;
    const howl = anim === 'cast' ? 1 : 0;
    const B = ['#0e100c', '#1e2418', '#2e3a24', '#465838'], RUNE = '#7cff8a';
    const bx = ox + 8 + lunge, by = oy - 24 + low - br;
    // cola de hojas
    seg(E, bx + 20, by - 2, bx + 34, by - 14 - br, 3, 1.6, B[1]);
    for (let i = 0; i < 4; i++) E(bx + 28 + i * 2, by - 10 - i * 2, 3, 2, i % 2 ? '#2c6420' : '#183a12');
    const leg = (x, ph, front) => {
      const sw = anim === 'idle' ? 0 : Math.round(Math.sin(t + ph) * 3);
      seg(E, x, by + 6, x - 3 + sw, oy - 3, 3.6, 2.2, front ? B[2] : B[0]);
      R(x - 8 + sw, oy - 2, 9, 2, B[0]); for (let i = 0; i < 3; i++) R(x - 8 + sw + i * 3, oy - 1, 1, 1, '#f0e8d0');
    };
    leg(bx + 14, 1, false); leg(bx - 10, 3, false);
    E(bx, by, 22, 11, B[0]); E(bx - 1, by - 1, 21, 10, B[1]); E(bx - 4, by - 3, 15, 6, B[2]);
    for (let i = 0; i < 8; i++) R(bx - 16 + i * 4, by - 6 + (i % 2), 1, 11, B[0]);
    // runas que laten
    const rg = (f % 2) ? RUNE : '#3ad058';
    for (const [rx, ry] of [[-8, 0], [2, 1], [11, -1]]) { R(bx + rx, by + ry - 2, 3, 1, rg); R(bx + rx + 3, by + ry - 1, 1, 2, rg); R(bx + rx, by + ry + 1, 3, 1, rg); R(bx + rx, by + ry - 1, 1, 1, rg); R(bx + rx + 1, by + ry - 1, 1, 1, '#d8ffe0'); }
    // corona de espinas negras sobre el lomo
    for (let i = 0; i < 9; i++) {
      const x = bx - 16 + i * 4, h = 8 + (i % 3) * 4 + (i > 2 && i < 6 ? 4 : 0);
      seg(E, x, by - 8, x + 2, by - 8 - h, 2, 0.5, '#08080a'); R(x + 2, by - 9 - h, 1, 1, '#5a5a6a');
    }
    leg(bx + 6, 2, true); leg(bx - 4, 0, true);
    // cuello y crin de enredaderas
    seg(E, bx - 14, by - 4, bx - 24, by - 12 - howl * 6, 7, 6, B[1]);
    for (let i = 0; i < 6; i++) seg(E, bx - 12 - i * 2, by - 10 - i, bx - 8 - i * 3, by + 6 - i, 1.4, 0.6, '#2c6420');
    // cabeza con máscara de hueso
    const hx = bx - 32, hy = by - 14 - howl * 8 + (anim === 'attack' && f === 1 ? 4 : 0);
    E(hx + 6, hy, 10, 7, B[0]); E(hx + 5, hy - 1, 9, 6, B[2]);
    seg(E, hx + 8, hy - 5, hx + 12, hy - 15, 2, 0.6, B[1]); seg(E, hx + 12, hy - 4, hx + 18, hy - 13, 2, 0.6, B[1]);
    // máscara
    for (let i = 0; i < 6; i++) R(hx - 10 + i * 2, hy - 5 + (i < 2 ? 2 - i : 0), 16 - i * 2 + (i < 2 ? i * 2 : 0) - (i > 3 ? 0 : 0), 1, i === 0 ? '#ffffff' : '#e8e0cc');
    R(hx - 10, hy - 3, 18, 3, '#e8e0cc'); R(hx - 10, hy - 1, 18, 1, '#b8ac94');
    R(hx - 6, hy - 4, 1, 3, '#8a7e68'); R(hx - 1, hy - 5, 1, 2, '#8a7e68'); R(hx + 4, hy - 5, 1, 4, '#8a7e68');
    E(hx + 3, hy - 3, 2.4, 1.6, '#0a0404');
    const op = anim === 'attack' && f === 1 ? 5 : howl ? 4 : 1;
    R(hx - 12, hy - 1 - op, 13, 3, B[1]); R(hx - 11, hy + 2 + op, 12, 2, B[0]);
    R(hx - 11, hy + 2 - op, 12, op * 2, '#0a0404');
    for (let i = 0; i < 5; i++) { R(hx - 11 + i * 2, hy + 2 - op, 1, 3, '#f4ecd8'); R(hx - 10 + i * 2, hy + op, 1, 2, '#f4ecd8'); }
    R(hx + 2, hy - 4, 3, 2, RUNE); R(hx + 3, hy - 4, 1, 1, '#ffffff');
    if (howl) for (let i = 0; i < 3; i++) R(hx - 18 - i * 4, hy - 8 - i * 3, 2, 1, RUNE);
  }

  // ================= CAPÍTULO 3 =================
  // Halcón (base para los dos): alas abiertas que baten, garras colgando
  function hawk(anim, f, R, E, ox, oy, storm) {
    const t = (f / 4) * Math.PI * 2;
    const flap = anim === 'idle' ? [0, 1, 2, 1][f] : anim === 'attack' ? [2, 0, 1][f] : anim === 'cast' ? 0 : 1;
    const dive = anim === 'attack' ? [0, -10, -3][f] : 0, dy = anim === 'attack' && f === 1 ? 6 : 0;
    const P = storm ? ['#0c0e22', '#1c2246', '#2e3a74', '#5a6ab0'] : ['#3a2410', '#6a4420', '#9a6a34', '#c89a5a'];
    const CH = storm ? '#c8d8ff' : '#f0dcb0', BAR = storm ? '#3a4a8a' : '#8a5a2a';
    const bx = ox + dive, by = oy - 24 + dy + Math.round(Math.sin(t) * 1.5);
    // alas (detrás y delante)
    const wing = (back) => {
      // brazo del ala hasta la muñeca y plumas primarias abiertas en abanico
      const lift = [-14, -4, 8][flap], sx = bx + (back ? 5 : 1), sy = by - 1;
      const wx = sx + (back ? 9 : 11), wy = sy + lift * 0.7 - (back ? 3 : 0);
      for (let i = 0; i < 5; i++) {
        const k = i / 4, x = sx + (wx - sx) * k, y = sy + (wy - sy) * k;
        seg(E, x, y, x + 4, y + 6 - lift * 0.15, 2.2, 1, back ? P[0] : P[1]);
      }
      seg(E, sx, sy, wx, wy, 3.2, 2.2, back ? P[1] : P[2]);
      for (let i = 0; i < 5; i++) {
        const a = -1.2 + i * 0.32 + (lift > 0 ? 0.5 : 0) - (back ? 0.15 : 0), L = 9 + (i === 1 || i === 2 ? 4 : 0);
        const tx = wx + Math.cos(a) * L, ty = wy + Math.sin(a) * L;
        seg(E, wx, wy, tx, ty, 1.6, 0.7, back ? P[0] : (i % 2 ? P[1] : P[2]));
        if (!back) R(tx, ty, 1, 1, P[3]);
      }
      if (!back) { R(wx - 2, wy - 1, 3, 1, P[3]); R(sx + 2, sy - 1, 4, 1, P[3]); }
      if (storm && !back) { R(wx + 6, wy - 6, 1, 3, '#bff4ff'); R(wx + 7, wy - 4, 2, 1, '#bff4ff'); R(wx + 10, wy + 1, 1, 2, '#ffffff'); }
    };
    wing(true);
    // cola
    for (let i = 0; i < 3; i++) seg(E, bx + 8, by + 3, bx + 17, by + 2 + i * 3, 2, 1, i === 1 ? P[2] : P[1]);
    // cuerpo
    E(bx + 1, by + 1, 10, 7, P[0]); E(bx, by, 9, 6, P[1]); E(bx - 2, by + 2, 6, 4, CH);
    for (let i = 0; i < 3; i++) R(bx - 5 + i * 2, by + 1 + (i % 2), 1, 1, BAR);
    // garras
    const tal = anim === 'attack' && f === 1 ? -4 : 0;
    for (const lx of [bx - 1, bx + 3]) { R(lx + tal, by + 5, 1, 4, '#e8c04a'); R(lx - 2 + tal, by + 9, 4, 1, '#e8c04a'); R(lx - 2 + tal, by + 10, 1, 1, '#1a1008'); R(lx + 1 + tal, by + 10, 1, 1, '#1a1008'); }
    // cabeza y pico ganchudo
    const hx = bx - 9, hy = by - 4;
    E(hx + 2, hy, 6, 5, P[1]); E(hx + 1, hy - 1, 5, 4, storm ? P[2] : '#e8d8b8'); R(hx - 1, hy - 3, 6, 1, P[0]); R(hx + 4, hy + 1, 3, 3, P[1]);
    R(hx - 4, hy - 1, 4, 2, '#f0c040'); R(hx - 5, hy, 2, 2, '#f0c040'); R(hx - 5, hy + 1, 1, 1, '#2a1a08'); R(hx - 4, hy + 1, 3, 1, '#c08a20');
    R(hx, hy - 2, 2, 2, storm ? '#7af4ff' : '#ffb020'); R(hx, hy - 2, 1, 1, '#ffffff'); R(hx - 1, hy - 3, 4, 1, P[0]);
    if (storm) {
      // cresta de plumas en zigzag y chispas
      for (let i = 0; i < 4; i++) seg(E, hx + 3 + i * 2, hy - 3, hx + 6 + i * 3, hy - 9 - (i % 2) * 3, 1.2, 0.5, i % 2 ? '#bff4ff' : P[3]);
      for (let i = 0; i < 4; i++) R(bx - 16 + ((i * 13 + f * 7) % 34), by - 14 + ((i * 7 + f * 5) % 26), 1, 1, '#e8fbff');
    } else {
      R(hx + 4, hy - 4, 3, 1, P[2]); R(hx + 6, hy - 5, 2, 1, P[2]);
    }
    wing(false);
  }
  const halcon = (a, f, R, E, ox, oy) => hawk(a, f, R, E, ox, oy, false);
  const halconT = (a, f, R, E, ox, oy) => hawk(a, f, R, E, ox, oy, true);

  // Centinela de bronce: autómata con ojo-lente, lanza y engranaje en el pecho
  const BZ = ['#2a1a0a', '#6a4418', '#a87028', '#e0a850', '#ffe0a0'], VERD = ['#2a6a5a', '#4aa08a'];
  function centinela(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, bob = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const thrust = anim === 'attack' ? [3, -12, -4][f] : 0, cx = ox + 2, cy = oy - 22 - bob;
    // piernas-pistón
    for (const lx of [cx - 5, cx + 4]) { R(lx - 2, cy + 10, 4, 8 + bob, BZ[1]); R(lx - 1, cy + 10, 1, 8 + bob, BZ[3]); R(lx - 4, oy - 3, 7, 3, BZ[1]); R(lx - 4, oy - 3, 7, 1, BZ[3]); }
    // escudo redondo a la espalda
    E(cx + 9, cy, 7, 8, BZ[0]); E(cx + 9, cy, 6, 7, BZ[2]); E(cx + 9, cy, 2, 2, BZ[4]);
    // torso-barril
    E(cx, cy + 2, 9, 10, BZ[0]); E(cx - 1, cy + 1, 8, 9, BZ[2]); R(cx - 6, cy - 3, 3, 12, BZ[3]);
    for (let i = 0; i < 3; i++) R(cx - 8, cy - 4 + i * 5, 15, 1, BZ[1]);
    for (let i = 0; i < 4; i++) R(cx - 6 + i * 4, cy + 10, 1, 1, BZ[4]);
    // engranaje del pecho que gira
    const ga = f * 0.4;
    E(cx - 1, cy + 2, 4, 4, BZ[1]); ring(6, (i, a) => R(cx - 1 + Math.cos(a + ga) * 4.5, cy + 2 + Math.sin(a + ga) * 4.5, 2, 2, BZ[3])); E(cx - 1, cy + 2, 2, 2, BZ[0]);
    R(cx + 3, cy + 6, 3, 2, VERD[0]); R(cx - 6, cy - 2, 2, 2, VERD[1]);
    // casco con ojo-lente
    E(cx, cy - 11, 7, 6, BZ[0]); E(cx - 1, cy - 12, 6, 5, BZ[2]); R(cx - 5, cy - 16, 8, 1, BZ[4]);
    R(cx - 7, cy - 12, 9, 3, '#0a0a10'); R(cx - 6 + (f % 2), cy - 11, 4, 1, '#7af4ff'); R(cx - 5 + (f % 2), cy - 11, 1, 1, '#ffffff');
    R(cx - 1, cy - 19, 2, 3, BZ[3]); R(cx - 2, cy - 20, 4, 1, '#c84030');
    // brazo con lanza
    const ax = cx - 7 + thrust;
    R(ax, cy + 1, 6, 3, BZ[1]); R(ax - 16, cy + 1, 18, 2, '#5a3a18'); R(ax - 16, cy + 1, 18, 1, '#8a6030');
    R(ax - 22, cy - 1, 6, 6, BZ[3]); R(ax - 25, cy + 1, 3, 2, BZ[4]); R(ax - 20, cy - 2, 2, 1, BZ[4]); R(ax - 20, cy + 5, 2, 1, BZ[4]);
  }
  // Centinela mayor: escudo de torre con sol grabado, alabarda y casco con cuernos
  function centinelaMayor(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, bob = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const chop = anim === 'attack' ? [-6, 10, 4][f] : anim === 'cast' ? -4 : 0;
    const cx = ox + 4, cy = oy - 28 - bob;
    const D2 = ['#1a1006', '#4a3010', '#7a5420', '#b88a3a', '#e8c070'];
    // capa raída
    for (let i = 0; i < 5; i++) R(cx + 4 + i * 2, cy - 2, 2, 22 - (i % 2) * 4, i % 2 ? '#5a1a1a' : '#7a2424');
    for (const lx of [cx - 6, cx + 5]) { R(lx - 3, cy + 14, 6, 10 + bob, D2[1]); R(lx - 2, cy + 14, 1, 10 + bob, D2[3]); R(lx - 5, oy - 4, 9, 4, D2[1]); R(lx - 5, oy - 4, 9, 1, D2[3]); }
    // torso pesado
    E(cx, cy + 4, 12, 13, D2[0]); E(cx - 1, cy + 3, 11, 12, D2[2]); R(cx - 9, cy - 4, 4, 16, D2[3]);
    for (let i = 0; i < 4; i++) R(cx - 10, cy - 5 + i * 5, 20, 1, D2[1]);
    R(cx + 3, cy + 2, 4, 3, VERD[0]); R(cx - 4, cy + 9, 3, 2, VERD[1]);
    // hombreras
    E(cx - 10, cy - 6, 5, 4, D2[1]); E(cx + 10, cy - 6, 5, 4, D2[2]); R(cx - 13, cy - 8, 6, 1, D2[4]);
    // alabarda alzada
    const hx = cx + 12, hy = cy - 12 + chop;
    R(hx, hy - 16, 2, 40, '#4a2e12'); R(hx, hy - 16, 1, 40, '#7a5428');
    E(hx - 2, hy - 18, 6, 5, D2[2]); R(hx - 8, hy - 20, 8, 6, D2[3]); R(hx - 9, hy - 19, 2, 4, D2[4]); R(hx, hy - 24, 2, 7, D2[3]);
    // casco con cuernos y dos ojos
    E(cx - 1, cy - 14, 8, 7, D2[0]); E(cx - 2, cy - 15, 7, 6, D2[2]);
    seg(E, cx - 6, cy - 18, cx - 12, cy - 26, 2, 0.8, D2[3]); seg(E, cx + 4, cy - 18, cx + 9, cy - 27, 2, 0.8, D2[3]);
    R(cx - 8, cy - 15, 11, 3, '#0a0a10'); R(cx - 7, cy - 14, 2, 1, '#ff7a3a'); R(cx - 2, cy - 14, 2, 1, '#ff7a3a');
    // escudo de torre (delante)
    const sx = cx - 18, sy = cy + 2;
    R(sx - 2, sy - 16, 14, 32, D2[0]); R(sx - 1, sy - 15, 12, 30, D2[2]); R(sx - 1, sy - 15, 12, 2, D2[4]); R(sx, sy - 15, 2, 30, D2[3]);
    E(sx + 5, sy, 4, 4, D2[4]); ring(8, (i, a) => R(sx + 5 + Math.cos(a) * 6, sy + Math.sin(a) * 6, 1, 1, D2[4]));
    R(sx + 2, sy + 9, 4, 3, VERD[0]); R(sx + 7, sy - 10, 2, 2, VERD[1]);
  }

  // ---- Vigía de Bronce: coloso con un faro por cabeza ----
  function vigiaBody(anim, f, R, E, ox, oy, hot) {
    const t = (f / 4) * Math.PI * 2, hum = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const lean = anim === 'attack' ? [0, -5, -2][f] : anim === 'hurt' ? 3 : 0, cast = anim === 'cast' ? 1 : 0;
    const B = hot ? ['#2a0e06', '#6a2a0e', '#a8501c', '#e0863a', '#ffc070'] : ['#24160a', '#5a3a16', '#94642a', '#cc9a4a', '#f4d48a'];
    const V = hot ? ['#4a2a1a', '#6a3a24'] : ['#2a6a5a', '#4aa08a'], GLOW = hot ? '#ff5a1a' : '#ffe27a';
    const RED = hot ? '#d8401a' : '#b8382a', CREAM = hot ? '#ffd0a0' : '#efe2c0';
    const cx = ox + 4 + lean, base = oy;
    // piernas: columnas de templo
    for (const lx of [cx - 20, cx + 14]) {
      R(lx - 9, base - 24, 18, 22, B[0]); R(lx - 8, base - 24, 16, 22, B[2]);
      for (let i = 0; i < 5; i++) R(lx - 7 + i * 3, base - 23, 1, 20, B[1]);
      R(lx - 7, base - 24, 3, 22, B[3]);
      R(lx - 11, base - 6, 22, 6, B[1]); R(lx - 11, base - 6, 22, 1, B[4]); R(lx - 10, base - 29, 20, 5, B[3]); R(lx - 10, base - 29, 20, 1, B[4]);
    }
    // faldón de placas
    for (let i = 0; i < 7; i++) { R(cx - 28 + i * 8, base - 38, 8, 12 - (i % 2) * 3, i % 2 ? B[1] : B[2]); R(cx - 28 + i * 8, base - 38, 8, 1, B[4]); }
    // torso en V con placas
    const ty = base - 58 - hum;
    for (let y = ty - 20; y <= ty + 18; y++) {
      const k = (y - (ty - 20)) / 38, w = Math.round(64 - k * 26), x = Math.round(cx - w / 2);
      R(x, y, w, 1, B[2]); R(x, y, 3, 1, B[3]); R(x + w - 3, y, 3, 1, B[1]);
    }
    R(cx - 32, ty - 20, 64, 2, B[4]);
    for (let i = 0; i < 3; i++) R(cx - 26 + i * 4, ty + 6 + i * 5, 52 - i * 8, 1, B[1]);
    // horno del pecho
    R(cx - 11, ty - 8, 22, 15, B[0]); R(cx - 10, ty - 7, 20, 13, hot ? '#ff6a1a' : '#ffb84a');
    const fl = hot ? ['#ffd04a', '#fff2a0'] : ['#ffe27a', '#fff8d0'];
    for (let i = 0; i < 4; i++) R(cx - 9 + i * 5, ty - 2 - ((f + i) % 3), 3, 7, fl[i % 2]);
    for (let i = 0; i < 6; i++) R(cx - 10 + i * 4, ty - 7, 1, 13, B[0]);
    // sol grabado sobre el horno
    E(cx, ty - 15, 4, 3, B[4]); for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; R(cx + Math.cos(a) * 9, ty - 15 + Math.sin(a) * 5, 1, 2, B[4]); }
    // pátina / grietas al rojo
    R(cx + 16, ty - 12, 6, 3, V[0]); R(cx - 24, ty - 4, 4, 5, V[1]); R(cx + 8, ty + 12, 4, 2, V[0]); R(cx - 14, ty + 14, 3, 2, V[1]);
    if (hot) { seg(E, cx - 22, ty - 14, cx - 12, ty + 2, 0.7, 0.5, GLOW); seg(E, cx + 24, ty - 16, cx + 12, ty, 0.7, 0.5, GLOW); seg(E, cx - 4, ty + 10, cx + 6, ty + 18, 0.6, 0.5, GLOW); }
    // hombreras con púas y cadenas (los brazos son piezas aparte)
    for (const s of [-1, 1]) {
      const sx = cx + s * 31, sy = ty - 18;
      E(sx, sy, 14, 9, B[0]); E(sx, sy - 1, 13, 8, B[2]); E(sx - s * 3, sy - 4, 7, 3, B[3]); R(sx - 13, sy + 6, 26, 2, B[1]);
      for (let i = 0; i < 3; i++) seg(E, sx - 8 + i * 8, sy - 7, sx - 8 + i * 8 + s * 2, sy - 15 - (i === 1 ? 3 : 0), 2, 0.6, B[3]);
      for (let i = 0; i < 3; i++) R(sx - 7 + i * 7, sy + 8, 2, 7 + i * 2, '#3a3a3a');
    }
    // cuello: torre de faro a franjas con galería
    const ny = ty - 20;
    for (let i = 0; i < 3; i++) R(cx - 8, ny - 3 - i * 3, 16, 3, i % 2 ? CREAM : RED);
    R(cx - 14, ny - 14, 28, 3, B[1]); R(cx - 14, ny - 14, 28, 1, B[4]);
    for (let i = 0; i < 7; i++) R(cx - 13 + i * 4, ny - 17, 1, 3, B[3]); R(cx - 14, ny - 18, 28, 1, B[3]);
    // linterna: el ojo del coloso
    const hx = cx, hy = ny - 29 - cast * 2;
    R(hx - 11, hy - 11, 22, 21, '#0e0c08');
    const lens = hot ? ['#ff3a1a', '#ff8a4a', '#ffd0a0'] : ['#ffc83a', '#fff0a0', '#ffffff'];
    E(hx - 1, hy, 9, 9, lens[0]); E(hx - 1, hy, 6, 6, lens[1]); E(hx - 3, hy - 2, 3, 3, lens[2]);
    for (let i = 0; i < 4; i++) R(hx - 11 + i * 7, hy - 11, 2, 21, B[2]);
    R(hx - 13, hy - 13, 26, 3, B[3]); R(hx - 13, hy + 9, 26, 2, B[1]);
    // destellos del ojo (rayos opacos, hacia los héroes)
    if (anim !== 'hurt') { const L = 5 + (f % 2) * 3 + (anim === 'attack' && f === 1 ? 6 : 0); R(hx - 14 - L, hy - 1, L, 2, lens[1]); R(hx - 13 - L + 3, hy - 5, L - 3, 1, lens[0]); R(hx - 13 - L + 3, hy + 3, L - 3, 1, lens[0]); }
    // tejado cónico y aguja
    for (let i = 0; i < 10; i++) R(hx - 12 + i, hy - 14 - i, 24 - i * 2, 1, i % 2 ? B[2] : B[3]);
    R(hx - 1, hy - 30, 2, 7, B[4]); E(hx, hy - 31, 2, 2, GLOW);
    if (hot) for (let i = 0; i < 5; i++) R(cx - 26 + ((i * 13 + f * 5) % 52), ty - 30 - ((f * 6 + i * 9) % 20), 1, 1, '#ffb050');
  }
  const vigia = (a, f, R, E, ox, oy) => vigiaBody(a, f, R, E, ox, oy, false);
  const vigia2 = (a, f, R, E, ox, oy) => vigiaBody(a, f, R, E, ox, oy, true);
  // Brazo del Vigía: guantelete gigante de bronce con codo de engranaje
  function brazo(anim, f, R, E, ox, oy) {
    const t = (f / 4) * Math.PI * 2, up = anim === 'idle' ? Math.round(Math.sin(t) * 1.5) : anim === 'attack' ? [6, -2, 2][f] : anim === 'cast' ? 5 : 0;
    const punch = anim === 'attack' ? [5, -16, -4][f] : 0;
    const B = ['#24160a', '#5a3a16', '#94642a', '#cc9a4a', '#f4d48a'];
    const ex = ox + 16, ey = oy - 34 - up;
    // brazo superior hasta el suelo (cadenas que lo sujetan al coloso)
    R(ex - 6, ey, 13, 30 + up, B[1]); R(ex - 5, ey, 4, 30 + up, B[3]); R(ex + 4, ey, 2, 30 + up, B[0]);
    for (let i = 0; i < 3; i++) R(ex - 6, ey + 8 + i * 8, 13, 1, B[0]);
    // codo de engranaje
    E(ex, ey, 9, 9, B[0]); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + f * 0.35; R(ex + Math.cos(a) * 9.5 - 1, ey + Math.sin(a) * 9.5 - 1, 3, 3, B[3]); } E(ex, ey, 4, 4, B[4]); E(ex, ey, 2, 2, B[1]);
    // antebrazo-pistón
    R(ex - 24 + punch, ey - 4, 22, 8, B[1]); R(ex - 24 + punch, ey - 4, 22, 2, B[4]); R(ex - 14 + punch, ey - 2, 3, 3, '#3a3a3a'); R(ex - 20 + punch, ey + 2, 14, 1, B[0]);
    // guantelete
    const fx = ex - 32 + punch, fy = ey;
    E(fx, fy, 13, 12, B[0]); E(fx - 1, fy - 1, 12, 11, B[2]); E(fx - 4, fy - 5, 6, 5, B[3]); R(fx - 6, fy - 9, 6, 1, B[4]);
    for (let i = 0; i < 4; i++) { R(fx - 14, fy - 8 + i * 4, 6, 3, B[3]); R(fx - 14, fy - 8 + i * 4, 6, 1, B[4]); R(fx - 14, fy - 6 + i * 4, 1, 1, B[0]); }
    E(fx + 4, fy + 6, 5, 3, B[1]); R(fx + 2, fy + 4, 3, 2, '#2a6a5a'); R(fx - 6, fy + 8, 3, 1, '#4aa08a');
    // sol grabado en el dorso
    E(fx + 1, fy - 1, 3, 3, B[4]); E(fx + 1, fy - 1, 1.5, 1.5, B[2]);
  }
  TH.foePaint('brote_espina', broteEspina, [64, 60, 32, 54], '#140406', [10, 3]);
  TH.foePaint('lobo_viejo', loboViejo, [76, 62, 40, 58], '#0a0806', [18, 4]);
  TH.foePaint('lobo_alfa', loboAlfa, [100, 84, 54, 80], '#040604', [24, 5]);
  TH.foePaint('halcon', halcon, [68, 60, 34, 56], '#1a0e04', [9, 2]);
  TH.foePaint('halcon_tormenta', halconT, [72, 66, 36, 62], '#04061a', [10, 2]);
  TH.foePaint('centinela', centinela, [64, 60, 32, 56], '#140c04', [11, 3]);
  TH.foePaint('centinela_mayor', centinelaMayor, [72, 76, 38, 72], '#0e0802', [14, 4]);
  TH.foePaint('vigia', vigia, [140, 136, 70, 132], '#120a04', [42, 7]);
  TH.foePaint('vigia2', vigia2, [140, 136, 70, 132], '#160602', [42, 7]);
  TH.foePaint('brazo', brazo, [84, 72, 44, 68], '#120a04', [16, 4]);
  if (TH.data.enemies.lobo_alfa) TH.data.enemies.lobo_alfa.scale = 1;
})();
// encuadre en combate de los jefes altos
(function () {
  const E = window.TH.data.enemies;
  if (E.vigia_bronce) Object.assign(E.vigia_bronce, { zoom: 1.08, camY: 16, markH: 120 });
  if (E.madre) Object.assign(E.madre, { zoom: 1.15, camY: 12 });
  if (E.lobo_alfa) Object.assign(E.lobo_alfa, { markH: 60 });
})();
