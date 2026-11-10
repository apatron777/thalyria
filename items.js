// Objetos: consumibles, equipo y objetos clave. Precios en oro; se venden a la mitad.
// tipo: item (consumible) · weapon · armor · acc · key   ·  who: quién puede equiparlo (vacío = todos)
// stats: hp, mp, atk, def, mag, res, spd   ·  use: efecto fuera de combate
(function () {
  'use strict';
  const TH = window.TH;
  const I = (TH.data.items = {});
  const add = (id, o) => { o.id = id; I[id] = o; };

  // consumibles
  add('tonico', { name: 'Tónico de algas', type: 'item', price: 20, use: { hp: 40 }, desc: 'Amargo pero eficaz. Recupera 40 PV.' });
  add('tonico_plus', { name: 'Tónico concentrado', type: 'item', price: 60, use: { hp: 120 }, desc: 'Destilado tres veces. Recupera 120 PV.' });
  add('agua_luna', { name: 'Agua de luna', type: 'item', price: 45, use: { mp: 20 }, desc: 'Recogida en noche de marea alta. Recupera 20 PM.' });
  add('pan_algas', { name: 'Pan de algas', type: 'item', price: 12, use: { hp: 20, mp: 5 }, desc: 'Recién hecho. Recupera 20 PV y 5 PM.' });
  add('concha', { name: 'Concha nacarada', type: 'item', price: 30, sellOnly: true, desc: 'Brilla con la luz del alba. A los mercaderes les encanta.' });

  add('semilla', { name: 'Semilla de roble', type: 'key', desc: 'Una bellota dura como una piedra. Necesita siglos y buena tierra.' });

  // armas
  add('lanza_vieja', { name: 'Lanza de pesca', type: 'weapon', who: ['kaelen'], price: 40, stats: { atk: 3 }, desc: 'La lanza de toda la vida. Punta algo roma.' , unleash: { name: 'Arpón de marea', power: 1.8, types: ['Corte', 'Agua'] } });
  add('lanza_coral', { name: 'Lanza de coral', type: 'weapon', who: ['kaelen'], price: 160, stats: { atk: 7, spd: 1 }, desc: 'Punta de coral endurecido. Ligera y certera.' , unleash: { name: 'Lanza coralina', power: 2.2, types: ['Corte', 'Luz'] } });
  add('baston_deriva', { name: 'Bastón de deriva', type: 'weapon', who: ['elara'], price: 40, stats: { atk: 1, mag: 3 }, desc: 'Madera que el mar trajo a la orilla.' , unleash: { name: 'Deriva lunar', power: 1.9, types: ['Luna'] } });
  add('baston_nacar', { name: 'Bastón de nácar', type: 'weapon', who: ['elara'], price: 170, stats: { atk: 2, mag: 7, res: 1 }, desc: 'Incrustado de nácar. Canaliza bien la luz.' , unleash: { name: 'Destello nacarado', power: 2.3, types: ['Luz', 'Luna'] } });
  add('martillo_forja', { name: 'Martillo de forja', type: 'weapon', who: ['flint'], price: 40, stats: { atk: 4 }, desc: 'Pesa como un ancla. Flint dice que es ligero.' , unleash: { name: 'Yunque ardiente', power: 1.9, types: ['Impacto', 'Fuego'] } });
  add('martillo_ancla', { name: 'Martillo de ancla', type: 'weapon', who: ['flint'], price: 180, stats: { atk: 9, spd: -1 }, desc: 'Hecho con un ancla de verdad. Golpes que retumban.' , unleash: { name: 'Ancla abisal', power: 2.3, types: ['Impacto', 'Agua'] } });
  add('espada_faro', { name: 'Espada del vigía', type: 'weapon', who: ['firion'], price: 40, stats: { atk: 3, def: 1 }, desc: 'Hoja recta de la guardia del faro.' , unleash: { name: 'Haz del vigía', power: 1.8, types: ['Corte', 'Luz'] } });
  add('espada_marea', { name: 'Espada de marea', type: 'weapon', who: ['firion'], price: 175, stats: { atk: 7, def: 2 }, desc: 'Acero templado en agua salada.' , unleash: { name: 'Corte de marea', power: 2.2, types: ['Corte', 'Agua'] } });

  // la lanza despierta (prólogo): no se vende
  add('lanza_alba', { name: 'Lanza del Alba', type: 'weapon', who: ['kaelen'], price: 0, stats: { atk: 8, mag: 2, spd: 1 }, desc: 'La vieja lanza de pesca, despierta. Su punta guarda una chispa del primer amanecer.', unleash: { name: 'Alba creciente', power: 2.1, types: ['Corte', 'Luz'] } });

  // armaduras
  add('ropa_viaje', { name: 'Ropa de viaje', type: 'armor', price: 30, stats: { def: 2 }, desc: 'Cómoda y remendada mil veces.' });
  add('chaqueta_lona', { name: 'Chaqueta de lona', type: 'armor', price: 90, stats: { def: 5, res: 1 }, desc: 'Lona de vela encerada. Para el viento y algún golpe.' });
  add('cota_escamas', { name: 'Cota de escamas', type: 'armor', who: ['flint', 'firion'], price: 210, stats: { def: 9, spd: -1 }, desc: 'Escamas de pez grande cosidas sobre cuero.' });
  add('tunica_bruma', { name: 'Túnica de bruma', type: 'armor', who: ['elara'], price: 150, stats: { def: 3, res: 5, mp: 6 }, desc: 'Tejida con hilo que nunca se moja.' });

  // accesorios
  add('amuleto_coral', { name: 'Amuleto de coral', type: 'acc', price: 150, stats: { hp: 15, res: 2 }, desc: 'Dicen que protege de las mareas malas.' });
  add('pluma_gaviota', { name: 'Pluma de gaviota', type: 'acc', price: 120, stats: { spd: 3 }, desc: 'Ligera como el viento del puerto.' });
  add('anillo_ancla', { name: 'Anillo del ancla', type: 'acc', price: 180, stats: { atk: 2, def: 2 }, desc: 'Un anillo pesado. Te mantiene firme.' });

  add('cinta_marinera', { name: 'Cinta marinera', type: 'acc', price: 80, stats: { spd: 2, atk: 1 }, desc: 'Una cinta roja de las que se atan las marineras al zarpar.' });
  // capítulo 1: intendencia del faro del Vigía
  add('capa_vigia', { name: 'Capa del Vigía', type: 'armor', price: 240, stats: { def: 6, res: 3, spd: 1 }, desc: 'Lana encerada de la guardia del faro. No hay viento que la atraviese.' });
  add('colgante_marea', { name: 'Colgante de marea', type: 'acc', price: 220, stats: { res: 4, mp: 8 }, desc: 'Una perla que se enfría cuando sube la marea.' });
  add('guantes_forja', { name: 'Guantes de forja', type: 'acc', who: ['flint', 'kaelen', 'firion'], price: 170, stats: { atk: 3, def: 1 }, desc: 'Cuero curtido junto al yunque. Flint jura que son ignífugos.' });

  // objetos clave
  add('catalejo', { name: 'Catalejo viejo', type: 'key', desc: 'Lente rayada, pero aún alcanza el horizonte.' });

  TH.data.TYPE_ES = { item: 'Consumible', weapon: 'Arma', armor: 'Armadura', acc: 'Accesorio', key: 'Objeto clave' };
  TH.data.STAT_ES = { hp: 'PV', mp: 'PM', atk: 'ATQ', def: 'DEF', mag: 'MAG', res: 'RES', spd: 'VEL' };
})();
