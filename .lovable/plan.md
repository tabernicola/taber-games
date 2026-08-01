## Prerrequisito técnico
El servidor de desarrollo está caído por un error en la dependencia `@tanstack/start-plugin-core@1.171.18`: en `schema.js` aparece `.prefault({})` en lugar de `.default({})`. El primer paso del plan será corregir esto (fijando la versión o aplicando un override en `package.json`) para poder compilar y previsualizar.

## Objetivo
Añadir un tercer minijuego, **Eternity II**, a The Taber Games. Será un puzle de emparejamiento de bordes jugable dentro del sitio, con dificultad progresiva (tableros pequeños que desbloquean tamaños mayores) y estética propia (no la neón de la web), pensada para evolucionar hacia un look cartoon 3D con motivos de animales.


## Estado actual
- Proyecto TanStack Start v1 con tema oscuro/neón.
- Home (`/`) con tres tarjetas: The Taber Square, The Taber Study (externo) y "Próximamente".
- The Taber Square (`/the-taber-square`) ya tiene lógica de puzle, pistas, solución y victoria.
- Sistema de i18n en `src/lib/i18n.tsx` para euskera, castellano e inglés.
- Sin backend; todo frontend.

## Decisiones
- **Nombre**: Eternity II (ruta `/eternity-ii`).
- **Modo progresivo**: niveles de tablero crecientes — 4×4, 6×6, 8×8, 12×12 y 16×16 (el tamaño original de 256 fichas). Cada tamaño se desbloquea al resolver el anterior.
- **Mecánica**: fichas cuadradas con cuatro bordes de colores/patrones; los bordes adyacentes deben coincidir. Algunas fichas quedan fijas como pistas para garantizar solubilidad.
- **Interacción**: click para seleccionar ficha del mazo, click en celda para colocarla; botones/teclas para rotar (R) y voltear (F); doble-click o botón para quitar ficha.
- **Sin ayudas**: no habrá pista ni botón de solución. Eternity II no tiene solución conocida y el reto es precisamente ese; solo se validan visualmente los bordes que encajan.
- **Estilo**: estética propia, independiente de la neón del sitio. Base pensada para un look cartoon 3D con motivos de animales (bordes con iconos/figuras animales, fichas con volumen, sombras suaves y colores saturados). Se implementa con tokens propios del juego para poder cambiar la piel visual más adelante sin tocar la lógica.
- **Generación**: crear puzles resolubles de forma procedural. Para tamaños pequeños se genera desde cero; para 12×12 y 16×16 se parte de un patrón base resoluble y se le aplica una transformación aleatoria para obtener miles de variaciones.

## Estructura

### 1. Lógica del juego (`src/lib/eternity2/`)
- `tiles.ts`: definición de ficha (`id`, `edges: [top, right, bottom, left]`, rotación).
- `palette.ts`: paleta de colores/patrones de borde (6-8 estilos visuales distintos, suficientes para generar puzles sin ambigüedad).
- `generator.ts`:
  - `createSolvedBoard(size)`: genera un tablero resuelto con bordes coincidentes.
  - `shuffleBoard(board)`: aplica rotaciones aleatorias a las fichas.
  - `removeTiles(board, count)`: retira fichas para formar el puzle, dejando algunas fijas como pistas.
  - `generatePuzzle(size, difficulty)`: devuelve `{size, fixedTiles, trayTiles, solution}`.
- `game.ts`:
  - `canPlace(board, tile, x, y)`: valida colocación y emparejamiento de bordes.
  - `placeTile()`, `removeTile()`, `rotateTile()`.
  - `isSolved(board)`.
  - (sin funciones de pista ni de solución).

### 2. Componentes (`src/components/eternity2/`)
- `Tile.tsx`: ficha cuadrada con cuatro bordes renderizados (SVG o divs), soporte para rotación y estado seleccionado.
- `Board.tsx`: cuadrícula interactiva con celdas fijas y huecos, preview de colocación.
- `Tray.tsx`: mazo de fichas disponibles.
- `Controls.tsx`: rotar, voltear, nueva partida, pista, ver solución.
- `LevelSelector.tsx`: selector/desbloqueo de tamaños de tablero.
- `VictoryModal.tsx`: mensaje de victoria + pasar al siguiente nivel / jugar de nuevo.

### 3. Ruta y navegación
- `src/routes/eternity-ii.tsx`: página del juego con `head()` propio.
- Añadir tarjeta de Eternity II en `src/routes/index.tsx` (sustituye la tarjeta "Próximamente" o se añade como cuarta entrada).
- Actualizar `src/components/SiteHeader.tsx` si se añade entrada directa en el menú (opcional; la home ya sirve de selector).

### 4. Internacionalización
- Añadir claves en `src/lib/i18n.tsx` para:
  - `home.card.eternity.tag`, `home.card.eternity.desc`, `home.card.eternity.play`
  - `eternity.title`, `eternity.desc`, `eternity.new`, `eternity.rotate`, `eternity.flip`, `eternity.hint`, `eternity.solution`, `eternity.solved`, `eternity.level`, `eternity.locked`, etc.

### 5. Metadatos
- `head()` en `/eternity-ii` con título, descripción y og tags.

## Pasos
1. Crear modelos de ficha, paleta de bordes y utilidades de rotación en `src/lib/eternity2/`.
2. Implementar generador de tableros resueltos y puzles progresivos.
3. Implementar lógica de colocación, validación de bordes, pistas y solución.
4. Crear componentes visuales del tablero, fichas, mazo y controles con estilo neon.
5. Crear la ruta `/eternity-ii` con selector de niveles y modal de victoria.
6. Añadir tarjeta del juego en la home y actualizar traducciones.
7. Añadir metadatos de ruta.
8. Verificar build, responsive y rendimiento en tamaños grandes (especialmente 16×16).

## Criterios de aceptación
- Existe la ruta `/eternity-ii` accesible desde la home.
- El juego genera puzles resolubles en todos los tamaños progresivos.
- El jugador puede colocar, rotar, voltear y quitar fichas.
- Los bordes adyacentes se validan visualmente (coinciden/difieren).
- Hay pista única y botón de solución, como en The Taber Square.
- Al resolver un tamaño se desbloquea el siguiente.
- Build sin errores y UI responsive hasta 16×16 (con scroll/zoom si es necesario).
