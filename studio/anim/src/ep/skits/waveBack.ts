// WAVE BACK v9 (writers' room, Nov 18: /mnt/project-files/nio-soul/skits/v9/scripts.md). Model: The Money, a lie held
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
  // 1. the quad. A guy across the grass waves big. Nio waves back, big.
  { n: 1, frames: 36, spec: Q('marcus', [marcus('marcus', 'hyped', { hold: 'wave' })], 0.25), sfx: GRASS },
  { n: 2, frames: 44, spec: Q('nio', [nio('nio', 'hyped', { hold: 'wave', facing: 'marcus' }), st('sis', 'sis', 'charm', { hold: 'wave', facing: 'marcus' })], 0.2), sfx: GRASS },
  // 2. the girl right behind him was the one being waved at. She jogs off. The floor drops.
  { n: 3, frames: 52, spec: Q('nio', [nio('nio', [[0, 'shock'], [22, 'sheepish'], [38, 'uneasy']], { hold: 'wave', facing: 'marcus' }), { who: 'sis', at: 'sis', to: 'sisFar', action: 'jog', face: 'charm' }]), sfx: GRASS },
  // Marcus is already walking over, with two friends, smiling, a bit unsure
  { n: 4, frames: 56, spec: Q('come', [{ who: 'marcus', at: 'mW', to: 'marcusN', action: 'walk', face: 'charm' },
    { who: 'tobi', at: 'f1W', to: 'f1N', action: 'walk', face: 'neutral' }, { who: 'camp2', at: 'f2W', to: 'f2N', action: 'walk', face: 'neutral' }], 0.1), sfx: GRASS },
  // 3. Hold on, I know him. Camp, right?
  { n: 5, frames: 20, spec: Q('grp', [marcus('marcusN', 'charm', { facing: 'nio', gaze: [-0.7, 0] }), st('tobi', 'f1N', 'neutral', { facing: 'nio' }), st('camp2', 'f2N', 'neutral', { facing: 'nio' })]), say: [L('wb9_01', 'marcus', 2)], sfx: GRASS },
  { n: 6, frames: 20, spec: Q('grp', [marcus('marcusN', 'hyped', { facing: 'nio', act: { g: [[2, 'point']] } }), st('tobi', 'f1N', 'neutral', { facing: 'nio' }), st('camp2', 'f2N', 'neutral', { facing: 'nio' })]), say: [L('wb9_02', 'marcus', 2)], sfx: GRASS },
  // everyone is looking at him; if he says no, Marcus looks stupid in front of his boys
  { n: 7, frames: 20, spec: Q('nioG', [nio('nio', [[0, 'uneasy'], [14, 'charm']], { facing: 'marcusN' })]), say: [L('wb9_03', 'nio', 14)], sfx: GRASS },
  { n: 8, frames: 20, spec: Q('grp', [marcus('marcusN', 'hyped', { facing: 'nio' }), st('tobi', 'f1N', 'charm', { facing: 'nio' }), st('camp2', 'f2N', 'neutral', { facing: 'nio' })]), say: [L('wb9_04', 'marcus', 2)], sfx: GRASS },
  { n: 9, frames: 20, spec: Q('nioG', [nio('nio', 'charm', { facing: 'marcusN' })]), say: [L('wb9_05', 'nio', 4)], sfx: GRASS },
  { n: 10, frames: 20, spec: Q('grp', [marcus('marcusN', 'hyped', { facing: 'nio', act: { g: [[2, 'point']] } }), st('tobi', 'f1N', 'charm', { facing: 'nio' }), st('camp2', 'f2N', 'charm', { facing: 'nio' })]), say: [L('wb9_06', 'marcus', 2)], sfx: GRASS },
  { n: 11, frames: 20, spec: Q('nioG', [nio('nio', [[0, 'charm'], [10, 'hyped']], { facing: 'marcusN', act: { g: [[10, 'point']] } })]), say: [L('wb9_07', 'nio', 4)], sfx: GRASS },
  // 4. a reunion dinner Sunday; his thumb taps his phone
  { n: 12, frames: 20, spec: Q('grp', [marcus('marcusN', 'hyped', { facing: 'nio', hold: 'phone' }), st('tobi', 'f1N', 'charm', { facing: 'nio' }), st('camp2', 'f2N', 'charm', { facing: 'nio' })]), say: [L('wb9_08', 'marcus', 2)], sfx: GRASS },
  // Nio's phone lights up in his hand: Marcus added you to Lakeview Reunion
  { n: 13, frames: 40, img: 'pxi-ui/screens/push-lakeview.png', zoom: [1.15, 48], sfx: [['sk_ding', 4, 0.6]] },
  { n: 14, frames: 20, spec: Q('nioG', [nio('nio', [[0, 'deadpan'], [12, 'charm']], { facing: 'marcusN', hold: 'phone' })]), say: [L('wb9_09', 'nio', 12)], sfx: GRASS },
  // 5. that night: on the edge of his bed, Maya on speaker
  { n: 15, frames: 20, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', 'uneasy', { hold: 'phone' })], push: 0.08 }, say: [L('wb9_10', 'nio', 6)] },
  { n: 16, frames: 20, spec: { set: 'livingDay', camera: 'couch', frames: 1, actors: [sit('maya', 'couch', 'suspicious', { hold: 'phone' })], push: 0.08 }, say: [L('wb9_11', 'maya', 4)] },
  { n: 17, frames: 20, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', 'real', { hold: 'phone' })], push: 0.06 }, say: [L('wb9_12', 'nio', 2)] },
  { n: 18, frames: 20, spec: { set: 'livingDay', camera: 'couch', frames: 1, actors: [sit('maya', 'couch', 'suspicious', { hold: 'phone' })] }, say: [L('wb9_13', 'maya', 2)] },
  { n: 19, frames: 20, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', [[0, 'neutral'], [12, 'real'], [40, 'neutral']], { hold: 'phone' })], push: 0.14 }, say: [L('wb9_14', 'nio', 2)] },
  { n: 20, frames: 20, spec: { set: 'livingDay', camera: 'couch', frames: 1, actors: [sit('maya', 'couch', 'deadpan', { hold: 'phone' })], push: 0.1 }, say: [L('wb9_15', 'maya', 6)] },
  // he stares at the ceiling
  { n: 21, frames: 20, spec: { set: 'nioRoom', camera: 'bed', frames: 1, actors: [sit('nio', 'bedEdge', [[0, 'deadpan'], [14, 'real']], { gaze: [0, 0.7] })], push: 0.1 }, say: [L('wb9_16', 'nio', 12)] },
  // 6. Sunday: the reunion, six round the table, the garden and the camp lake through the window
  { n: 22, frames: 20, spec: D('wide', table({ tobi: 'hyped', nio: 'charm' }, { tobi: { facing: 'marcus', act: { g: [[6, 'arms-up']] } } }), 0.3), say: [L('wb9_17', 'tobi', 4)], sfx: ROOM },
  // everyone cheers; Nio a beat late
  { n: 23, frames: 32, spec: D('end', table({ tobi: 'hyped', marcus: 'hyped', jade: 'hyped', dev: 'hyped', nio: [[0, 'neutral'], [12, 'hyped']] }, { marcus: { back: true } }), 0.15), sfx: [...ROOM, ['sk_cheer', 0, 0.6]] },
  // Marcus props his phone in the middle: the Lakeview album
  { n: 24, frames: 40, img: 'pxi-ui/screens/camp-album.png', sfx: ROOM },
  { n: 25, frames: 20, spec: D('jade', [sit('camp1', 'jade', [[0, 'charm'], [8, 'suspicious']], { facing: 'nio' })]), say: [L('wb9_18', 'camp1', 6)], sfx: ROOM },
  { n: 26, frames: 20, spec: D('marcus', [sit('marcus', 'marcus', 'hyped', { facing: 'nio', act: { g: [[4, 'point']] } })]), say: [L('wb9_19', 'marcus', 2)], sfx: ROOM },
  // they all look at him. Cornered, he taps it on his own phone.
  { n: 27, frames: 30, spec: D('nio', [sit('nio', 'nio', [[0, 'uneasy'], [16, 'neutral']], { hold: 'phone' })], 0.15), sfx: ROOM },
  { n: 28, frames: 48, img: 'pxi-ui/screens/camp-noshots.png', zoom: [1.35, 30], tap: [[16, 540, 900]], sfx: [['oh_tap', 16, 0.8], ...ROOM] },
  // 7. behind the camera
  { n: 29, frames: 20, spec: D('nio', [sit('nio', 'nio', 'charm', { gaze: [0.5, 0.1], act: { g: [[6, 'offer']] } })]), say: [L('wb9_20', 'nio', 2)], sfx: ROOM },
  { n: 30, frames: 20, spec: D('marcus', [sit('marcus', 'marcus', 'neutral', { facing: 'nio' })]), say: [L('wb9_21', 'marcus', 2)], sfx: ROOM },
  { n: 31, frames: 20, spec: D('nio', [sit('nio', 'nio', [[0, 'deadpan'], [14, 'charm']], { gaze: [0.5, 0.1] })]), say: [L('wb9_22', 'nio', 14)], sfx: ROOM },
  { n: 32, frames: 20, spec: D('dev', [sit('camp2', 'sisSeat', 'suspicious', { facing: 'nio' })]), say: [L('wb9_23', 'camp2', 4)], sfx: ROOM },
  { n: 33, frames: 20, spec: D('nio', [sit('nio', 'nio', 'charm', { gaze: [0.6, 0.15] })]), say: [L('wb9_24', 'nio', 4)], sfx: ROOM },
  { n: 34, frames: 20, spec: D('dev', [sit('camp2', 'sisSeat', 'deadpan', { facing: 'nio' })], 0.2), say: [L('wb9_25', 'camp2', 8)], sfx: ROOM },
  // a long silence; everyone looks at Nio
  { n: 35, frames: 40, spec: D('wide', table({ tobi: 'neutral', nio: 'uneasy', marcus: 'neutral', jade: 'suspicious', dev: 'deadpan' }, { marcus: { facing: 'nio' }, jade: { facing: 'nio' } }), 0.25), sfx: ROOM },
  { n: 36, frames: 20, spec: D('nio', [sit('nio', 'nio', [[0, 'uneasy'], [10, 'charm']], { gaze: [0.5, 0.1] })]), say: [L('wb9_26', 'nio', 10)], sfx: ROOM },
  // 8. the bathroom: he bolts the door. A knock.
  { n: 37, frames: 30, spec: W('door', [nio('door', 'uneasy', { back: true })]), sfx: [['oh_click', 12, 0.8]] },
  { n: 38, frames: 20, spec: W('win', [nio('mid', [[0, 'uneasy'], [8, 'shock']], { facing: 'door' })], 0.08), say: [L('wb9_27', 'marcus', 6)], sfx: [['ne_knock', 0, 0.8], ['sk_walla', 30, 0.25]] },
  // footsteps, more voices down the hall. He looks at the tiny window.
  { n: 39, frames: 36, spec: W('up', [nio('loo', 'real', { back: true })], 0.1), sfx: [['ne_steps', 0, 0.6], ['sk_walla', 0, 0.3]] },
  // out on the saggy shed roof, under the window
  { n: 40, frames: 30, spec: G('window', [nio('shedTop', [[0, 'charm'], [16, 'uneasy']], { gaze: [0, -0.6] })]), sfx: [['oh_creak', 8, 0.9]] },
  // Tobi, under that roof, revving the mower for the Lakeview lap
  { n: 41, frames: 26, spec: G('shed', [sit('tobi', 'tobiMow', 'hyped', { act: { g: [[4, 'arms-up']] } })]), sfx: MOW },
  // the roof gives way: Nio on the mower, Tobi off it
  { n: 42, frames: 28, shake: [0, 2], spec: G('out', [sit('nio', 'r0', 'shock'), st('tobi', 'tobiOff', 'shock', { gaze: [0.7, 0] })], { shed: 'down' }), sfx: [['crash', 0, 0.9], ...MOW] },
  // the mower takes off with him on it: out of the shed
  { n: 43, frames: 22, spec: (f) => G('out', [{ ...onMower(f * RATE, 'shock'), back: undefined }], { shed: 'down', mower: f * RATE }), sfx: MOW },
  { n: 44, frames: 22, spec: (f) => G('side' + Math.round((2.6 + f * RATE) / 0.25), [{ ...onMower(2.6 + f * RATE, 'shock'), back: undefined }], { shed: 'down', mower: 2.6 + f * RATE }), sfx: MOW },
  // through the fence, across the neighbours' barbecue
  { n: 45, frames: 20, spec: (f) => { const d = 6.0 + f * RATE; return G('ahead' + Math.round(d / 0.25), [{ ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: d > 7.0 ? 'broken' : 'up', bbq: d > 9.3 ? 'down' : 'up' }); },
    sfx: [...MOW, ['crash', 6, 0.8], ['oh_bang', 17, 0.7]] },
  // past the LAKEVIEW sign, onto the jetty
  { n: 46, frames: 22, spec: (f) => { const d = 11.2 + f * RATE; return G('side' + Math.round(d / 0.25), [{ ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: 'broken', bbq: 'down' }); }, sfx: MOW },
  // down the jetty and off the end into the lake
  { n: 47, frames: 34, spec: (f) => { const d = Math.min(L0 + FLY, 17.4 + f * RATE); const sp = Math.max(0, (17.4 + f * RATE - L0 - FLY) / (RATE * 16));
    return G('jetty', [d >= L0 + FLY ? sit('nio', 'sunk', 'shock') : { ...onMower(d, 'shock'), back: undefined }], { shed: 'down', mower: d, fence: 'broken', bbq: 'down', splash: Math.min(0.999, sp) }); },
    sfx: [['sk_mower', 0, 0.8], ['sk_splash', 20, 0.95]] },
  // up at the window, the camp friends hear it and hold their phones up
  { n: 48, frames: 30, spec: D('window', [st('camp1', 'win1', 'shock', { hold: 'photo', back: true }), st('camp2', 'win2', 'shock', { hold: 'photo', back: true }), st('camp3', 'win3', 'shock', { hold: 'photo', back: true })], 0.15), sfx: [['shutter', 12, 0.6], ['shutter', 20, 0.5]] },
  // 9. soaked, on the mower, in the lake. His phone buzzes.
  { n: 49, frames: 34, spec: G('lake', [sit('nio', 'sunk', [[0, 'deadpan'], [16, 'neutral']], { hold: 'phone' })], { shed: 'down', mower: L0 + FLY, fence: 'broken', bbq: 'down' }, 0.12), sfx: [['sk_ding', 14, 0.6]] },
  { n: 50, frames: 36, img: 'pxi-ui/screens/push-photo1.png', zoom: [1.15, 48], tap: [[26, 540, 1020]], sfx: [['oh_tap', 26, 0.8]] },
  { n: 51, frames: 44, img: 'pxi-ui/screens/camp-found.png', zoom: [1.5, 28] },
  { n: 52, frames: 36, spec: G('lake', [sit('nio', 'sunk', 'deadpan', { hold: 'phone' })], { shed: 'down', mower: L0 + FLY, fence: 'broken', bbq: 'down' }, 0.2) },
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
