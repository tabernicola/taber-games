import { Clock, Heart, HelpCircle, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { GameState } from "../logic/types";
import { sounds, updateVolume } from "../logic/audio";
import { useState } from "react";
import type { LangSlug } from "@/platform/i18n";

interface GameActionsProps {
  state: GameState;
  lang: LangSlug;
  onResetLevel: () => void;
  onOpenHelp: () => void;
  onPauseToggle: () => void;
}

export function GameActions({
  state,
  lang,
  onResetLevel,
  onOpenHelp,
  onPauseToggle,
}: GameActionsProps) {
  const [muted, setMuted] = useState(!sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setMuted(!sounds.enabled);
    updateVolume();
  };
  const isPaused = state.status === "paused";
  const soundLabel =
    lang === "en"
      ? muted
        ? "Turn sound on"
        : "Mute"
      : lang === "eus"
        ? muted
          ? "Soinua aktibatu"
          : "Mututu"
        : muted
          ? "Activar sonido"
          : "Silenciar";
  const pauseLabel =
    lang === "en" ? (isPaused ? "Resume" : "Pause") : lang === "eus" ? "Pausatu" : "Pausar";
  const resetLabel =
    lang === "en" ? "Restart level" : lang === "eus" ? "Fasea berrabiarazi" : "Reiniciar fase";
  const helpLabel = lang === "en" ? "Instructions" : lang === "eus" ? "Laguntza" : "Ayuda";

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <button
        onClick={toggleSound}
        className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400"
        title={soundLabel}
        aria-label={soundLabel}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      <button
        onClick={onPauseToggle}
        disabled={state.status !== "playing" && state.status !== "paused"}
        className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        title={pauseLabel}
        aria-label={pauseLabel}
      >
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>

      <button
        onClick={onResetLevel}
        disabled={state.status === "level_won"}
        className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        title={resetLabel}
        aria-label={resetLabel}
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <button
        onClick={onOpenHelp}
        className="rounded-lg border border-stone-800 bg-stone-900/80 p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-amber-400"
        title={helpLabel}
        aria-label={helpLabel}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
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

  return (
    <div className="grid min-h-12 w-full grid-cols-3 items-center border-b border-amber-900/50 bg-stone-950/90 px-3 py-1.5 sm:px-5">
      <div className="flex items-center justify-self-start">
        <div
          className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-2.5 py-1 text-xs font-black tabular-nums text-amber-300"
          aria-label={`${lang === "en" ? "Score" : lang === "eus" ? "Puntuak" : "Puntuación"}: ${state.score}`}
        >
          ⭐ {state.score}
        </div>
      </div>

      <div
        className={`flex items-center gap-1.5 justify-self-center rounded-lg border px-2.5 py-1 ${
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

      <div className="flex items-center justify-self-end">
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
      </div>
    </div>
  );
}
