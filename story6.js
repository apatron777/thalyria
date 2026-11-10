// GUION · Capítulo 8 «El día que no termina» y finales.
// Oslo vuelve · la Ciudad Congelada dentro del instante · Firion sostiene la puerta · jefe final en tres fases entre épocas
// (Varek Abisal en el pasado congelado · el Primer Abisal en el presente en ruinas · el Corazón del Fondo dentro del Motor)
// · el latido de Kaelen · «uno del mar volverá al mar»: la decisión, Elara u Oslo · Final A / Final B · epílogos y créditos.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, S = D.scripts, T = D.talk;

  // ---------- bestiario ----------
  Object.assign(D.enemies, {
    cristal_tiempo: { name: 'Cristal de tiempo', sprite: 'cristal_tiempo', hp: 1300, atk: 88, def: 40, mag: 90, res: 40, spd: 12, exp: 1300, gold: 400, markH: 24,
      weak: { Fuego: 1.4, Impacto: 1.2 }, resist: { Agua: 0.5, Luna: 0.7 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { esquirla: { name: 'Esquirla', kind: 'phys', power: 1.0, target: 'one' }, escarcha: { name: 'Escarcha del instante', kind: 'mag', power: 0.9, target: 'all', fx: 'storm' } },
      ai: [{ act: 'escarcha', every: 3 }, { act: 'esquirla' }] },
    cristal_eterno: { name: 'Cristal eterno', sprite: 'cristal_eterno', hp: 1800, atk: 98, def: 46, mag: 100, res: 44, spd: 12, exp: 1800, gold: 560, markH: 24,
      weak: { Fuego: 1.4, Impacto: 1.2 }, resist: { Agua: 0.5, Luna: 0.7 }, drops: [{ item: 'tonico_plus', chance: 0.6 }],
      actions: { esquirla: { name: 'Lanza de hielo', kind: 'phys', power: 1.15, target: 'one', pick: 'weakest' }, escarcha: { name: 'Invierno de mil años', kind: 'mag', power: 1.05, target: 'all', fx: 'wave' } },
      ai: [{ act: 'escarcha', every: 2 }, { act: 'esquirla' }] },
    eco_helado: { name: 'Eco helado', sprite: 'eco_helado', hp: 1150, atk: 86, def: 34, mag: 88, res: 42, spd: 18, exp: 1200, gold: 380, markH: 30, flying: true,
      weak: { Fuego: 1.3, Corte: 1.2 }, resist: { Agua: 0.5 }, drops: [{ item: 'agua_luna', chance: 0.4 }],
      actions: { ala: { name: 'Ala de escarcha', kind: 'phys', power: 1.0, target: 'one' }, grito: { name: 'Grito congelado', kind: 'mag', power: 0.9, target: 'all', fx: 'storm' } },
      ai: [{ act: 'grito', every: 2 }, { act: 'ala' }] },
    eco_glacial: { name: 'Eco glacial', sprite: 'eco_glacial', hp: 1600, atk: 96, def: 38, mag: 98, res: 46, spd: 19, exp: 1700, gold: 520, markH: 30, flying: true,
      weak: { Fuego: 1.3, Corte: 1.2 }, resist: { Agua: 0.5 }, drops: [{ item: 'tonico_plus', chance: 0.5 }],
      actions: { ala: { name: 'Ala glacial', kind: 'phys', power: 1.1, target: 'one', pick: 'weakest' }, grito: { name: 'Ventisca', kind: 'mag', power: 1.05, target: 'all', fx: 'storm' } },
      ai: [{ act: 'grito', every: 2 }, { act: 'ala' }] },
    // jefe final, fase 1: el pasado congelado
    varek_abisal: { name: 'Varek Abisal', title: 'El capitán que se entregó al Fondo', char: 'varek', boss: true, markH: 44,
      hp: 5200, atk: 98, def: 34, mag: 86, res: 30, spd: 12, exp: 6000, gold: 0,
      weak: { Luz: 1.3 }, resist: { Agua: 0.5 },
      actions: {
        tajo: { name: 'Tajo del Fondo', kind: 'phys', power: 1.25, target: 'one', pick: 'weakest' },
        marea: { name: 'Marea negra', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' },
        guardia: { name: 'Guardia del capitán', kind: 'buff', target: 'self', buff: { def: 1.4, turns: 2 } },
        instante: { name: 'Corte del instante', kind: 'phys', power: 1.6, target: 'all' },
      },
      ai: [{ act: 'instante', every: 4 }, { act: 'marea', every: 3 }, { act: 'guardia', if: 'self<0.5', cooldown: 5 }, { act: 'tajo' }],
      phases: [
        { at: 1, music: 'jefe1', dialog: [
          { name: 'Varek', t: 'Me ofrecí al Abisal, Alteza. {p:0.4}Ahora soy su mano en este segundo eterno.' },
          { name: 'Varek', t: 'Aquí, en el pasado, el tiempo no corre. {p:0.3}{*Mis heridas no corren tampoco.*}' },
        ] },
        { at: 0.5, music: 'jefe2', dialog: [
          { name: 'Varek', t: '…Firion sigue sujetando esa puerta, ¿verdad? {p:0.4}Siempre fue el más terco de mis alumnos.' },
        ] },
      ] },
    // fase 2: el presente en ruinas
    abisal_eco: { name: 'Primer Abisal', title: 'Despierto en el presente', sprite: 'abisal2', scale: 2.8, boss: true, big: true, markH: 64,
      hp: 6200, atk: 110, def: 34, mag: 102, res: 32, spd: 9, exp: 8000, gold: 0,
      weak: { Luz: 1.4, Fuego: 1.2 }, resist: { Agua: 0.4, Luna: 0.8 },
      actions: {
        fauces: { name: 'Fauces del origen', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        marea: { name: 'Marea primera', kind: 'mag', power: 1.05, target: 'all', fx: 'wave' },
        llamar: { name: 'Hijos del Fondo', kind: 'summon', summon: 'sombra_abisal', target: 'self' },
        beber: { name: 'Beber la luz', kind: 'heal', heal: 0.06, target: 'self' },
      },
      ai: [{ act: 'llamar', if: 'adds<1', cooldown: 4 }, { act: 'marea', every: 3 }, { act: 'fauces' }],
      phases: [
        { at: 1, music: 'jefe2', dialog: [
          { name: 'Primer Abisal', t: '{s:0.7}El capitán cayó. {p:0.4}No importa. {p:0.3}Aquí, en vuestro presente, {*yo ya he ganado*}: el mar cubre vuestras islas.' },
        ] },
        { at: 0.4, music: 'jefe2', dialog: [
          { name: 'Primer Abisal', t: '{~Si el día ha de terminar, que termine en mis fauces.~}' },
        ], ai: [{ act: 'beber', if: 'self<0.25', cooldown: 6 }, { act: 'marea', every: 2 }, { act: 'fauces' }] },
      ] },
    // fase 3: dentro del Motor, donde el tiempo se detuvo
    corazon: { name: 'Corazón del Fondo', title: 'El instante que se niega a terminar', sprite: 'corazon', boss: true, big: true, markH: 56,
      hp: 6200, atk: 88, def: 36, mag: 86, res: 34, spd: 9, exp: 12000, gold: 0,
      weak: { Luz: 1.3, Luna: 1.2 }, resist: { Agua: 0.5 },
      actions: {
        latido: { name: 'Latido negro', kind: 'mag', power: 1.0, target: 'all', fx: 'wave' },
        aplastar: { name: 'Peso del Fondo', kind: 'phys', power: 1.3, target: 'one', pick: 'weakest' },
        detener: { name: 'Detener el tiempo', kind: 'mag', power: 1.5, target: 'all', fx: 'storm' },
        olvido: { name: 'Olvido', kind: 'heal', heal: 0.05, target: 'self' },
      },
      ai: [{ act: 'detener', every: 4 }, { act: 'latido', every: 2 }, { act: 'aplastar' }],
      phases: [
        { at: 1, music: 'final', dialog: [
          { name: 'Corazón del Fondo', t: 'Este es el segundo que tu madre robó. {p:0.4}Mil años dentro. {p:0.3}{*No pienso devolverlo.*}' },
          { name: 'Elara', t: '¡Kaelen, tu lanza late con él! {p:0.3}¡Golpéale con la luz del alba!' },
        ] },
        { at: 0.6, music: 'final', revive: 0.6, dialog: [
          { name: 'Corazón del Fondo', t: 'Tentáculos del instante, {p:0.3}{*volved*}.' },
        ] },
        { at: 0.25, music: 'final', dialog: [
          { name: 'Corazón del Fondo', t: '{~Si el día anda… yo me ahogo.~} {p:0.4}{*Entonces nadie verá el mañana.*}' },
          { name: 'Flint', t: '¡Último golpe, chicos! {p:0.3}¡Después de esto invito yo! {p:0.4}…Bueno, invita el príncipe.' },
        ], ai: [{ act: 'detener', every: 2 }, { act: 'olvido', if: 'self<0.1', cooldown: 8 }, { act: 'aplastar' }] },
      ] },
    tentaculo_izq: { name: 'Tentáculo del instante', sprite: 'tentaculo', part: true, markH: 34, hp: 900, atk: 74, def: 32, mag: 20, res: 24, spd: 9, exp: 400, gold: 0,
      weak: { Luz: 1.3 }, resist: { Agua: 0.5 },
      actions: { golpe: { name: 'Latigazo', kind: 'phys', power: 1.0, target: 'one', pick: 'weakest' }, proteger: { name: 'Abrazo del Fondo', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
    tentaculo_der: { name: 'Tentáculo del olvido', sprite: 'tentaculo', part: true, markH: 34, hp: 900, atk: 74, def: 32, mag: 20, res: 24, spd: 10, exp: 400, gold: 0,
      weak: { Luz: 1.3 }, resist: { Agua: 0.5 },
      actions: { golpe: { name: 'Latigazo', kind: 'phys', power: 1.0, target: 'one' }, proteger: { name: 'Abrazo del Fondo', kind: 'protect', target: 'boss' } },
      ai: [{ act: 'proteger', every: 3 }, { act: 'golpe' }] },
  });
  TH.foeVariant('cristal_tiempo', 'larva', 160, 0.6, 1.4, '#0a1a2a');
  TH.foeVariant('cristal_eterno', 'larva', 190, 0.9, 1.15, '#06102a');
  TH.foeVariant('eco_helado', 'gaviota', 200, 0.8, 1.15, '#0a1a2e');
  TH.foeVariant('eco_glacial', 'gaviota', 220, 1.6, 0.85, '#040a20');
  TH.foeVariant('abisal2', 'larva', 230, 1.2, 0.5, '#02040e');
  TH.foeVariant('corazon', 'karkinos', 300, 1.1, 0.5, '#08020e');
  TH.foeVariant('tentaculo', 'pinza', 300, 1.1, 0.5, '#08020e');

  // ---------- equipo, Eco, tienda ----------
  const I = D.items, add = (id, o) => { o.id = id; I[id] = o; };
  add('lanza_aurelia', { name: 'Lanza de Aurelia', type: 'weapon', who: ['kaelen'], price: 6000, stats: { atk: 45, mag: 8, spd: 4 }, desc: 'La lanza que la reina alzó hacia el sol. Ahora pesa lo justo.', unleash: { name: 'Amanecer de Thalyria', power: 3.6, types: ['Corte', 'Luz'] } });
  add('espada_juramento', { name: 'Espada del juramento', type: 'weapon', who: ['firion'], price: 5800, stats: { atk: 44, def: 8 }, desc: 'Forjada para quien sostiene lo que otros no pueden.', unleash: { name: 'Puerta del vigía', power: 3.5, types: ['Corte', 'Luz'] } });
  add('martillo_motor', { name: 'Martillo del Motor', type: 'weapon', who: ['flint'], price: 6000, stats: { atk: 48 }, desc: 'Un engranaje del Motor con mango. Flint lo bautizó «Tictac».', unleash: { name: 'Tictac', power: 3.7, types: ['Impacto', 'Fuego'] } });
  add('baston_marea_alta', { name: 'Bastón de la pleamar', type: 'weapon', who: ['elara'], price: 5800, stats: { atk: 5, mag: 42, res: 6 }, desc: 'La luna dentro de un cristal de mar.', unleash: { name: 'Pleamar eterna', power: 3.6, types: ['Luna', 'Agua'] } });
  add('manto_instante', { name: 'Manto del instante', type: 'armor', price: 5400, stats: { def: 38, res: 20, spd: 2 }, desc: 'Tejido con un segundo que no terminó.' });
  D.ecos.eco_instante = { id: 'eco_instante', name: 'Eco del Instante', el: 'Luz', color: '#ffffff', stats: { hp: 40, atk: 4, mag: 4, spd: 3 }, desc: 'El segundo que Aurelia detuvo. Late como un corazón pequeño.',
    release: { name: 'Mil años en un segundo', kind: 'heal', power: 0.5, area: 'allies', desc: 'Cura la mitad de la vida a todo el grupo.' } };
  D.shops.ithra = { name: 'Ofrendas de Ithra', stock: ['tonico_plus', 'agua_luna', 'lanza_aurelia', 'espada_juramento', 'martillo_motor', 'baston_marea_alta', 'manto_instante'] };

  // ---------- selector ----------
  const c7 = D.chapters.cap7;
  const f8 = Object.assign({}, c7.flags, { 'faroleros.llegada': true, 'cap7.cena': true, 'torre.llegada': true, 'faro.kaelen': true, 'faro.elara': true, 'faro.flint': true, 'faro.firion': true, 'cap7.ithra': true, 'jefe.coloso_guerra': true, 'varek.torre': true, 'cap7.fin': true, 'epoca.congelada': 'past', objetivo: 'cap8' });
  D.chapters.cap8 = { name: 'Capítulo 8', test: 'Grupo Nv 28 + Oslo', map: 'torre', at: [18, 10], dir: 'up', hour: 8, day: 13,
    roster: ['kaelen', 'elara', 'flint', 'firion'], levels: { kaelen: 28, elara: 28, flint: 28, firion: 28, oslo: 28 },
    equip: { kaelen: { weapon: 'lanza_farolera', armor: 'manto_farolero', acc: 'corona_farolera' }, firion: { weapon: 'espada_farolera', armor: 'manto_farolero', acc: 'anillo_reloj' }, flint: { weapon: 'martillo_hondaroca', armor: 'coraza_coral', acc: 'guantes_forja' }, elara: { weapon: 'baston_farolero', armor: 'manto_farolero', acc: 'sello_real' } },
    ecos: c7.ecos.concat(['eco_farolero']), ecoSet: { kaelen: ['eco_alba', 'eco_brasa', 'eco_farolero'], firion: ['eco_vendaval', 'eco_bronce'], elara: ['eco_luna', 'eco_reloj'], flint: ['eco_espuma', 'eco_raiz', 'eco_abismo', 'eco_forja'] },
    inv: { tonico_plus: 15, agua_luna: 12 }, gold: 14000, flags: f8, script: 'cap8.inicio' };
  S['cap7.fin'].push({ call: 'cap8.inicio' });

  // ======================================================================
  // CAPÍTULO 8 · El día que no termina
  // ======================================================================
  S['cap8.inicio'] = [
    { bars: true },
    { say: 'oslo', e: 'happy', t: '{~¡Eh!~} {p:0.4}¿De verdad pensabais bajar al fondo del tiempo sin barquero?' },
    { say: 'elara', e: 'happy', t: '¡Oslo! {p:0.3}¿Y los faroleros?' },
    { say: 'oslo', e: 'happy', t: 'En tierra, secos y quejándose. {p:0.4}Tu madre me ha dado una orden: {p:0.3}«tráela de una oreja». {p:0.4}Y yo nunca dejo un encargo a medias.' },
    { roster: ['kaelen', 'elara', 'flint', 'firion', 'oslo'] },
    { level: 'oslo', lv: 28 },
    { say: 'none', t: '{*Oslo*} vuelve al grupo como invitado.' },
    { say: 'none', name: 'Ithra', t: 'La puerta de la Torre está abierta, Alteza. {p:0.4}Dentro está tu ciudad, tal como era en el último segundo. {p:0.3}Y al fondo, el Motor.' },
    { flash: 1.0, color: '#d8ecff' },
    { fade: 1, time: 0.8, color: '#e8f4ff' },
    { set: { 'epoca.congelada': 'past', objetivo: 'motor' } },
    { warp: 'congelada', at: [17.5, 22.4], dir: 'up', hour: 12 },
    { clock: 0 },
    { chapter: 'Capítulo 8', title: 'El día que no termina', sub: 'Thalyria · El Día Detenido' },
    { cam: [17.5, 18] },
    { fade: 0, time: 2.0 },
    { if: '!cap8.llegada', then: [{ set: { 'cap8.llegada': true } }, { call: 'cap8.llegada' }] },
  ];
  S['cap8.llegada'] = [
    { bars: true },
    { say: 'none', t: 'La Ciudad Dorada. {p:0.4}Pero quieta. {p:0.3}Un niño con un pie en el aire. {p:0.3}Una mujer a punto de reír. {p:0.4}Una gaviota clavada en el cielo.' },
    { say: 'kaelen', e: 'sad', t: 'Así la dejó mi madre. {p:0.4}Así la ha tenido mil años.' },
    { say: 'flint', e: 'sad', t: 'No me gusta este silencio. {p:0.4}Ni una campana, ni un martillo. {p:0.3}Ni siquiera el mar.' },
    { say: 'none', name: 'Ithra', t: 'Aquí dentro también hay dos épocas, Alteza: {p:0.3}el instante… {p:0.4}y lo que el Fondo ha hecho con él en el presente. {p:0.3}Moveos entre las dos.' },
    { say: 'firion', e: 'neutral', t: 'La plaza del Motor está al norte, tras el canal. {p:0.4}Igual que la otra vez.' },
    { bars: false },
    { toast: 'Objetivo: llega a la plaza del Motor (V para cambiar de época)' },
    { save: true },
  ];
  S['cap8.puerta'] = [
    { bars: true },
    { cam: [17.5, 3], time: 1.4 },
    { say: 'none', t: 'Al fondo de la plaza, una puerta de oro tan alta como el faro del Vigía. {p:0.4}Detrás, un latido lento y enorme: {p:0.3}el Motor.' },
    { shake: 5, time: 2.0, wait: false },
    { say: 'none', t: 'Desde los canales congelados, el Fondo se desborda. {p:0.4}Agua negra trepando por las escaleras, por las paredes, hacia la puerta.' },
    { say: 'firion', e: 'angry', t: 'Si esa marea llega a la puerta antes de que la crucéis, se cerrará para siempre.' },
    { say: 'firion', e: 'neutral', t: 'Id. {p:0.6}Yo la sostengo.' },
    { say: 'kaelen', e: 'sad', t: 'Firion…' },
    { say: 'firion', e: 'happy', t: 'Toda mi vida he guardado puertas, faros y escaleras. {p:0.4}Para esto me entrenó Varek, aunque él lo haya olvidado. {p:0.3}Un vigía sostiene la puerta.' },
    { say: 'flint', e: 'sad', t: 'Más te vale estar vivo cuando volvamos. {p:0.4}Te debo una cerveza, y odio deber cosas.' },
    { say: 'firion', e: 'neutral', t: 'Un vigía siempre vuelve a su puesto. {p:0.4}Y mi puesto, hoy, es esta puerta.' },
    { leave: 'firion' },
    { say: 'none', t: '{*Firion*} apoya la espalda contra la puerta de oro y alza la espada hacia la marea.' },
    { place: 'varek', at: [17.5, 3.4], dir: 'down' },
    { say: 'none', name: 'Varek', t: 'Conmovedor, Firion. {p:0.4}Lástima que la puerta tenga dos lados.' },
    { say: 'varek', e: 'neutral', t: 'El Abisal me dio su forma, Alteza. {p:0.4}Y aquí, en el instante, nada que me hagáis {*durará*}.' },
    { say: 'kaelen', e: 'angry', t: 'Entonces te lo haremos en las tres épocas, Varek.' },
    { heal: true },
    { battle: ['varek_abisal'], at: [17.5, 3.4], once: 'final.fase1', after: 'cap8.fase2' },
  ];
  S['cap8.fase2'] = [
    { bars: true },
    { say: 'varek', e: 'sad', t: 'No… {p:0.4}no deja de doler. {p:0.3}Aquí no debería doler… {p:0.5}Firion… {p:0.4}¿por qué duele?' },
    { say: 'none', name: 'Firion (desde la puerta)', t: '¡Porque estás vivo, capitán! {p:0.4}¡Siempre lo estuviste!' },
    { shake: 6, time: 2.0, wait: false },
    { say: 'none', t: 'El Abisal arranca su forma del cuerpo de Varek como quien se quita un abrigo. {p:0.4}El instante se resquebraja.' },
    { flash: 1.0, color: '#1a0a2a' },
    { fade: 1, time: 0.6, color: '#05040c' },
    { set: { 'epoca.congelada': 'present', 'varek.libre': true } },
    { warp: 'congelada', at: [17.5, 5.6], dir: 'up', hour: 23 },
    { cam: [17.5, 4] },
    { fade: 0, time: 1.2 },
    { say: 'elara', e: 'sad', t: 'Nos ha arrastrado al presente. {p:0.4}A la Torre en ruinas. {p:0.3}Su terreno.' },
    { say: 'oslo', e: 'sad', t: 'Lo he visto en el mar toda mi vida, chicos. {p:0.4}Cuando la ola es más alta, es justo antes de romper.' },
    { heal: true },
    { battle: ['abisal_eco'], at: [17.5, 3.4], once: 'final.fase2', after: 'cap8.fase3' },
  ];
  S['cap8.fase3'] = [
    { bars: true },
    { shake: 6, time: 2.0, wait: false },
    { say: 'none', t: 'El Abisal se deshace en mil sombras… {p:0.4}que no huyen. {p:0.3}Se hunden. {p:0.4}Hacia dentro. {p:0.3}Hacia el Motor.' },
    { say: 'kaelen', e: 'angry', t: '¡Va a esconderse en el instante! {p:0.4}¡Dentro del Motor!' },
    { flash: 1.0, color: '#fff6dc' },
    { fade: 1, time: 0.6, color: '#fff6dc' },
    { warp: 'motor', at: [15, 13], dir: 'up', hour: 12 },
    { cam: [15, 9] },
    { fade: 0, time: 1.6 },
    { say: 'none', t: 'Dentro del Motor no hay suelo ni cielo. {p:0.4}Solo una plataforma de luz y un enorme corazón de engranajes, {p:0.3}rodeado de agua negra que late.' },
    { say: 'voice', name: 'Aurelia', t: '{s:0.7}Kaelen. {p:0.5}Estás aquí.' },
    { say: 'kaelen', e: 'sad', t: 'Madre.' },
    { say: 'voice', name: 'Aurelia', t: 'El Abisal se ha metido en el corazón del Motor, {p:0.3}en el segundo que yo detuve. {p:0.4}Sácalo de ahí… {p:0.3}y el día podrá terminar.' },
    { say: 'flint', e: 'neutral', t: 'Corazón de reloj poseído, fase tres. {p:0.4}Ya me sé el procedimiento: {p:0.3}le pegamos hasta que deje de hacer cosas raras.' },
    { heal: true },
    { battle: ['corazon', 'tentaculo_izq', 'tentaculo_der'], at: [15, 7.4], once: 'final.fase3', after: 'cap8.decision' },
  ];
  S['cap8.decision'] = [
    { bars: true },
    { flash: 1.2, color: '#ffffff' },
    { say: 'none', t: 'El Corazón del Fondo se rompe. {p:0.4}El agua negra se retira del Motor como la marea de una playa. {p:0.5}Y entonces… {p:0.4}silencio.' },
    { say: 'none', t: 'Los engranajes no giran. {p:0.4}El Motor está libre… {p:0.3}y quieto. {p:0.4}Le falta un latido.' },
    { say: 'voice', name: 'Aurelia', t: 'El latido que le falta es el tuyo, hijo. {p:0.4}Tu primer llanto. {p:0.3}Alguien tiene que llevarlo de vuelta al mar del tiempo para que el Motor lo oiga.' },
    { say: 'voice', name: 'Aurelia', t: '«Uno del mar volverá al mar.» {p:0.5}Pero la profecía no dice {*quién*}.' },
    { say: 'kaelen', e: 'neutral', t: 'Entonces iré yo. {p:0.4}Es mi latido.' },
    { say: 'elara', e: 'angry', t: '{*No.*} {p:0.4}Tú tienes que estar aquí cuando salga el sol. {p:0.3}Si no, ¿para qué lo encendemos?' },
    { say: 'elara', e: 'neutral', t: 'Yo estuve en el Fondo. {p:0.4}La luna empuja la marea, Kaelen. {p:0.3}Puedo llevar tu latido y volver a subir con la pleamar. {p:0.4}Creo.' },
    { say: 'oslo', e: 'neutral', t: '«Creo» no es suficiente para un barquero, pequeña. {p:0.5}Yo nací en una barca, en mitad de una tormenta. {p:0.4}Si alguien en este grupo es «del mar», soy yo.' },
    { say: 'oslo', e: 'neutral', t: 'Cuarenta años cruzando corrientes. {p:0.4}Esta es solo una más. {p:0.3}La más larga.' },
    { say: 'flint', e: 'sad', t: 'Me estáis pidiendo que elija entre dos personas que quiero. {p:0.4}No. {p:0.3}Que elija él. {p:0.4}Es su latido.' },
    {
      who: 'kaelen', e: 'sad', t: '(Kaelen sostiene la luz de su latido entre las manos. ¿A quién se la confía?)',
      choice: [
        { t: 'Confiar el latido a Elara', then: [{ set: { final: 'A' } }, { call: 'final.A' }] },
        { t: 'Confiar el latido a Oslo', then: [{ set: { final: 'B' } }, { call: 'final.B' }] },
      ],
    },
  ];
  S['final.A'] = [
    { say: 'kaelen', e: 'sad', t: 'Elara. {p:0.5}Llévalo tú. {p:0.4}Y vuelve con la pleamar. {p:0.3}Me lo prometiste: antes de once años.' },
    { say: 'elara', e: 'happy', t: 'Antes de once años. {p:0.4}Y si tardo, mándame a Oslo. {p:0.3}Con mi oreja.' },
    { say: 'oslo', e: 'sad', t: 'Te esperaré en el muelle cada mañana, pequeña. {p:0.4}Como tu madre.' },
    { flash: 1.0, color: '#d8e0ff' },
    { say: 'none', t: 'Elara toma la luz del latido. {p:0.4}Se vuelve plata, luego luna, luego marea… {p:0.4}y desciende hacia el corazón del Motor.' },
    { leave: 'elara' },
    { say: 'none', t: 'Muy abajo, los engranajes empiezan a girar. {p:0.5}Tic. {p:0.5}Tac.' },
    { call: 'final.amanecer' },
  ];
  S['final.B'] = [
    { say: 'kaelen', e: 'sad', t: 'Oslo. {p:0.5}…Gracias.' },
    { say: 'oslo', e: 'neutral', t: 'No me des las gracias, Alteza. {p:0.4}Dame un encargo. {p:0.3}Llevar un latido al otro lado. {p:0.4}Nunca he dejado un encargo a medias.' },
    { say: 'elara', e: 'sad', t: 'Oslo… {p:0.4}¿Quién me traerá de una oreja ahora?' },
    { say: 'oslo', e: 'sad', t: 'Tu madre, pequeña. {p:0.4}Ella siempre fue más fuerte que yo. {p:0.3}Dile que el encargo está hecho.' },
    { flash: 1.0, color: '#d8f0ff' },
    { say: 'none', t: 'Oslo carga la luz como cargaba su ancla. {p:0.4}Rema con los brazos en el agua negra, sin barca, {p:0.3}hacia el corazón del Motor.' },
    { leave: 'oslo' },
    { say: 'none', t: 'Muy abajo, los engranajes empiezan a girar. {p:0.5}Tic. {p:0.5}Tac.' },
    { call: 'final.amanecer' },
  ];
  S['final.amanecer'] = [
    { say: 'voice', name: 'Aurelia', t: '{s:0.7}Lo oigo. {p:0.5}Lo oigo, hijo mío. {p:0.4}El mañana.' },
    { say: 'voice', name: 'Aurelia', t: 'Thalyria descansará por fin. {p:0.4}Yo con ella. {p:0.3}No llores: {p:0.3}un día que termina no es una tragedia. {p:0.4}Es un día.' },
    { say: 'kaelen', e: 'sad', t: 'Adiós, madre.' },
    { say: 'none', t: 'En la Ciudad Dorada, el instante avanza un segundo. {p:0.5}El niño apoya el pie en el suelo. {p:0.4}La mujer se ríe. {p:0.4}La gaviota termina su vuelo.' },
    { say: 'none', t: 'Y la ciudad entera se deshace en luz, sin miedo, {p:0.3}como un día que se acaba.' },
    { say: 'none', t: 'En la puerta de oro, Firion sigue en pie. {p:0.4}A sus pies, entre el agua negra que se retira, Varek abre los ojos.' },
    { say: 'varek', e: 'sad', t: 'No me mires, Firion. {p:0.4}No después de todo esto.' },
    { say: 'firion', e: 'neutral', t: 'Un vigía mira para que los demás puedan dormir. {p:0.4}Me lo enseñaste tú.' },
    { say: 'varek', e: 'sad', t: 'Tu padre remaba hacia mí cuando llegó la ola. {p:0.5}Le vi la cara. {p:0.4}No llegué.' },
    { say: 'firion', e: 'sad', t: 'Ya lo sé, capitán. {p:0.5}Hoy sí has llegado. {p:0.4}Estás aquí. {p:0.3}Apóyate.' },
    { flash: 1.6, color: '#ffffff' },
    { fade: 1, time: 1.4, color: '#fff6dc' },
    { set: { 'mar.subido': false, 'faro.apagado': false, 'juego.final': true } },
    { clock: 1 },
    { warp: 'brumaSalada', at: [33, 8.1], dir: 'down', hour: 5.6 },
    { music: 'grupo' },
    { if: 'final=A', then: [{ roster: ['kaelen', 'flint'] }], else: [{ roster: ['kaelen', 'elara', 'flint'] }] },
    { place: 'halvard', at: [34.6, 8], dir: 'left' },
    { place: 'ilun', at: [31.6, 8.3], dir: 'right' },
    { cam: [33, 4] },
    { fade: 0, time: 2.4 },
    { hour: 6.6, time: 5, wait: false },
    { say: 'none', t: 'Al este de Vael, sobre el mar, sale el sol. {p:0.5}No se detiene en lo alto. {p:0.4}Sigue su camino. {p:0.3}Como cualquier otro día.' },
    { say: 'halvard', e: 'happy', t: 'El mar baja. {p:0.4}Mirad la playa. {p:0.3}Mirad el muelle. {p:0.5}Cincuenta años mirando esta luz, y hoy por fin la veo {*terminar*} una noche.' },
    { say: 'ilun', e: 'happy', t: 'El Día Detenido ha terminado, muchacho. {p:0.4}Y empieza el tuyo.' },
    { call: 'final.epilogo' },
  ];
  S['final.epilogo'] = [
    { fade: 1, time: 1.2 },
    { chapter: 'Epílogo', title: 'Un año después', sub: 'Thalyria · El Día Detenido' },
    { hour: 18.4, time: 0.1 },
    { cam: [19, 13] },
    { fade: 0, time: 1.6 },
    { say: 'none', t: 'Bruma Salada se reconstruyó. {p:0.4}La fragua de Flint tiene ahora dos yunques: {p:0.3}uno para el pueblo, y otro que lleva grabado «Hondaroca».' },
    { say: 'flint', e: 'happy', t: 'Le he puesto precio de amigo a todo el archipiélago. {p:0.4}Estoy arruinado. {p:0.3}Nunca he sido tan feliz.' },
    { say: 'none', t: 'Firion volvió del instante una semana después, con la espada mellada y Varek apoyado en su hombro. {p:0.4}Ahora guardan juntos el faro del Vigía. {p:0.3}Varek aún no se perdona. {p:0.3}Firion no tiene prisa.' },
    { if: 'dec.2=B', then: [{ say: 'none', t: 'El primer día, Kaelen subió al faro y se sentó con Varek junto al fuego. {p:0.4}No hablaron. {p:0.3}Una vez Varek habló y Kaelen escuchó. {p:0.4}Ahora le tocaba a él escuchar el silencio.' }],
      else: [{ say: 'none', t: 'Varek no se acerca a ninguna hoguera. {p:0.4}Firion le deja una encendida cada noche en el faro, por si acaso.' }] },
    { if: 'dec.3=B', then: [{ say: 'none', t: 'En las islas le llaman Alteza. {p:0.4}Kaelen contesta igual, y luego pide que le pasen la red.' }],
      else: [{ say: 'none', t: 'En las islas le siguen llamando Kaelen de Bruma. {p:0.4}La lanza cuelga en la pared de Halvard, junto a las redes.' }] },
    { if: 'dec.4=B', then: [{ say: 'none', t: 'En Hondaroca, la familia Brea volvió a encender la Gran Fragua. {p:0.4}La primera pieza fue un yunque pequeño, para Flint.' }],
      else: [{ say: 'none', t: 'Hondaroca tardó un año en volver a encender su fragua. {p:0.4}Flint subió a ayudar cada domingo, sin cobrar. {p:0.3}Casi.' }] },
    { if: 'final=A', then: [
      { say: 'none', t: 'Cada noche de luna llena, la marea sube un poco más de lo normal en la playa de Bruma Salada. {p:0.4}Y cada noche, Kaelen baja a esperarla.' },
      { say: 'none', t: 'Lía y Taro dejan un plato de más en la mesa. {p:0.4}Oslo rema al amanecer, mirando el agua.' },
      { say: 'kaelen', e: 'neutral', t: 'Antes de once años, Elara. {p:0.5}Llevo uno.' },
      { flash: 0.6, color: '#d8e0ff' },
      { say: 'none', t: 'Lejos, bajo el agua, algo plateado sube con la pleamar.' },
    ], else: [
      { say: 'none', t: 'La barca de Oslo apareció varada en la playa la primera mañana del nuevo tiempo. {p:0.4}Vacía. {p:0.3}Con el ancla bien atada, como deja las cosas quien termina un encargo.' },
      { say: 'none', t: 'Elara la pintó de azul, como la casa de sus padres. {p:0.4}Ahora la usa para cruzar a la aldea de los faroleros cada luna.' },
      { say: 'elara', e: 'sad', t: 'Encargo hecho, Oslo. {p:0.5}Mi madre te manda decir que eres un viejo tonto. {p:0.4}Y que gracias.' },
      { say: 'kaelen', e: 'neutral', t: 'Cada vez que el Motor da la hora, pienso que es él, remando.' },
    ] },
    { say: 'mira', e: 'happy', t: '¡Kaelen! {p:0.3}¡He hecho pan! {p:0.4}…Está quemado. {p:0.3}Ven igualmente.' },
    { say: 'kaelen', e: 'happy', t: 'Voy, Mira. {p:0.4}Con el sol detrás.' },
    { call: 'final.creditos' },
  ];
  S['final.creditos'] = [
    { fade: 1, time: 1.6, color: '#05040c' },
    { credits: true },
    { if: 'final=A', then: [{ chapter: 'FIN', title: 'Final A · La pleamar', sub: 'Prueba el otro final desde «Pruebas · Capítulo 8»', time: 5 }], else: [{ chapter: 'FIN', title: 'Final B · El último encargo', sub: 'Prueba el otro final desde «Pruebas · Capítulo 8»', time: 5 }] },
    { set: { 'juego.fin': true, objetivo: 'fin' } },
    { fade: 0, time: 1.6 },
    { bars: false },
    { cam: 'free', time: 0.6 },
    { toast: 'Gracias por jugar · Partida guardada (puedes seguir paseando por Vael)' },
    { save: true },
  ];

  // ---------- charlas ----------
  T.ithra_tienda = [{ say: '@npc', e: 'neutral', name: 'Ithra', t: 'La reina dejó ofrendas para este día. {p:0.3}Tomadlas. {p:0.4}Para eso las guardó mil años.' }, { shop: 'ithra' }];
  T.congelado = [{ say: 'none', t: 'Congelado a medio gesto. {p:0.4}Sus ojos siguen algo que ocurrió hace mil años.' }];
  D.maps.congelada.npcs.push({ id: 'varek', talk: 'varek', c: 17.5, r: 3.4, ai: 'idle', dir: 'down', if: ['cap8.puerta', '!varek.libre', 'epoca.congelada=past'] });
})();
