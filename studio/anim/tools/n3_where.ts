// n3_where <set> <camera> s,y,z ... : where each point lands in that camera's picture (x from the left, y from the top, 0..1), and how far.
// For placing cameras: run it on the heads you want in the shot.
import { SETS } from '../src/nw3d/world';
import { X } from '../src/nw3d/room';
const [set, cam, ...pts] = process.argv.slice(2); const c = SETS[set].cameras[cam];
const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]), dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a: number[]) => { const l = Math.hypot(...a); return a.map((v) => v / l); }, cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const F = norm(sub(c.at, c.pos)), R = norm(cross(F, [0, 1, 0])), U = cross(R, F), ty = Math.tan((c.fov * Math.PI) / 360);
for (const p of pts) { const [s, y, z] = p.split(',').map(Number), d = sub([X(s), y, z], c.pos); const zc = dot(d, F);
  console.log(p, 'x', ((dot(d, R) / zc / (ty * 180 / 320)) * 0.5 + 0.5).toFixed(2), 'y(from top)', (0.5 - (dot(d, U) / zc / ty) * 0.5).toFixed(2), 'dist', zc.toFixed(2)); }
