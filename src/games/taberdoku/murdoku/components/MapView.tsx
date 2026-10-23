import { useEffect, useRef, useState } from "react";
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
        return { name: room.name, isVertical, alignment };
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
    
    return { name: room.name, isVertical, alignment };
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
                    const { name, isVertical, alignment } = roomNameData;
                    const alignmentClass = alignment === "bottom" ? "bottom-0.5" : "top-0.5";
                    const room = getRoomForCell(rooms, pos);
                    const roomIdx = rooms.findIndex((r) => r.id === room?.id);
                    const roomColorClass = ROOM_COLORS[roomIdx % ROOM_COLORS.length] || "bg-slate-100";
                    // Convertir la clase de fondo a una clase con 60% de transparencia
                    const bgColorClass = roomColorClass;//roomColorClass.replace('/75', '/75');
                    return (
                      <span 
                        className={`absolute ${alignmentClass} left-0 rounded ${bgColorClass} px-1 py-0.2 text-[10px] font-bold text-slate-700 shadow-2xs backdrop-blur-xs z-10 whitespace-nowrap`}
                        style={isVertical ? { writingMode: 'vertical-rl' } : undefined}
                      >
                        {name}
                      </span>
                    );
                  })()}

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
                        {cellEl.name}
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
              return (
                <div
                  key={clue.id}
                  id={`clue-${clue.id}`}
                >
                  {char ? (
                    <button
                      type="button"
                      disabled={showSolution}
                      onClick={() => onSelectCharacter(char.id)}
                      className={`rounded-xl border p-1 transition-all shadow-2xs w-full text-left ${
                        selectedCharId === char.id
                          ? "border-primary bg-primary/10"
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
                    <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                      <div className="rounded-lg bg-muted/70 p-2 text-[13px]">
                        <p className="text-foreground whitespace-pre-wrap">
                          {resolveClueText(clue)}
                        </p>
                      </div>
                    </div>
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
