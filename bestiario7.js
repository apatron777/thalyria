// Diseños propios del prólogo, capítulo 1 y postgame. Miran a la izquierda.
// · Larva voraz: gusano abisal segmentado con boca de lamprea en anillos de dientes y manchas que brillan.
// · Cangrejo de roca: cangrejo ermitaño con una roca por concha (percebes, musgo) y una pinza enorme.
// · Gaviota abisal: ave del Fondo de plumas negras deshilachadas, ojos violetas, pico ganchudo que gotea.
// · Matriarca abisal: larva reina colosal erguida, con la luz robada del faro brillando en su vientre,
//   corona de antenas, mandíbulas y muchas patas.
// · Medusa primordial: medusa gigante con campana translúcida, órganos que brillan y tentáculos larguísimos.
// · Eco primordial: manta espectral de luz con runas antiguas y estela.
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

  // ---------------- Larva voraz ----------------
  function larvaVoraz(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [3, -9, -3][f] : anim === 'hurt' ? 3 : 0;
    const C = ['#1a0806', '#4a1410', '#8a2a1a', '#c8502a'];
    // cuerpo segmentado de cola (derecha) a cabeza (izquierda)
    const segs = 6;
    for (let i = segs - 1; i >= 0; i--) {
      const k = i / (segs - 1), x = ox + 14 - i * 5.5 + lunge * (1 - k), y = oy - 7 - Math.sin(t + i * 0.9) * 1.5 - (1 - k) * 4, r = 5 + Math.sin(k * Math.PI) * 3 + (1 - k) * 2;
      E(x, y, r + 1, r, C[0]); E(x, y, r, r - 1, C[1]); E(x - 1, y - 2, r * 0.6, r * 0.4, C[2]);
      R(x - 1, y - r + 1, 2, 1, C[3]); E(x + 1, y + 1, 1.2, 1.2, i % 2 ? '#ffb04a' : '#ff7a2a');
      R(x - 2, y + r - 1, 1, 2, C[0]); R(x + 2, y + r - 1, 1, 2, C[0]);
    }
    // cabeza: boca redonda de lamprea
    const hx = ox - 18 + lunge, hy = oy - 14 - Math.sin(t) * 1.5, mo = anim === 'attack' && f === 1 ? 7 : 5;
    E(hx + 2, hy, 8, 8, C[0]); E(hx + 2, hy, 7, 7, C[1]);
    E(hx - 1, hy, mo, mo + 1, '#2a0408'); E(hx - 1, hy, mo - 1.5, mo - 0.5, '#8a1424');
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; R(hx - 1 + Math.cos(a) * (mo - 1) - 0.5, hy + Math.sin(a) * mo - 0.5, 1, 1, '#f4e8d0'); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; R(hx - 1 + Math.cos(a) * (mo - 3) - 0.5, hy + Math.sin(a) * (mo - 2.5) - 0.5, 1, 1, '#e8d8c0'); }
    E(hx - 1, hy, 1.5, 1.5, '#000000');
    // ojillos y antenas
    R(hx + 4, hy - 5, 2, 2, '#ffd23a'); R(hx + 7, hy - 4, 1, 1, '#ffd23a');
    line(g, [[hx + 4, hy - 6], [hx + 2, hy - 12], [hx - 2 + Math.sin(t) * 2, hy - 15]], C[2], 1);
    line(g, [[hx + 6, hy - 6], [hx + 8, hy - 13], [hx + 6 + Math.sin(t + 1) * 2, hy - 16]], C[2], 1);
    if (anim === 'cast') for (let i = 0; i < 5; i++) R(hx - 8 - i * 3, hy - 2 + (i % 2) * 3, 2, 2, '#ff9a3a');
  }

  // ---------------- Cangrejo de roca ----------------
  function cangrejoRoca(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, lunge = anim === 'attack' ? [2, -8, -2][f] : 0, bob = anim === 'idle' ? Math.round(Math.sin(t)) : 0;
    const cx = ox + 2 + lunge * 0.4, cy = oy - 10 + bob;
    // patas
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const x = cx + s * (6 + i * 3), k = Math.sin(t + i + (s > 0 ? 1 : 0)) * 1; line(g, [[x, cy + 2], [x + s * 4, cy + 5 + k], [x + s * 5, oy - 1]], '#5a1a0a', 1.4); }
    // concha de roca (detrás/arriba)
    const rx = cx + 6, ry = cy - 9;
    E(rx, ry, 16, 13, '#1a1814'); E(rx, ry - 1, 15, 12, '#4a463e'); E(rx - 3, ry - 4, 10, 7, '#6a6458'); E(rx - 6, ry - 7, 4, 2, '#8a8478');
    for (const [dx, dy] of [[-8, 2], [4, -6], [8, 4], [-2, 6], [10, -2]]) { E(rx + dx, ry + dy, 2.4, 2, '#d8d0b8'); R(rx + dx - 0.5, ry + dy - 0.5, 1, 1, '#2a2620'); }
    for (let i = 0; i < 6; i++) R(rx - 12 + i * 4, ry - 10 + (i % 3), 3, 2, i % 2 ? '#3a6a2a' : '#5a8a3a');
    line(g, [[rx - 2, ry - 12], [rx + 2, ry - 2], [rx - 1, ry + 6]], '#2a2620', 1);
    // cuerpo
    E(cx - 2, cy, 10, 6, '#3a0e06'); E(cx - 2, cy - 1, 9, 5, '#a83a1a'); E(cx - 4, cy - 3, 5, 2, '#d8642a');
    // ojos en pedúnculo
    for (const dx of [-7, -3]) { line(g, [[cx + dx, cy - 4], [cx + dx - 1, cy - 10]], '#7a2a10', 1.2); E(cx + dx - 1, cy - 11, 1.8, 1.8, '#000000'); R(cx + dx - 1.5, cy - 11.5, 1, 1, '#ffffff'); }
    // pinza enorme (izquierda) y pinza pequeña
    const op = anim === 'attack' && f === 1 ? 5 : 2;
    seg(E, cx - 8, cy + 1, cx - 15 + lunge, cy - 2, 2.5, 3, '#7a2a10');
    E(cx - 21 + lunge, cy - 4, 7, 5, '#3a0e06'); E(cx - 21 + lunge, cy - 5, 6, 4, '#c84a1a'); R(cx - 24 + lunge, cy - 8, 4, 1, '#ff8a4a');
    poly(g, [[cx - 26 + lunge, cy - 4], [cx - 32 + lunge, cy - 6 - op], [cx - 27 + lunge, cy - 7]], '#a83a1a');
    poly(g, [[cx - 26 + lunge, cy - 2], [cx - 32 + lunge, cy + op - 1], [cx - 26 + lunge, cy]], '#7a2a10');
    E(cx + 8, cy + 2, 3.5, 2.5, '#a83a1a'); R(cx + 10, cy + 1, 3, 1, '#7a2a10');
  }

  // ---------------- Gaviota abisal ----------------
  function gaviotaAbisal(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, flap = anim === 'idle' ? Math.sin(t * 2) : anim === 'attack' ? [1, -1, 0][f] : 0.3;
    const lunge = anim === 'attack' ? [3, -12, -4][f] : 0, cx = ox + lunge, cy = oy - 26 + Math.round(Math.sin(t) * 2);
    const B = ['#06040c', '#16122a', '#2a2448', '#4a4070'];
    // alas deshilachadas
    for (const s of [1, -1]) {
      const wy = cy - 4 - flap * 10, back = s > 0;
      const tipX = cx + s * 24, pts = [[cx + s * 3, cy - 2], [cx + s * 12, wy - 4], [tipX, wy + 2], [cx + s * 20, wy + 6], [cx + s * 22, wy + 9], [cx + s * 15, wy + 8], [cx + s * 16, wy + 11], [cx + s * 8, cy + 3]];
      poly(g, pts, back ? B[1] : B[2]); line(g, [[cx + s * 3, cy - 2], [cx + s * 12, wy - 4], [tipX, wy + 2]], back ? B[2] : B[3], 1);
      for (let i = 0; i < 3; i++) R(cx + s * (10 + i * 4), wy + 3 + i, 1, 1, '#8a5aff');
    }
    // cuerpo
    E(cx + 4, cy + 2, 9, 6, B[0]); E(cx + 3, cy + 1, 8, 5, B[1]); E(cx + 1, cy + 3, 5, 3, B[2]);
    poly(g, [[cx + 10, cy], [cx + 18, cy - 2], [cx + 17, cy + 4], [cx + 10, cy + 4]], B[1]);
    // cabeza y pico ganchudo
    E(cx - 6, cy - 4, 5, 4.5, B[0]); E(cx - 6, cy - 5, 4, 3.5, B[2]);
    poly(g, [[cx - 10, cy - 6], [cx - 18, cy - 4], [cx - 19, cy - 1], [cx - 16, cy - 2], [cx - 10, cy - 2]], '#c8a03a');
    R(cx - 18, cy - 2, 2, 2, '#8a6a1a');
    E(cx - 7, cy - 6, 1.8, 1.4, '#c84aff'); R(cx - 8, cy - 7, 1, 1, '#ffffff');
    // goteo del Fondo
    for (let i = 0; i < 2; i++) R(cx - 17, cy + 1 + ((f * 3 + i * 4) % 9), 1, 2, '#6a2a9a');
    // patas
    line(g, [[cx + 2, cy + 6], [cx, cy + 11]], '#8a6a1a', 1); line(g, [[cx + 5, cy + 6], [cx + 4, cy + 11]], '#8a6a1a', 1);
    if (anim === 'cast') for (let i = 0; i < 6; i++) R(cx - 20 + rnd(i + f) * 30, cy - 18 + rnd(i * 2 + f) * 10, 2, 2, '#c84aff');
  }

  // ---------------- Matriarca abisal ----------------
  function matriarca(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, sw = anim === 'idle' ? Math.sin(t) * 2 : 0, lunge = anim === 'attack' ? [4, -12, -4][f] : anim === 'hurt' ? 5 : 0;
    const C = ['#0e0408', '#2e0c1a', '#5a1a32', '#8a3a52', '#c86a7a'];
    // charco
    E(ox, oy - 2, 46, 6, '#06020a'); E(ox, oy - 3, 38, 3.5, '#1a0812');
    // cola en el suelo (derecha) y cuerpo erguido (columna de segmentos)
    const pts = [[ox + 40, oy - 8], [ox + 30, oy - 10], [ox + 18, oy - 12], [ox + 8, oy - 18], [ox + 2 + sw * 0.3, oy - 30], [ox - 2 + sw * 0.6, oy - 44], [ox - 4 + sw + lunge * 0.4, oy - 58], [ox - 8 + sw + lunge * 0.7, oy - 70]];
    const rad = [5, 8, 11, 15, 17, 16, 13, 11];
    // patas a lo largo
    for (let i = 1; i < 7; i++) { const p = pts[i]; for (const s of [-1, 1]) { const k = Math.sin(t + i) * 2; line(g, [[p[0] + s * rad[i] * 0.6, p[1] + 2], [p[0] + s * (rad[i] + 6), p[1] + 4 + k], [p[0] + s * (rad[i] + 7), p[1] + 10 + k]], C[0], 1.6); } }
    for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = rad[i]; E(x, y, r + 1, r * 0.82 + 1, C[0]); }
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i], r = rad[i];
      E(x, y, r, r * 0.82, C[1]); E(x + r * 0.15, y - r * 0.15, r * 0.7, r * 0.55, C[2]); R(x - r * 0.5, y - r * 0.75, r * 0.8, 1, C[3]);
      for (const s of [-1, 1]) E(x + s * r * 0.6, y, 1.4, 1.4, '#ffb04a');
    }
    // la luz robada del faro, latiendo en el vientre
    const glow = anim === 'cast' ? 1.25 : f % 2 ? 1 : 0.88, bx = pts[4][0] - 2, by = pts[4][1] + 2;
    E(bx, by, 12 * glow, 10 * glow, 'rgba(255,200,90,0.28)'); E(bx, by, 8 * glow, 7 * glow, '#ffb84a'); E(bx, by, 5 * glow, 4.5 * glow, '#ffe8a0'); E(bx - 1, by - 1, 2, 2, '#ffffff');
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + t * 0.3; line(g, [[bx + Math.cos(a) * 7, by + Math.sin(a) * 6], [bx + Math.cos(a) * 13, by + Math.sin(a) * 11]], '#ff9a3a', 0.8); }
    // cabeza
    const [hx0, hy0] = pts[7], hx = hx0 - 4, hy = hy0 - 6;
    // corona de antenas
    for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.35, L = 16 + (i === 2 ? 6 : i % 2 * 3); line(g, [[hx + 2, hy - 6], [hx + 2 + Math.cos(a) * L * 0.6, hy - 6 + Math.sin(a) * L * 0.6], [hx + 2 + Math.cos(a + 0.3 + Math.sin(t + i) * 0.1) * L, hy - 6 + Math.sin(a + 0.3) * L]], C[3], 1.2); E(hx + 2 + Math.cos(a + 0.3) * L, hy - 6 + Math.sin(a + 0.3) * L, 1.4, 1.4, '#ffd27a'); }
    E(hx, hy, 12, 10, C[0]); E(hx, hy - 1, 11, 9, C[2]); E(hx - 2, hy - 4, 6, 4, C[3]);
    // ojos múltiples
    for (const [dx, dy, r] of [[-6, -3, 2], [-1, -5, 1.6], [3, -3, 1.4], [-4, 1, 1.2]]) { E(hx + dx, hy + dy, r, r, '#ffd23a'); R(hx + dx - 0.5, hy + dy - 0.5, 1, 1, '#000000'); }
    // mandíbulas
    const op = anim === 'attack' && f === 1 ? 6 : anim === 'cast' ? 4 : 2;
    poly(g, [[hx - 8, hy + 4], [hx - 18, hy + 2 - op], [hx - 14, hy + 6], [hx - 6, hy + 7]], '#d8c8a8');
    poly(g, [[hx - 8, hy + 7], [hx - 18, hy + 10 + op], [hx - 13, hy + 9], [hx - 5, hy + 9]], '#b8a888');
    E(hx - 9, hy + 6, 3, 1 + op * 0.4, '#3a0410');
    if (anim === 'cast') for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f; R(bx + Math.cos(a) * 22, by + Math.sin(a) * 18, 2, 2, '#ffd27a'); }
  }

  // ---------------- Medusa primordial ----------------
  function medusaPrimordial(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, pulse = anim === 'idle' ? Math.sin(t) * 2 : anim === 'cast' ? 3 : 0, lunge = anim === 'attack' ? [2, -8, -2][f] : 0;
    const cx = ox + lunge, cy = oy - 54 + Math.round(Math.sin(t) * 2);
    // tentáculos largos
    for (let i = 0; i < 7; i++) {
      const x0 = cx - 14 + i * 4.6, pts = [];
      for (let k = 0; k <= 8; k++) pts.push([x0 + Math.sin(t + i + k * 0.7) * (1 + k * 0.6), cy + 8 + k * 6]);
      line(g, pts, i % 2 ? '#8a3ae0' : '#c87aff', i % 3 === 0 ? 1.6 : 1);
      if (i % 2 === 0) for (let k = 2; k <= 8; k += 3) R(pts[k][0] - 0.5, pts[k][1], 1, 1, '#ffd0ff');
    }
    // brazos orales (centro)
    for (const dx of [-4, 3]) { const pts = []; for (let k = 0; k <= 5; k++) pts.push([cx + dx + Math.sin(t * 1.3 + k + dx) * 2, cy + 6 + k * 5]); line(g, pts, '#f0a8ff', 3); line(g, pts, '#fff0ff', 1); }
    // campana translúcida
    const bw = 20 + pulse, bh = 15 - pulse * 0.5;
    E(cx, cy, bw + 1, bh + 1, 'rgba(40,10,70,0.9)');
    g.fillStyle = 'rgba(150,80,230,0.75)'; g.beginPath(); g.ellipse(cx, cy, bw, bh, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(200,140,255,0.55)'; g.beginPath(); g.ellipse(cx - 3, cy - 3, bw * 0.7, bh * 0.65, 0, Math.PI, 0); g.fill();
    // borde ondulado
    for (let i = 0; i < 10; i++) E(cx - bw + i * (bw * 2 / 9), cy + 1, 2.4, 2, '#a85ae8');
    // órganos que brillan
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI + t * 0.2; E(cx + Math.cos(a) * 8, cy - 5 + Math.sin(a) * 2, 3, 2.4, i % 2 ? '#ffd27a' : '#7af0ff'); }
    E(cx, cy - 6, 4, 3.4, '#ffffff');
    R(cx - 12, cy - 11, 6, 1, '#f0d8ff');
    if (anim === 'cast') for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + f; R(cx + Math.cos(a) * 28, cy + Math.sin(a) * 22, 2, 2, '#ffd0ff'); }
  }

  // ---------------- Eco primordial ----------------
  function ecoPrimordial(anim, f, R, E, ox, oy, g) {
    const t = (f / 4) * Math.PI * 2, flap = anim === 'idle' ? Math.sin(t) * 5 : anim === 'attack' ? [3, -4, 0][f] : 0, lunge = anim === 'attack' ? [3, -12, -4][f] : 0;
    const cx = ox + lunge, cy = oy - 24 + Math.round(Math.sin(t) * 2);
    // estela
    for (let i = 0; i < 6; i++) E(cx + 18 + i * 5, cy + Math.sin(t + i) * 2, 4 - i * 0.6, 3 - i * 0.4, 'rgba(90,240,220,' + (0.45 - i * 0.07) + ')');
    // cola fina
    line(g, [[cx + 10, cy], [cx + 24, cy + Math.sin(t) * 3], [cx + 34, cy - 2 + Math.sin(t + 1) * 4]], '#3ac8c0', 1.2);
    // alas de manta
    poly(g, [[cx - 10, cy], [cx + 4, cy - 16 - flap], [cx + 30, cy - 18 - flap], [cx + 12, cy - 2], [cx + 30, cy + 16 + flap], [cx + 4, cy + 14 + flap]], 'rgba(10,60,70,0.95)');
    poly(g, [[cx - 8, cy], [cx + 4, cy - 13 - flap], [cx + 24, cy - 15 - flap], [cx + 10, cy - 1]], 'rgba(40,160,170,0.85)');
    poly(g, [[cx - 8, cy + 1], [cx + 4, cy + 11 + flap], [cx + 24, cy + 13 + flap], [cx + 10, cy + 2]], 'rgba(20,110,130,0.85)');
    line(g, [[cx + 4, cy - 13 - flap], [cx + 30, cy - 18 - flap]], '#bff8f0', 1); line(g, [[cx + 4, cy + 13 + flap], [cx + 30, cy + 16 + flap]], '#7ad8d0', 1);
    // cuerpo y cuernos cefálicos
    E(cx - 2, cy, 12, 6, '#06282e'); E(cx - 3, cy - 1, 10, 4.5, '#2a8a90'); R(cx - 10, cy - 3, 8, 1, '#bff8f0');
    poly(g, [[cx - 12, cy - 3], [cx - 20, cy - 8], [cx - 14, cy - 1]], '#2a8a90'); poly(g, [[cx - 12, cy + 3], [cx - 20, cy + 7], [cx - 14, cy + 1]], '#1a6a70');
    E(cx - 9, cy - 2, 1.8, 1.6, '#fffbe0'); R(cx - 9.5, cy - 2.5, 1, 1, '#000000');
    // runas antiguas
    const rc = f % 2 ? '#ffd27a' : '#fff4c0';
    for (const [x, y] of [[6, -8], [14, -10], [6, 8], [14, 9], [-2, 0]]) { R(cx + x, cy + y, 1, 3, rc); R(cx + x - 1, cy + y + 1, 3, 1, rc); }
    if (anim === 'cast') for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f; R(cx + Math.cos(a) * 26, cy + Math.sin(a) * 18, 2, 2, '#bff8f0'); }
  }

  TH.foePaint('larva_voraz', larvaVoraz, [52, 36, 28, 33], '#0a0204', [12, 3]);
  TH.foePaint('cangrejo_roca', cangrejoRoca, [56, 44, 30, 41], '#0a0806', [14, 3]);
  TH.foePaint('gaviota_abisal', gaviotaAbisal, [60, 50, 28, 46], '#04020a', [10, 3]);
  TH.foePaint('larva_madre', matriarca, [104, 104, 52, 100], '#04000a', [30, 5]);
  TH.foePaint('medusa_primordial', medusaPrimordial, [64, 96, 32, 92], '#0a0414', [14, 3]);
  TH.foePaint('eco_primordial', ecoPrimordial, [80, 56, 40, 52], '#020a0c', [14, 3]);
  const E0 = TH.data.enemies;
  if (E0.matriarca) Object.assign(E0.matriarca, { scale: 1, zoom: 1, camY: 18, markH: 96 });
  for (const k of ['larva_voraz', 'cangrejo_roca', 'gaviota_abisal', 'medusa_primordial', 'eco_primordial']) if (E0[k]) E0[k].scale = 1;
})();
