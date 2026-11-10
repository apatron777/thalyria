// Dirección musical: la música cambia cuando cambia la tensión.
// · scriptMusic: tema con el que arranca una cinemática (al terminar vuelve la música de la zona).
// · zoneMusic: la zona suena distinta según el momento del guion (p. ej. el pueblo atacado).
// · cues: cambios DENTRO de una cinemática, justo antes de la línea indicada.
// Temas: alerta (peligro mientras exploras), amenaza (aparece o habla el enemigo), accion (la crisis estalla),
// triste (pérdida, despedida), grupo (el tema de los héroes: decisión, victoria, esperanza). '' = silencio.
(function () {
  'use strict';
  const D = window.TH.data, S = D.scripts;

  Object.assign(D.scriptMusic, {
    'pro.def1': 'alerta', 'pro.def2': 'alerta', 'pro.matriarca': 'amenaza', 'pro.matriarca.fin': 'amenaza',
    'cabo.firion': 'alerta', 'cabo.faro': 'grupo', 'cap1.karkinos': 'amenaza', 'cap1.final': 'triste',
    'cap2.madre': 'amenaza', 'cap3.varek': 'amenaza', 'cap3.varek.sale': 'accion', 'cap3.vigia': 'amenaza',
    'cap4.crono': 'amenaza', 'cap5.varek': 'amenaza', 'cap5.abisal': 'amenaza',
    'cap6.inicio': 'accion', 'cap6.coloso': 'amenaza', 'cap6.fin': 'triste',
    'cap7.ithra': 'triste', 'cap7.fin': 'amenaza',
    'cap8.puerta': 'alerta', 'cap8.fase2': 'amenaza', 'cap8.fase3': 'motor',
    'post.leviatan': 'amenaza',
  });

  D.zoneMusic = (D.zoneMusicExtra || []).concat([
    { map: 'brumaSalada', if: ['def.activa', '!jefe.matriarca'], music: 'alerta' }, // el pueblo bajo ataque
    { map: 'congelada', if: 'epoca.congelada=present', music: 'alerta' }, // la ciudad tomada por el Fondo
    { map: 'abismo', if: 'jefe.leviatan', music: 'mar' }, // el Abismo en calma tras el Leviatán
  ]);
  Object.assign(D.scriptMusic, D.scriptMusicExtra || {});

  // cue(guion, texto de la línea, tema): inserta el cambio de música justo antes de esa línea
  const cue = (id, txt, music) => {
    const list = S[id];
    if (!list) return;
    const i = list.findIndex((op) => JSON.stringify(op).indexOf(txt) >= 0);
    if (i >= 0) list.splice(i, 0, { music });
    else console.warn('cue sin línea', id, txt);
  };
  // Prólogo
  cue('prologo.apertura', '{"hour":5.2}', 'vael'); // amanece en Bruma Salada
  cue('prologo.apertura', '¿Lo has notado?', 'alerta'); // la tierra tiembla
  cue('pro.faro', '{"hour":20.6', 'amenaza'); // anochece de golpe, la luz parpadea
  cue('pro.faro', 'Salen del agua', 'alerta'); // las larvas salen del mar
  cue('pro.def2b', '"shake":4', ''); // el faro se apaga: silencio
  cue('pro.def2b', 'Luzzz', 'amenaza'); // la Matriarca bebe la luz
  cue('pro.def2b', 'La vieja lanza de pesca arde', 'grupo'); // la lanza despierta
  cue('pro.def2b', 'Ha huido hacia las rocas', 'alerta'); // persecución
  cue('pro.matriarca.fin', 'La Matriarca se deshace', 'grupo'); // la luz vuelve
  // Capítulo 1
  cue('cap1.final', '"shake":6', 'accion'); // la ola negra
  cue('cap1.final', 'Pero el mar no suelta', 'triste'); // el mar se lleva a Elara
  // Capítulo 3
  cue('cap3.vigia', 'Que os vaya bien, muchacho', 'accion');
  // Capítulo 6
  cue('cap6.inicio', '"chapter":"Capítulo 6"', 'triste'); // el pueblo hundido
  cue('cap6.fin', 'La fragua más alta ya ha visto el mar', 'amenaza'); // Oriel
  cue('cap6.fin', 'Te prometo que volveremos', 'grupo');
  // Capítulo 7
  cue('cap7.ithra', '"shake":6', 'amenaza'); // Varek emerge en el Coloso
  // Capítulo 8 y final
  cue('cap8.puerta', 'Yo la sostengo', 'triste'); // Firion se queda
  cue('cap8.puerta', '"place":"varek"', 'amenaza'); // Varek al otro lado de la puerta
  cue('cap8.fase2', 'Lo he visto en el mar toda mi vida', 'alerta');
  cue('cap8.fase3', 'Estás aquí', 'triste'); // la voz de Aurelia
  cue('cap8.fase3', 'Corazón de reloj poseído', 'amenaza');
  cue('cap8.decision', 'Entonces iré yo', 'triste');
  cue('post.leviatan.fin', 'se hunde despacio', 'grupo');
})();
