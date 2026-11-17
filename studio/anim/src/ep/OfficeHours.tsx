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
import ACC from '../lips/oh_accents.json';
import { Accents } from '../nw3d/acting';

type Line = { key: string; who: string; at: number }; // at: the frame inside the shot where the line starts
type Shot = { n: number; frames: number; cut: 'S' | 'L'; spec: ShotSpec | ((f: number) => ShotSpec) | null; say?: Line[]; sfx?: [string, number, number?][]; res?: number; fx?: 'trailer' | 'card' };
type VoLine = { file: string; who: string; sub: string; dur: number };
const vo = VO as unknown as Record<string, VoLine>;
const lips = LIPS as unknown as Record<string, Cues>;
const acc = ACC as unknown as Record<string, Accents>;

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

const T452: [number, number] = [2.556, 5.445], T453: [number, number] = [2.565, 5.55], T454: [number, number] = [2.574, 5.655]; // the hall clock: 4:52, 4:53, 4:54
const mayaSit = (face: ShotSpec['actors'][0]['face'], talk = false) => ({ who: 'maya', at: 'seatL5', action: talk ? 'sitTalk' : 'sit', face });
const NONE = null; // a set the design thread has not delivered yet: the shot cannot be drawn, so no cut ships with it
// res: draw this shot at that many times the show's pixels (only the phone insert, so the screen reads)
// fx: 'trailer' plays the shot as Nio's imagined film trailer (grainy, red, letterboxed); 'card' is the trailer's title card
const sh = (n: number, frames: number, cut: 'S' | 'L', spec: Shot['spec'], say?: Line[], sfx?: Shot['sfx'], res = 1, fx?: 'trailer' | 'card'): Shot => ({ n, frames, cut, spec, say, sfx, res, fx });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });

export const SHOTS: Shot[] = [
  // THE LECTURE HALL, 4:52 PM. Nio on the aisle in his kit, his football on the desk; Maya on his left with her tabs; the
  // dusty seat; Theo past it. Prof H shuts the laptop and whispers into the mic.
  sh(1, 30, 'S', H('low', [prof('charm')], { laptop: [[0, 1], [8, 0]], clock: T452 }), undefined, [['laptop', 6, 0.8]]),
  sh(2, 40, 'S', { ...H('profH', [{ ...prof('charm'), look: 'camera' }], { clock: T452 }), push: 0.3 }, [L('v5_01', 'profH', 4)]),
  sh(3, 36, 'S', { ...H('rows', [seat('nio', 'deadpan'), seat('maya', 'neutral'), seat('capGirl', 'neutral')], { turn: [[0, 0], [2, 1]], ball: true, clock: T452 }), push: 0.5 }),
  sh(4, 30, 'S', H('two', [seat('nio', 'uneasy'), { ...seat('maya', 'charm', true), gaze: [0.3, 0], act: { g: [[0, 'fists']] } } as any], { ball: true, turn: 1, clock: T452 }), [L('v5_02', 'maya', 2)]),
  sh(5, 30, 'S', H('nio', [{ ...seat('nio', 'deadpan', true), gaze: [-0.6, 0] }], { ball: true, turn: 1, clock: T452 }), [L('v5_03', 'nio', 2)]),
  sh(6, 20, 'S', (f) => ({ ...H('clock', [], { clock: f < 10 ? T452 : T453, turn: 1 }), push: 0.25 }), undefined, [['click', 10, 0.35]]), // insert: the clock
  sh(7, 24, 'S', H('two', [{ ...seat('nio', 'deadpan'), gaze: [-0.5, 0] }, { ...seat('maya', 'laughing', true), gaze: [0.7, 0] }], { ball: true, turn: 1, clock: T453 }), [L('v5_04', 'maya', 2)]),
  sh(8, 30, 'S', H('nio', [{ ...seat('nio', [[0, 'deadpan'], [70, 'smug']], true), gaze: [-0.5, 0] }], { ball: true, turn: 1, clock: T453 }), [L('v5_05', 'nio', 2)]),
  sh(9, 30, 'S', H('maya', [{ ...seat('maya', 'deadInside', true), gaze: [0.7, 0] }], { turn: 1, clock: T453 }), [L('v5_06', 'maya', 2)]),
  // NIO'S TRAILER: what he thinks office hours is, cut like a film trailer, grainy and red, in his own trailer voice
  sh(10, 30, 'S', { ...C('long', [], { door: 0.7 }), push: 0.7 }, [L('v5_07', 'nio', 4)], [['hit', 0, 0.6]], 1, 'trailer'),
  sh(11, 24, 'S', { ...W('clock', 24, []), push: 0.3 }, undefined, [['hit', 0, 0.5]], 1, 'trailer'),
  sh(12, 30, 'S', { ...W('darnell', 30, [darnellSit('deadInside')]), push: 0.3 }, undefined, [['hit', 0, 0.5]], 1, 'trailer'),
  sh(13, 103, 'S', null, [L('v5_08', 'nio', 0)], [['hit', 0, 0.8]], 1, 'card'),
  sh(14, 30, 'S', H('maya', [{ ...seat('maya', 'suspicious', true), gaze: [0.8, 0] }], { turn: 1, clock: T454 }), [L('v5_09', 'maya', 6)]),
  sh(15, 30, 'S', H('theo', [{ ...seat('theo', 'deadInside', true), hold: 'pen' }], { turn: 1, clock: T454 }), [L('oh_05', 'theo', 2)]),
  sh(16, 30, 'S', H('nio', [seat('nio', 'suspicious', true)], { ball: true, turn: 1, clock: T454 }), [L('oh_06', 'nio', 2)]),
  // Theo turns, slowly, to the seat beside him; then the seat itself: dust, a cobweb, his name card
  sh(17, 36, 'S', (f) => { const u = Math.min(1, f / 30), e = u * u * (3 - 2 * u); return { ...H('theoSeat', [{ ...seat('theo', 'deadInside'), gaze: [-0.9 * e, -0.3 * e] as [number, number] }], { turn: 1, clock: T454 }), push: 0.2 }; }),
  sh(18, 44, 'S', { ...H('seat', [], { turn: 1 }), push: 0.15 }),
  sh(19, 30, 'S', H('nio', [seat('nio', [[0, 'uneasy'], [10, 'deadpan']], true)], { ball: true, turn: 1, clock: T454 }), [L('v5_10', 'nio', 6)], [['zip', 4, 0.6]]),
  sh(20, 24, 'S', H('two', [seat('nio', 'deadpan'), { ...seat('maya', 'hyped', true), gaze: [0.7, 0.2] }], { ball: true, turn: 1, clock: T454 }), [L('v5_11', 'maya', 2)]),
  // THE CORRIDOR. They walk at the door at the end; it never gets closer.
  sh(21, 96, 'S', C('corner', [{ who: 'nio', at: 'walkA', to: 'walkB', action: 'walk', face: 'deadpan' }, { who: 'maya', at: 'mayaA', to: 'mayaB', action: 'walk', face: 'hyped' }], { door: 0.7, door2: 0.95 })),
  sh(22, 60, 'S', { ...C('plaque', [], { door: [[0, 0.7], [59, 0.78]] }), push: 0.15 }),
  sh(23, 48, 'S', { ...C('corner', [{ ...cnio('look2', 'deadpan'), facing: 'near', back: true }], { door2: 0.95 }), push: 0.4 }),
  sh(24, 30, 'S', C('two', [{ ...cnio('mid', 'deadInside'), facing: 'camera' }, { who: 'maya', at: 'mayaMid', action: 'talk', face: 'hyped', facing: 'camera' }], { door: 0.85 }), [L('v5_12', 'maya', 4)]),
  sh(25, 72, 'S', { ...C('mcu', [{ ...cnio('mid', 'deadpan'), facing: 'camera', hold: 'phone' }], { door: 0.85 }), phone: 'pov', screen: 'map-office-hours',
    thumb: [[0, [0.95, -0.95, 1]], [44, [0.95, -0.95, 1]], [50, [0.2, -0.6, 1]], [54, [0.2, -0.6, 0]], [62, [0.6, -0.9, 1]]] }, undefined, [['tap', 54, 0.9]], 2),
  sh(26, 30, 'S', C('mcu', [{ ...cnio('mid', 'shock'), facing: 'camera', hold: 'phone', glow: 1, gaze: [0, -0.4] }], { door: 0.85 }), [L('v5_13', 'nio', 4)]),
  sh(27, 30, 'S', C('two', [{ ...cnio('mid', 'shock'), facing: 'camera' }, { who: 'maya', at: 'mayaMid', action: 'talk', face: 'charm', facing: 'camera' }], { door: 0.85 }), [L('v5_14', 'maya', 2)]),
  sh(28, 96, 'S', C('cleaner', [{ ...cnio('mid', 'uneasy'), facing: 'camera', hold: 'phone', gaze: [0.6, -0.2] }, { who: 'cleaner', at: 'cleanerA', to: 'cleanerB', action: 'walk', face: 'deadpan', hold: 'mop' }], { door: 0.85 }),
    [L('v5_15', 'cleaner', 6)], [['mop', 0, 0.5], ['mop', 30, 0.5], ['mop', 60, 0.5]]),
  sh(29, 40, 'S', { ...C('plaque', [], { door: [[0, 0.78], [10, 1]] }), push: 0.2 }, undefined, [['creak', 0, 0.7]]),
  sh(30, 29, 'S', C('sprint', [{ who: 'nio', at: 'mid', to: 'door', action: 'sprint', face: 'shock' }], { door: 1 }), undefined, [['whoosh', 14, 0.8]]),
  // THE WAITING ROOM. Nio by the way in (L3), Darnell (L4), Maya beside Darnell (L5); the spinner boy and the girl opposite.
  sh(31, 48, 'S', { ...W('aisle', 48, [nioSit('shock'), darnellSit('neutral'), mayaSit('hyped'), ...waiters()]), push: 0.35 }, undefined, [['hit', 0, 0.9]]),
  sh(32, 30, 'S', W('three', 30, [nioSit('uneasy'), darnellSit('charm'), { ...mayaSit('hyped', true), gaze: [0.8, 0] }]), [L('v5_16', 'maya', 2)]),
  sh(33, 30, 'S', W('darnell', 30, [darnellSit('charm', true)]), [L('v5_17', 'darnell', 4)]),
  sh(34, 36, 'S', W('nio', 36, [nioSit([[0, 'deadInside'], [18, 'suspicious']])])),
  sh(35, 36, 'S', { ...W('nioTicket', 36, [{ ...nioSit('deadpan'), hold: 'ticket' as const }]), push: 0.25 }, undefined, [['paper', 2, 0.6]]),
  sh(36, 30, 'S', { ...W('sign', 30, []), push: 0.3 }),
  sh(37, 30, 'S', W('nio', 30, [nioSit('deadpan', true)]), [L('v5_18', 'nio', 4)]),
  sh(38, 48, 'S', (f) => W('darnell', 48, [darnellSit(f < 24 ? 'uneasy' : 'real', f >= 22)]), [L('v5_19', 'darnell', 22)]),
  sh(39, 30, 'S', W('maya', 30, [mayaSit('charm', true)]), [L('v5_20', 'maya', 4)]),
  sh(40, 52, 'S', (f) => ({ ...W('door', 52, f < 6 ? [] : [{ who: 'profH', at: 'doorway', action: 'talk', face: 'laughing' }], { serving: 3, clock: null, door: Math.min(1, f / 6) }), push: 0.3 }),
    [L('v5_21', 'profH', 8)], [['creak', 0, 0.6]]),
  sh(41, 40, 'S', { ...W('aisle', 40, [nioSit('sheepish'), darnellSit('crushed'), { ...mayaSit('hyped'), hold: 'arm-up' as const }, { ...waiters(false)[0], face: 'rage' }, { ...waiters(false)[1], face: 'crushed' }], { serving: 3, clock: null, door: 1 }), push: 0.35 }),
  // THE OFFICE. Tiny. A candle. Prof H folded behind the desk.
  sh(42, 40, 'S', O('wide', [{ ...onio('uneasy'), back: true }, oprof('charm')])),
  sh(43, 72, 'S', O('flyer', [{ ...oprof('neutral'), hold: 'slideFlyer' }], { flyer: [[6, 0], [34, 1]] }), undefined, [['paper', 6, 0.7]]),
  sh(44, 30, 'S', O('profH', [oprof('crushed', true)], { flyer: 1 }), [L('v5_22', 'profH', 4)]),
  sh(45, 36, 'S', O('nio', [onio([[0, 'uneasy'], [20, 'real']])], { flyer: 1 })),
  sh(46, 30, 'S', O('nio', [onio('real', true)], { flyer: 1 }), [L('v5_23', 'nio', 4)]),
  sh(47, 30, 'S', O('profH', [oprof('hyped')], { flyer: 1 })),
  sh(48, 44, 'S', O('wide', [{ ...onio('shock'), back: true }, oprof('hyped')], { flyer: 1, door: [[4, 0], [20, 1]] }), undefined, [['creak', 4, 0.7], ['whistle', 22, 0.8]]),
  // THE PITCH, 5:00 PM. A door standing in the middle of the grass. Nio steps out of it.
  sh(49, 50, 'S', P('door', [{ who: 'nio', at: 'door', to: 'nio', action: 'walk', face: 'deadpan' }]), undefined, [['grass', 10, 0.4], ['grass', 26, 0.4]]),
  sh(50, 30, 'S', P('theo', [{ who: 'theo', at: 'theo', action: 'talk', face: 'shock' }]), [L('v5_24', 'theo', 6)]),
  sh(51, 28, 'S', P('door', [{ who: 'maya', at: 'door', to: 'outA', action: 'walk', face: 'hyped' }, { who: 'nio', at: 'nio', action: 'stand', face: 'deadpan' }])),
  sh(52, 44, 'S', { ...P('goal', [{ who: 'darnell', at: 'goal', action: 'stand', face: 'real' }]), push: 0.3 }),
  sh(53, 40, 'S', P('nio', [{ who: 'nio', at: 'nio', action: 'talk', face: 'smug' }]), [L('v5_25', 'nio', 4)]),
];

// A shot is never shorter than its lines: the last line ends at least 6 frames before the cut.
const lenOf = (s: Shot) => Math.max(s.frames, ...(s.say ?? []).map((l) => l.at + Math.ceil((vo[l.key]?.dur ?? 0) * 24) + 6));

// Where each shot is, for the sound beds. The theme plays from the lecture hall through the corridor, stops dead on the
// smash cut into the waiting room (20), and comes back on the pitch (38).
const PLACE = (s: Shot) => s.fx ? 'trailer' : !s.spec ? 'trailer' : ({ hall: 'hall', corridor: 'corridor', waiting: 'waiting', office: 'office', pitch: 'pitch' } as Record<string, string>)[(typeof s.spec === 'function' ? s.spec(0) : s.spec).set];
const BEDS: Record<string, [string, number][]> = { hall: [['oh_hall', 0.35]], corridor: [['oh_hum', 0.25]], waiting: [['oh_hum', 0.3]], office: [['oh_office', 0.3]], pitch: [['oh_pitch', 0.35]], trailer: [] };

export type OHProps = { cut: 'short' | 'long'; only?: number[]; subs?: boolean; acting?: boolean }; // acting false: the old looping clips (for a before/after)
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

// Nio's imagined trailer: the shot in red and black, film grain that changes every frame, black bars top and bottom
const Trailer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#000' }}>
    <AbsoluteFill style={{ filter: 'grayscale(1) contrast(1.6) brightness(1.1)' }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: '#d4161e', mixBlendMode: 'multiply' }} />
    <AbsoluteFill style={{ opacity: 0.5, mixBlendMode: 'overlay' }}>
      <svg width="1080" height="1920"><filter id={`g${f}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f} /></filter><rect width="1080" height="1920" filter={`url(#g${f})`} /></svg>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)' }} />
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 300, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: 300, background: '#000' }} />
  </AbsoluteFill>;
};
// the trailer's title card: black, the title in big red letters, the tag line under it
const Card: React.FC = () => {
  const f = useCurrentFrame(), a = Math.min(1, f / 6);
  return <AbsoluteFill style={{ background: '#050203', alignItems: 'center', justifyContent: 'center', fontFamily: 'Pixelify', textAlign: 'center' }}>
    <div style={{ opacity: a, transform: `scale(${1 + f * 0.002})` }}>
      <div style={{ color: '#d8202a', fontSize: 150, letterSpacing: 8, lineHeight: 1.05 }}>OFFICE<br />HOURS</div>
      <div style={{ color: '#e8d8c8', fontSize: 56, marginTop: 60, opacity: f > 40 ? 1 : 0 }}>NOW SHOWING.</div>
      <div style={{ color: '#e8d8c8', fontSize: 56, marginTop: 10, opacity: f > 62 ? 1 : 0 }}>ALWAYS.</div>
    </div>
  </AbsoluteFill>;
};

const ShotView: React.FC<{ shot: Shot; acting?: boolean }> = ({ shot, acting }) => {
  const p = { acting };
  const f = useCurrentFrame();
  if (shot.fx === 'card') return <Card />;
  if (shot.fx === 'trailer') return <Trailer><ShotView shot={{ ...shot, fx: undefined }} acting={acting} /></Trailer>;
  if (!shot.spec) return <AbsoluteFill style={{ background: '#2a2628', color: '#8a8488', fontFamily: 'Pixelify', fontSize: 64, alignItems: 'center', justifyContent: 'center' }}>{`shot ${shot.n}: set not built`}</AbsoluteFill>;
  const base = typeof shot.spec === 'function' ? shot.spec(f) : shot.spec;
  const spec: ShotSpec = { ...base, frames: shot.frames, actors: base.actors.map((a) => {
    const mine = (shot.say ?? []).filter((l) => l.who === a.who && lips[l.key]);
    const theirs = (shot.say ?? []).filter((l) => l.who !== a.who && acc[l.key]).map((l) => [l.at, acc[l.key]] as [number, Accents]);
    const b = p.acting === false ? { ...a, act: false as const, compare: true as const, heard: theirs } : { ...a, heard: theirs };
    return mine.length ? { ...b, speak: mine.map((l) => [l.at, lips[l.key]] as [number, Cues]), acc: mine.filter((l) => acc[l.key]).map((l) => [l.at, acc[l.key]] as [number, Accents]) } : b;
  }) };
  const r = shot.res ?? 1;
  return <div style={{ position: 'absolute', left: 0, top: 0, width: PW * r, height: PH * r, transform: `scale(${1080 / (PW * r)})`, transformOrigin: '0 0', imageRendering: 'pixelated' }}>
    <SdfShot scene={withScreen(buildShot(spec, f), spec.screen)} w={PW * r} h={PH * r} /></div>;
};

export const OfficeHours: React.FC<OHProps> = (p) => {
  const shots = timeline(p);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#151216' }}>
      <Fonts />
      {shots.map((s) => (
        <Sequence key={s.n} from={s.from} durationInFrames={s.frames}>
          <ShotView shot={s} acting={p.acting} />
          {(s.say ?? []).filter((l) => vo[l.key]).map((l) => (
            <Sequence key={l.key} from={l.at} durationInFrames={Math.ceil(vo[l.key].dur * 24) + 2} layout="none"><Audio src={staticFile(vo[l.key].file)} /></Sequence>
          ))}
        </Sequence>
      ))}
      {runs(shots, (s) => PLACE(s)).flatMap(([k, a, b]) => BEDS[k].map(([f, v]) => (
        <Sequence key={`${k}${a}${f}`} from={a} durationInFrames={b - a} layout="none"><Audio src={staticFile(`sfx/${f}.wav`)} volume={v} /></Sequence>)))}
      {/* no music (founder, Nov 17: "the background track songs need to go ... chat + sfx with no music is good") */}
      {shots.flatMap((s) => (s.sfx ?? []).map(([f, at, v], i) => (
        <Sequence key={`${s.n}fx${i}`} from={s.from + at} layout="none"><Audio src={staticFile(`sfx/oh_${f}.wav`)} volume={v ?? 1} /></Sequence>)))}
      {shots.flatMap((s) => (s.say ?? []).filter((l) => vo[l.key]).map((l) => {
        const a = s.from + l.at, b = a + Math.max(Math.ceil(vo[l.key].dur * 24) + 8, 30);
        return p.subs !== false && frame >= a && frame < b ? <Sub key={l.key} text={vo[l.key].sub} /> : null;
      }))}
    </AbsoluteFill>
  );
};
