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
// The lecture hall.
const H = (camera: string, actors: ShotSpec['actors'], campus: ShotSpec['campus'] = {}): ShotSpec => ({ set: 'hall', camera, frames: 1, actors, campus: { dusty: true, ...campus } });
const prof = (face: ShotSpec['actors'][0]['face']) => ({ who: 'profH', at: 'lectern', action: 'talk', face });
const seat = (who: string, face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: who === 'capGirl' ? 'cap' : who, at: who, action: talk ? 'sitTalk' : 'sit', face });
// The office.
const O = (camera: string, actors: ShotSpec['actors'], campus: ShotSpec['campus'] = {}): ShotSpec => ({ set: 'office', camera, frames: 1, actors, campus: { flyer: 0, door: 0, ...campus } });
const onio = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'nio', at: 'nio', action: talk ? 'sitTalk' : 'sit', face });
const oprof = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'profH', at: 'profH', action: talk ? 'sitTalk' : 'sit', face });
// The corridor and the pitch.
const C = (camera: string, actors: ShotSpec['actors'], campus: ShotSpec['campus'] = {}): ShotSpec => ({ set: 'corridor', camera, frames: 1, actors, campus });
const cnio = (at: string, face: ShotSpec['actors'][0]['face']) => ({ who: 'nio', at, action: 'stand', face });
const P = (camera: string, actors: ShotSpec['actors']): ShotSpec => ({ set: 'pitch', camera, frames: 1, actors });
const waiters = (spin = true): ShotSpec['actors'] => [
  { who: 'spinner', at: 'seatR4', action: 'sit', face: 'deadInside', hold: spin ? 'spinner' : undefined },
  { who: 'crown', at: 'seatR5', action: 'sit', face: 'neutral' },
];
const nioSit = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'nio', at: 'seatL3', action: talk ? 'sitTalk' : 'sit', face });
const darnellSit = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'darnell', at: 'seatL4', action: talk ? 'sitTalk' : 'sit', face, hold: 'ticket' as const });

const NONE = null; // a set the design thread has not delivered yet: the shot cannot be drawn, so no cut ships with it
const sh = (n: number, frames: number, cut: 'S' | 'L', spec: Shot['spec'], say?: Line[], sfx?: Shot['sfx']): Shot => ({ n, frames, cut, spec, say, sfx });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });

export const SHOTS: Shot[] = [
  // THE LECTURE HALL. Prof H at the lectern; Nio row 4 aisle, Theo on his left, the cap girl in front of Nio.
  sh(1, 94, 'S', H('low', [prof('charm')], { laptop: [[0, 1], [8, 0]] }), [L('oh_01', 'profH', 12)], [['laptop', 6, 0.8]]),
  sh(2, 36, 'S', H('profH', [{ ...prof('hyped'), look: 'camera' }]), [L('oh_02', 'profH', 4)]),
  sh(3, 36, 'S', H('rows', [seat('nio', 'deadpan'), seat('theo', 'neutral'), seat('capGirl', 'neutral')], { turn: [[0, 0], [2, 1]] })),
  sh(4, 48, 'S', H('capGirl', [{ who: 'cap', at: 'capGirl', action: 'sit', face: 'real', hold: 'capOff' }, seat('nio', 'suspicious')], { turn: 1 })),
  sh(5, 36, 'S', H('two', [seat('nio', 'deadpan'), { ...seat('theo', 'uneasy', true), hold: 'pen', mouth: 0.5, gaze: [0.6, 0] }]), [L('oh_03', 'theo', 2)]),
  sh(6, 74, 'S', H('nio', [seat('nio', 'smug', true)]), [L('oh_04', 'nio', 4)], [['zip', 104, 0.6]]),
  sh(7, 36, 'S', H('theo', [{ ...seat('theo', 'deadInside', true), hold: 'pen' }]), [L('oh_05', 'theo', 2)]),
  sh(8, 30, 'S', H('nio', [seat('nio', 'suspicious', true)]), [L('oh_06', 'nio', 2)]),
  sh(9, 48, 'S', { ...H('seat', []), push: 0.12 }),
  sh(10, 44, 'S', H('nio', [seat('nio', [[0, 'uneasy'], [12, 'deadpan']], true)]), [L('oh_07', 'nio', 12)]),
  // THE CORRIDOR. It loops: the same door, a little more open each time.
  sh(11, 60, 'S', (f) => C('long', [f < 26 ? { ...cnio('look', 'deadpan'), facing: 'far', back: true } : { ...cnio('look', 'deadpan'), facing: 'near' }], { door: 0.7 })),
  sh(12, 80, 'S', { ...C('plaque', [], { door: [[0, 0.7], [79, 0.78]] }), push: 0.15 }),
  sh(13, 48, 'S', C('corner', [{ ...cnio('look2', 'deadpan'), facing: 'near', back: true }], { door2: 0.95 })),
  sh(14, 29, 'L', C('nio', [{ ...cnio('mid', 'deadInside'), facing: 'camera' }]), [L('oh_08', 'nio', 6)]),
  sh(15, 72, 'L', (f) => f < 36 ? C('stairs', [cnio('stairDoor', [[0, 'hyped'], [8, 'shock']])], { stairs: [[0, 0], [4, 1]] })
    : C('long', [{ ...cnio('look', 'shock'), facing: 'far', back: true }], { door: 0.85 }), undefined, [['bang', 4, 0.8]]),
  sh(16, 72, 'S', { ...C('mcu', [{ ...cnio('mid', 'deadpan'), facing: 'camera', hold: 'phone' }], { door: 0.85 }), phone: 'insert', screen: 'map-office-hours',
    thumb: [[0, [0.35, -0.1, 1]], [30, [0.0, -0.55, 1]], [38, [0.0, -0.55, 0]], [46, [0.0, -0.55, 1]]] }, undefined, [['tap', 38, 0.9]]),
  sh(17, 62, 'S', C('mcu', [{ ...cnio('mid', 'real'), facing: 'camera', hold: 'phone', glow: 1, gaze: [0, -0.8] }], { door: 0.85 }), [L('oh_09', 'nio', 6)]),
  sh(18, 96, 'L', C('cleaner', [{ ...cnio('mid', 'uneasy'), facing: 'camera', hold: 'phone', gaze: [0.6, -0.2] }, { who: 'cleaner', at: 'cleanerA', to: 'cleanerB', action: 'walk', face: 'deadpan', hold: 'mop' }], { door: 0.85 }),
    [L('oh_10', 'cleaner', 20)], [['mop', 0, 0.5], ['mop', 30, 0.5], ['mop', 60, 0.5]]),
  sh(19, 29, 'S', C('sprint', [{ who: 'nio', at: 'mid', to: 'door', action: 'sprint', face: 'shock' }], { door: 0.9 }), undefined, [['whoosh', 14, 0.8]]),
  // THE WAITING ROOM. The smash cut lands; silence but the hum; only the spinner and Nio's eyes move.
  sh(20, 72, 'S', { ...W('aisle', 72, [nioSit('shock'), darnellSit('neutral'), ...waiters()]), push: 0.35 }, undefined, [['hit', 0, 0.9]]),
  sh(21, 29, 'L', W('clock', 29, [])),
  sh(22, 36, 'S', W('darnell', 36, [darnellSit('charm', true)]), [L('oh_11', 'darnell', 6)]),
  sh(23, 44, 'S', W('nio', 44, [nioSit('smug', true)]), [L('oh_12', 'nio', 4)]),
  sh(24, 44, 'S', W('two', 44, [nioSit('uneasy'), darnellSit('charm', true)]), [L('oh_13', 'darnell', 3)]),
  sh(25, 36, 'S', W('ticket', 36, [darnellSit('neutral')])), // insert: Darnell's ticket, 4, his thumb on the coffee ring
  sh(26, 72, 'S', W('darnell', 72, [darnellSit('real', true)]), [L('oh_14', 'darnell', 8)]),
  sh(27, 60, 'S', W('nio', 60, [nioSit([[0, 'crushed'], [24, 'sheepish']], true)]), [L('oh_15', 'nio', 26)]),
  sh(28, 29, 'L', W('darnell', 29, [darnellSit([[0, 'charm'], [14, 'neutral']])])),
  sh(29, 56, 'S', (f) => W('door', 56, f < 6 ? [] : [{ who: 'profH', at: 'doorway', action: 'talk', face: 'laughing' }],
    { serving: 3, clock: null, door: Math.min(1, f / 6) }), [L('oh_16', 'profH', 10)], [['creak', 0, 0.6]]),
  // THE OFFICE. Nio in the visitor's chair, Prof H folded behind the desk, the door behind Nio.
  sh(30, 52, 'S', O('wide', [{ ...onio('uneasy'), back: true }, oprof('real', true)]), [L('oh_17', 'profH', 10)]),
  sh(31, 24, 'S', O('nio', [onio('uneasy')])),
  sh(32, 80, 'S', O('flyer', [{ ...oprof('neutral'), hold: 'slideFlyer' }], { flyer: [[6, 0], [34, 1]] }), undefined, [['paper', 6, 0.7]]),
  sh(33, 52, 'S', O('profH', [oprof('real', true)], { flyer: 1 }), [L('oh_18', 'profH', 8)]),
  sh(34, 60, 'S', O('nio', [onio([[0, 'uneasy'], [24, 'sheepish']], true)], { flyer: 1 }), [L('oh_19', 'nio', 26)]),
  sh(34.5, 48, 'S', O('profH', [oprof('crushed', true)], { flyer: 1 }), [L('oh_20', 'profH', 4)]),
  // Same angle as 20: the clock has hands, NOW SERVING 4, the door open, and Darnell walks out into the light.
  sh(35, 48, 'S', W('aisle', 48, [{ who: 'darnell', at: 'middle', to: 'doorway', action: 'walk', face: 'charm', back: true }, ...waiters(false)],
    { serving: 4, clock: [2.6, 0.1], door: 1 })),
  sh(36, 44, 'S', O('door', [oprof('hyped', true)], { flyer: 1, door: 1 }), [L('oh_21', 'profH', 6)]),
  sh(37, 36, 'L', O('wide', [oprof('charm')], { flyer: 1, door: [[0, 1], [20, 0]] }), undefined, [['click', 20, 0.8]]),
  // THE PITCH, 5:01 PM. Bright and normal after the eerie.
  sh(38, 40, 'S', P('wide', [{ who: 'nio', at: 'gate', to: 'nio', action: 'jog', face: 'deadpan' }, { who: 'theo', at: 'theo', action: 'stand', face: 'suspicious' }]),
    [L('oh_22', 'theo', 14)], [['grass', 0, 0.4], ['grass', 8, 0.4], ['grass', 16, 0.4], ['grass', 24, 0.4]]),
  sh(39, 30, 'S', P('nio', [{ who: 'nio', at: 'nio', action: 'talk', face: 'deadInside' }]), [L('oh_23', 'nio', 2)]),
  sh(40, 13, 'S', P('theo', [{ who: 'theo', at: 'theo', to: 'theoBack', action: 'stepBack', face: 'shock' }])),
  sh(41, 56, 'S', P('nio', [{ who: 'nio', at: 'nio', action: 'talk', face: [[0, 'deadpan'], [40, 'smug']], hold: 'flyer' }]), [L('oh_24', 'nio', 6)]),
  sh(42, 30, 'S', P('theo', [{ who: 'theo', at: 'theoBack', action: 'stand', face: 'shock', pale: [[0, 0], [14, 1]] }])),
];

// A shot is never shorter than its lines: the last line ends at least 6 frames before the cut.
const lenOf = (s: Shot) => Math.max(s.frames, ...(s.say ?? []).map((l) => l.at + Math.ceil((vo[l.key]?.dur ?? 0) * 24) + 6));

// Where each shot is, for the sound beds. The theme plays from the lecture hall through the corridor, stops dead on the
// smash cut into the waiting room (20), and comes back on the pitch (38).
const PLACE = (n: number) => n <= 10 ? 'hall' : n <= 19 ? 'corridor' : n <= 29 || n === 35 ? 'waiting' : n <= 37 ? 'office' : 'pitch';
const BEDS: Record<string, [string, number][]> = { hall: [['oh_hall', 0.35]], corridor: [['oh_hum', 0.25]], waiting: [['oh_hum', 0.3]], office: [['oh_office', 0.3]], pitch: [['oh_pitch', 0.35]] };
const MUSIC = (n: number) => n <= 19 || n >= 38;

export type OHProps = { cut: 'short' | 'long'; only?: number[] };
export const timeline = (p: OHProps) => {
  let at = 0;
  return SHOTS.filter((s) => (p.cut === 'long' || s.cut === 'S') && (!p.only || p.only.includes(s.n))).map((s) => { const r = { ...s, frames: lenOf(s), from: at }; at += r.frames; return r; });
};
export const ohLength = (p: OHProps) => timeline(p).reduce((a, s) => a + s.frames, 0);

// Runs of shots that share a key: [key, first frame, end frame].
const runs = (shots: (Shot & { from: number })[], key: (s: Shot) => string): [string, number, number][] => {
  const out: [string, number, number][] = [];
  shots.forEach((s) => { const k = key(s), last = out[out.length - 1];
    if (last && last[0] === k && last[2] === s.from) last[2] = s.from + s.frames; else out.push([k, s.from, s.from + s.frames]); });
  return out;
};

const withScreen = (sc: ReturnType<typeof buildShot>, screen?: string) => (screen ? { ...sc, screenTex: staticFile(`pxi-ui/screens/${screen}.png`) } : sc);

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  if (!shot.spec) return <AbsoluteFill style={{ background: '#2a2628', color: '#8a8488', fontFamily: 'Pixelify', fontSize: 64, alignItems: 'center', justifyContent: 'center' }}>{`shot ${shot.n}: set not built`}</AbsoluteFill>;
  const base = typeof shot.spec === 'function' ? shot.spec(f) : shot.spec;
  const spec: ShotSpec = { ...base, frames: shot.frames, actors: base.actors.map((a) => {
    const mine = (shot.say ?? []).filter((l) => l.who === a.who && lips[l.key]);
    return mine.length ? { ...a, speak: mine.map((l) => [l.at, lips[l.key]] as [number, Cues]) } : a;
  }) };
  return <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `scale(${1080 / PW})`, transformOrigin: '0 0', imageRendering: 'pixelated' }}>
    <SdfShot scene={withScreen(buildShot(spec, f), spec.screen)} /></div>;
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
      {runs(shots, (s) => PLACE(s.n)).flatMap(([k, a, b]) => BEDS[k].map(([f, v]) => (
        <Sequence key={`${k}${a}${f}`} from={a} durationInFrames={b - a} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v} /></Sequence>)))}
      {runs(shots, (s) => (MUSIC(s.n) ? 'm' : '')).filter(([k]) => k).map(([, a, b]) => (
        <Sequence key={`m${a}`} from={a} durationInFrames={b - a} layout="none"><Audio src={staticFile('sfx/oh_theme.wav')} volume={(f) => ((shots.find((s) => s.from <= a + f && a + f < s.from + s.frames)?.say?.length ?? 0) ? 0.1 : 0.2)} /></Sequence>))}
      {shots.flatMap((s) => (s.sfx ?? []).map(([f, at, v], i) => (
        <Sequence key={`${s.n}fx${i}`} from={s.from + at} layout="none"><Audio src={staticFile(`sfx/oh_${f}.wav`)} volume={v ?? 1} /></Sequence>)))}
      {shots.flatMap((s) => (s.say ?? []).filter((l) => vo[l.key]).map((l) => {
        const a = s.from + l.at, b = a + Math.max(Math.ceil(vo[l.key].dur * 24) + 8, 30);
        return frame >= a && frame < b ? <Sub key={l.key} text={vo[l.key].sub} /> : null;
      }))}
    </AbsoluteFill>
  );
};
