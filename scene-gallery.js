// Galería de personajes: 4 direcciones, todas las animaciones, tamaño real y retratos
(function () {
  'use strict';
  const TH = window.TH, W = TH.W, H = TH.H;
  const ANIMS = ['idle', 'walk', 'run', 'jump', 'climb', 'hang'];
  const ANIM_ES = { idle: 'Reposo', walk: 'Andar', run: 'Correr', jump: 'Saltar', climb: 'Trepar', hang: 'Colgarse' };
  const FPS = { idle: 3, walk: 11, run: 13, jump: 4, climb: 7, hang: 4 };
  const IDS = ['kaelen', 'elara', 'flint', 'firion', 'ilun', 'mira', 'fisher', 'woman', 'oldman', 'farmer', 'sailor', 'kid'];
  const DIRS = ['down', 'left', 'right', 'up'];
  const EXPR_ES = ['Neutral', 'Contento', 'Triste', 'Enfadado'];

  class GalleryScene extends TH.Scene {
    constructor() { super(); this.ci = 0; this.ai = 0; this.t = 0; this.actors = null; this.line = null; }
    enter() {
      this.t = 0;
      this.setChar(this.ci);
      // fila a tamaño real con todos
      this.line = IDS.map((id, i) => ({ def: TH.chars.defs[id], x: 20 + i * 30, sy: 208, dir: 'down', anim: 'idle', frame: 0, big: !!TH.chars.defs[id].big, chains: null }));
      for (const a of this.line) TH.chars.initChains(a);
      this.hud = document.querySelector('.hud');
      if (this.hud) this.hud.style.visibility = 'hidden';
      const bn = document.getElementById('banner');
      if (bn) bn.classList.remove('show');
      TH.ui.toast('←/→ personaje · ↑/↓ animación · B salir');
    }
    exit() { if (this.hud) this.hud.style.visibility = ''; }
    setChar(i) {
      this.ci = (i + IDS.length) % IDS.length;
      const def = TH.chars.defs[IDS[this.ci]];
      this.actors = DIRS.map((dir, k) => {
        const a = { def, x: 16 + k * 30, sy: 66, dir, anim: 'idle', frame: 0, big: !!def.big, chains: null };
        TH.chars.initChains(a);
        return a;
      });
    }
    update(dt) {
      const I = TH.input;
      this.t += dt; TH.time += dt;
      if (I.pressed('left')) this.setChar(this.ci - 1);
      if (I.pressed('right') || I.pressed('a')) this.setChar(this.ci + 1);
      if (I.pressed('up')) this.ai = (this.ai + ANIMS.length - 1) % ANIMS.length;
      if (I.pressed('down') || I.pressed('swap')) this.ai = (this.ai + 1) % ANIMS.length;
      if (I.pressed('b') || I.pressed('menu')) { TH.scenes.pop(); return; }
      const anim = ANIMS[this.ai], f = Math.floor(this.t * FPS[anim]);
      const wind = 0.6 + 0.4 * Math.sin(this.t * 0.8);
      for (const a of this.actors) { a.anim = anim; a.frame = f; TH.chars.updateChains(a, dt, wind); }
      for (let i = 0; i < this.line.length; i++) {
        const a = this.line[i];
        a.anim = i === this.ci ? 'walk' : 'idle'; a.frame = i === this.ci ? Math.floor(this.t * 11) : Math.floor(this.t * 3 + i);
        TH.chars.updateChains(a, dt, wind);
      }
    }
    render(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1b1838'); g.addColorStop(1, '#0d0b1c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // suelo de hierba bajo las 4 direcciones y la fila
      ctx.fillStyle = '#2f6a36'; ctx.fillRect(6, 132, 236, 14);
      ctx.fillStyle = '#4b9141'; ctx.fillRect(6, 132, 236, 2);
      ctx.fillStyle = '#2f6a36'; ctx.fillRect(0, 202, W, 14);
      ctx.fillStyle = '#4b9141'; ctx.fillRect(0, 202, W, 2);
      const def = this.actors[0].def, anim = ANIMS[this.ai];
      ctx.fillStyle = '#e8b84a'; ctx.font = '700 12px Cinzel, serif'; ctx.textBaseline = 'top';
      ctx.fillText(def.name.toUpperCase(), 10, 6);
      ctx.fillStyle = '#a79dbd'; ctx.font = '9px "Pixelify Sans", monospace';
      ctx.fillText(ANIM_ES[anim] + '  ·  ' + (this.ci + 1) + '/' + IDS.length, 10, 22);
      ctx.fillText('A tamaño real', 10, 156);
      // 4 direcciones a ×2
      ctx.save(); ctx.scale(2, 2);
      for (const a of this.actors) { a.shadowY = 66; TH.chars.draw(ctx, a); }
      ctx.restore();
      // fila a ×1
      for (let i = 0; i < this.line.length; i++) {
        const a = this.line[i];
        a.shadowY = 208;
        TH.chars.draw(ctx, a);
        if (i === this.ci) { ctx.fillStyle = '#e8b84a'; ctx.fillRect(a.x - 1, 212, 3, 2); }
      }
      // retratos 2×2
      const P = TH.portraits;
      for (let k = 0; k < 4; k++) {
        const x = 250 + (k & 1) * 66, y = 12 + (k >> 1) * 84;
        ctx.fillStyle = 'rgba(16,13,34,.88)'; ctx.fillRect(x - 1, y - 1, 66, 66);
        ctx.strokeStyle = 'rgba(232,184,74,.55)'; ctx.lineWidth = 1; ctx.strokeRect(x - 1.5, y - 1.5, 67, 67);
        ctx.drawImage(P.get(def.id, P.EXPR[k]), x, y);
        ctx.fillStyle = '#a79dbd'; ctx.fillText(EXPR_ES[k], x, y + 68);
      }
    }
  }
  TH.GalleryScene = GalleryScene;
})();
