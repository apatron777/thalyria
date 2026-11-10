// Gruta de la Marea (prólogo): bajo los acantilados del oeste de Bruma Salada. Guarida de la Matriarca abisal. 34×24.
// Paredes de roca (altura 2) y suelo de arena mojada (altura 0). Oscura: solo la iluminan cristales y la lanza.
// Puzle 1 (Kaelen): la Lanzada enciende el cristal al otro lado del canal y alza las plataformas.
// Puzle 2 (Kaelen o cualquiera): el bloque sobre la placa abre la reja de la cámara de la Matriarca.
// Secretos: muro de hielo (Flint), estanque que Elara puede vaciar, cofres en las esquinas.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.maps.gruta = {
    id: 'gruta',
    name: 'Gruta de la Marea',
    sub: 'Bajo los acantilados de Bruma Salada',
    w: 34, h: 24,
    baseHeight: 2,
    baseTerrain: 'r',
    dark: 0.82,
    clouds: false,
    heightRects: [
      [2, 1, 20, 7, 0], // cámara de la Matriarca
      [6, 8, 2, 2, 0], // pasillo de la reja
      [2, 10, 31, 8, 0], // galería central
      [33, 13, 1, 2, 0], // salida a la playa
      [17, 9, 3, 10, 0], // canal
      [3, 18, 1, 2, 0], [2, 20, 4, 3, 0], // nicho del hielo
      [27, 18, 3, 2, 0], [25, 20, 7, 3, 0], // estanque y nicho
    ],
    terrainRects: [
      [2, 1, 20, 7, 's'], [6, 8, 2, 2, 's'], [2, 10, 31, 8, 's'], [33, 13, 1, 2, 's'],
      [3, 18, 1, 2, 's'], [2, 20, 4, 3, 's'], [27, 18, 3, 2, 's'], [25, 20, 7, 3, 's'],
      [17, 9, 3, 10, '~'],
    ],
    tiles: [],
    props: [
      ['gem', 4, 2], ['gem2', 19, 2], ['gem', 20, 6], ['gem2', 3, 6],
      ['gem', 3, 11], ['gem2', 11, 16], ['gem', 15, 10], ['gem2', 22, 16], ['gem', 25, 11], ['gem2', 31, 16], ['gem', 29, 10],
      ['gem2', 2, 22], ['gem', 31, 21],
      ['rock', 13, 16], ['rock', 23, 11], ['rock', 26, 16], ['rock', 5, 15], ['rock', 16, 2],
      ['coral', 30, 12, { v: 1 }], ['coral', 9, 6], ['coral', 4, 13, { v: 1 }], ['coral', 21, 13],
    ],
    zones: [
      { rect: [0, 0, 34, 24], tint: [0.62, 0.74, 0.95] },
      { rect: [2, 1, 20, 7], tint: [0.7, 0.6, 0.9] },
    ],
    npcs: [],
    start: { c: 32, r: 13.6 },
    exits: [{ rect: [33, 13, 1, 2], to: 'brumaSalada', entry: 'gruta' }],
    entries: { este: { c: 32, r: 13.6, dir: 'left' } },
    foes: [
      { group: ['larva', 'larva'], patrol: [[26, 12], [30, 15], [27, 16]], sight: 4.5 },
      { group: ['cangrejo', 'larva'], patrol: [[13, 13], [15, 16]], sight: 4 },
      { group: ['larva_voraz', 'larva'], patrol: [[4, 12.6], [9, 16.4], [4, 16.4]], sight: 4.5 },
      // la Matriarca, inmóvil al fondo de su cámara (la escena empieza antes de alcanzarla)
      { group: ['matriarca'], c: 12, r: 2.4, static: true, if: '!jefe.matriarca' },
    ],
    triggers: [
      { rect: [29, 11, 5, 5], once: 'gruta.entrada', script: 'pro.gruta' },
      { rect: [5, 6, 4, 2], once: 'gruta.jefe', if: '!jefe.matriarca', script: 'pro.matriarca', cinematic: true },
      { rect: [20, 10, 2, 8], once: 'gruta.voz', script: 'pro.gruta.voz' },
    ],
    chests: [
      { id: 'gruta_luna', c: 4, r: 21, give: 'eco:eco_luna' },
      { id: 'gruta_estanque', c: 30, r: 21, give: 'tonico_plus', n: 2 },
      { id: 'gruta_este', c: 31, r: 11, give: 'agua_luna', n: 2 },
      { id: 'gruta_oro', c: 2.6, r: 16, give: 'gold', n: 120 },
      { id: 'gruta_camara', c: 20, r: 4, give: 'cinta_marinera' },
    ],
    pickups: [{ id: 'gruta_concha', c: 23, r: 17, give: 'concha' }, { id: 'gruta_tonico', c: 13, r: 10.6, give: 'tonico', n: 2 }],
    signs: [
      { c: 22.5, r: 11, text: 'Al otro lado del canal brilla un cristal apagado.{p:0.3} Si algo lo despertara desde aquí…' },
      { c: 5.5, r: 10.6, text: 'Una reja de coral cierra el paso al norte.{p:0.3} En el suelo, una losa con forma de bloque.' },
    ],
    puzzle: [
      { id: 'reinicio', type: 'lever', c: 11, r: 10, reset: true },
      // canal: el cristal alza las plataformas
      { id: 'cristal', type: 'crystal', c: 14, r: 11 },
      { id: 'pa', type: 'platform', c: 17, r: 14, up: 'cristal' }, { id: 'pb', type: 'platform', c: 18, r: 14, up: 'cristal' }, { id: 'pc', type: 'platform', c: 19, r: 14, up: 'cristal' },
      { id: 'pd', type: 'platform', c: 17, r: 15, up: 'cristal' }, { id: 'pe', type: 'platform', c: 18, r: 15, up: 'cristal' }, { id: 'pf', type: 'platform', c: 19, r: 15, up: 'cristal' },
      // bloque sobre la placa: abre la reja de la cámara
      { id: 'bloque', type: 'block', c: 9, r: 12 },
      { id: 'placa', type: 'plate', c: 9, r: 15 },
      { id: 'reja', type: 'gate', c: 6, r: 9, w: 2, h: 1, open: 'placa' },
      // secretos
      { id: 'hielo', type: 'ice', c: 3, r: 18 },
      { id: 'estanque', type: 'pool', c: 27, r: 18, w: 3, h: 2, high: true, dry: true },
    ],
  };
})();
