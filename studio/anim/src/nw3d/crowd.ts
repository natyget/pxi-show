// The club and its crowd, in the shader. Spliced into SCENE_FRAG (shader.ts) before main().
//  - the club's own surfaces: a floor of lit tiles, dark padded walls with a neon line, an LED wall behind the DJ
//  - light beams from the rig in the ceiling, seen in the haze and as pools of colour on people and the floor
//  - the crowd: one person per cell of a floor grid, every one different (build, height, skin, head, hair, clothes,
//    face), on the same soft capsule bodies, ink lines and flat character light as the cast. They dance, crouch and
//    sweep the floor in time, put their arms up, lift their heads. A ray walks the grid cell by cell, so hundreds of
//    people cost little more than a few.
import { SKINS, HAIRS, HAIR_W, TOPS, BOTTOMS, SHOES } from './people';

const rgb = (h: string) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3)).join(', ');
const arr = (name: string, xs: string[]) => `const vec3 ${name}[${xs.length}] = vec3[${xs.length}](${xs.map((x) => `vec3(${rgb(x)})`).join(', ')});`;
const cum = HAIR_W.map((_, i) => HAIR_W.slice(0, i + 1).reduce((a, b) => a + b, 0) / HAIR_W.reduce((a, b) => a + b, 0));

export const CROWD_GLSL = `
// ==== the club ====
uniform vec4 uClub;   // x: mood (0 the party colours .. 1 low and green), y: beats a second, z: the LED wall's centre x, w: its half width
uniform vec4 uClubF;  // the lit dance floor: x0, z0, x1, z1
uniform vec4 uBo[4]; uniform vec4 uBd[4]; uniform vec4 uBk[4]; uniform int uNBm; // beams: origin + spread a metre, direction + strength, colour
uniform vec4 uCw0;    // crowd grid: x0, z0, cell width, cell depth
uniform vec4 uCw1;    // columns, rows, seed, fill (the share of cells with someone in; 0 = no crowd)
uniform vec4 uCw2;    // dance, crouch, arms up, heads up (0..1 each)
uniform vec4 uCw3;    // the cleared circle: x, z, radius; w: how far from its centre the crouch has spread
uniform vec4 uCw4;    // the point everyone faces (x, z); z: people this near the circle face it instead; w: faces (0 party, 1 laughing, 2 the floor, 3 chanting)
uniform vec4 uHole[6]; // more places nobody stands (where the cast are): x, z, radius

${arr('C_SKIN', SKINS)}
${arr('C_HAIRA', HAIRS.map((h) => h[0]))}
${arr('C_HAIRB', HAIRS.map((h) => h[1]))}
${arr('C_TOP', TOPS)}
${arr('C_BOT', BOTTOMS)}
${arr('C_SHOE', SHOES)}
const float C_HAIRW[${cum.length}] = float[${cum.length}](${cum.map((c) => c.toFixed(4)).join(', ')});

vec3 neonA(){ return mix(vec3(0.78, 0.32, 1.0), vec3(0.32, 1.0, 0.52), uClub.x); }
vec3 neonB(){ return mix(vec3(1.0, 0.36, 0.62), vec3(0.18, 0.78, 0.42), uClub.x); }

vec3 clubFloor(vec3 p, float fp, out float em){
  em = 0.0;
  vec3 c = vec3(0.13, 0.105, 0.14) * mott(p, 1.0);
  if (p.x > uClubF.x && p.x < uClubF.z && p.z > uClubF.y && p.z < uClubF.w){
    vec2 tq = (p.xz - uClubF.xy) / 0.6; vec2 ti = floor(tq), tf = fract(tq); float g = max(0.035, fp / 0.6 * 0.9);
    if (tf.x < g || tf.y < g) return vec3(0.05, 0.04, 0.06);
    float hh = hash(ti + floor(uTime * uClub.y) * 0.371);
    vec3 party = hh < 0.22 ? vec3(0.62, 0.22, 0.86) : hh < 0.4 ? vec3(0.9, 0.32, 0.56) : hh < 0.55 ? vec3(0.26, 0.5, 0.9) : vec3(0.2, 0.14, 0.26);
    vec3 green = hh < 0.3 ? vec3(0.14, 0.5, 0.24) : vec3(0.06, 0.13, 0.08);
    c = mix(party, green, uClub.x) * (0.93 + 0.07 * hash(floor(p.xz / 0.034)));
    em = hh < (uClub.x > 0.5 ? 0.3 : 0.55) ? 0.6 : 0.0;
  }
  return c;
}
vec3 clubWall(vec3 p, int w, float fp, vec2 px, out float em, out vec3 add){
  em = 0.0; add = vec3(0.0);
  if (w == 2) return vec3(0.06, 0.05, 0.07) * mott(p, 1.0);
  vec2 uv = (w == 3 || w == 6) ? p.xy : p.zy;
  vec3 c = vec3(0.1, 0.075, 0.11);
  // padded panels, tall and soft-edged
  vec2 pc = vec2(uv.x / 0.9, (uv.y - 0.45) / 1.55); vec2 pf = fract(pc);
  if (uv.y > 0.45 && uv.y < 3.55 && pf.x > 0.035 && pf.x < 0.965 && pf.y > 0.03 && pf.y < 0.97) c = vec3(0.16, 0.115, 0.175) * mott(p, 1.3) * (pf.x < 0.09 || pf.x > 0.91 ? 0.85 : 1.0);
  if (uv.y < 0.45) c = vec3(0.08, 0.06, 0.09);
  // the neon line round the room, high up, and its glow on the wall
  float nw = max(0.022, fp * 0.8), dy = uv.y - 3.72;
  if (abs(dy) < nw){ c = neonA(); em = 1.0; return c; }
  add += neonA() * 0.3 * floor(3.0 / (1.0 + dy * dy / 0.03) + bayer(px) * 0.6) / 3.0;
  if (w == 3){ // the LED wall behind the DJ: an equaliser in square lights
    vec2 q = p.xy - vec2(uClub.z, 1.3);
    if (abs(q.x) < uClub.w && q.y > 0.0 && q.y < 2.3){
      c = vec3(0.035, 0.028, 0.045); em = 1.0;
      vec2 cell = floor(q / 0.115), cf = fract(q / 0.115);
      if (cf.x > 0.14 && cf.y > 0.14){
        float col = abs(cell.x + 0.5); float b = floor(uTime * uClub.y * 2.0);
        float bh = 2.3 * (0.2 + 0.65 * hash(vec2(col, b)) * (1.0 - col * 0.02));
        float y = (cell.y + 0.5) * 0.115;
        c = y < bh ? mix(mix(vec3(0.58, 0.2, 0.95), vec3(1.0, 0.42, 0.66), y / 2.3), vec3(0.22, 0.85, 0.42), uClub.x) : vec3(0.075, 0.05, 0.095);
      }
    }
  }
  return c;
}
// a box painted as a speaker (mat 5): a big cone low and a small one high, on its front face (local z)
vec3 speakerFace(vec3 c, vec3 lp, vec3 h, vec3 ln){
  if (abs(ln.z) < 0.5) return c * 0.9;
  vec2 uv = lp.xy;
  for (int k = 0; k < 2; k++){ vec2 cc = k == 0 ? vec2(0.0, -0.3 * h.y) : vec2(0.0, 0.56 * h.y); float r = k == 0 ? 0.78 * h.x : 0.38 * h.x;
    float d = length(uv - cc) / r; if (d < 1.0) return d > 0.86 ? vec3(0.04, 0.035, 0.045) : d < 0.3 ? vec3(0.2, 0.18, 0.22) : vec3(0.11, 0.1, 0.12) * (d > 0.7 ? 1.2 : 1.0); }
  return c;
}

// ---- beams: cones of light from the rig, seen in the haze ----
float beamIn(vec3 p, int i){ vec3 d = p - uBo[i].xyz; float a = dot(d, uBd[i].xyz); if (a <= 0.0) return 0.0;
  float R = 0.05 + a * uBo[i].w; return clamp((R - length(d - uBd[i].xyz * a)) / (R * 0.35), 0.0, 1.0); }
vec3 beamLight(vec3 p, vec2 px){ vec3 L = vec3(0.0); float by = bayer(px);
  for (int i = 0; i < 4; i++){ if (i >= uNBm) break; L += uBk[i].rgb * uBd[i].w * floor(beamIn(p, i) * 3.0 + by * 0.7) / 3.0; }
  return L; }
vec3 beamHaze(vec3 ro, vec3 rd, float t, vec2 px){ vec3 H = vec3(0.0); float by = bayer(px);
  for (int i = 0; i < 4; i++){ if (i >= uNBm) break;
    vec3 o = uBo[i].xyz, D = uBd[i].xyz, w = ro - o; float b = dot(rd, D), den = 1.0 - b * b; if (den < 1e-4) continue;
    float s = clamp((b * dot(D, w) - dot(rd, w)) / den, 0.0, t); vec3 q = ro + rd * s - o; float a = dot(q, D); if (a <= 0.0) continue;
    float R = 0.05 + a * uBo[i].w, g = clamp(1.0 - length(q - D * a) / R, 0.0, 1.0); g = g * g / (1.0 + a * 0.18);
    H += uBk[i].rgb * uBd[i].w * 0.42 * floor(g * 4.0 + by * 0.8) / 4.0; }
  return H; }

// ==== the crowd ====
struct Pp {
  vec3 o, f, hp0, hp1, kn0, kn1, an0, an1, hip, nk, sh0, sh1, el0, el1, wr0, wr1, hc, hR, hU, hF;
  float hs, tr, hw, ch, look; int style, ex, cls; bool longS, skirt, curls;
  vec3 skin, hA, hB, top, bot, shoe;
};
// Is someone standing in this cell, and where. Odd rows sit half a cell over, and everyone is a little off their spot.
bool crowdAt(ivec2 c, out vec3 o){
  o = vec3(0.0);
  if (c.x < 0 || c.y < 0 || c.x >= int(uCw1.x) || c.y >= int(uCw1.y)) return false;
  vec2 cf = vec2(c) + uCw1.z * 17.0;
  if (hash(cf) > uCw1.w) return false;
  float st = mod(float(c.y), 2.0) < 0.5 ? -0.22 : 0.22;
  o = vec3(uCw0.x + (float(c.x) + 0.5 + st + (hash(cf + 3.1) - 0.5) * 0.36) * uCw0.z, 0.0, uCw0.y + (float(c.y) + 0.5 + (hash(cf + 5.3) - 0.5) * 0.3) * uCw0.w);
  if (length(o.xz - uCw3.xy) < uCw3.z) return false;
  for (int i = 0; i < 6; i++) if (uHole[i].z > 0.0 && length(o.xz - uHole[i].xy) < uHole[i].z) return false;
  return true;
}
vec3 ikJ(vec3 a, vec3 c, float l1, float l2, vec3 pole){
  vec3 to = c - a; float d = clamp(length(to), abs(l1 - l2) + 0.002, l1 + l2 - 0.002); vec3 n = normalize(to);
  float x = (l1 * l1 - l2 * l2 + d * d) / (2.0 * d); float r = sqrt(max(l1 * l1 - x * x, 0.0));
  return a + n * x + normalize(pole - n * dot(pole, n) + vec3(1e-5)) * r; }
vec3 ikE(vec3 a, vec3 c, float l1, float l2){ vec3 to = c - a; return a + normalize(to) * clamp(length(to), abs(l1 - l2) + 0.002, l1 + l2 - 0.002); }
void crowdPerson(ivec2 c, vec3 o, out Pp P){
  vec2 cf = vec2(c) + uCw1.z * 17.0;
  float h1 = hash(cf + 11.3), h2 = hash(cf + 13.7), h3 = hash(cf + 17.1), h4 = hash(cf + 19.9), h5 = hash(cf + 23.3), h6 = hash(cf + 29.1),
        h7 = hash(cf + 31.7), h8 = hash(cf + 37.3), h9 = hash(cf + 41.9), h10 = hash(cf + 43.1), h11 = hash(cf + 47.3), h12 = hash(cf + 53.9);
  P.o = o; P.cls = int(mod(float(c.x + 2 * c.y), 5.0));
  bool slight = h1 < 0.5; float ht = (slight ? 0.92 : 1.0) * (0.94 + 0.12 * h2);
  // who they face: the circle if they are round it, otherwise the DJ; never quite square
  vec2 toC = uCw3.xy - o.xz; float dc = length(toC);
  vec2 fd = normalize(((dc < uCw3.z + uCw4.z) ? uCw3.xy : uCw4.xy) - o.xz + vec2(1e-4)); float ang = (h3 - 0.5) * 0.8;
  fd = vec2(fd.x * cos(ang) - fd.y * sin(ang), fd.x * sin(ang) + fd.y * cos(ang));
  vec3 F = vec3(fd.x, 0.0, fd.y), R = vec3(-fd.y, 0.0, fd.x), UP = vec3(0.0, 1.0, 0.0); P.f = F;
  // the moves
  float T = uTime, ph = h4 * 6.2832, bt = T * uClub.y * 3.14159;
  float D = uCw2.x, A = uCw2.z, U = uCw2.w;
  float C = uCw2.y * smoothstep(uCw3.w + 0.3, uCw3.w - 0.3, dc);
  float Dn = D * (1.0 - C) * (1.0 - A * 0.5);
  float bob = Dn * abs(sin(bt + ph)) * 0.05 + A * abs(sin(bt + ph)) * 0.05, sway = Dn * sin(bt * 0.5 + ph) * 0.06;
  float shin = 0.32 * ht, thigh = 0.34 * ht, torso = (slight ? 0.37 : 0.4) * (0.97 + 0.06 * h5), hh = slight ? 0.068 : 0.075;
  P.tr = (slight ? 0.08 : 0.088) * (0.9 + 0.28 * h6); float shH = (slight ? 0.125 : 0.135) * (0.94 + 0.12 * h6), ua = 0.24 * ht, fa = 0.225 * ht;
  vec3 hip = o + vec3(0.0, mix(shin + thigh + 0.04 - bob, 0.33 * ht, C), 0.0) + R * sway - F * 0.07 * C;
  float sa = mix(0.085, 0.17, C) + 0.02 * h7;
  vec3 an0 = o + R * sa + vec3(0.0, 0.055, 0.0) + F * 0.02, an1 = o - R * sa + vec3(0.0, 0.055, 0.0) + F * 0.02;
  an0.y += Dn * max(0.0, sin(bt + ph)) * (h8 > 0.5 ? 0.07 : 0.0); an1.y += Dn * max(0.0, -sin(bt + ph)) * (h8 > 0.75 ? 0.07 : 0.0);
  P.hp0 = hip + R * hh; P.hp1 = hip - R * hh;
  P.an0 = ikE(P.hp0, an0, thigh, shin); P.an1 = ikE(P.hp1, an1, thigh, shin);
  P.kn0 = ikJ(P.hp0, an0, thigh, shin, normalize(F + R * mix(0.15, 0.7, C))); P.kn1 = ikJ(P.hp1, an1, thigh, shin, normalize(F - R * mix(0.15, 0.7, C)));
  float lean = mix(0.04 + 0.07 * Dn * sin(bt + ph + 1.0), 0.9, C) - A * 0.05;
  vec3 up = normalize(UP * cos(lean) + F * sin(lean) + R * sway * 0.9);
  P.hip = hip; P.nk = hip + up * torso;
  // the head: looks down at the floor in the crouch, lifts to chant, nods to the beat
  P.hs = (0.94 + 0.12 * h9) * (slight ? 0.97 : 1.0); P.hw = 0.92 + 0.17 * h10; P.ch = 0.9 + 0.2 * h11;
  vec3 hu = normalize(UP * 0.62 + up * 0.38), hf = normalize(F - hu * dot(F, hu));
  float yaw = (h12 - 0.5) * 0.6 * (1.0 - C); hf = normalize(hf * cos(yaw) + cross(hu, hf) * sin(yaw));
  float pit = C * 0.75 - U * 0.5 + Dn * 0.1 * sin(bt * 2.0 + ph) + A * -0.15;
  P.hF = normalize(hf * cos(pit) - hu * sin(pit)); P.hU = normalize(hu * cos(pit) + hf * sin(pit)); P.hR = cross(P.hU, P.hF);
  P.hc = P.nk + P.hU * (0.1 + 0.16 * P.hs);
  // arms: each person has their own way of dancing
  vec3 sd = normalize(R - up * dot(R, up));
  P.sh0 = P.nk - up * 0.06 + sd * shH; P.sh1 = P.nk - up * 0.06 - sd * shH;
  int ds = int(h5 * 4.0); vec3 w0, w1; float s1 = sin(bt + ph), s2 = sin(bt * 2.0 + ph);
  if (ds == 0){ w0 = P.sh0 + UP * 0.42 * ht + sd * (0.06 + 0.09 * s1) + F * 0.06; w1 = P.sh1 + UP * 0.42 * ht - sd * (0.06 - 0.09 * s1) + F * 0.06; }
  else if (ds == 1){ float pu = max(0.0, s2); w0 = P.sh0 + UP * mix(0.1, 0.45, pu) * ht + F * mix(0.2, 0.08, pu) + sd * 0.07; w1 = P.sh1 - UP * 0.22 + F * 0.16 - sd * 0.04; }
  else if (ds == 2){ w0 = P.sh0 + F * 0.22 + UP * (-0.12 + 0.06 * s2) - sd * 0.04; w1 = P.sh1 + F * 0.22 + UP * (-0.12 - 0.06 * s2) + sd * 0.04; }
  else { w0 = P.sh0 - UP * 0.36 * ht + F * 0.12 + sd * 0.06 * s1; w1 = P.sh1 - UP * 0.36 * ht + F * 0.12 - sd * 0.06 * s1; }
  w0 = mix(P.sh0 - UP * 0.42 * ht + sd * 0.05, w0, D); w1 = mix(P.sh1 - UP * 0.42 * ht - sd * 0.05, w1, D);
  w0 = mix(w0, P.sh0 + UP * 0.44 * ht + sd * 0.1 + F * 0.05 + sd * 0.05 * s2, A); w1 = mix(w1, P.sh1 + UP * 0.44 * ht - sd * 0.1 + F * 0.05 + sd * 0.05 * s2, A);
  // the sweep: both hands flat on the floor in front of them, slow circles, one each way, everyone in time
  float sw = T * uClub.y * 3.14159; vec3 fc = o + F * 0.34 * ht + vec3(0.0, 0.035, 0.0);
  w0 = mix(w0, fc + sd * 0.15 + (sd * cos(sw) + F * sin(sw)) * 0.11, C); w1 = mix(w1, fc - sd * 0.15 + (-sd * cos(sw) + F * sin(sw)) * 0.11, C);
  vec3 pol = -UP * 0.7 - F * 0.25;
  P.el0 = ikJ(P.sh0, w0, ua, fa, normalize(sd + pol)); P.wr0 = ikE(P.sh0, w0, ua, fa);
  P.el1 = ikJ(P.sh1, w1, ua, fa, normalize(-sd + pol)); P.wr1 = ikE(P.sh1, w1, ua, fa);
  // the look
  P.skin = C_SKIN[int(hash(cf + 59.1) * ${SKINS.length}.0)];
  float hc = hash(cf + 61.7); int hi = 0; for (int i = 0; i < ${cum.length}; i++){ if (hc <= C_HAIRW[i]){ hi = i; break; } }
  P.style = int(hash(cf + 67.3) * 9.0); if (!slight && (P.style == 1 || P.style == 2 || P.style == 5 || P.style == 6 || P.style == 7) && hash(cf + 71.0) < 0.6) P.style = hash(cf + 73.0) < 0.5 ? 0 : 4;
  P.curls = P.style == 1 || P.style == 3 || P.style == 8;
  if (hi >= 6 && !(P.style == 2 || P.style == 5 || P.style == 7)) hi = int(hash(cf + 63.1) * 4.0);
  P.hA = C_HAIRA[hi]; P.hB = C_HAIRB[hi];
  P.top = C_TOP[int(hash(cf + 79.1) * ${TOPS.length}.0)]; P.bot = C_BOT[int(hash(cf + 83.3) * ${BOTTOMS.length}.0)]; P.shoe = C_SHOE[int(hash(cf + 89.9) * ${SHOES.length}.0)];
  P.longS = hash(cf + 97.1) < 0.45; P.skirt = slight && hash(cf + 101.3) < 0.35;
  float fm = uCw4.w, fh = hash(cf + 103.7);
  P.ex = fm > 2.5 ? 3 : fm > 1.5 ? 2 : fm > 0.5 ? 1 : (fh < 0.45 ? 0 : fh < 0.75 ? 1 : 3);
  P.look = (hash(cf + 107.9) - 0.5) * 1.4;
}
float capd(vec3 p, vec3 a, vec3 b, float ra, float rb){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h) - mix(ra, rb, h); }
vec3 cHeadQ(vec3 p, Pp P){ vec3 d = p - P.hc; return vec3(dot(d, P.hR), dot(d, P.hU), dot(d, P.hF)) / P.hs; }
float cSkull(vec3 q, float w, float ch){
  q.x /= w; float d = length(q * vec3(0.97, 1.03, 1.0)) - 0.2;
  vec3 c = vec3(abs(q.x) - 0.07, q.y + 0.082 * ch, q.z - 0.028); d = smin(d, length(c * vec3(1.0, 1.12 / ch, 1.0)) - 0.132, 0.06);
  vec3 e = vec3(abs(q.x) - 0.218, q.y + 0.09, q.z + 0.005); d = min(d, (length(e * vec3(1.3, 1.0, 1.5)) - 0.05) / 1.5);
  return d * 0.95; }
float cHair(vec3 q, int st){
  float hl = mix(-0.095, st == 4 ? 0.12 : 0.1, smoothstep(0.03, 0.14, q.z)) - (st == 0 || st == 8 ? 0.028 * abs(sin(q.x * 38.0)) * smoothstep(0.05, 0.15, q.z) : 0.0);
  if (abs(q.x) > 0.12 && q.z > -0.085) hl = max(hl, -0.02);
  float d = max(length(q - vec3(0.0, 0.012, -0.012)) - (st == 4 ? 0.205 : st == 8 ? 0.222 : 0.213), hl - q.y);
  if (st == 0) d = smin(d, length(q - vec3(0.0, 0.1, -0.035)) - 0.205, 0.03);
  else if (st == 1) d = smin(d, length(q - vec3(0.0, 0.23, -0.13)) - 0.13, 0.05);
  else if (st == 2){ float b = max(capd(q, vec3(0.0, 0.02, -0.1), vec3(0.0, -0.36, -0.12), 0.19, 0.16), q.z - 0.0);
    b = min(b, min(capd(q, vec3(0.172, 0.08, 0.03), vec3(0.19, -0.32, 0.0), 0.06, 0.05), capd(q, vec3(-0.172, 0.08, 0.03), vec3(-0.19, -0.32, 0.0), 0.06, 0.05))); d = smin(d, b, 0.03); }
  else if (st == 3){ float a = length(q - vec3(0.0, 0.08, -0.05)) - 0.27; d = min(d, max(a, -max(q.y - 0.1, 0.07 - q.z))); }
  else if (st == 5) d = smin(d, capd(q, vec3(0.0, 0.13, -0.2), vec3(0.0, -0.24, -0.27), 0.065, 0.034), 0.03);
  else if (st == 6) d = smin(d, length(q - vec3(0.0, 0.27, -0.05)) - 0.085, 0.03);
  else if (st == 7){ float b = max(capd(q, vec3(0.0, 0.02, -0.1), vec3(0.0, -0.16, -0.12), 0.19, 0.17), q.z - 0.02);
    b = min(b, min(capd(q, vec3(0.18, 0.07, 0.03), vec3(0.2, -0.15, 0.0), 0.065, 0.06), capd(q, vec3(-0.18, 0.07, 0.03), vec3(-0.2, -0.15, 0.0), 0.065, 0.06)));
    d = smin(d, max(b, -0.21 - q.y), 0.03); }
  else if (st == 8) d -= 0.012 * sin(q.x * 72.0) * sin(q.y * 72.0) * sin(q.z * 72.0) * step(0.0, q.y + 0.05);
  return d; }
float crowdSD(vec3 p, Pp P, out int grp){
  grp = 0;
  float far = capd(p, P.o + vec3(0.0, 0.25, 0.0), P.hc, 0.42, 0.35); if (far > 0.08) return far;
  vec3 tu = normalize(P.nk - P.hip);
  float bt = smin(capd(p, P.hp0, P.kn0, 0.06, 0.052), capd(p, P.kn0, P.an0, 0.052, 0.044), 0.02);
  bt = min(bt, smin(capd(p, P.hp1, P.kn1, 0.06, 0.052), capd(p, P.kn1, P.an1, 0.052, 0.044), 0.02));
  bt = smin(bt, capd(p, P.hp0, P.hp1, 0.09, 0.09), 0.03);
  if (P.skirt) bt = smin(bt, max(capd(p, P.hip, P.hip - tu * 0.24, 0.1, 0.165), dot(p - (P.hip - tu * 0.22), tu) * -1.0), 0.02);
  float sh = min(capd(p, P.an0 - P.f * 0.03 - vec3(0.0, 0.015, 0.0), P.an0 + P.f * 0.09 - vec3(0.0, 0.025, 0.0), 0.05, 0.045),
                 capd(p, P.an1 - P.f * 0.03 - vec3(0.0, 0.015, 0.0), P.an1 + P.f * 0.09 - vec3(0.0, 0.025, 0.0), 0.05, 0.045));
  float tp = capd(p, P.hip + tu * 0.05, P.nk - tu * 0.03, P.tr * 1.1, P.tr);
  vec3 m0 = mix(P.sh0, P.el0, 0.55), m1 = mix(P.sh1, P.el1, 0.55);
  tp = smin(tp, min(capd(p, P.sh0, P.longS ? P.el0 : m0, 0.047, 0.042), capd(p, P.sh1, P.longS ? P.el1 : m1, 0.047, 0.042)), 0.035);
  float sk = 1e3;
  if (P.longS) tp = min(tp, min(capd(p, P.el0, P.wr0, 0.041, 0.037), capd(p, P.el1, P.wr1, 0.041, 0.037)));
  else sk = min(smin(capd(p, m0, P.el0, 0.035, 0.033), capd(p, P.el0, P.wr0, 0.033, 0.029), 0.01), smin(capd(p, m1, P.el1, 0.035, 0.033), capd(p, P.el1, P.wr1, 0.033, 0.029), 0.01));
  sk = min(sk, min(length(p - P.wr0 - normalize(P.wr0 - P.el0) * 0.035) - 0.043, length(p - P.wr1 - normalize(P.wr1 - P.el1) * 0.035) - 0.043));
  vec3 q = cHeadQ(p, P); float hr = 1e3;
  if (dot(q, q) < 0.2){ sk = min(sk, smin(cSkull(q, P.hw, P.ch) * P.hs, capd(p, P.nk - tu * 0.02, P.hc - P.hU * 0.12 * P.hs, 0.045, 0.045), 0.02)); hr = cHair(q, P.style) * P.hs; }
  else sk = min(sk, (length(q) - 0.3) * P.hs);
  float d = sk;
  if (tp < d){ d = tp; grp = 1; } if (bt < d){ d = bt; grp = 2; } if (sh < d){ d = sh; grp = 3; } if (hr < d){ d = hr; grp = 4; }
  return d; }
vec3 crowdN(vec3 p, Pp P){ vec2 e = vec2(0.004, -0.004); int g;
  return normalize(e.xyy * crowdSD(p + e.xyy, P, g) + e.yyx * crowdSD(p + e.yyx, P, g) + e.yxy * crowdSD(p + e.yxy, P, g) + e.xxx * crowdSD(p + e.xxx, P, g)); }
vec3 crowdCol(vec3 p, Pp P, int g){
  if (g == 0) return P.skin;
  if (g == 1) return P.top * mott(p - P.o, 1.0);
  if (g == 2) return P.bot * mott((p - P.o) * 1.4, 2.0);
  if (g == 3) return P.shoe;
  vec3 q = cHeadQ(p, P); float n = hash3(floor(q / 0.027)); vec3 c = P.hA;
  if (P.curls){ vec3 cq = q / 0.026; vec3 ci = floor(cq), cf = fract(cq) - 0.5; float r = length(cf.xy + (hash3(ci) - 0.5) * 0.3);
    if (r > 0.26 && r < 0.46 && cf.y < 0.12) c = P.hB; return c; }
  if (q.y < -0.065 + (n - 0.5) * 0.06 || n > 0.96) c = P.hB;
  vec2 sd = vec2(q.x * 0.8 + q.y * 0.6, q.y * 0.8 - q.x * 0.6); float row = floor(sd.x / 0.016), along = sd.y / 0.06 + hash(vec2(row, 3.0)) * 5.0;
  if (q.y > 0.08 && hash(vec2(row, floor(along))) > 0.82 && fract(along) < 0.5) c = P.hA * vec3(1.3, 1.26, 1.2); // a few light strokes on top
  return c; }
// A face in the show's way, simplified for the crowd: the same rounded eyes with a heavy line and a big pupil, a mouth.
// Too far away for a drawn eye, it is two dark dots.
vec3 crowdFace(vec3 col, vec3 q, Pp P, float px, out float fl){
  vec2 uv = q.xy / 0.2; fl = 0.0; float st = max(0.07, px); int ex = P.ex;
  if (px > 0.27){
    for (float sg = -1.0; sg <= 1.0; sg += 2.0){ vec2 e = uv - vec2(sg * 0.41, -0.3); if (abs(e.x) < px * 0.55 && abs(e.y) < px * (ex == 1 ? 0.45 : 0.85)){ col = INK; fl = 1.0; } }
    return col; }
  for (float sg = -1.0; sg <= 1.0; sg += 2.0){
    vec2 e = uv - vec2(sg * 0.415, sg > 0.0 ? -0.3 : -0.288); float rx = 0.3, ry = 0.32;
    if (ex == 1){ float rw = rx * 0.86, xx = e.x / rw, amp = ry * 0.6, yy = amp * (1.0 - xx * xx) - ry * 0.3, sl = -2.0 * amp * xx / rw;
      if (abs(xx) < 1.0 && abs(e.y - yy) < st * 0.56 * sqrt(1.0 + sl * sl)){ col = INK; fl = 1.0; } continue; }
    vec2 a = abs(e) / vec2(rx, ry); if (pow(a.x, 3.6) + pow(a.y, 3.6) >= 1.0) continue;
    vec2 b = abs(e) / vec2(rx - st, ry - st); float si = pow(b.x, 3.6) + pow(b.y, 3.6);
    float open = ex == 2 ? 0.52 : 0.92, top = ry * (2.0 * open - 1.0);
    if (e.y > top + st * 0.55) continue;
    if (si >= 1.0 || e.y > top - st * 0.55){ col = INK; fl = 1.0; continue; }
    col = EYEW; fl = 2.0;
    vec2 pr = max(vec2(0.145, 0.222) * (ex == 3 ? 0.85 : 1.0), vec2(px * 0.9)), lim = vec2(rx - st - pr.x * 0.55, max(ry - st - pr.y * 0.92, 0.0));
    vec2 d = (e - vec2(P.look * lim.x, (ex == 2 ? -0.9 : 0.0) * lim.y - 0.012)) / pr; if (dot(d, d) < 1.0){ col = vec3(0.06, 0.04, 0.042); fl = 1.0; }
  }
  float w = ex == 0 ? 0.15 : ex == 1 ? 0.2 : ex == 2 ? 0.08 : 0.13, curve = ex == 0 ? 0.07 : ex == 2 ? 0.0 : 0.02, open = ex == 1 ? 0.2 : ex == 3 ? 0.25 : 0.0;
  vec2 m = uv - vec2(0.0, -0.8); float x = m.x / w, t = st * 0.62, yc = curve * 1.5 * (x * x - 0.4);
  if (open < 0.03){ if (abs(x) < 1.0 && abs(m.y - yc) < t * 0.75){ col = INK; fl = 1.0; } return col; }
  float yl = yc - open * sqrt(max(1.0 - x * x, 0.0)), xo = m.x / (w + t * 1.3), arco = sqrt(max(1.0 - xo * xo, 0.0));
  bool inside = abs(x) < 1.0 && m.y < yc && m.y > yl, rim = abs(xo) < 1.0 && m.y < yc + t * 1.3 && m.y > yc - open * arco - t * 1.3;
  if (rim && !inside){ col = INK; fl = 1.0; }
  if (inside){ col = vec3(0.3, 0.13, 0.14); fl = 1.0; if (ex == 1 && m.y > yc - min(0.055, open * 0.42)){ col = EYEW; fl = 2.0; } }
  return col; }
void crowdTry(ivec2 c, vec3 ro, vec3 rd, inout float best, inout Pp HP, inout bool found){
  vec3 o; if (!crowdAt(c, o)) return;
  vec2 oc = ro.xz - o.xz; float a = dot(rd.xz, rd.xz), t0, t1;
  if (a < 1e-8){ if (dot(oc, oc) > 0.25) return; t0 = 0.0; t1 = 1e3; }
  else { float b = dot(oc, rd.xz), cc = dot(oc, oc) - 0.25, disc = b * b - a * cc; if (disc < 0.0) return; float sq = sqrt(disc); t0 = (-b - sq) / a; t1 = (-b + sq) / a; }
  if (abs(rd.y) > 1e-5){ float ya = -ro.y / rd.y, yb = (2.25 - ro.y) / rd.y; t0 = max(t0, min(ya, yb)); t1 = min(t1, max(ya, yb)); }
  t0 = max(t0, 0.0); t1 = min(t1, best); if (t0 >= t1) return;
  Pp P; crowdPerson(c, o, P); float t = t0; int g;
  for (int i = 0; i < 64; i++){ float d = crowdSD(ro + rd * t, P, g); if (d < 0.0015 * t){ best = t; HP = P; found = true; return; } t += d * 0.9; if (t > t1) return; }
}
// Walk the floor grid along the ray, nearest cells first, trying everyone who could reach into each cell.
float crowdHit(vec3 ro, vec3 rd, float tmax, out Pp HP){
  bool found = false; float best = tmax;
  if (uCw1.w <= 0.0) return -1.0;
  vec2 g0 = uCw0.xy, cs = uCw0.zw, n = uCw1.xy;
  vec3 rdd = vec3(abs(rd.x) < 1e-6 ? 1e-6 : rd.x, abs(rd.y) < 1e-6 ? 1e-6 : rd.y, abs(rd.z) < 1e-6 ? 1e-6 : rd.z);
  vec3 ta3 = (vec3(g0.x - 0.7, 0.0, g0.y - 0.7) - ro) / rdd, tb3 = (vec3(g0.x + n.x * cs.x + 0.7, 2.25, g0.y + n.y * cs.y + 0.7) - ro) / rdd;
  vec3 tn = min(ta3, tb3), tf = max(ta3, tb3);
  float ta = max(max(tn.x, tn.y), max(tn.z, 0.0)), tb = min(min(tf.x, tf.y), min(tf.z, tmax));
  if (ta >= tb) return -1.0;
  vec2 gp = ((ro + rd * ta).xz - g0) / cs; ivec2 c = ivec2(floor(gp));
  vec2 rg = rdd.xz / cs; ivec2 s = ivec2(rg.x > 0.0 ? 1 : -1, rg.y > 0.0 ? 1 : -1); vec2 tD = abs(1.0 / rg);
  vec2 tM = ta + (vec2(c) + vec2(s.x > 0 ? 1.0 : 0.0, s.y > 0 ? 1.0 : 0.0) - gp) / rg;
  for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) crowdTry(c + ivec2(dx, dy), ro, rd, best, HP, found);
  for (int k = 0; k < 64; k++){
    float tc = min(tM.x, tM.y); if (tc > best || tc > tb) break;
    if (tM.x < tM.y){ c.x += s.x; tM.x += tD.x; for (int d = -1; d <= 1; d++) crowdTry(ivec2(c.x + s.x, c.y + d), ro, rd, best, HP, found); }
    else { c.y += s.y; tM.y += tD.y; for (int d = -1; d <= 1; d++) crowdTry(ivec2(c.x + d, c.y + s.y), ro, rd, best, HP, found); }
  }
  return found ? best : -1.0;
}
// the soft dark patch on the floor under each of them
float crowdShade(vec3 p, float by){
  if (uCw1.w <= 0.0) return 1.0;
  ivec2 c = ivec2(floor((p.xz - uCw0.xy) / uCw0.zw)); float s = 1.0;
  for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++){ vec3 o; if (crowdAt(c + ivec2(dx, dy), o)){ float e = length(p.xz - o.xz) / 0.27; if (e + (by - 0.5) * 0.3 < 1.0) s = 0.5; } }
  return s; }
`;
