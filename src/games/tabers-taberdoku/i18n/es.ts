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
  "taberdoku.clickHint":
    "Toca o haz clic para marcar una X y arrastra para marcar varias. Doble toque o doble clic para colocar un personaje.",
  "taberdoku.generating": "Generando tablero…",
  "taberdoku.solvedIn": "¡Resuelto en {time}!",
  "taberdoku.back": "Volver",
  "taberdoku.reset": "Reiniciar",
  "taberdoku.newBoard": "Otro tablero",
  "taberdoku.erase": "Borrar",
  "taberdoku.errors": "Errores: {count}",
  "taberdoku.gameOver": "¡Oh no! ¡Perdiste todas tus vidas!",
  "taberdoku.restartLevel": "Pulsa reiniciar para intentar de nuevo.",
  "taberdoku.characters": "Personajes",
  "taberdoku.levelProgress": "Nivel {current} de {total}",
  "taberdoku.play": "Jugar",
  "taberdoku.levelOf": "Nivel {current}/{total}",
  "taberdoku.level": "Nivel {current}",
  "taberdoku.boardCleared": "¡Tablero {board}/{boardsPerLevel} del Nivel {level} resuelto!",
  "taberdoku.levelProgressOf": "Nivel {level} · {progress}%",
  "taberdoku.levelCleared": "¡Nivel {level} superado! Siguiente nivel…",
  "taberdoku.levelComplete": "¡Nivel {level} completado! Pasando al Nivel {nextLevel}…",
  "taberdoku.levelUnlocked": "¡Nivel {level} desbloqueado!",
  "taberdoku.levelUnlockedDesc":
    "Has resuelto el 40% del nivel anterior. ¡El Nivel {level} ya está disponible!",
  "taberdoku.allCleared": "¡Has completado todos los niveles!",
  "taberdoku.allLevelsCleared": "Has completado todos los niveles.",
  "taberdoku.wellDone": "¡Enhorabuena, {name}!",
  "taberdoku.changeName": "Cambia tu nombre",
  "taberdoku.namePlaceholder": "Tu nombre",
  "taberdoku.saveName": "Guardar",
  "taberdoku.loading": "Cargando…",
  "taberdoku.nextLevel": "Siguiente nivel",
  "taberdoku.continue": "Continuar",
  "taberdoku.startFromBeginning": "Empezar desde el principio",
  "taberdoku.points": "puntos",
  "taberdoku.totalScore": "Puntuación total",
  "taberdoku.tutorial.title": "Cómo jugar",
  "taberdoku.tutorial.desc":
    "Un personaje por fila, columna y sala. No pueden tocarse entre sí, ni siquiera en diagonal.",
  "taberdoku.tutorial.gotIt": "Entendido",
  "taberdoku.tutorial.stepOf": "Paso {current} de {total}",
  "taberdoku.tutorial.stepPlaceTitle": "Coloca un personaje",
  "taberdoku.tutorial.rule1Desc":
    "En cada sala (color) solo cabe un personaje. Marca el resto con una X.",
  "taberdoku.tutorial.rule2Desc":
    "En cada fila y en cada columna solo cabe un personaje. Marca el resto con una X.",
  "taberdoku.tutorial.rule3Desc":
    "Dos personajes no pueden tocarse, ni siquiera en diagonal. Marca las casillas de alrededor con una X.",
  "taberdoku.tutorial.next": "Siguiente",
  "taberdoku.tutorial.prev": "Atrás",
  "taberdoku.tutorial.skip": "Saltar",
  "taberdoku.levels": "Niveles",
  "taberdoku.levelsHint": "Pulsa un nivel para jugar",
  "taberdoku.close": "Cerrar",
  "score.submitToRanking": "Enviar al ranking",
  "score.yourScore": "Tu puntuación: {score}",
};

export default dict;
