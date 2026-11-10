// Jardín del Reloj: la misma tierra en dos épocas. Lo que se hace en el pasado cambia el presente.
// Pasado: se planta la semilla junto al río y se abre la compuerta del canal.
// Presente: el roble ha crecido y sus raíces cruzan el río; el pasaje ya no está inundado.
(function () {
  'use strict';
  const TH = window.TH;
  const S = (TH.data.scripts = TH.data.scripts || {});
  S.reloj_altar = [
    { if: 'res.congelar', then: [{ say: 'none', name: 'Altar del Reloj', t: 'La arena cae hacia arriba, muy despacio.' }], else: [
      { say: 'none', name: 'Altar del Reloj', t: 'Una gota de arena dorada flota sobre el altar…{p:0.4} y se posa en la mano de Elara.' },
      { say: 'none', name: 'Elara', t: 'El agua también recuerda.{p:0.3} Si la escucho, puedo pedirle a una cosa que espere.' },
      { set: 'res.congelar' },
      { toast: 'Elara aprende: Congelar el tiempo (Resonancia de Agua sobre una compuerta de arena)' },
    ] },
  ];
  // muro de dos alturas que separa el pasaje
  TH.data.maps.jardin = {
    id: 'jardin',
    name: 'Jardín del Reloj',
    sub: 'Santuario de las Resonancias',
    w: 32, h: 18,
    baseHeight: 0,
    baseTerrain: 'g',
    heightRects: [
      [0, 0, 32, 2, 2], [0, 16, 32, 2, 2], [31, 0, 1, 18, 2], [0, 2, 1, 6, 2], [0, 10, 1, 6, 2],
      [23, 2, 3, 5, 2], [23, 10, 3, 6, 2], // muro del pasaje
      [26, 2, 3, 3, 2], [30, 2, 1, 3, 2], // nicho con la compuerta de arena
    ],
    terrainRects: [
      [14, 2, 2, 14, '~'], // río
      [1, 8, 13, 2, 'p'], [23, 7, 3, 3, 'r'], [16, 8, 7, 2, 'p'],
    ],
    tiles: [],
    props: [['lamp', 2, 7], ['lamp', 2, 10]],
    epochs: {
      past: {
        zones: [{ rect: [0, 0, 32, 18], tint: [1.18, 1.02, 0.74] }],
        props: [['tree', 5, 4, { v: 1 }], ['tree', 9, 14, { v: 0 }], ['bush', 11, 4], ['bush', 7, 12], ['lamp', 12, 7], ['well', 4, 13]],
        terrainRects: [[2, 3, 10, 4, 'f']],
      },
      present: {
        zones: [{ rect: [0, 0, 32, 18], tint: [0.86, 0.94, 1.14] }],
        props: [['rock', 5, 4], ['rock', 12, 7], ['pine', 9, 14], ['bush', 11, 4], ['rock', 4, 13], ['coral', 20, 4, { v: 1 }]],
        terrainRects: [[2, 3, 10, 4, 's']],
        pickups: [{ id: 'jardin_semilla', c: 4, r: 10.6, give: 'semilla' }],
        chests: [{ id: 'jardin_nicho', c: 29, r: 2, give: 'agua_luna', n: 3 }],
        signs: [{ c: 27.5, r: 9, name: 'Altar del Reloj', script: 'reloj_altar', prop: 'altar' }],
      },
    },
    epochStart: 'present',
    npcs: [],
    start: { c: 1.6, r: 8.6 },
    exits: [{ rect: [0, 8, 1, 2], to: 'santuario', entry: 'este' }],
    entries: { oeste: { c: 1.6, r: 8.6, dir: 'right' } },
    signs: [{ c: 3, r: 7, text: 'Toca el reloj de arena{p:0.2} (o pulsa V / ⌛) para cruzar entre el ayer y el hoy.' }],
    puzzle: [
      { id: 'reloj', type: 'stele', c: 6, r: 8 },
      // pasado: semilla y compuerta del canal
      { id: 'semilla', type: 'seed', c: 13, r: 11, epoch: 'past' },
      { id: 'palanca', type: 'lever', c: 12, r: 4, epoch: 'past' },
      { id: 'compuerta', type: 'gate', c: 23, r: 7, w: 3, h: 3, open: 'palanca', epoch: 'past' },
      // presente: el roble y el pasaje
      { id: 'roble', type: 'tree', c: 13, r: 11, when: 'semilla', bridge: [[14, 12], [15, 12]], epoch: 'present' },
      { id: 'pasaje', type: 'pool', c: 23, r: 7, w: 3, h: 3, level: '!palanca', dry: true, epoch: 'present' },
      // compuerta de arena (necesita congelar el tiempo)
      { id: 'arena', type: 'timedgate', c: 29, r: 4, dur: 1.1, epoch: 'present' },
      { id: 'palanca_t', type: 'lever', c: 27, r: 14, pulse: 'arena', epoch: 'present' },
    ],
  };
})();
