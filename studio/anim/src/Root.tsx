import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { Demo, DEMO_LEN } from './Demo';
import { VrmTest } from './VrmTest';
import { CharSheet } from './CharSheet';
import { Pilot, PILOT_LEN, PhotoStill } from './Pilot';
import { Ep1, EP1_LEN, Ep1Photo } from './Ep1';
import { PilotOnePhoto, PILOT1_LEN, PilotPhoto, pilot1Len } from './PilotOnePhoto';
import type { Cut } from './lib/cut';
import { TextCheckTest } from './TextCheckTest';
import { withProbe } from './lib/TextProbe';

export const Root: React.FC = () => (
  <>
    <Composition id="Sheet" component={withProbe(Sheet)} durationInFrames={1} fps={24} width={1080} height={1920} />
    <Composition id="Demo" component={withProbe(Demo)} durationInFrames={DEMO_LEN} fps={24} width={1080} height={1920} />
    <Composition id="VrmTest" component={withProbe(VrmTest)} durationInFrames={48} fps={24} width={1080} height={1920} />
    <Composition id="CharSheet" component={withProbe(CharSheet)} durationInFrames={1} fps={24} width={1080} height={1920} />
    <Composition id="Pilot" component={withProbe(Pilot)} durationInFrames={PILOT_LEN} fps={24} width={1080} height={1920} />
    <Composition id="PhotoStill" component={withProbe(PhotoStill)} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'window' }} />
    <Composition id="Ep1" component={withProbe(Ep1)} durationInFrames={EP1_LEN} fps={24} width={1080} height={1920} />
    <Composition id="Ep1Photo" component={withProbe(Ep1Photo)} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'behind' }} />
    <Composition id="PilotOnePhoto" component={withProbe(PilotOnePhoto)} durationInFrames={PILOT1_LEN} fps={24} width={1080} height={1920}
      defaultProps={{ cut: 'long' as Cut }} calculateMetadata={({ props }) => ({ durationInFrames: pilot1Len(props.cut) })} />
    <Composition id="PilotPhoto" component={withProbe(PilotPhoto)} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'thumb' }} />
    <Composition id="TextCheckTest" component={withProbe(TextCheckTest)} durationInFrames={96} fps={24} width={1080} height={1920} defaultProps={{ variant: 'good' }} />
  </>
);
