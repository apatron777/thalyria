// Guardado en localStorage protegido: si falla, el juego sigue
(function () {
  'use strict';
  const TH = window.TH;
  TH.save = {
    KEY: 'thalyria.save.v1',
    write(state) {
      try { localStorage.setItem(this.KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
    },
    read() {
      try { const t = localStorage.getItem(this.KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; }
    },
  };
})();
