import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { createScoresService } from "@/platform/scores/createScoresService";
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
const SCORE_STORAGE_KEY = "taberdoku-score";
const SESSION_ID_KEY = "taberdoku-session-id";
const SESSION_HISTORY_KEY = "taberdoku-session-history";
const PLAYER_NAME_KEY = "taberdoku-player-name";
const scores = createScoresService("scores_taberdoku");

type SessionHistoryEntry = {
  sessionId: string;
  board: number;
  level: number;
  time: string;
  score: number;
  timestamp: number;
};

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
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
    setSolveTime(time);

    // Add the just-solved board to the completed set
    const newCompleted = new Set(completedBoards);
    const isFirstTimeSolve = !completedBoards.has(board);
    newCompleted.add(board);
    setCompletedBoards(newCompleted);
    setStorageItem(COMPLETED_BOARDS_KEY, JSON.stringify([...newCompleted]));

    // Add score based on unused hearts (only on first completion)
    let pointsEarned = 0;
    if (isFirstTimeSolve && unusedHearts > 0) {
      pointsEarned = unusedHearts;
      const newScore = totalScore + pointsEarned;
      setTotalScore(newScore);
      setStorageItem(SCORE_STORAGE_KEY, String(newScore));
    }
    setScoreEarned(pointsEarned);

    // Record completion history (only on first completion)
    if (isFirstTimeSolve && sessionId) {
      const historyEntry: SessionHistoryEntry = {
        sessionId,
        board,
        level,
        time,
        score: pointsEarned,
        timestamp: Date.now(),
      };

      const existingHistory = getStorageItem(SESSION_HISTORY_KEY);
      const history: SessionHistoryEntry[] = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(historyEntry);
      setStorageItem(SESSION_HISTORY_KEY, JSON.stringify(history));
    }

    // Save to database on every completion
    if (sessionId && playerName) {
      try {
        // Convert time string to seconds (format: "MM:SS" or "M:SS")
        const timeParts = time.split(":");
        const timeInSeconds =
          timeParts.length === 2
            ? Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1])
            : 0;

        const currentMaxLevel = boardToLevel(board);
        await scores.submit(0, playerName, totalScore, sessionId, timeInSeconds, currentMaxLevel);
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
