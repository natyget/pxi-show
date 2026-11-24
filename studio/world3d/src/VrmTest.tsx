import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PixelShot, Cam, Fonts } from './lib/Pixel';
import { Room } from './world/Room';
import { VrmActor } from './world/VrmActor';

// Pipeline check: a real VRM character in the pixel room, close and wide.
export const VrmTest: React.FC<{ shot?: number }> = ({ shot = 0 }) => (
  <AbsoluteFill>
    <Fonts />
    <PixelShot>
      {shot === 0 ? <Cam pos={[0.05, 1.42, 1.65]} at={[0.0, 1.32, 0.6]} fov={28} /> : <Cam pos={[0.6, 1.3, 3.0]} at={[0, 0.85, 0.5]} fov={42} />}
      <Room>
        <VrmActor file="chars/sample.vrm" pose={(t) => ({ pos: [0, 0, 0.6], yaw: 0, face: { surprised: 0.35, angry: 0.2 },
          bones: { head: [0.05, 0.15, 0.04], spine: [0.03, 0, 0] }, lookAt: [0.1, 1.4, 2] })} />
      </Room>
    </PixelShot>
  </AbsoluteFill>
);
