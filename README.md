# Thalyria: El Día Detenido

JRPG por turnos con timing, Resonancias y viajes entre épocas. Prólogo, 8 capítulos, dos finales, epílogo y postgame.
Hecho en HTML + JavaScript puro: no necesita instalar ni compilar nada.

## Jugar
- **Navegador:** abre `index.html`.
- **GitHub Pages:** *Settings → Pages → Deploy from a branch → `main` / root*. El juego queda en `https://TU_USUARIO.github.io/TU_REPO/`.
- **Móvil:** abre el enlace de Pages y usa *Añadir a pantalla de inicio*: se instala como una app a pantalla completa, en horizontal y funciona sin conexión.

## Controles
| Móvil | Teclado |
|---|---|
| Joystick flotante (mitad izquierda); a fondo = correr | WASD / flechas · Mayús correr |
| **A** hablar / atacar / timing (o tocar la pantalla) | Espacio |
| **B** correr · toque corto: usar Resonancia | X / Z |
| **⇄** cambiar líder / absorber orbe | Q |
| Botones en pantalla: Resonancia, época, poderes 1-4, menú | R · V · 1-4 · Esc |

En combate, menús, tiendas y minijuegos todo se toca directamente. Opciones móviles (vibración, correr con el joystick, pantalla completa, tamaño de botones) en *Menú → Opciones*.

## Estructura
- `engine/` motor (escenas, combate, diálogos, móvil…)
- `data/` historia, mapas, misiones y objetos
- `sprites/` personajes, retratos y bestiario
- `manifest.webmanifest`, `sw.js`, `icon-*.png` app instalable / sin conexión
