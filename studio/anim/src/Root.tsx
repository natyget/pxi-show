import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { Demo, DEMO_LEN } from './Demo';
import { VrmTest } from './VrmTest';
import { CharSheet } from './CharSheet';
import { Pilot, PILOT_LEN, PhotoStill } from './Pilot';
import { Ep1, EP1_LEN, Ep1Photo } from './Ep1';
import { PilotOnePhoto, PILOT1_LEN, PilotPhoto } from './PilotOnePhoto';
import { LookScene, LookSheet, LookClip, CLIP_LEN } from './look/LookTest';
import { LOOKS } from './look/Rig2D';
import { NioNight } from './look/Nio34';

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
    <Composition id="LookAScene" component={LookScene} durationInFrames={1} fps={24} width={LOOKS.A.w} height={LOOKS.A.h} defaultProps={{ look: 'A' as const }} />
    <Composition id="LookASheet" component={LookSheet} durationInFrames={1} fps={24} width={LOOKS.A.w} height={LOOKS.A.h} defaultProps={{ look: 'A' as const }} />
    <Composition id="LookAClip" component={LookClip} durationInFrames={CLIP_LEN} fps={24} width={LOOKS.A.w} height={LOOKS.A.h} defaultProps={{ look: 'A' as const }} />
    <Composition id="LookBScene" component={LookScene} durationInFrames={1} fps={24} width={LOOKS.B.w} height={LOOKS.B.h} defaultProps={{ look: 'B' as const }} />
    <Composition id="LookBSheet" component={LookSheet} durationInFrames={1} fps={24} width={LOOKS.B.w} height={LOOKS.B.h} defaultProps={{ look: 'B' as const }} />
    <Composition id="LookBClip" component={LookClip} durationInFrames={CLIP_LEN} fps={24} width={LOOKS.B.w} height={LOOKS.B.h} defaultProps={{ look: 'B' as const }} />
    <Composition id="LookCScene" component={LookScene} durationInFrames={1} fps={24} width={LOOKS.C.w} height={LOOKS.C.h} defaultProps={{ look: 'C' as const }} />
    <Composition id="LookCSheet" component={LookSheet} durationInFrames={1} fps={24} width={LOOKS.C.w} height={LOOKS.C.h} defaultProps={{ look: 'C' as const }} />
    <Composition id="LookCClip" component={LookClip} durationInFrames={CLIP_LEN} fps={24} width={LOOKS.C.w} height={LOOKS.C.h} defaultProps={{ look: 'C' as const }} />
    <Composition id="NioNight" component={NioNight} durationInFrames={1} fps={24} width={1080} height={1920} />
  </>
);
