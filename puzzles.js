// Tipos de objetos de puzle reutilizables. Cada mapa los coloca en su lista `puzzle` con un id único.
// solid: ocupa su casilla · push: 'light' (Lanzada, empujar andando, Flint) o 'heavy' (solo Flint)
// interact: se usa con A · flat: se dibuja pegado al suelo · signal: valor lógico que leen otros objetos
//
// Campos por objeto en el mapa:
//   plate  {c,r, heavy}            pulsado si hay un bloque/pilar encima (o alguien del grupo si no es heavy)
//   lever  {c,r, reset, pulse}     A alterna; reset: reinicia la sala; pulse: abre la compuerta temporizada indicada
//   crystal{c,r}                   se enciende con la Lanzada lunar y se queda encendido
//   gate   {c,r,w,h, open:'expr'}  bloquea mientras la expresión sea falsa (expr: 'a&b', 'a|!b')
//   timedgate {c,r,w,h, dur}       se abre unos segundos al tirar de su palanca; Elara puede congelarla
//   platform {c,r, pool | up:'expr'}  casilla pisable sobre el agua cuando el estanque está alto o se cumple `up`
//   block / pillar / ice / fire / windmill {c,r}
//   pool   {c,r,w,h, high, dry, level:'expr'}  Elara sube/baja; dry: al bajar se puede pisar el fondo; level: lo decide otra cosa
//   seed   {c,r}  (pasado) A con una semilla la planta · tree {c,r, when:'expr', bridge:[[c,r]...]} (presente)
//   stele  {c,r}  reloj de arena: cambia de época
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.puzzleTypes = {
    plate: { flat: true, name: 'Placa' },
    lever: { solid: true, interact: true, name: 'Palanca' },
    crystal: { solid: true, name: 'Cristal', light: [150, 200, 255] },
    gate: { area: true, name: 'Compuerta' },
    timedgate: { area: true, name: 'Compuerta de arena' },
    platform: { flat: true, name: 'Plataforma' },
    block: { solid: true, push: 'light', name: 'Bloque' },
    pillar: { solid: true, push: 'heavy', name: 'Pilar' },
    rock: { solid: true, push: 'heavy', name: 'Roca' },
    ice: { solid: true, melt: true, name: 'Hielo' },
    fire: { solid: true, douse: true, name: 'Fuego', light: [255, 150, 60] },
    windmill: { solid: true, spin: true, name: 'Molino' },
    pool: { area: true, flat: true, name: 'Estanque' },
    seed: { flat: true, interact: true, name: 'Tierra blanda' },
    tree: { solid: true, name: 'Roble' },
    stele: { solid: true, interact: true, name: 'Reloj de arena', light: [255, 220, 150] },
  };
  // Resonancias del mapa: quién la lleva y qué hace
  TH.data.resonances = [
    { id: 'lanza', who: 'kaelen', flag: 'res.lanza', name: 'Lanzada lunar', slot: 'up', color: '#bfe0ff', desc: 'Empuja bloques y enciende cristales a distancia.' },
    { id: 'agua', who: 'elara', name: 'Agua', slot: 'right', color: '#5fc8f0', desc: 'Sube o baja el agua de un estanque cercano.', desc2: 'Congela el tiempo de un objeto.' },
    { id: 'tierra', who: 'flint', name: 'Fuego y tierra', slot: 'down', color: '#ff8a4a', desc: 'Derrite hielo y mueve pilares y rocas.' },
    { id: 'rafaga', who: 'firion', name: 'Ráfaga', slot: 'left', color: '#d8f4ff', desc: 'Apaga fuegos, mueve molinos y planea sobre huecos.' },
  ];
})();
