import { useState } from 'react';
import { OrnamentPanel } from './components/OrnamentPanel';
import { ShareModal } from './components/ShareModal';
import { SoundPanel } from './components/SoundPanel';
import { TimingPanel } from './components/TimingPanel';
import { usePerformance } from './components/usePerformance';
import { VoicePanel } from './components/VoicePanel';
import {
  Button,
  Header,
  HeaderTools,
  JoinButton,
  Muted,
  Notice,
  Page,
  Row,
  StatusDot,
  Title,
} from './components/ui';

export function App() {
  const { score, clockState, state, error, starting, engine, clock, toggle } = usePerformance();
  const [calibration, setCalibration] = useState(false);
  const [sharing, setSharing] = useState(false);
  const ready = clockState.status !== 'checking' && clockState.status !== 'unavailable';

  return (
    <Page>
      <Header>
        <Title>Spem in alium</Title>
        <HeaderTools>
          <StatusDot healthy={clockState.status === 'synced'} title={clockState.message} />
          <Button onClick={() => setSharing(true)}>Share</Button>
        </HeaderTools>
      </Header>
      {error && <Notice role="alert">{error}</Notice>}
      {!score ? (
        <Muted role="status">{error ? 'Refresh to reload the score.' : 'Loading score…'}</Muted>
      ) : (
        <>
          <VoicePanel score={score} state={state} />
          <JoinButton disabled={starting || !ready} onClick={() => void toggle()}>
            {starting
              ? 'Enabling audio…'
              : state.playing
                ? 'Mute'
                : state.interrupted
                  ? 'Rejoin'
                  : 'Join performance'}
          </JoinButton>
          {clockState.status === 'unavailable' && (
            <Row>
              <Button onClick={() => void clock.current?.sync()}>Retry sync</Button>
              <Button onClick={() => void toggle(true)}>Join unsynchronized</Button>
            </Row>
          )}
          {clockState.status === 'local' && (
            <Notice role="status">Unsynchronized · phone clock</Notice>
          )}
          <SoundPanel />
          <OrnamentPanel
            playing={state.playing && !calibration}
            active={state.ornament}
            trigger={(kind) => engine.current?.trigger(kind)}
          />
          <TimingPanel
            score={score}
            beat={state.beat}
            clockState={clockState}
            clock={clock}
            engine={engine}
            playing={state.playing}
            calibration={calibration}
            setCalibration={setCalibration}
          />
        </>
      )}
      <ShareModal open={sharing} onClose={() => setSharing(false)} />
    </Page>
  );
}
