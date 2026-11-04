import { useEffect, useRef, useState } from 'react';
import { EnsembleEngine, type PerformanceState } from '../audio/engine';
import { choosePart } from '../music/assignment';
import { phraseAt, position } from '../music/timeline';
import type { Score } from '../music/types';
import { useSettings } from '../state/settings';
import { SharedClock, type ClockState } from '../sync/clock';

const initialClock: ClockState = {
  status: 'checking',
  uncertainty: Infinity,
  message: 'Checking shared time',
};

export function usePerformance() {
  const [score, setScore] = useState<Score>();
  const [clockState, setClockState] = useState(initialClock);
  const [state, setState] = useState<PerformanceState>({
    playing: false,
    part: 0,
    beat: 0,
    interrupted: false,
  });
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const clock = useRef<SharedClock | null>(null);
  const engine = useRef<EnsembleEngine | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    const sharedClock = new SharedClock(setClockState);

    clock.current = sharedClock;
    void sharedClock.sync();

    void fetch(`${import.meta.env.BASE_URL}score/tallis.json`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error('The score could not be loaded. Refresh to try again.');

        return response.json();
      })
      .then((data: Score) => {
        if (
          !Array.isArray(data.parts) ||
          data.parts.length !== 40 ||
          !(data.beats > 0) ||
          !(data.bpm > 0)
        )
          throw new Error('Invalid score file');

        setScore(data);
        engine.current = new EnsembleEngine(data, sharedClock, setState);
      })
      .catch((reason: Error) => {
        if (!abort.signal.aborted) setError(reason.message);
      });

    return () => {
      abort.abort();
      engine.current?.dispose();
      engine.current = null;
      sharedClock.dispose();
    };
  }, []);

  useEffect(() => {
    if (!score || clockState.status === 'checking' || clockState.status === 'unavailable') return;

    const timer = setInterval(() => {
      setState((current) => {
        if (current.playing || !clock.current?.available()) return current;

        const beat = position(score, clock.current!.now());
        const settings = useSettings.getState();
        const part =
          settings.mode === 'fixed'
            ? settings.part
            : choosePart(score, phraseAt(score, beat), settings.seed);

        return { ...current, beat, part };
      });
    }, 150);

    return () => clearInterval(timer);
  }, [score, clockState.status]);

  async function toggle(local = false) {
    if (starting || !engine.current || !clock.current) return;

    if (state.playing) {
      engine.current.pause();

      return;
    }

    if (local) clock.current.useLocal();

    setError('');
    setStarting(true);

    try {
      await engine.current.join();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Audio could not start');
    } finally {
      setStarting(false);
    }
  }

  return { score, clockState, state, error, starting, engine, clock, toggle };
}
