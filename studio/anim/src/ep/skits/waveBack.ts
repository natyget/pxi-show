// WAVE BACK v8 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v8/scripts.md). Model: The Money, a stand held
// at rising cost until one fact beats it. Nio waves back at a stranger by mistake; rather than be the guy who waved at
// nobody he plays along, the stranger invents their history for him and invites him to dinner, and the girl he actually
// waved at walks in. Every cause on screen; eyes on each other; no look to camera. Voice medium A (walkie).
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const Q = (camera: string, actors: A[], push = 0.15): ShotSpec => ({ set: 'quad', camera, frames: 1, actors, push });
const D = (camera: string, actors: A[], push = 0.12): ShotSpec => ({ set: 'dining', camera, frames: 1, actors, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const LAN = ['lanyard'];
const marcus = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'marcus', at, action: 'stand', face, wear: LAN, ...x });
const sis = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'sis', at, action: 'stand', face, ...x });
const nio = (at: string, face: A['face'], x: Partial<A> = {}): A => ({ who: 'nio', at, action: 'stand', face, ...x });
const sitD = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'sit', face, ...x });
const GRASS: [string, number, number?][] = [['sk_quad', 0, 0.6]];
const ROOM: [string, number, number?][] = [['sk_dinner', 0, 0.7]];
const shots: Shot[] = [
  // 1. a guy across the grass waves big, straight up the lawn
  { n: 1, frames: 36, spec: Q('marcus', [marcus('marcus', 'hyped', { hold: 'wave' })], 0.25), sfx: GRASS },
  // Nio waves back, bigger; in the same frame the girl in yellow behind him is waving too (the wave's real target)
  { n: 2, frames: 44, spec: Q('nio', [nio('nio', 'hyped', { hold: 'wave', facing: 'marcus' }), sis('sis', 'charm', { hold: 'wave', facing: 'marcus' })], 0.2), sfx: GRASS },
  // 2. she jogs off, still waving; his hand is still up. Mortified, then he decides.
  { n: 3, frames: 56, spec: Q('nio', [nio('nio', [[0, 'shock'], [22, 'sheepish'], [40, 'real']], { hold: 'wave', facing: 'marcus' }), { who: 'sis', at: 'sis', to: 'sisFar', action: 'jog', face: 'charm' }]), sfx: GRASS },
  // Marcus is still looking at him
  { n: 4, frames: 30, spec: Q('marcus', [marcus('marcus', 'neutral', { facing: 'nio' })]), sfx: GRASS },
  // so he walks over like he meant it
  { n: 5, frames: 48, spec: Q('walk', [{ who: 'nio', at: 'nioMid', to: 'nioM', action: 'walk', face: 'charm' }]), sfx: GRASS },
  { n: 6, frames: 30, spec: Q('nioM', [nio('nioM', 'charm', { facing: 'marcus' })]), say: [L('wb8_01', 'nio', 2)], sfx: GRASS },
  { n: 7, frames: 30, spec: Q('marcus', [marcus('marcus', [[0, 'neutral'], [14, 'suspicious']], { facing: 'nioM' })]), say: [L('wb8_02', 'marcus', 2)], sfx: GRASS },
  { n: 8, frames: 30, spec: Q('nioM', [nio('nioM', [[0, 'uneasy'], [12, 'charm']], { facing: 'marcus' })]), say: [L('wb8_03', 'nio', 8)], sfx: GRASS },
  { n: 9, frames: 30, spec: Q('marcus', [marcus('marcus', 'hyped', { facing: 'nioM', act: { g: [[2, 'point']] } })]), say: [L('wb8_04', 'marcus', 2)], sfx: GRASS },
  // 3. so happy he holds out his phone: his mum's event
  { n: 10, frames: 30, spec: Q('marcus', [marcus('marcus', 'charm', { facing: 'nioM', hold: 'show-phone' })]), say: [L('wb8_05', 'marcus', 2)], sfx: GRASS },
  { n: 11, frames: 30, spec: Q('nioM', [nio('nioM', 'uneasy', { facing: 'marcus' })]), say: [L('wb8_06', 'nio', 2)], sfx: GRASS },
  { n: 12, frames: 30, spec: Q('marcus', [marcus('marcus', 'real', { facing: 'nioM', hold: 'show-phone' })]), say: [L('wb8_07', 'marcus', 2)], sfx: GRASS },
  { n: 13, frames: 30, spec: Q('nioM', [nio('nioM', [[0, 'deadpan'], [14, 'real']], { facing: 'marcus' })]), say: [L('wb8_08', 'nio', 12)], sfx: GRASS },
  // his own phone buzzes: a PXI push from Marcus. He taps it; the invite opens on the album card; he taps RSVP.
  { n: 14, frames: 40, img: 'pxi-ui/screens/push-invite.png', zoom: [1.15, 50], sfx: [['sk_ding', 2, 0.7], ['oh_tap', 34, 0.9]] },
  { n: 15, frames: 40, img: 'pxi-ui/screens/invite-card.png', sfx: [['oh_tap', 30, 0.9]] },
  { n: 16, frames: 30, shake: [2], img: 'pxi-ui/screens/invite-going.png', sfx: [['sk_ding', 2, 0.6]] },
  // 4. Sunday dinner. He's relaxed now: he's good at this.
  { n: 17, frames: 30, spec: D('wide', [sitD('mum', 'mum', 'hyped', { facing: 'nio' }), sitD('nio', 'nio', 'charm'), sitD('marcus', 'marcus', 'charm')], 0.3), say: [L('wb8_09', 'mum', 4)], sfx: ROOM },
  { n: 18, frames: 30, spec: D('nio', [sitD('nio', 'nio', 'charm', { gaze: [0.5, 0.1], act: { g: [[6, 'offer']] } })]), say: [L('wb8_10', 'nio', 2)], sfx: ROOM },
  // Marcus, moved, hand on his chest
  { n: 19, frames: 36, spec: D('marcus', [sitD('marcus', 'marcus', 'real', { facing: 'nio', act: { g: [[4, 'chest']] } })]), sfx: ROOM },
  // 5. the girl in yellow walks in. She's his sister. She stops.
  { n: 20, frames: 30, spec: D('door', [sis('door', [[0, 'neutral'], [8, 'suspicious']], { facing: 'nio' })], 0.25), say: [L('wb8_11', 'sis', 8)], sfx: ROOM },
  // everyone looks at Nio
  { n: 21, frames: 26, spec: D('wide', [sitD('mum', 'mum', 'neutral', { facing: 'nio' }), sitD('nio', 'nio', 'shock'), sitD('marcus', 'marcus', 'neutral'), sis('door', 'suspicious', { facing: 'nio' })]), sfx: ROOM },
  { n: 22, frames: 30, spec: D('nio', [sitD('nio', 'nio', [[0, 'shock'], [10, 'charm']], { gaze: [0.5, 0.1] })]), say: [L('wb8_12', 'nio', 10)], sfx: ROOM },
  { n: 23, frames: 30, spec: D('mum', [sitD('mum', 'mum', 'laughing', { facing: 'nio' })]), say: [L('wb8_13', 'mum', 2)], sfx: ROOM },
  // 6. button: she sits down slowly, eyes on Nio the whole time. Only she knows.
  { n: 24, frames: 54, spec: D('end', [sitD('mum', 'mum', 'charm', { facing: 'marcus' }), sitD('nio', 'nio', 'deadpan'), sitD('marcus', 'marcus', 'charm', { back: true }), sitD('sis', 'sisSeat', 'suspicious', { facing: 'nio' })], 0.2), sfx: ROOM },
];
export const WAVE_BACK: SkitDef = { id: 'wave-back', shots, beds: [] };
