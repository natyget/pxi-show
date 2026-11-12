// Nio's room: the furniture, the soft things, the lamps, and how a character is posed in it. Pure data and maths.
import { V, add, sub, mul, norm, cross, dot, lerp } from './vec';
import { Skel, Prim, sampleClip, solve, place, reach, lookAt, buildBody, G } from './rig';
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

// ---- posing ----
export type Act = { who?: Character; clip: string; t: number; at: [number, number]; yaw: number; face: Face;
  stance?: number; arms?: number; upright?: number; seat?: number; phone?: number; hold?: number[]; crossed?: boolean; look?: V; lookAmt?: number; outfit?: string };
export const pose = (a: Act) => {
  const ch = a.who ?? NIO_CHAR, P = ch.body;
  let s: Skel = place(solve(sampleClip(a.clip, a.t), P, { stance: a.stance ?? 1, arms: a.arms ?? 1, upright: a.upright ?? 0, seat: a.seat }), [X(a.at[0]), a.at[1]], a.yaw);
  const props: Obb[] = []; const lights: Light[] = [];
  if (a.look) s = lookAt(s, a.look, a.lookAmt ?? 1, P);
  const fwd = norm(cross(s.side, s.chestDir));
  if (a.crossed) {
    // Folded arms, placed by hand: both elbows forward of the ribs, both forearms level across the chest. His left
    // forearm lies on top with its hand on the right arm; the right hand tucks under the left elbow.
    const o = sub(s.neckBase, mul(s.chestDir, 0.05));
    const at = (x: number, y: number, f: number): V => add(o, add(mul(s.side, x), add(mul(s.chestDir, y), mul(fwd, f))));
    const c: Skel = { ...s, el: [...s.el] as any, wr: [...s.wr] as any, tip: [...s.tip] as any, thumb: [...s.thumb] as any };
    c.el[0] = at(0.17, -0.2, 0.14); c.wr[0] = at(-0.045, -0.168, 0.212); c.tip[0] = at(-0.118, -0.14, 0.2); c.thumb[0] = at(-0.06, -0.128, 0.205);
    c.el[1] = at(-0.17, -0.2, 0.14); c.wr[1] = at(0.05, -0.222, 0.182); c.tip[1] = at(0.118, -0.212, 0.158); c.thumb[1] = at(0.075, -0.19, 0.172);
    s = c;
  }
  const ph = a.phone ?? 0;
  if (ph > 0.01) {
    // the phone floats where his eyes can read it; the hand is placed BEHIND it and the thumb comes round the front
    const body = norm([s.headFw[0], 0, s.headFw[2]]), rt = norm(cross([0, 1, 0], body));
    // `hold` = how far in front of the neck, how far to his right, and how far below it (metres)
    const hd = a.hold ?? [0.25, 0.06, 0.09];
    const pc = add(s.neckBase, add(mul(body, hd[0]), add(mul(rt, -hd[1]), [0, -hd[2], 0])));
    s = lookAt(s, pc, 0.35 * ph, P);
    // the glass faces his eyes, and its sides stay square to his shoulders however flat he holds it
    const z = norm(sub(add(s.headC, mul(s.headFw, 0.1)), pc)), hr = mul(rt, -1), x = norm(sub(hr, mul(z, dot(hr, z)))), y = cross(z, x);
    const wr = add(pc, add(mul(y, -0.1), mul(z, -0.03)));
    const held = reach(s, 1, wr, add(mul(rt, -1), [0, -0.6, 0]), P, add(y, mul(z, 0.12)), add(mul(x, -0.2), add(mul(y, 0.62), mul(z, 0.76))));
    const mixS: any = { ...s };
    (['el', 'wr', 'tip', 'thumb'] as const).forEach((k) => { mixS[k] = [s[k][0], lerp(s[k][1], held[k][1], ph)]; });
    s = mixS;
    if (ph > 0.6) {
      props.push({ c: pc, x, y, z, h: [0.04, 0.082, 0.006], col: '#241a1e', screen: '#a523ef' });
      lights.push({ p: add(pc, mul(z, 0.05)), r: 0.2, col: [0.3, 0.12, 0.5] });
    }
  }
  const o = ch.wardrobe[a.outfit ?? ch.outfit];
  const soft: Soft = { character: true, origin: s.hips, prims: buildBody(s, P, ch.skin, o, a.crossed ? 0 : undefined),
    head: { c: s.headC, rt: s.headRt, up: s.headUp, fw: s.headFw, face: a.face, skin: ch.skin, hairA: ch.hairA, hairB: ch.hairB, blobs: ch.hair } };
  const mid = lerp(s.an[0], s.an[1], 0.5);
  const shadows = a.seat === undefined ? [[mid[0], mid[2], 0.2, 0.3]] : [];
  return { soft, props, lights, shadows };
};
// The studio: a plain mauve backdrop with flat light, for model sheets.
export const studioShot = (cam: Cam3, acts: Act[]): Scene3 => {
  const ps = acts.map(pose);
  return { cam, room: ROOM, amb: [0.94, 0.94, 0.94], ambChar: [0.97, 0.94, 0.95], boxes: [], studio: true,
    softs: ps.map((p) => p.soft), lights: [{ p: P3(1.2, 2.3, 0.6), r: 3, col: [0.08, 0.07, 0.06] }, ...ps.flatMap((p) => p.lights)],
    props: ps.flatMap((p) => p.props), shadows: ps.flatMap((p) => p.shadows) };
};
export const shot = (cam: Cam3, acts: Act[], time = 0): Scene3 => {
  const ps = acts.map(pose);
  return { cam, room: ROOM, amb: AMB, ambChar: AMB_CHAR, boxes: ROOM_BOXES, time,
    softs: [...ps.map((p) => p.soft), ...ROOM_SOFTS], lights: [...ROOM_LIGHTS, ...ps.flatMap((p) => p.lights)],
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
