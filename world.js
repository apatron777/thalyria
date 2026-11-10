// Mapa del archipiélago de Vael (coordenadas en píxeles de la pantalla 384×216).
// Islas = suma de círculos [x, y, r]. Puertos con zona de destino. unlock = flag que la desbloquea.
(function () {
  'use strict';
  const TH = window.TH;
  TH.data.world = {
    name: 'Archipiélago de Vael',
    islands: [
      // cuando el mar sube (capítulo 6) las islas encogen y el islote hundido emerge
      { id: 'bruma', name: 'Isla de Bruma', label: [150, 70], dry: [[150, 118, 30], [176, 104, 24], [128, 128, 20], [198, 96, 16], [112, 112, 14], [162, 138, 16]], wet: [[150, 116, 22], [176, 104, 17], [198, 96, 11], [130, 126, 12]],
        get blobs() { return TH.flags.get('mar.subido') ? this.wet : this.dry; } },
      { id: 'norte', name: 'Hondaroca', label: [222, 14], unlock: 'isla.norte', dry: [[222, 34, 14], [236, 28, 9], [210, 40, 7]], wet: [[224, 32, 9], [236, 28, 6]],
        get blobs() { return TH.flags.get('mar.subido') ? this.wet : this.dry; } },
      { id: 'gaviotas', name: 'Islote de las Gaviotas', label: [292, 44], unlock: 'isla.gaviotas', blobs: [[288, 66, 12], [300, 60, 9], [279, 72, 7]] },
      { id: 'sur', name: '???', label: [300, 182], unlock: 'isla.sur', blobs: [[296, 156, 22], [318, 146, 14], [276, 166, 12]] },
      { id: 'oeste', name: '???', label: [52, 40], unlock: 'isla.oeste', blobs: [[56, 66, 16], [44, 76, 11], [70, 58, 9]] },
      { id: 'hundida', name: 'Torre del Motor', label: [214, 196], unlock: 'isla.hundida', dry: [[206, 178, 9], [218, 172, 6]], wet: [[206, 178, 14], [220, 170, 10], [196, 186, 7]], get blobs() { return TH.flags.get('mar.subido') ? this.wet : this.dry; } },
    ],
    ports: [
      { id: 'bruma', name: 'Bruma Salada', island: 'bruma', x: 140, y: 147, entry: 'muelle', get zone() { return TH.flags.get('mar.subido') ? 'brumaInundada' : 'brumaSalada'; } },
      { id: 'hondaroca', name: 'Hondaroca', island: 'norte', x: 216, y: 46, zone: 'hondaroca', entry: 'muelle', unlock: 'isla.norte' },
      { id: 'cala', name: 'Cala de los Acantilados', island: 'bruma', x: 215, y: 109, zone: 'acantilados', entry: 'muelle', unlock: 'puerto.cala' },
      { id: 'gaviotas', name: 'Islote de las Gaviotas', island: 'gaviotas', x: 284, y: 82, zone: null, unlock: 'puerto.gaviotas' },
    ],
    // rutas con puntos intermedios (el sentido contrario se calcula solo)
    routes: {
      'bruma>cala': [[150, 162], [196, 150], [228, 126]],
      'bruma>gaviotas': [[150, 162], [214, 152], [250, 116], [272, 92]],
      'cala>gaviotas': [[236, 102], [264, 90]],
      'bruma>hondaroca': [[150, 162], [214, 150], [240, 100], [230, 62]],
      'cala>hondaroca': [[236, 98], [228, 62]],
    },
  };
})();
