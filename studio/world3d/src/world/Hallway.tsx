// Nio's building, inside: one hallway set used three ways (doors upstairs, the lobby, the stairwell board).
// Layout: back wall at z = -1.2, floor y = 0, ceiling 2.6, the hall runs along x from -4 to 4.
import React from 'react';
import { Solid, toon, flat, rbox, cyl, sph, plane, useCanvasTex } from '../lib/toon';
import { SceneBg } from './Exterior';

const WALL = '#8a7a6c', WAIN = '#6b5a50', TRIM = '#4a3a33', FLOOR = '#5d5550', DOOR = '#5b3d2e';

const Plate: React.FC<{ text: string }> = ({ text }) => {
  const tx = useCanvasTex(56, 28, (c) => { c.fillStyle = '#d9c27a'; c.fillRect(0, 0, 56, 28); c.fillStyle = '#2a2018'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; c.fillText(text, 28, 22); }, [text]);
  return <mesh geometry={plane(0.28, 0.14)}><meshBasicMaterial map={tx} toneMapped={false} /></mesh>;
};

export const Door: React.FC<{ x: number; num: string; open?: number }> = ({ x, num, open = 0 }) => (
  <group position={[x, 0, -1.18]}>
    <Solid geo={rbox(1.06, 2.16, 0.06, 0.01)} mat={toon(TRIM)} position={[0, 1.08, 0]} line={0.008} />
    {/* the dark room behind an open door */}
    <mesh geometry={plane(0.92, 2.06)} position={[0, 1.03, 0.032]} material={flat('#2a2226')} />
    <group position={[-0.46, 0, 0.06]} rotation={[0, open * 1.3, 0]}>
      <Solid geo={rbox(0.92, 2.06, 0.05, 0.01)} mat={toon(DOOR)} position={[0.46, 1.03, 0]} line={0.008} />
      <Solid geo={sph(0.03)} mat={toon('#c9a86a')} position={[0.82, 1.0, 0.04]} line={0.006} />
      <group position={[0.46, 1.6, 0.03]}><Plate text={num} /></group>
    </group>
  </group>
);

/** The cork board by the stairs. `flyer` is a canvas texture (his flyer, maybe with green pen on it). */
export const Board: React.FC<{ x: number; flyer?: any }> = ({ x, flyer }) => (
  <group position={[x, 1.45, -1.17]}>
    <Solid geo={rbox(1.1, 0.8, 0.04, 0.01)} mat={toon('#b8875a')} line={0.008} />
    {[[-0.38, 0.18, '#efe6d2', 0.05], [0.4, -0.2, '#a8d8f4', -0.08], [-0.35, -0.22, '#f4b8a8', 0.06]].map(([px, py, c, r], i) =>
      <mesh key={i} geometry={plane(0.2, 0.26)} position={[px as number, py as number, 0.025]} rotation={[0, 0, r as number]} material={flat(c as string)} />)}
    {flyer && <mesh geometry={plane(0.34, 0.46)} position={[0.04, 0.02, 0.026]} rotation={[0, 0, -0.03]}><meshBasicMaterial map={flyer} toneMapped={false} /></mesh>}
  </group>
);

/** The lobby desk he sets up: folding table, a bowl of mints, a cash box, his sign. */
export const ReturnsDesk: React.FC<{ x: number; z: number; sign?: any }> = ({ x, z, sign }) => (
  <group position={[x, 0, z]}>
    <Solid geo={rbox(1.4, 0.04, 0.6, 0.01)} mat={toon('#d8d2c4')} position={[0, 0.74, 0]} />
    {[[-0.62, -0.24], [0.62, -0.24], [-0.62, 0.24], [0.62, 0.24]].map(([a, b]) => <Solid key={`${a}${b}`} geo={cyl(0.015, 0.015, 0.72, 6)} mat={toon('#6c747c')} position={[a, 0.36, b]} line={0.006} />)}
    <Solid geo={cyl(0.12, 0.08, 0.06, 14)} mat={toon('#a8d8f4')} position={[0.35, 0.79, 0.05]} line={0.006} />
    {[[-0.03, 0.01], [0.04, -0.02], [0.0, 0.04]].map(([a, b], i) => <mesh key={i} geometry={sph(0.025, 8, 6)} position={[0.35 + a, 0.83, 0.05 + b]} material={flat(i % 2 ? '#efe6d2' : '#c75a4a')} />)}
    <Solid geo={rbox(0.22, 0.08, 0.15, 0.01)} mat={toon('#3f6f8f')} position={[-0.4, 0.8, 0.0]} line={0.006} />
    {/* the sign, taped to the front of the table */}
    {sign && <mesh geometry={plane(0.9, 0.5)} position={[0, 0.5, 0.31]}><meshBasicMaterial map={sign} toneMapped={false} /></mesh>}
  </group>
);

export const Hallway: React.FC<{ children?: React.ReactNode; lobby?: boolean }> = ({ children, lobby }) => (
  <group>
    <SceneBg color="#201a1e" />
    <mesh geometry={plane(10, 5)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.2]} material={toon(FLOOR)} />
    {Array.from({ length: 12 }).map((_, i) => <mesh key={i} geometry={plane(0.01, 5)} rotation={[-Math.PI / 2, 0, 0]} position={[-4 + i * 0.7, 0.001, 1.2]} material={flat('#4c4540')} />)}
    <mesh geometry={plane(10, 2.6)} position={[0, 1.3, -1.2]} material={toon(WALL)} />
    <mesh geometry={plane(10, 2.6)} position={[0, 1.3, 3.6]} rotation={[0, Math.PI, 0]} material={toon(WALL)} />
    <mesh geometry={plane(5, 2.6)} position={[-4.5, 1.3, 1.2]} rotation={[0, Math.PI / 2, 0]} material={toon(WALL)} />
    <mesh geometry={plane(5, 2.6)} position={[4.5, 1.3, 1.2]} rotation={[0, -Math.PI / 2, 0]} material={toon(WALL)} />
    <Solid geo={rbox(10, 0.9, 0.03, 0.01)} mat={toon(WAIN)} position={[0, 0.45, -1.19]} line={0.006} />
    <Solid geo={rbox(10, 0.04, 0.06, 0.01)} mat={toon(TRIM)} position={[0, 0.91, -1.17]} line={0.006} />
    <mesh geometry={plane(10, 5)} rotation={[Math.PI / 2, 0, 0]} position={[0, 2.6, 1.2]} material={toon('#d8cfc0')} />
    {[-2.5, 0, 2.5].map((x) => <group key={x}>
      <Solid geo={cyl(0.18, 0.18, 0.05, 16)} mat={toon('#fff1c9', '#ffe2a8', 1.2)} position={[x, 2.57, 0.2]} line={0} />
      <pointLight position={[x, 2.3, 0.4]} intensity={1.3} distance={5} decay={1.3} color="#ffe8d0" />
    </group>)}
    {lobby && <>
      {/* mailboxes */}
      <group position={[-2.6, 1.3, -1.16]}>
        <Solid geo={rbox(1.2, 0.9, 0.08, 0.01)} mat={toon('#9a8e7a')} line={0.008} />
        {Array.from({ length: 12 }).map((_, k) => <Solid key={k} geo={rbox(0.26, 0.17, 0.02, 0.005)} mat={toon('#b8ad98')} position={[-0.42 + (k % 4) * 0.28, 0.3 - Math.floor(k / 4) * 0.22, 0.05]} line={0.005} />)}
      </group>
      {/* the front door's glass, night outside */}
      <group position={[2.6, 0, -1.17]}>
        <Solid geo={rbox(1.3, 2.3, 0.06, 0.01)} mat={toon(TRIM)} position={[0, 1.15, 0]} line={0.008} />
        <mesh geometry={plane(1.0, 1.6)} position={[0, 1.3, 0.035]} material={flat('#2c2a40')} />
      </group>
    </>}
    <ambientLight intensity={1.5} color="#d0c4c0" />
    <hemisphereLight args={['#e8d8c8', '#4a3a32', 0.9]} />
    {children}
  </group>
);

/** A lit glow-stick bracelet (in a hand group: it sits round the wrist). */
export const GlowStick: React.FC<{ color?: string }> = ({ color = '#9dff8a' }) => (
  <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.05, 0.008, 6, 18]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
);

/** A laptop on a desk, screen texture optional. Opens toward +z in its own frame. */
export const Laptop: React.FC<{ screen?: any; open?: number }> = ({ screen, open = 1 }) => (
  <group>
    <Solid geo={rbox(0.34, 0.015, 0.24, 0.006)} mat={toon('#b8bcc4')} line={0.006} />
    <group position={[0, 0.008, -0.12]} rotation={[-(Math.PI / 2) * open - 0.25 * open, 0, 0]}>
      <Solid geo={rbox(0.34, 0.012, 0.23, 0.006)} mat={toon('#b8bcc4')} position={[0, 0, 0.115]} line={0.006} />
      {screen && <mesh geometry={plane(0.31, 0.2)} position={[0, -0.0065, 0.115]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial map={screen} toneMapped={false} /></mesh>}
    </group>
  </group>
);
