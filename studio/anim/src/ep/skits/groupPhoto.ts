// GROUP PHOTO. The game: Nio sincerely fixes each person's note, and every fix pushes the next person out of the photo.
// A roof at sunset. Final lines from the writers' room (Nov 17). Voice medium F (clean, no effect). The album is PXI's own
// gallery screen (tools/pxi/screens.py roof). Nobody in the background.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
// a slow push on every shot, so no held shot reads as a freeze
const R = (camera: string, actors: A[], chair = false, push = 0.3): ShotSpec => ({ set: 'roof', camera, frames: 1, actors, campus: { chair }, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const at = (who: string, mark: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at: mark, action: 'stand', face, ...x });
const shots: Shot[] = [
  // the line, the sun behind them; Nio with his phone up
  { n: 1, frames: 30, spec: R('whole', [at('nio', 'nio', 'hyped', { hold: 'photo', back: true }), at('theo', 'theo', 'smug'), at('sami', 'sami', 'neutral'), at('maya', 'maya', 'hyped')], false, 0.7), },
  { n: 2, frames: 40, spec: R('nioA', [at('nio', 'nio', 'hyped', { hold: 'photo', facing: 'sami' })]), say: [L('gp_01', 'nio', 2)] },
  { n: 3, frames: 40, spec: R('theo', [at('theo', 'theo', 'smug', { facing: 'nio', act: { g: [[0, 'dismiss']] } })]), say: [L('gp_02', 'theo', 2)] },
  // so Nio goes round to Theo's left, phone up: now they face into the sun (stranger, Nov 18: show the photographer
  // in the middle, so every line has someone it is said to)
  { n: 4, frames: 30, spec: R('nio', [at('nio', 'nio2', 'charm', { hold: 'photo', facing: 'sami' })]) },
  { n: 5, frames: 34, spec: R('three', [at('theo', 'theo', 'smug', { facing: 'nio2' }), at('sami', 'sami', 'suspicious', { facing: 'nio2', gaze: [0, 0.4] }), at('maya', 'maya', 'uneasy', { facing: 'nio2' })]) },
  { n: 6, frames: 50, spec: R('sami', [at('sami', 'sami', 'suspicious', { facing: 'nio2' })]), say: [L('gp_03', 'sami', 4)] },
  { n: 7, frames: 46, spec: R('three', [at('theo', 'theo', 'deadInside', { facing: 'nio2' }), { who: 'sami', at: 'sami', to: 'samiOut', action: 'walk', face: 'neutral' }, at('maya', 'maya', 'uneasy', { facing: 'nio2' })]) },
  { n: 8, frames: 40, spec: R('maya', [at('maya', 'maya', 'hyped', { facing: 'nio2', act: { g: [[0, 'point']] } })]), say: [L('gp_04', 'maya', 2)] },
  // so he climbs on a chair
  { n: 9, frames: 34, spec: R('chair', [at('nio', 'chair', 'deadpan', { hold: 'photo' })], true, 0.35), sfx: [['oh_creak', 2, 0.5]] },
  { n: 10, frames: 40, spec: R('theoUp', [at('theo', 'theo', 'suspicious', { facing: 'nio2', gaze: [0, 0.6] })], true), say: [L('gp_05', 'theo', 4)] },
  { n: 11, frames: 32, spec: R('pov', [{ who: 'theo', at: 'theo', to: 'theoOut', action: 'walk', face: 'deadpan', back: true }, at('maya', 'maya', 'neutral', { facing: 'nio2', gaze: [0, 0.5] })], true) },
  { n: 12, frames: 30, spec: R('chair', [at('nio', 'chair', 'uneasy', { hold: 'photo' })], true, 0.25) },
  // Maya, the last one in the picture, says it to him, and goes
  { n: 13, frames: 84, spec: R('maya', [at('maya', 'maya', 'real', { facing: 'nio2', gaze: [0, 0.5] })], true, 0.3), say: [L('gp_06', 'maya', 4)] },
  { n: 14, frames: 30, spec: R('pov', [{ who: 'maya', at: 'maya', to: 'mayaOut', action: 'walk', face: 'neutral', back: true }], true) },
  // alone on the chair, he turns round to the sunset. Flash.
  { n: 15, frames: 28, spec: R('chair', [at('nio', 'chair', 'deadpan', { hold: 'photo' })], true, 0.2) },
  { n: 16, frames: 34, shake: [12], spec: R('sunset', [], true, 0.2), flash: 12, sfx: [['shutter', 12, 0.9]] },
  { n: 17, frames: 52, img: 'pxi-ui/screens/roof-album.png' },
  // later: all four crowd round Theo's phone, scrolling the album
  // Theo, who says the last line, holds the phone front and centre (own check, Nov 18: Nio in front hid the speaker)
  { n: 18, frames: 50, spec: R('phone', [at('theo', 'nio2', 'hyped', { facing: 'camera', gaze: [0, -0.4], hold: 'phone' }), at('nio', 'theoP', 'deadpan', { gaze: [-0.5, -0.4] }), at('maya', 'mayaP', 'charm', { gaze: [0.5, -0.4] }), at('sami', 'samiB', 'neutral', { gaze: [0.3, -0.4] })]), say: [L('gp_08', 'theo', 6)] },
  { n: 19, frames: 40, spec: R('phone', [at('theo', 'nio2', 'hyped', { facing: 'camera', gaze: [0, -0.4], hold: 'phone' }), at('nio', 'theoP', 'deadpan', { gaze: [-0.9, 0.1] }), at('maya', 'mayaP', 'charm', { gaze: [0.5, -0.4] }), at('sami', 'samiB', 'neutral', { gaze: [0.3, -0.4] })], false, 0.25) },
];
export const GROUP_PHOTO: SkitDef = { id: 'group-photo', shots, beds: [['sk_wind', 0.3]] };
