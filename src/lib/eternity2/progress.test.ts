import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTutorialCompleted, markTutorialCompleted, resetTutorial } from "./progress";

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

describe("Eternity II tutorial progress", () => {
  it("defaults to not completed", () => {
    expect(isTutorialCompleted()).toBe(false);
  });

  it("marks tutorial as completed", () => {
    markTutorialCompleted();
    expect(isTutorialCompleted()).toBe(true);
  });

  it("resets tutorial completion", () => {
    markTutorialCompleted();
    expect(isTutorialCompleted()).toBe(true);
    resetTutorial();
    expect(isTutorialCompleted()).toBe(false);
  });
});
