import { useEffect, useRef, useState } from "react";
import type { Direction, GameState } from "../logic/types";
import { initLevel, stepGame, type InputState } from "../logic/engine";
import { loadTaberImages, renderGame, type LoadedImages } from "../logic/renderer";
import {
  initMusic,
  setMusicUrgency,
  startMusic,
  stopMusic,
  tryPlayMusicOnInteraction,
} from "../logic/audio";
import { GameHud, GameStatusBar } from "./GameHud";
import { TouchControls } from "./TouchControls";
import { HowToPlayModal } from "./HowToPlayModal";
import { VictoryModal } from "./VictoryModal";
import { LEVELS } from "../logic/levels";
import type { LangSlug } from "@/platform/i18n";

const LOCAL_STORAGE_KEY = "tabernicle_max_level";
const LEVEL_INTRO_DURATION_SECONDS = 1.3;
const DAMAGE_DARKNESS_DURATION_SECONDS = 0.9;
const DAMAGE_DARKNESS_MAX_OPACITY = 0.38;

interface TabernicleGameProps {
  lang: LangSlug;
  initialLevel?: number;
}

export function TabernicleGame({ lang, initialLevel = 0 }: TabernicleGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => initLevel(initialLevel));
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;
  const levelIntroElapsedRef = useRef(0);
  const levelMusicStartedRef = useRef(false);
  const damageDarknessRemainingRef = useRef(0);

  // Modals
  const [helpOpen, setHelpOpen] = useState(false);

  // Input ref
  const inputRef = useRef<InputState>({
    direction: null,
    firePressed: false,
    clubPressed: false,
  });

  // Track previous direction to detect first press
  const prevDirectionRef = useRef<Direction | null>(null);

  // Loaded images ref
  const imagesRef = useRef<LoadedImages>({ spritesheet: null });

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

  const beginLevelIntro = (darkenScreen = false) => {
    levelIntroElapsedRef.current = 0;
    levelMusicStartedRef.current = false;
    damageDarknessRemainingRef.current = darkenScreen ? DAMAGE_DARKNESS_DURATION_SECONDS : 0;
    stopMusic();
  };

  // Preload Taber sprites once
  useEffect(() => {
    imagesRef.current = loadTaberImages();
  }, []);

  // Initialize audio element once
  useEffect(() => {
    initMusic();
  }, []);

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

      console.log("KeyDown:", e.code);
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
  }, []);

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

          // Step physics and state
          if (introActive) {
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
                const restarted = initLevel(next.levelIndex, next.player.lives, next.score);
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
          }

          damageDarknessRemainingRef.current = Math.max(0, damageDarknessRemainingRef.current - dt);
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
            { playerIntroProgress: introProgress, screenDarkness },
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Level controls
  const handleResetLevel = () => {
    const cur = gameStateRef.current;
    const fresh = initLevel(cur.levelIndex, 3, cur.score);
    gameStateRef.current = fresh;
    setGameState(fresh);
    beginLevelIntro();
  };

  const handleNextLevel = () => {
    const cur = gameStateRef.current;
    const nextIndex = cur.levelIndex + 1;
    if (nextIndex >= LEVELS.length) {
      const completedState: GameState = { ...cur, status: "game_completed" };
      gameStateRef.current = completedState;
      setGameState(completedState);
      beginLevelIntro();
    } else {
      const nextState = initLevel(nextIndex, cur.player.lives, cur.score);
      gameStateRef.current = nextState;
      setGameState(nextState);
      beginLevelIntro();
    }
  };

  const handleRestartGame = () => {
    const fresh = initLevel(0, 3, 0);
    gameStateRef.current = fresh;
    setGameState(fresh);
    beginLevelIntro();
  };

  // Touch control callbacks
  const handleTouchDir = (dir: Direction | null) => {
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.direction = dir;
  };

  const handleTouchFire = () => {
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.firePressed = true;
  };

  const handleTouchClub = () => {
    if (gameStateRef.current.status === "playing" && levelMusicStartedRef.current) {
      tryPlayMusicOnInteraction();
    }
    inputRef.current.clubPressed = true;
  };

  const levelHint = LEVELS[gameState.levelIndex]?.hint;
  const levelHintText = levelHint?.[lang === "eus" ? "eu" : lang];

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {/* Top HUD */}
      <GameHud
        state={gameState}
        lang={lang}
        onResetLevel={handleResetLevel}
        onOpenHelp={() => setHelpOpen(true)}
      />

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
        <b>Pivote (Garrote):</b> K / Shift &nbsp;|&nbsp; <b>Reiniciar:</b> R
      </div>

      {/* Modals */}
      <HowToPlayModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} lang={lang} />
      <VictoryModal
        state={gameState}
        lang={lang}
        onNextLevel={handleNextLevel}
        onRetryLevel={handleResetLevel}
        onRestartGame={handleRestartGame}
      />
    </div>
  );
}
