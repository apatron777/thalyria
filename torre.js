// Capítulo 7: Aldea de los Faroleros (hogar de Elara) y la Torre del Motor (un faro por personaje).
(function () {
  'use strict';
  const TH = window.TH, M = TH.data.maps;
  // ---------- Aldea de los Faroleros: al pie de la Torre, al atardecer ----------
  M.faroleros = {
    id: 'faroleros', name: 'Aldea de los Faroleros', sub: 'A la sombra de la Torre del Motor',
    w: 34, h: 24, baseHeight: 1, baseTerrain: 'g', clouds: 0.8,
    heightRects: [[0, 19, 34, 5, 0], [0, 0, 34, 10, 2]],
    terrainRects: [
      [0, 21, 34, 3, '~'], [0, 19, 34, 2, 's'], [16, 21, 2, 3, 'd'], [16, 19, 2, 1, 'S'], [16, 11, 2, 8, 'p'], [16, 10, 2, 1, 'S'],
      [16, 1, 2, 9, 'p'], [6, 14, 22, 2, 'p'], [12, 3, 10, 4, 'r'],
    ],
    tiles: [[4, 12, 'f'], [29, 12, 'f'], [8, 17, 'f'], [27, 17, 'f']],
    props: [
      ['house', 7, 12, { v: 0 }], ['house', 12, 17, { v: 2 }], ['house', 24, 12, { v: 1 }], ['house', 29, 17, { v: 0 }], ['house', 4, 17, { v: 1 }],
      ['lamp', 15, 12], ['lamp', 18, 12], ['lamp', 10, 15.6], ['lamp', 22, 15.6], ['lamp', 15, 3], ['lamp', 18, 3], ['lamp', 15, 7], ['lamp', 18, 7],
      ['well', 20, 16.6], ['stall', 10, 12.6], ['campfire', 26, 14.6], ['bush', 2, 13], ['bush', 31, 13], ['boat', 20, 22.4],
    ],
    forests: [{ rect: [0, 0, 34, 2], types: ['pine'], density: 0.6 }, { rect: [0, 2, 10, 8], types: ['pine', 'tree'], density: 0.4, avoid: [[3, 5, 1.6]] }, { rect: [24, 2, 10, 8], types: ['pine', 'tree'], density: 0.4, avoid: [[30, 5, 1.6]] }],
    zones: [{ rect: [0, 0, 34, 24], tint: [1.12, 0.96, 0.88] }],
    npcs: [
      { id: 'woman', variant: 22, talk: 'lia', c: 24, r: 13.6, ai: 'idle', dir: 'down' },
      { id: 'fisher', variant: 23, talk: 'taro', c: 26, r: 15.4, ai: 'idle', dir: 'left' },
      { id: 'woman', variant: 24, talk: 'farolera', c: 10, r: 13.6, ai: 'idle', dir: 'down' },
      { id: 'kid', variant: 25, talk: 'nino_farol', c: 20, r: 18, ai: 'wander', radius: 3 },
      { id: 'oldman', variant: 26, talk: 'viejo_farol', c: 6, r: 15.4, ai: 'wander', radius: 2 },
    ],
    start: { c: 16.5, r: 20 },
    boats: [{ c: 19, r: 21.6, port: 'torre', reach: 26 }],
    entries: { muelle: { c: 16.5, r: 20, dir: 'up' }, torre: { c: 16.5, r: 1.2, dir: 'down' } },
    exits: [{ rect: [16, 0, 2, 1], to: 'torre', entry: 'sur', if: 'cap7.cena', msg: 'La senda de la Torre de noche es un suicidio. Mañana.' }],
    triggers: [
      { rect: [15, 18, 4, 2], once: 'faroleros.llegada', script: 'cap7.llegada' },
      { rect: [22, 13, 5, 3], once: 'cap7.cena', script: 'cap7.cena', cinematic: true },
    ],
    foes: [
      { group: ['farol_errante', 'farol_errante'], patrol: [[4, 5], [8, 7]], sight: 4.5 },
      { group: ['guardian_marea', 'farol_errante'], patrol: [[26, 4], [31, 7]], sight: 4.5 },
      { group: ['farol_corrupto', 'guardian_marea'], patrol: [[3, 19.4], [12, 19.6]], sight: 4.5 },
    ],
    chests: [
      { id: 'farol_bosque', c: 3, r: 5, give: 'eco:eco_farolero' },
      { id: 'farol_risco', c: 30, r: 5, give: 'tonico_plus', n: 3 },
      { id: 'farol_playa', c: 31, r: 19.6, give: 'gold', n: 2000 },
    ],
    pickups: [{ id: 'farol_agua', c: 2, r: 19.6, give: 'agua_luna', n: 2 }],
    signs: [{ c: 18.6, r: 10.6, text: '↑ {*Torre del Motor*}.{p:0.3} «Que nadie suba sin un farol encendido».' }],
  };

  // ---------- Torre del Motor: la explanada de los cuatro faros ----------
  // Cada faro despierta con la Resonancia de uno: Kaelen (cristal), Elara (estanque), Flint (pilar), Firion (molino).
  const props = [
    ['lamp', 4, 2, { lit: 'faro.kaelen' }], ['lamp', 6, 2, { lit: 'faro.kaelen' }],
    ['lamp', 29, 2, { lit: 'faro.elara' }], ['lamp', 33, 2, { lit: 'faro.elara' }],
    ['lamp', 2, 18, { lit: 'faro.flint' }], ['lamp', 8, 18, { lit: 'faro.flint' }],
    ['lamp', 28, 18, { lit: 'faro.firion' }], ['lamp', 33, 18, { lit: 'faro.firion' }],
    ['altar', 18, 1.4], ['lamp', 14, 4], ['lamp', 21, 4], ['rock', 12, 22], ['rock', 24, 22], ['coral', 10, 9, { v: 1 }], ['coral', 26, 9],
    ['gem', 13, 12], ['gem2', 23, 12],
  ];
  M.torre = {
    id: 'torre', name: 'Torre del Motor', sub: 'La explanada de los cuatro faros',
    w: 36, h: 26, baseHeight: 1, baseTerrain: 'r', clouds: 1.2,
    heightRects: [[0, 0, 10, 6, 2], [12, 0, 12, 4, 2], [0, 22, 36, 4, 0]],
    terrainRects: [
      [0, 22, 36, 4, '~'], [4, 6, 2, 1, 'S'], [17, 4, 2, 1, 'S'],
      [10, 6, 16, 10, 'f'], [16, 16, 4, 6, 'p'], [12, 0, 12, 4, 'r'],
    ],
    tiles: [],
    props,
    zones: [{ rect: [0, 0, 36, 26], tint: [0.94, 0.9, 1.08] }],
    npcs: [{ id: 'woman', variant: 27, talk: 'ithra', c: 18, r: 3, ai: 'idle', dir: 'down', if: 'cap7.ithra' }],
    start: { c: 18, r: 20 },
    entries: { sur: { c: 18, r: 20, dir: 'up' } },
    exits: [{ rect: [16, 21, 4, 1], to: 'faroleros', entry: 'torre' }],
    triggers: [
      { rect: [16, 17, 4, 5], once: 'torre.llegada', script: 'cap7.torre' },
      { rect: [0, 0, 10, 7], once: 'faro.kaelen', pz: 'cristal', script: 'cap7.faro_kaelen' },
      { rect: [26, 0, 10, 7], once: 'faro.elara', pz: '!estanque', script: 'cap7.faro_elara' },
      { rect: [0, 15, 10, 7], once: 'faro.flint', pz: 'placa', script: 'cap7.faro_flint' },
      { rect: [26, 15, 10, 7], once: 'faro.firion', pz: 'molino', script: 'cap7.faro_firion' },
      { rect: [10, 6, 16, 10], once: 'cap7.ithra', if: ['faro.kaelen', 'faro.elara', 'faro.flint', 'faro.firion'], script: 'cap7.ithra', cinematic: true },
    ],
    foes: [
      { group: ['guardian_marea', 'farol_corrupto'], patrol: [[12, 14], [16, 15]], sight: 4.5, if: '!cap7.ithra' },
      { group: ['guardian_abismo', 'farol_errante'], patrol: [[20, 14], [24, 15]], sight: 4.5, if: '!cap7.ithra' },
      { group: ['farol_corrupto', 'farol_corrupto'], patrol: [[12, 8], [15, 10]], sight: 5, if: '!cap7.ithra' },
      { group: ['guardian_abismo', 'guardian_marea'], patrol: [[21, 8], [24, 10]], sight: 4.5, if: '!cap7.ithra' },
    ],
    chests: [
      { id: 'torre_altar', c: 22, r: 1, give: 'corona_farolera' },
      { id: 'torre_ola', c: 2, r: 21, give: 'tonico_plus', n: 3 },
    ],
    signs: [
      { c: 9.6, r: 6.6, text: 'Faro del {*Alba*}.{p:0.3} «Se enciende con luz lanzada desde lejos».' },
      { c: 26.4, r: 6.6, text: 'Faro de la {*Luna*}.{p:0.3} «Despierta cuando el agua se retira».' },
      { c: 9.6, r: 15.4, text: 'Faro de la {*Forja*}.{p:0.3} «Arde con el peso de la piedra».' },
      { c: 26.4, r: 15.4, text: 'Faro del {*Vigía*}.{p:0.3} «Gira con el viento de la guardia».' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 18, r: 14, reset: true },
      { id: 'cristal', type: 'crystal', c: 2, r: 2 },
      { id: 'estanque', type: 'pool', c: 30, r: 1, w: 3, h: 3, high: true, dry: true },
      { id: 'pilar', type: 'pillar', c: 5, r: 17 },
      { id: 'placa', type: 'plate', c: 5, r: 20, heavy: true },
      { id: 'molino', type: 'windmill', c: 31, r: 18 },
    ],
  };
})();
