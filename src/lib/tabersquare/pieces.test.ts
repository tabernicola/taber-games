import { describe, expect, it } from "vitest";
import { allOrientations, flip, normalize, rotate, PIECES, type Cell } from "./pieces";

const L_TRI: Cell[] = [
  [0, 0],
  [1, 0],
  [1, 1],
];

describe("PIECES", () => {
  it("has 9 pieces whose cells sum to 29", () => {
    expect(PIECES).toHaveLength(9);
    expect(PIECES.reduce((sum, p) => sum + p.cells.length, 0)).toBe(29);
  });

  it("numbers pieces 1 through 9", () => {
    expect(PIECES.map((p) => p.number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("normalize", () => {
  it("shifts cells so the minimum is (0,0) and sorts them", () => {
    expect(
      normalize([
        [3, 4],
        [2, 3],
        [2, 4],
      ]),
    ).toEqual([
      [0, 0],
      [0, 1],
      [1, 1],
    ]);
  });

  it("leaves an already normalized shape unchanged", () => {
    expect(normalize(L_TRI)).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
  });
});

describe("rotate", () => {
  it("rotates 90 degrees clockwise and normalizes", () => {
    // horizontal domino becomes vertical
    expect(
      rotate([
        [0, 0],
        [1, 0],
      ]),
    ).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it("returns the original shape after four rotations", () => {
    let c = normalize(L_TRI);
    for (let i = 0; i < 4; i++) c = rotate(c);
    expect(c).toEqual(normalize(L_TRI));
  });
});

describe("flip", () => {
  it("mirrors horizontally and normalizes", () => {
    expect(flip(L_TRI)).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });

  it("is its own inverse", () => {
    expect(flip(flip(L_TRI))).toEqual(normalize(L_TRI));
  });
});

describe("allOrientations", () => {
  it("returns 1 orientation for the monomino and the square", () => {
    expect(allOrientations([[0, 0]])).toHaveLength(1);
    expect(
      allOrientations([
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]),
    ).toHaveLength(1);
  });

  it("returns 2 orientations for a straight piece", () => {
    expect(
      allOrientations([
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ]),
    ).toHaveLength(2);
  });

  it("returns 4 orientations for the T tetromino", () => {
    expect(
      allOrientations([
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ]),
    ).toHaveLength(4);
  });

  it("returns 4 orientations for the S tetromino (flip needed)", () => {
    expect(
      allOrientations([
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ]),
    ).toHaveLength(4);
  });

  it("returns 8 orientations for the L tetromino", () => {
    expect(
      allOrientations([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]),
    ).toHaveLength(8);
  });

  it("returns only normalized, unique orientations", () => {
    const orients = allOrientations(L_TRI);
    const keys = orients.map((o) => JSON.stringify(o));
    expect(new Set(keys).size).toBe(orients.length);
    for (const o of orients) {
      expect(normalize(o)).toEqual(o);
    }
  });
});
