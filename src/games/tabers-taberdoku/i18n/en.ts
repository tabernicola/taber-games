import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.taberdoku.tag": "Puzzle · Taberdoku",
  "home.card.taberdoku.desc":
    "Place one character per row, column, and room. No two characters can touch — not even diagonally.",

  "taberdoku.title": "Taberdoku",
  "taberdoku.desc": "One character per row, column, and room. They can never touch each other.",
  "taberdoku.rules":
    "One character per row, column and room. Two characters can never sit on touching cells (diagonals included).",
  "taberdoku.rule1": "1 per color",
  "taberdoku.rule2": "1 per row/column",
  "taberdoku.rule3": "No touching",
  "taberdoku.doubleClick": "Double-click a cell to place a character.",
  "taberdoku.generating": "Generating board…",
  "taberdoku.solvedIn": "Solved in {time}!",
  "taberdoku.back": "Back",
  "taberdoku.reset": "Reset",
  "taberdoku.newBoard": "New board",
  "taberdoku.erase": "Erase",
  "taberdoku.errors": "Errors: {count}",
  "taberdoku.characters": "Characters",
  "taberdoku.levelProgress": "Level {current} of {total}",
  "taberdoku.play": "Play",
  "taberdoku.levelOf": "Level {current}/{total}",
  "taberdoku.levelCleared": "Level {level} cleared! Next level…",
  "taberdoku.allCleared": "You have completed all levels!",
  "taberdoku.allLevelsCleared": "You have completed all levels.",
  "taberdoku.loading": "Loading…",
};

export default dict;
