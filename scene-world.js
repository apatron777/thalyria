// Mapa del archipiélago: islas desbloqueables, puertos con nombre y viaje en barca entre ellos
(function () {
  'use strict';
  const TH = window.TH, W = TH.W, H = TH.H, U = TH.util;
  const $ = (id) => document.getElementById(id);
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const SEA = [[22, 46, 92], [26, 58, 108], [30, 74, 126], [38, 96, 148], [52, 124, 168], [84, 164, 190], [124, 206, 206]];

  class WorldScene extends TH.Scene {
    constructor() { super(); this.base = null; this.key = ''; this.wake = []; }
    enter(d) {
      const D = TH.data.world;
      this.D = D;
      TH.music.play('mar');
      this.from = D.ports.find((p) => p.id === d.port) || D.ports[0];
      this.boat = { x: this.from.x, y: this.from.y + 4, flip: false };
      this.travel = null;
      this.fade = 1; this.fadeTo = 0; this.after = null;
      this.ports = D.ports.filter((p) => !p.unlock || TH.flags.get(p.unlock));
      this.sel = Math.max(0, this.ports.indexOf(this.from));
      this.auto = d.auto || null;
      this.coast = null; this.birds = [0, 1, 2].map((i) => ({ x: 60 + i * 90, y: 40 + i * 30, p: i * 2 }));
      this.bake();
      this.el = { root: $('wmap'), labels: $('wmLabels'), dest: $('wmDest'), go: $('wmGo') };
      this.el.root.hidden = false;
      document.getElementById('banner').classList.remove('show');
      document.querySelector('.hud').style.visibility = 'hidden';
      $('btnMenu').style.visibility = 'hidden';
      if (!this._bound) {
        this._bound = true;
        $('wmGo').addEventListener('click', () => { TH.input.edge.add('a'); });
        $('wmBack').addEventListener('click', () => { TH.input.edge.add('b'); });
      }
      this.buildLabels();
      this.mark();
      if (this.auto) {
        const to = this.auto.to, pts = this.route(this.from, to);
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        this.sel = Math.max(0, this.ports.indexOf(to));
        this.travel = { pts, i: 1, to, len };
        this.el.dest.textContent = 'Navegando hacia ' + this.auto.name + '…';
        this.el.go.disabled = true;
      }
    }
    exit() {
      this.el.root.hidden = true;
      document.querySelector('.hud').style.visibility = '';
      $('btnMenu').style.visibility = '';
    }
    unlocked(isl) { return !isl.unlock || TH.flags.get(isl.unlock); }

    // ---------- horneado del mar y las islas (solo cuando cambia lo desbloqueado) ----------
    bake() {
      const D = this.D;
      const key = D.islands.map((i) => (this.unlocked(i) ? 1 : 0)).join('') + (TH.flags.get('mar.subido') ? 'M' : '');
      if (this.base && key === this.key) return;
      this.key = key;
      const o = TH.makeCanvas(W, H), g = o.g, img = g.createImageData(W, H), px = img.data;
      const isl = D.islands;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        // campo de tierra: >0 dentro de alguna isla
        let f = -9, who = -1;
        const n = (U.rnd(x >> 1, y >> 1, 77) - 0.5) * 0.16 + (U.rnd(x >> 3, y >> 3, 78) - 0.5) * 0.12;
        for (let i = 0; i < isl.length; i++) for (const [bx, by, r] of isl[i].blobs) {
          const v = 1 - Math.hypot(x - bx, (y - by) * 1.15) / r + n;
          if (v > f) { f = v; who = i; }
        }
        const b = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.35;
        let col;
        if (f <= 0) {
          // agua: más clara cerca de la costa
          let k = 6 + f * 4.2 + b;
          k = k < 0 ? 0 : k > 6 ? 6 : k;
          col = SEA[k | 0];
          if (f > -0.07 && f <= 0) col = [210, 238, 236];
        } else {
          const below = this.fieldAt(x, y + 2, isl, n);
          if (f < 0.12) col = [232, 208, 150];
          else if (below <= 0) col = [126, 92, 76]; // acantilado hacia el sur
          else if (f > 0.62 + b) col = [168, 210, 104];
          else if (f > 0.34 && U.rnd(x >> 1, y >> 1, 79) < 0.35) col = [44, 98, 64];
          else col = f > 0.45 ? [96, 162, 72] : [78, 144, 66];
          if (!this.unlocked(isl[who])) { const gr = (col[0] + col[1] + col[2]) / 3; col = [gr * 0.35 + 40, gr * 0.35 + 48, gr * 0.35 + 70]; }
        }
        const o4 = (y * W + x) * 4;
        px[o4] = col[0]; px[o4 + 1] = col[1]; px[o4 + 2] = col[2]; px[o4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      // píxeles de orilla (para la espuma animada)
      const coast = [];
      for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
        const o4 = (y * W + x) * 4;
        if (px[o4] === 210 && px[o4 + 1] === 238) coast.push(x, y);
      }
      this.coastPts = coast;
      // niebla sobre las islas bloqueadas
      for (const i of isl) {
        if (this.unlocked(i)) continue;
        for (const [bx, by, r] of i.blobs) {
          const rg = g.createRadialGradient(bx, by, 0, bx, by, r * 1.8);
          rg.addColorStop(0, 'rgba(200,210,235,.45)'); rg.addColorStop(1, 'rgba(200,210,235,0)');
          g.fillStyle = rg; g.fillRect(bx - r * 2, by - r * 2, r * 4, r * 4);
        }
      }
      // rosa de los vientos
      const cx = 30, cy = 186;
      g.fillStyle = 'rgba(232,184,74,.75)';
      for (let k = 0; k < 9; k++) { g.fillRect(cx - k, cy - 13 + k, 1 + k * 2 > 1 ? 1 : 1, 1); }
      g.fillRect(cx, cy - 14, 1, 28); g.fillRect(cx - 14, cy, 28, 1);
      g.fillStyle = '#e8b84a'; g.fillRect(cx - 1, cy - 14, 3, 6); g.fillRect(cx - 1, cy - 1, 3, 3);
      this.base = o.c;
    }
    fieldAt(x, y, isl, n) {
      let f = -9;
      for (let i = 0; i < isl.length; i++) for (const [bx, by, r] of isl[i].blobs) { const v = 1 - Math.hypot(x - bx, (y - by) * 1.15) / r + n; if (v > f) f = v; }
      return f;
    }

    // ---------- interfaz ----------
    buildLabels() {
      const L = this.el.labels, D = this.D;
      L.innerHTML = '';
      const pct = (x, y) => 'left:' + (x / W) * 100 + '%;top:' + (y / H) * 100 + '%';
      for (const i of D.islands) {
        const s = document.createElement('span');
        s.className = 'wm-isl' + (this.unlocked(i) ? '' : ' lock');
        s.textContent = this.unlocked(i) ? i.name : '???';
        s.style.cssText = pct(i.label[0], i.label[1]);
        L.appendChild(s);
      }
      this.ports.forEach((p, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'wm-port';
        b.style.cssText = pct(p.x, p.y);
        const isl = D.islands.find((i) => i.id === p.island);
        b.innerHTML = '<i></i><span>' + (isl && isl.name === p.name ? '' : p.name) + '</span>';
        b.setAttribute('aria-label', p.name);
        b.addEventListener('click', () => { if (this.travel) return; if (this.sel === k) TH.input.edge.add('a'); else { this.sel = k; this.mark(); } });
        L.appendChild(b);
      });
    }
    mark() {
      const ports = this.el.labels.querySelectorAll('.wm-port');
      ports.forEach((b, k) => b.classList.toggle('sel', k === this.sel));
      const p = this.ports[this.sel];
      const here = p === this.from;
      this.el.dest.textContent = here ? p.name + ' · estás aquí' : 'Destino: ' + p.name + (p.zone ? '' : ' (no se puede desembarcar)');
      this.el.go.textContent = here ? 'Desembarcar' : 'Zarpar';
      this.el.go.disabled = !p.zone;
    }
    route(a, b) {
      const R = this.D.routes;
      let pts = R[a.id + '>' + b.id];
      if (!pts && R[b.id + '>' + a.id]) pts = R[b.id + '>' + a.id].slice().reverse();
      return [[a.x, a.y + 4]].concat(pts || []).concat([[b.x, b.y + 4]]);
    }

    update(dt) {
      const I = TH.input;
      TH.time += dt;
      this.fade += (this.fadeTo - this.fade) * Math.min(1, dt * 6);
      if (this.after) { if (this.fade > 0.97) { const f = this.after; this.after = null; f(); } return; }
      if (this.travel) { this.sail(dt); return; }
      const n = this.ports.length;
      if (I.pressed('left') || I.pressed('up')) { this.sel = (this.sel + n - 1) % n; this.mark(); }
      if (I.pressed('right') || I.pressed('down')) { this.sel = (this.sel + 1) % n; this.mark(); }
      if (I.pressed('b') || I.pressed('menu')) { this.leave(this.from); return; }
      if (I.pressed('a')) {
        const p = this.ports[this.sel];
        if (!p.zone) { TH.ui.toast('Aún no se puede desembarcar allí'); return; }
        if (p === this.from) { this.leave(p); return; }
        const pts = this.route(this.from, p);
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        this.travel = { pts, i: 1, to: p, len };
        this.el.dest.textContent = 'Navegando hacia ' + p.name + '…';
        this.el.go.disabled = true;
      }
    }
    sail(dt) {
      const T = this.travel, b = this.boat;
      let budget = 52 * dt * (TH.input.down('b') ? 3 : 1);
      while (budget > 0 && T.i < T.pts.length) {
        const [tx, ty] = T.pts[T.i], dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
        if (d < 0.01) { T.i++; continue; }
        const s = Math.min(d, budget);
        b.x += (dx / d) * s; b.y += (dy / d) * s; budget -= s;
        if (Math.abs(dx) > 0.3) b.flip = dx < 0;
        if (s >= d) T.i++;
      }
      // estela
      if (Math.random() < 0.8) { const bx = b.x + (b.flip ? 8 : -8); this.wake.push({ x: bx, y: b.y + 2, t: 1.4, vx: b.flip ? 6 : -6, vy: -3 }, { x: bx, y: b.y + 3, t: 1.4, vx: b.flip ? 6 : -6, vy: 3 }); }
      if (T.i >= T.pts.length) { this.travel = null; this.leave(T.to); }
      void T;
    }
    // fundido y entrada en la zona del puerto
    leave(port) {
      this.fadeTo = 1;
      this.after = () => {
        const map = TH.scenes.registry.map;
        TH.scenes.pop();
        const A = this.auto;
        if (A) {
          map.enter({ map: A.zone, entry: A.entry, quiet: true });
          TH.ui.banner(map.map.def.name, map.map.def.sub);
        } else if (port !== this.from || map.mapId !== port.zone) {
          map.enter({ map: port.zone, entry: port.entry, quiet: true });
          TH.ui.banner(map.map.def.name, map.map.def.sub);
        }
        map.fadeA = 1;
        map.trans = { t: 0, phase: 'in' };
      };
    }

    render(ctx) {
      const t = TH.time;
      ctx.drawImage(this.base, 0, 0);
      // oleaje: bandas de luz que se desplazan despacio
      ctx.fillStyle = 'rgba(160,220,255,.10)';
      for (let y = 6; y < H; y += 9) { const off = (t * 6 + y * 3) % 40; for (let x = -40 + off; x < W; x += 40) ctx.fillRect(x | 0, (y + Math.sin(t + y) * 1.5) | 0, 14, 1); }
      // espuma de la orilla que respira
      const C = this.coastPts || [];
      for (let i = 0; i < C.length; i += 2) {
        const x = C[i], y = C[i + 1], k = Math.sin(t * 2.2 + x * 0.21 + y * 0.17);
        if (k > 0.35) { ctx.fillStyle = k > 0.8 ? 'rgba(255,255,255,.95)' : 'rgba(235,252,255,.6)'; ctx.fillRect(x, y + 1, 1, 1); }
      }
      // brillos del mar
      ctx.fillStyle = 'rgba(220,245,255,.55)';
      for (let i = 0; i < 46; i++) {
        const x = (U.rnd(i, 1, 9) * W + t * (3 + (i % 3))) % W, y = U.rnd(i, 2, 9) * H;
        if (Math.sin(t * 2 + i) > 0.55) ctx.fillRect(x | 0, y | 0, 2 + (i % 2), 1);
      }
      // ruta hacia el destino elegido
      const sel = this.ports[this.sel];
      if (!this.travel && sel !== this.from && sel.zone) this.dots(ctx, this.route(this.from, sel), t);
      else if (this.travel) this.dots(ctx, this.travel.pts, t);
      // puertos
      for (const p of this.ports) {
        const on = p === sel, r = on ? 3 + Math.sin(t * 5) : 2;
        ctx.fillStyle = '#2a1d10'; ctx.fillRect(p.x - r - 1, p.y - r - 1, r * 2 + 3, r * 2 + 3);
        ctx.fillStyle = p.zone ? (on ? '#ffe08a' : '#e8b84a') : '#9aa0b8';
        ctx.fillRect(p.x - r, p.y - r, r * 2 + 1, r * 2 + 1);
      }
      // estela y barca
      for (let i = this.wake.length - 1; i >= 0; i--) {
        const w = this.wake[i];
        w.t -= 1 / 60;
        if (w.t <= 0) { this.wake.splice(i, 1); continue; }
        w.x += (w.vx || 0) / 60; w.y += (w.vy || 0) / 60;
        ctx.fillStyle = 'rgba(235,252,255,' + (w.t * 0.55).toFixed(2) + ')';
        ctx.fillRect(w.x | 0, w.y | 0, 2, 1);
      }
      this.drawBoat(ctx, this.boat, t);
      // nubes con su sombra
      for (let i = 0; i < 5; i++) {
        const x = ((U.rnd(i, 3, 5) * (W + 120) + t * (4 + i)) % (W + 120)) - 60, y = 20 + U.rnd(i, 4, 5) * 150;
        ctx.fillStyle = 'rgba(10,20,50,.12)'; this.cloud(ctx, x + 10, y + 14, i);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; this.cloud(ctx, x, y, i);
      }
      // gaviotas
      for (const b of this.birds) {
        b.x = (b.x + 12 / 60) % (W + 20); const by = b.y + Math.sin(t * 0.8 + b.p) * 6, w = Math.sin(t * 8 + b.p) > 0 ? 1 : 0;
        ctx.fillStyle = '#f4f8ff'; ctx.fillRect((b.x - 10) | 0, by | 0, 2, 1); ctx.fillRect((b.x - 8) | 0, (by - w) | 0, 2, 1); ctx.fillRect((b.x - 12) | 0, (by - w) | 0, 2, 1);
      }
      // viñeta y fundido
      TH.lighting.vignette(ctx);
      if (this.fade > 0.01) { ctx.globalAlpha = Math.min(1, this.fade); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }
    dots(ctx, pts, t) {
      ctx.fillStyle = 'rgba(255,240,200,.8)';
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0);
        for (let s = (t * 8) % 6; s < d; s += 6) ctx.fillRect((x0 + ((x1 - x0) * s) / d) | 0, (y0 + ((y1 - y0) * s) / d) | 0, 1, 1);
      }
    }
    cloud(ctx, x, y, i) {
      const w = 22 + (i % 3) * 8;
      ctx.fillRect(x | 0, (y + 3) | 0, w, 5); ctx.fillRect((x + 4) | 0, y | 0, w - 10, 3); ctx.fillRect((x + 8) | 0, (y - 2) | 0, w - 18, 2);
    }
    drawBoat(ctx, b, t) {
      const x = Math.round(b.x), y = Math.round(b.y + Math.sin(t * 3) * 1), f = b.flip ? -1 : 1, moving = !!this.travel;
      // sombra y brillo en el agua
      ctx.fillStyle = 'rgba(10,30,60,.35)'; ctx.fillRect(x - 9, y + 3, 19, 2);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x - 10 + (t * 10 % 3 | 0), y + 3, 2, 1); ctx.fillRect(x + 9, y + 3, 2, 1);
      // casco
      ctx.fillStyle = '#1a1020'; ctx.fillRect(x - 9, y - 2, 19, 5); ctx.fillRect(x + f * 9, y - 3, 2, 3);
      ctx.fillStyle = '#9a6a3e'; ctx.fillRect(x - 8, y - 2, 17, 2); ctx.fillStyle = '#6a4228'; ctx.fillRect(x - 7, y, 15, 2);
      ctx.fillStyle = '#c8a070'; ctx.fillRect(x - 8, y - 2, 17, 1);
      // mástil y vela hinchada
      ctx.fillStyle = '#3a2216'; ctx.fillRect(x, y - 16, 1, 15);
      const sw = moving ? 2 + Math.round(Math.sin(t * 4)) : 1;
      for (let k = 0; k < 12; k++) {
        const wdt = Math.round(2 + k * 0.6 + (k > 2 && k < 10 ? sw : 0));
        ctx.fillStyle = k % 4 === 3 ? '#d8ccb0' : '#f6efdc';
        ctx.fillRect(f > 0 ? x + 1 : x - wdt, y - 15 + k, wdt, 1);
      }
      // banderola
      const fl = Math.round(Math.sin(t * 6));
      ctx.fillStyle = '#c8382c'; ctx.fillRect(f > 0 ? x - 3 : x + 1, y - 17 + fl * 0, 3, 1); ctx.fillRect(f > 0 ? x - 4 : x + 3, y - 17 + fl, 1, 1);
      // farol de proa
      ctx.fillStyle = '#ffe08a'; ctx.fillRect(x + f * 8, y - 4, 1, 1);
    }
  }
  TH.WorldScene = WorldScene;
})();
