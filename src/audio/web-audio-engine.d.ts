declare module 'web-audio-engine' {
  export class OfflineAudioContext {
    constructor(channels: number, length: number, sampleRate: number);
    startRendering(): Promise<AudioBuffer>;
  }
}
