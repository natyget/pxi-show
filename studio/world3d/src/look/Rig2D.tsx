// Look test: a 2D character rig drawn as vector shapes (smooth curves), rasterised with anti-aliasing OFF at a low
// pixel resolution so every curve lands on a hard pixel grid. Faces are drawn per frame, lids always sit ON TOP of the
// eye whites (they are clipped inside the eye), and expressions are numeric so they can blend and snap.
import React from 'react';

export type Look = {
  id: 'A' | 'B' | 'C';
  name: string;
  w: number; h: number; // raster size; the viewBox is always 1080x1920
  line: 'ink' | 'selout'; // ink = one black line everywhere; selout = each shape outlined in a darker shade of itself
  lw: number; // line width in viewBox units
  shade: 'flat' | 'cel' | 'soft';
};

export const LOOKS: Record<Look['id'], Look> = {
  A: { id: 'A', name: 'Bold flat', w: 270, h: 480, line: 'ink', lw: 10, shade: 'flat' },
  B: { id: 'B', name: 'Hi-bit cel', w: 360, h: 640, line: 'selout', lw: 7, shade: 'cel' },
  C: { id: 'C', name: 'Fine line', w: 540, h: 960, line: 'ink', lw: 5, shade: 'soft' },
};

export const INK = '#151216';
export const PAL = {
  nioSkin: ['#d8a27c', '#b47a59', '#efc19c', '#7a4a33'], // base, shadow, light, selout line
  mayaSkin: ['#8d5a3d', '#6a412b', '#b07650', '#3a2014'],
  hair: ['#17110f', '#0c0908', '#3b2c26', '#000000'],
  orange: ['#d9652e', '#a9471d', '#f08a4c', '#6a2a10'],
  green: ['#2f7050', '#1f4e37', '#46936b', '#123222'],
  cream: ['#f0e3c6', '#cdbb98', '#fff6e2', '#7d6c4f'],
  pants: ['#3a3a44', '#26262e', '#55556a', '#121218'],
  white: ['#f6f3ee', '#d4cfc8', '#ffffff', '#7b746c'],
  couch: ['#33406a', '#232d4d', '#4a5a8e', '#121830'],
  wall: ['#8db6ae', '#6f968f', '#a9cfc7', '#3e5d57'],
  floor: ['#b07a52', '#8a5b3a', '#c9926a', '#4e2f1b'],
  gold: ['#e8b844', '#b8862a', '#ffe08a', '#6a4810'],
};
type Swatch = string[];

/** Stroke for a shape in this look. */
export const ln = (L: Look, sw: Swatch, k = 1) => ({ stroke: L.line === 'ink' ? INK : sw[3], strokeWidth: L.lw * k, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

/** A shaded fill: base colour, then (in cel/soft looks) a shadow shape clipped to the same outline, then the line. */
export const Shape: React.FC<{ L: Look; d: string; sw: Swatch; id: string; shadow?: string; light?: string; k?: number; noLine?: boolean; transform?: string }> = ({ L, d, sw, id, shadow, light, k = 1, noLine, transform }) => (
  <g transform={transform}>
    <path d={d} fill={sw[0]} />
    {L.shade !== 'flat' && (shadow || light) && (
      <>
        <clipPath id={id}><path d={d} /></clipPath>
        <g clipPath={`url(#${id})`}>
          {shadow && <path d={shadow} fill={sw[1]} filter={L.shade === 'soft' ? 'url(#soft)' : undefined} />}
          {light && <path d={light} fill={sw[2]} filter={L.shade === 'soft' ? 'url(#soft)' : undefined} />}
        </g>
      </>
    )}
    {!noLine && <path d={d} fill="none" {...ln(L, sw, k)} />}
  </g>
);

export const Defs: React.FC = () => (
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
  </defs>
);

// ---------- Faces ----------
export type Mouth = 'flat' | 'smirk' | 'grin' | 'frown' | 'wobble' | 'o' | 'talk';
export type Expr = {
  lid: [number, number]; // upper lid 0 = wide, ~0.35 relaxed, 1 = shut (screen-left eye, screen-right eye)
  tilt: [number, number]; // lid tilt: + = angry/flat-top, - = sad
  low: [number, number]; // lower lid raise (smile squint) 0..1
  pupil: [number, number]; // look direction -1..1
  psize: number; shine: boolean; eyeS: number;
  brow: [number, number]; // raise -1..1
  browA: [number, number]; // + = angry (inner down), - = worried (inner up)
  mouth: Mouth; mw: number; // mouth width scale
  tears: number; blush: number; sweat: number;
};

export const E: Record<string, Expr> = {
  deadpan: { lid: [0.42, 0.42], tilt: [0.1, 0.1], low: [0.15, 0.15], pupil: [0, 0], psize: 1, shine: true, eyeS: 1, brow: [0, 0], browA: [0, 0], mouth: 'flat', mw: 0.9, tears: 0, blush: 0, sweat: 0 },
  smug: { lid: [0.5, 0.38], tilt: [0.25, 0.1], low: [0.35, 0.3], pupil: [0.6, -0.1], psize: 1, shine: true, eyeS: 1, brow: [-0.2, 0.6], browA: [0.15, -0.1], mouth: 'smirk', mw: 1, tears: 0, blush: 0, sweat: 0 },
  hype: { lid: [0.05, 0.05], tilt: [-0.1, -0.1], low: [0.5, 0.5], pupil: [0, -0.2], psize: 1.05, shine: true, eyeS: 1.08, brow: [0.9, 0.9], browA: [-0.15, -0.15], mouth: 'grin', mw: 1.1, tears: 0, blush: 0.7, sweat: 0 },
  crushed: { lid: [0.35, 0.35], tilt: [-0.9, -0.9], low: [0.45, 0.45], pupil: [0, 0.5], psize: 1.15, shine: true, eyeS: 1, brow: [0.4, 0.4], browA: [-0.9, -0.9], mouth: 'wobble', mw: 0.9, tears: 1, blush: 0, sweat: 0 },
  eerie: { lid: [0.12, 0.12], tilt: [0, 0], low: [0, 0], pupil: [0, 0], psize: 0.55, shine: false, eyeS: 1.04, brow: [0, 0], browA: [0, 0], mouth: 'flat', mw: 0.6, tears: 0, blush: 0, sweat: 0 },
  unreal: { lid: [0, 0], tilt: [0, 0], low: [0, 0], pupil: [0, 0], psize: 0.6, shine: true, eyeS: 1.18, brow: [1, 0.8], browA: [-0.3, -0.3], mouth: 'o', mw: 1, tears: 0, blush: 0, sweat: 1 },
  phone: { lid: [0.5, 0.5], tilt: [0.1, 0.1], low: [0.2, 0.2], pupil: [-0.55, 0.8], psize: 1, shine: true, eyeS: 1, brow: [0, 0], browA: [0, 0], mouth: 'flat', mw: 0.8, tears: 0, blush: 0, sweat: 0 },
  talk: { lid: [0.3, 0.3], tilt: [0, 0], low: [0.25, 0.25], pupil: [0.2, 0], psize: 1, shine: true, eyeS: 1, brow: [0.3, 0.2], browA: [0, 0], mouth: 'talk', mw: 1, tears: 0, blush: 0, sweat: 0 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const l2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
/** Blend two expressions. Mouth and shine switch at the halfway point (drawn mouths snap, they never morph into mush). */
export const mix = (a: Expr, b: Expr, t: number): Expr => ({
  lid: l2(a.lid, b.lid, t), tilt: l2(a.tilt, b.tilt, t), low: l2(a.low, b.low, t), pupil: l2(a.pupil, b.pupil, t),
  psize: lerp(a.psize, b.psize, t), shine: t < 0.5 ? a.shine : b.shine, eyeS: lerp(a.eyeS, b.eyeS, t),
  brow: l2(a.brow, b.brow, t), browA: l2(a.browA, b.browA, t), mouth: t < 0.5 ? a.mouth : b.mouth, mw: lerp(a.mw, b.mw, t),
  tears: lerp(a.tears, b.tears, t), blush: lerp(a.blush, b.blush, t), sweat: lerp(a.sweat, b.sweat, t),
});

const ALMOND = 'M -36,4 C -24,-24 18,-30 38,-6 C 26,17 -14,22 -36,4 Z';
const UPPER = 'M -36,4 C -24,-24 18,-30 38,-6';

/** One eye, inner corner at -x. Mirror it with scale(-1,1) for the other side. */
export const Eye: React.FC<{ L: Look; id: string; lid: number; tilt: number; low: number; px: number; py: number; psize: number; shine: boolean; skin: Swatch; iris: string; lashes?: boolean }> = ({ L, id, lid, tilt, low, px, py, psize, shine, skin, iris, lashes }) => {
  if (lid > 0.9) return <path d="M -36,2 C -18,12 18,10 38,-2" fill="none" {...ln(L, skin, 1.2)} stroke={INK} />;
  const yc = Math.max(-34, -40 + 66 * lid);
  const yb = 30 - 42 * low;
  const lidEdge = `M -40,4 C -18,${yc + tilt * 18} 18,${yc - tilt * 8} 42,-6`;
  return (
    <g>
      <clipPath id={id}><path d={ALMOND} /></clipPath>
      <path d={ALMOND} fill="#fbf8f2" />
      <g clipPath={`url(#${id})`}>
        <circle cx={px * 15} cy={py * 9 + 1} r={16 * psize + 1} fill={iris} />
        <circle cx={px * 15} cy={py * 9 + 1} r={8 * psize} fill="#0c0807" />
        {shine && <circle cx={px * 15 - 6} cy={py * 9 - 6} r={4.5} fill="#ffffff" />}
        {shine && <circle cx={px * 15 + 6} cy={py * 9 + 6} r={2} fill="#ffffff" />}
        <path d={`M -40,6 C -18,${yb} 18,${yb} 42,-4 L 42,70 L -40,70 Z`} fill={skin[0]} />
        <path d={`M -40,6 C -18,${yb} 18,${yb} 42,-4`} fill="none" stroke={skin[3]} strokeWidth={L.lw * 0.5} />
        <path d={`${lidEdge} L 42,-80 L -40,-80 Z`} fill={L.shade === 'flat' ? skin[0] : skin[1]} />
        <path d={lidEdge} fill="none" stroke={INK} strokeWidth={L.lw * 1.1} />
      </g>
      <path d="M -36,4 C -26,17 -14,22 0,20 C 14,19 26,14 38,-6" fill="none" stroke={INK} strokeWidth={L.lw * 0.45} strokeLinecap="round" />
      <path d={lashes ? UPPER + ' L 47,-13' : UPPER} fill="none" stroke={INK} strokeWidth={L.lw * 1.15} strokeLinecap="round" strokeLinejoin="round" />
      {lashes && <path d="M 30,-14 l 12,-12 M 38,-8 l 14,-7" stroke={INK} strokeWidth={L.lw * 0.9} strokeLinecap="round" />}
    </g>
  );
};

export const Brow: React.FC<{ raise: number; ang: number; color: string; thin?: boolean }> = ({ raise, ang, color, thin }) => (
  <path transform={`translate(0 ${-raise * 24}) rotate(${-ang * 14})`} fill={color}
    d={thin ? 'M -36,4 C -18,-6 14,-10 40,-1 L 40,-6 C 12,-16 -20,-14 -38,-3 Z' : 'M -40,6 C -20,-6 14,-10 42,-1 L 41,-13 C 12,-24 -22,-19 -42,-7 Z'} />
);

export const MouthShape: React.FC<{ L: Look; m: Mouth; w: number; skin: Swatch; lip?: string }> = ({ L, m, w, skin }) => {
  const s = { fill: 'none', stroke: INK, strokeWidth: L.lw * 0.95, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const dark = '#3b1418';
  const g = (c: React.ReactNode) => <g transform={`scale(${w} 1)`}>{c}</g>;
  switch (m) {
    case 'flat': return g(<path d="M -30,0 C -10,3 12,3 30,-1" {...s} />);
    case 'smirk': return g(<><path d="M -28,4 C -6,7 14,3 30,-10" {...s} /><path d="M 31,-17 C 36,-12 36,-6 33,-3" {...s} strokeWidth={L.lw * 0.6} /></>);
    case 'frown': return g(<path d="M -28,8 C -10,-6 10,-6 28,8" {...s} />);
    case 'wobble': return g(<><path d="M -32,8 C -24,-2 -16,-2 -9,4 C -2,10 4,10 10,4 C 17,-2 25,-2 32,8" {...s} /><path d="M -14,20 C -4,24 6,24 14,20" {...s} stroke={skin[3]} strokeWidth={L.lw * 0.5} /></>);
    case 'o': return <><ellipse cx={0} cy={6} rx={15} ry={20} fill={dark} {...{ stroke: INK, strokeWidth: L.lw * 0.9 }} /></>;
    case 'talk': return g(<><path d="M -30,-4 C -10,0 10,0 30,-4 C 22,24 -22,24 -30,-4 Z" fill={dark} /><path d="M -24,-2 C -8,1 8,1 24,-2 L 22,5 C 8,7 -8,7 -22,5 Z" fill="#fff" /><path d="M -30,-4 C -10,0 10,0 30,-4 C 22,24 -22,24 -30,-4 Z" {...s} /></>);
    case 'grin': return g(<>
      <clipPath id="grinclip"><path d="M -56,-10 C -20,-2 20,-2 56,-10 C 46,42 20,58 0,58 C -20,58 -46,42 -56,-10 Z" /></clipPath>
      <path d="M -56,-10 C -20,-2 20,-2 56,-10 C 46,42 20,58 0,58 C -20,58 -46,42 -56,-10 Z" fill={dark} />
      <g clipPath="url(#grinclip)"><path d="M -60,-14 L 60,-14 L 60,10 C 20,16 -20,16 -60,10 Z" fill="#fff" /><ellipse cx={4} cy={58} rx={30} ry={20} fill="#d4606a" /></g>
      <path d="M -56,-10 C -20,-2 20,-2 56,-10 C 46,42 20,58 0,58 C -20,58 -46,42 -56,-10 Z" {...s} />
    </>);
  }
};

// ---------- Nio ----------
const NIO_HEAD = 'M -136,-40 C -138,-250 138,-250 136,-40 C 138,30 132,85 116,118 C 92,166 48,200 0,204 C -48,200 -92,166 -116,118 C -132,85 -138,30 -136,-40 Z';
const NIO_HAIR = 'M -145,-56 C -152,-262 152,-262 145,-56 L 134,-60 C 132,-92 124,-110 112,-122 C 80,-142 40,-148 0,-148 C -40,-148 -80,-142 -112,-122 C -124,-110 -132,-92 -134,-60 Z';
// Hairline x positions (left to right) where each braid part starts; braids sweep straight back over the crown.
const ROWS = [-160, -124, -92, -60, -28, 4, 36, 68, 100, 132, 166];
const hairY = (x: number) => -148 + Math.pow(Math.min(1, Math.abs(x) / 134), 2.2) * 88;
const bez = (a: number[], b: number[], c: number[], d: number[], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); };
const rowPath = (x: number) => [[x, hairY(x)], [x * 1.0, hairY(x) - 50], [x * 0.55, -214], [x * 0.12, -250]];

export const NioHead: React.FC<{ L: Look; id: string; e: Expr; turn?: number }> = ({ L, id, e, turn = 0 }) => {
  const S = PAL.nioSkin, H = PAL.hair, fx = turn * 24;
  return (
    <g>
      {/* ears behind the head */}
      {[-1, 1].map((s) => <Shape key={s} L={L} id={`${id}ear${s}`} sw={S} d={`M ${s * 126},-22 C ${s * 164},-36 ${s * 168},30 ${s * 128},44 Z`} k={0.8} />)}
      <Shape L={L} id={`${id}head`} sw={S} d={NIO_HEAD}
        shadow={`M 40,-120 C 150,-120 160,60 120,130 C 90,170 40,190 0,200 L 200,200 L 200,-200 Z`}
        light={`M -150,-60 C -150,20 -138,80 -112,120 L -132,120 C -150,60 -160,0 -158,-60 Z`} />
      {/* hair: tight cornrows straight back, scalp parts showing between braids */}
      <clipPath id={`${id}hairc`}><path d={NIO_HAIR} /></clipPath>
      <path d={NIO_HAIR} fill={S[1]} />
      <g clipPath={`url(#${id}hairc)`}>
        {ROWS.slice(0, -1).map((x, i) => {
          const a = rowPath(x + 4), b = rowPath(ROWS[i + 1] - 4);
          const braid = `M ${a[0][0]},${a[0][1] + 14} C ${a[1][0]},${a[1][1]} ${a[2][0]},${a[2][1]} ${a[3][0]},${a[3][1]} L ${b[3][0]},${b[3][1]} C ${b[2][0]},${b[2][1]} ${b[1][0]},${b[1][1]} ${b[0][0]},${b[0][1] + 14} C ${b[0][0] - 6},${b[0][1] + 22} ${a[0][0] + 6},${a[0][1] + 22} ${a[0][0]},${a[0][1] + 14} Z`;
          const m = rowPath((x + ROWS[i + 1]) / 2);
          const w = (ROWS[i + 1] - x) * 0.28;
          return (
            <g key={i}>
              <path d={braid} fill={H[0]} />
              {[0.1, 0.26, 0.42, 0.58].map((t) => { const [cx, cy] = bez(m[0], m[1], m[2], m[3], t); const ww = w * (1 - t * 0.5);
                return <path key={t} d={`M ${cx - ww},${cy + 3} L ${cx + ww * 0.2},${cy - 9}`} stroke={H[2]} strokeWidth={L.lw * 0.6} strokeLinecap="round" />; })}
            </g>
          );
        })}
      </g>
      <path d={NIO_HAIR} fill="none" {...ln(L, H)} />
      {/* face */}
      <g transform={`translate(${fx} 0)`}>
        {[-1, 1].map((s, i) => (
          <g key={s} transform={`translate(${s * 60} ${-12}) scale(${s * e.eyeS * (1 - Math.max(0, s * turn) * 0.25)} ${e.eyeS})`}>
            <Eye L={L} id={`${id}eye${s}`} lid={e.lid[i]} tilt={e.tilt[i]} low={e.low[i]} px={s * e.pupil[0]} py={e.pupil[1]} psize={e.psize} shine={e.shine} skin={S} iris="#4a2716" />
          </g>
        ))}
        {[-1, 1].map((s, i) => (
          <g key={s} transform={`translate(${s * 62} -70) scale(${s} 1)`}><Brow raise={e.brow[i]} ang={e.browA[i]} color={H[0]} /></g>
        ))}
        <path d="M 8,26 C 18,50 16,66 2,70" fill="none" stroke={S[3]} strokeWidth={L.lw * 0.75} strokeLinecap="round" />
        <path d="M -14,72 C -8,76 -2,76 2,72" fill="none" stroke={S[3]} strokeWidth={L.lw * 0.55} strokeLinecap="round" />
        {e.blush > 0.05 && [-1, 1].map((s) => <ellipse key={s} cx={s * 84} cy={46} rx={26} ry={12} fill="#e2786a" opacity={0.55 * e.blush} />)}
        <g transform="translate(0 122)"><MouthShape L={L} m={e.mouth} w={e.mw} skin={S} /></g>
        {e.tears > 0.05 && [-1, 1].map((s) => (
          <path key={s} d={`M ${s * 60},8 C ${s * 66},${40 * e.tears} ${s * 58},${90 * e.tears} ${s * 70},${150 * e.tears}`} fill="none" stroke="#9fd6ff" strokeWidth={L.lw * 1.3} strokeLinecap="round" opacity={0.95} />
        ))}
        {e.sweat > 0.05 && <path transform={`translate(132 ${-96}) scale(${e.sweat})`} d="M 0,-26 C 10,-10 16,0 14,8 C 12,20 -12,20 -14,8 C -16,0 -10,-10 0,-26 Z" fill="#a9dcff" {...{ stroke: INK, strokeWidth: L.lw * 0.6 }} />}
      </g>
    </g>
  );
};

/** Nio, head and shoulders in his crewneck. */
export const NioBust: React.FC<{ L: Look; id: string; e: Expr; turn?: number; tilt?: number }> = ({ L, id, e, turn = 0, tilt = 0 }) => {
  const S = PAL.nioSkin, O = PAL.orange;
  return (
    <g>
      <Shape L={L} id={`${id}neck`} sw={S} d="M -62,120 L 62,120 L 66,250 L -66,250 Z" shadow="M -80,100 L 80,100 L 80,200 C 30,215 -30,215 -80,200 Z" />
      <Shape L={L} id={`${id}torso`} sw={O} d="M -250,560 L -236,300 C -228,240 -170,206 -70,196 C -40,232 40,232 70,196 C 170,206 228,240 236,300 L 250,560 Z"
        shadow="M 120,220 C 200,240 240,300 250,560 L 160,560 C 170,420 160,300 120,220 Z"
        light="M -236,300 C -228,240 -190,215 -150,206 C -190,240 -205,300 -210,560 L -250,560 Z" />
      <path d="M -72,198 C -40,240 40,240 72,198" fill="none" stroke={O[1]} strokeWidth={L.lw * 2.2} />
      <path d="M -72,198 C -40,240 40,240 72,198" fill="none" {...ln(L, O)} />
      <g transform={`rotate(${tilt})`}><NioHead L={L} id={id} e={e} turn={turn} /></g>
    </g>
  );
};

// ---------- Maya ----------
const MAYA_HEAD = 'M -138,-30 C -140,-180 140,-180 138,-30 C 140,50 120,120 70,158 C 40,178 -40,178 -70,158 C -120,120 -140,50 -138,-30 Z';
export const MayaHead: React.FC<{ L: Look; id: string; e: Expr }> = ({ L, id, e }) => {
  const S = PAL.mayaSkin, H = PAL.hair, G = PAL.gold;
  const puffs: [number, number, number][] = [[40, -250, 70], [110, -230, 62], [-30, -236, 60], [80, -300, 58], [10, -300, 52], [150, -280, 46], [-60, -200, 46]];
  return (
    <g>
      {/* curly puff, high on the back of the head */}
      {puffs.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + L.lw * 0.5} fill={L.line === 'ink' ? INK : H[3]} />)}
      {puffs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r - L.lw * 0.5} fill={H[0]} />)}
      {L.shade !== 'flat' && puffs.map(([x, y, r], i) => <path key={`h${i}`} d={`M ${x - r * 0.6},${y - r * 0.2} C ${x - r * 0.5},${y - r * 0.6} ${x - r * 0.1},${y - r * 0.75} ${x + r * 0.3},${y - r * 0.6}`} fill="none" stroke={H[2]} strokeWidth={L.lw * 0.8} strokeLinecap="round" />)}
      {[-1, 1].map((s) => <Shape key={s} L={L} id={`${id}ear${s}`} sw={S} d={`M ${s * 128},-14 C ${s * 164},-26 ${s * 168},34 ${s * 130},44 Z`} k={0.8} />)}
      <Shape L={L} id={`${id}head`} sw={S} d={MAYA_HEAD}
        shadow="M 30,-110 C 140,-110 150,60 110,130 C 80,165 40,180 0,190 L 200,200 L 200,-200 Z"
        light="M -138,-40 C -138,30 -126,90 -100,124 L -120,124 C -140,70 -148,10 -146,-40 Z" />
      {/* slicked hairline into the puff, two baby-hair swoops */}
      <Shape L={L} id={`${id}hair`} sw={H} d="M -146,-30 C -160,-170 -60,-200 10,-200 C 90,-200 160,-160 146,-30 C 130,-80 110,-104 60,-112 C 20,-118 -40,-118 -80,-108 C -120,-96 -138,-70 -146,-30 Z" />
      <path d="M -60,-110 C -50,-96 -30,-98 -28,-108 M -20,-114 C -12,-102 6,-104 8,-114" fill="none" stroke={H[0]} strokeWidth={L.lw * 0.9} strokeLinecap="round" />
      {[-1, 1].map((s) => <circle key={s} cx={s * 150} cy={64} r={26} fill="none" stroke={G[0]} strokeWidth={L.lw * 1.2} />)}
      {[-1, 1].map((s, i) => (
        <g key={s} transform={`translate(${s * 58} -6) scale(${s * e.eyeS} ${e.eyeS})`}>
          <Eye L={L} id={`${id}eye${s}`} lid={e.lid[i]} tilt={e.tilt[i]} low={e.low[i]} px={s * e.pupil[0]} py={e.pupil[1]} psize={e.psize} shine={e.shine} skin={S} iris="#2a160c" lashes />
        </g>
      ))}
      {[-1, 1].map((s, i) => <g key={s} transform={`translate(${s * 60} -62) scale(${s} 1)`}><Brow raise={e.brow[i]} ang={e.browA[i]} color={H[0]} thin /></g>)}
      <path d="M 6,24 C 14,42 12,52 0,56" fill="none" stroke={S[3]} strokeWidth={L.lw * 0.7} strokeLinecap="round" />
      <ellipse cx={-80} cy={46} rx={24} ry={11} fill="#c45a52" opacity={0.6} />
      <ellipse cx={80} cy={46} rx={24} ry={11} fill="#c45a52" opacity={0.6} />
      <g transform="translate(0 100)">
        <MouthShape L={L} m={e.mouth} w={e.mw} skin={S} />
        {(e.mouth === 'smirk' || e.mouth === 'flat') && <path d="M -22,6 C -6,14 12,12 24,2 C 12,18 -8,18 -22,6 Z" fill="#7a3a34" opacity={0.85} transform={`scale(${e.mw} 1)`} />}
      </g>
    </g>
  );
};

/** Maya leaning on something with both forearms. */
export const MayaBust: React.FC<{ L: Look; id: string; e: Expr; tilt?: number }> = ({ L, id, e, tilt = 0 }) => {
  const S = PAL.mayaSkin, Gr = PAL.green, C = PAL.cream;
  return (
    <g>
      <Shape L={L} id={`${id}neck`} sw={S} d="M -50,110 L 50,110 L 54,240 L -54,240 Z" shadow="M -80,90 L 80,90 L 80,190 C 30,205 -30,205 -80,190 Z" />
      <Shape L={L} id={`${id}tee`} sw={PAL.white} d="M -90,200 C -40,240 40,240 90,200 L 90,420 L -90,420 Z" />
      <Shape L={L} id={`${id}jL`} sw={Gr} d="M -230,520 L -220,290 C -212,236 -160,206 -86,196 L -60,420 L -40,520 Z" shadow="M -100,200 L -60,420 L -40,520 L -110,520 C -100,400 -110,300 -100,200 Z" />
      <Shape L={L} id={`${id}jR`} sw={Gr} d="M 230,520 L 220,290 C 212,236 160,206 86,196 L 60,420 L 40,520 Z" shadow="M 150,215 C 210,240 225,300 230,520 L 170,520 C 175,400 170,300 150,215 Z" />
      {/* cream sleeves, forearms folded forward */}
      <Shape L={L} id={`${id}sL`} sw={C} d="M -238,330 C -260,420 -250,500 -200,540 L 40,560 L 40,480 L -150,450 C -170,420 -180,380 -180,330 Z" shadow="M -250,480 C -230,520 -200,540 -160,545 L 40,560 L 40,530 L -170,510 Z" />
      <Shape L={L} id={`${id}sR`} sw={C} d="M 238,330 C 260,420 250,500 200,540 L -40,560 L -40,480 L 150,450 C 170,420 180,380 180,330 Z" shadow="M 250,480 C 230,520 200,540 160,545 L -40,560 L -40,530 L 170,510 Z" />
      <g transform={`rotate(${tilt})`}><MayaHead L={L} id={id} e={e} /></g>
    </g>
  );
};

// ---------- Hands: shaped fingers that taper and bend, never tubes ----------
/** A right hand seen from the back, wrapped around a phone whose back faces us. Phone is 120x230 centred on 0,0. */
export const PhoneInHand: React.FC<{ L: Look; id: string }> = ({ L, id }) => {
  const S = PAL.nioSkin;
  const fingers = [
    'M 40,-30 C 10,-46 -30,-52 -58,-48 C -70,-46 -72,-30 -62,-26 C -36,-26 0,-20 30,-6 Z',
    'M 46,4 C 14,-8 -30,-14 -60,-10 C -72,-8 -72,8 -62,11 C -34,12 4,20 34,32 Z',
    'M 46,38 C 14,30 -28,26 -58,30 C -70,32 -70,48 -60,50 C -32,50 6,58 34,66 Z',
    'M 40,70 C 14,66 -18,64 -44,68 C -56,70 -56,84 -46,86 C -22,86 8,92 30,98 Z',
  ];
  return (
    <g>
      <Shape L={L} id={`${id}ph`} sw={['#2b2833', '#1c1a22', '#4a4656', '#0c0b10']} d="M -60,-115 L 60,-115 C 72,-115 78,-108 78,-96 L 78,96 C 78,108 72,115 60,115 L -60,115 C -72,115 -78,108 -78,96 L -78,-96 C -78,-108 -72,-115 -60,-115 Z" light="M -78,-115 L -50,-115 L -50,115 L -78,115 Z" />
      <rect x={-60} y={-100} width={46} height={46} rx={14} fill="#3d3a48" stroke={INK} strokeWidth={L.lw * 0.6} />
      <circle cx={-48} cy={-88} r={8} fill="#111" /><circle cx={-27} cy={-66} r={8} fill="#111" />
      {/* back of the hand and the wrist */}
      <Shape L={L} id={`${id}hb`} sw={S} d="M 30,-30 C 70,-36 96,-10 100,30 C 104,70 96,110 84,150 L 20,160 C 4,110 10,30 30,-30 Z" shadow="M 80,-20 C 100,20 104,80 84,150 L 70,150 C 90,80 90,20 80,-20 Z" />
      {fingers.map((d, i) => <Shape key={i} L={L} id={`${id}f${i}`} sw={S} d={d} k={0.8} />)}
      {/* knuckle creases */}
      {[[-40, -38], [-42, 0], [-40, 40], [-28, 76]].map(([x, y], i) => <path key={i} d={`M ${x},${y - 8} C ${x + 4},${y - 2} ${x + 4},${y + 4} ${x},${y + 8}`} fill="none" stroke={S[3]} strokeWidth={L.lw * 0.45} strokeLinecap="round" />)}
      {/* thumb wraps the right edge from the front; only its tip shows */}
      <Shape L={L} id={`${id}th`} sw={S} d="M 78,-46 C 92,-50 100,-38 96,-24 C 92,-12 84,-8 78,-10 Z" k={0.8} />
    </g>
  );
};
