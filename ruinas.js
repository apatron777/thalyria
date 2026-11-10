// Ruinas de Thalyria (capítulo 3): isla del sur, lo único que el mar no se tragó. 38×28.
// Playa (0) · plaza baja (1) · terraza (2) · explanada del faro de Bronce (3).
// Puzle 1 (Flint): el pilar sobre la placa de peso abre la reja de la terraza.
// Puzle 2 (Firion): el molino de la terraza abre la reja de la explanada. Secreto: estanque que Elara vacía.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.maps.ruinas = {
    id: 'ruinas', name: 'Ruinas de Thalyria', sub: 'Isla del Sur · lo que el mar no se tragó',
    w: 38, h: 28, baseHeight: 1, baseTerrain: 'g', clouds: 1.1,
    heightRects: [[0, 24, 38, 4, 0], [3, 9, 32, 7, 2], [5, 0, 28, 9, 3]],
    terrainRects: [
      [0, 26, 38, 2, '~'], [0, 24, 38, 2, 's'], [18, 26, 2, 2, 'd'], [18, 24, 2, 1, 'S'],
      [10, 17, 18, 5, 'r'], [18, 16, 2, 1, 'S'], [18, 17, 2, 7, 'p'], [3, 9, 32, 7, 'r'], [18, 9, 2, 1, 'S'], [5, 0, 28, 9, 'r'],
      [30, 18, 3, 3, 's'],
    ],
    tiles: [[4, 20, 'f'], [33, 22, 'f'], [8, 22, 'f'], [27, 14, 'f'], [6, 13, 'f']],
    props: [
      ['lighthouse', 30, 3, { lit: 'cap3.faro' }], ['altar', 19, 1.6],
      ['lamp', 15, 17], ['lamp', 22, 17], ['lamp', 15, 10], ['lamp', 22, 10], ['lamp', 12, 6], ['lamp', 26, 6],
      ['rock', 6, 19], ['rock', 33, 17], ['rock', 25, 12], ['rock', 9, 3], ['bush', 3, 17], ['bush', 28, 20], ['bush', 34, 11],
      ['crate', 25, 21], ['barrel', 26, 21.6], ['campfire', 23, 22.4], ['coral', 4, 24], ['coral', 33, 25, { v: 1 }],
    ],
    forests: [
      { rect: [0, 16, 9, 8], types: ['pine', 'tree'], density: 0.3, avoid: [[2, 18, 1.6]] },
      { rect: [29, 16, 9, 8], types: ['tree'], density: 0.25, avoid: [[31, 19, 2.5], [34, 21, 1.6]] },
      { rect: [0, 0, 5, 16], types: ['pine'], density: 0.5 },
      { rect: [33, 0, 5, 16], types: ['pine'], density: 0.5 },
    ],
    zones: [{ rect: [0, 0, 38, 28], tint: [1.06, 0.98, 0.9] }, { rect: [5, 0, 28, 9], tint: [1.0, 0.94, 0.9] }],
    npcs: [
      { id: 'sailor', variant: 11, talk: 'campamento', c: 24, r: 21, ai: 'idle', dir: 'down' },
    ],
    start: { c: 18.5, r: 25 },
    exits: [],
    entries: { muelle: { c: 18.5, r: 25, dir: 'up' } },
    foes: [
      { group: ['centinela', 'halcon'], patrol: [[11, 19], [16, 21]], sight: 4.5 },
      { group: ['halcon', 'halcon'], patrol: [[22, 19], [27, 18]], sight: 5 },
      { group: ['centinela_mayor', 'halcon'], patrol: [[5, 21], [9, 22]], sight: 4.5 },
      { group: ['halcon_tormenta', 'centinela'], patrol: [[8, 12], [14, 13]], sight: 5 },
      { group: ['centinela_mayor', 'halcon_tormenta'], patrol: [[24, 13], [30, 12]], sight: 5 },
      { group: ['vigia_bronce', 'brazo_izq', 'brazo_der'], c: 19, r: 3.6, static: true, if: '!jefe.vigia' },
    ],
    triggers: [
      { rect: [16, 23, 6, 2], once: 'ruinas.llegada', script: 'cap3.llegada' },
      { rect: [14, 11, 10, 3], once: 'cap3.varek', script: 'cap3.varek', cinematic: true },
      { rect: [12, 7, 14, 2], once: 'ruinas.jefe', if: '!jefe.vigia', script: 'cap3.vigia', cinematic: true },
    ],
    chests: [
      { id: 'ruinas_bronce', c: 4, r: 10.4, give: 'eco:eco_bronce' },
      { id: 'ruinas_oeste', c: 2, r: 18, give: 'gold', n: 400 },
      { id: 'ruinas_playa', c: 35, r: 24.4, give: 'tonico_plus', n: 3 },
      { id: 'ruinas_estanque', c: 34, r: 21, give: 'amuleto_bronce' },
    ],
    pickups: [{ id: 'ruinas_agua', c: 31, r: 1.4, give: 'agua_luna', n: 2 }, { id: 'ruinas_tonico', c: 7, r: 2, give: 'tonico_plus' }],
    signs: [
      { c: 16.5, r: 17.4, text: 'Reja de la terraza.{p:0.3} «Que la piedra más pesada descanse donde reza la losa».' },
      { c: 9.5, r: 13.2, text: 'Molino del viento de Thalyria.{p:0.3} Su giro abre la explanada del faro.' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 26, r: 18, reset: true },
      { id: 'pilar', type: 'pillar', c: 12, r: 18 },
      { id: 'placa', type: 'plate', c: 12, r: 21, heavy: true },
      { id: 'reja1', type: 'gate', c: 18, r: 16, w: 2, h: 1, open: 'placa' },
      { id: 'molino', type: 'windmill', c: 8, r: 11 },
      { id: 'reja2', type: 'gate', c: 18, r: 9, w: 2, h: 1, open: 'molino&f:cap3.varek.ido' },
      { id: 'estanque', type: 'pool', c: 30, r: 18, w: 3, h: 3, high: true, dry: true },
    ],
  };
})();
