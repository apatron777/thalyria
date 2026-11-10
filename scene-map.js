// Escena de exploración: grupo en fila, saltos, escalada, NPCs, cámara, agua, objetos, partículas, luz y guardado
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, TS = 16, HZ = TH.HZ, W = TH.W, H = TH.H;
  const HOUR_RATE = 1 / 30; // 1 hora de juego cada 30 s (día completo en 12 min)
  const PK = () => TH.particles.K;
  const HN = 1024; // historial de posiciones del líder (anillo)
  const GAP = 17; // distancia en la fila entre miembros
  const ST = { walk: 0, jump: 1, climb: 2, hang: 3, mantle: 4 };
  const ST_NAME = ['walk', 'jump', 'climb', 'hang', 'mantle'];
  const DIR = ['down', 'up', 'left', 'right'];
  const DIRI = { down: 0, up: 1, left: 2, right: 3 };
  const WALK_SP = 62, RUN_SP = 128, CLIMB_SP = 1.7, JUMP_T = 0.42;

  function actor(id) {
    const def = TH.chars.defs[id];
    const a = { def, x: 0, y: 0, z: 0, arc: 0, sy: 0, shadowY: 0, dir: 'down', anim: 'idle', frame: 0, state: 'walk', dist: 0, sort: 0, big: !!def.big, chains: null };
    TH.chars.initChains(a);
    return a;
  }
  function setDef(a, id) {
    a.def = TH.chars.defs[id]; a.big = !!a.def.big;
    TH.chars.initChains(a);
  }

  class MapScene extends TH.Scene {
    constructor() {
      super();
      this.axis = { x: 0, y: 0 };
      this.list = [];
      this.tint = [1, 1, 1];
      this.clock = { hour: 8, day: 1, speed: 1 };
      this.order = TH.chars.PARTY.slice();
      this.party = this.order.map(actor);
      this.npcs = [];
      this.em = { leaf: 0, fly: 0, smoke: 0, spark: 0, spray: 0, dust: 0, puff: 0 };
      this.wind = 0.5;
      this.saveT = 0;
      this.push = 0; // tiempo empujando contra un borde
      this.act = {}; // datos del salto/escalada en curso
      // historial: x, y, z, arco, distancia acumulada, estado, dirección, fotograma
      this.hx = new Float32Array(HN); this.hy = new Float32Array(HN); this.hz = new Float32Array(HN);
      this.ha = new Float32Array(HN); this.hd = new Float64Array(HN);
      this.hs = new Uint8Array(HN); this.hr = new Uint8Array(HN); this.hf = new Uint8Array(HN);
      this.hHead = 0; this.hLen = 0;
      this.hidden = [false, false, false, false];
      // estado controlado por las cinemáticas
      this.inCutscene = false;
      this.fadeA = 0; this.fadeC = '#000';
      this.zoom = 1; this.shake = 0; this.camLock = null;
      this.count = 4; // miembros del grupo que viajan juntos (los primeros de this.order)
      this.zbuf = TH.makeCanvas(W, H);
      this.sp = { x: 0, y: 0 };
      this.talkTarget = null;
    }
    get leader() { return this.party[0]; }
    // compatibilidad: «solo» = solo viaja el líder
    get solo() { return this.count === 1; }
    set solo(v) { this.count = v ? 1 : 4; }

    enter(d) {
      if (d.resume) return;
      if (d.fresh) this.zones = {};
      this.loadZone(d.map);
      const def = this.map.def;
      TH.music.setZone(d.map, def);
      const m = this.map, p = this.leader;
      if (d.count) this.count = d.count; else if (d.solo != null) this.solo = !!d.solo;
      if (d.order && d.order.length === 4 && d.order.every((id) => TH.chars.defs[id])) {
        this.order = d.order.slice();
        this.party.forEach((a, i) => setDef(a, this.order[i]));
      }
      p.x = def.start.c * TS + 8; p.y = def.start.r * TS + 12;
      const en = d.entry && def.entries && def.entries[d.entry];
      if (en) { p.x = en.c * TS + 8; p.y = en.r * TS + 10; }
      if (d.pos && m.canMove(d.pos.x, d.pos.y, d.pos.x, d.pos.y)) { p.x = d.pos.x; p.y = d.pos.y; }
      this.trans = null; this.fadeA = 0;
      if (d.hour != null) this.clock.hour = d.hour;
      if (d.day) this.clock.day = d.day;
      if (d.speed != null) this.clock.speed = d.speed;
      p.z = m.zAt(p.x, p.y); p.state = 'walk'; p.arc = 0; p.dir = (en && en.dir) || 'down';
      this.seedHistory();
      this.placeFollowers(0);
      for (const a of this.party) { this.pose(a, 0); a.chainsReady = false; }
      TH.camera.setMap(m);
      TH.camera.snapTo(p.x, p.y - p.z * HZ - 8);
      if (!d.quiet) TH.ui.banner(def.name, def.sub);
    }

    // zonas: se crean una vez y se conservan (NPCs, cofres abiertos) al ir y volver
    loadZone(id) {
      this.zones = this.zones || {};
      let z = this.zones[id];
      if (!z) {
        const def = TH.data.maps[id];
        let maps = null;
        if (def.epochs) {
          // misma zona en dos épocas: mismo trazado, distinto terreno, objetos y luz
          const mk = (ep) => {
            const e = def.epochs[ep], cat = (k) => (def[k] || []).concat(e[k] || []);
            return new TH.TileMap(Object.assign({}, def, { terrainRects: cat('terrainRects'), tiles: cat('tiles'), props: cat('props'), chests: cat('chests'), pickups: cat('pickups'), signs: cat('signs'), zones: e.zones || def.zones, forests: e.forests || def.forests, epoch: ep }));
          };
          maps = { past: mk('past'), present: mk('present') };
        }
        const ep = maps ? TH.flags.get('epoca.' + id, def.epochStart || 'present') : null;
        this.map = maps ? maps[ep] : new TH.TileMap(def);
        this.spawnNpcs(def);
        z = this.zones[id] = { map: this.map, npcs: this.npcs, maps, puzzle: def.puzzle ? new TH.Puzzle(id, def) : null };
      }
      if (z.maps) z.map = z.maps[TH.flags.get('epoca.' + id, TH.data.maps[id].epochStart || 'present')];
      this.map = z.map; this.npcs = z.npcs; this.mapId = id;
      this.puzzle = z.puzzle; this.epochs = !!z.maps;
      if (this.puzzle) { this.puzzle.epoch = this.map.def.epoch || null; this.puzzle.apply(this.map); }
      else this.map.dynLv = null;
      this.resSeq = null; TH.res.wheel = null; this.ready = false;
      this.spawnFoes(this.map.def);
      for (const t of this.map.things) if (t.kind === 'chest') t.inst.v = TH.flags.get('cofre.' + t.e.id) ? 1 : 0;
      TH.flags.set('visto.' + id);
      if (this.map.def.unlock) TH.flags.set(this.map.def.unlock);
      TH.camera.setMap(this.map);
    }
    // cambio de época instantáneo: misma posición y mismo estado de los puzles
    switchEpoch() {
      const z = this.zones[this.mapId], pz = this.puzzle, p = this.leader;
      if (!z || !z.maps || !pz || p.state !== 'walk' || this.resSeq) return false;
      const ef = TH.data.maps[this.mapId].epochFlag;
      if (ef && !TH.flags.get(ef)) { TH.ui.toast('Aún no sabes viajar entre épocas'); return false; }
      const from = pz.epoch, to = from === 'past' ? 'present' : 'past', m2 = z.maps[to];
      pz.epoch = to; pz.apply(m2); TH.sfx('epoch'); TH.music.setZone(this.mapId, this.map.def, 0.6);
      if (m2.violation(p.x, p.y) !== 0 || m2.solidAt(p.x, p.y)) {
        pz.epoch = from; pz.apply(this.map);
        TH.ui.toast('Algo ocupa este lugar en la otra época');
        return false;
      }
      this.map = z.map = m2;
      TH.flags.set('epoca.' + this.mapId, to);
      TH.camera.setMap(m2);
      this.refresh();
      this.epochFlash = 1;
      TH.res.ring(p.x, p.sy - 12, to === 'past' ? '#ffd890' : '#bfe0ff');
      TH.ui.toast(to === 'past' ? 'El pasado' : 'El presente');
      return true;
    }
    // cambio de zona con fundido
    changeZone(id, entry) {
      if (this.trans || !TH.data.maps[id]) return;
      this.trans = { t: 0, phase: 'out', to: id, entry };
    }
    updateTransition(dt) {
      const T = this.trans;
      T.t += dt;
      if (T.phase === 'out') {
        this.fadeA = Math.min(1, T.t / 0.3);
        if (T.t >= 0.36) {
          const p = this.leader;
          this.enter({ map: T.to, entry: T.entry, quiet: true });
          this.trans = { t: 0, phase: 'in', to: T.to };
          this.fadeA = 1;
          if (this.mapId !== T.from) TH.ui.banner(this.map.def.name, this.map.def.sub);
          if (!this.inCutscene) this.saveGame();
          void p;
        }
      } else {
        this.fadeA = Math.max(0, 1 - T.t / 0.4);
        if (T.t >= 0.4) { this.trans = null; this.fadeA = 0; }
      }
    }

    // tras un cambio de historia: vuelve a decidir quién está en el mapa
    refresh() {
      const def = this.map.def, keep = this.npcs.slice();
      this.spawnNpcs(def);
      for (const n of this.npcs) { const o = keep.find((k) => k.key === n.key && k.def.id === n.def.id); if (o) { n.x = o.x; n.y = o.y; n.z = o.z; n.dir = o.dir; } }
      const z = this.zones && this.zones[this.mapId]; if (z) z.npcs = this.npcs;
      this.spawnFoes(def);
    }
    spawnNpcs(def) {
      this.npcs = [];
      for (const n of def.npcs || []) {
        if (n.if && !TH.flags.test(n.if)) continue;
        const id = n.variant ? TH.chars.variant(n.id, n.variant) : n.id;
        if (!TH.chars.defs[id]) continue;
        const a = actor(id);
        a.x = n.c * TS + 8; a.y = n.r * TS + 10; a.z = this.map.zAt(a.x, a.y);
        a.hx = a.x; a.hy = a.y; a.ai = n.ai || 'idle'; a.radius = (n.radius || 2) * TS;
        a.dir = n.dir || 'down'; a.homeDir = a.dir; a.wait = 1 + Math.random() * 2; a.tx = a.x; a.ty = a.y;
        a.phase = Math.random() * 4; a.npc = true;
        a.key = n.talk || id; // guion de conversación en TH.data.talk
        a.reach = n.reach || 26;
        this.npcs.push(a);
      }
    }

    // ---------- guardado ----------
    state() { const p = this.leader; return { v: 4, map: this.mapId, x: Math.round(p.x), y: Math.round(p.y), hour: this.clock.hour, day: this.clock.day, speed: this.clock.speed, count: this.count, order: this.order.slice(), solo: this.solo, flags: TH.flags.dump(), party: TH.party.dump() }; }
    // miembros activos del grupo (para menús y tiendas)
    members() { return this.order.slice(0, this.count); }
    inParty(id) { return this.members().indexOf(id) >= 0; }
    saveGame() {
      if (!TH.game || !TH.game.started) return false;
      // a medio salto o trepando se guarda la última posición firme
      const p = this.leader;
      if (p.state !== 'walk' && this.safe) { const s = this.state(); s.x = this.safe.x; s.y = this.safe.y; return TH.save.write(s); }
      return TH.save.write(this.state());
    }
    loadGame() {
      const s = TH.save.read();
      if (!s || !TH.data.maps[s.map]) return false;
      TH.flags.load(s.flags);
      TH.party.load(s.party);
      this.enter({ map: s.map, pos: { x: s.x, y: s.y }, hour: s.hour, day: s.day, order: s.order, count: s.count, solo: s.solo, speed: s.speed, fresh: true });
      return true;
    }

    // ---------- historial de la fila ----------
    record(force) {
      const p = this.leader;
      const st = ST[p.state], dr = DIRI[p.dir];
      let i = this.hHead;
      if (this.hLen) {
        const dx = p.x - this.hx[i], dv = p.y - p.z * HZ - p.arc - (this.hy[i] - this.hz[i] * HZ - this.ha[i]);
        const d = Math.hypot(dx, dv);
        if (d < 0.2 && !force && st === this.hs[i]) { this.hr[i] = dr; this.hf[i] = p.frame; return; }
        const dist = this.hd[i] + d;
        i = this.hHead = (i + 1) % HN;
        this.hd[i] = dist;
        if (this.hLen < HN) this.hLen++;
      } else { this.hd[i] = 0; this.hLen = 1; }
      this.hx[i] = p.x; this.hy[i] = p.y; this.hz[i] = p.z; this.ha[i] = p.arc;
      this.hs[i] = st; this.hr[i] = dr; this.hf[i] = p.frame;
    }
    // al entrar: fila recta detrás del líder (hacia el sur si se puede)
    seedHistory() {
      const p = this.leader, m = this.map, y0 = p.y, z0 = m.zAt(p.x, y0);
      this.hHead = 0; this.hLen = 0;
      let e = 0;
      while (e < GAP * 3 + 2 && m.canMove(p.x, y0 + e, p.x, y0 + e + 1) && m.zAt(p.x, y0 + e + 1) === z0) e++;
      for (let k = e; k >= 0; k--) { p.y = y0 + k; this.record(true); }
      p.y = y0;
    }
    // coloca a los seguidores sobre el historial
    placeFollowers(dt) {
      const head = this.hHead, dHead = this.hd[head];
      for (let k = 1; k < this.party.length; k++) {
        const a = this.party[k];
        const target = dHead - GAP * k;
        let j = head, steps = 0;
        while (steps < this.hLen - 1 && this.hd[j] > target) { j = (j - 1 + HN) % HN; steps++; }
        const jn = (j + 1) % HN;
        let f = 0;
        if (steps > 0 && this.hd[jn] > this.hd[j]) f = U.clamp((target - this.hd[j]) / (this.hd[jn] - this.hd[j]), 0, 1);
        const b = steps > 0 ? jn : j;
        const nx = U.lerp(this.hx[j], this.hx[b], f), ny = U.lerp(this.hy[j], this.hy[b], f);
        const moved = a.lastT == null ? 0 : Math.max(0, target - a.lastT);
        a.lastT = target;
        a.x = nx; a.y = ny;
        a.z = U.lerp(this.hz[j], this.hz[b], f);
        a.arc = U.lerp(this.ha[j], this.ha[b], f);
        const src = f > 0.5 ? b : j;
        a.state = ST_NAME[this.hs[src]];
        a.dir = DIR[this.hr[src]];
        a.jf = this.hf[src];
        a.speed = dt > 0 ? moved / dt : 0;
        a.dist += moved;
        if (steps >= this.hLen - 1 && target < this.hd[j]) a.speed = 0;
      }
    }
    // animación según estado y velocidad
    pose(a, t) {
      const s = a.state;
      if (s === 'strike') { a.anim = 'attack'; a.frame = a === this.leader ? a.sframe : 1; }
      else if (s === 'jump') { a.anim = 'jump'; a.frame = a === this.leader ? a.frame : a.jf; }
      else if (s === 'mantle') { a.anim = 'jump'; a.frame = 1; }
      else if (s === 'climb') { a.anim = 'climb'; a.frame = Math.floor(a.dist / 3) & 3; }
      else if (s === 'hang') { a.anim = 'hang'; a.frame = Math.floor(t * 5) & 1; }
      else if (a.speed > 8) {
        if (a.speed > 90) { a.anim = 'run'; a.frame = Math.floor(a.dist / 5.5) % TH.chars.FRAMES.run; }
        else { a.anim = 'walk'; a.frame = Math.floor(a.dist / 4) % TH.chars.FRAMES.walk; }
      } else { a.anim = 'idle'; a.frame = Math.floor(t * 3 + (a.phase || 0) * 2) % TH.chars.FRAMES.idle; }
      if (a.force) { a.anim = a.force[0]; a.frame = a.force[1]; }
      a.sy = a.y - a.z * HZ - a.arc;
      a.shadowY = s === 'climb' || s === 'hang' || s === 'mantle' ? null : a.y - a.z * HZ;
      a.sort = a.y;
    }

    // ---------- colisión con NPCs ----------
    npcBlock(x0, y0, x, y) {
      const n = this.npcs;
      for (let i = 0; i < n.length; i++) {
        const o = n[i];
        if (Math.abs(x - o.x) < 9 && Math.abs(y - o.y) < 5 && !(Math.abs(x0 - o.x) < 9 && Math.abs(y0 - o.y) < 5)) return true;
      }
      return false;
    }
    free(x0, y0, x, y) { return this.map.canMove(x0, y0, x, y) && !this.npcBlock(x0, y0, x, y); }

    update(dt) {
      const I = TH.input, c = this.clock;
      this.dt = dt;
      if (this.epochFlash > 0) this.epochFlash = Math.max(0, this.epochFlash - dt * 4);
      TH.res.update(dt);
      if (this.trans) { this.updateTransition(dt); this.tick(dt, false); return; }
      // rueda de Resonancias abierta: el mundo se detiene
      if (TH.res.wheel) { TH.res.updateWheel(this, dt); return; }
      if (this.resSeq) { if (this.resSeq.next().done) this.resSeq = null; this.tick(dt, false); return; }
      if (I.pressed('menu')) { TH.scenes.push('menu', { owner: this }); return; }
      if (I.pressed('res')) { TH.res.toggleWheel(this); return; }
      if (I.pressed('epoch') && this.epochs) this.switchEpoch();
      // B: pulsación corta = usar la Resonancia; mantener = correr
      if (I.pressed('b')) this.bT = 0;
      if (this.bT != null) {
        if (I.down('b')) { this.bT += dt; if (this.bT > 0.22) this.bT = null; }
        else { this.bT = null; if (this.leader.state === 'walk') { TH.res.use(this); if (this.resSeq) { this.tick(dt, false); return; } } }
      }
      if (I.pressed('fps')) TH.ui.toggleFps();
      if (I.pressed('time')) c.hour = (c.hour + 1) % 24;
      if (I.pressed('swap') && this.leader.state === 'walk') {
        if (this.count < 2) TH.ui.toast(this.leader.def.name + ' aún viaja solo');
        else this.swapLeader();
      }
      if (I.pressed('a') && this.leader.state === 'walk') {
        if (this.talkTarget) { if (this.interact(this.talkTarget)) return; }
        else if (this.foes && this.foes.length) { this.leader.state = 'strike'; this.leader.strikeT = 0; this.leader.sframe = 0; this.leader.speed = 0; }
      }
      this.tick(dt, true);
      this.checkExits();
      this.ready = true;
    }
    checkExits() {
      const p = this.leader;
      if (p.state !== 'walk' || this.trans) return;
      const c = p.x / TS, r = p.y / TS;
      const F = TH.flags;
      for (const ex of this.map.def.exits || []) {
        const [x, y, w, h] = ex.rect;
        if (!(c >= x && c < x + w && r >= y && r < y + h)) continue;
        if (ex.if && !F.test(ex.if)) {
          // paso cerrado: mensaje (o escena) y un paso atrás
          if (!this.blockedT || this.blockedT < TH.time) {
            this.blockedT = TH.time + 1.5;
            const back = { left: [6, 0], right: [-6, 0], up: [0, 6], down: [0, -6] }[p.dir] || [0, 0];
            if (this.map.canMove(p.x, p.y, p.x + back[0], p.y + back[1])) { p.x += back[0]; p.y += back[1]; }
            if (ex.script) TH.cutscene.play(ex.script, { skippable: false });
            else TH.ui.toast(ex.msg || 'No puedes pasar por aquí todavía');
          }
          return;
        }
        this.changeZone(ex.to, ex.entry); return;
      }
      // zonas que disparan una escena al pisarlas (solo con el mapa en primer plano: si no, la escena se perdía
      // y el flag «once» quedaba marcado, bloqueando la historia; pasaba al cargar partida)
      if (TH.scenes.top() !== this) return;
      for (const tg of this.map.def.triggers || []) {
        const [x, y, w, h] = tg.rect;
        if (!(c >= x && c < x + w && r >= y && r < y + h)) continue;
        if (tg.once && F.get(tg.once)) continue;
        if (tg.if && !F.test(tg.if)) continue;
        if (tg.pz && !(this.puzzle && this.puzzle.expr(tg.pz))) continue;
        if (tg.once) F.set(tg.once);
        TH.cutscene.play(tg.script, { skippable: tg.skippable !== false, cinematic: !!tg.cinematic });
        return;
      }
    }
    // A delante de algo: NPC, cofre, cartel, brillo o barca
    interact(t) {
      const F = TH.flags, play = (script, o) => TH.cutscene.play(script, Object.assign({ skippable: false }, o || {}));
      if (t.pzo) return this.puzzle.interact(this, t.pzo);
      if (t.npc) { const script = (TH.data.talk || {})[t.key]; return script ? play(script, { npc: t }) : false; }
      const e = t.e;
      if (t.kind === 'chest') {
        F.set('cofre.' + e.id); TH.sfx('chest');
        t.inst.v = 1;
        for (let i = 0; i < 8; i++) TH.particles.spawn(PK().SPARK, t.x + (Math.random() - 0.5) * 10, t.inst.sy - 8, (Math.random() - 0.5) * 20, -20 - Math.random() * 20, 0.8, Math.random() * 6);
        return play([{ wait: 0.25 }, { give: e.give, n: e.n }]);
      }
      if (t.kind === 'pickup') {
        F.set('rec.' + e.id);
        return play([{ give: e.give, n: e.n }]);
      }
      if (t.kind === 'sign') return play(e.script ? (TH.data.scripts || {})[e.script] || [] : [{ say: 'none', name: e.name || 'Cartel', t: e.text }]);
      if (t.kind === 'boat') return play([{ choice: [{ t: 'Zarpar', then: [{ world: e.port }] }, { t: 'Ahora no' }], t: e.text || 'La barca se mece junto al muelle. ¿Zarpar?' }]);
      return false;
    }

    // simulación del mundo; control=false durante las cinemáticas
    tick(dt, control) {
      const c = this.clock, t = (TH.time += dt);
      c.hour += dt * HOUR_RATE * c.speed;
      if (c.hour >= 24) { c.hour -= 24; c.day++; }
      this.wind = 0.55 + 0.35 * Math.sin(t * 0.35) + 0.15 * Math.sin(t * 1.3);

      const p = this.leader;
      if (!this.battle) {
        // durante un combate, la escena de combate mueve a los personajes
        if (control) {
          const L = this.leader, ox = L.x, oy = L.y;
          this.updateLeader(dt);
          this.stepD = (this.stepD || 0) + Math.hypot(L.x - ox, L.y - oy);
          if (this.stepD > 13) { this.stepD = 0; if (L.state === 'walk') TH.sfx('step'); }
        }
        else if (p.state === 'walk') p.z += (this.map.zAt(p.x, p.y) - p.z) * Math.min(1, dt * 16);
        this.record(false);
        this.placeFollowers(dt);
        const n = this.count;
        for (let k = 0; k < n; k++) { const a = this.party[k]; this.pose(a, t); TH.chars.updateChains(a, dt, this.wind); }
        if (this.puzzle) this.puzzle.update(dt, this);
      }
      this.updateNpcs(dt, t);
      if (this.safeT > 0) this.safeT -= dt;
      this.updateFoes(dt, t, control && !this.battle);
      this.talkTarget = control ? this.findTalk() : null;

      // cámara: sigue al líder o a lo que fije la cinemática
      const L = this.camLock;
      if (L) { if (L.def) TH.camera.follow(L.x, L.y - L.z * HZ - 8, dt); }
      else TH.camera.follow(p.x, p.y - p.z * HZ - 8, dt);
      this.map.zoneTint(p.x, p.y, this.tint);
      TH.lighting.setTime(c.hour, this.tint);
      const dk = this.map.def.dark;
      if (dk) { const L = TH.lighting; L.night = Math.max(L.night, dk); L.day *= 1 - dk; L.golden *= 1 - dk; }
      this.emit(dt);
      TH.particles.update(dt, t, this.wind);
      // fundido residual al terminar una cinemática
      if (!this.inCutscene && this.fadeA > 0) this.fadeA = Math.max(0, this.fadeA - dt * 2.5);

      if (control) {
        this.saveT += dt;
        if (this.saveT > 20) { this.saveT = 0; this.saveGame(); }
      }
    }

    // ---------- enemigos en el mapa: patrulla, persecución y contacto ----------
    spawnFoes(def) {
      this.foes = (def.foes || []).filter((e) => (!e.once || !TH.flags.get(e.once)) && (!e.if || TH.flags.test(e.if))).map((e, i) => {
        const D = TH.data.enemies[e.group[0]];
        const pts = (e.patrol || [[e.c, e.r]]).map(([c, r]) => ({ x: c * TS + 8, y: r * TS + 10 }));
        return { enemy: true, def: {}, fid: i, group: e.group, sprite: D.sprite, flying: !!D.flying, x: pts[0].x, y: pts[0].y, z: 0, hx: pts[0].x, hy: pts[0].y, pts, pi: 0,
          state: 'patrol', wait: 0, dir: 'left', anim: 'idle', frame: 0, alive: true, hidden: false, sight: (e.sight || 4.5) * TS, phase: i * 1.7, alertT: 0,
          static: !!e.static, scale: D.scale || 1, once: e.once || null, fullHeal: !!e.fullHeal, boss: !!D.boss, tips: e.tips || null, after: e.after || null, before: e.before || null };
      });
    }
    updateFoes(dt, t, active) {
      const p = this.leader, m = this.map;
      for (const f of this.foes || []) {
        if (!f.alive) continue;
        f.z = m.zAt(f.x, f.y);
        f.frame = Math.floor(t * (f.state === 'chase' ? 9 : 5) + f.phase) % 4;
        f.sy = f.y - f.z * HZ - (f.flying ? 9 + Math.sin(t * 3 + f.phase) * 2 : 0);
        f.shadowY = f.y - f.z * HZ;
        f.sort = f.y;
        if (!active || f.hidden) continue;
        const dx = p.x - f.x, dy = p.y - f.y, d = Math.hypot(dx, dy), same = Math.abs(p.z - f.z) < 0.6;
        // guardianes inmóviles: el combate empieza al acercarse
        if (f.static) { f.dir = 'left'; if (d < 30 && same && this.safeT <= 0 && p.state === 'walk') { this.startBattle(f, false); return; } continue; }
        if (f.alertT > 0) { f.alertT -= dt; if (f.alertT <= 0) f.state = 'chase'; continue; }
        const ahead = (dx < 0) === (f.dir === 'left') || Math.abs(dx) < 10 || d < 1.4 * TS;
        if (f.state !== 'chase' && same && d < f.sight && ahead && this.safeT <= 0) { f.alertT = 0.45; f.alert = 0.8; f.dir = dx < 0 ? 'left' : 'right'; continue; }
        let tx, ty, sp;
        if (f.state === 'chase') {
          tx = p.x; ty = p.y; sp = f.flying ? 58 : 48;
          if (d > f.sight * 1.9 || Math.hypot(f.x - f.hx, f.y - f.hy) > 9 * TS || !same) f.state = 'return';
          if (d < 12 && same && this.safeT <= 0 && p.state === 'walk') {
            const fx = p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0, fy = p.dir === 'up' ? -1 : p.dir === 'down' ? 1 : 0;
            const back = d > 0.1 && ((f.x - p.x) * fx + (f.y - p.y) * fy) / d < -0.3;
            this.startBattle(f, false, back);
            return;
          }
        } else if (f.state === 'return') {
          tx = f.hx; ty = f.hy; sp = 30;
          if (Math.hypot(tx - f.x, ty - f.y) < 2) f.state = 'patrol';
        } else {
          if (f.wait > 0) { f.wait -= dt; if (!f.flipped && f.wait < 0.5) { f.flipped = true; f.dir = f.dir === 'left' ? 'right' : 'left'; } continue; }
          f.flipped = false;
          const q = f.pts[f.pi]; tx = q.x; ty = q.y; sp = 18;
          if (Math.hypot(tx - f.x, ty - f.y) < 1.5) { f.pi = (f.pi + 1) % f.pts.length; f.wait = 0.8 + Math.random(); continue; }
        }
        const ex = tx - f.x, ey = ty - f.y, dd = Math.hypot(ex, ey);
        if (dd < 0.5) continue;
        const s2 = Math.min(dd, sp * dt), vx = (ex / dd) * s2, vy = (ey / dd) * s2;
        if (m.canMove(f.x, f.y, f.x + vx, f.y)) f.x += vx;
        if (m.canMove(f.x, f.y, f.x, f.y + vy)) f.y += vy;
        if (Math.abs(vx) > 0.05) f.dir = vx < 0 ? 'left' : 'right';
      }
    }
    startBattle(f, advantage, ambush) {
      if (this.battle || TH.scenes.top() !== this) return;
      this.leader.state = 'walk';
      if (f.boss) { advantage = false; ambush = false; }
      // demo del jefe: el grupo entra al combate con la vida y el PM al máximo
      if (f.fullHeal) TH.party.healAll();
      TH.scenes.push('battle', { owner: this, foe: f, advantage, ambush: !!ambush });
    }

    // lo más cercano con lo que se puede interactuar, de frente
    findTalk() {
      const p = this.leader;
      if (p.state !== 'walk') return null;
      const fx = p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0, fy = p.dir === 'up' ? -1 : p.dir === 'down' ? 1 : 0;
      let best = null, bd = 1e9;
      const test = (o, x, y, z, reach) => {
        const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy);
        if (d >= reach || d >= bd || Math.abs(z - p.z) > 0.6) return;
        if ((dx * fx + dy * fy) / (d || 1) < 0.4) return;
        best = o; bd = d;
      };
      for (const n of this.npcs) if ((TH.data.talk || {})[n.key]) test(n, n.x, n.y, n.z, n.reach);
      const F = TH.flags;
      for (const t of this.map.things) {
        if (t.kind === 'chest' && F.get('cofre.' + t.e.id)) continue;
        if (t.kind === 'pickup' && F.get('rec.' + t.e.id)) continue;
        test(t, t.x, t.y, t.kind === 'boat' ? p.z : t.z, t.e.reach || (t.kind === 'pickup' ? 18 : 24));
      }
      if (this.puzzle) for (const o of this.puzzle.interactables(this)) test(o, o.x, o.y, o.z, 24);
      return best;
    }
    toScreen(x, y) {
      const cam = TH.camera, z = this.zoom, o = this.sp;
      o.x = (x - cam.rx - W / 2) * z + W / 2;
      o.y = (y - cam.ry - H / 2) * z + H / 2;
      return o;
    }
    // grupo: 'solo' (solo el líder) o 'full'; lead fuerza quién va delante (siempre dentro de los que viajan)
    setParty(mode, lead) {
      const was = this.count;
      if (mode === 'solo') this.count = 1; else if (mode === 'full') this.count = 4;
      if (lead) this.setLead(lead);
      if (was < this.count) this.regroup();
    }
    // fija exactamente quién viaja (en orden; el primero lidera)
    setRoster(ids, lead) {
      ids = ids.filter((id) => TH.chars.defs[id]);
      if (!ids.length) return;
      const p = this.leader, x = p.x, y = p.y, z = p.z, dir = p.dir;
      const rest = TH.chars.PARTY.filter((id) => ids.indexOf(id) < 0);
      const was = this.count;
      this.order = ids.concat(rest);
      this.count = ids.length;
      this.party.forEach((a, i) => setDef(a, this.order[i]));
      Object.assign(this.leader, { x, y, z, dir });
      if (lead) this.setLead(lead);
      if (this.count !== was) this.regroup();
    }
    join(id) { const r = this.members(); if (r.indexOf(id) < 0) this.setRoster(r.concat([id]), r[0]); }
    leave(id) { const r = this.members().filter((m) => m !== id); if (r.length) this.setRoster(r, r[0]); }
    setLead(lead) {
      const k = this.order.indexOf(lead);
      if (k < 0 || k >= this.count || k === 0) return;
      const p = this.leader, x = p.x, y = p.y, z = p.z, dir = p.dir;
      const head = this.order.slice(0, this.count);
      while (head[0] !== lead) head.push(head.shift());
      this.order = head.concat(this.order.slice(this.count));
      this.party.forEach((a, i) => setDef(a, this.order[i]));
      Object.assign(this.leader, { x, y, z, dir });
    }
    regroup() { this.seedHistory(); this.placeFollowers(0); for (const a of this.party) a.chainsReady = false; }

    swapLeader() {
      if (this.count < 2) return;
      const p0 = this.leader, x = p0.x, y = p0.y, z = p0.z, dir = p0.dir;
      const head = this.order.slice(0, this.count);
      head.push(head.shift());
      this.order = head.concat(this.order.slice(this.count));
      this.party.forEach((a, i) => setDef(a, this.order[i]));
      Object.assign(this.leader, { x, y, z, dir });
      const p = this.leader, K = PK();
      for (let i = 0; i < 6; i++) TH.particles.spawn(K.PUFF, p.x + (Math.random() - 0.5) * 10, p.y - p.z * HZ, (Math.random() - 0.5) * 16, -4 - Math.random() * 4, 0.45, 0, 0);
      TH.ui.toast(p.def.name + ' lidera el grupo');
    }

    // ---------- líder: andar, saltar, trepar ----------
    updateLeader(dt) {
      const I = TH.input, p = this.leader, m = this.map, A = this.act;
      I.axis(this.axis);
      const ax = this.axis.x, ay = this.axis.y, mag = Math.hypot(ax, ay);

      if (p.state === 'strike') {
        // estocada: si alcanza a un enemigo antes de que te toque, el combate empieza con ventaja
        p.strikeT += dt;
        p.sframe = p.strikeT < 0.08 ? 0 : p.strikeT < 0.22 ? 1 : 2;
        if (p.sframe === 1 && !p.struck) {
          const fx = p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0, fy = p.dir === 'up' ? -1 : p.dir === 'down' ? 1 : 0;
          for (const f of this.foes) {
            if (!f.alive || f.hidden) continue;
            const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy);
            if (d < 30 && (d < 12 || (dx * fx + dy * fy) / d > 0.3) && Math.abs(f.z - p.z) < 0.6) {
              p.struck = true;
              for (let i = 0; i < 8; i++) TH.particles.spawn(PK().SPARK, f.x + (Math.random() - 0.5) * 8, f.y - f.z * HZ - 12, (Math.random() - 0.5) * 50, -30 - Math.random() * 30, 0.5, Math.random() * 6);
              const behind = (f.dir === 'left' && p.x > f.x + 2) || (f.dir === 'right' && p.x < f.x - 2);
              this.startBattle(f, behind || f.state === 'patrol' || f.state === 'return');
              break;
            }
          }
        }
        if (p.strikeT >= 0.32) { p.state = 'walk'; p.struck = false; }
        return;
      }

      if (p.state === 'jump') {
        A.t += dt;
        const k = Math.min(1, A.t / A.dur);
        p.x = U.lerp(A.x0, A.x1, k); p.y = U.lerp(A.y0, A.y1, k);
        const kz = A.up ? 1 - (1 - k) * (1 - k) : k * k; // sube pronto, cae tarde
        p.z = U.lerp(A.z0, A.z1, kz);
        p.arc = Math.sin(Math.PI * k) * A.h;
        p.frame = k < 0.14 ? 0 : k < 0.55 ? 1 : 2;
        p.dist += Math.hypot(A.x1 - A.x0, A.y1 - A.y0) * dt / A.dur;
        if (k >= 1) { p.state = 'walk'; p.arc = 0; p.z = A.z1; this.landPuff(p); }
        return;
      }
      if (p.state === 'climb') {
        p.dir = 'up';
        p.x += (A.cx - p.x) * Math.min(1, dt * 14);
        const v = ay < -0.3 ? 1 : ay > 0.3 ? -1 : 0;
        p.z += v * CLIMB_SP * dt;
        p.dist += Math.abs(v) * CLIMB_SP * HZ * dt;
        if (p.z >= A.zHi) { p.z = A.zHi; p.state = 'hang'; A.t = 0; A.next = 'up'; }
        else if (p.z <= A.zLo) { p.z = A.zLo; p.state = 'walk'; p.y = A.yLow + 1; p.dir = 'down'; }
        return;
      }
      if (p.state === 'hang') {
        A.t += dt;
        if (A.t > 0.22) {
          if (A.next === 'up') { p.state = 'mantle'; A.t = 0; A.y0 = p.y; A.y1 = A.yHi; A.after = 'walk'; }
          else p.state = 'climb';
        }
        return;
      }
      if (p.state === 'mantle') {
        A.t += dt;
        const k = Math.min(1, A.t / 0.2);
        p.y = U.lerp(A.y0, A.y1, U.smooth(k));
        p.arc = Math.sin(Math.PI * k) * 2;
        if (k >= 1) {
          p.arc = 0;
          if (A.after === 'walk') { p.state = 'walk'; p.z = A.zHi; }
          else { p.state = 'hang'; A.t = 0; A.next = 'down'; }
        }
        return;
      }

      // --- andar ---
      const run = I.down('b') || I.joyRun;
      let blockedY = false;
      if (mag > 0.08) {
        const sp = (run ? RUN_SP : WALK_SP) * Math.min(1, mag * 1.25) * dt;
        const x0 = p.x, y0 = p.y;
        const nx = p.x + ax * sp;
        if (this.free(p.x, p.y, nx, p.y)) p.x = nx;
        const ny = p.y + ay * sp;
        if (this.free(p.x, p.y, p.x, ny)) p.y = ny;
        else {
          blockedY = true;
          // deslizar por esquinas y bordes de escalera: prueba un pequeño desvío lateral
          if (Math.abs(ax) < 0.5) for (const s of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
            if (this.free(p.x, p.y, p.x + s, ny) && this.free(p.x, p.y, p.x + Math.sign(s), p.y)) { p.x += Math.sign(s) * Math.min(1, sp); break; }
          }
        }
        if (p.x === x0 && Math.abs(ax) > 0.5 && Math.abs(ay) < 0.5) {
          for (const s of [1, -1, 2, -2, 3, -3]) {
            if (this.free(p.x, p.y, nx, p.y + s) && this.free(p.x, p.y, p.x, p.y + Math.sign(s))) { p.y += Math.sign(s) * Math.min(1, sp); break; }
          }
        }
        if (Math.abs(ax) > Math.abs(ay) * 1.1) p.dir = ax < 0 ? 'left' : 'right';
        else p.dir = ay < 0 ? 'up' : 'down';
        const moved = Math.hypot(p.x - x0, p.y - y0);
        p.dist += moved;
        p.speed = moved / dt;
        if (run && moved > 0) this.runPuff(p, ax, dt);
      } else p.speed = 0;
      const tz = m.zAt(p.x, p.y);
      p.z += (tz - p.z) * Math.min(1, dt * 16);
      if (Math.abs(tz - p.z) < 0.02) this.safe = { x: p.x, y: p.y };

      // empujar contra un borde marcado: salto o enredadera
      const vert = Math.abs(ay) > 0.55 && Math.abs(ax) < 0.75;
      if (blockedY && vert) {
        this.push += dt;
        if (this.push > 0.07 && this.tryEdge(ay > 0)) this.push = 0;
      } else this.push = 0;
    }

    tryEdge(down) {
      const p = this.leader, m = this.map, A = this.act;
      const c = Math.floor(p.x / TS), r = Math.floor(p.y / TS);
      if (down) {
        const h = m.hh(c, r), hl = m.hh(c, r + 1);
        if (hl >= h || m.isStair(c, r)) return false;
        if (m.jumpAt(c, r)) {
          const y1 = (r + 1) * TS + 7;
          if (!this.free(p.x, y1, p.x, y1)) return false;
          return this.startJump(p.x, y1, h, hl, false);
        }
        if (m.vineAt(c, r) && Math.abs(p.x - (c * TS + 8)) < 7) {
          Object.assign(A, { cx: c * TS + 8, zLo: hl, zHi: h, yLow: (r + 1) * TS + 2, yHi: r * TS + 10, t: 0, y0: p.y, y1: (r + 1) * TS + 2, after: 'hang' });
          p.state = 'mantle'; p.dir = 'up'; p.speed = 0;
          return true;
        }
        return false;
      }
      // hacia arriba: el tile alto está al norte
      const ru = r - 1, h = m.hh(c, r), hu = m.hh(c, ru);
      if (hu <= h || m.isStair(c, r)) return false;
      if (m.jumpAt(c, ru) && hu === h + 1) {
        const y1 = ru * TS + 10;
        if (!m.canMove(p.x, y1, p.x, y1) || this.npcBlock(p.x, y1, p.x, y1)) return false;
        return this.startJump(p.x, y1, h, hu, true);
      }
      if (m.vineAt(c, ru) && Math.abs(p.x - (c * TS + 8)) < 7) {
        Object.assign(A, { cx: c * TS + 8, zLo: h, zHi: hu, yLow: r * TS + 2, yHi: ru * TS + 10, t: 0 });
        p.state = 'climb'; p.dir = 'up'; p.y = r * TS + 2; p.speed = 0;
        return true;
      }
      return false;
    }
    startJump(x1, y1, z0, z1, up) {
      const p = this.leader;
      Object.assign(this.act, { t: 0, dur: JUMP_T + Math.abs(z1 - z0 - (up ? 0 : 1)) * 0.08, x0: p.x, y0: p.y, x1, y1, z0: p.z, z1, up, h: up ? 7 : 9 });
      p.state = 'jump'; p.frame = 0; p.speed = 0;
      return true;
    }
    landPuff(p) {
      const K = PK(), y = p.y - p.z * HZ;
      for (let i = 0; i < 5; i++) TH.particles.spawn(K.PUFF, p.x + (i - 2) * 3, y, (i - 2) * 9, -3 - Math.random() * 3, 0.45, 0, this.map.t(Math.floor(p.x / TS), Math.floor(p.y / TS)) === 's' ? 1 : 0);
    }
    runPuff(p, ax, dt) {
      this.em.puff += dt;
      if (this.em.puff < 0.12) return;
      this.em.puff = 0;
      const t = this.map.t(Math.floor(p.x / TS), Math.floor(p.y / TS));
      if (t === 's' || t === 'p') TH.particles.spawn(PK().PUFF, p.x + (Math.random() - 0.5) * 4, p.y - p.z * HZ, -ax * 6, -2, 0.5, 0, t === 's' ? 1 : 0);
    }

    // ---------- NPCs ----------
    updateNpcs(dt, t) {
      const m = this.map, p = this.leader, cam = TH.camera;
      for (let i = 0; i < this.npcs.length; i++) {
        const n = this.npcs[i];
        const dx = p.x - n.x, dy = p.y - n.y, near = Math.hypot(dx, dy) < 28;
        if (n.scripted) {
          n.z += (m.zAt(n.x, n.y) - n.z) * Math.min(1, dt * 16);
          this.pose(n, t);
          TH.chars.updateChains(n, dt, this.wind);
          continue;
        }
        n.speed = 0;
        if (near) {
          n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
          n.wait = Math.max(n.wait, 0.8);
        } else if (n.ai === 'wander') {
          if (n.wait > 0) n.wait -= dt;
          else {
            const ex = n.tx - n.x, ey = n.ty - n.y, d = Math.hypot(ex, ey);
            if (d < 1.5) { n.wait = 1.5 + Math.random() * 3; this.pickTarget(n); }
            else {
              const s = Math.min(d, 24 * dt), vx = (ex / d) * s, vy = (ey / d) * s;
              const ok = m.canMove(n.x, n.y, n.x + vx, n.y + vy) && Math.hypot(p.x - n.x - vx, p.y - n.y - vy) > 12;
              if (ok) { n.x += vx; n.y += vy; n.dist += s; n.speed = s / dt; n.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down'; }
              else { n.wait = 0.6 + Math.random(); this.pickTarget(n); }
            }
          }
        } else if (n.wait > 0) { n.wait -= dt; if (n.wait <= 0) n.dir = n.homeDir; }
        n.z += (m.zAt(n.x, n.y) - n.z) * Math.min(1, dt * 16);
        // solo se animan las cadenas de los que están cerca de la pantalla
        this.pose(n, t);
        if (n.x > cam.x - 40 && n.x < cam.x + W + 40 && n.y > cam.y - 40 && n.y < cam.y + H + 60) TH.chars.updateChains(n, dt, this.wind);
      }
    }
    pickTarget(n) {
      for (let k = 0; k < 6; k++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * n.radius;
        const tx = n.hx + Math.cos(a) * r, ty = n.hy + Math.sin(a) * r;
        if (this.map.canMove(tx, ty, tx, ty) && this.map.zAt(tx, ty) === this.map.zAt(n.hx, n.hy)) { n.tx = tx; n.ty = ty; return; }
      }
      n.tx = n.hx; n.ty = n.hy;
    }

    // ---------- emisores de partículas ----------
    emit(dt) {
      const P = TH.particles, K = P.K, L = TH.lighting, cam = TH.camera, m = this.map, e = this.em;
      const cx = cam.x, cy = cam.y;
      // ambiente propio del mapa (o de la época): copos detenidos, burbujas, motas doradas
      const ep = this.puzzle && this.puzzle.epoch, dEp = ep && m.def.epochs && m.def.epochs[ep], amb = (dEp && dEp.ambient) || m.def.ambient;
      if (amb) {
        const AK = { flake: K.FLAKE, bubble: K.BUBBLE, mote: K.MOTE, ember: K.MOTE, lantern: K.MOTE }[amb], cap = amb === 'flake' ? 90 : amb === 'lantern' ? 14 : 50;
        e.amb = (e.amb || 0) + dt * (amb === 'flake' ? 30 : amb === 'lantern' ? 1.2 : 12);
        while (e.amb > 1) {
          e.amb -= 1;
          if (P.count[AK] >= cap) continue;
          const x = cx + Math.random() * W, y = cy + Math.random() * (H + 30);
          if (amb === 'flake') P.spawn(K.FLAKE, x, y, 0, 0, 4 + Math.random() * 5, Math.random() * 6, Math.random() < 0.2 ? 1 : 0);
          else if (amb === 'lantern') P.spawn(AK, x, cy + H + 4, (Math.random() - 0.5) * 3, -6 - Math.random() * 5, 14 + Math.random() * 8, Math.random() * 6, 3);
          else if (amb === 'ember') P.spawn(AK, x, y, 0, -10 - Math.random() * 14, 3 + Math.random() * 3, Math.random() * 6, 2);
          else P.spawn(AK, x, y, 0, -4 - Math.random() * 8, 5 + Math.random() * 5, Math.random() * 6, Math.random() < 0.6 ? 1 : 0);
        }
      }
      if (m.def.snow || (dEp && dEp.snow) || m.def.dark) e.leaf = 0;
      // hojas con el viento de día
      e.leaf += dt * (1 - L.night) * (0.8 + this.wind);
      while (e.leaf > 1) { e.leaf -= 1; P.spawn(K.LEAF, cx - 30 + Math.random() * W * 0.9, cy - 6, 6 + Math.random() * 8, 10 + Math.random() * 6, 14, Math.random() * 6, (Math.random() * 4) | 0); }
      // motas de polvo en los rayos
      e.dust += dt * 4 * L.day;
      while (e.dust > 1) { e.dust -= 1; P.spawn(K.DUST, cx + Math.random() * W, cy + Math.random() * H, (Math.random() - 0.5) * 3, -1 - Math.random() * 2, 3 + Math.random() * 2, Math.random() * 6); }
      // luciérnagas de noche sobre la hierba
      if (L.night > 0.3 && P.count[K.FLY] < 26) {
        e.fly += dt * 6;
        while (e.fly > 1) {
          e.fly -= 1;
          const x = cx + Math.random() * W, y = cy + 40 + Math.random() * H;
          const c = Math.floor(x / TS), r = Math.floor(y / TS);
          const t = m.t(c, r);
          if (t === 'g' || t === 'f') P.spawn(K.FLY, x, y - m.hh(c, r) * HZ - 6, 0, 0, 6 + Math.random() * 6, Math.random() * 6);
        }
      }
      // humo, chispas y espuma desde los objetos visibles
      e.smoke += dt; e.spark += dt;
      const doSmoke = e.smoke > 0.4, doSpark = e.spark > 0.07;
      if (doSmoke) e.smoke = 0;
      if (doSpark) e.spark = 0;
      const props = m.props;
      for (let i = 0; i < props.length; i++) {
        const o = props[i], d = o.def;
        if (o.bx1 < cx - 20 || o.bx0 > cx + W + 20 || o.by1 < cy - 40 || o.by0 > cy + H + 40) continue;
        if (doSmoke && d.smoke) P.spawn(K.SMOKE, o.x + d.smoke[0], o.sy + d.smoke[1], (Math.random() - 0.5) * 2, -7 - Math.random() * 3, 2.6, 0, 0);
        if (doSpark && d.sparks) P.spawn(K.SPARK, o.x + d.sparks[0] + (Math.random() - 0.5) * 5, o.sy + d.sparks[1], (Math.random() - 0.5) * 6, -18 - Math.random() * 14, 0.7 + Math.random() * 0.7, Math.random() * 6);
      }
      e.spray += dt * 10;
      while (e.spray > 1) {
        e.spray -= 1;
        const f = m.foam[(Math.random() * m.foam.length) | 0];
        if (!f) break;
        const x = f.c * TS + 8, y = f.r * TS + 8;
        if (x < cx || x > cx + W || y < cy || y > cy + H) continue;
        if (Math.sin(TH.time * 1.6 + f.seed * 6) < 0.6) continue;
        const ex = f.s === 1 ? 7 : f.s === 3 ? -7 : (Math.random() - 0.5) * 14, ey = f.s === 0 ? -7 : f.s === 2 ? 7 : (Math.random() - 0.5) * 14;
        P.spawn(K.SPRAY, x + ex, y + ey, (Math.random() - 0.5) * 10, -14 - Math.random() * 8, 0.6, 0, 0);
      }
    }

    // ---------- pintado ----------
    render(ctx) {
      const cam = TH.camera, z = this.zoom;
      const sx = this.shake ? Math.round((Math.random() * 2 - 1) * this.shake) : 0, sy = this.shake ? Math.round((Math.random() * 2 - 1) * this.shake) : 0;
      const rx = cam.rx, ry = cam.ry;
      cam.rx += sx; cam.ry += sy;
      if (z > 1.001) {
        const g = this.zbuf.g;
        this.renderWorld(g);
        const w = W / z, h = H / z;
        ctx.drawImage(this.zbuf.c, (W - w) / 2, (H - h) / 2, w, h, 0, 0, W, H);
      } else this.renderWorld(ctx);
      cam.rx = rx; cam.ry = ry;
      if (this.epochFlash > 0) { ctx.fillStyle = 'rgba(255,248,225,' + (0.7 * this.epochFlash).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
      if (TH.guide) TH.guide.draw(ctx, this, cam.rx, cam.ry, TH.time, z);
      if (TH.res.wheel && TH.scenes.top() === this) TH.res.drawWheel(ctx, this);
      if (!this.inCutscene && this.fadeA > 0.001) { ctx.globalAlpha = this.fadeA; ctx.fillStyle = this.fadeC; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      TH.ui.clock(this.clock.hour, this.clock.day);
    }
    renderWorld(ctx) {
      const m = this.map, cam = TH.camera, cx = cam.rx, cy = cam.ry, t = TH.time, L = TH.lighting, C = TH.chars;
      // fondo para lo que queda por encima del mapa (copas densas)
      ctx.fillStyle = '#1f4a35';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(-cx, -cy);
      ctx.drawImage(m.water, cx, cy + TH.PAD, W, H, cx, cy, W, H);
      this.drawWater(ctx, cx, cy, t, L);

      // lista visible ordenada por Y: objetos, grupo y NPCs
      const list = this.list;
      list.length = 0;
      for (let i = 0; i < m.props.length; i++) {
        const o = m.props[i];
        if (o.bx1 < cx || o.bx0 > cx + W || o.by1 < cy || o.by0 > cy + H) continue;
        o.sort = o.y;
        list.push(o);
      }
      const nList = list.length;
      const B = this.battle;
      for (let i = 0; i < this.npcs.length; i++) {
        const n = this.npcs[i];
        if (B && Math.abs(n.x - B.center.x) < 110 && Math.abs(n.y - B.center.y) < 70) continue; // fuera del escenario del combate
        if (n.x > cx - 24 && n.x < cx + W + 24 && n.sy > cy - 8 && n.sy < cy + H + 60) list.push(n);
      }
      if (!this.battle) for (let i = this.count - 1; i >= 0; i--) list.push(this.party[i]);

      // reflejos sobre el agua (el suelo los tapa fuera del agua)
      for (let i = 0; i < nList; i++) if (list[i].def.reflect) TH.props.drawReflection(ctx, list[i], t);
      for (let i = nList; i < list.length; i++) {
        const a = list[i];
        if (a.state === 'climb' || a.state === 'hang' || !m.nearWater(a.x, a.y)) continue;
        const gy = a.y - a.z * HZ;
        ctx.save(); ctx.translate(0, gy * 2 + 1); ctx.scale(1, -1);
        C.draw(ctx, a, 0.3);
        ctx.restore();
      }

      ctx.drawImage(m.ground, cx, cy + TH.PAD, W, H, cx, cy, W, H);
      if (this.puzzle) this.puzzle.drawGround(ctx, m, t, cx, cy);
      this.drawTufts(ctx, cx, cy, t);
      this.drawPickups(ctx, t);
      for (const f of this.foes || []) if (f.alive && !f.hidden && f.x > cx - 30 && f.x < cx + W + 30 && f.y > cy - 20 && f.y < cy + H + 50) list.push(f);
      if (this.puzzle) this.puzzle.collect(list, m, cx, cy);

      list.sort((a, b) => a.sort - b.sort);
      const hid = this.hidden;
      hid[0] = hid[1] = hid[2] = hid[3] = false;
      for (let i = 0; i < list.length; i++) {
        const o = list[i];
        if (o.enemy && !o.static && o.alive && (o.state === 'patrol' || o.state === 'return')) {
          // hacia dónde mira: tres marcas en el suelo (de espaldas no te ve)
          const sx = o.dir === 'left' ? -1 : 1, gy = Math.round(o.shadowY != null ? o.shadowY : o.y);
          for (let i = 1; i <= 3; i++) { ctx.globalAlpha = 0.34 - i * 0.08; ctx.fillStyle = '#ffd9a0'; ctx.fillRect(Math.round(o.x + sx * (8 + i * 9)) - 1, gy - 1, 3, 2); }
          ctx.globalAlpha = 1;
        }
        if (o.enemy) { TH.foes.draw(ctx, o); if (o.alertT > 0 || o.alert > 0) this.drawAlert(ctx, o, t); continue; }
        if (o.pzo) { this.puzzle.draw(ctx, o, t); continue; }
        if (o.anim) { C.draw(ctx, o); continue; }
        TH.props.draw(ctx, o, t, this.wind);
        if (!o.def.occluder) continue;
        // ¿tapa este objeto a alguien del grupo? → silueta encima
        for (let k = 0; k < this.count; k++) {
          const a = this.party[k];
          if (o.y > a.y && a.x > o.bx0 + 8 && a.x < o.bx1 - 8 && a.sy - 12 > o.by0 && a.sy - 12 < o.sy - 4) hid[k] = true;
        }
      }
      if (!this.inCutscene) for (let k = this.count - 1; k >= 0; k--) if (hid[k]) C.draw(ctx, this.party[k], k ? 0.28 : 0.4);
      TH.particles.draw(ctx, t);
      ctx.restore();

      // ---- luz ----
      L.begin();
      const n = L.night;
      for (let i = 0; i < list.length; i++) {
        const o = list[i], d = o.def;
        if (o.pzo || o.enemy) continue;
        if (o.anim) {
          if (d.light) L.light(o.x + (o.dir === 'left' ? -d.light.dx : d.light.dx) - cx, o.sy + d.light.dy - cy, d.light.r + Math.sin(t * 8 + i) * 1.5, d.light.c, (0.35 + 0.65 * n) * 0.95);
          continue;
        }
        if (o.lit && !TH.flags.test(o.lit)) continue;
        if (d.lights) {
          for (let k = 0; k < d.lights.length; k++) {
            const li = d.lights[k];
            let a = li.always != null ? U.lerp(li.always, 1, n) : n;
            a *= li.a;
            let r = li.r;
            if (li.flicker) { const f = Math.sin(t * 9 + o.seed * 20) * 0.5 + Math.sin(t * 23 + o.seed * 7) * 0.5; a *= 1 + f * 0.08 * li.flicker; r += f * 2 * li.flicker; }
            L.light(o.x + li.dx - cx, o.sy + li.dy - cy, r, li.c, a);
          }
        }
        if (d.beam && n > 0.12) L.beam(o.x + d.beam.dx - cx, o.sy + d.beam.dy - cy, t * 0.7, 0.55 * n);
      }
      const p = this.leader;
      L.light(p.x - cx, p.sy - 12 - cy, 48, [140, 190, 255], 0.45 * n);
      if (this.puzzle) this.puzzle.lights(L, cx, cy, n, t);
      L.apply(ctx);
      ctx.save(); ctx.translate(-cx, -cy); TH.res.draw(ctx, t); ctx.restore();

      // ---- emisivos: ventanas, linternas, haz ----
      if (n > 0.05) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < list.length; i++) {
          const o = list[i];
          if (o.anim || o.pzo || o.enemy || !o.def.emissive || (o.lit && !TH.flags.test(o.lit))) continue;
          const em = o.def.emissive;
          ctx.globalAlpha = 0.85 * n;
          ctx.fillStyle = '#ffc860';
          for (let k = 0; k < em.length; k++) ctx.fillRect(o.x + em[k].dx - cx, o.sy + em[k].dy - cy, em[k].w, em[k].h);
          if (o.def.beam) {
            ctx.save(); ctx.globalAlpha = 0.12 * n; ctx.translate(o.x + o.def.beam.dx - cx, o.sy + o.def.beam.dy - cy);
            ctx.rotate(t * 0.7); ctx.drawImage(L.beamImg, 0, -35); ctx.rotate(Math.PI); ctx.drawImage(L.beamImg, 0, -35); ctx.restore();
          }
        }
        // farol de Ilun y otras luces de personaje
        ctx.globalAlpha = 0.9 * n;
        ctx.fillStyle = '#ffd890';
        for (let i = 0; i < list.length; i++) {
          const o = list[i];
          if (!o.anim || o.pzo || !o.def.light) continue;
          ctx.fillRect(Math.round(o.x + (o.dir === 'left' ? -o.def.light.dx : o.def.light.dx) - cx) - 1, Math.round(o.sy + o.def.light.dy - cy) - 1, 3, 3);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      TH.particles.glow(ctx, cx, cy, n, L.day);
      if (TH.postfx) { TH.postfx.night = n; TH.postfx.setCloud(m.def.clouds === false || m.def.dark ? 0 : L.day * (m.def.clouds || 1), cx, cy); }
      L.atmosphere(ctx, t);
      L.vignette(ctx);
      if (this.talkTarget) this.drawTalkIcon(ctx, this.talkTarget, cx, cy, t);
    }
    // «!» al descubrirte
    drawAlert(ctx, f, t) {
      f.alert = (f.alert || 0) - 1 / 60;
      const x = Math.round(f.x), y = Math.round(f.sy - 34);
      ctx.fillStyle = '#2a1d3a'; ctx.fillRect(x - 3, y - 7, 7, 10);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 2, y - 6, 5, 8);
      ctx.fillStyle = '#d8402c'; ctx.fillRect(x, y - 5, 1, 4); ctx.fillRect(x, y, 1, 1);
      void t;
    }
    // brillos de objetos recogibles
    drawPickups(ctx, t) {
      const F = TH.flags;
      for (const th of this.map.things) {
        if (th.kind !== 'pickup' || F.get('rec.' + th.e.id)) continue;
        const x = Math.round(th.x), y = Math.round(th.y - th.z * HZ - 2), k = Math.sin(t * 5 + th.x) * 0.5 + 0.5;
        ctx.fillStyle = 'rgba(255,240,180,.35)'; ctx.fillRect(x - 2, y + 2, 5, 1);
        ctx.fillStyle = '#fff6d0'; ctx.fillRect(x, y - 1 - Math.round(k * 2), 1, 3 + Math.round(k * 4)); ctx.fillRect(x - 1 - Math.round(k * 2), y + 1, 3 + Math.round(k * 4), 1);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y + 1, 1, 1);
      }
    }
    // bocadillo «…» sobre el NPC con el que se puede hablar
    drawTalkIcon(ctx, n, cx, cy, t) {
      const top = n.npc ? n.sy - (n.big ? 44 : 40) : n.pzo ? n.y - n.z * HZ - 30 : n.inst ? n.inst.sy - n.inst.def.ay - 8 : n.y - n.z * HZ - 14;
      const x = Math.round(n.x - cx), y = Math.round(top - cy + Math.sin(t * 4) * 1.2);
      ctx.fillStyle = '#2a1d3a'; ctx.fillRect(x - 6, y - 5, 13, 9); ctx.fillRect(x - 1, y + 4, 3, 2);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 5, y - 4, 11, 7); ctx.fillRect(x, y + 3, 1, 2);
      ctx.fillStyle = '#e8b84a'; ctx.fillRect(x - 3, y - 1, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x + 3, y - 1, 1, 1);
    }

    drawWater(ctx, cx, cy, t, L) {
      const m = this.map;
      const c0 = Math.max(0, Math.floor(cx / TS)), c1 = Math.min(m.w - 1, Math.floor((cx + W) / TS));
      const r0 = Math.max(0, Math.floor(cy / TS)), r1 = Math.min(m.h - 1, Math.floor((cy + H) / TS) + 1);
      const sparkle = 1 - L.night * 0.7;
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (m.ter[r * m.w + c] !== '~') continue;
          const x = c * TS, y = r * TS, seed = U.rnd(c, r, 42), d = m.depth[r * m.w + c];
          for (let k = 0; k < 2; k++) {
            const a = Math.sin(t * 1.7 + seed * 6 + k * 2.2);
            if (a < 0.15) continue;
            const ly = y + 3 + k * 7 + ((seed * 9) | 0) % 3;
            const off = ((((t * 6 * (k ? 1 : -1) + seed * 16) % 16) + 16) % 16) | 0;
            ctx.fillStyle = a > 0.65 ? (d > 2 ? '#7fcbdc' : '#b5eef2') : d > 2 ? '#4ea7c0' : '#86d6dc';
            ctx.fillRect(x + off, ly, Math.min(4, 16 - off), 1);
            if (off > 12) ctx.fillRect(x, ly, off - 12, 1);
          }
          if (Math.sin(t * 3.1 + seed * 40) > 0.97) { ctx.globalAlpha = sparkle; ctx.fillStyle = '#ffffff'; ctx.fillRect(x + ((seed * 13) | 0), y + ((seed * 77) % 14 | 0), 1, 1); ctx.globalAlpha = 1; }
        }
      }
      // espuma de orilla que avanza y retrocede
      const f = m.foam;
      for (let i = 0; i < f.length; i++) {
        const s = f[i];
        const x = s.c * TS, y = s.r * TS;
        if (x + TS < cx || x > cx + W || y + TS < cy || y > cy + H) continue;
        const wv = (Math.sin(t * 1.5 + s.seed * 6) + 1) * 1.2;
        for (let k = 0; k < 16; k += 2) {
          const on = Math.sin(k * 0.8 + t * 2.4 + s.seed * 9) > -0.25;
          if (!on) continue;
          const o1 = wv | 0, o2 = (wv + 2.5) | 0;
          ctx.fillStyle = '#e8fbff';
          if (s.s === 0) ctx.fillRect(x + k, y + o1, 2, 1);
          else if (s.s === 2) ctx.fillRect(x + k, y + 15 - o1, 2, 1);
          else if (s.s === 3) ctx.fillRect(x + o1, y + k, 1, 2);
          else ctx.fillRect(x + 15 - o1, y + k, 1, 2);
          ctx.fillStyle = 'rgba(232,251,255,.45)';
          if (s.s === 0) ctx.fillRect(x + k + 1, y + o2, 1, 1);
          else if (s.s === 2) ctx.fillRect(x + k + 1, y + 15 - o2, 1, 1);
          else if (s.s === 3) ctx.fillRect(x + o2, y + k + 1, 1, 1);
          else ctx.fillRect(x + 15 - o2, y + k + 1, 1, 1);
        }
      }
    }

    drawTufts(ctx, cx, cy, t) {
      const m = this.map, X = m.tuftX, Y = m.tuftY, P = m.tuftP, Hh = m.tuftH, n = X.length, w = this.wind;
      const T = TH.tiles;
      for (let i = 0; i < n; i++) {
        const x = X[i], y = Y[i];
        if (x < cx - 4 || x > cx + W + 4 || y < cy - 4 || y > cy + H + 8) continue;
        const sway = Math.sin(t * 2.2 + P[i] + x * 0.05) * w * 1.6;
        const h = Hh[i];
        for (let b = 0; b < 3; b++) {
          const bx = x + b * 2 - 2;
          const top = Math.round(sway * (0.6 + b * 0.2));
          ctx.fillStyle = T.G0; ctx.fillRect(bx, y, 1, 1);
          ctx.fillStyle = T.G1; ctx.fillRect(bx + (top >> 1), y - (h >> 1), 1, (h >> 1) + 1);
          ctx.fillStyle = b === 1 ? T.G3 : T.G2; ctx.fillRect(bx + top, y - h, 1, (h >> 1));
        }
      }
    }
  }
  TH.MapScene = MapScene;
})();
