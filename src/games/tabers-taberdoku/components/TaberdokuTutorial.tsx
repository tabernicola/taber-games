import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { MiniBoard, type MiniBoardAnimation } from "./TaberdokuRules";
import {
  PLACE_CHARACTER_DEMO,
  RULE_DEMOS,
  GOAL_DEMO,
  DEMO_SIZE,
  demoSize,
  type DeductionDemo,
  type RuleDemo,
} from "../logic/ruleDemos";
import { buildDeductionScript, buildScript, durationOf } from "../logic/tutorialScript";
import type { Character } from "@/platform/characters/characters";

// Import HandCursor component from TaberdokuRules
import { HandCursor } from "./TaberdokuRules";

interface TaberdokuTutorialProps {
  open: boolean;
  characters: Character[];
  onClose: () => void;
}

const CELL_SIZE = 32;
/** Where the hand waits on the square rule demos, whose character is pre-placed. */
const RULE_DEMO_HAND_CELL = 8;

/**
 * A step is either the deduction walkthrough, where the hand finds every
 * character in turn, or a single rule demo. Both play back through the timeline.
 */
type TutorialStep = {
  title: string;
  desc: string;
  /** Walkthrough played until the board is complete. */
  deduction?: DeductionDemo;
  /** Single rule demo, looping. */
  demo?: RuleDemo;
};

/**
 * Fresh state for one pass of a demo.
 *
 * `placedCells` is required on purpose: it decides what the board shows before
 * the hand moves. The rule demos open with their character already placed,
 * because all they have left to do is drop the marks, while the placement step
 * must start empty so its character only appears on the double tap.
 */
function initialDemoState(
  demo: RuleDemo,
  placedCells: number[],
  restCell: number,
): MiniBoardAnimation {
  return {
    placedCells,
    crossCount: 0,
    // Nothing is flagged until the hand gets a cell wrong.
    errorCell: null,
    // The hand waits next to the character when there is one, and on the resting
    // cell otherwise, then walks to its first target.
    handCell: placedCells.length > 0 ? RULE_DEMO_HAND_CELL : restCell,
    handVisible: true,
    tapKey: 0,
    tapCell: demo.crossCells[0] ?? demo.charCell,
    doubleTap: false,
  };
}

/** Fresh board state for whichever kind of demo the step plays. */
function resetState(deduction?: DeductionDemo, demo?: RuleDemo): MiniBoardAnimation | null {
  // The walkthrough reveals every character itself, so nothing starts placed.
  if (deduction) return initialDemoState(deduction, [], deduction.restCell);
  if (!demo) return null;
  // A demo whose job is to drop marks opens with its character already on the
  // board. The placement demo has no marks, so it starts empty and waits for the
  // double tap.
  const preplaced = demo.crossCells.length > 0 ? [demo.charCell] : [];
  return initialDemoState(demo, preplaced, RULE_DEMO_HAND_CELL);
}

export function TaberdokuTutorial({ open, characters, onClose }: TaberdokuTutorialProps) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  // Seeded with the first step so the board never flashes the wrong demo for a
  // frame; the effect below re-seeds it whenever the step changes.
  const [board, setBoard] = useState<MiniBoardAnimation>(() =>
    initialDemoState(GOAL_DEMO, [], GOAL_DEMO.restCell),
  );

  // The goal comes first so the rules and the placement step read as the way to
  // reach it, rather than as an unexplained preamble.
  const steps: TutorialStep[] = [
    {
      deduction: GOAL_DEMO,
      title: t("taberdoku.tutorial.stepGoalTitle"),
      desc: t("taberdoku.tutorial.stepGoalDesc"),
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
    {
      demo: PLACE_CHARACTER_DEMO,
      title: t("taberdoku.tutorial.stepPlaceTitle"),
      desc: t("taberdoku.tutorial.stepPlaceDesc"),
    },
  ];

  const step = steps[stepIndex];
  const deduction = step.deduction;
  const demo = step.demo;
  // Memoised on the rule definition, which is a module constant: a fresh array
  // on every render would restart the timeline timer and double-apply actions.
  const script = useMemo(
    () => (deduction ? buildDeductionScript(deduction) : demo ? buildScript(demo) : []),
    [deduction, demo],
  );
  const isLastStep = stepIndex === steps.length - 1;

  // Restart the demo from scratch whenever the visible step changes.
  useEffect(() => {
    const fresh = resetState(deduction, demo);
    if (!fresh) return;
    setBoard(fresh);
    setActionIndex(0);
  }, [deduction, demo]);

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
          placedCells:
            action.what === "char"
              ? state.placedCells.includes(action.cell)
                ? state.placedCells
                : [...state.placedCells, action.cell]
              : state.placedCells,
          crossCount: action.what === "cross" ? state.crossCount + 1 : state.crossCount,
          errorCell: action.what === "error" ? action.cell : state.errorCell,
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
      // Loop: clear the board so the whole beat can play again.
      const fresh = resetState(deduction, demo);
      if (fresh) setBoard(fresh);
      setActionIndex(0);
    }, durationOf(action));

    return () => clearTimeout(timer);
  }, [open, actionIndex, script, demo, deduction]);

  if (!open) return null;

  const char = { image: characters[0]?.image, name: characters[0]?.name ?? "P1" };
  // The deduction board is bigger than the rule demos, so the size comes from
  // the demo itself rather than being fixed.
  const boardDemo = deduction ?? demo;
  const size = boardDemo ? demoSize(boardDemo) : DEMO_SIZE;
  // Every character of a multi-character demo needs its own artwork, falling
  // back to the first one while the cast is still loading.
  const castFor = (cells: number[]) =>
    cells.map((cell, index) => ({
      cell,
      image: characters[index]?.image ?? characters[0]?.image,
      name: characters[index]?.name ?? characters[0]?.name ?? "P1",
    }));

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
          {boardDemo && (
            <div className="relative" style={{ width: size * CELL_SIZE, height: size * CELL_SIZE }}>
              <MiniBoard
                size={size}
                cellColors={boardDemo.cellColors}
                characters={
                  deduction ? castFor(deduction.charCells) : [{ cell: boardDemo.charCell, ...char }]
                }
                crosses={boardDemo.crossCells}
                cellSize={CELL_SIZE}
                animation={board}
              />
              {board.handVisible && (
                <HandCursor
                  size={size}
                  cellSize={CELL_SIZE}
                  cell={board.handCell}
                  tapKey={board.tapKey}
                  doubleTap={board.doubleTap}
                />
              )}
            </div>
          )}
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
