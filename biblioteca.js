// Biblioteca de las Dos Épocas (capítulo 5). 34×22. Pasado: biblioteca dorada · Presente: ruina anegada de sombras.
// Archivo (noroeste) · cámara sellada (noreste) · gran sala (sur).
// Puzle 1: tirar de la palanca en el pasado vacía el archivo inundado del presente.
// Puzle 2 (Elara): la compuerta de arena se abre un instante con su palanca; Elara la congela para cruzar a la cámara.
(function () {
  'use strict';
  const TH = window.TH, PAST = 'epoca.biblioteca=past', NOW = 'epoca.biblioteca=present';
  TH.data.maps.biblioteca = {
    id: 'biblioteca', name: 'Biblioteca de las Dos Épocas', sub: 'Thalyria',
    w: 34, h: 22, baseHeight: 1, baseTerrain: 'r', epochFlag: 'cap4.regla',
    heightRects: [[0, 9, 4, 2, 3], [10, 9, 16, 2, 3], [28, 9, 6, 2, 3], [13, 1, 1, 8, 3], [0, 0, 34, 1, 3]],
    terrainRects: [[0, 0, 34, 1, 'r']],
    tiles: [], props: [],
    epochs: {
      past: {
        zones: [{ rect: [0, 0, 34, 22], tint: [1.14, 1.02, 0.84] }],
        terrainRects: [[2, 12, 30, 2, 'f'], [15, 15, 5, 4, 'p']],
        props: [
          ['altar', 17.5, 16.4], ['lamp', 6, 12], ['lamp', 28, 12], ['lamp', 6, 19], ['lamp', 28, 19], ['lamp', 3, 3], ['lamp', 11, 3], ['lamp', 16, 3], ['lamp', 31, 3],
          ['crate', 20, 2], ['barrel', 22, 2], ['bush', 2, 20], ['bush', 32, 13],
        ].concat([3, 4, 5, 6, 7, 26, 27, 28, 29, 30].map((c) => ['fence', c, 17, { dy: -2 }])),
        chests: [
          { id: 'bib_archivo_pasado', c: 10, r: 3, give: 'tomo_luna' },
          { id: 'bib_sala_pasado', c: 31, r: 20, give: 'tonico_plus', n: 3 },
        ],
      },
      present: {
        zones: [{ rect: [0, 0, 34, 22], tint: [0.7, 0.8, 1.05] }, { rect: [14, 1, 19, 8], tint: [0.62, 0.62, 0.95] }],
        terrainRects: [[2, 12, 30, 2, 's'], [2, 1, 11, 8, 's']],
        props: [
          ['gem2', 6, 12], ['gem', 28, 12], ['gem2', 3, 3], ['gem', 31, 3], ['gem2', 17, 3], ['rock', 17.5, 16.4], ['coral', 7, 18, { v: 1 }],
          ['coral', 27, 18], ['rock', 20, 2], ['coral', 10, 6], ['rock', 2, 20],
        ],
        chests: [
          { id: 'bib_archivo', c: 6, r: 3, give: 'eco:eco_abismo' },
          { id: 'bib_sala', c: 2, r: 19, give: 'gold', n: 800 },
          { id: 'bib_camara', c: 31, r: 2, give: 'manto_estrella' },
        ],
      },
    },
    epochStart: 'present',
    npcs: [
      { id: 'woman', variant: 19, talk: 'copista', c: 8, r: 15.6, ai: 'idle', dir: 'down', if: PAST },
    ],
    start: { c: 17.5, r: 20.2 },
    exits: [],
    entries: { sur: { c: 17.5, r: 20.2, dir: 'up' } },
    foes: [
      { group: ['sombra', 'sombra'], patrol: [[4, 14], [10, 15]], sight: 4.5, if: NOW },
      { group: ['sombra_abisal', 'polilla_eterna'], patrol: [[24, 15], [30, 14]], sight: 4.5, if: NOW },
      { group: ['sombra', 'polilla_eterna'], patrol: [[12, 19], [22, 19.4]], sight: 4.5, if: NOW },
      { group: ['engranaje_mayor', 'polilla'], patrol: [[22, 13], [30, 13]], sight: 4.5, if: PAST },
      { group: ['sombra_abisal', 'sombra'], patrol: [[4, 4], [10, 6]], sight: 4.5, if: NOW },
      { group: ['abisal'], c: 23, r: 4, static: true, if: [NOW, '!jefe.abisal'] },
    ],
    triggers: [
      { rect: [12, 12, 10, 3], once: 'cap5.varek', if: NOW, script: 'cap5.varek', cinematic: true },
      { rect: [12, 15, 11, 6], once: 'cap5.arena', if: PAST, script: 'cap5.arena', cinematic: true },
      { rect: [24, 6, 6, 2], once: 'cap5.jefe', if: [NOW, '!jefe.abisal'], script: 'cap5.abisal', cinematic: true },
    ],
    signs: [
      { c: 22.5, r: 12.4, text: 'Compuerta de arena de la cámara.{p:0.3} Se abre un instante con la palanca de aquí abajo.{p:0.3} Truco: elige antes la Resonancia de Agua de Elara (R), tira de la palanca y, sin moverte, úsala (X/Z) hacia la compuerta para congelarla abierta.' },
    ],
    puzzle: [
      { id: 'palanca', type: 'lever', c: 11, r: 14, epoch: 'past' },
      { id: 'inundacion', type: 'pool', c: 4, r: 9, w: 6, h: 2, level: '!palanca', dry: true, epoch: 'present' },
      { id: 'arena', type: 'timedgate', c: 26, r: 9, w: 2, h: 2, dur: 3, epoch: 'present' },
      { id: 'pulso', type: 'lever', c: 24, r: 13, pulse: 'arena', epoch: 'present' },
      { id: 'sello', type: 'gate', c: 26, r: 9, w: 2, h: 2, open: 'f:nunca', epoch: 'past' },
      { id: 'reloj', type: 'stele', c: 14, r: 19 },
    ],
  };
})();
