// Test of speech mouths: Nio in close-up saying an approved line with its audio, or holding one mouth shape for the sheet.
import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { V } from '../nw3d/vec';
import { FACES } from '../nw3d/face';
import { SdfShot } from '../nw3d/SdfShot';
import { PW, PH } from '../nw3d/types';
import { studioShot, C } from '../nw3d/room';
import { CHARACTERS } from '../nw3d/world';
import { lips, SHAPES, Cues, Shape } from './mouths';
import TEST from './test_nb.json';

const LINES = TEST as unknown as Record<string, Cues>;
export type LipProps = { line: string; shape?: string; face: string };
export const LIP_DEFAULT: LipProps = { line: 'nb_03', face: 'deadpan' };
export const lipLen = (p: LipProps) => (p.shape ? 1 : LINES[p.line].frames + 12);

export const LipTest: React.FC<LipProps> = (p) => {
  const frame = useCurrentFrame();
  const cam = C([2.0, 1.4, 0.7] as V, [2.0, 1.33, 2.5] as V, 30);
  const c: Cues | undefined = p.shape ? { fps: 24, frames: 3, cues: [[0, p.shape as Shape]] } : LINES[p.line];
  const face = lips(FACES[p.face], c, p.shape ? 0 : frame - 6);
  const scene = studioShot(cam, [{ who: CHARACTERS.nio, clip: 'Idle_Loop', t: 0, at: [2.0, 2.5], yaw: 180, face, stance: 0.5, arms: 0.35, upright: 0.85 }]);
  return <>
    <SdfShot scene={scene} w={PW} h={PH} />
    {!p.shape && <Sequence from={6}><Audio src={staticFile(`vo/${p.line}.wav`)} /></Sequence>}
  </>;
};
export const LIP_SHAPES = ['X', ...Object.keys(SHAPES)];
