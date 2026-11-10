// Pantalla de título: Continuar, Nueva partida y modo pruebas (empezar en un capítulo con el grupo preparado).
// Debajo se ve Bruma Salada al anochecer, con el faro encendido.
(function () {
  'use strict';
  const TH = window.TH;
  const $ = (id) => document.getElementById(id);

  // ---------- partida ----------
  TH.game = {
    map() { return TH.scenes.registry.map; },
    playIntro() {
      TH.cutscene.play('prologo.apertura', { cinematic: true, onEnd: () => this.map().saveGame() });
    },
    started: false,
    newGame() {
      this.started = true;
      TH.flags.reset();
      TH.party.reset();
      const m = this.map();
      m.enter({ map: 'brumaSalada', hour: 4.6, day: 1, speed: 1, count: 1, order: TH.chars.PARTY.slice(), fresh: true, quiet: true });
      this.playIntro();
    },
    continueGame() {
      this.started = true;
      const m = this.map();
      if (!m.loadGame()) { this.newGame(); return; }
      TH.ui.toast('Partida cargada');
    },
    hasSave() { const s = TH.save.read(); return !!(s && s.map && TH.data.maps[s.map] && s.flags && s.flags['intro.vista']); },
    // modo pruebas: el capítulo empieza con el nivel, equipo, Ecos y grupo que tendría una partida normal
    startChapter(id) {
      const C = TH.data.chapters[id];
      if (!C) return;
      this.started = true;
      if (C.newGame) { this.newGame(); return; }
      const P = TH.party, F = TH.flags;
      F.reset();
      F.load(C.flags || {});
      P.reset();
      for (const mid in C.levels || {}) {
        const mm = P.members[mid];
        mm.lv = C.levels[mid]; mm.exp = 0;
      }
      for (const mid in C.equip || {}) Object.assign(P.members[mid].equip, C.equip[mid]);
      P.ecos = (C.ecos || []).slice();
      for (const mid in C.ecoSet || {}) P.members[mid].ecos = C.ecoSet[mid].slice();
      P.inv = Object.assign({}, C.inv || {});
      P.gold = C.gold || 0;
      P.healAll();
      const m = this.map();
      m.enter({ map: C.map, pos: C.at ? { x: C.at[0] * 16 + 8, y: C.at[1] * 16 + 10 } : null, entry: C.entry, hour: C.hour, day: C.day || 1, speed: 1, count: C.roster.length, order: C.roster.concat(TH.chars.PARTY.filter((p) => C.roster.indexOf(p) < 0)), fresh: true, quiet: true });
      m.setRoster(C.roster);
      if (C.dir) m.leader.dir = C.dir;
      if (C.script) TH.cutscene.play(C.script, { cinematic: true, onEnd: () => m.saveGame() });
      else m.saveGame();
    },
  };

  class TitleScene extends TH.Scene {
    constructor() { super(); this.transparent = true; this.i = 0; }
    enter() {
      this.el = $('title');
      this.list = $('titleList');
      const items = [];
      TH.music.play('grupo');
      if (TH.game.hasSave()) items.push({ label: 'Continuar', sub: '', act: () => TH.game.continueGame() });
      items.push({ label: 'Nueva partida', sub: 'Prólogo', act: () => TH.game.newGame() });
      items.push({ label: 'Créditos', sub: '', act: () => { TH.scenes.push('title'); TH.credits.show(); } });
      if (TH.tests.on()) for (const id in TH.data.chapters) {
        const C = TH.data.chapters[id];
        items.push({ label: 'Pruebas · ' + C.name, sub: C.test, act: () => TH.game.startChapter(id) });
      }
      this.items = items;
      this.i = 0;
      this.draw();
      if (!this._bound) {
        this._bound = true;
        addEventListener('keydown', (e) => { if (TH.scenes.top() === this && TH.tests.key(e.key)) this.enter(); });
        const logo = this.el.querySelector('.logo');
        let taps = 0, tt = 0;
        if (logo) logo.addEventListener('click', () => {
          if (TH.scenes.top() !== this || TH.tests.on()) return;
          const now = Date.now(); taps = now - tt < 700 ? taps + 1 : 1; tt = now;
          if (taps >= 5) { taps = 0; const c = prompt('Código de pruebas'); if (c && c.trim().toUpperCase() === TH.tests.CODE) { TH.tests.unlock(); this.enter(); } }
        });
        this.list.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b && TH.scenes.top() === this) { this.i = +b.dataset.i; this.pick(); } });
      }
      this.el.hidden = false;
      document.querySelector('.hud').style.visibility = 'hidden';
      $('btnMenu').style.visibility = 'hidden';
      const m = TH.game.map();
      m.inCutscene = true;
      m.camLock = null;
      TH.camera.snapTo(31 * 16, 6 * 16);
      this.camT = 0;
    }
    exit() {
      this.el.hidden = true;
      document.querySelector('.hud').style.visibility = '';
      $('btnMenu').style.visibility = '';
      const m = TH.game.map();
      m.inCutscene = false; m.camLock = null;
    }
    draw() {
      this.list.innerHTML = this.items.map((it, k) => '<button type="button" class="menu-item' + (k === this.i ? ' sel' : '') + '" data-i="' + k + '"><span>' + it.label + '</span><small>' + (it.sub || '') + '</small></button>').join('');
    }
    pick() {
      const it = this.items[this.i];
      TH.scenes.pop();
      it.act();
    }
    update(dt) {
      const I = TH.input;
      if (I.edge.has('up') || I.edge.has('down')) TH.sfx('menu');
      if (I.pressed('up')) { this.i = (this.i + this.items.length - 1) % this.items.length; this.draw(); }
      if (I.pressed('down')) { this.i = (this.i + 1) % this.items.length; this.draw(); }
      if (I.pressed('a')) { TH.sfx('ok'); this.pick(); return; }
      const m = TH.game.map();
      m.tick(dt, false);
      // la cámara se queda mirando el faro
      TH.camera.snapTo(31 * 16, 6 * 16);
    }
    render() {}
  }
  TH.TitleScene = TitleScene;
})();
