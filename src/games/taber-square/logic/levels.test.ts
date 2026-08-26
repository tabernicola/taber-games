import { describe, expect, it } from "vitest";
import { SQUARE_LEVELS, getLevel, isRestrictedPiece, levelIndex, nextLevelId } from "./levels";

describe("SQUARE_LEVELS", () => {
  it("defines 5 tiers in order", () => {
    expect(SQUARE_LEVELS.map((l) => l.tier)).toEqual([1, 2, 3, 4, 5]);
    expect(SQUARE_LEVELS[0].id).toBe("starter");
    expect(SQUARE_LEVELS[4].id).toBe("wizard");
  });
});

describe("getLevel", () => {
  it("returns the level matching the id", () => {
    expect(getLevel("expert").tier).toBe(3);
    expect(getLevel("wizard").restrictedPieces).toEqual([1, 2, 3, 4]);
  });

  it("falls back to starter for an unknown id", () => {
    expect(getLevel("bogus" as never).id).toBe("starter");
  });
});

describe("nextLevelId", () => {
  it("walks the tiers in order", () => {
    expect(nextLevelId("starter")).toBe("junior");
    expect(nextLevelId("junior")).toBe("expert");
    expect(nextLevelId("expert")).toBe("master");
    expect(nextLevelId("master")).toBe("wizard");
  });

  it("returns null at the last tier", () => {
    expect(nextLevelId("wizard")).toBeNull();
  });

  it("returns null for an unknown id", () => {
    expect(nextLevelId("bogus" as never)).toBeNull();
  });
});

describe("levelIndex", () => {
  it("returns the 0-based position", () => {
    expect(levelIndex("starter")).toBe(0);
    expect(levelIndex("wizard")).toBe(4);
  });

  it("returns -1 for an unknown id", () => {
    expect(levelIndex("bogus" as never)).toBe(-1);
  });
});

describe("isRestrictedPiece", () => {
  it("checks membership in the level's restricted list", () => {
    expect(isRestrictedPiece(getLevel("junior"), 1)).toBe(true);
    expect(isRestrictedPiece(getLevel("junior"), 3)).toBe(false);
    expect(isRestrictedPiece(getLevel("starter"), 1)).toBe(false);
  });
});
