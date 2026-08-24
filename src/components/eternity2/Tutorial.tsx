import { useState, useEffect, useRef } from "react";
import { ArrowDown, RotateCw, Sparkles, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { Placement, Rotation } from "@/lib/eternity2/game";

export type HighlightTarget = "tray" | "piece" | "rotate" | "board" | "empty-cell" | "candidates" | null;

interface TutorialProps {
  board: Placement[];
  selected: { tileId: number; rotation: Rotation } | null;
  focus: number | null;
  hasRotated: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onResetTutorial?: () => void;
  onHighlightElement?: (element: HighlightTarget, tileId?: number) => void;
}

export function Tutorial({
  board,
  selected,
  focus,
  hasRotated,
  onComplete,
  onSkip,
  onResetTutorial,
  onHighlightElement,
}: TutorialProps) {
  const { t } = useI18n();
  const { playSound } = useSoundEffects();
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerStartedForStep, setTimerStartedForStep] = useState<number | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  const steps = [
    { step: 1, action: "select", instruction: t("e2.tutorial.interactive.step1") },
    { step: 2, action: "rotate", instruction: t("e2.tutorial.interactive.step2") },
    { step: 3, action: "place", instruction: t("e2.tutorial.interactive.step3") },
    { step: 4, action: "focus", instruction: t("e2.tutorial.interactive.step4") },
    { step: 5, action: "complete", instruction: t("e2.tutorial.interactive.step5") },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Inform parent of current element to highlight
  useEffect(() => {
    if (!onHighlightElement) return;

    let target: HighlightTarget = null;
    switch (currentStepData.action) {
      case "select":
        target = "tray";
        break;
      case "rotate":
        target = "rotate";
        break;
      case "place":
        target = "empty-cell";
        break;
      case "focus":
        target = "board";
        break;
      default:
        target = null;
        break;
    }
    onHighlightElement(target, selected?.tileId);
  }, [currentStepData.action, onHighlightElement, selected?.tileId]);

  // Auto-advance step when condition is met
  useEffect(() => {
    let isComplete = false;
    switch (currentStepData.action) {
      case "select":
        isComplete = selected !== null;
        break;
      case "rotate":
        isComplete = hasRotated;
        break;
      case "place":
        isComplete = board.some((p) => p !== null && !p.locked);
        break;
      case "focus":
        isComplete = focus !== null && selected === null;
        break;
      case "complete":
        isComplete = true;
        break;
    }

    if (isComplete) {
      if (isLastStep) {
        if (timerStartedForStep !== currentStepData.step) {
          playSound("win");
          setCountdown(5);
          setTimerStartedForStep(currentStepData.step);
        }
      } else {
        playSound("place");
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [
    currentStepData.action,
    currentStepData.step,
    board,
    selected,
    focus,
    hasRotated,
    isLastStep,
    timerStartedForStep,
    playSound,
  ]);

  // Timer setup for completion step
  useEffect(() => {
    if (timerStartedForStep !== null && timerStartedForStep === currentStepData.step) {
      const autoCloseTimer = window.setTimeout(() => {
        onComplete();
      }, 5000);
      autoCloseTimerRef.current = autoCloseTimer;

      const countdownTimer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownTimer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      countdownTimerRef.current = countdownTimer;

      return () => {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      };
    }
  }, [timerStartedForStep, currentStepData.step, onComplete]);

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
    setTimerStartedForStep(null);
    setCurrentStep(0);
    if (onResetTutorial) onResetTutorial();
  };

  const getStepIcon = () => {
    switch (currentStepData.action) {
      case "select":
        return <ArrowDown className="h-5 w-5 animate-bounce text-[var(--e2-accent)]" />;
      case "rotate":
        return <RotateCw className="h-5 w-5 animate-spin text-[var(--e2-accent)]" />;
      case "place":
        return <ArrowDown className="h-5 w-5 animate-bounce text-[var(--e2-accent)]" />;
      case "focus":
        return <Sparkles className="h-5 w-5 text-[var(--e2-accent)]" />;
      case "complete":
        return <Check className="h-5 w-5 text-[var(--e2-good)]" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-none" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-auto px-4">
        <div
          className="rounded-2xl border-2 p-4 shadow-2xl transition-all"
          style={{
            background: "var(--e2-panel)",
            borderColor: "var(--e2-frame)",
            color: "var(--e2-ink)",
            boxShadow: "0 12px 32px rgba(60,35,10,0.35)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(255,138,61,0.2)",
                  color: "var(--e2-accent)",
                  border: "1px solid rgba(255,138,61,0.4)",
                }}
              >
                Tutorial {currentStep + 1}/{steps.length}
              </span>
              {getStepIcon()}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAndRestart}
                className="text-xs transition-colors hover:underline cursor-pointer"
                style={{ color: "var(--e2-ink-soft)" }}
              >
                {t("tutorial.restart")}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs transition-colors hover:underline cursor-pointer"
                style={{ color: "var(--e2-ink-soft)" }}
              >
                {t("tutorial.skip")}
              </button>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--e2-ink)" }}>
            {currentStepData.instruction}
          </p>

          {isLastStep && (
            <div className="mt-3 space-y-2">
              <div
                className="rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-1.5"
                style={{
                  background: "rgba(76,175,80,0.15)",
                  border: "1px solid var(--e2-good)",
                  color: "var(--e2-good)",
                }}
              >
                ✓ {t("tutorial.interactive.correct")}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="e2-btn w-full"
              >
                {t("tutorial.close")}
              </button>
              {countdown !== null && (
                <p className="text-xs text-center" style={{ color: "var(--e2-ink-soft)" }}>
                  {t("tutorial.autoClose", { countdown })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
