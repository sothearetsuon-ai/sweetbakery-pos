// SweetBakery POS - 100% Offline Ambient Audio Engine
// Generates soothing bakery ambient melodies and cafe music using Web Audio API
// Runs completely offline with zero latency, zero CDN dependencies, and no 403 errors.

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

export type BakerySoundtrackId = 'birthday' | 'cafe' | 'pastry' | 'acoustic';

class BakeryAmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentTrackId: BakerySoundtrackId = 'cafe';
  private masterVolume = 0.8;
  private currentTimeout: any = null;
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
  private onTrackEndedCallback?: () => void;
  private trackStartTime = 0;
  private trackDuration = 120;
  private intervalTicker: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  public setVolume(level: number) {
    this.masterVolume = Math.max(0, Math.min(1, level));
    if (this.masterGain && this.ctx && this.isPlaying) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  public setCallbacks(
    onTimeUpdate?: (currentTime: number, duration: number) => void,
    onEnded?: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onTrackEndedCallback = onEnded;
  }

  // Play a soft, warm polyphonic harmonic chord or bell note
  private playHarmonicNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'triangle',
    isBell = false
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = type;
    osc2.type = isBell ? 'sine' : 'triangle';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(isBell ? freq * 2 : freq * 1.003, startTime); // subtle chorus/shimmer

    const peak = isBell ? 0.22 : 0.16;
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(peak, startTime + (isBell ? 0.03 : 0.06));
    noteGain.gain.linearRampToValueAtTime(peak * 0.45, startTime + duration * 0.4);
    noteGain.gain.linearRampToValueAtTime(0.0001, startTime + duration * 0.95);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);

    this.activeOscillators.push(osc1, osc2);

    // Auto-remove reference from tracking array after stopping
    const cleanDelay = Math.max(100, (startTime - this.ctx.currentTime + duration + 0.1) * 1000);
    setTimeout(() => {
      const idx1 = this.activeOscillators.indexOf(osc1);
      if (idx1 !== -1) this.activeOscillators.splice(idx1, 1);
      const idx2 = this.activeOscillators.indexOf(osc2);
      if (idx2 !== -1) this.activeOscillators.splice(idx2, 1);
    }, cleanDelay);
  }

  // Track 1: Happy Birthday Classic Celebration
  private getBirthdaySequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['A4', 'C4'], duration: 1.0 },
      { notes: ['G4'], duration: 1.0 },
      { notes: ['C5', 'E4'], duration: 1.1 },
      { notes: ['B4', 'G4', 'D4'], duration: 2.2 },

      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['A4', 'D4'], duration: 1.0 },
      { notes: ['G4'], duration: 1.0 },
      { notes: ['D5', 'F4'], duration: 1.1 },
      { notes: ['C5', 'E4', 'G3'], duration: 2.4 },

      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['G5', 'C4', 'E4'], duration: 1.2 },
      { notes: ['E5', 'G4'], duration: 1.0 },
      { notes: ['C5', 'G3'], duration: 1.0 },
      { notes: ['B4', 'F4'], duration: 1.0 },
      { notes: ['A4', 'C4', 'E4'], duration: 2.0 },

      { notes: ['F5'], duration: 0.8 },
      { notes: ['F5'], duration: 0.3 },
      { notes: ['E5', 'C4', 'G4'], duration: 1.1 },
      { notes: ['C5', 'E4'], duration: 1.0 },
      { notes: ['D5', 'F4', 'G3'], duration: 1.2 },
      { notes: ['C5', 'E4', 'G4', 'C6'], duration: 3.5 },
    ];
  }

  // Track 2: Sweet Morning Cafe & Bakery (Gentle Lo-Fi Lounge)
  private getCafeSequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['C4', 'E4', 'G4', 'B4'], duration: 2.0 },
      { notes: ['E5'], duration: 1.0 },
      { notes: ['D5'], duration: 1.0 },
      { notes: ['A3', 'C4', 'E4', 'G4'], duration: 2.0 },
      { notes: ['C5'], duration: 1.2 },
      { notes: ['B4'], duration: 0.8 },

      { notes: ['F3', 'A3', 'C4', 'E4'], duration: 2.2 },
      { notes: ['G4', 'D5'], duration: 1.2 },
      { notes: ['G3', 'B3', 'D4', 'F4'], duration: 2.4 },
      { notes: ['E4', 'C5'], duration: 1.8 },

      { notes: ['C4', 'E4', 'G4'], duration: 1.8 },
      { notes: ['D4', 'F4', 'A4', 'C5'], duration: 2.0 },
      { notes: ['E4', 'G4', 'B4', 'D5'], duration: 2.4 },
      { notes: ['C4', 'G4', 'C5', 'E5'], duration: 3.2 },
    ];
  }

  // Track 3: Relaxing Pastry Shop Melody (Warm French Cafe Chimes)
  private getPastrySequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['E4', 'G4', 'B4'], duration: 1.2 },
      { notes: ['G4', 'B4', 'E5'], duration: 1.2 },
      { notes: ['D4', 'F4', 'A4'], duration: 1.2 },
      { notes: ['F4', 'A4', 'D5'], duration: 1.2 },

      { notes: ['C4', 'E4', 'G4'], duration: 1.5 },
      { notes: ['E4', 'G4', 'C5'], duration: 1.5 },
      { notes: ['B3', 'D4', 'G4'], duration: 1.8 },
      { notes: ['D4', 'G4', 'B4'], duration: 2.0 },

      { notes: ['A3', 'C4', 'E4', 'A4'], duration: 2.2 },
      { notes: ['F3', 'A3', 'C4', 'F4'], duration: 2.2 },
      { notes: ['G3', 'B3', 'D4', 'G4'], duration: 2.6 },
      { notes: ['C4', 'E4', 'G4', 'C5'], duration: 3.5 },
    ];
  }

  // Track 4: Acoustic Garden Guitar Melody
  private getAcousticSequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['C3', 'G3', 'C4', 'E4'], duration: 2.0 },
      { notes: ['G4'], duration: 0.8 },
      { notes: ['E4'], duration: 0.8 },
      { notes: ['A3', 'E4', 'A4', 'C5'], duration: 2.2 },
      { notes: ['D5'], duration: 0.9 },
      { notes: ['C5'], duration: 0.9 },
      { notes: ['E3', 'B3', 'E4', 'G4'], duration: 2.2 },
      { notes: ['D4', 'A4', 'D5', 'F5'], duration: 2.5 },

      { notes: ['G3', 'D4', 'B4'], duration: 1.4 },
      { notes: ['C4', 'E4', 'C5'], duration: 1.4 },
      { notes: ['D4', 'F4', 'D5'], duration: 1.8 },
      { notes: ['G3', 'D4', 'G4', 'B4', 'D5'], duration: 3.5 },
    ];
  }

  public play(trackId: BakerySoundtrackId = 'cafe') {
    return this.playTrack(trackId);
  }

  public playTrack(trackId: BakerySoundtrackId = 'cafe') {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentTrackId = trackId;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      } catch (e) {}
    }

    let sequence = this.getCafeSequence();
    let isBellTheme = false;
    if (trackId === 'birthday') {
      sequence = this.getBirthdaySequence();
      isBellTheme = true;
    } else if (trackId === 'pastry') {
      sequence = this.getPastrySequence();
    } else if (trackId === 'acoustic') {
      sequence = this.getAcousticSequence();
    }

    const totalSeqDuration = sequence.reduce((acc, item) => acc + item.duration, 0);
    // Multiply sequence to loop smoothly for 2-3 minutes per track
    const loopRepeats = Math.max(3, Math.ceil(120 / totalSeqDuration));
    this.trackDuration = totalSeqDuration * loopRepeats;
    this.trackStartTime = Date.now();

    let currentTime = this.ctx.currentTime + 0.05;

    for (let r = 0; r < loopRepeats; r++) {
      for (const step of sequence) {
        for (const noteName of step.notes) {
          const freq = NOTE_FREQS[noteName];
          if (freq) {
            this.playHarmonicNote(
              freq,
              currentTime,
              step.duration,
              r % 2 === 0 ? 'triangle' : 'sine',
              isBellTheme
            );
          }
        }
        currentTime += step.duration;
      }
    }

    // Ticker for progress time updates
    if (this.intervalTicker) clearInterval(this.intervalTicker);
    this.intervalTicker = setInterval(() => {
      if (!this.isPlaying) return;
      const elapsed = (Date.now() - this.trackStartTime) / 1000;
      this.onTimeUpdateCallback?.(Math.min(elapsed, this.trackDuration), this.trackDuration);
    }, 500);

    const totalMs = (currentTime - this.ctx.currentTime) * 1000;
    this.currentTimeout = setTimeout(() => {
      this.stop();
      this.onTrackEndedCallback?.();
    }, totalMs);
  }

  public stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.intervalTicker) {
      clearInterval(this.intervalTicker);
      this.intervalTicker = null;
    }
    this.isPlaying = false;

    // Instantly mute master gain node and stop all scheduled/active oscillators
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }

    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    }
    this.activeOscillators = [];
  }

  public get active() {
    return this.isPlaying;
  }

  public get trackId() {
    return this.currentTrackId;
  }
}

export const bakeryAmbientAudio = new BakeryAmbientAudioEngine();
