import { ETERNITY2_ORIGINAL_PIECES, ETERNITY2_CLUE } from "./pieces-original";

export type Edges = readonly [number, number, number, number]; // top, right, bottom, left
export type Rotation = 0 | 1 | 2 | 3;

export type Tile = {
  id: number;
  edges: Edges;
};

export type Placement = {
  tileId: number;
  rotation: Rotation;
  locked: boolean;
} | null;

export type Level = {
  size: number;
  tiles: Tile[];
  /** cells that start already filled and cannot be moved */
  fixed: { index: number; tileId: number; rotation: Rotation }[];
  /** true for the original, published Eternity II puzzle */
  original: boolean;
};

export const LEVELS = [4, 6, 8, 12, 16] as const;
export type LevelSize = (typeof LEVELS)[number];

/** Edges of a tile after rotating it `r` quarter turns clockwise. */
export function rotate(edges: Edges, r: Rotation): Edges {
  return [
    edges[(0 - r + 4) % 4],
    edges[(1 - r + 4) % 4],
    edges[(2 - r + 4) % 4],
    edges[(3 - r + 4) % 4],
  ] as const;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PATTERN_COUNT: Record<number, number> = { 4: 4, 6: 6, 8: 9, 12: 14 };

/** Builds a guaranteed-solvable random board of the given size. */
function generateRandomLevel(size: number): Level {
  const k = PATTERN_COUNT[size] ?? 10;
  const rnd = () => 1 + Math.floor(Math.random() * k);

  // horizontal seams between row r and r+1, vertical seams between col c and c+1
  const h: number[][] = Array.from({ length: size - 1 }, () =>
    Array.from({ length: size }, rnd),
  );
  const v: number[][] = Array.from({ length: size }, () =>
    Array.from({ length: size - 1 }, rnd),
  );

  const solved: Edges[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      solved.push([
        r === 0 ? 0 : h[r - 1][c],
        c === size - 1 ? 0 : v[r][c],
        r === size - 1 ? 0 : h[r][c],
        c === 0 ? 0 : v[r][c - 1],
      ] as const);
    }
  }

  // tiles are handed to the player already rotated and shuffled
  const tiles: Tile[] = shuffle(
    solved.map((edges, i) => ({
      id: i,
      edges: rotate(edges, Math.floor(Math.random() * 4) as Rotation),
    })),
  ).map((t, i) => ({ id: i, edges: t.edges }));

  return { size, tiles, fixed: [], original: false };
}

/** The one and only original Eternity II board: fixed 256-piece set + published clue. */
function originalLevel(): Level {
  const tiles: Tile[] = ETERNITY2_ORIGINAL_PIECES.map((edges, i) => ({
    id: i,
    edges: edges as Edges,
  }));
  return {
    size: 16,
    tiles,
    fixed: [
      {
        index: ETERNITY2_CLUE.row * 16 + ETERNITY2_CLUE.col,
        tileId: ETERNITY2_CLUE.pieceIndex,
        rotation: ETERNITY2_CLUE.rotation as Rotation,
      },
    ],
    original: true,
  };
}

export function createLevel(size: LevelSize): Level {
  return size === 16 ? originalLevel() : generateRandomLevel(size);
}

export function emptyBoard(level: Level): Placement[] {
  const board: Placement[] = Array.from({ length: level.size * level.size }, () => null);
  for (const f of level.fixed) {
    board[f.index] = { tileId: f.tileId, rotation: f.rotation, locked: true };
  }
  return board;
}

export function edgesAt(level: Level, p: Placement): Edges | null {
  if (!p) return null;
  return rotate(level.tiles[p.tileId].edges, p.rotation);
}

/**
 * Number of seams around a cell that clash with an already placed neighbour
 * (or with the outer frame). 0 means the tile sits legally where it is.
 */
export function conflictsAt(level: Level, board: Placement[], index: number): number {
  const n = level.size;
  const p = board[index];
  const e = edgesAt(level, p);
  if (!e) return 0;
  const r = Math.floor(index / n);
  const c = index % n;
  let bad = 0;

  // outer frame: edge facing outside must be the grey border pattern (0)
  if (r === 0 !== (e[0] === 0)) bad++;
  if (c === n - 1 !== (e[1] === 0)) bad++;
  if (r === n - 1 !== (e[2] === 0)) bad++;
  if (c === 0 !== (e[3] === 0)) bad++;

  const up = r > 0 ? edgesAt(level, board[index - n]) : null;
  if (up && up[2] !== e[0]) bad++;
  const right = c < n - 1 ? edgesAt(level, board[index + 1]) : null;
  if (right && right[3] !== e[1]) bad++;
  const down = r < n - 1 ? edgesAt(level, board[index + n]) : null;
  if (down && down[0] !== e[2]) bad++;
  const left = c > 0 ? edgesAt(level, board[index - 1]) : null;
  if (left && left[1] !== e[3]) bad++;

  return bad;
}

export function totalConflicts(level: Level, board: Placement[]): number {
  let n = 0;
  for (let i = 0; i < board.length; i++) n += conflictsAt(level, board, i);
  return n;
}

export function isSolved(level: Level, board: Placement[]): boolean {
  return board.every(Boolean) && totalConflicts(level, board) === 0;
}

/** Highest score used for the original board: matching seams out of 480. */
export function matchedSeams(level: Level, board: Placement[]): { matched: number; total: number } {
  const n = level.size;
  const total = 2 * n * (n - 1);
  let matched = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      const e = edgesAt(level, board[i]);
      if (!e) continue;
      if (c < n - 1) {
        const right = edgesAt(level, board[i + 1]);
        if (right && right[3] === e[1]) matched++;
      }
      if (r < n - 1) {
        const down = edgesAt(level, board[i + n]);
        if (down && down[0] === e[2]) matched++;
      }
    }
  }
  return { matched, total };
}
