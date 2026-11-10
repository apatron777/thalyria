// Bestiario: stats, debilidades, patrón de acciones, experiencia y botín. Cada enemigo actúa una vez por ronda.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.enemies = {
    larva: {
      name: 'Larva abisal', sprite: 'larva', hp: 44, atk: 10, def: 3, mag: 9, res: 4, spd: 5, exp: 9, gold: 7,
      weak: { Luz: 1.5, Fuego: 1.25 }, resist: { Impacto: 0.8 },
      drops: [{ item: 'tonico', chance: 0.35 }],
      pattern: ['mordisco', 'esporas'],
      actions: {
        mordisco: { name: 'Mordisco', kind: 'phys', power: 1.0, target: 'one', cd: 2 },
        esporas: { name: 'Esporas abisales', kind: 'mag', power: 0.85, target: 'all', cd: 3, fx: 'spores' },
      },
    },
    cangrejo: {
      name: 'Cangrejo de coral', sprite: 'cangrejo', hp: 62, atk: 12, def: 6, mag: 4, res: 6, spd: 3, exp: 14, gold: 12,
      weak: { Impacto: 1.4, Agua: 1.2 }, resist: { Corte: 0.7 },
      drops: [{ item: 'concha', chance: 0.6 }, { item: 'agua_luna', chance: 0.2 }],
      pattern: ['pinza', 'caparazon', 'tenaza'],
      actions: {
        pinza: { name: 'Pinzazo', kind: 'phys', power: 1.0, target: 'one', cd: 2 },
        caparazon: { name: 'Caparazón de coral', kind: 'buff', target: 'self', cd: 2, buff: { def: 1.4, turns: 2 } },
        tenaza: { name: 'Tenaza aplastante', kind: 'phys', power: 1.9, target: 'one', cd: 3 },
      },
    },
    gaviota: {
      name: 'Gaviotón tormenta', sprite: 'gaviota', hp: 54, atk: 11, def: 5, mag: 11, res: 6, spd: 9, exp: 12, gold: 10, flying: true,
      weak: { Corte: 1.3, Luna: 1.2 }, resist: { Agua: 0.6 },
      drops: [{ item: 'pluma_gaviota', chance: 0.08 }, { item: 'pan_algas', chance: 0.3 }],
      pattern: ['picotazo', 'tormenta', 'picotazo'],
      actions: {
        picotazo: { name: 'Picado', kind: 'phys', power: 1.05, target: 'one', cd: 2 },
        tormenta: { name: 'Llamada de tormenta', kind: 'mag', power: 1.0, target: 'all', cd: 3, fx: 'storm' },
      },
    },
    // ---------- Karkinos, Guardián del Arrecife (jefe del capítulo 1: tres fases y sellos) ----------
    // ai: lista por prioridad. if: self<0.3 (vida propia) · boss<0.75 (vida del jefe) · adds<1 (esbirros vivos)
    //     every:N (una de cada N decisiones) · cooldown:N (decisiones de espera) · pick: weakest | random
    // seals: ataque cargado. Se anuncia una ronda antes; si se rompen todos sus sellos con esos tipos, se anula y aturde.
    karkinos: {
      name: 'Karkinos', title: 'Guardián del Arrecife', sprite: 'karkinos', boss: true, big: true,
      hp: 1400, atk: 30, def: 12, mag: 28, res: 10, spd: 4, exp: 420, gold: 400,
      weak: { Impacto: 1.25, Luz: 1.2 }, resist: { Agua: 0.5 },
      drops: [{ item: 'anillo_ancla', chance: 1 }, { item: 'tonico_plus', chance: 1 }],
      actions: {
        aplastar: { name: 'Aplastar', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        marea: { name: 'Marea de pinzas', kind: 'mag', power: 0.8, target: 'all', fx: 'storm' },
        tsunami: { name: 'Tsunami abisal', kind: 'mag', power: 1.7, target: 'all', fx: 'wave' },
        concha: { name: 'Concha abisal', kind: 'heal', heal: 0.22, target: 'self' },
        furia: { name: 'Furia del arrecife', kind: 'phys', power: 0.95, target: 'all' },
        llamar: { name: 'Llamada a la marea', kind: 'summon', summon: 'larva_voraz', target: 'self' },
        diluvio: { name: 'Diluvio del fondo', kind: 'mag', power: 2.0, target: 'all', fx: 'wave' },
      },
      ai: [
        { act: 'tsunami', every: 2 },
        { act: 'marea', every: 3 },
        { act: 'aplastar' },
      ],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Karkinos', t: '{~¿Quién~} pisa mi arrecife… {p:0.4}y trae la luz de los faros pegada a la piel?' },
          { name: 'Karkinos', t: 'Mil mareas guardé este paso para los de arriba. {p:0.4}Ahora el Fondo me llama… {p:0.3}{*y yo respondo.*}' },
        ] },
        { at: 0.6, music: 'jefe2', sprite: 'karkinos2', revive: 0.6, dialog: [
          { name: 'Karkinos', t: '{~¡Mi caparazón!~} {p:0.5}Mil mareas sin una grieta…' },
          { name: 'Karkinos', t: 'Mis pinzas vuelven a crecer. {p:0.3}La marea siempre vuelve. {p:0.4}{*Siempre.*}' },
        ], ai: [
          { act: 'concha', if: 'self<0.5', cooldown: 6 },
          { act: 'llamar', if: 'adds<1', cooldown: 4 },
          { act: 'tsunami', every: 2 },
          { act: 'furia', every: 3 },
          { act: 'aplastar' },
        ] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Karkinos', t: '{s:0.7}Basta. {p:0.5}Si no puedo deteneros… {p:0.4}que suba el mar {*entero*}.' },
          { name: 'Elara', t: '¡Está llamando al fondo del océano! {p:0.3}¡Romped sus sellos antes de que lo suelte!' },
        ], ai: [
          { act: 'diluvio', every: 2 },
          { act: 'furia', every: 2 },
          { act: 'aplastar' },
        ] },
      ],
    },
    pinza_izq: {
      name: 'Pinza izquierda', sprite: 'pinza', part: true, hp: 220, atk: 22, def: 14, mag: 4, res: 6, spd: 6, exp: 15, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: {
        pinza: { name: 'Pinzazo', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest', cd: 2 },
        proteger: { name: 'Escudo de pinza', kind: 'protect', target: 'boss', cd: 2 },
      },
      ai: [{ act: 'proteger', every: 3 }, { act: 'pinza' }],
    },
    pinza_der: {
      name: 'Pinza derecha', sprite: 'pinza', part: true, hp: 220, atk: 22, def: 14, mag: 4, res: 6, spd: 6, exp: 15, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: {
        pinza: { name: 'Pinzazo', kind: 'phys', power: 1.0, target: 'one', pick: 'random', cd: 3 },
        proteger: { name: 'Escudo de pinza', kind: 'protect', target: 'boss', cd: 2 },
      },
      ai: [{ act: 'pinza' }],
    },
    // ---------- variantes fuertes ----------
    larva_voraz: {
      name: 'Larva voraz', sprite: 'larva_voraz', hp: 92, atk: 16, def: 6, mag: 14, res: 6, spd: 7, exp: 24, gold: 15, markH: 24,
      weak: { Luz: 1.5, Fuego: 1.25 }, resist: { Impacto: 0.8 },
      drops: [{ item: 'tonico', chance: 0.4 }, { item: 'agua_luna', chance: 0.12 }],
      actions: {
        mordisco: { name: 'Mordisco', kind: 'phys', power: 1.05, target: 'one' },
        esporas: { name: 'Esporas abisales', kind: 'mag', power: 0.85, target: 'all', fx: 'spores' },
        fauces: { name: 'Fauces voraces', kind: 'phys', power: 1.6, target: 'one', pick: 'weakest' },
      },
      ai: [{ act: 'fauces', every: 3 }, { act: 'esporas', every: 2 }, { act: 'mordisco' }],
    },
    cangrejo_roca: {
      name: 'Cangrejo de roca', sprite: 'cangrejo_roca', hp: 135, atk: 19, def: 12, mag: 6, res: 8, spd: 3, exp: 32, gold: 20, markH: 32,
      weak: { Impacto: 1.4, Fuego: 1.2 }, resist: { Corte: 0.6, Agua: 0.8 },
      drops: [{ item: 'concha', chance: 0.7 }, { item: 'tonico_plus', chance: 0.1 }],
      actions: {
        pinza: { name: 'Pinzazo', kind: 'phys', power: 1.0, target: 'one' },
        caparazon: { name: 'Caparazón de roca', kind: 'buff', target: 'self', buff: { def: 1.6, turns: 2 } },
        martillo: { name: 'Martillo de roca', kind: 'phys', power: 1.7, target: 'one' },
      },
      ai: [{ act: 'martillo', every: 3 }, { act: 'caparazon', if: 'self<0.6', cooldown: 4 }, { act: 'pinza' }],
    },
    gaviota_abisal: {
      name: 'Gaviota abisal', sprite: 'gaviota_abisal', hp: 96, atk: 18, def: 7, mag: 17, res: 8, spd: 12, exp: 28, gold: 17, flying: true, markH: 30,
      weak: { Corte: 1.3, Luz: 1.3 }, resist: { Agua: 0.5 },
      drops: [{ item: 'pluma_gaviota', chance: 0.12 }, { item: 'pan_algas', chance: 0.3 }],
      actions: {
        picotazo: { name: 'Picado', kind: 'phys', power: 1.1, target: 'one' },
        tormenta: { name: 'Llamada de tormenta', kind: 'mag', power: 0.9, target: 'all', fx: 'storm' },
        ciclon: { name: 'Ciclón negro', kind: 'mag', power: 1.1, target: 'all', fx: 'storm' },
      },
      ai: [{ act: 'ciclon', every: 4 }, { act: 'tormenta', every: 2 }, { act: 'picotazo' }],
    },
    // ---------- La Matriarca abisal (jefe del prólogo: enseña los sellos) ----------
    matriarca: {
      name: 'Matriarca abisal', title: 'La que bebió la luz del faro', sprite: 'larva_madre', scale: 2, boss: true, big: true, markH: 50,
      hp: 520, atk: 16, def: 6, mag: 15, res: 6, spd: 5, exp: 170, gold: 140,
      weak: { Luz: 1.5, Fuego: 1.25 }, resist: { Impacto: 0.8, Agua: 0.6 },
      drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        mordisco: { name: 'Mordisco abisal', kind: 'phys', power: 1.2, target: 'one', pick: 'weakest' },
        esporas: { name: 'Lluvia de esporas', kind: 'mag', power: 0.8, target: 'all', fx: 'spores' },
        marea: { name: 'Marea de esporas', kind: 'mag', power: 1.3, target: 'all', fx: 'spores' },
        llamar: { name: 'Llamada a la cría', kind: 'summon', summon: 'larva', target: 'self' },
        marea2: { name: 'Gran marea de esporas', kind: 'mag', power: 1.5, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'marea', every: 3 }, { act: 'esporas', every: 2 }, { act: 'mordisco' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Matriarca abisal', t: '{~Luzzz…~} {p:0.4}La luz del faro sabe a sol viejo. {p:0.3}Quiero más.' },
          { name: 'Matriarca abisal', t: 'Mis crías tienen hambre, pequeño pescador. {p:0.4}{*Y tú brillas.*}' },
        ] },
        { at: 0.5, music: 'jefe2', dialog: [
          { name: 'Matriarca abisal', t: '{~¡Esa lanza!~} {p:0.4}Esa lanza viene del {*otro lado*} de la marea…' },
          { name: 'Matriarca abisal', t: 'El Fondo te recuerda, niño. {p:0.4}{*Y te reclama.*}' },
        ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 3 }, { act: 'marea2', every: 3 }, { act: 'esporas', every: 2 }, { act: 'mordisco' }] },
      ],
    },
  };
  // dibujos de las variantes: el mismo sprite con otra paleta
  TH.foeVariant('larva_voraz', 'larva', 145, 1.25, 1.02, '#2a0c08');
  TH.foeVariant('larva_madre', 'larva', 95, 1.35, 0.95, '#22061a');
  TH.foeVariant('cangrejo_roca', 'cangrejo', 200, 0.45, 0.82, '#10141c');
  TH.foeVariant('gaviota_abisal', 'gaviota', 250, 1.8, 0.58, '#0a0818');
})();