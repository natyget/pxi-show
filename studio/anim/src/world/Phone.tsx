// The phone. In the world its screen is a small glowing PXI screen (pixel); inserts show the crisp real UI on top.
import React from 'react';
import { Solid, toon, rbox, plane, useCanvasTex } from '../lib/toon';

export const Phone: React.FC<{ on?: number; buzz?: number }> = ({ on = 1, buzz = 0 }) => {
  const scr = useCanvasTex(18, 38, (c) => {
    c.fillStyle = '#0d0b14'; c.fillRect(0, 0, 18, 38);
    c.fillStyle = '#2e6bff'; c.fillRect(2, 4, 14, 3);                    // header
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#3a3550' : '#4b4468'; c.fillRect(2, 10 + i * 6, 14, 4); }
    c.fillStyle = '#a523ef'; c.fillRect(6, 33, 6, 2);                     // tab
  });
  return (
    <group position={[buzz * 0.006, 0, 0]}>
      <Solid geo={rbox(0.075, 0.155, 0.01, 0.008)} mat={toon('#d9d2c5')} line={0.008} />
      <mesh geometry={rbox(0.022, 0.03, 0.004, 0.004)} position={[-0.018, 0.05, -0.006]} material={toon('#2b2a33')} />
      <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0055]}>
        <meshBasicMaterial map={scr} color={on > 0.5 ? '#ffffff' : '#222'} toneMapped={false} />
      </mesh>
    </group>
  );
};
