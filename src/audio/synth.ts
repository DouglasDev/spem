import type { Sound } from '../music/types';

export function harmonicAmplitudes(sound: Sound, frequency: number, sampleRate: number) {
  const values = sound.harmonics.map((level, i) => {
    if ((i + 1) * frequency > sampleRate * 0.45) return 0;

    return (
      (level * (i === 0 ? 1 : 0.15 + sound.richness * 1.65)) /
      (1 + i * (1 - sound.brightness) * 0.3)
    );
  });
  const sum = values.reduce((total, value) => total + value, 0);

  return values.map((value) => value / Math.max(1, sum));
}

export class VoiceSynth {
  private oscillators: OscillatorNode[] = [];
  private partials: GainNode[] = [];
  private filter: BiquadFilterNode;
  private vowel: BiquadFilterNode;
  private vowelLevel: GainNode;
  private envelope: GainNode;
  private master: GainNode;
  private vibrato: OscillatorNode;
  private vibratoDepth: GainNode;
  private frequency = 220;
  private lastMidi?: number;
  private lastGain = -1;

  constructor(
    readonly context: AudioContext,
    private sound: Sound,
  ) {
    const mix = context.createGain();
    const shaper = context.createWaveShaper();
    const curve = new Float32Array(1024);

    for (let i = 0; i < curve.length; i++) {
      const value = (i / (curve.length - 1)) * 2 - 1;

      curve[i] = Math.tanh(value * 1.15) / Math.tanh(1.15);
    }

    shaper.curve = curve;
    shaper.oversample = '2x';
    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.vowel = context.createBiquadFilter();
    this.vowel.type = 'bandpass';
    this.vowelLevel = context.createGain();
    this.envelope = context.createGain();
    this.envelope.gain.value = 0;
    this.master = context.createGain();
    this.vibrato = context.createOscillator();
    this.vibrato.frequency.value = 5.2;
    this.vibratoDepth = context.createGain();
    this.vibrato.connect(this.vibratoDepth);
    mix.connect(this.filter);
    mix.connect(this.vowel);
    this.vowel.connect(this.vowelLevel).connect(this.filter);

    this.filter
      .connect(shaper)
      .connect(this.envelope)
      .connect(this.master)
      .connect(context.destination);

    for (let i = 0; i < 8; i++) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.frequency.value = this.frequency * (i + 1);
      oscillator.connect(gain).connect(mix);
      this.vibratoDepth.connect(oscillator.detune);
      oscillator.start();
      this.oscillators.push(oscillator);
      this.partials.push(gain);
    }

    this.vibrato.start();
    this.update(sound);
  }

  update(sound: Sound) {
    this.sound = sound;

    const now = this.context.currentTime;

    this.filter.frequency.setTargetAtTime(450 + sound.brightness ** 2 * 12500, now, 0.025);
    this.filter.Q.setTargetAtTime(0.5 + sound.resonance * 2, now, 0.025);
    this.vowel.frequency.setTargetAtTime(550 + sound.resonance * 1650, now, 0.025);
    this.vowel.Q.setTargetAtTime(2 + sound.resonance * 7, now, 0.025);
    this.vowelLevel.gain.setTargetAtTime(0.35 + sound.resonance * 1.5, now, 0.025);
    this.master.gain.setTargetAtTime(sound.volume * 0.36, now, 0.025);
    this.vibratoDepth.gain.setTargetAtTime(sound.vibrato * 24, now, 0.05);
    this.setHarmonics(now);
  }

  private setHarmonics(time: number) {
    const amplitudes = harmonicAmplitudes(this.sound, this.frequency, this.context.sampleRate);

    amplitudes.forEach((level, i) => this.partials[i].gain.setTargetAtTime(level, time, 0.012));
  }

  note(midi: number | undefined, gain: number, time: number, attack: boolean) {
    if (midi !== undefined && midi !== this.lastMidi) {
      this.frequency = 440 * 2 ** ((midi - 69) / 12);

      this.oscillators.forEach((oscillator, i) =>
        oscillator.frequency.setTargetAtTime(this.frequency * (i + 1), time, 0.004),
      );

      this.setHarmonics(time);
    }

    const level = midi === undefined ? 0 : gain;

    if (attack && level > 0) {
      this.envelope.gain.setTargetAtTime(
        0,
        Math.max(this.context.currentTime, time - 0.008),
        0.002,
      );

      this.envelope.gain.setTargetAtTime(level, time, 0.012);
    } else if (level !== this.lastGain) this.envelope.gain.setTargetAtTime(level, time, 0.008);

    this.lastMidi = midi;
    this.lastGain = level;
  }

  silence() {
    this.envelope.gain.cancelScheduledValues(this.context.currentTime);
    this.envelope.gain.setTargetAtTime(0, this.context.currentTime, 0.008);
    this.lastMidi = undefined;
    this.lastGain = -1;

    for (const oscillator of this.oscillators)
      oscillator.frequency.cancelScheduledValues(this.context.currentTime);
    for (const partial of this.partials)
      partial.gain.cancelScheduledValues(this.context.currentTime);
  }

  dispose() {
    this.oscillators.forEach((oscillator) => oscillator.stop());
    this.vibrato.stop();
    this.master.disconnect();
  }
}
