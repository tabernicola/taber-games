import { DEMO_CENTER_CELL, type DeductionDemo, type RuleDemo } from "./ruleDemos";

/** Timing of each beat of the looping demo, in milliseconds. */
export const MOVE_MS = 300;
export const TAP_MS = 200;
export const DOUBLE_TAP_MS = 480;
export const REVEAL_MS = 360;
export const HOLD_MS = 900;
export const PRE_REVEAL_PAUSE_MS = 200;

/** One beat of the looping demo. */
export type DemoAction =
  | { kind: "move"; cell: number }
  | { kind: "tap"; cell: number; double: boolean }
  | { kind: "reveal"; what: "char"; cell: number }
  | { kind: "reveal"; what: "cross" }
  | { kind: "reveal"; what: "error"; cell: number }
  | { kind: "pause"; ms: number };

/**
 * Steps with crosses start with the character already placed, so the hand only
 * has to drop the marks. The first step has no crosses: the hand rests in the
 * middle of the board, walks to the cell, double clicks it and comes back.
 *
 * The contract the board rendering relies on: the k-th `reveal cross` must
 * light up `crossCells[k - 1]`, and the tap right before it must target the
 * same cell.
 */
export function buildScript(demo: RuleDemo): DemoAction[] {
  if (demo.crossCells.length === 0) {
    const actions: DemoAction[] = [{ kind: "pause", ms: 250 }];

    // The placement step opens with a wrong cell, so the player sees what a
    // misplaced character costs before seeing the correct one land.
    if (demo.wrongCell !== undefined) {
      actions.push(
        { kind: "move", cell: demo.wrongCell },
        { kind: "pause", ms: 250 },
        { kind: "tap", cell: demo.wrongCell, double: true },
        { kind: "reveal", what: "error", cell: demo.wrongCell },
        { kind: "pause", ms: HOLD_MS },
      );
    }

    actions.push(
      { kind: "move", cell: demo.charCell },
      { kind: "pause", ms: 250 },
      { kind: "tap", cell: demo.charCell, double: true },
      { kind: "reveal", what: "char", cell: demo.charCell },
      { kind: "pause", ms: HOLD_MS },
      { kind: "move", cell: DEMO_CENTER_CELL },
      { kind: "pause", ms: MOVE_MS },
    );
    return actions;
  }

  const actions: DemoAction[] = [{ kind: "pause", ms: 250 }];
  for (const cell of demo.crossCells) {
    actions.push({ kind: "move", cell });
    actions.push({ kind: "tap", cell, double: false });
    actions.push({ kind: "pause", ms: PRE_REVEAL_PAUSE_MS });
    actions.push({ kind: "reveal", what: "cross" });
  }
  actions.push({ kind: "pause", ms: HOLD_MS });
  return actions;
}

/**
 * Walkthrough for the goal board: the hand places one character, rules out the
 * cells that character forbids, and repeats until the board is complete. Each
 * pass starts and ends with the hand resting on the same cell, so the loop
 * never jumps.
 */
export function buildDeductionScript(demo: DeductionDemo): DemoAction[] {
  const actions: DemoAction[] = [{ kind: "pause", ms: 250 }];

  demo.charCells.forEach((cell, index) => {
    actions.push({ kind: "move", cell });
    actions.push({ kind: "pause", ms: 250 });
    actions.push({ kind: "tap", cell, double: true });
    actions.push({ kind: "reveal", what: "char", cell });

    for (const crossed of demo.crossGroups[index] ?? []) {
      actions.push({ kind: "move", cell: crossed });
      actions.push({ kind: "tap", cell: crossed, double: false });
      actions.push({ kind: "pause", ms: PRE_REVEAL_PAUSE_MS });
      actions.push({ kind: "reveal", what: "cross" });
    }

    actions.push({ kind: "pause", ms: HOLD_MS });
  });

  actions.push({ kind: "move", cell: demo.restCell });
  actions.push({ kind: "pause", ms: MOVE_MS });
  return actions;
}

export function durationOf(action: DemoAction): number {
  switch (action.kind) {
    case "move":
      return MOVE_MS;
    case "tap":
      return action.double ? DOUBLE_TAP_MS : TAP_MS;
    case "reveal":
      return REVEAL_MS;
    case "pause":
      return action.ms;
  }
}

/** Total runtime of one full pass of the demo, used to sanity-check pacing. */
export function scriptDuration(script: DemoAction[]): number {
  return script.reduce((total, action) => total + durationOf(action), 0);
}
