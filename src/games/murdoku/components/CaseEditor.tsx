import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { submitCase } from "@/games/murdoku/logic/cases";
import {
  validateSolution,
  isCaseSolvable,
  createDefaultRooms,
  getRoomForCell,
  posKey,
} from "@/games/murdoku/logic/game";
import type {
  CaseContent,
  Character,
  Clue,
  ClueType,
  Position,
  Room,
} from "@/games/murdoku/data/gameSchema";
import { useI18n as useI18nInner } from "@/platform/i18n";

const EMOJI_PICKER = [
  "👤",
  "👩",
  "👨",
  "👵",
  "👴",
  "🕵",
  "👮",
  "🕵",
  "👩‍⚖",
  "👨‍⚖",
  "👩‍🎓",
  "👨‍🎓",
  "🔪",
  "🔫",
  "🔨",
  "🎣",
  "🔧",
  "🪡",
  "🔔",
  "📚",
  "🍳",
  "🎱",
  "🌿",
  "🏠",
  "🏰",
  "🏨",
  "🚗",
  "🎭",
  "🎤",
  "🎨",
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function genCharId(name: string, idx: number): string {
  const base = slugify(name) || "char";
  return `${base}-${idx}`;
}

export function CaseEditor() {
  const { t, slug } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [gridRows, setGridRows] = useState(6);
  const [gridCols, setGridCols] = useState(6);
  const [roomRows, setRoomRows] = useState(3);
  const [roomCols, setRoomCols] = useState(2);
  const [characters, setCharacters] = useState<Character[]>([
    { id: "char-0", name: "Butler", emoji: "👨" },
    { id: "char-1", name: "Maid", emoji: "👩" },
    { id: "char-2", name: "Gardener", emoji: "🌿" },
    { id: "char-3", name: "Chef", emoji: "👨" },
    { id: "char-4", name: "Librarian", emoji: "👩" },
    { id: "col-5", name: "Colonel", emoji: "👨" },
  ]);
  const [placements, setPlacements] = useState<Record<string, Position>>({});
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [killerId, setKillerId] = useState("");
  const [victimId, setVictimId] = useState("");
  const [clues, setClues] = useState<Clue[]>([
    { id: "clue-0", text: "", type: "fact" },
    { id: "clue-1", text: "", type: "elimination" },
  ]);

  const rooms: Room[] = useMemo(
    () => createDefaultRooms(gridRows, gridCols, roomRows, roomCols),
    [gridRows, gridCols, roomRows, roomCols],
  );

  const step1Valid = useMemo(() => {
    if (!title.trim()) return false;
    if (characters.length < 3) return false;
    for (const c of characters) {
      if (!c.name.trim()) return false;
    }
    if (gridRows < 1 || gridCols < 1 || roomRows < 1 || roomCols < 1) return false;
    return true;
  }, [title, characters, gridRows, gridCols, roomRows, roomCols]);

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
        void navigate({ to: "/$lang/murdoku", params: { lang: slug } });
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("creator.invalidCase"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">{t("creator.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("creator.needsAuth")}</p>
        <Link
          to="/$lang/auth"
          params={{ lang: slug }}
          className="rounded-lg border border-neon-pink bg-neon-pink/15 px-6 py-3 text-sm font-semibold text-neon-pink hover:bg-neon-pink/25"
        >
          {t("creator.signIn")}
        </Link>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-8">
          <h2 className="text-xl font-bold text-neon-cyan">{t("creator.savedDraft")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("murdoku.createDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold tracking-widest text-neon-pink">{t("creator.title")}</h1>
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
                  ? "border-neon-pink bg-neon-pink/15 text-neon-pink"
                  : i < step
                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
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
            gridRows={gridRows}
            setGridRows={setGridRows}
            gridCols={gridCols}
            setGridCols={setGridCols}
            roomRows={roomRows}
            setRoomRows={setRoomRows}
            roomCols={roomCols}
            setRoomCols={setRoomCols}
            characters={characters}
            setCharacters={setCharacters}
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
          />
        )}

        {step === 2 && <Step3 clues={clues} setClues={setClues} />}

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
              className="flex-1 rounded-lg border border-neon-cyan bg-neon-cyan/15 px-4 py-2 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/25 disabled:opacity-50"
            >
              {t("creator.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !step2Valid}
              className="flex-1 rounded-lg border border-neon-pink bg-neon-pink/15 px-4 py-2 text-sm font-semibold text-neon-pink transition-colors hover:bg-neon-pink/25 disabled:opacity-50"
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
  gridRows,
  setGridRows,
  gridCols,
  setGridCols,
  roomRows,
  setRoomRows,
  roomCols,
  setRoomCols,
  characters,
  setCharacters,
}: {
  title: string;
  setTitle: (v: string) => void;
  gridRows: number;
  setGridRows: (v: number) => void;
  gridCols: number;
  setGridCols: (v: number) => void;
  roomRows: number;
  setRoomRows: (v: number) => void;
  roomCols: number;
  setRoomCols: (v: number) => void;
  characters: Character[];
  setCharacters: (v: Character[]) => void;
}) {
  const { t } = useI18n();

  const addCharacter = () => {
    const idx = characters.length;
    setCharacters([...characters, { id: `char-${idx}`, name: "", emoji: "👤" }]);
  };

  const removeCharacter = (id: string) => {
    if (characters.length <= 3) return;
    setCharacters(characters.filter((c) => c.id !== id));
  };

  const updateName = (id: string, name: string) => {
    setCharacters(
      characters.map((c) =>
        c.id === id
          ? {
              ...c,
              id: genCharId(
                name,
                characters.findIndex((x) => x.id === id),
              ),
              name,
            }
          : c,
      ),
    );
  };

  const updateEmoji = (id: string, emoji: string) => {
    setCharacters(characters.map((c) => (c.id === id ? { ...c, emoji } : c)));
  };

  return (
    <div className="space-y-6">
      <TextFieldSimple
        label={t("creator.name")}
        placeholder="Case title"
        value={title}
        onChange={setTitle}
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          label={t("creator.gridRows")}
          value={gridRows}
          onChange={setGridRows}
          min={1}
        />
        <NumberField
          label={t("creator.gridCols")}
          value={gridCols}
          onChange={setGridCols}
          min={1}
        />
        <NumberField
          label={t("creator.roomRows")}
          value={roomRows}
          onChange={setRoomRows}
          min={1}
        />
        <NumberField
          label={t("creator.roomCols")}
          value={roomCols}
          onChange={setRoomCols}
          min={1}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{t("creator.characters")}</h3>
          <button
            type="button"
            onClick={addCharacter}
            className="text-xs text-neon-cyan hover:text-neon-pink"
          >
            + {t("creator.addCharacter")}
          </button>
        </div>

        <div className="space-y-2">
          {characters.map((char, idx) => (
            <div key={char.id} className="flex items-end gap-2">
              <select
                value={char.emoji ?? ""}
                onChange={(e) => updateEmoji(char.id, e.target.value)}
                className="w-12 rounded-lg border border-border bg-background p-1 text-center text-lg"
              >
                {EMOJI_PICKER.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={char.name}
                onChange={(e) => updateName(char.id, e.target.value)}
                placeholder={char.name || `Character ${idx + 1}`}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
              />
              {characters.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeCharacter(char.id)}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
                >
                  ✕
                </button>
              )}
            </div>
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
}) {
  const { t } = useI18n();

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
                    ? "border-neon-pink bg-neon-pink/15 text-neon-pink"
                    : placed
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-border bg-card text-foreground hover:border-neon-pink/60"
                }`}
              >
                <span>{char.emoji ?? char.name[0]}</span>
                <span>{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[320px]">
        <div
          className="grid gap-0.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-0.5"
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
              const isClicked =
                selectedCharId !== null &&
                placements[selectedCharId]?.row === row &&
                placements[selectedCharId]?.col === col;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCellClick(pos)}
                  className={`relative flex aspect-square items-center justify-center text-xs transition-all ${
                    ROOM_COLORS[roomIdx % ROOM_COLORS.length]
                  } ${isClicked ? "ring-2 ring-neon-pink" : ""}`}
                >
                  {room && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] opacity-40">
                      {room.emoji ?? room.name[0]}
                    </span>
                  )}
                  {charsHere.length > 0 && (
                    <span className="z-10 text-center text-lg font-bold text-neon-pink">
                      {charsHere.map((c) => c.emoji ?? c.name[0]).join(" ")}
                    </span>
                  )}
                  <span className="absolute bottom-0.5 right-0.5 text-[7px] text-muted-foreground/50">
                    {row},{col}
                  </span>
                </button>
              );
            }),
          )}
        </div>
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

function Step3({ clues, setClues }: { clues: Clue[]; setClues: (v: Clue[]) => void }) {
  const { t } = useI18n();
  const clueTypes: ClueType[] = ["fact", "elimination"];

  const addClue = () => {
    setClues([...clues, { id: `clue-${clues.length}`, text: "", type: "fact" }]);
  };

  const removeClue = (id: string) => {
    if (clues.length <= 1) return;
    setClues(clues.filter((c) => c.id !== id));
  };

  const updateClue = (id: string, patch: Partial<Clue>) => {
    setClues(clues.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("creator.clues")}</h3>
        <button
          type="button"
          onClick={addClue}
          className="text-xs text-neon-cyan hover:text-neon-pink"
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
            <textarea
              value={clue.text}
              onChange={(e) => updateClue(clue.id, { text: e.target.value })}
              placeholder={`${t("creator.clueText")} ${idx + 1}`}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
            />
            <div className="flex justify-end">
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
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
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
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.emoji ?? ""} {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
