// One rig for every character: Nio, Maya and the weird ones are this body with a different look.
// Units are metres-ish; the head is big (cartoon), the hairline always sits ABOVE the brows.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Solid, toon, flat, sph, cap, rbox, cone, INK } from '../lib/toon';

export type Look = {
  skin: string; hair: string; top: string; topDark: string; pants: string; shoes: string;
  hairStyle: 'nio' | 'bob';
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
  const hair = toon(look.hair);
  return (
    <group rotation={[p.headPitch ?? 0, p.headYaw ?? 0, p.headTilt ?? 0]}>
      <group position={[0, HEAD_R * 1.05, 0]}>
        {/* skull + jaw */}
        <Solid geo={sph(HEAD_R, 32, 24)} mat={toon(look.skin)} scale={[1, 1.04, 0.95]} line={L} />
        <Solid geo={sph(0.13, 28, 18)} mat={toon(look.skin)} position={[0, -0.065, 0.025]} scale={[0.92, 0.78, 0.88]} line={L} />
        {/* ears */}
        <Solid geo={sph(0.038)} mat={toon(look.skin)} position={[HEAD_R * 0.98, -0.01, -0.01]} scale={[0.45, 1, 0.75]} line={L} />
        <Solid geo={sph(0.038)} mat={toon(look.skin)} position={[-HEAD_R * 0.98, -0.01, -0.01]} scale={[0.45, 1, 0.75]} line={L} />
        <Eye side={1} p={p} look={look} />
        <Eye side={-1} p={p} look={look} />
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
        {look.hairStyle === 'nio' ? <NioHair mat={hair} /> : <BobHair mat={hair} />}
      </group>
    </group>
  );
}

// Nio: short spiky hair swept up and back, with a darker faded undercut on the sides. The hairline sits well above the brows.
const SPIKES: { pos: [number, number, number]; q: [number, number, number, number]; r: number; h: number }[] = (() => {
  const out: { pos: [number, number, number]; q: [number, number, number, number]; r: number; h: number }[] = [];
  const up = new THREE.Vector3(0, 1, 0), back = new THREE.Vector3(0, 0.2, -0.6);
  // rings from the front hairline over the crown; azimuth 0 = forehead
  const rings = [
    { pol: 0.9, n: 5, spread: 1.6, h: 0.075, r: 0.048, lift: 0.75 },   // front row, flicked up
    { pol: 0.6, n: 7, spread: 2.6, h: 0.07, r: 0.05, lift: 0.45 },
    { pol: 0.32, n: 6, spread: 3.6, h: 0.065, r: 0.05, lift: 0.25 },
    { pol: 0.08, n: 2, spread: 1.0, h: 0.06, r: 0.05, lift: 0.1 },
  ];
  rings.forEach((g, gi) => {
    for (let i = 0; i < g.n; i++) {
      const az = g.n === 1 ? 0 : -g.spread / 2 + (g.spread * i) / (g.n - 1) + (gi % 2 ? 0.12 : -0.08);
      const dir = new THREE.Vector3(Math.sin(g.pol) * Math.sin(az), Math.cos(g.pol), Math.sin(g.pol) * Math.cos(az));
      const R = HEAD_R * 0.98;
      const aim = dir.clone().multiplyScalar(1 - g.lift).add(up.clone().multiplyScalar(g.lift)).add(back.clone().multiplyScalar(0.6)).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(up, aim);
      const base = dir.clone().multiplyScalar(R);
      const tip = aim.clone().multiplyScalar(g.h / 2);
      out.push({ pos: [base.x + tip.x, base.y * 1.04 + tip.y, base.z * 0.97 + tip.z], q: [q.x, q.y, q.z, q.w], r: g.r * (0.9 + ((i * 7) % 3) * 0.08), h: g.h * (0.85 + ((i * 5) % 4) * 0.1) });
    }
  });
  return out;
})();

function NioHair({ mat }: { mat: THREE.Material }) {
  const fade = toon('#3b2617');
  return (
    <group>
      {/* faded undercut: a tight dark cap over the sides and back */}
      <Solid geo={sph(HEAD_R * 1.02, 32, 20, 0, Math.PI * 0.55)} mat={fade} rotation={[-1.05, 0, 0]} scale={[1.01, 1.05, 0.97]} line={L} />
      {/* the top mass the spikes grow out of */}
      <Solid geo={sph(HEAD_R * 0.97, 28, 16)} mat={mat} position={[0, 0.07, -0.015]} scale={[0.97, 0.7, 1.0]} line={L} />
      {SPIKES.map((s, i) => (
        <Solid key={i} geo={cone(s.r, s.h)} mat={mat} position={s.pos} quaternion={new THREE.Quaternion(...s.q)} line={L} />
      ))}
    </group>
  );
}

// Maya: a jaw-length bob. Side curtains hang beside the face (|x| > 0.13), the fringe ends above the brows.
function BobHair({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <Solid geo={sph(HEAD_R * 1.1, 32, 20, 0, Math.PI * 0.44)} mat={mat} rotation={[-0.38, 0, 0]} scale={[1.04, 1.08, 1]} line={L} />
      <Solid geo={sph(HEAD_R * 1.12, 28, 18, 0, Math.PI * 0.7)} mat={mat} rotation={[-1.35, 0, 0]} scale={[1.05, 1.1, 1]} line={L} />
      {[1, -1].map((s) => (
        <Solid key={s} geo={cap(0.06, 0.14)} mat={mat} position={[s * 0.165, -0.03, 0.0]} rotation={[0.1, 0, s * 0.08]} scale={[0.75, 1, 1.25]} line={L} />
      ))}
      {/* side-parted fringe, ends at the brow line top */}
      <Solid geo={sph(0.08)} mat={mat} position={[0.04, 0.15, 0.09]} rotation={[0.6, 0, -0.35]} scale={[1.5, 0.5, 0.8]} line={L} />
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
    <group position={[p.x ?? 0, p.y ?? 0, p.z ?? 0]} rotation={[0, p.yaw ?? 0, 0]}>
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
              <Solid geo={sph(HEAD_R * 1.22, 28, 18, 0, Math.PI * 0.68)} mat={toon(look.top)} position={[0, HEAD_R * 1.08, -0.02]} rotation={[-0.5, 0, 0]} scale={[1, 1.08, 1]} line={L} />
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
