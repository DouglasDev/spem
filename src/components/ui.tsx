import { styled } from '@linaria/react';

export const Page = styled.main`
  max-width: 500px;
  margin: 0 auto;
  padding: 12px 14px max(10px, env(safe-area-inset-bottom));
  display: grid;
  gap: 10px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 36px;
`;

export const Title = styled.h1`
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 400;
  letter-spacing: -0.7px;
  margin: 0;
`;

export const HeaderTools = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Small = styled.span`
  font-size: 10px;
  color: #92a4ab;
  line-height: 1.5;
`;

export const StatusDot = styled.span<{ healthy: boolean }>`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ healthy }) => (healthy ? '#9fc6b5' : '#d8b988')};
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

export const Button = styled.button`
  min-height: 36px;
  padding: 7px 12px;
  border: 1px solid #ffffff20;
  border-radius: 8px;
  background: #1b2a33;
  color: #e0e5e1;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: #293b45;
  }
  &:focus-visible {
    outline: 2px solid #dfc399;
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const JoinButton = styled(Button)`
  width: 100%;
  min-height: 46px;
  background: #dfc399;
  color: #152128;
  font-size: 14px;
  font-weight: 650;
  &:hover {
    background: #ead0aa;
  }
`;

export const Details = styled.details`
  min-width: 0;
  border-top: 1px solid #ffffff13;
  padding-top: 5px;
`;

export const Summary = styled.summary`
  font-size: 11px;
  color: #aabac0;
  cursor: pointer;
  min-height: 28px;
  align-content: center;
  &:focus-visible {
    outline: 2px solid #dfc399;
    outline-offset: 3px;
  }
`;

export const DetailBody = styled.div`
  padding: 12px 0 5px;
  display: grid;
  gap: 12px;
`;

export const Muted = styled.p`
  font-size: 11px;
  color: #9cabb0;
  margin: 0;
  line-height: 1.5;
`;

export const Notice = styled.p`
  font-size: 11px;
  color: #e5c79c;
  margin: 0;
  line-height: 1.5;
`;

export const Link = styled.a`
  color: #d3bc95;
  text-underline-offset: 3px;
  font-size: 11px;
`;

export const Label = styled.label`
  font-size: 11px;
  color: #c6d0d1;
  display: block;
`;

export const Select = styled.select`
  width: 100%;
  min-height: 38px;
  margin-top: 7px;
  border: 1px solid #ffffff22;
  border-radius: 6px;
  padding: 7px;
  background: #182630;
  color: #e0e5df;
  font: inherit;
  font-size: 12px;
`;

export const Segment = styled.div`
  display: flex;
  gap: 8px;
`;

export const SegmentButton = styled(Button)<{ selected: boolean }>`
  flex: 1;
  color: ${({ selected }) => (selected ? '#dfc399' : '#9aafb5')};
  border-color: ${({ selected }) => (selected ? '#dfc39988' : '#ffffff20')};
`;

export const ChoirGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 5px;
`;

export const ChoirColumn = styled.div`
  display: grid;
  gap: 4px;
  text-align: center;
`;

export const VoiceDot = styled.button<{ sounding: boolean; selected: boolean }>`
  min-height: 27px;
  border: 1px solid ${({ selected }) => (selected ? '#dfc399' : '#ffffff10')};
  border-radius: 4px;
  padding: 0;
  font-size: 8px;
  color: ${({ selected }) => (selected ? '#12202a' : '#b5c4c8')};
  background: ${({ selected, sounding }) => (selected ? '#dfc399' : sounding ? '#4c6c60' : '#24333e')};
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid #dfc399;
    outline-offset: 2px;
  }
`;

export const SliderBlock = styled.div`
  margin: 0;
`;

export const Range = styled.input`
  width: 100%;
  accent-color: #dfc399;
  margin: 10px 0 4px;
  &:focus-visible {
    outline: 2px solid #dfc399;
    outline-offset: 2px;
  }
`;

export const SliderHints = styled.div`
  display: flex;
  justify-content: space-between;
  color: #849ba4;
  font-size: 10px;
`;
