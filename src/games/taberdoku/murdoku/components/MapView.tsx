import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [viewMode, setViewMode] = useState<"grid" | "tabs">("grid");
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === "tabs" && selectedTabId && selectedCharId !== selectedTabId) {
      onSelectCharacter(selectedTabId);
    }
  }, [viewMode, selectedTabId, selectedCharId, onSelectCharacter]);

  useEffect(() => {
    if (viewMode === "tabs" && !selectedTabId && characters.length > 0) {
      setSelectedTabId(characters[0].id);
    }
  }, [viewMode, selectedTabId, characters]);

  const handleTabChange = (charId: string) => {
    setSelectedTabId(charId);
  };

  const charCluesMap = new Map(
    characters.map((ch) => [ch.id, clues.filter((c) => c.characterId === ch.id)]),
  );
  const generalClues = clues.filter((c) => !c.characterId);

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
      ? "border-b-4 border-slate-800"
      : "";
    const rightBorder = !cellHasNeighborInSameRoom(pos, "right")
      ? "border-r-4 border-slate-800"
      : "";
    return `${bottomBorder} ${rightBorder}`;
  };

  const getRoomNameCell = (pos: Position): { name: string; isVertical: boolean } | null => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return null;
    const topRow = Math.min(...room.cells.map((c) => c.row));
    if (pos.row !== topRow) return null;
    const topCells = room.cells.filter((c) => c.row === topRow);
    const minCol = Math.min(...topCells.map((c) => c.col));
    const maxCol = Math.max(...topCells.map((c) => c.col));
    const centerCol = Math.floor((minCol + maxCol) / 2);
    if (pos.col !== centerCol) return null;
    
    // Check if room is single column
    const allCols = new Set(room.cells.map((c) => c.col));
    const isVertical = allCols.size === 1;
    
    return { name: room.name, isVertical };
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
    <div className="p-3 pb-24 overflow-visible">
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
          className="relative grid gap-0.5 rounded-2xl border-2 border-slate-300 bg-slate-200/80 p-1 shadow-sm overflow-visible"
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
                  disabled={
                    showSolution ||
                    Boolean(mode === "place" && selectedCharId && cellHasNonWalkable)
                  }
                  onClick={handleCellClick}
                  className={`relative flex aspect-square items-center justify-center text-xs font-medium transition-all overflow-visible ${
                    ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                  } ${border} ${
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
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-top object-cover ring-2 ring-white shadow-xs"
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
                        className={`z-0 absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl select-none`}
                        title={el.walkable ? el.name : `${el.name} (no caminable)`}
                      >
                        {el.image ? (
                          <img
                            src={el.image}
                            alt={el.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          el.icon
                        )}
                      </span>
                    );
                  })()}

                  {(() => {
                    const roomNameData = getRoomNameCell(pos);
                    if (!roomNameData) return null;
                    const { name, isVertical } = roomNameData;
                    return (
                      <span 
                        className={`absolute top-0.5 left-0 rounded bg-white/85 px-1 py-0.2 text-[10px] font-bold text-slate-700 shadow-2xs backdrop-blur-xs z-10 whitespace-nowrap`}
                        style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
                      >
                        {name}
                      </span>
                    );
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
              onClick={() => setViewMode("tabs")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                viewMode === "tabs"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t("murdoku.viewTabs") ?? "Tabs"}
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
          <Tabs value={selectedTabId ?? ""} onValueChange={handleTabChange}>
            <TabsList
              className="grid h-auto p-1 bg-slate-200/80 border-b-2 border-slate-300"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              }}
            >
              {characters.map((char) => {
                const placed = placements[char.id];
                return (
                  <TabsTrigger
                    key={char.id}
                    value={char.id}
                    disabled={showSolution}
                    className="relative aspect-square p-0 data-[state=active]:bg-card data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-lg"
                    title={char.name}
                  >
                    {char.image ? (
                      <img
                        src={char.image}
                        alt={char.name}
                        className="h-full w-full rounded-lg object-top object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold">{char.name[0]}</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {characters.map((char) => {
              const placed = placements[char.id];
              const charClues = charCluesMap.get(char.id) ?? [];
              return (
                <TabsContent key={char.id} value={char.id} className="mt-0">
                  <div
                    className={`border-2 border-t-0 border-slate-300 bg-card p-4 transition-all shadow-sm ${
                      selectedCharId === char.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="text-left mb-1">
                        <span className="text-lg font-bold text-foreground">{char.name}</span>
                      </div>
                      {placed && (
                        <span className="text-[15px] font-semibold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full inline-block">
                          {t("murdoku.occupied")}
                        </span>
                      )}
                      {charClues.length > 0 && (
                        <div className="space-y-2">
                          {charClues.map((clue) => (
                            <div key={clue.id} className="rounded-lg bg-muted/70 p-3 text-[15px]">
                              <p className="text-foreground whitespace-pre-wrap">
                                {resolveClueText(clue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {charClues.length === 0 && (
                        <p className="text-[15px] text-muted-foreground text-center py-2">
                          {t("murdoku.noCluesForChar") ?? "No clues for this character"}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
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
