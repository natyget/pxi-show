// ONE SIP v7 (sketch approved by the founder, Nov 18). The game: Nio talks Sami into one sip, and every sip turns Sami
// into a worse person at the party. Nio's living room, a kickback: Maya, Theo, Imane and two friends. Each sip hits with a
// push-in, a shake and a bass hit, bigger every time. The reveal: it was a kid's apple juice box. The button: next
// morning, PXI finds him in 41 photos and he says Not me to each. Voice medium B (1930s radio).
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const P = (camera: string, actors: A[], push = 0.12, props?: string[], set = 'partyLive'): ShotSpec => ({ set, camera, frames: 1, actors, props, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const st = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'stand', face, ...x });
// the persona Sami pops into on each sip
const SNOB = ['scarf', 'glasses'], COACH = ['lanyard'], DUKE = ['tophat', 'monocle', 'moustache'], KING = ['lampshade', 'moustache'];
// where the new pieces land in the samiClose picture (1080 x 1920), for the puff
const HEAD: [number, number] = [500, 520], FACE: [number, number] = [500, 860], NECK: [number, number] = [470, 1240];
// the sip, by Nio, at the rug: cup up, gulp, then the new persona pops on at frame 16 with a hit. k: how big this one is.
const sipShot = (n: number, from: string[], to: string[], poof: [number, number][], k: number): Shot => ({ n, frames: 30 + 4 * k,
  shake: k === 1 ? [16] : k === 2 ? [16, 24] : [16, 22, 28], poof: poof.map(([x, y]) => [16, x, y] as [number, number, number]),
  spec: (f) => P('samiClose', [st('sami', 'samiL', f < 16 ? 'uneasy' : 'smug', { facing: 'nioR', wear: f < 16 ? from : to, hold: f < 16 ? 'sip' : 'cup', hand: 0 })], 0.1 + 0.08 * k),
  sfx: [['sk_sip', 3, 0.5], ['sk_gulp', 11, 0.9], ['sk_pop', 16, 0.9]] });
const MORNING: [string, number, number?][] = [['sk_quad', 0, 0.25]];

const shots: Shot[] = [
  // the kickback in Nio's living room: the guests talking, Nio and Sami on the rug
  { n: 1, frames: 30, spec: P('auxWide', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point', back: true }), st('sami', 'samiL', 'neutral', { facing: 'nioR' }), st('maya', 'g1', 'laughing', { facing: 'g3', hold: 'cup' }), st('imane', 'g3', 'charm', { facing: 'g1' }), st('theo', 'g4', 'hyped')], 0.3) },
  // Nio hands Sami a cup; Sami puts both palms up.
  { n: 2, frames: 50, spec: P('twoS', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' }), st('sami', 'samiL', 'uneasy', { facing: 'nioR', act: { g: [[6, 'palms']] } })]), say: [L('os_01', 'sami', 6)] },
  { n: 3, frames: 40, spec: P('nio', [st('nio', 'nioR', [[0, 'charm'], [30, 'smug']], { facing: 'samiL', hold: 'cup-point' })]), say: [L('os_02', 'nio', 2)] },
  // sip one: a scarf and little glasses. He points at the speaker.
  sipShot(4, [], SNOB, [NECK, FACE], 1),
  { n: 5, frames: 40, spec: P('sami', [st('sami', 'samiL', 'smug', { facing: 'osImane', wear: SNOB, act: { g: [[4, 'point']] } })]), say: [L('os_03', 'sami', 2)] },
  { n: 6, frames: 26, spec: P('imane', [st('imane', 'osImane', [[0, 'neutral'], [6, 'suspicious']], { facing: 'samiL' })]), say: [L('os_04', 'imane', 6)] },
  // Nio, the host, covers for him
  { n: 7, frames: 34, spec: P('nio', [st('nio', 'nioR', 'charm', { facing: 'osImane', act: { g: [[4, 'offer']] } })]), say: [L('os_05', 'nio', 2)] },
  // sip two: a life coach, cornering Imane against the wall. The room groans. Someone takes a photo.
  sipShot(8, SNOB, COACH, [NECK], 2),
  { n: 9, frames: 40, spec: P('coach', [st('sami', 'coachS', 'hyped', { facing: 'coachI', wear: COACH, act: { g: [[4, 'point']] } })]), say: [L('os_06', 'sami', 2)] },
  { n: 10, frames: 34, spec: P('coachI', [st('imane', 'coachI', [[0, 'uneasy'], [8, 'deadInside']], { facing: 'coachS' }), st('cap', 'coachC', 'uneasy', { facing: 'coachS', hold: 'photo' })]), flash: 20, sfx: [['sk_groan', 2, 0.6], ['shutter', 20, 0.7]] },
  { n: 11, frames: 30, spec: P('nio', [st('nio', 'nioR', 'sheepish', { facing: 'osImane', act: { g: [[4, 'neck']] } })]), say: [L('os_07', 'nio', 2)] },
  // sip three, bigger: top hat, monocle, moustache. He slaps Theo with a glove. Gasps.
  sipShot(12, COACH, DUKE, [HEAD, FACE], 3),
  { n: 13, frames: 44, shake: [14], spec: P('duel', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: DUKE, act: { g: [[12, 'point']] } })]), say: [L('os_08', 'sami', 18)], sfx: [['sk_gasp', 16, 0.8]] },
  { n: 14, frames: 30, spec: P('duel2', [st('theo', 'duelT', [[0, 'shock'], [6, 'suspicious']], { facing: 'duelS', act: { g: [[4, 'chest']] } })]), say: [L('os_09', 'theo', 2)] },
  { n: 15, frames: 30, spec: P('nio', [st('nio', 'nioR', 'uneasy', { facing: 'duelT', act: { g: [[4, 'palms']] } })]), say: [L('os_10', 'nio', 2)] },
  // sip four, the biggest: a lampshade for a crown, up on the coffee table. Everyone boos.
  sipShot(16, DUKE, KING, [HEAD], 3),
  { n: 17, frames: 56, shake: [2], spec: P('kingWide', [st('sami', 'king', 'hyped', { wear: KING, hold: 'arms-up' }), st('theo', 'booT', 'rage', { facing: 'king', back: true, hold: 'arm-up' }), st('imane', 'booI', 'rage', { facing: 'king', back: true })], 0.25), say: [L('os_11', 'sami', 4)], sfx: [['sk_boo', 6, 0.7]] },
  { n: 18, frames: 30, spec: P('mayaK', [st('maya', 'booM', [[0, 'rage'], [8, 'deadpan']], { facing: 'king', act: { g: [[10, 'point']] } })]), say: [L('os_12', 'maya', 4)] },
  // Nio has had enough. He holds up what he poured from: a kid's apple juice box. Close on him, looking at his friend: disgust.
  { n: 19, frames: 60, spec: P('nioRev', [st('nio', 'nioK', [[0, 'deadpan'], [10, 'disgust']], { facing: 'king', hold: 'juicebox' })], 0.1), say: [L('os_13', 'nio', 12)], sfx: [['sk_wheeze', 6, 0.6]] },
  // the next morning: Sami crashed on the sofa, his phone. PXI: you might be in 41 photos. Not me. Not me. Not me.
  { n: 20, frames: 36, spec: P('couch', [{ who: 'sami', at: 'couch', action: 'sit', face: 'crushed', hold: 'phone', wear: ['lanyard'] }], 0.1, undefined, 'livingDay'), sfx: [...MORNING, ['sk_ding', 18, 0.6]] },
  { n: 21, frames: 40, img: 'pxi-ui/screens/facematch.png', sfx: [['oh_tap', 30, 0.8]] },
  { n: 22, frames: 30, img: 'pxi-ui/screens/review-king.png', sfx: [['oh_tap', 22, 0.8]] },
  { n: 23, frames: 22, img: 'pxi-ui/screens/review-coach.png', sfx: [['oh_tap', 14, 0.8]] },
  { n: 24, frames: 24, img: 'pxi-ui/screens/review-duke.png', sfx: [['oh_tap', 12, 0.8]] },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_chatter', 0.35, 20]] };
