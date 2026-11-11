import MOTION from './motion.json';
import { V, add, sub, mul, dot, cross, len, norm, lerp, rotY } from './vec';

// ---------------------------------------------------------------------------------------------------------
// Motion: the Universal Animation Library (Quaternius, CC0), baked by tools/nw_bake_motion.py.
// A clip is real human movement. We keep only the DIRECTION of every bone and rebuild the figure with the
// character's own proportions, so any clip fits any character in the show.
// ---------------------------------------------------------------------------------------------------------
const JN: string[] = (MOTION as any).joints;
const CLIPS: Record<string, number[][]> = (MOTION as any).clips;
export const clipLength = (clip: string) => CLIPS[clip].length;
export type Mocap = Record<string, V> & { headUp: V; headFw: V };
export const sampleClip = (clip: string, frame: number, loop = true): Mocap => {
  const fr = CLIPS[clip];
  const n = fr.length;
  let f = loop ? ((frame % n) + n) % n : Math.max(0, Math.min(n - 1, frame));
  const i = Math.floor(f), j = loop ? (i + 1) % n : Math.min(n - 1, i + 1), t = f - i;
  const out: any = {};
  JN.forEach((name, k) => {
    out[name] = lerp([fr[i][k * 3], fr[i][k * 3 + 1], fr[i][k * 3 + 2]], [fr[j][k * 3], fr[j][k * 3 + 1], fr[j][k * 3 + 2]], t);
  });
  const o = JN.length * 3;
  out.headUp = norm(lerp([fr[i][o], fr[i][o + 1], fr[i][o + 2]], [fr[j][o], fr[j][o + 1], fr[j][o + 2]], t));
  out.headFw = norm(lerp([fr[i][o + 3], fr[i][o + 4], fr[i][o + 5]], [fr[j][o + 3], fr[j][o + 4], fr[j][o + 5]], t));
  return out;
};
export const mixMocap = (a: Mocap, b: Mocap, t: number): Mocap => {
  const out: any = {};
  Object.keys(a).forEach((k) => { out[k] = lerp((a as any)[k], (b as any)[k], t); });
  out.headUp = norm(out.headUp); out.headFw = norm(out.headFw);
  return out;
};

// ---------------------------------------------------------------------------------------------------------
// Proportions (metres). A stylised figure: big head, slim even limbs, small soft torso. About 3.6 heads tall.
// ---------------------------------------------------------------------------------------------------------
export type Props = {
  ankle: number; shin: number; thigh: number; hipHalf: number; torso: number; neck: number; headR: number;
  shoulderHalf: number; upperArm: number; foreArm: number; hand: number; foot: number;
  armR: number; legR: number; torsoR: number;
};
export const NIO: Props = {
  ankle: 0.06, shin: 0.33, thigh: 0.33, hipHalf: 0.07, torso: 0.36, neck: 0.1, headR: 0.2,
  shoulderHalf: 0.125, upperArm: 0.23, foreArm: 0.21, hand: 0.075, foot: 0.13,
  armR: 0.024, legR: 0.032, torsoR: 0.095,
};

export type Skel = {
  hips: V; neckBase: V; chestDir: V; side: V;
  headC: V; headUp: V; headFw: V; headRt: V;
  sh: [V, V]; el: [V, V]; wr: [V, V]; tip: [V, V]; thumb: [V, V];
  hip: [V, V]; kn: [V, V]; an: [V, V]; toe: [V, V];
};
const L = 0, R = 1;

export type SolveOpts = {
  stance?: number; // 1 keeps the clip's leg spread, lower pulls the legs under the body (a relaxed stand)
  ground?: boolean; // keep the lower foot on the floor
  upright?: number; // 0 keeps the clip's lean, 1 stands the spine and head straight (game clips crouch a little)
  arms?: number; // 1 keeps the clip's arm spread, lower lets the arms hang closer to the body
};
// Build the character's skeleton, in its own space (facing +z, origin on the floor), from a mocap frame.
let sideV: V = [1, 0, 0];
export const solve = (m: Mocap, P: Props = NIO, o: SolveOpts = {}): Skel => {
  const stance = o.stance ?? 1, armK = o.arms ?? 1;
  const hang = (d: V): V => { const lx = dot(d, sideV); return norm(sub(d, mul(sideV, lx * (1 - armK)))); };
  const k = (P.ankle + P.shin + P.thigh) / 0.9;
  const hips: V = [m.hips[0] * k, m.hips[1] * k, m.hips[2] * k];
  const up = o.upright ?? 0;
  const chestDir = norm(lerp(norm(sub(m.neck, m.hips)), [0, 1, 0], up));
  const neckBase = add(hips, mul(chestDir, P.torso));
  const side = norm(sub(m['upper_arm.L'], m['upper_arm.R'])); sideV = side;
  const hside = norm(sub(m['thigh.L'], m['thigh.R']));
  const headUp = norm(lerp(m.headUp, [0, 1, 0], up)), headFw = norm(sub(m.headFw, mul(headUp, dot(m.headFw, headUp))));
  const headRt = cross(headUp, headFw);
  const headC = add(neckBase, mul(headUp, P.neck + P.headR * 0.8));
  const s: any = { hips, neckBase, chestDir, side, headC, headUp, headFw, headRt, sh: [], el: [], wr: [], tip: [], thumb: [], hip: [], kn: [], an: [], toe: [] };
  ['L', 'R'].forEach((sd, i) => {
    const sg = i === 0 ? 1 : -1;
    const shoulder = add(sub(neckBase, mul(chestDir, 0.05)), mul(side, sg * P.shoulderHalf));
    const elbow = add(shoulder, mul(hang(norm(sub(m[`forearm.${sd}`], m[`upper_arm.${sd}`]))), P.upperArm));
    const wrist = add(elbow, mul(hang(norm(sub(m[`hand.${sd}`], m[`forearm.${sd}`]))), P.foreArm));
    const hd = norm(sub(m[`f_middle.01.${sd}`], m[`hand.${sd}`]));
    s.sh[i] = shoulder; s.el[i] = elbow; s.wr[i] = wrist; s.tip[i] = add(wrist, mul(hd, P.hand));
    s.thumb[i] = add(wrist, mul(norm(sub(m[`thumb.02.${sd}`], m[`hand.${sd}`])), P.hand * 0.62));
    const hip = add(hips, mul(hside, sg * P.hipHalf));
    const relax = (d: V): V => norm([d[0] * stance, d[1], d[2] * stance]);
    const knee = add(hip, mul(relax(norm(sub(m[`shin.${sd}`], m[`thigh.${sd}`]))), P.thigh));
    const ankle = add(knee, mul(relax(norm(sub(m[`foot.${sd}`], m[`shin.${sd}`]))), P.shin));
    const td = norm(sub(m[`toe.${sd}`], m[`foot.${sd}`]));
    s.hip[i] = hip; s.kn[i] = knee; s.an[i] = ankle; s.toe[i] = add(ankle, mul(norm([td[0], Math.min(td[1], -0.25), td[2]]), P.foot));
  });
  if (o.ground ?? true) {
    const dy = P.ankle - Math.min(s.an[0][1], s.an[1][1]);
    shift(s, [0, dy, 0]);
  }
  return s as Skel;
};
const PTS = ['hips', 'neckBase', 'headC'] as const;
const PAIRS = ['sh', 'el', 'wr', 'tip', 'thumb', 'hip', 'kn', 'an', 'toe'] as const;
const DIRS = ['chestDir', 'side', 'headUp', 'headFw', 'headRt'] as const;
function shift(s: any, d: V) {
  PTS.forEach((k) => { s[k] = add(s[k], d); });
  PAIRS.forEach((k) => { s[k] = [add(s[k][0], d), add(s[k][1], d)]; });
}
// Put a solved skeleton into the room: turn it (degrees, 0 faces +z, into the room) and stand it at (x, z).
export const place = (s: Skel, at: [number, number], yaw: number): Skel => {
  const o: any = {};
  const T = (p: V): V => { const r = rotY(p, yaw); return [r[0] + at[0], r[1], r[2] + at[1]]; };
  PTS.forEach((k) => { o[k] = T((s as any)[k]); });
  PAIRS.forEach((k) => { o[k] = [T((s as any)[k][0]), T((s as any)[k][1])]; });
  DIRS.forEach((k) => { o[k] = rotY((s as any)[k], yaw); });
  return o as Skel;
};

// Two-bone IK: put a hand exactly where it must be (on a phone, a table, a door), keeping the elbow toward `pole`.
export const reach = (s: Skel, sideIdx: 0 | 1, target: V, pole: V, P: Props = NIO, handDir?: V, thumbDir?: V): Skel => {
  const S = s.sh[sideIdx];
  const a = P.upperArm, b = P.foreArm;
  const to = sub(target, S);
  const d = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.005, len(to)));
  const n = norm(to);
  const x = (a * a - b * b + d * d) / (2 * d);
  const r = Math.sqrt(Math.max(0, a * a - x * x));
  const perp = norm(sub(pole, mul(n, dot(pole, n))));
  const el = add(add(S, mul(n, x)), mul(perp, r));
  const wr = add(S, mul(n, d));
  const hd = handDir ? norm(handDir) : norm(sub(wr, el));
  const out: Skel = { ...s, el: [...s.el] as any, wr: [...s.wr] as any, tip: [...s.tip] as any, thumb: [...s.thumb] as any };
  out.el[sideIdx] = el; out.wr[sideIdx] = wr; out.tip[sideIdx] = add(wr, mul(hd, P.hand));
  out.thumb[sideIdx] = add(wr, mul(norm(thumbDir ?? cross(hd, [0, 1, 0])), P.hand * 0.62));
  return out;
};
// Turn the head toward a point by `amount` (0..1), keeping it upright.
export const lookAt = (s: Skel, target: V, amount = 1, P: Props = NIO): Skel => {
  const want = norm(sub(target, s.headC));
  const fw = norm(lerp(s.headFw, want, amount));
  const rt = norm(cross(s.headUp, fw));
  const up = cross(fw, rt);
  return { ...s, headFw: fw, headRt: rt, headUp: up, headC: add(s.neckBase, mul(up, P.neck + P.headR * 0.8)) };
};

// ---------------------------------------------------------------------------------------------------------
// Body and garments. The body is a chain of soft capsules that the renderer blends into ONE surface.
// A garment is a layer over named body parts: the same shapes, a little larger, in its own material. So a
// shirt always fits, always follows the body, and comes off by leaving it out of the outfit.
// ---------------------------------------------------------------------------------------------------------
export const G = { skin: 0, knit: 1, pants: 2, shoe: 3, hair: 4, phone: 5 };
export type Prim = { a: V; ra: number; b: V; rb: number; g: number; k: number; c: string; cutA?: boolean; cutB?: boolean };
export type Outfit = {
  skin: string; top?: { color: string; rib: string; loose: number } | null; bottom?: { color: string; loose: number } | null;
  shoes?: { color: string } | null;
};
export const NIO_OUTFIT: Outfit = {
  skin: '#e2b08c',
  top: { color: '#c56a3c', rib: '#a4502f', loose: 0.016 },
  bottom: { color: '#3b3542', loose: 0.014 },
  shoes: { color: '#ece5db' },
};
export const buildBody = (s: Skel, P: Props = NIO, o: Outfit = NIO_OUTFIT): Prim[] => {
  const out: Prim[] = [];
  const cap = (a: V, ra: number, b: V, rb: number, g: number, c: string, k = 0.03, cutA = false, cutB = false) => out.push({ a, ra, b, rb, g, k, c, cutA, cutB });
  const top = o.top, bot = o.bottom;
  const chest = sub(s.neckBase, mul(s.chestDir, 0.1));
  const belly = add(s.hips, mul(s.chestDir, 0.06));
  // THE BODY: one skin surface, complete under the clothes
  cap(belly, P.torsoR - 0.02, chest, P.torsoR, G.skin, o.skin, 0.06);
  cap(s.sh[0], 0.045, s.sh[1], 0.045, G.skin, o.skin, 0.06);
  cap(s.hip[0], P.legR + 0.02, s.hip[1], P.legR + 0.02, G.skin, o.skin, 0.05);
  cap(sub(s.neckBase, mul(s.chestDir, 0.03)), 0.03, add(s.neckBase, mul(s.headUp, P.neck + 0.03)), 0.028, G.skin, o.skin, 0.03);
  for (let i = 0; i < 2; i++) {
    cap(s.sh[i], P.armR + 0.004, s.el[i], P.armR, G.skin, o.skin, 0.03);
    cap(s.el[i], P.armR, s.wr[i], P.armR - 0.003, G.skin, o.skin, 0.03);
    cap(s.wr[i], 0.03, s.tip[i], 0.027, G.skin, o.skin, 0.02); // the hand: one mitten and a thumb, one surface with the arm
    cap(lerp(s.wr[i], s.tip[i], 0.2), 0.016, s.thumb[i], 0.013, G.skin, o.skin, 0.012);
    cap(s.hip[i], P.legR + 0.008, s.kn[i], P.legR, G.skin, o.skin, 0.04);
    cap(s.kn[i], P.legR, s.an[i], P.legR - 0.006, G.skin, o.skin, 0.04);
    if (!o.shoes) cap(add(s.an[i], [0, -P.ankle + 0.035, 0]), 0.032, [s.toe[i][0], Math.max(0.03, s.toe[i][1]), s.toe[i][2]], 0.028, G.skin, o.skin, 0.03);
  }
  // THE TEE: one garment. A loose tube over the torso with an open hem, and two short sleeves the arms come out of.
  if (top) {
    const l = top.loose, hem = add(s.hips, mul(s.chestDir, -0.05));
    cap(hem, P.torsoR + l + 0.016, chest, P.torsoR + l, G.knit, top.color, 0.05, true);
    cap(s.sh[0], 0.05 + l, s.sh[1], 0.05 + l, G.knit, top.color, 0.05);
    for (let i = 0; i < 2; i++) {
      const end = lerp(s.sh[i], s.el[i], 0.62);
      cap(s.sh[i], P.armR + 0.02 + l, end, P.armR + 0.026 + l, G.knit, top.color, 0.04, false, true);
    }
  }
  // THE TROUSERS: one garment, hips to ankle
  if (bot) {
    const l = bot.loose;
    cap(s.hip[0], P.legR + 0.024 + l, s.hip[1], P.legR + 0.024 + l, G.pants, bot.color, 0.05);
    for (let i = 0; i < 2; i++) {
      cap(s.hip[i], P.legR + 0.012 + l, s.kn[i], P.legR + 0.006 + l, G.pants, bot.color, 0.04);
      cap(s.kn[i], P.legR + 0.006 + l, add(s.an[i], [0, 0.025, 0]), P.legR + 0.008 + l, G.pants, bot.color, 0.04, false, true);
    }
  }
  if (o.shoes) for (let i = 0; i < 2; i++) {
    const heel = add(s.an[i], [0, -P.ankle + 0.042, 0]);
    const toe: V = [s.toe[i][0], Math.max(0.036, s.toe[i][1]), s.toe[i][2]];
    cap(heel, 0.044, toe, 0.036, G.shoe, o.shoes.color, 0.03); cap(s.an[i], 0.04, heel, 0.044, G.shoe, o.shoes.color, 0.03);
  }
  // braid ends at the nape, each closed with a PXI-purple bead
  [-0.06, 0, 0.06].forEach((x, i) => {
    const root = add(add(s.headC, mul(s.headUp, -0.1)), add(mul(s.headFw, -0.17), mul(s.headRt, x)));
    const end = add(root, add([0, -0.11 - (i === 1 ? 0.02 : 0), 0], mul(s.headFw, -0.02)));
    cap(root, 0.02, end, 0.016, G.hair, '#2b1f1f', 0.01);
    cap(end, 0.021, add(end, [0, -0.008, 0]), 0.021, G.hair, '#a523ef', 0.001);
  });
  return out;
};
