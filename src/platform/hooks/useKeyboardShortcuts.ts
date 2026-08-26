import { useEffect, useRef } from "react";

/**
 * Runs the handler bound to the pressed key while the component is mounted.
 * Single-letter keys match case-insensitively; named keys (e.g. "Escape")
 * match exactly.
 */
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const handler = handlersRef.current[e.key] ?? handlersRef.current[e.key.toLowerCase()];
      handler?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
