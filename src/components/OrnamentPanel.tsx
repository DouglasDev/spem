import { useState } from 'react';
import type { Ornament } from '../music/types';
import { useSettings } from '../state/settings';
import { Slider } from './Slider';
import {
  Heading,
  Muted,
  OrnamentButton,
  OrnamentGlyph,
  OrnamentGrid,
  OrnamentSection,
  PanelHead,
  Small,
} from './ui';

const ornaments: { kind: Ornament; name: string; glyph: string }[] = [
  { kind: 'turn', name: 'Turn', glyph: '∿' },
  { kind: 'division', name: 'Division', glyph: '♬' },
  { kind: 'trill', name: 'Cadential trill', glyph: 'tr' },
  { kind: 'ratchet', name: 'Ratchet', glyph: '▥' },
  { kind: 'gate', name: 'Gate', glyph: '⌐' },
  { kind: 'octave', name: 'Octave burst', glyph: '↑8' },
];

export function OrnamentPanel({
  playing,
  active,
  trigger,
}: {
  playing: boolean;
  active?: Ornament;
  trigger: (kind: Ornament) => void;
}) {
  const { amount, setAmount } = useSettings();
  const [queued, setQueued] = useState<Ornament>();

  return (
    <OrnamentSection>
      <PanelHead>
        <Heading>Ornaments</Heading>
        <Small>On the next available beat</Small>
      </PanelHead>
      <OrnamentGrid>
        {ornaments.map(({ kind, name, glyph }) => (
          <OrnamentButton
            key={kind}
            disabled={!playing}
            engaged={active === kind}
            aria-pressed={active === kind}
            onClick={() => {
              trigger(kind);
              setQueued(kind);
            }}
          >
            <OrnamentGlyph aria-hidden="true">{glyph}</OrnamentGlyph>
            {name}
          </OrnamentButton>
        ))}
      </OrnamentGrid>
      <Slider
        label="Ornament amount"
        value={amount}
        low="Subtle"
        high="Full"
        onChange={setAmount}
      />
      <Muted role="status">
        {playing && queued
          ? `${ornaments.find((item) => item.kind === queued)?.name} requested. `
          : ''}
        Figures last one beat and preserve written rests.
      </Muted>
    </OrnamentSection>
  );
}
