import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { fetchSuspects } from "../logic/characters";
import { TaberdokuBoard } from "./TaberdokuBoard";
import { LevelCompleteModal } from "./LevelCompleteModal";
import {
  TABERDOKU_BOARDS_PER_LEVEL,
  TABERDOKU_TOTAL_BOARDS,
  TABERDOKU_TOTAL_LEVELS,
  boardToLevel,
  boardInLevel,
  isLevelUnlocked,
  levelProgressFromCompleted,
  taberdokuAllPuzzlesSorted,
} from "../logic/taberdokuPuzzles";
import "@/games/tabers-taberdoku/light-theme.css";

const LEVEL_STORAGE_KEY = "taberdoku-level";
const COMPLETED_BOARDS_KEY = "taberdoku-completed";
const MAX_LEVEL_STORAGE_KEY = "taberdoku-max-level";
const TUTORIAL_STORAGE_KEY = "taberdoku-tutorial-completed";

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
}

export function PlayPage() {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();
  const [board, setBoard] = useState<number | null>(null);
  const [completedBoards, setCompletedBoards] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [solveTime, setSolveTime] = useState("0:00");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [newlyUnlockedLevel, setNewlyUnlockedLevel] = useState<number | null>(null);

  // Load saved board and completed boards on mount
  useEffect(() => {
    const savedBoard = getStorageItem(LEVEL_STORAGE_KEY);
    const initial = savedBoard ? Number(savedBoard) : 1;
    setBoard(initial);

    const savedCompleted = getStorageItem(COMPLETED_BOARDS_KEY);
    if (savedCompleted) {
      setCompletedBoards(new Set<number>(JSON.parse(savedCompleted)));
    } else {
      // Migrate from old taberdoku-max-level storage (boards 1..max-1 are completed)
      const savedMax = getStorageItem(MAX_LEVEL_STORAGE_KEY);
      if (savedMax) {
        const maxBoard = Number(savedMax);
        const migrated = new Set<number>();
        for (let i = 1; i < maxBoard; i++) migrated.add(i);
        setCompletedBoards(migrated);
      }
    }
  }, []);

  // Show tutorial on first visit
  useEffect(() => {
    if (board !== null) {
      const completed = getStorageItem(TUTORIAL_STORAGE_KEY);
      if (!completed) {
        setShowTutorial(true);
      }
    }
  }, [board]);

  if (board === null || isPending) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("taberdoku.loading")}</p>
      </div>
    );
  }

  const puzzles = taberdokuAllPuzzlesSorted();
  const puzzle = puzzles[board - 1];

  if (!puzzle) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("taberdoku.allLevelsCleared")}</p>
      </div>
    );
  }

  const level = boardToLevel(board);
  const currentBoard = boardInLevel(board);
  const progress = levelProgressFromCompleted(completedBoards, level);
  const isLastBoardOfLevel = currentBoard === TABERDOKU_BOARDS_PER_LEVEL;
  const isLastLevel = level === TABERDOKU_TOTAL_LEVELS && isLastBoardOfLevel;

  const handleSolve = (time: string) => {
    setSolveTime(time);

    // Add the just-solved board to the completed set
    const newCompleted = new Set(completedBoards);
    newCompleted.add(board);
    setCompletedBoards(newCompleted);
    setStorageItem(COMPLETED_BOARDS_KEY, JSON.stringify([...newCompleted]));

    // Check if completing this board unlocks a new level
    const nextLevel = level + 1;
    if (nextLevel <= TABERDOKU_TOTAL_LEVELS) {
      const wasUnlocked = isLevelUnlocked(nextLevel, completedBoards);
      const isNowUnlocked = isLevelUnlocked(nextLevel, newCompleted);
      if (!wasUnlocked && isNowUnlocked) {
        setNewlyUnlockedLevel(nextLevel);
      }
    }

    setShowModal(true);
  };

  const handleAdvance = () => {
    setShowModal(false);
    setNewlyUnlockedLevel(null);
    const nextBoard = board + 1;
    if (nextBoard <= TABERDOKU_TOTAL_BOARDS) {
      setStorageItem(LEVEL_STORAGE_KEY, String(nextBoard));
      setBoard(nextBoard);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setStorageItem(TUTORIAL_STORAGE_KEY, "1");
  };

  const handleBoardSelect = (boardNum: number) => {
    setShowLevelSelector(false);
    setStorageItem(LEVEL_STORAGE_KEY, String(boardNum));
    setBoard(boardNum);
  };

  return (
    <div className="tabers-taberdoku-light">
      <TaberdokuBoard
        key={puzzle.id}
        puzzle={puzzle}
        characters={characters}
        onSolve={handleSolve}
        level={level}
        board={currentBoard}
        progress={progress}
        totalLevels={TABERDOKU_TOTAL_LEVELS}
        boardsPerLevel={TABERDOKU_BOARDS_PER_LEVEL}
        completedBoards={completedBoards}
        tutorialOpen={showTutorial}
        onTutorialClose={handleTutorialClose}
        onHelpClick={() => setShowTutorial(true)}
        levelSelectorOpen={showLevelSelector}
        onLevelSelectorClose={() => setShowLevelSelector(false)}
        onLevelSelect={handleBoardSelect}
        onOpenLevelSelector={() => setShowLevelSelector(true)}
      />
      <LevelCompleteModal
        open={showModal}
        level={level}
        board={currentBoard}
        progress={progress}
        totalLevels={TABERDOKU_TOTAL_LEVELS}
        boardsPerLevel={TABERDOKU_BOARDS_PER_LEVEL}
        time={solveTime}
        isLastBoardOfLevel={isLastBoardOfLevel}
        isLastLevel={isLastLevel}
        newlyUnlockedLevel={newlyUnlockedLevel}
        onAdvance={handleAdvance}
      />
    </div>
  );
}
