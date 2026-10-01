import { getStorageItem, setStorageItem } from "@/platform/storage";
import {
  TABERDOKU_TOTAL_BOARDS,
  TABERDOKU_TOTAL_LEVELS,
  boardsInLevel,
  isLevelUnlocked,
} from "./taberdokuPuzzles";

/** Key holding the board (1-indexed) the player is currently on. */
export const LEVEL_STORAGE_KEY = "taberdoku-level";
/** Key holding the JSON array of solved board numbers. */
export const COMPLETED_BOARDS_KEY = "taberdoku-completed";
/** Legacy key from before per-board progress was tracked. */
export const MAX_LEVEL_STORAGE_KEY = "taberdoku-max-level";

/**
 * Boards the player has already solved, migrating from the old
 * `taberdoku-max-level` storage (boards 1..max-1 counted as completed) when no
 * per-board progress exists yet.
 */
export function readCompletedBoards(): Set<number> {
  const saved = getStorageItem(COMPLETED_BOARDS_KEY);
  if (saved) {
    try {
      return new Set<number>(JSON.parse(saved));
    } catch {
      return new Set<number>();
    }
  }

  const savedMax = getStorageItem(MAX_LEVEL_STORAGE_KEY);
  if (!savedMax) return new Set<number>();

  const migrated = new Set<number>();
  for (let board = 1; board < Number(savedMax); board++) migrated.add(board);
  return migrated;
}

export function writeCompletedBoards(completedBoards: Set<number>): void {
  setStorageItem(COMPLETED_BOARDS_KEY, JSON.stringify([...completedBoards]));
}

/** Highest level the player may enter, always at least 1. */
export function highestUnlockedLevel(completedBoards: Set<number>): number {
  let highest = 1;
  for (let level = 2; level <= TABERDOKU_TOTAL_LEVELS; level++) {
    if (!isLevelUnlocked(level, completedBoards)) break;
    highest = level;
  }
  return highest;
}

/**
 * Board a saved game should resume on: the highest unlocked level that still
 * has unsolved boards, entering at that level's first unsolved board. Fully
 * cleared levels are skipped so the result always points at real work.
 */
export function resumeBoard(completedBoards: Set<number>): number {
  for (let level = highestUnlockedLevel(completedBoards); level >= 1; level--) {
    const pending = boardsInLevel(level).find((board) => !completedBoards.has(board));
    if (pending !== undefined) return pending;
  }

  // Every board is solved: stay on the last one.
  return TABERDOKU_TOTAL_BOARDS;
}
