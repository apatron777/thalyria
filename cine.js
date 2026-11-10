// Cinemáticas a pantalla completa: escenas ilustradas y animadas (fondos procedurales + sprites reales del juego),
// con bandas de cine y subtítulos. Se lanzan desde los guiones con { cine: 'id' }.
// Controles: mantener B acelera ×3 · Esc (menú) salta.
(function () {
  'use strict';
  const TH = window.TH, W = TH.W, H = TH.H;
  const lerp = (a, b, k) => a + (b - a) * k, cl = (k) => (k < 0 ? 0 : k > 1 ? 1 : k), sm = (k) => { k = cl(k); return k * k * (3 - 2 * k); };
  const seg = (t, a, b) => sm((t - a) / (b - a));
  const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

  // ---------- piezas de dibujo ----------
  const C = {
    sky(g, a, b, y1) { const gr = g.createLinearGradient(0, 0, 0, y1 || H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, y1 || H); },
    stars(g, t, n, a) { for (let i = 0; i < n; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 2 + i); g.fillStyle = 'rgba(255,255,240,' + (a * tw).toFixed(2) + ')'; g.fillRect((rnd(i) * W) | 0, (rnd(i + 99) * 110) | 0, 1, 1); } },
    moon(g, x, y, r, c) { g.fillStyle = c || '#f4f0d8'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,230,.12)'; g.beginPath(); g.arc(x, y, r * 2.2, 0, 7); g.fill(); },
    sea(g, y0, t, top, bot, glint) {
      const gr = g.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, y0, W, H - y0);
      for (let r = 0; r < 14; r++) { const y = y0 + 3 + r * r * 0.9; if (y > H) break; g.fillStyle = glint || 'rgba(220,240,255,.22)'; for (let i = 0; i < 10; i++) { const x = ((rnd(r * 13 + i) * W + t * (6 + r * 2)) % (W + 30)) - 15; g.fillRect(x | 0, y | 0, 4 + r, 1); } }
    },
    hills(g, y, c, amp, seed) { g.fillStyle = c; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 6) g.lineTo(x, y - Math.abs(Math.sin(x * 0.013 + seed)) * amp - Math.sin(x * 0.05 + seed * 3) * amp * 0.2); g.lineTo(W, H); g.fill(); },
    // faro: lit 0..1, beam ángulo
    tower(g, x, by, h, lit, t, beam) {
      g.fillStyle = '#2a2236'; g.fillRect(x - 9, by - h, 18, h);
      for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#e8e0d0' : '#b83a32'; g.fillRect(x - 8 + i * 0.4, by - h + 10 + i * (h - 14) / 4, 16 - i * 0.8, (h - 14) / 4); }
      g.fillStyle = '#1a1424'; g.fillRect(x - 11, by - h - 2, 22, 3); g.fillRect(x - 7, by - h - 14, 14, 12); g.fillRect(x - 9, by - h - 18, 18, 4);
      if (lit > 0) {
        g.fillStyle = 'rgba(255,230,140,' + (lit * 0.9).toFixed(2) + ')'; g.fillRect(x - 5, by - h - 12, 10, 8);
        g.fillStyle = 'rgba(255,240,180,' + (lit * 0.25).toFixed(2) + ')'; g.beginPath(); g.arc(x, by - h - 8, 22 * lit, 0, 7); g.fill();
        if (beam != null) { const a = beam, L = 260; g.fillStyle = 'rgba(255,240,180,' + (lit * 0.16).toFixed(2) + ')'; g.beginPath(); g.moveTo(x, by - h - 8); g.lineTo(x + Math.cos(a - 0.09) * L, by - h - 8 + Math.sin(a - 0.09) * L * 0.25); g.lineTo(x + Math.cos(a + 0.09) * L, by - h - 8 + Math.sin(a + 0.09) * L * 0.25); g.fill(); }
      }
    },
    orb(g, x, y, r, c) { for (let i = 3; i >= 1; i--) { g.fillStyle = c.replace('A', (0.12 * (4 - i)).toFixed(2)); g.beginPath(); g.arc(x, y, r * i * 0.7, 0, 7); g.fill(); } g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r * 0.3, 0, 7); g.fill(); },
    ring(g, x, y, r, c, w) { g.strokeStyle = c; g.lineWidth = w || 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); },
    // ola negra gigante
    wave(g, x0, x1, top, t, c, foam) {
      g.fillStyle = c; g.beginPath(); g.moveTo(x0, H);
      for (let x = x0; x <= x1; x += 4) g.lineTo(x, top + Math.sin(x * 0.04 + t * 3) * 6 + Math.sin(x * 0.11 - t * 2) * 3);
      g.lineTo(x1, H); g.fill();
      if (foam) for (let x = x0; x <= x1; x += 3) { const y = top + Math.sin(x * 0.04 + t * 3) * 6 + Math.sin(x * 0.11 - t * 2) * 3; g.fillStyle = 'rgba(200,170,255,.6)'; g.fillRect(x, y - 1, 2, 1); }
    },
    // sprite de personaje escalado (anim/dir del juego)
    hero(g, id, x, y, s, dir, anim, f, alpha) {
      const def = TH.chars.defs[id]; if (!def) return;
      const a = { def, x: 0, sy: 0, dir: dir || 'right', anim: anim || 'idle', frame: f | 0, big: !!def.big, chains: null };
      TH.chars.initChains(a);
      g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(s, s); if (alpha != null) g.globalAlpha = alpha; TH.chars.draw(g, a, alpha); g.restore();
    },
    foe(g, sprite, x, y, s, anim, f, flip, alpha) {
      const E = TH.data.enemies[sprite], sp = (E && E.sprite) || sprite;
      let im = null; try { im = TH.foes.frame(sp, anim || 'idle', f | 0, false); } catch (e) { im = null; } if (!im) return;
      g.save(); g.globalAlpha = alpha == null ? 1 : alpha; g.translate(Math.round(x), Math.round(y)); if (flip) g.scale(-1, 1); g.scale(s, s);
      g.drawImage(im, -im.width / 2, -im.height); g.restore();
    },
    motes(g, t, n, c, rise) { for (let i = 0; i < n; i++) { const x = (rnd(i) * W + Math.sin(t + i) * 8) % W, y = (H - ((t * (rise || 12) + rnd(i + 7) * H) % H)); g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1 + (i % 2)); } },
    vignette(g, a) { const gr = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 240); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + a + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H); },
  };

  // ---------- las cinemáticas ----------
  const CINE = {
    // Prólogo: el faro de Bruma se apaga y la Matriarca bebe su luz
    apagon: { dur: 8, music: 'amenaza', caps: [[0.2, 2.4, 'Aquella noche, el faro de Bruma Salada tembló.'], [2.6, 4.6, 'Y el mar respondió.'], [4.8, 8, 'Algo enorme subió desde el Fondo… a beberse la luz.']],
      draw(g, t) {
        C.sky(g, '#0a0a24', '#26204a', 140); C.stars(g, t, 50, 0.8); C.moon(g, 320, 34, 9, '#d8d4e8');
        const lit = t < 2.4 ? 1 : t < 3 ? (Math.sin(t * 40) > 0 ? 0.8 : 0.1) : Math.max(0, 1 - (t - 3) * 2);
        C.hills(g, 150, '#141228', 18, 2); C.tower(g, 96, 150, 70, lit, t, t * 0.9);
        C.sea(g, 140, t, '#0c1a3a', '#050812', 'rgba(160,140,255,.18)');
        const rise = seg(t, 3, 5.5), my = lerp(260, 176, rise);
        if (rise > 0) C.foe(g, 'larva_madre', 250, my, 1.4, 'cast', (t * 4) | 0, false);
        if (t > 4.6) for (let i = 0; i < 18; i++) { const k = ((t * 0.7 + i / 18) % 1); g.fillStyle = 'rgba(255,220,130,' + (0.8 - k * 0.5).toFixed(2) + ')'; g.fillRect(lerp(96, 244, k) | 0, (lerp(76, my - 70, k) - Math.sin(k * 3.14) * 20) | 0, 2, 2); }
        if (t > 2.9 && t < 3.1) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(0, 0, W, H); }
      } },
    // Prólogo: la Lanza del Alba despierta
    lanza: { dur: 6, music: 'grupo', caps: [[0.3, 2.8, 'La vieja lanza de pesca arde en las manos de Kaelen.'], [3, 6, 'La Lanza del Alba ha despertado.']],
      draw(g, t) {
        C.sky(g, '#0a0820', '#1a1438');
        for (let i = 0; i < 4; i++) C.ring(g, 192, 120, ((t * 40 + i * 30) % 140), 'rgba(255,230,150,' + (0.5 - ((t * 40 + i * 30) % 140) / 300).toFixed(2) + ')', 2);
        C.orb(g, 214, 92, 10 + Math.sin(t * 6) * 2 + seg(t, 2.5, 3.5) * 14, 'rgba(255,220,120,A)');
        C.hero(g, 'kaelen', 192, 168, 3, 'right', t > 2.5 ? 'cast' : 'idle', (t * 6) | 0);
        C.motes(g, t, 40, 'rgba(255,230,160,.8)', 30);
        if (t > 2.6 && t < 3.0) { g.fillStyle = 'rgba(255,250,220,' + (1 - (t - 2.6) / 0.4).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
      } },
    // Prólogo: la Matriarca se deshace y la luz queda libre
    matriarca: { dur: 6.5, music: 'triste', caps: [[0.3, 3, 'La Matriarca se deshace en espuma negra…'], [3.2, 6.5, '…y la luz que robó vuelve a ser libre.']],
      draw(g, t) {
        C.sky(g, '#0c0a1c', '#1c1630'); C.sea(g, 160, t, '#120c24', '#050308', 'rgba(140,120,200,.15)');
        const k = seg(t, 0.4, 3.4);
        C.foe(g, 'larva_madre', 192, 170 + k * 50, 1.6, 'hurt', 0, false, 1 - k);
        for (let i = 0; i < 40 * k; i++) { g.fillStyle = 'rgba(30,20,40,.8)'; g.fillRect((150 + rnd(i) * 90) | 0, (120 + rnd(i + 3) * 60 - t * 6) | 0, 3, 2); }
        const oy = lerp(130, 70, seg(t, 2.6, 6));
        if (t > 1.5) C.orb(g, 192, oy, 8 + Math.sin(t * 5) * 1.5, 'rgba(255,220,120,A)');
        C.motes(g, t, 30, 'rgba(255,220,140,.7)', 20);
      } },
    // Prólogo: la luz sube por la torre y amanece
    faro_alba: { dur: 7, music: 'vael', caps: [[0.3, 3.3, 'La luz sube por la torre como sube la marea…'], [3.5, 7, '…y el Ojo del Alba vuelve a mirar el mar.']],
      draw(g, t) {
        const d = seg(t, 2, 7);
        C.sky(g, d > 0.5 ? '#f2a46a' : '#24204a', d > 0.5 ? '#ffe0a0' : '#5a4870', 140);
        g.fillStyle = 'rgba(255,200,120,' + d.toFixed(2) + ')'; g.beginPath(); g.arc(300, 150 - d * 30, 16, 0, 7); g.fill();
        C.hills(g, 150, '#2a2440', 18, 2);
        const climb = seg(t, 0.3, 3);
        C.tower(g, 120, 150, 72, climb >= 1 ? 1 : 0, t, climb >= 1 ? -0.3 + Math.sin(t * 0.8) * 0.6 : null);
        if (climb < 1) { const y = lerp(150, 72, climb); C.orb(g, 120, y, 6, 'rgba(255,230,140,A)'); }
        C.sea(g, 140, t, d > 0.5 ? '#3a6aa8' : '#16204a', '#0a1028', 'rgba(255,230,180,.3)');
        for (let i = 0; i < 3; i++) { const bx = (t * 20 + i * 90) % (W + 20), by = 60 + i * 12 + Math.sin(t * 2 + i) * 4; g.fillStyle = '#ffffff'; g.fillRect(bx | 0, by | 0, 3, 1); g.fillRect((bx + 3) | 0, (by - 1) | 0, 2, 1); }
      } },
    // Capítulo 1: la ola negra se alza sobre el arrecife
    ola: { dur: 6, music: 'amenaza', caps: [[0.3, 2.8, 'Una ola negra se levanta sobre el arrecife…'], [3, 6, '…tan alta como el faro del Vigía.']],
      draw(g, t) {
        const d = seg(t, 0, 3);
        C.sky(g, d > 0.4 ? '#2a2440' : '#7ab0d8', d > 0.4 ? '#4a3a5a' : '#c8e0e8', 150);
        C.sea(g, 150, t, '#2a5a7a', '#0a2030');
        const top = lerp(170, 18, seg(t, 0.5, 4.5));
        C.wave(g, 0, W, top, t, '#0a0614', true);
        ['firion', 'flint', 'elara', 'kaelen'].forEach((id, i) => C.hero(g, id, 120 + i * 40, 196, 1.6, 'left', 'idle', (t * 6) | 0));
        if (t > 4.5) C.motes(g, t, 30, 'rgba(180,150,255,.7)', -20);
      } },
    // Capítulo 1: Elara parte la ola en dos
    escudo: { dur: 5, music: 'accion', caps: [[0.3, 5, 'Elara alza el bastón. La ola se parte en dos.']],
      draw(g, t) {
        C.sky(g, '#1a1430', '#3a2a50');
        const open = seg(t, 1, 3) * 120;
        C.wave(g, 0, 192 - open, 20, t, '#0a0614', true); C.wave(g, 192 + open, W, 20, t + 1, '#0a0614', true);
        C.ring(g, 192, 120, 30 + seg(t, 0.8, 2.5) * 60, 'rgba(220,220,255,.7)', 3); C.ring(g, 192, 120, 20 + seg(t, 0.8, 2.5) * 40, 'rgba(200,200,255,.4)', 2);
        C.orb(g, 200, 92, 9, 'rgba(210,210,255,A)');
        C.hero(g, 'elara', 192, 176, 3, 'right', 'cast', (t * 6) | 0);
        C.motes(g, t, 40, 'rgba(220,220,255,.8)', 25);
      } },
    // Capítulo 1: el mar se lleva a Elara
    rapto: { dur: 10, music: 'triste', caps: [[0.3, 2.8, 'Pero el mar no suelta lo que agarra.'], [3, 5.6, 'Solo lo cambia por otra cosa.'], [6, 10, 'La marea negra se retira… y se lleva a Elara al Fondo.']],
      draw(g, t) {
        C.sky(g, '#120e22', '#2a2040', 150); C.sea(g, 150, t, '#140c24', '#04020a', 'rgba(160,120,220,.18)');
        const pull = seg(t, 3, 8.5), ex = lerp(150, 170, pull), ey = lerp(176, 250, pull);
        // manos de agua negra
        for (let i = 0; i < 5; i++) { const a = -1.3 + i * 0.35; g.strokeStyle = i % 2 ? '#2a1048' : '#1a0a30'; g.lineWidth = 5 - i * 0.5; g.beginPath(); g.moveTo(ex + Math.cos(a) * 60, 230); g.quadraticCurveTo(ex + Math.cos(a) * 40 + Math.sin(t * 3 + i) * 8, ey - 20, ex + Math.cos(a) * 8, ey - 22 + i * 3); g.stroke(); }
        C.hero(g, 'elara', ex, ey, 2.4, 'right', 'hurt', 0, 1 - seg(t, 7.5, 9));
        // Kaelen alarga la mano, retenido
        C.hero(g, 'kaelen', 252, 180, 2.4, 'left', t > 3 ? 'attack' : 'idle', t > 3 ? 1 : (t * 6) | 0);
        C.hero(g, 'firion', 300, 182, 2.0, 'left', 'idle', 0); C.hero(g, 'flint', 330, 184, 2.0, 'left', 'idle', 0);
        if (t > 7) C.orb(g, ex + 10, lerp(170, 230, seg(t, 7, 10)), 4, 'rgba(210,210,255,A)');
        if (t > 8.5) { g.fillStyle = 'rgba(0,0,0,' + seg(t, 8.5, 10).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
      } },
    // Capítulo 2: las raíces sanan y el faro de las Raíces despierta
    raices: { dur: 7.5, music: 'bosque', caps: [[0.3, 3.4, 'Las raíces negras vuelven a ser verdes.'], [3.6, 7.5, 'Bajo el claro, el faro de las Raíces despierta.']],
      draw(g, t) {
        C.sky(g, '#0c1a14', '#1e3a2a'); C.hills(g, 170, '#0e2418', 20, 4);
        const r = seg(t, 0.5, 4) * 260;
        for (let i = 0; i < 26; i++) { const x = rnd(i) * W, y = 160 + rnd(i + 5) * 50, near = Math.hypot(x - 192, y - 180) < r; g.strokeStyle = near ? '#5aa04a' : '#1a0a20'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 12, x + 22, y - 4 + Math.sin(i) * 6); g.stroke(); }
        C.foe(g, 'madre', 192, 180, 1.1, 'idle', 0, false, 1 - seg(t, 0.5, 3));
        const lit = seg(t, 3.4, 4.6);
        g.fillStyle = '#3a2a1a'; g.fillRect(186, 70, 12, 100); g.fillStyle = '#2a5a2a'; g.beginPath(); g.arc(192, 66, 26, 0, 7); g.fill();
        if (lit > 0) { C.orb(g, 192, 62, 8 * lit + 2, 'rgba(180,255,140,A)'); g.fillStyle = 'rgba(200,255,160,' + (lit * 0.15).toFixed(2) + ')'; g.beginPath(); g.moveTo(192, 62); g.lineTo(0, 30 + Math.sin(t) * 20); g.lineTo(0, 70 + Math.sin(t) * 20); g.fill(); g.beginPath(); g.moveTo(192, 62); g.lineTo(W, 30 - Math.sin(t) * 20); g.lineTo(W, 70 - Math.sin(t) * 20); g.fill(); }
        C.motes(g, t, 50, 'rgba(180,255,150,.7)', 14);
      } },
    // Capítulo 3: el Vigía se arrodilla y el último faro se enciende
    vigia: { dur: 8, music: 'vael', caps: [[0.3, 3.6, 'El Vigía de Bronce se arrodilla, como quien termina su guardia.'], [3.8, 8, 'Kaelen alza la lanza… y el último faro de Vael se enciende.']],
      draw(g, t) {
        C.sky(g, '#e07a4a', '#f4c08a', 150); g.fillStyle = '#ffd890'; g.beginPath(); g.arc(80, 140, 22, 0, 7); g.fill();
        C.hills(g, 160, '#5a3a3a', 26, 7); g.fillStyle = '#4a3030'; g.fillRect(0, 160, W, 60);
        const kneel = seg(t, 0.5, 3.4);
        g.save(); g.translate(270, 196); g.rotate(-kneel * 0.12); C.foe(g, 'vigia_bronce', 0, kneel * 18, 1.1, 'hurt', 0, false); g.restore();
        C.hero(g, 'kaelen', 140, 196, 2.2, 'right', t > 3.8 ? 'cast' : 'idle', (t * 6) | 0);
        const lit = seg(t, 4.2, 5.2);
        C.tower(g, 192, 160, 90, lit, t, lit > 0.5 ? -0.5 + t * 0.4 : null);
        if (t > 4 && t < 5.2) { g.strokeStyle = 'rgba(255,240,180,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 150); g.lineTo(192, 62); g.stroke(); }
      } },
    // Capítulo 4: el Motor late y la marea negra trepa por las torres de oro
    motor: { dur: 7, music: 'amenaza', caps: [[0.3, 2.6, 'El Motor late.'], [2.8, 7, 'Y en su luz, una marea negra trepa por las torres de oro.']],
      draw(g, t) {
        C.sky(g, '#3a2a10', '#c89a40');
        for (let i = 0; i < 9; i++) { const x = 20 + i * 44, h = 60 + rnd(i) * 70; g.fillStyle = i % 2 ? '#c8962e' : '#a87a1e'; g.fillRect(x, H - h, 22, h); g.fillStyle = '#ffd27a'; g.fillRect(x + 4, H - h + 10, 4, 6); g.fillRect(x + 12, H - h + 26, 4, 6); }
        const beat = 1 + Math.max(0, Math.sin(t * 4)) * 0.08;
        for (let i = 0; i < 12; i++) { const a = t * 0.6 + (i / 12) * 6.28; g.fillStyle = '#7a5418'; g.fillRect(192 + Math.cos(a) * 46 * beat - 4, 90 + Math.sin(a) * 46 * beat - 4, 8, 8); }
        g.fillStyle = '#3a2408'; g.beginPath(); g.arc(192, 90, 42 * beat, 0, 7); g.fill(); C.orb(g, 192, 90, 14 * beat, 'rgba(255,220,120,A)');
        if (Math.sin(t * 4) > 0.9) C.ring(g, 192, 90, 60 + (t * 60) % 40, 'rgba(255,230,150,.5)', 2);
        const up = seg(t, 2.6, 7) * 140;
        g.fillStyle = 'rgba(10,6,20,.92)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 6) g.lineTo(x, H - up - Math.sin(x * 0.06 + t * 4) * 6 - (rnd(x) * 30) * seg(t, 3, 7)); g.lineTo(W, H); g.fill();
      } },
    // Capítulo 5: el Abisal se hunde y aparece el cristal de la reina
    abisal_cae: { dur: 7, music: 'triste', caps: [[0.3, 3.4, 'El Primer Abisal se hunde de nuevo en el agua negra…'], [3.6, 7, '…y en el fondo de la cámara brilla un cristal dorado.']],
      draw(g, t) {
        C.sky(g, '#140c20', '#2a1a30');
        for (let i = 0; i < 8; i++) { g.fillStyle = '#2a2034'; g.fillRect(i * 52, 20, 14, 200); g.fillStyle = '#3a2e48'; g.fillRect(i * 52 + 2, 20, 3, 200); }
        const lvl = lerp(80, 200, seg(t, 0.5, 4.5));
        C.foe(g, 'abisal', 192, lvl + 40, 1.2, 'hurt', 0, false, 1 - seg(t, 1, 4));
        C.wave(g, 0, W, lvl, t, 'rgba(8,4,16,.95)', false);
        if (t > 3.4) { const k = seg(t, 3.4, 5); g.fillStyle = 'rgba(255,220,120,' + (k * 0.9).toFixed(2) + ')'; g.beginPath(); g.moveTo(192, 140); g.lineTo(204, 162); g.lineTo(192, 190); g.lineTo(180, 162); g.fill(); C.orb(g, 192, 164, 10 * k, 'rgba(255,220,120,A)'); }
        C.motes(g, t, 30, 'rgba(255,220,140,.6)', 10);
      } },
    // Capítulo 6: el Coloso de la Forja descansa
    coloso: { dur: 6.5, music: 'triste', caps: [[0.3, 3.2, 'El Coloso se sienta junto a su yunque…'], [3.4, 6.5, '…como un viejo que por fin descansa.']],
      draw(g, t) {
        C.sky(g, '#2a0e08', '#5a2410'); g.fillStyle = '#1a0a06'; g.fillRect(0, 170, W, 50);
        const sit = seg(t, 0.4, 3.2);
        C.foe(g, 'coloso', 200, 190 + sit * 16, 1.0, 'idle', 0, false);
        g.fillStyle = '#3a3634'; g.fillRect(100, 168, 46, 16); g.fillRect(110, 184, 26, 20); g.fillStyle = '#5a5654'; g.fillRect(100, 168, 46, 3);
        g.fillStyle = 'rgba(255,140,60,' + (0.4 - sit * 0.25 + Math.sin(t * 5) * 0.05).toFixed(2) + ')'; g.fillRect(0, 0, W, H);
        C.motes(g, t, 40 - sit * 30, 'rgba(255,170,80,.8)', 18);
        C.hero(g, 'flint', 70, 200, 2, 'right', 'idle', (t * 6) | 0);
      } },
    // Capítulo 6: la Torre del Motor emerge del océano
    torre: { dur: 8, music: 'alerta', caps: [[0.3, 3.4, 'Lejos, en el horizonte, el océano se abre.'], [3.6, 8, 'La Torre del Motor se alza del mar, chorreando agua.']],
      draw(g, t) {
        C.sky(g, '#3a3a6a', '#d8a08a', 140); C.sea(g, 140, t, '#2a3a6a', '#0a1428', 'rgba(255,220,200,.25)');
        const r = seg(t, 1, 7), top = lerp(150, 30, r);
        g.fillStyle = '#5a4a2a'; g.fillRect(180, top, 24, 150 - top); g.fillStyle = '#8a7a4a'; g.fillRect(182, top, 4, 150 - top);
        g.fillStyle = '#7ad0ff'; g.fillRect(184, top + 6, 16, 12); g.fillStyle = '#c8962e'; g.fillRect(176, top - 6, 32, 6); g.fillRect(186, top - 18, 12, 12);
        for (let i = 0; i < 16 * r; i++) { const x = 176 + rnd(i) * 32, y = top + ((t * 50 + rnd(i + 3) * 120) % (150 - top)); g.fillStyle = 'rgba(200,230,255,.7)'; g.fillRect(x | 0, y | 0, 1, 3); }
        if (r > 0 && r < 1) for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(150 + rnd(i) * 84, 138 + Math.sin(t * 8 + i) * 3, 3, 1); }
        C.hero(g, 'kaelen', 60, 214, 2, 'right', 'idle', 0); C.hero(g, 'elara', 90, 214, 2, 'right', 'idle', 0);
      } },
    // Capítulo 7: cae el Coloso de guerra y la ola arrastra a Varek a la Torre
    varek_ola: { dur: 8.5, music: 'amenaza', caps: [[0.3, 2.8, 'El Coloso de guerra se derrumba.'], [3, 6, 'Una ola negra arrastra a Varek hacia la boca de la Torre…'], [6.2, 8.5, '…que se abre como un ojo.']],
      draw(g, t) {
        C.sky(g, '#1a1430', '#4a2a4a');
        const open = seg(t, 5.5, 7.5);
        g.fillStyle = '#4a3a2a'; g.fillRect(300, 20, 70, 200); g.fillStyle = '#000'; g.beginPath(); g.ellipse(335, 120, 10 + open * 20, 4 + open * 30, 0, 0, 7); g.fill();
        if (open > 0) C.ring(g, 335, 120, 20 + open * 20, 'rgba(200,120,255,.6)', 2);
        const fall = seg(t, 0.3, 2.6);
        g.save(); g.translate(150, 210); g.rotate(fall * 0.3); C.foe(g, 'coloso_guerra', 0, fall * 30, 0.9, 'hurt', 0, false, 1 - seg(t, 2.6, 4)); g.restore();
        const sweep = seg(t, 3, 6), vx = lerp(150, 330, sweep), vy = lerp(170, 124, sweep);
        C.wave(g, 0, lerp(80, 330, sweep), lerp(200, 120, sweep), t, 'rgba(10,6,20,.95)', true);
        C.hero(g, 'varek', vx, vy, 1.8, 'right', 'hurt', 0, 1 - seg(t, 6, 7));
        C.motes(g, t, 30, 'rgba(200,140,255,.7)', -15);
      } },
    // Final: amanece sobre Vael
    amanecer: { dur: 9, music: 'vael', caps: [[0.4, 4.2, 'Al este de Vael, sobre el mar, sale el sol.'], [4.6, 9, 'Y esta vez, no se detiene.']],
      draw(g, t) {
        const d = seg(t, 0, 6);
        C.sky(g, d > 0.3 ? '#f4a060' : '#2a2050', d > 0.3 ? '#ffe8b0' : '#6a4a6a', 130);
        const sy = lerp(150, 70, d); g.fillStyle = 'rgba(255,230,160,.25)'; g.beginPath(); g.arc(250, sy, 40, 0, 7); g.fill(); g.fillStyle = '#fff0b8'; g.beginPath(); g.arc(250, sy, 18, 0, 7); g.fill();
        C.hills(g, 132, '#3a3050', 14, 1);
        C.sea(g, 130, t, '#5a7ab8', '#1a2a50', 'rgba(255,240,200,.45)');
        g.fillStyle = 'rgba(255,240,180,.35)'; for (let y = 132; y < H; y += 3) g.fillRect(250 - (y - 130) * 0.5 + Math.sin(y + t * 3) * 3, y, (y - 130) * 1.0, 1);
        for (let i = 0; i < 4; i++) { const bx = (t * 16 + i * 80) % (W + 20), by = 50 + i * 14 + Math.sin(t * 2 + i) * 4; g.fillStyle = '#ffffff'; g.fillRect(bx | 0, by | 0, 3, 1); g.fillRect((bx + 3) | 0, (by - 1) | 0, 2, 1); }
        ['kaelen', 'flint', 'firion'].forEach((id, i) => C.hero(g, id, 70 + i * 26, 214, 1.8, 'right', 'idle', 0));
      } },
  };
  TH.data.cine = CINE;

  // ---------- la escena ----------
  class CineScene extends TH.Scene {
    enter(d) {
      this.c = CINE[d.id]; this.t = 0; this.done = !this.c; this.out = 0;
      this.prevMusic = TH.music.curName || TH.music.last;
      if (this.c && this.c.music) TH.music.play(this.c.music, 0.6);
      try { document.querySelector('.hud').style.visibility = 'hidden'; document.getElementById('btnMenu').style.visibility = 'hidden'; } catch (e) { /* sin HUD */ }
    }
    update(dt) {
      const I = TH.input;
      if (this.done) return;
      this.t += dt * (I.down('b') ? 3 : 1);
      if (I.pressed('menu') || this.t >= this.c.dur) { this.done = true; TH.scenes.pop(); }
    }
    render(ctx) {
      if (!this.c) return;
      const t = this.t, k = this.c.dur;
      ctx.save(); this.c.draw(ctx, t, C); ctx.restore();
      C.vignette(ctx, 0.55);
      // bandas de cine
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 22); ctx.fillRect(0, H - 26, W, 26);
      // subtítulos
      for (const [a, b, s] of this.c.caps || []) {
        if (t < a || t > b) continue;
        const al = Math.min(1, (t - a) / 0.4, (b - t) / 0.4);
        ctx.globalAlpha = Math.max(0, al);
        ctx.font = 'italic 10px Cinzel, Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000'; ctx.fillText(s, W / 2 + 1, H - 12);
        ctx.fillStyle = '#f4ecd8'; ctx.fillText(s, W / 2, H - 13);
        ctx.globalAlpha = 1;
      }
      // fundidos de entrada y salida
      const f = Math.max(1 - t / 0.6, (t - (k - 0.6)) / 0.6);
      if (f > 0) { ctx.fillStyle = 'rgba(0,0,0,' + cl(f).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
    }
  }
  CineScene.prototype.exit = function () {
    try { document.querySelector('.hud').style.visibility = ''; document.getElementById('btnMenu').style.visibility = ''; } catch (e) { /* sin HUD */ } if (this.c && this.c.music && this.prevMusic && this.prevMusic !== this.c.music) TH.music.play(this.prevMusic, 0.8); };
  TH.CineScene = CineScene;
  TH.playCine = function (id) {
    if (!TH.scenes.registry.cine) TH.scenes.register('cine', new CineScene());
    const sc = TH.scenes.registry.cine;
    TH.scenes.push('cine', { id });
    return sc;
  };
})();
