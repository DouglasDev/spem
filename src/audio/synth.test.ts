import { describe, expect, it } from 'vitest';
import { OfflineAudioContext } from 'web-audio-engine';
import { VoiceSynth, brassMix } from './synth';
import type { Sound } from '../music/types';

const sound: Sound = { volume: 1, brightness: 1, richness: 1, vibrato: 0 };

async function render(settings: Sound, off = 0.5) {
  const offline = new OfflineAudioContext(1, 44100, 44100);
  const synth = new VoiceSynth(offline as unknown as AudioContext, settings);

  synth.note(67, 1, 0.1, true);
  synth.note(undefined, 0, off, false);

  return (await offline.startRendering()).getChannelData(0);
}

function peak(data: Float32Array, start: number, end: number) {
  return data
    .slice(start * 44100, end * 44100)
    .reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
}

function edgeEnergy(data: Float32Array) {
  let sum = 0;

  for (let i = 9000; i < 20000; i++) sum += (data[i] - data[i - 1]) ** 2;

  return sum;
}

describe('Analog brass voice', () => {
  it('blends harmonic layers with normalized gain across the richness range', () => {
    for (const amount of [0, 0.2, 0.7, 1]) {
      const mix = brassMix(amount);

      expect(mix.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
      expect(mix.every((value) => value >= 0 && value <= 1)).toBe(true);
    }

    expect(brassMix(1)[1]).toBeGreaterThan(brassMix(0)[1]);
  });

  it('renders a sustained brass tone, preserves rests, and stays below clipping', async () => {
    const data = await render(sound);

    expect(peak(data, 0, 0.08)).toBe(0);
    expect(peak(data, 0.15, 0.45)).toBeGreaterThan(0.02);
    expect(peak(data, 0, 1)).toBeLessThan(0.8);
    expect(peak(data, 0.8, 1)).toBeLessThan(0.0001);
  });

  it('makes brightness audibly change upper-frequency energy and volume reach silence', async () => {
    const dark = await render({ ...sound, brightness: 0 });
    const bright = await render(sound);
    const muted = await render({ ...sound, volume: 0 });

    expect(edgeEnergy(bright)).toBeGreaterThan(edgeEnergy(dark) * 2);
    expect(peak(muted, 0.4, 1)).toBeLessThan(0.0001);
  });

  it('does not resurrect a short note when its scheduled brass envelope decays', async () => {
    const data = await render(sound, 0.13);

    expect(peak(data, 0.45, 1)).toBeLessThan(0.0001);
  });
});
