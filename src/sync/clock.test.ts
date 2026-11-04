import { afterEach, describe, expect, it, vi } from 'vitest';
import { estimate, SharedClock } from './clock';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Clock estimation', () => {
  it('prefers the lowest RTT sample and reports network uncertainty', () => {
    const result = estimate([
      { start: 0, end: 200, utc: 10100 },
      { start: 300, end: 320, utc: 10310 },
    ]);

    expect(result.offset).toBe(10000);
    expect(result.uncertainty).toBeGreaterThanOrEqual(10);
    expect(() => estimate([])).toThrow();
  });

  it('ignores an incorrect phone wall clock after external sync', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
    vi.spyOn(Date, 'now').mockReturnValue(1);

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ unix_ms: 1790000000000 + performance.now() }), {
            status: 200,
          }),
      ),
    );

    const clock = new SharedClock(() => {});
    const pending = clock.sync();

    await vi.advanceTimersByTimeAsync(5000);
    await pending;

    expect(clock.state.status).toBe('synced');
    expect(clock.now()).toBe(1790000005000);

    clock.dispose();
  });

  it('retains its last estimate after service failure and backs off on rate limiting', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ unix_ms: 1790000000000 + performance.now() })),
    );

    vi.stubGlobal('fetch', fetcher);

    const clock = new SharedClock(() => {});
    const first = clock.sync();

    await vi.advanceTimersByTimeAsync(5000);
    await first;

    fetcher.mockImplementation(async () => new Response('{}', { status: 429 }));

    await clock.sync();

    expect(clock.state.status).toBe('degraded');
    expect(clock.available()).toBe(true);

    const calls = fetcher.mock.calls.length;

    await vi.advanceTimersByTimeAsync(1000);

    expect(fetcher).toHaveBeenCalledTimes(calls);

    clock.dispose();
  });

  it('rejects cached timestamps and offers local time explicitly', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"unix_ms":1790000000000}', { headers: { Age: '4' } })),
    );

    const clock = new SharedClock(() => {});
    const pending = clock.sync();

    await vi.advanceTimersByTimeAsync(5000);
    await pending;

    expect(clock.state.status).toBe('unavailable');
    expect(() => clock.now()).toThrow();

    clock.useLocal();

    expect(clock.state.status).toBe('local');
    expect(clock.now()).toBeCloseTo(Date.now(), -1);

    clock.dispose();
  });
});
