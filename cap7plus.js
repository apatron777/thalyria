// Capítulo 7 épico: la Aldea de los Faroleros y la Torre del Motor.
// · Aldea: guirnaldas de farolillos sobre las calles, faroles altos, farolillos que suben al cielo y la Torre del Motor
//   asomando dorada sobre el bosque.
// · Torre: la explanada con cuatro faros de piedra de verdad (uno por héroe) que se encienden con sus haces al despertarlos,
//   y la aguja dorada del Motor detrás del altar.
// Las piezas jugables (puzles, cofres, disparadores, NPC, barca) no se mueven.
(function () {
  'use strict';
  const M = window.TH.data.maps;
  const F = M.faroleros, T = M.torre;
  if (F) {
    F.props = [
      ['house', 7, 12, { v: 0 }], ['house', 12, 17, { v: 2 }], ['house', 24, 12, { v: 1 }], ['house', 29, 17, { v: 0 }], ['house', 4, 17, { v: 1 }],
      ['lantern_post', 15, 12], ['lantern_post', 18.6, 12], ['lantern_post', 10, 15.6], ['lantern_post', 22, 15.6],
      ['lantern_post', 15, 3], ['lantern_post', 18.6, 3], ['lantern_post', 15, 7], ['lantern_post', 18.6, 7],
      ['garland', 11, 13.6, { v: 0 }], ['garland', 22.5, 13.6, { v: 2 }], ['garland', 17, 9.6, { v: 1 }], ['garland', 17, 5, { v: 3 }],
      ['well', 20, 16.6], ['stall', 10, 12.6], ['campfire', 26, 14.6], ['bush', 2, 13], ['bush', 31, 13], ['boat', 20, 22.4], ['boat', 6, 22.8], ['post', 13, 21.6], ['post', 22, 21.4],
      ['motor_tower', 27, 3.2],
    ];
    if (F.forests && F.forests[2]) F.forests[2].avoid = (F.forests[2].avoid || []).concat([[27, 2.6, 3]]);
    F.ambient = 'lantern';
    F.zones = [{ rect: [0, 0, 34, 24], tint: [1.14, 0.94, 0.86] }];
  }
  if (T) {
    T.props = T.props.filter((p) => !(p[0] === 'altar')).concat([
      ['motor_tower', 18, 0.6], ['altar', 18, 1.6],
      ['beacon', 8.2, 3.4, { v: 0, lit: 'faro.kaelen' }], ['beacon', 27, 3.4, { v: 1, lit: 'faro.elara' }],
      ['beacon', 1.6, 16.4, { v: 2, lit: 'faro.flint' }], ['beacon', 34.4, 16.4, { v: 3, lit: 'faro.firion' }],
      ['brazier', 12.4, 15.6], ['brazier', 23.6, 15.6], ['brazier', 12.4, 6.6], ['brazier', 23.6, 6.6],
    ]);
    T.ambient = 'mote';
    T.dark = 0.22;
    T.zones = [{ rect: [0, 0, 36, 26], tint: [0.96, 0.9, 1.1] }, { rect: [12, 0, 12, 6], tint: [1.12, 0.98, 0.84] }];
  }
})();
