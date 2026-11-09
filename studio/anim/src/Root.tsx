import React from 'react';
import { Composition } from 'remotion';
import { Sheet } from './Sheet';
import { Demo, DEMO_LEN } from './Demo';
import { VrmTest } from './VrmTest';

export const Root: React.FC = () => (
  <>
    <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={24} width={1080} height={1920} />
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_LEN} fps={24} width={1080} height={1920} />
    <Composition id="VrmTest" component={VrmTest} durationInFrames={48} fps={24} width={1080} height={1920} />
  </>
);
