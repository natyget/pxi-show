import React from 'react';
import { INK } from './ink';

// Nio's apartment, evening. World units: at camera zoom 1 the whole room fills the 270x480 frame.
// The back wall ends at y=330. `z` is the camera zoom, used to keep line weights and dither at one native pixel.
export const ROOM = {
  wall: ['#4d4264', '#665275', '#8a6480', '#bd8480', '#eab88c'], // dark to lamp-lit
  floor: ['#352a3d', '#4a3645', '#6a4a4c'],
  line: '#2b2238', // set lines are a deep violet, lighter than character ink, so the people pop
  sky: ['#1f2552', '#343a80', '#62509a', '#b85f8e', '#ef8a5c', '#f7bd7a'],
  city: '#171937', cityLit: '#ffd98a',
  couch: ['#1f4750', '#2c6468', '#3f8580'],
  pxi: '#a523ef', pxiSoft: '#c58cff',
  lamp: '#f8dca6',
};

export const Dither: React.FC<{ id: string; color: string; z: number }> = ({ id, color, z }) => (
  <pattern id={id} width={2 / z} height={2 / z} patternUnits="userSpaceOnUse">
    <rect x={0} y={0} width={1 / z} height={1 / z} fill={color} />
    <rect x={1 / z} y={1 / z} width={1 / z} height={1 / z} fill={color} />
  </pattern>
);

// A light pool: flat bands, each one fringed with a checker band of its own colour. The show's "pixel light".
export const Pool: React.FC<{ id: string; cx: number; cy: number; rx: number; ry: number; colors: string[]; z: number; fringe?: number }> = ({ id, cx, cy, rx, ry, colors, z, fringe = 7 }) => (
  <g>
    {colors.map((c, i) => {
      const k = 1 - i / colors.length;
      return (
        <g key={i}>
          <Dither id={`${id}${i}`} color={c} z={z} />
          <ellipse cx={cx} cy={cy} rx={rx * k + fringe / z} ry={ry * k + fringe / z} fill={`url(#${id}${i})`} />
          <ellipse cx={cx} cy={cy} rx={rx * k} ry={ry * k} fill={c} />
        </g>
      );
    })}
  </g>
);

const Sneaker: React.FC<{ x: number; y: number; c: string; c2: string; z: number }> = ({ x, y, c, c2, z }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 0 -1 C 0 -7 4 -8 7 -6 C 10 -3 15 -2 18 0 C 20 2 20 4 18 4 L 0 4 Z" fill={c} stroke={ROOM.line} strokeWidth={1 / z} strokeLinejoin="round" />
    <rect x={0} y={2.4} width={19} height={1.6} fill="#efe7df" />
    <path d="M 2 -1 L 9 -1 L 7 -5 Z" fill={c2} />
  </g>
);

export const Apartment: React.FC<{ z: number; lampOn?: boolean }> = ({ z, lampOn = true }) => {
  const px = 1 / z;
  const ln = { fill: 'none', stroke: ROOM.line, strokeWidth: 1 * px, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const W = ROOM.wall;
  const kicks: [string, string][] = [['#f3ede4', '#d9632a'], ['#c8402f', '#1f1a26'], ['#f3ede4', '#a523ef'], ['#2c6468', '#f3ede4'], ['#f0b63c', '#1f1a26'], ['#f3ede4', '#3a66c8'], ['#1f1a26', '#f3ede4'], ['#e88aa8', '#f3ede4']];
  return (
    <g>
      {/* back wall */}
      <rect x={-200} y={-200} width={670} height={530} fill={W[0]} />
      {lampOn && <Pool id="lp" cx={138} cy={176} rx={118} ry={150} colors={[W[1], W[2], W[3], W[4]]} z={z} />}
      {/* window: blue hour over the city */}
      <clipPath id="win"><rect x={150} y={64} width={112} height={172} /></clipPath>
      <g clipPath="url(#win)">
        {ROOM.sky.map((c, i) => <rect key={i} x={150} y={64 + [0, 44, 76, 100, 118, 132][i]} width={112} height={180} fill={c} />)}
        {ROOM.sky.slice(1).map((c, i) => (
          <g key={`d${i}`}><Dither id={`sk${i}`} color={c} z={z} /><rect x={150} y={64 + [44, 76, 100, 118, 132][i] - 5} width={112} height={5} fill={`url(#sk${i})`} /></g>
        ))}
        <path d="M 150 236 V 196 H 160 V 178 H 172 V 204 H 180 V 160 H 186 V 152 H 196 V 204 H 204 V 186 H 216 V 170 H 222 V 210 H 232 V 190 H 246 V 174 H 254 V 200 H 262 V 236 Z" fill={ROOM.city} />
        {[[162, 184], [166, 192], [182, 166], [188, 160], [190, 176], [184, 190], [208, 192], [218, 178], [236, 196], [248, 180], [250, 190], [240, 210], [174, 212], [200, 214], [226, 218]].map((p, i) => (
          <rect key={i} x={p[0]} y={p[1]} width={2} height={2} fill={i % 5 === 2 ? ROOM.pxiSoft : ROOM.cityLit} />
        ))}
        <rect x={205} y={196} width={10} height={5} fill={ROOM.pxi} />
      </g>
      <path d="M 150 64 H 262 V 236 H 150 Z M 206 64 V 236 M 150 118 H 262" {...ln} strokeWidth={2 * px} />
      <rect x={146} y={236} width={120} height={5} fill={W[1]} stroke={ROOM.line} strokeWidth={1 * px} />
      {/* baseboard and floor */}
      <rect x={-200} y={322} width={670} height={8} fill={W[0]} stroke={ROOM.line} strokeWidth={1 * px} />
      <rect x={-200} y={330} width={670} height={400} fill={ROOM.floor[0]} />
      {lampOn && <Pool id="fp" cx={138} cy={352} rx={120} ry={34} colors={[ROOM.floor[1], ROOM.floor[2]]} z={z} fringe={5} />}
      {[346, 368, 398, 436].map((y) => <path key={y} d={`M -200 ${y} H 470`} stroke={ROOM.line} strokeWidth={1 * px} opacity={0.6} />)}
      {/* sneaker shelf with a PXI-purple light under every shelf */}
      <rect x={8} y={118} width={62} height={206} fill="#2f2640" stroke={ROOM.line} strokeWidth={2 * px} />
      {[0, 1, 2, 3].map((r) => {
        const y = 118 + r * 51;
        return (
          <g key={r}>
            <rect x={10} y={y + 4} width={58} height={44} fill="#3b2f55" />
            <Dither id={`sh${r}`} color="#6a3fa8" z={z} />
            <rect x={10} y={y + 4} width={58} height={7} fill="#6a3fa8" />
            <rect x={10} y={y + 11} width={58} height={7} fill={`url(#sh${r})`} />
            <rect x={10} y={y + 3} width={58} height={2 * px} fill={ROOM.pxiSoft} />
            <Sneaker x={14} y={y + 43} c={kicks[r * 2][0]} c2={kicks[r * 2][1]} z={z} />
            <Sneaker x={42} y={y + 43} c={kicks[r * 2 + 1][0]} c2={kicks[r * 2 + 1][1]} z={z} />
            <rect x={8} y={y + 48} width={62} height={3} fill="#2f2640" stroke={ROOM.line} strokeWidth={1 * px} />
          </g>
        );
      })}
      {/* the cube he solves without looking */}
      <g transform="translate(18 109)">
        <rect x={0} y={0} width={9} height={9} fill="#f3ede4" stroke={ROOM.line} strokeWidth={1 * px} />
        {[['#d9632a', 0, 0], ['#3a66c8', 3, 0], ['#f0b63c', 6, 0], ['#3f8580', 0, 3], ['#c8402f', 3, 3], ['#f3ede4', 6, 3], ['#f0b63c', 0, 6], ['#3a66c8', 3, 6], ['#c8402f', 6, 6]].map((q, i) => (
          <rect key={i} x={q[1] as number} y={q[2] as number} width={3} height={3} fill={q[0] as string} />
        ))}
      </g>
      {/* floor lamp */}
      <path d="M 138 330 V 164" stroke={ROOM.line} strokeWidth={2 * px} />
      <path d="M 128 330 H 148" stroke={ROOM.line} strokeWidth={3 * px} strokeLinecap="round" />
      <path d="M 126 136 H 150 L 156 166 H 120 Z" fill={lampOn ? ROOM.lamp : '#8a7a8a'} stroke={ROOM.line} strokeWidth={2 * px} strokeLinejoin="round" />
      {lampOn && <path d="M 124 162 H 152" stroke="#fff6dc" strokeWidth={2 * px} />}
      {/* rug and couch */}
      <path d="M 96 352 H 300 L 320 398 H 76 Z" fill="#5d4468" stroke={ROOM.line} strokeWidth={1 * px} />
      <path d="M 104 358 H 294 L 310 392 H 88 Z" fill="none" stroke="#7d5c84" strokeWidth={1 * px} />
      <g>
        <rect x={150} y={338} width={4} height={10} fill={ROOM.line} /><rect x={276} y={338} width={4} height={10} fill={ROOM.line} />
        <path d="M 148 262 C 148 254 154 250 162 250 H 290 V 300 H 148 Z" fill={ROOM.couch[1]} stroke={ROOM.line} strokeWidth={2 * px} strokeLinejoin="round" />
        <path d="M 148 262 C 148 254 154 250 162 250 H 290 V 258 H 160 C 154 258 150 262 148 268 Z" fill={ROOM.couch[2]} />
        <path d="M 140 296 H 290 V 340 H 140 Z" fill={ROOM.couch[1]} stroke={ROOM.line} strokeWidth={2 * px} strokeLinejoin="round" />
        <path d="M 140 318 H 290 V 340 H 140 Z" fill={ROOM.couch[0]} />
        <path d="M 132 284 C 132 276 138 272 146 272 C 154 272 158 278 158 284 V 340 H 132 Z" fill={ROOM.couch[1]} stroke={ROOM.line} strokeWidth={2 * px} strokeLinejoin="round" />
        <path d="M 132 284 C 132 276 138 272 146 272 C 154 272 158 278 158 284 V 290 C 150 284 140 284 132 290 Z" fill={ROOM.couch[2]} />
        <path d="M 222 296 V 318 M 158 318 H 290" {...ln} />
        <path d="M 236 268 L 262 264 L 268 290 L 242 296 Z" fill="#7a3fc0" stroke={ROOM.line} strokeWidth={1 * px} strokeLinejoin="round" />
      </g>
    </g>
  );
};

// Foreground for wide shots: the edge of his desk and the laptop he builds PXI on, drawn over the characters.
export const ApartmentFG: React.FC<{ z: number }> = ({ z }) => {
  const px = 1 / z;
  return (
    <g>
      <Dither id="fgd" color="#6a3fa8" z={z} />
      <path d="M -200 452 L 470 444 V 700 H -200 Z" fill="#1c1526" />
      <path d="M -200 452 L 470 444" stroke="#3b2f55" strokeWidth={1 * px} />
      <ellipse cx={199} cy={447} rx={62} ry={9} fill="url(#fgd)" />
      <g transform="translate(136 0)">
        <path d="M 24 406 C 24 402 27 400 31 400 H 96 C 100 400 102 402 102 406 V 447 H 24 Z" fill="#241c30" stroke={INK} strokeWidth={2 * px} strokeLinejoin="round" />
        <path d="M 24 406 C 24 402 27 400 31 400 H 96 C 100 400 102 402 102 406" fill="none" stroke={ROOM.pxiSoft} strokeWidth={1 * px} />
        <rect x={59} y={420} width={8} height={8} rx={2} fill={ROOM.pxi} />
      </g>
      <path d="M 96 432 h 16 v 17 h -16 Z M 112 436 h 5 v 8 h -5" fill="#241c30" stroke={INK} strokeWidth={2 * px} strokeLinejoin="round" />
    </g>
  );
};

export const Cam: React.FC<{ x: number; y: number; z: number; rot?: number; children: React.ReactNode }> = ({ x, y, z, rot = 0, children }) => (
  <g transform={`translate(135 240) rotate(${rot}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
);
