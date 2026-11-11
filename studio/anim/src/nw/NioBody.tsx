import React from 'react';
import { INK, SKIN, KNIT } from './ink';
import { NioHead, Face } from './NioHead';

type P = [number, number];

// Draw children twice: once as a fat ink silhouette, once as fills. Overlapping parts share one outline.
export const Inked: React.FC<{ s: number; children: React.ReactNode; w?: number }> = ({ s, children, w = 2 }) => (
  <>
    <g className="nwink" style={{ ['--w' as any]: `${(w * 2) / s}px` }}>{children}</g>
    {children}
  </>
);

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

const Phone: React.FC<{ s: number; glow?: string }> = ({ s, glow = '#c58cff' }) => (
  <g>
    <Inked s={s}><rect x={9} y={-46} width={25} height={56} rx={4.5} fill="#2a2434" /></Inked>
    <rect x={9} y={-46} width={3} height={56} rx={1} fill={glow} />
    <rect x={21} y={-42} width={10} height={11} rx={3} fill="#3d3550" />
    <circle cx={24} cy={-39} r={1.6} fill="#15121c" /><circle cx={28} cy={-34.5} r={1.6} fill="#15121c" />
  </g>
);

export const Hand: React.FC<{ name: HandName; s: number; at: P; rot?: number; flip?: boolean; glow?: string; uid?: string; k?: number }> = ({ name, s, at, rot = 0, flip, glow, uid = 'h', k = 1.25 }) => {
  const h = HANDS[name];
  const px = 1 / (s * k);
  const fd = (f: Finger) => [seg(f[0], f[1], f[3], f[3] * 0.94), seg(f[1], f[2], f[3] * 0.94, f[3] * 0.78)];
  const all = [...h.fingers, h.thumb];
  const id = `${uid}${name}`;
  const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${k} ${flip ? -k : k})`}>
      {name === 'phone' && <Phone s={s * k} glow={glow} />}
      {/* one silhouette for the whole hand, then a line between each pair of fingers */}
      <Inked s={s * k}>
        <path d={h.palm} fill={SKIN.base} />
        {all.map((f, i) => fd(f).map((d, j) => <path key={`${i}${j}`} d={d} fill={SKIN.base} />))}
      </Inked>
      <clipPath id={id}><path d={h.palm} />{all.map((f, i) => fd(f).map((d, j) => <path key={`${i}${j}`} d={d} />))}</clipPath>
      <g clipPath={`url(#${id})`}>
        {name !== 'phone' && <path d="M -3 5 C 5 9 12 10 20 8 L 20 14 L -3 12 Z" fill={SKIN.shade} />}
        {h.fingers.slice(0, -1).map((f, i) => {
          const g = h.fingers[i + 1];
          const a = mid(f[0], g[0]), b = mid(f[1], g[1]), c = mid(f[2], g[2]);
          return <path key={i} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} fill="none" stroke={INK} strokeWidth={1 * px} strokeLinejoin="round" />;
        })}
        {(() => { const f = h.thumb; const e = fd(f); return <>{e.map((d, i) => <path key={i} d={d} fill={SKIN.base} stroke={INK} strokeWidth={2 * px} />)}{e.map((d, i) => <path key={`b${i}`} d={d} fill={SKIN.base} />)}</>; })()}
      </g>
    </g>
  );
};

export type Pose = {
  // joints in head units; origin is the head design box. The neck base sits near (76, 232).
  shN?: P; elN: P; wrN: P; handN?: HandName; handNRot?: number; handNFlip?: boolean;
  shF?: P; elF: P; wrF: P; handF?: HandName; handFRot?: number; handFFlip?: boolean;
  headRot?: number; headDx?: number; headDy?: number; lean?: number;
  hipN?: P; knN?: P; anN?: P; hipF?: P; knF?: P; anF?: P;
  nearArmBehind?: boolean;
};
export const POSE_STAND: Pose = {
  elN: [2, 356], wrN: [10, 432], handN: 'relaxed', handNRot: 80,
  elF: [152, 352], wrF: [146, 428], handF: 'relaxed', handFRot: 96,
};

const PANTS = { base: '#3a3442', shade: '#28232f', light: '#4d4658' };
const SHOE = { base: '#f3ede4', shade: '#c9bfc9', sole: '#e3d9d2' };

const Arm: React.FC<{ s: number; sh: P; el: P; wr: P; hand: HandName; rot: number; flip?: boolean; far?: boolean; glow?: string; uid: string }> = ({ s, sh, el, wr, hand, rot, flip, far, glow, uid }) => {
  const px = 1 / s;
  const ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
  const c = Math.cos(ang), sn = Math.sin(ang);
  const cuffA: P = [wr[0] - c * 7, wr[1] - sn * 7];
  const base = far ? KNIT.shade : KNIT.base;
  const handAt: P = [wr[0] + c * 4, wr[1] + sn * 4];
  const cuff = `M ${cuffA[0] + sn * 12} ${cuffA[1] - c * 12} L ${wr[0] + sn * 11} ${wr[1] - c * 11} L ${wr[0] - sn * 11} ${wr[1] + c * 11} L ${cuffA[0] - sn * 12} ${cuffA[1] + c * 12} Z`;
  const h = <Hand name={hand} s={s} at={handAt} rot={rot} flip={flip} glow={glow} uid={`${uid}${far ? 'f' : 'n'}`} />;
  return (
    <g>
      {hand !== 'phone' && h}
      <clipPath id={`${uid}sl`}><path d={seg(sh, el, 19, 16)} /><path d={seg(el, cuffA, 16, 14)} /></clipPath>
      <Inked s={s}>
        <path d={seg(sh, el, 19, 16)} fill={base} />
        <path d={seg(el, cuffA, 16, 14)} fill={base} />
        <path d={cuff} fill={far ? KNIT.rib : KNIT.shade} />
      </Inked>
      {!far && <g clipPath={`url(#${uid}sl)`}><path d={seg([sh[0] - 12, sh[1]], [el[0] - 12, el[1] + 4], 12, 10)} fill={KNIT.shade} /><path d={seg([el[0] + sn * 10, el[1] - c * 10 + 3], [cuffA[0] + sn * 9, cuffA[1] - c * 9 + 3], 6, 5)} fill={KNIT.shade} /></g>}
      <path d={`M ${el[0] - 7} ${el[1] - 3} q 6 5 13 1 M ${cuffA[0] + sn * 13} ${cuffA[1] - c * 13} L ${cuffA[0] - sn * 13} ${cuffA[1] + c * 13}`} fill="none" stroke={INK} strokeWidth={1 * px} strokeLinecap="round" />
      {hand === 'phone' && h}
    </g>
  );
};

export const Nio: React.FC<{ s: number; pose?: Pose; face?: Face; uid?: string; lod?: 0 | 1; legs?: boolean; glow?: string }> = ({
  s, pose = POSE_STAND, face, uid = 'n', lod = 0, legs = true, glow,
}) => {
  const px = 1 / s;
  const line = { fill: 'none', stroke: INK, strokeWidth: 1 * px, strokeLinecap: 'round' as const };
  const shN = pose.shN ?? [16, 272], shF = pose.shF ?? [136, 268];
  const hipN = pose.hipN ?? [42, 424], knN = pose.knN ?? [40, 522], anN = pose.anN ?? [38, 606];
  const hipF = pose.hipF ?? [102, 424], knF = pose.knF ?? [108, 522], anF = pose.anF ?? [110, 606];
  const torso = 'M 44 226 C 30 232 12 240 4 256 C -4 276 -2 330 2 428 L 142 430 C 146 380 152 300 148 262 C 144 244 122 234 108 228 C 96 246 60 246 44 226 Z';
  const shoe = (a: P, far: boolean) => (
    <g transform={`translate(${a[0]} ${a[1]})`}>
      <Inked s={s}>
        <path d="M -17 4 C -18 -8 -8 -10 6 -8 C 16 -4 34 4 44 12 C 50 18 50 26 44 28 L -16 28 C -20 22 -18 12 -17 4 Z" fill={far ? SHOE.shade : SHOE.base} />
      </Inked>
      <path d="M -17 19 L 48 19 L 44 28 L -16 28 Z" fill={SHOE.sole} />
      <path d="M -17 19 L 48 19 M 8 -4 l 6 8 M 15 0 l 6 8 M 22 4 l 6 7" {...line} />
    </g>
  );
  const leg = (h: P, k: P, a: P, far: boolean) => (
    <g>
      {shoe(a, far)}
      <Inked s={s}>
        <path d={seg(h, k, 21, 17)} fill={far ? PANTS.shade : PANTS.base} />
        <path d={seg(k, [a[0], a[1] - 6], 17, 14)} fill={far ? PANTS.shade : PANTS.base} />
      </Inked>
      <path d={`M ${a[0] - 12} ${a[1] - 16} q 10 5 24 0 M ${k[0] - 10} ${k[1] - 2} q 8 4 16 -1`} {...line} />
    </g>
  );
  return (
    <g transform={`rotate(${pose.lean ?? 0} 76 430)`}>
      {/* far arm, behind the body */}
      <Arm s={s} sh={shF} el={pose.elF} wr={pose.wrF} hand={pose.handF ?? 'relaxed'} rot={pose.handFRot ?? 90} flip={pose.handFFlip} far glow={glow} uid={uid} />
      {pose.nearArmBehind && <Arm s={s} sh={shN} el={pose.elN} wr={pose.wrN} hand={pose.handN ?? 'relaxed'} rot={pose.handNRot ?? 90} flip={pose.handNFlip} glow={glow} uid={uid} />}
      {legs && leg(hipF, knF, anF, true)}
      {legs && leg(hipN, knN, anN, false)}
      {/* head sits behind the collar */}
      <g transform={`translate(${pose.headDx ?? 0} ${(pose.headDy ?? 0) + 24}) rotate(${pose.headRot ?? 0} 76 220) translate(76 232) scale(1.12) translate(-76 -232)`}>
        <NioHead s={s * 1.12} face={face} uid={uid} lod={lod} />
      </g>
      {/* crewneck */}
      <Inked s={s}><path d={torso} fill={KNIT.base} /></Inked>
      <clipPath id={`${uid}tc`}><path d={torso} /></clipPath>
      <g clipPath={`url(#${uid}tc)`}>
        <path d="M 4 256 C -4 276 -2 330 2 428 L 30 428 C 24 380 24 320 34 262 Z" fill={KNIT.shade} />
        <path d="M 0 408 L 146 410 L 146 432 L 0 432 Z" fill={KNIT.shade} />
        <path d="M 40 232 C 56 262 104 262 116 234 L 122 248 C 104 282 60 284 36 250 Z" fill={KNIT.shade} />
        <path d="M 60 408 C 80 380 120 366 150 370 L 150 410 Z" fill={KNIT.shade} />
      </g>
      <path d="M 44 226 C 60 246 96 246 108 228 M 40 231 C 58 255 100 254 113 232" {...line} strokeWidth={1.4 * px} />
      <path d="M 3 408 L 145 410 M 34 300 q 8 30 4 62 M 112 318 q -6 20 -2 40 M 70 392 q 20 -14 44 -18" {...line} />
      {!pose.nearArmBehind && <Arm s={s} sh={shN} el={pose.elN} wr={pose.wrN} hand={pose.handN ?? 'relaxed'} rot={pose.handNRot ?? 90} flip={pose.handNFlip} glow={glow} uid={uid} />}
    </g>
  );
};
