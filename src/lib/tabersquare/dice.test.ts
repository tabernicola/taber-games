import { describe, expect, it } from "vitest";
import { DICE, dedupeBlockers, rollDice } from "./dice";
import type { Cell } from "./pieces";

describe("DICE", () => {
  it("has 7 dice with 6 faces each", () => {
    expect(DICE).toHaveLength(7);
    for (const die of DICE) expect(die).toHaveLength(6);
  });

  it("only uses coordinates inside the 6x6 board", () => {
    for (const die of DICE) {
      for (const [x, y] of die) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(6);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(6);
      }
    }
  });

  it("covers every cell of the board", () => {
    const covered = new Set(DICE.flat().map(([x, y]) => `${x},${y}`));
    expect(covered.size).toBe(36);
  });
});

describe("rollDice", () => {
  it("returns one face per die", () => {
    const roll = rollDice();
    expect(roll).toHaveLength(7);
    roll.forEach((cell, i) => {
      expect(DICE[i].map(([x, y]) => `${x},${y}`)).toContain(`${cell[0]},${cell[1]}`);
    });
  });
});

describe("dedupeBlockers", () => {
  it("keeps unique cells in order", () => {
    const cells: Cell[] = [
      [0, 0],
      [1, 1],
      [2, 2],
    ];
    expect(dedupeBlockers(cells)).toEqual(cells);
  });

  it("removes duplicate coordinates, keeping the first", () => {
    expect(
      dedupeBlockers([
        [0, 0],
        [1, 1],
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
    ).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  it("returns an empty array for no blockers", () => {
    expect(dedupeBlockers([])).toEqual([]);
  });
});
