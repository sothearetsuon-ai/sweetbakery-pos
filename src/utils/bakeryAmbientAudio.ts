// SweetBakery POS - 100% Offline Ambient Audio Engine
// Generates soothing bakery ambient melodies and cafe music using Web Audio API
// Runs completely offline with zero latency, zero CDN dependencies, and no 403 errors.

interface AmbientNote {
  freq: number;
  duration: number; // in seconds
  type?: OscillatorType;
  chime?: boolean;
}

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

export type BakerySoundtrackId = 'birthday' | 'cafe' | 'pastry' | 'acoustic';

class BakeryAmbientAudioEngine {
  private ctx: AudioContext | null = null;
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
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(level: number) {
    this.masterVolume = Math.max(0, Math.min(1, level));
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
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = type;
    osc2.type = isBell ? 'sine' : 'triangle';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(isBell ? freq * 2 : freq * 1.003, startTime); // subtle chorus/shimmer

    const peak = Math.max(0, (isBell ? 0.22 : 0.16) * this.masterVolume);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peak, startTime + (isBell ? 0.03 : 0.06));
    gainNode.gain.linearRampToValueAtTime(peak * 0.45, startTime + duration * 0.4);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration * 0.95);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Track 1: Happy Birthday Classic Celebration
  private getBirthdaySequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['A4', 'C4'], duration: 1.0 },
      { notes: ['G4'], duration: 1.0 },
      { notes: ['C5', 'E4'], duration: 1.1 },
      { notes: ['B4', 'G4'], duration: 2.2 },

      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['A4', 'C4'], duration: 1.0 },
      { notes: ['G4'], duration: 1.0 },
      { notes: ['D5', 'G4'], duration: 1.1 },
      { notes: ['C5', 'E4'], duration: 2.2 },

      { notes: ['G4'], duration: 0.8 },
      { notes: ['G4'], duration: 0.3 },
      { notes: ['G5', 'E4'], duration: 1.0 },
      { notes: ['E5', 'C4'], duration: 1.0 },
      { notes: ['C5', 'G4'], duration: 1.0 },
      { notes: ['B4', 'D4'], duration: 1.0 },
      { notes: ['A4', 'F4'], duration: 1.8 },

      { notes: ['F5'], duration: 0.8 },
      { notes: ['F5'], duration: 0.3 },
      { notes: ['E5', 'C4'], duration: 1.0 },
      { notes: ['C5', 'E4'], duration: 1.0 },
      { notes: ['D5', 'G4'], duration: 1.1 },
      { notes: ['C5', 'E4', 'G4'], duration: 2.6 },
    ];
  }

  // Track 2: Sweet Morning Cafe & Bakery (Chill, warm acoustic lounge melody)
  private getCafeSequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['C4', 'E4', 'G4'], duration: 1.8 },
      { notes: ['B4'], duration: 0.9 },
      { notes: ['G4'], duration: 0.9 },
      { notes: ['A4', 'C4', 'E4'], duration: 1.8 },
      { notes: ['E4'], duration: 0.9 },
      { notes: ['G4'], duration: 0.9 },
      { notes: ['F4', 'A4', 'C5'], duration: 2.0 },
      { notes: ['E4', 'G4'], duration: 1.0 },
      { notes: ['D4', 'F4'], duration: 1.0 },
      { notes: ['G4', 'B4', 'D5'], duration: 2.2 },

      { notes: ['E4', 'G4', 'C5'], duration: 1.8 },
      { notes: ['D5'], duration: 0.8 },
      { notes: ['C5'], duration: 0.8 },
      { notes: ['A4', 'C5'], duration: 1.8 },
      { notes: ['F4', 'A4'], duration: 1.6 },
      { notes: ['G4', 'B4', 'D5'], duration: 2.4 },
      { notes: ['C4', 'E4', 'G4', 'C5'], duration: 3.0 },
    ];
  }

  // Track 3: Relaxing Pastry Shop Melody (Peaceful french arpeggio)
  private getPastrySequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['F4', 'A4', 'C5'], duration: 1.8 },
      { notes: ['E5'], duration: 0.9 },
      { notes: ['C5'], duration: 0.9 },
      { notes: ['E4', 'G4', 'B4'], duration: 1.8 },
      { notes: ['D5'], duration: 0.9 },
      { notes: ['B4'], duration: 0.9 },
      { notes: ['D4', 'F4', 'A4'], duration: 2.0 },
      { notes: ['C5'], duration: 1.0 },
      { notes: ['A4'], duration: 1.0 },
      { notes: ['C4', 'E4', 'G4'], duration: 2.4 },

      { notes: ['A4', 'C5'], duration: 1.2 },
      { notes: ['B4', 'D5'], duration: 1.2 },
      { notes: ['C5', 'E5'], duration: 2.4 },
      { notes: ['G4', 'B4', 'D5'], duration: 2.0 },
      { notes: ['C4', 'E4', 'G4', 'C5'], duration: 3.2 },
    ];
  }

  // Track 4: Acoustic Garden Guitar (Warm melodic strums)
  private getAcousticSequence(): Array<{ notes: string[]; duration: number }> {
    return [
      { notes: ['G3', 'D4', 'G4', 'B4'], duration: 2.0 },
      { notes: ['C5'], duration: 0.8 },
      { notes: ['B4'], duration: 0.8 },
      { notes: ['C4', 'G4', 'C5', 'E5'], duration: 2.2 },
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
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentTrackId = trackId;

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

    let totalSeqDuration = sequence.reduce((acc, item) => acc + item.duration, 0);
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
  }

  public get active() {
    return this.isPlaying;
  }

  public get trackId() {
    return this.currentTrackId;
  }
}

export const bakeryAmbientAudio = new BakeryAmbientAudioEngine();
