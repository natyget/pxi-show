// Find a camera for a set that frames every listed mark ('in') and sees each face (facesCamera), closest to a wanted
// position. Usage: node out/fitcam.js <set> <wantS,wantY,wantZ> <fov> <mark[:who][:yaw]> ...  (yaw: the way he faces, deg)
import { SETS, framing, facesCamera, CHARACTERS } from '../src/nw3d/world';
import { C } from '../src/nw3d/room';
const [setN, want, fovA, ...ms] = process.argv.slice(2);
const set = SETS[setN]; const [ws, wy, wz] = want.split(',').map(Number); const fovs = fovA.split(',').map(Number);
const marks = ms.map((m) => { const [n, who, yaw] = m.split(':'); const mk = set.marks[n]; return { n, mk: { ...mk, who }, ch: who ? CHARACTERS[who] : undefined, yaw: yaw !== undefined && yaw !== '' ? +yaw : undefined }; });
const head = marks.map((m) => [m.mk.s, (m.mk.seat !== undefined ? m.mk.seat + 0.8 : 1.4) + (m.mk.on ?? 0), m.mk.z]);
const at = [0, 1, 2].map((i) => head.reduce((a, h) => a + h[i], 0) / head.length) as [number, number, number];
at[1] -= 0.1;
let best: [number, string] | null = null;
for (let s = 0.2; s <= set.room[0] - 0.2; s += 0.1) for (let z = 0.2; z <= set.room[2] - 0.2; z += 0.1) for (const y of [wy - 0.3, wy, wy + 0.3]) for (const fov of fovs) {
  const cam = C([s, y, z], at, fov);
  if (!marks.every((m) => framing(cam, m.mk as never, m.ch) === 'in' && (m.yaw === undefined || facesCamera(cam, m.mk, m.yaw)))) continue;
  if (set.solids.some((o) => s > o.s[0] - 0.2 && s < o.s[1] + 0.2 && z > o.z[0] - 0.2 && z < o.z[1] + 0.2)) continue;
  const d = Math.hypot(s - ws, (y - wy) * 2, z - wz) + fov * 0.005;
  if (!best || d < best[0]) best = [d, `C([${s.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}], [${at.map((v) => v.toFixed(2)).join(', ')}], ${fov})`];
}
console.log(best ? best[1] : 'NONE');
