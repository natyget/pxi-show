// Speech mouths for the Nio World rig. engine/tools/lipsync.py turns a voice line (audio + its text) into cues,
// one of eight cartoon mouths per moment (named as Rhubarb Lip Sync names them); this file draws each one with
// the rig's own mouth numbers (nw3d/face.ts: w, curve, open, teeth, tongue). The expression keeps its own curve
// and skew, so a smug line is still smug while it talks. Shapes snap, never tween: the show is on twos.
import { Face, Mouth } from '../nw3d/face';

export type Shape = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X';
export type Cues = { fps: number; frames: number; cues: [number, Shape][] };

// teeth: 1 = top row, 2 = both rows. open is the depth of the open mouth; under 0.03 draws a closed line.
export const SHAPES: Record<Exclude<Shape, 'X'>, Partial<Mouth>> = {
  A: { w: 0.1, open: 0, teeth: 0, tongue: 0 },          // M B P: lips pressed
  B: { w: 0.13, open: 0.06, teeth: 2, tongue: 0 },        // most consonants, EE: teeth together
  C: { w: 0.16, open: 0.15, teeth: 1, tongue: 0 },        // EH, AE: open
  D: { w: 0.19, open: 0.3, teeth: 1, tongue: 1 },        // AA, I: wide open
  E: { w: 0.1, open: 0.13, teeth: 0, tongue: 0 },         // AO, ER, R: rounded
  F: { w: 0.06, open: 0.09, teeth: 0, tongue: 0 },        // OO, OW, W: puckered
  G: { w: 0.11, open: 0.045, teeth: 1, tongue: 0 },       // F V: top teeth on the lip
  H: { w: 0.14, open: 0.14, teeth: 1, tongue: 1 },        // L: tongue up behind the teeth
};

export const shapeAt = (c: Cues | undefined, frame: number): Shape => {
  if (!c || frame < 0 || frame >= c.frames) return 'X';
  let s: Shape = 'X';
  for (const [f, sh] of c.cues) { if (f > frame) break; s = sh; }
  return s;
};

// The face with its mouth speaking. `size` scales the mouth for a character (1 = Nio). X keeps the expression's own mouth.
// `lead`: the mouth arrives this many frames before the sound, as animators time it, so it never reads late.
export const lips = (face: Face, c: Cues | undefined, frame: number, size = 1, lead = 1): Face => {
  const s = shapeAt(c, frame + lead);
  if (s === 'X') return face;
  const m = SHAPES[s];
  return { ...face, mouth: { ...face.mouth, ...m, w: (m.w ?? 0) * size, open: (m.open ?? 0) * size, curve: face.mouth.curve * 0.6 } };
};
