import React from 'react';
import { INK } from './ink';

// Nio's apartment as a real room. Everything is placed in centimetres (x right, y up, z into the room) and
// projected through a camera, so a shot can stand anywhere: low, high, over a shoulder, in the corner.
// The room is 500 wide, 400 deep, 270 high. The back wall is z=400, the left wall x=0, the right wall x=500.
export type V3 = [number, number, number];
export type Camera = { pos: V3; yaw: number; pitch: number; f: number }; // degrees; f is the focal length in native pixels
const CX = 135, CY = 240, NEAR = 8;

const toCam = (c: Camera, p: V3): V3 => {
  const a = (c.yaw * Math.PI) / 180, b = (c.pitch * Math.PI) / 180;
  const dx = p[0] - c.pos[0], dy = p[1] - c.pos[1], dz = p[2] - c.pos[2];
  const x1 = dx * Math.cos(a) - dz * Math.sin(a), z1 = dx * Math.sin(a) + dz * Math.cos(a);
  return [x1, dy * Math.cos(b) - z1 * Math.sin(b), dy * Math.sin(b) + z1 * Math.cos(b)];
};
const toScreen = (c: Camera, q: V3): [number, number] => [CX + (c.f * q[0]) / q[2], CY - (c.f * q[1]) / q[2]];
export const project = (c: Camera, p: V3): { x: number; y: number; d: number } => {
  const q = toCam(c, p);
  const z = Math.max(q[2], NEAR);
  return { x: CX + (c.f * q[0]) / z, y: CY - (c.f * q[1]) / z, d: q[2] };
};
// Project a polygon, clipping the part that falls behind the camera.
const polyD = (c: Camera, pts: V3[], close = true): string | null => {
  const q = pts.map((p) => toCam(c, p));
  const out: V3[] = [];
  const n = q.length;
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const a = q[i], b = q[(i + 1) % n];
    const ina = a[2] >= NEAR, inb = b[2] >= NEAR;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
    }
  }
  if (!close && q[n - 1][2] >= NEAR) out.push(q[n - 1]);
  if (out.length < 2) return null;
  return out.map((p, i) => { const s = toScreen(c, p); return `${i ? 'L' : 'M'} ${s[0].toFixed(1)} ${s[1].toFixed(1)}`; }).join(' ') + (close ? ' Z' : '');
};
const depth = (c: Camera, pts: V3[]) => pts.reduce((s, p) => s + toCam(c, p)[2], 0) / pts.length;

export const C3 = {
  wall: ['#51485a', '#5f5366', '#74606c', '#96746f', '#d0a584'], // dark to lamp-lit, greyed down
  wallSide: '#48404f', ceil: '#3d3644',
  floor: ['#3a3038', '#4b3b40', '#644a46'],
  line: '#2a2330',
  sky: ['#232846', '#363a68', '#5a4d7c', '#9a5d78', '#c98060', '#d9a878'],
  city: '#1a1b30', cityLit: '#e8c98a',
  couch: { top: '#4a7c78', front: '#35605f', side: '#284a4c' },
  wood: { top: '#6a5048', front: '#4f3b38', side: '#3d2e2e' },
  dark: { top: '#3a3144', front: '#2c2535', side: '#221c2a' },
  pxi: '#a523ef', pxiSoft: '#c58cff', lamp: '#f0d6a4',
};

type Tone = { top: string; front: string; side: string };
type Item = { d: number; el: React.ReactNode };

const Poly: React.FC<{ c: Camera; pts: V3[]; fill: string; stroke?: string; sw?: number }> = ({ c, pts, fill, stroke, sw = 1 }) => {
  const d = polyD(c, pts);
  return d ? <path d={d} fill={fill} stroke={stroke ?? 'none'} strokeWidth={sw} strokeLinejoin="round" /> : null;
};
const Line: React.FC<{ c: Camera; pts: V3[]; stroke?: string; sw?: number; op?: number }> = ({ c, pts, stroke = C3.line, sw = 1, op = 1 }) => {
  const d = polyD(c, pts, false);
  return d ? <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity={op} /> : null;
};
// A box shows only the faces that look at the camera, each in its own tone, so furniture has real form.
const Box: React.FC<{ c: Camera; b: [number, number, number, number, number, number]; t: Tone; sw?: number; line?: string }> = ({ c, b, t, sw = 1, line = C3.line }) => {
  const [x0, x1, y0, y1, z0, z1] = b;
  const f: React.ReactNode[] = [];
  const P = (k: string, pts: V3[], fill: string) => f.push(<Poly key={k} c={c} pts={pts} fill={fill} stroke={line} sw={sw} />);
  if (c.pos[2] > z1) P('bk', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], t.side);
  if (c.pos[0] < x0) P('l', [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], t.side);
  if (c.pos[0] > x1) P('r', [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], t.side);
  if (c.pos[1] < y0) P('b', [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], t.side);
  if (c.pos[2] < z0) P('f', [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], t.front);
  if (c.pos[1] > y1) P('t', [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], t.top);
  return <>{f}</>;
};
const boxD = (c: Camera, b: number[]) => depth(c, [[(b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2]]);

const circle = (o: V3, u: V3, v: V3, r: number, n = 36): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, cu = Math.cos(a) * r, sv = Math.sin(a) * r;
    return [o[0] + u[0] * cu + v[0] * sv, o[1] + u[1] * cu + v[1] * sv, o[2] + u[2] * cu + v[2] * sv] as V3;
  });
const dz = (color: string) => `url(#dz${color.slice(1)})`;
export const DitherDefs: React.FC<{ colors: string[] }> = ({ colors }) => (
  <defs>
    {colors.map((c) => (
      <pattern key={c} id={`dz${c.slice(1)}`} width={2} height={2} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={1} height={1} fill={c} /><rect x={1} y={1} width={1} height={1} fill={c} />
      </pattern>
    ))}
  </defs>
);
// Pixel light: flat bands, each fringed with a checkerboard of its own colour, lying on a wall or the floor.
const Pool: React.FC<{ c: Camera; o: V3; u: V3; v: V3; r: number; colors: string[]; squash?: number }> = ({ c, o, u, v, r, colors, squash = 1 }) => (
  <>
    {colors.map((col, i) => {
      const k = r * (1 - i / colors.length);
      const vv: V3 = [v[0] * squash, v[1] * squash, v[2] * squash];
      return (
        <g key={i}>
          <Poly c={c} pts={circle(o, u, vv, k + 9)} fill={dz(col)} />
          <Poly c={c} pts={circle(o, u, vv, k)} fill={col} />
        </g>
      );
    })}
  </>
);

const KICKS: [string, string][] = [['#e6dfd6', '#b8603a'], ['#a8463a', '#221c2a'], ['#e6dfd6', '#8a3fc0'], ['#35605f', '#e6dfd6'], ['#c9a04a', '#221c2a'], ['#e6dfd6', '#4a66a8'], ['#221c2a', '#e6dfd6'], ['#c88a9c', '#e6dfd6']];

export type Actor = { at: [number, number]; flip?: boolean; height?: number; render: (s: number) => React.ReactNode };

export const Room: React.FC<{ cam: Camera; actors?: Actor[]; lampOn?: boolean }> = ({ cam: c, actors = [], lampOn = true }) => {
  const W = C3.wall;
  const items: Item[] = [];
  const add = (d: number, el: React.ReactNode) => items.push({ d, el });
  const yawR = (c.yaw * Math.PI) / 180;
  const right: V3 = [Math.cos(yawR), 0, -Math.sin(yawR)];

  // --- furniture, sorted far to near with the actors ---
  // couch under the window
  add(boxD(c, [250, 470, 0, 88, 315, 396]), (
    <g>
      {[[256, 262, 0, 12, 320, 326], [458, 464, 0, 12, 320, 326]].map((b, i) => <Box key={i} c={c} b={b as any} t={C3.dark} />)}
      <Box c={c} b={[250, 470, 42, 90, 380, 397]} t={C3.couch} sw={2} />
      <Box c={c} b={[250, 470, 12, 44, 315, 397]} t={C3.couch} sw={2} />
      <Box c={c} b={[268, 452, 44, 52, 318, 380]} t={{ top: '#568a84', front: '#3d6c69', side: C3.couch.side }} />
      <Line c={c} pts={[[360, 52, 318], [360, 52, 380]]} />
      <Line c={c} pts={[[360, 44, 318], [360, 52, 318]]} />
      {[[250, 268], [452, 470]].map((x, i) => <Box key={i} c={c} b={[x[0], x[1], 12, 62, 313, 397]} t={C3.couch} sw={2} />)}
      <Poly c={c} pts={[[400, 54, 366], [436, 54, 362], [440, 88, 374], [404, 90, 378]]} fill="#6e4a9a" stroke={C3.line} />
    </g>
  ));
  // coffee table with his cube and a mug
  add(boxD(c, [300, 420, 0, 36, 225, 285]), (
    <g>
      {[[304, 229], [412, 229], [304, 279], [412, 279]].map((p, i) => <Box key={i} c={c} b={[p[0], p[0] + 4, 0, 30, p[1], p[1] + 4]} t={C3.wood} />)}
      <Box c={c} b={[298, 422, 30, 36, 223, 287]} t={C3.wood} sw={2} />
      <Box c={c} b={[330, 340, 36, 46, 250, 260]} t={{ top: '#c9a04a', front: '#a8463a', side: '#4a66a8' }} />
      <Box c={c} b={[384, 393, 36, 47, 240, 249]} t={{ top: '#2c2535', front: '#e6dfd6', side: '#c4bcc4' }} />
    </g>
  ));
  // sneaker shelf on the left wall, a PXI-purple light under every shelf
  add(boxD(c, [0, 34, 0, 200, 150, 290]) + 20, (
    <g>
      <Box c={c} b={[0, 34, 0, 204, 146, 294]} t={C3.dark} sw={2} />
      {[0, 1, 2, 3].map((r) => {
        const y0 = 6 + r * 50;
        return (
          <g key={r}>
            <Poly c={c} pts={[[34, y0, 150], [34, y0, 290], [34, y0 + 44, 290], [34, y0 + 44, 150]]} fill="#3a3048" stroke={C3.line} />
            <Poly c={c} pts={[[34, y0 + 30, 150], [34, y0 + 30, 290], [34, y0 + 44, 290], [34, y0 + 44, 150]]} fill={dz('#6a4a94')} />
            <Poly c={c} pts={[[34, y0 + 38, 150], [34, y0 + 38, 290], [34, y0 + 44, 290], [34, y0 + 44, 150]]} fill="#6a4a94" />
            <Line c={c} pts={[[34, y0 + 44, 150], [34, y0 + 44, 290]]} stroke={C3.pxiSoft} />
            {depth(c, [[34, 100, 220]]) > 60 && toCam(c, [34, 100, 150])[2] > NEAR + 2 && toCam(c, [34, 100, 290])[2] > NEAR + 2 && [0, 1, 2].map((k) => {
              const o = project(c, [34.5, y0, 160 + k * 44]), u = project(c, [34.5, y0, 161 + k * 44]), v = project(c, [34.5, y0 + 1, 160 + k * 44]);
              const col = KICKS[(r * 3 + k) % KICKS.length];
              return (
                <g key={k} transform={`matrix(${u.x - o.x} ${u.y - o.y} ${o.x - v.x} ${o.y - v.y} ${o.x} ${o.y})`}>
                  <path d="M 0 -2 C 0 -11 6 -13 10 -10 C 15 -5 24 -4 29 -1 C 32 1 32 0 32 0 L 0 0 Z" fill={col[0]} stroke={C3.line} strokeWidth={0.6} strokeLinejoin="round" />
                  <path d="M 3 -3 L 14 -3 L 11 -9 Z" fill={col[1]} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  ));
  // floor lamp
  const lampTop: V3 = [215, 150, 372];
  const sh = (w: number, y: number): V3[] => [[215 - right[0] * w, y, 372 - right[2] * w], [215 + right[0] * w, y, 372 + right[2] * w]];
  add(depth(c, [lampTop]), (
    <g>
      <Poly c={c} pts={circle([215, 0.6, 372], [1, 0, 0], [0, 0, 1], 14, 16)} fill={C3.dark.front} stroke={C3.line} />
      <Line c={c} pts={[[215, 0, 372], lampTop]} sw={2} />
      <Poly c={c} pts={[sh(13, 182)[0], sh(13, 182)[1], sh(21, 146)[1], sh(21, 146)[0]]} fill={lampOn ? C3.lamp : '#7c7080'} stroke={C3.line} sw={2} />
      {lampOn && <Line c={c} pts={sh(18, 150)} stroke="#fff3d6" sw={1} />}
    </g>
  ));
  // desk on the right wall with the laptop he builds PXI on
  add(boxD(c, [430, 500, 0, 74, 60, 200]), (
    <g>
      {[[434, 64], [434, 192]].map((p, i) => <Box key={i} c={c} b={[p[0], p[0] + 5, 0, 70, p[1], p[1] + 5]} t={C3.wood} />)}
      <Box c={c} b={[428, 500, 70, 76, 58, 202]} t={C3.wood} sw={2} />
      <Box c={c} b={[452, 480, 76, 78, 112, 152]} t={C3.dark} />
      <Poly c={c} pts={[[480, 77, 112], [480, 77, 152], [488, 102, 152], [488, 102, 112]]} fill={C3.pxiSoft} stroke={C3.line} sw={2} />
      <Poly c={c} pts={[[481, 80, 116], [481, 80, 148], [487, 99, 148], [487, 99, 116]]} fill="#1d1626" />
      <Poly c={c} pts={[[482, 84, 120], [482, 84, 136], [484, 90, 136], [484, 90, 120]]} fill={C3.pxi} />
    </g>
  ));
  // actors: flat drawings that stand in the room at their real depth, each with a floor shadow
  actors.forEach((a, i) => {
    const o = project(c, [a.at[0], 0, a.at[1]]);
    if (o.d < NEAR + 4) return;
    const s = ((a.height ?? 176) / 634) * (c.f / o.d);
    add(o.d, (
      <g key={`a${i}`}>
        <Poly c={c} pts={circle([a.at[0], 0.8, a.at[1]], [1, 0, 0], [0, 0, 1], 30, 20)} fill="#2a2230" />
        <g transform={`translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) scale(${a.flip ? -s : s} ${s}) translate(-72 -636)`}>{a.render(s)}</g>
      </g>
    ));
  });
  items.sort((p, q) => q.d - p.d);

  // sky: it is at infinity, so it is drawn in screen space and only moves with the camera's turn and tilt
  const hor = CY + c.f * Math.tan((c.pitch * Math.PI) / 180);
  const pan = -c.f * yawR * 0.8;
  const winD = polyD(c, [[270, 95, 400], [460, 95, 400], [460, 228, 400], [270, 228, 400]]);
  return (
    <g>
      <DitherDefs colors={[...W, ...C3.floor, ...C3.sky, '#6a4a94', C3.pxiSoft]} />
      {/* shell */}
      <Poly c={c} pts={[[0, 270, 0], [500, 270, 0], [500, 270, 400], [0, 270, 400]]} fill={C3.ceil} />
      <Poly c={c} pts={[[0, 0, 400], [500, 0, 400], [500, 270, 400], [0, 270, 400]]} fill={W[0]} />
      {lampOn && <Pool c={c} o={[215, 160, 399.5]} u={[1, 0, 0]} v={[0, 1, 0]} r={135} colors={[W[1], W[2], W[3]]} squash={1.15} />}
      <Poly c={c} pts={[[0, 0, 0], [0, 0, 400], [0, 270, 400], [0, 270, 0]]} fill={C3.wallSide} />
      {lampOn && <Pool c={c} o={[0.5, 150, 400]} u={[0, 0, 1]} v={[0, 1, 0]} r={90} colors={[W[0], W[1]]} />}
      <Poly c={c} pts={[[500, 0, 0], [500, 0, 400], [500, 270, 400], [500, 270, 0]]} fill={C3.wallSide} />
      <Poly c={c} pts={[[0, 0, 0], [500, 0, 0], [500, 0, 400], [0, 0, 400]]} fill={C3.floor[0]} />
      {lampOn && <Pool c={c} o={[215, 0.3, 350]} u={[1, 0, 0]} v={[0, 0, 1]} r={150} colors={[C3.floor[1], C3.floor[2]]} squash={0.8} />}
      {Array.from({ length: 12 }, (_, i) => <Line key={i} c={c} pts={[[20 + i * 42, 0.2, 0], [20 + i * 42, 0.2, 400]]} op={0.55} />)}
      {/* corners, baseboards, ceiling line */}
      <Line c={c} pts={[[0, 0, 400], [0, 270, 400]]} /><Line c={c} pts={[[500, 0, 400], [500, 270, 400]]} />
      <Line c={c} pts={[[0, 270, 0], [0, 270, 400], [500, 270, 400], [500, 270, 0]]} />
      <Poly c={c} pts={[[0, 0, 399], [500, 0, 399], [500, 9, 399], [0, 9, 399]]} fill={W[0]} stroke={C3.line} />
      <Poly c={c} pts={[[1, 0, 0], [1, 0, 400], [1, 9, 400], [1, 9, 0]]} fill={C3.wallSide} stroke={C3.line} />
      <Poly c={c} pts={[[499, 0, 0], [499, 0, 400], [499, 9, 400], [499, 9, 0]]} fill={C3.wallSide} stroke={C3.line} />
      {/* window */}
      {winD && (
        <g>
          <clipPath id="win3"><path d={winD} /></clipPath>
          <g clipPath="url(#win3)">
            <rect x={-50} y={-200} width={400} height={900} fill={C3.sky[0]} />
            {C3.sky.slice(1).map((col, i) => {
              const y = hor - [78, 52, 32, 18, 8][i];
              return <g key={i}><rect x={-50} y={y - 5} width={400} height={5} fill={dz(col)} /><rect x={-50} y={y} width={400} height={600} fill={col} /></g>;
            })}
            <rect x={-50} y={hor + 20} width={400} height={900} fill={C3.city} />
            <g transform={`translate(${(pan % 220) + 10} ${hor + 6})`}>
              {[-220, 0, 220].map((ox) => (
                <g key={ox} transform={`translate(${ox} 0)`}>
                  <path d="M 0 60 V -18 H 12 V -36 H 26 V -8 H 36 V -56 H 44 V -66 H 56 V -10 H 66 V -28 H 80 V -46 H 88 V -4 H 100 V -26 H 116 V -42 H 126 V -14 H 138 V -32 H 150 V -70 H 162 V -22 H 176 V -40 H 190 V -12 H 204 V -30 H 220 V 60 Z" fill={C3.city} />
                  {[[16, -30], [20, -22], [40, -50], [48, -60], [50, -44], [42, -28], [70, -22], [84, -38], [104, -18], [120, -36], [122, -24], [142, -26], [154, -62], [156, -48], [152, -30], [180, -32], [194, -6], [208, -24]].map((p, i) => (
                    <rect key={i} x={p[0]} y={p[1]} width={2} height={2} fill={i % 6 === 2 ? C3.pxiSoft : C3.cityLit} />
                  ))}
                  <rect x={66} y={-18} width={10} height={5} fill={C3.pxi} />
                </g>
              ))}
            </g>
          </g>
          <path d={winD} fill="none" stroke={C3.line} strokeWidth={2} />
          <Line c={c} pts={[[365, 95, 400], [365, 228, 400]]} sw={2} /><Line c={c} pts={[[270, 185, 400], [460, 185, 400]]} sw={2} />
          <Box c={c} b={[264, 466, 88, 95, 392, 400]} t={{ top: W[2], front: W[1], side: W[0] }} />
        </g>
      )}
      {/* his photos, pinned in a grid */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 64 + (i % 3) * 30, y = 150 + Math.floor(i / 3) * 34;
        return (
          <g key={i}>
            <Poly c={c} pts={[[x, y, 399.6], [x + 24, y, 399.6], [x + 24, y + 28, 399.6], [x, y + 28, 399.6]]} fill="#d8d0c8" stroke={C3.line} />
            <Poly c={c} pts={[[x + 3, y + 8, 399.4], [x + 21, y + 8, 399.4], [x + 21, y + 25, 399.4], [x + 3, y + 25, 399.4]]} fill={['#5a4d7c', '#35605f', '#b8603a', '#363a68', '#9a5d78', '#6a5048'][i]} />
          </g>
        );
      })}
      {/* rug */}
      <Poly c={c} pts={[[200, 0.4, 190], [480, 0.4, 190], [480, 0.4, 312], [200, 0.4, 312]]} fill="#574560" stroke={C3.line} />
      <Line c={c} pts={[[210, 0.5, 200], [470, 0.5, 200], [470, 0.5, 302], [210, 0.5, 302], [210, 0.5, 200]]} stroke="#6f5a78" />
      {items.map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
    </g>
  );
};
export { INK };
