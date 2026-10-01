import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { MiniBoard, type MiniBoardAnimation } from "./TaberdokuRules";
import {
  PLACE_CHARACTER_DEMO,
  RULE_DEMOS,
  DEMO_CENTER_CELL,
  type RuleDemo,
} from "../logic/ruleDemos";
import { buildScript, durationOf } from "../logic/tutorialScript";
import type { MurdokuCharacter } from "../logic/characters";

// Import HandCursor component from TaberdokuRules
import { HandCursor } from "./TaberdokuRules";

interface TaberdokuTutorialProps {
  open: boolean;
  characters: MurdokuCharacter[];
  onClose: () => void;
}

const CELL_SIZE = 32;

function initialDemoState(demo: RuleDemo): MiniBoardAnimation {
  const hasCrosses = demo.crossCells.length > 0;
  return {
    charPlaced: hasCrosses,
    crossCount: 0,
    // The hand waits in the middle of the board, then walks to its first cell.
    handCell: hasCrosses ? 8 : DEMO_CENTER_CELL,
    handVisible: true,
    tapKey: 0,
    tapCell: demo.crossCells[0] ?? demo.charCell,
    doubleTap: false,
  };
}

export function TaberdokuTutorial({ open, characters, onClose }: TaberdokuTutorialProps) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [board, setBoard] = useState<MiniBoardAnimation>(() =>
    initialDemoState(PLACE_CHARACTER_DEMO),
  );

  const steps: { demo: RuleDemo; title: string; desc: string }[] = [
    {
      demo: PLACE_CHARACTER_DEMO,
      title: t("taberdoku.tutorial.stepPlaceTitle"),
      desc: t("taberdoku.clickHint"),
    },
    {
      demo: RULE_DEMOS[0],
      title: t("taberdoku.rule1"),
      desc: t("taberdoku.tutorial.rule1Desc"),
    },
    {
      demo: RULE_DEMOS[1],
      title: t("taberdoku.rule2"),
      desc: t("taberdoku.tutorial.rule2Desc"),
    },
    {
      demo: RULE_DEMOS[2],
      title: t("taberdoku.rule3"),
      desc: t("taberdoku.tutorial.rule3Desc"),
    },
  ];

  const step = steps[stepIndex];
  // Memoised on the rule definition, which is a module constant: a fresh array
  // on every render would restart the timeline timer and double-apply actions.
  const script = useMemo(() => buildScript(step.demo), [step.demo]);
  const isLastStep = stepIndex === steps.length - 1;

  // Restart the demo from scratch whenever the visible step changes.
  useEffect(() => {
    setBoard(initialDemoState(step.demo));
    setActionIndex(0);
  }, [step.demo]);

  // Timeline: applies one action, then schedules the next one.
  useEffect(() => {
    // A hidden tutorial must not keep a looping timer alive.
    if (!open) return;
    const action = script[actionIndex];
    if (!action) return;

    switch (action.kind) {
      case "move":
        setBoard((state) => ({ ...state, handCell: action.cell }));
        break;
      case "tap":
        setBoard((state) => ({
          ...state,
          handCell: action.cell,
          tapCell: action.cell,
          tapKey: state.tapKey + 1,
          doubleTap: action.double,
        }));
        break;
      case "reveal":
        setBoard((state) => ({
          ...state,
          charPlaced: state.charPlaced || action.what === "char",
          crossCount: action.what === "cross" ? state.crossCount + 1 : state.crossCount,
        }));
        break;
      case "pause":
        break;
    }

    const timer = setTimeout(() => {
      if (actionIndex + 1 < script.length) {
        setActionIndex(actionIndex + 1);
        return;
      }
      // Loop: clear the marks so the whole beat can play again.
      setBoard(initialDemoState(step.demo));
      setActionIndex(0);
    }, durationOf(action));

    return () => clearTimeout(timer);
  }, [open, actionIndex, script, step.demo]);

  if (!open) return null;

  const char = { image: characters[0]?.image, name: characters[0]?.name ?? "P1" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("taberdoku.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold" style={{ color: "var(--primary)" }}>
            {t("taberdoku.tutorial.title")}
          </h2>

          <div className="mt-3 flex items-center gap-1.5" aria-hidden>
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={`h-1.5 rounded-full transition-all ${
                  index === stepIndex
                    ? "w-6"
                    : index < stepIndex
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/40"
                }`}
                style={index === stepIndex ? { background: "var(--primary)" } : undefined}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("taberdoku.tutorial.stepOf", { current: stepIndex + 1, total: steps.length })}
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="relative" style={{ width: 3 * CELL_SIZE, height: 3 * CELL_SIZE }}>
            <MiniBoard
              size={3}
              cellColors={step.demo.cellColors}
              characters={[{ cell: step.demo.charCell, ...char }]}
              crosses={step.demo.crossCells}
              cellSize={CELL_SIZE}
              animation={board}
            />
            {board.handVisible && (
              <HandCursor
                size={3}
                cellSize={CELL_SIZE}
                cell={board.handCell}
                tapKey={board.tapKey}
                doubleTap={board.doubleTap}
              />
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--primary)" }}
          >
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            {t("taberdoku.tutorial.prev")}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-2.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {t("taberdoku.tutorial.skip")}
          </button>

          <button
            type="button"
            onClick={() => {
              if (isLastStep) onClose();
              else setStepIndex((index) => index + 1);
            }}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {isLastStep ? t("taberdoku.tutorial.gotIt") : t("taberdoku.tutorial.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
