// OFFICE HOURS (season 1, episode 1). Script: episodes/office-hours/script.md. Board: episodes/office-hours/shots.md.
// Every shot is a ShotSpec drawn by the engine (nw3d/world.ts buildShot), so the world rules check each one.
// A shot's spec may change inside the shot (a door swings, a face turns): `spec` is then a function of the shot's frame.
// Voice lines are placed in the shot that carries them; the speaker's mouth follows the line's cues (src/lips).
// cut 'short' plays the S shots; 'long' plays every shot.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SdfShot } from '../nw3d/SdfShot';
import { PW, PH } from '../nw3d/types';
import { ShotSpec, buildShot } from '../nw3d/world';
import { Cues } from '../lips/mouths';
import { Fonts, Sub } from '../lib/Pixel';
import VO from '../vo_oh.json';
import LIPS from '../lips/oh.json';

type Line = { key: string; who: string; at: number }; // at: the frame inside the shot where the line starts
type Shot = { n: number; frames: number; cut: 'S' | 'L'; spec: ShotSpec | ((f: number) => ShotSpec) | null; say?: Line[]; sfx?: [string, number, number?][] };
type VoLine = { file: string; who: string; sub: string; dur: number };
const vo = VO as unknown as Record<string, VoLine>;
const lips = LIPS as unknown as Record<string, Cues>;

// The waiting room: Nio by the way in (L3), Darnell beside him (L4), the spinner boy and the flower-crown girl across (R4, R5).
const W = (camera: string, frames: number, actors: ShotSpec['actors'], campus: ShotSpec['campus'] = { serving: 3, clock: null }): ShotSpec =>
  ({ set: 'waiting', camera, frames, actors, campus });
const waiters = (spin = true): ShotSpec['actors'] => [
  { who: 'spinner', at: 'seatR4', action: 'sit', face: 'deadInside', hold: spin ? 'spinner' : undefined },
  { who: 'crown', at: 'seatR5', action: 'sit', face: 'neutral' },
];
const nioSit = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'nio', at: 'seatL3', action: talk ? 'sitTalk' : 'sit', face });
const darnellSit = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'darnell', at: 'seatL4', action: talk ? 'sitTalk' : 'sit', face });

export const SHOTS: Shot[] = [
  // 1-19: the lecture hall and the corridor (sets in progress in the design thread)
  ...[[1, 94, 'S'], [2, 36, 'S'], [3, 36, 'S'], [4, 48, 'S'], [5, 36, 'S'], [6, 74, 'S'], [7, 36, 'S'], [8, 30, 'S'], [9, 48, 'S'], [10, 44, 'S'],
    [11, 60, 'S'], [12, 80, 'S'], [13, 48, 'S'], [14, 29, 'L'], [15, 72, 'L'], [16, 72, 'S'], [17, 62, 'S'], [18, 62, 'L'], [19, 12, 'S']]
    .map(([n, frames, cut]) => ({ n: n as number, frames: frames as number, cut: cut as 'S' | 'L', spec: null })),
  // 20: the smash cut lands. Silence but the hum; only the spinner and Nio's eyes move.
  { n: 20, frames: 72, cut: 'S', spec: W('aisle', 72, [nioSit('shock'), darnellSit('neutral'), ...waiters()]) },
  { n: 21, frames: 29, cut: 'L', spec: W('clock', 29, []) },
  { n: 22, frames: 36, cut: 'S', spec: W('darnell', 36, [darnellSit('charm', true)]), say: [{ key: 'oh_11', who: 'darnell', at: 4 }] },
  { n: 23, frames: 44, cut: 'S', spec: W('nio', 44, [nioSit('smug', true)]), say: [{ key: 'oh_12', who: 'nio', at: 4 }] },
  { n: 24, frames: 44, cut: 'S', spec: W('two', 44, [darnellSit('charm', true), nioSit('uneasy')]), say: [{ key: 'oh_13', who: 'darnell', at: 3 }] },
  { n: 25, frames: 36, cut: 'S', spec: null }, // insert: Darnell's ticket, 4 (needs an insert camera)
  { n: 26, frames: 72, cut: 'S', spec: W('darnell', 72, [{ ...darnellSit('real', true), gaze: [0.4, 0.1] }]), say: [{ key: 'oh_14', who: 'darnell', at: 6 }] },
  { n: 27, frames: 60, cut: 'S', spec: W('nio', 60, [nioSit([[0, 'crushed'], [24, 'sheepish']], true)]), say: [{ key: 'oh_15', who: 'nio', at: 26 }] },
  { n: 28, frames: 29, cut: 'L', spec: W('darnell', 29, [darnellSit([[0, 'charm'], [16, 'neutral']])]) },
  { n: 29, frames: 56, cut: 'S', spec: (f) => W('door', 56, f < 6 ? [] : [{ who: 'profH', at: 'doorway', action: 'talk', face: 'laughing' }],
      { serving: 3, clock: null, door: Math.min(1, f / 6) }), say: [{ key: 'oh_16', who: 'profH', at: 10 }] },
  // 30-34: the office (in progress)
  ...[[30, 52, 'S'], [31, 24, 'S'], [32, 66, 'S'], [33, 94, 'S'], [34, 36, 'S']].map(([n, frames, cut]) => ({ n: n as number, frames: frames as number, cut: cut as 'S' | 'L', spec: null })),
  // 35: the same angle as 20. The clock has hands, NOW SERVING 4, the door open; Darnell goes.
  { n: 35, frames: 48, cut: 'S', spec: null }, // needs Darnell to stand and walk out (a way-out mark)
  ...[[36, 44, 'S'], [37, 36, 'L'], [38, 40, 'S'], [39, 30, 'S'], [40, 36, 'S']].map(([n, frames, cut]) => ({ n: n as number, frames: frames as number, cut: cut as 'S' | 'L', spec: null })),
];

export type OHProps = { cut: 'short' | 'long'; only?: number[] };
export const timeline = (p: OHProps) => {
  let at = 0;
  return SHOTS.filter((s) => (p.cut === 'long' || s.cut === 'S') && (!p.only || p.only.includes(s.n))).map((s) => { const r = { ...s, from: at }; at += s.frames; return r; });
};
export const ohLength = (p: OHProps) => timeline(p).reduce((a, s) => a + s.frames, 0);

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  if (!shot.spec) return <AbsoluteFill style={{ background: '#2a2628', color: '#8a8488', fontFamily: 'Pixelify', fontSize: 64, alignItems: 'center', justifyContent: 'center' }}>{`shot ${shot.n}: set not built`}</AbsoluteFill>;
  const base = typeof shot.spec === 'function' ? shot.spec(f) : shot.spec;
  const spec: ShotSpec = { ...base, frames: shot.frames, actors: base.actors.map((a) => {
    const mine = (shot.say ?? []).filter((l) => l.who === a.who && lips[l.key]);
    return mine.length ? { ...a, speak: mine.map((l) => [l.at, lips[l.key]] as [number, Cues]) } : a;
  }) };
  return <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `scale(${1080 / PW})`, transformOrigin: '0 0', imageRendering: 'pixelated' }}>
    <SdfShot scene={buildShot(spec, f)} /></div>;
};

export const OfficeHours: React.FC<OHProps> = (p) => {
  const shots = timeline(p);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#151216' }}>
      <Fonts />
      {shots.map((s) => (
        <Sequence key={s.n} from={s.from} durationInFrames={s.frames}>
          <ShotView shot={s} />
          {(s.say ?? []).filter((l) => vo[l.key]).map((l) => (
            <Sequence key={l.key} from={l.at} durationInFrames={Math.ceil(vo[l.key].dur * 24) + 2} layout="none"><Audio src={staticFile(vo[l.key].file)} /></Sequence>
          ))}
        </Sequence>
      ))}
      {shots.flatMap((s) => (s.say ?? []).filter((l) => vo[l.key]).map((l) => {
        const a = s.from + l.at, b = a + Math.max(Math.ceil(vo[l.key].dur * 24) + 8, 30);
        return frame >= a && frame < b ? <Sub key={l.key} text={vo[l.key].sub} /> : null;
      }))}
    </AbsoluteFill>
  );
};
