import { describe, expect, it } from "vitest";
import { STEP_MS, stepPosition } from "./motion";

describe("continuous grid travel", () => {
  it("passes through intermediate positions rather than jumping to the next cell", () => {
    const from = { x: 2, y: 4 };
    const to = { x: 3, y: 4 };
    expect(stepPosition(from, to, 0)).toEqual(from);
    expect(stepPosition(from, to, 45)).toEqual({ x: 2.25, y: 4 });
    expect(stepPosition(from, to, 90)).toEqual({ x: 2.5, y: 4 });
    expect(stepPosition(from, to, 135)).toEqual({ x: 2.75, y: 4 });
    expect(stepPosition(from, to, STEP_MS)).toEqual(to);
  });
  it("finishes a step before changing direction, without overshooting", () => {
    const corner = { x: 3, y: 4 };
    expect(stepPosition({ x: 2, y: 4 }, corner, 200)).toEqual(corner);
    expect(stepPosition(corner, { x: 3, y: 3 }, 90)).toEqual({ x: 3, y: 3.5 });
  });
});
