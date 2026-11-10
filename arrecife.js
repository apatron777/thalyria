// Arrecife de Coral (capítulo 1): playa de coral al este de la cala de los Acantilados. Guarida de Karkinos. 44×22.
// Arena (altura 0), repisas de roca (1) con cofres, pozas de marea y la arena abierta del jefe al este.
// Solo se puede entrar cuando el faro del Vigía vuelve a brillar y la marea baja (ver acantilados.js).
(function () {
  'use strict';
  const TH = window.TH;
  const props = [
    ['coral', 4, 3], ['coral', 7, 18, { v: 1 }], ['coral', 14, 3], ['coral', 15, 18, { v: 1 }], ['coral', 21, 2, { v: 1 }],
    ['coral', 26, 18], ['coral', 11, 8, { v: 1 }], ['coral', 3, 9], ['coral', 20, 11, { v: 1 }], ['coral', 30, 3], ['coral', 41, 4, { v: 1 }],
    ['coral', 41, 17], ['coral', 29, 18, { v: 1 }], ['coral', 35, 2], ['coral', 36, 19, { v: 1 }],
    ['rock', 2, 16], ['rock', 13, 15], ['rock', 18, 6], ['rock', 25, 13], ['rock', 33, 3], ['rock', 40, 18], ['rock', 6, 6],
    ['post', 1, 8], ['post', 1, 12],
  ];
  TH.data.maps.arrecife = {
    id: 'arrecife',
    name: 'Arrecife de Coral',
    sub: 'Isla de Bruma · Archipiélago de Vael',
    w: 44, h: 22,
    baseHeight: 0,
    baseTerrain: 's',
    heightRects: [
      [8, 2, 6, 4, 1], // repisa del oeste
      [16, 14, 7, 4, 1], // repisa del sur
      [22, 2, 5, 4, 1], // repisa del norte
    ],
    terrainRects: [
      [0, 0, 44, 2, '~'], [0, 20, 44, 2, '~'], [43, 0, 1, 9, '~'], [43, 12, 1, 10, '~'],
      [0, 2, 2, 5, '~'], [0, 14, 2, 6, '~'],
      // pozas de marea
      [12, 9, 3, 2, '~'], [24, 8, 2, 3, '~'], [4, 12, 2, 2, '~'], [33, 17, 3, 3, '~'],
      // repisas de roca y sus escaleras
      [8, 2, 6, 4, 'r'], [10, 6, 2, 1, 'S'], [16, 14, 7, 4, 'r'], [18, 18, 2, 1, 'S'], [22, 2, 5, 4, 'r'], [23, 6, 2, 1, 'S'],
      // senda hacia el este
      [0, 9, 3, 3, 'p'], [41, 9, 3, 3, 'p'],
    ],
    tiles: [[21, 19, '~'], [5, 19, '~'], [38, 2, '~'], [39, 2, '~']],
    props,
    zones: [{ rect: [0, 0, 44, 22], tint: [1.02, 0.98, 1.06] }, { rect: [28, 2, 16, 18], tint: [0.98, 0.94, 1.08] }],
    npcs: [],
    start: { c: 2, r: 10.5 },
    exits: [
      { rect: [0, 9, 1, 3], to: 'acantilados', entry: 'este' },
      { rect: [43, 9, 1, 3], to: 'santuario', entry: 'oeste', if: 'cap2', msg: 'La corriente que se llevó a Elara azota este paso. Ahora no.' },
    ],
    entries: { oeste: { c: 1.5, r: 10.5, dir: 'right' }, este: { c: 41.6, r: 10.5, dir: 'left' } },
    foes: [
      { group: ['cangrejo_roca', 'cangrejo'], patrol: [[15, 5], [20, 4.4]], sight: 4 },
      { group: ['larva_voraz', 'gaviota'], patrol: [[6, 15], [12, 17]], sight: 4.5 },
      { group: ['gaviota_abisal', 'cangrejo'], patrol: [[21, 9], [27, 12]], sight: 5 },
      { group: ['cangrejo_roca', 'larva_voraz'], patrol: [[26, 16], [30, 14]], sight: 4 },
      // el Guardián, inmóvil en el centro de su arena (la escena empieza antes de alcanzarlo)
      { group: ['karkinos', 'pinza_izq', 'pinza_der'], c: 37, r: 10, static: true, if: '!jefe.karkinos' },
    ],
    triggers: [
      { rect: [3, 8, 2, 5], once: 'arrecife.llegada', script: 'cap1.arrecife' },
      { rect: [30, 3, 1, 15], once: 'arrecife.jefe', if: '!jefe.karkinos', script: 'cap1.karkinos', cinematic: true },
    ],
    chests: [
      { id: 'arrecife_brasa', c: 9, r: 3, give: 'eco:eco_brasa' },
      { id: 'arrecife_sur', c: 21, r: 15, give: 'guantes_forja' },
      { id: 'arrecife_norte', c: 25, r: 3, give: 'tonico_plus', n: 2 },
      { id: 'arrecife_poza', c: 3, r: 18, give: 'gold', n: 200 },
    ],
    pickups: [{ id: 'arrecife_tonico', c: 14, r: 12, give: 'tonico', n: 2 }, { id: 'arrecife_concha', c: 32, r: 4, give: 'concha' }, { id: 'arrecife_agua', c: 38, r: 16, give: 'agua_luna' }],
    signs: [{ c: 4, r: 8, text: '{*Arrecife de Coral*}{p:0.3} · Peligro: no despertéis al Guardián.' }],
  };
})();
