// FASE D · puzles de poderes en el camino principal (un sello por capítulo) y un cofre secreto en cada mapa.
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, M = D.maps;
  const add = (id, objs, ep) => {
    const d = M[id]; if (!d) return;
    const tgt = ep && d.epochs && d.epochs[ep] ? d : d;
    tgt.puzzle = (tgt.puzzle || []).concat(objs.map((o) => Object.assign({}, ep && !o.epoch ? { epoch: ep } : {}, o, { id: 'fd' + o.id })));
  };
  // sello: compuerta que se abre con el puzle; el capítulo terminado o la marca fd la dejan abierta para siempre
  const seal = (id, rect, expr, cap) => ({ id: 'sello', type: 'gate', c: rect[0], r: rect[1], w: rect[2], h: rect[3], open: expr.replace(/\b([a-z]\d)\b/g, 'fd$1') + '|f:fd.' + id + '|f:fd.skip|f:' + cap, fdflag: 'fd.' + id });
  const pista = (c, r, text) => ({ id: 'pista', type: 'pista', c, r, text });

  // Cap. 1 · Arrecife · Mover
  add('arrecife', [
    { id: 'p1', type: 'plate', c: 38, r: 14 }, { id: 'b1', type: 'block', c: 41, r: 14, mover: true },
    pista(37, 13, 'Un sello de coral cierra la guarida. {p:0.3}«Lo que pesa, a la placa.» {p:0.3}(Ponte frente al bloque y pulsa 1: Mover.)'),
    seal('arrecife', [36, 9, 3, 3], 'p1', 'jefe.karkinos'),
  ]);
  // Cap. 2 · Bosque · Luz
  add('bosque', [
    { id: 'r1', type: 'runa', c: 18, r: 7 }, { id: 'r2', type: 'runa', c: 20, r: 7 }, { id: 'r3', type: 'runa', c: 22, r: 7 },
    pista(18, 6, 'Raíces de luz sellan el claro. {p:0.3}«Tres runas duermen en la tierra.» {p:0.3}(Pulsa 2 cerca de ellas: Luz.)'),
    seal('bosque', [17, 2, 3, 3], 'r1&r2&r3', 'jefe.madre'),
  ]);
  // Cap. 3 · Ruinas · Mover + Luz
  add('ruinas', [
    { id: 'r1', type: 'runa', c: 19, r: 7 }, { id: 'p1', type: 'plate', c: 20, r: 7 }, { id: 'b1', type: 'block', c: 23, r: 7, mover: true },
    pista(19, 6, '«Ilumina la marca. Después, el peso sobre la placa.»'),
    seal('ruinas', [18, 2, 3, 3], 'r1&p1', 'jefe.vigia'),
  ]);
  // Cap. 4 · Ciudad (pasado) · Brisa
  add('ciudad', [
    { id: 'l1', type: 'llama', c: 19, r: 14 }, { id: 'l2', type: 'llama', c: 21, r: 14 },
    pista(18, 13, 'La puerta del templo solo se abre en penumbra. {p:0.3}(Pulsa 3 mirando a los braseros: Brisa.)'),
    seal('ciudad', [16, 2, 3, 3], 'l1&l2', 'jefe.crono'),
  ], 'past');
  // Cap. 5 · Biblioteca (presente) · Brisa + Luz
  add('biblioteca', [
    { id: 'l1', type: 'llama', c: 24, r: 8 }, { id: 'r1', type: 'runa', c: 26, r: 8 },
    pista(23, 7, '«Apaga la vela del lector y lee lo que la sombra esconde.»'),
    seal('biblioteca', [22, 3, 3, 3], 'l1&r1', 'jefe.abisal'),
  ], 'present');
  // Cap. 6 · Hondaroca · Congelar
  add('hondaroca', [
    { id: 'c1', type: 'charco', c: 19, r: 10 }, { id: 'c2', type: 'charco', c: 21, r: 10 },
    pista(18, 9, 'El paso al Coloso está sellado por agua viva. {p:0.3}(Pulsa 4 frente a los charcos: Congelar.)'),
    seal('hondaroca', [0, 0, 0, 0], 'c1&c2', 'jefe.coloso'),
  ]);
  // Cap. 7 · Torre · Congelar + Brisa
  add('torre', [
    { id: 'c1', type: 'charco', c: 19, r: 17 }, { id: 'l1', type: 'llama', c: 21, r: 17 },
    pista(18, 16, '«Agua que no corra, fuego que no arda: la cima espera.»'),
    seal('torre', [10, 15, 16, 1], 'c1&l1', 'cap7.ithra'),
  ]);
  // Cap. 8 · Congelada (pasado) · Mover + Congelar
  add('congelada', [
    { id: 'p1', type: 'plate', c: 19, r: 14 }, { id: 'b1', type: 'block', c: 22, r: 14, mover: true }, { id: 'c1', type: 'charco', c: 20, r: 13 },
    pista(18, 13, '«El instante se abre con peso y con hielo.»'),
    seal('congelada', [0, 0, 0, 0], 'p1&c1', 'cap8.puerta'),
  ], 'past');

  // los jefes por disparador esperan al sello
  const gate = (map, script, id) => {
    const t = (M[map].triggers || []).concat(...Object.values(M[map].epochs || {}).map((e) => e.triggers || [])).find((t) => t.script === script);
    if (t) t.if = [].concat(t.if || [], { any: ['fd.' + id, 'fd.skip'] });
  };
  gate('hondaroca', 'cap6.coloso', 'hondaroca');
  gate('congelada', 'cap8.puerta', 'congelada');

  // secretos: [mapa, c, r, poder, región, premio, cantidad, época]
  const SEC = [
    ['brumaSalada', 12, 1, 'luz', 'bruma', 'tonico_plus', 3],
    ['acantilados', 34, 1, 'brisa', 'bruma', 'agua_luna', 3],
    ['arrecife', 41, 18, 'congelar', 'bruma', 'anillo_pleamar', 1],
    ['santuario', 4, 10, 'luz', 'bruma', 'concha', 4],
    ['jardin', 12, 14, 'brisa', 'bruma', 'tonico_plus', 3],
    ['gruta', 21, 16, 'congelar', 'bruma', 'colgante_marea', 1],
    ['cabo', 15, 1, 'mover', 'bruma', 'agua_luna', 4],
    ['brumaInundada', 35, 1, 'mover', 'bruma', 'concha', 5],
    ['bosque', 34, 1, 'brisa', 'oeste', 'semilla_vida', 1],
    ['hondonada', 2, 22, 'congelar', 'oeste', 'tonico_plus', 4],
    ['ruinas', 35, 1, 'brisa', 'sur', 'agua_luna', 4],
    ['ciudad', 34, 14, 'congelar', 'sur', 'anillo_dos_horas', 1, 'past'],
    ['biblioteca', 15, 2, 'congelar', 'sur', 'marcapaginas', 1, 'present'],
    ['abismo', 10, 3, 'congelar', 'sur', 'tonico_plus', 5],
    ['hondaroca', 1, 1, 'brisa', 'norte', 'guantes_forja', 1],
    ['faroleros', 32, 1, 'luz', 'hundida', 'farol_bolsillo', 1],
    ['torre', 1, 1, 'mover', 'hundida', 'agua_luna', 5],
    ['congelada', 34, 14, 'luz', 'instante', 'reloj_detenido', 1, 'past'],
  ];
  for (const [map, c, r, need, region, give, n, ep] of SEC) add(map, [{ id: 'secreto', type: 'secreto', c, r, need, region, give, n }], ep);
  D.secretMaps = SEC.map((s) => s[0]);
})();
