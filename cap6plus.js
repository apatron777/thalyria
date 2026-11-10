// Hondaroca épica (capítulo 6): el pueblo de las forjas medio tragado por el mar.
// · Puerto hundido: casas de las que solo asoma el tejado y la cabeza de piedra del Padre Yunque, con un ojo que aún brilla.
// · Terraza baja y barrio de la forja: hornos, chimeneas humeantes, yunques, braseros y la grúa con su crisol.
// · Gran Fragua: el horno mayor detrás del Coloso, flanqueado por dos fosos de magma y braseros. Brasas en el aire.
// Las piezas jugables (puzle, cofres, disparadores, NPC, barca) no se mueven.
(function () {
  'use strict';
  const M = window.TH.data.maps.hondaroca;
  if (!M) return;
  const PITS = [[7, 2, 3, 4], [26, 2, 3, 4]];
  M.heightRects = M.heightRects.concat(PITS.map((p) => p.concat([0])));
  M.terrainRects = M.terrainRects.concat(PITS.map((p) => p.concat(['~'])), [[14, 3, 8, 3, 'p'], [6, 0, 24, 1, 'd']]);
  M.lavaRects = PITS;
  M.dark = 0.38;
  M.ambient = 'ember';
  M.clouds = 0.6;
  M.zones = [{ rect: [0, 0, 36, 26], tint: [0.92, 0.8, 0.74] }, { rect: [6, 0, 24, 8], tint: [1.15, 0.82, 0.62] }];
  M.props = [
    // puerto hundido
    ['ruin', 6, 22.6, { v: 0 }], ['ruin', 12, 24.8, { v: 1 }], ['ruin', 26.5, 23.6, { v: 1 }], ['giant_head', 31.5, 23.6],
    ['post', 16, 24], ['post', 21, 24], ['post', 14, 21.6], ['post', 23, 21.4],
    // terraza baja
    ['house', 5, 16, { v: 1 }], ['house', 30, 16, { v: 2 }], ['forge', 25.5, 16.4], ['anvil', 22, 17.6], ['brazier', 15, 15], ['brazier', 21.6, 15],
    ['chimney', 9.4, 15], ['crate', 27.5, 18.6], ['barrel', 29, 18.8], ['rock', 3, 13], ['rock', 33, 12],
    // barrio de la forja
    ['house', 6, 10, { v: 0 }], ['chimney', 3.6, 12.4], ['crucible', 32, 12.6], ['anvil', 14.6, 11.2], ['brazier', 15, 9.4], ['brazier', 22, 9.4],
    ['crate', 11, 9], ['gem', 29, 11],
    // Gran Fragua
    ['forge', 18, 1.2], ['brazier', 13.6, 3.2], ['brazier', 22.4, 3.2], ['chimney', 11.5, 1.2], ['chimney', 24.6, 1.2],
    ['crucible', 14.5, 5.6], ['anvil', 23, 5.4],
    ['lavaglow', 8.5, 3.2], ['lavaglow', 27.5, 3.2], ['lavaglow', 8.5, 5.2], ['lavaglow', 27.5, 5.2],
    // laderas
    ['pine', 1, 8], ['pine', 34, 6], ['pine', 2, 2], ['pine', 33, 1],
  ];
})();
