import { X } from "lucide-react";
import type { LangSlug } from "@/platform/i18n";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangSlug;
}

export function HowToPlayModal({ isOpen, onClose, lang }: HowToPlayModalProps) {
  if (!isOpen) return null;

  const isEu = lang === "eus";
  const isEn = lang === "en";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-600/70 bg-stone-950 p-6 text-stone-200 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          className="text-center text-xl font-black uppercase tracking-wider text-amber-400 sm:text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isEu
            ? "Nola Jokatu: Tabernicle Cubicle"
            : isEn
              ? "How to Play: Tabernicle Cubicle"
              : "Cómo Jugar: Tabernicle Cubicle"}
        </h3>

        <div className="mt-5 space-y-4 text-sm">
          {/* Rule 1: Fire & Stone */}
          <div className="flex items-start gap-3 rounded-xl border border-orange-900/40 bg-orange-950/20 p-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h4 className="font-bold text-orange-300">
                {isEu
                  ? "1. Kiskali eta Harri Bihurtu"
                  : isEn
                    ? "1. Calcinate into Stone"
                    : "1. Calcina en Piedra"}
              </h4>
              <p className="mt-0.5 text-xs text-stone-300">
                {isEu
                  ? "Jaurti sua labako izakiei harrizko bloke bihurtzeko."
                  : isEn
                    ? "Shoot fire at lava creatures to instantly freeze them into solid stone blocks."
                    : "Dispara fuego a las criaturas de lava para convertirlas en bloques de piedra."}
              </p>
            </div>
          </div>

          {/* Rule 2: Push & Bridge */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3">
            <span className="text-2xl">🧱</span>
            <div>
              <h4 className="font-bold text-amber-300">
                {isEu
                  ? "2. Bultzatu eta Zubiak Egin"
                  : isEn
                    ? "2. Push & Bridge Lava"
                    : "2. Empuja y Rellena Lava"}
              </h4>
              <p className="mt-0.5 text-xs text-stone-300">
                {isEu
                  ? "Bultzatu blokea labarantz: laba beteko du eta lur sendo bihurtuko da."
                  : isEn
                    ? "Push stone blocks in a straight line: sliding into lava fills it and turns it into walkable ground!"
                    : "Empuja los bloques en línea recta: al chocar con la lava la rellenan y crean un camino transitable."}
              </p>
            </div>
          </div>

          {/* Rule 3: Club & Pivot */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
            <span className="text-2xl">🪵</span>
            <div>
              <h4 className="font-bold text-emerald-300">
                {isEu
                  ? "3. Porra eta Piboteak"
                  : isEn
                    ? "3. Club & Pivot Mounds"
                    : "3. Garrote y Pivotes"}
              </h4>
              <p className="mt-0.5 text-xs text-stone-300">
                {isEu
                  ? "Kolpatu lurra porrarekin tontor bat altxatzeko; blokeak gelditu egingo dira norabidea aldatzeko. Berriro kolpatu kentzeko."
                  : isEn
                    ? "Strike the ground with your club to raise an earthen mound that stops sliding blocks. Strike again to remove it."
                    : "Golpea el suelo con el garrote para levantar un montículo que frena los bloques y te permite redirigirlos. Golpéalo de nuevo para retirarlo."}
              </p>
            </div>
          </div>

          {/* Rule 4: Eggs Objective */}
          <div className="flex items-start gap-3 rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-3">
            <span className="text-2xl">🥚</span>
            <div>
              <h4 className="font-bold text-cyan-300">
                {isEu
                  ? "4. Dinosauro Arrautzak"
                  : isEn
                    ? "4. Dinosaur Eggs"
                    : "4. Huevos de Dinosaurio"}
              </h4>
              <p className="mt-0.5 text-xs text-stone-300">
                {isEu
                  ? "Bildu faseko arrautza guztiak hurrengo fasera igarotzeko. Kontuz labako izakiekin!"
                  : isEn
                    ? "Collect all dinosaur eggs to clear the stage. Watch out for living lava creatures!"
                    : "Recoge todos los huevos de dinosaurio para completar la fase. ¡Cuidado con tocar criaturas vivas!"}
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Controls Reminder */}
        <div className="mt-5 rounded-xl border border-stone-800 bg-stone-900/50 p-3 text-xs text-stone-400">
          <div className="font-semibold text-stone-300">
            {isEu
              ? "Teklatuaren Kontrolak:"
              : isEn
                ? "Keyboard Controls:"
                : "Controles de Teclado:"}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              • <b>{isEu ? "Mugitu" : isEn ? "Move" : "Mover"}:</b> Flechas / WASD
            </div>
            <div>
              • <b>{isEu ? "Sua" : isEn ? "Fire" : "Fuego"}:</b> Espacio / J
            </div>
            <div>
              • <b>{isEu ? "Porra" : isEn ? "Club" : "Garrote"}:</b> K / Shift / X
            </div>
            <div>
              • <b>{isEu ? "Mugikorra" : isEn ? "Mobile" : "Móvil"}:</b> D-Pad táctil
            </div>
            <div>
              • <b>{isEu ? "Pausatu" : isEn ? "Pause" : "Pausar"}:</b> P
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-amber-500 bg-amber-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-500 active:scale-95"
        >
          {isEu ? "Ulertuta, jokatu!" : isEn ? "Got it, let's play!" : "¡Entendido, a jugar!"}
        </button>
      </div>
    </div>
  );
}
