// Técnicas combinadas. cost = cargas de la barra de combo. Solo gasta el turno de quien la inicia.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.combos = [
    { id: 'aurora', name: 'Aurora creciente', who: ['kaelen', 'elara'], cost: 1, kind: 'mag', power: 1.6, types: ['Luz', 'Luna'], area: 'all', desc: 'Sol y luna giran y caen juntos sobre todos.' },
    { id: 'lanza_roja', name: 'Lanza al rojo', who: ['kaelen', 'flint'], cost: 1, kind: 'phys', power: 2.2, types: ['Corte', 'Fuego', 'Impacto'], area: 'line', desc: 'Flint forja la lanza de un martillazo y Kaelen lo atraviesa todo.' },
    { id: 'martillo_viento', name: 'Martillo y vendaval', who: ['flint', 'firion'], cost: 1, kind: 'phys', power: 1.9, types: ['Impacto', 'Corte'], area: 'all', gather: true, desc: 'Firion los agrupa con el viento y Flint cae sobre ellos.' },
    { id: 'marea_faro', name: 'Marea del faro', who: ['elara', 'firion'], cost: 1, kind: 'mag', power: 1.3, types: ['Agua', 'Luz'], area: 'all', heal: 0.3, desc: 'Una ola de luz que daña y cura al grupo.' },
    { id: 'cruz', name: 'Cruz de acero', who: ['kaelen', 'firion'], cost: 1, kind: 'phys', power: 3.0, types: ['Corte', 'Corte'], area: 'one', desc: 'Dos tajos cruzados sobre un solo enemigo.' },
    { id: 'geiser', name: 'Géiser de forja', who: ['elara', 'flint'], cost: 1, kind: 'mag', power: 1.8, types: ['Agua', 'Fuego'], area: 'circle', r: 32, desc: 'Agua sobre metal al rojo: una columna de vapor.' },
    { id: 'eclipse', name: 'Eclipse del faro', who: ['kaelen', 'elara', 'firion'], cost: 2, kind: 'mag', power: 2.6, types: ['Luz', 'Luna', 'Corte'], area: 'all', desc: 'El cielo se oscurece y cae un haz de tres colores.' },
    { id: 'ancla', name: 'Caída del ancla', who: ['kaelen', 'flint', 'firion'], cost: 2, kind: 'phys', power: 4.2, types: ['Impacto', 'Corte', 'Fuego'], area: 'one', desc: 'Un ancla gigante cae del cielo sobre un solo enemigo.' },
  ];
})();
