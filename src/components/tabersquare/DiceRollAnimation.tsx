import { useEffect, useRef, useState, useMemo } from "react";
import type { Cell } from "@/lib/tabersquare/pieces";
import { DICE } from "@/lib/tabersquare/dice";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import "./DiceRollAnimation.css";

interface DiceRollAnimationProps {
  blockers: Cell[];
  onComplete: () => void;
  duration?: number;
  boardContainerRef?: React.RefObject<HTMLDivElement | null>;
}

function formatCoordinate(cell: Cell | undefined): string {
  if (!cell) return "";
  const letter = String.fromCharCode(65 + cell[0]); // Column (0 -> A, 5 -> F)
  const number = cell[1] + 1; // Row (0 -> 1, 5 -> 6)
  return `${letter}${number}`;
}

export function DiceRollAnimation({
  blockers,
  onComplete,
  boardContainerRef,
}: DiceRollAnimationProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [phase, setPhase] = useState<"rolling" | "showing" | "transforming">("rolling");
  const [activeTransformIndex, setActiveTransformIndex] = useState<number>(-1);
  const { playSound } = useSoundEffects();

  // Listen to board container size dynamically
  useEffect(() => {
    const updateSize = () => {
      if (overlayRef.current && boardContainerRef?.current) {
        const boardRect = boardContainerRef.current.getBoundingClientRect();
        overlayRef.current.style.position = "fixed";
        overlayRef.current.style.top = `${boardRect.top}px`;
        overlayRef.current.style.left = `${boardRect.left}px`;
        overlayRef.current.style.width = `${boardRect.width}px`;
        overlayRef.current.style.height = `${boardRect.height}px`;
        overlayRef.current.style.zIndex = "50";
        setDimensions({ width: boardRect.width, height: boardRect.height });
      }
    };

    updateSize();
    // Use a small delay to ensure the board layout has stabilized on initial render
    const timer = setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSize);
    };
  }, [boardContainerRef]);

  // Main animation timeline - only starts once dimensions are measured
  useEffect(() => {
    if (dimensions.width === 0) return;

    // 1. Roll/Spin for 1500ms
    const rollTimer = setTimeout(() => {
      setPhase("showing");
    }, 1500);

    // 2. Show result for 1000ms, then start transforming
    const showTimer = setTimeout(() => {
      setPhase("transforming");
      setActiveTransformIndex(0);
    }, 2500);

    return () => {
      clearTimeout(rollTimer);
      clearTimeout(showTimer);
    };
  }, [dimensions.width]);

  // Staggered transformation of dice
  useEffect(() => {
    if (phase !== "transforming" || activeTransformIndex === -1) return;

    if (activeTransformIndex < blockers.length) {
      // Play satisfying placement sound as each die starts transitioning
      try {
        playSound("place");
      } catch (e) {
        console.error("Audio error during dice animation", e);
      }

      const timer = setTimeout(() => {
        setActiveTransformIndex((prev) => prev + 1);
      }, 400); // Stagger by 400ms per die
      return () => clearTimeout(timer);
    } else {
      // Once all dice are transformed, wait a bit and complete
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(completeTimer);
    }
  }, [phase, activeTransformIndex, blockers.length, onComplete, playSound]);

  // Stable random offsets for spinning and rolling phase
  const randomOffsets = useMemo(() => {
    return Array.from({ length: 7 }).map(() => ({
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
      spinX: Math.random() * 720 + 360,
      spinY: Math.random() * 720 + 360,
      spinZ: Math.random() * 720 + 360,
    }));
  }, []);

  // Get face texts for each die, with the rolled face at index 0 (front face)
  const diceFaces = useMemo(() => {
    return blockers.map((blocker, i) => {
      const dieConfig = DICE[i];
      if (!dieConfig) return ["", "", "", "", "", ""];

      // Find which face of the i-th die was rolled
      const rolledIdx = dieConfig.findIndex(
        (cell) => cell[0] === blocker[0] && cell[1] === blocker[1],
      );

      // Create a list of all 6 faces for this die
      const faces = [...dieConfig];

      // Swap the rolled face to index 0 so it aligns with the front face
      if (rolledIdx !== -1 && rolledIdx !== 0) {
        const temp = faces[0];
        faces[0] = faces[rolledIdx];
        faces[rolledIdx] = temp;
      }

      // Format each of the 6 faces to "A1"-"F6" coordinates
      return faces.map(formatCoordinate);
    });
  }, [blockers]);

  const DiceFace = ({ text, className }: { text: string; className: string }) => (
    <div className={`dice-face ${className}`}>
      <span className="dice-face-text">{text}</span>
    </div>
  );

  const width = dimensions.width || 350;
  const height = dimensions.height || 350;
  const padding = 12; // matching p-3
  const gap = 6;
  const cellSize = (width - 2 * padding - 5 * gap) / 6;

  return (
    <div className="dice-animation-overlay" ref={overlayRef}>
      <div className="dice-animation-backdrop" aria-hidden="true" />
      {/* Defer rendering of dice until dimensions are measured to prevent wrong start position */}
      {dimensions.width > 50 && (
        <div className="dice-container" style={{ width: "100%", height: "100%" }}>
          {Array.from({ length: blockers.length }).map((_, i) => {
            const faces = diceFaces[i] || ["", "", "", "", "", ""];

            // 1. Calculate separated circle positions for 'rolling' and 'showing' phases
            const radius = width * 0.28;
            const centerX = width / 2;
            const centerY = height / 2;
            // Offset by -90 deg so first die is top-center, then distributed evenly
            const angle = (i * 2 * Math.PI) / blockers.length - Math.PI / 2;

            let currentX = centerX + radius * Math.cos(angle);
            let currentY = centerY + radius * Math.sin(angle);

            if (phase === "rolling") {
              currentX += randomOffsets[i].x;
              currentY += randomOffsets[i].y;
            }

            // 2. Calculate final target cell positions on the board
            const cell = blockers[i] || [0, 0];
            const finalLeft = padding + cell[0] * (cellSize + gap) + cellSize / 2;
            const finalTop = padding + cell[1] * (cellSize + gap) + cellSize / 2;

            // Determine current positioning and class for this die
            const isTransformed = phase === "transforming" && i < activeTransformIndex;
            const isTransformingNow = phase === "transforming" && i === activeTransformIndex;
            const targetX = isTransformed || isTransformingNow ? finalLeft : currentX;
            const targetY = isTransformed || isTransformingNow ? finalTop : currentY;

            let dieClass = "";
            if (phase === "rolling") dieClass = "is-rolling";
            else if (phase === "showing") dieClass = "is-showing";
            else if (phase === "transforming") {
              if (isTransformed) dieClass = "is-placed";
              else if (isTransformingNow) dieClass = "is-transforming";
              else dieClass = "is-showing";
            }

            const dieSize = isTransformed || isTransformingNow ? cellSize : 48;
            const dieHalf = dieSize / 2;

            return (
              <div
                key={`die-${i}`}
                className={`dice-die ${dieClass}`}
                style={
                  {
                    left: `${targetX}px`,
                    top: `${targetY}px`,
                    width: `${dieSize}px`,
                    height: `${dieSize}px`,
                    "--die-half": `${dieHalf}px`,
                    "--random-spin-x": `${randomOffsets[i].spinX}deg`,
                    "--random-spin-y": `${randomOffsets[i].spinY}deg`,
                    "--random-spin-z": `${randomOffsets[i].spinZ}deg`,
                  } as React.CSSProperties
                }
              >
                {/* 3D Cube Structure (Fades out when transforming/placed) */}
                <div className="dice-cube">
                  <DiceFace text={faces[0]} className="dice-front" />
                  <DiceFace text={faces[1]} className="dice-back" />
                  <DiceFace text={faces[2]} className="dice-left" />
                  <DiceFace text={faces[3]} className="dice-right" />
                  <DiceFace text={faces[4]} className="dice-top" />
                  <DiceFace text={faces[5]} className="dice-bottom" />
                </div>

                {/* Peg Shape Structure (Fades in when transforming/placed) */}
                <div className="dice-peg-shape">
                  <div className="dice-peg-dot" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
