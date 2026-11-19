// ONE SIP v10 (writers' room, Nov 19, after the stranger failed v9: /mnt/project-files/nio-soul/skits/v10/one-sip.md).
// Model: The Money, a belief held so hard it becomes physically true. Sami swears he can't handle a drink, so Nio quietly
// gives him juice to prove it's all in his head; every sip turns Sami into a worse guest anyway, until he's told to go and
// Nio holds up the juice box. Every object Sami picks up is in the room before he takes it (Maya's beret and Theo's coat
// on the hooks by the door, the glove in its pocket, the shade on the floor lamp): nothing pops on. Guests film him from
// the coat on, so the morning's photos come from the story. Each sip: eyes far away, a push-in, bigger every time.
import { ShotSpec } from '../../nw3d/world';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const P = (camera: string, actors: A[], push = 0.12, props?: string[], set = 'partyLive'): ShotSpec => ({ set, camera, frames: 1, actors, props, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const st = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'stand', face, ...x });
// the room as the night goes: the hooks (b beret, c coat) and the lamp's shade, until he takes each
const R0 = ['hooksbc', 'lamp'], R1 = ['hooksc', 'lamp'], R2 = ['hooks', 'lamp'], R3 = ['hooks', 'lampBare'];
// what he has on after each
const W1 = ['beret'], W2 = ['beret', 'longcoat'], W3 = ['beret', 'longcoat', 'glove'], W4 = ['longcoat', 'lampshade'];
// the sip at the rug: cup up, gulp; his eyes go far away, like it's hitting; a push-in, bigger each time
const FAR = 14;
const sipShot = (n: number, wear: string[], room: string[], k: number): Shot => ({ n, frames: 34 + 4 * k, shake: k >= 3 ? [FAR + 8] : undefined,
  spec: (f) => P('samiS', [st('sami', 'samiL', f < FAR ? 'uneasy' : 'real', { wear, hold: f < FAR ? 'sip' : 'cup', hand: 0, ...(f >= FAR ? { gaze: [0.1, 0.35] as [number, number] } : {}) })], 0.06 * k, room),
  sfx: [['sk_sip', 4, 0.5], ['sk_gulp', 11, 0.9], ...(k >= 3 ? [['sk_hit', FAR + 8, 0.7] as [string, number, number]] : [])] });
// he takes a thing off the hook (or the lamp): reaches up, it's on him, he turns back to the room
const take = (n: number, cam: string, mark: string, before: string[], after: string[], roomB: string[], roomA: string[], extra: A[] = []): Shot => ({ n, frames: 40,
  spec: (f) => P(cam, [st('sami', mark, f < 22 ? 'real' : 'hyped', { wear: f < 16 ? before : after, hold: f >= 6 && f < 16 ? 'arm-up' : 'cup', hand: 0, facing: f < 22 ? undefined : 'nioR', back: f < 22 && cam === 'hooksC' ? true : undefined }), ...extra], 0.06, f < 16 ? roomB : roomA),
  sfx: [['sk_pop', 15, 0.25]] });
const MORNING: [string, number, number?][] = [['sk_quad', 0, 0.25]];
const FILM = (who: string, mark: string, face: A['face'] = 'hyped'): A => st(who, mark, face, { hold: 'photo', facing: 'samiL' });

const shots: Shot[] = [
  // 1. the kickback in Nio's living room: coats on the hooks by the door, the lamp by the sofa
  { n: 1, frames: 30, spec: P('auxWide', [st('nio', 'nioR', 'neutral', { facing: 'samiL', hold: 'juicebox', back: true }), st('sami', 'samiL', 'neutral', { facing: 'nioR' }), st('maya', 'booM', 'neutral', { facing: 'nioR' }), st('imane', 'g3', 'charm', { facing: 'g4' }), st('theo', 'g4', 'charm')], 0.3, R0) },
  // close on the kid's apple juice box; Nio pours it into a red cup. Maya sees.
  { n: 2, frames: 30, spec: P('nio', [st('nio', 'nioR', 'neutral', { facing: 'samiL', hold: 'juicebox', gaze: [0.3, -0.5] })], 0.1, R0), sfx: [['sk_sip', 6, 0.4]] },
  { n: 3, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'suspicious', { facing: 'nioR' })], 0.08, R0), say: [L('os8_01', 'maya', 2)] },
  { n: 4, frames: 20, spec: P('nio', [st('nio', 'nioR', 'charm', { facing: 'booM', hold: 'juicebox' })], 0.06, R0), say: [L('os10_02', 'nio', 2)] },
  // he hands it to Sami; palms up
  { n: 5, frames: 30, spec: P('twoS', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' }), st('sami', 'samiL', 'uneasy', { facing: 'nioR', act: { g: [[4, 'palms']] } })], 0.12, R0), say: [L('os8_03', 'sami', 4)] },
  { n: 6, frames: 26, spec: P('nio', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' })], 0.12, R0), say: [L('os8_04', 'nio', 2)] },
  // 2. sip one. He takes Maya's beret off the hook, puts it on, turns to the speaker, sincere.
  sipShot(7, [], R0, 1),
  take(8, 'hooksC', 'hookS', [], W1, R0, R1),
  { n: 9, frames: 30, spec: P('samiS', [st('sami', 'samiL', 'hyped', { wear: W1, act: { g: [[4, 'point']] } })], 0.12, R1), say: [L('os8_05', 'sami', 2)] },
  { n: 10, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'deadpan', { facing: 'samiL' })], 0.06, R1), say: [L('os10_06', 'maya', 2)] },
  { n: 11, frames: 30, spec: P('samiS', [st('sami', 'samiL', 'real', { wear: W1, facing: 'booM' })], 0.12, R1), say: [L('os8_07', 'sami', 2)] },
  // 3. sip two. He sits down very close to Imane on the sofa, cup held like a clipboard.
  sipShot(12, W1, R1, 2),
  { n: 13, frames: 30, spec: P('sofa2', [{ who: 'imane', at: 'couchI', action: 'sit', face: 'neutral', gaze: [0.6, 0] } as A, { who: 'sami', at: 'couchS', action: 'sit', face: 'real', wear: W1, hold: 'cup', hand: 0, facing: 'couchI', act: { g: [[6, 'offer']] } } as A], 0.06, R1), say: [L('os8_08', 'sami', 2)] },
  { n: 14, frames: 24, spec: P('sofa2', [{ who: 'imane', at: 'couchI', action: 'sit', face: 'deadpan', gaze: [0.6, 0] } as A, { who: 'sami', at: 'couchS', action: 'sit', face: 'real', wear: W1, hold: 'cup', hand: 0, facing: 'couchI' } as A], 0.04, R1), say: [L('os8_09', 'imane', 2)] },
  // Sami nods slowly, disappointed, and pats her knee. He gets up.
  { n: 15, frames: 34, spec: P('sofa2', [{ who: 'imane', at: 'couchI', action: 'sit', face: 'deadpan', gaze: [0.6, 0] } as A, { who: 'sami', at: 'couchS', action: 'sit', face: [[0, 'real'], [10, 'uneasy']], wear: W1, hold: 'cup', hand: 0, facing: 'couchI', act: { g: [[14, 'palms']] } } as A], 0.04, R1) },
  { n: 16, frames: 26, spec: P('nio', [st('nio', 'nioR', 'sheepish', { facing: 'osImane', act: { g: [[4, 'palms']] } })], 0.12, R1), say: [L('os8_11', 'nio', 2)] },
  // 4. sip three, bigger. He takes Theo's long coat off the hook and puts it on. Phones come up.
  sipShot(17, W1, R1, 3),
  take(18, 'hooksC', 'hookS', W1, W2, R1, R2),
  { n: 19, frames: 28, spec: P('duel', [st('sami', 'duelS', 'suspicious', { facing: 'duelT', wear: W2, act: { g: [[4, 'point']] } })], 0.12, R2), say: [L('os8_12', 'sami', 2)] },
  { n: 20, frames: 20, spec: P('duel2', [st('theo', 'duelT', 'deadpan', { facing: 'duelS' })], 0.06, R2), say: [L('os8_13', 'theo', 2)] },
  { n: 21, frames: 20, spec: P('duel', [st('sami', 'duelS', 'suspicious', { facing: 'duelT', wear: W2 })], 0.12, R2), say: [L('os8_14', 'sami', 2)] },
  // he pulls a glove out of the coat pocket and slaps Theo with it. Gasps. Everyone's filming.
  { n: 22, frames: 34, shake: [18], spec: P('duel', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: W3, act: { g: [[16, 'dismiss']] } })], 0.1, R2), sfx: [['oh_hit', 18, 0.8], ['sk_gasp', 20, 0.8]] },
  { n: 23, frames: 30, spec: P('filmW', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: W3 }), st('theo', 'duelT', 'shock', { facing: 'duelS' }), FILM('maya', 'osMaya'), FILM('imane', 'osImane'), FILM('girl', 'osGirl')], 0.12, R2), sfx: [['sk_gasp', 2, 0.5]] },
  { n: 24, frames: 30, spec: P('nio', [st('nio', 'nioR', 'shock', { facing: 'duelT', act: { g: [[4, 'palms']] } })], 0.12, R2), say: [L('os8_15', 'nio', 2)] },
  // 5. sip four, the biggest. He pulls the shade off the lamp, puts it on like a crown, climbs onto the coffee table.
  sipShot(25, W3, R2, 3),
  take(26, 'lampC', 'lampS', W2, W4, R2, R3),
  { n: 27, frames: 40, shake: [2], spec: P('kingWide', [st('sami', 'king', 'hyped', { wear: W4, hold: 'arms-up' }), st('theo', 'booT', 'rage', { facing: 'king', back: true, hold: 'photo' }), st('imane', 'booI', 'rage', { facing: 'king', back: true, hold: 'photo' })], 0.25, R3), say: [L('os8_16', 'sami', 4)], sfx: [['sk_boo', 20, 0.7]] },
  { n: 28, frames: 26, spec: P('mayaK', [st('maya', 'booM', 'rage', { facing: 'nioR', gaze: [-0.4, 0.2], act: { g: [[4, 'point']] } })], 0.06, R3), say: [L('os10_17', 'maya', 2)] },
  // 6. Nio has had enough. He picks the juice box up, the same one, and holds it up without a word.
  { n: 29, frames: 40, spec: P('nioRev', [st('nio', 'nioK', [[0, 'deadpan'], [10, 'disgust']], { facing: 'king', hold: 'juicebox' })], 0.1, R3) },
  // Sami looks at the box. At his cup. Sniffs it. The lampshade slides off his head.
  { n: 30, frames: 48, spec: (f) => P('kingWide', [st('sami', 'king', [[0, 'shock'], [14, 'neutral'], [26, 'sheepish']], { wear: f < 26 ? W4 : ['longcoat'], hold: f >= 12 && f < 24 ? 'sniff' : 'cup', hand: 0, gaze: f < 12 ? [0.3, -0.3] : [0, -0.5] })], 0.1, R3), sfx: [['sk_sniff', 14, 0.6], ['sk_flop', 26, 0.7]] },
  { n: 31, frames: 20, spec: P('samiS', [st('sami', 'samiL', 'sheepish', { wear: ['longcoat'], gaze: [0, -0.4] })], 0.08, R3), say: [L('os10_19', 'sami', 6)] },
  // 7. next morning. Sami asleep on the sofa under the duvet. His phone buzzes, and buzzes, and buzzes, and wakes him.
  { n: 32, frames: 52, spec: (f) => P('couch', [{ who: 'sami', at: 'couch', action: 'sit', face: f < 34 ? 'asleep' : 'neutral', hold: f < 34 ? 'asleep' : 'phone' } as A], 0.1, ['blanket'], 'livingDay'), sfx: [...MORNING, ['buzz', 4, 0.6], ['buzz', 16, 0.6], ['buzz', 28, 0.7], ['sk_ding', 40, 0.5]] },
  { n: 33, frames: 40, img: 'pxi-ui/screens/push-face41.png', zoom: [1.12, 50], tap: [[30, 540, 955]], sfx: [['oh_tap', 30, 0.8]] },
  // IS THIS YOU? The coat and the glove: Not me. The table and the lampshade: Not me.
  { n: 34, frames: 30, img: 'pxi-ui/screens/review-coat.png', tap: [[20, 357, 1419]], sfx: [['oh_tap', 20, 0.8]] },
  { n: 35, frames: 28, img: 'pxi-ui/screens/review-table.png', tap: [[18, 368, 1451]], sfx: [['oh_tap', 18, 0.8]] },
  // the last one: Nio holding up the juice box, Sami behind him on the table. His thumb hovers.
  { n: 36, frames: 44, img: 'pxi-ui/screens/review-juice.png', hover: [10, 368, 1451] },
  // he pulls the duvet over his head. Cut.
  { n: 37, frames: 36, spec: (f) => P('couch', [{ who: 'sami', at: 'couch', action: 'sit', face: 'crushed', hold: f < 12 ? 'phone' : 'asleep' } as A], 0.1, f < 12 ? ['blanket'] : ['blanketUp'], 'livingDay'), sfx: [...MORNING, ['sk_flop', 12, 0.5]] },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_party', 0.22, 32], ['sk_walla', 0.5, 32]] };

// the guests' photos the morning screens show (out/skit-stills/os10_*.png), one frame each
export const OS_PICS: SkitDef = { id: 'os-pics', beds: [], shots: [
  { n: 1, frames: 1, spec: P('duel', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: W3, act: { g: [[0, 'dismiss']] } })], 0, R2) },
  { n: 2, frames: 1, spec: P('kingWide', [st('sami', 'king', 'hyped', { wear: W4, hold: 'arms-up' })], 0, R3) },
  { n: 3, frames: 1, spec: P('filmW', [st('nio', 'nioK', 'disgust', { facing: 'king', hold: 'juicebox', back: true }), st('sami', 'king', 'shock', { wear: W4 })], 0, R3) },
] };
// test frames of the new shots, for a contact sheet before the full render: [shot, frame]
const TEST: [number, number][] = [[1, 10], [8, 4], [8, 30], [13, 10], [18, 30], [22, 20], [23, 10], [26, 4], [26, 30], [30, 30], [32, 10], [37, 24]];
export const OS_TEST: SkitDef = { id: 'os-test', beds: [], shots: TEST.map(([n, fr], i) => { const sh = shots.find((x) => x.n === n)!; const sp = sh.spec!; return { n: i + 1, frames: 1, spec: typeof sp === 'function' ? () => sp(fr) : sp }; }) };
