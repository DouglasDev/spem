import type { Note, Score } from './types';

export function modulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function absoluteBeat(score: Score, utcMs: number) {
  return ((utcMs - score.epoch) * score.bpm) / 60000;
}

export function position(score: Score, utcMs: number) {
  return modulo(absoluteBeat(score, utcMs), score.beats);
}

export function phraseAt(score: Score, beat: number) {
  let index = score.phrases.length - 1;

  while (index > 0 && score.phrases[index] > beat) index--;

  return index;
}

export function noteAt(notes: Note[], beat: number): Note | undefined {
  let lo = 0;
  let hi = notes.length;

  while (lo < hi) {
    const mid = (lo + hi) >>> 1;

    if (notes[mid].beat <= beat) lo = mid + 1;
    else hi = mid;
  }

  const note = notes[lo - 1];

  return note && beat < note.beat + note.duration - 1e-7 ? note : undefined;
}

export function pitchName(midi: number) {
  const names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

  return `${names[modulo(midi, 12)]}${Math.floor(midi / 12) - 1}`;
}
