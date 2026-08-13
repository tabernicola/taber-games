import { PIECES, allOrientations, type Cell, type PieceDef } from "./pieces";
import { dedupeBlockers, rollDice } from "./dice";
import type { SquareLevelDef } from "./levels";
import { getLevel, type SquareLevelId } from "./levels";

export const BOARD_SIZE = 6;
export const BLOCKER = "#";

export type BoardCell = null | typeof BLOCKER | string; // null=empty, "#"=blocker, else pieceId

const pieceById = new Map(PIECES.map((p) => [p.id, p]));

export function pieceNumber(pieceId: string): number {
  return pieceById.get(pieceId)?.number ?? 0;
}

/** Two occupied cells share an edge (not just a corner). */
function cellsShareEdge(a: Cell, b: Cell): boolean {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

function pieceCellsOnBoard(board: BoardCell[][], pieceId: string): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === pieceId) cells.push([x, y]);
    }
  }
  return cells;
}

function piecesShareSide(board: BoardCell[][], idA: string, idB: string): boolean {
  const cellsA = pieceCellsOnBoard(board, idA);
  const cellsB = pieceCellsOnBoard(board, idB);
  for (const a of cellsA) {
    for (const b of cellsB) {
      if (cellsShareEdge(a, b)) return true;
    }
  }
  return false;
}

/** True when restricted pieces illegally share a side. */
export function violatesLevelRestrictions(board: BoardCell[][], level: SquareLevelDef): boolean {
  const restricted = level.restrictedPieces;
  if (restricted.length < 2) return false;

  const placed = new Set<string>();
  for (const row of board) {
    for (const c of row) {
      if (c && c !== BLOCKER) placed.add(c);
    }
  }

  const restrictedIds = [...placed].filter((id) => restricted.includes(pieceNumber(id)));
  for (let i = 0; i < restrictedIds.length; i++) {
    for (let j = i + 1; j < restrictedIds.length; j++) {
      if (piecesShareSide(board, restrictedIds[i], restrictedIds[j])) return true;
    }
  }
  return false;
}

export function wouldViolateRestrictions(
  board: BoardCell[][],
  cells: Cell[],
  ox: number,
  oy: number,
  pieceId: string,
  level: SquareLevelDef,
): boolean {
  const restricted = level.restrictedPieces;
  const num = pieceNumber(pieceId);
  if (!restricted.includes(num)) return false;

  const newCells = cells.map(([dx, dy]) => [ox + dx, oy + dy] as Cell);
  for (const otherId of new Set(
    board.flat().filter((c): c is string => !!c && c !== BLOCKER && c !== pieceId),
  )) {
    if (!restricted.includes(pieceNumber(otherId))) continue;
    const otherCells = pieceCellsOnBoard(board, otherId);
    for (const a of newCells) {
      for (const b of otherCells) {
        if (cellsShareEdge(a, b)) return true;
      }
    }
  }
  return false;
}

export function emptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array<BoardCell>(BOARD_SIZE).fill(null));
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
  level?: SquareLevelDef,
  pieceId?: string,
): boolean {
  for (const [dx, dy] of cells) {
    const x = ox + dx;
    const y = oy + dy;
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false;
    if (board[y][x] !== null) return false;
  }
  if (level && pieceId && wouldViolateRestrictions(board, cells, ox, oy, pieceId, level)) {
    return false;
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
  return board.map((row) => row.map((c) => (c === pieceId ? null : c)));
}

function solve(
  board: BoardCell[][],
  pieces: PieceDef[],
  idx: number,
  level: SquareLevelDef,
): boolean {
  if (idx >= pieces.length) return !violatesLevelRestrictions(board, level);
  const piece = pieces[idx];
  const orients = allOrientations(piece.cells);
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
    for (const [dx, dy] of orient) {
      const ox = firstX - dx;
      const oy = firstY - dy;
      if (canPlaceAt(board, orient, ox, oy, level, piece.id)) {
        const next = placeCells(board, orient, ox, oy, piece.id);
        if (solve(next, pieces, idx + 1, level)) return true;
      }
    }
  }
  return false;
}

export interface Puzzle {
  blockers: Cell[];
  board: BoardCell[][];
}

export function generatePuzzle(levelId: SquareLevelId = "starter", maxAttempts = 200): Puzzle {
  const level = getLevel(levelId);
  for (let i = 0; i < maxAttempts; i++) {
    const blockers = dedupeBlockers(rollDice());
    if (blockers.length !== 7) continue;
    const board = applyBlockers(blockers);
    const ordered = [...PIECES].sort((a, b) => b.cells.length - a.cells.length);
    if (
      solve(
        board.map((r) => r.slice()),
        ordered,
        0,
        level,
      )
    ) {
      return { blockers, board };
    }
  }
  // Fallback: return a known-solvable trivial layout (blockers all in bottom-right corner)
  const fallback: Cell[] = [
    [5, 5],
    [4, 5],
    [3, 5],
    [5, 4],
    [4, 4],
    [5, 3],
    [3, 4],
  ];
  return { blockers: fallback, board: applyBlockers(fallback) };
}

export interface Placement {
  id: string;
  cells: Cell[];
  ox: number;
  oy: number;
}

function solveWithPlacements(
  board: BoardCell[][],
  pieces: PieceDef[],
  idx: number,
  acc: Placement[],
  level: SquareLevelDef,
): Placement[] | null {
  if (idx >= pieces.length) {
    return violatesLevelRestrictions(board, level) ? null : acc;
  }
  const piece = pieces[idx];
  const orients = allOrientations(piece.cells);
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
  if (firstX === -1) return null;

  for (const orient of orients) {
    for (const [dx, dy] of orient) {
      const ox = firstX - dx;
      const oy = firstY - dy;
      if (canPlaceAt(board, orient, ox, oy, level, piece.id)) {
        const next = placeCells(board, orient, ox, oy, piece.id);
        const res = solveWithPlacements(next, pieces, idx + 1, [
          ...acc,
          { id: piece.id, cells: orient, ox, oy },
        ], level);
        if (res) return res;
      }
    }
  }
  return null;
}

/** Full solution for a set of blockers: one placement per piece. */
export function solveBlockers(blockers: Cell[], levelId: SquareLevelId = "starter"): Placement[] | null {
  const level = getLevel(levelId);
  const board = applyBlockers(blockers);
  const ordered = [...PIECES].sort((a, b) => b.cells.length - a.cells.length);
  return solveWithPlacements(board, ordered, 0, [], level);
}

export function isSolved(board: BoardCell[][], level?: SquareLevelDef): boolean {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === null) return false;
    }
  }
  if (level && violatesLevelRestrictions(board, level)) return false;
  return true;
}
