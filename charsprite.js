// Sprites de personaje por capas: esqueleto común + piezas (pelo, ropa, extras) definidas en sprites/characters.js.
// Cada fotograma se dibuja una vez, se le aplica contorno de color y se guarda en caché.
(function () {
  'use strict';
  const TH = window.TH, HZ = TH.HZ;
  const CW = 48, CH = 60, OX = 24, OY = 57; // lienzo y origen (pies)
  const FRAMES = { idle: 8, walk: 8, run: 8, jump: 3, climb: 4, hang: 2, attack: 3, hurt: 2, guard: 2, cast: 2, ko: 1, win: 2 };
  const cache = new Map();
  let G = null;
  const R = (x, y, w, h, c) => { if (w <= 0 || h <= 0) return; G.fillStyle = c; G.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const E = (cx, cy, rx, ry, c) => TH.ell(G, cx, cy, rx, ry, c);
  function line(x0, y0, x1, y1, w, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) R(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w, c);
  }

  // contorno de color: píxel transparente junto a uno opaco → mezcla oscura del vecino con el tinte
  function outline(canvas, tint) {
    const g = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const im = g.getImageData(0, 0, w, h), d = im.data, o = new Uint8ClampedArray(d);
    const tr = parseInt(tint.slice(1, 3), 16), tg = parseInt(tint.slice(3, 5), 16), tb = parseInt(tint.slice(5, 7), 16);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] > 0) continue;
      let j = -1;
      if (y < h - 1 && d[i + w * 4 + 3] > 0) j = i + w * 4;
      else if (x > 0 && d[i - 1] > 0) j = i - 4;
      else if (x < w - 1 && d[i + 7] > 0) j = i + 4;
      else if (y > 0 && d[i - w * 4 + 3] > 0) j = i - w * 4;
      if (j < 0) continue;
      o[i] = d[j] * 0.3 + tr * 0.7; o[i + 1] = d[j + 1] * 0.3 + tg * 0.7; o[i + 2] = d[j + 2] * 0.3 + tb * 0.7; o[i + 3] = 255;
    }
    g.putImageData(new ImageData(o, w, h), 0, 0);
  }
  TH.outline = outline;

  // volumen: luz desde arriba a la izquierda. Borde iluminado (rim) cálido, lado opuesto en sombra fría y violeta,
  // y un poco de oclusión hacia los pies. Se aplica sobre la silueta antes del contorno.
  function volume(canvas, opts) {
    const g = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const im = g.getImageData(0, 0, w, h), d = im.data;
    const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    let top = h, bot = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 0) { if (y < top) top = y; if (y > bot) bot = y; }
    if (bot <= top) return;
    const rimK = opts.rim == null ? 0.3 : opts.rim, shK = opts.shade == null ? 0.42 : opts.shade;
    for (let y = top; y <= bot; y++) {
      let L = -1, Rr = -1;
      for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 0) { if (L < 0) L = x; Rr = x; }
      if (L < 0) continue;
      const span = Math.max(1, Rr - L);
      const vy = (y - top) / (bot - top);
      for (let x = L; x <= Rr; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] === 0) continue;
        const tx = (x - L) / span;
        let s = tx > 0.5 ? Math.min(1, (tx - 0.5) / 0.5) ** 1.6 * shK : 0;
        if (!A(x + 1, y)) s += 0.22;
        if (!A(x, y + 1)) s += 0.12;
        s += Math.max(0, vy - 0.78) * 0.5;
        let hl = 0;
        if (!A(x - 1, y) || !A(x, y - 1)) hl = rimK;
        else if (!A(x - 1, y - 1)) hl = rimK * 0.5;
        if (hl > 0) s *= 0.3;
        s = Math.min(0.6, s);
        let r = d[i], gg = d[i + 1], b = d[i + 2];
        r *= 1 - s * 0.62; gg *= 1 - s * 0.7; b *= 1 - s * 0.34;
        if (hl > 0) { r += (255 - r) * hl; gg += (240 - gg) * hl * 0.9; b += (200 - b) * hl * 0.6; }
        d[i] = r; d[i + 1] = gg; d[i + 2] = b;
      }
    }
    g.putImageData(im, 0, 0);
  }
  TH.volume = volume;

  // ---------- poses ----------
  // Cada pose da, por pierna: avance del pie (stride), elevación (lift) y rodilla adelantada (knee);
  // por brazo: ángulo del brazo (arm, rad, + adelante), flexión del codo (bend) y brazo alzado (armUp).
  // lean: inclinación del tronco hacia delante (vista lateral) · bob: rebote · flare: faldones al viento
  function pose(anim, f) {
    const P = { bob: 0, lift: [0, 0], stride: [0, 0], knee: [1, 1], arm: [0, 0], bend: [0.15, 0.15], armUp: [0, 0], crouch: 0, hem: 0, lean: 0, flare: 0, blink: false, breath: 0 };
    if (anim === 'idle') {
      // respiración lenta y un parpadeo
      P.breath = [0, 0, 0, 1, 1, 1, 0, 0][f];
      P.bob = -P.breath;
      P.blink = f === 7;
      P.arm = [0.05, 0.05];
    } else if (anim === 'walk') {
      const a = (f / 8) * Math.PI * 2;
      for (let i = 0; i < 2; i++) {
        const q = a + i * Math.PI, c = Math.cos(q), s = Math.sin(q);
        P.stride[i] = Math.round(c * 3.5);
        P.lift[i] = s > 0 ? Math.round(s * 2) : 0;
        P.knee[i] = s > 0 ? 2 : 1;
        P.arm[i] = -c * 0.45;
        P.bend[i] = 0.25 + (c < 0 ? 0.2 : 0);
      }
      P.bob = -Math.round(Math.abs(Math.sin(a)));
      P.hem = Math.round(Math.sin(a));
      P.lean = 0;
      P.flare = 1;
    } else if (anim === 'run') {
      // zancada larga: rodilla alta delante, talón alto detrás, brazos doblados que bombean
      const a = (f / 8) * Math.PI * 2;
      for (let i = 0; i < 2; i++) {
        const q = a + i * Math.PI, c = Math.cos(q), s = Math.sin(q);
        P.stride[i] = Math.round(c * 4.5);
        P.lift[i] = s > 0 ? Math.round(s * 3.5) : 0;
        P.knee[i] = s > 0 ? (c > 0 ? 3 : -1) : 1;
        P.arm[i] = -c * 0.95;
        P.bend[i] = 1.45;
      }
      P.bob = -Math.round(Math.abs(Math.sin(a)) * 2);
      P.hem = Math.round(Math.sin(a) * 1.5);
      P.lean = 2;
      P.flare = 3;
    } else if (anim === 'jump') {
      if (f === 0) { P.crouch = 2; P.arm = [-0.6, -0.6]; P.bend = [0.6, 0.6]; P.knee = [3, 3]; P.lean = 1; }
      else if (f === 1) { P.lift = [4, 2]; P.knee = [4, 2]; P.stride = [2, -1]; P.armUp = [4, 3]; P.bob = -1; P.flare = 2; }
      else { P.lift = [1, 2]; P.stride = [3, -2]; P.knee = [2, 1]; P.armUp = [2, 2]; P.flare = 3; }
    } else if (anim === 'climb') {
      P.armUp = [[8, 3], [6, 5], [3, 8], [5, 6]][f];
      P.lift = [[0, 3], [1, 2], [3, 0], [2, 1]][f];
      P.knee = [2, 2];
    } else if (anim === 'hang') {
      P.armUp = [9, 9]; P.stride = [f ? 1 : -1, f ? -1 : 1]; P.bob = 1; P.knee = [1, 1];
    // ---- combate: poses exageradas ----
    } else if (anim === 'attack') {
      if (f === 0) { P.lean = -2; P.crouch = 2; P.stride = [-3, 3]; P.knee = [2, 2]; P.arm = [-1.9, -1.2]; P.bend = [1.2, 1.4]; P.flare = 1; P.weapon = 'back'; }
      else if (f === 1) { P.lean = 5; P.crouch = 1; P.stride = [7, -6]; P.knee = [3, -2]; P.arm = [1.57, -0.4]; P.bend = [0, 0.5]; P.bob = 1; P.flare = 4; P.weapon = 'thrust'; }
      else { P.lean = 3; P.stride = [5, -4]; P.knee = [2, 0]; P.arm = [1.2, 0.2]; P.bend = [0.2, 0.4]; P.flare = 2; P.weapon = 'thrust'; }
    } else if (anim === 'hurt') {
      P.lean = f ? -2 : -4; P.bob = f ? 0 : 1; P.crouch = 1; P.stride = [-2, 2]; P.knee = [1, 2]; P.arm = [-0.9, -1.3]; P.bend = [0.6, 0.4]; P.blink = !f; P.flare = 2;
    } else if (anim === 'guard') {
      P.lean = 1; P.crouch = 2; P.stride = [3, -3]; P.knee = [2, 1]; P.arm = [1.1, 0.9]; P.bend = [1.5, 1.6]; P.breath = f; P.bob = -f;
    } else if (anim === 'cast') {
      P.armUp = f ? [8, 7] : [5, 4]; P.bob = -f; P.lean = -1; P.flare = 1;
    } else if (anim === 'ko') {
      P.crouch = 6; P.lean = -3; P.bob = 3; P.stride = [4, 2]; P.lift = [0, 0]; P.knee = [4, 3]; P.arm = [0.4, 0.2]; P.bend = [0.2, 0.2]; P.blink = true;
    } else if (anim === 'win') {
      P.armUp = [f ? 9 : 7, 0]; P.bob = -f * 2; P.stride = [2, -2];
    }
    return P;
  }
  const poseCache = new Map();
  function poseOf(anim, f) {
    const k = anim + f;
    let p = poseCache.get(k);
    if (!p) { p = pose(anim, f); poseCache.set(k, p); }
    return p;
  }

  // ---------- partes del cuerpo ----------
  function legs(C) {
    const { m, P, po, feet, hip, side } = C;
    const cx = C.lx, lw = m.legW;
    for (let i = 0; i < 2; i++) {
      const lift = po.lift[i];
      const far = side && i === 0;
      const lc = far ? P.legs[0] : P.legs[1], bc = far ? P.boots[0] : P.boots[1];
      if (side) {
        // pierna articulada: cadera → rodilla → pie
        const hx = cx - (lw >> 1) + (far ? -1 : 0), fx = cx - (lw >> 1) + po.stride[i], fy = feet - lift;
        const kx = Math.round((hx + fx) / 2) + po.knee[i], ky = Math.round((hip + fy - 3) / 2) - (lift > 1 ? 1 : 0);
        line(hx, hip, kx, ky, lw, lc);
        line(kx, ky, fx, fy - 3, lw, lc);
        R(kx, ky, 1, 1, P.legs[0]);
        if (C.def.hd) {
          R(fx - 1, fy - 5, lw + 1, 5, bc); R(fx - 1, fy - 5, 1, 4, P.boots[2]);
          R(fx - 1, fy - 4, lw + 1, 1, P.wrap || P.boots[2]); R(fx - 1, fy - 2, lw + 1, 1, P.wrap || P.boots[2]);
          R(fx + lw, fy - 2, 2, 2, bc); R(fx - 1, fy - 1, lw + 3, 1, P.boots[0]);
        } else {
          R(fx - 1, fy - 3, lw + 1, 3, bc);
          R(fx - 1, fy - 3, lw + 1, 1, P.boots[2]);
          R(fx + lw, fy - 2, 1, 2, bc);
        }
        continue;
      }
      const lx = i === 0 ? cx - 1 - lw : cx + 1;
      const y1 = feet - lift, ph = Math.max(1, y1 - hip - 3);
      R(lx, hip, lw, ph, lc);
      R(lx + lw - 1, hip, 1, ph, P.legs[0]);
      if (lift > 1) R(lx, hip + (ph >> 1), lw, 1, P.legs[0]); // rodilla doblada
      if (C.def.hd) {
        const bx = lx - (i === 0 ? 1 : 0);
        R(lx + (i === 0 ? 0 : lw - 1), hip + 2, 1, Math.max(1, ph - 3), P.legs[0]); // pliegue del pantalón
        R(bx, y1 - 5, lw + 1, 5, bc); R(bx, y1 - 5, 1, 4, P.boots[2]);
        R(bx, y1 - 4, lw + 1, 1, P.wrap || P.boots[2]); R(bx, y1 - 2, lw + 1, 1, P.wrap || P.boots[2]);
        R(bx, y1 - 1, lw + 1, 1, P.boots[0]);
      } else {
        R(lx, y1 - 3, lw, 3, bc);
        R(lx, y1 - 3, lw, 1, P.boots[2]);
        R(lx + (i === 0 ? 0 : lw - 1), y1 - 1, 1, 1, P.boots[0]);
      }
    }
  }
  function arm(C, i) {
    const { m, P, po, cx, sh, tx, tw, side } = C;
    const aw = m.armW, len = m.torso - 1;
    const sl = P.sleeve || P.top;
    const far = side && i === 0;
    const s0 = far ? sl[0] : sl[1];
    const skin = far ? P.skin[0] : P.skin[1];
    const up = po.armUp[i];
    if (up > 0) {
      const ax = side ? cx - 1 - (aw >> 1) + (i === 0 ? -1 : 1) : i === 0 ? tx - aw : tx + tw;
      const top = sh + 2 - Math.round(up * 1.4);
      R(ax, top, aw, sh + 4 - top, s0);
      R(ax, top - 2, aw, 2, skin);
      return;
    }
    const cuff = m.cuff || len;
    const a1 = po.arm[i], a2 = a1 + po.bend[i];
    const l1 = Math.ceil(len * 0.5), l2 = len - l1;
    if (side) {
      // brazo articulado: hombro → codo → mano
      const sx = cx - (aw >> 1) + (far ? -1 : 0), sy = sh + 1;
      const ex = Math.round(sx + Math.sin(a1) * l1), ey = Math.round(sy + Math.cos(a1) * l1);
      const hx = Math.round(ex + Math.sin(a2) * l2), hy = Math.round(ey + Math.cos(a2) * l2);
      line(sx, sy, ex, ey, aw, s0);
      if (P.bracer) {
        line(ex, ey, hx, hy, aw, far ? P.bracer[0] : P.bracer[1]);
        R(Math.round((ex + hx) / 2), Math.round((ey + hy) / 2), aw, 1, far ? P.bracer[0] : P.bracer[2]);
        R(ex - 1, ey - 1, aw + 1, 2, s0); R(ex - 1, ey, aw + 1, 1, P.trim || s0);
      } else line(ex, ey, hx, hy, aw, cuff < len ? skin : s0);
      if (!far) C.hand = [hx, hy + 1];
      if (P.trim && cuff >= len) R(hx, hy, aw, 1, P.trim);
      R(hx, hy + 1, aw, 2, skin);
      return;
    }
    // de frente o de espaldas: el balanceo acorta o alarga el brazo y el codo se abre al correr
    const ax = i === 0 ? tx - aw : tx + tw;
    const lift = Math.round(Math.max(0, -Math.cos(a2) + Math.cos(a1)) * 2 + Math.max(0, Math.sin(a1)) * 2);
    const out = po.bend[i] > 1 ? (i === 0 ? -1 : 1) : 0;
    const l = Math.max(3, len - lift);
    if (P.bracer) {
      // manga ancha con puño bordado y brazal de cuero en el antebrazo
      const l1 = Math.ceil(l * 0.55), x = ax + out;
      R(x, sh + 1, aw, l1, s0);
      R(i === 0 ? x : x + aw - 1, sh + 1, 1, l1, sl[0]);
      R(i === 0 ? x : x + aw - 1, sh + 1, 1, 2, sl[2] || s0);
      R(x - (i === 0 ? 1 : 0), sh + l1, aw + 1, 2, s0); R(x - (i === 0 ? 1 : 0), sh + l1 + 1, aw + 1, 1, P.trim);
      R(x, sh + 2 + l1, aw, Math.max(1, l - l1 - 1), P.bracer[1]);
      R(i === 0 ? x : x + aw - 1, sh + 2 + l1, 1, Math.max(1, l - l1 - 1), P.bracer[0]);
      R(x, sh + 3 + l1, aw, 1, P.bracer[2]);
      R(x, sh + 1 + l, aw, 2, skin);
      return;
    }
    R(ax + out, sh + 1, aw, l, s0);
    R(i === 0 ? ax + out : ax + out + aw - 1, sh + 1, 1, l, sl[0]);
    if (cuff < l) R(ax + out, sh + 1 + cuff, aw, l - cuff, skin);
    else if (P.trim) R(ax + out, sh + l, aw, 1, P.trim);
    R(ax + out, sh + 1 + l, aw, 2, skin);
  }
  function head(C) {
    const { m, P, cx, hcy, dir } = C;
    const hw = m.headW >> 1, hh = m.headH >> 1;
    E(cx, hcy, hw, hh, P.skin[0]);
    E(cx - 1, hcy - 1, hw - 1, hh - 1, P.skin[1]);
    const lash = P.lash || P.outline;
    if (C.po.blink && dir !== 'up') {
      const ey = hcy + 2;
      if (dir === 'down') { R(cx - 4, ey, 2, 1, lash); R(cx + 2, ey, 2, 1, lash); R(cx - 1, hcy + 4, 2, 1, P.skin[0]); }
      else { R(cx + 2, ey, 2, 1, lash); R(cx + hw, hcy + 2, 1, 1, P.skin[1]); R(cx - 2, hcy + 1, 2, 2, P.skin[0]); }
      return;
    }
    if (dir === 'down') {
      const ey = hcy + 1;
      R(cx - 4, ey, 2, 2, P.eye); R(cx + 2, ey, 2, 2, P.eye);
      R(cx - 4, ey, 1, 1, '#ffffff'); R(cx + 2, ey, 1, 1, '#ffffff');
      R(cx - 3, ey, 1, 2, '#1a1428'); R(cx + 2, ey, 1, 2, '#1a1428');
      R(cx - 4, ey - 1, 2, 1, lash); R(cx + 2, ey - 1, 2, 1, lash);
      R(cx - 5, ey + 2, 1, 1, '#e89a8a'); R(cx + 4, ey + 2, 1, 1, '#e89a8a');
      R(cx - 1, hcy + 4, 2, 1, P.skin[0]);
    } else if (dir === 'side') {
      const ey = hcy + 1;
      R(cx + 2, ey - 1, 2, 1, lash); R(cx + 2, ey, 2, 2, P.eye); R(cx + 3, ey, 1, 2, '#1a1428'); R(cx + 2, ey, 1, 1, '#ffffff');
      R(cx + hw, hcy + 2, 1, 1, P.skin[1]);
      R(cx - 2, hcy + 1, 2, 2, P.skin[0]);
      R(cx + 2, hcy + 4, 2, 1, P.skin[0]);
    }
  }
  // punta afilada (mechones, pinchos): se estrecha del arranque a la punta
  function spike(x0, y0, x1, y1, w, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) {
      const k = i / n, s2 = Math.max(1, Math.round(w * (1 - k * 0.85)));
      R(Math.round(x0 + (x1 - x0) * k - (s2 >> 1)), Math.round(y0 + (y1 - y0) * k - (s2 >> 1)), s2, s2, c);
    }
  }
  // cabeza con mandíbula y mentón (personajes detallados)
  function headHD(C) {
    const { m, P, cx, hcy, hb, dir } = C;
    const hw = m.headW >> 1, hh = m.headH >> 1, S0 = P.skin[0], S1 = P.skin[1];
    R(cx - 2, hb - 1, 4, 3, S0); // cuello
    if (dir === 'up') { E(cx, hcy, hw, hh, S0); return; }
    if (dir === 'side') {
      E(cx, hcy - 1, hw, hh - 1, S0);
      R(cx - 2, hcy + hh - 4, hw + 1, 3, S0); R(cx + hw - 5, hb - 2, 5, 1, S0); R(cx + hw - 4, hb - 1, 3, 1, S0);
      E(cx + 1, hcy - 1, hw - 2, hh - 2, S1); R(cx, hcy + hh - 4, hw - 1, 2, S1);
      R(cx + hw, hcy, 1, 3, S1); R(cx + hw, hcy + 2, 1, 1, S0); // nariz
      R(cx - 3, hcy - 1, 2, 4, S0); R(cx - 2, hcy, 1, 2, S1); // oreja
      return;
    }
    E(cx, hcy - 1, hw, hh - 1, S0);
    R(cx - hw + 2, hcy + hh - 4, m.headW - 4, 2, S0); R(cx - 3, hb - 2, 7, 1, S0); R(cx - 2, hb - 1, 5, 1, S0);
    E(cx - 1, hcy - 2, hw - 1, hh - 2, S1); R(cx - hw + 3, hcy + hh - 4, m.headW - 7, 2, S1); R(cx - 2, hb - 2, 4, 1, S1);
  }
  // ojos, cejas, nariz y boca encima del pelo
  function faceHD(C) {
    const { P, cx, hcy, dir, po, def } = C;
    if (dir === 'up') return;
    const lash = P.lash || P.outline, brow = P.brow || P.hair[0], ey = hcy + 1, eyeD = P.eyeD || '#2a1d34';
    const beard = def.hair === 'beard';
    if (dir === 'side') {
      if (po.blink) R(cx + 2, ey + 1, 3, 1, lash);
      else { R(cx + 3, ey, 2, 2, P.eye); R(cx + 3, ey + 1, 2, 1, eyeD); R(cx + 4, ey, 1, 2, '#1a1028'); R(cx + 3, ey, 1, 1, '#ffffff'); R(cx + 2, ey - 1, 3, 1, lash); }
      R(cx + 2, ey - 3, 3, 1, brow); R(cx + 5, ey - 2, 1, 1, brow);
      if (!beard) R(cx + (C.m.headW >> 1) - 3, ey + 4, 2, 1, P.mouth || '#6a2a24');
      return;
    }
    const eye = (x, mir) => {
      if (po.blink) { R(x, ey + 1, 3, 1, lash); return; }
      R(x, ey, 3, 2, P.eye); R(x, ey + 1, 3, 1, eyeD);
      R(x + 1, ey, 1, 2, '#1a1028');
      R(x + (mir ? 2 : 0), ey, 1, 1, '#ffffff');
      R(x, ey - 1, 3, 1, lash); R(mir ? x + 3 : x - 1, ey - 1, 1, 2, lash);
    };
    eye(cx - 5, false); eye(cx + 2, true);
    // cejas con gesto decidido (el extremo interior más bajo)
    R(cx - 6, ey - 3, 3, 1, brow); R(cx - 3, ey - 2, 1, 1, brow);
    R(cx + 3, ey - 3, 3, 1, brow); R(cx + 2, ey - 2, 1, 1, brow);
    if (!beard) { R(cx, ey + 3, 1, 1, P.skin[0]); R(cx - 1, ey + 5, 3, 1, P.mouth || '#6a2a24'); }
  }
  function torsoBase(C, col) {
    const { tx, tw, sh, hip } = C;
    R(tx, sh, tw, hip - sh, col[1]);
    R(tx, sh, 1, hip - sh, col[2]);
    R(tx + tw - 1, sh, 1, hip - sh, col[0]);
    R(tx, sh, tw, 1, col[2]);
  }

  // ---------- ropa ----------
  const OUTFIT = {
    // abrigo largo abierto, cuello alto con forro, bordados y fajín
    coat2: {
      lower(C) {
        const { tx, tw, hip, P, side, up, cx, po } = C, L = C.m.coat || 7, T = P.top, emb = P.trim;
        if (side) {
          for (let y = 0; y < L; y++) {
            const k = y / (L - 1), back = Math.round(po.flare * k + k * 2), lift = Math.round(po.flare * k * 0.5);
            const x0 = tx - 1 - back, x1 = tx + tw + Math.round(k), yy = hip + y - lift;
            R(x0, yy, x1 - x0, 1, T[1]); R(x0, yy, 1, 1, T[0]); R(x1 - 1, yy, 1, 1, T[2]);
            if (y === L - 1) R(x0, yy, x1 - x0, 1, emb);
            else if (y === L - 3) for (let x = x0 + 1; x < x1 - 1; x += 2) R(x, yy, 1, 1, emb);
          }
          return;
        }
        if (up) {
          for (let y = 0; y < L; y++) {
            const k = y / (L - 1), w = (tw >> 1) + 1 + Math.round(k * 2), sw = Math.round(po.hem * k);
            R(cx - w + sw, hip + y, w * 2 + 1, 1, T[1]); R(cx - w + sw, hip + y, 1, 1, T[2]); R(cx + w + sw, hip + y, 1, 1, T[0]);
            R(cx + sw, hip + y, 1, 1, T[0]);
            if (y === L - 1) R(cx - w + sw, hip + y, w * 2 + 1, 1, emb);
            else if (y === L - 3) for (let x = -w + 1; x < w; x += 2) R(cx + x + sw, hip + y, 1, 1, emb);
          }
          return;
        }
        const sw = po.hem;
        for (let y = 0; y < L; y++) {
          const k = y / (L - 1), out = Math.round(k * 2.5), open = Math.round(k * 1.5);
          const xa = tx - 1 - out + Math.min(0, sw), xb = cx - 1 - open, xc = cx + 2 + open, xd = tx + tw + out + Math.max(0, sw);
          const yy = hip + y;
          if (y < 3) R(xb, yy, xc - xb, 1, y === 2 ? P.innerS || P.inner : P.inner);
          R(xa, yy, xb - xa, 1, T[1]); R(xa, yy, 1, 1, T[2]); R(xb - 1, yy, 1, 1, T[0]);
          R(xc, yy, xd - xc, 1, T[1]); R(xd - 1, yy, 1, 1, T[0]); R(xc, yy, 1, 1, T[2]);
          if (y === L - 1) { R(xa, yy, xb - xa, 1, emb); R(xc, yy, xd - xc, 1, emb); }
          else if (y === L - 3) { for (let x = xa + 1; x < xb - 1; x += 2) R(x, yy, 1, 1, emb); for (let x = xc + 1; x < xd - 1; x += 2) R(x, yy, 1, 1, emb); }
          else if (y % 2) { R(xb - 1, yy, 1, 1, emb); R(xc, yy, 1, 1, emb); }
        }
      },
      torso(C) {
        const { tx, tw, sh, hip, P, cx, side, up } = C, T = P.top, emb = P.trim, lin = P.lining || P.accent2;
        torsoBase(C, T);
        if (up) {
          R(cx, sh + 2, 1, hip - sh - 5, T[0]);
          R(cx - 2, hip - 5, 5, 1, emb); R(cx - 1, hip - 6, 3, 1, emb); R(cx, hip - 7, 1, 1, emb); R(cx - 3, hip - 4, 1, 1, emb); R(cx + 3, hip - 4, 1, 1, emb);
          R(tx, sh, tw, 1, T[2]);
          R(tx + 1, sh - 2, tw - 2, 2, T[1]); R(tx + 2, sh - 2, tw - 4, 1, T[2]);
        } else if (side) {
          R(tx + tw - 3, sh + 1, 2, hip - sh - 3, P.inner); R(tx + tw - 2, sh + 2, 1, hip - sh - 5, P.innerS || P.inner);
          for (let y = sh + 3; y < hip - 3; y += 2) R(tx + tw - 4, y, 1, 1, emb);
          R(tx + tw - 4, sh - 2, 3, 3, T[1]); R(tx + tw - 3, sh - 1, 1, 2, lin); R(tx + tw - 4, sh - 2, 3, 1, T[2]);
          R(tx, sh, tw - 3, 1, T[2]); R(tx, sh + 1, 1, hip - sh - 4, T[2]);
          R(tx + 1, sh + 5, 2, 1, T[0]);
        } else {
          R(cx - 2, sh + 1, 5, hip - sh - 1, P.inner); R(cx + 2, sh + 1, 1, hip - sh - 1, P.innerS || P.inner);
          R(cx, sh + 1, 1, 2, P.skin[0]);
          for (let i = 0; i < 6; i++) {
            const d = i >> 1;
            R(cx - 4 + d, sh + i, 2, 1, T[2]); R(cx + 3 - d, sh + i, 2, 1, T[0]);
            if (i % 2 === 0) { R(cx - 3 + d, sh + i, 1, 1, emb); R(cx + 3 - d, sh + i, 1, 1, emb); }
          }
          for (let y = sh + 7; y < hip - 3; y += 2) { R(cx - 3, y, 1, 1, emb); R(cx + 3, y, 1, 1, emb); }
          R(cx - 6, sh - 3, 3, 4, T[1]); R(cx + 4, sh - 3, 3, 4, T[0]);
          R(cx - 4, sh - 2, 1, 3, lin); R(cx + 4, sh - 2, 1, 3, lin);
          R(cx - 6, sh - 3, 3, 1, T[2]); R(cx + 4, sh - 3, 3, 1, emb);
          R(tx, sh, 3, 1, T[2]); R(tx, sh, 1, hip - sh - 3, T[2]); R(tx + tw - 1, sh, 1, hip - sh - 3, T[0]);
          R(cx, sh + 4, 1, 1, '#e8b84a');
        }
        R(tx, hip - 3, tw, 3, P.accent); R(tx, hip - 3, tw, 1, P.accentL || P.accent); R(tx, hip - 1, tw, 1, P.accent2);
        if (!up && !side) { R(cx + 2, hip - 4, 3, 4, P.accent2); R(cx + 2, hip - 4, 2, 1, P.accent); R(cx + 3, hip - 3, 1, 1, P.accentL || P.accent); }
        if (side) R(tx - 1, hip - 4, 2, 4, P.accent2);
      },
    },
    coat: {
      lower(C) {
        const { tx, tw, hip, P, side, up, cx } = C, L = C.m.coat || 6;
        if (side) {
          // faldones: el de atrás se abre con la carrera
          const fl = C.po.flare;
          for (let y = 0; y < L; y++) {
            const k = y / (L - 1), back = Math.round(fl * k), lift = Math.round(fl * k * 0.5);
            const x0 = tx - 1 - back, yy = hip + y - lift;
            R(x0, yy, tw + 1 + back - Math.round(k * 1), 1, P.top[1]);
            R(x0, yy, 1, 1, P.top[0]);
            if (y === L - 1) R(x0, yy, tw + 1 + back - Math.round(k), 1, P.trim);
          }
          R(C.lx + 1, hip, Math.max(1, tx + tw - C.lx - 1), 2, P.top[2]);
          return;
        }
        if (up) { R(tx - 1, hip, tw + 2, L, P.top[1]); R(cx, hip, 1, L, P.top[0]); R(tx - 1, hip + L - 1, tw + 2, 1, P.trim); return; }
        const half = tw >> 1, sw = C.po.hem;
        R(tx - 1 + Math.min(0, sw), hip, half, L, P.top[1]); R(tx + half + 1 + Math.max(0, sw), hip, tw - half, L, P.top[1]);
        R(tx - 1, hip, 1, L, P.top[2]); R(tx + tw, hip, 1, L, P.top[0]);
        R(tx - 1, hip + L - 1, half, 1, P.trim); R(tx + half + 1, hip + L - 1, tw - half, 1, P.trim);
      },
      torso(C) {
        const { tx, tw, sh, hip, P, cx, side, up } = C;
        torsoBase(C, P.top);
        if (!up && !side) { R(cx - 1, sh, 3, 5, P.inner); R(cx, sh + 5, 1, hip - sh - 6, P.top[0]); R(tx + 1, sh + 3, 1, 1, P.trim); R(tx + tw - 2, sh + 3, 1, 1, P.trim); }
        if (side) { R(tx + tw - 2, sh, 2, 4, P.inner); R(tx + 1, sh + 4, 1, 1, P.trim); }
        if (up) for (let k = 0; k < 3; k++) R(cx - 1 + (k % 2) * 2, sh + 3 + k * 2, 1, 1, P.trim);
        R(tx, hip - 2, tw, 2, P.accent); R(tx, hip - 1, tw, 1, P.accent2 || P.accent);
        R(tx - 1, sh, tw + 2, 2, P.top[0]); // cuello alto
        if (P.scarf) { R(tx - 1, sh - 1, tw + 2, 3, P.scarf[1]); R(tx, sh - 1, tw, 1, P.scarf[0]); if (!up && !side) R(cx + 2, sh + 2, 2, 3, P.scarf[1]); }
      },
    },
    robe: {
      lower(C) {
        const { cx, feet, tw, P, po, side, up } = C;
        const top = C.hip - 2;
        for (let y = top; y < feet - 1; y++) {
          const k = (y - top) / (feet - 1 - top);
          const w = Math.round(tw / 2 + k * 4);
          const sway = Math.round(po.hem * k);
          const x0 = cx - w + sway - (side ? 1 : 0);
          R(x0, y, w * 2 + 1, 1, P.top[1]); R(x0, y, 1, 1, P.top[2]); R(x0 + w * 2, y, 1, 1, P.top[0]);
        }
        const w = Math.round(tw / 2 + 4);
        R(cx - w + po.hem - (side ? 1 : 0), feet - 2, w * 2 + 1, 1, P.trim);
        if (!side && !up) R(cx, top, 1, feet - 1 - top, P.trim);
        if (C.def.hd) {
          // pliegues, sombra lateral y bordado dorado
          for (let y = top + 3; y < feet - 2; y++) {
            const k = (y - top) / (feet - 1 - top), ww = Math.round(tw / 2 + k * 4), sway = Math.round(po.hem * k), x0 = cx - ww + sway - (side ? 1 : 0);
            R(x0 + ww * 2 - 1, y, 1, 1, P.top[0]); R(x0 + ww * 2 - 2, y, 1, 1, k > 0.5 ? P.top[0] : P.top[1]);
            if (!side && y % 3 === 0) { R(x0 + 3, y, 1, 1, P.top[0]); R(x0 + ww * 2 - 5, y, 1, 1, P.top[0]); }
            if (!side && !up && y % 2 === 0) { R(cx - 1, y, 1, 1, P.trim); R(cx + 1, y, 1, 1, P.trim); }
          }
          const x0 = cx - w + po.hem - (side ? 1 : 0);
          for (let x = 1; x < w * 2; x += 2) R(x0 + x, feet - 4, 1, 1, P.trim);
          R(x0, feet - 3, w * 2 + 1, 1, P.accent);
        }
      },
      torso(C) {
        const { tx, tw, sh, P, cx, up, side } = C;
        torsoBase(C, P.top);
        R(tx, sh + 5, tw, 2, P.accent);
        if (!up && !side) R(cx - 2, sh, 5, 2, P.trim);
        if (C.def.hd) {
          R(tx + tw - 2, sh + 1, 2, 4, P.top[0]); R(tx, sh + 1, 1, 4, P.top[2]);
          R(tx, sh + 5, tw, 1, '#7fe0d8');
          if (!up && !side) {
            R(cx - 1, sh + 2, 3, 2, P.trim); R(cx, sh + 2, 1, 1, '#7fffe0'); // broche
            R(cx + 2, sh + 5, 3, 3, P.accent); R(cx + 3, sh + 7, 1, 2, P.accent); R(cx - 4, sh + 5, 1, 2, '#2a8a86'); // lazo
          }
          if (up) { R(cx - 3, sh + 5, 7, 2, P.accent); R(cx - 1, sh + 6, 3, 3, '#2a8a86'); }
        }
      },
    },
    dress: {
      lower(C) {
        const { cx, hip, tw, P, po, side } = C;
        for (let y = hip - 2; y < hip + 4; y++) { const w = Math.round(tw / 2 + (y - hip + 2) * 0.6); R(cx - w + (side ? -1 : 0) + Math.round(po.hem * 0.5), y, w * 2 + 1, 1, P.top[1]); }
        R(cx - Math.round(tw / 2 + 3), hip + 3, Math.round(tw + 7), 1, P.trim);
      },
      torso(C) { torsoBase(C, C.P.top); R(C.tx, C.sh, C.tw, 1, C.P.trim); },
    },
    apron: {
      lower(C) {
        const { tx, tw, hip, P, side, up, cx } = C;
        if (up) { R(tx, hip, tw, 3, P.top[0]); return; }
        const L = 8;
        if (side) { R(tx + tw - 4, hip, 4, L, P.apron[1]); R(tx + tw - 4, hip + L - 1, 4, 1, P.apron[0]); return; }
        R(tx + 1, hip, tw - 2, L, P.apron[1]); R(tx + 1, hip, 1, L, P.apron[2]); R(tx + 1, hip + L - 1, tw - 2, 1, P.apron[0]);
        if (C.def.hd) {
          for (let y = hip + 1; y < hip + L - 1; y += 2) { R(tx + 2, y, 1, 1, P.apron[2]); R(tx + tw - 3, y, 1, 1, P.apron[2]); }
          R(cx - 3, hip + 2, 6, 3, P.apron[0]); R(cx - 3, hip + 2, 6, 1, P.apron[2]); R(cx + 1, hip + 3, 1, 1, '#5d6270');
          R(tx + tw - 3, hip, 1, L - 1, P.apron[0]);
        }
      },
      torso(C) {
        const { tx, tw, sh, hip, P, cx, side, up } = C;
        torsoBase(C, P.top);
        R(tx, hip - 2, tw, 2, P.belt);
        if (up) { line(tx + 1, sh + 1, tx + tw - 2, hip - 3, 1, P.apron[0]); line(tx + tw - 2, sh + 1, tx + 1, hip - 3, 1, P.apron[0]); return; }
        if (side) { R(tx + tw - 4, sh + 3, 4, hip - sh - 3, P.apron[1]); R(tx + tw - 3, sh, 1, 3, P.apron[0]); return; }
        R(tx + 2, sh + 3, tw - 4, hip - sh - 3, P.apron[1]); R(tx + 2, sh + 3, tw - 4, 1, P.apron[2]);
        R(tx + 2, sh, 1, 3, P.apron[0]); R(tx + tw - 3, sh, 1, 3, P.apron[0]);
        R(cx - 2, sh + 6, 4, 3, P.apron[0]);
        if (C.def.hd) {
          // costuras, bolsillo, hebilla y pliegues de la camisa
          for (let y = sh + 4; y < hip - 2; y += 2) { R(tx + 3, y, 1, 1, P.apron[2]); R(tx + tw - 4, y, 1, 1, P.apron[2]); }
          R(cx - 2, sh + 6, 4, 1, P.apron[2]); R(cx - 1, sh + 7, 2, 1, '#c8c8d0');
          R(tx, sh + 1, 1, 6, P.top[2]); R(tx + 1, sh + 4, 1, 2, P.top[0]); R(tx + tw - 2, sh + 3, 1, 3, P.top[0]);
          R(cx - 1, hip - 2, 3, 2, '#e8b84a'); R(cx, hip - 2, 1, 1, '#fff0a0');
        }
      },
    },
    armor: {
      lower(C) {
        const { tx, tw, hip, P } = C;
        R(tx, hip, tw, 4, P.top[0]); R(tx, hip, tw, 1, P.trim);
        for (let k = 1; k < tw; k += 3) R(tx + k, hip + 1, 1, 3, P.top[1]);
        if (C.def.hd) { for (let k = 1; k < tw; k += 3) { R(tx + k, hip + 1, 1, 1, P.top[2]); R(tx + k + 1, hip + 3, 1, 1, P.trim); } R(tx, hip + 4, tw, 1, P.top[0]); }
      },
      torso(C) {
        const { tx, tw, sh, hip, P, cx, side, up } = C;
        torsoBase(C, P.top);
        R(tx, hip - 2, tw, 2, P.belt);
        if (!up) { R(cx - (side ? 0 : 1), sh + 2, side ? 2 : 3, hip - sh - 4, P.top[2]); R(tx, sh + 5, tw, 1, P.trim); }
        if (side) { E(cx, sh + 1, 3, 2, P.top[0]); E(cx - 1, sh, 3, 2, P.top[1]); R(cx - 2, sh - 1, 4, 1, P.trim); }
        else { E(tx, sh + 1, 3, 2, P.top[1]); E(tx + tw - 1, sh + 1, 3, 2, P.top[1]); R(tx - 2, sh - 1, 3, 1, P.trim); R(tx + tw - 1, sh - 1, 3, 1, P.trim); }
        if (C.def.hd && !up) {
          // peto con arista, sombra y remaches dorados
          if (!side) {
            R(tx + 1, sh + 2, 2, hip - sh - 4, P.top[2]); R(tx + tw - 3, sh + 2, 2, hip - sh - 4, P.top[0]);
            R(cx, sh + 2, 1, hip - sh - 4, '#ffffff'); R(cx + 1, sh + 3, 1, hip - sh - 6, P.top[0]);
            R(cx - 3, sh + 1, 7, 1, P.trim); R(tx + 2, hip - 4, 1, 1, P.trim); R(tx + tw - 3, hip - 4, 1, 1, P.trim);
            E(tx - 1, sh + 1, 3, 2, P.top[2]); R(tx - 3, sh + 2, 2, 1, P.top[0]); R(tx + tw + 1, sh + 2, 2, 1, P.top[0]);
            R(cx - 1, hip - 2, 3, 2, P.trim);
          } else {
            R(tx + tw - 2, sh + 2, 1, hip - sh - 4, '#ffffff'); R(tx, sh + 2, 1, hip - sh - 4, P.top[0]); R(tx + 1, sh + 1, tw - 2, 1, P.trim);
          }
        }
      },
    },
    tunic: {
      lower(C) {
        const { tx, tw, hip, P, side, up } = C;
        R(tx, hip, tw, 2, P.top[0]);
        if (P.apron && !up) { if (side) R(tx + tw - 3, hip - 4, 3, 8, P.apron[1]); else R(tx + 2, hip - 4, tw - 4, 8, P.apron[1]); }
      },
      torso(C) {
        const { tx, tw, sh, hip, P } = C;
        torsoBase(C, P.top);
        if (P.stripe) for (let y = sh + 2; y < hip - 2; y += 3) R(tx, y, tw, 1, P.stripe);
        R(tx, hip - 2, tw, 1, P.belt || P.top[0]);
      },
    },
  };

  // ---------- peinados ----------
  const HAIR = {
    // melena de pinchos con brillos azules y mechones turquesa
    spiky2: {
      behind(C) {
        const { cx, ht, hcy, hb, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') return;
        if (dir === 'side') {
          spike(cx - hw + 1, ht + 3, cx - hw - 5, ht + 2, 4, H[0]);
          spike(cx - hw + 1, hcy - 1, cx - hw - 5, hcy + 2, 4, H[0]);
          spike(cx - hw + 2, hcy + 3, cx - hw - 3, hb + 3, 3, H[0]);
          return;
        }
        E(cx, hcy - 1, hw + 1, (m.headH >> 1), H[0]);
        spike(cx - hw + 1, hcy - 4, cx - hw - 4, hcy - 3, 3, H[0]);
        spike(cx - hw + 1, hcy, cx - hw - 3, hcy + 5, 3, H[0]);
        spike(cx + hw - 1, hcy - 4, cx + hw + 4, hcy - 4, 3, H[0]);
        spike(cx + hw - 1, hcy, cx + hw + 3, hcy + 5, 3, H[0]);
      },
      draw(C) {
        const { cx, ht, hb, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1, H3 = H[3] || H[2], ey = hcy + 1;
        if (dir === 'up') {
          E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]);
          for (const [x0, y0, x1, y1] of [[-hw + 1, hcy - 3, -hw - 4, hcy - 3], [hw - 1, hcy - 3, hw + 4, hcy - 3], [-hw + 1, hcy + 1, -hw - 3, hcy + 5], [hw - 1, hcy + 1, hw + 3, hcy + 5], [-4, ht + 2, -6, ht - 3], [0, ht + 1, 1, ht - 4], [4, ht + 2, 6, ht - 2]])
            spike(cx + x0, y0, cx + x1, y1, 3, H[1]);
          for (const k of [-4, 0, 4]) spike(cx + k, hb - 3, cx + k + (k >> 2), hb + 2, 3, H[0]);
          R(cx - 4, ht + 2, 6, 1, H[2]); R(cx - 5, ht + 3, 2, 1, H3); R(cx + 2, ht + 4, 3, 1, H[2]); R(cx - 1, ht + 6, 1, 3, H[2]);
          R(cx - hw - 1, hcy, 1, 5, P.streak); R(cx + hw, hcy + 1, 1, 4, P.streak);
          return;
        }
        if (dir === 'side') {
          // de perfil (mira a la derecha): el pelo cubre la nuca y deja la cara despejada
          E(cx - 3, hcy - 3, hw - 1, (m.headH >> 1) - 1, H[1]);
          R(cx - hw - 1, ht + 4, hw - 2, m.headH - 5, H[1]);
          spike(cx - 3, ht + 2, cx - 5, ht - 3, 3, H[1]); spike(cx + 1, ht + 2, cx + 2, ht - 3, 3, H[1]); spike(cx - 7, ht + 3, cx - 10, ht, 3, H[1]);
          spike(cx + 3, ht + 3, cx + hw + 1, ey - 3, 3, H[1]); spike(cx + 1, ht + 4, cx + 2, ey - 2, 2, H[1]);
          R(cx - 5, ht + 2, 6, 1, H[2]); R(cx - 4, ht + 3, 2, 1, H3); R(cx - hw, ht + 6, 4, 1, H[2]); R(cx + 1, ht - 1, 1, 2, H[2]);
          spike(cx - 2, hcy, cx - 3, hb + 3, 1, P.streak); R(cx - hw, hcy + 2, 1, 3, P.streak);
          return;
        }
        // de frente: casco de pelo, flequillo de pinchos que deja ver los ojos y mechones a los lados
        E(cx, ht + 3, hw + 1, 4, H[1]);
        spike(cx - 4, ht + 2, cx - 6, ht - 3, 3, H[1]); spike(cx, ht + 1, cx + 1, ht - 4, 3, H[1]); spike(cx + 4, ht + 2, cx + 6, ht - 2, 3, H[1]);
        for (const [x0, x1, y1] of [[-6, -7, hcy + 3], [-3, -3, ey - 3], [0, 0, ey - 2], [3, 3, ey - 3], [6, 7, hcy + 3]]) spike(cx + x0, ht + 3, cx + x1, y1, 3, H[1]);
        spike(cx - hw, hcy - 2, cx - hw - 1, hb + 1, 2, H[1]); spike(cx + hw, hcy - 2, cx + hw + 1, hb + 1, 2, H[1]);
        R(cx - 5, ht + 1, 6, 1, H[2]); R(cx - 6, ht + 2, 2, 1, H3); R(cx + 2, ht + 1, 3, 1, H[2]); R(cx, ht - 2, 1, 3, H[2]);
        R(cx - 3, ht + 4, 1, 2, H[2]); R(cx + 3, ht + 4, 1, 2, H[2]); R(cx - 6, ht + 5, 1, 2, H3);
        spike(cx - hw, hcy, cx - hw, hb + 3, 1, P.streak); R(cx + hw, hcy + 1, 1, 3, P.streak);
      },
    },
    spiky: {
      draw(C) {
        const { cx, ht, hb, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') {
          E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]);
          for (const k of [-5, -2, 1, 4]) { R(cx + k, ht - 2, 2, 3, H[1]); R(cx + k, hb - 1, 2, 3, H[1]); }
          R(cx - 3, ht + 1, 4, 1, H[2]); E(cx, hcy + 3, hw, 2, H[0]);
          R(cx - hw - 1, hcy, 1, 4, P.streak);
          return;
        }
        if (dir === 'side') {
          E(cx - 1, ht + 2, hw + 1, 4, H[1]); R(cx - hw - 1, ht + 2, hw - 1, m.headH - 3, H[1]);
          R(cx - hw - 3, ht + 1, 3, 2, H[1]); R(cx - hw - 4, ht + 4, 3, 2, H[1]); R(cx - hw - 3, ht + 7, 2, 2, H[1]);
          for (const k of [-3, 0, 3]) R(cx + k, ht - 3, 2, 3, H[1]);
          R(cx + hw - 2, ht + 3, 3, 2, H[1]); R(cx + hw, ht + 5, 2, 2, H[1]);
          R(cx - 2, ht + 1, 4, 1, H[2]); R(cx - hw, ht + 6, 1, 5, P.streak);
          return;
        }
        E(cx, ht + 4, hw + 1, 5, H[1]);
        for (const k of [-5, -2, 1, 4]) { R(cx + k, ht - 1, 2, 2, H[1]); R(cx + k + (k < 0 ? -1 : 1), ht - 3, 1, 2, H[1]); }
        for (let i = -hw; i <= hw; i++) R(cx + i, ht + 5, 1, (i + hw) % 3 === 0 ? 3 : 1, H[1]);
        R(cx - hw - 1, ht + 3, 2, m.headH - 4, H[1]); R(cx + hw, ht + 3, 2, m.headH - 4, H[1]);
        R(cx - 3, ht + 1, 4, 1, H[2]); R(cx + 1, ht + 2, 2, 1, H[2]);
        R(cx - hw - 1, ht + 6, 1, 5, P.streak); R(cx + hw + 1, ht + 6, 1, 5, P.streak);
      },
    },
    long: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir, sh } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') {
          const end = sh + 12;
          for (let y = ht; y < end; y++) {
            const k = (y - ht) / (end - ht), top = y - ht, tail = y - (end - 5);
            let w = Math.round(hw + 1 + Math.sin(k * 3.1) * 1.4);
            if (top < 4) w -= [3, 2, 1, 0][top];
            if (tail > 0) w -= Math.round(tail * 1.3);
            R(cx - w, y, w * 2 + 1, 1, y > end - 3 ? P.streak : H[1]);
          }
          // mechones: raya central, líneas de pelo que se abren hacia abajo y puntas irregulares
          R(cx, ht + 1, 1, 4, H[0]);
          for (const k of [-4, -2, 2, 4]) { const x0 = cx + (k >> 1), x1 = cx + k + (k > 0 ? 1 : -1); line(x0, ht + 5, x1, end - 3, 1, H[0]); }
          for (const k of [-3, 1, 3]) line(cx + (k >> 1), ht + 6, cx + k, end - 6, 1, H[2]);
          for (let i = -hw; i <= hw; i += 2) R(cx + i, end - 1 + ((i + hw) % 3 === 0 ? 1 : 0), 1, 1, P.streak);
          // brillo en arco sobre la coronilla
          R(cx - 4, ht + 2, 3, 1, H[2]); R(cx - 2, ht + 1, 4, 1, H[2]); R(cx + 2, ht + 2, 2, 1, H[2]); R(cx - 3, ht + 3, 1, 1, H[2]);
          R(cx + hw - 1, ht + 4, 2, 2, '#e8b84a'); R(cx + hw, ht + 4, 1, 1, '#7fffe0');
          return;
        }
        if (dir === 'side') {
          E(cx, ht + 4, hw + 1, 5, H[1]);
          for (let y = ht + 3; y < sh + 10; y++) { const w = Math.max(2, hw + 1 - Math.round((y - ht) / 6)); R(cx - hw - 2, y, w, 1, y > sh + 7 ? P.streak : H[1]); }
          R(cx + hw - 3, ht + 4, 4, 3, H[1]); R(cx - 1, ht + 1, 4, 1, H[2]);
          R(cx + 1, ht + 4, 2, 2, '#e8b84a'); R(cx + 1, ht + 4, 1, 1, '#7fffe0');
          return;
        }
        E(cx, ht + 4, hw + 1, 5, H[1]); R(cx - hw, ht + 4, m.headW, 3, H[1]); R(cx, ht + 3, 1, 3, H[0]);
        R(cx - hw - 2, ht + 4, 3, m.headH + 5, H[1]); R(cx + hw, ht + 4, 3, m.headH + 5, H[1]);
        if (C.def.hd) {
          R(cx - hw - 1, ht + 6, 1, m.headH + 2, H[0]); R(cx + hw + 1, ht + 6, 1, m.headH + 2, H[0]);
          R(cx - hw - 2, ht + 5, 1, m.headH, H[2]); R(cx + hw + 2, ht + 8, 1, m.headH - 4, H[0]);
          spike(cx - 2, ht + 4, cx - 4, ht + 8, 2, H[1]); spike(cx + 2, ht + 4, cx + 4, ht + 8, 2, H[1]); spike(cx, ht + 4, cx - 1, ht + 7, 2, H[1]);
          R(cx - 5, ht + 2, 3, 1, H[2]); R(cx + 2, ht + 2, 2, 1, H[2]);
        }
        R(cx - hw - 2, ht + m.headH + 7, 3, 2, P.streak); R(cx + hw, ht + m.headH + 7, 3, 2, P.streak);
        R(cx - 3, ht + 1, 4, 1, H[2]); R(cx + hw - 1, ht + 4, 2, 2, '#e8b84a'); R(cx + hw, ht + 5, 1, 1, '#7fffe0');
      },
    },
    beard: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') { E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]); R(cx - hw - 1, ht + 4, m.headW + 2, 2, P.accent); R(cx - 1, ht + 5, 3, 3, P.accent); return; }
        if (dir === 'side') {
          E(cx - 1, ht + 3, hw + 1, 4, H[1]); R(cx - hw - 1, ht + 3, hw, m.headH - 4, H[1]); R(cx - hw - 1, ht + 4, m.headW + 1, 2, P.accent);
          E(cx + 2, hcy + 5, 4, 3, H[1]); R(cx + 2, hcy + 3, 4, 1, H[0]);
          return;
        }
        E(cx, ht + 3, hw + 1, 4, H[1]); for (const k of [-4, -1, 2]) R(cx + k, ht - 1, 2, 2, H[1]);
        R(cx - hw - 1, ht + 4, m.headW + 2, 2, P.accent); R(cx - hw - 1, ht + 4, m.headW + 2, 1, '#ff8a7a');
        R(cx - hw - 1, ht + 6, 1, 5, H[1]); R(cx + hw, ht + 6, 1, 5, H[1]);
        E(cx, hcy + 6, hw, 3, H[1]); R(cx - 3, hcy + 3, 7, 1, H[0]); R(cx - 1, hcy + 5, 3, 1, '#5a2a1a'); R(cx - 3, hcy + 6, 2, 1, H[2]);
        if (C.def.hd) {
          // barba con mechones, bigote y nariz grande
          for (let i = -hw + 1; i < hw; i += 2) R(cx + i, hcy + 6 + ((i + hw) % 3), 1, 3, H[0]);
          R(cx - 4, hcy + 4, 3, 1, H[2]); R(cx + 2, hcy + 4, 3, 1, H[2]); R(cx - 2, hcy + 8, 1, 2, H[2]); R(cx + 2, hcy + 7, 1, 2, H[2]);
          spike(cx - 1, hcy + 9, cx - 1, hcy + 12, 3, H[1]); R(cx - 1, hcy + 3, 3, 1, H[1]); R(cx, hcy + 2, 1, 2, P.skin[0]);
          R(cx - hw - 1, ht + 4, m.headW + 2, 1, '#ff9a8a');
        }
      },
    },
    swept: {
      draw(C) {
        const { cx, ht, hb, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') {
          E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]);
          // remolino en la coronilla, mechones hacia la nuca y nuca en punta
          for (const k of [-4, -1, 2, 5]) line(cx + (k >> 1), ht + 3, cx + k, hb - 2, 1, H[0]);
          for (const k of [-3, 0, 3]) spike(cx + k, hb - 3, cx + k + (k >> 1), hb + 1, 2, H[1]);
          spike(cx - hw, hcy - 2, cx - hw - 2, hcy + 3, 2, H[1]); spike(cx + hw, hcy - 2, cx + hw + 2, hcy + 3, 2, H[1]);
          R(cx - 3, ht + 1, 5, 1, H[2]); R(cx - 4, ht + 2, 2, 1, H[2]); R(cx + 2, ht + 2, 2, 1, H[2]); R(cx - 1, ht + 3, 1, 2, H[2]);
          return;
        }
        if (dir === 'side') {
          E(cx - 1, ht + 4, hw + 1, 5, H[1]); R(cx - hw - 1, ht + 3, hw + 1, m.headH - 4, H[1]);
          for (let i = 0; i < 5; i++) R(cx + i, ht + 3 + (i >> 1), 1, 3, H[1]);
          R(cx - 2, ht + 1, 5, 1, H[2]);
          return;
        }
        E(cx, ht + 4, hw + 1, 5, H[1]);
        for (let i = 0; i <= m.headW; i++) R(cx - hw + i, ht + 4, 1, 2 + (i >> 3), H[1]);
        R(cx - hw - 1, ht + 4, 2, m.headH - 5, H[1]); R(cx + hw, ht + 4, 2, m.headH - 4, H[1]);
        R(cx - 4, ht + 1, 6, 1, H[2]); R(cx + 1, ht + 4, 3, 1, H[2]);
        if (C.def.hd) {
          // mechones peinados hacia un lado con brillo
          spike(cx - 4, ht + 3, cx + 3, ht + 7, 2, H[1]); spike(cx - 1, ht + 2, cx + 6, ht + 6, 2, H[1]);
          R(cx - 3, ht + 3, 4, 1, H[2]); R(cx + 2, ht + 5, 2, 1, H[2]); R(cx - 5, ht + 2, 1, 2, H[0]); R(cx + hw - 1, ht + 3, 1, 2, H[0]);
          spike(cx - hw, ht + 6, cx - hw - 1, hcy + 3, 2, H[1]);
        }
      },
    },
    hood: {
      behind(C) { const { cx, hcy, m, P } = C; E(cx, hcy, (m.headW >> 1) + 3, (m.headH >> 1) + 3, P.hood[0]); },
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, hw = m.headW >> 1, Hd = P.hood;
        if (dir === 'up') { E(cx, hcy, hw + 3, (m.headH >> 1) + 3, Hd[1]); R(cx, ht, 1, m.headH, Hd[0]); return; }
        if (dir === 'side') {
          E(cx - 1, hcy, hw + 2, (m.headH >> 1) + 3, Hd[1]);
          E(cx + 3, hcy + 1, hw - 2, (m.headH >> 1) - 1, P.skin[1]);
          R(cx + 4, hcy + 1, 2, 1, '#2b1d34'); R(cx + 1, hcy - 3, 3, 4, '#e8e8f0');
          return;
        }
        R(cx - hw - 2, ht - 2, m.headW + 4, 4, Hd[1]); R(cx - hw - 2, ht, 3, m.headH + 3, Hd[1]); R(cx + hw, ht, 3, m.headH + 3, Hd[1]);
        R(cx - hw + 1, ht + 2, 2, 5, '#e8e8f0'); R(cx + hw - 2, ht + 2, 2, 5, '#e8e8f0'); R(cx - 2, ht - 2, 4, 1, Hd[2]);
      },
    },
    pigtails: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        E(cx, ht + 4, hw + 1, 5, H[1]);
        if (dir !== 'up') { R(cx - hw, ht + 4, m.headW, 2, H[1]); R(cx - 2, ht + 2, 3, 1, H[2]); } else E(cx, hcy, hw + 1, m.headH >> 1, H[1]);
        if (dir === 'side') { E(cx - hw - 2, hcy + 1, 2, 3, H[1]); R(cx - hw - 2, hcy - 2, 2, 1, P.accent); return; }
        E(cx - hw - 2, hcy + 1, 2, 3, H[1]); E(cx + hw + 2, hcy + 1, 2, 3, H[1]);
        R(cx - hw - 3, hcy - 2, 2, 1, P.accent); R(cx + hw + 2, hcy - 2, 2, 1, P.accent);
      },
    },
    bun: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]);
        else { E(cx, ht + 4, hw + 1, 5, H[1]); R(cx - hw, ht + 4, m.headW, 2, H[1]); R(cx - hw - 1, ht + 4, 2, 6, H[1]); R(cx + hw, ht + 4, 2, 6, H[1]); }
        E(cx + (dir === 'side' ? -3 : 0), ht - 1, 3, 2, H[1]); R(cx - 1, ht - 2, 2, 1, H[2]);
      },
    },
    cap: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, hw = m.headW >> 1;
        R(cx - hw - 1, ht + 5, 2, 4, P.hair[1]); R(cx + hw, ht + 5, 2, 4, P.hair[1]);
        if (dir === 'up') E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, P.hair[1]);
        E(cx, ht + 3, hw + 1, 4, P.hat[1]); R(cx - hw - 1, ht + 3, m.headW + 2, 1, P.hat[2]);
        if (dir === 'down') R(cx - hw - 1, ht + 6, m.headW + 2, 1, P.hat[0]);
        if (dir === 'side') R(cx + 1, ht + 6, hw + 2, 1, P.hat[0]);
        if (P.beard && dir !== 'up') E(cx + (dir === 'side' ? 2 : 0), hcy + 5, dir === 'side' ? 3 : hw - 1, 2, P.beard);
      },
    },
    bald: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, hw = m.headW >> 1;
        R(cx - hw, hcy - 2, 2, 4, P.hair[1]); R(cx + hw - 1, hcy - 2, 2, 4, P.hair[1]); R(cx - 2, ht + 1, 3, 1, '#ffe0c8');
        if (dir === 'up') R(cx - hw, hcy - 1, m.headW, 4, P.hair[1]);
        else E(cx + (dir === 'side' ? 2 : 0), hcy + 5, dir === 'side' ? 3 : hw - 1, 3, P.hair[1]);
      },
    },
    straw: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, hw = m.headW >> 1;
        R(cx - hw - 1, ht + 5, 2, 4, P.hair[1]); R(cx + hw, ht + 5, 2, 4, P.hair[1]);
        if (dir === 'up') E(cx, hcy, hw, m.headH >> 1, P.hair[1]);
        E(cx, ht + 5, hw + 5, 2, '#c9a050'); E(cx, ht + 5, hw + 4, 1, '#e8c870'); E(cx, ht + 2, hw - 1, 3, '#d8b060'); R(cx - hw + 1, ht + 4, m.headW - 2, 1, '#b0503c');
      },
    },
    short: {
      draw(C) {
        const { cx, ht, hcy, m, P, dir } = C, H = P.hair, hw = m.headW >> 1;
        if (dir === 'up') { E(cx, hcy - 1, hw + 1, (m.headH >> 1) + 1, H[1]); if (P.band) R(cx - hw - 1, ht + 4, m.headW + 2, 2, P.band); return; }
        E(cx, ht + 3, hw + 1, 4, H[1]); R(cx - hw, ht + 4, m.headW, 2, H[1]);
        if (dir === 'side') R(cx - hw - 1, ht + 3, hw, m.headH - 5, H[1]); else { R(cx - hw - 1, ht + 4, 1, 4, H[1]); R(cx + hw, ht + 4, 1, 4, H[1]); }
        R(cx - 2, ht + 1, 4, 1, H[2]);
        if (P.band) R(cx - hw - 1, ht + 4, m.headW + 2, 2, P.band);
      },
    },
  };

  // ---------- extras ----------
  // arma en la mano durante el golpe (vista lateral)
  function crystal(x, y, vertical) {
    if (vertical) { R(x - 1, y - 7, 3, 7, '#2f8fc8'); R(x, y - 8, 2, 7, '#7fe6ff'); R(x + 1, y - 9, 1, 4, '#d8faff'); R(x, y - 10, 1, 2, '#ffffff'); return; }
    R(x, y - 1, 7, 3, '#2f8fc8'); R(x + 1, y - 2, 7, 2, '#7fe6ff'); R(x + 3, y - 2, 4, 1, '#d8faff'); R(x + 8, y - 1, 2, 1, '#ffffff');
  }
  function coral(x, y) { R(x, y, 2, 1, '#f08ab8'); R(x + 1, y - 2, 1, 2, '#f8b8d8'); R(x - 1, y + 1, 1, 2, '#f08ab8'); R(x + 1, y - 3, 1, 1, '#ffffff'); R(x - 2, y + 2, 1, 1, '#ffd8ea'); }
  const HELD = {
    spear2(x, y) { line(x - 11, y + 2, x + 11, y - 1, 1, '#dce6f4'); line(x - 11, y + 3, x + 10, y, 1, '#8a9ab8'); coral(x + 7, y - 1); crystal(x + 11, y - 1); },
    spear(x, y) { line(x - 9, y + 2, x + 13, y - 1, 1, '#c9d6e8'); R(x + 12, y - 2, 4, 3, '#7fe6ff'); R(x + 15, y - 1, 2, 1, '#ffffff'); R(x - 1, y + 1, 2, 1, '#e7a8c8'); },
    hammer(x, y) { line(x - 3, y + 3, x + 9, y - 2, 2, '#7a4a2e'); R(x + 7, y - 7, 6, 10, '#5d6270'); R(x + 7, y - 7, 6, 1, '#9aa0ae'); R(x + 12, y - 7, 1, 10, '#3a3d48'); },
    sword(x, y) { R(x - 1, y - 2, 2, 5, '#e8b84a'); line(x + 1, y, x + 14, y - 3, 1, '#e8eef8'); line(x + 1, y + 1, x + 13, y - 2, 1, '#9aa8c0'); },
    staff(x, y) { line(x - 6, y + 4, x + 10, y - 4, 1, '#8a6a4a'); R(x + 9, y - 7, 4, 4, '#bfe8ff'); R(x + 10, y - 6, 1, 1, '#ffffff'); },
  };
  const EXTRA = {
    spear2(C, L) {
      if (L !== 'back') return;
      const { cx, hip, sh, dir } = C;
      if (dir === 'side') {
        line(cx - 3, hip + 5, cx - 6, sh - 11, 1, '#dce6f4');
        coral(cx - 6, sh - 6); crystal(cx - 6, sh - 11, true);
        return;
      }
      const s = dir === 'up' ? -1 : 1;
      line(cx - 11 * s, hip + 5, cx + 10 * s, sh - 11, 1, '#dce6f4');
      line(cx - 11 * s, hip + 6, cx + 10 * s, sh - 10, 1, '#8a9ab8');
      coral(cx + 7 * s, sh - 7);
      const bx = cx + 10 * s, by = sh - 11;
      R(bx - 2, by - 1, 3, 3, '#2f8fc8'); R(bx - 1, by - 3, 3, 3, '#7fe6ff'); R(bx + (s > 0 ? 1 : -1), by - 5, 2, 3, '#bff4ff'); R(bx + (s > 0 ? 2 : -1), by - 6, 1, 2, '#ffffff');
    },
    spear(C, L) {
      if (L !== 'back') return;
      const { cx, hip, sh, dir } = C;
      let a, b;
      if (dir === 'down') { a = [cx - 9, hip + 3]; b = [cx + 9, sh - 9]; }
      else if (dir === 'up') { a = [cx + 9, hip + 3]; b = [cx - 9, sh - 9]; }
      else { a = [cx - 2, hip + 4]; b = [cx - 5, sh - 11]; }
      line(a[0], a[1], b[0], b[1], 1, '#c9d6e8');
      const mx = Math.round((a[0] + b[0]) / 2), my = Math.round((a[1] + b[1]) / 2);
      R(mx, my, 2, 1, '#e7a8c8');
      R(b[0] - 1, b[1] - 1, 3, 3, '#7fe6ff'); R(b[0], b[1] - 2, 1, 1, '#ffffff');
    },
    hammer(C, L) {
      if (L !== 'back') return;
      const { cx, hip, sh, dir } = C;
      let a, b;
      if (dir === 'down') { a = [cx + 7, hip]; b = [cx - 7, sh - 6]; }
      else if (dir === 'up') { a = [cx - 7, hip]; b = [cx + 7, sh - 6]; }
      else { a = [cx - 3, hip + 2]; b = [cx - 6, sh - 8]; }
      line(a[0], a[1], b[0], b[1], 2, '#7a4a2e');
      R(b[0] - 4, b[1] - 4, 9, 6, '#5d6270'); R(b[0] - 4, b[1] - 4, 9, 1, '#9aa0ae'); R(b[0] - 4, b[1] + 1, 9, 1, '#3a3d48');
    },
    sword(C, L) {
      const { cx, hip, dir, tx, tw } = C;
      if (dir === 'side' && L === 'front') { line(cx - 6, hip + 1, cx + 2, hip - 1, 1, '#5a3826'); R(cx + 3, hip - 3, 1, 4, '#e8b84a'); R(cx + 4, hip - 2, 2, 1, '#c9d6e8'); }
      if (dir === 'down' && L === 'front') { R(tx - 2, hip - 3, 2, 7, '#5a3826'); R(tx - 3, hip - 4, 4, 1, '#e8b84a'); }
      if (dir === 'up' && L === 'back') R(tx + tw, hip - 3, 2, 7, '#5a3826');
    },
    staff(C, L) {
      if (L !== 'front') return;
      const { cx, sh, feet, tx, tw, dir } = C;
      if (dir === 'up') return;
      const x = dir === 'side' ? cx + 4 : tx + tw + 2;
      R(x, sh - 10, 2, feet - sh + 9, '#6b4430'); R(x, sh - 10, 1, feet - sh + 9, '#8f5d3c');
      R(x - 1, sh - 15, 4, 5, '#2b2236'); R(x, sh - 14, 2, 3, '#ffd76a');
    },
  };

  // ---------- construcción de un fotograma ----------
  function build(def, anim, f, dir) {
    const o = TH.makeCanvas(CW, CH);
    G = o.g;
    const m = def.m, P = def.pal, po = poseOf(anim, f);
    const side = dir === 'side', up = dir === 'up';
    const lx = OX, cx = OX + (side ? po.lean : 0), feet = OY;
    const hip = feet - m.leg + po.crouch + (side ? 0 : Math.round(po.lean / 2));
    const sh = hip - m.torso + po.bob;
    const hb = sh + 1, ht = hb - m.headH, hcy = Math.round((ht + hb) / 2);
    const tw = side ? Math.max(7, m.sw - 4) : m.sw, tx = cx - (tw >> 1);
    const C = { def, m, P, po, cx, lx, feet, hip, sh, hb, ht, hcy, tw, tx, dir, side, up };
    const H = HAIR[def.hair] || HAIR.short, O = OUTFIT[def.outfit] || OUTFIT.tunic;
    const ex = def.extras || [];
    if (H.behind) H.behind(C);
    const held = side && po.weapon === 'thrust' ? ex.find((e) => HELD[e]) : null;
    if (!up && !held) for (const e of ex) EXTRA[e] && EXTRA[e](C, 'back');
    if (side) arm(C, 0);
    legs(C);
    if (O.lower) O.lower(C);
    O.torso(C);
    if (side) arm(C, 1); else { arm(C, 0); arm(C, 1); }
    if (def.hd) headHD(C); else head(C);
    H.draw(C);
    if (def.hd) faceHD(C);
    if (up) for (const e of ex) EXTRA[e] && EXTRA[e](C, 'back');
    if (held && C.hand) HELD[held](C.hand[0], C.hand[1]);
    else for (const e of ex) EXTRA[e] && EXTRA[e](C, 'front');
    volume(o.c, def.shade || {});
    outline(o.c, P.outline);
    G = null;
    return o.c;
  }

  // ---------- cadenas de tela/pelo con viento ----------
  const DIRS = { down: 'down', up: 'up', left: 'side', right: 'side' };
  function chainAnchor(a, ch, out) {
    const sd = DIRS[a.dir];
    const spec = ch.dirs[sd];
    if (!spec) return null;
    const flip = a.dir === 'left' ? -1 : 1;
    const po = poseOf(a.anim || 'idle', (a.frame || 0) % FRAMES[a.anim || 'idle']);
    const upper = spec[1] < -14;
    out[0] = a.x + (spec[0] + (sd === 'side' && upper ? po.lean : 0)) * flip;
    out[1] = a.sy + spec[1] + (upper ? po.bob : 0);
    out[2] = spec[2] === 'front' ? 1 : 0;
    return out;
  }
  const tmpA = [0, 0, 0];

  TH.chars = {
    defs: {},
    FRAMES,
    OX, OY,
    frame(def, anim, f, dir) {
      const key = def.id + '|' + anim + '|' + f + '|' + dir;
      let c = cache.get(key);
      if (!c) { c = build(def, anim, f, dir); cache.set(key, c); }
      return c;
    },
    // prepara las cadenas de un actor
    initChains(a) {
      const cs = a.def.chains || [];
      a.chains = cs.map((ch) => ({ ch, p: new Float32Array(ch.n * 4) }));
      a.chainsReady = false;
    },
    updateChains(a, dt, wind) {
      if (!a.chains) this.initChains(a);
      const g = 260 * dt * dt, wf = (40 + wind * 120) * dt * dt;
      // velocidad del actor (px/fotograma) para el arrastre de las telas
      const avx = a.lastX != null ? a.x - a.lastX : 0, avy = a.lastY != null ? a.sy - a.lastY : 0;
      a.lastX = a.x; a.lastY = a.sy;
      const spd = Math.min(3, Math.hypot(avx, avy));
      for (const c of a.chains) {
        const ch = c.ch, p = c.p, n = ch.n;
        if (!chainAnchor(a, ch, tmpA)) continue;
        if (!a.chainsReady || c.reset) {
          for (let i = 0; i < n; i++) { p[i * 4] = tmpA[0]; p[i * 4 + 1] = tmpA[1] + i * ch.seg; p[i * 4 + 2] = p[i * 4]; p[i * 4 + 3] = p[i * 4 + 1]; }
          c.reset = false;
        }
        p[0] = tmpA[0]; p[1] = tmpA[1]; p[2] = tmpA[0]; p[3] = tmpA[1];
        const flut = Math.sin(TH.time * 7 + ch.seg * 3 + a.x * 0.1) * wind * 0.25;
        for (let i = 1; i < n; i++) {
          const k = i * 4;
          const vx = (p[k] - p[k + 2]) * 0.86, vy = (p[k + 1] - p[k + 3]) * 0.86;
          p[k + 2] = p[k]; p[k + 3] = p[k + 1];
          const ki = i / n;
          p[k] += vx + wf * (ch.wind || 1) + flut * ki - avx * 0.18 * ki;
          p[k + 1] += vy + g * (ch.g || 1) * (1 - Math.min(0.75, spd * 0.28)) - avy * 0.18 * ki - spd * 0.06 * ki;
        }
        for (let it = 0; it < 3; it++) {
          for (let i = 1; i < n; i++) {
            const k = i * 4, j = k - 4;
            const dx = p[k] - p[j], dy = p[k + 1] - p[j + 1];
            const d = Math.hypot(dx, dy) || 0.001;
            const f = (d - ch.seg) / d;
            p[k] -= dx * f; p[k + 1] -= dy * f;
          }
        }
      }
      a.chainsReady = true;
    },
    drawChains(ctx, a, front) {
      if (!a.chains) return;
      for (const c of a.chains) {
        const ch = c.ch;
        if (!chainAnchor(a, ch, tmpA) || tmpA[2] !== (front ? 1 : 0)) continue;
        const p = c.p, n = ch.n, w = ch.w;
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < n - 1; i++) {
            const x0 = p[i * 4], y0 = p[i * 4 + 1], x1 = p[i * 4 + 4], y1 = p[i * 4 + 5];
            const st = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
            const ww = pass === 0 ? w + 2 : w;
            const tip = i >= n - 2 ? ch.c[1] : ch.c[0];
            ctx.fillStyle = pass === 0 ? ch.o || a.def.pal.outline : tip;
            const off = pass === 0 ? 1 : 0;
            const tw = i >= n - 2 && pass === 1 ? Math.max(1, w - 1) : ww;
            for (let s = 0; s <= st; s++) ctx.fillRect(Math.round(x0 + ((x1 - x0) * s) / st - (w >> 1) - off), Math.round(y0 + ((y1 - y0) * s) / st - off), tw, tw);
          }
        }
      }
    },
    // dibuja un actor: x, sy = pies en pantalla-mundo; a.anim/a.frame/a.dir
    draw(ctx, a, alpha) {
      const def = a.def, sd = DIRS[a.dir];
      const img = this.frame(def, a.anim, a.frame % FRAMES[a.anim], sd);
      ctx.save();
      if (alpha != null) ctx.globalAlpha = alpha;
      if (a.shadowY != null && alpha == null) TH.shadow(ctx, a.x, a.shadowY, a.big ? 8 : 6, 2, a.state === 'jump' ? 0.22 : 0.33);
      this.drawChains(ctx, a, false);
      if (a.dir === 'left') { ctx.translate(Math.round(a.x), 0); ctx.scale(-1, 1); ctx.drawImage(img, -OX, Math.round(a.sy) - OY); }
      else ctx.drawImage(img, Math.round(a.x) - OX, Math.round(a.sy) - OY);
      ctx.restore();
      if (alpha == null) this.drawChains(ctx, a, true);
    },
  };
})();
