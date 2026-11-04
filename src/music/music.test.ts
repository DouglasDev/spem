import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { choosePart, partWeights } from './assignment';
import { absoluteBeat, noteAt, phraseAt, position } from './timeline';
import { ornamentStep } from './ornaments';
import type { Ornament, Score } from './types';

const score: Score = JSON.parse(
  readFileSync(new URL('../../public/score/tallis.json', import.meta.url), 'utf8'),
);

describe('Complete Tallis transcription', () => {
  it('retains the source hash, all 40 parts and the complete measure span', () => {
    const source = readFileSync(new URL('../../public/score/tallis.mxl', import.meta.url));
    const report = JSON.parse(
      readFileSync(new URL('../../public/score/validation.json', import.meta.url), 'utf8'),
    );

    expect(createHash('sha256').update(source).digest('hex')).toBe(report.sourceSha256);
    expect(score.parts).toHaveLength(40);
    expect(score.beats / score.barBeats).toBe(138);
    expect(report.sourceNoteheads).toBe(9713);
    expect(report.mergedTieContinuations).toBe(570);
    expect(score.parts.reduce((sum, part) => sum + part.notes.length, 0)).toBe(9143);

    for (const [index, part] of score.parts.entries()) {
      expect(part.id).toBe(index);
      expect(part.choir).toBe(Math.floor(index / 5) + 1);
      expect(part.notes.at(-1)!.beat + part.notes.at(-1)!.duration).toBeLessThanOrEqual(552);
      expect(part.notes.at(-1)!.beat + part.notes.at(-1)!.duration).toBeGreaterThan(536);

      let end = 0;

      for (const note of part.notes) {
        expect(note.beat).toBeGreaterThanOrEqual(end);
        expect(note.duration).toBeGreaterThan(0);
        expect(note.midi).toBeGreaterThanOrEqual(41);
        expect(note.midi).toBeLessThanOrEqual(79);
        expect(note.beat * 8).toBeCloseTo(Math.round(note.beat * 8));

        end = note.beat + note.duration;
      }
    }
  });

  it('preserves the opening imitation, rests, and cross-bar tie', () => {
    expect(score.parts[0].notes[0]).toEqual({ beat: 2, duration: 3, midi: 74 });
    expect(score.parts[1].notes[0]).toEqual({ beat: 0, duration: 3, midi: 67 });
    expect(noteAt(score.parts[0].notes, 1.99)).toBeUndefined();
    expect(noteAt(score.parts[0].notes, 4.99)?.beat).toBe(2);
    expect(noteAt(score.parts[0].notes, 5)?.beat).toBe(5);
    expect(score.parts[2].notes[0].beat).toBe(18);
    expect(score.parts[39].notes[0]).toEqual({ beat: 149, duration: 1, midi: 43 });
  });
});

describe('Worldwide timeline', () => {
  it('wraps precisely at the end and locates a sustaining note on late entry', () => {
    const durationMs = (score.beats * 60000) / score.bpm;

    expect(position(score, score.epoch)).toBe(0);
    expect(position(score, score.epoch + durationMs)).toBeCloseTo(0, 5);
    expect(position(score, score.epoch - 60000 / score.bpm)).toBeCloseTo(551);

    expect(
      noteAt(score.parts[0].notes, position(score, score.epoch + (4 * 60000) / score.bpm))?.midi,
    ).toBe(74);

    expect(absoluteBeat(score, score.epoch + 2 * durationMs)).toBeCloseTo(1104, 5);
    expect(phraseAt(score, 156)).toBe(score.phrases.indexOf(156));
  });
});

describe('Weighted independent assignment', () => {
  it('only selects the opening alto while other parts are silent', () => {
    // The first phrase includes the soprano entrance, so test the opening window alone.
    const opening = { ...score, phrases: [0, 2, ...score.phrases.filter((beat) => beat > 2)] };

    for (let seed = 0; seed < 200; seed++) expect(choosePart(opening, 0, seed)).toBe(1);
  });

  it('spreads large ensembles according to musical weights and remains deterministic', () => {
    const phrase = phraseAt(score, 156);
    const weights = partWeights(score, phrase);
    const total = weights.reduce((sum, value) => sum + value, 0);
    const counts = Array<number>(40).fill(0);

    for (let seed = 0; seed < 20000; seed++) counts[choosePart(score, phrase, seed)]++;

    weights.forEach((weight, index) =>
      expect(Math.abs(counts[index] / 20000 - weight / total)).toBeLessThan(0.012),
    );

    expect(choosePart(score, phrase, 1234)).toBe(choosePart(score, phrase, 1234));
    expect(counts.filter(Boolean).length).toBeGreaterThan(20);
    expect(Math.max(...counts)).toBeGreaterThan(1); // Deliberate duplicates, not occupancy coordination.
  });
});

describe('Anchored ornament figures', () => {
  it('keeps figures bounded and produces both Renaissance and EDM transformations', () => {
    const kinds: Ornament[] = ['turn', 'division', 'trill', 'ratchet', 'gate', 'octave'];

    for (const kind of kinds) {
      for (let step = 0; step < 8; step++) {
        const result = ornamentStep(kind, 67, step / 8, 0.8);

        expect(result.midi).toBeGreaterThanOrEqual(65);
        expect(result.midi).toBeLessThanOrEqual(79);
        expect(result.gain).toBeGreaterThanOrEqual(0);
        expect(result.gain).toBeLessThanOrEqual(1);
      }
    }

    expect(ornamentStep('turn', 67, 0, 1).midi).toBe(69);
    expect(ornamentStep('gate', 67, 0.75, 1).gain).toBe(0);
    expect(ornamentStep('octave', 67, 0.25, 1).midi).toBe(79);
  });
});
