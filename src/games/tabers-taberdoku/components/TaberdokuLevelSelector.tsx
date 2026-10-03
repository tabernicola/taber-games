import { ChevronDown, Check, Lock } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/platform/i18n";
import { characterForLevel } from "../logic/levelCharacters";
import type { Character } from "@/platform/characters/characters";
import {
  TABERDOKU_BOARDS_PER_LEVEL,
  boardsInLevel,
  isLevelUnlocked,
  levelProgressFromCompleted,
  taberdokuAllPuzzlesSorted,
} from "../logic/taberdokuPuzzles";

interface TaberdokuLevelSelectorProps {
  open: boolean;
  currentLevel: number;
  totalLevels: number;
  completedBoards: Set<number>;
  characters: Character[];
  onSelect: (board: number) => void;
  onClose: () => void;
}

function levelSizeLabel(levelNum: number): string {
  const puzzles = taberdokuAllPuzzlesSorted();
  const boards = boardsInLevel(levelNum);
  const sizes = new Set<number>();
  for (const b of boards) sizes.add(puzzles[b - 1].size);
  const sorted = [...sizes].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  return sorted.length === 1
    ? `${sorted[0]} × ${sorted[0]}`
    : `${sorted[0]}–${sorted[sorted.length - 1]} ×`;
}

export function TaberdokuLevelSelector({
  open,
  currentLevel,
  totalLevels,
  completedBoards,
  characters,
  onSelect,
  onClose,
}: TaberdokuLevelSelectorProps) {
  const { t } = useI18n();
  const [expandedLevel, setExpandedLevel] = useState<number | null>(currentLevel);

  if (!open) return null;

  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);

  const toggleLevel = (lvl: number) => {
    const unlocked = isLevelUnlocked(lvl, completedBoards);
    if (!unlocked) return;
    setExpandedLevel((prev) => (prev === lvl ? null : lvl));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("taberdoku.close")}
        >
          <Check className="h-5 w-5" />
        </button>

        <h2 className="text-center text-lg font-bold" style={{ color: "var(--primary)" }}>
          {t("taberdoku.levels")}
        </h2>

        <div className="mt-4 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "60vh" }}>
          {levels.map((lvl) => {
            const unlocked = isLevelUnlocked(lvl, completedBoards);
            const progress = levelProgressFromCompleted(completedBoards, lvl);
            const isCompleted = progress >= 100;
            const isCurrent = lvl === currentLevel;
            const sizeLabel = levelSizeLabel(lvl);
            const isExpanded = expandedLevel === lvl;
            const character = characterForLevel(lvl, characters);

            return (
              <div key={lvl} className="space-y-1">
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => toggleLevel(lvl)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                    !unlocked
                      ? "cursor-not-allowed border-border/30 bg-background/10 text-muted-foreground/40"
                      : isCurrent
                        ? "border-primary bg-primary/20 text-primary"
                        : isCompleted
                          ? "border-border bg-background/40 text-foreground hover:border-primary/30 hover:bg-background/60"
                          : "border-border bg-background/40 text-foreground hover:border-primary/30 hover:bg-background/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {character ? (
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {character.image ? (
                          <img
                            src={character.image}
                            alt=""
                            className={`h-full w-full object-cover object-top transition-all ${
                              unlocked ? "" : "opacity-40 grayscale"
                            }`}
                          />
                        ) : (
                          <span
                            className={`text-[10px] font-bold ${
                              unlocked ? "text-foreground" : "text-muted-foreground/40"
                            }`}
                          >
                            {character.name.slice(0, 2)}
                          </span>
                        )}
                        <span
                          className="absolute -bottom-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
                          style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          {lvl}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                          unlocked ? "bg-muted" : "bg-muted/50"
                        }`}
                      >
                        {lvl}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {t("taberdoku.level", { current: lvl })}
                      </span>
                      <span className="text-xs text-muted-foreground">{sizeLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{progress}%</span>
                    {isCompleted && <Check className="h-4 w-4 text-green-500" />}
                    {!unlocked && <Lock className="h-4 w-4 text-destructive/60" />}
                    {unlocked && (
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                </button>

                {isExpanded && unlocked && (
                  <div className="grid grid-cols-5 gap-1.5">
                    {boardsInLevel(lvl).map((boardNum, idx) => {
                      const isCompletedBoard = completedBoards.has(boardNum);

                      return (
                        <button
                          key={boardNum}
                          onClick={() => {
                            onSelect(boardNum);
                            onClose();
                          }}
                          className={`relative flex h-10 w-full items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                            isCompletedBoard
                              ? "border-green-500/50 bg-green-500/20 text-green-700 hover:border-green-500/70 hover:bg-green-500/30"
                              : "border-border bg-background/40 text-foreground hover:border-primary/30 hover:bg-background/60"
                          }`}
                        >
                          {idx + 1}
                          {isCompletedBoard && (
                            <Check className="absolute -right-1 -top-1 h-3 w-3 text-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("taberdoku.levelsHint")}
        </p>
      </div>
    </div>
  );
}
