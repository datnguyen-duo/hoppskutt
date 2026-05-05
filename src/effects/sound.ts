import type { DestinationId } from '../state/types';

type SoundShape = 'sine' | 'triangle' | 'square' | 'sawtooth';

type DrillMusicProfile = {
  bpm: number;
  root: number;
  lead: number[];
  bass: number[];
  hatRolls: number[];
};

const routeMusicProfiles: Record<DestinationId, DrillMusicProfile> = {
  maryland: {
    bpm: 138,
    root: 146.83,
    lead: [12, 15, 10, 7, 12, 19, 15, 10],
    bass: [0, -5, -2, -7],
    hatRolls: [7],
  },
  'rhode-island': {
    bpm: 142,
    root: 155.56,
    lead: [12, 10, 15, 7, 3, 10, 15, 19],
    bass: [0, -2, -7, -5],
    hatRolls: [3.5, 7],
  },
  colorado: {
    bpm: 144,
    root: 164.81,
    lead: [12, 15, 17, 10, 7, 10, 15, 22],
    bass: [0, -7, -5, -2],
    hatRolls: [3, 6.5, 7],
  },
  greece: {
    bpm: 146,
    root: 174.61,
    lead: [12, 10, 7, 15, 19, 15, 10, 3],
    bass: [0, -5, -8, -2],
    hatRolls: [2.75, 5.5, 7],
  },
  sweden: {
    bpm: 148,
    root: 185,
    lead: [12, 15, 10, 3, 7, 10, 15, 22],
    bass: [0, -2, -5, -10],
    hatRolls: [2.5, 4.5, 7],
  },
  vietnam: {
    bpm: 150,
    root: 196,
    lead: [12, 10, 15, 22, 19, 15, 10, 7],
    bass: [0, -7, -2, -12],
    hatRolls: [1.75, 3.5, 5.5, 7],
  },
  'rainbow-bridge': {
    bpm: 132,
    root: 220,
    lead: [12, 16, 19, 24, 19, 16, 14, 12],
    bass: [0, 7, 5, 12],
    hatRolls: [4, 7],
  },
};

class SoundManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private activeRouteMusic: DestinationId | null = null;

  private getLoopLength(routeId: DestinationId) {
    return (60 / routeMusicProfiles[routeId].bpm) * 8;
  }

  private note(root: number, semitones: number) {
    return root * 2 ** (semitones / 12);
  }

  private ensureContext() {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.context) {
      this.context = new window.AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.48;
      this.master.connect(this.context.destination);
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 1.18;
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

  private noiseBurst(
    duration: number,
    volume: number,
    delay = 0,
    output: GainNode | null = this.master,
    cutoff = 3800,
  ) {
    const context = this.ensureContext();
    if (!context || !output) {
      return;
    }

    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const samples = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const fade = 1 - index / frameCount;
      samples[index] = (Math.random() * 2 - 1) * fade;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const stop = start + duration;

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(cutoff, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    source.start(start);
    source.stop(stop);
  }

  private pluck(
    frequency: number,
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
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const stop = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.985, stop);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, start);
    filter.frequency.exponentialRampToValueAtTime(620, stop);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(stop);
  }

  private bass808(frequency: number, duration: number, volume: number, delay = 0) {
    const context = this.ensureContext();
    if (!context || !this.musicGain) {
      return;
    }

    const sine = context.createOscillator();
    const bite = context.createOscillator();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const stop = start + duration;

    sine.type = 'sine';
    bite.type = 'square';
    sine.frequency.setValueAtTime(frequency * 1.45, start);
    sine.frequency.exponentialRampToValueAtTime(frequency, start + 0.08);
    bite.frequency.setValueAtTime(frequency * 2, start);
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(240, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.024);
    gain.gain.exponentialRampToValueAtTime(volume * 0.34, start + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);

    sine.connect(lowpass);
    bite.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.musicGain);
    sine.start(start);
    bite.start(start);
    sine.stop(stop);
    bite.stop(stop);
  }

  private snare(delay = 0) {
    this.noiseBurst(0.12, 0.1, delay, this.musicGain, 1800);
    this.pulse(180, 126, 0.1, 0.045, 'triangle', delay, this.musicGain);
  }

  private hiHat(delay = 0, accented = false) {
    this.noiseBurst(accented ? 0.052 : 0.032, accented ? 0.05 : 0.034, delay, this.musicGain, 5200);
  }

  private scheduleDrillLoop(routeId: DestinationId) {
    const profile = routeMusicProfiles[routeId];
    if (!profile || !this.musicGain) {
      return;
    }

    const beat = 60 / profile.bpm;
    const halfBeat = beat / 2;
    const quarterBeat = beat / 4;
    const bassSteps = [0, 1.5, 3, 4.5, 6.25];
    const leadSteps = [0.25, 1.25, 2.75, 3.5, 4.25, 5.25, 6.75, 7.25];

    bassSteps.forEach((step, index) => {
      const interval = profile.bass[index % profile.bass.length];
      this.bass808(this.note(profile.root / 2, interval), beat * 0.88, 0.34, step * beat);
    });

    for (let step = 0; step < 16; step += 1) {
      this.hiHat(step * halfBeat, step % 4 === 0);
    }

    profile.hatRolls.forEach((step) => {
      this.hiHat(step * beat, true);
      this.hiHat(step * beat + quarterBeat, false);
      this.hiHat(step * beat + quarterBeat * 2, false);
    });

    this.snare(beat * 2);
    this.snare(beat * 6);

    leadSteps.forEach((step, index) => {
      const interval = profile.lead[index % profile.lead.length];
      const frequency = this.note(profile.root * 2, interval);
      this.pluck(frequency, beat * 0.42, 0.09, index % 3 === 0 ? 'square' : 'triangle', step * beat, this.musicGain);
    });

    this.pluck(this.note(profile.root * 4, 3), beat * 0.32, 0.045, 'sawtooth', beat * 3.75, this.musicGain);
    this.pluck(this.note(profile.root * 4, 10), beat * 0.28, 0.04, 'triangle', beat * 7.5, this.musicGain);
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
    this.scheduleDrillLoop(routeId);
    const intervalMs = this.getLoopLength(routeId) * 1000;
    this.musicTimer = window.setInterval(() => {
      this.scheduleDrillLoop(routeId);
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
    this.pulse(420, 760, 0.08, 0.05, 'square');
  }

  playJump() {
    this.pulse(320, 620, 0.09, 0.05, 'triangle');
  }

  playPickup(strong: boolean) {
    this.pulse(strong ? 640 : 520, strong ? 1180 : 860, strong ? 0.12 : 0.08, 0.07, 'square');
  }

  playBump() {
    this.pulse(220, 96, 0.14, 0.065, 'sawtooth');
  }

  playFinishApproach() {
    this.pulse(300, 520, 0.09, 0.05, 'triangle');
    this.pulse(520, 760, 0.12, 0.04, 'triangle', 0.08);
  }

  playWin() {
    this.pulse(420, 720, 0.12, 0.07, 'triangle');
    this.pulse(620, 980, 0.14, 0.06, 'triangle', 0.09);
    this.pulse(820, 1240, 0.18, 0.05, 'triangle', 0.18);
  }

  playLose() {
    this.pulse(240, 120, 0.16, 0.065, 'sawtooth');
    this.pulse(180, 84, 0.2, 0.04, 'triangle', 0.08);
  }
}

export const soundManager = new SoundManager();
