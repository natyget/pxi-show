// Round 2 look test: Nio in three-quarter view at night, lit by his phone. Drawn smooth at full size, then reduced to a
// pixel grid and snapped to a fixed, hue-shifted palette by tools/pixelize.py (no blur, no dither, no stray colours).
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const C = {
  ink: '#1b1424',
  night0: '#141a33', night1: '#1f2a4d', night2: '#2c3c66', night3: '#3e5488',
  win0: '#26335e', win1: '#3a4f86', city: '#11152a', lamp: '#ffcf7a', lampDim: '#c98a4a',
  skin: '#c78d68', skinSh: '#8c5c5a', skinDeep: '#5c3a4a', skinGlow: '#f0caa6', skinCool: '#9fc6d2',
  hair: '#17121c', hairHi: '#3d3150', part: '#6e4a52',
  top: '#d0602f', topSh: '#8e3a2e', topDeep: '#5a2530', topGlow: '#f08f5a',
  white: '#f4efe6', iris: '#3a2018',
  screen: '#d9f6ff', screenEdge: '#8fd8ee', phone: '#22202c',
};

const HEAD = 'M 150,-20 C 160,-120 90,-204 -10,-204 C -92,-204 -136,-152 -140,-82 C -142,-52 -138,-36 -146,-20 C -152,-4 -162,22 -172,46 C -177,57 -169,66 -153,66 C -150,76 -147,84 -145,92 C -147,101 -143,110 -141,117 C -140,129 -135,141 -126,151 C -112,172 -80,178 -50,168 C 0,152 50,122 80,82 C 120,60 150,30 150,-20 Z';
const HAIR = 'M -136,-104 C -142,-164 -82,-218 -10,-218 C 100,-218 172,-130 164,-12 C 160,30 146,64 124,80 C 104,64 84,44 66,24 C 50,6 34,-14 14,-34 C -20,-62 -70,-92 -136,-104 Z';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bez = (p: number[][], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
// hairline (front, rounded) and the nape line (back); braids run from one to the other, straight back
const FRONT = [[-136, -104], [-90, -96], [-20, -60], [30, -16]];
const BACK = [[-20, -232], [110, -200], [178, -80], [128, 82]];
const row = (u: number) => {
  const a = bez(FRONT, u), b = bez(BACK, u);
  const lift = 60 * (1 - u);
  return [a, [lerp(a[0], b[0], 0.33), lerp(a[1], b[1], 0.33) - lift], [lerp(a[0], b[0], 0.7), lerp(a[1], b[1], 0.7) - lift * 0.6], b];
};
const pathOf = (r: number[][]) => `M ${r[0][0]},${r[0][1]} C ${r[1][0]},${r[1][1]} ${r[2][0]},${r[2][1]} ${r[3][0]},${r[3][1]}`;

export type Face = { lid: number; look: [number, number]; brow: number; browIn: number; mouth: 'rest' | 'smirk' | 'open' | 'tight'; glow: number };
export const REST: Face = { lid: 0.48, look: [-0.7, 0.7], brow: 0, browIn: 0, mouth: 'rest', glow: 1 };

const Eye: React.FC<{ x: number; y: number; w: number; f: Face; id: string; far?: boolean }> = ({ x, y, w, f, id, far }) => {
  const h = 26;
  const shape = `M ${-w / 2},2 C ${-w / 4},${-h} ${w / 3},${-h} ${w / 2},-2 C ${w / 3},${h * 0.55} ${-w / 4},${h * 0.6} ${-w / 2},2 Z`;
  const lidY = -h + f.lid * (h * 1.6);
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={id}><path d={shape} /></clipPath>
      <path d={shape} fill={C.white} />
      <g clipPath={`url(#${id})`}>
        <circle cx={f.look[0] * w * 0.22} cy={f.look[1] * 6 + 2} r={far ? 10 : 13} fill={C.iris} />
        <circle cx={f.look[0] * w * 0.22} cy={f.look[1] * 6 + 2} r={far ? 5 : 6.5} fill={C.ink} />
        <circle cx={f.look[0] * w * 0.22 - 5} cy={f.look[1] * 6 - 3} r={3} fill={C.screen} />
        <path d={`M ${-w},${lidY + 6} C ${-w / 3},${lidY - 3} ${w / 3},${lidY - 3} ${w},${lidY + 4} L ${w},-60 L ${-w},-60 Z`} fill={C.skinSh} />
        <path d={`M ${-w},${lidY + 6} C ${-w / 3},${lidY - 3} ${w / 3},${lidY - 3} ${w},${lidY + 4}`} fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
      {/* crease above the hooded lid, and the lash line */}
      <path d={`M ${-w / 2 - 2},-6 C ${-w / 4},${-h - 8} ${w / 3},${-h - 8} ${w / 2 + 4},-8`} fill="none" stroke={C.skinDeep} strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${-w / 2},2 C ${-w / 4},${-h} ${w / 3},${-h} ${w / 2},-2`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

export const NioHead34: React.FC<{ f: Face; id: string }> = ({ f, id }) => {
  const mouth = {
    rest: 'M -140,104 C -126,108 -108,108 -88,101',
    smirk: 'M -140,106 C -124,108 -104,102 -84,90',
    tight: 'M -140,104 C -124,103 -108,103 -92,104',
    open: 'M -140,100 C -124,104 -106,104 -90,98 C -96,124 -132,126 -140,100 Z',
  }[f.mouth];
  return (
    <g>
      {/* neck */}
      <path d="M -70,130 L 80,70 L 96,330 L -78,330 Z" fill={C.skinSh} />
      <path d="M -70,130 C -40,180 20,170 80,100 L 84,160 C 20,210 -40,210 -74,180 Z" fill={C.skinDeep} />
      <clipPath id={`${id}h`}><path d={HEAD} /></clipPath>
      <path d={HEAD} fill={C.skin} />
      <g clipPath={`url(#${id}h)`}>
        {/* form shadow: the side of the head away from the phone */}
        <path d="M -40,-220 C 40,-120 30,20 -30,180 L 220,220 L 220,-220 Z" fill={C.skinSh} />
        <path d="M 60,-220 C 120,-100 120,40 60,200 L 220,220 L 220,-220 Z" fill={C.skinDeep} opacity={0.75} />
        {/* phone glow from below-left: cool rim on the front planes */}
        {f.glow > 0 && <path d="M -200,0 C -160,10 -150,60 -146,100 C -144,140 -120,170 -60,180 L -200,220 Z" fill={C.skinCool} opacity={0.9 * f.glow} />}
        <path d="M -150,-90 C -120,-120 -80,-120 -60,-100 C -90,-80 -120,-60 -140,-40 Z" fill={C.skinGlow} />
        {/* cheek plane */}
        <path d="M -100,40 C -70,30 -40,50 -40,80 C -60,90 -90,80 -100,40 Z" fill={C.skinGlow} opacity={0.55} />
      </g>
      <path d={HEAD} fill="none" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {/* ear */}
      <path d="M 40,-14 C 66,-34 96,-10 88,30 C 82,58 58,66 46,52 C 40,30 40,10 40,-14 Z" fill={C.skinSh} stroke={C.ink} strokeWidth={6} />
      <path d="M 54,2 C 68,-8 78,8 72,26 C 68,38 60,40 56,34" fill="none" stroke={C.skinDeep} strokeWidth={5} strokeLinecap="round" />
      {/* cornrows: dark braids, thin scalp parts, straight back to the nape */}
      <clipPath id={`${id}hr`}><path d={HAIR} /></clipPath>
      <path d={HAIR} fill={C.part} />
      <g clipPath={`url(#${id}hr)`}>
        {Array.from({ length: 9 }, (_, i) => {
          const r = row((i + 0.5) / 9);
          return (
            <g key={i}>
              <path d={pathOf(r)} fill="none" stroke={C.hair} strokeWidth={30} strokeLinecap="round" />
              {Array.from({ length: 9 }, (_, j) => {
                const t = 0.06 + j * 0.11; const [x1, y1] = bez(r, t); const [x2, y2] = bez(r, t + 0.04);
                return <path key={j} d={`M ${x1 - 3},${y1 + 8} L ${x2 + 3},${y2 - 8}`} stroke={C.hairHi} strokeWidth={6} strokeLinecap="round" />;
              })}
            </g>
          );
        })}
      </g>
      <path d={HAIR} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* brows: soft, a little heavy, set close to the eyes */}
      <path transform={`translate(0 ${-f.brow * 14})`} d={`M -142,${-44 + f.browIn * 8} C -128,-56 -110,-58 -96,-54 L -98,-46 C -112,-48 -128,-46 -140,${-36 + f.browIn * 8} Z`} fill={C.hair} />
      <path transform={`translate(0 ${-f.brow * 14})`} d={`M -76,${-54 + f.browIn * 10} C -52,-64 -20,-64 6,-52 L 4,-42 C -20,-52 -50,-52 -74,${-42 + f.browIn * 10} Z`} fill={C.hair} />
      <Eye x={-124} y={-12} w={30} f={f} id={`${id}e1`} far />
      <Eye x={-40} y={-10} w={58} f={f} id={`${id}e2`} />
      {/* nose: the bridge is the silhouette; just the wing and nostril */}
      <path d="M -140,58 C -132,64 -126,62 -122,54" fill="none" stroke={C.skinDeep} strokeWidth={6} strokeLinecap="round" />
      <path d={mouth} fill={f.mouth === 'open' ? '#3b1420' : 'none'} stroke={C.ink} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -132,128 C -120,132 -108,130 -100,124" fill="none" stroke={C.skinSh} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** The full frame: night, his room, phone low in his left hand lighting him. */
export const NioNight: React.FC<{ f?: Face }> = ({ f = REST }) => (
  <AbsoluteFill style={{ background: C.night0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect width={1080} height={1920} fill={C.night1} />
      {/* window: city at night, out of focus lights */}
      <rect x={560} y={120} width={460} height={760} fill={C.win0} />
      <rect x={560} y={500} width={460} height={380} fill={C.win1} />
      {[[600, 560, 30], [700, 620, 22], [820, 540, 36], [930, 640, 26], [640, 760, 40], [880, 780, 30], [980, 720, 18], [760, 700, 16]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? C.lamp : i % 3 === 1 ? C.lampDim : C.screenEdge} opacity={0.55} />
      ))}
      <path d="M 560,880 L 560,700 L 620,700 L 620,640 L 700,640 L 700,760 L 780,760 L 780,600 L 860,600 L 860,720 L 940,720 L 940,660 L 1020,660 L 1020,880 Z" fill={C.city} />
      <path d="M 548,108 L 1032,108 L 1032,892 L 548,892 Z M 790,108 L 790,892" fill="none" stroke={C.night0} strokeWidth={24} />
      <rect x={530} y={890} width={520} height={30} fill={C.night2} />
      {/* his things, in a dead straight line on the shelf: the OCD-clean apartment */}
      <rect x={40} y={760} width={420} height={18} fill={C.night2} />
      {[60, 150, 240, 330].map((x) => <rect key={x} x={x} y={700} width={70} height={60} rx={10} fill={C.night3} />)}
      {/* body, three-quarter, leaning toward the phone */}
      <g transform="translate(520 1230)">
        <path d="M -330,690 C -340,420 -300,250 -180,190 C -120,160 -40,150 20,150 C 140,150 260,200 320,320 C 360,420 360,560 350,690 Z" fill={C.top} />
        <path d="M 60,160 C 200,180 300,260 330,400 C 350,500 350,600 350,690 L 120,690 C 160,520 140,300 60,160 Z" fill={C.topSh} />
        <path d="M 230,260 C 300,340 330,460 340,690 L 280,690 C 290,520 280,380 230,260 Z" fill={C.topDeep} />
        <path d="M -330,690 C -340,520 -320,380 -260,300 C -280,420 -280,560 -260,690 Z" fill={C.topGlow} />
        <path d="M -330,690 C -340,420 -300,250 -180,190 C -120,160 -40,150 20,150 C 140,150 260,200 320,320 C 360,420 360,560 350,690" fill="none" stroke={C.ink} strokeWidth={7} />
        <path d="M -130,170 C -80,230 40,230 90,160" fill="none" stroke={C.topSh} strokeWidth={22} />
        <path d="M -130,170 C -80,230 40,230 90,160" fill="none" stroke={C.ink} strokeWidth={6} />
      </g>
      <g transform="translate(560 900) rotate(-6) scale(1.55)"><NioHead34 f={f} id="n" /></g>
      {/* phone, low, its glow */}
      <g transform="translate(250 1620) rotate(-18)">
        <ellipse cx={20} cy={-80} rx={260} ry={200} fill={C.screenEdge} opacity={0.12} />
        <rect x={-80} y={-150} width={160} height={300} rx={26} fill={C.phone} stroke={C.ink} strokeWidth={7} />
        <rect x={-68} y={-138} width={136} height={276} rx={18} fill={C.screen} />
        {/* left hand from the back: knuckles over the top edge, thumb along the side */}
        <path d="M -96,40 C -110,0 -100,-60 -80,-70 C -60,-74 -54,-40 -60,0 L -40,140 L -120,160 Z" fill={C.skinSh} stroke={C.ink} strokeWidth={6} />
        <path d="M 60,170 C 70,110 96,80 110,70 C 124,64 132,76 124,92 C 112,120 100,160 100,200 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
        <path d="M -120,160 L 110,180 L 120,320 L -140,320 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
        {[-80, -20, 40].map((x) => <path key={x} d={`M ${x},160 C ${x + 6},176 ${x + 30},178 ${x + 40},166`} fill="none" stroke={C.skinDeep} strokeWidth={5} strokeLinecap="round" />)}
      </g>
    </svg>
  </AbsoluteFill>
);
