import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDown, RotateCw, Sparkles, Check, ChevronRight } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { BLOCKER, type StarBoardCell } from "../logic/game";
import type { PieceState } from "./types";

export type HighlightElement = "board" | "tray" | "actions" | null;

interface TutorialProps {
  board: StarBoardCell[];
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
  { step: 2, id: "select", highlight: "tray", pieceId: "s6", scrollTarget: "tray" },
  { step: 3, id: "actions", highlight: "actions", scrollTarget: "actions" },
  { step: 4, id: "place", highlight: "board", pieceId: "s6", scrollTarget: "board" },
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

  // Handle Step 2 auto-advance (Selecting s6 - red Lightning piece)
  useEffect(() => {
    if (stepDef.id === "select" && selectedId === "s6") {
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
      const hasPlaced = board.some((cell) => cell && cell !== BLOCKER);
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
        return <Sparkles className="h-5 w-5 text-[var(--ts-olive)]" />;
      case "select":
        return <ArrowDown className="h-5 w-5 animate-bounce text-[var(--ts-terracotta)]" />;
      case "actions":
        return <RotateCw className="h-5 w-5 animate-spin text-[var(--ts-olive)]" />;
      case "place":
        return isCompleted ? (
          <Check className="h-5 w-5 text-[var(--ts-good)]" />
        ) : (
          <ArrowDown className="h-5 w-5 animate-bounce text-[var(--ts-terracotta)]" />
        );
      default:
        return null;
    }
  };

  const getInstruction = () => {
    if (isCompleted) {
      return t("tutorial.taberstar.finish");
    }
    switch (stepDef.id) {
      case "board":
        return t("tutorial.taberstar.step1");
      case "select":
        return t("tutorial.taberstar.step2");
      case "actions":
        return t("tutorial.taberstar.step3");
      case "place":
        return t("tutorial.taberstar.step4");
      default:
        return "";
    }
  };

  return (
    <>
      {/* Dark overlay covering the screen */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: "rgba(42, 31, 20, 0.6)" }}
      />

      {/* Tutorial Floating Card — above the dark overlay (z-40) and any
          highlighted element raised to z-50 by the play page */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-auto"
        style={{ zIndex: 60 }}
      >
        <div className="ts-tutorial-card ts-scope">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="ts-tutorial-step">
                Tutorial {currentStep + 1}/{STEPS.length}
              </span>
              {getStepIcon()}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetAndRestart}
                className="text-xs text-[var(--ts-ink-soft)] transition-colors hover:text-[var(--ts-olive-deep)] hover:underline cursor-pointer"
              >
                {t("tutorial.restart")}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-[var(--ts-ink-soft)] transition-colors hover:text-[var(--ts-olive-deep)] hover:underline cursor-pointer"
              >
                {t("tutorial.skip")}
              </button>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed text-[var(--ts-ink)]">
            {getInstruction()}
          </p>

          {/* Action buttons based on step */}
          <div className="mt-4 flex flex-col gap-2">
            {stepDef.id === "board" && (
              <button type="button" onClick={handleNextStep} className="ts-btn w-full">
                <span>{t("tutorial.taberstar.gotIt")}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {isCompleted && (
              <div className="space-y-2">
                <div className="ts-tutorial-step-ok inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold">
                  <Check className="h-4 w-4" />
                  <span>{t("tutorial.interactive.correct")}</span>
                </div>
                <button type="button" onClick={handleClose} className="ts-btn w-full">
                  {t("tutorial.taberstar.playNow")}
                </button>
                {countdown !== null && (
                  <p className="text-xs text-[var(--ts-ink-soft)] text-center">
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
