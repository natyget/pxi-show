// THE CLUB: a big dark room with a lit dance floor, a raised DJ booth against the far wall under an LED wall,
// speaker stacks either side, a bar along the right wall, a lighting rig in the ceiling throwing beams through the
// haze, and a crowd of about two hundred, every one different (crowd.ts). Used first in "The Move".
// Positions are (s, y, z) as in room.ts: s from the wall on the LEFT of the picture when you face the DJ, z toward the
// DJ. The room is 12 wide, 4.4 high, 14 deep. It sits so that X(s) from room.ts still gives world x.
import { V, add, mul, norm } from './vec';
import { Scene3, Box, Light, Beam, CrowdSpec, Cam3 } from './types';
import { Act, pose, P3, X, C, CamArg, camOf, lensActs } from './room';

export const CLUB_W = 12, CLUB_H = 4.4, CLUB_D = 14;
const ROOM0: V = [X(CLUB_W), 0, 0];
const B = (s: number, y: number, z: number, hx: number, hy: number, hz: number, col: string, obj: number, x: Partial<Box> = {}): Box => ({ c: P3(s, y, z), h: [hx, hy, hz], col, obj, ...x });
const METAL = '#2a2630', DARK = '#1c1820', WOOD = '#3a2630';
// mat 6 is a neon strip in the club's mood (a red over half picks the second neon), mat 5 a speaker front
const NEON_A = '#000000', NEON_B = '#ff0000';

export const DANCE = { s: [1.2, 10.0], z: [2.2, 10.8] }; // the lit floor, and where the crowd stands
export const CIRCLE = { s: 6.0, z: 6.4, r: 1.4 }; // the space they clear round Nio
export const BOOTH = { s: [4.0, 8.0], z: [11.4, 14], top: 0.85 };

export const CLUB_BOXES: Box[] = [
  // the DJ booth: a raised platform with a neon edge, the desk on it with the decks, the mixer and a laptop
  B(6.0, 0.425, 12.7, 2.0, 0.425, 1.3, DARK, 1),
  B(6.0, 0.83, 11.395, 2.0, 0.014, 0.008, NEON_A, 2, { mat: 6, noShadow: true }),
  B(6.0, 1.37, 11.85, 1.2, 0.52, 0.3, '#221d26', 3, { mat: 2 }),
  B(6.0, 1.9, 11.84, 1.24, 0.016, 0.33, METAL, 3),
  B(6.0, 1.74, 11.545, 1.15, 0.012, 0.006, NEON_B, 4, { mat: 6, noShadow: true }),
  B(5.45, 1.94, 11.85, 0.2, 0.025, 0.2, '#16131a', 5), B(6.55, 1.94, 11.85, 0.2, 0.025, 0.2, '#16131a', 6), B(6.0, 1.945, 11.85, 0.12, 0.03, 0.17, '#2c2832', 7),
  B(5.45, 1.97, 11.85, 0.12, 0.006, 0.12, '#3c3842', 5), B(6.55, 1.97, 11.85, 0.12, 0.006, 0.12, '#3c3842', 6),
  B(6.35, 2.03, 12.05, 0.13, 0.08, 0.006, '#7f62a8', 8, { glow: true, yaw: 0 }),
  // speaker stacks either side of the booth: a sub on the floor, a top box on it
  B(3.1, 0.5, 13.2, 0.5, 0.5, 0.55, '#141117', 9, { mat: 5 }), B(3.1, 1.6, 13.2, 0.42, 0.6, 0.45, '#141117', 10, { mat: 5 }),
  B(8.9, 0.5, 13.2, 0.5, 0.5, 0.55, '#141117', 11, { mat: 5 }), B(8.9, 1.6, 13.2, 0.42, 0.6, 0.45, '#141117', 12, { mat: 5 }),
  // the bar along the right wall: counter, a lit edge under its top, a shelf of bottles lit from behind
  B(11.0, 0.55, 5.6, 0.3, 0.55, 3.0, WOOD, 13, { mat: 1 }), B(10.98, 1.115, 5.6, 0.36, 0.025, 3.05, '#5a4048', 14, { mat: 1 }),
  B(10.69, 1.0, 5.6, 0.008, 0.012, 2.95, NEON_B, 15, { mat: 6, noShadow: true }),
  B(11.86, 1.55, 5.6, 0.14, 0.018, 2.8, METAL, 16), B(11.86, 2.05, 5.6, 0.14, 0.018, 2.8, METAL, 16),
  B(11.97, 1.8, 5.6, 0.02, 0.5, 2.85, '#3a2a40', 17, { glow: true }),
  ...[3.2, 3.7, 4.3, 4.8, 5.5, 6.1, 6.6, 7.3, 7.9].flatMap((z, i) => [
    B(11.84, 1.66 + (i % 3) * 0.015, z, 0.035, 0.09 + (i % 3) * 0.015, 0.035, ['#c9a23a', '#4f8a5a', '#a63d4a', '#8c7bb0'][i % 4], 18 + i, { glow: true }),
    B(11.84, 2.15, z + 0.22, 0.035, 0.085, 0.035, ['#4f8a5a', '#c9a23a', '#8c7bb0', '#a63d4a'][i % 4], 18 + i, { glow: true })]),
  // stools at the bar
  ...[3.6, 4.8, 6.0, 7.2].flatMap((z, i) => [B(10.35, 0.38, z, 0.02, 0.38, 0.02, METAL, 30 + i), B(10.35, 0.77, z, 0.17, 0.03, 0.17, '#4a3440', 30 + i)]),
  // the rig in the ceiling: two trusses across, a moving head every metre or so
  B(6.0, 3.95, 5.0, 5.6, 0.05, 0.05, METAL, 40), B(6.0, 3.95, 9.0, 5.6, 0.05, 0.05, METAL, 41),
  ...[2.2, 4.4, 6.6, 8.8].flatMap((s, i) => [B(s, 3.83, 5.0, 0.08, 0.08, 0.08, '#16131a', 42 + i), B(s + 0.9, 3.83, 9.0, 0.08, 0.08, 0.08, '#16131a', 46 + i)]),
  // a low wall round the floor, with a neon line along its top
  B(0.6, 0.5, 6.5, 0.12, 0.5, 4.3, '#221d26', 50), B(0.6, 1.005, 6.5, 0.13, 0.006, 4.3, NEON_A, 51, { mat: 6, noShadow: true }),
];

// the light: a key above the floor, coloured washes, the booth glow, warm light at the bar. mood 1 is low and green.
const mix3 = (a: V, b: V, k: number): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const lightsFor = (mood: number, t: number, bps: number): Light[] => {
  const pulse = 0.85 + 0.15 * Math.abs(Math.sin(t * bps * Math.PI));
  const L = (s: number, y: number, z: number, r: number, party: V, green: V, halo = 0): Light => ({ p: P3(s, y, z), r, col: mix3(party, green, mood).map((c) => c * pulse) as V, halo });
  return [
    L(6.0, 3.6, 6.5, 6.0, [0.34, 0.26, 0.4], [0.1, 0.3, 0.14]),
    L(3.0, 3.2, 4.5, 4.0, [0.5, 0.14, 0.6], [0.04, 0.22, 0.08], 0.18),
    L(9.0, 3.2, 4.5, 4.0, [0.6, 0.18, 0.36], [0.04, 0.2, 0.08], 0.18),
    L(3.4, 3.2, 9.0, 4.0, [0.16, 0.3, 0.62], [0.05, 0.26, 0.1], 0.18),
    L(8.6, 3.2, 9.0, 4.0, [0.52, 0.16, 0.62], [0.05, 0.26, 0.1], 0.18),
    L(6.0, 2.6, 13.4, 3.4, [0.5, 0.24, 0.62], [0.1, 0.42, 0.18]),
    L(11.2, 2.4, 5.6, 2.2, [0.5, 0.34, 0.2], [0.22, 0.3, 0.16]),
  ];
};
// four beams from the moving heads, sweeping slowly; low and green, two of them, narrower
const beamsFor = (mood: number, t: number): Beam[] => {
  const cols: V[] = [[0.75, 0.3, 1.0], [1.0, 0.38, 0.62], [0.35, 0.6, 1.0], [0.8, 0.35, 1.0]];
  return [0, 1, 2, 3].filter((i) => mood < 0.5 || i % 2 === 0).map((i) => {
    const s = [2.2, 6.6, 5.3, 9.7][i], z = i < 2 ? 5.0 : 9.0, a = t * (0.45 + 0.1 * i) + i * 1.7;
    const tgt = P3(s + Math.sin(a) * 2.2 + (i % 2 ? -1 : 1) * 1.0, 0, z + Math.cos(a * 0.8) * 1.8 + (i < 2 ? 1.2 : -1.2));
    const o = P3(s, 3.76, z);
    return { o, d: norm(add(tgt, mul(o, -1))), spread: mood > 0.5 ? 0.09 : 0.13, k: mood > 0.5 ? 0.45 : 0.7, col: mix3(cols[i], [0.3, 1.0, 0.5], mood) };
  });
};

// The crowd's grid over the dance floor, and what it is doing. x and z are world; s is turned into x here.
export const crowdFor = (o: Partial<CrowdSpec> & { clearS?: number; clearZ?: number } = {}, cast: [number, number][] = []): CrowdSpec => {
  const cw = 0.6, cd = 0.56, nx = Math.floor((DANCE.s[1] - DANCE.s[0]) / cw), nz = Math.floor((DANCE.z[1] - DANCE.z[0]) / cd);
  const cs = o.clearS ?? CIRCLE.s, cz = o.clearZ ?? CIRCLE.z;
  return {
    x0: X(DANCE.s[1]), z0: DANCE.z[0], cw, cd, nx, nz, seed: 3, fill: 0.95,
    dance: 1, crouch: 0, armsUp: 0, headsUp: 0, clear: [X(cs), cz, CIRCLE.r], spread: 99, face: [X(6.0), 13.0], ring: 1.3, faces: 0,
    holes: cast.map(([s, z]) => [X(s), z, 0.42] as [number, number, number]),
    ...o,
  };
};

export type ClubOpts = { time?: number; mood?: number; bpm?: number; flash?: boolean; crowd?: Partial<CrowdSpec> & { clearS?: number; clearZ?: number } | null };
// A shot in the club. acts: the cast, placed by (s, z) as anywhere else. The crowd keeps clear of each of them.
export const clubShot = (camA: CamArg, acts: Act[], o: ClubOpts = {}): Scene3 => {
  const t = o.time ?? 0, mood = o.mood ?? 0, bps = (o.bpm ?? 124) / 60;
  const ps = lensActs(camA, acts).map((a) => pose(a)), cam = camOf(camA, ps);
  const fl: Light[] = o.flash ? [{ p: cam.pos, r: 2.6, col: [0.5, 0.5, 0.52] }] : [];
  return {
    cam, room: [CLUB_W, CLUB_H, CLUB_D], room0: ROOM0, set: 2, time: t,
    amb: mix3([0.3, 0.22, 0.34], [0.14, 0.26, 0.16], mood), ambChar: o.flash ? [0.92, 0.9, 0.92] : mix3([0.74, 0.64, 0.8], [0.64, 0.8, 0.66], mood),
    club: { mood, bps, led: [X(6.0), 2.9], floor: [X(DANCE.s[1]), DANCE.z[0], X(DANCE.s[0]), DANCE.z[1]] },
    beams: beamsFor(mood, t),
    // nobody stands where the cast stand, or where the camera is (whoever holds it is standing in the crowd)
    crowd: o.crowd === null ? undefined : crowdFor(o.crowd ?? {}, [...(cam.pos[1] < 2.2 ? [[X(0) - cam.pos[0], cam.pos[2]] as [number, number]] : []), ...acts.map((a) => a.at)]),
    boxes: CLUB_BOXES, softs: ps.map((p) => p.soft), lights: [...lightsFor(mood, t, bps), ...fl, ...ps.flatMap((p) => p.lights)],
    props: ps.flatMap((p) => p.props), shadows: ps.flatMap((p) => p.shadows),
  };
};

// cameras, in (s, y, z)
export const CLUB_CAMS: Record<string, Cam3> = {
  low: C([6.0, 0.4, 5.15], [6.0, 1.45, 8.0], 66), // low, from the edge of the circle: Nio owns the room, the booth behind him
  wide: C([6.0, 2.6, 0.5], [6.0, 0.5, 7.5], 50), // from the back of the room, over the heads
  booth: C([6.0, 3.25, 11.6], [6.0, 0.0, 6.2], 64), // high and wide from the DJ booth, down on the whole floor
  mid: C([6.0, 1.35, 4.8], [6.0, 1.15, 6.4], 38),
  close: C([6.0, 1.55, 5.3], [6.0, 1.5, 6.4], 30),
  floor: C([6.0, 0.32, 5.5], [6.0, 0.42, 6.4], 46), // at floor level, for the crouch
  sweepTwo: C([6.33, 0.42, 4.75], [6.33, 0.62, 6.5], 62), // Nio and the girl crouched side by side, from just outside the circle
  girlUp: C([6.55, 0.45, 5.45], [6.75, 1.45, 6.6], 62), // low on the girl as she stands up to the whole club
};

// What a shot in the club asks of the room and the crowd, frame by frame. Any number can be [frame, value] keys,
// eased between: the crouch spreading out from Nio over a shot, the drop putting every arm up at once.
export type Key = number | [number, number][];
export type ClubSpec = { mood?: Key; bpm?: number; flash?: boolean;
  crowd?: { dance?: Key; crouch?: Key; armsUp?: Key; headsUp?: Key; spread?: Key; faces?: Key; seed?: number; fill?: number } | null };
export const keyAt = (k: Key | undefined, frame: number, dflt: number): number => {
  if (k === undefined) return dflt; if (typeof k === 'number') return k;
  if (frame <= k[0][0]) return k[0][1]; const last = k[k.length - 1]; if (frame >= last[0]) return last[1];
  for (let i = 1; i < k.length; i++) if (frame <= k[i][0]) { const [f0, v0] = k[i - 1], [f1, v1] = k[i]; const u = (frame - f0) / Math.max(1, f1 - f0), e = u * u * (3 - 2 * u); return v0 + (v1 - v0) * e; }
  return last[1];
};
export const clubAt = (c: ClubSpec = {}, frame: number): ClubOpts => {
  const w = c.crowd;
  return { time: frame / 24, mood: keyAt(c.mood, frame, 0), bpm: c.bpm, flash: c.flash,
    crowd: w === null ? null : { dance: keyAt(w?.dance, frame, 1), crouch: keyAt(w?.crouch, frame, 0), armsUp: keyAt(w?.armsUp, frame, 0), headsUp: keyAt(w?.headsUp, frame, 0),
      spread: keyAt(w?.spread, frame, 99), faces: Math.round(keyAt(w?.faces, frame, 0)), ...(w?.seed !== undefined ? { seed: w.seed } : {}), ...(w?.fill !== undefined ? { fill: w.fill } : {}) } };
};
