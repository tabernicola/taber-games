import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import {
  submitCase,
  fetchBoards,
  fetchBoardElements,
  attachElementsToRooms,
  type Board,
  type BoardElement,
} from "@/games/taberdoku/murdoku/logic/cases";
import { translateText } from "@/games/taberdoku/murdoku/logic/translate";
import { fetchCharacters as fetchPlatformCharacters } from "@/platform/characters/characters";
import {
  validateSolution,
  isCaseSolvable,
  getRoomForCell,
  posKey,
  localize,
} from "@/games/taberdoku/murdoku/logic/game";
import type {
  CaseContent,
  Character,
  Clue,
  ClueType,
  Position,
  Room,
  RoomElement,
} from "@/games/taberdoku/murdoku/data/gameSchema";
import { useMurdokuTheme } from "@/games/taberdoku/murdoku/hooks/useMurdokuTheme";

import "@/games/taberdoku/murdoku/light-theme.css";

export function CaseEditor() {
  const { t, slug, lang } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useMurdokuTheme();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedBoardElements, setSelectedBoardElements] = useState<BoardElement[]>([]);
  const [boardElementsLoading, setBoardElementsLoading] = useState(false);

  const [placements, setPlacements] = useState<Record<string, Position>>({});
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [killerId, setKillerId] = useState("");
  const [victimId, setVictimId] = useState("");
  const [clues, setClues] = useState<Clue[]>([
    { id: "clue-0", text: { es: "", en: "", eu: "" }, type: "fact", translateFrom: "es" },
    { id: "clue-1", text: { es: "", en: "", eu: "" }, type: "elimination", translateFrom: "es" },
  ]);
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [roomElements, setRoomElements] = useState<Record<string, RoomElement[]>>({});

  const gridRows = selectedBoard?.gridRows ?? 0;
  const gridCols = selectedBoard?.gridCols ?? 0;

  const rooms: Room[] = useMemo(() => {
    if (!selectedBoard) return [];
    return attachElementsToRooms(selectedBoard.rooms, selectedBoardElements);
  }, [selectedBoard, selectedBoardElements]);

  const characters: Character[] = useMemo(
    () => allCharacters.slice(0, gridRows),
    [allCharacters, gridRows],
  );

  const step1Valid = useMemo(() => {
    if (!title.trim()) return false;
    if (!selectedBoard) return false;
    if (characters.length < 3) return false;
    return true;
  }, [title, selectedBoard, characters]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchBoards().then((b) => {
        if (mounted) {
          setBoards(b);
          setBoardsLoading(false);
        }
      }),
      fetchPlatformCharacters().then((c) => {
        if (mounted) {
          setAllCharacters(c);
          setCharactersLoading(false);
        }
      }),
    ]);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBoard) {
      setSelectedBoardElements([]);
      return;
    }
    setBoardElementsLoading(true);
    fetchBoardElements(selectedBoard.id).then((els) => {
      setSelectedBoardElements(els);
      setBoardElementsLoading(false);
    });
  }, [selectedBoard]);

  const step2Valid = useMemo(() => {
    if (characters.length === 0) return false;
    for (const c of characters) {
      if (!placements[c.id]) return false;
    }
    if (!killerId || !victimId || killerId === victimId) return false;
    return true;
  }, [characters, placements, killerId, victimId]);

  const handleNext = () => {
    if (step === 0 && !step1Valid) return;
    if (step === 1 && !step2Valid) return;
    setStep(step + 1);
  };

  const handleBack = () => setStep(Math.max(0, step - 1));

  const handlePlacement = (pos: Position) => {
    if (!selectedCharId) return;
    setPlacements((prev) => {
      const next = { ...prev };
      const existing = next[selectedCharId];
      if (existing && existing.row === pos.row && existing.col === pos.col) {
        delete next[selectedCharId];
      } else {
        next[selectedCharId] = pos;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    const content: CaseContent = {
      gridRows,
      gridCols,
      rooms,
      characters,
      solution: {
        killerId,
        victimId,
        placements: Object.entries(placements).map(([charId, pos]) => ({
          characterId: charId,
          row: pos.row,
          col: pos.col,
        })),
      },
      clues,
    };

    const solValidation = validateSolution(content);
    if (!solValidation.valid) {
      setSubmitError(solValidation.errors.join("; "));
      return;
    }

    const solvability = isCaseSolvable(content);
    if (!solvability.solvable) {
      setSubmitError(solvability.reason);
      return;
    }

    if (!user) {
      setSubmitError(t("creator.needsAuth"));
      return;
    }

    setSubmitting(true);
    try {
      await submitCase({
        title,
        creatorId: user.id,
        content,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        void navigate({ to: "/$lang/taberdoku/murdoku", params: { lang: slug } });
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("creator.invalidCase"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="murdoku-light flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">{t("creator.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("creator.needsAuth")}</p>
        <Link
          to="/$lang/auth"
          params={{ lang: slug }}
          className="rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          {t("creator.signIn")}
        </Link>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center p-4 text-center">
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-8">
          <h2 className="text-xl font-bold text-secondary">{t("creator.savedDraft")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("murdoku.createDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="murdoku-light min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold tracking-widest text-primary">{t("creator.title")}</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex gap-2">
          {[t("creator.step1"), t("creator.step2"), t("creator.step3")].map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => (i < step ? setStep(i) : null)}
              disabled={i > step}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                i === step
                  ? "border-primary bg-primary/10 text-primary"
                  : i < step
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <Step1
            title={title}
            setTitle={setTitle}
            boards={boards}
            boardsLoading={boardsLoading}
            selectedBoard={selectedBoard}
            setSelectedBoard={setSelectedBoard}
            characters={characters}
          />
        )}

        {step === 1 && (
          <Step2
            gridRows={gridRows}
            gridCols={gridCols}
            rooms={rooms}
            characters={characters}
            placements={placements}
            selectedCharId={selectedCharId}
            setSelectedCharId={setSelectedCharId}
            onCellClick={handlePlacement}
            killerId={killerId}
            setKillerId={setKillerId}
            victimId={victimId}
            setVictimId={setVictimId}
            roomElements={roomElements}
            setRoomElements={setRoomElements}
          />
        )}

        {step === 2 && (
          <Step3
            clues={clues}
            setClues={setClues}
            translating={translating}
            setTranslating={setTranslating}
            onTranslateError={setSubmitError}
            characters={characters}
            rooms={rooms}
            roomElements={roomElements}
          />
        )}

        {submitError && <p className="mt-4 text-center text-sm text-destructive">{submitError}</p>}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
          >
            {t("creator.back")}
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 0 ? !step1Valid : !step2Valid}
              className="flex-1 rounded-lg border border-secondary bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-50"
            >
              {t("creator.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !step2Valid}
              className="flex-1 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              {submitting ? t("creator.submitting") : t("creator.submit")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Step1({
  title,
  setTitle,
  boards,
  boardsLoading,
  selectedBoard,
  setSelectedBoard,
  characters,
}: {
  title: string;
  setTitle: (v: string) => void;
  boards: Board[];
  boardsLoading: boolean;
  selectedBoard: Board | null;
  setSelectedBoard: (b: Board | null) => void;
  characters: Character[];
}) {
  const { t, lang } = useI18n();

  const handleBoardChange = (id: string) => {
    setSelectedBoard(boards.find((b) => b.id === id) ?? null);
  };

  return (
    <div className="space-y-6">
      <TextFieldSimple
        label={t("creator.name")}
        placeholder="Case title"
        value={title}
        onChange={setTitle}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{t("creator.board")}</h3>
        </div>

        {boardsLoading ? (
          <p className="text-sm text-muted-foreground">{t("murdoku.loading")}</p>
        ) : boards.length === 0 ? (
          <p className="text-sm text-destructive">{t("creator.noBoards")}</p>
        ) : (
          <>
            <select
              value={selectedBoard?.id ?? ""}
              onChange={(e) => handleBoardChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{t("creator.selectBoard")}</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {localize(board.name, board.nameI18n, lang)} ({board.gridRows} × {board.gridCols})
                </option>
              ))}
            </select>

            {selectedBoard && (
              <div className="mt-3 p-3 rounded-lg border border-border bg-secondary/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t("murdoku.grid")}:</span>
                  <span>
                    {selectedBoard.gridRows} × {selectedBoard.gridCols}
                  </span>
                  <span>
                    {t("murdoku.rooms")}: {selectedBoard.rooms.length}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("creator.characters")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("creator.charactersFromDb", { count: characters.length })}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {characters.map((char) => (
                      <div
                        key={char.id}
                        className="flex items-center gap-2 text-xs rounded-lg border border-border bg-card px-2 py-1"
                      >
                        {char.image ? (
                          <img
                            src={char.image}
                            alt={char.name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-muted shrink-0 flex items-center justify-center">
                            {char.name[0]}
                          </span>
                        )}
                        <span>{char.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Step2({
  gridRows,
  gridCols,
  rooms,
  characters,
  placements,
  selectedCharId,
  setSelectedCharId,
  onCellClick,
  killerId,
  setKillerId,
  victimId,
  setVictimId,
  roomElements,
  setRoomElements,
}: {
  gridRows: number;
  gridCols: number;
  rooms: Room[];
  characters: Character[];
  placements: Record<string, Position>;
  selectedCharId: string | null;
  setSelectedCharId: (v: string | null) => void;
  onCellClick: (pos: Position) => void;
  killerId: string;
  setKillerId: (v: string) => void;
  victimId: string;
  setVictimId: (v: string) => void;
  roomElements: Record<string, RoomElement[]>;
  setRoomElements: (v: Record<string, RoomElement[]>) => void;
}) {
  const { t } = useI18n();

  const elementAt = (roomId: string, pos: Position): RoomElement | undefined => {
    return roomElements[roomId]?.find(
      (e) => e.position.row === pos.row && e.position.col === pos.col,
    );
  };

  const updateRoomElements = (roomId: string, elements: RoomElement[]) => {
    setRoomElements({ ...roomElements, [roomId]: elements });
  };

  const addElement = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const newElement: RoomElement = {
      name: "elemento",
      icon: "📍",
      position: room.cells[0],
      walkable: true,
    };
    updateRoomElements(roomId, [...(roomElements[roomId] ?? []), newElement]);
  };

  const removeElement = (roomId: string, elementIdx: number) => {
    updateRoomElements(
      roomId,
      roomElements[roomId].filter((_, i) => i !== elementIdx),
    );
  };

  const updateElement = (
    roomId: string,
    elementIdx: number,
    field: keyof RoomElement,
    value: string | Position | boolean,
  ) => {
    const elements = [...(roomElements[roomId] ?? [])];
    elements[elementIdx] = { ...elements[elementIdx], [field]: value };
    updateRoomElements(roomId, elements);
  };

  const placedIds = new Set(Object.keys(placements));
  const unplaced = characters.filter((c) => !placedIds.has(c.id));

  const killerOptions = characters.filter((c) => placements[c.id] && c.id !== victimId);
  const victimOptions = characters.filter((c) => placements[c.id] && c.id !== killerId);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t("creator.clickCell")}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {characters.map((char) => {
            const placed = placements[char.id];
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => setSelectedCharId(selectedCharId === char.id ? null : char.id)}
                className={`flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-medium transition-all ${
                  selectedCharId === char.id
                    ? "border-primary bg-primary/10 text-primary"
                    : placed
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border bg-card text-foreground hover:border-muted-foreground/50"
                }`}
              >
                <span>{char.name[0]}</span>
                <span>{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[320px]">
        <div
          className="grid gap-0.5 rounded-lg border border-secondary/20 bg-secondary/5 p-0.5"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
        >
          {Array.from({ length: gridRows }).map((_, row) =>
            Array.from({ length: gridCols }).map((_, col) => {
              const pos: Position = { row, col };
              const key = posKey(row, col);
              const room = getRoomForCell(rooms, pos);
              const roomIdx = rooms.findIndex((r) => r.id === room?.id);
              const charsHere = characters.filter(
                (c) => placements[c.id]?.row === row && placements[c.id]?.col === col,
              );
              const elHere = room ? elementAt(room.id, pos) : undefined;
              const cellHasNonWalkable = elHere && !elHere.walkable;
              const isClicked =
                selectedCharId !== null &&
                placements[selectedCharId]?.row === row &&
                placements[selectedCharId]?.col === col;

              const handleCellClick = (pos: Position) => {
                if (selectedCharId && cellHasNonWalkable) return;
                onCellClick(pos);
              };

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCellClick(pos)}
                  className={`relative flex aspect-square items-center justify-center text-xs transition-all ${
                    ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                  } ${cellHasNonWalkable ? "opacity-50" : ""} ${isClicked ? "ring-2 ring-primary" : ""}`}
                  title={cellHasNonWalkable ? "No se puede colocar aquí" : undefined}
                >
                  {charsHere.length > 0 && (
                    <span className="z-10 flex flex-col items-center">
                      {charsHere.map((c) =>
                        c.image ? (
                          <img
                            key={c.id}
                            src={c.image}
                            alt={c.name}
                            className="h-6 w-6 rounded-full object-top object-cover"
                          />
                        ) : (
                          <span key={c.id} className="text-center text-lg font-bold text-primary">
                            {c.name[0]}
                          </span>
                        ),
                      )}
                    </span>
                  )}
                  {elHere && (
                    <span className="z-0 absolute bottom-0 right-0 text-base select-none">
                      {elHere.icon}
                    </span>
                  )}
                  {room &&
                    (() => {
                      const bottomRow = Math.max(...room.cells.map((c) => c.row));
                      if (pos.row !== bottomRow) return null;
                      const bottomCells = room.cells.filter((c) => c.row === bottomRow);
                      const minCol = Math.min(...bottomCells.map((c) => c.col));
                      const maxCol = Math.max(...bottomCells.map((c) => c.col));
                      const centerCol = Math.floor((minCol + maxCol) / 2);
                      if (pos.col !== centerCol) return null;
                      return (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 max-w-[80%] truncate text-[7px] text-muted-foreground/60">
                          {room.name}
                        </span>
                      );
                    })()}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("murdoku.rooms")}
        </h4>
        {rooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{room.name}</span>
              <button
                type="button"
                onClick={() => addElement(room.id)}
                className="text-xs text-secondary hover:text-primary"
              >
                + {t("creator.addElement")}
              </button>
            </div>
            {(roomElements[room.id] ?? []).map((el, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={el.name}
                  onChange={(e) => updateElement(room.id, idx, "name", e.target.value)}
                  placeholder={t("creator.name")}
                  className="flex-1 rounded border border-border px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  value={el.icon}
                  onChange={(e) => updateElement(room.id, idx, "icon", e.target.value)}
                  placeholder="Icono"
                  className="w-12 rounded border border-border px-2 py-1 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  {el.position.row},{el.position.col}
                </span>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={el.walkable}
                    onChange={(e) => updateElement(room.id, idx, "walkable", e.target.checked)}
                    className="w-4 h-4"
                  />
                  {t("murdoku.walkable")}
                </label>
                <button
                  type="button"
                  onClick={() => removeElement(room.id, idx)}
                  className="text-xs text-destructive hover:text-destructive/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {unplaced.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {unplaced.length} {t("creator.notPlaced")}
        </p>
      )}

      <div className="space-y-3 pt-4 border-t border-border">
        <SelectField
          label={t("creator.selectKiller")}
          value={killerId}
          onChange={setKillerId}
          options={killerOptions}
        />
        <SelectField
          label={t("creator.selectVictim")}
          value={victimId}
          onChange={setVictimId}
          options={victimOptions}
        />
      </div>
    </div>
  );
}

const ROOM_COLORS = [
  "bg-blue-100/20",
  "bg-green-100/20",
  "bg-purple-100/20",
  "bg-rose-100/20",
  "bg-amber-100/20",
  "bg-teal-100/20",
  "bg-indigo-100/20",
  "bg-fuchsia-100/20",
  "bg-emerald-100/20",
];

function Step3({
  clues,
  setClues,
  translating,
  setTranslating,
  onTranslateError,
  characters,
  rooms,
  roomElements,
}: {
  clues: Clue[];
  setClues: (v: Clue[]) => void;
  translating: Record<string, boolean>;
  setTranslating: (v: Record<string, boolean>) => void;
  onTranslateError: (msg: string) => void;
  characters: Character[];
  rooms: Room[];
  roomElements: Record<string, RoomElement[]>;
}) {
  const { t, lang } = useI18n();
  const clueTypes: ClueType[] = ["fact", "elimination"];

  // Collect all unique element names across all rooms
  const allElementNames = useMemo(() => {
    const names = new Set<string>();
    Object.values(roomElements)
      .flat()
      .forEach((el) => {
        if (el.name && el.name.trim()) {
          names.add(el.name);
        }
      });
    return Array.from(names).sort();
  }, [roomElements]);

  const addClue = () => {
    setClues([
      ...clues,
      {
        id: `clue-${clues.length}`,
        text: { es: "", en: "", eu: "" },
        type: "fact",
        translateFrom: "es",
      },
    ]);
  };

  const removeClue = (id: string) => {
    if (clues.length <= 1) return;
    setClues(clues.filter((c) => c.id !== id));
  };

  const updateClue = (id: string, patch: Partial<Clue>) => {
    setClues(clues.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const translateClue = async (id: string) => {
    const clue = clues.find((c) => c.id === id);
    if (!clue) return;
    const src = clue.translateFrom ?? "es";
    const sourceText = clue.text[src] ?? "";
    if (!sourceText.trim()) return;
    setTranslating({ ...translating, [id]: true });
    try {
      const langs = ["es", "eu", "en"];
      const next = { ...clue.text };
      for (const l of langs) {
        if (l === src) continue;
        next[l] = await translateText(sourceText, src, l);
      }
      updateClue(id, { text: next });
    } catch (err) {
      onTranslateError(err instanceof Error ? err.message : "Error al traducir.");
    } finally {
      setTranslating({ ...translating, [id]: false });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("creator.clues")}</h3>
        <button
          type="button"
          onClick={addClue}
          className="text-xs text-secondary hover:text-primary"
        >
          + {t("creator.addClue")}
        </button>
      </div>

      <div className="space-y-3">
        {clues.map((clue, idx) => (
          <div key={clue.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <select
              value={clue.type}
              onChange={(e) => updateClue(clue.id, { type: e.target.value as ClueType })}
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              {clueTypes.map((ct) => (
                <option key={ct} value={ct}>
                  {t(`murdoku.clueType.${ct}`)}
                </option>
              ))}
            </select>
            <select
              value={clue.characterId ?? ""}
              onChange={(e) =>
                updateClue(clue.id, {
                  characterId: e.target.value || undefined,
                })
              }
              className="text-xs text-muted-foreground"
            >
              <option value="">No character</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
            <select
              value={clue.roomId ?? ""}
              onChange={(e) =>
                updateClue(clue.id, {
                  roomId: e.target.value || undefined,
                })
              }
              className="text-xs text-muted-foreground"
            >
              <option value="">No room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            <select
              value={clue.elementId ?? ""}
              onChange={(e) =>
                updateClue(clue.id, {
                  elementId: e.target.value || undefined,
                })
              }
              className="text-xs text-muted-foreground"
            >
              <option value="">No element</option>
              {allElementNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("creator.translateFrom")}
              </label>
              <select
                value={clue.translateFrom ?? "es"}
                onChange={(e) => updateClue(clue.id, { translateFrom: e.target.value })}
                className="text-xs text-muted-foreground border border-border rounded-lg bg-background px-2 py-1 outline-none focus:border-primary"
              >
                {["es", "eu", "en"].map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void translateClue(clue.id)}
                disabled={translating[clue.id] || !clue.text[clue.translateFrom ?? "es"]?.trim()}
                className="flex-1 rounded-lg border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
              >
                {translating[clue.id] ? "Traducir…" : t("creator.translateToOthers")}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {["es", "eu", "en"].map((l) => (
                <div key={l} className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {l.toUpperCase()}
                  </label>
                  <textarea
                    value={clue.text[l] ?? ""}
                    onChange={(e) =>
                      updateClue(clue.id, {
                        text: {
                          ...clue.text,
                          [l]: e.target.value,
                        },
                      })
                    }
                    placeholder={t("creator.clueText")}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => removeClue(clue.id)}
                className="text-xs text-destructive hover:text-destructive/80"
              >
                {t("creator.removeClue")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextFieldSimple({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Character[];
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
