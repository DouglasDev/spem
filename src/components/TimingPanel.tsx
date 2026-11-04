import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { EnsembleEngine } from '../audio/engine';
import type { Score } from '../music/types';
import type { ClockState, SharedClock } from '../sync/clock';
import { approximateRegion } from '../sync/region';
import { useSettings } from '../state/settings';
import { Slider } from './Slider';
import { Button, Details, DetailBody, Link, Muted, Row, Summary } from './ui';

export function TimingPanel({
  score,
  beat,
  clockState,
  clock,
  engine,
  playing,
  calibration,
  setCalibration,
}: {
  score: Score;
  beat: number;
  clockState: ClockState;
  clock: RefObject<SharedClock | null>;
  engine: RefObject<EnsembleEngine | null>;
  playing: boolean;
  calibration: boolean;
  setCalibration: (enabled: boolean) => void;
}) {
  const { offset, setOffset, amount, setAmount, resetSound } = useSettings();
  const [region, setRegion] = useState('');
  const uncertainty = clock.current?.uncertainty() ?? clockState.uncertainty;
  const timeLabel =
    clockState.status === 'synced'
      ? `Sync ±${Math.ceil(uncertainty)} ms`
      : clockState.status === 'local'
        ? 'Unsynchronized'
        : clockState.status === 'degraded'
          ? 'Sync estimate'
          : 'Checking time';

  useEffect(() => {
    void approximateRegion().then(setRegion);
  }, []);

  return (
    <Details>
      <Summary aria-label="Timing and settings">
        {timeLabel} · Bar {Math.floor(beat / score.barBeats) + 1} · Settings
      </Summary>
      <DetailBody>
        <Muted>{region}. Region does not identify nearby performers.</Muted>
        <Muted>{clockState.message}. Timing uncertainty excludes speaker delay.</Muted>
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
        <Row>
          <Button
            disabled={!playing}
            aria-pressed={calibration}
            onClick={() => {
              setCalibration(!calibration);
              engine.current?.setCalibration(!calibration);
            }}
          >
            {calibration ? 'Return to brass' : 'Calibration pulse'}
          </Button>
          <Button onClick={() => void clock.current?.sync()}>Refresh time</Button>
        </Row>
        <Slider label="Ornament amount" value={amount} onChange={setAmount} />
        <Row>
          <Button onClick={resetSound}>Reset sound</Button>
          <Link
            href={`${import.meta.env.BASE_URL}score/ATTRIBUTION.md`}
            target="_blank"
            rel="noreferrer"
          >
            Score attribution
          </Link>
        </Row>
      </DetailBody>
    </Details>
  );
}
