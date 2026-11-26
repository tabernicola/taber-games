import React from "react";
import type { Direction } from "../logic/types";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flame, Hammer } from "lucide-react";

interface TouchControlsProps {
  onDirectionChange: (dir: Direction | null) => void;
  onFire: () => void;
  onClub: () => void;
}

export function TouchControls({ onDirectionChange, onFire, onClub }: TouchControlsProps) {
  const handleDirStart = (dir: Direction, e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onDirectionChange(dir);
  };

  const handleDirEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDirectionChange(null);
  };

  return (
    <div className="flex w-full select-none flex-col items-center px-2 py-2 sm:hidden">
      <div className="flex w-full items-center justify-between">
        {/* Directional Pad */}
        <div className="relative h-32 w-32">
          {/* Up */}
          <button
            onPointerDown={(e) => handleDirStart("up", e)}
            onPointerUp={handleDirEnd}
            onPointerCancel={handleDirEnd}
            className="absolute left-1/2 top-0 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-600/60 bg-amber-950/80 text-amber-300 shadow-md active:bg-amber-700"
            aria-label="Arriba"
          >
            <ArrowUp className="h-6 w-6" />
          </button>

          {/* Down */}
          <button
            onPointerDown={(e) => handleDirStart("down", e)}
            onPointerUp={handleDirEnd}
            onPointerCancel={handleDirEnd}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-600/60 bg-amber-950/80 text-amber-300 shadow-md active:bg-amber-700"
            aria-label="Abajo"
          >
            <ArrowDown className="h-6 w-6" />
          </button>

          {/* Left */}
          <button
            onPointerDown={(e) => handleDirStart("left", e)}
            onPointerUp={handleDirEnd}
            onPointerCancel={handleDirEnd}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-600/60 bg-amber-950/80 text-amber-300 shadow-md active:bg-amber-700"
            aria-label="Izquierda"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          {/* Right */}
          <button
            onPointerDown={(e) => handleDirStart("right", e)}
            onPointerUp={handleDirEnd}
            onPointerCancel={handleDirEnd}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-600/60 bg-amber-950/80 text-amber-300 shadow-md active:bg-amber-700"
            aria-label="Derecha"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Garrote / Club Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onClub();
            }}
            onClick={onClub}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 border-emerald-600/80 bg-emerald-950/80 text-emerald-300 shadow-lg active:scale-95 active:bg-emerald-700"
            aria-label="Garrote"
          >
            <Hammer className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pivote</span>
          </button>

          {/* Fire Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onFire();
            }}
            onClick={onFire}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-orange-500 bg-orange-600 text-white shadow-xl shadow-orange-950/50 active:scale-95 active:bg-orange-700"
            aria-label="Fuego"
          >
            <Flame className="h-7 w-7 text-yellow-200" />
            <span className="text-[11px] font-black uppercase tracking-wider">Fuego</span>
          </button>
        </div>
      </div>
    </div>
  );
}
