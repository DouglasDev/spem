import type { Ornament } from './types';

const gDiatonic = [0, 2, 4, 5, 7, 9, 11];

function neighbor(midi: number, direction: number) {
  let pitch = midi + direction;

  while (!gDiatonic.includes(((pitch % 12) + 12) % 12)) pitch += direction;

  return pitch;
}

export function ornamentStep(kind: Ornament, midi: number, phase: number, amount: number) {
  const step = Math.min(7, Math.floor(phase * 8));
  const upper = neighbor(midi, 1);
  const lower = neighbor(midi, -1);

  switch (kind) {
    case 'turn':
      return { midi: [upper, upper, midi, midi, lower, lower, midi, midi][step], gain: 1 };
    case 'division':
      return { midi: [midi, upper, midi, lower, midi, upper, lower, midi][step], gain: 1 };
    case 'trill':
      return { midi: step % 2 === 0 ? upper : midi, gain: 1 };
    case 'ratchet':
      return { midi, gain: step % 2 === 0 ? 1 : 1 - amount };
    case 'gate':
      return { midi, gain: step < 4 ? 1 : 1 - amount };
    case 'octave':
      return { midi: midi + (step === 2 || step === 3 || step === 6 ? 12 : 0), gain: 1 };
  }
}
