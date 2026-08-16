import { describe, expect, it } from "vitest";
import {
  candidatesAt,
  conflictsAt,
  createLevel,
  edgesAt,
  emptyBoard,
  fitsAt,
  isSolved,
  matchedSeams,
  rotate,
  totalConflicts,
  type Edges,
  type Level,
  type Placement,
  type Rotation,
} from "./game";

const EDGES: Edges = [1, 2, 3, 4];

function solvedBoard(level: Level): Placement[] {
  if (!level.solution) throw new Error("level has no solution");
  return level.solution.map((s) => ({ tileId: s.tileId, rotation: s.rotation, locked: false }));
}

describe("rotate", () => {
  it("returns the same edges for rotation 0", () => {
    expect(rotate(EDGES, 0)).toEqual([1, 2, 3, 4]);
  });

  it("rotates a quarter turn clockwise", () => {
    expect(rotate(EDGES, 1)).toEqual([4, 1, 2, 3]);
  });

  it("rotates a half turn", () => {
    expect(rotate(EDGES, 2)).toEqual([3, 4, 1, 2]);
  });

  it("rotates three quarter turns", () => {
    expect(rotate(EDGES, 3)).toEqual([2, 3, 4, 1]);
  });

  it("returns to the original after four quarter turns", () => {
    let e = EDGES;
    for (let i = 0; i < 4; i++) e = rotate(e, 1);
    expect(e).toEqual(EDGES);
  });
});

describe("createLevel", () => {
  it.each([4, 6, 8, 12] as const)("builds a solvable %ix%i random level", (size) => {
    const level = createLevel(size);
    expect(level.size).toBe(size);
    expect(level.original).toBe(false);
    expect(level.tiles).toHaveLength(size * size);
    expect(level.solution).toHaveLength(size * size);

    const board = solvedBoard(level);
    expect(isSolved(level, board)).toBe(true);
    expect(totalConflicts(level, board)).toBe(0);
  });

  it.each([
    [4, 5], // 4 corners + center = 5 hints
    [6, 4], // 3 corners + center = 4 hints
    [8, 3], // 2 corners + center = 3 hints
    [12, 2], // 1 corner + center = 2 hints
  ] as const)("provides progressive hints for %ix%i level", (size, expectedHints) => {
    const level = createLevel(size);
    expect(level.fixed).toHaveLength(expectedHints);

    // Check that the center piece is always fixed
    const centerPos = Math.floor(size / 2) * size + Math.floor(size / 2);
    expect(level.fixed.some((f) => f.index === centerPos)).toBe(true);

    // Check that fixed pieces are valid and don't conflict
    const board = emptyBoard(level);
    for (const fixed of level.fixed) {
      expect(conflictsAt(level, board, fixed.index)).toBe(0);
    }
  });

  it("random levels use each tile exactly once in the solution", () => {
    const level = createLevel(6);
    const ids = level.solution!.map((s) => s.tileId).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 36 }, (_, i) => i));
  });

  it("builds the original 16x16 board with the clue piece fixed", () => {
    const level = createLevel(16);
    expect(level.size).toBe(16);
    expect(level.original).toBe(true);
    expect(level.tiles).toHaveLength(256);
    expect(level.solution).toBeUndefined();
    expect(level.fixed).toHaveLength(1);

    const board = emptyBoard(level);
    const clue = level.fixed[0];
    expect(board[clue.index]).toEqual({
      tileId: clue.tileId,
      rotation: clue.rotation,
      locked: true,
    });
    expect(conflictsAt(level, board, clue.index)).toBe(0);
  });
});

describe("emptyBoard", () => {
  it("creates a board with fixed pieces pre-placed and locked", () => {
    const level = createLevel(4);
    const board = emptyBoard(level);
    expect(board).toHaveLength(16);

    // Count non-null (fixed) pieces
    const fixedCount = board.filter((p) => p !== null).length;
    expect(fixedCount).toBe(level.fixed.length);

    // All fixed pieces should be locked
    for (let i = 0; i < board.length; i++) {
      if (board[i] !== null) {
        expect(board[i]!.locked).toBe(true);
      }
    }
  });
});

describe("edgesAt", () => {
  it("returns null for an empty cell", () => {
    const level = createLevel(4);
    expect(edgesAt(level, null)).toBeNull();
  });

  it("returns the tile edges rotated by the placement rotation", () => {
    const level = createLevel(4);
    const placement: Placement = { tileId: 0, rotation: 1, locked: false };
    expect(edgesAt(level, placement)).toEqual(rotate(level.tiles[0].edges, 1));
  });
});

describe("conflicts and solving", () => {
  it("reports zero conflicts on an empty board", () => {
    const level = createLevel(4);
    expect(totalConflicts(level, emptyBoard(level))).toBe(0);
  });

  it("an empty board is not solved", () => {
    const level = createLevel(4);
    expect(isSolved(level, emptyBoard(level))).toBe(false);
  });

  it("swapping two solved tiles introduces conflicts", () => {
    const level = createLevel(4);
    const board = solvedBoard(level);
    // swap a corner with a centre cell: frame constraints must break
    const swapped = board.slice();
    [swapped[0], swapped[5]] = [swapped[5], swapped[0]];
    expect(totalConflicts(level, swapped)).toBeGreaterThan(0);
    expect(isSolved(level, swapped)).toBe(false);
  });
});

describe("matchedSeams", () => {
  it("counts all seams as matched on a solved board", () => {
    const level = createLevel(4);
    const board = solvedBoard(level);
    const { matched, total } = matchedSeams(level, board);
    expect(total).toBe(2 * 4 * 3);
    expect(matched).toBe(total);
  });

  it("counts no seams on an empty board", () => {
    const level = createLevel(4);
    expect(matchedSeams(level, emptyBoard(level)).matched).toBe(0);
  });
});

describe("fitsAt", () => {
  it("accepts each solved tile at its own cell", () => {
    const level = createLevel(4);
    const board = solvedBoard(level);
    for (let i = 0; i < board.length; i++) {
      const e = edgesAt(level, board[i])!;
      expect(fitsAt(level, board, i, e)).toBe(true);
    }
  });

  it("rejects a non-border tile at a corner", () => {
    const level = createLevel(4);
    const board = emptyBoard(level);
    const inner: Edges = [1, 2, 3, 4]; // no border (0) edges
    expect(fitsAt(level, board, 0, inner)).toBe(false);
  });

  it("rejects a border edge facing the inside", () => {
    const level = createLevel(4);
    const board = emptyBoard(level);
    const withBorder: Edges = [0, 1, 0, 2];
    expect(fitsAt(level, board, 5, withBorder)).toBe(false); // 5 is an inner cell
  });
});

describe("candidatesAt", () => {
  it("finds the solution tile among candidates for an empty cell", () => {
    const level = createLevel(4);
    const board = emptyBoard(level);
    const sol = level.solution![0];
    const candidates = candidatesAt(level, board, 0, level.tiles);
    expect(candidates.has(sol.tileId)).toBe(true);
  });

  it("returns rotations that actually fit", () => {
    const level = createLevel(4);
    const board = emptyBoard(level);
    const candidates = candidatesAt(level, board, 0, level.tiles);
    for (const [tileId, r] of candidates) {
      expect(fitsAt(level, board, 0, rotate(level.tiles[tileId].edges, r as Rotation))).toBe(true);
    }
  });
});
