// Tiendas y posadas. stock: id o [id, condición] (aparece cuando se cumple la condición de historia)
(function () {
  'use strict';
  const TH = window.TH;
  const C1 = 'prologo.fin';
  TH.data.shops = {
    bruma: { name: 'Puesto de Nerea', stock: ['tonico', 'pan_algas', 'agua_luna', 'chaqueta_lona', 'amuleto_coral', 'pluma_gaviota', 'cinta_marinera',
      ['tonico_plus', C1], ['lanza_coral', C1], ['baston_nacar', C1], ['martillo_ancla', C1], ['espada_marea', C1], ['tunica_bruma', C1], ['cota_escamas', C1], ['anillo_ancla', C1]] },
    cabo: { name: 'Intendencia del Vigía', stock: ['tonico', 'tonico_plus', 'agua_luna', 'pan_algas', 'capa_vigia', 'colgante_marea', 'guantes_forja', 'espada_marea', 'cota_escamas'] },
  };
  TH.data.inns = {
    bruma: { name: 'Posada La Gaviota', price: 20, wake: 7 },
  };
})();
