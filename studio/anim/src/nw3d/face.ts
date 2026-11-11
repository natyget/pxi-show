// The drawn face. It is painted onto the 3D head by the renderer, so it turns with the head and anything in
// front of it covers it. Every look is numbers, so any two looks blend.
export type Eye = { open: number; low: number; tilt: number; px: number; py: number; ps: number; wide: number; arc: number };
export type Brow = { y: number; rot: number; bend: number };
export type Mouth = { w: number; curve: number; open: number; teeth: number; tongue: number; skew: number; wobble: number };
export type Face = { eyeL: Eye; eyeR: Eye; browL: Brow; browR: Brow; mouth: Mouth; blush: number; gloom: number; stretch: number };

const E = (p: Partial<Eye> = {}): Eye => ({ open: 0.68, low: 0, tilt: 0, px: 0, py: 0, ps: 1, wide: 1, arc: 0, ...p });
const B = (p: Partial<Brow> = {}): Brow => ({ y: 0, rot: 0, bend: 0.5, ...p });
const M = (p: Partial<Mouth> = {}): Mouth => ({ w: 0.2, curve: 0.02, open: 0, teeth: 0, tongue: 0, skew: 0, wobble: 0, ...p });
const F = (e: Partial<Eye>, b: Partial<Brow>, m: Partial<Mouth>, x: Partial<Face> = {}): Face => ({
  eyeL: E(e), eyeR: E(e), browL: B(b), browR: B(b), mouth: M(m), blush: 0, gloom: 0, stretch: 1, ...x,
});
// eye.open 0 shut .. 1 round; tilt and brow.rot: + angry, - worried (degrees); arc 1 = happy closed, -1 = shut.
export const FACES: Record<string, Face> = {
  deadpan: F({ open: 0.66 }, {}, {}),
  smug: F({ open: 0.55 }, { y: 0.02 }, { w: 0.22, curve: 0.09, skew: 0.7 }, { browL: B({ y: 0.07, rot: -3 }) }),
  hyped: F({ open: 1, wide: 1.12 }, { y: 0.12, bend: 1 }, { w: 0.3, curve: 0.1, open: 0.36, teeth: 1, tongue: 1 }, { stretch: 1.04 }),
  shock: F({ open: 1, wide: 1.25, ps: 0.42 }, { y: 0.16, bend: 1.1 }, { w: 0.075, open: 0.15, curve: 0 }, { stretch: 1.08 }),
  crushed: F({ open: 0.92, low: 0.22, ps: 1.3, py: -0.5 }, { y: 0.05, rot: -20 }, { w: 0.24, wobble: 1, curve: -0.02 }),
  suspicious: F({ open: 0.5, low: 0.3 }, { y: -0.04, rot: 10 }, { w: 0.1, curve: -0.05 }, { eyeR: E({ open: 0.34, low: 0.35 }), browL: B({ y: 0.08, rot: -4 }) }),
  laughing: F({ arc: 1 }, { y: 0.08 }, { w: 0.32, curve: 0.1, open: 0.4, teeth: 1, tongue: 1 }, { blush: 1, stretch: 0.97 }),
  rage: F({ open: 0.62, tilt: 14, ps: 0.7 }, { y: -0.08, rot: 20, bend: 0.1 }, { w: 0.26, open: 0.15, teeth: 2, curve: -0.01 }),
  sheepish: F({ open: 0.85 }, { y: 0.08, rot: -14 }, { w: 0.26, curve: 0.08, open: 0.13, teeth: 2 }),
  deadInside: F({ open: 0.5, ps: 0.6 }, { y: -0.02, bend: 0.1 }, {}, { gloom: 1 }),
  charm: F({ open: 0.5, low: 0.2 }, { y: 0.03 }, { w: 0.26, curve: 0.14 }, { browL: B({ y: 0.09, rot: -2 }) }),
  real: F({ open: 0.8, py: -0.3 }, { y: 0.03, rot: -9 }, { w: 0.14, curve: -0.02 }),
};
export const gaze = (f: Face, px: number, py: number): Face => ({ ...f, eyeL: { ...f.eyeL, px, py }, eyeR: { ...f.eyeR, px, py } });
export const blink = (f: Face): Face => ({ ...f, eyeL: { ...f.eyeL, arc: -1 }, eyeR: { ...f.eyeR, arc: -1 } });
