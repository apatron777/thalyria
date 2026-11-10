// Grupo: stats base a nivel 1, crecimiento por nivel y equipo inicial
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.party = {
    kaelen: { base: { hp: 42, mp: 12, atk: 9, def: 6, mag: 4, res: 5, spd: 8 }, grow: { hp: 7, mp: 2, atk: 2, def: 1, mag: 1, res: 1, spd: 1 }, equip: { weapon: 'lanza_vieja', armor: 'ropa_viaje', acc: null } },
    elara: { base: { hp: 34, mp: 22, atk: 5, def: 5, mag: 10, res: 9, spd: 7 }, grow: { hp: 5, mp: 4, atk: 1, def: 1, mag: 2, res: 2, spd: 1 }, equip: { weapon: 'baston_deriva', armor: 'ropa_viaje', acc: null } },
    flint: { base: { hp: 55, mp: 8, atk: 11, def: 9, mag: 2, res: 4, spd: 4 }, grow: { hp: 9, mp: 1, atk: 2, def: 2, mag: 0, res: 1, spd: 0 }, equip: { weapon: 'martillo_forja', armor: 'ropa_viaje', acc: null } },
    firion: { base: { hp: 46, mp: 10, atk: 9, def: 8, mag: 5, res: 6, spd: 6 }, grow: { hp: 7, mp: 2, atk: 2, def: 2, mag: 1, res: 1, spd: 1 }, equip: { weapon: 'espada_faro', armor: 'ropa_viaje', acc: null } },
  };
  // inventario y oro al empezar
  TH.data.start = { gold: 120, items: { tonico: 3, pan_algas: 2 }, ecos: ['eco_alba'] };
})();
