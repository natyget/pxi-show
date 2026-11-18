// ONE SIP v8 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v8/scripts.md). Model: The Money, a belief held so
// hard it becomes physically true. Sami swears he can't handle a drink, so Nio quietly gives him juice to prove it's all
// in his head; every sip turns Sami into a worse guest anyway, until he's told to leave and Nio shows him the juice box.
// The juice box is poured in plain view in shot 2 and Maya sees it. Before each pop, Sami's eyes go far away for a
// moment, as if it's hitting. Each sip: a push-in, a shake and a hit, bigger every time. Voice medium B (1930s radio).
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const P = (camera: string, actors: A[], push = 0.12, props?: string[], set = 'partyLive'): ShotSpec => ({ set, camera, frames: 1, actors, props, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const st = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'stand', face, ...x });
// what each sip turns him into (three new pieces this skit: the beret, the headset mic; the top hat and lampshade exist)
const SNOB = ['beret'], COACH = ['headset'], DUKE = ['tophat'], KING = ['lampshade'];
const HEAD: [number, number] = [500, 520], FACE: [number, number] = [520, 900];
// the sip at the rug: cup up, gulp; his eyes go far away (FAR to C); then the new piece pops on at C with a hit
const FAR = 14, C = 26;
const sipShot = (n: number, from: string[], to: string[], poof: [number, number][], k: number): Shot => ({ n, frames: 46 + 4 * k,
  shake: k === 1 ? [C] : k === 2 ? [C, C + 8] : [C, C + 6, C + 12], poof: poof.map(([x, y]) => [C, x, y] as [number, number, number]),
  spec: (f) => P('samiS', [st('sami', 'samiL', f < FAR ? 'uneasy' : f < C ? 'real' : 'hyped', { wear: f < C ? from : to, hold: f < FAR ? 'sip' : 'cup', hand: 0, ...(f >= FAR && f < C ? { gaze: [0.1, 0.35] as [number, number] } : {}) })], 0.04 * k),
  sfx: [['sk_sip', 4, 0.5], ['sk_gulp', 11, 0.9], ['sk_hit', C, 0.9], ['sk_pop', C, 0.7]] });
const MORNING: [string, number, number?][] = [['sk_quad', 0, 0.25]];

const shots: Shot[] = [
  // 1. the kickback in Nio's living room
  { n: 1, frames: 30, spec: P('auxWide', [st('nio', 'nioR', 'neutral', { facing: 'samiL', hold: 'juicebox', back: true }), st('sami', 'samiL', 'neutral', { facing: 'nioR' }), st('maya', 'booM', 'neutral', { facing: 'nioR' }), st('imane', 'g3', 'charm', { facing: 'g4' }), st('theo', 'g4', 'charm')], 0.3) },
  // Nio fills a red cup from a kid's apple juice box, in plain view. Maya sees.
  { n: 2, frames: 30, spec: P('nio', [st('nio', 'nioR', 'neutral', { facing: 'samiL', hold: 'juicebox', gaze: [0.3, -0.5] })], 0.1), sfx: [['sk_sip', 6, 0.4]] },
  { n: 3, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'suspicious', { facing: 'nioR' })], 0.08), say: [L('os8_01', 'maya', 2)] },
  { n: 4, frames: 20, spec: P('nio', [st('nio', 'nioR', 'charm', { facing: 'booM', hold: 'juicebox' })], 0.06), say: [L('os8_02', 'nio', 2)] },
  // he hands it to Sami; palms up
  { n: 5, frames: 30, spec: P('twoS', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' }), st('sami', 'samiL', 'uneasy', { facing: 'nioR', act: { g: [[4, 'palms']] } })]), say: [L('os8_03', 'sami', 4)] },
  { n: 6, frames: 26, spec: P('nio', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' })]), say: [L('os8_04', 'nio', 2)] },
  // 2. sip one: a beret. He turns to the speaker, sincere.
  sipShot(7, [], SNOB, [HEAD], 1),
  { n: 8, frames: 30, spec: P('samiS', [st('sami', 'samiL', 'hyped', { wear: SNOB, act: { g: [[4, 'point']] } })]), say: [L('os8_05', 'sami', 2)] },
  { n: 9, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'deadpan', { facing: 'samiL' })], 0.06), say: [L('os8_06', 'maya', 2)] },
  { n: 10, frames: 30, spec: P('samiS', [st('sami', 'samiL', 'real', { wear: SNOB, facing: 'booM' })]), say: [L('os8_07', 'sami', 2)] },
  // 3. sip two: a headset mic. He's in front of Imane.
  sipShot(11, SNOB, COACH, [HEAD], 2),
  { n: 12, frames: 30, spec: P('coach', [st('sami', 'coachS', 'real', { facing: 'coachI', wear: COACH, act: { g: [[4, 'offer']] } })]), say: [L('os8_08', 'sami', 2)] },
  { n: 13, frames: 24, spec: P('imane', [st('imane', 'osImane', 'deadpan', { facing: 'coachS' })], 0.06), say: [L('os8_09', 'imane', 2)] },
  { n: 14, frames: 30, spec: P('coach', [st('sami', 'coachS', 'suspicious', { facing: 'coachI', wear: COACH })]), say: [L('os8_10', 'sami', 2)], sfx: [['sk_groan', 30, 0.6]] },
  { n: 15, frames: 26, spec: P('nio', [st('nio', 'nioR', 'sheepish', { facing: 'osImane', act: { g: [[4, 'palms']] } })]), say: [L('os8_11', 'nio', 2)] },
  // 4. sip three, bigger: a top hat. Whose coat is this.
  sipShot(16, COACH, DUKE, [HEAD], 3),
  { n: 17, frames: 28, spec: P('duel', [st('sami', 'duelS', 'suspicious', { facing: 'duelT', wear: DUKE, act: { g: [[4, 'point']] } })]), say: [L('os8_12', 'sami', 2)] },
  { n: 18, frames: 20, spec: P('duel2', [st('theo', 'duelT', 'deadpan', { facing: 'duelS' })], 0.06), say: [L('os8_13', 'theo', 2)] },
  // he slaps Theo. Gasps.
  { n: 19, frames: 34, shake: [16], spec: P('duel', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: DUKE, act: { g: [[14, 'dismiss']] } })]), say: [L('os8_14', 'sami', 2)], sfx: [['oh_hit', 16, 0.8], ['sk_gasp', 18, 0.8]] },
  { n: 20, frames: 30, spec: P('nio', [st('nio', 'nioR', 'shock', { facing: 'duelT', act: { g: [[4, 'palms']] } })]), say: [L('os8_15', 'nio', 2)] },
  // 5. sip four, the biggest: the lampshade for a crown, up on the coffee table. The room boos.
  sipShot(21, DUKE, KING, [HEAD], 3),
  { n: 22, frames: 40, shake: [2], spec: P('kingWide', [st('sami', 'king', 'hyped', { wear: KING, hold: 'arms-up' }), st('theo', 'booT', 'rage', { facing: 'king', back: true, hold: 'arm-up' }), st('imane', 'booI', 'rage', { facing: 'king', back: true })], 0.25), say: [L('os8_16', 'sami', 4)], sfx: [['sk_boo', 20, 0.7]] },
  { n: 23, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'rage', { facing: 'nioR', gaze: [-0.4, 0.2], act: { g: [[4, 'point']] } })], 0.06), say: [L('os8_17', 'maya', 2)] },
  // 6. Nio has had enough. He picks up the juice box, the same one, and just holds it up.
  { n: 24, frames: 34, spec: P('nioRev', [st('nio', 'nioK', [[0, 'deadpan'], [8, 'disgust']], { facing: 'king', hold: 'juicebox' })], 0.1), say: [L('os8_18', 'nio', 12)] },
  // Sami looks at it. The lampshade slides off.
  { n: 25, frames: 44, spec: P('kingWide', [st('sami', 'king', [[0, 'shock'], [12, 'sheepish']], { wear: [[0, KING], [12, []]], gaze: [0.3, -0.3] })], 0.1), say: [L('os8_19', 'sami', 18)], sfx: [['sk_flop', 12, 0.7]] },
  // 7. tag: the next morning, crashed on the sofa. PXI: you might be in 41 photos. Not me. Not me. Not me.
  { n: 26, frames: 30, spec: P('couch', [{ who: 'sami', at: 'couch', action: 'sit', face: 'crushed', hold: 'phone' }], 0.1, undefined, 'livingDay'), sfx: [...MORNING, ['sk_ding', 14, 0.6]] },
  { n: 27, frames: 40, img: 'pxi-ui/screens/push-face41.png', zoom: [1.12, 50], tap: [[30, 540, 955]], sfx: [['oh_tap', 30, 0.8]] },
  { n: 28, frames: 26, img: 'pxi-ui/screens/review-king.png', tap: [[18, 357, 1419]], sfx: [['oh_tap', 18, 0.8]] },
  { n: 29, frames: 22, img: 'pxi-ui/screens/review-duke.png', tap: [[14, 368, 1451]], sfx: [['oh_tap', 14, 0.8]] },
  { n: 30, frames: 24, img: 'pxi-ui/screens/review-snob.png', tap: [[12, 368, 1451]], sfx: [['oh_tap', 12, 0.8]] },
  // and his face: he remembers all of it
  { n: 31, frames: 44, spec: P('couch', [{ who: 'sami', at: 'couch', action: 'sit', face: [[0, 'neutral'], [10, 'crushed']], hold: 'phone' }], 0.4, undefined, 'livingDay'), sfx: MORNING },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_party', 0.22, 26], ['sk_walla', 0.5, 26]] };
