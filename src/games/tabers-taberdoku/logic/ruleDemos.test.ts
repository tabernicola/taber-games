import { describe, expect, it } from "vitest";
import {
  GOAL_DEMO,
  GOAL_DEMO_CHARS,
  GOAL_DEMO_SIZE,
  PLACE_CHARACTER_DEMO,
  RULE_DEMOS,
  demoSize,
} from "./ruleDemos";
import { buildDeductionScript } from "./tutorialScript";
import { taberdokuConflicts, type TaberdokuPuzzle } from "./taberdoku";

/**
 * The demo only stores colours, so the room index of a cell is derived from
 * them: two cells share a room when they share a colour.
 */
function roomsOf(demo: { cellColors: string[] }): number[] {
  const roomOfColor = new Map<string, number>();
  return demo.cellColors.map((color) => {
    const existing = roomOfColor.get(color);
    if (existing !== undefined) return existing;
    const index = roomOfColor.size;
    roomOfColor.set(color, index);
    return index;
  });
}

describe("GOAL_DEMO", () => {
  const rooms = roomsOf(GOAL_DEMO);
  const puzzle: TaberdokuPuzzle = {
    id: "goal-demo",
    size: GOAL_DEMO_SIZE,
    rooms,
    givens: [],
    solution: GOAL_DEMO_CHARS,
  };
  const cells = GOAL_DEMO_SIZE * GOAL_DEMO_SIZE;

  it("fits one colour per cell", () => {
    expect(GOAL_DEMO.cellColors).toHaveLength(cells);
    expect(demoSize(GOAL_DEMO)).toBe(GOAL_DEMO_SIZE);
  });

  it("breaks none of the four rules", () => {
    expect(taberdokuConflicts(puzzle, GOAL_DEMO_CHARS).size).toBe(0);
  });

  it("uses one room per character", () => {
    const characterRooms = GOAL_DEMO_CHARS.map((cell) => rooms[cell]);
    expect(new Set(characterRooms).size).toBe(GOAL_DEMO_CHARS.length);
  });

  it("covers every cell with a character or a mark, and never both", () => {
    expect(GOAL_DEMO.charCells.length + GOAL_DEMO.crossCells.length).toBe(cells);
    expect(new Set(GOAL_DEMO.crossCells).size).toBe(GOAL_DEMO.crossCells.length);
    for (const cell of GOAL_DEMO.crossCells) {
      expect(GOAL_DEMO.charCells).not.toContain(cell);
    }
  });

  it("marks only cells the characters already on the board rule out", () => {
    // Walk the walkthrough: the character lands first, and every X that follows
    // must conflict with a character already placed. Otherwise the hand would be
    // marking a cell that could still hold one.
    const placed: number[] = [];
    GOAL_DEMO.charCells.forEach((cell, index) => {
      placed.push(cell);
      for (const crossed of GOAL_DEMO.crossGroups[index]) {
        expect(taberdokuConflicts(puzzle, [...placed, crossed]).has(crossed)).toBe(true);
        expect(placed.includes(crossed)).toBe(false);
      }
    });
  });

  it("only places a character where the rules force it", () => {
    // By the time each character is placed, its room must have that cell as the
    // only one left, which is what lets the player deduce it instead of guessing.
    const blocked = new Set<number>();
    GOAL_DEMO.charCells.forEach((cell, index) => {
      const stillFree = rooms
        .map((value, position) => ({ value, position }))
        .filter(
          ({ value, position }) =>
            value === rooms[cell] && position !== cell && !blocked.has(position),
        )
        .map(({ position }) => position);

      expect(stillFree).toEqual([]);

      for (const crossed of GOAL_DEMO.crossGroups[index]) blocked.add(crossed);
    });
  });

  it("keeps the resting cell on the board for the hand to wait on", () => {
    expect(GOAL_DEMO.restCell).toBeGreaterThanOrEqual(0);
    expect(GOAL_DEMO.restCell).toBeLessThan(cells);
  });
});

describe("buildDeductionScript", () => {
  const script = buildDeductionScript(GOAL_DEMO);

  it("places every character with a double tap on its own cell", () => {
    const reveals = script.filter(
      (action) => action.kind === "reveal" && action.what === "char",
    ) as { cell: number }[];

    expect(reveals.map((action) => action.cell)).toEqual(GOAL_DEMO.charCells);
    for (const cell of GOAL_DEMO.charCells) {
      const tap = script.find(
        (action) => action.kind === "tap" && action.cell === cell && action.double,
      );
      expect(tap).toBeDefined();
    }
  });

  it("marks each X only after the character that rules it out is placed", () => {
    let crossCount = 0;
    const placed: number[] = [];

    for (const action of script) {
      if (action.kind === "reveal" && action.what === "char") placed.push(action.cell);
      if (action.kind === "reveal" && action.what === "cross") {
        // The k-th reveal lights crossCells[k], in the order the hand taps it.
        expect(GOAL_DEMO.crossCells[crossCount]).toBeDefined();
        crossCount++;
      }
    }

    expect(crossCount).toBe(GOAL_DEMO.crossCells.length);
  });

  it("starts and ends on the resting cell so the loop never jumps", () => {
    expect(script[0]).toMatchObject({ kind: "pause" });
    const lastMove = script.filter((action) => action.kind === "move").at(-1);
    expect(lastMove).toMatchObject({ kind: "move", cell: GOAL_DEMO.restCell });
  });
});

describe("demo boards", () => {
  it("never marks the cell that holds the character", () => {
    for (const demo of [GOAL_DEMO, PLACE_CHARACTER_DEMO, ...RULE_DEMOS]) {
      expect(demo.crossCells).not.toContain(demo.charCell);
    }
  });
});
