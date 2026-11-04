export interface ClockSample {
  start: number;
  end: number;
  utc: number;
}

export interface ClockState {
  status: 'checking' | 'synced' | 'degraded' | 'unavailable' | 'local';
  uncertainty: number;
  message: string;
}

export function estimate(samples: ClockSample[]) {
  const valid = samples.filter(
    (sample) => Number.isFinite(sample.utc) && sample.utc > 0 && sample.end >= sample.start,
  );
  const best = [...valid].sort((a, b) => a.end - a.start - (b.end - b.start))[0];

  if (!best) throw new Error('No valid time samples');

  const offset = best.utc - (best.start + best.end) / 2;
  const spread =
    valid.length > 1
      ? Math.min(
          1000,
          Math.max(
            ...valid.map((sample) =>
              Math.abs(sample.utc - (sample.start + sample.end) / 2 - offset),
            ),
          ),
        )
      : 0;

  return { offset, uncertainty: (best.end - best.start) / 2 + Math.max(2, spread) };
}

export class SharedClock {
  revision = 0;
  private offset?: number;
  private syncedAt = 0;
  private failures = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private disposed = false;
  private pending?: Promise<void>;
  state: ClockState = {
    status: 'checking',
    uncertainty: Infinity,
    message: 'Checking shared time',
  };

  constructor(private changed: (state: ClockState) => void) {}

  now() {
    if (this.offset === undefined) throw new Error('Shared time is unavailable');

    return performance.now() + this.offset;
  }

  available() {
    return this.offset !== undefined;
  }

  uncertainty() {
    return this.state.uncertainty + (performance.now() - this.syncedAt) * 0.00005;
  }

  useLocal() {
    this.revision++;
    this.offset = Date.now() - performance.now();
    this.syncedAt = performance.now();

    this.setState({
      status: 'local',
      uncertainty: Infinity,
      message: 'Unsynchronized · phone clock',
    });
  }

  sync() {
    if (this.pending) return this.pending;

    this.pending = this.measure().finally(() => {
      this.pending = undefined;
    });

    return this.pending;
  }

  private async measure() {
    const samples: ClockSample[] = [];
    let errorMessage = 'Time service unavailable';

    if (this.timer) clearTimeout(this.timer);

    for (let i = 0; i < 3 && !this.disposed; i++) {
      try {
        if (i > 0) await new Promise((resolve) => setTimeout(resolve, 550 + Math.random() * 900));

        const start = performance.now();
        const response = await fetch(`https://utctime.app/api/now?nonce=${crypto.randomUUID()}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        });

        if (response.status === 429) {
          errorMessage = 'Time service busy · retrying shortly';
          break;
        }

        if (!response.ok) throw new Error('Time response failed');

        const data: unknown = await response.json();
        const end = performance.now();

        if (
          !data ||
          typeof data !== 'object' ||
          !('unix_ms' in data) ||
          typeof data.unix_ms !== 'number' ||
          !Number.isFinite(data.unix_ms)
        )
          throw new Error('Invalid time response');
        if (Number(response.headers.get('Age') ?? 0) > 0) throw new Error('Cached time response');

        samples.push({ start, end, utc: data.unix_ms });
      } catch {
        /* Retain a prior estimate when requests fail. */
      }
    }

    if (this.disposed) return;

    if (samples.length) {
      const result = estimate(samples);

      this.offset = result.offset;
      this.revision++;
      this.syncedAt = performance.now();
      this.failures = 0;
      this.setState({ status: 'synced', uncertainty: result.uncertainty, message: 'Shared time' });
    } else {
      this.failures++;

      this.setState({
        ...this.state,
        status:
          this.offset === undefined
            ? 'unavailable'
            : this.state.status === 'local'
              ? 'local'
              : 'degraded',
        message: errorMessage,
      });
    }

    this.timer = setTimeout(
      () => void this.sync(),
      samples.length
        ? 60000 + Math.random() * 60000
        : Math.min(300000, 10000 * 2 ** this.failures) + Math.random() * 20000,
    );
  }

  private setState(state: ClockState) {
    this.state = state;
    this.changed(state);
  }

  dispose() {
    this.disposed = true;

    if (this.timer) clearTimeout(this.timer);
  }
}
