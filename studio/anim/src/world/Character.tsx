// One rig for every character. Heads are sculpted per face shape; hair and the flat 2D face are cut from the same head
// (see sculpt.ts), so nothing pokes through, floats or seams. Clothes never overlap the head: crewnecks and jackets end
// at the neck, no hoods over hair.
import React from 'react';
import * as THREE from 'three';
import { Solid, toon, toonVC, flat, sph, cap, rbox, INK } from '../lib/toon';
import { head, hairGeometry, faceGeometry, puffGeometry, FaceShape, HairStyle, HEAD_R } from './sculpt';
import { faceTexture } from './face';

export type Look = {
  skin: string; skinShade: string; hair: string; hairDark: string; iris: string;
  top: string; topDark: string; sleeve?: string; pants: string; shoes: string;
  shape: FaceShape; hairStyle: HairStyle;
  build?: number;          // shoulder width multiplier
  height?: number;         // overall scale
  eyeScale?: number; restLid?: number;   // per-character eye size and resting lid (confidence)
  suit?: boolean; shades?: boolean; puff?: boolean; hoops?: boolean; mustache?: boolean; lashes?: boolean; blush?: number;
};

/** Nio: light skin, triangular face, short black textured crop with a fade, broad shoulders, oversized crewneck. */
export const NIO: Look = {
  skin: '#d8a27c', skinShade: '#b9805c', hair: '#141011', hairDark: '#2a1f1c', iris: '#3b2416',
  top: '#c4683a', topDark: '#a2532c', pants: '#34333d', shoes: '#f4f2ee', shape: 'hero', hairStyle: 'crop', build: 1.16, eyeScale: 0.86, restLid: 0.22,
};
/** Maya: deep brown skin, round face, curly puff, gold hoops, oversized varsity jacket. */
export const MAYA: Look = {
  skin: '#8d5a3d', skinShade: '#6e4330', hair: '#16100f', hairDark: '#16100f', iris: '#2a160c',
  top: '#3f6b4f', topDark: '#2f523c', sleeve: '#e8dcc4', pants: '#2b2a33', shoes: '#e8dcc4', shape: 'round', hairStyle: 'puff',
  puff: true, hoops: true, lashes: true, blush: 0.6, build: 0.98,
};

export type Arm = { sx: number; sy: number; sz: number; el: number };   // shoulder euler + elbow bend
export type Leg = { hip: number; knee: number; spread?: number };
export type Pose = {
  x?: number; y?: number; z?: number; yaw?: number; pitch?: number; roll?: number;   // pitch/roll tip the whole body (lying down, falling)
  lean?: number; twist?: number; breathe?: number; squash?: number;
  headYaw?: number; headPitch?: number; headTilt?: number;
  eyeX?: number; eyeY?: number; lid?: number; eyeOpen?: number; wide?: number;
  brow?: number; browUp?: number; browR?: number;
  mouth?: number; smile?: number; smirk?: number; sneeze?: number; sweat?: number;
  armL?: Partial<Arm>; armR?: Partial<Arm>;
  legL?: Leg; legR?: Leg;
};

const D = { sx: 0, sy: 0, sz: 0.12, el: 0.15 };
const L = 0.011; // outline width

const puffGeo = puffGeometry(0.13);
const faceMats = new Map<THREE.Texture, THREE.Material>();
const faceMat = (t: THREE.Texture) => {
  let m = faceMats.get(t);
  if (!m) { m = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); faceMats.set(t, m); }
  if (faceMats.size > 500) faceMats.clear();
  return m;
};

function Head({ p, look, children }: { p: Pose; look: Look; children?: React.ReactNode }) {
  const h = head(look.shape);
  const tex = faceTexture({
    eyeX: p.eyeX ?? 0, eyeY: p.eyeY ?? 0, lid: Math.max(p.lid ?? 0, (look.restLid ?? 0) * (1 - (p.wide ?? 0) * 1.5)), open: p.eyeOpen ?? 1, wide: p.wide ?? 0,
    brow: p.brow ?? 0, browUp: p.browUp ?? 0, browR: p.browR ?? 0,
    mouth: p.mouth ?? 0, smile: p.smile ?? 0, smirk: p.smirk ?? 0, sneeze: p.sneeze ?? 0, sweat: p.sweat ?? 0,
    iris: look.iris, eyeScale: look.eyeScale ?? (look.lashes ? 1.12 : 1), brows: look.hairStyle === 'bald' ? '#2a1d18' : look.hair, lips: look.skinShade, shade: look.skinShade,
    blush: look.blush ?? 0, mustache: !!look.mustache, lashes: !!look.lashes,
  });
  const sq = p.squash ?? 0;
  return (
    <group rotation={[p.headPitch ?? 0, p.headYaw ?? 0, p.headTilt ?? 0]} scale={[1 - sq * 0.4, 1 + sq, 1 - sq * 0.4]}>
      <group position={[0, HEAD_R * 1.05, 0]}>
        <Solid geo={h.geo} mat={toon(look.skin)} line={L} />
        {/* flat 2D face, printed on the front of the head */}
        <mesh geometry={faceGeometry(look.shape)} material={faceMat(tex)} renderOrder={2} />
        {/* ears */}
        {[1, -1].map((s) => (
          <group key={s} position={[s * HEAD_R * (look.shape === 'tri' ? 1.0 : look.shape === 'hero' ? 1.02 : 0.97), -0.005, -0.012]}>
            <Solid geo={sph(0.036)} mat={toon(look.skin)} scale={[0.42, 1, 0.72]} line={L} />
            {look.hoops && <mesh position={[s * 0.01, -0.05, 0.01]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.022, 0.004, 6, 16]} /><meshToonMaterial color="#e8c35a" /></mesh>}
          </group>
        ))}
        {look.hairStyle !== 'bald' && <Solid geo={hairGeometry(look.shape, look.hairStyle, look.hair, look.hairDark, look.skin)} mat={toonVC()} line={L} />}
        {look.puff && <Solid geo={puffGeo} mat={toon(look.hair)} position={[0, 0.17, -0.07]} scale={[1.05, 0.9, 1]} line={L} />}
        {children}
        {look.shades && (
          <group position={[0, 0.002, 0.162]}>
            {[1, -1].map((s2) => <Solid key={s2} geo={rbox(0.072, 0.042, 0.016, 0.012)} mat={flat('#0f0e12')} position={[s2 * 0.064, 0, 0]} rotation={[0, s2 * 0.3, 0]} line={L * 0.6} />)}
            <mesh geometry={rbox(0.05, 0.009, 0.01, 0.004)} material={flat('#0f0e12')} />
          </group>
        )}
      </group>
    </group>
  );
}

function Limb({ a, look, side, sleeve, children }: { a: Arm; look: Look; side: 1 | -1; sleeve: string; children?: React.ReactNode }) {
  return (
    <group rotation={[a.sx, a.sy, side * a.sz]}>
      <Solid geo={cap(0.054, 0.17)} mat={toon(sleeve)} position={[0, -0.12, 0]} line={L} />
      <group position={[0, -0.24, 0]} rotation={[-a.el, 0, 0]}>
        <Solid geo={cap(0.046, 0.15)} mat={toon(sleeve)} position={[0, -0.1, 0]} line={L} />
        <group position={[0, -0.22, 0]}>
          <Solid geo={sph(0.045)} mat={toon(look.skin)} scale={[0.85, 1, 0.75]} line={L} />
          <Solid geo={cap(0.016, 0.03)} mat={toon(look.skin)} position={[side * -0.035, 0.005, 0.02]} rotation={[0.4, 0, side * 0.6]} line={L} />
          {/* fingers, curled */}
          {[-1, 0, 1].map((k) => <Solid key={k} geo={cap(0.0125, 0.03)} mat={toon(look.skin)} position={[k * 0.018, -0.045, 0.012]} rotation={[0.35, 0, 0]} line={L * 0.8} />)}
          {children}
        </group>
      </group>
    </group>
  );
}

function LegG({ l, look, side }: { l: Leg; look: Look; side: 1 | -1 }) {
  return (
    <group position={[side * 0.075, 0, 0]} rotation={[-l.hip, 0, side * (l.spread ?? 0)]}>
      <Solid geo={cap(0.068, 0.2)} mat={toon(look.pants)} position={[0, -0.15, 0]} line={L} />
      <group position={[0, -0.3, 0]} rotation={[l.knee, 0, 0]}>
        <Solid geo={cap(0.06, 0.2)} mat={toon(look.pants)} position={[0, -0.14, 0]} line={L} />
        <Solid geo={rbox(0.12, 0.075, 0.22, 0.032)} mat={toon(look.shoes)} position={[0, -0.3, 0.045]} line={L} />
        <Solid geo={rbox(0.125, 0.02, 0.225, 0.008)} mat={toon('#e6e2dc')} position={[0, -0.34, 0.045]} line={0} />
      </group>
    </group>
  );
}

/** Where the head centre is in world space for a pose (used to frame shots on faces). */
export const headPos = (p: Pose, look: Look): [number, number, number] => {
  const s = look.height ?? 1;
  return [(p.x ?? 0), (p.y ?? 0) + s * (0.62 + 0.47 + HEAD_R * 1.05), (p.z ?? 0)];
};

/** The whole character. `handR`/`handL` render in the hands (e.g. the phone). */
export const Character: React.FC<{ p: Pose; look: Look; handR?: React.ReactNode; handL?: React.ReactNode; onHead?: React.ReactNode }> = ({ p, look, handR, handL, onHead }) => {
  const b = (p.breathe ?? 0) * 0.012;
  const aL = { ...D, ...p.armL }, aR = { ...D, ...p.armR };
  const legL = p.legL ?? { hip: 0, knee: 0 }, legR = p.legR ?? { hip: 0, knee: 0 };
  const w = look.build ?? 1, sx = 0.19 * w;
  return (
    <group position={[p.x ?? 0, p.y ?? 0, p.z ?? 0]} rotation={[0, p.yaw ?? 0, 0]} scale={look.height ?? 1}><group position={[0, 0.62, 0]} rotation={[p.pitch ?? 0, 0, p.roll ?? 0]}><group position={[0, -0.62, 0]}>
      <group position={[0, 0.62, 0]}>
        <LegG l={legL} look={look} side={-1} />
        <LegG l={legR} look={look} side={1} />
        <Solid geo={sph(0.135)} mat={toon(look.pants)} position={[0, 0.02, 0]} scale={[1.05, 0.55, 0.85]} line={L} />
        <group rotation={[p.lean ?? 0, p.twist ?? 0, 0]}>
          <group scale={[1, 1 + b, 1]}>
            {/* torso: wider at the shoulders, an oversized crewneck */}
            <Solid geo={cap(0.15, 0.18)} mat={toon(look.top)} position={[0, 0.2, 0]} scale={[1.08 * w, 1, 0.82]} line={L} />
            <Solid geo={sph(0.1)} mat={toon(look.top)} position={[0, 0.33, 0]} scale={[2.0 * w, 0.55, 1.05]} line={L} />
            {/* collar: a ring at the base of the neck, nothing above it */}
            <mesh position={[0, 0.39, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.058, 0.014, 8, 20]} /><meshToonMaterial color={look.suit ? '#f2efe8' : look.topDark} /></mesh>
            {look.suit && (
              <group position={[0, 0.27, 0.118]}>
                <mesh geometry={rbox(0.1, 0.22, 0.01, 0.004)} material={flat('#f2efe8')} />
                <mesh geometry={rbox(0.03, 0.18, 0.012, 0.006)} material={flat('#b8323a')} position={[0, -0.01, 0.006]} />
                {[1, -1].map((s) => <mesh key={s} geometry={rbox(0.05, 0.22, 0.014, 0.006)} material={flat('#3a3946')} position={[s * 0.06, 0, 0.004]} rotation={[0, 0, s * -0.25]} />)}
              </group>
            )}
          </group>
          <group position={[sx, 0.35, 0]}><Limb a={aR} look={look} side={1} sleeve={look.sleeve ?? look.top}>{handR}</Limb></group>
          <group position={[-sx, 0.35, 0]}><Limb a={aL} look={look} side={-1} sleeve={look.sleeve ?? look.top}>{handL}</Limb></group>
          <group position={[0, 0.47 + b * 2, 0]}>
            <Solid geo={cap(0.05, 0.09)} mat={toon(look.skin)} position={[0, -0.02, 0]} line={L} />
            <Head p={p} look={look}>{onHead}</Head>
          </group>
        </group>
      </group>
    </group></group></group>
  );
};

export { INK };
