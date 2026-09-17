import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.taberdoku.tag": "Puzzle · Taberdoku",
  "home.card.taberdoku.desc":
    "Place one character per row, column, and room. No two characters can touch — not even diagonally.",

  "taberdoku.title": "Taberdoku",
  "taberdoku.desc": "One character per row, column, and room. They can never touch each other.",
  "taberdoku.rules":
    "One character per row, column and room. Two characters can never sit on touching cells (diagonals included).",
  "taberdoku.generating": "Generating board…",
  "taberdoku.solvedIn": "Solved in {time}!",
  "taberdoku.back": "Back",
  "taberdoku.reset": "Reset",
  "taberdoku.newBoard": "New board",
  "taberdoku.erase": "Erase",
};

export default dict;
