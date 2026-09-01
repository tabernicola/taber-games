# Plan de rediseño visual: The Taber's Star (Landing + Play)

## 0. Resumen ejecutivo

- **Alcance:** solo la landing y la pantalla de juego de *The Taber's Star*. Nada de neón en estas dos vistas. El resto de la web (home, eternity-ii, taber-square, cabecera global) sigue con su aspecto actual.
- **Motivo del aislamiento:** cada juego tiene su propia identidad. Eternity II ya rompe con el neón mediante `.e2-scope`; replicamos ese patrón para tabers-star.
- **Activos propios del juego:**
  - Logo: `src/games/tabers-star/ui/TaberStarLogo.tsx` (estrella hexagonal SVG, actualmente con gradiente neón).
  - Personaje: `public/tabers-star/Taber-palestino.png`. Aparecerá en landing (hero) y play (decoración lateral).
- **NO se toca:** colores de piezas, colores de tablero, `getCellColor`, `placedPieceColorsMap`, `assignPieceColors`, `logic/*`. Tampoco se cambian reglas del juego ni el tutorial en su lógica.
- **Sí se puede tocar (sin afectar gameplay):** envoltorios, clases Tailwind, CSS dedicado, SVGs del logo, los `oklch(0.72 0.30 350 / 0.55)` y `oklch(0.65 0.25 25 / 0.55)` del preview de colocación y la sombra de `TriShape` (porque son puramente decorativos, no son colores de pieza/celda).

---

## 1. Dirección estética propuesta

He elegido una dirección pensando en coherencia con la pieza/tablero y el personaje.

### Concepto: "Cuaderno de viaje palestino"

Sensación de cuaderno de viaje / libro ilustrado. Cálido, orgánico, ligeramente hecho a mano, pero con una base moderna y muy legible en pantallas pequeñas. NO arcade, NO neón, NO cristal/líquido.

### Paleta

| Token              | Color        | Uso                                                              |
| ------------------ | ------------ | ---------------------------------------------------------------- |
| `--ts-sand`        | `#F2E6CE`    | Fondo principal (papel envejecido)                                |
| `--ts-sand-2`      | `#E8D6B3`    | Fondo degradado inferior                                         |
| `--ts-cream`       | `#FFF8EC`    | Paneles / tarjetas ("papel" donde se posa la estrella)            |
| `--ts-ink`         | `#2A1F14`    | Texto principal                                                   |
| `--ts-ink-soft`    | `#6B5840`    | Texto secundario, descripciones                                    |
| `--ts-olive`       | `#5C6B3A`    | Color de marca (juntas con el verde de la bandera)                 |
| `--ts-olive-deep`  | `#3B4624`    | Acento oscuro (títulos, bordes de foco)                           |
| `--ts-terracotta`  | `#B5532A`    | Acento cálido (botones primarios, llamada a la acción)            |
| `--ts-terracotta-d`| `#7A3717`    | Sombra/borde inferior de botones                                    |
| `--ts-shadow`      | `rgba(60, 40, 20, 0.18)` | Sombras suaves (papel)                              |
| `--ts-olive-soft`  | `rgba(92, 107, 58, 0.18)` | Anillos de foco, halos                                |

> Decisión deliberada: NO usamos rojo vivo, NO usamos negro puro. El rojo y negro de la bandera ya aparecen en las piezas y se respetan. Los verdes de la bandera también, por lo que el verde oliva de UI debe diferenciarse: lo hago más amarillo/ocre y más saturado hacia el verde pero nunca como `oklch(0.82 0.24 145)` (que es neón).

### Tipografía

- Mantenemos las dos fuentes globales (`--font-display: Bungee`, `--font-sans: Space Grotesk`).
- **Bungee** sigue en títulos de sección y en el logo (le da personalidad).
- En el H1 principal de la landing: **Bungee** pero con color `--ts-ink` y un `text-shadow` estilo "sello" (offset + sombra, sin resplandor).
- Texto corrido: **Space Grotesk** sin cambios.

### Motivos decorativos

- Patrón sutil de "papel" en el fondo: `radial-gradient` muy suave con dos tonos `--ts-sand` / `--ts-sand-2`, sin gradiente neón.
- Opcional (Fase 2, solo si queda tiempo): borde punteado alrededor del tablero para evocar un marco de cuaderno. Lo tratamos como un detalle opcional al final.

---

## 2. Patrón de skin: `.ts-scope` (mismo enfoque que `.e2-scope`)

Eternity II ha resuelto este problema con una clase de ámbito y tokens locales. Vamos a hacer lo mismo para tabers-star.

### 2.1 Nuevo archivo CSS

`src/games/tabers-star/styles.css`

```
@import "../styles.css";   /* solo para asegurar el orden; puede omitirse */

.ts-scope {
  /* tokens */
  --ts-sand: #F2E6CE;
  --ts-sand-2: #E8D6B3;
  --ts-cream: #FFF8EC;
  --ts-ink: #2A1F14;
  --ts-ink-soft: #6B5840;
  --ts-olive: #5C6B3A;
  --ts-olive-deep: #3B4624;
  --ts-terracotta: #B5532A;
  --ts-terracotta-d: #7A3717;
  --ts-shadow: rgba(60, 40, 20, 0.18);
  --ts-olive-soft: rgba(92, 107, 58, 0.18);

  color: var(--ts-ink);
  background:
    radial-gradient(ellipse at 20% 0%, #fff6e0 0%, transparent 55%),
    linear-gradient(180deg, var(--ts-sand) 0%, var(--ts-sand-2) 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

/* Componentes del skin ----------------------------------------------------- */

.ts-card {
  background: var(--ts-cream);
  border: 1px solid rgba(60, 40, 20, 0.18);
  border-radius: 1rem;
  box-shadow:
    0 2px 0 rgba(60, 40, 20, 0.10),
    0 6px 14px var(--ts-shadow);
}

.ts-title {
  font-family: var(--font-display);
  color: var(--ts-ink);
  text-shadow:
    0 1px 0 #fff8e6,
    0 3px 0 rgba(124, 79, 39, 0.18);
}

.ts-heading {
  font-family: var(--font-display);
  color: var(--ts-olive-deep);
  letter-spacing: 0.05em;
}

.ts-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fffdf7;
  background: linear-gradient(180deg, #d2754a, var(--ts-terracotta));
  border: 1px solid var(--ts-terracotta-d);
  box-shadow:
    0 3px 0 var(--ts-terracotta-d),
    0 6px 12px var(--ts-shadow);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
}
.ts-btn:hover { transform: translateY(-1px); }
.ts-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ts-terracotta-d); }
.ts-btn[data-variant="soft"] {
  color: var(--ts-ink);
  background: linear-gradient(180deg, var(--ts-cream), #f0dfc0);
  border-color: #c2a97f;
  box-shadow: 0 3px 0 #c2a97f, 0 6px 12px var(--ts-shadow);
}
.ts-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Tablero (marco de papel) */
.ts-board-frame {
  border: 2px solid var(--ts-olive-deep);
  border-radius: 1.25rem;
  background:
    radial-gradient(ellipse at 50% 50%, #fffaf0 0%, #f3e6c4 100%);
  box-shadow:
    inset 0 0 0 4px var(--ts-cream),
    0 10px 24px var(--ts-shadow);
  padding: 0.75rem;
}
.ts-board-frame[data-highlight="board"] {
  outline: 3px dashed var(--ts-olive);
  outline-offset: 4px;
  animation: ts-pulse 1.6s ease-in-out infinite;
}
@keyframes ts-pulse {
  0%, 100% { outline-color: rgba(92, 107, 58, 0.35); }
  50%      { outline-color: rgba(92, 107, 58, 0.9); }
}

/* Bandeja (tray) */
.ts-tray {
  background: var(--ts-cream);
  border: 1px solid rgba(60, 40, 20, 0.18);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 6px 14px var(--ts-shadow);
}
.ts-tray[data-highlight="tray"] {
  outline: 3px dashed var(--ts-olive);
  outline-offset: 3px;
}

.ts-piece-btn {
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgba(60, 40, 20, 0.22);
  background: #fffaf0;
  transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
  cursor: pointer;
}
.ts-piece-btn:hover {
  border-color: var(--ts-olive);
  transform: translateY(-1px);
}
.ts-piece-btn[data-selected] {
  border: 2px solid var(--ts-olive-deep);
  background: rgba(92, 107, 58, 0.12);
  box-shadow: 0 0 0 4px rgba(92, 107, 58, 0.15);
}
.ts-piece-btn[data-highlight] {
  outline: 3px solid var(--ts-terracotta);
  outline-offset: 2px;
  animation: ts-wiggle 1.2s ease-in-out infinite;
}
@keyframes ts-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-2deg); }
  75%      { transform: rotate(2deg); }
}

.ts-icon-btn {
  height: 2.5rem; width: 2.5rem;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid rgba(60, 40, 20, 0.22);
  background: var(--ts-cream);
  color: var(--ts-ink);
  cursor: pointer;
  transition: border-color 0.1s ease, background 0.1s ease;
}
.ts-icon-btn:hover { border-color: var(--ts-olive); background: #fff; }
.ts-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Tarjeta del tutorial */
.ts-tutorial-card {
  background: var(--ts-cream);
  border: 2px solid var(--ts-olive-deep);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow:
    0 2px 0 #fff8e6,
    0 10px 20px var(--ts-shadow);
}
.ts-tutorial-step {
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--ts-olive-deep);
  background: rgba(92, 107, 58, 0.18);
  color: var(--ts-olive-deep);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.ts-tutorial-step-ok {
  border-color: var(--ts-olive);
  background: rgba(92, 107, 58, 0.3);
  color: var(--ts-olive-deep);
}

/* Banner de solución */
.ts-solution-banner {
  border: 1px solid var(--ts-terracotta);
  background: rgba(181, 83, 42, 0.10);
  color: var(--ts-terracotta-d);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Personaje decorativo */
.ts-mascot {
  position: absolute;
  pointer-events: none;
  user-select: none;
}
.ts-mascot--landing {
  width: 220px; height: auto;
  right: 2rem; top: 6rem;
  transform: rotate(-4deg);
  filter: drop-shadow(0 6px 10px var(--ts-shadow));
}
.ts-mascot--play {
  width: 140px; height: auto;
  right: 1rem; bottom: 6rem;     /* respeta el GameNav inferior */
  transform: rotate(3deg);
  opacity: 0.95;
  filter: drop-shadow(0 4px 8px var(--ts-shadow));
}
@media (max-width: 768px) {
  .ts-mascot--landing { display: none; }
  .ts-mascot--play    { display: none; }   /* el personaje se oculta en móvil para no comer espacio */
}

/* Override de piezas compartidas que aún arrastran neón en el hover */
.ts-scope :where(button, a):focus-visible {
  outline: 3px solid var(--ts-olive);
  outline-offset: 2px;
}
```

### 2.2 Componente del personaje

Nuevo: `src/games/tabers-star/ui/Mascot.tsx`

```tsx
import mascotUrl from "/public/tabers-star/Taber-palestino.png?url";

export function Mascot({ className = "" }: { className?: string }) {
  return (
    <img
      src={mascotUrl}
      alt=""
      aria-hidden
      className={className}
      draggable={false}
    />
  );
}
```

> Nota: en este repo, los assets PNG se referencian con `import logo from "@/assets/...png.asset.json"` (mira `TaberSquareLogo` y `EternityLogo` para confirmarlo al implementar). Si `.asset.json` solo existe para assets en `src/assets/`, podemos (a) mover el PNG a `src/assets/tabers-star/` y crear su `.asset.json`, o (b) usar `import.meta.env.BASE_URL + "tabers-star/Taber-palestino.png"`. Decidimos esto en implementación; el plan asume que la ruta final funciona.

### 2.3 Logo: reescrito sin neón

`src/games/tabers-star/ui/TaberStarLogo.tsx` → estrella de 6 puntas con relleno `--ts-olive`, borde `--ts-olive-deep` y un polígono interior en `--ts-terracotta` (sello). Mismo viewBox, mismo path. La sombra la aporta el envoltorio, no el SVG.

```tsx
<svg viewBox="-12 -12 24 24" className={className} aria-hidden>
  <polygon points={pts.join(" ")} fill="#5C6B3A" stroke="#3B4624" strokeWidth="0.8" />
  <polygon points={innerPts.join(" ")} fill="none" stroke="#B5532A" strokeWidth="0.6" />
</svg>
```

Y quitamos todos los `drop-shadow-[0_0_..._oklch(0.72_0.30_350/0.5)]` que se le pasaban desde los call-sites.

---

## 3. Cambios por archivo

### 3.1 `src/games/tabers-star/pages/LandingPage.tsx`

- Envoltorio raíz con `className="ts-scope min-h-screen"`.
- Importar `../styles.css`.
- Importar `Mascot`.
- Hero:
  - Logo `TaberStarLogo` h-40 w-40 (sin glow).
  - H1 con `className="ts-title text-4xl tracking-widest"` (sin `text-neon-pink`/`text-glow-pink`).
  - Descripción: `text-ts-ink-soft`.
  - CTA "Empezar" con `className="ts-btn"` (reemplaza la pill neón).
- Sección "Cómo jugar": `<section className="ts-card p-6">`, h2 con `ts-heading`, lista de reglas con `text-ts-ink-soft` y marcador `•` en `--ts-olive`.
- Ranking: contenedor `ts-card p-5`, título `ts-heading`. El componente `Ranking` lo seguimos usando, pero **re-escalamos los neones** desde el scope:
  - `.ts-scope [data-rank-title]` → color `var(--ts-olive-deep)`
  - `.ts-scope [data-rank-pos]` → color `var(--ts-terracotta-d)`
  - Para esto añadiremos en `Ranking.tsx` dos `data-*` (`data-rank-title`, `data-rank-pos`) sin alterar el resto, o un wrapper `<div className="ts-scope">` que redefina los selectores. **Decisión: añadir `data-rank-title` / `data-rank-pos` en el componente compartido.** Es no invasivo y compatible con las otras pantallas.
- GameFooter: igual (ya no usa neón).
- Mascot: `<Mascot className="ts-mascot ts-mascot--landing" />` posicionado a la derecha en desktop, oculto en móvil.

### 3.2 `src/games/tabers-star/pages/PlayPage.tsx`

- Envoltorio raíz con `className="ts-scope min-h-screen"`.
- Importar `../styles.css`.
- Importar `Mascot`.
- Header:
  - Logo `TaberStarLogo` h-16 w-16 (sin glow).
  - H1 con `className="ts-title text-2xl sm:text-3xl"`.
  - Link "Mostrar tutorial de nuevo": `text-ts-ink-soft hover:text-ts-olive-deep` con underline punteado.
- Banner de solución: clase `ts-solution-banner` (en vez de border-neon-yellow).
- Tablero:
  - Reemplazar el `border-neon-pink ring-... shadow-...` por `className="ts-board-frame"` + `data-highlight="board"` cuando el tutorial lo pida.
  - Fondo: el gradiente `oklch(0.96 0.02 90) → oklch(0.88 0.04 70)` se mantiene (es el marco de papel). El skin lo preserva porque está dentro del tablero.
- Bandeja (tray):
  - Reemplazar `bg-card border-border` por `ts-tray`. Atributo `data-highlight="tray"` para el tutorial.
  - Botones de rotar/girar: `ts-icon-btn`.
  - Lista de piezas: `ts-piece-btn`. Atributos `data-selected` y `data-highlight` sustituyen a las clases `neon-glow-pink` y `ring-neon-pink shadow-[...]`.
  - `<p className="mt-3 text-xs">` en `text-ts-ink-soft`.
- Acciones: misma estructura, cambiar el highlight del tutorial a un wrapper con `data-highlight="actions"` y definir `.ts-scope [data-highlight="actions"]` con un halo sutil.
- GameNav (inferior):
  - `borderClass="border-ts-olive-deep/40"`.
  - `GameNavButton` colorClass → clases propias del scope (no se tocan los iconos, se cambia el color del texto). En el skin: `.ts-scope [data-nav="hint"] { color: var(--ts-olive); }` etc. Se añade `data-nav` en los call-sites de PlayPage (esos tres `GameNavButton` reciben una `data-nav="hint"|"solution"|"new"`).
  - `GameNavTimer`: en el skin redefinimos con `.ts-scope [data-timer]` para que use `--ts-olive` en lugar de cyan. Como `GameNavTimer` no acepta prop, lo wrapeamos en `<span data-timer>` o cambiamos la clase del contenedor. **Decisión:** añadir `data-timer` en el `GameNavTimer` (cambio no invasivo) + override en `ts-scope`.
  - `GameNavBackLink`: el componente usa `text-muted-foreground hover:text-neon-pink`. Se le añade un `data-nav="back"` y se sobrescribe el hover en el scope.
- WinModal: como usa `WinModal` compartido con neón, hacemos el override desde el scope:
  - `.ts-scope [data-win-modal] .panel` → `ts-card` styles.
  - `.ts-scope [data-win-modal] h2` → `ts-title`.
  - `.ts-scope [data-win-modal] [data-action="primary"]` → `ts-btn`.
  - `.ts-scope [data-win-modal] [data-action="secondary"]` → `ts-btn[data-variant="soft"]`.
  - Esto requiere añadir 3 `data-*` (`data-win-modal`, `data-action="primary"`, `data-action="secondary"`) en `WinModal.tsx` (cambios mínimos y no rompen los otros juegos). Lo mismo para el botón "Solution shown" amarillo → `data-action="warning"`.
- Mascot: `<Mascot className="ts-mascot ts-mascot--play" />` decorativo en la esquina inferior derecha (no en móvil). NO interactúa con el tablero.

### 3.3 `src/games/tabers-star/ui/Tutorial.tsx`

- `bg-black/75 backdrop-blur-[2px]` → mantener el oscurecimiento pero bajamos a `bg-ts-ink/60` y `backdrop-blur-sm` (menos negro, más "tinta").
- Tarjeta: `ts-tutorial-card` en vez de `border-2 border-neon-pink/80 ... shadow-[0_0_35px_oklch(...)]`.
- Badge "Tutorial 1/4": `ts-tutorial-step`.
- Iconos del paso: cambiar a `var(--ts-olive)` / `var(--ts-terracotta)`. Reemplazar `text-green-400` por una variable nueva `--ts-good` (verde olivo saturado) y definirla en el scope.
- Botón "Got it" / "Play now": `ts-btn`.
- Botón de éxito (cuando se completa el paso 4): `ts-tutorial-step-ok`.

### 3.4 `src/games/tabers-star/ui/TriShape.tsx`

- Quitamos la sombra de filtro (`filter: drop-shadow(0 0 6px ${glow})`).
- En su lugar, le añadimos `stroke` más fuerte (blanco 0.7) y un `stroke-linejoin: round` (ya está).
- La sombra "decorativa" la aporta el skin de la bandeja (un halo suave) en vez de un glow rosa.

> **Decisión delicada:** si quitamos el `drop-shadow` por completo, la pieza negra pierde distinción. Solución: en `TriShape`, si `fallbackColor` es negra, en lugar del glow rosa aplicamos un `filter: drop-shadow(0 2px 0 rgba(0,0,0,0.4))` (sombra de papel, no neón). Con eso la pieza contrasta con el fondo crema sin volver al neón.

### 3.5 `src/games/tabers-star/ui/DiceRollAnimation.css`

- Los 3 sitios con `var(--neon-cyan, #06b6d4)` + text-shadow cian y los `border: 1px solid rgba(244, 114, 182, 0.35)` se sustituyen por la paleta del skin:
  - Texto de dado D6: color `var(--ts-olive-deep)` con `text-shadow: 0 1px 0 #fff8e6, 0 2px 0 rgba(60,40,20,0.25)` (estilo sello).
  - Texto de dado D8: color `var(--ts-terracotta-d)` con la misma sombra.
  - Borde de caras D8: `border: 1px solid rgba(124, 79, 39, 0.45)` (marrón de tinta).
- Los `radial-gradient` oscuros de las caras (`#3d2f52 → #171124`) se reemplazan por gradientes cálidos que encajen con la paleta: `#f3e6c4 → #d8c391` y `#e8d6b3 → #c0a878` alternos. El cubo de dados debe verse como "dado de madera / hueso" sobre el papel, no como "dado neón sobre negro".

### 3.6 `src/games/tabers-star/ui/DiceRollAnimation.tsx`

- Sin cambios de lógica. Solo asegurar que la prop/estructura siga usando las clases CSS del nuevo skin.

### 3.7 `src/games/tabers-star/ui/TaberStarLogo.tsx`

- Reescrito: rellenos `--ts-olive` y `--ts-terracotta`, sin gradiente.
- Quitamos el `id="taber-star-grad"` (ya no hay gradiente) para evitar el bug de ID duplicado que existía.

### 3.8 `src/games/tabers-star/manifest.tsx` (Card del home)

- Esta `Card` se renderiza en la home junto a las otras. **Decisión:** la home mantiene su look general, por lo que el card del tabers-star sigue usando la tarjeta "neutra" (sin neón rosa).
- Cambios:
  - `hover:border-neon-pink` → `hover:border-ts-olive` (pero como la Card está fuera del scope `.ts-scope`, definimos las clases con un prefijo `ts-` o directamente en el manifest).
  - El halo del hover: `style={{ background: "var(--neon-pink)" }}` → `style={{ background: "var(--ts-olive)" }}` (declarando `var(--ts-olive)` en el manifest con valores hardcoded, para no depender del scope en home).
  - `text-neon-pink` en tag y CTA → `text-ts-olive-deep`.
  - `drop-shadow-[0_0_20px_oklch(...)]` del logo: quitado.
- El logo que se muestra en la Card ahora se construye con los nuevos colores (es el mismo `TaberStarLogo` reescrito, así que no hay doble configuración).

> **Trade-off explícito:** el card en la home queda con un look "papel + oliva" que rompe con el neón del resto de la home. Es coherente con tu petición de "que no tengan nada que ver con el diseño neón", pero si prefieres mantener el card en home con neón, lo dejamos con clases `text-neon-pink` y solo cambiamos logo/halo. **Confirmar antes de implementar.**

### 3.9 Cambios mínimos en componentes compartidos (justificados, pequeños)

Para que el skin funcione sin duplicar componentes, necesitamos `data-*` en:

- `src/platform/scores/Ranking.tsx`: añadir `data-rank-title` al `<h3>` y `data-rank-pos` al `<span>` del número.
- `src/platform/kit/WinModal.tsx`: añadir `data-win-modal` al overlay, `data-action="primary|secondary|warning"` a los botones.
- `src/platform/layout/GameNav.tsx`: añadir `data-timer` al `GameNavTimer`, `data-nav="..."` se lo pasa PlayPage como prop opcional.

Estos son cambios no invasivos: cambian un `className` o un atributo, no la lógica. La home/eternity-ii/taber-square siguen idénticos porque sus scopes no redefinen esos selectores.

---

## 4. Lo que NO cambia

- `src/games/tabers-star/logic/*` (todo).
- `src/games/tabers-star/i18n/*` (los textos siguen siendo válidos; opcionalmente se podría añadir una frase introductoria del personaje, pero no es necesario para el rediseño).
- `src/games/tabers-star/ui/types.ts` (la definición `PieceState` se mantiene).
- Colores de pieza y tablero (los `fill` de los `<polygon>` se calculan con `placedPieceColorsMap` / `getCellColor` y no se tocan).
- `SiteHeader` y `GameFooter` (siguen con su look). El usuario eligió "Solo dentro de las páginas tabers-star".
- `Tutorial.tsx` en su flujo/pasos.
- `DiceRollAnimation.tsx` en su estructura.

---

## 5. Plan de implementación (orden)

1. Crear `src/games/tabers-star/styles.css` con todos los tokens y componentes `.ts-*` (§2.1).
2. Reescribir `TaberStarLogo.tsx` sin neón (§2.3).
3. Crear `Mascot.tsx` (§2.2) y resolver la ruta del PNG.
4. Reescribir `Tutorial.tsx` y `TriShape.tsx` (§3.3, §3.4).
5. Actualizar `DiceRollAnimation.css` (§3.5).
6. Añadir `data-*` en componentes compartidos (`Ranking`, `WinModal`, `GameNav`) (§3.9).
7. Reescribir `LandingPage.tsx` con `.ts-scope`, CTA `ts-btn`, tarjeta `ts-card`, Mascot (§3.1).
8. Reescribir el JSX del `PlayPage.tsx` con `.ts-scope`, `ts-board-frame`, `ts-tray`, `ts-piece-btn`, `ts-icon-btn`, `data-nav` en GameNavButton, Mascot (§3.2).
9. Actualizar `manifest.tsx` (Card) (§3.8).
10. `npm run build && npm run lint && npx vitest run src/games/tabers-star` para validar.

---

## 6. Riesgos y preguntas abiertas

1. **Personaje en home vs. en play:** confirmado "Landing + Play (decorativo)". En móvil el personaje se oculta (no hay sitio).
2. **Card del home con look tabers-star:** rompe la coherencia visual de la home. Si prefieres dejarlo con neón, lo mantenemos. **Decisión a confirmar.**
3. **Ruta del PNG:** confirmado en `public/tabers-star/Taber-palestino.png`. Si el bundler lo necesita como asset, lo movemos a `src/assets/tabers-star/` y creamos su `.asset.json`. Lo intento primero con la ruta pública directa y, si falla, lo muevo.
4. **Sonidos y animaciones:** no se tocan.
5. **Tamaño del personaje:** el plan propone 220px en landing y 140px en play. Ajustable en implementación si la composición lo pide.
6. **Banderines verdes del skin vs. verdes de las piezas:** si el verde oliva de la UI (`#5C6B3A`) se confunde con el verde bandera (`#228B22`) cuando la pieza está sobre un panel crema, se baja la saturación de la UI a `#6B7A4A` o `#7A8A4F` para diferenciarlo. Decisión de implementación.

---

## 7. Verificación

- Build OK, lint OK, tests tabers-star OK (9/9).
- Comprobación visual: el color de la bandera palestina sigue apareciendo correctamente al colocar las 7 piezas en su sitio (no se ha tocado `placedPieceColorsMap`).
- El personaje se ve en landing y play (desktop) y se oculta en móvil.
- La home, eternity-ii y taber-square mantienen exactamente su aspecto actual.
