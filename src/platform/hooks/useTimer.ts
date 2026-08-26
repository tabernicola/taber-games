import { useEffect, useRef, useState } from "react";

/** Simple seconds counter that can be paused/reset. */
export function useTimer(running: boolean, initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  const ref = useRef(initial);
  ref.current = seconds;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  return { seconds, setSeconds };
}
