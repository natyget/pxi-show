// Nio's bedroom. Built once, the same in every shot: tidy, everything squared to the walls (he's OCD-clean).
// Layout (metres): back wall z = -1.6, left wall x = -2.2, right wall x = 2.2, floor y = 0, ceiling 2.6.
// Bed against the back wall left of centre, nightstand + lamp right of it, window on the back wall right,
// desk on the left wall, rug in front of the bed.
import React from 'react';
import { Solid, toon, flat, rbox, cyl, sph, plane, useCanvasTex } from '../lib/toon';

const WALL = '#6f6169', WAIN = '#5a454c', TRIM = '#3e2e33', FLOOR = '#6e5244', WOOD = '#5b3d2e', WOOD2 = '#4a3125';
const BLANKET = '#e6dcc6', SHEET = '#cfd3d9', PILLOW = '#ece6da', RUG = '#7b6a7e';

function NightSky() {
  const tex = useCanvasTex(64, 80, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 80); g.addColorStop(0, '#141228'); g.addColorStop(1, '#2c2442');
    c.fillStyle = g; c.fillRect(0, 0, 64, 80);
    c.fillStyle = '#f6eed6'; c.beginPath(); c.arc(46, 16, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2c2442'; c.beginPath(); c.arc(43, 13, 6, 0, Math.PI * 2); c.fill();   // crescent
    const b = [[0, 46, 14], [12, 38, 12], [24, 52, 10], [34, 42, 14], [48, 56, 16]];
    b.forEach(([x, y, w], i) => {
      c.fillStyle = i % 2 ? '#1d1a30' : '#231f37'; c.fillRect(x, y, w, 80 - y);
      c.fillStyle = '#e8c27a';
      for (let yy = y + 3; yy < 78; yy += 5) for (let xx = x + 2; xx < x + w - 2; xx += 4) if ((xx * 7 + yy * 3 + i) % 5 === 0) c.fillRect(xx, yy, 2, 2);
    });
    [[6, 8], [20, 14], [30, 5], [58, 30], [14, 26]].forEach(([x, y]) => { c.fillStyle = '#cfc8e8'; c.fillRect(x, y, 1, 1); });
  });
  return <mesh geometry={plane(0.9, 1.1)} position={[0, 0, 0.005]}><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
}

export function Window({ curtain = 0 }: { curtain?: number }) {
  // curtain: 0 open .. 1 closed
  const cw = 0.28 + curtain * 0.47;
  return (
    <group position={[1.15, 1.45, -1.58]}>
      <Solid geo={rbox(1.06, 1.26, 0.06, 0.015)} mat={toon('#e9e1d3')} line={0.01} />
      <NightSky />
      <Solid geo={rbox(0.035, 1.12, 0.04, 0.01)} mat={toon('#e9e1d3')} position={[0, 0, 0.03]} line={0.008} />
      <Solid geo={rbox(0.92, 0.035, 0.04, 0.01)} mat={toon('#e9e1d3')} position={[0, 0.05, 0.03]} line={0.008} />
      <Solid geo={rbox(1.2, 0.06, 0.14, 0.02)} mat={toon('#e9e1d3')} position={[0, -0.66, 0.06]} line={0.01} />
      {/* curtain rod + curtains (folds) */}
      <Solid geo={rbox(1.5, 0.03, 0.03, 0.012)} mat={toon(TRIM)} position={[0, 0.72, 0.12]} line={0.008} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (0.75 - cw / 2), -0.05, 0.12]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Solid key={i} geo={cyl(0.045, 0.05, 1.5, 12)} mat={toon(i % 2 ? '#3f4f6e' : '#4a5b7c')}
              position={[(i - 1.5) * (cw / 4), 0, (i % 2) * 0.015]} scale={[cw / 0.36, 1, 0.6]} line={0.009} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Bed() {
  return (
    <group position={[-0.55, 0, -0.55]}>
      {/* frame + headboard with two panels */}
      <Solid geo={rbox(1.5, 0.2, 2.1, 0.03)} mat={toon(WOOD)} position={[0, 0.13, 0]} />
      <Solid geo={rbox(1.6, 0.95, 0.08, 0.03)} mat={toon(WOOD)} position={[0, 0.55, -1.03]} />
      {[-0.37, 0.37].map((x) => <Solid key={x} geo={rbox(0.62, 0.5, 0.03, 0.02)} mat={toon(WOOD2)} position={[x, 0.68, -0.98]} line={0.008} />)}
      {/* mattress, sheet, blanket folded back neatly */}
      <Solid geo={rbox(1.44, 0.16, 2.0, 0.06)} mat={toon(SHEET)} position={[0, 0.3, 0.0]} />
      <Solid geo={rbox(1.5, 0.08, 1.3, 0.04)} mat={toon(BLANKET)} position={[0, 0.4, 0.36]} />
      <Solid geo={rbox(1.5, 0.06, 0.2, 0.03)} mat={toon('#d8cbb0')} position={[0, 0.45, -0.26]} />
      {[-0.36, 0.36].map((x) => <Solid key={x} geo={sph(0.3)} mat={toon(PILLOW)} position={[x, 0.45, -0.78]} scale={[1.05, 0.33, 0.6]} />)}
      {/* legs */}
      {[[-0.7, -0.98], [0.7, -0.98], [-0.7, 0.98], [0.7, 0.98]].map(([x, z]) => <Solid key={`${x}${z}`} geo={rbox(0.07, 0.1, 0.07, 0.02)} mat={toon(WOOD2)} position={[x, 0.05, z]} line={0.008} />)}
    </group>
  );
}

function Nightstand({ lampOn = 1 }: { lampOn?: number }) {
  return (
    <group position={[0.55, 0, -1.33]}>
      <Solid geo={rbox(0.5, 0.55, 0.42, 0.03)} mat={toon(WOOD)} position={[0, 0.3, 0]} />
      <Solid geo={rbox(0.44, 0.2, 0.02, 0.01)} mat={toon(WOOD2)} position={[0, 0.42, 0.21]} line={0.008} />
      <Solid geo={sph(0.018)} mat={toon('#c9a86a')} position={[0, 0.42, 0.235]} line={0.006} />
      {/* lamp */}
      <Solid geo={cyl(0.07, 0.09, 0.05)} mat={toon('#cfc3ad')} position={[-0.08, 0.6, 0]} />
      <Solid geo={cyl(0.012, 0.012, 0.2, 8)} mat={toon('#8f8576')} position={[-0.08, 0.72, 0]} line={0.006} />
      <Solid geo={cyl(0.09, 0.14, 0.17, 20)} mat={toon('#f1d9a6', '#ffcf7a', 0.65 * lampOn)} position={[-0.08, 0.88, 0]} />
      {/* a stack of two books, squared */}
      <Solid geo={rbox(0.16, 0.035, 0.2, 0.008)} mat={toon('#6f8a7a')} position={[0.12, 0.6, 0.02]} line={0.007} />
      <Solid geo={rbox(0.14, 0.03, 0.18, 0.008)} mat={toon('#b56b5a')} position={[0.12, 0.635, 0.02]} line={0.007} />
    </group>
  );
}

function Desk() {
  return (
    <group position={[-1.85, 0, 0.75]} rotation={[0, Math.PI / 2, 0]}>
      <Solid geo={rbox(1.2, 0.05, 0.55, 0.015)} mat={toon(WOOD)} position={[0, 0.74, 0]} />
      {[[-0.56, -0.24], [0.56, -0.24], [-0.56, 0.24], [0.56, 0.24]].map(([x, z]) => <Solid key={`${x}${z}`} geo={rbox(0.045, 0.72, 0.045, 0.01)} mat={toon(WOOD2)} position={[x, 0.36, z]} line={0.008} />)}
      {/* closed laptop, centred; a mug; a plant */}
      <Solid geo={rbox(0.34, 0.02, 0.24, 0.01)} mat={toon('#9aa0a8')} position={[0, 0.775, 0]} line={0.007} />
      <Solid geo={cyl(0.04, 0.035, 0.09)} mat={toon('#e9e1d3')} position={[0.38, 0.81, 0.05]} line={0.007} />
      <Solid geo={cyl(0.06, 0.045, 0.1)} mat={toon('#a5604a')} position={[-0.42, 0.82, 0.0]} line={0.007} />
      {[[0, 0.92, 0, 0.07], [-0.04, 0.96, 0.03, 0.05], [0.04, 0.95, -0.02, 0.055]].map(([x, y, z, r], i) =>
        <Solid key={i} geo={sph(r)} mat={toon('#5f7f5a')} position={[-0.42 + x, y, z]} line={0.007} />)}
      {/* chair */}
      <group position={[0, 0, 0.5]}>
        <Solid geo={rbox(0.42, 0.05, 0.4, 0.02)} mat={toon('#3b3640')} position={[0, 0.46, 0]} />
        <Solid geo={rbox(0.42, 0.45, 0.04, 0.02)} mat={toon('#3b3640')} position={[0, 0.72, 0.2]} />
        {[[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].map(([x, z]) => <Solid key={`${x}${z}`} geo={rbox(0.035, 0.44, 0.035, 0.01)} mat={toon('#2c2830')} position={[x, 0.22, z]} line={0.007} />)}
      </group>
    </group>
  );
}

function WallFrame() {
  const art = useCanvasTex(24, 30, (c) => {
    c.fillStyle = '#e9dfc9'; c.fillRect(0, 0, 24, 30);
    c.fillStyle = '#d99a6c'; c.beginPath(); c.arc(12, 13, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7a8fa8'; c.fillRect(0, 20, 24, 10);
  });
  return (
    <group position={[-0.55, 1.75, -1.58]}>
      <Solid geo={rbox(0.5, 0.6, 0.03, 0.01)} mat={toon(TRIM)} line={0.008} />
      <mesh geometry={plane(0.4, 0.5)} position={[0, 0, 0.017]}><meshToonMaterial map={art} /></mesh>
    </group>
  );
}

export const Room: React.FC<{ curtain?: number; lampOn?: number; children?: React.ReactNode }> = ({ curtain = 0, lampOn = 1, children }) => (
  <group>
    {/* floor boards */}
    <mesh geometry={plane(4.4, 4)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} material={toon(FLOOR)} />
    {Array.from({ length: 11 }).map((_, i) => (
      <mesh key={i} geometry={plane(0.012, 4)} rotation={[-Math.PI / 2, 0, 0]} position={[-2.2 + i * 0.4, 0.001, 0.4]} material={flat('#5c4338')} />
    ))}
    {/* walls: back, left, right; wainscot panels below a rail */}
    <mesh geometry={plane(4.4, 2.6)} position={[0, 1.3, -1.6]} material={toon(WALL)} />
    <mesh geometry={plane(4, 2.6)} position={[-2.2, 1.3, 0.4]} rotation={[0, Math.PI / 2, 0]} material={toon(WALL)} />
    <mesh geometry={plane(4, 2.6)} position={[2.2, 1.3, 0.4]} rotation={[0, -Math.PI / 2, 0]} material={toon(WALL)} />
    <Solid geo={rbox(4.4, 0.9, 0.04, 0.01)} mat={toon(WAIN)} position={[0, 0.45, -1.58]} line={0.008} />
    <Solid geo={rbox(4.4, 0.04, 0.07, 0.012)} mat={toon(TRIM)} position={[0, 0.91, -1.56]} line={0.008} />
    {[-1.8, -1.0, 1.0, 1.8].map((x) => <Solid key={x} geo={rbox(0.6, 0.55, 0.02, 0.01)} mat={toon('#523e45')} position={[x, 0.47, -1.55]} line={0.006} />)}
    <Solid geo={rbox(0.04, 0.9, 4, 0.01)} mat={toon(WAIN)} position={[-2.18, 0.45, 0.4]} line={0.008} />
    <Solid geo={rbox(0.07, 0.04, 4, 0.012)} mat={toon(TRIM)} position={[-2.16, 0.91, 0.4]} line={0.008} />
    <Solid geo={rbox(0.04, 0.9, 4, 0.01)} mat={toon(WAIN)} position={[2.18, 0.45, 0.4]} line={0.008} />
    <Solid geo={rbox(0.07, 0.04, 4, 0.012)} mat={toon(TRIM)} position={[2.16, 0.91, 0.4]} line={0.008} />
    {/* rug */}
    <Solid geo={rbox(1.7, 0.012, 1.0, 0.005)} mat={toon(RUG)} position={[-0.3, 0.006, 0.95]} line={0.006} />
    <Bed />
    <Nightstand lampOn={lampOn} />
    <Desk />
    <WallFrame />
    <Window curtain={curtain} />
    {children}
    {/* light: low mauve fill, warm lamp, cool moon through the window */}
    <ambientLight intensity={1.5} color="#a8929e" />
    <pointLight position={[0.47, 0.95, -1.2]} intensity={3.5 * lampOn} distance={5} decay={1.2} color="#ffc98a" />
    <directionalLight position={[1.5, 2.2, -0.5]} intensity={1.1} color="#c4c2f0" />
    <hemisphereLight args={['#8a86b8', '#4a3632', 1.0]} />
  </group>
);
