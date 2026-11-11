// The renderer. One fragment shader draws the whole shot at 270x480:
//  - the room shell and furniture are exact ray hits on planes and boxes (cheap, hard pixel edges)
//  - a character is a signed distance field: capsules blended into ONE surface per material, so a body has no
//    seams and a garment is a single piece that wraps it
//  - the face is painted on the head from numbers, so it turns with the head and is covered by what is in front
//  - light is a few flat tone bands with a checker fringe; the outline pass inks the edges between materials
export const NP = 48, NB = 72, NO = 4;

export const VERT = `in vec3 position; out vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const SCENE_FRAG = `precision highp float; precision highp int;
in vec2 vUv;
layout(location = 0) out vec4 oCol;
layout(location = 1) out vec4 oAux;
#define NP ${NP}
#define NB ${NB}
#define NO ${NO}
uniform vec2 uRes; uniform vec3 uCamP, uCamR, uCamU, uCamF; uniform float uTan;
uniform vec4 uA[NP]; uniform vec4 uB[NP]; uniform vec4 uM[NP]; uniform vec3 uC[NP]; uniform int uN; uniform vec4 uBound;
uniform vec3 uHc, uHr, uHu, uHf; uniform float uFace[32]; uniform vec3 uSkin; uniform float uHasHead;
uniform vec3 uBc[NB]; uniform vec3 uBh[NB]; uniform vec3 uBcol[NB]; uniform vec4 uBm[NB]; uniform int uNB;
uniform vec3 uOc[NO]; uniform vec3 uOx[NO]; uniform vec3 uOy[NO]; uniform vec3 uOz[NO]; uniform vec3 uOh[NO]; uniform vec3 uOcol[NO]; uniform vec3 uOem[NO]; uniform int uNO;
uniform vec3 uRoom; uniform vec3 uLamp; uniform float uLampOn; uniform vec3 uFill; uniform vec3 uGlowP; uniform vec3 uGlowC;

const vec3 INK = vec3(0.102, 0.071, 0.125);
const vec3 HAIR = vec3(0.17, 0.122, 0.125);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
// a capsule; cut.x / cut.y close its a / b end with a flat face instead of a dome (a hem, a sleeve end)
float capD(vec3 p, vec4 a, vec4 b, vec2 cut){ vec3 pa = p - a.xyz, ba = b.xyz - a.xyz; float l2 = max(dot(ba, ba), 1e-6); float h = clamp(dot(pa, ba) / l2, 0.0, 1.0);
  float d = length(pa - ba * h) - mix(a.w, b.w, h);
  if (cut.x + cut.y > 0.5){ float s = dot(pa, ba) / sqrt(l2); if (cut.x > 0.5) d = max(d, -s); if (cut.y > 0.5) d = max(d, s - sqrt(l2)); }
  return d; }

// ---- head, in its own space: x to his left, y up, z out of the face ----
vec3 headQ(vec3 p){ vec3 d = p - uHc; return vec3(dot(d, uHr), dot(d, uHu) / uFace[31], dot(d, uHf)); }
float sdSkull(vec3 q){
  vec3 c = q * vec3(1.07, 0.96, 1.0);
  float d = length(c) - 0.2;
  d = smin(d, length((q - vec3(0.0, -0.1, 0.045)) * vec3(1.0, 1.0, 1.0)) - 0.105, 0.1);
  vec3 e = vec3(abs(q.x) - 0.186, q.y + 0.03, q.z + 0.015);
  d = min(d, (length(e * vec3(3.0, 1.0, 1.7)) - 0.05) / 3.0);
  d = smin(d, length(q - vec3(0.0, -0.062, 0.196)) - 0.012, 0.022);
  return d * 0.93;
}
float hairLine(vec3 q){
  float sx = smoothstep(0.09, 0.185, abs(q.x));
  float hl = mix(-0.1, 0.03, smoothstep(-0.15, -0.045, q.z)) + 0.09 * smoothstep(0.03 + 0.03 * sx, 0.1 + 0.05 * sx, q.z);
  hl -= 0.055 * sx * smoothstep(0.015, 0.035, q.z) * (1.0 - smoothstep(0.05, 0.075, q.z)); // sideburn
  return hl;
}
float rows(vec3 c){ return atan(c.x, length(c.yz)) * 5.6; } // cornrows straight back, evenly spaced over the scalp
float sdHair(vec3 q){
  vec3 c = (q - vec3(0.0, 0.012, -0.012)) * vec3(1.07, 0.96, 1.0);
  float d = length(c) - 0.208;
  float r = 0.5 + 0.5 * cos(rows(c) * 6.2832);
  float along = atan(c.z, c.y);
  float plait = 0.5 + 0.5 * cos(along * 26.0 + floor(rows(c) + 0.5) * 3.1416);
  d -= 0.0085 * r * (0.72 + 0.28 * plait);
  return max(d * 0.9, hairLine(q) - q.y);
}

// ---- the character field ----
float mapD(vec3 p){
  float g0 = 1e3, g1 = 1e3, g2 = 1e3, g3 = 1e3, g4 = 1e3;
  for (int i = 0; i < NP; i++){ if (i >= uN) break;
    float d = capD(p, uA[i], uB[i], uM[i].zw); float k = uM[i].y; int g = int(uM[i].x);
    if (g == 0) g0 = smin(g0, d, k); else if (g == 1) g1 = smin(g1, d, k); else if (g == 2) g2 = smin(g2, d, k); else if (g == 3) g3 = smin(g3, d, k); else g4 = smin(g4, d, k);
  }
  if (uHasHead > 0.5){ vec3 q = headQ(p); if (dot(q, q) < 0.16){ g0 = smin(g0, sdSkull(q), 0.012); g4 = min(g4, sdHair(q)); } else { g0 = min(g0, length(q) - 0.26); } }
  return min(min(min(g0, g1), min(g2, g3)), g4);
}
// distance, plus which material won and its colour
float mapC(vec3 p, out int grp, out vec3 col){
  float g[5]; float best[5]; vec3 bc[5];
  for (int j = 0; j < 5; j++){ g[j] = 1e3; best[j] = 1e3; bc[j] = vec3(0.0); }
  for (int i = 0; i < NP; i++){ if (i >= uN) break;
    float d = capD(p, uA[i], uB[i], uM[i].zw); int gi = int(uM[i].x);
    g[gi] = smin(g[gi], d, uM[i].y); if (d < best[gi]){ best[gi] = d; bc[gi] = uC[i]; }
  }
  if (uHasHead > 0.5){ vec3 q = headQ(p); if (dot(q, q) < 0.16){
    float hs = sdSkull(q); if (hs < best[0]){ best[0] = hs; bc[0] = uSkin; } g[0] = smin(g[0], hs, 0.012);
    float hh = sdHair(q); if (hh < g[4]){ g[4] = hh; bc[4] = HAIR; best[4] = -1.0; } } }
  float d = 1e3; grp = 0;
  for (int j = 0; j < 5; j++){ if (g[j] < d){ d = g[j]; grp = j; } }
  col = bc[grp];
  return d;
}
vec3 charN(vec3 p){ vec2 e = vec2(0.004, -0.004);
  return normalize(e.xyy * mapD(p + e.xyy) + e.yyx * mapD(p + e.yyx) + e.yxy * mapD(p + e.yxy) + e.xxx * mapD(p + e.xxx)); }
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

// ---- light ----
float shadow(vec3 p, vec3 ld, float maxT){
  for (int i = 0; i < NB; i++){ if (i >= uNB) break; if (uBm[i].w > 0.5) continue; vec3 n;
    float a = uBm[i].x; float t = boxHit(rotY(p - uBc[i], -a), rotY(ld, -a), uBh[i], n); if (t > 0.002 && t < maxT) return 0.0; }
  for (int i = 0; i < NO; i++){ if (i >= uNO) break; vec3 n; vec3 d = p - uOc[i];
    float t = boxHit(vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])), vec3(dot(ld, uOx[i]), dot(ld, uOy[i]), dot(ld, uOz[i])), uOh[i], n); if (t > 0.002 && t < maxT) return 0.0; }
  vec2 s = sph(p, ld, uBound);
  if (s.y > 0.0 && s.x < maxT){ float t = max(s.x, 0.015); float e = min(s.y, maxT);
    for (int i = 0; i < 30; i++){ float d = mapD(p + ld * t); if (d < 0.003) return 0.0; t += max(d, 0.015); if (t > e) break; } }
  return 1.0;
}
vec3 lit(vec3 base, vec3 n, vec3 p, vec2 px){
  float ck = mod(px.x + px.y, 2.0) - 0.5;
  vec3 lv = uLamp - p; float ld = length(lv); lv /= ld;
  float i = max(dot(n, lv), 0.0) * 2.6 / (1.0 + 0.42 * ld * ld) * uLampOn;
  if (i > 0.05) i *= shadow(p + n * 0.012, lv, ld);
  vec3 fv = normalize(uFill - p); i += 0.075 + max(dot(n, fv), 0.0) * 0.5; // the soft room light, no shadow
  float v = i + ck * 0.045;
  vec3 c = base * (v > 0.95 ? vec3(1.07, 1.0, 0.86) : v > 0.17 ? vec3(0.95, 0.9, 0.88) : v > 0.03 ? vec3(0.7, 0.58, 0.67) : vec3(0.48, 0.41, 0.57));
  // cool sky light from the window side, as a thin rim
  float w = max(dot(n, normalize(vec3(-0.25, 0.35, 1.0))), 0.0);
  if (w + ck * 0.1 > 0.8) c += base * vec3(0.08, 0.1, 0.2);
  // a screen's glow
  vec3 gv = uGlowP - p; float gd = length(gv); float gi = max(dot(n, gv / gd), 0.0) / (1.0 + 60.0 * gd * gd);
  float gq = gi + ck * 0.05; c += (gq > 0.3 ? 1.0 : gq > 0.1 ? 0.45 : 0.0) * uGlowC * (0.35 + 0.65 * base);
  return c;
}

// ---- the drawn face ----
void drawEye(inout vec3 col, vec2 uv, float sg, int o, float t, float px){
  float open = uFace[o], low = uFace[o + 1], slope = tan(uFace[o + 2] * 0.01745), wide = uFace[o + 6], arc = uFace[o + 7];
  vec2 e = uv - vec2(sg * 0.29, -0.04);
  float rx = 0.15 * wide, ry = 0.205 * wide;
  if (abs(arc) > 0.5){
    float xx = e.x / rx; float yy = arc > 0.0 ? 0.09 * (1.0 - xx * xx) - 0.04 : -0.045 * (1.0 - xx * xx) - 0.01;
    if (abs(xx) < 1.0 && abs(e.y - yy) < t * 1.1) col = INK; return; }
  vec2 a = e / vec2(rx, ry), b = e / vec2(rx + t * 1.6, ry + t * 1.6);
  float top = ry * (2.0 * open - 1.0) + slope * e.x * sg, bot = -ry * (1.0 - 2.0 * low);
  bool vis = dot(a, a) < 1.0 && e.y < top && e.y > bot;
  bool rim = dot(b, b) < 1.0 && e.y < top + t * 1.6 && e.y > bot - t * 1.6;
  if (dot(b, b) < 1.0 && e.y >= top) col *= vec3(0.9, 0.84, 0.86); // the lid, in front of the white
  if (rim && !vis) col = INK;
  if (vis){
    col = e.y > top - 0.035 ? vec3(0.8, 0.76, 0.82) : vec3(0.965, 0.937, 0.9);
    vec2 pc = vec2(uFace[o + 3] * rx * 0.45, uFace[o + 4] * ry * 0.4 - 0.01);
    float pr = max(0.074 * uFace[o + 5], px * 0.85);
    if (length((e - pc) * vec2(1.0, 0.86)) < pr) col = vec3(0.07, 0.047, 0.063);
  }
}
void drawBrow(inout vec3 col, vec2 uv, float sg, int o, float t){
  vec2 b = uv - vec2(sg * 0.3, 0.26 + uFace[o]); float s = b.x * sg;
  float y = s * tan(uFace[o + 1] * 0.01745) + uFace[o + 2] * 0.05 * (0.5 - s * s / 0.0225);
  if (abs(s) < 0.16 && abs(b.y - y) < max(0.03, t * 1.2) * (1.0 - 0.35 * smoothstep(0.0, 0.16, s))) col = HAIR * 0.8;
}
void drawMouth(inout vec3 col, vec2 uv, float t){
  float w = uFace[22], curve = uFace[23], open = uFace[24], teeth = uFace[25], tongue = uFace[26], skew = uFace[27], wob = uFace[28];
  vec2 m = uv - vec2(skew * 0.035, -0.5); float x = m.x / w;
  float yc = curve * 1.5 * (x * x - 0.4) + skew * curve * 0.9 * x + wob * 0.022 * sin(m.x * 48.0);
  if (open < 0.03){ if (abs(x) < 1.0 && abs(m.y - yc) < t * 1.15) col = INK; return; }
  float arcx = sqrt(max(1.0 - x * x, 0.0)); float yl = yc - open * arcx;
  float xo = m.x / (w + t * 1.6); float arco = sqrt(max(1.0 - xo * xo, 0.0));
  bool inside = abs(x) < 1.0 && m.y < yc && m.y > yl;
  bool rim = abs(xo) < 1.0 && m.y < yc + t * 1.6 && m.y > yc - open * arco - t * 1.6;
  if (rim && !inside) col = INK;
  if (inside){
    col = vec3(0.23, 0.08, 0.125);
    if (tongue > 0.5 && length((m - vec2(0.0, yc - open * 1.05)) * vec2(1.0, 1.25)) < w * 0.62) col = vec3(0.85, 0.39, 0.42);
    float th = min(0.055, open * 0.42);
    if (teeth > 0.5 && m.y > yc - th) col = vec3(0.965, 0.937, 0.9);
    if (teeth > 1.5 && m.y < yl + th * 1.3) col = vec3(0.965, 0.937, 0.9);
  }
}
vec3 paintFace(vec3 col, vec3 q, float px, vec2 fpx){
  vec2 uv = q.xy / 0.2; float t = max(0.02, px * 0.62);
  float ck = mod(fpx.x + fpx.y, 2.0);
  if (uFace[30] > 0.01 && uv.y > 0.12 - 0.1 * ck) col = mix(col, vec3(0.3, 0.27, 0.45), 0.5 * uFace[30]);
  if (uFace[29] > 0.01 && ck > 0.5 && length((vec2(abs(uv.x), uv.y) - vec2(0.52, -0.3)) * vec2(1.0, 1.7)) < 0.13) col = mix(col, vec3(0.92, 0.45, 0.45), 0.7 * uFace[29]);
  drawEye(col, uv, 1.0, 0, t, px); drawEye(col, uv, -1.0, 8, t, px);
  drawBrow(col, uv, 1.0, 16, t); drawBrow(col, uv, -1.0, 19, t);
  drawMouth(col, uv, t);
  return col;
}

// ---- the room's painted surfaces ----
vec3 skyline(vec2 w){ // w: x across the window 0..1, y 0..1
  vec3 c = mix(vec3(0.85, 0.5, 0.4), vec3(0.2, 0.2, 0.42), smoothstep(0.1, 0.95, w.y));
  c = mix(c, vec3(0.14, 0.16, 0.3), smoothstep(0.75, 1.0, w.y));
  float bx = floor(w.x * 11.0); float bh = 0.22 + 0.4 * hash(vec2(bx, 3.0));
  if (w.y < bh){ c = vec3(0.1, 0.105, 0.19); vec2 cell = floor(vec2(w.x * 44.0, w.y * 30.0));
    if (hash(cell + bx) > 0.72 && mod(cell.x, 4.0) > 0.5) c = vec3(0.91, 0.76, 0.5); }
  return c;
}
vec3 floorCol(vec3 p, float fp){
  vec3 c = vec3(0.36, 0.265, 0.26);
  float row = floor(p.x / 0.2); float u = fract(p.x / 0.2) * 0.2; float z = p.z + hash(vec2(row, 1.0)) * 1.3;
  c *= 0.92 + 0.14 * hash(vec2(row, floor(z / 1.3)));
  if (u < fp || fract(z / 1.3) * 1.3 < fp) c = vec3(0.2, 0.15, 0.17);
  vec2 r = abs(p.xz - vec2(1.75, 2.75)) - vec2(1.0, 0.75);
  if (max(r.x, r.y) < 0.0){ c = vec3(0.3, 0.2, 0.42); float e = -max(r.x, r.y);
    if (e > 0.07 && e < 0.07 + max(0.03, fp)) c = vec3(0.647, 0.137, 0.937) * 0.75; }
  return c;
}
vec3 wallCol(vec3 p, int w, float fp, out float em){
  em = 0.0; vec3 c = vec3(0.43, 0.37, 0.44);
  if (w == 2) return vec3(0.27, 0.23, 0.3);
  if (p.y < 0.09) return vec3(0.19, 0.16, 0.21);
  if (w == 3){ vec2 q = (vec2(p.x, p.y) - vec2(0.75, 1.15)) / vec2(1.6, 1.1);
    if (q.x > -0.035 && q.x < 1.035 && q.y > -0.05 && q.y < 1.05){ c = vec3(0.16, 0.13, 0.18);
      if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0){ em = 1.0; c = skyline(q);
        if (abs(q.x - 0.5) < 0.012 + fp * 0.3 || abs(q.y - 0.55) < 0.016 + fp * 0.4){ c = vec3(0.16, 0.13, 0.18); em = 0.0; } } } }
  if (w == 4){ vec2 q = (vec2(p.z, p.y) - vec2(1.3, 1.25)) / vec2(0.26, 0.3);
    if (q.x > 0.0 && q.x < 4.0 && q.y > 0.0 && q.y < 2.0){ vec2 cell = floor(q), f = fract(q);
      if (hash(cell + 7.0) > 0.18 && f.x > 0.1 && f.x < 0.9 && f.y > 0.1 && f.y < 0.9){ c = vec3(0.9, 0.87, 0.82);
        if (f.x > 0.17 && f.x < 0.83 && f.y > 0.3 && f.y < 0.83){ float h = hash(cell);
          c = h > 0.66 ? vec3(0.647, 0.137, 0.937) : h > 0.33 ? vec3(0.83, 0.5, 0.33) : vec3(0.25, 0.42, 0.45);
          if (f.y < 0.5) c *= 0.7; } } } }
  return c;
}

void main(){
  vec2 px = floor(vUv * uRes); vec2 ndc = (px + 0.5) / uRes * 2.0 - 1.0;
  vec3 ro = uCamP; vec3 rd = normalize(uCamF + uCamR * ndc.x * uTan * uRes.x / uRes.y + uCamU * ndc.y * uTan);
  float pxw = 2.0 * uTan / uRes.y; // world size of a pixel at distance 1

  // room shell (the camera is inside it)
  vec3 tt = (mix(vec3(0.0), uRoom, step(0.0, rd)) - ro) / rd;
  float t = min(tt.x, min(tt.y, tt.z)); vec3 n; int wall;
  if (t == tt.y){ n = vec3(0.0, -sign(rd.y), 0.0); wall = rd.y < 0.0 ? 1 : 2; }
  else if (t == tt.z){ n = vec3(0.0, 0.0, -sign(rd.z)); wall = rd.z > 0.0 ? 3 : 6; }
  else { n = vec3(-sign(rd.x), 0.0, 0.0); wall = rd.x < 0.0 ? 4 : 5; }
  float id = 1.0, face = float(wall), em = 0.0; vec3 base; vec3 p = ro + rd * t;
  base = wall == 1 ? floorCol(p, pxw * t) : wallCol(p, wall, pxw * t, em);

  for (int i = 0; i < NB; i++){ if (i >= uNB) break; vec3 bn; float a = uBm[i].x;
    float tb = boxHit(rotY(ro - uBc[i], -a), rotY(rd, -a), uBh[i], bn);
    if (tb > 0.0 && tb < t){ t = tb; n = rotY(bn, a); base = uBcol[i]; id = 10.0 + uBm[i].y; em = uBm[i].z; face = 10.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0)); } }
  for (int i = 0; i < NO; i++){ if (i >= uNO) break; vec3 bn; vec3 d = ro - uOc[i];
    float tb = boxHit(vec3(dot(d, uOx[i]), dot(d, uOy[i]), dot(d, uOz[i])), vec3(dot(rd, uOx[i]), dot(rd, uOy[i]), dot(rd, uOz[i])), uOh[i], bn);
    if (tb > 0.0 && tb < t){ t = tb; n = uOx[i] * bn.x + uOy[i] * bn.y + uOz[i] * bn.z; id = 60.0 + float(i); face = 20.0 + dot(abs(bn), vec3(1.0, 2.0, 3.0));
      if (bn.z > 0.5){ base = uOem[i]; em = 1.0; } else { base = uOcol[i]; em = 0.0; } } }

  // the character
  vec2 s = sph(ro, rd, uBound);
  if (s.y > 0.0 && s.x < t){ float tc = max(s.x, 0.0); float e = min(s.y, t); bool hit = false;
    for (int i = 0; i < 80; i++){ float d = mapD(ro + rd * tc); if (d < 0.0012 * tc){ hit = true; break; } tc += d * 0.85; if (tc > e) break; }
    if (hit){ t = tc; p = ro + rd * t; int g; vec3 c; mapC(p, g, c); n = charN(p); base = c; em = 0.0; id = 100.0 + float(g); face = 0.0;
      if (uHasHead > 0.5){ vec3 q = headQ(p);
        if (g == 4 && dot(q, q) < 0.09){ vec3 cc = (q - vec3(0.0, 0.012, -0.012)) * vec3(1.07, 0.96, 1.0); float r = 0.5 + 0.5 * cos(rows(cc) * 6.2832);
          if (r < 0.13) base = vec3(0.4, 0.26, 0.23); else if (r > 0.86) base = vec3(0.27, 0.2, 0.2); }
        if (g == 0 && q.z > 0.03 && dot(q, q) < 0.07){ vec3 pc = paintFace(base, q, pxw * t / 0.2, px);
          if (pc != base){ float lum = dot(pc, vec3(0.33)); if (lum > 0.6 || lum < 0.2){ base = pc; em = lum > 0.6 ? 0.55 : 0.0; face = lum > 0.6 ? 2.0 : 1.0; } else base = pc; } } }
    } }

  p = ro + rd * t;
  vec3 col = em > 0.99 ? base : lit(base, n, p, px);
  if (em > 0.0 && em < 0.99) col = mix(col, base * vec3(0.93, 0.9, 0.95), em);
  oCol = vec4(col, 1.0);
  float dz = clamp(t / 16.0, 0.0, 0.99999) * 65535.0;
  oAux = vec4(id / 255.0, floor(dz / 256.0) / 255.0, mod(dz, 256.0) / 255.0, face / 255.0);
}`;

// The outline pass: one pixel of ink where a nearer, different thing begins; a softer line for the set.
export const COMP_FRAG = `precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D tCol; uniform sampler2D tAux; uniform vec2 uRes;
const vec3 INK = vec3(0.102, 0.071, 0.125);
void rd(vec2 px, out float id, out float d, out float f){ vec4 a = texture(tAux, (px + 0.5) / uRes);
  id = floor(a.r * 255.0 + 0.5); d = (floor(a.g * 255.0 + 0.5) * 256.0 + floor(a.b * 255.0 + 0.5)) / 65535.0 * 16.0; f = floor(a.a * 255.0 + 0.5); }
void main(){
  vec2 px = floor(vUv * uRes);
  vec3 col = texture(tCol, (px + 0.5) / uRes).rgb;
  float id, d, f; rd(px, id, d, f);
  float line = 0.0; // 2 = ink, 1 = soft
  for (int i = 0; i < 12; i++){
    vec2 o2 = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : i == 3 ? vec2(0.0, -1.0) : i == 4 ? vec2(1.0, 1.0) : i == 5 ? vec2(-1.0, 1.0) : i == 6 ? vec2(1.0, -1.0) : i == 7 ? vec2(-1.0, -1.0) : i == 8 ? vec2(2.0, 0.0) : i == 9 ? vec2(-2.0, 0.0) : i == 10 ? vec2(0.0, 2.0) : vec2(0.0, -2.0);
    vec2 q = clamp(px + o2, vec2(0.0), uRes - 1.0); float nid, nd, nf; rd(q, nid, nd, nf);
    bool chr = nid >= 99.5;
    if (nid != id){
      if (i > 3){ if (chr && id < 99.5 && nd < d - 0.01) line = 2.0; }
      else if (chr && id >= 99.5){ if (nd < d - 0.004 || (abs(nd - d) <= 0.004 && nid > id)) line = 2.0; }
      else if (nd < d - 0.01) line = max(line, chr || nid >= 59.5 ? 2.0 : 1.0);
    } else if (i < 4) {
      if (nd < d - (chr ? 0.045 : 0.12)) line = max(line, chr ? 2.0 : 1.0);
      else if (!chr && nf != f && nf > f) line = max(line, 0.5);
    }
  }
  if (line > 1.5) col = INK; else if (line > 0.75) col = mix(col, INK, 0.72); else if (line > 0.25) col *= 0.8;
  o = vec4(col, 1.0);
}`;
