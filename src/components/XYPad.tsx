import { useId } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { styled } from '@linaria/react';

const Field = styled.section`
  min-width: 0;
`;
const Caption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  color: #c8d3d4;
`;
const Values = styled.span`
  color: #bda881;
  font-variant-numeric: tabular-nums;
  font-size: 10px;
`;
const Surface = styled.div`
  position: relative;
  height: clamp(74px, calc((100svh - 352px) / 2), 172px);
  border: 1px solid #bfc9c31f;
  border-radius: 12px;
  background:
    linear-gradient(0deg, #101e27ee, #738a8422), linear-gradient(90deg, #1c2a32, #74563b75);
  touch-action: none;
  cursor: crosshair;
  user-select: none;
  &:focus-visible {
    outline: 2px solid #dfc399;
    outline-offset: 3px;
  }
`;
const Grid = styled.div`
  position: absolute;
  inset: 13px;
  pointer-events: none;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    border-left: 1px dashed #ffffff16;
  }
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 1px dashed #ffffff16;
  }
`;
const Cursor = styled.span<{ x: number; y: number }>`
  position: absolute;
  left: ${({ x }) => `${x * 100}%`};
  bottom: ${({ y }) => `${y * 100}%`};
  width: 19px;
  height: 19px;
  transform: translate(-50%, 50%);
  border-radius: 50%;
  background: #e6c997;
  border: 3px solid #19242c;
  box-shadow:
    0 0 0 1px #e6c997,
    0 0 20px #e6c99725;
`;
const CrossX = styled.span<{ x: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ x }) => `${x * 100}%`};
  width: 1px;
  background: #e6c99725;
`;
const CrossY = styled.span<{ y: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${({ y }) => `${y * 100}%`};
  height: 1px;
  background: #e6c99725;
`;
const AccessibleRange = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  &:focus-visible {
    clip-path: none;
    width: 100%;
    height: 20px;
    bottom: 0;
    left: 0;
  }
`;

export function padValues(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
) {
  const clamp = (value: number) => Math.max(0, Math.min(1, value));

  return {
    x: clamp((clientX - rect.left - 13) / Math.max(1, rect.width - 26)),
    y: clamp(1 - (clientY - rect.top - 13) / Math.max(1, rect.height - 26)),
  };
}

interface Props {
  xLabel: string;
  yLabel: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

export function XYPad({ xLabel, yLabel, x, y, onChange }: Props) {
  const id = useId();

  function move(event: PointerEvent<HTMLDivElement>) {
    const next = padValues(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    );

    onChange(next.x, next.y);
  }

  function key(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02;
    const change: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const delta = change[event.key];

    if (!delta) return;

    event.preventDefault();
    onChange(Math.max(0, Math.min(1, x + delta[0])), Math.max(0, Math.min(1, y + delta[1])));
  }

  return (
    <Field aria-label={`${yLabel} and ${xLabel}`}>
      <Caption id={id}>
        <span>
          {yLabel} ↑ · {xLabel} →
        </span>
        <Values>
          {Math.round(y * 100)}% / {Math.round(x * 100)}%
        </Values>
      </Caption>
      <Surface
        role="group"
        tabIndex={0}
        aria-labelledby={id}
        aria-description="Drag in two dimensions. Arrow keys adjust each axis; Shift makes larger changes."
        onKeyDown={key}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
        }}
        onPointerUp={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

          move(event);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <Grid aria-hidden="true">
          <CrossX x={x} />
          <CrossY y={y} />
          <Cursor x={x} y={y} />
        </Grid>
        <AccessibleRange
          aria-label={xLabel}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={x}
          onChange={(event) => onChange(Number(event.target.value), y)}
        />
        <AccessibleRange
          aria-label={yLabel}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={y}
          onChange={(event) => onChange(x, Number(event.target.value))}
        />
      </Surface>
    </Field>
  );
}
