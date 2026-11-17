// ONE SIP. The game: every sip makes Sami a hundred years more formal. Nio's party, his room. Final lines from the
// writers' room (Nov 17). Voice medium B (1930s radio). Nobody else is in the room, so nobody stares.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
// where each piece lands in the picture (1080 x 1920), for its puff: Sami in samiClose, Nio in nio
const BOW: [number, number] = [440, 1300], EYE: [number, number] = [500, 820], HAT: [number, number] = [290, 250], CHEEK: [number, number] = [210, 930], NBOW: [number, number] = [560, 1210];
const P = (camera: string, actors: A[], props?: string[]): ShotSpec => ({ set: 'partyLive', camera, frames: 1, actors, props });
const W0: string[] = [], W1 = ['bowtie'], W2 = ['bowtie', 'monocle', 'tophat'], W3 = ['bowtie', 'monocle', 'tophat', 'sideburns'];
const sami = (face: A['face'], wear: A['wear'], x: Partial<A> = {}): A => ({ who: 'sami', at: 'samiL', action: 'stand', face, facing: 'nioR', wear, ...x });
const nio = (face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at: 'nioR', action: 'stand', face, facing: 'samiL', ...x });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
// the sip: cup up for 16 frames, then down to the waist as the new piece pops on at frame 16
const sipShot = (n: number, from: string[], to: string[], poof: [number, number][]): Shot => ({ n, frames: 34, poof: poof.map(([x, y]) => [16, x, y] as [number, number, number]),
  spec: (f) => P('samiClose', [sami(f < 16 ? 'uneasy' : 'smug', f < 16 ? from : to, { hold: f < 16 ? 'sip' : 'cup', hand: 0 })]),
  sfx: [['sk_sip', 3, 0.7], ['sk_pop', 16, 0.9]] });

const shots: Shot[] = [
  { n: 1, frames: 60, spec: P('twoS', [nio('charm', { hold: 'cup-point' }), sami('uneasy', W0)]), say: [L('os_01', 'sami', 6)] },
  { n: 2, frames: 48, spec: P('nio', [nio('charm', { hold: 'cup-point' })]), say: [L('os_02', 'nio', 4)] },
  sipShot(3, W0, W1, [BOW]),
  { n: 4, frames: 90, spec: P('sami', [sami('smug', W1, { hold: 'cup' })]), say: [L('os_03', 'sami', 4)] },
  sipShot(5, W1, W2, [EYE, HAT]),
  { n: 6, frames: 60, spec: P('sami', [sami('smug', W2, { hold: 'cup' })]), say: [L('os_04', 'sami', 4)] },
  { n: 7, frames: 22, spec: P('nio', [nio('deadpan')]) }, // Nio, a carriage requested of him
  sipShot(8, W2, W3, [CHEEK]),
  { n: 9, frames: 56, spec: P('sami', [sami('rage', W3, { hold: 'cup-point' })]), say: [L('os_05', 'sami', 4)] },
  { n: 10, frames: 34, spec: P('nio', [nio('suspicious', { hold: 'sniff', hand: 1 })]), sfx: [['sk_sniff', 6, 0.8]] },
  { n: 11, frames: 50, spec: P('nio', [nio('deadpan', { hold: 'cup' })]), say: [L('os_06', 'nio', 2)] },
  { n: 12, frames: 22, spec: P('samiClose', [sami('shock', W3)]), sfx: [['sk_gasp', 1, 0.8]] },
  { n: 13, frames: 20, spec: P('sami', [{ ...sami('asleep', W3), action: 'faint' }]) }, // cut as he leaves the bottom of the picture
  { n: 14, frames: 48, spec: { ...P('faint', [{ who: 'sami', at: 'chaise', action: 'lie', face: 'asleep', wear: W3 }], ['chaise']), push: 0.45 }, sfx: [['sk_flop', 0, 1]] },
  // the button: Nio looks at the cup, sips it, gets a bow tie, straightens it and keeps it
  { n: 15, frames: 18, spec: P('nio', [nio('suspicious', { hold: 'cup' })]) },
  { n: 16, frames: 34, spec: (f) => P('nio', [nio(f < 16 ? 'deadpan' : 'smug', { hold: f < 16 ? 'sip' : 'cup', hand: 1, wear: f < 16 ? W0 : W1 })]),
    sfx: [['sk_sip', 3, 0.7], ['sk_pop', 16, 0.9]], poof: [[16, NBOW[0], NBOW[1]]] },
  { n: 17, frames: 32, spec: P('nio', [nio('smug', { wear: W1, act: { g: [[2, 'chest']] } })]), sfx: [['sk_gleam', 10, 0.6]] },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_chatter', 0.35]] };
