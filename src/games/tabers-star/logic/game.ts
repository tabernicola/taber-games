// Core game logic for The Taber's Star, a solo puzzle inspired by
// The Genius Star: a six-pointed star board of 48 unit triangles,
// 7 dice-based blockers and 7 triangular pieces (41 cells) that must
// exactly fill the remaining space.

import { SQRT3, triCentroid, triKey, type Tri } from "./geometry";
import { allTriOrientations } from "./geometry";
import { STAR_PIECES, type StarPieceDef } from "./pieces";
import { rollAllDice } from "./dice";
import { getCellsWithNumbers } from "./numberMapping";

export const BLOCKER = "#";
export const BLOCKER_COUNT = 7;

/** Board cell state: null = empty, "#" = blocker, otherwise pieceId. */
export type StarBoardCell = null | typeof BLOCKER | string;

/** The star: central hexagon (side 2) plus 6 equilateral tips (side 2). */
export const BOARD: Tri[] = buildStarBoard();
export const BOARD_SIZE = BOARD.length; // 48

export const TRI_INDEX = new Map<string, number>(BOARD.map((t, i) => [triKey(t), i]));

/** Palestinian flag colors by cell index (1-48) */
// Red cells (arrow): 1, 2, 3, 5, 6, 7, 8, 9
const RED_CELLS = [1, 2, 3, 5, 6, 7, 8, 9];
// Black cells (rows 1, 3): 16, 17, 25, 26, 27, 34, 35, 36, 37, 38, 45, 46, 48
const BLACK_CELLS = [16, 17, 25, 26, 27, 34, 35, 36, 37, 38, 45, 46, 48];
// White cells (rows 2, 4): 10, 18, 19, 20, 21, 28, 29, 30, 31, 39, 40, 41, 42, 47
const WHITE_CELLS = [10, 18, 19, 20, 21, 28, 29, 30, 31, 39, 40, 41, 42, 47];

/** Get color for a cell index (0-47, corresponds to board position) */
export function getCellColor(index: number): string {
  // Convert to 1-based index
  const cellNum = index + 1;

  if (RED_CELLS.includes(cellNum)) return "#DC143C"; // Crimson red
  if (BLACK_CELLS.includes(cellNum)) return "#1a1a1a"; // Dark charcoal (visible black)
  if (WHITE_CELLS.includes(cellNum)) return "#FFFFFF"; // White
  return "#228B22"; // Forest green for the rest
}

function buildStarBoard(): Tri[] {
  const apothem = SQRT3; // hexagon side s=2 -> apothem s*sqrt(3)/2
  const eps = 1e-7;
  const inHexagon = (x: number, y: number) =>
    Math.abs(y) <= apothem + eps &&
    Math.abs((SQRT3 / 2) * x - y / 2) <= apothem + eps &&
    Math.abs((SQRT3 / 2) * x + y / 2) <= apothem + eps;

  // Hexagon vertices at angles 0°,60°,...,300°, radius 2.
  const verts: [number, number][] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    verts.push([2 * Math.cos(a), 2 * Math.sin(a)]);
  }

  // Tip k is the equilateral triangle erected outwards on edge k.
  const tips: [number, number][][] = verts.map((v0, k) => {
    const v1 = verts[(k + 1) % 6];
    const mx = (v0[0] + v1[0]) / 2;
    const my = (v0[1] + v1[1]) / 2;
    const len = Math.hypot(mx, my);
    const nx = mx / len;
    const ny = my / len;
    return [v0, v1, [mx + SQRT3 * nx, my + SQRT3 * ny]];
  });

  const sign = (p: [number, number], a: [number, number], b: [number, number]) =>
    (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);

  const inTip = (p: [number, number], tri: [number, number][]) => {
    const s1 = sign(p, tri[0], tri[1]);
    const s2 = sign(p, tri[1], tri[2]);
    const s3 = sign(p, tri[2], tri[0]);
    const hasNeg = s1 < -eps || s2 < -eps || s3 < -eps;
    const hasPos = s1 > eps || s2 > eps || s3 > eps;
    return !(hasNeg && hasPos);
  };

  const cells: Tri[] = [];
  for (let q = -6; q <= 6; q++) {
    for (let r = -6; r <= 6; r++) {
      for (const dgt of [0, 1] as const) {
        const t: Tri = { q, r, d: dgt };
        const [x, y] = triCentroid(t);
        if (inHexagon(x, y) || tips.some((tip) => inTip([x, y], tip))) {
          cells.push(t);
        }
      }
    }
  }
  return cells.sort((a, b) => a.q - b.q || a.q + a.r - (b.q + b.r) || a.r - b.r || a.d - b.d);
}

export function emptyStarBoard(): StarBoardCell[] {
  return Array<StarBoardCell>(BOARD_SIZE).fill(null);
}

export function applyStarBlockers(blockers: Tri[]): StarBoardCell[] {
  const b = emptyStarBoard();
  for (const t of blockers) {
    const i = TRI_INDEX.get(triKey(t));
    if (i !== undefined) b[i] = BLOCKER;
  }
  return b;
}

/** Absolute triangles of a piece whose local cells start at translation (dq, dr). */
export function absTris(cells: Tri[], dq: number, dr: number): Tri[] {
  return cells.map((t) => ({ q: t.q + dq, r: t.r + dr, d: t.d }));
}

export function canPlaceAt(board: StarBoardCell[], cells: Tri[], dq: number, dr: number): boolean {
  for (const t of absTris(cells, dq, dr)) {
    const i = TRI_INDEX.get(triKey(t));
    if (i === undefined || board[i] !== null) return false;
  }
  return true;
}

export function placeCells(
  board: StarBoardCell[],
  cells: Tri[],
  dq: number,
  dr: number,
  value: string,
): StarBoardCell[] {
  const next = board.slice();
  for (const t of absTris(cells, dq, dr)) {
    const i = TRI_INDEX.get(triKey(t));
    if (i !== undefined) next[i] = value;
  }
  return next;
}

export function removePiece(board: StarBoardCell[], pieceId: string): StarBoardCell[] {
  return board.map((c) => (c === pieceId ? null : c));
}

function firstEmptyIndex(board: StarBoardCell[]): number | null {
  return board.indexOf(null) >= 0 ? board.indexOf(null) : null;
}

export interface StarPlacement {
  id: string;
  tris: Tri[]; // absolute
}

interface SolveState {
  board: StarBoardCell[];
}

function solveWithPlacements(
  state: SolveState,
  pieces: StarPieceDef[],
  acc: StarPlacement[],
): StarPlacement[] | null {
  if (pieces.length === 0) return acc;
  const first = firstEmptyIndex(state.board);
  if (first === null) return null;
  const anchor = BOARD[first];

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    const rest = pieces.slice(0, i).concat(pieces.slice(i + 1));
    for (const orient of ORIENTATIONS.get(piece.id) ?? []) {
      // Any cell of the orientation may be the one covering the anchor.
      for (let ci = 0; ci < orient.length; ci++) {
        const base = orient[ci];
        const dq = anchor.q - base.q;
        const dr = anchor.r - base.r;
        if (!canPlaceAt(state.board, orient, dq, dr)) continue;
        state.board = placeCells(state.board, orient, dq, dr, piece.id);
        const res = solveWithPlacements(state, rest, [
          ...acc,
          { id: piece.id, tris: absTris(orient, dq, dr) },
        ]);
        if (res) return res;
        state.board = removePiece(state.board, piece.id);
      }
    }
  }
  return null;
}

const ORIENTATIONS = new Map<string, Tri[][]>(
  STAR_PIECES.map((p) => [p.id, allTriOrientations(p.cells)]),
);

/** All pieces, largest first — the order the backtracking searches try them in. */
const PACK_PIECES: StarPieceDef[] = [...STAR_PIECES].sort(
  (a, b) => b.cells.length - a.cells.length,
);

function orderedPieces(): StarPieceDef[] {
  return [...PACK_PIECES];
}

export interface StarPuzzle {
  blockers: Tri[];
  board: StarBoardCell[];
  solution: StarPlacement[] | null;
}

/**
 * Generates a puzzle using the dice system: roll 7 dice to determine
 * which cells become blockers. This maps dice results to board cells
 * using the number mapping system.
 */
export function generatePuzzle(maxAttempts = 200): StarPuzzle {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Roll the 7 dice to get 7 numbers
    const rolledNumbers = rollAllDice();

    // Map dice numbers to board cells
    const blockerCells = getCellsWithNumbers(rolledNumbers, BOARD);

    // Must have exactly 7 valid blockers
    if (blockerCells.length !== BLOCKER_COUNT) continue;

    // Check if this puzzle is solvable
    const board = applyStarBlockers(blockerCells);
    const solution = solveWithPlacements({ board }, orderedPieces(), []);

    if (solution) {
      return { blockers: blockerCells, board, solution };
    }
  }
  throw new Error("taberstar: could not generate a solvable puzzle");
}

/** Full solution for a set of blockers: one placement per piece. */
export function solveStar(blockers: Tri[]): StarPlacement[] | null {
  const board = applyStarBlockers(blockers);
  return solveWithPlacements({ board }, orderedPieces(), []);
}

/** Assign colors to pieces based on their position in the solution */
export function assignPieceColors(
  solution: StarPlacement[],
): { id: string; name: string; color: string; cellColors: string[] }[] {
  return solution.map((pl) => {
    const pieceDef = STAR_PIECES.find((p) => p.id === pl.id);
    if (!pieceDef) {
      return { id: pl.id, name: "Unknown", color: "gray", cellColors: pl.tris.map(() => "gray") };
    }

    const cellColors = pl.tris.map((tri) => {
      const index = TRI_INDEX.get(triKey(tri));
      return index !== undefined ? getCellColor(index) : "gray";
    });

    return { id: pl.id, name: pieceDef.name, color: pieceDef.color || "gray", cellColors };
  });
}

/** Solved when every board triangle is covered and every piece is used once. */
export function isStarSolved(board: StarBoardCell[]): boolean {
  let pieces = 0;
  let filled = 0;
  for (const c of board) {
    if (c === null) return false;
    if (c !== BLOCKER) {
      filled++;
      pieces++;
    }
  }
  return filled === STAR_PIECES.reduce((n, p) => n + p.cells.length, 0) && pieces > 0;
}
