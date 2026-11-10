// Capítulo 6: Bruma Salada inundada y Hondaroca, el pueblo hundido de Flint.
(function () {
  'use strict';
  const TH = window.TH, M = TH.data.maps;
  const B = M.brumaSalada;

  // ---------- Bruma Salada inundada (mismo pueblo, el mar ha subido hasta la plaza) ----------
  // Puzle (Kaelen): la Lanzada enciende el cristal del muelle flotante y alza las plataformas sobre la calle anegada.
  M.brumaInundada = Object.assign({}, B, {
    id: 'brumaInundada', name: 'Bruma Salada', sub: 'Inundada',
    heightRects: B.heightRects.concat([[0, 17, 40, 13, 0], [33, 14, 7, 3, 0]]),
    terrainRects: B.terrainRects.concat([[0, 17, 40, 13, '~'], [33, 14, 7, 3, '~'], [18, 17, 2, 1, 'S'], [17, 23, 4, 3, 'd']]),
    tiles: [],
    zones: [{ rect: [0, 0, 40, 30], tint: [0.78, 0.86, 1.06] }],
    clouds: 1.6,
    npcs: [
      { id: 'halvard', talk: 'halvard_inundada', c: 21, r: 13, ai: 'idle', dir: 'down' },
      { id: 'mira', talk: 'mira_inundada', c: 17, r: 12.6, ai: 'idle', dir: 'right' },
      { id: 'ilun', talk: 'ilun_inundada', c: 5, r: 6, ai: 'idle', dir: 'right' },
      { id: 'woman', variant: 6, talk: 'nerea_inundada', c: 24, r: 15.6, ai: 'idle', dir: 'down' },
      { id: 'fisher', talk: 'superviviente1', c: 13, r: 14, ai: 'idle', dir: 'right' },
      { id: 'oldman', talk: 'superviviente2', c: 32, r: 8, ai: 'idle', dir: 'down' },
      { id: 'kid', variant: 3, talk: 'superviviente3', c: 9, r: 12, ai: 'wander', radius: 2 },
    ],
    start: { c: 19, r: 13.4 },
    exits: [{ rect: [39, 13, 1, 2], to: 'acantilados', entry: 'oeste', if: 'nunca', msg: 'El camino de los acantilados está bajo el agua.' }],
    entries: { muelle: { c: 18.5, r: 23.6, dir: 'up' }, plaza: { c: 19, r: 13.4, dir: 'down' } },
    triggers: [{ rect: [16, 18, 5, 2], once: 'inundada.muelle', pz: 'cristal', script: 'cap6.muelle' }],
    foes: [
      { group: ['medusa', 'sombra'], patrol: [[26, 13], [31, 13]], sight: 4.5 },
      { group: ['cangrejo_abisal', 'medusa'], patrol: [[8, 14.6], [14, 15.4]], sight: 4 },
      { group: ['medusa_reina', 'sombra'], patrol: [[30, 10.4], [36, 10.4]], sight: 4.5 },
      { group: ['sombra_abisal', 'medusa'], patrol: [[4, 3], [10, 5]], sight: 4.5 },
    ],
    chests: [
      { id: 'inund_claro', c: 2, r: 2, give: 'eco:eco_forja' },
      { id: 'inund_faro', c: 38, r: 8, give: 'tonico_plus', n: 3 },
      { id: 'inund_muelle', c: 20.6, r: 24.4, give: 'gold', n: 1200 },
      { id: 'inund_plaza', c: 3, r: 15, give: 'anillo_profecia' },
    ],
    pickups: [{ id: 'inund_agua', c: 26, r: 11, give: 'agua_luna', n: 2 }],
    signs: [
      { c: 20.4, r: 16.4, text: 'Más allá del agua, el muelle flotante.{p:0.3} Un cristal apagado brilla en su proa.' },
    ],
    puzzle: [
      { id: 'cristal', type: 'crystal', c: 18, r: 24 },
      { id: 'p1', type: 'platform', c: 18, r: 18, up: 'cristal' }, { id: 'p2', type: 'platform', c: 18, r: 19, up: 'cristal' },
      { id: 'p3', type: 'platform', c: 18, r: 20, up: 'cristal' }, { id: 'p4', type: 'platform', c: 18, r: 21, up: 'cristal' }, { id: 'p5', type: 'platform', c: 18, r: 22, up: 'cristal' },
    ],
  });
  delete M.brumaInundada.forests;
  M.brumaInundada.forests = B.forests;

  // ---------- Hondaroca: el pueblo de las forjas, medio tragado por el mar ----------
  // Puerto (0) · terraza baja (1) · barrio de la forja (2) · Gran Fragua (3).
  // Puzle (Flint + Kaelen): el pilar sobre la placa de peso y el cristal de la mina abren la escalera de la Gran Fragua.
  const props = [
    ['house', 6, 22, { v: 0 }], ['house', 12, 24, { v: 2 }], ['house', 26, 23, { v: 1 }], ['house', 31, 21, { v: 0 }],
    ['house', 5, 16, { v: 1 }], ['house', 30, 16, { v: 2 }], ['house', 6, 10, { v: 0 }],
    ['campfire', 18, 3.4], ['lamp', 15, 15], ['lamp', 22, 15], ['lamp', 15, 9.4], ['lamp', 22, 9.4], ['lamp', 10, 2], ['lamp', 26, 2],
    ['crate', 24, 17], ['barrel', 25, 17.6], ['crate', 11, 9], ['rock', 3, 13], ['rock', 33, 12], ['pine', 1, 8], ['pine', 34, 6], ['pine', 2, 2], ['pine', 33, 1],
    ['gem', 29, 11], ['post', 16, 24], ['post', 21, 24],
  ];
  M.hondaroca = {
    id: 'hondaroca', name: 'Hondaroca', sub: 'El pueblo de las forjas · bajo el mar',
    w: 36, h: 26, baseHeight: 1, baseTerrain: 'r', clouds: 1.4,
    heightRects: [[0, 20, 36, 6, 0], [0, 0, 36, 14, 2], [6, 0, 24, 8, 3]],
    terrainRects: [
      [0, 20, 36, 6, '~'], [17, 21, 2, 4, 'd'], [17, 20, 2, 1, 'S'], [17, 14, 2, 6, 'p'], [17, 13, 2, 1, 'p'], [17, 14, 2, 1, 'S'],
      [17, 8, 2, 1, 'S'], [0, 0, 6, 14, 'g'], [30, 0, 6, 14, 'g'], [20, 10, 8, 2, 'p'],
    ],
    tiles: [[3, 16, 'f'], [33, 18, 'f'], [2, 9, 'f'], [32, 3, 'f']],
    props,
    zones: [{ rect: [0, 0, 36, 26], tint: [0.88, 0.86, 1.02] }, { rect: [6, 0, 24, 7], tint: [1.1, 0.92, 0.82] }],
    npcs: [
      { id: 'woman', variant: 20, talk: 'oriel', c: 24, r: 10.2, ai: 'idle', dir: 'down' },
      { id: 'farmer', variant: 21, talk: 'herrero_hondaroca', c: 12, r: 16, ai: 'idle', dir: 'down' },
    ],
    start: { c: 18, r: 22.6 },
    exits: [],
    boats: [{ c: 19.6, r: 23.4, port: 'hondaroca', reach: 26 }],
    entries: { muelle: { c: 18, r: 22.6, dir: 'up' } },
    triggers: [
      { rect: [15, 17, 6, 3], once: 'hondaroca.llegada', script: 'cap6.hondaroca' },
      { rect: [19, 9, 9, 3], once: 'cap6.profecia', script: 'cap6.profecia', cinematic: true },
      { rect: [10, 6, 16, 2], once: 'cap6.jefe', if: '!jefe.coloso', script: 'cap6.coloso', cinematic: true },
    ],
    foes: [
      { group: ['cangrejo_abisal', 'medusa'], patrol: [[6, 18], [12, 18.6]], sight: 4.5 },
      { group: ['medusa', 'medusa'], patrol: [[24, 18.6], [31, 18]], sight: 5 },
      { group: ['cangrejo_titan', 'sombra'], patrol: [[4, 11], [10, 12]], sight: 4.5 },
      { group: ['medusa_reina', 'cangrejo_abisal'], patrol: [[29, 9], [33, 12]], sight: 4.5 },
      { group: ['coloso', 'yunque_izq', 'yunque_der'], c: 18, r: 2.4, static: true, if: '!jefe.coloso' },
    ],
    chests: [
      { id: 'hond_mina', c: 33, r: 9, give: 'tonico_plus', n: 3 },
      { id: 'hond_casa', c: 2, r: 18, give: 'coraza_coral' },
      { id: 'hond_fragua', c: 28, r: 1, give: 'gold', n: 1500 },
      { id: 'hond_risco', c: 2, r: 3, give: 'agua_luna', n: 3 },
    ],
    pickups: [{ id: 'hond_tonico', c: 33, r: 17, give: 'tonico_plus' }],
    signs: [
      { c: 15.6, r: 13, text: 'Escalera de la Gran Fragua.{p:0.3} «El yunque no se mueve; se le acerca la piedra. La mina enciende el camino».' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 13, r: 8, reset: true },
      { id: 'pilar', type: 'pillar', c: 10, r: 9 },
      { id: 'placa', type: 'plate', c: 10, r: 12, heavy: true },
      { id: 'cristal', type: 'crystal', c: 28, r: 9 },
      { id: 'reja', type: 'gate', c: 17, r: 8, w: 2, h: 1, open: 'placa&cristal' },
    ],
  };
})();
