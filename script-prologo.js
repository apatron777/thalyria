// Guiones del prólogo: apertura (Halvard, el sueño de Kaelen, amanecer en Bruma Salada) y charlas de los NPCs.
// Órdenes disponibles: ver engine/cutscene.js. Coordenadas en tiles [col, fila] (admiten decimales).
(function () {
  'use strict';
  const TH = window.TH;
  const S = (TH.data.scripts = TH.data.scripts || {});
  const T = (TH.data.talk = TH.data.talk || {});

  // ---------- apertura ----------
  S['prologo.apertura'] = [
    { bars: true },
    { fade: 1, color: '#000' },
    { party: 'solo', lead: 'kaelen' },
    { hour: 4.6, back: true },
    { place: 'kaelen', at: [12, 12.2], dir: 'down' },
    { place: 'mira', at: [20, 12], dir: 'down' },
    { cam: [12, 13] },
    { wait: 0.8 },

    // narración de Halvard sobre negro
    { narrate: 'Antes de que el mar tuviera nombre, {p:0.3}una isla cantaba bajo las estrellas.', name: 'Halvard' },
    { narrate: 'La llamaban {*Thalyria*}. {p:0.4}Sus faros no guiaban barcos: {p:0.3}guardaban el paso del tiempo.', name: 'Halvard' },
    { narrate: 'Hasta que una mañana el sol se quedó quieto en lo alto… {p:0.6}y no volvió a moverse.', name: 'Halvard' },
    { narrate: 'Lo llamaron {*el Día Detenido*}. {p:0.4}Duró un instante. {p:0.5}Duró mil años.', name: 'Halvard' },
    { narrate: 'Thalyria se hundió con su canto. {p:0.4}De ella solo quedaron ecos, {p:0.3}dormidos bajo las mareas.', name: 'Halvard' },
    { narrate: 'Esta es la historia de cómo volvió a amanecer. {p:0.5}Y empieza, como casi todo lo que importa, {p:0.3}con un muchacho que soñaba con el mar.', name: 'Halvard' },

    // el sueño de Kaelen
    { dream: true },
    { orb: [192, 20], a: 0 },
    { fade: 0, time: 2.2 },
    { wait: 0.8 },
    { say: 'voice', t: '{s:0.6}Kaelen…' },
    { face: '@dream', dir: 'left', time: 0.5 },
    { face: '@dream', dir: 'right', time: 0.5 },
    { face: '@dream', dir: 'up' },
    { say: 'kaelen', e: 'neutral', t: '¿Hola? {p:0.3}¿Quién… está ahí?' },
    { orb: [192, 96], a: 1, time: 2.6 },
    { say: 'voice', t: 'El mar recuerda lo que vosotros habéis olvidado.' },
    { say: 'voice', t: 'Cada noche la marea vuelve un poco antes. {p:0.4}Cada noche, el día tarda un poco más en llegar.' },
    { say: 'kaelen', e: 'sad', t: 'Otra vez este sueño… {p:0.4}Siempre el mismo.' },
    {
      choice: [
        { t: '¿Quién eres?', v: 'quien', then: [
          { say: 'voice', t: 'Alguien que te envió muy lejos, {p:0.4}para que un día pudieras volver.' },
          { say: 'kaelen', e: 'sad', t: '¿Enviarme…? {p:0.4}¿Desde dónde?' },
        ] },
        { t: '¿Qué quieres de mí?', v: 'que', then: [
          { say: 'voice', t: 'Que despiertes. {p:0.4}Y que no apartes la mirada cuando todos los demás lo hagan.' },
          { say: 'kaelen', e: 'angry', t: 'Siempre hablas en acertijos.' },
        ] },
        { t: '(Guardar silencio)', v: 'calla', then: [
          { say: 'voice', t: 'Callas. {p:0.4}Bien. {p:0.3}Escuchar también es una forma de empezar.' },
        ] },
      ],
      flag: 'intro.respuesta',
    },
    { say: 'voice', t: 'Cuando la luz del faro se apague, {*despierta*}. {p:0.5}El {~Día Detenido~} no ha terminado.' },
    { shake: 3, time: 1.6, wait: false },
    { orb: [192, 140], a: 1, time: 0.9 },
    { fade: 1, color: '#ffffff', time: 0.5 },
    { dream: false },
    { wait: 0.3 },
    { fade: 1, color: '#000' },
    { wait: 0.6 },
    { say: 'kaelen', e: 'sad', t: '{~¡…!~} {p:0.6}Solo… {p:0.3}un sueño.' },

    // amanecer en Bruma Salada
    { hour: 5.2 },
    { cam: [34, 4] },
    { fade: 0, time: 2.4, wait: false },
    { hour: 6.7, time: 7, wait: false },
    { wait: 1.6 },
    { banner: ['Bruma Salada', 'Archipiélago de Vael · Presente'] },
    { wait: 2.2 },
    { cam: [12, 13], time: 4.2 },
    { wait: 0.4 },
    { move: 'kaelen', to: [12, 13.2], speed: 36 },
    { face: 'kaelen', dir: 'right', time: 0.5 },
    { face: 'kaelen', dir: 'left', time: 0.6 },
    { face: 'kaelen', dir: 'up', time: 0.3 },
    { say: 'kaelen', e: 'neutral', t: 'Ya es de día… {p:0.4}y el faro sigue encendido.' },
    { say: 'mira', t: '¡Kaelen!' },
    { emote: 'kaelen', icon: '!', time: 0.8 },
    { face: 'kaelen', dir: 'right' },
    { cam: [14, 13], time: 1, wait: false },
    { move: 'mira', path: [[19, 13.3], [13.7, 13.3]], run: true },
    { face: 'mira', dir: 'kaelen' },
    { face: 'kaelen', dir: 'mira' },
    { say: 'mira', e: 'happy', t: '¡Otra vez despierto antes que las gaviotas! {p:0.3}¿Has vuelto a dormir en el tejado?' },
    { say: 'kaelen', e: 'neutral', t: 'He soñado con el mar. {p:0.4}Con una luz que hablaba.' },
    { say: 'mira', e: 'neutral', t: '¿Una luz que habla? {p:0.3}¿Y qué te decía?' },
    {
      choice: [
        { t: 'Contarle el sueño', v: 'contar', then: [
          { say: 'kaelen', e: 'sad', t: 'Que el Día Detenido no ha terminado. {p:0.4}Que despierte cuando se apague el faro.' },
          { say: 'mira', e: 'sad', t: '…{p:0.4} Ilun dice que los sueños de marea traen avisos.' },
        ] },
        { t: 'Quitarle importancia', v: 'quitar', then: [
          { say: 'kaelen', e: 'happy', t: 'Nada. {p:0.3}Tonterías de madrugada.' },
          { say: 'mira', e: 'angry', t: '{~Kaelen.~} {p:0.3}Tienes ojeras de búho. {p:0.3}No me digas que no es nada.' },
        ] },
        { t: 'Preguntar por Ilun', v: 'ilun', then: [
          { say: 'kaelen', e: 'neutral', t: '¿Has visto a Ilun esta mañana?' },
          { say: 'mira', e: 'neutral', t: 'Te espera en el claro desde antes del alba. {p:0.3}Dijo que hoy {*no*} podía esperar.' },
        ] },
      ],
      flag: 'intro.mira',
    },
    // la tierra tiembla
    { shake: 2, time: 1.2, wait: false },
    { emote: 'mira', icon: '!', time: 0.9, wait: false },
    { emote: 'kaelen', icon: '!', time: 0.9 },
    { face: 'mira', dir: 'down' },
    { face: 'kaelen', dir: 'down', time: 0.6 },
    { say: 'mira', e: 'sad', t: '¿Lo has notado? {p:0.3}Desde anoche la tierra tiembla así.' },
    { say: 'mira', e: 'sad', t: 'Y la marea… {p:0.4}esta mañana el agua ha llegado hasta las barcas varadas.' },
    { face: 'mira', dir: 'kaelen' },
    // lo siguiente depende de la elección
    { if: 'intro.mira=contar', then: [
      { say: 'mira', e: 'neutral', t: 'Cuéntaselo a Ilun. {p:0.3}Él sabrá qué significa tu luz.' },
    ] },
    { if: 'intro.mira=quitar', then: [
      { say: 'mira', e: 'neutral', t: 'Sueño o no, {p:0.3}Ilun quiere verte. {p:0.3}Y no le gusta esperar.' },
    ] },
    { if: 'intro.mira=ilun', then: [
      { say: 'mira', e: 'happy', t: 'Sube por el camino del bosque. {p:0.3}¡Y no te entretengas con los cangrejos!' },
    ] },
    { say: 'mira', e: 'neutral', t: 'Yo bajo al puerto a ayudar con las barcas.' },
    { move: 'mira', path: [[19, 13.3], [19, 17]], run: true, wait: false },
    { say: 'kaelen', e: 'neutral', t: 'El claro de Ilun… {p:0.4}Allá vamos.' },
    { set: { 'intro.vista': true, objetivo: 'claro' } },
    { release: 'mira', home: true, after: 2 },
    { bars: false },
    { cam: 'free', time: 0.8 },
    { toast: 'Objetivo: sube al claro de Ilun (noroeste)' },
  ];

  // ---------- charlas con NPCs (dependen de los flags) ----------
  T.ilun = [
    { if: 'ilun.visto', then: [
      { say: '@npc', e: 'neutral', t: 'El fuego aguanta. {p:0.3}Nosotros también. {p:0.4}Ve con cuidado, Kaelen.' },
    ], else: [
      { say: '@npc', e: 'neutral', t: 'Kaelen. {p:0.3}O llegas tarde… {p:0.4}o el sol llega pronto. {p:0.3}Ya no sé distinguirlo.' },
      { if: 'intro.mira=contar', then: [{ say: '@npc', e: 'sad', t: 'Mira me ha hablado de tu luz que habla.' }] },
      { if: 'intro.respuesta=quien', then: [
        { say: 'kaelen', e: 'sad', t: 'En el sueño, la voz dijo que alguien me envió. {p:0.3}De muy lejos.' },
        { say: '@npc', e: 'sad', t: '…' },
        { say: '@npc', e: 'neutral', t: 'Hay preguntas que solo se responden cuando llega su marea. {p:0.4}Esta aún no ha llegado.' },
      ] },
      {
        who: '@npc', t: 'Pregunta. {p:0.3}Mientras el fuego dure, contestaré.',
        choice: [
          { t: '¿Qué le pasa a la marea?', then: [{ say: '@npc', e: 'sad', t: 'Vuelve antes cada noche. {p:0.4}Como si el mar tuviera prisa por recuperar algo.' }] },
          { t: '¿Por qué sigue encendido el faro?', then: [{ say: '@npc', e: 'angry', t: 'Porque nadie se atreve a apagarlo. {p:0.4}Y hacen bien.' }] },
          { t: 'Solo venía a verte.', then: [{ say: '@npc', e: 'happy', t: 'Entonces siéntate. {p:0.3}Un viejo agradece la compañía.' }] },
        ],
      },
      { set: 'ilun.visto' },
    ] },
  ];
  T.mira = [
    { if: 'charla.mira>=1', then: [
      { say: '@npc', e: 'neutral', t: '¿Sigues aquí? {p:0.3}Ilun no espera dos veces.' },
    ], else: [
      { if: 'intro.mira=contar', then: [{ say: '@npc', e: 'sad', t: 'Lo de tu sueño… {p:0.3}no me lo quito de la cabeza.' }] },
      { if: 'intro.mira=quitar', then: [{ say: '@npc', e: 'angry', t: '«Tonterías de madrugada». {p:0.3}Ya.' }] },
      { if: 'intro.mira=ilun', then: [{ say: '@npc', e: 'happy', t: '¡Al claro! {p:0.3}Camino del bosque, al noroeste.' }] },
      { if: '!intro.mira', then: [{ say: '@npc', e: 'happy', t: '¡Buenos días, Kaelen!' }] },
    ] },
    { add: 'charla.mira' },
  ];
  T.fisher = [
    { if: 'charla.fisher>=1', then: [
      { say: '@npc', t: 'Sigo esperando a que el mar se calme. {p:0.3}Y el mar, a que yo me rinda.' },
    ], else: [
      { say: '@npc', t: 'Cuarenta años pescando y nunca vi la marea subir tan deprisa.' },
      { say: '@npc', e: 'sad', t: 'Mis redes amanecieron a medio muelle. {p:0.3}{*A medio muelle*}.' },
    ] },
    { add: 'charla.fisher' },
  ];
  T.woman = [
    { if: 'intro.mira=contar', then: [
      { say: '@npc', t: 'Mira va diciendo que sueñas con luces. {p:0.3}En este pueblo todo se sabe, cielo.' },
    ], else: [
      { say: '@npc', e: 'happy', t: 'Huele a pan de algas. {p:0.3}Pásate luego, que te guardo un trozo.' },
    ] },
  ];
  T.oldman = [
    { say: '@npc', t: 'Cuando yo era niño, el faro se apagaba al alba. {p:0.4}Ahora ya no se apaga nunca.' },
    { say: '@npc', e: 'sad', t: 'Dicen que es para que algo no nos encuentre… {p:0.4}o para que algo sí lo haga.' },
  ];
  T.farmer = [
    { say: '@npc', e: 'angry', t: 'Las coles crecen mirando al mar. {p:0.3}¡Al mar! {p:0.4}Ni las plantas se fían ya del sol.' },
  ];
  T.sailor = [
    { say: '@npc', t: 'Esta mañana la brújula daba vueltas sola. {p:0.3}Hoy no zarpa nadie.' },
  ];
  T.kid = [
    { if: 'charla.kid>=2', then: [
      { say: '@npc', e: 'angry', t: '¡Que no te lo cuento más veces!' },
    ], else: [
      { say: '@npc', e: 'happy', t: '¡Anoche vi peces brillando en la playa! {p:0.3}¡Peces de {*luz*}!' },
    ] },
    { add: 'charla.kid' },
  ];
  T.vecina2 = [{ say: '@npc', t: 'Si vas al claro, dile a Ilun que le guardo hilo para sus redes.' }];
  T.granjero2 = [{ say: '@npc', e: 'sad', t: 'La tierra tembló otra vez. {p:0.3}Las gallinas no han puesto ni un huevo.' }];
  T.nino2 = [{ say: '@npc', e: 'happy', t: '¡Kaelen, Kaelen! {p:0.3}¿Me enseñas a usar la lanza? {p:0.4}…¿Mañana?' }];
  T.marinera2 = [{ say: '@npc', t: 'Las gaviotas vuelan bajo. {p:0.3}Mala señal, dicen los viejos.' }];
  T.anciano2 = [{ say: '@npc', t: 'Desde esta terraza se ve todo el pueblo. {p:0.4}Y esta mañana, el agua más cerca que nunca.' }];

  // ---------- Fase 4: tienda, posada, ruta de los Acantilados ----------
  T.tendera = [
    { if: 'charla.tendera', then: [
      { say: '@npc', e: 'happy', t: '¡Otra vez por aquí! {p:0.3}¿Qué te pongo?' },
    ], else: [
      { say: '@npc', e: 'happy', name: 'Nerea', t: '¡Kaelen! {p:0.3}Acaba de llegar género de la isla de al lado. {p:0.3}Bueno… de la de al lado de la de al lado.' },
    ] },
    { add: 'charla.tendera' },
    { shop: 'bruma' },
    { say: '@npc', e: 'neutral', t: 'Vuelve cuando quieras. {p:0.3}Y no gastes todo en tónicos, que luego no comes.' },
  ];
  T.posadero = [
    { say: '@npc', e: 'happy', t: 'Bienvenido a {*La Gaviota*}. {p:0.3}Una noche, sopa incluida: 20 de oro.' },
    {
      who: '@npc', t: '¿Te quedas a dormir?',
      choice: [
        { t: 'Dormir (20 de oro)', then: [{ inn: 'bruma' }] },
        { t: 'Ahora no', then: [{ say: '@npc', e: 'neutral', t: 'La cama no se va a ir a ningún sitio.' }] },
      ],
    },
  ];
  T.barquero = [
    { say: '@npc', t: 'Desde esta cala se llega a cualquier puerto que conozcas. {p:0.3}Habla con la barca cuando quieras zarpar.' },
    { if: '!isla.gaviotas', then: [{ say: '@npc', e: 'neutral', t: 'Si subes al mirador y miras por el catalejo, a lo mejor descubres algo más.' }] },
  ];
  T.nino_ruta = [
    { say: '@npc', e: 'happy', t: '¡En lo alto de esa roca grande hay un cofre! {p:0.3}Pero solo se sube por la enredadera…' },
  ];
  S.mirador = [
    { if: 'isla.gaviotas', then: [
      { say: 'none', name: 'Catalejo', t: 'Al noreste, las gaviotas siguen girando sobre su islote.' },
    ], else: [
      { say: 'kaelen', e: 'neutral', t: 'Un catalejo viejo… {p:0.3}A ver qué se ve.' },
      { fade: 0.6, time: 0.4 },
      { say: 'none', name: 'Catalejo', t: 'Entre la bruma asoma un islote blanco de gaviotas, {p:0.3}al noreste del archipiélago.' },
      { fade: 0, time: 0.5 },
      { set: 'isla.gaviotas' },
      { toast: 'Nueva isla en el mapa: Islote de las Gaviotas' },
    ] },
  ];
})();
