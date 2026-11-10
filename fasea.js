// FASE A · calidad de vida y combate táctico.
// · Bestiario (registro en la partida: vistos, derrotas, debilidades/resistencias descubiertas, zona)
// · Diario «Historia» por capítulos (lo que está en curso solo muestra su arranque) + objetivo actual
// · Mapa del archipiélago con las zonas visitadas y viaje rápido desde las Piedras de viaje
// · Revanchas del postgame en el Espejo de las Mareas (Abismo de la Crecida)
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, F = TH.flags;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const base = (k) => String(k).replace(/_rev$/, '');

  // ================= BESTIARIO =================
  const BKEY = 'bestiario';
  TH.bestiary = {
    data() { let b = F.get(BKEY); if (!b || typeof b !== 'object') { b = {}; F.set(BKEY, b); } return b; },
    rec(k) { const b = this.data(), id = base(k); return b[id] || (b[id] = { k: 0, w: [], r: [] }); },
    seen(k, zone) { const r = this.rec(k); r.s = 1; if (zone && !r.z) r.z = zone; },
    kill(k) { this.rec(k).k++; },
    learn(k, kind, t) { const r = this.rec(k); if (!r[kind].includes(t)) r[kind].push(t); },
    known(k) { const r = this.data()[base(k)]; return { w: r ? r.w.slice() : [], r: r ? r.r.slice() : [] }; },
  };
  const DESC = {
    larva: 'Cría del Fondo que el mar escupió la noche en que se apagó el faro. Sola es débil; en enjambre, no.',
    cangrejo: 'Cangrejo del arrecife con caparazón de coral vivo. Se encierra en su concha y aplasta con la tenaza.',
    gaviota: 'Gaviotón de las tormentas del este. Se lanza en picado y odia el filo de las hojas.',
    karkinos: 'Guardián del Arrecife. Sus pinzas protegen el cuerpo: hay que quitárselas de encima para llegar a él.',
    larva_voraz: 'Larva que ha comido demasiada luz. Su boca de lamprea tiene anillos de dientes que no dejan de girar.',
    cangrejo_roca: 'Ermitaño que carga con una roca entera por concha. Lenta, terca y con una pinza que parte remos.',
    gaviota_abisal: 'Ave tocada por el Fondo: plumas que se deshacen, ojos violetas y un pico que gotea oscuridad.',
    matriarca: 'La larva reina que bebió la luz del faro de Bruma. Aún la lleva dentro, latiendo en el vientre.',
    larva_musgo: 'Brote carnívoro del Bosque de las Raíces Hundidas. Florece donde la savia se volvió negra.',
    larva_espina: 'Brote cubierto de espinas que dispara a quien se acerca. La Luz lo marchita.',
    cangrejo_raiz: 'Lobo hecho de corteza y raíz. Caza en manada y aúlla para llamar a los suyos.',
    cangrejo_tronco: 'Lobo viejo de tronco hueco. Muerde poco, pero aguanta lo que le echen.',
    madre: 'La Madre del Bosque, corrompida por el Fondo. Sus zarpas de raíz la cubren mientras sigan en pie.',
    lobo_alfa: 'Jefe de la manada de la Hondonada de las Espinas. Muerde con el colmillo que luego llevarás tú.',
    halcon: 'Halcón de las Ruinas de Thalyria. Anida en las cornisas y ataca desde el sol.',
    halcon_tormenta: 'Halcón cargado de rayos que caza cuando el cielo se rompe.',
    centinela: 'Centinela de bronce que todavía cumple órdenes de un reino que ya no existe.',
    centinela_mayor: 'Centinela de mayor rango. Su escudo aguanta más de lo que parece.',
    vigia_bronce: 'El Vigía de Bronce, guardián del faro de las Ruinas. Sus brazos le protegen y golpean por él.',
    varek: 'Varek, el que busca el Día Detenido. Frío, preciso y convencido de tener razón.',
    engranaje: 'Engranaje vigía de la Ciudad Dorada. Gira y gira, y avisa a todos los demás.',
    engranaje_mayor: 'Un engranaje mayor que marca el paso de los pequeños.',
    polilla: 'Polilla del tiempo. Sus alas dejan un polvo que hace que los segundos pesen.',
    polilla_eterna: 'Polilla que no envejece. Lleva siglos volando en la misma tarde.',
    sombra: 'Sombra del Fondo. Un pedazo de oscuridad que aprendió a tener forma.',
    sombra_abisal: 'Sombra más vieja y más hambrienta. Llama a otras cuando se siente sola.',
    cronoguardia: 'Guardián del Motor en la Ciudad Dorada. Sus agujas marcan la hora de tu derrota.',
    abisal: 'El Primer Abisal, lo que vive debajo del mar. Lo que despierta, sube con él.',
    medusa: 'Medusa del Fondo que llegó con la crecida. Su roce adormece.',
    medusa_reina: 'Medusa reina: más grande, más lenta y mucho más venenosa.',
    cangrejo_abisal: 'Cangrejo de las fosas, de caparazón negro y pinzas como anclas.',
    cangrejo_titan: 'Cangrejo titán que se instaló en la Hondaroca hundida.',
    coloso: 'El Coloso de la Forja, el orgullo de Hondaroca, despertado por la marea. Sus yunques le guardan.',
    farol_errante: 'Farol que se escapó de su poste en la Aldea de los Faroleros. Busca a quien encenderle.',
    farol_corrupto: 'Farol tocado por el Fondo. Su luz ya no ilumina: quema.',
    guardian_marea: 'Guardián de la Torre del Motor. Obedece a la marea, no a las personas.',
    guardian_abismo: 'Guardián del abismo, más antiguo que la Torre a la que vigila.',
    coloso_guerra: 'El Coloso de guerra que pilota Varek. Sus puños son lo primero que hay que callar.',
    cristal_tiempo: 'Cristal flotante con un reloj dentro. Guarda un segundo de la Ciudad Congelada.',
    cristal_eterno: 'Cristal violeta con anillo dorado. Su reloj gira más rápido cuando hechiza.',
    eco_helado: 'Espectro de hielo: alguien que quedó congelado a medio gesto dentro del instante.',
    eco_glacial: 'Eco más antiguo, coronado de carámbanos. Ya no recuerda quién fue.',
    varek_abisal: 'Varek, fundido con el Fondo en el pasado congelado. Ya no hay marcha atrás para él.',
    abisal_eco: 'El Primer Abisal en el presente en ruinas: lo que queda cuando el mar lo ha tomado todo.',
    corazon: 'El Corazón del Fondo, dentro del Motor. Un reloj-ojo detenido que late por todo el archipiélago.',
    cria_leviatan: 'Cría de Leviatán. Pequeña para su especie; enorme para cualquier otra.',
    medusa_primordial: 'Medusa primordial del Abismo de la Crecida. Sus órganos brillan como un mapa del mar.',
    eco_primordial: 'Manta espectral cubierta de runas. Recuerda el mar de antes del mar.',
    leviatan: 'El Leviatán Primordial, el que estaba antes del mar. Guarda la última carta de Elara.',
  };
  const ORDER = Object.keys(DESC);

  // ================= DIARIO =================
  const J = [
    { t: 'Prólogo · La noche en que se apagó el faro', if: true, done: 'jefe.matriarca',
      intro: 'Bruma Salada amanece como cualquier otro día. Kaelen sueña con el mar, y el mar, esta noche, va a contestar.',
      text: 'Kaelen conoció a Elara, aprendiz de Ilun, en el claro del bosque. Esa misma noche el faro de Bruma tembló y el mar escupió larvas: Flint salió de su fragua para defender la plaza y el puerto. La Matriarca abisal bebió la luz del faro y la lanza de Kaelen despertó con la Lanzada lunar. En la Gruta de la Marea la derrotasteis, la luz volvió al faro y Halvard e Ilun os hablaron de los cuatro faros de Vael.' },
    { t: 'Capítulo 1 · El Vigía del Cabo', if: 'jefe.matriarca', done: 'cap1.fin',
      intro: 'Tras despedirse de Mira, el grupo pone rumbo al Cabo del Vigía, donde espera el primero de los cuatro faros.',
      text: 'En el Cabo conocisteis a Firion, abristeis la reja y el molino y despertasteis el Ojo del Vigía con la Lanzada lunar: el faro volvió a brillar. En el Arrecife de Coral os esperaba Karkinos, el Guardián, y tras vencerle la marea subió de golpe y se llevó a Elara.' },
    { t: 'Capítulo 2 · La Madre del Bosque', if: 'cap1.fin', done: 'cap2.fin',
      intro: 'Flint se queda en la fragua. Kaelen y Firion siguen la corriente hacia el oeste, tras el rastro de Elara.',
      text: 'La corriente os llevó al Bosque de las Raíces Hundidas. En la Hondonada de las Espinas encontrasteis el colgante de Elara, vencisteis al Lobo alfa y rompisteis el Corazón de espinas. Elara despertó entre las raíces y juntos derrotasteis a la Madre del Bosque: el faro de las Raíces volvió a brillar. Elara os habló por primera vez de Varek, y Flint volvió… con presupuesto.' },
    { t: 'Capítulo 3 · El Vigía de Bronce', if: 'cap2.fin', done: 'cap3.fin',
      intro: 'Las Ruinas de Thalyria guardan el tercer faro, y alguien ha llegado antes que vosotros.',
      text: 'En las Ruinas os cruzasteis con Varek, que busca el Día Detenido, y Firion pudo medirse con él. El Vigía de Bronce cayó, el faro de las Ruinas despertó y Kaelen empezó a intuir que su historia no empezó en Bruma Salada.' },
    { t: 'Capítulo 4 · La Ciudad Dorada', if: 'cap3.fin', done: 'cap4.fin',
      intro: 'El altar del faro de Thalyria os arrastra al pasado, a una ciudad que todavía está viva.',
      text: 'En la Ciudad Dorada, el Cronista os enseñó la regla del Motor: «lo que se siembra ayer florece mañana». Plantasteis la semilla, vencisteis a la Cronoguardia y alguien llamó a Kaelen «Alteza».' },
    { t: 'Capítulo 5 · La Biblioteca de las Dos Épocas', if: 'cap4.fin', done: 'cap5.fin',
      intro: 'La Biblioteca existe a la vez en el pasado y en el presente, y en ella está el libro del Día Detenido.',
      text: 'Entre dos épocas buscasteis el libro de la reina. Varek también lo quería. Elara aprendió a detener el tiempo, el Primer Abisal se alzó contra vosotros y la verdad salió a la luz: Kaelen es el hijo de la reina Aurelia.' },
    { t: 'Capítulo 6 · La profecía del mar', if: 'cap5.fin', done: 'cap6.fin',
      intro: 'El Primer Abisal se agita y el mar sube. Bruma Salada amanece inundada y el mapa del mundo ya no es el mismo.',
      text: 'Firion se marchó tras Varek. Viajasteis a Hondaroca, el pueblo de Flint, que estaba hundido, y Oriel os contó la profecía «del mar». Firion volvió con la verdad: fue Varek quien abrió las compuertas. Vencisteis al Coloso de la Forja y la Torre del Motor emergió del agua.' },
    { t: 'Capítulo 7 · Los cuatro faros', if: 'cap6.fin', done: 'cap7.fin',
      intro: 'Oslo, el barquero de las mareas, os lleva a la Aldea de los Faroleros, el hogar de Elara.',
      text: 'Elara cenó con sus padres antes de subir a la Torre del Motor, donde cada uno encendió su faro. Ithra os reveló el origen de Kaelen, y Varek apareció a los mandos del Coloso de guerra. Lo derribasteis, pero el instante ya se había abierto.' },
    { t: 'Capítulo 8 · El día que no termina', if: 'cap7.fin', done: { any: ['final.A', 'final.B', 'juego.fin'] },
      intro: 'Oslo vuelve. Dentro del instante espera la Ciudad Congelada, y en su centro, el Motor.',
      text: 'Firion sostuvo la puerta mientras el resto cruzaba. Varek Abisal cayó en el pasado congelado, el Primer Abisal en el presente en ruinas y el Corazón del Fondo dentro del Motor. Entonces se cumplió la profecía: «uno del mar volverá al mar». Hubo que elegir.' },
    { t: 'Epílogo', if: { any: ['final.A', 'final.B', 'juego.fin'] }, done: { any: ['final.A', 'final.B', 'juego.fin'] },
      intro: '',
      get text() { return F.get('final.A') ? 'Elara cumplió la profecía. El día que no terminaba terminó por fin, y el archipiélago de Vael volvió a tener mañanas.' : 'Oslo cumplió la profecía. El día que no terminaba terminó por fin, y el archipiélago de Vael volvió a tener mañanas.'; } },
    { t: 'Postgame · El Abismo de la Crecida', if: 'post.llegada', done: 'post.leviatan',
      intro: 'Tras los créditos emergió al sur el islote del Abismo. Elara dejó cartas en el pasado, y la última la guarda el Leviatán.',
      text: 'Encontrasteis las cartas que Elara escondió en las épocas antiguas y vencisteis al Leviatán Primordial. En el Espejo de las Mareas, los viejos enemigos esperan una revancha.' },
  ];

  // ================= MAPA Y VIAJE =================
  // zonas: punto en el mapa del archipiélago (384×216), isla y si tiene Piedra de viaje (entrada a la que llega)
  const Z = [
    { id: 'brumaSalada', alt: 'brumaInundada', name: 'Bruma Salada', x: 146, y: 122, isl: 'bruma', stone: ['este', 'plaza'], need: true, port: true },
    { id: 'gruta', name: 'Gruta de la Marea', x: 118, y: 124, isl: 'bruma', need: 'jefe.matriarca' },
    { id: 'acantilados', name: 'Ruta de los Acantilados', x: 186, y: 108, isl: 'bruma', stone: 'muelle', need: 'jefe.matriarca', port: true },
    { id: 'cabo', name: 'Cabo del Vigía', x: 206, y: 94, isl: 'bruma', stone: 'oeste', need: 'cap1.faro' },
    { id: 'arrecife', name: 'Arrecife de Coral', x: 196, y: 120, isl: 'bruma', need: 'cap1.fin' },
    { id: 'santuario', name: 'Santuario de las Resonancias', x: 170, y: 136, isl: 'bruma', stone: 'oeste' },
    { id: 'jardin', name: 'Jardín del Reloj', x: 156, y: 140, isl: 'bruma' },
    { id: 'bosque', name: 'Bosque de las Raíces Hundidas', x: 58, y: 64, isl: 'oeste', stone: 'muelle', need: 'cap2.fin', port: true },
    { id: 'hondonada', name: 'Hondonada de las Espinas', x: 44, y: 76, isl: 'oeste', need: 'cap2.fin' },
    { id: 'ruinas', name: 'Ruinas de Thalyria', x: 300, y: 150, isl: 'sur', stone: 'muelle', need: 'cap3.fin', port: true },
    { id: 'ciudad', name: 'Ciudad Dorada (pasado)', x: 314, y: 142, isl: 'sur', stone: 'sur', need: 'cap4.fin' },
    { id: 'biblioteca', name: 'Biblioteca de las Dos Épocas', x: 286, y: 160, isl: 'sur', stone: 'sur', need: 'cap5.fin' },
    { id: 'hondaroca', name: 'Hondaroca', x: 224, y: 32, isl: 'norte', stone: 'muelle', need: 'cap6.fin', port: true },
    { id: 'faroleros', name: 'Aldea de los Faroleros', x: 200, y: 182, isl: 'hundida', stone: 'muelle', need: 'cap7.fin', port: true },
    { id: 'torre', name: 'Torre del Motor', x: 216, y: 168, isl: 'hundida', need: 'cap7.fin' },
    { id: 'abismo', name: 'Abismo de la Crecida', x: 280, y: 170, isl: 'sur', stone: 'muelle', need: 'post.llegada', port: true },
  ];
  const zoneOf = (mapId) => Z.find((z) => z.id === mapId || z.alt === mapId);
  const VKEY = 'zonas';
  TH.travel = {
    visited() { let v = F.get(VKEY); if (!v || typeof v !== 'object') { v = {}; F.set(VKEY, v); } return v; },
    mark(mapId) { const z = zoneOf(mapId); if (z) this.visited()[z.id] = 1; },
    isVisited(z) { return !!this.visited()[z.id] || (z.need && F.test(z.need)); },
    dest() { return Z.filter((z) => z.stone && this.isVisited(z)); },
    // durante las secuencias de historia no se puede viajar
    blocked() {
      const m = TH.scenes.registry.map;
      if (!m || m.inCutscene) return 'Ahora no es momento de viajar.';
      if (F.get('def.activa') && !F.get('jefe.matriarca')) return 'Bruma Salada te necesita ahora.';
      if (F.get('cap7.fin') && !F.test({ any: ['final.A', 'final.B', 'juego.fin'] })) return 'El instante no deja que te vayas.';
      if (F.get('cap1.fin') && !F.get('cap2.fin') && !F.get('grupo.elara')) return 'Primero hay que encontrar a Elara.';
      return '';
    },
    go(z) {
      const m = TH.scenes.registry.map, flood = z.alt && F.get('mar.subido');
      const id = flood ? z.alt : z.id, st = Array.isArray(z.stone) ? z.stone[flood ? 1 : 0] : z.stone;
      while (TH.scenes.top() !== m) TH.scenes.pop();
      // a otra isla se va en barca: el mapa del archipiélago con la travesía animada
      const cur = zoneOf(m.mapId), W = D.world;
      if (cur && cur.isl !== z.isl && W) {
        const portOf = (isl, zid) => W.ports.find((p) => p.island === isl && p.zone === zid) || W.ports.find((p) => p.island === isl && (!p.unlock || F.get(p.unlock))) || W.ports.find((p) => p.island === isl);
        const from = portOf(cur.isl, m.mapId), to = portOf(z.isl, id);
        if (from && to) { TH.sfx('ok'); TH.scenes.push('world', { port: from.id, auto: { to, zone: id, entry: st, name: z.name } }); return; }
      }
      TH.sfx('ok');
      m.changeZone(id, st);
      TH.ui.toast('Viajas a ' + z.name);
    },
  };
  // puertos que faltaban para que todas las islas se unan en barca
  if (D.world) {
    const P = D.world.ports, addP = (o) => { if (!P.find((p) => p.id === o.id)) P.push(o); };
    addP({ id: 'raices', name: 'Muelle de las Raíces', island: 'oeste', x: 66, y: 80, zone: 'bosque', entry: 'muelle', unlock: 'cap2.fin' });
    addP({ id: 'ruinas', name: 'Ruinas de Thalyria', island: 'sur', x: 302, y: 178, zone: 'ruinas', entry: 'muelle', unlock: 'cap3.fin' });
    for (const id of ['oeste', 'sur', 'hundida']) { const I = D.world.islands.find((i) => i.id === id); if (I && I.unlock) { const u = I.unlock, alt = { oeste: 'cap2.fin', sur: 'cap3.fin', hundida: 'cap7.fin' }[id]; Object.defineProperty(I, 'unlock', { get: () => (F.get(alt) ? null : u), configurable: true }); } }
    const isl = (id) => D.world.islands.find((i) => i.id === id);
    if (isl('oeste')) Object.defineProperty(isl('oeste'), 'name', { value: 'Isla de las Raíces', configurable: true, writable: true });
    if (isl('sur')) Object.defineProperty(isl('sur'), 'name', { value: 'Isla de Thalyria', configurable: true, writable: true });
    if (isl('norte')) isl('norte').label = [262, 30];
    const rp = P.find((p) => p.id === 'ruinas'); if (rp) { rp.x = 318; rp.y = 162; }
    Object.assign(D.world.routes, { 'bruma>raices': [[130, 150], [90, 120], [70, 96]], 'bruma>ruinas': [[150, 162], [230, 176], [280, 182]], 'bruma>faroleros': [[150, 162], [186, 186]] });
  }
  // registra las zonas al entrar
  const MS = TH.MapScene.prototype, _load = MS.loadZone;
  MS.loadZone = function (id) { const r = _load.apply(this, arguments); try { TH.travel.mark(id); } catch (e) { /* nada */ } return r; };
  // Piedras de viaje: guardan, curan y abren el mapa para viajar
  const _int = MS.interact;
  MS.interact = function (t) {
    if (t && t.kind === 'sign' && t.e && t.e.travel) {
      const P = TH.party, zz = zoneOf(this.mapId);
      // punto seguro: aquí se vuelve si el grupo cae en combate
      F.set('safe', { map: this.mapId, x: this.leader.x, y: this.leader.y, name: (zz && zz.name) || (this.map.def.name || '') });
      for (const id in P.members) { const s = P.stats(id); P.members[id].hp = s.hp; P.members[id].mp = s.mp; }
      TH.sfx('heal');
      const ok = this.saveGame();
      const why = TH.travel.blocked();
      if (why) { TH.ui.toast((ok ? 'Partida guardada · ' : '') + why); return true; }
      TH.ui.toast(ok ? 'Partida guardada · grupo recuperado' : 'Grupo recuperado');
      TH.scenes.push('menu', { owner: this, tab: 6, travel: true });
      return true;
    }
    if (t && t.kind === 'sign' && t.e && t.e.mirror) { TH.cutscene.play(rematchScript(), { skippable: false }); return true; }
    return _int.apply(this, arguments);
  };

  // ---------- props: Piedra de viaje y Espejo de las Mareas ----------
  const PD = TH.props.defs;
  const px = (g, x, y, c, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w || 1, h || 1); };
  PD.piedra_viaje = {
    w: 20, h: 34, ax: 10, ay: 32, box: [-5, -3, 5, 1],
    layers: [{ k: 'b', sway: 0, build(g) {
      px(g, 3, 28, '#1a1428', 14, 4); px(g, 4, 27, '#3a3450', 12, 3);
      g.fillStyle = '#2a2440'; g.beginPath(); g.moveTo(10, 1); g.lineTo(16, 8); g.lineTo(15, 28); g.lineTo(5, 28); g.lineTo(4, 8); g.closePath(); g.fill();
      g.fillStyle = '#4a4468'; g.beginPath(); g.moveTo(10, 2); g.lineTo(14, 8); g.lineTo(13, 27); g.lineTo(10, 27); g.closePath(); g.fill();
      px(g, 8, 10, '#7af0ff', 4, 1); px(g, 9, 9, '#7af0ff', 2, 6); px(g, 7, 13, '#7af0ff', 6, 1); px(g, 9, 17, '#bff8ff', 2, 2); px(g, 8, 21, '#7af0ff', 4, 1);
      px(g, 6, 6, '#6a6488', 1, 18);
    } }],
    lights: [{ dx: 0, dy: -16, r: 26, c: [120, 230, 255], a: 0.7, always: 0.45, flicker: 1 }],
  };
  PD.espejo_mareas = {
    w: 30, h: 44, ax: 15, ay: 42, box: [-9, -3, 9, 1],
    layers: [{ k: 'b', sway: 0, build(g) {
      px(g, 4, 37, '#1a1428', 22, 6); px(g, 6, 35, '#3a3450', 18, 4);
      TH.ell(g, 15, 18, 12, 16, '#c8962e'); TH.ell(g, 15, 18, 10, 14, '#2a1a08'); TH.ell(g, 15, 18, 9, 13, '#14304a');
      TH.ell(g, 13, 14, 5, 7, '#2a6a8a'); TH.ell(g, 12, 12, 2, 3, '#7ad0f0');
      for (let i = 0; i < 4; i++) px(g, 9 + i * 3, 24 + (i % 2), '#58c0ff', 2, 1);
      px(g, 14, 1, '#ffd27a', 2, 3); px(g, 13, 32, '#c8962e', 4, 4);
    } }],
    lights: [{ dx: 0, dy: -24, r: 40, c: [120, 200, 255], a: 0.8, always: 0.5 }],
  };
  const SPOTS = { brumaSalada: [35, 11], brumaInundada: [21, 12], acantilados: [30, 20], cabo: [4, 22], santuario: [3, 5], bosque: [14, 22], ruinas: [15, 24], biblioteca: [15, 19], hondaroca: [16, 19], faroleros: [13, 20], abismo: [16, 23] };
  for (const id in {}) {
    const M = D.maps[id];
    if (!M) continue;
    M.signs = (M.signs || []).concat([{ c: SPOTS[id][0], r: SPOTS[id][1] + 0.4, prop: 'piedra_viaje', travel: true, name: 'Piedra de viaje' }]);
  }
  if (D.maps.abismo) D.maps.abismo.signs = D.maps.abismo.signs.concat([{ c: 12, r: 10.4, prop: 'espejo_mareas', mirror: true, name: 'Espejo de las Mareas' }]);
  void SPOTS;

  // ================= REVANCHAS (postgame) =================
  const REV = [
    { id: 'matriarca', g: ['matriarca'], item: 'luz_robada', name: 'Matriarca abisal' },
    { id: 'karkinos', g: ['karkinos', 'pinza_izq', 'pinza_der'], item: 'caparazon_guardian', name: 'Karkinos' },
    { id: 'madre', g: ['madre', 'zarpa_izq', 'zarpa_der'], item: 'savia_madre', name: 'Madre del Bosque' },
    { id: 'vigia', g: ['vigia_bronce', 'brazo_izq', 'brazo_der'], item: 'ojo_bronce', name: 'Vigía de Bronce' },
    { id: 'crono', g: ['cronoguardia', 'aguja_izq', 'aguja_der'], item: 'aguja_eterna', name: 'Cronoguardia' },
    { id: 'coloso', g: ['coloso', 'yunque_izq', 'yunque_der'], item: 'nucleo_forja', name: 'Coloso de la Forja' },
    { id: 'guerra', g: ['coloso_guerra', 'puno_izq', 'puno_der'], item: 'emblema_guerra', name: 'Coloso de guerra' },
    { id: 'varek', g: ['varek_abisal'], item: 'capa_varek', name: 'Varek Abisal' },
  ];
  const IT = D.items, addIt = (id, o) => { o.id = id; IT[id] = o; };
  addIt('luz_robada', { name: 'Luz robada', type: 'acc', price: 0, stats: { hp: 120, mag: 14, res: 10 }, desc: 'La luz del faro que la Matriarca no llegó a digerir. Todavía calienta.' });
  addIt('caparazon_guardian', { name: 'Caparazón del Guardián', type: 'acc', price: 0, stats: { hp: 160, def: 22 }, desc: 'Un trozo del caparazón de Karkinos. Las olas se apartan.' });
  addIt('savia_madre', { name: 'Savia de la Madre', type: 'acc', price: 0, stats: { hp: 100, mp: 30, res: 14 }, desc: 'Savia limpia del Bosque, ya sin rastro del Fondo.' });
  addIt('ojo_bronce', { name: 'Ojo de bronce', type: 'acc', price: 0, stats: { atk: 12, spd: 10 }, desc: 'El ojo del Vigía. Ve el golpe antes de que llegue.' });
  addIt('aguja_eterna', { name: 'Aguja eterna', type: 'acc', price: 0, stats: { spd: 14, mag: 8 }, desc: 'Una aguja de la Cronoguardia. Siempre marca un poco antes.' });
  addIt('nucleo_forja', { name: 'Núcleo de la Forja', type: 'acc', price: 0, stats: { atk: 18, def: 8 }, desc: 'El corazón del Coloso de Hondaroca. Flint jura que lo puede arreglar.' });
  addIt('emblema_guerra', { name: 'Emblema de guerra', type: 'acc', price: 0, stats: { atk: 16, mag: 16 }, desc: 'El emblema del Coloso de guerra, abollado por tus golpes.' });
  addIt('capa_varek', { name: 'Capa de Varek', type: 'acc', price: 0, stats: { hp: 80, atk: 12, mag: 12, spd: 8 }, desc: 'Lo único que quedó de Varek en el instante. Ya no está fría.' });
  addIt('corona_mareas', { name: 'Corona de las Mareas', type: 'acc', price: 0, stats: { hp: 200, mp: 50, atk: 20, def: 16, mag: 20, res: 16, spd: 10 }, desc: 'Premio del Espejo de las Mareas a quien venció a todos sus reflejos.' });

  // copia profunda que conserva funciones
  const clone = (o) => Array.isArray(o) ? o.map(clone) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o;
  const LV = D.enemies.leviatan || { hp: 13000, atk: 104, def: 48, mag: 100, res: 44 };
  for (const R of REV) {
    const B = D.enemies[R.g[0]];
    if (!B) continue;
    const k = { hp: (R.g.length > 1 ? 12000 : 17000) / B.hp, atk: (LV.atk * 0.98) / B.atk, def: (LV.def * 0.9) / Math.max(1, B.def), mag: (LV.mag * 0.96) / Math.max(1, B.mag), res: (LV.res * 0.9) / Math.max(1, B.res) };
    R.rg = R.g.map((key) => {
      const S = D.enemies[key];
      if (!S) return key;
      const N = clone(S);
      for (const st of ['hp', 'atk', 'def', 'mag', 'res']) N[st] = Math.round(S[st] * k[st]);
      if (!S.boss) N.hp = Math.min(N.hp, 2600);
      N.spd = (S.spd || 6) + 4; N.exp = S.boss ? 9000 : 1200; N.gold = S.boss ? 3000 : 300; N.drops = [];
      if (S.boss) N.title = 'Reflejo del Espejo de las Mareas';
      if (N.phases) N.phases = N.phases.map((p) => { const q = Object.assign({}, p); delete q.dialog; delete q.set; delete q.script; return q; });
      for (const a of Object.values(N.actions || {})) if (a.kind === 'summon') a.summon = 'cria_leviatan';
      D.enemies[key + '_rev'] = N;
      return key + '_rev';
    });
  }
  function rematchScript() {
    const done = REV.filter((R) => F.get('rev.' + R.id)).length;
    const opts = REV.filter((R) => R.rg).map((R) => ({
      t: (F.get('rev.' + R.id) ? '✓ ' : '') + R.name,
      then: [{ battle: R.rg, fullHeal: true, after: [
        { if: '!rev.' + R.id, then: [{ set: 'rev.' + R.id }, { say: 'none', name: 'Espejo de las Mareas', t: 'El reflejo se deshace en espuma y deja algo atrás.' }, { give: R.item }] },
        { if: REV.map((x) => 'rev.' + x.id).concat(['!rev.corona']), then: [{ set: 'rev.corona' }, { say: 'none', name: 'Espejo de las Mareas', t: 'Todos los reflejos han caído. {p:0.3}El espejo te ofrece su corona.' }, { give: 'corona_mareas' }] },
      ] }],
    }));
    opts.push({ t: 'Ahora no' });
    return [{ choice: opts, name: 'Espejo de las Mareas', t: 'El agua del espejo refleja a los enemigos que venciste, más fuertes que entonces. (' + done + '/' + REV.length + ' reflejos vencidos) ¿A quién quieres enfrentarte?' }];
  }

  // ================= PESTAÑAS DEL MENÚ =================
  const SIL = new Map();
  function sprCanvas(id, f, seen) {
    const sp = (D.enemies[id] && D.enemies[id].sprite) || id, im = TH.foes.frame(sp, 'idle', f % 4, false);
    if (seen) return im;
    const key = sp + f;
    if (SIL.has(key)) return SIL.get(key);
    const o = TH.makeCanvas(im.width, im.height);
    o.g.drawImage(im, 0, 0); o.g.globalCompositeOperation = 'source-in'; o.g.fillStyle = '#2a2440'; o.g.fillRect(0, 0, im.width, im.height);
    SIL.set(key, o.c);
    return o.c;
  }
  function objective() {
    const h = document.getElementById('objHud');
    if (h && !h.hidden && h.textContent.trim()) return h.textContent.trim().replace(/^Objetivo:\s*/, '');
    const o = F.get('objetivo');
    return (TH.objTexts && TH.objTexts[o]) || '';
  }
  const icons = (list) => list.map((t) => '<span class="tyw"><canvas class="tyi" width="9" height="9" data-ty="' + t + '" title="' + t + '"></canvas><small>' + t + '</small></span>').join('');
  TH.fasea = { DESC, ORDER, J, Z };
  TH.menuExt = {
    rows(tab) {
      if (tab === 4) return J.filter((j) => F.test(j.if)).map((j) => ({ j })).reverse();
      if (tab === 5) return ORDER.filter((k) => D.enemies[k]).map((k) => ({ k }));
      if (tab === 6) { const d = Z.filter((z) => TH.travel.isVisited(z)); return d.length ? d.map((z) => ({ z })) : [{ none: true }]; }
      return [];
    },
    draw(tab, M, rows, rowCls) {
      let h = '', foot = '';
      if (tab === 4) {
        const ob = objective(), r = rows[M.idx];
        h = '<div class="jr-obj"><b>Objetivo actual</b><span>' + esc(ob || 'Explora libremente.') + '</span></div><div class="split"><div class="list">' +
          rows.map((x, i) => '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span>' + esc(x.j.t) + '</span>' + (F.test(x.j.done) ? '<span class="lbl">✓</span>' : '<span class="lbl">en curso</span>') + '</button>').join('') +
          '</div><div class="jr-txt">' + (r ? '<h4>' + esc(r.j.t) + '</h4><p>' + esc(F.test(r.j.done) ? r.j.text : r.j.intro) + '</p>' : '') + '</div></div>';
        foot = 'El diario se escribe solo a medida que avanzas.';
      } else if (tab === 5) {
        const B = TH.bestiary.data(), seen = rows.filter((x) => B[x.k] && B[x.k].s).length, r = rows[M.idx], rec = r && B[r.k], E = r && D.enemies[r.k];
        h = '<div class="split"><div class="list bst">' + rows.map((x, i) => {
          const s = B[x.k] && B[x.k].s;
          return '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span><small>#' + String(i + 1).padStart(2, '0') + '</small> ' + (s ? esc(D.enemies[x.k].name) : '???') + '</span>' + (s && D.enemies[x.k].boss ? '<span class="lbl">jefe</span>' : '') + '</button>';
        }).join('') + '</div><div class="bst-card">';
        if (r) {
          const s = rec && rec.s;
          h += '<canvas id="bstSpr" width="240" height="120"></canvas>';
          if (s) {
            h += '<h4>' + esc(E.name) + (E.title ? ' <small>· ' + esc(E.title) + '</small>' : '') + '</h4><p>' + esc(DESC[r.k]) + '</p>' +
              '<div class="mini">PV ' + E.hp + ' · Visto en: ' + esc(rec.z || '—') + ' · Derrotado: <b>' + (rec.k || 0) + '</b></div>' +
              '<div class="mini">Débil a: ' + (rec.w.length ? icons(rec.w) : '<em>sin descubrir</em>') + '</div>' +
              '<div class="mini">Resiste: ' + (rec.r.length ? icons(rec.r) : '<em>sin descubrir</em>') + '</div>';
          } else h += '<h4>???</h4><p class="dim">Todavía no te has cruzado con esta criatura.</p>';
        }
        h += '</div></div>';
        foot = 'Vistos ' + seen + '/' + rows.length + ' · Golpea con elementos distintos para descubrir debilidades.';
      } else if (tab === 6) {
        h = '<div class="split"><div class="wm"><canvas id="wmCv" width="384" height="216"></canvas></div><div class="list">' +
          (rows[0] && rows[0].none ? '<p class="empty">Aún no has visitado ninguna Piedra de viaje.</p>' :
            rows.map((x, i) => '<button type="button" class="' + rowCls(i) + '" data-act="row" data-i="' + i + '"><span>' + (x.z.port ? '⚓ ' : '· ') + esc(x.z.name) + '</span>' + (TH.powers ? TH.powers.zoneLbl(x.z) : '') + '</button>').join('')) + '</div></div>';
        foot = (TH.powers ? TH.powers.regionFoot() + ' · ' : '') + 'Cruza entre islas en la barca de un muelle ⚓.';
      }
      return { h, foot };
    },
    after(tab, M, body) {
      body.querySelectorAll('canvas[data-ty]').forEach((c) => { const g = c.getContext('2d'); g.drawImage(TH.typeIcon(c.dataset.ty), 0, 0); });
      if (tab === 5) this.paintSpr(M, true);
      if (tab === 6) this.paintMap(M);
    },
    tick(tab, M) {
      if (tab !== 5) return;
      const now = performance.now();
      if (!M._bt || now - M._bt > 180) { M._bt = now; M._bf = ((M._bf || 0) + 1) % 4; this.paintSpr(M); }
    },
    paintSpr(M) {
      const c = document.getElementById('bstSpr'), r = M.rows()[M.idx];
      if (!c || !r) return;
      const g = c.getContext('2d'), rec = TH.bestiary.data()[r.k], im = sprCanvas(r.k, M._bf || 0, rec && rec.s);
      g.imageSmoothingEnabled = false; g.clearRect(0, 0, c.width, c.height);
      const s = Math.max(1, Math.min(3, Math.min(232 / im.width, 116 / im.height)));
      const tw = Math.round(im.width * s), th = Math.round(im.height * s);
      g.drawImage(im, Math.round((c.width - tw) / 2), c.height - th - 2, tw, th);
    },
    paintMap(M) {
      const c = document.getElementById('wmCv');
      if (!c) return;
      const g = c.getContext('2d'), W = D.world, sub = F.get('mar.subido'), cur = TH.scenes.registry.map.mapId, rows = M.rows(), selZ = rows[M.idx] && rows[M.idx].z;
      g.fillStyle = '#0a1c34'; g.fillRect(0, 0, 384, 216);
      for (let i = 0; i < 90; i++) { const h1 = Math.sin(i * 127.1) * 43758.5, h2 = Math.sin(i * 311.7) * 24634.6, x = (h1 - Math.floor(h1)) * 384, y = (h2 - Math.floor(h2)) * 216; g.fillStyle = 'rgba(120,180,230,.18)'; g.fillRect(x, y, 4, 1); }
      const vis = new Set(Z.filter((z) => TH.travel.isVisited(z)).map((z) => z.isl));
      for (const I of W.islands) {
        if (!vis.has(I.id) && !(I.unlock && F.get(I.unlock)) && I.id !== 'bruma') continue;
        for (const [x, y, r] of I.blobs) { g.fillStyle = '#c8b078'; g.beginPath(); g.arc(x, y, r + 2, 0, 7); g.fill(); }
        for (const [x, y, r] of I.blobs) { g.fillStyle = '#4a7a3a'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
        for (const [x, y, r] of I.blobs) { g.fillStyle = '#6a9a4a'; g.beginPath(); g.arc(x - r * 0.25, y - r * 0.25, r * 0.55, 0, 7); g.fill(); }
      }
      void sub;
      for (const z of Z) {
        if (!TH.travel.isVisited(z)) continue;
        const here = z.id === cur || z.alt === cur, sel = z === selZ;
        if (z.port) { g.fillStyle = sel ? '#ffffff' : '#7af0ff'; g.fillRect(z.x - 1, z.y - 4, 2, 7); g.fillRect(z.x - 3, z.y + 2, 6, 1); g.fillRect(z.x - 3, z.y - 2, 6, 1); }
        else { g.fillStyle = '#e8b84a'; g.fillRect(z.x - 1, z.y - 1, 3, 3); }
        if (here) { g.strokeStyle = '#ffd040'; g.lineWidth = 1; g.beginPath(); g.arc(z.x, z.y, 7, 0, 7); g.stroke(); }
        if (sel || here) TH.pixfont.draw(g, z.name, Math.min(330, Math.max(50, z.x)), z.y - 12, sel ? '#ffffff' : '#ffd040', 1);
      }
      TH.pixfont.draw(g, W.name, 192, 8, '#e8b84a', 1);
    },
    activate(tab, M, r) {
      if (tab === 6 && r && r.z) {
        if (!M.travel || true) { TH.ui.toast('Para viajar, sube a una barca en el muelle'); return; }
        const why = TH.travel.blocked();
        if (why) { TH.ui.toast(why); return; }
        const m = TH.scenes.registry.map;
        if (r.z.id === m.mapId || r.z.alt === m.mapId) { TH.ui.toast('Ya estás aquí'); return; }
        TH.travel.go(r.z);
      }
    },
  };

  // estilos de las nuevas pestañas
  const css = document.createElement('style');
  css.textContent = '.jr-obj{display:flex;gap:.6em;align-items:baseline;padding:.4em .6em;margin-bottom:.5em;border:1px solid rgba(232,184,74,.3);border-radius:6px;background:rgba(232,184,74,.07)}' +
    '.jr-obj b{color:var(--gold);white-space:nowrap}.jr-txt h4,.bst-card h4{margin:.1em 0 .4em;color:var(--gold)}.jr-txt p,.bst-card p{margin:0 0 .5em;line-height:1.45}' +
    '.bst{max-height:100%}.bst-card{display:grid;gap:.25em;align-content:start}.bst-card canvas#bstSpr{width:100%;max-width:320px;height:auto;image-rendering:pixelated;background:radial-gradient(ellipse at 50% 85%,rgba(120,100,200,.25),transparent 70%)}' +
    '.tyi{width:12px;height:12px;image-rendering:pixelated;vertical-align:-2px}.bst-card .mini{display:block}.tyw{display:inline-flex;align-items:center;gap:.25em;margin:0 .6em 0 .3em;white-space:nowrap}' +
    '.wm canvas{width:100%;height:auto;image-rendering:pixelated;border:1px solid rgba(232,184,74,.3);border-radius:6px}';
  document.head.appendChild(css);
})();
