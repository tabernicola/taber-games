import type { Dict } from "@/platform/i18n/engine";

export const dict: Dict = {
  "game.title": "THE TABER SQUARE",
  "game.desc":
    "Fit all nine pieces around the seven blockers. Rotate, flip, and place until the grid is full.",
  "game.level": "Level",
  "game.level.starter": "Starter",
  "game.level.junior": "Junior",
  "game.level.expert": "Expert",
  "game.level.master": "Master",
  "game.level.wizard": "Wizard",
  "game.level.desc.starter": "All pieces can be placed anywhere (no restrictions).",
  "game.level.desc.junior":
    "Pieces 1 (Mono, light blue) and 2 (Duo, purple) may not share a side with each other (touch edges).",
  "game.level.desc.expert":
    "Pieces 1 (Mono, light blue), 2 (Duo, purple), and 3 (Tri-I, dark green) may not share a side with each other (touch edges).",
  "game.level.desc.master":
    "Pieces 2 (Duo, purple), 3 (Tri-I, dark green), and 4 (Tri-L, brown) may not share a side with each other (touch edges).",
  "game.level.desc.wizard":
    "Pieces 1 (Mono, light blue), 2 (Duo, purple), 3 (Tri-I, dark green), and 4 (Tri-L, brown) may not share a side with each other (touch edges).",
  "game.levelInfo": "Level rule",
  "game.unlockedNextLevel": "Level completed! Next level unlocked.",
  "game.levelLocked": "This level is locked.",
  "game.levelChoose": "Choose level",
  "square.rule1": "Seven blockers are rolled: those cells are taken.",
  "square.rule2": "Fit the nine pieces into the remaining cells.",
  "square.rule3": "Pieces can be rotated (R) and flipped (F).",
  "square.rule4": "Every puzzle is solvable; the fastest solve wins.",
  "tutorial.tabersquare.step1":
    "Welcome to The Taber Square! This is the 6×6 game board with 7 blocked cells. Your goal is to place all the pieces into the remaining space.",
  "tutorial.tabersquare.step2":
    "These are the 9 pieces to place onto the board. Select them by clicking on them. Try selecting the red L piece!",
  "tutorial.tabersquare.step3":
    "You can rotate and flip the selected piece to fit it into the grid. Use the rotate and flip buttons (or 'R' and 'F' keys). Give it a try!",
  "tutorial.tabersquare.step4":
    "The objective of the game is to place all pieces inside the board. Place your selected piece by clicking on an empty cell or dragging it to the board.",
  "tutorial.tabersquare.finish":
    "Perfect! You're ready to play. Fill the board in the shortest time possible!",
  "tutorial.tabersquare.gotIt": "Got it",
  "tutorial.tabersquare.playNow": "Play now!",
  "home.card.tag": "Puzzle · Grid and Polyominoes",
  "home.card.desc":
    "Roll seven blockers, then squeeze all nine pieces onto the 6×6 grid. Every game solvable, none the same.",
};
