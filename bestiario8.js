// FASE E · monstruos de las zonas intermedias (miran a la izquierda).
// · Gárgola de arena (cap. 3): gárgola de bronce y piedra agazapada, alas de arena que se deshacen, ojos de brasa.
// · Jardinero de relojería (cap. 4): autómata de latón con tijeras de podar por brazos y un seto que le crece en la espalda.
// · Polilla de tinta (cap. 5): polilla enorme con alas escritas, que gotea tinta y lleva un ojo en cada ala.
// · Salamandra de magma (cap. 6): reptil de roca agrietada con lava en las grietas y una cresta de llamas.
// · Heraldo del Motor (cap. 7): farol-medusa de engranajes con llama turquesa y tentáculos de cadena.
(function () {
  'use strict';
  const TH = window.TH;
  const poly = (g, pts, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
  const line = (g, pts, c, w) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

  // ---------------- Gárgola de arena ----------------
  function gargola(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [2, -9, -3][f] : anim === 'hurt' ? 3 : 0, bob = anim === 'idle' ? Math.sin(t) * 1.2 : 0;
    const cx = ox + lunge, cy = oy - 18 + bob, flap = Math.sin(t) * 4;
    // alas de arena (detrás)
    poly(g, [[cx + 4, cy - 6], [cx + 30, cy - 26 - flap], [cx + 34, cy - 10 - flap], [cx + 28, cy + 2], [cx + 10, cy + 2]], '#6a4a22');
    poly(g, [[cx + 6, cy - 6], [cx + 28, cy - 22 - flap], [cx + 30, cy - 10 - flap], [cx + 12, cy]], '#c89a52');
    for (let i = 0; i < 4; i++) line(g, [[cx + 8, cy - 4], [cx + 22 + i * 3, cy - 20 - flap + i * 5]], '#8a6a32', 1);
    for (let i = 0; i < 7; i++) R(cx + 24 + rnd(i + f) * 10, cy + 4 + ((f * 3 + i * 5) % 14), 1, 1, '#e8c87a');
    // patas traseras y cola
    line(g, [[cx + 10, cy + 6], [cx + 22, cy + 10], [cx + 26, cy + 4 + Math.sin(t) * 2], [cx + 30, cy + 8]], '#4a4038', 3);
    E(cx + 8, cy + 12, 6, 6, '#2a2420'); E(cx + 8, cy + 11, 5, 5, '#6a6050'); R(cx + 4, oy - 3, 8, 3, '#3a3228');
    // torso agazapado de piedra y bronce
    E(cx, cy + 2, 12, 10, '#1e1a16'); E(cx, cy + 1, 11, 9, '#5a5246'); E(cx - 3, cy - 2, 7, 5, '#7a7062');
    R(cx - 6, cy + 2, 12, 2, '#a8763a'); R(cx - 6, cy + 2, 12, 1, '#e0a85a');
    for (const [x, y] of [[4, -4], [-2, 6], [6, 4]]) R(cx + x, cy + y, 2, 1, '#2a2420');
    // brazos y garras
    line(g, [[cx - 6, cy + 4], [cx - 12, cy + 10], [cx - 14 + lunge * 0.3, oy - 2]], '#4a4038', 3);
    for (let i = 0; i < 3; i++) R(cx - 17 + i * 2 + lunge * 0.3, oy - 2, 1, 2, '#e0d8c8');
    // cabeza con cuernos
    const hx = cx - 12, hy = cy - 8;
    E(hx, hy, 7, 6, '#1e1a16'); E(hx, hy - 1, 6, 5, '#6a6050'); poly(g, [[hx - 6, hy + 1], [hx - 12, hy + 3], [hx - 6, hy + 4]], '#5a5246');
    poly(g, [[hx + 2, hy - 4], [hx + 8, hy - 13], [hx + 5, hy - 4]], '#a8763a'); poly(g, [[hx - 2, hy - 4], [hx - 2, hy - 12], [hx + 1, hy - 5]], '#c8904a');
    const eye = anim === 'cast' || f % 2 ? '#ffb040' : '#ff7a20';
    R(hx - 4, hy - 1, 2, 1, eye); R(hx - 1, hy - 1, 2, 1, eye);
    R(hx - 9, hy + 3, 1, 1, '#f0e8d8'); R(hx - 7, hy + 3, 1, 1, '#f0e8d8');
    if (anim === 'cast') for (let i = 0; i < 10; i++) R(hx - 14 - i * 2, hy + 4 + Math.sin(i + f) * 3, 2, 1, '#e8c87a');
  }

  // ---------------- Jardinero de relojería ----------------
  function jardinero(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [2, -8, -2][f] : anim === 'hurt' ? 3 : 0, bob = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const cx = ox + 2 + lunge * 0.4, cy = oy - 26 + bob;
    // seto que crece en la espalda
    E(cx + 10, cy - 6, 11, 12, '#123a1a'); E(cx + 10, cy - 7, 10, 11, '#2a6a2a'); E(cx + 7, cy - 11, 6, 5, '#4a9a3a');
    for (let i = 0; i < 6; i++) R(cx + 4 + rnd(i) * 14, cy - 14 + rnd(i + 9) * 16, 2, 2, i % 2 ? '#ff8ab0' : '#ffe07a');
    // piernas de pistón
    for (const s of [-1, 1]) { const k = Math.sin(t + (s > 0 ? Math.PI : 0)) * 1.5; R(cx + s * 4 - 1, cy + 12, 3, 10 + k, '#5a4220'); R(cx + s * 4 - 2, oy - 3, 6, 3, '#a87a32'); R(cx + s * 4 - 1, cy + 16, 3, 1, '#e0b060'); }
    // cuerpo de latón con esfera de reloj
    E(cx, cy + 4, 10, 11, '#3a2a10'); E(cx, cy + 3, 9, 10, '#b8862e'); E(cx - 2, cy, 5, 6, '#e8b850');
    E(cx - 1, cy + 4, 5, 5, '#3a2a10'); E(cx - 1, cy + 4, 4, 4, '#f4ecd8');
    const a = f * 1.6; line(g, [[cx - 1, cy + 4], [cx - 1 + Math.cos(a) * 3, cy + 4 + Math.sin(a) * 3]], '#2a1a08', 1); R(cx - 2, cy + 1, 1, 1, '#2a1a08');
    for (let i = 0; i < 8; i++) { const b = (i / 8) * Math.PI * 2 + f * 0.4; R(cx + 6 + Math.cos(b) * 3, cy + 10 + Math.sin(b) * 3, 1, 1, '#8a6020'); }
    // cabeza de farol
    E(cx - 2, cy - 10, 6, 5, '#3a2a10'); E(cx - 2, cy - 11, 5, 4, '#c8963a'); R(cx - 5, cy - 11, 5, 2, '#9fe8d0'); R(cx - 4, cy - 11, 1, 1, '#ffffff');
    R(cx - 3, cy - 17, 2, 3, '#5a4220'); E(cx - 2, cy - 18, 2, 1.5, '#e0b060');
    // brazo-tijeras
    const sx = cx - 10 + lunge, sy = cy + 4, open = anim === 'attack' && f === 1 ? 6 : 2;
    line(g, [[cx - 6, cy + 2], [sx, sy]], '#5a4220', 3);
    poly(g, [[sx, sy - 1], [sx - 16, sy - 1 - open], [sx - 14, sy + 1 - open]], '#d8dce0'); poly(g, [[sx, sy + 1], [sx - 16, sy + 1 + open], [sx - 14, sy - 1 + open]], '#a8acb0');
    E(sx, sy, 2, 2, '#e0b060');
    // regadera en el otro brazo
    line(g, [[cx + 4, cy + 4], [cx + 2, cy + 12]], '#5a4220', 2); E(cx + 2, cy + 14, 3, 2, '#6a8a9a');
    if (anim === 'cast') for (let i = 0; i < 8; i++) R(cx - 6 - i * 3, cy + 16 + (i % 3), 1, 2, '#9fd8ff');
  }

  // ---------------- Polilla de tinta ----------------
  function polillaTinta(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, flap = Math.sin(t) * 6, lunge = anim === 'attack' ? [2, -8, -2][f] : anim === 'hurt' ? 3 : 0;
    const cx = ox + lunge, cy = oy - 30 + Math.sin(t) * 2;
    // alas (traseras y delanteras) con escritura
    poly(g, [[cx, cy], [cx + 26, cy - 22 - flap], [cx + 34, cy - 4], [cx + 22, cy + 10]], '#0a0a1a');
    poly(g, [[cx, cy], [cx + 24, cy - 19 - flap], [cx + 31, cy - 4], [cx + 20, cy + 8]], '#e8dcc0');
    poly(g, [[cx, cy + 2], [cx + 22, cy + 22 + flap * 0.5], [cx + 8, cy + 24]], '#0a0a1a'); poly(g, [[cx, cy + 2], [cx + 19, cy + 20 + flap * 0.5], [cx + 8, cy + 21]], '#c8b890');
    for (let i = 0; i < 6; i++) line(g, [[cx + 8 + i * 2, cy - 4 - i * 2 - flap * 0.3], [cx + 16 + i * 2, cy - 2 - i * 2 - flap * 0.3]], '#2a2440', 1);
    for (let i = 0; i < 4; i++) line(g, [[cx + 5 + i * 2, cy + 8 + i * 3], [cx + 11 + i * 2, cy + 9 + i * 3]], '#2a2440', 1);
    // ojo en el ala
    E(cx + 22, cy - 8 - flap * 0.5, 4, 3, '#1a1030'); E(cx + 22, cy - 8 - flap * 0.5, 2.5, 2, '#7a4ad8'); R(cx + 21, cy - 9 - flap * 0.5, 1, 1, '#ffffff');
    // manchas de tinta en los bordes
    for (let i = 0; i < 5; i++) E(cx + 26 + rnd(i) * 6, cy - 14 + i * 5 - flap * 0.4, 1.5, 1.5, '#0a0a1a');
    // cuerpo peludo
    E(cx - 2, cy + 2, 6, 11, '#0a0a14'); E(cx - 2, cy + 1, 5, 10, '#2a2440'); for (let i = 0; i < 5; i++) R(cx - 6, cy - 4 + i * 4, 8, 1, '#4a4068');
    E(cx - 6, cy - 9, 5, 5, '#0a0a14'); E(cx - 6, cy - 9, 4, 4, '#3a3058');
    E(cx - 8, cy - 9, 2, 2, '#b8a8ff'); R(cx - 9, cy - 10, 1, 1, '#ffffff');
    // antenas de pluma
    for (const s of [0, 4]) { line(g, [[cx - 6 + s * 0.5, cy - 13], [cx - 10 + s, cy - 22], [cx - 16 + s, cy - 25]], '#2a2440', 1); for (let i = 0; i < 4; i++) R(cx - 11 + s - i * 1.5, cy - 22 - i, 1, 2, '#4a4068'); }
    // gotas de tinta
    for (let i = 0; i < 3; i++) { const y = cy + 12 + ((f * 4 + i * 6) % 16); E(cx - 2 + i * 3, y, 1, 1.6, '#1a1030'); }
    if (anim === 'cast') for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + f; R(cx - 2 + Math.cos(a) * 18, cy + Math.sin(a) * 12, 2, 2, i % 2 ? '#1a1030' : '#7a4ad8'); }
  }

  // ---------------- Salamandra de magma ----------------
  function salamandra(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [3, -10, -3][f] : anim === 'hurt' ? 3 : 0;
    const cx = ox + lunge * 0.6, cy = oy - 10;
    const glow = f % 2 ? '#ffb030' : '#ff7010';
    // cola ondulante
    for (let i = 0; i < 9; i++) { const k = i / 8, x = cx + 12 + i * 3.5, y = cy - 2 + Math.sin(t + i * 0.7) * 3 * k - k * 4, r = 5 - k * 3.5; E(x, y, r + 1, r + 0.5, '#1a0a04'); E(x, y, r, r - 0.3, '#4a2a1a'); if (i % 2) R(x - 1, y - 1, 2, 1, glow); }
    // patas
    for (const [x, s] of [[-6, 0], [4, 1], [10, 2]]) { const k = Math.sin(t + s * 2) * 1.5; line(g, [[cx + x, cy + 2], [cx + x - 3, cy + 6 + k], [cx + x - 5, oy - 1]], '#3a1a0a', 3); R(cx + x - 7, oy - 2, 4, 2, '#2a1006'); }
    // cuerpo de roca agrietada
    E(cx, cy - 2, 16, 8, '#1a0a04'); E(cx, cy - 3, 15, 7, '#4a2a1a'); E(cx - 2, cy - 6, 10, 3, '#6a3a22');
    line(g, [[cx - 10, cy - 2], [cx - 4, cy - 5], [cx + 2, cy - 1], [cx + 8, cy - 4], [cx + 14, cy - 2]], glow, 1);
    line(g, [[cx - 6, cy + 2], [cx, cy], [cx + 6, cy + 3]], glow, 1);
    // cresta de llamas
    for (let i = 0; i < 7; i++) { const x = cx - 10 + i * 4, h = 4 + ((Math.sin(t * 2 + i * 1.3) + 1) * 2.5) | 0; R(x, cy - 10 - h, 2, h, i % 2 ? '#ff8a2a' : '#ffd04a'); R(x, cy - 10, 2, 1, '#3a1a0a'); }
    // cabeza
    const hx = cx - 18 + lunge * 0.4, hy = cy - 5, mo = anim === 'attack' && f === 1 ? 4 : 1;
    E(hx, hy, 8, 5, '#1a0a04'); E(hx, hy - 1, 7, 4, '#5a321e'); R(hx - 7, hy + 1, 8, mo, '#ff5010');
    if (mo > 1) for (let i = 0; i < 4; i++) R(hx - 6 + i * 2, hy + 1, 1, 1, '#f4e8d0');
    E(hx + 1, hy - 3, 2, 1.6, '#ffe070'); R(hx + 1, hy - 3, 1, 1, '#000000');
    if (anim === 'cast' || anim === 'attack') for (let i = 0; i < 6; i++) E(hx - 10 - i * 3, hy + 1 + Math.sin(i + f) * 2, 2 - i * 0.2, 1.6, i % 2 ? '#ffd04a' : '#ff6a1a');
  }

  // ---------------- Heraldo del Motor ----------------
  function heraldo(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [2, -8, -2][f] : anim === 'hurt' ? 3 : 0;
    const cx = ox + lunge, cy = oy - 46 + Math.sin(t) * 2.5;
    // tentáculos de cadena
    for (let k = 0; k < 6; k++) {
      const bx = cx - 12 + k * 5;
      for (let i = 0; i < 9; i++) { const x = bx + Math.sin(t + k + i * 0.6) * (1 + i * 0.5), y = cy + 12 + i * 3.6; E(x, y, 1.6, 1.3, '#2a2a34'); R(x - 0.5, y - 0.5, 1, 1, '#8a8aa0'); }
    }
    // anillo de engranajes
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + f * 0.3; R(cx + Math.cos(a) * 19 - 1.5, cy + Math.sin(a) * 9 - 1.5, 3, 3, '#7a5a20'); }
    E(cx, cy, 18, 8, '#3a2a10'); E(cx, cy - 1, 16, 6, '#8a6a2a');
    // campana-farol de cristal
    E(cx, cy - 6, 15, 14, '#0a1418'); E(cx, cy - 6, 13, 12, 'rgba(60,180,190,0.55)'); E(cx - 4, cy - 10, 5, 5, 'rgba(200,250,250,0.5)');
    // llama turquesa dentro
    const fl = 5 + ((Math.sin(t * 2) + 1) * 2) | 0;
    E(cx, cy - 4, 5, fl, '#1aa8b8'); E(cx, cy - 3, 3, fl - 2, '#8ff8f0'); E(cx, cy - 2, 1.5, 2, '#ffffff');
    // remate y ojos
    R(cx - 2, cy - 22, 4, 4, '#8a6a2a'); E(cx, cy - 24, 3, 2, '#d8b060'); line(g, [[cx, cy - 26], [cx - 3, cy - 32]], '#5a4a20', 1);
    R(cx - 8, cy - 8, 3, 2, '#e8fff8'); R(cx - 3, cy - 8, 3, 2, '#e8fff8'); R(cx - 7, cy - 8, 1, 1, '#06282e'); R(cx - 2, cy - 8, 1, 1, '#06282e');
    if (anim === 'cast') for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + f; R(cx + Math.cos(a) * 28, cy - 6 + Math.sin(a) * 20, 2, 2, '#8ff8f0'); }
  }

  TH.foePaint('gargola_arena', gargola, [80, 60, 36, 56], '#0a0806', [16, 3]);
  TH.foePaint('jardinero', jardinero, [64, 64, 30, 60], '#0a0804', [12, 3]);
  TH.foePaint('polilla_tinta', polillaTinta, [76, 64, 32, 60], '#04020a', [10, 3]);
  TH.foePaint('salamandra', salamandra, [92, 48, 44, 44], '#0a0402', [20, 3]);
  TH.foePaint('heraldo', heraldo, [72, 96, 34, 92], '#020a0c', [14, 3]);
  TH.foeVariant('gargola_reina', 'gargola_arena', 30, 1.3, 0.85, '#0a0402');
  TH.foeVariant('jardinero_mayor', 'jardinero', 110, 0.9, 0.8, '#040a04');
  TH.foeVariant('polilla_archivera', 'polilla_tinta', -60, 1.4, 0.9, '#0a020a');
  TH.foeVariant('salamandra_reina', 'salamandra', -20, 1.2, 1.05, '#0a0200');
  TH.foeVariant('heraldo_mayor', 'heraldo', 160, 1.2, 0.9, '#0a0210');
})();
