import { getStorageItem, setStorageItem } from "@/platform/storage";

const TUTORIAL_KEY = "taber-star-tutorial-completed";

export function isTutorialCompleted(): boolean {
  return getStorageItem(TUTORIAL_KEY) === "true";
}

export function markTutorialCompleted(): void {
  setStorageItem(TUTORIAL_KEY, "true");
}
