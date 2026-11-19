// ONE SIP v11 (writers' room, Nov 19, the third and last try: /mnt/project-files/nio-soul/skits/v10/one-sip-v11.md).
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
// the room as the night goes: Theo's coat on the hooks (c) and the lamp's shade, until Sami takes each (and puts them back)
const R0 = ['hooksc', 'lamp'], R1 = ['hooks', 'lamp'], R2 = ['hooks', 'lampBare'];
// what he has on after each
const W2 = ['longcoat'], W3 = ['longcoat', 'glove'], W4 = ['longcoat', 'glove', 'lampshade'];
// the sip, held, facing us: cup up, a swallow, a beat, then his eyes go glassy. A push-in, bigger each time.
const FAR = 24;
const sipShot = (n: number, wear: string[], room: string[], k: number): Shot => ({ n, frames: 44 + 6 * k, shake: k >= 3 ? [FAR + 6] : undefined,
  spec: (f) => P('samiS', [st('sami', 'samiL', f < 16 ? 'neutral' : f < FAR ? 'uneasy' : 'real', { wear, hold: f < 16 ? 'sip' : 'cup', hand: 0, ...(f >= FAR ? { gaze: [0.1, 0.35] as [number, number] } : {}) })], 0.06 * k, room),
  sfx: [['sk_sip', 4, 0.5], ['sk_gulp', 13, 0.9], ...(k >= 2 ? [['sk_hit', FAR + 6, 0.4 + 0.2 * (k - 2)] as [string, number, number]] : [])] });
// he takes a thing off the hook (or the lamp), or puts it back: reaches up, it changes hands, he turns
const take = (n: number, cam: string, mark: string, before: string[], after: string[], roomB: string[], roomA: string[], face: A['face'] = 'hyped', extra: A[] = []): Shot => ({ n, frames: 40,
  spec: (f) => P(cam, [st('sami', mark, f < 22 ? 'real' : face, { wear: f < 16 ? before : after, hold: f >= 6 && f < 16 ? 'arm-up' : 'cup', hand: 0, facing: f < 22 ? undefined : 'nioR', back: f < 22 && cam === 'hooksC' ? true : undefined }), ...extra], 0.06, f < 16 ? roomB : roomA),
  sfx: [['sk_pop', 15, 0.25]] });
const FILM = (who: string, mark: string, face: A['face'] = 'hyped'): A => st(who, mark, face, { hold: 'photo', facing: 'samiL' });

const shots: Shot[] = [
  // 1. Nio's living room, a kickback. Just three: Theo holds a red cup out to Sami; Sami, palms up, turns it down.
  // Viewer: "he doesn't drink; he says it makes him weird."
  { n: 1, frames: 30, spec: P('duel2', [st('theo', 'duelT', 'charm', { facing: 'duelS', hold: 'cup-point' })], 0.15, R0) },
  { n: 1.5, frames: 40, spec: P('duel', [st('sami', 'duelS', [[0, 'neutral'], [8, 'sheepish']], { facing: 'duelT', act: { g: [[6, 'palms']] } })], 0.08, R0), say: [L('os11_01', 'sami', 6)] },
  // Nio looks at Sami: a small certain smile. Viewer: "he doesn't believe him. He has an idea."
  { n: 2, frames: 30, spec: P('nio', [st('nio', 'nioR', [[0, 'neutral'], [10, 'charm']], { facing: 'samiL' })], 0.1, R0) },
  // at the desk, his back to the room, he pours a kid's apple juice box into a red cup. Viewer: "it's juice. He's tricking him."
  { n: 3, frames: 40, spec: P('pour', [st('nio', 'nioD', 'charm', { hold: 'juicebox', gaze: [0, -0.6] })], 0.12, R0), sfx: [['sk_sip', 10, 0.5], ['sk_sip', 22, 0.4]] },
  // Maya sees. Nio turns: a finger to his lips. She raises her eyebrows and says nothing.
  { n: 4, frames: 26, spec: P('mayaK', [st('maya', 'booM', [[0, 'neutral'], [8, 'suspicious']], { facing: 'nioD' })], 0.08, R0) },
  { n: 5, frames: 30, spec: P('auxNio', [st('nio', 'nioD', 'charm', { facing: 'booM', hold: 'shush' })], 0.06, R0) },
  { n: 6, frames: 24, spec: P('mayaK', [st('maya', 'booM', 'deadpan', { facing: 'nioD' })], 0.04, R0) },
  // he walks back and holds the cup out: one sip
  { n: 7, frames: 40, spec: P('twoS', [st('nio', 'nioR', 'charm', { facing: 'samiL', hold: 'cup-point' }), st('sami', 'samiL', 'uneasy', { facing: 'nioR' })], 0.1, R0), say: [L('os11_02', 'nio', 6)] },
  // 2. sip one, held. Viewer: "it's hitting him... from juice?"
  sipShot(8, [], R0, 1),
  // he turns to Theo, a gentle hand on his shoulder, real concern: your haircut
  { n: 9, frames: 50, spec: P('duel', [st('sami', 'duelS', 'real', { facing: 'duelT', act: { g: [[6, 'offer']] }, gaze: [0, 0.3] })], 0.08, R0), say: [L('os11_03', 'sami', 6)] },
  // Theo touches his hair. The room goes ohhh.
  { n: 10, frames: 34, spec: P('duel2', [st('theo', 'duelT', [[0, 'shock'], [10, 'sheepish']], { facing: 'duelS', hold: 'hair' })], 0.06, R0), sfx: [['sk_gasp', 6, 0.6]] },
  // Nio's smile slips; he glances at the desk where the juice box is. Viewer: "he didn't expect this."
  { n: 11, frames: 30, spec: P('nio', [st('nio', 'nioR', [[0, 'charm'], [10, 'uneasy']], { facing: 'samiL', gaze: [0.7, -0.2] })], 0.06, R0) },
  // 3. sip two, bigger. He takes Theo's long coat off the hook and puts it on. Phones come up.
  sipShot(12, [], R0, 2),
  take(13, 'hooksC', 'hookS', [], W2, R0, R1),
  { n: 14, frames: 30, spec: P('filmW', [st('sami', 'duelS', 'hyped', { facing: 'duelT', wear: W2 }), st('theo', 'duelT', 'uneasy', { facing: 'duelS' }), FILM('maya', 'osMaya'), FILM('imane', 'osImane'), FILM('girl', 'osGirl')], 0.12, R1) },
  { n: 15, frames: 40, spec: P('duel', [st('sami', 'duelS', 'suspicious', { facing: 'duelT', wear: W2, act: { g: [[4, 'chest']] } })], 0.12, R1), say: [L('os11_04', 'sami', 4)] },
  { n: 16, frames: 30, spec: P('duel2', [st('theo', 'duelT', 'uneasy', { facing: 'duelS' })], 0.06, R1), say: [L('os11_05', 'theo', 4)] },
  { n: 17, frames: 30, spec: P('duel', [st('sami', 'duelS', 'suspicious', { facing: 'duelT', wear: W2 })], 0.12, R1), say: [L('os11_06', 'sami', 4)] },
  // he pulls a glove out of the coat pocket and slaps Theo with it. Gasps. Everyone's filming.
  { n: 18, frames: 34, shake: [18], spec: P('duel', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: W3, act: { g: [[16, 'dismiss']] } })], 0.1, R1), sfx: [['oh_hit', 18, 0.8], ['sk_gasp', 20, 0.8]] },
  { n: 19, frames: 30, spec: P('filmW', [st('sami', 'duelS', 'rage', { facing: 'duelT', wear: W3 }), st('theo', 'duelT', 'shock', { facing: 'duelS' }), FILM('maya', 'osMaya'), FILM('imane', 'osImane'), FILM('girl', 'osGirl')], 0.12, R1), sfx: [['sk_gasp', 2, 0.5]] },
  // 4. sip three, the biggest. The shade off the lamp, on like a crown; up onto the coffee table, cup raised.
  sipShot(20, W3, R1, 3),
  take(21, 'lampC', 'lampS', W3, W4, R1, R2),
  { n: 22, frames: 50, shake: [2], spec: P('kingWide', [st('sami', 'king', 'hyped', { wear: W4, hold: 'arms-up' }), st('theo', 'booT', 'rage', { facing: 'king', back: true, hold: 'photo' }), st('imane', 'booI', 'rage', { facing: 'king', back: true, hold: 'photo' })], 0.25, R2), say: [L('os11_07', 'sami', 4)], sfx: [['sk_boo', 34, 0.7]] },
  { n: 23, frames: 40, spec: P('mayaK', [st('maya', 'booM', 'deadpan', { facing: 'king', gaze: [-0.4, 0.2], act: { g: [[4, 'point']] } })], 0.06, R2), say: [L('os11_08', 'maya', 4)] },
  // 5. Nio has had enough. He picks up the juice box, the same one, and holds it up without a word. Viewer: "it was juice."
  { n: 24, frames: 44, spec: P('nioRev', [st('nio', 'nioK', [[0, 'deadpan'], [12, 'disgust']], { facing: 'king', hold: 'juicebox' })], 0.1, R2) },
  // Sami looks at the box. At his cup. Sniffs it. The room is quiet; every phone still on him.
  { n: 25, frames: 54, spec: (f) => P('kingWide', [st('sami', 'king', [[0, 'shock'], [16, 'neutral'], [36, 'sheepish']], { wear: W4, hold: f >= 16 && f < 32 ? 'sniff' : 'cup', hand: 0, gaze: f < 16 ? [0.3, -0.3] : [0, -0.5] })], 0.08, R2), sfx: [['sk_sniff', 18, 0.6]] },
  // he steps down, puts the shade back on the lamp and straightens it
  take(26, 'lampC', 'lampS', W4, W3, R2, R1, 'sheepish'),
  // hangs Theo's coat back on its hook
  take(27, 'hooksC', 'hookS', W3, [], R1, R0, 'sheepish'),
  // and walks out the front door in silence. The door clicks shut.
  { n: 28, frames: 40, spec: P('queueN', [{ who: 'sami', at: 'hookS', to: 'doorOut', action: 'walk', face: 'sheepish', back: true }], 0.06, R0), sfx: [['oh_click', 38, 0.8]] },
  // a beat: the room, phones still up, everyone looking at the door. Then, through the door, muffled:
  { n: 29, frames: 64, spec: P('filmW', [st('nio', 'nioR', 'deadpan', { facing: 'doorOut', hold: 'juicebox' }), st('theo', 'duelT', 'neutral', { facing: 'doorOut' }), FILM('maya', 'osMaya', 'deadpan'), FILM('imane', 'osImane', 'neutral'), FILM('girl', 'osGirl', 'neutral')], 0.1, R0), say: [L('os11_09', 'sami', 26)] },
  // Theo touches his hair. Cut.
  { n: 30, frames: 34, spec: P('duel2', [st('theo', 'duelT', [[0, 'neutral'], [8, 'sheepish']], { facing: 'duelS', hold: 'hair', gaze: [-0.6, 0] })], 0.04, R0) },
];
export const ONE_SIP: SkitDef = { id: 'one-sip', shots, beds: [['sk_party', 0.22, 24], ['sk_walla', 0.5, 24]] }; // the music stops on the juice box

export const OS_PICS: SkitDef = { id: 'os-pics', beds: [], shots: [shots[0]] };
const TEST: [number, number][] = [[1, 20], [1.5, 20], [9, 30], [10, 20]];
export const OS_TEST: SkitDef = { id: 'os-test', beds: [], shots: TEST.map(([n, fr], i) => { const sh = shots.find((x) => x.n === n)!; const sp = sh.spec!; return { n: i + 1, frames: 1, spec: typeof sp === 'function' ? () => sp(fr) : sp }; }) };
