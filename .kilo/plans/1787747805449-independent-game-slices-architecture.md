# Arquitectura de slices independientes por juego — Taber Games

## Problema actual

La lógica ya está separada en `src/lib/{tabersquare,taberstar,eternity2}` y los componentes en `src/components/{...}`, pero el "juego" como unidad está disperso en 3 directorios y acoplado a la plataforma:

1. **Rutas-monolito**: cada `play.tsx` (~700–800 líneas) mezcla motor de estado, drag & drop, selector de niveles, tutorial y modal de victoria.
2. **i18n centralizado**: `src/lib/i18n.tsx` mezcla cadenas de todos los juegos (`game.*`, `e2.*`, `star.*`). Añadir un juego exige editar el fichero central en 3 idiomas.
3. **Plataforma que conoce juegos concretos**: `Ranking.tsx` hardcodea `taberSquareLevelMap`; `lib/scores.ts` centraliza el union `GameId`; la home importa logos/componentes de cada juego.
4. **Bug real de BD**: la política RLS de INSERT en `public.scores` solo permite `('taber-square','eternity-ii')` pero el código envía `'taber-star'` → esos envíos fallan en silencio.

## Decisiones tomadas (con el usuario)

| Decisión                | Elección                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Estructura física       | Slices autocontenidos en el mismo repo (`src/games/<slug>/`), sin monorepo ni apps separadas                         |
| Mecánicas comunes       | Kit compartido en capa `platform`; los juegos dependen de platform, nunca entre sí                                   |
| Timing del kit          | Extraer a `platform/kit` solo al migrar el 2º consumidor (Star); el piloto mueve código sin abstracciones prematuras |
| Estrategia              | Incremental, un juego cada vez, app siempre funcional                                                                |
| Scores                  | Tabla separada por juego vía migración SQL                                                                           |
| Datos existentes        | Copiar filas de `public.scores` a las nuevas tablas; conservar la antigua como backup                                |
| Aplicación de migración | Vía Lovable (el agente solo genera el `.sql`)                                                                        |

## Naming canónico

| Juego            | URL                       | Slice                        | Tabla scores          |
| ---------------- | ------------------------- | ---------------------------- | --------------------- |
| The Taber Square | `/$lang/the-taber-square` | `src/games/taber-square/`    | `scores_taber_square` |
| The Taber's Star | `/$lang/the-tabers-star`  | `src/games/tabers-star/`     | `scores_tabers_star`  |
| Taber's Eternity | `/$lang/eternity-ii`      | `src/games/eternity-ii/`     | `scores_eternity_ii`  |
| The Taber Study  | externo (`base44.app`)    | entrada externa del registry | —                     |

## Estructura destino

```
src/
  platform/                  # agnóstico: PROHIBIDO importar de games/*
    i18n/                    # motor + diccionario core
    scores/createScoresService.ts · formatTime.ts
    storage.ts · seo.ts
    hooks/                   # useTimer, useSoundEffects, useKeyboardShortcuts, useAuth, use-mobile
    kit/                     # (fase Star) BoardGrid, PieceTray, usePieceDragDrop,
                             #   rotate/flip helpers, WinModal, TutorialShell, LandingShell
    layout/                  # SiteHeader, GameNav, GameFooter, CookieBanner, LanguageSwitcher
    games/
      types.ts               # contrato GameModule / ExternalGameEntry
      registry.ts            # registro; único punto que importa manifests
  games/
    taber-square/
      manifest.ts            # GameModule completo
      logic/                 # ex lib/tabersquare + tests
      ui/                    # ex components/tabersquare + piezas extraídas de play.tsx
      pages/                 # LandingPage.tsx, PlayPage.tsx (sin createFileRoute)
      i18n/{eu,es,en}.ts     # claves square.* + game.level*/title/desc + tutorial.tabersquare.*
    tabers-star/ · eternity-ii/   # ídem
  routes/                    # ficheros finos de TanStack Router: head() + delegación al slice
```

### Contrato `GameModule`

```ts
export interface GameModule {
  id: string; // "taber-square"
  Card: ComponentType<GameCardProps>; // tarjeta de la home (con sus propios textos i18n)
  translations: Record<Lang, Dict>;
  createScoresService: () => ScoresService; // ligado a su tabla
  formatLevelLabel(level: number): string; // "Starter", "4×4", "★"
}
export interface ExternalGameEntry {
  id: string;
  href: string;
  Card: ComponentType<GameCardProps>;
}
```

## Reparto de claves i18n

- **Core (platform)**: `nav.*`, `home.*` (excepto textos de tarjetas), `common.*`, `landing.*`, `rank.*`, `score.*`, `auth.*`, `cookies.*` + vocabulario compartido por Square/Star/E2 verificado con grep: `game.{rotate,flip,pieces,pickPiece,hint,solution,hideSolution,solutionShown,new,solved,solvedDesc,playAgain,nextLevel,close,hintBtn,hintUsed}` y `tutorial.{next,skip,restart,close,autoClose,completed,showAgain,title,intro,interactive.correct}` → pertenecen al kit.
- **Por juego**: `square.rule*`, `star.*`, `e2.*`, textos de tarjetas `home.card.*`, y lo específico de square (`game.title/desc/level*/levelInfo/levelChoose/levelLocked/unlockedNextLevel`, `tutorial.tabersquare.*`).
- **Fusión**: `registry.ts` construye `Record<Lang, Dict>` combinando core + manifests y se pasa a `I18nProvider` como prop `extra`. Fallback sin cambios (`lang → en → clave`). Test de vitest que falla si hay claves duplicadas entre diccionarios.

## Tareas ordenadas

### Fase 0 — Fundaciones (app verde tras cada paso)

1. Crear `src/platform/` y mover código compartido: `lib/{storage,seo}`, `formatTime`, motor de i18n (sin diccionarios de juegos), `hooks/*`, layout. Actualizar imports.
2. `platform/games/types.ts` + `registry.ts`. Home renderiza desde registry con las tarjetas actuales inline (se externalizan por juego en su fase).
3. Reglas ESLint: prohibir imports `@/games/X` desde `@/games/Y` y prohibir que `platform/` importe de `games/`.

### Fase 1 — Base de datos

4. Migración `supabase/migrations/<timestamp>_per_game_score_tables.sql` (solo se genera; se aplica vía Lovable):
   - 3 tablas con el mismo esquema menos `game` (`level` se queda TEXT para compatibilidad con los datos existentes).
   - `INSERT INTO … SELECT … FROM public.scores WHERE game = '<id>'` para cada una.
   - Índice `(level, seconds)`; grants SELECT/INSERT a `anon`/`authenticated`; RLS con CHECK por tabla: nombre 1–24 chars, `seconds BETWEEN 1 AND 999999`; niveles válidos por juego: square `IN ('1'..'5')`, star `= '1'`, e2 `IN ('4','6','8','12','16')`.
   - `public.scores` intacta (backup).
5. `platform/scores/createScoresService(table)` con `fetchTop(level?)` / `submit(level, name, seconds)`. Eliminar union `GameId`.
6. **Orden de despliegue**: migración aplicada en Lovable ANTES de desplegar el cambio de código. Rollback: revertir los commits de este cambio de código (la migración es inocua).

### Fase 2 — Piloto: The Taber Square (mover, no abstraer)

7. Crear slice: mover `lib/tabersquare → logic/`, `components/tabersquare → ui/`.
8. Extraer `play.tsx` dentro del slice: `pages/PlayPage.tsx` + `ui/WinModal`, `ui/LevelSelector`, hook local de drag&drop. Rutas `routes/$lang/the-taber-square/{index,play}.tsx` quedan como wrappers finos.
9. Mover claves del juego a `i18n/{eu,es,en}.ts` del slice; provider acepta `extra`.
10. `manifest.ts`: Card con logo, traducciones, `formatLevelLabel` (mapa 1..5→starter..wizard), servicio sobre `scores_taber_square`. Adaptar `ScoreForm`/`Ranking` a props (`service`, `formatLevelLabel`). Registrar en registry.

### Fase 3 — The Taber's Star (aquí sí, extraer kit)

11. Migrar slice igual que el piloto.
12. Al encontrar el 2º consumidor, subir a `platform/kit` lo genérico de Square+Star: primitivas de tablero/bandeja, drag&drop, rotar/flip, WinModal, `TutorialShell` (usa `tutorial.*` base) y `LandingShell` (usa `landing.*`). Refactorizar Square sobre el kit. Tests del kit en platform.

### Fase 4 — Taber's Eternity

13. Migrar slice + mover su acceso a `eternity_saves` dentro del slice. Generalizar el copy de auth en platform (hoy menciona "Taber's Eternity").

### Fase 5 — Home y limpieza

14. Home 100% registry-driven (incluye entrada externa de The Taber Study); `home.available {n}` deriva del registro (hoy hardcodea 4).
15. Borrar `lib/{tabersquare,taberstar,eternity2}`, `components/{...}` antiguos y residuos de `GameId`; `routeTree.gen.ts` se regenera solo (no editar a mano).

## Restricciones

- **Lovable**: no reescribir historial publicado; cada fase = commits separados con lint/test/build en verde.
- **No renombrar claves de localStorage ni query keys** de React Query (`["scores", …]`) durante la mudanza: rompería progreso de jugadores y cachés.
- La migración es manual vía Lovable: coordinarla con el deploy del cambio de código.

## Validación

- Tras cada fase: `bun run lint`, `bun test`, `bun run build`.
- Por juego: victoria → envío de puntuación → visible en ranking (INSERT bajo RLS contra tabla nueva); cambio de idioma en todas las páginas; repetir tutorial; en E2 guardar/cargar partida con cuenta; progreso de niveles previo se conserva.
- Code-splitting: en `build`, verificar que el chunk de cada `/play` solo arrastra lógica de su slice (p. ej. el solver de square no aparece en el bundle de star).
- Dependencias: `rg "@/games/" src/platform` vacío; ningún import cruzado entre slices.

## Fuera de alcance

Monorepo/packages, despliegues por juego, tabla genérica de saves, reescritura visual de páginas, nuevos sonidos del kit.
