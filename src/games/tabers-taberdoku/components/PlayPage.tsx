import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { createScoresService } from "@/platform/scores/createScoresService";
import { createTaberdokuHistoryService } from "@/platform/scores/createTaberdokuHistoryService";
import { LEVEL_STORAGE_KEY, readCompletedBoards, writeCompletedBoards } from "../logic/savedGame";
import { charactersQueryKey, fetchCharacters } from "@/platform/characters/characters";
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

const TUTORIAL_STORAGE_KEY = "taberdoku-tutorial-completed";
const SCORE_STORAGE_KEY = "taberdoku-score";
const SESSION_ID_KEY = "taberdoku-session-id";
const PLAYER_NAME_KEY = "taberdoku-player-name";
const scores = createScoresService("scores_taberdoku");
const history = createTaberdokuHistoryService();

function useCharacters() {
  return useQuery({ queryKey: charactersQueryKey, queryFn: fetchCharacters });
}

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateRandomPlayerName(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function PlayPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: characters = [], isPending } = useCharacters();
  const [board, setBoard] = useState<number | null>(null);
  const [completedBoards, setCompletedBoards] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [solveTime, setSolveTime] = useState("0:00");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [newlyUnlockedLevel, setNewlyUnlockedLevel] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  // Prevents the same board from being reported as solved more than once.
  const solvingRef = useRef(false);

  // Load saved board and completed boards on mount
  useEffect(() => {
    const savedBoard = getStorageItem(LEVEL_STORAGE_KEY);
    setBoard(savedBoard ? Number(savedBoard) : 1);

    const savedCompleted = readCompletedBoards();
    if (savedCompleted.size > 0) {
      setCompletedBoards(savedCompleted);
    }

    const savedScore = getStorageItem(SCORE_STORAGE_KEY);
    if (savedScore) {
      setTotalScore(Number(savedScore));
    }

    // Generate or load session ID
    let currentSessionId = getStorageItem(SESSION_ID_KEY);
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setStorageItem(SESSION_ID_KEY, currentSessionId);
    }
    setSessionId(currentSessionId);

    // Set player name (from auth or generate random)
    if (user?.email) {
      setPlayerName(user.email.split("@")[0]); // Use email prefix as name
    } else {
      let savedPlayerName = getStorageItem(PLAYER_NAME_KEY);
      if (!savedPlayerName) {
        savedPlayerName = generateRandomPlayerName();
        setStorageItem(PLAYER_NAME_KEY, savedPlayerName);
      }
      setPlayerName(savedPlayerName);
    }
  }, [user]);

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

  const handleSolve = async (time: string, unusedHearts: number) => {
    if (solvingRef.current) return;
    solvingRef.current = true;
    setSolveTime(time);

    // Add the just-solved board to the completed set
    const newCompleted = new Set(completedBoards);
    const isFirstTimeSolve = !completedBoards.has(board);
    newCompleted.add(board);
    setCompletedBoards(newCompleted);
    writeCompletedBoards(newCompleted);

    // Add score based on unused hearts (only on first completion)
    let pointsEarned = 0;
    if (isFirstTimeSolve && unusedHearts > 0) {
      pointsEarned = unusedHearts;
      const newScore = totalScore + pointsEarned;
      setTotalScore(newScore);
      setStorageItem(SCORE_STORAGE_KEY, String(newScore));
    }
    setScoreEarned(pointsEarned);

    // Save to database on every completion
    if (sessionId && playerName) {
      try {
        // Convert time string to seconds ("M:SS" or "H:MM:SS")
        const timeInSeconds = time
          .split(":")
          .map((part) => Number.parseInt(part, 10) || 0)
          .reduce((total, part) => total * 60 + part, 0);

        // Progress of the level once this board counts as solved
        const levelProgressAfterSolve = levelProgressFromCompleted(newCompleted, level);

        await scores.submit(
          level,
          playerName,
          timeInSeconds,
          sessionId,
          timeInSeconds,
          level,
          levelProgressAfterSolve,
        );

        // Save game history to database
        await history.submit(sessionId, playerName, board, level, timeInSeconds, pointsEarned);
      } catch (error) {
        console.error("Failed to save score to database:", error);
      }
    }

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
    solvingRef.current = false;
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
    solvingRef.current = false;
    setNewlyUnlockedLevel(null);
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
        totalScore={totalScore}
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
        scoreEarned={scoreEarned}
        totalScore={totalScore}
      />
    </div>
  );
}
