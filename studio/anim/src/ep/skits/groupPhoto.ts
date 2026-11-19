// GROUP PHOTO v12 (writers' room, Nov 19, passed their cold read: /mnt/project-files/nio-soul/skits/v9/scripts.md, skit 2).
// Model: The Remote. Nio wants one good photo of his friends before the light goes; every fix drives one of them out,
// so he shoots the sunset alone (the sky breaks pink and gold right as he gives up) and drops it in the building's
// album, which pulls the whole building up to the roof. His friends come back to a party; he gives them the deadpan
// "friends we made along the way" and they leave. It ends on the album filling with the neighbours' photos.
// Staging: one steady angle on the group; nobody gets a follow shot when they leave, we stay on Nio's face.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const GREY = 0.12; // the sky before it breaks
type RO = { glow?: number | [number, number][]; chairAt?: [number, number, number]; speaker?: boolean; folk?: { fill?: number; dance?: number; headsUp?: number } | null };
const R = (camera: string, actors: A[], push = 0.2, o: RO = {}): ShotSpec => ({ set: 'roof', camera, frames: 1, actors, campus: { chair: false, glow: GREY, ...o } as ShotSpec['campus'], push });
const PARTY: RO = { glow: 1, chairAt: [5.7, 9.7, 0], speaker: true, folk: { fill: 0.24, dance: 0.25, headsUp: 0.4 } };
const K = (camera: string, actors: A[], push = 0.1): ShotSpec => ({ set: 'theoHouse', camera, frames: 1, actors, campus: { theo: { party: null } } as ShotSpec['campus'], push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const at = (who: string, mark: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at: mark, action: 'stand', face, ...x });
const WIND: [string, number, number?][] = [];
const shots: Shot[] = [
  // 1. the roof at sunset, the sun going behind cloud: the three with it behind them, Nio's phone up, in a rush
  { n: 1, frames: 30, spec: R('whole', [at('nio', 'nio', 'hyped', { hold: 'photo', back: true }), at('theo', 'theo', 'neutral'), at('sami', 'sami', 'neutral'), at('maya', 'maya', 'charm')], 0.6) },
  { n: 2, frames: 20, spec: R('nioA', [at('nio', 'nio', 'hyped', { hold: 'photo', facing: 'sami' })]), say: [L('gp9_01', 'nio', 2)] },
  // 2. Maya squints at his screen first (the cause), then: we're all backlit, swap
  { n: 3, frames: 20, spec: R('mayaA', [at('maya', 'maya', [[0, 'suspicious'], [26, 'charm']], { facing: 'nio', gaze: [0, -0.3], act: { g: [[24, 'point']] } })]), say: [L('gp10_02', 'maya', 6)] },
  // so they turn round to face the sun, and Nio runs to the far end
  { n: 4, frames: 56, spec: (f) => R('whole', [{ who: 'nio', at: 'nio', to: 'nio2', action: 'jog', face: 'neutral', hold: 'phone', back: true },
    at('theo', 'theo', 'neutral', f < 14 ? { facing: 'nio' } : { facing: 'nio2', back: true }), at('sami', 'sami', 'neutral', f < 18 ? { facing: 'nio' } : { facing: 'nio2', back: true }),
    at('maya', 'maya', 'charm', f < 10 ? { facing: 'nio' } : { facing: 'nio2', back: true })], 0.3) },
  // 3. now the sun is right in their eyes; Sami has a hand up over his face
  { n: 5, frames: 30, spec: R('three', [at('theo', 'theo', 'suspicious', { facing: 'nio2' }), at('sami', 'sami', 'suspicious', { facing: 'nio2', hold: 'shade' }), at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.3) },
  { n: 6, frames: 20, spec: R('sami', [at('sami', 'sami', 'suspicious', { facing: 'nio2', hold: 'shade' })], 0.1), say: [L('gp12_03', 'sami', 2)] },
  { n: 7, frames: 20, spec: R('nio', [at('nio', 'nio2', [[0, 'neutral'], [6, 'charm']], { hold: 'photo', facing: 'sami' })]), say: [L('gp12_04', 'nio', 2)] },
  // Sami lowers his hand, looks at him, and walks off: a steady angle, he leaves the frame
  { n: 8, frames: 22, spec: R('sami', [at('sami', 'sami', 'deadpan', { facing: 'nio2' })], 0.08) },
  { n: 9, frames: 40, spec: R('three', [at('theo', 'theo', 'neutral', { facing: 'nio2' }), { who: 'sami', at: 'sami', to: 'samiOut', action: 'walk', face: 'deadpan' }, at('maya', 'maya', 'neutral', { facing: 'nio2' })], 0.05) },
  // Nio watches him go with a little pitying smile
  { n: 10, frames: 30, spec: R('nio', [at('nio', 'nio2', [[0, 'neutral'], [8, 'real']], { hold: 'phone', facing: 'samiOut' })], 0.08) },
  // 4. Theo: get it from lower, make me look tall. Nio crouches; lower; Nio flat on his back
  { n: 11, frames: 20, spec: R('theoB', [at('theo', 'theo', 'sheepish', { facing: 'nio2' })]), say: [L('gp12_05', 'theo', 2)] },
  { n: 12, frames: 26, spec: R('nio', [{ who: 'nio', at: 'nio2', action: 'crouch', face: 'neutral', hold: 'photo', facing: 'theo' }], 0.1) },
  { n: 13, frames: 20, spec: R('theoLow', [at('theo', 'theo', 'deadpan', { facing: 'nio2', gaze: [0, -0.5] })]), say: [L('gp9_06', 'theo', 2)] },
  { n: 14, frames: 20, spec: R('floor', [{ who: 'nio', at: 'nioLie', action: 'lie', face: 'real', hold: 'photo' }], 0.15), say: [L('gp9_07', 'nio', 8)], sfx: [['sk_flop', 2, 0.5]] },
  { n: 15, frames: 20, spec: R('theoLow', [at('theo', 'theo', [[0, 'deadpan'], [10, 'neutral']], { facing: 'nio2', gaze: [0, -0.5], act: { g: [[8, 'shrug']] } })]), say: [L('gp9_08', 'theo', 4)] },
  // he walks off up on his tiptoes, out of the frame (Nio's phone, from the floor)
  { n: 16, frames: 32, finder: true, spec: R('povLow', [{ who: 'theo', at: 'theo', to: 'theoOut', action: 'walk', face: 'neutral', back: true, tiptoe: 0.08 }, at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.05) },
  // Nio, still on the floor, shakes his head
  { n: 17, frames: 26, spec: R('floor', [{ who: 'nio', at: 'nioLie', action: 'lie', face: [[0, 'real'], [8, 'deadpan']], hold: 'photo' }], 0.06) },
  // 5. Maya alone in the frame, sun on her face, smiling. Nio up, lining it up, pleased with the framing
  { n: 18, frames: 30, spec: R('maya', [at('maya', 'maya', 'charm', { facing: 'nio2' })], 0.1) },
  { n: 19, frames: 20, spec: R('nio', [at('nio', 'nio2', [[0, 'neutral'], [8, 'real']], { hold: 'phone', facing: 'maya', gaze: [0, -0.7] })]), say: [L('gp12_09', 'nio', 4)] },
  // her smile freezes. "...Clean." She walks off, out of the frame
  { n: 20, frames: 20, spec: R('maya', [at('maya', 'maya', [[0, 'charm'], [8, 'deadpan']], { facing: 'nio2' })], 0.12), say: [L('gp12_10', 'maya', 22)] },
  { n: 21, frames: 34, spec: R('three', [{ who: 'maya', at: 'maya', to: 'mayaOut', action: 'walk', face: 'deadpan', back: true }], 0.04) },
  { n: 22, frames: 20, spec: R('nio', [at('nio', 'nio2', [[0, 'shock'], [10, 'uneasy']], { facing: 'mayaOut', act: { g: [[12, 'palms']] } })]), say: [L('gp10_11', 'nio', 4)] },
  // 6. alone. He scowls at the empty roof, looks down at his feet, and turns round
  { n: 23, frames: 46, spec: (f) => R('nio', [at('nio', 'nio2', [[0, 'suspicious'], [16, 'neutral']], { facing: f < 30 ? 'maya' : 'sunM', gaze: f >= 16 && f < 30 ? [0, -0.8] : [0, 0], back: f >= 30 ? true : undefined })], 0.06) },
  // right then the sun drops out under the cloud and the whole sky goes pink and gold
  { n: 24, frames: 40, spec: R('sky', [], 0.35, { glow: [[0, GREY], [4, GREY], [30, 1]] }), sfx: [['ne_swell', 6, 0.35]] },
  // lighting up his face. A real, quiet "wow"
  { n: 25, frames: 20, spec: R('nioSun', [at('nio', 'nio2', [[0, 'neutral'], [8, 'real']], { facing: 'sunM', hold: 'phone', gaze: [0, 0.3] })], 0.1, { glow: 1 }), say: [L('gp12_13', 'nio', 12)] },
  { n: 26, frames: 40, finder: true, shake: [30], spec: R('sky', [], 0.15, { glow: 1 }), flash: 30, sfx: [['shutter', 30, 0.9]] },
  // still looking at the sky, he thumbs it into the building's album
  { n: 27, frames: 30, spec: R('nioSun', [at('nio', 'nio2', 'real', { facing: 'sunM', hold: 'phone', gaze: [0, 0.35] })], 0.06, { glow: 1 }), sfx: [['sk_ding', 18, 0.3]] },
  { n: 28, frames: 34, img: 'pxi-ui/screens/parkway-a.png' },
  // 7. inside the building: a neighbour waiting on her kettle; her phone lights up with his sunset
  { n: 29, frames: 30, spec: K('maya', [at('guest2', 'maya', [[0, 'neutral'], [14, 'real']], { gaze: [0, -0.7] })]), sfx: [['sk_ding', 6, 0.45]] },
  { n: 30, frames: 30, img: 'pxi-ui/screens/push-parkway.png' },
  // she looks at her grey kitchen window, grabs her mug
  { n: 31, frames: 30, spec: K('maya', [at('guest2', 'maya', [[0, 'neutral'], [18, 'hyped']], { facing: 'signGirl' })]) },
  { n: 32, frames: 22, spec: K('maya', [at('guest2', 'maya', 'hyped', { hold: 'cup' })]) },
  // 8. the roof door bangs open: the neighbour with her mug, two more, a mum with two kids
  { n: 33, frames: 44, spec: R('doorOut', [{ who: 'guest2', at: 'doorIn', to: 'nbA', action: 'walk', face: 'hyped', hold: 'cup' }, { who: 'nb1', at: 'doorIn2', to: 'nbB', action: 'walk', face: 'real' }], 0.1, { glow: 1 }), sfx: [['oh_bang', 1, 0.6], ['sk_chatter', 4, 0.3]] },
  { n: 133, frames: 44, spec: R('doorOut', [{ who: 'nbMum', at: 'doorIn', to: 'mumIn', action: 'walk', face: 'real' }, { who: 'kid1', at: 'doorIn3', to: 'kidA', action: 'walk', face: 'hyped' }, { who: 'kid2', at: 'doorIn2', to: 'kidB', action: 'walk', face: 'hyped' }], 0.1, { glow: 1 }) },
  { n: 34, frames: 20, spec: R('doorOut', [at('guest2', 'nbA', 'hyped', { facing: 'sunM', hold: 'cup', act: { g: [[14, 'offer']] } })], 0.25, { glow: 1 }), say: [L('gp12_14', 'guest2', 2)] },
  // more keep coming: Mrs. Okafor from 3B with her folding chair; someone with a speaker
  { n: 35, frames: 44, spec: R('doorOut', [{ who: 'okafor', at: 'doorIn', to: 'okIn', action: 'walk', face: 'real', hold: 'foldChair' }, { who: 'nb2', at: 'doorIn2', to: 'nbB', action: 'walk', face: 'hyped' }], 0.1, { glow: 1 }), sfx: [['sk_walla', 0, 0.3]] },
  // within seconds it's a rooftop party: kids running, Mrs. Okafor in her chair, everyone shooting the sunset
  { n: 36, frames: 60, spec: R('party', [at('okafor', 'okSit', 'real', { action: 'sit', hold: 'phone', back: true } as Partial<A>), { who: 'kid1', at: 'kidRun1', to: 'kidRun2', action: 'walk', face: 'hyped' }, { who: 'kid2', at: 'kidRun3', to: 'kidRun4', action: 'walk', face: 'hyped' },
    at('nbMum', 'mumP', 'real', { hold: 'photo', back: true }), at('nio', 'nioP', 'neutral', { hold: 'phone', back: true })], 0.12, PARTY), sfx: [['sk_cheer', 30, 0.25]] },
  // 9. at the door on their way down, the three's phones all light up with the sunset; they turn round
  { n: 37, frames: 44, spec: (f) => R('doorW', [at('maya', f < 22 ? 'inM' : 'doorM', 'neutral', { hold: 'phone', glow: 0.8, back: f < 22 ? true : undefined }), at('theo', f < 24 ? 'inT' : 'doorT', 'neutral', { hold: 'phone', glow: 0.8 }),
    at('sami', f < 26 ? 'inS' : 'doorS', [[0, 'neutral'], [26, 'shock']], { hold: 'phone', glow: 0.8, back: f < 26 ? true : undefined })], 0.08, PARTY), sfx: [['sk_ding', 4, 0.45], ['sk_ding', 10, 0.4], ['sk_ding', 16, 0.4]] },
  // they stare at the crowd
  { n: 38, frames: 44, spec: R('party', [at('okafor', 'okSit', 'real', { action: 'sit', hold: 'phone', back: true } as Partial<A>), at('nbMum', 'mumP', 'real', { hold: 'photo', back: true }), at('guest2', 'nbP', 'hyped', { hold: 'cup' })], 0.1, PARTY) },
  { n: 39, frames: 20, spec: R('mayaD', [at('maya', 'doorM', [[0, 'shock'], [10, 'neutral']], { facing: 'nioD', hold: 'phone' })], 0.08, PARTY), say: [L('gp12_15', 'maya', 2)], sfx: [['buzz', 6, 0.35]] },
  // Nio doesn't look at it. He looks at the crowd, then at his three friends. Deadpan.
  { n: 40, frames: 20, spec: R('nioD', [at('nio', 'nioD', [[0, 'neutral'], [12, 'deadpan']], { facing: 'doorM' })], 0.1, PARTY), say: [L('gp12_16', 'nio', 14)], sfx: [['buzz', 2, 0.3], ['buzz', 30, 0.3]] },
  // a beat. They turn and walk out the door. We watch them go. The door shuts.
  { n: 41, frames: 46, spec: R('exit', (['maya', 'theo', 'sami'] as const).map((w, i) => ({ who: w, at: ['doorM', 'doorT', 'doorS'][i], to: ['exitM', 'exitT', 'exitS'][i], action: 'walk', face: 'deadpan', back: w !== 'theo' ? true : undefined }) as A), 0.06, PARTY), sfx: [['oh_bang', 44, 0.6]] },
  // 10. the album fills with the neighbours' photos of the gathering, his sunset at the top
  { n: 42, frames: 24, img: 'pxi-ui/screens/parkway-album-1.png', sfx: [['sk_ding', 4, 0.4], ['sk_ding', 14, 0.35]] },
  { n: 43, frames: 24, img: 'pxi-ui/screens/parkway-album-2.png', sfx: [['sk_ding', 2, 0.35], ['sk_ding', 10, 0.35], ['sk_ding', 18, 0.3]] },
  { n: 44, frames: 48, img: 'pxi-ui/screens/parkway-album.png', sfx: [['sk_ding', 2, 0.3], ['sk_ding', 10, 0.3], ['sk_ding', 18, 0.3]] },
];
export const GROUP_PHOTO: SkitDef = { id: 'group-photo', shots, beds: [['sk_roof', 0.2], ['sk_party', 0.16, undefined, 36]] };
void WIND;

// The neighbours' photos for the album montage (out/skit-stills/gp12_*.png), and his sunset, one frame each.
export const GP_PICS: SkitDef = { id: 'gp-pics', beds: [], shots: [
  { n: 1, frames: 1, spec: R('sky', [], 0, { glow: 1 }) },
  { n: 2, frames: 1, spec: R('okPic', [at('okafor', 'okSit', 'charm', { action: 'sit' } as Partial<A>)], 0, PARTY) },
  { n: 3, frames: 1, spec: R('ledgePic', [at('nb1', 'ledgeA', 'hyped', { action: 'sit' } as Partial<A>), at('nb2', 'ledgeB', 'charm', { action: 'sit', hold: 'cup' } as Partial<A>)], 0, PARTY) },
  { n: 4, frames: 1, spec: R('crowdPic', [at('guest2', 'nbP', 'hyped', { hold: 'cup', facing: 'sunM' })], 0, PARTY) },
  { n: 5, frames: 1, spec: R('kidsPic', [at('kid1', 'kidP1', 'hyped', { act: { g: [[0, 'point']] } }), at('kid2', 'kidP2', 'charm'), at('nbMum', 'mumK', 'charm')], 0, PARTY) },
] };
// test frames of the new shots, for the contact sheet before the full render: [shot, frame]
const TEST: [number, number][] = [[5, 15], [23, 40], [24, 46], [25, 14], [33, 30], [133, 30], [35, 30], [36, 30], [38, 20], [16, 16], [29, 20], [37, 34], [41, 24], [40, 10]];
export const GP_TEST: SkitDef = { id: 'gp-test', beds: [], shots: TEST.map(([n, fr], i) => { const sh = shots.find((x) => x.n === n)!; const sp = sh.spec!; return { n: i + 1, frames: 1, spec: typeof sp === 'function' ? () => sp(fr) : sp, at0: fr } as Shot; }) };
