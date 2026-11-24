import { Face } from './NioHead';

// Nio's face library. Every look is plain numbers, so any two can be blended and new ones are one line.
// eye.open: 0 shut .. 1 round. eye.tilt and brow.rot: + angry, - worried. px/py: where he looks (-1..1).
export const FACES: Record<string, Face> = {
  deadpan: { mouth: 'flat', eyeL: { open: 0.66 }, eyeR: { open: 0.66 } },
  smug: { mouth: 'smirk', eyeL: { open: 0.55 }, eyeR: { open: 0.55 }, browL: { y: -7, rot: -3 }, browR: { y: 1, rot: 4 } },
  hyped: { mouth: 'laugh', mouthS: 1.15, eyeL: { open: 1, wide: 1.15 }, eyeR: { open: 1, wide: 1.15 }, browL: { y: -12, bend: 1 }, browR: { y: -12, bend: 1 }, stretch: 1.05 },
  shock: { mouth: 'o', eyeL: { open: 1, wide: 1.28, ps: 0.42 }, eyeR: { open: 1, wide: 1.28, ps: 0.42 }, browL: { y: -16, bend: 1.1 }, browR: { y: -16, bend: 1.1 }, stretch: 1.09 },
  crushed: { mouth: 'wobble', eyeL: { open: 0.92, low: 0.22, ps: 1.3, py: 0.5 }, eyeR: { open: 0.92, low: 0.22, ps: 1.3, py: 0.5 }, browL: { y: -5, rot: -20 }, browR: { y: -5, rot: -20 }, tear: true, stretch: 0.96 },
  suspicious: { mouth: 'pout', eyeL: { open: 0.4, low: 0.35, px: 0.8 }, eyeR: { open: 0.62, px: 0.8 }, browL: { y: 5, rot: 12 }, browR: { y: -8, rot: -4 } },
  laughing: { mouth: 'laugh', mouthS: 1.2, eyeL: { arc: 'happy' }, eyeR: { arc: 'happy' }, browL: { y: -8 }, browR: { y: -8 }, stretch: 0.96, blush: true },
  rage: { mouth: 'grit', eyeL: { open: 0.62, tilt: 14, ps: 0.7 }, eyeR: { open: 0.62, tilt: 14, ps: 0.7 }, browL: { y: 8, rot: 20, bend: 0.1 }, browR: { y: 8, rot: 20, bend: 0.1 } },
  sheepish: { mouth: 'ee', eyeL: { open: 0.85, px: -0.8, py: -0.2 }, eyeR: { open: 0.85, px: -0.8, py: -0.2 }, browL: { y: -8, rot: -14 }, browR: { y: -8, rot: -14 }, sweat: true },
  deadInside: { mouth: 'flat', eyeL: { open: 0.5, ps: 0.6 }, eyeR: { open: 0.5, ps: 0.6 }, browL: { y: 2, bend: 0.1 }, browR: { y: 2, bend: 0.1 }, gloom: true },
  charm: { mouth: 'smile', eyeL: { open: 0.5, low: 0.2 }, eyeR: { open: 0.5, low: 0.2 }, browL: { y: -9, rot: -2 }, browR: { y: -3 } },
  real: { mouth: 'mm', eyeL: { open: 0.8, py: 0.3 }, eyeR: { open: 0.8, py: 0.3 }, browL: { y: -3, rot: -9 }, browR: { y: -3, rot: -9 } },
};

const isNum = (v: unknown): v is number => typeof v === 'number';
// Blend two faces or two poses. Numbers move; names (mouth shape, hand shape, flags) switch at the halfway point.
export function mix<T>(a: T, b: T, t: number): T {
  if (isNum(a) && isNum(b)) return (a + (b - a) * t) as unknown as T;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mix(v, b[i], t)) as unknown as T;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const out: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    keys.forEach((k) => {
      const x = (a as Record<string, unknown>)[k], y = (b as Record<string, unknown>)[k];
      if (x === undefined || y === undefined) {
        const d = isNum(x ?? y) ? DEFAULTS[k] : undefined;
        out[k] = d !== undefined ? mix((x ?? d) as number, (y ?? d) as number, t) : t < 0.5 ? x : y;
      } else out[k] = mix(x, y, t);
    });
    return out as T;
  }
  return t < 0.5 ? a : b;
}
const DEFAULTS: Record<string, number> = { open: 0.7, low: 0, tilt: 0, px: 0, py: 0, ps: 1, wide: 1, y: 0, rot: 0, bend: 0.5, mouthS: 1, stretch: 1, headRot: 0, headDx: 0, headDy: 0, lean: 0, handNRot: 90, handFRot: 90 };

// A timeline of holds. Each key is [frame, value]. The move into a key takes `move` frames and overshoots a little,
// then the pose holds dead still until the next key. No idle bobbing, ever.
export function track<T>(frame: number, keys: [number, T][], move = 4): T {
  let i = 0;
  while (i + 1 < keys.length && frame >= keys[i + 1][0]) i++;
  if (i === 0) return keys[0][1];
  const t = Math.min(1, (frame - keys[i][0] + 1) / move);
  const e = t >= 1 ? 1 : 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.12; // ease out with a small overshoot
  return mix(keys[i - 1][1], keys[i][1], e);
}
