import { describe, expect, it } from "vitest";
import {
  BLOCKER,
  BOARD_SIZE,
  applyBlockers,
  canPlaceAt,
  emptyBoard,
  generatePuzzle,
  isSolved,
  pieceNumber,
  placeCells,
  removePiece,
  solveBlockers,
  violatesLevelRestrictions,
  wouldViolateRestrictions,
} from "./game";
import { getLevel } from "./levels";
import type { Cell } from "./pieces";

const DOMINO: Cell[] = [
  [0, 0],
  [1, 0],
];

describe("pieceNumber", () => {
  it("maps piece ids to their official numbers", () => {
    expect(pieceNumber("p1")).toBe(1);
    expect(pieceNumber("p9")).toBe(9);
  });

  it("returns 0 for an unknown id", () => {
    expect(pieceNumber("nope")).toBe(0);
  });
});

describe("emptyBoard", () => {
  it("creates a 6x6 board of nulls", () => {
    const b = emptyBoard();
    expect(b).toHaveLength(BOARD_SIZE);
    for (const row of b) {
      expect(row).toHaveLength(BOARD_SIZE);
      expect(row.every((c) => c === null)).toBe(true);
    }
  });
});

describe("applyBlockers", () => {
  it("marks the given cells as blockers", () => {
    const b = applyBlockers([
      [0, 0],
      [5, 5],
    ]);
    expect(b[0][0]).toBe(BLOCKER);
    expect(b[5][5]).toBe(BLOCKER);
    expect(b[1][1]).toBeNull();
  });
});

describe("canPlaceAt", () => {
  it("allows a piece on empty cells", () => {
    expect(canPlaceAt(emptyBoard(), DOMINO, 0, 0)).toBe(true);
  });

  it("rejects placements outside the board", () => {
    expect(canPlaceAt(emptyBoard(), DOMINO, 5, 0)).toBe(false);
    expect(canPlaceAt(emptyBoard(), DOMINO, -1, 0)).toBe(false);
    expect(canPlaceAt(emptyBoard(), DOMINO, 0, 6)).toBe(false);
  });

  it("rejects placements over blockers or other pieces", () => {
    const withBlocker = applyBlockers([[1, 0]]);
    expect(canPlaceAt(withBlocker, DOMINO, 0, 0)).toBe(false);

    const withPiece = placeCells(emptyBoard(), DOMINO, 0, 0, "p2");
    expect(canPlaceAt(withPiece, DOMINO, 1, 0)).toBe(false);
  });

  it("rejects a restricted piece touching another restricted piece", () => {
    const junior = getLevel("junior"); // pieces 1 and 2 may not touch
    const board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    expect(canPlaceAt(board, DOMINO, 1, 0, junior, "p2")).toBe(false);
    expect(canPlaceAt(board, DOMINO, 2, 0, junior, "p2")).toBe(true);
  });
});

describe("placeCells and removePiece", () => {
  it("places cells without mutating the original board", () => {
    const board = emptyBoard();
    const next = placeCells(board, DOMINO, 2, 3, "p2");
    expect(next[3][2]).toBe("p2");
    expect(next[3][3]).toBe("p2");
    expect(board[3][2]).toBeNull();
  });

  it("removes only the matching piece", () => {
    let board = placeCells(emptyBoard(), DOMINO, 0, 0, "p2");
    board = placeCells(board, [[0, 0]], 3, 3, "p1");
    const next = removePiece(board, "p2");
    expect(next[0][0]).toBeNull();
    expect(next[0][1]).toBeNull();
    expect(next[3][3]).toBe("p1");
  });
});

describe("violatesLevelRestrictions", () => {
  it("never flags the starter level", () => {
    let board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    board = placeCells(board, DOMINO, 1, 0, "p2");
    expect(violatesLevelRestrictions(board, getLevel("starter"))).toBe(false);
  });

  it("flags restricted pieces sharing a side", () => {
    let board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    board = placeCells(board, DOMINO, 1, 0, "p2");
    expect(violatesLevelRestrictions(board, getLevel("junior"))).toBe(true);
  });

  it("allows restricted pieces touching only diagonally", () => {
    let board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    board = placeCells(board, DOMINO, 1, 1, "p2");
    expect(violatesLevelRestrictions(board, getLevel("junior"))).toBe(false);
  });
});

describe("wouldViolateRestrictions", () => {
  it("returns false for an unrestricted piece", () => {
    const board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    expect(wouldViolateRestrictions(board, DOMINO, 1, 0, "p5", getLevel("junior"))).toBe(false);
  });

  it("detects a restricted piece about to touch another", () => {
    const board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    expect(wouldViolateRestrictions(board, DOMINO, 1, 0, "p2", getLevel("junior"))).toBe(true);
    expect(wouldViolateRestrictions(board, DOMINO, 2, 0, "p2", getLevel("junior"))).toBe(false);
  });
});

describe("generatePuzzle", () => {
  it("produces 7 blockers on a board with 29 free cells", () => {
    const { blockers, board } = generatePuzzle();
    expect(blockers).toHaveLength(7);
    const free = board.flat().filter((c) => c === null).length;
    expect(free).toBe(29);
    const blocked = board.flat().filter((c) => c === BLOCKER).length;
    expect(blocked).toBe(7);
  });

  it("produces a solvable puzzle", () => {
    const { blockers } = generatePuzzle();
    expect(solveBlockers(blockers)).not.toBeNull();
  });
});

describe("solveBlockers", () => {
  it("returns one placement per piece that tiles the board", () => {
    const { blockers } = generatePuzzle();
    const placements = solveBlockers(blockers);
    expect(placements).not.toBeNull();
    expect(placements!).toHaveLength(9);

    let board = applyBlockers(blockers);
    for (const p of placements!) {
      expect(canPlaceAt(board, p.cells, p.ox, p.oy)).toBe(true);
      board = placeCells(board, p.cells, p.ox, p.oy, p.id);
    }
    expect(isSolved(board)).toBe(true);
  });
});

describe("isSolved", () => {
  it("is false while empty cells remain", () => {
    expect(isSolved(emptyBoard())).toBe(false);
  });

  it("is true when every cell is filled", () => {
    const board = emptyBoard().map((row) => row.map(() => "p1"));
    expect(isSolved(board)).toBe(true);
  });

  it("is false when a filled board violates level restrictions", () => {
    let board = placeCells(emptyBoard(), [[0, 0]], 0, 0, "p1");
    board = placeCells(board, DOMINO, 1, 0, "p2");
    const filled = board.map((row) => row.map((c) => c ?? "p5"));
    expect(isSolved(filled, getLevel("junior"))).toBe(false);
    expect(isSolved(filled, getLevel("starter"))).toBe(true);
  });
});
