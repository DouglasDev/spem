import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Sound } from '../music/types';

export const defaultSound: Sound = {
  volume: 0.55,
  brightness: 0.57,
  richness: 0.68,
  vibrato: 0.18,
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
      sound: { ...defaultSound },
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
      resetSound: () => set({ sound: { ...defaultSound } }),
    }),
    {
      name: 'spem-in-alium-v1',
      version: 2,
      migrate: (previous) => {
        const saved = previous as Partial<Settings>;

        return {
          ...saved,
          sound: { ...defaultSound, volume: saved.sound?.volume ?? defaultSound.volume },
        };
      },
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
