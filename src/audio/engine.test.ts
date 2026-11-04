import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Score, Sound } from '../music/types';
import type { SharedClock } from '../sync/clock';
import { EnsembleEngine } from './engine';

const harness = vi.hoisted(() => ({
  note: vi.fn(),
  silence: vi.fn(),
  dispose: vi.fn(),
  settings: {
    mode: 'fixed' as 'auto' | 'fixed',
    part: 0,
    seed: 123,
    offset: 0,
    amount: 1,
    sound: {} as Sound,
  },
  listener: undefined as undefined | ((state: unknown, previous: unknown) => void),
}));

vi.mock('./synth', () => ({
  VoiceSynth: class {
    note = harness.note;
    silence = harness.silence;
    dispose = harness.dispose;

    update() {}
  },
}));

vi.mock('../state/settings', () => ({
  useSettings: {
    getState: () => harness.settings,
    subscribe: (listener: (state: unknown, previous: unknown) => void) => {
      harness.listener = listener;

      return () => {
        harness.listener = undefined;
      };
    },
  },
}));

const score: Score = JSON.parse(
  readFileSync(new URL('../../public/score/tallis.json', import.meta.url), 'utf8'),
);

let latency = 0;

class Context {
  state = 'running';
  baseLatency = 0;

  get outputLatency() {
    return latency;
  }

  onstatechange?: () => void;

  get currentTime() {
    return performance.now() / 1000;
  }

  getOutputTimestamp() {
    return {
      contextTime: Math.max(0, this.currentTime - latency),
      performanceTime: performance.now(),
    };
  }

  async resume() {}

  async close() {}
}

let hidden = false;
let visibility: (() => void) | undefined;
let engine: EnsembleEngine;
let skew = 0;
let revision = 0;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
  vi.clearAllMocks();
  hidden = false;
  latency = 0;
  skew = 0;
  revision = 0;
  harness.settings.part = 0;
  harness.settings.mode = 'fixed';
  harness.settings.amount = 1;
  harness.settings.offset = 0;
  vi.stubGlobal('AudioContext', Context);
  vi.stubGlobal('navigator', {});

  vi.stubGlobal('document', {
    get hidden() {
      return hidden;
    },
    addEventListener: (_event: string, listener: () => void) => {
      visibility = listener;
    },
    removeEventListener: () => {},
  });

  const clock = {
    now: () => score.epoch + performance.now() + skew,
    available: () => true,
    get revision() {
      return revision;
    },
    sync: vi.fn(),
  };

  engine = new EnsembleEngine(score, clock as unknown as SharedClock, () => {});
});

afterEach(() => {
  engine.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Audio scheduling and recovery', () => {
  it('schedules ahead far enough for slow outputs and negative manual compensation', async () => {
    latency = 0.6;
    harness.settings.offset = -100;

    await engine.join();
    await vi.advanceTimersByTimeAsync(2800);

    const sounding = harness.note.mock.calls.find(([midi]) => midi === 74);

    expect(sounding).toBeDefined();
    expect(sounding![2]).toBeCloseTo((2 * 60) / score.bpm - 0.7, 3);
  });

  it('joins mid-score, preserves the opening rest, and does not reattack a tied note', async () => {
    await engine.join();
    await vi.advanceTimersByTimeAsync(2800);

    const notes = harness.note.mock.calls.filter(([midi]) => midi !== undefined);

    expect(notes).toHaveLength(1);
    expect(notes[0][0]).toBe(74);
    expect(notes[0][2]).toBeCloseTo((2 * 60) / score.bpm, 3);
  });

  it('stops scheduled sound on hiding and rejoins at the new score position', async () => {
    await engine.join();
    await vi.advanceTimersByTimeAsync(3000);

    hidden = true;
    visibility?.();

    const count = harness.note.mock.calls.length;

    await vi.advanceTimersByTimeAsync(5000);

    expect(harness.note).toHaveBeenCalledTimes(count);
    expect(harness.silence).toHaveBeenCalled();

    hidden = false;
    await engine.join();
    await vi.advanceTimersByTimeAsync(500);

    const last = harness.note.mock.calls.at(-1)!;

    expect(last[2]).toBeGreaterThan(8);
  });

  it('preserves rests under ornaments and returns a sounding line to its score within a beat', async () => {
    await engine.join();

    engine.trigger('octave');

    await vi.advanceTimersByTimeAsync(1500);

    expect(harness.note.mock.calls.every(([midi]) => midi === undefined)).toBe(true);

    engine.pause();
    harness.settings.part = 1;
    await engine.join();

    engine.trigger('octave');

    await vi.advanceTimersByTimeAsync(2800);

    expect(harness.note.mock.calls.some(([midi]) => midi === 79)).toBe(true);
    expect(harness.note.mock.calls.at(-1)?.[0]).toBe(67);
  });

  it('clears future events and replaces the voice after a fixed part change', async () => {
    harness.settings.part = 1;

    await engine.join();
    await vi.advanceTimersByTimeAsync(3000);

    const previous = { ...harness.settings };

    harness.settings.part = 0;
    harness.listener?.(harness.settings, previous);

    await vi.advanceTimersByTimeAsync(500);

    expect(harness.note.mock.calls.at(-1)?.[0]).toBe(74);
    expect(harness.silence.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('flushes a corrected clock and handles loop rollover', async () => {
    skew = (score.beats * 60000) / score.bpm - 500;

    await engine.join();
    await vi.advanceTimersByTimeAsync(1300);

    expect(harness.note.mock.calls.at(-1)?.[0]).toBeUndefined();

    const silences = harness.silence.mock.calls.length;

    skew += 200;
    revision++;

    await vi.advanceTimersByTimeAsync(100);

    expect(harness.silence.mock.calls.length).toBeGreaterThan(silences);
  });
});
