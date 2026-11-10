// FASE C · historia y personajes.
// · Hogueras al final de los capítulos 1-7: el grupo descansa en un claro, suena «hoguera» y eliges con quién hablar
//   (dos charlas por noche). Cada personaje tiene un arco de 3 charlas (Oslo, 1) que al terminar da una técnica u objeto.
// · Varek aparece en la hoguera 4 y en la 5: qué quiere (terminar el plan de Aurelia: encerrar al Abisal en un instante
//   eterno) y por qué (Thalyria se ahogó delante de él). Ambigüedad: tiene razón en el qué, no en el precio.
// · Cuatro decisiones (luna → Final A · marea → Final B) con consecuencia inmediata; el final las enseña y, si se inclinan
//   hacia un lado, Kaelen ya sabe a quién confiar su latido.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, F = TH.flags;
  D.talk = D.talk || {};

  // ================= MÚSICA PROPIA =================
  if (TH.MUSIC_TRACKS) TH.MUSIC_TRACKS.hoguera = { bpm: 70, root: 50, prog: [[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']], bass: 'r . . . . . 5 . r . . . . . 5 .',
    arp: '0 1 2 1 3 1 2 1 0 1 2 1 3 1 2 1', aw: 'triangle', av: 0.07,
    lead: '12 - - - 14 - 16 - 19 - - - 16 - 14 - | 12 - - - 9 - 12 - 14 - - - . . . . | 17 - - - 16 - 14 - 12 - - - 14 - 16 - | 14 - - - 12 - - - . . . . . . . .', lw: 'sine', lv: 0.1, pad: 0.05 };

  // ================= EL CLARO DE LA HOGUERA =================
  const PD = TH.props.defs, px = (g, x, y, c, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w || 1, h || 1); };
  PD.hoguera = { w: 30, h: 22, ax: 15, ay: 18, box: [-9, -4, 9, 2],
    layers: [{ k: 'b', sway: 0, build(g) {
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; TH.ell(g, 15 + Math.cos(a) * 11, 16 + Math.sin(a) * 4, 2.6, 2, i % 2 ? '#5a5650' : '#7a746a'); }
      px(g, 8, 13, '#4a2a16', 14, 3); px(g, 9, 13, '#7a4a26', 12, 1); px(g, 11, 11, '#3a2010', 3, 6); px(g, 16, 11, '#3a2010', 3, 6);
      TH.ell(g, 15, 15, 5, 2, '#ff7a2a'); TH.ell(g, 15, 15, 3, 1, '#ffd04a');
    } }],
    lights: [{ dx: 0, dy: -10, r: 90, c: [255, 150, 70], a: 1, always: 0.9, flicker: 2 }],
    live: (ctx, x, y, t) => {
      for (let i = 0; i < 7; i++) {
        const h = 6 + ((Math.sin(t * 9 + i * 1.7) + 1) * 4) | 0, xx = x - 6 + i * 2;
        px(ctx, xx, y - 3 - h, i % 3 ? '#ff8a2a' : '#ffb84a', 2, h);
        px(ctx, xx, y - 3 - Math.round(h * 0.5), '#ffe08a', 1, Math.round(h * 0.4));
      }
    }, sparks: [0, -14] };
  D.maps.hoguera = {
    id: 'hoguera', name: 'Un claro junto al mar', sub: 'La hoguera', w: 20, h: 14, baseHeight: 0, baseTerrain: 'g', clouds: false,
    heightRects: [], terrainRects: [[0, 12, 20, 2, '~']], tiles: [], dark: 0.72, ambient: 'ember', music: 'hoguera',
    props: [['hoguera', 10, 7], ['pine', 2, 2], ['pine', 5, 1], ['pine', 15, 1], ['pine', 18, 3], ['tree', 1, 6, { v: 1 }], ['tree', 18, 8, { v: 0 }], ['pine', 3, 10], ['pine', 17, 11],
      ['rock', 7, 9.4], ['rock', 13, 9.4], ['bush', 6, 4], ['bush', 14, 4]],
    zones: [{ rect: [0, 0, 20, 14], tint: [0.7, 0.72, 1.0] }],
    npcs: [{ id: 'varek', c: 16.5, r: 6.6, ai: 'idle', dir: 'left', if: 'hog.varek' }],
    start: { c: 10, r: 9 }, entries: { centro: { c: 10, r: 9, dir: 'up' } }, exits: [], triggers: [], foes: [], chests: [], signs: [],
  };
  const SEAT = { kaelen: [8.2, 6.9, 'right'], elara: [11.8, 6.9, 'left'], flint: [8.6, 8.7, 'right'], firion: [11.4, 8.7, 'left'], oslo: [10, 5.7, 'down'] };
  // los acompañantes se sientan como figuras fijas (el líder es el único que sigue siendo «del grupo»)
  for (const id in SEAT) D.maps.hoguera.npcs.push({ id, c: SEAT[id][0], r: SEAT[id][1], ai: 'idle', dir: SEAT[id][2], if: 'hog.p.' + id });

  // ================= ARCOS PERSONALES =================
  // desde: primera hoguera en la que está disponible cada charla
  const ARC = {
    kaelen: { name: 'Kaelen', desde: [1, 3, 5], talks: [
      [{ say: 'kaelen', e: 'sad', t: 'Cuando era pequeño, Halvard me dejaba subir al faro las noches de tormenta. {p:0.4}Decía que el mar se calma si alguien lo mira.' },
        { say: 'kaelen', e: 'neutral', t: 'Yo lo miraba hasta dormirme. {p:0.4}Y siempre soñaba lo mismo: una mujer cantando debajo del agua.' },
        { say: 'kaelen', e: 'neutral', t: 'Nunca se lo conté a nadie. {p:0.3}Pensaba que era mi madre. {p:0.4}Luego pensé que era una tontería.' }],
      [{ say: 'kaelen', e: 'neutral', t: 'En las Ruinas, al tocar el faro, oí la canción del sueño. {p:0.4}Despierto. {p:0.3}La misma.' },
        { say: 'kaelen', e: 'sad', t: 'Me da miedo saber de dónde vengo. {p:0.4}Si resulta que no soy de Bruma… {p:0.3}¿qué me queda de todo lo que soy?' },
        { say: 'kaelen', e: 'happy', t: 'Halvard diría: «lo que has hecho con tus manos». {p:0.4}Y tendría razón, el viejo.' }],
      [{ say: 'kaelen', e: 'neutral', t: 'Aurelia me cantaba. {p:0.4}La canción del sueño era suya. {p:0.3}Me escondió en el tiempo para que alguien me encontrara en una barca.' },
        { say: 'kaelen', e: 'sad', t: 'Y me encontró un farero que no sabía nada de reinas. {p:0.4}Me enseñó a remendar redes y a no tener miedo de la oscuridad.' },
        { say: 'kaelen', e: 'happy', t: 'Tengo dos padres y una madre. {p:0.4}Ninguno sobra. {p:0.3}Voy a llevar la lanza de los dos.' },
        { set: 'arco.kaelen' }, { toast: 'Kaelen aprende «Lanza de la reina»' }]] },
    elara: { name: 'Elara', desde: [2, 4, 6], talks: [
      [{ say: 'elara', e: 'sad', t: 'En las raíces no soñaba nada. {p:0.4}Era como estar dentro de una concha: oía el mar y nada más.' },
        { say: 'elara', e: 'neutral', t: 'Ilun dice que la luna no se apaga nunca, solo se esconde. {p:0.4}Yo me escondí muy bien, ¿eh?' },
        { say: 'elara', e: 'happy', t: 'Gracias por venir a buscarme. {p:0.3}Aunque llegaste tarde. {p:0.4}Como siempre.' }],
      [{ say: 'elara', e: 'neutral', t: 'En la Ciudad Dorada, cuando paré el tiempo, me gustó. {p:0.4}Me gustó demasiado.' },
        { say: 'elara', e: 'sad', t: 'Todo quieto, nadie se hacía daño, nadie se iba. {p:0.4}Así debe de sentirse Varek. {p:0.3}Eso es lo que me asusta.' },
        { say: 'elara', e: 'neutral', t: 'Prométeme que si algún día no quiero soltar el instante… {p:0.4}me tirarás de la oreja.' }],
      [{ say: 'elara', e: 'happy', t: 'Mañana vemos la aldea. {p:0.3}Mis padres encienden faroles para los barcos que no vuelven. {p:0.4}Por si acaso.' },
        { say: 'elara', e: 'sad', t: 'Me fui de casa para aprender a ser luz. {p:0.4}Y resulta que lo que mejor sé hacer es volver.' },
        { say: 'elara', e: 'happy', t: 'Ya no tengo miedo de lo que puedo hacer. {p:0.3}Solo de no estar cuando haga falta. {p:0.4}Y eso tiene arreglo: estar.' },
        { set: 'arco.elara' }, { toast: 'Elara aprende «Luna creciente»' }]] },
    flint: { name: 'Flint', desde: [1, 3, 6], talks: [
      [{ say: 'flint', e: 'neutral', t: 'Mi abuelo Bruno decía que un herrero se mide por lo que arregla, no por lo que forja. {p:0.4}Lo nuevo lo hace cualquiera.' },
        { say: 'flint', e: 'sad', t: 'Hoy no he arreglado nada, chico. {p:0.5}Pero mañana tenemos barca y yo tengo martillo.' }],
      [{ say: 'flint', e: 'happy', t: 'Hondaroca. {p:0.3}Mi pueblo. {p:0.4}Una fragua tan grande que la llamaban «Padre Yunque». {p:0.3}Yo le robaba carbón para calentar las manos.' },
        { say: 'flint', e: 'sad', t: 'Me fui porque allí ya no quedaba nada que arreglar. {p:0.4}O eso me dije. {p:0.3}En realidad me fui porque Bruno murió y no supe quedarme.' }],
      [{ say: 'flint', e: 'sad', t: 'Le he pegado a Padre Yunque con el martillo de mi abuelo. {p:0.5}Y el viejo me ha reconocido antes de apagarse.' },
        { say: 'flint', e: 'neutral', t: 'He guardado un trozo de su yunque. {p:0.4}Lo he martillado esta noche, mientras dormíais.' },
        { say: 'flint', e: 'happy', t: 'No es nuevo. {p:0.3}Está arreglado. {p:0.4}Bruno estaría orgulloso. {p:0.3}…O me pediría el carbón.' },
        { give: 'yunque_bruno' }, { set: 'arco.flint' }]] },
    firion: { name: 'Firion', desde: [1, 3, 6], talks: [
      [{ say: 'firion', e: 'neutral', t: 'Mi padre era vigía del Cabo. {p:0.4}Una noche bajó a la cala a socorrer una barca y no volvió.' },
        { say: 'firion', e: 'neutral', t: 'El capitán de la guardia me enseñó a sostener la espada. {p:0.4}Decía: «el vigía mira para que los demás puedan dormir».' },
        { say: 'firion', e: 'sad', t: 'Esta noche no ha servido de mucho mirar.' }],
      [{ say: 'firion', e: 'angry', t: 'El capitán que me enseñó era Varek. {p:0.4}No os lo dije en las Ruinas. {p:0.3}No sabía cómo.' },
        { say: 'firion', e: 'sad', t: 'Él fue quien bajó a buscar a mi padre aquella noche. {p:0.4}Volvió solo, empapado, y no habló en un mes.' },
        { say: 'firion', e: 'neutral', t: 'Creo que algo se le quedó en el agua. {p:0.4}Y lleva desde entonces intentando que el agua se lo devuelva.' }],
      [{ say: 'firion', e: 'sad', t: 'Me fui tras él porque una parte de mí quería que tuviera razón. {p:0.4}Un instante eterno… {p:0.3}y en algún sitio de ese instante, mi padre todavía rema.' },
        { say: 'firion', e: 'neutral', t: 'Pero un vigía no detiene la noche. {p:0.4}La vigila hasta que amanece. {p:0.3}Eso es todo. {p:0.4}Eso es suficiente.' },
        { say: 'firion', e: 'happy', t: 'Mi puesto sigue siendo a tu lado, Kaelen. {p:0.3}Esta vez lo he elegido yo.' },
        { set: 'arco.firion' }, { toast: 'Firion aprende «Juramento del vigía»' }]] },
    oslo: { name: 'Oslo', desde: [7], talks: [
      [{ say: 'oslo', e: 'neutral', t: 'Cuarenta años de barquero, Alteza. {p:0.4}Y a todos los que crucé les dije lo mismo: «el mar no es malo, es grande».' },
        { say: 'oslo', e: 'sad', t: 'Llevé a la madre de Elara a la aldea cuando era una niña con fiebre. {p:0.4}Remé tres días sin dormir. {p:0.3}Ella ahora enciende faroles por mí.' },
        { say: 'oslo', e: 'sad', t: 'Si alguna vez tengo que cruzar una corriente de la que no se vuelve… {p:0.4}quiero que sepáis que no tengo miedo. {p:0.3}Tengo encargos pendientes, que es distinto.' },
        { say: 'oslo', e: 'happy', t: 'Toma. {p:0.3}Mi remo viejo. {p:0.4}Para que nunca te falte con qué volver a casa.' },
        { give: 'remo_mareas' }, { set: 'arco.oslo' }]] },
  };
  // recompensas
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('yunque_bruno', { name: 'Martillo de Bruno', type: 'weapon', who: ['flint'], price: 0, stats: { atk: 34, def: 4 }, fx: { comboUp: 1.4, addType: 'Fuego' }, desc: 'El martillo del abuelo, rehecho con el yunque de Padre Yunque. Arreglado, no nuevo.' });
  add('remo_mareas', { name: 'Remo de las mareas', type: 'acc', price: 0, stats: { hp: 40, spd: 3 }, fx: { startCombo: 60, regen: 0.04 }, desc: 'El remo viejo de Oslo. Siempre encuentra el camino a casa.' });
  const SK = D.skills;
  SK.kaelen.push({ id: 'lanza_reina', name: 'Lanza de la reina', mp: 12, kind: 'phys', power: 2.3, types: ['Corte', 'Luz'], area: 'one', req: 'arco.kaelen', desc: 'La lanza de dos padres y una madre. Un golpe de luz que no falla.' });
  SK.elara.push({ id: 'luna_creciente', name: 'Luna creciente', mp: 12, kind: 'heal', power: 3.0, types: [], area: 'allies', shield: true, req: 'arco.elara', desc: 'Cura mucho a todo el grupo y lo protege del siguiente golpe.' });
  SK.firion.push({ id: 'juramento_vigia', name: 'Juramento del vigía', mp: 10, kind: 'phys', power: 1.7, types: ['Corte', 'Luz'], area: 'line', req: 'arco.firion', desc: 'Una estocada que atraviesa la línea, como el haz de un faro.' });

  // ================= DECISIONES (luna → A · marea → B) =================
  const DEC = {
    1: { title: 'Tras perder a Elara', A: 'Salisteis de noche a buscarla', B: 'Esperasteis al alba, como los barqueros' },
    2: { title: 'Varek en la hoguera', A: 'Echasteis a Varek de la hoguera', B: 'Escuchasteis a Varek hasta el final' },
    3: { title: 'El hijo de Aurelia', A: 'Kaelen eligió ser Kaelen de Bruma', B: 'Kaelen aceptó la deuda de Aurelia' },
    4: { title: 'Los supervivientes de Hondaroca', A: 'Guardasteis las provisiones para la Torre', B: 'Dejasteis las provisiones a los supervivientes' },
  };
  const pick = (n, side, extra) => [{ set: { ['dec.' + n]: side } }, { add: side === 'A' ? 'dec.a' : 'dec.b' }].concat(extra || []);
  const DSC = {
    1: [{ say: 'firion', e: 'neutral', t: 'Los barqueros dicen que de noche el mar no devuelve nada. {p:0.4}Que hay que esperar a la marea del alba.' },
      { say: 'flint', e: 'angry', t: '¿Y dejarla ahí abajo una noche entera? {p:0.4}Yo digo que remamos ya y que el mar nos oiga.' },
      { who: 'kaelen', e: 'sad', t: '(¿Qué decide Kaelen?)', choice: [
        { t: 'Salir ya, aunque sea de noche', then: pick(1, 'A', [{ say: 'kaelen', e: 'angry', t: 'Ella no esperó al alba para salvarme. {p:0.4}Nos vamos.' }, { say: 'flint', e: 'happy', t: 'Ese es mi chico. {p:0.3}Yo remo, tú miras.' }]) },
        { t: 'Esperar al alba, como dicen los barqueros', then: pick(1, 'B', [{ say: 'kaelen', e: 'sad', t: 'Si nos hundimos esta noche, nadie la encontrará. {p:0.4}Al alba.' }, { say: 'firion', e: 'neutral', t: 'Un barquero enorme, con un ancla al hombro, se ofreció a guiarnos. {p:0.4}Se llama Oslo. {p:0.3}Dice que conoce la corriente del oeste.' }, { say: 'oslo', e: 'neutral', t: 'Al alba, chico. {p:0.4}El mar devuelve más a quien sabe esperarlo. {p:0.3}Y yo nunca dejo un encargo a medias.' }]) },
      ] }],
    2: [{ say: 'varek', e: 'neutral', t: 'Cuando encontréis el libro de la reina, dádmelo. {p:0.4}Es lo único que os pido. {p:0.3}A cambio, nadie más se ahogará. {p:0.4}Nunca.' },
      { who: 'kaelen', e: 'neutral', t: '(¿Qué hace Kaelen?)', choice: [
        { t: 'Echarle de la hoguera', then: pick(2, 'A', [{ say: 'kaelen', e: 'angry', t: 'Esta hoguera es de los míos. {p:0.4}Vete, Varek.' }, { say: 'varek', e: 'neutral', t: 'Como quieras, Alteza. {p:0.4}El mar no tiene prisa. {p:0.3}Yo tampoco.' }]) },
        { t: 'Escucharle hasta el final', then: pick(2, 'B', [{ say: 'kaelen', e: 'neutral', t: 'Habla. {p:0.4}Te escucho.' },
          { say: 'varek', e: 'neutral', t: 'Hace cinco años vi hundirse una barca con un vigía dentro. {p:0.4}Remé hasta que se me abrieron las manos. {p:0.3}No llegué a tiempo.' },
          { say: 'varek', e: 'neutral', t: 'Bajé a buscarlo al Fondo. {p:0.4}Y allí abajo el Abisal me enseñó otra cosa: {p:0.3}cómo se hundió Thalyria, desde la torre de la reina, como si yo hubiera estado allí.' },
          { say: 'varek', e: 'neutral', t: 'La reina escribió cómo detenerlo todo en un instante. {p:0.4}Sin más pérdidas. {p:0.3}No me llaméis loco por querer acabar lo que ella empezó.' },
          { say: 'firion', e: 'sad', t: '…Capitán.' }]) },
      ] }],
    3: [{ say: 'elara', e: 'neutral', t: 'Kaelen. {p:0.4}Varek dijo que la deuda de Aurelia es tuya: {p:0.3}que ella abrió el Motor y el mar entró por esa puerta.' },
      { say: 'elara', e: 'sad', t: 'No te pregunto por él. {p:0.4}Te pregunto por ti. {p:0.3}¿Quién eres ahora?' },
      { who: 'kaelen', e: 'neutral', t: '(¿Qué responde Kaelen?)', choice: [
        { t: '«Soy Kaelen de Bruma Salada»', then: pick(3, 'A', [{ say: 'kaelen', e: 'angry', t: 'Soy Kaelen, de Bruma Salada. {p:0.4}Remiendo redes y enciendo faros. {p:0.3}Con eso me basta para parar a Varek.' }, { say: 'elara', e: 'happy', t: '…Eso ha sonado muy bien, ¿sabes?' }]) },
        { t: '«Soy el hijo de Aurelia. Pagaré su deuda»', then: pick(3, 'B', [{ say: 'kaelen', e: 'neutral', t: 'Soy el hijo de Aurelia. {p:0.4}Su deuda es mía. {p:0.3}Pero la pagaré a la luz, no encerrando a todos en una noche.' }, { say: 'elara', e: 'sad', t: '…Hablas como ella. {p:0.4}Como la voz del cristal. {p:0.3}Le habría gustado oírte.' }]) },
      ] }],
    4: [{ say: 'flint', e: 'sad', t: 'Los de Hondaroca no tienen nada. {p:0.4}Ni pan, ni tónicos, ni barca. {p:0.3}Nosotros llevamos la bolsa llena para subir a la Torre.' },
      { who: 'kaelen', e: 'neutral', t: '(¿Qué decide Kaelen?)', choice: [
        { t: 'Guardar las provisiones: la Torre nos espera', then: pick(4, 'A', [{ say: 'kaelen', e: 'sad', t: 'Si caemos en la Torre, no habrá Hondaroca que salvar. {p:0.4}Las guardamos.' }, { say: 'flint', e: 'sad', t: '…Tienes razón. {p:0.4}No me gusta, pero la tienes.' }]) },
        { t: 'Dejárselas a los supervivientes', then: pick(4, 'B', [{ say: 'kaelen', e: 'neutral', t: 'Dejadles la bolsa. {p:0.4}Nosotros nos apañaremos.' }, { say: 'flint', e: 'happy', t: 'Así se hace en el mar: {p:0.3}el que tiene, comparte. {p:0.4}La familia Brea no lo olvidará.' }, { call: 'hoguera.reparto' }]) },
      ] }],
  };

  // ================= ESCENA DE HOGUERA =================
  const INTRO = {
    1: 'La primera noche sin Elara. {p:0.4}Nadie tiene hambre, pero Flint enciende el fuego igual.',
    2: 'El Bosque queda atrás. {p:0.4}Elara se ha dormido apoyada en Flint antes de que la leña prenda.',
    3: 'Las Ruinas de Thalyria brillan a lo lejos. {p:0.4}El cuarto faro ya está despierto.',
    4: 'Vuelven del pasado con olor a oro y a ceniza. {p:0.4}Alguien más se acerca al fuego.',
    5: 'Kaelen no ha dicho una palabra desde la Biblioteca. {p:0.4}Hijo de una reina. {p:0.3}El fuego no pregunta.',
    6: 'Hondaroca se ha quedado atrás, hundida y en silencio. {p:0.4}A lo lejos, la Torre del Motor gotea bajo la luna.',
    7: 'Mañana, el instante. {p:0.4}Esta noche, una hoguera más.',
  };
  const VAREK = {
    4: [{ say: 'none', t: 'Una figura sale de entre los pinos y se sienta al otro lado del fuego, como si lo hubieran invitado.' },
      { say: 'firion', e: 'angry', t: '¡Varek!' },
      { say: 'varek', e: 'neutral', t: 'Tranquilo, Firion. {p:0.4}Esta noche no traigo espada. {p:0.3}Solo frío.' },
      { say: 'varek', e: 'neutral', t: 'Habéis visto la Ciudad Dorada viva. {p:0.4}Yo la he visto morir. {p:0.3}Cada noche, desde que bajé al Fondo. {p:0.4}El Abisal me prestó el recuerdo de la reina, y ya no sé devolverlo.' },
      { say: 'firion', e: 'sad', t: 'Eso no es tuyo, capitán. {p:0.4}Es un recuerdo que te han metido para que no duermas.' },
      { say: 'varek', e: 'neutral', t: 'Aurelia quería encerrar al Primer Abisal en un solo instante. {p:0.4}No le dio tiempo. {p:0.3}Yo voy a terminar su trabajo.' },
      { say: 'elara', e: 'sad', t: 'Un instante eterno… {p:0.4}es parar a todo el mundo. {p:0.3}Para siempre.' },
      { say: 'varek', e: 'neutral', t: 'Es que nadie más se ahogue, pequeña. {p:0.4}Dime qué parte de eso está mal.' }],
  };
  function present(m) { return m.members().filter((id) => ARC[id]); }
  function nextTalk(id, n) { const A = ARC[id], k = F.get('arco.' + id + '.n') | 0; return k < A.talks.length && n >= A.desde[k] ? k : -1; }
  function chatMenu(m, n, round) {
    const opts = [];
    for (const id of present(m)) {
      const k = nextTalk(id, n);
      if (k < 0) continue;
      opts.push({ t: 'Hablar con ' + ARC[id].name + (k === ARC[id].talks.length - 1 ? ' ✦' : ''), then: ARC[id].talks[k].concat([{ add: 'arco.' + id + '.n' }]).concat(round < 2 ? [{ call: 'hoguera.charla' }] : []) });
    }
    opts.push({ t: round < 2 ? 'Mirar el fuego en silencio' : 'Dormir', then: round < 2 ? [{ call: 'hoguera.charla' }] : [] });
    return [{ choice: opts, who: 'kaelen', e: 'neutral', t: round < 2 ? '(¿Con quién hablas junto al fuego?)' : '(¿Hablas con alguien más antes de dormir?)' }];
  }
  let CUR = null;
  function campScript(n) {
    const m = TH.scenes.registry.map, L = m.leader, back = { map: m.mapId, at: [(L.x - 8) / 16, (L.y - 10) / 16], dir: L.dir, hour: m.clock ? m.clock.hour : 12 };
    const ids = m.members(), lead = m.leader.def.id, ls = SEAT[lead] || [10, 9, 'up'];
    CUR = { n, round: 0, m, count: m.count };
    if (m.zones) delete m.zones.hoguera; // cada noche, la hoguera se monta de cero: solo quien está esa noche
    const on = {}; for (const id of ids) if (id !== lead && SEAT[id]) on['hog.p.' + id] = true;
    const s = [{ fade: 1, time: 0.8 }, { set: on }, { party: 'solo' }];
    if (VAREK[n]) s.push({ set: 'hog.varek' });
    s.push({ warp: 'hoguera', at: ls.slice(0, 2), dir: ls[2], hour: 22.5 });
    s.push({ cam: [10, 7.2], time: 0.01 }, { music: 'hoguera' }, { fade: 0, time: 1.4 }, { banner: ['La hoguera', 'Noche ' + n] },
      { say: 'none', t: INTRO[n] });
    if (VAREK[n]) s.push(...VAREK[n]);
    if (DSC[{ 1: 1, 4: 2, 5: 3, 6: 4 }[n]]) s.push(...DSC[{ 1: 1, 4: 2, 5: 3, 6: 4 }[n]]);
    if (VAREK[n]) s.push({ say: 'none', t: 'Varek se levanta sin despedirse y se pierde entre los pinos. {p:0.4}El fuego tarda un rato en volver a calentar.' }, { move: 'varek', to: [19.4, 6.6], speed: 60 }, { despawn: 'varek' });
    s.push({ call: 'hoguera.charla' });
    s.push({ say: 'none', t: 'Las brasas se apagan despacio. {p:0.4}Mañana habrá que seguir.' }, { set: Object.assign({ ['hoguera.' + n]: true, 'hog.varek': false }, Object.fromEntries(Object.keys(on).map((k) => [k, false]))) },
      { fade: 1, time: 1.2 }, { warp: back.map, at: back.at, dir: back.dir, hour: back.hour }, { call: 'hoguera.vuelta' });
    return s;
  }
  for (let n = 1; n <= 7; n++) Object.defineProperty(S, 'hoguera.' + n, { configurable: true, get: () => (F.get('hoguera.' + n) ? [] : campScript(n)) });
  Object.defineProperty(S, 'hoguera.charla', { configurable: true, get: () => { if (!CUR) return []; CUR.round++; return CUR.round > 2 ? [] : chatMenu(CUR.m, CUR.n, CUR.round); } });

  Object.defineProperty(S, 'hoguera.vuelta', { configurable: true, get: () => { if (CUR) { const m = CUR.m; m.count = CUR.count; m.regroup(); } return []; } });
  Object.defineProperty(S, 'hoguera.reparto', { configurable: true, get: () => { const P = TH.party, n = Math.min(3, P.count('tonico_plus')); if (n) P.add('tonico_plus', -n); return n ? [{ toast: 'Entregas ' + n + ' tónicos concentrados' }] : []; } });
  // la hoguera entra justo después del cartel «Fin del Capítulo N» (pantalla en negro)
  for (const arr of Object.values(S)) {
    if (!Array.isArray(arr)) continue;
    for (let i = 0; i < arr.length; i++) {
      const op = arr[i], mt = op && typeof op.chapter === 'string' && /^Fin del Capítulo (\d)$/.exec(op.chapter);
      if (mt && +mt[1] <= 7 && !(arr[i + 1] && arr[i + 1].call === 'hoguera.' + mt[1])) arr.splice(i + 1, 0, { call: 'hoguera.' + mt[1] });
    }
  }

  // ================= CONSECUENCIAS: NPCs que reaparecen =================
  const npc = (map, o) => { const M = D.maps[map]; if (M) M.npcs = (M.npcs || []).concat([o]); };
  npc('bosque', { id: 'oslo', talk: 'tobias_bosque', c: 20.5, r: 21.2, ai: 'idle', dir: 'left', if: ['dec.1=B', '!cap2.fin'] });
  D.talk.tobias_bosque = [{ say: 'oslo', e: 'happy', t: 'La marea del alba os trajo derechos, ¿eh? {p:0.4}El mar respeta a quien lo escucha, chico. {p:0.3}Yo os espero aquí: encuentra a tu amiga.' }];
  npc('faroleros', { id: 'oldman', talk: 'brea_faroleros', c: 19, r: 18.6, ai: 'idle', dir: 'down', if: 'dec.4=B' });
  D.talk.brea_faroleros = [
    { if: '!brea.regalo', then: [{ say: 'none', name: 'Abuelo Brea', t: '¡Los de la bolsa! {p:0.4}Gracias a vuestro pan llegamos remando hasta aquí. {p:0.3}Tomad: agua de luna de la buena.' }, { give: 'agua_luna', n: 4 }, { set: 'brea.regalo' }],
      else: [{ say: 'none', name: 'Abuelo Brea', t: 'Los faroleros nos han dado techo. {p:0.4}Cuando todo acabe, Hondaroca volverá a encender su fragua.' }] }];

  // ================= EL FINAL ESCUCHA LAS DECISIONES =================
  function summary() {
    const L = [{ say: 'none', t: 'Lo que os ha traído hasta aquí:' }];
    for (const k of [1, 2, 3, 4]) { const v = F.get('dec.' + k); if (v) L.push({ say: 'none', t: '· ' + DEC[k].title + ': ' + DEC[k][v] + (v === 'A' ? ' {p:0.2}(luna)' : ' {p:0.2}(marea)') + '.' }); }
    return L.length > 1 ? L : [];
  }
  let finalChoice = null;
  for (const arr of Object.values(S)) {
    if (!Array.isArray(arr)) continue;
    const i = arr.findIndex((op) => op && Array.isArray(op.choice) && op.choice.some((c) => /Confiar el latido a Elara/.test(c.t)));
    if (i >= 0) { finalChoice = arr[i]; arr[i] = { call: 'final.decide' }; }
  }
  D.finalChoice = finalChoice;
  Object.defineProperty(S, 'final.decide', { configurable: true, get: () => {
    const a = F.get('dec.a') | 0, b = F.get('dec.b') | 0, sum = summary();
    // El jugador elige siempre. Lo que decidió por el camino cambia lo que le dicen Elara y Oslo antes de elegir.
    const lean = a > b ? [{ say: 'none', t: 'La luna ha pesado más que la marea.' }, { say: 'elara', e: 'neutral', t: 'Me has visto volver una vez, Kaelen. {p:0.4}Sabes que sé volver.' }, { say: 'oslo', e: 'sad', t: 'La pequeña tiene la luna de su parte. {p:0.4}Pero yo tengo cuarenta años de mar. {p:0.3}Piénsalo bien, Alteza.' }]
      : b > a ? [{ say: 'none', t: 'La marea ha pesado más que la luna.' }, { say: 'oslo', e: 'neutral', t: 'Me has visto esperar al alba, chico. {p:0.4}Sabes que no tengo prisa, ni miedo. {p:0.3}Solo encargos.' }, { say: 'elara', e: 'sad', t: 'No dejes que lo decida su barba, Kaelen. {p:0.4}Yo también sé remar.' }]
      : sum.length ? [{ say: 'none', t: 'La luna y la marea pesan lo mismo.' }] : [];
    return sum.concat(lean, [{ say: 'none', t: 'La decisión es solo tuya.' }], finalChoice ? [finalChoice] : []);
  } });
})();
