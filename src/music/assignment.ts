import { modulo, noteAt } from './timeline';
import type { Score } from './types';

export function randomFor(seed: number, index: number) {
  let hash = (seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;

  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);

  return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
}

export function partWeights(score: Score, phrase: number) {
  const start = score.phrases[phrase];
  const end = score.phrases[phrase + 1] ?? score.beats;

  return score.parts.map((part) => {
    const notes = part.notes.filter((note) => note.beat < end && note.beat + note.duration > start);
    const activity = notes.reduce(
      (sum, note) => sum + Math.min(end, note.beat + note.duration) - Math.max(start, note.beat),
      0,
    );
    const movement = notes
      .slice(1)
      .reduce((sum, note, i) => sum + Math.min(7, Math.abs(note.midi - notes[i].midi)), 0);
    const register = part.id % 5 === 0 || part.id % 5 === 4 ? 1.2 : 1;

    return activity === 0 ? 0 : register * (activity + notes.length * 0.9 + movement * 0.12);
  });
}

export function choosePart(score: Score, phrase: number, seed: number, previous?: number) {
  const weights = partWeights(score, phrase);

  if (previous !== undefined && weights[previous] > 0) weights[previous] *= 1.8;

  const total = weights.reduce((sum, value) => sum + value, 0);

  if (!total) return previous ?? modulo(seed, score.parts.length);

  let target = randomFor(seed, phrase) * total;

  for (let i = 0; i < weights.length; i++) {
    target -= weights[i];

    if (target < 0) return i;
  }

  return weights.findLastIndex((value) => value > 0);
}

export function activeParts(score: Score, beat: number) {
  return score.parts.map((part) => Boolean(noteAt(part.notes, beat)));
}
