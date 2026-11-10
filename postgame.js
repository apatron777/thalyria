// POSTGAME · El Abismo de la Crecida, el Leviatán Primordial y las Cartas de Elara.
// Tras los créditos emerge al sur el islote del Abismo. Durante el viaje, Elara dejó cartas en el pasado
// («lo que se deja en el pasado, espera»): cuatro brillan en las épocas antiguas y la quinta la guarda el Leviatán.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, M = D.maps;

  // ---------- bestiario ----------
  Object.assign(D.enemies, {
    cria_leviatan: { name: 'Cría de Leviatán', sprite: 'cria_leviatan', hp: 2300, atk: 112, def: 50, mag: 90, res: 46, spd: 13, exp: 2600, gold: 700, markH: 32,
      weak: { Luz: 1.3, Impacto: 1.2 }, resist: { Agua: 0.4 }, drops: [{ item: 'tonico_plus', chance: 0.6 }],
      actions: { mordida: { name: 'Mordida abisal', kind: 'phys', power: 1.1, target: 'one', pick: 'weakest' }, coraza: { name: 'Escamas', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 2 } } },
      ai: [{ act: 'coraza', if: 'self<0.5', cooldown: 4 }, { act: 'mordida' }] },
    medusa_primordial: { name: 'Medusa primordial', sprite: 'medusa_primordial', hp: 2000, atk: 98, def: 40, mag: 112, res: 52, spd: 15, exp: 2500, gold: 680, markH: 24, flying: true,
      weak: { Fuego: 1.3, Corte: 1.2 }, resist: { Agua: 0.4, Luna: 0.7 }, drops: [{ item: 'agua_luna', chance: 0.5 }],
      actions: { latigo: { name: 'Látigo urticante', kind: 'phys', power: 1.0, target: 'one' }, marea: { name: 'Marea del origen', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' } },
      ai: [{ act: 'marea', every: 2 }, { act: 'latigo' }] },
    eco_primordial: { name: 'Eco primordial', sprite: 'eco_primordial', hp: 2600, atk: 116, def: 44, mag: 116, res: 50, spd: 18, exp: 3200, gold: 820, markH: 30, flying: true,
      weak: { Luz: 1.3 }, resist: { Agua: 0.5 }, drops: [{ item: 'tonico_plus', chance: 0.6 }],
      actions: { ala: { name: 'Ala del diluvio', kind: 'phys', power: 1.15, target: 'one', pick: 'weakest' }, grito: { name: 'Canto de la crecida', kind: 'mag', power: 1.05, target: 'all', fx: 'storm' } },
      ai: [{ act: 'grito', every: 2 }, { act: 'ala' }] },
    // superjefe: pensado para Nv 40+, con sus aletas cubriéndole
    leviatan: { name: 'Leviatán Primordial', title: 'El que estaba antes del mar', sprite: 'leviatan', scale: 3.2, boss: true, big: true, markH: 70,
      hp: 13000, atk: 104, def: 48, mag: 100, res: 44, spd: 11, exp: 40000, gold: 20000,
      weak: { Luz: 1.3, Impacto: 1.2 }, resist: { Agua: 0.3, Luna: 0.8 },
      actions: {
        fauces: { name: 'Fauces del principio', kind: 'phys', power: 1.35, target: 'one', pick: 'weakest' },
        diluvio: { name: 'Diluvio', kind: 'mag', power: 1.1, target: 'all', fx: 'wave' },
        cola: { name: 'Coletazo', kind: 'phys', power: 1.0, target: 'all' },
        crecida: { name: 'La Crecida', kind: 'mag', power: 1.8, target: 'all', fx: 'storm' },
        llamar: { name: 'Llamar a la cría', kind: 'summon', summon: 'cria_leviatan', target: 'self' },
        mudar: { name: 'Mudar la piel', kind: 'heal', heal: 0.05, target: 'self' },
      },
      ai: [{ act: 'crecida', every: 5 }, { act: 'diluvio', every: 3 }, { act: 'cola', every: 2 }, { act: 'fauces' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Leviatán Primordial', t: '{s:0.6}Antes de vuestras islas, antes del Abisal, antes del tiempo… {p:0.5}{*yo era la marea*}.' },
          { name: 'Kaelen', t: 'Y esa carta no es tuya. {p:0.4}Apártate.' },
        ] },
        { at: 0.6, music: 'jefe2', revive: 0.6, dialog: [
          { name: 'Leviatán Primordial', t: 'Aletas del origen, {p:0.3}{*volved a cubrirme*}.' },
        ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 5 }, { act: 'crecida', every: 4 }, { act: 'diluvio', every: 2 }, { act: 'fauces' }] },
        { at: 0.25, music: 'final', dialog: [
          { name: 'Leviatán Primordial', t: '{~Pequeños… {p:0.3}habéis hecho andar el sol.~} {p:0.5}Entonces mostradme que merecéis el mañana.' },
          { name: 'Flint', t: '¡Ánimo! {p:0.3}¡Es solo un pez muy grande con muy mal carácter! {p:0.4}…Muy, muy grande.' },
        ], ai: [{ act: 'mudar', if: 'self<0.12', cooldown: 8 }, { act: 'crecida', every: 3 }, { act: 'cola', every: 2 }, { act: 'fauces' }] },
      ] },
    aleta_izq: { name: 'Aleta del origen', sprite: 'aleta', part: true, markH: 34, hp: 1800, atk: 100, def: 46, mag: 30, res: 40, spd: 10, exp: 800, gold: 0,
      weak: { Corte: 1.3 }, resist: { Agua: 0.4 },
      actions: { golpe: { name: 'Aletazo', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Cubrir', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    aleta_der: { name: 'Aleta de la crecida', sprite: 'aleta', part: true, markH: 34, hp: 1800, atk: 100, def: 46, mag: 30, res: 40, spd: 11, exp: 800, gold: 0,
      weak: { Corte: 1.3 }, resist: { Agua: 0.4 },
      actions: { golpe: { name: 'Aletazo', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Cubrir', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
  });
  TH.foeVariant('cria_leviatan', 'cangrejo', 180, 1.3, 0.65, '#021018');
  TH.foeVariant('medusa_primordial', 'larva', 290, 1.5, 0.9, '#140424');
  TH.foeVariant('eco_primordial', 'gaviota', 170, 1.4, 0.6, '#02121a');
  TH.foeVariant('leviatan', 'larva', 185, 1.4, 0.55, '#010a12');
  TH.foeVariant('aleta', 'pinza', 185, 1.3, 0.6, '#010a12');

  // ---------- objetos ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  ['I', 'II', 'III', 'IV', 'V'].forEach((n, i) => add('carta_' + (i + 1), { name: 'Carta de Elara ' + n, type: 'key', desc: 'Papel de la Ciudad Dorada, letra apretada de Elara. Huele a sal.' }));
  add('escama_primordial', { name: 'Escama primordial', type: 'acc', price: 0, stats: { hp: 160, def: 16, res: 16, atk: 10, mag: 10 }, desc: 'Una escama del Leviatán. Pesa como un ancla y no pesa nada.' });
  add('lazo_elara', { name: 'Lazo de Elara', type: 'acc', price: 0, stats: { mp: 40, mag: 18, spd: 8, res: 10 }, desc: 'El lazo azul que Elara llevaba en el pelo. Lo dejó con la última carta.' });

  // ---------- mapa: el Abismo de la Crecida ----------
  const ABI = 'juego.fin';
  M.abismo = {
    id: 'abismo', name: 'Abismo de la Crecida', sub: 'Donde nació el mar', music: 'abismo',
    w: 36, h: 28, baseHeight: 1, baseTerrain: 's', clouds: false, dark: 0.82, ambient: 'bubble',
    heightRects: [[0, 0, 36, 2, 0], [0, 26, 36, 2, 0], [0, 0, 2, 28, 0], [34, 0, 2, 28, 0], [6, 17, 5, 4, 0], [25, 17, 5, 4, 0], [4, 5, 28, 8, 2], [12, 3, 12, 4, 3]],
    terrainRects: [[0, 0, 36, 2, '~'], [0, 26, 36, 2, '~'], [0, 0, 2, 28, '~'], [34, 0, 2, 28, '~'], [6, 17, 5, 4, '~'], [25, 17, 5, 4, '~'],
      [4, 5, 28, 8, 'r'], [12, 3, 12, 4, 'r'], [17, 13, 2, 1, 'S'], [17, 7, 2, 1, 'S'], [17, 14, 2, 10, 'p'], [14, 8, 8, 4, 'p']],
    tiles: [],
    props: [['altar', 18, 3.4], ['lamp', 13, 4], ['lamp', 23, 4], ['lamp', 5, 6], ['lamp', 30, 6], ['lamp', 15, 13], ['lamp', 21, 13], ['lamp', 15, 21], ['lamp', 21, 21], ['lamp', 6, 22], ['lamp', 30, 22], ['coral', 3, 15, { v: 1 }], ['coral', 32, 15, { v: 0 }], ['coral', 13, 22, { v: 1 }], ['coral', 23, 22, { v: 0 }],
      ['rock', 4, 24], ['rock', 31, 24], ['rock', 12, 16], ['rock', 24, 16], ['gem2', 8, 8], ['gem', 27, 8], ['gem2', 3, 20], ['gem', 32, 20], ['pine', 9, 23], ['pine', 27, 23]],
    zones: [{ rect: [0, 0, 36, 28], tint: [0.62, 0.8, 1.2] }, { rect: [12, 2, 12, 6], tint: [0.8, 0.7, 1.25] }],
    npcs: [],
    foes: [
      { group: ['cria_leviatan', 'medusa_primordial'], patrol: [[5, 15], [12, 15]], sight: 4.5 },
      { group: ['medusa_primordial', 'medusa_primordial'], patrol: [[24, 15], [31, 15]], sight: 4.5 },
      { group: ['eco_primordial', 'cria_leviatan'], patrol: [[6, 10], [14, 10]], sight: 5 },
      { group: ['eco_primordial', 'medusa_primordial'], patrol: [[22, 10], [30, 10]], sight: 5 },
      { group: ['cria_leviatan', 'eco_primordial', 'cria_leviatan'], patrol: [[14, 19], [22, 19]], sight: 4 },
    ],
    triggers: [
      { rect: [15, 22, 6, 3], once: 'abismo.llegada', script: 'post.llegada' },
      { rect: [13, 3, 10, 5], once: 'post.leviatan', if: '!jefe.leviatan', script: 'post.leviatan', cinematic: true },
    ],
    chests: [
      { id: 'abi_oeste', c: 3, r: 23, give: 'tonico_plus', n: 6 },
      { id: 'abi_este', c: 32, r: 23, give: 'gold', n: 12000 },
      { id: 'abi_terraza', c: 5, r: 7, give: 'agua_luna', n: 6 },
      { id: 'abi_sima', c: 30, r: 11, give: 'manto_instante' },
    ],
    signs: [{ c: 21.4, r: 3.6, prop: 'gem2', script: 'post.carta5', name: 'Carta' }],
    boats: [{ c: 21, r: 25.2, port: 'abismo', reach: 26 }],
    start: { c: 18, r: 24 },
    entries: { muelle: { c: 18, r: 24.2, dir: 'up' } },
    exits: [],
  };

  // ---------- las cartas, escondidas en el pasado ----------
  const carta = (n, c, r) => ({ c, r, prop: 'gem2', script: 'post.carta' + n, name: 'Carta' });
  const past = (id) => M[id].epochs.past;
  past('ciudad').signs = (past('ciudad').signs || []).concat([carta(1, 31.4, 23)]);
  past('biblioteca').signs = (past('biblioteca').signs || []).concat([carta(2, 12, 3.4)]);
  past('jardin').signs = (past('jardin').signs || []).concat([carta(3, 7, 5)]);
  past('congelada').signs = (past('congelada').signs || []).concat([carta(4, 11, 1.4)]);

  // ---------- mundo: el islote del sur emerge ----------
  const W = D.world, sur = W.islands.find((i) => i.id === 'sur');
  if (sur) { sur.unlock = ABI; Object.defineProperty(sur, 'name', { get() { return TH.flags.get(ABI) ? 'Abismo de la Crecida' : '???'; }, configurable: true }); }
  if (!W.ports.find((p) => p.id === 'abismo')) W.ports.push({ id: 'abismo', name: 'Abismo de la Crecida', island: 'sur', x: 284, y: 170, zone: 'abismo', entry: 'muelle', unlock: ABI });
  Object.assign(W.routes, { 'bruma>abismo': [[150, 162], [214, 172], [262, 176]], 'cala>abismo': [[236, 120], [270, 150]], 'torre>abismo': [[226, 186], [262, 178]], 'hondaroca>abismo': [[244, 90], [276, 140]] });

  // ---------- guion ----------
  const LEER = (n, lines) => [
    { if: '!' + ABI, then: [{ say: 'none', t: 'Un destello plateado entre las piedras. {p:0.4}Al acercarte, se desvanece. {p:0.3}Todavía no es su momento.' }], else: [
      { if: 'carta.' + n, then: [{ say: 'none', t: 'Aquí estaba la ' + ['primera', 'segunda', 'tercera', 'cuarta', 'quinta'][n - 1] + ' carta de Elara. {p:0.3}La guardas con las demás.' }], else: [
        { set: { ['carta.' + n]: true } }, { add: 'cartas' },
        { say: 'none', t: 'Entre las piedras del pasado, un sobre plateado que no estaba ahí antes. {p:0.4}Lleva tu nombre.' },
        { give: 'carta_' + n },
      ].concat(lines.map((t) => ({ say: 'voice', name: 'Carta de Elara', t }))).concat([{ toast: 'Carta de Elara guardada · las tienes en Objetos' }]) },
    ] },
  ];
  S['post.carta1'] = LEER(1, [
    'Kaelen: {p:0.3}si estás leyendo esto, el día terminó. {p:0.4}Ithra me contó que lo que se deja en el pasado {*espera*}. {p:0.3}Así que voy a dejarte cartas, como dejaba mi madre faroles en el muelle para las barcas que tardaban.',
    'Hoy he visto tu ciudad viva. {p:0.4}Tú mirabas el balcón de tu madre y no te diste cuenta de que llorabas. {p:0.3}Yo sí. {p:0.4}No te lo dije. {p:0.3}Te lo digo ahora, mil años después.',
  ]);
  S['post.carta2'] = LEER(2, [
    'He leído la profecía entera en la Biblioteca. {p:0.4}«Uno del mar volverá al mar.» {p:0.5}No te la he enseñado.',
    'Creo que ya sé que, si alguien tiene que ir, quiero ser yo. {p:0.4}No por valiente. {p:0.3}Porque tú tienes que ver el sol moverse. {p:0.4}Llevas toda la vida esperándolo, aunque no lo recuerdes.',
  ]);
  S['post.carta3'] = LEER(3, [
    'Flint dice que escribir cartas al futuro es de gente con demasiado tiempo libre. {p:0.4}Le he recordado que tenemos un día entero de sobra. {p:0.4}Se ha reído tanto que se ha caído al estanque del jardín.',
    'Me gusta este grupo, Kaelen. {p:0.4}Firion vigila hasta cuando duerme. {p:0.3}Oslo cuenta las mareas con los dedos. {p:0.3}Y tú… {p:0.4}tú sigues adelante aunque todo pese. {p:0.4}Quiero que eso no se acabe nunca.',
  ]);
  S['post.carta4'] = LEER(4, [
    'Firion se ha quedado sosteniendo la puerta. {p:0.4}Oslo me mira como si supiera algo que yo no sé.',
    'Escucha: la última carta te espera {*donde nació el mar*}, en el Abismo de la Crecida, al sur. {p:0.4}Allí abajo duerme algo más viejo que el Abisal. {p:0.3}No vayas solo. {p:0.4}Nunca vayas solo.',
  ]);
  S['post.carta5'] = [
    { if: '!jefe.leviatan', then: [{ say: 'none', t: 'Un sobre plateado, hundido en la roca del altar. {p:0.3}Algo enorme se mueve bajo tus pies.' }], else: [
      { if: 'carta.5', then: [{ say: 'none', t: 'Aquí encontraste la última carta de Elara.' }], else: [
        { if: ['carta.1', 'carta.2', 'carta.3', 'carta.4'], else: [{ say: 'none', t: 'Un sobre plateado, sellado con lacre. {p:0.4}No se abre. {p:0.3}Parece esperar a sus hermanas, escondidas en el pasado.' }], then: [
          { set: { 'carta.5': true } }, { add: 'cartas' }, { give: 'carta_5' },
          { music: 'grupo' },
          { if: 'final=A', then: [
            { say: 'voice', name: 'Carta de Elara', t: 'Kaelen. {p:0.4}Si has llegado hasta aquí, es que el Leviatán ya duerme. {p:0.4}Era él quien no dejaba subir la marea del tiempo.' },
            { say: 'voice', name: 'Carta de Elara', t: 'Estoy bien. {p:0.3}El mar del tiempo es como el de casa, solo que más hondo. {p:0.4}Con el camino libre, la próxima pleamar me traerá. {p:0.4}{*Espérame en la playa.*}' },
            { call: 'post.cartas.todas' },
          ], else: [
            { say: 'voice', name: 'Carta de Elara', t: 'Kaelen. {p:0.4}Si al final fue Oslo… {p:0.4}no te culpes. {p:0.3}Lo decidió mucho antes que tú. {p:0.4}Me lo dijo en la barca, la primera noche: {p:0.3}«Si alguien ha de remar hasta el final, que sea un viejo».' },
            { say: 'voice', name: 'Carta de Elara', t: 'Escribí esta por si era yo la que se iba. {p:0.4}Si la lees conmigo al lado, {p:0.3}tírame del lazo. {p:0.4}Y vamos juntos a dejarle un farol en el muelle.' },
            { call: 'post.cartas.todas' },
          ] },
        ] },
      ] },
    ] },
  ];
  S['post.cartas.todas'] = [
    { fade: 1, time: 1.2, color: '#fff6dc' },
    { set: { 'post.cartas': true } },
    { give: 'lazo_elara', quiet: true },
    { warp: 'brumaSalada', at: [33, 8.1], dir: 'down', hour: 6.2 },
    { music: 'grupo' },
    { cam: [33, 5] },
    { fade: 0, time: 2 },
    { if: 'final=A', then: [
      { say: 'none', t: 'A la mañana siguiente, la marea sube más que nunca en la playa de Bruma Salada. {p:0.5}Y con ella, algo plateado.' },
      { join: 'elara' },
      { say: 'elara', e: 'happy', t: 'Te dije que antes de once años. {p:0.5}…Ha sido uno y un poco.' },
      { say: 'kaelen', e: 'happy', t: 'Bienvenida a casa, Elara.' },
    ], else: [
      { say: 'none', t: 'Esa noche, Kaelen y Elara dejan un farol encendido en el muelle. {p:0.5}Lejos, sobre el mar, otra luz pequeña responde. {p:0.4}Una, dos, tres veces. {p:0.4}Como un remo.' },
      { say: 'elara', e: 'happy', t: 'Encargo hecho, viejo tonto.' },
    ] },
    { say: 'none', t: 'Has reunido las {*cinco Cartas de Elara*}. {p:0.3}Has obtenido el {*Lazo de Elara*}.' },
    { chapter: 'Epílogo secreto', title: 'Las Cartas de Elara', sub: '100% · Gracias por jugar hasta el final', time: 4 },
    { save: true },
  ];
  S['post.llegada'] = [
    { bars: true },
    { say: 'none', t: 'El islote del sur no estaba aquí ayer. {p:0.4}Emergió con el primer amanecer del nuevo tiempo, como una ballena que sale a respirar.' },
    { say: 'flint', e: 'neutral', t: 'Escalones tallados bajo el agua. {p:0.4}Alguien construyó esto antes de que existiera el mar. {p:0.3}O el mar se lo tragó y ahora lo devuelve.' },
    { say: 'kaelen', e: 'neutral', t: 'Elara dijo que aquí nació el mar. {p:0.4}Y que abajo duerme algo más viejo que el Abisal.' },
    { bars: false },
    { toast: 'Postgame: sube al altar del Abismo · busca las Cartas de Elara en el pasado' },
  ];
  S['post.leviatan'] = [
    { bars: true },
    { cam: [18, 4], time: 1.2 },
    { shake: 6, time: 2.2, wait: false },
    { say: 'none', t: 'El altar se parte. {p:0.4}Bajo él no hay roca, sino un ojo. {p:0.4}Un ojo tan grande como la plaza de Vael.' },
    { say: 'none', t: 'Algo que dormía desde antes de que hubiera islas se despereza, y el agua del Abismo sube en espiral.' },
    { say: 'kaelen', e: 'angry', t: 'Detrás de él está la última carta. {p:0.4}Juntos.' },
    { heal: true },
    { battle: ['leviatan', 'aleta_izq', 'aleta_der'], at: [18, 5.2], once: 'jefe.leviatan', tips: 'sellos', after: 'post.leviatan.fin' },
  ];
  S['post.leviatan.fin'] = [
    { bars: true },
    { say: 'none', t: 'El Leviatán Primordial se hunde despacio, sin rabia. {p:0.4}Como alguien que por fin puede dormir.' },
    { say: 'none', name: 'Leviatán Primordial', t: '{s:0.6}El mar es vuestro, pequeños. {p:0.4}Cuidadlo mejor que yo.' },
    { give: 'escama_primordial' },
    { say: 'none', t: 'Sobre el altar roto, un sobre plateado brilla con la marea.' },
    { bars: false },
    { save: true },
  ];

  // al terminar los créditos: el grupo se reúne y el sur emerge
  S['final.creditos'].splice(S['final.creditos'].length - 2, 0,
    { if: 'final=A', then: [{ roster: ['kaelen', 'flint', 'firion', 'oslo'] }], else: [{ roster: ['kaelen', 'elara', 'flint', 'firion'] }] },
    { level: 'firion', lv: 32 },
    { set: { 'isla.sur': true } },
    { toast: 'Nuevo: el Abismo de la Crecida ha emergido al sur · Las Cartas de Elara esperan en el pasado' });

  // ---------- selector (modo pruebas) ----------
  const c8 = D.chapters.cap8;
  D.chapters.post = { name: 'Postgame', test: 'Tras el Final A · Nv 40', map: 'abismo', at: [18, 23.6], dir: 'up', hour: 10, day: 400,
    roster: ['kaelen', 'flint', 'firion', 'oslo'], levels: { kaelen: 40, elara: 40, flint: 40, firion: 40, oslo: 40 },
    equip: { kaelen: { weapon: 'lanza_aurelia', armor: 'manto_instante', acc: 'corona_farolera' }, firion: { weapon: 'espada_juramento', armor: 'manto_instante', acc: 'anillo_reloj' }, flint: { weapon: 'martillo_motor', armor: 'manto_instante', acc: 'guantes_forja' }, elara: { weapon: 'baston_marea_alta', armor: 'manto_farolero', acc: 'sello_real' }, oslo: {} },
    ecos: c8.ecos.concat(['eco_instante']), ecoSet: c8.ecoSet,
    inv: { tonico_plus: 20, agua_luna: 15 }, gold: 30000,
    flags: Object.assign({}, c8.flags, { 'cap8.llegada': true, 'final.fase1': true, 'final.fase2': true, 'final.fase3': true, final: 'A', 'juego.final': true, 'juego.fin': true, 'mar.subido': false, 'isla.sur': true, 'varek.libre': true, objetivo: 'fin' }) };
})();
