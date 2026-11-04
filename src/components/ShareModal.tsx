import { useEffect, useId, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Muted, Row } from './ui';

export const shareUrl = 'https://douglasdev.github.io/spem/';

const Sheet = styled.dialog`
  width: min(340px, calc(100vw - 32px));
  max-height: calc(100svh - 32px);
  overflow: auto;
  padding: 22px;
  border: 1px solid #dfc39944;
  border-radius: 16px;
  background: #16242d;
  color: #e7ece5;
  &::backdrop {
    background: #050b10d9;
    backdrop-filter: blur(7px);
  }
`;
const Heading = styled.h2`
  font:
    400 22px Georgia,
    serif;
  margin: 0;
`;
const Code = styled.div`
  margin: 20px 0 14px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Address = styled.input`
  width: 100%;
  margin: 12px 0;
  padding: 10px 8px;
  border: 1px solid #ffffff22;
  border-radius: 6px;
  background: #101b23;
  color: #d8c29f;
  font: inherit;
  font-size: 11px;
  text-align: center;
`;

export function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
      setCopied(false);
    }

    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      dialog.current?.querySelector('input')?.select();
    }
  }

  return (
    <Sheet
      ref={dialog}
      aria-labelledby={id}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();

        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <Row>
        <Heading id={id}>Share performance</Heading>
        <Button aria-label="Close share dialog" onClick={onClose}>
          Close
        </Button>
      </Row>
      <Code>
        <QRCodeSVG
          value={shareUrl}
          size={232}
          level="M"
          marginSize={2}
          role="img"
          aria-label="QR code to open Spem in alium on another phone"
        />
      </Code>
      <Muted>Scan to open on another phone.</Muted>
      <Address
        aria-label="Performance link"
        readOnly
        value={shareUrl}
        onFocus={(event) => event.currentTarget.select()}
      />
      <Button onClick={() => void copy()}>{copied ? 'Copied' : 'Copy link'}</Button>
    </Sheet>
  );
}
