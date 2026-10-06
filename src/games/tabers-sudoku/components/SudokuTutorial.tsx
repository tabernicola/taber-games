import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";

interface SudokuTutorialProps {
  open: boolean;
  onClose: () => void;
}

type TutorialStep = {
  title: string;
  desc: string;
};

export function SudokuTutorial({ open, onClose }: SudokuTutorialProps) {
  const { t } = useI18n();

  const steps: TutorialStep[] = [
    {
      title: t("sudoku.tutorial.stepGoalTitle"),
      desc: t("sudoku.tutorial.stepGoalDesc"),
    },
    {
      title: t("sudoku.tutorial.stepRulesTitle"),
      desc: t("sudoku.tutorial.stepRulesDesc"),
    },
    {
      title: t("sudoku.tutorial.stepPlaceTitle"),
      desc: t("sudoku.tutorial.stepPlaceDesc"),
    },
    {
      title: t("sudoku.tutorial.stepCountsTitle"),
      desc: t("sudoku.tutorial.stepCountsDesc"),
    },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex === steps.length - 1;

  const nextStep = () => {
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-tutorial-title"
    >
      <div className="bg-background w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 id="sudoku-tutorial-title" className="text-lg font-bold">
            {t("sudoku.tutorial.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 text-sm text-muted-foreground text-center">
            {t("sudoku.tutorial.stepOf", { current: stepIndex + 1, total: steps.length })}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">
              {steps[stepIndex].title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[stepIndex].desc}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={prevStep}
            disabled={stepIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("sudoku.tutorial.prev")}
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20"
          >
            {isLastStep ? t("sudoku.tutorial.gotIt") : t("sudoku.tutorial.next")}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}