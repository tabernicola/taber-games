import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { LEVELS } from "./levels";
import {
  DEFAULT_LEVEL_TIME_LIMIT_SECONDS,
  GRID_COLS,
  GRID_ROWS,
  type LevelDef,
} from "./types";

export const ALLOWED_MAP_CHARS = new Set(["#", ".", "~", "V", "P", "E", "B", "C", "M"]);
export const TABERNICLE_LEVELS_QUERY_KEY = ["tabernicle-levels"] as const;

export interface LoadedLevelsResult {
  levels: LevelDef[];
  overriddenIds: number[];
}

/**
 * Validates a Tabernicle Cubicle level definition before saving or playing.
 * Returns a list of human-readable Spanish error messages (empty when valid).
 */
export function validateLevelDef(def: LevelDef): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(def.id) || def.id < 1) {
    errors.push("El ID del nivel debe ser un entero positivo.");
  }
  if (!def.name.es.trim()) {
    errors.push("El nombre en castellano es obligatorio.");
  }
  if (!Number.isInteger(def.maxCreatures) || def.maxCreatures < 0 || def.maxCreatures > 20) {
    errors.push("El máximo de criaturas debe estar entre 0 y 20.");
  }
  if (!Number.isFinite(def.volcanoCooldown) || def.volcanoCooldown <= 0) {
    errors.push("El tiempo entre erupciones del volcán debe ser mayor que 0.");
  }
  const timeLimit = def.timeLimitSeconds ?? DEFAULT_LEVEL_TIME_LIMIT_SECONDS;
  if (!Number.isFinite(timeLimit) || timeLimit < 10 || timeLimit > 600) {
    errors.push("El tiempo límite debe estar entre 10 y 600 segundos.");
  }

  if (def.map.length !== GRID_ROWS) {
    errors.push(`El mapa debe tener exactamente ${GRID_ROWS} filas.`);
    return errors;
  }

  let players = 0;
  let eggs = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = def.map[r] ?? "";
    if (row.length !== GRID_COLS) {
      errors.push(`La fila ${r + 1} debe tener ${GRID_COLS} columnas.`);
      continue;
    }
    for (let c = 0; c < GRID_COLS; c++) {
      const ch = row[c] ?? "";
      if (!ALLOWED_MAP_CHARS.has(ch)) {
        errors.push(`Carácter no válido "${ch}" en (${r + 1}, ${c + 1}).`);
      } else if (ch === "P") {
        players++;
      } else if (ch === "E") {
        eggs++;
      }
    }
  }

  if (players !== 1) {
    errors.push(`Debe haber exactamente 1 posición de inicio de Taber (hay ${players}).`);
  }
  if (eggs < 1) {
    errors.push("Debe haber al menos 1 huevo de dinosaurio (E).");
  }
  return errors;
}

/**
 * Merges database level overrides onto the built-in default LEVELS list.
 * Preserves built-in order and appends any extra custom levels sorted by id.
 */
export function mergeLevels(overrides: LevelDef[], base: LevelDef[] = LEVELS): LevelDef[] {
  const byId = new Map<number, LevelDef>();
  for (const lvl of base) byId.set(lvl.id, lvl);
  for (const ov of overrides) byId.set(ov.id, ov);
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
}

/**
 * Fetches all saved level overrides from Supabase and merges them with defaults.
 */
export async function fetchTabernicleLevels(): Promise<LoadedLevelsResult> {
  const { data, error } = await supabase
    .from("tabernicle_levels")
    .select("level_id, definition")
    .order("level_id", { ascending: true });

  if (error) {
    throw error;
  }

  const overrides: LevelDef[] = [];
  const overriddenIds: number[] = [];
  for (const row of data ?? []) {
    const def = row.definition as unknown as LevelDef;
    if (def && typeof def === "object" && Array.isArray(def.map)) {
      overrides.push({ ...def, id: row.level_id });
      overriddenIds.push(row.level_id);
    }
  }

  return { levels: mergeLevels(overrides), overriddenIds };
}

/**
 * Validates and upserts a level definition into Supabase (admin-only via RLS).
 */
export async function saveTabernicleLevel(def: LevelDef): Promise<void> {
  const errors = validateLevelDef(def);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  const { error } = await supabase.from("tabernicle_levels").upsert(
    {
      level_id: def.id,
      definition: def as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "level_id" },
  );
  if (error) throw error;
}

/**
 * Removes a saved level override from Supabase so the level reverts to its default.
 */
export async function resetTabernicleLevel(levelId: number): Promise<void> {
  const { error } = await supabase
    .from("tabernicle_levels")
    .delete()
    .eq("level_id", levelId);
  if (error) throw error;
}

/**
 * React Query hook returning the merged Tabernicle Cubicle levels (with instant fallback to defaults).
 */
export function useTabernicleLevels() {
  return useQuery({
    queryKey: TABERNICLE_LEVELS_QUERY_KEY,
    queryFn: fetchTabernicleLevels,
    placeholderData: { levels: LEVELS, overriddenIds: [] },
    staleTime: 60_000,
  });
}