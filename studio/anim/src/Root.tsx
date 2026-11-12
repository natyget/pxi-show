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

import { N3Still, N3_DEFAULT, N3Shot } from './nw3d/Scenes';
import { NWHead, NWBody, NWHero, NWWide, NWSheet, NWClip, CLIP_LEN, NWShot, NWClip2, CLIP2_LEN } from './nw/Look';

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
    <Composition id="N3Shot" component={N3Shot} durationInFrames={48} fps={24} width={180} height={320}
      defaultProps={{ spec: { set: 'nioRoom', camera: 'wide', frames: 48, actors: [{ who: 'nio', at: 'rug', action: 'stand', face: 'deadpan', facing: 'camera' }] } }}
      calculateMetadata={({ props }) => ({ durationInFrames: props.spec.frames })} />
    <Composition id="N3Still" component={N3Still} durationInFrames={1} fps={24} width={180} height={320} defaultProps={N3_DEFAULT}
      calculateMetadata={({ props }) => ({ width: props.w, height: props.h })} />
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
