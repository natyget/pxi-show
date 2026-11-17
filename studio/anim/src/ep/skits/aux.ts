// AUX. The game: at this party whatever plays on the aux becomes real, and every song Nio picks to fix the last one
// makes it worse. A friend's party (the party room). Writers' room v3 (Nov 17). Voice medium E (warbly tape). The songs
// are original few-bar cues written in tools/skit_audio.py: they are the story, heard in the room, not a score.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const P = (camera: string, actors: A[], props?: string[]): ShotSpec => ({ set: 'partyLive', camera, frames: 1, actors, props });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const G = ['maya', 'sami', 'imane'];
// the guests where they are in each song: m = mark prefix, a = action, x = extra
const guests = (m: string, face: A['face'], x: Partial<A> = {}, action = 'stand'): A[] => G.map((who, i) => ({ who, at: `${m}${i + 1}`, action, face, ...x }));
const theo = (m: string, face: A['face'], x: Partial<A> = {}, action = 'stand'): A => ({ who: 'theo', at: `${m}4`, action, face, ...x });
const nio = (face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at: 'nioD', action: 'stand', face, facing: 'g2', ...x });
const nioW = (face: A['face'], x: Partial<A> = {}): A => ({ ...nio(face, x), back: true }); // in the wide, his back to us: his face is in the next shot
const HAT = ['partyhat'];
const shots: Shot[] = [
  // a flat party; Theo calls it; Nio wants to be the one who saves it
  { n: 1, frames: 44, spec: P('auxWide', [...guests('g', 'deadInside', { hold: 'cup' }), theo('g', 'deadInside', { facing: 'nioD' }), nioW('smug')]), say: [L('ax_07', 'theo', 4)] },
  { n: 2, frames: 36, spec: P('auxNio', [nio('smug', { hold: 'phone' })]), say: [L('ax_01', 'nio', 2)], sfx: [['oh_tap', 26, 0.8]] },
  // a slow piano song, to set a mood: it rains, indoors; they sit down on the wet floor
  { n: 3, frames: 72, spec: P('auxWide', [...guests('g', 'crushed', {}, 'crouch'), theo('g', 'crushed', {}, 'crouch'), nioW('shock', { hold: 'phone' })]), rain: true, sfx: [['sk_piano', 0, 0.8], ['sk_rain', 0, 0.5]] },
  // skip: something with energy, to get them up. Now they are on the ceiling. So is the couch.
  { n: 4, frames: 60, spec: P('auxUp', [...guests('f', 'hyped', { hold: 'arms-up' }), theo('f', 'hyped', { hold: 'arms-up' })], ['chaiseUp']), sfx: [['oh_tap', 0, 0.8], ['sk_hype', 0, 0.8]] },
  { n: 5, frames: 50, spec: P('auxNio', [nio('uneasy', { hold: 'phone' })]), say: [L('ax_03', 'nio', 4)], sfx: [['sk_hype', 0, 0.4]] },
  // the gentlest song he has is a kids' birthday song: they float down, in party hats; a cake nobody brought
  { n: 6, frames: 64, spec: P('auxWide', [...guests('g', 'laughing', { wear: HAT }), theo('g', 'hyped', { wear: HAT }), nioW('deadInside', { hold: 'phone' })], ['cake']), sfx: [['oh_tap', 0, 0.8], ['sk_birthday', 0, 0.8]] },
  { n: 7, frames: 56, spec: P('auxNio', [nio('uneasy', { hold: 'phone' })], ['cake']), say: [L('ax_04', 'nio', 4)], sfx: [['sk_birthday', 0, 0.35]] },
  // lift music: everyone in a silent line facing the door, waiting for their floor
  { n: 8, frames: 84, spec: P('queue', [...guests('q', 'deadpan', { wear: HAT }), theo('q', 'deadpan', { wear: HAT })]), sfx: [['oh_tap', 0, 0.8], ['sk_muzak', 0, 0.8], ['sk_ding', 66, 0.8]] },
  // so he pulls the cable. Silence. Everyone is themselves again, soaked, in party hats, by the door.
  { n: 9, frames: 26, spec: P('auxNio', [nio('shock', { hold: 'phone' })]), sfx: [['sk_unplug', 4, 1]] },
  { n: 10, frames: 54, spec: P('queue', [...guests('q', 'shock', { wear: HAT, facing: 'nioD' }), theo('q', 'real', { wear: HAT, facing: 'nioD' })]), say: [L('ax_08', 'theo', 14)] },
  { n: 11, frames: 56, spec: P('auxNio', [nio([[0, 'deadpan'], [16, 'smug']], { act: { g: [[14, 'chest']] } })]), say: [L('ax_09', 'nio', 28)] },
];
export const AUX: SkitDef = { id: 'aux', shots, beds: [['sk_bored', 0.25]] };
