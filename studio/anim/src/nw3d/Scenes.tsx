// Nio's room and the test shots for the look.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { V, add, sub, mul, norm, cross, lerp } from './vec';
import { Skel, NIO, NIO_OUTFIT, Outfit, sampleClip, mixMocap, solve, place, reach, lookAt, buildBody, Mocap } from './rig';
import { Face, FACES } from './face';
import { SdfShot, Scene3, Box, Obb, Cam3 } from './SdfShot';

// ---- the room (metres): x 0..3.8, y up, z 0..4.4. The window wall is z = 4.4. ----
export const ROOM: V = [3.8, 2.6, 4.4];
export const LAMP: V = [3.25, 1.5, 3.85];
const B = (c: V, h: V, col: string, obj: number, x: Partial<Box> = {}): Box => ({ c, h, col, obj, ...x });
const legs = (cx: number, cz: number, hx: number, hz: number, top: number, col: string, obj: number): Box[] =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => B([cx + a * hx, top / 2, cz + b * hz], [0.02, top / 2, 0.02], col, obj));
export const ROOM_BOXES: Box[] = [
  // couch under the window
  B([1.5, 0.2, 3.85], [0.95, 0.2, 0.45], '#3d6b69', 1), B([1.5, 0.62, 4.24], [0.95, 0.3, 0.12], '#3d6b69', 1),
  B([0.47, 0.33, 3.87], [0.11, 0.33, 0.47], '#35605f', 1), B([2.53, 0.33, 3.87], [0.11, 0.33, 0.47], '#35605f', 1),
  B([1.07, 0.44, 3.8], [0.44, 0.05, 0.36], '#4a7c78', 2), B([1.93, 0.44, 3.8], [0.44, 0.05, 0.36], '#4a7c78', 2),
  B([2.18, 0.62, 3.98], [0.17, 0.14, 0.06], '#a523ef', 3, { yaw: -14 }),
  // coffee table
  B([1.6, 0.36, 2.85], [0.46, 0.02, 0.27], '#6a5048', 4), ...legs(1.6, 2.85, 0.4, 0.21, 0.34, '#4f3b38', 4),
  B([1.45, 0.405, 2.82], [0.035, 0.035, 0.035], '#e0a030', 5, { yaw: 25 }), B([1.86, 0.42, 2.93], [0.04, 0.045, 0.04], '#ece5db', 6),
  // floor lamp
  B([LAMP[0], 0.012, LAMP[2]], [0.13, 0.012, 0.13], '#2c2535', 7), B([LAMP[0], 0.72, LAMP[2]], [0.014, 0.7, 0.014], '#2c2535', 7, { noShadow: true }),
  B([LAMP[0], 1.56, LAMP[2]], [0.17, 0.15, 0.17], '#f3dcae', 8, { glow: true }),
  // shelf on the right wall, with the sneakers
  ...[0.45, 0.9, 1.35].map((y) => B([3.64, y, 2.2], [0.16, 0.015, 0.62], '#4f3b38', 9)),
  B([3.64, 0.7, 1.57], [0.16, 0.7, 0.015], '#3d2e2e', 9), B([3.64, 0.7, 2.83], [0.16, 0.7, 0.015], '#3d2e2e', 9),
  ...([[0.45, 1.85, '#ece5db'], [0.45, 2.45, '#a523ef'], [0.9, 2.0, '#c56a3c'], [0.9, 2.5, '#ece5db'], [1.35, 1.9, '#3b3542'], [1.35, 2.35, '#e0a030']] as [number, number, string][]).flatMap(([y, z, c], i) => [
    B([3.63, y + 0.05, z], [0.13, 0.035, 0.05], c, 20 + i), B([3.6, y + 0.1, z], [0.07, 0.03, 0.045], c, 20 + i)]),
  // desk on the left wall, laptop open
  B([0.36, 0.72, 2.0], [0.34, 0.02, 0.62], '#6a5048', 10), ...legs(0.36, 2.0, 0.3, 0.57, 0.7, '#4f3b38', 10),
  B([0.4, 0.75, 2.0], [0.11, 0.008, 0.16], '#3a3144', 11), B([0.27, 0.86, 2.0], [0.008, 0.11, 0.16], '#2c2535', 11, { yaw: 0 }),
  B([0.279, 0.86, 2.0], [0.002, 0.095, 0.145], '#c58cff', 12, { glow: true }),
  B([0.42, 0.79, 2.42], [0.035, 0.05, 0.035], '#c56a3c', 13),
  B([0.8, 0.25, 2.05], [0.2, 0.25, 0.2], '#3a3144', 14, { yaw: 20 }),
];

// ---- posing helpers ----
export type Act = { clip: string; t: number; clip2?: string; mixAmt?: number; stance?: number; arms?: number; upright?: number; at: [number, number]; yaw: number;
  phone?: number; look?: V; lookAmt?: number; outfit?: Outfit; face: Face };
export const pose = (a: Act): { skel: Skel; props: Obb[]; glow?: { p: V; c: V } } => {
  let m: Mocap = sampleClip(a.clip, a.t);
  if (a.clip2 && a.mixAmt) m = mixMocap(m, sampleClip(a.clip2, a.t), a.mixAmt);
  let s = place(solve(m, NIO, { stance: a.stance ?? 1, arms: a.arms ?? 1, upright: a.upright ?? 0 }), a.at, a.yaw);
  const props: Obb[] = []; let glow;
  if (a.look) s = lookAt(s, a.look, a.lookAmt ?? 1);
  const ph = a.phone ?? 0;
  if (ph > 0.01) {
    // the phone floats where his eyes can read it; the hand is placed BEHIND it and the thumb comes round the front
    const body = norm([s.headFw[0], 0, s.headFw[2]]), rt = norm(cross([0, 1, 0], body));
    const pc = add(s.neckBase, add(mul(body, 0.27), add(mul(rt, -0.07), [0, -0.1, 0])));
    s = lookAt(s, pc, 0.4 * ph);
    const z = norm(sub(add(s.headC, mul(s.headFw, 0.1)), pc)), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
    const wr = add(pc, add(mul(y, -0.095), mul(z, -0.03)));
    const held = reach(s, 1, wr, add(mul(rt, -1), [0, -0.6, 0]), NIO, add(y, mul(z, 0.12)), add(mul(x, -0.5), mul(z, 0.55)));
    // blend from the mocap arm into the hold
    const mixS: any = { ...s };
    (['el', 'wr', 'tip', 'thumb'] as const).forEach((k) => { mixS[k] = [s[k][0], lerp(s[k][1], held[k][1], ph)]; });
    s = mixS;
    if (ph > 0.6) {
      props.push({ c: pc, x, y, z, h: [0.037, 0.078, 0.005], col: '#221c2a', screen: '#c58cff' });
      glow = { p: add(pc, mul(z, 0.03)), c: [0.24, 0.1, 0.4] as V };
    }
  }
  return { skel: s, props, glow };
};
export const shot = (cam: Cam3, a: Act | null, lampOn = 1): Scene3 => {
  if (!a) return { cam, room: ROOM, boxes: ROOM_BOXES, lamp: LAMP, lampOn, body: [], skel: null, skin: NIO_OUTFIT.skin, face: FACES.deadpan };
  const p = pose(a); const o = a.outfit ?? NIO_OUTFIT;
  return { cam, room: ROOM, boxes: ROOM_BOXES, lamp: LAMP, lampOn, body: buildBody(p.skel, NIO, o), skel: p.skel, skin: o.skin, face: a.face, props: p.props, glow: p.glow };
};

// ---- test stills: any clip, any angle, any face, with or without the shirt ----
export const CAMS: Record<string, Cam3> = {
  full: { pos: [1.9, 0.95, 0.15], at: [1.9, 0.68, 2.2], fov: 50 },
  three: { pos: [0.9, 1.15, 0.6], at: [1.95, 0.8, 2.2], fov: 44 },
  low: { pos: [2.5, 0.35, 1.0], at: [1.85, 0.95, 2.2], fov: 50 },
  tight: { pos: [1.7, 1.25, 1.1], at: [1.9, 1.2, 2.2], fov: 40 },
  side: { pos: [3.5, 1.1, 1.9], at: [1.9, 0.8, 2.2], fov: 42 },
  back: { pos: [2.3, 1.3, 4.0], at: [1.9, 0.8, 2.2], fov: 46 },
  couch: { pos: [2.7, 1.05, 1.9], at: [1.2, 0.62, 3.6], fov: 44 },
  high: { pos: [0.5, 2.35, 0.4], at: [1.9, 0.4, 2.6], fov: 52 },
};
export const N3Still: React.FC<{ cam: string; clip: string; t: number; yaw: number; face: string; phone: number; top: boolean; stance: number; arms: number; upright: number; at?: number[] }> = (p) => (
  <SdfShot scene={shot(CAMS[p.cam], { clip: p.clip, t: p.t, at: (p.at ?? [1.9, 2.2]) as [number, number], yaw: p.yaw, face: FACES[p.face], phone: p.phone, stance: p.stance, arms: p.arms, upright: p.upright,
    outfit: p.top ? NIO_OUTFIT : { ...NIO_OUTFIT, top: null } })} />
);
export const N3_DEFAULT = { cam: 'full', clip: 'Idle_Loop', t: 0, yaw: 180, face: 'deadpan', phone: 0, top: true, stance: 0.3, arms: 0.4, upright: 0.8 };

// ---- the proof clip: 192 frames at 24 fps, cut to tools/nw_clip_sfx.py ----
export const N3_LEN = 192;
const PURPLE_TEE: Outfit = { ...NIO_OUTFIT, top: { color: '#8a2fd0', rib: '#6a1fa8', loose: 0.016 } };
const push = (c: Cam3, k: number): Cam3 => ({ ...c, pos: lerp(c.pos, c.at, k) });
export const N3Clip: React.FC = () => {
  const f = useCurrentFrame();
  const t = Math.floor(f / 2) * 2; // the body moves on twos, like drawn animation
  const base = { at: [1.9, 2.2] as [number, number], stance: 0.3, arms: 0.4, upright: 0.8 };
  let sc: Scene3;
  if (f < 52) { // low angle: reading the phone, it buzzes
    const face = f < 30 ? gazeDown(FACES.deadpan) : f < 34 ? FACES.shock : gazeDown(FACES.shock, -0.4);
    sc = shot(push(CAMS.low, f * 0.0012), { ...base, clip: 'Idle_Loop', t, yaw: 200, phone: 1, face });
  } else if (f < 78) { // tight: he does not trust it
    const face = f < 66 ? gazeDown(FACES.suspicious, -0.7) : FACES.suspicious;
    sc = shot(push({ pos: [1.62, 0.98, 1.15], at: [1.9, 1.22, 2.2], fov: 40 }, (f - 52) * 0.002), { ...base, clip: 'Idle_Loop', t, yaw: 165, phone: 1, face });
  } else if (f < 106) { // side: alone at home, he dances
    sc = shot(CAMS.side, { ...base, clip: 'Dance_Loop', t: t - 78, yaw: 120, stance: 1, arms: 1, upright: 0, face: (f - 78) % 12 < 6 ? FACES.hyped : FACES.laughing });
  } else if (f < 138) { // caught. Then the same body in a different shirt, and no shirt: garments are separate pieces
    const o = f < 114 ? NIO_OUTFIT : f < 122 ? { ...NIO_OUTFIT, top: null } : PURPLE_TEE;
    const face = f < 114 ? FACES.sheepish : f < 122 ? FACES.real : f < 126 ? FACES.deadpan : FACES.smug;
    sc = shot(CAMS.full, { ...base, clip: 'Dance_Loop', t: 26, yaw: 180, stance: f < 122 ? 1 : 0.3, arms: f < 122 ? 1 : 0.4, upright: f < 122 ? 0 : 0.8, outfit: o, face,
      ...(f >= 122 ? { clip: 'Idle_Loop', t } : {}) });
  } else { // high and wide: he walks off across the room
    const k = (f - 138) / 54; const a: V = [1.45, 0, 3.05], b: V = [2.25, 0, 1.55]; const p = lerp(a, b, Math.floor(k * 27) / 27);
    const yaw = (Math.atan2(b[0] - a[0], b[2] - a[2]) * 180) / Math.PI;
    sc = shot(CAMS.high, { ...base, clip: 'Walk_Loop', t: t - 138, at: [p[0], p[2]], yaw, stance: 1, arms: 1, upright: 0.3, outfit: PURPLE_TEE, face: FACES.smug });
  }
  return <SdfShot scene={sc} />;
};
function gazeDown(fc: Face, py = -0.8): Face { return { ...fc, eyeL: { ...fc.eyeL, py }, eyeR: { ...fc.eyeR, py } }; }
