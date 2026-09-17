import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { fetchSuspects } from "../logic/characters";
import { TaberdokuBoard } from "./TaberdokuBoard";
import { findTaberdokuPuzzle, taberdokuPuzzlesBySize } from "../logic/taberdokuPuzzles";
import "@/games/tabers-taberdoku/light-theme.css";

type PlaySearch = {
  size?: number;
  puzzle?: string;
};

export function PlayPage() {
  const search = useSearch({ strict: false }) as PlaySearch;
  const size = Number(search?.size) || 6;
  const puzzleId = search?.puzzle;
  return <TaberdokuPlay size={size} puzzleId={puzzleId} />;
}

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
}

function TaberdokuPlay({ size, puzzleId }: { size: number; puzzleId?: string }) {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();
  const [index, setIndex] = useState(0);

  const list = useMemo(() => taberdokuPuzzlesBySize(size), [size]);
  const puzzle =
    (puzzleId ? findTaberdokuPuzzle(puzzleId) : undefined) ?? list[index % list.length];

  if (isPending) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.loading")}</p>
      </div>
    );
  }
  if (!puzzle || characters.length < size) {
    return (
      <div className="tabers-taberdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.noCases")}</p>
      </div>
    );
  }

  return (
    <TaberdokuBoard
      key={puzzle.id}
      puzzle={puzzle}
      characters={characters}
      onNewBoard={() => setIndex((i) => i + 1)}
    />
  );
}
