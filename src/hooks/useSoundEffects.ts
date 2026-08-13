import { useCallback, useRef } from "react";

type SoundType = "click" | "place" | "rotate" | "win" | "roll";

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<SoundType[]>([]);
  const flushingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSoundImmediate = useCallback(
    (type: SoundType) => {
      const ctx = getAudioContext();
      let now = ctx.currentTime;

      switch (type) {
        case "click": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 600;
          osc.type = "square";
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case "rotate": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case "roll": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          filter.type = "bandpass";
          filter.frequency.value = 900 + Math.random() * 400;
          osc.type = "triangle";
          osc.frequency.value = 180 + Math.random() * 120;
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case "place": {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.frequency.value = 500;
          osc2.frequency.value = 800;
          osc1.type = "sine";
          osc2.type = "sine";
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.2);
          osc2.stop(now + 0.2);
          break;
        }

        case "win": {
          const notes = [
            { freq: 523, time: 0.15 },
            { freq: 659, time: 0.15 },
            { freq: 784, time: 0.3 },
          ];
          notes.forEach(({ freq, time }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + time);
            osc.start(now);
            osc.stop(now + time);
            now += time - 0.05;
          });
          break;
        }
      }
    },
    [getAudioContext],
  );

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      while (queueRef.current.length > 0 && ctx.state === "running") {
        const type = queueRef.current.shift()!;
        playSoundImmediate(type);
      }
    } catch {
      /* audio blocked */
    } finally {
      flushingRef.current = false;
    }
  }, [getAudioContext, playSoundImmediate]);

  const unlockAudio = useCallback(async (): Promise<boolean> => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state === "running") {
        await flushQueue();
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }, [getAudioContext, flushQueue]);

  const playSound = useCallback(
    (type: SoundType) => {
      try {
        const ctx = getAudioContext();
        if (ctx.state !== "running") {
          queueRef.current.push(type);
          void unlockAudio();
          return;
        }
        playSoundImmediate(type);
      } catch (err) {
        console.debug("Sound playback failed:", err);
      }
    },
    [getAudioContext, playSoundImmediate, unlockAudio],
  );

  return { playSound, unlockAudio };
}
