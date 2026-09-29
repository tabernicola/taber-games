// Taberdoku mode: place one character per row, column and room on an irregular
// board. Two characters can never stand on touching cells (diagonals included).
// No clues, no killer: the board is solved once every character sits right.

export type TaberdokuPuzzle = {
  id: string;
  size: number;
  /** room index per cell, length size*size */
  rooms: number[];
  /** cells that come pre-occupied and cannot be changed */
  givens: number[];
  /** the cells of the unique solution */
  solution: number[];
  /** difficulty score computed by computeTaberdokuDifficulty */
  difficulty?: number;
};

export function cellIndex(size: number, row: number, col: number): number {
  return row * size + col;
}

export function cellRow(size: number, index: number): number {
  return Math.floor(index / size);
}

export function cellCol(size: number, index: number): number {
  return index % size;
}

function touching(size: number, a: number, b: number): boolean {
  return (
    Math.abs(cellRow(size, a) - cellRow(size, b)) <= 1 &&
    Math.abs(cellCol(size, a) - cellCol(size, b)) <= 1
  );
}

/** Occupied cells that break one of the four rules. */
export function taberdokuConflicts(puzzle: TaberdokuPuzzle, occupied: number[]): Set<number> {
  const { size, rooms } = puzzle;
  const conflicts = new Set<number>();
  for (let i = 0; i < occupied.length; i++) {
    for (let j = i + 1; j < occupied.length; j++) {
      const a = occupied[i];
      const b = occupied[j];
      const clash =
        cellRow(size, a) === cellRow(size, b) ||
        cellCol(size, a) === cellCol(size, b) ||
        rooms[a] === rooms[b] ||
        touching(size, a, b);
      if (clash) {
        conflicts.add(a);
        conflicts.add(b);
      }
    }
  }
  return conflicts;
}

export function isTaberdokuSolved(puzzle: TaberdokuPuzzle, occupied: number[]): boolean {
  if (occupied.length !== puzzle.size) return false;
  const expected = new Set(puzzle.solution);
  return occupied.every((cell) => expected.has(cell));
}

/** Counts solutions of a board, stopping at `limit`. Used by tests. */
export function countTaberdokuSolutions(puzzle: TaberdokuPuzzle, limit = 2): number {
  const { size, rooms, givens } = puzzle;
  const fixedByRow = new Map<number, number>();
  for (const g of givens) fixedByRow.set(cellRow(size, g), cellCol(size, g));

  const usedCols = new Array<boolean>(size).fill(false);
  const usedRooms = new Array<boolean>(size).fill(false);
  const previousCol = -10;
  let found = 0;

  const rec = (row: number, prevCol: number): void => {
    if (found >= limit) return;
    if (row === size) {
      found++;
      return;
    }
    const fixed = fixedByRow.get(row);
    for (let col = 0; col < size; col++) {
      if (fixed !== undefined && col !== fixed) continue;
      if (usedCols[col]) continue;
      const cell = cellIndex(size, row, col);
      const room = rooms[cell];
      if (usedRooms[room]) continue;
      if (row > 0 && Math.abs(prevCol - col) <= 1) continue;
      usedCols[col] = true;
      usedRooms[room] = true;
      rec(row + 1, col);
      usedCols[col] = false;
      usedRooms[room] = false;
      if (found >= limit) return;
    }
  };

  rec(0, previousCol);
  return found;
}

export interface TaberdokuDifficultyBreakdown {
  score: number;
  sizeBase: number;
  givensPenalty: number;
  searchNodes: number;
  searchScore: number;
  roomBorders: number;
  minRoomSize: number;
  maxRoomSize: number;
  roomComplexity: number;
}

/**
 * Computes a detailed breakdown of the difficulty of a Taberdoku board.
 * Evaluates:
 * 1. Grid size tier scaling (6x6: base 100, 7x7: base 3000, 8x8: base 7000, 9x9: base 12000)
 * 2. Unassisted penalty (0 givens adds +1000 difficulty)
 * 3. Search tree complexity / backtrack nodes (logarithmic scale)
 * 4. Room geometry complexity (internal border length between rooms + minimum room size)
 */
export function analyzeTaberdokuDifficulty(puzzle: TaberdokuPuzzle): TaberdokuDifficultyBreakdown {
  const { size, rooms, givens } = puzzle;
  const fixedByRow = new Map<number, number>();
  for (const g of givens) fixedByRow.set(cellRow(size, g), cellCol(size, g));

  const usedCols = new Array<boolean>(size).fill(false);
  const usedRooms = new Array<boolean>(size).fill(false);
  let searchNodes = 0;

  const rec = (row: number, prevCol: number): boolean => {
    searchNodes++;
    if (row === size) return true;
    const fixed = fixedByRow.get(row);
    for (let col = 0; col < size; col++) {
      if (fixed !== undefined && col !== fixed) continue;
      if (usedCols[col]) continue;
      const cell = cellIndex(size, row, col);
      const room = rooms[cell];
      if (usedRooms[room]) continue;
      if (row > 0 && Math.abs(prevCol - col) <= 1) continue;
      usedCols[col] = true;
      usedRooms[room] = true;
      if (rec(row + 1, col)) return true;
      usedCols[col] = false;
      usedRooms[room] = false;
    }
    return false;
  };

  rec(0, -10);

  const roomCounts = new Array<number>(size).fill(0);
  for (const r of rooms) roomCounts[r]++;
  const minRoomSize = Math.min(...roomCounts);
  const maxRoomSize = Math.max(...roomCounts);

  let roomBorders = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = cellIndex(size, r, c);
      if (r + 1 < size && rooms[idx] !== rooms[cellIndex(size, r + 1, c)]) {
        roomBorders++;
      }
      if (c + 1 < size && rooms[idx] !== rooms[cellIndex(size, r, c + 1)]) {
        roomBorders++;
      }
    }
  }

  // Non-overlapping size tier base:
  // 6x6: base 100, 7x7: base 3000, 8x8: base 7000, 9x9: base 12000
  const sizeBase = size === 6 ? 100 : size === 7 ? 3000 : size === 8 ? 7000 : 12000;
  const givensPenalty = givens.length === 0 ? 1000 : 0;
  const searchScore = Math.round(Math.log2(searchNodes + 1) * 50);
  const roomComplexity = roomBorders * 2 + (minRoomSize - 2) * 10;

  const score = Math.max(50, sizeBase + givensPenalty + searchScore + roomComplexity);

  return {
    score,
    sizeBase,
    givensPenalty,
    searchNodes,
    searchScore,
    roomBorders,
    minRoomSize,
    maxRoomSize,
    roomComplexity,
  };
}

/**
 * Computes an objective numerical difficulty score for a Taberdoku board.
 * Can be reused to score and rank any existing or newly generated board.
 */
export function computeTaberdokuDifficulty(puzzle: TaberdokuPuzzle): number {
  return analyzeTaberdokuDifficulty(puzzle).score;
}

/**
 * Sorts an array of Taberdoku puzzles in ascending or descending order of difficulty.
 */
export function sortTaberdokuPuzzlesByDifficulty(
  puzzles: TaberdokuPuzzle[],
  order: "asc" | "desc" = "asc",
): TaberdokuPuzzle[] {
  return [...puzzles].sort((a, b) => {
    const scoreA = a.difficulty ?? computeTaberdokuDifficulty(a);
    const scoreB = b.difficulty ?? computeTaberdokuDifficulty(b);
    return order === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });
}
