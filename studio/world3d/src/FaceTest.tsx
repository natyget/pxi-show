// Expression sheet: one Nio head per tile, to check the face rig.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PixelShot, Cam } from './lib/Pixel';
import { Character, NIO, Pose, headPos } from './world/Character';

export const FACES: [string, Partial<Pose>][] = [
  ['neutral', {}],
  ['lid .35', { lid: 0.35 }],
  ['lid .6', { lid: 0.6 }],
  ['grin', { smile: 1 }],
  ['talk', { mouth: 0.7, smile: 0.3 }],
  ['shout', { mouth: 1, wide: 0.6, browUp: 1 }],
  ['annoyed', { brow: 0.9, lid: 0.4, smile: -0.6 }],
  ['sad', { brow: -0.9, browUp: 0.6, smile: -0.8, eyeY: -0.5 }],
  ['smirk', { smirk: 1, lid: 0.3, browR: 0.8 }],
];
export const FaceTest: React.FC = () => {
  const f = FACES[Math.min(FACES.length - 1, useCurrentFrame())][1];
  const p: Pose = { ...f };
  const h = headPos(p, NIO);
  return (
    <AbsoluteFill style={{ background: '#222' }}>
      <PixelShot><Cam pos={[h[0], h[1] - 0.05, h[2] + 0.9]} at={[h[0], h[1] - 0.05, h[2]]} fov={30} />
        <ambientLight intensity={1.6} /><directionalLight position={[1, 2, 2]} intensity={1.2} />
        <Character look={NIO} p={p} /></PixelShot>
    </AbsoluteFill>);
};
