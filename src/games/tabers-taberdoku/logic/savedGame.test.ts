import { describe, expect, it } from "vitest";
import { highestUnlockedLevel, resumeBoard } from "./savedGame";
import {
  TABERDOKU_BOARDS_PER_LEVEL,
  TABERDOKU_LEVEL_UNLOCK_THRESHOLD,
  TABERDOKU_TOTAL_BOARDS,
  TABERDOKU_TOTAL_LEVELS,
  boardsInLevel,
} from "./taberdokuPuzzles";

/** Solves the first `count` boards of a level. */
function solved(level: number, count: number): Set<number> {
  return new Set(boardsInLevel(level).slice(0, count));
}

function solvedUpToLevel(target: number, perLevel = TABERDOKU_BOARDS_PER_LEVEL): Set<number> {
  const all = new Set<number>();
  for (let level = 1; level <= target; level++) {
    for (const board of boardsInLevel(level).slice(0, perLevel)) all.add(board);
  }
  return all;
}

describe("highestUnlockedLevel", () => {
  it("starts at level 1 with no progress", () => {
    expect(highestUnlockedLevel(new Set())).toBe(1);
  });

  it("unlocks the next level once the threshold of boards is solved", () => {
    const needed = Math.ceil((TABERDOKU_LEVEL_UNLOCK_THRESHOLD / 100) * TABERDOKU_BOARDS_PER_LEVEL);
    expect(highestUnlockedLevel(solved(1, needed - 1))).toBe(1);
    expect(highestUnlockedLevel(solved(1, needed))).toBe(2);
  });

  it("never returns a level beyond the last one", () => {
    expect(highestUnlockedLevel(solvedUpToLevel(TABERDOKU_TOTAL_LEVELS))).toBe(
      TABERDOKU_TOTAL_LEVELS,
    );
  });
});

describe("resumeBoard", () => {
  it("starts a fresh game on the first board", () => {
    expect(resumeBoard(new Set())).toBe(1);
  });

  it("resumes at the first unsolved board of the current level", () => {
    const completed = solved(1, 3);
    expect(resumeBoard(completed)).toBe(4);
  });

  it("skips a fully solved level and resumes on the next one", () => {
    const completed = solvedUpToLevel(1);
    expect(resumeBoard(completed)).toBe(11);
  });

  it("enters the highest unlocked level, not the one with the most progress", () => {
    // Level 1 fully solved (level 2 unlocked), plus 4 boards of level 2 and the
    // 4 boards needed to unlock level 3. Resuming must jump to level 3.
    const completed = solvedUpToLevel(1);
    for (const board of boardsInLevel(2).slice(0, 4)) completed.add(board);

    expect(resumeBoard(completed)).toBe(21);
  });

  it("skips holes in the middle of a level and resumes at the first pending board", () => {
    const completed = new Set([1, 2, 4]);
    expect(resumeBoard(completed)).toBe(3);
  });

  it("stays on the last board once everything is solved", () => {
    const all = new Set(Array.from({ length: TABERDOKU_TOTAL_BOARDS }, (_, i) => i + 1));
    expect(resumeBoard(all)).toBe(TABERDOKU_TOTAL_BOARDS);
  });

  it("never returns a board the player already solved", () => {
    const completed = solvedUpToLevel(2);
    for (const board of boardsInLevel(3).slice(0, 2)) completed.add(board);

    const board = resumeBoard(completed);
    expect(completed.has(board)).toBe(false);
  });
});
