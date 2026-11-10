// Sculpted meshes. One head per face shape; hair and the 2D face decal are cut FROM that head (same vertices, pushed out
// along its normals), so nothing floats, sinks or leaves a seam. Only the triangles that belong to the hair / face are kept.
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const HEAD_R = 0.17;
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n2 = (x: number, y: number) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (n2(xi, yi) * (1 - u) + n2(xi + 1, yi) * u) * (1 - v) + (n2(xi, yi + 1) * (1 - u) + n2(xi + 1, yi + 1) * u) * v;
};

export type FaceShape = 'tri' | 'round' | 'long' | 'oval' | 'hero';
type HeadData = { geo: THREE.BufferGeometry; dirs: Float32Array };

const heads = new Map<FaceShape, HeadData>();
/**
 * The skull. 'tri': wide at the cheekbones, tapering to a defined chin (Nio). 'round': soft jaw (Maya). 'long': tall, narrow.
 * Indexed and welded, so normals are continuous all the way round (no seam, no cut line in the outline).
 */
export function head(shape: FaceShape): HeadData {
  if (heads.has(shape)) return heads.get(shape)!;
  const s = new THREE.SphereGeometry(HEAD_R, 64, 44);
  s.deleteAttribute('normal'); s.deleteAttribute('uv');
  const g = mergeVertices(s, 1e-6);
  const p = g.attributes.position as THREE.BufferAttribute;
  const dirs = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  const taper = shape === 'tri' ? 0.2 : shape === 'round' ? 0.14 : shape === 'oval' ? 0.1 : shape === 'hero' ? 0.16 : 0.22;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = v.clone().normalize();
    dirs[i * 3] = d.x; dirs[i * 3 + 1] = d.y; dirs[i * 3 + 2] = d.z;
    let { x, y, z } = v;
    if (d.y < 0.08) {
      const k = Math.pow(Math.max(0, 0.08 - d.y) / 1.08, 1.6);   // softer: the jaw curves in, the chin stays round
      x *= 1 - taper * k;                                   // jaw narrows toward the chin
      if (shape === 'hero') {                               // a defined, slightly square jaw and a chin that comes forward
        const jaw = Math.exp(-Math.pow((d.y + 0.74) / 0.14, 2));   // the jaw corner, low, not the cheeks
        x *= 1 + 0.06 * jaw;
        if (d.z > 0) z += 0.012 * jaw * d.z;
        // the chin: a broad, forward chin (no receding lower jaw), with a flatter underside back to the neck
        const front = smooth(0.25, 0.85, d.z);
        const chin = Math.exp(-Math.pow((d.y + 0.86) / 0.13, 2)) * front;
        z += 0.034 * chin;
        x *= 1 + 0.1 * chin;
        if (d.y < -0.8 && d.z > -0.3) y *= 1 - 0.1 * smooth(-0.8, -1, d.y) * smooth(-0.3, 0.3, d.z);
      }
      z *= 1 - 0.1 * k;
      if (d.z > 0) z += (shape === 'tri' ? 0.012 : shape === 'oval' ? 0.004 : shape === 'hero' ? 0.022 : 0.008) * k * d.z * d.z; // chin
      y *= 1 + (shape === 'long' ? 0.14 : shape === 'oval' ? 0.05 : 0.08) * k;        // face length
    } else {
      // smaller cranium: no balloon top
      y *= 1 - 0.1 * d.y; x *= 1 - 0.05 * d.y; z *= 1 - 0.04 * d.y;
      if (shape === 'tri') x *= 1 + 0.03 * Math.exp(-Math.pow((d.y - 0.12) / 0.25, 2)); // cheekbones
    }
    if (d.z < 0) { z *= 1.05; y *= 1.02; }                  // fuller back of the head
    p.setXYZ(i, x, y * 1.06, z * 0.94);
  }
  g.computeVertexNormals();
  const data = { geo: g, dirs };
  heads.set(shape, data);
  return data;
}

/** A shell cut from the head: vertices pushed out by t(d) along the head normal; triangles with all t <= 0 are dropped. */
function shell(h: HeadData, t: (d: THREE.Vector3, i: number) => number, color?: (d: THREE.Vector3, t: number) => THREE.Color, uv?: (pos: THREE.Vector3) => [number, number]) {
  const src = h.geo.attributes.position as THREE.BufferAttribute, nrm = h.geo.attributes.normal as THREE.BufferAttribute;
  const n = src.count, pos = new Float32Array(n * 3), cols = new Float32Array(n * 3), uvs = new Float32Array(n * 2), keep = new Float32Array(n);
  const d = new THREE.Vector3(), q = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    d.set(h.dirs[i * 3], h.dirs[i * 3 + 1], h.dirs[i * 3 + 2]);
    const th = t(d, i);
    keep[i] = th;
    q.fromBufferAttribute(src, i); nn.fromBufferAttribute(nrm, i);
    q.addScaledVector(nn, Math.max(th, 0.0006));
    pos[i * 3] = q.x; pos[i * 3 + 1] = q.y; pos[i * 3 + 2] = q.z;
    if (color) { const c = color(d, th); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    if (uv) { const [u, w] = uv(q); uvs[i * 2] = u; uvs[i * 2 + 1] = w; }
  }
  const idx = h.geo.index!.array, out: number[] = [];
  for (let k = 0; k < idx.length; k += 3) {
    const a = idx[k], b = idx[k + 1], c = idx[k + 2];
    if (keep[a] > 0 || keep[b] > 0 || keep[c] > 0) out.push(a, b, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  if (color) g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  if (uv) g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(out);
  g.computeVertexNormals();
  return g;
}

/** The face decal: the front of the head, a hair's breadth above the skin, with a flat front projection for the 2D face. */
export const FACE_W = 0.38, FACE_H = 0.42, FACE_Y = -0.01;
const faces = new Map<FaceShape, THREE.BufferGeometry>();
export function faceGeometry(shape: FaceShape) {
  if (!faces.has(shape)) faces.set(shape, shell(head(shape), (d) => (d.z > 0.18 ? 0.0012 : -1), undefined,
    (q) => [0.5 + q.x / FACE_W, 0.5 + (q.y - FACE_Y) / FACE_H]));
  return faces.get(shape)!;
}

/** Outer surface of the crop's top, as a distance from the head centre along d: a rounded-square block. */
const HAIR = { a: 0.19, up: 0.255, down: 0.2, front: 0.2, back: 0.2, n: 3.2, cy: -0.005, cz: 0.004 };
function hairOuter(d: THREE.Vector3) {
  const b = d.y > 0 ? HAIR.up : HAIR.down, c = d.z > 0 ? HAIR.front : HAIR.back;
  // ray from the head centre; ignore the small centre offset in the denominator (it only shifts the block)
  const f = Math.pow(Math.abs(d.x / HAIR.a), HAIR.n) + Math.pow(Math.abs(d.y / b), HAIR.n) + Math.pow(Math.abs(d.z / c), HAIR.n);
  return Math.pow(f, -1 / HAIR.n) + HAIR.cy * d.y + HAIR.cz * d.z;
}

export type HairStyle = 'crop' | 'puff' | 'bald';
const hairs = new Map<string, THREE.BufferGeometry>();
/**
 * crop: a short textured crop. Tight faded sides, short curly texture on top, a clean shaped-up hairline above the brows.
 * puff: hair pulled back tight, the puff itself is a separate mesh (see puffGeometry).
 */
export function hairGeometry(shape: FaceShape, style: HairStyle, base: string, dark: string, skin: string) {
  const k = `${shape}|${style}|${base}|${dark}|${skin}`;
  if (hairs.has(k)) return hairs.get(k)!;
  const cb = new THREE.Color(base), cd = new THREE.Color(dark), cs = new THREE.Color(skin), c = new THREE.Color();
  const line = (d: THREE.Vector3) => {
    const az = Math.atan2(d.x, d.z), a = Math.abs(az) / Math.PI;
    // front: straight shaped-up line; temples step down; sides above the ears; nape low
    if (a < 0.2) return 0.7;
    if (a < 0.3) return 0.7 - (a - 0.2) * 3.4;
    if (a < 0.62) return 0.36 - (a - 0.3) * 0.9;
    return -0.02 - (a - 0.62) * 1.0;
  };
  const hp = head(shape).geo.attributes.position as THREE.BufferAttribute, v3 = new THREE.Vector3();
  const geo = shell(head(shape), (d, i) => {
    if (style === 'bald') return -1;
    const l = line(d), inside = smooth(l - 0.005, l + 0.035, d.y);
    if (inside <= 0) return -1;
    const az = Math.atan2(d.x, d.z);
    if (style === 'puff') return 0.004 + 0.004 * inside;     // pulled back flat
    // Volume: the top fills out to a rounded-square block (superellipsoid), taller than the skull and set slightly
    // forward, so the silhouette reads as a haircut. The sides stay a tight fade.
    const r = hairOuter(d);
    const q = v3.fromBufferAttribute(hp, i).length();
    const vol = Math.max(0, r - q);
    const lift = smooth(l + 0.02, l + 0.16, d.y) * smooth(0.12, 0.42, d.y);     // grows in above the fade and the hairline
    const curl = (vnoise(az * 11, d.y * 11) - 0.5) * 0.008 * lift;
    return 0.004 + 0.003 * inside + vol * lift + curl;
  }, (d, t) => {
    const top = smooth(0.42, 0.5, d.y);
    // the fade: short dark sides, a crisp step up to the black top
    c.copy(cb).lerp(cd, style === 'crop' ? 0.25 * (1 - top) : 0);
    if (style === 'crop' && t > 0.012) { const az = Math.atan2(d.x, d.z);
      c.lerp(cd, smooth(0.55, 0.85, vnoise(az * 26, d.y * 30)) * 0.7 * top); }
    return c.clone();
  });
  hairs.set(k, geo);
  return geo;
}

/** A curly puff: a bumpy ball (high on the back of the head). */
export function puffGeometry(r = 0.13) {
  const g0 = new THREE.IcosahedronGeometry(r, 5);
  g0.deleteAttribute('normal'); g0.deleteAttribute('uv');
  const g = mergeVertices(g0, 1e-6);
  const p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const d = v.clone().normalize();
    const az = Math.atan2(d.x, d.z);
    const bump = (vnoise(az * 7 + 3, d.y * 7) - 0.5) * 0.035 + (vnoise(az * 15, d.y * 15) - 0.5) * 0.012;
    v.copy(d).multiplyScalar(r * (1 + bump / r * r * 6));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
