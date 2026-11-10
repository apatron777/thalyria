// Motor de cinemáticas: ejecuta guiones de datos sobre la escena del mapa.
// Cada paso es un objeto cuya primera clave conocida es la orden, p. ej. {say:'mira', e:'happy', t:'¡Hola!'}.
// B (mantener) acelera ×4 · Esc o el botón «Saltar» dos veces salta la escena hasta su estado final.
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, TS = 16, HZ = TH.HZ, W = TH.W, H = TH.H;
  const OPS = ['despawn', 'scene', 'say', 'narrate', 'choice', 'if', 'set', 'add', 'call', 'end', 'move', 'face', 'place', 'cam', 'zoom', 'fade', 'hour', 'shake', 'wait', 'emote',
    'bars', 'banner', 'toast', 'party', 'dream', 'orb', 'release',
    'give', 'shop', 'inn', 'sleep', 'world', 'heal', 'zone',
    'join', 'leave', 'roster', 'battle', 'refresh', 'warp', 'equip', 'save', 'flash', 'music', 'chapter', 'level', 'clock', 'cine'];
  const opOf = (c) => { for (const k in c) if (OPS.indexOf(k) >= 0) return k; return null; };
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

  // tarea temporizada genérica: f(k) con k de 0 a 1
  function timed(time, f) {
    let t = 0;
    return {
      step(dt) { t += dt; const k = time > 0 ? Math.min(1, t / time) : 1; f(k); return k >= 1; },
      finish() { f(1); },
    };
  }

  class CutsceneScene extends TH.Scene {
    constructor() {
      super();
      this.transparent = true;
      this.stars = new Float32Array(70 * 3);
      for (let i = 0; i < 70; i++) { this.stars[i * 3] = U.rnd(i, 1, 3) * W; this.stars[i * 3 + 1] = U.rnd(i, 2, 3) * 140; this.stars[i * 3 + 2] = U.rnd(i, 3, 3) * 6.28; }
      this.glow = null;
    }
    enter(d) {
      const o = (this.owner = d.owner);
      this.stack = [{ list: d.script || [], i: 0 }];
      this.tasks = [];
      this.cur = null;
      this.skip = false;
      this.armed = 0;
      this.skippable = d.skippable !== false;
      this.cinematic = !!d.cinematic;
      this.npc = d.npc || null;
      this.onEnd = d.onEnd || null;
      this.emotes = [];
      this.bars = 0;
      this.dreamA = 0; this.dreamOn = false;
      this.dreamActor = null;
      this.orb = { x: W / 2, y: 40, a: 0 };
      this.done = false;
      this.after = null; this.musicSet = !!d.musicSet;
      o.inCutscene = true;
      if (o.fadeA == null) o.fadeA = 0;
      this.hud = document.querySelector('.hud');
      this.menuBtn = document.getElementById('btnMenu');
      this.skipBtn = document.getElementById('btnSkip');
      if (this.cinematic) { this.hud.style.visibility = 'hidden'; this.menuBtn.style.visibility = 'hidden'; }
      this.skipBtn.hidden = !this.skippable;
      this.skipBtn.textContent = 'Saltar ⏭';
      if (!this._skipBound) {
        this._skipBound = true;
        this.skipBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); TH.input.edge.add('skip'); });
      }
      // conversación con un NPC: se miran
      if (this.npc) {
        const p = o.leader, n = this.npc;
        n.scripted = true; n.speed = 0;
        n.dir = this.dirTo(n, p); p.dir = this.dirTo(p, n); p.speed = 0;
      }
    }
    exit() {
      const o = this.owner;
      o.inCutscene = false;
      this.hud.style.visibility = '';
      this.menuBtn.style.visibility = '';
      this.skipBtn.hidden = true;
      TH.dialog.close();
      TH.choices.close();
      document.getElementById('talk').hidden = true;
    }

    // ---------- intérprete ----------
    next() {
      while (this.stack.length) {
        const f = this.stack[this.stack.length - 1];
        if (f.i < f.list.length) return f.list[f.i++];
        this.stack.pop();
      }
      return null;
    }
    pushList(list) { if (list && list.length) this.stack.push({ list, i: 0 }); }

    update(dt) {
      const I = TH.input, o = this.owner;
      // saltar: dos pulsaciones (Esc o botón) en menos de 2,5 s
      if (this.skippable && !this.skip && (I.pressed('menu') || I.pressed('skip'))) {
        if (this.armed > 0) this.startSkip();
        else { this.armed = 2.5; this.skipBtn.textContent = '¿Saltar? Pulsa otra vez'; }
      }
      if (this.armed > 0) { this.armed -= dt; if (this.armed <= 0) this.skipBtn.textContent = 'Saltar ⏭'; }
      const fast = I.down('b') && !TH.choices.active;
      const sdt = dt * (fast ? 4 : 1);
      this.fast = fast;
      this.run(sdt);
      // el mundo sigue vivo debajo (agua, viento, partículas, luz)
      o.tick(sdt, false);
      this.bars += ((this.cinematic && !this.done ? 1 : 0) - this.bars) * Math.min(1, dt * 6);
      this.dreamA += ((this.dreamOn ? 1 : 0) - this.dreamA) * Math.min(1, dt * (this.skip ? 60 : 2.5));
      if (this.dreamActor) TH.chars.updateChains(this.dreamActor, dt, 0.35 + 0.25 * Math.sin(TH.time * 0.7));
      for (let i = this.emotes.length - 1; i >= 0; i--) { this.emotes[i].t -= sdt; if (this.emotes[i].t <= 0) this.emotes.splice(i, 1); }
      if (this.done) this.close();
    }
    startSkip() {
      this.skip = true;
      this.armed = 0;
      this.skipBtn.hidden = true;
      if (this.cur && this.cur.finish && !this.cur.isChoice) { this.cur.finish(); this.cur = null; }
      for (const t of this.tasks) t.finish && t.finish();
      this.tasks.length = 0;
      this.emotes.length = 0;
    }
    run(dt) {
      for (let i = this.tasks.length - 1; i >= 0; i--) if (this.tasks[i].step(dt)) this.tasks.splice(i, 1);
      for (let guard = 0; guard < 4000; guard++) {
        if (this.cur) {
          if (!this.cur.step(dt)) return;
          this.cur = null;
          dt = 0;
        }
        const c = this.next();
        if (!c) { this.finishAll(); this.done = true; return; }
        const op = opOf(c);
        if (!op) continue;
        // un diálogo abierto se cierra si la siguiente orden no es otro diálogo
        if (op !== 'say' && op !== 'choice' && op !== 'narrate' && op !== 'if' && op !== 'set' && op !== 'add' && TH.dialog.active && !this.skip) TH.dialog.close();
        const task = this.start(op, c);
        if (!task) continue;
        if (this.skip && !task.isChoice) { task.finish && task.finish(); continue; }
        if (c.wait === false && op !== 'wait') this.tasks.push(task);
        else this.cur = task;
      }
    }
    finishAll() {
      for (const t of this.tasks) t.finish && t.finish();
      this.tasks.length = 0;
    }
    close() {
      const o = this.owner;
      o.camLock = null;
      o.zoom = 1;
      o.shake = 0;
      if (this.npc) { this.npc.scripted = false; this.npc.wait = 1.2; }
      for (const n of o.npcs) if (n.scripted) { n.scripted = false; n.speed = 0; }
      o.leader.speed = 0;
      TH.scenes.pop();
      if (this.musicSet && !o.battle) TH.music.resume(1.2);
      if (this.onEnd) this.onEnd();
      const after = this.after;
      this.after = null;
      if (after) after();
    }

    // ---------- resolución de actores y puntos ----------
    actor(who) {
      const o = this.owner;
      if (who === '@npc') return this.npc;
      if (who === '@leader' || who === 'leader') return o.leader;
      if (who === '@dream') return this.dreamActor;
      for (let k = 0; k < o.count; k++) if (o.party[k].def.id === who) return o.party[k];
      for (const n of o.npcs) if (n.def.id === who || n.key === who) return n;
      return null;
    }
    point(p) {
      // [c, r] en tiles (admite decimales) → píxeles de mundo (pies)
      return { x: p[0] * TS + 8, y: p[1] * TS + 10 };
    }
    dirTo(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    }
    camCenter(target) {
      const o = this.owner, m = o.map;
      if (typeof target === 'string') { const a = this.actor(target); return a ? { x: a.x, y: a.y - a.z * HZ - 8 } : null; }
      const pt = this.point(target);
      return { x: pt.x, y: pt.y - m.levelAt(pt.x, pt.y) * HZ - 8 };
    }

    // ---------- órdenes ----------
    start(op, c) {
      const o = this.owner, F = TH.flags;
      switch (op) {
        case 'set':
          if (typeof c.set === 'string') F.set(c.set, c.v);
          else for (const k in c.set) F.set(k, c.set[k]);
          return null;
        case 'add': F.add(c.add, c.n); return null;
        case 'if': this.pushList(F.test(c.if) ? c.then : c.else); return null;
        case 'call': this.pushList((TH.data.scripts || {})[c.call]); return null;
        case 'end': this.stack.length = 0; return null;
        case 'banner': if (!this.skip) TH.ui.banner(c.banner[0], c.banner[1]); return null;
        case 'toast': TH.ui.toast(c.toast); return null;
        case 'party': o.setParty(c.party, c.lead); return null;
        case 'release': { const a = this.actor(c.release); if (a && a.npc) { a.scripted = false; a.wait = c.after || 0; if (c.home) { a.hx = a.x; a.hy = a.y; } } return null; }

        case 'say':
        case 'narrate': {
          if (this.skip) return null;
          const line = op === 'narrate'
            ? { mode: 'narr', t: c.narrate, name: c.name }
            : { who: c.say === '@npc' ? this.npc && this.npc.def.id : c.say === 'voice' || c.say === 'none' ? null : c.say, name: c.name, e: c.e, t: c.t, voice: c.say === 'voice' };
          if (c.say === 'voice' && !line.name) line.name = '???';
          // en una charla, el NPC habla con su propio nombre aunque sea una variante
          TH.dialog.open(line);
          return this.dialogTask(c.auto);
        }
        case 'choice': {
          const opts = c.choice.filter((x) => F.test(x.if));
          let picked = -1, typing = !!c.t && !this.skip;
          if (c.t && !this.skip) TH.dialog.open({ who: c.who === '@npc' ? this.npc && this.npc.def.id : c.who, e: c.e, t: c.t, name: c.name });
          const self = this;
          const task = {
            isChoice: true,
            step(dt) {
              if (typing) {
                TH.dialog.update(dt, self.fast);
                if (TH.input.pressed('a') && !TH.dialog.complete) TH.dialog.finishLine();
                if (!TH.dialog.complete) return false;
                typing = false;
              }
              if (picked < 0 && !TH.choices.active) TH.choices.open(opts.map((x) => x.t), (i) => { picked = i; });
              TH.choices.update();
              if (picked < 0) return false;
              const ch = opts[picked];
              if (ch.set) for (const k in ch.set) F.set(k, ch.set[k]);
              if (c.flag) F.set(c.flag, ch.v != null ? ch.v : picked);
              TH.dialog.close();
              self.pushList(ch.then);
              return true;
            },
          };
          return task;
        }
        case 'wait': return timed(c.wait, () => {});
        // cinemática a pantalla completa: la escena sigue cuando termina
        case 'cine': {
          if (!TH.data.cine || !TH.data.cine[c.cine]) return null;
          const sc = TH.playCine(c.cine);
          if (TH.dialog.active) TH.dialog.close();
          return { step: () => sc.done, finish() { if (TH.scenes.top() === sc) { sc.done = true; TH.scenes.pop(); } } };
        }
        // objetos, oro y Ecos: {give:'tonico', n:2} · {give:'gold', n:50} · {give:'eco:eco_espuma'}
        case 'give': {
          const P = TH.party, n = c.n || 1, g = c.give || '';
          let label;
          if (g === 'gold') { P.gold += n; label = n + ' de oro'; }
          else if (g.indexOf('eco:') === 0) { const id = g.slice(4); P.giveEco(id); label = 'el ' + TH.data.ecos[id].name; }
          else if (TH.data.items[g]) { P.add(g, n); label = TH.data.items[g].name + (n > 1 ? ' ×' + n : ''); }
          if (label && !c.quiet) this.pushList([{ say: 'none', t: (g.indexOf('eco:') === 0 ? '¡Has encontrado ' : 'Has obtenido ') + '{*' + label + '*}.' }]);
          return null;
        }
        case 'heal': TH.party.healAll(); return null;
        case 'shop':
        case 'world': {
          // abre otra escena encima y espera a que se cierre
          if (op === 'world') { this.after = () => TH.scenes.push('world', { port: c.world }); this.stack.length = 0; return null; }
          let first = true;
          return { step() { if (first) { first = false; TH.dialog.close(); TH.scenes.push('shop', { id: c.shop, owner: o }); return false; } return true; }, finish() {} };
        }
        case 'scene': {
          // abre una escena (minijuego, cocina, pesca…) y espera a que se cierre
          let first = true;
          return { step() { if (first) { first = false; TH.dialog.close(); TH.scenes.push(c.scene, Object.assign({ owner: o }, c.data || {})); return false; } return true; }, finish() {} };
        }
        case 'inn': {
          const inn = TH.data.inns[c.inn];
          if (!inn) return null;
          if (TH.party.gold < inn.price) { this.pushList([{ say: '@npc', e: 'sad', t: 'Lo siento, cielo. {p:0.3}Son ' + inn.price + ' de oro y no te llega.' }]); return null; }
          TH.party.gold -= inn.price;
          this.pushList([{ fade: 1, color: '#000', time: 0.8 }, { sleep: inn.wake }, { wait: 0.8 }, { fade: 0, time: 1 }, { say: '@npc', e: 'happy', t: '¡Buenos días! {p:0.3}Habéis dormido como piedras.' }, { toast: 'PV y PM recuperados' }]);
          return null;
        }
        case 'sleep': {
          const clk = o.clock, w = c.sleep;
          if (clk.hour >= w) clk.day++;
          clk.hour = w;
          TH.lighting.setTime(clk.hour, o.tint);
          TH.party.healAll();
          return null;
        }
        case 'zone': o.changeZone(c.zone, c.entry); return null;
        // grupo: se une / se va / queda exactamente así
        case 'join': {
          o.join(c.join);
          if (c.at) { const a = this.actor(c.join), pt = this.point(c.at); if (a) { a.x = pt.x; a.y = pt.y; a.z = o.map.zAt(a.x, a.y); } }
          if (!c.quiet && !this.skip) this.pushList([{ say: 'none', t: '{*' + TH.chars.defs[c.join].name + '*} se une al grupo.' }]);
          return null;
        }
        case 'leave': o.leave(c.leave); return null;
        case 'roster': o.setRoster(c.roster, c.lead); return null;
        case 'refresh': o.refresh(); return null;
        // cambia de zona al instante (sin fundido propio: úsalo entre dos «fade»)
        case 'warp': {
          const pt = c.at ? { x: c.at[0] * TS + 8, y: c.at[1] * TS + 10 } : null;
          const fa = o.fadeA, fc = o.fadeC;
          o.enter({ map: c.warp, entry: c.entry, pos: pt, quiet: true, hour: c.hour });
          o.inCutscene = true; o.fadeA = fa; o.fadeC = fc;
          if (c.dir) o.leader.dir = c.dir;
          return null;
        }
        // cambia una pieza de equipo; la anterior desaparece si replace
        case 'equip': {
          const mm = TH.party.members[c.equip];
          if (mm) { const slot = c.slot || 'weapon'; if (mm.equip[slot] && !c.replace) TH.party.add(mm.equip[slot], 1); mm.equip[slot] = c.item; TH.party.clamp(c.equip); }
          return null;
        }
        case 'save': o.saveGame(); return null;
        // nivel mínimo de un miembro (al unirse al grupo) · velocidad del reloj (0 = detenido)
        case 'level': { const P = TH.party, mm = P.members[c.level]; if (mm && mm.lv < c.lv) { mm.lv = c.lv; mm.exp = 0; } P.healAll(); return null; }
        case 'clock': o.clock.speed = c.clock; return null;
        case 'credits': { let done = this.skip; if (!done) TH.credits.show(() => { done = true; }); return { step: (dt) => { TH.credits.update(dt); return done; }, finish() { TH.credits.end(); } }; }
        case 'flash': { const a0 = 0.9; o.fadeC = c.color || '#fff8e0'; o.fadeA = a0; return timed(c.flash || 0.6, (k) => { o.fadeA = a0 * (1 - k); }); }
        case 'music': this.musicSet = true; if (c.music) TH.music.play(c.music); else TH.music.stop(1); return null;
        // cartel de capítulo a pantalla completa
        case 'chapter': {
          if (this.skip) return null;
          const el = document.getElementById('chapterCard');
          if (!el) return null;
          el.querySelector('b').textContent = c.chapter; el.querySelector('span').textContent = c.title || ''; el.querySelector('small').textContent = c.sub || '';
          el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
          return timed(c.time || 4.2, (k) => { if (k >= 1) el.hidden = true; });
        }
        // combate desde una escena: la escena termina y el combate empieza; after = escena al ganar
        case 'battle': {
          const lead = o.leader, at = c.at ? this.point(c.at) : { x: lead.x + 48, y: lead.y };
          const foe = { enemy: true, def: {}, group: c.battle, x: at.x, y: at.y, z: o.map.zAt(at.x, at.y), alive: true, once: c.once || null, tips: c.tips || null, after: c.after || null, boss: c.battle.some((k) => TH.data.enemies[k] && TH.data.enemies[k].boss), fullHeal: !!c.fullHeal };
          this.stack.length = 0;
          this.after = () => { o.safeT = 0; o.startBattle(foe, !!c.advantage); };
          return null;
        }
        case 'despawn': {
          // quita un NPC del mapa (alguien que se marcha de la escena)
          const o = this.owner; for (let i = o.npcs.length - 1; i >= 0; i--) if (o.npcs[i].def.id === c.despawn || o.npcs[i].key === c.despawn) o.npcs.splice(i, 1);
          return null;
        }
        case 'move': return this.moveTask(c);
        case 'face': {
          const a = this.actor(c.face);
          if (a) { if (c.dir === 'down' || c.dir === 'up' || c.dir === 'left' || c.dir === 'right') a.dir = c.dir; else { const b = this.actor(c.dir); if (b) a.dir = this.dirTo(a, b); } }
          return c.time ? timed(c.time, () => {}) : null;
        }
        case 'place': {
          const a = this.actor(c.place);
          if (!a) return null;
          const pt = this.point(c.at);
          a.x = pt.x; a.y = pt.y; a.z = o.map.zAt(a.x, a.y); a.speed = 0; a.arc = 0; a.state = 'walk';
          if (c.dir) a.dir = c.dir;
          if (a.npc) a.scripted = true;
          if (a === o.leader) { o.seedHistory(); o.placeFollowers(0); }
          a.chainsReady = false;
          return null;
        }
        case 'cam': {
          if (c.cam === 'leader' || c.cam === 'free') {
            const a = o.leader, to = { x: a.x, y: a.y - a.z * HZ - 8 };
            return this.panTask(to, c.time || 0, c.zoom, () => { o.camLock = c.cam === 'free' ? null : a; });
          }
          const to = this.camCenter(c.cam);
          if (!to) return null;
          const follow = typeof c.cam === 'string' ? this.actor(c.cam) : null;
          return this.panTask(to, c.time || 0, c.zoom, () => { o.camLock = follow || to; });
        }
        case 'zoom': { const z0 = o.zoom, z1 = Math.max(1, c.zoom); return timed(c.time || 0, (k) => { o.zoom = U.lerp(z0, z1, ease(k)); }); }
        case 'fade': {
          const a0 = o.fadeA, a1 = c.fade;
          if (c.color) o.fadeC = c.color;
          return timed(c.time || 0, (k) => { o.fadeA = U.lerp(a0, a1, k); });
        }
        case 'hour': {
          const clk = o.clock, h0 = clk.hour;
          let h1 = c.hour;
          if (h1 < h0 && !c.back) h1 += 24;
          return timed(c.time || 0, (k) => { clk.hour = U.lerp(h0, h1, U.smooth(k)) % 24; TH.lighting.setTime(clk.hour, o.tint); });
        }
        case 'shake': { const s = c.shake; return timed(c.time || 0.5, (k) => { o.shake = k >= 1 ? 0 : s * (1 - k * 0.7); }); }
        case 'emote': {
          const a = this.actor(c.emote);
          if (!a || this.skip) return null;
          this.emotes.push({ a, icon: c.icon || '!', t: c.time || 0.9, t0: c.time || 0.9 });
          return c.wait === false ? null : timed((c.time || 0.9) * 0.7, () => {});
        }
        case 'bars': this.cinematic = !!c.bars; return null;
        case 'dream': {
          this.dreamOn = !!c.dream;
          if (c.dream && !this.dreamActor) {
            this.dreamActor = { def: TH.chars.defs.kaelen, x: W / 2, sy: 150, dir: 'up', anim: 'idle', frame: 0, state: 'walk', big: false, chains: null };
            TH.chars.initChains(this.dreamActor);
          }
          if (this.skip) this.dreamA = c.dream ? 1 : 0;
          return c.time ? timed(c.time, () => {}) : null;
        }
        case 'orb': {
          const b = this.orb, x0 = b.x, y0 = b.y, a0 = b.a;
          const x1 = c.orb[0], y1 = c.orb[1], a1 = c.a != null ? c.a : 1;
          return timed(c.time || 0, (k) => { const e = ease(k); b.x = U.lerp(x0, x1, e); b.y = U.lerp(y0, y1, e); b.a = U.lerp(a0, a1, k); });
        }
      }
      return null;
    }
    dialogTask(auto) {
      const self = this;
      let hold = 0;
      return {
        step(dt) {
          const D = TH.dialog;
          D.update(dt, self.fast);
          if (TH.input.pressed('a')) { if (!D.complete) D.finishLine(); else return true; }
          if (D.complete && auto != null) { hold += dt; if (hold >= auto) return true; }
          return false;
        },
        finish() { TH.dialog.close(); },
      };
    }
    panTask(to, time, zoom, after) {
      const o = this.owner, cam = TH.camera;
      o.camLock = null;
      const x0 = cam.x + W / 2, y0 = cam.y + H / 2, z0 = o.zoom, z1 = zoom != null ? Math.max(1, zoom) : z0;
      return timed(time, (k) => {
        const e = ease(k);
        cam.snapTo(U.lerp(x0, to.x, e), U.lerp(y0, to.y, e));
        o.zoom = U.lerp(z0, z1, e);
        if (k >= 1) after();
      });
    }
    moveTask(c) {
      const a = this.actor(c.move), o = this.owner;
      if (!a) return null;
      if (a.npc) a.scripted = true;
      const pts = (c.path || [c.to]).map((p) => this.point(p));
      const sp = c.speed || (c.run ? 96 : 54);
      let i = 0;
      const self = this;
      return {
        step(dt) {
          let budget = sp * dt;
          while (budget > 0 && i < pts.length) {
            const p = pts[i], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy);
            if (d < 0.01) { i++; continue; }
            const s = Math.min(d, budget);
            a.x += (dx / d) * s; a.y += (dy / d) * s; a.dist += s; budget -= s;
            a.dir = Math.abs(dx) > Math.abs(dy) * 1.1 ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
            if (s >= d) i++;
          }
          a.speed = i < pts.length && dt > 0 ? sp : 0;
          if (i >= pts.length) { a.speed = 0; if (c.face) self.start('face', { face: c.move, dir: c.face }); return true; }
          return false;
        },
        finish() {
          const p = pts[pts.length - 1], q = pts.length > 1 ? pts[pts.length - 2] : { x: a.x, y: a.y };
          if (Math.hypot(p.x - q.x, p.y - q.y) > 0.5) { const dx = p.x - q.x, dy = p.y - q.y; a.dir = Math.abs(dx) > Math.abs(dy) * 1.1 ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'; }
          a.x = p.x; a.y = p.y; a.speed = 0; i = pts.length;
          a.z = o.map.zAt(a.x, a.y);
          if (a === o.leader) { o.record(true); o.seedHistory(); o.placeFollowers(0); }
          if (c.face) self.start('face', { face: c.move, dir: c.face });
        },
      };
    }

    // ---------- pintado: sueño, bocadillos, fundido y bandas ----------
    render(ctx) {
      const o = this.owner, t = TH.time;
      if (this.dreamA > 0.01) this.drawDream(ctx, t);
      for (const e of this.emotes) this.drawEmote(ctx, e);
      if (o.fadeA > 0.001) { ctx.globalAlpha = Math.min(1, o.fadeA); ctx.fillStyle = o.fadeC || '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      const b = Math.round(this.bars * 20);
      if (b > 0) { ctx.fillStyle = '#05040c'; ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H - b, W, b); }
    }
    drawEmote(ctx, e) {
      const o = this.owner, a = e.a, p = o.toScreen(a.x, a.sy - (a.big ? 42 : 38));
      const k = 1 - e.t / e.t0, pop = k < 0.15 ? k / 0.15 : 1;
      const x = Math.round(p.x), y = Math.round(p.y - 4 * (1 - pop));
      ctx.fillStyle = '#2a1d3a'; ctx.fillRect(x - 6, y - 7, 13, 11); ctx.fillRect(x - 1, y + 4, 3, 2);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 5, y - 6, 11, 9); ctx.fillRect(x, y + 3, 1, 2);
      ctx.fillStyle = e.icon === '!' ? '#d8402c' : '#3a2a5a';
      if (e.icon === '!') { ctx.fillRect(x, y - 5, 1, 5); ctx.fillRect(x, y + 1, 1, 1); }
      else if (e.icon === '?') { ctx.fillRect(x - 1, y - 5, 3, 1); ctx.fillRect(x + 1, y - 4, 1, 2); ctx.fillRect(x, y - 2, 1, 2); ctx.fillRect(x, y + 1, 1, 1); }
      else { ctx.fillRect(x - 3, y - 1, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x + 3, y - 1, 1, 1); }
    }
    drawDream(ctx, t) {
      const A = this.dreamA, sh = this.owner.shake;
      ctx.save();
      if (sh) ctx.translate(Math.round((Math.random() * 2 - 1) * sh), Math.round((Math.random() * 2 - 1) * sh));
      ctx.globalAlpha = A;
      // cielo del sueño
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a0820'); g.addColorStop(0.55, '#231a4a'); g.addColorStop(0.69, '#4a3a7a'); g.addColorStop(0.7, '#1a2a52'); g.addColorStop(1, '#070a1c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const S = this.stars;
      for (let i = 0; i < 70; i++) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.6 + S[i * 3 + 2]);
        ctx.fillStyle = tw > 0.85 ? '#ffffff' : '#a8b4ff';
        ctx.globalAlpha = A * (0.3 + tw * 0.7);
        ctx.fillRect(S[i * 3] | 0, S[i * 3 + 1] | 0, 1, 1);
        // reflejo en el agua quieta
        ctx.globalAlpha = A * (0.12 + tw * 0.2);
        ctx.fillRect(S[i * 3] | 0, (300 - S[i * 3 + 1]) | 0, 1, 1);
      }
      ctx.globalAlpha = A;
      // horizonte y ondas
      ctx.fillStyle = '#8a7ad0'; ctx.fillRect(0, 151, W, 1);
      for (let i = 0; i < 12; i++) {
        const y = 156 + i * 5 + ((t * 3 + i * 7) % 5), w = 20 + ((i * 37) % 40);
        ctx.fillStyle = 'rgba(160,150,255,.18)';
        ctx.fillRect(((i * 61 + t * 8) % (W + 60)) - 30, y | 0, w, 1);
      }
      // orbe que habla
      const b = this.orb;
      if (b.a > 0.01) {
        if (!this.glow) {
          const c = TH.makeCanvas(96, 96), gg = c.g, rg = gg.createRadialGradient(48, 48, 0, 48, 48, 48);
          rg.addColorStop(0, 'rgba(255,250,220,1)'); rg.addColorStop(0.15, 'rgba(180,230,255,.8)'); rg.addColorStop(0.5, 'rgba(120,140,255,.22)'); rg.addColorStop(1, 'rgba(80,60,200,0)');
          gg.fillStyle = rg; gg.fillRect(0, 0, 96, 96);
          this.glow = c.c;
        }
        const pulse = 1 + Math.sin(t * 3) * 0.08, s = 96 * pulse, by = b.y + Math.sin(t * 1.4) * 2;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = A * b.a;
        ctx.drawImage(this.glow, b.x - s / 2, by - s / 2, s, s);
        ctx.globalAlpha = A * b.a * 0.35;
        ctx.drawImage(this.glow, b.x - s / 2, 302 - by - s / 2, s, s);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = A * b.a;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - 1, by - 1, 3, 3);
        ctx.globalAlpha = A;
      }
      // Kaelen de pie sobre el agua, con su reflejo
      const k = this.dreamActor;
      if (k) {
        k.anim = 'idle'; k.frame = Math.floor(t * 2.4) & 3; k.sy = 150; k.shadowY = null;
        ctx.save(); ctx.translate(0, 301); ctx.scale(1, -1); TH.chars.draw(ctx, k, A * 0.35); ctx.restore();
        ctx.globalAlpha = A;
        TH.chars.draw(ctx, k, A < 0.99 ? A : null);
        ctx.fillStyle = 'rgba(200,190,255,.5)'; ctx.fillRect(k.x - 7 - ((t * 4) % 4), 151, 14 + ((t * 8) % 8), 1);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }
  TH.CutsceneScene = CutsceneScene;

  // lanza una cinemática sobre el mapa
  TH.cutscene = {
    play(id, opts) {
      const map = TH.scenes.registry.map;
      const script = typeof id === 'string' ? (TH.data.scripts || {})[id] : id;
      if (!script) return false;
      const mu = typeof id === 'string' && TH.data.scriptMusic && TH.data.scriptMusic[id];
      if (mu) { TH.music.play(mu); opts = Object.assign({ musicSet: true }, opts || {}); }
      TH.scenes.push('cutscene', Object.assign({ owner: map, script }, opts || {}));
      return true;
    },
  };
})();
