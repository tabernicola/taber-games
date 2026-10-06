import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "home.card.starBattle.tag": "Puzzle · Taberdoku",
  "home.card.starBattle.desc":
    "Place one character per row, column, and room. No two characters can touch — not even diagonally.",

  "starBattle.title": "Star Battle",
  "starBattle.desc": "One character per row, column, and room. They can never touch each other.",
  "starBattle.rules":
    "One character per row, column and room. Two characters can never sit on touching cells (diagonals included).",
  "starBattle.rule1": "1 per color",
  "starBattle.rule2": "1 per row/column",
  "starBattle.rule3": "No touching",
  "starBattle.clickHint":
    "Tap or click to mark an X, drag to mark several. Double tap or double click to place a character.",
  "starBattle.generating": "Generating board…",
  "starBattle.solvedIn": "Solved in {time}!",
  "starBattle.back": "Back",
  "starBattle.reset": "Reset",
  "starBattle.newBoard": "New board",
  "starBattle.erase": "Erase",
  "starBattle.errors": "Errors: {count}",
  "starBattle.gameOver": "Oh no! You lost all your lives!",
  "starBattle.restartLevel": "Press the restart button to try again.",
  "starBattle.characters": "Characters",
  "starBattle.levelProgress": "Level {current} of {total}",
  "starBattle.play": "Play",
  "starBattle.levelOf": "Level {current}/{total}",
  "starBattle.level": "Level {current}",
  "starBattle.boardCleared": "Board {board}/{boardsPerLevel} of Level {level} solved!",
  "starBattle.levelProgressOf": "Level {level} · {progress}%",
  "starBattle.levelCleared": "Level {level} cleared! Next level…",
  "starBattle.levelComplete": "Level {level} complete! Moving to Level {nextLevel}…",
  "starBattle.levelUnlocked": "Level {level} unlocked!",
  "starBattle.levelUnlockedDesc":
    "You solved 40% of the previous level. Level {level} is now available!",
  "starBattle.allCleared": "You have completed all levels!",
  "starBattle.allLevelsCleared": "You have completed all levels.",
  "starBattle.wellDone": "Well done, {name}!",
  "starBattle.changeName": "Change your name",
  "starBattle.namePlaceholder": "Your name",
  "starBattle.saveName": "Save",
  "starBattle.loading": "Loading…",
  "starBattle.levels": "Levels",
  "starBattle.levelsHint": "Tap a level to play",
  "starBattle.close": "Close",
  "starBattle.nextLevel": "Next level",
  "starBattle.continue": "Continue",
  "starBattle.startFromBeginning": "Start from beginning",
  "starBattle.points": "points",
  "starBattle.totalScore": "Total score",
  "starBattle.tutorial.title": "How to play",
  "starBattle.tutorial.desc":
    "One character per row, column, and room. They can never touch each other, even diagonally.",
  "starBattle.tutorial.gotIt": "Got it",
  "starBattle.tutorial.stepOf": "Step {current} of {total}",
  "starBattle.tutorial.stepGoalTitle": "The goal",
  "starBattle.tutorial.stepGoalDesc":
    "Your goal is to find the characters: work out which cell each one belongs in. Only one fits per room, row and column, and two can never touch.",
  "starBattle.tutorial.stepPlaceTitle": "Place a character",
  "starBattle.tutorial.stepPlaceDesc":
    "Double tap or double click to place a character. If the position is right, the character appears. If not, you lose one of your 3 lives.",
  "starBattle.tutorial.rule1Desc":
    "Once a character is placed, mark every cell of the same colour with an X. Two characters can never share a colour.",
  "starBattle.tutorial.rule2Desc":
    "The same goes for rows and columns: mark them to show that no character can be in those cells.",
  "starBattle.tutorial.rule3Desc":
    "Lastly, mark every cell around the character: two characters can never touch.",
  "starBattle.tutorial.next": "Next",
  "starBattle.tutorial.prev": "Back",
  "starBattle.tutorial.skip": "Skip",
  "score.submitToRanking": "Submit to ranking",
  "score.yourScore": "Your score: {score}",
};

export default dict;
