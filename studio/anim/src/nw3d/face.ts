// The drawn face. It is painted onto the 3D head by the renderer, so it turns with the head and anything in
// front of it covers it. Every look is numbers, so any two looks blend, and nothing off-model can be drawn.
// The style: large simple eyes with a heavy line, never quite the same size; a big tall pupil that sits off to one side;
// no nose; no mouth at rest. A feeling is carried by the lids, the pupils, the brows and a small sign in the air
// beside the head (! or !!), never by stretching the face. Subtle, but telling.
export type Eye = { open: number; low: number; tilt: number; px: number; py: number; ps: number; wide: number; arc: number };
export type Brow = { y: number; rot: number; bend: number };
export type Mouth = { w: number; curve: number; open: number; teeth: number; tongue: number; skew: number; wobble: number };
export type Face = { eyeL: Eye; eyeR: Eye; browL: Brow; browR: Brow; mouth: Mouth; blush: number; gloom: number; stretch: number; tear: number; mark: number };

const E = (p: Partial<Eye> = {}): Eye => ({ open: 1, low: 0, tilt: 0, px: 0.9, py: 0, ps: 1, wide: 1, arc: 0, ...p });
const B = (p: Partial<Brow> = {}): Brow => ({ y: 0, rot: 0, bend: 0.2, ...p });
const M = (p: Partial<Mouth> = {}): Mouth => ({ w: 0, curve: 0, open: 0, teeth: 0, tongue: 0, skew: 0, wobble: 0, ...p });
const F = (e: Partial<Eye>, b: Partial<Brow>, m: Partial<Mouth>, x: Partial<Face> = {}): Face => ({
  eyeL: E(e), eyeR: E(e), browL: B(b), browR: B(b), mouth: M(m), blush: 0, gloom: 0, stretch: 1, tear: 0, mark: 0, ...x,
});
// eye.open: 1 whole, lower brings a straight lid down. low: the bottom lid up. tilt and brow.rot: + angry, - worried
// (degrees). px, py: where the pupil sits, -1..1. ps: pupil size. arc: 1 = shut in a happy arch, -1 = asleep.
// mouth.w 0 = no mouth. blush 1 = cheeks, 2 = cheeks with hatching. mark: 1 = !, 2 = !!, 3 = a burst of ticks.
export const FACES: Record<string, Face> = {
  neutral: F({}, {}, {}),
  deadpan: F({ open: 0.74 }, {}, {}),
  smug: F({ open: 0.6, px: 0.95 }, { y: -0.015, rot: 5, bend: 0 }, { w: 0.055, curve: 0.025, skew: 1 }, { browR: B({ y: 0.085, rot: -4, bend: 1 }) }),
  hyped: F({ px: 0.55 }, { y: 0.04, bend: 0.9 }, { w: 0.2, curve: 0.05, open: 0.17, teeth: 1 }, { mark: 3 }),
  shock: F({ ps: 0.46, px: 0.6 }, { y: 0.03, bend: 0.6 }, { w: 0.05 }, { mark: 2 }),
  uneasy: F({ px: 0.85 }, { rot: -16, y: -0.015 }, {}, { mark: 1 }),
  crushed: F({ ps: 0.8, px: 0, py: -0.1 }, { rot: -16, y: -0.01 }, { w: 0.04, open: 0.06 }, { tear: 1 }),
  suspicious: F({ open: 0.52, low: 0.18, px: 1 }, { y: -0.01, rot: 7 }, { w: 0.045, curve: -0.015 }),
  laughing: F({ arc: 1 }, { y: 0.0, bend: 1 }, { w: 0.25, curve: 0.05, open: 0.2, teeth: 1 }, { blush: 1 }),
  rage: F({ open: 0.66, low: 0.1, tilt: 20, ps: 0.85, px: 0.35 }, { y: -0.04, rot: 22, bend: 0 }, { w: 0.23, open: 0.3, teeth: 1, tongue: 1, curve: -0.02 }),
  sheepish: F({ open: 0.56, px: 0.95, py: -0.2 }, { rot: -12, y: -0.01 }, { w: 0.05 }, { blush: 2 }),
  deadInside: F({ open: 0.5, ps: 0.75, px: 0.15 }, { bend: 0 }, {}, { gloom: 1 }),
  charm: F({ open: 0.66, low: 0.08, px: 0.4 }, {}, { w: 0.12, curve: 0.06 }, { browR: B({ y: 0.07, rot: -4, bend: 1 }) }),
  real: F({ open: 0.96, ps: 0.85, px: 0.25, py: -0.15 }, { rot: -9, y: -0.01 }, { w: 0.05 }),
  asleep: F({ arc: -1 }, {}, {}),
};
export const gaze = (f: Face, px: number, py: number): Face => ({ ...f, eyeL: { ...f.eyeL, px, py }, eyeR: { ...f.eyeR, px, py } });
export const blink = (f: Face): Face => ({ ...f, eyeL: { ...f.eyeL, arc: -1 }, eyeR: { ...f.eyeR, arc: -1 } });
// the 36 numbers the renderer reads
export const faceArr = (f: Face): number[] => {
  const e = (x: Eye) => [x.open, x.low, x.tilt, x.px, x.py, x.ps, x.wide, x.arc];
  const b = (x: Brow) => [x.y, x.rot, x.bend];
  const m = f.mouth;
  return [...e(f.eyeL), ...e(f.eyeR), ...b(f.browL), ...b(f.browR), m.w, m.curve, m.open, m.teeth, m.tongue, m.skew, m.wobble, f.blush, f.gloom, f.stretch, f.tear, f.mark, 0, 0];
};
