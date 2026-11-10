// Iluminación: ambiente día/noche, luces puntuales cacheadas, haz del faro, rayos de sol y viñeta
(function () {
  'use strict';
  const TH = window.TH, U = TH.util, W = TH.W, H = TH.H;
  // color ambiente por hora (multiplicativo)
  const KF = [
    [0, [50, 62, 128]], [4.5, [58, 66, 132]], [6, [150, 110, 150]], [7, [255, 176, 140]],
    [8.5, [255, 236, 214]], [12, [255, 250, 240]], [16, [255, 238, 214]], [18, [255, 192, 150]],
    [19.3, [190, 110, 140]], [20.5, [82, 84, 150]], [24, [50, 62, 128]],
  ];
  const L = (TH.lighting = {
    init() {
      const o = TH.makeCanvas(W, H);
      this.c = o.c; this.g = o.g;
      this.sprites = new Map();
      this.amb = [255, 255, 255];
      this.night = 0;
      this.day = 1;
      this.golden = 0;
      // viñeta precalculada
      const v = TH.makeCanvas(W, H);
      const gr = v.g.createRadialGradient(W / 2, H / 2, W * 0.32, W / 2, H / 2, W * 0.72);
      gr.addColorStop(0, 'rgba(12,8,30,0)');
      gr.addColorStop(1, 'rgba(12,8,30,1)');
      v.g.fillStyle = gr;
      v.g.fillRect(0, 0, W, H);
      this.vig = v.c;
      // haz del faro precalculado
      const b = TH.makeCanvas(280, 70);
      const lg = b.g.createLinearGradient(0, 0, 280, 0);
      lg.addColorStop(0, 'rgba(255,240,200,1)');
      lg.addColorStop(0.5, 'rgba(255,230,180,.45)');
      lg.addColorStop(1, 'rgba(255,230,180,0)');
      b.g.fillStyle = lg;
      b.g.beginPath(); b.g.moveTo(0, 33); b.g.lineTo(280, 0); b.g.lineTo(280, 70); b.g.lineTo(0, 37); b.g.closePath(); b.g.fill();
      this.beamImg = b.c;
    },
    // sprite de luz radial cacheado por radio y color
    sprite(r, c) {
      r = Math.max(4, Math.round(r / 4) * 4);
      const key = r + '|' + c[0] + ',' + c[1] + ',' + c[2];
      let s = this.sprites.get(key);
      if (!s) {
        const o = TH.makeCanvas(r * 2, r * 2);
        const gr = o.g.createRadialGradient(r, r, 0, r, r, r);
        gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`);
        gr.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},.5)`);
        gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        o.g.fillStyle = gr;
        o.g.fillRect(0, 0, r * 2, r * 2);
        s = o.c;
        this.sprites.set(key, s);
      }
      return s;
    },
    // calcula ambiente y factores de noche/día/hora dorada
    setTime(hour, tint) {
      let i = 0;
      while (i < KF.length - 2 && hour >= KF[i + 1][0]) i++;
      const a = KF[i], b = KF[i + 1];
      const t = U.smooth((hour - a[0]) / (b[0] - a[0]));
      U.mixRGB(a[1], b[1], t, this.amb);
      const lum = 0.3 * this.amb[0] + 0.59 * this.amb[1] + 0.11 * this.amb[2];
      this.night = U.clamp((170 - lum) / 120, 0, 1);
      this.day = hour > 7 && hour < 17.5 ? U.smooth(U.clamp(Math.min(hour - 7, 17.5 - hour) / 1.5, 0, 1)) : 0;
      const gm = Math.max(0, 1 - Math.abs(hour - 7.2) / 1.4) + Math.max(0, 1 - Math.abs(hour - 18.4) / 1.4);
      this.golden = U.clamp(gm, 0, 1);
      if (tint) { this.amb[0] = Math.min(255, this.amb[0] * tint[0]); this.amb[1] = Math.min(255, this.amb[1] * tint[1]); this.amb[2] = Math.min(255, this.amb[2] * tint[2]); }
    },
    begin() {
      const g = this.g;
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.fillStyle = `rgb(${this.amb[0] | 0},${this.amb[1] | 0},${this.amb[2] | 0})`;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
    },
    light(x, y, r, c, a) {
      if (a <= 0.02 || x < -r || y < -r || x > W + r || y > H + r) return;
      const s = this.sprite(r, c);
      const g = this.g;
      g.globalAlpha = a > 1 ? 1 : a;
      g.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height / 2));
      g.globalAlpha = 1;
    },
    beam(x, y, ang, a) {
      if (a <= 0.02) return;
      const g = this.g;
      g.save(); g.globalAlpha = a; g.translate(x, y);
      g.rotate(ang); g.drawImage(this.beamImg, 0, -35);
      g.rotate(Math.PI); g.drawImage(this.beamImg, 0, -35);
      g.restore();
    },
    apply(ctx) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(this.c, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    },
    // rayos de sol diagonales y calidez del amanecer/atardecer
    atmosphere(ctx, t) {
      ctx.globalCompositeOperation = 'screen';
      if (this.golden > 0.01) {
        ctx.globalAlpha = 0.15 * this.golden;
        const gr = ctx.createLinearGradient(0, 0, W, H);
        gr.addColorStop(0, 'rgb(255,170,90)');
        gr.addColorStop(1, 'rgba(255,120,120,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
      const ray = Math.max(this.day * 0.9, this.golden * 0.6);
      if (ray > 0.01) {
        ctx.fillStyle = this.golden > 0.3 ? 'rgb(255,214,160)' : 'rgb(255,244,214)';
        for (let i = 0; i < 5; i++) {
          const x0 = -60 + i * 92 + Math.sin(t * 0.25 + i * 1.7) * 10;
          const w = 12 + (i % 3) * 10;
          ctx.globalAlpha = (0.05 + 0.025 * Math.sin(t * 0.6 + i)) * ray;
          ctx.beginPath();
          ctx.moveTo(x0, -10); ctx.lineTo(x0 + w, -10); ctx.lineTo(x0 + w + 150, H + 10); ctx.lineTo(x0 + 150, H + 10);
          ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    vignette(ctx) {
      ctx.globalAlpha = 0.32 + 0.28 * this.night;
      ctx.drawImage(this.vig, 0, 0);
      ctx.globalAlpha = 1;
    },
  });
})();
