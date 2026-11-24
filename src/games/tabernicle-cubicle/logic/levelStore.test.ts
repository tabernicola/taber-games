import { describe, expect, it } from "vitest";
import { LEVELS } from "./levels";
import { mergeLevels, validateLevelDef } from "./levelStore";
import type { LevelDef } from "./types";

function cloneFirst(): LevelDef {
  const first = LEVELS[0]!;
  return {
    ...first,
    name: { ...first.name },
    hint: first.hint ? { ...first.hint } : undefined,
    map: [...first.map],
  };
}

describe("validateLevelDef", () => {
  it("accepts all built-in levels", () => {
    for (const lvl of LEVELS) {
      expect(validateLevelDef(lvl)).toEqual([]);
    }
  });

  it("rejects a level without a player start", () => {
    const lvl = cloneFirst();
    lvl.map = lvl.map.map((row) => row.replace("P", "."));
    const errors = validateLevelDef(lvl);
    expect(errors.some((e) => e.includes("Taber"))).toBe(true);
  });

  it("rejects a level without any eggs", () => {
    const lvl = cloneFirst();
    lvl.map = lvl.map.map((row) => row.replace("E", "."));
    const errors = validateLevelDef(lvl);
    expect(errors.some((e) => e.includes("huevo"))).toBe(true);
  });

  it("rejects negative maxCreatures and invalid map dimensions", () => {
    const lvl = cloneFirst();
    lvl.maxCreatures = -1;
    lvl.map = lvl.map.slice(0, 5);
    const errors = validateLevelDef(lvl);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("mergeLevels", () => {
  it("overrides a built-in level by id while keeping others intact", () => {
    const edited = cloneFirst();
    edited.name.es = "Fase 1 Editada";
    const merged = mergeLevels([edited]);
    expect(merged.length).toBe(LEVELS.length);
    expect(merged[0]?.name.es).toBe("Fase 1 Editada");
    expect(merged[1]?.id).toBe(LEVELS[1]?.id);
  });
});