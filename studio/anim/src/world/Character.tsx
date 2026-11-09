// One rig for every character: Nio, Maya and the weird ones are this body with a different look.
// Units are metres-ish; the head is big (cartoon), the hairline always sits ABOVE the brows.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Solid, toon, toonVC, flat, sph, cap, rbox, INK } from '../lib/toon';
import { headGeometry, hairGeometry } from './sculpt';

const HEAD_GEO = headGeometry();
const hairCache = new Map<string, THREE.BufferGeometry>();
const hairGeo = (look: Look) => {
  const k = `${look.hairStyle}|${look.hair}`;
  if (!hairCache.has(k)) hairCache.set(k, hairGeometry(look.hairStyle === 'nio' ? 'crop' : 'bob', look.hair, look.hairDark ?? '#2a1a12'));
  return hairCache.get(k)!;
};

export type Look = {
  skin: string; hair: string; top: string; topDark: string; pants: string; shoes: string;
  hairStyle: 'nio' | 'bob';
  hairDark?: string;
  shades?: boolean;     // sunglasses (at night)
  height?: number;      // overall scale
  hood?: boolean;
};

export const NIO: Look = { skin: '#ecdcd0', hair: '#6a3f24', top: '#4d63c4', topDark: '#3c4fa3', pants: '#5d6273', shoes: '#fafafa', hairStyle: 'nio', hood: true };
export const MAYA: Look = { skin: '#e9e4e0', hair: '#5c4423', top: '#9b5d80', topDark: '#7d4866', pants: '#2b2a33', shoes: '#d9cdb3', hairStyle: 'bob' };

export type Arm = { sx: number; sy: number; sz: number; el: number };   // shoulder euler + elbow bend
export type Leg = { hip: number; knee: number; spread?: number };
export type Pose = {
  x?: number; y?: number; z?: number; yaw?: number;
  lean?: number; twist?: number; breathe?: number;
  headYaw?: number; headPitch?: number; headTilt?: number;
  eyeX?: number; eyeY?: number;   // -1..1 pupil direction
  lid?: number;                   // 0 open .. 1 closed
  eyeOpen?: number;               // 1 normal, 1.25 wide
  brow?: number;                  // -1 worried .. 0 .. 1 angry
  browUp?: number;                // raise
  mouth?: number;                 // 0 closed .. 1 open "O"
  smirk?: number;                 // one corner only
  browR?: number;                 // raise the right brow alone
  smile?: number;                 // -1 frown .. 1 smile (closed mouth)
  armL?: Partial<Arm>; armR?: Partial<Arm>;
  legL?: Leg; legR?: Leg;
  hoodUp?: number;
};

const D = { sx: 0, sy: 0, sz: 0.12, el: 0.15 };
const HEAD_R = 0.17;
const L = 0.011; // outline width

// Eyes: almond shaped (lower lid always a little up), a heavy upper lid that rests ~30% down, a big dark iris.
// No round staring discs: the lids and brows do the acting.
function Eye({ side, p, look }: { side: 1 | -1; p: Pose; look: Look }) {
  const open = p.eyeOpen ?? 1;
  const up = Math.min(1, Math.max(0, 0.22 + (p.lid ?? 0) * 0.78 - (open - 1) * 1.2));
  const R = 0.043;
  const upG = useMemo(() => sph(R * 1.08, 20, 14, 0, Math.PI * (0.05 + up * 0.95)), [up]);
  const lowG = useMemo(() => sph(R * 1.06, 20, 10, Math.PI * 0.84, Math.PI * 0.16), []);
  const px = Math.max(-0.7, Math.min(0.7, p.eyeX ?? 0)) * 0.013, py = (p.eyeY ?? 0) * 0.01;
  const lidSkin = '#dcc8bc';
  return (
    <group position={[side * 0.064, 0.0, 0.13]} rotation={[0, side * 0.36, side * -0.06]} scale={[1.05, 0.8, 0.5]}>
      <Solid geo={sph(R)} mat={flat('#f4f1ee')} line={L * 0.7} />
      <mesh geometry={sph(0.021, 14, 10)} material={flat('#3a2418')} position={[px, py, 0.036]} scale={[1, 1.15, 0.45]} />
      <mesh geometry={sph(0.011, 10, 8)} material={flat(INK)} position={[px, py, 0.042]} scale={[1, 1.1, 0.4]} />
      <mesh geometry={sph(0.005, 6, 6)} material={flat('#ffffff')} position={[px + 0.007, py + 0.008, 0.045]} />
      <Solid geo={upG} mat={toon(lidSkin)} line={L * 0.9} />
      <Solid geo={lowG} mat={toon(lidSkin)} line={0} />
    </group>
  );
}

function Head({ p, look }: { p: Pose; look: Look }) {
  const brow = p.brow ?? 0, up = (p.browUp ?? 0) * 0.016;
  const m = Math.max(0, Math.min(1, p.mouth ?? 0)), smile = p.smile ?? 0, smirk = p.smirk ?? 0;
  const lidDrop = (p.lid ?? 0) * 0.008;
    return (
    <group rotation={[p.headPitch ?? 0, p.headYaw ?? 0, p.headTilt ?? 0]}>
      <group position={[0, HEAD_R * 1.05, 0]}>
        {/* skull + jaw */}
        <Solid geo={HEAD_GEO} mat={toon(look.skin)} line={L} />
        {/* ears */}
        <Solid geo={sph(0.038)} mat={toon(look.skin)} position={[HEAD_R * 0.98, -0.01, -0.01]} scale={[0.45, 1, 0.75]} line={L} />
        <Solid geo={sph(0.038)} mat={toon(look.skin)} position={[-HEAD_R * 0.98, -0.01, -0.01]} scale={[0.45, 1, 0.75]} line={L} />
        <Eye side={1} p={p} look={look} />
        <Eye side={-1} p={p} look={look} />
        {look.shades && (
          <group position={[0, 0.005, 0.155]}>
            {[1, -1].map((s2) => <Solid key={s2} geo={rbox(0.075, 0.045, 0.02, 0.012)} mat={flat('#111014')} position={[s2 * 0.064, 0, 0]} rotation={[0, s2 * 0.3, 0]} line={L * 0.6} />)}
            <mesh geometry={rbox(0.06, 0.01, 0.01, 0.004)} material={flat('#111014')} />
          </group>
        )}
        {/* nose: a small nub */}
        <Solid geo={sph(0.02, 12, 10)} mat={toon(look.skin)} position={[0, -0.045, 0.158]} scale={[0.85, 1, 0.75]} line={0} />
        {/* brows: thick, they carry the expression. brow>0 = inner ends down (annoyed), <0 = inner ends up (worried) */}
        {[1, -1].map((s) => {
          const raise = up + (s === 1 ? (p.browR ?? 0) * 0.016 : 0) - lidDrop;
          return (
            <Solid key={s} geo={rbox(0.07, 0.019, 0.022, 0.009)} mat={flat('#2a1a12')}
              position={[s * 0.066, 0.047 + raise, 0.15]}
              rotation={[0, s * 0.34, s * (brow * 0.3 - 0.06)]} line={0} />
          );
        })}
        {/* mouth: small. Talking opens it a little, never a cartoon "O". */}
        <group position={[0, -0.098, 0.146]} rotation={[-0.3, 0, smirk * 0.12]}>
          {m > 0.08 ? (
            <mesh geometry={rbox(0.036 - m * 0.006, 0.006 + m * 0.02, 0.008, 0.004)} material={flat('#3a1a1e')} />
          ) : (
            [1, -1].map((s) => (
              <mesh key={s} geometry={rbox(0.022, 0.0065, 0.008, 0.003)} material={flat('#3a1a1e')}
                position={[s * 0.01, (smile + (s === 1 ? smirk : 0)) * 0.003, 0]} rotation={[0, 0, s * (smile + (s === 1 ? smirk : 0)) * 0.3]} />
            ))
          )}
        </group>
        {/* hair */}
        <Solid geo={hairGeo(look)} mat={toonVC()} line={L} />
      </group>
    </group>
  );
}

function Limb({ a, look, side, sleeve, children }: { a: Arm; look: Look; side: 1 | -1; sleeve: string; children?: React.ReactNode }) {
  return (
    <group rotation={[a.sx, a.sy, side * a.sz]}>
      <Solid geo={cap(0.048, 0.17)} mat={toon(sleeve)} position={[0, -0.12, 0]} line={L} />
      <group position={[0, -0.24, 0]} rotation={[-a.el, 0, 0]}>
        <Solid geo={cap(0.04, 0.15)} mat={toon(sleeve)} position={[0, -0.1, 0]} line={L} />
        <group position={[0, -0.22, 0]}>
          <Solid geo={sph(0.047)} mat={toon(look.skin)} scale={[0.85, 1, 0.75]} line={L} />
          <Solid geo={cap(0.016, 0.03)} mat={toon(look.skin)} position={[side * -0.035, 0.005, 0.02]} rotation={[0.4, 0, side * 0.6]} line={L} />
          {children}
        </group>
      </group>
    </group>
  );
}

function LegG({ l, look, side }: { l: Leg; look: Look; side: 1 | -1 }) {
  return (
    <group position={[side * 0.07, 0, 0]} rotation={[-l.hip, 0, side * (l.spread ?? 0)]}>
      <Solid geo={cap(0.065, 0.2)} mat={toon(look.pants)} position={[0, -0.15, 0]} line={L} />
      <group position={[0, -0.3, 0]} rotation={[l.knee, 0, 0]}>
        <Solid geo={cap(0.058, 0.2)} mat={toon(look.pants)} position={[0, -0.14, 0]} line={L} />
        <Solid geo={rbox(0.12, 0.07, 0.2, 0.03)} mat={toon(look.shoes)} position={[0, -0.3, 0.04]} line={L} />
      </group>
    </group>
  );
}

/** The whole character. `hand` is rendered in the right hand (e.g. the phone). */
export const Character: React.FC<{ p: Pose; look: Look; handR?: React.ReactNode; handL?: React.ReactNode }> = ({ p, look, handR, handL }) => {
  const b = (p.breathe ?? 0) * 0.012;
  const aL = { ...D, ...p.armL }, aR = { ...D, ...p.armR };
  const legL = p.legL ?? { hip: 0, knee: 0 }, legR = p.legR ?? { hip: 0, knee: 0 };
  const hood = p.hoodUp ?? 0;
  return (
    <group position={[p.x ?? 0, p.y ?? 0, p.z ?? 0]} rotation={[0, p.yaw ?? 0, 0]} scale={look.height ?? 1}>
      {/* hips at 0.62 */}
      <group position={[0, 0.62, 0]}>
        <LegG l={legL} look={look} side={-1} />
        <LegG l={legR} look={look} side={1} />
        <Solid geo={sph(0.13)} mat={toon(look.pants)} position={[0, 0.02, 0]} scale={[1.05, 0.55, 0.85]} line={L} />
        {/* torso */}
        <group rotation={[p.lean ?? 0, p.twist ?? 0, 0]}>
          <group scale={[1, 1 + b, 1]}>
            <Solid geo={cap(0.15, 0.18)} mat={toon(look.top)} position={[0, 0.2, 0]} scale={[1.08, 1, 0.82]} line={L} />
            {look.hood && hood < 0.5 && (
              <Solid geo={sph(0.1)} mat={toon(look.topDark)} position={[0, 0.39, -0.1]} scale={[1.5, 0.7, 0.9]} line={L} />
            )}
            {look.hood && <Solid geo={rbox(0.16, 0.06, 0.04, 0.02)} mat={toon(look.topDark)} position={[0, 0.12, 0.12]} line={L * 0.8} />}
          </group>
          {/* shoulders and arms */}
          <group position={[0.18, 0.36, 0]}>
            <Limb a={aR} look={look} side={1} sleeve={look.top}>{handR}</Limb>
          </group>
          <group position={[-0.18, 0.36, 0]}>
            <Limb a={aL} look={look} side={-1} sleeve={look.top}>{handL}</Limb>
          </group>
          {/* neck + head */}
          <group position={[0, 0.42 + b * 2, 0]}>
            <Solid geo={cap(0.05, 0.04)} mat={toon(look.skin)} position={[0, 0.02, 0]} line={L} />
            <Head p={p} look={look} />
            {look.hood && hood >= 0.5 && (
              <Solid geo={sph(HEAD_R * 1.2, 28, 18, 0, Math.PI * 0.62)} mat={toon(look.top)} position={[0, HEAD_R * 1.12, -0.05]} rotation={[-1.05, 0, 0]} scale={[1.02, 1.1, 1.05]} line={L} />
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
