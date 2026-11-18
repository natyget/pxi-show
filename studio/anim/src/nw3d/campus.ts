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
uniform vec4 uCampus2; // the corridor: x how open the door in the near wall is (Prof H's again), y the stairwell door, z its z
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
// the stairwell through its open door: concrete steps going down away from us, a rail, cold light
vec3 stairView(vec2 q){
  float st = floor((q.y - 0.05) / 0.17); vec3 c = vec3(0.56, 0.58, 0.6) * (0.86 + 0.05 * mod(st, 2.0));
  if (q.y > 1.55) c = vec3(0.72, 0.74, 0.74);
  if (abs(q.x - 0.28 + q.y * 0.1) < 0.025 && q.y > 0.7 && q.y < 1.75) c = vec3(0.2, 0.36, 0.28);
  return c * (0.75 + 0.25 * smoothstep(0.0, 2.0, q.y));
}
void campusDoor(inout vec3 c, inout float em, vec2 q, float open, float fp){
  if (abs(q.x) > 0.52 || q.y > 2.12) return;
  c = vec3(0.24, 0.17, 0.15);
  if (abs(q.x) > 0.45 || q.y > 2.05) return;
  if (open > 0.01 && uCampus.w > 0.5){ c = quadView(q); em = 1.0; return; }
  bool cor = uCampus.x > 0.5 && uCampus.x < 1.5;
  if (open > 0.01){ // the light inside, warm, brightest low down where it spills toward us
    c = mix(vec3(1.0, 0.78, 0.45), vec3(0.93, 0.6, 0.32), smoothstep(0.2, 2.0, q.y)); em = 1.0;
    if (cor){ // the corridor's doors: the leaf swung away into the lit office, so how open it is shows in the gap beside it
      float a = open * 1.45, lw = 0.9 * cos(a), u = (0.45 - q.x) / max(lw, 1e-3), top = 2.05 - 0.12 * sin(a) * u;
      if (u < 1.0 && q.y < top){ em = 0.0;
        c = vec3(0.5, 0.33, 0.24) * mix(vec3(1.0), vec3(1.25, 1.0, 0.8), 0.5) * (0.9 + 0.08 * hash(vec2(floor(u * 6.0), 2.0)));
        if (u > 0.21 && u < 0.79 && abs(q.y - 1.62) < 0.24){ c = vec3(0.95, 0.75, 0.5); em = 1.0; }
        if (u > 1.0 - max(0.05, fp / max(lw, 0.05))) c = vec3(0.3, 0.2, 0.16); } } // its edge
    return; }
  c = vec3(0.5, 0.33, 0.24) * (0.95 + 0.08 * hash(vec2(floor((q.x + 0.45) / 0.15), 2.0)));
  vec2 w = abs(vec2(q.x, q.y - 1.62)) - vec2(0.26, 0.24);
  if (max(w.x, w.y) < 0.0){ c = vec3(0.78, 0.8, 0.74); if (max(w.x, w.y) > -max(0.018, fp)) c = vec3(0.3, 0.22, 0.2); }
  if (length(q - vec2(cor ? -0.36 : 0.36, 1.02)) < max(0.032, fp * 1.1)) c = vec3(0.78, 0.66, 0.4); // the knob, away from the hinge
}
// THE PITCH (room 4), outdoors: everything past the fence and over it is the world, painted by the direction you look so
// the sides of the box never show. The grass beyond, a line of trees with a roof or two, the evening sky warm at the bottom.
vec3 pitchView(vec3 d){
  float e = d.y / max(length(d.xz), 1e-3), a = atan(d.x, d.z);
  if (e < -0.004) return vec3(0.36, 0.53, 0.27) * (0.92 + 0.1 * hash(floor(vec2(a * 60.0, e * 160.0))));
  float tl = 0.03 + 0.035 * (0.5 + 0.5 * sin(a * 7.0 + 1.3)) + 0.012 * hash(vec2(floor(a * 30.0), 7.0)); // the tree line, lumpy
  float rf = fract(a * 1.7 + 0.15) < 0.16 ? 0.085 : 0.0; // now and then a building over the trees
  if (e < rf){ vec3 c = vec3(0.6, 0.36, 0.28) * (0.94 + 0.08 * hash(floor(vec2(a * 200.0, e * 300.0))));
    vec2 wq = fract(vec2(a * 110.0, e * 70.0)); if (wq.x > 0.3 && wq.x < 0.7 && wq.y > 0.35 && wq.y < 0.75) c = hash(floor(vec2(a * 110.0, e * 70.0))) < 0.45 ? vec3(1.0, 0.82, 0.5) : vec3(0.32, 0.22, 0.22);
    return c; }
  if (e < tl) return vec3(0.2, 0.32, 0.2) * (0.85 + 0.22 * hash(floor(vec2(a * 90.0, e * 240.0))));
  vec3 sky = mix(vec3(1.0, 0.8, 0.6), vec3(0.52, 0.68, 0.92), smoothstep(0.0, 0.6, e));
  return mix(sky, vec3(1.0, 0.86, 0.66), 0.35 * smoothstep(0.6, 1.0, cos(a + 2.3)) * (1.0 - smoothstep(0.0, 0.4, e))); // warmer toward the low sun
}
// the cage: chain-link on posts over dark green kickboards, a gate in the left side; above it the open sky (em 2)
vec3 pitchWall(vec3 p, int w, float fp, out float em){
  vec3 d = p - uCamP; em = 0.0;
  if (w == 2 || p.y > 4.06){ em = 2.0; return pitchView(d); }
  float u = (w == 3 || w == 6) ? p.x : p.z; vec3 rail = vec3(0.34, 0.4, 0.37), wire = vec3(0.62, 0.64, 0.63);
  bool gate = w == 5 && abs(p.z - uRoom0.z - 4.5) < 0.6;
  if (p.y > 4.0) return rail; // the top rail
  if (abs(fract(u / 2.5 + 0.5) - 0.5) * 2.5 < max(0.04, fp * 0.8) || (w == 5 && abs(abs(p.z - uRoom0.z - 4.5) - 0.62) < max(0.04, fp * 0.8))) return rail; // posts, and the gate's
  if (!gate && p.y < 0.9){ vec3 c = vec3(0.2, 0.32, 0.26) * mott(p, 0.6); if (abs(p.y - 0.88) < max(0.02, fp * 0.7)) c = rail; return c; }
  vec3 v = pitchView(d); float cell = 0.075, lw = fp / cell;
  if (lw > 0.55){ em = 0.6; return mix(v, wire, 0.32); } // too far for single wires: a haze of them
  vec2 g = vec2(u + p.y, u - p.y) / cell, f = abs(fract(g) - 0.5);
  if (max(f.x, f.y) > 0.5 - max(0.06, lw * 0.5)) return wire;
  em = 1.0; return v;
}
// THE ROOF (room 5, Group Photo): a flat roof at sunset. A low brick parapet all round; over it the city, the sun low
// and huge, the sky going from gold at the skyline to violet up high. Painted by the direction you look, like the pitch.
vec3 roofView(vec3 d){
  float e = d.y / max(length(d.xz), 1e-3), a = atan(d.x, d.z);
  float sa = a - 0.0; // the sun sits straight up the roof (+z)
  float sd = length(vec2(sa, e - 0.13));
  if (sd < 0.075) return vec3(1.0, 0.86, 0.5);
  float bh = 0.02 + 0.09 * hash(vec2(floor(a * 9.0), 3.0)) + 0.05 * hash(vec2(floor(a * 23.0), 5.0)); // the skyline, blocky
  if (e < bh){ vec3 c = vec3(0.3, 0.2, 0.3) * (0.92 + 0.08 * hash(floor(vec2(a * 9.0, 1.0))));
    vec2 wq = fract(vec2(a * 140.0, e * 90.0)); if (wq.x > 0.35 && wq.x < 0.65 && wq.y > 0.4 && wq.y < 0.7 && hash(floor(vec2(a * 140.0, e * 90.0))) < 0.3) c = vec3(1.0, 0.8, 0.45);
    return c; }
  vec3 sky = mix(vec3(1.0, 0.62, 0.32), vec3(0.94, 0.42, 0.42), smoothstep(0.05, 0.3, e));
  sky = mix(sky, vec3(0.42, 0.3, 0.55), smoothstep(0.3, 0.9, e));
  return sky + vec3(0.35, 0.22, 0.05) * exp(-sd * 6.0);
}
vec3 roofWall(vec3 p, int w, float fp, out float em){
  em = 0.0;
  if (w == 2 || p.y > 1.05){ em = 2.0; return roofView(p - uCamP); }
  if (p.y > 0.95) return vec3(0.62, 0.56, 0.5) * mott(p, 1.0); // the coping stones
  float u = (w == 3 || w == 6) ? p.x : p.z, row = floor(p.y / 0.075); vec2 b = vec2(u / 0.22 + mod(row, 2.0) * 0.5, p.y / 0.075);
  vec3 c = vec3(0.55, 0.3, 0.24) * (0.9 + 0.12 * hash(floor(b)));
  vec2 f = fract(b); if (f.y < max(0.12, fp / 0.075 * 0.6) || f.x < max(0.04, fp / 0.22 * 0.6)) c = vec3(0.5, 0.45, 0.4);
  return c;
}
// THE QUAD (room 6, Wave Back): the campus lawn at midday. Open all round: past the grass, old brick buildings three or
// four storeys high with white-framed windows, trees in front of them here and there, a clear blue sky with two clouds.
vec3 quadView(vec3 d){
  float e = d.y / max(length(d.xz), 1e-3), a = atan(d.x, d.z);
  if (e < -0.004) return vec3(0.38, 0.58, 0.3) * (0.92 + 0.1 * hash(floor(vec2(a * 60.0, e * 160.0))));
  float bi = floor(a * 2.2 + 0.3), bh = 0.15 + 0.07 * hash(vec2(bi, 11.0));
  float ti = floor(a * 6.0), fx = fract(a * 6.0) - 0.5, th = (0.07 + 0.05 * hash(vec2(ti, 9.0))) * sqrt(max(0.0, 1.0 - fx * fx / 0.16)); // a tree: a round crown on a trunk
  if (hash(vec2(ti, 4.0)) > 0.4 && (e < th * (0.92 + 0.08 * sin(fx * 60.0)) && e > th * 0.25 || abs(fx) < 0.025 && e < th)) return abs(fx) < 0.025 && e < th * 0.3 ? vec3(0.32, 0.22, 0.16) : vec3(0.22, 0.4, 0.21) * (0.85 + 0.2 * hash(floor(vec2(a * 90.0, e * 240.0))));
  if (e < bh){ vec3 c = vec3(0.64, 0.36, 0.27) * (0.94 + 0.08 * hash(floor(vec2(a * 200.0, e * 300.0))));
    vec2 wc = vec2(a * 36.0, e * 34.0), wq = fract(wc);
    if (e > 0.02 && bh - e > 0.03 && wq.x > 0.28 && wq.x < 0.72 && wq.y > 0.25 && wq.y < 0.78)
      c = (wq.x < 0.34 || wq.x > 0.66 || wq.y < 0.31 || wq.y > 0.72) ? vec3(0.92, 0.91, 0.86) : vec3(0.4, 0.5, 0.6) * (0.9 + 0.2 * hash(floor(wc)));
    if (bh - e < 0.014) c = vec3(0.4, 0.38, 0.38); // the roof edge
    return c; }
  vec3 sky = mix(vec3(0.8, 0.9, 0.98), vec3(0.4, 0.62, 0.93), smoothstep(0.0, 0.7, e));
  float cl = length(vec2((a - 0.6) * 1.4, (e - 0.42) * 3.0)), cl2 = length(vec2((a + 2.4) * 1.3, (e - 0.3) * 3.2));
  if (min(cl, cl2) < 0.28 + 0.05 * sin(a * 40.0)) sky = vec3(0.97, 0.97, 0.95);
  return sky;
}
// MUM'S DINING ROOM (room 7, Wave Back): mustard striped paper over cream panelling and a rail, wood floor, a red rug.
// In the far wall: the window (left, the street at dusk, red curtains), a picture (middle), the doorway (right, the warm hall).
vec3 dineWall(vec3 p, int w, float fp, out float em){
  em = 0.0;
  if (w == 2) return vec3(0.88, 0.84, 0.76) * mott(p, 0.5);
  bool sideW = abs(p.x - uRoom0.x) < 0.02 || abs(p.x - uRoom0.x - uRoom.x) < 0.02;
  float u = sideW ? p.z - uRoom0.z : uRoom0.x + uRoom.x - p.x; // along the wall (on the far wall: s)
  bool far = p.z > uRoom0.z + uRoom.z - 0.03;
  if (far){
    vec2 wn = vec2(u - 0.95, p.y - 1.5), wd = abs(wn) - vec2(0.5, 0.55);
    if (abs(wn.x) < 0.78 && abs(wn.x) > 0.5 && p.y > 0.75 && p.y < 2.2) return vec3(0.62, 0.16, 0.16) * (0.85 + 0.2 * step(0.5, fract(u / 0.07))); // the curtains, in folds
    if (max(wd.x, wd.y) < 0.0){
      if (max(wd.x, wd.y) > -max(0.04, fp) || abs(wn.x) < max(0.02, fp * 0.6) || abs(wn.y) < max(0.02, fp * 0.6)) return vec3(0.92, 0.9, 0.84);
      em = 1.0; vec3 c = mix(vec3(0.95, 0.6, 0.45), vec3(0.24, 0.26, 0.5), smoothstep(-0.4, 0.5, wn.y)); // the dusk sky
      if (wn.y < -0.2 + 0.18 * hash(vec2(floor(u / 0.16), 1.0))) c = vec3(0.16, 0.13, 0.18); // the houses over the road
      if (length(wn - vec2(0.24, -0.06)) < 0.04) c = vec3(1.0, 0.85, 0.5); // a street light
      return c; }
    vec2 dn = vec2(u - 3.55, p.y), dd = abs(dn - vec2(0.0, 1.0)) - vec2(0.42, 1.05);
    if (max(dd.x, dd.y) < 0.0){ if (max(dd.x, dd.y) > -max(0.06, fp)) return vec3(0.9, 0.88, 0.82); em = 1.0; return vec3(0.98, 0.78, 0.5) * (0.9 + 0.08 * hash(floor(p.yy / 0.3))); }
    vec2 pf = abs(vec2(u - 2.1, p.y - 1.62)) - vec2(0.3, 0.22);
    if (max(pf.x, pf.y) < 0.0){ if (max(pf.x, pf.y) > -max(0.035, fp)) return vec3(0.7, 0.55, 0.22); // a gilt frame: a hill and a sea
      return p.y - 1.62 < 0.05 * sin((u - 2.1) * 7.0) - 0.04 ? vec3(0.36, 0.5, 0.3) : p.y - 1.62 < 0.0 ? vec3(0.3, 0.45, 0.6) : vec3(0.8, 0.84, 0.86); }
  }
  if (p.y < 0.1) return vec3(0.9, 0.88, 0.82); // the skirting
  if (p.y < 0.88){ vec3 c = vec3(0.86, 0.82, 0.72) * mott(p, 0.4); vec2 pq = fract(vec2(u / 0.6, (p.y - 0.1) / 0.78)); if (pq.x < max(0.04, fp / 0.6) || pq.y < 0.06 || pq.y > 0.94) c *= 0.88; return c; }
  if (p.y < 0.93) return vec3(0.6, 0.42, 0.28); // the rail
  float st = fract(u / 0.2); vec3 c = st < 0.5 ? vec3(0.8, 0.64, 0.38) : vec3(0.86, 0.73, 0.48);
  if (abs(st - 0.75) < 0.05 && fract(p.y / 0.24) < 0.2) c = vec3(0.66, 0.48, 0.3); // a little motif in the pale stripe
  return c;
}
vec3 campusFloor(vec3 p, float fp, vec2 px, out float em){
  em = 0.0; float k = uCampus.x; vec3 c;
  if (k > 6.5){ // Mum's: oak boards, and the red rug under the table
    vec2 q = vec2(uRoom0.x + uRoom.x - p.x, p.z - uRoom0.z); float row = floor(q.x / 0.14), pl = floor((q.y + hash(vec2(row, 1.0)) * 1.2) / 1.2);
    c = vec3(0.5, 0.33, 0.21) * (0.88 + 0.16 * hash(vec2(row, pl))) * mott(p * 2.0, 1.4);
    if (fract(q.x / 0.14) * 0.14 < max(0.006, fp * 0.6) || fract((q.y + hash(vec2(row, 1.0)) * 1.2) / 1.2) * 1.2 < max(0.006, fp * 0.6)) c *= 0.72;
    vec2 r = abs(q - vec2(2.0, 3.2)) - vec2(1.05, 1.45);
    if (max(r.x, r.y) < 0.0){ c = vec3(0.5, 0.14, 0.14) * mott(p * 3.0, 1.2); if (max(r.x, r.y) > -0.12) c = vec3(0.78, 0.6, 0.3); else if (max(r.x, r.y) > -0.16) c = vec3(0.3, 0.1, 0.12); }
    return c; }
  if (k > 5.5){ // the quad: mown grass in stripes, a stone path along the left, another across the far end
    vec2 q = vec2(uRoom0.x + uRoom.x - p.x, p.z - uRoom0.z);
    c = vec3(0.36, 0.56, 0.27) * (mod(floor(q.x / 1.5), 2.0) < 0.5 ? 1.0 : 0.92) * mott(p * 2.0, 1.6);
    if (abs(q.x - 2.3) < 0.75 || abs(q.y - 15.2) < 0.75){ vec2 g = fract(q / 0.5); c = vec3(0.74, 0.7, 0.62) * (0.92 + 0.1 * hash(floor(q / 0.5)));
      if (g.x < max(0.04, fp * 1.5) || g.y < max(0.04, fp * 1.5)) c *= 0.8; }
    return c; }
  if (k < 0.5) return vec3(0.243, 0.275, 0.345) * mott(p * 1.4, 2.2); // the lecture hall: blue carpet
  if (k > 4.5){ c = vec3(0.36, 0.34, 0.36) * mott(p * 3.0, 1.8) * (0.93 + 0.1 * hash(floor(p.xz / 0.05))); return c; } // the roof: grey felt and grit
  if (k > 3.5){ // the pitch: turf in mown stripes, white lines (the edge, halfway, the centre circle, a D at each end)
    vec2 q = vec2(uRoom0.x + uRoom.x - p.x, p.z - uRoom0.z), hf = uRoom.xz * 0.5; float lw = max(0.05, fp * 0.8);
    c = vec3(0.31, 0.52, 0.25) * (mod(floor(q.y / 1.6), 2.0) < 0.5 ? 1.0 : 0.9) * mott(p * 2.0, 1.6);
    vec2 r = abs(q - hf) - (hf - 0.5); bool inside = max(r.x, r.y) < 0.0;
    if (abs(max(r.x, r.y)) < lw || (inside && abs(q.y - hf.y) < lw) || abs(length(q - hf) - 1.8) < lw || length(q - hf) < lw * 2.0
      || (abs(length(q - vec2(hf.x, 0.5)) - 3.0) < lw && q.y > 0.5) || (abs(length(q - vec2(hf.x, uRoom.z - 0.5)) - 3.0) < lw && q.y < uRoom.z - 0.5)) c = vec3(0.9, 0.92, 0.88);
    return c; }
  if (k > 2.5 && k < 3.5){ c = vec3(0.42, 0.24, 0.21) * mott(p * 1.4, 2.2); } // the office: old red-brown carpet
  else if (k > 0.5 && k < 1.5) c = vinyl(p.xz, vec3(0.6, 0.58, 0.54), vec3(0.54, 0.52, 0.49), 0.3, fp); // the corridor
  else if (k > 1.5 && k < 2.5) c = vinyl(p.xz, vec3(0.53, 0.56, 0.55), vec3(0.47, 0.5, 0.5), 0.33, fp);
  else c = vinyl(p.xz, vec3(0.5, 0.48, 0.46), vec3(0.45, 0.43, 0.42), 0.33, fp);
  // the warm light from the open door, spilling across the floor toward us, in hard steps
  float o = uCampus.y; bool sun = uCampus.w > 0.5;
  if (o > 0.01){ float dz = sun ? p.z - uRoom0.z : uRoom0.z + uRoom.z - p.z, dx = abs(p.x - uCampus.z);
    float wedge = 0.44 + dz * 0.3 * o; float r = dz / ((sun ? 2.6 : 3.4) * o);
    if (dz > 0.0 && dx < wedge && r < 1.0){ float s = floor((1.0 - r) * 3.0 + 0.5 + (bayer(px) - 0.5) * 0.5) / 3.0;
      c = mix(c, sun ? c * vec3(2.1, 1.95, 1.55) + vec3(0.06, 0.05, 0.02) : c * vec3(1.85, 1.45, 0.95) + vec3(0.07, 0.04, 0.0), s); } }
  // the corridor: the same warm light from the door at the near end
  float o2 = uCampus2.x;
  if (k > 0.5 && k < 1.5 && o2 > 0.01){ float dz = p.z - uRoom0.z, dx = abs(p.x - uCampus.z);
    float wedge = 0.44 + dz * 0.3 * o2; float r = dz / (3.4 * o2);
    if (dx < wedge && r < 1.0){ float s = floor((1.0 - r) * 3.0 + 0.5 + (bayer(px) - 0.5) * 0.5) / 3.0; c = mix(c, c * vec3(1.85, 1.45, 0.95) + vec3(0.07, 0.04, 0.0), s); } }
  return c;
}
vec3 campusWall(vec3 p, int w, float fp, vec2 px, out float em, out vec3 add){
  em = 0.0; add = vec3(0.0); float k = uCampus.x;
  if (k > 6.5) return dineWall(p, w, fp, em);
  if (k > 5.5){ em = 2.0; return quadView(p - uCamP); }
  if (k > 4.5) return roofWall(p, w, fp, em);
  if (k > 3.5) return pitchWall(p, w, fp, em);
  if (w == 2){ // a dropped ceiling: square tiles, with the fluorescent panels set in it
    vec2 q = p.xz; vec2 tf = fract(q / 0.6) * 0.6; vec3 c = vec3(0.74, 0.74, 0.7) * mott(p, 0.5);
    if (tf.x < max(0.012, fp * 0.7) || tf.y < max(0.012, fp * 0.7)) c *= 0.8;
    float cx = uRoom0.x + uRoom.x * 0.5;
    if (k < 0.5){ // the lecture hall: five panels, two rows over the seats and one over the lectern
      for (int i = 0; i < 5; i++){ vec2 at = i < 4 ? vec2(i % 2 == 0 ? 2.2 : 6.2, i < 2 ? 3.0 : 6.5) : vec2(4.2, 8.8);
        vec2 d = abs(q - vec2(uRoom0.x + uRoom.x - at.x, at.y)) - vec2(0.3, 0.6);
        if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.03, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.96, 0.95, 0.88); em = 1.0; } } }
    if (k > 0.5 && k < 1.5){ float zz = mod(q.y - uRoom0.z - 0.9, 1.8) - 0.9; vec2 d = abs(vec2(q.x - cx, zz)) - vec2(0.55, 0.08);
      if (max(d.x, d.y) < 0.0){ c = max(d.x, d.y) > -max(0.02, fp) ? vec3(0.66, 0.66, 0.64) : vec3(0.94, 0.98, 0.95); em = 1.0; } }
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
  bool off = k > 2.5 && k < 3.5, cor = k > 0.5 && k < 1.5;
  vec3 lo = off ? vec3(0.44, 0.31, 0.23) : cor ? vec3(0.4, 0.46, 0.55) : vec3(0.42, 0.52, 0.45), hi = off ? vec3(0.84, 0.78, 0.63) : cor ? vec3(0.83, 0.82, 0.76) : vec3(0.76, 0.78, 0.66);
  vec3 c = (uv.y < 1.0 ? lo : hi) * mott(p, 0.6);
  if (abs(uv.y - 1.0) < max(0.022, fp * 0.8)) c = vec3(0.34, 0.4, 0.36);
  if (uv.y < 0.1) c = vec3(0.24, 0.26, 0.25);
  if (off && uv.y < 1.0){ float sy = floor(uv.y / 0.14); float st = hash(vec2(sy, floor(uv.x / 0.8 + hash(vec2(sy, 5.0)) * 2.0))); c *= st > 0.84 ? 0.9 : st < 0.14 ? 1.08 : 1.0; }
  if ((w == 3 && uCampus.w < 0.5) || (w == 6 && uCampus.w > 0.5)) campusDoor(c, em, vec2((w == 6 ? -1.0 : 1.0) * (p.x - uCampus.z), p.y), uCampus.y, fp);
  if (cor && w == 6) campusDoor(c, em, vec2(-(p.x - uCampus.z), p.y), uCampus2.x, fp); // the corridor: Prof H's door at this end too
  if (cor && w == 4){ // the stairwell door: green, a wired window; open, the stairs going down
    vec2 q = vec2(p.z - uCampus2.z, p.y);
    if (abs(q.x) < 0.52 && q.y < 2.12){ c = vec3(0.24, 0.22, 0.2);
      if (abs(q.x) < 0.45 && q.y < 2.05){
        if (uCampus2.y > 0.01) c = stairView(vec2(q.x, q.y));
        else { c = vec3(0.3, 0.5, 0.4); vec2 wq = abs(vec2(q.x, q.y - 1.5)) - vec2(0.14, 0.3);
          if (max(wq.x, wq.y) < 0.0){ c = vec3(0.7, 0.76, 0.74); if (fract(q.x * 14.0 + q.y * 14.0) < 0.12 || fract(q.x * 14.0 - q.y * 14.0) < 0.12) c *= 0.8; }
          if (abs(q.y - 1.0) < 0.03 && q.x > -0.38 && q.x < 0.3) c = vec3(0.7, 0.7, 0.66); } } } }
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
  three: C([2.9, 1.1, 3.8], [0.47, 0.95, 3.8], 76), // across the room: Nio, Darnell and Maya along the left row
  maya: C([1.95, 1.2, 4.55], [0.47, 1.2, 4.4], 40), // Maya, sitting, from across
  nioTicket: C([0.98, 1.08, 3.22], [0.52, 0.72, 3.22], 30), // insert: Nio's lap from in front: his ticket (seatL3)
  ticket: C([0.98, 1.0, 3.8], [0.47, 0.62, 3.84], 24), // insert: Darnell's lap from in front: the lab report, the coffee ring, his ticket (seatL4)
};
export const WAIT_INSERTS = ['sign', 'clock', 'ticket', 'nioTicket']; // cameras on things, not people
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
// clock: the wall clock's hands [hour, minute] in radians clockwise from 12 (4:55 is [2.574, 5.76]). ball: Nio's football on his desk.
export type HallOpts = { laptop?: Keyed; turn?: Keyed; crowd?: number | null; dusty?: boolean; clock?: [number, number]; ball?: boolean };
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
    bs.push(B(ss + 0.1, sy + 0.012, sz - 0.06, 0.11, 0.012, 0.15, '#4a5c70', 66, { yaw: 8, mat: 9, sign: 'planner' }));
    bs.push(B(ss + 0.0, sy + 0.008, sz + 0.17, 0.12, 0.008, 0.05, '#f0ece0', 67, { yaw: -5, mat: 9, sign: 'nameDarnell' })); // his name card, under the same dust
  }
  // the wall clock, high on the front wall right of the screen, where the whole room can watch it
  bs.push(B(6.75, 3.0, HALL.d - 0.03, 0.3, 0.3, 0.025, '#e8e4da', 68, { yaw: FACING.us, mat: 8, clock: o.clock ? [1, o.clock[0], o.clock[1]] : [1, 2.574, 5.76], noShadow: true }));
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
  if (o.dusty ?? true) { // a cobweb from the back of the dusty seat to the edge of the desk
    const ss = seatS(2), y0 = rowY(4), z0 = seatZ(4), w = (a: V, b: V) => ({ a, ra: 0.005, b, rb: 0.005, g: 0, k: 0.001, c: '#e2e2dc' });
    const hub = P3(ss - 0.18, y0 + 0.72, z0 + 0.12), ends = [P3(ss - 0.28, y0 + 0.66, z0 - 0.22), P3(ss - 0.3, y0 + 0.78, rowZ(4) - 0.25), P3(ss - 0.05, y0 + 0.78, rowZ(4) - 0.26), P3(ss - 0.32, y0 + 0.48, z0 - 0.05), P3(ss + 0.02, y0 + 0.5, z0 + 0.05)];
    out.push({ prims: [...ends.map((e) => w(hub, e)), w(ends[0], ends[1]), w(ends[1], ends[2]), w(ends[3], ends[4])], origin: hub }); }
  if (o.ball) { // Nio's football on the desk, on the aisle side of him: white, with dark patches
    const c = P3(seatS(0) + 0.2, rowY(4) + 0.785 + 0.1, rowZ(4) - 0.16), r = 0.1;
    // small dark pentagons spread evenly over it (a dozen, the points of an icosahedron), so it reads as a football, not a face
    const g = (1 + Math.sqrt(5)) / 2, n = Math.hypot(1, g);
    const pts: V[] = [[0, 1, g], [0, -1, g], [0, 1, -g], [0, -1, -g], [1, g, 0], [-1, g, 0], [1, -g, 0], [-1, -g, 0], [g, 0, 1], [-g, 0, 1], [g, 0, -1], [-g, 0, -1]];
    const patch = (d: V) => { const q: V = [c[0] + (d[0] / n) * r * 0.97, c[1] + (d[1] / n) * r * 0.97, c[2] + (d[2] / n) * r * 0.97]; return { a: q, ra: 0.022, b: q, rb: 0.022, g: 1, k: 0.002, c: '#26232a' }; };
    out.push({ prims: [{ a: c, ra: r, b: c, rb: r, g: 0, k: 0.01, c: '#f2f0ea' }, ...pts.map(patch)], origin: c }); }
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
  maya: C([5.55, 2.64, 5.45], [5.94, 2.34, 3.9], 34), // Maya in her seat, from the row in front
  theo: C([4.27, 2.64, 5.45], [4.66, 2.34, 3.9], 34), // Theo in his seat, from the row in front
  theoSeat: C([4.85, 2.75, 5.9], [4.9, 2.05, 3.9], 58), // Theo and the dusty seat beside him, from the row in front
  seat: C([5.36, 2.74, 4.3], [5.3, 1.67, 3.88], 34), // insert: the empty seat on Theo's left, from over the desk
  clock: C([7.3, 2.7, 4.8], [6.75, 3.0, HALL.d - 0.05], 9), // insert: the wall clock, from Nio's side of the room, over the heads
};
export const HALL_INSERTS = ['seat', 'clock'];
export const HALL_MARKS = {
  lectern: { s: HALL.lectern.s, z: 9.05, yaw: 180, who: 'profH' }, // behind the lectern, facing the room
  nio: { s: seatS(0), z: seatZ(4), yaw: 0, seat: rowY(4) + 0.46 }, // row 4, the aisle seat
  maya: { s: seatS(1), z: seatZ(4), yaw: 0, seat: rowY(4) + 0.46 }, // on Nio's left
  theo: { s: seatS(3), z: seatZ(4), yaw: 0, seat: rowY(4) + 0.46 }, // past the dusty seat: it is the seat beside him
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
  const candle = { prims: [{ a: m(1.6, t + 0.002, 2.3), ra: 0.028, b: m(1.6, t + 0.1, 2.3), rb: 0.028, g: 0, k: 0.004, c: '#efe6d2', cutA: true },
    { a: m(1.6, t + 0.118, 2.3), ra: 0.011, b: m(1.6, t + 0.15, 2.3), rb: 0.004, g: 1, k: 0.006, c: '#ffd36a', em: 1 }], origin: m(1.6, t, 2.3) };
  return [lamp, mug, bob, candle] as Soft[];
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

// THE CORRIDOR: long and plain, and the same from both ends: Prof H's door at the end each way, wide open, warm light
// pouring out of it, his plaque beside it. Classroom doors along both walls, a noticeboard, the green stairwell door
// halfway along on the right with STAIRS over it, and fluorescent tubes the whole way. 2.4 wide, 2.7 high, 12 long.
export const COR = { w: 2.4, h: 2.7, d: 12, stairZ: 6.0 };
// door: how open Prof H's door at the far end is; door2: the one at the near end; stairs: the stairwell door (Nio
// bursts through it). All keyed by frame, or a number.
export type CorridorOpts = { door2?: Keyed; stairs?: Keyed };
const corridorBoxes = (o: CorridorOpts, f: number): Box[] => {
  const W = COR.w, D = COR.d, wood = '#80553e', bs: Box[] = [];
  // classroom doors, shut, each with its number over it
  const doors: [number, number, string][] = [[0, 3.4, 'door112'], [0, 8.6, 'door114'], [W, 2.6, 'door116'], [W, 9.4, 'door112']];
  doors.forEach(([sw, z, sign], i) => { const side = sw === 0 ? 1 : -1, yaw = sw === 0 ? FACING.right : FACING.left;
    bs.push(B(sw + side * 0.025, 1.025, z, 0.45, 1.025, 0.025, wood, 20 + i, { yaw, mat: 1 }));
    bs.push(B(sw + side * 0.03, 2.3, z, 0.16, 0.08, 0.02, '#34383e', 30 + i, { yaw, mat: 7, sign })); });
  // a noticeboard with a few papers on it, left wall
  bs.push(B(0.02, 1.45, 6.0, 0.6, 0.42, 0.02, '#b08a5a', 40, { yaw: FACING.right, mat: 2 }));
  ([[5.7, 1.55, 0.1, 0.13, '#f0ece0'], [6.15, 1.4, 0.12, 0.09, '#f2d36a'], [6.35, 1.62, 0.09, 0.12, '#bfe0f0'], [5.85, 1.2, 0.11, 0.08, '#f0ece0']] as [number, number, number, number, string][])
    .forEach(([z, y, hw, hh, col], i) => bs.push(B(0.045, y, z, hw, hh, 0.004, col, 41 + i, { yaw: FACING.right })));
  // STAIRS over the stairwell door; Prof H's plaque by his door at each end
  bs.push(B(W - 0.03, 2.3, COR.stairZ, 0.2, 0.07, 0.02, '#246a44', 46, { yaw: FACING.left, mat: 7, sign: 'stairs', glow: true }));
  bs.push(B(COR.w / 2 + 0.78, 1.45, D - 0.012, 0.16, 0.06, 0.01, '#b08c4a', 47, { yaw: FACING.us, mat: 7, sign: 'plaque' }));
  bs.push(B(COR.w / 2 - 0.78, 1.45, 0.012, 0.16, 0.06, 0.01, '#b08c4a', 48, { yaw: FACING.away, mat: 7, sign: 'plaque' }));
  // the stairwell door, burst open into the corridor on its hinge at the far side
  const st = keyed(o.stairs, f, 0);
  if (st > 0.01) { const a = st * 1.4, hz = COR.stairZ + 0.45, cz = hz - Math.cos(a) * 0.45, cs = W - Math.sin(a) * 0.45;
    bs.push({ c: P3(cs, 1.025, cz), h: [0.022, 1.025, 0.45], col: '#4c7a62', obj: 49, yaw: (-a * 180) / Math.PI }); }
  return bs;
};
export const CORRIDOR_CAMS: Record<string, Cam3> = {
  long: C([1.2, 1.3, 0.35], [1.2, 1.2, 12], 24), // the long lens down the corridor to the open door at the far end
  corner: C([1.2, 1.3, 11.65], [1.2, 1.2, 0], 24), // the same, from the other end: he walks in past the lens, the same door ahead of him
  plaque: C([1.74, 1.43, 10.3], [1.98, 1.43, 12], 22), // insert: the plaque by the far door, the edge of the warm doorway beside it
  nio: C([1.48, 1.44, 4.6], [1.2, 1.4, 6.0], 34), // close on Nio in the middle of the corridor, from in front
  mcu: C([1.5, 1.38, 4.7], [1.2, 1.3, 6.0], 40), // Nio from the waist up, lit by his phone
  stairs: C([0.4, 1.5, 2.0], [1.96, 1.25, 8.8], 50), // up the corridor past the stairwell door: him bursting out of it, the same open door beyond
  wide: C([1.95, 2.05, 0.5], [0.85, 1.0, 7.0], 46), // high wide down the corridor: Nio at the middle, the cleaner mopping past
  cleaner: C([0.95, 1.42, 2.2], [0.68, 1.28, 8.0], 38), // in front of the cleaner as she mops toward us, saying her line; Nio behind her on his phone
  two: C([1.0, 1.42, 4.25], [1.0, 1.36, 6.0], 48), // Nio and Maya from in front, in the middle of the corridor
  sprint: C([1.2, 1.25, 11.3], [1.2, 1.2, 6.0], 36), // from Prof H's door, back down the corridor, as he sprints at it and into the lens
};
export const CORRIDOR_INSERTS = ['plaque'];
export const CORRIDOR_MARKS = {
  door: { s: 1.2, z: 11.5, yaw: 0 }, // in Prof H's open door at the far end, behind the cameras there (a run ends here, into the lens)
  far: { s: 1.2, z: 9.8, yaw: 180 }, // up the far end, facing back down the corridor
  look: { s: 0.8, z: 7.4, yaw: 0 }, // a little way off the far door, to one side of it, looking at it (the long lens sees the door past him)
  look2: { s: 1.6, z: 4.6, yaw: 180 }, // the same, mirrored at the other end: from the corner camera, the same picture again
  mid: { s: 1.2, z: 6.0, yaw: 0 }, // the middle of the corridor, facing the far door
  near: { s: 1.2, z: 0.5, yaw: 180 }, // right at the near end, behind the long lens (a walk away from the door ends here)
  stairDoor: { s: 1.95, z: COR.stairZ, yaw: 90 }, // just out of the stairwell door, facing across
  mayaMid: { s: 0.78, z: 6.05, yaw: 0 }, mayaLook: { s: 1.25, z: 7.5, yaw: 0 }, // Maya, beside him in the middle, and beside him looking at the door
  walkA: { s: 1.0, z: 1.6, yaw: 0 }, walkB: { s: 1.0, z: 5.6, yaw: 0 }, mayaA: { s: 1.55, z: 1.4, yaw: 0 }, mayaB: { s: 1.55, z: 5.4, yaw: 0 }, // the walk toward the door, side by side
  cleanerA: { s: 0.6, z: 8.6, yaw: 180 }, cleanerB: { s: 0.6, z: 4.6, yaw: 180 }, // the cleaner's way past, down the left side
};
const corridorLights = (o: CampusOpts, f: number): Light[] => [
  ...[1.8, 4.5, 7.2, 9.9].map((z) => ({ p: P3(1.2, 2.55, z), r: 3.0, col: [0.4, 0.44, 0.42] as V })),
  ...(keyed(o.door, f, 0.7) > 0.01 ? [{ p: P3(1.2, 1.3, COR.d - 0.25), r: 2.6 * keyed(o.door, f, 0.7) + 0.6, col: [0.75, 0.5, 0.24] as V, halo: 0.12 }] : []),
  ...(keyed(o.door2, f, 0.7) > 0.01 ? [{ p: P3(1.2, 1.3, 0.25), r: 2.6 * keyed(o.door2, f, 0.7) + 0.6, col: [0.75, 0.5, 0.24] as V, halo: 0.12 }] : []),
];

// THE PITCH, at the end: the five-a-side cage behind the sports hall, 5:01 PM. Turf with white lines, chain-link all
// round on dark green kickboards, a gate in the left side (Nio comes on through it), a goal with its net at each end, a
// floodlight on in each far corner, the low sun off past the right fence. Theo's ball and two kit bags by the right fence.
export const PITCH = { w: 10, h: 9, d: 16, gateZ: 4.5 };
const PD = { s: 2.6, z: 5.2 }; // the door on the pitch
const pitchBoxes = (): Box[] => {
  const W = PITCH.w, D = PITCH.d, gs = W / 2, gz = D - 0.5, white = '#eceee8', net = '#dfe2dc', bs: Box[] = [];
  // a goal at each end: two posts and the bar, the frame running back along the ground, the net on its back, top and sides
  [D - 0.5, 0.5].forEach((gz, e) => { const bk = e ? -1 : 1, o = 70 + e * 10, m = gz + bk * 0.225;
    [-1.5, 1.5].forEach((dx, i) => { bs.push(B(gs + dx, 0.61, gz, 0.04, 0.61, 0.04, white, o + i)); bs.push(B(gs + dx, 0.02, m, 0.02, 0.02, 0.225, '#9a9c98', o + 2 + i)); });
    bs.push(B(gs, 1.2, gz, 1.54, 0.04, 0.04, white, o + 4));
    bs.push(B(gs, 0.6, gz + bk * 0.45, 1.5, 0.6, 0.01, net, o + 5, { mat: 10, noShadow: true }), B(gs, 1.2, m, 1.5, 0.01, 0.225, net, o + 6, { mat: 10, noShadow: true }));
    [-1.5, 1.5].forEach((dx, i) => bs.push(B(gs + dx, 0.6, m, 0.01, 0.6, 0.225, net, o + 7 + i, { mat: 10, noShadow: true }))); });
  // a floodlight in each far corner, on: a tall post and a bright head
  [0.2, W - 0.2].forEach((ps, i) => { bs.push(B(ps, 3.6, D - 0.2, 0.05, 3.6, 0.05, '#4a524e', 90 + i));
    bs.push(B(ps + (i ? -0.25 : 0.25), 7.25, D - 0.3, 0.32, 0.12, 0.06, '#f4f0dc', 92 + i, { glow: true, yaw: FACING.us })); });
  // a door standing on its own in the middle of the grass: a frame, the office light filling it, the door swung wide
  const ds = PD.s, dz = PD.z, wood = '#7a4e36';
  bs.push(B(ds - 0.5, 1.07, dz, 0.05, 1.07, 0.07, wood, 96), B(ds + 0.5, 1.07, dz, 0.05, 1.07, 0.07, wood, 96), B(ds, 2.17, dz, 0.55, 0.05, 0.07, wood, 96));
  bs.push(B(ds, 1.06, dz - 0.04, 0.45, 1.06, 0.012, '#f6d29a', 97, { glow: true, noShadow: true }));
  bs.push(B(ds - 0.47, 1.04, dz + 0.46, 0.025, 1.02, 0.44, '#8a5a3e', 98)); // the door itself, open toward us on its hinge
  // two kit bags by the right fence
  bs.push(B(W - 0.35, 0.14, 9.2, 0.14, 0.14, 0.32, '#23262c', 94), B(W - 0.32, 0.12, 10.1, 0.12, 0.12, 0.28, '#7a2e30', 95));
  return bs;
};
const pitchSofts = (): Soft[] => [{ prims: [{ a: P3(4.2, 0.11, 6.6), ra: 0.11, b: P3(4.2, 0.11, 6.6), rb: 0.11, g: 0, k: 0.004, c: '#f2f2ee' }], origin: P3(4.2, 0, 6.6) }]; // Theo's ball
export const PITCH_CAMS: Record<string, Cam3> = {
  wide: C([3.0, 2.0, 15.4], [2.8, 1.0, 5.0], 56), // up the pitch from by the far goal: the two of them, the gate on the right, the other goal, the evening sky
  nio: C([4.05, 1.45, 6.62], [2.66, 1.38, 7.2], 44), // Nio from the waist up, from just beside Theo, almost on his eyeline: the flyer he holds up reads
  theo: C([2.55, 1.5, 6.75], [4.1, 1.45, 7.0], 40),
  door: C([3.3, 1.5, 9.8], [2.6, 1.0, 5.2], 46), // the door on the pitch, from up the pitch: who comes out of it
  goal: C([5.0, 1.35, 5.2], [5.0, 0.95, 0.8], 36), // the near goal from the edge of the box: who is in it // Theo from the waist up, from beside Nio; it holds him when he steps back
};
export const PITCH_INSERTS: string[] = [];
export const PITCH_MARKS = {
  gate: { s: 0.5, z: PITCH.gateZ, yaw: 270 }, // just through the gate in the left fence, facing into the pitch
  nio: { s: 2.7, z: 7.3, yaw: 258 }, // where Nio stops, facing Theo
  theo: { s: 4.1, z: 7.0, yaw: 78 }, // Theo, by his ball, facing Nio
  theoBack: { s: 4.54, z: 6.91, yaw: 78 },
  door: { s: PD.s, z: PD.z + 0.25, yaw: 0 }, // just out of the door on the pitch, facing up the pitch
  outA: { s: 3.35, z: 6.3, yaw: 0 }, out1: { s: 3.5, z: 8.4, yaw: 0 }, out2: { s: 1.7, z: 8.3, yaw: 0 }, out3: { s: 2.9, z: 9.1, yaw: 0 }, // where the waiting room ends up, squinting
  goal: { s: PITCH.w / 2, z: 1.0, yaw: 0 }, // in the near goal, facing out // one step back from there, still facing him (the action stepBack)
};
export const PITCH_SOLIDS = [{ name: 'the far goal', s: [PITCH.w / 2 - 1.6, PITCH.w / 2 + 1.6], z: [PITCH.d - 0.6, PITCH.d] }, { name: 'the near goal', s: [PITCH.w / 2 - 1.6, PITCH.w / 2 + 1.6], z: [0, 0.6] }];
const pitchLights = (): Light[] => [
  { p: P3(40, 12, -14), r: 90, col: [1.0, 0.74, 0.46] }, // the low sun, off past the right fence (light 0: it casts the shadows); Nio faces into it
  ...[0.45, PITCH.w - 0.45].map((s) => ({ p: P3(s, 7.0, PITCH.d - 0.45), r: 8, col: [0.42, 0.43, 0.4] as V, halo: 0.35 })),
];

// THE ROOF (Group Photo): a flat roof at sunset, the sun low and huge straight up the roof (+z). The stair hut at the
// near left, an air-conditioning box at the near right, and one folding chair (roof.chair: where it stands, or left out).
export const ROOF = { w: 8, h: 7, d: 11 };
export type RoofOpts = { chair?: boolean };
const roofBoxes = (o: RoofOpts = {}): Box[] => {
  const bs: Box[] = [
    B(0.9, 1.15, 1.2, 0.85, 1.15, 0.9, '#8a7a70', 100), B(0.9, 2.33, 1.2, 0.95, 0.04, 1.0, '#5a5050', 101), // the stair hut and its lid
    B(1.76, 1.0, 1.0, 0.012, 1.0, 0.42, '#5a4038', 102), // its door
    B(7.0, 0.45, 2.0, 0.55, 0.45, 0.4, '#b8bcb8', 103), B(7.0, 0.92, 2.0, 0.3, 0.03, 0.3, '#6a6e6c', 104), // the air-con box
  ];
  if (o.chair) { const cs = ROOF_CHAIR.s, cz = ROOF_CHAIR.z, m = '#3a3e44', seat = '#c84a3a';
    bs.push(B(cs, 0.44, cz, 0.22, 0.02, 0.21, seat, 105));
    [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(([a, b], i) => bs.push(B(cs + a, 0.21, cz + b, 0.015, 0.21, 0.015, m, 106 + i)));
    bs.push(B(cs, 0.72, cz - 0.2, 0.22, 0.2, 0.015, seat, 110)); } // the back toward the near end
  return bs;
};
export const ROOF_CHAIR = { s: 4.0, z: 9.1 };
const roofLights = (): Light[] => [
  { p: P3(4.0, 6, 80), r: 120, col: [1.0, 0.62, 0.36] }, // the sun, low, straight up the roof (light 0: the shadows)
  { p: P3(4.0, 6, -6), r: 30, col: [0.22, 0.2, 0.34] }, // the violet sky behind us
];
export const ROOF_CAMS: Record<string, Cam3> = {
  wide: C([5.0, 1.75, 2.3], [3.9, 1.2, 6.6], 52), // from behind Nio: the three in a line, the sun behind them
  theo: C([3.85, 1.48, 4.3], [3.3, 1.42, 6.5], 40),
  three: C([4.0, 1.4, 10.1], [4.0, 1.25, 6.5], 60), // the reverse: from where Nio ends up, the three facing into the sun
  maya: C([4.3, 1.45, 8.6], [4.75, 1.42, 6.5], 40),
  sami: C([3.7, 1.45, 8.6], [4.0, 1.42, 6.6], 40),
  theoUp: C([3.9, 2.05, 8.9], [3.3, 1.3, 6.5], 46), // Theo, looking up at the camera on the chair
  sunset: C([4.0, 1.95, 9.3], [4.0, 1.75, 12.0], 62), // turned round on the chair: the sun going down over the city (an insert)
  povM: C([4.0, 2.0, 8.95], [4.7, 1.2, 6.5], 56), // Nio's phone on the last one left in the picture: Maya
  pov: C([4.0, 2.0, 8.95], [4.0, 1.15, 6.5], 72), // Nio's phone up on the chair: the line, and the sunset behind us
  chair: C([3.0, 0.7, 7.2], [4.0, 1.7, 9.1], 50), // Nio up on the chair, from below, the violet sky behind him
  nio: C([3.3, 1.45, 6.4], [4.0, 1.4, 9.1], 40), // Nio from where the three were
  nioA: C([3.6, 1.5, 6.1], [4.0, 1.42, 4.0], 40), // Nio at the start, phone up, from the line
  whole: C([4.0, 2.2, 0.6], [4.0, 1.0, 7.0], 70), // the whole roof from the stair hut end
  phone: C([4.0, 1.6, 11.4], [4.0, 1.4, 8.6], 56), // up from Nio's phone at the four faces round it
};
export const ROOF_MARKS = {
  nio: { s: 4.0, z: 4.0, yaw: 0 }, // taking the picture, facing up the roof at them
  theo: { s: 3.3, z: 6.5, yaw: 180 }, sami: { s: 4.0, z: 6.6, yaw: 180 }, maya: { s: 4.75, z: 6.5, yaw: 180 }, // the line, facing Nio
  nio2: { s: 4.0, z: 9.1, yaw: 180 }, // Theo's left side: the far end, his back to the sun
  chair: { s: ROOF_CHAIR.s, z: ROOF_CHAIR.z, yaw: 180, on: 0.46 }, // up on the chair
  theoOut: { s: 2.15, z: 6.4, yaw: 90 }, samiOut: { s: 5.85, z: 6.9, yaw: 270 }, mayaOut: { s: 5.85, z: 6.3, yaw: 270 }, // walked out of the picture
  theoP: { s: 4.42, z: 8.75, yaw: 0 }, samiP: { s: 4.0, z: 8.3, yaw: 0 }, mayaP: { s: 3.58, z: 8.75, yaw: 0 }, samiB: { s: 3.8, z: 8.2, yaw: 0 }, // round Nio's phone
};
export const ROOF_SOLIDS = [{ name: 'the stair hut', s: [0, 1.8] as [number, number], z: [0.3, 2.1] as [number, number] }, { name: 'the air-con box', s: [6.4, 7.6] as [number, number], z: [1.6, 2.4] as [number, number] }];

// THE QUAD (Wave Back): the campus lawn at midday, open all round. A stone path down the left and across the far end,
// a tree on the right, a bench by the path, a lamp post. Nio in the middle; the man who waves at the far end; the girl in
// yellow behind Nio, near us.
export const QUAD = { w: 12, h: 10, d: 18 };
const quadBoxes = (): Box[] => [
  B(9.6, 1.5, 11.5, 0.16, 1.5, 0.16, '#5a4030', 120), // the tree's trunk
  B(2.3, 0.42, 9.0, 0.24, 0.03, 0.85, '#8a6a48', 121), B(2.08, 0.7, 9.0, 0.025, 0.2, 0.85, '#8a6a48', 122), // the bench, its back to the path's far side
  ...[8.3, 9.7].map((z, i) => B(2.3, 0.2, z, 0.22, 0.2, 0.03, '#2e3236', 123 + i)),
  B(3.3, 1.6, 5.2, 0.04, 1.6, 0.04, '#2e3236', 125), B(3.3, 3.25, 5.2, 0.13, 0.09, 0.13, '#e8e4d0', 126), // the lamp post, off
];
const quadSofts = (): Soft[] => [{ prims: [[9.6, 3.9, 11.5, 1.35], [8.8, 3.4, 11.1, 0.95], [10.3, 3.5, 12.1, 1.0], [9.7, 4.6, 12.0, 0.9]].map(([s, y, z, r]) => ({ a: P3(s, y, z), ra: r, b: P3(s, y, z), rb: r, g: 0, k: 0.25, c: '#3f7a3a' })), origin: P3(9.6, 0, 11.5) }]; // the tree's crown
const quadLights = (): Light[] => [
  { p: P3(-30, 42, 2), r: 130, col: [1.0, 0.93, 0.8] }, // the midday sun, high and off to the left (light 0: the shadows)
  { p: P3(6, 18, 34), r: 60, col: [0.3, 0.36, 0.46] }, // the blue sky
];
export const QUAD_CAMS: Record<string, Cam3> = {
  wide: C([3.6, 1.5, 17.7], [6.0, 1.2, 8.0], 44), // from behind the man who waves: him, Nio facing us, the girl in yellow behind Nio
  nio: C([5.6, 1.5, 9.6], [6.0, 1.3, 5.0], 40), // Nio from the front, the girl in yellow over his shoulder
  nioClose: C([5.75, 1.5, 9.4], [6.0, 1.42, 7.0], 36), // Nio, waist up
  marcus: C([5.15, 1.55, 11.0], [5.75, 1.38, 13.0], 40), // over Nio's shoulder at Marcus
  nioM: C([5.5, 1.5, 14.9], [5.7, 1.35, 11.0], 40), // from behind Marcus at Nio (Marcus out of the picture)
  walk: C([4.0, 1.45, 15.3], [5.8, 1.3, 10.6], 40), // Nio coming up the lawn at us
  two: C([8.4, 1.45, 11.4], [5.6, 1.3, 12.6], 46), // the two of them, from the side
};
export const QUAD_MARKS = {
  nio: { s: 6.0, z: 7.0, yaw: 0 }, // in the middle of the lawn, facing up it
  marcus: { s: 5.6, z: 13.0, yaw: 180 }, // at the far end, facing down the lawn (toward his sister)
  sis: { s: 5.5, z: 4.0, yaw: 0 }, // the girl in yellow, behind Nio, facing up the lawn
  sisOff: { s: 7.9, z: 3.5, yaw: 270 }, // walking off to the right
  nioMid: { s: 5.9, z: 10.5, yaw: 0 }, // on his way over
  nioM: { s: 5.65, z: 12.05, yaw: 0 }, // where Nio stops, in Marcus's face
};
export const QUAD_SOLIDS = [{ name: 'the tree', s: [9.2, 10.0] as [number, number], z: [11.1, 11.9] as [number, number] }, { name: 'the bench', s: [2.0, 2.6] as [number, number], z: [8.1, 9.9] as [number, number] }];

// MUM'S DINING ROOM (Wave Back): a table for four down the middle of the room. Mum at the head (the far end, facing us),
// Nio on the left, Marcus across from him, the empty chair beside Marcus. The doorway at the far right.
export const DINE = { w: 4.4, h: 2.6, d: 5.4 };
const dineChair = (s: number, z: number, bk: [number, number], o: number): Box[] => [
  B(s, 0.44, z, 0.21, 0.025, 0.21, '#6a4228', o), B(s + bk[0] * 0.2, 0.74, z + bk[1] * 0.2, bk[0] ? 0.02 : 0.2, 0.28, bk[1] ? 0.02 : 0.2, '#6a4228', o + 1),
  ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => B(s + a * 0.18, 0.21, z + b * 0.18, 0.018, 0.21, 0.018, '#5a3820', o + 2 + i)),
];
const dineBoxes = (): Box[] => [
  B(2.0, 0.745, 3.2, 0.38, 0.025, 0.85, '#f2efe6', 130), // the table under a white cloth
  ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => B(2.0 + a * 0.32, 0.36, 3.2 + b * 0.78, 0.03, 0.36, 0.03, '#6a4228', 131 + i)),
  ...dineChair(1.4, 3.0, [-1, 0], 140), ...dineChair(2.6, 3.0, [1, 0], 150), ...dineChair(2.6, 3.65, [1, 0], 160), ...dineChair(2.0, 4.35, [0, 1], 170),
  ...[[1.74, 3.0], [2.26, 3.0], [2.26, 3.65], [2.0, 3.85]].map(([s, z], i) => B(s, 0.775, z, 0.13, 0.006, 0.13, '#fbfaf6', 180 + i)), // four plates
  B(0.12, 0.45, 1.6, 0.12, 0.45, 0.5, '#5a3820', 186), B(0.12, 0.92, 1.6, 0.14, 0.02, 0.52, '#6a4228', 187), // a sideboard on the left wall
  B(2.0, 2.25, 3.2, 0.01, 0.35, 0.01, '#2a2224', 188), B(2.0, 1.85, 3.2, 0.2, 0.07, 0.2, '#e9b860', 189, { glow: true }), // the lamp over the table
];
const dineSofts = (): Soft[] => [
  { prims: [{ a: P3(1.95, 0.84, 3.3), ra: 0.11, b: P3(2.07, 0.84, 3.3), rb: 0.1, g: 0, k: 0.05, c: '#b87334' }], origin: P3(2.0, 0.77, 3.3) }, // the roast
];
const dineLights = (): Light[] => [
  { p: P3(2.0, 1.75, 3.2), r: 4.5, col: [1.0, 0.8, 0.56] }, // the lamp over the table (light 0: the shadows)
  { p: P3(0.95, 1.6, 5.2), r: 3.5, col: [0.24, 0.28, 0.44] }, // the dusk through the window
  { p: P3(3.55, 1.4, 5.6), r: 3.0, col: [0.5, 0.36, 0.2] }, // the hall light through the door
];
export const DINE_CAMS: Record<string, Cam3> = {
  wide: C([2.0, 1.6, 0.25], [2.1, 1.05, 3.6], 72), // down the table from the near end: Nio left, Marcus right, Mum at the head, the doorway
  mum: C([2.05, 1.25, 2.55], [2.0, 1.18, 4.35], 40),
  nio: C([3.15, 1.35, 2.15], [1.45, 1.12, 3.05], 42), // Nio, from behind Marcus's chair
  marcus: C([0.85, 1.35, 2.15], [2.55, 1.12, 3.05], 42), // Marcus, from behind Nio's chair
  end: C([4.2, 1.95, 0.2], [2.3, 1.1, 3.8], 66), // from the near right corner: Nio's face over Marcus's shoulder, Mum, the doorway
  door: C([3.7, 1.35, 2.2], [3.55, 1.3, 4.8], 46), // the doorway, from along the right wall
};
export const DINE_MARKS = {
  nio: { s: 1.45, z: 3.0, yaw: 270, seat: 0.455 }, marcus: { s: 2.55, z: 3.0, yaw: 90, seat: 0.455 }, mum: { s: 2.0, z: 4.3, yaw: 180, seat: 0.455 },
  hall: { s: 3.55, z: 5.9, yaw: 180 }, // out in the hall
  door: { s: 3.55, z: 4.85, yaw: 200 }, // in the doorway, facing the table
};
export const DINE_SOLIDS = [{ name: 'the table', s: [1.62, 2.38] as [number, number], z: [2.35, 4.05] as [number, number] }];

export type CampusOpts = WaitOpts & HallOpts & OfficeOpts & CorridorOpts & RoofOpts & { time?: number };
export const CAMPUS_ROOMS = {
  waiting: { kind: 2, size: [WAIT.w, WAIT.h, WAIT.d] as V, cams: WAIT_CAMS },
  hall: { kind: 0, size: [HALL.w, HALL.h, HALL.d] as V, cams: HALL_CAMS },
  office: { kind: 3, size: [OFF.w, OFF.h, OFF.d] as V, cams: OFFICE_CAMS },
  corridor: { kind: 1, size: [COR.w, COR.h, COR.d] as V, cams: CORRIDOR_CAMS },
  pitch: { kind: 4, size: [PITCH.w, PITCH.h, PITCH.d] as V, cams: PITCH_CAMS },
  roof: { kind: 5, size: [ROOF.w, ROOF.h, ROOF.d] as V, cams: ROOF_CAMS },
  quad: { kind: 6, size: [QUAD.w, QUAD.h, QUAD.d] as V, cams: QUAD_CAMS },
  dining: { kind: 7, size: [DINE.w, DINE.h, DINE.d] as V, cams: DINE_CAMS },
};
export type CampusRoom = keyof typeof CAMPUS_ROOMS;
// A shot in a campus room. acts: the cast, placed by (s, z) as anywhere else.
export const campusShot = (room: CampusRoom, camA: CamArg, acts: Act[], o: CampusOpts = {}): Scene3 => {
  const R = CAMPUS_ROOMS[room], hall = room === 'hall', office = room === 'office', cor = room === 'corridor', pitch = room === 'pitch', roof = room === 'roof', quad = room === 'quad', dine = room === 'dining', f = (o.time ?? 0) * 24;
  // Prof H's hand goes wherever the flyer is this frame: its near edge, on his side
  const fp = office ? flyerAt(o, f) : undefined;
  const acts2 = acts.map((a) => (a.pose === 'slideFlyer' && fp ? { ...a, reachTo: add(fp, [0, 0, 0.13]) as V } : a));
  const ps = lensActs(camA, acts2).map((a) => pose(a)), cam = camOf(camA, ps);
  const boxes = quad ? quadBoxes() : dine ? dineBoxes() : roof ? roofBoxes(o) : hall ? hallBoxes(o) : office ? officeBoxes(o, f) : cor ? corridorBoxes(o, f) : pitch ? pitchBoxes() : waitBoxes(o, f);
  const lights = quad ? quadLights() : dine ? dineLights() : roof ? roofLights() : hall ? hallLights() : office ? officeLights(o, f) : cor ? corridorLights(o, f) : pitch ? pitchLights() : waitLights(o, f);
  const look = ps.find((p, i) => acts[i].who?.id === 'nio')?.soft.head?.c ?? P3(seatS(0), 2.1, seatZ(4));
  const door = hall || pitch || roof || quad || dine ? 0 : keyed(o.door, f, cor ? 0.7 : 0), doorX = X(office ? OFF.door : cor ? COR.w / 2 : WAIT.door);
  return {
    cam, room: R.size, room0: [X(R.size[0]), 0, 0], set: 3, time: o.time ?? 0,
    outdoor: pitch || roof || quad || undefined, campus: [R.kind, door, doorX, office ? 1 : 0], campus2: [cor ? keyed(o.door2, f, 0.7) : 0, cor ? keyed(o.stairs, f, 0) : 0, COR.stairZ, 0],
    amb: quad ? [0.46, 0.48, 0.52] : dine ? [0.34, 0.29, 0.25] : roof ? [0.46, 0.36, 0.44] : hall ? [0.3, 0.29, 0.31] : office ? [0.32, 0.29, 0.27] : cor ? [0.3, 0.32, 0.32] : pitch ? [0.4, 0.42, 0.48] : [0.3, 0.34, 0.31],
    ambChar: quad ? [0.92, 0.92, 0.94] : dine ? [0.92, 0.84, 0.76] : roof ? [0.96, 0.84, 0.86] : hall ? [0.86, 0.84, 0.82] : office ? [0.88, 0.84, 0.8] : pitch ? [0.86, 0.86, 0.9] : [0.84, 0.88, 0.84],
    crowd: hall ? hallCrowd(o, acts.map((a) => a.at as [number, number]), look, cam, f) : undefined,
    boxes, softs: [...ps.map((p) => p.soft), ...(quad ? quadSofts() : dine ? dineSofts() : hall ? hallSofts(o) : office ? officeSofts() : pitch ? pitchSofts() : [])], lights: [...lights, ...ps.flatMap((p) => p.lights)],
    props: [...ps.flatMap((p) => p.props), ...(hall ? hallProps(o, f) : [])], shadows: ps.flatMap((p) => p.shadows),
  };
};
