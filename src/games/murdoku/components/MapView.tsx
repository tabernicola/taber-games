import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Info, ChevronLeft, ChevronRight } from "lucide-react";
import type { CaseContent, Character, Clue, Position, Room, RoomElement } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";
import { getRoomForCell, posKey } from "../logic/game";

const ROOM_COLORS = [
  "bg-sky-100/75 hover:bg-sky-100",
  "bg-emerald-100/75 hover:bg-emerald-100",
  "bg-amber-100/75 hover:bg-amber-100",
  "bg-rose-100/75 hover:bg-rose-100",
  "bg-purple-100/75 hover:bg-purple-100",
  "bg-teal-100/75 hover:bg-teal-100",
  "bg-orange-100/75 hover:bg-orange-100",
  "bg-indigo-100/75 hover:bg-indigo-100",
  "bg-fuchsia-100/75 hover:bg-fuchsia-100",
];

export function MapView({
  content,
  placements,
  tentativeMarks,
  crossedCells,
  selectedCharId,
  onSelectCharacter,
  onCellAction,
  mode,
  showSolution,
  solutionPositions,
  killerVictimCell,
  violationMap,
}: {
  content: CaseContent;
  placements: Record<string, Position>;
  tentativeMarks: Set<string>;
  crossedCells: Set<string>;
  selectedCharId: string | null;
  onSelectCharacter: (charId: string) => void;
  onCellAction: (pos: Position) => void;
  mode: "place" | "notes" | "crosses" | "erase";
  showSolution: boolean;
  solutionPositions: Record<string, Position> | null;
  killerVictimCell: Position | null;
  violationMap: Record<string, boolean>;
}) {
  const { t, lang } = useI18n();
  const { gridRows, gridCols, characters, rooms, clues } = content;
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayPlacements = showSolution && solutionPositions ? solutionPositions : placements;

  const resolveClueText = (clue: Clue): string => {
    if (clue.i18nKey) return t(clue.i18nKey);
    if (typeof clue.text === "string") return clue.text;
    return clue.text[lang] ?? Object.values(clue.text)[0] ?? "";
  };

  const elementAt = (pos: Position): RoomElement | undefined => {
    for (const room of rooms) {
      if (!room.elements) continue;
      const el = room.elements.find(
        (e) => e.position.row === pos.row && e.position.col === pos.col,
      );
      if (el) return el;
    }
    return undefined;
  };

  const getDescription = (desc?: Record<string, string> | string): string => {
    if (!desc) return "";
    if (typeof desc === "string") return desc;
    return desc[lang] ?? Object.values(desc)[0] ?? "";
  };

  const [modalCharId, setModalCharId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (viewMode === "carousel") {
      const char = characters[carouselIndex];
      if (char && selectedCharId !== char.id) {
        onSelectCharacter(char.id);
      }
    }
  }, [viewMode, carouselIndex, characters, selectedCharId, onSelectCharacter]);

  const charCluesMap = new Map(
    characters.map((ch) => [ch.id, clues.filter((c) => c.characterId === ch.id)]),
  );
  const generalClues = clues.filter((c) => !c.characterId);

  const nextChar = () => setCarouselIndex((i) => (i + 1) % characters.length);
  const prevChar = () => setCarouselIndex((i) => (i - 1 + characters.length) % characters.length);

  const openCharModal = (charId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalCharId(charId);
  };

  const closeCharModal = () => setModalCharId(null);

  const cellHasNeighborInSameRoom = (pos: Position, direction: "right" | "bottom"): boolean => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return false;
    const neighbor =
      direction === "right"
        ? { row: pos.row, col: pos.col + 1 }
        : { row: pos.row + 1, col: pos.col };
    const neighborRoom = getRoomForCell(rooms, neighbor);
    return neighborRoom?.id === room.id;
  };

  const getCellBorder = (pos: Position): string => {
    const bottomBorder = !cellHasNeighborInSameRoom(pos, "bottom")
      ? "border-b-2 border-slate-700/80"
      : "";
    const rightBorder = !cellHasNeighborInSameRoom(pos, "right")
      ? "border-r-2 border-slate-700/80"
      : "";
    return `${bottomBorder} ${rightBorder}`;
  };

  const getRoomNameCell = (pos: Position): string | null => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return null;
    const bottomRow = Math.max(...room.cells.map((c) => c.row));
    if (pos.row !== bottomRow) return null;
    const bottomCells = room.cells.filter((c) => c.row === bottomRow);
    const minCol = Math.min(...bottomCells.map((c) => c.col));
    const maxCol = Math.max(...bottomCells.map((c) => c.col));
    const centerCol = Math.floor((minCol + maxCol) / 2);
    if (pos.col !== centerCol) return null;
    return room.name;
  };

  const getCharsAt = (pos: Position): Character[] => {
    const result: Character[] = [];
    for (const [charId, placement] of Object.entries(displayPlacements)) {
      if (placement.row === pos.row && placement.col === pos.col) {
        const ch = characters.find((c) => c.id === charId);
        if (ch) result.push(ch);
      }
    }
    return result;
  };

  const isKillerVictimCell = (pos: Position): boolean => {
    if (!killerVictimCell) return false;
    return pos.row === killerVictimCell.row && pos.col === killerVictimCell.col;
  };

  return (
    <div className="p-3 pb-24">
      {!showSolution && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          {mode === "place" && t("murdoku.placeCharacter")}
          {mode === "notes" && t("murdoku.notesHelp")}
          {mode === "crosses" && t("murdoku.crossesHelp")}
          {mode === "erase" && t("murdoku.eraser")}
        </p>
      )}

      <div className="mx-auto max-w-[480px]">
        <div className="mb-2 text-center">
          <h2 className="text-xl font-bold tracking-widest text-primary">{t("murdoku.grid")}</h2>
        </div>

        <div
          className="relative grid gap-0.5 rounded-2xl border-2 border-slate-300 bg-slate-200/80 p-1 shadow-sm"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {Array.from({ length: gridRows }).map((_, row) =>
            Array.from({ length: gridCols }).map((_, col) => {
              const pos: Position = { row, col };
              const key = posKey(row, col);
              const room = getRoomForCell(rooms, pos);
              const roomIdx = rooms.findIndex((r) => r.id === room?.id);
              const border = getCellBorder(pos);
              const isKvCell = isKillerVictimCell(pos);
              const hasViolation = violationMap[key];
              const charsHere = getCharsAt(pos);
              const isCrossed = crossedCells.has(key);
              const isTentative = tentativeMarks.has(key) && charsHere.length === 0;
              const isClicked =
                selectedCharId !== null &&
                !showSolution &&
                placements[selectedCharId]?.row === row &&
                placements[selectedCharId]?.col === col;

              const cellEl = elementAt(pos);
              const cellHasNonWalkable = cellEl && !cellEl.walkable;

              const handleCellClick = () => {
                if (mode === "place" && selectedCharId && cellHasNonWalkable) return;
                onCellAction(pos);
              };

              return (
                <button
                  key={key}
                  type="button"
                  disabled={showSolution || (mode === "place" && selectedCharId && cellHasNonWalkable)}
                  onClick={handleCellClick}
                  className={`relative flex aspect-square items-center justify-center text-xs font-medium transition-all ${
                    ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                  } ${border} ${cellHasNonWalkable ? "opacity-40" : ""} ${
                    hasViolation
                      ? "ring-2 ring-destructive ring-offset-1 z-20"
                      : isKvCell && showSolution
                        ? "ring-2 ring-amber-500 ring-offset-1 z-20"
                        : isClicked
                          ? "ring-2 ring-primary ring-offset-1 z-20"
                          : ""
                  }`}
                >
                  {isCrossed && charsHere.length === 0 && (
                    <span className="z-10 w-[75%] h-[75%] flex items-center justify-center text-3xl sm:text-4xl text-destructive font-bold select-none">
                      ✕
                    </span>
                  )}

                  {isTentative && (
                    <span className="z-10 h-3.5 w-3.5 rounded-full bg-primary/40 ring-1 ring-primary/60" />
                  )}

                  {charsHere.length > 0 && (
                    <span className="z-10 flex flex-col items-center">
                      {charsHere.map((ch) => (
                        <span
                          key={ch.id}
                          className={`text-center text-sm font-bold ${
                            showSolution && isKvCell ? "text-amber-600" : "text-foreground"
                          }`}
                          title={
                            showSolution && isKvCell
                              ? `${t("murdoku.killer")} / ${t("murdoku.victim")}`
                              : ch.name
                          }
                        >
                          {ch.image ? (
                            <img
                              src={ch.image}
                              alt={ch.name}
                              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-top object-cover ring-2 ring-white shadow-xs"
                              title={
                                showSolution && isKvCell
                                  ? `${t("murdoku.killer")} / ${t("murdoku.victim")}`
                                  : ch.name
                              }
                            />
                          ) : (
                            <span className="text-xl sm:text-2xl drop-shadow-xs">{ch.name[0]}</span>
                          )}
                        </span>
                      ))}
                    </span>
                  )}

                  {(() => {
                    const el = elementAt(pos);
                    if (!el) return null;
                    return (
                      <span
                        className={`z-0 absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl select-none ${el.walkable ? "" : "opacity-60"}`}
                        title={el.walkable ? el.name : `${el.name} (no caminable)`}
                      >
                        {el.icon}
                      </span>
                    );
                  })()}

                  {(() => {
                    const roomName = getRoomNameCell(pos);
                    return roomName ? (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 max-w-[95%] truncate rounded bg-white/85 px-1 py-0.2 text-[10px] font-bold text-slate-700 shadow-2xs backdrop-blur-xs">
                        {roomName}
                      </span>
                    ) : null;
                  })()}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("murdoku.selectCharacter")}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t("murdoku.viewGrid") ?? "Grid"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("carousel")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                viewMode === "carousel"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t("murdoku.viewCarousel") ?? "Carousel"}
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-2">
            {characters.map((char) => {
              const placed = placements[char.id];
              const charClues = charCluesMap.get(char.id) ?? [];
              return (
                <div
                  key={char.id}
                  className={`relative rounded-xl border p-2.5 transition-all shadow-2xs ${
                    selectedCharId === char.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : placed
                        ? "border-secondary/40 bg-secondary/10"
                        : "border-border bg-card hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => openCharModal(char.id, e)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-muted text-muted-foreground hover:bg-slate-200 hover:text-foreground transition-colors"
                    aria-label={t("murdoku.viewDetails") ?? "View details"}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={showSolution}
                    onClick={() => onSelectCharacter(char.id)}
                    className="flex flex-col w-full text-left"
                  >
                    <span className="text-xs font-bold text-foreground text-center mb-1">
                      {char.name}
                    </span>
                    <div className="flex items-start gap-2">
                      {char.image ? (
                        <img
                          src={char.image}
                          alt={char.name}
                          className="h-10 w-10 rounded-full object-top object-cover flex-shrink-0 ring-1 ring-border shadow-2xs"
                          title={getDescription(char.description)}
                        />
                      ) : (
                        <span
                          className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0"
                          title={getDescription(char.description)}
                        >
                          {char.name[0]}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        {charClues.length > 0 && (
                          <div className="space-y-0.5">
                            {charClues.map((clue) => (
                              <div key={clue.id} className="rounded-md bg-muted/80 p-1 text-[9px]">
                                <p className="text-foreground whitespace-pre-wrap truncate">
                                  {resolveClueText(clue)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[220px] flex flex-col items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-between w-full px-2">
              <button
                type="button"
                onClick={prevChar}
                disabled={showSolution}
                className="p-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs disabled:opacity-30 disabled:pointer-events-none"
                aria-label={t("murdoku.prevCharacter") ?? "Previous"}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  {carouselIndex + 1} / {characters.length}
                </span>
              </div>
              <button
                type="button"
                onClick={nextChar}
                disabled={showSolution}
                className="p-1.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs disabled:opacity-30 disabled:pointer-events-none"
                aria-label={t("murdoku.nextCharacter") ?? "Next"}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 w-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:thin [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
              {(() => {
                const char = characters[carouselIndex];
                const placed = placements[char.id];
                const charClues = charCluesMap.get(char.id) ?? [];
                return (
                  <div
                    className={`rounded-2xl border p-4 transition-all shadow-xs ${
                      selectedCharId === char.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : placed
                          ? "border-secondary/40 bg-secondary/10"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {char.image ? (
                        <img
                          src={char.image}
                          alt={char.name}
                          className="h-20 w-20 rounded-xl object-top object-cover flex-shrink-0 ring-1 ring-border shadow-xs"
                          title={getDescription(char.description)}
                        />
                      ) : (
                        <span
                          className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0"
                          title={getDescription(char.description)}
                        >
                          {char.name[0]}
                        </span>
                      )}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="text-left mb-1">
                          <span className="text-sm font-bold text-foreground">{char.name}</span>
                        </div>
                        {placed && (
                          <span className="text-[10px] font-semibold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full inline-block">
                            {t("murdoku.occupied")}
                          </span>
                        )}
                        {charClues.length > 0 && (
                          <div className="space-y-1.5">
                            {charClues.map((clue) => (
                              <div key={clue.id} className="rounded-lg bg-muted/70 p-2 text-xs">
                                <p className="text-foreground whitespace-pre-wrap">
                                  {resolveClueText(clue)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {charClues.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            {t("murdoku.noCluesForChar") ?? "No clues for this character"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {generalClues.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-center text-[11px] font-semibold text-muted-foreground">
              General
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {generalClues.map((clue) => (
                <div
                  key={clue.id}
                  className="rounded-xl border border-border bg-card p-2 text-[10px] shadow-2xs"
                >
                  <p className="text-foreground truncate">{resolveClueText(clue)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalCharId && (
        <CharacterDetailModal
          char={characters.find((c) => c.id === modalCharId)!}
          clues={charCluesMap.get(modalCharId) ?? []}
          t={t}
          resolveText={resolveClueText}
          onClose={closeCharModal}
        />
      )}
    </div>
  );
}

function CharacterDetailModal({
  char,
  clues,
  t,
  resolveText,
  onClose,
}: {
  char: Character;
  clues: Clue[];
  t: (key: string, vars?: Record<string, string | number>) => string;
  resolveText: (clue: Clue) => string;
  onClose: () => void;
}) {
  const { lang } = useI18n();
  return (
    <Dialog.Root open={true} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="murdoku-light fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {char.image ? (
                <img
                  src={char.image}
                  alt={char.name}
                  className="h-16 w-16 rounded-full object-top object-cover ring-2 ring-primary/20 shadow-xs"
                />
              ) : (
                <span className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-4xl">
                  {char.name[0]}
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-foreground">{char.name}</h3>
                {char.description && (
                  <p className="text-sm text-muted-foreground">
                    {typeof char.description === "string"
                      ? char.description
                      : (char.description[lang] ?? Object.values(char.description)[0] ?? "")}
                  </p>
                )}
              </div>
            </div>
            <Dialog.Close
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {clues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("murdoku.clues") ?? "Clues"}
              </h4>
              {clues.map((clue) => (
                <div
                  key={clue.id}
                  className="rounded-xl border border-border bg-muted/40 p-3 text-sm"
                >
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      clue.type === "fact"
                        ? "bg-secondary/15 text-secondary"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {t(`murdoku.clueType.${clue.type}`)}
                  </span>
                  <p className="mt-2 text-foreground whitespace-pre-wrap">{resolveText(clue)}</p>
                </div>
              ))}
            </div>
          )}

          {clues.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              {t("murdoku.noCluesForChar") ?? "No clues for this character"}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
