// Ecos: equipables (2 por personaje, suben stats) y liberables en combate. Al liberarlos pasan a espera
// (sin stats). Con 2 o más en espera se puede invocar; tras la invocación vuelven uno por turno.
(function () {
  'use strict';
  const TH = window.TH;
  const E = (TH.data.ecos = {});
  const add = (id, o) => { o.id = id; E[id] = o; };
  add('eco_alba', { name: 'Eco del Alba', el: 'Luz', color: '#ffd77a', stats: { mag: 2, spd: 1 }, desc: 'Un resplandor tibio que siempre mira al este.',
    release: { name: 'Destello del alba', kind: 'mag', power: 1.0, types: ['Luz'], area: 'all', desc: 'Luz sobre todos los enemigos.' } });
  add('eco_espuma', { name: 'Eco de Espuma', el: 'Agua', color: '#7fd8f0', stats: { hp: 10, res: 2 }, desc: 'Murmura como la orilla. Calma los golpes.',
    release: { name: 'Espuma protectora', kind: 'heal', power: 0.25, area: 'allies', shield: true, desc: 'Cura un 25 % y reduce el siguiente golpe.' } });
  add('eco_brasa', { name: 'Eco de Brasa', el: 'Fuego', color: '#ff8a5a', stats: { atk: 3 }, desc: 'Un rescoldo que no se apaga ni bajo el agua.',
    release: { name: 'Brasa', kind: 'mag', power: 2.2, types: ['Fuego'], area: 'one', desc: 'Una llamarada concentrada sobre un enemigo.' } });
  add('eco_luna', { name: 'Eco de Luna Menguante', el: 'Luna', color: '#b8a8ff', stats: { mag: 2, res: 1 }, desc: 'Dormía en la gruta, bajo el agua quieta. Recuerda una noche que duró mil años.',
    release: { name: 'Cuchilla menguante', kind: 'mag', power: 1.6, types: ['Luna', 'Corte'], area: 'line', desc: 'Un filo de luna en línea recta. Corta sellos de Luna y de Corte.' } });
  add('eco_vendaval', { name: 'Eco del Vendaval', el: 'Viento', color: '#d8f4ff', stats: { spd: 3, atk: 1 }, desc: 'Giraba dentro de la lente del faro del Vigía. Empuja hacia delante, siempre.',
    release: { name: 'Vendaval del cabo', kind: 'phys', power: 1.2, types: ['Corte', 'Impacto'], area: 'all', desc: 'Viento cortante sobre todos los enemigos.' } });
  // invocaciones según cuántos Ecos hay en espera
  TH.data.summons = [
    { need: 2, id: 'guardiana', name: 'Guardiana del Faro', power: 3.2, types: ['Luz', 'Fuego'], desc: 'Un faro colosal barre el campo con su luz.' },
    { need: 3, id: 'leviatan', name: 'Leviatán de Bruma', power: 4.6, types: ['Agua', 'Luna', 'Luz'], heal: 0.4, desc: 'La gran serpiente del mar arrasa y cura al grupo.' },
  ];
  TH.data.EL_ES = { Luz: 'Luz', Agua: 'Agua', Fuego: 'Fuego', Luna: 'Luna', Corte: 'Corte', Impacto: 'Impacto', Viento: 'Viento' };
})();
