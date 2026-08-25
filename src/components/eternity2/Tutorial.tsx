import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowDown, RotateCw, Sparkles, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { Placement, Rotation } from "@/lib/eternity2/game";

export type HighlightTarget = "tray" | "piece" | "rotate" | "board" | "empty-cell" | "candidates" | "border-piece" | null;

interface TutorialProps {
  board: Placement[];
  selected: { tileId: number; rotation: Rotation } | null;
  focus: number | null;
  hasRotated: boolean;
  boardSize: number;
  edgePieceIds: number[];
  emptyBorderPositions: number[];
  onComplete: () => void;
  onSkip: () => void;
  onResetTutorial?: () => void;
  onHighlightElement?: (element: HighlightTarget, tileId?: number) => void;
  onScrollTo?: (target: "board" | "tray") => void;
  boardRect?: DOMRect | null;
  trayRect?: DOMRect | null;
  boardRef?: React.RefObject<HTMLDivElement | null>;
  trayRef?: React.RefObject<HTMLDivElement | null>;
}

export function Tutorial({
  board,
  selected,
  focus,
  hasRotated,
  boardSize,
  edgePieceIds,
  emptyBorderPositions,
  onComplete,
  onSkip,
  onResetTutorial,
  onHighlightElement,
  onScrollTo,
  boardRect,
  trayRect,
  boardRef,
  trayRef,
}: TutorialProps) {
  const { t } = useI18n();
  const { playSound } = useSoundEffects();
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerStartedForStep, setTimerStartedForStep] = useState<number | null>(null);
  const [overlayBoardRect, setOverlayBoardRect] = useState<DOMRect | null>(null);
  const [overlayTrayRect, setOverlayTrayRect] = useState<DOMRect | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const prevStepRef = useRef<number>(-1);

  const steps = [
    { step: 1, action: "board", instruction: t("e2.tutorial.interactive.step1") },
    { step: 2, action: "tray", instruction: t("e2.tutorial.interactive.step2") },
    { step: 3, action: "edge", instruction: t("e2.tutorial.interactive.step3") },
    { step: 4, action: "match", instruction: t("e2.tutorial.interactive.step4") },
    { step: 5, action: "candidates", instruction: t("e2.tutorial.interactive.step5") },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    const update = () => {
      setOverlayBoardRect(boardRef?.current?.getBoundingClientRect() ?? null);
      setOverlayTrayRect(trayRef?.current?.getBoundingClientRect() ?? null);
    };
    update();
    const ro = new ResizeObserver(update);
    if (boardRef?.current) ro.observe(boardRef.current);
    if (trayRef?.current) ro.observe(trayRef.current);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    // Recompute viewport-relative rects while (and after) the page scrolls
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [boardRef, trayRef]);

  const effectiveBoardRect = overlayBoardRect ?? boardRect ?? null;
  const effectiveTrayRect = overlayTrayRect ?? trayRect ?? null;

  // Scroll to the relevant zone whenever the step changes
  useEffect(() => {
    if (!onScrollTo || prevStepRef.current === currentStep) return;
    prevStepRef.current = currentStep;
    onScrollTo(currentStepData.action === "tray" ? "tray" : "board");
  }, [currentStep, currentStepData.action, onScrollTo]);

  const pad = 4;
  const highlightRects = useMemo(() => {
    let rects: (DOMRect | null)[] = [];
    switch (currentStepData.action) {
      case "board":
        rects = [effectiveBoardRect];
        break;
      case "tray":
        rects = [effectiveTrayRect];
        break;
      default:
        rects = [effectiveBoardRect, effectiveTrayRect];
        break;
    }
    return rects
      .filter((r): r is DOMRect => r !== null)
      .map((r) => ({
        x: r.left - pad,
        y: r.top - pad,
        w: r.width + pad * 2,
        h: r.height + pad * 2,
      }));
  }, [currentStepData.action, effectiveBoardRect, effectiveTrayRect]);

  useEffect(() => {
    if (!onHighlightElement) return;

    let target: HighlightTarget = null;
    switch (currentStepData.action) {
      case "board":
        target = "board";
        break;
      case "tray":
        target = "tray";
        break;
      case "edge":
        target = emptyBorderPositions.length > 0 ? "empty-cell" : "board";
        break;
      case "match":
        target = "board";
        break;
      case "candidates":
        target = focus !== null ? "empty-cell" : "board";
        break;
      default:
        target = null;
        break;
    }
    onHighlightElement(target, selected?.tileId);
  }, [currentStepData.action, onHighlightElement, selected?.tileId, focus, emptyBorderPositions]);

  useEffect(() => {
    if (currentStepData.action === "board") return;

    let isComplete = false;
    switch (currentStepData.action) {
      case "tray":
        isComplete = selected !== null;
        break;
      case "edge":
        isComplete = board.some((p) => p && !p.locked && edgePieceIds.includes(p.tileId));
        break;
      case "match":
        isComplete = board.some((p) => p && !p.locked);
        break;
      case "candidates":
        isComplete = focus !== null && selected === null;
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
    edgePieceIds,
    isLastStep,
    timerStartedForStep,
    playSound,
  ]);

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

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      playSound("click");
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, playSound]);

  const handleResetAndRestart = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
    setTimerStartedForStep(null);
    setCurrentStep(0);
    if (onResetTutorial) onResetTutorial();
    if (onScrollTo) {
      prevStepRef.current = -1;
      onScrollTo("board");
    }
  };

  const getStepIcon = () => {
    switch (currentStepData.action) {
      case "board":
        return <Sparkles className="h-5 w-5 text-[var(--e2-accent)]" />;
      case "tray":
        return <ArrowDown className="h-5 w-5 animate-bounce text-[var(--e2-accent)]" />;
      case "edge":
        return <ArrowDown className="h-5 w-5 animate-bounce text-[var(--e2-accent)]" />;
      case "match":
        return <Sparkles className="h-5 w-5 text-[var(--e2-accent)]" />;
      case "candidates":
        return <Sparkles className="h-5 w-5 text-[var(--e2-accent)]" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-none" />
      {highlightRects.length > 0 && (
        <svg
          aria-hidden
          className="fixed inset-0 h-full w-full"
          style={{ zIndex: 45 }}
        >
          <defs>
            <mask id="e2-tutorial-highlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx="20" fill="black" />
              ))}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 10, 6, 0.65)"
            mask="url(#e2-tutorial-highlight-mask)"
          />
          {highlightRects.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx="20"
              fill="none"
              stroke="rgba(255,138,61,0.9)"
              strokeWidth="2"
            />
          ))}
        </svg>
      )}

      <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 w-full max-w-md pointer-events-auto px-4">
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

          {/* Action buttons based on step */}
          {(currentStepData.action === "board" ||
            currentStepData.action === "tray" ||
            currentStepData.action === "edge" ||
            currentStepData.action === "match") && (
            <button
              type="button"
              onClick={handleNextStep}
              className="e2-btn w-full"
            >
              {t("tutorial.next")}
            </button>
          )}

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
                ✓ {t("tutorial.interactive.correct") }
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
