// ONE SIP. The game: every sip makes Sami a hundred years more formal. Nio's party, his room. Final lines from the
// writers' room (Nov 17; v5 the juice box reveal, no faint, Nov 17). Voice medium B (1930s radio). Nobody else is in the room, so nobody stares.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
// where each piece lands in the picture (1080 x 1920), for its puff: Sami in samiClose, Nio in nio
const BOW: [number, number] = [440, 1300], EYE: [number, number] = [500, 820], HAT: [number, number] = [290, 250], CHEEK: [number, number] = [210, 930], NBOW: [number, number] = [550, 1185], MOUSTACHE: [number, number] = [500, 990];
const DROP: [number, number, number, number, number] = [8, 490, 640, 641, 1400]; // the monocle, from his eye down into the cup (sami camera; set from a still)
const P = (camera: string, actors: A[], props?: string[]): ShotSpec => ({ set: 'partyLive', camera, frames: 1, actors, props });
const W0: string[] = [], W1 = ['bowtie'], W2 = ['bowtie', 'monocle', 'tophat'], W3 = ['bowtie', 'monocle', 'tophat', 'moustache']; // a moustache, not sideburns: sideburns read as ears (stranger, Nov 17)
const sami = (face: A['face'], wear: A['wear'], x: Partial<A> = {}): A => ({ who: 'sami', at: 'samiL', action: 'stand', face, facing: 'nioR', wear, ...x });
const nio = (face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at: 'nioR', action: 'stand', face, facing: 'samiL', ...x });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
// the sip: cup up for 16 frames, then down to the waist as the new piece pops on at frame 16
const sipShot = (n: number, from: string[], to: string[], poof: [number, number][]): Shot => ({ n, frames: 34, poof: poof.map(([x, y]) => [16, x, y] as [number, number, number]),
  spec: (f) => P('samiClose', [sami(f < 16 ? 'uneasy' : 'smug', f < 16 ? from : to, { hold: f < 16 ? 'sip' : 'cup', hand: 0 })]),
  sfx: [['sk_sip', 3, 0.5], ['sk_gulp', 11, 0.9], ['sk_pop', 16, 0.9]] });

const shots: Shot[] = [
  { n: 1, frames: 60, spec: P('twoS', [nio('charm', { hold: 'cup-point' }), sami('uneasy', W0)]), say: [L('os_01', 'sami', 6)] },
  { n: 2, frames: 56, spec: P('nio', [nio('charm', { hold: 'cup-point' })]), say: [L('os_02', 'nio', 4)] },
  sipShot(3, W0, W1, [BOW]),
  { n: 4, frames: 60, spec: P('sami', [sami('smug', W1, { hold: 'cup' })]), say: [L('os_03', 'sami', 2)] },
  sipShot(5, W1, W2, [EYE, HAT]),
  { n: 6, frames: 50, spec: P('sami', [sami('smug', W2, { hold: 'cup' })]), say: [L('os_04', 'sami', 2)] },
  { n: 7, frames: 22, spec: P('nio', [nio('deadpan')]) }, // Nio, a carriage requested of him
  sipShot(8, W2, W3, [MOUSTACHE]),
  { n: 9, frames: 50, spec: P('sami', [sami('rage', W3, { hold: 'cup-point' })]), say: [L('os_05', 'sami', 2)] },
  // the reveal, no words: what Nio poured from. A kid's juice box. He squeezes it; it wheezes.
  { n: 10, frames: 40, spec: P('nio', [nio('deadpan', { hold: 'juicebox', facing: 'camera' })]), sfx: [['sk_wheeze', 12, 0.9]] },
  // Sami stares at it. His monocle drops out of his eye into the cup.
  { n: 11, frames: 34, spec: (f) => P('sami', [sami('shock', f < 8 ? W3 : W3.filter((w) => w !== 'monocle'), { hold: 'cup' })]), drop: DROP, sfx: [['sk_plink', 15, 0.9]] },
  // the button: Nio sips the juice box. Pop: a bow tie. He looks down, straightens it, keeps it. Cut on the straighten.
  { n: 12, frames: 34, spec: (f) => P('nio', [nio(f < 16 ? 'deadpan' : 'smug', { hold: f < 16 ? 'sipbox' : 'juicebox', wear: f < 16 ? W0 : W1 })]),
    sfx: [['sk_gulp', 8, 0.8], ['sk_pop', 16, 0.9]], poof: [[16, NBOW[0], NBOW[1]]] },
  { n: 13, frames: 22, spec: P('nio', [nio('smug', { wear: W1, act: { g: [[2, 'chest']] } })]), sfx: [['sk_gleam', 8, 0.6]] },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_chatter', 0.35]] };
