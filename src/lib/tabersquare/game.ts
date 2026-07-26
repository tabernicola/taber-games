import { PIECES, allOrientations, type Cell, type PieceDef } from "./pieces";
import { dedupeBlockers, rollDice } from "./dice";

export const BOARD_SIZE = 6;
export const BLOCKER = "#";

export type BoardCell = null | typeof BLOCKER | string; // null=empty, "#"=blocker, else pieceId

export function emptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<BoardCell>(BOARD_SIZE).fill(null),
  );
}

export function applyBlockers(blockers: Cell[]): BoardCell[][] {
  const b = emptyBoard();
  for (const [x, y] of blockers) b[y][x] = BLOCKER;
  return b;
}

export function canPlaceAt(
  board: BoardCell[][],
  cells: Cell[],
  ox: number,
  oy: number,
): boolean {
  for (const [dx, dy] of cells) {
    const x = ox + dx;
    const y = oy + dy;
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false;
    if (board[y][x] !== null) return false;
  }
  return true;
}

export function placeCells(
  board: BoardCell[][],
  cells: Cell[],
  ox: number,
  oy: number,
  value: string,
): BoardCell[][] {
  const next = board.map((row) => row.slice());
  for (const [dx, dy] of cells) next[oy + dy][ox + dx] = value;
  return next;
}

export function removePiece(board: BoardCell[][], pieceId: string): BoardCell[][] {
  return board.map((row) =>
    row.map((c) => (c === pieceId ? null : c)),
  );
}

function solve(board: BoardCell[][], pieces: PieceDef[], idx: number): boolean {
  if (idx >= pieces.length) return true;
  const piece = pieces[idx];
  const orients = allOrientations(piece.cells);
  // Find first empty cell (heuristic: reduce branching)
  let firstX = -1;
  let firstY = -1;
  outer: for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === null) {
        firstX = x;
        firstY = y;
        break outer;
      }
    }
  }
  if (firstX === -1) return false;

  for (const orient of orients) {
    // Try placing so that one of the piece's cells lands on the first empty cell
    for (const [dx, dy] of orient) {
      const ox = firstX - dx;
      const oy = firstY - dy;
      if (canPlaceAt(board, orient, ox, oy)) {
        const next = placeCells(board, orient, ox, oy, piece.id);
        if (solve(next, pieces, idx + 1)) return true;
      }
    }
  }
  return false;
}

export interface Puzzle {
  blockers: Cell[];
  board: BoardCell[][];
}

export function generatePuzzle(maxAttempts = 200): Puzzle {
  for (let i = 0; i < maxAttempts; i++) {
    const blockers = dedupeBlockers(rollDice());
    // Require exactly 7 distinct blockers so the free cells sum to 29 (=piece total).
    if (blockers.length !== 7) continue;
    const board = applyBlockers(blockers);
    // Order pieces largest-first for faster backtracking
    const ordered = [...PIECES].sort((a, b) => b.cells.length - a.cells.length);
    if (solve(board.map((r) => r.slice()), ordered, 0)) {
      return { blockers, board };
    }
  }
  // Fallback: return a known-solvable trivial layout (blockers all in bottom-right corner)
  const fallback: Cell[] = [
    [5, 5], [4, 5], [3, 5], [5, 4], [4, 4], [5, 3], [3, 4],
  ];
  return { blockers: fallback, board: applyBlockers(fallback) };
}

export function isSolved(board: BoardCell[][]): boolean {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === null) return false;
    }
  }
  return true;
}
