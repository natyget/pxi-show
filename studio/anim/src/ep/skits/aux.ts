// AUX v10 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v9/aux.md). Model: The Money, a figure of speech
// made literally true: the music really takes the room somewhere. Theo's house party is dead, Nio takes the aux to save
// it, every song really happens to the room, and the chaos makes it the best party anyone's been to, which is no comfort
// to Theo. Every song is named on Nio's screen before it lands (the cause in the picture); every skip is a wet thumb.
import { ShotSpec } from '../../nw3d/world';
import { TheoOpts } from '../../nw3d/campus';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const T = (camera: string, actors: A[], o: TheoOpts = {}, push = 0.12): ShotSpec => ({ set: 'theoHouse', camera, frames: 1, actors, campus: { theo: o }, push });
const PO = (camera: string, actors: A[], push = 0.1): ShotSpec => ({ set: 'porch', camera, frames: 1, actors, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const st = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'stand', face, ...x });
const sit = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'sit', face, ...x });
const HAT = ['partyhat'];
// the four hosts at the island
const hosts = (f: Record<string, A['face']>, x: Record<string, Partial<A>> = {}): A[] => ['theo', 'maya', 'sami', 'nio'].map((w) => st(w, w, f[w] ?? 'neutral', { facing: 'nioBack', ...x[w] }));
const DEAD = { fill: 0.32, faces: 4 }; // the dead party: standing about, scrolling, blank
const PANIC = { fill: 0.3, armsUp: 0.8, headsUp: 0.9, crouch: 0.25, faces: 2 };
const UP = { fill: 0.3, dance: 1, armsUp: 0.6, faces: 1 }; // dancing on the ceiling
const LIFT = { fill: 0.32, faces: 4, face: [1.5, 9.0] as [number, number] }; // everyone faces the front door
const BDAY = { fill: 0.32, faces: 3, face: [5.0, 5.4] as [number, number] }; // everyone turns to the guy with the cake, singing
const RAIN: [string, number, number?][] = [['sk_rain', 0, 0.45]];
const tapSkip = (n: number, img: string, next: string, snd: string): Shot[] => [
  { n, frames: 34, img: `pxi-ui/screens/${img}.png`, tap: [[18, 790, 1590]], sfx: [['oh_tap', 18, 0.9]] }, // aimed at pause, lands on skip
  { n: n + 0.5, frames: 30, img: `pxi-ui/screens/${next}.png`, zoom: [1.25, 40], sfx: [[snd, 2, 0.8]] },
];
const shots: Shot[] = [
  // 1. Theo's living room, full, dead. The hosts by the island.
  { n: 1, frames: 34, spec: T('wide', hosts({ theo: 'uneasy', nio: 'neutral', maya: 'deadpan', sami: 'neutral' }, { theo: { facing: 'signGirl' } }), { party: DEAD }, 0.3), say: [L('ax10_01', 'theo', 6)] },
  // a girl reading the fire exit sign
  { n: 2, frames: 30, spec: T('sign', [st('girl3', 'signGirl', 'neutral', { back: true })], { party: DEAD }, 0.1), say: [L('ax10_02', 'maya', 4)] },
  { n: 3, frames: 26, spec: T('nio', [st('nio', 'nio', [[0, 'suspicious'], [8, 'charm']], { facing: 'theo', act: { g: [[8, 'offer']] } })], { party: DEAD }), say: [L('ax10_03', 'nio', 6)] },
  { n: 4, frames: 30, spec: T('theo', [st('theo', 'theo', [[0, 'uneasy'], [12, 'sheepish']], { facing: 'nio', hold: 'phone' })], { party: DEAD }), say: [L('ax10_04', 'theo', 10)] },
  // 2. "Rainy Day Piano", to set a mood. It pours. Indoors.
  { n: 5, frames: 36, img: 'pxi-ui/screens/song-rain.png', zoom: [1.25, 40], tap: [[8, 540, 1590]], sfx: [['oh_tap', 8, 0.8], ['sk_piano', 12, 0.7]] },
  { n: 6, frames: 50, shake: [2], spec: T('panic', [st('girl2', 'pizza', 'shock', { hold: 'pizza' }), st('guest3', 'shirt', 'shock', { hold: 'phone' }), st('cap', 'doorA', 'uneasy', { facing: 'gOutD' }), st('girl', 'doorB', 'shock', { back: true, facing: 'gOutD' })], { party: PANIC }, 0.3),
    rain: true, say: [L('ax10_05', 'guest1', 4), L('ax10_06', 'guest2', 16), L('ax10_07', 'guest3', 28)], sfx: [...RAIN, ['sk_gasp', 0, 0.5]] },
  // Theo turns to his record wall
  { n: 7, frames: 26, spec: T('theo', [st('theo', 'theo', 'shock', { gaze: [-0.9, 0] })], { party: PANIC }), rain: true, say: [L('ax10_08', 'theo', 2)], sfx: RAIN },
  { n: 8, frames: 24, spec: T('records', [], { party: PANIC }, 0.2), rain: true, sfx: RAIN },
  // then turns on Nio and charges
  { n: 9, frames: 8, spec: T('lunge', [{ who: 'theo', at: 'theo', to: 'theoLunge', action: 'jog', face: 'rage' }, st('nio', 'nioBack', 'shock', { hold: 'phone', facing: 'theoLunge', back: true })], { party: PANIC }, 0.1), rain: true, sfx: RAIN },
  // 3. a wet thumb stabs at pause and lands on skip: "Through The Roof"
  ...tapSkip(10, 'song-rain-wet', 'song-roof', 'sk_hype'),
  // the whole party lifts off the floor: Theo up there mid-lunge, hands an inch from Nio's neck. Screams.
  { n: 11, frames: 36, shake: [2], spec: T('upTwo', [st('theo', 'upTheo', 'rage', { hold: 'throttle', facing: 'upNio' }), st('nio', 'upNio', 'shock', { facing: 'upTheo', hold: 'phone' })], { flip: true, party: { ...PANIC, faces: 2 } }, 0.2), sfx: [['sk_gasp', 0, 0.6]] },
  // then one guy, upside down, starts laughing; then everyone is dancing on the ceiling
  { n: 12, frames: 34, spec: T('up', [st('guest1', 'upGuy', 'laughing', { facing: 'upNio' })], { flip: true, party: UP }, 0.15), say: [L('ax10_09', 'guest1', 6)], sfx: [['sk_cheer', 20, 0.5]] },
  { n: 13, frames: 30, spec: T('up', [st('maya', 'upMaya', 'rage', { facing: 'upNio', act: { g: [[2, 'point']] } }), st('sami', 'upSami', 'uneasy', { facing: 'upNio' }), st('guest1', 'upGuy', 'laughing', { hold: 'photo' })], { flip: true, party: UP }, 0.1), say: [L('ax10_10', 'maya', 4)] },
  { n: 14, frames: 24, spec: T('upNio', [st('nio', 'upNio', 'shock', { hold: 'phone', facing: 'upMaya' })], { flip: true, party: UP }, 0.1), say: [L('ax10_11', 'nio', 2)] },
  // 4. pause again: water on the glass, the tap slides to skip. "Happy Birthday".
  ...tapSkip(15, 'song-roof-wet', 'song-bday', 'sk_birthday'),
  // everyone floats down in party hats; a cake appears on the island in front of one guy; the whole party sings to him
  { n: 16, frames: 40, spec: T('island', [st('guest3', 'theo', [[0, 'shock'], [22, 'uneasy']], { wear: HAT, gaze: [0, -0.4] }), st('maya', 'maya', 'charm', { wear: HAT, facing: 'theo' }), st('sami', 'sami', 'charm', { wear: HAT, facing: 'theo' })], { cake: true, party: BDAY }, 0.15) },
  // he looks round, panicking, then blows them out anyway
  { n: 17, frames: 30, spec: T('theo', [st('guest3', 'theo', [[0, 'uneasy'], [14, 'charm']], { wear: HAT, gaze: [0, -0.5] })], { cake: true, party: BDAY }, 0.1), sfx: [['sk_cheer', 20, 0.6]] },
  // 5. Sami grabs the phone off Nio: "Lift Music". Everyone faces the door, still, hands folded.
  { n: 18, frames: 26, spec: T('sami', [st('sami', 'sami', 'deadpan', { wear: HAT, hold: 'phone' })], { party: BDAY }), sfx: [['oh_tap', 18, 0.8]] },
  { n: 19, frames: 30, img: 'pxi-ui/screens/song-lift.png', zoom: [1.25, 40], sfx: [['sk_muzak', 2, 0.7]] },
  { n: 20, frames: 44, spec: (f) => T('wide', hosts({ theo: 'deadpan', maya: 'deadpan', sami: 'deadpan', nio: 'uneasy' }, { theo: { wear: HAT, facing: 'gOutD', back: true }, maya: { wear: HAT, facing: 'gOutD', back: true }, sami: { wear: HAT, facing: 'gOutD', back: true }, nio: { wear: HAT, facing: 'theo' } }),
    { party: LIFT, door: f < 26 ? 0 : Math.min(1, (f - 26) / 8) }, 0.25), sfx: [['sk_ding', 24, 0.5]] },
  // 6. the front door: guests leaving, soaked, in party hats, gushing. Theo nods at each, a dead face, eyes on Nio.
  { n: 21, frames: 62, spec: T('door', [{ who: 'guest2', at: 'gOut1', to: 'gOutD', action: 'walk', face: 'hyped', wear: HAT, back: true }, { who: 'guest3', at: 'gOut2', to: 'gOutD', action: 'walk', face: 'laughing', wear: HAT, back: true }, st('theo', 'theoDoor', 'deadpan', { wear: HAT, facing: 'nioDoor' })], { door: 1, party: { fill: 0.08, faces: 1 } }, 0.1),
    say: [L('ax10_12', 'guest2', 2), L('ax10_13', 'guest3', 18)] },
  { n: 22, frames: 40, spec: T('doorTheo', [st('theo', 'theoDoor', 'deadpan', { wear: HAT, facing: 'nioDoor' })], { door: 1, party: { fill: 0.06, faces: 1 } }, 0.1), say: [L('ax10_14', 'guest1', 2), L('ax10_15', 'guest2', 22)] },
  // 7. the porch, later. Theo stares at a warped record in his lap. The phone on the step keeps lighting up.
  { n: 23, frames: 36, spec: PO('wide', [sit('nio', 'nio', 'neutral', { facing: 'theo' }), sit('theo', 'theo', 'deadInside', { gaze: [0, -0.8] }), st('maya', 'maya', 'neutral', { facing: 'theo' }), st('sami', 'sami', 'neutral', { facing: 'nio' })], 0.2) },
  { n: 24, frames: 40, img: 'pxi-ui/screens/push-aux.png', zoom: [1.12, 50], sfx: [['sk_ding', 4, 0.35], ['sk_ding', 14, 0.3], ['sk_ding', 24, 0.3]] },
  { n: 25, frames: 40, img: 'pxi-ui/screens/aux-album.png', sfx: [['sk_ding', 10, 0.25]] },
  { n: 26, frames: 34, spec: PO('nio', [sit('nio', 'nio', [[0, 'neutral'], [8, 'charm']], { facing: 'theo' })]), say: [L('ax10_16', 'nio', 8)] },
  // Theo lunges and throttles him; Maya and Sami pull at Theo
  { n: 27, frames: 34, shake: [0], spec: PO('fight', [sit('nio', 'nio', 'laughing', { facing: 'theoOn' }), st('theo', 'theoOn', 'rage', { hold: 'throttle', facing: 'nio' }), st('maya', 'maya', 'uneasy', { facing: 'theoOn', back: true, act: { g: [[0, 'palms']] } }), st('sami', 'sami', 'uneasy', { facing: 'theoOn' })], 0.1), say: [L('ax10_17', 'maya', 6)] },
  { n: 28, frames: 26, spec: PO('nio', [sit('nio', 'nio', 'laughing', { facing: 'theoOn' })]), say: [L('ax10_18', 'nio', 2)] },
  { n: 29, frames: 26, spec: PO('fight', [sit('nio', 'nio', 'laughing', { facing: 'theoOn' }), st('theo', 'theoOn', 'rage', { hold: 'throttle', facing: 'nio' }), st('maya', 'maya', 'uneasy', { facing: 'theoOn', back: true }), st('sami', 'sami', 'deadpan', { facing: 'nio' })]), say: [L('ax10_19', 'sami', 4)] },
  // the phone on the step buzzes again. Cut.
  { n: 30, frames: 24, img: 'pxi-ui/screens/push-aux2.png', zoom: [1.12, 50], sfx: [['sk_ding', 4, 0.4]] },
];
export const AUX: SkitDef = { id: 'aux', shots, beds: [['sk_party', 0.06, 5]] };
