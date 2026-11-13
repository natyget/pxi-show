// THE CAMPUS, for Office Hours: the rooms of one old teaching building. Each room is its own box, like Nio's room and
// the club, sized and dressed here; the shader paints its walls, floor and ceiling (CAMPUS_GLSL) by which room it is.
//  - the waiting room outside Prof H's office: plastic chairs along both walls, a ticket machine, a clock, and the
//    inner door with NOW SERVING over it
// Positions are (s, y, z) as everywhere: s from the wall on the LEFT of the picture when you face the far wall, z toward
// the far wall. Each room sits so that X(s) from room.ts still gives world x.
// Signs (words and pictures on things) are drawn by tools/signs.py into one atlas; a box shows one with `sign`.
import { V } from './vec';
import { Scene3, Box, Light, Cam3 } from './types';
import { Act, pose, P3, X, C, CamArg, camOf, lensActs } from './room';

// ---- the shader side: walls, floors and ceilings of every campus room, signs and the clock ----
export const CAMPUS_GLSL = `
// ==== the campus ====
uniform vec4 uCampus; // x: the room (0 lecture hall, 1 corridor, 2 waiting room, 3 office, 4 outdoors), y: how far the
                      // door in the far wall is open (0..1), z: world x of that door's centre, w: spare
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
void campusDoor(inout vec3 c, inout float em, vec2 q, float open, float fp){
  if (abs(q.x) > 0.52 || q.y > 2.12) return;
  c = vec3(0.24, 0.17, 0.15);
  if (abs(q.x) > 0.45 || q.y > 2.05) return;
  if (open > 0.01){ // the light inside, warm, brightest low down where it spills toward us
    c = mix(vec3(1.0, 0.78, 0.45), vec3(0.93, 0.6, 0.32), smoothstep(0.2, 2.0, q.y)); em = 1.0; return; }
  c = vec3(0.5, 0.33, 0.24) * (0.95 + 0.08 * hash(vec2(floor((q.x + 0.45) / 0.15), 2.0)));
  vec2 w = abs(vec2(q.x, q.y - 1.62)) - vec2(0.26, 0.24);
  if (max(w.x, w.y) < 0.0){ c = vec3(0.78, 0.8, 0.74); if (max(w.x, w.y) > -max(0.018, fp)) c = vec3(0.3, 0.22, 0.2); }
  if (length(q - vec2(0.36, 1.02)) < max(0.032, fp * 1.1)) c = vec3(0.78, 0.66, 0.4);
}
vec3 campusFloor(vec3 p, float fp, vec2 px, out float em){
  em = 0.0; float k = uCampus.x; vec3 c;
  if (k > 1.5 && k < 2.5) c = vinyl(p.xz, vec3(0.53, 0.56, 0.55), vec3(0.47, 0.5, 0.5), 0.33, fp);
  else c = vinyl(p.xz, vec3(0.5, 0.48, 0.46), vec3(0.45, 0.43, 0.42), 0.33, fp);
  // the warm light from the open door, spilling across the floor toward us, in hard steps
  float o = uCampus.y;
  if (o > 0.01){ float dz = uRoom0.z + uRoom.z - p.z, dx = abs(p.x - uCampus.z);
    float wedge = 0.44 + dz * 0.3 * o; float r = dz / (3.4 * o);
    if (dz > 0.0 && dx < wedge && r < 1.0){ float s = floor((1.0 - r) * 3.0 + 0.5 + (bayer(px) - 0.5) * 0.5) / 3.0; c = mix(c, c * vec3(1.85, 1.45, 0.95) + vec3(0.07, 0.04, 0.0), s); } }
  return c;
}
vec3 campusWall(vec3 p, int w, float fp, vec2 px, out float em, out vec3 add){
  em = 0.0; add = vec3(0.0); float k = uCampus.x;
  if (w == 2){ // a dropped ceiling: square tiles, with the fluorescent panels set in it
    vec2 q = p.xz; vec2 tf = fract(q / 0.6) * 0.6; vec3 c = vec3(0.74, 0.74, 0.7) * mott(p, 0.5);
    if (tf.x < max(0.012, fp * 0.7) || tf.y < max(0.012, fp * 0.7)) c *= 0.8;
    float cx = uRoom0.x + uRoom.x * 0.5;
    if (k > 1.5 && k < 2.5){ for (int i = 0; i < 2; i++){ vec2 d = abs(q - vec2(cx, 2.2 + 2.2 * float(i))) - vec2(0.3, 0.6);
      if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.03, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.92, 0.97, 0.9); em = 1.0; } } }
    return c;
  }
  vec2 uv = (w == 3 || w == 6) ? p.xy : p.zy;
  // institutional paint: a darker band below the rail, a pale one above, a dark skirting
  vec3 lo = vec3(0.42, 0.52, 0.45), hi = vec3(0.76, 0.78, 0.66);
  vec3 c = (uv.y < 1.0 ? lo : hi) * mott(p, 0.6);
  if (abs(uv.y - 1.0) < max(0.022, fp * 0.8)) c = vec3(0.34, 0.4, 0.36);
  if (uv.y < 0.1) c = vec3(0.24, 0.26, 0.25);
  if (w == 3) campusDoor(c, em, vec2(p.x - uCampus.z, p.y), uCampus.y, fp);
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
export type WaitOpts = { door?: number; serving?: 3 | 4; clock?: null | [number, number]; ticketMachine?: boolean };
export const waitBoxes = (o: WaitOpts = {}): Box[] => {
  const zF = WAIT.d, open = o.door ?? 0;
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
const waitLights = (o: WaitOpts): Light[] => [
  { p: P3(1.5, 2.55, 2.2), r: 3.4, col: [0.46, 0.52, 0.47] }, { p: P3(1.5, 2.55, 4.4), r: 3.4, col: [0.46, 0.52, 0.47] },
  ...((o.door ?? 0) > 0.01 ? [{ p: P3(WAIT.door, 1.3, WAIT.d - 0.25), r: 2.6 * (o.door ?? 0) + 0.6, col: [0.75, 0.5, 0.24] as V, halo: 0.12 }] : []),
];

export type CampusOpts = WaitOpts & { time?: number };
export const CAMPUS_ROOMS = { waiting: { kind: 2, size: [WAIT.w, WAIT.h, WAIT.d] as V, cams: WAIT_CAMS } };
export type CampusRoom = keyof typeof CAMPUS_ROOMS;
// A shot in a campus room. acts: the cast, placed by (s, z) as anywhere else.
export const campusShot = (room: CampusRoom, camA: CamArg, acts: Act[], o: CampusOpts = {}): Scene3 => {
  const R = CAMPUS_ROOMS[room], ps = lensActs(camA, acts).map((a) => pose(a)), cam = camOf(camA, ps);
  const boxes = waitBoxes(o), lights = waitLights(o);
  return {
    cam, room: R.size, room0: [X(R.size[0]), 0, 0], set: 3, time: o.time ?? 0,
    campus: [R.kind, o.door ?? 0, X(WAIT.door), 0],
    amb: [0.3, 0.34, 0.31], ambChar: [0.84, 0.88, 0.84],
    boxes, softs: ps.map((p) => p.soft), lights: [...lights, ...ps.flatMap((p) => p.lights)],
    props: ps.flatMap((p) => p.props), shadows: ps.flatMap((p) => p.shadows),
  };
};
