// GUION · Capítulo 7 «Los cuatro faros».
// Oslo, el barquero de las mareas, se une como invitado · la Aldea de los Faroleros, hogar de Elara · Elara cena con sus padres
// · la Torre del Motor: un faro por personaje · Ithra revela el origen de Kaelen · Varek pilota el Coloso de guerra.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, T = D.talk;

  // ---------- Oslo, invitado ----------
  const C = TH.chars.defs, fl = C.flint;
  C.oslo = Object.assign({}, fl, {
    id: 'oslo', name: 'Oslo', hair: 'beard', m: Object.assign({}, fl.m, { leg: 14, torso: 15, sw: 18, headW: 14 }),
    pal: Object.assign({}, fl.pal, { skin: ['#8a5a40', '#b07a58'], hair: ['#9aa4b0', '#c8d0d8', '#eef2f6'], beard: '#dfe6ec', top: ['#1a3a4a', '#2a5a6a', '#4a8a9a'], legs: ['#2a2a34', '#3a3a46'], belt: '#6a4a2a', outline: '#0e1418' }),
    chains: [], portrait: Object.assign({}, fl.portrait || {}, { hair: 'boatman' }),
  });
  if (TH.chars.PARTY.indexOf('oslo') < 0) TH.chars.PARTY.push('oslo');
  D.party.oslo = { base: { hp: 70, mp: 8, atk: 12, def: 10, mag: 3, res: 5, spd: 4 }, grow: { hp: 10, mp: 1, atk: 2, def: 2, mag: 0, res: 1, spd: 0 }, equip: { weapon: 'ancla_oslo', armor: 'chaqueta_lona', acc: null } };
  D.basic.oslo = ['Impacto'];
  D.skills.oslo = [
    { id: 'ancla', name: 'Ancla de las mareas', mp: 5, kind: 'phys', power: 1.6, types: ['Impacto', 'Agua'], area: 'one', desc: 'Lanza el ancla y la recoge con lo que encuentre.' },
    { id: 'remolino', name: 'Remolino', mp: 7, kind: 'phys', power: 0.9, types: ['Agua'], area: 'all', desc: 'Hace girar el mar alrededor de los enemigos.' },
  ];
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('ancla_oslo', { name: 'Ancla de Oslo', type: 'weapon', who: ['oslo'], price: 0, stats: { atk: 30, def: 4 }, desc: 'Cuarenta años arrastrándola por el fondo del mar.', unleash: { name: 'Fondeo', power: 2.8, types: ['Impacto', 'Agua'] } });

  // ---------- bestiario ----------
  Object.assign(D.enemies, {
    farol_errante: { name: 'Farol errante', sprite: 'farol_errante', hp: 900, atk: 74, def: 30, mag: 78, res: 34, spd: 14, exp: 700, gold: 240, markH: 24, flying: true,
      weak: { Agua: 1.4, Luna: 1.2 }, resist: { Fuego: 0.4, Luz: 0.6 }, drops: [{ item: 'agua_luna', chance: 0.4 }],
      actions: { llama: { name: 'Llama fatua', kind: 'mag', power: 1.0, target: 'one' }, destello: { name: 'Destello', kind: 'mag', power: 0.85, target: 'all', fx: 'storm' } },
      ai: [{ act: 'destello', every: 3 }, { act: 'llama' }] },
    farol_corrupto: { name: 'Farol corrupto', sprite: 'farol_corrupto', hp: 1250, atk: 82, def: 32, mag: 86, res: 36, spd: 15, exp: 980, gold: 330, markH: 24, flying: true,
      weak: { Agua: 1.4, Luna: 1.2 }, resist: { Fuego: 0.4, Luz: 0.6 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { llama: { name: 'Llama negra', kind: 'mag', power: 1.1, target: 'one', pick: 'weakest' }, destello: { name: 'Faro apagado', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' } },
      ai: [{ act: 'destello', every: 2 }, { act: 'llama' }] },
    guardian_marea: { name: 'Guardián de marea', sprite: 'guardian_marea', hp: 1100, atk: 84, def: 46, mag: 30, res: 30, spd: 6, exp: 760, gold: 260, markH: 32,
      weak: { Impacto: 1.3, Luz: 1.2 }, resist: { Corte: 0.6, Agua: 0.5 }, drops: [{ item: 'concha', chance: 0.6 }],
      actions: { pinza: { name: 'Pinza de marea', kind: 'phys', power: 1.0, target: 'one' }, ola: { name: 'Ola', kind: 'phys', power: 0.8, target: 'all' } },
      ai: [{ act: 'ola', every: 3 }, { act: 'pinza' }] },
    guardian_abismo: { name: 'Guardián del abismo', sprite: 'guardian_abismo', hp: 1500, atk: 92, def: 52, mag: 34, res: 32, spd: 5, exp: 1080, gold: 360, markH: 32,
      weak: { Impacto: 1.3, Luz: 1.2 }, resist: { Corte: 0.6, Agua: 0.5 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { pinza: { name: 'Pinza abisal', kind: 'phys', power: 1.15, target: 'one', pick: 'weakest' }, coraza: { name: 'Coraza de abismo', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 2 } } },
      ai: [{ act: 'coraza', if: 'self<0.5', cooldown: 4 }, { act: 'pinza' }] },
    coloso_guerra: { name: 'Coloso de guerra', title: 'Pilotado por Varek', sprite: 'coloso_guerra', boss: true, big: true, markH: 56,
      hp: 4300, atk: 60, def: 28, mag: 56, res: 26, spd: 8, exp: 9000, gold: 4000,
      weak: { Agua: 1.25, Impacto: 1.15 }, resist: { Fuego: 0.5, Corte: 0.8 }, drops: [{ item: 'tonico_plus', chance: 1 }],
      actions: {
        aplastar: { name: 'Puño de guerra', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        barrido: { name: 'Barrido', kind: 'phys', power: 0.9, target: 'all' },
        vapor: { name: 'Escape de vapor', kind: 'mag', power: 1.0, target: 'all', fx: 'storm' },
        reparar: { name: 'Reparación de emergencia', kind: 'heal', heal: 0.06, target: 'self' },
        canon: { name: 'Cañón del Motor', kind: 'mag', power: 1.6, target: 'all', fx: 'wave' },
      },
      ai: [{ act: 'vapor', every: 3 }, { act: 'barrido', every: 2 }, { act: 'aplastar' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Varek', t: 'Un Coloso de guerra de Thalyria. {p:0.4}La reina lo construyó para luchar contra el Abisal… {p:0.3}y nunca llegó a usarlo.' },
          { name: 'Varek', t: 'Yo sí. {p:0.4}Apartaos del Motor, Alteza. {p:0.3}O apartaré yo los faros.' },
        ] },
        { at: 0.6, music: 'jefe2', revive: 0.6, sprite: 'coloso_guerra2', dialog: [
          { name: 'Varek', t: '¡Puños reparados! {p:0.4}Esta máquina aguantó mil años bajo el mar. {p:0.3}{*Aguantará cuatro niños.*}' },
          { name: 'Firion', t: '¡Varek! {p:0.3}¡Sal de ahí y lucha como un vigía!' },
        ], ai: [{ act: 'reparar', if: 'self<0.45', cooldown: 6 }, { act: 'canon', every: 3 }, { act: 'vapor', every: 2 }, { act: 'aplastar' }] },
        { at: 0.3, music: 'jefe2', dialog: [
          { name: 'Varek', t: '{~¡La cabina se abre!~} {p:0.3}No importa. {p:0.4}{*Todo a la caldera.*}' },
          { name: 'Oslo', t: '¡Ahora, chicos! {p:0.3}¡Cuando una barca hace agua, se hunde deprisa!' },
        ], ai: [{ act: 'canon', every: 2 }, { act: 'barrido', every: 2 }, { act: 'aplastar' }] },
      ] },
    puno_izq: { name: 'Puño izquierdo', sprite: 'puno', part: true, markH: 34, hp: 600, atk: 54, def: 30, mag: 10, res: 20, spd: 8, exp: 200, gold: 0,
      weak: { Agua: 1.3 }, resist: { Fuego: 0.5 },
      actions: { golpe: { name: 'Directo', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Guardia de bronce', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    puno_der: { name: 'Puño derecho', sprite: 'puno', part: true, markH: 34, hp: 600, atk: 54, def: 30, mag: 10, res: 20, spd: 9, exp: 200, gold: 0,
      weak: { Agua: 1.3 }, resist: { Fuego: 0.5 },
      actions: { golpe: { name: 'Crochet', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Guardia de bronce', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
  });
  TH.foeVariant('farol_errante', 'larva', 70, 1.6, 1.3, '#2a1a04');
  TH.foeVariant('farol_corrupto', 'larva', 20, 1.5, 0.75, '#1a0602');
  TH.foeVariant('guardian_marea', 'cangrejo', 165, 1.0, 0.9, '#04161a');
  TH.foeVariant('guardian_abismo', 'cangrejo', 195, 1.1, 0.55, '#020a10');
  TH.foeVariant('coloso_guerra', 'karkinos', 350, 0.8, 0.7, '#1a0408');
  TH.foeVariant('coloso_guerra2', 'karkinos2', 345, 1.0, 0.75, '#1e0206');
  TH.foeVariant('puno', 'pinza', 350, 0.8, 0.7, '#1a0408');

  // ---------- equipo, Eco, tienda y puerto ----------
  add('lanza_farolera', { name: 'Lanza de los faroleros', type: 'weapon', who: ['kaelen'], price: 3400, stats: { atk: 35, mag: 6, spd: 3 }, desc: 'Su punta es un farol diminuto que nunca se apaga.', unleash: { name: 'Farol del alba', power: 3.2, types: ['Corte', 'Luz'] } });
  add('espada_farolera', { name: 'Espada de la última guardia', type: 'weapon', who: ['firion'], price: 3300, stats: { atk: 35, def: 6 }, desc: 'Los faroleros la guardaban para «el vigía que volviera».', unleash: { name: 'Guardia eterna', power: 3.2, types: ['Corte', 'Luz'] } });
  add('baston_farolero', { name: 'Bastón de Lía', type: 'weapon', who: ['elara'], price: 0, stats: { atk: 4, mag: 33, res: 5 }, desc: 'El bastón de la madre de Elara. Huele a lavanda y a mar.', unleash: { name: 'Nana de la luna', power: 3.2, types: ['Luna', 'Agua'] } });
  add('manto_farolero', { name: 'Manto farolero', type: 'armor', price: 3000, stats: { def: 31, res: 16 }, desc: 'Tejido para aguantar noches enteras junto a una llama.' });
  add('corona_farolera', { name: 'Corona de faros', type: 'acc', price: 2800, stats: { atk: 6, mag: 6, res: 4 }, desc: 'Cuatro pequeñas luces, una por cada faro.' });
  D.ecos.eco_farolero = { id: 'eco_farolero', name: 'Eco del Farolero', el: 'Luz', color: '#ffd27a', stats: { mag: 5, res: 3, spd: 2 }, desc: 'Lo encendió el primer farolero de la aldea. Aún no se ha apagado.',
    release: { name: 'Cuatro luces', kind: 'mag', power: 2.4, types: ['Luz', 'Fuego'], area: 'all', desc: 'Cuatro haces de luz sobre todos los enemigos.' } };
  D.shops.faroleros = { name: 'La farolera', stock: ['tonico_plus', 'agua_luna', 'lanza_farolera', 'espada_farolera', 'manto_farolero', 'martillo_estrella', 'coraza_coral'] };
  const W = D.world;
  if (!W.ports.find((p) => p.id === 'torre')) W.ports.push({ id: 'torre', name: 'Aldea de los Faroleros', island: 'hundida', x: 206, y: 186, zone: 'faroleros', entry: 'muelle', unlock: 'isla.hundida' });
  Object.assign(W.routes, { 'bruma>torre': [[150, 162], [186, 182]], 'hondaroca>torre': [[240, 90], [246, 150], [222, 182]], 'cala>torre': [[232, 130], [224, 170]] });
  D.maps.brumaInundada.boats = [{ c: 20.4, r: 24.6, port: 'bruma', reach: 26 }];

  // ---------- selector ----------
  const c6 = D.chapters.cap6;
  const f7 = Object.assign({}, c6.flags, { 'mar.subido': true, 'isla.norte': true, 'isla.hundida': true, 'inundada.muelle': true, 'hondaroca.llegada': true, 'cap6.profecia': true, 'cap6.jefe': true, 'jefe.coloso': true, 'cap6.fin': true, objetivo: 'cap7' });
  D.chapters.cap7 = { name: 'Capítulo 7', test: 'Grupo Nv 23 + Oslo', map: 'hondaroca', at: [18, 21.6], dir: 'down', hour: 9, day: 11,
    roster: ['kaelen', 'elara', 'flint', 'firion'], levels: { kaelen: 23, elara: 23, flint: 23, firion: 23, oslo: 23 },
    equip: { kaelen: { weapon: 'lanza_abisal', armor: 'coraza_coral', acc: 'anillo_profecia' }, firion: { weapon: 'espada_abisal', armor: 'coraza_coral', acc: 'anillo_reloj' }, flint: { weapon: 'martillo_hondaroca', armor: 'coraza_coral', acc: 'guantes_forja' }, elara: { weapon: 'cetro_marea', armor: 'manto_estrella', acc: 'sello_real' } },
    ecos: c6.ecos.concat(['eco_forja']), ecoSet: { kaelen: ['eco_alba', 'eco_brasa'], firion: ['eco_vendaval', 'eco_bronce'], elara: ['eco_luna', 'eco_reloj'], flint: ['eco_espuma', 'eco_raiz', 'eco_abismo', 'eco_forja'] },
    inv: { tonico_plus: 12, agua_luna: 10 }, gold: 8000, flags: f7, script: 'cap7.inicio' };
  S['cap6.fin'].push({ call: 'cap7.inicio' });

  // ======================================================================
  // CAPÍTULO 7 · Los cuatro faros
  // ======================================================================
  S['cap7.inicio'] = [
    { bars: true },
    { fade: 1, time: 0.8 },
    { warp: 'hondaroca', at: [18, 21.6], dir: 'down', hour: 9 },
    { roster: ['kaelen', 'elara', 'flint', 'firion'] },
    { chapter: 'Capítulo 7', title: 'Los cuatro faros', sub: 'Thalyria · El Día Detenido' },
    { cam: [18, 21] },
    { fade: 0, time: 1.4 },
    { say: 'none', name: '???', t: '{~¡Eh, los del muelle!~} {p:0.4}¿Alguno de vosotros sabe remar contra una corriente que va hacia arriba?' },
    { say: 'none', t: 'Una barca enorme atraca junto a la de Halvard. {p:0.4}La rema un hombre todavía más enorme, de barba blanca y con un ancla al hombro.' },
    { emote: 'elara', icon: '!', time: 1.0 },
    { say: 'elara', e: 'happy', t: '¿…Oslo? {p:0.4}¿Oslo el barquero?' },
    { say: 'kaelen', e: 'happy', t: '¡Oslo! {p:0.4}El que nos empujó hasta el Bosque.' },
    { say: 'oslo', e: 'happy', t: 'El mismo, Alteza. {p:0.4}Aquel encargo era vuestro. {p:0.3}Este es de Lía.' },
    { say: 'oslo', e: 'happy', t: '¡La pequeña de Lía y Taro! {p:0.4}La última vez que te vi me mordiste un dedo porque no te dejaba remar. {p:0.3}Tenías siete años.' },
    { say: 'flint', e: 'happy', t: 'Me cae bien. {p:0.3}Tiene un ancla. {p:0.4}La gente con ancla es gente de fiar.' },
    { say: 'oslo', e: 'neutral', t: 'La Torre del Motor ha salido del mar, y con ella la aldea de los faroleros, que estaba a su sombra. {p:0.4}Las corrientes de alrededor están locas. {p:0.3}Solo un barquero de mareas las cruza.' },
    { say: 'kaelen', e: 'neutral', t: 'Entonces ven con nosotros, Oslo.' },
    { say: 'oslo', e: 'neutral', t: 'Iba a ir de todos modos, Alteza. {p:0.4}Lía me pidió que le trajera a su hija. {p:0.3}Y yo nunca he dejado un encargo a medias.' },
    { roster: ['kaelen', 'oslo', 'elara', 'flint', 'firion'] },
    { level: 'oslo', lv: 23 },
    { say: 'none', t: '{*Oslo*} se une al grupo como invitado. {p:0.3}(Con cinco, luchan los cuatro primeros del orden; Q lo hace girar.)' },
    { say: 'elara', e: 'sad', t: 'Mis padres… {p:0.4}hace once años que no los veo. {p:0.3}Desde que me mandaron con Ilun a aprender la luna.' },
    { say: 'kaelen', e: 'neutral', t: 'Entonces vamos a verlos.' },
    { fade: 1, time: 1.0 },
    { set: { 'isla.hundida': true, objetivo: 'faroleros' } },
    { warp: 'faroleros', at: [16.5, 20], dir: 'up', hour: 17.8 },
    { fade: 0, time: 1.4 },
    { bars: false },
    { banner: ['Aldea de los Faroleros', 'A la sombra de la Torre del Motor'] },
    { save: true },
  ];
  S['cap7.llegada'] = [
    { say: 'elara', e: 'sad', t: 'La aldea sigue igual. {p:0.4}Los faroles en cada puerta. {p:0.3}El pozo. {p:0.4}La casa azul, junto al fuego…' },
    { say: 'oslo', e: 'neutral', t: 'Tu madre lleva tres días con la mesa puesta, pequeña. {p:0.4}Ve.' },
    { toast: 'Objetivo: la casa de los padres de Elara (este)' },
  ];
  S['cap7.cena'] = [
    { bars: true },
    { cam: [24, 13], time: 1.0 },
    { say: 'none', name: 'Lía', t: '…¿Elara?' },
    { say: 'elara', e: 'sad', t: 'Mamá.' },
    { say: 'none', t: 'Lía suelta el farol. {p:0.4}Taro deja caer la red. {p:0.4}Durante un momento largo, nadie dice nada.' },
    { say: 'none', name: 'Taro', t: 'Has crecido. {p:0.5}Te fuiste con una trenza y vuelves con un bastón. {p:0.4}Y con… {p:0.3}amigos.' },
    { say: 'flint', e: 'happy', t: 'Flint. {p:0.3}Herrero. {p:0.4}Huelo algo al fuego y quiero que sepan que acepto invitaciones.' },
    { say: 'none', name: 'Lía', t: 'Pasad. {p:0.4}Pasad todos. {p:0.3}He hecho sopa de pescado para un ejército.' },
    { fade: 1, time: 1.0 },
    { hour: 21, time: 0.1 },
    { place: 'kaelen', at: [25, 15], dir: 'left' },
    { cam: [25, 14.6] },
    { fade: 0, time: 1.4 },
    { say: 'none', t: 'Cenan junto al fuego, delante de la casa azul. {p:0.4}Los faroles de la aldea se encienden uno a uno.' },
    { say: 'none', name: 'Taro', t: 'Cuando nació, el farol de esta casa se encendió solo. {p:0.4}Ilun dijo que la luna la había elegido. {p:0.3}Por eso dejamos que se fuera.' },
    { say: 'none', name: 'Lía', t: 'Fue la decisión más difícil de nuestra vida. {p:0.4}Y la volvería a tomar. {p:0.3}Mírala.' },
    { say: 'elara', e: 'sad', t: 'Me caí al mar, mamá. {p:0.4}La marea del Fondo me llevó. {p:0.3}Pensé que no os volvería a ver.' },
    { say: 'none', name: 'Lía', t: 'Lo sé. {p:0.4}Esa noche se me apagó el farol. {p:0.3}Y una semana después volvió a encenderse. {p:0.4}Entonces supe que alguien te había ido a buscar.' },
    { face: 'kaelen', dir: 'left' },
    { say: 'kaelen', e: 'neutral', t: 'Ella hizo lo mismo por mí antes. {p:0.4}Solo le devolví el favor.' },
    { say: 'none', name: 'Taro', t: 'El chico de la lanza. {p:0.4}Oslo nos lo contó. {p:0.3}Mañana subís a la Torre, ¿verdad?' },
    { say: 'firion', e: 'neutral', t: 'Varek está allí. {p:0.4}Y el Motor.' },
    { say: 'none', name: 'Taro', t: 'La Torre tiene cuatro faros en su explanada. {p:0.4}Mi abuelo decía que cada uno solo lo enciende un tipo de corazón: {p:0.3}el que lanza, el que espera, el que carga y el que vigila.' },
    { say: 'flint', e: 'neutral', t: 'El que carga soy yo. {p:0.4}Siempre soy el que carga.' },
    { say: 'none', name: 'Lía', t: 'Elara. {p:0.4}Toma. {p:0.3}Era mío. {p:0.4}Me lo dio mi madre la noche antes de su primera guardia.' },
    { give: 'baston_farolero' },
    { say: 'elara', e: 'happy', t: 'Gracias, mamá. {p:0.5}…Esta vez volveré antes de once años. {p:0.3}Te lo prometo.' },
    { say: 'oslo', e: 'happy', t: 'Y si no vuelve, la traigo yo de una oreja. {p:0.4}Ya lo hice una vez.' },
    { fade: 1, time: 1.2 },
    { sleep: 8 },
    { set: { objetivo: 'torre' } },
    { place: 'kaelen', at: [24, 15.4], dir: 'up' },
    { cam: 'leader' },
    { fade: 0, time: 1.0 },
    { bars: false },
    { toast: 'Objetivo: sube a la Torre del Motor (norte de la aldea)' },
    { save: true },
  ];
  S['cap7.torre'] = [
    { say: 'none', t: 'La explanada de la Torre. {p:0.4}Cuatro faros apagados la rodean, uno en cada esquina, como los puntos de una brújula.' },
    { say: 'firion', e: 'neutral', t: 'El que lanza, el que espera, el que carga y el que vigila. {p:0.4}Uno para cada uno.' },
    { toast: 'Objetivo: enciende los cuatro faros (cada uno con su Resonancia)' },
  ];
  S['cap7.faro_kaelen'] = [{ flash: 0.4, color: '#fff0c0' }, { say: 'kaelen', e: 'neutral', t: 'El faro del Alba. {p:0.4}Arde igual que la lanza.' }];
  S['cap7.faro_elara'] = [{ flash: 0.4, color: '#d8e0ff' }, { say: 'elara', e: 'happy', t: 'El faro de la Luna. {p:0.4}Ha esperado a que el agua se fuera… {p:0.3}como mi madre esperaba en la puerta.' }];
  S['cap7.faro_flint'] = [{ flash: 0.4, color: '#ffb070' }, { say: 'flint', e: 'happy', t: 'El faro de la Forja. {p:0.4}¿Veis? {p:0.3}Cargar piedras también es un arte.' }];
  S['cap7.faro_firion'] = [{ flash: 0.4, color: '#e0f4ff' }, { say: 'firion', e: 'neutral', t: 'El faro del Vigía. {p:0.4}Gira. {p:0.3}Como siempre debió girar.' }];
  S['cap7.ithra'] = [
    { bars: true },
    { cam: [18, 4], time: 1.4 },
    { flash: 1.0, color: '#ffffff' },
    { say: 'none', t: 'Los cuatro faros lanzan su luz al centro de la explanada. {p:0.4}Sobre el altar, la luz toma forma de mujer.' },
    { refresh: true },
    { say: 'none', name: 'Ithra', t: 'Mil años. {p:0.4}Mil años esperando a que cuatro corazones distintos encendieran los cuatro faros a la vez.' },
    { say: 'none', name: 'Ithra', t: 'Soy Ithra, guardiana del Motor. {p:0.4}Fui la comadrona de la reina. {p:0.5}Yo traje a Kaelen al mundo.' },
    { say: 'kaelen', e: 'sad', t: '…¿Tú?' },
    { say: 'none', name: 'Ithra', t: 'Escucha, Alteza, porque nadie más vivo puede contártelo. {p:0.4}Naciste {*el día detenido*}. {p:0.3}En la torre, mientras el Abisal subía por las murallas.' },
    { say: 'none', name: 'Ithra', t: 'Tu primer llanto y el último latido del Motor fueron el mismo sonido. {p:0.5}Cuando la reina detuvo el tiempo, todo quedó quieto… {p:0.4}{*menos tú*}.' },
    { say: 'none', name: 'Ithra', t: 'Eres el único ser que siguió latiendo dentro del instante. {p:0.4}Por eso pudo llevarte la marea hacia el futuro. {p:0.3}Por eso la lanza te obedece.' },
    { say: 'none', name: 'Ithra', t: 'Tu corazón es el latido que le falta al Motor, Kaelen. {p:0.5}Para que el día vuelva a andar… {p:0.4}el Motor tendrá que oírlo.' },
    { say: 'elara', e: 'sad', t: '«Uno del mar volverá al mar»… {p:0.5}No. {p:0.3}No, no, no.' },
    { say: 'flint', e: 'angry', t: 'Un momento. {p:0.4}¿Me estáis diciendo que para arrancar el reloj hay que meterle el chico dentro? {p:0.3}Porque eso no lo pienso permitir.' },
    { say: 'none', name: 'Ithra', t: 'No he dicho cómo, herrero. {p:0.4}He dicho qué. {p:0.3}El cómo lo decidirá él.' },
    { say: 'oslo', e: 'neutral', t: 'Yo te conozco. {p:0.4}Hace cuarenta años, en mitad de una tormenta, me sacaste del agua. {p:0.3}«Rema», me dijiste. {p:0.3}«Te quedan encargos.»' },
    { say: 'none', name: 'Ithra', t: 'Y los has cumplido todos, barquero. {p:0.5}Todos menos uno.' },
    { shake: 6, time: 2.0, wait: false },
    { say: 'none', name: 'Varek', t: '{~¡Qué conmovedor!~} {p:0.4}Lástima que el cómo ya lo haya decidido yo.' },
    { say: 'none', t: 'Del mar emerge un gigante de bronce rojo con el pecho abierto como una cabina. {p:0.4}Dentro, a los mandos, Varek.' },
    { say: 'firion', e: 'angry', t: '¡Varek! {p:0.4}¡Baja de esa máquina!' },
    { say: 'none', name: 'Varek', t: 'El chico es la llave del Motor. {p:0.4}Y yo voy a girarla hacia el Fondo. {p:0.3}Entregádmelo… {p:0.4}o lo saco de entre vuestros restos.' },
    { say: 'oslo', e: 'angry', t: 'Cuarenta años en el mar, y nunca un cascarón tan feo. {p:0.4}A por él, Alteza.' },
    { heal: true },
    { battle: ['coloso_guerra', 'puno_izq', 'puno_der'], at: [18, 9], once: 'jefe.coloso_guerra', after: 'cap7.fin' },
  ];
  S['cap7.fin'] = [
    { bars: true },
    { refresh: true },
    { shake: 4, time: 1.4, wait: false },
    { say: 'none', t: 'El Coloso de guerra se derrumba sobre la explanada. {p:0.4}La cabina se abre y Varek cae de rodillas, herido.' },
    { say: 'varek', e: 'sad', t: 'Mil años bajo el mar… {p:0.4}y lo tumban un pescador, una niña, un herrero, un barquero… {p:0.3}y mi propio alumno.' },
    { say: 'firion', e: 'sad', t: 'Se acabó, capitán.' },
    { say: 'varek', e: 'neutral', t: 'No, Firion. {p:0.4}Mientras yo luchaba, el Abisal ha bebido la luz de los cuatro faros que acabáis de encender. {p:0.3}{*El Motor ya está despierto.*}' },
    { say: 'varek', e: 'happy', t: 'Nos veremos dentro, Alteza. {p:0.4}Allí el tiempo no corre… {p:0.3}y tendremos toda la eternidad para hablar.' },
    { flash: 0.6, color: '#1a0a20' },
    { say: 'none', t: 'Una ola negra se lo lleva hacia la boca de la Torre, que se abre como una garganta.' },
    { set: 'varek.torre' },
    { refresh: true },
    { say: 'none', name: 'Ithra', t: 'El Motor os espera, Alteza. {p:0.4}Y el Abisal con él. {p:0.3}Cuando estéis listos, la Torre os dejará entrar.' },
    { say: 'oslo', e: 'neutral', t: 'Aquí me quedo yo. {p:0.4}Alguien tiene que llevar a los faroleros a tierra si esto se hunde. {p:0.3}Pequeña: {p:0.3}una oreja, recuerda.' },
    { say: 'elara', e: 'happy', t: 'Una oreja, Oslo.' },
    { leave: 'oslo' },
    { say: 'none', t: '{*Oslo*} se despide del grupo.' },
    { say: 'kaelen', e: 'neutral', t: 'Mi corazón es el latido que le falta al Motor. {p:0.5}Entonces el Motor lo oirá… {p:0.4}a mi manera.' },
    { set: { 'cap7.fin': true, objetivo: 'cap8' } },
    { fade: 1, time: 1.4 },
    { chapter: 'Fin del Capítulo 7', title: 'Los cuatro faros', sub: 'Continuará' },
    { fade: 0, time: 1.2 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Fin del capítulo 7 · Partida guardada' },
    { save: true },
  ];

  // ---------- charlas ----------
  T.lia = [{ say: '@npc', e: 'happy', name: 'Lía', t: 'Once años poniendo un plato de más en la mesa. {p:0.4}Hoy por fin alguien se lo come.' }];
  T.taro = [{ say: '@npc', e: 'neutral', name: 'Taro', t: 'Cuida de ella, muchacho. {p:0.3}Y deja que ella cuide de ti. {p:0.4}Así funcionan los faros.' }];
  T.farolera = [{ say: '@npc', e: 'happy', name: 'Farolera', t: 'Mechas, aceite, armas para la Torre… {p:0.3}aquí se vende todo lo que alumbra.' }, { shop: 'faroleros' }];
  T.nino_farol = [{ say: '@npc', e: 'happy', t: '¡Elara ha vuelto! {p:0.3}¡Mi madre dice que es la farolera más famosa del mundo!' }];
  T.viejo_farol = [{ say: '@npc', e: 'neutral', t: 'La Torre salió del agua anoche, chorreando. {p:0.4}Ochenta años mirándola desde abajo… {p:0.3}y nunca la había visto entera.' }];
  T.ithra = [{ say: '@npc', e: 'neutral', name: 'Ithra', t: 'El Motor os espera, Alteza.' }];
  D.maps.torre.npcs.push({ id: 'varek', talk: 'varek', c: 18, r: 9, ai: 'idle', dir: 'down', if: ['jefe.coloso_guerra', '!varek.torre'] });
})();
