import { describe, expect, it } from 'vitest';
import { padValues } from './XYPad';

const rect = { left: 10, top: 20, width: 226, height: 126 };

describe('Two-dimensional touch input', () => {
  it('maps the pad edges and center to volume/brightness coordinates', () => {
    expect(padValues(23, 33, rect)).toEqual({ x: 0, y: 1 });
    expect(padValues(223, 133, rect)).toEqual({ x: 1, y: 0 });
    expect(padValues(123, 83, rect)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('clamps a captured touch dragged beyond the pad', () => {
    expect(padValues(-1000, 1000, rect)).toEqual({ x: 0, y: 0 });
    expect(padValues(1000, -1000, rect)).toEqual({ x: 1, y: 1 });
  });
});
