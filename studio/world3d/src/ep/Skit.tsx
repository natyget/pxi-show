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
import { ONE_SIP, OS_PICS, OS_TEST } from './skits/oneSip';
import { AUX } from './skits/aux';
import { WAVE_BACK, WB_PICS } from './skits/waveBack';
import { GROUP_PHOTO, GP_PICS, GP_TEST } from './skits/groupPhoto';
import VO_OS from '../vo_os.json';
import LIPS_OS from '../lips/os.json';
import ACC_OS from '../lips/os_accents.json';
import VO_GP from '../vo_gp.json';
import LIPS_GP from '../lips/gp.json';
import ACC_GP from '../lips/gp_accents.json';
import VO_AX from '../vo_ax.json';
import LIPS_AX from '../lips/ax.json';
import ACC_AX from '../lips/ax_accents.json';
import VO_WB from '../vo_wb.json';
import LIPS_WB from '../lips/wb.json';
import ACC_WB from '../lips/wb_accents.json';

export type Line = { key: string; who: string; at: number; off?: string; to?: string }; // at: the frame inside the shot where the line starts. off: the line is meant to be heard from someone not in the picture, and why (the story check refuses it otherwise). to: who the line is said to, when it is not the next person who speaks
// img: a full-screen picture instead of a set (a PXI screen, public/<img>), pushed in slowly. zoom: [scale, the height
// it zooms toward, percent from the top], for a screen whose point is one row. flash: a camera flash at this frame.
export type Shot = { n: number; frames: number; spec?: ShotSpec | ((f: number) => ShotSpec); img?: string; zoom?: [number, number]; flash?: number; shake?: number[]; drop?: [number, number, number, number, number]; poof?: [number, number, number][]; rain?: boolean | [number, number][]; drip?: [number, number, number][]; finder?: boolean; tap?: [number, number, number, string?][]; hover?: [number, number, number]; say?: Line[]; sfx?: [string, number, number?, number?][] };
// beds: [sound, volume, the shot it stops at (optional: else it runs to the end), the shot it starts at (optional: else the start)]
export type SkitDef = { id: string; shots: Shot[]; beds: [string, number, number?, number?][] };
type VoLine = { file: string; who: string; sub: string; dur: number };
export const vo = { ...VO_OS, ...VO_GP, ...VO_AX, ...VO_WB } as unknown as Record<string, VoLine>;
const lips = { ...LIPS_OS, ...LIPS_GP, ...LIPS_AX, ...LIPS_WB } as unknown as Record<string, Cues>;
const acc = { ...ACC_OS, ...ACC_GP, ...ACC_AX, ...ACC_WB } as unknown as Record<string, Accents>;
export const SKITS: Record<string, SkitDef> = { 'one-sip': ONE_SIP, 'group-photo': GROUP_PHOTO, aux: AUX, 'wave-back': WAVE_BACK, 'wb-pics': WB_PICS, 'gp-pics': GP_PICS, 'gp-test': GP_TEST, 'os-pics': OS_PICS, 'os-test': OS_TEST };

// A shot is never shorter than its lines: the last line ends at least 6 frames before the cut.
const lenOf = (s: Shot) => Math.max(s.frames, ...(s.say ?? []).map((l) => l.at + Math.ceil((vo[l.key]?.dur ?? 0) * 24) + 6));
export type SkitProps = { skit: string; only?: number[]; subs?: boolean };
export const skitTimeline = (p: SkitProps) => {
  let at = 0;
  return SKITS[p.skit].shots.filter((s) => !p.only || p.only.includes(s.n)).map((s) => { const r = { ...s, frames: lenOf(s), from: at }; at += r.frames; return r; });
};
export const skitLength = (p: SkitProps) => skitTimeline(p).reduce((a, s) => a + s.frames, 0);

// a cartoon puff where a costume piece arrives: [frame, x, y] in the 1080 x 1920 picture
const Poof: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => { const f = useCurrentFrame() - at; if (f < 0 || f > 10) return null;
  const r = 60 + f * 14, o = f < 4 ? 1 : 1 - (f - 4) / 6;
  return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: o }}>{[0, 1, 2, 3, 4, 5, 6].map((k) => { const a = (k / 7) * Math.PI * 2;
    return <circle key={k} cx={x + Math.cos(a) * r * 0.7} cy={y + Math.sin(a) * r * 0.55} r={r * 0.42} fill="#fbf6ee" stroke="#2a2024" strokeWidth={8} />; })}</svg>; };
// indoor rain: streaks falling on twos, the room a little bluer
const Rain: React.FC<{ d?: number }> = ({ d = 1 }) => { const f = Math.floor(useCurrentFrame() / 2) * 2; const n = Math.max(1, Math.round(260 * d));
  // (stranger, Nov 18: short thick white dashes read as a glitch; thin, long, blue, many, with splashes on the floor reads as rain)
  return <><AbsoluteFill style={{ background: '#2f5590', mixBlendMode: 'multiply', opacity: 0.45 * Math.min(1, d * 1.5) }} />
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>{Array.from({ length: n }, (_, k) => { const x = (k * 137.5) % 1080, y = ((k * 263 + f * 90) % 2200) - 200;
      return <line key={k} x1={x} y1={y} x2={x - 14} y2={y + 150} stroke="#9fc2ff" strokeWidth={3} opacity={0.6} />; })}
    {Array.from({ length: Math.round(40 * d) }, (_, k) => { const x = (k * 211.3 + f * 37) % 1080, y = 1500 + ((k * 97) % 380), r = 10 + ((k + f) % 6) * 6;
      return <ellipse key={'s' + k} cx={x} cy={y} rx={r} ry={r * 0.3} fill="none" stroke="#9fc2ff" strokeWidth={3} opacity={0.5} />; })}</svg></>; };
// (Aux v12) one drop of indoor rain: a blue streak falls for 8 frames onto (x, y), lands on frame 'at', and splashes
const Drip: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => { const f = useCurrentFrame() - at; if (f < -8 || f > 7) return null;
  if (f < 0) { const yy = y + (f / 8) * 900; return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><line x1={x} y1={yy - 120} x2={x} y2={yy} stroke="#9fc2ff" strokeWidth={6} strokeLinecap="round" /></svg>; }
  const r = 14 + f * 9; return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: 1 - f / 8 }}><ellipse cx={x} cy={y} rx={r} ry={r * 0.32} fill="none" stroke="#9fc2ff" strokeWidth={5} />
    {[-1, 1].map((k) => <circle key={k} cx={x + k * (10 + f * 6)} cy={y - 16 - f * 5 + f * f * 0.8} r={6} fill="#9fc2ff" />)}</svg>; };
// a monocle falling: a gold ring that drops from (x0, y0) to (x1, y1) in 7 frames, turning edge-on as it goes, then gone
const Drop: React.FC<{ d: [number, number, number, number, number] }> = ({ d: [at, x0, y0, x1, y1] }) => { const f = useCurrentFrame() - at; if (f < 0 || f > 7) return null;
  const k = (f / 7) ** 2, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k;
  return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><ellipse cx={x} cy={y} rx={62} ry={62 * Math.max(0.15, Math.cos(f * 0.5))} fill="none" stroke="#2a2024" strokeWidth={18} /><ellipse cx={x} cy={y} rx={62} ry={62 * Math.max(0.15, Math.cos(f * 0.5))} fill="none" stroke="#d4a72c" strokeWidth={9} /></svg>; };
// through Nio's phone: four white corner marks, so the viewer knows this frame is the photo being taken (the cause in
// the picture: who is in the shot, and who is not). Plain marks, no app interface.
// tap: a thumb comes in from the lower right, presses the point (x, y in frame pixels) on the frame given, and leaves
// (craft library, phone insert: "the thumb enters only to tap"). The skin is the hand's owner's.
const Thumb: React.FC<{ at: number; x: number; y: number; skin?: string }> = ({ at, x, y, skin = '#e3b48c' }) => {
  const f = useCurrentFrame() - at; if (f < -9 || f > 9) return null;
  const k = f < 0 ? (-f) / 9 : f < 3 ? 0 : (f - 3) / 6, e = k * k, dx = 260 * e, dy = 520 * e, press = f >= 0 && f < 3 ? 0.94 : 1;
  const ring = f >= 0 && f < 8 ? f / 8 : -1;
  return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {ring >= 0 ? <circle cx={x} cy={y} r={30 + 50 * ring} fill="none" stroke="white" strokeOpacity={0.6 * (1 - ring)} strokeWidth={6} /> : null}
    <g transform={`translate(${x + dx} ${y + dy}) rotate(-24) scale(${press})`}>
      <rect x={-62} y={-26} width={124} height={560} rx={62} fill={skin} stroke="#2a1a14" strokeWidth={8} />
      <rect x={-40} y={-10} width={80} height={96} rx={36} fill="#f6dccb" stroke="#2a1a14" strokeWidth={5} opacity={0.9} />
    </g></svg>;
};
// hover: the thumb comes in over a point and stays just above it, not pressing, a little unsteady (One Sip v10's last photo)
const Hover: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame() - at; if (f < -9) return null;
  const k = f < 0 ? (-f) / 9 : 0, e = k * k, dx = 260 * e + 26 + Math.sin(f * 0.7) * 3, dy = 520 * e + 60 + Math.cos(f * 0.9) * 3;
  return <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    <g transform={`translate(${x + dx} ${y + dy}) rotate(-24)`}>
      <rect x={-62} y={-26} width={124} height={560} rx={62} fill="#e3b48c" stroke="#2a1a14" strokeWidth={8} />
      <rect x={-40} y={-10} width={80} height={96} rx={36} fill="#f6dccb" stroke="#2a1a14" strokeWidth={5} opacity={0.9} />
    </g></svg>;
};
const Finder: React.FC = () => <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>{[[90, 260, 1, 1], [990, 260, -1, 1], [90, 1660, 1, -1], [990, 1660, -1, -1]].map(([x, y, a, b], k) =>
  <path key={k} d={`M ${x} ${y + b * 110} L ${x} ${y} L ${x + a * 110} ${y}`} fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={0.9} />)}</svg>;
const Flash: React.FC<{ at: number }> = ({ at }) => { const f = useCurrentFrame() - at; return f < 0 || f > 8 ? null : <AbsoluteFill style={{ background: '#fff', opacity: 1 - f / 8 }} />; };
// a hit on a big beat (founder, Nov 18: "the camera zooming slighlty and shaking and vibrating with some sound"): the
// picture jolts and shakes for 10 frames, a 4 percent punch-in easing back. shake: the frames it hits on (with sk_hit).
const Shake: React.FC<{ at: number[]; children: React.ReactNode }> = ({ at, children }) => { const f = useCurrentFrame();
  const h = at.map((a) => f - a).filter((d) => d >= 0 && d < 10)[0];
  if (h === undefined) return <>{children}</>;
  const k = 1 - h / 10, x = Math.sin(h * 2.7) * 18 * k, y = Math.cos(h * 3.9) * 12 * k;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${1 + 0.04 * k})` }}>{children}</AbsoluteFill>; };
const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  if (shot.img) return <AbsoluteFill style={{ background: '#000' }}><img src={staticFile(shot.img)} style={{ position: 'absolute', left: (1080 - 886) / 2, top: 0, width: 886, height: 1920, imageRendering: 'pixelated', transform: `scale(${(shot.zoom?.[0] ?? 1) * (1 + 0.06 * f / shot.frames)})`, transformOrigin: `50% ${shot.zoom?.[1] ?? 50}%` }} /></AbsoluteFill>;
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
          <Shake at={s.shake ?? []}><ShotView shot={s} /></Shake>
          {s.finder ? <Finder /> : null}
          {(s.tap ?? []).map(([at, x, y, skin], i) => <Thumb key={'t' + i} at={at} x={x} y={y} skin={skin} />)}
          {s.hover ? <Hover at={s.hover[0]} x={s.hover[1]} y={s.hover[2]} /> : null}
          {s.flash !== undefined ? <Flash at={s.flash} /> : null}
          {s.drop ? <Drop d={s.drop} /> : null}
          {s.rain ? <Rain d={s.rain === true ? 1 : [...s.rain].reverse().find(([k]) => frame - s.from >= k)?.[1] ?? 0} /> : null}{(s.drip ?? []).map(([at, x, y], i) => <Drip key={'dr' + i} at={at} x={x} y={y} />)}
          {(s.poof ?? []).map(([at, x, y], i) => <Poof key={i} at={at} x={x} y={y} />)}
          {(s.say ?? []).filter((l) => vo[l.key]).map((l) => (
            <Sequence key={l.key} from={l.at} durationInFrames={Math.ceil(vo[l.key].dur * 24) + 2} layout="none"><Audio src={staticFile(vo[l.key].file)} /></Sequence>
          ))}
        </Sequence>
      ))}
      {/* no music (founder, Nov 17): beds are room sound only */}
      {def.beds.map(([f, v, until, start]) => { const a = start ? shots.find((s) => s.n === start)?.from ?? 0 : 0, b = until ? shots.find((s) => s.n === until)?.from ?? total : total; return <Sequence key={f} from={a} durationInFrames={Math.max(1, b - a)} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v} /></Sequence>; })}
      {shots.flatMap((s) => (s.shake ?? []).map((at, i) => <Sequence key={`${s.n}hit${i}`} from={s.from + at} layout="none"><Audio src={staticFile('sfx/sk_hit.wav')} volume={0.8} /></Sequence>))}
      {shots.flatMap((s) => (s.sfx ?? []).map(([f, at, v, len], i) => (
        <Sequence key={`${s.n}fx${i}`} from={s.from + at} durationInFrames={len} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v ?? 1} /></Sequence>)))}
      {/* one subtitle at a time: when lines overlap (the rain panic) the newest wins, so two never print on top of each other */}
      {p.subs !== false ? (() => { const on = shots.flatMap((s) => (s.say ?? []).filter((l) => vo[l.key]).map((l) => ({ l, a: s.from + l.at, b: s.from + l.at + Math.max(Math.ceil(vo[l.key].dur * 24) + 8, 30) })))
        .filter(({ a, b }) => frame >= a && frame < b).sort((x, y) => y.a - x.a)[0]; return on ? <Sub key={on.l.key} text={vo[on.l.key].sub} /> : null; })() : null}
    </AbsoluteFill>
  );
};
