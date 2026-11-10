// Caja de diálogo (letra a letra, retrato, etiquetas) y menú de elecciones, en HTML sobre el canvas
// Etiquetas: {p:0.4} pausa · {s:2} velocidad · {e:triste} expresión · {*énfasis*} · {~temblor~} · \n salto de línea
(function () {
  'use strict';
  const TH = window.TH;
  const $ = (id) => document.getElementById(id);
  const EXPR = { neutral: 'neutral', neutro: 'neutral', happy: 'happy', contento: 'happy', feliz: 'happy', sad: 'sad', triste: 'sad', angry: 'angry', enfadado: 'angry' };
  const BASE_CPS = 40; // letras por segundo a velocidad normal

  // texto con etiquetas → letras con estilo + eventos por posición
  function parse(src) {
    const chars = [], ev = [];
    let em = false, sh = false, i = 0;
    while (i < src.length) {
      const two = src.substr(i, 2);
      if (two === '{*') { em = true; i += 2; continue; }
      if (two === '*}') { em = false; i += 2; continue; }
      if (two === '{~') { sh = true; i += 2; continue; }
      if (two === '~}') { sh = false; i += 2; continue; }
      if (src[i] === '{') {
        const j = src.indexOf('}', i);
        const m = j > 0 ? /^\{(p|s|e):([^}]+)\}$/.exec(src.slice(i, j + 1)) : null;
        if (m) { ev.push({ at: chars.length, k: m[1], v: m[1] === 'e' ? EXPR[m[2].trim()] || 'neutral' : +m[2] }); i = j + 1; continue; }
      }
      chars.push({ ch: src[i], em, sh });
      i++;
    }
    return { chars, ev };
  }

  const D = (TH.dialog = {
    active: false,
    init() {
      this.el = { talk: $('talk'), box: $('dlg'), port: $('dlgPort'), portWrap: $('dlgPortWrap'), name: $('dlgName'), text: $('dlgText'), next: $('dlgNext'), narr: $('narr'), narrText: $('narrText'), narrName: $('narrName') };
      this.pg = this.el.port.getContext('2d');
      this.pg.imageSmoothingEnabled = false;
      // tocar el diálogo o la pantalla = botón A
      const tap = (e) => { if (D.active && !TH.choices.active) { e.preventDefault(); TH.input.edge.add('a'); } };
      this.el.box.addEventListener('pointerdown', tap);
      this.el.narr.addEventListener('pointerdown', tap);
      $('game').addEventListener('pointerdown', tap);
    },
    // line: {who, name, e, t, mode:'box'|'narr'}
    open(line) {
      const mode = line.mode || 'box';
      const def = line.who && TH.chars.defs[line.who];
      this.mode = mode;
      this.def = def;
      this.expr = EXPR[line.e] || 'neutral';
      const p = parse(line.t || '');
      this.chars = p.chars; this.ev = p.ev; this.evI = 0;
      this.shown = 0; this.acc = 0; this.pause = 0; this.speed = 1;
      this.complete = false; this.active = true;
      const host = mode === 'narr' ? this.el.narrText : this.el.text;
      host.textContent = '';
      this.spans = [];
      const frag = document.createDocumentFragment();
      for (let k = 0; k < this.chars.length; k++) {
        const c = this.chars[k];
        if (c.ch === '\n') { frag.appendChild(document.createElement('br')); this.spans.push(null); continue; }
        const s = document.createElement('span');
        s.textContent = c.ch;
        if (c.em) s.className = 'em';
        if (c.sh) { s.className += ' sh'; s.style.animationDelay = (-k * 0.09).toFixed(2) + 's'; }
        frag.appendChild(s);
        this.spans.push(s);
      }
      host.appendChild(frag);
      if (mode === 'narr') {
        this.el.box.hidden = true;
        this.el.narr.hidden = false;
        this.el.narrName.textContent = line.name ? '— ' + line.name : '';
        this.el.narrName.classList.remove('on');
      } else {
        this.el.narr.hidden = true;
        this.el.talk.hidden = false;
        this.el.box.hidden = false;
        this.el.name.textContent = line.name || (def ? def.name : '');
        this.el.name.hidden = !this.el.name.textContent;
        this.el.portWrap.hidden = !(def && line.portrait !== false);
        this.el.box.classList.toggle('noport', this.el.portWrap.hidden);
        this.el.box.classList.toggle('voice', !!line.voice);
        this.drawPortrait();
      }
      this.el.next.classList.remove('on');
    },
    drawPortrait() {
      if (!this.def || this.el.portWrap.hidden) return;
      const g = this.pg;
      g.clearRect(0, 0, 64, 64);
      g.drawImage(TH.portraits.get(this.def.id, this.expr), 0, 0);
    },
    // avanza la escritura; fast = mantener B
    update(dt, fast) {
      if (!this.active || this.complete) return;
      const rate = BASE_CPS * TH.settings.textSpeed * (fast ? 4 : 1);
      let budget = dt;
      while (budget > 0 && this.shown < this.chars.length) {
        // eventos en la posición actual
        while (this.evI < this.ev.length && this.ev[this.evI].at <= this.shown) {
          const e = this.ev[this.evI++];
          if (e.k === 'p') this.pause += e.v;
          else if (e.k === 's') this.speed = e.v || 1;
          else if (e.k === 'e') { this.expr = e.v; this.drawPortrait(); }
        }
        if (this.pause > 0) { const u = Math.min(this.pause, budget); this.pause -= fast ? u * 4 : u; budget -= u; continue; }
        this.acc += budget * rate * this.speed;
        budget = 0;
        while (this.acc >= 1 && this.shown < this.chars.length) {
          this.acc -= 1;
          const s = this.spans[this.shown];
          if (s) s.classList.add('on');
          const ch = this.chars[this.shown].ch;
          if (this.shown % 3 === 0 && ch !== ' ') TH.sfx('text');
          this.shown++;
          // respiración natural en la puntuación
          if (this.shown < this.chars.length) {
            if (ch === '.' || ch === '!' || ch === '?' || ch === '…') { this.pause += 0.14; this.acc = 0; break; }
            if (ch === ',' || ch === ';' || ch === ':') { this.pause += 0.06; this.acc = 0; break; }
          }
        }
      }
      if (this.shown >= this.chars.length) this.finishLine();
    },
    finishLine() {
      for (let k = this.shown; k < this.spans.length; k++) if (this.spans[k]) this.spans[k].classList.add('on');
      while (this.evI < this.ev.length) { const e = this.ev[this.evI++]; if (e.k === 'e') { this.expr = e.v; this.drawPortrait(); } }
      this.shown = this.chars.length;
      this.complete = true;
      this.el.next.classList.add('on');
      if (this.mode === 'narr') this.el.narrName.classList.add('on');
    },
    close() {
      this.active = false;
      this.el.box.hidden = true;
      this.el.narr.hidden = true;
      this.el.next.classList.remove('on');
    },
  });

  // ---------- elecciones ----------
  TH.choices = {
    active: false,
    open(options, onPick) {
      const el = $('choices');
      this.el = el;
      this.n = options.length;
      this.idx = 0;
      this.onPick = onPick;
      this.active = true;
      el.innerHTML = '';
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'choice';
        b.textContent = o;
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.mark(i); });
        b.addEventListener('click', () => this.pick(i));
        el.appendChild(b);
      });
      el.hidden = false;
      $('talk').hidden = false;
      this.mark(0);
    },
    mark(i) { this.idx = i; [...this.el.children].forEach((b, k) => b.classList.toggle('sel', k === i)); },
    update() {
      if (!this.active) return;
      const I = TH.input;
      const E = I.edge;
      if (E.has('up') || E.has('left') || E.has('down') || E.has('right')) TH.sfx('menu');
      if (E.has('a')) TH.sfx('ok');
      if (I.pressed('up') || I.pressed('left')) this.mark((this.idx + this.n - 1) % this.n);
      if (I.pressed('down') || I.pressed('right')) this.mark((this.idx + 1) % this.n);
      if (I.pressed('a')) this.pick(this.idx);
    },
    pick(i) {
      if (!this.active) return;
      this.active = false;
      this.el.hidden = true;
      const f = this.onPick;
      this.onPick = null;
      if (f) f(i);
    },
    close() { this.active = false; if (this.el) this.el.hidden = true; this.onPick = null; },
  };
})();
