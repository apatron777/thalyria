// GUION · Capítulo 2 «La Madre del Bosque» y Capítulo 3 «El Vigía de Bronce».
// C2: Flint se queda en la fragua · Kaelen y Firion siguen la corriente al oeste · Elara, dormida en las raíces, despierta y se une
//     · la Madre del Bosque · el faro de las Raíces vuelve a brillar · Elara habla de Varek · Flint vuelve… con presupuesto.
// C3: las Ruinas de Thalyria · Varek y el duelo opcional con Firion · el Vigía de Bronce · el cuarto faro · la verdad de Kaelen.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, T = D.talk;

  // ---------- bestiario ----------
  const E = D.enemies;
  Object.assign(E, {
    larva_musgo: { name: 'Larva de musgo', sprite: 'larva_musgo', hp: 150, atk: 24, def: 9, mag: 22, res: 9, spd: 7, exp: 40, gold: 22, markH: 22,
      weak: { Fuego: 1.4, Luz: 1.2 }, resist: { Agua: 0.6 }, drops: [{ item: 'tonico', chance: 0.4 }],
      actions: { mordisco: { name: 'Mordisco', kind: 'phys', power: 1.0, target: 'one' }, esporas: { name: 'Esporas de musgo', kind: 'mag', power: 0.8, target: 'all', fx: 'spores' } },
      ai: [{ act: 'esporas', every: 3 }, { act: 'mordisco' }] },
    larva_espina: { name: 'Larva espina', sprite: 'larva_espina', hp: 260, atk: 31, def: 12, mag: 28, res: 11, spd: 8, exp: 70, gold: 35, markH: 24,
      weak: { Fuego: 1.4, Luz: 1.2 }, resist: { Agua: 0.6 }, drops: [{ item: 'tonico_plus', chance: 0.2 }],
      actions: { espina: { name: 'Lluvia de espinas', kind: 'phys', power: 0.8, target: 'all' }, mordisco: { name: 'Mordisco', kind: 'phys', power: 1.2, target: 'one', pick: 'weakest' } },
      ai: [{ act: 'espina', every: 2 }, { act: 'mordisco' }] },
    cangrejo_raiz: { name: 'Cangrejo de raíz', sprite: 'cangrejo_raiz', hp: 210, atk: 28, def: 16, mag: 8, res: 10, spd: 4, exp: 50, gold: 28, markH: 32,
      weak: { Fuego: 1.3, Impacto: 1.2 }, resist: { Corte: 0.7 }, drops: [{ item: 'concha', chance: 0.6 }],
      actions: { pinza: { name: 'Pinzazo', kind: 'phys', power: 1.0, target: 'one' }, corteza: { name: 'Corteza', kind: 'buff', target: 'self', buff: { def: 1.5, turns: 2 } } },
      ai: [{ act: 'corteza', if: 'self<0.5', cooldown: 4 }, { act: 'pinza' }] },
    cangrejo_tronco: { name: 'Cangrejo tronco', sprite: 'cangrejo_tronco', hp: 340, atk: 34, def: 20, mag: 8, res: 12, spd: 3, exp: 85, gold: 40, markH: 32,
      weak: { Fuego: 1.4, Impacto: 1.2 }, resist: { Corte: 0.6 }, drops: [{ item: 'tonico_plus', chance: 0.25 }],
      actions: { pinza: { name: 'Pinzazo', kind: 'phys', power: 1.1, target: 'one' }, tronco: { name: 'Golpe de tronco', kind: 'phys', power: 1.6, target: 'one' } },
      ai: [{ act: 'tronco', every: 3 }, { act: 'pinza' }] },
    madre: { name: 'Madre del Bosque', title: 'La que sueña bajo el musgo', sprite: 'madre', boss: true, big: true, markH: 56,
      hp: 1900, atk: 30, def: 14, mag: 30, res: 14, spd: 5, exp: 900, gold: 600,
      weak: { Fuego: 1.3, Luz: 1.2 }, resist: { Agua: 0.5, Impacto: 0.8 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        latigo: { name: 'Látigo de raíz', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        polen: { name: 'Polen dormido', kind: 'mag', power: 0.9, target: 'all', fx: 'spores' },
        abrazo: { name: 'Abrazo del bosque', kind: 'mag', power: 1.5, target: 'all', fx: 'wave' },
        savia: { name: 'Savia antigua', kind: 'heal', heal: 0.08, target: 'self' },
        llamar: { name: 'Brotes del Fondo', kind: 'summon', summon: 'larva_musgo', target: 'self' },
      },
      ai: [{ act: 'abrazo', every: 4 }, { act: 'polen', every: 3 }, { act: 'latigo' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Madre del Bosque', t: 'Shhh… {p:0.4}La niña de la luna duerme. {p:0.3}Su luz alimenta mis raíces, y mis raíces alimentan el mar.' },
          { name: 'Madre del Bosque', t: 'El Fondo me prometió lluvia eterna. {p:0.4}{*No dejaré que os la llevéis.*}' },
        ] },
        { at: 0.5, music: 'jefe2', sprite: 'madre2', dialog: [
          { name: 'Madre del Bosque', t: '{~Mis ramas…~} {p:0.4}Mil años creciendo hacia un sol que no volvía…' },
          { name: 'Madre del Bosque', t: '{s:0.7}Florezca la noche, entonces.' },
        ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 4 }, { act: 'savia', if: 'self<0.3', cooldown: 6 }, { act: 'abrazo', every: 3 }, { act: 'polen', every: 2 }, { act: 'latigo' }] },
      ] },
    halcon: { name: 'Halcón de las ruinas', sprite: 'halcon', hp: 230, atk: 34, def: 12, mag: 32, res: 14, spd: 14, exp: 75, gold: 38, flying: true, markH: 30,
      weak: { Corte: 1.3, Luna: 1.2 }, resist: { Agua: 0.6 }, drops: [{ item: 'pan_algas', chance: 0.4 }],
      actions: { picado: { name: 'Picado', kind: 'phys', power: 1.0, target: 'one' }, viento: { name: 'Viento de arena', kind: 'mag', power: 0.8, target: 'all', fx: 'storm' } },
      ai: [{ act: 'viento', every: 3 }, { act: 'picado' }] },
    halcon_tormenta: { name: 'Halcón de tormenta', sprite: 'halcon_tormenta', hp: 360, atk: 40, def: 14, mag: 38, res: 16, spd: 16, exp: 120, gold: 55, flying: true, markH: 30,
      weak: { Corte: 1.3, Luna: 1.2 }, resist: { Agua: 0.6 }, drops: [{ item: 'agua_luna', chance: 0.3 }],
      actions: { picado: { name: 'Picado', kind: 'phys', power: 1.1, target: 'one', pick: 'weakest' }, rayo: { name: 'Rayo de tormenta', kind: 'mag', power: 1.1, target: 'all', fx: 'storm' } },
      ai: [{ act: 'rayo', every: 2 }, { act: 'picado' }] },
    centinela: { name: 'Centinela de bronce', sprite: 'centinela', hp: 320, atk: 38, def: 22, mag: 10, res: 12, spd: 5, exp: 90, gold: 45, markH: 32,
      weak: { Impacto: 1.4, Agua: 1.2 }, resist: { Corte: 0.6 }, drops: [{ item: 'concha', chance: 0.5 }],
      actions: { pinza: { name: 'Tenaza de bronce', kind: 'phys', power: 1.0, target: 'one' }, escudo: { name: 'Escudo de bronce', kind: 'buff', target: 'self', buff: { def: 1.5, turns: 2 } } },
      ai: [{ act: 'escudo', if: 'self<0.5', cooldown: 4 }, { act: 'pinza' }] },
    centinela_mayor: { name: 'Centinela mayor', sprite: 'centinela_mayor', hp: 480, atk: 44, def: 26, mag: 12, res: 14, spd: 5, exp: 140, gold: 70, markH: 32,
      weak: { Impacto: 1.4, Agua: 1.2 }, resist: { Corte: 0.6 }, drops: [{ item: 'tonico_plus', chance: 0.3 }],
      actions: { pinza: { name: 'Tenaza de bronce', kind: 'phys', power: 1.1, target: 'one' }, martillo: { name: 'Martillo de bronce', kind: 'phys', power: 1.7, target: 'one' } },
      ai: [{ act: 'martillo', every: 3 }, { act: 'pinza' }] },
    vigia_bronce: { name: 'Vigía de Bronce', title: 'Guardián del faro de Thalyria', sprite: 'vigia', boss: true, big: true, markH: 56,
      hp: 2600, atk: 40, def: 18, mag: 34, res: 15, spd: 6, exp: 1500, gold: 900,
      weak: { Impacto: 1.3, Agua: 1.25 }, resist: { Corte: 0.7, Fuego: 0.6 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        aplastar: { name: 'Puño de bronce', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        barrido: { name: 'Barrido', kind: 'phys', power: 0.9, target: 'all' },
        vapor: { name: 'Vapor ardiente', kind: 'mag', power: 1.1, target: 'all', fx: 'storm' },
        rayo: { name: 'Rayo del faro', kind: 'mag', power: 1.6, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'vapor', every: 3 }, { act: 'barrido', every: 2 }, { act: 'aplastar' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Vigía de Bronce', t: 'INTRUSOS. {p:0.4}EL FARO DE THALYRIA NO SE ENCIENDE SIN LA ORDEN DE LA REINA.' },
          { name: 'Vigía de Bronce', t: 'LA ORDEN… {p:0.3}LA ORDEN… {p:0.5}{*AGUA NEGRA EN LOS ENGRANAJES*}.' },
        ] },
        { at: 0.6, music: 'jefe2', sprite: 'vigia2', revive: 0.6, dialog: [
          { name: 'Vigía de Bronce', t: 'SOBRECARGA. {p:0.4}BRAZOS… {p:0.3}REPARADOS.' },
        ], ai: [{ act: 'rayo', every: 3 }, { act: 'vapor', every: 2 }, { act: 'aplastar' }] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Vigía de Bronce', t: 'NÚCLEO… {p:0.4}EXPUESTO. {p:0.3}ÚLTIMA GUARDIA. {p:0.5}{*RAYO DEL FARO*}.' },
          { name: 'Flint', t: '¡Ese corazón brilla! {p:0.3}¡Dadle con todo antes de que vuelva a cargar!' },
        ], ai: [{ act: 'rayo', every: 2 }, { act: 'barrido', every: 2 }, { act: 'aplastar' }] },
      ] },
    brazo_izq: { name: 'Brazo izquierdo', sprite: 'brazo', part: true, markH: 34, hp: 360, atk: 32, def: 20, mag: 10, res: 12, spd: 6, exp: 60, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: { golpe: { name: 'Golpe de bronce', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Escudo de bronce', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    brazo_der: { name: 'Brazo derecho', sprite: 'brazo', part: true, markH: 34, hp: 360, atk: 32, def: 20, mag: 10, res: 12, spd: 6, exp: 60, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: { golpe: { name: 'Golpe de bronce', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Escudo de bronce', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    varek: { name: 'Varek', title: 'Capitán caído de la Guardia del Vigía', char: 'varek', boss: true, markH: 44,
      hp: 560, atk: 33, def: 14, mag: 20, res: 12, spd: 11, exp: 300, gold: 0,
      weak: { Luz: 1.2 }, resist: { Agua: 0.7 },
      actions: { tajo: { name: 'Tajo del capitán', kind: 'phys', power: 1.2, target: 'one' }, negro: { name: 'Corte del Fondo', kind: 'phys', power: 1.6, target: 'one' }, guardia: { name: 'Guardia alta', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 2 } } },
      ai: [{ act: 'negro', every: 3 }, { act: 'guardia', if: 'self<0.5', cooldown: 5 }, { act: 'tajo' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Varek', t: 'Te enseñé a sujetar esa espada, Firion. {p:0.4}Veamos si aprendiste a soltarla.' },
        ] },
        { at: 0.5, music: 'jefe2', dialog: [
          { name: 'Varek', t: '…Has crecido. {p:0.4}Pero la marea crece más.' },
        ] },
      ] },
  });
  TH.foeVariant('larva_musgo', 'larva', 200, 1.1, 1.05, '#0c2010');
  TH.foeVariant('larva_espina', 'larva', 160, 1.4, 0.85, '#141a06');
  TH.foeVariant('cangrejo_raiz', 'cangrejo', 50, 0.7, 0.8, '#1a1408');
  TH.foeVariant('cangrejo_tronco', 'cangrejo', 70, 0.55, 0.62, '#120c06');
  TH.foeVariant('madre', 'karkinos', 110, 1.0, 0.9, '#0a1a0c');
  TH.foeVariant('madre2', 'karkinos2', 140, 1.2, 0.75, '#0a140a');
  TH.foeVariant('halcon', 'gaviota', 35, 2.2, 0.85, '#2a1806');
  TH.foeVariant('halcon_tormenta', 'gaviota', 215, 2.4, 0.7, '#0a0e22');
  TH.foeVariant('centinela', 'cangrejo', 28, 0.55, 1.05, '#20160a');
  TH.foeVariant('centinela_mayor', 'cangrejo', 18, 0.7, 0.8, '#160e06');
  TH.foeVariant('vigia', 'karkinos', 30, 0.55, 1.05, '#1e1408');
  TH.foeVariant('vigia2', 'karkinos2', 20, 0.75, 0.95, '#1a0e06');
  TH.foeVariant('brazo', 'pinza', 30, 0.55, 1.05, '#1e1408');

  // ---------- equipo, Ecos y tiendas ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('lanza_raiz', { name: 'Lanza de raíz viva', type: 'weapon', who: ['kaelen'], price: 380, stats: { atk: 12, mag: 3, spd: 1 }, desc: 'Madera que todavía crece. La punta busca la luz.', unleash: { name: 'Raíz lunar', power: 2.3, types: ['Corte', 'Luna'] } });
  add('espada_raiz', { name: 'Espada de raíz', type: 'weapon', who: ['firion'], price: 360, stats: { atk: 11, def: 2 }, desc: 'Hoja verde de un árbol que nunca vio el sol.', unleash: { name: 'Corte de savia', power: 2.2, types: ['Corte', 'Agua'] } });
  add('capa_musgo', { name: 'Capa de musgo', type: 'armor', price: 320, stats: { def: 9, res: 5 }, desc: 'Abriga, no pesa y huele a lluvia.' });
  add('botas_raiz', { name: 'Botas de raíz', type: 'acc', price: 260, stats: { spd: 3, def: 2 }, desc: 'Se agarran al suelo como si echaran raíces. Solo cuando hace falta.' });
  add('lanza_bronce', { name: 'Lanza de bronce antiguo', type: 'weapon', who: ['kaelen'], price: 620, stats: { atk: 16, spd: 2 }, desc: 'Forjada en Thalyria. Pesa menos que su leyenda.', unleash: { name: 'Lanzada de bronce', power: 2.5, types: ['Corte', 'Luz'] } });
  add('martillo_bronce', { name: 'Martillo de bronce', type: 'weapon', who: ['flint'], price: 640, stats: { atk: 17 }, desc: 'Flint lo mira como se mira a un viejo amigo.', unleash: { name: 'Yunque del faro', power: 2.6, types: ['Impacto', 'Fuego'] } });
  add('baston_bronce', { name: 'Bastón del faro', type: 'weapon', who: ['elara'], price: 600, stats: { atk: 3, mag: 13 }, desc: 'Remata en una lente diminuta que guarda luz de luna.', unleash: { name: 'Lente lunar', power: 2.5, types: ['Luna', 'Luz'] } });
  add('cota_bronce', { name: 'Cota de bronce', type: 'armor', who: ['flint', 'firion', 'kaelen'], price: 560, stats: { def: 13, res: 4, spd: -1 }, desc: 'Escamas de bronce de la antigua guardia.' });
  add('amuleto_bronce', { name: 'Amuleto de bronce', type: 'acc', price: 480, stats: { res: 6, mag: 3 }, desc: 'Un engranaje que late como un corazón.' });
  add('espada_vigia', { name: 'Espada del Capitán', type: 'weapon', who: ['firion'], price: 0, stats: { atk: 16, def: 3, spd: 2 }, desc: 'La espada de Varek. Firion la empuña sin mirarla.', unleash: { name: 'Juramento del Vigía', power: 2.7, types: ['Corte', 'Luz'] } });
  const add2 = (id, o) => { o.id = id; D.ecos[id] = o; };
  add2('eco_raiz', { name: 'Eco de Raíz', el: 'Agua', color: '#8ad87a', stats: { hp: 20, def: 2 }, desc: 'Dormía en el corazón del bosque. Sabe esperar.',
    release: { name: 'Savia que sana', kind: 'heal', power: 0.3, area: 'allies', desc: 'Cura un 30 % al grupo.' } });
  add2('eco_bronce', { name: 'Eco de Bronce', el: 'Luz', color: '#e8b860', stats: { atk: 3, def: 2 }, desc: 'Un latido de engranajes que recuerda a la reina de Thalyria.',
    release: { name: 'Martinete de bronce', kind: 'phys', power: 2.0, types: ['Impacto', 'Luz'], area: 'one', desc: 'Un golpe enorme sobre un enemigo.' } });
  D.shops.bosque = { name: 'Mercader del bosque', stock: ['tonico', 'tonico_plus', 'agua_luna', 'lanza_raiz', 'espada_raiz', 'capa_musgo', 'baston_nacar', 'martillo_ancla'] };
  D.shops.ruinas = { name: 'Campamento de los saqueadores', stock: ['tonico_plus', 'agua_luna', 'lanza_bronce', 'martillo_bronce', 'baston_bronce', 'cota_bronce', 'capa_musgo'] };
  D.shops.bruma.stock.push(['lanza_raiz', 'cap2.fin'], ['capa_musgo', 'cap2.fin']);

  // ---------- Varek: el capitán caído (mismo cuerpo que Firion, armadura del Fondo) ----------
  const C = TH.chars.defs, f = C.firion;
  C.varek = Object.assign({}, f, {
    id: 'varek', name: 'Varek', hair: 'spiky',
    pal: Object.assign({}, f.pal, { hair: ['#1a1418', '#2e2428', '#4a3c40'], top: ['#2a1a2a', '#4a2a3e', '#6a3a52'], trim: '#c8382c', belt: '#1a1018', legs: ['#1a1622', '#2a2436'], skin: ['#9a6a54', '#c08a70'], outline: '#0e0810', eye: '#c8382c' }),
    chains: (f.chains || []).map((ch) => Object.assign({}, ch, { c: ['#5a1a2a', '#8a2a3a'] })),
  });

  // ---------- selector de capítulos ----------
  const base = Object.assign({}, D.chapters.cap1.flags, { 'cap1.faro': true, 'cabo.firion': true, 'grupo.firion': true, 'jefe.karkinos': true, 'cap1.fin': true, 'cabo.llegada': true, 'cabo.reja': true, 'cabo.faro': true, 'arrecife.llegada': true, 'arrecife.jefe': true, 'cabo.batalla': true, 'tip.relevo': true });
  const c2 = Object.assign({}, base, { 'grupo.elara': false, objetivo: 'madre' });
  const c3 = Object.assign({}, c2, { 'grupo.elara': true, 'grupo.flint': true, 'jefe.madre': true, 'cap2.faro': true, 'cap2.fin': true, 'bosque.llegada': true, 'bosque.madre': true, objetivo: 'ruinas' });
  const ecos2 = ['eco_alba', 'eco_luna', 'eco_vendaval', 'eco_espuma', 'eco_brasa'];
  D.chapters.cap2 = { name: 'Capítulo 2', test: 'Kaelen y Firion Nv 8', map: 'bosque', at: [17.5, 21.2], dir: 'up', hour: 9, day: 4,
    roster: ['kaelen', 'firion'], levels: { kaelen: 8, firion: 8, elara: 8, flint: 8 },
    equip: { kaelen: { weapon: 'lanza_alba', armor: 'chaqueta_lona', acc: 'cinta_marinera' }, firion: { weapon: 'espada_marea', armor: 'cota_escamas', acc: 'anillo_ancla' }, flint: { weapon: 'martillo_ancla', armor: 'cota_escamas' }, elara: { weapon: 'baston_nacar', armor: 'tunica_bruma' } },
    ecos: ecos2, ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval', 'eco_espuma'] },
    inv: { tonico: 6, tonico_plus: 3, agua_luna: 3, pan_algas: 3 }, gold: 900, flags: c2, script: 'cap2.prueba' };
  D.chapters.cap3 = { name: 'Capítulo 3', test: 'Grupo completo Nv 11', map: 'ruinas', at: [18.5, 24.2], dir: 'up', hour: 15.5, day: 6,
    roster: ['kaelen', 'elara', 'flint', 'firion'], levels: { kaelen: 11, firion: 11, elara: 11, flint: 11 },
    equip: { kaelen: { weapon: 'lanza_raiz', armor: 'capa_musgo', acc: 'botas_raiz' }, firion: { weapon: 'espada_raiz', armor: 'cota_escamas', acc: 'anillo_ancla' }, flint: { weapon: 'martillo_ancla', armor: 'cota_escamas', acc: 'guantes_forja' }, elara: { weapon: 'baston_nacar', armor: 'tunica_bruma', acc: 'colgante_marea' } },
    ecos: ecos2.concat(['eco_raiz']), ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval'], elara: ['eco_luna', 'eco_raiz'], flint: ['eco_espuma'] },
    inv: { tonico: 6, tonico_plus: 5, agua_luna: 4, pan_algas: 3 }, gold: 1600, flags: c3, script: 'cap3.inicio' };

  // ======================================================================
  // CAPÍTULO 2 · La Madre del Bosque
  // ======================================================================
  S['cap2.inicio'] = [
    { bars: true },
    { fade: 1, time: 1.0 },
    { warp: 'brumaSalada', at: [18.5, 22], dir: 'up', hour: 7 },
    { roster: ['kaelen', 'flint', 'firion'] },
    { place: 'ilun', at: [16.5, 21.4], dir: 'right' },
    { place: 'halvard', at: [20.6, 21.4], dir: 'left' },
    { cam: [18.5, 21] },
    { chapter: 'Capítulo 2', title: 'La Madre del Bosque', sub: 'Thalyria · El Día Detenido' },
    { fade: 0, time: 1.2 },
    { say: 'ilun', e: 'sad', t: 'Las corrientes del Fondo no se llevan las cosas al azar, muchacho. {p:0.4}Tiran hacia el oeste. {p:0.3}Hacia la isla de las Raíces Hundidas.' },
    { say: 'halvard', e: 'neutral', t: 'Allí hay un faro que nadie ha visto en cien años. {p:0.4}El bosque se lo comió entero.' },
    { say: 'kaelen', e: 'neutral', t: 'Si el mar lleva a Elara hacia allí, allí voy.' },
    { if: 'dec.1=B', then: [
      { say: 'oslo', e: 'neutral', t: 'La marea del alba ya está aquí, chico. {p:0.4}Como os dije. {p:0.3}Os llevo hasta la corriente buena.' },
    ], else: [
      { say: 'none', t: 'Un barquero enorme, de barba blanca y con un ancla al hombro, empuja la barca de Halvard hasta el agua sin que nadie se lo pida.' },
      { say: 'oslo', e: 'neutral', t: '¿Al oeste, con esta cáscara? {p:0.4}Os empujo hasta la corriente buena. {p:0.3}Me llamo Oslo. {p:0.4}Ya me lo pagaréis. {p:0.3}Nunca dejo un encargo a medias… {p:0.3}ni siquiera los que nadie me encarga.' },
    ] },
    { say: 'firion', e: 'neutral', t: 'Vamos. {p:0.3}La barca de Halvard aguanta la travesía.' },
    { face: 'flint', dir: 'kaelen' },
    { say: 'flint', e: 'neutral', t: 'Chico. {p:0.4}Esta vez me quedo.' },
    { say: 'kaelen', e: 'sad', t: '¿Flint?' },
    { say: 'flint', e: 'neutral', t: 'Ese cangrejo me abolló el martillo y vuestras armas están para hacer sopa. {p:0.4}Si vamos a bajar al fondo del mar, que sea con acero decente.' },
    { say: 'flint', e: 'happy', t: 'Me encierro en la fragua, forjo como si no hubiera mañana… {p:0.4}que, técnicamente, es el problema. {p:0.3}Y os alcanzo.' },
    { say: 'flint', e: 'happy', t: 'Ah, y os mandaré la factura.' },
    { leave: 'flint' },
    { say: 'none', t: '{*Flint*} se queda en Bruma Salada.' },
    { fade: 1, time: 1.0 },
    { warp: 'bosque', at: [17.5, 21.2], dir: 'up', hour: 9 },
    { set: { objetivo: 'madre', 'cap2.empezado': true } },
    { fade: 0, time: 1.2 },
    { bars: false },
    { banner: ['Bosque de las Raíces Hundidas', 'Isla del Oeste'] },
    { save: true },
  ];
  S['cap2.prueba'] = [{ set: { 'cap2.empezado': true } }, { banner: ['Bosque de las Raíces Hundidas', 'Isla del Oeste'] }];
  S['cap2.llegada'] = [
    { say: 'firion', e: 'neutral', t: 'Raíces dentro del agua salada. {p:0.4}Ningún árbol de este mundo hace eso.' },
    { say: 'kaelen', e: 'neutral', t: 'Las siento, Firion. {p:0.3}Laten. {p:0.4}Como si tuvieran pulso.' },
    { say: 'firion', e: 'neutral', t: 'Entonces el corazón está arriba, en el claro. {p:0.4}Y donde hay un corazón que bebe luz…' },
    { say: 'kaelen', e: 'angry', t: '…está Elara.' },
    { toast: 'Objetivo: sube al claro del bosque (norte)' },
  ];
  S['cap2.madre'] = [
    { bars: true },
    { cam: [18.5, 4], time: 1.4 },
    { say: 'none', t: 'En el centro del claro, un nido de raíces negras abraza a una muchacha dormida. {p:0.4}Su pelo blanco brilla como una luna pequeña.' },
    { say: 'kaelen', e: 'sad', t: '{~¡Elara!~}' },
    { shake: 3, time: 1.2, wait: false },
    { say: 'none', name: 'Madre del Bosque', t: 'No grites, hijo del mar. {p:0.4}Duerme. {p:0.3}Y mientras duerme, su luz me alimenta.' },
    { say: 'firion', e: 'angry', t: 'Kaelen, la lanza. {p:0.3}¡Corta las raíces!' },
    { flash: 0.7, color: '#bfe0ff' },
    { say: 'none', t: 'La Lanza del Alba atraviesa el nido. {p:0.4}Las raíces chillan y se abren.' },
    { emote: 'elara', icon: '!', time: 0.8 },
    { say: 'elara', e: 'sad', t: '…¿Kaelen? {p:0.5}He soñado que bajaba y bajaba… {p:0.4}y que alguien me esperaba al fondo.' },
    { say: 'kaelen', e: 'happy', t: 'Ya has subido. {p:0.4}Estoy aquí.' },
    { say: 'elara', e: 'happy', t: 'Me cambiaste por la marea… {p:0.3}y luego viniste a cambiarme otra vez. {p:0.4}Eres un pésimo negociante.' },
    { set: 'grupo.elara' },
    { join: 'elara', quiet: true },
    { level: 'elara', lv: 9 },
    { refresh: true },
    { say: 'none', t: '{*Elara*} vuelve al grupo.' },
    { shake: 5, time: 1.4, wait: false },
    { say: 'none', name: 'Madre del Bosque', t: '{~¡Mi luz!~} {p:0.4}¡Devolvedme mi luna!' },
    { say: 'elara', e: 'angry', t: 'Tu luna no. {p:0.4}{*La mía*}.' },
    { battle: ['madre'], at: [18, 3.4], once: 'jefe.madre', after: 'cap2.fin' },
  ];
  S['cap2.fin'] = [
    { bars: true },
    { refresh: true },
    { say: 'none', name: 'Madre del Bosque', t: '{s:0.7}Mil años… {p:0.4}esperando el sol. {p:0.5}El Fondo dijo que el sol era mentira.' },
    { say: 'elara', e: 'sad', t: 'El sol no es mentira, Madre. {p:0.4}Solo llega tarde.' },
    { flash: 0.8, color: '#e8ffd0' },
    { say: 'none', t: 'Las raíces negras se vuelven verdes. {p:0.4}Bajo el claro, algo que llevaba un siglo enterrado empieza a brillar: {p:0.3}el {*faro de las Raíces*}.' },
    { set: 'cap2.faro' },
    { hour: 18.5, time: 3, wait: false },
    { say: 'firion', e: 'happy', t: 'Tres faros. {p:0.4}Tres de cuatro.' },
    { say: 'elara', e: 'sad', t: 'Kaelen, Firion… {p:0.4}en el Fondo vi a alguien. {p:0.3}Un hombre con armadura de guardia, de pie sobre el agua negra.' },
    { say: 'elara', e: 'sad', t: 'Las larvas se apartaban a su paso. {p:0.4}Y la marea le obedecía. {p:0.3}Le llamaban {*Varek*}.' },
    { emote: 'firion', icon: '!', time: 0.9 },
    { say: 'firion', e: 'sad', t: '…Varek. {p:0.5}El capitán Varek de la Guardia del Vigía. {p:0.4}Mi capitán. {p:0.3}Desapareció en el mar hace cinco años.' },
    { say: 'firion', e: 'angry', t: 'Lo velamos. {p:0.3}Lo lloramos. {p:0.4}Y está vivo… {p:0.3}sirviendo a lo que juró vigilar.' },
    { say: 'elara', e: 'neutral', t: 'Iba hacia el sur. {p:0.4}Hacia las ruinas.' },
    { say: 'kaelen', e: 'neutral', t: 'Donde está el último faro.' },
    { fade: 1, time: 1.2 },
    { warp: 'brumaSalada', at: [18.5, 22], dir: 'up', hour: 8 },
    { sleep: 8 },
    { cam: [19, 21] },
    { fade: 0, time: 1.0 },
    { say: 'none', name: 'Voz conocida', t: '{~¡Por fin!~} {p:0.3}Tres días esperando en este muelle. {p:0.4}Tengo las piernas de madera.' },
    { join: 'flint', quiet: true },
    { level: 'flint', lv: 10 },
    { equip: 'flint', slot: 'weapon', item: 'martillo_bronce' },
    { say: 'flint', e: 'happy', t: 'Martillo nuevo, chicos. {p:0.4}Bronce de Thalyria fundido con la quilla de una barca y mucho cariño.' },
    { say: 'flint', e: 'happy', t: '¡Elara! {p:0.3}Sabía que volverías. {p:0.4}Te debo un abrazo. {p:0.3}Y a ellos, esto.' },
    { say: 'none', t: 'Flint saca un pergamino larguísimo. {p:0.4}En lo alto pone: {*PRESUPUESTO*}.' },
    { say: 'flint', e: 'neutral', t: 'Carbón: trescientas monedas. {p:0.3}Mano de obra: cuatrocientas. {p:0.4}Sufrimiento emocional por quedarme en tierra: incalculable, pero os hago descuento.' },
    { say: 'kaelen', e: 'neutral', t: 'Flint…' },
    { say: 'flint', e: 'happy', t: 'Ciento cincuenta y quedamos en paz. {p:0.4}Y si salvamos el mundo, os perdono hasta eso. {p:0.3}Soy un sentimental.' },
    { give: 'gold', n: -150, quiet: true },
    { say: 'none', t: '{*Flint*} vuelve al grupo… con presupuesto. {p:0.3}(−150 de oro)' },
    { set: 'grupo.flint' },
    { set: { 'cap2.fin': true, objetivo: 'ruinas' } },
    { chapter: 'Fin del Capítulo 2', title: 'La Madre del Bosque', sub: 'Thalyria · El Día Detenido' },
    { save: true },
    { call: 'cap3.inicio' },
  ];

  // ======================================================================
  // CAPÍTULO 3 · El Vigía de Bronce
  // ======================================================================
  S['cap3.inicio'] = [
    { bars: true },
    { fade: 1, time: 0.8 },
    { chapter: 'Capítulo 3', title: 'El Vigía de Bronce', sub: 'Thalyria · El Día Detenido' },
    { warp: 'ruinas', at: [18.5, 24.2], dir: 'up', hour: 15.5 },
    { roster: ['kaelen', 'elara', 'flint', 'firion'] },
    { set: { objetivo: 'ruinas', 'cap3.empezado': true } },
    { fade: 0, time: 1.4 },
    { bars: false },
    { banner: ['Ruinas de Thalyria', 'Isla del Sur'] },
    { save: true },
  ];
  S['cap3.llegada'] = [
    { say: 'elara', e: 'sad', t: 'Thalyria. {p:0.4}O lo que el mar no quiso. {p:0.3}Columnas, escaleras que suben a ninguna parte…' },
    { say: 'flint', e: 'neutral', t: 'Y todo de bronce. {p:0.4}Si no estuviéramos salvando el mundo, me llevaría la mitad en la barca.' },
    { say: 'firion', e: 'neutral', t: 'El faro está en la explanada de arriba. {p:0.3}Si Varek ha llegado antes… {p:0.4}lo encontraremos allí.' },
    { toast: 'Objetivo: sube a la explanada del faro de Thalyria' },
  ];
  S['cap3.varek'] = [
    { bars: true },
    { cam: [19, 11], time: 1.2 },
    { say: 'none', name: '???', t: 'Has tardado, Firion. {p:0.4}Antes eras el primero en subir la escalera.' },
    { emote: 'firion', icon: '!', time: 0.9 },
    { place: 'varek', at: [19.5, 10.6], dir: 'down' },
    { say: 'firion', e: 'angry', t: '{~Varek.~} {p:0.4}Capitán.' },
    { say: 'varek', e: 'neutral', t: 'Ya no. {p:0.4}La guardia vigilaba el mar porque le tenía miedo. {p:0.3}Yo bajé a mirarlo a los ojos.' },
    { say: 'varek', e: 'neutral', t: '¿Sabes lo que hay ahí abajo? {p:0.4}Un día que nunca terminó. {p:0.3}Una reina que sigue esperando. {p:0.4}Y un reino entero que quiere {*volver*}.' },
    { say: 'kaelen', e: 'angry', t: 'Volver ahogando todo lo que hay arriba.' },
    { face: 'varek', dir: 'kaelen' },
    { say: 'varek', e: 'neutral', t: 'El que trae la luz. {p:0.4}Así que eres tú. {p:0.3}No pareces gran cosa, muchacho de la playa.' },
    { say: 'varek', e: 'happy', t: 'El Fondo no te quiere muerto. {p:0.4}Te quiere {*en casa*}.' },
    { face: 'varek', dir: 'firion' },
    { say: 'varek', e: 'neutral', t: 'Pero antes, una deuda vieja. {p:0.4}Firion. {p:0.3}Tú y yo, como en el patio de armas. {p:0.4}Sin ayuda.' },
    { say: 'firion', e: 'angry', t: 'La única deuda que tienes es con mi padre. {p:0.4}Tú bajaste a buscarlo aquella noche.' },
    { say: 'varek', e: 'sad', t: 'Y volví solo. {p:0.5}El mar me enseñó que nunca se llega a tiempo. {p:0.4}Salvo si el tiempo se para.' },
    {
      who: 'firion', e: 'angry', t: '(Firion aprieta la empuñadura.)',
      choice: [
        { t: 'Aceptar el duelo (Firion lucha solo)', then: [
          { say: 'firion', e: 'angry', t: 'Como en el patio de armas. {p:0.4}Apartaos. {p:0.3}Esto es mío.' },
          { say: 'elara', e: 'sad', t: 'Firion…' },
          { say: 'flint', e: 'neutral', t: 'Si se pone feo, me meto. {p:0.4}Yo no juré nada en ningún patio.' },
          { set: 'duelo.aceptado' },
          { roster: ['firion'] },
          { battle: ['varek'], at: [19.5, 10.6], once: 'duelo.varek', after: 'cap3.duelo.fin' },
        ] },
        { t: 'Rechazar: no es momento', then: [
          { say: 'firion', e: 'neutral', t: 'No voy a bailar a tu música, Varek. {p:0.4}Ya no.' },
          { say: 'varek', e: 'neutral', t: 'Prudente. {p:0.4}Eso también te lo enseñé yo. {p:0.3}Arriba os espera algo que no sabe de prudencia.' },
          { call: 'cap3.varek.sale' },
        ] },
      ],
    },
  ];
  S['cap3.duelo.fin'] = [
    { bars: true },
    { roster: ['kaelen', 'elara', 'flint', 'firion'], lead: 'firion' },
    { say: 'varek', e: 'sad', t: '…Bien. {p:0.5}Muy bien, Firion. {p:0.4}Has aprendido a soltar.' },
    { say: 'firion', e: 'sad', t: 'Vuelve, capitán. {p:0.4}Todavía estás a tiempo.' },
    { say: 'varek', e: 'neutral', t: 'El tiempo es justo lo que el Fondo nos quitó. {p:0.4}Quédate la espada. {p:0.3}A mí ya no me sirve.' },
    { give: 'espada_vigia' },
    { call: 'cap3.varek.sale' },
  ];
  S['cap3.varek.sale'] = [
    { shake: 3, time: 1.0, wait: false },
    { flash: 0.5, color: '#1a0a20' },
    { say: 'none', t: 'Una ola negra sube por la escalera, envuelve a Varek y lo arrastra hacia la explanada del faro.' },
    { set: 'cap3.varek.ido' },
    { refresh: true },
    { say: 'kaelen', e: 'angry', t: '¡Va hacia el faro!' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: abre la explanada del faro (el molino de la terraza)' },
    { save: true },
  ];
  S['cap3.vigia'] = [
    { bars: true },
    { cam: [19, 3], time: 1.4 },
    { say: 'none', t: 'Sobre la explanada se alza un coloso de bronce, quieto como una estatua. {p:0.4}A sus pies, Varek derrama agua negra de un cuenco.' },
    { say: 'varek', e: 'neutral', t: 'Despierta, viejo guardián. {p:0.4}Tu reina te llama desde abajo.' },
    { shake: 4, time: 1.6, wait: false },
    { say: 'none', t: 'Los ojos del coloso se encienden. {p:0.3}Rojos.' },
    { say: 'varek', e: 'happy', t: 'Que os vaya bien, muchacho de la playa. {p:0.4}Nos veremos abajo.' },
    { flash: 0.5, color: '#1a0a20' },
    { set: 'cap3.varek.huye' },
    { refresh: true },
    { say: 'flint', e: 'neutral', t: 'Un gigante de bronce. {p:0.4}Con brazos. {p:0.3}Por fin un enemigo de mi especialidad.' },
    { say: 'elara', e: 'neutral', t: 'El agua negra le ha entrado en los engranajes. {p:0.3}¡Agua e impacto, como con una herrumbre!' },
    { heal: true },
    { battle: ['vigia_bronce', 'brazo_izq', 'brazo_der'], at: [19, 3.6], once: 'jefe.vigia', after: 'cap3.fin' },
  ];
  S['cap3.fin'] = [
    { bars: true },
    { refresh: true },
    { say: 'none', name: 'Vigía de Bronce', t: 'LA ORDEN… {p:0.5}LA REINA DIJO… {p:0.4}«GUARDA LA LUZ HASTA QUE VUELVA LA LANZA».' },
    { say: 'none', name: 'Vigía de Bronce', t: '{s:0.7}PORTADOR… {p:0.5}TU LANZA… {p:0.4}ES LA LANZA DE LA REINA. {p:0.5}¿QUIÉN… TE LA DIO?' },
    { say: 'kaelen', e: 'sad', t: '¿La reina…?' },
    { say: 'none', t: 'El coloso se arrodilla, despacio, como quien termina un turno de guardia de mil años. {p:0.4}Y se apaga.' },
    { flash: 0.9, color: '#fff0c0' },
    { set: 'cap3.faro' },
    { say: 'none', t: 'Kaelen alza la lanza hacia la lente. {p:0.4}El último faro de Vael se enciende sobre las ruinas de Thalyria.' },
    { hour: 19.5, time: 3, wait: false },
    { say: 'elara', e: 'sad', t: 'Kaelen… {p:0.4}el mar te trajo de Thalyria. {p:0.3}Por eso la lanza. {p:0.3}Por eso el Fondo te busca.' },
    { say: 'firion', e: 'neutral', t: 'Varek dijo que te quieren «en casa». {p:0.4}Ahora sé lo que quería decir.' },
    { say: 'flint', e: 'sad', t: 'Pues tu casa es Bruma Salada, chico. {p:0.4}La de arriba. {p:0.3}La que tiene pan quemado.' },
    { say: 'kaelen', e: 'neutral', t: 'Los cuatro faros arden. {p:0.4}Pero mientras el Fondo siga despierto, la marea volverá.' },
    { say: 'kaelen', e: 'angry', t: 'Así que bajaremos nosotros. {p:0.4}A ese día que nunca terminó. {p:0.3}Y lo terminaremos.' },
    { set: { 'cap3.fin': true, objetivo: 'cap4' } },
    { fade: 1, time: 1.4 },
    { chapter: 'Fin del Capítulo 3', title: 'El Vigía de Bronce', sub: 'Continuará' },
    { fade: 0, time: 1.2 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Fin del capítulo 3 · Partida guardada' },
    { save: true },
  ];

  // ---------- charlas ----------
  T.mercader_bosque = [
    { say: '@npc', e: 'happy', name: 'Mercader', t: 'Clientes en el bosque. {p:0.3}Esto no pasaba desde que los árboles empezaron a beber mar.' },
    { shop: 'bosque' },
  ];
  T.guardabosques = [
    { if: 'jefe.madre', then: [{ say: '@npc', e: 'happy', t: 'La Madre vuelve a dormir tranquila. {p:0.3}Y el faro brilla bajo el musgo. {p:0.4}Gracias.' }], else: [
      { say: '@npc', e: 'sad', t: 'La Madre del Bosque nos dio sombra durante mil años. {p:0.4}Desde que el agua negra le tocó las raíces, ya no reconoce a nadie.' },
    ] },
  ];
  T.elara_raices = [{ say: 'none', t: 'Elara duerme, atrapada en un nido de raíces negras.' }];
  T.campamento = [
    { say: '@npc', e: 'happy', name: 'Saqueadora', t: 'Nosotros solo cogemos lo que el mar deja. {p:0.3}Y el mar deja mucho bronce. {p:0.4}¿Compráis?' },
    { shop: 'ruinas' },
  ];

  // Varek aparece en las ruinas según la historia
  const R = D.maps.ruinas;
  R.npcs.push({ id: 'varek', talk: 'varek', c: 19.5, r: 10.6, ai: 'idle', dir: 'down', if: '!cap3.varek.ido' });
  R.npcs.push({ id: 'varek', talk: 'varek', c: 23, r: 4, ai: 'idle', dir: 'left', if: ['cap3.varek.ido', '!cap3.varek.huye'] });
  T.varek = [{ say: '@npc', e: 'neutral', t: '…' }];
})();
