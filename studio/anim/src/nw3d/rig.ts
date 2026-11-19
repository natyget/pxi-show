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
  belly?: number; // extra round at the belly (a big soft body), metres
  handK?: number; // how much bigger the hands are than Nio's (1 = his)
};
export const NIO: Props = {
  ankle: 0.06, shin: 0.32, thigh: 0.34, hipHalf: 0.072, torso: 0.4, neck: 0.125, headR: 0.2,
  shoulderHalf: 0.13, upperArm: 0.25, foreArm: 0.23, hand: 0.07, foot: 0.16,
  armR: 0.02, legR: 0.03, torsoR: 0.088,
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
  seat?: number; // sit on something this high (metres): the hips rest on it and the feet are left alone
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
  if (o.seat !== undefined) shift(s, [0, o.seat + 0.085 - s.hips[1], 0]);
  else if (o.ground ?? true) {
    const dy = P.ankle - Math.min(s.an[0][1], s.an[1][1]);
    shift(s, [0, dy, 0]);
  }
  return s as Skel;
};
const PTS = ['hips', 'neckBase', 'headC'] as const;
const PAIRS = ['sh', 'el', 'wr', 'tip', 'thumb', 'hip', 'kn', 'an', 'toe'] as const;
const DIRS = ['chestDir', 'side', 'headUp', 'headFw', 'headRt'] as const;
export function shift(s: any, d: V) {
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
// Body and garments. The body is a chain of soft capsules that the renderer blends into ONE surface, complete
// under the clothes. A garment is its own single piece in its own material: the same joints, a little larger.
// So a tee always fits, always follows the body, and comes off by leaving it out of the outfit.
// ---------------------------------------------------------------------------------------------------------
// The surfaces of a body. Capsules in the same surface melt into one shape; two surfaces meet in an ink line.
// Each trouser leg is its own surface, so there is a line between the legs. skinB is for a forearm that lies across
// the body or the other arm (folded arms), so it reads as lying on top instead of melting in.
export const G = { skin: 0, top: 1, bottom: 2, shoe: 3, hair: 4, legL: 5, legR: 6, skinB: 7 };
// tex: 0 flat, 1 soft blocky texture, 2 strong flecks. em: 0..1 how much it glows. sq: >1 flattens it vertically.
export type Prim = { a: V; ra: number; b: V; rb: number; g: number; k: number; c: string; cutA?: boolean; cutB?: boolean; sq?: number; tex?: number; em?: number };
export type Outfit = {
  // sleeve: how far down the upper arm a short sleeve reaches, 0..1. long: sleeves to the wrist, set in at the shoulder
  // (their own surface, so the seam is inked), in sleeveColor if given. collar and trim (ribbed hem and cuffs): colours.
  // cuffs: the band at the end of a long sleeve (a shirt under a vest has cuffs in the shirt's colour, not the vest's trim).
  top?: { color: string; loose: number; sleeve: number; long?: boolean; sleeveColor?: string; collar?: string; trim?: string; cuffs?: string; open?: string } | null; // open: worn open over a shirt this colour (a cardigan)
  bottom?: { color: string; cuff: string; width: number; check?: boolean } | null; // width: 0 slim .. 0.06 very wide. check: a fine check you have to squint at
  shoes?: { color: string } | null;
};
// How a hand is shaped. open: the mitten and thumb. fist: a round fist. point: a fist with the first finger out along
// the hand.
export type Hand = 'open' | 'fist' | 'point' | 'none'; // none: the pose draws its own hand (holding a phone)
export const buildBody = (s: Skel, P: Props, skin: string, o: Outfit, frontArm?: 0 | 1, hands: [Hand?, Hand?] = []): Prim[] => {
  const out: Prim[] = [];
  const cap = (a: V, ra: number, b: V, rb: number, g: number, c: string, k = 0.03, x: Partial<Prim> = {}) => out.push({ a, ra, b, rb, g, k, c, ...x });
  const top = o.top, bot = o.bottom;
  // a big body sits lower round the head, so the shoulders come up to the jaw and there is no neck to speak of
  const chest = sub(s.neckBase, mul(s.chestDir, Math.max(0.1, P.torsoR * 1.12)));
  const belly = add(s.hips, mul(s.chestDir, 0.06)), bR = P.torsoR - 0.02 + (P.belly ?? 0), hk = P.handK ?? 1;
  // THE BODY
  cap(belly, bR, chest, P.torsoR, G.skin, skin, 0.06);
  cap(s.sh[0], 0.042, s.sh[1], 0.042, G.skin, skin, 0.06);
  cap(s.hip[0], P.legR + 0.022, s.hip[1], P.legR + 0.022, G.skin, skin, 0.05);
  cap(sub(s.neckBase, mul(s.chestDir, 0.03)), 0.04, add(s.neckBase, mul(s.headUp, P.neck + 0.03)), 0.037, G.skin, skin, 0.03);
  for (let i = 0; i < 2; i++) {
    cap(s.sh[i], P.armR + 0.004, s.el[i], P.armR, G.skin, skin, 0.03);
    const ga = frontArm === i ? G.skinB : G.skin;
    cap(s.el[i], P.armR, s.wr[i], P.armR - 0.002, ga, skin, 0.03);
    const hs = hands[i] ?? 'open';
    if (hs === 'open') cap(s.wr[i], 0.027 * hk, s.tip[i], 0.024 * hk, ga, skin, 0.02); // the hand: one mitten and a thumb, one surface with the arm
    else if (hs !== 'none') {
      // a fist: short and round. A pointing hand adds the first finger, straight out along the hand.
      const hd = norm(sub(s.tip[i], s.wr[i])), fist = add(s.wr[i], mul(hd, 0.04 * hk));
      cap(s.wr[i], 0.027 * hk, fist, 0.03 * hk, ga, skin, 0.02);
      if (hs === 'point') cap(add(fist, mul(hd, 0.01 * hk)), 0.012 * hk, add(fist, mul(hd, 0.075 * hk)), 0.0095 * hk, ga, skin, 0.008);
    }
    if (hs !== 'none') cap(lerp(s.wr[i], s.tip[i], 0.2), 0.014 * hk, s.thumb[i], 0.012 * hk, ga, skin, 0.012);
    cap(s.hip[i], P.legR + 0.008, s.kn[i], P.legR, G.skin, skin, 0.04);
    cap(s.kn[i], P.legR, s.an[i], P.legR - 0.006, G.skin, skin, 0.04);
    if (!o.shoes) cap(add(s.an[i], [0, -P.ankle + 0.035, 0]), 0.032, [s.toe[i][0], Math.max(0.03, s.toe[i][1]), s.toe[i][2]], 0.028, G.skin, skin, 0.03);
  }
  // THE TEE: a boxy tube over the torso with an open hem, and two wide short sleeves that stand off the arms
  if (top) {
    const l = top.loose, hem = add(s.hips, mul(s.chestDir, -0.075));
    const fl = top.long ? 0.034 : 0.052; // a tee flares at the hem; a jacket or a vest hangs straighter, so the arms stay clear of it
    const big = P.belly !== undefined, fwd = norm(cross(s.side, s.chestDir));
    const hemR = big ? bR + l + 0.012 : bR + 0.02 + l + fl; // a big man's cardigan hangs straight over the belly, no flare
    cap(hem, hemR, chest, P.torsoR + l + 0.008, G.top, top.color, 0.05, { cutA: true, tex: 1 });
    // the belly: one soft ball, low and a little forward, so the body is a pear and not a box
    const bc = add(add(s.hips, mul(s.chestDir, 0.17)), mul(fwd, 0.035)), bb = bR + l + 0.03;
    if (big) cap(bc, bb, bc, bb, G.top, top.color, 0.08, { tex: 1 });
    if (top.open) {
      // an open cardigan: a narrow band of the shirt down the front, from the collar to the hem, riding the curve of the
      // body (its own surface, so the two edges are inked). Flat: a shirt is not knitted. The band follows the front of
      // the body, found by walking up it.
      const R = 0.07, cR = P.torsoR + l + 0.008, L0 = dot(sub(chest, hem), s.chestDir), N = 16, pts: V[] = [];
      for (let k = 0; k <= N; k++) {
        const h = -0.01 + (L0 + cR * 0.8) * (k / N); // height along the body from the hem
        let r = h <= L0 ? hemR + (cR - hemR) * (h / L0) : Math.sqrt(Math.max(cR * cR - (h - L0) * (h - L0), 0));
        if (big) { const hb = dot(sub(bc, hem), s.chestDir), dz = h - hb; if (Math.abs(dz) < bb) r = Math.max(r, 0.035 + Math.sqrt(bb * bb - dz * dz)); }
        pts.push(add(add(hem, mul(s.chestDir, h)), mul(fwd, r + (big ? 0.016 : 0.008) - R)));
      }
      for (let k = 0; k < N; k++) cap(pts[k], R, pts[k + 1], R, G.skinB, top.open, 0.02, k === 0 ? { cutA: true } : {});
    }
    const shR = top.long ? 0.036 + l * 0.5 : 0.046 + l; // under long sleeves the shoulders stay narrow, so the sleeve is set in at the shoulder
    cap(s.sh[0], shR, s.sh[1], shR, G.top, top.color, 0.05, { tex: 1 });
    if (!top.long) for (let i = 0; i < 2; i++) cap(s.sh[i], P.armR + 0.03 + l * 0.5, lerp(s.sh[i], s.el[i], top.sleeve), P.armR + 0.042 + l * 0.5, G.top, top.color, 0.04, { cutB: true, tex: 1 });
    else for (let i = 0; i < 2; i++) {
      // long sleeves: one soft tube from the shoulder to the wrist, bending at the elbow, ending in a cuff
      const sc = top.sleeveColor ?? top.color, cf = lerp(s.el[i], s.wr[i], 0.93);
      cap(lerp(s.sh[i], s.el[i], 0.05), P.armR + 0.026 + l * 0.5, s.el[i], P.armR + 0.022 + l * 0.4, G.skinB, sc, 0.02, { tex: 1 });
      cap(s.el[i], P.armR + 0.022 + l * 0.4, cf, P.armR + 0.017 + l * 0.3, G.skinB, sc, 0.02, { cutB: true, tex: 1 });
      cap(lerp(s.el[i], s.wr[i], 0.8), P.armR + 0.019 + l * 0.3, cf, P.armR + 0.019 + l * 0.3, G.skinB, top.cuffs ?? top.trim ?? sc, 0.004, { cutA: true, cutB: true, tex: 1 });
    }
    if (top.trim) cap(hem, hemR + 0.002, lerp(hem, chest, 0.13), hemR - 0.002, G.top, top.trim, 0.004, { cutA: true, cutB: true, tex: 1 });
    if (top.collar) for (const sd of [1, -1]) {
      const fwd = norm(cross(s.side, s.chestDir));
      cap(add(s.neckBase, add(mul(s.side, sd * 0.06), mul(fwd, -0.01))), 0.02, add(s.neckBase, add(mul(s.side, sd * 0.016), add(mul(fwd, 0.062), mul(s.chestDir, 0.03)))), 0.017, top.long ? G.skinB : G.top, top.collar, 0.01, { tex: 1 }); // under long sleeves the collar is the shirt's, inked
    }
  }
  // THE TROUSERS: wide in the thigh and wider at the hem, which sits on the shoe. Each leg is its own surface.
  if (bot) {
    const w = bot.width;
    cap(s.hip[0], 0.05 + w * 0.1, s.hip[1], 0.05 + w * 0.1, G.bottom, bot.color, 0.05, { tex: 1 });
    cap(add(s.hips, mul(s.chestDir, -0.03)), Math.max(0.098, bR + 0.012), add(s.hips, mul(s.chestDir, 0.045)), Math.max(0.094, bR + 0.008), G.bottom, bot.color, 0.03, { cutA: true, cutB: true, tex: 1 }); // the waistband
    // under a big belly the trousers are one round seat, and the legs come out of it
    if (bR > 0.12) cap(add(s.hips, mul(s.chestDir, -0.02)), bR + 0.004, add(s.hips, mul(s.chestDir, 0.04)), bR + 0.004, G.bottom, bot.color, 0.04, { tex: 1 });
    for (let i = 0; i < 2; i++) {
      const g = i === 0 ? G.legL : G.legR;
      const r0 = P.legR + 0.022 + w * 0.18, r1 = P.legR + 0.03 + w * 0.6, r2 = P.legR + 0.036 + w * 0.95;
      const down = norm(sub(s.an[i], s.kn[i]));
      const hem = add(add(s.an[i], mul(down, P.ankle - 0.028)), mul(s.side, (i === 0 ? 1 : -1) * w * 0.45)); // on the shoe, pushed outward
      const tx = bot.check ? 3 : 1;
      cap(s.hip[i], r0, s.kn[i], r1, g, bot.color, 0.04, { tex: tx });
      cap(s.kn[i], r1, hem, r2, g, bot.color, 0.04, { cutB: true, tex: tx });
      cap(lerp(s.kn[i], hem, 0.88), r2 + 0.004, hem, r2 + 0.006, g, bot.cuff, 0.002, { cutA: true, cutB: true, tex: 1 });
    }
  }
  if (o.shoes) for (let i = 0; i < 2; i++) {
    const heel = add(s.an[i], [0, -P.ankle + 0.056, 0]);
    const toe: V = [s.toe[i][0], Math.max(0.052, s.toe[i][1]), s.toe[i][2]];
    cap(heel, 0.056, toe, 0.052, G.shoe, o.shoes.color, 0.03); cap(s.an[i], 0.04, heel, 0.056, G.shoe, o.shoes.color, 0.03);
  }
  return out;
};
