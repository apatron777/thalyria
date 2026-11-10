// Bosque de las Raíces Hundidas (capítulo 2): isla del oeste. 36×26. Playa (0) · pradera con estanque (1) · claro de la Madre (2).
// Puzle (Kaelen + Firion): la Lanzada enciende el cristal al otro lado del estanque (abre la reja) y la Ráfaga apaga los fuegos de la escalera.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.maps.bosque = {
    id: 'bosque', name: 'Bosque de las Raíces Hundidas', sub: 'Isla del Oeste · Archipiélago de Vael',
    w: 36, h: 26, baseHeight: 1, baseTerrain: 'g', clouds: 0.7,
    heightRects: [[0, 21, 36, 5, 0], [4, 0, 28, 10, 2], [24, 12, 5, 5, 0]],
    terrainRects: [
      [0, 23, 36, 3, '~'], [0, 21, 36, 2, 's'], [24, 12, 5, 5, '~'], [17, 23, 2, 2, 'd'],
      [17, 21, 2, 1, 'S'], [17, 11, 2, 10, 'p'], [17, 10, 2, 1, 'S'], [3, 15, 14, 2, 'p'], [19, 15, 5, 2, 'p'], [12, 2, 12, 6, 'f'],
    ],
    tiles: [[8, 12, 'f'], [30, 18, 'f'], [5, 6, 'f'], [27, 4, 'f'], [2, 13, 'f'], [33, 11, 'f']],
    props: [
      ['lamp', 16, 12], ['lamp', 19, 19], ['campfire', 22, 19.6], ['log', 24, 19.4],
      ['rock', 6, 18], ['rock', 31, 16], ['rock', 9, 4], ['bush', 12, 18], ['bush', 26, 18], ['bush', 21, 12],
      ['coral', 4, 21, { v: 1 }], ['coral', 30, 22], ['gem', 30.6, 12.6], ['gem2', 6, 8.6], ['gem2', 29, 8.6],
    ],
    forests: [
      { rect: [4, 0, 28, 2], types: ['pine', 'tree'], density: 0.55 },
      { rect: [4, 2, 6, 8], types: ['tree', 'pine'], density: 0.35, avoid: [[6.5, 2.5, 3]] },
      { rect: [26, 2, 6, 8], types: ['tree', 'pine'], density: 0.35, avoid: [[30, 3, 1.8]] },
      { rect: [0, 10, 6, 11], types: ['tree', 'pine'], density: 0.45 },
      { rect: [29, 10, 7, 11], types: ['tree'], density: 0.3, avoid: [[30, 14, 2.5], [33, 18, 1.8]] },
      { rect: [6, 17, 10, 3], types: ['tree', 'pine'], density: 0.22 },
    ],
    zones: [{ rect: [0, 0, 36, 26], tint: [0.86, 1.0, 0.9] }, { rect: [4, 0, 28, 10], tint: [0.82, 0.92, 0.95] }],
    npcs: [
      { id: 'woman', variant: 12, talk: 'mercader_bosque', c: 20.5, r: 19.4, ai: 'idle', dir: 'down' },
      { id: 'oldman', variant: 13, talk: 'guardabosques', c: 9, r: 15.4, ai: 'wander', radius: 2 },
      { id: 'elara', talk: 'elara_raices', c: 21.5, r: 3.6, ai: 'idle', dir: 'down', if: '!grupo.elara' },
    ],
    start: { c: 17.5, r: 22 },
    exits: [],
    entries: { muelle: { c: 17.5, r: 22, dir: 'up' } },
    foes: [
      { group: ['larva_musgo', 'larva_musgo'], patrol: [[8, 15.6], [14, 15.6]], sight: 4.5 },
      { group: ['cangrejo_raiz', 'larva_musgo'], patrol: [[20, 13], [22, 17]], sight: 4.5 },
      { group: ['larva_espina', 'cangrejo_raiz'], patrol: [[31, 18], [33, 13]], sight: 4.5 },
      { group: ['cangrejo_tronco', 'larva_musgo'], patrol: [[4, 19], [12, 19.4]], sight: 4 },
      { group: ['larva_espina', 'larva_espina'], patrol: [[25, 19], [30, 20]], sight: 4.5 },
      { group: ['madre'], c: 18, r: 3.4, static: true, if: '!jefe.madre' },
    ],
    triggers: [
      { rect: [15, 20, 6, 2], once: 'bosque.llegada', script: 'cap2.llegada' },
      { rect: [14, 8, 8, 2], once: 'bosque.madre', if: '!jefe.madre', script: 'cap2.madre', cinematic: true },
    ],
    chests: [
      { id: 'bosque_raiz', c: 6.5, r: 2.6, give: 'eco:eco_raiz' },
      { id: 'bosque_este', c: 33, r: 18, give: 'tonico_plus', n: 2 },
      { id: 'bosque_playa', c: 2, r: 21.4, give: 'gold', n: 300 },
      { id: 'bosque_claro', c: 30, r: 3, give: 'botas_raiz' },
    ],
    pickups: [{ id: 'bosque_agua', c: 34, r: 14, give: 'agua_luna', n: 2 }, { id: 'bosque_tonico', c: 3, r: 11, give: 'tonico', n: 2 }],
    signs: [
      { c: 15.5, r: 13, text: 'Los fuegos azules no queman la madera:{p:0.2} la protegen.{p:0.3} Solo el viento de un vigía los apaga.' },
      { c: 22.5, r: 13.4, text: 'Al otro lado del agua duerme un cristal.{p:0.3} La reja del claro despierta con él.' },
    ],
    puzzle: [
      { id: 'cristal', type: 'crystal', c: 30, r: 14 },
      { id: 'pa', type: 'platform', c: 24, r: 14, up: 'cristal' }, { id: 'pb', type: 'platform', c: 25, r: 14, up: 'cristal' }, { id: 'pc', type: 'platform', c: 26, r: 14, up: 'cristal' },
      { id: 'pd', type: 'platform', c: 27, r: 14, up: 'cristal' }, { id: 'pe', type: 'platform', c: 28, r: 14, up: 'cristal' },
      { id: 'fuego1', type: 'fire', c: 17, r: 11 }, { id: 'fuego2', type: 'fire', c: 18, r: 11 },
      { id: 'reja', type: 'gate', c: 17, r: 10, w: 2, h: 1, open: 'cristal&fuego1&fuego2' },
    ],
  };
})();
