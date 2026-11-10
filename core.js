// Núcleo: constantes, utilidades, gestor de escenas y bucle de paso fijo
(function () {
  'use strict';
  const TH = (window.TH = window.TH || {});
  TH.W = 384; // resolución interna
  TH.H = 216;
  TH.TS = 16; // tamaño de tile
  TH.HZ = 12; // píxeles de pantalla por nivel de altura
  TH.PAD = 48; // margen superior para tiles elevados
  TH.time = 0;
  TH.data = TH.data || { maps: {} };

  const U = (TH.util = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    smooth: (t) => t * t * (3 - 2 * t),
    // hash determinista para variación procedural
    rnd(x, y, n) {
      let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(n | 0, 1442695041);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    },
    mixRGB(a, b, t, out) {
      out = out || [0, 0, 0];
      out[0] = a[0] + (b[0] - a[0]) * t;
      out[1] = a[1] + (b[1] - a[1]) * t;
      out[2] = a[2] + (b[2] - a[2]) * t;
      return out;
    },
  });

  TH.makeCanvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return { c, g };
  };

  // Escena base
  class Scene {
    constructor() { this.transparent = false; }
    enter() {}
    exit() {}
    update() {}
    render() {}
  }
  TH.Scene = Scene;

  // Gestor de escenas en pila: solo la de arriba se actualiza; se pintan desde la última opaca
  TH.scenes = {
    stack: [],
    registry: {},
    register(name, scene) { this.registry[name] = scene; },
    push(name, data) {
      const s = this.registry[name];
      if (!s) throw new Error('Escena desconocida: ' + name);
      this.stack.push(s);
      s.enter(data || {});
    },
    pop() { const s = this.stack.pop(); if (s) s.exit(); return s; },
    replace(name, data) { while (this.stack.length) this.pop(); this.push(name, data); },
    top() { return this.stack[this.stack.length - 1]; },
    update(dt) { const t = this.top(); if (t) t.update(dt); },
    render(ctx) {
      let i = this.stack.length - 1;
      while (i > 0 && this.stack[i].transparent) i--;
      for (; i < this.stack.length; i++) this.stack[i].render(ctx);
    },
  };

  TH.fps = {
    value: 60, frames: 0, last: 0,
    tick(now) {
      this.frames++;
      if (now - this.last >= 500) {
        this.value = Math.round((this.frames * 1000) / (now - this.last));
        this.frames = 0;
        this.last = now;
      }
    },
  };

  // Bucle con paso fijo (1/60 s) y pintado una vez por fotograma
  TH.loop = {
    STEP: 1 / 60,
    start(update, render) {
      let acc = 0;
      let last = performance.now();
      const frame = (now) => {
        let dt = (now - last) / 1000;
        last = now;
        if (dt > 0.25) dt = 0.25;
        acc += dt;
        let n = 0;
        while (acc >= this.STEP && n < 5) { update(this.STEP); acc -= this.STEP; n++; }
        if (n >= 5) acc = 0;
        render();
        TH.fps.tick(now);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
  };
})();
