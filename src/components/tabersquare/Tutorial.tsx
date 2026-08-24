import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDown, RotateCw, Sparkles, Check, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { BLOCKER, type BoardCell } from "@/lib/tabersquare/game";
import type { PieceState } from "@/routes/$lang/the-taber-square/play";

export type HighlightElement = "board" | "tray" | "actions" | null;

interface TutorialProps {
  board: BoardCell[][];
  pieces: PieceState[];
  selectedId: string | null;
  selectedPiece: PieceState | null;
  hasRotated: boolean;
  hasFlipped: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onResetTutorial?: () => void;
  onResetRotateFlip?: () => void;
  onHighlightElement?: (element: HighlightElement, pieceId?: string) => void;
  onScrollTo?: (target: "board" | "tray" | "actions") => void;
}

interface StepDef {
  step: number;
  id: "board" | "select" | "actions" | "place";
  highlight: HighlightElement;
  pieceId?: string;
  scrollTarget: "board" | "tray" | "actions";
}

const STEPS: StepDef[] = [
  { step: 1, id: "board", highlight: "board", scrollTarget: "board" },
  { step: 2, id: "select", highlight: "tray", pieceId: "p6", scrollTarget: "tray" },
  { step: 3, id: "actions", highlight: "actions", scrollTarget: "actions" },
  { step: 4, id: "place", highlight: "board", pieceId: "p6", scrollTarget: "board" },
];

export function Tutorial({
  board,
  pieces,
  selectedId,
  selectedPiece,
  hasRotated,
  hasFlipped,
  onComplete,
  onSkip,
  onResetTutorial,
  onResetRotateFlip,
  onHighlightElement,
  onScrollTo,
}: TutorialProps) {
  const { t } = useI18n();
  const { playSound } = useSoundEffects();
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const autoCloseTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const prevStepRef = useRef<number>(-1);

  const stepDef = STEPS[currentStep] || STEPS[0];

  // Inform parent of current highlight and scroll target
  useEffect(() => {
    if (onHighlightElement) {
      onHighlightElement(stepDef.highlight, stepDef.pieceId);
    }
    if (onScrollTo && prevStepRef.current !== currentStep) {
      onScrollTo(stepDef.scrollTarget);
      prevStepRef.current = currentStep;
    }
  }, [currentStep, stepDef, onHighlightElement, onScrollTo]);

  // Handle Step 2 auto-advance (Selecting p6 - red L piece)
  useEffect(() => {
    if (stepDef.id === "select" && selectedId === "p6") {
      playSound("place");
      if (onResetRotateFlip) onResetRotateFlip();
      const timer = setTimeout(() => {
        setCurrentStep(2);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stepDef.id, selectedId, playSound, onResetRotateFlip]);

  // Handle Step 3 auto-advance (Rotating or Flipping)
  useEffect(() => {
    if (stepDef.id === "actions" && (hasRotated || hasFlipped)) {
      playSound("place");
      const timer = setTimeout(() => {
        setCurrentStep(3);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stepDef.id, hasRotated, hasFlipped, playSound]);

  // Handle Step 4 completion (Placing piece on board)
  useEffect(() => {
    if (stepDef.id === "place" && !isCompleted) {
      const hasPlaced = board.some((row) =>
        row.some((cell) => cell && cell !== BLOCKER),
      );
      if (hasPlaced) {
        playSound("win");
        setIsCompleted(true);
        setCountdown(5);

        const timer = window.setTimeout(() => {
          onComplete();
        }, 5000);
        autoCloseTimerRef.current = timer;

        const countInterval = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(countInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        countdownTimerRef.current = countInterval;
      }
    }
  }, [stepDef.id, board, isCompleted, playSound, onComplete]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      playSound("click");
      if (onResetRotateFlip) onResetRotateFlip();
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, playSound, onResetRotateFlip]);

  const handleClose = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    onComplete();
  };

  const handleSkip = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    onSkip();
  };

  const handleResetAndRestart = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
    setIsCompleted(false);
    setCurrentStep(0);
    prevStepRef.current = -1;
    if (onResetTutorial) onResetTutorial();
    if (onScrollTo) onScrollTo("board");
  };

  const getStepIcon = () => {
    switch (stepDef.id) {
      case "board":
        return <Sparkles className="h-5 w-5 text-neon-pink" />;
      case "select":
        return <ArrowDown className="h-5 w-5 animate-bounce text-neon-pink" />;
      case "actions":
        return <RotateCw className="h-5 w-5 animate-spin text-neon-cyan" />;
      case "place":
        return isCompleted ? (
          <Check className="h-5 w-5 text-green-400" />
        ) : (
          <ArrowDown className="h-5 w-5 animate-bounce text-neon-yellow" />
        );
      default:
        return null;
    }
  };

  const getInstruction = () => {
    if (isCompleted) {
      return t("tutorial.tabersquare.finish");
    }
    switch (stepDef.id) {
      case "board":
        return t("tutorial.tabersquare.step1");
      case "select":
        return t("tutorial.tabersquare.step2");
      case "actions":
        return t("tutorial.tabersquare.step3");
      case "place":
        return t("tutorial.tabersquare.step4");
      default:
        return "";
    }
  };

  return (
    <>
      {/* Dark overlay covering the screen */}
      <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none" />

      {/* Tutorial Floating Card */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto">
        <div className="rounded-2xl border-2 border-neon-pink/80 bg-card/95 p-4 shadow-[0_0_35px_oklch(0.72_0.30_350/0.4)] backdrop-blur-md transition-all">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-neon-pink/60 bg-neon-pink/20 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-neon-pink">
                Tutorial {currentStep + 1}/{STEPS.length}
              </span>
              {getStepIcon()}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetAndRestart}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline cursor-pointer"
              >
                {t("tutorial.restart")}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline cursor-pointer"
              >
                {t("tutorial.skip")}
              </button>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed text-foreground">
            {getInstruction()}
          </p>

          {/* Action buttons based on step */}
          <div className="mt-4 flex flex-col gap-2">
            {stepDef.id === "board" && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-neon-pink px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_oklch(0.72_0.30_350/0.6)] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                <span>{t("tutorial.tabersquare.gotIt")}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {stepDef.id === "actions" && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-neon-pink/60 bg-neon-pink/20 px-4 py-2 text-sm font-semibold text-neon-pink transition-colors hover:bg-neon-pink/30 cursor-pointer"
              >
                <span>{t("tutorial.next")}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {isCompleted && (
              <div className="space-y-2">
                <div className="rounded-xl border border-green-500/60 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-400 flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{t("tutorial.interactive.correct")}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl bg-neon-pink px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_oklch(0.72_0.30_350/0.6)] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  {t("tutorial.tabersquare.playNow")}
                </button>
                {countdown !== null && (
                  <p className="text-xs text-muted-foreground text-center">
                    {t("tutorial.autoClose", { countdown })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}