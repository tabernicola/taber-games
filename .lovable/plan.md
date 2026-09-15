# Tres modos de juego en Taber's Murdoku

El juego pasa a tener tres modos, elegibles desde la página inicial de Murdoku.

## 1. Modo Sudoku (nuevo)

Sudoku clásico 9x9 donde los números se sustituyen por los 9 personajes de la base de datos.

- Tablero 9x9 con las 9 cajas de 3x3 habituales.
- Cada partida genera un tablero nuevo al azar, con solución única.
- Cuatro dificultades: fácil, medio, difícil y experto (cada una deja menos personajes ya colocados).
- El jugador elige un personaje de la barra lateral/inferior y toca una casilla vacía para colocarlo.
- Las casillas de partida vienen fijas y no se pueden cambiar.
- Se avisa en rojo cuando un personaje repite fila, columna o caja.
- Se gana al completar el tablero correctamente; cronómetro visible.

## 2. Modo Meowdoku (nuevo)

Parecido al modo actual pero sin pistas ni asesinato: solo lógica de colocación.

- Tableros fijos predefinidos, con tamaños de 6x6, 7x7, 8x8 y 9x9 y salas de forma irregular.
- Reglas: un personaje por fila, por columna y por sala, y además dos personajes nunca pueden estar en casillas contiguas (tampoco en diagonal).
- Sin pistas de texto y sin acusación: se gana al rellenar bien el tablero.
- Cada tamaño ofrece varios tableros; el jugador elige tamaño y tablero.
- Herramientas de ayuda: notas, cruces y goma, como ahora.
- Cronómetro visible.

## 3. Modo Investigación (el actual)

El modo que ya existe (casos con pistas, asesino y víctima) se mantiene igual, ahora presentado como uno de los tres modos.

## Página inicial

La página de Murdoku muestra tres tarjetas de modo. Al elegir Sudoku se pide la dificultad; al elegir Meowdoku, el tamaño y el tablero; al elegir Investigación se listan los casos como ahora.

## Detalles técnicos

- Rutas: `/$lang/murdoku/play` acepta `mode=sudoku|meowdoku|case`, más `level` (sudoku) o `puzzle` (meowdoku); sin parámetros se comporta como hoy.
- Nueva lógica en `src/games/murdoku/logic/`:
  - `sudoku.ts`: generación de solución completa por backtracking, vaciado de casillas según dificultad y verificación de unicidad; validación de conflictos.
  - `meowdoku.ts`: tipos del puzle, comprobación de las cuatro restricciones (fila, columna, sala, adyacencia incl. diagonal) y detección de victoria.
  - `meowdokuPuzzles.ts`: colección fija de tableros 6x6–9x9 con sus salas y solución, validados por test.
- Nuevos componentes en `src/games/murdoku/components/`: `SudokuBoard.tsx`, `MeowdokuBoard.tsx`, `CharacterTray.tsx` (selector de personaje compartido) y `ModeSelect` dentro de `LandingPage.tsx`. `MapView` y `MurdokuGame` no se tocan.
- Los personajes se leen con `fetchSuspects()` de `logic/characters.ts`; si la lista no llega a 9 se muestra aviso.
- Textos nuevos en `i18n/es.ts`, `eu.ts` y `en.ts`.
- Tests con Vitest para el generador de sudoku (unicidad) y para las reglas y soluciones de los tableros meowdoku.
