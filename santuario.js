// Santuario de las Resonancias: cuatro tramos, uno por Resonancia. Al este del Arrecife. 42×16.
// Tramo 1 Kaelen (cristal tras el canal y bloque sobre placa) · Tramo 2 Flint (muro de hielo y pilar sobre placa de peso)
// Tramo 3 Elara (estanque con plataformas) · Tramo 4 Firion (fuegos, molino que abre la reja y salto sobre el foso)
(function () {
  'use strict';
  const TH = window.TH;
  // muros divisorios con un hueco en las filas 7-8
  const div = (c) => [[c, 4, 1, 3, 2], [c, 9, 1, 3, 2]];
  TH.data.maps.santuario = {
    id: 'santuario',
    name: 'Santuario de las Resonancias',
    sub: 'Ruinas bajo el Arrecife',
    w: 42, h: 16,
    baseHeight: 0,
    baseTerrain: 'g',
    heightRects: [[0, 0, 42, 4, 2], [0, 12, 42, 4, 2]].concat(div(12), div(16), div(20), div(29), div(35)),
    terrainRects: [
      [0, 4, 42, 8, 'r'],
      [6, 4, 2, 8, '~'], // canal del tramo 1
      [37, 4, 2, 8, '~'], // foso del tramo 4
    ],
    tiles: [],
    props: [['lamp', 1, 5], ['lamp', 1, 10], ['lamp', 40, 5], ['lamp', 40, 10], ['bush', 3, 11], ['coral', 13, 11, { v: 1 }], ['coral', 33, 11]],
    zones: [{ rect: [0, 0, 42, 16], tint: [0.92, 0.96, 1.08] }],
    npcs: [],
    start: { c: 1.5, r: 7.6 },
    exits: [{ rect: [0, 7, 1, 2], to: 'arrecife', entry: 'este' }, { rect: [41, 7, 1, 2], to: 'jardin', entry: 'oeste' }],
    entries: { oeste: { c: 1.6, r: 7.6, dir: 'right' }, este: { c: 40.2, r: 7.6, dir: 'left' } },
    chests: [{ id: 'santuario_altar', c: 40, r: 10, give: 'tonico_plus', n: 2 }],
    signs: [
      { c: 3, r: 4, text: 'Cuatro voces abren este lugar.{p:0.3} La luna empuja, el agua sostiene,{p:0.2} la forja derrite{p:0.2} y el viento lleva.' },
      { c: 39.5, r: 4, text: 'Al este, el Jardín del Reloj.{p:0.3} Allí el ayer y el hoy comparten la misma tierra.' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 2, r: 9, reset: true },
      // tramo 1 · Kaelen
      { id: 'cristal1', type: 'crystal', c: 10, r: 5 },
      { id: 'plat1a', type: 'platform', c: 6, r: 7, up: 'cristal1' },
      { id: 'plat1b', type: 'platform', c: 7, r: 7, up: 'cristal1' },
      { id: 'plat1c', type: 'platform', c: 6, r: 8, up: 'cristal1' },
      { id: 'plat1d', type: 'platform', c: 7, r: 8, up: 'cristal1' },
      { id: 'bloque1', type: 'block', c: 10, r: 8 },
      { id: 'placa1', type: 'plate', c: 10, r: 11 },
      { id: 'reja1', type: 'gate', c: 12, r: 7, h: 2, open: 'placa1' },
      // tramo 2 · Flint
      { id: 'hielo1', type: 'ice', c: 16, r: 7 },
      { id: 'hielo2', type: 'ice', c: 16, r: 8 },
      { id: 'pilar', type: 'pillar', c: 18, r: 8 },
      { id: 'roca', type: 'rock', c: 14, r: 6 },
      { id: 'placa2', type: 'plate', c: 18, r: 6, heavy: true },
      { id: 'reja2', type: 'gate', c: 20, r: 7, h: 2, open: 'placa2' },
      // tramo 3 · Elara
      { id: 'estanque', type: 'pool', c: 22, r: 4, w: 5, h: 8, high: false },
      { id: 'p3a', type: 'platform', c: 22, r: 6, pool: 'estanque' },
      { id: 'p3b', type: 'platform', c: 23, r: 6, pool: 'estanque' },
      { id: 'p3c', type: 'platform', c: 24, r: 6, pool: 'estanque' },
      { id: 'p3d', type: 'platform', c: 24, r: 7, pool: 'estanque' },
      { id: 'p3e', type: 'platform', c: 24, r: 8, pool: 'estanque' },
      { id: 'p3f', type: 'platform', c: 25, r: 8, pool: 'estanque' },
      { id: 'p3g', type: 'platform', c: 26, r: 8, pool: 'estanque' },
      // tramo 4 · Firion
      { id: 'fuego1', type: 'fire', c: 29, r: 7 },
      { id: 'fuego2', type: 'fire', c: 29, r: 8 },
      { id: 'molino', type: 'windmill', c: 32, r: 4 },
      { id: 'reja4', type: 'gate', c: 35, r: 7, h: 2, open: 'molino' },
    ],
  };
})();
