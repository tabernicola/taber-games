import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getUnlockedLevel,
  getUnlockedLevelIndex,
  isLevelUnlocked,
  resetProgress,
  unlockNextLevel,
} from "./progress";

function stubStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as unknown as Storage;
}

beforeEach(() => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", stubStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getUnlockedLevel", () => {
  it("defaults to starter with no saved progress", () => {
    expect(getUnlockedLevel()).toBe("starter");
    expect(getUnlockedLevelIndex()).toBe(0);
  });

  it("returns the stored level when valid", () => {
    localStorage.setItem("taber-square-unlocked-level", "expert");
    expect(getUnlockedLevel()).toBe("expert");
    expect(getUnlockedLevelIndex()).toBe(2);
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem("taber-square-unlocked-level", "cheater");
    expect(getUnlockedLevel()).toBe("starter");
  });

  it("returns starter when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(getUnlockedLevel()).toBe("starter");
  });
});

describe("isLevelUnlocked", () => {
  it("only unlocks tiers up to the stored level", () => {
    localStorage.setItem("taber-square-unlocked-level", "junior");
    expect(isLevelUnlocked("starter")).toBe(true);
    expect(isLevelUnlocked("junior")).toBe(true);
    expect(isLevelUnlocked("expert")).toBe(false);
  });

  it("returns false for an unknown id", () => {
    expect(isLevelUnlocked("bogus" as never)).toBe(false);
  });
});

describe("unlockNextLevel", () => {
  it("unlocks the tier after the completed one", () => {
    expect(unlockNextLevel("starter")).toBe("junior");
    expect(getUnlockedLevel()).toBe("junior");
  });

  it("does not regress already unlocked progress", () => {
    localStorage.setItem("taber-square-unlocked-level", "master");
    expect(unlockNextLevel("starter")).toBe("master");
    expect(getUnlockedLevel()).toBe("master");
  });

  it("caps at the last tier", () => {
    localStorage.setItem("taber-square-unlocked-level", "wizard");
    expect(unlockNextLevel("wizard")).toBe("wizard");
  });
});

describe("resetProgress", () => {
  it("clears saved progress back to starter", () => {
    unlockNextLevel("expert");
    resetProgress();
    expect(getUnlockedLevel()).toBe("starter");
  });
});
