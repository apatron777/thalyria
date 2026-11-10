// Partículas con pool fijo: no se crean objetos durante el juego
(function () {
  'use strict';
  const TH = window.TH;
  const K = { LEAF: 1, DUST: 2, FLY: 3, SPARK: 4, SMOKE: 5, SPRAY: 6, PUFF: 7, FLAKE: 8, BUBBLE: 9, MOTE: 10 };
  const LEAF_C = ['#9ad25a', '#f2c14e', '#6fb957', '#e8964a'];
  const P = (TH.particles = {
    K,
    N: 420,
    pool: [],
    idx: 0,
    count: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    init() {
      for (let i = 0; i < this.N; i++) this.pool.push({ on: false, k: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, s: 0, c: 0 });
    },
    cap: 1,
    spawn(k, x, y, vx, vy, life, s, c) {
      if (this.cap < 1 && Math.random() > this.cap) return null;
      for (let n = 0; n < this.N; n++) {
        this.idx = (this.idx + 1) % this.N;
        const p = this.pool[this.idx];
        if (p.on) continue;
        p.on = true; p.k = k; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.s = s || 0; p.c = c || 0;
        this.count[k]++;
        return p;
      }
      return null;
    },
    update(dt, t, wind) {
      for (let i = 0; i < this.N; i++) {
        const p = this.pool[i];
        if (!p.on) continue;
        p.life -= dt;
        if (p.life <= 0) { p.on = false; this.count[p.k]--; continue; }
        switch (p.k) {
          case K.LEAF: p.x += (p.vx + wind * 18 + Math.sin(t * 2 + p.s) * 8) * dt; p.y += p.vy * dt; break;
          case K.DUST: p.x += (p.vx + wind * 3) * dt; p.y += (p.vy + Math.sin(t + p.s) * 2) * dt; break;
          case K.FLY: p.x += Math.sin(t * 0.9 + p.s) * 9 * dt + wind * 2 * dt; p.y += Math.cos(t * 1.3 + p.s * 1.7) * 7 * dt; break;
          case K.SPARK: p.vx += Math.sin(t * 7 + p.s) * 10 * dt; p.x += p.vx * dt; p.y += p.vy * dt; break;
          case K.SMOKE: p.x += (p.vx + wind * 9) * dt; p.y += p.vy * dt; break;
          case K.SPRAY: p.vy += 60 * dt; p.x += p.vx * dt; p.y += p.vy * dt; break;
          case K.PUFF: p.x += p.vx * dt; p.y += p.vy * dt; break;
          case K.FLAKE: break;
          case K.BUBBLE: p.x += Math.sin(t * 2.4 + p.s) * 6 * dt; p.y += p.vy * dt; break;
          case K.MOTE: p.x += Math.sin(t * 1.1 + p.s) * 4 * dt; p.y += p.vy * dt; break;
        }
      }
    },
    // partículas que reciben la luz de la escena (antes de iluminar)
    draw(ctx, t) {
      for (let i = 0; i < this.N; i++) {
        const p = this.pool[i];
        if (!p.on) continue;
        const k = p.life / p.max;
        if (p.k === K.LEAF) {
          ctx.globalAlpha = Math.min(1, k * 3);
          ctx.fillStyle = LEAF_C[p.c];
          const s = Math.sin(t * 5 + p.s) > 0;
          ctx.fillRect(p.x | 0, p.y | 0, s ? 2 : 1, s ? 1 : 2);
        } else if (p.k === K.SMOKE) {
          const r = 1 + Math.round((1 - k) * 3);
          ctx.globalAlpha = 0.35 * k;
          ctx.fillStyle = '#cfc8d8';
          ctx.fillRect((p.x - r) | 0, (p.y - r) | 0, r * 2, r * 2);
        } else if (p.k === K.SPRAY) {
          ctx.globalAlpha = k;
          ctx.fillStyle = '#e8fbff';
          ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
        } else if (p.k === K.PUFF) {
          const r = 1 + Math.round((1 - k) * 2);
          ctx.globalAlpha = 0.5 * k;
          ctx.fillStyle = p.c ? '#efe0b8' : '#d9c09a';
          ctx.fillRect((p.x - r) | 0, (p.y - r) | 0, r * 2, r);
        } else if (p.k === K.FLAKE) {
          ctx.globalAlpha = Math.min(1, k * 4, (p.max - p.life) * 2) * (0.7 + 0.3 * Math.sin(t * 2 + p.s));
          ctx.fillStyle = p.c ? '#ffffff' : '#d8e6ff';
          ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
          if (p.c) { ctx.globalAlpha *= 0.4; ctx.fillRect((p.x - 1) | 0, p.y | 0, 3, 1); ctx.fillRect(p.x | 0, (p.y - 1) | 0, 1, 3); }
        }
      }
      ctx.globalAlpha = 1;
    },
    // partículas emisivas (después de la luz): luciérnagas, chispas, motas en los rayos
    glow(ctx, cx, cy, night, day) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.N; i++) {
        const p = this.pool[i];
        if (!p.on) continue;
        const k = p.life / p.max;
        const x = (p.x - cx) | 0, y = (p.y - cy) | 0;
        if (p.k === K.FLY) {
          const a = night * (0.5 + 0.5 * Math.sin(TH.time * 3 + p.s)) * Math.min(1, k * 4, (p.max - p.life) * 2);
          ctx.globalAlpha = a; ctx.fillStyle = '#eaffa0'; ctx.fillRect(x, y, 1, 1);
          ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#b8ff70'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
        } else if (p.k === K.SPARK) {
          ctx.globalAlpha = Math.min(1, k * 1.5); ctx.fillStyle = k > 0.5 ? '#ffd36a' : '#ff7a3a'; ctx.fillRect(x, y, 1, 1);
        } else if (p.k === K.BUBBLE) {
          const a = Math.min(1, k * 3, (p.max - p.life) * 2);
          ctx.globalAlpha = a * 0.8; ctx.fillStyle = p.c ? '#7ff0ff' : '#b49cff'; ctx.fillRect(x, y, 1, 1);
          if (p.s > 3) { ctx.globalAlpha = a * 0.3; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
        } else if (p.k === K.MOTE && p.c === 3) {
          // farolillo de papel que sube al cielo
          const a = Math.min(1, k * 2, (p.max - p.life) * 1.5), fl = 0.8 + 0.2 * Math.sin(TH.time * 9 + p.s);
          ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#ffb050'; ctx.fillRect(x - 2, y - 2, 6, 7);
          ctx.globalAlpha = a; ctx.fillStyle = '#c85a1a'; ctx.fillRect(x, y, 2, 3); ctx.fillStyle = '#ffd27a'; ctx.globalAlpha = a * fl; ctx.fillRect(x, y + 1, 2, 2);
          ctx.globalAlpha = a; ctx.fillStyle = '#5a2a10'; ctx.fillRect(x, y - 1, 2, 1);
        } else if (p.k === K.MOTE) {
          const a = Math.min(1, k * 3, (p.max - p.life) * 2) * (0.6 + 0.4 * Math.sin(TH.time * 4 + p.s));
          ctx.globalAlpha = a; ctx.fillStyle = p.c === 2 ? '#ffb050' : '#fff1b0'; ctx.fillRect(x, y, 1, 1);
          ctx.globalAlpha = a * 0.35; ctx.fillStyle = p.c === 2 ? '#ff5a1a' : '#ffc860'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
        } else if (p.k === K.DUST) {
          ctx.globalAlpha = day * 0.5 * Math.sin(k * Math.PI); ctx.fillStyle = '#fff2c8'; ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
