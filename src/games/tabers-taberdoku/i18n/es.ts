import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.taberdoku.tag": "Puzzle · Taberdoku",
  "home.card.taberdoku.desc":
    "Coloca un personaje por fila, columna y sala. Dos personajes nunca pueden estar en casillas contiguas (ni en diagonal).",

  "taberdoku.title": "Taberdoku",
  "taberdoku.desc": "Un personaje por fila, columna y sala. No pueden tocarse entre sí.",
  "taberdoku.rules":
    "Un personaje por fila, columna y sala. Dos personajes nunca pueden estar en casillas contiguas (ni en diagonal).",
  "taberdoku.rule1": "1 por color",
  "taberdoku.rule2": "1 por fila/columna",
  "taberdoku.rule3": "No tocarse",
  "taberdoku.doubleClick": "Para colocar un personaje, haz doble clic en la casilla.",
  "taberdoku.generating": "Generando tablero…",
  "taberdoku.solvedIn": "¡Resuelto en {time}!",
  "taberdoku.back": "Volver",
  "taberdoku.reset": "Reiniciar",
  "taberdoku.newBoard": "Otro tablero",
  "taberdoku.erase": "Borrar",
  "taberdoku.errors": "Errores: {count}",
  "taberdoku.characters": "Personajes",
  "taberdoku.levelProgress": "Nivel {current} de {total}",
  "taberdoku.play": "Jugar",
  "taberdoku.levelOf": "Nivel {current}/{total}",
  "taberdoku.levelCleared": "¡Nivel {level} superado! Siguiente nivel…",
  "taberdoku.allCleared": "¡Has completado todos los niveles!",
  "taberdoku.allLevelsCleared": "Has completado todos los niveles.",
  "taberdoku.loading": "Cargando…",
  "taberdoku.nextLevel": "Siguiente nivel",
};

export default dict;
