import { SQUARE_LEVELS, type SquareLevelId } from "./levels";

const STORAGE_KEY = "taber-square-unlocked-level";

/** Highest level the player has unlocked (defaults to Starter). */
export function getUnlockedLevel(): SquareLevelId {
  if (typeof window === "undefined") return "starter";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && SQUARE_LEVELS.some((l) => l.id === raw)) return raw as SquareLevelId;
  } catch {
    /* ignore */
  }
  return "starter";
}

export function getUnlockedLevelIndex(): number {
  return SQUARE_LEVELS.findIndex((l) => l.id === getUnlockedLevel());
}

export function isLevelUnlocked(id: SquareLevelId): boolean {
  const idx = SQUARE_LEVELS.findIndex((l) => l.id === id);
  return idx >= 0 && idx <= getUnlockedLevelIndex();
}

/** Unlock the next tier after completing a puzzle at the current max level. */
export function unlockNextLevel(completedLevel: SquareLevelId): SquareLevelId {
  const completedIdx = SQUARE_LEVELS.findIndex((l) => l.id === completedLevel);
  const currentUnlocked = getUnlockedLevelIndex();
  const nextIdx = Math.min(Math.max(completedIdx + 1, currentUnlocked), SQUARE_LEVELS.length - 1);
  const nextId = SQUARE_LEVELS[nextIdx].id;
  try {
    localStorage.setItem(STORAGE_KEY, nextId);
  } catch {
    /* ignore */
  }
  return nextId;
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
