export type Mark = null | "exclude" | "confirm";

export type DeductionState = {
  marks: Record<string, Mark>;
};

export function createDeductionState(): DeductionState {
  return { marks: {} };
}

export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function cycleMark(current: Mark): Mark {
  if (current === null) return "exclude";
  if (current === "exclude") return "confirm";
  return null;
}

export function markLabel(mark: Mark): string {
  if (mark === "exclude") return "\u274C";
  if (mark === "confirm") return "\u2705";
  return "";
}
