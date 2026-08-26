// Core game logic for The Taber's Star, a solo puzzle inspired by
// The Genius Star: a six-pointed star board of 48 unit triangles,
// 6 random blockers and 7 triangular pieces (41 cells) that must
// exactly fill the remaining space.

import { SQRT3, triCentroid, triKey, type Tri } from "./geometry";
import { allTriOrientations } from "./geometry";
import { STAR_PIECES, type StarPieceDef } from "./pieces";

export const BLOCKER = "#";
export const BLOCKER_COUNT = 7;

/** Board cell state: null = empty, "#" = blocker, otherwise pieceId. */
export type StarBoardCell = null | typeof BLOCKER | string;

/** The star: central hexagon (side 2) plus 6 equilateral tips (side 2). */
export const BOARD: Tri[] = buildStarBoard();
export const BOARD_SIZE = BOARD.length; // 48

const TRI_INDEX = new Map<string, number>(BOARD.map((t, i) => [triKey(t), i]));

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
  return cells.sort((a, b) => a.r - b.r || a.q - b.q || a.d - b.d);
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
}

/**
 * Generates a guaranteed-solvable puzzle by construction: the pieces are
 * packed onto the empty star first (randomized backtracking) and the cells
 * left over become the blockers.
 */
export function generatePuzzle(maxAttempts = 200): StarPuzzle {
  const occupied = new Array<boolean>(BOARD_SIZE).fill(false);

  const packFrom = (pieceIdx: number): StarPlacement[] | null => {
    if (pieceIdx >= PACK_PIECES.length) return [];
    const piece = PACK_PIECES[pieceIdx];
    const orients = ORIENTATIONS.get(piece.id)!;
    // Randomize search order so every attempt explores a different packing.
    const anchor = occupied.indexOf(false);
    const oStart = Math.floor(Math.random() * orients.length);
    for (let oi = 0; oi < orients.length; oi++) {
      const orient = orients[(oi + oStart) % orients.length];
      for (let ci = 0; ci < orient.length; ci++) {
        const base = orient[ci];
        const dq = BOARD[anchor].q - base.q;
        const dr = BOARD[anchor].r - base.r;
        if (!canPlaceAtMask(occupied, orient, dq, dr)) continue;
        for (const t of absTris(orient, dq, dr)) {
          occupied[TRI_INDEX.get(triKey(t))!] = true;
        }
        const rest = packFrom(pieceIdx + 1);
        if (rest) return [{ id: piece.id, tris: absTris(orient, dq, dr) }, ...rest];
        for (const t of absTris(orient, dq, dr)) {
          occupied[TRI_INDEX.get(triKey(t))!] = false;
        }
      }
    }
    return null;
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    occupied.fill(false);
    // Shuffle which piece is tried first at the top level for variety.
    const swap = Math.floor(Math.random() * PACK_PIECES.length);
    [PACK_PIECES[0], PACK_PIECES[swap]] = [PACK_PIECES[swap], PACK_PIECES[0]];
    const placements = packFrom(0);
    if (placements && placements.length === STAR_PIECES.length) {
      const blockers = BOARD.filter((_, i) => !occupied[i]);
      if (blockers.length !== BLOCKER_COUNT) continue;
      return { blockers, board: applyStarBlockers(blockers) };
    }
  }
  throw new Error("taberstar: could not generate a solvable puzzle");
}

function canPlaceAtMask(occupied: boolean[], cells: Tri[], dq: number, dr: number): boolean {
  for (const t of absTris(cells, dq, dr)) {
    const i = TRI_INDEX.get(triKey(t));
    if (i === undefined || occupied[i]) return false;
  }
  return true;
}

/** Full solution for a set of blockers: one placement per piece. */
export function solveStar(blockers: Tri[]): StarPlacement[] | null {
  const board = applyStarBlockers(blockers);
  return solveWithPlacements({ board }, orderedPieces(), []);
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
