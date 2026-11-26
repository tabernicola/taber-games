/** A short synthesized voice; noise gives fire and rock effects their texture. */
interface Voice {
  frequency: number;
  endFrequency: number;
  duration: number;
  volume: number;
  delay?: number;
  type?: OscillatorType | "noise";
}

let context: AudioContext | null = null;
let output: GainNode | null = null;

/** Lazily creates browser-only audio, leaving server imports safe. */
function getContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  context ??= new window.AudioContext();
  if (!output) {
    output = context.createGain();
    output.connect(context.destination);
  }
  return context;
}

/** Unlocks effects during a real keyboard or touch gesture. */
export function unlockEffects(): void {
  const audio = getContext();
  if (audio?.state === "suspended") void audio.resume().catch(() => undefined);
}

/** Silences even effects already playing when the sound button is toggled. */
export function setEffectsEnabled(enabled: boolean): void {
  if (context && output) output.gain.setValueAtTime(enabled ? 1 : 0, context.currentTime);
}

/** Creates filtered noise or an oscillator with a descending/ascending pitch. */
function createSource(audio: AudioContext, voice: Voice, start: number): AudioScheduledSourceNode {
  if (voice.type === "noise") {
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * voice.duration), audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    return source;
  }
  const source = audio.createOscillator();
  source.type = voice.type ?? "sine";
  source.frequency.setValueAtTime(voice.frequency, start);
  source.frequency.exponentialRampToValueAtTime(voice.endFrequency, start + voice.duration);
  return source;
}

/** Schedules a bounded voice and disconnects its nodes after playback. */
function scheduleVoice(audio: AudioContext, destination: GainNode, voice: Voice): void {
  const start = audio.currentTime + (voice.delay ?? 0);
  const source = createSource(audio, voice, start);
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(voice.frequency, start);
  filter.frequency.exponentialRampToValueAtTime(voice.endFrequency, start + voice.duration);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(voice.volume, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  source.start(start);
  source.stop(start + voice.duration + 0.01);
}

/** Plays layered arcade effects without downloads, and ignores muted calls. */
export function playEffect(enabled: boolean, voices: Voice[]): void {
  if (!enabled) return;
  const audio = getContext();
  const destination = output;
  if (!audio || !destination) return;
  const play = () => {
    destination.gain.setValueAtTime(1, audio.currentTime);
    for (const voice of voices) scheduleVoice(audio, destination, voice);
  };
  // Gesture handlers unlock suspended contexts; never replay stale effects later.
  if (audio.state === "running") play();
}