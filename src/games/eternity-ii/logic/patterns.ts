// Visual skin for Eternity II edge patterns.
// Pattern 0 is the grey outer border. 1..22 are the "animal" motifs.
// Kept isolated from the game logic so the whole look can be re-skinned later.

export type Shape = "paw" | "circle" | "star" | "triangle" | "diamond" | "flower" | "bone" | "leaf";

export type EdgePattern = {
  /** fill colour of the wedge */
  color: string;
  /** darker tone used for the inner outline / shadow */
  shade: string;
  /** motif drawn in the middle of the wedge */
  shape: Shape;
};

export const BORDER_PATTERN: EdgePattern = {
  color: "#cbb89a",
  shade: "#a08e73",
  shape: "circle",
};

export const EDGE_PATTERNS: EdgePattern[] = [
  { color: "#ff7a59", shade: "#c9502f", shape: "paw" },
  { color: "#4cc9f0", shade: "#1c86ad", shape: "circle" },
  { color: "#ffd166", shade: "#c9a02f", shape: "star" },
  { color: "#8ac926", shade: "#5d8c14", shape: "triangle" },
  { color: "#f72585", shade: "#b1105c", shape: "diamond" },
  { color: "#9d4edd", shade: "#6c2fa0", shape: "flower" },
  { color: "#00bbf9", shade: "#0080b3", shape: "bone" },
  { color: "#fb8500", shade: "#bf5f00", shape: "leaf" },
  { color: "#2ec4b6", shade: "#1c8f85", shape: "paw" },
  { color: "#e63946", shade: "#a3222c", shape: "circle" },
  { color: "#a3b18a", shade: "#6f7c5c", shape: "star" },
  { color: "#f4a261", shade: "#c07536", shape: "triangle" },
  { color: "#457b9d", shade: "#2c5570", shape: "diamond" },
  { color: "#ffafcc", shade: "#d1738f", shape: "flower" },
  { color: "#c9ada7", shade: "#977a74", shape: "bone" },
  { color: "#80ed99", shade: "#4bb367", shape: "leaf" },
  { color: "#bde0fe", shade: "#7fa9cc", shape: "paw" },
  { color: "#ffca3a", shade: "#c99a12", shape: "circle" },
  { color: "#6a4c93", shade: "#452f66", shape: "star" },
  { color: "#1982c4", shade: "#0f5b8f", shape: "triangle" },
  { color: "#d62828", shade: "#961b1b", shape: "diamond" },
  { color: "#7f5539", shade: "#553522", shape: "flower" },
];

export function patternOf(id: number): EdgePattern {
  if (id <= 0) return BORDER_PATTERN;
  return EDGE_PATTERNS[(id - 1) % EDGE_PATTERNS.length];
}
