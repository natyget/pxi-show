// Tiny fixture for engine/tools/text_check.py. variant 'bad': a subtitle with a glyph Pixelify lacks, and a 12-frame text.
// variant 'good': one clean string held 2 s.
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Fonts, Sub } from './lib/Pixel';

const Txt: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: 600, textAlign: 'center', fontFamily: 'Pixelify', fontSize: 80, color: '#fff' }}>{s}</div>
);

export const TextCheckTest: React.FC<{ variant?: 'good' | 'bad' }> = ({ variant = 'good' }) => (
  <AbsoluteFill style={{ background: '#222' }}>
    <Fonts />
    {variant === 'good' ? (
      <Sequence from={12} durationInFrames={48}><Txt s="one clean line" /></Sequence>
    ) : (
      <>
        <Sequence from={0} durationInFrames={60}><Sub text="go left → now" /></Sequence>
        <Sequence from={60} durationInFrames={12}><Txt s="gone fast" /></Sequence>
        <Sequence from={72} durationInFrames={24}><Txt s="it cost 5$ at 7pm, 3 x 4 (ok)" /></Sequence>
      </>
    )}
  </AbsoluteFill>
);
