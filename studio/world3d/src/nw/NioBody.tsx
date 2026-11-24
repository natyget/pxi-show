import React from 'react';
import { INK, SKIN, KNIT } from './ink';
import { NioHead, Face } from './NioHead';
import { Inked } from './Inked';
export { Inked };

type P = [number, number];

// A tapered limb segment from A (radius ra) to B (radius rb).
export const seg = (a: P, b: P, ra: number, rb: number): string => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const nx = Math.sin(ang), ny = -Math.cos(ang);
  const f = (n: number) => n.toFixed(1);
  return `M ${f(a[0] + nx * ra)} ${f(a[1] + ny * ra)} L ${f(b[0] + nx * rb)} ${f(b[1] + ny * rb)} A ${rb} ${rb} 0 0 1 ${f(b[0] - nx * rb)} ${f(b[1] - ny * rb)} L ${f(a[0] - nx * ra)} ${f(a[1] - ny * ra)} A ${ra} ${ra} 0 0 1 ${f(a[0] + nx * ra)} ${f(a[1] + ny * ra)} Z`;
};

export type HandName = 'relaxed' | 'point' | 'open' | 'fist' | 'phone';
type Finger = [P, P, P, number];
const HANDS: Record<HandName, { palm: string; fingers: Finger[]; thumb: Finger; thumbFirst?: boolean }> = {
  relaxed: {
    palm: 'M -2 -8 C 6 -10 14 -10 19 -7 L 19 8 C 12 11 5 10 -2 8 Z',
    fingers: [[[14, 7], [21, 10], [24, 14], 2.5], [[16, 3], [25, 6], [29, 11], 2.9], [[16, -1.5], [27, 0.5], [32, 6], 3], [[15, -6], [25, -5], [31, 0], 3]],
    thumb: [[4, 6], [11, 12], [17, 15], 3.3],
  },
  point: {
    palm: 'M -2 -8 C 6 -10 14 -10 19 -7 L 19 8 C 12 11 5 10 -2 8 Z',
    fingers: [[[14, 7], [21, 9], [16, 11], 2.6], [[16, 3], [24, 5], [18, 8], 2.9], [[16, -1], [25, 0], [19, 4], 3], [[15, -6], [28, -7], [40, -7.5], 2.9]],
    thumb: [[5, 5], [13, 8], [20, 5], 3.3],
  },
  open: {
    palm: 'M -2 -8 C 6 -11 14 -11 19 -8 L 19 9 C 12 12 5 11 -2 8 Z',
    fingers: [[[14, 7], [23, 12], [30, 17], 2.6], [[16, 3], [27, 6], [37, 9], 2.9], [[16, -2], [28, -3], [39, -4], 3], [[15, -7], [26, -12], [35, -17], 2.9]],
    thumb: [[4, -7], [8, -16], [13, -23], 3.3],
    thumbFirst: true,
  },
  fist: {
    palm: 'M -2 -8 C 6 -10 14 -11 20 -8 L 21 8 C 13 11 5 10 -2 8 Z',
    fingers: [[[15, 6], [22, 8], [18, 10], 2.8], [[17, 2], [25, 3], [20, 6], 3], [[17, -2.5], [26, -2], [21, 1], 3.1], [[16, -7], [25, -7], [20, -4], 3]],
    thumb: [[6, 5], [14, 9], [22, 6], 3.4],
  },
  phone: {
    palm: 'M -4 -6 C 0 -22 4 -26 10 -27 L 12 10 C 6 12 0 10 -4 8 Z',
    fingers: [[[6, 6], [16, 8.5], [27, 7], 2.7], [[7, -1], [17, 0.5], [28, -1], 3], [[7, -9], [17, -8], [28, -9.5], 3.1], [[7, -17], [17, -16.5], [27, -18], 3]],
    thumb: [[2, -20], [6, -30], [10, -37], 3.3],
    thumbFirst: true,
  },
};

// The phone sits in FRONT of the hand that holds it: we see its back, four fingertips curling round the far edge,
// and the thumb on the near edge. The palm is behind it.
const PhoneHand: React.FC<{ s: number; glow?: string }> = ({ s, glow = '#c58cff' }) => {
  const px = 1 / s;
  const tip = (x1: number, y1: number, x2: number, y2: number, r: number, key: string) => (
    <g key={key}><Inked s={s} w={1.5}><path d={seg([x1, y1], [x2, y2], r, r * 0.9)} fill={SKIN.base} /></Inked></g>
  );
  return (
    <g>
      <Inked s={s}><path d="M -8 -2 C -6 -14 2 -20 10 -20 L 14 8 C 6 12 -4 10 -8 4 Z" fill={SKIN.shade} /></Inked>
      <Inked s={s}><rect x={2} y={-50} width={27} height={56} rx={5} fill="#2c2636" /></Inked>
      <rect x={2} y={-50} width={3} height={56} rx={1.5} fill={glow} />
      <rect x={15} y={-46} width={11} height={12} rx={3.5} fill="#40384e" />
      <circle cx={18.5} cy={-42.5} r={1.7} fill="#15121c" /><circle cx={22.5} cy={-37.5} r={1.7} fill="#15121c" />
      {[-30, -21, -12, -3].map((y, i) => tip(32, y, 23, y + 0.5, 3.4 - i * 0.15, `f${i}`))}
      {tip(-1, -4, 6, -17, 3.8, 't')}
      <path d="M 0 0" stroke={INK} strokeWidth={px} />
    </g>
  );
};

export const Hand: React.FC<{ name: HandName; s: number; at: P; rot?: number; flip?: boolean; glow?: string; uid?: string; k?: number }> = ({ name, s, at, rot = 0, flip, glow, uid = 'h', k = 1.05 }) => {
  const h = HANDS[name];
  const px = 1 / (s * k);
  const fd = (f: Finger) => [seg(f[0], f[1], f[3], f[3] * 0.94), seg(f[1], f[2], f[3] * 0.94, f[3] * 0.78)];
  const all = [...h.fingers, h.thumb];
  const id = `${uid}${name}`;
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (name === 'phone') return <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${k})`}><PhoneHand s={s * k} glow={glow} /></g>;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${k} ${flip ? -k : k})`}>
      {/* one silhouette for the whole hand, then a line between each pair of fingers */}
      <Inked s={s * k}>
        <path d={h.palm} fill={SKIN.base} />
        {all.map((f, i) => fd(f).map((d, j) => <path key={`${i}${j}`} d={d} fill={SKIN.base} />))}
      </Inked>
      <clipPath id={id}><path d={h.palm} />{all.map((f, i) => fd(f).map((d, j) => <path key={`${i}${j}`} d={d} />))}</clipPath>
      <g clipPath={`url(#${id})`}>
        {h.fingers.slice(0, -1).map((f, i) => {
          const g = h.fingers[i + 1];
          const a = mid(mid(f[0], g[0]), mid(f[1], g[1])), b = mid(f[1], g[1]), c = mid(f[2], g[2]);
          return <path key={i} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} fill="none" stroke={INK} strokeWidth={1 * px} strokeLinejoin="round" />;
        })}
        {(() => { const e = fd(h.thumb); return <>{e.map((d, i) => <path key={i} d={d} fill={SKIN.base} stroke={INK} strokeWidth={2 * px} />)}{e.map((d, i) => <path key={`b${i}`} d={d} fill={SKIN.base} />)}</>; })()}
      </g>
    </g>
  );
};

export type Pose = {
  // joints in head units. Neck base (90, 208), shoulders near (54, 226) and far (128, 224), hips at y 332, feet at y 462.
  shN?: P; elN: P; wrN: P; handN?: HandName; handNRot?: number; handNFlip?: boolean;
  shF?: P; elF: P; wrF: P; handF?: HandName; handFRot?: number; handFFlip?: boolean;
  headRot?: number; headDx?: number; headDy?: number; lean?: number;
  hipN?: P; knN?: P; anN?: P; hipF?: P; knF?: P; anF?: P;
  nearArmBehind?: boolean;
};
export const POSE_STAND: Pose = {
  elN: [44, 278], wrN: [48, 328], handN: 'relaxed', handNRot: 96, handNFlip: true,
  elF: [136, 276], wrF: [130, 324], handF: 'fist', handFRot: 98, handFFlip: true,
};
export const FEET: P = [90, 462];
export const HEIGHT = 436;

const PANTS = { base: '#3a3442', shade: '#28232f', light: '#4d4658' };
const SHOE = { base: '#f3ede4', shade: '#c9bfc9', sole: '#ddd3cc' };

const Arm: React.FC<{ s: number; sh: P; el: P; wr: P; hand: HandName; rot: number; flip?: boolean; far?: boolean; glow?: string; uid: string }> = ({ s, sh, el, wr, hand, rot, flip, far, glow, uid }) => {
  const px = 1 / s;
  const ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
  const c = Math.cos(ang), sn = Math.sin(ang);
  const cuffA: P = [wr[0] - c * 7, wr[1] - sn * 7];
  const base = far ? KNIT.shade : KNIT.base;
  const handAt: P = [wr[0] + c * 5, wr[1] + sn * 5];
  const cw = 10.5;
  const cuff = `M ${cuffA[0] + sn * cw} ${cuffA[1] - c * cw} L ${wr[0] + sn * (cw - 1)} ${wr[1] - c * (cw - 1)} L ${wr[0] - sn * (cw - 1)} ${wr[1] + c * (cw - 1)} L ${cuffA[0] - sn * cw} ${cuffA[1] + c * cw} Z`;
  const h = <Hand name={hand} s={s} at={handAt} rot={rot} flip={flip} glow={glow} uid={`${uid}${far ? 'f' : 'n'}`} />;
  const id = `${uid}${far ? 'f' : 'n'}sl`;
  return (
    <g>
      {hand !== 'phone' && h}
      <clipPath id={id}><path d={seg(sh, el, 15, 12.5)} /><path d={seg(el, cuffA, 12.5, 11)} /></clipPath>
      <Inked s={s}>
        <path d={seg(sh, el, 15, 12.5)} fill={base} />
        <path d={seg(el, cuffA, 12.5, 11)} fill={base} />
        <path d={cuff} fill={far ? KNIT.rib : KNIT.shade} />
      </Inked>
      {!far && <g clipPath={`url(#${id})`}><path d={seg([sh[0] - 11, sh[1]], [el[0] - 11, el[1] + 3], 9, 8)} fill={KNIT.shade} /></g>}
      <path d={`M ${el[0] - 6} ${el[1] - 2} q 5 4 11 1 M ${cuffA[0] + sn * (cw + 1)} ${cuffA[1] - c * (cw + 1)} L ${cuffA[0] - sn * (cw + 1)} ${cuffA[1] + c * (cw + 1)}`} fill="none" stroke={INK} strokeWidth={1 * px} strokeLinecap="round" />
      {hand === 'phone' && h}
    </g>
  );
};

export const Nio: React.FC<{ s: number; pose?: Pose; face?: Face; uid?: string; lod?: 0 | 1; legs?: boolean; glow?: string }> = ({
  s, pose = POSE_STAND, face, uid = 'n', lod = 0, legs = true, glow,
}) => {
  const px = 1 / s;
  const line = { fill: 'none', stroke: INK, strokeWidth: 1 * px, strokeLinecap: 'round' as const };
  const shN = pose.shN ?? [54, 228], shF = pose.shF ?? [128, 226];
  const hipN = pose.hipN ?? [70, 334], knN = pose.knN ?? [68, 390], anN = pose.anN ?? [66, 440];
  const hipF = pose.hipF ?? [110, 334], knF = pose.knF ?? [114, 390], anF = pose.anF ?? [116, 440];
  // a crewneck that fits: soft shoulders, a slight taper to the hem band
  const torso = 'M 66 204 C 54 207 44 214 41 228 C 37 256 40 300 45 338 L 137 338 C 142 300 144 256 140 228 C 137 214 126 207 114 203 C 106 216 76 217 66 204 Z';
  const shoe = (a: P, far: boolean) => (
    <g transform={`translate(${a[0]} ${a[1]}) scale(0.82)`}>
      <Inked s={s * 0.82}>
        <path d="M -15 2 C -16 -8 -6 -9 6 -7 C 16 -3 32 4 42 11 C 49 17 49 25 43 27 L -14 27 C -18 21 -16 11 -15 2 Z" fill={far ? SHOE.shade : SHOE.base} />
      </Inked>
      <path d="M -16 19 L 47 19 L 43 27 L -14 27 Z" fill={SHOE.sole} />
      <path d="M -16 19 L 47 19 M 9 -3 l 6 7 M 16 1 l 6 7" {...line} />
    </g>
  );
  // tapered trousers that break once over the shoe
  const leg = (h: P, k: P, a: P, far: boolean) => {
    const col = far ? PANTS.shade : PANTS.base;
    return (
      <g>
        {shoe(a, far)}
        <Inked s={s}>
          <path d={seg(h, k, 19, 14.5)} fill={col} />
          <path d={seg(k, [a[0], a[1] - 2], 14.5, 11.5)} fill={col} />
          <path d={`M ${a[0] - 13} ${a[1] - 4} L ${a[0] + 14} ${a[1] - 4} L ${a[0] + 15} ${a[1] + 6} L ${a[0] - 13} ${a[1] + 6} Z`} fill={col} />
        </Inked>
        <path d={`M ${a[0] - 9} ${a[1] - 7} q 9 4 20 -1 M ${k[0] - 8} ${k[1]} q 6 3 13 0`} {...line} />
      </g>
    );
  };
  return (
    <g transform={`rotate(${pose.lean ?? 0} 90 462)`}>
      <Arm s={s} sh={shF} el={pose.elF} wr={pose.wrF} hand={pose.handF ?? 'relaxed'} rot={pose.handFRot ?? 90} flip={pose.handFFlip} far glow={glow} uid={uid} />
      {pose.nearArmBehind && <Arm s={s} sh={shN} el={pose.elN} wr={pose.wrN} hand={pose.handN ?? 'relaxed'} rot={pose.handNRot ?? 90} flip={pose.handNFlip} glow={glow} uid={uid} />}
      {legs && leg(hipF, knF, anF, true)}
      {legs && leg(hipN, knN, anN, false)}
      {/* the head sits behind the collar and turns about the neck */}
      <g transform={`translate(${pose.headDx ?? 0} ${(pose.headDy ?? 0) + 13}) rotate(${pose.headRot ?? 0} 90 196)`}>
        <NioHead s={s} face={face} uid={uid} lod={lod} />
      </g>
      <Inked s={s}><path d={torso} fill={KNIT.base} /></Inked>
      <clipPath id={`${uid}tc`}><path d={torso} /></clipPath>
      <g clipPath={`url(#${uid}tc)`}>
        <path d="M 41 228 C 37 256 40 300 45 338 L 62 338 C 58 300 58 258 64 226 Z" fill={KNIT.shade} />
        <path d="M 62 208 C 76 228 108 228 118 208 L 122 218 C 108 240 76 240 60 218 Z" fill={KNIT.shade} />
        <path d="M 40 324 L 142 324 L 142 340 L 40 340 Z" fill={KNIT.shade} />
      </g>
      <path d="M 66 204 C 76 217 106 216 114 203 M 62 208 C 76 226 108 225 118 207" {...line} strokeWidth={1.4 * px} />
      <path d="M 43 324 L 139 324 M 104 270 q -4 16 -1 34" {...line} />
      {!pose.nearArmBehind && <Arm s={s} sh={shN} el={pose.elN} wr={pose.wrN} hand={pose.handN ?? 'relaxed'} rot={pose.handNRot ?? 90} flip={pose.handNFlip} glow={glow} uid={uid} />}
    </g>
  );
};
