import type { Point } from "./model";

export const STEP_MS = 180;

/** Linear travel fills the entire grid step, without snapping or easing gaps. */
export function stepPosition(from: Point, to: Point, elapsed: number): Point {
  const progress = Math.max(0, Math.min(1, elapsed / STEP_MS));
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
