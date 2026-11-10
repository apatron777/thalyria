// Variables de historia (flags) y ajustes del jugador
(function () {
  'use strict';
  const TH = window.TH;
  const COND = /^(!)?([\w.]+)\s*(=|!=|>=|<=|>|<)?\s*(.*)$/;

  TH.flags = {
    v: {},
    get(k, d) { return Object.prototype.hasOwnProperty.call(this.v, k) ? this.v[k] : d; },
    set(k, val) { this.v[k] = val === undefined ? true : val; },
    add(k, n) { this.v[k] = (+this.v[k] || 0) + (n == null ? 1 : n); return this.v[k]; },
    // condición: 'a' · '!a' · 'a=b' · 'a!=b' · 'n>=2' · lista (todas) · {any:[...]} (alguna)
    test(c) {
      if (c == null || c === true) return true;
      if (Array.isArray(c)) return c.every((x) => this.test(x));
      if (typeof c === 'object' && c.any) return c.any.some((x) => this.test(x));
      const m = COND.exec(String(c));
      if (!m) return false;
      const val = this.get(m[2]);
      if (!m[3]) return m[1] ? !val : !!val;
      const rhs = m[4], num = +rhs, isNum = rhs !== '' && !isNaN(num);
      switch (m[3]) {
        case '=': return String(val) === rhs;
        case '!=': return String(val) !== rhs;
        case '>=': return (+val || 0) >= num;
        case '<=': return (+val || 0) <= num;
        case '>': return (+val || 0) > num;
        case '<': return isNum ? (+val || 0) < num : false;
      }
      return false;
    },
    reset() { this.v = {}; },
    load(o) { this.v = o && typeof o === 'object' ? Object.assign({}, o) : {}; },
    dump() { return Object.assign({}, this.v); },
  };

  // ajustes que no van en la partida (velocidad del texto)
  TH.settings = {
    KEY: 'thalyria.settings.v1',
    textSpeed: 1, guide: true, timing: 1, touch: 1, quality: 'auto',
    TIMINGS: [[1, 'Normal'], [1.6, 'Amplio'], [2.4, 'Muy amplio']],
    TOUCH: [[0.8, 'Pequeños'], [1, 'Normales'], [1.25, 'Grandes'], [1.5, 'Muy grandes']],
    QUALITY: [['auto', 'Automática'], ['alta', 'Alta'], ['baja', 'Rendimiento']],
    SPEEDS: [[0.6, 'Lenta'], [1, 'Normal'], [1.8, 'Rápida']],
    load() {
      try { const s = JSON.parse(localStorage.getItem(this.KEY) || '{}'); if (s.textSpeed) this.textSpeed = s.textSpeed; if (s.timing) this.timing = s.timing; if (s.touch) this.touch = s.touch; if (s.quality) this.quality = s.quality; if (s.guide === false) this.guide = false; } catch (e) { /* sin almacenamiento */ }
      this.applyTouch();
    },
    save() { try { localStorage.setItem(this.KEY, JSON.stringify({ textSpeed: this.textSpeed, timing: this.timing, touch: this.touch, quality: this.quality, guide: this.guide })); } catch (e) { /* sin almacenamiento */ } },
    speedLabel() { const s = this.SPEEDS.find((x) => x[0] === this.textSpeed); return s ? s[1] : 'Normal'; },
    lab(list, v) { const s = list.find((x) => x[0] === v); return s ? s[1] : list[0][1]; },
    cyc(k, list) { const i = list.findIndex((x) => x[0] === this[k]); this[k] = list[(i + 1) % list.length][0]; this.save(); this.applyTouch(); },
    applyTouch() { try { document.documentElement.style.setProperty('--touch', this.touch); } catch (e) { /* sin DOM */ } },
    cycleSpeed() {
      const i = this.SPEEDS.findIndex((x) => x[0] === this.textSpeed);
      this.textSpeed = this.SPEEDS[(i + 1) % this.SPEEDS.length][0];
      this.save();
    },
  };
})();
