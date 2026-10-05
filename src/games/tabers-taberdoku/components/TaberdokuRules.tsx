import { useI18n } from "@/platform/i18n";
import { RULE_DEMOS, isCrossRevealed } from "../logic/ruleDemos";
import type { Character } from "@/platform/characters/characters";

/** Hand artwork, pointing up: the fingertip is the spot that clicks the cell. */
const HAND_SRC = "/icons/puntero.png";
/** Fingertip position inside the artwork, as a fraction of its box. */
const HAND_TIP_X = 0.25;
const HAND_TIP_Y = -0.75;

/**
 * Progressive state driven by the tutorial timeline. When it is omitted the
 * board renders statically, which is what the in-game rule legend needs.
 */
export interface MiniBoardAnimation {
  /** Cells that already show their character; the walkthrough fills it as it goes. */
  placedCells: number[];
  crossCount: number;
  /** Cell where a misplaced character was rejected, shown with the dark X. */
  errorCell: number | null;
  handCell: number;
  handVisible: boolean;
  tapKey: number;
  tapCell: number;
  doubleTap: boolean;
}

export interface MiniBoardProps {
  size: number;
  cellColors: string[];
  characters: { cell: number; image?: string; name: string }[];
  crosses: number[];
  cellSize?: number;
  animation?: MiniBoardAnimation;
}

export function HandCursor({
  size,
  cellSize,
  cell,
  tapKey,
  doubleTap,
}: {
  size: number;
  cellSize: number;
  cell: number;
  tapKey: number;
  doubleTap: boolean;
}) {
  const left = (cell % size) * cellSize + cellSize / 2;
  const top = Math.floor(cell / size) * cellSize + cellSize / 2;
  // The inner div is keyed on the tap so the press animation replays, while the
  // outer div keeps its identity and therefore its position transition.
  const tapClass = tapKey > 0 ? (doubleTap ? "taberdoku-hand-double" : "taberdoku-hand-tap") : "";

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left,
        top,
        width: cellSize,
        height: cellSize,
        transform: "translate(-50%, -100%)",
        transition: "left 300ms ease, top 300ms ease",
        filter: "drop-shadow(0 2px 3px rgb(15 23 42 / 0.35))",
      }}
    >
      <div
        key={tapKey}
        className={tapClass}
        style={{ position: "relative", width: cellSize, height: cellSize }}
      >
        <img
          src={HAND_SRC}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute"
          style={{
            // Nudged so the fingertip lands on the top centre of the box, which
            // is the point the press animation pivots around.
            left: `${(0.5 - HAND_TIP_X) * 100}%`,
            top: `${-HAND_TIP_Y * 100}%`,
            width: cellSize,
            height: cellSize,
          }}
        />
      </div>
    </div>
  );
}

export function MiniBoard({
  size,
  cellColors,
  characters,
  crosses,
  cellSize = 24,
  animation,
}: MiniBoardProps) {
  const charAt = (cell: number) => characters.find((c) => c.cell === cell);

  return (
    <div className="relative" style={{ width: size * cellSize, height: size * cellSize }}>
      <div
        className="grid overflow-hidden rounded-lg border-2 border-slate-700"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: size * cellSize,
          height: size * cellSize,
        }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const char = charAt(i);
          const showChar =
            char !== undefined && (!animation || animation.placedCells.includes(char.cell));
          // Static boards pass every X at once; the tutorial reveals them one by one.
          const shownCrosses = animation ? animation.crossCount : crosses.length;
          const hasCross = isCrossRevealed(crosses, i, shownCrosses);
          // A wrong placement leaves the dark X the game shows on an error cell.
          const hasError = animation?.errorCell === i;
          return (
            <div
              key={i}
              className="relative flex items-center justify-center overflow-hidden"
              style={{ background: cellColors[i], width: cellSize, height: cellSize }}
            >
              {showChar && (
                <span
                  className={`absolute inset-0 z-10 flex items-center justify-center ${
                    animation ? "taberdoku-reveal-pop" : ""
                  }`}
                >
                  {char.image ? (
                    <img
                      src={char.image}
                      alt={char.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <span
                      className="font-bold text-white"
                      style={{ fontSize: Math.max(7, cellSize * 0.28) }}
                    >
                      {char.name.slice(0, 2)}
                    </span>
                  )}
                </span>
              )}
              {hasCross && (
                <XMark
                  className={`relative z-10 text-red-600 ${
                    animation ? "taberdoku-reveal-pop" : ""
                  }`}
                  style={{ width: cellSize * 0.5, height: cellSize * 0.5, strokeWidth: 3 }}
                />
              )}
              {hasError && (
                <XMark
                  className="absolute inset-0 z-10 m-auto h-3/4 w-3/4 text-red-950"
                  style={{ strokeWidth: 3 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function XMark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface RuleCardProps {
  title: string;
  children: React.ReactNode;
}

function RuleCard({ title, children }: RuleCardProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {title}
      </h4>
    </div>
  );
}

export function TaberdokuRules({ characters }: { characters: Character[] }) {
  const { t } = useI18n();

  const c = characters[0];
  const char = {
    image: c?.image,
    name: c?.name ?? "P1",
  };

  return (
    <div className="mx-auto mb-3 max-w-[480px]">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {RULE_DEMOS.map((demo, index) => (
          <RuleCard key={index} title={t(`taberdoku.rule${index + 1}`)}>
            <MiniBoard
              size={3}
              cellColors={demo.cellColors}
              characters={[{ cell: demo.charCell, ...char }]}
              crosses={demo.crossCells}
              cellSize={24}
            />
          </RuleCard>
        ))}
      </div>
    </div>
  );
}
