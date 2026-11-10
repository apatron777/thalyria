// Bruma Salada (prólogo). Coordenadas en tiles; 40×30.
// Terreno: g hierba · f flores · p camino · s arena · r adoquín · d muelle · S escalera · ~ agua
(function () {
  'use strict';
  const TH = window.TH;
  const props = [
    // casas
    ['house', 12, 12, { v: 0 }], ['house', 26, 12, { v: 1 }], ['house', 11, 17, { v: 2 }],
    ['house', 27, 17, { v: 0 }], ['house', 16, 7, { v: 1 }], ['house', 23, 7, { v: 2 }],
    // faro y plaza
    ['lighthouse', 34, 3, { lit: '!faro.apagado' }],
    ['well', 21, 15],
    ['lamp', 14, 11], ['lamp', 24, 11], ['lamp', 14, 16], ['lamp', 24, 16],
    ['lamp', 17, 21], ['lamp', 29, 11], ['lamp', 32, 8], ['lamp', 21, 9],
    // puerto
    ['crate', 16, 22], ['crate', 15, 21], ['barrel', 21, 21], ['barrel', 22, 22], ['netrack', 13, 21],
    ['boat', 14, 26, { v: 1 }], ['boat', 25, 27],
    ['stall', 16, 16],
    ['post', 18, 26], ['post', 19, 26], ['post', 18, 27, { dy: -4 }], ['post', 19, 27, { dy: -4 }],
    // claro de Ilun
    ['campfire', 6, 4], ['log', 4, 4], ['log', 8, 5],
    // detalles
    ['rock', 7, 21], ['rock', 28, 21], ['rock', 36, 20], ['rock', 12, 26], ['rock', 33, 27], ['rock', 3, 26],
    ['tree', 3, 15, { v: 0 }], ['tree', 36, 16, { v: 2 }], ['tree', 22, 18, { v: 1 }], ['tree', 5, 11, { v: 0 }], ['tree', 37, 11, { v: 1 }],
    ['bush', 9, 15], ['bush', 30, 15], ['bush', 33, 11], ['bush', 25, 9], ['bush', 13, 9],
  ];
  // valla al borde del acantilado sobre la playa
  // (huecos en la col. 9 para la enredadera y 24–27 para el salto a la playa)
  for (let c = 5; c < 17; c++) if (c !== 9) props.push(['fence', c, 19]);
  for (let c = 22; c < 33; c++) if (c < 24 || c > 27) props.push(['fence', c, 19]);

  // de día (o ya pasada la noche de la defensa) el pueblo está en la calle
  const DIA = { any: ['!def.activa', 'def.fin'] };
  TH.data.maps.brumaSalada = {
    id: 'brumaSalada',
    name: 'Bruma Salada',
    sub: 'Archipiélago de Vael · Presente',
    w: 40, h: 30,
    baseHeight: 1,
    baseTerrain: 'g',
    heightRects: [
      [0, 20, 40, 10, 0], // playa y mar
      [34, 18, 6, 2, 0], // cala del este
      [0, 16, 4, 4, 0], // cala del oeste
      [0, 0, 14, 10, 2], // bosque del claro de Ilun
      [28, 0, 12, 7, 3], // colina del faro
      [28, 7, 12, 2, 2], // terraza del faro
    ],
    terrainRects: [
      [0, 23, 40, 7, '~'], [0, 16, 4, 7, '~'], [4, 20, 36, 3, 's'], [34, 18, 6, 2, 's'],
      // muelle medio hundido
      [18, 23, 2, 3, 'd'], [18, 28, 2, 2, 'd'],
      // caminos
      [18, 5, 2, 5, 'p'], [15, 8, 10, 1, 'p'], [18, 10, 2, 10, 'p'], [3, 13, 33, 2, 'p'],
      [18, 20, 2, 1, 'S'], [18, 21, 2, 2, 'p'],
      [7, 5, 2, 8, 'p'], [7, 10, 2, 1, 'S'],
      [30, 10, 2, 3, 'p'], [30, 9, 2, 1, 'S'], [30, 7, 5, 2, 'p'], [33, 7, 2, 1, 'S'], [33, 4, 2, 3, 'p'],
      [32, 1, 6, 3, 'r'],
      // camino del este hacia los Acantilados
      [35, 13, 5, 2, 'p'],
      // plaza
      [15, 11, 9, 6, 'r'],
    ],
    tiles: [
      [4, 3, 'f'], [9, 6, 'f'], [13, 15, 'f'], [25, 15, 'f'], [6, 18, 'f'], [30, 16, 'f'], [36, 11, 'f'], [21, 4, 'f'], [26, 2, 'f'], [2, 12, 'f'], [34, 15, 'f'], [10, 2, 'f'],
      [4, 20, 's'], [4, 21, 's'], [5, 22, '~'], [30, 22, '~'], [31, 22, '~'], [38, 22, '~'], [39, 21, '~'], [39, 20, '~'],
      [10, 23, 's'], [11, 23, 's'], [26, 23, 's'], [27, 23, 's'], [35, 23, 's'],
    ],
    props,
    forests: [
      { rect: [0, 0, 14, 10], types: ['tree', 'pine', 'tree'], density: 0.6, avoid: [[6, 4, 3.4]] },
      { rect: [28, 0, 4, 7], types: ['pine'], density: 0.55 },
      { rect: [36, 0, 4, 7], types: ['pine'], density: 0.5 },
      { rect: [14, 0, 14, 4], types: ['tree', 'pine'], density: 0.3 },
      { rect: [36, 9, 4, 8], types: ['tree'], density: 0.3 },
      { rect: [0, 10, 4, 6], types: ['tree', 'pine'], density: 0.4 },
    ],
    zones: [
      { rect: [0, 0, 14, 10], tint: [0.8, 0.94, 0.86] },
      { rect: [0, 20, 40, 10], tint: [1.05, 1.0, 0.93] },
      { rect: [28, 0, 12, 9], tint: [0.95, 0.98, 1.06] },
    ],
    // bordes de salto [col0, col1, fila del tile alto] y enredaderas [col, fila del tile alto]
    jumps: [[24, 27, 19], [10, 12, 9], [36, 37, 8]],
    vines: [[2, 9], [29, 6], [9, 19]],
    // NPCs del prólogo · ai: idle (quieto) | wander (pasea dentro de radius tiles)
    // NPCs · if: condición de historia para estar en el mapa (de noche, durante la defensa, el pueblo se encierra)
    npcs: [
      { id: 'ilun', c: 5, r: 6, ai: 'idle', dir: 'right' },
      { id: 'elara', talk: 'elara_claro', c: 6.6, r: 6.6, ai: 'idle', dir: 'left', if: '!grupo.elara' },
      { id: 'flint', talk: 'flint_dia', c: 27.4, r: 18.3, ai: 'idle', dir: 'down', if: '!grupo.flint' },
      { id: 'halvard', c: 34, r: 8, ai: 'idle', dir: 'down' },
      { id: 'mira', c: 20, r: 12, ai: 'wander', radius: 3, if: DIA },
      { id: 'mira', talk: 'mira_def', c: 19.5, r: 12.2, ai: 'idle', dir: 'down', if: ['def.activa', '!def.b1fin'] },
      { id: 'fisher', c: 20, r: 22, ai: 'idle', dir: 'down', if: DIA },
      { id: 'woman', c: 28, r: 14, ai: 'wander', radius: 2, if: DIA },
      { id: 'oldman', c: 25, r: 14, ai: 'idle', dir: 'left', if: DIA },
      { id: 'farmer', c: 6, r: 13, ai: 'wander', radius: 2, if: DIA },
      { id: 'sailor', c: 23, r: 21, ai: 'idle', dir: 'down', if: DIA },
      { id: 'kid', c: 22, r: 16, ai: 'wander', radius: 3, if: DIA },
      { id: 'woman', variant: 1, talk: 'vecina2', c: 31, r: 13, ai: 'wander', radius: 2, if: DIA },
      { id: 'woman', variant: 6, talk: 'tendera', c: 17.6, r: 16.2, ai: 'idle', dir: 'down', if: DIA },
      { id: 'farmer', variant: 2, talk: 'posadero', c: 11, r: 18.1, ai: 'idle', dir: 'down', if: DIA },
      { id: 'kid', variant: 3, talk: 'nino2', c: 12, r: 21, ai: 'wander', radius: 3, if: DIA },
      { id: 'sailor', variant: 4, talk: 'marinera2', c: 28, r: 21, ai: 'idle', dir: 'left', if: DIA },
    ],
    start: { c: 19, r: 14 },
    // conexiones con otras zonas
    exits: [
      { rect: [39, 13, 1, 2], to: 'acantilados', entry: 'oeste', if: 'prologo.fin', msg: 'Hoy no es día de alejarse del pueblo.' },
      { rect: [4, 20, 1, 2], to: 'gruta', entry: 'este', if: 'def.lanza', msg: 'Las rocas del oeste están mojadas y frías. Más allá, solo oscuridad.' },
    ],
    // escenas que se disparan al pisar una zona
    triggers: [
      { rect: [5, 6, 5, 4], once: 'prologo.claro', script: 'pro.claro', cinematic: true },
      { rect: [28, 7, 6, 2], once: 'prologo.faro', if: 'prologo.claro', script: 'pro.faro', cinematic: true },
      { rect: [0, 11, 40, 8], once: 'def.b1t', if: ['def.activa', '!def.b1'], script: 'pro.def1', cinematic: true },
      { rect: [0, 19, 40, 11], once: 'def.b2t', if: ['def.b1fin', '!def.b2'], script: 'pro.def2', cinematic: true },
    ],
    // enemigos: cangrejos de la playa de día; larvas por el pueblo la noche de la defensa
    foes: [
      { group: ['cangrejo'], patrol: [[30, 21.4], [37, 21.4]], sight: 3.5, if: '!def.activa', once: 'bruma.cangrejo' },
      { group: ['larva', 'larva'], patrol: [[15, 13.5], [23, 13.5], [19, 15.5]], sight: 4.5, if: ['def.lanza', '!def.fin'], once: 'def.r1' },
      { group: ['larva_voraz', 'larva'], patrol: [[9, 21.2], [15, 21.6]], sight: 4.5, if: ['def.lanza', '!def.fin'], once: 'def.r2' },
      { group: ['cangrejo', 'larva'], patrol: [[29, 20.6], [36, 21.2]], sight: 4, if: ['def.lanza', '!def.fin'], once: 'def.r3' },
      // la Matriarca asoma junto al muelle (solo se ve durante la escena)
      { group: ['matriarca'], c: 14, r: 25.6, static: true, if: ['def.b2', '!def.lanza'] },
    ],
    entries: {
      este: { c: 37.6, r: 13.5, dir: 'left' },
      muelle: { c: 18.5, r: 24.5, dir: 'up' },
      gruta: { c: 5.6, r: 20.6, dir: 'right' },
    },
    // cofres, brillos, carteles y barca
    chests: [{ id: 'bruma_cala', c: 37, r: 18, give: 'amuleto_coral' }],
    pickups: [
      { id: 'bruma_concha', c: 8, r: 21, give: 'concha' },
      { id: 'bruma_claro', c: 10, r: 3, give: 'tonico' },
    ],
    signs: [
      { c: 20, r: 19, text: 'Puerto de {*Bruma Salada*}. {p:0.3}Barcas de alquiler al final del muelle.' },
      { c: 13, r: 18, text: 'Posada {*La Gaviota*}. {p:0.3}Camas limpias y sopa caliente.' },
      { c: 38, r: 12, text: '→ {*Ruta de los Acantilados*}' },
      { c: 25.4, r: 18.2, text: 'Fragua de {*Flint*}.{p:0.3} «Se arregla todo. Menos el carácter del herrero».' },
      { c: 7, r: 21.6, text: 'Gruta de la Marea.{p:0.3} Los viejos dicen que ahí abajo duerme algo que no es del todo de este mundo.' },
    ],
    boats: [{ c: 20.4, r: 24.6, port: 'bruma', reach: 26 }],
  };
})();
