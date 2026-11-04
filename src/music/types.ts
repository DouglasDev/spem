export interface Note {
  beat: number;
  duration: number;
  midi: number;
}

export interface Part {
  id: number;
  choir: number;
  name: string;
  notes: Note[];
}

export interface Score {
  version: string;
  title: string;
  attribution: string;
  source: string;
  license: string;
  epoch: number;
  bpm: number;
  beats: number;
  barBeats: number;
  phrases: number[];
  parts: Part[];
}

export type Ornament = 'turn' | 'division' | 'trill' | 'ratchet' | 'gate' | 'octave';

export interface Sound {
  volume: number;
  brightness: number;
  richness: number;
  resonance: number;
  vibrato: number;
  harmonics: number[];
}
