// Sculpted meshes: one head, one hair shell per hairstyle. Built the way stylized game hair is modelled:
// a single shell that follows the skull, thicker where the hair has volume, with a clean hairline. No primitives stacked up.
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Weld the sphere's seam so normals (and the ink outline) are continuous. */
const weld = (g: THREE.BufferGeometry) => { g.deleteAttribute('normal'); g.deleteAttribute('uv'); const m = mergeVertices(g, 1e-5); m.computeVertexNormals(); return m; };

export const HEAD_R = 0.17;
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n2 = (x: number, y: number) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (n2(xi, yi) * (1 - u) + n2(xi + 1, yi) * u) * (1 - v) + (n2(xi, yi + 1) * (1 - u) + n2(xi + 1, yi + 1) * u) * v;
};

/** The skull: rounder at the back, narrower jaw, a small chin, slight cheeks. Faces +z. */
export function headGeometry() {
  const g = new THREE.SphereGeometry(HEAD_R, 56, 40);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = v.clone().normalize();
    let { x, y, z } = v;
    if (d.y < 0) {                                   // jaw: narrower towards the chin, chin a touch forward
      const k = Math.pow(-d.y, 1.3);
      x *= 1 - 0.2 * k;
      z *= 1 - 0.08 * k;
      if (d.z > 0) z += 0.018 * k * d.z;
      y *= 1 + 0.06 * k;                             // a little longer face
    }
    if (d.z < 0) { z *= 1.04; y *= 1.02; }           // fuller back of the head
    const cheek = Math.exp(-Math.pow((d.y + 0.25) / 0.18, 2)) * Math.max(0, d.z) * Math.abs(d.x);
    x += Math.sign(x) * 0.006 * cheek;
    p.setXYZ(i, x, y * 1.06, z * 0.95);
  }
  return weld(g);
}

type Style = 'crop' | 'bob';
/**
 * A hair shell over the head. thickness(d) > 0 inside the hair, tapering to 0 at the hairline; outside it the shell sinks
 * under the skin (hidden). Vertex colours carry the fade (darker sides) and strand shading.
 */
export function hairGeometry(style: Style, base: string, dark: string) {
  const g = new THREE.SphereGeometry(HEAD_R, 72, 52);
  const p = g.attributes.position as THREE.BufferAttribute;
  const cols = new Float32Array(p.count * 3);
  const cb = new THREE.Color(base), cd = new THREE.Color(dark), c = new THREE.Color();
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = v.clone().normalize();
    const az = Math.atan2(d.x, d.z);                 // 0 = front, ±π = back
    const a = Math.abs(az) / Math.PI;                // 0 front .. 1 back
    let t = -0.02, out = new THREE.Vector3(), fade = 0;
    if (style === 'crop') {
      // hairline height: high on the forehead, above the ears on the sides, low at the nape
      const line = a < 0.5 ? 0.68 - 1.24 * a : 0.06 - 0.8 * (a - 0.5);
      const inside = smooth(line - 0.01, line + 0.06, d.y);
      if (inside > 0) {
        const top = smooth(0.2, 0.75, d.y);                         // volume on top
        const front = smooth(0.42, 0.04, a) * smooth(line, line + 0.12, d.y) * smooth(0.98, 0.75, d.y); // the quiff zone
        const tex = (vnoise(az * 5, d.y * 7) - 0.5) * 0.008 * top;
        t = 0.006 + (0.022 * top + 0.05 * front + tex) * inside;
        t = 0.003 + (t - 0.003) * inside;
        out.set(0, 1, 0.5).multiplyScalar(0.04 * front * inside);  // push the front up and slightly forward
        fade = 0.85 * (1 - smooth(0.2, 0.55, d.y));                          // darker faded sides
      }
    } else {
      // bob: hairline on the forehead with a side part; hangs to the jaw at the sides and back
      const faceHole = a < 0.27 && d.y < 0.42;
      const line = a < 0.27 ? 0.42 : -0.78;
      if (!faceHole && d.y > line - 0.05) {
        const inside = a < 0.27 ? smooth(0.4, 0.5, d.y) : smooth(-0.8, -0.7, d.y) * smooth(0.2, 0.3, a);
        const swell = smooth(0.4, -0.5, d.y) * smooth(0.2, 0.5, a);   // the bob flares out lower down
        t = 0.004 + (0.018 + 0.03 * swell) * inside;
        out.set(d.x, 0, d.z).normalize().multiplyScalar(0.018 * swell * inside);
        if (a < 0.4 && d.y > 0.35) out.y += 0.006;
        fade = 0.25 * (1 - smooth(-0.6, 0.6, d.y));
      }
    }
    const pos = d.clone().multiplyScalar(HEAD_R + t).add(out);
    // follow the head's own shaping roughly (same stretch as headGeometry's final step)
    p.setXYZ(i, pos.x * 1.01, pos.y * 1.06, pos.z * 0.97 + (d.z < 0 ? -0.004 : 0));
    const strand = 0.06 * Math.sin(az * 26 + d.y * 4);
    c.copy(cb).lerp(cd, Math.min(1, fade + Math.max(0, strand)));
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return weld(g);
}
