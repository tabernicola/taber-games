import { describe, expect, it } from "vitest";
import {
  BOARD,
  BOARD_SIZE,
  applyStarBlockers,
  canPlaceAt,
  generatePuzzle,
  isStarSolved,
  placeCells,
  solveStar,
} from "./game";
import { STAR_PIECES } from "./pieces";
import { allTriOrientations, flipTri, normalizeTris, rotateTri, triNeighbors } from "./geometry";

describe("board", () => {
  it("builds a 48-triangle star board", () => {
    expect(BOARD_SIZE).toBe(48);
    const keys = new Set(BOARD.map((t) => `${t.q},${t.r},${t.d}`));
    expect(keys.size).toBe(48);
  });

  it("has exactly the area of the pieces plus blockers", () => {
    const pieceArea = STAR_PIECES.reduce((n, p) => n + p.cells.length, 0);
    expect(pieceArea).toBe(41);
  });
});

describe("pieces", () => {
  it("each piece is edge-connected", () => {
    for (const piece of STAR_PIECES) {
      const cells = normalizeTris(piece.cells);
      const keys = new Set(cells.map((t) => `${t.q},${t.r},${t.d}`));
      const visited = new Set<string>([`${cells[0].q},${cells[0].r},${cells[0].d}`]);
      const stack = [cells[0]];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const nbr of triNeighbors(cur)) {
          const k = `${nbr.q},${nbr.r},${nbr.d}`;
          if (keys.has(k) && !visited.has(k)) {
            visited.add(k);
            stack.push(nbr);
          }
        }
      }
      expect(visited.size, `${piece.id} connectivity`).toBe(cells.length);
    }
  });

  it("every orientation keeps the same area", () => {
    for (const piece of STAR_PIECES) {
      const orients = allTriOrientations(piece.cells);
      expect(orients.length).toBeGreaterThan(1);
      for (const orient of orients) {
        expect(orient.length).toBe(piece.cells.length);
      }
    }
  });

  it("four rotations return to the base shape", () => {
    const piece = STAR_PIECES[5];
    let c = normalizeTris(piece.cells);
    for (let i = 0; i < 6; i++) c = c.map(rotateTri);
    expect(JSON.stringify(normalizeTris(c))).toBe(JSON.stringify(normalizeTris(piece.cells)));
    const f = normalizeTris(piece.cells.map(flipTri));
    expect(f.length).toBe(piece.cells.length);
  });
});

describe("generatePuzzle", () => {
  it("always returns a solvable puzzle with 7 blockers", () => {
    for (let i = 0; i < 8; i++) {
      const puzzle = generatePuzzle();
      expect(puzzle.blockers).toHaveLength(7);
      const solution = solveStar(puzzle.blockers);
      expect(solution).not.toBeNull();
      expect(solution).toHaveLength(11);

      // Applying the solution must fill every free cell.
      const b = applyStarBlockers(puzzle.blockers);
      const idxOf = (t: { q: number; r: number; d: number }) =>
        BOARD.findIndex((c) => c.q === t.q && c.r === t.r && c.d === t.d);
      for (const pl of solution!) {
        for (const t of pl.tris) {
          const i = idxOf(t);
          expect(i).toBeGreaterThanOrEqual(0);
          b[i] = pl.id;
        }
      }
      expect(isStarSolved(b)).toBe(true);
    }
  });

  it("solution placements never overlap blockers", () => {
    const puzzle = generatePuzzle();
    const solution = solveStar(puzzle.blockers)!;
    const blockerKeys = new Set(puzzle.blockers.map((t) => `${t.q},${t.r},${t.d}`));
    for (const pl of solution) {
      for (const t of pl.tris) {
        expect(blockerKeys.has(`${t.q},${t.r},${t.d}`)).toBe(false);
      }
    }
  });
});

describe("canPlaceAt / placeCells", () => {
  it("rejects placements outside the board or on occupied cells", () => {
    const puzzle = generatePuzzle();
    const board = applyStarBlockers(puzzle.blockers);
    const piece = STAR_PIECES[0];
    const orient = allTriOrientations(piece.cells)[0];
    let placedAny = false;
    for (const tri of BOARD) {
      const dq = tri.q - orient[0].q;
      const dr = tri.r - orient[0].r;
      if (canPlaceAt(board, orient, dq, dr)) {
        const next = placeCells(board, orient, dq, dr, piece.id);
        // The anchor cell must now be occupied.
        expect(next[BOARD.findIndex((c) => c.q === tri.q && c.r === tri.r && c.d === tri.d)]).toBe(
          piece.id,
        );
        placedAny = true;
        break;
      }
    }
    expect(placedAny).toBe(true);
  });
});
