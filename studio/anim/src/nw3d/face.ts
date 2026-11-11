// The drawn face. It is painted onto the 3D head by the renderer, so it turns with the head and anything in
// front of it covers it. Every look is numbers, so any two looks blend, and nothing off-model can be drawn.
// The style: large simple eyes, never quite the same size, pupils off-centre, a small mouth, no nose.
export type Eye = { open: number; low: number; tilt: number; px: number; py: number; ps: number; wide: number; arc: number };
export type Brow = { y: number; rot: number; bend: number };
export type Mouth = { w: number; curve: number; open: number; teeth: number; tongue: number; skew: number; wobble: number };
export type Face = { eyeL: Eye; eyeR: Eye; browL: Brow; browR: Brow; mouth: Mouth; blush: number; gloom: number; stretch: number; tear: number };

const E = (p: Partial<Eye> = {}): Eye => ({ open: 1, low: 0, tilt: 0, px: 0.6, py: 0, ps: 1, wide: 1, arc: 0, ...p });
const B = (p: Partial<Brow> = {}): Brow => ({ y: 0, rot: 0, bend: 0.4, ...p });
const M = (p: Partial<Mouth> = {}): Mouth => ({ w: 0.065, curve: 0.01, open: 0, teeth: 0, tongue: 0, skew: 0, wobble: 0, ...p });
const F = (e: Partial<Eye>, b: Partial<Brow>, m: Partial<Mouth>, x: Partial<Face> = {}): Face => ({
  eyeL: E(e), eyeR: E(e), browL: B(b), browR: B(b), mouth: M(m), blush: 0, gloom: 0, stretch: 1, tear: 0, ...x,
});
// eye.open 0 shut .. 1 round; tilt and brow.rot: + angry, - worried (degrees); arc 1 = happy closed, -1 = asleep.
export const FACES: Record<string, Face> = {
  neutral: F({}, {}, {}),
  deadpan: F({ open: 0.7 }, { y: -0.03 }, { w: 0.07 }),
  smug: F({ open: 0.6 }, { y: -0.02 }, { w: 0.1, curve: 0.07, skew: 0.8 }, { browL: B({ y: 0.05, rot: -4 }) }),
  hyped: F({ wide: 1.06 }, { y: 0.08, bend: 1 }, { w: 0.15, curve: 0.08, open: 0.2, teeth: 1 }, { stretch: 1.03 }),
  shock: F({ wide: 1.1, ps: 0.55, px: 0.2 }, { y: 0.1, bend: 1 }, { w: 0.045, open: 0.1, curve: 0 }, { stretch: 1.05 }),
  crushed: F({ open: 0.92, low: 0.12, ps: 1.1, py: -0.35 }, { y: 0.0, rot: -18 }, { w: 0.1, wobble: 1, curve: -0.02 }, { tear: 1 }),
  suspicious: F({ open: 0.48, low: 0.18, px: 0.85 }, { y: -0.07, rot: 8 }, { w: 0.06, curve: -0.03 }),
  laughing: F({ arc: 1 }, { y: 0.04 }, { w: 0.15, curve: 0.08, open: 0.2, teeth: 1, tongue: 1 }, { blush: 1 }),
  rage: F({ open: 0.72, tilt: 16, ps: 0.8, px: 0.3 }, { y: -0.1, rot: 22, bend: 0 }, { w: 0.13, open: 0.14, teeth: 2, curve: -0.02 }),
  sheepish: F({ open: 0.56, py: -0.2 }, { y: -0.02, rot: -12 }, { w: 0.09, wobble: 1 }, { blush: 1 }),
  deadInside: F({ open: 0.5, ps: 0.75, px: 0.1 }, { y: -0.06, bend: 0 }, {}, { gloom: 1 }),
  charm: F({ open: 0.62, low: 0.12 }, { y: 0.0 }, { w: 0.1, curve: 0.09 }, { browL: B({ y: 0.06, rot: -3 }) }),
  real: F({ open: 0.88, py: -0.3 }, { y: 0.0, rot: -9 }, { w: 0.07, curve: -0.02 }),
  asleep: F({ arc: -1 }, { y: -0.04 }, { w: 0.04 }),
};
export const gaze = (f: Face, px: number, py: number): Face => ({ ...f, eyeL: { ...f.eyeL, px, py }, eyeR: { ...f.eyeR, px, py } });
export const blink = (f: Face): Face => ({ ...f, eyeL: { ...f.eyeL, arc: -1 }, eyeR: { ...f.eyeR, arc: -1 } });
// the 36 numbers the renderer reads
export const faceArr = (f: Face): number[] => {
  const e = (x: Eye) => [x.open, x.low, x.tilt, x.px, x.py, x.ps, x.wide, x.arc];
  const b = (x: Brow) => [x.y, x.rot, x.bend];
  const m = f.mouth;
  return [...e(f.eyeL), ...e(f.eyeR), ...b(f.browL), ...b(f.browR), m.w, m.curve, m.open, m.teeth, m.tongue, m.skew, m.wobble, f.blush, f.gloom, f.stretch, f.tear, 0, 0, 0];
};
