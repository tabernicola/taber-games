import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage";

const TUTORIAL_KEY = "eternity2-tutorial-completed";

/** Check if the Eternity II tutorial has been completed. */
export function isTutorialCompleted(): boolean {
  return getStorageItem(TUTORIAL_KEY) === "true";
}

/** Mark the Eternity II tutorial as completed. */
export function markTutorialCompleted(): void {
  setStorageItem(TUTORIAL_KEY, "true");
}

/** Reset Eternity II tutorial completion (for testing/replay). */
export function resetTutorial(): void {
  removeStorageItem(TUTORIAL_KEY);
}
