// Classic 9x9 sudoku where digits are replaced by the 9 Murdoku characters.
// Values are 0..8 (index into the character list); null means empty.

export type SudokuLevel = "easy" | "medium" | "hard" | "expert";

export const SUDOKU_LEVELS: SudokuLevel[] = ["easy", "medium", "hard", "expert"];

/** Number of pre-filled cells per difficulty. */
const GIVENS: Record<SudokuLevel, number> = {
  easy: 42,
  medium: 34,
  hard: 28,
  expert: 24,
};

export type SudokuPuzzle = {
  level: SudokuLevel;
  /** 81 cells, null = empty */
  puzzle: (number | null)[];
  /** 81 cells, fully solved */
  solution: number[];
  /** indices that came pre-filled and cannot be changed */
  fixed: Set<number>;
};

export function boxOf(index: number): number {
  const row = Math.floor(index / 9);
  const col = index % 9;
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isAllowed(grid: (number | null)[], index: number, value: number): boolean {
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row * 9 + c] === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r * 9 + col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const i = r * 9 + c;
      if (i !== index && grid[i] === value) return false;
    }
  }
  return true;
}

function fill(grid: (number | null)[], pos: number, rand: () => number): boolean {
  if (pos === 81) return true;
  if (grid[pos] !== null) return fill(grid, pos + 1, rand);
  for (const value of shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rand)) {
    if (!isAllowed(grid, pos, value)) continue;
    grid[pos] = value;
    if (fill(grid, pos + 1, rand)) return true;
    grid[pos] = null;
  }
  return false;
}

/** Counts solutions, stopping as soon as `limit` is reached. */
export function countSolutions(grid: (number | null)[], limit = 2): number {
  const work = [...grid];
  let found = 0;

  const rec = (): void => {
    if (found >= limit) return;
    let best = -1;
    let bestOptions: number[] = [];
    for (let i = 0; i < 81; i++) {
      if (work[i] !== null) continue;
      const options: number[] = [];
      for (let v = 0; v < 9; v++) if (isAllowed(work, i, v)) options.push(v);
      if (options.length === 0) return;
      if (best === -1 || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        if (options.length === 1) break;
      }
    }
    if (best === -1) {
      found++;
      return;
    }
    for (const v of bestOptions) {
      work[best] = v;
      rec();
      work[best] = null;
      if (found >= limit) return;
    }
  };

  rec();
  return found;
}

export function generateSudoku(level: SudokuLevel, rand: () => number = Math.random): SudokuPuzzle {
  const solved: (number | null)[] = Array<number | null>(81).fill(null);
  fill(solved, 0, rand);
  const solution = solved as number[];

  const puzzle: (number | null)[] = [...solution];
  const target = GIVENS[level];
  for (const index of shuffle([...Array(81).keys()], rand)) {
    const filled = puzzle.filter((v) => v !== null).length;
    if (filled <= target) break;
    const backup = puzzle[index];
    puzzle[index] = null;
    if (countSolutions(puzzle, 2) !== 1) puzzle[index] = backup;
  }

  const fixed = new Set<number>();
  puzzle.forEach((v, i) => {
    if (v !== null) fixed.add(i);
  });

  return { level, puzzle, solution, fixed };
}

/** Indices whose value clashes with another value in the same row, column or box. */
export function sudokuConflicts(grid: (number | null)[]): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    const value = grid[i];
    if (value === null || value === undefined) continue;
    if (!isAllowed(grid, i, value)) conflicts.add(i);
  }
  return conflicts;
}

export function isSudokuSolved(grid: (number | null)[]): boolean {
  if (grid.some((v) => v === null || v === undefined)) return false;
  return sudokuConflicts(grid).size === 0;
}
