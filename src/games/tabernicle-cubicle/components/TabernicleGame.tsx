import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { Direction, GameState } from "../logic/types";
import {
  applyTimeBonusTick,
  initLevel,
  stepGame,
  TIME_BONUS_SECONDS_PER_TICK,
  TIME_BONUS_TICK_INTERVAL_SECONDS,
  type InputState,
} from "../logic/engine";
import { loadTaberImages, renderGame, type LoadedImages } from "../logic/renderer";
import {
  initMusic,
  pauseMusic,
  resumeMusic,
  setMusicUrgency,
  startMusic,
  stopMusic,
  playTimeBonusTick,
  tryPlayMusicOnInteraction,
} from "../logic/audio";
import { GameActions, GameStatusBar } from "./GameHud";
import { TouchControls } from "./TouchControls";
import { HowToPlayModal } from "./HowToPlayModal";
import { VictoryModal } from "./VictoryModal";
import { LEVELS } from "../logic/levels";
import { useTabernicleLevels } from "../logic/levelStore";
import type { LangSlug } from "@/platform/i18n";

const LOCAL_STORAGE_KEY = "tabernicle_max_level";
const LEVEL_INTRO_DURATION_SECONDS = 1.3;
const DAMAGE_DARKNESS_DURATION_SECONDS = 0.9;
const DAMAGE_DARKNESS_MAX_OPACITY = 0.38;

interface VictoryTransition {
  elapsedSeconds: number;
  tickAccumulator: number;
  tallyDurationSeconds: number;
  durationSeconds: number;
}

interface TabernicleGameProps {
  lang: LangSlug;
  initialLevel?: number;
}

export function TabernicleGame({ lang, initialLevel = 0 }: TabernicleGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data: loadedLevels } = useTabernicleLevels();
  const activeLevels = loadedLevels?.levels ?? LEVELS;
  const activeLevelsRef = useRef(activeLevels);
  activeLevelsRef.current = activeLevels;

  // Game state
  const [gameState, setGameState] = useState<GameState>(() =>
    initLevel(initialLevel, 3, 0, activeLevels),
  );
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;
  const levelIntroElapsedRef = useRef(0);
  const levelMusicStartedRef = useRef(false);
  const damageDarknessRemainingRef = useRef(0);
  const victoryTransitionRef = useRef<VictoryTransition | null>(null);

  // Modals
  const [helpOpen, setHelpOpen] = useState(false);

  // Input ref
  const inputRef = useRef<InputState>({
    direction: null,
    firePressed: false,
    clubPressed: false,
    directionChanged: false,
  });

  // Track previous direction to detect first press
  const prevDirectionRef = useRef<Direction | null>(null);

  // Loaded images ref
  const imagesRef = useRef<LoadedImages>({
    spritesheet: null,
    strikeSpritesheet: null,
    enemySpritesheet: null,
    petrifiedCracks5: null,
    petrifiedCracks10: null,
    petrifiedCracks15: null,
    petrifiedCracks20: null,
    petrifiedSmoke: null,
  });

  // Update max level in localStorage
  const recordLevelProgress = (lvlIndex: number) => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const currentMax = stored ? parseInt(stored, 10) : 0;
      if (lvlIndex + 1 > currentMax) {
        localStorage.setItem(LOCAL_STORAGE_KEY, (lvlIndex + 1).toString());
      }
    } catch {
      // localStorage may fail in private mode
    }
  };

  const beginLevelIntro = useCallback((darkenScreen = false) => {
    levelIntroElapsedRef.current = 0;
    levelMusicStartedRef.current = false;
    damageDarknessRemainingRef.current = darkenScreen ? DAMAGE_DARKNESS_DURATION_SECONDS : 0;
    stopMusic();
  }, []);

  const handleResetLevel = useCallback(() => {
    const cur = gameStateRef.current;
    const fresh = initLevel(cur.levelIndex, 3, cur.score, activeLevelsRef.current);
    gameStateRef.current = fresh;
    setGameState(fresh);
    beginLevelIntro();
  }, [beginLevelIntro]);

  const togglePause = useCallback(() => {
    const currentState = gameStateRef.current;
    if (currentState.status !== "playing" && currentState.status !== "paused") return;

    inputRef.current = {
      direction: null,
      firePressed: false,
      clubPressed: false,
      directionChanged: false,
    };
    prevDirectionRef.current = null;
    const nextStatus: GameState["status"] =
      currentState.status === "playing" ? "paused" : "playing";
    const nextState: GameState = { ...currentState, status: nextStatus };
    gameStateRef.current = nextState;
    setGameState(nextState);
    if (nextStatus === "paused") {
      pauseMusic();
    } else {
      resumeMusic();
    }
  }, []);

  // Preload Taber sprites once
  useEffect(() => {
    imagesRef.current = loadTaberImages();
  }, []);

  // Stop music when the game is left, hidden, or unloaded.
  useEffect(() => {
    initMusic();

    const stopWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        levelMusicStartedRef.current = false;
        stopMusic();
      }
    };
    const stopOnPageHide = () => {
      levelMusicStartedRef.current = false;
      stopMusic();
    };

    document.addEventListener("visibilitychange", stopWhenHidden);
    window.addEventListener("pagehide", stopOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", stopWhenHidden);
      window.removeEventListener("pagehide", stopOnPageHide);
      levelMusicStartedRef.current = false;
      stopMusic();
    };
  }, []);

  // Reload current stage when database level overrides finish loading
  const loadedOverrideKey = (loadedLevels?.overriddenIds ?? []).join(",");
  const lastAppliedKeyRef = useRef(loadedOverrideKey);
  useEffect(() => {
    if (loadedOverrideKey !== lastAppliedKeyRef.current) {
      lastAppliedKeyRef.current = loadedOverrideKey;
      const cur = gameStateRef.current;
      const fresh = initLevel(cur.levelIndex, cur.player.lives, cur.score, activeLevelsRef.current);
      gameStateRef.current = fresh;
      setGameState(fresh);
    }
  }, [loadedOverrideKey]);

  const isUrgencyMusic =
    gameState.status === "playing" &&
    gameState.levelTimeLimitSeconds - gameState.levelTimeSeconds <= 30;

  useEffect(() => {
    setMusicUrgency(isUrgencyMusic);
    return () => setMusicUrgency(false);
  }, [isUrgencyMusic]);

  // Keyboard controls
  useEffect(() => {
    const activeKeys = new Set<string>();

    const getDirectionFromKeys = (): Direction | null => {
      if (activeKeys.has("ArrowUp") || activeKeys.has("KeyW")) return "up";
      if (activeKeys.has("ArrowDown") || activeKeys.has("KeyS")) return "down";
      if (activeKeys.has("ArrowLeft") || activeKeys.has("KeyA")) return "left";
      if (activeKeys.has("ArrowRight") || activeKeys.has("KeyD")) return "right";
      return null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = gameStateRef.current;
      if (e.code === "KeyP" && !e.repeat) {
        activeKeys.clear();
        togglePause();
        e.preventDefault();
        return;
      }

      if (currentState.status === "level_won" || currentState.status === "paused") return;

      if (
        e.repeat &&
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        return;
      }

      // Try to start music on first interaction if autoplay was blocked
      if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
        tryPlayMusicOnInteraction();
      }

      // Avoid scrolling on arrow/space
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code) &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
      }

      activeKeys.add(e.code);

      // Fire trigger
      if (e.code === "Space" || e.code === "KeyJ" || e.code === "KeyZ") {
        inputRef.current.firePressed = true;
      }

      // Club / Garrote trigger
      if (
        e.code === "KeyK" ||
        e.code === "KeyX" ||
        e.code === "KeyC" ||
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
      ) {
        inputRef.current.clubPressed = true;
      }

      // Quick reset on R
      if (e.code === "KeyR") {
        handleResetLevel();
      }
      inputRef.current.direction = getDirectionFromKeys();
      console.log("After KeyDown - direction:", inputRef.current.direction);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
      inputRef.current.direction = getDirectionFromKeys();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleResetLevel, togglePause]);

  // Game loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const current = gameStateRef.current;
          const introActive = levelIntroElapsedRef.current < LEVEL_INTRO_DURATION_SECONDS;
          let victoryFlightProgress = 0;

          // Step physics and state
          if (current.status === "paused") {
            // Keep simulation timers and level intro frozen while paused.
          } else if (introActive) {
            levelIntroElapsedRef.current = Math.min(
              LEVEL_INTRO_DURATION_SECONDS,
              levelIntroElapsedRef.current + dt,
            );
            if (
              levelIntroElapsedRef.current >= LEVEL_INTRO_DURATION_SECONDS &&
              current.status === "playing" &&
              !levelMusicStartedRef.current
            ) {
              levelMusicStartedRef.current = true;
              startMusic();
            }
            inputRef.current.firePressed = false;
            inputRef.current.clubPressed = false;
            inputRef.current.directionChanged = false;
          } else if (current.status === "playing") {
            // Detect direction change
            const dirChanged = inputRef.current.direction !== prevDirectionRef.current;
            inputRef.current.directionChanged = dirChanged;

            prevDirectionRef.current = inputRef.current.direction;

            const next = stepGame(current, dt, inputRef.current);

            // Reset single-frame action presses
            inputRef.current.firePressed = false;
            inputRef.current.clubPressed = false;
            inputRef.current.directionChanged = false;

            if (next !== current) {
              if (next.player.lives < current.player.lives && next.status === "playing") {
                const restarted = initLevel(
                  next.levelIndex,
                  next.player.lives,
                  next.score,
                  activeLevelsRef.current,
                );
                gameStateRef.current = restarted;
                setGameState(restarted);
                beginLevelIntro(true);
              } else {
                gameStateRef.current = next;
                setGameState(next);
                if (next.player.lives < current.player.lives) {
                  damageDarknessRemainingRef.current = DAMAGE_DARKNESS_DURATION_SECONDS;
                }

                if (next.status === "level_won") {
                  recordLevelProgress(next.levelIndex + 1);
                }
                if (next.status !== "playing") {
                  levelMusicStartedRef.current = false;
                  stopMusic();
                }
              }
            }
          } else if (current.status === "level_won") {
            if (!victoryTransitionRef.current) {
              const remainingSeconds = Math.max(
                0,
                current.levelTimeLimitSeconds - current.levelTimeSeconds,
              );
              const tallyDurationSeconds =
                Math.ceil(remainingSeconds / TIME_BONUS_SECONDS_PER_TICK) *
                TIME_BONUS_TICK_INTERVAL_SECONDS;
              victoryTransitionRef.current = {
                elapsedSeconds: 0,
                tickAccumulator: 0,
                tallyDurationSeconds,
                durationSeconds: tallyDurationSeconds + 2,
              };
              stopMusic();
            }

            const transition = victoryTransitionRef.current;
            transition.elapsedSeconds += dt;
            transition.tickAccumulator += dt;
            let updatedState = current;

            while (
              transition.tickAccumulator + 1e-9 >= TIME_BONUS_TICK_INTERVAL_SECONDS &&
              updatedState.levelTimeSeconds < updatedState.levelTimeLimitSeconds
            ) {
              transition.tickAccumulator -= TIME_BONUS_TICK_INTERVAL_SECONDS;
              updatedState = applyTimeBonusTick(updatedState);
              playTimeBonusTick();
            }

            if (updatedState !== current) {
              gameStateRef.current = updatedState;
              setGameState(updatedState);
            }

            if (transition.elapsedSeconds >= transition.durationSeconds) {
              const nextIndex = updatedState.levelIndex + 1;
              const nextState =
                nextIndex >= activeLevelsRef.current.length
                  ? { ...updatedState, status: "game_completed" as const }
                  : initLevel(
                      nextIndex,
                      updatedState.player.lives,
                      updatedState.score,
                      activeLevelsRef.current,
                    );
              victoryTransitionRef.current = null;
              inputRef.current.direction = null;
              inputRef.current.firePressed = false;
              inputRef.current.clubPressed = false;
              inputRef.current.directionChanged = false;
              gameStateRef.current = nextState;
              setGameState(nextState);
              beginLevelIntro();
            } else {
              victoryFlightProgress = Math.min(
                1,
                transition.elapsedSeconds / transition.durationSeconds,
              );
            }
          }

          if (current.status !== "paused") {
            damageDarknessRemainingRef.current = Math.max(
              0,
              damageDarknessRemainingRef.current - dt,
            );
          }
          const introProgress = Math.min(
            1,
            levelIntroElapsedRef.current / LEVEL_INTRO_DURATION_SECONDS,
          );
          const screenDarkness =
            DAMAGE_DARKNESS_MAX_OPACITY *
            (damageDarknessRemainingRef.current / DAMAGE_DARKNESS_DURATION_SECONDS);

          // Render frame
          renderGame(
            ctx,
            gameStateRef.current,
            imagesRef.current,
            canvas.width,
            canvas.height,
            now,
            {
              playerIntroProgress: introProgress,
              screenDarkness,
              victoryFlightProgress,
              paused: gameStateRef.current.status === "paused",
              pauseTitle: lang === "en" ? "PAUSED" : lang === "eus" ? "PAUSATUTA" : "PAUSA",
              pausePrompt:
                lang === "en"
                  ? "Press P or the button to resume"
                  : lang === "eus"
                    ? "Sakatu P edo botoia jarraitzeko"
                    : "Pulsa P o el botón para continuar",
            },
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [beginLevelIntro, lang]);

  // Level controls
  const handleRestartGame = () => {
    const fresh = initLevel(0, 3, 0, activeLevelsRef.current);
    gameStateRef.current = fresh;
    setGameState(fresh);
    beginLevelIntro();
  };

  // Touch control callbacks
  const handleTouchDir = (dir: Direction | null) => {
    if (gameStateRef.current.status !== "playing") return;
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.direction = dir;
  };

  const handleTouchFire = () => {
    if (gameStateRef.current.status !== "playing") return;
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.firePressed = true;
  };

  const handleTouchClub = () => {
    if (gameStateRef.current.status !== "playing") return;
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.clubPressed = true;
  };

  const levelHint = activeLevels[gameState.levelIndex]?.hint;
  const levelHintText = levelHint?.[lang === "eus" ? "eu" : lang];

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="mb-1 flex w-full items-center justify-between gap-2">
        <Link
          to="/$lang/tabernicle-cubicle"
          params={{ lang }}
          className="flex min-w-0 items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/80 px-3 py-1.5 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-600/60 hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {lang === "en"
              ? "Back to Tabernicle"
              : lang === "eus"
                ? "Tabernicle-ra itzuli"
                : "Volver"}
          </span>
        </Link>
        <GameActions
          state={gameState}
          lang={lang}
          onPauseToggle={togglePause}
          onResetLevel={handleResetLevel}
          onOpenHelp={() => setHelpOpen(true)}
        />
      </div>

      {/* Main 21:14 Canvas Container */}
      <div className="w-full overflow-hidden rounded-2xl border-4 border-amber-900/60 bg-stone-950 shadow-2xl shadow-amber-950/40">
        <GameStatusBar state={gameState} lang={lang} />
        <canvas
          ref={canvasRef}
          width={1050}
          height={700}
          className="block aspect-[21/14] h-auto w-full object-contain"
        />
      </div>

      {/* Level hint outside the canvas */}
      {levelHintText && (
        <p className="w-full rounded-lg border border-amber-500/30 bg-stone-950/80 px-4 py-2 text-center text-sm font-medium text-amber-200/90">
          💡 {levelHintText}
        </p>
      )}

      {/* On-screen Controls for Mobile */}
      <TouchControls
        onDirectionChange={handleTouchDir}
        onFire={handleTouchFire}
        onClub={handleTouchClub}
      />

      {/* Desktop keyboard hint footer */}
      <div className="hidden text-center text-xs text-stone-400 sm:block">
        <b>Mover:</b> Flechas / WASD &nbsp;|&nbsp; <b>Fuego:</b> Espacio / J &nbsp;|&nbsp;{" "}
        <b>Pivote (Garrote):</b> K / Shift &nbsp;|&nbsp; <b>Pausa:</b> P &nbsp;|&nbsp;{" "}
        <b>Reiniciar:</b> R
      </div>

      {/* Modals */}
      <HowToPlayModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} lang={lang} />
      <VictoryModal
        state={gameState}
        lang={lang}
        onRetryLevel={handleResetLevel}
        onRestartGame={handleRestartGame}
      />
    </div>
  );
}
