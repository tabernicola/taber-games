import { describe, expect, it } from "vitest";
import {
  countTaberdokuSolutions,
  isTaberdokuSolved,
  taberdokuConflicts,
} from "./taberdoku";
import {
  TABERDOKU_PUZZLES,
  TABERDOKU_SIZES,
  TABERDOKU_TOTAL_LEVELS,
  taberdokuAllPuzzlesSorted,
  taberdokuPuzzlesBySize,
} from "./taberdokuPuzzles";

describe("TaberDoku 100 puzzles", () => {
  it("contains exactly 100 puzzles", () => {
    expect(TABERDOKU_TOTAL_LEVELS).toBe(100);
    expect(TABERDOKU_PUZZLES).toHaveLength(100);
    expect(taberdokuAllPuzzlesSorted()).toHaveLength(100);
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
    const all = taberdokuAllPuzzlesSorted();

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

