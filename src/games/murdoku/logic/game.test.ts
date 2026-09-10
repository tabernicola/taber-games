import { describe, expect, it } from "vitest";
import { SAMPLE_CASE_CONTENT } from "../data/gameSchema";
import {
  type CaseContent,
  type Guess,
  type Placement,
  type Position,
  type Solution,
  buildEmptyGrid,
  checkGuess,
  checkSudokuConstraints,
  createDefaultRooms,
  createEmptyCase,
  getPlacement,
  getRoomForCell,
  isCaseSolvable,
  posKey,
  validateSolution,
} from "./game";

const killerId = "colonel";
const victimId = "maid";

function makeSolution(placements: { characterId: string; row: number; col: number }[]): Solution {
  return { killerId, victimId, placements };
}

describe("validateSolution", () => {
  it("passes for a valid case (sample case)", () => {
    const result = validateSolution(SAMPLE_CASE_CONTENT);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when killer and victim are in different cells", () => {
    const content = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        ...SAMPLE_CASE_CONTENT.solution,
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 1, col: 3 },
          ...SAMPLE_CASE_CONTENT.solution.placements.filter(
            (p) => p.characterId !== "colonel" && p.characterId !== "maid",
          ),
        ],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("same cell"))).toBe(true);
  });

  it("fails when two characters share a row (not killer/victim)", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        killerId,
        victimId,
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 0, col: 3 },
          { characterId: "butler", row: 0, col: 0 },
          { characterId: "gardener", row: 2, col: 4 },
          { characterId: "chef", row: 4, col: 2 },
          { characterId: "librarian", row: 5, col: 5 },
        ],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Row"))).toBe(true);
  });

  it("fails when two characters share a column (not killer/victim)", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        killerId,
        victimId,
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 0, col: 3 },
          { characterId: "butler", row: 1, col: 3 },
          { characterId: "gardener", row: 2, col: 4 },
          { characterId: "chef", row: 4, col: 2 },
          { characterId: "librarian", row: 5, col: 5 },
        ],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Column"))).toBe(true);
  });

  it("fails when two characters share a room (not killer/victim)", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        killerId,
        victimId,
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 0, col: 3 },
          { characterId: "butler", row: 1, col: 2 },
          { characterId: "gardener", row: 2, col: 4 },
          { characterId: "chef", row: 4, col: 2 },
          { characterId: "librarian", row: 5, col: 5 },
        ],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Room"))).toBe(true);
  });

  it("fails when killer and victim are the same character", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        killerId: "colonel",
        victimId: "colonel",
        placements: [],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
  });

  it("fails when a character is missing from placements", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      solution: {
        killerId,
        victimId,
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 0, col: 3 },
        ],
      },
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing"))).toBe(true);
  });

  it("fails when rooms don't cover all cells", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      rooms: SAMPLE_CASE_CONTENT.rooms.slice(0, 5),
    };
    const result = validateSolution(content);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not covered"))).toBe(true);
  });
});

describe("checkGuess", () => {
  const solution: Solution = {
    killerId: "colonel",
    victimId: "maid",
    placements: [],
  };

  it("returns correct for matching killer and victim", () => {
    const guess: Guess = { killerId: "colonel", victimId: "maid" };
    const result = checkGuess(guess, solution);
    expect(result.correct).toBe(true);
    expect(result.killer).toBe(true);
    expect(result.victim).toBe(true);
  });

  it("returns partially correct for matching only killer", () => {
    const guess: Guess = { killerId: "colonel", victimId: "butler" };
    const result = checkGuess(guess, solution);
    expect(result.correct).toBe(false);
    expect(result.killer).toBe(true);
    expect(result.victim).toBe(false);
  });

  it("returns partially correct for matching only victim", () => {
    const guess: Guess = { killerId: "butler", victimId: "maid" };
    const result = checkGuess(guess, solution);
    expect(result.correct).toBe(false);
    expect(result.killer).toBe(false);
    expect(result.victim).toBe(true);
  });

  it("returns all wrong for no matches", () => {
    const guess: Guess = { killerId: "butler", victimId: "chef" };
    const result = checkGuess(guess, solution);
    expect(result.correct).toBe(false);
    expect(result.killer).toBe(false);
    expect(result.victim).toBe(false);
  });
});

describe("checkSudokuConstraints", () => {
  it("passes when killer and victim share a cell, all others unique", () => {
    const placements: Placement[] = [
      { characterId: "colonel", row: 0, col: 3 },
      { characterId: "maid", row: 0, col: 3 },
      { characterId: "butler", row: 1, col: 0 },
      { characterId: "gardener", row: 2, col: 4 },
      { characterId: "chef", row: 4, col: 2 },
      { characterId: "librarian", row: 5, col: 5 },
    ];
    const errors = checkSudokuConstraints(SAMPLE_CASE_CONTENT, placements);
    expect(errors).toHaveLength(0);
  });

  it("detects row conflict", () => {
    const placements: Placement[] = [
      { characterId: "colonel", row: 0, col: 3 },
      { characterId: "maid", row: 0, col: 3 },
      { characterId: "butler", row: 0, col: 0 },
      { characterId: "gardener", row: 2, col: 4 },
      { characterId: "chef", row: 4, col: 2 },
      { characterId: "librarian", row: 5, col: 5 },
    ];
    const errors = checkSudokuConstraints(SAMPLE_CASE_CONTENT, placements);
    expect(errors.some((e) => e.includes("Row"))).toBe(true);
  });

  it("detects column conflict", () => {
    const placements: Placement[] = [
      { characterId: "colonel", row: 0, col: 3 },
      { characterId: "maid", row: 0, col: 3 },
      { characterId: "butler", row: 1, col: 3 },
      { characterId: "gardener", row: 2, col: 4 },
      { characterId: "chef", row: 4, col: 2 },
      { characterId: "librarian", row: 5, col: 5 },
    ];
    const errors = checkSudokuConstraints(SAMPLE_CASE_CONTENT, placements);
    expect(errors.some((e) => e.includes("Column"))).toBe(true);
  });

  it("detects room conflict", () => {
    const placements: Placement[] = [
      { characterId: "colonel", row: 0, col: 3 },
      { characterId: "maid", row: 0, col: 3 },
      { characterId: "butler", row: 0, col: 2 },
      { characterId: "gardener", row: 2, col: 4 },
      { characterId: "chef", row: 4, col: 2 },
      { characterId: "librarian", row: 5, col: 5 },
    ];
    const errors = checkSudokuConstraints(SAMPLE_CASE_CONTENT, placements);
    expect(errors.some((e) => e.includes("Room"))).toBe(true);
  });
});

describe("isCaseSolvable", () => {
  it("passes for the sample case", () => {
    const result = isCaseSolvable(SAMPLE_CASE_CONTENT);
    expect(result.solvable).toBe(true);
  });

  it("fails when there are no clues", () => {
    const content: CaseContent = { ...SAMPLE_CASE_CONTENT, clues: [] };
    const result = isCaseSolvable(content);
    expect(result.solvable).toBe(false);
    expect(result.reason).toContain("clue");
  });

  it("fails when a clue has empty text", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      clues: [{ id: "c1", text: "  ", type: "fact" }],
    };
    const result = isCaseSolvable(content);
    expect(result.solvable).toBe(false);
  });

  it("fails when there are duplicate clue IDs", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      clues: [
        { id: "dup", text: "Clue A", type: "fact" },
        { id: "dup", text: "Clue B", type: "fact" },
      ],
    };
    const result = isCaseSolvable(content);
    expect(result.solvable).toBe(false);
    expect(result.reason).toContain("Duplicate clue ID");
  });

  it("fails when there are fewer than 3 characters", () => {
    const content: CaseContent = {
      ...SAMPLE_CASE_CONTENT,
      characters: SAMPLE_CASE_CONTENT.characters.slice(0, 2),
      solution: {
        killerId: "colonel",
        victimId: "maid",
        placements: [
          { characterId: "colonel", row: 0, col: 3 },
          { characterId: "maid", row: 0, col: 3 },
        ],
      },
    };
    const result = isCaseSolvable(content);
    expect(result.solvable).toBe(false);
    expect(result.reason).toContain("3 characters");
  });
});

describe("getRoomForCell", () => {
  it("returns the room containing a cell", () => {
    const room = getRoomForCell(SAMPLE_CASE_CONTENT.rooms, { row: 0, col: 0 });
    expect(room?.id).toBe("study");
  });

  it("returns the correct room for the kitchen", () => {
    const room = getRoomForCell(SAMPLE_CASE_CONTENT.rooms, { row: 0, col: 4 });
    expect(room?.id).toBe("kitchen");
  });

  it("returns undefined for a cell outside all rooms", () => {
    const room = getRoomForCell([], { row: 0, col: 0 });
    expect(room).toBeUndefined();
  });
});

describe("getPlacement", () => {
  it("returns the placement for a character", () => {
    const p = getPlacement(SAMPLE_CASE_CONTENT.solution.placements, "colonel");
    expect(p).toBeDefined();
    expect(p?.row).toBe(0);
    expect(p?.col).toBe(3);
  });

  it("returns undefined for unknown character", () => {
    const p = getPlacement(SAMPLE_CASE_CONTENT.solution.placements, "nobody");
    expect(p).toBeUndefined();
  });
});

describe("buildEmptyGrid", () => {
  it("builds a grid of cells", () => {
    const grid = buildEmptyGrid(3, 4);
    expect(grid).toHaveLength(12);
    expect(grid[0]).toEqual({ row: 0, col: 0 });
    expect(grid[11]).toEqual({ row: 2, col: 3 });
  });
});

describe("createDefaultRooms", () => {
  it("creates rooms for a 6x6 grid with 3x2 rooms", () => {
    const rooms = createDefaultRooms(6, 6, 3, 2);
    expect(rooms).toHaveLength(6);
    expect(rooms[0].cells).toHaveLength(6);
    expect(rooms[0].cells[0]).toEqual({ row: 0, col: 0 });
  });

  it("creates rooms for a 9x9 grid with 3x3 rooms (Sudoku layout)", () => {
    const rooms = createDefaultRooms(9, 9, 3, 3);
    expect(rooms).toHaveLength(9);
    expect(rooms[0].cells).toHaveLength(9);
  });
});

describe("createEmptyCase", () => {
  it("creates a draft case with empty content", () => {
    const c = createEmptyCase("My Case");
    expect(c.title).toBe("My Case");
    expect(c.status).toBe("draft");
    expect(c.content.gridRows).toBe(0);
    expect(c.content.characters).toHaveLength(0);
    expect(c.content.solution.killerId).toBe("");
  });
});

describe("posKey", () => {
  it("creates a string key from row and col", () => {
    expect(posKey(3, 5)).toBe("3,5");
  });
});
