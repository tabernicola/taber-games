import { useI18n } from "@/platform/i18n";
import type { MurdokuCharacter } from "../logic/characters";

const BOARD_COLOR = "#bfdbfe";

interface MiniBoardProps {
  size: number;
  characters: { cell: number; image?: string; name: string }[];
  crosses: number[];
  cellSize?: number;
}

function MiniBoard({ size, characters, crosses, cellSize = 36 }: MiniBoardProps) {
  const charAt = (cell: number) => characters.find((c) => c.cell === cell);

  return (
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
        const hasCross = crosses.includes(i);

        return (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ background: BOARD_COLOR }}
          >
            {char && (
              <div className="absolute inset-0 flex items-center justify-center">
                {char.image ? (
                  <img
                    src={char.image}
                    alt={char.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white">
                    {char.name.slice(0, 2)}
                  </span>
                )}
              </div>
            )}
            {hasCross && !char && (
              <XMark className="h-5 w-5 text-red-600 stroke-[3]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function XMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="flex flex-col items-center gap-1.5">
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

export function TaberdokuRules({ characters }: { characters: MurdokuCharacter[] }) {
  const { t } = useI18n();

  const sample = characters.slice(0, 1);
  const c = sample[0];
  const char = {
    image: c?.image,
    name: c?.name ?? "P1",
  };

  // Rule 1: One character per room — 3 rooms of 3 cells (rows).
  // Character in room 0 (cell 0), X on other cells of room 0 (cells 1,2).
  const rule1Chars = [{ cell: 0, ...char }];
  const rule1Crosses = [1, 2];

  // Rule 2: One per row and column — character at (0,0).
  // X on rest of row 0 (1,2) and rest of col 0 (3,6).
  const rule2Chars = [{ cell: 0, ...char }];
  const rule2Crosses = [1, 2, 3, 6];

  // Rule 3: No touching — character at center (4).
  // X on all 8 surrounding cells.
  const rule3Chars = [{ cell: 4, ...char }];
  const rule3Crosses = [0, 1, 2, 3, 5, 6, 7, 8];

  return (
    <div className="mx-auto mb-3 max-w-[480px]">
      <div className="flex items-start justify-center gap-2">
        <RuleCard title={t("taberdoku.rule1")}>
          <MiniBoard size={3} characters={rule1Chars} crosses={rule1Crosses} cellSize={36} />
        </RuleCard>
        <RuleCard title={t("taberdoku.rule2")}>
          <MiniBoard size={3} characters={rule2Chars} crosses={rule2Crosses} cellSize={36} />
        </RuleCard>
        <RuleCard title={t("taberdoku.rule3")}>
          <MiniBoard size={3} characters={rule3Chars} crosses={rule3Crosses} cellSize={36} />
        </RuleCard>
      </div>
    </div>
  );
}