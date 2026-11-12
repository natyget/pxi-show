// The compositions: test stills for the look, and the guarded shot that later episodes use.
import React from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { V } from './vec';
import { FACES, gaze } from './face';
import { SdfShot } from './SdfShot';
import { PW, PH } from './types';
import { Act, shot, studioShot, CAMS, C } from './room';
import { ShotSpec, buildShot } from './world';

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
