// Outside Nio's building. The street runs along x. North side (z < -4.5): his building, his window on the 3rd floor at
// x = 1.15 (the same x as the bedroom window). South side (z > 4.5): the night market he never noticed.
// Built once; every exterior shot is a different camera on this same street.
import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Solid, toon, flat, rbox, cyl, sph, plane } from '../lib/toon';
import { Character, Look, Pose } from './Character';

export const NIO_WIN = { x: 1.15, y: 7.2, z: -4.5, w: 1.1, h: 1.3 };

const BRICK = '#6d5561', BRICK2 = '#5c4652', TRIM = '#c9bba8';

function FacadeWindow({ x, y, lit }: { x: number; y: number; lit: number }) {
  const glass = lit > 0.66 ? '#f2c37a' : lit > 0.33 ? '#8a7aa8' : '#2c2a40';
  return (
    <group position={[x, y, -4.45]}>
      <Solid geo={rbox(1.2, 1.4, 0.08, 0.02)} mat={toon(TRIM)} line={0.01} />
      <mesh geometry={plane(1.0, 1.2)} position={[0, 0, 0.045]} material={flat(glass)} />
      <Solid geo={rbox(0.05, 1.2, 0.06, 0.01)} mat={toon(TRIM)} position={[0, 0, 0.06]} line={0.006} />
    </group>
  );
}

/** Nio's own window seen from outside: an opening with a little lit room behind it, curtains, and (optionally) Nio. */
function NioWindow({ curtain, nio, nioPose }: { curtain: number; nio?: Look; nioPose?: Pose }) {
  const { x, y, w, h } = NIO_WIN;
  const cw = 0.12 + curtain * 0.42;
  return (
    <group position={[x, y, -4.5]}>
      {/* the room behind: back wall, warm lamp light */}
      <mesh geometry={plane(w + 0.6, h + 0.6)} position={[0, 0, -1.4]} material={toon('#8a6f78', '#ffb36b', 0.35)} />
      <pointLight position={[0.4, 0.3, -0.9]} intensity={2.2} distance={3} color="#ffc98a" />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 - cw / 2), 0.05, -0.25]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Solid key={i} geo={cyl(0.05, 0.055, h + 0.1, 10)} mat={toon(i % 2 ? '#3f4f6e' : '#4a5b7c')} position={[(i - 1) * (cw / 3), 0, (i % 2) * 0.015]} scale={[cw / 0.3, 1, 0.6]} line={0.008} />
          ))}
        </group>
      ))}
      {nio && nioPose && <group position={[0, -1.38, -0.55]}><Character look={nio} p={nioPose} /></group>}
      {/* frame */}
      <Solid geo={rbox(w + 0.16, 0.1, 0.16, 0.02)} mat={toon(TRIM)} position={[0, h / 2 + 0.05, 0.05]} line={0.01} />
      <Solid geo={rbox(w + 0.3, 0.1, 0.3, 0.02)} mat={toon(TRIM)} position={[0, -h / 2 - 0.05, 0.1]} line={0.01} />
      <Solid geo={rbox(0.1, h, 0.16, 0.02)} mat={toon(TRIM)} position={[-w / 2 - 0.05, 0, 0.05]} line={0.01} />
      <Solid geo={rbox(0.1, h, 0.16, 0.02)} mat={toon(TRIM)} position={[w / 2 + 0.05, 0, 0.05]} line={0.01} />
    </group>
  );
}

function Building({ curtain, nio, nioPose }: { curtain: number; nio?: Look; nioPose?: Pose }) {
  const { x, y, w, h } = NIO_WIN;
  // facade split around Nio's window so the opening is real
  const L = -8, R = 8, T = 13;
  const panels: [number, number, number, number][] = [
    [L, 0, x - w / 2, T],                 // left of the window
    [x + w / 2, 0, R, T],                 // right of it
    [x - w / 2, y + h / 2, x + w / 2, T], // above
    [x - w / 2, 0, x + w / 2, y - h / 2], // below
  ];
  const wins: [number, number, number][] = [];
  [1.6, 4.4, 7.2, 10.0].forEach((wy, fi) => [-6.2, -3.8, -1.4, 1.15, 3.6, 6.0].forEach((wx, ci) => {
    if (!(fi === 2 && ci === 3) && !(fi === 0 && ci === 1)) wins.push([wx, wy, ((fi * 7 + ci * 3) % 5) / 4]);
  }));
  return (
    <group>
      {panels.map(([x0, y0, x1, y1], i) => (
        <mesh key={i} geometry={plane(x1 - x0, y1 - y0)} position={[(x0 + x1) / 2, (y0 + y1) / 2, -4.5]} material={toon(BRICK)} />
      ))}
      {/* brick courses */}
      {Array.from({ length: 26 }).map((_, i) => {
        const yy = 0.5 * i;
        // courses stop at Nio's window opening
        if (yy > y - h / 2 - 0.08 && yy < y + h / 2 + 0.08) return (
          <group key={i}>
            <mesh geometry={plane(x - w / 2 - 0.1 - L, 0.02)} position={[(L + x - w / 2 - 0.1) / 2, yy, -4.49]} material={flat(BRICK2)} />
            <mesh geometry={plane(R - (x + w / 2 + 0.1), 0.02)} position={[(R + x + w / 2 + 0.1) / 2, yy, -4.49]} material={flat(BRICK2)} />
          </group>
        );
        return <mesh key={i} geometry={plane(16, 0.02)} position={[0, yy, -4.49]} material={flat(BRICK2)} />;
      })}
      {wins.map(([wx, wy, l], i) => <FacadeWindow key={i} x={wx} y={wy} lit={l} />)}
      <NioWindow curtain={curtain} nio={nio} nioPose={nioPose} />
      {/* front door with a lamp over it */}
      <group position={[-3.8, 0, -4.45]}>
        <Solid geo={rbox(1.3, 2.4, 0.1, 0.02)} mat={toon(TRIM)} position={[0, 1.2, 0]} />
        <Solid geo={rbox(1.1, 2.2, 0.1, 0.02)} mat={toon('#3a2e36')} position={[0, 1.1, 0.04]} line={0.008} />
        <Solid geo={sph(0.12)} mat={toon('#ffe2a8', '#ffcf7a', 1)} position={[0, 2.65, 0.15]} line={0.008} />
        <pointLight position={[0, 2.5, 0.6]} intensity={2} distance={4} color="#ffd29a" />
      </group>
      {/* roof edge */}
      <Solid geo={rbox(16.4, 0.3, 0.4, 0.04)} mat={toon(TRIM)} position={[0, 13, -4.35]} />
    </group>
  );
}

function Streetlight({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Solid geo={cyl(0.06, 0.08, 4.2, 10)} mat={toon('#2e2b36')} position={[0, 2.1, 0]} line={0.008} />
      <Solid geo={rbox(0.5, 0.12, 0.25, 0.04)} mat={toon('#2e2b36')} position={[0, 4.2, z > 0 ? -0.15 : 0.15]} line={0.008} />
      <Solid geo={rbox(0.36, 0.05, 0.18, 0.02)} mat={toon('#fff1c9', '#ffd98a', 1.2)} position={[0, 4.13, z > 0 ? -0.15 : 0.15]} line={0} />
    </group>
  );
}

const CANOPY = [['#c75a4a', '#efe6d2'], ['#3f6f8f', '#efe6d2'], ['#d9a441', '#3b2e36'], ['#5f8f5a', '#efe6d2'], ['#8f4f7f', '#efe6d2']];

export function Stall({ x, z, face, kind, i }: { x: number; z: number; face: 1 | -1; kind: 'dumplings' | 'shoes' | 'fruit' | 'lights' | 'tees'; i: number }) {
  const [c1, c2] = CANOPY[i % CANOPY.length];
  return (
    <group position={[x, 0, z]} rotation={[0, face === 1 ? 0 : Math.PI, 0]}>
      {/* table */}
      <Solid geo={rbox(2.2, 0.9, 0.8, 0.03)} mat={toon('#7a5a46')} position={[0, 0.45, 0]} />
      <Solid geo={rbox(2.3, 0.06, 0.9, 0.02)} mat={toon('#e8dcc4')} position={[0, 0.92, 0]} line={0.008} />
      {/* poles + striped canopy */}
      {[-1.05, 1.05].map((px) => <Solid key={px} geo={cyl(0.04, 0.04, 2.5, 8)} mat={toon('#3a3040')} position={[px, 1.25, -0.4]} line={0.007} />)}
      {Array.from({ length: 6 }).map((_, k) => (
        <Solid key={k} geo={rbox(0.4, 0.05, 1.3, 0.02)} mat={toon(k % 2 ? c1 : c2)} position={[-1.0 + k * 0.4, 2.45, 0.05]} rotation={[0.22, 0, 0]} line={0.007} />
      ))}
      <Solid geo={rbox(2.42, 0.22, 0.04, 0.02)} mat={toon(c1)} position={[0, 2.28, 0.68]} line={0.007} />
      {/* goods */}
      {kind === 'dumplings' && [-0.6, 0, 0.6].map((gx) => (
        <group key={gx} position={[gx, 0.95, 0.05]}>
          {[0, 1, 2].map((k) => <Solid key={k} geo={cyl(0.2, 0.2, 0.1, 16)} mat={toon('#c9a86a')} position={[0, 0.06 + k * 0.11, 0]} line={0.007} />)}
          <Solid geo={cyl(0.21, 0.21, 0.04, 16)} mat={toon('#b8955a')} position={[0, 0.37, 0]} line={0.007} />
        </group>
      ))}
      {kind === 'shoes' && [0, 1].map((row) => (
        <group key={row}>
          <Solid geo={rbox(2.0, 0.04 + row * 0.12, 0.3, 0.01)} mat={toon('#5b3d2e')} position={[0, 0.96 + row * 0.08, -0.05 - row * 0.3]} line={0.006} />
          {Array.from({ length: 6 }).map((_, k) => (
            // every shoe on the shelf is a left shoe: same shape, toe pointing the same way
            <Solid key={k} geo={rbox(0.12, 0.08, 0.26, 0.035)} mat={toon(['#e8e4dc', '#c75a4a', '#2e2b36', '#d9a441', '#3f6f8f', '#efe6d2'][(k + row) % 6])}
              position={[-0.8 + k * 0.32, 1.02 + row * 0.16, 0.02 - row * 0.3]} rotation={[0, 0.5, 0]} line={0.006} />
          ))}
        </group>
      ))}
      {kind === 'fruit' && Array.from({ length: 9 }).map((_, k) => (
        <Solid key={k} geo={sph(0.1)} mat={toon(['#e0b23c', '#c75a4a', '#7fa64a'][k % 3])} position={[-0.8 + (k % 5) * 0.4, 1.02 + Math.floor(k / 5) * 0.12, -0.1 + Math.floor(k / 5) * 0.15]} line={0.006} />
      ))}
      {kind === 'tees' && [-0.6, 0, 0.6].map((gx, k) => (
        <Solid key={k} geo={rbox(0.45, 0.5, 0.03, 0.02)} mat={toon(['#efe6d2', '#3f6f8f', '#c75a4a'][k])} position={[gx, 1.6, -0.38]} line={0.007} />
      ))}
      {kind === 'lights' && Array.from({ length: 6 }).map((_, k) => (
        // candles: jars with a little flame
        <group key={k} position={[-0.8 + k * 0.32, 0.96, -0.05 + (k % 2) * 0.12]}>
          <Solid geo={cyl(0.07, 0.07, 0.14, 12)} mat={toon(['#efe6d2', '#f4b8a8', '#a8d8f4'][k % 3])} position={[0, 0.07, 0]} line={0.006} />
          <mesh geometry={sph(0.025, 8, 6)} position={[0, 0.17, 0]} scale={[0.7, 1.3, 0.7]} material={toon('#ffd98a', '#ffb347', 2)} />
        </group>
      ))}
    </group>
  );
}

/** String lights hung across the aisle: a sagging line of bulbs. */
function StringLights({ x0, x1, z, y = 3.1, sag = 0.5, n = 18, seed = 0 }: { x0: number; x1: number; z: number; y?: number; sag?: number; n?: number; seed?: number }) {
  const cols = ['#ffd98a', '#ffb07a', '#fff1c9', '#ff9e8a'];
  return (
    <group>
      {Array.from({ length: n }).map((_, k) => {
        const u = k / (n - 1), x = x0 + (x1 - x0) * u, yy = y - sag * 4 * u * (1 - u);
        return <mesh key={k} geometry={sph(0.06, 8, 6)} material={toon(cols[(k + seed) % 4], cols[(k + seed) % 4], 1.6)} position={[x, yy, z]} />;
      })}
    </group>
  );
}

/** Sets the scene's clear colour (a <color attach> inside a group would attach to the group, not the scene). */
export const SceneBg: React.FC<{ color: string }> = ({ color }) => {
  const { scene } = useThree();
  scene.background = new THREE.Color(color);
  return null;
};

/** Buildings behind the market, so no shot ever looks into an empty void. */
function FarSide() {
  const blocks: [number, number, number][] = [[-12, 9, 4.5], [-7.5, 12, 4], [-3, 7, 4.5], [1.5, 10, 4], [6, 8, 4.5], [10.5, 13, 4]];
  return (
    <group>
      {blocks.map(([x, h, w], i) => (
        <group key={i} position={[x, 0, 15.5]}>
          <mesh geometry={plane(w, h)} position={[0, h / 2, 0]} rotation={[0, Math.PI, 0]} material={toon(i % 2 ? '#3a3046' : '#433650')} />
          {Array.from({ length: Math.floor(h / 1.6) * 3 }).map((_, k) => {
            const r = Math.floor(k / 3), c = k % 3; const lit = (k * 7 + i * 3) % 5 < 2;
            return <mesh key={k} geometry={plane(0.6, 0.8)} position={[(c - 1) * 1.2, 1.4 + r * 1.6, -0.02]} rotation={[0, Math.PI, 0]} material={flat(lit ? '#e8b86e' : '#2a2438')} />;
          })}
        </group>
      ))}
    </group>
  );
}

export const MARKET_STALLS: { x: number; z: number; face: 1 | -1; kind: 'dumplings' | 'shoes' | 'fruit' | 'lights' | 'tees' }[] = [
  { x: -5.5, z: 6.2, face: 1, kind: 'fruit' }, { x: -2.5, z: 6.2, face: 1, kind: 'dumplings' }, { x: 0.5, z: 6.2, face: 1, kind: 'tees' },
  { x: 3.5, z: 6.2, face: 1, kind: 'lights' }, { x: -4, z: 10.8, face: -1, kind: 'tees' }, { x: -1, z: 10.8, face: -1, kind: 'shoes' },
  { x: 2, z: 10.8, face: -1, kind: 'fruit' }, { x: 5, z: 10.8, face: -1, kind: 'dumplings' },
];

export const Exterior: React.FC<{ curtain?: number; nioInWindow?: { look: Look; pose: Pose }; children?: React.ReactNode }> = ({ curtain = 1, nioInWindow, children }) => (
  <group>
    <SceneBg color="#191629" />
    <FarSide />
    {/* ground: road, kerbs, sidewalks, the market plaza */}
    <mesh geometry={plane(40, 6)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={toon('#2d2a36')} />
    {Array.from({ length: 10 }).map((_, i) => <mesh key={i} geometry={plane(1.2, 0.12)} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 4, 0.005, 0]} material={flat('#cfc4a8')} />)}
    <Solid geo={rbox(40, 0.15, 1.5, 0.03)} mat={toon('#5a5562')} position={[0, 0.075, -3.75]} line={0.008} />
    <Solid geo={rbox(40, 0.15, 1.5, 0.03)} mat={toon('#5a5562')} position={[0, 0.075, 3.75]} line={0.008} />
    <mesh geometry={plane(40, 10)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 9.5]} material={toon('#4a4049')} />
    {/* crosswalk */}
    {Array.from({ length: 7 }).map((_, i) => <mesh key={i} geometry={plane(0.4, 5.6)} rotation={[-Math.PI / 2, 0, 0]} position={[-4.6 + i * 0.6, 0.006, 0]} material={flat('#d9d0bb')} />)}
    <Building curtain={curtain} nio={nioInWindow?.look} nioPose={nioInWindow?.pose} />
    {[-8, -2, 4, 10].map((x) => <Streetlight key={x} x={x} z={-3.3} />)}
    {/* bus-stop bench on the north sidewalk */}
    <group position={[2.4, 0, -3.95]}>
      <Solid geo={rbox(1.8, 0.07, 0.45, 0.02)} mat={toon('#4f7a6a')} position={[0, 0.46, 0]} />
      <Solid geo={rbox(1.8, 0.4, 0.06, 0.02)} mat={toon('#4f7a6a')} position={[0, 0.72, -0.2]} />
      {[-0.8, 0.8].map((x) => <Solid key={x} geo={rbox(0.06, 0.46, 0.4, 0.02)} mat={toon('#2e2b36')} position={[x, 0.23, 0]} line={0.007} />)}
    </group>
    {[-6, 0, 6].map((x) => <Streetlight key={x} x={x} z={3.3} />)}
    {MARKET_STALLS.map((s, i) => <Stall key={i} {...s} i={i} />)}
    <StringLights x0={-7} x1={7} z={6.9} y={3.0} seed={0} />
    <StringLights x0={-7} x1={7} z={10.1} y={3.0} seed={1} />
    {[-6, -2, 2, 6].map((x, i) => <StringLights key={x} x0={x} x1={x + 0.01} z={8.5} y={3.0} n={2} seed={i} />)}
    {/* the moon, far away */}
    <mesh geometry={sph(3, 20, 14)} position={[-30, 26, -60]} material={flat('#f3ead2')} />
    {/* light: cool night ambient, warm pools from lamps and the market */}
    <ambientLight intensity={1.0} color="#8a80a8" />
    <hemisphereLight args={['#7a78b0', '#3a2a2a', 0.8]} />
    <directionalLight position={[-6, 10, 4]} intensity={0.5} color="#b8c0ff" />
    {[-8, -2, 4, 10].map((x) => <pointLight key={`n${x}`} position={[x, 3.9, -2.9]} intensity={4} distance={7} decay={1.3} color="#ffd29a" />)}
    <pointLight position={[-3, 2.8, 8.5]} intensity={6} distance={9} decay={1.2} color="#ffb98a" />
    <pointLight position={[3, 2.8, 8.5]} intensity={6} distance={9} decay={1.2} color="#ffc8a0" />
    {children}
  </group>
);

/** A crowd member: a look and a slow idle. */
const ex = (skin: string, skinShade: string, hair: string, top: string, pants: string, shape: 'tri' | 'round' | 'long', hairStyle: 'crop' | 'puff' | 'bald', extra: Partial<Look> = {}): Look =>
  ({ skin, skinShade, hair, hairDark: hair, iris: '#2a1a12', top, topDark: top, pants, shoes: '#efe6d2', shape, hairStyle, ...extra });
export const EXTRAS: Look[] = [
  ex('#c99a7a', '#a87b5d', '#1f1a1a', '#5f8f5a', '#2b2a33', 'long', 'crop'),
  ex('#8a5a44', '#6c4434', '#1a1414', '#d9a441', '#3b4258', 'round', 'puff', { puff: true, lashes: true }),
  ex('#efd2bf', '#d1ae98', '#c9a46a', '#3f6f8f', '#5d6273', 'round', 'crop'),
  ex('#a8765a', '#875b43', '#2a1d10', '#c75a4a', '#2b2a33', 'tri', 'crop'),
  ex('#e9c9b0', '#c9a790', '#6a3f24', '#8f4f7f', '#3b4258', 'long', 'bald', { mustache: true }),
  ex('#6e4634', '#553426', '#141010', '#efe6d2', '#5d6273', 'round', 'crop'),
];

export const vec = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
