import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PixelShot, Cam } from './lib/Pixel';
import { Character, NIO, MAYA } from './world/Character';

// Character check: head and shoulders on a plain backdrop. who: 0 Nio, 1 Maya. yaw turns the character.
export const CharSheet: React.FC<{ who?: number; yaw?: number; face?: number }> = ({ who = 0, yaw = 0, face = 0 }) => {
  const faces = [{}, { brow: 0.55, lid: 0.3, browR: 1.1, mouth: 0.4 }, { smirk: 0.6, lid: 0.45, brow: 0.1 }, { brow: -0.6, browUp: 0.8, eyeOpen: 1.1 }];
  return (
    <AbsoluteFill>
      <PixelShot bg="#4a3f4a">
        <Cam pos={[0, 1.38, 1.15]} at={[0, 1.3, 0]} fov={30} />
        <ambientLight intensity={1.4} color="#b8a8b0" />
        <directionalLight position={[1, 2, 2]} intensity={1.6} color="#fff0e0" />
        <mesh position={[0, 1, -1]}><planeGeometry args={[6, 6]} /><meshBasicMaterial color="#4a3f4a" /></mesh>
        <Character look={who ? MAYA : NIO} p={{ yaw, ...faces[face] }} />
      </PixelShot>
    </AbsoluteFill>
  );
};
