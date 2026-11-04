import { styled } from '@linaria/react';
import type { Ornament } from '../music/types';
import { Button } from './ui';

const Line = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
`;
const OrnamentButton = styled(Button)<{ engaged: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 54px;
  padding: 6px 1px;
  font-size: 9px;
  white-space: nowrap;
  background: ${({ engaged }) => (engaged ? '#594b38' : '#1b2a33')};
  border-color: ${({ engaged }) => (engaged ? '#dfc399' : '#ffffff15')};
`;
const Glyph = styled.span`
  font-family: Georgia, serif;
  font-size: 19px;
  color: #dfc399;
  line-height: 1;
`;
const ornaments: { kind: Ornament; name: string; label: string; glyph: string }[] = [
  { kind: 'turn', name: 'Turn', label: 'Turn', glyph: '∿' },
  { kind: 'division', name: 'Division', label: 'Division', glyph: '♬' },
  { kind: 'trill', name: 'Cadential trill', label: 'Trill', glyph: 'tr' },
  { kind: 'ratchet', name: 'Ratchet', label: 'Ratchet', glyph: '▥' },
  { kind: 'gate', name: 'Gate', label: 'Gate', glyph: '⌐' },
  { kind: 'octave', name: 'Octave burst', label: 'Octave', glyph: '↑8' },
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
  return (
    <Line aria-label="Ornaments">
      {ornaments.map(({ kind, name, label, glyph }) => (
        <OrnamentButton
          key={kind}
          aria-label={name}
          title={`${name} · next beat`}
          disabled={!playing}
          engaged={active === kind}
          aria-pressed={active === kind}
          onClick={() => trigger(kind)}
        >
          <Glyph aria-hidden="true">{glyph}</Glyph>
          {label}
        </OrnamentButton>
      ))}
    </Line>
  );
}
