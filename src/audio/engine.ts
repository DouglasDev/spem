import { choosePart } from '../music/assignment';
import { absoluteBeat, modulo, noteAt, phraseAt } from '../music/timeline';
import { ornamentStep } from '../music/ornaments';
import type { Ornament, Score } from '../music/types';
import { useSettings } from '../state/settings';
import type { SharedClock } from '../sync/clock';
import { VoiceSynth } from './synth';

export interface PerformanceState {
  playing: boolean;
  part: number;
  beat: number;
  midi?: number;
  ornament?: Ornament;
  interrupted: boolean;
}

export class EnsembleEngine {
  private context?: AudioContext;
  private synth?: VoiceSynth;
  private timer?: ReturnType<typeof setInterval>;
  private nextTick = 0;
  private phrase = -1;
  private part = 0;
  private playing = false;
  private lastKey = '';
  private lastClock = 0;
  private pending?: { kind: Ornament; start: number };
  private calibration = false;
  private lastPulse = -1;
  private pulses = new Set<OscillatorNode>();
  private clockRevision = -1;
  private wakeLock?: WakeLockSentinel;
  private unsubscribe: () => void;
  private settingMode = '';
  private audibleStates: { utc: number; state: PerformanceState }[] = [];

  constructor(
    private score: Score,
    private clock: SharedClock,
    private changed: (state: PerformanceState) => void,
  ) {
    this.unsubscribe = useSettings.subscribe((state, previous) => {
      if (state.sound !== previous.sound) this.synth?.update(state.sound);
      if (
        state.mode !== previous.mode ||
        state.part !== previous.part ||
        state.offset !== previous.offset
      )
        this.reschedule();
    });

    document.addEventListener('visibilitychange', this.visibility);
  }

  async join() {
    if (this.playing) return;
    this.context ??= new AudioContext({ latencyHint: 'interactive' });

    await this.context.resume();

    if (this.context.state !== 'running') throw new Error('Tap Join again to enable audio');

    this.synth ??= new VoiceSynth(this.context, useSettings.getState().sound);
    this.playing = true;

    this.context.onstatechange = () => {
      if (this.playing && this.context?.state !== 'running') this.pause(true);
    };

    this.reschedule();

    this.changed({
      playing: true,
      part: this.part,
      beat: modulo(absoluteBeat(this.score, this.clock.now()), this.score.beats),
      interrupted: false,
    });

    this.timer = setInterval(() => this.schedule(), 25);
    this.schedule();
    void this.keepAwake();
  }

  private async keepAwake() {
    try {
      this.wakeLock = await navigator.wakeLock?.request('screen');
    } catch {
      /* Unsupported or denied. */
    }
  }

  pause(interrupted = false) {
    this.playing = false;

    if (this.timer) clearInterval(this.timer);

    this.timer = undefined;
    this.synth?.silence();
    this.cancelPulses();
    this.pending = undefined;
    this.audibleStates = [];
    void this.wakeLock?.release();

    this.changed({
      playing: false,
      part: this.part,
      beat: this.clock.available()
        ? modulo(absoluteBeat(this.score, this.clock.now()), this.score.beats)
        : 0,
      interrupted,
    });
  }

  private visibility = () => {
    if (document.hidden && this.playing) this.pause(true);
    if (!document.hidden) void this.clock.sync();
  };

  private reschedule() {
    if (!this.playing) return;

    this.synth?.silence();
    this.cancelPulses();
    this.nextTick = Math.ceil(absoluteBeat(this.score, this.clock.now() + 180) * 8);
    this.phrase = -1;
    this.lastKey = '';
    this.pending = undefined;
    this.audibleStates = [];
    this.lastClock = this.clock.now();
    this.clockRevision = this.clock.revision;
  }

  trigger(kind: Ornament) {
    if (!this.playing) return;

    const safeBeat = absoluteBeat(this.score, this.clock.now() + 250);

    this.pending = { kind, start: Math.ceil(Math.max(safeBeat, this.nextTick / 8)) };
  }

  setCalibration(enabled: boolean) {
    this.calibration = enabled;
    this.lastPulse = -1;
    this.reschedule();
  }

  private audioTime(utc: number, now: number) {
    const context = this.context!;
    const offset = useSettings.getState().offset / 1000;
    const stamp = context.getOutputTimestamp?.();

    if (
      stamp &&
      typeof stamp.contextTime === 'number' &&
      typeof stamp.performanceTime === 'number' &&
      stamp.contextTime > 0 &&
      stamp.performanceTime > 0
    ) {
      return (
        stamp.contextTime + (performance.now() + utc - now - stamp.performanceTime) / 1000 + offset
      );
    }

    return (
      context.currentTime +
      (utc - now) / 1000 -
      (context.outputLatency || context.baseLatency || 0) +
      offset
    );
  }

  private schedule() {
    if (!this.playing || !this.context || !this.synth) return;

    const now = this.clock.now();
    const beat = absoluteBeat(this.score, now);

    if (
      this.clockRevision !== this.clock.revision ||
      now - this.lastClock > 1000 ||
      now < this.lastClock ||
      this.nextTick / 8 < beat - 0.5
    )
      this.reschedule();

    this.lastClock = now;

    while (this.audibleStates.length && this.audibleStates[0].utc <= now)
      this.changed(this.audibleStates.shift()!.state);

    const horizon = absoluteBeat(this.score, now + 300);

    while (this.nextTick / 8 < horizon) {
      const absolute = this.nextTick / 8;
      const current = modulo(absolute, this.score.beats);
      const phrase = phraseAt(this.score, current);
      const settings = useSettings.getState();
      const phraseKey =
        Math.floor(absolute / this.score.beats) * this.score.phrases.length + phrase;

      if (phraseKey !== this.phrase || settings.mode !== this.settingMode) {
        this.part =
          settings.mode === 'fixed'
            ? settings.part
            : choosePart(
                this.score,
                phrase,
                settings.seed,
                this.phrase < 0 ? undefined : this.part,
              );

        this.phrase = phraseKey;
        this.settingMode = settings.mode;
        this.lastKey = '';
      }

      const note = noteAt(this.score.parts[this.part].notes, current);
      let midi = note?.midi;
      let gain = 1;
      let ornament: Ornament | undefined;

      if (this.pending && absolute >= this.pending.start + 1) this.pending = undefined;

      if (
        midi !== undefined &&
        this.pending &&
        absolute >= this.pending.start &&
        settings.amount > 0 &&
        absolute < this.pending.start + 0.25 + settings.amount * 0.75
      ) {
        ornament = this.pending.kind;

        const transformed = ornamentStep(
          ornament,
          midi,
          (absolute - this.pending.start) / (0.25 + settings.amount * 0.75),
          settings.amount,
        );

        midi = transformed.midi;
        gain = transformed.gain;
      }

      const utc = this.score.epoch + (absolute * 60000) / this.score.bpm;
      const time = this.audioTime(utc, now);
      const key = `${this.part}:${note?.beat ?? 'rest'}:${midi}:${gain}:${this.calibration}`;

      if (time >= this.context.currentTime + 0.003) {
        if (this.calibration) {
          this.synth.note(undefined, 0, time, false);

          if (absolute % 1 === 0 && absolute !== this.lastPulse) {
            this.pulse(time);
            this.lastPulse = absolute;
          }
        } else if (key !== this.lastKey)
          this.synth.note(midi, gain, time, midi !== undefined && key !== this.lastKey);

        this.audibleStates.push({
          utc: utc + settings.offset,
          state: {
            playing: true,
            part: this.part,
            beat: current,
            midi,
            ornament,
            interrupted: false,
          },
        });

        this.lastKey = key;
      }

      this.nextTick++;
    }
  }

  private pulse(time: number) {
    const oscillator = this.context!.createOscillator();
    const gain = this.context!.createGain();

    oscillator.frequency.value = 1000;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08 * useSettings.getState().sound.volume, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    oscillator.connect(gain).connect(this.context!.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.05);
    this.pulses.add(oscillator);

    oscillator.onended = () => {
      gain.disconnect();
      this.pulses.delete(oscillator);
    };
  }

  private cancelPulses() {
    for (const pulse of this.pulses) {
      pulse.stop();
      pulse.disconnect();
    }

    this.pulses.clear();
  }

  dispose() {
    this.pause();
    this.unsubscribe();
    document.removeEventListener('visibilitychange', this.visibility);
    this.synth?.dispose();
    void this.context?.close();
  }
}
