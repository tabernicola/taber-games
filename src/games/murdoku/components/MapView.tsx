import type { CaseContent, Character, Position } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";
import { getRoomForCell, posKey } from "../logic/game";

const ROOM_COLORS = [
  "bg-blue-950/40",
  "bg-green-950/40",
  "bg-purple-950/40",
  "bg-orange-950/40",
  "bg-teal-950/40",
  "bg-indigo-950/40",
  "bg-rose-950/40",
  "bg-amber-950/40",
  "bg-lime-950/40",
];

export function MapView({
  content,
  placements,
  selectedCharId,
  onCellToggle,
  onSelectCharacter,
  showSolution,
  solutionPositions,
  killerVictimCell,
  violationMap,
}: {
  content: CaseContent;
  placements: Record<string, Position>;
  selectedCharId: string | null;
  onCellToggle: (pos: Position) => void;
  onSelectCharacter: (charId: string) => void;
  showSolution: boolean;
  solutionPositions: Record<string, Position> | null;
  killerVictimCell: Position | null;
  violationMap: Record<string, boolean>;
}) {
  const { t } = useI18n();
  const { gridRows, gridCols, characters, rooms } = content;

  const displayPlacements = showSolution && solutionPositions ? solutionPositions : placements;

  const gridSizeClass = `grid-cols-[repeat(${gridCols},_1fr)]`;

  const getRoomColor = (roomIdx: number) => ROOM_COLORS[roomIdx % ROOM_COLORS.length];

  const isKillerOrVictimCell = (pos: Position): boolean => {
    if (!killerVictimCell) return false;
    return pos.row === killerVictimCell.row && pos.col === killerVictimCell.col;
  };

  return (
    <div className="p-3">
      <div className="mb-2 overflow-x-auto">
        <div className="flex min-w-[320px] items-center gap-2 overflow-y-auto py-2">
          {characters.map((char) => {
            const placed = placements[char.id];
            return (
              <button
                key={char.id}
                type="button"
                disabled={showSolution}
                onClick={() => onSelectCharacter(char.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-2 text-center text-sm font-medium transition-all ${
                  selectedCharId === char.id
                    ? "border-neon-pink bg-neon-pink/15 text-neon-pink"
                    : placed
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-border bg-card text-foreground hover:border-neon-pink/60"
                }`}
              >
                <span className="text-2xl">{char.emoji ?? char.name[0]}</span>
                <span className="text-xs">{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 text-center">
        <h2 className="text-xl font-bold tracking-widest text-neon-pink">{t("murdoku.grid")}</h2>
        {selectedCharId && !showSolution && (
          <p className="text-xs text-neon-cyan">
            {t("murdoku.placeCharacter")}{" "}
            {characters.find((c) => c.id === selectedCharId)?.name ?? ""}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-[480px]">
        <div
          className="relative grid gap-0.5 rounded-xl border-2 border-neon-cyan/30 bg-neon-cyan/5 p-0.5"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {Array.from({ length: gridRows }).map((_, row) =>
            Array.from({ length: gridCols }).map((_, col) => {
              const pos: Position = { row, col };
              const room = getRoomForCell(rooms, pos);
              const roomIdx = rooms.findIndex((r) => r.id === room?.id);
              const pkey = posKey(row, col);
              const isKvCell = isKillerOrVictimCell(pos);
              const hasViolation = violationMap[pkey];
              const charsHere: Character[] = [];
              for (const [charId, placement] of Object.entries(displayPlacements)) {
                if (placement.row === row && placement.col === col) {
                  const ch = characters.find((c) => c.id === charId);
                  if (ch) charsHere.push(ch);
                }
              }

              return (
                <button
                  key={pkey}
                  type="button"
                  disabled={showSolution}
                  onClick={() => onCellToggle(pos)}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 text-xs font-medium transition-all ${getRoomColor(
                    roomIdx,
                  )} ${hasViolation ? "ring-2 ring-destructive" : ""} ${
                    isKvCell && showSolution ? "ring-2 ring-yellow-400" : ""
                  } ${
                    selectedCharId && !showSolution && !hasViolation
                      ? "hover:ring-1 hover:ring-neon-pink"
                      : ""
                  }`}
                >
                  {room && (
                    <span
                      className="absolute top-0.5 left-0.5 text-[8px] opacity-40"
                      title={room.name}
                    >
                      {room.emoji ?? room.name[0]}
                    </span>
                  )}
                  {charsHere.length > 0 && (
                    <span className="z-10 flex flex-col items-center">
                      {charsHere.map((ch) => (
                        <span
                          key={ch.id}
                          className={`text-center text-sm font-bold ${
                            showSolution && isKvCell ? "text-yellow-400" : "text-neon-pink"
                          }`}
                          title={
                            showSolution && isKvCell
                              ? `${t("murdoku.killer")} / ${t("murdoku.victim")}`
                              : ch.name
                          }
                        >
                          {ch.emoji ?? ch.name[0]}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-muted-foreground/50">
                    {row},{col}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
