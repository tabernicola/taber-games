import { describe, expect, it } from "vitest";
import { PLACE_CHARACTER_DEMO, RULE_DEMOS, DEMO_CENTER_CELL, isCrossRevealed } from "./ruleDemos";
import { buildScript, durationOf, scriptDuration } from "./tutorialScript";

describe("buildScript", () => {
  it("places the character with a double tap on the first step", () => {
    const script = buildScript(PLACE_CHARACTER_DEMO);
    const taps = script.filter((action) => action.kind === "tap");

    expect(taps).toHaveLength(1);
    expect(taps[0]).toMatchObject({
      cell: PLACE_CHARACTER_DEMO.charCell,
      double: true,
    });
    expect(script.some((action) => action.kind === "reveal" && action.what === "char")).toBe(true);
    expect(script.some((action) => action.kind === "reveal" && action.what === "cross")).toBe(
      false,
    );
  });

  it("reveals the character only after both taps of the double click", () => {
    const script = buildScript(PLACE_CHARACTER_DEMO);
    const tapAt = script.findIndex((action) => action.kind === "tap");
    const revealAt = script.findIndex(
      (action) => action.kind === "reveal" && action.what === "char",
    );

    expect(tapAt).toBeGreaterThanOrEqual(0);
    expect(revealAt).toBeGreaterThan(tapAt);
  });

  it("marks every X in the same order the hand taps it", () => {
    for (const demo of RULE_DEMOS) {
      const script = buildScript(demo);
      let crossCount = 0;
      let lastTapCell: number | null = null;

      for (const action of script) {
        if (action.kind === "tap") lastTapCell = action.cell;
        if (action.kind === "reveal" && action.what === "cross") {
          // The k-th reveal must light up crossCells[k], and the hand must be
          // on that same cell when it happens.
          expect(lastTapCell).toBe(demo.crossCells[crossCount]);
          expect(
            isCrossRevealed(demo.crossCells, demo.crossCells[crossCount], crossCount + 1),
          ).toBe(true);
          crossCount++;
        }
      }

      expect(crossCount).toBe(demo.crossCells.length);
    }
  });

  it("walks the hand from the middle to the cell and back on the first step", () => {
    const script = buildScript(PLACE_CHARACTER_DEMO);
    const moves = script.filter((action) => action.kind === "move");

    // The hand rests in the middle, so the first beat settles instead of moving.
    expect(script[0].kind).toBe("pause");
    expect(moves.map((action) => (action.kind === "move" ? action.cell : -1))).toEqual([
      PLACE_CHARACTER_DEMO.charCell,
      DEMO_CENTER_CELL,
    ]);
  });

  it("keeps the hand in the middle between passes of the first step", () => {
    const script = buildScript(PLACE_CHARACTER_DEMO);
    const last = script[script.length - 1];

    // The loop restarts from the same resting state the script ends on, so the
    // hand never jumps when the demo repeats.
    expect(last.kind).toBe("pause");
    expect(scriptDuration(script)).toBeGreaterThan(0);
  });

  it("never marks the cell that holds the character", () => {
    for (const demo of RULE_DEMOS) {
      expect(demo.crossCells).not.toContain(demo.charCell);
    }
  });

  it("only ever places the character on rule steps, never a second time", () => {
    for (const demo of RULE_DEMOS) {
      const script = buildScript(demo);
      expect(script.some((action) => action.kind === "reveal" && action.what === "char")).toBe(
        false,
      );
      // Rule steps start with the character already on the board, so the first
      // beat is a settle, never a move to the character.
      expect(script[0].kind).toBe("pause");
    }
  });
});

describe("durationOf", () => {
  it("gives every action a positive duration", () => {
    for (const demo of [PLACE_CHARACTER_DEMO, ...RULE_DEMOS]) {
      for (const action of buildScript(demo)) {
        expect(durationOf(action)).toBeGreaterThan(0);
      }
    }
  });

  it("keeps a double tap on screen longer than a single tap", () => {
    expect(durationOf({ kind: "tap", cell: 0, double: true })).toBeGreaterThan(
      durationOf({ kind: "tap", cell: 0, double: false }),
    );
  });

  it("keeps each loop short enough to stay watchable", () => {
    for (const demo of [PLACE_CHARACTER_DEMO, ...RULE_DEMOS]) {
      expect(scriptDuration(buildScript(demo))).toBeLessThan(10_000);
    }
  });
});

describe("isCrossRevealed", () => {
  const crosses = [1, 2, 3, 4];

  it("reveals nothing when no mark has been placed", () => {
    for (let cell = 0; cell < 9; cell++) {
      expect(isCrossRevealed(crosses, cell, 0)).toBe(false);
    }
  });

  it("reveals the marks in order, one per increment", () => {
    expect(isCrossRevealed(crosses, 1, 1)).toBe(true);
    expect(isCrossRevealed(crosses, 2, 1)).toBe(false);
    expect(isCrossRevealed(crosses, 2, 2)).toBe(true);
  });

  it("reveals every mark once the count reaches the total", () => {
    for (const cell of crosses) {
      expect(isCrossRevealed(crosses, cell, crosses.length)).toBe(true);
    }
  });

  it("never reveals a cell that is not part of the rule", () => {
    for (const cell of [0, 5, 6, 7, 8]) {
      expect(isCrossRevealed(crosses, cell, 99)).toBe(false);
    }
  });
});
