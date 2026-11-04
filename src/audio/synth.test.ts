import { describe, expect, it } from 'vitest';
import { OfflineAudioContext } from 'web-audio-engine';
import { VoiceSynth, harmonicAmplitudes } from './synth';
import type { Sound } from '../music/types';

const sound: Sound = {
  volume: 1,
  brightness: 1,
  richness: 1,
  resonance: 1,
  vibrato: 0,
  harmonics: [1, 1, 1, 1, 1, 1, 1, 1],
};

describe('Web Audio voice', () => {
  it('suppresses out-of-band partials and keeps additive amplitudes normalized', () => {
    const levels = harmonicAmplitudes(sound, 4000, 44100);

    expect(levels.slice(4)).toEqual([0, 0, 0, 0]);
    expect(levels.reduce((sum, level) => sum + level, 0)).toBeCloseTo(1);

    expect(harmonicAmplitudes({ ...sound, harmonics: Array(8).fill(0) }, 440, 48000)).toEqual(
      Array(8).fill(0),
    );
  });

  it('renders audible notes, keeps rests silent, and stays below clipping at maximum settings', async () => {
    const offline = new OfflineAudioContext(1, 44100, 44100);
    const synth = new VoiceSynth(offline as unknown as AudioContext, sound);

    synth.note(67, 1, 0.1, true);
    synth.note(undefined, 0, 0.5, false);

    const buffer = await offline.startRendering();
    const data = buffer.getChannelData(0);

    const peak = (start: number, end: number) =>
      data
        .slice(start * 44100, end * 44100)
        .reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);

    expect(peak(0, 0.08)).toBe(0);
    expect(peak(0.15, 0.45)).toBeGreaterThan(0.01);
    expect(peak(0, 1)).toBeLessThan(0.8);
    expect(peak(0.8, 1)).toBeLessThan(0.0001);
  });
});
