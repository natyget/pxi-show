// THE LAUNCH SKITS (founder, Nov 17: "funny peete n keel skits like short episodes for launch"). Storyboard and final
// lines: project files nio-soul/skits/launch-skits.html. Each skit is a list of shots drawn by the engine (nw3d/world.ts
// buildShot), with the acting pass on, no music, dialogue and sound effects only, and its own voice medium
// (studio/voice/mediums.py) so the founder can compare how each one performs.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SdfShot } from '../nw3d/SdfShot';
import { PW, PH } from '../nw3d/types';
import { ShotSpec, buildShot } from '../nw3d/world';
import { Cues } from '../lips/mouths';
import { Fonts, Sub } from '../lib/Pixel';
import { Accents } from '../nw3d/acting';
import { ONE_SIP } from './skits/oneSip';
import { GROUP_PHOTO } from './skits/groupPhoto';
import VO_OS from '../vo_os.json';
import LIPS_OS from '../lips/os.json';
import ACC_OS from '../lips/os_accents.json';
import VO_GP from '../vo_gp.json';
import LIPS_GP from '../lips/gp.json';
import ACC_GP from '../lips/gp_accents.json';

export type Line = { key: string; who: string; at: number }; // at: the frame inside the shot where the line starts
// img: a full-screen picture instead of a set (a PXI screen, public/<img>), pushed in slowly. flash: a camera flash at this frame.
export type Shot = { n: number; frames: number; spec?: ShotSpec | ((f: number) => ShotSpec); img?: string; flash?: number; say?: Line[]; sfx?: [string, number, number?][] };
export type SkitDef = { id: string; shots: Shot[]; beds: [string, number][] };
type VoLine = { file: string; who: string; sub: string; dur: number };
const vo = { ...VO_OS, ...VO_GP } as unknown as Record<string, VoLine>;
const lips = { ...LIPS_OS, ...LIPS_GP } as unknown as Record<string, Cues>;
const acc = { ...ACC_OS, ...ACC_GP } as unknown as Record<string, Accents>;
export const SKITS: Record<string, SkitDef> = { 'one-sip': ONE_SIP, 'group-photo': GROUP_PHOTO };

// A shot is never shorter than its lines: the last line ends at least 6 frames before the cut.
const lenOf = (s: Shot) => Math.max(s.frames, ...(s.say ?? []).map((l) => l.at + Math.ceil((vo[l.key]?.dur ?? 0) * 24) + 6));
export type SkitProps = { skit: string; only?: number[]; subs?: boolean };
export const skitTimeline = (p: SkitProps) => {
  let at = 0;
  return SKITS[p.skit].shots.filter((s) => !p.only || p.only.includes(s.n)).map((s) => { const r = { ...s, frames: lenOf(s), from: at }; at += r.frames; return r; });
};
export const skitLength = (p: SkitProps) => skitTimeline(p).reduce((a, s) => a + s.frames, 0);

const Flash: React.FC<{ at: number }> = ({ at }) => { const f = useCurrentFrame() - at; return f < 0 || f > 8 ? null : <AbsoluteFill style={{ background: '#fff', opacity: 1 - f / 8 }} />; };
const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  if (shot.img) return <AbsoluteFill style={{ background: '#000' }}><img src={staticFile(shot.img)} style={{ width: 1080, height: 2340, marginTop: -210, imageRendering: 'pixelated', transform: `scale(${1 + 0.06 * f / shot.frames})` }} /></AbsoluteFill>;
  const base = typeof shot.spec === 'function' ? shot.spec(f) : shot.spec!;
  const spec: ShotSpec = { ...base, frames: shot.frames, actors: base.actors.map((a) => {
    const mine = (shot.say ?? []).filter((l) => l.who === a.who && lips[l.key]);
    const theirs = (shot.say ?? []).filter((l) => l.who !== a.who && acc[l.key]).map((l) => [l.at, acc[l.key]] as [number, Accents]);
    const b = { ...a, heard: theirs };
    return mine.length ? { ...b, speak: mine.map((l) => [l.at, lips[l.key]] as [number, Cues]), acc: mine.filter((l) => acc[l.key]).map((l) => [l.at, acc[l.key]] as [number, Accents]) } : b;
  }) };
  return <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `scale(${1080 / PW})`, transformOrigin: '0 0', imageRendering: 'pixelated' }}>
    <SdfShot scene={buildShot(spec, f)} w={PW} h={PH} /></div>;
};

export const Skit: React.FC<SkitProps> = (p) => {
  const shots = skitTimeline(p), total = skitLength(p), def = SKITS[p.skit];
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#151216' }}>
      <Fonts />
      {shots.map((s) => (
        <Sequence key={s.n} from={s.from} durationInFrames={s.frames}>
          <ShotView shot={s} />
          {s.flash !== undefined ? <Flash at={s.flash} /> : null}
          {(s.say ?? []).filter((l) => vo[l.key]).map((l) => (
            <Sequence key={l.key} from={l.at} durationInFrames={Math.ceil(vo[l.key].dur * 24) + 2} layout="none"><Audio src={staticFile(vo[l.key].file)} /></Sequence>
          ))}
        </Sequence>
      ))}
      {/* no music (founder, Nov 17): beds are room sound only */}
      {def.beds.map(([f, v]) => <Sequence key={f} from={0} durationInFrames={total} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v} /></Sequence>)}
      {shots.flatMap((s) => (s.sfx ?? []).map(([f, at, v], i) => (
        <Sequence key={`${s.n}fx${i}`} from={s.from + at} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v ?? 1} /></Sequence>)))}
      {shots.flatMap((s) => (s.say ?? []).filter((l) => vo[l.key]).map((l) => {
        const a = s.from + l.at, b = a + Math.max(Math.ceil(vo[l.key].dur * 24) + 8, 30);
        return p.subs !== false && frame >= a && frame < b ? <Sub key={l.key} text={vo[l.key].sub} /> : null;
      }))}
    </AbsoluteFill>
  );
};
