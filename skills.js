// Técnicas del grupo. area: one (un objetivo) · line (línea desde quien lanza) · cone (abanico) · circle (círculo
// alrededor del objetivo) · all (todos) · allies (todo el grupo). kind: phys (ATQ/DEF) · mag (MAG/RES) · heal.
// gather: agrupa a los alcanzados alrededor del objetivo (viento).
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.TYPES = ['Corte', 'Impacto', 'Luna', 'Agua', 'Fuego', 'Luz'];
  TH.data.TYPE_COLOR = { Corte: '#e8eef8', Impacto: '#e0a050', Luna: '#a898ff', Agua: '#58c0ff', Fuego: '#ff7040', Luz: '#ffe070' };
  TH.data.AREA_ES = { one: 'un objetivo', line: 'línea', cone: 'abanico', circle: 'círculo', all: 'todos', allies: 'grupo' };
  TH.data.basic = { kaelen: ['Corte'], elara: ['Luna'], flint: ['Impacto'], firion: ['Corte'] };
  TH.data.skills = {
    kaelen: [
      { id: 'tajo_alba', name: 'Tajo del alba', mp: 4, kind: 'phys', power: 1.45, types: ['Corte', 'Luz'], area: 'one', desc: 'Una estocada que arde con la primera luz.' },
      { id: 'perforar', name: 'Lanza perforante', mp: 5, kind: 'phys', power: 1.1, types: ['Corte'], area: 'line', desc: 'Atraviesa a todos los que estén en línea.' },
      { id: 'remolino', name: 'Remolino', mp: 6, kind: 'phys', power: 0.95, types: ['Corte'], area: 'circle', r: 26, desc: 'Gira la lanza alrededor del objetivo.' },
    ],
    elara: [
      { id: 'rayo_lunar', name: 'Rayo lunar', mp: 4, kind: 'mag', power: 1.5, types: ['Luna'], area: 'one', desc: 'Un haz frío de luna.' },
      { id: 'ola', name: 'Ola de bruma', mp: 5, kind: 'mag', power: 1.0, types: ['Agua'], area: 'cone', desc: 'Una ola en abanico.' },
      { id: 'marea', name: 'Marea sanadora', mp: 5, kind: 'heal', power: 2.2, types: [], area: 'allies', desc: 'Cura a todo el grupo.' },
    ],
    flint: [
      { id: 'golpe_forja', name: 'Golpe de forja', mp: 4, kind: 'phys', power: 1.5, types: ['Impacto', 'Fuego'], area: 'one', desc: 'El martillo al rojo vivo.' },
      { id: 'temblor', name: 'Temblor', mp: 6, kind: 'phys', power: 1.05, types: ['Impacto'], area: 'circle', r: 30, desc: 'Un golpe al suelo que alcanza a los de alrededor.' },
    ],
    firion: [
      { id: 'corte_vigia', name: 'Corte del vigía', mp: 4, kind: 'phys', power: 1.5, types: ['Corte'], area: 'one', desc: 'Un tajo limpio y preciso.' },
      { id: 'vendaval', name: 'Vendaval', mp: 5, kind: 'phys', power: 0.7, types: ['Corte'], area: 'cone', gather: true, desc: 'Empuja con viento y agrupa a los enemigos alcanzados.' },
      { id: 'destello', name: 'Destello', mp: 5, kind: 'mag', power: 1.2, types: ['Luz', 'Fuego'], area: 'line', desc: 'La lámpara del faro, en línea recta.' },
    ],
  };
})();
