import React from 'react';
import { INK, SKIN, HAIR, EYE, MOUTH } from './ink';
import { Inked } from './Inked';

// Nio's head, three-quarter view facing screen right. Design box is 200 x 240 units, neck base near (76,232).
// `s` is native pixels per unit, so line weights stay the same number of pixels at every shot size.

export type EyeP = {
  open?: number; // 0 closed .. 1 fully open (how far the upper lid is lifted)
  low?: number; // lower lid raise 0..1 (squint, smile)
  tilt?: number; // degrees, upper lid angle (+ = outer corner up... angry is negative on near eye)
  px?: number; py?: number; // pupil offset -1..1
  ps?: number; // pupil size multiplier
  wide?: number; // scale of the whole eye
  arc?: 'happy' | 'shut' | null; // closed-eye arcs
};
export type BrowP = { y?: number; rot?: number; bend?: number };
export type MouthName =
  | 'flat' | 'smirk' | 'smile' | 'grin' | 'o' | 'oh' | 'laugh' | 'grit' | 'frown' | 'wobble' | 'pout'
  | 'ah' | 'ee' | 'mm' | 'fv';
export type Face = {
  stretch?: number; // 1 = normal, >1 taller and narrower (a take), <1 squashed
  bud?: boolean; // earbud in the near ear
  rim?: string; // colour of a light edge on the side he faces (phone glow, window)
  eyeL?: EyeP; eyeR?: EyeP; browL?: BrowP; browR?: BrowP; mouth?: MouthName;
  mouthS?: number; sweat?: boolean; blush?: boolean; gloom?: boolean; tear?: boolean;
};

const Eye: React.FC<{ id: string; cx: number; cy: number; rx: number; ry: number; p: EyeP; s: number; far?: boolean }> = ({
  id, cx, cy, rx, ry, p, s, far,
}) => {
  const w = p.wide ?? 1;
  rx *= w; ry *= w;
  const open = p.open ?? 0.7;
  const low = p.low ?? 0;
  const tilt = (p.tilt ?? 0) * (far ? -1 : 1);
  const px = 1 / s;
  if (p.arc) {
    const d = p.arc === 'happy'
      ? `M ${cx - rx} ${cy + 3} Q ${cx} ${cy - ry * 0.9} ${cx + rx} ${cy + 3}`
      : `M ${cx - rx} ${cy - 1} Q ${cx} ${cy + ry * 0.6} ${cx + rx} ${cy - 1}`;
    return <path d={d} fill="none" stroke={INK} strokeWidth={2 * px} strokeLinecap="round" />;
  }
  const lidY = cy - ry + (1 - open) * ry * 2; // the lash line
  const lowY = cy + ry - low * ry * 0.9;
  const ir = Math.min(rx, ry) * 0.6 * (p.ps ?? 1);
  const ix = cx + (p.px ?? 0) * (rx - ir * 0.75);
  const iy = Math.max(cy + (p.py ?? 0) * (ry - ir * 0.75), lidY + ir * 0.45);
  const hl = Math.max(px, ir * 0.34);
  const small = s < 0.55;
  const ow = small ? 1 : 2;
  return (
    <g>
      {/* The visible eye is the ellipse cut by the lids. Nothing is drawn for the lid itself, so it is skin by construction. */}
      <clipPath id={`${id}a`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <clipPath id={`${id}b`}>
        <rect x={cx - rx * 3} y={lidY} width={rx * 6} height={Math.max(0, lowY - lidY)} transform={`rotate(${tilt} ${cx} ${lidY})`} />
      </clipPath>
      <g clipPath={`url(#${id}b)`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={EYE.white} />
        <g clipPath={`url(#${id}a)`}>
          <rect x={cx - rx * 3} y={lidY} width={rx * 6} height={2 * px} fill={EYE.shade} transform={`rotate(${tilt} ${cx} ${lidY})`} />
          <circle cx={ix} cy={iy} r={ir} fill={EYE.iris} />
          <circle cx={ix} cy={iy} r={ir * 0.5} fill={EYE.pupil} />
          <rect x={ix - ir * 0.8} y={iy - ir * 0.8} width={hl} height={hl} fill={EYE.white} />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={ow * px} />
      </g>
      <g clipPath={`url(#${id}a)`}>
        {low > 0 && <rect x={cx - rx * 3} y={lowY - 1 * px} width={rx * 6} height={1 * px} fill={INK} />}
      </g>
      {/* lash line: thick, a touch wider than the eye, with a flick at the outer corner */}
      {open < 0.97 && (() => {
        const hw = rx * Math.sqrt(Math.max(0.02, 1 - Math.pow((lidY - cy) / ry, 2)));
        const o = far ? 1 : -1; // outer corner side
        return (
          <g transform={`rotate(${tilt} ${cx} ${lidY})`}>
            <path d={`M ${cx - hw - 1} ${lidY} L ${cx + hw + 1} ${lidY}`} stroke={INK} strokeWidth={(small ? 1.6 : 2.4) * px} strokeLinecap="round" />
            {!small && <path d={`M ${cx + o * hw} ${lidY} l ${o * 3.5} ${-2.5}`} stroke={INK} strokeWidth={1.4 * px} strokeLinecap="round" />}
          </g>
        );
      })()}
    </g>
  );
};

// A tapered brow from the inner end (thick) to the outer end (thin).
// rot > 0 is angry (inner end down), rot < 0 is worried (inner end up), on both brows.
const Brow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: BrowP; slit?: boolean; s: number; far?: boolean }> = ({ x1, y1, x2, y2, p, slit, far }) => {
  const dy = p.y ?? 0, rot = (p.rot ?? 0) * (far ? -1 : 1), bend = p.bend ?? 0.5;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const cy = my - bend * len * 0.28;
  const t1 = 4.6, t2 = 1.6;
  const d = `M ${x1} ${y1 - t1} Q ${mx} ${cy - t1 * 0.9} ${x2} ${y2 - t2} L ${x2} ${y2 + t2} Q ${mx} ${cy + t1 * 0.8} ${x1} ${y1 + t1} Z`;
  return (
    <g transform={`translate(0 ${dy}) rotate(${rot} ${mx} ${my})`}>
      <path d={d} fill={HAIR.base} />
      {slit && <path d={`M ${x1 + (x2 - x1) * 0.2} ${y1 - 7} l 3 14`} stroke={SKIN.base} strokeWidth={2.2} />}
    </g>
  );
};

const Mouth: React.FC<{ name: MouthName; cx: number; cy: number; k: number; s: number }> = ({ name, cx, cy, k, s }) => {
  const px = 1 / s;
  const line = { fill: 'none', stroke: INK, strokeWidth: 1.6 * px, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const open = { fill: MOUTH.dark, stroke: INK, strokeWidth: 1.5 * px, strokeLinejoin: 'round' as const };
  const g = (children: React.ReactNode) => <g transform={`translate(${cx} ${cy}) scale(${k})`}>{children}</g>;
  switch (name) {
    case 'flat': return g(<path d="M -11 0 Q 0 1.5 12 -0.5" {...line} />);
    case 'smirk': return g(<><path d="M -12 2 Q 0 4 11 -2 Q 14 -4 15 -7" {...line} /><path d="M 18 -10 q 3 4 1 8" {...line} strokeWidth={1 * px} /></>);
    case 'smile': return g(<path d="M -14 -3 Q 0 9 15 -4" {...line} />);
    case 'frown': return g(<path d="M -12 4 Q 0 -5 12 3" {...line} />);
    case 'pout': return g(<><path d="M -7 0 Q 0 -4 7 0" {...line} /><path d="M -4 5 Q 0 7 4 5" {...line} strokeWidth={1 * px} /></>);
    case 'wobble': return g(<path d="M -14 2 q 3.5 -6 7 0 t 7 0 t 7 0 t 7 0" {...line} />);
    case 'mm': return g(<path d="M -9 0 Q 0 -2 9 0" {...line} />);
    case 'o': return g(<ellipse cx={1} cy={1} rx={5} ry={6.5} {...open} />);
    case 'oh': return g(<><ellipse cx={1} cy={3} rx={9} ry={12} {...open} /><path d="M -5 11 Q 1 5 7 11 Q 1 16 -5 11" fill={MOUTH.tongue} /></>);
    case 'ah': return g(<><path d="M -11 -4 Q 0 -8 12 -4 Q 11 13 0 13 Q -10 13 -11 -4 Z" {...open} /><path d="M -8 -4.5 Q 0 -7 9 -4.5 L 8 -0.5 Q 0 -2 -7 -0.5 Z" fill={MOUTH.teeth} /><path d="M -6 9 Q 0 4 7 9 Q 1 14 -6 9" fill={MOUTH.tongue} /></>);
    case 'ee': return g(<><path d="M -14 -4 Q 0 -1 15 -5 Q 12 7 0 7 Q -11 7 -14 -4 Z" {...open} fill={MOUTH.teeth} /><path d="M -12 1 Q 0 3.5 13 0.5" fill="none" stroke={INK} strokeWidth={1 * px} /></>);
    case 'fv': return g(<><path d="M -10 -1 Q 0 -4 11 -1 Q 6 5 0 5 Q -6 5 -10 -1 Z" {...open} /><path d="M -7 -1.5 Q 0 -3.5 8 -1.5 L 7 1 Q 0 0 -6 1 Z" fill={MOUTH.teeth} /></>);
    case 'grin': return g(<><path d="M -16 -6 Q 0 -1 17 -8 Q 15 9 1 10 Q -12 10 -16 -6 Z" {...open} fill={MOUTH.teeth} /><path d="M -13 2 Q 1 6 15 0" fill="none" stroke={INK} strokeWidth={1 * px} /></>);
    case 'laugh': return g(<><path d="M -17 -8 Q 0 -4 18 -10 Q 19 16 1 18 Q -15 17 -17 -8 Z" {...open} /><path d="M -14 -7.5 Q 0 -4 15 -9 L 14 -3.5 Q 0 0.5 -13 -2.5 Z" fill={MOUTH.teeth} /><path d="M -9 13 Q 1 4 11 12 Q 2 19 -9 13" fill={MOUTH.tongue} /></>);
    case 'grit': return g(<><path d="M -15 -6 Q 0 -8 16 -6 Q 17 7 0 7 Q -16 7 -15 -6 Z" {...open} fill={MOUTH.teeth} /><path d="M -15 0.5 H 16 M -8 -6 V 7 M 0 -7 V 7 M 8 -6 V 7" fill="none" stroke={INK} strokeWidth={1 * px} /></>);
  }
};

type P = [number, number];
const bez = (p0: P, p1: P, p2: P, p3: P, t: number): P => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
// Hairline (far temple to near sideburn) and skull silhouette (far temple, over the top, round the back to the nape).
// The skull is a full round cranium: it carries on behind the neck, which sits under the middle of the head.
const HAIRLINE: P[][] = [
  [[152, 80], [132, 60], [104, 60], [86, 72]],
  [[86, 72], [70, 84], [66, 102], [70, 119]],
];
const SKULL: P[][] = [
  [[154, 78], [152, 48], [131, 26], [100, 26]],
  [[100, 26], [64, 27], [31, 56], [28, 94]],
  [[28, 94], [26, 114], [30, 134], [40, 147]],
];
const along = (segs: P[][], t: number): P => {
  const x = Math.min(segs.length - 1e-6, Math.max(0, t * segs.length));
  const i = Math.floor(x);
  const s = segs[i];
  return bez(s[0], s[1], s[2], s[3], x - i);
};
const N_ROWS = 9;
// Cornrows: each row starts on the hairline, runs straight back over the skull and ends on the silhouette.
const rowEnds = (t: number): [P, P, P] => {
  const S = along(HAIRLINE, t);
  const E = along(SKULL, 0.06 + 0.9 * Math.pow(t, 0.85));
  const dx = E[0] - S[0], dy = E[1] - S[1];
  const k = 0.2;
  return [S, [S[0] + dx * 0.5 - dy * k, S[1] + dy * 0.5 + dx * k], E];
};
const rowPath = (t: number): string => {
  const [S, C, E] = rowEnds(t);
  return `M ${S[0].toFixed(1)} ${S[1].toFixed(1)} Q ${C[0].toFixed(1)} ${C[1].toFixed(1)} ${E[0].toFixed(1)} ${E[1].toFixed(1)}`;
};
const ROW_T = Array.from({ length: N_ROWS }, (_, i) => (i + 0.5) / N_ROWS);
const d4 = (segs: P[][]) => segs.map((s, i) => `${i ? '' : `M ${s[0][0]} ${s[0][1]} `}C ${s[1][0]} ${s[1][1]} ${s[2][0]} ${s[2][1]} ${s[3][0]} ${s[3][1]}`).join(' ');

export const NioHead: React.FC<{ s: number; face?: Face; uid?: string; lod?: 0 | 1 }> = ({ s, face = {}, uid = 'n', lod = 0 }) => {
  const px = 1 / s;
  const eL = face.eyeL ?? {}, eR = face.eyeR ?? {};
  const out = { fill: 'none', stroke: INK, strokeWidth: 2 * px, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const thin = { ...out, strokeWidth: 1 * px };
  // far side of the face: one smooth taper from the cheek to a small round chin, then the jaw back to the ear
  const FACE = 'C 155 94 156 108 155 122 C 154 140 148 160 135 176 C 128 184 116 187 106 185 C 92 182 80 173 72 160';
  const BACK = 'C 62 163 50 158 40 147 C 30 134 26 114 28 94 C 31 56 64 27 100 26 C 131 26 152 48 154 78';
  const headD = `M 154 78 ${FACE} ${BACK} Z`;
  const capD = `${d4(HAIRLINE)} L 66 142 C 60 158 50 158 40 147 C 30 134 26 114 28 94 C 31 56 64 27 100 26 C 131 26 152 48 154 78 Z`;
  const tails: number[][] = [[44, 146, 38, 158, 40, 170], [51, 152, 47, 164, 50, 178], [59, 154, 57, 164, 60, 174]];
  const st = face.stretch ?? 1;
  return (
    <g transform={`translate(96 190) scale(${1 / Math.sqrt(st)} ${st}) translate(-96 -190)`}>
      {/* short braid ends at the nape, each closed with a PXI-purple bead */}
      {tails.map((t, i) => {
        const d = `M ${t[0]} ${t[1]} Q ${t[2]} ${t[3]} ${t[4]} ${t[5]}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={INK} strokeWidth={5 + 3 * px} strokeLinecap="round" />
            <path d={d} fill="none" stroke={HAIR.base} strokeWidth={5} strokeLinecap="round" />
            <circle cx={t[4]} cy={t[5]} r={3.2} fill="#a523ef" stroke={INK} strokeWidth={1 * px} />
          </g>
        );
      })}
      {/* neck: short, under the middle of the head */}
      <path d="M 66 150 L 66 212 L 112 212 L 108 176 Z" fill={SKIN.base} />
      <path d="M 66 158 C 78 172 94 181 108 185 L 110 200 C 92 196 76 186 66 172 Z" fill={SKIN.shade} />
      <path d="M 66 162 L 66 212 M 108 185 L 112 212" {...out} />
      {/* head */}
      <path d={headD} fill={SKIN.base} />
      <clipPath id={`${uid}hc`}><path d={headD} /></clipPath>
      <g clipPath={`url(#${uid}hc)`}>
        <path d="M 62 96 C 67 118 72 140 82 156 C 90 168 100 178 114 185 L 60 196 L 20 150 Z" fill={SKIN.shade} />
        <path d="M 123 148 C 127 149 131 148 133 145 L 134 152 C 130 154 126 153 123 152 Z" fill={SKIN.shade} />
        <path d={`${d4(HAIRLINE)} L 73 121 C 70 106 73 92 89 80 C 105 69 131 68 152 87 Z`} fill={SKIN.shade} />
        {face.rim && <path d="M 154 100 C 156 108 156 114 155 122 C 154 140 148 160 135 176 C 130 182 124 185 118 186" fill="none" stroke={face.rim} strokeWidth={6} />}
        {face.gloom && <rect x={60} y={50} width={100} height={84} fill={SKIN.deep} opacity={0.85} />}
        {face.blush && <><ellipse cx={90} cy={148} rx={10} ry={5} fill="#e88a7a" /><ellipse cx={144} cy={146} rx={7} ry={4.5} fill="#e88a7a" /></>}
      </g>
      {/* hair: a cap with a bump where every row crosses the silhouette, so the outline itself says braids */}
      <Inked s={s}>
        <path d={capD} fill={HAIR.base} />
        {ROW_T.map((t, i) => { const E = rowEnds(t)[2]; return <circle key={i} cx={E[0]} cy={E[1]} r={5.2} fill={HAIR.base} />; })}
      </Inked>
      <clipPath id={`${uid}sc`}><path d={capD} />{ROW_T.map((t, i) => { const E = rowEnds(t)[2]; return <circle key={i} cx={E[0]} cy={E[1]} r={5.2} />; })}</clipPath>
      <g clipPath={`url(#${uid}sc)`}>
        {/* each row is a ridge: a dark part, a shadow under it, and a beaded highlight along its top */}
        {ROW_T.map((t, i) => (
          <g key={i}>
            <path d={rowPath(t + 0.5 / N_ROWS)} fill="none" stroke={HAIR.deep} strokeWidth={3.2} />
            {lod === 0 && <path d={rowPath(t - 0.12 / N_ROWS)} fill="none" stroke={HAIR.light} strokeWidth={2.4} strokeDasharray="3.2 2.6" strokeDashoffset={i * 2.3} strokeLinecap="round" />}
            {lod === 1 && <path d={rowPath(t - 0.12 / N_ROWS)} fill="none" stroke={HAIR.light} strokeWidth={1 * px} />}
          </g>
        ))}
      </g>
      <path d={d4(HAIRLINE)} {...out} strokeWidth={1.4 * px} />
      {/* face contour */}
      <path d={`M 154 78 ${FACE}`} {...out} />
      {/* ear */}
      <path d="M 69 116 C 58 108 48 118 51 132 C 53 144 62 149 69 144 Z" fill={SKIN.base} stroke={INK} strokeWidth={2 * px} strokeLinejoin="round" />
      <path d="M 65 122 C 59 121 56 128 59 136" {...thin} />
      <rect x={57} y={142} width={2 * px} height={2 * px} fill="#f4f0ff" />
      {face.bud && <><rect x={55} y={125} width={7} height={8} rx={2.5} fill="#f6f2ff" stroke={INK} strokeWidth={1 * px} /><rect x={57} y={132} width={3} height={9} fill="#f6f2ff" stroke={INK} strokeWidth={1 * px} /></>}
      {/* nose */}
      <path d="M 122 126 C 125 134 131 139 132 144 C 132 148 127 149 122 148" {...thin} strokeWidth={1.4 * px} />
      {/* eyes */}
      <Eye id={`${uid}eL`} cx={97} cy={121} rx={17} ry={16} p={eL} s={s} />
      <Eye id={`${uid}eR`} cx={138} cy={120} rx={12} ry={15} p={eR} s={s} far />
      {/* brows */}
      <Brow x1={114} y1={99} x2={76} y2={101} p={face.browL ?? {}} slit s={s} />
      <Brow x1={128} y1={98} x2={152} y2={101} p={face.browR ?? {}} s={s} far />
      {/* mouth */}
      <Mouth name={face.mouth ?? 'flat'} cx={119} cy={163} k={(face.mouthS ?? 1) * 0.95} s={s} />
      {face.tear && <><path d="M 85 136 q -4 9 0 12 q 5 -3 0 -12 Z" fill="#bfe6ff" stroke={INK} strokeWidth={1 * px} /><rect x={81} y={134} width={30} height={2.5} fill="#bfe6ff" /><rect x={130} y={133} width={18} height={2.5} fill="#bfe6ff" /></>}
      {face.sweat && <path d="M 160 58 q 6 10 0 14 q -6 -4 0 -14 Z" fill="#bfe6ff" stroke={INK} strokeWidth={1 * px} />}
    </g>
  );
};
