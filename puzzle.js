// Objetos de puzle de una zona: estado guardado en los flags, señales lógicas, colisión dinámica y dibujo.
// La colisión se aplica con map.dynLv (255 = sin cambio, 254 = bloqueado, otro valor = nivel pisable).
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, TS = 16, HZ = TH.HZ;
  const DV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  class Puzzle {
    constructor(zone, def) {
      this.zone = zone;
      this.def = def;
      this.epoch = null;
      this.objs = (def.puzzle || []).map((o) => Object.assign({ w: 1, h: 1 }, o, { T: TH.data.puzzleTypes[o.type], vis: { open: 0, lvl: 0, slide: 0, sx: 0, sy: 0, spin: 0, melt: 0 } }));
      this.byId = {};
      for (const o of this.objs) this.byId[o.id] = o;
      // estado visual inicial coherente con el guardado
      for (const o of this.objs) { o.vis.open = this.isOpen(o) ? 1 : 0; o.vis.lvl = o.type === 'pool' && this.poolHigh(o) ? 1 : 0; }
    }
    // ---------- estado ----------
    key(o) { return 'pz.' + this.zone + '.' + o.id; }
    st(o) {
      const F = TH.flags.v, k = this.key(o);
      let s = F[k];
      if (!s || typeof s !== 'object') { s = F[k] = { c: o.c, r: o.r }; if (o.type === 'pool') s.high = !!o.high; }
      return s;
    }
    reset() {
      for (const o of this.objs) { delete TH.flags.v[this.key(o)]; o.vis.slide = 0; o._t = 0; o._frozen = 0; }
      for (const o of this.objs) { o.vis.open = this.isOpen(o) ? 1 : 0; o.vis.lvl = o.type === 'pool' && this.poolHigh(o) ? 1 : 0; }
    }
    inEpoch(o) { return !o.epoch || o.epoch === this.epoch; }
    // valor lógico de un objeto para las expresiones
    sig(id) {
      const o = this.byId[id];
      if (!o) return false;
      const s = this.st(o);
      switch (o.type) {
        case 'plate': return !!o._pressed;
        case 'gate': case 'timedgate': return this.isOpen(o);
        case 'pool': return this.poolHigh(o);
        case 'seed': return !!s.planted;
        case 'ice': case 'fire': return !!s.gone;
        default: return !!s.on;
      }
    }
    expr(e) {
      if (e == null) return true;
      if (e === true || e === false) return e;
      const one = (tk) => (tk.indexOf('f:') === 0 ? TH.flags.test(tk.slice(2)) : this.sig(tk));
      return String(e).split('|').some((part) => part.split('&').every((tk) => { tk = tk.trim(); return tk[0] === '!' ? !one(tk.slice(1)) : one(tk); }));
    }
    isOpen(o) { return o.type === 'timedgate' ? (o._t || 0) > 0 : o.type === 'gate' ? this.expr(o.open) : false; }
    poolHigh(o) { return o.level != null ? this.expr(o.level) : !!this.st(o).high; }
    inRect(o, c, r) { return c >= o.c && c < o.c + o.w && r >= o.r && r < o.r + o.h; }
    // objeto sólido (bloque, pilar, cristal…) en una casilla de la época actual
    objAt(c, r, solidOnly) {
      for (const o of this.objs) {
        if (!this.inEpoch(o) || o.T.area) continue;
        const s = this.st(o);
        if (s.gone || s.c !== c || s.r !== r) continue;
        if (o.type === 'tree' && !this.expr(o.when)) continue;
        if (solidOnly && !o.T.solid) continue;
        return o;
      }
      return null;
    }
    gateAt(c, r) {
      for (const o of this.objs) if (this.inEpoch(o) && (o.type === 'gate' || o.type === 'timedgate') && this.inRect(o, c, r) && !this.isOpen(o)) return o;
      return null;
    }
    poolAt(c, r) { for (const o of this.objs) if (o.type === 'pool' && this.inEpoch(o) && this.inRect(o, c, r)) return o; return null; }

    // ---------- colisión dinámica ----------
    apply(m) {
      if (!m.dynLv || m.dynLv.length !== m.w * m.h) m.dynLv = new Uint8Array(m.w * m.h);
      const D = m.dynLv;
      D.fill(255);
      const set = (c, r, v) => { if (m.inb(c, r)) D[r * m.w + c] = v; };
      for (const o of this.objs) {
        if (!this.inEpoch(o)) continue;
        const s = this.st(o);
        if (o.type === 'pool') {
          const hi = this.poolHigh(o);
          for (let r = o.r; r < o.r + o.h; r++) for (let c = o.c; c < o.c + o.w; c++) set(c, r, hi || !o.dry ? 254 : m.hh(c, r));
        } else if (o.type === 'gate' || o.type === 'timedgate') {
          if (!this.isOpen(o)) for (let r = o.r; r < o.r + o.h; r++) for (let c = o.c; c < o.c + o.w; c++) set(c, r, 254);
        } else if (o.type === 'tree') {
          if (!this.expr(o.when)) continue;
          set(s.c, s.r, 254);
          for (const [c, r] of o.bridge || []) set(c, r, o.lv != null ? o.lv : m.hh(s.c, s.r));
        } else if (o.T.solid && !s.gone) set(s.c, s.r, 254);
      }
      // las plataformas, después de los estanques
      for (const o of this.objs) {
        if (o.type !== 'platform' || !this.inEpoch(o)) continue;
        if (this.platUp(o)) set(o.c, o.r, o.lv != null ? o.lv : m.hh(o.c, o.r));
      }
    }
    platUp(o) { return o.pool ? this.poolHigh(this.byId[o.pool]) : this.expr(o.up); }

    // ¿alguien del grupo pisa esta casilla?
    partyOn(scene, c, r, leaderOnly) {
      const n = leaderOnly ? 1 : scene.count;
      for (let k = 0; k < n; k++) {
        const a = scene.party[k];
        if (a.x + 4 > c * TS && a.x - 4 < c * TS + TS && a.y + 1 > r * TS && a.y - 3 < r * TS + TS) return true;
      }
      return false;
    }
    leaderIn(scene, o) {
      const p = scene.leader;
      for (let r = o.r; r < o.r + o.h; r++) for (let c = o.c; c < o.c + o.w; c++) if (p.x + 4 > c * TS && p.x - 4 < c * TS + TS && p.y + 1 > r * TS && p.y - 3 < r * TS + TS) return true;
      return false;
    }

    // ---------- empujar ----------
    canPlace(m, scene, o, c, r) {
      const s = this.st(o);
      if (!m.inb(c, r)) return false;
      if (m.hh(c, r) !== m.hh(s.c, s.r) || m.isStair(c, r)) return false;
      if (this.objAt(c, r, false) && this.objAt(c, r, false).type !== 'plate') return false;
      if (this.gateAt(c, r)) return false;
      const d = m.dynLv ? m.dynLv[r * m.w + c] : 255;
      if (d === 254) return false;
      if (d === 255 && m.levelPt(c * TS + 8, r * TS + 8) == null) return false;
      if (this.partyOn(scene, c, r, true)) return false;
      for (const t of m.things) if (Math.floor(t.x / TS) === c && Math.floor((t.y - 1) / TS) === r) return false;
      return true;
    }
    push(scene, o, dir) {
      const m = scene.map, s = this.st(o), [dx, dy] = DV[dir];
      const c = s.c + dx, r = s.r + dy;
      if (!this.canPlace(m, scene, o, c, r)) { o.vis.shake = 0.25; return false; }
      o.vis.sx = -dx * TS; o.vis.sy = -dy * TS; o.vis.slide = 1;
      s.c = c; s.r = r;
      this.apply(m);
      for (let i = 0; i < 6; i++) TH.particles.spawn(TH.particles.K.PUFF, c * TS + 8 - dx * 8 + (Math.random() - 0.5) * 8, r * TS + 14 - m.hh(c, r) * HZ, (Math.random() - 0.5) * 14, -4, 0.4, 0, 0);
      return true;
    }

    // ---------- bucle ----------
    update(dt, scene) {
      const m = scene.map;
      // placas: bloques/pilares encima o (si no son de peso) alguien del grupo
      for (const o of this.objs) {
        if (o.type !== 'plate' || !this.inEpoch(o)) continue;
        const was = o._pressed;
        let on = false;
        for (const b of this.objs) {
          if ((b.type === 'block' || b.type === 'pillar' || b.type === 'rock') && this.inEpoch(b)) { const s = this.st(b); if (!s.gone && s.c === o.c && s.r === o.r && b.vis.slide < 0.3) on = true; }
        }
        if (!on && !o.heavy && this.partyOn(scene, o.c, o.r)) on = true;
        o._pressed = on;
        if (on && !was && scene.ready) this.chime(o.c * TS + 8, o.r * TS + 10 - m.hh(o.c, o.r) * HZ, '#ffe070');
      }
      // compuertas temporizadas: no se cierran encima del grupo
      for (const o of this.objs) {
        if (o.type !== 'timedgate') continue;
        if (o._frozen > 0) { o._frozen -= dt; continue; }
        if (o._t > 0) { o._t -= dt; if (o._t <= 0 && this.leaderIn(scene, o)) o._t = 0.05; }
      }
      // animaciones
      for (const o of this.objs) {
        const v = o.vis;
        if (o.type === 'gate' || o.type === 'timedgate') v.open += ((this.isOpen(o) ? 1 : 0) - v.open) * Math.min(1, dt * 6);
        if (o.type === 'pool') v.lvl += ((this.poolHigh(o) ? 1 : 0) - v.lvl) * Math.min(1, dt * 2.2);
        if (v.slide > 0) v.slide = Math.max(0, v.slide - dt * 6);
        if (v.shake > 0) v.shake -= dt;
        if (o.type === 'windmill') v.spin += dt * (this.st(o).on ? 7 : 0.4);
        if (v.melt > 0 && v.melt < 1) v.melt = Math.min(1, v.melt + dt * 1.8);
      }
      this.apply(m);
      // empujar un bloque andando contra él
      const p = scene.leader, I = TH.input;
      if (p.state === 'walk' && !scene.resSeq && scene.axis) {
        const ax = scene.axis.x, ay = scene.axis.y;
        let dir = null;
        if (Math.abs(ax) > 0.6 && Math.abs(ay) < 0.4) dir = ax < 0 ? 'left' : 'right';
        else if (Math.abs(ay) > 0.6 && Math.abs(ax) < 0.4) dir = ay < 0 ? 'up' : 'down';
        const [dx, dy] = dir ? DV[dir] : [0, 0];
        const c = Math.floor((p.x + dx * 7) / TS), r = Math.floor((p.y - 1 + dy * 6) / TS);
        const o = dir ? this.objAt(c, r, true) : null;
        if (o && o.T.push === 'light' && p.speed < 20) {
          this.pushT = (this.pushT || 0) + dt;
          if (this.pushT > 0.35) { this.pushT = 0; this.push(scene, o, dir); }
        } else this.pushT = 0;
      }
      void I;
      // red de seguridad: si el líder queda dentro de algo, vuelve a la última posición firme
      if (p.state === 'walk' && m.violation(p.x, p.y) >= 1e9 && scene.safe && m.violation(scene.safe.x, scene.safe.y) < 1e9) { p.x = scene.safe.x; p.y = scene.safe.y; }
    }
    chime(x, y, c) { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; TH.particles.spawn(TH.particles.K.SPARK, x, y, Math.cos(a) * 24, Math.sin(a) * 12 - 10, 0.6, i, c); } }

    // ---------- interacción con A ----------
    interactables(scene) {
      const out = [];
      for (const o of this.objs) {
        if (!o.T.interact || !this.inEpoch(o)) continue;
        if (o.type === 'seed' && this.st(o).planted) continue;
        const z = scene.map.hh(o.c, o.r);
        out.push({ pzo: o, x: o.c * TS + 8, y: o.r * TS + 12, z, e: { reach: 22 }, kind: 'pz' });
      }
      return out;
    }
    interact(scene, o) {
      const s = this.st(o), m = scene.map, x = o.c * TS + 8, y = o.r * TS + 6 - m.hh(o.c, o.r) * HZ;
      if (o.type === 'lever') {
        if (o.reset) {
          if (!this.canReset(scene)) { TH.ui.toast('Apártate de los bloques para reiniciar'); return true; }
          this.reset(); s.flip = !s.flip; this.st(o).flip = s.flip;
          TH.ui.toast('La sala vuelve a su estado inicial');
        } else if (o.pulse) {
          const g = this.byId[o.pulse]; g._t = g.dur || 3; g._frozen = 0; s.flip = !s.flip;
          TH.ui.toast('La compuerta se abre… ¡deprisa!');
        } else { s.on = !s.on; }
        this.chime(x, y, '#ffe070');
        return true;
      }
      if (o.type === 'seed') {
        if (!TH.party.count('semilla')) { TH.cutscene.play([{ say: 'none', name: 'Tierra blanda', t: 'Tierra húmeda y blanda, protegida del viento. {p:0.3}Aquí crecería cualquier cosa.' }]); return true; }
        TH.party.add('semilla', -1);
        s.planted = true;
        for (let i = 0; i < 10; i++) TH.particles.spawn(TH.particles.K.SPARK, x + (Math.random() - 0.5) * 10, y + 4, (Math.random() - 0.5) * 20, -20 - Math.random() * 20, 0.8, i, '#9fe07a');
        TH.cutscene.play([{ say: 'none', name: 'Kaelen', t: 'Ya está. {p:0.3}Dentro de unos siglos dará buena sombra.' }]);
        return true;
      }
      if (o.type === 'stele') { scene.switchEpoch(); return true; }
      return false;
    }
    canReset(scene) {
      for (const o of this.objs) if ((o.type === 'block' || o.type === 'pillar' || o.type === 'rock') && this.inEpoch(o) && this.partyOn(scene, o.c, o.r, true)) return false;
      return true;
    }

    // ---------- dibujo ----------
    // lo que va pegado al suelo (antes de ordenar por Y)
    drawGround(ctx, m, t, cx, cy) {
      for (const o of this.objs) {
        if (!this.inEpoch(o) || !o.T.flat) continue;
        const z = m.hh(o.c, o.r), X = o.c * TS, Y = o.r * TS - z * HZ;
        if (X > cx + TH.W + 32 || X + o.w * TS < cx - 32 || Y > cy + TH.H + 32 || Y + o.h * TS < cy - 32) continue;
        if (o.type === 'pool') this.drawPool(ctx, o, m, t);
        else if (o.type === 'plate') {
          const on = o._pressed;
          P(ctx, X + 2, Y + 3, 12, 11, '#2a2238'); P(ctx, X + 3, Y + 4 + (on ? 1 : 0), 10, 9 - (on ? 1 : 0), on ? '#c89a3a' : '#8a7a68');
          P(ctx, X + 3, Y + 4 + (on ? 1 : 0), 10, 1, on ? '#ffe070' : '#b8a890');
          if (o.heavy) { P(ctx, X + 6, Y + 7, 4, 4, on ? '#ffe070' : '#5a4a40'); } else P(ctx, X + 7, Y + 8, 2, 2, on ? '#ffffff' : '#5a4a40');
        } else if (o.type === 'platform') {
          const up = this.platUp(o), pool = o.pool && this.byId[o.pool];
          const k = pool ? pool.vis.lvl : up ? 1 : 0;
          const yy = Y + Math.round((1 - k) * 6) + (up ? Math.round(Math.sin(t * 2 + o.c) * 0.6) : 0);
          ctx.globalAlpha = 0.45 + 0.55 * k;
          P(ctx, X + 1, yy + 2, 14, 13, '#3a3040'); P(ctx, X + 2, yy + 2, 12, 11, '#8a8094'); P(ctx, X + 2, yy + 2, 12, 2, '#b8b0c4');
          P(ctx, X + 4, yy + 6, 8, 1, '#6a6078'); P(ctx, X + 7, yy + 4, 1, 8, '#6a6078');
          if (k > 0.5) P(ctx, X + 6, yy + 7, 3, 3, '#7fd8f0');
          ctx.globalAlpha = 1;
          if (k > 0.5) { P(ctx, X, yy + 14, 16, 1, 'rgba(200,240,255,.5)'); }
        } else if (o.type === 'seed') {
          const s = this.st(o);
          P(ctx, X + 2, Y + 6, 12, 8, '#4a3020'); P(ctx, X + 3, Y + 7, 10, 6, '#6a4630'); P(ctx, X + 4, Y + 8, 2, 1, '#8a6040'); P(ctx, X + 9, Y + 10, 2, 1, '#8a6040');
          if (s.planted) { P(ctx, X + 7, Y + 2, 2, 6, '#5a8a3a'); P(ctx, X + 4, Y + 2, 4, 2, '#7fc85a'); P(ctx, X + 9, Y, 4, 3, '#9fe07a'); }
        }
      }
      // puente de raíces del roble
      for (const o of this.objs) {
        if (o.type !== 'tree' || !this.inEpoch(o) || !this.expr(o.when)) continue;
        for (const [c, r] of o.bridge || []) {
          const X = c * TS, Y = r * TS - (o.lv || 0) * HZ;
          P(ctx, X, Y + 3, 16, 11, '#3a2418'); P(ctx, X, Y + 4, 16, 8, '#7a5030'); P(ctx, X, Y + 4, 16, 2, '#a8744a');
          P(ctx, X + ((c * 5) % 9), Y + 7, 6, 1, '#5a3820'); P(ctx, X + ((c * 3 + 4) % 10), Y + 10, 5, 1, '#5a3820');
          P(ctx, X + 3, Y + 12, 2, 4, '#5a3820'); P(ctx, X + 11, Y + 12, 2, 3, '#5a3820');
        }
      }
    }
    drawPool(ctx, o, m, t) {
      const z = m.hh(o.c, o.r), X = o.c * TS, Y = o.r * TS - z * HZ, Wd = o.w * TS, Hd = o.h * TS, k = o.vis.lvl;
      // fondo: piedra mojada o barro (pisable) / pozo hondo
      if (o.dry) { P(ctx, X, Y, Wd, Hd, 'rgba(70,52,40,.55)'); for (let i = 0; i < o.w * o.h; i++) P(ctx, X + ((i * 37) % Wd), Y + ((i * 53) % Hd), 3, 1, 'rgba(120,160,190,.4)'); }
      else {
        P(ctx, X, Y, Wd, Hd, '#140f22'); P(ctx, X, Y, Wd, 8, '#2a2238'); P(ctx, X, Y + 8, 2, Hd - 8, '#221a30'); P(ctx, X + Wd - 2, Y + 8, 2, Hd - 8, '#221a30');
        for (let c = 0; c < o.w; c++) P(ctx, X + c * TS + 3, Y + 2, 10, 1, '#3a3050');
      }
      if (k < 0.02) return;
      // agua: sube desde el fondo
      const top = Y + Math.round((1 - k) * (o.dry ? 2 : 8));
      ctx.globalAlpha = 0.25 + 0.6 * k;
      P(ctx, X, top, Wd, Y + Hd - top, '#2a78b8');
      ctx.globalAlpha = 0.5 * k;
      P(ctx, X, top, Wd, 2, '#9fe8ff');
      for (let i = 0; i < o.w * 3; i++) { const xx = X + ((i * 29 + Math.floor(t * 8)) % Wd), yy = top + 4 + ((i * 41) % Math.max(4, Hd - 6)); P(ctx, xx, yy, 4 + (i % 3), 1, '#bff4ff'); }
      ctx.globalAlpha = 1;
    }
    // objetos con volumen: entran en la lista ordenada por Y
    collect(list, m, cx, cy) {
      for (const o of this.objs) {
        if (!this.inEpoch(o) || (o.T.flat && o.type !== 'pool')) continue;
        if (o.type === 'pool') continue;
        const s = this.st(o);
        if (s.gone && o.vis.melt >= 1) continue;
        if (o.type === 'tree' && !this.expr(o.when)) continue;
        const c = o.T.area ? o.c : s.c, r = o.T.area ? o.r + o.h - 1 : s.r;
        const x = c * TS + 8 + (o.vis.slide ? o.vis.sx * o.vis.slide : 0), y = r * TS + 15 + (o.vis.slide ? o.vis.sy * o.vis.slide : 0);
        if (x < cx - 60 || x > cx + TH.W + 60 || y < cy - 30 || y > cy + TH.H + 90) continue;
        const z = m.hh(c, r);
        o.dx = x; o.dy = y; o.dsy = y - z * HZ;
        o.sort = y; o.pzo = true;
        list.push(o);
      }
    }
    draw(ctx, o, t) {
      const x = Math.round(o.dx + (o.vis.shake > 0 ? Math.sin(t * 60) * 1.5 : 0)), y = Math.round(o.dsy), s = this.st(o);
      const Sh = (w) => { ctx.fillStyle = 'rgba(16,10,30,.35)'; ctx.fillRect(x - w, y - 2, w * 2, 3); };
      switch (o.type) {
        case 'block': {
          Sh(8);
          P(ctx, x - 8, y - 17, 16, 17, '#2a2238'); P(ctx, x - 7, y - 16, 14, 9, '#b8a890'); P(ctx, x - 7, y - 7, 14, 6, '#8a7a68');
          P(ctx, x - 7, y - 16, 14, 1, '#e0d4c0'); P(ctx, x - 4, y - 13, 8, 3, '#9a8a78'); P(ctx, x - 2, y - 12, 4, 1, '#7fd8f0');
          break;
        }
        case 'pillar': case 'rock': {
          Sh(8);
          if (o.type === 'rock') {
            P(ctx, x - 8, y - 14, 16, 14, '#2a2238'); P(ctx, x - 7, y - 13, 14, 12, '#6c6a80'); P(ctx, x - 7, y - 13, 14, 3, '#9a98b0'); P(ctx, x - 4, y - 8, 5, 2, '#55536a'); P(ctx, x + 2, y - 5, 4, 2, '#55536a');
          } else {
            P(ctx, x - 7, y - 30, 14, 30, '#2a2238'); P(ctx, x - 6, y - 29, 12, 28, '#a8a0b8'); P(ctx, x - 6, y - 29, 3, 28, '#d0c8dc'); P(ctx, x + 3, y - 29, 3, 28, '#7a7290');
            P(ctx, x - 8, y - 32, 16, 4, '#2a2238'); P(ctx, x - 7, y - 31, 14, 2, '#c8c0d4'); P(ctx, x - 8, y - 4, 16, 4, '#5a5270');
            for (let i = 0; i < 3; i++) P(ctx, x - 2, y - 25 + i * 8, 4, 1, '#ff9a5a');
          }
          break;
        }
        case 'crystal': {
          const on = s.on, gl = on ? 0.6 + Math.sin(t * 4) * 0.3 : 0;
          Sh(6);
          P(ctx, x - 5, y - 4, 10, 4, '#3a3050');
          P(ctx, x - 3, y - 20, 6, 17, '#1a1830'); P(ctx, x - 2, y - 22, 4, 2, '#1a1830');
          P(ctx, x - 2, y - 19, 4, 15, on ? '#bfe8ff' : '#4a5a80'); P(ctx, x - 1, y - 21, 2, 2, on ? '#ffffff' : '#6a7aa0'); P(ctx, x - 2, y - 19, 1, 15, on ? '#ffffff' : '#7a8ab0');
          if (on) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * gl; ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(x, y - 12, 12, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
          break;
        }
        case 'lever': {
          const on = o.reset || o.pulse ? s.flip : s.on;
          Sh(5);
          P(ctx, x - 5, y - 6, 10, 6, '#2a2238'); P(ctx, x - 4, y - 5, 8, 4, o.reset ? '#7a6a9a' : o.pulse ? '#c8a050' : '#8a7a68');
          const a = on ? 0.6 : -0.6;
          for (let i = 0; i < 10; i++) P(ctx, x + Math.round(Math.sin(a) * i), y - 5 - i, 2, 1, '#5a4030');
          P(ctx, x + Math.round(Math.sin(a) * 10) - 2, y - 17, 4, 4, o.reset ? '#c8b0ff' : '#ff6a4a');
          break;
        }
        case 'ice': {
          const k = o.vis.melt || 0, hgt = Math.round(18 * (1 - k));
          if (hgt <= 0) break;
          Sh(8);
          ctx.globalAlpha = 1 - k * 0.5;
          P(ctx, x - 8, y - hgt, 16, hgt, '#3a6a98'); P(ctx, x - 7, y - hgt + 1, 14, hgt - 1, '#8fd0f0'); P(ctx, x - 7, y - hgt + 1, 14, 2, '#e0f8ff');
          P(ctx, x - 4, y - hgt + 4, 2, Math.max(1, hgt - 7), '#ffffff'); P(ctx, x + 3, y - hgt + 6, 1, Math.max(1, hgt - 9), '#c8f0ff');
          ctx.globalAlpha = 1;
          if (k > 0 && k < 1) for (let i = 0; i < 2; i++) TH.particles.spawn(TH.particles.K.SMOKE, x + (Math.random() - 0.5) * 12, y - hgt, 0, -14, 0.8, 0, 0);
          break;
        }
        case 'fire': {
          if (s.gone) { P(ctx, x - 5, y - 3, 10, 3, '#3a2a28'); P(ctx, x - 3, y - 4, 6, 1, '#5a4a40'); break; }
          P(ctx, x - 6, y - 4, 12, 4, '#4a3028'); P(ctx, x - 5, y - 4, 10, 2, '#6a4830');
          ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 7; i++) {
            const ph = t * 9 + i * 1.7, hh = 7 + ((Math.sin(ph) + 1) * 4) | 0, xx = x - 5 + i * 1.6 + Math.sin(ph * 0.7) * 1;
            P(ctx, xx, y - 4 - hh, 2, hh, i % 2 ? '#ff7a2a' : '#ffb040'); P(ctx, xx, y - 4 - hh, 2, 2, '#ffe070');
          }
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 'windmill': {
          const on = s.on;
          Sh(7);
          P(ctx, x - 5, y - 26, 10, 26, '#2a2238'); P(ctx, x - 4, y - 25, 8, 24, '#c8b090'); P(ctx, x - 4, y - 25, 2, 24, '#e0ccaa'); P(ctx, x - 6, y - 28, 12, 4, '#8a4a30');
          const cxh = x, cyh = y - 26;
          for (let b = 0; b < 4; b++) {
            const a = o.vis.spin + b * Math.PI / 2;
            for (let i = 2; i < 13; i++) { const px = cxh + Math.cos(a) * i, py = cyh + Math.sin(a) * i * 0.9; P(ctx, px, py, 2, 2, '#f0e8d8'); if (i > 5) P(ctx, px + Math.cos(a + 1.57) * 2, py + Math.sin(a + 1.57) * 2, 2, 2, on ? '#ffe070' : '#b0a090'); }
          }
          P(ctx, cxh - 1, cyh - 1, 3, 3, '#5a3020');
          break;
        }
        case 'gate': case 'timedgate': {
          const X = o.c * TS, Y = y, wd = o.w * TS, hgt = o.h * TS, k = o.vis.open;
          const bars = Math.round(26 * (1 - k)) + 2;
          // marco
          P(ctx, X - 2, Y - hgt - 26, 3, hgt + 26, '#2a2238'); P(ctx, X + wd - 1, Y - hgt - 26, 3, hgt + 26, '#2a2238');
          P(ctx, X - 2, Y - hgt - 28, wd + 4, 5, '#2a2238'); P(ctx, X - 1, Y - hgt - 27, wd + 2, 3, o.type === 'timedgate' ? '#c8a050' : '#6a6080');
          for (let i = 2; i < wd - 1; i += 4) {
            P(ctx, X + i, Y - hgt - 24, 2, bars + hgt - 4, '#3a3448'); P(ctx, X + i, Y - hgt - 24, 1, bars + hgt - 4, '#8a84a0');
          }
          if (k < 0.5) for (let j = 0; j < hgt; j += 8) P(ctx, X, Y - hgt - 20 + j + (bars - 2), wd, 1, '#5a5470');
          if (o.type === 'timedgate' && o._t > 0) {
            const q = Math.min(1, o._t / (o.dur || 3));
            P(ctx, X, Y - hgt - 34, wd, 3, '#1a1028'); P(ctx, X, Y - hgt - 34, Math.round(wd * q), 3, o._frozen > 0 ? '#7fe6ff' : '#ffd040');
          }
          break;
        }
        case 'tree': {
          Sh(14);
          P(ctx, x - 5, y - 26, 10, 26, '#3a2418'); P(ctx, x - 4, y - 26, 8, 26, '#7a5030'); P(ctx, x - 4, y - 26, 2, 26, '#a8744a');
          const cy0 = y - 40, L2 = ['#1d4a2e', '#2f7040', '#4f9a50', '#7fc85a'];
          const blob = (bx, by, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(bx, by, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); };
          blob(x, cy0, 22, L2[0]); blob(x - 2, cy0 - 2, 20, L2[1]); blob(x - 6, cy0 - 7, 13, L2[2]); blob(x - 9, cy0 - 11, 6, L2[3]);
          blob(x + 10, cy0 + 4, 9, L2[1]);
          break;
        }
        case 'stele': {
          Sh(7);
          P(ctx, x - 7, y - 6, 14, 6, '#2a2238'); P(ctx, x - 6, y - 5, 12, 4, '#8a7a9a');
          P(ctx, x - 5, y - 24, 10, 18, '#2a2238'); P(ctx, x - 4, y - 23, 8, 16, '#c8b8d8');
          // reloj de arena
          const gl = 0.6 + Math.sin(t * 3) * 0.3;
          P(ctx, x - 3, y - 21, 6, 1, '#e8b84a'); P(ctx, x - 3, y - 10, 6, 1, '#e8b84a');
          P(ctx, x - 2, y - 20, 4, 3, '#ffe8a0'); P(ctx, x - 1, y - 17, 2, 2, '#ffe8a0'); P(ctx, x - 2, y - 13, 4, 3, '#ffd070');
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * gl; ctx.fillStyle = '#ffe0a0'; ctx.beginPath(); ctx.arc(x, y - 16, 10, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          break;
        }
      }
    }
    // luces de noche
    lights(L, cx, cy, n, t) {
      for (const o of this.objs) {
        if (!this.inEpoch(o) || !o.T.light) continue;
        const s = this.st(o);
        if (o.type === 'fire' && s.gone) continue;
        if (o.type === 'crystal' && !s.on) continue;
        const x = (o.dx != null ? o.dx : s.c * TS + 8) - cx, y = (o.dsy != null ? o.dsy : s.r * TS + 15) - 12 - cy;
        L.light(x, y, o.type === 'fire' ? 46 + Math.sin(t * 9) * 2 : 34, o.T.light, (0.35 + 0.65 * n) * 0.9);
      }
    }
  }
  function P(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  Puzzle.DV = DV;
  TH.Puzzle = Puzzle;
})();
