// Primitivas de pixel art
(function () {
  'use strict';
  const TH = window.TH;
  TH.px = function (c, x, y, col, w, h) {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), w || 1, h || 1);
  };
  // elipse rellena por filas (aspecto pixel)
  TH.ell = function (c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    cx = Math.round(cx);
    cy = Math.round(cy);
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01))));
      c.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    }
  };
  TH.shadow = function (c, cx, cy, rx, ry, a) {
    const p = c.globalAlpha;
    c.globalAlpha = p * (a == null ? 0.3 : a);
    TH.ell(c, cx, cy, rx, ry, '#1b1530');
    c.globalAlpha = p;
  };
})();
