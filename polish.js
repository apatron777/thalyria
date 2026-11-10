// Pulido final: música de los momentos clave, créditos con desplazamiento, calidad automática y modo pruebas oculto.
(function () {
  'use strict';
  const TH = window.TH;

  // ---------- música de las cinemáticas clave (al terminar vuelve la de la zona) ----------
  TH.data.scriptMusic = {
    'prologo.apertura': 'triste', 'pro.gruta.voz': 'gruta', 'pro.matriarca.fin': 'grupo',
    'cap1.final': 'grupo', 'cap2.fin': 'grupo', 'cap3.varek': 'motor', 'cap3.fin': 'grupo',
    'cap4.regla': 'biblioteca', 'cap4.fin': 'grupo', 'cap5.varek': 'motor', 'cap5.abisal': 'abismo', 'cap5.fin': 'triste',
    'cap6.profecia': 'triste', 'cap6.fin': 'grupo', 'cap7.cena': 'faro', 'cap7.ithra': 'triste', 'cap7.fin': 'grupo',
    'cap8.puerta': 'triste', 'cap8.fase3': 'motor', 'cap8.decision': 'triste',
    'post.carta': 'triste', 'post.cartas.todas': 'grupo', 'post.leviatan.fin': 'grupo',
  };

  // ---------- calidad automática (60 FPS en móvil) ----------
  TH.perf = {
    low: 0, t: 0,
    apply() {
      const q = TH.settings.quality, P = TH.postfx;
      if (!P) return;
      P.lite = q === 'baja' || (q === 'auto' && this.auto);
      if (TH.particles) TH.particles.cap = P.lite ? 0.5 : 1;
      if (TH.renderer && TH.renderer.fit) TH.renderer.fit();
    },
    // cada medio segundo: si la media cae por debajo de 50 FPS durante 3 s, pasa a modo rendimiento
    tick(dt) {
      this.t += dt;
      if (this.t < 0.5) return;
      this.t = 0;
      if (TH.settings.quality !== 'auto' || this.auto || document.hidden) return;
      this.low = TH.fps.value < 50 ? this.low + 1 : 0;
      if (this.low >= 6) { this.auto = true; this.apply(); }
    },
  };

  // ---------- objetivo siempre visible ----------
  // Cada aviso «Objetivo: …» queda fijado bajo el reloj hasta el siguiente, para no perder nunca el siguiente paso.
  const toast0 = TH.ui.toast.bind(TH.ui);
  TH.ui.toast = function (msg) {
    const m = /^Objetivo:\s*(.*)$/.exec(msg || '');
    if (m) { TH.flags.set('obj.txt', m[1]); TH.flags.set('obj.for', TH.flags.get('objetivo') || ''); }
    toast0(msg);
    if (m) { clearTimeout(this._toastT); this._toastT = setTimeout(() => { this.el.toast.hidden = true; }, 4200); }
  };
  TH.objHud = {
    t: 0,
    tick(dt) {
      this.t += dt;
      if (this.t < 0.25) return;
      this.t = 0;
      const el = document.getElementById('objHud');
      if (!el) return;
      const F = TH.flags, map = TH.scenes.registry.map, cur = F.get('objetivo') || '';
      // el texto fijado solo vale para el objetivo con el que se escribió; si la historia avanzó sin aviso,
      // se usa el aviso que el guion asocia a ese objetivo (o nada, antes que un objetivo viejo)
      let txt = F.get('obj.txt');
      if (txt && F.get('obj.for') !== cur) txt = (TH.objTexts && TH.objTexts[cur]) || null;
      const show = !!(txt && TH.game && TH.game.started && TH.scenes.top() === map && !map.inCutscene && !TH.flags.get('juego.fin'));
      if (el.hidden === show) el.hidden = !show;
      if (show && el._t !== txt) { el._t = txt; el.querySelector('b').textContent = txt; }
    },
  };

  // objetivo → texto del aviso «Objetivo: …» que el guion muestra al fijarlo (se busca en todas las escenas)
  TH.buildObjTexts = () => {
    const out = {}, walk = (ops, cur) => {
      for (const o of ops || []) {
        if (!o || typeof o !== 'object') continue;
        if (o.set && typeof o.set === 'object' && o.set.objetivo) cur = o.set.objetivo;
        if (o.set === 'objetivo' && o.v) cur = o.v;
        if (typeof o.toast === 'string' && cur && /^Objetivo:/.test(o.toast) && !out[cur]) out[cur] = o.toast.replace(/^Objetivo:\s*/, '');
        ['then', 'else'].forEach((k) => { cur = walk(o[k], cur) || cur; });
      }
      return cur;
    };
    for (const id in TH.data.scripts) walk(TH.data.scripts[id], null);
    return (TH.objTexts = out);
  };

  // ---------- créditos ----------
  const CREDITS = [
    ['h', 'THALYRIA'], ['s', 'El Día Detenido'], ['g'],
    ['t', 'Historia, guion y dirección'], ['n', 'Adrián Patrón'], ['n', 'Claude'], ['g'],
    ['t', 'Diseño de juego y sistemas'], ['n', 'Combate por turnos con timing · Ecos · Resonancias · Viaje entre épocas'], ['g'],
    ['t', 'Reparto'], ['n', 'Kaelen, príncipe de Thalyria'], ['n', 'Elara, hija de los faroleros'], ['n', 'Flint, herrero de Hondaroca'], ['n', 'Firion, vigía del faro'], ['n', 'Oslo, barquero'], ['g'],
    ['t', 'Con'], ['n', 'Ilun · Halvard · Mira · Lía · Taro · Oriel · Ithra'], ['n', 'Varek, capitán de la guardia'], ['n', 'y la reina Aurelia'], ['g'],
    ['t', 'Motor, pixel art y efectos'], ['n', 'Escritos a mano en JavaScript y WebGL'], ['g'],
    ['t', 'Música y sonido'], ['n', 'Sintetizados en tiempo real con Web Audio'], ['n', '«Tema del grupo» · «Vael al atardecer» · «La ciudad que no respira»'], ['g'],
    ['t', 'Inspirado por'], ['n', 'los JRPG de toda la vida, con sus mares, sus faros y sus amaneceres'], ['g'], ['g'],
    ['h2', 'Gracias por jugar'],
  ];
  TH.credits = {
    show(onEnd) {
      let el = document.getElementById('credits');
      if (!el) {
        el = document.createElement('div');
        el.id = 'credits';
        el.innerHTML = '<div class="cr-roll">' + CREDITS.map(([k, v]) => k === 'g' ? '<div class="cr-gap"></div>' : '<div class="cr-' + k + '">' + v + '</div>').join('') + '</div><div class="cr-skip">A · saltar</div>';
        (document.querySelector('.frame') || document.body).appendChild(el);
        el.addEventListener('pointerdown', () => { if (this.on) this.end(); });
      }
      this.el = el; this.on = true; this.onEnd = onEnd || null; this.t = 0;
      el.hidden = false;
      const roll = el.querySelector('.cr-roll');
      roll.style.transition = 'none'; roll.style.transform = 'translateY(100%)';
      void roll.offsetHeight;
      this.dur = 34;
      roll.style.transition = 'transform ' + this.dur + 's linear';
      roll.style.transform = 'translateY(-100%)';
      TH.music.play('grupo');
      if (!onEnd) TH.scenes.push('creditsScene');
    },
    update(dt) {
      if (!this.on) return true;
      this.t += dt;
      if (this.t > 1 && (TH.input.pressed('a') || TH.input.pressed('b') || TH.input.pressed('skip'))) this.end();
      else if (this.t > this.dur + 1) this.end();
      return !this.on;
    },
    end() {
      if (!this.on) return;
      this.on = false;
      this.el.hidden = true;
      const f = this.onEnd; this.onEnd = null;
      if (f) f();
      else { if (TH.scenes.top() instanceof CreditsScene) TH.scenes.pop(); if (TH.scenes.top() instanceof TH.TitleScene) TH.music.play('grupo'); else TH.music.resume(1); }
    },
  };
  class CreditsScene extends TH.Scene {
    constructor() { super(); this.transparent = true; }
    update(dt) { TH.credits.update(dt); const m = TH.scenes.registry.map; if (m) m.tick(dt, false); }
    render() {}
  }
  TH.CreditsScene = CreditsScene;

  // ---------- modo pruebas oculto ----------
  // Se desbloquea escribiendo AURELIA en la pantalla de título, o tocando el logo 5 veces e introduciendo el código.
  TH.tests = {
    CODE: 'AURELIA',
    on() { try { return localStorage.getItem('thalyria.pruebas') === '1' || /[#&?]pruebas\b/.test(location.href); } catch (e) { return false; } },
    unlock() { try { localStorage.setItem('thalyria.pruebas', '1'); } catch (e) { /* sin almacenamiento */ } TH.ui.toast('Modo pruebas desbloqueado'); TH.sfx('level'); },
    buf: '',
    key(k) {
      if (!k || k.length !== 1) return false;
      this.buf = (this.buf + k.toUpperCase()).slice(-this.CODE.length);
      if (this.buf === this.CODE && !this.on()) { this.unlock(); return true; }
      return false;
    },
  };
})();
