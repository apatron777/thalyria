// FASE B · progresión y profundidad de combate.
// 1) Equipo con efectos (fx) y su motor: TH.gear.fx(id) suma los efectos del equipo puesto.
// 2) Roles enemigos (sanador, protector, potenciador, invocador) y grupos rehechos por capítulo.
// 3) Intención anunciada: icono junto a la vida del enemigo (y el nombre de la acción al apuntarle).
// 4) Curva de experiencia y oro por capítulo (medida con el bot y la estimación de econ2).
(function () {
  'use strict';
  const TH = window.TH, D = TH.data, E = D.enemies, I = D.items, M = D.maps;

  // ================= MOTOR DE EFECTOS =================
  const FX_TXT = {
    blockHeal: (v) => 'Un bloqueo cura un ' + Math.round(v * 100) + ' % de la vida',
    ringDouble: () => 'Un golpe perfecto con el anillo de tiempo pega dos veces',
    startCombo: (v) => 'Empieza cada combate con ' + v + ' de carga de combo',
    resist: (v) => Object.entries(v).map(([k, x]) => 'Recibe un ' + Math.round((1 - x) * 100) + ' % menos de daño de ' + k).join(' · '),
    magRes: (v) => 'Recibe un ' + Math.round(v * 100) + ' % menos de daño mágico',
    revive: () => 'Una vez por combate, se levanta con un 30 % de vida al caer',
    regen: (v) => 'Recupera un ' + Math.round(v * 100) + ' % de la vida cada ronda',
    mpRegen: (v) => 'Recupera ' + v + ' PM extra cada ronda',
    counter: (v) => 'Tras un bloqueo, contraataca (' + Math.round(v * 100) + ' %)',
    thorns: (v) => 'Devuelve un ' + Math.round(v * 100) + ' % del daño recibido',
    weakBoost: (v) => '+' + Math.round(v * 100) + ' % de daño contra debilidades',
    fury: (v) => '+' + Math.round(v * 100) + ' % de daño con menos de un 30 % de vida',
    drain: (v) => 'Absorbe un ' + Math.round(v * 100) + ' % del daño causado',
    comboUp: (v) => 'Sus golpes cargan un ' + Math.round((v - 1) * 100) + ' % más el combo',
    guardPlus: () => 'Defender reduce el daño un 70 % (en vez de 50 %)',
    goldUp: (v) => '+' + Math.round(v * 100) + ' % de oro al ganar',
    expUp: (v) => '+' + Math.round(v * 100) + ' % de experiencia al ganar',
    addType: (v) => 'Su ataque básico añade daño de ' + v,
  };
  const EL = [['Agua', /agua|marea|ola\b|olas|espuma|burbuj|tromba|chorro|lluvia|tormenta|inund|tsunami|crecida|salitre|abism/i],
    ['Fuego', /fuego|llama|ascua|brasa|lava|forja|fund|incend|ard|quema|fiebre|febril/i],
    ['Luna', /luna|lunar|eclipse/i], ['Luz', /luz|faro|destello|resplandor|lumin|rayo/i]];
  TH.gear = {
    fx(id) {
      const m = TH.party.members[id], out = {};
      if (!m) return out;
      for (const sl of TH.party.SLOTS) {
        const it = m.equip[sl] && I[m.equip[sl]];
        if (!it || !it.fx) continue;
        for (const [k, v] of Object.entries(it.fx)) {
          if (k === 'resist') { out.resist = out.resist || {}; for (const [e, x] of Object.entries(v)) out.resist[e] = Math.min(out.resist[e] || 1, x); }
          else if (typeof v === 'number' && typeof out[k] === 'number') out[k] = k === 'comboUp' ? out[k] * v : out[k] + v;
          else out[k] = v;
        }
      }
      return out;
    },
    text(it) { return it && it.fx ? Object.entries(it.fx).map(([k, v]) => (FX_TXT[k] ? FX_TXT[k](v) : k)).join(' · ') : ''; },
    element(act) { if (act.el) return act.el; for (const [e, re] of EL) if (re.test(act.name || '')) return e; return null; },
    // icono de intención: espada (golpe), ola (a todos), estrella (magia), cruz (cura), escudo (cubre), flecha (potencia), + (invoca)
    intent(ctx, e, x, y, named) {
      const a = e.act, k = a.kind, P = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, w, h); };
      P(-1, -1, 9, 9, '#1a1028'); P(0, 0, 7, 7, '#2e2348');
      if (k === 'heal' || k === 'healAlly') { P(3, 1, 1, 5, '#8ef0a0'); P(1, 3, 5, 1, '#8ef0a0'); }
      else if (k === 'cover' || k === 'protect' || k === 'buff') { P(1, 1, 5, 3, '#9fd8ff'); P(2, 4, 3, 1, '#9fd8ff'); P(3, 5, 1, 1, '#9fd8ff'); }
      else if (k === 'rally') { P(3, 1, 1, 5, '#ffb070'); P(2, 2, 3, 1, '#ffb070'); P(1, 3, 1, 1, '#ffb070'); P(5, 3, 1, 1, '#ffb070'); }
      else if (k === 'summon') { P(3, 1, 1, 5, '#e8b8ff'); P(1, 3, 5, 1, '#e8b8ff'); P(0, 0, 1, 1, '#e8b8ff'); P(6, 6, 1, 1, '#e8b8ff'); }
      else if (a.target === 'all') { for (let i = 0; i < 7; i++) P(i, 3 + Math.round(Math.sin(i * 1.4) * 1.5), 1, 1, '#ff8a7a'); P(0, 5, 7, 1, '#ff8a7a'); }
      else if (k === 'mag') { P(3, 0, 1, 7, '#ffb0ff'); P(0, 3, 7, 1, '#ffb0ff'); P(2, 2, 3, 3, '#ffb0ff'); }
      else { for (let i = 0; i < 5; i++) P(1 + i, 5 - i, 1, 1, '#ff8a7a'); P(1, 4, 2, 2, '#ff8a7a'); }
      if (named) TH.pixfont.draw(ctx, a.name, e.x, y - 10, '#ffd0c0', 1);
    },
  };

  // ================= 25 PIEZAS CON EFECTO =================
  const add = (id, o) => { o.id = id; I[id] = o; };
  // capítulo 1 (Bruma tras el prólogo, Cabo, Karkinos) y prólogo (Matriarca)
  add('cascabel_alba', { name: 'Cascabel del alba', type: 'acc', price: 0, stats: { hp: 10 }, fx: { expUp: 0.2 }, desc: 'Lo llevaba la Matriarca enredado en las patas. Suena a mañana.' });
  add('anillo_pleamar', { name: 'Anillo de la pleamar', type: 'acc', price: 260, stats: { spd: 1 }, fx: { startCombo: 40 }, desc: 'La marea ya ha subido cuando empieza la pelea.' });
  add('coraza_nacar', { name: 'Coraza de nácar', type: 'armor', who: ['flint', 'firion', 'kaelen'], price: 300, stats: { def: 7, res: 2 }, fx: { blockHeal: 0.08 }, desc: 'Nácar sobre cuero. Cada golpe parado brilla y cierra heridas.' });
  add('arpon_gemelo', { name: 'Arpón gemelo', type: 'weapon', who: ['kaelen'], price: 0, stats: { atk: 9, spd: 1 }, fx: { ringDouble: true }, desc: 'Hecho con una púa de Karkinos. Dos puntas, dos golpes.' });
  // capítulo 2
  add('baston_savia', { name: 'Bastón de savia', type: 'weapon', who: ['elara'], price: 420, stats: { atk: 2, mag: 9, res: 2 }, fx: { regen: 0.05 }, desc: 'Rama viva del Bosque. Su savia sigue corriendo.' });
  add('capa_espinas', { name: 'Capa de espinas', type: 'armor', price: 0, stats: { def: 8, res: 3 }, fx: { thorns: 0.25 }, desc: 'Tejida con zarzas de la Hondonada. Quien la toca, se pincha.' });
  add('semilla_vida', { name: 'Semilla de la Madre', type: 'acc', price: 0, stats: { hp: 30, res: 3 }, fx: { revive: true }, desc: 'Lo único limpio que quedó de la Madre del Bosque. Late.' });
  // capítulo 3
  add('brazal_bronce', { name: 'Brazal de bronce', type: 'acc', price: 700, stats: { def: 3 }, fx: { counter: 0.6 }, desc: 'De un centinela de las Ruinas. Responde solo.' });
  add('martillo_eco', { name: 'Martillo del eco', type: 'weapon', who: ['flint'], price: 0, stats: { atk: 16 }, fx: { comboUp: 1.5 }, desc: 'Forjado con el brazo del Vigía. Cada golpe resuena dos veces.' });
  add('cota_centinela', { name: 'Cota del centinela', type: 'armor', who: ['flint', 'firion', 'kaelen'], price: 0, stats: { def: 13, res: 3 }, fx: { guardPlus: true }, desc: 'Placas de bronce que encajan solas cuando te cubres.' });
  // capítulo 4
  add('anillo_dos_horas', { name: 'Anillo de las dos horas', type: 'acc', price: 1300, stats: { spd: 2 }, fx: { ringDouble: true }, desc: 'Late dos veces por cada segundo. El golpe perfecto, también.' });
  add('espada_hora', { name: 'Espada de la hora', type: 'weapon', who: ['firion'], price: 0, stats: { atk: 21, def: 3 }, fx: { weakBoost: 0.3 }, desc: 'La aguja mayor de la Cronoguardia. Siempre encuentra el hueco.' });
  add('tunica_dorada', { name: 'Túnica dorada', type: 'armor', who: ['elara'], price: 1100, stats: { def: 6, res: 10, mp: 12 }, fx: { mpRegen: 3 }, desc: 'Hilo de oro de la Ciudad. Respira con quien la lleva.' });
  // capítulo 5
  add('lanza_eclipse', { name: 'Lanza del eclipse', type: 'weapon', who: ['kaelen'], price: 1800, stats: { atk: 26, mag: 4, spd: 2 }, fx: { drain: 0.12 }, desc: 'Su punta se oscurece al herir y devuelve la luz a quien la empuña.' });
  add('marcapaginas', { name: 'Marcapáginas de la reina', type: 'acc', price: 0, stats: { res: 6, mp: 10 }, fx: { magRes: 0.2 }, desc: 'Cinta de seda del libro de Aurelia. Los hechizos resbalan.' });
  add('corona_abisal', { name: 'Corona del Abisal', type: 'acc', price: 0, stats: { atk: 6, mag: 6 }, fx: { fury: 0.4 }, desc: 'Un fragmento del Primer Abisal. Pesa más cuanto peor estás.' });
  // capítulo 6
  add('coraza_perla', { name: 'Coraza de perla negra', type: 'armor', price: 2300, stats: { def: 24, res: 12 }, fx: { resist: { Agua: 0.5 } }, desc: 'Perlas del fondo de Bruma inundada. El agua la rodea sin tocarla.' });
  add('guanteletes_brasa', { name: 'Guanteletes de brasa', type: 'acc', who: ['flint', 'kaelen', 'firion', 'oslo'], price: 0, stats: { atk: 8 }, fx: { addType: 'Fuego' }, desc: 'Del núcleo del Coloso de la Forja. Todavía queman.' });
  add('bolsa_mercader', { name: 'Bolsa del mercader', type: 'acc', price: 0, stats: { spd: 1 }, fx: { goldUp: 0.3 }, desc: 'Una bolsa vieja de Hondaroca. Siempre pesa un poco más al salir.' });
  // capítulo 7
  add('farol_bolsillo', { name: 'Farol de bolsillo', type: 'acc', price: 2800, stats: { res: 6 }, fx: { regen: 0.06, mpRegen: 2 }, desc: 'Un farolito de la Aldea. Su luz calienta por dentro.' });
  add('manto_brasas', { name: 'Manto de brasas', type: 'armor', price: 0, stats: { def: 30, res: 14 }, fx: { resist: { Fuego: 0.5 } }, desc: 'Lo usaban los faroleros para subir a las linternas encendidas.' });
  add('puno_coloso', { name: 'Puño del Coloso', type: 'weapon', who: ['flint'], price: 0, stats: { atk: 40, def: 6 }, fx: { counter: 0.7, guardPlus: true }, desc: 'Un puño entero del Coloso de guerra. Flint lo llama «el guante».' });
  // capítulo 8
  add('lanza_instante', { name: 'Lanza del instante', type: 'weapon', who: ['kaelen'], price: 7500, stats: { atk: 50, mag: 8, spd: 4 }, fx: { ringDouble: true, weakBoost: 0.25 }, desc: 'Forjada dentro del instante. Golpea antes de que el tiempo se dé cuenta.' });
  add('velo_eterno', { name: 'Velo eterno', type: 'armor', who: ['elara'], price: 0, stats: { def: 14, res: 24, mp: 20 }, fx: { revive: true, magRes: 0.15 }, desc: 'Escarcha de la Ciudad Congelada que nunca se derrite.' });
  add('reloj_detenido', { name: 'Reloj detenido', type: 'acc', price: 5000, stats: { spd: 3 }, fx: { startCombo: 100, comboUp: 1.3 }, desc: 'Marca siempre la misma hora: la de empezar ganando.' });

  // tiendas (con condición de historia)
  const S = D.shops, put = (shop, id, cond) => { if (S[shop]) S[shop].stock.push(cond ? [id, cond] : id); };
  put('bruma', 'anillo_pleamar', 'prologo.fin'); put('cabo', 'coraza_nacar'); put('cabo', 'anillo_pleamar');
  put('bosque', 'baston_savia'); put('ruinas', 'brazal_bronce');
  put('ciudad', 'anillo_dos_horas'); put('ciudad', 'tunica_dorada');
  put('biblioteca', 'lanza_eclipse'); put('inundada', 'coraza_perla');
  put('faroleros', 'farol_bolsillo'); put('ithra', 'lanza_instante'); put('ithra', 'reloj_detenido');
  // jefes
  const drop = (k, it) => { if (E[k]) E[k].drops = (E[k].drops || []).concat([{ item: it, chance: 1 }]); };
  drop('matriarca', 'cascabel_alba'); drop('karkinos', 'arpon_gemelo'); drop('madre', 'semilla_vida'); drop('vigia_bronce', 'martillo_eco');
  drop('cronoguardia', 'espada_hora'); drop('abisal', 'corona_abisal'); drop('coloso', 'guanteletes_brasa'); drop('coloso_guerra', 'puno_coloso');
  // cofres
  const chest = (map, id, give) => {
    const d = M[map]; if (!d) return;
    const L = [].concat(d.chests || []); if (d.epochs) for (const ep of Object.values(d.epochs)) L.push(...(ep.chests || []));
    const c = L.find((x) => x.id === id); if (c) { c.give = give; c.n = 1; }
  };
  chest('hondonada', 'hond_norte', 'capa_espinas'); chest('ruinas', 'ruinas_playa', 'cota_centinela'); chest('biblioteca', 'pastbib_sala_pasado', 'marcapaginas');
  chest('hondaroca', 'hond_mina', 'bolsa_mercader'); chest('torre', 'torre_ola', 'manto_brasas'); chest('congelada', 'pastcong_mercado', 'velo_eterno');

  // ================= ROLES ENEMIGOS =================
  const ROLE = {
    sanador: (n, heal) => ({ act: { name: n, kind: 'healAlly', heal: heal || 0.25, target: 'self' }, rule: { if: 'ally<0.6', rest: 2 } }),
    protector: (n) => ({ act: { name: n, kind: 'cover', target: 'self' }, rule: { if: 'cover', rest: 3 } }),
    potenciador: (n) => ({ act: { name: n, kind: 'rally', buff: { atk: 1.3, turns: 2 }, target: 'self' }, rule: { if: 'rally', rest: 3 } }),
    invocador: (n, who) => ({ act: { name: n, kind: 'summon', summon: who, target: 'self' }, rule: { if: 'adds<3&noboss', rest: 4 } }),
  };
  const R = (k, role, ...a) => {
    const e = E[k]; if (!e) return;
    const r = ROLE[role](...a), id = 'rol_' + role;
    e.role = role; e.actions[id] = r.act;
    if (!e.pattern && !e.ai) e.pattern = Object.keys(e.actions).filter((x) => x !== id);
    // regla del rol delante; si no se cumple, sigue su IA o su patrón de siempre
    e.ai = [Object.assign({ act: id }, r.rule)].concat((e.ai || []).filter((x) => x.act !== id));
  };
  R('cangrejo', 'protector', 'Caparazón protector'); R('gaviota', 'potenciador', 'Graznido de tormenta'); R('larva_voraz', 'invocador', 'Llamada a la cría', 'larva');
  R('cangrejo_roca', 'protector', 'Muralla de roca'); R('gaviota_abisal', 'potenciador', 'Chillido abisal');
  R('larva_musgo', 'sanador', 'Savia negra'); R('cangrejo_tronco', 'protector', 'Corteza vieja'); R('cangrejo_raiz', 'potenciador', 'Aullido de caza');
  R('halcon', 'potenciador', 'Grito del halcón'); R('centinela', 'protector', 'Escudo de bronce'); R('centinela_mayor', 'sanador', 'Reparar engranajes');
  R('engranaje', 'sanador', 'Reajuste', 0.2); R('engranaje_mayor', 'protector', 'Rueda guardiana'); R('polilla', 'potenciador', 'Polvo dorado'); R('polilla_eterna', 'invocador', 'Enjambre', 'polilla');
  R('sombra', 'potenciador', 'Susurro del Fondo'); R('sombra_abisal', 'invocador', 'Llamar a la sombra', 'sombra');
  R('medusa', 'sanador', 'Velo de medusa'); R('medusa_reina', 'invocador', 'Desove', 'medusa'); R('cangrejo_abisal', 'protector', 'Caparazón negro'); R('cangrejo_titan', 'potenciador', 'Pinzas en alto');
  R('farol_errante', 'sanador', 'Luz cálida'); R('farol_corrupto', 'potenciador', 'Llama febril'); R('guardian_marea', 'protector', 'Muro de marea'); R('guardian_abismo', 'potenciador', 'Orden del abismo');
  R('cristal_tiempo', 'sanador', 'Rebobinar', 0.22); R('cristal_eterno', 'potenciador', 'Acelerar el instante'); R('eco_helado', 'protector', 'Abrazo helado'); R('eco_glacial', 'invocador', 'Llamar a los ecos', 'eco_helado');
  R('medusa_primordial', 'sanador', 'Marea primordial', 0.2); R('eco_primordial', 'potenciador', 'Runas antiguas'); R('cria_leviatan', 'protector', 'Escamas guardianas');

  // ================= GRUPOS REHECHOS =================
  // misma patrulla, grupos que obligan a elegir objetivo (sanador / protector / potenciador / invocador)
  const G = {
    acantilados: [['larva', 'larva', 'gaviota'], null, ['gaviota', 'larva_voraz'], null, ['gaviota', 'cangrejo', 'larva']],
    arrecife: [['cangrejo_roca', 'gaviota_abisal'], null, ['gaviota_abisal', 'cangrejo', 'larva'], null],
    cabo: [null, null, ['gaviota', 'cangrejo_roca']],
    bosque: [['larva_musgo', 'larva_espina'], null, ['larva_espina', 'cangrejo_raiz', 'larva_musgo'], null, ['cangrejo_tronco', 'larva_espina', 'larva_espina']],
    hondonada: [['larva_musgo', 'cangrejo_raiz'], null, ['cangrejo_raiz', 'cangrejo_raiz', 'larva_musgo']],
    ruinas: [null, ['halcon', 'halcon_tormenta', 'centinela_mayor'], null, null, ['centinela', 'centinela_mayor', 'halcon_tormenta']],
    hondaroca: [null, ['medusa', 'cangrejo_abisal', 'cangrejo_titan']],
    faroleros: [['farol_errante', 'farol_corrupto']],
    abismo: [],
  };
  const EP = {
    ciudad: { past: [null, ['polilla', 'engranaje', 'engranaje_mayor']] },
    biblioteca: { present: [['sombra', 'sombra_abisal']] },
    congelada: { past: [null, ['eco_helado', 'cristal_tiempo', 'cristal_eterno']] },
  };
  const regroup = (L, R2) => { let i = 0; for (const f of L || []) { if (f.static) continue; if (R2[i]) f.group = R2[i].slice(); i++; } };
  for (const [m, R2] of Object.entries(G)) if (M[m]) regroup(M[m].foes, R2);
  for (const [m, eps] of Object.entries(EP)) if (M[m]) for (const [ep, R2] of Object.entries(eps)) {
    // los grupos de época pueden estar en el mapa (con if de época) o dentro de epochs
    const inEp = M[m].epochs && M[m].epochs[ep] && M[m].epochs[ep].foes;
    if (inEp && inEp.length) regroup(inEp, R2);
    else regroup((M[m].foes || []).filter((f) => [].concat(f.if || []).some((c) => String(c).endsWith('=' + ep))), R2);
  }
  // la torre: un trío con sanador detrás de un protector
  if (M.torre) { const f = (M.torre.foes || []).filter((x) => !x.static); if (f[2]) f[2].group = ['guardian_marea', 'farol_errante', 'farol_corrupto']; }

  // ================= CURVA DE EXPERIENCIA Y ORO =================
  // estimación (econ2): cada grupo del mapa ~1,3 veces + jefes → nivel natural ≈ nivel previsto del capítulo siguiente
  const CH = {
    prologo: [['larva', 'cangrejo', 'larva_voraz', 'matriarca'], 1, 1],
    cap1: [['gaviota', 'cangrejo_roca', 'gaviota_abisal', 'karkinos', 'pinza_izq', 'pinza_der'], 0.9, 1.1],
    cap2: [['larva_musgo', 'larva_espina', 'cangrejo_raiz', 'cangrejo_tronco', 'madre', 'zarpa_izq', 'zarpa_der', 'lobo_alfa'], 0.6, 1.1],
    cap3: [['halcon', 'halcon_tormenta', 'centinela', 'centinela_mayor', 'vigia_bronce', 'brazo_izq', 'brazo_der', 'varek'], 0.62, 1.5],
    cap4: [['engranaje', 'engranaje_mayor', 'polilla', 'polilla_eterna', 'sombra', 'sombra_abisal', 'cronoguardia', 'aguja_izq', 'aguja_der'], 0.7, 1.5],
    cap5: [['abisal'], 0.68, 1.5],
    cap6: [['medusa', 'medusa_reina', 'cangrejo_abisal', 'cangrejo_titan', 'coloso', 'yunque_izq', 'yunque_der'], 0.58, 1.3],
    cap7: [['farol_errante', 'farol_corrupto', 'guardian_marea', 'guardian_abismo', 'coloso_guerra', 'puno_izq', 'puno_der'], 0.6, 1.3],
    cap8: [['cristal_tiempo', 'cristal_eterno', 'eco_helado', 'eco_glacial', 'varek_abisal', 'abisal_eco', 'corazon', 'tentaculo_izq', 'tentaculo_der'], 0.75, 1.8],
  };
  for (const [ids, xk, gk] of Object.values(CH)) for (const k of ids) if (E[k]) { E[k].exp = Math.max(1, Math.round(E[k].exp * xk)); E[k].gold = Math.round(E[k].gold * gk); }
})();
