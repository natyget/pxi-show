// Nio's room: the furniture, the soft things, the lamps, and how a character is posed in it. Pure data and maths.
import { V, add, sub, mul, norm, cross, dot, lerp, len } from './vec';
import { Skel, Prim, Hand, sampleClip, solve, place, reach, lookAt, buildBody, shift, G } from './rig';
import { Face } from './face';
import { Scene3, Box, Obb, Cam3, Soft, Light } from './types';
import { Character, NIO_CHAR } from './characters';

// ---- the room (metres): 3.8 wide, 2.6 high, 4.4 deep. The window wall is z = 4.4. ----
// Positions are written as (s, y, z): s is the distance from the wall on the LEFT of the picture when you face
// the window. (World x runs the other way, so X(s) converts.)
export const ROOM: V = [3.8, 2.6, 4.4];
export const X = (s: number) => ROOM[0] - s;
export const P3 = (s: number, y: number, z: number): V => [X(s), y, z];
const B = (s: number, y: number, z: number, hx: number, hy: number, hz: number, col: string, obj: number, x: Partial<Box> = {}): Box => ({ c: P3(s, y, z), h: [hx, hy, hz], col, obj, ...x });
const WOOD = '#7a4638', WOOD_D = '#5e342c', WOOD_L = '#8f5540';
const LAMP_AT = P3(0.3, 0.6, 2.8);
export const ROOM_BOXES: Box[] = [
  // bed along the window wall, headboard on the left
  B(0.07, 0.56, 3.72, 0.05, 0.56, 0.64, WOOD, 3, { mat: 4 }),
  B(1.12, 0.13, 3.72, 1.0, 0.13, 0.6, WOOD_D, 1, { mat: 1 }),
  B(1.12, 0.33, 3.72, 0.98, 0.08, 0.58, '#cbb698', 2, { mat: 2 }),
  // nightstand with two drawers
  B(0.38, 0.29, 2.78, 0.3, 0.29, 0.24, WOOD, 4, { mat: 1 }), B(0.38, 0.575, 2.78, 0.32, 0.012, 0.26, WOOD_L, 4, { mat: 1 }),
  B(0.38, 0.42, 2.535, 0.25, 0.1, 0.006, WOOD_L, 5, { mat: 1 }), B(0.38, 0.17, 2.535, 0.25, 0.1, 0.006, WOOD_L, 6, { mat: 1 }),
  B(0.38, 0.42, 2.52, 0.025, 0.02, 0.012, '#3a221e', 7), B(0.38, 0.17, 2.52, 0.025, 0.02, 0.012, '#3a221e', 7),
  // books on the nightstand
  B(0.55, 0.605, 2.7, 0.1, 0.017, 0.07, '#8a3f3a', 8, { yaw: 8 }), B(0.55, 0.638, 2.7, 0.095, 0.015, 0.068, '#3f5f5c', 9, { yaw: -5 }), B(0.55, 0.668, 2.7, 0.09, 0.014, 0.065, '#b08a5c', 10, { yaw: 12 }),
  // window sill, curtains, rod
  B(1.95, 0.955, 4.34, 1.04, 0.022, 0.06, WOOD_L, 11, { mat: 1 }),
  B(0.8, 1.52, 4.35, 0.18, 0.76, 0.028, '#8a5a68', 12, { mat: 3 }), B(3.1, 1.52, 4.35, 0.18, 0.76, 0.028, '#8a5a68', 13, { mat: 3 }),
  B(1.95, 2.3, 4.36, 1.42, 0.014, 0.014, '#3a221e', 25),
  // dresser on the right, two drawers
  B(3.4, 0.4, 3.3, 0.32, 0.4, 0.5, WOOD, 14, { mat: 1 }), B(3.4, 0.81, 3.3, 0.34, 0.012, 0.52, WOOD_L, 14, { mat: 1 }),
  B(3.4, 0.58, 2.795, 0.27, 0.14, 0.006, WOOD_L, 15, { mat: 1 }), B(3.4, 0.22, 2.795, 0.27, 0.14, 0.006, WOOD_L, 16, { mat: 1 }),
  B(3.4, 0.58, 2.78, 0.025, 0.02, 0.012, '#3a221e', 17), B(3.4, 0.22, 2.78, 0.025, 0.02, 0.012, '#3a221e', 17),
  // a small screen on the dresser, a shelf with a clock and a frame
  B(3.52, 1.02, 3.55, 0.03, 0.17, 0.2, '#2c2126', 24), B(3.487, 1.02, 3.55, 0.004, 0.145, 0.175, '#3d4a66', 23, { glow: true }),
  B(3.3, 1.62, 4.31, 0.32, 0.014, 0.085, WOOD_L, 18, { mat: 1 }),
  B(3.12, 1.72, 4.32, 0.085, 0.085, 0.03, '#d9c7a4', 19), B(3.54, 1.71, 4.33, 0.055, 0.075, 0.02, WOOD_D, 20),
  B(3.3, 1.71, 4.33, 0.014, 0.075, 0.05, '#8a3f3a', 30), B(3.332, 1.7, 4.33, 0.013, 0.066, 0.05, '#3f5f5c', 31), B(3.37, 1.705, 4.33, 0.016, 0.07, 0.05, '#b08a5c', 32, { yaw: 8 }),
  // the desk near the front, laptop open
  B(3.42, 0.72, 1.3, 0.34, 0.02, 0.5, WOOD, 21, { mat: 1 }),
  ...[[-0.3, -0.45], [0.3, -0.45], [-0.3, 0.45], [0.3, 0.45]].map(([a, b]) => B(3.42 + a, 0.35, 1.3 + b, 0.02, 0.35, 0.02, WOOD_D, 21)),
  B(3.4, 0.748, 1.3, 0.11, 0.008, 0.16, '#2c2126', 22), B(3.53, 0.86, 1.3, 0.008, 0.11, 0.16, '#2c2126', 22), B(3.521, 0.86, 1.3, 0.002, 0.095, 0.145, '#7f62a8', 26, { glow: true }),
  // the small things that make it his: slippers by the bed, a mug and a note, books, a basket of clothes, a backpack
  B(0.98, 0.03, 2.98, 0.045, 0.03, 0.11, '#cdb89a', 27, { yaw: 12 }), B(1.11, 0.03, 2.97, 0.045, 0.03, 0.11, '#cdb89a', 27, { yaw: -6 }),
  B(0.2, 0.628, 2.62, 0.032, 0.04, 0.032, '#d9c7a4', 28), B(0.44, 0.59, 2.61, 0.07, 0.003, 0.05, '#e4d8c0', 29, { yaw: 15 }),
  B(3.28, 0.84, 3.64, 0.09, 0.016, 0.065, '#5a4a6e', 33, { yaw: 10 }), B(3.28, 0.871, 3.64, 0.08, 0.014, 0.06, '#8a5a3c', 34, { yaw: -8 }),
  B(3.52, 0.17, 2.48, 0.16, 0.17, 0.16, '#8a6a4a', 39, { mat: 4 }), B(3.52, 0.365, 2.48, 0.13, 0.03, 0.13, '#6c5466', 40, { mat: 2, yaw: 9 }),
  B(3.5, 0.2, 0.52, 0.14, 0.2, 0.1, '#4f4660', 35, { mat: 2, yaw: 15 }), B(3.4, 0.13, 0.44, 0.09, 0.09, 0.03, '#5d5470', 36, { mat: 2, yaw: 15 }),
  // on the desk and the shelf above it: a pencil cup, a book, three more books, an instant camera
  B(3.62, 0.79, 0.95, 0.03, 0.05, 0.03, '#7c3f35', 37), B(3.3, 0.752, 1.62, 0.1, 0.012, 0.07, '#3f5f5c', 38, { yaw: -12 }),
  B(3.69, 1.28, 1.3, 0.1, 0.012, 0.32, WOOD_L, 41, { mat: 1 }),
  B(3.71, 1.372, 1.08, 0.07, 0.08, 0.014, '#8a3f3a', 42), B(3.71, 1.362, 1.112, 0.07, 0.07, 0.013, '#b08a5c', 43), B(3.71, 1.377, 1.146, 0.07, 0.085, 0.016, '#4f4660', 44),
  B(3.7, 1.335, 1.46, 0.045, 0.04, 0.06, '#d9c7a4', 45), B(3.652, 1.34, 1.46, 0.006, 0.022, 0.022, '#2c2126', 46),
];
const cp = (a: V, ra: number, b: V, rb: number, g: number, c: string, k: number, x: Partial<Prim> = {}): Prim => ({ a, ra, b, rb, g, k, c, ...x });
const plant = (at: V, n: number, seed: number, pot: string): Soft => {
  const prims: Prim[] = [cp(at, 0.05, add(at, [0, 0.1, 0]), 0.04, 0, pot, 0.01, { cutA: true, cutB: true, tex: 1 })];
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + seed, r = 0.11 + 0.05 * ((i * 7 + seed * 3) % 3), up = 0.13 + 0.05 * ((i * 5) % 3);
    prims.push(cp(add(at, [0, 0.1, 0]), 0.012, add(at, [Math.cos(a) * r, 0.1 + up, Math.sin(a) * r]), 0.036, 1, i % 2 ? '#56693c' : '#687848', 0.012, { tex: 1 })); }
  return { prims, origin: at };
};
const candle = (at: V): Soft => ({ origin: at, prims: [
  cp(at, 0.028, add(at, [0, 0.1, 0]), 0.028, 0, '#e6d5b2', 0.004, { cutA: true, cutB: true, em: 0.35 }),
  cp(add(at, [0, 0.112, 0]), 0.014, add(at, [0, 0.14, 0]), 0.005, 1, '#ffd27a', 0.004, { em: 1 }) ] });
export const ROOM_SOFTS: Soft[] = [
  // pillows
  { origin: P3(0.4, 0.5, 3.7), prims: [
    cp(P3(0.44, 0.49, 3.32), 0.14, P3(0.44, 0.49, 4.1), 0.14, 0, '#d8c6a6', 0.05, { sq: 1.7, tex: 1 }),
    cp(P3(0.3, 0.62, 3.42), 0.12, P3(0.3, 0.62, 4.0), 0.12, 1, '#e4d5b8', 0.05, { sq: 1.5, tex: 1 }) ] },
  // the duvet: fat soft ridges, one edge hanging over the front of the bed, the top folded back
  { origin: P3(1.5, 0.45, 3.7), prims: [
    ...[0.98, 1.32, 1.66, 2.0].map((s, i) => cp(P3(s, 0.44 + (i % 2) * 0.012, 3.24), 0.17, P3(s, 0.44, 4.18), 0.17, 0, '#6f5169', 0.09, { sq: 1.6, tex: 2 })),
    cp(P3(0.9, 0.3, 3.13), 0.15, P3(2.08, 0.3, 3.13), 0.15, 0, '#6f5169', 0.09, { tex: 2 }),
    cp(P3(0.8, 0.5, 3.24), 0.07, P3(0.8, 0.5, 4.18), 0.07, 1, '#8c6c84', 0.03, { tex: 2 }) ] },
  // bedside lamp
  { origin: LAMP_AT, prims: [
    cp(LAMP_AT, 0.07, add(LAMP_AT, [0, 0.02, 0]), 0.07, 0, '#3a221e', 0.004, { cutA: true, cutB: true }),
    cp(LAMP_AT, 0.013, add(LAMP_AT, [0, 0.22, 0]), 0.013, 0, '#3a221e', 0.004),
    cp(add(LAMP_AT, [0, 0.19, 0]), 0.145, add(LAMP_AT, [0, 0.41, 0]), 0.09, 1, '#f2b25c', 0.004, { cutA: true, cutB: true, em: 1 }) ] },
  plant(P3(2.3, 0.98, 4.33), 6, 1, '#7c3f35'), candle(P3(2.68, 0.98, 4.33)),
  plant(P3(3.48, 0.822, 3.2), 8, 2, '#7c3f35'), candle(P3(3.25, 0.822, 2.95)),
];
export const ROOM_LIGHTS: Light[] = [
  { p: add(LAMP_AT, [0, 0.32, 0]), r: 1.15, col: [1.35, 1.02, 0.5], halo: 0.2 }, // the bedside lamp is always light 0
  { p: P3(3.25, 0.99, 2.95), r: 0.5, col: [0.85, 0.5, 0.2], halo: 0.085 },
  { p: P3(2.68, 1.15, 4.3), r: 0.42, col: [0.8, 0.48, 0.2], halo: 0.085 },
  { p: P3(1.0, 2.3, 4.2), r: 0.75, col: [0.5, 0.33, 0.15] }, { p: P3(2.8, 2.3, 4.2), r: 0.75, col: [0.5, 0.33, 0.15] },
  { p: P3(1.95, 1.6, 4.15), r: 1.5, col: [0.14, 0.17, 0.3] },
];
export const AMB: V = [0.35, 0.36, 0.45], AMB_CHAR: V = [0.88, 0.82, 0.86];

// ---- the party: the same room on the night of the party. The big light is on, fairy lights hang along the curtain
// rod and down the wall by the bed, there are cups on every surface, a speaker on the dresser, a pizza box and a
// coat on the bed. Bright, so every face in a photo reads. ----
const bulbCols = ['#ffd890', '#ff9fb8', '#ffd890', '#86dccf', '#ffd890', '#c39bff'];
const bulbs = (pts: V[]): Prim[] => pts.map((p, i) => cp(p, 0.019, add(p, [0, -0.012, 0]), 0.016, 1, bulbCols[i % bulbCols.length], 0.002, { em: 1 }));
const swag = (s0: number, s1: number, y: number, z: number, sag: number, n: number): V[] =>
  Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return P3(s0 + (s1 - s0) * t, y - sag * 4 * t * (1 - t), z); });
const partyCup = (p: V): Prim[] => [cp(p, 0.03, add(p, [0, 0.105, 0]), 0.037, 0, '#b4473c', 0.004, { cutA: true, cutB: true, tex: 1 }),
  cp(add(p, [0, 0.1, 0]), 0.0385, add(p, [0, 0.11, 0]), 0.0385, 1, '#e6d9c0', 0.002, { cutA: true, cutB: true })];
export const PARTY_BOXES: Box[] = [
  ...ROOM_BOXES,
  // the speaker on the dresser, its light strip on
  B(3.36, 0.912, 3.38, 0.06, 0.09, 0.1, '#2c2630', 50), B(3.297, 0.88, 3.38, 0.003, 0.012, 0.075, '#86dccf', 51, { glow: true }),
  // a pizza box on the bed
  B(1.62, 0.575, 3.62, 0.19, 0.022, 0.19, '#c9a36b', 52, { yaw: 14 }),
];
export const PARTY_SOFTS: Soft[] = [
  ...ROOM_SOFTS,
  { origin: P3(1.95, 2.1, 4.2), prims: bulbs([...swag(0.62, 1.95, 2.28, 4.3, 0.16, 9), ...swag(1.95, 3.28, 2.28, 4.3, 0.16, 9).slice(1)]) },
  { origin: P3(0.05, 1.7, 3.7), prims: bulbs(Array.from({ length: 8 }, (_, i) => P3(0.05, 1.74 - 0.06 * Math.abs(Math.sin(i * 0.9)), 3.12 + i * 0.16))) },
  // the cups, and a coat thrown on the bed
  { origin: P3(2.5, 0.8, 2.5), prims: [
    ...partyCup(P3(3.25, 0.74, 1.0)), ...partyCup(P3(3.55, 0.74, 1.62)), ...partyCup(P3(3.18, 0.822, 3.02)), ...partyCup(P3(3.58, 0.822, 2.92)),
    ...partyCup(P3(1.5, 0.977, 4.31)), ...partyCup(P3(1.68, 0.977, 4.29)), ...partyCup(P3(0.5, 0.587, 2.9)),
    cp(P3(2.62, 0.035, 2.02), 0.03, P3(2.72, 0.04, 2.1), 0.037, 0, '#b4473c', 0.004, { cutA: true, cutB: true, tex: 1 }),
    cp(P3(0.8, 0.6, 3.85), 0.09, P3(1.2, 0.6, 3.95), 0.08, 1, '#4d5f7a', 0.05, { sq: 2.2, tex: 2 }),
    cp(P3(1.05, 0.6, 3.6), 0.05, P3(1.3, 0.58, 3.45), 0.045, 1, '#4d5f7a', 0.05, { sq: 1.8, tex: 2 }) ] },
];
const CEIL = P3(1.9, 2.3, 2.2);
export const PARTY_LIGHTS: Light[] = [
  ROOM_LIGHTS[0], // the bedside lamp stays light 0
  { p: CEIL, r: 3.2, col: [0.5, 0.45, 0.38] }, // the big light
  { p: P3(1.3, 2.1, 4.15), r: 0.95, col: [0.5, 0.38, 0.2] }, { p: P3(2.6, 2.1, 4.15), r: 0.95, col: [0.5, 0.38, 0.2] }, // the fairy lights
  { p: P3(0.25, 1.65, 3.6), r: 0.8, col: [0.45, 0.3, 0.2] },
  { p: P3(0.3, 1.7, 1.4), r: 1.5, col: [0.32, 0.12, 0.24] }, // a pink wash by the door, a teal one from the speaker
  { p: P3(3.2, 1.0, 3.38), r: 1.3, col: [0.08, 0.26, 0.24] },
  ROOM_LIGHTS[1], ROOM_LIGHTS[2],
];
export const PARTY_AMB: V = [0.56, 0.52, 0.58], PARTY_AMB_CHAR: V = [0.97, 0.92, 0.95];

// ---- posing ----
// pose: a named way of holding the arms (see HOLDS in world.ts). lift: stand on something this high (metres).
export type Act = { who?: Character; clip: string; t: number; at: [number, number]; yaw: number; face: Face;
  stance?: number; arms?: number; upright?: number; seat?: number; phone?: number; hold?: number[]; crossed?: boolean; look?: V; lookAmt?: number; outfit?: string;
  pose?: string; lift?: number;
  thumb?: [number, number, number]; // where his thumb is on the glass: across and up it (-1..1), and how far lifted (0 pressed, 1 off)
  lens?: boolean }; // set by the selfie camera: this is the picture his own phone takes (see phoneCam) // where his thumb is on the glass: across and up it (-1..1), and how far lifted (0 pressed, 1 off)
// Turn a vector round an axis (radians).
const rot = (v: V, k: V, a: number): V => add(add(mul(v, Math.cos(a)), mul(cross(k, v), Math.sin(a))), mul(k, dot(k, v) * (1 - Math.cos(a))));
// The party cup: red, a little wider at the top, a cream rim and something dark in it. Its own surface, so it is inked
// where the hand meets it.
const cup = (c: V): Prim[] => [
  { a: add(c, [0, -0.055, 0]), ra: 0.03, b: add(c, [0, 0.05, 0]), rb: 0.037, g: G.shoe, k: 0.004, c: '#b4473c', cutA: true, cutB: true, tex: 1 },
  { a: add(c, [0, 0.047, 0]), ra: 0.0385, b: add(c, [0, 0.057, 0]), rb: 0.0385, g: G.shoe, k: 0.002, c: '#e6d9c0', cutA: true, cutB: true },
  { a: add(c, [0, 0.055, 0]), ra: 0.031, b: add(c, [0, 0.0585, 0]), rb: 0.031, g: G.shoe, k: 0.001, c: '#4a2a26', cutA: true, cutB: true },
];
// The phone, in the show's proportion: half its width, height and thickness (metres).
export const PHONE_H: V = [0.035, 0.0718, 0.0055];
// A hand holding a phone, built in the phone's own frame (u across the glass toward the thumb side, v up it, w out of
// it). The phone lies in the palm; four fingers wrap round the far edge so their tips show on the front; the thumb comes
// over the near edge onto the glass. The fingers alternate between the two skin surfaces, so an ink line parts each one
// from the next, like a drawn hand. Same skin, same line, same light as the rest of him: one hand in every shot.
const ik2 = (base: V, tip: V, a: number, b: number, pole: V): V => {
  const to = sub(tip, base), d = Math.max(Math.abs(a - b) + 0.001, Math.min(a + b - 0.0005, len(to))), n = norm(to);
  const x = (a * a - b * b + d * d) / (2 * d), r = Math.sqrt(Math.max(0, a * a - x * x));
  return add(add(base, mul(n, x)), mul(norm(sub(pole, mul(n, dot(pole, n)))), r));
};
export const gripHand = (pc: V, x: V, y: V, z: V, skin: string, th: [number, number, number] = [0.35, -0.3, 0]): Prim[] => {
  const [W, H, D] = PHONE_H;
  const L = (u: number, v: number, w: number): V => add(pc, add(mul(x, u), add(mul(y, v), mul(z, w))));
  const c = (a: V, ra: number, b: V, rb: number, g: number, k = 0.003): Prim => ({ a, ra, b, rb, g, k, c: skin });
  const out: Prim[] = [
    // the palm, flat behind the lower half: two capsules side by side, melting into the wrist
    c(L(0.026, -0.1, -D - 0.017), 0.015, L(0.018, -0.042, -D - 0.014), 0.0155, G.skin, 0.012),
    c(L(0.006, -0.096, -D - 0.018), 0.014, L(-0.002, -0.044, -D - 0.014), 0.0155, G.skin, 0.012),
  ];
  [[-0.026, 0.0082], [-0.042, 0.0086], [-0.058, 0.0082], [-0.073, 0.0072]].forEach(([v, r], i) => {
    const g = i % 2 ? G.skin : G.skinB;
    const kn = L(0.004 - i * 0.003, v, -D - 0.012), mid = L(-W + 0.006, v + 0.004, -D - 0.006), tip = L(-W - 0.0015, v + 0.007, D - 0.0005 - i * 0.0005);
    out.push(c(kn, r, mid, r, g), c(mid, r, tip, r * 0.9, g));
  });
  // the thumb: two joints, its tip wherever it is on the glass (as far as a thumb reaches)
  const base = L(W - 0.003, -0.062, -D - 0.004), tgt = L(th[0] * W * 0.85, th[1] * H * 0.9, D + 0.0085 + th[2] * 0.016);
  const joint = ik2(base, tgt, 0.026, 0.05, add(x, add(mul(y, -0.5), mul(z, 0.9)))); // the knuckle arches up off the glass
  out.push(c(base, 0.0098, joint, 0.009, G.skinB, 0.004), c(joint, 0.009, tgt, 0.008, G.skinB, 0.004));
  return out;
};
// Where the phone's lenses and his eyes are, for the cameras that look through them (see phoneCam).
export type PhoneAt = { c: V; x: V; y: V; z: V; eye: V };
export const pose = (a: Act) => {
  const ch = a.who ?? NIO_CHAR, P = ch.body, nm = a.pose ?? '';
  let s: Skel = place(solve(sampleClip(a.clip, a.t), P, { stance: a.stance ?? 1, arms: a.arms ?? 1, upright: a.upright ?? 0, seat: a.seat }), [X(a.at[0]), a.at[1]], a.yaw);
  if (a.lift) { s = { ...s, sh: [...s.sh], el: [...s.el], wr: [...s.wr], tip: [...s.tip], thumb: [...s.thumb], hip: [...s.hip], kn: [...s.kn], an: [...s.an], toe: [...s.toe] } as Skel; shift(s, [0, a.lift, 0]); }
  const props: Obb[] = []; const lights: Light[] = []; const extra: Prim[] = []; const hands: [Hand?, Hand?] = []; let phoneAt: PhoneAt | undefined;
  if (a.look) s = lookAt(s, a.look, a.lookAmt ?? 1, P);
  const fwd = norm(cross(s.side, s.chestDir)), UP: V = [0, 1, 0];
  const out = (i: 0 | 1) => mul(s.side, i === 0 ? 1 : -1); // away from the body, on that side. 0 is his left, 1 his right.
  const A = (i: 0 | 1, f: number, u: number, o: number): V => add(s.sh[i], add(mul(fwd, f), add(mul(UP, u), mul(out(i), o)))); // from that shoulder
  // a straight arm from that shoulder in a direction (forward, up, out), whatever the arm's length
  const straight = (i: 0 | 1, f: number, u: number, o: number): V => add(s.sh[i], mul(norm(add(mul(fwd, f), add(mul(UP, u), mul(out(i), o)))), (P.upperArm + P.foreArm) * 1.02));
  const crossed = a.crossed || nm === 'arms-crossed';
  if (crossed) {
    // Folded arms, placed by hand: both elbows forward of the ribs, both forearms level across the chest. His left
    // forearm lies on top with its hand on the right arm; the right hand tucks under the left elbow.
    const o = sub(s.neckBase, mul(s.chestDir, 0.05));
    const at = (x: number, y: number, f: number): V => add(o, add(mul(s.side, x), add(mul(s.chestDir, y), mul(fwd, f))));
    const c: Skel = { ...s, el: [...s.el] as any, wr: [...s.wr] as any, tip: [...s.tip] as any, thumb: [...s.thumb] as any };
    c.el[0] = at(0.17, -0.2, 0.14); c.wr[0] = at(-0.045, -0.168, 0.212); c.tip[0] = at(-0.118, -0.14, 0.2); c.thumb[0] = at(-0.06, -0.128, 0.205);
    c.el[1] = at(-0.17, -0.2, 0.14); c.wr[1] = at(0.05, -0.222, 0.182); c.tip[1] = at(0.118, -0.212, 0.158); c.thumb[1] = at(0.075, -0.19, 0.172);
    s = c;
  }
  const ph = nm === 'phone' || nm === 'selfie' || nm === 'photo' ? 1 : a.phone ?? 0;
  if (ph > 0.01) {
    // the phone floats where his eyes can read it; the hand is placed BEHIND it and the thumb comes round the front
    const body = norm([s.headFw[0], 0, s.headFw[2]]), rt = norm(cross([0, 1, 0], body));
    // `hold` = how far in front of the neck, how far to his right, and how far below it (metres)
    // A selfie: the arm straight, the phone up and out to his right at arm's length, and he looks right into it.
    // A photo: the phone up at eye height in front of him, the glass upright, so the back lens looks where he looks.
    // Seen from the selfie lens itself, the phone goes out to where a real arm would put it on a real-sized head (the
    // show's heads are big), the arm reaches out of the frame to it, and the phone and hand are behind the lens.
    const lens = nm === 'selfie' && a.lens;
    const hd = lens ? [0.74, 0.52, -0.38] : nm === 'selfie' ? [0.36, 0.38, -0.2] : nm === 'photo' ? [0.38, 0.03, -0.24] : a.hold ?? [0.25, 0.06, 0.09];
    const pc = add(s.neckBase, add(mul(body, hd[0]), add(mul(rt, -hd[1]), [0, -hd[2], 0])));
    s = lookAt(s, pc, (nm === 'selfie' ? 0.8 : nm === 'photo' ? 0.5 : 0.35) * ph, P);
    // the glass faces his eyes, and its sides stay square to his shoulders however flat he holds it
    const z = norm(sub(add(s.headC, mul(s.headFw, 0.1)), pc)), hr = mul(rt, -1), x = norm(sub(hr, mul(z, dot(hr, z)))), y = cross(z, x);
    const wr = add(pc, add(mul(x, 0.022), add(mul(y, -0.122), mul(z, -PHONE_H[2] - 0.02))));
    const held = reach(s, 1, wr, add(mul(rt, -1), [0, -0.6, 0]), lens ? { ...P, upperArm: P.upperArm * 1.95, foreArm: P.foreArm * 1.95 } : P, add(y, mul(z, 0.12)), add(mul(x, -0.2), add(mul(y, 0.62), mul(z, 0.76))));
    const mixS: any = { ...s };
    (['el', 'wr', 'tip', 'thumb'] as const).forEach((k) => { mixS[k] = [s[k][0], lerp(s[k][1], held[k][1], ph)]; });
    s = mixS;
    if (lens) { hands[1] = 'none'; phoneAt = { c: pc, x, y, z, eye: [0, 0, 0] }; }
    else if (ph > 0.6) {
      props.push({ c: pc, x, y, z, h: PHONE_H, col: '#241a1e', screen: '#a523ef' });
      lights.push({ p: add(pc, mul(z, 0.05)), r: 0.2, col: [0.3, 0.12, 0.5] });
      extra.push(...gripHand(pc, x, y, z, ch.skin, a.thumb)); hands[1] = 'none'; phoneAt = { c: pc, x, y, z, eye: [0, 0, 0] };
    }
  }
  // ---- the other holds. Each puts the hands exactly where they must be with the same two-bone reach as the phone. ----
  if (nm === 'show-phone') {
    // the phone held out at shoulder height, the screen turned to whoever he is showing: the camera, or the other person
    const pc = A(1, 0.42, 0.02, -0.06), z = norm(add(fwd, [0, 0.12, 0])), x0 = s.side, x = norm(sub(x0, mul(z, dot(x0, z)))), y = cross(z, x);
    s = reach(s, 1, add(pc, add(mul(x, 0.022), add(mul(y, -0.122), mul(z, -PHONE_H[2] - 0.02)))), add(out(1), [0, -1, 0]), P, y, x);
    props.push({ c: pc, x, y, z, h: PHONE_H, col: '#241a1e', screen: '#a523ef' });
    extra.push(...gripHand(pc, x, y, z, ch.skin, a.thumb ?? [0.95, -0.35, 0.6])); hands[1] = 'none'; phoneAt = { c: pc, x, y, z, eye: [0, 0, 0] }; // the thumb on the edge, off the glass
    lights.push({ p: add(pc, mul(z, 0.06)), r: 0.22, col: [0.3, 0.12, 0.5] });
  }
  if (nm === 'phone-knee') {
    // sitting, the phone lies face up on his right knee (a call on speaker)
    const o0 = ch.wardrobe[a.outfit ?? ch.outfit], w = o0.bottom ? P.legR + 0.03 + o0.bottom.width * 0.6 : P.legR;
    const th = sub(s.kn[1], s.hip[1]), y = norm([th[0], 0, th[2]]), z = UP, x = cross(y, z);
    const pc = add(lerp(s.hip[1], s.kn[1], 0.8), [0, w + 0.008, 0]);
    s = lookAt(s, pc, 0.55, P); // he looks down at it
    props.push({ c: pc, x, y, z, h: PHONE_H, col: '#241a1e', screen: '#a523ef' });
    lights.push({ p: add(pc, [0, 0.07, 0]), r: 0.2, col: [0.3, 0.12, 0.5] }); phoneAt = { c: pc, x, y, z, eye: [0, 0, 0] };
  }
  if (nm === 'arm-up') { s = reach(s, 1, straight(1, 0.06, 0.47, 0.2), add(out(1), mul(fwd, -0.4)), P, UP, fwd); hands[1] = 'fist'; }
  if (nm === 'arms-up') for (const i of [0, 1] as const) s = reach(s, i, straight(i, 0.08, 0.44, 0.3), add(out(i), [0, -0.4, 0]), P, norm(add(UP, mul(out(i), 0.5))), fwd);
  // pointing: the right arm straight out in front, a little high, the first finger out
  if (nm === 'point') { s = reach(s, 1, A(1, 0.42, 0.08, 0.04), add(out(1), [0, -1, 0]), P, norm(add(fwd, [0, 0.12, 0])), UP); hands[1] = 'point'; }
  const held = nm === 'cup' ? 0 : nm === 'cup-point' ? 1 : -1;
  if (held >= 0) {
    // the cup in one hand: the hand round its outside, fingers across the front, thumb over the top edge.
    // cup: in his left hand at the waist. cup-point: held out in the right hand, to point with.
    const i = held as 0 | 1, c = held === 0 ? A(0, 0.2, -0.24, -0.04) : A(1, 0.36, -0.02, 0.0);
    const wr = add(c, add(mul(out(i), 0.058), mul(fwd, -0.024)));
    s = reach(s, i, wr, add(out(i), [0, -1, 0]), P, norm(add(mul(fwd, 0.8), mul(out(i), -0.6))), norm(add(UP, mul(out(i), -0.5))));
    extra.push(...cup(c));
  }
  if (nm === 'spinner') {
    // a fidget spinner on the right fingertips in front of the belly, spinning: three lobes round a hub
    const c = add(add(s.hips, mul(s.chestDir, 0.16)), add(mul(fwd, P.torsoR + 0.16), mul(out(1), 0.06)));
    s = reach(s, 1, add(c, add(mul(fwd, -0.06), [0, -0.025, 0])), add(out(1), [0, -1, 0]), P, fwd, UP); hands[1] = 'fist';
    s = lookAt(s, c, 0.5, P);
    const sx = norm(cross(UP, fwd)), sp = (a.t ?? 0) * 0.9;
    extra.push({ a: c, ra: 0.012, b: c, rb: 0.012, g: G.shoe, k: 0.004, c: '#d8d4cc' });
    for (let k = 0; k < 3; k++) { const ang = sp + (k * 2 * Math.PI) / 3, q = add(c, add(mul(sx, Math.cos(ang) * 0.03), mul(fwd, Math.sin(ang) * 0.03)));
      extra.push({ a: c, ra: 0.01, b: q, rb: 0.016, g: G.shoe, k: 0.008, c: '#2f8fc4', sq: 2.5 }); }
  }
  if (nm === 'sweep') {
    // crouched, both hands flat on the floor in front, slow circles, one each way (the move in The Move). The circle
    // keeps the club's beat: one round every two beats at 124 a minute.
    const ft = lerp(s.an[0], s.an[1], 0.5), fh = norm([fwd[0], 0, fwd[2]]), sw = ((a.t ?? 0) / 24) * (124 / 60) * Math.PI;
    for (const i of [0, 1] as const) {
      const c = add(add(ft, mul(fh, 0.36)), add(mul(out(i), 0.15), [0, 0.04 + (a.lift ?? 0), 0]));
      s = reach(s, i, add(c, add(mul(out(i), 0.1 * Math.cos(sw)), mul(fh, 0.1 * Math.sin(sw)))), add(out(i), [0, 0.6, 0]), P, fh, mul(out(i), -1));
    }
    s = lookAt(s, add(ft, add(mul(fh, 0.6), [0, 0.25 + (a.lift ?? 0), 0])), 0.4, P); // eyes on the floor, the face still to the front
  }
  if (nm === 'asleep') {
    // asleep sitting up: the head drops forward and rolls onto one shoulder
    const fw = rot(s.headFw, s.headRt, 0.26), up = rot(rot(s.headUp, s.headRt, 0.26), fw, -0.52), rt = cross(up, fw);
    s = { ...s, headUp: up, headFw: fw, headRt: rt, headC: add(s.neckBase, mul(up, P.neck + P.headR * 0.8)) };
  }
  const o = ch.wardrobe[a.outfit ?? ch.outfit];
  const prims = [...buildBody(s, P, ch.skin, o, crossed ? 0 : undefined, hands), ...extra];
  const hk = ch.head ?? {};
  if (ch.earrings) for (const sd of [1, -1]) {
    // a small hoop hanging from each ear lobe: a ring of short capsules, its own surface so it is inked
    const w = hk.width ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const R = 0.03, cy = -0.164, cx = sd * (0.226 * w), N = 8;
    for (let k = 0; k < N; k++) { const a0 = (k / N) * 6.283, a1 = ((k + 1) / N) * 6.283;
      prims.push({ a: at(cx, cy + Math.cos(a0) * R, -0.005 + Math.sin(a0) * R), ra: 0.0062, b: at(cx, cy + Math.cos(a1) * R, -0.005 + Math.sin(a1) * R), rb: 0.0062, g: G.shoe, k: 0.004, c: ch.earrings }); }
  }
  if (hk.glasses) {
    // small round glasses: a wire ring round each eye just off the face, a bridge, and an arm back to each ear. Its own
    // surface, so it is inked.
    const w = hk.width ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const R = 0.045 * (hk.eyes ?? 1) / 0.55, cy = -0.058, cz = 0.196, N = 12, t = 0.0035, wire = (a: V, b: V) => prims.push({ a, ra: t, b, rb: t, g: G.shoe, k: 0.003, c: hk.glasses! });
    for (const sd of [1, -1]) {
      const cx = sd * 0.083;
      for (let k = 0; k < N; k++) { const a0 = (k / N) * 6.283, a1 = ((k + 1) / N) * 6.283;
        wire(at(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, cz - 0.012 * Math.abs(Math.cos(a0))), at(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, cz - 0.012 * Math.abs(Math.cos(a1)))); }
      const ox = cx + sd * R;
      wire(at(ox, cy + 0.008, cz - 0.012), at(sd * 0.212 * w, cy + 0.004, 0.13)); wire(at(sd * 0.212 * w, cy + 0.004, 0.13), at(sd * 0.226 * w, cy - 0.01, 0.0));
    }
    wire(at(0.083 - R, cy + 0.01, cz - 0.006), at(0, cy + 0.022, cz + 0.004)); wire(at(0, cy + 0.022, cz + 0.004), at(-0.083 + R, cy + 0.01, cz - 0.006));
  }
  if (ch.beard) {
    // a long beard: full along the jaw and under the chin (the mouth stays clear), then one soft mass that hangs down
    // the front of the body to the belt, narrowing to a point. Hair, so one surface with the hair on his head.
    const w = hk.width ?? 1, ck = hk.chin ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const bf = norm(cross(s.side, s.chestDir)), bd = (c: V, r: number, c2: V, r2: number) => prims.push({ a: c, ra: r, b: c2, rb: r2, g: G.hair, k: 0.03, c: ch.beard!, tex: 1 });
    for (const sd of [1, -1]) bd(at(sd * 0.165 * w, -0.08, 0.03), 0.045, at(sd * 0.1 * w, -0.2 * ck, 0.09), 0.06);
    const chin = at(0, -0.235 * ck, 0.08), r0 = P.torsoR + 0.025;
    const p1 = add(add(s.neckBase, mul(s.chestDir, -0.1)), mul(bf, r0 + 0.04)), p2 = add(add(s.hips, mul(s.chestDir, 0.2)), mul(bf, r0 + 0.035));
    const p3 = add(add(s.hips, mul(s.chestDir, 0.02)), mul(bf, r0 + 0.03));
    bd(chin, 0.075, p1, 0.07); bd(p1, 0.07, p2, 0.058); bd(p2, 0.058, p3, 0.026);
  }
  if (ch.crown) {
    // a crown of small flowers, round the head at the top of the forehead, each its own colour, with a few leaves
    const at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const N = 12, w = hk.width ?? 1;
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * 6.283, c = at(Math.sin(a0) * 0.235 * w, 0.2 - 0.04 * Math.cos(a0), Math.cos(a0) * 0.215 - 0.03);
      const leaf = k % 3 === 2; prims.push({ a: c, ra: leaf ? 0.022 : 0.036, b: c, rb: leaf ? 0.022 : 0.036, g: G.shoe, k: 0.006, c: leaf ? '#5d8a4a' : ch.crown[k % ch.crown.length] });
    }
  }
  const soft: Soft = { character: true, origin: s.hips, prims,
    head: { c: s.headC, rt: s.headRt, up: s.headUp, fw: s.headFw, face: a.face, skin: ch.skin, hairA: ch.hairA, hairB: ch.hairB, blobs: ch.hair,
      build: [hk.lashes ?? 0, hk.width ?? 1, hk.chin ?? 1, hk.curls ?? 0, hk.eyes ?? 1] } };
  const mid = lerp(s.an[0], s.an[1], 0.5);
  const shadows = a.seat === undefined ? [[mid[0], mid[2], 0.2, 0.3]] : [];
  if (phoneAt) phoneAt.eye = add(s.headC, add(mul(s.headFw, P.headR * 1.35), mul(s.headUp, P.headR * 0.12))); // just in front of his eyes
  return { soft, props, lights, shadows, phone: phoneAt };
};
// The cameras that come from a person holding a phone, made from where the phone is in this frame.
//  pov: through his own eyes, down at the phone in his hand (his thumb on the glass).
//  insert: close on the phone in his hand, from over his shoulder on the phone side.
//  lens: the phone's back camera, what a photo he takes sees. selfie: the front camera, looking back at him.
export const phoneCam = (kind: string, ph: PhoneAt): Cam3 => {
  const [W, H, D] = PHONE_H, { c, x, y, z } = ph;
  if (kind === 'pov') return { pos: ph.eye, at: add(c, mul(y, -0.03)), fov: 46, up: y };
  if (kind === 'insert') {
    // his own screen (the glass faces his eyes): from just past his right cheek, over the hand. A screen he holds out to
    // someone: straight on, from where they stand.
    const own = dot(sub(ph.eye, c), z) > 0.15;
    const d = own ? norm(add(mul(z, 0.55), add(mul(x, 0.72), mul(y, 0.22)))) : norm(add(z, mul(y, 0.08)));
    return { pos: add(c, mul(d, own ? 0.46 : 0.36)), at: add(c, mul(y, -0.025)), fov: 26, up: norm(add(y, mul(x, own ? -0.1 : 0))) };
  }
  if (kind === 'lens') { const p = add(c, add(mul(z, -D - 0.003), add(mul(y, H - 0.012), mul(x, -W + 0.012)))); return { pos: p, at: add(p, mul(z, -1)), fov: 62, up: y }; }
  if (kind === 'selfie') { const p = add(c, add(mul(z, D + 0.003), mul(y, H - 0.008))); return { pos: p, at: add(p, z), fov: 66, up: y }; }
  throw new Error('no phone camera "' + kind + '"');
};
// The studio: a plain mauve backdrop with flat light, for model sheets.
// cam: a camera, or [kind, actor index] for one of the phone cameras above.
export type CamArg = Cam3 | [string, number];
export const camOf = (cam: CamArg, ps: ReturnType<typeof pose>[]): Cam3 => {
  if (!Array.isArray(cam)) return cam;
  const ph = ps[cam[1]]?.phone; if (!ph) throw new Error(`camera "${cam[0]}" needs actor ${cam[1]} to be holding a phone`);
  return phoneCam(cam[0], ph);
};
export const lensActs = (cam: CamArg, acts: Act[]) => (Array.isArray(cam) && cam[0] === 'selfie' ? acts.map((a, i) => (i === cam[1] ? { ...a, lens: true } : a)) : acts);
export const studioShot = (camA: CamArg, acts: Act[]): Scene3 => {
  const ps = lensActs(camA, acts).map(pose), cam = camOf(camA, ps);
  return { cam, room: ROOM, amb: [0.94, 0.94, 0.94], ambChar: [0.97, 0.94, 0.95], boxes: [], studio: true,
    softs: ps.map((p) => p.soft), lights: [{ p: P3(1.2, 2.3, 0.6), r: 3, col: [0.08, 0.07, 0.06] }, ...ps.flatMap((p) => p.lights)],
    props: ps.flatMap((p) => p.props), shadows: ps.flatMap((p) => p.shadows) };
};
// dress: 'party' for the night of the party. flash: a photo taken with the flash on, so every face is lit from the lens.
export const shot = (camA: CamArg, acts: Act[], time = 0, dress?: string, flash?: boolean): Scene3 => {
  const ps = lensActs(camA, acts).map(pose), party = dress === 'party', cam = camOf(camA, ps);
  const fl: Light[] = flash ? [{ p: cam.pos, r: 2.4, col: [0.42, 0.42, 0.44] }] : [];
  return { cam, room: ROOM, amb: party ? PARTY_AMB : AMB, ambChar: party ? PARTY_AMB_CHAR : AMB_CHAR, boxes: party ? PARTY_BOXES : ROOM_BOXES, time,
    softs: [...ps.map((p) => p.soft), ...(party ? PARTY_SOFTS : ROOM_SOFTS)], lights: [...(party ? PARTY_LIGHTS : ROOM_LIGHTS), ...fl, ...ps.flatMap((p) => p.lights)],
    props: ps.flatMap((p) => p.props), shadows: ps.flatMap((p) => p.shadows) };
};

// ---- cameras, written in the same (s, y, z) as the room ----
export const C = (ps: V, at: V, fov: number): Cam3 => ({ pos: P3(...ps), at: P3(...at), fov });
export const CAMS: Record<string, Cam3> = {
  land: C([1.75, 1.15, 0.08], [1.75, 0.8, 4.4], 39),
  wide: C([2.75, 1.4, 0.3], [1.6, 0.9, 3.6], 54),
  full: C([2.0, 0.9, 0.12], [2.0, 0.8, 2.5], 46),
  mid: C([2.3, 1.25, 0.9], [2.0, 1.1, 2.5], 36),
  close: C([2.3, 1.38, 1.3], [2.0, 1.33, 2.5], 30),
  low: C([1.4, 0.35, 1.35], [2.0, 1.0, 2.5], 50),
  side: C([0.6, 1.1, 2.0], [2.0, 0.85, 2.5], 44),
  high: C([3.3, 2.35, 0.5], [1.9, 0.4, 2.9], 52),
  bed: C([2.0, 0.95, 0.35], [1.6, 0.7, 3.1], 44),
  head: C([2.3, 1.44, 1.25], [2.0, 1.43, 2.5], 33),
  face: C([2.3, 1.43, 1.25], [2.0, 1.41, 2.5], 27),
};
