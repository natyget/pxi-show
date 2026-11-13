// The renderer. One fragment shader draws a whole shot at the show's native pixel size (180x320 upright).
// The look is built into the drawing, never filtered on afterwards:
//  - every surface gets its own blocky pixel texture (wood grain, cloth flecks, hair clusters)
//  - light is a handful of flat steps with an ordered-dither fringe; lamps make soft warm pools and halos
//  - a soft body (a character, a pillow, a plant) is capsules blended into ONE surface per material, so a body has
//    no seams and a garment is a single piece that wraps it
//  - a face is painted on the head from numbers: big simple eyes, off-centre pupils, a small mouth
//  - the outline pass inks one pixel wherever a nearer thing begins, with a slightly uneven weight
import { CROWD_GLSL } from './crowd';
import { CAMPUS_GLSL } from './campus';
export const NP = 320, NC = 16, NHD = 5, NHB = 80, NB = 80, NO = 6, NL = 12, FS = 36, NSH = 8;

export const VERT = `in vec3 position; out vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const SCENE_FRAG = `precision highp float; precision highp int;
in vec2 vUv;
layout(location = 0) out vec4 oCol;
layout(location = 1) out vec4 oAux;
#define NP ${NP}
#define NC ${NC}
#define NHD ${NHD}
#define NHB ${NHB}
#define NB ${NB}
#define NO ${NO}
#define NL ${NL}
#define NSH ${NSH}
uniform vec2 uRes; uniform vec3 uCamP, uCamR, uCamU, uCamF; uniform float uTan; uniform float uTime;
uniform vec4 uA[NP]; uniform vec4 uB[NP]; uniform vec4 uM[NP]; uniform vec4 uC[NP];
uniform vec4 uCl[NC]; uniform vec4 uCr[NC]; uniform vec3 uCo[NC]; uniform int uNC;
uniform vec3 uHc[NHD]; uniform vec3 uHr[NHD]; uniform vec3 uHu[NHD]; uniform vec3 uHf[NHD];
uniform vec4 uHk[NHD]; // each head's build: x lashes, y face width, z chin length, w hair: 0 locks, 1 curls
uniform vec3 uSkin[NHD]; uniform vec3 uHairA[NHD]; uniform vec3 uHairB[NHD]; uniform vec4 uHb[NHD * NHB]; uniform int uHn[NHD]; uniform vec4 uFace[NHD * 9];
uniform vec3 uBc[NB]; uniform vec3 uBh[NB]; uniform vec4 uBcol[NB]; uniform vec4 uBm[NB]; uniform int uNB;
uniform vec3 uOc[NO]; uniform vec3 uOx[NO]; uniform vec3 uOy[NO]; uniform vec3 uOz[NO]; uniform vec3 uOh[NO]; uniform vec3 uOcol[NO]; uniform vec3 uOem[NO]; uniform int uNO;
uniform vec4 uOs[NO]; // a paper's sign: its rectangle in the sign atlas (z > 0 when it has one)
uniform sampler2D uScr; uniform vec3 uScrOn;   // a picture for the lit face of one hand prop (a phone screen): x = which prop (-1 none), y = picture width in pixels
uniform vec4 uL[NL]; uniform vec4 uLc[NL]; uniform int uNL;
uniform vec4 uSh[NSH]; uniform vec3 uRoom0; uniform vec3 uRoom; uniform vec3 uAmb; uniform vec3 uAmbC; uniform float uSet;

const vec3 INK = vec3(0.07, 0.046, 0.045);
const vec3 WHITE = vec3(0.96, 0.925, 0.88);
const vec3 EYEW = vec3(0.93, 0.865, 0.85); // the white of an eye is a warm off-white, never pure
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float bayer(vec2 p){ ivec2 i = ivec2(mod(p, 4.0)); const float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0); return (m[i.x + i.y * 4] + 0.5) / 16.0; }
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// blocky texture: little clusters a touch lighter or darker than the base
float mott(vec3 p, float s){ float h = hash3(floor(p / 0.034)); return h > 1.0 - 0.2 * s ? 1.0 + 0.07 * s : h < 0.18 * s ? 1.0 - 0.07 * s : 1.0; }
float F(int h, int i){ int k = h * ${FS} + i; return uFace[k >> 2][k & 3]; }

// a capsule with its own radius at each end. cuts: 1 closes the a end flat, 2 the b end, 3 both (a hem, a lamp shade).
// sq > 1 flattens it vertically (a pillow, a duvet).
float prim(vec3 p, int i){
  vec4 a = uA[i], b = uB[i]; float sq = uM[i].w; int cuts = int(uM[i].z);
  if (sq != 1.0) p.y = a.y + (p.y - a.y) * sq;
  vec3 pa = p - a.xyz, ba = b.xyz - a.xyz; float l2 = max(dot(ba, ba), 1e-6); float h = clamp(dot(pa, ba) / l2, 0.0, 1.0);
  float d = length(pa - ba * h) - mix(a.w, b.w, h);
  if (cuts > 0){ float l = sqrt(l2); float s = dot(pa, ba) / l; if (cuts == 1 || cuts == 3) d = max(d, -s); if (cuts >= 2) d = max(d, s - l); }
  return d / sq;
}

// ---- the head, in its own space: x to the character's left, y up, z out of the face ----
vec3 headQ(vec3 p, int h){ vec3 d = p - uHc[h]; return vec3(dot(d, uHr[h]), dot(d, uHu[h]) / F(h, 31), dot(d, uHf[h])); }
float sdSkull(vec3 q, int h){
  // a round head, full and wide in the cheeks, with a soft flat chin; two small round ears. Each character sets how
  // wide the face is (a rounder face) and how far down the chin comes (a longer face).
  vec4 k = uHk[h]; vec3 e = vec3(abs(q.x) - 0.218 * k.y, q.y + 0.09, q.z + 0.005);
  q.x /= k.y;
  float d = length(q * vec3(0.97, 1.03, 1.0)) - 0.2;
  vec3 c = vec3(abs(q.x) - 0.07, q.y + 0.082 * k.z, q.z - 0.028);
  d = smin(d, length(c * vec3(1.0, 1.12 / k.z, 1.0)) - 0.132, 0.06);
  d = min(d, (length(e * vec3(1.3, 1.0, 1.5)) - 0.054) / 1.5);
  return d * 0.95;
}
float sdHair(vec3 q, int h){
  // a thin cap so no scalp shows between the clumps: high over the forehead, low over the ears and the nape
  float hl = mix(-0.095, 0.1, smoothstep(0.03, 0.14, q.z)); if (abs(q.x) > 0.12 && q.z > -0.085) hl = max(hl, -0.02); // clear of the ears
  float d = max(length(q - vec3(0.0, 0.012, -0.012)) - 0.209, hl - q.y);
  int n = uHn[h];
  // the clumps: soft lumps for the mass, tapered ones for the fringe and the flicks. Blended into one soft shape.
  for (int i = 0; i < NHB / 2; i++){ if (i >= n) break; vec4 a = uHb[h * NHB + i * 2], b = uHb[h * NHB + i * 2 + 1];
    vec3 pa = q - a.xyz, ba = b.xyz - a.xyz; float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    d = smin(d, length(pa - ba * t) - mix(a.w, b.w, t), a.w > 0.075 ? 0.045 : 0.014); }
  return d;
}
// Hair colour: one flat tone, darker underneath and in the odd fleck, with a few short light strokes up on the lit side.
vec3 hairCol(vec3 q, int h){
  float n = hash3(floor(q / 0.027)); float m = hash3(floor(q / 0.05) + 7.0);
  vec3 c = uHairA[h] * (m > 0.72 ? 1.07 : m < 0.2 ? 0.94 : 1.0); // soft blotches, barely there
  if (uHk[h].w > 0.5){ // curls: small tight coils, each a dark crescent with a lit edge
    vec3 cq = q / 0.024; vec3 ci = floor(cq); vec3 cf = fract(cq) - 0.5; float r = length(cf.xy + (hash3(ci) - 0.5) * 0.3);
    if (r > 0.26 && r < 0.46 && cf.y < 0.12) c = uHairB[h]; else if (r < 0.2 && hash3(ci + 3.0) > 0.55) c = uHairA[h] * 1.16;
    return c; }
  if (q.y < -0.065 + (n - 0.5) * 0.06 || n > 0.965) c = uHairB[h];
  // a few short light strokes in one patch, up on the lit side
  vec2 sd = vec2(q.x * 0.8 + q.y * 0.6, q.y * 0.8 - q.x * 0.6);
  float row = floor(sd.x / 0.014); float along = sd.y / 0.06 + hash(vec2(row, 3.0)) * 5.0;
  if (length(q.xy - vec2(-0.1, 0.2)) < 0.095 && hash(vec2(row, floor(along))) > 0.8 && fract(along) < 0.5) c = uHairA[h] * vec3(1.32, 1.28, 1.22);
  return c;
}

// ---- soft bodies ----
// Eight surfaces a body can have. Within one, the capsules melt together; between two there is an ink line.
float mapD(vec3 p, int c){
  int i0 = int(uCr[c].x), i1 = int(uCr[c].y), h = int(uCr[c].z);
  float g[8]; for (int j = 0; j < 8; j++) g[j] = 1e3;
  for (int i = i0; i < i1; i++){ int gi = int(uM[i].x); g[gi] = smin(g[gi], prim(p, i), uM[i].y); }
  if (h >= 0){ vec3 q = headQ(p, h); if (dot(q, q) < 0.24){ g[0] = smin(g[0], sdSkull(q, h), 0.015); g[4] = min(g[4], sdHair(q, h)); } else g[0] = min(g[0], length(q) - 0.46); }
  float d = g[0]; for (int j = 1; j < 8; j++) d = min(d, g[j]);
  return d;
}
float mapC(vec3 p, int c, out int grp, out vec4 col){
  int i0 = int(uCr[c].x), i1 = int(uCr[c].y), h = int(uCr[c].z);
  float g[8]; float best[8]; vec4 bc[8];
  for (int j = 0; j < 8; j++){ g[j] = 1e3; best[j] = 1e3; bc[j] = vec4(0.0); }
  for (int i = i0; i < i1; i++){
    float d = prim(p, i); int gi = int(uM[i].x);
    g[gi] = smin(g[gi], d, uM[i].y); if (d < best[gi]){ best[gi] = d; bc[gi] = uC[i]; }
  }
  if (h >= 0){ vec3 q = headQ(p, h); if (dot(q, q) < 0.24){
    float hs = sdSkull(q, h); if (hs < best[0]){ best[0] = hs; bc[0] = vec4(uSkin[h], 0.0); } g[0] = smin(g[0], hs, 0.015);
    float hh = sdHair(q, h); if (hh < g[4]){ g[4] = hh; bc[4] = vec4(hairCol(q, h), 0.0); } } }
  float d = 1e3; grp = 0;
  for (int j = 0; j < 8; j++){ if (g[j] < d){ d = g[j]; grp = j; } }
  col = bc[grp];
  return d;
}
vec3 softN(vec3 p, int c){ vec2 e = vec2(0.004, -0.004);
  return normalize(e.xyy * mapD(p + e.xyy, c) + e.yyx * mapD(p + e.yyx, c) + e.yxy * mapD(p + e.yxy, c) + e.xxx * mapD(p + e.xxx, c)); }
vec2 sph(vec3 ro, vec3 rd, vec4 s){ vec3 oc = ro - s.xyz; float b = dot(oc, rd), c = dot(oc, oc) - s.w * s.w, h = b * b - c; if (h < 0.0) return vec2(1.0, -1.0); h = sqrt(h); return vec2(-b - h, -b + h); }

// ---- boxes ----
vec3 rotY(vec3 v, float a){ float c = cos(a), s = sin(a); return vec3(v.x * c - v.z * s, v.y, v.x * s + v.z * c); }
float boxHit(vec3 ro, vec3 rd, vec3 h, out vec3 n){
  vec3 m = 1.0 / rd; vec3 k = abs(m) * h; vec3 t1 = -m * ro - k, t2 = -m * ro + k;
  float tN = max(max(t1.x, t1.y), t1.z), tF = min(min(t2.x, t2.y), t2.z);
  if (tN > tF || tF < 0.0) return -1.0;
  n = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  return tN;
}
float boxShadow(vec3 p, vec3 ld, float maxT){
  for (int i = 0; i < NB; i++){ if (i >= uNB) break; if (uBm[i].w > 0.5) continue; vec3 n;
    float a = uBm[i].x; float t = boxHit(rotY(p - uBc[i], -a), rotY(ld, -a), uBh[i], n); if (t > 0.002 && t < maxT) return 0.0; }
  return 1.0;
}

// ---- light: a few flat steps per lamp, with a dithered fringe ----
vec3 roomLight(vec3 p, vec3 n, vec2 px, float lv){
  vec3 L = vec3(0.0); float by = bayer(px);
  for (int i = 0; i < NL; i++){ if (i >= uNL) break;
    vec3 d = uL[i].xyz - p; float dl = length(d); d /= dl;
    float s = (0.22 + 0.78 * max(dot(n, d), 0.0)) / (1.0 + dl * dl / (uL[i].w * uL[i].w));
    if (i == 0 && s > 0.08 && lv > 2.5) s *= mix(0.55, 1.0, boxShadow(p + n * 0.012, d, dl));
    L += uLc[i].rgb * (floor(min(s, 1.0) * lv + 0.5 + (by - 0.5) * (lv > 2.5 ? 0.2 : 0.08)) / lv);
  }
  return L;
}

// ---- the drawn face ----
// An eye is a rounded square with a heavy ink line, a warm white, and a big tall pupil that sits off to one side and
// tucks under the line. A lid is a straight heavy line across it; above a lid there is only skin.
// Returns the height of the top of what is drawn, so the brow can sit just above it.
float eyeTop(int h, int o, float sg){
  float sc = (sg > 0.0 ? 1.0 : 0.94) * F(h, o + 6) * F(h, 34); float ry = 0.33 * sc;
  if (abs(F(h, o + 7)) > 0.5) return 0.0;
  return ry * (2.0 * min(F(h, o), 1.0) - 1.0);
}
vec2 eyeC(float sg){ return vec2(sg * 0.415, sg > 0.0 ? -0.3 : -0.288); }
void drawEye(inout vec3 col, inout float fl, vec2 uv, float sg, int h, int o, float st, float px){
  float open = F(h, o), low = F(h, o + 1), slope = tan(F(h, o + 2) * 0.01745), arc = F(h, o + 7);
  float sc = (sg > 0.0 ? 1.0 : 0.94) * F(h, o + 6) * F(h, 34); // the two eyes are never quite the same size; slot 34 is the character's eye size
  vec2 e = uv - eyeC(sg);
  float rx = 0.312 * sc, ry = 0.33 * sc;
  if (abs(arc) > 0.5){ // shut: one heavy curved stroke. arc 1 = a happy arch, -1 = a sleeping curve
    float rw = rx * 0.86; float xx = e.x / rw; float amp = arc > 0.0 ? ry * 0.6 : -ry * 0.34;
    float yy = amp * (1.0 - xx * xx) - (arc > 0.0 ? ry * 0.3 : -ry * 0.02);
    float sl = -2.0 * amp * xx / rw; // the stroke keeps its weight where the curve is steep
    if (abs(xx) < 1.0 && abs(e.y - yy) < st * 0.56 * sqrt(1.0 + sl * sl)){ col = INK; fl = 1.0; } return; }
  if (uHk[h].x > 0.5){ // lashes: two short heavy flicks off the outer top corner, riding the lid
    float lt = min(ry * (2.0 * open - 1.0), ry * 0.92);
    for (int k = 0; k < 2; k++){ vec2 a0 = vec2(sg * rx * (0.62 + 0.3 * float(k)), lt - ry * 0.08 * float(k));
      vec2 dir = normalize(vec2(sg * (0.55 + 0.35 * float(k)), 0.8 - 0.3 * float(k))); vec2 w = e - a0; float tt = clamp(dot(w, dir), 0.0, 0.13);
      if (length(w - dir * tt) < st * 0.5){ col = INK; fl = 1.0; return; } } }
  vec2 a = abs(e) / vec2(rx, ry); if (pow(a.x, 3.6) + pow(a.y, 3.6) >= 1.0) return;
  vec2 b = abs(e) / vec2(rx - st, ry - st); float si = pow(b.x, 3.6) + pow(b.y, 3.6);
  float top = ry * (2.0 * open - 1.0) + slope * e.x * sg, bot = -ry * (1.0 - 2.0 * low);
  bool lid = open < 0.985, lo = low > 0.015;
  if (lid && e.y > top + st * 0.55) return;
  if (lo && e.y < bot - st * 0.55) return;
  if (si >= 1.0 || (lid && e.y > top - st * 0.55) || (lo && e.y < bot + st * 0.55)){ col = INK; fl = 1.0; return; }
  col = EYEW; fl = 2.0;
  if (lid && e.y > top - st * 1.5) col = EYEW * vec3(0.84, 0.8, 0.84); // the lid's shade on the white
  vec2 pr = max(vec2(0.145, 0.222) * F(h, o + 5) * sc, vec2(px * 0.9));
  vec2 lim = vec2(rx - st - pr.x * 0.55, max(ry - st - pr.y * 0.92, 0.0)); // at the far side the pupil tucks under the line
  vec2 pc = vec2(F(h, o + 3) * lim.x, F(h, o + 4) * lim.y - 0.012);
  vec2 d = (e - pc) / pr;
  if (dot(d, d) < 1.0){ col = vec3(0.06, 0.04, 0.042); fl = 1.0;
    if (pr.x > px * 2.2){ // the small bite of white in the pupil, on its open side. Too small to draw from far away.
      float side = F(h, o + 3) < -0.3 ? 1.0 : -1.0; vec2 nc = pc + vec2(side * pr.x * 0.74, pr.y * 0.2);
      if (abs(e.x - nc.x) < max(pr.x * 0.34, px * 0.5) && abs(e.y - nc.y) < max(pr.y * 0.1, px * 0.5)){ col = EYEW; fl = 2.0; } } }
}
// A brow is a short heavy dash that rides just above the eye. At rest it hides under the fringe.
void drawBrow(inout vec3 col, inout float fl, vec2 uv, float sg, int h, int o, int eo, float st){
  vec2 b = uv - vec2(eyeC(sg).x, eyeC(sg).y + eyeTop(h, eo, sg) + 0.1 + F(h, o)); float s = b.x * sg;
  float y = s * tan(F(h, o + 1) * 0.01745) + F(h, o + 2) * 0.045 * (0.5 - s * s / 0.03);
  if (abs(s) < 0.22 && abs(b.y - y) < st * 0.52){ col = INK; fl = 1.0; }
}
// The mouth: nothing at rest. A short line, a small o, a smile with teeth, a shout.
void drawMouth(inout vec3 col, inout float fl, vec2 uv, int h, float st){
  float w = F(h, 22), curve = F(h, 23), open = F(h, 24), teeth = F(h, 25), tongue = F(h, 26), skew = F(h, 27), wob = F(h, 28);
  if (w < 0.008) return;
  float t = st * 0.62;
  vec2 m = uv - vec2(skew * 0.04, -0.8); float x = m.x / w;
  float yc = curve * 1.5 * (x * x - 0.4) + skew * curve * 0.9 * x + wob * 0.02 * sin(m.x * 48.0);
  if (open < 0.03){ if (abs(x) < 1.0 && abs(m.y - yc) < t * 0.75){ col = INK; fl = 1.0; } return; }
  float arcx = sqrt(max(1.0 - x * x, 0.0)); float yl = yc - open * arcx;
  float xo = m.x / (w + t * 1.3); float arco = sqrt(max(1.0 - xo * xo, 0.0));
  bool inside = abs(x) < 1.0 && m.y < yc && m.y > yl;
  bool rim = abs(xo) < 1.0 && m.y < yc + t * 1.3 && m.y > yc - open * arco - t * 1.3;
  if (rim && !inside){ col = INK; fl = 1.0; }
  if (inside){ fl = 1.0;
    col = vec3(0.3, 0.13, 0.14);
    if (tongue > 0.5 && length((m - vec2(0.0, yc - open * 1.05)) * vec2(1.0, 1.25)) < w * 0.62) col = vec3(0.62, 0.4, 0.42);
    float th = min(0.055, open * 0.42);
    if (teeth > 0.5 && m.y > yc - th){ col = EYEW; fl = 2.0; }
    if (teeth > 1.5 && m.y < yl + th * 1.3){ col = EYEW; fl = 2.0; }
  }
}
vec3 paintFace(vec3 col, vec3 q, int h, float px, vec2 fpx, out float fl){
  vec2 uv = q.xy / 0.2; fl = 0.0;
  float st = max(0.062, px * 1.0); // the ink line of the face: about an eighth of an eye wide, one pixel at least
  float ck = mod(fpx.x + fpx.y, 2.0);
  if (F(h, 30) > 0.01 && uv.y > 0.05 - 0.1 * ck) col = mix(col, vec3(0.42, 0.34, 0.45), 0.55 * F(h, 30));
  float bl = F(h, 29);
  if (bl > 0.01){ vec2 c = (vec2(abs(uv.x), uv.y) - vec2(0.6, -0.72)) * vec2(1.0, 1.7);
    if (length(c) < 0.19){ col = mix(col, col * vec3(1.16, 0.8, 0.84) + vec3(0.05, 0.0, 0.0), 0.65 * min(bl, 1.0));
      if (bl > 1.5 && fract((uv.x * 0.9 + uv.y * 0.45) / 0.1) < max(0.3, px * 4.0) && abs(c.y) < 0.1 && length(c) < 0.15){ col = mix(col, INK, 0.75); fl = 1.0; } } }
  if (F(h, 32) > 0.01){ // tears: a stream down from each eye
    for (float sg = -1.0; sg <= 1.0; sg += 2.0){ vec2 ec = eyeC(sg); float tx = abs(uv.x - ec.x + 0.02 * sin(uv.y * 14.0));
      if (tx < 0.085 && uv.y < ec.y - 0.3 && uv.y > -0.99){ col = tx > 0.085 - st * 0.5 ? INK : vec3(0.78, 0.83, 0.86); fl = 1.0; } } }
  drawEye(col, fl, uv, 1.0, h, 0, st, px); drawEye(col, fl, uv, -1.0, h, 8, st, px);
  drawBrow(col, fl, uv, 1.0, h, 16, 0, st); drawBrow(col, fl, uv, -1.0, h, 19, 8, st);
  drawMouth(col, fl, uv, h, st);
  return col;
}

// ---- Nio's room: the painted surfaces ----
vec3 wood(vec2 uv, vec3 base, float fp){
  float pl = floor(uv.x / 0.17); float f = fract(uv.x / 0.17) * 0.17;
  vec3 c = base * (0.9 + 0.2 * hash(vec2(pl, 7.0)));
  float sx = floor(uv.x / 0.045); float st = hash(vec2(sx, floor(uv.y / 0.55 + hash(vec2(sx, 1.0)) * 3.0)));
  c *= st > 0.8 ? 0.94 : 1.0;
  if (f < max(0.012, fp * 0.9)) c *= 0.6;
  // a knot here and there
  float kh = hash(vec2(pl, 11.0)); if (kh > 0.55){ vec2 k = vec2(f - 0.085, mod(uv.y + kh * 7.0, 2.3) - 1.1) / vec2(0.022, 0.04); float kd = dot(k, k);
    if (kd < 1.0) c *= kd > 0.45 ? 0.72 : 0.86; }
  return c;
}
// a string of instant photos pinned along a wall. q: along the wall and up, from the string's left end
void photos(inout vec3 c, vec2 q, float fp){
  float L = 1.14; if (q.x < -0.03 || q.x > L + 0.03 || q.y > 0.03 || q.y < -0.3) return;
  float f = q.x / L * 2.0 - 1.0; float ys = -0.09 * (1.0 - f * f);
  if (abs(q.y - ys) < max(0.005, fp * 0.5)) c = vec3(0.15, 0.09, 0.09);
  float i = floor(q.x / 0.19); if (i < 0.0 || i > 5.0) return;
  float cx = (i + 0.5) * 0.19; float fc = cx / L * 2.0 - 1.0;
  vec2 d = q - vec2(cx, -0.09 * (1.0 - fc * fc) - 0.085); d.x += d.y * (hash(vec2(i, 5.0)) - 0.5) * 0.3;
  if (abs(d.x) < 0.06 && abs(d.y) < 0.074){ c = vec3(0.84, 0.78, 0.7);
    if (abs(d.x) < 0.047 && d.y > -0.042 && d.y < 0.062){ float hh = hash(vec2(i, 1.0));
      c = hh < 0.33 ? vec3(0.44, 0.33, 0.5) : hh < 0.66 ? vec3(0.62, 0.42, 0.3) : vec3(0.3, 0.38, 0.46);
      if (d.y < 0.0 + 0.02 * sin(d.x * 70.0 + i * 2.0)) c *= 0.68; } }
}
// a pin board with notes
void pinboard(inout vec3 c, vec2 q, vec2 sz, float fp){
  if (q.x < 0.0 || q.y < 0.0 || q.x > sz.x || q.y > sz.y) return;
  float e = min(min(q.x, sz.x - q.x), min(q.y, sz.y - q.y));
  if (e < max(0.025, fp)){ c = vec3(0.3, 0.17, 0.15); return; }
  c = vec3(0.56, 0.4, 0.3) * (hash(floor(q / 0.03)) > 0.6 ? 0.93 : 1.0);
  vec2 cell = floor(q / vec2(0.15, 0.14)); vec2 l = q - (cell + 0.5) * vec2(0.15, 0.14) + (vec2(hash(cell), hash(cell + 3.0)) - 0.5) * 0.04;
  float hh = hash(cell + 9.0);
  if (hh > 0.3 && abs(l.x) < 0.048 && abs(l.y) < 0.045){ c = hh > 0.8 ? vec3(0.84, 0.78, 0.66) : hh > 0.6 ? vec3(0.62, 0.48, 0.6) : hh > 0.45 ? vec3(0.52, 0.56, 0.4) : vec3(0.78, 0.6, 0.45);
    if (abs(l.x) < 0.012 && l.y > 0.028) c = vec3(0.5, 0.2, 0.2); else if (fract(l.y / 0.022) < 0.3 && abs(l.x) < 0.035 && l.y < 0.02) c *= 0.8; }
}
vec3 skyline(vec2 w, float fp){
  vec3 c = mix(vec3(0.27, 0.29, 0.44), vec3(0.15, 0.17, 0.28), clamp(w.y / 1.2, 0.0, 1.0));
  float bx = floor(w.x / 0.17); if (w.y < 0.3 + 0.5 * hash(vec2(bx, 3.0))) c = vec3(0.21, 0.23, 0.36);
  float b2 = floor((w.x + 0.06) / 0.25); if (w.y < 0.12 + 0.42 * hash(vec2(b2, 9.0))){ c = vec3(0.13, 0.14, 0.24);
    vec2 cell = floor(w / vec2(0.035, 0.05)); if (hash(cell + b2) > 0.9 && mod(cell.x, 2.0) > 0.5) c = vec3(0.62, 0.5, 0.34); }
  float col = floor((w.x + w.y * 0.12) / max(0.014, fp)); float ry = w.y + uTime * 1.6 + hash(vec2(col, 2.0)) * 9.0;
  if (hash(vec2(col, 5.0)) > 0.55 && fract(ry / 0.5) < 0.16) c += vec3(0.1, 0.11, 0.15); // falling rain
  if (hash(floor(w / max(0.016, fp))) > 0.972) c += vec3(0.2, 0.2, 0.24); // drops on the glass
  return c;
}
void frame(inout vec3 c, vec2 q, vec2 o, vec2 sz, float seed, float fp){
  vec2 f = q - o; if (f.x < 0.0 || f.y < 0.0 || f.x > sz.x || f.y > sz.y) return;
  float e = min(min(f.x, sz.x - f.x), min(f.y, sz.y - f.y));
  if (e < max(0.035, fp * 1.2)){ c = vec3(0.3, 0.17, 0.15); return; }
  vec2 n = f / sz; float hill = 0.35 + 0.18 * sin(n.x * 5.0 + seed * 2.0);
  c = n.y > hill ? mix(vec3(0.62, 0.5, 0.47), vec3(0.45, 0.4, 0.5), n.y) : (hash(floor(f / 0.03) + seed) > 0.5 ? vec3(0.36, 0.4, 0.3) : vec3(0.3, 0.33, 0.27));
  if (seed > 2.5 && length(n - vec2(0.68, 0.72)) < 0.11) c = vec3(0.8, 0.68, 0.5);
}
vec3 floorCol(vec3 p, float fp){
  if (uSet > 0.5) return vec3(0.52, 0.405, 0.41) * mott(p, 0.7); // the plain studio, for model sheets
  vec3 c = wood(p.xz, vec3(0.37, 0.225, 0.21), fp);
  vec2 r = abs(p.xz - vec2(1.65, 2.45)) - vec2(0.85, 0.6);
  if (max(r.x, r.y) < 0.0){ float m = mod(floor((p.z - 1.85) / 0.1), 5.0);
    c = m < 1.0 ? vec3(0.52, 0.27, 0.26) : m < 2.0 ? vec3(0.7, 0.6, 0.47) : m < 3.0 ? vec3(0.43, 0.29, 0.39) : m < 4.0 ? vec3(0.33, 0.22, 0.27) : vec3(0.48, 0.36, 0.3);
    c *= mott(p * 1.2, 1.3); if (-max(r.x, r.y) < max(0.035, fp)) c = vec3(0.27, 0.16, 0.18); }
  return c;
}
vec3 wallCol(vec3 p, int w, float fp, vec2 px, out float em, out vec3 add){
  em = 0.0; add = vec3(0.0);
  if (uSet > 0.5) return vec3(0.6, 0.475, 0.475) * mott(p, 0.7);
  if (w == 2) return vec3(0.3, 0.2, 0.22) * mott(p, 1.0);
  vec2 uv = (w == 3 || w == 6) ? p.xy : p.zy;
  vec3 c = wood(uv, vec3(0.47, 0.3, 0.295), fp);
  if (p.y < 0.1) c = vec3(0.29, 0.175, 0.175);
  if (p.y > 2.47) c *= 0.8;
  if (w == 3){
    vec2 q = p.xy - vec2(0.9, 1.0); vec2 sz = vec2(1.9, 1.2);
    if (q.x > -0.07 && q.x < sz.x + 0.07 && q.y > -0.07 && q.y < sz.y + 0.07){
      c = vec3(0.43, 0.32, 0.34);
      if (q.x > 0.0 && q.x < sz.x && q.y > 0.0 && q.y < sz.y){
        float mw = max(0.024, fp * 0.6);
        if (abs(q.x - sz.x * 0.5) > mw && abs(q.y - sz.y * 0.64) > mw * 0.8){ c = skyline(q, fp); em = 1.0; } } else if (q.x < -0.035 || q.x > sz.x + 0.035 || q.y < -0.035 || q.y > sz.y + 0.035) c *= 0.8; }
    frame(c, p.xy, vec2(0.22, 1.86), vec2(0.36, 0.3), 3.0, fp); frame(c, p.xy, vec2(3.3, 1.5), vec2(0.36, 0.46), 6.0, fp);
    // the string of lights, hung in scallops
    float seg = 0.95; float f = fract(p.x / seg) * 2.0 - 1.0; float yw = 2.4 - 0.24 * (1.0 - f * f);
    if (abs(p.y - yw) < max(0.007, fp * 0.55)){ c = vec3(0.14, 0.085, 0.09); em = 0.0; }
    float sp = 0.19; float bi = floor(p.x / sp + 0.5); float glow = 0.0; float bulb = 0.0;
    for (float k = -1.0; k <= 1.0; k += 1.0){ float bx = (bi + k) * sp; float ff = fract(bx / seg) * 2.0 - 1.0; vec2 bc = vec2(bx, 2.4 - 0.24 * (1.0 - ff * ff) - 0.035);
      float d = length(p.xy - bc); glow += 1.0 / (1.0 + d * d / 0.008);
      if (d < max(0.031, fp * 1.05)){ c = vec3(1.0, 0.88, 0.55); em = 1.0; bulb = 1.0; } }
    if (bulb < 0.5) add = vec3(0.46, 0.27, 0.09) * floor(min(glow, 1.0) * 4.0 + 0.3 + (bayer(px) - 0.5) * 0.3) / 4.0;
  }
  if (w == 5){ frame(c, p.zy, vec2(2.0, 1.42), vec2(0.5, 0.4), 1.0, fp); frame(c, p.zy, vec2(1.42, 1.56), vec2(0.3, 0.36), 2.0, fp);
    photos(c, p.zy - vec2(3.16, 2.02), fp); }
  if (w == 4){ frame(c, p.zy, vec2(1.9, 1.46), vec2(0.44, 0.54), 4.0, fp); pinboard(c, p.zy - vec2(0.98, 1.52), vec2(0.64, 0.5), fp); }
  if (w == 6){ // the door, on the wall behind the usual camera
    vec2 q = p.xy - vec2(2.45, 0.0);
    if (q.x > -0.07 && q.x < 0.97 && q.y < 2.12){ c = vec3(0.27, 0.16, 0.15);
      if (q.x > 0.0 && q.x < 0.9 && q.y < 2.05){ c = vec3(0.44, 0.275, 0.25) * (0.94 + 0.1 * hash(vec2(floor(q.x / 0.15), 2.0)));
        vec2 pa = abs(vec2(q.x - 0.45, q.y - 1.45)) - vec2(0.3, 0.42), pb = abs(vec2(q.x - 0.45, q.y - 0.5)) - vec2(0.3, 0.32);
        float pe = min(abs(max(pa.x, pa.y)), abs(max(pb.x, pb.y))); if (pe < max(0.012, fp * 0.7)) c *= 0.66;
        if (length(q - vec2(0.1, 1.0)) < max(0.035, fp * 1.2)) c = vec3(0.74, 0.58, 0.32); } }
    frame(c, p.xy, vec2(1.3, 1.5), vec2(0.42, 0.52), 5.0, fp);
  }
  return c;
}

${CROWD_GLSL}
${CAMPUS_GLSL}
void main(){
  vec2 px = floor(vUv * uRes); vec2 ndc = (px + 0.5) / uRes * 2.0 - 1.0;
  vec3 ro = uCamP; vec3 rd = normalize(uCamF + uCamR * ndc.x * uTan * uRes.x / uRes.y + uCamU * ndc.y * uTan);
  float pxw = 2.0 * uTan / uRes.y; // world size of a pixel at distance 1
  float by = bayer(px);

  // the room shell (the camera is inside it)
  vec3 tt = (mix(uRoom0, uRoom0 + uRoom, step(0.0, rd)) - ro) / rd;
  float t = min(tt.x, min(tt.y, tt.z)); vec3 n; int wall;
  if (t == tt.y){ n = vec3(0.0, -sign(rd.y), 0.0); wall = rd.y < 0.0 ? 1 : 2; }
  else if (t == tt.z){ n = vec3(0.0, 0.0, -sign(rd.z)); wall = rd.z > 0.0 ? 3 : 6; }
  else { n = vec3(-sign(rd.x), 0.0, 0.0); wall = rd.x < 0.0 ? 4 : 5; }
  float id = 1.0, face = float(wall), em = 0.0; vec3 base; vec3 add = vec3(0.0); vec3 p = ro + rd * t; bool chr = false; float mat = -1.0;
  if (uSet > 2.5) base = wall == 1 ? campusFloor(p, pxw * t, px, em) : campusWall(p, wall, pxw * t, px, em, add);
  else if (uSet > 1.5) base = wall == 1 ? clubFloor(p, pxw * t, em) : clubWall(p, wall, pxw * t, px, em, add);
  else base = wall == 1 ? floorCol(p, pxw * t) : wallCol(p, wall, pxw * t, px, em, add);

  int bi = -1; vec3 bln = vec3(0.0);
  for (int i = 0; i < NB; i++){ if (i >= uNB) break; vec3 bn; float a = uBm[i].x;
    vec3 lo = rotY(ro - uBc[i], -a), ld = rotY(rd, -a); float tb = boxHit(lo, ld, uBh[i], bn);
    if (tb > 0.0 && tb < t && uBcol[i].a > 7.5 && uBcol[i].a < 8.5 && length((lo + ld * tb).xy) > min(uBh[i].x, uBh[i].y)) continue; // the clock is round
    if (tb > 0.0 && tb < t){ t = tb; bi = i; bln = bn; n = rotY(bn, a); base = uBcol[i].rgb; mat = uBcol[i].a; id = 10.0 + uBm[i].y; em = uBm[i].z; add = vec3(0.0); face = 10.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0)); } }
  if (mat >= 0.0){ p = ro + rd * t; float fp = pxw * t;
    if (mat < 0.5) base *= mott(p, 1.0);
    else if (mat < 1.5){ float sy = floor(p.y / 0.022); float st = hash(vec2(sy, floor((p.x + p.z) / 0.35 + hash(vec2(sy, 1.0)) * 3.0))); base *= st > 0.84 ? 0.9 : st < 0.14 ? 1.08 : 1.0; }
    else if (mat < 2.5) base *= mott(p * 1.4, 2.2);
    else if (mat < 3.5){ float f = fract((p.x + p.z) / 0.085 + 0.25 * sin(p.y * 4.0)); base *= f < 0.3 ? 0.78 : f > 0.75 ? 1.1 : 1.0; base *= mott(p, 1.0); }
    else if (mat < 4.5){ float u = abs(n.x) > 0.5 ? p.z : p.x; if (fract(u / 0.13) * 0.13 < max(0.012, fp * 0.9)) base *= 0.62; base *= 0.94 + 0.12 * hash(vec2(floor(u / 0.13), 4.0)); }
    else if (mat < 5.5) base = speakerFace(base * mott(p, 1.0), rotY(p - uBc[bi], -uBm[bi].x), uBh[bi], bln);
    else if (mat < 6.5){ base = base.r > 0.5 ? neonB() : neonA(); em = 1.0; } // a neon strip in the club's mood: red over half = the second neon
    else if (mat < 7.5) base = signFace(base, rotY(p - uBc[bi], -uBm[bi].x), uBh[bi], bln, bi, fp);
    else if (mat < 8.5) base = clockFace(rotY(p - uBc[bi], -uBm[bi].x), uBh[bi], bi, fp);
    else if (mat < 9.5) base = signTop(base, rotY(p - uBc[bi], -uBm[bi].x), uBh[bi], bln, bi, fp);
  }
  for (int i = 0; i < NO; i++){ if (i >= uNO) break; vec3 bn; vec3 d = ro - uOc[i];
    float tb = boxHit(vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])), vec3(dot(rd, uOx[i]), dot(rd, uOy[i]), dot(rd, uOz[i])), uOh[i], bn);
    if (tb > 0.0 && tb < t){ t = tb; n = uOx[i] * bn.x + uOy[i] * bn.y + uOz[i] * bn.z; id = 200.0 + float(i); face = 20.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0)); add = vec3(0.0);
      if (bn.z > 0.5 && uOs[i].z > 0.0){ // a paper: the sign on its face, lit like anything else
        vec3 pl = vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])) + vec3(dot(rd, uOx[i]), dot(rd, uOy[i]), dot(rd, uOz[i])) * tb;
        vec4 r = uOs[i]; vec2 uv = clamp(pl.xy / uOh[i].xy * 0.5 + 0.5, 0.0, 1.0);
        vec4 sg = textureLod(uSign, mix(r.xy, r.zw, uv), log2(max(pxw * tb * (r.z - r.x) * uSignSz.x / (2.0 * uOh[i].x), 1.0)));
        base = mix(uOcol[i], sg.rgb, sg.a); em = 0.0; }
      else if (bn.z > 0.5){ base = uOem[i]; em = 1.0;
        if (float(i) == uScrOn.x){   // the phone shows a real screen: read it at the fineness this shot can hold, hard pixels up close
          vec3 pl = vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])) + vec3(dot(rd, uOx[i]), dot(rd, uOy[i]), dot(rd, uOz[i])) * tb;
          vec2 sh = vec2(uOh[i].y * 0.96 * 360.0 / 780.0, uOh[i].y * 0.96); vec2 uv = pl.xy / sh * 0.5 + 0.5;
          if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) base = textureLod(uScr, uv, max(0.0, log2(pxw * tb * uScrOn.y / (sh.x * 2.0)))).rgb; else base = vec3(0.02);
        } } else { base = uOcol[i]; em = 0.0; } } }

  // soft bodies: characters, pillows, plants
  int hc = -1;
  for (int c = 0; c < NC; c++){ if (c >= uNC) break;
    vec2 s = sph(ro, rd, uCl[c]); if (s.y <= 0.0 || s.x >= t) continue;
    float tc = max(s.x, 0.0); float e = min(s.y, t);
    for (int i = 0; i < 72; i++){ float d = mapD(ro + rd * tc, c); if (d < 0.0015 * tc){ t = tc; hc = c; break; } tc += d * 0.9; if (tc > e) break; }
  }
  if (hc >= 0){ p = ro + rd * t; int g; vec4 c4; mapC(p, hc, g, c4); n = softN(p, hc); base = c4.rgb; add = vec3(0.0); face = 0.0;
    float tex = floor(c4.a); em = fract(c4.a) * 1.0102; chr = uCr[hc].w > 0.5; int h = int(uCr[hc].z);
    id = chr ? 100.0 + float(hc) * 8.0 + float(g) : 60.0 + float(hc) * 4.0 + float(min(g, 3));
    if (tex > 0.5 && tex < 2.5) base *= mott((p - uCo[hc]) * (tex > 1.5 ? 1.4 : 1.0), tex > 1.5 ? 2.4 : 1.0);
    if (tex > 2.5 && tex < 3.5){ vec3 cp = (p - uCo[hc]) / 0.032; vec3 cf = abs(fract(cp) - 0.5);   // a fine check
      base *= mott(p - uCo[hc], 1.0) * ((cf.x < 0.12 || cf.y < 0.12 || cf.z < 0.12) ? 0.88 : 1.0); }
    if (h >= 0 && g == 0){ vec3 q = headQ(p, h);
      if (dot(q, q) < 0.085){ face = max(face, 0.6);
        if (q.z > 0.05 && q.y > -0.02 && sdHair(q + vec3(0.0, 0.018, 0.0), h) < 0.008) base *= vec3(0.9, 0.83, 0.85); // the shade the hair throws on the forehead
        if (q.z > 0.03){ float fl; vec3 pc = paintFace(base, q, h, pxw * t / 0.2, px, fl); base = pc; if (fl > 0.5) face = fl; } } }
  }

  // the crowd, if this set has one
  { Pp CP; float tcw = crowdHit(ro, rd, t, CP);
    if (tcw > 0.0){ t = tcw; hc = -1; p = ro + rd * t; int g; crowdSD(p, CP, g); n = crowdN(p, CP); base = crowdCol(p, CP, g); add = vec3(0.0); em = 0.0; face = 0.0;
      chr = true; id = 228.0 + float(CP.cls * 5 + g);
      if (g == 0){ vec3 q = cHeadQ(p, CP); if (dot(q, q) < 0.085 && q.z > 0.03){ face = 0.6; float fl; base = crowdFace(base, q, CP, pxw * t / (0.2 * CP.hs), fl); if (fl > 0.5) face = fl; } } } }

  p = ro + rd * t;
  vec3 col;
  if (em > 0.99){ col = base; if (hc >= 0 && dot(n, -rd) + (by - 0.5) * 0.12 < 0.52) col *= vec3(0.95, 0.76, 0.56); }
  else if (chr){
    // characters are lit flatter than the set, so they always read: one soft step of shade, never a gradient
    vec3 L = min(uAmbC + roomLight(p, n, px, 2.0) * 0.42 + beamLight(p, px) * 0.6, vec3(1.12, 1.05, 1.02));
    vec3 kd = normalize(normalize(uL[0].xyz - p) + vec3(0.0, 0.9, 0.0));
    if (face < 0.5 && dot(n, kd) + (by - 0.5) * 0.1 < -0.34) L *= vec3(0.84, 0.77, 0.82);
    col = base * (face > 1.5 ? mix(L, vec3(1.0), 0.6) : L);
  } else {
    col = base * (uAmb + roomLight(p, n, px, 8.0) + beamLight(p, px));
    if (em > 0.0) col = mix(col, base, em);
    if (id < 1.5 && wall == 1) col *= crowdShade(p, by);
    if (id < 1.5 && wall == 1) for (int i = 0; i < NSH; i++){ if (uSh[i].w <= 0.0) continue; float e = length(p.xz - uSh[i].xy) / uSh[i].z; if (e + (by - 0.5) * 0.35 < 1.0) col *= 1.0 - uSh[i].w; }
  }
  col += add;
  col += beamHaze(ro, rd, t, px);
  // halos: a lamp glows in the air around it
  for (int i = 0; i < NL; i++){ if (i >= uNL) break; float rh = uLc[i].a; if (rh <= 0.0) continue;
    float tl = dot(uL[i].xyz - ro, rd); if (tl > 0.0 && tl < t + 0.03){ float dd = length(ro + rd * tl - uL[i].xyz);
      col += uLc[i].rgb * 0.22 * floor(4.0 / (1.0 + dd * dd / (rh * rh)) + 0.25 + (by - 0.5) * 0.4) / 4.0; } }
  // marks: the small ink signs drawn in the air beside a head. 1 = !, 2 = !!, 3 = a burst of short ticks above the hair
  for (int h = 0; h < NHD; h++){ float mk = F(h, 33); if (mk < 0.5) continue;
    vec3 hc = uHc[h] - ro; float z = dot(hc, uCamF); if (z < 0.2) continue;
    vec2 c = (vec2(dot(hc, uCamR) / (z * uTan * uRes.x / uRes.y), dot(hc, uCamU) / (z * uTan)) * 0.5 + 0.5) * uRes;
    float R = 0.2 / (z * pxw); float w = max(1.0, floor(R * 0.095 + 0.5)); vec2 m = px + 0.5 - c;
    if (mk < 2.5){
      for (float k = 0.0; k < mk - 0.5; k += 1.0){ vec2 g = m - vec2(R * 1.3 + k * (w * 2.0 + 1.0), R * 1.12 - k * w);
        float gx = g.x - g.y * 0.24;
        if (abs(gx) < w * 0.5 + 0.01 && ((g.y > w * 2.0 && g.y < R * 0.6) || (g.y > 0.0 && g.y < w))) col = INK; }
    } else {
      for (float k = -2.0; k <= 2.0; k += 1.0){ float a = 1.5708 - k * 0.36; vec2 dir = vec2(cos(a), sin(a));
        float al = dot(m, dir), pe = abs(m.x * dir.y - m.y * dir.x); float r0 = R * (1.62 + 0.05 * abs(k));
        if (al > r0 && al < r0 + R * (abs(k) < 0.5 ? 0.3 : 0.22) && pe < w * 0.5 + 0.01) col = INK; }
    }
  }
  oCol = vec4(col, 1.0);
  float dz = clamp(t / 16.0, 0.0, 0.99999) * 65535.0;
  oAux = vec4(id / 255.0, floor(dz / 256.0) / 255.0, mod(dz, 256.0) / 255.0, face / 255.0);
}`;

// The outline pass. Ink where a nearer, different thing begins. Characters and hand props get the dark ink line;
// the set gets a softer line in its own darkened colour. The weight is a little uneven, like a drawn line.
export const COMP_FRAG = `precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D tCol; uniform sampler2D tAux; uniform vec2 uRes; uniform float uPxw;
const vec3 INK = vec3(0.07, 0.046, 0.045);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void rd(vec2 px, out float id, out float d, out float f){ vec4 a = texture(tAux, (px + 0.5) / uRes);
  id = floor(a.r * 255.0 + 0.5); d = (floor(a.g * 255.0 + 0.5) * 256.0 + floor(a.b * 255.0 + 0.5)) / 65535.0 * 16.0; f = floor(a.a * 255.0 + 0.5); }
void main(){
  vec2 px = floor(vUv * uRes);
  vec3 col = texture(tCol, (px + 0.5) / uRes).rgb;
  float id, d, f; rd(px, id, d, f);
  bool me = id >= 99.5;
  float line = 0.0; // 2 = ink, 1 = soft, 0.5 = crease
  bool heavy = hash(floor(px / 3.0)) > 0.7; // here and there the line swells by a pixel
  for (int i = 0; i < 4; i++){
    vec2 o2 = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
    vec2 q = clamp(px + o2, vec2(0.0), uRes - 1.0); float nid, nd, nf; rd(q, nid, nd, nf);
    bool chr = nid >= 99.5;
    if (nid != id){
      if (chr && me){ if (nd < d - 0.004 || (abs(nd - d) <= 0.004 && nid > id)) line = 2.0; }
      else if (nd < d - 0.01) line = max(line, chr ? 2.0 : 1.0);
    } else {
      if (nd < d - (chr ? 0.05 : 0.12)) line = max(line, chr ? 2.0 : 1.0);
      else if (!chr && nf != f && nf > f) line = max(line, 0.5);
    }
  }
  // a character's line is a real width (about a centimetre), so it grows when the camera comes close, like a drawing
  // that has been enlarged. One pixel at least, an extra pixel here and there. The lines inside a character
  // (hair against skin, tee against arm) carry the same weight as the outer one.
  if (line < 1.5){
    for (int i = 0; i < 8; i++){
      vec2 dir = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : i == 3 ? vec2(0.0, -1.0) : i == 4 ? vec2(0.7, 0.7) : i == 5 ? vec2(-0.7, 0.7) : i == 6 ? vec2(0.7, -0.7) : vec2(-0.7, -0.7);
      for (float r = 1.0; r <= 3.0; r += 1.0){
        vec2 q = clamp(px + floor(dir * r + 0.5), vec2(0.0), uRes - 1.0); float nid, nd, nf; rd(q, nid, nd, nf);
        bool hit = me ? (nid >= 99.5 && nid != id && (nd < d - 0.004 || (abs(nd - d) <= 0.004 && nid > id))) : (nid >= 99.5 && nd < d - 0.02);
        if (hit){ float want = clamp(floor(0.011 / (uPxw * nd) + 0.5), 1.0, 3.0) + (heavy ? 1.0 : 0.0); if (r <= min(want, 3.0)) line = 2.0; break; }
      }
    }
  }
  if (line > 1.5) col = INK; else if (line > 0.75) col = mix(col * 0.5, INK, 0.45); else if (line > 0.25) col *= 0.82;
  o = vec4(col, 1.0);
}`;
