import { useSettings } from '../state/settings';
import { Slider } from './Slider';
import {
  Details,
  HarmonicGrid,
  Heading,
  SoundSection,
  PanelHead,
  PartialBar,
  PartialPreview,
  Small,
  Summary,
  TextButton,
} from './ui';

export function SoundPanel() {
  const { sound, setSound, resetSound } = useSettings();

  return (
    <SoundSection aria-label="Synthesizer controls">
      <PanelHead>
        <Heading>Voice character</Heading>
        <TextButton onClick={resetSound}>Reset</TextButton>
      </PanelHead>
      <Slider label="Volume" value={sound.volume} onChange={(volume) => setSound({ volume })} />
      <Slider
        label="Brightness"
        value={sound.brightness}
        low="Mellow"
        high="Buzzy"
        onChange={(brightness) => setSound({ brightness })}
      />
      <Slider
        label="Harmonic richness"
        value={sound.richness}
        low="Pure"
        high="Rich"
        onChange={(richness) => setSound({ richness })}
      />
      <Slider
        label="Vowel resonance"
        value={sound.resonance}
        low="Open"
        high="Nasal"
        onChange={(resonance) => setSound({ resonance })}
      />
      <Slider
        label="Vibrato"
        value={sound.vibrato}
        low="Still"
        high="Wavering"
        onChange={(vibrato) => setSound({ vibrato })}
      />
      <Details>
        <Summary>Edit harmonics</Summary>
        <HarmonicGrid>
          {sound.harmonics.map((level, index) => (
            <div key={index}>
              <PartialPreview aria-hidden="true">
                <PartialBar level={level} />
              </PartialPreview>
              <Slider
                label={`H${index + 1}`}
                value={level}
                onChange={(value) =>
                  setSound({
                    harmonics: sound.harmonics.map((current, i) => (i === index ? value : current)),
                  })
                }
              />
            </div>
          ))}
        </HarmonicGrid>
        <Small>H1 is the fundamental. Higher numbers add upper partials.</Small>
      </Details>
    </SoundSection>
  );
}
