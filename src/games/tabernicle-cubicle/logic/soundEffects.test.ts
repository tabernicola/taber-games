import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

/** Supplies observable browser audio nodes without requiring a sound device. */
function fakeAudio(state = "running") {
  const parameter = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const node = () => ({ connect: vi.fn(), disconnect: vi.fn(), gain: parameter(), frequency: parameter(), start: vi.fn(), stop: vi.fn() });
  const master = node();
  const oscillator = node();
  const audio = {
    state, currentTime: 0, destination: {}, sampleRate: 48000,
    resume: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn().mockReturnValueOnce(master).mockImplementation(node),
    createOscillator: vi.fn().mockReturnValue(oscillator),
    createBiquadFilter: vi.fn().mockImplementation(node),
    createBuffer: vi.fn().mockReturnValue({ getChannelData: () => new Float32Array(4800) }),
    createBufferSource: vi.fn().mockImplementation(node),
  };
  vi.stubGlobal("window", { AudioContext: class { constructor() { return audio; } } });
  return { audio, oscillator, master };
}

const voice = [{ frequency: 880, endFrequency: 440, duration: 0.1, volume: 0.1 }];

describe("action sound playback", () => {
  it("does not create or schedule audio when muted", async () => {
    const { audio } = fakeAudio();
    const { playEffect } = await import("./soundEffects");
    playEffect(false, voice);
    expect(audio.createGain).not.toHaveBeenCalled();
    expect(audio.createOscillator).not.toHaveBeenCalled();
  });

  it("plays enabled actions and immediately silences active effects", async () => {
    const { oscillator, master } = fakeAudio();
    const { playEffect, setEffectsEnabled } = await import("./soundEffects");
    playEffect(true, voice);
    expect(oscillator.start).toHaveBeenCalledWith(0);
    expect(oscillator.stop).toHaveBeenCalledWith(0.11);
    setEffectsEnabled(false);
    expect(master.gain.setValueAtTime).toHaveBeenLastCalledWith(0, 0);
  });

  it("unlocks on a gesture without replaying blocked actions", async () => {
    const { audio, oscillator } = fakeAudio("suspended");
    const { playEffect, unlockEffects } = await import("./soundEffects");
    playEffect(true, voice);
    expect(oscillator.start).not.toHaveBeenCalled();
    unlockEffects();
    expect(audio.resume).toHaveBeenCalledOnce();
  });
});