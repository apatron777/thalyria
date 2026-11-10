// Mapa por capas: alturas, terreno, objetos, colisiones y horneado del suelo
(function () {
  'use strict';
  const TH = window.TH, R = TH.util.rnd, TS = 16, HZ = TH.HZ, PAD = TH.PAD;
  const WALKABLE_GROUND = { g: 1, f: 1, p: 1, s: 1, r: 1, d: 1, S: 1 };

  // ruido de valor suave (para la variación de color del suelo)
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    let fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = R(xi, yi, s), b = R(xi + 1, yi, s), c = R(xi, yi + 1, s), d = R(xi + 1, yi + 1, s);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  // oscurece y aclara por zonas; warm: las zonas claras tiran a amarillo cálido y las oscuras a azul verdoso
  function macro(g, w, h, seed, amt, warm) {
    let img;
    try { img = g.getImageData(0, 0, w, h); } catch (e) { return; }
    const d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        if (d[o + 3] === 0) continue;
        const n = vnoise(x / 70, y / 70, seed) * 0.65 + vnoise(x / 23, y / 23, seed + 1) * 0.35 - 0.5;
        const k = 1 + n * amt * 2;
        d[o] = Math.min(255, d[o] * k + n * 26 * warm);
        d[o + 1] = Math.min(255, d[o + 1] * k + n * 10 * warm);
        d[o + 2] = Math.min(255, d[o + 2] * k - n * 14 * warm);
      }
    }
    g.putImageData(img, 0, 0);
  }

  class TileMap {
    constructor(def) {
      this.def = def;
      const w = (this.w = def.w), h = (this.h = def.h);
      this.pw = w * TS;
      this.ph = h * TS;
      this.hgt = new Int8Array(w * h).fill(def.baseHeight || 0);
      this.ter = new Array(w * h).fill(def.baseTerrain || 'g');
      for (const [x, y, ww, hh, v] of def.heightRects || []) this.fill(this.hgt, x, y, ww, hh, v);
      for (const [x, y, ww, hh, v] of def.terrainRects || []) this.fill(this.ter, x, y, ww, hh, v);
      for (const [c, r, v] of def.tiles || []) if (this.inb(c, r)) this.ter[r * w + c] = v;
      this.props = [];
      this.solids = [];
      this.occ = new Uint8Array(w * h);
      // bordes de salto y paredes con enredadera (marcan el borde sur del tile de arriba)
      this.jump = new Uint8Array(w * h);
      this.vine = new Uint8Array(w * h);
      for (const [c0, c1, r] of def.jumps || []) for (let c = c0; c <= c1; c++) if (this.inb(c, r)) { this.jump[r * w + c] = 1; this.reserve(c, r); }
      for (const [c, r] of def.vines || []) if (this.inb(c, r)) { this.vine[r * w + c] = 1; this.reserve(c, r); }
      this.placeProps();
      this.computeWater();
      this.bake();
      this.collectTufts();
    }
    fill(arr, x, y, w, h, v) {
      for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) if (this.inb(c, r)) arr[r * this.w + c] = v;
    }
    reserve(c, r) { for (let k = -1; k <= 1; k++) for (let j = 0; j <= 1; j++) if (this.inb(c + k, r + j)) this.occ[(r + j) * this.w + c + k] = 1; }
    jumpAt(c, r) { return this.inb(c, r) && this.jump[r * this.w + c] === 1; }
    vineAt(c, r) { return this.inb(c, r) && this.vine[r * this.w + c] === 1; }
    inb(c, r) { return c >= 0 && r >= 0 && c < this.w && r < this.h; }
    t(c, r) { return this.inb(c, r) ? this.ter[r * this.w + c] : null; }
    hh(c, r) { return this.inb(c, r) ? this.hgt[r * this.w + c] : 0; }
    isWater(c, r) { return this.t(c, r) === '~'; }
    isStair(c, r) { return this.t(c, r) === 'S'; }

    // ---------- objetos ----------
    addProp(type, c, r, o) {
      const def = TH.props.defs[type];
      if (!def) return;
      o = o || {};
      const x = c * TS + 8 + (o.dx || 0), y = r * TS + 15 + (o.dy || 0);
      const z = o.z != null ? o.z : this.hh(Math.floor(c), Math.floor(r));
      const inst = { type, def, x, y, z, sy: y - z * HZ, v: o.v || 0, seed: R(c, r, 777), lit: o.lit || null };
      inst.bx0 = x - def.ax - 4; inst.bx1 = x - def.ax + def.w + 4;
      inst.by0 = inst.sy - def.ay - 2; inst.by1 = inst.sy - def.ay + def.h + 4;
      this.props.push(inst);
      c = Math.floor(c); r = Math.floor(r);
      if (def.box) {
        const b = def.box;
        this.solids.push([x + b[0], y + b[1], x + b[2], y + b[3]]);
        const c0 = Math.floor((x + b[0]) / TS), c1 = Math.floor((x + b[2] - 1) / TS);
        const r0 = Math.floor((y + b[1]) / TS), r1 = Math.floor((y + b[3] - 1) / TS);
        for (let rr = r0; rr <= r1; rr++) for (let cc = c0; cc <= c1; cc++) if (this.inb(cc, rr)) this.occ[rr * this.w + cc] = 1;
      }
      if (this.inb(c, r)) this.occ[r * this.w + c] = 1;
      return inst;
    }
    placeProps() {
      // objetos con los que se interactúa: cofres, carteles, barcas y brillos recogibles
      this.things = [];
      const thing = (kind, e, type) => {
        const inst = type ? this.addProp(type, e.c, e.r, e) : null;
        const c = Math.floor(e.c), r = Math.floor(e.r);
        if (!type && this.inb(c, r)) this.occ[r * this.w + c] = 1;
        const x = inst ? inst.x : e.c * TS + 8, y = inst ? inst.y : e.r * TS + 10;
        this.things.push({ kind, e, inst, x, y, z: this.hh(c, r) });
      };
      for (const e of this.def.chests || []) thing('chest', e, 'chest');
      for (const e of this.def.signs || []) thing('sign', e, e.prop === false ? null : e.prop || 'sign');
      for (const e of this.def.boats || []) thing('boat', e, 'boat');
      for (const e of this.def.pickups || []) thing('pickup', e, null);
      for (const p of this.def.props || []) this.addProp(p[0], p[1], p[2], p[3]);
      // bosques deterministas
      for (const f of this.def.forests || []) {
        const [x, y, w, h] = f.rect;
        for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) {
          if (!this.inb(c, r)) continue;
          const t = this.t(c, r);
          if (t !== 'g' && t !== 'f') continue;
          if (this.occ[r * this.w + c]) continue;
          if (R(c, r, 555) > f.density) continue;
          let skip = false;
          for (const [ax, ay, ar] of f.avoid || []) if (Math.hypot(c - ax, r - ay) < ar) skip = true;
          // no taponar caminos ni escaleras vecinas
          for (let k = -1; k <= 1 && !skip; k++) for (let j = -1; j <= 1; j++) { const nt = this.t(c + j, r + k); if (nt === 'S' || nt === 'p' && Math.abs(j) + Math.abs(k) === 1 && k >= 0) skip = true; }
          if (skip) continue;
          const types = f.types;
          const type = types[(R(c, r, 556) * types.length) | 0];
          this.addProp(type, c, r, { dx: Math.round((R(c, r, 557) - 0.5) * 8), dy: Math.round((R(c, r, 558) - 0.5) * 6), v: (R(c, r, 559) * 3) | 0 });
        }
      }
      this.props.sort((a, b) => a.y - b.y);
    }

    // ---------- agua ----------
    computeWater() {
      const w = this.w, h = this.h;
      const wet = (c, r) => { const t = this.t(c, r); return t === '~' || t === 'd'; };
      this.depth = new Uint8Array(w * h);
      const q = [];
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        if (!wet(c, r)) continue;
        let edge = false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nc = c + dx, nr = r + dy; if (this.inb(nc, nr) && !wet(nc, nr)) edge = true; }
        if (edge) { this.depth[r * w + c] = 1; q.push(c, r); }
      }
      for (let i = 0; i < q.length; i += 2) {
        const c = q[i], r = q[i + 1], d = this.depth[r * w + c];
        if (d >= 5) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nc = c + dx, nr = r + dy;
          if (!this.inb(nc, nr) || !wet(nc, nr) || this.depth[nr * w + nc]) continue;
          this.depth[nr * w + nc] = d + 1; q.push(nc, nr);
        }
      }
      for (let i = 0; i < w * h; i++) if ((this.ter[i] === '~' || this.ter[i] === 'd') && !this.depth[i]) this.depth[i] = 5;
      // bordes de espuma: agua junto a tierra o muelle
      this.foam = [];
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        if (this.t(c, r) !== '~') continue;
        const LR = this.def.lavaRects;
        if (LR && LR.some((q) => c >= q[0] && c < q[0] + q[2] && r >= q[1] && r < q[1] + q[3])) continue;
        const sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        for (let s = 0; s < 4; s++) {
          const nc = c + sides[s][0], nr = r + sides[s][1];
          if (!this.inb(nc, nr)) continue;
          if (this.t(nc, nr) !== '~') this.foam.push({ c, r, s, seed: R(c, r, 900 + s) });
        }
      }
    }

    // ---------- horneado del suelo ----------
    bake() {
      const W = this.pw, Hh = this.ph + PAD;
      const gw = TH.makeCanvas(W, Hh), gg = TH.makeCanvas(W, Hh);
      this.water = gw.c; this.ground = gg.c;
      const wg = gw.g, g = gg.g, T = TH.tiles, D0 = this.def, snow = D0.snow || (D0.epoch && D0.epochs && D0.epochs[D0.epoch] && D0.epochs[D0.epoch].snow);
      this.bakeWater(wg);
      for (let r = 0; r < this.h; r++) {
        for (let c = 0; c < this.w; c++) {
          const t = this.t(c, r), h = this.hh(c, r), x = c * TS;
          const topY = r * TS - h * HZ + PAD;
          if (t === '~') {
            // fosos de magma (def.lavaRects): costra negra, venas al rojo y burbujas
            if (D0.lavaRects && D0.lavaRects.some((q) => c >= q[0] && c < q[0] + q[2] && r >= q[1] && r < q[1] + q[3])) {
              const h = (a) => (((c * 73856093) ^ (r * 19349663) ^ (a * 83492791)) >>> 0) % 1000 / 1000;
              g.fillStyle = '#ff5a14'; g.fillRect(x, topY, TS, TS);
              g.fillStyle = '#ff9a2a'; for (let i = 0; i < 5; i++) g.fillRect(x + ((h(i) * 14) | 0), topY + ((h(i + 9) * 14) | 0), 3, 2);
              g.fillStyle = '#ffe27a'; for (let i = 0; i < 3; i++) g.fillRect(x + ((h(i + 20) * 15) | 0), topY + ((h(i + 30) * 15) | 0), 2, 1);
              g.fillStyle = '#3a0a06'; for (let i = 0; i < 4; i++) g.fillRect(x + ((h(i + 40) * 12) | 0), topY + ((h(i + 50) * 12) | 0), 4 + ((h(i + 60) * 3) | 0), 3);
              g.fillStyle = '#1a0604'; for (let i = 0; i < 2; i++) g.fillRect(x + ((h(i + 70) * 12) | 0), topY + ((h(i + 80) * 12) | 0), 3, 2);
              continue;
            }
            // agua congelada en el instante: hielo con grietas y reflejos
            if (snow) {
              g.fillStyle = '#9fc4e6'; g.fillRect(x, topY, TS, TS);
              g.fillStyle = '#c4e0f6'; g.fillRect(x + ((c * 7 + r * 3) % 9), topY + ((c * 5 + r * 11) % 12), 5, 1);
              g.fillStyle = '#7d8fd0'; g.fillRect(x + ((c * 3 + r * 7) % 12), topY + ((c * 13 + r) % 14), 1, 2); g.fillRect(x + ((c * 11 + r * 5) % 13), topY + 7, 3, 1);
            }
            continue;
          }
          // cara superior
          if (snow && (t === 'g' || t === 'f')) T.snow(g, c, r, x, topY);
          else if (t === 'g') T.grass(g, c, r, x, topY);
          else if (t === 'f') T.flowers(g, c, r, x, topY);
          else if (t === 'p' || t === 'S') T.path(g, this, c, r, x, topY);
          else if (t === 's') T.sand(g, c, r, x, topY);
          else if (t === 'r') T.cobble(g, c, r, x, topY);
          else if (t === 'd') T.dock(g, this, c, r, x, topY);
          if (t === 'd') continue;
          // sombras de contacto con terreno más alto
          const nH = this.inb(c, r - 1) && !this.isWater(c, r - 1) ? this.hh(c, r - 1) : -1;
          if (nH > h) { TH.px(g, x, topY, 'rgba(30,20,50,.32)', 16, 3); TH.px(g, x, topY + 3, 'rgba(30,20,50,.15)', 16, 2); }
          if (nH >= 0 && nH < h) TH.px(g, x, topY, 'rgba(255,255,220,.28)', 16, 1);
          const wH = this.inb(c - 1, r) && !this.isWater(c - 1, r) ? this.hh(c - 1, r) : -1;
          const eH = this.inb(c + 1, r) && !this.isWater(c + 1, r) ? this.hh(c + 1, r) : -1;
          if (wH > h) TH.px(g, x, topY, 'rgba(30,20,50,.22)', 2, 16);
          if (eH > h) TH.px(g, x + 14, topY, 'rgba(30,20,50,.22)', 2, 16);
          if (wH < h) TH.px(g, x, topY, 'rgba(20,30,30,.35)', 1, 16);
          if (eH < h) TH.px(g, x + 15, topY, 'rgba(20,30,30,.35)', 1, 16);
          // cara del acantilado hacia el sur
          const sInb = this.inb(c, r + 1);
          const sh = sInb ? this.hh(c, r + 1) : 0;
          if (h > sh) {
            const wet = sInb && (this.isWater(c, r + 1) || this.t(c, r + 1) === 'd');
            T.face(g, x, topY + 16, (h - sh) * HZ, c * 31 + r * 7, wet);
            if (this.vineAt(c, r)) T.vines(g, x, topY + 16, (h - sh) * HZ, c * 13 + r);
          }
          if (this.jumpAt(c, r)) T.ledge(g, x, topY, c * 5 + r);
        }
      }
      // escaleras: se pintan sobre la cara del tile de arriba
      for (let r = 0; r < this.h; r++) for (let c = 0; c < this.w; c++) {
        if (!this.isStair(c, r)) continue;
        const h = this.hh(c, r);
        const y0 = r * TS - (h + 1) * HZ + PAD;
        T.stairs(g, c * TS, y0, HZ, !this.isStair(c - 1, r), !this.isStair(c + 1, r));
      }
      // variación de color a gran escala: manchas de luz y sombra que rompen la repetición de los tiles
      const seed = (this.def.id || '').length * 13 + this.w * 7 + this.h;
      macro(g, W, Hh, seed, 0.2, 1);
      macro(wg, W, Hh, seed + 5, 0.12, 0);
    }

    // agua con profundidad suave: interpolación entre tiles y tramado ordenado (aspecto pixel art)
    bakeWater(wg) {
      const w = this.w, h = this.h;
      const PAL = [[104, 200, 198], [76, 176, 192], [56, 150, 184], [44, 126, 170], [38, 104, 154], [32, 86, 138], [28, 70, 120]];
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const dv = (c, r) => {
        c = c < 0 ? 0 : c >= w ? w - 1 : c;
        r = r < 0 ? 0 : r >= h ? h - 1 : r;
        const t = this.ter[r * w + c];
        return t === '~' || t === 'd' ? this.depth[r * w + c] : 0;
      };
      const img = wg.createImageData(this.pw, this.ph);
      const data = img.data;
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        const t = this.ter[r * w + c];
        if (t !== '~' && t !== 'd') continue;
        for (let yy = 0; yy < TS; yy++) for (let xx = 0; xx < TS; xx++) {
          const fx = (c * TS + xx + 0.5) / TS - 0.5, fy = (r * TS + yy + 0.5) / TS - 0.5;
          const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
          const v = (dv(x0, y0) * (1 - ax) + dv(x0 + 1, y0) * ax) * (1 - ay) + (dv(x0, y0 + 1) * (1 - ax) + dv(x0 + 1, y0 + 1) * ax) * ay;
          const px = c * TS + xx, py = r * TS + yy;
          let band = v * 1.35 + (BAYER[(py & 3) * 4 + (px & 3)] / 16 - 0.5) * 0.9;
          band = band < 0 ? 0 : band > PAL.length - 1 ? PAL.length - 1 : band;
          const col = PAL[band | 0];
          const o = (py * this.pw + px) * 4;
          data[o] = col[0]; data[o + 1] = col[1]; data[o + 2] = col[2]; data[o + 3] = 255;
        }
      }
      // el ImageData empieza en y=0; el canvas del agua lleva el margen PAD arriba
      const tmp = TH.makeCanvas(this.pw, this.ph);
      tmp.g.putImageData(img, 0, 0);
      wg.drawImage(tmp.c, 0, PAD);
      // vetas oscuras sutiles
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
        if (this.ter[r * w + c] !== '~') continue;
        for (let i = 0; i < 4; i++) TH.px(wg, c * TS + ((R(c, r, 300 + i) * 14) | 0), r * TS + PAD + ((R(c, r, 310 + i) * 15) | 0), 'rgba(20,50,90,.16)', 3, 1);
      }
    }

    // matas de hierba animadas por el viento
    collectTufts() {
      const xs = [], ys = [], ph = [], ht = [];
      for (let r = 0; r < this.h; r++) for (let c = 0; c < this.w; c++) {
        const t = this.t(c, r);
        if (t !== 'g' && t !== 'f') continue;
        if (this.occ[r * this.w + c]) continue;
        const n = R(c, r, 901) < 0.45 ? 1 + ((R(c, r, 902) * 2.4) | 0) : 0;
        for (let i = 0; i < n; i++) {
          xs.push(c * TS + 2 + ((R(c, r, 910 + i) * 12) | 0));
          ys.push(r * TS + 4 + ((R(c, r, 920 + i) * 11) | 0) - this.hh(c, r) * HZ);
          ph.push(R(c, r, 930 + i) * 6.28);
          ht.push(3 + ((R(c, r, 940 + i) * 3) | 0));
        }
      }
      this.tuftX = new Int16Array(xs); this.tuftY = new Int16Array(ys);
      this.tuftP = new Float32Array(ph); this.tuftH = new Uint8Array(ht);
    }

    // ---------- colisión y altura ----------
    levelAt(x, y) { return this.hh(Math.floor(x / TS), Math.floor(y / TS)); }
    zAt(x, y) {
      const c = Math.floor(x / TS), r = Math.floor(y / TS), h = this.hh(c, r);
      if (!this.isStair(c, r)) return h;
      const f = ((r + 1) * TS - y) / TS;
      return h + (f < 0 ? 0 : f > 1 ? 1 : f);
    }
    // nivel continuo de un punto: las escaleras son rampas (h → h+1 de sur a norte); null = no se pisa
    levelPt(px, py) {
      const c = Math.floor(px / TS), r = Math.floor(py / TS);
      if (!this.inb(c, r)) return null;
      // capa dinámica de los puzles: 255 sin cambio, 254 bloqueado, otro valor = nivel pisable
      if (this.dynLv) { const d = this.dynLv[r * this.w + c]; if (d !== 255) return d === 254 ? null : d; }
      const t = this.ter[r * this.w + c];
      if (!WALKABLE_GROUND[t]) return null;
      const h = this.hgt[r * this.w + c];
      if (t !== 'S') return h;
      const f = ((r + 1) * TS - py) / TS;
      return h + (f < 0 ? 0 : f > 1 ? 1 : f);
    }
    // cuánto se sale la caja de colisión del nivel del centro (0 = posición válida)
    violation(x, y) {
      const lc = this.levelPt(x, y);
      if (lc == null) return 1e9;
      let ex = 0;
      for (let i = 0; i < 4; i++) {
        const l = this.levelPt(i & 1 ? x + 4 : x - 4, i & 2 ? y + 1 : y - 3);
        if (l == null) return 1e9;
        const d = Math.abs(l - lc) - 0.45;
        if (d > 0) ex += d;
      }
      return ex;
    }
    solidAt(x, y) {
      const ax = x - 4, bx = x + 4, ay = y - 3, by = y + 1, s = this.solids;
      for (let i = 0; i < s.length; i++) { const b = s[i]; if (ax < b[2] && bx > b[0] && ay < b[3] && by > b[1]) return true; }
      return false;
    }
    canMove(x0, y0, x1, y1) {
      if (this.solidAt(x1, y1) && !this.solidAt(x0, y0)) return false;
      const v1 = this.violation(x1, y1);
      if (v1 === 0) return true;
      if (v1 >= 1e9) return false;
      // si ya estaba en una posición dudosa (borde lateral de una escalera), se permite salir de ella
      const v0 = this.violation(x0, y0);
      return v0 > 0 && v1 <= v0 + 1e-6;
    }
    // ¿hay agua cerca para dibujar el reflejo?
    nearWater(x, y) {
      const c = Math.floor(x / TS), r = Math.floor(y / TS);
      return this.t(c, r) === 'd' || this.isWater(c, r + 1) || this.isWater(c, r);
    }
    zoneTint(x, y, out) {
      out[0] = 1; out[1] = 1; out[2] = 1;
      for (const z of this.def.zones || []) {
        const [zx, zy, zw, zh] = z.rect;
        const x0 = zx * TS, y0 = zy * TS, x1 = x0 + zw * TS, y1 = y0 + zh * TS;
        const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1);
        const d = Math.hypot(dx, dy);
        const k = d > 64 ? 0 : 1 - d / 64;
        if (k <= 0) continue;
        const s = TH.util.smooth(k);
        out[0] *= 1 + (z.tint[0] - 1) * s; out[1] *= 1 + (z.tint[1] - 1) * s; out[2] *= 1 + (z.tint[2] - 1) * s;
      }
      return out;
    }
  }
  TH.TileMap = TileMap;
})();
