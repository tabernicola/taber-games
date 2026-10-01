/** Cell colours shared by every rule mini-board, matching the in-game rooms. */
export const DEMO_BOARD_COLOR = "#bfdbfe";
export const DEMO_OTHER_COLOR = "#fecaca";

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
}

/** First tutorial step: the board starts empty, the hand places the character. */
export const PLACE_CHARACTER_DEMO: RuleDemo = {
  charCell: 0,
  crossCells: [],
  cellColors: Array(9).fill(DEMO_BOARD_COLOR),
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
