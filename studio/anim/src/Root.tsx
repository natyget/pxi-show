import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { Demo, DEMO_LEN } from './Demo';
import { VrmTest } from './VrmTest';
import { CharSheet } from './CharSheet';
import { Pilot, PILOT_LEN, PhotoStill } from './Pilot';
import { Ep1, EP1_LEN, Ep1Photo } from './Ep1';
import { PilotNotMe, NOTME_LEN, NotMePhoto } from './PilotNotMe';
import { PilotNoEvidence, NE_LEN, NoEvidencePhoto } from './PilotNoEvidence';
import { WhatImBuilding, WIB_LEN, Thumb } from './WhatImBuilding';
import { FaceTest } from './FaceTest';

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
    <Composition id="PilotNotMe" component={PilotNotMe} durationInFrames={NOTME_LEN} fps={24} width={1080} height={1920} />
    <Composition id="NotMePhoto" component={NotMePhoto} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'bite' }} />
    <Composition id="PilotNoEvidence" component={PilotNoEvidence} durationInFrames={NE_LEN} fps={24} width={1080} height={1920} />
    <Composition id="NoEvidencePhoto" component={NoEvidencePhoto} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'face' }} />
    <Composition id="WhatImBuilding" component={WhatImBuilding} durationInFrames={WIB_LEN} fps={24} width={1080} height={1920} />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={24} width={1080} height={1920} defaultProps={{ which: 'ne' as const }} />
    <Composition id="FaceTest" component={FaceTest} durationInFrames={9} fps={24} width={1080} height={1920} />
  </>
);
