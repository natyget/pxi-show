// THE CAMPUS, for Office Hours: the rooms of one old teaching building. Each room is its own box, like Nio's room and
// the club, sized and dressed here; the shader paints its walls, floor and ceiling (CAMPUS_GLSL) by which room it is.
//  - the waiting room outside Prof H's office: plastic chairs along both walls, a ticket machine, a clock, and the
//    inner door with NOW SERVING over it
// Positions are (s, y, z) as everywhere: s from the wall on the LEFT of the picture when you face the far wall, z toward
// the far wall. Each room sits so that X(s) from room.ts still gives world x.
// Signs (words and pictures on things) are drawn by tools/signs.py into one atlas; a box shows one with `sign`.
import { V, add } from './vec';
import { Scene3, Box, Light, Cam3, Soft, Obb, CrowdSpec } from './types';
import { Act, pose, P3, X, C, CamArg, camOf, lensActs } from './room';

// ---- the shader side: walls, floors and ceilings of every campus room, signs and the clock ----
export const CAMPUS_GLSL = `
// ==== the campus ====
uniform vec4 uCampus; // x: the room (0 lecture hall, 1 corridor, 2 waiting room, 3 office, 4 outdoors), y: how far the
                      // door is open (0..1), z: world x of that door's centre, w: 0 the door is in the far wall, 1 in the
                      // near wall and it opens onto the sunny quad
uniform sampler2D uSign; uniform vec2 uSignSz; uniform vec4 uBs[NB]; // the sign atlas, its size, and each box's sign
// rectangle (or the clock's hands: x 1 = it has hands, y the hour hand's angle, z the minute hand's, clockwise from 12)

// speckled vinyl tiles, two close tones in a check, with a fine fleck
vec3 vinyl(vec2 q, vec3 a, vec3 b, float s, float fp){
  vec2 ti = floor(q / s), tf = fract(q / s) * s; vec3 c = mod(ti.x + ti.y, 2.0) < 0.5 ? a : b;
  float f = hash(floor(q / 0.03)); c *= f > 0.9 ? 0.9 : f < 0.06 ? 1.07 : 1.0;
  if (tf.x < max(0.006, fp * 0.5) || tf.y < max(0.006, fp * 0.5)) c *= 0.86;
  return c;
}
// a door in a wall, centred at q = 0 on the floor: a frame, and either the closed door (wood, a frosted window high
// up) or, open, the warm light of the room behind it
// the quad through an open door, in the sun: sky, a tree, the grass and a path
vec3 quadView(vec2 q){
  if (q.y < 0.82){ vec3 g = vec3(0.47, 0.74, 0.3) * (0.94 + 0.12 * hash(floor(q * 18.0))); if (abs(q.x + (0.82 - q.y) * 0.35) < 0.08 + (0.82 - q.y) * 0.25) g = vec3(0.86, 0.8, 0.66); return g; }
  vec2 tc = q - vec2(-0.16, 1.36);
  if (length(tc * vec2(1.0, 1.15)) < 0.3) return vec3(0.3, 0.56, 0.26) * (0.9 + 0.15 * hash(floor(q * 14.0)));
  if (abs(q.x + 0.16) < 0.035 && q.y < 1.2) return vec3(0.42, 0.3, 0.22);
  return mix(vec3(0.72, 0.87, 0.98), vec3(0.52, 0.74, 0.96), smoothstep(0.9, 2.0, q.y));
}
void campusDoor(inout vec3 c, inout float em, vec2 q, float open, float fp){
  if (abs(q.x) > 0.52 || q.y > 2.12) return;
  c = vec3(0.24, 0.17, 0.15);
  if (abs(q.x) > 0.45 || q.y > 2.05) return;
  if (open > 0.01 && uCampus.w > 0.5){ c = quadView(q); em = 1.0; return; }
  if (open > 0.01){ // the light inside, warm, brightest low down where it spills toward us
    c = mix(vec3(1.0, 0.78, 0.45), vec3(0.93, 0.6, 0.32), smoothstep(0.2, 2.0, q.y)); em = 1.0; return; }
  c = vec3(0.5, 0.33, 0.24) * (0.95 + 0.08 * hash(vec2(floor((q.x + 0.45) / 0.15), 2.0)));
  vec2 w = abs(vec2(q.x, q.y - 1.62)) - vec2(0.26, 0.24);
  if (max(w.x, w.y) < 0.0){ c = vec3(0.78, 0.8, 0.74); if (max(w.x, w.y) > -max(0.018, fp)) c = vec3(0.3, 0.22, 0.2); }
  if (length(q - vec2(0.36, 1.02)) < max(0.032, fp * 1.1)) c = vec3(0.78, 0.66, 0.4);
}
vec3 campusFloor(vec3 p, float fp, vec2 px, out float em){
  em = 0.0; float k = uCampus.x; vec3 c;
  if (k < 0.5) return vec3(0.243, 0.275, 0.345) * mott(p * 1.4, 2.2); // the lecture hall: blue carpet
  if (k > 2.5 && k < 3.5){ c = vec3(0.42, 0.24, 0.21) * mott(p * 1.4, 2.2); } // the office: old red-brown carpet
  else if (k > 1.5 && k < 2.5) c = vinyl(p.xz, vec3(0.53, 0.56, 0.55), vec3(0.47, 0.5, 0.5), 0.33, fp);
  else c = vinyl(p.xz, vec3(0.5, 0.48, 0.46), vec3(0.45, 0.43, 0.42), 0.33, fp);
  // the warm light from the open door, spilling across the floor toward us, in hard steps
  float o = uCampus.y; bool sun = uCampus.w > 0.5;
  if (o > 0.01){ float dz = sun ? p.z - uRoom0.z : uRoom0.z + uRoom.z - p.z, dx = abs(p.x - uCampus.z);
    float wedge = 0.44 + dz * 0.3 * o; float r = dz / ((sun ? 2.6 : 3.4) * o);
    if (dz > 0.0 && dx < wedge && r < 1.0){ float s = floor((1.0 - r) * 3.0 + 0.5 + (bayer(px) - 0.5) * 0.5) / 3.0;
      c = mix(c, sun ? c * vec3(2.1, 1.95, 1.55) + vec3(0.06, 0.05, 0.02) : c * vec3(1.85, 1.45, 0.95) + vec3(0.07, 0.04, 0.0), s); } }
  return c;
}
vec3 campusWall(vec3 p, int w, float fp, vec2 px, out float em, out vec3 add){
  em = 0.0; add = vec3(0.0); float k = uCampus.x;
  if (w == 2){ // a dropped ceiling: square tiles, with the fluorescent panels set in it
    vec2 q = p.xz; vec2 tf = fract(q / 0.6) * 0.6; vec3 c = vec3(0.74, 0.74, 0.7) * mott(p, 0.5);
    if (tf.x < max(0.012, fp * 0.7) || tf.y < max(0.012, fp * 0.7)) c *= 0.8;
    float cx = uRoom0.x + uRoom.x * 0.5;
    if (k < 0.5){ // the lecture hall: five panels, two rows over the seats and one over the lectern
      for (int i = 0; i < 5; i++){ vec2 at = i < 4 ? vec2(i % 2 == 0 ? 2.2 : 6.2, i < 2 ? 3.0 : 6.5) : vec2(4.2, 8.8);
        vec2 d = abs(q - vec2(uRoom0.x + uRoom.x - at.x, at.y)) - vec2(0.3, 0.6);
        if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.03, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.96, 0.95, 0.88); em = 1.0; } } }
    if (k > 2.5 && k < 3.5){ vec2 d = abs(q - vec2(cx, uRoom0.z + 1.65)) - vec2(0.3, 0.3);
      if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.03, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.96, 0.95, 0.88); em = 1.0; } }
    if (k > 1.5 && k < 2.5){ for (int i = 0; i < 2; i++){ vec2 d = abs(q - vec2(cx, 2.2 + 2.2 * float(i))) - vec2(0.3, 0.6);
      if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.03, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.92, 0.97, 0.9); em = 1.0; } } }
    return c;
  }
  vec2 uv = (w == 3 || w == 6) ? p.xy : p.zy;
  if (k < 0.5){ // the lecture hall: wood panelling up to a line that climbs with the rows, pale acoustic panels above;
    // the front wall a deep slate behind the screen
    float top = w == 3 ? 1.05 : w == 6 ? 3.85 : 1.05 + clamp((7.2 - p.z) / 0.9, 0.0, 7.0) * 0.4;
    if (uv.y < top){ vec3 c = vec3(0.45, 0.33, 0.25); float sy = floor(uv.y / 0.16); float st = hash(vec2(sy, floor(uv.x / 0.9 + hash(vec2(sy, 3.0)) * 2.0)));
      c *= st > 0.84 ? 0.9 : st < 0.14 ? 1.08 : 1.0; if (fract(uv.y / 0.16) * 0.16 < max(0.008, fp * 0.6)) c *= 0.8;
      if (top - uv.y < max(0.035, fp)) c = vec3(0.32, 0.23, 0.18); return c; }
    if (w == 3) return vec3(0.26, 0.29, 0.34) * mott(p, 0.6);
    vec3 c = vec3(0.7, 0.68, 0.62) * mott(p, 0.5); vec2 g = fract(vec2(uv.x / 1.2, (uv.y - top) / 0.9));
    if (min(g.x * 1.2, g.y * 0.9) < max(0.012, fp * 0.7)) c *= 0.82;
    return c; }
  // institutional paint: a darker band below the rail, a pale one above, a dark skirting. The office: wood below, cream above
  bool off = k > 2.5 && k < 3.5;
  vec3 lo = off ? vec3(0.44, 0.31, 0.23) : vec3(0.42, 0.52, 0.45), hi = off ? vec3(0.84, 0.78, 0.63) : vec3(0.76, 0.78, 0.66);
  vec3 c = (uv.y < 1.0 ? lo : hi) * mott(p, 0.6);
  if (abs(uv.y - 1.0) < max(0.022, fp * 0.8)) c = vec3(0.34, 0.4, 0.36);
  if (uv.y < 0.1) c = vec3(0.24, 0.26, 0.25);
  if (off && uv.y < 1.0){ float sy = floor(uv.y / 0.14); float st = hash(vec2(sy, floor(uv.x / 0.8 + hash(vec2(sy, 5.0)) * 2.0))); c *= st > 0.84 ? 0.9 : st < 0.14 ? 1.08 : 1.0; }
  if ((w == 3 && uCampus.w < 0.5) || (w == 6 && uCampus.w > 0.5)) campusDoor(c, em, vec2((w == 6 ? -1.0 : 1.0) * (p.x - uCampus.z), p.y), uCampus.y, fp);
  return c;
}
// a sign on the front face of a box (mat 7): read from the atlas at the fineness this shot can hold
vec3 signFace(vec3 base, vec3 pl, vec3 h, vec3 bn, int i, float fp){
  if (bn.z < 0.5) return base * mott(pl, 0.6);
  vec4 r = uBs[i]; vec2 uv = clamp(pl.xy / h.xy * 0.5 + 0.5, 0.0, 1.0);
  float lod = log2(max(fp * (r.z - r.x) * uSignSz.x / (2.0 * h.x), 1.0));
  vec4 s = textureLod(uSign, mix(r.xy, r.zw, uv), lod);
  return mix(base, s.rgb, s.a);
}
// a sign lying flat on the top face of a box (mat 9): the top of the picture toward local -z
vec3 signTop(vec3 base, vec3 pl, vec3 h, vec3 bn, int i, float fp){
  if (bn.y < 0.5) return base * 0.8;
  vec4 r = uBs[i]; vec2 uv = clamp(vec2(pl.x / h.x, -pl.z / h.z) * 0.5 + 0.5, 0.0, 1.0);
  float lod = log2(max(fp * (r.z - r.x) * uSignSz.x / (2.0 * h.x), 1.0));
  vec4 s = textureLod(uSign, mix(r.xy, r.zw, uv), lod);
  return mix(base, s.rgb, s.a);
}
// a wall clock (mat 8), round: a pale face, a dark rim, twelve ticks, and hands if it has them
vec3 clockFace(vec3 pl, vec3 h, int i, float fp){
  float R = min(h.x, h.y); vec2 q = pl.xy / R; float r = length(q); float lw = max(0.035, fp / R);
  if (r > 0.86) return vec3(0.16, 0.14, 0.15);
  vec3 c = vec3(0.92, 0.9, 0.84);
  float a = atan(q.x, q.y); float tick = abs(fract(a / 0.5236 + 0.5) - 0.5) * 0.5236 * r;
  if (r > 0.66 && r < 0.78 && tick < lw * 0.6) c = vec3(0.2, 0.18, 0.19);
  vec4 b = uBs[i];
  if (b.x > 0.5){ for (int k = 0; k < 2; k++){ float ang = k == 0 ? b.y : b.z, L = k == 0 ? 0.42 : 0.66; vec2 d = vec2(sin(ang), cos(ang));
      float al = dot(q, d), pe = abs(q.x * d.y - q.y * d.x); if (al > -0.08 && al < L && pe < lw * (k == 0 ? 1.0 : 0.7)) c = vec3(0.12, 0.1, 0.11); }
    if (r < lw * 1.4) c = vec3(0.12, 0.1, 0.11); }
  return c;
}
`;

// ---- the rooms ----
const B = (s: number, y: number, z: number, hx: number, hy: number, hz: number, col: string, obj: number, x: Partial<Box> = {}): Box => ({ c: P3(s, y, z), h: [hx, hy, hz], col, obj, ...x });
// a box seen from the room on one face: front faces toward the camera end (-z), or into the room from a side wall
export const FACING = { us: 180, left: 270, right: 90, away: 0 }; // us: toward the near wall. left/right: toward s = 0 / s = max

// THE WAITING ROOM: 3 wide, 2.7 high, 5.8 deep, narrow so both rows and the door fit the tall frame. The inner door (Prof H's) in the middle of the far wall, NOW SERVING
// over it, the clock to its right. A row of linked plastic chairs along each side wall, five a side, facing across.
// The ticket machine by the way in, on the right.
export const WAIT = { w: 3.0, h: 2.7, d: 5.8, door: 1.5, rowS: [0.42, 2.58], seatZ: [2.0, 2.6, 3.2, 3.8, 4.4] };
const CHAIR = '#4e8a8c', FRAME = '#5a5c60';
const chairs = (s: number, side: 1 | -1, o: number): Box[] => [
  B(s, 0.2, 3.2, 0.03, 0.03, 1.38, FRAME, o), // the rail they are all bolted to
  ...WAIT.seatZ.flatMap((z, i) => [
    B(s, 0.43, z, 0.21, 0.025, 0.21, CHAIR, o + 1 + i), B(s - side * 0.2, 0.7, z, 0.022, 0.2, 0.2, CHAIR, o + 1 + i), // seat and back
    B(s, 0.21, z, 0.015, 0.21, 0.015, FRAME, o), // the post under each seat
  ]),
];
export type WaitOpts = { door?: Keyed; serving?: 3 | 4; clock?: null | [number, number]; ticketMachine?: boolean };
export const waitBoxes = (o: WaitOpts = {}, f = 0): Box[] => {
  const zF = WAIT.d, open = keyed(o.door, f, 0);
  const bs: Box[] = [
    ...chairs(WAIT.rowS[0], 1, 1), ...chairs(WAIT.rowS[1], -1, 20),
    // NOW SERVING over the door, lit
    B(WAIT.door, 2.36, zF - 0.06, 0.3, 0.15, 0.05, '#161214', 40, { yaw: FACING.us, mat: 7, sign: `nowServing${o.serving ?? 3}`, glow: true }),
    // the clock, right of the door, high: no hands, until the end
    B(WAIT.door + 0.98, 2.0, zF - 0.03, 0.17, 0.17, 0.025, '#e8e4da', 41, { yaw: FACING.us, mat: 8, clock: o.clock ? [1, o.clock[0], o.clock[1]] : [0, 0, 0], noShadow: true }),
    // the ticket machine: a post with a red head, TAKE A NUMBER on its face, toward the room
    B(2.84, 0.55, 0.55, 0.1, 0.55, 0.1, '#9a968e', 42), B(2.8, 1.24, 0.55, 0.14, 0.15, 0.14, '#b8322c', 43, { yaw: FACING.left, mat: 7, sign: 'takeNumber' }),
    B(2.65, 1.12, 0.55, 0.012, 0.012, 0.05, '#2a2224', 43), // the slot the ticket comes out of
  ];
  if (open > 0.01) {
    // the door itself, swung in toward us on its left hinge
    const a = open * 1.45, hs = WAIT.door - 0.45, L = 0.9;
    const cs = hs + Math.cos(a) * L * 0.5, cz = zF - Math.sin(a) * L * 0.5;
    bs.push({ c: P3(cs, 1.025, cz), h: [0.45, 1.025, 0.022], col: '#80553e', obj: 44, yaw: (a * 180) / Math.PI });
  }
  return bs;
};
export const WAIT_CAMS: Record<string, Cam3> = {
  aisle: C([1.5, 1.2, 0.2], [1.5, 1.32, 5.8], 74), // straight down the middle: knees either side, the door, the sign, the clock
  wide: C([2.75, 2.15, 0.3], [0.9, 0.75, 4.0], 66), // high from the corner by the way in: the left row, and the door
  two: C([2.45, 1.02, 3.5], [0.47, 1.0, 3.5], 58), // across the room at the left row: Nio and Darnell side by side
  nio: C([1.9, 1.15, 3.05], [0.47, 1.12, 3.2], 36), // Nio, sitting, from across
  darnell: C([1.95, 1.2, 3.95], [0.47, 1.2, 3.8], 40), // Darnell, sitting, from across
  waiters: C([0.7, 1.1, 2.1], [2.53, 0.98, 3.85], 58), // the other row from Nio's seat: the spinner boy and the flower-crown girl
  door: C([0.95, 1.12, 2.4], [1.5, 1.5, 5.8], 56), // from the seats up at the door: who comes out of it
  sign: C([1.5, 1.55, 4.1], [1.5, 2.3, 5.8], 34), // insert: NOW SERVING
  clock: C([2.1, 1.7, 4.6], [2.48, 2.0, 5.8], 30), // insert: the clock
};
export const WAIT_INSERTS = ['sign', 'clock']; // cameras on things, not people
export const WAIT_MARKS = {
  seatL3: { s: 0.47, z: 3.2, yaw: 270, seat: 0.455 },
  seatL4: { s: 0.47, z: 3.8, yaw: 270, seat: 0.455 }, seatL5: { s: 0.47, z: 4.4, yaw: 270, seat: 0.455 },
  seatR3: { s: 2.53, z: 3.2, yaw: 90, seat: 0.455 }, seatR4: { s: 2.53, z: 3.8, yaw: 90, seat: 0.455 }, seatR5: { s: 2.53, z: 4.4, yaw: 90, seat: 0.455 },
  doorway: { s: 1.5, z: 5.55, yaw: 180 }, // in the inner door, facing in
  middle: { s: 1.5, z: 3.4, yaw: 180 }, // the middle of the floor
};
export const WAIT_SOLIDS = [
  { name: 'the left row of chairs', s: [0.0, 0.62] as [number, number], z: [1.8, 4.6] as [number, number] },
  { name: 'the right row of chairs', s: [2.38, 3.0] as [number, number], z: [1.8, 4.6] as [number, number] },
  { name: 'the ticket machine', s: [2.62, 3.0] as [number, number], z: [0.38, 0.75] as [number, number] },
];

// the light: two fluorescent panels, cold and a little green; the warm door when it is open
const waitLights = (o: WaitOpts, f: number): Light[] => [
  { p: P3(1.5, 2.55, 2.2), r: 3.4, col: [0.46, 0.52, 0.47] }, { p: P3(1.5, 2.55, 4.4), r: 3.4, col: [0.46, 0.52, 0.47] },
  ...(keyed(o.door, f, 0) > 0.01 ? [{ p: P3(WAIT.door, 1.3, WAIT.d - 0.25), r: 2.6 * keyed(o.door, f, 0) + 0.6, col: [0.75, 0.5, 0.24] as V, halo: 0.12 }] : []),
];

// THE LECTURE HALL: 8.4 wide, 4.8 high, 10.5 deep. The front is the far wall: the projector screen, two speakers high
// in the corners, the lectern at the bottom centre with a laptop and a gooseneck mic. Seven rows of desks climb toward
// the back, each 0.4 higher; row 1 is the front. An aisle with steps runs up the right side. The crowd sits in the rows
// (crowd.ts, sitting), and turns to look when told to. Nio has the aisle seat in row 4, Theo is on his left, the
// dusty seat on Theo's left, the cap girl in row 3 in front of Nio.
export const HALL = { w: 8.4, h: 4.8, d: 10.5, rows: 7, rise: 0.4, front: 7.2, depth: 0.9, seats: [0.5, 6.9] as [number, number], aisle: [6.9, 8.0] as [number, number],
  lectern: { s: 4.2, z: 8.5 } };
export const rowY = (row: number) => (row - 1) * HALL.rise; // the floor of a row (row 1 = the front)
export const rowZ = (row: number) => HALL.front - (row - 1) * HALL.depth; // the front edge of a row
export const seatZ = (row: number) => rowZ(row) - 0.6; // where a person sits in it
export const seatS = (k: number) => HALL.seats[1] - 0.64 * (k + 0.5); // seat k from the aisle (0 = the aisle seat)
const CARPET = '#3e4658', DESK = '#8a6a4e', BENCH = '#5a4a44';
// A value that can change during the shot: a number, or keys [[frame, value], ...] eased between (held before the first
// and after the last). turn: [[10, 0], [14, 1]] has every head come round between frames 10 and 14.
export type Keyed = number | [number, number][];
export const keyed = (k: Keyed | undefined, frame: number, dflt: number): number => {
  if (k === undefined) return dflt; if (typeof k === 'number') return k;
  if (frame <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (frame <= k[i][0]) { const u = (frame - k[i - 1][0]) / Math.max(1e-6, k[i][0] - k[i - 1][0]), e = u * u * (3 - 2 * u); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * e; }
  return k[k.length - 1][1];
};
// laptop: how open Prof H's laptop is (1 open .. 0 shut). turn: how far every student's head has come round to stare at
// Nio (0 .. 1). crowd: how full the rows are (0 .. 1, null for empty). dusty: the empty seat by Theo, with its dust.
export type HallOpts = { laptop?: Keyed; turn?: Keyed; crowd?: number | null; dusty?: boolean };
export const hallBoxes = (o: HallOpts = {}): Box[] => {
  const bs: Box[] = [], cs = (HALL.seats[0] + HALL.seats[1]) / 2, ch = (HALL.seats[1] - HALL.seats[0]) / 2;
  for (let r = 1; r <= HALL.rows; r++) {
    const y = rowY(r), z1 = rowZ(r), id = 1 + r * 6;
    if (r > 1) bs.push(B(HALL.w / 2, y / 2, z1 - 0.45, HALL.w / 2, y / 2, 0.45, CARPET, id, { mat: 2 })); // the riser
    bs.push(B(cs, y + 0.43, z1 - 0.6, ch, 0.03, 0.2, BENCH, id + 1)); // the bench
    bs.push(B(cs, y + 0.64, z1 - 0.83, ch, 0.15, 0.035, BENCH, id + 2)); // its back, low, so a face turned round shows over it
    bs.push(B(cs, y + 0.76, z1 - 0.13, ch, 0.025, 0.14, DESK, id + 3, { mat: 1 })); // the desk
    bs.push(B(cs, y + 0.37, z1 - 0.02, ch, 0.37, 0.02, DESK, id + 4, { mat: 1 })); // the panel under it
    if (r > 1) bs.push(B((HALL.aisle[0] + HALL.aisle[1]) / 2, y - HALL.rise / 2 + 0.005, z1 - 0.225, (HALL.aisle[1] - HALL.aisle[0]) / 2, HALL.rise / 2, 0.225, CARPET, id + 5, { mat: 2 })); // a half step in the aisle
  }
  const yb = rowY(HALL.rows + 1); bs.push(B(HALL.w / 2, yb / 2, (rowZ(HALL.rows) - 0.9) / 2, HALL.w / 2, yb / 2, (rowZ(HALL.rows) - 0.9) / 2, CARPET, 60, { mat: 2 })); // the walkway at the back
  const L = HALL.lectern;
  bs.push(B(L.s, 0.55, L.z, 0.34, 0.55, 0.24, '#6e5040', 61, { mat: 1 }), B(L.s, 1.115, L.z + 0.02, 0.38, 0.015, 0.28, '#5e4236', 61)); // the lectern
  bs.push(B(L.s + 0.05, 1.14, L.z + 0.08, 0.17, 0.008, 0.12, '#4a4a52', 62)); // the laptop's base, its hinge toward the room
  bs.push(B(L.s, 2.95, HALL.d - 0.04, 1.65, 0.93, 0.03, '#e8eaf0', 63, { yaw: FACING.us, mat: 7, sign: 'slide', glow: true })); // the screen, lit
  bs.push(B(0.7, 3.75, HALL.d - 0.25, 0.26, 0.36, 0.2, '#1c1a1e', 64, { yaw: FACING.us, mat: 5 }), B(HALL.w - 0.7, 3.75, HALL.d - 0.25, 0.26, 0.36, 0.2, '#1c1a1e', 65, { yaw: FACING.us, mat: 5 })); // the speakers
  if (o.dusty ?? true) {
    // the empty seat on Theo's left: a water bottle and the 2019 planner, under dust
    const sz = seatZ(4), sy = rowY(4) + 0.46, ss = seatS(2);
    bs.push(B(ss + 0.06, sy + 0.012, sz + 0.02, 0.11, 0.012, 0.15, '#4a5c70', 66, { yaw: 8, mat: 9, sign: 'planner' }));
  }
  return bs;
};
// the laptop's lid (open 1 .. shut 0) and the gooseneck mic, and the water bottle on the dusty seat
const hallProps = (o: HallOpts, f: number): Obb[] => {
  const L = HALL.lectern, k = keyed(o.laptop, f, 1), a = k * 1.85, hinge = P3(L.s + 0.05, 1.148, L.z - 0.04);
  // the lid turns about the hinge on the far edge of the base from Prof H; open, its screen faces him
  const y: V = [0, Math.sin(a), Math.cos(a)], z: V = [0, -Math.cos(a), Math.sin(a)], c: V = [hinge[0], hinge[1] + y[1] * 0.12, hinge[2] + y[2] * 0.12];
  return [{ c, x: [1, 0, 0], y, z, h: [0.17, 0.12, 0.006], col: '#4a4a52', screen: k < 0.05 ? '#4a4a52' : '#c8d4f0' }];
};
const hallSofts = (o: HallOpts): Soft[] => {
  const L = HALL.lectern, m = (s: number, y: number, z: number): V => P3(s, y, z);
  const neck = [m(L.s - 0.2, 1.13, L.z - 0.1), m(L.s - 0.21, 1.4, L.z - 0.06), m(L.s - 0.15, 1.58, L.z + 0.12), m(L.s - 0.08, 1.63, L.z + 0.28)];
  const prims = [0, 1, 2].map((i) => ({ a: neck[i], ra: 0.011, b: neck[i + 1], rb: 0.011, g: 0, k: 0.01, c: '#2a2628' }));
  prims.push({ a: neck[3], ra: 0.024, b: m(L.s - 0.07, 1.635, L.z + 0.34), rb: 0.026, g: 1, k: 0.01, c: '#3a3638' });
  const out: Soft[] = [{ prims, origin: neck[0] }];
  if (o.dusty ?? true) { const b = P3(seatS(2) - 0.12, rowY(4) + 0.46, seatZ(4) - 0.05);
    out.push({ prims: [{ a: b, ra: 0.034, b: [b[0], b[1] + 0.2, b[2]], rb: 0.034, g: 0, k: 0.01, c: '#9fc4d6' }, { a: [b[0], b[1] + 0.2, b[2]], ra: 0.02, b: [b[0], b[1] + 0.24, b[2]], rb: 0.018, g: 1, k: 0.005, c: '#3f7ea0' }], origin: b }); }
  return out;
};
// cam: nobody sits where the camera is, so no head fills the lens
export const hallCrowd = (o: HallOpts, cast: [number, number][], look: V, cam: Cam3, f: number): CrowdSpec | undefined => {
  if (o.crowd === null) return undefined;
  // nobody else ever sits in the cast's seats or the dusty one, whether or not the shot has them in it
  const seats: [number, number][] = [...Object.values(HALL_MARKS).filter((m) => 'seat' in m).map((m) => [m.s, m.z] as [number, number]), [seatS(2), seatZ(4)]];
  cast.forEach((c) => { if (!seats.some((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) < 0.3)) seats.push(c); });
  // and nobody sits just in front of the lens
  const fl = Math.hypot(cam.at[0] - cam.pos[0], cam.at[2] - cam.pos[2]) || 1;
  const lens: [number, number, number] = [cam.pos[0] + ((cam.at[0] - cam.pos[0]) / fl) * 0.25, cam.pos[2] + ((cam.at[2] - cam.pos[2]) / fl) * 0.25, 0.5];
  const nx = 10, x0 = X(HALL.seats[1]);
  return { x0, z0: seatZ(HALL.rows) - 0.45, cw: 0.64, cd: HALL.depth, nx, nz: HALL.rows, seed: 5, fill: o.crowd ?? 0.8,
    dance: 0, crouch: 0, armsUp: 0, headsUp: 0, clear: [0, -99, 0], spread: 0, face: [X(HALL.lectern.s), HALL.d + 1.5], ring: 0, faces: 4,
    holes: [...seats.map(([s, z]) => [X(s), z, 0.3] as [number, number, number]), lens], sit: [-HALL.rise, 0.46], turn: keyed(o.turn, f, 0), lookAt: look };
};
export const HALL_CAMS: Record<string, Cam3> = {
  low: C([4.5, 1.05, 7.3], [4.2, 1.9, 9.3], 58), // low and wide from the front row: Prof H fills the frame at the lectern, the screen behind
  profH: C([4.85, 1.92, 7.7], [4.2, 1.86, 9.1], 34), // close on Prof H at the mic, from Nio's side of the room
  rows: C([4.6, 2.6, 9.2], [6.25, 2.09, 3.9], 40), // wide from the lectern up the rows, Nio in the middle of it: Prof H's view of him
  capGirl: C([7.2, 2.14, 6.3], [6.52, 2.14, 4.4], 46), // from the aisle: the cap girl in row 3, Nio behind her in row 4
  two: C([7.75, 2.64, 5.6], [6.3, 2.29, 3.9], 50), // Nio and Theo, from the aisle steps
  nio: C([7.5, 2.64, 5.65], [6.58, 2.32, 3.9], 34), // Nio in his seat, from the aisle steps
  theo: C([5.55, 2.64, 5.45], [5.94, 2.34, 3.9], 34), // Theo in his seat, from the row in front
  seat: C([5.36, 2.74, 4.3], [5.3, 1.67, 3.88], 34), // insert: the empty seat on Theo's left, from over the desk
};
export const HALL_INSERTS = ['seat'];
export const HALL_MARKS = {
  lectern: { s: HALL.lectern.s, z: 9.05, yaw: 180, who: 'profH' }, // behind the lectern, facing the room
  nio: { s: seatS(0), z: seatZ(4), yaw: 0, seat: rowY(4) + 0.46 }, // row 4, the aisle seat
  theo: { s: seatS(1), z: seatZ(4), yaw: 0, seat: rowY(4) + 0.46 }, // on Nio's left
  capGirl: { s: seatS(0) - 0.08, z: seatZ(3), yaw: 0, seat: rowY(3) + 0.46 }, // row 3, in front of Nio
};
export const HALL_SOLIDS = [{ name: 'the lectern', s: [3.8, 4.6] as [number, number], z: [8.2, 8.8] as [number, number] }];
const hallLights = (): Light[] => [
  { p: P3(2.2, 4.4, 3.0), r: 4.6, col: [0.34, 0.33, 0.3] }, { p: P3(6.2, 4.4, 3.0), r: 4.6, col: [0.34, 0.33, 0.3] },
  { p: P3(2.2, 4.4, 6.5), r: 4.6, col: [0.32, 0.31, 0.29] }, { p: P3(6.2, 4.4, 6.5), r: 4.6, col: [0.32, 0.31, 0.29] },
  { p: P3(4.2, 4.2, 8.8), r: 3.6, col: [0.42, 0.39, 0.34] }, { p: P3(4.2, 2.9, 10.1), r: 2.6, col: [0.22, 0.24, 0.3] }, // over the lectern; the screen's glow
];

// THE OFFICE: tiny. 2.6 wide, 2.5 high, 3.3 deep. Prof H's desk across it, near the far wall, with his high-backed
// chair folded in behind it; the HANG IN THERE poster over his shoulder; a bookcase on the right wall; on the desk a
// lamp, a mug, papers and a bobblehead of himself. The visitor's chair faces the desk; the door is behind it, in the
// near wall: it opens onto the sunny quad.
export const OFF = { w: 2.6, h: 2.5, d: 3.3, door: 1.3, desk: { s: 1.3, z: 2.2, hw: 0.72, hd: 0.3, top: 0.745 } };
const FLY = { s: 1.2, z0: 2.4, z1: 2.04 }; // the flyer slides from Prof H's side of the desk to Nio's
// door: how open the door is (0 shut .. 1 open, the quad beyond). flyer: where the improv flyer is on the desk, 0 at
// Prof H's side .. 1 in front of Nio, keyed by frame to slide it (with Prof H's hold slideFlyer, his hand goes with it);
// left out, there is no flyer.
export type OfficeOpts = { door?: Keyed; flyer?: Keyed };
const flyerAt = (o: OfficeOpts, f: number): V | undefined => o.flyer === undefined ? undefined : P3(FLY.s, OFF.desk.top + 0.003, FLY.z0 + (FLY.z1 - FLY.z0) * keyed(o.flyer, f, 0));
const BOOKS = ['#7a3b47', '#3f6f78', '#c9a23a', '#4c5f8c', '#4f6142', '#a85a42', '#e3d8c4', '#2c262e'];
const officeBoxes = (o: OfficeOpts, f: number): Box[] => {
  const D = OFF.desk, W0 = '#6e4f3a', bs: Box[] = [
    // the desk: a top, a panel down the front (Nio's side), a drawer pedestal each end; Prof H's knees go between
    B(D.s, D.top - 0.02, D.z, D.hw, 0.022, D.hd, '#7a5a40', 1, { mat: 1 }), B(D.s, 0.37, D.z - D.hd + 0.02, D.hw, 0.35, 0.02, W0, 2, { mat: 1 }),
    B(D.s - D.hw + 0.2, 0.36, D.z, 0.2, 0.36, D.hd - 0.02, W0, 3, { mat: 1 }), B(D.s + D.hw - 0.2, 0.36, D.z, 0.2, 0.36, D.hd - 0.02, W0, 3, { mat: 1 }),
    B(D.s + 0.45, D.top + 0.012, D.z + 0.08, 0.14, 0.012, 0.18, '#ece6d6', 4, { yaw: 12 }), // a stack of papers
    // his chair: a high back, a seat, one post
    B(D.s, 0.45, 2.98, 0.28, 0.04, 0.25, '#3a3438', 5), B(D.s, 0.98, 3.2, 0.28, 0.46, 0.04, '#3a3438', 5), B(D.s, 0.21, 2.98, 0.03, 0.21, 0.03, '#2a2628', 5),
    // the visitor's chair, facing the desk
    B(D.s, 0.43, 1.35, 0.22, 0.03, 0.21, '#56705e', 6), B(D.s, 0.74, 1.15, 0.22, 0.28, 0.025, '#56705e', 6), // green seat and back
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => B(D.s + a * 0.19, 0.21, 1.35 + b * 0.18, 0.018, 0.21, 0.018, '#4a3428', 6)),
    // the poster over his shoulder, and the bookcase on the right wall
    B(0.62, 1.62, OFF.d - 0.01, 0.24, 0.32, 0.008, '#e8e2d2', 7, { yaw: FACING.us, mat: 7, sign: 'hangInThere' }),
    B(OFF.w - 0.15, 0.95, 2.45, 0.15, 0.95, 0.5, '#5e4434', 8, { mat: 1 }),
  ];
  // the books on its three shelves, spines to the room
  let k = 0;
  for (const y of [0.42, 0.92, 1.42]) { let z = 2.02;
    while (z < 2.86) { const t = 0.03 + 0.025 * ((k * 7) % 3), h = 0.17 + 0.03 * ((k * 5) % 4);
      bs.push(B(OFF.w - 0.31, y + h / 2, z + t, 0.008, h / 2, t, BOOKS[k % BOOKS.length], 9)); z += 2 * t + 0.006; k++; } }
  const door = keyed(o.door, f, 0);
  if (door > 0.01) {
    // the door, swung in on its hinge on the left wall's side, out of the way of the cameras
    const a = door * 1.5, hs = OFF.door - 0.45, L = 0.9, cs = hs + Math.cos(a) * L * 0.5, cz = Math.sin(a) * L * 0.5;
    bs.push({ c: P3(cs, 1.025, cz + 0.022), h: [0.45, 1.025, 0.022], col: '#80553e', obj: 10, yaw: (a * 180) / Math.PI });
  }
  const fp = flyerAt(o, f); if (fp) bs.push({ c: fp, h: [0.108, 0.002, 0.14], col: '#f6f3ea', obj: 11, yaw: 180 + 6, mat: 9, sign: 'flyer' });
  return bs;
};
// the lamp, the mug and the bobblehead of Prof H on the desk
const officeSofts = (): Soft[] => {
  const D = OFF.desk, t = D.top, m = (s: number, y: number, z: number): V => P3(s, y, z);
  const lamp = { prims: [
    { a: m(0.78, t, 2.36), ra: 0.07, b: m(0.78, t + 0.02, 2.36), rb: 0.07, g: 0, k: 0.01, c: '#2c4a3e' },
    { a: m(0.78, t + 0.02, 2.36), ra: 0.012, b: m(0.8, t + 0.36, 2.3), rb: 0.012, g: 0, k: 0.01, c: '#2c4a3e' },
    { a: m(0.8, t + 0.36, 2.3), ra: 0.04, b: m(0.88, t + 0.3, 2.16), rb: 0.075, g: 1, k: 0.01, c: '#2c4a3e', cutB: true },
    { a: m(0.875, t + 0.3, 2.17), ra: 0.035, b: m(0.875, t + 0.3, 2.17), rb: 0.035, g: 2, k: 0.004, c: '#fff1c8', em: 1 },
  ], origin: m(0.78, t, 2.36) };
  const mug = { prims: [{ a: m(1.72, t + 0.002, 1.98), ra: 0.04, b: m(1.72, t + 0.09, 1.98), rb: 0.04, g: 0, k: 0.004, c: '#c8553d', cutA: true, cutB: true },
    { a: m(1.765, t + 0.065, 1.98), ra: 0.012, b: m(1.765, t + 0.03, 1.98), rb: 0.012, g: 0, k: 0.02, c: '#c8553d' }], origin: m(1.72, t, 1.98) };
  // the bobblehead: a little Prof H on a round base, his big head, his hair, the dots of his glasses, his cardigan
  const bx = 1.86, bz = 2.04;
  const bob = { prims: [
    { a: m(bx, t, bz), ra: 0.035, b: m(bx, t + 0.015, bz), rb: 0.035, g: 0, k: 0.004, c: '#2a2628', cutA: true },
    { a: m(bx, t + 0.03, bz), ra: 0.028, b: m(bx, t + 0.075, bz), rb: 0.022, g: 1, k: 0.01, c: '#a8834f' },
    { a: m(bx, t + 0.115, bz), ra: 0.042, b: m(bx, t + 0.115, bz), rb: 0.042, g: 2, k: 0.004, c: '#e2b49a' },
    { a: m(bx + 0.004, t + 0.142, bz + 0.006), ra: 0.035, b: m(bx - 0.012, t + 0.15, bz + 0.01), rb: 0.032, g: 3, k: 0.01, c: '#857262' },
    { a: m(bx - 0.016, t + 0.12, bz - 0.036), ra: 0.008, b: m(bx - 0.016, t + 0.12, bz - 0.036), rb: 0.008, g: 4, k: 0.002, c: '#3a2c22' },
    { a: m(bx + 0.016, t + 0.12, bz - 0.036), ra: 0.008, b: m(bx + 0.016, t + 0.12, bz - 0.036), rb: 0.008, g: 4, k: 0.002, c: '#3a2c22' },
  ], origin: m(bx, t, bz) };
  return [lamp, mug, bob] as Soft[];
};
export const OFFICE_CAMS: Record<string, Cam3> = {
  wide: C([2.42, 2.05, 0.12], [1.22, 1.0, 2.3], 64), // from the corner by the door: Nio from behind in his chair, Prof H behind the desk, the poster
  nio: C([1.85, 1.32, 2.62], [1.3, 1.17, 1.35], 38), // close on Nio, from beside Prof H
  profH: C([1.78, 1.36, 1.4], [1.3, 1.44, 2.75], 32), // close on Prof H, from beside Nio
  door: C([1.3, 1.22, 0.14], [1.3, 1.22, 2.75], 36), // from the doorway: the chair Nio sat in, Prof H alone behind the desk, the sun on him
  flyer: C([1.2, 1.5, 1.66], [1.2, 0.745, 2.18], 44), // insert: the desk from Nio's side, the flyer coming across it
};
export const OFFICE_INSERTS = ['flyer'];
export const OFFICE_MARKS = {
  nio: { s: OFF.desk.s, z: 1.35, yaw: 0, seat: 0.455 }, // the visitor's chair
  profH: { s: OFF.desk.s, z: 2.82, yaw: 180, seat: 0.49, who: 'profH' }, // his chair behind the desk
};
export const OFFICE_SOLIDS = [{ name: 'the desk', s: [0.58, 2.02] as [number, number], z: [1.9, 2.5] as [number, number] },
  { name: 'the bookcase', s: [2.3, 2.6] as [number, number], z: [1.95, 2.95] as [number, number] }];
const officeLights = (o: OfficeOpts, f: number): Light[] => {
  const door = keyed(o.door, f, 0);
  return [{ p: P3(1.3, 2.35, 1.65), r: 3.2, col: [0.4, 0.4, 0.38] }, { p: P3(0.88, OFF.desk.top + 0.24, 2.14), r: 1.6, col: [0.6, 0.45, 0.24], halo: 0.06 },
    ...(door > 0.01 ? [{ p: P3(OFF.door, 1.5, 0.3), r: 3.6 * door, col: [0.6, 0.56, 0.44] as V }] : [])];
};

export type CampusOpts = WaitOpts & HallOpts & OfficeOpts & { time?: number };
export const CAMPUS_ROOMS = {
  waiting: { kind: 2, size: [WAIT.w, WAIT.h, WAIT.d] as V, cams: WAIT_CAMS },
  hall: { kind: 0, size: [HALL.w, HALL.h, HALL.d] as V, cams: HALL_CAMS },
  office: { kind: 3, size: [OFF.w, OFF.h, OFF.d] as V, cams: OFFICE_CAMS },
};
export type CampusRoom = keyof typeof CAMPUS_ROOMS;
// A shot in a campus room. acts: the cast, placed by (s, z) as anywhere else.
export const campusShot = (room: CampusRoom, camA: CamArg, acts: Act[], o: CampusOpts = {}): Scene3 => {
  const R = CAMPUS_ROOMS[room], hall = room === 'hall', office = room === 'office', f = (o.time ?? 0) * 24;
  // Prof H's hand goes wherever the flyer is this frame: its near edge, on his side
  const fp = office ? flyerAt(o, f) : undefined;
  const acts2 = acts.map((a) => (a.pose === 'slideFlyer' && fp ? { ...a, reachTo: add(fp, [0, 0, 0.13]) as V } : a));
  const ps = lensActs(camA, acts2).map((a) => pose(a)), cam = camOf(camA, ps);
  const boxes = hall ? hallBoxes(o) : office ? officeBoxes(o, f) : waitBoxes(o, f), lights = hall ? hallLights() : office ? officeLights(o, f) : waitLights(o, f);
  const look = ps.find((p, i) => acts[i].who?.id === 'nio')?.soft.head?.c ?? P3(seatS(0), 2.1, seatZ(4));
  const door = hall ? 0 : keyed(o.door, f, 0), doorX = X(office ? OFF.door : WAIT.door);
  return {
    cam, room: R.size, room0: [X(R.size[0]), 0, 0], set: 3, time: o.time ?? 0,
    campus: [R.kind, door, doorX, office ? 1 : 0],
    amb: hall ? [0.3, 0.29, 0.31] : office ? [0.32, 0.29, 0.27] : [0.3, 0.34, 0.31], ambChar: hall ? [0.86, 0.84, 0.82] : office ? [0.88, 0.84, 0.8] : [0.84, 0.88, 0.84],
    crowd: hall ? hallCrowd(o, acts.map((a) => a.at as [number, number]), look, cam, f) : undefined,
    boxes, softs: [...ps.map((p) => p.soft), ...(hall ? hallSofts(o) : office ? officeSofts() : [])], lights: [...lights, ...ps.flatMap((p) => p.lights)],
    props: [...ps.flatMap((p) => p.props), ...(hall ? hallProps(o, f) : [])], shadows: ps.flatMap((p) => p.shadows),
  };
};
