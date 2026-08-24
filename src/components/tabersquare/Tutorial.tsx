import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ArrowDown, RotateCw, FlipHorizontal2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SQUARE_LEVELS, type SquareLevelId } from "@/lib/tabersquare/levels";
import type { BoardCell } from "@/lib/tabersquare/game";
import type { PieceState } from "@/routes/$lang/the-taber-square/play";

interface TutorialProps {
  levelId: SquareLevelId;
  board: BoardCell[][];
  pieces: PieceState[];
  selectedId: string | null;
  selectedPiece: PieceState | null;
  hasRotated: boolean;
  hasFlipped: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onResetTutorial?: () => void;
  onHighlightElement?: (element: 'piece' | 'rotate' | 'flip' | 'board' | 'placed-piece' | null, pieceId?: string) => void;
}

export function Tutorial({ 
  levelId, 
  board, 
  pieces, 
  selectedId,
  selectedPiece,
  hasRotated,
  hasFlipped,
  onComplete, 
  onSkip,
  onResetTutorial,
  onHighlightElement 
}: TutorialProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerStartedForStep, setTimerStartedForStep] = useState<number | null>(null);
  const autoCloseTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  
  const steps = getTutorialSteps(levelId);
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  
  // Highlight elements based on current step
  useEffect(() => {
    let elementToHighlight: 'piece' | 'rotate' | 'flip' | 'board' | 'placed-piece' | null = null;
    let pieceId: string | undefined = undefined;
    
    switch (currentStepData.action) {
      case 'select':
        elementToHighlight = 'piece';
        pieceId = 'p6'; // L-4 piece
        break;
      case 'rotate':
        elementToHighlight = 'rotate';
        break;
      case 'flip':
        elementToHighlight = 'flip';
        break;
      case 'place':
        elementToHighlight = 'board';
        break;
      case 'remove':
        elementToHighlight = 'placed-piece';
        pieceId = 'p6'; // L-4 piece
        break;
    }
    
    if (onHighlightElement) {
      onHighlightElement(elementToHighlight, pieceId);
    }
  }, [currentStepData.action, onHighlightElement]);
  
  // Auto-advance when conditions are met (except for last step)
  useEffect(() => {
    const isComplete = checkStepComplete(currentStepData, board, pieces, selectedId, selectedPiece, hasRotated, hasFlipped);
    
    if (isComplete) {
      if (isLastStep) {
        // For last step, show close button and start auto-close timer (only once for this step)
        if (timerStartedForStep !== currentStepData.step) {
          playSound('success');
          setCountdown(5);
          setTimerStartedForStep(currentStepData.step);
        }
      } else { 
        // Auto-advance to next step
        playSound('success');
        setCurrentStep(currentStep + 1);
        // Reset rotation/flip state when moving to next step
        if (onResetTutorial) {
          onResetTutorial();
        }
      }
    }
  }, [currentStepData.step, board, pieces, selectedId, selectedPiece, hasRotated, hasFlipped, isLastStep, onResetTutorial]);
  
  // Separate effect for timer setup - only depends on timerStartedForStep
  useEffect(() => {
    if (timerStartedForStep !== null && timerStartedForStep === currentStepData.step) {
      // Auto-close timer
      const autoCloseTimer = window.setTimeout(() => {
        onComplete();
      }, 5000);
      autoCloseTimerRef.current = autoCloseTimer;
      
      // Countdown timer
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
      
      // Cleanup only on unmount or when timerStartedForStep changes
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
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    onComplete();
  };
  
  const handleSkip = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    onSkip();
  };
  
  const handleResetAndRestart = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setTimerStartedForStep(null);
    setCurrentStep(0);
    if (onResetTutorial) {
      onResetTutorial();
    }
  };
  
  const getStepIcon = () => {
    switch (currentStepData.action) {
      case 'select':
        return <ArrowDown className="h-5 w-5 animate-bounce" />;
      case 'rotate':
        return <RotateCw className="h-5 w-5 animate-spin" />;
      case 'flip':
        return <FlipHorizontal2 className="h-5 w-5" />;
      case 'place':
        return <ArrowDown className="h-5 w-5 animate-bounce" />;
      case 'complete':
        return null;
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-none" />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-auto">
        <div className="mx-4 rounded-xl border border-neon-pink/60 bg-background/95 backdrop-blur-sm p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neon-pink">
                Tutorial {currentStep + 1}/{steps.length}
              </span>
              {getStepIcon()}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleResetAndRestart} className="text-xs text-muted-foreground hover:text-foreground">
                {t("tutorial.restart")}
              </button>
              <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground">
                {t("tutorial.skip")}
              </button>
            </div>
          </div>
          
          <p className="text-sm leading-relaxed">
            {currentStepData.instruction}
          </p>
          
          {isLastStep && countdown !== null && (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-green-500/20 border border-green-500/60 px-3 py-2 text-sm text-green-400">
                ✓ {t("tutorial.interactive.correct")}
              </div>
              <button 
                onClick={handleClose}
                className="w-full rounded-lg bg-neon-pink/20 border border-neon-pink/60 px-3 py-2 text-sm text-neon-pink hover:bg-neon-pink/30 transition-colors"
              >
                {t("tutorial.close")}
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
  );
}

function getTutorialSteps(levelId: SquareLevelId) {
  const { t } = useI18n();
  
  const baseSteps = [
    { step: 1, action: 'select', instruction: t('tutorial.interactive.step2') },
    { step: 2, action: 'rotate', instruction: t('tutorial.interactive.step4') },
    { step: 3, action: 'flip', instruction: t('tutorial.interactive.step5') },
    { step: 4, action: 'place', instruction: t('tutorial.interactive.step3') },
    { step: 5, action: 'remove', instruction: t('tutorial.interactive.step7') },
  ];
  
  return baseSteps;
}

function checkStepComplete(
  step: { step: number; action: string; instruction: string },
  board: BoardCell[][],
  pieces: PieceState[],
  selectedId: string | null,
  selectedPiece: PieceState | null,
  hasRotated: boolean,
  hasFlipped: boolean
): boolean {
  switch (step.step) {
    case 1: // select
      // Only complete if selected piece is L-4 (p6)
      return selectedId !== null && selectedPiece !== null && selectedPiece.id === 'p6';
    case 2: // rotate
      return hasRotated;
    case 3: // flip
      return hasFlipped;
    case 4: // place
      // Check if the L-4 piece (p6) is specifically placed on board
      for (const row of board) {
        for (const cell of row) {
          if (cell === 'p6') return true;
        }
      }
      return false;
    case 5: // remove
      // Check if L-4 piece (p6) is removed from board
      for (const row of board) {
        for (const cell of row) {
          if (cell === 'p6') return false;
        }
      }
      return true;
    default:
      return false;
  }
}

function playSound(type: string) {
  // This would use the sound effects hook, but for simplicity we'll skip
  // In real implementation, this would call playSound('success')
}