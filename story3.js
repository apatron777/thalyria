// GUION · Capítulo 4 «La Ciudad Dorada» y Capítulo 5 «La Biblioteca de las Dos Épocas».
// C4: el altar del faro de Thalyria lleva al grupo al pasado · la Ciudad Dorada, viva · el Cronista y la regla del Motor
//     («lo que se siembra ayer florece mañana») · la semilla · la Cronoguardia · «Alteza».
// C5: la Biblioteca en dos épocas · Varek y el libro del Día Detenido · Elara aprende a detener el tiempo
//     · el Primer Abisal · la revelación: Kaelen es el hijo de la reina Aurelia.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, T = D.talk;

  // ---------- bestiario ----------
  Object.assign(D.enemies, {
    engranaje: { name: 'Engranaje vigía', sprite: 'engranaje', hp: 420, atk: 46, def: 26, mag: 14, res: 16, spd: 6, exp: 160, gold: 70, markH: 32,
      weak: { Agua: 1.3, Impacto: 1.2 }, resist: { Corte: 0.7, Fuego: 0.7 }, drops: [{ item: 'tonico_plus', chance: 0.25 }],
      actions: { tenaza: { name: 'Tenaza de reloj', kind: 'phys', power: 1.0, target: 'one' }, cuerda: { name: 'Dar cuerda', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 2 } } },
      ai: [{ act: 'cuerda', if: 'self<0.5', cooldown: 4 }, { act: 'tenaza' }] },
    engranaje_mayor: { name: 'Engranaje mayor', sprite: 'engranaje_mayor', hp: 620, atk: 52, def: 30, mag: 16, res: 18, spd: 5, exp: 240, gold: 100, markH: 32,
      weak: { Agua: 1.3, Impacto: 1.2 }, resist: { Corte: 0.7, Fuego: 0.7 }, drops: [{ item: 'tonico_plus', chance: 0.35 }],
      actions: { tenaza: { name: 'Tenaza de reloj', kind: 'phys', power: 1.1, target: 'one' }, martillo: { name: 'Campanada', kind: 'phys', power: 0.8, target: 'all' } },
      ai: [{ act: 'martillo', every: 3 }, { act: 'tenaza' }] },
    polilla: { name: 'Polilla del tiempo', sprite: 'polilla', hp: 360, atk: 42, def: 16, mag: 44, res: 22, spd: 16, exp: 150, gold: 60, flying: true, markH: 30,
      weak: { Fuego: 1.3, Corte: 1.2 }, resist: { Luna: 0.6 }, drops: [{ item: 'agua_luna', chance: 0.3 }],
      actions: { ala: { name: 'Aleteo', kind: 'phys', power: 1.0, target: 'one' }, polvo: { name: 'Polvo de horas', kind: 'mag', power: 0.85, target: 'all', fx: 'spores' } },
      ai: [{ act: 'polvo', every: 2 }, { act: 'ala' }] },
    polilla_eterna: { name: 'Polilla eterna', sprite: 'polilla_eterna', hp: 520, atk: 48, def: 18, mag: 50, res: 24, spd: 17, exp: 230, gold: 90, flying: true, markH: 30,
      weak: { Fuego: 1.3, Corte: 1.2 }, resist: { Luna: 0.6 }, drops: [{ item: 'agua_luna', chance: 0.4 }],
      actions: { ala: { name: 'Aleteo', kind: 'phys', power: 1.1, target: 'one', pick: 'weakest' }, polvo: { name: 'Polvo de siglos', kind: 'mag', power: 1.0, target: 'all', fx: 'spores' } },
      ai: [{ act: 'polvo', every: 2 }, { act: 'ala' }] },
    sombra: { name: 'Sombra del Fondo', sprite: 'sombra', hp: 560, atk: 56, def: 22, mag: 54, res: 22, spd: 10, exp: 260, gold: 110, markH: 24,
      weak: { Luz: 1.5, Fuego: 1.2 }, resist: { Agua: 0.5, Luna: 0.8 }, drops: [{ item: 'tonico_plus', chance: 0.35 }],
      actions: { mordisco: { name: 'Mordisco abisal', kind: 'phys', power: 1.0, target: 'one' }, bruma: { name: 'Bruma negra', kind: 'mag', power: 0.85, target: 'all', fx: 'spores' } },
      ai: [{ act: 'bruma', every: 3 }, { act: 'mordisco' }] },
    sombra_abisal: { name: 'Sombra abisal', sprite: 'sombra_abisal', hp: 800, atk: 62, def: 26, mag: 60, res: 26, spd: 11, exp: 380, gold: 160, markH: 24,
      weak: { Luz: 1.5, Fuego: 1.2 }, resist: { Agua: 0.5, Luna: 0.8 }, drops: [{ item: 'tonico_plus', chance: 0.45 }],
      actions: { mordisco: { name: 'Fauces del Fondo', kind: 'phys', power: 1.2, target: 'one', pick: 'weakest' }, bruma: { name: 'Bruma negra', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' } },
      ai: [{ act: 'bruma', every: 2 }, { act: 'mordisco' }] },
    cronoguardia: { name: 'Cronoguardia', title: 'Guardián del Motor del Tiempo', sprite: 'crono', boss: true, big: true, markH: 56,
      hp: 2500, atk: 42, def: 20, mag: 38, res: 18, spd: 8, exp: 2600, gold: 1500,
      weak: { Agua: 1.25, Luna: 1.2 }, resist: { Fuego: 0.6, Corte: 0.8 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        tic: { name: 'Tic', kind: 'phys', power: 1.25, target: 'one', pick: 'weakest' },
        tac: { name: 'Tac', kind: 'phys', power: 0.85, target: 'all' },
        campanada: { name: 'Campanada del mediodía', kind: 'mag', power: 1.2, target: 'all', fx: 'wave' },
        rebobinar: { name: 'Rebobinar', kind: 'heal', heal: 0.07, target: 'self' },
        llamar: { name: 'Llamar engranajes', kind: 'summon', summon: 'engranaje', target: 'self' },
        instante: { name: 'Fin del instante', kind: 'mag', power: 1.5, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'campanada', every: 4 }, { act: 'tac', every: 3 }, { act: 'tic' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Cronoguardia', t: 'Viajeros de un mañana que no existe todavía. {p:0.4}Vuestros pasos tuercen las horas.' },
          { name: 'Cronoguardia', t: 'La regla del Motor es una sola: {p:0.3}{*nada vuelve atrás*}. {p:0.4}Os devolveré al instante del que nunca debisteis salir.' },
        ] },
        { at: 0.6, music: 'jefe2', revive: 0.7, dialog: [
          { name: 'Cronoguardia', t: 'Rebobino mis agujas. {p:0.4}Para mí, esta herida aún no ha ocurrido.' },
        ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 5 }, { act: 'rebobinar', if: 'self<0.5', cooldown: 6 }, { act: 'campanada', every: 3 }, { act: 'tic' }] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Cronoguardia', t: 'Basta de segundos. {p:0.4}{*Fin del instante*}.' },
          { name: 'Flint', t: '¡Que alguien le pare el reloj! {p:0.3}…Literalmente, digo.' },
        ], ai: [{ act: 'instante', every: 2 }, { act: 'tac', every: 2 }, { act: 'tic' }] },
      ] },
    aguja_izq: { name: 'Aguja de las horas', sprite: 'aguja', part: true, markH: 34, hp: 380, atk: 36, def: 24, mag: 10, res: 16, spd: 7, exp: 90, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: { golpe: { name: 'Estocada horaria', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Guardia del reloj', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    aguja_der: { name: 'Aguja de los minutos', sprite: 'aguja', part: true, markH: 34, hp: 380, atk: 36, def: 24, mag: 10, res: 16, spd: 9, exp: 90, gold: 0,
      weak: { Impacto: 1.3 }, resist: { Corte: 0.7 },
      actions: { golpe: { name: 'Estocada minutera', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Guardia del reloj', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    abisal: { name: 'Primer Abisal', title: 'Lo que despertó bajo Thalyria', sprite: 'abisal', scale: 2.6, boss: true, big: true, markH: 62,
      hp: 4600, atk: 60, def: 26, mag: 58, res: 24, spd: 7, exp: 4000, gold: 2200,
      weak: { Luz: 1.4, Fuego: 1.2 }, resist: { Agua: 0.4, Luna: 0.8 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        fauces: { name: 'Fauces del origen', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        marea: { name: 'Marea primera', kind: 'mag', power: 1.1, target: 'all', fx: 'wave' },
        bruma: { name: 'Bruma de olvido', kind: 'mag', power: 0.9, target: 'all', fx: 'spores' },
        llamar: { name: 'Hijos del Fondo', kind: 'summon', summon: 'sombra', target: 'self' },
        beber: { name: 'Beber la luz', kind: 'heal', heal: 0.08, target: 'self' },
        abismo: { name: 'Abismo', kind: 'mag', power: 2.0, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'marea', every: 3 }, { act: 'bruma', every: 2 }, { act: 'fauces' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Primer Abisal', t: '{s:0.6}Mil años… {p:0.5}en un solo segundo. {p:0.4}¿Sabéis lo que es tener hambre durante un segundo eterno?' },
          { name: 'Primer Abisal', t: 'Huelo su sangre en ti, niño de la lanza. {p:0.5}{*La sangre de la que me encerró.*}' },
        ] },
        { at: 0.6, music: 'jefe2', dialog: [
          { name: 'Primer Abisal', t: 'Venid, hijos. {p:0.4}La luz está aquí. {p:0.3}Bebed.' },
        ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 4 }, { act: 'marea', every: 3 }, { act: 'bruma', every: 2 }, { act: 'fauces' }] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Primer Abisal', t: '{~Si no puedo salir… {p:0.4}os arrastraré dentro.~}' },
          { name: 'Elara', t: '¡Está abriendo el Fondo bajo nuestros pies! {p:0.3}¡Ahora o nunca!' },
        ], ai: [{ act: 'abismo', every: 2 }, { act: 'beber', if: 'self<0.15', cooldown: 8 }, { act: 'fauces' }] },
      ] },
  });
  TH.foeVariant('engranaje', 'cangrejo', 45, 0.45, 1.15, '#2a1e08');
  TH.foeVariant('engranaje_mayor', 'cangrejo', 35, 0.65, 0.92, '#1e1406');
  TH.foeVariant('polilla', 'gaviota', 270, 1.4, 1.02, '#1a1030');
  TH.foeVariant('polilla_eterna', 'gaviota', 300, 2.0, 0.8, '#120a26');
  TH.foeVariant('sombra', 'larva', 250, 0.9, 0.55, '#05030c');
  TH.foeVariant('sombra_abisal', 'larva', 300, 1.3, 0.42, '#030208');
  TH.foeVariant('crono', 'karkinos', 48, 0.3, 1.22, '#2a2010');
  TH.foeVariant('aguja', 'pinza', 48, 0.3, 1.22, '#2a2010');
  TH.foeVariant('abisal', 'larva', 260, 1.5, 0.45, '#020108');

  // ---------- equipo, Ecos y tiendas ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('lanza_dorada', { name: 'Lanza de la guardia dorada', type: 'weapon', who: ['kaelen'], price: 980, stats: { atk: 20, mag: 2, spd: 2 }, desc: 'El oro de Thalyria no se dobla. Ni se oxida.', unleash: { name: 'Lanzada dorada', power: 2.6, types: ['Corte', 'Luz'] } });
  add('espada_dorada', { name: 'Espada de la guardia dorada', type: 'weapon', who: ['firion'], price: 960, stats: { atk: 20, def: 3 }, desc: 'Igual que la suya, pero mil años más nueva.', unleash: { name: 'Juicio dorado', power: 2.6, types: ['Corte', 'Luz'] } });
  add('martillo_dorado', { name: 'Martillo del orfebre', type: 'weapon', who: ['flint'], price: 1000, stats: { atk: 22 }, desc: 'Flint lloró un poco al cogerlo. Dice que fue el polvo.', unleash: { name: 'Martinete real', power: 2.7, types: ['Impacto', 'Fuego'] } });
  add('baston_dorado', { name: 'Bastón del astrólogo', type: 'weapon', who: ['elara'], price: 940, stats: { atk: 3, mag: 18 }, desc: 'Las estrellas grabadas giran solas.', unleash: { name: 'Órbita lunar', power: 2.6, types: ['Luna', 'Luz'] } });
  add('armadura_dorada', { name: 'Armadura dorada', type: 'armor', price: 900, stats: { def: 17, res: 7 }, desc: 'Ligera como un amanecer.' });
  add('anillo_reloj', { name: 'Anillo del reloj', type: 'acc', price: 700, stats: { spd: 4, res: 3 }, desc: 'Late un poco antes que tú.' });
  add('lanza_estrella', { name: 'Lanza estelar', type: 'weapon', who: ['kaelen'], price: 1500, stats: { atk: 25, mag: 4, spd: 2 }, desc: 'Copiada de un dibujo del libro de la reina.', unleash: { name: 'Caída estelar', power: 2.8, types: ['Corte', 'Luz'] } });
  add('espada_estrella', { name: 'Espada estelar', type: 'weapon', who: ['firion'], price: 1480, stats: { atk: 25, def: 4 }, desc: 'Su filo recuerda una noche sin luna.', unleash: { name: 'Corte del cénit', power: 2.8, types: ['Corte', 'Luz'] } });
  add('martillo_estrella', { name: 'Martillo estelar', type: 'weapon', who: ['flint'], price: 1520, stats: { atk: 28 }, desc: 'Pesa como una estrella pequeña.', unleash: { name: 'Meteoro', power: 2.9, types: ['Impacto', 'Fuego'] } });
  add('tomo_luna', { name: 'Tomo de la luna', type: 'weapon', who: ['elara'], price: 1450, stats: { atk: 2, mag: 23, res: 3 }, desc: 'Las páginas se escriben solas cuando sale la luna.', unleash: { name: 'Capítulo lunar', power: 2.8, types: ['Luna', 'Agua'] } });
  add('manto_estrella', { name: 'Manto estelar', type: 'armor', price: 1400, stats: { def: 21, res: 11 }, desc: 'Tejido con hilo que la bibliotecaria guardaba para un rey.' });
  add('sello_real', { name: 'Sello real', type: 'acc', price: 1200, stats: { atk: 4, mag: 4 }, desc: 'El emblema de Aurelia. Pesa más de lo que debería.' });
  const add2 = (id, o) => { o.id = id; D.ecos[id] = o; };
  add2('eco_reloj', { name: 'Eco del Reloj', el: 'Luna', color: '#e8d8a0', stats: { spd: 3, mag: 2 }, desc: 'Un segundo que se escapó del Motor y se quedó a vivir en las ruinas.',
    release: { name: 'Rebobinar', kind: 'heal', power: 0.35, area: 'allies', desc: 'Cura un 35 % al grupo: las heridas aún no han ocurrido.' } });
  add2('eco_abismo', { name: 'Eco del Abismo', el: 'Agua', color: '#6a5ad8', stats: { atk: 4, mag: 3 }, desc: 'Lo que el Fondo olvidó en el archivo. Frío como una promesa rota.',
    release: { name: 'Marea invertida', kind: 'mag', power: 2.2, types: ['Agua', 'Luna'], area: 'all', desc: 'La marea del Fondo, vuelta contra todos los enemigos.' } });
  D.shops.ciudad = { name: 'Orfebre dorado', stock: ['tonico_plus', 'agua_luna', 'lanza_dorada', 'espada_dorada', 'martillo_dorado', 'baston_dorado', 'armadura_dorada', 'anillo_reloj'] };
  D.shops.biblioteca = { name: 'La copista', stock: ['tonico_plus', 'agua_luna', 'lanza_estrella', 'espada_estrella', 'martillo_estrella', 'tomo_luna', 'manto_estrella', 'sello_real'] };

  // ---------- selector de capítulos ----------
  const c3 = D.chapters.cap3;
  const f4 = Object.assign({}, c3.flags, { 'cap3.varek': true, 'cap3.varek.ido': true, 'cap3.varek.huye': true, 'jefe.vigia': true, 'cap3.faro': true, 'cap3.fin': true, 'ruinas.llegada': true, 'ruinas.jefe': true, 'epoca.ciudad': 'past', objetivo: 'cronista' });
  const f5 = Object.assign({}, f4, { 'cap4.regla': true, 'jefe.crono': true, 'cap4.jefe': true, 'cap4.fin': true, 'cap4.norte': true, 'epoca.biblioteca': 'present', objetivo: 'biblioteca' });
  const ecos4 = c3.ecos.concat(['eco_bronce']);
  const eq4 = { kaelen: { weapon: 'lanza_bronce', armor: 'cota_bronce', acc: 'botas_raiz' }, firion: { weapon: 'espada_vigia', armor: 'cota_bronce', acc: 'anillo_ancla' }, flint: { weapon: 'martillo_bronce', armor: 'cota_bronce', acc: 'guantes_forja' }, elara: { weapon: 'baston_bronce', armor: 'capa_musgo', acc: 'amuleto_bronce' } };
  const eq5 = { kaelen: { weapon: 'lanza_dorada', armor: 'armadura_dorada', acc: 'anillo_reloj' }, firion: { weapon: 'espada_dorada', armor: 'armadura_dorada', acc: 'anillo_ancla' }, flint: { weapon: 'martillo_dorado', armor: 'armadura_dorada', acc: 'guantes_forja' }, elara: { weapon: 'baston_dorado', armor: 'armadura_dorada', acc: 'amuleto_bronce' } };
  const all4 = ['kaelen', 'elara', 'flint', 'firion'];
  D.chapters.cap4 = { name: 'Capítulo 4', test: 'Grupo completo Nv 13', map: 'ciudad', at: [17.5, 22.4], dir: 'up', hour: 11, day: 7, roster: all4,
    levels: { kaelen: 13, elara: 13, flint: 13, firion: 13 }, equip: eq4, ecos: ecos4,
    ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval', 'eco_bronce'], elara: ['eco_luna', 'eco_raiz'], flint: ['eco_espuma'] },
    inv: { tonico_plus: 6, agua_luna: 5, tonico: 4 }, gold: 2400, flags: f4, script: 'cap4.prueba' };
  D.chapters.cap5 = { name: 'Capítulo 5', test: 'Grupo completo Nv 16', map: 'biblioteca', at: [17.5, 20.2], dir: 'up', hour: 21, day: 8, roster: all4,
    levels: { kaelen: 16, elara: 16, flint: 16, firion: 16 }, equip: eq5, ecos: ecos4.concat(['eco_reloj']),
    ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval', 'eco_bronce'], elara: ['eco_luna', 'eco_reloj'], flint: ['eco_espuma', 'eco_raiz'] },
    inv: { tonico_plus: 8, agua_luna: 6 }, gold: 3400, flags: f5, script: 'cap5.inicio' };

  // al terminar el capítulo 3, la historia sigue
  S['cap3.fin'].push({ call: 'cap4.inicio' });

  // ======================================================================
  // CAPÍTULO 4 · La Ciudad Dorada
  // ======================================================================
  S['cap4.inicio'] = [
    { bars: true },
    { say: 'none', t: 'Al apagarse los ecos de la batalla, el altar a los pies del faro empieza a zumbar. {p:0.4}Como un reloj enorme que alguien acaba de despertar.' },
    { say: 'voice', t: '{s:0.7}Kaelen… {p:0.5}ven a casa. {p:0.4}Ven al día que no termina.' },
    { say: 'elara', e: 'sad', t: 'Esa voz… {p:0.3}es la de tu sueño, ¿verdad?' },
    { say: 'kaelen', e: 'neutral', t: 'Sí. {p:0.4}Y esta vez no estoy soñando.' },
    { say: 'flint', e: 'neutral', t: 'Que conste en acta que si tocas ese altar y desaparecemos, la idea fue tuya.' },
    { flash: 1.0, color: '#ffffff' },
    { fade: 1, time: 0.6, color: '#fff6dc' },
    { set: { 'epoca.ciudad': 'past', objetivo: 'cronista' } },
    { warp: 'ciudad', at: [17.5, 22.4], dir: 'up', hour: 11 },
    { roster: ['kaelen', 'elara', 'flint', 'firion'] },
    { chapter: 'Capítulo 4', title: 'La Ciudad Dorada', sub: 'Thalyria · Hace mil años' },
    { cam: [17.5, 18] },
    { fade: 0, time: 2.0 },
    { say: 'none', t: 'Campanas. {p:0.4}Gente. {p:0.3}Olor a pan y a flores. {p:0.4}Las ruinas de bronce están enteras, y brillan como si el sol viviera dentro de ellas.' },
    { say: 'firion', e: 'sad', t: 'Thalyria. {p:0.4}Viva.' },
    { say: 'elara', e: 'happy', t: 'Estamos en el pasado. {p:0.4}Antes del Día Detenido. {p:0.3}Antes de todo.' },
    { say: 'flint', e: 'happy', t: 'Y yo sin traer ni una moneda de su época. {p:0.4}Imagina los precios de hace mil años.' },
    { say: 'kaelen', e: 'neutral', t: 'Alguien nos ha traído aquí por algo. {p:0.4}Busquemos a quien sepa dónde estamos… {p:0.3}y cuándo.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: habla con el Cronista en la plaza del pozo' },
    { save: true },
  ];
  S['cap4.prueba'] = [{ set: { 'epoca.ciudad': 'past' } }, { banner: ['Ciudad Dorada', 'Thalyria · Hace mil años'] }];
  S['cap4.regla'] = [
    { bars: true },
    { cam: [15, 17], time: 1.0 },
    { say: 'none', name: 'Cronista', t: 'Ropa de otra época. {p:0.3}Botas con arena de un mar que aún no existe. {p:0.4}Viajeros del mañana.' },
    { say: 'kaelen', e: 'neutral', t: '¿Sabe quiénes somos?' },
    { say: 'none', name: 'Cronista', t: 'Sé {*cuándo*} sois, que es más importante. {p:0.4}Soy el Cronista del Motor. {p:0.3}Llevo la cuenta de cada hora de Thalyria.' },
    { say: 'none', name: 'Cronista', t: 'Allí, al norte, tras el canal, late el {*Motor del Tiempo*}. {p:0.4}Él decide que el sol salga y se ponga. {p:0.3}Y tiene una sola regla.' },
    { say: 'none', name: 'Cronista', t: '«Lo que se siembra ayer, florece mañana.» {p:0.5}El pasado nunca se borra: {p:0.3}echa raíces en el futuro.' },
    { say: 'elara', e: 'neutral', t: 'Entonces lo que hagamos aquí… {p:0.4}cambiará lo que encontremos al volver.' },
    { say: 'none', name: 'Cronista', t: 'Lista, la de la luna. {p:0.4}Tomad esto: {p:0.3}una semilla de roble del jardín del Motor. {p:0.4}La primera lección de todo aprendiz.' },
    { give: 'semilla' },
    { say: 'none', name: 'Cronista', t: 'Los relojes de arena de la ciudad os llevan de un tiempo a otro. {p:0.4}Tocadlos… {p:0.3}o simplemente {*recordad*} el otro lado.' },
    { set: 'cap4.regla' },
    { say: 'none', t: 'Nueva habilidad: {*viajar entre épocas*}. {p:0.3}Pulsa V (⌛) o toca un reloj de arena.' },
    { say: 'none', name: 'Cronista', t: 'Pero cuidado. {p:0.4}Desde los presagios, la {*Cronoguardia*} ha alzado los puentes del canal. {p:0.3}No deja que nadie se acerque al Motor.' },
    { say: 'firion', e: 'neutral', t: 'Sin puentes en el pasado… {p:0.4}y en el presente el canal sigue ahí.' },
    { say: 'flint', e: 'neutral', t: 'Y nosotros con una semilla. {p:0.4}Si esto es una indirecta, es la más lenta de la historia.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: cruza el canal y llega a la plaza del Motor' },
    { save: true },
  ];
  S['cap4.norte'] = [
    { say: 'elara', e: 'happy', t: 'Las raíces del roble cruzaron el canal en mil años. {p:0.4}La regla funciona.' },
    { say: 'kaelen', e: 'neutral', t: 'La escalera de la plaza solo está entera en el pasado. {p:0.3}Volvamos atrás desde este lado.' },
  ];
  S['cap4.crono'] = [
    { bars: true },
    { cam: [17.5, 3.4], time: 1.4 },
    { shake: 3, time: 1.2, wait: false },
    { say: 'none', t: 'Sobre la plaza del Motor gira un coloso blanco de engranajes y agujas, {p:0.3}con un reloj por corazón.' },
    { say: 'kaelen', e: 'neutral', t: 'No venimos a romper nada. {p:0.4}Venimos a entender.' },
    { say: 'none', name: 'Cronoguardia', t: 'Entender es el primer paso para cambiar. {p:0.4}Y nada cambia aquí mientras yo dé la hora.' },
    { battle: ['cronoguardia', 'aguja_izq', 'aguja_der'], at: [17.5, 3.2], once: 'jefe.crono', after: 'cap4.fin' },
  ];
  S['cap4.fin'] = [
    { bars: true },
    { refresh: true },
    { say: 'none', name: 'Cronoguardia', t: 'Esa lanza… {p:0.5}Tiene el brillo del Motor. {p:0.4}Solo hubo una lanza así.' },
    { say: 'none', name: 'Cronoguardia', t: '{s:0.7}…Alteza. {p:0.5}Perdonad a este viejo reloj.' },
    { say: 'kaelen', e: 'sad', t: '¿Alteza?' },
    { flash: 0.8, color: '#fff0c0' },
    { say: 'none', t: 'El Motor late. {p:0.4}En su luz se ve una marea negra trepando por las murallas de la ciudad, {p:0.3}y una mujer de oro con una lanza alzada hacia el sol.' },
    { say: 'voice', t: '{s:0.7}Pequeño… {p:0.5}no busques el final aquí. {p:0.4}Búscalo donde guardé la verdad.' },
    { say: 'none', name: 'Cronoguardia', t: 'La Biblioteca. {p:0.4}La reina escribió allí lo que va a hacer hoy. {p:0.3}Hoy es {*el día*}. {p:0.4}Os abriré el camino… en las dos épocas.' },
    { say: 'elara', e: 'sad', t: 'Kaelen… {p:0.4}esa mujer era…' },
    { say: 'kaelen', e: 'neutral', t: 'No lo digas todavía. {p:0.4}Quiero leerlo con mis propios ojos.' },
    { say: 'flint', e: 'neutral', t: 'Por si acaso, a partir de ahora te cobro con descuento real.' },
    { set: { 'cap4.fin': true } },
    { fade: 1, time: 1.2 },
    { chapter: 'Fin del Capítulo 4', title: 'La Ciudad Dorada', sub: 'Thalyria · El Día Detenido' },
    { save: true },
    { call: 'cap5.inicio' },
  ];

  // ======================================================================
  // CAPÍTULO 5 · La Biblioteca de las Dos Épocas
  // ======================================================================
  S['cap5.inicio'] = [
    { bars: true },
    { fade: 1, time: 0.4 },
    { set: { 'epoca.biblioteca': 'present', objetivo: 'biblioteca' } },
    { warp: 'biblioteca', at: [17.5, 20.2], dir: 'up', hour: 21 },
    { roster: ['kaelen', 'elara', 'flint', 'firion'] },
    { chapter: 'Capítulo 5', title: 'La Biblioteca de las Dos Épocas', sub: 'Thalyria · El Día Detenido' },
    { fade: 0, time: 1.6 },
    { say: 'none', t: 'Estanterías hundidas, libros convertidos en coral, {p:0.3}y un frío que no viene del agua.' },
    { say: 'firion', e: 'neutral', t: 'El presente. {p:0.4}La misma biblioteca, mil años después.' },
    { say: 'elara', e: 'sad', t: 'Hay alguien más aquí. {p:0.4}Lo siento en el agua.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: encuentra el libro de la reina en la cámara sellada' },
    { save: true },
  ];
  S['cap5.varek'] = [
    { bars: true },
    { cam: [17.5, 12], time: 1.2 },
    { place: 'varek', at: [17.5, 11.4], dir: 'down' },
    { say: 'varek', e: 'neutral', t: '«Hoy detendré el Motor. {p:0.4}Hoy encerraré al Primer Abisal en un solo instante, {p:0.3}y el instante durará lo que haga falta.»' },
    { say: 'varek', e: 'neutral', t: 'La letra de una reina. {p:0.4}Bonita, ¿verdad, Alteza?' },
    { say: 'firion', e: 'angry', t: '¡Varek!' },
    { say: 'varek', e: 'neutral', t: 'Vuestra reina no venció al Fondo, niños. {p:0.4}Solo lo puso en pausa. {p:0.3}Y a todo un reino con él.' },
    { say: 'varek', e: 'angry', t: 'Mil años de un mismo segundo. {p:0.4}¿Eso es salvar a alguien? {p:0.3}Yo pienso {*terminar*} ese día.' },
    { say: 'kaelen', e: 'angry', t: 'Terminarlo dejando que el Abisal se trague el mundo.' },
    { say: 'varek', e: 'happy', t: 'Terminarlo. {p:0.4}Lo demás son detalles. {p:0.3}El Primer Abisal duerme ahí dentro, en la cámara. {p:0.4}Lo he dejado… {*inquieto*}.' },
    { say: 'varek', e: 'neutral', t: 'Me quedo el libro. {p:0.4}Os espero en el Motor, Alteza. {p:0.3}Cuando sepáis la verdad, quizá me deis la razón.' },
    { flash: 0.5, color: '#1a0a20' },
    { set: 'cap5.varek.ido' },
    { refresh: true },
    { say: 'elara', e: 'neutral', t: 'La cámara tiene una compuerta de arena. {p:0.4}Se abre solo un instante…' },
    { say: 'kaelen', e: 'neutral', t: 'En el pasado esta biblioteca estaba viva. {p:0.3}Quizá allí alguien sepa cómo cruzarla.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: viaja al pasado (V) y busca ayuda en la biblioteca' },
    { save: true },
  ];
  S['cap5.arena'] = [
    { bars: true },
    { say: 'none', name: 'Selene, bibliotecaria', t: '¡Silencio en la sala! {p:0.4}…Oh. {p:0.3}No sois lectores. {p:0.4}Sois {*viajeros*}.' },
    { say: 'none', name: 'Selene, bibliotecaria', t: 'La reina me dijo que vendríais. {p:0.4}Que una muchacha con la luna en el pelo me pediría ayuda con la compuerta de arena.' },
    { say: 'elara', e: 'sad', t: '¿La reina… sabía que yo vendría?' },
    { say: 'none', name: 'Selene, bibliotecaria', t: 'La reina sabe muchas cosas hoy. {p:0.4}Es un día extraño. {p:0.3}Toma: arena del reloj mayor.' },
    { say: 'none', t: 'Una gota de arena dorada flota en el aire… {p:0.4}y se posa en la mano de Elara.' },
    { say: 'elara', e: 'neutral', t: 'El agua también recuerda. {p:0.4}Si la escucho, puedo pedirle a una cosa que {*espere*}.' },
    { set: 'res.congelar' },
    { say: 'none', t: 'Elara aprende: {*Congelar el tiempo*}. {p:0.3}Usa su Resonancia de Agua sobre una compuerta de arena abierta.' },
    { say: 'none', name: 'Selene, bibliotecaria', t: 'Una cosa más. {p:0.4}Si alguna vez el archivo se inunda, {p:0.3}la palanca de esta sala abre los desagües. {p:0.4}Para siempre.' },
    { say: 'flint', e: 'happy', t: '«Para siempre». {p:0.4}Me encanta cuando las cosas del pasado tienen garantía.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: en el presente, tira de la palanca junto a la compuerta y congélala con la Resonancia de Agua (R para elegirla, X/Z para usarla)' },
    { save: true },
  ];
  S['cap5.abisal'] = [
    { bars: true },
    { cam: [23, 4], time: 1.4 },
    { shake: 4, time: 1.6, wait: false },
    { say: 'none', t: 'En la cámara sellada, el suelo es un pozo de agua negra. {p:0.4}Algo enorme se desenrosca en su interior.' },
    { say: 'elara', e: 'sad', t: 'Es él. {p:0.4}Lo que vi en el Fondo. {p:0.3}Lo que me llamaba.' },
    { say: 'firion', e: 'angry', t: 'Varek lo ha despertado a medias. {p:0.4}Si sale entero de ese pozo, no quedará biblioteca… ni época.' },
    { say: 'kaelen', e: 'angry', t: 'Entonces que no salga.' },
    { heal: true },
    { battle: ['abisal'], at: [23, 4], once: 'jefe.abisal', after: 'cap5.fin' },
  ];
  S['cap5.fin'] = [
    { bars: true },
    { refresh: true },
    { say: 'none', name: 'Primer Abisal', t: '{s:0.7}Volveré… {p:0.5}al instante… {p:0.4}del que ella me… {p:0.5}No. {p:0.4}{*Varek abrirá la puerta.*}' },
    { flash: 0.7, color: '#d8e0ff' },
    { say: 'none', t: 'El agua negra se hunde. {p:0.4}En el fondo de la cámara, un cristal dorado empieza a hablar con la voz del sueño.' },
    { say: 'voice', name: 'Aurelia', t: 'Si escuchas esto, hijo mío, {p:0.3}es que el mar te devolvió. {p:0.5}Soy Aurelia, reina de Thalyria. {p:0.4}Tu madre.' },
    { emote: 'kaelen', icon: '!', time: 1.0 },
    { say: 'voice', name: 'Aurelia', t: 'El día que el Primer Abisal subió desde el Fondo, no pude vencerlo. {p:0.4}Así que detuve el Motor. {p:0.3}Lo encerré en un instante… {p:0.4}y a mi ciudad con él.' },
    { say: 'voice', name: 'Aurelia', t: 'Pero a ti no. {p:0.5}A ti te envolví en la vela del faro y te entregué a la marea, {p:0.3}hacia un mañana donde aún hubiera mañanas.' },
    { say: 'voice', name: 'Aurelia', t: 'Los cuatro faros sujetan mi instante. {p:0.4}Cuando los enciendas todos, el Motor podrá volver a latir. {p:0.3}Y el día, por fin, terminará.' },
    { say: 'voice', name: 'Aurelia', t: 'En la Torre te espera Ithra, mi comadrona. {p:0.4}Ella te contará lo que a mí no me da tiempo a decirte.' },
    { say: 'voice', name: 'Aurelia', t: 'Que termine con el sol, Kaelen. {p:0.5}No con el Fondo. {p:0.4}Te quiero. {p:0.3}Te he querido durante mil años en un segundo.' },
    { say: 'none', t: 'El cristal se apaga.' },
    { say: 'elara', e: 'sad', t: 'Kaelen…' },
    { say: 'kaelen', e: 'sad', t: 'Ilun dijo que el mar no devuelve nada por casualidad. {p:0.6}Me devolvió para terminar el día de mi madre.' },
    { say: 'firion', e: 'neutral', t: 'Y Varek quiere terminarlo al revés. {p:0.4}Con el Abisal libre.' },
    { say: 'flint', e: 'neutral', t: 'Un príncipe. {p:0.4}Llevo años cobrándole las reparaciones de la lanza a un príncipe.' },
    { say: 'flint', e: 'sad', t: '…No pienso devolverte nada, ¿eh? {p:0.4}Pero te seguiré hasta el Motor. {p:0.3}Eso gratis.' },
    { say: 'kaelen', e: 'angry', t: 'Al Motor, entonces. {p:0.4}Varek nos espera. {p:0.3}Y mi madre también.' },
    { set: { 'cap5.fin': true, objetivo: 'cap6' } },
    { fade: 1, time: 1.4 },
    { chapter: 'Fin del Capítulo 5', title: 'La Biblioteca de las Dos Épocas', sub: 'Continuará' },
    { fade: 0, time: 1.2 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Fin del capítulo 5 · Partida guardada' },
    { save: true },
  ];

  // ---------- charlas ----------
  T.cronista = [{ say: '@npc', e: 'neutral', name: 'Cronista', t: 'Lo que se siembra ayer, florece mañana. {p:0.4}No lo olvidéis cuando volváis a vuestro tiempo.' }];
  T.ciudadana = [{ say: '@npc', e: 'happy', t: '¡Qué día tan raro! {p:0.3}El sol lleva un rato quieto en lo alto… {p:0.4}seguro que no es nada.' }];
  T.nino_dorado = [{ say: '@npc', e: 'happy', t: '¡La reina tiene una lanza que brilla como la tuya! {p:0.3}¿Eres de la guardia?' }];
  T.guardia_dorada = [{ say: '@npc', e: 'neutral', t: 'La Cronoguardia ha subido los puentes. {p:0.4}Dicen que es por los presagios del mar.' }];
  T.orfebre = [{ say: '@npc', e: 'happy', name: 'Orfebre', t: '¿Moneda de otra época? {p:0.3}Oro es oro, viajeros.' }, { shop: 'ciudad' }];
  T.copista = [{ say: '@npc', e: 'neutral', name: 'Copista', t: 'Copio lo que la reina dicta. {p:0.3}También vendo lo que no se lee.' }, { shop: 'biblioteca' }];
  T.varek = [{ say: '@npc', e: 'neutral', t: '…' }];
  D.maps.biblioteca.npcs.push({ id: 'varek', talk: 'varek', c: 17.5, r: 11.4, ai: 'idle', dir: 'down', if: ['epoca.biblioteca=present', '!cap5.varek.ido'] });
})();
