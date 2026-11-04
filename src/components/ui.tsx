import { styled } from '@linaria/react';

export const Page = styled.main`
  max-width: 1160px;
  margin: 0 auto;
  padding: 36px 28px 40px;

  @media (max-width: 640px) {
    padding: 24px 16px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 28px;
  border-bottom: 1px solid #ffffff16;
`;

export const Title = styled.h1`
  margin: 8px 0 5px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(34px, 5vw, 53px);
  font-weight: 400;
  letter-spacing: -1.8px;
  line-height: 1.1;
`;

export const Eyebrow = styled.p`
  margin: 0;
  color: #d8b988;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

export const Muted = styled.p`
  margin: 5px 0 0;
  color: #9ca6aa;
  font-size: 12px;
  line-height: 1.65;
`;

export const ClockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 5px;
  font-size: 12px;
  color: #ccd5d4;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 10px;
    gap: 6px;
  }
`;

export const StatusDot = styled.span<{ healthy: boolean }>`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ healthy }) => (healthy ? '#9fc6b5' : '#d8b988')};
`;

export const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.1fr);
  align-items: start;
  gap: 22px;
  padding-top: 24px;

  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Stack = styled.div`
  display: grid;
  gap: 22px;
  min-width: 0;

  @media (max-width: 800px) {
    display: contents;
  }
`;

export const Panel = styled.section`
  min-width: 0;
  padding: 24px;
  border: 1px solid #ffffff13;
  border-radius: 16px;
  background: #151f25;

  @media (max-width: 420px) {
    padding: 20px;
  }
`;

export const VoiceSection = styled(Panel)`
  @media (max-width: 800px) {
    order: 1;
  }
`;

export const SoundSection = styled(Panel)`
  @media (max-width: 800px) {
    order: 2;
  }
`;

export const OrnamentSection = styled(Panel)`
  @media (max-width: 800px) {
    order: 3;
  }
`;

export const TimingSection = styled(Panel)`
  @media (max-width: 800px) {
    order: 4;
  }
`;

export const PanelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
`;

export const Heading = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 550;
  letter-spacing: 0.1px;
`;

export const Small = styled.span`
  color: #8e9ca2;
  font-size: 11px;
  line-height: 1.6;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Button = styled.button`
  border: 1px solid #ffffff22;
  border-radius: 8px;
  background: #1c2a32;
  color: #e5e9e7;
  padding: 10px 14px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  min-height: 42px;
  transition: background 120ms;

  &:hover {
    background: #2b3a42;
  }
  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

export const TextButton = styled(Button)`
  padding: 4px 8px;
  background: transparent;
  border-color: transparent;
  color: #b8c2c6;
  min-height: 36px;
`;

export const JoinButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  margin-top: 26px;
  background: #dfc399;
  border-color: #dfc399;
  color: #162027;
  font-size: 15px;
  font-weight: 650;

  &:hover {
    background: #ecd2ac;
  }
`;

export const Segment = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  gap: 4px;
  background: #0e181e;
  border-radius: 9px;
  margin-bottom: 20px;
`;

export const SegmentButton = styled(Button)<{ selected: boolean }>`
  background: ${({ selected }) => (selected ? '#2a3840' : 'transparent')};
  border-color: transparent;
  color: ${({ selected }) => (selected ? '#f2e4ce' : '#8e9da5')};
`;

export const VoiceName = styled.h3`
  margin: 0 0 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  font-size: 31px;
  letter-spacing: -0.5px;
`;

export const VoiceReadout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 8px 0 22px;
`;

export const NoteBadge = styled.div`
  min-width: 65px;
  padding: 12px 8px;
  text-align: center;
  font-family: Georgia, serif;
  font-size: 23px;
  color: #e0c69d;
  background: #dfc3990a;
  border: 1px solid #dfc39922;
  border-radius: 10px;
`;

export const ChoirGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 7px;
  margin: 15px 0 17px;
`;

export const ChoirColumn = styled.div`
  display: grid;
  gap: 5px;
  text-align: center;
`;

export const VoiceDot = styled.button<{ sounding: boolean; selected: boolean }>`
  display: block;
  width: 100%;
  height: 24px;
  border-radius: 4px;
  border: 1px solid ${({ selected }) => (selected ? '#ebce9e' : '#ffffff0b')};
  background: ${({ selected, sounding }) => (selected ? '#dfc399' : sounding ? '#557168' : '#253038')};
  color: ${({ selected }) => (selected ? '#17212a' : '#b4c4bd')};
  font-size: 8px;
  cursor: pointer;

  &:hover {
    border-color: #dfc399;
  }
  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 2px;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 11px 12px;
  margin-top: 8px;
  min-height: 44px;
  border-radius: 7px;
  border: 1px solid #ffffff22;
  background: #101b22;
  color: #dbe0df;
  font: inherit;
  font-size: 12px;

  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 2px;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  color: #d3dadb;
`;

export const Transport = styled.div`
  border-top: 1px solid #ffffff13;
  margin-top: 21px;
  padding-top: 18px;
`;

export const Time = styled.span`
  font-variant-numeric: tabular-nums;
  color: #d2dcd9;
  font-size: 12px;
`;

export const Progress = styled.progress`
  appearance: none;
  display: block;
  width: 100%;
  height: 3px;
  margin: 12px 0 0;
  border: 0;
  background: #2e3b42;
  color: #d0b488;

  &::-webkit-progress-bar {
    background: #2e3b42;
    border-radius: 4px;
  }
  &::-webkit-progress-value {
    background: #d0b488;
    border-radius: 4px;
  }
  &::-moz-progress-bar {
    background: #d0b488;
  }
`;

export const SliderBlock = styled.div`
  margin: 0 0 19px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const TimingOffset = styled.div`
  margin-top: 20px;
`;

export const Range = styled.input`
  appearance: none;
  width: 100%;
  height: 4px;
  margin: 17px 0 8px;
  border-radius: 4px;
  background: #35434a;
  cursor: pointer;
  touch-action: pan-y;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 3px solid #151f25;
    border-radius: 50%;
    background: #dfc399;
    box-shadow: 0 0 0 1px #dfc399;
  }
  &::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border: 2px solid #151f25;
    border-radius: 50%;
    background: #dfc399;
    box-shadow: 0 0 0 1px #dfc399;
  }
  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 9px;
  }
`;

export const SliderHints = styled.div`
  display: flex;
  justify-content: space-between;
  color: #7f9199;
  font-size: 10px;
`;

export const HarmonicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px 14px;
  margin-top: 20px;
`;

export const PartialPreview = styled.div`
  display: flex;
  align-items: end;
  gap: 5px;
  height: 45px;
  padding-bottom: 6px;
`;

export const PartialBar = styled.div<{ level: number }>`
  flex: 1;
  height: ${({ level }) => `${Math.max(3, level * 100)}%`};
  background: #c3a779;
  border-radius: 3px 3px 0 0;
  opacity: 0.8;
  transition: height 100ms;
`;

export const Details = styled.details`
  border-top: 1px solid #ffffff16;
  margin-top: 22px;
  padding-top: 18px;
`;

export const Summary = styled.summary`
  color: #c3cece;
  font-size: 12px;
  cursor: pointer;
  min-height: 26px;

  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 3px;
  }
`;

export const OrnamentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin: 15px 0 20px;
`;

export const OrnamentButton = styled(Button)<{ engaged: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 5px;
  min-height: 86px;
  background: ${({ engaged }) => (engaged ? '#dfc39925' : '#1b2931')};
  border-color: ${({ engaged }) => (engaged ? '#dfc399' : '#ffffff13')};
  font-size: 11px;
  color: #deddd4;
`;

export const OrnamentGlyph = styled.span`
  font-family: Georgia, serif;
  font-size: 23px;
  line-height: 1;
  color: #dfc399;
`;

export const Notice = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: #e4c798;
  padding: 12px;
  background: #dfc3990a;
  border-radius: 7px;
`;

export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  color: #83939b;
  font-size: 11px;
  line-height: 1.7;
`;

export const Link = styled.a`
  color: #c5b38e;
  text-decoration-color: #c5b38e55;
  text-underline-offset: 3px;

  &:focus-visible {
    outline: 2px solid #e2c496;
    outline-offset: 3px;
  }
`;
