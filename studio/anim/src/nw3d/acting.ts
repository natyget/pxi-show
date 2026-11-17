// THE ACTING PASS. How a character performs a line, the way a TV cartoon animator would block it.
//
// Before this, every sitting or standing character ran a looping game mocap clip (Sitting_Talking_Loop and friends):
// legs shuffled under desks, hands waved on a cycle, and nothing landed on a word. That is the "NPC" feel. A cartoon is
// the opposite: STRONG HELD POSES, and a snap from one to the next on the word that matters.
//
// The rules, from the dialogue-animation craft (bible/acting.md has the sources and the reasons):
//  1. The lower body is a still drawing. Seated, nothing below the belt moves. Standing, the feet are planted.
//  2. Thought drives the pose, not syllables. A line gets ONE pose change, landing on its key word (the "main" accent
//     from engine/tools/accents.py). Every other stressed syllable gets only a head dip and a brow lift.
//  3. The move: 2 frames of anticipation the other way, 4 frames to an overshoot, 4 frames to settle, then HOLD.
//  4. A held pose is not dead: the eyes blink, and the body drifts a hair over the hold (a moving hold). No loops.
//  5. Blinks carry thought: on every change of face, at the start of every pose change, and once in a long hold.
//  6. The listener holds. He blinks when the other line lands and changes face when the board says so. The pose follows
//     his face, so a reaction is a whole-body reaction.
//  7. The attitude (lean, tilt, shoulders) comes from the face; the gesture (hands) from the face too, unless the board
//     names one. Deadpan and dead-inside faces get no hands at all: stillness is the joke.
//  8. A character holding something (a phone, a ticket, a pen) keeps his hands on it; he acts with the head and body.
// 10. The face stays readable. A head never drops so far that the camera loses the eyes: the face does the sadness.
// Everything moves on twos, like drawn animation.
import { Face } from './face';
import { Cues } from '../lips/mouths';

export type Gesture = 'rest' | 'offer' | 'shrug' | 'chest' | 'dismiss' | 'fists' | 'chin' | 'neck' | 'point' | 'palms';
export const GESTURES: Gesture[] = ['rest', 'offer', 'shrug', 'chest', 'dismiss', 'fists', 'chin', 'neck', 'point', 'palms'];
// The body's attitude: lean (+ forward, radians), nod (+ chin down), tilt (+ toward his right shoulder), shoulders (+ up, metres)
export type Attitude = { lean: number; nod: number; tilt: number; shoulders: number; g: Gesture };
export const ATTITUDE: Record<string, Attitude> = {
  neutral:    { lean: 0.03, nod: 0, tilt: 0, shoulders: 0, g: 'offer' },
  deadpan:    { lean: 0, nod: 0.02, tilt: 0, shoulders: -0.005, g: 'rest' },
  deadInside: { lean: 0.06, nod: 0.04, tilt: 0.05, shoulders: -0.02, g: 'rest' },
  smug:       { lean: -0.16, nod: -0.1, tilt: 0.1, shoulders: 0, g: 'dismiss' },
  hyped:      { lean: 0.16, nod: -0.06, tilt: 0, shoulders: 0.02, g: 'fists' },
  shock:      { lean: -0.2, nod: -0.08, tilt: 0, shoulders: 0.04, g: 'palms' },
  uneasy:     { lean: -0.06, nod: 0.02, tilt: -0.08, shoulders: 0.03, g: 'neck' },
  crushed:    { lean: 0.1, nod: 0.05, tilt: 0.06, shoulders: -0.03, g: 'rest' },
  suspicious: { lean: 0.1, nod: 0.02, tilt: -0.12, shoulders: 0, g: 'chin' },
  laughing:   { lean: -0.18, nod: -0.16, tilt: 0.08, shoulders: 0.02, g: 'chest' },
  rage:       { lean: 0.2, nod: 0.06, tilt: 0, shoulders: 0.035, g: 'fists' },
  sheepish:   { lean: 0.04, nod: 0.03, tilt: 0.1, shoulders: 0.025, g: 'neck' },
  charm:      { lean: 0.06, nod: -0.03, tilt: 0.12, shoulders: 0, g: 'offer' },
  real:       { lean: 0.08, nod: 0.02, tilt: 0.04, shoulders: 0, g: 'chest' },
  asleep:     { lean: 0, nod: 0, tilt: 0, shoulders: 0, g: 'rest' },
};
const QUIET = new Set(['deadpan', 'deadInside', 'asleep']); // no brow lifts, no hands: stillness is the joke

export type Accents = { frames: number; accents: [number, number][]; main: number | null };
// What the board may say about the performance (ActorSpec.act). Left out, the face and the voice decide.
//  g: [frame, gesture] keys to override the gesture (frame inside the shot). 'rest' keeps the hands down.
//  still: true for a held, frozen performance (a reaction shot that is a picture joke): blinks only.
export type ActSpec = { g?: [number, Gesture][]; still?: boolean } | false;

// The performance for one frame. Skeleton numbers are applied by room.ts pose().
export type Perf = {
  lean: number; nod: number; tilt: number; shoulders: number;
  from: Gesture; to: Gesture; amt: number; // the hands: a blend from one gesture to the next (amt may overshoot past 1)
  blink: number; // 0 open, 0.5 half, 1 shut
  brow: number; // added brow lift
  hands: boolean; // false while he holds something: the head and body act alone
};

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
// The cartoon snap: from 0 to 1 over 10 frames, starting `k` frames before the beat. Anticipation dips below 0, the
// move overshoots past 1, and it settles.
const snap = (f: number, beat: number): number => {
  const t = f - (beat - 6); // starts 6 frames before the beat: 2 anticipation, 4 travel (arrives on the beat)
  if (t < 0) return 0;
  if (t < 2) return -0.12 * ease(t / 2); // the anticipation: a small move the other way
  if (t < 6) return -0.12 + 1.24 * ease((t - 2) / 4); // to the overshoot, on the beat
  if (t < 10) return 1.12 - 0.12 * ease((t - 6) / 4); // and settle
  return 1;
};
const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const lerpA = (a: Attitude, b: Attitude, k: number): Attitude =>
  ({ lean: a.lean + (b.lean - a.lean) * k, nod: a.nod + (b.nod - a.nod) * k, tilt: a.tilt + (b.tilt - a.tilt) * k, shoulders: a.shoulders + (b.shoulders - a.shoulders) * k, g: k >= 0.5 ? b.g : a.g });

export type ActInput = {
  who: string; frames: number; frame: number;
  faces: [number, string][]; // the board's face keys
  speak?: [number, Cues][]; acc?: [number, Accents][]; // his lines in this shot: [start frame, cues/accents]
  heard?: [number, Accents][]; // the other people's lines in this shot
  holding: boolean; act?: ActSpec;
};

export const perform = (p: ActInput): Perf => {
  const f = Math.floor(p.frame / 2) * 2; // on twos
  const quietFace = (fr: number) => { const k = [...p.faces].reverse().find(([at]) => fr >= at) ?? p.faces[0]; return k[1]; };
  const still = p.act && p.act.still;
  // ---- the beats where the BODY changes pose ----
  // each face change is a beat (the reaction), and each line's main accent is a beat (the key word)
  type Beat = { at: number; face: string; g?: Gesture; spoken: boolean };
  const beats: Beat[] = [{ at: -100, face: p.faces[0][1], spoken: false }];
  p.faces.slice(1).forEach(([at, fc]) => beats.push({ at: at + 2, face: fc, spoken: false })); // the face goes first, the body 2 frames after
  (p.acc ?? []).forEach(([start, a]) => { if (a.main !== null) { const at = start + a.main; beats.push({ at, face: quietFace(at), spoken: true }); } });
  beats.sort((a, b) => a.at - b.at);
  // the board's own gesture keys
  const gAt = (fr: number): Gesture | undefined => (p.act && p.act.g ? [...p.act.g].reverse().find(([at]) => fr >= at)?.[1] : undefined);
  const restOf = (b: Beat): Attitude => {
    const A = ATTITUDE[b.face] ?? ATTITUDE.neutral;
    // before he speaks (or when listening), the hands stay down: the gesture is saved for the key word
    const g = gAt(b.at) ?? (b.spoken && !QUIET.has(b.face) ? A.g : 'rest');
    return { ...A, g };
  };
  let cur = restOf(beats[0]), prev = cur, k = 1;
  if (!still) for (let i = 1; i < beats.length; i++) {
    const b = beats[i]; if (f < b.at - 6) break;
    prev = cur; cur = restOf(b); k = snap(f, b.at);
    if (k >= 1) prev = cur;
  }
  const att = k >= 1 ? cur : lerpA(prev, cur, k);
  const amt = cur.g === prev.g ? 1 : k;
  // ---- head accents on the other stressed syllables: a dip into the stress and back ----
  let nod = att.nod, brow = 0;
  const quiet = QUIET.has(quietFace(f));
  if (!still) (p.acc ?? []).forEach(([start, a]) => a.accents.forEach(([af, s]) => {
    const t = f - (start + af);
    if (start + af === start + (a.main ?? -999) || s < 0.5) return;
    const d = t >= -2 && t < 0 ? (t + 2) / 2 : t >= 0 && t < 6 ? 1 - t / 6 : 0; // 2 frames in, 6 frames out
    nod += 0.05 * s * d * (quiet ? 0.5 : 1); // small: the show's cameras sit a little above the eyes, so a big dip hides them under the hair
    if (!quiet) brow += 0.025 * s * d;
  }));
  // a listener acknowledges the other line's key word: a small nod, 4 frames after it
  if (!still && !quiet) (p.heard ?? []).forEach(([start, a]) => {
    if (a.main === null) return; const t = f - (start + a.main + 4);
    if (t >= 0 && t < 8) nod += 0.05 * Math.sin((t / 8) * Math.PI);
  });
  // ---- the moving hold: the body drifts a hair over the shot, never loops ----
  const drift = (f / Math.max(1, p.frames)) * 0.02 * (hash(p.who) % 2 ? 1 : -1);
  // ---- blinks: on thought changes, never in sync with anyone else ----
  const blinks: number[] = [];
  p.faces.slice(1).forEach(([at]) => blinks.push(at - 1)); // the face changes under the blink
  if (!still) beats.filter((b) => b.at > 0 && b.spoken).forEach((b) => blinks.push(b.at - 6)); // the head starts to move
  (p.heard ?? []).forEach(([start, a]) => { if (a.main !== null) blinks.push(start + a.main + 2 + (hash(p.who) % 4) * 2); }); // the other line lands (each listener a different frame later, so nobody blinks together)
  const idle = 30 + (hash(p.who) % 24); // one blink in a long hold, at a frame of his own
  if (p.frames > idle + 12 && !blinks.some((b) => Math.abs(b - idle) < 24)) blinks.push(idle);
  let blink = 0;
  blinks.forEach((b) => { const t = p.frame - b; if (t === 0 || t === 3) blink = Math.max(blink, 0.5); if (t === 1 || t === 2) blink = 1; });
  return { lean: att.lean + drift, nod, tilt: att.tilt, shoulders: att.shoulders, from: prev.g, to: cur.g, amt, blink, brow, hands: !p.holding };
};

// The face with the performance's blink and brow lift on it.
export const actFace = (face: Face, pf: Perf): Face => {
  let f = face;
  if (pf.brow) f = { ...f, browL: { ...f.browL, y: f.browL.y + pf.brow }, browR: { ...f.browR, y: f.browR.y + pf.brow } };
  if (pf.blink >= 1) f = { ...f, eyeL: { ...f.eyeL, arc: -1 }, eyeR: { ...f.eyeR, arc: -1 } };
  else if (pf.blink > 0 && f.eyeL.arc === 0) f = { ...f, eyeL: { ...f.eyeL, open: f.eyeL.open * 0.35 }, eyeR: { ...f.eyeR, open: f.eyeR.open * 0.35 } };
  return f;
};
