// WAVE BACK v10 (writers' room, Nov 19: /mnt/project-files/nio-soul/skits/v10/wave-back-v10.md). Model: The Money, a lie held
// at rising cost until one fact beats it, then a wildly out-of-proportion exit. Nio waves back at a guy who was waving
// at someone else, plays along when the guy guesses they went to camp together, lands at the camp reunion where the PXI
// album can't find one photo of him, and flees through the bathroom window, onto the mower and into the camp's lake.
// Every cause on screen; eyes on each other; no look to camera.
import { ShotSpec } from '../../nw3d/world';
import { GARDEN_RUN, CampusOpts } from '../../nw3d/campus';
import type { SkitDef, Shot, Line } from '../Skit';

type A = ShotSpec['actors'][0];
const Q = (camera: string, actors: A[], push = 0.15): ShotSpec => ({ set: 'quad', camera, frames: 1, actors, push });
const D = (camera: string, actors: A[], push = 0.12): ShotSpec => ({ set: 'dining', camera, frames: 1, actors, push });
const G = (camera: string, actors: A[], o: CampusOpts = {}, push = 0.1): ShotSpec => ({ set: 'garden', camera, frames: 1, actors, campus: o, push });
const W = (camera: string, actors: A[], push = 0.12): ShotSpec => ({ set: 'bath', camera, frames: 1, actors, push });
const L = (key: string, who: string, at: number): Line => ({ key, who, at });
const st = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'stand', face, ...x });
const sit = (who: string, at: string, face: A['face'], x: Partial<A> = {}): A => ({ who, at, action: 'sit', face, ...x });
const marcus = (at: string, face: A['face'], x: Partial<A> = {}) => st('marcus', at, face, x);
const nio = (at: string, face: A['face'], x: Partial<A> = {}) => st('nio', at, face, x);
// the mower's run: where it is at frame f of a shot that covers d0 to d1 metres of it
const RATE = 0.19; // metres a frame: flat out
const ride = (d: number) => 'r' + Math.round(Math.max(0, Math.min(d, GARDEN_RUN.len + GARDEN_RUN.fly)) / 0.25);
const onMower = (d: number, face: A['face']): A => ({ who: 'nio', at: ride(d), action: 'sit', face, back: true });
const GRASS: [string, number, number?][] = [['sk_quad', 0, 0.6]];
const ROOM: [string, number, number?][] = [['sk_dinner', 0, 0.6]];
const MOW: [string, number, number?][] = [['sk_mower', 0, 0.8]];
// the dinner: Tobi at the head; Jade beside Nio; Dev beside Marcus (Priya, the fifth, is at the near end, off the picture)
const table = (faces: Record<string, A['face']>, x: Record<string, Partial<A>> = {}): A[] => [
  sit('tobi', 'mum', faces.tobi ?? 'charm', { facing: 'nio', ...x.tobi }), sit('nio', 'nio', faces.nio ?? 'charm', x.nio),
  sit('marcus', 'marcus', faces.marcus ?? 'charm', x.marcus), sit('camp1', 'jade', faces.jade ?? 'charm', { facing: 'marcus', ...x.jade }),
  sit('camp2', 'sisSeat', faces.dev ?? 'charm', { facing: 'nio', ...x.dev }),
];
const L0 = GARDEN_RUN.len, FLY = GARDEN_RUN.fly;
const shots: Shot[] = [
  // 1. the quad. Marcus, red cap, across the grass, waves big. Viewer: "he's waving at Nio."
  { n: 1, frames: 36, spec: Q('marcus', [marcus('marcus', 'hyped', { hold: 'wave' })], 0.25), sfx: GRASS },
  // Nio waves back, big and happy. The girl in yellow is right behind him.
  { n: 2, frames: 40, spec: Q('nio', [nio('nio', 'hyped', { hold: 'wave', facing: 'marcus' }), st('sis', 'sisB', 'charm', { facing: 'marcus' })], 0.2), sfx: GRASS },
  // she jogs past him, up the lawn, into Marcus's arms. Viewer: "oh no. He was waving at her."
  { n: 3, frames: 62, spec: Q('wide', [nio('nio', [[0, 'hyped'], [30, 'shock']], { hold: 'wave', facing: 'marcus' }), { who: 'sis', at: 'sisB', to: 'sisHug', action: 'jog', face: 'hyped' }, marcus('marcus', 'hyped', { back: true, act: { g: [[40, 'palms']] } })], 0.1), sfx: GRASS },
  // his hand is still up
  { n: 4, frames: 34, spec: Q('nioClose', [nio('nio', [[0, 'shock'], [14, 'sheepish']], { hold: 'wave', facing: 'marcus' })], 0.12), sfx: GRASS },
  // two people on the bench look at his hand, then at each other, and smirk. Viewer: "they saw. He has to save it."
  { n: 5, frames: 40, spec: Q('bench', [sit('girl', 'benchA', [[0, 'neutral'], [20, 'suspicious']], { facing: 'nio' }), sit('cap', 'benchB', [[0, 'neutral'], [20, 'suspicious']], { facing: 'nio' })], 0.1), sfx: [...GRASS, ['sk_snort', 22, 0.5]] },
  // over her shoulder, Marcus sees Nio mid-wave: points, friendly, squinting
  { n: 6, frames: 40, spec: Q('marcus', [marcus('marcus', [[0, 'neutral'], [8, 'charm']], { facing: 'nioM', act: { g: [[6, 'point']] } }), st('sis', 'sisHug', 'charm', { facing: 'marcus', back: true })], 0.12), say: [L('wb10_01', 'marcus', 6)], sfx: GRASS },
  // Nio glances at the bench, lowers his hand, smooth: ...Four. Yeah.
  { n: 7, frames: 40, spec: Q('nioClose', [nio('nio', [[0, 'sheepish'], [10, 'neutral'], [18, 'charm']], { facing: 'marcus', gaze: [-0.7, 0] })], 0.08), say: [L('wb10_02', 'nio', 18)], sfx: GRASS },
  // Marcus, delighted, already tapping his phone
  { n: 8, frames: 40, spec: Q('marcus', [marcus('marcus', 'hyped', { hold: 'phone' }), st('sis', 'sisHug', 'charm', { facing: 'marcus', back: true })], 0.1), say: [L('wb10_03', 'marcus', 4)], sfx: GRASS },
  // Nio's phone lights up in his hand: Marcus added you to Lakeview Reunion
  { n: 9, frames: 44, img: 'pxi-ui/screens/push-lakeview.png', zoom: [1.15, 48], sfx: [['sk_ding', 4, 0.6]] },
  // 2. his room, that night, phone to his ear. On the screen: Maya.
  { n: 10, frames: 40, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', 'deadpan', { hold: 'phone', gaze: [0, 0.6] })], push: 0.08 }, say: [L('wb10_04', 'nio', 6)] },
  { n: 11, frames: 44, img: 'pxi-ui/screens/call-maya.png', zoom: [1.05, 40], say: [L('wb10_05', 'maya', 10)] },
  { n: 12, frames: 34, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', [[0, 'deadpan'], [8, 'crushed']], { hold: 'phone' })], push: 0.06 }, say: [L('wb10_06', 'nio', 10)] },
  // 3. Sunday. Marcus steers Nio in through the door: Guys! Nio! Cabin Four!
  { n: 13, frames: 25, spec: D('door', [{ who: 'nio', at: 'hall', to: 'door', action: 'walk', face: 'charm' }], 0.08), sfx: ROOM },
  { n: 13.5, frames: 40, spec: D('door', [nio('door', [[0, 'charm'], [20, 'uneasy']], { act: { g: [[4, 'shrug']] } })], 0.06), say: [L('wb10_07', 'marcus', 2)], sfx: ROOM },
  // the table cheers. Except Tobi, big, bearded, at the head, who stops chewing.
  { n: 14, frames: 36, spec: D('wide', table({ tobi: 'neutral', marcus: 'hyped', jade: 'hyped', dev: 'hyped', nio: 'charm' }, { marcus: { facing: 'nio' }, jade: { act: { g: [[2, 'fists']] } } }), 0.25), sfx: [...ROOM, ['sk_cheer', 0, 0.6]] },
  { n: 15, frames: 44, spec: D('mum', [sit('tobi', 'mum', [[0, 'neutral'], [10, 'deadpan']], { facing: 'nio' })], 0.08), say: [L('wb10_08', 'tobi', 14)], sfx: ROOM },
  // Nio, smiling, nodding, a beat too long
  { n: 16, frames: 44, spec: D('nio', [sit('nio', 'nio', [[0, 'uneasy'], [8, 'charm']], { facing: 'mum' })], 0.06), say: [L('wb10_09', 'nio', 10)], sfx: ROOM },
  // Tobi keeps staring. Viewer: "Tobi knows."
  { n: 17, frames: 30, spec: D('mum', [sit('tobi', 'mum', 'suspicious', { facing: 'nio' })], 0.14), sfx: ROOM },
  // Marcus props his phone up in the middle: the Lakeview album. Everyone leans in, pointing at themselves.
  { n: 18, frames: 44, img: 'pxi-ui/screens/camp-album.png', sfx: ROOM },
  { n: 19, frames: 30, spec: D('end', table({ tobi: 'suspicious', marcus: 'hyped', jade: 'hyped', dev: 'hyped', nio: 'uneasy' }, { marcus: { back: true }, jade: { act: { g: [[4, 'point']] } }, dev: { act: { g: [[8, 'point']] } } }), 0.1), sfx: [...ROOM, ['sk_cheer', 4, 0.3]] },
  // Tobi, low, slides the phone to him: Find yourself. Everyone turns to Nio.
  { n: 20, frames: 40, spec: D('mum', [sit('tobi', 'mum', 'deadpan', { facing: 'nio', act: { g: [[4, 'offer']] } })], 0.06), say: [L('wb10_10', 'tobi', 6)], sfx: ROOM },
  { n: 21, frames: 30, spec: D('nio', [sit('nio', 'nio', [[0, 'uneasy'], [16, 'neutral']], { hold: 'phone' })], 0.15), sfx: ROOM },
  // the face search: nothing. Silence.
  { n: 22, frames: 50, img: 'pxi-ui/screens/camp-noshots.png', zoom: [1.35, 30], tap: [[16, 540, 900]], sfx: [['oh_tap', 16, 0.8]] },
  { n: 23, frames: 40, spec: D('wide', table({ tobi: 'deadpan', nio: 'uneasy', marcus: 'neutral', jade: 'suspicious', dev: 'suspicious' }, { tobi: { hold: 'show-phone' }, marcus: { facing: 'nio' }, jade: { facing: 'nio' } }), 0.25) },
  // he stands, polite: Bathroom.
  { n: 24, frames: 30, spec: D('nio', [sit('nio', 'nio', [[0, 'uneasy'], [6, 'charm']], { act: { g: [[6, 'palms']] } })]), say: [L('wb10_11', 'nio', 6)] },
  // 4. the bathroom: he locks the door. A heavy knock.
  { n: 25, frames: 30, spec: W('door', [nio('door', 'uneasy', { back: true })]), sfx: [['oh_click', 12, 0.8]] },
  { n: 26, frames: 40, spec: W('win', [nio('mid', [[0, 'uneasy'], [8, 'shock']], { facing: 'door' })], 0.08), say: [L('wb10_12', 'tobi', 10)], sfx: [['ne_knock', 0, 0.9]] },
  // he looks at the tiny window: through it, the shed, the mower, the lake
  { n: 27, frames: 36, spec: W('up', [nio('loo', 'real', { back: true })], 0.1) },
  // out on the saggy shed roof
  { n: 28, frames: 30, spec: G('window', [nio('shedTop', [[0, 'charm'], [16, 'uneasy']], { gaze: [0, -0.6] })]), sfx: [['oh_creak', 8, 0.9]] },
  // it gives way: he crashes onto the mower seat, his foot on the pedal, and it roars off
  { n: 29, frames: 28, shake: [0, 2], spec: G('out', [sit('nio', 'r0', 'shock')], { shed: 'down' }), sfx: [['crash', 0, 0.9], ...MOW] },
  // the mower takes off with him on it: out of the shed
  { n: 30, frames: 22, spec: (f) => G('out', [{ ...onMower(f * RATE, 'shock'), back: undefined }], { shed: 'down', mower: f * RATE }), sfx: MOW },
  { n: 31, frames: 22, spec: (f) => G('side' + Math.round((2.6 + f * RATE) / 0.25), [{ ...onMower(2.6 + f * RATE, 'shock'), back: undefined }], { shed: 'down', mower: 2.6 + f * RATE }), sfx: MOW },
  // through the fence, across the neighbours' barbecue
  { n: 32, frames: 20, spec: (f) => { const d = 6.0 + f * RATE; return G('ahead' + Math.round(d / 0.25), [{ ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: d > 7.0 ? 'broken' : 'up', bbq: d > 9.3 ? 'down' : 'up' }); },
    sfx: [...MOW, ['crash', 6, 0.8], ['oh_bang', 17, 0.7]] },
  // past the LAKEVIEW sign, onto the jetty
  { n: 33, frames: 22, spec: (f) => { const d = 11.2 + f * RATE; return G('side' + Math.round(d / 0.25), [{ ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: 'broken', bbq: 'down' }); }, sfx: MOW },
  // down the jetty and off the end into the lake
  { n: 34, frames: 34, spec: (f) => { const d = Math.min(L0 + FLY, 17.4 + f * RATE); const sp = Math.max(0, (17.4 + f * RATE - L0 - FLY) / (RATE * 16));
    return G('jetty', [d >= L0 + FLY ? sit('nio', 'sunk', 'shock') : { ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: 'broken', bbq: 'down', splash: Math.min(0.999, sp) }); },
    sfx: [['sk_mower', 0, 0.8], ['sk_splash', 20, 0.95]] },
  // up at the window, the camp friends hear it and hold their phones up
  { n: 35, frames: 30, spec: D('window', [st('camp1', 'win1', 'shock', { hold: 'photo', back: true }), st('camp2', 'win2', 'shock', { hold: 'photo', back: true }), st('camp3', 'win3', 'shock', { hold: 'photo', back: true })], 0.15), sfx: [['shutter', 12, 0.6], ['shutter', 20, 0.5]] },
  // 5. soaked, on the half-sunk mower, his phone held above the water. It buzzes.
  { n: 36, frames: 34, spec: G('lake', [sit('nio', 'sunk', [[0, 'deadpan'], [16, 'neutral']], { hold: 'phone' })], { shed: 'down', mower: L0 + FLY, fence: 'broken', bbq: 'down' }, 0.12), sfx: [['sk_ding', 14, 0.6]] },
  { n: 37, frames: 36, img: 'pxi-ui/screens/push-photo1.png', zoom: [1.15, 48], tap: [[26, 540, 1020]], sfx: [['oh_tap', 26, 0.8]] },
  // the newest photo, posted by Marcus: Nio mid-air, mower and all, the LAKEVIEW sign behind him
  { n: 38, frames: 50, img: 'pxi-ui/screens/camp-found.png', zoom: [1.5, 28] },
  // a long beat. Then, quietly, to himself.
  { n: 39, frames: 50, spec: G('lake', [sit('nio', 'sunk', [[0, 'deadpan'], [20, 'charm']], { hold: 'phone', gaze: [0, -0.4] })], { shed: 'down', mower: L0 + FLY, fence: 'broken', bbq: 'down' }, 0.2), say: [L('wb10_13', 'nio', 22)] },
];
export const WAVE_BACK: SkitDef = { id: 'wave-back', shots, beds: [] };

// the photos in the Lakeview album and the one of Nio in the lake (tools/pxi/screens.py camp_album: out/skit-stills/wb9_*)
const PIC = (camera: string, actors: A[], o: CampusOpts = {}): Shot => ({ n: 0, frames: 1, spec: G(camera, actors, o, 0) });
export const WB_PICS: SkitDef = { id: 'wb-pics', beds: [], shots: [
  { ...PIC('jettyPic', [st('marcus', 'jA', 'hyped', { act: { g: [[0, 'arms-up']] } }), st('tobi', 'jB', 'charm'), st('camp1', 'jC', 'charm')]), n: 1 },
  { ...PIC('signPic', [st('camp2', 'sA', 'charm'), st('camp3', 'sB', 'hyped', { act: { g: [[0, 'point']] } })]), n: 2 },
  { ...PIC('shed', [sit('tobi', 'tobiMow', 'hyped')]), n: 3 },
  { ...PIC('back', []), n: 4 },
  { ...PIC('fromWin', [sit('nio', 'sunk', 'deadpan')], { shed: 'down', mower: L0 + FLY, fence: 'broken', bbq: 'down' }), n: 5 },
] };
