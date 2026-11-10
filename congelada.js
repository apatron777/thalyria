// Capítulo 8: la Ciudad Congelada (Thalyria dentro del instante) y el Corazón del Motor.
(function () {
  'use strict';
  const TH = window.TH, M = TH.data.maps, CI = M.ciudad;
  const PAST = 'epoca.congelada=past', NOW = 'epoca.congelada=present';
  // ---------- Ciudad Congelada ----------
  // Pasado: la ciudad quieta en el instante, azul y blanca, con la gente congelada a medio gesto.
  // Presente: la misma ciudad dentro de la Torre en ruinas, invadida por el Fondo.
  // Puzle 1 (Kaelen): en el presente, la Lanzada enciende el cristal y alza las plataformas sobre el canal.
  // Puzle 2 (Elara): en el pasado, la compuerta de arena de la plaza solo se abre un instante; Elara la congela.
  M.congelada = Object.assign({}, CI, {
    id: 'congelada', name: 'Ciudad Congelada', sub: 'Thalyria, dentro del instante',
    epochFlag: 'cap4.regla', clouds: false,
    epochs: {
      past: {
        snow: true, ambient: 'flake',
        zones: [{ rect: [0, 0, 36, 26], tint: [0.78, 0.86, 1.22] }, { rect: [8, 0, 20, 7], tint: [0.86, 0.84, 1.3] }],
        terrainRects: CI.epochs.past.terrainRects,
        props: CI.epochs.past.props.filter((p) => p[0] !== 'tree' && p[0] !== 'bush').concat([['gem', 4, 14], ['gem2', 30, 14], ['gem', 12, 9], ['gem2', 24, 2], ['gem', 33, 23], ['gem2', 2, 24]]),
        chests: [{ id: 'cong_plaza', c: 9, r: 1, give: 'eco:eco_instante' }, { id: 'cong_mercado', c: 34, r: 23, give: 'tonico_plus', n: 4 }],
      },
      present: {
        zones: [{ rect: [0, 0, 36, 26], tint: [0.66, 0.62, 0.95] }],
        terrainRects: CI.epochs.present.terrainRects,
        props: CI.epochs.present.props.concat([['gem2', 13, 16], ['gem2', 22, 16], ['gem', 18, 9.4]]),
        chests: [{ id: 'cong_ruina', c: 2, r: 23, give: 'gold', n: 5000 }, { id: 'cong_norte', c: 34, r: 9, give: 'agua_luna', n: 4 }],
      },
    },
    epochStart: 'past',
    npcs: [
      { id: 'woman', variant: 27, talk: 'ithra_tienda', c: 15.5, r: 21.6, ai: 'idle', dir: 'up', if: PAST },
      { id: 'woman', variant: 15, talk: 'congelado', c: 8, r: 19, ai: 'idle', dir: 'right', if: PAST },
      { id: 'kid', variant: 16, talk: 'congelado', c: 22, r: 20, ai: 'idle', dir: 'left', if: PAST },
      { id: 'sailor', variant: 17, talk: 'congelado', c: 30, r: 9.6, ai: 'idle', dir: 'down', if: PAST },
      { id: 'oldman', variant: 14, talk: 'congelado', c: 14.5, r: 17.6, ai: 'idle', dir: 'down', if: PAST },
    ],
    start: { c: 17.5, r: 22.4 },
    entries: { sur: { c: 17.5, r: 22.4, dir: 'up' } },
    foes: [
      { group: ['cristal_tiempo', 'eco_helado'], patrol: [[26, 15], [32, 15]], sight: 4.5, if: PAST },
      { group: ['eco_helado', 'eco_helado'], patrol: [[4, 15], [10, 14]], sight: 5, if: PAST },
      { group: ['cristal_eterno', 'eco_helado'], patrol: [[22, 9], [28, 9]], sight: 4.5, if: PAST },
      { group: ['sombra_abisal', 'cristal_tiempo'], patrol: [[6, 18], [13, 20]], sight: 5, if: NOW },
      { group: ['eco_glacial', 'sombra_abisal'], patrol: [[24, 18], [30, 21]], sight: 4.5, if: NOW },
      { group: ['cristal_eterno', 'eco_glacial'], patrol: [[6, 9], [13, 9]], sight: 5, if: NOW },
    ],
    triggers: [
      { rect: [14, 19, 8, 4], once: 'cong.llegada', script: 'cap8.llegada', if: [PAST, '!cap8.llegada'] },
      { rect: [10, 5, 16, 2], once: 'cap8.puerta', if: PAST, script: 'cap8.puerta', cinematic: true },
    ],
    signs: [{ c: 16.4, r: 15.6, text: 'Una inscripción cubierta de escarcha.{p:0.3} «Que el agua de hoy riegue el mañana».' }],
    pickups: [{ id: 'cong_agua', c: 34, r: 24, give: 'agua_luna', n: 2 }],
    puzzle: [
      { id: 'reloj_sur', type: 'stele', c: 9, r: 17 },
      { id: 'reloj_norte', type: 'stele', c: 32, r: 9 },
      { id: 'cristal', type: 'crystal', c: 19, r: 9, epoch: 'present' },
      { id: 'pa', type: 'platform', c: 20, r: 11, up: 'cristal', epoch: 'present' }, { id: 'pb', type: 'platform', c: 20, r: 12, up: 'cristal', epoch: 'present' },
      { id: 'pc', type: 'platform', c: 21, r: 11, up: 'cristal', epoch: 'present' }, { id: 'pd', type: 'platform', c: 21, r: 12, up: 'cristal', epoch: 'present' },
      { id: 'arena', type: 'timedgate', c: 17, r: 7, w: 2, h: 1, dur: 1.2, epoch: 'past' },
      { id: 'pulso', type: 'lever', c: 14, r: 9, pulse: 'arena', epoch: 'past' },
      { id: 'derrumbe', type: 'gate', c: 17, r: 7, w: 2, h: 1, open: 'f:nunca', epoch: 'present' },
    ],
  });
  delete M.congelada.epochFlag; M.congelada.epochFlag = 'cap4.regla';

  // ---------- Corazón del Motor: una plataforma de luz sobre el vacío ----------
  M.motor = {
    id: 'motor', name: 'Corazón del Motor', sub: 'Donde el tiempo se detuvo',
    w: 30, h: 20, baseHeight: 1, baseTerrain: 'r', clouds: false,
    heightRects: [[0, 0, 30, 3, 0], [0, 17, 30, 3, 0], [0, 0, 3, 20, 0], [27, 0, 3, 20, 0]],
    terrainRects: [[0, 0, 30, 3, '~'], [0, 17, 30, 3, '~'], [0, 0, 3, 20, '~'], [27, 0, 3, 20, '~'], [8, 6, 14, 8, 'p'], [12, 3, 6, 3, 'p']],
    dark: 0.5, ambient: 'mote', music: 'motor',
    tiles: [],
    props: [['altar', 15, 4.4], ['lamp', 5, 5], ['lamp', 24, 5], ['lamp', 5, 15], ['lamp', 24, 15], ['lamp', 10, 6], ['lamp', 20, 6], ['lamp', 10, 13], ['lamp', 20, 13], ['gem', 4, 10], ['gem2', 25, 10], ['gem', 10, 15.6], ['gem2', 20, 15.6]],
    zones: [{ rect: [0, 0, 30, 20], tint: [1.3, 1.08, 0.78] }],
    npcs: [],
    start: { c: 15, r: 13 },
    entries: { centro: { c: 15, r: 13, dir: 'up' } },
    exits: [], foes: [], triggers: [], chests: [],
  };
})();
