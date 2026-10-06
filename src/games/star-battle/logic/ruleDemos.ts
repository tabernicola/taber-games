/** Cell colours shared by every rule mini-board, matching the in-game rooms. */
export const DEMO_BOARD_COLOR = "#bfdbfe";
export const DEMO_OTHER_COLOR = "#fecaca";
export const DEMO_THIRD_COLOR = "#bbf7d0";
export const DEMO_FOURTH_COLOR = "#ddd6fe";

/** Side of the square boards used by the legend and by the tutorial. */
export const DEMO_SIZE = 3;

/** Middle cell of a demo board, where the hand rests between clicks. */
export const DEMO_CENTER_CELL = Math.floor((DEMO_SIZE * DEMO_SIZE) / 2);

export interface RuleDemo {
  /** Cell that holds the character. */
  charCell: number;
  /** Cells that get an X, in the order the hand visits them. */
  crossCells: number[];
  /** Background colour of each of the nine cells. */
  cellColors: string[];
  /** Side of the board. Defaults to `DEMO_SIZE` when omitted. */
  size?: number;
  /** Cell the hand gets wrong first, so the step can show the cost of a mistake. */
  wrongCell?: number;
}

/** Side of a demo board, defaulting to the square demos used by the legend. */
export function demoSize(demo: RuleDemo): number {
  return demo.size ?? DEMO_SIZE;
}

/**
 * Last tutorial step: the board starts empty. The hand first double clicks a
 * wrong cell to show the penalty, then places the character where it belongs.
 */
export const PLACE_CHARACTER_DEMO: RuleDemo = {
  charCell: 0,
  wrongCell: 5,
  crossCells: [],
  cellColors: Array(9).fill(DEMO_BOARD_COLOR),
};

/**
 * A goal board whose rooms force the solution, so the tutorial can show the
 * deduction instead of just the result.
 *
 * The blue room is a single cell, so the first character is forced. Every later
 * character is the only cell left in its room, and every X is a cell that the
 * characters already on the board rule out. Rooms by cell:
 *
 * ```
 *   G B R R      B blue {1}
 *   G G G R      R red {2,3,7}
 *   G G V V      G green {0,4,5,6,8,9}
 *   V V V V      V violet {10..15}
 * ```
 *
 * Characters land on (0,1), (1,3), (2,0) and (3,2): one per row, one per
 * column, one per room and never touching.
 */
export const GOAL_DEMO_SIZE = 4;
export const GOAL_DEMO_CHARS: number[] = [1, 7, 8, 14];
/** X marks grouped by the character whose placement rules them out. */
export const GOAL_DEMO_CROSS_GROUPS: number[][] = [
  // After (0,1): its row, its column and the cells it touches.
  [0, 2, 3, 5, 9, 13, 4, 6],
  // After (1,3): its column and the only cell it touches that is still free.
  [11, 15, 10],
  // After (2,0): its column, which leaves a single cell for the last character.
  [12],
  // After (3,2) nothing is left to rule out: the board is complete.
  [],
];

export interface DeductionDemo extends RuleDemo {
  /** Cells that receive a character, in the order the hand finds them. */
  charCells: number[];
  /** X marks per placement: `crossGroups[i]` follows `charCells[i]`. */
  crossGroups: number[][];
  /** Cell where the hand rests between clicks, and where a pass starts. */
  restCell: number;
}

export const GOAL_DEMO: DeductionDemo = {
  size: GOAL_DEMO_SIZE,
  charCell: GOAL_DEMO_CHARS[0],
  charCells: GOAL_DEMO_CHARS,
  crossGroups: GOAL_DEMO_CROSS_GROUPS,
  crossCells: GOAL_DEMO_CROSS_GROUPS.flat(),
  restCell: 5,
  cellColors: [
    DEMO_THIRD_COLOR,
    DEMO_BOARD_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_THIRD_COLOR,
    DEMO_THIRD_COLOR,
    DEMO_THIRD_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_THIRD_COLOR,
    DEMO_THIRD_COLOR,
    DEMO_FOURTH_COLOR,
    DEMO_FOURTH_COLOR,
    DEMO_FOURTH_COLOR,
    DEMO_FOURTH_COLOR,
    DEMO_FOURTH_COLOR,
    DEMO_FOURTH_COLOR,
  ],
};

/** One per room — a character in room A, X on the other cells of room A. */
const ROOM_DEMO: RuleDemo = {
  charCell: 0,
  crossCells: [1, 2, 3, 4],
  cellColors: [
    DEMO_BOARD_COLOR,
    DEMO_BOARD_COLOR,
    DEMO_BOARD_COLOR,
    DEMO_BOARD_COLOR,
    DEMO_BOARD_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_OTHER_COLOR,
    DEMO_OTHER_COLOR,
  ],
};

/** One per row and column — character at (0,0), X on the rest of row 0 and col 0. */
const ROW_COLUMN_DEMO: RuleDemo = {
  charCell: 0,
  crossCells: [1, 2, 3, 6],
  cellColors: Array(9).fill(DEMO_BOARD_COLOR),
};

/** No touching — character at the centre, X on all eight surrounding cells. */
const NO_TOUCHING_DEMO: RuleDemo = {
  charCell: 4,
  crossCells: [0, 1, 2, 3, 5, 6, 7, 8],
  cellColors: Array(9).fill(DEMO_BOARD_COLOR),
};

export const RULE_DEMOS: RuleDemo[] = [ROOM_DEMO, ROW_COLUMN_DEMO, NO_TOUCHING_DEMO];

/**
 * Position of a cell in the X order, or -1 when the cell is never marked.
 * The tutorial reveals X marks one at a time, so this index is what decides
 * whether a given cell is already on the board.
 */
export function crossOrder(crossCells: number[], cell: number): number {
  return crossCells.indexOf(cell);
}

/** Whether the X for this cell has been marked, given how many have been placed. */
export function isCrossRevealed(crossCells: number[], cell: number, crossCount: number): boolean {
  const order = crossOrder(crossCells, cell);
  return order !== -1 && order < crossCount;
}
