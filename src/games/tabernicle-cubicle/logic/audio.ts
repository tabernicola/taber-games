import { playEffect, setEffectsEnabled, unlockEffects } from "./soundEffects";

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
  unlockEffects();
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
  unlockEffects();
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
  setEffectsEnabled(sounds.enabled);
  if (!musicElement) {
    return;
  }

  musicElement.volume = sounds.enabled ? 0.4 : 0;
}

/** A quick crackling whoosh when Taber shoots fire. */
export function playFire(): void {
  playEffect(sounds.enabled, [{ type: "noise", frequency: 3200, endFrequency: 350, duration: 0.22, volume: 0.22 }]);
}

/** A low wooden thud with a short swing. */
export function playClubSmash(): void {
  playEffect(sounds.enabled, [
    { type: "noise", frequency: 1800, endFrequency: 250, duration: 0.09, volume: 0.12 },
    { frequency: 170, endFrequency: 55, duration: 0.16, volume: 0.22, delay: 0.04 },
  ]);
}

/** A quiet earthy footstep, once per completed tile. */
export function playFootstep(): void {
  playEffect(sounds.enabled, [{ type: "noise", frequency: 500, endFrequency: 140, duration: 0.065, volume: 0.07 }]);
}

/** A bright two-note reward for collecting an egg. */
export function playEggCollect(): void {
  playEffect(sounds.enabled, [
    { frequency: 880, endFrequency: 880, duration: 0.12, volume: 0.12 },
    { frequency: 1320, endFrequency: 1320, duration: 0.2, volume: 0.1, delay: 0.09 },
  ]);
}

/** A short original ascending fanfare for clearing a level. */
export function playStageClear(): void {
  playEffect(sounds.enabled, [523, 659, 784, 1047].map((frequency, index) => ({
    frequency, endFrequency: frequency, duration: 0.24, volume: 0.1, delay: index * 0.13,
  })));
}

/** A gritty rumble when a rock starts sliding. */
export function playBlockSlide(): void {
  playEffect(sounds.enabled, [{ type: "noise", frequency: 700, endFrequency: 180, duration: 0.3, volume: 0.18 }]);
}

/** A brittle crack when a creature turns to stone. */
export function playCalcine(): void {
  playEffect(sounds.enabled, [{ type: "noise", frequency: 2400, endFrequency: 500, duration: 0.17, volume: 0.25 }]);
}

/** Steam and a bubbling plop when a rock forms a lava bridge. */
export function playLavaFill(): void {
  playEffect(sounds.enabled, [
    { type: "noise", frequency: 3800, endFrequency: 400, duration: 0.5, volume: 0.2 },
    { frequency: 180, endFrequency: 65, duration: 0.22, volume: 0.18 },
  ]);
}

/** A heavy impact when a rolling rock stops or breaks. */
export function playBlockStop(): void {
  playEffect(sounds.enabled, [
    { frequency: 120, endFrequency: 40, duration: 0.14, volume: 0.2 },
    { type: "noise", frequency: 950, endFrequency: 160, duration: 0.12, volume: 0.15 },
  ]);
}

/** A falling buzzy tone when Taber takes damage. */
export function playHurt(): void {
  playEffect(sounds.enabled, [{ type: "sawtooth", frequency: 420, endFrequency: 95, duration: 0.34, volume: 0.18 }]);
}

/** A soft tally tone for each time bonus increment. */
export function playTimeBonusTick(): void {
  playEffect(sounds.enabled, [{ frequency: 880, endFrequency: 660, duration: 0.07, volume: 0.08 }]);
}
