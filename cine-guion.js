// Coloca las cinemáticas en los guiones: sustituyen la narración de los grandes momentos (finales de jefe y giros).
(function () {
  'use strict';
  const S = window.TH.data.scripts;
  const find = (key, txt) => (S[key] || []).findIndex((o) => o && typeof o.t === 'string' && o.t.indexOf(txt) >= 0);
  const put = (key, txt, ops, before) => {
    const a = S[key], i = find(key, txt);
    if (!a || i < 0) { console.warn('cine: no encuentro', key, txt); return; }
    if (before) a.splice(i, 0, ...ops); else a.splice(i, 1, ...ops);
  };
  // Prólogo
  put('pro.def2b', 'se ha apagado', [{ cine: 'apagon' }], true);
  put('pro.def2b', 'La vieja lanza de pesca arde', [{ cine: 'lanza' }]);
  put('pro.matriarca.fin', 'La Matriarca se deshace en espuma negra', [{ cine: 'matriarca' }]);
  put('pro.matriarca.fin', 'La luz sube por la torre', [{ cine: 'faro_alba' }]);
  // Capítulo 1: la marea se lleva a Elara
  put('cap1.final', 'Una ola negra se levanta', [{ cine: 'ola' }]);
  put('cap1.final', 'Elara alza el bastón', [{ cine: 'escudo' }]);
  put('cap1.final', 'Pero el mar no suelta lo que agarra', []);
  put('cap1.final', 'Y la marea negra se retira', [{ cine: 'rapto' }]);
  // Capítulo 2
  put('cap2.fin', 'Las raíces negras se vuelven verdes', [{ cine: 'raices' }]);
  // Capítulo 3
  put('cap3.fin', 'El coloso se arrodilla', [{ cine: 'vigia' }]);
  put('cap3.fin', 'Kaelen alza la lanza hacia la lente', []);
  // Capítulo 4
  put('cap4.fin', 'El Motor late.', [{ cine: 'motor' }]);
  // Capítulo 5
  put('cap5.fin', 'El agua negra se hunde', [{ cine: 'abisal_cae' }]);
  // Capítulo 6
  put('cap6.fin', 'El Coloso se sienta junto a su yunque', [{ cine: 'coloso' }]);
  put('cap6.fin', 'Lejos, en el horizonte, una torre', [{ cine: 'torre' }]);
  // Capítulo 7
  put('cap7.fin', 'Una ola negra se lo lleva', [{ cine: 'varek_ola' }]);
  // Final
  put('final.amanecer', 'Al este de Vael, sobre el mar, sale el sol', [{ cine: 'amanecer' }]);
})();
