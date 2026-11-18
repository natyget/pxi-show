// AUX v8 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v8/scripts.md). Model: The Money, a figure of speech
// made literally true. Theo's party is dying, Nio takes the aux, every song really happens to the room, each fix makes
// it worse, until he pulls the cable and finds out what the night looks like from the outside. The song is named on his
// screen before each change (the cause in the picture). Voice medium E (warbly tape). Songs: tools/skit_audio.py.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const P = (camera: string, actors: A[], props?: string[]): ShotSpec => ({ set: 'partyLive', camera, frames: 1, actors, props });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const G = ['maya', 'sami', 'imane'];
const guests = (m: string, face: A['face'], x: Partial<A> = {}, action = 'stand'): A[] => G.map((who, i) => ({ who, at: `${m}${i + 1}`, action, face, ...x }));
const theo = (m: string, face: A['face'], x: Partial<A> = {}, action = 'stand'): A => ({ who: 'theo', at: `${m}4`, action, face, ...x });
const nio = (face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at: 'nioD', action: 'stand', face, facing: 'g2', ...x });
const nioW = (face: A['face'], x: Partial<A> = {}): A => ({ ...nio(face, x), back: true });
const HAT = ['partyhat'];
const song = (n: number, img: string, snd: string): Shot => ({ n, frames: 44, img: `pxi-ui/screens/${img}.png`, zoom: [1.35, 30], sfx: [['oh_tap', 6, 0.8], [snd, 8, 0.8]] });
const shots: Shot[] = [
  // 1. six people on their phones, silence. Theo, quietly.
  { n: 1, frames: 30, spec: { ...P('auxWide', [...guests('g', 'deadInside', { hold: 'phone' }), theo('g', 'uneasy', { facing: 'nioD' }), nioW('neutral', { facing: 'g4' })]), push: 0.3 }, say: [L('ax8_01', 'theo', 4)] },
  { n: 2, frames: 26, spec: { ...P('auxNio', [nio('real', { facing: 'g4' })]), push: 0.12 }, say: [L('ax8_02', 'nio', 2)] },
  { n: 3, frames: 24, spec: { ...P('theoG', [theo('g', 'sheepish', { facing: 'nioD', act: { g: [[2, 'offer']] } })]), push: 0.1 }, say: [L('ax8_03', 'theo', 2)] },
  // 2. "Rainy Day Piano", to set a vibe. It rains. Indoors.
  song(4, 'song-rain', 'sk_piano'),
  { n: 5, frames: 40, shake: [2], spec: { ...P('auxWide', [...guests('g', 'shock', { gaze: [0, 0.9] }), theo('g', 'shock', { gaze: [0, 0.9] }), nioW('uneasy', { hold: 'phone' })]), push: 0.3 }, rain: true, sfx: [['sk_rain', 0, 0.5]] },
  { n: 6, frames: 30, spec: { ...P('imaneG', [{ who: 'imane', at: 'g3', action: 'stand', face: 'suspicious', gaze: [0, 0.9] }]), push: 0.1 }, rain: true, say: [L('ax8_04', 'imane', 2)] },
  { n: 7, frames: 30, spec: { ...P('theoG', [theo('g', 'deadpan', { gaze: [0, 0.9] })]), push: 0.1 }, rain: true, say: [L('ax8_05', 'theo', 4)] },
  { n: 8, frames: 24, spec: { ...P('auxNio', [nio('real', { hold: 'phone', gaze: [0, -0.5] })]), push: 0.1 }, rain: true, say: [L('ax8_06', 'nio', 2)] },
  // 3. so he skips to something with energy: "Through The Roof". Everyone floats up to the ceiling, couch too.
  song(9, 'song-roof', 'sk_hype'),
  { n: 10, frames: 40, shake: [2], spec: { ...P('auxUp', [...guests('f', 'neutral', {}).map((a) => (a.who === 'imane' ? { ...a, face: 'hyped' as A['face'], hold: 'photo' as A['hold'] } : a)), theo('f', 'crushed')], ['chaiseUp']), push: 0.3 } },
  { n: 11, frames: 24, spec: { ...P('auxUp', [...guests('f', 'deadpan'), theo('f', 'crushed')], ['chaiseUp']), push: 0.1 }, say: [L('ax8_07', 'sami', 2)] },
  { n: 12, frames: 20, spec: { ...P('auxNio', [nio('real', { hold: 'phone', facing: 'f2', gaze: [0, 0.8] })]), push: 0.1 }, say: [L('ax8_08', 'nio', 2)] },
  { n: 13, frames: 30, spec: { ...P('auxUp', [...guests('f', 'deadpan').map((a) => (a.who === 'imane' ? { ...a, face: 'hyped' as A['face'], hold: 'photo' as A['hold'] } : a)), theo('f', 'crushed')], ['chaiseUp']), push: 0.15 }, say: [L('ax8_09', 'theo', 2)] },
  // 4. "Something soft." The softest thing he has is Happy Birthday: down they drift, in party hats; a cake
  { n: 14, frames: 26, spec: { ...P('auxNio', [nio('uneasy', { hold: 'phone', gaze: [0, -0.6] })]), push: 0.1 }, say: [L('ax8_10', 'nio', 2)] },
  song(15, 'song-bday', 'sk_birthday'),
  { n: 16, frames: 30, spec: { ...P('imaneG', [{ who: 'imane', at: 'g3', action: 'stand', face: 'real', wear: HAT }], ['cake']), push: 0.1 }, say: [L('ax8_11', 'imane', 2)] },
  // nobody answers
  { n: 17, frames: 40, spec: { ...P('auxWide', [...guests('g', 'neutral', { wear: HAT }), theo('g', 'neutral', { wear: HAT }), nioW('deadInside', { hold: 'phone' })], ['cake']), push: 0.35 } },
  // 5. "Calm. Something calm." Lift Music: everyone lines up at the front door, silent, hands folded
  { n: 18, frames: 26, spec: { ...P('auxNio', [nio('uneasy', { hold: 'phone', gaze: [0, -0.6] })]), push: 0.1 }, say: [L('ax8_12', 'nio', 2)] },
  song(19, 'song-lift', 'sk_muzak'),
  { n: 20, frames: 44, spec: { ...P('queueN', [...guests('q', 'deadpan', { wear: HAT, facing: 'nioD', gaze: [0.6, 0.1] }), theo('q', 'deadpan', { wear: HAT, facing: 'nioD', gaze: [0.6, 0.1] })]), push: 0.2 } },
  { n: 21, frames: 30, spec: { ...P('theoQ', [theo('q', 'deadpan', { wear: HAT, facing: 'nioD' })]), push: 0.08 }, say: [L('ax8_13', 'theo', 4)], sfx: [['sk_ding', 24, 0.7]] },
  // 6. so he yanks the cable. Silence. Soaked, party hats, in a line at the door. Dread: he's ruined Theo's night.
  { n: 22, frames: 26, shake: [4], spec: P('auxNio', [nio('shock', { hold: 'phone' })]), sfx: [['sk_unplug', 4, 1]] },
  { n: 23, frames: 36, spec: { ...P('queueN', [...guests('q', 'neutral', { wear: HAT, facing: 'nioD' }), theo('q', 'neutral', { wear: HAT, facing: 'nioD' })]), push: 0.12 } },
  { n: 24, frames: 26, spec: { ...P('auxNio', [nio('crushed')]), push: 0.15 } },
  // 7. Theo slowly takes out his phone: the PXI album of the night
  { n: 25, frames: 54, img: 'pxi-ui/screens/aux-album.png', sfx: [['oh_tap', 20, 0.6], ['sk_ding', 30, 0.4], ['sk_ding', 38, 0.4]] },
  { n: 26, frames: 40, spec: { ...P('theoQ', [theo('q', 'real', { wear: HAT, facing: 'nioD', hold: 'phone' })]), push: 0.1 }, say: [L('ax8_14', 'theo', 4)] },
  { n: 27, frames: 40, spec: { ...P('auxNio', [nio([[0, 'crushed'], [12, 'neutral']])]), push: 0.15 }, say: [L('ax8_15', 'nio', 14)] },
];
export const AUX: SkitDef = { id: 'aux', shots, beds: [['sk_bored', 0.25, 5]] };
