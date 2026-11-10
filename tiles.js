// Pintores de tiles procedurales (se hornean una vez en el canvas del suelo)
(function () {
  'use strict';
  const TH = window.TH, px = TH.px, R = TH.util.rnd;
  const G0 = '#27523a', G0b = '#3f7a42', G1 = '#4d8e45', G2 = '#68a94e', G3 = '#a9d36c';
  const D0 = '#8a5f38', D1 = '#c99a5e', D2 = '#ad7f4a', D3 = '#e4be80';
  const S0 = '#bb9b68', S1 = '#dcc08c', S2 = '#cdae78', S3 = '#eedcae';

  function tuft(g, x, y) {
    px(g, x - 1, y + 2, G0, 3, 1); px(g, x - 1, y, G2); px(g, x - 1, y + 1, G2);
    px(g, x + 1, y - 1, G3); px(g, x + 1, y, G2); px(g, x + 1, y + 1, G2); px(g, x, y + 1, G3);
  }
  function flower(g, x, y, col) {
    px(g, x, y + 2, G0); px(g, x - 1, y, col); px(g, x + 1, y, col);
    px(g, x, y - 1, col); px(g, x, y + 1, col); px(g, x, y, '#ffe27a');
  }

  const T = (TH.tiles = {
    G0, G0b, G1, G2, G3, S1,
    grass(g, c, r, x, y) {
      px(g, x, y, G1, 16, 16);
      for (let i = 0; i < 24; i++) {
        const a = R(c, r, i * 3), b = R(c, r, i * 3 + 1), k = R(c, r, i * 3 + 2);
        px(g, x + ((a * 16) | 0), y + ((b * 16) | 0), k < 0.55 ? G0b : G2);
      }
      if (R(c, r, 77) < 0.45) {
        const lx = x + 3 + ((R(c, r, 78) * 8) | 0), ly = y + 3 + ((R(c, r, 79) * 8) | 0);
        for (let i = 0; i < 10; i++) px(g, lx + ((R(c, r, 80 + i) * 6) | 0), ly + ((R(c, r, 90 + i) * 4) | 0), G2, 2, 1);
      }
      for (let i = 0; i < 2; i++) tuft(g, x + 2 + ((R(c, r, 100 + i) * 12) | 0), y + 2 + ((R(c, r, 110 + i) * 11) | 0));
      if (R(c, r, 120) < 0.22) flower(g, x + 3 + ((R(c, r, 121) * 10) | 0), y + 3 + ((R(c, r, 122) * 10) | 0), '#ffffff');
    },
    snow(g, c, r, x, y) {
      px(g, x, y, '#cfe0f2', 16, 16);
      for (let i = 0; i < 22; i++) {
        const a = R(c, r, i * 3), b = R(c, r, i * 3 + 1), k = R(c, r, i * 3 + 2);
        px(g, x + ((a * 16) | 0), y + ((b * 16) | 0), k < 0.4 ? '#a9bde0' : k < 0.75 ? '#e6f0fb' : '#9a9cd2');
      }
      // ventisqueros: sombra fría y violeta bajo un borde brillante
      if (R(c, r, 77) < 0.5) {
        const lx = x + 2 + ((R(c, r, 78) * 9) | 0), ly = y + 3 + ((R(c, r, 79) * 9) | 0);
        px(g, lx, ly + 1, '#8f94cc', 6, 1); px(g, lx + 1, ly, '#ffffff', 4, 1);
      }
      if (R(c, r, 120) < 0.3) px(g, x + 2 + ((R(c, r, 121) * 12) | 0), y + 2 + ((R(c, r, 122) * 12) | 0), '#ffffff', 1, 1);
    },
    flowers(g, c, r, x, y) {
      T.grass(g, c, r, x, y);
      const cols = ['#f58aaa', '#ffffff', '#c9a4ff', '#ffd36a'];
      for (let i = 0; i < 6; i++) flower(g, x + 2 + ((R(c, r, 400 + i) * 12) | 0), y + 2 + ((R(c, r, 410 + i) * 11) | 0), cols[i % 4]);
    },
    path(g, map, c, r, x, y) {
      px(g, x, y, D1, 16, 16);
      for (let i = 0; i < 20; i++) {
        const a = R(c, r, i * 3 + 5), b = R(c, r, i * 3 + 6), k = R(c, r, i * 3 + 7);
        px(g, x + ((a * 16) | 0), y + ((b * 16) | 0), k < 0.5 ? D2 : D3);
      }
      for (let i = 0; i < 2; i++) {
        const a = x + 2 + ((R(c, r, 140 + i) * 11) | 0), b = y + 2 + ((R(c, r, 150 + i) * 11) | 0);
        px(g, a, b, D3, 2, 1); px(g, a, b + 1, D0, 2, 1);
      }
      const h = map.hh(c, r);
      const sides = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let s = 0; s < 4; s++) {
        const nc = c + sides[s][0], nr = r + sides[s][1];
        const nt = map.t(nc, nr);
        if (!(nt === 'g' || nt === 'f') || map.hh(nc, nr) !== h) continue;
        for (let i = 0; i < 16; i++) {
          const d = 1 + Math.round(1 + Math.sin((i + c * 7 + r * 3 + s * 5) * 0.75)) * (R(c, r, 200 + i + s * 16) < 0.8 ? 1 : 0);
          for (let k = 0; k < d; k++) {
            const col = k === d - 1 ? G2 : G1;
            if (s === 0) px(g, x + i, y + k, col);
            else if (s === 1) px(g, x + i, y + 15 - k, col);
            else if (s === 2) px(g, x + k, y + i, col);
            else px(g, x + 15 - k, y + i, col);
          }
          if (s === 0) px(g, x + i, y + d, D0);
          else if (s === 1) px(g, x + i, y + 15 - d, D2);
          else if (s === 2) px(g, x + d, y + i, D2);
          else px(g, x + 15 - d, y + i, D2);
        }
      }
    },
    sand(g, c, r, x, y) {
      px(g, x, y, S1, 16, 16);
      for (let i = 0; i < 26; i++) {
        const a = R(c, r, i * 3 + 30), b = R(c, r, i * 3 + 31), k = R(c, r, i * 3 + 32);
        px(g, x + ((a * 16) | 0), y + ((b * 16) | 0), k < 0.45 ? S2 : k < 0.8 ? S3 : S0);
      }
      if (R(c, r, 60) < 0.18) { const sx = x + 3 + ((R(c, r, 61) * 10) | 0), sy = y + 3 + ((R(c, r, 62) * 10) | 0); px(g, sx, sy, '#fff4e6', 2, 1); px(g, sx, sy + 1, '#e8b8a8', 2, 1); }
      if (R(c, r, 63) < 0.12) { const sx = x + 2 + ((R(c, r, 64) * 12) | 0), sy = y + 2 + ((R(c, r, 65) * 12) | 0); px(g, sx, sy, '#a7a09a', 2, 1); px(g, sx, sy + 1, '#7d7671', 2, 1); }
    },
    cobble(g, c, r, x, y) {
      px(g, x, y, '#625852', 16, 16);
      const cols = ['#a89c90', '#998d81', '#b5a99b', '#918579'];
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 5; i++) {
          const ox = (j % 2) * 2;
          const sx = x + i * 4 - 2 + ox, sy = y + j * 4;
          const col = cols[(R(c * 5 + i, r * 4 + j, 6) * 4) | 0];
          const x0 = Math.max(x, sx), x1 = Math.min(x + 16, sx + 3);
          if (x1 <= x0) continue;
          px(g, x0, sy, col, x1 - x0, 3);
          px(g, x0, sy, '#cbbfae', x1 - x0, 1);
          px(g, x0, sy + 2, '#766a61', x1 - x0, 1);
        }
      }
      if (R(c, r, 9) < 0.3) px(g, x + ((R(c, r, 10) * 14) | 0), y + ((R(c, r, 11) * 14) | 0), G0b, 2, 1);
    },
    // tablones del muelle; los huecos se dejan transparentes para ver el agua
    dock(g, map, c, r, x, y) {
      for (let b = 0; b < 4; b++) {
        const by = y + b * 4;
        const col = R(c, r * 4 + b, 7) < 0.5 ? '#8a5a36' : '#9b6a40';
        px(g, x, by, col, 16, 3);
        px(g, x, by, '#b07c4c', 16, 1);
        for (let i = 0; i < 2; i++) px(g, x + ((R(c, r * 4 + b, 8 + i) * 13) | 0), by + 1, '#6e4429', 3, 1);
        px(g, x + 2, by + 1, '#3a2a22'); px(g, x + 13, by + 1, '#3a2a22');
      }
      if (map.t(c - 1, r) !== 'd') px(g, x, y, '#5a3a24', 2, 16);
      if (map.t(c + 1, r) !== 'd') px(g, x + 14, y, '#5a3a24', 2, 16);
      if (map.t(c, r + 1) !== 'd') {
        px(g, x, y + 15, '#4a2e1e', 16, 1);
        px(g, x + 1, y + 16, '#4a2e1e', 2, 5); px(g, x + 13, y + 16, '#4a2e1e', 2, 5);
        px(g, x + 1, y + 16, '#6e4429', 1, 5); px(g, x + 13, y + 16, '#6e4429', 1, 5);
      }
    },
    // cara de acantilado bajo un tile elevado
    face(g, x, y, len, seed, wet) {
      let cx = 0;
      while (cx < 16) {
        const w = Math.min(16 - cx, 3 + ((R(seed, cx, 500) * 5) | 0));
        const base = R(seed, cx, 501) < 0.5 ? '#8a6f5c' : '#7a5f52';
        px(g, x + cx, y, base, w, len);
        px(g, x + cx, y, '#a98a70', 1, len - 2);
        px(g, x + cx + w - 1, y, '#5a4542', 1, len);
        if (len > 6) {
          const ck = y + 3 + ((R(seed, cx, 502) * (len - 6)) | 0);
          px(g, x + cx + 1, ck, '#5a4542', Math.max(1, w - 2), 1);
          px(g, x + cx + 1, ck + 1, '#9b7d66', Math.max(1, w - 3), 1);
        }
        if (R(seed, cx, 503) < 0.3) px(g, x + cx + 1, y + 2 + ((R(seed, cx, 504) * Math.max(1, len - 4)) | 0), '#5fa046', 2, 1);
        cx += w;
      }
      for (let i = 0; i < 16; i++) {
        const hh = 1 + ((R(seed, i, 505) * 3) | 0);
        for (let k = 0; k < hh; k++) px(g, x + i, y + k, k === hh - 1 ? G0 : G1);
      }
      px(g, x, y + len - 2, '#4a3a40', 16, 2);
      if (wet) { px(g, x, y + len - 3, '#3e5a66', 16, 3); px(g, x, y + len - 3, '#6fa6ad', 16, 1); }
    },
    // enredadera trepable sobre una cara de acantilado (desborda arriba y abajo para leerse bien)
    vines(g, x, y, len, seed) {
      const L = ['#1f4a2e', '#2f6a36', '#4b9141', '#79be52', '#b6e271'];
      const y0 = y - 6, y1 = y + len + 2;
      for (let s = 0; s < 3; s++) {
        let vx = x + 2 + s * 5;
        for (let k = y0; k < y1; k++) {
          const q = R(seed, s * 60 + k, 520);
          vx += q < 0.22 ? 1 : q > 0.78 ? -1 : 0;
          vx = Math.max(x + 1, Math.min(x + 13, vx));
          px(g, vx, k, L[0], 2, 1);
        }
      }
      // racimos de hojas
      for (let k = y0; k < y1; k += 2) for (let s = 0; s < 3; s++) {
        if (R(seed, s * 70 + k, 525) < 0.35) continue;
        const lx = x + 1 + ((R(seed, s * 70 + k, 526) * 13) | 0);
        px(g, lx, k, L[1], 3, 2);
        px(g, lx, k, L[2], 2, 1);
        if (R(seed, s * 70 + k, 527) < 0.45) px(g, lx + 1, k, L[3], 1, 1);
        if (R(seed, s * 70 + k, 528) < 0.12) px(g, lx, k - 1, L[4], 1, 1);
      }
      px(g, x + 4, y + (len >> 1), '#f2c6ee'); px(g, x + 11, y + 2, '#f8f0b0'); px(g, x + 8, y + len - 2, '#f2c6ee');
    },
    // borde de salto: losas claras en el filo y marcas en «v»
    ledge(g, x, y, seed) {
      for (let i = 0; i < 16; i += 4) {
        px(g, x + i, y + 12, '#7c7066', 4, 4);
        px(g, x + i, y + 12, '#e0d6c6', 3, 1);
        px(g, x + i, y + 13, '#b4a898', 3, 2);
      }
      for (const cx of [4, 11]) { px(g, x + cx - 1, y + 7, '#efe6d2'); px(g, x + cx, y + 8, '#efe6d2'); px(g, x + cx + 1, y + 7, '#efe6d2'); }
    },
    // escalones de piedra sobre la cara del tile de arriba y el propio tile
    stairs(g, x, y, len, leftEdge, rightEdge) {
      const total = len + 16;
      for (let k = 0; k < total; k += 4) {
        px(g, x, y + k, '#c4b8a8', 16, 2);
        px(g, x, y + k, '#ddd2c4', 16, 1);
        px(g, x, y + k + 2, '#8c8073', 16, 2);
      }
      if (leftEdge) { px(g, x, y, '#5a4c44', 2, total); px(g, x + 2, y, '#a99d90', 1, total); }
      if (rightEdge) { px(g, x + 14, y, '#5a4c44', 2, total); }
    },
  });
})();
