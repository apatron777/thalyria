// Sprites dibujados para los protagonistas (sustituyen a los generados por capas).
// Cada héroe registra su paleta, sus poses en texto (un carácter = un píxel) y qué pose usar en cada momento.
// El juego anima a partir de esas poses: respiración, pasos y carrera moviendo solo las piernas.
(function () {
  'use strict';
  const TH = window.TH;
  const CW = 96, CH = 64, FX = 48, FY = 61; // lienzo amplio para martillos y lanzas; pies en (48, 61)
  const HEROES = {};
  const BREATH = [0, 0, 0, -1, -1, -1, 0, 0];
  function make(H, key) {
    const mir = key.endsWith('@f'), A = H.ART[mir ? key.slice(0, -2) : key], o = TH.makeCanvas(CW, CH), n = A.rows.length, flip = mir !== !!(H.flip && H.flip[key]);
    for (let y = 0; y < n; y++) for (let x = 0; x < A.rows[y].length; x++) {
      const c = H.PAL[A.rows[y][x]]; if (!c) continue;
      const dx = x - A.fx;
      o.g.fillStyle = c; o.g.fillRect(FX + (flip ? -dx : dx), FY - (n - 1 - y), 1, 1);
    }
    return o.c;
  }
  const base = (H, k) => H.base[k] || (H.base[k] = make(H, k));
  function compose(H, k, opt) {
    const src = base(H, k), o = TH.makeCanvas(CW, CH), g = o.g, bob = opt.bob || 0, dx = opt.dx || 0;
    const HIP = FY - 9, lh = CH - HIP, lw = H.legW || 7;
    if (opt.whole) { g.drawImage(src, dx, bob); return o.c; }
    const [b, f] = opt.legs || [0, 0];
    // el cuerpo entero con su balanceo; luego se borran las piernas y se dibujan con su paso (solapando una fila para no dejar huecos)
    g.drawImage(src, dx, bob);
    g.clearRect(FX - lw + dx, HIP + bob, lw * 2, CH);
    g.drawImage(src, FX - lw, HIP - 1, lw, lh + 1, FX - lw + b + dx, HIP - 1 + bob - (opt.liftB || 0), lw, lh + 1);
    g.drawImage(src, FX, HIP - 1, lw, lh + 1, FX + f + dx, HIP - 1 + bob - (opt.liftF || 0), lw, lh + 1);
    return o.c;
  }
  function frameFor(H, anim, f, view, battle) {
    const k8 = f % 8, M = H.map;
    if (battle && view !== M.down && view !== M.up) {
      const B = M.battle;
      if (anim === 'attack') return B.attack[Math.min(f, B.attack.length - 1)];
      if (anim === 'hurt') return [B.hurt, { whole: true, dx: f ? -1 : -2 }];
      if (anim === 'ko') return B.ko;
      if (anim === 'guard') return [B.idle, { whole: true, bob: 1 }];
      if (anim === 'cast') return B.cast ? [B.cast, { whole: true, dx: f & 1 }] : [B.idle, { whole: true, bob: -(f & 1) }];
      if (anim === 'win') return [B.win || B.idle, { whole: true, bob: -(f & 1) * 2 }];
      if (anim !== 'run' && anim !== 'walk') return [B.idle, { whole: true, bob: BREATH[k8] }];
    }
    if (anim === 'run' || anim === 'walk') {
      const run = anim === 'run', amp = run ? 3 : 2, bob = (k8 === 2 || k8 === 6) ? -1 : (run && (k8 === 0 || k8 === 4) ? 1 : 0);
      if ((view === M.right || view === M.left) && M.run && run) {
        // carrera dibujada: alterna sus fotogramas (volteados si va a la izquierda)
        return [M.run[(k8 >> 1) % M.run.length] + (view === M.left ? '@f' : ''), { whole: true }];
      }
      if (view === M.right || view === M.left) {
        const s = Math.round(Math.cos((k8 / 8) * Math.PI * 2) * amp), fw = view === M.right ? 1 : -1;
        return [view, { bob, dx: run ? fw : 0, legs: [-s * fw, s * fw], liftF: k8 === 2 ? 2 : 0, liftB: k8 === 6 ? 2 : 0 }];
      }
      return [view, { bob, liftB: (k8 === 1 || k8 === 2) ? (run ? 2 : 1) : 0, liftF: (k8 === 5 || k8 === 6) ? (run ? 2 : 1) : 0 }];
    }
    if (anim === 'climb' || anim === 'hang') return [M.up, { liftB: f & 1, liftF: (f + 1) & 1 }];
    if (anim === 'jump') return M.jump && view !== M.up ? [M.jump, { whole: true }] : [view, { bob: f === 0 ? 1 : -1, liftB: f ? 2 : 0, liftF: f ? 1 : 0 }];
    if (anim === 'ko') return M.battle.ko;
    if (anim === 'hurt') return [M.battle.hurt, { whole: true }];
    return [view, { bob: anim === 'idle' ? BREATH[k8] : 0 }];
  }
  function frame(H, anim, f, view) {
    const top = TH.scenes && TH.scenes.top(), battle = !!(top && TH.BattleScene && top instanceof TH.BattleScene);
    const key = anim + '|' + f + '|' + view + '|' + (battle ? 1 : 0);
    let c = H.cache.get(key);
    if (!c) { const [k, opt] = frameFor(H, anim, f, view, battle); c = compose(H, k, opt || {}); H.cache.set(key, c); }
    return c;
  }
  const C = TH.chars, _draw = C.draw.bind(C);
  C.draw = function (ctx, a, alpha) {
    const H = HEROES[a.def.id];
    if (!H) return _draw(ctx, a, alpha);
    const M = H.map, view = a.dir === 'up' ? M.up : a.dir === 'left' ? M.left : a.dir === 'right' ? M.right : M.down;
    const img = frame(H, a.anim || 'idle', (a.frame || 0) % (C.FRAMES[a.anim || 'idle'] || 8), view);
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    if (a.shadowY != null && alpha == null) TH.shadow(ctx, a.x, a.shadowY, H.shadow || 6, 2, a.state === 'jump' ? 0.22 : 0.33);
    ctx.drawImage(img, Math.round(a.x) - FX, Math.round(a.sy) - FY);
    ctx.restore();
  };
  TH.heroHD = {
    register(id, H) {
      HEROES[id] = Object.assign({ base: {}, cache: new Map() }, H);
      const def = C.defs[id];
      if (def) { def.chains = []; if (H.pal) Object.assign(def.pal, H.pal); }
    },
  };
})();
