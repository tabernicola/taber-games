import { useCallback, useEffect, useRef, useState } from "react";

export type DragPosition = { id: string; x: number; y: number };

interface DragInfo {
  id: string;
  startX: number;
  startY: number;
  moved: boolean;
  fromBoard: boolean;
}

const DRAG_THRESHOLD_PX = 6;

/**
 * Shared pick-and-place dragging for board games: press a piece, move past a
 * small threshold to lift it (removing it from the board if it came from
 * there), watch the hovered board target, and resolve the drop. Clicks that
 * follow a real drag are suppressed so they don't re-trigger selection.
 *
 * The game provides how to resolve a board target (`resolveTarget`) and what
 * picking/lifting/dropping do to its own state.
 */
export function usePieceDragDrop<TTarget>({
  canStartDrag,
  resolveTarget,
  onPickPiece,
  onLiftPiece,
  onDrop,
  onHoverTarget,
}: {
  canStartDrag: () => boolean;
  resolveTarget: (clientX: number, clientY: number) => TTarget | null;
  onPickPiece: (pieceId: string) => void;
  onLiftPiece: (pieceId: string) => void;
  onDrop: (pieceId: string, target: TTarget | null) => void;
  onHoverTarget?: (target: TTarget | null) => void;
}) {
  const [drag, setDrag] = useState<DragPosition | null>(null);
  const dragRef = useRef<DragInfo | null>(null);
  const suppressClickRef = useRef(false);

  const startDrag = useCallback(
    (e: React.PointerEvent, pieceId: string, fromBoard: boolean) => {
      if (!canStartDrag()) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragRef.current = {
        id: pieceId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        fromBoard,
      };
    },
    [canStartDrag],
  );

  /** True while the last pointer gesture was a real drag, not a plain click. */
  const shouldSuppressClick = useCallback(() => suppressClickRef.current, []);

  const releaseSuppression = () => {
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved) {
        const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
        if (dist < DRAG_THRESHOLD_PX) return;
        d.moved = true;
        suppressClickRef.current = true;
        onPickPiece(d.id);
        if (d.fromBoard) onLiftPiece(d.id);
      }
      setDrag({ id: d.id, x: e.clientX, y: e.clientY });
      onHoverTarget?.(resolveTarget(e.clientX, e.clientY));
    };

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      if (!d.moved) return; // treat as a plain click
      setDrag(null);
      onHoverTarget?.(null);
      onDrop(d.id, resolveTarget(e.clientX, e.clientY));
      releaseSuppression();
    };

    const onCancel = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      onHoverTarget?.(null);
      if (d?.moved) releaseSuppression();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [resolveTarget, onPickPiece, onLiftPiece, onDrop, onHoverTarget]);

  return { drag, startDrag, shouldSuppressClick };
}
