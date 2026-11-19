// Nio's room: the furniture, the soft things, the lamps, and how a character is posed in it. Pure data and maths.
import { V, add, sub, mul, norm, cross, dot, lerp, len } from './vec';
import { Skel, Prim, Hand, sampleClip, solve, place, reach, lookAt, buildBody, shift, G } from './rig';
import { Face } from './face';
import { Scene3, Box, Obb, Cam3, Soft, Light } from './types';
import { Character, NIO_CHAR } from './characters';
import { Perf, Gesture } from './acting';

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
// ---- the living room (founder, Nov 18: "his aparmnet got a bathroom and living room ... the apartment should look and
// feel like the bedroom aesthetics wise"): the same walls, window, curtains, wood and lamps as his bedroom, with a sofa
// under the window where the bed was, the dresser as a TV stand, no bed, no laptop, no laundry. Dressed for the party. ----
const NOT_LIVING = new Set([1, 2, 3, 22, 26, 27, 39, 40, 52, 23, 24]);
export const sofa = (lift = 0): Soft => {
  const col = '#5f7464', dk = '#46584c', L = lift;
  return { origin: P3(1.15, 0.3 + L, 3.85), prims: [
    cp(P3(0.42, 0.17 + L, 3.86), 0.19, P3(1.88, 0.17 + L, 3.86), 0.19, 0, dk, 0.03, { sq: 1.3, tex: 2 }), // the base
    cp(P3(0.45, 0.38 + L, 3.8), 0.2, P3(1.85, 0.38 + L, 3.8), 0.2, 1, col, 0.05, { sq: 1.9, tex: 2 }), // the seat cushions
    cp(P3(0.45, 0.66 + L, 4.12), 0.16, P3(1.85, 0.66 + L, 4.12), 0.16, 1, col, 0.06, { tex: 2 }), // the back
    ...[0.24, 2.06].map((s0) => cp(P3(s0, 0.42 + L, 3.62), 0.11, P3(s0, 0.44 + L, 4.12), 0.11, 1, dk, 0.04, { tex: 2 })), // the arms
    cp(P3(0.62, 0.6 + L, 3.98), 0.11, P3(0.68, 0.64 + L, 4.0), 0.1, 1, '#b07a8a', 0.03, { sq: 1.4, tex: 2 }), // a cushion
    cp(P3(1.7, 0.6 + L, 3.98), 0.1, P3(1.64, 0.64 + L, 4.0), 0.1, 1, '#c9a36b', 0.03, { sq: 1.4, tex: 2 }),
  ] };
};
export const LIVING_BOXES: Box[] = [
  ...PARTY_BOXES.filter((b) => !NOT_LIVING.has(b.obj)),
  B(3.56, 1.16, 3.4, 0.03, 0.26, 0.42, '#2c2126', 24), B(3.527, 1.16, 3.4, 0.004, 0.235, 0.39, '#3d4a66', 23, { glow: true }), // the TV on the dresser
  B(1.6, 0.34, 3.38, 0.4, 0.02, 0.15, WOOD, 53, { mat: 1 }), ...[[-0.36, -0.12], [0.36, -0.12], [-0.36, 0.12], [0.36, 0.12]].map(([a, b]) => B(1.6 + a, 0.16, 3.38 + b, 0.02, 0.16, 0.02, WOOD_D, 53)), // the coffee table, in front of the sofa
  B(1.45, 0.38, 3.38, 0.14, 0.022, 0.14, '#c9a36b', 52, { yaw: 14 }), // the pizza box, on the coffee table
];
const LIVING_SOFTS: Soft[] = [...PARTY_SOFTS.filter((sf, i) => i >= 2 && sf !== PARTY_SOFTS[PARTY_SOFTS.length - 1]), { ...PARTY_SOFTS[PARTY_SOFTS.length - 1], prims: PARTY_SOFTS[PARTY_SOFTS.length - 1].prims.slice(0, -2) }];
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
  stance?: number; arms?: number; upright?: number; seat?: number; phone?: number; glow?: number; hold?: number[]; crossed?: boolean; look?: V; lookAmt?: number; outfit?: string;
  pose?: string; lift?: number;
  tiptoe?: number; // up on his toes this high (metres): the body rises, the toes stay on the floor (Theo walking off tall)
  hand?: number; // which hand a sip or sniff uses (0 his left, 1 his right): the one away from the camera keeps the face clear
  wear?: string[]; // costume pieces on top of the outfit (WEAR in world.ts): bowtie, monocle, tophat, sideburns
  clipT?: number; // the clip frame the body is drawn from, when it differs from the shot's time (a held pose: see acting.ts)
  perf?: Perf; // the acting pass for this frame (acting.ts): lean, head, shoulders, the hands' gesture
  reachTo?: V; // a point in the world the hold's hand goes to (set by the set: Prof H's fingers on the flyer)
  thumb?: [number, number, number]; // where his thumb is on the glass: across and up it (-1..1), and how far lifted (0 pressed, 1 off)
  lens?: boolean }; // set by the selfie camera: this is the picture his own phone takes (see phoneCam) // where his thumb is on the glass: across and up it (-1..1), and how far lifted (0 pressed, 1 off)
// Turn a vector round an axis (radians).
const rot = (v: V, k: V, a: number): V => add(add(mul(v, Math.cos(a)), mul(cross(k, v), Math.sin(a))), mul(k, dot(k, v) * (1 - Math.cos(a))));
// Lean the upper body forward from the hips (radians): the spine, the head, the arms all go with it.
const leanFwd = (s: Skel, a: number): Skel => {
  const P = (p: V) => add(s.hips, rot(sub(p, s.hips), s.side, a)), D = (d: V) => rot(d, s.side, a), two = (q: [V, V]): [V, V] => [P(q[0]), P(q[1])];
  return { ...s, neckBase: P(s.neckBase), chestDir: D(s.chestDir), headC: P(s.headC), headUp: D(s.headUp), headFw: D(s.headFw), headRt: D(s.headRt),
    sh: two(s.sh), el: two(s.el), wr: two(s.wr), tip: two(s.tip), thumb: two(s.thumb) };
};
// The party cup: red, a little wider at the top, a cream rim and something dark in it. Its own surface, so it is inked
// where the hand meets it.
// the same cup along any axis (bottom to rim), for a cup at the lips
const cupAx = (c: V, ax: V): Prim[] => [
  { a: add(c, mul(ax, -0.055)), ra: 0.03, b: add(c, mul(ax, 0.05)), rb: 0.037, g: G.shoe, k: 0.004, c: '#b4473c', cutA: true, cutB: true, tex: 1 },
  { a: add(c, mul(ax, 0.047)), ra: 0.0385, b: add(c, mul(ax, 0.057)), rb: 0.0385, g: G.shoe, k: 0.002, c: '#e6d9c0', cutA: true, cutB: true },
];
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
// The hair under a cap: every lock above the cap's band is pulled inside its dome (k = 1), and springs back as the cap
// comes off (k down to 0). Locks below the band, a ponytail out of the back, are left as they are.
const underCap = (hair: number[][], k: number): number[][] => k <= 0 ? hair : hair.map((b) => {
  const o = [...b];
  for (let j = 0; j < b.length; j += 4) {
    const x = b[j], y = b[j + 1] - 0.04, z = b[j + 2], r = b[j + 3], d = Math.hypot(x, y, z), Rm = 0.205;
    if (y < 0 || d + r <= Rm) continue;
    const r2 = Math.max(0.012, Math.min(r, Rm * 0.45)), d2 = Math.min(d, Rm - r2), f = d > 1e-6 ? d2 / d : 1;
    o[j] = x + (x * f - x) * k; o[j + 1] = b[j + 1] + (y * f - y) * k; o[j + 2] = z + (z * f - z) * k; o[j + 3] = r + (r2 - r) * k;
  }
  return o;
});
export const pose = (a: Act) => {
  const ch = a.who ?? NIO_CHAR, P = ch.body, nm = a.pose ?? '';
  let s: Skel = place(solve(sampleClip(a.clip, a.clipT ?? a.t), P, { stance: a.stance ?? 1, arms: a.arms ?? 1, upright: a.upright ?? 0, seat: a.seat }), [X(a.at[0]), a.at[1]], a.yaw);
  if (a.lift) { s = { ...s, sh: [...s.sh], el: [...s.el], wr: [...s.wr], tip: [...s.tip], thumb: [...s.thumb], hip: [...s.hip], kn: [...s.kn], an: [...s.an], toe: [...s.toe] } as Skel; shift(s, [0, a.lift, 0]); }
  if (a.tiptoe) { const toe = s.toe.map((t) => [...t]); s = { ...s, sh: [...s.sh], el: [...s.el], wr: [...s.wr], tip: [...s.tip], thumb: [...s.thumb], hip: [...s.hip], kn: [...s.kn], an: [...s.an], toe: [...s.toe] } as Skel; shift(s, [0, a.tiptoe, 0]); s.toe = toe as typeof s.toe; }
  const props: Obb[] = []; const lights: Light[] = []; const extra: Prim[] = []; const hands: [Hand?, Hand?] = []; let phoneAt: PhoneAt | undefined;
  if (a.look) s = lookAt(s, a.look, a.lookAmt ?? 1, P);
  const fwd = norm(cross(s.side, s.chestDir)), UP: V = [0, 1, 0];
  const pf = a.perf;
  if (pf) {
    // THE ACTING PASS (acting.ts). The attitude first, so every hold below attaches to the body as it now sits.
    if (pf.lean) s = leanFwd(s, pf.lean);
    if (pf.shoulders) { const d: V = [0, pf.shoulders, 0], up2 = (q: [V, V]): [V, V] => [add(q[0], d), add(q[1], d)];
      s = { ...s, sh: up2(s.sh), el: up2(s.el), wr: up2(s.wr), tip: up2(s.tip), thumb: up2(s.thumb) }; }
  }
  const out = (i: 0 | 1) => mul(s.side, i === 0 ? 1 : -1); // away from the body, on that side. 0 is his left, 1 his right.
  const A = (i: 0 | 1, f: number, u: number, o: number): V => add(s.sh[i], add(mul(fwd, f), add(mul(UP, u), mul(out(i), o)))); // from that shoulder
  // a straight arm from that shoulder in a direction (forward, up, out), whatever the arm's length
  const straight = (i: 0 | 1, f: number, u: number, o: number): V => add(s.sh[i], mul(norm(add(mul(fwd, f), add(mul(UP, u), mul(out(i), o)))), (P.upperArm + P.foreArm) * 1.02));
  if (pf && pf.hands && !nm && !a.crossed && !(a.phone ?? 0)) {
    // the hands: a blend from the last gesture to this one. amt overshoots past 1 and settles, the cartoon snap.
    const f2 = norm(cross(s.side, s.chestDir)), o2 = (i: 0 | 1) => mul(s.side, i === 0 ? 1 : -1);
    const At = (i: 0 | 1, f: number, u: number, o: number): V => add(s.sh[i], add(mul(f2, f), add(mul(UP, u), mul(o2(i), o))));
    const down = (i: 0 | 1) => add(o2(i), [0, -1, 0]);
    const gest = (g: Gesture): [Skel, [Hand?, Hand?]] => {
      let b = s; const h: [Hand?, Hand?] = [];
      if (g === 'offer') b = reach(b, 1, At(1, 0.3, -0.2, 0.1), down(1), P, norm(add(f2, mul(o2(1), 0.4))), o2(1));
      if (g === 'palms') for (const i of [0, 1] as const) b = reach(b, i, At(i, 0.26, -0.06, 0.16), down(i), P, UP, f2);
      if (g === 'shrug') for (const i of [0, 1] as const) b = reach(b, i, At(i, 0.16, -0.28, 0.22), down(i), P, norm(add(o2(i), mul(f2, 0.5))), UP);
      if (g === 'chest') b = reach(b, 1, add(add(s.neckBase, mul(s.chestDir, -0.17)), add(mul(f2, P.torsoR + 0.05), mul(s.side, 0.0))), down(1), P, s.side, UP);
      if (g === 'dismiss') b = reach(b, 1, At(1, 0.2, 0.0, 0.18), down(1), P, norm(add(UP, mul(o2(1), 0.3))), mul(f2, -1));
      if (g === 'fists') { for (const i of [0, 1] as const) b = reach(b, i, At(i, 0.24, -0.1, 0.08), down(i), P, UP, f2); h[0] = 'fist'; h[1] = 'fist'; }
      if (g === 'chin') { b = reach(b, 1, add(s.headC, add(mul(s.headUp, -0.3), mul(s.headFw, 0.1))), down(1), P, UP, mul(s.side, 1)); h[1] = 'fist'; }
      if (g === 'neck') b = reach(b, 1, add(s.neckBase, add(mul(UP, 0.0), add(mul(f2, -0.07), mul(o2(1), 0.07)))), add(o2(1), [0, 0.5, 0]), P, norm(add(mul(o2(1), -1), UP)), f2);
      if (g === 'point') { b = reach(b, 1, At(1, 0.42, 0.08, 0.04), down(1), P, norm(add(f2, [0, 0.12, 0])), UP); h[1] = 'point'; }
      return [b, h];
    };
    const [sa, ha] = gest(pf.from), [sb, hb] = pf.from === pf.to ? [sa, ha] : gest(pf.to), k = pf.from === pf.to ? 1 : pf.amt;
    const m: any = { ...s };
    (['el', 'wr', 'tip', 'thumb'] as const).forEach((q) => { m[q] = [lerp(sa[q][0], sb[q][0], k), lerp(sa[q][1], sb[q][1], k)]; });
    s = m; const hh = k >= 0.5 ? hb : ha; hands[0] = hh[0]; hands[1] = hh[1];
  }
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
      const g = a.glow ?? 0; // glow: the screen lights his face from below (0 the usual faint spill, 1 a face lit by it)
      lights.push({ p: add(pc, mul(z, 0.05 + 0.1 * g)), r: 0.2 + 0.6 * g, col: [0.3 + 0.9 * g, 0.12 + 0.22 * g, 0.5 + 1.3 * g] });
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
  if (nm === 'wave') { // the hand up by the head, open, the palm out, rocking side to side about twice a second
    const i = (a.hand ?? 1) as 0 | 1, sw = Math.sin((a.t / 24) * Math.PI * 4.4) * 0.07;
    s = reach(s, i, A(i, 0.2, 0.36, 0.36 + sw), add(out(i), [0, -1, 0]), P, norm(add(UP, mul(out(i), sw * 3))), fwd); hands[i] = 'open'; }
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
  if (nm === 'sip' || nm === 'sniff') {
    // the party cup at the face in his left hand. sip: tipped up, the rim on his lips. sniff: nearly upright, under his nose.
    const ang = nm === 'sip' ? 1.15 : 0.35, ax = norm(add(mul(s.headFw, -Math.sin(ang)), mul(s.headUp, Math.cos(ang))));
    const lip = add(s.headC, add(mul(s.headFw, P.headR * 1.02), mul(s.headUp, nm === 'sip' ? -P.headR * 0.78 : -P.headR * 0.95)));
    const c = sub(lip, mul(ax, 0.06));
    const i = (a.hand ?? 1) as 0 | 1, wr = add(c, add(mul(out(i), 0.05), add(mul(ax, -0.045), [0, -0.03, 0])));
    s = reach(s, i, wr, add(out(i), [0, -1.4, 0]), P, norm(add(mul(s.headFw, 0.3), mul(out(i), -0.9))), ax);
    extra.push(...cupAx(c, ax));
  }
  if (nm === 'juicebox' || nm === 'sipbox') {
    // a kid's juice box with a bendy straw. juicebox: held up at shoulder height in his right hand, the front turned
    // to whoever he shows it to. sipbox: at his lips, the straw in his mouth.
    const i = 1 as 0 | 1, sip = nm === 'sipbox';
    const lip = add(s.headC, add(mul(s.headFw, P.headR * 1.02), mul(s.headUp, -P.headR * 0.8)));
    const pc = sip ? add(lip, add(mul(s.headFw, 0.07), [0, -0.1, 0])) : A(1, 0.42, 0.02, -0.04);
    const z = sip ? norm(mul(s.side, -1)) : norm(add(fwd, [0, 0.12, 0])), x0 = s.side, x = sip ? norm(mul(s.headFw, -1)) : norm(sub(x0, mul(z, dot(x0, z)))), y = cross(z, x);
    const H: V = [0.05, 0.075, 0.03];
    props.push({ c: pc, x, y, z, h: H, col: '#f08a2a' });
    const top = add(pc, mul(y, H[1])), knee = add(top, mul(y, 0.05)), tipS = sip ? lip : add(knee, add(mul(x, -0.03), mul(y, 0.012)));
    extra.push({ a: add(top, mul(y, -0.01)), ra: 0.0045, b: knee, rb: 0.0045, g: G.shoe, k: 0.002, c: '#f4f1ea' }, { a: knee, ra: 0.0045, b: tipS, rb: 0.0045, g: G.shoe, k: 0.002, c: '#e85a8a' });
    extra.push({ a: add(pc, add(mul(z, H[2] + 0.003), mul(y, -0.02))), ra: 0.012, b: add(pc, add(mul(z, H[2] + 0.003), mul(y, 0.03))), rb: 0.012, g: G.shoe, k: 0.002, c: '#fbf6ee' }); // a white stripe down the front
    s = reach(s, i, add(pc, add(mul(x, sip ? 0 : 0.03), mul(y, -0.03))), add(out(i), [0, -1, 0]), P, y, sip ? norm(mul(out(i), -1)) : x); hands[i] = 'open';
  }
  if (nm === 'spinner') {
    // a fidget spinner on the right fingertips in front of the belly, spinning: three lobes round a hub
    // high enough, and the head bowed only a little, that his face stays to the room: his eyes do the looking down
    const c = add(add(s.hips, mul(s.chestDir, 0.24)), add(mul(fwd, P.torsoR + 0.17), mul(out(1), 0.06)));
    s = reach(s, 1, add(c, add(mul(fwd, -0.06), [0, -0.025, 0])), add(out(1), [0, -1, 0]), P, fwd, UP); hands[1] = 'fist';
    s = lookAt(s, c, 0.2, P);
    const sx = norm(cross(UP, fwd)), sp = (a.t ?? 0) * 0.9;
    extra.push({ a: c, ra: 0.012, b: c, rb: 0.012, g: G.shoe, k: 0.004, c: '#d8d4cc' });
    for (let k = 0; k < 3; k++) { const ang = sp + (k * 2 * Math.PI) / 3, q = add(c, add(mul(sx, Math.cos(ang) * 0.03), mul(fwd, Math.sin(ang) * 0.03)));
      extra.push({ a: c, ra: 0.01, b: q, rb: 0.016, g: G.shoe, k: 0.008, c: '#2f8fc4', sq: 2.5 }); }
  }
  // the cap comes off: still for 12 frames, then both hands lift it off the head and bring it down to the chest, crown
  // out, brim down, slowly, like at a funeral; the head bows a little as it lands
  let capAt: { c: V; up: V; fw: V; off: number } | undefined;
  if (nm === 'capOff' && ch.cap) {
    const t = a.t ?? 0, u = Math.min(1, Math.max(0, (t - 12) / 30)), e = u * u * (3 - 2 * u), hIn = Math.min(1, Math.max(0, (t - 4) / 8));
    // first straight up off the head, then turning as it comes down in front of her to the chest
    const c0 = add(s.headC, mul(s.headUp, 0.04)), cUp = add(c0, add(mul(UP, 0.13), mul(fwd, 0.04))), c1 = add(add(s.neckBase, mul(s.chestDir, -0.22)), mul(fwd, P.torsoR + 0.12));
    const e1 = Math.min(1, e / 0.35), e2 = Math.max(0, (e - 0.35) / 0.65), c = e2 > 0 ? lerp(cUp, c1, e2) : lerp(c0, cUp, e1);
    const up = norm(lerp(s.headUp, fwd, e2)), f0 = norm(lerp(s.headFw, mul(UP, -1), e2)), fw = norm(sub(f0, mul(up, dot(f0, up))));
    capAt = { c, up, fw, off: Math.min(1, e / 0.3) };
    const sd = norm(cross(up, fw));
    for (const i of [0, 1] as const) {
      const grip = add(c, add(mul(sd, (i === 0 ? 1 : -1) * 0.205), mul(up, 0.04)));
      s = reach(s, i, lerp(s.wr[i], grip, hIn), add(out(i), [0, -0.7, 0]), P, mul(sd, i === 0 ? -1 : 1), up);
    }
    if (e > 0.5) s = lookAt(s, add(c1, mul(fwd, 0.4)), 0.35 * (e - 0.5) * 2, P);
  }
  // Prof H pushes the flyer across the desk to Nio: his right hand flat on it, the fingers on its near edge, wherever
  // the set says the flyer is this frame (reachTo). He leans in after it, and watches it go.
  if (nm === 'slideFlyer' && a.reachTo) {
    s = leanFwd(s, 0.38);
    const w = add(a.reachTo, add(mul(fwd, -0.07), [0, 0.03, 0]));
    s = reach(s, 1, w, add(out(1), [0, -0.6, 0]), P, norm(add(fwd, [0, -0.25, 0])), mul(out(1), -1)); hands[1] = 'open';
    s = lookAt(s, a.reachTo, 0.3, P);
  }
  // (Aux v10) both hands round the neck of whoever is in front of him, cartoon-style, leaning in
  if (nm === 'throttle') {
    s = leanFwd(s, 0.3); const up: V = [0, 1, 0];
    for (const i of [0, 1] as const) { const w = add(add(s.neckBase, mul(up, 0.02)), add(mul(fwd, 0.42), mul(s.side, i === 0 ? 0.07 : -0.07)));
      s = reach(s, i, w, add(out(i), [0, -0.5, 0]), P, mul(s.side, i === 0 ? -1 : 1), up); hands[i] = 'fist'; }
  }
  // (Aux v10) a flat pizza box held over her head against the rain
  if (nm === 'pizza') {
    const up: V = [0, 1, 0], pc = add(s.neckBase, add(mul(up, 0.42), mul(fwd, 0.05)));
    props.push({ c: pc, x: s.side, y: up, z: fwd, h: [0.21, 0.025, 0.21], col: '#d8b88a' });
    for (const i of [0, 1] as const) { s = reach(s, i, add(pc, add(mul(s.side, i === 0 ? 0.2 : -0.2), [0, -0.03, 0])), add(out(i), [0, -0.3, 0]), P, up, fwd); hands[i] = 'open'; }
  }
  // (Aux v12) two records hugged flat to his chest, arms crossed over them: saving what he can
  if (nm === 'records') {
    const up: V = [0, 1, 0], pc = add(s.neckBase, add(mul(up, -0.16), mul(fwd, 0.15)));
    props.push({ c: add(pc, add(mul(fwd, -0.02), add(mul(s.side, -0.05), [0, 0.04, 0]))), x: s.side, y: up, z: fwd, h: [0.16, 0.16, 0.01], col: '#c0503a' }); // the second sleeve, behind
    props.push({ c: pc, x: s.side, y: up, z: fwd, h: [0.16, 0.16, 0.012], col: '#1d1b20' }); // a black record, front
    props.push({ c: add(pc, mul(fwd, 0.014)), x: s.side, y: up, z: fwd, h: [0.05, 0.05, 0.004], col: '#e8c24a' }); // its label
    for (const i of [0, 1] as const) { s = reach(s, i, add(pc, add(mul(s.side, i === 0 ? 0.15 : -0.15), add(mul(up, i === 0 ? 0.03 : -0.05), mul(fwd, 0.02)))), add(out(i), [0, -0.5, 0]), P, mul(fwd, -1), up); hands[i] = 'fist'; }
  }
  // (One Sip v10) the duvet pulled up over his head: a big soft lump over the head and shoulders, his hands holding its edge
  if (nm === 'duvet') {
    const up: V = [0, 1, 0], pc = add(s.neckBase, add(mul(up, 0.06), mul(fwd, 0.06)));
    props.push({ c: pc, x: s.side, y: up, z: fwd, h: [0.36, 0.34, 0.26], col: '#6f5169' });
    for (const i of [0, 1] as const) { s = reach(s, i, add(pc, add(mul(s.side, i === 0 ? 0.16 : -0.16), add(mul(up, -0.2), mul(fwd, 0.2)))), add(out(i), [0, -0.5, 0]), P, up, fwd); hands[i] = 'fist'; }
  }
  // (Group Photo v12) a flat hand up over his eyes against the sun, palm down, just above the brows
  // (One Sip v11) a finger to his lips: shh. The index finger up in front of the mouth, the palm to the side
  if (nm === 'shush') {
    const up: V = [0, 1, 0], w = add(add(s.neckBase, mul(up, 0.06)), add(mul(fwd, 0.2), mul(s.side, -0.01)));
    s = reach(s, 1, w, add(out(1), [0, -0.6, 0]), P, mul(s.side, 1), up); hands[1] = 'point';
  }
  // (One Sip v11) a hand on top of his own head, touching his hair (the haircut)
  if (nm === 'hair') {
    const up: V = [0, 1, 0], w = add(add(s.neckBase, mul(up, 0.44)), add(mul(fwd, -0.02), mul(s.side, -0.1)));
    s = reach(s, 1, w, add(out(1), [0, 0.1, 0]), P, mul(up, -1), fwd); hands[1] = 'open';
  }
  if (nm === 'shade') {
    const up: V = [0, 1, 0], w = add(add(s.neckBase, mul(up, 0.27)), add(mul(fwd, 0.16), mul(s.side, -0.02)));
    s = reach(s, 1, w, add(out(1), [0, -0.3, 0]), P, mul(up, -1), mul(s.side, 1)); hands[1] = 'open';
  }
  // (Group Photo v12) a folded chair carried at her right side by its top edge, legs down
  if (nm === 'foldChair') {
    const up: V = [0, 1, 0], rt = mul(s.side, -1), pc = add(add(s.hip[1], mul(rt, 0.16)), add(mul(up, -0.08), mul(fwd, 0.04)));
    props.push({ c: pc, x: s.side, y: up, z: fwd, h: [0.025, 0.42, 0.21], col: '#c84a3a' });
    s = reach(s, 1, add(pc, mul(up, 0.4)), add(out(1), [0, -0.6, 0]), P, mul(s.side, -1), fwd); hands[1] = 'fist';
  }
  // the flyer held up in both hands at chest height, its face to whoever he shows it to
  if (nm === 'flyer') {
    // the improv flyer held up beside his face in his right hand, its face toward whoever he is facing, turned in a touch
    const up: V = [0, 1, 0], rt = mul(s.side, -1);
    const pc = add(add(s.neckBase, mul(up, 0.12)), add(mul(fwd, P.torsoR + 0.17), mul(rt, 0.2)));
    const z = norm(add(fwd, mul(rt, 0.22))), x0 = s.side, x = norm(sub(x0, mul(z, dot(x0, z)))), y = cross(z, x);
    props.push({ c: pc, x, y, z, h: [0.108, 0.14, 0.002], col: '#f6f3ea', sign: 'flyer' });
    // the hand at its bottom outer corner, the thumb on its face, clear of the words
    s = reach(s, 1, add(pc, add(add(mul(x, -0.088), mul(y, -0.122)), mul(z, -0.025))), add(out(1), [0, -1, 0]), P, y, z); hands[1] = 'fist';
  }
  if (nm === 'ticket') {
    // Darnell, sitting: the lab report on his knees, turned to whoever is in front of him, and on it, over its coffee
    // ring, his ticket (4), his left hand beside it, the thumb on the ring. Both read the right way up from in front.
    const o0 = ch.wardrobe[a.outfit ?? ch.outfit], w = o0.bottom ? P.legR + 0.03 + o0.bottom.width * 0.6 : P.legR;
    const fh = norm([fwd[0], 0, fwd[2]]), rt = cross(fh, UP), y = mul(fh, -1), z = UP, x = cross(y, z); // y: the page's top, toward him
    const rc = add(lerp(lerp(s.hip[0], s.kn[0], 0.7), lerp(s.hip[1], s.kn[1], 0.7), 0.5), [0, w + 0.012, 0]);
    // anyone but Darnell has just pulled a ticket: no report under it, and their number is a lot bigger (4,812)
    const mine = ch.id !== 'darnell';
    if (!mine) props.push({ c: rc, x, y, z, h: [0.105, 0.148, 0.002], col: '#f0ece0', sign: 'labReport' });
    const tc = mine ? add(rc, [0, 0.004, 0]) : add(rc, add(add(mul(x, 0.035), mul(y, -0.027)), [0, 0.004, 0])); // the coffee ring on the page
    props.push({ c: tc, x, y, z, h: mine ? [0.065, 0.04, 0.0015] : [0.03, 0.04, 0.0015], col: '#eee2c4', sign: mine ? 'ticket4812' : 'ticket4' });
    s = reach(s, 0, add(tc, add(mul(rt, mine ? -0.15 : -0.085), add(mul(fh, -0.02), [0, 0.03, 0]))), add(out(0), [0, -1, 0]), P, norm(add(rt, mul(fh, 0.3))), UP); hands[0] = 'fist';
  }
  // a mop: both hands on the handle, the right low, the left high, the head on the floor ahead swinging side to side
  // in time with the walk
  if (nm === 'mop') {
    const ft = lerp(s.an[0], s.an[1], 0.5), fh = norm([fwd[0], 0, fwd[2]]), sw = Math.sin(((a.t ?? 0) / 32) * 2 * Math.PI) * 0.2;
    const head = add([ft[0], 0.03, ft[2]], add(mul(fh, 0.62), mul(out(1), 0.08 + sw))), top = add(add(s.hips, [0, 0.62, 0]), add(mul(fh, 0.1), mul(out(1), 0.12)));
    const ax = norm(sub(top, head)), at = (k: number) => add(head, mul(sub(top, head), k));
    s = reach(s, 1, at(0.52), add(out(1), [0, -1, 0]), P, ax, mul(out(1), -1)); s = reach(s, 0, at(0.86), add(out(0), [0, -1, 0]), P, ax, out(0)); hands[0] = 'fist'; hands[1] = 'fist';
    extra.push({ a: head, ra: 0.013, b: add(top, mul(ax, 0.06)), rb: 0.013, g: G.shoe, k: 0.002, c: '#b8b2a8' });
    const across = norm(cross(ax, fh));
    for (let k = -3; k <= 3; k++) { const r0 = add(head, mul(across, k * 0.026));
      extra.push({ a: r0, ra: 0.02, b: add([r0[0], 0.015, r0[2]], add(mul(fh, 0.07 + 0.02 * Math.abs(k)), mul(across, k * 0.025))), rb: 0.017, g: G.shoe, k: 0.02, c: '#d6d0c2' }); }
    s = lookAt(s, add(head, [0, 0.3, 0]), 0.25, P);
  }
  // a pen in the right hand, its point on the desk in front of him
  if (nm === 'pen') {
    const w = A(1, 0.32, -0.03, -0.08);
    s = reach(s, 1, w, add(out(1), [0, -1, 0]), P, norm(add(fwd, [0, -0.5, 0])), UP); hands[1] = 'fist';
    const tip = add(s.wr[1], mul(norm(add(fwd, [0, -0.3, 0])), P.hand * 0.75));
    extra.push({ a: add(tip, add(mul(UP, 0.045), mul(fwd, -0.03))), ra: 0.0075, b: add(tip, add(mul(UP, -0.055), mul(fwd, 0.035))), rb: 0.006, g: G.shoe, k: 0.003, c: '#2c3f8f' });
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
  if (pf && (pf.nod || pf.tilt)) {
    // the head: a nod (chin down) and a tilt, last, on top of whatever the holds did with it
    const fw = rot(s.headFw, s.headRt, pf.nod), up0 = rot(s.headUp, s.headRt, pf.nod), up = rot(up0, fw, pf.tilt), rt = cross(up, fw);
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
  const glassC = hk.glasses ?? ((a.wear ?? []).includes('glasses') ? '#1c1a20' : undefined);
  if (glassC) {
    // small round glasses (a character's own, or the music snob's wear 'glasses' in One Sip): a wire ring round each eye just off the face, a bridge, and an arm back to each ear. Its own
    // surface, so it is inked.
    const w = hk.width ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const R = 0.045 * (hk.eyes ?? 1) / 0.55, cy = -0.058, cz = 0.196, N = 12, t = 0.0035, wire = (a: V, b: V) => prims.push({ a, ra: t, b, rb: t, g: G.shoe, k: 0.003, c: glassC });
    for (const sd of [1, -1]) {
      const cx = sd * 0.083;
      for (let k = 0; k < N; k++) { const a0 = (k / N) * 6.283, a1 = ((k + 1) / N) * 6.283;
        wire(at(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, cz - 0.012 * Math.abs(Math.cos(a0))), at(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, cz - 0.012 * Math.abs(Math.cos(a1)))); }
      const ox = cx + sd * R;
      wire(at(ox, cy + 0.008, cz - 0.012), at(sd * 0.212 * w, cy + 0.004, 0.13)); wire(at(sd * 0.212 * w, cy + 0.004, 0.13), at(sd * 0.226 * w, cy - 0.01, 0.0));
    }
    // the bridge: one flat wire straight across between the rims (a peaked bridge inked as a dot on the forehead: stranger, Nov 18)
    wire(at(0.083 - R, cy + 0.006, cz - 0.004), at(-0.083 + R, cy + 0.006, cz - 0.004));
  }
  if (ch.beard) {
    // a long beard: full along the jaw and under the chin (the mouth stays clear), then one soft mass that hangs down
    // the front of the body to the belt, narrowing to a point. Hair, so one surface with the hair on his head.
    const w = hk.width ?? 1, ck = hk.chin ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const bf = norm(cross(s.side, s.chestDir)), bd = (c: V, r: number, c2: V, r2: number) => prims.push({ a: c, ra: r, b: c2, rb: r2, g: G.hair, k: 0.03, c: ch.beard!, tex: 1 });
    // the jaw lines run down the sides of the face and stop outside the mouth's corners; the chin mass starts below
    // the lowest the mouth opens, so every word shows
    for (const sd of [1, -1]) bd(at(sd * 0.168 * w, -0.08, 0.02), 0.042, at(sd * 0.125 * w, -0.235 * ck, 0.055), 0.05);
    const chin = at(0, -0.3 * ck, 0.045), r0 = P.torsoR + 0.025;
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
  for (const w0 of a.wear ?? []) {
    // costume pieces (One Sip): each its own surface, so it is inked. at(): the head's own frame, as for the glasses.
    const w = hk.width ?? 1, at = (x: number, y: number, z: number): V => add(s.headC, add(mul(s.headRt, x), add(mul(s.headUp, y), mul(s.headFw, z))));
    const pr = (a0: V, ra: number, b0: V, rb: number, c: string, x: Partial<Prim> = {}) => prims.push({ a: a0, ra, b: b0, rb, g: G.shoe, k: 0.004, c, ...x });
    if (w0 === 'tophat') {
      // a tall black top hat with a burgundy band, sitting square on the crown, the brim curled a little at the sides
      pr(at(0, 0.215, -0.01), 0.27 * w, at(0, 0.228, -0.01), 0.27 * w, '#1c1a20', { cutA: true, cutB: true });
      pr(at(0, 0.225, -0.01), 0.165, at(0, 0.56, -0.01), 0.175, '#1c1a20', { cutA: true, cutB: true });
      pr(at(0, 0.235, -0.01), 0.172, at(0, 0.3, -0.01), 0.172, '#7a1c2c', { cutA: true, cutB: true });
    }
    if (w0 === 'monocle') {
      // a gold ring round his right eye, and a fine chain from it down to the collar
      const R = 0.052, cx = -0.083, cy = -0.058, cz = 0.205, N = 12, t = 0.0045;
      for (let k = 0; k < N; k++) { const a0 = (k / N) * 6.283, a1 = ((k + 1) / N) * 6.283;
        pr(at(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, cz), t, at(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, cz), t, '#d4a72c'); }
      // no chain: a chain across the face read as a straw (stranger review, Nov 17)
    }
    if (w0 === 'bowtie') {
      // a burgundy bow tie at the collar: a knot and two wings
      const k0 = add(s.neckBase, add(mul(fwd, P.torsoR * 0.72 + 0.03), [0, -0.005, 0])), sd = s.side;
      pr(k0, 0.017, k0, 0.017, '#7a1c2c');
      for (const d of [1, -1]) { const tip = add(k0, mul(sd, d * 0.075));
        pr(add(k0, mul(sd, d * 0.012)), 0.012, add(tip, [0, 0.016, 0]), 0.024, '#7a1c2c', { sq: 1.6 });
        pr(add(k0, mul(sd, d * 0.012)), 0.012, add(tip, [0, -0.016, 0]), 0.024, '#7a1c2c', { sq: 1.6 }); }
    }
    if (w0 === 'lanyard') {
      // a thin dark-blue strap round the back of the neck, down to a white card on the chest
      const n0 = s.neckBase, card = add(add(s.neckBase, mul(s.chestDir, -0.2)), mul(fwd, P.torsoR + 0.025));
      for (const d of [1, -1]) pr(add(n0, add(mul(s.side, d * 0.06), mul(fwd, 0.03))), 0.006, add(card, add(mul(s.side, d * 0.02), [0, 0.04, 0])), 0.006, '#2a3a6a');
      pr(add(card, [0, 0.02, 0]), 0.03, add(card, [0, -0.02, 0]), 0.03, '#f4f1ea', { sq: 0.4 });
    }
    if (w0 === 'partyhat') {
      // a striped paper cone, tilted a little, a pompom on top
      const base = at(0.04, 0.2, 0.0), tip = at(0.1, 0.52, 0.02), cols = ['#e05a8a', '#f2c94c', '#e05a8a', '#f2c94c'];
      for (let k = 0; k < 4; k++) { const t0 = k / 4, t1 = (k + 1) / 4, p0 = add(base, mul(sub(tip, base), t0)), p1 = add(base, mul(sub(tip, base), t1));
        pr(p0, 0.11 * (1 - t0) + 0.006, p1, 0.11 * (1 - t1) + 0.006, cols[k], { cutA: true }); }
      pr(tip, 0.03, tip, 0.03, '#fbf6ee');
    }
    if (w0 === 'moustache') {
      // a curled Victorian moustache under the nose: two thick wings out from the middle, each ending in a small curl up
      for (const d of [1, -1]) { pr(at(0, -0.112, 0.196), 0.014, at(d * 0.08, -0.118, 0.172), 0.011, '#2a1c14');
        pr(at(d * 0.08, -0.118, 0.172), 0.011, at(d * 0.11, -0.088, 0.15), 0.007, '#2a1c14'); }
    }
    if (w0 === 'scarf') {
      // the music snob's long knitted scarf (One Sip): a thick loop round the neck, both ends hanging down the chest
      const n0 = s.neckBase, f = mul(fwd, P.torsoR * 0.8 + 0.02);
      for (let k = 0; k < 8; k++) { const a0 = (k / 8) * 6.283, a1 = ((k + 1) / 8) * 6.283, ring = (q: number) => add(n0, add(mul(s.side, Math.sin(q) * (P.torsoR + 0.04)), add(mul(fwd, Math.cos(q) * (P.torsoR * 0.8 + 0.03)), [0, 0.02, 0])));
        pr(ring(a0), 0.032, ring(a1), 0.032, '#b8432f'); }
      for (const d of [0.035, -0.04]) pr(add(n0, add(f, mul(s.side, d))), 0.028, add(add(s.neckBase, mul(s.chestDir, -0.34 + d)), add(f, mul(s.side, d * 1.4))), 0.026, d > 0 ? '#b8432f' : '#c9553f');
    }
    if (w0 === 'lampshade') {
      // the king's crown (One Sip): the living room's lampshade, a pleated cream cone sitting on his head, tilted
      const base = at(-0.03, 0.17, 0.0), top = at(-0.06, 0.42, -0.01);
      pr(base, 0.25 * w, top, 0.13, '#efe2c2', { cutA: true, cutB: true });
      pr(at(-0.03, 0.17, 0.0), 0.255 * w, at(-0.031, 0.185, 0.0), 0.255 * w, '#c79a3a', { cutA: true, cutB: true });
    }
    if (w0 === 'longcoat') {
      // (One Sip v10) Theo's long camel coat off the hook, on Sami: over the torso, down past the knees, the sleeves to the wrists
      const cc = '#a07a4e', r0 = P.torsoR + 0.035, knee = mul(add(s.kn[0], s.kn[1]), 0.5);
      pr(add(s.neckBase, mul(s.chestDir, -0.02)), r0 - 0.01, s.hips, r0 + 0.01, cc);
      pr(s.hips, r0 + 0.012, add(knee, [0, -0.08, 0]), r0 + 0.05, cc);
      for (const i of [0, 1] as const) { pr(s.sh[i], 0.052, s.el[i], 0.048, cc); pr(s.el[i], 0.048, add(s.el[i], mul(sub(s.wr[i], s.el[i]), 0.85)), 0.046, cc); }
      pr(add(s.neckBase, mul(s.side, 0.05)), 0.04, add(s.neckBase, mul(s.side, -0.05)), 0.04, '#8a6640'); // the collar
    }
    if (w0 === 'glove') {
      // (One Sip v10) the glove from the coat pocket, held by its cuff in his right hand, the fingers hanging past the hand
      const d = norm(sub(s.tip[1], s.wr[1]));
      pr(s.wr[1], 0.03, add(s.tip[1], mul(d, 0.12)), 0.036, '#3a2a22');
    }
    if (w0 === 'beret') {
      // the music snob's beret (One Sip v8): a soft black disc pulled to one side of the crown, a tiny stalk on top
      pr(at(0.05, 0.215, -0.01), 0.21 * w, at(0.07, 0.25, -0.01), 0.2 * w, '#1c1a20', { cutA: true, cutB: true });
      pr(at(0.07, 0.255, -0.01), 0.012, at(0.07, 0.29, -0.01), 0.008, '#1c1a20');
    }
    if (w0 === 'headset') {
      // the life coach's headset mic (One Sip v8): a thin band over the head to the right ear, a boom to the mouth corner
      const N = 8, ear = at(-0.225 * w, -0.03, 0.0);
      for (let k = 0; k < N; k++) { const a0 = (k / N) * Math.PI, a1 = ((k + 1) / N) * Math.PI, q = (a: number) => at(Math.cos(a) * 0.235 * w, Math.sin(a) * 0.26 - 0.02, 0.0);
        pr(q(a0), 0.006, q(a1), 0.006, '#2a2a30'); }
      pr(ear, 0.03, ear, 0.03, '#2a2a30');
      pr(ear, 0.005, at(-0.07, -0.13, 0.19), 0.005, '#2a2a30'); pr(at(-0.07, -0.13, 0.19), 0.016, at(-0.07, -0.13, 0.19), 0.016, '#2a2a30');
    }
    if (w0 === 'sideburns') {
      // huge Victorian mutton chops: from each temple down the cheek to the jaw, the mouth left clear
      for (const d of [1, -1]) prims.push({ a: at(d * 0.215 * w, -0.02, 0.02), ra: 0.035, b: at(d * 0.2 * w, -0.17, 0.07), rb: 0.055, g: G.shoe, k: 0.02, c: '#6b4a32', tex: 1 }); // a ginger-brown, so they read as whiskers and not his hair
    }
  }
  if (ch.cap) {
    // a baseball cap: a dome cut flat at its base, sitting a little proud of the head, and a stiff curved brim (a fan
    // of thin rods, so it stays a plate whichever way the cap is turned). On the head, or wherever capOff has it.
    const w = hk.width ?? 1, at0 = capAt ?? { c: add(s.headC, mul(s.headUp, 0.04)), up: s.headUp, fw: s.headFw, off: 0 };
    const sd = norm(cross(at0.up, at0.fw)), at = (x: number, y: number, z: number): V => add(at0.c, add(mul(sd, x * w), add(mul(at0.up, y), mul(at0.fw, z))));
    prims.push({ a: at(0, 0, 0), ra: 0.214, b: at(0, 0.004, 0), rb: 0.214, g: G.shoe, k: 0.004, c: ch.cap, cutA: true });
    prims.push({ a: at(0, 0.228, 0.0), ra: 0.016, b: at(0, 0.228, 0.0), rb: 0.016, g: G.shoe, k: 0.006, c: ch.cap }); // the button
    for (let k = -4; k <= 4; k++) { const x = k * 0.022;
      prims.push({ a: at(x, 0.012, 0.15 - Math.abs(k) * 0.01), ra: 0.014, b: at(x * 1.2, 0.002 - Math.abs(k) * 0.005, 0.29 - k * k * 0.004), rb: 0.014, g: G.shoe, k: 0.018, c: ch.cap }); }
  }
  const soft: Soft = { character: true, origin: s.hips, prims,
    head: { c: s.headC, rt: s.headRt, up: s.headUp, fw: s.headFw, face: a.face, skin: ch.skin, hairA: ch.hairA, hairB: ch.hairB,
      blobs: ch.cap ? underCap(ch.hair, 1 - (capAt?.off ?? 0)) : ch.hair,
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
// THE FAINTING COUCH (One Sip): a burgundy velvet chaise longue, the raised end at its left (low s), gold feet.
// cx, cz: the middle of its seat; it runs along s. It appears from nowhere, so it is drawn only when a shot asks for it.
// (One Sip v10) the coat hooks on the wall by the door, and what hangs on them: Maya's black beret, Theo's long camel
// coat. Each is in the room before Sami takes it. what: 'b' the beret, 'c' the coat.
export const HOOKS = { s: 0.05, y: 1.62, z: 2.0 };
export const hooks = (what: string): Soft => { const { s: hs, y, z } = HOOKS, p = (a: number, b: number, c: number) => P3(hs + a, y + b, z + c);
  const prims = [cp(p(0.02, 0, -0.32), 0.022, p(0.02, 0, 0.32), 0.022, 0, '#6a4a34', 0.004), ...[-0.22, 0, 0.22].map((d) => cp(p(0.04, 0, d), 0.012, p(0.09, 0.03, d), 0.01, 0, '#2c2126', 0.002))];
  if (what.includes('b')) prims.push(cp(p(0.1, -0.05, -0.22), 0.075, p(0.12, -0.12, -0.22), 0.07, 1, '#1c1a20', 0.01, { sq: 1.6 }));
  if (what.includes('c')) prims.push(cp(p(0.11, -0.05, 0.0), 0.11, p(0.13, -0.42, 0.0), 0.14, 1, '#a07a4e', 0.03), cp(p(0.13, -0.42, 0.0), 0.14, p(0.13, -0.95, 0.0), 0.16, 1, '#a07a4e', 0.03));
  return { origin: p(0.1, -0.3, 0), prims };
};
// (One Sip v10) the floor lamp by the sofa, its pleated cream shade (or bare, once Sami has it on his head)
export const LAMP2 = { s: 2.3, z: 3.95 };
export const floorLamp = (shade: boolean): Soft => { const b = P3(LAMP2.s, 0, LAMP2.z), q = (y: number) => add(b, [0, y, 0]) as V;
  const prims = [cp(q(0.0), 0.13, q(0.03), 0.13, 0, '#2c2126', 0.004, { cutA: true, cutB: true }), cp(q(0.02), 0.014, q(1.42), 0.014, 0, '#2c2126', 0.004), cp(q(1.4), 0.05, q(1.47), 0.05, 1, '#fff2c8', 0.01, { em: 1 })];
  if (shade) prims.push(cp(q(1.32), 0.25, q(1.57), 0.13, 1, '#efe2c2', 0.004, { cutA: true, cutB: true, em: 0.4 }), cp(q(1.32), 0.255, q(1.335), 0.255, 1, '#c79a3a', 0.004, { cutA: true, cutB: true }));
  return { origin: q(0.8), prims };
};
// (One Sip v10) the duvet over Sami's lap on the sofa, the next morning
export const blanketUp = (): Soft => ({ origin: P3(1.15, 0.85, 3.7), prims: [cp(P3(1.15, 0.5, 3.7), 0.34, P3(1.15, 1.02, 3.72), 0.27, 1, '#6f5169', 0.12, { tex: 2 }), cp(P3(0.85, 0.5, 3.5), 0.14, P3(1.45, 0.5, 3.5), 0.14, 1, '#6f5169', 0.06, { tex: 2 })] });
export const blanket = (): Soft => ({ origin: P3(1.15, 0.6, 3.6), prims: [cp(P3(0.85, 0.58, 3.55), 0.13, P3(1.45, 0.58, 3.55), 0.13, 1, '#6f5169', 0.06, { sq: 1.5, tex: 2 }), cp(P3(0.9, 0.42, 3.38), 0.1, P3(1.4, 0.3, 3.36), 0.1, 1, '#6f5169', 0.05, { tex: 2 })] });
export const chaise = (cs: number, cz: number, lift = 0): Soft => {
  const V0 = '#8a1f2e', V1 = '#6e1724', gold = '#c9a227', y = 0.36, half = 0.78;
  const p = (s0: number, y0: number, z0: number): V => P3(cs + s0, y0 + lift, cz + z0);
  return { origin: p(0, y, 0), prims: [
    cp(p(-half, y, 0), 0.17, p(half, y, 0), 0.17, 1, V0, 0.05, { sq: 1.9, tex: 2 }), // the seat, a long fat cushion
    cp(p(-half - 0.02, y + 0.12, 0), 0.15, p(-half + 0.05, y + 0.42, 0.0), 0.16, 1, V0, 0.08, { tex: 2 }), // the raised end
    cp(p(-half + 0.05, y + 0.42, -0.14), 0.07, p(-half + 0.05, y + 0.42, 0.14), 0.07, 1, V1, 0.03, { tex: 2 }), // its scroll
    cp(p(-half + 0.1, y + 0.18, 0.16), 0.07, p(0.25, y + 0.1, 0.16), 0.06, 1, V1, 0.05, { tex: 2 }), // the low back along the far side
    ...[[-half + 0.08, -0.12], [-half + 0.08, 0.12], [half - 0.08, -0.12], [half - 0.08, 0.12]].map(([a0, b0]) => cp(p(a0, 0.02, b0), 0.03, p(a0, y - 0.12, b0), 0.024, 0, gold, 0.01)),
  ] };
};
// a birthday cake nobody brought (Aux): two pink tiers, white icing drips, lit candles. cs, cz: where it stands; y: on what.
export const cake = (cs: number, cz: number, y: number): Soft => {
  const p = (s0: number, y0: number, z0: number): V => P3(cs + s0, y + y0, cz + z0);
  return { origin: p(0, 0.1, 0), prims: [
    cp(p(0, 0, 0), 0.17, p(0, 0.1, 0), 0.17, 0, '#f2a7c3', 0.01, { cutA: true, cutB: true }), cp(p(0, 0.1, 0), 0.172, p(0, 0.115, 0), 0.172, 0, '#fbf6ee', 0.01, { cutA: true, cutB: true }),
    cp(p(0, 0.115, 0), 0.11, p(0, 0.2, 0), 0.11, 0, '#f2a7c3', 0.01, { cutA: true, cutB: true }), cp(p(0, 0.2, 0), 0.112, p(0, 0.212, 0), 0.112, 0, '#fbf6ee', 0.01, { cutA: true, cutB: true }),
    ...[-0.05, 0, 0.05].flatMap((d, i) => [cp(p(d, 0.212, (i - 1) * 0.03), 0.008, p(d, 0.27, (i - 1) * 0.03), 0.008, 0, '#7ec4e8', 0.002), cp(p(d, 0.285, (i - 1) * 0.03), 0.012, p(d, 0.29, (i - 1) * 0.03), 0.008, 0, '#ffd27a', 0.002, { em: 1 })]),
  ] };
};
export const shot = (camA: CamArg, acts: Act[], time = 0, dress?: string, flash?: boolean, extras: Soft[] = []): Scene3 => {
  const ps = lensActs(camA, acts).map(pose), living = dress === 'living' || dress === 'livingDay', party = dress === 'party' || dress === 'living', cam = camOf(camA, ps);
  const fl: Light[] = flash ? [{ p: cam.pos, r: 2.4, col: [0.42, 0.42, 0.44] }] : [];
  return { cam, room: ROOM, amb: party ? PARTY_AMB : AMB, ambChar: party ? PARTY_AMB_CHAR : AMB_CHAR, boxes: living ? LIVING_BOXES : party ? PARTY_BOXES : ROOM_BOXES, time,
    softs: [...ps.map((p) => p.soft), ...(living ? LIVING_SOFTS : party ? PARTY_SOFTS : ROOM_SOFTS), ...extras], lights: [...(party ? PARTY_LIGHTS : ROOM_LIGHTS), ...fl, ...ps.flatMap((p) => p.lights)],
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
