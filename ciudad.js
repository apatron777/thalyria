// Ciudad Dorada (capítulo 4): Thalyria viva en el pasado y sus ruinas en el presente. 36×26.
// Sur (1) · canal (0) · barrio norte (1) · plaza del Motor (2).
// Puzle 1 (la regla del Motor): plantar la semilla en el pasado → en el presente las raíces del roble cruzan el canal.
// Puzle 2 (Kaelen): en el pasado, la Lanzada enciende el cristal del barrio norte y abre la escalera de la plaza.
(function () {
  'use strict';
  const TH = window.TH, PAST = 'epoca.ciudad=past', NOW = 'epoca.ciudad=present';
  TH.data.maps.ciudad = {
    id: 'ciudad', name: 'Ciudad Dorada', sub: 'Thalyria',
    w: 36, h: 26, baseHeight: 1, baseTerrain: 'r', epochFlag: 'cap4.regla',
    heightRects: [[0, 11, 36, 2, 0], [8, 0, 20, 7, 2]],
    terrainRects: [[0, 11, 36, 2, '~'], [17, 7, 2, 1, 'S']],
    tiles: [], props: [],
    epochs: {
      past: {
        zones: [{ rect: [0, 0, 36, 26], tint: [1.16, 1.03, 0.8] }, { rect: [8, 0, 20, 7], tint: [1.2, 1.06, 0.82] }],
        terrainRects: [[2, 14, 6, 3, 'f'], [28, 15, 6, 3, 'f'], [10, 1, 16, 2, 'f'], [0, 8, 36, 2, 'g'], [0, 23, 36, 3, 'g']],
        props: [
          ['house', 5, 19, { v: 0 }], ['house', 11, 22, { v: 1 }], ['house', 29, 22, { v: 2 }], ['house', 31, 17, { v: 1 }], ['house', 4, 7, { v: 2 }], ['house', 31, 6, { v: 0 }],
          ['stall', 25, 19], ['well', 17, 18], ['altar', 17.6, 2.4],
          ['lamp', 14, 15], ['lamp', 21, 15], ['lamp', 14, 21], ['lamp', 21, 21], ['lamp', 10, 3], ['lamp', 25, 3], ['lamp', 15, 9], ['lamp', 22, 9],
          ['tree', 2, 21, { v: 1 }], ['tree', 34, 14, { v: 0 }], ['tree', 8, 9, { v: 2 }], ['bush', 27, 9], ['bush', 9, 15], ['bush', 33, 20],
        ],
        chests: [
          { id: 'ciudad_mercado', c: 33, r: 23, give: 'anillo_reloj' },
          { id: 'ciudad_plaza', c: 26, r: 1, give: 'tonico_plus', n: 3 },
        ],
        signs: [{ c: 16.4, r: 15.6, text: 'Plaza del Pozo.{p:0.3} «Que el agua de hoy riegue el mañana», dice la inscripción.' }],
      },
      present: {
        zones: [{ rect: [0, 0, 36, 26], tint: [0.82, 0.9, 1.08] }],
        terrainRects: [[2, 14, 10, 8, 's'], [22, 16, 12, 8, 's'], [0, 8, 36, 2, 's'], [10, 1, 16, 2, 's']],
        props: [
          ['rock', 5, 19], ['rock', 11, 22], ['rock', 29, 22], ['rock', 31, 17], ['rock', 4, 7], ['pine', 31, 6], ['coral', 25, 19, { v: 1 }], ['coral', 6, 9],
          ['gem', 17, 18], ['gem2', 10, 3], ['gem', 25, 3], ['pine', 2, 21], ['pine', 34, 14], ['bush', 27, 9],
        ],
        chests: [
          { id: 'ciudad_reloj', c: 33, r: 9, give: 'eco:eco_reloj' },
          { id: 'ciudad_ruina', c: 3, r: 23, give: 'gold', n: 600 },
        ],
        signs: [{ c: 16.4, r: 15.6, text: 'Una inscripción borrada por el salitre.{p:0.3} Solo se lee: «…riegue el mañana».' }],
      },
    },
    epochStart: 'past',
    npcs: [
      { id: 'oldman', variant: 14, talk: 'cronista', c: 14.5, r: 17.6, ai: 'idle', dir: 'down', if: PAST },
      { id: 'woman', variant: 15, talk: 'ciudadana', c: 8, r: 20, ai: 'wander', radius: 2, if: PAST },
      { id: 'kid', variant: 16, talk: 'nino_dorado', c: 22, r: 21, ai: 'wander', radius: 3, if: PAST },
      { id: 'sailor', variant: 17, talk: 'guardia_dorada', c: 30, r: 9.6, ai: 'idle', dir: 'down', if: PAST },
      { id: 'farmer', variant: 18, talk: 'orfebre', c: 25, r: 20.6, ai: 'idle', dir: 'down', if: PAST },
    ],
    start: { c: 17.5, r: 22.4 },
    exits: [],
    entries: { sur: { c: 17.5, r: 22.4, dir: 'up' } },
    foes: [
      { group: ['engranaje', 'polilla'], patrol: [[27, 15], [33, 15]], sight: 4.5, if: PAST },
      { group: ['polilla', 'polilla'], patrol: [[4, 15], [9, 14]], sight: 5, if: PAST },
      { group: ['engranaje_mayor', 'polilla'], patrol: [[22, 9], [28, 9]], sight: 4.5, if: PAST },
      { group: ['polilla_eterna', 'engranaje'], patrol: [[6, 9], [13, 9]], sight: 5, if: NOW },
      { group: ['engranaje_mayor', 'polilla_eterna'], patrol: [[24, 18], [30, 21]], sight: 4.5, if: NOW },
      { group: ['cronoguardia', 'aguja_izq', 'aguja_der'], c: 17.5, r: 3.2, static: true, if: [PAST, '!jefe.crono'] },
    ],
    triggers: [
      { rect: [12, 16, 6, 4], once: 'cap4.regla', script: 'cap4.regla', cinematic: true, if: PAST },
      { rect: [10, 5, 16, 2], once: 'cap4.jefe', if: [PAST, '!jefe.crono'], script: 'cap4.crono', cinematic: true },
      { rect: [17, 9, 6, 2], once: 'cap4.norte', script: 'cap4.norte' },
    ],
    pickups: [{ id: 'ciudad_agua', c: 34, r: 24, give: 'agua_luna', n: 2 }],
    puzzle: [
      { id: 'reloj_sur', type: 'stele', c: 9, r: 17 },
      { id: 'reloj_norte', type: 'stele', c: 32, r: 9 },
      { id: 'semilla', type: 'seed', c: 19, r: 13, epoch: 'past' },
      { id: 'roble', type: 'tree', c: 19, r: 13, when: 'semilla', bridge: [[20, 12], [20, 11]], epoch: 'present' },
      { id: 'cristal', type: 'crystal', c: 29, r: 8, epoch: 'past' },
      { id: 'reja', type: 'gate', c: 17, r: 7, w: 2, h: 1, open: 'cristal', epoch: 'past' },
      { id: 'derrumbe', type: 'gate', c: 17, r: 7, w: 2, h: 1, open: 'f:nunca', epoch: 'present' },
    ],
  };
})();
