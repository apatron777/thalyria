// Combate por turnos sobre el propio mapa, al estilo Golden Sun.
// Ronda: eliges la orden de cada miembro (Atacar, Técnicas, Combos, Ecos, Invocar, Defender, Objetos) y después
// actúan todos —grupo y enemigos— por orden de velocidad. Al atacar, el arma puede desatar su poder épico.
// Los Ecos liberados quedan en espera; con 2 o más se puede invocar.
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, W = TH.W, H = TH.H, HZ = TH.HZ;
  const $ = (id) => document.getElementById(id);
  const ZOOM = 2;
  const PSLOT = [[-28, -14], [-48, 4], [-68, 22]];
  const ESLOT = { 1: [[36, 4]], 2: [[30, -8], [48, 14]], 3: [[28, -14], [48, 4], [30, 22]] };
  const BOSS_SLOT = { karkinos: [66, -10], pinza_izq: [20, -4], pinza_der: [22, 22], madre: [66, 6], vigia_bronce: [68, 22], brazo_izq: [22, 6], brazo_der: [26, 38], varek: [44, 2], cronoguardia: [70, 22], aguja_izq: [22, 4], aguja_der: [26, 36], abisal: [64, 18], coloso: [68, 20], yunque_izq: [22, 4], yunque_der: [26, 36], coloso_guerra: [68, 20], puno_izq: [22, 4], puno_der: [26, 36], varek_abisal: [44, 2], abisal_eco: [64, 18], corazon: [72, 22], tentaculo_izq: [22, 6], tentaculo_der: [26, 36], leviatan: [76, 24], aleta_izq: [12, -8], aleta_der: [18, 34], zarpa_izq: [24, -2], zarpa_der: [26, 26] };
  // huecos para los esbirros que llama un jefe
  const BOSS_ADDS = [[0, 8], [44, 32], [40, -30]];
  const ZOOM_BOSS = 1.45;
  // casillas libres a las que pueden moverse los enemigos
  const EPOS = [[22, -20], [24, 2], [22, 24], [38, -12], [40, 10], [38, 30], [56, -4], [56, 18], [54, -22]];
  const MARK_H = { larva: 22, cangrejo: 32, gaviota: 30, karkinos: 56, karkinos2: 56, pinza: 34 };
  // ventanas de timing (segundos)
  const RING_T = 0.5, PERF_EARLY = 0.13, PERF_LATE = 0.07;
  const BLOCK_EARLY = 0.18, BLOCK_LATE = 0.06;
  const ORB_MAX = 8, CHARGE_MAX = 3, COMBO_MAX = 300;
  const TYPE_ICON = {};

  function typeIcon(t) {
    if (TYPE_ICON[t]) return TYPE_ICON[t];
    const o = TH.makeCanvas(9, 9), g = o.g, c = TH.data.TYPE_COLOR[t] || '#fff';
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    P(0, 1, 9, 7, '#1a1028'); P(1, 0, 7, 9, '#1a1028'); P(1, 1, 7, 7, '#2e2348');
    if (t === 'Corte') { for (let i = 0; i < 5; i++) P(2 + i, 6 - i, 1, 1, c); P(6, 2, 1, 1, '#fff'); }
    else if (t === 'Impacto') { P(3, 3, 3, 3, c); P(2, 4, 1, 1, c); P(6, 4, 1, 1, c); P(4, 2, 1, 1, c); P(4, 6, 1, 1, c); }
    else if (t === 'Luna') { P(3, 2, 3, 5, c); P(4, 2, 2, 4, '#2e2348'); P(2, 3, 1, 3, c); }
    else if (t === 'Agua') { P(4, 2, 1, 1, c); P(3, 3, 3, 2, c); P(2, 5, 5, 2, c); P(3, 5, 1, 1, '#fff'); }
    else if (t === 'Fuego') { P(4, 2, 1, 2, c); P(3, 4, 3, 2, c); P(2, 5, 5, 2, c); P(4, 5, 1, 2, '#ffe070'); }
    else { P(4, 2, 1, 5, c); P(2, 4, 5, 1, c); P(3, 3, 3, 3, c); P(4, 4, 1, 1, '#fff'); }
    TYPE_ICON[t] = o.c;
    return o.c;
  }
  TH.typeIcon = typeIcon;
  TH.typeIcon = typeIcon;

  class BattleScene extends TH.Scene {
    constructor() { super(); this.transparent = true; this._bound = false; }

    enter(d) {
      this.owner = d.owner;
      this.foe = d.foe;
      this.group = d.group || (d.foe && d.foe.group) || ['larva'];
      this.advantage = !!d.advantage; this.ambush = !d.advantage && !!d.ambush;
      this.snapshot = TH.party.dump();
      this.el = { root: $('bt'), party: $('btParty'), cmd: $('btCmd'), help: $('btHelp'), res: $('btRes') };
      if (!this._bound) this.bind();
      this.el.root.hidden = false;
      document.querySelector('.hud').style.visibility = 'hidden';
      $('btnMenu').style.visibility = 'hidden';
      this.setup(false);
    }
    exit() {
      this.el.root.hidden = true;
      this.el.party.style.visibility = '';
      this.el.res.hidden = true;
      this.el.cmd.hidden = true;
      TH.dialog.close();
      document.querySelector('.hud').style.visibility = '';
      $('btnMenu').style.visibility = '';
    }
    bind() {
      this._bound = true;
      $('game').addEventListener('pointerdown', (e) => { if (TH.scenes.top() === this) this.tap(e); });
      this.el.root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-bt]');
        if (!b || TH.scenes.top() !== this) return;
        this.click(b.dataset.bt, +b.dataset.i);
      });
    }

    // ---------- preparación ----------
    setup(retry) {
      const m = this.owner, map = m.map, leader = m.leader, foe = this.foe;
      this.t = 0; this.dt = 0; this.round = 0;
      this.seq = null; this.after = null; this.hitstop = 0; this.flashA = 0; this.dimA = retry ? 1 : 0;
      this.fx = []; this.nums = []; this.orbs = []; this.parts = [];
      this.ring = null; this.blockFx = null; this.summon = null; this.banner = null; this.darkA = 0;
      this.state = 'intro'; this.cursor = 0; this.menuIdx = 0; this.target = 0; this.pending = null;
      this.freeAction = this.advantage;
      this.combo = 0; this.lastHit = null;
      if (TH.gear) for (const id of m.members().slice(0, 3)) this.combo += TH.gear.fx(id).startCombo || 0;
      this.combo = Math.min(COMBO_MAX, this.combo);
      this.pendingPhase = null;
      this.recoverQ = [];
      TH.party.ecoState = {};
      this.el.res.hidden = true;
      this.isBoss = this.group.some((k) => TH.data.enemies[k].boss);
      // jefes muy altos (Madre, Vigía…) piden menos zoom y la cámara un poco más arriba para verse enteros
      const BD = this.isBoss && this.bossE ? this.bossE.D : (this.group && TH.data.enemies[this.group[0]]) || {};
      this.zoomT = this.isBoss ? (BD.zoom || ZOOM_BOSS) : ZOOM;
      const bn = document.getElementById('banner'); if (bn) bn.classList.remove('show');
      const fx = foe ? foe.x : leader.x + 40, fy = foe ? foe.y : leader.y;
      this.center = this.findCenter((leader.x + fx) / 2 - (this.isBoss ? 30 : 0), (leader.y + fy) / 2);
      const C = this.center;
      const ids = m.members();
      this.active = ids.slice(0, 3).map((id, i) => this.unit(id, i));
      this.reserve = ids[3] ? this.unit(ids[3], 3) : null;
      this.active.forEach((u, i) => {
        const src = m.party[m.order.indexOf(u.id)] || leader;
        u.x = retry ? C.x + PSLOT[i][0] : src.x; u.y = retry ? C.y + PSLOT[i][1] : src.y;
        u.homeX = C.x + PSLOT[i][0]; u.homeY = C.y + PSLOT[i][1];
      });
      if (this.reserve) { this.reserve.x = C.x - 90; this.reserve.y = C.y; this.reserve.hidden = true; }
      const slots = ESLOT[Math.min(3, this.group.length)];
      this.enemies = this.group.slice(0, 4).map((key, i) => {
        const bs = BOSS_SLOT[key] || BOSS_SLOT[key.replace(/_rev$/, '')], sl = bs || slots[i] || EPOS[i];
        const e = this.makeEnemy(key, C.x + sl[0], C.y + sl[1], i);
        if (!retry && foe && !bs) { e.x = foe.x; e.y = foe.y; }
        return e;
      });
      this.bossE = this.enemies.find((e) => e.D.boss) || null;
      if (TH.bestiary) for (const e of this.enemies) TH.bestiary.seen(e.key, map.def && map.def.name);
      for (const e of this.enemies) { this.decide(e, e.idx + (this.advantage ? 1 : 0)); e.planned = true; }
      for (const u of this.allUnits()) u.z = map.zAt(u.x, u.y);
      m.battle = this;
      for (const f of m.foes || []) if (f.alive && Math.hypot(f.x - C.x, f.y - C.y) < 140) f.hidden = true;
      this.camFrom = { x: TH.camera.x + W / 2, y: TH.camera.y + H / 2, z: m.zoom };
      this.camTo = { x: C.x - 6 + (this.isBoss ? 18 : 0), y: C.y - map.levelAt(C.x, C.y) * HZ - (this.isBoss ? 14 + (BD.camY || 0) : 12) };
      this.seq = this.introSeq(retry);
      this.drawParty();
      this.help(this.advantage ? '¡Ventaja! Tu primera acción no da tiempo a los enemigos.' : '');
      TH.sfx('encounter');
      TH.music.play(this.bossE ? this.bossE.D.phases[0].music : 'combate');
    }
    makeEnemy(key, x, y, idx) {
      const D = TH.data.enemies[key];
      const e = { side: 'enemy', key, D, sprite: D.sprite, name: D.name, hp: D.hp, maxhp: D.hp, dir: 'left', anim: 'idle', frame: 0, flash: 0, alpha: 1,
        pi: 0, stunned: false, defMul: 1, known: TH.bestiary ? TH.bestiary.known(key) : { w: [], r: [] }, buffT: 0, phase: idx * 1.3, dead: false, idx, cool: {}, decisions: 0, ai: D.ai || null, phaseIdx: 0, locks: [], lockMax: 0 };
      e.x = x; e.y = y; e.homeX = x; e.homeY = y;
      return e;
    }
    unit(id, slot) {
      const def = TH.chars.defs[id];
      const u = { side: 'party', id, def, slot, dir: 'right', anim: 'idle', frame: 0, dist: 0, state: 'walk', big: !!def.big, chains: null, acted: false, guard: false, charge: 0, phase: slot * 2.1, mode: 'auto' };
      TH.chars.initChains(u);
      return u;
    }
    allUnits() { return this.active.concat(this.reserve ? [this.reserve] : [], this.enemies); }
    alive() { return this.enemies.filter((e) => !e.dead); }
    findCenter(x0, y0) {
      const M = this.owner.map, big = this.isBoss;
      const ok = (cx, cy) => {
        const lv = M.levelPt(cx, cy);
        if (lv == null || lv % 1) return false;
        if (cx < 110 || cy < 80 || cx > M.pw - 110 || cy > M.ph - 50) return false;
        const pts = PSLOT.concat(ESLOT[3], [[-60, 6], [60, 6], [0, -22], [0, 30]], big ? [[66, -10], [90, -10], [40, -30], [40, 30], [100, 6]] : []);
        for (const [dx, dy] of pts) {
          const x = cx + dx, y = cy + dy;
          if (M.violation(x, y) !== 0 || M.solidAt(x, y) || M.levelPt(x, y) !== lv) return false;
        }
        return true;
      };
      for (let r = 0; r <= 128; r += 8) {
        for (let a = 0; a < 16; a++) {
          const x = x0 + Math.cos((a / 16) * Math.PI * 2) * r, y = y0 + Math.sin((a / 16) * Math.PI * 2) * r * 0.8;
          if (ok(x, y)) return { x: Math.round(x), y: Math.round(y) };
          if (r === 0) break;
        }
      }
      return { x: Math.round(x0), y: Math.round(y0) };
    }

    // ---------- IA: elige la acción de la ronda ----------
    cond(e, c) {
      let m;
      if (c.indexOf('&') >= 0) return c.split('&').every((x) => this.cond(e, x));
      if (c === 'noboss') return !this.bossE || this.bossE.dead;
      if ((m = /^self<([\d.]+)$/.exec(c))) return e.hp / e.maxhp < +m[1];
      if ((m = /^boss<([\d.]+)$/.exec(c))) { const b = this.bossE; return !!b && !b.dead && b.hp / b.maxhp < +m[1]; }
      if ((m = /^ally<([\d.]+)$/.exec(c))) return this.enemies.some((x) => !x.dead && x.hp / x.maxhp < +m[1]);
      if (c === 'cover') return !e.covering && this.enemies.some((x) => !x.dead && x !== e && !x.D.boss && !x.D.part && !this.enemies.some((g) => g.guarding === x));
      if (c === 'rally') return this.enemies.filter((x) => !x.dead && !x.D.boss).length > 1 && !this.enemies.some((x) => !x.dead && x.atkT > 0);
      if ((m = /^adds<(\d+)$/.exec(c))) return this.enemies.filter((x) => !x.dead && !x.D.boss && !x.D.part).length < +m[1];
      return true;
    }
    decide(e, extra) {
      let id;
      if (e.ai) {
        e.decisions++;
        for (const r of e.ai) {
          if (r.cooldown && (e.cool[r.act] || 0) > 0) continue;
          if (r.rest && e.decisions - ((e.lastAt || {})[r.act] || -99) <= r.rest) continue;
          if (r.every && e.decisions % r.every !== 0) continue;
          if (r.if && !this.cond(e, r.if)) continue;
          id = r.act;
          if (r.rest) (e.lastAt || (e.lastAt = {}))[r.act] = e.decisions;
          for (const k in e.cool) if (e.cool[k] > 0) e.cool[k]--;
          if (r.cooldown) e.cool[r.act] = r.cooldown;
          break;
        }
      }
      if (!id) { const pat = e.D.pattern || Object.keys(e.D.actions); id = pat[e.pi % pat.length]; e.pi++; }
      const act = e.D.actions[id];
      e.act = act; e.actId = id;
      e.locks = []; e.lockMax = 0;
      void extra;
    }
    pickTarget(act) {
      const alive = this.active.filter((u) => !u.ko);
      if (!alive.length) return null;
      if (act.pick === 'weakest') {
        // el más débil: menos vida en proporción (con un poco de azar para no ser predecible)
        if (Math.random() < 0.8) return alive.slice().sort((a, b) => this.hpRatio(a) - this.hpRatio(b))[0];
      }
      return alive[(Math.random() * alive.length) | 0];
    }
    hpRatio(u) { const mm = TH.party.members[u.id]; return mm.hp / TH.party.stats(u.id).hp; }

    // ---------- bucle ----------
    update(dt) {
      const m = this.owner;
      this.t += dt; this.dt = dt;
      m.tick(dt, false);
      if (this.hitstop > 0) { this.hitstop -= dt; this.animate(0); if (this._dirty) this._drawParty(); return; }
      if (this.seq) {
        const r = this.seq.next();
        if (r.done) { this.seq = null; if (this.after) { const f = this.after; this.after = null; f(); } }
      } else this.input();
      this.animate(dt);
      if (this._dirty) this._drawParty();
    }
    animate(dt) {
      const m = this.owner;
      for (const u of this.active.concat(this.reserve ? [this.reserve] : [])) {
        const mm = TH.party.members[u.id];
        u.ko = mm.hp <= 0;
        if (u.hurtT > 0) { u.hurtT -= dt; if (u.hurtT <= 0 && u.mode === 'pose' && u.anim === 'hurt') u.mode = 'auto'; }
        if (u.mode === 'auto') {
          if (u.ko) { u.anim = 'ko'; u.frame = 0; }
          else if (u.moving) { u.anim = 'run'; u.frame = Math.floor(u.dist / 5.5) % 8; }
          else if (u.guard) { u.anim = 'guard'; u.frame = Math.floor(this.t * 2) % 2; }
          else if (this.state === 'victory') { u.anim = 'win'; u.frame = Math.floor(this.t * 3) % 2; }
          else { u.anim = 'idle'; u.frame = Math.floor(this.t * 3 + u.phase) % 8; }
        }
        u.z = m.map.zAt(u.x, u.y);
        u.sy = u.y - u.z * HZ - (u.arc || 0);
        u.shadowY = u.y - u.z * HZ;
        if (dt > 0) TH.chars.updateChains(u, dt, m.wind);
      }
      for (const e of this.enemies) {
        if (e.hurtT > 0) { e.hurtT -= dt; if (e.hurtT <= 0 && e.anim === 'hurt' && !e.dead) e.mode = 'idle'; }
        if (e.mode !== 'seq') { e.anim = 'idle'; e.frame = Math.floor(this.t * (e.stunned ? 2 : 5) + e.phase) % 4; }
        e.z = m.map.zAt(e.x, e.y);
        e.flyOff = e.D.flying ? 10 + Math.sin(this.t * 3 + e.phase) * 2 : 0;
        e.sy = e.y - e.z * HZ - (e.arc || 0);
        e.shadowY = e.y - e.z * HZ;
        if (e.flash > 0) e.flash -= dt;
        e.shakeX = e.shakeT > 0 ? ((e.shakeT * 60) % 2 > 1 ? 1 : -1) : 0;
        if (e.shakeT > 0) e.shakeT -= dt;
      }
      for (const o of this.orbs) { o.t += dt; o.x += (o.tx - o.x) * Math.min(1, dt * 4); o.y += (o.ty - o.y) * Math.min(1, dt * 4); }
      for (let i = this.fx.length - 1; i >= 0; i--) { this.fx[i].t += dt; if (this.fx[i].t >= this.fx[i].dur) this.fx.splice(i, 1); }
      for (let i = this.nums.length - 1; i >= 0; i--) { this.nums[i].t += dt; if (this.nums[i].t >= this.nums[i].dur) this.nums.splice(i, 1); }
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
        if (p.t >= p.dur) this.parts.splice(i, 1);
      }
      if (this.flashA > 0) this.flashA = Math.max(0, this.flashA - dt * 4);
      if (this.shakeT > 0) { this.shakeT -= dt; m.shake = this.shakeT > 0 ? this.shakeAmp : 0; }
      if (this.banner) { this.banner.t += dt; if (this.banner.t > this.banner.dur) this.banner = null; }
      if (this.summon) this.summon.t += dt;
      const target = this.state === 'outro' ? 0 : 1;
      this.dimA += (target - this.dimA) * Math.min(1, dt * 5);
    }

    // ---------- utilidades de secuencias (generadores, avanzan un fotograma por yield) ----------
    *wait(t) { let k = 0; while (k < t) { k += this.dt; yield; } }
    *moveTo(u, x, y, dur, keep) {
      const x0 = u.x, y0 = u.y;
      let k = 0;
      if (!keep) { u.mode = 'auto'; u.moving = true; }
      while (k < dur) {
        k += this.dt;
        const e = U.smooth(Math.min(1, k / dur));
        const nx = U.lerp(x0, x, e), ny = U.lerp(y0, y, e);
        u.dist = (u.dist || 0) + Math.hypot(nx - u.x, ny - u.y);
        u.x = nx; u.y = ny;
        yield;
      }
      u.x = x; u.y = y; u.moving = false;
    }
    *hop(u, x, y, dur, h) {
      const x0 = u.x, y0 = u.y;
      let k = 0;
      while (k < dur) { k += this.dt; const e = Math.min(1, k / dur); u.x = U.lerp(x0, x, e); u.y = U.lerp(y0, y, e); u.arc = Math.sin(Math.PI * e) * h; yield; }
      u.x = x; u.y = y; u.arc = 0;
    }
    // varios generadores a la vez
    *all(gens) { const done = gens.map(() => false); while (done.some((d) => !d)) { gens.forEach((g, i) => { if (!done[i]) done[i] = g.next().done; }); yield; } }
    pose(u, anim, frame) { u.mode = u.side === 'enemy' ? 'seq' : 'pose'; u.anim = anim; u.frame = frame; }
    free(u) { u.mode = u.side === 'enemy' ? 'idle' : 'auto'; }
    *dialogSeq(lines) {
      const D = TH.dialog, I = TH.input;
      this.el.cmd.hidden = true;
      this.el.party.style.visibility = 'hidden';
      this.help('');
      for (const l of lines) {
        D.open({ name: l.name, t: l.t });
        while (true) {
          D.update(this.dt, false);
          if (I.pressed('a')) { if (!D.complete) D.finishLine(); else break; }
          yield;
        }
      }
      D.close();
      document.getElementById('talk').hidden = true;
      this.el.party.style.visibility = '';
    }

    // ---------- intro ----------
    *introSeq(retry) {
      const m = this.owner, cam = TH.camera, A = this.camFrom, B = this.camTo;
      const moves = [];
      if (!retry) {
        for (const u of this.active) moves.push(this.moveTo(u, u.homeX, u.homeY, 0.45));
        for (const e of this.enemies) moves.push(this.moveTo(e, e.homeX, e.homeY, 0.45, true));
      } else for (const u of this.allUnits()) { u.x = u.homeX; u.y = u.homeY; }
      let k = 0;
      const dur = retry ? 0.01 : 0.5;
      while (k < dur || moves.some((g) => !g.done)) {
        k += this.dt;
        const e = U.smooth(Math.min(1, k / dur));
        cam.snapTo(U.lerp(A.x, B.x, e), U.lerp(A.y, B.y, e));
        m.camLock = { x: B.x, y: B.y };
        m.zoom = U.lerp(A.z, this.zoomT, e); cam.zoom = m.zoom;
        for (const g of moves) if (!g.done && g.next().done) g.done = true;
        if (k > 3) break;
        yield;
      }
      for (const u of this.active) { u.moving = false; u.dir = 'right'; }
      if (this.bossE && !retry) {
        const b = this.bossE;
        this.bannerOn(b.D.name, b.D.title, 2.2);
        this.shake(2, 0.5);
        yield* this.wait(0.6);
        yield* this.dialogSeq(b.D.phases[0].dialog || []);
      }
      if (this.advantage && !retry) { this.text(this.center.x, this.center.y - 40, '¡VENTAJA!', '#ffe070', 2, 1.1); yield* this.wait(0.5); }
      if (this.foe && this.foe.tips && !retry) for (const k of [].concat(this.foe.tips)) yield* this.tip(k);
      if (this.ambush && !retry) {
        // emboscada: los enemigos actúan antes de que el grupo pueda dar órdenes
        this.text(this.center.x, this.center.y - 40, '¡EMBOSCADA!', '#ff8a7a', 2, 1.1); yield* this.wait(0.6);
        this.round = 0; this.plan = []; this.execRound(); return;
      }
      this.startRound();
    }

    // ---------- rondas ----------
    startRound() {
      this.round++;
      for (const u of this.active) u.acted = false;
      // tras una invocación, los Ecos vuelven de uno en uno
      if (this.recoverQ.length) {
        const id = this.recoverQ.shift();
        delete TH.party.ecoState[id];
        this.text(this.center.x - 40, this.center.y - 46, 'ECO LISTO', '#ffe8a0', 1, 0.9);
      }
      for (const e of this.enemies) if (!e.dead && e.buffT > 0 && --e.buffT === 0) e.defMul = 1;
      for (const e of this.enemies) if (!e.dead && e.atkT > 0 && --e.atkT === 0) e.atkMul = 1;
      // los enemigos deciden al empezar la ronda: su intención se ve mientras das órdenes
      if (this.round > 1) for (const e of this.enemies) if (!e.dead && !e.stunned && !e.charging) { this.decide(e, 0); e.planned = true; }
      if (TH.gear && this.round > 1) for (const u of this.active) {
        const fx = TH.gear.fx(u.id), mm = TH.party.members[u.id], st = TH.party.stats(u.id);
        if (mm.hp <= 0) continue;
        if (fx.regen) { const a = Math.max(1, Math.round(st.hp * fx.regen)); if (mm.hp < st.hp) { mm.hp = Math.min(st.hp, mm.hp + a); this.num(u.x, u.sy - 30, a, '#8ef0a0', 1); } }
        if (fx.mpRegen) mm.mp = Math.min(st.mp, mm.mp + fx.mpRegen);
      }
      for (const u of this.active) { u.guard = false; const mm = TH.party.members[u.id]; if (mm.hp > 0 && this.round > 1) mm.mp = Math.min(TH.party.stats(u.id).mp, mm.mp + 2); }
      this.plan = [];
      if (this.round > 1) { this.state = 'act'; this.seq = this.shuffleSeq(); this.after = () => this.toSelect(); return; }
      this.toSelect();
    }
    // ejecuta la ronda: todas las órdenes del grupo y una acción por enemigo, de más rápido a más lento
    execRound() {
      const P = TH.party, q = [];
      for (const pl of this.plan) {
        if (pl.a.kind === 'guard') { pl.u.guard = true; this.text(pl.u.x, pl.u.sy - 44, 'DEFENSA', '#9fd8ff', 1, 0.7); continue; }
        q.push({ u: pl.u, a: pl.a, spd: P.stats(pl.u.id).spd + Math.random() * 4 + (pl.a.kind === 'item' ? 2 : 0) });
      }
      if (!(this.advantage && this.round === 1)) for (const e of this.enemies) {
        if (e.dead) continue;
        const spd = (e.D.spd || 5) + Math.random() * 4;
        if (e.stunned) { q.push({ e, recover: true, spd }); continue; }
        if (e.charging) {
          // los ataques largos cargan varias rondas: mientras quede cuenta atrás, solo concentra la marea
          if (e.charging.left > 1) { e.charging.left--; q.push({ e, hold: true, spd }); continue; }
          e.act = e.charging.act; e.actId = e.charging.id; q.push({ e, unleash: true, spd }); continue;
        }
        if (!e.planned) this.decide(e, 0);
        e.planned = false;
        q.push({ e, act: e.act, actId: e.actId, spd });
      }
      q.sort((a, b) => b.spd - a.spd);
      this.queue = q;
      this.el.cmd.hidden = true;
      this.help('');
      this.drawParty();
      this.nextAction();
    }
    nextAction() {
      if (this.checkEnd()) return;
      if (this.pendingPhase) { this.runPhase(() => this.nextAction()); return; }
      const it = this.queue.shift();
      if (!it) { this.startRound(); return; }
      this.state = 'act';
      if (it.e) {
        const e = it.e;
        if (e.dead) { this.nextAction(); return; }
        // aturdido: pierde su turno y se recupera
        if (it.recover || e.stunned) {
          e.stunned = false;
          this.text(e.x, e.sy - 50, 'SE RECUPERA', '#c8c0d8', 1, 0.6);
          this.state = 'act'; this.seq = this.wait(0.45); this.after = () => { this.drawParty(); this.nextAction(); };
          return;
        }
        if (it.hold) {
          this.text(e.x, e.sy - (e.D.boss ? 70 : 56), 'CONCENTRA LA MAREA…', '#ffd070', 1, 0.8);
          this.burst(e.x, e.sy - 20, '#ffd070', 8);
          this.state = 'act'; this.seq = this.wait(0.5); this.after = () => { this.drawParty(); this.nextAction(); };
          return;
        }
        // empieza a cargar un ataque sellado: lo lanzará en su próximo turno si los sellos siguen en pie
        if (it.begin) {
          // si una fase nueva le cambió la acción, carga la que había elegido
          if (it.act && it.act.seals) { e.act = it.act; e.actId = it.actId; }
          this.state = 'act';
          this.seq = this.chargeSeq(e);
          this.after = () => { this.drawParty(); this.nextAction(); };
          return;
        }
        this.state = 'enemy';
        this.seq = this.enemySeq(e);
        this.after = () => { if (it.unleash) e.charging = null; this.drawParty(); this.nextAction(); };
        return;
      }
      const u = it.u, a = it.a;
      if (u.ko || this.active.indexOf(u) < 0) { this.nextAction(); return; }
      // si el objetivo ya cayó, pasa al siguiente enemigo vivo
      if (a.target && a.target.side === 'enemy' && a.target.dead) a.target = this.alive()[0];
      if (a.kind === 'combo' && (this.combo < a.combo.cost * 100 || !this.combosFor(u).includes(a.combo))) { this.text(u.x, u.sy - 44, 'SIN CARGA', '#c8c0d8', 1, 0.7); this.nextAction(); return; }
      if (a.kind === 'summon' && this.standby().length < a.summon.need) { this.text(u.x, u.sy - 44, 'SIN ECOS', '#c8c0d8', 1, 0.7); this.nextAction(); return; }
      if (a.kind === 'skill' && TH.party.members[u.id].mp < a.skill.mp) { this.text(u.x, u.sy - 44, 'SIN PM', '#c8c0d8', 1, 0.7); this.nextAction(); return; }
      if (a.kind === 'item' && !TH.party.count(a.item)) { this.nextAction(); return; }
      this.sel = u;
      this.drawParty();
      this.seq = this.partySeq(u, a);
      this.after = () => { this.free(u); this.drawParty(); this.nextAction(); };
    }
    // los enemigos se recolocan entre rondas y tienden a agruparse
    *shuffleSeq() {
      const C = this.center, moves = [];
      const free = (x, y, self) => this.enemies.every((o) => o === self || o.dead || Math.hypot(o.homeX - x, o.homeY - y) > 15);
      for (const e of this.enemies) {
        if (e.dead || e.stunned || e.D.boss || e.guarding || Math.random() > 0.45) continue;
        if (e.D.part) { if (e.x !== e.homeX || e.y !== e.homeY) moves.push(this.moveTo(e, e.homeX, e.homeY, 0.3, true)); continue; }
        const others = this.alive().filter((o) => o !== e);
        const cx = others.length ? others.reduce((s, o) => s + o.homeX, 0) / others.length : C.x + 40;
        const cy = others.length ? others.reduce((s, o) => s + o.homeY, 0) / others.length : C.y;
        let best = null, bd = 1e9;
        for (const [dx, dy] of (this.bossE ? BOSS_ADDS : EPOS)) {
          const x = C.x + dx, y = C.y + dy;
          if (!free(x, y, e)) continue;
          const d = Math.hypot(x - cx, y - cy) + Math.random() * 10;
          if (d < bd) { bd = d; best = [x, y]; }
        }
        if (best) { e.homeX = best[0]; e.homeY = best[1]; moves.push(this.moveTo(e, best[0], best[1], 0.35, true)); }
      }
      if (moves.length) yield* this.all(moves);
    }
    candidates() { return this.active.filter((u) => !u.ko && !this.plan.some((p) => p.u === u)); }
    // siguiente miembro sin orden; si ya están todos, empieza la ronda
    toSelect() {
      if (this.checkEnd()) return;
      const c = this.candidates();
      if (!c.length) { this.execRound(); return; }
      this.openCommand(c[0]);
    }

    // ---------- menús ----------
    input() {
      const I = TH.input, st = this.state;
      if (st === 'select') {
        const c = this.candidates();
        if (I.pressed('left') || I.pressed('up')) { this.cursor = (this.cursor + c.length - 1) % c.length; this.drawParty(); }
        if (I.pressed('right') || I.pressed('down')) { this.cursor = (this.cursor + 1) % c.length; this.drawParty(); }
        if (I.pressed('a')) this.openCommand(c[this.cursor]);
        return;
      }
      if (st === 'command' || st === 'skills' || st === 'items' || st === 'combos' || st === 'ecos' || st === 'summons') {
        const list = this.menu;
        if (I.pressed('up')) { this.menuIdx = (this.menuIdx + list.length - 1) % list.length; this.drawCmd(); }
        if (I.pressed('down')) { this.menuIdx = (this.menuIdx + 1) % list.length; this.drawCmd(); }

        if (I.pressed('a')) this.pick(this.menuIdx);
        if (I.pressed('b')) this.back();
        return;
      }
      if (st === 'target' || st === 'ally') {
        const L = this.targets();
        if (I.pressed('left') || I.pressed('up')) this.target = (this.target + L.length - 1) % L.length;
        if (I.pressed('right') || I.pressed('down')) this.target = (this.target + 1) % L.length;
        if (I.pressed('a')) this.confirm();
        if (I.pressed('b')) this.back();
        return;
      }
      if (st === 'victory' && I.pressed('a')) this.finish();
      if (st === 'defeat' && I.pressed('a')) this.retry();
      else if (st === 'defeat' && I.pressed('b') && this.canHome) this.home();
    }
    combosFor(u) {
      const ids = this.active.filter((x) => !x.ko).map((x) => x.id);
      return TH.data.combos.filter((c) => c.who.indexOf(u.id) >= 0 && c.who.every((w) => ids.indexOf(w) >= 0));
    }
    standby() { return Object.keys(TH.party.ecoState).filter((k) => TH.party.ecoState[k] === 'standby'); }
    openCommand(u) {
      this.sel = u;
      this.state = 'command';
      this.menuIdx = 0;
      const mm = TH.party.members[u.id], combos = this.combosFor(u), sb = this.standby().length;
      this.menu = [
        { label: 'Atacar', act: 'attack', note: TH.data.basic[u.id].join(' · ') },
        { label: 'Técnicas', act: 'skills' },
      ];
      if (combos.length) this.menu.push({ label: 'Combos', act: 'combos', note: Math.floor(this.combo / 100) + ' ●' });
      if (mm.ecos.length) this.menu.push({ label: 'Ecos', act: 'ecos', note: mm.ecos.filter((e) => !TH.party.ecoState[e]).length + ' listos' });
      if (sb >= 2) this.menu.push({ label: 'Invocar', act: 'summons', note: sb + ' en espera' });
      this.menu.push({ label: 'Defender', act: 'guard', note: 'mitad de daño' }, { label: 'Objetos', act: 'items' });
      if (this.reserve && TH.party.members[this.reserve.id].hp > 0) this.menu.push({ label: 'Cambiar por ' + this.reserve.def.name, act: 'swap', note: 'no gasta turno' });
      this.drawCmd();
      this.drawParty();
      const ch = this.enemies.find((x) => !x.dead && x.charging);
      if (ch) this.help('¡' + ch.D.name + ' prepara ' + ch.charging.act.name + (ch.charging.left > 1 ? ' (' + ch.charging.left + ' rondas)' : ' (esta ronda)') + '! Rompe sus sellos: ' + ch.charging.seals.filter((x) => x.on).map((x) => x.t).join(' · '));
      else this.help(this.plan.length ? 'A elegir · B corregir la orden anterior' : 'Elige la orden de ' + u.def.name + ' · A elegir');
    }
    pick(i) {
      const it = this.menu[i];
      if (!it || it.disabled) return;
      const u = this.sel, P = TH.party;
      if (this.state === 'command') {
        if (it.act === 'attack') { this.pending = { kind: 'attack', area: 'one' }; this.toTarget('target'); }
        else if (it.act === 'skills') {
          this.state = 'skills'; this.menuIdx = 0;
          const mp = P.members[u.id].mp;
          this.menu = (TH.data.skills[u.id] || []).filter((s) => !s.req || TH.flags.get(s.req)).map((s) => ({ label: s.name, skill: s, note: s.mp + ' PM · ' + TH.data.AREA_ES[s.area], types: s.types, disabled: mp < s.mp }));
          this.drawCmd();
        } else if (it.act === 'combos') {
          this.state = 'combos'; this.menuIdx = 0;
          this.menu = this.combosFor(u).map((c) => ({ label: c.name, combo: c, note: '●'.repeat(c.cost) + ' · ' + c.who.map((w) => TH.chars.defs[w].name[0]).join('+'), types: c.types, disabled: this.combo < c.cost * 100 }));
          this.drawCmd();
        } else if (it.act === 'ecos') {
          this.state = 'ecos'; this.menuIdx = 0;
          this.menu = P.members[u.id].ecos.map((id) => { const ec = TH.data.ecos[id], st = P.ecoState[id]; return { label: ec.release.name, eco: id, note: st ? (st === 'standby' ? 'en espera' : 'volviendo') : ec.name, types: ec.release.types, disabled: !!st }; });
          this.drawCmd();
        } else if (it.act === 'summons') {
          this.state = 'summons'; this.menuIdx = 0;
          const n = this.standby().length;
          this.menu = TH.data.summons.map((s) => ({ label: s.name, summon: s, note: s.need + ' Ecos', types: s.types, disabled: n < s.need }));
          this.drawCmd();
        } else if (it.act === 'guard') this.doAction({ kind: 'guard' });
        else if (it.act === 'items') {
          this.state = 'items'; this.menuIdx = 0;
          const inv = P.inv;
          this.menu = Object.keys(inv).filter((k) => TH.data.items[k].use).map((k) => ({ label: TH.data.items[k].name, item: k, note: '×' + inv[k] }));
          if (!this.menu.length) this.menu = [{ label: 'No llevas consumibles', disabled: true }];
          this.drawCmd();
        } else if (it.act === 'swap') this.doSwap();
        return;
      }
      let a = null;
      if (this.state === 'skills') a = { kind: 'skill', skill: it.skill, area: it.skill.area };
      else if (this.state === 'combos') a = { kind: 'combo', combo: it.combo, area: it.combo.area };
      else if (this.state === 'ecos') a = { kind: 'eco', eco: it.eco, area: TH.data.ecos[it.eco].release.area };
      else if (this.state === 'summons') a = { kind: 'summon', summon: it.summon, area: 'all' };
      else if (this.state === 'items') { if (!it.item) return; this.pending = { kind: 'item', item: it.item, area: 'ally' }; this.toTarget('ally'); return; }
      if (!a) return;
      this.pending = a;
      if (a.area === 'allies' || a.area === 'all') { a.target = this.alive()[0]; if (a.area === 'all') { this.toTarget('target'); return; } this.doAction(a); }
      else this.toTarget('target');
    }
    back() {
      if (this.state === 'command') { const last = this.plan.pop(); if (last) this.openCommand(last.u); }
      else this.openCommand(this.sel);
    }
    toTarget(kind) {
      this.state = kind;
      const L = this.targets();
      this.target = kind === 'ally' ? Math.max(0, L.indexOf(this.sel)) : Math.min(this.target, L.length - 1);
      if (this.target < 0) this.target = 0;
      this.el.cmd.hidden = true;
      const ar = this.pending && this.pending.area;
      this.help(kind === 'ally' ? 'Elige a quién · A confirmar · B volver' : 'Objetivo (' + (TH.data.AREA_ES[ar] || 'un objetivo') + ') · A confirmar · B volver');
    }
    targets() { return this.state === 'ally' ? this.active.filter((u) => !u.ko) : this.alive(); }
    // a quién alcanza un área desde quien la lanza
    areaHits(u, t, area, r) {
      const L = this.alive();
      if (!t) return [];
      if (area === 'all' || area === 'allies') return L;
      if (area === 'one') return [t];
      const ox = u.homeX + 6, oy = u.homeY, dx = t.x - ox, dy = t.y - oy, d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d;
      return L.filter((e) => {
        const big = e.D.boss ? 16 : e.D.part ? 6 : 0;
        const ex = e.x - ox, ey = e.y - oy;
        if (area === 'line') { const pr = ex * nx + ey * ny, pe = Math.abs(ex * ny - ey * nx); return pr > 0 && pe < 11 + big; }
        if (area === 'cone') { const pr = ex * nx + ey * ny; if (pr <= 0) return false; return Math.acos(Math.min(1, pr / (Math.hypot(ex, ey) || 1))) < 0.42 + big / 60; }
        if (area === 'circle') return Math.hypot(e.x - t.x, e.y - t.y) < (r || 26) + big;
        return e === t;
      });
    }
    confirm() {
      const L = this.targets(), t = L[this.target];
      if (!t) return;
      this.pending.target = t;
      this.doAction(this.pending);
    }
    absorb() {
      const u = this.sel;
      if (!u || !this.orbs.length) { TH.ui.toast('No hay orbes de luz'); return; }
      if (u.charge >= CHARGE_MAX) { TH.ui.toast('Ya está cargado al máximo'); return; }
      const o = this.orbs.pop();
      u.charge++;
      for (let i = 0; i < 8; i++) this.spark(o.x, o.y, '#ffe8a0', (u.x - o.x) * 2.5 + (Math.random() - 0.5) * 40, (u.y - 20 - o.y) * 2.5 + (Math.random() - 0.5) * 40, 0.35, 0);
      this.fx.push({ kind: 'glow', u, t: 0, dur: 0.4 });
      this.drawCmd(); this.drawParty();
    }
    gainCombo(n) {
      const before = Math.floor(this.combo / 100);
      this.combo = Math.min(COMBO_MAX, this.combo + n);
      if (Math.floor(this.combo / 100) > before) this.text(this.center.x - 50, this.center.y - 52, 'COMBO ' + '●'.repeat(Math.floor(this.combo / 100)), '#7fe6ff', 1, 0.9);
      this.drawParty();
    }

    // ---------- toques ----------
    tap(e) {
      const st = this.state;
      if (this.seq || st === 'victory' || st === 'defeat' || st === 'command' || st === 'skills' || st === 'items' || st === 'combos' || st === 'ecos' || st === 'summons') {
        if (this.seq) TH.input.edge.add('a');
        return;
      }
      const r = TH.renderer.canvas.getBoundingClientRect();
      const sx = ((e.clientX - r.left) / r.width) * W, sy = ((e.clientY - r.top) / r.height) * H;
      const cam = TH.camera, z = this.owner.zoom;
      const wx = (sx - W / 2) / z + cam.rx + W / 2, wy = (sy - H / 2) / z + cam.ry + H / 2;
      const pickNear = (list) => { let best = -1, bd = 30; list.forEach((u, i) => { const d = Math.hypot(u.x - wx, u.sy - (u.D && u.D.boss ? 26 : 14) - wy); if (d < bd) { bd = d; best = i; } }); return best; };
      if (st === 'select') { const c = this.candidates(), i = pickNear(c); if (i >= 0) { this.cursor = i; this.openCommand(c[i]); } return; }
      if (st === 'target' || st === 'ally') { const L = this.targets(), i = pickNear(L); if (i >= 0) { if (i === this.target) this.confirm(); else this.target = i; } }
    }
    click(act, i) {
      if (act === 'cmd') { this.menuIdx = i; this.pick(i); }
      else if (act === 'absorb') this.absorb();
      else if (act === 'back') this.back();
      else if (act === 'unit') {
        const c = this.candidates(), u = this.active[i], k = c.indexOf(u);
        if (this.state === 'select' && k >= 0) { this.cursor = k; this.openCommand(u); }
        else if (this.state === 'ally') { const L = this.targets(), j = L.indexOf(u); if (j >= 0) { if (j === this.target) this.confirm(); else this.target = j; } }
      } else if (act === 'continue') { if (this.state === 'victory') this.finish(); }
      else if (act === 'retry') this.retry();
      else if (act === 'home') this.home();
      else if (act === 'load') { const snap = this.snapshot; this.close(true); const m = TH.scenes.registry.map; if (!m.loadGame()) { TH.party.load(snap); TH.ui.toast('No hay partida guardada: el grupo se recupera'); } }
    }

    // ---------- acciones del grupo ----------
    // guarda la orden y pasa al siguiente miembro
    doAction(a) {
      this.plan.push({ u: this.sel, a });
      this.el.cmd.hidden = true;
      this.toSelect();
    }
    *partySeq(u, a) {
      const P = TH.party;
      if (a.kind === 'guard') {
        u.guard = true; this.free(u);
        this.text(u.x, u.sy - 44, 'DEFENSA', '#9fd8ff', 1, 0.7);
        yield* this.wait(0.45);
        return;
      }
      if (a.kind === 'item') {
        this.pose(u, 'cast', 0);
        yield* this.wait(0.2);
        const r = P.use(a.item, a.target.id);
        if (r && r !== 'No le hace falta') this.healNum(a.target, r);
        else this.text(a.target.x, a.target.sy - 44, 'SIN EFECTO', '#c8c0d8', 1, 0.7);
        yield* this.wait(0.45);
        this.free(u);
        return;
      }
      if (a.kind === 'combo') { yield* TH.battleFx.combo(this, u, a.combo, a.target); this.free(u); return; }
      if (a.kind === 'summon') { yield* TH.battleFx.summon(this, u, a.summon); this.free(u); return; }
      let s = a.kind === 'skill' ? a.skill : null;
      if (a.kind === 'eco') {
        s = Object.assign({ eco: a.eco }, TH.data.ecos[a.eco].release);
        P.ecoState[a.eco] = 'standby';
        this.bannerOn(s.name, TH.data.ecos[a.eco].name, 1.2);
        this.fx.push({ kind: 'ecoRise', x: u.x, y: u.sy - 20, c: TH.data.ecos[a.eco].color, t: 0, dur: 0.8 });
      }
      if (s && s.mp) { P.members[u.id].mp -= s.mp; this.drawParty(); }
      let types = ((s && s.types) || TH.data.basic[u.id]).slice();
      const gfx = (TH.gear ? TH.gear.fx(u.id) : {});
      if (!s && gfx.addType && !types.includes(gfx.addType)) types.push(gfx.addType);
      const kind = s ? s.kind : 'phys';
      let power = s ? s.power : 1;
      // arma épica: al atacar, a veces el arma desata su poder
      const wid = P.members[u.id].equip.weapon, un = !s && wid && TH.data.items[wid] && TH.data.items[wid].unleash;
      const epic = un && Math.random() < 0.3;
      if (epic) { power = un.power; types = un.types.slice(); this.bannerOn(un.name, TH.data.items[wid].name, 1.1); }

      if (kind === 'heal') {
        this.pose(u, 'cast', 0);
        const ring = yield* this.ringOn(u.x, u.sy - 16, () => this.pose(u, 'cast', 1));
        const k = ring === 'perfect' ? 1.3 : 1; TH.sfx('heal');
        for (const t of this.active) if (!t.ko) {
          const st = P.stats(u.id), max = P.stats(t.id).hp;
          const amt = s.eco ? Math.round(max * s.power * k) : Math.round(st.mag * s.power * k * (0.9 + Math.random() * 0.2));
          const mm = P.members[t.id], before = mm.hp;
          mm.hp = Math.min(max, mm.hp + amt);
          if (s.shield) t.shield = true;
          this.num(t.x, t.sy - 30, mm.hp - before, '#8ef0a0');
          this.burst(t.x, t.sy - 14, '#8ef0c8', 10);
        }
        this.drawParty();
        yield* this.wait(0.4);
        this.free(u);
        return;
      }
      const T = a.target && !a.target.dead ? a.target : this.alive()[0];
      if (!T) return;
      const foes = this.areaHits(u, T, s ? s.area : 'one', s && s.r);
      if (!foes.length) foes.push(T);
      const single = !s || s.area === 'one';
      if (kind === 'phys') {
        const tx = single ? T.x - (T.D.boss ? 34 : 20) : U.lerp(u.homeX, T.x, 0.55), ty = single ? T.y + 1 : U.lerp(u.homeY, T.y, 0.55);
        yield* this.moveTo(u, tx, ty, 0.22);
        this.pose(u, 'attack', 0);
        const fx = T.x, fy = T.sy - (T.D.boss ? 26 : 14);
        if (s && s.area !== 'one') this.fx.push({ kind: 'area', area: s.area, u, T, r: s.r, t: 0, dur: 0.5 });
        const ring = yield* this.ringOn(fx, fy, () => { this.pose(u, 'attack', 1); this.lunge(u); });
        if (epic) { this.fx.push({ kind: 'cross', x: fx, y: fy, t: 0, dur: 0.5 }, { kind: 'shockwave', x: T.x, y: T.y, r: 50, t: 0, dur: 0.5, c: TH.data.TYPE_COLOR[types[0]] }); this.flashA = 0.5; }
        for (const e of foes) this.hit(u, e, kind, power, types, { slash: true, single, big: epic, eco: !!(s && s.eco) });
        if (ring === 'perfect') { TH.sfx('perfect');
          this.text(fx, fy - 30, '¡PERFECTO!', '#ffe070', 1, 0.8);
          yield* this.wait(0.14);
          this.pose(u, 'attack', 0);
          yield* this.wait(0.07);
          this.pose(u, 'attack', 1); this.lunge(u);
          for (const e of foes) if (!e.dead) this.hit(u, e, kind, power * (gfx.ringDouble ? 1 : s ? 0.35 : 0.5), types, { slash: true, orbs: !s, extra: !gfx.ringDouble, single });
          if (gfx.ringDouble) this.text(fx, fy - 40, '¡DOBLE!', '#ffe070', 1, 0.7);
        }
        if (s && s.gather) yield* this.gatherSeq(foes, T);
        this.pose(u, 'attack', 2);
        yield* this.wait(0.2);
        yield* this.hop(u, u.homeX, u.homeY, 0.26, 8);
      } else {
        this.pose(u, 'cast', 0);
        const fx = T.x, fy = T.sy - (T.D.boss ? 26 : 14);
        if (s && s.area !== 'one') this.fx.push({ kind: 'area', area: s.area, u, T, r: s.r, t: 0, dur: 0.6 });
        const ring = yield* this.ringOn(fx, fy, () => this.pose(u, 'cast', 1));
        for (const e of foes) {
          this.bolt(u, e, types[0]);
          this.hit(u, e, kind, power * (ring === 'perfect' ? 1.3 : 1), types, { magic: true, single, anyLock: s && s.anyLock, eco: !!(s && s.eco) });
        }
        if (ring === 'perfect') { TH.sfx('perfect'); this.text(fx, fy - 30, '¡PERFECTO!', '#ffe070', 1, 0.8); }
        if (ring === 'perfect' && gfx.ringDouble) { yield* this.wait(0.2); for (const e of foes) if (!e.dead) { this.bolt(u, e, types[0]); this.hit(u, e, kind, power * 0.6, types, { magic: true, single, extra: true }); } this.text(fx, fy - 40, '¡DOBLE!', '#ffe070', 1, 0.7); }
        yield* this.wait(0.45);
      }
      if (s && s.eco) this.text(u.x, u.sy - 50, 'ECO EN ESPERA', '#ffe8a0', 1, 0.9);
      this.free(u);
    }
    // el viento de Firion empuja a los alcanzados y los junta alrededor del objetivo
    *gatherSeq(foes, T) {
      const anchor = T.D.boss ? { x: T.x - 30, y: T.y } : T;
      const movers = foes.filter((e) => !e.dead && !e.D.boss && e !== T);
      if (!movers.length) return;
      this.fx.push({ kind: 'wind', x: anchor.x, y: anchor.y - 12, t: 0, dur: 0.6 });
      const gens = movers.map((e, i) => {
        const a = (i + 1) * 2.2, x = anchor.x + Math.cos(a) * 11, y = anchor.y + Math.sin(a) * 9;
        e.homeX = x; e.homeY = y;
        return this.moveTo(e, x, y, 0.4, true);
      });
      this.text(anchor.x, anchor.y - 36, '¡AGRUPADOS!', '#c8f0ff', 1, 0.8);
      yield* this.all(gens);
    }
    // anillo de timing: se cierra sobre (x,y); A justo en el impacto = perfecto. Pulsar antes lo anula.
    *ringOn(x, y, onImpact) {
      const I = TH.input, WM = TH.settings.timing || 1, PE = PERF_EARLY * WM, PL = PERF_LATE * WM;
      const ring = { x, y, t: 0, dur: RING_T, res: null, lock: false };
      this.ring = ring;
      while (ring.t < RING_T) {
        if (I.pressed('a')) { if (ring.t >= RING_T - PE && !ring.lock) ring.res = 'perfect'; else ring.lock = true; }
        ring.t += this.dt;
        yield;
      }
      onImpact();
      let late = 0;
      while (late < PL) {
        if (!ring.res && !ring.lock && I.pressed('a')) ring.res = 'perfect';
        late += this.dt;
        if (late < PL) yield;
      }
      ring.t = RING_T;
      this.fx.push({ kind: 'ringEnd', x, y, t: 0, dur: 0.25, ok: ring.res === 'perfect' });
      this.ring = null;
      if (ring.res === 'perfect') this.gainCombo(18);
      return ring.res;
    }
    lunge(u) { this.parts.push({ x: u.x - 6, y: u.sy - 10, vx: -40, vy: -10, g: 0, t: 0, dur: 0.25, c: 'rgba(255,255,255,.6)', s: 2 }); }

    // daño a un enemigo. o.st: stats propios (combos e invocaciones) · o.single: ataque a un objetivo (se puede proteger)
    hit(u, e, kind, power, types, o) {
      if (e.dead) return;
      // una pinza protege al cuerpo de los ataques a un solo objetivo
      // mientras el jefe concentra un ataque sellado, sus pinzas se abren: es la ventana para romper los sellos
      if (o.single && !e.charging) {
        const g = this.enemies.find((x) => !x.dead && x !== e && x.guarding === e);
        if (g) { this.text(g.x, g.sy - 40, '¡PROTEGE!', '#ffb0a0', 1, 0.7); e = g; }
      }
      TH.sfx(kind === 'phys' ? 'hit' : 'magic');
      const P = TH.party, st = o.st || P.stats(u.id), D = e.D;
      let base = kind === 'phys' ? st.atk * power * 2.2 - D.def * e.defMul : st.mag * power * 2.2 - D.res;
      base = Math.max(base, (kind === 'phys' ? st.atk : st.mag) * power * 0.6);
      base = Math.max(1, base) * (0.92 + Math.random() * 0.16);
      let mod = 1, wT = null, rT = null;
      for (const t of types) if (D.weak && D.weak[t] && D.weak[t] >= mod) { mod = D.weak[t]; wT = t; }
      if (mod === 1) for (const t of types) if (D.resist && D.resist[t] && D.resist[t] <= mod) { mod = D.resist[t]; rT = t; }
      if (wT && !e.known.w.includes(wT)) { e.known.w.push(wT); TH.bestiary && TH.bestiary.learn(e.key, 'w', wT); }
      if (rT && !e.known.r.includes(rT)) { e.known.r.push(rT); TH.bestiary && TH.bestiary.learn(e.key, 'r', rT); }
      if (e.stunned) mod *= 1.5;
      const afx = u && u.id && TH.gear ? TH.gear.fx(u.id) : {};
      if (mod > 1.01 && afx.weakBoost) mod *= 1 + afx.weakBoost;
      if (afx.fury && u.id && P.members[u.id].hp < P.stats(u.id).hp * 0.3) mod *= 1 + afx.fury;
      if (e.guarding) mod *= 0.7;
      let dmg = Math.max(1, Math.round(base * mod));
      // red de seguridad: un dato raro nunca deja al enemigo con vida inválida (combate infinito)
      if (!isFinite(dmg)) { const s2 = u && u.id ? P.stats(u.id) : {}; dmg = Math.max(1, Math.round(((kind === 'phys' ? s2.atk : s2.mag) || 20) * (isFinite(power) ? power : 1) * 1.5)); }
      e.hp = Math.max(0, (isFinite(e.hp) ? e.hp : e.maxhp * 0.2) - dmg);
      if (afx.drain && u.id) { const mm = P.members[u.id], mx = P.stats(u.id).hp, a = Math.max(1, Math.round(dmg * afx.drain)); if (mm.hp > 0 && mm.hp < mx) mm.hp = Math.min(mx, mm.hp + a); }
      if (e.charging) this.breakSeals(e, types, o.st || o.eco ? 2 : 1);
      // el jefe no muere sin pasar por todas sus fases
      if (D.phases && e.phaseIdx < D.phases.length - 1) {
        const next = D.phases[e.phaseIdx + 1];
        if (e.hp / e.maxhp <= next.at) { e.hp = Math.max(e.hp, 1); if (!this.pendingPhase) this.pendingPhase = e; }
      }
      e.flash = 0.1; e.shakeT = 0.22;
      this.pose(e, 'hurt', 0);
      e.hurtT = 0.26;
      if (!o.st) this.gainCombo(Math.round((o.extra ? 4 : 10) * (afx.comboUp || 1)));
      // variedad: alternar personaje y tipo de daño da más carga de combo
      if (!o.st && !o.extra && u.id) {
        const L = this.lastHit, t0 = types[0];
        if (L) {
          const bonus = (L.id !== u.id ? 5 : 0) + (L.t !== t0 ? 5 : 0);
          if (bonus) { this.gainCombo(bonus); if (bonus >= 10) this.text(this.center.x - 50, this.center.y - 40, 'VARIEDAD', '#9fe8c8', 1, 0.7); }
        }
        this.lastHit = { id: u.id, t: t0 };
      }
      const col = mod > 1.01 ? '#ffd040' : mod < 0.99 ? '#a8b0c8' : '#ffffff';
      this.num(e.x + (o.extra ? 6 : 0), e.sy - (e.D.boss ? 44 : 30), dmg, col, mod > 1.01 ? 3 : 2);
      if (mod > 1.01 && !o.extra) this.text(e.x, e.sy - 48, '¡DÉBIL!', '#ffd040', 1, 0.6);
      else if (mod < 0.99 && !o.extra) this.text(e.x, e.sy - 48, 'RESISTE', '#a8b0c8', 1, 0.6);
      if (o.slash) this.fx.push({ kind: 'slash', x: e.x, y: e.sy - 16, t: 0, dur: 0.18, c: TH.data.TYPE_COLOR[types[0]] || '#fff', flip: Math.random() < 0.5 });
      this.burst(e.x, e.sy - (e.D.boss ? 24 : 16), TH.data.TYPE_COLOR[types[0]] || '#fff', o.extra ? 8 : 12);
      this.hitstop = Math.max(this.hitstop, o.extra ? 0.05 : 0.07);
      this.shake(o.big ? 4 : o.extra ? 1 : 2, o.big ? 0.3 : 0.16);
      this.flashA = Math.max(this.flashA, 0.12);
      if (o.orbs && u.id) {
        const mm = P.members[u.id];
        mm.mp = Math.min(P.stats(u.id).mp, mm.mp + 2);
        this.dropOrb(e.x, e.sy - 16);
      }
      if (e.hp <= 0) this.kill(e);
      this.drawParty();
    }
    // ---------- sellos (ataques cargados) ----------
    *chargeSeq(e) {
      const act = e.act;
      if (!act || !act.seals) return;
      e.charging = { act, id: e.actId, left: act.charge || 1, seals: act.seals.map((t) => ({ t, on: true })) };
      this.pose(e, 'cast', 0);
      this.text(e.x, e.sy - (e.D.boss ? 70 : 56), 'PREPARA ' + act.name.toUpperCase(), '#ffd070', 1, 1.1);
      this.burst(e.x, e.sy - 20, '#ffd070', 16);
      this.shake(1, 0.3);
      yield* this.wait(0.55);
      e.mode = 'idle';
      yield* this.tip('sellos');
    }
    // rompe sellos con los tipos del golpe; n: cuántos puede romper este golpe
    breakSeals(e, types, n) {
      const ch = e.charging;
      if (!ch || e.dead) return;
      let broke = 0;
      for (const t of types) {
        if (broke >= n) break;
        const s = ch.seals.find((x) => x.on && x.t === t);
        if (s) { s.on = false; broke++; }
      }
      if (!broke) return;
      this.text(e.x + 14, e.sy - (e.D.boss ? 62 : 46), broke > 1 ? 'SELLOS ROTOS ×' + broke : 'SELLO ROTO', '#7fe6ff', 1, 0.8);
      this.burst(e.x, e.sy - 28, '#7fe6ff', 10 + broke * 4);
      this.gainCombo(8 * broke);
      if (ch.seals.every((x) => !x.on)) {
        e.charging = null;
        this.text(e.x, e.sy - (e.D.boss ? 82 : 66), '¡' + ch.act.name.toUpperCase() + ' ANULADO!', '#7fe6ff', 1, 1.2);
        this.stun(e);
      }
    }
    // consejos de tutorial: se muestran una sola vez por partida
    *tip(key) {
      const T = TH.data.tips && TH.data.tips[key];
      if (!T || TH.flags.get('tip.' + key)) return;
      TH.flags.set('tip.' + key);
      yield* this.dialogSeq(T);
    }
    stun(e) {
      e.stunned = true;
      e.charging = null;
      e.cd = Math.max(e.cd || 0, 1) + 2;
      e.lockMax = 0;
      e.guarding = null;
      this.text(e.x, e.sy - 60, '¡ATURDIDO!', '#ff9a5a', 1, 1.1); TH.sfx('break');
      this.flashA = 0.3;
      this.hitstop = 0.14;
      this.shake(3, 0.25);
      this.gainCombo(25);
    }
    kill(e) {
      if (!e.dead && TH.bestiary) TH.bestiary.kill(e.key);
      for (const g of this.enemies) if (g.guarding === e) { g.guarding = null; g.covering = false; }
      if (e.guarding) { e.guarding = null; e.covering = false; }
      e.dead = true; e.guarding = null; TH.sfx(e.D.part ? 'break' : 'hit');
      e.mode = 'seq'; e.anim = 'hurt'; e.flash = 0.4;
      this.burst(e.x, e.sy - 16, '#ffffff', 18);
      this.fx.push({ kind: 'fade', e, t: 0, dur: e.D.boss ? 1.4 : 0.6 });
      // si cae el jefe, caen también sus partes y esbirros
      if (e.D.boss) for (const o of this.enemies) if (!o.dead) { o.hp = 0; this.kill(o); }
    }
    dropOrb(x, y) {
      if (this.orbs.length >= ORB_MAX) return;
      const k = this.orbs.length, C = this.center;
      this.orbs.push({ x, y, tx: C.x - 4 + (k % 4) * 7 - 10, ty: C.y - 34 - Math.floor(k / 4) * 7, t: 0 });
    }
    healNum(t, txt) {
      this.num(t.x, t.sy - 30, txt.replace(/^\S+\s/, '').split(' ')[0].replace('+', ''), '#8ef0a0');
      this.burst(t.x, t.sy - 14, '#8ef0c8', 10);
      this.drawParty();
    }
    doSwap() {
      const u = this.sel, r = this.reserve, i = this.active.indexOf(u);
      this.el.cmd.hidden = true;
      this.state = 'act';
      this.seq = (function* (self) {
        r.hidden = false;
        r.x = u.x - 70; r.y = u.y; r.homeX = u.homeX; r.homeY = u.homeY; r.acted = u.acted; r.charge = 0; r.guard = false;
        yield* self.all([self.moveTo(u, u.x - 70, u.y, 0.3), self.moveTo(r, r.homeX, r.homeY, 0.3)]);
        u.hidden = true; u.charge = 0; u.guard = false;
        self.active[i] = r; self.reserve = u;
        self.text(r.x, r.sy - 44, r.def.name.toUpperCase(), '#f4ecd8', 1, 0.7);
        yield* self.wait(0.15);
      })(this);
      this.after = () => { const c = this.candidates(); const k = c.indexOf(this.active[i]); if (k >= 0) { this.cursor = k; this.openCommand(this.active[i]); } else this.toSelect(); this.drawParty(); };
    }
    afterParty(u) {
      u.acted = true;
      this.free(u);
      if (this.checkEnd()) return;
      if (this.freeAction) this.freeAction = false;
      else for (const e of this.enemies) if (!e.dead) { e.cd--; if (e.buffT > 0 && --e.buffT === 0) e.defMul = 1; }
      this.drawParty();
      if (this.pendingPhase) { this.runPhase(() => this.runEnemies()); return; }
      this.runEnemies();
    }
    runPhase(next) {
      const e = this.pendingPhase;
      this.pendingPhase = null;
      this.state = 'act';
      this.seq = this.phaseSeq(e);
      this.after = next;
    }
    runEnemies() {
      const ready = this.enemies.find((e) => !e.dead && e.cd <= 0);
      if (!ready) { this.toSelect(); return; }
      if (ready.stunned) {
        ready.stunned = false;
        this.decide(ready, 0);
        this.text(ready.x, ready.sy - 50, 'SE RECUPERA', '#c8c0d8', 1, 0.6);
        this.runEnemies();
        return;
      }
      this.state = 'enemy';
      this.seq = this.enemySeq(ready);
      this.after = () => {
        if (!ready.dead) this.decide(ready, 0);
        this.drawParty();
        if (this.checkEnd()) return;
        if (this.pendingPhase) { this.runPhase(() => this.runEnemies()); return; }
        this.runEnemies();
      };
    }

    // ---------- acciones enemigas ----------
    *enemySeq(e) {
      const act = e.act;
      // una pinza que protegía vuelve a su sitio antes de actuar
      if (e.guarding && act.kind !== 'protect' && !e.covering) { e.guarding = null; yield* this.hop(e, e.baseX || e.homeX, e.baseY || e.homeY, 0.25, 6); e.homeX = e.baseX || e.homeX; e.homeY = e.baseY || e.homeY; }
      this.text(e.x, e.sy - (e.D.boss ? 70 : 56), act.name.toUpperCase(), '#ffb0a0', 1, 0.9);
      if (act.kind === 'buff' || act.kind === 'heal' || act.kind === 'protect' || act.kind === 'summon' || act.kind === 'healAlly' || act.kind === 'cover' || act.kind === 'rally') {
        this.pose(e, 'cast', 0);
        yield* this.wait(0.35);
        this.pose(e, 'cast', 1);
        if (act.kind === 'buff') { e.defMul = act.buff.def; e.buffT = act.buff.turns; this.text(e.x, e.sy - 44, 'DEF ×' + act.buff.def, '#ff9ab8', 1, 0.8); }
        if (act.kind === 'heal') {
          const amt = Math.round(e.maxhp * act.heal);
          e.hp = Math.min(e.maxhp, e.hp + amt);
          this.num(e.x, e.sy - 44, amt, '#8ef0a0', 2);
          this.fx.push({ kind: 'coral', x: e.x, y: e.sy, t: 0, dur: 0.7 });
        }
        if (act.kind === 'protect' && this.bossE && !this.bossE.dead) {
          const b = this.bossE;
          e.baseX = e.baseX || e.homeX; e.baseY = e.baseY || e.homeY;
          const nx = b.x - 40, ny = b.y + (e.key === 'pinza_izq' ? 10 : 24);
          yield* this.hop(e, nx, ny, 0.3, 8);
          e.homeX = nx; e.homeY = ny;
          e.guarding = b;
          this.text(e.x, e.sy - 40, 'PROTEGE A ' + b.D.name.toUpperCase(), '#ffb0a0', 1, 0.9);
        }
        if (act.kind === 'summon') yield* this.summonAdd(act.summon);
        if (act.kind === 'healAlly') {
          const t = this.enemies.filter((x) => !x.dead).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
          if (t) { const amt = Math.round(Math.min(t.maxhp * act.heal, e.maxhp * 0.6)); t.hp = Math.min(t.maxhp, t.hp + amt); this.num(t.x, t.sy - 44, amt, '#8ef0a0', 2); this.burst(t.x, t.sy - 14, '#8ef0c8', 12); }
        }
        if (act.kind === 'rally') for (const x of this.enemies) if (!x.dead && !x.D.boss) { x.atkMul = act.buff.atk; x.atkT = act.buff.turns; this.burst(x.x, x.sy - 14, '#ffb070', 8); this.text(x.x, x.sy - 40, 'ATQ ↑', '#ffb070', 1, 0.8); }
        if (act.kind === 'cover') {
          const pri = (x) => (x.D.role === 'sanador' ? 0 : x.D.role === 'potenciador' ? 1 : x.D.role === 'invocador' ? 2 : 3) + x.hp / x.maxhp;
          const t = this.enemies.filter((x) => !x.dead && x !== e && !x.D.boss && !x.D.part && !this.enemies.some((g) => g.guarding === x)).sort((a, b) => pri(a) - pri(b))[0];
          if (t) {
            const nx = t.x - 18, ny = t.y + 6;
            yield* this.hop(e, nx, ny, 0.3, 8);
            e.homeX = nx; e.homeY = ny; e.baseX = nx; e.baseY = ny;
            e.guarding = t; e.covering = true;
            this.text(e.x, e.sy - 40, 'CUBRE A ' + t.D.name.toUpperCase(), '#ffb0a0', 1, 0.9);
          }
        }
        this.burst(e.x, e.sy - 14, '#ff9ab8', 14);
        yield* this.wait(0.4);
        e.mode = 'idle';
        return;
      }
      const alive = this.active.filter((u) => !u.ko);
      if (!alive.length) return;
      const targets = act.target === 'all' ? alive : [this.pickTarget(act)];
      const I = TH.input;
      if (act.kind === 'phys' && act.target !== 'all') {
        const t = targets[0];
        yield* this.moveTo(e, t.x + (e.D.boss ? 40 : 22), t.y + 1, 0.24, true);
        this.pose(e, 'attack', 0);
      } else this.pose(e, act.kind === 'phys' ? 'attack' : 'cast', 0);
      const windup = 0.42 + Math.random() * 0.3;
      let k = 0, res = null, lock = false;
      const fl = { targets, on: false };
      const WM = TH.settings.timing || 1, BE = BLOCK_EARLY * WM, BL = BLOCK_LATE * WM;
      this.blockFx = fl;
      while (k < windup + BL) {
        const inWin = k >= windup - BE;
        if (inWin && !fl.on) { fl.on = true; fl.t0 = this.t; }
        if (I.pressed('a') && !res) { if (inWin && !lock) res = 'block'; else lock = true; }
        if (k >= windup && !e.struck) {
          e.struck = true;
          this.pose(e, act.kind === 'phys' ? 'attack' : 'cast', 1);
          if (act.fx) for (const t of targets) this.fx.push({ kind: act.fx, x: t.x, y: t.sy - 16, t: 0, dur: 0.45 });
          if (act.target === 'all' && act.kind === 'phys') this.fx.push({ kind: 'shock', x: this.center.x - 40, y: this.center.y, t: 0, dur: 0.5 });
        }
        k += this.dt;
        yield;
      }
      if (!e.struck) this.pose(e, act.kind === 'phys' ? 'attack' : 'cast', 1);
      e.struck = false;
      this.blockFx = null;
      for (const t of targets) this.damageParty(e, t, act, res === 'block');

      yield* this.wait(0.3);
      if (act.kind === 'phys' && act.target !== 'all') { this.pose(e, 'attack', 2); yield* this.hop(e, e.homeX, e.homeY, 0.28, 6); }
      e.mode = 'idle';
    }
    *summonAdd(key) {
      const C = this.center;
      const taken = (x, y) => this.enemies.some((o) => !o.dead && Math.hypot(o.homeX - x, o.homeY - y) < 15);
      const spot = (this.bossE ? BOSS_ADDS : EPOS).map(([dx, dy]) => [C.x + dx, C.y + dy]).find(([x, y]) => !taken(x, y));
      if (!spot) return;
      const e = this.makeEnemy(key, spot[0], spot[1], this.enemies.length);
      e.x = spot[0] + 60; e.alpha = 1;
      this.enemies.push(e);
      this.decide(e, 1);
      yield* this.moveTo(e, spot[0], spot[1], 0.4, true);
    }
    damageParty(e, u, act, blocked) {
      const P = TH.party, st = P.stats(u.id), D = e.D, gfx = TH.gear ? TH.gear.fx(u.id) : {}, am = e.atkT > 0 ? e.atkMul || 1 : 1;
      let base = act.kind === 'phys' ? D.atk * am * act.power * 0.95 - st.def * 0.5 : D.mag * am * act.power * 0.95 - st.res * 0.5;
      const el = TH.gear ? TH.gear.element(act) : null;
      if (el && gfx.resist && gfx.resist[el]) { base *= gfx.resist[el]; this.text(u.x + 10, u.sy - 54, 'RESISTE ' + el.toUpperCase(), '#9fd8ff', 1, 0.7); }
      if (act.kind !== 'phys' && gfx.magRes) base *= 1 - gfx.magRes;
      base = Math.max(base, (act.kind === 'phys' ? D.atk : D.mag) * act.power * 0.3);
      base = Math.max(1, base) * (0.9 + Math.random() * 0.2);
      if (blocked) base *= 0.5;
      TH.sfx(blocked ? 'block' : 'hurt');
      if (blocked) { this.text(u.x, u.sy - 46, '¡BLOQUEO!', '#9fd8ff', 1, 0.7); this.gainCombo(12); }
      if (u.guard) base *= gfx.guardPlus ? 0.3 : 0.5;
      if (u.shield) { base *= 0.6; u.shield = false; }
      const dmg = Math.max(1, Math.round(base));
      const mm = P.members[u.id];
      this.gainCombo(6);
      mm.hp = Math.max(0, mm.hp - dmg);
      this.num(u.x, u.sy - 30, dmg, blocked ? '#9fd8ff' : '#ff8a7a', 2);
      this.burst(u.x, u.sy - 16, blocked ? '#9fd8ff' : '#ff7a6a', blocked ? 6 : 12);
      this.shake(blocked ? 1 : 3, 0.2);
      this.hitstop = 0.06;
      if (blocked && gfx.blockHeal && mm.hp > 0) { const a = Math.round(st.hp * gfx.blockHeal); mm.hp = Math.min(st.hp, mm.hp + a); this.num(u.x + 10, u.sy - 40, a, '#8ef0a0', 1); }
      if (blocked && gfx.counter && !e.dead && Math.random() < gfx.counter) { this.text(u.x, u.sy - 56, 'CONTRAATAQUE', '#ffe070', 1, 0.7); this.hit(u, e, 'phys', 0.7, TH.data.basic[u.id] || ['Impacto'], { extra: true }); }
      if (!blocked && gfx.thorns && !e.dead) { const r = Math.max(1, Math.round(dmg * gfx.thorns)); e.hp = Math.max(1, e.hp - r); this.num(e.x, e.sy - 34, r, '#c8f0a0', 1); }
      if (mm.hp <= 0 && gfx.revive && !u.revived) { u.revived = true; mm.hp = Math.round(st.hp * 0.3); this.text(u.x, u.sy - 44, '¡RESURGE!', '#8ef0a0', 2, 1); this.burst(u.x, u.sy - 16, '#8ef0c8', 20); }
      if (mm.hp <= 0) { this.text(u.x, u.sy - 44, 'K.O.', '#ff6a5a', 2, 0.9); u.guard = false; u.charge = 0; }
      else { this.pose(u, 'hurt', 0); u.hurtT = 0.3; }
      this.drawParty();
    }

    // ---------- fases del jefe ----------
    *phaseSeq(e) {
      const D = e.D, ph = D.phases[++e.phaseIdx];
      this.el.cmd.hidden = true;
      this.help('');
      e.locks = []; e.lockMax = 0; e.stunned = false;
      this.flashA = 0.8; this.shake(5, 0.8);
      this.pose(e, 'hurt', 0);
      for (let i = 0; i < 3; i++) { this.burst(e.x - 10 + i * 10, e.sy - 30, '#ffffff', 16); yield* this.wait(0.18); }
      if (ph.sprite) { e.sprite = ph.sprite; this.burst(e.x, e.sy - 30, '#5ff0e0', 30); this.flashA = 0.6; }
      if (ph.music) TH.music.play(ph.music);
      e.mode = 'idle';
      yield* this.wait(0.4);
      if (ph.dialog) yield* this.dialogSeq(ph.dialog);
      // las pinzas derribadas vuelven a crecer
      if (ph.revive) for (const o of this.enemies) if (o.D.part && o.dead) {
        o.dead = false; o.hidden = false; o.alpha = 1; o.hp = Math.round(o.maxhp * ph.revive); o.mode = 'idle'; o.guarding = null;
        o.x = o.baseX || o.homeX; o.y = o.baseY || o.homeY; o.homeX = o.x; o.homeY = o.y;
        this.decide(o, 1);
        this.burst(o.x, o.sy - 14, '#ff9ab8', 16);
        this.text(o.x, o.sy - 40, 'REGENERA', '#ff9ab8', 1, 0.8);
      }
      if (ph.ai) { e.ai = ph.ai; e.cool = {}; e.decisions = 0; }
      this.decide(e, 0);
      this.bannerOn(D.name, 'Fase ' + (e.phaseIdx + 1), 1.6);
      yield* this.wait(0.5);
    }

    // ---------- fin del combate ----------
    checkEnd() {
      if (this.state === 'victory' || this.state === 'defeat') return true;
      for (const e of this.enemies) if (!e.dead && !isFinite(e.hp)) e.hp = Math.max(1, Math.round(e.maxhp * 0.2));
      if (this.enemies.every((e) => e.dead)) { this.victory(); return true; }
      if (this.active.every((u) => TH.party.members[u.id].hp <= 0)) {
        if (this.reserve && TH.party.members[this.reserve.id].hp > 0) {
          const u = this.active[0], r = this.reserve;
          r.hidden = false; r.x = u.homeX; r.y = u.homeY; r.homeX = u.homeX; r.homeY = u.homeY; r.acted = false;
          u.hidden = true; this.active[0] = r; this.reserve = u;
          this.text(r.x, r.sy - 44, '¡RELEVO!', '#f4ecd8', 1, 0.8);
          return false;
        }
        this.defeat();
        return true;
      }
      return false;
    }
    victory() {
      this.state = 'victory';
      this.help('');
      TH.music.play('victoria', 0.2);
      const P = TH.party;
      let exp = 0, gold = 0;
      const items = [];
      for (const e of this.enemies) {
        exp += e.D.exp; gold += e.D.gold;
        for (const d of e.D.drops || []) if (Math.random() < d.chance) { P.add(d.item, 1); items.push(TH.data.items[d.item].name); }
      }
      if (TH.gear) gold = Math.round(gold * (1 + Math.max(0, ...this.active.map((u) => TH.gear.fx(u.id).goldUp || 0))));
      P.gold += gold;
      P.ecoState = {};
      if (this.foe && this.foe.once) TH.flags.set(this.foe.once);
      const lines = [];
      const ids = this.active.map((u) => u.id).concat(this.reserve ? [this.reserve.id] : []);
      for (const id of ids) {
        const mm = P.members[id];
        if (mm.hp <= 0) mm.hp = 1;
        const ups = P.gainExp(id, Math.round(exp * (1 + ((TH.gear && TH.gear.fx(id).expUp) || 0))));
        if (ups) TH.sfx('level');
        if (ups) lines.push('<li class="up">' + TH.chars.defs[id].name + ' sube a Nv ' + mm.lv + '</li>');
      }
      const title = this.bossE ? '¡' + this.bossE.D.name + ' derrotado!' : '¡Victoria!';
      this.el.res.innerHTML = '<h3>' + title + '</h3><ul><li>Rondas: <b>' + this.round + '</b></li><li>Experiencia <b>+' + exp + '</b></li><li>Oro <b>+' + gold + '</b></li>' +
        (items.length ? '<li>Botín: <b>' + items.join(', ') + '</b></li>' : '') + lines.join('') + '</ul><button type="button" class="pm-btn" data-bt="continue">Continuar</button>';
      this.el.res.hidden = false;
      this.el.cmd.hidden = true;
      this.drawParty();
    }
    defeat() {
      this.state = 'defeat';
      this.help('');
      // volver a un punto seguro solo si el combate se puede repetir después (enemigo del mapa o jefe que vuelve a esperar)
      this.canHome = !!this.foe && (this.foe.fid != null || !!this.foe.once);
      const safe = TH.flags.get('safe'), where = safe && safe.entry ? 'el muelle (' + safe.name + ')' : 'la entrada de la zona';
      this.el.res.innerHTML = '<h3>El grupo ha caído</h3><p>La marea no perdona… pero aún no ha terminado.</p><div class="row2"><button type="button" class="pm-btn" data-bt="retry">Reintentar</button>' +
        (this.canHome ? '<button type="button" class="pm-btn ghost" data-bt="home">Volver a ' + where + '</button>' : '<button type="button" class="pm-btn ghost" data-bt="load">Cargar partida</button>') + '</div>' +
        (this.canHome ? '<p class="dim"><small>Volvéis recuperados y sin perder nada. B también vuelve.</small></p>' : '');
      this.el.res.hidden = false;
      this.el.cmd.hidden = true;
    }
    // vuelve al último punto seguro (Piedra de viaje) o a la entrada de la zona, con el grupo recuperado
    home() {
      const m = TH.scenes.registry.map, F = TH.flags, safe = F.get('safe');
      TH.party.load(this.snapshot); TH.party.healAll();
      this.close(true);
      const def = TH.data.maps[m.mapId];
      if (safe && safe.entry && TH.data.maps[safe.map]) m.enter({ map: safe.map, entry: safe.entry, quiet: true });
      else { const en = Object.keys((def && def.entries) || {})[0]; m.enter(en ? { map: m.mapId, entry: en, quiet: true } : { map: m.mapId, pos: { x: def.start.c * 16 + 8, y: def.start.r * 16 + 8 }, quiet: true }); }
      m.fadeA = 1; m.safeT = 2.5;
      TH.ui.toast('Despertáis junto a ' + (safe && safe.entry ? 'el muelle' : 'la entrada') + '. El grupo se ha recuperado.');
    }
    retry() {
      TH.party.load(this.snapshot);
      this.advantage = false;
      this.setup(true);
    }
    finish() {
      this.el.res.hidden = true;
      this.state = 'outro';
      const m = this.owner;
      this.seq = (function* (self) {
        const L = self.active.find((u) => !u.hidden) || self.active[0];
        const gens = self.active.concat(self.reserve ? [self.reserve] : []).filter((u) => u !== L && !u.hidden).map((u) => self.moveTo(u, L.x, L.y, 0.35));
        let k = 0;
        while (k < 0.4) {
          k += self.dt;
          m.zoom = U.lerp(self.zoomT, 1, U.smooth(Math.min(1, k / 0.4))); TH.camera.zoom = m.zoom;
          for (const g of gens) g.next();
          yield;
        }
        self.close(false);
      })(this);
    }
    close(skipPlace) {
      const m = this.owner;
      m.zoom = 1; TH.camera.zoom = 1; m.camLock = null; m.shake = 0;
      m.battle = null;
      TH.party.ecoState = {};
      TH.music.resume(0.5);
      if (!skipPlace) {
        const L = this.active.find((u) => !u.hidden) || this.active[0];
        const order = this.active.map((u) => u.id).concat(this.reserve ? [this.reserve.id] : []);
        if (order.length === m.count) { m.order = order.concat(m.order.filter((id) => order.indexOf(id) < 0)); m.party.forEach((a, i) => { a.def = TH.chars.defs[m.order[i]]; a.big = !!a.def.big; TH.chars.initChains(a); }); }
        const p = m.leader;
        p.x = L.x; p.y = L.y; p.z = m.map.zAt(p.x, p.y); p.dir = 'right'; p.state = 'walk';
        m.seedHistory(); m.placeFollowers(0);
        if (this.foe) this.foe.alive = false;
        for (const f of m.foes || []) f.hidden = false;
        m.safeT = 1.5;
      }
      TH.scenes.pop();
      const after = !skipPlace && this.state !== 'defeat' && this.foe && this.foe.after;
      if (after) TH.cutscene.play(after, { skippable: true });
    }

    // ---------- efectos ----------
    num(x, y, v, color, scale) { this.nums.push({ x: x + (Math.random() - 0.5) * 6, y, v: String(v), color, scale: scale || 2, t: 0, dur: 0.9 }); }
    text(x, y, s, color, scale, dur) {
      let k = 0;
      for (const n of this.nums) if (n.label && n.t < 0.6 && Math.abs(n.x - x) < 30 && Math.abs(n.y0 - y) < 34) k++;
      this.nums.push({ x, y: y - k * 9, y0: y, v: s, color, scale: scale || 1, t: 0, dur: dur || 0.8, label: true });
    }
    bannerOn(title, sub, dur) { this.banner = { title, sub, t: 0, dur: dur || 1.5 }; }
    shake(a, t) { this.shakeAmp = a; this.shakeT = t; }
    spark(x, y, c, vx, vy, dur, g) { if (this.parts.length < 400) this.parts.push({ x, y, vx, vy, g: g == null ? 160 : g, t: 0, dur, c, s: 1 }); }
    burst(x, y, c, n) {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 70; this.spark(x, y, i % 3 ? c : '#ffffff', Math.cos(a) * v, Math.sin(a) * v - 30, 0.3 + Math.random() * 0.3); }
    }
    bolt(u, e, type) { this.fx.push({ kind: 'bolt', x0: u.x + 6, y0: u.sy - 22, x1: e.x, y1: e.sy - 16, t: 0, dur: 0.3, c: TH.data.TYPE_COLOR[type] || '#fff' }); }

    // ---------- pintado ----------
    render(ctx) {
      const m = this.owner, cam = TH.camera, z = m.zoom, t = this.t;
      ctx.fillStyle = 'rgba(10,8,30,' + Math.min(0.85, 0.3 * this.dimA + this.darkA).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      const sx = m.shake ? Math.round((Math.random() * 2 - 1) * m.shake) : 0, sy = m.shake ? Math.round((Math.random() * 2 - 1) * m.shake) : 0;
      ctx.save();
      ctx.setTransform(z, 0, 0, z, W / 2 - (cam.rx + W / 2) * z + sx, H / 2 - (cam.ry + H / 2) * z + sy);
      // vista previa del área bajo los pies
      if (this.state === 'target' && this.pending) this.drawArea(ctx, t);
      for (const f of this.fx) if (f.kind === 'area') TH.battleFx.area(ctx, this, f, t);
      for (const o of this.orbs) {
        const b = Math.sin(o.t * 3 + o.tx) * 1.5;
        ctx.fillStyle = 'rgba(255,230,140,.25)'; ctx.fillRect(o.x - 3, o.y - 3 + b, 7, 7);
        ctx.fillStyle = '#ffe8a0'; ctx.fillRect(o.x - 1, o.y - 1 + b, 3, 3);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(o.x, o.y + b, 1, 1);
      }
      const L = this.active.concat(this.reserve && !this.reserve.hidden ? [this.reserve] : [], this.enemies).filter((u) => !u.hidden);
      L.sort((a, b) => a.y - b.y);
      for (const u of L) {
        if (u.side === 'enemy') {
          const fly = u.flyOff || 0, sy0 = u.sy;
          u.sy = sy0 - fly;
          TH.foes.draw(ctx, u);
          u.sy = sy0;
          if (u.guarding && !u.dead) { ctx.fillStyle = '#ffb0a0'; ctx.fillRect(Math.round(u.x - 10), Math.round(u.sy - 30), 3, 4); ctx.fillStyle = '#7a2418'; ctx.fillRect(Math.round(u.x - 9), Math.round(u.sy - 29), 1, 2); }
          if (u.stunned && !u.dead) for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; ctx.fillStyle = '#ffe070'; ctx.fillRect(Math.round(u.x + Math.cos(a) * 8), Math.round(u.sy - fly - (MARK_H[u.sprite] || u.D.markH || 28) - 4 + Math.sin(a) * 2), 2, 2); }
        } else if (u.ko && u.mode === 'auto') {
          ctx.save(); ctx.translate(Math.round(u.x), Math.round(u.shadowY)); ctx.rotate(-Math.PI / 2); ctx.translate(-Math.round(u.x), -Math.round(u.shadowY) - 2);
          TH.chars.draw(ctx, u, 0.85); ctx.restore();
        } else {
          TH.chars.draw(ctx, u);
          if (u.charge) for (let i = 0; i < u.charge; i++) { ctx.fillStyle = '#ffe070'; ctx.fillRect(Math.round(u.x - 4 + i * 4), Math.round(u.sy - 44 + Math.sin(t * 5 + i) * 1), 2, 2); }
          if (u.shield) { ctx.fillStyle = 'rgba(127,216,240,.5)'; ctx.fillRect(Math.round(u.x - 8), Math.round(u.sy - 36), 1, 30); }
        }
      }
      // vida de los enemigos
      for (const e of this.enemies) {
        if (e.dead) continue;
        const top = e.sy - (e.flyOff || 0) - (MARK_H[e.sprite] || e.D.markH || 28);
        // barra de vida sobre cada enemigo
        const bw = e.D.boss ? 48 : 24, x0 = Math.round(e.x - bw / 2), y0 = Math.round(top - 6);
        ctx.fillStyle = '#1a1028'; ctx.fillRect(x0 - 1, y0 - 1, bw + 2, 4);
        ctx.fillStyle = '#4a2030'; ctx.fillRect(x0, y0, bw, 2);
        const q = e.hp / e.maxhp;
        ctx.fillStyle = q > 0.5 ? '#7fe08a' : q > 0.25 ? '#ffd040' : '#ff6a5a'; ctx.fillRect(x0, y0, Math.max(1, Math.round(bw * q)), 2);
        // intención anunciada para esta ronda
        if (e.act && !e.charging && !e.stunned && TH.gear) TH.gear.intent(ctx, e, x0 - 9, y0 - 3, this.state === 'target' && this.targets && this.targets()[this.target] === e);
        // debilidades (marco dorado) y resistencias (apagadas) ya descubiertas
        const kn = e.known, ic = kn ? kn.w.map((t) => [t, 1]).concat(kn.r.map((t) => [t, 0])) : [];
        if (ic.length && !e.charging) {
          const big = e.D.boss, ix = big ? x0 + bw + 6 : Math.round(e.x - (ic.length * 10 - 1) / 2), iy = big ? y0 - 4 : y0 - 12;
          ic.forEach(([tt, w], i) => {
            const x = ix + i * 10;
            if (w) { ctx.fillStyle = '#ffd040'; ctx.fillRect(x - 1, iy - 1, 11, 11); }
            ctx.globalAlpha = w ? 1 : 0.55; ctx.drawImage(typeIcon(tt), x, iy); ctx.globalAlpha = 1;
            if (!w) { ctx.fillStyle = '#a8b0c8'; ctx.fillRect(x + 1, iy + 4, 7, 1); }
          });
        }
        // sellos del ataque cargado
        if (e.charging) {
          const S = e.charging.seals, n = S.length, big = e.D.boss, sx0 = big ? x0 + bw + 10 : Math.round(e.x - (n * 10 - 1) / 2), sy0 = (big ? y0 - 4 : y0 - 13) + Math.round(Math.sin(t * 3) * 1);
          ctx.fillStyle = 'rgba(255,208,112,' + (0.35 + 0.25 * Math.sin(t * 6)).toFixed(2) + ')'; ctx.fillRect(sx0 - 2, sy0 - 2, n * 10 + 3, 13);
          for (let i = 0; i < n; i++) {
            ctx.globalAlpha = S[i].on ? 1 : 0.25;
            ctx.drawImage(typeIcon(S[i].t), sx0 + i * 10, sy0);
            if (!S[i].on) { ctx.fillStyle = '#7fe6ff'; for (let k = 0; k < 9; k++) ctx.fillRect(sx0 + i * 10 + k, sy0 + k, 1, 1); }
          }
          ctx.globalAlpha = 1;
          // rondas que le quedan para soltarlo
          for (let k = 0; k < e.charging.left; k++) { ctx.fillStyle = '#1a1028'; ctx.fillRect(sx0 - 7, sy0 + k * 4, 4, 3); ctx.fillStyle = '#ff9a5a'; ctx.fillRect(sx0 - 6, sy0 + k * 4 + 1, 2, 1); }
        }
      }

      if (this.state === 'command' || this.state === 'skills' || this.state === 'items' || this.state === 'combos' || this.state === 'ecos' || this.state === 'summons') this.arrow(ctx, this.sel.x, this.sel.sy - 44, '#ffe070', t);
      if (this.state === 'ally') { const u = this.targets()[this.target]; if (u) this.arrow(ctx, u.x, u.sy - 44, '#8ef0a0', t); }
      ctx.globalCompositeOperation = 'lighter';
      for (const f of this.fx) if (f.kind !== 'area') this.drawFx(ctx, f, t);
      for (const p of this.parts) { ctx.globalAlpha = 1 - p.t / p.dur; ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (this.ring) {
        const r = this.ring, k = Math.min(1, r.t / r.dur), rad = U.lerp(26, 6, k);
        const near = r.t >= r.dur - PERF_EARLY * (TH.settings.timing || 1);
        this.circle(ctx, r.x, r.y, 6, near ? '#ffe070' : 'rgba(255,255,255,.5)');
        this.circle(ctx, r.x, r.y, rad, r.lock ? '#7a7090' : near ? '#ffe070' : '#ffffff');
        if (r.res === 'perfect') this.circle(ctx, r.x, r.y, rad + 2, '#ffffff');
      }
      if (this.blockFx && this.blockFx.on) {
        for (const u of this.blockFx.targets) {
          const k = Math.min(1, (this.t - this.blockFx.t0) / 0.12), s = Math.round(3 + k * 5);
          const x = Math.round(u.x + 6), y = Math.round(u.sy - 34);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s, y, s * 2 + 1, 1); ctx.fillRect(x, y - s, 1, s * 2 + 1);
          ctx.fillStyle = '#9fd8ff'; ctx.fillRect(x - 1, y - 1, 3, 3);
        }
      }
      ctx.restore();
      // capas a pantalla completa: oscurecido de combos, invocación y cartel
      if (this.summon) TH.battleFx.drawSummon(ctx, this, this.summon);
      for (const n of this.nums) {
        const k = n.t / n.dur, b = n.label ? -k * 14 : -Math.sin(Math.min(1, k * 3) * Math.PI) * 12 - k * 8;
        const p = m.toScreen(n.x, n.y);
        ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
        TH.pixfont.draw(ctx, n.v, p.x + sx, p.y + b + sy, n.color, n.scale);
      }
      ctx.globalAlpha = 1;
      if (this.banner) {
        const b = this.banner, k = b.t / b.dur, a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(8,6,24,.75)'; ctx.fillRect(0, 26, W, 30);
        ctx.fillStyle = '#e8b84a'; ctx.fillRect(0, 26, W, 1); ctx.fillRect(0, 55, W, 1);
        TH.pixfont.draw(ctx, b.title, W / 2, 37, '#fff3d6', 2);
        if (b.sub) TH.pixfont.draw(ctx, b.sub, W / 2, 50, '#e8b84a', 1);
        ctx.globalAlpha = 1;
      }
      if (this.flashA > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (this.flashA * 0.6).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    }
    drawArea(ctx, t) {
      const L = this.targets(), T = L[this.target], a = this.pending, u = this.sel;
      if (!T || !u) return;
      const area = a.area || 'one', r = (a.skill && a.skill.r) || (a.combo && a.combo.r);
      TH.battleFx.area(ctx, this, { area, u, T, r, t: 0, dur: 1, preview: true }, t);
      const hits = this.areaHits(u, T, area, r);
      for (const e of hits) this.arrow(ctx, e.x, e.sy - (e.flyOff || 0) - (MARK_H[e.sprite] || e.D.markH || 28) - 14, e === T ? '#ff8a7a' : '#ffb070', t);
    }
    arrow(ctx, x, y, c, t) {
      const yy = Math.round(y + Math.sin(t * 6) * 1.5), xx = Math.round(x);
      ctx.fillStyle = '#1a1028'; ctx.fillRect(xx - 4, yy - 1, 9, 2); ctx.fillRect(xx - 3, yy + 1, 7, 2); ctx.fillRect(xx - 1, yy + 3, 3, 2);
      ctx.fillStyle = c; ctx.fillRect(xx - 3, yy, 7, 1); ctx.fillRect(xx - 2, yy + 1, 5, 1); ctx.fillRect(xx - 1, yy + 2, 3, 1); ctx.fillRect(xx, yy + 3, 1, 1);
    }
    circle(ctx, x, y, r, c) {
      ctx.fillStyle = c;
      const n = Math.max(12, Math.round(r * 5));
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.8), 1, 1); }
    }
    drawFx(ctx, f, t) {
      const k = f.t / f.dur;
      if (f.kind === 'slash') {
        ctx.fillStyle = f.c;
        for (let i = -10; i <= 10; i++) {
          const w = Math.round((1 - Math.abs(i) / 10) * 3 * (1 - k)) + 1;
          ctx.fillRect(Math.round(f.x + i * 1.4 * (f.flip ? -1 : 1)), Math.round(f.y + i * 0.9 - Math.cos((i / 10) * 1.5) * 4), w, 1);
        }
      } else if (f.kind === 'bolt') {
        ctx.fillStyle = f.c;
        for (let i = 0; i <= 10 * Math.min(1, k * 2); i++) {
          const e = i / 10;
          ctx.fillRect(Math.round(U.lerp(f.x0, f.x1, e) + (i % 2 ? 2 : -2) * (1 - e)), Math.round(U.lerp(f.y0, f.y1, e) + Math.sin(e * 9 + t * 20) * 2), 2, 2);
        }
      } else if (f.kind === 'ringEnd') this.circle(ctx, f.x, f.y, 6 + k * 12, f.ok ? '#ffe070' : 'rgba(255,255,255,.4)');
      else if (f.kind === 'glow') this.circle(ctx, f.u.x, f.u.sy - 18, 8 + k * 6, '#ffe070');
      else if (f.kind === 'fade') { f.e.alpha = 1 - k; if (k > 0.95) f.e.hidden = true; }
      else TH.battleFx.draw(ctx, this, f, t, k);
    }

    // ---------- interfaz HTML ----------
    help(s) { this.el.help.textContent = s; this.el.help.hidden = !s; }
    // el panel HTML se reconstruye como mucho una vez por fotograma
    drawParty() { this._dirty = true; }
    _drawParty() {
      this._dirty = false;
      const P = TH.party, sel = this.sel;
      const row = (u, i, res) => {
        const mm = P.members[u.id], s = P.stats(u.id);
        const cls = 'bt-row' + (res ? ' res' : '') + (u === sel && !res && this.state !== 'victory' ? ' sel' : '') + (u.acted ? ' done' : '') + (mm.hp <= 0 ? ' ko' : '');
        const ecos = mm.ecos.map((e) => '<i class="eco' + (P.ecoState[e] ? ' off' : '') + '" style="background:' + TH.data.ecos[e].color + '"></i>').join('');
        return '<button type="button" class="' + cls + '" data-bt="unit" data-i="' + i + '"><canvas width="64" height="64" data-port="' + u.id + '"></canvas>' +
          '<span class="nm">' + u.def.name + (res ? ' <small>reserva</small>' : '') + (u.guard ? ' <small>defensa</small>' : '') + ecos + '</span>' +
          '<span class="bars"><i class="hp" style="width:' + Math.round((100 * mm.hp) / s.hp) + '%"></i></span><span class="num">' + mm.hp + '</span>' +
          '<span class="bars mp"><i style="width:' + Math.round((100 * mm.mp) / Math.max(1, s.mp)) + '%"></i></span><span class="num mpn">' + mm.mp + '</span>' +
          '<span class="pips">' + (this.plan && this.plan.some((p) => p.u === u) ? '✓' : '') + '</span></button>';
      };
      const cb = this.combo, full = Math.floor(cb / 100), part = cb % 100;
      const combo = '<div class="bt-combo"><span>COMBO</span>' + [0, 1, 2].map((i) => '<b><i style="width:' + (i < full ? 100 : i === full ? part : 0) + '%"></i></b>').join('') + '</div>';
      this.el.party.innerHTML = combo + this.active.map((u, i) => row(u, i, false)).join('') + (this.reserve ? row(this.reserve, 9, true) : '');
      this.el.party.querySelectorAll('canvas[data-port]').forEach((c) => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(TH.portraits.get(c.dataset.port, P.members[c.dataset.port].hp <= 0 ? 'sad' : 'neutral'), 0, 0); });
    }
    drawCmd() {
      const u = this.sel, el = this.el.cmd;
      const titles = { skills: 'Técnicas · PM ' + TH.party.members[u.id].mp, items: 'Objetos', combos: 'Combos · ' + Math.floor(this.combo / 100) + ' ●', ecos: 'Ecos de ' + u.def.name, summons: 'Invocar · ' + this.standby().length + ' en espera' };
      const title = titles[this.state] || u.def.name;
      el.innerHTML = '<div class="bt-title">' + title + '</div>' + this.menu.map((it, i) => {
        const icons = (it.types || []).map((t) => '<i class="ty" style="background:' + TH.data.TYPE_COLOR[t] + '" title="' + t + '"></i>').join('');
        return '<button type="button" class="bt-item' + (i === this.menuIdx ? ' sel' : '') + (it.disabled ? ' off' : '') + '" data-bt="cmd" data-i="' + i + '"><span>' + it.label + icons + '</span>' + (it.note ? '<small>' + it.note + '</small>' : '') + '</button>';
      }).join('') +

        (this.state !== 'command' ? '<button type="button" class="bt-item back" data-bt="back"><span>Volver</span><small>B</small></button>' : '');
      el.hidden = false;
      const s = this.menu[this.menuIdx];
      if (s && s.skill) this.help(s.skill.desc);
      else if (s && s.combo) this.help(s.combo.desc);
      else if (s && s.eco) this.help(TH.data.ecos[s.eco].release.desc + ' Después queda en espera.');
      else if (s && s.summon) this.help(s.summon.desc);
    }
  }
  TH.BattleScene = BattleScene;
})();
