import { useEffect, useRef, useState, useMemo } from "react";
import type { Tri } from "../logic/geometry";
import { triCentroid } from "../logic/geometry";
import { DICE } from "../logic/dice";
import { getNumberForCell } from "../logic/numberMapping";
import { BOARD } from "../logic/game";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import "./DiceRollAnimation.css";

interface DiceRollAnimationProps {
  blockers: Tri[];
  onComplete: () => void;
  duration?: number;
  boardContainerRef?: React.RefObject<HTMLDivElement | null>;
}

function formatNumber(num: number): string {
  return num.toString();
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
        // Position overlay exactly over the board container
        overlayRef.current.style.position = "absolute";
        overlayRef.current.style.top = "0";
        overlayRef.current.style.left = "0";
        overlayRef.current.style.width = "100%";
        overlayRef.current.style.height = "100%";
        overlayRef.current.style.zIndex = "50";
        setDimensions({ width: boardRect.width, height: boardRect.height });
      }
    };

    updateSize();
    const timer = setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSize);
    };
  }, [boardContainerRef]);

  // Main animation timeline
  useEffect(() => {
    if (dimensions.width === 0) return;

    const rollTimer = setTimeout(() => {
      setPhase("showing");
    }, 1500);

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
      try {
        playSound("place");
      } catch (e) {
        console.error("Audio error during dice animation", e);
      }

      const timer = setTimeout(() => {
        setActiveTransformIndex((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
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

  // Get face numbers for each die, with the rolled face at index 0 (front face)
  const diceFaces = useMemo(() => {
    return blockers.map((blocker) => {
      const blockerNumber = getNumberForCell(blocker, BOARD);

      // Find which die contains this blocker's number
      const dieConfig = DICE.find((die) => die.faces.includes(blockerNumber || 0));
      if (!dieConfig) return ["", "", "", "", "", "", "", ""];

      // Find which face of the die was rolled
      const rolledIdx = dieConfig.faces.indexOf(blockerNumber || 0);

      // Create a list of all faces for this die
      const faces = [...dieConfig.faces];

      // Swap the rolled face to index 0 so it aligns with the front face
      if (rolledIdx !== -1 && rolledIdx !== 0) {
        const temp = faces[0];
        faces[0] = faces[rolledIdx];
        faces[rolledIdx] = temp;
      }

      // Format each face as a number string
      return faces.map(formatNumber);
    });
  }, [blockers]);

  const DiceFace = ({
    text,
    className,
    baseClassName = "dice-face",
  }: {
    text: string;
    className: string;
    baseClassName?: string;
  }) => (
    <div className={`${baseClassName} ${className}`}>
      <span className="dice-face-text">{text}</span>
    </div>
  );

  const width = dimensions.width || 400;
  const height = dimensions.height || 400;

  return (
    <div className="dice-animation-overlay" ref={overlayRef}>
      <div className="dice-animation-backdrop" aria-hidden="true" />
      {dimensions.width > 50 && (
        <div className="dice-container" style={{ width: "100%", height: "100%" }}>
          {Array.from({ length: blockers.length }).map((_, i) => {
            const faces = diceFaces[i] || ["", "", "", "", "", "", "", ""];
            const cell = blockers[i];
            const cellNumber = getNumberForCell(cell, BOARD);
            const dieConfig = DICE.find((die) => die.faces.includes(cellNumber || 0));
            const isD8 = dieConfig?.type === "d8";

            // Calculate separated circle positions for 'rolling' and 'showing' phases
            const radius = width * 0.28;
            const centerX = width / 2;
            const centerY = height / 2;
            const angle = (i * 2 * Math.PI) / blockers.length - Math.PI / 2;

            let currentX = centerX + radius * Math.cos(angle);
            let currentY = centerY + radius * Math.sin(angle);

            if (phase === "rolling") {
              currentX += randomOffsets[i].x;
              currentY += randomOffsets[i].y;
            }

            // Calculate final target cell positions on the board (centroid of the triangle)
            const [cellCx, cellCy] = triCentroid(cell);
            const scale = Math.min(width, height) / 8;
            const finalLeft = centerX + cellCx * scale;
            const finalTop = centerY + cellCy * scale;

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

            const dieSize = isTransformed || isTransformingNow ? 28 : 48;
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
                {isD8 ? (
                  <div className="dice-octahedron">
                    {faces.map((face, idx) => (
                      <DiceFace
                        key={idx}
                        text={face}
                        className={`d8-face-${idx}`}
                        baseClassName="dice-d8-face"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="dice-cube">
                    <DiceFace text={faces[0]} className="dice-front" />
                    <DiceFace text={faces[1]} className="dice-back" />
                    <DiceFace text={faces[2]} className="dice-left" />
                    <DiceFace text={faces[3]} className="dice-right" />
                    <DiceFace text={faces[4]} className="dice-top" />
                    <DiceFace text={faces[5]} className="dice-bottom" />
                  </div>
                )}

                <div className={`dice-triangle-shape ${cell.d === 0 ? "tri-down" : "tri-up"}`}>
                  <div className="dice-triangle-number">{cellNumber || ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
