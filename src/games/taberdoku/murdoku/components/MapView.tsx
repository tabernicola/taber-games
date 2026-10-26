import { useEffect, useRef, useState, useMemo } from "react";
import type { CaseContent, Character, Clue, Position, Room, RoomElement } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";
import { getRoomForCell, localize, posKey } from "../logic/game";

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

const ROOM_BORDER_COLORS = [
  "border-sky-400",
  "border-emerald-400",
  "border-amber-400",
  "border-rose-400",
  "border-purple-400",
  "border-teal-400",
  "border-orange-400",
  "border-indigo-400",
  "border-fuchsia-400",
];

const ROOM_BORDER_COLORS_DARK = [
  "border-sky-600",
  "border-emerald-600",
  "border-amber-600",
  "border-rose-600",
  "border-purple-600",
  "border-teal-600",
  "border-orange-600",
  "border-indigo-600",
  "border-fuchsia-600",
];

const ROOM_BORDER_HEX_COLORS = [
  "#38bdf8", // sky-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#fb7185", // rose-400
  "#c084fc", // purple-400
  "#2dd4bf", // teal-400
  "#fb923c", // orange-400
  "#818cf8", // indigo-400
  "#e879f9", // fuchsia-400
];

const ROOM_BORDER_HEX_COLORS_DARK = [
  "#0284c7", // sky-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#e11d48", // rose-600
  "#9333ea", // purple-600
  "#0d9488", // teal-600
  "#ea580c", // orange-600
  "#4f46e5", // indigo-600
  "#c026d3", // fuchsia-600
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
  showElementNames,
  selectedClueId,
  onSelectClue,
  solutionAnimation,
}: {
  content: CaseContent;
  placements: Record<string, Position>;
  tentativeMarks: Set<string>;
  crossedCells: Set<string>;
  selectedCharId: string | null;
  onSelectCharacter: (charId: string) => void;
  onCellAction: (pos: Position) => void;
  mode: "place" | "notes" | "crosses" | "erase" | null;
  showSolution: boolean;
  solutionPositions: Record<string, Position> | null;
  killerVictimCell: Position | null;
  violationMap: Record<string, boolean>;
  showElementNames: boolean;
  selectedClueId: string | null;
  onSelectClue: (clueId: string) => void;
  solutionAnimation: { type: 'correct' | 'incorrect', cellKey: string }[];
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

  const renderClueText = (clue: Clue, char?: Character): React.ReactNode => {
    const text = resolveClueText(clue);
    if (!char) return text;

    // Check if character name is in the text and highlight it
    const nameParts = char.name.split(' ');
    let highlightedText = text;
    nameParts.forEach(namePart => {
      if (namePart.length > 2) {
        const regex = new RegExp(`(${namePart})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<strong>$1</strong>');
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
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

  const cluesScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to first clue of selected character
  useEffect(() => {
    if (selectedCharId && cluesScrollRef.current) {
      const charClues = clues.filter((c) => c.characterId === selectedCharId);
      if (charClues.length > 0) {
        const firstClueEl = document.getElementById(`clue-${charClues[0].id}`);
        if (firstClueEl && cluesScrollRef.current) {
          const containerRect = cluesScrollRef.current.getBoundingClientRect();
          const elementRect = firstClueEl.getBoundingClientRect();
          const scrollTop = cluesScrollRef.current.scrollTop;
          const elementTop = elementRect.top - containerRect.top + scrollTop;
          cluesScrollRef.current.scrollTo({
            top: elementTop,
            behavior: "smooth"
          });
        }
      }
    }
  }, [selectedCharId, clues]);

  const cellHasNeighborInSameRoom = (pos: Position, direction: "right" | "bottom" | "top" | "left"): boolean => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return false;
    const neighbor =
      direction === "right"
        ? { row: pos.row, col: pos.col + 1 }
        : direction === "bottom"
          ? { row: pos.row + 1, col: pos.col }
          : direction === "top"
            ? { row: pos.row - 1, col: pos.col }
            : { row: pos.row, col: pos.col - 1 };
    const neighborRoom = getRoomForCell(rooms, neighbor);
    return neighborRoom?.id === room.id;
  };

  const getCellBorder = (pos: Position): string => {
    const room = getRoomForCell(rooms, pos);
    const roomIdx = rooms.findIndex((r) => r.id === room?.id);
    const borderColor = ROOM_BORDER_COLORS[roomIdx % ROOM_BORDER_COLORS.length] || "border-slate-800";

    const topBorder = !cellHasNeighborInSameRoom(pos, "top")
      ? `border-t-2 ${borderColor}`
      : "";
    const bottomBorder = !cellHasNeighborInSameRoom(pos, "bottom")
      ? `border-b-2 ${borderColor}`
      : "";
    const leftBorder = !cellHasNeighborInSameRoom(pos, "left")
      ? `border-l-2 ${borderColor}`
      : "";
    const rightBorder = !cellHasNeighborInSameRoom(pos, "right")
      ? `border-r-2 ${borderColor}`
      : "";
    return `${topBorder} ${bottomBorder} ${leftBorder} ${rightBorder}`;
  };

  const getRoomNameCell = (pos: Position): { name: string; isVertical: boolean; alignment: "top" | "bottom" } | null => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return null;
    
    // Si la sala tiene una posición de nombre especificada, usarla
    if (room.namePosition) {
      if (pos.row === room.namePosition.row && pos.col === room.namePosition.col) {
        const isVertical = room.nameOrientation === "vertical";
        const alignment = room.nameAlignment || "top";
        return { name: localize(room.name, room.nameI18n, lang), isVertical, alignment };
      }
      return null;
    }
    
    // Lógica original para cálculo automático
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
    const alignment = room.nameAlignment || "top";
    
    return { name: localize(room.name, room.nameI18n, lang), isVertical, alignment };
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

  // Get highlighted cells/rooms based on selected clue
  const selectedClue = selectedClueId ? clues.find(c => c.id === selectedClueId) : null;
  const highlightedRooms = useMemo(() => {
    if (!selectedClue) return new Set<string>();

    const roomIds = new Set<string>();

    // Highlight room if clue has roomId
    if (selectedClue.roomId) {
      roomIds.add(selectedClue.roomId);
    }

    return roomIds;
  }, [selectedClue]);

  const highlightedCells = useMemo(() => {
    if (!selectedClue) return new Set<string>();

    const cells = new Set<string>();

    // Highlight elements with matching name if clue has elementId (case-insensitive)
    if (selectedClue.elementId) {
      rooms.forEach(room => {
        if (room.elements) {
          room.elements.forEach(el => {
            if (el.name.toLowerCase() === selectedClue.elementId.toLowerCase()) {
              cells.add(posKey(el.position.row, el.position.col));
            }
          });
        }
      });
    }

    return cells;
  }, [selectedClue, rooms]);

  return (
    <div className="pb-24 overflow-visible">
      <div className="mx-auto max-w-[480px]">

        <div
          className="relative grid gap-px rounded-2xl border-2 border-slate-300 bg-slate-200/80 p-1 shadow-sm overflow-visible"
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
              const roomHighlighted = room ? highlightedRooms.has(room.id) : false;
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

              const isHighlighted = highlightedCells.has(key);

              // Calculate which sides of this cell are on the edge of a highlighted room
              const roomEdgeSides = roomHighlighted ? {
                top: !cellHasNeighborInSameRoom(pos, "top"),
                bottom: !cellHasNeighborInSameRoom(pos, "bottom"),
                left: !cellHasNeighborInSameRoom(pos, "left"),
                right: !cellHasNeighborInSameRoom(pos, "right"),
              } : null;

              // Check if there's any room highlighted (not just this specific room)
              const hasHighlightedRoom = highlightedRooms.size > 0;

              const cellEl = elementAt(pos);
              const cellHasNonWalkable = cellEl && !cellEl.walkable;

              const handleCellClick = () => {
                if ((mode === "place" || mode === null) && selectedCharId && cellHasNonWalkable) return;
                onCellAction(pos);
              };

              return (
                <button
                  key={key}
                  type="button"
              disabled={
                showSolution ||
                Boolean((mode === "place" || mode === null) && selectedCharId && cellHasNonWalkable)
              }
              onClick={handleCellClick}
              className={`relative flex aspect-square items-center justify-center text-xs font-medium transition-all overflow-visible ${
                isHighlighted
                  ? "bg-amber-200/80"
                  : hasHighlightedRoom && !roomHighlighted
                    ? "bg-slate-500/70"
                    : ROOM_COLORS[roomIdx % ROOM_COLORS.length]
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
                          {/* Solution animation */}
                          {(() => {
                            const anim = solutionAnimation.find(a => a.cellKey === key);
                            if (!anim) return null;
                            if (anim.type === 'correct') {
                              return (
                                <div className="absolute inset-0 rounded-full ring-4 ring-green-500 z-30 animate-pulse" />
                              );
                            } else {
                              return (
                                <div className="absolute inset-0 flex items-center justify-center z-30">
                                  <span className="text-4xl font-bold text-black">✕</span>
                                </div>
                              );
                            }
                          })()}
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
                        title={localize(el.name, el.nameI18n, lang)}
                      >
                        {el.image ? (
                          <>
                            <img
                              src={el.image}
                              alt={localize(el.name, el.nameI18n, lang)}
                              className="h-full w-full object-cover"
                            />
                            {hasHighlightedRoom && !roomHighlighted && (
                              <div className="absolute inset-0 bg-slate-500/60 z-10" />
                            )}
                            {isHighlighted && (
                              <div className="absolute inset-2 rounded-full ring-4 ring-blue-400 z-20" />
                            )}
                          </>
                        ) : (
                          el.icon
                        )}
                      </span>
                    );
                  })()}

                  {(() => {
                    const roomNameData = getRoomNameCell(pos);
                    if (!roomNameData) return null;
                    const { name, isVertical, alignment } = roomNameData;
                    const alignmentClass = alignment === "bottom" ? "bottom-0.5" : "top-0.5";
                    const room = getRoomForCell(rooms, pos);
                    const roomIdx = rooms.findIndex((r) => r.id === room?.id);
                    const roomColorClass = ROOM_COLORS[roomIdx % ROOM_COLORS.length] || "bg-slate-100";
                    // Convertir la clase de fondo a una clase con 60% de transparencia
                    const bgColorClass = roomColorClass;//roomColorClass.replace('/75', '/75');
                    const isRoomHighlighted = room ? highlightedRooms.has(room.id) : false;
                    return (
                      <span
                        className={`absolute ${alignmentClass} left-0 rounded ${bgColorClass} px-1 py-0.2 ${isRoomHighlighted ? 'text-sm' : 'text-xs'} font-bold text-slate-700 shadow-2xs backdrop-blur-xs z-10 whitespace-nowrap`}
                        style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
                      >
                        {name}
                      </span>
                    );
                  })()}

                  {/* Highlight borders for room edges */}
                  {roomEdgeSides && (
                    <>
                      {roomEdgeSides.top && (
                        <div className="absolute top-0 left-0 right-0 h-1 z-30" style={{ backgroundColor: ROOM_BORDER_HEX_COLORS_DARK[roomIdx % ROOM_BORDER_HEX_COLORS_DARK.length] || '#475569' }} />
                      )}
                      {roomEdgeSides.bottom && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 z-30" style={{ backgroundColor: ROOM_BORDER_HEX_COLORS_DARK[roomIdx % ROOM_BORDER_HEX_COLORS_DARK.length] || '#475569' }} />
                      )}
                      {roomEdgeSides.left && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 z-30" style={{ backgroundColor: ROOM_BORDER_HEX_COLORS_DARK[roomIdx % ROOM_BORDER_HEX_COLORS_DARK.length] || '#475569' }} />
                      )}
                      {roomEdgeSides.right && (
                        <div className="absolute top-0 bottom-0 right-0 w-1 z-30" style={{ backgroundColor: ROOM_BORDER_HEX_COLORS_DARK[roomIdx % ROOM_BORDER_HEX_COLORS_DARK.length] || '#475569' }} />
                      )}
                    </>
                  )}

                  {(() => {
                    if (!showElementNames) return null;
                    const cellEl = elementAt(pos);
                    if (!cellEl) return null;
                    const isEvenColumn = pos.col % 2 === 0;
                    const alignmentClass = isEvenColumn ? "top-0.5" : "bottom-0.5";
                    return (
                      <span 
                        className={`absolute ${alignmentClass} right-0.5 rounded bg-white/90 px-1 py-0.2 text-[8px] font-semibold text-slate-800 shadow-2xs backdrop-blur-xs z-10 whitespace-nowrap`}
                      >
                        {localize(cellEl.name, cellEl.nameI18n, lang)}
                      </span>
                    );
                  })()}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-3 px-3">
        {/* Lista de personajes en cuadrícula del mismo tamaño que el tablero */}
        <div
          className="grid gap-px pb-2 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            maxWidth: '480px',
          }}
        >
          {characters.map((char) => {
            const placed = placements[char.id];
            return (
              <button
                key={char.id}
                type="button"
                disabled={showSolution}
                onClick={() => onSelectCharacter(char.id)}
                className={`aspect-square rounded-lg border transition-all shadow-2xs ${
                  selectedCharId === char.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : placed
                      ? "border-secondary/40 bg-secondary/10"
                      : "border-border bg-card hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {char.image ? (
                  <img
                    src={char.image}
                    alt={char.name}
                    className="h-full w-full rounded-lg object-top object-cover"
                    title={char.name}
                  />
                ) : (
                  <span
                    className="text-2xl font-bold"
                    title={char.name}
                  >
                    {char.name[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pistas con altura fija y scroll vertical */}
        <div
          ref={cluesScrollRef}
          className="h-48 overflow-y-auto overflow-x-hidden"
        >
          <div className="space-y-2 mx-auto max-w-[480px]">
            {clues.map((clue) => {
              const char = clue.characterId ? characters.find((c) => c.id === clue.characterId) : null;
              const isClueSelected = selectedClueId === clue.id;
              return (
                <div
                  key={clue.id}
                  id={`clue-${clue.id}`}
                >
                  {char ? (
                    <button
                      type="button"
                      disabled={showSolution}
                      onClick={() => onSelectClue(clue.id)}
                      className={`rounded-xl border p-1 transition-all shadow-2xs w-full text-left ${
                        isClueSelected
                          ? "border-primary bg-primary/10"
                          : selectedCharId === char.id
                            ? "border-secondary bg-secondary/10"
                            : "border-border bg-card hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {char.image ? (
                          <img
                            src={char.image}
                            alt={char.name}
                            className="h-8 object-cover flex-shrink-0"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0 ring-1 ring-border">
                            {char.name[0]}
                          </span>
                        )}
                        <div className="flex-1 text-[13px]">
                          <p className="text-foreground whitespace-pre-wrap">
                            {renderClueText(clue, char)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={showSolution}
                      onClick={() => onSelectClue(clue.id)}
                      className={`rounded-xl border p-3 transition-all shadow-2xs w-full text-left ${
                        isClueSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-slate-300"
                      }`}
                    >
                      <div className="rounded-lg bg-muted/70 p-2 text-[13px]">
                        <p className="text-foreground whitespace-pre-wrap">
                          {resolveClueText(clue)}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!showSolution && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {selectedCharId && t("murdoku.placeCharacter")}
          {mode === "notes" && !selectedCharId && t("murdoku.notesHelp")}
          {mode === "crosses" && !selectedCharId && t("murdoku.crossesHelp")}
        </p>
      )}
    </div>
  );
}
