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
  // the cause in the picture (stranger, Nov 18): what he puts on, by name, before the room becomes it
  { n: 3, frames: 48, img: 'pxi-ui/screens/song-rain.png', zoom: [1.35, 30], sfx: [['oh_tap', 6, 0.8], ['sk_piano', 8, 0.8]] },
  // a slow piano song, to set a mood: it rains, indoors; they sit down on the wet floor
  { n: 4, frames: 58, shake: [4], spec: { ...P('auxWide', [...guests('g', 'crushed', {}, 'crouch').map((a) => (a.who === 'imane' ? { ...a, face: 'hyped' as A['face'], hold: 'photo' } : a)), theo('g', 'crushed', {}, 'crouch'), nioW('shock', { hold: 'phone' })]), push: 0.4 }, rain: true, sfx: [['sk_rain', 0, 0.5]] },
  // skip
  { n: 5, frames: 48, img: 'pxi-ui/screens/song-roof.png', zoom: [1.35, 30], sfx: [['oh_tap', 6, 0.8], ['sk_hype', 8, 0.8]] },
  // skip: something with energy, to get them up. Now they are on the ceiling. So is the couch.
  { n: 6, frames: 50, shake: [4], spec: { ...P('auxUp', [...guests('f', 'hyped', { hold: 'arms-up' }).map((a) => (a.who === 'sami' ? { ...a, hold: 'photo' } : a)), theo('f', 'hyped', { hold: 'arms-up' })], ['chaiseUp']), push: 0.4 }, sfx: [] },
  { n: 7, frames: 50, spec: { ...P('auxNio', [nio('uneasy', { hold: 'phone' })]), push: 0.3 }, say: [L('ax_03', 'nio', 4)], sfx: [['sk_hype', 0, 0.4]] },
  // skip
  { n: 8, frames: 40, img: 'pxi-ui/screens/song-bday.png', zoom: [1.35, 30], sfx: [['oh_tap', 6, 0.8], ['sk_birthday', 8, 0.8]] },
  // the gentlest song he has is a kids' birthday song: they float down, in party hats; a cake nobody brought
  { n: 9, frames: 52, shake: [4], spec: { ...P('auxWide', [...guests('g', 'laughing', { wear: HAT }), theo('g', 'hyped', { wear: HAT }), nioW('deadInside', { hold: 'phone' })], ['cake']), push: 0.5 }, sfx: [] },
  { n: 10, frames: 56, spec: { ...P('auxNio', [nio('uneasy', { hold: 'phone' })], ['cake']), push: 0.35 }, say: [L('ax_04', 'nio', 4)], sfx: [['sk_birthday', 0, 0.35]] },
  // skip
  { n: 11, frames: 40, img: 'pxi-ui/screens/song-lift.png', zoom: [1.35, 30], sfx: [['oh_tap', 6, 0.8], ['sk_muzak', 8, 0.8]] },
  // lift music: everyone in a silent line facing the door, waiting for their floor
  { n: 12, frames: 70, shake: [4], spec: { ...P('queueN', [...guests('q', 'deadpan', { wear: HAT, facing: 'nioD', gaze: [0.6, 0.1] }), theo('q', 'deadpan', { wear: HAT, facing: 'nioD', gaze: [0.6, 0.1] })]), push: 0.3 }, sfx: [['sk_ding', 58, 0.8]] },
  // so he pulls the cable. Silence. Everyone is themselves again, soaked, in party hats, by the door. Nio braces.
  { n: 13, frames: 26, shake: [4], spec: P('auxNio', [nio('shock', { hold: 'phone' })]), sfx: [['sk_unplug', 4, 1]] },
  { n: 14, frames: 40, spec: { ...P('queueN', [...guests('q', 'shock', { wear: HAT, facing: 'nioD' }), theo('q', 'deadpan', { wear: HAT, facing: 'nioD', hold: 'phone' })]), push: 0.12 } },
  { n: 15, frames: 30, spec: { ...P('auxNio', [nio('uneasy', { act: { g: [[2, 'neck']] } })]), push: 0.3 } },
  // Theo scrolls the PXI album of the night: the rain, the ceiling, the cake, the queue
  { n: 16, frames: 60, img: 'pxi-ui/screens/aux-album.png', sfx: [['oh_tap', 20, 0.6], ['oh_tap', 40, 0.6]] },
  { n: 17, frames: 54, spec: { ...P('queueN', [...guests('q', 'neutral', { wear: HAT, facing: 'nioD' }), theo('q', 'real', { wear: HAT, facing: 'nioD', hold: 'phone' })]), push: 0.15 }, say: [L('ax_08', 'theo', 6)] },
  // he straightens his jacket
  { n: 18, frames: 50, spec: { ...P('auxNio', [nio([[0, 'deadpan'], [12, 'smug']], { act: { g: [[10, 'chest']] } })]), push: 0.3 }, say: [L('ax_09', 'nio', 22)] },
];
export const AUX: SkitDef = { id: 'aux', shots, beds: [['sk_bored', 0.25]] };
