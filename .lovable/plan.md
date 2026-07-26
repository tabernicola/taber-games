## Objetivo
Construir **The Taber Games**, una web de minijuegos con estética oscura y neón rosa (inspirada en el nuevo logo estilo Squid Game), usando ese logo como imagen central. El primer minijuego será **The Taber Square**, versión single player basada en *The Genius Square*.

## Estado actual
Proyecto TanStack Start v1 recién creado, Tailwind v4, ruta raíz básica y home placeholder. Sin backend.

## Decisiones
- **Logo**: usar `file_00000000c06471fd9e9511c913590b3c.png` como asset CDN, mostrado prominentemente en la home.
- **Nombre del sitio**: The Taber Games.
- **Estilo visual**: fondo negro/muy oscuro, acentos rosa neón (#ff2ea6 aprox.), toques multicolor (guiño al drip del logo), tipografía display con carácter graffiti/arcade para títulos y sans-serif limpia para el resto. Glow sutil en elementos interactivos.
- **Juego**: single player, reglas estándar de The Genius Square (tablero 6x6, 7 dados que bloquean celdas, 9 piezas poliminó para rellenar el resto).
- Solo frontend, sin persistencia.

## Estructura
1. **Home `/`**
   - Hero con el logo grande de Taber Games sobre fondo negro con glow rosa.
   - Tagline corta.
   - Grid/tarjetas de minijuegos (por ahora solo "The Taber Square") con hover neón.
   - Nav minimalista (Home, Games).

2. **`/the-taber-square`**
   - Tablero 6x6 con celdas oscuras, bloqueos como "piedras" neón.
   - Panel de piezas de colores vivos (guiño al drip multicolor del logo).
   - Controles: nuevo juego, rotar (R), voltear (F), reset piezas.
   - Modal de victoria con efecto neón.

## Diseño visual
- Fondo: negro/near-black.
- Acento principal: rosa neón; acentos secundarios: cian, amarillo, violeta (para piezas del puzzle).
- Sombras/glow: `box-shadow` con color rosa translúcido.
- Bordes redondeados moderados.
- Tipografía: fuente display con carácter (tipo Bungee, Rubik Mono, o similar) para títulos; Inter/Space Grotesk para UI. Cargar por `<link>` en `__root.tsx`.
- Tokens de color en `src/styles.css` usando `oklch`.

## Implementación del juego

### Lógica (`src/lib/tabersquare/`)
- `dice.ts`: 7 dados con las caras del juego original (posiciones de bloqueo tipo "A1", "B2"…).
- `pieces.ts`: 9 piezas poliminó con forma, color y estado (rotación/flip).
- `game.ts`:
  - `rollDice()` → array de 7 posiciones bloqueadas.
  - `generatePuzzle()`: tira dados y **verifica que existe solución** con backtracking colocando las 9 piezas; si no, vuelve a tirar. (El juego original garantiza siempre solución.)
  - `rotatePiece()`, `flipPiece()`.
  - `canPlace(board, piece, x, y)`, `placePiece()`, `removePiece()`.
  - `isSolved(board)`.

### Componentes
- `GameBoard.tsx`: grid 6x6 interactivo.
- `Piece.tsx`: render de una pieza (SVG o divs) con color.
- `PiecesTray.tsx`: piezas disponibles + selección.
- `GameControls.tsx`: nuevo juego, rotar, voltear, reset.
- `VictoryModal.tsx`: mensaje de victoria + jugar de nuevo.
- Todo con clases Tailwind usando los tokens semánticos.

### Interacción
- Click en pieza del tray → seleccionada.
- Botones/teclas para rotar (R) y voltear (F).
- Click en celda del tablero → coloca si es válido.
- Click en pieza ya colocada → la devuelve al tray.
- Al completar todas las celdas libres → modal de victoria.

### Assets
- Subir el logo con `lovable-assets create --file /mnt/user-uploads/file_00000000c06471fd9e9511c913590b3c.png --filename taber-games-logo.png > src/assets/taber-games-logo.png.asset.json`.

### Metadatos
- Actualizar `head()` en `__root.tsx` y en cada ruta con título "The Taber Games", descripción y og tags apropiados.

## Pasos
1. Subir logo como asset CDN.
2. Definir tokens de color/tipografía en `src/styles.css` y cargar fuentes en `__root.tsx`.
3. Implementar lógica del juego en `src/lib/tabersquare/`.
4. Crear componentes del juego.
5. Crear la ruta `/the-taber-square`.
6. Rehacer `src/routes/index.tsx` como home con logo y tarjeta del juego.
7. Actualizar metadatos.
8. Verificar build y preview.

## Criterios de aceptación
- La home muestra el logo de The Taber Games con estética neón rosa sobre fondo oscuro.
- Existe una tarjeta que lleva a `/the-taber-square`.
- El juego genera puzzles siempre resolubles.
- El jugador puede rotar, voltear, colocar y quitar piezas.
- Al resolverlo, aparece un mensaje de victoria.
- Build sin errores.