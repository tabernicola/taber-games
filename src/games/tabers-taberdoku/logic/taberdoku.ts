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
