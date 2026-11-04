import { activeParts } from '../music/assignment';
import { pitchName } from '../music/timeline';
import type { Score } from '../music/types';
import type { PerformanceState } from '../audio/engine';
import { useSettings } from '../state/settings';
import {
  ChoirColumn,
  ChoirGrid,
  Heading,
  Label,
  Muted,
  NoteBadge,
  VoiceSection,
  PanelHead,
  Progress,
  Row,
  Segment,
  SegmentButton,
  Select,
  Small,
  Time,
  Transport,
  VoiceDot,
  VoiceName,
  VoiceReadout,
} from './ui';

const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const abbreviations = ['S', 'A', 'T', 'Bar', 'B'];

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function VoicePanel({
  score,
  state,
  children,
}: {
  score: Score;
  state: PerformanceState;
  children: React.ReactNode;
}) {
  const { mode, setMode, part, setPart } = useSettings();
  const current = score.parts[state.part];
  const sounding = activeParts(score, state.beat);
  const seconds = (state.beat * 60) / score.bpm;

  return (
    <VoiceSection>
      <PanelHead>
        <Heading>Your part</Heading>
        <Small>{state.playing ? 'Performing' : 'Ready to join'}</Small>
      </PanelHead>
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
      <VoiceReadout>
        <div>
          <VoiceName>{current.name}</VoiceName>
          <Small>
            Choir {romans[current.choir - 1]} · Part {current.id + 1} / 40
          </Small>
        </div>
        <NoteBadge
          aria-label={
            state.playing && state.midi !== undefined ? `Note ${pitchName(state.midi)}` : 'Rest'
          }
        >
          {state.playing && state.midi !== undefined ? pitchName(state.midi) : '—'}
        </NoteBadge>
      </VoiceReadout>
      <Row>
        <Small>Choirs</Small>
        <Small>Tap a part to fix your voice</Small>
      </Row>
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
          Auto favors active lines and changes parts at phrase boundaries. Other phones may choose
          the same part.
        </Muted>
      )}
      <Transport>
        <Row>
          <Time>
            {formatTime(seconds)} <Small>/ {formatTime((score.beats * 60) / score.bpm)}</Small>
          </Time>
          <Small>
            Bar {Math.min(138, Math.floor(state.beat / score.barBeats) + 1)} · repeating
          </Small>
        </Row>
        <Progress
          aria-label="Position in global performance"
          max={score.beats}
          value={state.beat}
        />
      </Transport>
      {children}
    </VoiceSection>
  );
}
