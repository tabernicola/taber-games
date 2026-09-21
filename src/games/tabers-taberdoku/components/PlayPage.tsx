import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { fetchSuspects } from "../logic/characters";
import { TaberdokuBoard } from "./TaberdokuBoard";
import { LevelCompleteModal } from "./LevelCompleteModal";
import {
  TABERDOKU_TOTAL_LEVELS,
  taberdokuAllPuzzlesSorted,
} from "../logic/taberdokuPuzzles";
import "@/games/tabers-taberdoku/light-theme.css";

const LEVEL_STORAGE_KEY = "taberdoku-level";

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
}

export function PlayPage() {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();
  const [level, setLevel] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [solveTime, setSolveTime] = useState("0:00");

  // Load saved level on mount
  useEffect(() => {
    const saved = getStorageItem(LEVEL_STORAGE_KEY);
    const initial = saved ? Number(saved) : 1;
    setLevel(initial);
  }, []);

  if (level === null || isPending) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("taberdoku.loading")}</p>
      </div>
    );
  }

  const puzzles = taberdokuAllPuzzlesSorted();
  const puzzle = puzzles[level - 1];

  if (!puzzle) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("taberdoku.allLevelsCleared")}</p>
      </div>
    );
  }

  const handleSolve = (time: string) => {
    setSolveTime(time);
    setShowModal(true);
  };

  const handleAdvance = () => {
    setShowModal(false);
    const nextLevel = level + 1;
    if (nextLevel <= TABERDOKU_TOTAL_LEVELS) {
      setStorageItem(LEVEL_STORAGE_KEY, String(nextLevel));
      setLevel(nextLevel);
    }
  };

  return (
    <div className="tabers-taberdoku-light">
      <TaberdokuBoard
        key={puzzle.id}
        puzzle={puzzle}
        characters={characters}
        onSolve={handleSolve}
        level={level}
        totalLevels={TABERDOKU_TOTAL_LEVELS}
      />
      <LevelCompleteModal
        open={showModal}
        level={level}
        totalLevels={TABERDOKU_TOTAL_LEVELS}
        time={solveTime}
        isLastLevel={level >= TABERDOKU_TOTAL_LEVELS}
        onAdvance={handleAdvance}
      />
    </div>
  );
}