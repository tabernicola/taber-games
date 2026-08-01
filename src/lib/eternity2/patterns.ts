// Visual skin for Eternity II edge patterns.
// Pattern 0 is the grey outer border. 1..22 are the "animal" motifs.
// Kept isolated from the game logic so the whole look can be re-skinned later.

export type EdgePattern = {
  /** fill colour of the wedge */
  color: string;
  /** darker tone used for the inner outline / shadow */
  shade: string;
  /** cartoon glyph shown in the middle of the wedge */
  glyph: string;
};

export const BORDER_PATTERN: EdgePattern = {
  color: "#cbb89a",
  shade: "#a08e73",
  glyph: "",
};

export const EDGE_PATTERNS: EdgePattern[] = [
  { color: "#ff7a59", shade: "#c9502f", glyph: "🦊" },
  { color: "#4cc9f0", shade: "#1c86ad", glyph: "🐬" },
  { color: "#ffd166", shade: "#c9a02f", glyph: "🦁" },
  { color: "#8ac926", shade: "#5d8c14", glyph: "🐸" },
  { color: "#f72585", shade: "#b1105c", glyph: "🦩" },
  { color: "#9d4edd", shade: "#6c2fa0", glyph: "🦄" },
  { color: "#00bbf9", shade: "#0080b3", glyph: "🐳" },
  { color: "#fb8500", shade: "#bf5f00", glyph: "🐯" },
  { color: "#2ec4b6", shade: "#1c8f85", glyph: "🐢" },
  { color: "#e63946", shade: "#a3222c", glyph: "🦀" },
  { color: "#a3b18a", shade: "#6f7c5c", glyph: "🐊" },
  { color: "#f4a261", shade: "#c07536", glyph: "🐴" },
  { color: "#457b9d", shade: "#2c5570", glyph: "🐧" },
  { color: "#ffafcc", shade: "#d1738f", glyph: "🐷" },
  { color: "#c9ada7", shade: "#977a74", glyph: "🐨" },
  { color: "#80ed99", shade: "#4bb367", glyph: "🦎" },
  { color: "#bde0fe", shade: "#7fa9cc", glyph: "🐘" },
  { color: "#ffca3a", shade: "#c99a12", glyph: "🐝" },
  { color: "#6a4c93", shade: "#452f66", glyph: "🦇" },
  { color: "#1982c4", shade: "#0f5b8f", glyph: "🐙" },
  { color: "#d62828", shade: "#961b1b", glyph: "🐞" },
  { color: "#7f5539", shade: "#553522", glyph: "🐻" },
];

export function patternOf(id: number): EdgePattern {
  if (id <= 0) return BORDER_PATTERN;
  return EDGE_PATTERNS[(id - 1) % EDGE_PATTERNS.length];
}
