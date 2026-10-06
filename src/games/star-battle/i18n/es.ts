import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.starBattle.tag": "Puzzle · Taberdoku",
  "home.card.starBattle.desc":
    "Coloca un personaje por fila, columna y sala. Dos personajes nunca pueden estar en casillas contiguas (ni en diagonal).",

  "starBattle.title": "Star Battle",
  "starBattle.desc": "Un personaje por fila, columna y sala. No pueden tocarse entre sí.",
  "starBattle.rules":
    "Un personaje por fila, columna y sala. Dos personajes nunca pueden estar en casillas contiguas (ni en diagonal).",
  "starBattle.rule1": "1 por color",
  "starBattle.rule2": "1 por fila/columna",
  "starBattle.rule3": "No tocarse",
  "starBattle.clickHint":
    "Toca o haz clic para marcar una X y arrastra para marcar varias. Doble toque o doble clic para colocar un personaje.",
  "starBattle.generating": "Generando tablero…",
  "starBattle.solvedIn": "¡Resuelto en {time}!",
  "starBattle.back": "Volver",
  "starBattle.reset": "Reiniciar",
  "starBattle.newBoard": "Otro tablero",
  "starBattle.erase": "Borrar",
  "starBattle.errors": "Errores: {count}",
  "starBattle.gameOver": "¡Oh no! ¡Perdiste todas tus vidas!",
  "starBattle.restartLevel": "Pulsa reiniciar para intentar de nuevo.",
  "starBattle.characters": "Personajes",
  "starBattle.levelProgress": "Nivel {current} de {total}",
  "starBattle.play": "Jugar",
  "starBattle.levelOf": "Nivel {current}/{total}",
  "starBattle.level": "Nivel {current}",
  "starBattle.boardCleared": "¡Tablero {board}/{boardsPerLevel} del Nivel {level} resuelto!",
  "starBattle.levelProgressOf": "Nivel {level} · {progress}%",
  "starBattle.levelCleared": "¡Nivel {level} superado! Siguiente nivel…",
  "starBattle.levelComplete": "¡Nivel {level} completado! Pasando al Nivel {nextLevel}…",
  "starBattle.levelUnlocked": "¡Nivel {level} desbloqueado!",
  "starBattle.levelUnlockedDesc":
    "Has resuelto el 40% del nivel anterior. ¡El Nivel {level} ya está disponible!",
  "starBattle.allCleared": "¡Has completado todos los niveles!",
  "starBattle.allLevelsCleared": "Has completado todos los niveles.",
  "starBattle.wellDone": "¡Enhorabuena, {name}!",
  "starBattle.changeName": "Cambia tu nombre",
  "starBattle.namePlaceholder": "Tu nombre",
  "starBattle.saveName": "Guardar",
  "starBattle.loading": "Cargando…",
  "starBattle.nextLevel": "Siguiente nivel",
  "starBattle.continue": "Continuar",
  "starBattle.startFromBeginning": "Empezar desde el principio",
  "starBattle.points": "puntos",
  "starBattle.totalScore": "Puntuación total",
  "starBattle.tutorial.title": "Cómo jugar",
  "starBattle.tutorial.desc":
    "Un personaje por fila, columna y sala. No pueden tocarse entre sí, ni siquiera en diagonal.",
  "starBattle.tutorial.gotIt": "Entendido",
  "starBattle.tutorial.stepOf": "Paso {current} de {total}",
  "starBattle.tutorial.stepGoalTitle": "El objetivo",
  "starBattle.tutorial.stepGoalDesc":
    "Tu objetivo es encontrar a los personajes: deduce en qué casilla está cada uno. En cada sala, fila y columna solo cabe uno, y dos nunca pueden tocarse.",
  "starBattle.tutorial.stepPlaceTitle": "Coloca un personaje",
  "starBattle.tutorial.stepPlaceDesc":
    "Doble toque o doble clic para colocar un personaje. Si la posición es correcta, el personaje aparecerá. Pero si no, habrás perdido uno de tus 3 vidas.",
  "starBattle.tutorial.rule1Desc":
    "Cuando tienes un personaje colocado, marca con una X todas las casillas de su mismo color. No puede haber más de un personaje en el mismo color.",
  "starBattle.tutorial.rule2Desc":
    "También pasa lo mismo con las filas y las columnas: márcalas para indicar que en esas casillas no puede haber un personaje.",
  "starBattle.tutorial.rule3Desc":
    "Por último, marca todas las casillas alrededor del personaje: los personajes no pueden tocarse.",
  "starBattle.tutorial.next": "Siguiente",
  "starBattle.tutorial.prev": "Atrás",
  "starBattle.tutorial.skip": "Saltar",
  "starBattle.levels": "Niveles",
  "starBattle.levelsHint": "Pulsa un nivel para jugar",
  "starBattle.close": "Cerrar",
  "score.submitToRanking": "Enviar al ranking",
  "score.yourScore": "Tu puntuación: {score}",
};

export default dict;
