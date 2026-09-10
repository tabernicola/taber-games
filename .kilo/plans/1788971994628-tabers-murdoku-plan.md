# Plan: Tabers Murdoku — Mobile-First Deduction Game with UGC

## Contexto del Codebase Existente

El proyecto usa **TanStack Start** (Vite + React + TypeScript + Tailwind), **TanStack Router** (file-based routing), **Supabase** (auth + DB), y **TanStack Query**. No usa Next.js ni Zustand.

Cada juego sigue este patrón:
- `src/games/<name>/manifest.tsx` → exporta `GameModule` (id, Card, translations, createScoresService, formatLevelLabel)
- `src/games/<name>/i18n/{en,es,eu,index.ts}` → diccionarios de traducción
- `src/games/<name>/logic/` → reglas de juego + tests
- `src/games/<name>/pages/{LandingPage,PlayPage}.tsx` → páginas del juego
- `src/games/<name>/ui/` → componentes UI
- Rutas: `src/routes/$lang/<route>/` con `index.tsx` (landing) y `play.tsx` (game)
- Registro: `src/platform/games/registry.ts` importa el manifest
- Plataforma: `src/platform/` (layout, i18n, scores, hooks, kit) + `src/integrations/supabase/` (cliente existente)

Supabase ya está integrado con: cliente público (`client.ts`), cliente admin server-side (`client.server.ts`), middleware de auth (`auth-middleware.ts`), hook `useAuth` (`platform/hooks/useAuth.ts`), tipos generados (`types.ts`).

## Decisiones de Arquitectura

### 1. Adaptar el plan al stack real
- **No** usar Next.js → usar TanStack Start (ya instalado). Framework ya está configurado.
- **No** crear `src/lib/supabaseClient.ts` → reutilizar `@/integrations/supabase/client` (ya existe).
- **No** instalar Zustand → usar React hooks (`useReducer`/`useState`) + `useAuth` para el estado de la partida.
- **No** crear `src/components/{mobile,creator,admin}/` → seguir el patrón del juego: `src/games/murdoku/`.

### 2. Estructura del juego (alineada al codebase)
```
src/games/murdoku/
├── manifest.tsx              # GameModule export  ← REGISTRAR en registry.ts
├── i18n/
│   ├── index.ts
│   ├── en.ts
│   ├── es.ts
│   └── eu.ts
├── logic/
│   ├── game.ts               # Tipos del caso, validación de solución, verificación de aciertazo
│   └── game.test.ts          # Tests de lógica
├── components/
│   ├── MurdokuGame.tsx       # Componente principal con bottom tabs (Mapa | Pistas | Libreta)
│   ├── BottomNavigation.tsx  # Tab bar fija inferior
│   ├── MapView.tsx           # Vista escena con fichas de sospechosos
│   ├── CluesView.tsx         # Lista de pistas con tachado
│   ├── DeductionGrid.tsx     # Libreta de deducción (✔️/❌)
│   ├── AccusationModal.tsx   # "Resolver / Acusar" modal
│   ├── CaseEditor.tsx        # Asistente de creación paso a paso
│   └── AdminPanel.tsx        # Panel de moderación (pending_review → approved/rejected)
└── data/
    └── gameSchema.ts         # Tipos TypeScript del caso + estado de juego
```

### 3. Rutas (TanStack Router, patrón existente)
```
src/routes/$lang/murdoku/
├── index.tsx                 # LandingPage (lista de casos aprobados + CTA "Crear caso")
├── play.tsx                  # PlayPage (juego activo con bottom tabs)
├── create.tsx                # CaseEditor (requiere auth)
└── admin.tsx                 # AdminPanel (requiere auth + rol admin)
```

### 4. Independencia entre juegos
El juego vive completamente en `src/games/murdoku/`. Solo importa de `@/platform/` (i18n, layout, hooks) e `@/integrations/supabase/`. **No importa de otros juegos**, siguiendo el contrato del comentario en `types.ts:13`: "Games never import each other."

## Cambios en la Plataforma (mínimos)

### A. `src/platform/games/types.ts`
- No cambios estructurales. El `GameModule` interface ya es genérico.

### B. `src/platform/games/registry.ts`
- Importar y registrar `murdokuGame` en el array `games`.

### C. `src/platform/scores/createScoresService.ts`
- Ampliar `ScoreTable` con `"scores_murdoku"` si se implementan rankings de velocidad (opcional — Murdoku no necesita ranking de tiempos por ser deducción, pero se puede registrar para consistencia con el `GameModule`).

### D. `src/platform/layout/GameNav.tsx`
- Ampliar el tipo `LangRoute` con `"/$lang/murdoku"`.

### E. `src/integrations/supabase/types.ts`
- Añadir tabla `murdoku_cases` al esquema `Database.public.Tables`.

## Fase 1: Backend (Supabase)

### Tabla `murdoku_cases`
```sql
id          UUID PK (default gen_random_uuid())
title       TEXT NOT NULL
creator_id  UUID REFERENCES auth.users REFERENCES profiles
status      TEXT CHECK (status IN ('draft','pending_review','approved','rejected'))
content     JSONB  -- { suspects, weapons, rooms, solution, clues[] }
rejection_note TEXT (nullable)
created_at  TIMESTAMP DEFAULT now()
updated_at  TIMESTAMP DEFAULT now()
```

### Tipos en `types.ts`
Añadir a `Database.public.Tables.murdoku_cases` con Row/Insert/Update.

### Cliente
Reutilizar `supabase` (cliente público) para lecturas/escrituras con RLS, y `supabaseAdmin` (client.server.ts) para el endpoint de admin que aprueba/rechaza casos.

### Auth
Reutilizar `useAuth` hook + `useSupabaseGuard` pattern (ver `src/platform/hooks/`). El `CaseEditor` y `AdminPanel` usan `useAuth` para verificar sesión.

## Fase 2: Lógica del Juego

### `src/games/murdoku/logic/game.ts`
- Tipos: `Case`, `Suspect`, `Weapon`, `Room`, `Clue`, `Solution`, `CaseStatus`
- Función `validateSolution(caseContent)` — verifica que la solución es consistente con las pistas
- Función `checkGuess(suspect, weapon, room, solution)` — compara acusación con solución
- Función `isCaseSolvable(content)` — verificación básica de resolubilidad

### `src/games/murdoku/data/gameSchema.ts`
- Re-export de tipos desde `logic/game.ts` (mantener separado por claridad del plan original)
- `MurdokuCase` interface que define la estructura del JSONB de Supabase

### Tests (`game.test.ts`)
- Validación de solución correcta/incorrecta
- Consistencia de casos
- Edge cases (solución parcial, múltiples soluciones)

## Fase 3: UI Mobile-First

### BottomNavigation.tsx
- 3 tabs: Mapa | Pistas | Libreta
- Barra fija inferior con `safe-area-inset-bottom`
- Integrado con `GameNav` existente (o reemplazándolo en la play page)

### MapView.tsx
- Cuadrícula o ambiente visual
- Fichas táctiles de sospechosos que se arrastran/colocan
- Optimizado para pantallas pequeñas

### CluesView.tsx
- Lista vertical de pistas
- Tap → tacha (efecto `line-through`)
- Estado local manejado por `MurdokuGame`

### DeductionGrid.tsx
- Grid Sospechosos vs Lugares + Sospechosos vs Objetos
- Celdas grandes táctiles: [Vacío] → ❌ → ✔️ → [Vacío]
- Alternar con `useState` o `useReducer`

### AccusationModal.tsx
- Botón "Resolver / Acusar" en el header (sticky)
- Modal con selects de sospechoso/objeto/lugar
- Feedback: correcto → WinModal, incorrecto → game over

### MurdokuGame.tsx (componente orquestador)
- Estado: active case, clues read state, deduction grid marks, guess result
- Maneja el tab activo y pasa callbacks a los subcomponentes

## Fase 4: UGC — CaseEditor

### Flujo de creación paso a paso
1. **Paso 1**: Tema, sospechosos (nombres + avatar/emoji), lugares, armas
2. **Paso 2**: Solución correcta (quién, dónde, qué arma)
3. **Paso 3**: Pistas de lógica (texto libre + tipo de pista)
4. Submit → `status = 'pending_review'` en Supabase

### Componentes
- `CaseEditor.tsx`: wizard con `react-hook-form` + `zod` (ya instalados en el proyecto)
- Campos: `title`, suspects[], weapons[], rooms[], solution, clues[]
- Validación: solución debe usar exactamente un elemento de cada categoría
- Submit requiere `useAuth` (usuario autenticado)

## Fase 5: Admin Panel

### Ruta `admin.tsx`
- Protegida: requiere `useAuth` + chequeo de rol (RLS o chequeo en cliente)
- Lista de casos con `status = 'pending_review'`
- Para cada caso: botón "Probar" (renderiza el juego en modo test), "Aprobar", "Rechazar"

### Flujo
1. Admin ve lista de casos pendientes
2. Click "Probar" → abre el juego con el caso (modo sandbox, sin timer/scores)
3. Click "Aprobar" → `status = 'approved'` (visible públicamente)
4. Click "Rechazar" → modal con campo de nota → `status = 'rejected'` + `rejection_note`

### Endpoint de servidor
- Usar TanStack Start server functions con `supabaseAdmin` (client.server.ts) para mutaciones de admin
- `approveCase(caseId)`, `rejectCase(caseId, note)`

## Fase 6: Rutas y Registro

### Rutas (`/src/routes/$lang/murdoku/`)
- `index.tsx`: LandingPage — muestra casos aprobados en un carrusel/lista, CTA "Crear caso"
- `play.tsx`: PlayPage — juego activo (Mapa/Pistas/Libreta tabs + acusación)
- `create.tsx`: CaseEditor — wizard de creación (requiere auth)
- `admin.tsx`: AdminPanel — moderación (requiere auth + rol)

### Registry (`registry.ts`)
```typescript
import { murdokuGame } from "@/games/murdoku/manifest";
export const games: GameModule[] = [tabersStarGame, eternityIIGame, taberSquareGame, murdokuGame];
```

### Manifest (`manifest.tsx`)
```typescript
export const murdokuGame: GameModule = {
  id: "murdoku",
  Card,  // Card con logo + descripción traducida
  translations,
  createScoresService: () => createScoresService("scores_murdoku"),  // opcional
  formatLevelLabel: () => "🕵️",  // murdoku no usa levels tradicionales
};
```

## Fase 7: i18n

### Archivos de traducción
- `i18n/en.ts`, `i18n/es.ts`, `i18n/eu.ts` → diccionarios de juego
- Keys: `home.card.murdoku.tag`, `home.card.murdoku.desc`, `murdoku.*`, `admin.*`, `creator.*`
- Core translations (en `dict-core.ts`) se añaden para `home.card.murdoku.*` si se quiere que aparezca en el home

## Validación

1. **`npm run lint`** — ESLint pasa sin errores
2. **`npm run build`** — Build de Vite completado
3. **`npm test`** — Tests de lógica (`game.test.ts`) pasan
4. **Type check implícito** — TypeScript compila sin errores
5. **Integridad de plataforma** — Juegos existentes siguen funcionando, el carousel muestra el nuevo juego

## Riesgos y Consideraciones

| Riesgo | Mitigación |
|--------|------------|
| Juego "muy complejo" para los 5 prompts | Dividir en subagentes: uno por cada fase |
| RLS de Supabase para admin | Usar `supabaseAdmin` (service role) en server functions para mutaciones |
| Tipos Supabase desincronizados | Regenerar types con `supabase gen typescript` después de crear la tabla |
| Mobile-first vs. desktop | Tailwind breakpoints (`sm:`, `md:`) para responsive |
| Independencia de juegos | Todo el código de murdoku en `src/games/murdoku/`, solo imports de `@/platform/` y `@/integrations/` |

## Tareas (orden de ejecución)

1. **Crear tabla `murdoku_cases` en Supabase** + tipos en `types.ts`
2. **Ampliar tipos platform** (`ScoreTable`, `LangRoute`)
3. **Crear estructura `src/games/murdoku/`** con lógica, tipos y tests
4. **Crear i18n** (en, es, eu)
5. **Crear UI móvil** (BottomNavigation, MapView, CluesView, DeductionGrid, AccusationModal)
6. **Crear manifest.tsx** y registrar en `registry.ts`
7. **Crear rutas** (`index.tsx`, `play.tsx`, `create.tsx`, `admin.tsx`)
8. **Crear CaseEditor** con react-hook-form + zod
9. **Crear AdminPanel** con server functions para aprobar/rechazar
10. **Lint + build + test**
