import { describe, expect, it } from "vitest";
import {
  analyzeTaberdokuDifficulty,
  computeTaberdokuDifficulty,
  countTaberdokuSolutions,
  isTaberdokuSolved,
  sortTaberdokuPuzzlesByDifficulty,
  taberdokuConflicts,
  type TaberdokuPuzzle,
} from "./starBattle";
import {
  TABERDOKU_BOARDS_PER_LEVEL,
  TABERDOKU_LEVEL_UNLOCK_THRESHOLD,
  TABERDOKU_PUZZLES,
  TABERDOKU_SIZES,
  TABERDOKU_TOTAL_BOARDS,
  TABERDOKU_TOTAL_LEVELS,
  boardInLevel,
  boardToLevel,
  boardsInLevel,
  isLevelUnlocked,
  levelProgress,
  levelProgressFromCompleted,
  starBattleAllPuzzlesSorted,
  taberdokuPuzzlesBySize,
} from "./starBattlePuzzles";

describe("TaberDoku 100 puzzles", () => {
  it("contains exactly 100 puzzles grouped into 10 levels of 10 boards", () => {
    expect(TABERDOKU_BOARDS_PER_LEVEL).toBe(10);
    expect(TABERDOKU_TOTAL_LEVELS).toBe(10);
    expect(TABERDOKU_TOTAL_BOARDS).toBe(100);
    expect(TABERDOKU_PUZZLES).toHaveLength(100);
    expect(starBattleAllPuzzlesSorted()).toHaveLength(100);
  });

  it("distributes 25 puzzles for each size 6, 7, 8, and 9", () => {
    for (const size of TABERDOKU_SIZES) {
      const bySize = taberdokuPuzzlesBySize(size);
      expect(bySize).toHaveLength(25);
    }
  });

  it("ensures each board has at most 1 given character (0 or 1)", () => {
    let zeroGivens = 0;
    let oneGiven = 0;

    for (const puzzle of TABERDOKU_PUZZLES) {
      expect(puzzle.givens.length).toBeLessThanOrEqual(1);
      if (puzzle.givens.length === 0) zeroGivens++;
      if (puzzle.givens.length === 1) oneGiven++;

      for (const g of puzzle.givens) {
        expect(puzzle.solution).toContain(g);
      }
    }

    expect(zeroGivens).toBeGreaterThan(0);
    expect(oneGiven).toBeGreaterThan(0);
    expect(zeroGivens + oneGiven).toBe(100);
  });

  it("orders puzzles in ascending difficulty (sizes 6, 7, 8, 9, with 1-given preceding 0-given)", () => {
    const all = starBattleAllPuzzlesSorted();

    // Check size ordering
    for (let i = 0; i < 25; i++) {
      expect(all[i].size).toBe(6);
    }
    for (let i = 25; i < 50; i++) {
      expect(all[i].size).toBe(7);
    }
    for (let i = 50; i < 75; i++) {
      expect(all[i].size).toBe(8);
    }
    for (let i = 75; i < 100; i++) {
      expect(all[i].size).toBe(9);
    }

    // Within each size block, puzzles with 1 given should come before puzzles with 0 givens
    for (let b = 0; b < 4; b++) {
      const block = all.slice(b * 25, (b + 1) * 25);
      let seenZero = false;
      for (const p of block) {
        if (p.givens.length === 0) {
          seenZero = true;
        } else if (seenZero) {
          // If we saw a 0-given puzzle, we shouldn't see a 1-given puzzle afterwards in this tier
          expect(p.givens.length).toBe(0);
        }
      }
    }
  });

  it("assigns a difficulty score to each board matching computeTaberdokuDifficulty", () => {
    for (const puzzle of TABERDOKU_PUZZLES) {
      expect(puzzle.difficulty).toBeDefined();
      expect(typeof puzzle.difficulty).toBe("number");
      expect(puzzle.difficulty).toBeGreaterThan(0);

      // Verify re-computing yields the identical score
      const recomputed = computeTaberdokuDifficulty(puzzle);
      expect(puzzle.difficulty).toBe(recomputed);
    }
  });

  it("ensures all 100 puzzles are strictly sorted in ascending difficulty order", () => {
    for (let i = 0; i < TABERDOKU_PUZZLES.length - 1; i++) {
      const current = TABERDOKU_PUZZLES[i].difficulty!;
      const next = TABERDOKU_PUZZLES[i + 1].difficulty!;
      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it("provides detailed difficulty breakdown via analyzeTaberdokuDifficulty", () => {
    const puzzle = TABERDOKU_PUZZLES[0];
    const breakdown = analyzeTaberdokuDifficulty(puzzle);

    expect(breakdown.score).toBe(puzzle.difficulty);
    expect(breakdown.sizeBase).toBe(100);
    expect(breakdown.searchNodes).toBeGreaterThan(0);
    expect(breakdown.minRoomSize).toBeGreaterThanOrEqual(2);
    expect(breakdown.maxRoomSize).toBeGreaterThan(0);
    expect(breakdown.roomBorders).toBeGreaterThan(0);
  });

  it("reusable sorting function correctly sorts arbitrary boards", () => {
    const samplePuzzles: TaberdokuPuzzle[] = [
      TABERDOKU_PUZZLES[90], // hard
      TABERDOKU_PUZZLES[10], // easy
      TABERDOKU_PUZZLES[45], // medium
    ];

    const sortedAsc = sortTaberdokuPuzzlesByDifficulty(samplePuzzles, "asc");
    expect(sortedAsc[0].id).toBe(TABERDOKU_PUZZLES[10].id);
    expect(sortedAsc[1].id).toBe(TABERDOKU_PUZZLES[45].id);
    expect(sortedAsc[2].id).toBe(TABERDOKU_PUZZLES[90].id);

    const sortedDesc = sortTaberdokuPuzzlesByDifficulty(samplePuzzles, "desc");
    expect(sortedDesc[0].id).toBe(TABERDOKU_PUZZLES[90].id);
    expect(sortedDesc[1].id).toBe(TABERDOKU_PUZZLES[45].id);
    expect(sortedDesc[2].id).toBe(TABERDOKU_PUZZLES[10].id);
  });

  it("verifies all 100 puzzles have unique solutions and valid rules", () => {
    for (const puzzle of TABERDOKU_PUZZLES) {
      const { size, rooms, solution } = puzzle;
      expect(rooms).toHaveLength(size * size);
      expect(solution).toHaveLength(size);

      // Verify each room has at least 2 cells
      for (let r = 0; r < size; r++) {
        const count = rooms.filter((room) => room === r).length;
        expect(count).toBeGreaterThanOrEqual(2);
      }

      // Verify no conflicts in solution
      expect(taberdokuConflicts(puzzle, solution).size).toBe(0);
      expect(isTaberdokuSolved(puzzle, solution)).toBe(true);

      // Verify unique solution
      expect(countTaberdokuSolutions(puzzle, 2)).toBe(1);
    }
  });

  it("flags conflicts when two characters touch or share row/col/room", () => {
    const puzzle = TABERDOKU_PUZZLES[0];
    const size = puzzle.size;

    // Touching horizontally
    const clash1 = taberdokuConflicts(puzzle, [0, 1]);
    expect(clash1.size).toBe(2);

    // Touching diagonally
    const clash2 = taberdokuConflicts(puzzle, [0, size + 1]);
    expect(clash2.size).toBe(2);
  });
});

describe("TaberDoku level helpers", () => {
  it("converts board numbers to levels correctly", () => {
    // Board 1-10 → level 1, 11-20 → level 2, ..., 91-100 → level 10
    expect(boardToLevel(1)).toBe(1);
    expect(boardToLevel(10)).toBe(1);
    expect(boardToLevel(11)).toBe(2);
    expect(boardToLevel(20)).toBe(2);
    expect(boardToLevel(91)).toBe(10);
    expect(boardToLevel(100)).toBe(10);
  });

  it("returns position within level correctly", () => {
    expect(boardInLevel(1)).toBe(1);
    expect(boardInLevel(10)).toBe(10);
    expect(boardInLevel(11)).toBe(1);
    expect(boardInLevel(15)).toBe(5);
    expect(boardInLevel(100)).toBe(10);
  });

  it("computes level progress based on board position", () => {
    expect(levelProgress(1)).toBe(0);
    expect(levelProgress(5)).toBe(40);
    expect(levelProgress(10)).toBe(90);
    expect(levelProgress(11)).toBe(0);
    expect(levelProgress(20)).toBe(90);
  });

  it("computes level progress from completed boards", () => {
    // Level 1 with boards {1,2,3,4,5} completed → 50%
    const completed1 = new Set([1, 2, 3, 4, 5]);
    expect(levelProgressFromCompleted(completed1, 1)).toBe(50);

    // Level 1 with boards {1,2,3,4,5,6,7,8,9,10} completed → 100%
    const completedFull = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(levelProgressFromCompleted(completedFull, 1)).toBe(100);

    // Level 2 with boards {11,12,13} completed → 30%
    const completed2 = new Set([11, 12, 13]);
    expect(levelProgressFromCompleted(completed2, 2)).toBe(30);

    // Level 2 with no boards completed → 0%
    expect(levelProgressFromCompleted(new Set(), 2)).toBe(0);
  });

  it("determines level unlock status at 40% threshold", () => {
    const threshold = TABERDOKU_LEVEL_UNLOCK_THRESHOLD;
    expect(threshold).toBe(40);

    // Level 1 is always unlocked
    expect(isLevelUnlocked(1, new Set())).toBe(true);
    expect(isLevelUnlocked(1, new Set([1, 2, 3]))).toBe(true);

    // Level 2 requires 40% of level 1 = 4 boards (boards 1-4)
    // 3 boards completed → 30% → locked
    expect(isLevelUnlocked(2, new Set([1, 2, 3]))).toBe(false);
    // 4 boards completed → 40% → unlocked
    expect(isLevelUnlocked(2, new Set([1, 2, 3, 4]))).toBe(true);
    // 10 boards completed → 100% → unlocked
    expect(isLevelUnlocked(2, new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))).toBe(true);

    // Level 3 requires 40% of level 2 = 4 boards (boards 11-14)
    expect(isLevelUnlocked(3, new Set([1, 2, 3, 4, 11, 12, 13]))).toBe(false);
    expect(isLevelUnlocked(3, new Set([1, 2, 3, 4, 11, 12, 13, 14]))).toBe(true);
  });

  it("returns all board numbers in a level", () => {
    // Level 1 → boards 1-10
    expect(boardsInLevel(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Level 2 → boards 11-20
    expect(boardsInLevel(2)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

    // Level 10 → boards 91-100
    expect(boardsInLevel(10)).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);
  });

  it("distributes boards evenly across 10 levels", () => {
    for (let level = 1; level <= TABERDOKU_TOTAL_LEVELS; level++) {
      const levelBoards = TABERDOKU_PUZZLES.slice(
        (level - 1) * TABERDOKU_BOARDS_PER_LEVEL,
        level * TABERDOKU_BOARDS_PER_LEVEL,
      );
      expect(levelBoards).toHaveLength(TABERDOKU_BOARDS_PER_LEVEL);
    }
  });
});
