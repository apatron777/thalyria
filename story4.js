// GUION · Capítulo 6 «La profecía del mar».
// El Primer Abisal se agita y el mar sube: Bruma Salada queda inundada y el mapa del mundo cambia.
// Firion se marcha tras Varek · Hondaroca, el pueblo de Flint, está hundido · Oriel y la profecía «del mar»
// · Firion vuelve: fue Varek quien abrió las compuertas · el Coloso de la Forja · la Torre del Motor emerge.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, T = D.talk;

  // ---------- bestiario ----------
  Object.assign(D.enemies, {
    medusa: { name: 'Medusa del Fondo', sprite: 'medusa', hp: 700, atk: 64, def: 26, mag: 66, res: 30, spd: 12, exp: 420, gold: 160, markH: 24, flying: true,
      weak: { Fuego: 1.4, Impacto: 1.2 }, resist: { Agua: 0.4 }, drops: [{ item: 'agua_luna', chance: 0.35 }],
      actions: { latigo: { name: 'Látigo urticante', kind: 'phys', power: 1.0, target: 'one' }, descarga: { name: 'Descarga', kind: 'mag', power: 0.9, target: 'all', fx: 'storm' } },
      ai: [{ act: 'descarga', every: 2 }, { act: 'latigo' }] },
    medusa_reina: { name: 'Medusa reina', sprite: 'medusa_reina', hp: 980, atk: 70, def: 28, mag: 74, res: 34, spd: 13, exp: 600, gold: 230, markH: 24, flying: true,
      weak: { Fuego: 1.4, Impacto: 1.2 }, resist: { Agua: 0.4 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { latigo: { name: 'Látigo urticante', kind: 'phys', power: 1.1, target: 'one', pick: 'weakest' }, descarga: { name: 'Tormenta de medusas', kind: 'mag', power: 1.05, target: 'all', fx: 'storm' } },
      ai: [{ act: 'descarga', every: 2 }, { act: 'latigo' }] },
    cangrejo_abisal: { name: 'Cangrejo abisal', sprite: 'cangrejo_abisal', hp: 900, atk: 72, def: 40, mag: 20, res: 24, spd: 6, exp: 480, gold: 180, markH: 32,
      weak: { Impacto: 1.3, Luz: 1.2 }, resist: { Corte: 0.6, Agua: 0.6 }, drops: [{ item: 'concha', chance: 0.6 }],
      actions: { pinza: { name: 'Pinza abisal', kind: 'phys', power: 1.0, target: 'one' }, caparazon: { name: 'Caparazón negro', kind: 'buff', target: 'self', buff: { def: 1.5, turns: 2 } } },
      ai: [{ act: 'caparazon', if: 'self<0.5', cooldown: 4 }, { act: 'pinza' }] },
    cangrejo_titan: { name: 'Cangrejo titán', sprite: 'cangrejo_titan', hp: 1250, atk: 80, def: 46, mag: 22, res: 26, spd: 5, exp: 680, gold: 260, markH: 32,
      weak: { Impacto: 1.3, Luz: 1.2 }, resist: { Corte: 0.6, Agua: 0.6 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { pinza: { name: 'Pinza abisal', kind: 'phys', power: 1.1, target: 'one' }, terremoto: { name: 'Terremoto', kind: 'phys', power: 0.85, target: 'all' } },
      ai: [{ act: 'terremoto', every: 3 }, { act: 'pinza' }] },
    coloso: { name: 'Coloso de la Forja', title: 'El Padre Yunque de Hondaroca', sprite: 'coloso', boss: true, big: true, markH: 56,
      hp: 4200, atk: 62, def: 26, mag: 56, res: 24, spd: 7, exp: 6500, gold: 3000,
      weak: { Agua: 1.3, Luna: 1.15 }, resist: { Fuego: 0.4, Corte: 0.8 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        martillo: { name: 'Martillazo', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        chispas: { name: 'Lluvia de chispas', kind: 'mag', power: 0.95, target: 'all', fx: 'storm' },
        fuelle: { name: 'Fuelle', kind: 'buff', target: 'self', buff: { atk: 1.2, turns: 3 } },
        temple: { name: 'Temple', kind: 'heal', heal: 0.07, target: 'self' },
        colada: { name: 'Colada de hierro', kind: 'mag', power: 1.45, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'chispas', every: 3 }, { act: 'martillo' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Coloso de la Forja', t: '{s:0.7}Agua… {p:0.4}agua en mi fragua. {p:0.4}El fuego no puede morir. {p:0.3}{*No dejaré que muera.*}' },
          { name: 'Flint', t: 'Padre Yunque… {p:0.4}soy yo. {p:0.3}El nieto de Bruno. {p:0.4}El que te robaba carbón.' },
        ] },
        { at: 0.6, music: 'jefe2', revive: 0.6, sprite: 'coloso2', dialog: [
          { name: 'Coloso de la Forja', t: 'MÁS FUEGO. {p:0.4}MÁS. {p:0.3}EL MAR NO ENTRARÁ EN HONDAROCA.' },
        ], ai: [{ act: 'fuelle', every: 4 }, { act: 'temple', if: 'self<0.4', cooldown: 6 }, { act: 'chispas', every: 2 }, { act: 'martillo' }] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Coloso de la Forja', t: '{~Fundidlo todo.~} {p:0.4}Si el pueblo ha de hundirse… {p:0.3}que se hunda ardiendo.' },
          { name: 'Flint', t: '¡No, viejo! {p:0.3}¡Así no se apaga una fragua! {p:0.4}¡Chicos, enfriadlo antes de la colada!' },
        ], ai: [{ act: 'colada', every: 2 }, { act: 'chispas', every: 2 }, { act: 'martillo' }] },
      ] },
    yunque_izq: { name: 'Yunque izquierdo', sprite: 'yunque', part: true, markH: 34, hp: 520, atk: 50, def: 28, mag: 10, res: 20, spd: 7, exp: 150, gold: 0,
      weak: { Agua: 1.3 }, resist: { Fuego: 0.4 },
      actions: { golpe: { name: 'Golpe de yunque', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Escudo de hierro', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    yunque_der: { name: 'Yunque derecho', sprite: 'yunque', part: true, markH: 34, hp: 520, atk: 50, def: 28, mag: 10, res: 20, spd: 8, exp: 150, gold: 0,
      weak: { Agua: 1.3 }, resist: { Fuego: 0.4 },
      actions: { golpe: { name: 'Golpe de yunque', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Escudo de hierro', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
  });
  TH.foeVariant('medusa', 'larva', 175, 1.5, 1.2, '#06202a');
  TH.foeVariant('medusa_reina', 'larva', 215, 1.6, 1.05, '#100830');
  TH.foeVariant('cangrejo_abisal', 'cangrejo', 250, 0.8, 0.55, '#08040e');
  TH.foeVariant('cangrejo_titan', 'cangrejo', 280, 0.9, 0.42, '#040208');
  TH.foeVariant('coloso', 'karkinos', 15, 0.9, 0.85, '#1e0a04');
  TH.foeVariant('coloso2', 'karkinos2', 5, 1.2, 0.95, '#2a0a02');
  TH.foeVariant('yunque', 'pinza', 15, 0.6, 0.7, '#140806');
  const BS = TH.BattleScene;

  // ---------- equipo, Eco y tienda ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('lanza_abisal', { name: 'Lanza de las mareas', type: 'weapon', who: ['kaelen'], price: 2300, stats: { atk: 30, mag: 5, spd: 2 }, desc: 'Nerea la sacó del agua el mismo día que subió el mar.', unleash: { name: 'Marea del alba', power: 3.0, types: ['Corte', 'Luz'] } });
  add('espada_abisal', { name: 'Espada del rompeolas', type: 'weapon', who: ['firion'], price: 2250, stats: { atk: 30, def: 5 }, desc: 'Templada en agua salada. No se dobla ante nada.', unleash: { name: 'Rompeolas', power: 3.0, types: ['Corte', 'Agua'] } });
  add('martillo_hondaroca', { name: 'Martillo de Hondaroca', type: 'weapon', who: ['flint'], price: 0, stats: { atk: 34, def: 3 }, desc: 'El martillo del abuelo de Flint. Todavía huele a carbón.', unleash: { name: 'Último fuego de Hondaroca', power: 3.2, types: ['Impacto', 'Fuego'] } });
  add('cetro_marea', { name: 'Cetro de la marea', type: 'weapon', who: ['elara'], price: 2200, stats: { atk: 3, mag: 28, res: 4 }, desc: 'La luna lo empuja; el mar lo obedece.', unleash: { name: 'Pleamar', power: 3.0, types: ['Luna', 'Agua'] } });
  add('coraza_coral', { name: 'Coraza de coral negro', type: 'armor', price: 2000, stats: { def: 26, res: 13 }, desc: 'Coral que creció sobre los tejados de Hondaroca.' });
  add('anillo_profecia', { name: 'Anillo de la profecía', type: 'acc', price: 1800, stats: { atk: 5, mag: 5, spd: 2 }, desc: 'Grabado en su interior: «del mar».' });
  D.ecos.eco_forja = { id: 'eco_forja', name: 'Eco de la Forja', el: 'Fuego', color: '#ff8a3a', stats: { atk: 5, def: 3 }, desc: 'La última chispa de la Gran Fragua, guardada en el claro de Ilun.',
    release: { name: 'Colada', kind: 'phys', power: 2.4, types: ['Fuego', 'Impacto'], area: 'all', desc: 'Hierro fundido sobre todos los enemigos.' } };
  D.shops.inundada = { name: 'Puesto flotante de Nerea', stock: ['tonico_plus', 'agua_luna', 'lanza_abisal', 'espada_abisal', 'cetro_marea', 'coraza_coral', 'anillo_profecia'] };

  // ---------- selector ----------
  const c5 = D.chapters.cap5;
  const f6 = Object.assign({}, c5.flags, { 'cap5.varek': true, 'cap5.varek.ido': true, 'cap5.arena': true, 'res.congelar': true, 'jefe.abisal': true, 'cap5.jefe': true, 'cap5.fin': true, objetivo: 'cap6' });
  D.chapters.cap6 = { name: 'Capítulo 6', test: 'Grupo Nv 19', map: 'biblioteca', at: [23, 5.4], dir: 'down', hour: 21, day: 9,
    roster: ['kaelen', 'elara', 'flint', 'firion'], levels: { kaelen: 19, elara: 19, flint: 19, firion: 19 },
    equip: { kaelen: { weapon: 'lanza_estrella', armor: 'manto_estrella', acc: 'anillo_reloj' }, firion: { weapon: 'espada_estrella', armor: 'manto_estrella', acc: 'anillo_ancla' }, flint: { weapon: 'martillo_estrella', armor: 'armadura_dorada', acc: 'guantes_forja' }, elara: { weapon: 'tomo_luna', armor: 'manto_estrella', acc: 'sello_real' } },
    ecos: c5.ecos.concat(['eco_abismo']), ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval', 'eco_bronce'], elara: ['eco_luna', 'eco_reloj'], flint: ['eco_espuma', 'eco_raiz', 'eco_abismo'] },
    inv: { tonico_plus: 10, agua_luna: 8 }, gold: 5200, flags: f6, script: 'cap6.inicio' };
  S['cap5.fin'].push({ call: 'cap6.inicio' });

  // ======================================================================
  // CAPÍTULO 6 · La profecía del mar
  // ======================================================================
  S['cap6.inicio'] = [
    { bars: true },
    { shake: 5, time: 2.0, wait: false },
    { say: 'none', t: 'Al morir la voz de Aurelia, la Biblioteca entera tiembla. {p:0.4}Muy lejos, bajo el mar, algo enorme se da la vuelta en su sueño.' },
    { flash: 1.0, color: '#d8e0ff' },
    { fade: 1, time: 0.8 },
    { set: { 'mar.subido': true, 'isla.norte': true, objetivo: 'muelle' } },
    { warp: 'brumaInundada', at: [19, 13.4], dir: 'down', hour: 17.5 },
    { roster: ['kaelen', 'elara', 'flint', 'firion'] },
    { chapter: 'Capítulo 6', title: 'La profecía del mar', sub: 'Thalyria · El Día Detenido' },
    { cam: [19, 16] },
    { fade: 0, time: 2.0 },
    { say: 'none', t: 'Bruma Salada. {p:0.4}El puerto, la playa, la fragua… {p:0.3}todo bajo el agua. {p:0.4}Solo la plaza, el claro y el faro asoman sobre el mar.' },
    { say: 'mira', e: 'sad', t: '{~¡Kaelen!~} {p:0.3}¡Habéis vuelto! {p:0.4}El mar subió en una noche. {p:0.3}Ni olas ni tormenta: {p:0.3}simplemente {*subió*}.' },
    { say: 'mira', e: 'neutral', t: 'He subido el horno a la plaza. {p:0.4}Si el mar se lleva el pueblo, que por lo menos huela a pan.' },
    { say: 'mira', e: 'sad', t: 'Tú siempre vuelves, Kaelen. {p:0.4}Yo me encargo de que haya algo a lo que volver.' },
    { say: 'halvard', e: 'sad', t: 'Cuando el Abisal se removió, el océano entero respiró hondo. {p:0.4}El faro aguanta. {p:0.3}Pero la marea ya no baja.' },
    { say: 'halvard', e: 'sad', t: 'Y hay algo peor. {p:0.4}Las corrientes trajeron restos del norte. {p:0.3}Vigas negras. {p:0.3}Fuelles. {p:0.4}Herramientas de forja.' },
    { emote: 'flint', icon: '!', time: 1.0 },
    { say: 'flint', e: 'sad', t: 'Hondaroca. {p:0.6}Mi pueblo.' },
    { say: 'elara', e: 'sad', t: 'Flint…' },
    { say: 'flint', e: 'neutral', t: 'No. {p:0.4}Ahora no hay chistes. {p:0.3}Vamos al norte. {p:0.4}Ahora.' },
    { face: 'firion', dir: 'kaelen' },
    { say: 'firion', e: 'neutral', t: 'Id vosotros. {p:0.6}Yo voy tras Varek.' },
    { say: 'kaelen', e: 'sad', t: '¿Solo? {p:0.3}Firion, no.' },
    { say: 'firion', e: 'angry', t: 'Era mi capitán. {p:0.4}Le juré lealtad al mismo faro que ahora quiere hundir. {p:0.4}Esta deuda no la puede pagar nadie más.' },
    { say: 'firion', e: 'neutral', t: 'Os encontraré. {p:0.4}Un vigía siempre vuelve a su puesto.' },
    { leave: 'firion' },
    { say: 'none', t: '{*Firion*} se marcha en una barca de pesca, rumbo a mar abierto.' },
    { say: 'halvard', e: 'neutral', t: 'Mi barca está amarrada al muelle flotante, más allá de la calle anegada. {p:0.4}Si alguien sabe cómo llegar hasta ella, es el chico de la lanza.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: llega al muelle flotante y zarpa hacia Hondaroca (norte)' },
    { save: true },
  ];
  S['cap6.muelle'] = [
    { say: 'elara', e: 'neutral', t: 'Las plataformas aguantan. {p:0.3}Igual que en la gruta, Kaelen.' },
    { say: 'none', t: 'Usa la {*barca de Halvard*} para viajar. {p:0.3}El mapa del mundo ha cambiado: el mar ha subido y las islas han encogido.' },
  ];
  S['cap6.hondaroca'] = [
    { bars: true },
    { cam: [18, 14], time: 1.6 },
    { say: 'none', t: 'Hondaroca. {p:0.4}Las casas de abajo asoman bajo el agua como piedras de un río. {p:0.3}En lo alto, la Gran Fragua todavía humea.' },
    { say: 'flint', e: 'sad', t: 'Ahí abajo estaba la casa de mi abuelo. {p:0.4}Ahí aprendí a encender un fuego con siete años… {p:0.3}y a apagar el pelo de mi hermana con ocho.' },
    { say: 'flint', e: 'sad', t: '…Lo siento. {p:0.3}La costumbre. {p:0.4}Si no hago chistes, me pongo a llorar.' },
    { say: 'kaelen', e: 'neutral', t: 'Haz los dos, Flint. {p:0.4}Nosotros estamos aquí.' },
    { say: 'elara', e: 'neutral', t: 'Hay gente arriba, en el barrio de la forja. {p:0.3}Veo humo de cocina.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: sube al barrio de la forja' },
    { save: true },
  ];
  S['cap6.profecia'] = [
    { bars: true },
    { cam: [23, 10], time: 1.2 },
    { say: 'none', name: 'Oriel', t: 'Flint. {p:0.4}Flint, hijo de Marta, nieto de Bruno. {p:0.3}Llegas tarde, como siempre.' },
    { say: 'flint', e: 'sad', t: '…Oriel. {p:0.4}Sigues viva, vieja bruja.' },
    { say: 'none', name: 'Oriel', t: 'Alguien tenía que quedarse a vigilar el fuego. {p:0.4}Y alguien tenía que esperar al chico del mar.' },
    { face: 'kaelen', dir: 'up' },
    { say: 'none', name: 'Oriel', t: 'Tú. {p:0.3}La lanza. {p:0.4}Hondaroca guarda una profecía desde antes de los faros. {p:0.3}Escúchala, porque habla de ti.' },
    { say: 'none', name: 'Oriel', t: '{s:0.7}«Cuando el día detenido toque a su fin, {p:0.4}el mar subirá hasta la fragua más alta.»' },
    { say: 'none', name: 'Oriel', t: '{s:0.7}«Y {*uno del mar*} volverá al mar, {p:0.5}para que el sol vuelva a salir.»' },
    { say: 'none', name: 'Oriel', t: 'Hay una tercera línea que nadie recita. {p:0.4}«Más hondo que el Fondo duerme el que hizo el mar. {p:0.3}Que nadie lo despierte.»' },
    { say: 'elara', e: 'sad', t: '«Uno del mar»… {p:0.4}Kaelen llegó del mar. {p:0.3}Y yo… {p:0.4}yo estuve en el Fondo.' },
    { say: 'kaelen', e: 'neutral', t: 'Las profecías dicen lo que temen los que las escuchan, Elara. {p:0.4}No lo que va a pasar.' },
    { say: 'none', name: 'Oriel', t: 'Sabias palabras para alguien tan joven. {p:0.4}Ojalá tengas razón, Alteza.' },
    { say: 'flint', e: 'angry', t: '¡Basta de agüeros! {p:0.4}Oriel, ¿qué le pasa al Padre Yunque? {p:0.3}La Gran Fragua no paraba de rugir mientras subíamos.' },
    { say: 'none', name: 'Oriel', t: 'Cuando el agua entró en el pueblo, el Coloso se volvió loco. {p:0.4}Aviva el fuego sin descanso para que el mar no entre en la fragua. {p:0.3}Si sigue así, estallará con medio monte encima.' },
    { say: 'none', name: 'Oriel', t: 'La escalera la cerró él mismo. {p:0.4}«El yunque no se mueve; se le acerca la piedra. La mina enciende el camino.» {p:0.3}Tu abuelo escribió eso, Flint.' },
    { say: 'flint', e: 'neutral', t: 'Piedra y mina. {p:0.4}El pilar a la placa y el cristal de la mina. {p:0.3}Vamos, abuelo. {p:0.4}Ya voy.' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: abre la escalera de la Gran Fragua (pilar y cristal)' },
    { save: true },
  ];
  S['cap6.coloso'] = [
    { bars: true },
    { cam: [18, 3], time: 1.4 },
    { shake: 4, time: 1.6, wait: false },
    { say: 'none', t: 'En el corazón de la Gran Fragua, un gigante de hierro negro golpea el yunque sin parar. {p:0.4}Cada golpe hace temblar el monte.' },
    { say: 'flint', e: 'sad', t: 'Padre Yunque. {p:0.4}Mi abuelo te daba cuerda cada mañana. {p:0.3}Y te contaba chistes malos. {p:0.4}De ahí los saqué yo.' },
    { say: 'none', name: 'Coloso de la Forja', t: 'EL MAR. {p:0.4}EL MAR ESTÁ AQUÍ. {p:0.3}MÁS FUEGO.' },
    { say: 'none', name: '???', t: '{~¡Esperad!~}' },
    { place: 'firion', at: [18, 8.6], dir: 'up' },
    { join: 'firion', quiet: true },
    { level: 'firion', lv: 21 },
    { say: 'firion', e: 'neutral', t: 'Un vigía siempre vuelve a su puesto. {p:0.4}Os lo dije.' },
    { say: 'kaelen', e: 'happy', t: '¡Firion!' },
    { say: 'firion', e: 'angry', t: 'Seguí a Varek hasta aquí. {p:0.4}Fue él. {p:0.3}Abrió las compuertas del Motor desde la Torre y dejó que el mar subiera. {p:0.4}Hondaroca fue lo primero que se tragó.' },
    { say: 'flint', e: 'angry', t: '…Varek. {p:0.6}Apuntado. {p:0.4}Con letras grandes.' },
    { say: 'firion', e: 'neutral', t: 'Primero, el Coloso. {p:0.4}Después, la deuda.' },
    { say: 'none', t: '{*Firion*} vuelve al grupo.' },
    { heal: true },
    { battle: ['coloso', 'yunque_izq', 'yunque_der'], at: [18, 2.4], once: 'jefe.coloso', after: 'cap6.fin' },
  ];
  S['cap6.fin'] = [
    { bars: true },
    { refresh: true },
    { say: 'none', name: 'Coloso de la Forja', t: '{s:0.7}…Flint. {p:0.5}El nieto de Bruno. {p:0.4}Robabas… carbón.' },
    { say: 'flint', e: 'sad', t: 'Y tú siempre lo sabías. {p:0.4}Y nunca se lo dijiste al abuelo.' },
    { say: 'none', name: 'Coloso de la Forja', t: 'Un fuego… {p:0.3}necesita… {p:0.4}quien lo herede. {p:0.6}Toma. {p:0.4}Era de Bruno.' },
    { give: 'martillo_hondaroca' },
    { say: 'none', t: 'El Coloso se sienta junto a su yunque, como un viejo que por fin descansa. {p:0.4}La Gran Fragua se apaga despacio, sin estallar.' },
    { say: 'flint', e: 'sad', t: 'Gracias, Padre Yunque. {p:0.6}…Chicos, no me miréis. {p:0.3}Se me ha metido hollín en los ojos.' },
    { place: 'woman', at: [20, 6.6], dir: 'up' },
    { say: 'none', name: 'Oriel', t: 'La fragua más alta ya ha visto el mar. {p:0.4}La profecía sigue su curso.' },
    { shake: 3, time: 1.6, wait: false },
    { say: 'none', name: 'Oriel', t: 'Mirad al sur. {p:0.4}Donde antes solo había olas.' },
    { cam: [18, 22], time: 2.0 },
    { say: 'none', t: 'Lejos, en el horizonte, una torre de bronce y cristal se alza del océano, chorreando agua. {p:0.4}La {*Torre del Motor*}.' },
    { set: { 'isla.hundida': true, 'cap6.fin': true, objetivo: 'cap7' } },
    { say: 'firion', e: 'neutral', t: 'Ahí está Varek. {p:0.4}Y el Motor.' },
    { say: 'elara', e: 'sad', t: '«Uno del mar volverá al mar»… {p:0.4}Kaelen, prométeme que no vas a hacer ninguna tontería.' },
    { say: 'kaelen', e: 'neutral', t: 'Te prometo que volveremos los cuatro. {p:0.4}Con el sol detrás.' },
    { say: 'flint', e: 'neutral', t: 'Eso ya lo prometiste una vez. {p:0.3}Y cumpliste. {p:0.4}Más o menos. {p:0.3}Con un rodeo de mil años.' },
    { fade: 1, time: 1.4 },
    { chapter: 'Fin del Capítulo 6', title: 'La profecía del mar', sub: 'Continuará' },
    { fade: 0, time: 1.2 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Fin del capítulo 6 · Partida guardada' },
    { save: true },
  ];

  // ---------- charlas ----------
  T.halvard_inundada = [{ say: '@npc', e: 'sad', t: 'Cincuenta años vigilando el mar. {p:0.4}Y el mar ha venido a vigilarme a mí.' }];
  T.mira_inundada = [{ if: 'cap6.fin', then: [{ say: '@npc', e: 'happy', t: '¿Habéis visto esa torre en el horizonte? {p:0.3}Da miedo. {p:0.4}Pero brilla bonito.' }], else: [{ say: '@npc', e: 'sad', t: 'Mi casa está ahí abajo. {p:0.4}Con mi pan quemado dentro.' }] }];
  T.ilun_inundada = [{ say: '@npc', e: 'neutral', t: 'El claro sigue seco, muchacho. {p:0.4}Guardé aquí la chispa que el mar arrancó de una fragua del norte. {p:0.3}Búscala junto a las raíces.' }];
  T.nerea_inundada = [{ say: '@npc', e: 'happy', name: 'Nerea', t: 'El agua se llevó el puesto, no a la tendera. {p:0.3}Género rescatado del mar, ¡como nuevo!' }, { shop: 'inundada' }];
  T.superviviente1 = [{ say: '@npc', e: 'sad', t: 'Mi barca está en el tejado de la posada. {p:0.4}No sé si reírme o llorar.' }];
  T.superviviente2 = [{ say: '@npc', e: 'neutral', t: 'Desde aquí arriba se ve todo. {p:0.3}El mar ya no tiene orilla: {p:0.3}solo sigue y sigue.' }];
  T.superviviente3 = [{ say: '@npc', e: 'happy', t: '¡Ahora la plaza es una isla! {p:0.3}…Mamá dice que no es divertido.' }];
  T.oriel = [{ say: '@npc', e: 'neutral', name: 'Oriel', t: '«Uno del mar volverá al mar.» {p:0.4}Las profecías no se equivocan, muchacho. {p:0.3}Pero a veces se dejan interpretar.' }];
  T.herrero_hondaroca = [{ say: '@npc', e: 'sad', name: 'Herrero', t: 'Salvamos los fuelles y poco más. {p:0.4}Si el Padre Yunque se calma, quizá podamos volver a forjar.' }];
})();
