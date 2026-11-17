// WAVE BACK. The game: Nio waved at a stranger who wasn't waving at him, and every time he gets a way out he refuses it,
// and it costs him more. The quad, then Mum's dining room on Sunday. Writers' room v3 (Nov 17): the girl in yellow is
// behind Nio from the first frame. Voice medium A (walkie). Marcus and Mum are new voice designs.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const Q = (camera: string, actors: A[]): ShotSpec => ({ set: 'quad', camera, frames: 1, actors });
const D = (camera: string, actors: A[]): ShotSpec => ({ set: 'dining', camera, frames: 1, actors });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const LAN = ['lanyard'];
const marcus = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'marcus', at, action: 'stand', face, wear: LAN, ...x });
const sis = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'sis', at, action: 'stand', face, ...x });
const nio = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at, action: 'stand', face, ...x });
const GRASS: [string, number, number?][] = [['sk_quad', 0, 0.6]];
const ROOM: [string, number, number?][] = [['sk_dinner', 0, 0.7]];
const shots: Shot[] = [
  // the quad. Nio, alone, looking good. A guy at the far end waves big. (The girl in yellow is behind Nio.)
  { n: 1, frames: 50, spec: Q('wide', [marcus('marcus', 'hyped', { hold: 'wave', back: true }), nio('nio', [[0, 'neutral'], [16, 'charm']], { facing: 'marcus' }), sis('sis', 'charm', { facing: 'marcus' })]), sfx: GRASS },
  // Nio waves back, bigger
  { n: 2, frames: 40, spec: Q('nioClose', [nio('nio', 'hyped', { hold: 'wave' })]), sfx: GRASS },
  // but the girl in yellow behind him is waving too. It was for her.
  { n: 3, frames: 50, spec: Q('nio', [nio('nio', [[0, 'hyped'], [20, 'shock']], { hold: 'wave' }), sis('sis', 'charm', { hold: 'wave', facing: 'marcus' })]), sfx: GRASS },
  // she walks off. He cannot be the guy who waved at nobody.
  { n: 4, frames: 56, spec: Q('nio', [nio('nio', [[0, 'sheepish'], [24, 'smug']]), { who: 'sis', at: 'sis', to: 'sisOff', action: 'walk', face: 'neutral' }]), sfx: GRASS },
  // so he walks straight over, as if he meant it
  { n: 5, frames: 64, spec: Q('walk', [{ who: 'nio', at: 'nioMid', to: 'nioM', action: 'walk', face: 'smug' }]), sfx: GRASS },
  { n: 6, frames: 30, spec: Q('marcus', [marcus('marcus', 'uneasy')]), say: [L('wb_01', 'marcus', 2)], sfx: GRASS },
  // he reads the lanyard
  { n: 7, frames: 30, spec: Q('nioM', [nio('nioM', [[0, 'suspicious'], [12, 'charm']], { gaze: [0, -0.5], facing: 'marcus' })]), say: [L('wb_02', 'nio', 4)], sfx: GRASS },
  // Marcus offers him the exit
  { n: 8, frames: 30, spec: Q('marcus', [marcus('marcus', 'sheepish')]), say: [L('wb_03', 'marcus', 2)], sfx: GRASS },
  { n: 9, frames: 30, spec: Q('nioM', [nio('nioM', 'charm', { facing: 'marcus' })]), say: [L('wb_04', 'nio', 2)], sfx: GRASS },
  { n: 10, frames: 30, spec: Q('marcus', [marcus('marcus', 'deadInside', { hold: 'phone' })]), say: [L('wb_05', 'marcus', 4)], sfx: GRASS },
  // so Nio taps Join on the family's PXI event before Marcus can lock his phone
  { n: 11, frames: 34, img: 'pxi-ui/screens/dinner.png', sfx: [['oh_tap', 26, 0.9]] },
  { n: 12, frames: 30, img: 'pxi-ui/screens/dinner2.png', sfx: [['sk_ding', 2, 0.6]] },
  // Sunday. One last way out.
  { n: 13, frames: 54, spec: D('wide', [{ who: 'mum', at: 'mum', action: 'sit', face: 'hyped' }, { who: 'nio', at: 'nio', action: 'sit', face: 'charm' }, { who: 'marcus', at: 'marcus', action: 'sit', face: 'deadInside' }]), say: [L('wb_06', 'mum', 10)], sfx: ROOM },
  { n: 14, frames: 30, spec: D('nio', [{ who: 'nio', at: 'nio', action: 'sit', face: 'smug' }]), say: [L('wb_07', 'nio', 4)], sfx: ROOM },
  { n: 15, frames: 34, spec: D('marcus', [{ who: 'marcus', at: 'marcus', action: 'sit', face: 'deadpan' }]), say: [L('wb_08', 'marcus', 4)], sfx: ROOM },
  // button: his sister comes in. It's the girl from the quad. She waves at her brother. Nio waves back. Nobody says anything.
  { n: 16, frames: 40, spec: D('door', [sis('door', 'charm', { hold: 'wave' })]), sfx: ROOM },
  { n: 17, frames: 40, spec: D('nio', [{ who: 'nio', at: 'nio', action: 'sit', face: 'deadpan', hold: 'wave', hand: 0 }]), sfx: ROOM },
  { n: 18, frames: 60, spec: D('wide', [{ who: 'mum', at: 'mum', action: 'sit', face: 'neutral' }, { who: 'nio', at: 'nio', action: 'sit', face: 'deadpan', hold: 'wave', hand: 0 }, { who: 'marcus', at: 'marcus', action: 'sit', face: 'deadInside' }, sis('door', 'uneasy', { facing: 'nio' })]), sfx: ROOM },
];
export const WAVE_BACK: SkitDef = { id: 'wave-back', shots, beds: [] };
