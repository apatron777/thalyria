// CAPÍTULO 2 ampliado · entre el rapto de Elara y la Madre del Bosque.
// Nueva zona: la Hondonada de las Espinas (al oeste del bosque). Allí está el colgante de Elara, la manada del
// Lobo alfa y el Corazón de espinas que sella el claro. Solo al atravesarlo se abre el camino hasta la Madre.
// Bestiario del bosque con diseños propios (brotes carnívoros, lobos de corteza) y una Madre en tres fases.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, E = D.enemies;

  // ---------- bestiario ----------
  Object.assign(E.larva_musgo, { name: 'Brote carnívoro', sprite: 'brote', hp: 180, atk: 27 });
  E.larva_musgo.actions.mordisco.name = 'Dentellada'; E.larva_musgo.actions.esporas.name = 'Esporas ácidas';
  Object.assign(E.larva_espina, { name: 'Brote espinoso', sprite: 'brote_espina', hp: 300, atk: 33 });
  Object.assign(E.cangrejo_raiz, { name: 'Lobo de corteza', sprite: 'lobo', hp: 240, atk: 31, spd: 9, markH: 30 });
  E.cangrejo_raiz.actions.pinza.name = 'Dentellada'; E.cangrejo_raiz.actions.corteza.name = 'Erizar la corteza';
  E.cangrejo_raiz.drops = [{ item: 'tonico', chance: 0.4 }];
  Object.assign(E.cangrejo_tronco, { name: 'Lobo de tronco viejo', sprite: 'lobo_viejo', hp: 380, atk: 36, spd: 7, markH: 32 });
  E.cangrejo_tronco.actions.pinza.name = 'Dentellada'; E.cangrejo_tronco.actions.tronco.name = 'Embestida de tronco';
  E.cangrejo_tronco.drops = [{ item: 'tonico_plus', chance: 0.25 }];
  TH.foeVariant('brote_espina', 'brote', -70, 1.2, 0.9, '#1a0806');
  TH.foeVariant('lobo_viejo', 'lobo', 10, 0.6, 0.72, '#0a0602');
  TH.foeVariant('lobo_alfa', 'lobo', 95, 0.8, 0.62, '#04080a');

  E.lobo_alfa = { name: 'Lobo alfa de las Espinas', title: 'Guarda la hondonada para la Madre', sprite: 'lobo_alfa', scale: 1.5, boss: true, markH: 44,
    hp: 820, atk: 28, def: 11, mag: 18, res: 10, spd: 10, exp: 600, gold: 380,
    weak: { Fuego: 1.3, Luz: 1.2 }, resist: { Corte: 0.8 },
    actions: {
      dentellada: { name: 'Dentellada del alfa', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
      zarpazo: { name: 'Zarpazo de espinas', kind: 'phys', power: 0.85, target: 'all' },
      aullido: { name: 'Aullido de la manada', kind: 'buff', target: 'self', buff: { atk: 1.35, turns: 3 } },
      llamar: { name: 'Llamar a la manada', kind: 'summon', summon: 'cangrejo_raiz', target: 'self' },
    },
    ai: [{ act: 'aullido', every: 4 }, { act: 'zarpazo', every: 3 }, { act: 'dentellada' }],
    phases: [
      { at: 1, music: 'jefe1', dialog: [{ name: 'Firion', t: 'El alfa. {p:0.3}Si cae él, la manada huye. {p:0.4}¡Kaelen, a por él!' }] },
      { at: 0.5, music: 'jefe1', dialog: [{ name: 'Lobo alfa de las Espinas', t: '{~¡AUUUUUH!~}' }],
        ai: [{ act: 'llamar', if: 'adds<1', cooldown: 5 }, { act: 'aullido', every: 4 }, { act: 'zarpazo', every: 2 }, { act: 'dentellada' }] },
    ] };

  // La Madre: más vida, dos zarpas de raíz que la protegen y una tercera fase
  const MA = E.madre;
  Object.assign(MA, { hp: 2400, atk: 32, def: 15, mag: 32, res: 15, spd: 6, exp: 1400, markH: 84 });
  Object.assign(MA.actions, {
    enredar: { name: 'Raíces que atrapan', kind: 'phys', power: 1.0, target: 'all' },
    noche: { name: 'Florece la noche', kind: 'mag', power: 1.4, target: 'all', fx: 'wave' },
  });
  MA.ai = [{ act: 'abrazo', every: 4 }, { act: 'enredar', every: 3 }, { act: 'polen', every: 5 }, { act: 'latigo' }];
  MA.phases = [
    { at: 1, music: 'jefe1', dialog: [
      { name: 'Madre del Bosque', t: '{s:0.8}Pequeños… {p:0.4}Os arranqué a la niña de la luna y venís a quitármela otra vez.' },
      { name: 'Madre del Bosque', t: 'Mil años bebiendo sol. {p:0.4}El sol se fue. {p:0.3}{*Ahora bebo lunas.*}' },
      { name: 'Elara', t: '¡Sus zarpas de raíz la cubren! {p:0.3}¡Rompedlas primero o no le llegará ni un golpe!' },
    ] },
    { at: 0.6, music: 'jefe2', sprite: 'madre2', revive: 0.7, dialog: [
      { name: 'Madre del Bosque', t: '{~Mis ramas… arden…~} {p:0.4}Fondo… {p:0.3}dame tu agua negra.' },
      { name: 'Firion', t: 'El Fondo la está pudriendo por dentro. {p:0.4}¡Las zarpas han vuelto a brotar!' },
    ], ai: [{ act: 'llamar', if: 'adds<1', cooldown: 4 }, { act: 'abrazo', every: 3 }, { act: 'enredar', every: 2 }, { act: 'latigo' }] },
    { at: 0.25, music: 'final', dialog: [
      { name: 'Madre del Bosque', t: '{s:0.7}Si no puedo tener el sol… {p:0.5}{*que nadie vuelva a verlo.*}' },
      { name: 'Elara', t: 'Kaelen… {p:0.3}la luz que me robó está en su pecho. {p:0.4}¡Devuélvemela!' },
    ], ai: [{ act: 'noche', every: 3 }, { act: 'savia', if: 'self<0.12', cooldown: 8 }, { act: 'enredar', every: 2 }, { act: 'latigo' }] },
  ];
  const zarpa = (name, spd) => ({ name, sprite: 'zarpa', part: true, markH: 40, hp: 420, atk: 26, def: 12, mag: 10, res: 10, spd, exp: 120, gold: 0,
    weak: { Fuego: 1.4, Corte: 1.2 }, resist: { Agua: 0.6 },
    actions: { golpe: { name: 'Zarpa de raíz', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Raíces protectoras', kind: 'protect', target: 'boss' } },
    ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] });
  E.zarpa_izq = zarpa('Zarpa del alba', 6);
  E.zarpa_der = zarpa('Zarpa del ocaso', 7);

  // ---------- objetos ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('colgante_luna', { name: 'Colgante de luna', type: 'key', desc: 'El colgante de Elara. Aún está tibio.' });
  add('colmillo_alfa', { name: 'Colmillo del alfa', type: 'acc', price: 0, stats: { atk: 6, spd: 3 }, desc: 'Arrancado al Lobo alfa de las Espinas. Muerde todavía.' });

  // ---------- mapa nuevo: la Hondonada de las Espinas ----------
  D.maps.hondonada = {
    id: 'hondonada', name: 'Hondonada de las Espinas', sub: 'Isla del Oeste · donde la Madre echa raíces',
    w: 34, h: 24, baseHeight: 1, baseTerrain: 'g', clouds: false, dark: 0.62, ambient: 'mote', music: 'alerta',
    heightRects: [[2, 3, 11, 9, 2], [12, 17, 9, 4, 0]],
    terrainRects: [[2, 3, 11, 9, 'd'], [4, 4, 7, 5, 'g'], [12, 17, 9, 4, '~'], [6, 12, 28, 2, 'p'], [6, 12, 2, 1, 'S'], [15, 6, 2, 6, 'p'], [24, 14, 2, 4, 'd'], [17, 9, 6, 2, 'd']],
    tiles: [],
    props: [
      ['lamp', 3.5, 10], ['lamp', 10, 10], ['altar', 6.5, 5.4], ['gem2', 4, 4.4], ['gem2', 10, 4.4], ['gem', 19.6, 12.4],
      ['bush', 9, 14.6], ['bush', 13, 15], ['bush', 20, 15], ['bush', 27, 11], ['bush', 30, 15], ['bush', 23, 7], ['bush', 14, 4],
      ['rock', 18, 7], ['rock', 26, 18], ['rock', 9, 18], ['log', 22, 19], ['log', 28, 8.4], ['gem2', 31, 18], ['gem', 17, 19.6],
    ],
    forests: [
      { rect: [0, 0, 34, 3], types: ['pine', 'tree'], density: 0.7 },
      { rect: [0, 3, 2, 21], types: ['tree', 'pine'], density: 0.7 },
      { rect: [0, 21, 34, 3], types: ['tree', 'pine'], density: 0.65 },
      { rect: [28, 3, 6, 8], types: ['tree', 'pine'], density: 0.55 },
      { rect: [28, 15, 6, 6], types: ['tree', 'pine'], density: 0.5 },
      { rect: [13, 3, 6, 3], types: ['tree'], density: 0.35, avoid: [[15.5, 4.5, 2]] },
    ],
    zones: [{ rect: [0, 0, 34, 24], tint: [0.62, 0.8, 0.7] }, { rect: [2, 3, 11, 9], tint: [0.78, 0.62, 0.86] }],
    npcs: [],
    foes: [
      { group: ['larva_musgo', 'larva_musgo'], patrol: [[22, 17], [27, 18]], sight: 4.5 },
      { group: ['cangrejo_raiz', 'larva_espina'], patrol: [[17, 5], [24, 6]], sight: 4.5 },
      { group: ['cangrejo_raiz', 'cangrejo_raiz'], patrol: [[22, 10], [27, 10]], sight: 5 },
      { group: ['cangrejo_tronco', 'larva_espina'], patrol: [[4, 16], [10, 19]], sight: 4 },
    ],
    triggers: [
      { rect: [29, 11, 4, 4], once: 'hond.llegada', script: 'hond.llegada' },
      { rect: [18, 11, 4, 3], once: 'hond.colgante', script: 'hond.colgante', cinematic: true },
      { rect: [9, 10, 3, 5], once: 'hond.emboscada', if: 'hond.colgante', script: 'hond.emboscada', cinematic: true },
      { rect: [3, 4, 9, 5], once: 'hond.corazon', script: 'hond.corazon', cinematic: true },
    ],
    chests: [
      { id: 'hond_norte', c: 15.5, r: 4.2, give: 'tonico_plus', n: 3 },
      { id: 'hond_estanque', c: 10.5, r: 19.4, give: 'gold', n: 450 },
      { id: 'hond_altar', c: 11, r: 4.2, give: 'agua_luna', n: 2 },
    ],
    pickups: [{ id: 'hond_tonico', c: 30, r: 12.4, give: 'tonico', n: 2 }],
    signs: [{ c: 9, r: 12.6, text: 'Tres llamas de savia guardan la subida.{p:0.3} Las alimenta el aliento de la Madre:{p:0.2} solo un viento más fuerte las apaga.' }],
    puzzle: [
      { id: 'llama1', type: 'fire', c: 14, r: 9 }, { id: 'llama2', type: 'fire', c: 21, r: 9 }, { id: 'llama3', type: 'fire', c: 25, r: 16 },
      { id: 'raices', type: 'gate', c: 6, r: 12, w: 2, h: 1, open: 'llama1&llama2&llama3' },
    ],
    start: { c: 32, r: 12.6 },
    exits: [{ rect: [33, 12, 1, 2], to: 'bosque', entry: 'oeste' }],
    entries: { este: { c: 32.2, r: 12.6, dir: 'left' } },
  };

  // ---------- el bosque: salida al oeste y el claro sellado por espinas ----------
  const B = D.maps.bosque;
  B.terrainRects.push([0, 15, 4, 2, 'p']);
  B.forests[3].avoid = (B.forests[3].avoid || []).concat([[1.5, 16, 2.8]]);
  B.exits = (B.exits || []).concat([{ rect: [0, 15, 1, 2], to: 'hondonada', entry: 'este' }]);
  B.entries.oeste = { c: 1.4, r: 15.6, dir: 'right' };
  const reja = B.puzzle.find((o) => o.id === 'reja');
  reja.open = reja.open + '&f:hondonada.corazon';
  B.props.push(['bush', 15.6, 10.4], ['bush', 20.4, 10.4]);
  B.signs.push({ c: 20.5, r: 11.2, text: 'Espinas negras trepan por la reja del claro, gruesas como brazos.{p:0.3} Laten.{p:0.3} Su raíz no está aquí: viene del oeste.' });

  // ---------- guion ----------
  // llegada al bosque: el rastro de Elara lleva al oeste
  S['cap2.llegada'] = [
    { say: 'firion', e: 'neutral', t: 'Raíces dentro del agua salada. {p:0.4}Ningún árbol de este mundo hace eso.' },
    { say: 'kaelen', e: 'neutral', t: 'Las siento, Firion. {p:0.3}Laten. {p:0.4}Como si tuvieran pulso.' },
    { say: 'none', t: 'En el agua de la orilla flota un hilo de luz plateada, fino como un cabello. {p:0.4}Se adentra en el bosque, hacia el oeste.' },
    { say: 'kaelen', e: 'angry', t: 'Es su luz. {p:0.4}La luz de Elara. {p:0.3}Se la están llevando gota a gota.' },
    { say: 'firion', e: 'neutral', t: 'El claro de arriba está cerrado por espinas. {p:0.4}Pero las espinas tienen raíz. {p:0.3}Sigamos ese hilo.' },
    { toast: 'Objetivo: sigue el rastro de luz hasta la Hondonada de las Espinas (oeste del bosque)' },
  ];
  S['hond.llegada'] = [
    { bars: true },
    { cam: [20, 11], time: 1.6 },
    { say: 'none', t: 'La hondonada respira. {p:0.4}Las espinas se encogen y se estiran, despacio, como un pecho dormido.' },
    { shake: 2, time: 1.2, wait: false },
    { say: 'none', name: 'Voz entre las raíces', t: '{s:0.7}…Hijo del mar. {p:0.4}Has venido a mi casa sin llamar.' },
    { say: 'firion', e: 'angry', t: 'Nos habla. {p:0.3}Todo el bosque es ella.' },
    { say: 'kaelen', e: 'neutral', t: 'Entonces que escuche: {p:0.3}{*he venido a por Elara*}. {p:0.4}Y no me iré sin ella.' },
    { say: 'none', name: 'Voz entre las raíces', t: 'Mis hijos tienen hambre, {p:0.3}y tú hueles a sol.' },
    { cam: 'free', time: 0.8 },
    { bars: false },
    { toast: 'Objetivo: sigue el hilo de luz por la hondonada y encuentra el Corazón de espinas' },
  ];
  S['hond.colgante'] = [
    { bars: true },
    { say: 'none', t: 'Enganchado en una espina, a la altura de un corazón, cuelga un colgante con forma de luna.' },
    { say: 'kaelen', e: 'sad', t: 'Es suyo. {p:0.4}Nunca se lo quita. {p:0.3}Ni para dormir.' },
    { give: 'colgante_luna' },
    { flash: 0.6, color: '#d8e0ff' },
    { say: 'voice', name: 'Elara', t: '{s:0.8}…Kaelen… {p:0.5}las raíces me cantan para que duerma. {p:0.4}Es una canción muy bonita. {p:0.4}Muy… {p:0.3}bonita…' },
    { say: 'voice', name: 'Elara', t: '{~No dejes que me duerma.~} {p:0.4}Si me duermo, ya no seré yo quien despierte.' },
    { say: 'kaelen', e: 'angry', t: '¡Aguanta, Elara! {p:0.4}¡Voy!' },
    { say: 'firion', e: 'sad', t: 'Tenemos poco tiempo, Kaelen. {p:0.4}Ese Corazón de espinas está al oeste. {p:0.3}Lo noto en la espada.' },
    { bars: false },
    { toast: 'Objetivo: llega al altar del oeste (tres llamas guardan la subida)' },
  ];
  S['hond.emboscada'] = [
    { bars: true },
    { say: 'none', t: '{~Auuuuuh…~} {p:0.4}Un aullido largo. {p:0.3}Luego otro. {p:0.3}Luego diez.' },
    { shake: 3, time: 1, wait: false },
    { say: 'none', t: 'De entre las espinas salen lobos de corteza con ojos de ámbar. {p:0.4}El más grande lleva una corona de espinas negras en el lomo.' },
    { say: 'firion', e: 'angry', t: 'La manada que guarda el Corazón. {p:0.4}Espalda contra espalda, Kaelen.' },
    { say: 'kaelen', e: 'angry', t: 'Apartaos. {p:0.4}{*Elara no tiene tiempo para vosotros.*}' },
    { heal: true },
    { battle: ['lobo_alfa', 'cangrejo_raiz'], at: [10.5, 12.4], once: 'jefe.lobo_alfa', tips: 'sellos', after: 'hond.lobos.fin' },
  ];
  S['hond.lobos.fin'] = [
    { bars: true },
    { say: 'none', t: 'El alfa cae. {p:0.4}La manada recula entre las espinas, gimiendo, y desaparece.' },
    { give: 'colmillo_alfa' },
    { say: 'firion', e: 'neutral', t: 'Buen golpe. {p:0.4}Ahora, esas llamas. {p:0.3}Mi Ráfaga puede con ellas.' },
    { bars: false },
    { toast: 'Objetivo: apaga las tres llamas con la Ráfaga de Firion y sube al altar' },
  ];
  S['hond.corazon'] = [
    { bars: true },
    { cam: [6.5, 5], time: 1.2 },
    { say: 'none', t: 'Sobre el altar late una bola de espinas negras del tamaño de un barril. {p:0.4}Cada latido manda una ola de savia oscura por las raíces, hacia el claro.' },
    { say: 'none', t: 'Dentro, entre las espinas, se ve un brillo plateado. {p:0.3}La luz de Elara, atrapada.' },
    { say: 'kaelen', e: 'angry', t: 'Esto es lo que la está secando.' },
    { say: 'firion', e: 'neutral', t: 'Pues hazlo pedazos.' },
    { flash: 0.9, color: '#bfe0ff' },
    { shake: 6, time: 1.6, wait: false },
    { say: 'none', t: 'La Lanza del Alba atraviesa el Corazón de espinas. {p:0.4}Un chillido recorre todo el bosque. {p:0.3}Los árboles se doblan. {p:0.3}Los pájaros huyen.' },
    { say: 'none', name: 'Madre del Bosque', t: '{~¡LADRONES!~} {p:0.4}¡Mi corazón… {p:0.3}mi luna…!' },
    { say: 'none', t: 'Un hilo de luz plateada escapa del Corazón y vuela hacia el este, hacia el claro. {p:0.4}Las espinas de toda la isla se secan y crujen.' },
    { set: { 'hondonada.corazon': true } },
    { say: 'firion', e: 'neutral', t: 'Las espinas de la reja también habrán caído. {p:0.4}Volvamos al bosque. {p:0.3}La Madre nos espera arriba… {p:0.3}y ahora está furiosa.' },
    { cam: 'free', time: 0.8 },
    { bars: false },
    { toast: 'Objetivo: vuelve al bosque y sube al claro (enciende el cristal y apaga los fuegos de la escalera)' },
    { save: true },
  ];
  // el combate contra la Madre ahora incluye sus dos zarpas de raíz
  const bm = S['cap2.madre'].find((o) => o.battle);
  if (bm) bm.battle = ['madre', 'zarpa_izq', 'zarpa_der'];
  // la Madre, antes del combate, reacciona al corazón perdido
  const im = S['cap2.madre'].findIndex((o) => o.say === 'none' && o.name === 'Madre del Bosque');
  if (im >= 0) S['cap2.madre'].splice(im + 1, 0, { say: 'none', name: 'Madre del Bosque', t: 'Rompiste mi corazón de espinas, {p:0.3}y aun así ella sigue siendo mía. {p:0.4}{*Mis zarpas no la soltarán.*}' });

  // ---------- flecha guía ----------
  D.guideExtra = (D.guideExtra || []).concat([
    { map: 'bosque', if: ['objetivo=madre', '!hondonada.corazon'], c: 0.6, r: 15.6 },
    { map: 'bosque', if: 'hondonada.corazon', npz: 'cristal', c: 30, r: 14 },
    { map: 'bosque', if: 'hondonada.corazon', npz: 'fuego1', c: 17, r: 11 },
    { map: 'bosque', if: 'hondonada.corazon', npz: 'fuego2', c: 18, r: 11 },
    { map: 'bosque', if: ['hondonada.corazon', '!jefe.madre'], c: 18, r: 9 },
    { map: 'hondonada', if: '!hond.colgante', c: 19.6, r: 12.4 },
    { map: 'hondonada', if: '!jefe.lobo_alfa', c: 10.5, r: 12.4 },
    { map: 'hondonada', npz: 'llama1', c: 14, r: 9 },
    { map: 'hondonada', npz: 'llama2', c: 21, r: 9 },
    { map: 'hondonada', npz: 'llama3', c: 25, r: 16 },
    { map: 'hondonada', if: '!hondonada.corazon', c: 6.5, r: 6 },
    { map: 'hondonada', if: 'hondonada.corazon', c: 33, r: 12.6 },
  ]);
  D.zoneMusicExtra = (D.zoneMusicExtra || []).concat([{ map: 'hondonada', if: 'hondonada.corazon', music: 'bosque' }]);
  D.scriptMusicExtra = Object.assign(D.scriptMusicExtra || {}, { 'hond.colgante': 'triste', 'hond.emboscada': 'amenaza', 'hond.corazon': 'accion' });
})();
