// Cabo del Vigía (capítulo 1): el faro más alto de Vael, al final de la Ruta de los Acantilados. 40×30.
// Alturas: pradera (1) · risco del oeste (2) · cornisa (2) · altiplano (3) · explanada del faro (4) · terraza de la lente (5).
// Puzle 1 (Kaelen + Flint): apartar la roca para ver el cristal, encenderlo con la Lanzada y llevar el pilar a la placa → reja del faro.
// Puzle 2 (Firion + Kaelen): apagar los fuegos y hacer girar el molino → reja de la lente; la Lanzada enciende el Ojo del Vigía.
(function () {
  'use strict';
  const TH = window.TH;
  const props = [
    ['lighthouse', 33, 1.4, { lit: 'cap1.faro' }],
    ['lamp', 27, 7, { lit: 'cap1.faro' }], ['lamp', 34, 7, { lit: 'cap1.faro' }], ['lamp', 19, 11], ['lamp', 2, 13], ['lamp', 30, 11],
    ['rock', 6, 18], ['rock', 15, 21], ['rock', 33, 17], ['rock', 25, 4], ['rock', 3, 7], ['rock', 38, 9], ['rock', 12, 25], ['rock', 30, 25],
    ['bush', 9, 16], ['bush', 24, 19], ['bush', 36, 14], ['bush', 16, 5], ['bush', 5, 10], ['bush', 37, 22],
    ['crate', 28, 11], ['barrel', 29, 11.6], ['crate', 37, 4], ['barrel', 30, 5],
    ['post', 22, 26], ['post', 23, 26], ['coral', 4, 25, { v: 1 }], ['coral', 27, 25],
  ];
  // vallas: borde de la cornisa y de la explanada
  for (let c = 14; c < 40; c++) if (c !== 20 && c !== 21) props.push(['fence', c, 11.7, { dy: 0 }]);
  for (let c = 28; c < 40; c++) if (c !== 32 && c !== 33) props.push(['fence', c, 6.6, { dy: -2 }]);

  TH.data.maps.cabo = {
    id: 'cabo',
    name: 'Cabo del Vigía',
    sub: 'Isla de Bruma · el faro más alto de Vael',
    w: 40, h: 30,
    baseHeight: 1,
    baseTerrain: 'g',
    clouds: 1.3,
    heightRects: [
      [0, 24, 40, 6, 0], // playa y mar
      [0, 0, 14, 12, 2], // risco del oeste
      [14, 10, 26, 2, 2], // cornisa
      [14, 0, 26, 10, 3], // altiplano
      [28, 0, 12, 7, 4], // explanada del faro
      [35, 0, 5, 3, 5], // terraza de la lente
      [31, 0, 1, 3, 5], [28, 3, 1, 1, 5], // muros del rincón del molino
    ],
    terrainRects: [
      [0, 26, 40, 4, '~'], [0, 24, 40, 2, 's'],
      // camino: entrada oeste → escalera de la cornisa → altiplano → reja del faro
      [0, 13, 22, 2, 'p'], [20, 12, 2, 1, 'S'], [20, 10, 8, 2, 'p'], [26, 10, 2, 1, 'S'], [26, 7, 2, 3, 'p'], [26, 8, 8, 1, 'p'], [32, 7, 2, 1, 'S'],
      // ramales: risco y playa
      [10, 12, 2, 1, 'S'], [10, 8, 2, 4, 'p'], [6, 15, 2, 9, 'p'], [6, 24, 2, 1, 'S'],
      // explanada y terraza empedradas
      [28, 0, 12, 7, 'r'], [36, 3, 2, 1, 'S'], [35, 0, 5, 3, 'r'],
      [14, 2, 8, 3, 'r'],
    ],
    tiles: [[3, 2, 'f'], [8, 5, 'f'], [17, 7, 'f'], [23, 2, 'f'], [12, 17, 'f'], [27, 15, 'f'], [35, 19, 'f'], [2, 20, 'f'], [31, 21, 'f'], [18, 22, 'f'],
      [9, 24, '~'], [10, 24, '~'], [24, 24, '~'], [39, 24, '~'], [39, 25, '~']],
    props,
    forests: [
      { rect: [0, 0, 14, 4], types: ['pine', 'pine', 'tree'], density: 0.45, avoid: [[2, 2, 2]] },
      { rect: [0, 16, 5, 7], types: ['tree', 'pine'], density: 0.35 },
      { rect: [12, 16, 26, 7], types: ['tree', 'pine'], density: 0.12, avoid: [[22, 19, 4]] },
      { rect: [36, 12, 4, 4], types: ['pine'], density: 0.4 },
      { rect: [14, 5, 6, 4], types: ['pine'], density: 0.25, avoid: [[18, 6, 2]] },
    ],
    zones: [
      { rect: [0, 0, 40, 30], tint: [0.96, 1.0, 1.05] },
      { rect: [28, 0, 12, 7], tint: [0.92, 0.95, 1.1] },
      { rect: [0, 24, 40, 6], tint: [1.04, 1.0, 0.95] },
    ],
    jumps: [[30, 33, 11], [2, 4, 11]],
    vines: [[1, 11]],
    npcs: [
      { id: 'firion', c: 32.5, r: 8.4, dir: 'up', ai: 'idle', if: '!grupo.firion' },
      { id: 'sailor', variant: 9, talk: 'intendente', c: 29, r: 10.6, ai: 'idle', dir: 'down' },
      { id: 'fisher', variant: 10, talk: 'vigia_viejo', c: 9, r: 14.5, ai: 'wander', radius: 2 },
    ],
    start: { c: 1.4, r: 13.5 },
    exits: [{ rect: [0, 13, 1, 2], to: 'acantilados', entry: 'cabo' }],
    entries: { oeste: { c: 1.4, r: 13.5, dir: 'right' } },
    foes: [
      { group: ['cangrejo_roca', 'cangrejo'], patrol: [[12, 19], [18, 21]], sight: 4 },
      { group: ['larva_voraz', 'larva'], patrol: [[26, 16], [32, 18], [28, 21]], sight: 4.5 },
      { group: ['gaviota', 'gaviota'], patrol: [[4, 6], [10, 9]], sight: 5 },
      { group: ['gaviota_abisal', 'cangrejo'], patrol: [[30, 24.6], [36, 24.6]], sight: 4.5 },
      { group: ['gaviota_abisal', 'gaviota'], patrol: [[16, 6], [22, 8], [18, 8.4]], sight: 5, if: 'grupo.firion' },
      // las gaviotas que acosan a Firion (solo se ven hasta la escena)
      { group: ['gaviota_abisal'], c: 29.6, r: 5.8, static: true, if: '!cabo.firion' },
    ],
    triggers: [
      { rect: [1, 12, 2, 4], once: 'cabo.llegada', script: 'cabo.llegada' },
      { rect: [24, 8, 6, 2], once: 'cabo.firion', script: 'cabo.firion', cinematic: true },
      { rect: [35, 0, 5, 3], once: 'cabo.faro', pz: 'ojo', script: 'cabo.faro', cinematic: true },
      { rect: [32, 7, 2, 1], once: 'cabo.reja', pz: 'reja1', script: 'cabo.reja' },
    ],
    chests: [
      { id: 'cabo_lente', c: 35.6, r: 1, give: 'eco:eco_vendaval' },
      { id: 'cabo_risco', c: 2, r: 5, give: 'colgante_marea' },
      { id: 'cabo_playa', c: 36, r: 25, give: 'tonico_plus', n: 2 },
      { id: 'cabo_cornisa', c: 38, r: 10.6, give: 'agua_luna', n: 2 },
      { id: 'cabo_pradera', c: 38, r: 20, give: 'gold', n: 160 },
    ],
    pickups: [
      { id: 'cabo_concha', c: 18, r: 25, give: 'concha' },
      { id: 'cabo_tonico', c: 23, r: 3, give: 'tonico', n: 2 },
      { id: 'cabo_pan', c: 4, r: 17, give: 'pan_algas', n: 2 },
    ],
    signs: [
      { c: 3, r: 12.4, text: '{*Cabo del Vigía*}.{p:0.3} Prohibido el paso sin licencia de la guardia del faro.' },
      { c: 22.6, r: 9.2, text: 'Mecanismo de la reja: {p:0.2}«Cuando el cristal mire y la piedra pese, el Vigía abrirá».' },
      { c: 30.6, r: 4.2, text: 'Molino del viento de guardia.{p:0.3} Su giro abre la escalera de la lente.' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 15, r: 8, reset: true },
      // puzle 1: roca (Flint) que tapa el cristal, cristal (Kaelen) y pilar (Flint) sobre la placa de peso
      { id: 'cristal', type: 'crystal', c: 15, r: 3 },
      { id: 'roca', type: 'rock', c: 18, r: 3 },
      { id: 'pilar', type: 'pillar', c: 24, r: 5 },
      { id: 'placa', type: 'plate', c: 24, r: 8, heavy: true },
      { id: 'reja1', type: 'gate', c: 32, r: 7, w: 2, h: 1, open: 'cristal&placa' },
      // puzle 2: fuegos (Firion), molino (Firion) y el Ojo del Vigía (Kaelen)
      { id: 'fuego1', type: 'fire', c: 29, r: 3 },
      { id: 'fuego2', type: 'fire', c: 30, r: 3 },
      { id: 'molino', type: 'windmill', c: 29, r: 1 },
      { id: 'reja2', type: 'gate', c: 36, r: 3, w: 2, h: 1, open: 'molino' },
      { id: 'ojo', type: 'crystal', c: 38, r: 1 },
    ],
  };
})();
