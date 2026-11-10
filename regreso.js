// Volver atrás y consejos de Halvard.
// · Barcas en los muelles del Bosque y de las Ruinas (al mapa del archipiélago) y Piedra de viaje en la Ciudad Dorada:
//   desde cualquier zona se puede regresar a las anteriores.
// · Halvard, el viejo farero de Bruma Salada, aconseja cómo seguir según el punto de la historia.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, M = D.maps, F = TH.flags, T = D.talk;

  // ---------- caminos de vuelta ----------
  if (M.bosque) M.bosque.boats = (M.bosque.boats || []).concat([{ c: 19.4, r: 23.6, port: 'raices', reach: 26, if: 'cap2.fin' }]);
  if (M.ruinas) M.ruinas.boats = (M.ruinas.boats || []).concat([{ c: 20.4, r: 26.4, port: 'ruinas', reach: 26, if: 'cap3.fin' }]);
  // las zonas sin mar se recorren a pie: altar del tiempo (Ruinas ↔ Ciudad Dorada) y sendero (Ruinas ↔ Biblioteca)
  const S = D.scripts, go = (map, entry) => [{ fade: 1, time: 0.6 }, { warp: map, entry }, { fade: 0, time: 0.8 }];
  S['paso.ciudad'] = [{ if: 'cap3.fin', then: [{ say: 'none', t: 'El altar zumba como un reloj enorme. {p:0.3}Al tocarlo, el aire huele a oro.' }, { flash: 0.6, color: '#fff6dc' }, { set: { 'epoca.ciudad': 'past' } }].concat(go('ciudad', 'sur')), else: [{ say: 'none', t: 'Un altar antiguo a los pies del faro. {p:0.3}Está dormido.' }] }];
  S['paso.biblioteca'] = [{ if: 'cap4.fin', then: go('biblioteca', 'sur'), else: [{ say: 'none', t: 'Un sendero cubierto de zarzas sube hacia el interior de la isla. {p:0.3}Todavía no hay motivo para subir.' }] }];
  S['paso.ruinas'] = go('ruinas', 'muelle');
  // desde la Ciudad Dorada, el altar devuelve a la explanada del faro, junto al altar
  S['paso.ruinas.altar'] = [{ flash: 0.6, color: '#fff6dc' }, { fade: 1, time: 0.6 }, { warp: 'ruinas', at: [19, 3.4], dir: 'down' }, { fade: 0, time: 0.8 }];
  const sign = (map, o) => { if (M[map]) M[map].signs = (M[map].signs || []).concat([o]); };
  // Altar del tiempo: punto de viaje entre las Ruinas, la Ciudad Dorada y la Biblioteca (eliges destino)
  const DEST = {
    ciudad: { t: 'Viajar a la Ciudad Dorada (hace mil años)', if: 'cap3.fin', ops: [{ set: { 'epoca.ciudad': 'past' } }, { fade: 1, time: 0.6 }, { warp: 'ciudad', at: [17.6, 4.2], dir: 'down' }, { fade: 0, time: 0.8 }] },
    biblioteca: { t: 'Ir a la Biblioteca de las Dos Épocas', if: 'cap4.fin', ops: [{ fade: 1, time: 0.6 }, { warp: 'biblioteca', entry: 'sur' }, { fade: 0, time: 0.8 }] },
    ruinas: { t: 'Volver a las Ruinas de Thalyria (hoy)', if: 'cap3.fin', ops: [{ fade: 1, time: 0.6 }, { warp: 'ruinas', at: [19, 3.4], dir: 'down' }, { fade: 0, time: 0.8 }] },
  };
  const altar = (here) => [{ if: 'cap3.fin', then: [
    { choice: Object.keys(DEST).filter((k) => k !== here).map((k) => ({ t: DEST[k].t, if: DEST[k].if, then: [{ flash: 0.5, color: '#fff6dc' }].concat(DEST[k].ops) })).concat([{ t: 'Quedarse aquí' }]),
      who: 'none', name: 'Altar del tiempo', t: 'El altar zumba como un reloj enorme. {p:0.3}¿Adónde quieres ir?' },
  ], else: [{ say: 'none', name: 'Altar del tiempo', t: 'Un altar antiguo. {p:0.3}Está dormido.' }] }];
  S['altar.ruinas'] = altar('ruinas'); S['altar.ciudad'] = altar('ciudad'); S['altar.biblioteca'] = altar('biblioteca');
  // el altar de la historia, a los pies del faro (explanada alta): ahora se puede tocar
  sign('ruinas', { c: 19, r: 1.6, prop: false, script: 'altar.ruinas', name: 'Altar del tiempo', reach: 30 });
  sign('ruinas', { c: 20, r: 24.4, script: 'paso.biblioteca', name: 'Sendero a la Biblioteca' });
  // el monolito que aparece tras vencer a la Cronoguardia (altar del norte de la Ciudad, en el pasado)
  if (M.ciudad && M.ciudad.epochs && M.ciudad.epochs.past) M.ciudad.epochs.past.signs = (M.ciudad.epochs.past.signs || []).concat([{ c: 17.6, r: 2.4, prop: false, script: 'altar.ciudad', name: 'Altar del tiempo', reach: 30 }]);
  sign('ciudad', { c: 19, r: 22.4, prop: 'altar', script: 'altar.ciudad', name: 'Altar del tiempo' });
  sign('biblioteca', { c: 15, r: 19.4, prop: 'altar', script: 'altar.biblioteca', name: 'Altar del tiempo' });
  // el último muelle desde el que zarpaste o al que llegaste es el punto seguro si caes en combate
  const WS = TH.WorldScene && TH.WorldScene.prototype, _leave = WS && WS.leave;
  if (_leave) WS.leave = function (port) {
    try { const zone = port && port.zone; if (zone) F.set('safe', { map: zone, entry: port.entry, name: port.name }); } catch (e) { /* nada */ }
    return _leave.apply(this, arguments);
  };

  // las barcas con condición solo zarpan cuando la historia lo permite
  const MS = TH.MapScene.prototype, _int = MS.interact;
  MS.interact = function (t) {
    if (t && t.kind === 'boat' && t.e && t.e.if && !F.test(t.e.if)) { TH.ui.toast('La corriente todavía no deja zarpar desde aquí'); return true; }
    return _int.apply(this, arguments);
  };
  // ---------- consejos de Halvard ----------
  const tip = [{ say: '@npc', e: 'neutral', t: 'Y recuerda, muchacho: {p:0.3}las barcas de los muelles cruzan de isla en isla, {p:0.3}y todo lo demás se recorre a pie. {p:0.4}Volver atrás nunca es perder el tiempo.' }];
  const H = (lines) => lines.map((t) => ({ say: '@npc', e: 'neutral', t }));
  function consejo() {
    const o = F.get('objetivo');
    let L;
    if (F.get('post.llegada') || F.get('juego.fin')) L = H(['El mar está en calma, por fin. {p:0.4}Dicen que al sur ha emergido un islote, el Abismo de la Crecida.', 'Elara dejó cartas escondidas en el pasado: en la Ciudad Dorada, en la Biblioteca… {p:0.3}y la última la guarda algo muy grande bajo el agua.', 'En el Abismo hay un espejo que refleja a los enemigos que venciste. {p:0.3}Dicen que da buenos premios a quien los vence otra vez.']);
    else if (F.get('cap7.fin')) L = H(['Estás dentro del instante, muchacho. {p:0.4}Ahí no te puedo guiar: solo hacia delante, hasta el Motor.']);
    else if (F.get('cap6.fin')) L = H(['La Torre del Motor ha salido del mar. {p:0.4}Oslo, el barquero, os llevará a la Aldea de los Faroleros, el hogar de Elara.', 'La Torre está al norte de la aldea. {p:0.3}Arriba hay un faro para cada uno de vosotros: {p:0.3}cada cual lo enciende con su propia Resonancia.']);
    else if (F.get('cap5.fin')) L = H(['El mar ha subido y Bruma se ha quedado a medias bajo el agua. {p:0.4}En el muelle flotante, al sur, hay un cristal apagado: enciéndelo y las plataformas subirán.', 'Desde allí, zarpa hacia Hondaroca, al norte. {p:0.3}En la Gran Fragua, el pilar va a la placa y el cristal de la mina abre la escalera.']);
    else if (F.get('cap4.fin')) L = H(['La Biblioteca existe en dos épocas a la vez. {p:0.4}Lo que siembras ayer florece mañana: pulsa V para cambiar de época.', 'El libro de la reina está en la cámara sellada. {p:0.3}Vuelve al presente para cruzar la compuerta de arena.']);
    else if (F.get('cap3.fin')) L = H(['El altar del faro de Thalyria os lleva al pasado. {p:0.4}En la Ciudad Dorada, buscad al Cronista en la plaza del pozo.', 'V cambia de época. {p:0.3}Lo que en el presente es ruina, en el pasado puede ser un camino.']);
    else if (F.get('cap2.fin')) L = H(['Las Ruinas de Thalyria están al sur. {p:0.4}La placa se mueve con la Resonancia de tierra, y el molino con la Ráfaga de Firion.', 'El Vigía de Bronce guarda el último faro. {p:0.3}Rompedle los brazos primero, o no le llegará ni un golpe.']);
    else if (F.get('cap1.fin')) L = H(['La marea os llevó al Bosque de las Raíces Hundidas, al oeste. {p:0.4}Seguid el rastro de luz hasta la Hondonada de las Espinas.', 'Cuando rompáis el Corazón de espinas, volved al claro del norte. {p:0.3}Enciende el cristal con la Lanzada y apaga los fuegos de la escalera con la Ráfaga.']);
    else if (F.get('cap1.faro')) L = H(['El faro del Vigía vuelve a arder. {p:0.4}Bajad a la cala de los Acantilados: el camino al Arrecife de Coral ya está abierto.', 'Al fondo os espera el Guardián del Arrecife. {p:0.3}Sus pinzas le protegen: ocupaos de ellas primero.']);
    else if (o === 'ojo') L = H(['Sube a la terraza de la lente del Cabo. {p:0.4}Elige la Lanzada lunar con R y lánzasela al Ojo del Vigía.']);
    else if (o === 'reja' || o === 'cabo' || F.get('cap1.inicio')) L = H(['Sal del pueblo por el este, por la Ruta de los Acantilados, y sigue hasta el Cabo del Vigía. {p:0.4}Allí está Firion.', 'En el Cabo: abre la reja con el cristal y la piedra, luego gira el molino de la terraza, {p:0.3}y por último despierta el Ojo del Vigía con la Lanzada lunar.']);
    else if (o === 'gruta') L = H(['La Matriarca huyó a la Gruta de la Marea, por la playa del oeste del pueblo.', 'Dentro, los cristales se encienden con la Lanzada lunar. {p:0.3}Ilumínalos y el agua te abrirá paso.']);
    else if (o === 'faro') L = H(['Sube al faro al caer la tarde, por el camino del noreste. {p:0.4}Si no quieres esperar, en el menú puedes adelantar las horas.']);
    else if (o === 'claro') L = H(['Ilun te espera en su claro, al noroeste del pueblo. {p:0.3}No le hagas esperar: dice que el sol llega pronto.']);
    else L = H(['Ahora mismo: ' + ((TH.objTexts && TH.objTexts[o]) || 'sigue la flecha guía, muchacho') + '.']);
    return L.concat(tip);
  }
  Object.defineProperty(D.scripts, 'halvard.consejo', { configurable: true, get: consejo });
  const withAdvice = (key) => {
    const orig = T[key];
    if (!orig) return;
    T[key] = [{ if: '!prologo.fin', then: orig, else: [
      { choice: [{ t: 'Pedir consejo', then: [{ call: 'halvard.consejo' }] }, { t: 'Charlar', then: orig.slice() }, { t: 'Nada, gracias' }], who: '@npc', e: 'neutral', name: 'Halvard', t: '¿Necesitas algo, muchacho?' },
    ] }];
  };
  withAdvice('halvard'); withAdvice('halvard_inundada');
})();
