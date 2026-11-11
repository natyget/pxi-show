import React from 'react';
import { INK, SKIN, HAIR, EYE, MOUTH } from './ink';

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
// Hairline (far temple to near sideburn) and skull silhouette (far temple, over the top, down to the nape).
const HAIRLINE: P[][] = [
  [[151, 80], [131, 60], [102, 62], [85, 74]],
  [[85, 74], [69, 86], [65, 104], [69, 119]],
];
const SKULL: P[][] = [
  [[154, 78], [152, 48], [131, 26], [102, 26]],
  [[102, 26], [70, 26], [47, 54], [45, 90]],
  [[45, 90], [43, 114], [46, 138], [52, 152]],
];
const along = (segs: P[][], t: number): P => {
  const x = Math.min(segs.length - 1e-6, Math.max(0, t * segs.length));
  const i = Math.floor(x);
  const s = segs[i];
  return bez(s[0], s[1], s[2], s[3], x - i);
};
const N_ROWS = 11;
// Cornrows: each row starts on the hairline, runs straight back over the skull and ends on the silhouette.
// rowPath(t) gives the curve at hairline position t; rows sit at (i + 0.5) / N and the scalp parts at i / N.
const rowPath = (t: number): string => {
  const S = along(HAIRLINE, t);
  const E = along(SKULL, 0.08 + 0.9 * Math.pow(t, 0.9));
  const dx = E[0] - S[0], dy = E[1] - S[1];
  const k = 0.17;
  const C: P = [S[0] + dx * 0.5 - dy * k, S[1] + dy * 0.5 + dx * k];
  return `M ${S[0].toFixed(1)} ${S[1].toFixed(1)} Q ${C[0].toFixed(1)} ${C[1].toFixed(1)} ${E[0].toFixed(1)} ${E[1].toFixed(1)}`;
};
const ROWS: string[] = Array.from({ length: N_ROWS }, (_, i) => rowPath((i + 0.5) / N_ROWS));
const PARTS: string[] = Array.from({ length: N_ROWS - 1 }, (_, i) => rowPath((i + 1) / N_ROWS));
const d4 = (segs: P[][]) => segs.map((s, i) => `${i ? '' : `M ${s[0][0]} ${s[0][1]} `}C ${s[1][0]} ${s[1][1]} ${s[2][0]} ${s[2][1]} ${s[3][0]} ${s[3][1]}`).join(' ');

export const NioHead: React.FC<{ s: number; face?: Face; uid?: string; lod?: 0 | 1 }> = ({ s, face = {}, uid = 'n', lod = 0 }) => {
  const px = 1 / s;
  const eL = face.eyeL ?? {}, eR = face.eyeR ?? {};
  const out = { fill: 'none', stroke: INK, strokeWidth: 2 * px, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const thin = { ...out, strokeWidth: 1 * px };
  const FACE = 'C 155 94 156 108 155 120 C 155 134 157 146 155 158 C 153 172 145 182 133 187 C 123 190 110 190 100 187 C 86 182 74 172 68 158';
  const headD = `M 102 29 C 130 28 150 48 152 78 ${FACE} L 54 151 C 48 136 45 112 47 90 C 50 56 74 30 102 29 Z`;
  const capD = `${d4(HAIRLINE)} L 62 146 L 52 152 C 46 138 43 114 45 90 C 47 54 70 26 102 26 C 131 26 152 48 154 78 Z`;
  const tails: number[][] = [[45, 142, 40, 156, 41, 168], [50, 148, 46, 162, 48, 176], [56, 151, 54, 164, 56, 174]];
  const st = face.stretch ?? 1;
  return (
    <g transform={`translate(100 200) scale(${1 / Math.sqrt(st)} ${st}) translate(-100 -200)`}>
      {/* short braid ends at the nape */}
      {tails.map((t, i) => {
        const d = `M ${t[0]} ${t[1]} Q ${t[2]} ${t[3]} ${t[4]} ${t[5]}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={INK} strokeWidth={4.4 + 2 * px} strokeLinecap="round" />
            <path d={d} fill="none" stroke={HAIR.base} strokeWidth={4.4} strokeLinecap="round" />
          </g>
        );
      })}
      {/* neck */}
      <path d="M 50 136 C 52 178 50 206 44 232 L 104 232 C 99 218 98 204 100 180 Z" fill={SKIN.base} />
      <path d="M 60 154 C 70 174 86 184 104 188 C 99 200 97 214 99 226 C 80 216 63 192 57 166 Z" fill={SKIN.shade} />
      <path d="M 51 153 C 52 178 50 206 44 232 M 100 188 C 98 204 100 222 104 232" {...out} />
      {/* head */}
      <path d={headD} fill={SKIN.base} />
      <clipPath id={`${uid}hc`}><path d={headD} /></clipPath>
      <g clipPath={`url(#${uid}hc)`}>
        <path d="M 62 96 C 67 118 70 142 79 160 C 87 174 98 184 112 189 L 60 200 L 30 150 Z" fill={SKIN.shade} />
        <path d="M 123 150 C 127 151 131 150 133 147 L 134 154 C 130 156 126 155 123 154 Z" fill={SKIN.shade} />
        <path d={`${d4(HAIRLINE)} L 72 121 C 69 106 72 92 88 80 C 104 69 130 68 151 87 Z`} fill={SKIN.shade} />
        {face.rim && <path d="M 154 100 C 156 108 155 114 155 120 C 155 134 157 146 155 158 C 153 172 145 182 133 187 C 128 189 122 190 116 190" fill="none" stroke={face.rim} strokeWidth={6} />}
        {face.gloom && <rect x={60} y={50} width={100} height={84} fill={SKIN.deep} opacity={0.85} />}
        {face.blush && <><ellipse cx={88} cy={150} rx={10} ry={5} fill="#e88a7a" /><ellipse cx={146} cy={148} rx={7} ry={4.5} fill="#e88a7a" /></>}
      </g>
      {/* hair: one dark cap that hugs the skull, thin scalp parts between the rows, plait ticks along each row */}
      <path d={capD} fill={HAIR.base} />
      <clipPath id={`${uid}sc`}><path d={capD} /></clipPath>
      <g clipPath={`url(#${uid}sc)`}>
        {PARTS.map((d, i) => <path key={`p${i}`} d={d} fill="none" stroke={HAIR.part} strokeWidth={1 * px} />)}
        {lod === 0 && ROWS.map((d, i) => (
          <path key={`f${i}`} d={d} fill="none" stroke={HAIR.light} strokeWidth={1 * px} strokeDasharray="1.6 3.4" strokeDashoffset={i * 1.7} />
        ))}
      </g>
      <path d={capD} {...out} />
      {/* face contour */}
      <path d={`M 152 78 ${FACE}`} {...out} />
      {/* ear */}
      <path d="M 68 118 C 57 110 47 120 50 134 C 52 146 61 151 68 146 Z" fill={SKIN.base} stroke={INK} strokeWidth={2 * px} strokeLinejoin="round" />
      <path d="M 64 124 C 58 123 55 130 58 138" {...thin} />
      <rect x={56} y={144} width={2 * px} height={2 * px} fill="#f4f0ff" />
      {face.bud && <><rect x={54} y={127} width={7} height={8} rx={2.5} fill="#f6f2ff" stroke={INK} strokeWidth={1 * px} /><rect x={56} y={134} width={3} height={9} fill="#f6f2ff" stroke={INK} strokeWidth={1 * px} /></>}
      {/* nose */}
      <path d="M 122 128 C 125 136 131 141 132 146 C 132 150 127 151 122 150" {...thin} strokeWidth={1.4 * px} />
      {/* eyes */}
      <Eye id={`${uid}eL`} cx={96} cy={123} rx={17} ry={16} p={eL} s={s} />
      <Eye id={`${uid}eR`} cx={138} cy={122} rx={12} ry={15} p={eR} s={s} far />
      {/* brows */}
      <Brow x1={113} y1={101} x2={75} y2={103} p={face.browL ?? {}} slit s={s} />
      <Brow x1={128} y1={100} x2={152} y2={103} p={face.browR ?? {}} s={s} far />
      {/* mouth */}
      <Mouth name={face.mouth ?? 'flat'} cx={120} cy={167} k={face.mouthS ?? 1} s={s} />
      {face.tear && <><path d="M 84 138 q -4 9 0 12 q 5 -3 0 -12 Z" fill="#bfe6ff" stroke={INK} strokeWidth={1 * px} /><rect x={80} y={136} width={30} height={2.5} fill="#bfe6ff" /><rect x={130} y={135} width={18} height={2.5} fill="#bfe6ff" /></>}
      {face.sweat && <path d="M 160 60 q 6 10 0 14 q -6 -4 0 -14 Z" fill="#bfe6ff" stroke={INK} strokeWidth={1 * px} />}
    </g>
  );
};
