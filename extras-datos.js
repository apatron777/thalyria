// FASE E · contenido extra: encargos de NPCs, rivales de «Mareas», pesca, ingredientes, recetas y hogueras.
// Los NPCs de encargos y los rivales cambian lo que dicen en cada capítulo.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, F = TH.flags, M = D.maps, I = D.items, E = D.enemies, S = D.scripts;
  const T = (D.talk = D.talk || {});
  const add = (id, o) => { o.id = id; I[id] = o; };
  const live = (obj, key, fn) => Object.defineProperty(obj, key, { get: fn, configurable: true, enumerable: true });

  // ================= OBJETOS =================
  // pescados (se pueden comer crudos) e ingredientes
  add('pez_plata', { name: 'Pez plateado', type: 'item', price: 14, use: { hp: 30 }, ingr: true, desc: 'El pez de toda la vida en Bruma. Brilla como una moneda.' });
  add('pez_lumbre', { name: 'Pez lumbre', type: 'item', price: 60, use: { hp: 60, mp: 10 }, ingr: true, rare: 1, desc: 'Lleva una lucecita en la frente. Sale poco y se escapa mucho.' });
  add('trucha_raiz', { name: 'Trucha de raíz', type: 'item', price: 20, use: { hp: 45 }, ingr: true, desc: 'Vive entre las raíces hundidas. Sabe a bosque.' });
  add('sardina_dorada', { name: 'Sardina dorada', type: 'item', price: 26, use: { hp: 55 }, ingr: true, desc: 'Nada en los canales de Thalyria desde hace mil años.' });
  add('pez_ceniza', { name: 'Pez ceniza', type: 'item', price: 34, use: { hp: 80 }, ingr: true, desc: 'Gris y caliente al tacto. Le gusta el agua de la forja.' });
  add('pez_farol', { name: 'Pez farol', type: 'item', price: 40, use: { hp: 90, mp: 10 }, ingr: true, desc: 'Los faroleros dicen que alumbra el camino a casa.' });
  add('pez_abisal', { name: 'Pez abisal', type: 'item', price: 70, use: { hp: 140 }, ingr: true, rare: 1, desc: 'Ojos enormes, dientes enormes, paciencia ninguna.' });
  add('pez_alba', { name: 'Pez del alba', type: 'item', price: 500, ingr: true, rare: 2, desc: 'El pez de las leyendas. Sus escamas tienen el color del primer sol.' });
  add('alga', { name: 'Alga marina', type: 'item', price: 6, ingr: true, desc: 'Sale enganchada al anzuelo más de lo que quisieras. Ingrediente.' });
  add('hierba_sal', { name: 'Hierba de sal', type: 'item', price: 10, ingr: true, desc: 'Crece en las rocas que salpica el mar. Ingrediente.' });
  add('seta_luna', { name: 'Seta de luna', type: 'item', price: 16, ingr: true, desc: 'Brilla un poco de noche. Ingrediente.' });
  // platos: curan y dan efecto en combate (fx)
  const dish = (id, name, use, fxName, desc) => add(id, { name, type: 'item', price: 0, dish: true, use: Object.assign(use, { fxName }), desc });
  dish('plato_brasa', 'Pescado a la brasa', { hp: 150, fx: { regen: 0.04 } }, 'Regeneración', 'Sencillo y bueno. Cura 150 PV y regenera vida en combate.');
  dish('sopa_algas', 'Sopa de algas', { hp: 80, mp: 30, fx: { mpRegen: 2 } }, 'Recupera PM cada turno', 'La sopa de la abuela de Mira. Cura 80 PV, 30 PM y devuelve PM cada turno.');
  dish('estofado_raiz', 'Estofado de raíz', { hp: 300, fx: { guardPlus: true } }, 'Guardia reforzada', 'Cura 300 PV. Defenderse cura y protege más.');
  dish('brocheta_bronce', 'Brocheta de bronce', { hp: 250, fx: { counter: 0.3 } }, 'Contraataque', 'Cura 250 PV. A veces devuelves el golpe.');
  dish('tarta_engranajes', 'Tarta de engranajes', { mp: 60, fx: { startCombo: 50 } }, 'Empieza con combo', 'Recupera 60 PM. Empiezas el combate con la barra de combo cargada.');
  dish('guiso_ceniza', 'Guiso de ceniza', { hp: 500, fx: { fury: 0.3 } }, 'Furia', 'Cura 500 PV. Golpeas más fuerte cuanto más herido estás.');
  dish('te_tinta', 'Té de tinta', { mp: 100, fx: { magRes: 0.25 } }, 'Resistencia mágica', 'Recupera 100 PM. La magia enemiga hace menos daño.');
  dish('caldereta_farol', 'Caldereta de faroleros', { hp: 700, mp: 50, fx: { regen: 0.06, weakBoost: 0.2 } }, 'Regeneración y golpe a debilidades', 'Cura 700 PV y 50 PM. Regeneras y castigas más las debilidades.');
  dish('banquete_alba', 'Banquete del alba', { hp: 9999, mp: 999, fx: { revive: true, regen: 0.08 } }, 'Resurrección y gran regeneración', 'Lo cura todo. Si caes en combate, te levantas una vez.');
  // recompensas de encargos y de Mareas (equipo con efecto)
  const acc = (id, name, stats, fx, desc) => add(id, { name, type: 'acc', price: 0, stats, fx, desc });
  acc('anzuelo_dorado', 'Anzuelo dorado', { spd: 2 }, { goldUp: 0.2, fishLuck: 1 }, 'De Nilo. Más oro en combate y los peces se sueltan menos.');
  acc('collar_conchas', 'Collar de conchas', { res: 8, mp: 10 }, { magRes: 0.15 }, 'Pía lo hizo con sus mejores conchas. Protege de la magia.');
  acc('pluma_tormenta', 'Pluma de tormenta', { spd: 6 }, { comboUp: 1.2 }, 'Del marinero Bastián. Se carga el combo más deprisa.');
  acc('lente_faro', 'Lente del faro', { mag: 6 }, { weakBoost: 0.25 }, 'Concentra la luz donde más duele.');
  acc('hoja_cortante', 'Hoja cortante', { def: 8 }, { thorns: 0.2 }, 'De Yara. Quien te golpea, se corta.');
  acc('reloj_bolsillo', 'Reloj de bolsillo', { spd: 4 }, { startCombo: 40, comboUp: 1.2 }, 'Ambrosio lo arregló para ti. Siempre va un segundo por delante.');
  acc('gafas_lector', 'Gafas de lector', { mag: 8, res: 4 }, { weakBoost: 0.2, mpRegen: 1 }, 'Selma dice que se ven las debilidades en letra pequeña.');
  acc('delantal_forja', 'Delantal de forja', { def: 12, hp: 60 }, { resist: { Fuego: 0.5 }, regen: 0.03 }, 'El delantal de Greta. Ni el magma lo atraviesa.');
  acc('farol_guia', 'Farol guía', { mp: 20 }, { mpRegen: 2, expUp: 0.1 }, 'Bram lo encendió para vosotros. Ilumina y enseña.');
  acc('cana_alba', 'Caña del alba', { atk: 10, mag: 10 }, { revive: true }, 'La caña del abuelo Cormac. Quien la lleva no se rinde nunca.');
  acc('ficha_sol', 'Ficha de sol', { spd: 3 }, { comboUp: 1.15 }, 'La ficha de la suerte de Teo. Te la ganaste.');
  acc('dado_forja', 'Dado de forja', { atk: 8 }, { fury: 0.25 }, 'Dora lo fundió con chatarra de la Gran Fragua.');
  acc('farolillo_nerea', 'Farolillo de Dalia', { mag: 8, mp: 20 }, { mpRegen: 2 }, 'La abuela Dalia juega con él encendido desde hace cincuenta años.');
  acc('tablero_campeon', 'Tablero del campeón', { atk: 12, mag: 12, spd: 6 }, { ringDouble: true, startCombo: 100 }, 'El tablero de Orión. Solo lo lleva quien le gana.');
  // recetas en papel: al cogerlas, se aprenden
  const RECIPE_ITEM = (id, rk, name) => add(id, { name: 'Receta: ' + name, type: 'key', learnRecipe: rk, desc: 'Al leerla, aprendes la receta.' });
  RECIPE_ITEM('receta_tarta', 'tarta', 'Tarta de engranajes');
  RECIPE_ITEM('receta_estofado', 'estofado', 'Estofado de raíz');
  const _add = TH.party.add.bind(TH.party);
  TH.party.add = function (it, n) {
    _add(it, n);
    const d = I[it];
    if (d && d.learnRecipe && n > 0 && TH.cook && TH.cook.learn(d.learnRecipe)) setTimeout(() => TH.ui.toast('Nueva receta: ' + D.recipes[d.learnRecipe].name), 0);
  };

  // ================= RECETAS =================
  D.recipes = {
    brasa: { name: 'Pescado a la brasa', dish: 'plato_brasa', ing: { pez_plata: 2 }, start: true },
    sopa: { name: 'Sopa de algas', dish: 'sopa_algas', ing: { alga: 2, pez_plata: 1 }, start: true },
    estofado: { name: 'Estofado de raíz', dish: 'estofado_raiz', ing: { trucha_raiz: 2, seta_luna: 1 } },
    brocheta: { name: 'Brocheta de bronce', dish: 'brocheta_bronce', ing: { sardina_dorada: 2, arena_dorada: 1 } },
    tarta: { name: 'Tarta de engranajes', dish: 'tarta_engranajes', ing: { engranaje_suelto: 1, hierba_sal: 2 } },
    guiso: { name: 'Guiso de ceniza', dish: 'guiso_ceniza', ing: { pez_ceniza: 2, escama_magma: 1 } },
    te: { name: 'Té de tinta', dish: 'te_tinta', ing: { tinta_viva: 1, hierba_sal: 1 } },
    caldereta: { name: 'Caldereta de faroleros', dish: 'caldereta_farol', ing: { pez_farol: 2, perla_marea: 1 } },
    banquete: { name: 'Banquete del alba', dish: 'banquete_alba', ing: { pez_alba: 1, pez_abisal: 2, hierba_sal: 1 } },
  };
  // ingredientes que sueltan los monstruos
  const drop = (k, item, chance) => { if (E[k]) E[k].drops = (E[k].drops || []).concat([{ item, chance }]); };
  drop('larva', 'alga', 0.3); drop('gaviota', 'hierba_sal', 0.3); drop('cangrejo', 'alga', 0.35); drop('larva_musgo', 'seta_luna', 0.35); drop('cangrejo_raiz', 'seta_luna', 0.25);
  drop('centinela', 'arena_dorada', 0.2); drop('engranaje', 'engranaje_suelto', 0.2); drop('polilla', 'tinta_viva', 0.15); drop('medusa', 'alga', 0.4); drop('guardian_marea', 'perla_marea', 0.15);

  // ================= COLOCACIÓN EN LOS MAPAS =================
  const where = (map, ep) => { const d = M[map]; return ep && d.epochs && d.epochs[ep] ? d.epochs[ep] : d; };
  const npc = (map, o, ep) => { const w = where(map, ep); w.npcs = (w.npcs || []).concat([o]); };
  const sign = (map, o, ep) => { const w = where(map, ep); w.signs = (w.signs || []).concat([o]); };
  const pick = (map, o, ep) => { const w = where(map, ep); w.pickups = (w.pickups || []).concat([o]); };

  // ---------- pesca ----------
  const POOLS = {
    bruma: [['pez_plata', 6], ['alga', 3], ['pez_lumbre', 1]],
    bosque: [['trucha_raiz', 6], ['pez_plata', 2], ['alga', 2]],
    sur: [['sardina_dorada', 6], ['pez_plata', 2], ['alga', 2]],
    forja: [['pez_ceniza', 6], ['alga', 2], ['pez_plata', 1]],
    farol: [['pez_farol', 6], ['pez_plata', 2], ['alga', 1], ['pez_alba', 0.5]],
    abismo: [['pez_abisal', 6], ['pez_alba', 1], ['alga', 1]],
  };
  const FISH = [
    ['acantilados', 5, 18, 'bruma'], ['arrecife', 1, 13, 'bruma'], ['brumaInundada', 20, 16, 'bruma'], ['hoguera', 14, 11, 'bruma'],
    ['bosque', 13, 22, 'bosque'], ['ruinas', 14, 25, 'sur'], ['ciudad', 15, 13, 'sur', 'past'], ['hondaroca', 22, 19, 'forja'],
    ['faroleros', 13, 20, 'farol'], ['torre', 14, 21, 'farol'], ['abismo', 13, 25, 'abismo'],
  ];
  for (const [map, c, r, pool, ep] of FISH) {
    if (!M[map]) continue;
    const key = 'pesca.' + map;
    S[key] = [{ scene: 'pesca', data: { pool: POOLS[pool], name: M[map].name } }];
    sign(map, { c, r: r + 0.4, prop: 'netrack', name: 'Punto de pesca', script: key }, ep);
  }
  // ---------- hogueras para cocinar ----------
  S.cocina = [{ say: 'none', name: 'Hoguera', t: 'El fuego crepita. {p:0.3}Buen sitio para cocinar algo con lo que llevéis encima.' }, { scene: 'cocina' }];
  const FIRE = [['brumaSalada', 18, 4.4], ['bosque', 24, 21.4], ['ruinas', 21, 20.4], ['ciudad', 22, 24.4, 'past'], ['biblioteca', 28, 20.4, 'present'], ['hondaroca', 17, 12.4],
    ['faroleros', 26, 14.6, null, false], ['torre', 24, 19.4], ['abismo', 24, 22.4], ['hoguera', 10, 7, null, false]];
  for (const [map, c, r, ep, prop] of FIRE) if (M[map]) sign(map, { c, r, prop: prop === false ? false : 'campfire', name: 'Hoguera', script: 'cocina' }, ep);
  // ---------- ingredientes por el mundo ----------
  const PK = [['acantilados', 8, 13, 'hierba_sal', 2], ['bosque', 14, 17, 'seta_luna', 2], ['bosque', 13, 21, 'seta_luna', 1], ['ruinas', 23, 24, 'hierba_sal', 2],
    ['biblioteca', 10, 20, 'hierba_sal', 2, 'present'], ['arrecife', 6, 10, 'alga', 3], ['brumaSalada', 27, 5, 'receta_estofado', 1], ['ciudad', 16, 24, 'receta_tarta', 1, 'past']];
  PK.forEach(([map, c, r, give, n, ep], i) => { if (M[map]) pick(map, { id: 'fe' + i, c, r: r + 0.4, give, n }, ep); });

  // ================= ENCARGOS =================
  // need: { item, n } o { kill, n } · avail: cuándo se puede aceptar · lines: lo que dice en cada capítulo
  const Q = [
    { id: 'red', map: 'brumaSalada', c: 26, r: 9, sprite: 'fisher', variant: 41, name: 'Nilo', title: 'La red de Nilo', avail: 'jefe.matriarca',
      need: { item: 'pez_plata', n: 3 }, reward: 'anzuelo_dorado', recipe: null,
      offer: 'Desde que el mar escupió esas larvas, los peces no se acercan al puerto. {p:0.4}¿Me traéis tres peces plateados? {p:0.3}Se pescan en los Acantilados y en el Arrecife.',
      wait: 'Tres peces plateados. {p:0.3}Busca las redes de pesca junto al agua.', thanks: 'Tres, y bien gordos. {p:0.4}Toma mi anzuelo dorado: con él, los peces se sueltan menos.',
      lines: [[true, 'La red está vacía otra vez. {p:0.3}El mar está raro desde hace días.'], ['cap2.fin', 'He oído que en el Bosque hay truchas que viven entre raíces. {p:0.3}¡Truchas! {p:0.3}¡En el mar!'], ['cap6.fin', 'El agua subió y se llevó mi caseta. {p:0.4}Pero la caña la salvé. {p:0.3}Prioridades.'], ['juego.fin', 'Dicen que en el Abismo nada el pez del alba. {p:0.4}Yo ya soy viejo para ir. {p:0.3}Tú no.']] },
    { id: 'conchas', map: 'brumaSalada', c: 33, r: 5, sprite: 'kid', variant: 42, name: 'Pía', title: 'Conchas para Pía', avail: 'prologo.fin',
      need: { item: 'concha', n: 4 }, reward: 'collar_conchas',
      offer: '¡Kaelen! {p:0.3}Estoy haciendo un collar para mi madre, pero me faltan cuatro conchas nacaradas. {p:0.4}Las brillantes de verdad, ¿eh?',
      wait: 'Cuatro conchas nacaradas. {p:0.3}Salen en cofres y a veces las llevan los cangrejos.', thanks: '¡Son preciosas! {p:0.4}Me sobra una ristra… {p:0.3}hice dos collares. {p:0.4}Este es para ti.',
      lines: [[true, 'Mi madre dice que no me acerque al faro. {p:0.3}Así que me acerco solo un poco.'], ['cap3.fin', '¿Es verdad que has ido al pasado? {p:0.4}¿Había niños? {p:0.3}¿Jugaban a Mareas?'], ['cap6.fin', 'Mi casa está debajo del agua. {p:0.4}Por las noches me imagino que los peces juegan en mi cuarto.'], ['juego.fin', 'El sol se mueve otra vez. {p:0.4}¡Mi sombra ya no está quieta!']] },
    { id: 'gaviotas', map: 'brumaSalada', c: 22, r: 9, sprite: 'sailor', variant: 43, name: 'Bastián', title: 'Gaviotones en los Acantilados', avail: 'jefe.matriarca',
      need: { kill: 'gaviota', n: 5 }, reward: 'pluma_tormenta',
      offer: 'Los gaviotones tormenta de los Acantilados están atacando a los barcos. {p:0.4}Espantad a cinco y os doy algo que os hará volar.',
      wait: 'Cinco gaviotones. {p:0.3}Van en bandada por la Ruta de los Acantilados.', thanks: '¡Ya se oye otra vez el mar en vez de graznidos! {p:0.4}Tomad: una pluma de tormenta. {p:0.3}Da ganas de correr.',
      lines: [[true, 'Un marinero sin barco es un señor mojado. {p:0.4}Ese soy yo.'], ['cap2.fin', 'Se llevaron a vuestra amiga, ¿eh? {p:0.4}El mar devuelve lo que no es suyo. {p:0.3}A veces hay que ayudarle.'], ['cap6.fin', 'Ahora todo es puerto. {p:0.4}Hasta la plaza. {p:0.3}Por fin tengo trabajo.'], ['juego.fin', '¿Un viaje? {p:0.3}Cuando queráis. {p:0.4}El mar está de buenas.']] },
    { id: 'faro', map: 'acantilados', c: 4, r: 13, sprite: 'oldman', variant: 44, name: 'Bartolo', title: 'La lente del farero', avail: 'cap3.fin',
      need: { item: 'arena_dorada', n: 2 }, reward: 'lente_faro',
      offer: 'Mi faro pequeño tiene la lente rajada. {p:0.4}Para pulir una nueva necesito arena dorada, de la que hay bajo las Ruinas de Thalyria. {p:0.3}Dos puñados.',
      wait: 'Arena dorada: la sueltan las gárgolas de la Cisterna de los Ecos.', thanks: 'Ya brilla. {p:0.4}Y con lo que me sobró os he pulido esto: una lente que encuentra el punto débil de cualquiera.',
      lines: [[true, 'Llevo cuarenta años encendiendo este farolillo. {p:0.3}No es el gran faro, pero los barcos pequeños también se pierden.'], ['cap1.fin', '¡Habéis encendido el Ojo del Vigía! {p:0.4}Desde aquí se veía como un amanecer.'], ['cap6.fin', 'El agua llega a mis pies. {p:0.4}Pero el farolillo sigue arriba. {p:0.3}Como yo.'], ['juego.fin', 'Ahora que el día vuelve a moverse, me paso las tardes mirando ponerse el sol. {p:0.3}Se me había olvidado.']] },
    { id: 'lobos', map: 'bosque', c: 19, r: 16, sprite: 'woman', variant: 45, name: 'Yara', title: 'La manada de Yara', avail: 'cap2.fin',
      need: { kill: 'cangrejo_raiz', n: 5 }, reward: 'hoja_cortante', recipe: 'estofado',
      offer: 'Soy herbolaria. {p:0.3}Los lobos de corteza no me dejan recoger nada. {p:0.4}Si espantáis a cinco, os enseño mi estofado.',
      wait: 'Cinco lobos de corteza. {p:0.3}Rondan por el Bosque y la Hondonada.', thanks: 'El bosque respira. {p:0.4}Tomad esta hoja: corta a quien la toca. {p:0.3}Y apuntad la receta del estofado.',
      lines: [[true, 'Las raíces hablan, si sabes escuchar. {p:0.4}Ahora mismo dicen «socorro».'], ['cap3.fin', 'Desde que cayó la Madre, las setas de luna salen solas. {p:0.4}Coged las que queráis.'], ['cap6.fin', 'El mar subió hasta el linde. {p:0.3}Los árboles beben sal. {p:0.4}Aguantarán.'], ['juego.fin', 'Ha vuelto la primavera. {p:0.4}La de verdad.']] },
    { id: 'reloj', map: 'ciudad', ep: 'past', c: 20, r: 18, sprite: 'oldman', variant: 46, name: 'Ambrosio', title: 'El reloj de Ambrosio', avail: 'cap3.fin',
      need: { item: 'engranaje_suelto', n: 3 }, reward: 'reloj_bolsillo', recipe: 'tarta',
      offer: 'Relojero de la reina, para serviros. {p:0.4}Mi mejor reloj ha perdido tres engranajes. {p:0.3}Los autómatas del jardín los sueltan cuando se rompen.',
      wait: 'Tres engranajes sueltos. {p:0.3}Los Jardines Colgantes están al oeste de la plaza.', thanks: '¡Tic, tac! {p:0.4}Os regalo uno de bolsillo, que va un segundo por delante. {p:0.3}Y la receta de la tarta que hace mi mujer.',
      lines: [[true, 'En esta ciudad nadie llega tarde. {p:0.3}Los relojes no lo permiten.'], ['cap4.fin', 'Me dicen que venís de lejos. {p:0.4}De muy lejos. {p:0.3}Lo noto: miráis los relojes como si fueran a pararse.'], ['cap6.fin', 'Qué sueño tan raro tuve: {p:0.4}el sol se quedaba quieto, y yo seguía dando cuerda.'], ['juego.fin', 'Pase lo que pase dentro de mil años, {p:0.3}hoy los relojes van bien.']] },
    { id: 'libros', map: 'biblioteca', ep: 'present', c: 24, r: 16, sprite: 'woman', variant: 47, name: 'Selma', title: 'Palabras robadas', avail: 'cap4.fin',
      need: { item: 'tinta_viva', n: 2 }, reward: 'gafas_lector', recipe: 'te',
      offer: 'Soy la última archivera. {p:0.4}Algo se come las palabras de los libros. {p:0.3}Si me traéis dos frascos de tinta viva, puedo reescribir lo perdido.',
      wait: 'Tinta viva: la sueltan las polillas de tinta del Archivo Anegado, al este.', thanks: 'Ya se lee otra vez. {p:0.4}Tomad mis gafas de lector. {p:0.3}Y el té que me mantiene despierta.',
      lines: [[true, 'Shhh. {p:0.4}Aunque el agua lo haya inundado todo, esto sigue siendo una biblioteca.'], ['cap5.fin', 'La reina escribía de noche. {p:0.4}Ahora entiendo por qué: tenía miedo de olvidar.'], ['cap6.fin', 'El mar se ha llevado tres estanterías. {p:0.3}Las he vuelto a escribir de memoria.'], ['juego.fin', 'Estoy escribiendo vuestra historia. {p:0.4}Sin adornos. {p:0.3}Bueno, con alguno.']] },
    { id: 'horno', map: 'hondaroca', c: 22, r: 16, sprite: 'woman', variant: 48, name: 'Greta', title: 'El horno de Greta', avail: 'cap6.profecia',
      need: { item: 'escama_magma', n: 3 }, reward: 'delantal_forja', recipe: 'guiso',
      offer: 'Soy la panadera. {p:0.4}Sin fuego de la Fragua Profunda mi horno no calienta. {p:0.3}Tres escamas de magma bastarían para meses.',
      wait: 'Escamas de magma: las salamandras de la Fragua Profunda, al este del pueblo.', thanks: '¡El horno ruge! {p:0.4}Mi delantal, que ya no me cabe. {p:0.3}Y la receta del guiso de ceniza.',
      lines: [[true, 'Pan caliente para quien quiera. {p:0.4}Aunque el pueblo esté medio hundido, se desayuna.'], ['cap6.fin', 'Flint siempre me robaba los bollos. {p:0.4}Dile que la deuda sigue en pie.'], ['juego.fin', 'Hondaroca se está secando. {p:0.4}Las casas de abajo vuelven a ver el sol.']] },
    { id: 'faroles', map: 'faroleros', c: 19, r: 15, sprite: 'kid', variant: 49, name: 'Bram', title: 'Faroles apagados', avail: 'cap6.fin',
      need: { kill: 'farol_corrupto', n: 4 }, reward: 'farol_guia', recipe: 'caldereta',
      offer: 'Mi abuelo era farolero. {p:0.4}Los faroles corruptos de la Torre eran faroles de la aldea… {p:0.3}¿Podéis apagar cuatro? {p:0.4}Para que descansen.',
      wait: 'Cuatro faroles corruptos. {p:0.3}Rondan la Torre del Motor y su Escalera.', thanks: 'Gracias. {p:0.4}Este farol lo encendí yo. {p:0.3}Y mi madre dice que os enseñe la caldereta.',
      lines: [[true, 'Aquí cada casa tiene su farol. {p:0.4}El mío es el más pequeño, pero es el que más aguanta.'], ['cap7.fin', 'Elara ha vuelto. {p:0.4}Su madre ha llorado tres días. {p:0.3}De los buenos.'], ['juego.fin', 'Cuando sea mayor quiero ser farolero. {p:0.4}O lo que seáis vosotros.']] },
    { id: 'alba', map: 'brumaInundada', c: 23, r: 9, sprite: 'fisher', variant: 50, name: 'Abuelo Cormac', title: 'El pez del alba', avail: 'cap6.fin',
      need: { item: 'pez_alba', n: 1 }, reward: 'cana_alba', recipe: 'banquete',
      offer: 'Sesenta años buscando el pez del alba. {p:0.4}Dicen que nada donde el mar es más hondo, o entre los faroles. {p:0.3}Si lo pescáis, os doy mi caña.',
      wait: 'El pez del alba. {p:0.3}Muy raro: en los puntos de pesca de la Aldea, la Torre y, sobre todo, el Abismo.', thanks: '…Es verdad. {p:0.4}Existe. {p:0.5}Tomad mi caña, y la receta del banquete que juré cocinar si lo veía.',
      lines: [[true, 'El mar sube. {p:0.4}Mejor: los peces se acercan.'], ['cap7.fin', 'He soñado con un pez de luz. {p:0.4}A mi edad, eso es una señal.'], ['juego.fin', 'El alba ha vuelto. {p:0.4}A lo mejor el pez también.']] },
  ];
  const chatter = (q) => { let t = q.lines[0][1]; for (const [c, x] of q.lines) if (F.test(c)) t = x; return t; };
  const progress = (q) => q.need.item ? Math.min(q.need.n, TH.party.count(q.need.item)) : Math.min(q.need.n, ((TH.bestiary && TH.bestiary.rec(q.need.kill).k) || 0) - (F.get('mq.' + q.id + '.base') || 0));
  D.quests = Q;
  TH.quests = { list: Q, progress, done: (q) => F.get('mq.' + q.id) === 'fin', active: (q) => F.get('mq.' + q.id) === 1 };
  // Bruma Salada se inunda en el capítulo 6: sus vecinos se mudan a la parte alta
  const ALT = { red: [17, 9], conchas: [19, 7], gaviotas: [20, 10] };
  for (const q of Q) {
    const key = 'mq_' + q.id;
    npc(q.map, { id: q.sprite, variant: q.variant, talk: key, c: q.c, r: q.r + 0.4, ai: 'idle', dir: 'down' }, q.ep);
    if (ALT[q.id] && M.brumaInundada) npc('brumaInundada', { id: q.sprite, variant: q.variant, talk: key, c: ALT[q.id][0], r: ALT[q.id][1] + 0.4, ai: 'idle', dir: 'down' });
    live(T, key, () => {
      const st = F.get('mq.' + q.id), say = (t, e) => ({ say: '@npc', e: e || 'neutral', name: q.name, t });
      if (st === 'fin' || !F.test(q.avail)) return [say(chatter(q))];
      if (st === 1) {
        const p = progress(q), n = q.need.n;
        if (p < n) return [say(q.wait + ' {p:0.3}(' + p + '/' + n + ')')];
        const ops = [say(q.thanks, 'happy')];
        if (q.need.item) ops.push({ give: q.need.item, n: -n, quiet: true });
        ops.push({ set: { ['mq.' + q.id]: 'fin' } }, { give: q.reward });
        if (q.recipe) ops.push({ set: { ['receta.' + q.recipe]: true } }, { toast: 'Nueva receta: ' + D.recipes[q.recipe].name });
        ops.push({ toast: 'Encargo completado: ' + q.title });
        return ops;
      }
      return [{ choice: [
        { t: 'Aceptar el encargo', then: [{ set: { ['mq.' + q.id]: 1, ['mq.' + q.id + '.base']: q.need.kill ? ((TH.bestiary && TH.bestiary.rec(q.need.kill).k) || 0) : 0 } }, say('¡Gracias! {p:0.3}' + q.wait, 'happy'), { toast: 'Nuevo encargo: ' + q.title }] },
        { t: 'Ahora no', then: [say('Si cambiáis de idea, aquí estaré.')] },
      ], t: q.offer, who: '@npc', name: q.name }];
    });
  }

  // ================= MAREAS: rivales =================
  D.rivals = {
    teo: { name: 'Teo', title: 'El terror del muelle (tiene nueve años)', level: 1, map: 'brumaSalada', c: 14, r: 9, sprite: 'kid', variant: 51, avail: true, prize: 'ficha_sol', gold: 200,
      hi: '¿Juegas a Mareas? {p:0.4}Yo soy el mejor de Bruma. {p:0.3}Bueno, de la calle. {p:0.3}Bueno, de mi casa.', win: '¡Revancha! {p:0.3}…Mañana. {p:0.4}Toma, mi ficha de la suerte. {p:0.3}Ya no me da suerte.', lose: '¡Ja! {p:0.4}¡Las esquinas, Kaelen! {p:0.3}Siempre las esquinas.',
      lines: [[true, ''], ['cap6.fin', 'Con el agua por las rodillas también se juega. {p:0.3}Se juega mejor, incluso.']] },
    casandra: { name: 'Casandra', title: 'Campeona de la Ciudad Dorada', level: 2, map: 'ciudad', ep: 'past', c: 14, r: 22, sprite: 'woman', variant: 52, avail: true, prize: null, recipe: 'brocheta', gold: 800,
      hi: 'Mareas se inventó aquí, forastero. {p:0.4}Las fichas son de oro y la paciencia, de bronce. {p:0.3}¿Una partida?', win: 'Vaya. {p:0.4}Los forasteros traéis otras costumbres. {p:0.3}Os regalo mi receta de brochetas, para que volváis.', lose: 'Una ficha mal puesta es una marea que se te lleva. {p:0.3}Vuelve cuando quieras.',
      lines: [[true, ''], ['cap4.fin', 'Dicen que el Cronoguardia ha caído. {p:0.4}Mejor: me hacía trampas.']] },
    dora: { name: 'Dora', title: 'La fundidora que nunca pierde', level: 3, map: 'hondaroca', c: 15, r: 14, sprite: 'woman', variant: 53, avail: 'cap6.profecia', prize: 'dado_forja', gold: 1200,
      hi: 'En Hondaroca jugamos a Mareas sobre un yunque. {p:0.4}Si pierdes, friegas la fragua. {p:0.3}¿Te atreves?', win: 'Hum. {p:0.4}Nadie me ganaba desde que se fue el abuelo de Flint. {p:0.3}Toma, mi dado: te lo has ganado.', lose: 'A fregar no te mando. {p:0.3}Pero aprende a mirar los bordes.',
      lines: [[true, ''], ['cap6.fin', 'El Coloso cayó y el pueblo respira. {p:0.4}Ahora tengo tiempo para machacar forasteros al Mareas.']] },
    nerea: { name: 'Abuela Dalia', title: 'Cincuenta años sin perder en la Aldea', level: 3, map: 'faroleros', c: 23, r: 19, sprite: 'oldman', variant: 54, avail: true, prize: 'farolillo_nerea', gold: 1500,
      hi: 'Siéntate, criatura. {p:0.4}Una partidita antes de cenar. {p:0.3}Te aviso: juego con las luces apagadas.', win: 'Cincuenta años… {p:0.5}y me gana un chico del mar. {p:0.3}Llévate mi farolillo. {p:0.4}Ilumina mejor que yo.', lose: 'No pasa nada. {p:0.4}A mí me costó veinte años ganar a mi madre.',
      lines: [[true, ''], ['cap7.fin', 'Elara jugaba conmigo de pequeña. {p:0.4}Me ganaba haciendo trampas. {p:0.3}Igual que ahora.']] },
    orion: { name: 'Orión', title: 'Campeón de las Mareas', level: 4, map: 'abismo', c: 18, r: 20, sprite: 'sailor', variant: 55, avail: 'juego.fin', prize: 'tablero_campeon', recipe: 'banquete', gold: 5000, champion: true,
      hi: 'Soy Orión. {p:0.4}He jugado contra la marea, contra el tiempo y contra el propio Abismo. {p:0.3}Nunca he perdido.', win: '…Así que era esto. {p:0.5}Perder. {p:0.4}No está tan mal. {p:0.3}Toma mi tablero, campeón.', lose: 'Vuelve cuando la marea te obedezca.',
      lines: [[true, '']] },
  };
  const RIV = D.rivals, mainR = ['teo', 'casandra', 'dora', 'nerea'];
  TH.rivalsBeaten = () => mainR.filter((k) => F.get('mareas.' + k)).length;
  for (const [rid, R] of Object.entries(RIV)) {
    const key = 'mareas_' + rid;
    npc(R.map, { id: R.sprite, variant: R.variant, talk: key, c: R.c, r: R.r + 0.4, ai: 'idle', dir: 'down', if: R.avail === true ? undefined : R.avail }, R.ep);
    if (rid === 'teo' && M.brumaInundada) npc('brumaInundada', { id: R.sprite, variant: R.variant, talk: key, c: 27, r: 14.4, ai: 'idle', dir: 'down' });
    live(T, key, () => {
      const say = (t, e) => ({ say: '@npc', e: e || 'neutral', name: R.name, t });
      if (R.champion && TH.rivalsBeaten() < 4) return [say(R.hi), say('Pero antes, gánale a los cuatro maestros: Teo en Bruma, Casandra en la Ciudad Dorada, Dora en Hondaroca y la abuela Dalia en la Aldea. {p:0.3}(' + TH.rivalsBeaten() + '/4)')];
      let extra = ''; for (const [c, x] of R.lines) if (F.test(c) && x) extra = x;
      const pre = extra ? [say(extra)] : [];
      return pre.concat([{ choice: [
        { t: 'Jugar a Mareas', then: [{ scene: 'mareas', data: { rival: rid } }, { call: 'mareas.tras.' + rid }] },
        { t: 'Cómo se juega', then: [say('Tú pones fichas de Sol, yo de Luna. {p:0.4}Si al poner una ficha encierras en línea (también en diagonal) fichas mías, se voltean y pasan a ser tuyas. {p:0.4}Si no puedes encerrar nada, pasas. {p:0.3}Al llenarse el tablero, gana quien tenga más.')] },
        { t: 'En otro momento', then: [say('Aquí estaré.')] },
      ], t: R.hi, who: '@npc', name: R.name }]);
    });
    live(S, 'mareas.tras.' + rid, () => {
      const say = (t, e) => ({ say: '@npc', e: e || 'neutral', name: R.name, t });
      const res = F.get('mareas.res');
      if (res === 'win') {
        if (!F.get('mareas.' + rid)) {
          const ops = [say(R.win, 'happy'), { set: { ['mareas.' + rid]: true } }, { give: 'gold', n: R.gold }];
          if (R.prize) ops.push({ give: R.prize });
          if (R.recipe) ops.push({ set: { ['receta.' + R.recipe]: true } }, { toast: 'Nueva receta: ' + D.recipes[R.recipe].name });
          if (R.champion) ops.push({ toast: '¡Eres el Campeón de las Mareas!' });
          return ops;
        }
        return [say('Otra vez… {p:0.3}Toma, por la partida.'), { give: 'gold', n: Math.round(R.gold / 5) }];
      }
      if (res === 'draw') return [say('Empate. {p:0.4}La marea no se decide.')];
      return [say(R.lose)];
    });
  }

  // ================= DIARIO =================
  const FA = TH.fasea;
  if (FA) {
    for (const q of Q) FA.J.push({ t: 'Encargo · ' + q.title, if: 'mq.' + q.id, done: 'mq.' + q.id + '=fin', get intro() { const p = progress(q); return q.name + ': «' + q.offer.replace(/\{[^}]*\}/g, '') + '» Progreso: ' + p + '/' + q.need.n + '.'; },
      text: 'Encargo de ' + q.name + ' completado. Recompensa: ' + I[q.reward].name + (q.recipe ? ' y la receta «' + D.recipes[q.recipe].name + '»' : '') + '.' });
    FA.J.push({ t: 'Mareas · el juego de mesa de Thalyria', if: 'mareas.partidas', done: 'mareas.orion', get intro() { return 'Maestros vencidos: ' + TH.rivalsBeaten() + '/4 (Teo en Bruma, Casandra en la Ciudad Dorada, Dora en Hondaroca, la abuela Dalia en la Aldea). Cuando acabe la historia, el campeón Orión espera en el Abismo. Partidas jugadas: ' + (F.get('mareas.partidas') || 0) + ', ganadas: ' + (F.get('mareas.victorias') || 0) + '.'; },
      text: 'Venciste a los cuatro maestros y al campeón Orión. Eres el Campeón de las Mareas.' });
    FA.J.push({ t: 'Cocina y pesca', if: { any: ['pesca.total', 'cocina.platos'] }, done: 'receta.banquete', get intro() { return 'Recetas aprendidas: ' + TH.cook.known().length + '/' + Object.keys(D.recipes).length + '. Peces pescados: ' + (F.get('pesca.total') || 0) + '. Platos cocinados: ' + (F.get('cocina.platos') || 0) + '. Pesca en las redes junto al agua y cocina en cualquier hoguera.'; },
      get text() { return 'Aprendiste el Banquete del alba, la mejor receta de Thalyria. Recetas: ' + TH.cook.known().length + '/' + Object.keys(D.recipes).length + '.'; } });
  }
})();
