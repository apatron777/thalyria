// GUION · Prólogo «La noche en que se apagó el faro» y Capítulo 1 «El Vigía del Cabo».
// Escenas como cinemáticas (órdenes: engine/cutscene.js). Coordenadas en tiles [col, fila].
// Tono épico; el humor, solo en boca de Flint.
//
// PRÓLOGO
//   P1 apertura (script-prologo.js): sueño de Kaelen y amanecer con Mira.
//   P2 pro.claro: Ilun y su aprendiz Elara. Elara se une.
//   P3 pro.faro: Halvard al anochecer. El faro tiembla y el mar escupe larvas. Empieza la defensa.
//   P4 pro.def1 / pro.def1b: combate en la plaza para salvar a Mira (tutorial). Flint sale de su fragua y se une.
//   P5 pro.def2 / pro.def2b: combate en el puerto (tutorial). El faro se apaga; la Matriarca bebe su luz;
//      la lanza de Kaelen despierta (Lanzada lunar). La Matriarca huye a la Gruta de la Marea.
//   P6 pro.gruta · pro.gruta.voz · pro.matriarca: la gruta, sus puzles y la Matriarca abisal (enseña los sellos).
//   P7 pro.matriarca.fin: la luz vuelve al faro. Amanecer. Halvard e Ilun revelan los cuatro faros de Vael.
// CAPÍTULO 1
//   C1 cap1.inicio: despedida de Mira; rumbo al Cabo del Vigía.
//   C2 cabo.llegada · cabo.firion · cabo.firion2 · cabo.reja · cabo.faro: Firion, los puzles y el faro que vuelve a brillar.
//   C3 cap1.arrecife · cap1.karkinos: el Arrecife y Karkinos, el Guardián (tres fases, sellos).
//   C4 cap1.final: la marea se lleva a Elara.
(function () {
  'use strict';
  const TH = window.TH;
  const S = (TH.data.scripts = TH.data.scripts || {});
  const T = (TH.data.talk = TH.data.talk || {});

  // ======================================================================
  // CONSEJOS DE COMBATE (tutorial; cada uno sale una sola vez por partida)
  // ======================================================================
  const C = 'Consejo';
  TH.data.tips = {
    basico: [
      { name: C, t: 'Cada ronda eliges la orden de cada miembro del grupo. {p:0.3}Después actúan todos, aliados y enemigos, del más rápido al más lento.' },
      { name: C, t: 'Mira los {*colores*} junto a cada ataque: son sus tipos. {p:0.3}Si un enemigo es débil a un tipo, el daño sale en {*dorado*}.' },
    ],
    timing: [
      { name: C, t: 'Al atacar aparece un {*anillo*} que se cierra. {p:0.3}Pulsa A justo cuando toque al enemigo: golpe perfecto, más daño y más combo.' },
      { name: C, t: 'Si pulsas antes de tiempo, el anillo se apaga. {p:0.3}Paciencia: el mar premia a quien espera la ola.' },
      { name: C, t: 'Cuando un enemigo te ataque, verás un {*destello*} sobre tu compañero. {p:0.3}Pulsa A en ese instante para {*bloquear*}: mitad de daño y más combo.' },
    ],
    orbes: [
      { name: C, t: 'Los ataques normales sueltan {*orbes de luz*}. {p:0.3}En el menú de órdenes, «Absorber orbe» (Q) carga al personaje.' },
      { name: C, t: 'Cada carga potencia su siguiente acción. {p:0.3}Atacar llena la barra; las técnicas la vacían con fuerza.' },
    ],
    combo: [
      { name: C, t: 'Golpes, perfectos y bloqueos llenan la barra de {*COMBO*}. {p:0.3}Con una carga, dos compañeros pueden lanzar una técnica combinada.' },
      { name: C, t: 'Las combinadas solo gastan el turno de quien las empieza. {p:0.3}Úsalas cuando el jefe quede aturdido.' },
    ],
    ecos: [
      { name: C, t: 'Los {*Ecos*} dan stats a quien los lleva. {p:0.3}En combate puedes liberarlos: hacen su efecto y quedan en espera.' },
      { name: C, t: 'Con dos o más Ecos en espera aparece «Invocar». {p:0.3}Después, los Ecos vuelven de uno en uno.' },
    ],
    sellos: [
      { name: C, t: 'Los jefes guardan su punto débil: {*pinzas, puños o tentáculos*} les protegen de los golpes a un solo objetivo.' },
      { name: C, t: 'Rompe esas partes, o aprovecha su {*debilidad*} cuando quede aturdido. {p:0.3}A lo bruto, un jefe aguanta mucho más que tú.' },
    ],
    relevo: [
      { name: C, t: 'Con cuatro en el grupo, el cuarto espera en la reserva. {p:0.3}«Cambiar por…» lo trae al frente sin gastar turno.' },
      { name: C, t: 'Si los tres de delante caen, el de reserva entra solo. {p:0.3}Nadie lucha solo mientras quede alguien en pie.' },
    ],
  };

  // ======================================================================
  // SELECTOR DE CAPÍTULOS (modo pruebas): grupo, nivel y equipo esperados
  // ======================================================================
  const FIN_PROLOGO = {
    'intro.vista': true, 'intro.mira': 'contar', objetivo: 'cabo', 'ilun.visto': true, 'prologo.claro': true, 'prologo.faro': true,
    'grupo.elara': true, 'grupo.flint': true, 'def.activa': true, 'def.b1': true, 'def.b1t': true, 'def.b1fin': true, 'def.b2': true, 'def.b2t': true,
    'def.lanza': true, 'def.fin': true, 'res.lanza': true, 'jefe.matriarca': true, 'gruta.jefe': true, 'gruta.entrada': true, 'gruta.voz': true,
    'prologo.fin': true, 'visto.gruta': true,
    'tip.basico': true, 'tip.timing': true, 'tip.orbes': true, 'tip.combo': true, 'tip.ecos': true, 'tip.sellos': true,
  };
  TH.data.chapters = {
    prologo: { name: 'Prólogo', test: 'Kaelen · Nv 1', newGame: true },
    cap1: {
      name: 'Capítulo 1', test: 'Kaelen y Elara Nv 5 · Flint Nv 4',
      map: 'brumaSalada', at: [19, 14.2], dir: 'down', hour: 8.4, day: 2,
      roster: ['kaelen', 'elara', 'flint'],
      levels: { kaelen: 5, elara: 5, flint: 4 },
      equip: { kaelen: { weapon: 'lanza_alba', armor: 'chaqueta_lona', acc: 'cinta_marinera' }, elara: { armor: 'ropa_viaje' } },
      ecos: ['eco_alba', 'eco_luna'], ecoSet: { kaelen: ['eco_alba'], elara: ['eco_luna'] },
      inv: { tonico: 5, tonico_plus: 1, pan_algas: 3, agua_luna: 2, concha: 2 },
      gold: 320,
      flags: FIN_PROLOGO,
      script: 'cap1.inicio',
    },
  };

  // ======================================================================
  // PRÓLOGO · P2 — El claro de Ilun
  // ======================================================================
  S['pro.claro'] = [
    { bars: true },
    { cam: [6, 6], time: 1.2, wait: false },
    { move: 'kaelen', to: [7.6, 8.2], speed: 50 },
    { face: 'kaelen', dir: 'up' },
    { place: 'ilun', at: [5, 6], dir: 'right' },
    { place: 'elara', at: [6.6, 6.6], dir: 'left' },
    { wait: 0.4 },
    { say: 'ilun', e: 'neutral', t: 'Kaelen. {p:0.3}O llegas tarde… {p:0.4}o el sol llega pronto. {p:0.3}Ya no sé distinguirlo.' },
    { say: 'elara', e: 'happy', t: 'Maestro, eso lo dice cada mañana.' },
    { face: 'elara', dir: 'kaelen' },
    { say: 'elara', e: 'neutral', t: 'Hola, Kaelen. {p:0.3}Ilun no ha pegado ojo. {p:0.3}Lleva toda la noche escuchando el mar.' },
    { say: 'kaelen', e: 'neutral', t: 'Elara. {p:0.3}¿Tú también lo has notado? {p:0.4}La tierra tiembla, la marea…' },
    { say: 'elara', e: 'sad', t: 'El agua del cuenco de luna se ha vuelto salada. {p:0.4}Eso no había pasado nunca.' },
    { if: 'intro.mira=contar', then: [{ say: 'ilun', e: 'sad', t: 'Mira me ha hablado de tu luz que habla.' }] },
    { say: 'kaelen', e: 'sad', t: 'Esta noche volví a soñar. {p:0.3}Una luz sobre el agua. {p:0.4}Me dijo que el {~Día Detenido~} no ha terminado.' },
    { emote: 'elara', icon: '!', time: 0.8 },
    { say: 'ilun', e: 'sad', t: '…' },
    { if: 'intro.respuesta=quien', then: [
      { say: 'kaelen', e: 'sad', t: 'Y que alguien me envió muy lejos. {p:0.3}Para que un día pudiera volver.' },
      { say: 'ilun', e: 'neutral', t: 'Hay preguntas que solo se responden cuando llega su marea. {p:0.4}Esta aún no ha llegado.' },
    ] },
    { say: 'ilun', e: 'neutral', t: 'Escuchad los dos. {p:0.4}Antes que el pueblo, antes que el puerto, {p:0.3}antes que las barcas… {p:0.4}estaban los faros.' },
    { say: 'ilun', e: 'neutral', t: 'Cuatro faros en todo Vael. {p:0.3}No los encendimos nosotros. {p:0.4}Los heredamos de {*Thalyria*}.' },
    { say: 'ilun', e: 'sad', t: 'Su luz no guía barcos. {p:0.4}Sujeta el día en su sitio. {p:0.3}Mientras brillen, la marea no puede alcanzar el amanecer.' },
    { say: 'elara', e: 'neutral', t: 'Y si la marea cada noche llega más lejos…' },
    { say: 'ilun', e: 'angry', t: '…es que algo está bebiendo la luz. {p:0.4}Desde abajo.' },
    {
      who: 'ilun', e: 'neutral', t: 'Pregunta, muchacho. {p:0.3}Mientras el fuego dure, contestaré.',
      choice: [
        { t: '¿Qué puede beberse la luz de un faro?', then: [
          { say: 'ilun', e: 'sad', t: 'Las cosas del {*Fondo*}. {p:0.4}Lo que quedó bajo el mar cuando Thalyria se hundió. {p:0.3}Tienen hambre de sol.' },
        ] },
        { t: '¿Por qué me hablas a mí de esto?', then: [
          { say: 'ilun', e: 'neutral', t: 'Porque el mar te trajo a esta playa hace diecisiete años, {p:0.3}envuelto en una vela y con esa lanza en los brazos.' },
          { say: 'kaelen', e: 'sad', t: '…' },
          { say: 'ilun', e: 'neutral', t: 'Y el mar no devuelve nada por casualidad.' },
        ] },
        { t: '¿Qué tenemos que hacer?', then: [
          { say: 'ilun', e: 'happy', t: 'Ah. {p:0.3}La pregunta de alguien que ya ha decidido.' },
        ] },
      ],
    },
    { say: 'ilun', e: 'neutral', t: 'Al caer la tarde subid al faro. {p:0.3}Halvard, el farero, lleva cincuenta años mirando esa luz. {p:0.4}Si algo ha cambiado, él lo sabe.' },
    { say: 'ilun', e: 'neutral', t: 'Elara irá contigo. {p:0.3}Lleva agua de luna para la lente: {p:0.2}el faro tendrá sed esta noche.' },
    { face: 'elara', dir: 'ilun' },
    { say: 'elara', e: 'sad', t: 'Maestro… {p:0.3}¿y si de verdad viene algo?' },
    { say: 'ilun', e: 'happy', t: 'Entonces recordarás que la luna también empuja la marea. {p:0.4}No solo la padece.' },
    { face: 'elara', dir: 'kaelen' },
    { say: 'elara', e: 'happy', t: 'Bueno. {p:0.3}Parece que hoy somos dos, Kaelen.' },
    { set: 'grupo.elara' },
    { set: 'ilun.visto' },
    { join: 'elara', at: [6.6, 6.6] },
    { level: 'elara', lv: 1 },
    { refresh: true },
    { set: 'objetivo', v: 'faro' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: al caer la tarde, sube al faro (noreste)' },
    { save: true },
  ];

  // ======================================================================
  // PRÓLOGO · P3 — El faro al anochecer
  // ======================================================================
  S['pro.faro'] = [
    { bars: true },
    { if: 'objetivo=faro', then: [{ hour: 19.2, time: 2.5, wait: false }] },
    { cam: [33, 6], time: 1.4, wait: false },
    { move: 'kaelen', to: [31.6, 8.1], speed: 50 },
    { face: 'kaelen', dir: 'right' },
    { face: 'halvard', dir: 'kaelen' },
    { say: 'halvard', e: 'neutral', t: 'El chico de la playa. {p:0.3}Y la aprendiz de Ilun. {p:0.4}Os esperaba más tarde… {p:0.3}o más pronto. {p:0.3}El tiempo ya no se porta como antes.' },
    { say: 'elara', e: 'neutral', t: 'Ilun nos envía, señor Halvard. {p:0.3}Traigo agua de luna para la lente.' },
    { say: 'halvard', e: 'happy', t: 'Bendito sea ese viejo terco. {p:0.4}Deja el cuenco en el primer peldaño, niña. {p:0.3}Yo me encargo.' },
    { say: 'halvard', e: 'neutral', t: '¿Sabéis lo que es esta torre? {p:0.4}La gente cree que es un faro.' },
    { say: 'halvard', e: 'neutral', t: 'En lo alto arde el {*Ojo del Alba*}: un pedazo del último amanecer de Thalyria. {p:0.4}Mientras brille, el día de mañana {*existe*}.' },
    { say: 'kaelen', e: 'neutral', t: '¿Y si se apaga?' },
    { say: 'halvard', e: 'sad', t: 'Entonces mañana no llega. {p:0.4}Llega el mar.' },
    { face: 'halvard', dir: 'down' },
    { say: 'halvard', e: 'sad', t: 'Esa lanza que llevas, muchacho. {p:0.4}La vi el día que el mar te dejó en la arena. {p:0.3}Brillaba igual que el Ojo.' },
    { say: 'kaelen', e: 'sad', t: 'Es solo una lanza de pesca. {p:0.3}Tiene la punta roma.' },
    { say: 'halvard', e: 'neutral', t: 'Eso dicen todas las cosas que duermen.' },
    // anochece de golpe
    { hour: 20.6, time: 2.2, wait: false },
    { clock: 0 },
    { shake: 3, time: 1.4, wait: false },
    { emote: 'kaelen', icon: '!', time: 0.8, wait: false },
    { emote: 'elara', icon: '!', time: 0.8 },
    { say: 'elara', e: 'sad', t: '¡Otra vez la tierra!' },
    { cam: [34, 2], time: 1.0 },
    { flash: 0.3, color: '#fff0c0' },
    { wait: 0.3 },
    { flash: 0.3, color: '#fff0c0' },
    { say: 'halvard', e: 'angry', t: '{~¡La luz parpadea!~} {p:0.4}En cincuenta años no ha parpadeado {*ni una vez*}.' },
    { cam: [20, 22], time: 1.6 },
    { shake: 2, time: 1.2, wait: false },
    { say: 'none', name: 'Gritos en el puerto', t: '{~¡Del agua! {p:0.2}¡Salen del agua!~}' },
    { cam: [32, 8], time: 1.0 },
    { say: 'halvard', e: 'angry', t: 'Larvas del Fondo… {p:0.4}Así empezó la otra vez. {p:0.3}Así empezó {*todo*}.' },
    { say: 'halvard', e: 'angry', t: 'Yo me quedo con la luz. {p:0.4}Vosotros, ¡al pueblo! {p:0.3}Que no quede nadie fuera de casa.' },
    { say: 'kaelen', e: 'angry', t: 'Mira está en la plaza. {p:0.3}¡Elara, vamos!' },
    { set: { 'def.activa': true, objetivo: 'defensa' } },
    { refresh: true },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: baja al pueblo y protege a los vecinos' },
    { save: true },
  ];

  // ======================================================================
  // PRÓLOGO · P4 — La defensa de la plaza (tutorial) y Flint
  // ======================================================================
  S['pro.def1'] = [
    { bars: true },
    { fade: 1, time: 0.3 },
    { place: 'kaelen', at: [23.4, 13.6], dir: 'left' },
    { place: 'mira', at: [18.6, 12.4], dir: 'down' },
    { cam: [20, 13.5] },
    { fade: 0, time: 0.4 },
    { say: 'mira', e: 'sad', t: '{~¡Kaelen!~} {p:0.3}¡Están por todas partes! {p:0.3}¡Han salido del pozo!' },
    { shake: 2, time: 0.6, wait: false },
    { say: 'kaelen', e: 'angry', t: 'Ponte detrás de mí, Mira. {p:0.3}No te muevas.' },
    { say: 'elara', e: 'neutral', t: 'Kaelen, ataca cuando se acerquen. {p:0.3}Yo te cubro con la luna.' },
    { battle: ['larva', 'larva'], at: [19.5, 14.6], once: 'def.b1', tips: ['basico', 'timing'], after: 'pro.def1b' },
  ];
  S['pro.def1b'] = [
    { bars: true },
    { face: 'kaelen', dir: 'mira' },
    { say: 'mira', e: 'sad', t: 'Eran… {p:0.3}eran como los peces de luz que vio el pequeño Tobías. {p:0.4}Pero con dientes.' },
    { say: 'kaelen', e: 'neutral', t: 'Corre a la posada. {p:0.3}Atrancad la puerta y no abráis hasta el alba.' },
    { say: 'mira', e: 'angry', t: '¡Ni se te ocurra morirte, ¿me oyes?!' },
    { move: 'mira', path: [[18.6, 16.6], [12, 17.6]], run: true, wait: false },
    { wait: 0.6 },
    // Flint irrumpe
    { shake: 3, time: 0.5, wait: false },
    { say: 'none', name: '???', t: '{~¡QUITA DE EN MEDIO, BICHO!~}' },
    { cam: [26, 16], time: 0.8 },
    { move: 'flint', path: [[27.4, 17.6], [24.2, 14.6]], run: true },
    { face: 'flint', dir: 'kaelen' },
    { say: 'flint', e: 'angry', t: 'Uno se me ha metido en la fragua. {p:0.3}{*En la fragua*}. {p:0.4}Se ha comido medio saco de carbón y me ha mirado como si el postre fuese yo.' },
    { say: 'flint', e: 'happy', t: 'Le he explicado con el martillo que no. {p:0.4}Muy didáctico.' },
    { say: 'kaelen', e: 'happy', t: 'Flint. {p:0.3}Llegas justo a tiempo.' },
    { say: 'flint', e: 'neutral', t: 'Yo siempre llego justo a tiempo. {p:0.3}Lo que pasa es que el tiempo suele llegar tarde.' },
    { say: 'elara', e: 'neutral', t: 'Vienen del puerto. {p:0.3}Si bajamos juntos, podemos cortarles el paso en el muelle.' },
    { say: 'flint', e: 'happy', t: 'Bajar, cortar el paso, golpear cosas. {p:0.4}Por fin un plan que entiendo entero.' },
    { set: 'grupo.flint' },
    { join: 'flint' },
    { level: 'flint', lv: 2 },
    { refresh: true },
    { set: { 'def.b1fin': true, objetivo: 'puerto' } },
    { bars: false },
    { cam: 'free', time: 0.5 },
    { toast: 'Objetivo: defiende el puerto (sur)' },
    { save: true },
  ];

  // ======================================================================
  // PRÓLOGO · P5 — El puerto, el faro que se apaga y la lanza que despierta
  // ======================================================================
  S['pro.def2'] = [
    { bars: true },
    { cam: [21, 22], time: 0.8, wait: false },
    { move: 'kaelen', to: [21, 21.2], speed: 70 },
    { face: 'kaelen', dir: 'right' },
    { say: 'flint', e: 'angry', t: 'Ahí está la fiesta. {p:0.3}Y han traído a los primos de concha dura.' },
    { say: 'elara', e: 'neutral', t: 'Los golpes sueltan luz, ¿lo notáis? {p:0.3}Usadla.' },
    { battle: ['cangrejo', 'larva', 'larva'], at: [25, 21.4], once: 'def.b2', tips: ['orbes', 'combo'], after: 'pro.def2b' },
  ];
  S['pro.def2b'] = [
    { bars: true },
    { say: 'flint', e: 'happy', t: '¡Ja! {p:0.3}Que vengan más. {p:0.4}…Era una forma de hablar, ¿eh? {p:0.3}Que no vengan más.' },
    // el faro se apaga
    { shake: 4, time: 1.6, wait: false },
    { cam: [34, 3], time: 1.0 },
    { flash: 0.25, color: '#fff0c0' },
    { wait: 0.4 },
    { set: 'faro.apagado' },
    { wait: 1.0 },
    { say: 'elara', e: 'sad', t: 'El faro… {p:0.6}se ha apagado.' },
    { cam: [16, 24], time: 1.6 },
    { set: 'def.b2' },
    { refresh: true },
    { shake: 3, time: 1.0, wait: false },
    { say: 'none', name: 'Matriarca abisal', t: '{~Luzzz…~} {p:0.5}Sabe a sol viejo. {p:0.3}A días que ya no existen.' },
    { say: 'none', name: 'Matriarca abisal', t: 'Mis crías tendrán sol esta noche. {p:0.4}Y mañana… {p:0.3}{*mañana no vendrá*}.' },
    { say: 'flint', e: 'angry', t: 'Eso es una madre. {p:0.3}Una madre enorme. {p:0.4}Odio cuando hay madre.' },
    { say: 'kaelen', e: 'angry', t: 'Se ha bebido la luz del faro…' },
    // el sueño se cumple
    { emote: 'kaelen', icon: '…', time: 1.2 },
    { say: 'voice', t: '{s:0.7}Cuando la luz del faro se apague…' },
    { say: 'voice', t: '{s:0.6}{*despierta*}.' },
    { flash: 0.9, color: '#ffffff' },
    { shake: 2, time: 0.8, wait: false },
    { say: 'none', t: 'La vieja lanza de pesca arde en las manos de Kaelen. {p:0.4}La punta roma se abre como un amanecer.' },
    { equip: 'kaelen', slot: 'weapon', item: 'lanza_alba', replace: true },
    { set: 'res.lanza' },
    { say: 'none', t: '¡La lanza ha despertado! {p:0.3}Kaelen empuña la {*Lanza del Alba*}.' },
    { say: 'none', t: 'Nueva Resonancia: {*Lanzada lunar*}. {p:0.3}Pulsa X (o B corto) para lanzar un haz que empuja bloques y enciende cristales.' },
    { say: 'elara', e: 'sad', t: 'Kaelen… {p:0.3}tus ojos. {p:0.4}Brillan como el Ojo del faro.' },
    { say: 'kaelen', e: 'angry', t: '¡Devuélvela!' },
    { flash: 0.5, color: '#bfe0ff' },
    { shake: 5, time: 0.8, wait: false },
    { say: 'none', name: 'Matriarca abisal', t: '{~¡AAAH!~} {p:0.4}¡Esa lanza! {p:0.3}¡Esa lanza es del {*otro lado*}!' },
    { set: 'def.lanza' },
    { refresh: true },
    { wait: 0.6 },
    { say: 'elara', e: 'neutral', t: 'Ha huido hacia las rocas del oeste. {p:0.3}Hacia la {*Gruta de la Marea*}.' },
    { say: 'flint', e: 'neutral', t: 'La gruta. {p:0.3}Claro. {p:0.4}Porque perseguir a un monstruo hasta su cueva oscura siempre sale bien.' },
    { say: 'kaelen', e: 'angry', t: 'Se lleva la luz que sujeta el mañana. {p:0.4}Si no la recuperamos antes del alba, no habrá alba.' },
    { say: 'flint', e: 'happy', t: 'Vale, vale. {p:0.3}Dicho así suena más heroico que como lo había dicho yo.' },
    { set: { objetivo: 'gruta' } },
    { bars: false },
    { cam: 'free', time: 0.5 },
    { toast: 'Objetivo: persigue a la Matriarca hasta la Gruta de la Marea (playa del oeste)' },
    { save: true },
  ];

  // ======================================================================
  // PRÓLOGO · P6 — La Gruta de la Marea
  // ======================================================================
  S['pro.gruta'] = [
    { say: 'elara', e: 'sad', t: 'Qué frío… {p:0.4}El agua aquí dentro está quieta, como si contuviera el aliento.' },
    { say: 'flint', e: 'neutral', t: 'Cristales que brillan solos, paredes que gotean, olor a pez muerto. {p:0.4}Me recuerda a la casa de mi tía.' },
    { say: 'kaelen', e: 'neutral', t: 'La Lanzada puede despertar esos cristales. {p:0.3}Si algo nos cierra el paso, probaré con ella.' },
    { toast: 'X (o B corto): Resonancia · R: elegir otra Resonancia del grupo' },
  ];
  S['pro.gruta.voz'] = [
    { shake: 1, time: 0.8, wait: false },
    { say: 'voice', t: '{s:0.7}Kaelen…' },
    { say: 'voice', t: 'La luz que bebió no es suya. {p:0.4}Ni tuya. {p:0.4}Es de todos los mañanas.' },
    { say: 'elara', e: 'sad', t: '¿Lo has oído tú también? {p:0.4}Una voz… {p:0.3}en el agua.' },
    { say: 'kaelen', e: 'neutral', t: 'Es la voz de mi sueño. {p:0.4}Ya no estoy dormido.' },
  ];
  S['pro.matriarca'] = [
    { bars: true },
    { cam: [12, 4], time: 1.4 },
    { shake: 2, time: 1.0, wait: false },
    { say: 'none', name: 'Matriarca abisal', t: 'Cuánta luz cabe en un pescador… {p:0.5}Llevo mil años con hambre, niño. {p:0.3}Mil años sin un solo amanecer.' },
    { say: 'kaelen', e: 'angry', t: 'Devuelve la luz del faro. {p:0.4}No es tuya.' },
    { say: 'none', name: 'Matriarca abisal', t: '¿Tuya, entonces? {p:0.4}El Fondo te recuerda. {p:0.3}Te soltó una vez… {p:0.4}{*no volverá a hacerlo*}.' },
    { say: 'elara', e: 'angry', t: 'Kaelen, mira su lomo: {p:0.3}la luz que robó se le ve por dentro. {p:0.4}¡Golpeadla con fuego y con luz!' },
    { say: 'flint', e: 'neutral', t: 'Lo que ella teme. {p:0.3}Martillo. {p:0.4}Todo el mundo teme al martillo.' },
    { battle: ['matriarca'], at: [12, 3.6], once: 'jefe.matriarca', tips: ['ecos'], after: 'pro.matriarca.fin' },
  ];

  // ======================================================================
  // PRÓLOGO · P7 — La luz vuelve. Amanecer.
  // ======================================================================
  S['pro.matriarca.fin'] = [
    { bars: true },
    { refresh: true },
    { shake: 3, time: 1.4, wait: false },
    { say: 'none', name: 'Matriarca abisal', t: '{~No… {p:0.3}no…~} {p:0.5}El Fondo… {p:0.3}vendrá… {p:0.4}a por ti…' },
    { flash: 0.8, color: '#fff0c0' },
    { say: 'none', t: 'La Matriarca se deshace en espuma negra. {p:0.4}De ella brota una esfera de luz dorada que flota hacia Kaelen.' },
    { say: 'kaelen', e: 'neutral', t: 'Está caliente. {p:0.4}Como el sol de por la mañana.' },
    { say: 'elara', e: 'happy', t: 'Es la luz del faro. {p:0.3}¡La tenemos!' },
    { say: 'flint', e: 'happy', t: '¿Ves? {p:0.3}Martillo. {p:0.4}No falla.' },
    { fade: 1, time: 1.0 },
    { warp: 'brumaSalada', at: [31.6, 8.1], dir: 'right', hour: 5.4 },
    { roster: ['kaelen', 'elara', 'flint'] },
    { place: 'halvard', at: [34, 8], dir: 'left' },
    { place: 'ilun', at: [33, 8.6], dir: 'left' },
    { cam: [33, 6] },
    { wait: 0.6 },
    { fade: 0, time: 1.4 },
    { say: 'halvard', e: 'sad', t: 'Volvéis. {p:0.4}Los tres. {p:0.3}Y traéis algo que brilla.' },
    { say: 'kaelen', e: 'neutral', t: 'La luz del Ojo, señor Halvard.' },
    { flash: 0.9, color: '#ffffff' },
    { set: 'faro.apagado', v: false },
    { set: 'def.fin' },
    { clock: 1 },
    { cam: [34, 2], time: 1.0 },
    { hour: 6.4, time: 4, wait: false },
    { say: 'none', t: 'La luz sube por la torre como sube la marea… {p:0.4}y el Ojo del Alba vuelve a arder.' },
    { refresh: true },
    { cam: [33, 6], time: 1.2 },
    { say: 'halvard', e: 'happy', t: 'Cincuenta años. {p:0.4}Cincuenta años mirando esa luz, {p:0.3}y hoy es la primera vez que la veo {*volver*}.' },
    { say: 'ilun', e: 'neutral', t: 'Habéis hecho algo que no se hacía desde antes del Día Detenido. {p:0.4}Pero escuchad bien lo que viene ahora.' },
    { say: 'ilun', e: 'sad', t: 'Esta noche no se apagó un faro. {p:0.4}Se apagaron {*dos*}.' },
    { say: 'halvard', e: 'sad', t: 'Mirad al este. {p:0.4}Allí, sobre el cabo. {p:0.3}El {*faro del Vigía*} sigue a oscuras.' },
    { say: 'ilun', e: 'neutral', t: 'Cuatro faros sujetan el día de Vael. {p:0.4}Si cae uno, la marea avanza. {p:0.3}Si caen todos…' },
    { say: 'elara', e: 'sad', t: '…el Día Detenido vuelve.' },
    { say: 'halvard', e: 'neutral', t: 'En el cabo hay un guardia. {p:0.3}Firion, el último de la Guardia del Vigía. {p:0.4}Un muchacho serio que no ha faltado a su puesto ni un solo día.' },
    { say: 'halvard', e: 'sad', t: 'Si el faro está apagado… {p:0.4}es que algo le ha impedido encenderlo.' },
    { say: 'flint', e: 'neutral', t: 'Dejadme adivinar. {p:0.3}Vamos a ir. {p:0.4}A pie. {p:0.3}Por un acantilado.' },
    { say: 'kaelen', e: 'neutral', t: 'Vamos a ir.' },
    { say: 'ilun', e: 'happy', t: 'Primero dormid. {p:0.4}Hasta los héroes necesitan que llegue la mañana. {p:0.3}Y gracias a vosotros, {*llegará*}.' },
    { fade: 1, time: 1.2 },
    { chapter: 'Fin del Prólogo', title: 'La noche en que se apagó el faro', sub: 'Thalyria · El Día Detenido' },
    { set: { 'prologo.fin': true, objetivo: 'cabo' } },
    { sleep: 8 },
    { place: 'ilun', at: [5, 6], dir: 'right' },
    { release: 'ilun', home: true },
    { place: 'halvard', at: [34, 8], dir: 'down' },
    { release: 'halvard', home: true },
    { warp: 'brumaSalada', at: [19, 14.2], dir: 'down', hour: 8.4 },
    { call: 'cap1.inicio' },
  ];

  // ======================================================================
  // CAPÍTULO 1 · C1 — Partida
  // ======================================================================
  S['cap1.inicio'] = [
    { bars: true },
    { fade: 1 },
    { set: { 'faro.apagado': false, 'def.fin': true, objetivo: 'cabo' } },
    { clock: 1 },
    { refresh: true },
    { place: 'mira', at: [19, 15.8], dir: 'up' },
    { cam: [19, 14] },
    { chapter: 'Capítulo 1', title: 'El Vigía del Cabo', sub: 'Thalyria · El Día Detenido' },
    { fade: 0, time: 1.2 },
    { banner: ['Bruma Salada', 'La mañana siguiente'] },
    { wait: 1.0 },
    { say: 'mira', e: 'neutral', t: 'Así que os vais. {p:0.4}Al cabo. {p:0.3}Donde las gaviotas negras.' },
    { say: 'kaelen', e: 'neutral', t: 'El faro del Vigía sigue apagado, Mira. {p:0.4}Si no lo encendemos, la marea volverá esta noche.' },
    { say: 'mira', e: 'sad', t: 'Ya lo sé. {p:0.4}Lo ha dicho Halvard en la plaza, con la voz de los entierros.' },
    { say: 'mira', e: 'happy', t: 'Toma. {p:0.3}Pan de algas. {p:0.4}Está un poco quemado porque lo he hecho yo.' },
    { give: 'pan_algas', n: 3 },
    { say: 'flint', e: 'happy', t: 'Un poco quemado es como más me gusta. {p:0.3}Así tiene carácter.' },
    { say: 'mira', e: 'angry', t: 'Elara, {p:0.3}cuida de que este no haga ninguna tontería.' },
    { say: 'elara', e: 'happy', t: 'Lo intentaré. {p:0.4}Pero hasta la luna tiene un límite.' },
    { say: 'mira', e: 'sad', t: 'Kaelen… {p:0.4}volved. {p:0.3}Los tres.' },
    { say: 'kaelen', e: 'happy', t: 'Volveremos. {p:0.3}Con el sol detrás.' },
    { move: 'mira', path: [[19, 17], [12, 17.6]], wait: false },
    { wait: 0.6 },
    { say: 'elara', e: 'neutral', t: 'Nerea ha recibido género nuevo para la guardia del cabo. {p:0.3}Deberíamos pasar por su puesto antes de salir.' },
    { set: 'objetivo', v: 'cabo' },
    { refresh: true },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: Ruta de los Acantilados (este) → Cabo del Vigía' },
    { save: true },
  ];

  // ======================================================================
  // CAPÍTULO 1 · C2 — El Cabo del Vigía
  // ======================================================================
  S['cabo.llegada'] = [
    { bars: true },
    { cam: [33, 2], time: 2.2 },
    { wait: 0.6 },
    { say: 'elara', e: 'sad', t: 'Ahí está. {p:0.4}El faro del Vigía. {p:0.3}Tan alto que parece sujetar las nubes.' },
    { say: 'kaelen', e: 'neutral', t: 'Y tan apagado como decía Halvard.' },
    { say: 'flint', e: 'neutral', t: 'Arriba del todo, claro. {p:0.4}Ningún faro en la historia se ha construido en un sitio llano y cómodo.' },
    { cam: 'leader', time: 1.6 },
    { bars: false },
    { toast: 'Objetivo: sube al faro del Vigía' },
  ];
  S['cabo.firion'] = [
    { bars: true },
    { cam: [31, 7], time: 1.2 },
    { shake: 2, time: 0.6, wait: false },
    { say: 'none', name: '???', t: '{~¡Atrás! {p:0.3}¡Atrás, he dicho!~}' },
    { face: 'firion', dir: 'up' },
    { say: 'firion', e: 'angry', t: 'Doce noches. {p:0.4}Doce noches sin dormir y seguís viniendo. {p:0.3}Este puesto no se abandona.' },
    { emote: 'kaelen', icon: '!', time: 0.8 },
    { say: 'kaelen', e: 'angry', t: '¡Está solo contra todas! {p:0.3}¡Vamos!' },
    { move: 'kaelen', to: [29, 8.5], run: true },
    { face: 'firion', dir: 'kaelen' },
    { say: 'firion', e: 'angry', t: '¿Civiles? {p:0.3}¿Aquí? {p:0.4}…No hay tiempo. {p:0.3}Tú, el de la lanza, {*cúbreme el flanco*}.' },
    { set: 'grupo.firion' },
    { join: 'firion', quiet: true },
    { level: 'firion', lv: 6 },
    { refresh: true },
    { say: 'none', t: '{*Firion*} lucha junto al grupo.' },
    { battle: ['gaviota_abisal', 'gaviota', 'gaviota'], at: [24, 6], once: 'cabo.batalla', tips: ['relevo'], after: 'cabo.firion2' },
  ];
  S['cabo.firion2'] = [
    { bars: true },
    { set: 'cabo.firion' },
    { refresh: true },
    { say: 'firion', e: 'neutral', t: 'Gracias. {p:0.4}Firion, de la Guardia del Vigía. {p:0.3}La guardia entera, a día de hoy.' },
    { say: 'kaelen', e: 'neutral', t: 'Kaelen, de Bruma Salada. {p:0.3}Ella es Elara, aprendiz de Ilun. {p:0.3}Y él…' },
    { say: 'flint', e: 'happy', t: 'Flint. {p:0.3}Herrero. {p:0.4}El que arregla lo que vosotros los guardias rompéis.' },
    { say: 'firion', e: 'neutral', t: 'Anoche, a medianoche, algo subió desde el mar por la escalera de la lente. {p:0.4}Ni lo vi. {p:0.3}Solo sentí el frío… {p:0.3}y la luz se fue.' },
    { say: 'firion', e: 'sad', t: 'Al apagarse el Ojo, la reja de la torre se cerró sola. {p:0.4}El mecanismo es más viejo que la guardia. {p:0.3}Y yo no sé abrirlo.' },
    { say: 'elara', e: 'neutral', t: 'En Bruma Salada pasó lo mismo. {p:0.4}Kaelen recuperó la luz con su lanza.' },
    { face: 'firion', dir: 'kaelen' },
    { say: 'firion', e: 'sad', t: '…Una lanza que devuelve la luz. {p:0.4}Los libros de la guardia hablan de una así. {p:0.3}Pensé que eran cuentos.' },
    { say: 'firion', e: 'neutral', t: 'El cartel del mecanismo dice: {p:0.3}«Cuando el cristal mire y la piedra pese, el Vigía abrirá».' },
    { say: 'flint', e: 'happy', t: 'Piedra que pese. {p:0.4}Por fin un acertijo escrito para mí.' },
    { say: 'firion', e: 'neutral', t: 'Y arriba, en la explanada, el molino de guardia. {p:0.3}Sé mover el viento: {p:0.2}es lo primero que aprende un vigía.' },
    { say: 'none', t: 'Nueva Resonancia: {*Ráfaga*} (Firion). {p:0.3}Apaga fuegos, hace girar molinos y planea sobre huecos.' },
    { set: 'objetivo', v: 'reja' },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: abre la reja del faro (el cristal y la piedra)' },
    { save: true },
  ];
  S['cabo.reja'] = [
    { say: 'firion', e: 'happy', t: 'Se ha abierto. {p:0.4}Doce noches mirando esa reja… {p:0.3}y la abre un pescador con un herrero.' },
    { say: 'flint', e: 'happy', t: 'Y una aprendiz. {p:0.3}Y un guardia. {p:0.4}Somos un gremio muy completo.' },
    { toast: 'Objetivo: sube a la terraza de la lente y vuelve a encender el faro' },
  ];
  S['cabo.faro'] = [
    { bars: true },
    { cam: [35, 0], time: 1.0 },
    { shake: 3, time: 1.6, wait: false },
    { flash: 0.8, color: '#ffffff' },
    { set: 'cap1.faro' },
    { say: 'none', t: 'El cristal del Ojo bebe la luz de la lanza… {p:0.4}y la torre entera despierta.' },
    { hour: 18.8, time: 3, wait: false },
    { cam: [33, -1], time: 2.0 },
    { say: 'firion', e: 'happy', t: '{~Arde…~} {p:0.4}El Vigía arde otra vez.' },
    { say: 'elara', e: 'neutral', t: 'Mirad el mar. {p:0.4}La marea… {p:0.3}está retrocediendo.' },
    { cam: [20, 20], time: 2.0 },
    { say: 'none', t: 'Allá abajo, el agua se retira de la cala de los Acantilados y deja al descubierto el camino del {*Arrecife de Coral*}.' },
    { cam: [35, 1], time: 1.6 },
    { say: 'firion', e: 'sad', t: 'Eso no me tranquiliza. {p:0.4}Al bajar la marea, el arrecife queda despierto. {p:0.3}Y en el arrecife vive {*Karkinos*}.' },
    { say: 'kaelen', e: 'neutral', t: '¿Karkinos?' },
    { say: 'firion', e: 'neutral', t: 'El Guardián. {p:0.4}Un cangrejo más viejo que la isla. {p:0.3}Durante siglos protegió este paso de lo que sube del Fondo.' },
    { say: 'firion', e: 'sad', t: 'Pero hace doce noches lo vi desde aquí. {p:0.4}Sus ojos brillaban como los de las larvas.' },
    { say: 'elara', e: 'sad', t: 'Si el Fondo ha llegado hasta el Guardián… {p:0.4}nada impide que la marea vuelva a por los faros.' },
    { say: 'flint', e: 'neutral', t: 'Un cangrejo gigante, poseído, más viejo que la isla. {p:0.4}Vale. {p:0.3}¿Alguien ha traído limón?' },
    { say: 'firion', e: 'neutral', t: 'Iré con vosotros. {p:0.4}El faro arde y no necesita guardia mientras arda. {p:0.3}Lo que lo amenaza, sí.' },
    { say: 'kaelen', e: 'happy', t: 'Bienvenido al grupo, Firion.' },
    { set: 'objetivo', v: 'arrecife' },
    { refresh: true },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Objetivo: el Arrecife de Coral (bajando a la cala de los Acantilados)' },
    { save: true },
  ];

  // ======================================================================
  // CAPÍTULO 1 · C3 — El Arrecife y Karkinos
  // ======================================================================
  S['cap1.arrecife'] = [
    { say: 'elara', e: 'neutral', t: 'El coral está pálido. {p:0.4}Como si algo le hubiera chupado el color.' },
    { say: 'firion', e: 'neutral', t: 'La arena del Guardián está al este. {p:0.3}Preparaos antes de cruzarla: {p:0.2}no habrá vuelta atrás.' },
  ];
  S['cap1.karkinos'] = [
    { bars: true },
    { cam: [36, 9], time: 1.6 },
    { shake: 3, time: 1.4, wait: false },
    { say: 'none', t: 'La arena tiembla. {p:0.4}Lo que parecía una roca cubierta de coral {*abre los ojos*}.' },
    { say: 'firion', e: 'sad', t: 'Karkinos… {p:0.4}Guardián. {p:0.3}¿Me recuerdas? {p:0.4}Te traía peces de niño.' },
    { say: 'none', name: 'Karkinos', t: 'Recuerdo… {p:0.5}a un niño. {p:0.4}Y recuerdo mil mareas de silencio. {p:0.3}El Fondo me ha dado {*voz*}.' },
    { say: 'none', name: 'Karkinos', t: 'Me promete que, cuando caigan los faros, el mar será uno solo. {p:0.4}Sin orillas. {p:0.3}Sin mañanas que vigilar.' },
    { say: 'elara', e: 'angry', t: 'Eso no es descanso. {p:0.4}Es ahogarse.' },
    { say: 'kaelen', e: 'angry', t: 'Vamos a sacarte el Fondo de dentro, Guardián. {p:0.4}Aunque tengamos que partirte la concha.' },
    { say: 'flint', e: 'neutral', t: 'Con respeto. {p:0.3}Le partimos la concha con respeto.' },
    { heal: true },
    { say: 'none', t: 'El grupo recobra el aliento. {p:0.3}PV y PM al máximo.' },
    { battle: ['karkinos', 'pinza_izq', 'pinza_der'], at: [37, 10], once: 'jefe.karkinos', after: 'cap1.final' },
  ];

  // ======================================================================
  // CAPÍTULO 1 · C4 — Elara cae al mar
  // ======================================================================
  S['cap1.final'] = [
    { bars: true },
    { refresh: true },
    { cam: [36, 10], time: 1.0 },
    { shake: 2, time: 1.0, wait: false },
    { say: 'none', name: 'Karkinos', t: '{s:0.7}El niño… {p:0.5}de los peces… {p:0.6}Firion.' },
    { say: 'firion', e: 'sad', t: 'Estoy aquí, Guardián.' },
    { say: 'none', name: 'Karkinos', t: 'No es el último faro… {p:0.4}el que buscan. {p:0.5}Buscan {*al que trae la luz*}. {p:0.4}Al chico… {p:0.3}de la lanza.' },
    { say: 'none', name: 'Karkinos', t: 'Corred. {p:0.5}El Fondo… {p:0.4}no perdona… {p:0.4}que le quiten lo suyo…' },
    { flash: 0.6, color: '#bfe0ff' },
    { say: 'none', t: 'El coral del Guardián se vuelve gris, y luego blanco, y luego arena.' },
    { wait: 0.4 },
    // el mar se alza
    { shake: 6, time: 2.4, wait: false },
    { say: 'elara', e: 'sad', t: '¿Oís eso?' },
    { cam: [40, 10], time: 0.8 },
    { say: 'none', t: '{~Una ola negra se levanta sobre el arrecife,~} {p:0.3}tan alta como el faro del Vigía.' },
    { say: 'firion', e: 'angry', t: '¡Es una marea del Fondo! {p:0.3}¡Va a por {*él*}! {p:0.3}¡Kaelen, apártate!' },
    { emote: 'kaelen', icon: '!', time: 0.6 },
    { say: 'kaelen', e: 'angry', t: '¡No puedo moverme! {p:0.4}El agua… {p:0.3}me tira de los pies…' },
    { say: 'elara', e: 'angry', t: '{*¡No!*} {p:0.4}La luna también empuja la marea. {p:0.3}¡No solo la padece!' },
    { flash: 1.0, color: '#d8e0ff' },
    { shake: 5, time: 1.2, wait: false },
    { say: 'none', t: 'Elara alza el bastón. {p:0.4}La ola se parte en dos {p:0.3}y su luz arranca a Kaelen de la corriente.' },
    { say: 'none', t: 'Pero el mar no suelta lo que agarra. {p:0.6}Solo lo cambia por otra cosa.' },
    { say: 'kaelen', e: 'sad', t: '{~¡ELARA!~}' },
    { say: 'elara', e: 'sad', t: 'Kaelen… {p:0.5}enciende… {p:0.4}los otros faros…' },
    { leave: 'elara' },
    { set: 'grupo.elara', v: false },
    { flash: 0.7, color: '#000000' },
    { fade: 0.85, time: 0.8, color: '#05040c' },
    { say: 'none', t: 'Y la marea negra se retira, {p:0.4}tan deprisa como vino, {p:0.4}llevándose a Elara al Fondo.' },
    { wait: 1.0 },
    { fade: 0, time: 1.6 },
    { say: 'flint', e: 'sad', t: '…' },
    { say: 'flint', e: 'sad', t: 'No tengo ningún chiste para esto. {p:0.5}Lo siento, chico.' },
    { say: 'firion', e: 'sad', t: 'La marea del Fondo no mata, Kaelen. {p:0.4}Se lleva. {p:0.4}Los libros de la guardia lo dicen: {p:0.3}lo que se lleva, lo guarda.' },
    { say: 'kaelen', e: 'sad', t: 'Me ha salvado. {p:0.5}Me ha cambiado por ella.' },
    { say: 'kaelen', e: 'angry', t: 'Entonces bajaré a buscarla. {p:0.4}Encenderé los faros que hagan falta {p:0.3}hasta que el mar me devuelva lo que es mío.' },
    { say: 'firion', e: 'neutral', t: 'No bajarás solo. {p:0.4}Un vigía no abandona su puesto. {p:0.3}Y desde hoy, mi puesto es a tu lado.' },
    { say: 'flint', e: 'neutral', t: 'Y alguien tendrá que arreglaros las lanzas cuando las rompáis contra el fondo del mar.' },
    { set: { 'cap1.fin': true, objetivo: 'cap2' } },
    { fade: 1, time: 1.4 },
    { chapter: 'Fin del Capítulo 1', title: 'El Vigía del Cabo', sub: 'Continuará en el Capítulo 2' },
    { fade: 0, time: 1.2 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Fin del capítulo 1 · Partida guardada' },
    { save: true },
    { call: 'cap2.inicio' },
  ];

  // ======================================================================
  // CHARLAS (dependen de la historia)
  // ======================================================================
  T.ilun = [
    { if: '!prologo.claro', then: [{ call: 'pro.claro' }, { set: 'prologo.claro' }, { end: true }] },
    { if: 'prologo.fin', then: [
      { say: '@npc', e: 'neutral', t: 'El faro de Bruma arde gracias a vosotros. {p:0.4}Ahora el del Vigía. {p:0.3}La luz no espera.' },
    ], else: [
      { if: 'def.activa', then: [
        { say: '@npc', e: 'angry', t: 'Lo siento en el agua, muchacho. {p:0.4}Algo grande se mueve bajo el pueblo. {p:0.3}Id. {p:0.3}Yo guardaré el fuego.' },
      ], else: [
        { say: '@npc', e: 'neutral', t: 'El fuego aguanta. {p:0.3}Nosotros también. {p:0.4}Al caer la tarde, subid al faro.' },
      ] },
    ] },
  ];
  T.elara_claro = [{ say: '@npc', e: 'neutral', t: 'El maestro te estaba esperando, Kaelen.' }];
  T.flint_dia = [
    { say: '@npc', e: 'happy', t: '¡Kaelen! {p:0.3}Si traes esa lanza para que le saque punta, tráela mañana. {p:0.4}Hoy tengo el yunque de mal humor.' },
    { say: '@npc', e: 'neutral', t: 'Sí, el yunque. {p:0.3}Yo nunca estoy de mal humor. {p:0.4}Soy así de cara.' },
  ];
  T.halvard = [
    { if: 'prologo.fin', then: [
      { say: '@npc', e: 'happy', t: 'Cada mañana subo a ver si el Ojo sigue ahí. {p:0.4}Sigue. {p:0.3}Gracias, muchacho.' },
      { if: '!cap1.faro', then: [{ say: '@npc', e: 'sad', t: 'Pero el Vigía sigue a oscuras. {p:0.3}Lo noto en las rodillas cada vez que baja la marea.' }] },
    ], else: [
      { if: 'def.activa', then: [
        { say: '@npc', e: 'angry', t: '¡No os quedéis aquí! {p:0.3}La luz la cuido yo. {p:0.4}¡Al pueblo!' },
      ], else: [
        { if: 'prologo.claro', then: [{ say: '@npc', e: 'neutral', t: 'Os esperaba al caer la tarde. {p:0.3}Subid a la terraza.' }], else: [
          { say: '@npc', e: 'neutral', t: 'Desde esta terraza se ve todo el pueblo. {p:0.4}Y esta mañana, el agua más cerca que nunca.' },
        ] },
      ] },
    ] },
  ];
  T.mira_def = [{ say: '@npc', e: 'sad', t: '¡Kaelen! {p:0.3}¡No me dejes aquí sola!' }];
  T.intendente = [
    { say: '@npc', e: 'happy', name: 'Intendente', t: '¡Por las barbas del Vigía, clientes! {p:0.3}Llevo doce días sin vender ni un tónico.' },
    { shop: 'cabo' },
    { say: '@npc', e: 'neutral', t: 'Si el faro vuelve a arder, os invito a sopa. {p:0.3}Si no, también: no me queda otra cosa.' },
  ];
  T.vigia_viejo = [
    { if: 'cap1.faro', then: [
      { say: '@npc', e: 'happy', t: '¡Mira cómo brilla! {p:0.3}Como cuando yo era joven y la guardia tenía cuarenta hombres.' },
    ], else: [
      { say: '@npc', e: 'sad', t: 'Fui vigía treinta años. {p:0.4}Ahora solo queda Firion ahí arriba. {p:0.3}Ese chico no duerme.' },
      { say: '@npc', e: 'neutral', t: 'Las gaviotas negras vienen del mar con la marea alta. {p:0.3}Si subís, id con cuidado.' },
    ] },
  ];
  // los vecinos tras la noche de la defensa
  const after = (key, lines) => {
    const old = T[key];
    T[key] = [{ if: 'def.fin', then: lines, else: old || [] }];
  };
  after('fisher', [{ say: '@npc', e: 'happy', t: 'Anoche os vi desde la ventana. {p:0.4}Cuarenta años pescando y nunca vi a nadie hacerle frente al mar. {p:0.3}Hasta ayer.' }]);
  after('woman', [{ say: '@npc', e: 'happy', t: 'Te he guardado pan, Kaelen. {p:0.3}Y a tu amigo el herrero, el doble. {p:0.4}Me ha dicho que el pan le da puntería.' }]);
  after('oldman', [{ say: '@npc', e: 'sad', t: 'El faro se apagó. {p:0.4}Yo creía que no viviría para verlo. {p:0.3}Y he vivido para verlo volver.' }]);
  after('farmer', [{ say: '@npc', e: 'angry', t: '¡Las coles han vuelto a mirar al sol! {p:0.4}Algo habréis hecho bien.' }]);
  after('sailor', [{ say: '@npc', e: 'neutral', t: 'La brújula ya no da vueltas. {p:0.3}Señala al este, hacia el cabo. {p:0.4}Supongo que eso es un consejo.' }]);
  after('kid', [{ say: '@npc', e: 'happy', t: '¡Kaelen! {p:0.3}¡Tu lanza brilla! {p:0.4}¿Me la dejas? {p:0.3}…¿Mañana?' }]);
  after('mira', [
    { if: 'cap1.fin', then: [{ say: '@npc', e: 'sad', t: '¿Y Elara? {p:0.5}…¿Kaelen?' }], else: [
      { say: '@npc', e: 'happy', t: 'El pan estaba quemado, ¿verdad? {p:0.3}No contestes.' },
    ] },
  ]);
})();
