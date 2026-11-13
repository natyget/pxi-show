// The compositions: test stills for the look, and the guarded shot that later episodes use.
import React from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { V } from './vec';
import { FACES, gaze } from './face';
import { SdfShot } from './SdfShot';
import { PW, PH } from './types';
import { Act, shot, studioShot, CAMS, C } from './room';
import { ShotSpec, buildShot, CHARACTERS } from './world';

export type StillProps = { w: number; h: number; cam: string; actor: boolean; clip: string; t: number; yaw: number; at: number[]; face: string; gaze?: number[];
  phone: number; outfit: string; stance: number; arms: number; upright: number; seat?: number; crossed: boolean; time: number; studio?: boolean; lookCam?: number; camAt?: number[]; camPos?: number[]; fov?: number; screen?: string; hold?: number[] };
export const N3_DEFAULT: StillProps = { w: PW, h: PH, cam: 'full', actor: true, clip: 'Idle_Loop', t: 0, yaw: 180, at: [2.0, 2.5], face: 'deadpan',
  phone: 0, outfit: 'home', stance: 0.5, arms: 0.35, upright: 0.85, crossed: false, time: 0, lookCam: 0.7 };
export const N3Still: React.FC<StillProps> = (p) => {
  let cam = CAMS[p.cam];
  if (p.camPos && p.camAt) cam = C(p.camPos as V, p.camAt as V, p.fov ?? cam.fov);
  let face = FACES[p.face]; if (p.gaze) face = gaze(face, p.gaze[0], p.gaze[1]);
  const acts: Act[] = p.actor ? [{ clip: p.clip, t: p.t, at: [p.at[0], p.at[1]], yaw: p.yaw, face, phone: p.phone, hold: p.hold, outfit: p.outfit, stance: p.stance, arms: p.arms,
    upright: p.upright, seat: p.seat, crossed: p.crossed, look: p.lookCam ? cam.pos : undefined, lookAmt: p.lookCam }] : [];
  const scene = p.studio ? studioShot(cam, acts) : shot(cam, acts, p.time);
  // `screen` names one of PXI's screens (public/pxi-ui/screens/<name>.png, drawn by tools/pxi/screens.py) for the phone in his hand
  if (p.screen) scene.screenTex = staticFile(`pxi-ui/screens/${p.screen}.png`);
  return <SdfShot scene={scene} w={p.w} h={p.h} />;
};

// THE way to make a shot. It takes a ShotSpec (see world.ts) and refuses anything the world does not contain.
export const N3Shot: React.FC<{ spec: ShotSpec }> = ({ spec }) => <SdfShot scene={buildShot(spec, useCurrentFrame())} />;

// A still with any of the cast, for model sheets and look tests. Each actor names a character; everything else has a
// default. set: 'studio' (the plain backdrop), 'room' (Nio's room) or 'party' (his room the night of the party).
export type CastActor = { who: string; clip?: string; t?: number; at: number[]; yaw: number; face?: string; gaze?: number[]; pose?: string; outfit?: string;
  stance?: number; arms?: number; upright?: number; seat?: number; lift?: number; lookCam?: number; lookAt?: number[] };
export type CastProps = { w: number; h: number; set: string; camPos: number[]; camAt: number[]; fov: number; time?: number; screen?: string; flash?: boolean; actors: CastActor[] };
export const N3_CAST: CastProps = { w: PW, h: PH, set: 'studio', camPos: [2.0, 0.95, 0.2], camAt: [2.0, 0.8, 2.5], fov: 44, actors: [{ who: 'maya', at: [2.0, 2.5], yaw: 180 }] };
export const N3Cast: React.FC<CastProps> = (p) => {
  const cam = C(p.camPos as V, p.camAt as V, p.fov);
  const acts: Act[] = p.actors.map((a) => {
    const ch = CHARACTERS[a.who]; if (!ch) throw new Error('no character ' + a.who);
    let face = FACES[a.face ?? ch.restFace]; if (a.gaze) face = gaze(face, a.gaze[0], a.gaze[1]);
    const look = a.lookAt ? C(a.lookAt as V, a.lookAt as V, 1).pos : a.lookCam ? cam.pos : undefined;
    return { who: ch, clip: a.clip ?? 'Idle_Loop', t: a.t ?? 0, at: [a.at[0], a.at[1]], yaw: a.yaw, face, pose: a.pose, outfit: a.outfit,
      stance: a.stance ?? 0.5, arms: a.arms ?? 0.35, upright: a.upright ?? 0.85, seat: a.seat, lift: a.lift, look, lookAmt: a.lookCam ?? 0.8 };
  });
  const scene = p.set === 'studio' ? studioShot(cam, acts) : shot(cam, acts, p.time ?? 0, p.set === 'party' ? 'party' : undefined, p.flash);
  if (p.screen) scene.screenTex = staticFile(`pxi-ui/screens/${p.screen}.png`);
  return <SdfShot scene={scene} w={p.w} h={p.h} />;
};
