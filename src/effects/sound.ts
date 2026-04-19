import type { DestinationId } from '../state/types';

type SoundShape = 'sine' | 'triangle' | 'square';

type MusicEvent = {
  delay: number;
  from: number;
  to?: number;
  duration: number;
  volume: number;
  type: SoundShape;
};

type MusicPattern = {
  length: number;
  events: MusicEvent[];
};

const routeMusicPatterns: Record<DestinationId, MusicPattern> = {
  maryland: {
    length: 3.2,
    events: [
      { delay: 0, from: 174.61, duration: 0.48, volume: 0.03, type: 'sine' },
      { delay: 0.16, from: 349.23, to: 358, duration: 0.28, volume: 0.03, type: 'triangle' },
      { delay: 0.66, from: 392, to: 404, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 1.12, from: 261.63, duration: 0.34, volume: 0.024, type: 'sine' },
      { delay: 1.34, from: 329.63, to: 338, duration: 0.24, volume: 0.028, type: 'triangle' },
      { delay: 1.82, from: 440, to: 450, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 2.32, from: 293.66, duration: 0.32, volume: 0.024, type: 'sine' },
      { delay: 2.52, from: 349.23, to: 360, duration: 0.24, volume: 0.028, type: 'triangle' },
    ],
  },
  'rhode-island': {
    length: 3.2,
    events: [
      { delay: 0, from: 196, duration: 0.42, volume: 0.026, type: 'sine' },
      { delay: 0.12, from: 392, to: 406, duration: 0.24, volume: 0.03, type: 'triangle' },
      { delay: 0.52, from: 523.25, to: 538, duration: 0.2, volume: 0.026, type: 'triangle' },
      { delay: 0.94, from: 329.63, duration: 0.3, volume: 0.024, type: 'sine' },
      { delay: 1.18, from: 440, to: 452, duration: 0.22, volume: 0.028, type: 'triangle' },
      { delay: 1.56, from: 587.33, to: 600, duration: 0.2, volume: 0.026, type: 'triangle' },
      { delay: 2.02, from: 349.23, duration: 0.28, volume: 0.022, type: 'sine' },
      { delay: 2.24, from: 493.88, to: 504, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 2.64, from: 392, duration: 0.26, volume: 0.024, type: 'triangle' },
    ],
  },
  colorado: {
    length: 3.4,
    events: [
      { delay: 0, from: 146.83, duration: 0.5, volume: 0.028, type: 'sine' },
      { delay: 0.18, from: 293.66, to: 300, duration: 0.28, volume: 0.028, type: 'triangle' },
      { delay: 0.74, from: 369.99, to: 382, duration: 0.24, volume: 0.026, type: 'triangle' },
      { delay: 1.24, from: 246.94, duration: 0.34, volume: 0.022, type: 'sine' },
      { delay: 1.48, from: 329.63, to: 338, duration: 0.24, volume: 0.028, type: 'triangle' },
      { delay: 1.96, from: 440, to: 450, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 2.44, from: 293.66, duration: 0.34, volume: 0.022, type: 'sine' },
      { delay: 2.7, from: 392, to: 406, duration: 0.24, volume: 0.028, type: 'triangle' },
    ],
  },
  greece: {
    length: 3.2,
    events: [
      { delay: 0, from: 220, duration: 0.38, volume: 0.026, type: 'sine' },
      { delay: 0.08, from: 440, to: 452, duration: 0.26, volume: 0.032, type: 'triangle' },
      { delay: 0.5, from: 554.37, to: 566, duration: 0.22, volume: 0.028, type: 'triangle' },
      { delay: 0.92, from: 659.25, to: 672, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 1.34, from: 329.63, duration: 0.3, volume: 0.022, type: 'sine' },
      { delay: 1.54, from: 493.88, to: 506, duration: 0.24, volume: 0.028, type: 'triangle' },
      { delay: 1.98, from: 587.33, to: 600, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 2.38, from: 440, duration: 0.28, volume: 0.024, type: 'triangle' },
      { delay: 2.72, from: 523.25, to: 536, duration: 0.22, volume: 0.026, type: 'triangle' },
    ],
  },
  sweden: {
    length: 3.4,
    events: [
      { delay: 0, from: 164.81, duration: 0.44, volume: 0.026, type: 'sine' },
      { delay: 0.18, from: 329.63, to: 338, duration: 0.24, volume: 0.028, type: 'triangle' },
      { delay: 0.68, from: 392, to: 404, duration: 0.2, volume: 0.024, type: 'triangle' },
      { delay: 1.14, from: 246.94, duration: 0.32, volume: 0.022, type: 'sine' },
      { delay: 1.36, from: 349.23, to: 360, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 1.84, from: 440, to: 448, duration: 0.22, volume: 0.024, type: 'triangle' },
      { delay: 2.3, from: 293.66, duration: 0.3, volume: 0.022, type: 'sine' },
      { delay: 2.56, from: 392, to: 402, duration: 0.22, volume: 0.026, type: 'triangle' },
      { delay: 2.96, from: 493.88, to: 504, duration: 0.18, volume: 0.022, type: 'triangle' },
    ],
  },
  vietnam: {
    length: 2.8,
    events: [
      { delay: 0, from: 174.61, duration: 0.3, volume: 0.024, type: 'sine' },
      { delay: 0.12, from: 349.23, to: 362, duration: 0.18, volume: 0.03, type: 'square' },
      { delay: 0.38, from: 440, to: 454, duration: 0.18, volume: 0.03, type: 'square' },
      { delay: 0.68, from: 523.25, to: 540, duration: 0.2, volume: 0.028, type: 'triangle' },
      { delay: 1.02, from: 220, duration: 0.26, volume: 0.022, type: 'sine' },
      { delay: 1.18, from: 392, to: 406, duration: 0.18, volume: 0.03, type: 'square' },
      { delay: 1.48, from: 493.88, to: 507, duration: 0.18, volume: 0.03, type: 'square' },
      { delay: 1.78, from: 587.33, to: 604, duration: 0.2, volume: 0.028, type: 'triangle' },
      { delay: 2.12, from: 261.63, duration: 0.26, volume: 0.022, type: 'sine' },
      { delay: 2.28, from: 440, to: 454, duration: 0.18, volume: 0.03, type: 'square' },
    ],
  },
};

class SoundManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private activeRouteMusic: DestinationId | null = null;

  private ensureContext() {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.context) {
      this.context = new window.AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.15;
      this.master.connect(this.context.destination);
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 1.65;
      this.musicGain.connect(this.master);
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    return this.context;
  }

  private pulse(
    from: number,
    to: number,
    duration: number,
    volume: number,
    type: SoundShape,
    delay = 0,
    output: GainNode | null = this.master,
  ) {
    const context = this.ensureContext();
    if (!context || !output) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const stop = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(70, to), stop);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + duration * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);

    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(stop);
  }

  private scheduleRouteMusic(routeId: DestinationId) {
    const pattern = routeMusicPatterns[routeId];
    if (!pattern || !this.musicGain) {
      return;
    }

    pattern.events.forEach((event) => {
      this.pulse(
        event.from,
        event.to ?? event.from * 1.015,
        event.duration,
        event.volume,
        event.type,
        event.delay,
        this.musicGain,
      );
    });
  }

  startRunMusic(routeId: DestinationId) {
    const context = this.ensureContext();
    if (!context || !this.musicGain || typeof window === 'undefined') {
      return;
    }

    if (this.activeRouteMusic === routeId && this.musicTimer !== null) {
      return;
    }

    this.stopRunMusic();
    this.activeRouteMusic = routeId;
    this.scheduleRouteMusic(routeId);
    const intervalMs = routeMusicPatterns[routeId].length * 1000;
    this.musicTimer = window.setInterval(() => {
      this.scheduleRouteMusic(routeId);
    }, intervalMs);
  }

  stopRunMusic() {
    if (typeof window !== 'undefined' && this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
    }
    this.musicTimer = null;
    this.activeRouteMusic = null;
  }

  playMenu() {
    this.pulse(420, 680, 0.08, 0.026, 'triangle');
  }

  playJump() {
    this.pulse(320, 540, 0.09, 0.02, 'triangle');
  }

  playPickup(strong: boolean) {
    this.pulse(strong ? 620 : 500, strong ? 980 : 760, strong ? 0.11 : 0.08, 0.03, 'square');
  }

  playBump() {
    this.pulse(220, 120, 0.12, 0.022, 'sine');
  }

  playFinishApproach() {
    this.pulse(300, 520, 0.09, 0.018, 'triangle');
    this.pulse(520, 760, 0.12, 0.014, 'triangle', 0.08);
  }

  playWin() {
    this.pulse(420, 720, 0.12, 0.028, 'triangle');
    this.pulse(620, 980, 0.14, 0.024, 'triangle', 0.09);
    this.pulse(820, 1240, 0.18, 0.018, 'triangle', 0.18);
  }

  playLose() {
    this.pulse(240, 150, 0.14, 0.022, 'sine');
    this.pulse(180, 100, 0.18, 0.016, 'triangle', 0.08);
  }
}

export const soundManager = new SoundManager();
