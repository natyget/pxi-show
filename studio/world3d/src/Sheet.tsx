import React from 'react';
import { PixelShot, Cam, Fonts } from './lib/Pixel';
import { Room } from './world/Room';
import { Character, NIO, MAYA } from './world/Character';
import { Phone } from './world/Phone';

// Character + room check still: Nio and Maya standing on the rug.
export const Sheet: React.FC<{ cam?: number[] }> = ({ cam = [0.2, 1.25, 3.6, 0, 0.95, 0, 38] }) => (
  <>
    <Fonts />
    <PixelShot>
      <Cam pos={[cam[0], cam[1], cam[2]]} at={[cam[3], cam[4], cam[5]]} fov={cam[6]} />
      <Room />
      <Character look={NIO} p={{ x: -0.35, z: 0.9, yaw: 0.25, breathe: 0, eyeX: 0.6, armR: { sx: -0.5, sz: -0.25, el: 1.9 } }}
        handR={<group position={[0, -0.05, 0.03]} rotation={[-1.9, 0, 0]}><Phone /></group>} />
      <Character look={MAYA} p={{ x: 0.45, z: 0.9, yaw: -0.3, eyeX: -0.7, lid: 0.45, brow: 0.3, smile: 0.5, lean: 0.05, armL: { sx: 0, sz: 0.05, el: 0.3 } }} />
    </PixelShot>
  </>
);
