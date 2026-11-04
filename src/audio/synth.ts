import type { Sound } from '../music/types';

export function brassMix(richness: number) {
  const amounts = [0.55, richness * 0.5, richness * 0.22, (1 - richness) * 0.42];
  const total = amounts.reduce((sum, value) => sum + value, 0);

  return amounts.map((value) => value / total);
}

export class VoiceSynth {
  private oscillators: OscillatorNode[] = [];
  private layers: GainNode[] = [];
  private filter: BiquadFilterNode;
  private smoothing: BiquadFilterNode;
  private envelope: GainNode;
  private master: GainNode;
  private vibrato: OscillatorNode;
  private vibratoDepth: GainNode;
  private drift: OscillatorNode;
  private driftDepth: GainNode;
  private lastMidi?: number;
  private lastGain = -1;

  constructor(
    readonly context: AudioContext,
    private sound: Sound,
  ) {
    const mix = context.createGain();
    const shaper = context.createWaveShaper();
    const curve = new Float32Array(2048);

    for (let i = 0; i < curve.length; i++) {
      const value = (i / (curve.length - 1)) * 2 - 1;

      curve[i] = Math.tanh(value * 2.1) / Math.tanh(2.1);
    }

    shaper.curve = curve;
    shaper.oversample = '4x';
    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.smoothing = context.createBiquadFilter();
    this.smoothing.type = 'lowpass';
    this.smoothing.Q.value = 0.55;
    this.envelope = context.createGain();
    this.envelope.gain.value = 0;
    this.master = context.createGain();
    this.vibrato = context.createOscillator();
    this.vibrato.frequency.value = 5.1;
    this.vibratoDepth = context.createGain();
    this.vibrato.connect(this.vibratoDepth);
    this.drift = context.createOscillator();
    this.drift.frequency.value = 0.17;
    this.driftDepth = context.createGain();
    this.driftDepth.gain.value = 2.4;
    this.drift.connect(this.driftDepth);

    mix
      .connect(this.filter)
      .connect(this.smoothing)
      .connect(shaper)
      .connect(this.envelope)
      .connect(this.master)
      .connect(context.destination);

    const waves: OscillatorType[] = ['sawtooth', 'sawtooth', 'square', 'triangle'];
    const detunes = [-3, 5.5, -6.5, 0];

    for (let i = 0; i < waves.length; i++) {
      const oscillator = context.createOscillator();
      const layer = context.createGain();

      oscillator.type = waves[i];
      oscillator.frequency.value = 220;
      oscillator.detune.value = detunes[i];
      oscillator.connect(layer).connect(mix);
      this.vibratoDepth.connect(oscillator.detune);
      this.driftDepth.connect(oscillator.detune);
      oscillator.start();
      this.oscillators.push(oscillator);
      this.layers.push(layer);
    }

    this.vibrato.start();
    this.drift.start();
    this.update(sound);
  }

  private cutoff() {
    return Math.min(this.context.sampleRate * 0.4, 360 * 2 ** (this.sound.brightness * 4.5));
  }

  update(sound: Sound) {
    this.sound = sound;

    const now = this.context.currentTime;

    this.filter.frequency.setTargetAtTime(this.cutoff(), now, 0.035);
    this.filter.Q.setTargetAtTime(0.7 + sound.richness * 0.45, now, 0.035);

    this.smoothing.frequency.setTargetAtTime(
      Math.min(this.context.sampleRate * 0.42, this.cutoff() * 1.65),
      now,
      0.035,
    );

    this.master.gain.setTargetAtTime(sound.volume * 0.48, now, 0.025);
    this.vibratoDepth.gain.setTargetAtTime(sound.vibrato ** 1.4 * 42, now, 0.05);

    brassMix(sound.richness).forEach((level, i) =>
      this.layers[i].gain.setTargetAtTime(level, now, 0.03),
    );
  }

  note(midi: number | undefined, gain: number, time: number, attack: boolean) {
    if (midi !== undefined && midi !== this.lastMidi) {
      const frequency = 440 * 2 ** ((midi - 69) / 12);

      this.oscillators.forEach((oscillator) =>
        oscillator.frequency.setTargetAtTime(frequency, time, 0.009),
      );
    }

    const level = midi === undefined ? 0 : gain;

    if (attack && level > 0) {
      const cutoff = this.cutoff();
      const peak = Math.min(
        this.context.sampleRate * 0.42,
        cutoff * (1.65 + this.sound.richness * 0.6),
      );

      this.envelope.gain.cancelScheduledValues(time);

      this.envelope.gain.setTargetAtTime(
        0,
        Math.max(this.context.currentTime, time - 0.009),
        0.002,
      );

      this.envelope.gain.setTargetAtTime(level, time, 0.014);
      this.envelope.gain.setTargetAtTime(level * 0.76, time + 0.075, 0.12);
      this.filter.frequency.cancelScheduledValues(time);
      this.filter.frequency.setValueAtTime(Math.max(100, cutoff * 0.46), time);
      this.filter.frequency.exponentialRampToValueAtTime(peak, time + 0.045);
      this.filter.frequency.setTargetAtTime(cutoff, time + 0.05, 0.14);
    } else if (level !== this.lastGain) {
      this.envelope.gain.cancelScheduledValues(time);
      this.envelope.gain.setTargetAtTime(level * 0.76, time, 0.012);
    }

    this.lastMidi = midi;
    this.lastGain = level;
  }

  silence() {
    const now = this.context.currentTime;

    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setTargetAtTime(0, now, 0.008);
    this.filter.frequency.cancelScheduledValues(now);
    this.lastMidi = undefined;
    this.lastGain = -1;

    for (const oscillator of this.oscillators) oscillator.frequency.cancelScheduledValues(now);
  }

  dispose() {
    this.oscillators.forEach((oscillator) => oscillator.stop());
    this.vibrato.stop();
    this.drift.stop();
    this.master.disconnect();
  }
}
