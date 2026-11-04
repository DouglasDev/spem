import { activeParts } from '../music/assignment';
import type { Score } from '../music/types';
import type { PerformanceState } from '../audio/engine';
import { useSettings } from '../state/settings';
import {
  ChoirColumn,
  ChoirGrid,
  Details,
  DetailBody,
  Label,
  Muted,
  Segment,
  SegmentButton,
  Select,
  Small,
  Summary,
  VoiceDot,
} from './ui';

const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const abbreviations = ['S', 'A', 'T', 'Bar', 'B'];

export function VoicePanel({ score, state }: { score: Score; state: PerformanceState }) {
  const { mode, setMode, part, setPart } = useSettings();
  const current = score.parts[state.part];
  const sounding = activeParts(score, state.beat);

  return (
    <Details>
      <Summary aria-label="Parts and voice assignment">
        Parts · {mode === 'auto' ? 'Auto' : 'Fixed'} · {romans[current.choir - 1]} / {current.name}
      </Summary>
      <DetailBody>
        <Segment aria-label="Part assignment">
          <SegmentButton
            selected={mode === 'auto'}
            aria-pressed={mode === 'auto'}
            onClick={() => setMode('auto')}
          >
            Auto
          </SegmentButton>
          <SegmentButton
            selected={mode === 'fixed'}
            aria-pressed={mode === 'fixed'}
            onClick={() => setMode('fixed')}
          >
            Fixed part
          </SegmentButton>
        </Segment>
        <ChoirGrid aria-label="All 40 score parts">
          {romans.map((roman, choir) => (
            <ChoirColumn key={roman}>
              <Small>{roman}</Small>
              {abbreviations.map((name, voice) => {
                const index = choir * 5 + voice;

                return (
                  <VoiceDot
                    key={voice}
                    sounding={sounding[index]}
                    selected={state.part === index}
                    aria-label={`Choir ${roman}, ${score.parts[index].name}`}
                    aria-pressed={mode === 'fixed' && part === index}
                    onClick={() => setPart(index)}
                  >
                    {name}
                  </VoiceDot>
                );
              })}
            </ChoirColumn>
          ))}
        </ChoirGrid>
        {mode === 'fixed' ? (
          <Label>
            Assigned voice
            <Select
              aria-label="Assigned voice"
              value={part}
              onChange={(event) => setPart(Number(event.target.value))}
            >
              {romans.map((roman, choir) => (
                <optgroup label={`Choir ${roman}`} key={roman}>
                  {score.parts.slice(choir * 5, choir * 5 + 5).map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} · Choir {roman}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Label>
        ) : (
          <Muted>
            Auto changes parts at phrase boundaries. Other phones may choose the same part.
          </Muted>
        )}
      </DetailBody>
    </Details>
  );
}
