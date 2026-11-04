import { useId } from 'react';
import { Label, Range, Row, SliderBlock, SliderHints, Small } from './ui';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low?: string;
  high?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function Slider({
  label,
  value,
  onChange,
  low,
  high,
  min = 0,
  max = 1,
  step = 0.01,
  unit = '%',
}: Props) {
  const id = useId();
  const display = unit === '%' ? Math.round(value * 100) : value;

  return (
    <SliderBlock>
      <Row>
        <Label htmlFor={id}>{label}</Label>
        <Small>
          {display}
          {unit}
        </Small>
      </Row>
      <Range
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {(low || high) && (
        <SliderHints>
          <span>{low}</span>
          <span>{high}</span>
        </SliderHints>
      )}
    </SliderBlock>
  );
}
