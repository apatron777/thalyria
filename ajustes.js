// Ajustes de legibilidad tras las pruebas de juego.
// 1) Cabo del Vigía: el faro, el molino y el Ojo quedaban pegados al borde superior y cortados bajo el HUD.
//    Se añaden 8 filas por arriba (la explanada continúa) desplazando todo el mapa y sus escenas.
// 2) Al girar el molino, una escena corta enseña la reja abierta y el Ojo del Vigía.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, P = 8;
  const M = D.maps.cabo;
  if (!M || M.padTop) return;
  M.padTop = P; M.h += P;
  // rectángulos [c, r, w, h, …]: los que tocan el borde superior crecen hacia arriba; el resto baja
  const rect = (r) => { if (r[1] === 0) r[3] += P; else r[1] += P; };
  M.heightRects.forEach(rect);
  M.terrainRects.forEach(rect);
  M.forests.forEach((f) => rect(f.rect));
  M.zones.forEach((z) => rect(z.rect));
  M.triggers.forEach((t) => { t.rect[1] += P; });
  M.exits.forEach((e) => { e.rect[1] += P; });
  M.tiles.forEach((t) => { t[1] += P; });
  M.props.forEach((p) => { p[2] += P; });
  M.jumps.forEach((j) => { j[2] += P; });
  M.vines.forEach((v) => { v[1] += P; });
  ['npcs', 'chests', 'pickups', 'signs', 'puzzle'].forEach((k) => (M[k] || []).forEach((o) => { if (o.r != null) o.r += P; }));
  M.foes.forEach((f) => { if (f.r != null) f.r += P; (f.patrol || []).forEach((p) => { p[1] += P; }); });
  M.start.r += P;
  Object.values(M.entries).forEach((e) => { e.r += P; });

  // la franja nueva: la explanada del faro continúa con almacén de la guardia y faroles
  M.props.push(['crate', 29, 1.2], ['barrel', 30, 1.8], ['crate', 39, 2], ['lamp', 34, 3], ['lamp', 28.6, 4.6], ['barrel', 38.4, 5.4],
    ['rock', 16, 2], ['bush', 21, 3], ['bush', 25, 1.4], ['lamp', 22, 5.2]);
  // las escenas del cabo usan coordenadas del mapa: se desplazan igual
  const sh = (ops) => ops.forEach((o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o.cam)) o.cam[1] += P;
    ['to', 'at'].forEach((k) => { if (Array.isArray(o[k]) && typeof o[k][1] === 'number') o[k][1] += P; });
    if (Array.isArray(o.path)) o.path.forEach((p) => { p[1] += P; });
    ['then', 'else'].forEach((k) => { if (Array.isArray(o[k])) sh(o[k]); });
    if (Array.isArray(o.choice)) o.choice.forEach((c) => c.then && sh(c.then));
  });
  ['cabo.llegada', 'cabo.firion', 'cabo.firion2', 'cabo.reja', 'cabo.faro'].forEach((id) => S[id] && sh(S[id]));

  // partidas guardadas dentro del cabo antes de este ajuste
  const load = TH.MapScene && TH.MapScene.prototype.loadGame;
  if (load) TH.MapScene.prototype.loadGame = function () {
    const s = TH.save.read();
    // versiones anteriores del ajuste: 3 filas ('cabo.pad'), 6 ('cabo.pad2'); ahora P ('cabo.padN')
    const f = (s && s.flags) || {}, old = f['cabo.padN'] || (f['cabo.pad2'] ? 6 : f['cabo.pad'] ? 3 : 0);
    if (s && s.map === 'cabo' && old !== P) { s.y += (P - old) * 16; TH.save.write(s); }
    const ok = load.call(this);
    TH.flags.set('cabo.padN', P);
    this.safeT = 2.5; // al cargar, unos segundos sin encuentros para no empezar pegado a un enemigo
    return ok;
  };
  const enter = TH.MapScene && TH.MapScene.prototype.enter;
  // el estado de los puzles guarda la posición de cada pieza: en partidas empezadas antes del ajuste quedaban
  // en las filas antiguas (el Ojo, la reja o el pilar «fuera de sitio»). Se recolocan comparando con una pieza fija.
  const fixPz = () => {
    const V = TH.flags.v, ref = M.puzzle.find((o) => o.id === 'molino'), st = V['pz.cabo.molino'];
    if (!ref || !st || typeof st.r !== 'number') return;
    const dr = ref.r - st.r;
    if (!dr) return;
    for (const k in V) if (k.indexOf('pz.cabo.') === 0 && V[k] && typeof V[k].r === 'number') V[k].r += dr;
  };
  if (enter) TH.MapScene.prototype.enter = function (d) {
    // la escena del molino se colaba en partidas que ya habían pasado el faro y dejaba el objetivo en «ojo»
    const F0 = TH.flags;
    if (F0.get('objetivo') === 'ojo' && F0.get('cap1.faro')) { F0.set('objetivo', F0.get('cap1.fin') ? 'cap2' : 'arrecife'); delete F0.v['obj.txt']; }
    if (d && d.map === 'cabo') {
      fixPz();
      // partidas atascadas: la escena del faro se marcó como vista pero no llegó a reproducirse
      const F = TH.flags;
      if (F.get('cabo.faro') && !F.get('cap1.faro')) delete F.v['cabo.faro'];
      if (F.get('cabo.molino') && F.get('objetivo') === 'reja') delete F.v['cabo.molino'];
    }
    const r = enter.call(this, d); TH.flags.set('cabo.padN', P); return r;
  };

  // el Ojo encendido dispara la escena del faro desde cualquier punto (antes había que estar en la terraza,
  // y si se lanzaba la Lanzada desde la escalera el juego se quedaba sin avanzar)
  const tf = M.triggers.find((t) => t.once === 'cabo.faro');
  if (tf) tf.rect = [0, 0, M.w, M.h];
  // el molino gira: enseñar el camino
  M.triggers.push({ rect: [0, 0, M.w, M.h], once: 'cabo.molino', if: ['!cap1.faro', '!cabo.faro'], pz: 'molino', script: 'cabo.molino', cinematic: true });
  S['cabo.molino'] = [
    { bars: true },
    { cam: [36.5, 2 + P], time: 1.2 },
    { flash: 0.3, color: '#dff4ff' },
    { say: 'firion', e: 'happy', t: 'El molino gira. {p:0.3}La reja de la lente se ha abierto: {p:0.3}{*la escalera de arriba a la derecha*}.' },
    { cam: [37.5, 0 + P], time: 0.8 },
    { say: 'firion', e: 'neutral', t: 'Ahí arriba está el {*Ojo del Vigía*}, apagado. {p:0.4}Kaelen, sube a la terraza y despiértalo con tu Lanzada.' },
    { set: { objetivo: 'ojo' } },
    { cam: 'free', time: 0.8 },
    { bars: false },
    { toast: 'Objetivo: sube a la terraza de la lente y lanza la Lanzada lunar (R para elegirla) al Ojo del Vigía' },
  ];

  // ---------- flecha guía hacia el siguiente paso ----------
  // Reglas por orden: la primera que encaja en el mapa actual marca el destino (c, r en casillas).
  // if: condición de flags · pz / npz: pieza de puzle activada / sin activar.
  const R = (r) => r + P; // filas del cabo ya desplazadas
  D.guide = [
    // Prólogo · Bruma Salada
    { map: 'brumaSalada', if: 'objetivo=claro', c: 7.6, r: 9.4 },
    { map: 'brumaSalada', if: 'objetivo=faro', c: 30.6, r: 7.6 },
    { map: 'brumaSalada', if: 'objetivo=defensa', c: 23.4, r: 13.6 },
    { map: 'brumaSalada', if: 'objetivo=puerto', c: 21, r: 21.2 },
    { map: 'brumaSalada', if: 'objetivo=gruta', c: 4.6, r: 20.6 },
    { map: 'brumaSalada', if: 'objetivo=cabo', c: 39.4, r: 13.6 },
    // Capítulo 1 · ruta y cabo
    { map: 'acantilados', if: 'objetivo=cabo', c: 35.4, r: 13.6 },
    { map: 'acantilados', if: 'objetivo=arrecife', c: 35.4, r: 19.6 },
    { map: 'cabo', if: '!cabo.firion', c: 26.6, r: R(9.3) },
    { map: 'cabo', if: 'objetivo=reja', npz: 'cristal', c: 15, r: R(3) },
    { map: 'cabo', if: 'objetivo=reja', npz: 'placa', c: 24, r: R(5) },
    { map: 'cabo', if: '!cabo.reja', pz: 'reja1', c: 32.5, r: R(7) },
    { map: 'cabo', if: 'cabo.reja', npz: 'molino', c: 29, r: R(1) },
    { map: 'cabo', if: '!cabo.faro', pz: 'molino', c: 38, r: R(1) },
    { map: 'cabo', if: 'objetivo=arrecife', c: 0.6, r: R(13.6) },
  ];
  if (D.guideExtra) D.guide = D.guide.concat(D.guideExtra);
  TH.guide = {
    target(scene) {
      const pz = scene.puzzle, F = TH.flags;
      for (const g of D.guide) {
        if (g.map !== scene.mapId || (g.if && !F.test(g.if))) continue;
        if (g.pz && !(pz && pz.sig(g.pz))) continue;
        if (g.npz && pz && pz.sig(g.npz)) continue;
        return g;
      }
      return null;
    },
    // se dibuja en coordenadas de pantalla: flecha que rebota sobre el destino, o en el borde si queda fuera
    draw(ctx, scene, cx, cy, t, z) {
      if (scene.inCutscene || TH.scenes.top() !== scene || TH.settings.guide === false) return;
      const g = this.target(scene);
      if (!g) return;
      const m = scene.map, hz = m.hh(Math.floor(g.c), Math.floor(g.r)) * TH.HZ;
      z = z || 1;
      const W = TH.W, H = TH.H, ox = (W - W / z) / 2, oy = (H - H / z) / 2;
      const tx = (g.c * 16 + 8 - cx - ox) * z, ty = (g.r * 16 - hz - cy - oy) * z;
      const pad = 14;
      const L = scene.leader, near = Math.hypot(L.x - (g.c * 16 + 8), L.y - g.r * 16) < 20;
      if (near) return;
      ctx.save();
      if (tx > pad && tx < W - pad && ty > 30 && ty < H - pad) {
        const b = Math.sin(t * 5) * 3, y = ty - 26 + b;
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 5);
        ctx.strokeStyle = '#ffe48a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(tx, ty + 2, 9 + Math.sin(t * 5), 4, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        if (ty > 52) this.arrow(ctx, tx, y, Math.PI / 2);
        else this.arrow(ctx, tx - 18 + b, ty - 6, 0); // pegado al borde superior: la flecha va de lado
      } else {
        // fuera de la vista: flecha en el borde apuntando hacia el destino
        const ax = W / 2, ay = H / 2, a = Math.atan2(ty - ay, tx - ax);
        const k = Math.min((W / 2 - pad) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - pad - 10) / Math.abs(Math.sin(a) || 1e-6));
        const x = ax + Math.cos(a) * k, y = ay + Math.sin(a) * k + 5, b = Math.sin(t * 6) * 2;
        this.arrow(ctx, x - Math.cos(a) * b, y - Math.sin(a) * b, a);
      }
      ctx.restore();
    },
    arrow(ctx, x, y, a) {
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(a);
      ctx.fillStyle = '#2a1830';
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -7); ctx.lineTo(-2, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd25a';
      ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -5); ctx.lineTo(-1, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff6c8'; ctx.fillRect(1, -1, 3, 1);
      ctx.restore();
    },
  };
})();

// ---------- jefes: nunca perder la escena final ----------
// Antes, el disparador de la escena previa al jefe se marcaba como visto al pisarlo. Si se perdía el combate
// (o se recargaba), la escena ya no volvía y el jugador podía tocar al jefe «suelto» del mapa: ese combate no
// guardaba la victoria ni lanzaba la escena posterior → el jefe revivía y el camino seguía cerrado.
// Ahora: la escena se repite hasta ganar, y el jefe del mapa lleva la misma victoria y escena posterior.
(function () {
  'use strict';
  const D = window.TH.data, S = D.scripts;
  const findBattle = (ops) => (ops || []).find((o) => o && o.battle && o.once);
  const and = (a, b) => [].concat(a || [], b);
  for (const id in D.maps) {
    const M = D.maps[id], foeLists = [M.foes || []].concat(Object.values(M.epochs || {}).map((e) => e.foes || []));
    for (const tg of M.triggers || []) {
      const bt = findBattle(S[tg.script]);
      if (!bt) continue;
      if (tg.once) {
        // el flag del disparador lo usan otras partes (NPC, enemigos): se marca al ganar, no al pisar
        const flag = tg.once;
        tg.if = and(tg.if, '!' + bt.once); delete tg.once;
        if (bt.after && S[bt.after] && !S[bt.after].some((o) => o && o.set === flag)) S[bt.after].unshift({ set: flag });
        else if (!bt.after) { bt.after = 'boss.' + flag; S[bt.after] = [{ set: flag }]; }
      }
      for (const list of foeLists) for (const f of list) {
        if (!f.static || !f.group || f.group[0] !== bt.battle[0] || f.once) continue;
        f.once = bt.once; f.after = bt.after; if (bt.tips) f.tips = bt.tips;
      }
    }
  }
})();

// el paso del arrecife al santuario pedía un flag «cap2» que ningún guion pone: se abre al terminar el capítulo 1
(function () {
  const ex = (window.TH.data.maps.arrecife.exits || []).find((e) => e.to === 'santuario');
  if (ex && ex.if === 'cap2') ex.if = 'cap1.fin';
})();
