// FASE E · zonas intermedias de los capítulos 3 a 7, entre la llegada y el jefe (como la Hondonada del capítulo 2).
// Cada zona: un monstruo nuevo con diseño propio (y su versión mayor como guardián), un puzle con poderes de campo
// y un momento de historia al fondo. El sello del jefe del capítulo no se abre hasta completar la zona.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, E = D.enemies, M = D.maps, I = D.items;
  const addItem = (id, o) => { o.id = id; I[id] = o; };

  // ---------- monstruos ----------
  const foe = (id, o) => { E[id] = Object.assign({ def: 20, res: 20, spd: 9, markH: 34, actions: {}, ai: [] }, o); };
  const mk = (base, n, k) => ({ hp: Math.round(base.hp * k), atk: Math.round(base.atk * n), def: base.def, mag: Math.round(base.mag * n), res: base.res });
  // cap. 3
  foe('gargola_arena', { name: 'Gárgola de arena', sprite: 'gargola_arena', hp: 520, atk: 44, def: 26, mag: 28, res: 18, spd: 11, exp: 150, gold: 120, markH: 40,
    weak: { Agua: 1.35, Impacto: 1.2 }, resist: { Corte: 0.8 },
    actions: { garra: { name: 'Garra de piedra', kind: 'phys', power: 1.1, target: 'one' }, tormenta: { name: 'Tormenta de arena', kind: 'mag', power: 0.85, target: 'all', fx: 'storm' } },
    ai: [{ act: 'tormenta', every: 3 }, { act: 'garra' }], drops: [{ item: 'arena_dorada', chance: 0.5 }] });
  foe('gargola_reina', Object.assign({}, E.gargola_arena, mk(E.gargola_arena, 1.15, 3.6), { name: 'Gárgola mayor del Acueducto', title: 'Guarda la cisterna desde hace mil años', sprite: 'gargola_reina', boss: true, scale: 1.4, markH: 56, exp: 900, gold: 700,
    actions: Object.assign({}, E.gargola_arena.actions, { petrificar: { name: 'Mirada de piedra', kind: 'mag', power: 1.3, target: 'one', pick: 'weakest' }, alas: { name: 'Alas de arena', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 3 } } }),
    ai: [{ act: 'alas', every: 4 }, { act: 'tormenta', every: 3 }, { act: 'petrificar', every: 2 }, { act: 'garra' }], phases: [{ at: 1, music: 'jefe1', dialog: [{ name: 'Firion', t: 'Sus alas son de arena. {p:0.3}¡El agua se las deshace!' }] }, { at: 0.5, music: 'jefe1', dialog: [{ name: 'Gárgola mayor del Acueducto', t: '{~Krrrrsh…~}' }] }], drops: [{ item: 'arena_dorada', chance: 1 }] }));
  // cap. 4
  foe('jardinero', { name: 'Jardinero de relojería', sprite: 'jardinero', hp: 600, atk: 52, def: 30, mag: 30, res: 22, spd: 8, exp: 175, gold: 150, markH: 44,
    weak: { Agua: 1.3, Impacto: 1.25 }, resist: { Corte: 0.75 },
    actions: { tijeras: { name: 'Tijeretazo', kind: 'phys', power: 1.15, target: 'one', pick: 'weakest' }, riego: { name: 'Riego hirviente', kind: 'mag', power: 0.9, target: 'all', fx: 'wave' } },
    ai: [{ act: 'riego', every: 3 }, { act: 'tijeras' }], drops: [{ item: 'engranaje_suelto', chance: 0.5 }] });
  foe('jardinero_mayor', Object.assign({}, E.jardinero, mk(E.jardinero, 1.15, 3.5), { name: 'El Podador', title: 'Mantiene el jardín perfecto. A cualquier precio.', sprite: 'jardinero_mayor', boss: true, scale: 1.4, markH: 62, exp: 1100, gold: 900,
    actions: Object.assign({}, E.jardinero.actions, { poda: { name: 'Gran poda', kind: 'phys', power: 0.95, target: 'all' }, cuerda: { name: 'Dar cuerda', kind: 'buff', target: 'self', buff: { atk: 1.35, turns: 3 } } }),
    ai: [{ act: 'cuerda', every: 4 }, { act: 'poda', every: 3 }, { act: 'riego', every: 2 }, { act: 'tijeras' }], phases: [{ at: 1, music: 'jefe1', dialog: [{ name: 'Flint', t: 'Muelles y engranajes. {p:0.3}¡Mojadlo y se oxida!' }] }, { at: 0.5, music: 'jefe2', dialog: [{ name: 'El Podador', t: 'ERROR. {p:0.3}SETO REBELDE. {p:0.4}PODA TOTAL.' }] }], drops: [{ item: 'engranaje_suelto', chance: 1 }] }));
  // cap. 5
  foe('polilla_tinta', { name: 'Polilla de tinta', sprite: 'polilla_tinta', hp: 640, atk: 50, def: 20, mag: 60, res: 30, spd: 18, exp: 200, gold: 170, markH: 48,
    weak: { Fuego: 1.4, Luz: 1.2 }, resist: { Agua: 0.7 },
    actions: { aleteo: { name: 'Aleteo cortante', kind: 'phys', power: 1.0, target: 'one' }, tinta: { name: 'Lluvia de tinta', kind: 'mag', power: 0.95, target: 'all', fx: 'spores' } },
    ai: [{ act: 'tinta', every: 2 }, { act: 'aleteo' }], drops: [{ item: 'tinta_viva', chance: 0.5 }] });
  foe('polilla_archivera', Object.assign({}, E.polilla_tinta, mk(E.polilla_tinta, 1.15, 3.6), { name: 'La Que Lee', title: 'Se come las palabras que nadie debe recordar', sprite: 'polilla_archivera', boss: true, scale: 1.35, markH: 66, exp: 1300, gold: 1000,
    actions: Object.assign({}, E.polilla_tinta.actions, { borrar: { name: 'Borrar el nombre', kind: 'mag', power: 1.35, target: 'one', pick: 'weakest' }, enjambre: { name: 'Enjambre de páginas', kind: 'summon', summon: 'polilla_tinta', target: 'self' } }),
    ai: [{ act: 'enjambre', if: 'adds<1', cooldown: 5 }, { act: 'tinta', every: 2 }, { act: 'borrar', every: 3 }, { act: 'aleteo' }], phases: [{ at: 1, music: 'jefe1', dialog: [{ name: 'Elara', t: '¡Es de tinta y papel! {p:0.3}¡El fuego la espanta!' }] }, { at: 0.5, music: 'jefe2', dialog: [{ name: 'La Que Lee', t: 'Kaelen… {p:0.4}qué nombre tan bonito para borrarlo.' }] }], drops: [{ item: 'tinta_viva', chance: 1 }] }));
  // cap. 6
  foe('salamandra', { name: 'Salamandra de magma', sprite: 'salamandra', hp: 980, atk: 76, def: 40, mag: 60, res: 26, spd: 10, exp: 330, gold: 280, markH: 30,
    weak: { Agua: 1.45, Luna: 1.15 }, resist: { Fuego: 0.4 },
    actions: { mordisco: { name: 'Mordisco de brasa', kind: 'phys', power: 1.1, target: 'one' }, aliento: { name: 'Aliento de magma', kind: 'mag', power: 0.95, target: 'all', fx: 'storm' } },
    ai: [{ act: 'aliento', every: 3 }, { act: 'mordisco' }], drops: [{ item: 'escama_magma', chance: 0.5 }] });
  foe('salamandra_reina', Object.assign({}, E.salamandra, mk(E.salamandra, 1.12, 3.4), { name: 'Salamandra madre', title: 'Duerme en el corazón de la Fragua Profunda', sprite: 'salamandra_reina', boss: true, scale: 1.4, markH: 44, exp: 1900, gold: 1500,
    actions: Object.assign({}, E.salamandra.actions, { erupcion: { name: 'Erupción', kind: 'mag', power: 1.2, target: 'all', fx: 'wave' }, coraza: { name: 'Coraza de escoria', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 3 } } }),
    ai: [{ act: 'coraza', every: 4 }, { act: 'erupcion', every: 3 }, { act: 'aliento', every: 2 }, { act: 'mordisco' }], phases: [{ at: 1, music: 'jefe1', dialog: [{ name: 'Flint', t: 'El fuego no le hace nada. {p:0.3}¡Agua, Elara, agua!' }] }, { at: 0.5, music: 'jefe2', dialog: [{ name: 'Salamandra madre', t: '{~¡SSSSSHHHHH!~}' }] }], drops: [{ item: 'escama_magma', chance: 1 }] }));
  // cap. 7
  foe('heraldo', { name: 'Heraldo del Motor', sprite: 'heraldo', hp: 1150, atk: 80, def: 34, mag: 86, res: 36, spd: 14, exp: 420, gold: 330, markH: 80,
    weak: { Impacto: 1.35, Luna: 1.2 }, resist: { Luz: 0.7 },
    actions: { cadena: { name: 'Latigazo de cadena', kind: 'phys', power: 1.05, target: 'one', pick: 'weakest' }, campana: { name: 'Toque de difuntos', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' } },
    ai: [{ act: 'campana', every: 3 }, { act: 'cadena' }], drops: [{ item: 'perla_marea', chance: 0.4 }] });
  foe('heraldo_mayor', Object.assign({}, E.heraldo, mk(E.heraldo, 1.12, 3.3), { name: 'Heraldo de la Marea Alta', title: 'Anuncia el instante. Nadie le pidió que lo hiciera.', sprite: 'heraldo_mayor', boss: true, scale: 1.25, markH: 100, exp: 2400, gold: 1800,
    actions: Object.assign({}, E.heraldo.actions, { marea: { name: 'Marea de engranajes', kind: 'phys', power: 1.0, target: 'all' }, llama: { name: 'Llama turquesa', kind: 'mag', power: 1.35, target: 'one' } }),
    ai: [{ act: 'marea', every: 3 }, { act: 'llama', every: 2 }, { act: 'campana', every: 4 }, { act: 'cadena' }], phases: [{ at: 1, music: 'jefe1', dialog: [{ name: 'Firion', t: 'Su llama no teme a la luz. {p:0.3}¡Golpes fuertes, que es de latón!' }] }, { at: 0.5, music: 'jefe2', dialog: [{ name: 'Heraldo de la Marea Alta', t: '{s:0.7}Dong… {p:0.4}dong… {p:0.4}el instante…' }] }], drops: [{ item: 'perla_marea', chance: 1 }] }));

  // ---------- recompensas e ingredientes nuevos ----------
  addItem('arena_dorada', { name: 'Arena dorada', type: 'item', price: 40, sellOnly: true, ingr: true, desc: 'Arena del Acueducto que brilla sola. Ingrediente.' });
  addItem('engranaje_suelto', { name: 'Engranaje suelto', type: 'item', price: 50, sellOnly: true, ingr: true, desc: 'Sigue girando sin que nadie lo mueva. Ingrediente.' });
  addItem('tinta_viva', { name: 'Tinta viva', type: 'item', price: 60, sellOnly: true, ingr: true, desc: 'Tinta que se escribe sola si la dejas quieta. Ingrediente.' });
  addItem('escama_magma', { name: 'Escama de magma', type: 'item', price: 80, sellOnly: true, ingr: true, desc: 'Todavía quema. Ingrediente.' });
  addItem('perla_marea', { name: 'Perla de la marea', type: 'item', price: 100, sellOnly: true, ingr: true, desc: 'Dentro se oye el mar subir. Ingrediente.' });
  addItem('insignia_vigia', { name: 'Insignia de cadete', type: 'acc', price: 0, stats: { def: 6, spd: 3 }, fx: { counter: 0.35 }, desc: 'Dos nombres grabados en el reverso. Uno ya no se lee.' });
  addItem('semilla_mediodia', { name: 'Semilla del mediodía', type: 'acc', price: 0, stats: { hp: 60, res: 6 }, fx: { regen: 0.05 }, desc: 'Tibia como un mediodía de hace mil años.' });
  addItem('pluma_archivera', { name: 'Pluma archivera', type: 'acc', price: 0, stats: { mag: 10, mp: 15 }, fx: { mpRegen: 2, magRes: 0.1 }, desc: 'Escribe sola los nombres que el agua intenta borrar.' });
  addItem('yesca_bruno', { name: 'Yesca de Bruno', type: 'acc', price: 0, stats: { atk: 10 }, fx: { startCombo: 60, addType: 'Fuego' }, desc: 'La yesca del abuelo de Flint. Prende a la primera.' });
  addItem('campana_marea', { name: 'Campana de la marea', type: 'acc', price: 0, stats: { def: 10, res: 10 }, fx: { guardPlus: true, regen: 0.03 }, desc: 'Suena cuando el mar está a punto de cambiar.' });

  // ---------- plantilla de zona (entrada al este; se refleja si la entrada va al oeste) ----------
  const W = 34, H = 24;
  function build(z) {
    const fl = z.mirror;
    const C = (c) => (fl ? W - 1 - c : c), X = (x, w) => (fl ? W - x - w : x), Dd = (d) => (fl ? { left: 'right', right: 'left' }[d] || d : d);
    const rect = (r) => [X(r[0], r[2]), r[1], r[2], r[3]];
    const pt = (o) => Object.assign({}, o, { c: C(o.c) });
    const def = {
      id: z.id, name: z.name, sub: z.sub, w: W, h: H, baseHeight: 3, baseTerrain: z.wall, clouds: false, dark: z.dark, ambient: z.ambient, music: z.music,
      heightRects: [[26, 11, 8, 3, 1], [13, 5, 14, 15, 1], [9, 11, 4, 2, 1], [2, 6, 7, 12, 1]].map((r) => rect(r).concat(r[4])),
      terrainRects: [[13, 5, 14, 15, z.floor], [2, 6, 7, 12, z.floor2], [26, 11, 8, 3, 'p'], [9, 11, 4, 2, 'p'], [13, 11, 13, 2, 'p'], [23, 16, 3, 2, '~'], [3, 7, 5, 3, z.accent]].map((r) => rect(r).concat(r[4])),
      tiles: [],
      props: z.props.map((p) => [p[0], fl ? W - 1 - p[1] : p[1], p[2], p[3]].filter((v) => v !== undefined)),
      forests: [],
      zones: [{ rect: [0, 0, W, H], tint: z.tint }, { rect: rect([2, 6, 7, 12]), tint: z.tint2 }],
      npcs: [],
      foes: [
        { group: z.foes[0], patrol: [[C(15), 18], [C(21), 18]], sight: 4.5, if: '!' + z.id + '.fin' },
        { group: z.foes[1], patrol: [[C(22), 6], [C(25), 8]], sight: 4.5 },
        { group: z.foes[2], patrol: [[C(4), 15], [C(7), 15]], sight: 4 },
      ],
      triggers: [
        { rect: rect([28, 11, 4, 3]), once: z.id + '.llegada', script: z.id + '.llegada' },
        { rect: rect([19, 10, 4, 4]), once: z.id + '.guardian', script: z.id + '.guardian', cinematic: true },
        { rect: rect([3, 7, 5, 6]), once: z.id + '.fin', script: z.id + '.fin', cinematic: true },
      ],
      chests: [
        { id: z.id + '_a', c: C(14), r: 18.4, give: z.chests[0][0], n: z.chests[0][1] },
        { id: z.id + '_b', c: C(25), r: 6.2, give: z.chests[1][0], n: z.chests[1][1] },
        { id: z.id + '_c', c: C(3), r: 16.4, give: z.chests[2][0], n: z.chests[2][1] },
      ],
      pickups: [],
      signs: [{ c: C(13), r: 10.2, text: z.sign }],
      puzzle: z.puzzle.map(pt).concat([{ id: 'zpaso', type: 'gate', c: C(10), r: 11, w: 1, h: 2, open: '(' + z.expr + ')|f:fd.skip|f:' + z.id + '.fin' }]),
      start: { c: C(32), r: 12.6 },
      exits: [{ rect: rect([33, 11, 1, 3]), to: z.host, entry: z.id }],
      entries: { [z.host]: { c: fl ? 1.8 : 32.2, r: 12.6, dir: Dd('left') } },
    };
    M[z.id] = def;
    // la puerta en el mapa del capítulo
    const h = M[z.host];
    h.exits = (h.exits || []).concat([{ rect: z.hostExit, to: z.id, entry: z.host, if: z.hostIf }]);
    h.entries[z.id] = z.hostEntry;
    if (z.hostTer) h.terrainRects = (h.terrainRects || []).concat(z.hostTer);
    // el sello del jefe espera a la zona
    const seal = (h.puzzle || []).find((o) => o.id === 'fdsello');
    if (seal) {
      const parts = seal.open.split('|'), first = parts.shift();
      seal.open = [first + '&f:' + z.id + '.fin', 'f:fd.skip&f:' + z.id + '.fin'].concat(parts.filter((p) => p !== 'f:fd.skip')).join('|');
    }
    // escenas
    S[z.id + '.llegada'] = z.llegada;
    S[z.id + '.guardian'] = z.guardian.concat([{ heal: true }, { battle: z.boss, at: [C(20.5), 11.6], once: 'jefe.' + z.id, after: z.id + '.tras' }]);
    S[z.id + '.tras'] = z.tras;
    S[z.id + '.fin'] = [{ bars: true }, { cam: [C(5.5), 9], time: 1.2 }].concat(z.fin, [{ set: { [z.id + '.fin']: true } }, { give: z.reward }, { cam: 'free', time: 0.8 }, { bars: false }, { toast: z.after }, { save: true }]);
    if (z.hostScene) S[z.hostScene[0]] = z.hostScene[1];
    D.guideExtra = (D.guideExtra || []).concat([
      { map: z.host, if: [z.hostIf || true, '!' + z.id + '.fin'].filter((x) => x !== true), c: z.hostExit[0] + 0.5, r: z.hostExit[1] + 0.6 },
      { map: z.id, if: '!jefe.' + z.id, c: C(20.5), r: 12 },
      { map: z.id, if: ['jefe.' + z.id, '!' + z.id + '.fin'], c: C(5.5), r: 10 },
      { map: z.id, if: z.id + '.fin', c: C(33), r: 12.6 },
    ]);
    D.scriptMusicExtra = Object.assign(D.scriptMusicExtra || {}, { [z.id + '.guardian']: 'amenaza', [z.id + '.fin']: z.finMusic || 'triste' });
    return def;
  }
  const B = (a) => ['bars', a];
  void B;

  const ZONES = [
    // ---------------- Capítulo 3 · Cisterna de los Ecos ----------------
    { id: 'cisterna', host: 'ruinas', name: 'Cisterna de los Ecos', sub: 'Bajo las Ruinas · el acueducto que daba de beber a Thalyria', mirror: false,
      wall: 'r', floor: 'd', floor2: 'p', accent: 'f', dark: 0.5, ambient: 'mote', music: 'ruinas', tint: [0.9, 0.86, 0.74], tint2: [0.98, 0.9, 0.7],
      hostExit: [0, 16, 1, 2], hostEntry: { c: 1.4, r: 16.6, dir: 'right' }, hostIf: 'cap3.varek.ido',
      props: [['lamp', 13.6, 5.4], ['ruin', 25.5, 5.6], ['giant_head', 25, 18.6], ['ruin', 13.6, 19], ['lamp', 2.6, 6.6], ['lamp', 8.4, 6.6], ['altar', 5.5, 8.2], ['gem2', 3, 17], ['gem', 8, 17], ['rock', 17, 6], ['rock', 24, 10]],
      foes: [['gargola_arena', 'halcon'], ['gargola_arena', 'centinela'], ['gargola_arena', 'gargola_arena']], boss: ['gargola_reina', 'gargola_arena'],
      chests: [['tonico_plus', 3], ['arena_dorada', 2], ['gold', 800]],
      sign: 'Una compuerta de bronce cierra el paso a la cámara del agua.{p:0.3} «Que el peso caiga en su sitio y la marca vuelva a verse.»',
      puzzle: [{ id: 'zp1', type: 'plate', c: 15, r: 7 }, { id: 'zb1', type: 'block', c: 15, r: 12, mover: true }, { id: 'zr1', type: 'runa', c: 18, r: 17 }, { id: 'zr2', type: 'runa', c: 20, r: 17 }],
      expr: 'zp1&zr1&zr2', bot: [[15, 6, 'down', 'mover'], [19, 16, 'down', 'luz']], reward: 'insignia_vigia',
      llegada: [
        { say: 'none', t: 'Un acueducto entero, bajo las ruinas. {p:0.4}El agua ya no corre, pero las paredes siguen repitiendo su rumor.' },
        { say: 'elara', e: 'sad', t: 'Escuchad. {p:0.3}No es agua. {p:0.4}Son voces… {p:0.3}como si alguien hablara desde muy lejos.' },
        { say: 'firion', e: 'neutral', t: 'La Cisterna de los Ecos. {p:0.4}Aquí venían los cadetes del faro a aprender a escuchar el mar. {p:0.3}Yo también.' },
        { toast: 'Objetivo: cruza la Cisterna y llega a la cámara del agua (oeste)' },
      ],
      guardian: [
        { bars: true }, { shake: 3, time: 1, wait: false },
        { say: 'none', t: 'Una estatua del techo despliega dos alas de arena. {p:0.4}Luego otra. {p:0.3}Los ojos se les encienden como brasas.' },
        { say: 'flint', e: 'angry', t: '¡Las estatuas no deberían moverse! {p:0.4}¡Es una norma básica!' },
        { say: 'firion', e: 'angry', t: 'Gárgolas guardianas. {p:0.3}Siguen cumpliendo una orden de hace mil años.' },
      ],
      tras: [{ say: 'kaelen', e: 'neutral', t: 'La compuerta del oeste. {p:0.4}Hay una placa y unas marcas en el suelo…' }, { toast: 'Objetivo: pon el bloque sobre la placa (1: Mover) y revela las marcas (2: Luz)' }],
      fin: [
        { say: 'none', t: 'En la cámara del agua, sobre el brocal de la fuente seca, hay dos nombres grabados a punta de cuchillo.' },
        { say: 'none', name: 'Inscripción', t: '«Firion · Varek. {p:0.3}Vigías de Thalyria. {p:0.4}Mientras uno de los dos vigile, la luz no se apaga.»' },
        { say: 'firion', e: 'sad', t: 'Teníamos doce años. {p:0.4}Él sujetaba la vela y yo el cuchillo. {p:0.3}Le temblaba la mano y me echó cera en las botas.' },
        { say: 'kaelen', e: 'neutral', t: '¿Qué le pasó, Firion?' },
        { say: 'firion', e: 'sad', t: 'Que vio apagarse la luz delante de él. {p:0.4}Y desde entonces no se fía de nadie para encenderla… {p:0.3}ni de sí mismo.' },
        { say: 'elara', e: 'sad', t: 'Entonces aún queda algo de ese chico en él. {p:0.4}Nadie odia tanto la oscuridad si no la ha querido apagar.' },
        { say: 'none', t: 'Detrás de la inscripción, enganchada en una grieta, hay una vieja insignia de cadete.' },
      ],
      after: 'Objetivo: vuelve a las Ruinas y sube a la explanada del faro' },

    // ---------------- Capítulo 4 · Jardines Colgantes ----------------
    { id: 'jardines', host: 'ciudad', name: 'Jardines Colgantes', sub: 'Ciudad Dorada · hace mil años', mirror: false,
      wall: 'r', floor: 'g', floor2: 'f', accent: 'p', dark: 0.12, ambient: 'mote', music: 'dorada', tint: [1.08, 1.04, 0.86], tint2: [1.1, 1.02, 0.92],
      hostExit: [0, 17, 1, 2], hostEntry: { c: 1.4, r: 17.6, dir: 'right' }, hostIf: 'epoca.ciudad=past',
      props: [['tree', 14, 5.6], ['tree', 25.5, 5.6], ['bush', 13.6, 19], ['bush', 25.5, 19.2], ['lamp', 2.6, 6.6], ['lamp', 8.4, 6.6], ['well', 5.5, 8.4], ['bush', 3, 17], ['bush', 8, 17], ['brazier', 17, 6], ['bush', 24, 10], ['garland', 20, 5.4]],
      foes: [['jardinero', 'polilla'], ['jardinero', 'engranaje'], ['jardinero', 'jardinero']], boss: ['jardinero_mayor', 'jardinero'],
      chests: [['tonico_plus', 3], ['engranaje_suelto', 2], ['gold', 1000]],
      sign: 'Rótulo del jardín: «Los braseros del paseo se apagan al caer la tarde.{p:0.3} Y lo escondido florece solo a la luz.»',
      puzzle: [{ id: 'zl1', type: 'llama', c: 16, r: 9 }, { id: 'zl2', type: 'llama', c: 18, r: 9 }, { id: 'zr1', type: 'runa', c: 16, r: 17 }],
      expr: 'zl1&zl2&zr1', bot: [[15, 9, 'right', 'brisa'], [16, 16, 'down', 'luz']], reward: 'semilla_mediodia', finMusic: 'grupo',
      llegada: [
        { say: 'none', t: 'Terrazas de flores colgando sobre el vacío, regadas por autómatas de latón que no levantan la vista.' },
        { say: 'flint', e: 'happy', t: 'Mira eso. {p:0.4}Engranajes regando petunias. {p:0.3}En mi época las regaba mi abuela, y te cobraba la entrada.' },
        { say: 'elara', e: 'happy', t: 'Huele a mediodía. {p:0.4}Hacía tanto que no olía a mediodía…' },
        { toast: 'Objetivo: cruza los Jardines hasta el Reloj de sol (oeste)' },
      ],
      guardian: [
        { bars: true }, { shake: 2, time: 0.8, wait: false },
        { say: 'none', t: '{~¡Clac, clac, clac!~} {p:0.4}Un autómata enorme corta un seto de un solo tijeretazo y se gira hacia vosotros.' },
        { say: 'none', name: 'El Podador', t: '{s:0.8}INTRUSOS. {p:0.3}NO PLANTADOS. {p:0.4}NO REGADOS. {p:0.3}PODAR.' },
        { say: 'kaelen', e: 'angry', t: '¡Nosotros no somos un seto!' },
      ],
      tras: [{ say: 'elara', e: 'neutral', t: 'Los braseros del paseo… {p:0.3}y algo escondido en la hierba. {p:0.4}La compuerta del reloj depende de ellos.' }, { toast: 'Objetivo: apaga los braseros (3: Brisa) y revela la marca (2: Luz)' }],
      fin: [
        { say: 'none', t: 'En el centro del jardín, un gran reloj de sol de bronce. {p:0.4}Un anciano con delantal de tierra poda una rosa a su lado.' },
        { say: 'none', name: 'Tomé, el jardinero', t: 'Visitas, en mi jardín. {p:0.4}Y con pinta de haber andado mucho. {p:0.3}¿De dónde venís?' },
        { say: 'kaelen', e: 'neutral', t: 'De… {p:0.3}muy lejos. {p:0.4}Más lejos de lo que podríamos explicar.' },
        { say: 'none', name: 'Tomé, el jardinero', t: 'La reina dice que algún día el sol se parará. {p:0.4}Que el mediodía se quedará quieto y nadie lo echará de menos hasta que falte.' },
        { say: 'none', name: 'Tomé, el jardinero', t: 'Por eso guardo semillas. {p:0.4}Si algún día pasa, que alguien tenga un mediodía en el bolsillo. {p:0.3}Toma, muchacho. {p:0.3}Tienes cara de necesitarlo.' },
        { say: 'elara', e: 'sad', t: 'Kaelen… {p:0.4}él no sabe lo que va a pasar. {p:0.3}Nadie aquí lo sabe.' },
        { say: 'kaelen', e: 'sad', t: 'Por eso tenemos que arreglarlo. {p:0.4}Por él también.' },
      ],
      after: 'Objetivo: vuelve a la Ciudad Dorada y sigue el camino del Cronoguardia' },

    // ---------------- Capítulo 5 · Archivo Anegado ----------------
    { id: 'archivo', host: 'biblioteca', name: 'Archivo Anegado', sub: 'Biblioteca de las Dos Épocas · los sótanos', mirror: true,
      wall: 'r', floor: 'p', floor2: 'd', accent: 'r', dark: 0.66, ambient: 'bubble', music: 'biblioteca', tint: [0.7, 0.8, 1.0], tint2: [0.76, 0.72, 0.98],
      hostExit: [33, 14, 1, 2], hostEntry: { c: 32.4, r: 14.6, dir: 'left' }, hostIf: 'epoca.biblioteca=present',
      props: [['crate', 14, 5.6], ['crate', 25.5, 5.6], ['barrel', 13.6, 19], ['ruin', 25.5, 19], ['lantern_post', 2.6, 6.6], ['lantern_post', 8.4, 6.6], ['altar', 5.5, 8.2], ['coral', 3, 17], ['coral', 8, 17], ['coral', 21, 6], ['crate', 24, 10]],
      foes: [['polilla_tinta', 'polilla'], ['polilla_tinta', 'polilla_eterna'], ['polilla_tinta', 'polilla_tinta']], boss: ['polilla_archivera', 'polilla_tinta'],
      chests: [['agua_luna', 4], ['tinta_viva', 2], ['gold', 1200]],
      sign: 'Placa del archivero: «La vela del lector se apaga al terminar.{p:0.3} El peso vuelve a su estante.{p:0.3} Y lo borrado se lee a la luz.»',
      puzzle: [{ id: 'zl1', type: 'llama', c: 17, r: 7 }, { id: 'zp1', type: 'plate', c: 19, r: 7 }, { id: 'zb1', type: 'block', c: 23, r: 7, mover: true }, { id: 'zr1', type: 'runa', c: 16, r: 17 }],
      expr: 'zl1&zp1&zr1', bot: [[18, 7, 'right', 'mover'], [18, 7, 'left', 'brisa'], [16, 16, 'down', 'luz']], reward: 'pluma_archivera',
      llegada: [
        { say: 'none', t: 'Los sótanos de la Biblioteca. {p:0.4}Legajos hinchados de agua, tinta que flota en nubes negras y un silencio de iglesia.' },
        { say: 'firion', e: 'neutral', t: 'Aquí se guardaba lo que la reina no quería en las estanterías de arriba.' },
        { say: 'elara', e: 'sad', t: 'Algo se está comiendo las palabras. {p:0.4}Mirad: {p:0.3}páginas en blanco por todas partes.' },
        { toast: 'Objetivo: cruza el Archivo hasta la sala de los legajos sellados (este)' },
      ],
      guardian: [
        { bars: true }, { shake: 2, time: 0.8, wait: false },
        { say: 'none', t: 'Una nube de tinta se recoge sobre sí misma y abre unas alas inmensas, cubiertas de letras que se mueven.' },
        { say: 'none', name: 'La Que Lee', t: '{s:0.7}Nombres… {p:0.4}nombres que nadie debe recordar. {p:0.3}{*Me los como todos.*}' },
        { say: 'elara', e: 'angry', t: '¡No vas a borrar nada más!' },
      ],
      tras: [{ say: 'firion', e: 'neutral', t: 'La sala sellada se abre con la vela, el peso y la marca. {p:0.4}Como dice la placa.' }, { toast: 'Objetivo: bloque a la placa (1), apaga la vela (3) y revela la marca (2)' }],
      fin: [
        { say: 'none', t: 'En la sala sellada solo queda un legajo seco, protegido por una campana de cristal. {p:0.4}La letra es la de la reina Aurelia.' },
        { say: 'none', name: 'Legajo de la reina', t: '«Cuando el día se detenga, la marea traerá a un niño que no envejece con el mar. {p:0.4}No le temáis. {p:0.3}Es la última llave.»' },
        { say: 'flint', e: 'neutral', t: '¿Un niño que no envejece con el mar? {p:0.4}Eso es muy concreto para ser poesía.' },
        { emote: 'kaelen', icon: '…', time: 1.0 },
        { say: 'kaelen', e: 'sad', t: 'Halvard me encontró en la playa, en una barca, cuando era un bebé. {p:0.4}Nunca supo de dónde venía.' },
        { say: 'elara', e: 'neutral', t: 'Sea lo que sea, Kaelen, {p:0.3}vienes con nosotros. {p:0.4}Eso no lo cambia ningún papel.' },
        { say: 'none', t: 'Junto al legajo, una pluma de archivero sigue escribiendo sola en el aire.' },
      ],
      after: 'Objetivo: vuelve a la Biblioteca y busca el libro de la reina' },

    // ---------------- Capítulo 6 · Fragua Profunda ----------------
    { id: 'fragua', host: 'hondaroca', name: 'Fragua Profunda', sub: 'Hondaroca · el fuego bajo el pueblo', mirror: true,
      wall: 'r', floor: 'd', floor2: 'r', accent: 'p', dark: 0.58, ambient: 'ember', music: 'hondaroca', tint: [1.1, 0.78, 0.62], tint2: [1.16, 0.84, 0.66],
      hostExit: [35, 15, 1, 2], hostEntry: { c: 34.4, r: 15.6, dir: 'left' }, hostIf: 'cap6.profecia',
      props: [['lavaglow', 14, 5.6], ['lavaglow', 25.5, 5.6], ['forge', 25, 18.6], ['anvil', 13.6, 19], ['brazier', 2.6, 6.6], ['brazier', 8.4, 6.6], ['anvil', 5.5, 8.4], ['crucible', 3, 17], ['chimney', 8, 17.2], ['rock', 24, 10]],
      foes: [['salamandra', 'medusa'], ['salamandra', 'cangrejo_abisal'], ['salamandra', 'salamandra']], boss: ['salamandra_reina', 'salamandra'],
      chests: [['tonico_plus', 5], ['escama_magma', 2], ['gold', 1600]],
      sign: 'Marca de herrero: «El agua que corre hay que pararla.{p:0.3} El fuego que sobra hay que apagarlo.{p:0.3} Así se templa el acero.»',
      puzzle: [{ id: 'zc1', type: 'charco', c: 17, r: 8 }, { id: 'zc2', type: 'charco', c: 19, r: 8 }, { id: 'zl1', type: 'llama', c: 21, r: 8 }],
      expr: 'zc1&zc2&zl1', bot: [[16, 8, 'right', 'congelar'], [16, 8, 'right', 'congelar'], [16, 8, 'right', 'brisa']], reward: 'yesca_bruno', finMusic: 'grupo',
      llegada: [
        { say: 'none', t: 'Bajo Hondaroca, el calor muerde. {p:0.4}Ríos de magma bajan por canales de piedra que alguien talló hace siglos.' },
        { say: 'flint', e: 'sad', t: 'La Fragua Profunda. {p:0.4}Mi abuelo bajaba aquí a templar las piezas grandes. {p:0.3}Decía que el fuego de abajo «tenía carácter».' },
        { say: 'elara', e: 'neutral', t: 'Hay algo vivo en el magma, Flint. {p:0.4}Algo que nos mira.' },
        { toast: 'Objetivo: baja hasta el yunque de Bruno (este)' },
      ],
      guardian: [
        { bars: true }, { shake: 4, time: 1.2, wait: false },
        { say: 'none', t: 'El canal de magma se hincha. {p:0.4}Una salamandra del tamaño de una barca sale arrastrándose, con la cresta en llamas.' },
        { say: 'flint', e: 'angry', t: '¡Esa es la que mi abuelo llamaba «la vieja»! {p:0.4}¡Creía que era un cuento para que no bajara!' },
        { say: 'kaelen', e: 'neutral', t: 'Pues el cuento tiene dientes.' },
      ],
      tras: [{ say: 'flint', e: 'neutral', t: 'La puerta del taller de mi abuelo. {p:0.4}Charcos que gotean y un fuego de más. {p:0.3}Como en su marca.' }, { toast: 'Objetivo: congela los charcos (4: Congelar) y apaga el brasero (3: Brisa)' }],
      fin: [
        { say: 'none', t: 'Al fondo, un yunque enorme con la marca de una B. {p:0.4}A su lado, una caja de hierro con una tapa tallada a mano.' },
        { say: 'flint', e: 'sad', t: 'Su yunque. {p:0.4}La B de Bruno. {p:0.3}Lo bajó aquí él solo cuando yo tenía cinco años y nunca me dijo cómo.' },
        { say: 'none', t: 'Dentro de la caja hay una yesca, una piedra de afilar y una nota con letra de herrero.' },
        { say: 'none', name: 'Nota de Bruno', t: '«Para Flint, si alguna vez baja hasta aquí. {p:0.4}Ya sé que vas a hacer un chiste. {p:0.3}Hazlo, y luego enciende esto. {p:0.4}La fragua de arriba se apagará algún día. La tuya, no.»' },
        { say: 'flint', e: 'happy', t: '…Viejo cascarrabias. {p:0.4}Ni muerto me deja tener la última palabra.' },
        { say: 'kaelen', e: 'neutral', t: 'Enciéndela, Flint. {p:0.4}Él lo sabía.' },
        { flash: 0.6, color: '#ffb070' },
      ],
      after: 'Objetivo: vuelve a Hondaroca: el Coloso espera en la Gran Fragua' },

    // ---------------- Capítulo 7 · Escalera de las Mareas ----------------
    { id: 'escalera', host: 'torre', name: 'Escalera de las Mareas', sub: 'Torre del Motor · el pozo de engranajes', mirror: true,
      wall: 'r', floor: 'p', floor2: 'r', accent: 'f', dark: 0.6, ambient: 'lantern', music: 'motor', tint: [0.72, 0.9, 0.96], tint2: [0.8, 0.96, 1.0],
      hostExit: [35, 17, 1, 2], hostEntry: { c: 34.4, r: 17.6, dir: 'left' }, hostIf: 'torre.llegada',
      props: [['void_gear', 14, 5.6], ['void_gear', 25.5, 5.6], ['beacon', 25, 18.6], ['void_gear', 13.6, 19], ['beacon', 2.6, 6.6], ['beacon', 8.4, 6.6], ['void_clock', 5.5, 8.4], ['time_shard', 3, 17], ['time_shard', 8, 17], ['lantern_post', 21, 6], ['crate', 24, 10]],
      foes: [['heraldo', 'guardian_marea'], ['heraldo', 'farol_corrupto'], ['heraldo', 'heraldo']], boss: ['heraldo_mayor', 'heraldo'],
      chests: [['tonico_plus', 5], ['perla_marea', 2], ['gold', 2000]],
      sign: 'Grabado en la puerta: «El peso abajo, el agua quieta, el fuego dormido. {p:0.3}Así se sube a la marea.»',
      puzzle: [{ id: 'zp1', type: 'plate', c: 15, r: 7 }, { id: 'zb1', type: 'block', c: 15, r: 12, mover: true }, { id: 'zc1', type: 'charco', c: 19, r: 16 }, { id: 'zl1', type: 'llama', c: 21, r: 16 }],
      expr: 'zp1&zc1&zl1', bot: [[15, 6, 'down', 'mover'], [18, 16, 'right', 'congelar'], [18, 16, 'right', 'brisa']], reward: 'campana_marea',
      llegada: [
        { say: 'none', t: 'Un pozo de engranajes que bajan hasta el mar. {p:0.4}Cada rueda tiene grabada una ola distinta.' },
        { say: 'oslo', e: 'neutral', t: 'Aquí abajo traía yo las barcas hace muchos años. {p:0.4}La Torre respiraba entonces. {p:0.3}Ahora jadea.' },
        { say: 'firion', e: 'neutral', t: 'Los faros de arriba necesitan que esto gire. {p:0.4}Si el pozo está atascado, la Torre no despertará del todo.' },
        { toast: 'Objetivo: baja por la Escalera de las Mareas hasta el Reloj del pozo (este)' },
      ],
      guardian: [
        { bars: true }, { shake: 3, time: 1, wait: false },
        { say: 'none', t: '{~Dong… {p:0.3}dong…~} {p:0.4}Una campana suena sin que nadie la toque. {p:0.3}Del pozo sube un farol con tentáculos de cadena.' },
        { say: 'none', name: 'Heraldo de la Marea Alta', t: '{s:0.7}El instante llega. {p:0.4}La marea sube. {p:0.3}{*Todo lo que gira, se para.*}' },
        { say: 'elara', e: 'angry', t: '¡No mientras nosotros estemos aquí!' },
      ],
      tras: [{ say: 'firion', e: 'neutral', t: 'La puerta del Reloj: peso abajo, agua quieta, fuego dormido. {p:0.4}Tenemos todo lo que hace falta.' }, { toast: 'Objetivo: bloque a la placa (1), congela el charco (4) y apaga el fuego (3)' }],
      fin: [
        { say: 'none', t: 'El Reloj del pozo, parado a las doce menos un minuto. {p:0.4}Kaelen apoya la mano en la esfera y el bronce está tibio, como si latiera.' },
        { say: 'voice', name: '???', t: '{s:0.7}…Hijo de la marea. {p:0.5}Has bajado antes de subir. {p:0.4}Bien. {p:0.3}Así se hace en esta casa.' },
        { say: 'kaelen', e: 'neutral', t: '¿Quién eres?' },
        { say: 'voice', name: '???', t: 'Alguien que te esperaba. {p:0.4}Enciende los cuatro faros y te lo diré cara a cara.' },
        { shake: 3, time: 1.2, wait: false },
        { say: 'none', t: 'Los engranajes del pozo arrancan con un chirrido. {p:0.4}Muy arriba, la Torre del Motor responde con un temblor largo.' },
        { say: 'oslo', e: 'sad', t: '…Esa voz. {p:0.4}Hacía cuarenta años que no la oía. {p:0.4}La última vez me sacó de una barca volcada y me dijo que remara. {p:0.3}Que me quedaban encargos.' },
      ],
      after: 'Objetivo: vuelve a la Torre y enciende los cuatro faros' },
  ];
  for (const z of ZONES) build(z);
  D.zonasE = ZONES.map((z) => ({ id: z.id, host: z.host, mirror: z.mirror, hostExit: z.hostExit, bot: z.bot.map(([c, r, d, p]) => [z.mirror ? W - 1 - c : c, r, z.mirror ? { left: 'right', right: 'left' }[d] || d : d, p]), boss: [z.mirror ? W - 1 - 20.5 : 20.5, 11.6], goal: [z.mirror ? W - 1 - 5.5 : 5.5, 9.4], back: [z.mirror ? 0.4 : 33.6, 12.6] }));

  // ---------- mapa del mundo, diario y bestiario ----------
  const FA = TH.fasea;
  if (FA) {
    const near = { cisterna: [292, 152, 'sur', 'cap3.empezado'], jardines: [308, 146, 'sur', 'cap4.fin'], archivo: [290, 164, 'sur', 'cap5.fin'], fragua: [228, 36, 'norte', 'cap6.fin'], escalera: [220, 172, 'hundida', 'cap7.fin'] };
    for (const z of ZONES) { const n = near[z.id]; FA.Z.push({ id: z.id, name: z.name, x: n[0], y: n[1], isl: n[2], need: n[3] }); }
    const after = { cisterna: 'Capítulo 3', jardines: 'Capítulo 4', archivo: 'Capítulo 5', fragua: 'Capítulo 6', escalera: 'Capítulo 7' };
    const JT = {
      cisterna: ['Bajo las Ruinas · La Cisterna de los Ecos', 'cap3.varek.ido', 'Un acueducto bajo Thalyria donde los cadetes aprendían a escuchar el mar.', 'En la Cisterna vencisteis a la Gárgola mayor del Acueducto. En la cámara del agua, Firion encontró su nombre grabado junto al de Varek: «Mientras uno de los dos vigile, la luz no se apaga».'],
      jardines: ['Ciudad Dorada · Los Jardines Colgantes', 'cap3.fin', 'Terrazas de flores cuidadas por autómatas, hace mil años.', 'El Podador quiso podaros como a un seto. Junto al reloj de sol, Tomé el jardinero os regaló una semilla del mediodía «por si algún día el sol se para».'],
      archivo: ['Biblioteca · El Archivo Anegado', 'cap4.fin', 'Los sótanos de la Biblioteca, donde algo se come las palabras.', 'Vencisteis a La Que Lee. En un legajo sellado, la reina Aurelia hablaba de «un niño que no envejece con el mar», la última llave. Kaelen recordó la barca en la que lo encontró Halvard.'],
      fragua: ['Hondaroca · La Fragua Profunda', 'cap6.profecia', 'El fuego bajo Hondaroca, donde el abuelo de Flint templaba las piezas grandes.', 'La Salamandra madre resultó no ser un cuento. Junto al yunque de Bruno, Flint encontró una yesca y una nota de su abuelo: «la tuya no se apagará».'],
      escalera: ['Torre del Motor · La Escalera de las Mareas', 'torre.llegada', 'El pozo de engranajes que mueve la Torre desde el mar.', 'Vencisteis al Heraldo de la Marea Alta y el pozo volvió a girar. Una voz llamó a Kaelen «hijo de la marea». Oslo la reconoció después de cuarenta años.'],
    };
    for (const z of ZONES) {
      const [t, iff, intro, text] = JT[z.id];
      const idx = FA.J.findIndex((j) => j.t.indexOf(after[z.id] + ' ') === 0);
      FA.J.splice(idx + 1, 0, { t, if: iff, done: z.id + '.fin', intro, text });
    }
    Object.assign(FA.DESC, {
      gargola_arena: 'Estatua guardiana del Acueducto de Thalyria. Las alas son de arena: el agua se las deshace.',
      gargola_reina: 'La más antigua de las gárgolas. Endurece las alas cuando se ve en peligro.',
      jardinero: 'Autómata jardinero de la Ciudad Dorada. Poda todo lo que no está en su lista, personas incluidas.',
      jardinero_mayor: 'El Podador. Se da cuerda a sí mismo para cortar más fuerte. El agua oxida sus muelles.',
      polilla_tinta: 'Nace de la tinta derramada en el Archivo. Se alimenta de palabras; el fuego la espanta.',
      polilla_archivera: 'La Que Lee. Borra nombres de los libros y de la memoria. Llama a su enjambre de páginas.',
      salamandra: 'Reptil de la Fragua Profunda con lava en las grietas. Resiste el fuego; el agua la enfría.',
      salamandra_reina: '«La vieja» de los cuentos de Hondaroca. Se cubre de escoria cuando la hieres.',
      heraldo: 'Farol de engranajes que sube del pozo de la Torre. Su campana anuncia el instante.',
      heraldo_mayor: 'Heraldo de la Marea Alta. Arrastra cadenas como mareas; su llama turquesa quema el alma.',
    });
    for (const k of ['gargola_arena', 'gargola_reina', 'jardinero', 'jardinero_mayor', 'polilla_tinta', 'polilla_archivera', 'salamandra', 'salamandra_reina', 'heraldo', 'heraldo_mayor']) if (!FA.ORDER.includes(k)) FA.ORDER.push(k);
  }
})();
