// AUX v12 (writers' room, Nov 19: /mnt/project-files/nio-soul/skits/v9/aux.md). Model: The Money, a figure of speech
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
  { n: n + 0.5, frames: 46, img: `pxi-ui/screens/${next}.png`, zoom: [1.4, 30], sfx: [[snd, 2, 0.8]] },
];
const shots: Shot[] = [
  // 1. Theo's living room, full, dead. The hosts by the island, Theo holding his phone with the quiet playlist on it.
  // Viewer: "a party where nobody is having fun; the guy with the phone is the host and it's hurting him."
  { n: 1, frames: 44, spec: T('wide', hosts({ theo: 'uneasy', nio: 'suspicious', maya: 'deadpan', sami: 'neutral' }, { theo: { hold: 'phone' }, maya: { facing: 'theo' } }), { party: DEAD }, 0.3), say: [L('ax12_02', 'maya', 4)] },
  // the girl reading the fire exit sign. Viewer: "she would rather read a sign than be at this party."
  { n: 2, frames: 34, spec: T('sign', [st('girl3', 'signGirl', 'neutral', { back: true })], { party: DEAD }, 0.1) },
  // Theo, flat, eyes on his phone. Viewer: "he knows, and it hurts."
  { n: 2.5, frames: 60, spec: T('theo', [st('theo', 'theo', [[0, 'deadInside'], [34, 'deadpan']], { hold: 'phone', gaze: [0, -0.6] })], { party: DEAD }, 0.08), say: [L('ax12_03', 'theo', 4)] },
  // Nio frowns at the room, then turns to Theo, calm and certain, hand out. Viewer: "he thinks he can fix it."
  { n: 3, frames: 44, spec: T('nio', [st('nio', 'nio', [[0, 'suspicious'], [16, 'charm']], { facing: 'theo', act: { g: [[16, 'offer']] } })], { party: DEAD }), say: [L('ax12_04', 'nio', 18)] },
  // Theo looks at the hand, at the room, and gives him the phone. Viewer: "he gives in, and he's worried."
  { n: 4, frames: 50, spec: T('theo', [st('theo', 'theo', [[0, 'uneasy'], [12, 'sheepish'], [26, 'deadInside']], { facing: 'nio', hold: 'phone', act: { g: [[24, 'offer']] } })], { party: DEAD }), say: [L('ax12_05', 'theo', 24)] },
  // 2. Close on the phone: his thumb taps "Rainy Day Piano". The title holds long enough to read.
  { n: 5, frames: 50, img: 'pxi-ui/screens/song-rain.png', zoom: [1.25, 40], tap: [[10, 540, 1590]], sfx: [['oh_tap', 10, 0.8]] },
  // The first note lands as one drop in a guest's cup; the next note, another. Viewer: "wait... it's raining with the music."
  { n: 5.2, frames: 46, spec: T('maya', [st('girl2', 'maya', [[0, 'neutral'], [30, 'uneasy']], { hold: 'cup', facing: 'nio' })], { party: DEAD }, 0.06),
    drip: [[6, 600, 1180], [30, 590, 1190]], sfx: [['sk_piano', 6, 0.7], ['sk_plink', 6, 0.6], ['sk_plink', 30, 0.6]] },
  // she looks up at the ceiling; another drop, then a few
  { n: 5.3, frames: 30, spec: T('maya', [st('girl2', 'maya', 'uneasy', { hold: 'cup', gaze: [0, 0.9] })], { party: DEAD }, 0.04), rain: [[0, 0], [6, 0.02], [18, 0.05]], drip: [[6, 520, 760]], sfx: [['sk_plink', 6, 0.5]] },
  // the piano rolls and it pours. Indoors, on the note.
  { n: 5.4, frames: 40, shake: [16], spec: T('panic', [], { party: { ...DEAD, headsUp: 0.9 } }, 0.2), rain: [[0, 0.06], [16, 1]], sfx: [['sk_rain', 16, 0.45], ['sk_gasp', 18, 0.6]] },
  // Screams: phones up shirts, under the island, a pizza box over a head.
  { n: 6, frames: 56, shake: [2], spec: T('panic', [st('girl2', 'pizza', 'shock', { hold: 'pizza' }), st('guest3', 'shirt', 'shock', { hold: 'phone' }), st('cap', 'doorA', 'uneasy', { facing: 'gOutD' }), st('girl', 'doorB', 'shock', { back: true, facing: 'gOutD' })], { party: PANIC }, 0.3),
    rain: true, say: [L('ax12_06', 'guest1', 2), L('ax12_07', 'guest2', 28)], sfx: RAIN },
  // Theo turns and sees water running down his record wall. He freezes. Viewer: "his records. That's what he cares about."
  { n: 7, frames: 28, spec: T('records', [], { party: PANIC }, 0.2), rain: true, sfx: RAIN },
  { n: 7.5, frames: 40, spec: T('theo', [st('theo', 'theo', [[0, 'shock'], [14, 'deadInside']], { gaze: [-0.9, 0] })], { party: PANIC }, 0.06), rain: true, say: [L('ax12_08', 'theo', 16)], sfx: RAIN },
  // he hugs two records to his chest; it pours on them anyway
  { n: 8, frames: 34, spec: T('theo', [st('theo', 'theo', 'deadInside', { hold: 'records', gaze: [0, -0.5] })], { party: PANIC }, 0.06), rain: true, sfx: RAIN },
  // he looks across the room and finds Nio, phone in hand. Viewer (Theo's eyes): "he did this."
  { n: 8.3, frames: 26, spec: T('nioPov', [st('nio', 'nioBack', 'uneasy', { hold: 'phone', facing: 'theo', gaze: [0, -0.6] })], { party: PANIC }, 0.12), rain: true, sfx: RAIN },
  // his face changes. Viewer: "oh no. He's going to kill him."
  { n: 8.6, frames: 22, spec: T('theo', [st('theo', 'theo', [[0, 'deadInside'], [8, 'rage']], { hold: 'records', facing: 'nioBack' })], { party: PANIC }, 0.1), rain: true, sfx: RAIN },
  // he drops the records and comes at Nio, arms out, shoving through; Nio sees him coming and backs up
  { n: 9, frames: 8, spec: T('lunge', [{ who: 'theo', at: 'theo', to: 'theoLunge', action: 'jog', face: 'rage', hold: 'throttle' }, st('nio', 'nioBack', [[0, 'uneasy'], [4, 'shock']], { hold: 'phone', facing: 'theoLunge', back: true })], { party: PANIC }, 0.1),
    rain: true, say: [L('ax12_09', 'nio', 4)], sfx: [...RAIN, ['sk_splash', 1, 0.5]] },
  // Theo's hands coming for his neck; Nio leaning away, talking fast
  { n: 9.5, frames: 30, shake: [0], spec: T('lunge', [st('theo', 'theoLunge', 'rage', { hold: 'throttle', facing: 'nioBack' }), st('nio', 'nioBack', 'shock', { hold: 'phone', facing: 'theoLunge', back: true })], { party: PANIC }, 0.18), rain: true, sfx: RAIN },
  // 3. a wet thumb goes for pause and slides onto skip: "Through The Roof"
  ...tapSkip(10, 'song-rain-wet', 'song-roof', 'sk_hype'),
  // the whole party lifts off the floor: Theo up there mid-lunge, hands an inch from Nio's neck, grabbing air. Screams.
  { n: 11, frames: 40, shake: [2], spec: T('upTwo', [st('theo', 'upTheo', 'rage', { hold: 'throttle', facing: 'upNio' }), st('nio', 'upNio', 'shock', { facing: 'upTheo', hold: 'phone' })], { flip: true, party: { ...PANIC, faces: 2 } }, 0.2), sfx: [['sk_gasp', 0, 0.6]] },
  // then one guy, upside down, starts laughing; then everyone is dancing on the ceiling
  { n: 12, frames: 40, spec: T('up', [st('guest1', 'upGuy', 'laughing', { facing: 'upNio' })], { flip: true, party: UP }, 0.15), say: [L('ax12_10', 'guest1', 6)], sfx: [['sk_cheer', 20, 0.5]] },
  // 4. Maya, hanging up there, shouts across to Nio
  { n: 13, frames: 40, spec: T('up', [st('maya', 'upMaya', 'rage', { facing: 'upNio', act: { g: [[2, 'point']] } }), st('sami', 'upSami', 'uneasy', { facing: 'upNio' }), st('guest1', 'upGuy', 'laughing', { hold: 'photo' })], { flip: true, party: UP }, 0.1), say: [L('ax12_11', 'maya', 4)] },
  { n: 14, frames: 26, spec: T('upNio', [st('nio', 'upNio', 'shock', { hold: 'phone', facing: 'upMaya' })], { flip: true, party: UP }, 0.1), say: [L('ax12_12', 'nio', 2)] },
  // water beads on the glass, the tap slides to skip: "Happy Birthday"
  ...tapSkip(15, 'song-roof-wet', 'song-bday', 'sk_birthday'),
  // everyone floats down in party hats; a cake appears on the island in front of one guy; the whole party sings to him
  { n: 16, frames: 40, spec: T('island', [st('guest3', 'theo', [[0, 'shock'], [22, 'uneasy']], { wear: HAT, gaze: [0, -0.4] }), st('maya', 'maya', 'charm', { wear: HAT, facing: 'theo' }), st('sami', 'sami', 'charm', { wear: HAT, facing: 'theo' })], { cake: true, party: BDAY }, 0.15) },
  // he looks round, panicking, then blows them out anyway
  { n: 17, frames: 30, spec: T('theo', [st('guest3', 'theo', [[0, 'uneasy'], [14, 'charm']], { wear: HAT, gaze: [0, -0.5] })], { cake: true, party: BDAY }, 0.1), sfx: [['sk_cheer', 20, 0.6]] },
  // 5. Sami takes the phone out of Nio's hand: calm, done. "Lift Music".
  { n: 18, frames: 40, spec: T('sami', [st('sami', 'sami', [[0, 'deadpan'], [22, 'neutral']], { wear: HAT, hold: 'phone', facing: 'nio' })], { party: BDAY }), say: [L('ax12_13', 'sami', 2)], sfx: [['oh_tap', 32, 0.8]] },
  { n: 19, frames: 44, img: 'pxi-ui/screens/song-lift.png', zoom: [1.25, 40], sfx: [['sk_muzak', 2, 0.7]] },
  { n: 20, frames: 44, spec: (f) => T('wide', hosts({ theo: 'deadpan', maya: 'deadpan', sami: 'deadpan', nio: 'uneasy' }, { theo: { wear: HAT, facing: 'gOutD', back: true }, maya: { wear: HAT, facing: 'gOutD', back: true }, sami: { wear: HAT, facing: 'gOutD', back: true }, nio: { wear: HAT, facing: 'theo' } }),
    { party: LIFT, door: f < 26 ? 0 : Math.min(1, (f - 26) / 8) }, 0.25), sfx: [['sk_ding', 24, 0.5]] },
  // 6. the front door: guests leave one at a time, soaked, in party hats, thrilled. Theo nods at each, a dead face, eyes on Nio.
  { n: 21, frames: 62, spec: T('door', [{ who: 'guest2', at: 'gOut1', to: 'gOutD', action: 'walk', face: 'hyped', wear: HAT, back: true }, { who: 'guest1', at: 'gOut2', to: 'gOutD', action: 'walk', face: 'laughing', wear: HAT, back: true }, st('theo', 'theoDoor', 'deadpan', { wear: HAT, facing: 'nioDoor' })], { door: 1, party: { fill: 0.08, faces: 1 } }, 0.1),
    say: [L('ax12_14', 'guest2', 2), L('ax12_15', 'guest1', 30)] },
  // the cake guy, still in his hat, holds on to Theo: thank you. Theo's eyes stay on Nio.
  { n: 22, frames: 40, spec: T('doorHug', [st('theo', 'theoDoor', 'deadpan', { wear: HAT, facing: 'nioDoor' }), st('guest3', 'hugTheo', 'charm', { wear: HAT, facing: 'theoDoor', act: { g: [[0, 'palms']] } })], { door: 1, party: { fill: 0.06, faces: 1 } }, 0.1), say: [L('ax12_16', 'guest3', 8)] },
  { n: 22.5, frames: 34, spec: T('doorTheo', [st('theo', 'theoDoor', 'deadpan', { wear: HAT, facing: 'nioDoor' })], { door: 1, party: { fill: 0.06, faces: 1 } }, 0.06), say: [L('ax12_17', 'guest2', 4)] },
  // 7. the porch, later. Theo holds a warped record. The phone on the step keeps lighting up. Maya picks it up.
  { n: 23, frames: 40, spec: PO('wide', [sit('nio', 'nio', 'neutral', { facing: 'theo' }), sit('theo', 'theo', 'deadInside', { hold: 'records', gaze: [0, -0.8] }), st('maya', 'maya', [[0, 'neutral'], [24, 'charm']], { facing: 'theo', hold: 'phone' }), st('sami', 'sami', 'neutral', { facing: 'nio' })], 0.2), sfx: [['sk_ding', 4, 0.35], ['sk_ding', 16, 0.3]] },
  { n: 24, frames: 40, img: 'pxi-ui/screens/push-aux.png', zoom: [1.12, 50], sfx: [['sk_ding', 4, 0.35], ['sk_ding', 14, 0.3], ['sk_ding', 24, 0.3]] },
  // she turns the screen to them: the party's album, full of the guests' photos
  { n: 24.5, frames: 30, spec: PO('wide', [sit('nio', 'nio', 'neutral', { facing: 'maya' }), sit('theo', 'theo', 'deadInside', { hold: 'records', gaze: [0, -0.8] }), st('maya', 'maya', 'laughing', { facing: 'nio', hold: 'show-phone' }), st('sami', 'sami', 'neutral', { facing: 'maya' })], 0.1) },
  { n: 25, frames: 44, img: 'pxi-ui/screens/aux-album.png', sfx: [['sk_ding', 10, 0.25]] },
  // Nio leans over, brightens, turns to Theo, sincere. Viewer: "he can't be serious."
  { n: 26, frames: 46, spec: PO('nio', [sit('nio', 'nio', [[0, 'neutral'], [10, 'hyped'], [20, 'charm']], { facing: 'theo' })]), say: [L('ax12_18', 'nio', 20)] },
  // Theo slowly sets the record down. Viewer: "here it comes."
  { n: 26.5, frames: 30, spec: PO('theo', [sit('theo', 'theo', [[0, 'deadInside'], [20, 'rage']], { hold: 'records', facing: 'nio' })]) },
  // Theo throttles him; Maya grabs his arm
  { n: 27, frames: 40, shake: [0], spec: PO('fight', [sit('nio', 'nio', 'laughing', { facing: 'theoOn' }), st('theo', 'theoOn', 'rage', { hold: 'throttle', facing: 'nio' }), st('maya', 'maya', 'uneasy', { facing: 'theoOn', back: true, act: { g: [[0, 'palms']] } }), st('sami', 'sami', 'uneasy', { facing: 'theoOn' })], 0.1), say: [L('ax12_19', 'maya', 6)] },
  // being choked, he holds up the lit phone: worth it
  { n: 28, frames: 34, spec: PO('nio', [sit('nio', 'nio', 'laughing', { facing: 'theoOn', hold: 'show-phone' })]), say: [L('ax12_20', 'nio', 6)] },
  // the phone in his hand buzzes again. Cut.
  { n: 30, frames: 28, img: 'pxi-ui/screens/push-aux2.png', zoom: [1.12, 50], sfx: [['sk_ding', 4, 0.4]] },
];
export const AUX: SkitDef = { id: 'aux', shots, beds: [['sk_party', 0.06, 5]] };
