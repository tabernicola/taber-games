/**
 * Audio module for Tabernicle Cubicle background music.
 * Handles loading, looping playback, and level-start initialization.
 */

/**
 * Path to the background music file.
 */
const MUSIC_PATH = "/tabernicle-cubicle/sound/level1.mp3";

/**
 * Single HTMLAudioElement instance for background music.
 * Reused across levels to avoid multiple audio elements.
 */
let musicElement: HTMLAudioElement | null = null;

/**
 * Whether music playback has been blocked by browser autoplay policy.
 * When true, the music will attempt to start on the next user interaction.
 */
let autoplayBlocked = false;
let urgencyMusic = false;
let effectsContext: AudioContext | null = null;

const NORMAL_PLAYBACK_RATE = 1;
const URGENCY_PLAYBACK_RATE = 1.25;

/**
 * Audio settings object used by UI components.
 * Controls whether sound is enabled/muted.
 */
export const sounds = {
  enabled: true,
};

/**
 * Initializes the audio element with the background music file.
 * This can be called safely multiple times; it returns the existing element if already loaded.
 *
 * @returns The HTMLAudioElement instance, or null if running in a server-side environment.
 */
export function initMusic(): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (musicElement) {
    return musicElement;
  }

  const audio = new Audio(MUSIC_PATH);
  audio.loop = true;
  audio.volume = 0.4;
  audio.playbackRate = urgencyMusic ? URGENCY_PLAYBACK_RATE : NORMAL_PLAYBACK_RATE;
  musicElement = audio;

  return audio;
}

/**
 * Starts or restarts the background music from the beginning.
 * Handles browser autoplay restrictions gracefully.
 *
 * If playback is blocked by autoplay policy, the function records this state
 * and will attempt to play again when the user interacts with the game.
 */
export function startMusic(): void {
  const audio = initMusic();
  if (!audio) {
    return;
  }

  audio.currentTime = 0;
  audio.volume = sounds.enabled ? 0.4 : 0;

  audio.play().catch(() => {
    // Cualquier fallo de reproducción se trata como bloqueo de autoplay.
    // El reintento se hará en la próxima interacción del usuario.
    autoplayBlocked = true;
  });
}

/**
 * Prepares music playback from a user gesture for mobile browsers.
 *
 * Keep the audio element playing silently so mobile browsers retain the
 * user-gesture playback authorization until the level intro finishes.
 */
export function unlockAudio(): void {
  const audio = initMusic();
  if (!audio) {
    return;
  }

  audio.volume = 0;
  audio.muted = false;

  const playback = audio.play();
  if (playback && typeof playback.then === "function") {
    playback
      .then(() => {
        autoplayBlocked = false;
      })
      .catch(() => {
        autoplayBlocked = true;
      });
  } else {
    autoplayBlocked = false;
  }
}

/**
 * Resumes music playback if it was paused.
 * This is called when the user interacts with the game after autoplay was blocked.
 */
export function resumeMusic(): void {
  if (!musicElement || autoplayBlocked) {
    return;
  }

  musicElement.play().catch(() => {
    autoplayBlocked = true;
  });
}

/**
 * Stops the background music and resets playback to the beginning.
 */
export function stopMusic(): void {
  if (!musicElement) {
    return;
  }

  musicElement.pause();
  musicElement.currentTime = 0;
}

/**
 * Pauses the background music without resetting playback position.
 */
export function pauseMusic(): void {
  if (!musicElement) {
    return;
  }

  musicElement.pause();
}

/**
 * Speeds up the background music during the final seconds of a level.
 */
export function setMusicUrgency(enabled: boolean): void {
  urgencyMusic = enabled;
  if (musicElement) {
    musicElement.playbackRate = enabled ? URGENCY_PLAYBACK_RATE : NORMAL_PLAYBACK_RATE;
  }
}

/**
 * Attempts to start music after a user interaction, in case autoplay was blocked.
 * This should be called on the first user interaction (keydown, touch, click).
 */
export function tryPlayMusicOnInteraction(): void {
  if (autoplayBlocked && musicElement) {
    autoplayBlocked = false;
    musicElement.play().catch(() => {
      autoplayBlocked = true;
    });
  }
}

/**
 * Updates the audio volume based on the current mute state.
 * Should be called whenever the user toggles the sound in the UI.
 */
export function updateVolume(): void {
  if (!musicElement) {
    return;
  }

  musicElement.volume = sounds.enabled ? 0.4 : 0;
}

/**
 * Sound effect functions for game events.
 * These are currently placeholders for future SFX implementation.
 */
export const playFire = () => {};
export const playClubSmash = () => {};
export const playEggCollect = () => {};
export const playStageClear = () => {};
export const playBlockSlide = () => {};
export const playCalcine = () => {};
export const playLavaFill = () => {};
export const playBlockStop = () => {};
export function playHurt(): void {
  if (!sounds.enabled || typeof window === "undefined" || !window.AudioContext) {
    return;
  }

  effectsContext ??= new AudioContext();
  const context = effectsContext;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = () => {
    const now = context.currentTime;
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(420, now);
    oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.32);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  };

  if (context.state === "suspended") {
    void context.resume().then(start, () => undefined);
  } else {
    start();
  }
}

export function playTimeBonusTick(): void {
  if (!sounds.enabled || typeof window === "undefined" || !window.AudioContext) {
    return;
  }

  effectsContext ??= new AudioContext();
  const context = effectsContext;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = () => {
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.06);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.075);
  };

  if (context.state === "suspended") {
    void context.resume().then(start, () => undefined);
  } else {
    start();
  }
}
