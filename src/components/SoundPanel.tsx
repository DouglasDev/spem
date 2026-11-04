import { styled } from '@linaria/react';
import { useSettings } from '../state/settings';
import { XYPad } from './XYPad';

const Pads = styled.div`
  display: grid;
  gap: 12px;

  @media (max-height: 500px) and (min-width: 500px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export function SoundPanel() {
  const { sound, setSound } = useSettings();

  return (
    <Pads aria-label="Brass sound controls">
      <XYPad
        yLabel="Volume"
        xLabel="Brightness"
        x={sound.brightness}
        y={sound.volume}
        onChange={(brightness, volume) => setSound({ brightness, volume })}
      />
      <XYPad
        yLabel="Vibrato"
        xLabel="Richness"
        x={sound.richness}
        y={sound.vibrato}
        onChange={(richness, vibrato) => setSound({ richness, vibrato })}
      />
    </Pads>
  );
}
