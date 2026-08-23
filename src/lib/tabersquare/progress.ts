import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage";
import { SQUARE_LEVELS, type SquareLevelId } from "./levels";

const STORAGE_KEY = "taber-square-unlocked-level";
const ACTIVE_STORAGE_KEY = "taber-square-active-level";
const TUTORIAL_KEY = "taber-square-tutorial-completed";

/** Highest level the player has unlocked (defaults to Starter). */
export function getUnlockedLevel(): SquareLevelId {
  const raw = getStorageItem(STORAGE_KEY);
  if (raw && SQUARE_LEVELS.some((l) => l.id === raw)) return raw as SquareLevelId;
  return "starter";
}

export function getUnlockedLevelIndex(): number {
  return SQUARE_LEVELS.findIndex((l) => l.id === getUnlockedLevel());
}

export function isLevelUnlocked(id: SquareLevelId): boolean {
  const idx = SQUARE_LEVELS.findIndex((l) => l.id === id);
  return idx >= 0 && idx <= getUnlockedLevelIndex();
}

/** Active level being played. Defaults to the unlocked level if not set. */
export function getActiveLevel(): SquareLevelId {
  const raw = getStorageItem(ACTIVE_STORAGE_KEY);
  if (raw && SQUARE_LEVELS.some((l) => l.id === raw)) return raw as SquareLevelId;
  return getUnlockedLevel();
}

export function setActiveLevel(id: SquareLevelId): void {
  setStorageItem(ACTIVE_STORAGE_KEY, id);
}

/** Unlock the next tier after completing a puzzle at the current max level. */
export function unlockNextLevel(completedLevel: SquareLevelId): SquareLevelId {
  const completedIdx = SQUARE_LEVELS.findIndex((l) => l.id === completedLevel);
  const currentUnlocked = getUnlockedLevelIndex();
  const nextIdx = Math.min(Math.max(completedIdx + 1, currentUnlocked), SQUARE_LEVELS.length - 1);
  const nextId = SQUARE_LEVELS[nextIdx].id;
  setStorageItem(STORAGE_KEY, nextId);
  return nextId;
}

export function resetProgress(): void {
  removeStorageItem(STORAGE_KEY);
  removeStorageItem(ACTIVE_STORAGE_KEY);
}

/** Check if the tutorial has been completed. */
export function isTutorialCompleted(): boolean {
  return getStorageItem(TUTORIAL_KEY) === "true";
}

/** Mark the tutorial as completed. */
export function markTutorialCompleted(): void {
  setStorageItem(TUTORIAL_KEY, "true");
}

/** Reset tutorial completion (for testing). */
export function resetTutorial(): void {
  removeStorageItem(TUTORIAL_KEY);
}
