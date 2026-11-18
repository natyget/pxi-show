// GROUP PHOTO v8 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v8/scripts.md). Model: The Remote, everyone
// wants the same thing at once, each for themselves, against a clock. Nio wants one perfect group photo before the
// sunset goes; every fix is for someone's own face, so one by one they leave the frame, and the photo of nobody does
// better than any photo with them in it. Voice medium F (clean). Eyes on each other; the phone's view has corner marks.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const R = (camera: string, actors: A[], chair = false, push = 0.2): ShotSpec => ({ set: 'roof', camera, frames: 1, actors, campus: { chair }, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const at = (who: string, mark: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at: mark, action: 'stand', face, ...x });
const shots: Shot[] = [
  // 1. the roof, sun almost down; Nio, phone up on the PXI camera, rushing them in
  { n: 1, frames: 30, spec: R('whole', [at('nio', 'nio', 'hyped', { hold: 'photo', back: true }), at('theo', 'theo', 'neutral'), at('sami', 'sami', 'neutral'), at('maya', 'maya', 'charm')], false, 0.6) },
  { n: 2, frames: 30, spec: R('nioA', [at('nio', 'nio', 'hyped', { hold: 'photo', facing: 'sami' })]), say: [L('gp8_01', 'nio', 2)] },
  // 2. Theo, for his own face
  { n: 3, frames: 30, spec: R('theo', [at('theo', 'theo', 'neutral', { facing: 'nio', act: { g: [[2, 'point']] } })]), say: [L('gp8_02', 'theo', 2)] },
  { n: 4, frames: 26, spec: R('nioA', [at('nio', 'nio', 'uneasy', { hold: 'photo', facing: 'theo' })]), say: [L('gp8_03', 'nio', 2)] },
  { n: 5, frames: 24, spec: R('theo', [at('theo', 'theo', 'deadpan', { facing: 'nio' })]), say: [L('gp8_04', 'theo', 2)] },
  // so Nio walks round: now the sun is right in their faces
  { n: 6, frames: 30, spec: R('nio', [at('nio', 'nio2', 'charm', { hold: 'photo', facing: 'sami' })]) },
  { n: 7, frames: 30, spec: R('three', [at('theo', 'theo', 'suspicious', { facing: 'nio2' }), at('sami', 'sami', 'suspicious', { facing: 'nio2' }), at('maya', 'maya', 'suspicious', { facing: 'nio2' })]) },
  // 3. Sami
  { n: 8, frames: 30, spec: R('sami', [at('sami', 'sami', 'suspicious', { facing: 'nio2' })]), say: [L('gp8_05', 'sami', 2)] },
  { n: 9, frames: 30, spec: R('nio', [at('nio', 'nio2', 'hyped', { hold: 'photo', facing: 'sami' })]), say: [L('gp8_06', 'nio', 2)] },
  { n: 10, frames: 30, spec: R('sami', [at('sami', 'sami', 'deadpan', { facing: 'nio2', act: { g: [[4, 'palms']] } })]), say: [L('gp8_07', 'sami', 2)] },
  { n: 11, frames: 40, finder: true, spec: R('pov', [at('theo', 'theo', 'neutral', { facing: 'nio2', gaze: [0, 0.5] }), { who: 'sami', at: 'sami', to: 'samiOut', action: 'walk', face: 'neutral' }, at('maya', 'maya', 'neutral', { facing: 'nio2', gaze: [0, 0.5] })], false, 0.1) },
  // 4. Maya: go up. So he climbs onto a chair.
  { n: 12, frames: 24, spec: R('maya', [at('maya', 'maya', 'charm', { facing: 'nio2', act: { g: [[2, 'point']] } })]), say: [L('gp8_08', 'maya', 2)] },
  { n: 13, frames: 30, spec: R('chair', [at('nio', 'chair', 'real', { hold: 'photo' })], true, 0.3), sfx: [['oh_creak', 2, 0.5]] },
  { n: 14, frames: 30, spec: R('theoUp', [at('theo', 'theo', 'suspicious', { facing: 'nio2', gaze: [0, 0.6] })], true), say: [L('gp8_09', 'theo', 2)] },
  { n: 15, frames: 30, spec: R('chair', [at('nio', 'chair', 'uneasy', { hold: 'photo' })], true, 0.15), say: [L('gp8_10', 'nio', 2)] },
  { n: 16, frames: 30, spec: R('theoUp', [at('theo', 'theo', 'sheepish', { facing: 'nio2', gaze: [0, 0.6] })], true), say: [L('gp8_11', 'theo', 2)] },
  { n: 17, frames: 30, spec: R('chair', [at('nio', 'chair', 'deadpan', { hold: 'photo' })], true, 0.1), say: [L('gp8_12', 'nio', 2)] },
  // Theo, hurt, steps out
  { n: 18, frames: 36, finder: true, spec: R('pov', [{ who: 'theo', at: 'theo', to: 'theoOut', action: 'walk', face: 'crushed', back: true }, at('maya', 'maya', 'neutral', { facing: 'nio2', gaze: [0, 0.5] })], true, 0.1) },
  // 5. Maya alone in the frame: looks left, looks right, shrugs, walks out. No line.
  { n: 19, frames: 20, finder: true, spec: R('povM', [at('maya', 'maya', 'neutral', { facing: 'nio2', gaze: [-0.9, 0] })], true, 0.05) },
  { n: 20, frames: 20, finder: true, spec: R('povM', [at('maya', 'maya', 'neutral', { facing: 'nio2', gaze: [0.9, 0] })], true, 0.05) },
  { n: 21, frames: 26, finder: true, spec: R('povM', [at('maya', 'maya', 'deadpan', { facing: 'nio2', gaze: [0, 0.5], act: { g: [[2, 'shrug']] } })], true, 0.05) },
  { n: 22, frames: 30, finder: true, spec: R('pov', [{ who: 'maya', at: 'maya', to: 'mayaOut', action: 'walk', face: 'neutral', back: true }], true, 0.05) },
  { n: 23, frames: 30, spec: R('chair', [at('nio', 'chair', 'shock', { hold: 'photo' })], true, 0.2), say: [L('gp8_13', 'nio', 2)] },
  // the sun touches the edge; he takes it anyway. Flash.
  { n: 24, frames: 34, finder: true, shake: [14], spec: R('sunset', [], true, 0.15), flash: 14, sfx: [['shutter', 14, 0.9]] },
  // 6. the PXI album: hearts start popping on it, strangers comment
  { n: 25, frames: 30, img: 'pxi-ui/screens/roof-thread-a.png', sfx: [['sk_ding', 6, 0.5]] },
  { n: 26, frames: 30, img: 'pxi-ui/screens/roof-thread-b.png', sfx: [['sk_ding', 2, 0.5], ['sk_ding', 10, 0.4], ['sk_ding', 18, 0.4]] },
  { n: 27, frames: 30, spec: R('nio', [at('nio', 'nio2', 'hyped', { hold: 'phone', facing: 'maya', act: { g: [[4, 'offer']] } })]), say: [L('gp8_14', 'nio', 2)] },
  { n: 28, frames: 30, spec: R('maya', [at('maya', 'maya', 'charm', { facing: 'nio2', hold: 'show-phone' })]), say: [L('gp8_15', 'maya', 2)] },
  // 7. he looks at the photo, at his friends, at the photo. Pockets his phone. Pride wins.
  { n: 29, frames: 20, spec: R('nio', [at('nio', 'nio2', 'neutral', { hold: 'phone', facing: 'maya', gaze: [0, -0.6] })], false, 0.08) },
  { n: 30, frames: 16, spec: R('nio', [at('nio', 'nio2', 'neutral', { hold: 'phone', facing: 'maya' })], false, 0.08) },
  { n: 31, frames: 16, spec: R('nio', [at('nio', 'nio2', 'neutral', { hold: 'phone', facing: 'maya', gaze: [0, -0.6] })], false, 0.08) },
  { n: 32, frames: 30, spec: R('nio', [at('nio', 'nio2', [[0, 'real'], [12, 'charm']], { facing: 'maya' })], false, 0.1), say: [L('gp8_16', 'nio', 6)] },
];
export const GROUP_PHOTO: SkitDef = { id: 'group-photo', shots, beds: [['sk_wind', 0.3]] };
