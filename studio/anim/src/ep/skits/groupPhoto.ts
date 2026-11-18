// GROUP PHOTO v9 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v9/scripts.md). Model: The Remote, everyone
// wants the same thing, each for themselves. Nio wants one good photo of his friends before the sun goes; every fix for
// one of them drives someone out, so he shoots the sunset alone, and the building goes crazy for it. Every move has a
// visible reason (Maya wants the gold on her face, so they swap ends; Theo wants to look tall, so Nio ends up on the
// floor). Voice medium F (clean). Eyes on each other; the phone's view has corner marks.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const R = (camera: string, actors: A[], push = 0.2): ShotSpec => ({ set: 'roof', camera, frames: 1, actors, campus: { chair: false }, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const at = (who: string, mark: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at: mark, action: 'stand', face, ...x });
const WIND: [string, number, number?][] = [];
const shots: Shot[] = [
  // 1. the roof at sunset: the three with the sun behind them, Nio's phone up at eye level, in a rush
  { n: 1, frames: 30, spec: R('whole', [at('nio', 'nio', 'hyped', { hold: 'photo', back: true }), at('theo', 'theo', 'neutral'), at('sami', 'sami', 'neutral'), at('maya', 'maya', 'charm')], 0.6) },
  { n: 2, frames: 20, spec: R('nioA', [at('nio', 'nio', 'hyped', { hold: 'photo', facing: 'sami' })]), say: [L('gp9_01', 'nio', 2)] },
  // 2. Maya: we're all shadows, swap, the gold on my face
  { n: 3, frames: 20, spec: R('mayaA', [at('maya', 'maya', [[0, 'suspicious'], [20, 'charm']], { facing: 'nio', act: { g: [[18, 'point']] } })]), say: [L('gp9_02', 'maya', 2)] },
  // so they turn round to face the sun, and Nio runs to the far end, the sun behind him
  { n: 4, frames: 56, spec: (f) => R('whole', [{ who: 'nio', at: 'nio', to: 'nio2', action: 'jog', face: 'neutral', hold: 'phone', back: true },
    at('theo', 'theo', 'neutral', f < 14 ? { facing: 'nio' } : { facing: 'nio2', back: true }), at('sami', 'sami', 'neutral', f < 18 ? { facing: 'nio' } : { facing: 'nio2', back: true }),
    at('maya', 'maya', 'charm', f < 10 ? { facing: 'nio' } : { facing: 'nio2', back: true })], 0.3) },
  // 3. now the sun is right in their eyes; Sami squints hard
  { n: 5, frames: 30, spec: R('three', [at('theo', 'theo', 'suspicious', { facing: 'nio2' }), at('sami', 'sami', 'suspicious', { facing: 'nio2' }), at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.3) },
  { n: 6, frames: 20, spec: R('nio', [at('nio', 'nio2', 'charm', { hold: 'photo', facing: 'sami' })]), say: [L('gp9_03', 'nio', 2)] },
  { n: 7, frames: 20, spec: R('sami', [at('sami', 'sami', [[0, 'suspicious'], [8, 'real']], { facing: 'nio2', act: { g: [[10, 'point']] } })], 0.1), say: [L('gp9_04', 'sami', 8)] },
  { n: 8, frames: 40, finder: true, spec: R('pov', [at('theo', 'theo', 'neutral', { facing: 'nio2' }), { who: 'sami', at: 'sami', to: 'samiOut', action: 'walk', face: 'neutral' }, at('maya', 'maya', 'neutral', { facing: 'nio2' })], 0.1) },
  // 4. Theo: lower, make me look tall. Nio crouches; lower; Nio flat on the roof
  { n: 9, frames: 20, spec: R('theoB', [at('theo', 'theo', 'sheepish', { facing: 'nio2' })]), say: [L('gp9_05', 'theo', 2)] },
  { n: 10, frames: 26, spec: R('nio', [{ who: 'nio', at: 'nio2', action: 'crouch', face: 'neutral', hold: 'photo', facing: 'theo' }], 0.1) },
  { n: 11, frames: 20, spec: R('theoLow', [at('theo', 'theo', 'deadpan', { facing: 'nio2', gaze: [0, -0.5] })]), say: [L('gp9_06', 'theo', 2)] },
  { n: 12, frames: 20, spec: R('floor', [{ who: 'nio', at: 'nioLie', action: 'lie', face: 'real', hold: 'photo' }], 0.15), say: [L('gp9_07', 'nio', 8)], sfx: [['sk_flop', 2, 0.5]] },
  { n: 13, frames: 20, spec: R('theoLow', [at('theo', 'theo', [[0, 'deadpan'], [10, 'neutral']], { facing: 'nio2', gaze: [0, -0.5], act: { g: [[8, 'shrug']] } })]), say: [L('gp9_08', 'theo', 4)] },
  { n: 14, frames: 36, finder: true, spec: R('povLow', [{ who: 'theo', at: 'theo', to: 'theoOut', action: 'walk', face: 'neutral', back: true }, at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.05) },
  // 5. Maya alone, the gold on her face. Nio gets up, still filming.
  { n: 15, frames: 30, spec: R('maya', [at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.1) },
  { n: 16, frames: 20, spec: R('nio', [at('nio', 'nio2', 'real', { hold: 'photo', facing: 'maya' })]), say: [L('gp9_09', 'nio', 2)] },
  // she looks at him for a long second, flat, and walks off
  { n: 17, frames: 40, spec: R('maya', [at('maya', 'maya', [[0, 'charm'], [6, 'deadpan']], { facing: 'nio2' })], 0.12) },
  { n: 18, frames: 30, finder: true, spec: R('pov', [{ who: 'maya', at: 'maya', to: 'mayaOut', action: 'walk', face: 'deadpan', back: true }], 0.05) },
  { n: 19, frames: 20, spec: R('nio', [at('nio', 'nio2', [[0, 'shock'], [10, 'uneasy']], { facing: 'mayaOut', act: { g: [[12, 'palms']] } })]), say: [L('gp9_10', 'nio', 4)] },
  // 6. alone. He shrugs, no attitude, turns round and shoots the sunset. Flash.
  { n: 20, frames: 30, spec: R('nio', [at('nio', 'nio2', [[0, 'neutral'], [10, 'real']], { facing: 'maya', act: { g: [[6, 'shrug']] } })], 0.1) },
  { n: 21, frames: 20, finder: true, shake: [30], spec: R('sunset', [], 0.15), flash: 30, say: [L('gp9_11', 'nio', 4)], sfx: [['shutter', 30, 0.9]] },
  // 7. he posts it in the building's album: neighbours pile in, every kind of reaction; pushes stack on his phone
  { n: 22, frames: 34, img: 'pxi-ui/screens/parkway-a.png', sfx: [['sk_ding', 6, 0.5], ['sk_ding', 18, 0.45]] },
  { n: 23, frames: 34, img: 'pxi-ui/screens/parkway-b.png', sfx: [['sk_ding', 2, 0.5], ['sk_ding', 10, 0.4], ['sk_ding', 18, 0.4], ['sk_ding', 26, 0.4]] },
  { n: 24, frames: 34, img: 'pxi-ui/screens/push-parkway.png', sfx: [['sk_ding', 4, 0.5], ['sk_ding', 14, 0.45], ['sk_ding', 24, 0.45]] },
  // 8. by the roof door his friends are leaving, each on their phone
  { n: 25, frames: 30, spec: R('doorW', [at('nio', 'nioD', 'uneasy', { facing: 'doorM', back: true, hold: 'phone' }), at('maya', 'doorM', 'neutral', { hold: 'phone' }), at('theo', 'doorT', 'neutral', { hold: 'phone' }), at('sami', 'doorS', 'neutral', { hold: 'phone' })], 0.2) },
  { n: 26, frames: 20, spec: R('nioD', [at('nio', 'nioD', 'sheepish', { facing: 'doorM', act: { g: [[6, 'palms']] } })]), say: [L('gp9_12', 'nio', 2)] },
  { n: 27, frames: 20, spec: R('mayaD', [at('maya', 'doorM', 'deadpan', { hold: 'phone' })]), say: [L('gp9_13', 'maya', 4)] },
  { n: 28, frames: 36, spec: R('nioD', [at('nio', 'nioD', [[0, 'neutral'], [18, 'real']], { hold: 'phone', gaze: [0, -0.6] })], 0.1) },
  { n: 29, frames: 20, spec: R('nioD', [at('nio', 'nioD', 'charm', { facing: 'doorM', act: { g: [[4, 'offer']] } })]), say: [L('gp9_14', 'nio', 2)] },
  // Theo, already going through the door, not looking up; Nio's face as the door shuts
  { n: 30, frames: 20, spec: R('nioD', [at('nio', 'nioD', [[0, 'charm'], [26, 'deadpan']], { facing: 'doorM' })], 0.12), say: [L('gp9_15', 'theo', 4)], sfx: [['oh_bang', 38, 0.6]] },
];
export const GROUP_PHOTO: SkitDef = { id: 'group-photo', shots, beds: [['sk_roof', 0.35]] };
void WIND;
