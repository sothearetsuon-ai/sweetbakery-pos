// Web Audio API synthesizer for the classic "Happy Birthday To You" celebration melody
// Plays 100% offline with zero latency, accompanied by warm music box and chime harmonics

class BirthdaySynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;
  private currentTimeout: any = null;

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
        this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // Frequencies in Hz for C Major Happy Birthday
  // C4, D4, E4, F4, G4, A4, B4, C5
  private notes: { [key: string]: number } = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
  };

  // Melody notation: [note, duration in beats]
  // 3/4 time signature standard Happy Birthday
  private score: Array<[string, number]> = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['C5', 1.0], ['B4', 2.0], // Happy birthday to you
    ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['D5', 1.0], ['C5', 2.0], // Happy birthday to you
    ['G4', 0.75], ['G4', 0.25], ['G5', 1.0], ['E5', 1.0], ['C5', 1.0], ['B4', 1.0], ['A4', 1.5], // Happy birthday dear customer
    ['F5', 0.75], ['F5', 0.25], ['E5', 1.0], ['C5', 1.0], ['D5', 1.0], ['C5', 2.5], // Happy birthday to you!
  ];

  playTone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // Dual-oscillator bell/music-box chime harmonic
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle'; // Warm body
    osc2.type = 'sine';     // Clear pure chime harmonic

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1 octave overtone

    // ADSR envelope: fast attack, ringing bell decay
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.95);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);

    this.activeOscillators.push(osc1, osc2);

    const cleanDelay = Math.max(100, (startTime - this.ctx.currentTime + duration + 0.1) * 1000);
    setTimeout(() => {
      const idx1 = this.activeOscillators.indexOf(osc1);
      if (idx1 !== -1) this.activeOscillators.splice(idx1, 1);
      const idx2 = this.activeOscillators.indexOf(osc2);
      if (idx2 !== -1) this.activeOscillators.splice(idx2, 1);
    }, cleanDelay);
  }

  playMelody(onFinish?: () => void) {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      } catch (e) {}
    }
    const tempo = 110; // beats per minute
    const secondsPerBeat = 60 / tempo;

    let time = this.ctx.currentTime + 0.1;

    for (let i = 0; i < this.score.length; i++) {
      const [noteName, beats] = this.score[i];
      const freq = this.notes[noteName];
      const duration = beats * secondsPerBeat;

      this.playTone(freq, time, duration);
      time += duration;
    }

    const totalDurationMs = (time - this.ctx.currentTime) * 1000;
    this.currentTimeout = setTimeout(() => {
      this.isPlaying = false;
      onFinish?.();
    }, totalDurationMs);
  }

  stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.isPlaying = false;

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

  get active() {
    return this.isPlaying;
  }
}

export const birthdaySynth = new BirthdaySynthesizer();
