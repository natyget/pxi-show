// The renderer. One fragment shader draws a whole shot at the show's native pixel size (180x320 upright).
// The look is built into the drawing, never filtered on afterwards:
//  - every surface gets its own blocky pixel texture (wood grain, cloth flecks, hair clusters)
//  - light is a handful of flat steps with an ordered-dither fringe; lamps make soft warm pools and halos
//  - a soft body (a character, a pillow, a plant) is capsules blended into ONE surface per material, so a body has
//    no seams and a garment is a single piece that wraps it
//  - a face is painted on the head from numbers: big simple eyes, off-centre pupils, a small mouth
//  - the outline pass inks one pixel wherever a nearer thing begins, with a slightly uneven weight
export const NP = 96, NC = 10, NHD = 2, NHB = 32, NB = 72, NO = 4, NL = 8, FS = 36;

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
uniform vec2 uRes; uniform vec3 uCamP, uCamR, uCamU, uCamF; uniform float uTan; uniform float uTime;
uniform vec4 uA[NP]; uniform vec4 uB[NP]; uniform vec4 uM[NP]; uniform vec4 uC[NP];
uniform vec4 uCl[NC]; uniform vec4 uCr[NC]; uniform vec3 uCo[NC]; uniform int uNC;
uniform vec3 uHc[NHD]; uniform vec3 uHr[NHD]; uniform vec3 uHu[NHD]; uniform vec3 uHf[NHD];
uniform vec3 uSkin[NHD]; uniform vec3 uHairA[NHD]; uniform vec3 uHairB[NHD]; uniform vec4 uHb[NHD * NHB]; uniform int uHn[NHD]; uniform vec4 uFace[NHD * 9];
uniform vec3 uBc[NB]; uniform vec3 uBh[NB]; uniform vec4 uBcol[NB]; uniform vec4 uBm[NB]; uniform int uNB;
uniform vec3 uOc[NO]; uniform vec3 uOx[NO]; uniform vec3 uOy[NO]; uniform vec3 uOz[NO]; uniform vec3 uOh[NO]; uniform vec3 uOcol[NO]; uniform vec3 uOem[NO]; uniform int uNO;
uniform vec4 uL[NL]; uniform vec4 uLc[NL]; uniform int uNL;
uniform vec4 uSh[4]; uniform vec3 uRoom; uniform vec3 uAmb; uniform vec3 uAmbC; uniform float uSet;

const vec3 INK = vec3(0.095, 0.062, 0.06);
const vec3 WHITE = vec3(0.96, 0.925, 0.88);
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
float sdSkull(vec3 q){
  float d = length(q * vec3(1.0, 1.05, 1.0)) - 0.2;
  d = smin(d, length((q - vec3(0.0, -0.068, 0.022)) * vec3(1.0, 1.12, 1.04)) - 0.16, 0.07);
  vec3 e = vec3(abs(q.x) - 0.192, q.y + 0.05, q.z + 0.02);
  d = min(d, (length(e * vec3(2.6, 1.0, 1.5)) - 0.042) / 2.6);
  return d * 0.95;
}
float sdHair(vec3 q, int h){
  // a thin cap so no scalp shows between the clumps
  float hl = mix(-0.06, 0.07, smoothstep(-0.13, -0.01, q.z)) + 0.065 * smoothstep(0.04, 0.12, q.z);
  float d = max(length(q - vec3(0.0, 0.012, -0.012)) - 0.207, hl - q.y);
  int n = uHn[h];
  // the clumps: each runs from a fat root to a thin tip, so the silhouette ends in loose points
  for (int i = 0; i < NHB / 2; i++){ if (i >= n) break; vec4 a = uHb[h * NHB + i * 2], b = uHb[h * NHB + i * 2 + 1];
    vec3 pa = q - a.xyz, ba = b.xyz - a.xyz; float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    d = smin(d, length(pa - ba * t) - mix(a.w, b.w, t), 0.018); }
  return d;
}

// ---- soft bodies ----
float mapD(vec3 p, int c){
  int i0 = int(uCr[c].x), i1 = int(uCr[c].y), h = int(uCr[c].z);
  float g0 = 1e3, g1 = 1e3, g2 = 1e3, g3 = 1e3, g4 = 1e3;
  for (int i = i0; i < i1; i++){
    float d = prim(p, i); float k = uM[i].y; int g = int(uM[i].x);
    if (g == 0) g0 = smin(g0, d, k); else if (g == 1) g1 = smin(g1, d, k); else if (g == 2) g2 = smin(g2, d, k); else if (g == 3) g3 = smin(g3, d, k); else g4 = smin(g4, d, k);
  }
  if (h >= 0){ vec3 q = headQ(p, h); if (dot(q, q) < 0.17){ g0 = smin(g0, sdSkull(q), 0.015); g4 = min(g4, sdHair(q, h)); } else g0 = min(g0, length(q) - 0.4); }
  return min(min(min(g0, g1), min(g2, g3)), g4);
}
float mapC(vec3 p, int c, out int grp, out vec4 col){
  int i0 = int(uCr[c].x), i1 = int(uCr[c].y), h = int(uCr[c].z);
  float g[5]; float best[5]; vec4 bc[5];
  for (int j = 0; j < 5; j++){ g[j] = 1e3; best[j] = 1e3; bc[j] = vec4(0.0); }
  for (int i = i0; i < i1; i++){
    float d = prim(p, i); int gi = int(uM[i].x);
    g[gi] = smin(g[gi], d, uM[i].y); if (d < best[gi]){ best[gi] = d; bc[gi] = uC[i]; }
  }
  if (h >= 0){ vec3 q = headQ(p, h); if (dot(q, q) < 0.17){
    float hs = sdSkull(q); if (hs < best[0]){ best[0] = hs; bc[0] = vec4(uSkin[h], 0.0); } g[0] = smin(g[0], hs, 0.015);
    float hh = sdHair(q, h); if (hh < g[4]){ g[4] = hh; bc[4] = vec4(hash3(floor(q / 0.03)) > 0.5 ? uHairA[h] : uHairB[h], 0.0); } } }
  float d = 1e3; grp = 0;
  for (int j = 0; j < 5; j++){ if (g[j] < d){ d = g[j]; grp = j; } }
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
void drawEye(inout vec3 col, inout float fl, vec2 uv, float sg, int h, int o, float t, float px){
  float open = F(h, o), low = F(h, o + 1), slope = tan(F(h, o + 2) * 0.01745), wide = F(h, o + 6), arc = F(h, o + 7);
  float sc = sg > 0.0 ? 1.0 : 0.93; // the two eyes are never quite the same size
  vec2 e = uv - vec2(sg * 0.305, sg > 0.0 ? -0.14 : -0.125);
  float rx = 0.275 * wide * sc, ry = 0.3 * wide * sc;
  if (abs(arc) > 0.5){
    float xx = e.x / rx; float yy = arc > 0.0 ? 0.12 * (1.0 - xx * xx) - 0.06 : -0.05 * (1.0 - xx * xx) + 0.0;
    if (abs(xx) < 0.95 && abs(e.y - yy) < t * 1.25){ col = INK; fl = 1.0; } return; }
  vec2 a = abs(e) / vec2(rx, ry); float se = pow(a.x, 3.0) + pow(a.y, 3.0);
  vec2 b = abs(e) / vec2(rx + t * 1.5, ry + t * 1.5); float so = pow(b.x, 3.0) + pow(b.y, 3.0);
  float top = ry * (2.0 * open - 1.0) + slope * e.x * sg, bot = -ry * (1.0 - 2.0 * low);
  bool vis = se < 1.0 && e.y < top && e.y > bot;
  bool rim = so < 1.0 && e.y < top + t * 1.5 && e.y > bot - t * 1.5;
  if (rim && !vis){ col = INK; fl = 1.0; }
  if (vis){ col = WHITE; fl = 2.0;
    vec2 pr = max(vec2(0.132, 0.178) * F(h, o + 5) * sc, vec2(px * 0.9));
    vec2 pc = vec2(F(h, o + 3) * (rx - pr.x) * 0.95, F(h, o + 4) * (ry - pr.y) * 0.85);
    vec2 d = (e - pc) / pr;
    if (dot(d, d) < 1.0){ col = vec3(0.075, 0.05, 0.055); fl = 1.0;
      vec2 nc = pc - vec2(sign(F(h, o + 3) + 0.001) * pr.x * 0.82, -pr.y * 0.12); // the small bite of white in the pupil
      if (max(abs(e.x - nc.x), abs(e.y - nc.y)) < max(px * 0.7, 0.03)){ col = WHITE; fl = 2.0; } }
  }
}
void drawBrow(inout vec3 col, inout float fl, vec2 uv, float sg, int h, int o, float t){
  vec2 b = uv - vec2(sg * 0.3, 0.27 + F(h, o)); float s = b.x * sg;
  float y = s * tan(F(h, o + 1) * 0.01745) + F(h, o + 2) * 0.05 * (0.5 - s * s / 0.0196);
  if (abs(s) < 0.14 && abs(b.y - y) < max(0.02, t * 0.95)){ col = INK; fl = 1.0; }
}
void drawMouth(inout vec3 col, inout float fl, vec2 uv, int h, float t){
  float w = F(h, 22), curve = F(h, 23), open = F(h, 24), teeth = F(h, 25), tongue = F(h, 26), skew = F(h, 27), wob = F(h, 28);
  vec2 m = uv - vec2(skew * 0.04, -0.66); float x = m.x / w;
  float yc = curve * 1.5 * (x * x - 0.4) + skew * curve * 0.9 * x + wob * 0.022 * sin(m.x * 48.0);
  if (open < 0.03){ if (abs(x) < 1.0 && abs(m.y - yc) < t * 1.1){ col = INK; fl = 1.0; } return; }
  float arcx = sqrt(max(1.0 - x * x, 0.0)); float yl = yc - open * arcx;
  float xo = m.x / (w + t * 1.5); float arco = sqrt(max(1.0 - xo * xo, 0.0));
  bool inside = abs(x) < 1.0 && m.y < yc && m.y > yl;
  bool rim = abs(xo) < 1.0 && m.y < yc + t * 1.5 && m.y > yc - open * arco - t * 1.5;
  if (rim && !inside){ col = INK; fl = 1.0; }
  if (inside){ fl = 1.0;
    col = vec3(0.3, 0.12, 0.13);
    if (tongue > 0.5 && length((m - vec2(0.0, yc - open * 1.05)) * vec2(1.0, 1.25)) < w * 0.62) col = vec3(0.78, 0.42, 0.4);
    float th = min(0.06, open * 0.42);
    if (teeth > 0.5 && m.y > yc - th){ col = WHITE; fl = 2.0; }
    if (teeth > 1.5 && m.y < yl + th * 1.3){ col = WHITE; fl = 2.0; }
  }
}
vec3 paintFace(vec3 col, vec3 q, int h, float px, vec2 fpx, out float fl){
  vec2 uv = q.xy / 0.2; float t = max(0.022, px * 0.6); fl = 0.0;
  float ck = mod(fpx.x + fpx.y, 2.0);
  if (F(h, 30) > 0.01 && uv.y > 0.05 - 0.1 * ck) col = mix(col, vec3(0.42, 0.34, 0.45), 0.55 * F(h, 30));
  if (F(h, 29) > 0.01 && length((vec2(abs(uv.x), uv.y) - vec2(0.6, -0.52)) * vec2(1.0, 2.0)) < 0.12) col = mix(col, vec3(0.84, 0.5, 0.46), 0.75 * F(h, 29));
  if (F(h, 32) > 0.01){ float tx = abs(abs(uv.x) - 0.3); if (tx < 0.075 && uv.y < -0.4 && uv.y > -0.93){ col = tx > 0.075 - t * 1.4 ? INK : vec3(0.75, 0.84, 0.88); fl = 1.0; } }
  drawEye(col, fl, uv, 1.0, h, 0, t, px); drawEye(col, fl, uv, -1.0, h, 8, t, px);
  drawBrow(col, fl, uv, 1.0, h, 16, t); drawBrow(col, fl, uv, -1.0, h, 19, t);
  drawMouth(col, fl, uv, h, t);
  return col;
}

// ---- Nio's room: the painted surfaces ----
vec3 wood(vec2 uv, vec3 base, float fp){
  float pl = floor(uv.x / 0.17); float f = fract(uv.x / 0.17) * 0.17;
  vec3 c = base * (0.9 + 0.2 * hash(vec2(pl, 7.0)));
  float sx = floor(uv.x / 0.045); float st = hash(vec2(sx, floor(uv.y / 0.55 + hash(vec2(sx, 1.0)) * 3.0)));
  c *= st > 0.8 ? 0.94 : 1.0;
  if (f < max(0.012, fp * 0.9)) c *= 0.6;
  return c;
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
    frame(c, p.xy, vec2(0.22, 1.86), vec2(0.36, 0.3), 3.0, fp);
    // the string of lights, hung in scallops
    float seg = 0.95; float f = fract(p.x / seg) * 2.0 - 1.0; float yw = 2.4 - 0.24 * (1.0 - f * f);
    if (abs(p.y - yw) < max(0.007, fp * 0.55)){ c = vec3(0.14, 0.085, 0.09); em = 0.0; }
    float sp = 0.19; float bi = floor(p.x / sp + 0.5); float glow = 0.0; float bulb = 0.0;
    for (float k = -1.0; k <= 1.0; k += 1.0){ float bx = (bi + k) * sp; float ff = fract(bx / seg) * 2.0 - 1.0; vec2 bc = vec2(bx, 2.4 - 0.24 * (1.0 - ff * ff) - 0.035);
      float d = length(p.xy - bc); glow += 1.0 / (1.0 + d * d / 0.008);
      if (d < max(0.031, fp * 1.05)){ c = vec3(1.0, 0.88, 0.55); em = 1.0; bulb = 1.0; } }
    if (bulb < 0.5) add = vec3(0.46, 0.27, 0.09) * floor(min(glow, 1.0) * 4.0 + 0.3 + (bayer(px) - 0.5) * 0.3) / 4.0;
  }
  if (w == 5){ frame(c, p.zy, vec2(2.0, 1.42), vec2(0.5, 0.4), 1.0, fp); frame(c, p.zy, vec2(1.42, 1.56), vec2(0.3, 0.36), 2.0, fp); }
  if (w == 4){ frame(c, p.zy, vec2(1.7, 1.46), vec2(0.44, 0.54), 4.0, fp); }
  return c;
}

void main(){
  vec2 px = floor(vUv * uRes); vec2 ndc = (px + 0.5) / uRes * 2.0 - 1.0;
  vec3 ro = uCamP; vec3 rd = normalize(uCamF + uCamR * ndc.x * uTan * uRes.x / uRes.y + uCamU * ndc.y * uTan);
  float pxw = 2.0 * uTan / uRes.y; // world size of a pixel at distance 1
  float by = bayer(px);

  // the room shell (the camera is inside it)
  vec3 tt = (mix(vec3(0.0), uRoom, step(0.0, rd)) - ro) / rd;
  float t = min(tt.x, min(tt.y, tt.z)); vec3 n; int wall;
  if (t == tt.y){ n = vec3(0.0, -sign(rd.y), 0.0); wall = rd.y < 0.0 ? 1 : 2; }
  else if (t == tt.z){ n = vec3(0.0, 0.0, -sign(rd.z)); wall = rd.z > 0.0 ? 3 : 6; }
  else { n = vec3(-sign(rd.x), 0.0, 0.0); wall = rd.x < 0.0 ? 4 : 5; }
  float id = 1.0, face = float(wall), em = 0.0; vec3 base; vec3 add = vec3(0.0); vec3 p = ro + rd * t; bool chr = false; float mat = -1.0;
  base = wall == 1 ? floorCol(p, pxw * t) : wallCol(p, wall, pxw * t, px, em, add);

  for (int i = 0; i < NB; i++){ if (i >= uNB) break; vec3 bn; float a = uBm[i].x;
    float tb = boxHit(rotY(ro - uBc[i], -a), rotY(rd, -a), uBh[i], bn);
    if (tb > 0.0 && tb < t){ t = tb; n = rotY(bn, a); base = uBcol[i].rgb; mat = uBcol[i].a; id = 10.0 + uBm[i].y; em = uBm[i].z; add = vec3(0.0); face = 10.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0)); } }
  if (mat >= 0.0){ p = ro + rd * t; float fp = pxw * t;
    if (mat < 0.5) base *= mott(p, 1.0);
    else if (mat < 1.5){ float sy = floor(p.y / 0.022); float st = hash(vec2(sy, floor((p.x + p.z) / 0.35 + hash(vec2(sy, 1.0)) * 3.0))); base *= st > 0.84 ? 0.9 : st < 0.14 ? 1.08 : 1.0; }
    else if (mat < 2.5) base *= mott(p * 1.4, 2.2);
    else if (mat < 3.5){ float f = fract((p.x + p.z) / 0.085 + 0.25 * sin(p.y * 4.0)); base *= f < 0.3 ? 0.78 : f > 0.75 ? 1.1 : 1.0; base *= mott(p, 1.0); }
    else { float u = abs(n.x) > 0.5 ? p.z : p.x; if (fract(u / 0.13) * 0.13 < max(0.012, fp * 0.9)) base *= 0.62; base *= 0.94 + 0.12 * hash(vec2(floor(u / 0.13), 4.0)); }
  }
  for (int i = 0; i < NO; i++){ if (i >= uNO) break; vec3 bn; vec3 d = ro - uOc[i];
    float tb = boxHit(vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])), vec3(dot(rd, uOx[i]), dot(rd, uOy[i]), dot(rd, uOz[i])), uOh[i], bn);
    if (tb > 0.0 && tb < t){ t = tb; n = uOx[i] * bn.x + uOy[i] * bn.y + uOz[i] * bn.z; id = 200.0 + float(i); face = 20.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0)); add = vec3(0.0);
      if (bn.z > 0.5){ base = uOem[i]; em = 1.0; } else { base = uOcol[i]; em = 0.0; } } }

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
    if (tex > 0.5) base *= mott((p - uCo[hc]) * (tex > 1.5 ? 1.4 : 1.0), tex > 1.5 ? 2.4 : 1.0);
    if (h >= 0 && g == 0){ vec3 q = headQ(p, h);
      if (dot(q, q) < 0.075){ face = max(face, 0.6);
        if (q.z > -0.03 && sdHair(q + vec3(0.0, 0.03, 0.0), h) < 0.012) base *= vec3(0.86, 0.79, 0.82); // the shade the hair throws on the forehead
        if (q.z > 0.03){ float fl; vec3 pc = paintFace(base, q, h, pxw * t / 0.2, px, fl); base = pc; if (fl > 0.5) face = fl; } } }
  }

  p = ro + rd * t;
  vec3 col;
  if (em > 0.99){ col = base; if (hc >= 0 && dot(n, -rd) + (by - 0.5) * 0.12 < 0.52) col *= vec3(0.95, 0.76, 0.56); }
  else if (chr){
    // characters are lit flatter than the set, so they always read: one soft step of shade, never a gradient
    vec3 L = min(uAmbC + roomLight(p, n, px, 2.0) * 0.42, vec3(1.12, 1.05, 1.02));
    vec3 kd = normalize(normalize(uL[0].xyz - p) + vec3(0.0, 0.9, 0.0));
    if (face < 0.5 && dot(n, kd) + (by - 0.5) * 0.1 < -0.34) L *= vec3(0.84, 0.77, 0.82);
    col = base * (face > 1.5 ? mix(L, vec3(1.0), 0.6) : L);
  } else {
    col = base * (uAmb + roomLight(p, n, px, 8.0));
    if (em > 0.0) col = mix(col, base, em);
    if (id < 1.5 && wall == 1) for (int i = 0; i < 4; i++){ if (uSh[i].w <= 0.0) continue; float e = length(p.xz - uSh[i].xy) / uSh[i].z; if (e + (by - 0.5) * 0.35 < 1.0) col *= 1.0 - uSh[i].w; }
  }
  col += add;
  // halos: a lamp glows in the air around it
  for (int i = 0; i < NL; i++){ if (i >= uNL) break; float rh = uLc[i].a; if (rh <= 0.0) continue;
    float tl = dot(uL[i].xyz - ro, rd); if (tl > 0.0 && tl < t + 0.03){ float dd = length(ro + rd * tl - uL[i].xyz);
      col += uLc[i].rgb * 0.22 * floor(4.0 / (1.0 + dd * dd / (rh * rh)) + 0.25 + (by - 0.5) * 0.4) / 4.0; } }
  oCol = vec4(col, 1.0);
  float dz = clamp(t / 16.0, 0.0, 0.99999) * 65535.0;
  oAux = vec4(id / 255.0, floor(dz / 256.0) / 255.0, mod(dz, 256.0) / 255.0, face / 255.0);
}`;

// The outline pass. Ink where a nearer, different thing begins. Characters and hand props get the dark ink line;
// the set gets a softer line in its own darkened colour. The weight is a little uneven, like a drawn line.
export const COMP_FRAG = `precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D tCol; uniform sampler2D tAux; uniform vec2 uRes; uniform float uPxw;
const vec3 INK = vec3(0.095, 0.062, 0.06);
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
  // a character's outer line is a real width (about 8 mm), so it grows when the camera comes close, like a drawing
  // that has been enlarged. One pixel at least; an extra pixel here and there.
  if (!me && line < 1.5){
    for (int i = 0; i < 8; i++){
      vec2 dir = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : i == 3 ? vec2(0.0, -1.0) : i == 4 ? vec2(0.7, 0.7) : i == 5 ? vec2(-0.7, 0.7) : i == 6 ? vec2(0.7, -0.7) : vec2(-0.7, -0.7);
      for (float r = 1.0; r <= 3.0; r += 1.0){
        vec2 q = clamp(px + floor(dir * r + 0.5), vec2(0.0), uRes - 1.0); float nid, nd, nf; rd(q, nid, nd, nf);
        if (nid >= 99.5 && nd < d - 0.02){ float want = clamp(floor(0.008 / (uPxw * nd) + 0.5), 1.0, 3.0) + (heavy ? 1.0 : 0.0); if (r <= min(want, 3.0)) line = 2.0; break; }
      }
    }
  }
  if (line > 1.5) col = INK; else if (line > 0.75) col = mix(col * 0.5, INK, 0.45); else if (line > 0.25) col *= 0.82;
  o = vec4(col, 1.0);
}`;
