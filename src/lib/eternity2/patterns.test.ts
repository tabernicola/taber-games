import { describe, expect, it } from "vitest";
import { BORDER_PATTERN, EDGE_PATTERNS, patternOf } from "./patterns";

describe("patternOf", () => {
  it("returns the border pattern for 0 and negative ids", () => {
    expect(patternOf(0)).toBe(BORDER_PATTERN);
    expect(patternOf(-3)).toBe(BORDER_PATTERN);
  });

  it("maps ids 1..n to the pattern table", () => {
    expect(patternOf(1)).toBe(EDGE_PATTERNS[0]);
    expect(patternOf(EDGE_PATTERNS.length)).toBe(EDGE_PATTERNS[EDGE_PATTERNS.length - 1]);
  });

  it("wraps around for ids beyond the table", () => {
    expect(patternOf(EDGE_PATTERNS.length + 1)).toBe(EDGE_PATTERNS[0]);
  });
});
