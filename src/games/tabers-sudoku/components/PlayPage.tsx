import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { fetchSuspects } from "../logic/characters";
import { SudokuBoard } from "./SudokuBoard";
import type { SudokuLevel } from "../logic/sudoku";
import "@/games/tabers-sudoku/light-theme.css";

type PlaySearch = {
  caseId?: string;
  mode?: string;
  level?: string;
  size?: number;
  puzzle?: string;
};

export function PlayPage() {
  const search = useSearch({ strict: false }) as PlaySearch;
  const mode = search?.mode ?? "case";
  return <SudokuPlay level={(search?.level as SudokuLevel) ?? "easy"} />;
}

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
}

function SudokuPlay({ level }: { level: SudokuLevel }) {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();

  if (isPending) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.loading")}</p>
      </div>
    );
  }
  if (characters.length < 9) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.needNineCharacters")}</p>
      </div>
    );
  }
  return <SudokuBoard level={level} characters={characters.slice(0, 9)} />;
}
