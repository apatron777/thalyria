// Cámara suave con límites del mapa
(function () {
  'use strict';
  const TH = window.TH;
  TH.camera = {
    x: 0, y: 0, rx: 0, ry: 0, zoom: 1,
    x0: 0, y0: 0, x1: 0, y1: 0,
    setMap(m) {
      this.x0 = 0;
      this.x1 = Math.max(0, m.pw - TH.W);
      this.y0 = -40; // deja ver la cima de los tiles elevados de la primera fila
      this.y1 = Math.max(this.y0, m.ph - TH.H);
    },
    clamp() {
      // con zoom se ve menos mapa: los límites se abren lo que encoge la vista
      const mx = (TH.W - TH.W / this.zoom) / 2, my = (TH.H - TH.H / this.zoom) / 2;
      if (this.x < this.x0 - mx) this.x = this.x0 - mx;
      if (this.x > this.x1 + mx) this.x = this.x1 + mx;
      if (this.y < this.y0 - my) this.y = this.y0 - my;
      if (this.y > this.y1 + my) this.y = this.y1 + my;
      this.rx = Math.round(this.x);
      this.ry = Math.round(this.y);
    },
    snapTo(tx, ty) { this.x = tx - TH.W / 2; this.y = ty - TH.H / 2; this.clamp(); },
    follow(tx, ty, dt) {
      const k = 1 - Math.exp(-dt * 6);
      this.x += (tx - TH.W / 2 - this.x) * k;
      this.y += (ty - TH.H / 2 - this.y) * k;
      this.clamp();
    },
  };
})();
