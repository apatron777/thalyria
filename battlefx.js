// Efectos de combate avanzados: vista previa de áreas, técnicas combinadas (cada una con su animación)
// e invocaciones a pantalla completa. Todo con rectángulos y trazos sencillos para ir fluido en móvil.
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, W = TH.W, H = TH.H;
  const TC = () => TH.data.TYPE_COLOR;

  // puntos de una elipse (perspectiva del suelo)
  function ell(ctx, x, y, r, c, n) {
    ctx.fillStyle = c;
    n = n || Math.max(14, Math.round(r * 3));
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.5), 1, 1); }
  }
  function fillEll(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }

  // stats medios de los participantes de un combo
  function avgStats(ids) {
    const P = TH.party, out = {};
    for (const k of P.KEYS) out[k] = 0;
    for (const id of ids) { const s = P.stats(id); for (const k of P.KEYS) out[k] += s[k] / ids.length; }
    out.atk *= 1.1; out.mag *= 1.1;
    return out;
  }

  const FX = (TH.battleFx = {
    // ---------- vista previa / huella del área ----------
    area(ctx, bs, f, t) {
      const { u, T, area } = f, k = f.preview ? 1 : 1 - f.t / f.dur;
      if (!T || !u) return;
      const pulse = 0.5 + Math.sin(t * 8) * 0.2;
      ctx.globalAlpha = (f.preview ? 0.9 : 0.7) * k;
      const col = '#ff8a5a', fill = 'rgba(255,120,80,' + (0.16 * pulse).toFixed(3) + ')';
      const ox = u.homeX + 6, oy = u.homeY;
      const dx = T.x - ox, dy = T.y - oy, d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d;
      if (area === 'one') { fillEll(ctx, T.x, T.y, T.D.boss ? 26 : 12, fill); ell(ctx, T.x, T.y, T.D.boss ? 26 : 12, col); }
      else if (area === 'line') {
        const L = 160, w = 11, px = -ny * w, py = nx * w;
        ctx.fillStyle = fill; ctx.beginPath();
        ctx.moveTo(ox + px, oy + py); ctx.lineTo(ox + nx * L + px, oy + ny * L + py); ctx.lineTo(ox + nx * L - px, oy + ny * L - py); ctx.lineTo(ox - px, oy - py); ctx.fill();
        ctx.fillStyle = col;
        const off = (t * 40) % 6;
        for (let s = off; s < L; s += 6) { ctx.fillRect(Math.round(ox + nx * s + px), Math.round(oy + ny * s + py), 2, 1); ctx.fillRect(Math.round(ox + nx * s - px), Math.round(oy + ny * s - py), 2, 1); }
      } else if (area === 'cone') {
        const L = 130, a0 = Math.atan2(dy, dx), sp = 0.42;
        ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(ox, oy);
        for (let i = 0; i <= 10; i++) { const a = a0 - sp + (i / 10) * sp * 2; ctx.lineTo(ox + Math.cos(a) * L, oy + Math.sin(a) * L); }
        ctx.fill();
        ctx.fillStyle = col;
        for (const a of [a0 - sp, a0 + sp]) for (let s = 6; s < L; s += 5) ctx.fillRect(Math.round(ox + Math.cos(a) * s), Math.round(oy + Math.sin(a) * s), 1, 1);
        for (let i = 0; i <= 16; i++) { const a = a0 - sp + (i / 16) * sp * 2; ctx.fillRect(Math.round(ox + Math.cos(a) * L), Math.round(oy + Math.sin(a) * L), 2, 1); }
      } else if (area === 'circle') {
        const r = (f.r || 26) * 1.15;
        fillEll(ctx, T.x, T.y, r, fill); ell(ctx, T.x, T.y, r, col); ell(ctx, T.x, T.y, r * (0.4 + ((t * 0.8) % 0.6)), 'rgba(255,170,110,.7)');
      } else if (area === 'all') {
        for (const e of bs.alive()) { const r = e.D.boss ? 26 : 12; fillEll(ctx, e.x, e.y, r, fill); ell(ctx, e.x, e.y, r, col); }
      }
      ctx.globalAlpha = 1;
    },

    // ---------- efectos sueltos (espacio del mundo, en modo 'lighter') ----------
    draw(ctx, bs, f, t, k) {
      const P = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
      switch (f.kind) {
        case 'ecoRise': {
          for (let i = 0; i < 8; i++) { const a = i * 0.785 + k * 6; P(f.x + Math.cos(a) * (6 + k * 10), f.y - k * 18 + Math.sin(a) * 4, 2, 2, f.c); }
          P(f.x - 2, f.y - 2 - k * 24, 5, 5, '#ffffff');
          break;
        }
        case 'wind': {
          for (let i = 0; i < 4; i++) { const r = 8 + i * 7 + k * 6, a0 = t * 9 + i; for (let j = 0; j < 10; j++) { const a = a0 + j * 0.25; P(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.45, 2, 1, i % 2 ? '#c8f0ff' : '#ffffff'); } }
          break;
        }
        case 'coral': { for (let i = 0; i < 10; i++) { const a = i * 0.63; P(f.x + Math.cos(a) * 14 * k, f.y - 8 - k * 26 + Math.sin(a + k * 5) * 6, 2, 2, i % 2 ? '#ff9ab8' : '#8ef0a0'); } break; }
        case 'storm': { for (let i = 0; i < 6; i++) P(f.x - 10 + i * 4, f.y - 30 + ((k * 60 + i * 13) % 34), 1, 4, '#9fd8ff'); P(f.x - 8, f.y - 4, 16, 1, '#c8f0ff'); break; }
        case 'wave': { const h = Math.sin(k * Math.PI) * 16; for (let i = -12; i <= 12; i += 2) P(f.x + i, f.y + 10 - h - Math.cos(i * 0.4 + k * 8) * 3, 2, h + 2, i % 4 ? '#3aa8e0' : '#9fe8ff'); break; }
        case 'shock': { ell(ctx, f.x, f.y, 10 + k * 70, '#ffd0a0'); ell(ctx, f.x, f.y, 6 + k * 50, '#ffffff'); break; }
        case 'shockwave': { ell(ctx, f.x, f.y, 8 + k * (f.r || 80), f.c || '#ffe070', 60); ell(ctx, f.x, f.y, 4 + k * (f.r || 80) * 0.7, '#ffffff', 50); break; }
        case 'orbit': {
          // dos astros girando sobre el campo antes de caer
          const R = 34 * (1 - k * 0.6), cx = f.x, cy = f.y - 40 + k * 20;
          for (let j = 0; j < 2; j++) {
            const a = t * 7 + j * Math.PI, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.4, c = j ? '#c8a8ff' : '#ffd77a';
            P(x - 3, y - 3, 7, 7, c); P(x - 1, y - 1, 3, 3, '#ffffff');
            for (let s = 1; s < 8; s++) { const b = a - s * 0.12; P(cx + Math.cos(b) * R, cy + Math.sin(b) * R * 0.4, 2, 2, c); }
          }
          break;
        }
        case 'fall': {
          // columnas de luz que caen sobre cada enemigo
          const h = Math.min(1, k * 2.5);
          for (const e of f.list) { const c = f.c; P(e.x - 3, e.sy - 120, 7, 120 * h, c); P(e.x - 1, e.sy - 120, 3, 120 * h, '#ffffff'); if (k > 0.4) ell(ctx, e.x, e.y, 8 + (k - 0.4) * 30, c); }
          break;
        }
        case 'anvil': { for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.22, v = k * 34; P(f.x + Math.cos(a) * v, f.y + Math.sin(a) * v + k * k * 30, 2, 2, i % 3 ? '#ffb040' : '#ffffff'); } P(f.x - 4, f.y - 4, 9, 9 * (1 - k), '#ffe070'); break; }
        case 'trail': {
          // estela de fuego del cruce en línea
          const n = 26;
          for (let i = 0; i < n; i++) {
            const e = i / n; if (e > k * 1.4) break;
            const x = U.lerp(f.x0, f.x1, e), y = U.lerp(f.y0, f.y1, e), fl = Math.sin(i * 1.7 + t * 30) * 3;
            P(x, y - 4 + fl, 4, 3, i % 2 ? '#ff6a2a' : '#ffd040'); P(x, y - 1, 3, 1, '#ffffff');
          }
          break;
        }
        case 'waveSweep': {
          // ola de luz que barre el campo de izquierda a derecha
          const x = U.lerp(f.x0, f.x1, k);
          for (let i = -50; i <= 50; i += 3) {
            const hh = 22 + Math.sin(i * 0.2 + t * 12) * 6, cx = x + Math.sin(i * 0.15) * 6, yy = f.y + i * 0.6;
            P(cx - 30, yy - hh * 0.4, 30, 3, '#1a5a90'); P(cx - 18, yy - hh * 0.7, 18, 3, '#3aa8e0');
            P(cx - 6, yy - hh, 8, 3, '#9fe8ff'); P(cx, yy - hh - 2, 3, 3, i % 2 ? '#ffffff' : '#ffe8a0');
          }
          for (let i = 0; i < 6; i++) P(x - 6 - i * 5, f.y - 40 + ((i * 17 + t * 60) % 60), 2, 2, '#ffffff');
          break;
        }
        case 'cross': {
          const s = 22 * Math.min(1, k * 3), c = '#e8f4ff';
          for (let i = -s; i <= s; i++) { P(f.x + i, f.y + i * 0.9, 2, 2, c); P(f.x + i, f.y - i * 0.9, 2, 2, c); }
          if (k > 0.3) ell(ctx, f.x, f.y, (k - 0.3) * 40, '#9fd8ff');
          break;
        }
        case 'geyser': {
          const h = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 90, w = f.r * 0.6;
          for (let i = -w; i <= w; i += 3) { const hh = h * (1 - Math.abs(i) / (w + 4)) + Math.sin(i + t * 20) * 4; P(f.x + i, f.y - hh, 3, hh, Math.abs(i) < w / 3 ? '#ffffff' : i % 2 ? '#9fe8ff' : '#ffb070'); }
          for (let i = 0; i < 10; i++) P(f.x + Math.sin(i * 2.3) * w * 1.2, f.y - h - 4 + ((i * 9 + t * 50) % 24), 2, 2, '#e0f8ff');
          break;
        }
        case 'eclipse': {
          // disco oscuro con corona y haz tricolor
          const cx = f.x, cy = f.y - 66;
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#050310'; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + t * 0.6, r = 15 + (i % 3) * 2 + Math.sin(t * 6 + i) * 1.5; P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2, i % 2 ? '#ffd77a' : '#ffffff'); }
          if (k > 0.45) {
            const b = Math.min(1, (k - 0.45) * 4), cols = ['#ffd77a', '#c8a8ff', '#e8f4ff'];
            for (const e of f.list) for (let j = 0; j < 3; j++) { const x0 = cx + (j - 1) * 3, x1 = e.x + (j - 1) * 4; for (let s = 0; s <= 20 * b; s++) { const q = s / 20; P(U.lerp(x0, x1, q) - 1, U.lerp(cy, e.sy - 12, q), 3, 4, cols[j]); } }
          }
          break;
        }
        case 'anchor': {
          // ancla sólida que cae desde lo alto
          const y = f.y - 150 * (1 - Math.min(1, k * 1.8));
          ctx.globalCompositeOperation = 'source-over';
          const D = (x, yy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(f.x + x), Math.round(y + yy), w, h); };
          D(-2, -64, 5, 54, '#2a3446'); D(-1, -64, 2, 54, '#6c7c96');
          D(-6, -70, 13, 7, '#2a3446'); D(-4, -69, 9, 4, '#8a9ab4');
          D(-14, -62, 29, 4, '#2a3446'); D(-13, -61, 27, 2, '#6c7c96');
          for (let i = 0; i < 18; i++) { const a = Math.PI * (i / 17), x = Math.cos(a) * 18, yy = Math.sin(a) * 9 - 12; D(x - 2, yy, 5, 4, '#2a3446'); D(x - 1, yy + 1, 3, 1, '#8a9ab4'); }
          D(-22, -16, 6, 6, '#2a3446'); D(17, -16, 6, 6, '#2a3446');
          ctx.globalCompositeOperation = 'lighter';
          if (k < 0.55) for (let i = 0; i < 4; i++) P(f.x - 8 + i * 5, y - 80 - i * 8, 1, 14, '#ffd040');
          break;
        }
      }
    },

    // ---------- técnicas combinadas ----------
    *combo(bs, u, c, target) {
      const P = TH.party;
      bs.combo -= c.cost * 100;
      bs.drawParty();
      const units = c.who.map((id) => bs.active.find((x) => x.id === id));
      const st = avgStats(c.who);
      const T = target && !target.dead ? target : bs.alive()[0];
      if (!T) return;
      const foes = c.area === 'all' ? bs.alive() : bs.areaHits(u, T, c.area, c.r);
      if (!foes.length) foes.push(T);
      const single = c.area === 'one';
      bs.bannerOn(c.name, (c.cost > 1 ? 'Técnica triple · ' : 'Técnica doble · ') + c.who.map((w) => TH.chars.defs[w].name).join(' + '), 1.6);
      for (let k = 0; k < 0.35; k += bs.dt) { bs.darkA = Math.min(0.5, bs.darkA + bs.dt * 1.6); yield; }
      const deal = (pw, extra) => { for (const e of foes) if (!e.dead) bs.hit(u, e, c.kind, pw, c.types, { st, single, big: true, extra, slash: c.kind === 'phys' }); };
      const ringK = (r) => (r === 'perfect' ? 1.25 : 1);
      const back = () => bs.all(units.map((x) => bs.hop(x, x.homeX, x.homeY, 0.3, 10)));
      const cx = foes.reduce((s, e) => s + e.x, 0) / foes.length, cy = foes.reduce((s, e) => s + e.y, 0) / foes.length;
      let r;
      switch (c.id) {
        case 'aurora': {
          for (const x of units) bs.pose(x, 'cast', 0);
          bs.fx.push({ kind: 'orbit', x: cx, y: cy, t: 0, dur: 1.1 });
          yield* bs.wait(0.5);
          r = yield* bs.ringOn(cx, cy - 20, () => units.forEach((x) => bs.pose(x, 'cast', 1)));
          bs.fx.push({ kind: 'fall', list: foes, c: '#ffd77a', t: 0, dur: 0.6 }, { kind: 'fall', list: foes.map((e) => ({ x: e.x + 5, y: e.y, sy: e.sy })), c: '#c8a8ff', t: 0, dur: 0.6 });
          bs.flashA = 0.5;
          deal(c.power * ringK(r));
          yield* bs.wait(0.6);
          break;
        }
        case 'lanza_roja': {
          const [K, F] = units;
          yield* bs.all([bs.moveTo(F, K.x + 14, K.y - 2, 0.25), bs.wait(0.25)]);
          bs.pose(F, 'attack', 0); bs.pose(K, 'guard', 0);
          yield* bs.wait(0.18);
          bs.pose(F, 'attack', 1);
          bs.fx.push({ kind: 'anvil', x: K.x + 8, y: K.sy - 18, t: 0, dur: 0.5 });
          bs.shake(3, 0.2); bs.flashA = 0.3;
          yield* bs.wait(0.25);
          const ex = Math.max(...foes.map((e) => e.x)) + 24;
          r = yield* bs.ringOn(T.x, T.sy - 16, () => bs.pose(K, 'attack', 1));
          bs.fx.push({ kind: 'trail', x0: K.x, y0: K.y, x1: ex, y1: K.y + (T.y - K.y), t: 0, dur: 0.5 });
          yield* bs.moveTo(K, ex, K.y + (T.y - K.y), 0.18, true);
          deal(c.power * ringK(r));
          yield* bs.wait(0.35);
          yield* back();
          break;
        }
        case 'martillo_viento': {
          const [F, Fi] = units;
          bs.pose(Fi, 'cast', 1);
          const anchorE = foes.find((e) => !e.D.boss) || T;
          yield* bs.gatherSeq(foes.filter((e) => !e.D.boss), anchorE);
          const gx = foes.reduce((s, e) => s + e.x, 0) / foes.length, gy = foes.reduce((s, e) => s + e.y, 0) / foes.length;
          bs.pose(F, 'jump' in TH.chars.FRAMES ? 'jump' : 'attack', 0);
          yield* bs.hop(F, gx - 8, gy, 0.5, 70);
          r = yield* bs.ringOn(gx, gy - 14, () => bs.pose(F, 'attack', 1));
          bs.fx.push({ kind: 'shockwave', x: gx, y: gy, r: 90, t: 0, dur: 0.6, c: '#ffd0a0' }, { kind: 'wind', x: gx, y: gy - 10, t: 0, dur: 0.6 });
          bs.shake(5, 0.4); bs.flashA = 0.5;
          deal(c.power * ringK(r));
          yield* bs.wait(0.45);
          yield* back();
          break;
        }
        case 'marea_faro': {
          for (const x of units) bs.pose(x, 'cast', 0);
          yield* bs.wait(0.3);
          r = yield* bs.ringOn(cx, cy - 16, () => units.forEach((x) => bs.pose(x, 'cast', 1)));
          const fx = { kind: 'waveSweep', x0: bs.center.x - 110, x1: bs.center.x + 110, y: bs.center.y + 6, t: 0, dur: 1.0 };
          bs.fx.push(fx);
          yield* bs.wait(0.45);
          deal(c.power * ringK(r));
          for (const a of bs.active) if (!a.ko) {
            const mm = P.members[a.id], max = P.stats(a.id).hp, before = mm.hp;
            mm.hp = Math.min(max, mm.hp + Math.round(max * c.heal * ringK(r)));
            if (mm.hp > before) bs.num(a.x, a.sy - 30, mm.hp - before, '#8ef0a0');
          }
          bs.drawParty();
          yield* bs.wait(0.5);
          break;
        }
        case 'cruz': {
          const [K, Fi] = units;
          yield* bs.all([bs.moveTo(K, T.x - 26, T.y - 12, 0.24), bs.moveTo(Fi, T.x - 26, T.y + 12, 0.24)]);
          bs.pose(K, 'attack', 0); bs.pose(Fi, 'attack', 0);
          r = yield* bs.ringOn(T.x, T.sy - 16, () => { bs.pose(K, 'attack', 1); bs.pose(Fi, 'attack', 1); });
          yield* bs.all([bs.moveTo(K, T.x + 26, T.y + 12, 0.1, true), bs.moveTo(Fi, T.x + 26, T.y - 12, 0.1, true)]);
          bs.fx.push({ kind: 'cross', x: T.x, y: T.sy - 16, t: 0, dur: 0.55 });
          bs.flashA = 0.45;
          deal(c.power * ringK(r));
          yield* bs.wait(0.4);
          yield* back();
          break;
        }
        case 'geiser': {
          const [E, F] = units;
          bs.pose(E, 'cast', 0); bs.pose(F, 'attack', 0);
          r = yield* bs.ringOn(T.x, T.sy - 10, () => { bs.pose(E, 'cast', 1); bs.pose(F, 'attack', 1); });
          bs.fx.push({ kind: 'geyser', x: T.x, y: T.y, r: c.r || 32, t: 0, dur: 1.0 });
          bs.shake(3, 0.5);
          yield* bs.wait(0.25);
          deal(c.power * ringK(r));
          yield* bs.wait(0.6);
          break;
        }
        case 'eclipse': {
          for (const x of units) bs.pose(x, 'cast', 0);
          for (let k = 0; k < 0.5; k += bs.dt) { bs.darkA = Math.min(0.78, bs.darkA + bs.dt * 1.2); yield; }
          bs.fx.push({ kind: 'eclipse', x: cx, y: cy, list: foes, t: 0, dur: 1.5 });
          yield* bs.wait(0.55);
          r = yield* bs.ringOn(cx, cy - 18, () => units.forEach((x) => bs.pose(x, 'cast', 1)));
          bs.flashA = 0.8; bs.shake(4, 0.5);
          deal(c.power * ringK(r));
          yield* bs.wait(0.5);
          deal(c.power * 0.3, true);
          yield* bs.wait(0.4);
          break;
        }
        case 'ancla': {
          const [K, F, Fi] = units;
          bs.pose(Fi, 'cast', 1); bs.pose(F, 'cast', 0); bs.pose(K, 'cast', 0);
          bs.text(T.x, T.sy - 70, '¡ARRIBA!', '#ffd040', 1, 0.8);
          bs.fx.push({ kind: 'anchor', x: T.x, y: T.sy - 4, t: 0, dur: 1.0 });
          yield* bs.wait(0.08);
          r = yield* bs.ringOn(T.x, T.sy - 16, () => units.forEach((x) => bs.pose(x, 'attack', 1)));
          yield* bs.wait(0.05);
          bs.fx.push({ kind: 'shockwave', x: T.x, y: T.y, r: 100, t: 0, dur: 0.7, c: '#ffb040' });
          bs.shake(7, 0.6); bs.flashA = 0.7; bs.hitstop = 0.18;
          deal(c.power * ringK(r));
          yield* bs.wait(0.6);
          break;
        }
        default: {
          r = yield* bs.ringOn(T.x, T.sy - 16, () => {});
          deal(c.power * ringK(r));
        }
      }
      if (r === 'perfect') bs.text(cx, cy - 64, '¡PERFECTO!', '#ffe070', 1, 0.8);
      for (const x of units) bs.free(x);
      for (let k = 0; k < 0.3; k += bs.dt) { bs.darkA = Math.max(0, bs.darkA - bs.dt * 2); yield; }
      bs.darkA = 0;
    },

    // ---------- invocación a pantalla completa ----------
    *summon(bs, u, s) {
      const P = TH.party;
      const used = bs.standby().slice(0, s.need);
      for (const id of used) { P.ecoState[id] = 'recover'; bs.recoverQ.push(id); }
      bs.drawParty();
      let best = 0;
      for (const a of bs.active) best = Math.max(best, P.stats(a.id).mag);
      const st = { atk: best, mag: best * 1.15 };
      bs.pose(u, 'cast', 1);
      bs.summon = { id: s.id, t: 0, name: s.name, hit: false };
      bs.help('');
      const DUR = s.id === 'leviatan' ? 3.0 : 2.6, HIT = s.id === 'leviatan' ? 1.8 : 1.6;
      while (bs.summon.t < DUR) {
        bs.darkA = Math.min(0.85, bs.darkA + bs.dt * 3);
        if (!bs.summon.hit && bs.summon.t >= HIT) {
          bs.summon.hit = true;
          bs.flashA = 0.9; bs.shake(6, 0.7);
          for (const e of bs.alive()) bs.hit(u, e, 'mag', s.power, s.types, { st, big: true });
          if (s.heal) for (const a of bs.active) if (!a.ko) {
            const mm = P.members[a.id], max = P.stats(a.id).hp, before = mm.hp;
            mm.hp = Math.min(max, mm.hp + Math.round(max * s.heal));
            if (mm.hp > before) bs.num(a.x, a.sy - 30, mm.hp - before, '#8ef0a0');
          }
          bs.drawParty();
        }
        yield;
      }
      bs.summon = null;
      for (let k = 0; k < 0.35; k += bs.dt) { bs.darkA = Math.max(0, bs.darkA - bs.dt * 2.5); yield; }
      bs.darkA = 0;
      bs.text(u.x, u.sy - 50, 'LOS ECOS DESCANSAN', '#ffe8a0', 1, 1.0);
      bs.free(u);
    },
    // capa en espacio de pantalla (barata: rectángulos y unas pocas formas)
    drawSummon(ctx, bs, s) {
      const t = s.t;
      const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
      // franjas cinematográficas
      const bar = Math.min(1, t * 3) * 22;
      R(0, 0, W, bar, '#000'); R(0, H - bar, W, bar, '#000');
      // estrellas fijas (semilla determinista)
      for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = 24 + ((i * 53) % (H - 60)); if ((i + Math.floor(t * 8)) % 5) R(x, y, 1, 1, '#c8c0ff'); }
      if (s.id === 'guardiana') {
        // el faro surge del mar y su haz barre el campo
        const rise = U.smooth(Math.min(1, t / 0.9)), bx = W * 0.78, by = H - 30 - rise * 120;
        R(0, H - 34, W, 12, '#0d2a4a');
        for (let x = 0; x < W; x += 4) R(x, H - 36 + Math.sin(x * 0.1 + t * 4) * 2, 4, 2, '#3a7ac0');
        // torre troncocónica con franjas rojas y blancas, fila a fila
        const top = by, base = H - 30, hgt = base - top;
        for (let y = top; y < base; y += 2) {
          const q = (y - top) / hgt, hw = 7 + q * 9, band = Math.floor(q * 6) % 2;
          R(bx - hw - 1, y, hw * 2 + 2, 2, '#120e24');
          R(bx - hw, y, hw * 2, 2, band ? '#c8402c' : '#efe6d6');
          R(bx - hw, y, 3, 2, band ? '#e8705a' : '#ffffff');
          R(bx + hw - 4, y, 4, 2, band ? '#7a2418' : '#a89c94');
        }
        R(bx - 13, top - 4, 26, 4, '#120e24'); R(bx - 12, top - 3, 24, 2, '#3a3458');
        R(bx - 9, top - 17, 18, 13, '#120e24'); R(bx - 7, top - 15, 14, 10, '#ffe8a0'); R(bx - 4, top - 13, 8, 6, '#ffffff');
        R(bx - 10, top - 22, 20, 5, '#120e24'); R(bx - 6, top - 26, 12, 4, '#120e24'); R(bx - 1, top - 30, 2, 4, '#e8b84a');
        // halo de la lámpara
        ctx.globalCompositeOperation = 'lighter';
        const hr = 18 + Math.sin(t * 9) * 2;
        ctx.fillStyle = 'rgba(255,220,140,.18)'; ctx.beginPath(); ctx.arc(bx, top - 10, hr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.beginPath(); ctx.arc(bx, top - 10, hr * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        if (t > 0.9) {
          const a = Math.PI - 0.1 + Math.sin((t - 0.9) * 2.4) * 0.35, L = W * 1.1, w = 0.11, by2 = by - 10;
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(255,230,150,.35)';
          ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx + Math.cos(a - w) * L, by2 + Math.sin(a - w) * L); ctx.lineTo(bx + Math.cos(a + w) * L, by2 + Math.sin(a + w) * L); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,230,.45)';
          ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx + Math.cos(a - w / 3) * L, by2 + Math.sin(a - w / 3) * L); ctx.lineTo(bx + Math.cos(a + w / 3) * L, by2 + Math.sin(a + w / 3) * L); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        // la gran serpiente cruza la pantalla en una ola
        const k = Math.min(1, t / 2.2), head = U.lerp(-60, W + 160, U.smooth(k));
        R(0, H - 40, W, 18, '#0b2440');
        for (let x = 0; x < W; x += 3) { const h = 8 + Math.sin(x * 0.07 - t * 6) * 5 + (Math.abs(x - head + 40) < 50 ? 18 : 0); R(x, H - 40 - h, 3, h, x % 2 ? '#2a78c0' : '#4aa8e8'); }
        for (let i = 26; i >= 0; i--) {
          const x = head - i * 9, y = H * 0.55 + Math.sin(x * 0.035 + t * 2) * 30 - Math.sin(k * Math.PI) * 20, r = Math.max(3, 11 - i * 0.28);
          ctx.fillStyle = i % 2 ? '#1c5a7a' : '#2a7a9a'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          R(x - 2, y - r, 4, 2, '#9fe8ff');
          if (i % 4 === 0) R(x - 1, y - r - 4, 3, 4, '#7fd8f0');
        }
        const hx = head, hy = H * 0.55 + Math.sin(hx * 0.035 + t * 2) * 30 - Math.sin(k * Math.PI) * 20;
        R(hx, hy - 9, 18, 14, '#2a7a9a'); R(hx + 14, hy - 4, 10, 7, '#2a7a9a'); R(hx + 8, hy - 7, 3, 3, '#ffe070'); R(hx + 2, hy - 16, 3, 7, '#9fe8ff'); R(hx + 7, hy - 18, 3, 9, '#9fe8ff');
        for (let i = 0; i < 12; i++) R(hx - 20 - ((i * 23 + t * 120) % 140), H - 60 - ((i * 37) % 40), 2, 2, '#e0f8ff');
      }
      // nombre
      const a = Math.min(1, t * 2) * (t > 2.2 ? Math.max(0, 1 - (t - 2.2) * 2) : 1);
      ctx.globalAlpha = a;
      TH.pixfont.draw(ctx, s.name, W / 2, 34, '#fff3d6', 2);
      ctx.globalAlpha = 1;
      if (s.hit) { const q = Math.min(1, (t - (s.id === 'leviatan' ? 1.8 : 1.6)) * 3); ctx.fillStyle = 'rgba(255,250,230,' + (0.35 * (1 - q)).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    },
  });
})();
