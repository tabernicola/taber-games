import type { GameState } from "../logic/types";
import { LEVELS } from "../logic/levels";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import type { LangSlug } from "@/platform/i18n";

interface VictoryModalProps {
  state: GameState;
  lang: LangSlug;
  onNextLevel: () => void;
  onRetryLevel: () => void;
  onRestartGame: () => void;
}

export function VictoryModal({
  state,
  lang,
  onNextLevel,
  onRetryLevel,
  onRestartGame,
}: VictoryModalProps) {
  if (
    state.status !== "level_won" &&
    state.status !== "game_over" &&
    state.status !== "game_completed"
  ) {
    return null;
  }

  const isEu = lang === "eu";
  const isEn = lang === "en";
  const isFinalStage = state.levelIndex >= LEVELS.length - 1;
  const timeExpired = state.levelTimeSeconds >= state.levelTimeLimitSeconds;

  if (state.status === "level_won") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <div className="relative w-full max-w-md rounded-2xl border-2 border-amber-500 bg-stone-950 p-6 text-center shadow-2xl shadow-amber-950/50">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/50 bg-amber-500/10 text-3xl">
            🏆
          </div>

          <h3
            className="text-2xl font-black uppercase tracking-wider text-amber-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isEu ? "Fasea Osatuta!" : isEn ? "Stage Cleared!" : "¡Fase Completada!"}
          </h3>

          <p className="mt-2 text-sm text-stone-300">
            {isEu
              ? "Arrautza guztiak salbatu dituzu!"
              : isEn
                ? "All dinosaur eggs safely collected!"
                : "¡Has recogido todos los huevos de dinosaurio!"}
          </p>

          <div className="my-5 flex items-center justify-around rounded-xl border border-stone-800 bg-stone-900/60 p-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isEu ? "Puntuak" : isEn ? "Score" : "Puntos"}
              </span>
              <div className="text-lg font-black text-amber-300">⭐ {state.score}</div>
            </div>
            <div className="h-8 w-px bg-stone-800" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {isEu ? "Bizitzak" : isEn ? "Lives" : "Vidas"}
              </span>
              <div className="text-lg font-black text-red-400">❤️ x {state.player.lives}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRetryLevel}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 py-3 text-xs font-bold text-stone-200 transition hover:bg-stone-700"
            >
              <RotateCcw className="h-4 w-4" />
              {isEu ? "Errepikatu" : isEn ? "Replay" : "Repetir"}
            </button>

            <button
              onClick={isFinalStage ? onRestartGame : onNextLevel}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-amber-500 active:scale-95"
            >
              <span>
                {isFinalStage
                  ? isEu
                    ? "Amaiera"
                    : isEn
                      ? "Victory!"
                      : "¡Victoria!"
                  : isEu
                    ? "Hurrengoa"
                    : isEn
                      ? "Next"
                      : "Siguiente"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "game_completed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <div className="relative w-full max-w-lg rounded-2xl border-2 border-yellow-500 bg-stone-950 p-6 text-center shadow-2xl">
          <img
            src="/tabernicle-cubicle/taber-v2.png"
            alt="Taber Victory"
            className="mx-auto mb-4 h-48 w-auto rounded-xl object-contain drop-shadow-[0_0_25px_rgba(255,160,0,0.5)]"
          />

          <h3
            className="text-3xl font-black uppercase tracking-wider text-yellow-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isEu
              ? "Zorionak, Taber Txapeldun!"
              : isEn
                ? "Victory! Volcano Mastered!"
                : "¡Victoria! ¡El Gran Héroe Taber!"}
          </h3>

          <p className="mt-2 text-sm text-stone-300">
            {isEu
              ? "10 faseak gainditu dituzu eta dinosauro arrautza guztiak erreskatatu dituzu!"
              : isEn
                ? "You cleared all 10 stages and rescued every prehistoric dinosaur egg!"
                : "¡Has superado las 10 fases y rescatado todos los huevos prehistóricos!"}
          </p>

          <div className="my-5 rounded-xl border border-yellow-800/40 bg-yellow-950/30 p-3">
            <span className="text-xs uppercase tracking-wider text-yellow-400">
              {isEu ? "Azkeneko Puntuak" : isEn ? "Final Score" : "Puntuación Final"}
            </span>
            <div className="text-2xl font-black text-yellow-300">⭐ {state.score}</div>
          </div>

          <button
            onClick={onRestartGame}
            className="w-full rounded-xl border border-yellow-500 bg-yellow-600 py-3.5 text-sm font-black uppercase tracking-wider text-stone-950 shadow-xl transition hover:bg-yellow-500 active:scale-95"
          >
            {isEu
              ? "Hasieratik Jokatu"
              : isEn
                ? "Play Again from Stage 1"
                : "Jugar de nuevo desde la Fase 1"}
          </button>
        </div>
      </div>
    );
  }

  // Game over
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border-2 border-red-600 bg-stone-950 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-600/50 bg-red-600/10 text-3xl">
          💀
        </div>

        <h3
          className="text-2xl font-black uppercase tracking-wider text-red-500"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isEu ? "Partida Amaitu Da" : isEn ? "Game Over" : "Fin de la Partida"}
        </h3>

        <p className="mt-2 text-sm text-stone-300">
          {timeExpired
            ? isEu
              ? "Denbora agortu da!"
              : isEn
                ? "Time ran out!"
                : "¡Se ha agotado el tiempo!"
            : isEu
              ? "Labako izakiek harrapatu zaituzte!"
              : isEn
                ? "The lava creatures overwhelmed Taber!"
                : "¡Las criaturas de lava han alcanzado a Taber!"}
        </p>

        <button
          onClick={onRetryLevel}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-700 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-600 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          {isEu ? "Saiatu Berriro" : isEn ? "Retry Stage" : "Reintentar Fase"}
        </button>
      </div>
    </div>
  );
}
