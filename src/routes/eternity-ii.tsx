import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Tile } from "@/components/eternity2/Tile";
import { useI18n } from "@/lib/i18n";
import {
  createLevel,
  emptyBoard,
  conflictsAt,
  candidatesAt,
  isSolved,
  matchedSeams,
  rotate,
  LEVELS,
  type Level,
  type LevelSize,
  type Placement,
  type Rotation,
} from "@/lib/eternity2/game";


export const Route = createFileRoute("/eternity-ii")({
  head: () => ({
    meta: [
      { title: "Eternity II — Edge-matching puzzle | The Taber Games" },
      {
        name: "description",
        content:
          "Play Eternity II at The Taber Games: progressive edge-matching boards from 4x4 up to the original 256-piece puzzle.",
      },
      { property: "og:title", content: "Eternity II — Edge-matching puzzle" },
      {
        property: "og:description",
        content:
          "Progressive edge-matching boards from 4x4 up to the original 256-piece Eternity II puzzle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EternityPage,
});

const UNLOCK_KEY = "taber-e2-unlocked";

const EMPTY_LEVEL: Level = { size: 4, tiles: [], fixed: [], original: false };

function EternityPage() {
  const { t } = useI18n();
  const [size, setSize] = useState<LevelSize>(4);
  const [unlocked, setUnlocked] = useState(0);
  const [level, setLevel] = useState<Level>(EMPTY_LEVEL);
  const [board, setBoard] = useState<Placement[]>(() => emptyBoard(EMPTY_LEVEL));
  const [selected, setSelected] = useState<{ tileId: number; rotation: Rotation } | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    const saved = Number(localStorage.getItem(UNLOCK_KEY) ?? "0");
    if (!Number.isNaN(saved)) setUnlocked(Math.min(saved, LEVELS.length - 1));
  }, []);

  const startLevel = useCallback((s: LevelSize) => {
    const lv = createLevel(s);
    setLevel(lv);
    setBoard(emptyBoard(lv));
    setSelected(null);
    setFocus(null);
    setShowWin(false);
    setSize(s);
  }, []);

  useEffect(() => {
    startLevel(4);
  }, [startLevel]);

  const placedIds = useMemo(() => {
    const s = new Set<number>();
    for (const p of board) if (p) s.add(p.tileId);
    return s;
  }, [board]);

  const tray = useMemo(
    () => level.tiles.filter((tile) => !placedIds.has(tile.id)),
    [level, placedIds],
  );

  const candidates = useMemo(
    () => (focus == null ? null : candidatesAt(level, board, focus, tray)),
    [focus, level, board, tray],
  );

  const seams = useMemo(() => matchedSeams(level, board), [level, board]);

  const rotateSelection = useCallback(() => {
    setSelected((s) => (s ? { ...s, rotation: ((s.rotation + 1) % 4) as Rotation } : s));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") rotateSelection();
      if (e.key === "Escape") {
        setSelected(null);
        setFocus(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotateSelection]);

  const place = (index: number, tileId: number, rotation: Rotation) => {
    const next = board.slice();
    next[index] = { tileId, rotation, locked: false };
    setBoard(next);
    setSelected(null);
    setFocus(null);
    if (isSolved(level, next)) {
      setShowWin(true);
      const idx = LEVELS.indexOf(size);
      if (idx >= 0 && idx + 1 < LEVELS.length && idx + 1 > unlocked) {
        setUnlocked(idx + 1);
        localStorage.setItem(UNLOCK_KEY, String(idx + 1));
      }
    }
  };

  const handleCell = (index: number) => {
    const current = board[index];
    if (current?.locked) return;

    if (current) {
      // pick the tile back up
      setBoard((b) => b.map((p, i) => (i === index ? null : p)));
      setSelected({ tileId: current.tileId, rotation: current.rotation });
      setFocus(null);
      return;
    }
    if (selected) {
      place(index, selected.tileId, selected.rotation);
      return;
    }
    // empty cell without a selected tile: highlight the pieces that fit here
    setFocus((f) => (f === index ? null : index));
  };


  // board fits the screen: capped at 680px, otherwise the available width
  const [viewportW, setViewportW] = useState(680);
  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 32px page padding + 24px frame padding, plus 2px gap per column
  const available = Math.max(160, viewportW - 56 - 2 * (level.size - 1));
  const boardPx = Math.min(680, available);
  const tilePx = Math.max(14, Math.floor(boardPx / level.size));
  const trayPx = level.size >= 12 ? 42 : 60;

  return (
    <div className="e2-scope min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <header className="text-center">
          <h1 className="e2-title text-3xl sm:text-5xl">ETERNITY II</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm" style={{ color: "var(--e2-ink-soft)" }}>
            {t("e2.desc")}
          </p>
        </header>

        {/* Levels */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {LEVELS.map((s, i) => {
            const locked = i > unlocked;
            return (
              <button
                key={s}
                type="button"
                disabled={locked}
                onClick={() => startLevel(s)}
                className="e2-btn"
                data-variant={s === size ? undefined : "soft"}
              >
                {locked ? "🔒 " : ""}
                {s}×{s}
                {s === 16 ? " ★" : ""}
              </button>
            );
          })}
        </div>

        {level.original && (
          <p
            className="mx-auto mt-4 max-w-2xl rounded-xl px-4 py-3 text-center text-sm"
            style={{ background: "rgba(255,209,102,0.35)", color: "var(--e2-ink)" }}
          >
            {t("e2.originalNote")}
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Board */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-2xl p-3"
              style={{
                background: "linear-gradient(180deg, var(--e2-frame), var(--e2-frame-dark))",
                boxShadow: "0 8px 24px rgba(60,35,10,0.35)",
              }}
            >
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${level.size}, ${tilePx}px)`,
                }}
              >
                {board.map((p, i) => {
                  if (!p) {
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`cell ${i}`}
                        onClick={() => handleCell(i)}
                        className="e2-cell"
                        data-focus={focus === i ? "" : undefined}
                        style={{ width: tilePx, height: tilePx }}
                      />

                    );
                  }
                  return (
                    <Tile
                      key={i}
                      size={tilePx}
                      edges={rotate(level.tiles[p.tileId].edges, p.rotation)}
                      conflict={conflictsAt(level, board, i) > 0}
                      locked={p.locked}
                      onClick={() => handleCell(i)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button type="button" className="e2-btn" onClick={rotateSelection} disabled={!selected}>
                {t("e2.rotate")}
              </button>
              <button type="button" className="e2-btn" data-variant="soft" onClick={() => startLevel(size)}>
                {level.original ? t("e2.reset") : t("e2.new")}
              </button>
            </div>

            <p className="mt-3 text-sm" style={{ color: "var(--e2-ink-soft)" }}>
              {t("e2.score", { m: seams.matched, n: seams.total })} ·{" "}
              {t("e2.placed", { m: board.filter(Boolean).length, n: board.length })}
            </p>

            {candidates && (
              <p className="mt-2 text-sm font-semibold" style={{ color: "var(--e2-ink)" }}>
                {candidates.size > 0
                  ? t("e2.candidates", { n: candidates.size })
                  : t("e2.noCandidates")}
              </p>
            )}
          </div>


          {/* Tray */}
          <section
            className="rounded-2xl p-4"
            style={{ background: "var(--e2-panel)", boxShadow: "0 6px 18px rgba(60,35,10,0.18)" }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="e2-title text-lg">{t("e2.pieces")}</h2>
              <span className="text-xs" style={{ color: "var(--e2-ink-soft)" }}>
                {t("e2.help")}
              </span>
            </div>
            <div
              className="flex max-h-[520px] flex-wrap gap-2 overflow-y-auto pr-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {tray.map((tile) => (
                <Tile
                  key={tile.id}
                  size={trayPx}
                  edges={
                    selected?.tileId === tile.id
                      ? rotate(tile.edges, selected.rotation)
                      : tile.edges
                  }
                  selected={selected?.tileId === tile.id}
                  onClick={() =>
                    setSelected((s) =>
                      s?.tileId === tile.id
                        ? { tileId: tile.id, rotation: ((s.rotation + 1) % 4) as Rotation }
                        : { tileId: tile.id, rotation: 0 },
                    )
                  }
                />
              ))}
              {tray.length === 0 && (
                <p className="text-sm" style={{ color: "var(--e2-ink-soft)" }}>
                  {t("e2.trayEmpty")}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      {showWin && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div
            className="max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "var(--e2-panel)", color: "var(--e2-ink)" }}
          >
            <h2 className="e2-title text-2xl">{t("e2.solved")}</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--e2-ink-soft)" }}>
              {t("e2.solvedDesc")}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {LEVELS[LEVELS.indexOf(size) + 1] && (
                <button
                  type="button"
                  className="e2-btn"
                  onClick={() => startLevel(LEVELS[LEVELS.indexOf(size) + 1])}
                >
                  {t("e2.next")}
                </button>
              )}
              <button
                type="button"
                className="e2-btn"
                data-variant="soft"
                onClick={() => setShowWin(false)}
              >
                {t("e2.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
