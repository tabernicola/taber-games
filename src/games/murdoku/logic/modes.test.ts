import { describe, expect, it } from "vitest";
import {
  countSolutions,
  generateSudoku,
  isSudokuSolved,
  sudokuConflicts,
  SUDOKU_LEVELS,
} from "./sudoku";
import { countTaberdokuSolutions, isTaberdokuSolved, taberdokuConflicts } from "./taberdoku";
import { TABERDOKU_PUZZLES } from "./taberdokuPuzzles";

describe("sudoku", () => {
  it("generates a unique-solution puzzle per level", () => {
    for (const level of SUDOKU_LEVELS) {
      const puzzle = generateSudoku(level);
      expect(puzzle.solution).toHaveLength(81);
      expect(isSudokuSolved(puzzle.solution)).toBe(true);
      expect(countSolutions(puzzle.puzzle, 2)).toBe(1);
      expect(puzzle.fixed.size).toBeGreaterThan(20);
    }
  });

  it("flags cells that repeat in a row", () => {
    const grid: (number | null)[] = Array<number | null>(81).fill(null);
    grid[0] = 3;
    grid[5] = 3;
    const conflicts = sudokuConflicts(grid);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(5)).toBe(true);
  });
});

describe("taberdoku", () => {
  it("ships boards of every size with a single solution", () => {
    expect(TABERDOKU_PUZZLES.length).toBeGreaterThan(0);
    for (const size of [6, 7, 8, 9]) {
      expect(TABERDOKU_PUZZLES.filter((p) => p.size === size).length).toBeGreaterThan(0);
    }
    for (const puzzle of TABERDOKU_PUZZLES) {
      expect(puzzle.rooms).toHaveLength(puzzle.size * puzzle.size);
      expect(puzzle.solution).toHaveLength(puzzle.size);
      expect(countTaberdokuSolutions(puzzle, 3)).toBe(1);
      expect(taberdokuConflicts(puzzle, puzzle.solution).size).toBe(0);
      expect(isTaberdokuSolved(puzzle, puzzle.solution)).toBe(true);
    }
  });

  it("rejects characters on touching cells", () => {
    const puzzle = TABERDOKU_PUZZLES[0];
    const a = 0;
    const b = puzzle.size + 1; // diagonal neighbour
    expect(taberdokuConflicts(puzzle, [a, b]).size).toBe(2);
  });
});
