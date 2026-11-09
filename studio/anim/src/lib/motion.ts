// Motion helpers. Animation runs "on twos": poses update at 12 fps (the bible's jitter), the clock is in seconds.
import { spring } from 'remotion';

export const FPS = 24;
/** The animation clock: seconds, stepped to 12 fps. */
export const t12 = (frame: number) => Math.floor(frame / 2) / 12;

/** A springy 0→1 starting at `at` seconds. Presets follow the app's feel: snap (fast, tiny overshoot), pop (bouncy), sheet (soft). */
const PRESETS = {
  snap: { damping: 18, stiffness: 260, mass: 0.6 },
  pop: { damping: 10, stiffness: 180, mass: 0.7 },
  sheet: { damping: 22, stiffness: 120, mass: 1 },
  lazy: { damping: 26, stiffness: 60, mass: 1.2 },
};
export const sp = (t: number, at: number, kind: keyof typeof PRESETS = 'snap') =>
  t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: PRESETS[kind] });

/** Blend a value through keyed springs: keys = [[time, value, kind?], ...]. */
export const keys = (t: number, k: [number, number, (keyof typeof PRESETS)?][]) => {
  let v = k[0][1];
  for (let i = 1; i < k.length; i++) v += (k[i][1] - k[i - 1][1]) * sp(t, k[i][0], k[i][2] ?? 'snap');
  return v;
};

/** Blinks at the given times (each ~0.15 s). Returns lid closure 0..1. */
export const blink = (t: number, at: number[]) => {
  let c = 0;
  for (const b of at) { const d = t - b; if (d >= 0 && d < 0.17) c = Math.max(c, d < 0.085 ? 1 : 0.5); }
  return c;
};

export const breathe = (t: number, rate = 0.25) => Math.sin(t * Math.PI * 2 * rate);
/** Seeded noise in -1..1 (stable per frame). */
export const nz = (i: number, s = 0) => { const n = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return (n - Math.floor(n)) * 2 - 1; };

/** A walk cycle (on twos via t). Returns pose parts: legs, arms, body bob. speed in steps per second. */
export const walk = (t: number, steps = 1.8, amt = 1) => {
  const ph = t * Math.PI * steps;
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    legL: { hip: 0.42 * s * amt, knee: Math.max(0, -Math.sin(ph - 0.9)) * 0.75 * amt },
    legR: { hip: -0.42 * s * amt, knee: Math.max(0, Math.sin(ph - 0.9)) * 0.75 * amt },
    armL: { sx: -0.32 * s * amt, sz: 0.1, el: 0.25 + 0.15 * amt },
    armR: { sx: 0.32 * s * amt, sz: 0.1, el: 0.25 + 0.15 * amt },
    bob: Math.abs(c) * 0.025 * amt,
    twist: 0.06 * s * amt,
  };
};
