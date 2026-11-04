import { useState, useEffect, useMemo, useCallback } from "react";
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
import { updateCase } from "@/games/taberdoku/murdoku/adminFunctions";
import { BoardCreator } from "@/games/taberdoku/murdoku/components/BoardCreator";
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
  MurdokuCase,
  Position,
  Room,
} from "@/games/taberdoku/murdoku/data/gameSchema";
import { useMurdokuTheme } from "@/games/taberdoku/murdoku/hooks/useMurdokuTheme";

import "@/games/taberdoku/murdoku/light-theme.css";

export function CaseEditor({
  initialCase,
  initialBoardId,
}: {
  initialCase?: MurdokuCase;
  initialBoardId?: string;
} = {}) {
  const { t, slug, lang } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useMurdokuTheme();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(initialCase?.id ?? null);

  const [titleI18n, setTitleI18n] = useState<Record<string, string>>(() => ({
    es: initialCase?.titleI18n?.es ?? initialCase?.title ?? "",
    eu: initialCase?.titleI18n?.eu ?? "",
    en: initialCase?.titleI18n?.en ?? "",
  }));
  const [titleTranslating, setTitleTranslating] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialCase?.image ?? "");
  const [difficulty, setDifficulty] = useState(initialCase?.difficulty ?? 3);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedBoardElements, setSelectedBoardElements] = useState<BoardElement[]>([]);
  const [boardElementsLoading, setBoardElementsLoading] = useState(false);
  const [showBoardCreator, setShowBoardCreator] = useState(false);

  const [placements, setPlacements] = useState<Record<string, Position>>(
    initialCase
      ? Object.fromEntries(
          initialCase.content.solution.placements.map((p) => [
            p.characterId,
            { row: p.row, col: p.col },
          ]),
        )
      : {},
  );
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [killerId, setKillerId] = useState(initialCase?.content.solution.killerId ?? "");
  const [victimId, setVictimId] = useState(initialCase?.content.solution.victimId ?? "");
  const [witnessId, setWitnessId] = useState(initialCase?.content.solution.witnessId ?? "");
  const [clues, setClues] = useState<Clue[]>(
    initialCase?.content.clues?.length
      ? initialCase.content.clues.map((c) => ({
          id: c.id,
          text: typeof c.text === "string" ? { es: c.text, en: c.text, eu: c.text } : c.text,
          type: c.type ?? "elimination",
          translateFrom: "es",
          ...((c.type ?? "elimination") === "fact"
            ? {}
            : { characterId: c.characterId, roomId: c.roomId, elementId: c.elementId }),
        }))
      : [
          { id: "clue-0", text: { es: "", en: "", eu: "" }, type: "fact", translateFrom: "es" },
          {
            id: "clue-1",
            text: { es: "", en: "", eu: "" },
            type: "elimination",
            translateFrom: "es",
          },
        ],
  );
  const [translating, setTranslating] = useState<Record<string, Record<string, boolean>>>({});

  const gridRows = selectedBoard?.gridRows ?? initialCase?.content.gridRows ?? 0;
  const gridCols = selectedBoard?.gridCols ?? initialCase?.content.gridCols ?? 0;

  const rooms: Room[] = useMemo(() => {
    if (!selectedBoard) return initialCase?.content.rooms ?? [];
    return attachElementsToRooms(selectedBoard.rooms, selectedBoardElements);
  }, [selectedBoard, selectedBoardElements, initialCase]);

  const characters: Character[] = useMemo(
    () => allCharacters.slice(0, gridRows),
    [allCharacters, gridRows],
  );

  const title =
    ["es", "eu", "en"].map((language) => titleI18n[language]?.trim() ?? "").find(Boolean) ?? "";

  const step1Valid = useMemo(() => {
    if (!title.trim()) return false;
    if (!editingCaseId && !selectedBoard) return false;
    if (characters.length < 3) return false;
    return true;
  }, [title, selectedBoard, characters, editingCaseId]);
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
    let active = true;
    setBoardElementsLoading(true);
    fetchBoardElements(selectedBoard.id)
      .then((els) => {
        if (active) setSelectedBoardElements(els);
      })
      .catch((error: unknown) => {
        if (active) setSubmitError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (active) setBoardElementsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedBoard]);

  useEffect(() => {
    const boardId = initialCase?.board_id ?? initialBoardId;
    if (!boardId || !boards.length) return;
    const board = boards.find((b) => b.id === boardId);
    if (board && !selectedBoard) {
      setSelectedBoard(board);
    }
  }, [initialCase?.board_id, initialBoardId, boards, selectedBoard]);

  const step2Valid = useMemo(() => {
    if (characters.length === 0) return false;
    for (const c of characters) {
      if (!placements[c.id]) return false;
    }
    if (!killerId) return false;
    if (!victimId && !witnessId) return false;
    if (victimId && killerId === victimId) return false;
    if (witnessId && killerId === witnessId) return false;
    return true;
  }, [characters, placements, killerId, victimId, witnessId]);
  const handleNext = () => {
    if (step === 0 && !step1Valid) return;
    if (step === 1 && !step2Valid) return;
    setStep(step + 1);
  };

  const handleBack = () => setStep(Math.max(0, step - 1));

  const handleBoardCreated = async (boardId: string) => {
    setBoardsLoading(true);
    try {
      const updatedBoards = await fetchBoards();
      const createdBoard = updatedBoards.find((board) => board.id === boardId);
      if (!createdBoard) throw new Error("The new board could not be loaded.");
      setBoards(updatedBoards);
      setSelectedBoard(createdBoard);
      setShowBoardCreator(false);
    } finally {
      setBoardsLoading(false);
    }
  };

  const translateTitle = async (sourceLanguage: string) => {
    const sourceText = titleI18n[sourceLanguage] ?? "";
    if (!sourceText.trim()) return;

    setTitleTranslating(true);
    setSubmitError(null);
    try {
      const next = { ...titleI18n };
      for (const language of ["es", "eu", "en"]) {
        if (language === sourceLanguage) continue;
        next[language] = await translateText(sourceText, sourceLanguage, language);
      }
      setTitleI18n(next);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error al traducir.");
    } finally {
      setTitleTranslating(false);
    }
  };

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
      image: imageUrl || undefined,
      solution: {
        killerId,
        victimId,
        witnessId,
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
      const titleI18nToSave = Object.fromEntries(
        Object.entries(titleI18n)
          .map(([language, value]) => [language, value.trim()])
          .filter(([, value]) => value),
      );
      if (editingCaseId) {
        await updateCase({
          data: {
            caseId: editingCaseId,
            title,
            titleI18n: titleI18nToSave,
            boardId: selectedBoard?.id ?? null,
            image: imageUrl || null,
            content,
            difficulty,
          },
        });
      } else {
        if (!selectedBoard) throw new Error(t("creator.selectBoard"));
        await submitCase({
          title,
          titleI18n: titleI18nToSave,
          creatorId: user.id,
          boardId: selectedBoard.id,
          content,
          difficulty,
        });
      }
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

  if (showBoardCreator) {
    return (
      <BoardCreator onCancel={() => setShowBoardCreator(false)} onCreated={handleBoardCreated} />
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

      <main className="mx-auto px-4 py-6">
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
            titleI18n={titleI18n}
            setTitleI18n={setTitleI18n}
            translatingTitle={titleTranslating}
            onTranslateTitle={(language) => void translateTitle(language)}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            boards={boards}
            boardsLoading={boardsLoading}
            selectedBoard={selectedBoard}
            setSelectedBoard={setSelectedBoard}
            characters={characters}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onCreateBoard={() => {
              setSubmitError(null);
              setShowBoardCreator(true);
            }}
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
            witnessId={witnessId}
            setWitnessId={setWitnessId}
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
            gridRows={gridRows}
            gridCols={gridCols}
            placements={placements}
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
  titleI18n,
  setTitleI18n,
  translatingTitle,
  onTranslateTitle,
  imageUrl,
  setImageUrl,
  boards,
  boardsLoading,
  selectedBoard,
  setSelectedBoard,
  characters,
  difficulty,
  setDifficulty,
  onCreateBoard,
}: {
  titleI18n: Record<string, string>;
  setTitleI18n: (v: Record<string, string>) => void;
  translatingTitle: boolean;
  onTranslateTitle: (language: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  boards: Board[];
  boardsLoading: boolean;
  selectedBoard: Board | null;
  setSelectedBoard: (b: Board | null) => void;
  characters: Character[];
  difficulty: number;
  setDifficulty: (v: number) => void;
  onCreateBoard: () => void;
}) {
  const { t, lang } = useI18n();
  const [titleLangTab, setTitleLangTab] = useState<"es" | "eu" | "en">("es");
  const createBoardOption = "__create_new_board__";

  const handleBoardChange = (id: string) => {
    if (id === createBoardOption) {
      onCreateBoard();
      return;
    }
    setSelectedBoard(boards.find((b) => b.id === id) ?? null);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{t("creator.name")}</h3>
        <div className="flex gap-2 border-b border-border pb-1">
          {(["es", "eu", "en"] as const).map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => setTitleLangTab(language)}
              className={`-mb-1 border-b-2 px-2 py-0.5 text-xs font-semibold transition-colors ${
                titleLangTab === language
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={titleI18n[titleLangTab] ?? ""}
          onChange={(event) => setTitleI18n({ ...titleI18n, [titleLangTab]: event.target.value })}
          placeholder={t("creator.name")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => onTranslateTitle(titleLangTab)}
          disabled={translatingTitle || !titleI18n[titleLangTab]?.trim()}
          className="rounded-lg border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
        >
          {translatingTitle ? t("creator.translating") : t("creator.translateToOthers")}
        </button>
      </section>

      <TextFieldSimple
        label={t("creator.image")}
        placeholder="https://ejemplo.com/imagen.jpg"
        value={imageUrl}
        onChange={setImageUrl}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{t("creator.board")}</h3>
        </div>

        {boardsLoading ? (
          <p className="text-sm text-muted-foreground">{t("murdoku.loading")}</p>
        ) : (
          <select
            value={selectedBoard?.id ?? ""}
            onChange={(e) => handleBoardChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">
              {boards.length ? t("creator.selectBoard") : t("creator.noBoards")}
            </option>
            <option value={createBoardOption}>+ {t("boardCreator.createBoard")}</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {localize(board.name, board.nameI18n, lang)} ({board.gridRows} × {board.gridCols})
              </option>
            ))}
          </select>
        )}

        {selectedBoard && (
          <div className="mt-3 space-y-2 rounded-lg border border-border bg-secondary/5 p-3">
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
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                {t("creator.characters")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("creator.charactersFromDb", { count: characters.length })}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1 text-xs"
                  >
                    {char.image ? (
                      <img
                        src={char.image}
                        alt={char.name}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{t("creator.difficulty")}</h3>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`flex-1 aspect-square rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                difficulty === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-slate-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
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
  witnessId,
  setWitnessId,
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
  witnessId: string;
  setWitnessId: (v: string) => void;
}) {
  const { t, lang } = useI18n();

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

  const cellHasNeighborInSameRoom = (
    pos: Position,
    direction: "right" | "bottom" | "top" | "left",
  ): boolean => {
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
    const borderColor =
      ROOM_BORDER_COLORS[roomIdx % ROOM_BORDER_COLORS.length] || "border-slate-800";

    const topBorder = !cellHasNeighborInSameRoom(pos, "top") ? `border-t-2 ${borderColor}` : "";
    const bottomBorder = !cellHasNeighborInSameRoom(pos, "bottom")
      ? `border-b-2 ${borderColor}`
      : "";
    const leftBorder = !cellHasNeighborInSameRoom(pos, "left") ? `border-l-2 ${borderColor}` : "";
    const rightBorder = !cellHasNeighborInSameRoom(pos, "right") ? `border-r-2 ${borderColor}` : "";
    return `${topBorder} ${bottomBorder} ${leftBorder} ${rightBorder}`;
  };

  const elementAt = (pos: Position) => {
    const room = getRoomForCell(rooms, pos);
    if (!room) return undefined;
    return (room.elements ?? []).find(
      (e) => e.position.row === pos.row && e.position.col === pos.col,
    );
  };

  const getCharsAt = (pos: Position): Character[] => {
    const result: Character[] = [];
    for (const [charId, placement] of Object.entries(placements)) {
      if (placement.row === pos.row && placement.col === pos.col) {
        const ch = characters.find((c) => c.id === charId);
        if (ch) result.push(ch);
      }
    }
    return result;
  };

  const placedIds = new Set(Object.keys(placements));
  const unplaced = characters.filter((c) => !placedIds.has(c.id));

  const killerOptions = characters.filter(
    (c) => placements[c.id] && c.id !== victimId && c.id !== witnessId,
  );
  const victimOptions = characters.filter(
    (c) => placements[c.id] && c.id !== killerId && c.id !== witnessId,
  );
  const witnessOptions = characters.filter(
    (c) => placements[c.id] && c.id !== killerId && c.id !== victimId,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{t("creator.board")}</h3>
          </div>

          <div
            className="relative grid gap-px rounded-2xl border-2 border-slate-300 bg-slate-200/80 p-1 shadow-sm overflow-visible mx-auto max-w-[480px]"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
          >
            {Array.from({ length: gridRows }).map((_, row) =>
              Array.from({ length: gridCols }).map((_, col) => {
                const pos: Position = { row, col };
                const key = posKey(row, col);
                const room = getRoomForCell(rooms, pos);
                const roomIdx = rooms.findIndex((r) => r.id === room?.id);
                const cellEl = elementAt(pos);
                const cellHasNonWalkable = cellEl && !cellEl.walkable;
                const charsHere = getCharsAt(pos);
                const border = getCellBorder(pos);
                const isClicked =
                  selectedCharId !== null &&
                  placements[selectedCharId]?.row === row &&
                  placements[selectedCharId]?.col === col;

                const handleCellClick = () => {
                  if (selectedCharId && cellHasNonWalkable) return;
                  onCellClick(pos);
                };

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={selectedCharId !== null && cellHasNonWalkable}
                    onClick={handleCellClick}
                    className={`relative flex aspect-square items-center justify-center text-xs font-medium transition-all overflow-visible ${
                      ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                    } ${border} ${isClicked ? "ring-2 ring-primary ring-offset-1 z-20" : ""}`}
                    title={cellHasNonWalkable ? "No se puede colocar aquí" : undefined}
                  >
                    {charsHere.length > 0 && (
                      <span className="z-10 flex flex-col items-center">
                        {charsHere.map((c) => (
                          <span
                            key={c.id}
                            className="text-center text-sm font-bold text-foreground"
                            title={c.name}
                          >
                            {c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                className="h-7 w-7 rounded-full object-top object-cover ring-2 ring-white shadow-xs"
                              />
                            ) : (
                              <span className="text-xl drop-shadow-xs">{c.name[0]}</span>
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
                          className="z-0 absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl select-none"
                          title={localize(el.name, el.nameI18n, lang)}
                        >
                          {el.image ? (
                            <img
                              src={el.image}
                              alt={localize(el.name, el.nameI18n, lang)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            el.icon
                          )}
                        </span>
                      );
                    })()}

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
        </section>

        <section className="space-y-3">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("creator.characters")}
            </h4>
            <div
              className="grid gap-px pb-2"
              style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
            >
              {characters.map((char) => {
                const placed = placements[char.id];
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharId(selectedCharId === char.id ? null : char.id)}
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
                      <span className="text-2xl font-bold" title={char.name}>
                        {char.name?.[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {unplaced.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {unplaced.length} {t("creator.notPlaced")}
              </p>
            )}
          </div>

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
            <SelectField
              label={t("creator.selectWitness")}
              value={witnessId}
              onChange={setWitnessId}
              options={witnessOptions}
            />
          </div>
        </section>
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
  gridRows,
  gridCols,
  placements,
}: {
  clues: Clue[];
  setClues: (v: Clue[]) => void;
  translating: Record<string, Record<string, boolean>>;
  setTranslating: (v: Record<string, Record<string, boolean>>) => void;
  onTranslateError: (msg: string) => void;
  characters: Character[];
  rooms: Room[];
  gridRows: number;
  gridCols: number;
  placements: Record<string, Position>;
}) {
  const { t, lang } = useI18n();

  // Collect all unique element names across all rooms
  const allElementNames = useMemo(() => {
    const names = new Set<string>();
    rooms.forEach((room) => {
      (room.elements ?? []).forEach((el) => {
        if (el.name && el.name.trim()) {
          names.add(el.name);
        }
      });
    });
    return Array.from(names).sort();
  }, [rooms]);

  const addFact = () => {
    setClues([
      ...clues,
      {
        id: `clue-${crypto.randomUUID()}`,
        text: { es: "", en: "", eu: "" },
        type: "fact",
        translateFrom: "es",
      },
    ]);
  };

  const addElimination = () => {
    setClues([
      ...clues,
      {
        id: `clue-${crypto.randomUUID()}`,
        text: { es: "", en: "", eu: "" },
        type: "elimination",
        translateFrom: "es",
      },
    ]);
  };

  const addDeclarationFromSelection = () => {
    if (!infoCharId || !selectedElementInfo) return;
    const declaration: Clue = {
      id: `clue-${crypto.randomUUID()}`,
      text: { es: "", en: "", eu: "" },
      type: "clue",
      characterId: infoCharId,
      roomId: selectedElementInfo.room?.id ?? undefined,
      elementId: selectedElementInfo.centerEl?.id ?? undefined,
      translateFrom: "es",
    };
    setClues([declaration, ...clues]);
    setInfoCharId(null);
  };

  const removeClue = (id: string) => {
    if (clues.length <= 1) return;
    setClues(clues.filter((c) => c.id !== id));
  };

  const updateClue = (id: string, patch: Partial<Clue>) => {
    setClues(clues.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const translateClue = async (id: string, srcLang: string) => {
    const clue = clues.find((c) => c.id === id);
    if (!clue) return;
    const sourceText = clue.text[srcLang] ?? "";
    if (!sourceText.trim()) return;
    setTranslating({ ...translating, [id]: { ...(translating[id] ?? {}), [srcLang]: true } });
    try {
      const langs = ["es", "eu", "en"];
      const next = { ...clue.text };
      for (const l of langs) {
        if (l === srcLang) continue;
        next[l] = await translateText(sourceText, srcLang, l);
      }
      updateClue(id, { text: next });
    } catch (err) {
      onTranslateError(err instanceof Error ? err.message : "Error al traducir.");
    } finally {
      setTranslating({ ...translating, [id]: { ...(translating[id] ?? {}), [srcLang]: false } });
    }
  };

  const facts = clues.filter((c) => c.type === "fact");
  const declarations = clues.filter((c) => c.type !== "fact");
  const [activeTab, setActiveTab] = useState<"facts" | "declarations">("facts");
  const [infoCharId, setInfoCharId] = useState<string | null>(null);

  const getCharsAt = (pos: Position): Character[] => {
    const result: Character[] = [];
    for (const [charId, placement] of Object.entries(placements)) {
      if (placement.row === pos.row && placement.col === pos.col) {
        const ch = characters.find((c) => c.id === charId);
        if (ch) result.push(ch);
      }
    }
    return result;
  };

  const elementAt = useCallback(
    (pos: Position) => {
      const room = getRoomForCell(rooms, pos);
      if (!room) return undefined;
      return (room.elements ?? []).find(
        (e) => e.position.row === pos.row && e.position.col === pos.col,
      );
    },
    [rooms],
  );

  const selectedElementInfo = useMemo(() => {
    const pos = infoCharId ? placements[infoCharId] : null;
    if (!pos) return null;
    const room = getRoomForCell(rooms, pos);
    const centerEl = elementAt(pos);
    const neighbors = [
      { dir: "north" as const, pos: { row: pos.row - 1, col: pos.col } },
      { dir: "south" as const, pos: { row: pos.row + 1, col: pos.col } },
      { dir: "west" as const, pos: { row: pos.row, col: pos.col - 1 } },
    ]
      .filter(({ pos: p }) => p.row >= 0 && p.row < gridRows && p.col >= 0 && p.col < gridCols)
      .map(({ dir, pos: p }) => ({ dir, el: elementAt(p) }));
    return { room, centerEl, neighbors };
  }, [elementAt, infoCharId, placements, gridRows, gridCols, rooms]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("facts")}
          className={`-mb-2 border-b-2 px-3 py-1 text-xs font-semibold transition-colors ${
            activeTab === "facts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          {t("creator.facts")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("declarations")}
          className={`-mb-2 border-b-2 px-3 py-1 text-xs font-semibold transition-colors ${
            activeTab === "declarations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          {t("creator.declarations")}
        </button>
      </div>

      {activeTab === "facts" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{t("creator.facts")}</h3>
            <button
              type="button"
              onClick={addFact}
              className="text-xs text-secondary hover:text-primary"
            >
              + {t("creator.addFact")}
            </button>
          </div>

          <div className="space-y-3">
            {facts.map((clue) => (
              <FactCard
                key={clue.id}
                clue={clue}
                onUpdate={(patch) => updateClue(clue.id, patch)}
                onRemove={() => removeClue(clue.id)}
                translating={translating[clue.id] ?? {}}
                onTranslate={(lang) => void translateClue(clue.id, lang)}
                translateLabel={t("creator.translateToOthers")}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{t("creator.board")}</h3>
                <p className="text-xs text-muted-foreground">{t("creator.selectCharOnBoard")}</p>
              </div>

              <div
                className="relative grid gap-px rounded-2xl border-2 border-slate-300 bg-slate-200/80 p-1 shadow-sm overflow-visible mx-auto max-w-[480px]"
                style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
              >
                {Array.from({ length: gridRows }).map((_, row) =>
                  Array.from({ length: gridCols }).map((_, col) => {
                    const pos: Position = { row, col };
                    const key = posKey(row, col);
                    const room = getRoomForCell(rooms, pos);
                    const roomIdx = rooms.findIndex((r) => r.id === room?.id);
                    const cellEl = elementAt(pos);
                    const charsHere = getCharsAt(pos);
                    const isSelected =
                      infoCharId !== null &&
                      placements[infoCharId]?.row === row &&
                      placements[infoCharId]?.col === col;

                    const handleCellClick = () => {
                      const charHere = charsHere[0];
                      if (charHere) {
                        setInfoCharId(infoCharId === charHere.id ? null : charHere.id);
                      }
                    };

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={handleCellClick}
                        className={`relative flex aspect-square items-center justify-center text-xs font-medium transition-all overflow-visible ${
                          ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                        } ${isSelected ? "ring-2 ring-primary ring-offset-1 z-20" : ""}`}
                      >
                        {charsHere.length > 0 && (
                          <span className="z-10 flex flex-col items-center">
                            {charsHere.map((c) => (
                              <span
                                key={c.id}
                                className="text-center text-sm font-bold text-foreground"
                                title={c.name}
                              >
                                {c.image ? (
                                  <img
                                    src={c.image}
                                    alt={c.name}
                                    className="h-7 w-7 rounded-full object-top object-cover ring-2 ring-white shadow-xs"
                                  />
                                ) : (
                                  <span className="text-xl drop-shadow-xs">{c.name[0]}</span>
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
                              className="z-0 absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl select-none opacity-50"
                              title={localize(el.name, el.nameI18n, lang)}
                            >
                              {el.image ? (
                                <img
                                  src={el.image}
                                  alt={localize(el.name, el.nameI18n, lang)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                el.icon
                              )}
                            </span>
                          );
                        })()}
                      </button>
                    );
                  }),
                )}
              </div>

              {selectedElementInfo && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {t("creator.selectedChar")}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {characters.find((c) => c.id === infoCharId)?.name ?? ""}
                    </span>
                  </div>
                  {selectedElementInfo.room && (
                    <div className="flex items-center gap-2 p-1.5 rounded bg-secondary/5 text-foreground text-xs">
                      <span className="font-semibold text-muted-foreground">
                        {t("murdoku.room")}:
                      </span>
                      <span>
                        {localize(
                          selectedElementInfo.room.name,
                          selectedElementInfo.room.nameI18n,
                          lang,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1 text-xs">
                    {selectedElementInfo.centerEl && (
                      <div className="flex items-center gap-1 p-1.5 rounded bg-primary/5 text-primary">
                        <span className="font-semibold">{t("creator.elementOn")}:</span>
                        <span>
                          {localize(
                            selectedElementInfo.centerEl.name,
                            selectedElementInfo.centerEl.nameI18n,
                            lang,
                          )}
                        </span>
                      </div>
                    )}
                    {selectedElementInfo.neighbors.map(({ dir, el }) => {
                      const label =
                        dir === "north"
                          ? t("creator.north")
                          : dir === "south"
                            ? t("creator.south")
                            : t("creator.west");
                      return (
                        el && (
                          <div
                            key={`${dir}-${el.position.row}-${el.position.col}`}
                            className="flex items-center gap-1 p-1.5 rounded bg-secondary/5 text-foreground"
                          >
                            <span className="font-semibold text-muted-foreground">{label}:</span>
                            <span>{localize(el.name, el.nameI18n, lang)}</span>
                          </div>
                        )
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={addDeclarationFromSelection}
                    disabled={!infoCharId}
                    className="w-full rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
                  >
                    {t("creator.addDeclarationFromBoard")}
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("creator.declarations")}
                </h3>
                <button
                  type="button"
                  onClick={addElimination}
                  className="text-xs text-secondary hover:text-primary"
                >
                  + {t("creator.addDeclaration")}
                </button>
              </div>

              <div className="space-y-3 max-h-[780px] overflow-y-auto">
                {declarations.map((clue) => (
                  <EliminationCard
                    key={clue.id}
                    clue={clue}
                    characters={characters}
                    rooms={rooms}
                    allElementNames={allElementNames}
                    translating={translating[clue.id] ?? {}}
                    onUpdate={(patch) => updateClue(clue.id, patch)}
                    onRemove={() => removeClue(clue.id)}
                    onTranslate={(lang) => void translateClue(clue.id, lang)}
                    translateLabel={t("creator.translateToOthers")}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
      )}
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

function FactCard({
  clue,
  onUpdate,
  onRemove,
  translating,
  onTranslate,
  translateLabel,
}: {
  clue: Clue;
  onUpdate: (patch: Partial<Clue>) => void;
  onRemove: () => void;
  translating: Record<string, boolean>;
  onTranslate: (lang: string) => void;
  translateLabel: string;
}) {
  const { t } = useI18n();
  const [langTab, setLangTab] = useState<"es" | "eu" | "en">("es");
  const isTranslating = translating[langTab] ?? false;

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex gap-2 border-b border-border pb-1 mb-2">
        {["es", "eu", "en"].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLangTab(l as "es" | "eu" | "en")}
            className={`-mb-1 border-b-2 px-2 py-0.5 text-xs font-semibold transition-colors ${
              langTab === l
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <textarea
        value={clue.text[langTab] ?? ""}
        onChange={(e) =>
          onUpdate({
            text: { ...clue.text, [langTab]: e.target.value },
          })
        }
        placeholder={t("creator.clueText")}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onTranslate(langTab)}
          disabled={isTranslating || !clue.text[langTab]?.trim()}
          className="flex-3 rounded-lg border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
        >
          {isTranslating ? "Traducir…" : translateLabel}
        </button>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-destructive hover:text-destructive/80"
        >
          {t("creator.removeClue")}
        </button>
      </div>
    </div>
  );
}

function EliminationCard({
  clue,
  characters,
  rooms,
  allElementNames,
  translating,
  onUpdate,
  onRemove,
  onTranslate,
  translateLabel,
}: {
  clue: Clue;
  characters: Character[];
  rooms: Room[];
  allElementNames: string[];
  translating: Record<string, boolean>;
  onUpdate: (patch: Partial<Clue>) => void;
  onRemove: () => void;
  onTranslate: (lang: string) => void;
  translateLabel: string;
}) {
  const { t } = useI18n();
  const [langTab, setLangTab] = useState<"es" | "eu" | "en">("es");
  const isTranslating = translating[langTab] ?? false;

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <select
        value={clue.characterId ?? ""}
        onChange={(e) =>
          onUpdate({
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
          onUpdate({
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
          onUpdate({
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
      <div className="flex gap-2 border-b border-border pb-1 mb-2">
        {["es", "eu", "en"].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLangTab(l as "es" | "eu" | "en")}
            className={`-mb-1 border-b-2 px-2 py-0.5 text-xs font-semibold transition-colors ${
              langTab === l
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <textarea
        value={clue.text[langTab] ?? ""}
        onChange={(e) =>
          onUpdate({
            text: { ...clue.text, [langTab]: e.target.value },
          })
        }
        placeholder={t("creator.clueText")}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onTranslate(langTab)}
          disabled={isTranslating || !clue.text[langTab]?.trim()}
          className="flex-3 rounded-lg border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
        >
          {isTranslating ? "Traducir…" : translateLabel}
        </button>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-destructive hover:text-destructive/80"
        >
          {t("creator.removeClue")}
        </button>
      </div>
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
