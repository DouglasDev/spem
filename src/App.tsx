import { useEffect, useState } from 'react';
import { approximateRegion } from './sync/region';
import { useSettings } from './state/settings';
import { OrnamentPanel } from './components/OrnamentPanel';
import { Slider } from './components/Slider';
import { SoundPanel } from './components/SoundPanel';
import { usePerformance } from './components/usePerformance';
import { VoicePanel } from './components/VoicePanel';
import {
  Button,
  ClockBadge,
  Details,
  Eyebrow,
  Footer,
  Header,
  Heading,
  JoinButton,
  Link,
  Muted,
  Notice,
  Page,
  Panel,
  PanelHead,
  Row,
  Small,
  Stack,
  StatusDot,
  Summary,
  TimingOffset,
  TimingSection,
  Title,
  Workspace,
} from './components/ui';

export function App() {
  const { score, clockState, state, error, starting, engine, clock, toggle } = usePerformance();
  const { offset, setOffset } = useSettings();
  const [region, setRegion] = useState('Estimating region');
  const [calibration, setCalibration] = useState(false);
  const ready = clockState.status !== 'checking' && clockState.status !== 'unavailable';

  useEffect(() => {
    void approximateRegion().then(setRegion);
  }, []);

  return (
    <Page>
      <Header>
        <div>
          <Eyebrow>Thomas Tallis · 40 voices</Eyebrow>
          <Title>Spem in alium</Title>
          <Muted>One synthesized voice per phone</Muted>
        </div>
        <ClockBadge>
          <StatusDot healthy={clockState.status === 'synced'} />
          <span>
            {clockState.status === 'synced'
              ? 'Shared time'
              : clockState.status === 'local'
                ? 'Phone time'
                : clockState.status === 'degraded'
                  ? 'Time estimate'
                  : 'Connecting'}
          </span>
        </ClockBadge>
      </Header>
      {error && <Notice role="alert">{error}</Notice>}
      {!score ? (
        <Panel>
          <Muted role="status">
            {error ? 'Refresh to reload the score.' : 'Loading the 40-part score…'}
          </Muted>
        </Panel>
      ) : (
        <Workspace>
          <Stack>
            <VoicePanel score={score} state={state}>
              <JoinButton disabled={starting || !ready} onClick={() => void toggle()}>
                <span aria-hidden="true">{state.playing ? 'Ⅱ' : '▷'}</span>
                {starting
                  ? 'Enabling audio…'
                  : state.playing
                    ? 'Mute my voice'
                    : state.interrupted
                      ? 'Rejoin performance'
                      : 'Join performance'}
              </JoinButton>
              {state.interrupted && (
                <Notice role="status">
                  Audio was interrupted. Rejoin at the current position.
                </Notice>
              )}
              {clockState.status === 'unavailable' && (
                <>
                  <Notice>Shared time is unavailable. Try again or use your phone’s clock.</Notice>
                  <Row>
                    <Button onClick={() => void clock.current?.sync()}>Retry time sync</Button>
                    <Button onClick={() => void toggle(true)}>Join unsynchronized</Button>
                  </Row>
                </>
              )}
              {clockState.status === 'local' && (
                <Notice role="status">Unsynchronized playback · using this phone’s clock.</Notice>
              )}
            </VoicePanel>
            <OrnamentPanel
              playing={state.playing && !calibration}
              active={state.ornament}
              trigger={(kind) => engine.current?.trigger(kind)}
            />
            <TimingSection>
              <PanelHead>
                <Heading>Timing</Heading>
                <Small>
                  {clockState.status === 'synced' && Number.isFinite(clockState.uncertainty)
                    ? `Estimated ±${Math.ceil(clock.current?.uncertainty() ?? clockState.uncertainty)} ms`
                    : clockState.status === 'local'
                      ? 'Unsynchronized'
                      : clockState.status === 'degraded'
                        ? 'Estimate aging'
                        : 'Waiting for shared time'}
                </Small>
              </PanelHead>
              <Muted>{region}</Muted>
              <Muted>
                The same score position worldwide. Region does not identify nearby performers.
              </Muted>
              <Details>
                <Summary>Calibration and connection</Summary>
                <Muted>
                  {clockState.message}. Clock uncertainty excludes speaker and wireless audio
                  delays.
                </Muted>
                <TimingOffset>
                  <Slider
                    label="Timing offset"
                    value={offset}
                    min={-150}
                    max={300}
                    step={1}
                    unit=" ms"
                    low="Earlier"
                    high="Later"
                    onChange={setOffset}
                  />
                </TimingOffset>
                <Row>
                  <Button
                    disabled={!state.playing}
                    aria-pressed={calibration}
                    onClick={() => {
                      const next = !calibration;

                      setCalibration(next);
                      engine.current?.setCalibration(next);
                    }}
                  >
                    {calibration ? 'Return to voice' : 'Calibration pulse'}
                  </Button>
                  <Button onClick={() => void clock.current?.sync()}>Refresh time</Button>
                </Row>
                <Muted>
                  Compare pulses on nearby phones and adjust until they coincide. Keep this page
                  visible while performing.
                </Muted>
              </Details>
            </TimingSection>
          </Stack>
          <SoundPanel />
        </Workspace>
      )}
      <Footer>
        <span>Web Audio synthesis · No recordings</span>
        <span>
          {score ? (
            <>
              <Link
                href={`${import.meta.env.BASE_URL}score/ATTRIBUTION.md`}
                target="_blank"
                rel="noreferrer"
              >
                Score sources & attribution
              </Link>{' '}
              ·{' '}
              <Link href="https://utctime.app/api" target="_blank" rel="noreferrer">
                UTC service
              </Link>
            </>
          ) : (
            '138 measures · 8 choirs'
          )}
        </span>
      </Footer>
    </Page>
  );
}
