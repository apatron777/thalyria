// Resonancias en el mapa: rueda de selección, uso con B (pulsación corta) y efectos visuales.
// Cada Resonancia es de un personaje: al usarla pasa al frente del grupo.
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, TS = 16, HZ = TH.HZ, W = TH.W, H = TH.H;
  const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const SLOT_A = { up: -Math.PI / 2, right: 0, down: Math.PI / 2, left: Math.PI };
  const RAD = 38;

  const R = (TH.res = {
    fx: [],
    wheel: null, // { idx, t }
    list() { return TH.data.resonances; },
    get(id) { return TH.data.resonances.find((r) => r.id === id); },
    current() { const id = TH.flags.get('res.sel', 'lanza'); return this.get(id) || this.list()[0]; },
    // disponible si su dueño viaja en el grupo
    available(scene, r) { return scene.inParty(r.who) && (!r.flag || TH.flags.get(r.flag)); },
    freezeLearned() { return !!TH.flags.get('res.congelar'); },

    init() {
      this.el = { btn: document.getElementById('resBtn'), ep: document.getElementById('epochBtn') };
      if (this.el.btn) this.el.btn.addEventListener('click', (e) => { e.preventDefault(); const m = this.mapScene(); if (m) this.toggleWheel(m); });
      if (this.el.ep) this.el.ep.addEventListener('click', (e) => { e.preventDefault(); const m = this.mapScene(); if (m && !this.wheel && !m.resSeq && performance.now() - (this._tapT || 0) > 600) m.switchEpoch(); });
      document.getElementById('game').addEventListener('pointerdown', (e) => {
        const m = this.mapScene();
        if (!m || !this.wheel) return;
        this._tapT = performance.now();  // este toque es de la rueda: que no active el botón de época que hay debajo
        const r = TH.renderer.canvas.getBoundingClientRect();
        const sx = ((e.clientX - r.left) / r.width) * W, sy = ((e.clientY - r.top) / r.height) * H;
        this.tapWheel(m, sx, sy);
      });
      this._sync = '';
    },
    mapScene() { const s = TH.scenes.top(); return s && s === TH.scenes.registry.map && !s.inCutscene && !s.trans ? s : null; },
    // botones HTML sobre el mapa (Resonancia actual y época)
    syncHud(scene, show) {
      if (!this.el || !this.el.btn) return;
      const r = this.current(), ep = show && !this.wheel && scene && scene.puzzle && scene.epochs;
      const key = (show ? 1 : 0) + r.id + (ep ? scene.puzzle.epoch : '') + (scene && this.available(scene, r) ? 1 : 0);
      if (key === this._sync) return;
      this._sync = key;
      this.el.btn.hidden = !show;
      this.el.btn.style.setProperty('--rc', r.color);
      this.el.btn.querySelector('b').textContent = r.name;
      this.el.btn.classList.toggle('off', !!scene && !this.available(scene, r));
      this.el.ep.hidden = !ep;
      if (ep) this.el.ep.querySelector('b').textContent = scene.puzzle.epoch === 'past' ? 'Pasado' : 'Presente';
    },

    // ---------- rueda ----------
    toggleWheel(scene) {
      if (scene.resSeq) return;
      if (this.wheel) { this.wheel = null; return; }
      const L = this.list();
      this.wheel = { idx: Math.max(0, L.indexOf(this.current())), t: 0 };
    },
    pickWheel(scene, i) {
      const r = this.list()[i];
      if (!r) return;
      if (!this.available(scene, r)) { TH.ui.toast(scene.inParty(r.who) ? 'Aún no has despertado esa Resonancia' : TH.chars.defs[r.who].name + ' no está en el grupo'); return; }
      TH.flags.set('res.sel', r.id);
      this.wheel = null;
      TH.ui.toast(r.name + ' · pulsa B para usarla');
    },
    tapWheel(scene, sx, sy) {
      const p = scene.toScreen(scene.leader.x, scene.leader.sy - 14);
      const dx = sx - p.x, dy = sy - p.y, d = Math.hypot(dx, dy);
      if (d < 12 || d > 90) { this.wheel = null; return; }
      const a = Math.atan2(dy, dx);
      let best = 0, bd = 9;
      this.list().forEach((r, i) => { let k = Math.abs(a - SLOT_A[r.slot]); if (k > Math.PI) k = Math.PI * 2 - k; if (k < bd) { bd = k; best = i; } });
      this.pickWheel(scene, best);
    },
    updateWheel(scene, dt) {
      const I = TH.input, w = this.wheel, L = this.list();
      w.t += dt;
      for (const d of ['up', 'right', 'down', 'left']) if (I.pressed(d)) w.idx = L.findIndex((r) => r.slot === d);
      const ax = I.joy.x, ay = I.joy.y;
      if (Math.hypot(ax, ay) > 0.6) { const d = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? 'left' : 'right') : ay < 0 ? 'up' : 'down'; w.idx = L.findIndex((r) => r.slot === d); }
      if (I.pressed('a') || I.pressed('b')) this.pickWheel(scene, w.idx);
      else if (I.pressed('res') || I.pressed('menu')) this.wheel = null;
    },
    drawWheel(ctx, scene) {
      const w = this.wheel, L = this.list(), p = scene.toScreen(scene.leader.x, scene.leader.sy - 14);
      const k = Math.min(1, w.t * 8), cx = Math.round(U.clamp(p.x, 64, W - 64)), cy = Math.round(U.clamp(p.y, 56, H - 50));
      ctx.fillStyle = 'rgba(8,6,24,' + (0.45 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(232,184,74,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, RAD * k, 0, Math.PI * 2); ctx.stroke();
      L.forEach((r, i) => {
        const a = SLOT_A[r.slot], x = Math.round(cx + Math.cos(a) * RAD * k), y = Math.round(cy + Math.sin(a) * RAD * k);
        const sel = i === w.idx, ok = this.available(scene, r);
        ctx.fillStyle = sel ? '#e8b84a' : '#1a1028'; ctx.beginPath(); ctx.arc(x, y, sel ? 13 : 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ok ? '#2e2348' : '#241d30'; ctx.beginPath(); ctx.arc(x, y, sel ? 11 : 9, 0, Math.PI * 2); ctx.fill();
        this.icon(ctx, r.id, x, y, ok ? r.color : '#5a5070');
        if (!ok) { ctx.fillStyle = '#8a80a0'; ctx.fillRect(x - 6, y, 12, 1); }
      });
      const r = L[w.idx];
      const ty = cy + RAD + 22 > H - 8 ? cy - RAD - 26 : cy + RAD + 18;
      ctx.fillStyle = 'rgba(16,13,34,.9)'; ctx.fillRect(W / 2 - 110, ty - 9, 220, 22);
      ctx.fillStyle = '#e8b84a'; ctx.fillRect(W / 2 - 110, ty - 9, 220, 1);
      TH.pixfont.draw(ctx, r.name + ' · ' + TH.chars.defs[r.who].name, W / 2, ty - 2, '#fff3d6', 1);
      TH.pixfont.draw(ctx, r.id === 'agua' && this.freezeLearned() ? 'Agua y tiempo' : r.slot === 'up' ? 'Empuja y enciende' : r.slot === 'right' ? 'Sube y baja el agua' : r.slot === 'down' ? 'Derrite y mueve' : 'Apaga, mueve, planea', W / 2, ty + 7, '#c8c0d8', 1);
    },
    // iconos pequeños dibujados a mano
    icon(ctx, id, x, y, c) {
      const P = (a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + a, y + b, w, h); };
      if (id === 'lanza') { for (let i = 0; i < 9; i++) P(-4 + i, 4 - i, 1, 1); P(3, -5, 3, 1); P(4, -6, 1, 3); P(-2, -3, 2, 2); }
      else if (id === 'agua') { P(0, -5, 1, 1); P(-1, -4, 3, 2); P(-2, -2, 5, 3); P(-3, 1, 7, 3); P(-2, 4, 5, 1); }
      else if (id === 'tierra') { P(-1, -5, 2, 2); P(-2, -3, 4, 2); P(-3, -1, 6, 2); P(-5, 2, 10, 3); P(-1, 1, 2, 1); }
      else { P(-5, -3, 7, 1); P(2, -4, 2, 1); P(-4, 0, 9, 1); P(5, -1, 1, 1); P(-5, 3, 6, 1); P(1, 4, 2, 1); }
    },

    // ---------- uso ----------
    use(scene) {
      const r = this.current();
      if (this.available(scene, r)) TH.sfx('res');
      if (!this.available(scene, r)) { TH.ui.toast(scene.inParty(r.who) ? 'Aún no has despertado esa Resonancia' : TH.chars.defs[r.who].name + ' no está en el grupo'); return; }
      if (scene.leader.state !== 'walk') return;
      if (scene.order[0] !== r.who && scene.count > 1) {
        scene.setParty(null, r.who);
        const p = scene.leader;
        for (let i = 0; i < 6; i++) TH.particles.spawn(TH.particles.K.PUFF, p.x + (Math.random() - 0.5) * 10, p.y - p.z * HZ, (Math.random() - 0.5) * 16, -4, 0.45, 0, 0);
      }
      const g = this['seq_' + r.id];
      scene.resSeq = g.call(this, scene, r);
    },
    *wait(scene, t) { let k = 0; while (k < t) { k += scene.dt; yield; } },
    dir(p) { return DV[p.dir] || DV.down; },
    lvl(m, x, y) { return m.levelAt(x, y); },
    pz(scene) { return scene.puzzle; },

    // Lanzada lunar: proyectil que empuja bloques y enciende cristales
    *seq_lanza(scene, r) {
      const p = scene.leader, m = scene.map, [dx, dy] = this.dir(p), pz = this.pz(scene);
      p.force = ['attack', 0];
      yield* this.wait(scene, 0.12);
      p.force = ['attack', 1];
      const lv = m.hh(Math.floor(p.x / TS), Math.floor(p.y / TS));
      const f = { kind: 'lance', x: p.x + dx * 8, y: p.y - 1 + dy * 4, z: lv, dx, dy, t: 0, dur: 9, trail: [] };
      this.fx.push(f);
      let dist = 0, hit = null;
      while (dist < 7.5 * TS) {
        const sp = 300 * scene.dt;
        f.x += dx * sp; f.y += dy * sp; dist += sp;
        f.trail.push([f.x, f.y]); if (f.trail.length > 8) f.trail.shift();
        const c = Math.floor(f.x / TS), rr = Math.floor(f.y / TS);
        if (!m.inb(c, rr)) break;
        const o = pz && pz.objAt(c, rr, true);
        if (o) { hit = o; break; }
        if (pz && pz.gateAt(c, rr)) { hit = 'wall'; break; }
        if (m.hh(c, rr) > lv && !m.isStair(c, rr)) { hit = 'wall'; break; }
        yield;
      }
      f.dur = 0;
      const hx = f.x, hy = f.y - lv * HZ - 8;
      this.burst(hx, hy, '#bfe0ff', 10);
      if (hit && hit.type === 'block') { if (!pz.push(scene, hit, p.dir)) TH.ui.toast('Algo bloquea el paso del bloque'); }
      else if (hit && hit.type === 'crystal') {
        const s = pz.st(hit);
        if (!s.on) { s.on = true; this.ring(hx, hy, '#9fd8ff'); TH.ui.toast('El cristal se ilumina'); }
      } else if (hit && hit.T && hit.T.push === 'heavy') TH.ui.toast('Demasiado pesado para la lanza');
      yield* this.wait(scene, 0.2);
      p.force = null;
    },
    // Agua: sube/baja un estanque · congelar el tiempo de una compuerta (cuando se aprende)
    *seq_agua(scene, r) {
      const p = scene.leader, m = scene.map, [dx, dy] = this.dir(p), pz = this.pz(scene);
      p.force = ['cast', 0];
      const ax = p.x + dx * 40, ay = p.y + dy * 40;
      let tgt = null, bd = 1e9, freeze = null;
      if (pz) for (const o of pz.objs) {
        if (!pz.inEpoch(o)) continue;
        const cx0 = o.c * TS, cy0 = o.r * TS, cx1 = cx0 + o.w * TS, cy1 = cy0 + o.h * TS;
        const d = Math.hypot(Math.max(cx0 - ax, 0, ax - cx1), Math.max(cy0 - ay, 0, ay - cy1));
        if (o.type === 'pool' && d < 44 && d < bd) { bd = d; tgt = o; }
        if (o.type === 'timedgate' && this.freezeLearned() && o._t > 0 && d < 100) freeze = o;
      }
      this.fx.push({ kind: 'swirl', x: p.x + dx * 10, y: p.sy - 10 + dy * 6, t: 0, dur: 0.6, c: '#7fd8f0' });
      yield* this.wait(scene, 0.25);
      p.force = ['cast', 1];
      if (freeze) {
        freeze._frozen = 8;
        const X = (freeze.c + freeze.w / 2) * TS, Y = (freeze.r + freeze.h) * TS - 16;
        this.fx.push({ kind: 'freeze', x: X, y: Y, t: 0, dur: 1.0 });
        TH.ui.toast('El tiempo de la compuerta se detiene');
      } else if (!tgt) TH.ui.toast('No hay agua que responda cerca');
      else if (tgt.level != null) TH.ui.toast('Este agua obedece a algo más antiguo…');
      else if (pz.leaderIn(scene, tgt)) TH.ui.toast('Sal del estanque primero');
      else {
        const s = pz.st(tgt);
        s.high = !s.high;
        const X = (tgt.c + tgt.w / 2) * TS, Y = (tgt.r + tgt.h / 2) * TS - m.hh(tgt.c, tgt.r) * HZ;
        this.fx.push({ kind: 'flood', x: X, y: Y, w: tgt.w * TS, h: tgt.h * TS, up: s.high, t: 0, dur: 0.9 });
        TH.ui.toast(s.high ? 'El agua sube' : 'El agua baja');
      }
      yield* this.wait(scene, 0.4);
      p.force = null;
    },
    // Fuego y tierra: derrite hielo y empuja pilares, rocas y bloques
    *seq_tierra(scene, r) {
      const p = scene.leader, m = scene.map, [dx, dy] = this.dir(p), pz = this.pz(scene);
      p.force = ['attack', 0];
      yield* this.wait(scene, 0.18);
      p.force = ['attack', 1];
      let tgt = null;
      for (let k = 0; k < 3 && pz && !tgt; k++) {
        const c = Math.floor((p.x + dx * (8 + k * TS)) / TS), rr = Math.floor((p.y - 1 + dy * (6 + k * TS)) / TS);
        tgt = pz.objAt(c, rr, true);
      }
      const fxX = tgt ? pz.st(tgt).c * TS + 8 : p.x + dx * 14, fxY = tgt ? pz.st(tgt).r * TS + 12 - m.hh(pz.st(tgt).c, pz.st(tgt).r) * HZ : p.sy + dy * 10;
      this.fx.push({ kind: 'quake', x: fxX, y: fxY, t: 0, dur: 0.6 });
      scene.shake = 1.5;
      if (tgt && tgt.T.melt) {
        const s = pz.st(tgt);
        s.gone = true; tgt.vis.melt = 0.01;
        this.fx.push({ kind: 'flame', x: fxX, y: fxY, t: 0, dur: 0.7 });
        TH.ui.toast('El hielo se derrite');
      } else if (tgt && tgt.T.push) {
        if (!pz.push(scene, tgt, p.dir)) TH.ui.toast('No se mueve: algo lo bloquea');
      } else if (tgt) TH.ui.toast('Eso no se mueve');
      yield* this.wait(scene, 0.25);
      scene.shake = 0;
      p.force = null;
    },
    // Ráfaga: apaga fuegos, hace girar molinos o planea sobre un hueco
    *seq_rafaga(scene, r) {
      const p = scene.leader, m = scene.map, [dx, dy] = this.dir(p), pz = this.pz(scene);
      p.force = ['cast', 0];
      this.fx.push({ kind: 'gust', x: p.x, y: p.sy - 8, dx, dy, t: 0, dur: 0.6 });
      yield* this.wait(scene, 0.15);
      p.force = ['cast', 1];
      let did = false;
      if (pz) for (const o of pz.objs) {
        if (!pz.inEpoch(o) || !(o.T.douse || o.T.spin)) continue;
        const s = pz.st(o);
        if (s.gone) continue;
        const ex = s.c * TS + 8 - p.x, ey = s.r * TS + 10 - p.y, pr = ex * dx + ey * dy, pe = Math.abs(ex * dy - ey * dx);
        if (pr <= 0 || pr > 4.5 * TS || pe > 12 + pr * 0.35) continue;
        if (o.T.douse) { s.gone = true; this.fx.push({ kind: 'steam', x: s.c * TS + 8, y: s.r * TS + 8 - m.hh(s.c, s.r) * HZ, t: 0, dur: 0.8 }); did = true; }
        if (o.T.spin && !s.on) { s.on = true; did = true; TH.ui.toast('El molino gira'); }
      }
      if (did) { yield* this.wait(scene, 0.35); p.force = null; return; }
      // planear sobre un hueco de hasta 3 casillas
      const c0 = Math.floor(p.x / TS), r0 = Math.floor((p.y - 1) / TS), lv = m.hh(c0, r0);
      let land = null;
      const walk = (c, rr) => { const x = c * TS + 8, y = rr * TS + 9; return m.levelPt(x, y) === lv && m.violation(x, y) === 0 && !m.solidAt(x, y); };
      if (!walk(c0 + dx, r0 + dy)) {
        for (let k = 1; k <= 4; k++) {
          const c = c0 + dx * k, rr = r0 + dy * k;
          if (!m.inb(c, rr) || (m.hh(c, rr) > lv && !walk(c, rr)) || (pz && (pz.gateAt(c, rr) || pz.objAt(c, rr, true)))) break;
          if (k >= 2 && walk(c, rr)) { land = [c * TS + 8, rr * TS + 9]; break; }
        }
      }
      if (!land) { yield* this.wait(scene, 0.3); p.force = null; return; }
      p.force = null;
      const x0 = p.x, y0 = p.y, dist = Math.hypot(land[0] - x0, land[1] - y0), dur = 0.25 + dist / 120;
      p.state = 'jump';
      let k = 0;
      while (k < dur) {
        k += scene.dt;
        const e = Math.min(1, k / dur);
        p.x = U.lerp(x0, land[0], e); p.y = U.lerp(y0, land[1], e);
        p.arc = Math.sin(Math.PI * e) * 14; p.frame = 1; p.dist += dist * scene.dt / dur;
        if (Math.random() < 0.5) this.fx.push({ kind: 'feather', x: p.x - dx * 6, y: p.y - p.z * HZ - p.arc - 10, t: 0, dur: 0.5 });
        yield;
      }
      p.x = land[0]; p.y = land[1]; p.arc = 0; p.state = 'walk';
      scene.safe = { x: p.x, y: p.y };
      for (let i = 0; i < 6; i++) TH.particles.spawn(TH.particles.K.PUFF, p.x + (Math.random() - 0.5) * 10, p.y - p.z * HZ, (Math.random() - 0.5) * 16, -4, 0.45, 0, 0);
    },

    // ---------- efectos ----------
    burst(x, y, c, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 50; this.fx.push({ kind: 'dot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, c, t: 0, dur: 0.4 + Math.random() * 0.3 }); } },
    ring(x, y, c) { this.fx.push({ kind: 'ring', x, y, c, t: 0, dur: 0.6 }); },
    update(dt) {
      for (let i = this.fx.length - 1; i >= 0; i--) {
        const f = this.fx[i];
        f.t += dt;
        if (f.kind === 'dot') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 90 * dt; }
        if (f.t >= f.dur && f.kind !== 'lance') this.fx.splice(i, 1);
        else if (f.kind === 'lance' && f.dur === 0) this.fx.splice(i, 1);
      }
    },
    // en coordenadas del mundo (ctx ya trasladado), modo aditivo
    draw(ctx, t) {
      if (!this.fx.length) return;
      ctx.globalCompositeOperation = 'lighter';
      const P = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
      for (const f of this.fx) {
        const k = f.dur ? f.t / f.dur : 0;
        switch (f.kind) {
          case 'lance': {
            const yo = -f.z * HZ - 8;
            f.trail.forEach(([x, y], i) => P(x - 1, y + yo - 1, 3, 3, i > 5 ? '#ffffff' : '#7fb8ff'));
            P(f.x - 3 + f.dx * 2, f.y + yo - 1, 6, 3, '#ffffff'); P(f.x - 2, f.y + yo - 2, 4, 5, '#bfe0ff');
            break;
          }
          case 'dot': ctx.globalAlpha = 1 - k; P(f.x, f.y, 2, 2, f.c); ctx.globalAlpha = 1; break;
          case 'ring': { ctx.globalAlpha = 1 - k; const r = 4 + k * 26; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; P(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.6, 2, 1, f.c); } ctx.globalAlpha = 1; break; }
          case 'swirl': { for (let i = 0; i < 10; i++) { const a = t * 10 + i * 0.63, r = 4 + k * 10; P(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.5 - k * 8, 2, 2, i % 2 ? '#7fd8f0' : '#ffffff'); } break; }
          case 'flood': {
            ctx.globalAlpha = (1 - k) * 0.8;
            for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, r = (f.up ? 1 - k : k) * Math.max(f.w, f.h) * 0.5 + 4; P(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.5, 3, 2, '#9fe8ff'); }
            for (let i = 0; i < 8; i++) P(f.x - f.w / 2 + ((i * 37) % f.w), f.y + (f.up ? -k * 12 : k * 12) - 4 + ((i * 13) % 8), 1, 4, '#ffffff');
            ctx.globalAlpha = 1;
            break;
          }
          case 'freeze': { ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = i * 1.047 + k; for (let j = 2; j < 14; j += 2) P(f.x + Math.cos(a) * j, f.y + Math.sin(a) * j, 1, 1, '#bff4ff'); } ctx.globalAlpha = 1; break; }
          case 'quake': {
            ctx.globalAlpha = 1 - k;
            for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = 3 + k * 20; P(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.45, 2, 1, i % 2 ? '#ff9a4a' : '#ffd070'); }
            for (let i = 0; i < 4; i++) P(f.x - 8 + i * 5, f.y - k * 16 - (i % 2) * 4, 2, 2, '#c8a070');
            ctx.globalAlpha = 1;
            break;
          }
          case 'flame': { for (let i = 0; i < 8; i++) { const h = (1 - k) * (8 + ((i * 7) % 6)); P(f.x - 7 + i * 2, f.y - h, 2, h, i % 2 ? '#ff7a2a' : '#ffd040'); } break; }
          case 'steam': { ctx.globalAlpha = 0.6 * (1 - k); for (let i = 0; i < 6; i++) P(f.x - 6 + i * 2 + Math.sin(t * 6 + i) * 2, f.y - k * 20 - i, 3, 3, '#e0e8f0'); ctx.globalAlpha = 1; break; }
          case 'gust': {
            ctx.globalAlpha = 1 - k;
            for (let i = 0; i < 5; i++) {
              const d = 10 + k * 60 + i * 6, s = (i - 2) * (4 + k * 8);
              const x = f.x + f.dx * d + f.dy * s, y = f.y + f.dy * d * 0.7 + f.dx * s * 0.5;
              P(x, y, f.dx ? 6 : 1, f.dy ? 5 : 1, '#e8f8ff');
            }
            ctx.globalAlpha = 1;
            break;
          }
          case 'feather': ctx.globalAlpha = 1 - k; P(f.x, f.y + k * 6, 3, 1, '#e8f8ff'); ctx.globalAlpha = 1; break;
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
