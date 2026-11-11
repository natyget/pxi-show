import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { Demo, DEMO_LEN } from './Demo';
import { VrmTest } from './VrmTest';
import { CharSheet } from './CharSheet';
import { Pilot, PILOT_LEN, PhotoStill } from './Pilot';
import { Ep1, EP1_LEN, Ep1Photo } from './Ep1';
import { PilotOnePhoto, PILOT1_LEN, PilotPhoto } from './PilotOnePhoto';

import { NWHead, NWBody, NWHero, NWWide, NWSheet, NWClip, CLIP_LEN, NWShot, NWClip2, CLIP2_LEN } from './nw/Look';

export const Root: React.FC = () => (
  <>
    <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={24} width={1080} height={1920} />
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_LEN} fps={24} width={1080} height={1920} />
    <Composition id="VrmTest" component={VrmTest} durationInFrames={48} fps={24} width={1080} height={1920} />
    <Composition id="CharSheet" component={CharSheet} durationInFrames={1} fps={24} width={1080} height={1920} />
    <Composition id="Pilot" component={Pilot} durationInFrames={PILOT_LEN} fps={24} width={1080} height={1920} />
    <Composition id="PhotoStill" component={PhotoStill} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'window' }} />
    <Composition id="Ep1" component={Ep1} durationInFrames={EP1_LEN} fps={24} width={1080} height={1920} />
    <Composition id="Ep1Photo" component={Ep1Photo} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'behind' }} />
    <Composition id="PilotOnePhoto" component={PilotOnePhoto} durationInFrames={PILOT1_LEN} fps={24} width={1080} height={1920} />
    <Composition id="PilotPhoto" component={PilotPhoto} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'thumb' }} />
    <Composition id="NWHead" component={NWHead} durationInFrames={1} fps={24} width={270} height={480} />
    <Composition id="NWBody" component={NWBody} durationInFrames={1} fps={24} width={270} height={480} />
    <Composition id="NWHero" component={NWHero} durationInFrames={1} fps={24} width={270} height={480} />
    <Composition id="NWWide" component={NWWide} durationInFrames={1} fps={24} width={270} height={480} />
    <Composition id="NWSheet" component={NWSheet} durationInFrames={1} fps={24} width={270} height={480} />
    <Composition id="NWClip" component={NWClip} durationInFrames={CLIP_LEN} fps={24} width={270} height={480} />
    <Composition id="NWShot" component={NWShot} durationInFrames={1} fps={24} width={270} height={480} defaultProps={{ shot: 'corner' }} />
    <Composition id="NWClip2" component={NWClip2} durationInFrames={CLIP2_LEN} fps={24} width={270} height={480} />
  </>
);
