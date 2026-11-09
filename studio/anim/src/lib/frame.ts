// Shot framing from the character's actual head position, so faces are never cut by guesswork.
// Vertical 9:16. Eye-line sits at ~40% from the top (the top band holds "PART N", the bottom third holds subtitles).
export type ShotSize = 'ecu' | 'cu' | 'mcu' | 'ms' | 'mws' | 'ws';
const VIS_H: Record<ShotSize, number> = { ecu: 0.5, cu: 0.88, mcu: 0.95, ms: 1.45, mws: 2.2, ws: 3.6 };

/**
 * head: world position of the head centre (from headPos). from: angle around the head where the camera stands
 * (0 = in front of a character facing +z; use the character's yaw to keep it frontal). up: camera height above eye-line.
 * side: shift the subject off-centre (-1..1 of half the frame width) for over-the-shoulder / two-shots.
 */
export function frame(head: [number, number, number], size: ShotSize, from: number, opts: { fov?: number; up?: number; side?: number; eyeAt?: number } = {}) {
  const fov = opts.fov ?? 32, h = VIS_H[size];
  const dist = (h / 2) / Math.tan((fov / 2) * Math.PI / 180);
  const eye = [head[0], head[1] + 0.01, head[2]];
  const eyeAt = opts.eyeAt ?? (size === 'ecu' ? 0.45 : size === 'cu' ? 0.43 : size === 'mcu' ? 0.38 : 0.32);
  const aimY = eye[1] - (0.5 - eyeAt) * h;
  const w = h * (9 / 16), sideShift = (opts.side ?? 0) * w * 0.5;
  // camera right vector for this angle
  const rx = Math.cos(from), rz = -Math.sin(from);
  const at: [number, number, number] = [eye[0] - rx * sideShift, aimY, eye[2] - rz * sideShift];
  const up = opts.up ?? 0.05;
  const pos: [number, number, number] = [at[0] + Math.sin(from) * dist, aimY + up, at[2] + Math.cos(from) * dist];
  return { pos, at, fov };
}
