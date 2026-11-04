import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Sound } from '../music/types';

export const defaultSound: Sound = {
  volume: 0.55,
  brightness: 0.36,
  richness: 0.42,
  resonance: 0.3,
  vibrato: 0.2,
  harmonics: [1, 0.55, 0.3, 0.22, 0.12, 0.08, 0.04, 0.02],
};

interface Settings {
  sound: Sound;
  mode: 'auto' | 'fixed';
  part: number;
  seed: number;
  offset: number;
  amount: number;
  setSound: (patch: Partial<Sound>) => void;
  setMode: (mode: 'auto' | 'fixed') => void;
  setPart: (part: number) => void;
  setOffset: (offset: number) => void;
  setAmount: (amount: number) => void;
  resetSound: () => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      sound: { ...defaultSound, harmonics: [...defaultSound.harmonics] },
      mode: 'auto',
      part: 0,
      seed: crypto.getRandomValues(new Uint32Array(1))[0],
      offset: 0,
      amount: 0.8,
      setSound: (patch) => set((state) => ({ sound: { ...state.sound, ...patch } })),
      setMode: (mode) => set({ mode }),
      setPart: (part) => set({ part, mode: 'fixed' }),
      setOffset: (offset) => set({ offset }),
      setAmount: (amount) => set({ amount }),
      resetSound: () => set({ sound: { ...defaultSound, harmonics: [...defaultSound.harmonics] } }),
    }),
    {
      name: 'spem-in-alium-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ sound, mode, part, seed, offset, amount }) => ({
        sound,
        mode,
        part,
        seed,
        offset,
        amount,
      }),
    },
  ),
);
