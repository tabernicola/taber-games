import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Eye, EyeOff, HelpCircle, Lightbulb, RefreshCw, RotateCw, Save } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  GameNav,
  GameNavBackLink,
  GameNavButton,
  GameNavLink,
  GameNavTimer,
} from "@/components/GameNav";
import { Tile } from "@/components/eternity2/Tile";
import { EternityLogo } from "@/components/eternity2/EternityLogo";
import { Tutorial, type HighlightTarget } from "@/components/eternity2/Tutorial";
import { ScoreForm } from "@/components/ScoreForm";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { useAuth } from "@/hooks/useAuth";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { loadSave, storeSave } from "@/lib/eternity2/saves";
import { isTutorialCompleted, markTutorialCompleted } from "@/lib/eternity2/progress";
import { ETERNITY2_CLUE } from "@/lib/eternity2/pieces-original";
import {
  createLevel,
  emptyBoard,
  conflictsAt,
  candidatesAt,
  isSolved,
  matchedSeams,
  rotate,
  getCornerHints,
  bruteForceSolver,
  type Level,
  type LevelSize,
  type Placement,
  type Rotation,
} from "@/lib/eternity2/game";

export const Route = createFileRoute("/$lang/eternity-ii/play")({
  validateSearch: (search: Record<string, unknown>) => ({
    level: (Number(search["level"]) || 4) as LevelSize,
    resume: search["resume"] === true || search["resume"] === "true",
  }),
  head: () => ({
    meta: pageMeta({
      title: "Play Taber's Eternity — The Taber Games",
      ogTitle: "Play Taber's Eternity",
      description:
        "Play Taber's Eternity: edge-matching boards from 4x4 up to the original 256-piece puzzle, against the clock.",
    }),
  }),
  component: EternityPage,
});

const EMPTY_LEVEL: Level = { size: 4, tiles: [], fixed: [], original: false };

function EternityPage() {
  const { t } = useI18n();
  const { level: size, resume } = Route.useSearch();
  const { user } = useAuth();
  const { playSound } = useSoundEffects();

  const [level, setLevel] = useState<Level>(EMPTY_LEVEL);
  const [board, setBoard] = useState<Placement[]>(() => emptyBoard(EMPTY_LEVEL));
  const [selected, setSelected] = useState<{ tileId: number; rotation: Rotation } | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [showSolution, setShowSolution] = useState(false);
  const [prevBoard, setPrevBoard] = useState<Placement[] | null>(null);
  const [helped, setHelped] = useState(false);
  const [priorityTileIds, setPriorityTileIds] = useState<number[]>([]);
  const { seconds, setSeconds } = useTimer(ready && !showWin);
  const [hintedCorners, setHintedCorners] = useState<number[]>([]);
  const [isBruteForcing, setIsBruteForcing] = useState(false);
  const [bruteForceProgress, setBruteForceProgress] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HighlightTarget>(null);

  useEffect(() => {
    if (!isTutorialCompleted() && !resume) {
      setShowTutorial(true);
    }
  }, [resume]);

  const handleTutorialComplete = useCallback(() => {
    markTutorialCompleted();
    setShowTutorial(false);
  }, []);

  const handleTutorialSkip = useCallback(() => {
    markTutorialCompleted();
    setShowTutorial(false);
  }, []);

  const handleShowTutorial = useCallback(() => {
    setHasRotated(false);
    setShowTutorial(true);
  }, []);

  const handleHighlightElement = useCallback((element: HighlightTarget) => {
    setHighlightedElement(element);
  }, []);

  const startLevel = useCallback(
    (s: LevelSize) => {
      const lv = createLevel(s);
      setLevel(lv);
      setBoard(emptyBoard(lv));
      setSelected(null);
      setFocus(null);
      setShowWin(false);
      setShowSolution(false);
      setPrevBoard(null);
      setHelped(false);
      setPriorityTileIds([]);
      setHintedCorners([]);
      setSeconds(0);
      setReady(true);
    },
    [setSeconds],
  );

  // Either resume the stored game or start a fresh board for the chosen size.
  useEffect(() => {
    let cancelled = false;
    if (resume && user) {
      loadSave()
        .then((save) => {
          if (cancelled) return;
          if (!save) return startLevel(size);
          const lv: Level = {
            size: save.level,
            tiles: save.tiles.map((edges, i) => ({ id: i, edges })),
            fixed:
              save.level === 16
                ? [
                    {
                      index: ETERNITY2_CLUE.row * 16 + ETERNITY2_CLUE.col,
                      tileId: ETERNITY2_CLUE.pieceIndex,
                      rotation: ETERNITY2_CLUE.rotation as Rotation,
                    },
                  ]
                : [],
            original: save.level === 16,
            solution: save.solution,
          };
          setLevel(lv);
          setBoard(save.board);
          setHelped(save.helped ?? false);
          setHintedCorners(save.hintedCorners ?? []);
          setSeconds(save.seconds);
          setReady(true);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("Failed to load saved game:", error);
          startLevel(size);
        });
    } else {
      startLevel(size);
    }
    return () => {
      cancelled = true;
    };
  }, [resume, user, size, startLevel, setSeconds]);

  const placedIds = useMemo(() => {
    const s = new Set<number>();
    for (const p of board) if (p) s.add(p.tileId);
    return s;
  }, [board]);

  const tray = useMemo(
    () => {
      const unplaced = level.tiles.filter((tile) => !placedIds.has(tile.id));
      const prioritySet = new Set(priorityTileIds);
      const priorityTiles = unplaced.filter((tile) => prioritySet.has(tile.id));
      const otherTiles = unplaced.filter((tile) => !prioritySet.has(tile.id));
      return [...priorityTiles, ...otherTiles];
    },
    [level, placedIds, priorityTileIds],
  );

  const candidates = useMemo(
    () => (focus == null ? null : candidatesAt(level, board, focus, tray)),
    [focus, level, board, tray],
  );

  const seams = useMemo(() => matchedSeams(level, board), [level, board]);

  const rotateSelection = useCallback(() => {
    setSelected((s) => (s ? { ...s, rotation: ((s.rotation + 1) % 4) as Rotation } : s));
    setHasRotated(true);
    playSound("rotate");
  }, [playSound]);

  useKeyboardShortcuts({
    r: rotateSelection,
    Escape: () => {
      setSelected(null);
      setFocus(null);
    },
  });

  const place = (index: number, tileId: number, rotation: Rotation) => {
    playSound("place");
    const next = board.slice();
    next[index] = { tileId, rotation, locked: false };
    setBoard(next);
    setSelected(null);
    setFocus(null);
    setPriorityTileIds([]);
    if (isSolved(level, next)) {
      playSound("win");
      setShowWin(true);
    }
  };

  const handleCell = (index: number) => {
    const current = board[index];
    if (current?.locked) return;
    if (current) {
      playSound("click");
      setBoard((b) => b.map((p, i) => (i === index ? null : p)));
      setSelected(null);
      setPriorityTileIds([current.tileId]);
      setFocus(null);
      return;
    }
    if (selected) {
      place(index, selected.tileId, selected.rotation);
      return;
    }
    playSound("click");
    const newFocus = focus === index ? null : index;
    setFocus(newFocus);
    if (newFocus !== null) {
      const candidateIds = candidatesAt(level, board, newFocus, tray);
      setPriorityTileIds(Array.from(candidateIds.keys()));
    } else {
      setPriorityTileIds([]);
    }
  };

  const toggleSolution = () => {
    if (!level.solution) return;
    if (showSolution) {
      setBoard(prevBoard ?? emptyBoard(level));
      setShowSolution(false);
      return;
    }
    setPrevBoard(board);
    setBoard(level.solution.map((p) => ({ ...p, locked: true })));
    setSelected(null);
    setFocus(null);
    setShowSolution(true);
    setHelped(true);
  };

  const requestCornerHint = () => {
    if (level.size === 16 || !level.solution) return;
    
    const availableCorners = getCornerHints(level);
    if (availableCorners.length === 0) return;
    
    const corner = availableCorners[0];
    const penaltySeconds = level.size * 60; // 1 minute per level size
    
    setBoard((prev) => {
      const next = prev.slice();
      next[corner.index] = { tileId: corner.tileId, rotation: corner.rotation, locked: true };
      return next;
    });
    
    setHintedCorners((prev) => [...prev, corner.index]);
    setLevel((prev) => ({ ...prev, hintedCorners: [...(prev.hintedCorners || []), corner.index] }));
    setSeconds((prev) => prev + penaltySeconds);
    setHelped(true);
    playSound("place");
  };

  const runBruteForce = async () => {
    if (isBruteForcing) return;
    
    setIsBruteForcing(true);
    setHelped(true);
    
    const generator = bruteForceSolver(level, board);
    let placedCount = 0;
    const totalCells = level.size * level.size - level.fixed.length;
    
    try {
      for (const result of generator) {
        if (result.placed) {
          setBoard(result.board);
          placedCount++;
          setBruteForceProgress(placedCount);
          playSound("place");
          
          // Small delay to visualize the process
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check if solved
          if (isSolved(level, result.board)) {
            playSound("win");
            setShowWin(true);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Brute force error:", error);
    } finally {
      setIsBruteForcing(false);
      setBruteForceProgress(0);
    }
  };

  const save = async () => {
    if (!user) return;
    setSaveState("saving");
    try {
      // While the solution is revealed, persist the player's own board so the
      // resumed game is playable rather than a locked solution grid.
      const playerBoard = showSolution ? (prevBoard ?? emptyBoard(level)) : board;
      await storeSave(
        user.id,
        level.size,
        seconds,
        playerBoard,
        level.tiles.map((tl) => tl.edges),
        level.solution,
        helped,
        hintedCorners,
      );
      setSaveState("done");
      window.setTimeout(() => setSaveState("idle"), 2500);
    } catch (error) {
      console.error("Failed to save game:", error);
      setSaveState("error");
      window.setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const [wrapW, setWrapW] = useState(680);
  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el) return;
    const update = () => setWrapW(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // wrapper width minus the board frame padding (12px each side) and the 2px seams
  const available = Math.max(120, wrapW - 24 - 2 * (level.size - 1));
  const boardPx = Math.min(680, available);
  const tilePx = Math.max(10, Math.floor(boardPx / level.size));
  const trayPx = level.size >= 12 ? 42 : 60;

  return (
    <div className="e2-scope min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-36 pt-8">
        <header className="text-center">
          <EternityLogo />
          <p
            className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm"
            style={{ color: "var(--e2-ink-soft)" }}
          >
            <span>
              {t("e2.level")}: {level.size}×{level.size}
            </span>
          </p>
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={handleShowTutorial}
              className="inline-flex items-center gap-1.5 text-xs transition-colors hover:underline cursor-pointer rounded-full px-3 py-1"
              style={{
                color: "var(--e2-ink)",
                background: "rgba(255, 138, 61, 0.15)",
                border: "1px solid rgba(255, 138, 61, 0.3)",
              }}
            >
              <HelpCircle className="h-3.5 w-3.5 text-[var(--e2-accent)]" />
              <span>{t("tutorial.showAgain")}</span>
            </button>
          </div>
        </header>

        {showTutorial && (
          <Tutorial
            board={board}
            selected={selected}
            focus={focus}
            hasRotated={hasRotated}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
            onResetTutorial={() => setHasRotated(false)}
            onHighlightElement={handleHighlightElement}
          />
        )}

        {level.original && (
          <p
            className="mx-auto mt-4 max-w-2xl rounded-xl px-4 py-3 text-center text-sm"
            style={{ background: "rgba(255,209,102,0.35)", color: "var(--e2-ink)" }}
          >
            {t("e2.originalNote")}
          </p>
        )}

        <div ref={boardWrapRef} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[auto_1fr]">
          <div className="flex w-full min-w-0 flex-col items-center">
            <div
              className="max-w-full rounded-2xl p-3"
              style={{
                background: "linear-gradient(180deg, var(--e2-frame), var(--e2-frame-dark))",
                boxShadow: "0 8px 24px rgba(60,35,10,0.35)",
              }}
            >
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${level.size}, ${tilePx}px)` }}
              >
                {board.map((p, i) => {
                  if (!p) {
                    const isCellHighlighted =
                      highlightedElement === "empty-cell" || highlightedElement === "board";
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`cell ${i}`}
                        onClick={() => handleCell(i)}
                        className={`e2-cell transition-all ${
                          isCellHighlighted ? "ring-2 ring-[var(--e2-accent)] animate-pulse" : ""
                        }`}
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

          <section
            className="rounded-2xl p-4 transition-all"
            style={{
              background: "var(--e2-panel)",
              boxShadow:
                highlightedElement === "tray"
                  ? "0 0 0 3px var(--e2-accent), 0 8px 24px rgba(60,35,10,0.25)"
                  : "0 6px 18px rgba(60,35,10,0.18)",
            }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="e2-title text-lg">{t("e2.pieces")}</h2>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs sm:inline" style={{ color: "var(--e2-ink-soft)" }}>
                  {t("e2.help")}
                </span>
                <button
                  type="button"
                  className={`e2-btn inline-flex items-center gap-1.5 ${
                    highlightedElement === "rotate" ? "ring-4 ring-[var(--e2-accent)] animate-pulse" : ""
                  }`}
                  onClick={rotateSelection}
                  disabled={!selected}
                  aria-label={t("e2.rotate")}
                >
                  <RotateCw className="h-4 w-4" />
                  {t("e2.rotate")}
                </button>
              </div>
            </div>
            <div
              className="flex max-h-[520px] flex-wrap gap-2 overflow-y-auto pr-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {tray.map((tile) => {
                const fitRot = candidates?.get(tile.id);
                const rot =
                  selected?.tileId === tile.id ? selected.rotation : (fitRot ?? (0 as Rotation));
                return (
                  <Tile
                    key={tile.id}
                    size={trayPx}
                    edges={rotate(tile.edges, rot)}
                    selected={selected?.tileId === tile.id}
                    candidate={fitRot !== undefined}
                    dim={candidates ? fitRot === undefined : false}
                    onClick={() => {
                      if (focus != null && fitRot !== undefined) {
                        place(focus, tile.id, fitRot);
                        return;
                      }
                      setSelected((s) => {
                        if (s?.tileId === tile.id) {
                          setHasRotated(true);
                          return { tileId: tile.id, rotation: ((s.rotation + 1) % 4) as Rotation };
                        }
                        return { tileId: tile.id, rotation: 0 };
                      });
                    }}
                  />
                );
              })}

              {tray.length === 0 && (
                <p className="text-sm" style={{ color: "var(--e2-ink-soft)" }}>
                  {t("e2.trayEmpty")}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <GameNav>
        <GameNavBackLink to="/$lang/eternity-ii" />
        <GameNavTimer seconds={seconds} />
        <GameNavButton
          onClick={() => startLevel(level.size as LevelSize)}
          colorClass="text-neon-pink"
          icon={<RefreshCw className="h-5 w-5" />}
          label={level.original ? t("e2.reset") : t("e2.new")}
        />
        {user ? (
          <GameNavButton
            onClick={save}
            colorClass="text-neon-cyan"
            icon={<Save className="h-5 w-5" />}
            label={
              saveState === "saving"
                ? t("e2.saving")
                : saveState === "done"
                  ? t("e2.savedOk")
                  : saveState === "error"
                    ? t("e2.saveError")
                    : t("e2.save")
            }
          />
        ) : (
          <GameNavLink
            to="/$lang/auth"
            colorClass="text-neon-cyan"
            icon={<Save className="h-5 w-5" />}
            label={t("e2.save")}
          />
        )}
        {!level.original && (
          <>
            <GameNavButton
              onClick={requestCornerHint}
              disabled={level.size === 16 || getCornerHints(level).length === 0}
              colorClass="text-neon-yellow"
              icon={<Lightbulb className="h-5 w-5" />}
              label={t("e2.hint")}
            />
            <GameNavButton
              onClick={runBruteForce}
              disabled={isBruteForcing}
              colorClass="text-neon-purple"
              icon={<Cpu className="h-5 w-5" />}
              label={isBruteForcing ? `${t("e2.bruteForce")} (${bruteForceProgress})` : t("e2.bruteForce")}
            />
            <GameNavButton
              onClick={toggleSolution}
              disabled={!level.solution}
              colorClass="text-neon-yellow"
              icon={showSolution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              label={showSolution ? t("e2.hideSolution") : t("e2.solution")}
            />
          </>
        )}
      </GameNav>

      {showWin && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: "var(--e2-panel)", color: "var(--e2-ink)" }}
          >
            <h2 className="e2-title text-2xl">{t("e2.solved")}</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--e2-ink-soft)" }}>
              {t("e2.solvedDesc")}
            </p>
            {helped ? (
              <p className="mt-4 text-sm" style={{ color: "var(--e2-ink-soft)" }}>
                {t("e2.solutionNote")}
              </p>
            ) : (
              <ScoreForm game="eternity-ii" level={level.size} seconds={seconds} />
            )}
            <div className="mt-5 flex justify-center gap-2">
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
