import type { GameState } from "../logic/types";
import { RotateCcw } from "lucide-react";
import type { LangSlug } from "@/platform/i18n";

interface VictoryModalProps {
  state: GameState;
  lang: LangSlug;
  onRetryLevel: () => void;
  onRestartGame: () => void;
}

export function VictoryModal({ state, lang, onRetryLevel, onRestartGame }: VictoryModalProps) {
  if (state.status !== "game_over" && state.status !== "game_completed") {
    return null;
  }

  const isEu = lang === "eus";
  const isEn = lang === "en";
  const timeExpired = state.levelTimeSeconds >= state.levelTimeLimitSeconds;

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
