import { useEffect, useState } from "react";
import { X, XCircle } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { fetchCharacters, type Character } from "@/platform/characters/characters";

const DEMO_SIZE = 4;
const DEMO_CELL_COLORS = [
  "#fecaca",
  "#fecaca",
  "#bfdbfe",
  "#bfdbfe",
  "#fecaca",
  "#fecaca",
  "#bfdbfe",
  "#bfdbfe",
  "#bbf7d0",
  "#bbf7d0",
  "#ddd6fe",
  "#ddd6fe",
  "#bbf7d0",
  "#bbf7d0",
  "#ddd6fe",
  "#ddd6fe",
];
const DEMO_PLACEMENTS = [0, 6, 11, 13];
const DEMO_CELL_SIZE = 32;
const DEMO_BOARD_GAP = 2;
const DEMO_BOARD_WIDTH = DEMO_SIZE * DEMO_CELL_SIZE + (DEMO_SIZE - 1) * DEMO_BOARD_GAP;
const DEMO_STAGE_WIDTH = 184;
const DEMO_BOARD_LEFT = (DEMO_STAGE_WIDTH - DEMO_BOARD_WIDTH) / 2;
const DEMO_BOARD_TOP = 8;
const DEMO_TRAY_TOP = 158;
const DEMO_TRAY_HAND_Y = 176;
const CROSS_BOARD_TOP = 96;

type GoalAction =
  | { kind: "move"; x: number; y: number }
  | { kind: "select"; characterIndex: number }
  | { kind: "place"; characterIndex: number; cell: number }
  | { kind: "pause"; duration: number };

function buildGoalScript(): GoalAction[] {
  const actions: GoalAction[] = [];

  DEMO_PLACEMENTS.forEach((cell, characterIndex) => {
    const row = Math.floor(cell / DEMO_SIZE);
    const col = cell % DEMO_SIZE;
    const trayX = 26 + characterIndex * 44;
    const boardX = DEMO_BOARD_LEFT + col * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) + DEMO_CELL_SIZE / 2;
    const boardY = DEMO_BOARD_TOP + row * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) + DEMO_CELL_SIZE / 2;

    actions.push(
      { kind: "move", x: trayX, y: DEMO_TRAY_HAND_Y },
      { kind: "select", characterIndex },
      { kind: "pause", duration: 250 },
      { kind: "move", x: boardX, y: boardY },
      { kind: "pause", duration: 300 },
      { kind: "place", characterIndex, cell },
      { kind: "pause", duration: 600 },
    );
  });

  return actions;
}

const GOAL_SCRIPT = buildGoalScript();

// Types for tutorial animations
type MurdokuDemoStep = {
  title: string;
  desc: string;
  component: React.ReactNode;
};

function renderCharacter(character: Character, className: string) {
  return character.image ? (
    <img src={character.image} alt="" className={`${className} rounded-full object-cover`} />
  ) : (
    <span
      className={`${className} flex items-center justify-center rounded-full bg-primary/20 font-bold text-primary`}
    >
      {character.name.slice(0, 1).toLocaleUpperCase()}
    </span>
  );
}

function CharacterTray({
  characters,
  selectedIndex,
}: {
  characters: Character[];
  selectedIndex: number | null;
}) {
  return (
    <div className="absolute inset-x-1 flex justify-center gap-1" style={{ top: DEMO_TRAY_TOP }}>
      {characters.map((character, index) => (
        <div
          key={character.id}
          className={`flex w-10 flex-col items-center gap-0.5 rounded-lg p-1 transition-all ${selectedIndex === index ? "scale-110 bg-primary/15 ring-2 ring-primary" : "opacity-70"}`}
          title={character.name}
          aria-label={character.name}
        >
          {renderCharacter(character, "h-7 w-7")}
          <span className="w-full truncate text-[8px] leading-3">{character.name}</span>
        </div>
      ))}
    </div>
  );
}

function DemoBoard({
  characters,
  placedCells,
  manualCrosses = [],
  rejectedCell = null,
  obstacleCells = [],
  boardTop = DEMO_BOARD_TOP,
}: {
  characters: Character[];
  placedCells: Record<number, number>;
  manualCrosses?: number[];
  rejectedCell?: number | null;
  obstacleCells?: number[];
  boardTop?: number;
}) {
  return (
    <div
      className="absolute grid gap-0.5"
      style={{
        left: DEMO_BOARD_LEFT,
        top: boardTop,
        gridTemplateColumns: `repeat(${DEMO_SIZE}, ${DEMO_CELL_SIZE}px)`,
        width: DEMO_BOARD_WIDTH,
      }}
    >
      {Array.from({ length: DEMO_SIZE * DEMO_SIZE }, (_, cell) => {
        const row = Math.floor(cell / DEMO_SIZE);
        const col = cell % DEMO_SIZE;
        const placedIndex = Object.entries(placedCells).find(
          ([, placedCell]) => placedCell === cell,
        )?.[0];
        const character = placedIndex === undefined ? undefined : characters[Number(placedIndex)];
        const isCrossed =
          !character &&
          Object.values(placedCells).some(
            (placedCell) =>
              Math.floor(placedCell / DEMO_SIZE) === row || placedCell % DEMO_SIZE === col,
          );
        const isRejected = rejectedCell === cell;

        return (
          <div
            key={cell}
            className={`relative flex items-center justify-center rounded transition-all duration-300 ${
              isRejected ? "z-10 scale-110 ring-2 ring-red-600" : ""
            }`}
            style={{
              width: DEMO_CELL_SIZE,
              height: DEMO_CELL_SIZE,
              backgroundColor: DEMO_CELL_COLORS[cell],
            }}
          >
            {character && renderCharacter(character, "h-7 w-7 animate-in zoom-in-50 duration-300")}
            {obstacleCells.includes(cell) && (
              <span className="absolute inset-0 z-0 flex items-center justify-center text-2xl select-none">
                🏢
              </span>
            )}
            {(isCrossed || manualCrosses.includes(cell)) && (
              <span className="text-xl font-bold leading-none text-red-600">✕</span>
            )}
            {rejectedCell === cell && (
              <span className="absolute inset-0 z-10 flex h-[90%] w-[90%] items-center justify-center select-none text-[180%] animate-bounce-3">
                🚫
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DemoHand({ position, pressed }: { position: { x: number; y: number }; pressed: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 text-2xl transition-all duration-300 ease-in-out ${
        pressed ? "scale-75" : "scale-100"
      }`}
      style={{ left: position.x - 10, top: position.y - 10 }}
    >
      👆
    </div>
  );
}

interface MurdokuTutorialProps {
  open: boolean;
  onClose: () => void;
}

function GoalStep({ characters }: { characters: Character[] }) {
  const [actionIndex, setActionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [placedCells, setPlacedCells] = useState<Record<number, number>>({});
  const [handPosition, setHandPosition] = useState({ x: 26, y: DEMO_TRAY_HAND_Y });
  const [handPressed, setHandPressed] = useState(false);

  useEffect(() => {
    const action = GOAL_SCRIPT[actionIndex];
    if (!action) return;

    switch (action.kind) {
      case "move":
        setHandPosition({ x: action.x, y: action.y });
        setHandPressed(false);
        break;
      case "select":
        setSelectedIndex(action.characterIndex);
        setHandPressed(true);
        break;
      case "place":
        setPlacedCells((current) => ({ ...current, [action.characterIndex]: action.cell }));
        setHandPressed(true);
        break;
      case "pause":
        break;
    }

    const timer = setTimeout(
      () => {
        if (actionIndex + 1 < GOAL_SCRIPT.length) {
          setActionIndex(actionIndex + 1);
          return;
        }
        setSelectedIndex(null);
        setPlacedCells({});
        setHandPosition({ x: 26, y: DEMO_TRAY_HAND_Y });
        setActionIndex(0);
      },
      action.kind === "pause" ? action.duration : 350,
    );

    return () => clearTimeout(timer);
  }, [actionIndex]);

  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center">
      <div className="relative" style={{ width: DEMO_STAGE_WIDTH, height: 230 }}>
        <CharacterTray characters={characters} selectedIndex={selectedIndex} />
        <DemoBoard characters={characters} placedCells={placedCells} />
        <DemoHand position={handPosition} pressed={handPressed} />
      </div>
    </div>
  );
}

type RowColumnAction =
  | { kind: "move"; x: number; y: number }
  | { kind: "select"; characterIndex: number }
  | { kind: "place"; characterIndex: number; cell: number }
  | { kind: "reject"; cell: number }
  | { kind: "pause"; duration: number };

const ROW_COLUMN_SCRIPT: RowColumnAction[] = [
  { kind: "move", x: 26, y: DEMO_TRAY_HAND_Y },
  { kind: "select", characterIndex: 0 },
  { kind: "pause", duration: 300 },
  {
    kind: "move",
    x: DEMO_BOARD_LEFT + DEMO_CELL_SIZE / 2,
    y: DEMO_BOARD_TOP + DEMO_CELL_SIZE / 2,
  },
  { kind: "pause", duration: 250 },
  { kind: "place", characterIndex: 0, cell: 0 },
  { kind: "pause", duration: 700 },
  { kind: "move", x: 70, y: DEMO_TRAY_HAND_Y },
  { kind: "select", characterIndex: 1 },
  { kind: "pause", duration: 300 },
  {
    kind: "move",
    x: DEMO_BOARD_LEFT + 2 * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) + DEMO_CELL_SIZE / 2,
    y: DEMO_BOARD_TOP + DEMO_CELL_SIZE / 2,
  },
  { kind: "pause", duration: 350 },
  { kind: "reject", cell: 2 },
  { kind: "pause", duration: 1000 },
];

function RowColumnStep({ characters }: { characters: Character[] }) {
  const [actionIndex, setActionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [placedCells, setPlacedCells] = useState<Record<number, number>>({});
  const [rejectedCell, setRejectedCell] = useState<number | null>(null);
  const [handPosition, setHandPosition] = useState({ x: 26, y: DEMO_TRAY_HAND_Y });
  const [handPressed, setHandPressed] = useState(false);

  useEffect(() => {
    const action = ROW_COLUMN_SCRIPT[actionIndex];
    if (!action) return;

    switch (action.kind) {
      case "move":
        setHandPosition({ x: action.x, y: action.y });
        setHandPressed(false);
        break;
      case "select":
        setSelectedIndex(action.characterIndex);
        setRejectedCell(null);
        setHandPressed(true);
        break;
      case "place":
        setPlacedCells({ [action.characterIndex]: action.cell });
        setHandPressed(true);
        break;
      case "reject":
        setRejectedCell(action.cell);
        setHandPressed(true);
        break;
      case "pause":
        break;
    }

    const timer = setTimeout(
      () => {
        if (actionIndex + 1 < ROW_COLUMN_SCRIPT.length) {
          setActionIndex(actionIndex + 1);
          return;
        }
        setSelectedIndex(null);
        setPlacedCells({});
        setRejectedCell(null);
        setHandPosition({ x: 26, y: DEMO_TRAY_HAND_Y });
        setActionIndex(0);
      },
      action.kind === "pause" ? action.duration : 350,
    );

    return () => clearTimeout(timer);
  }, [actionIndex]);

  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center">
      <div className="relative" style={{ width: DEMO_STAGE_WIDTH, height: 230 }}>
        <CharacterTray characters={characters} selectedIndex={selectedIndex} />
        <DemoBoard characters={characters} placedCells={placedCells} rejectedCell={rejectedCell} />
        <DemoHand position={handPosition} pressed={handPressed} />
      </div>
    </div>
  );
}

type CrossMarkAction =
  | { kind: "move"; x: number; y: number }
  | { kind: "select-mode" }
  | { kind: "mark"; cell: number }
  | { kind: "pause"; duration: number };

const CROSS_MARK_CELLS = [1, 6, 11];
const CROSS_BUTTON_POSITION = { x: DEMO_STAGE_WIDTH / 2, y: 263 };
const CROSS_MARK_SCRIPT: CrossMarkAction[] = [
  { kind: "move", ...CROSS_BUTTON_POSITION },
  { kind: "pause", duration: 300 },
  { kind: "select-mode" },
  { kind: "pause", duration: 350 },
  ...CROSS_MARK_CELLS.flatMap((cell) => {
    const row = Math.floor(cell / DEMO_SIZE);
    const col = cell % DEMO_SIZE;
    return [
      {
        kind: "move" as const,
        x: DEMO_BOARD_LEFT + col * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) + DEMO_CELL_SIZE / 2,
        y: CROSS_BOARD_TOP + row * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) + DEMO_CELL_SIZE / 2,
      },
      { kind: "pause" as const, duration: 250 },
      { kind: "mark" as const, cell },
      { kind: "pause" as const, duration: 350 },
    ];
  }),
  { kind: "pause", duration: 1000 },
];

function CrossMarkStep() {
  const { t } = useI18n();
  const [actionIndex, setActionIndex] = useState(0);
  const [crossModeSelected, setCrossModeSelected] = useState(false);
  const [crossedCells, setCrossedCells] = useState<number[]>([]);
  const [handPosition, setHandPosition] = useState(CROSS_BUTTON_POSITION);
  const [handPressed, setHandPressed] = useState(false);

  useEffect(() => {
    const action = CROSS_MARK_SCRIPT[actionIndex];
    if (!action) return;

    switch (action.kind) {
      case "move":
        setHandPosition({ x: action.x, y: action.y });
        setHandPressed(false);
        break;
      case "select-mode":
        setCrossModeSelected(true);
        setHandPressed(true);
        break;
      case "mark":
        setCrossedCells((current) =>
          current.includes(action.cell) ? current : [...current, action.cell],
        );
        setHandPressed(true);
        break;
      case "pause":
        break;
    }

    const timer = setTimeout(
      () => {
        if (actionIndex + 1 < CROSS_MARK_SCRIPT.length) {
          setActionIndex(actionIndex + 1);
          return;
        }
        setCrossModeSelected(false);
        setCrossedCells([]);
        setHandPosition(CROSS_BUTTON_POSITION);
        setActionIndex(0);
      },
      action.kind === "pause" ? action.duration : 350,
    );

    return () => clearTimeout(timer);
  }, [actionIndex]);

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center">
      <div className="relative" style={{ width: DEMO_STAGE_WIDTH, height: 300 }}>
        <DemoBoard
          characters={[]}
          placedCells={{}}
          manualCrosses={crossedCells}
          boardTop={CROSS_BOARD_TOP}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-pressed={crossModeSelected}
          className={`absolute left-1/2 top-[244px] flex -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all ${
            crossModeSelected
              ? "border border-primary bg-primary/10 text-primary"
              : "text-muted-foreground"
          }`}
        >
          <XCircle className="h-7 w-7" />
          {t("murdoku.crosses")}
        </button>
        <DemoHand position={handPosition} pressed={handPressed} />
      </div>
    </div>
  );
}

type ObstacleAction =
  | { kind: "move"; x: number; y: number }
  | { kind: "select"; characterIndex: number }
  | { kind: "attempt"; cell: number }
  | { kind: "pause"; duration: number };

const BUILDING_CELL = 5;
const BUILDING_POSITION = {
  x:
    DEMO_BOARD_LEFT +
    (BUILDING_CELL % DEMO_SIZE) * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) +
    DEMO_CELL_SIZE / 2,
  y:
    DEMO_BOARD_TOP +
    Math.floor(BUILDING_CELL / DEMO_SIZE) * (DEMO_CELL_SIZE + DEMO_BOARD_GAP) +
    DEMO_CELL_SIZE / 2,
};
const OBSTACLE_SCRIPT: ObstacleAction[] = [
  { kind: "move", x: 26, y: DEMO_TRAY_HAND_Y },
  { kind: "select", characterIndex: 0 },
  { kind: "pause", duration: 350 },
  { kind: "move", ...BUILDING_POSITION },
  { kind: "pause", duration: 400 },
  { kind: "attempt", cell: BUILDING_CELL },
  { kind: "pause", duration: 1200 },
];

function ObstaclesStep({ characters }: { characters: Character[] }) {
  const [actionIndex, setActionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [blockedCell, setBlockedCell] = useState<number | null>(null);
  const [handPosition, setHandPosition] = useState({ x: 26, y: DEMO_TRAY_HAND_Y });
  const [handPressed, setHandPressed] = useState(false);

  useEffect(() => {
    const action = OBSTACLE_SCRIPT[actionIndex];
    if (!action) return;

    switch (action.kind) {
      case "move":
        setHandPosition({ x: action.x, y: action.y });
        setHandPressed(false);
        break;
      case "select":
        setSelectedIndex(action.characterIndex);
        setBlockedCell(null);
        setHandPressed(true);
        break;
      case "attempt":
        setBlockedCell(action.cell);
        setHandPressed(true);
        break;
      case "pause":
        break;
    }

    const timer = setTimeout(
      () => {
        if (actionIndex + 1 < OBSTACLE_SCRIPT.length) {
          setActionIndex(actionIndex + 1);
          return;
        }
        setSelectedIndex(null);
        setBlockedCell(null);
        setHandPosition({ x: 26, y: DEMO_TRAY_HAND_Y });
        setActionIndex(0);
      },
      action.kind === "pause" ? action.duration : 350,
    );

    return () => clearTimeout(timer);
  }, [actionIndex]);

  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center">
      <div className="relative" style={{ width: DEMO_STAGE_WIDTH, height: 230 }}>
        <CharacterTray characters={characters} selectedIndex={selectedIndex} />
        <DemoBoard
          characters={characters}
          placedCells={{}}
          obstacleCells={[BUILDING_CELL]}
          rejectedCell={blockedCell}
        />
        <DemoHand position={handPosition} pressed={handPressed} />
      </div>
    </div>
  );
}

export function MurdokuTutorial({ open, onClose }: MurdokuTutorialProps) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoaded, setCharactersLoaded] = useState(false);
  const [charactersLoadError, setCharactersLoadError] = useState(false);

  useEffect(() => {
    if (!open || charactersLoaded) return;
    let cancelled = false;

    fetchCharacters().then(
      (availableCharacters) => {
        if (cancelled) return;
        if (availableCharacters.length < 4) {
          setCharactersLoadError(true);
        } else {
          setCharacters(availableCharacters.slice(0, 4));
        }
        setCharactersLoaded(true);
      },
      (error: unknown) => {
        console.error("Failed to load Murdoku tutorial characters", error);
        if (!cancelled) {
          setCharactersLoadError(true);
          setCharactersLoaded(true);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [open, charactersLoaded]);

  const characterStepContent = charactersLoadError ? (
    <p role="alert" className="max-w-56 text-sm text-destructive">
      {t("murdoku.tutorial.charactersError")}
    </p>
  ) : !charactersLoaded ? (
    <p className="text-sm text-muted-foreground">{t("murdoku.loading")}</p>
  ) : null;

  const steps: MurdokuDemoStep[] = [
    {
      title: t("murdoku.tutorial.step1Title"),
      desc: t("murdoku.tutorial.step1Desc"),
      component: characterStepContent ?? <GoalStep characters={characters} />,
    },
    {
      title: t("murdoku.tutorial.step2Title"),
      desc: t("murdoku.tutorial.step2Desc"),
      component: characterStepContent ?? <RowColumnStep characters={characters} />,
    },
    {
      title: t("murdoku.tutorial.step3Title"),
      desc: t("murdoku.tutorial.step3Desc"),
      component: <CrossMarkStep />,
    },
    {
      title: t("murdoku.tutorial.step4Title"),
      desc: t("murdoku.tutorial.step4Desc"),
      component: characterStepContent ?? <ObstaclesStep characters={characters} />,
    },
  ];

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  if (!open) return null;

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
          aria-label={t("murdoku.tutorial.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold" style={{ color: "var(--primary)" }}>
            {t("murdoku.tutorial.title")}
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
            {t("murdoku.tutorial.stepOf", { current: stepIndex + 1, total: steps.length })}
          </p>
        </div>

        <div className="mt-5 flex justify-center">{step.component}</div>

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
            {t("murdoku.tutorial.prev")}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-2.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {t("murdoku.tutorial.skip")}
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
            {isLastStep ? t("murdoku.tutorial.gotIt") : t("murdoku.tutorial.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
