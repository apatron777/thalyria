// Ruta de los Acantilados: sale de Bruma Salada por el este. 36×26.
// Meseta (altura 2) con mirador (3), pilar con enredadera y cofre, cala con muelle (0).
(function () {
  'use strict';
  const TH = window.TH;
  const props = [
    ['lamp', 32, 20], ['lamp', 22, 14], ['lamp', 34, 1],
    ['rock', 6, 17], ['rock', 25, 16], ['rock', 12, 11], ['rock', 34, 7], ['rock', 23, 20],
    ['bush', 9, 9], ['bush', 27, 11], ['bush', 18, 16], ['bush', 24, 2], ['bush', 33, 11],
    ['crate', 34, 20], ['barrel', 21, 20],
    ['post', 32, 23], ['post', 35, 23], ['post', 32, 24, { dy: -4 }], ['post', 35, 24, { dy: -4 }],
    ['tree', 3, 16, { v: 1 }], ['tree', 14, 17, { v: 0 }], ['pine', 26, 17],
  ];
  // valla sobre la cala (hueco en la escalera)
  for (let c = 20; c < 36; c++) if (c !== 30 && c !== 31) props.push(['fence', c, 18]);
  // valla del mirador
  for (let c = 30; c < 36; c++) props.push(['fence', c, 4, { dy: -2 }]);

  TH.data.maps.acantilados = {
    id: 'acantilados',
    name: 'Ruta de los Acantilados',
    sub: 'Isla de Bruma · Archipiélago de Vael',
    unlock: 'puerto.cala',
    w: 36, h: 26,
    baseHeight: 1,
    baseTerrain: 'g',
    heightRects: [
      [0, 19, 36, 7, 0], // mar y cala
      [0, 0, 8, 7, 2], // bosque del oeste
      [14, 0, 22, 9, 2], // meseta
      [26, 0, 10, 5, 3], // mirador
      [15, 2, 4, 4, 3], // pilar
    ],
    terrainRects: [
      [0, 19, 20, 7, '~'], [20, 19, 16, 2, 's'], [20, 21, 16, 5, '~'],
      [0, 13, 36, 2, 'p'],
      [20, 10, 2, 3, 'p'], [20, 9, 2, 1, 'S'],
      [20, 5, 2, 4, 'p'], [20, 6, 10, 2, 'p'], [28, 5, 2, 1, 'S'],
      [28, 1, 2, 4, 'p'], [29, 1, 6, 3, 'r'],
      [30, 15, 2, 4, 'p'], [30, 19, 2, 1, 'S'],
      [33, 21, 2, 3, 'd'],
    ],
    tiles: [
      [5, 9, 'f'], [11, 16, 'f'], [17, 7, 'f'], [24, 3, 'f'], [27, 16, 'f'], [2, 3, 'f'], [33, 6, 'f'], [16, 4, 'f'],
      [19, 20, '~'], [35, 20, '~'], [27, 21, 's'], [28, 21, 's'],
    ],
    props,
    forests: [
      { rect: [0, 0, 8, 7], types: ['pine', 'tree'], density: 0.6 },
      { rect: [14, 0, 12, 9], types: ['pine', 'tree', 'pine'], density: 0.32, avoid: [[16.5, 3.5, 2.6], [20.5, 7, 2]] },
      { rect: [0, 7, 14, 6], types: ['tree', 'pine'], density: 0.3 },
      { rect: [0, 15, 30, 3], types: ['tree'], density: 0.12 },
      { rect: [32, 5, 4, 4], types: ['pine'], density: 0.4 },
    ],
    zones: [
      { rect: [0, 19, 36, 7], tint: [1.05, 1.0, 0.93] },
      { rect: [26, 0, 10, 5], tint: [0.95, 0.98, 1.08] },
    ],
    jumps: [[17, 18, 5], [24, 26, 8]],
    vines: [[16, 5]],
    npcs: [
      { id: 'fisher', variant: 7, talk: 'barquero', c: 31.5, r: 20.2, ai: 'idle', dir: 'right' },
      { id: 'kid', variant: 8, talk: 'nino_ruta', c: 12, r: 14, ai: 'wander', radius: 3 },
    ],
    start: { c: 1, r: 13 },
    exits: [
      { rect: [0, 13, 1, 2], to: 'brumaSalada', entry: 'este' },
      { rect: [35, 13, 1, 2], to: 'cabo', entry: 'oeste' },
      { rect: [35, 19, 1, 2], to: 'arrecife', entry: 'oeste', if: 'cap1.faro', msg: 'La marea alta cubre el paso al arrecife. Quizá baje si el faro del Vigía vuelve a brillar.' },
    ],
    entries: {
      oeste: { c: 1.4, r: 13.5, dir: 'right' },
      muelle: { c: 33.5, r: 21.6, dir: 'up' },
      este: { c: 33.6, r: 19.6, dir: 'left' },
      cabo: { c: 34.4, r: 13.5, dir: 'left' },
    },
    // enemigos que patrullan: grupo de combate y ruta de patrulla en tiles
    foes: [
      { group: ['larva', 'larva', 'larva'], patrol: [[6, 13.6], [14, 13.6]], sight: 4.5 },
      { group: ['cangrejo', 'larva'], patrol: [[22, 19.9], [28.5, 19.9]], sight: 4 },
      { group: ['gaviota', 'larva'], patrol: [[22, 6.6], [27, 7.2], [24, 6.4]], sight: 5 },
      { group: ['larva_voraz', 'cangrejo'], patrol: [[24, 13.6], [31, 13.6]], sight: 4.5 },
      { group: ['gaviota', 'gaviota'], patrol: [[4, 9], [10, 10]], sight: 5 },
    ],
    chests: [{ id: 'acant_pilar', c: 17, r: 3, give: 'eco:eco_espuma' }],
    pickups: [
      { id: 'acant_concha', c: 25, r: 20, give: 'concha' },
      { id: 'acant_agua', c: 33, r: 2, give: 'agua_luna' },
      { id: 'acant_tonico', c: 9, r: 16, give: 'tonico', n: 2 },
    ],
    signs: [
      { c: 3, r: 12, text: '← {*Bruma Salada*}{p:0.2} · ↑ Mirador{p:0.2} · ↓ Cala y Arrecife{p:0.2} · → {*Cabo del Vigía*}' },
      { c: 32, r: 2.2, name: 'Catalejo', script: 'mirador' },
    ],
    boats: [{ c: 34.5, r: 24.2, port: 'cala', reach: 26 }],
  };
})();
