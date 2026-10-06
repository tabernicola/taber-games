import { describe, expect, it } from "vitest";
import { LEVEL_WITHOUT_CHARACTER, characterForLevel } from "./levelCharacters";
import { TABERDOKU_TOTAL_LEVELS } from "./starBattlePuzzles";
import type { Character } from "@/platform/characters/characters";

function makeCast(count: number): Character[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `char-${index + 1}`,
    name: `P${index + 1}`,
    image: `/characters/p${index + 1}.png`,
    description: {},
  }));
}

describe("characterForLevel", () => {
  const cast = makeCast(9);

  it("pairs every level with a different character", () => {
    for (let level = 1; level < LEVEL_WITHOUT_CHARACTER; level++) {
      expect(characterForLevel(level, cast)).toBe(cast[level - 1]);
    }
  });

  it("never repeats a character across levels", () => {
    const assigned = Array.from({ length: LEVEL_WITHOUT_CHARACTER - 1 }, (_, index) =>
      characterForLevel(index + 1, cast),
    );
    const ids = assigned.map((character) => character?.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves the last level without a character", () => {
    expect(LEVEL_WITHOUT_CHARACTER).toBe(TABERDOKU_TOTAL_LEVELS);
    expect(characterForLevel(LEVEL_WITHOUT_CHARACTER, cast)).toBeUndefined();
  });

  it("keeps the last level imageless even if a tenth character exists", () => {
    const biggerCast = makeCast(10);
    expect(characterForLevel(LEVEL_WITHOUT_CHARACTER, biggerCast)).toBeUndefined();
  });

  it("returns undefined for levels outside the range", () => {
    expect(characterForLevel(0, cast)).toBeUndefined();
    expect(characterForLevel(-3, cast)).toBeUndefined();
    expect(characterForLevel(TABERDOKU_TOTAL_LEVELS + 1, cast)).toBeUndefined();
  });

  it("returns undefined when the cast has not loaded yet", () => {
    for (let level = 1; level <= TABERDOKU_TOTAL_LEVELS; level++) {
      expect(characterForLevel(level, [])).toBeUndefined();
    }
  });

  it("degrades to undefined past the end of a short cast", () => {
    const shortCast = makeCast(3);
    expect(characterForLevel(1, shortCast)).toBe(shortCast[0]);
    expect(characterForLevel(4, shortCast)).toBeUndefined();
  });
});
