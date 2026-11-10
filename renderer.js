// Canvas principal a 384×216 escalado. Con WebGL, el juego se pinta en un canvas 2D aparte y el postprocesado
// (engine/postfx.js) lo compone en el canvas visible a resolución de pantalla; sin WebGL se pinta directamente.
(function () {
  'use strict';
  const TH = window.TH;
  TH.renderer = {
    init() {
      const c = (this.canvas = document.getElementById('game'));
      if (TH.postfx && TH.postfx.init(c)) {
        const o = TH.makeCanvas(TH.W, TH.H);
        this.buf = o.c;
        this.ctx = o.g;
        c.classList.add('fx');
      } else {
        c.width = TH.W;
        c.height = TH.H;
        this.ctx = c.getContext('2d');
      }
      this.ctx.imageSmoothingEnabled = false;
      this.stage = document.getElementById('stage');
      this.fit();
      addEventListener('resize', () => this.fit());
      if (window.ResizeObserver) new ResizeObserver(() => this.fit()).observe(this.stage);
    },
    present() { if (this.buf) TH.postfx.present(this.buf); },
    fit() {
      const r = this.stage.getBoundingClientRect();
      let s = Math.min(r.width / TH.W, r.height / TH.H);
      // sin postprocesado se busca un factor entero; con él el escalado nítido admite cualquier tamaño
      if (!this.buf && s >= 2.5) s = Math.floor(s);
      s = Math.max(0.5, s);
      this.scale = s;
      const w = Math.round(TH.W * s), h = Math.round(TH.H * s);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      // el marco usa unidades de contenedor para el texto: necesita ancho explícito
      this.canvas.parentElement.style.width = w + 'px';
      if (this.buf) TH.postfx.resize(w, h);
    },
  };
})();
