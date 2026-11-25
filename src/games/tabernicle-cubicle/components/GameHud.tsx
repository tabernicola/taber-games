import { Clock, Heart, HelpCircle, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { GameState, LevelDef } from "../logic/types";
import { LEVELS } from "../logic/levels";
import { sounds, updateVolume } from "../logic/audio";
import { useState } from "react";
import type { LangSlug } from "@/platform/i18n";

interface GameHudProps {
  state: GameState;
  lang: LangSlug;
  levels?: LevelDef[];
  onResetLevel: () => void;
  onOpenHelp: () => void;
}

export function GameHud({ state, lang, levels = LEVELS, onResetLevel, onOpenHelp }: GameHudProps) {
  const [muted, setMuted] = useState(!sounds.enabled);
  const currentDef = levels[state.levelIndex];
  const langKey = lang === "eus" ? "eu" : lang === "en" ? "en" : "es";
  const levelTitle = currentDef?.name[langKey] || `Fase ${state.levelIndex + 1}`;

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setMuted(!sounds.enabled);
    updateVolume();
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-900/40 bg-stone-950/80 px-4 py-2.5 backdrop-blur-md">
      {/* Level */}
      <div className="flex items-center">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            {lang === "en" ? "Stage" : lang === "eus" ? "Fasea" : "Fase"} {state.levelIndex + 1} /{" "}
            {levels.length}
          </span>
          <h2 className="text-sm font-bold text-amber-100 sm:text-base">{levelTitle}</h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400"
          title={muted ? "Activar sonido" : "Silenciar"}
          aria-label="Sonido"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Reset level */}
        <button
          onClick={onResetLevel}
          disabled={state.status === "level_won"}
          className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          title="Reiniciar fase"
          aria-label="Reiniciar"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400"
          title="Instrucciones"
          aria-label="Ayuda"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface GameStatusBarProps {
  state: GameState;
  lang: LangSlug;
}

export function GameStatusBar({ state, lang }: GameStatusBarProps) {
  const remainingDeciseconds = Math.floor(
    Math.max(0, state.levelTimeLimitSeconds - state.levelTimeSeconds) * 10 + 1e-9,
  );
  const timeRemaining = remainingDeciseconds / 10;
  const timerLabel = (timeRemaining * 1000).toString();
  const isLowOnTime = timeRemaining <= 15;
  const timeLabel =
    lang === "en" ? "Time remaining" : lang === "eus" ? "Geratzen den denbora" : "Tiempo restante";
  const livesLabel = lang === "en" ? "Lives" : lang === "eus" ? "Bizitzak" : "Vidas";
  const eggsLabel =
    lang === "en" ? "Eggs collected" : lang === "eus" ? "Bildutako arrautzak" : "Huevos recogidos";

  return (
    <div className="flex min-h-12 w-full items-center justify-between gap-2 border-b border-amber-900/50 bg-stone-950/90 px-3 py-1.5 sm:px-5">
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-1.5 rounded-lg border border-red-900/50 bg-red-950/30 px-2.5 py-1"
          role="img"
          aria-label={`${livesLabel}: ${state.player.lives}`}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <Heart
              key={idx}
              className={`h-4 w-4 ${
                idx < state.player.lives
                  ? "fill-red-500 text-red-500"
                  : "fill-stone-800 text-stone-700"
              }`}
            />
          ))}
        </div>

        <div
          className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-2.5 py-1 text-xs font-black tabular-nums text-amber-300"
          aria-label={`${lang === "en" ? "Score" : lang === "eus" ? "Puntuak" : "Puntuación"}: ${state.score}`}
        >
          ⭐ {state.score}
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 rounded-lg border border-cyan-800/50 bg-cyan-950/40 px-2.5 py-1"
        aria-label={`${eggsLabel}: ${state.eggsCollected} / ${state.totalEggs}`}
      >
        <span className="text-base" aria-hidden="true">
          🥚
        </span>
        <span className="text-xs font-black text-cyan-300">
          {state.eggsCollected} / {state.totalEggs}
        </span>
      </div>

      <div
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${
          isLowOnTime
            ? "border-red-700/60 bg-red-950/50 text-red-300"
            : "border-amber-800/50 bg-amber-950/40 text-amber-300"
        }`}
        title={timeLabel}
        aria-label={`${timeLabel}: ${timerLabel}`}
      >
        <Clock className="h-4 w-4" />
        <span className="text-xs font-black tabular-nums">{timerLabel}</span>
      </div>
    </div>
  );
}
