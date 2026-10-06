import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.sudoku.tag": "Mystery · Sudoku deduction",
  "home.card.sudoku.desc":
    "Solve murder mysteries on a Sudoku-style grid — place characters, apply row/column/room constraints, and deduce the killer and victim.",
  "sudoku.tagline": "Whodunit?",
  "sudoku.map": "Grid",
  "sudoku.title": "Taber's Sudoku",
  "sudoku.desc": "Classic 9×9 sudoku using the nine characters instead of numbers.",
  "sudoku.level.easy": "Easy",
  "sudoku.level.medium": "Medium",
  "sudoku.level.hard": "Hard",
  "sudoku.level.expert": "Expert",
  "sudoku.generating": "Generating board…",
  "sudoku.solvedIn": "Solved in {time}!",
  "sudoku.back": "Back",
  "sudoku.reset": "Reset",
  "sudoku.newBoard": "New board",
  "sudoku.needNineCharacters": "This game needs nine characters.",
  "sudoku.tutorial.title": "How to play",
  "sudoku.tutorial.desc":
    "Complete the 9×9 grid using the nine characters. Each character must appear exactly once in every row, every column, and every 3×3 box.",
  "sudoku.tutorial.gotIt": "Got it",
  "sudoku.tutorial.stepOf": "Step {current} of {total}",
  "sudoku.tutorial.stepGoalTitle": "The goal",
  "sudoku.tutorial.stepGoalDesc":
    "Your goal is to fill the entire grid. Each row, column, and 3×3 box must contain all nine characters without any repeats.",
  "sudoku.tutorial.stepRulesTitle": "The rules",
  "sudoku.tutorial.stepRulesDesc":
    "No character can repeat in the same row, column, or 3×3 box. Use logic to deduce where each one goes.",
  "sudoku.tutorial.stepPlaceTitle": "Place a character",
  "sudoku.tutorial.stepPlaceDesc":
    "Tap a character in the bottom tray, then tap an empty cell to place it. If you make a mistake, use the eraser.",
  "sudoku.tutorial.stepCountsTitle": "Track remaining",
  "sudoku.tutorial.stepCountsDesc":
    "Below each character you can see how many are left to place. When it reaches zero, that character is complete.",
  "sudoku.tutorial.next": "Next",
  "sudoku.tutorial.prev": "Back",
  "sudoku.tutorial.skip": "Skip",
  "sudoku.help": "Help",
};

export default dict;
