// The laundromat, 11:40 PM on a Wednesday. Back wall (z = -3): washers below, dryers stacked on top, drums turning.
// Bench in the middle facing the machines. TV high in the left corner (a cooking show). Front window (z = +3) onto the
// dark street. Flyer board on the right wall (one flyer: the rooftop party on Saturday: planted for later).
// Fluorescent light: neutral white, so skin reads true.
import React from 'react';
import { Solid, toon, flat, rbox, cyl, sph, plane, useCanvasTex } from '../lib/toon';
import { SceneBg } from './Exterior';

const WALL = '#cfd6cf', TILE1 = '#e7e2d6', TILE2 = '#b9c3c8', MACHINE = '#eef0ee', TRIM = '#8a949c';
export const MACHINE_X = [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0];
export const SOCK_WASHER = 3; // index: the sock guy's machine (x = 0.6)

function Machine({ x, y, t, i, sock }: { x: number; y: number; t: number; i: number; sock?: boolean }) {
  const spin = t * (i % 2 ? 5.5 : 4.2) + i;
  const cols = ['#c75a4a', '#3f6f8f', '#e0b23c', '#7fa64a', '#8f4f7f', '#efe6d2'];
  const busy = sock || (i * 7) % 3 !== 0;
  return (
    <group position={[x, y, -2.62]}>
      <Solid geo={rbox(1.1, 1.05, 0.75, 0.05)} mat={toon(MACHINE)} />
      <Solid geo={rbox(1.0, 0.16, 0.02, 0.01)} mat={toon('#d5dad7')} position={[0, 0.4, 0.38]} line={0.006} />
      <mesh geometry={sph(0.025)} position={[0.35, 0.4, 0.39]} material={flat(busy ? '#7fe08a' : '#7a7f80')} />
      {/* door: ring + dark glass + what's tumbling inside */}
      <mesh position={[0, -0.06, 0.38]}><torusGeometry args={[0.3, 0.05, 10, 28]} /><meshToonMaterial color={TRIM} /></mesh>
      <mesh geometry={cyl(0.3, 0.3, 0.02, 28)} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.06, 0.372]} material={flat('#2b3440')} />
      {busy && (
        <group position={[0, -0.06, 0.385]} rotation={[0, 0, -spin]}>
          {(sock ? [0] : [0, 1, 2, 3, 4]).map((k) => (
            <mesh key={k} geometry={sock ? rbox(0.08, 0.2, 0.01, 0.03) : sph(0.07, 10, 8)} material={flat(sock ? '#f2efe8' : cols[(k + i) % 6])}
              position={[Math.cos(k * 1.3) * 0.17, Math.sin(k * 1.3) * 0.17 - 0.03, 0]} scale={sock ? [1, 1, 1] : [1.4, 0.8, 0.4]} />
          ))}
        </group>
      )}
      <mesh geometry={cyl(0.3, 0.3, 0.005, 28)} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.06, 0.4]}>
        <meshBasicMaterial color="#cfe6ff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function TV({ t }: { t: number }) {
  const f = Math.floor(t * 6) % 3;
  const tex = useCanvasTex(48, 28, (c) => {
    c.fillStyle = '#e9d9b8'; c.fillRect(0, 0, 48, 28);                 // kitchen set
    c.fillStyle = '#c75a4a'; c.fillRect(0, 20, 48, 8);                  // counter
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(16, 11, 5, 0, 7); c.fill(); // chef hat
    c.fillStyle = '#c99a7a'; c.beginPath(); c.arc(16, 16, 4, 0, 7); c.fill(); // chef
    c.fillStyle = '#f6f0e0'; c.beginPath(); c.ellipse(32, 19, 5, 3, 0, 0, 7); c.fill(); // bowl
    c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(32 + f, 17, 2, 0, 7); c.fill();     // the egg
  }, [f]);
  return (
    <group position={[-3.75, 2.25, -1.6]} rotation={[0, 0.9, 0]}>
      <Solid geo={rbox(0.9, 0.56, 0.08, 0.02)} mat={toon('#1c1c22')} />
      <mesh geometry={plane(0.82, 0.48)} position={[0, 0, 0.045]}><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <Solid geo={rbox(0.06, 0.4, 0.06, 0.02)} mat={toon('#2b2b33')} position={[0, 0.45, -0.1]} line={0.006} />
      <pointLight position={[0, 0, 0.6]} intensity={0.5} distance={2} color="#ffe9c0" />
    </group>
  );
}

function FlyerBoard() {
  const flyer = useCanvasTex(20, 28, (c) => {
    c.fillStyle = '#1b1830'; c.fillRect(0, 0, 20, 28);
    c.fillStyle = '#ff6ad5'; c.fillRect(2, 3, 16, 3); c.fillStyle = '#6ad5ff'; c.fillRect(2, 8, 16, 2);
    c.fillStyle = '#f2c94c'; c.fillRect(2, 20, 10, 3);                 // "SAT"
    c.fillStyle = '#ffffff'; [[4, 13], [9, 14], [14, 12]].forEach(([x, y]) => c.fillRect(x, y, 2, 3)); // little dancers
  });
  return (
    <group position={[3.95, 1.55, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
      <Solid geo={rbox(1.3, 0.9, 0.04, 0.02)} mat={toon('#b88a5a')} />
      {[[-0.4, 0.15, '#f4e8a8', 0.05], [0.0, -0.12, '#a8d8f4', -0.08], [0.42, 0.1, '#f4b8a8', 0.04]].map(([x, y, col, r], i) => (
        <mesh key={i} geometry={plane(0.32, 0.4)} position={[x as number, y as number, 0.025]} rotation={[0, 0, r as number]} material={flat(col as string)} />
      ))}
      <mesh geometry={plane(0.3, 0.42)} position={[0.15, 0.2, 0.03]} rotation={[0, 0, -0.03]}><meshBasicMaterial map={flyer} /></mesh>
    </group>
  );
}

function Bench() {
  return (
    <group position={[0, 0, 0.4]}>
      <Solid geo={rbox(2.6, 0.08, 0.5, 0.02)} mat={toon('#d7b37a')} position={[0, 0.4, 0]} />
      {[-1.1, 1.1].map((x) => <Solid key={x} geo={rbox(0.08, 0.4, 0.44, 0.02)} mat={toon('#6c747c')} position={[x, 0.2, 0]} line={0.008} />)}
    </group>
  );
}

export const Laundromat: React.FC<{ t: number; children?: React.ReactNode; tvOn?: boolean }> = ({ t, children, tvOn = true }) => (
  <group>
    <SceneBg color="#10131a" />
    {/* floor: checker tiles */}
    <mesh geometry={plane(8, 6)} rotation={[-Math.PI / 2, 0, 0]} material={toon(TILE1)} />
    {Array.from({ length: 48 }).map((_, k) => {
      const ix = k % 8, iz = Math.floor(k / 8); if ((ix + iz) % 2) return null;
      return <mesh key={k} geometry={plane(0.99, 0.99)} rotation={[-Math.PI / 2, 0, 0]} position={[-3.5 + ix, 0.002, -2.5 + iz]} material={toon(TILE2)} />;
    })}
    {/* walls */}
    <mesh geometry={plane(8, 3)} position={[0, 1.5, -3]} material={toon(WALL)} />
    <mesh geometry={plane(6, 3)} position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} material={toon(WALL)} />
    <mesh geometry={plane(6, 3)} position={[4, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} material={toon(WALL)} />
    <mesh geometry={plane(8, 6)} position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#e9ece8')} />
    {/* front wall with the big window onto the night street */}
    {[[-3, 1.5, 2, 3], [3, 1.5, 2, 3], [0, 2.75, 4, 0.5], [0, 0.35, 4, 0.7]].map(([x, y, w, h], i) => (
      <mesh key={i} geometry={plane(w, h)} position={[x, y, 3]} rotation={[0, Math.PI, 0]} material={toon(WALL)} />
    ))}
    <mesh geometry={plane(4, 1.8)} position={[0, 1.6, 3.2]} rotation={[0, Math.PI, 0]} material={flat('#141a2a')} />
    {[-1.2, 0.4, 1.6].map((x, i) => <mesh key={i} geometry={plane(0.5, 0.7)} position={[x, 1.7 + (i % 2) * 0.2, 3.15]} rotation={[0, Math.PI, 0]} material={flat(i === 1 ? '#e8b86e' : '#2a3048')} />)}
    <mesh geometry={plane(0.1, 1.8)} position={[-0.6, 1.6, 3.0]} rotation={[0, Math.PI, 0]} material={flat('#5c656c')} />
    {/* machines: washers below, dryers on top */}
    {MACHINE_X.map((x, i) => <Machine key={`w${i}`} x={x} y={0.53} t={t} i={i} sock={i === SOCK_WASHER} />)}
    {MACHINE_X.map((x, i) => <Machine key={`d${i}`} x={x} y={1.6} t={t} i={i + 3} />)}
    {/* fluorescent panels */}
    {[-2, 0, 2].map((x) => <mesh key={x} geometry={plane(1.2, 0.3)} position={[x, 2.99, -0.5]} rotation={[Math.PI / 2, 0, 0]} material={flat('#f6fbff')} />)}
    {/* vending machine + folding table on the left */}
    <group position={[-3.55, 0, 1.6]} rotation={[0, Math.PI / 2, 0]}>
      <Solid geo={rbox(0.9, 1.9, 0.7, 0.04)} mat={toon('#c75a4a')} position={[0, 0.95, 0]} />
      <mesh geometry={plane(0.6, 1.0)} position={[-0.08, 1.15, 0.36]} material={flat('#2b3440')} />
      {Array.from({ length: 12 }).map((_, k) => <mesh key={k} geometry={plane(0.1, 0.12)} position={[-0.3 + (k % 4) * 0.15, 1.5 - Math.floor(k / 4) * 0.3, 0.37]} material={flat(['#e0b23c', '#3f6f8f', '#7fa64a', '#efe6d2'][k % 4])} />)}
    </group>
    <group position={[-2.6, 0, -0.6]}>
      <Solid geo={rbox(1.4, 0.06, 0.7, 0.02)} mat={toon('#e8e4da')} position={[0, 0.85, 0]} />
      {[[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]].map(([x, z]) => <Solid key={`${x}${z}`} geo={rbox(0.04, 0.84, 0.04, 0.01)} mat={toon('#6c747c')} position={[x, 0.42, z]} line={0.006} />)}
      {/* someone's perfectly folded stack */}
      {[0, 1, 2].map((k) => <Solid key={k} geo={rbox(0.4, 0.06, 0.3, 0.02)} mat={toon(['#3f6f8f', '#efe6d2', '#7fa64a'][k])} position={[0.2, 0.92 + k * 0.065, 0]} line={0.006} />)}
    </group>
    {tvOn && <TV t={t} />}
    <FlyerBoard />
    <Bench />
    {/* light: cool-neutral fluorescent */}
    <ambientLight intensity={1.6} color="#e8f0f0" />
    <hemisphereLight args={['#ffffff', '#b8b0a0', 0.7]} />
    <directionalLight position={[1, 4, 3]} intensity={1.1} color="#ffffff" />
    {children}
  </group>
);

/** Things on the bench: a chip bag and a laundry basket. */
export const BenchProps: React.FC<{ chips?: boolean }> = ({ chips = true }) => (
  <group>
    {chips && <Solid geo={rbox(0.2, 0.26, 0.07, 0.04)} mat={toon('#e0b23c')} position={[0.15, 0.57, 0.45]} rotation={[0.25, 0.3, 0.1]} line={0.008} />}
    <group position={[-1.0, 0.44, 0.42]}>
      <Solid geo={cyl(0.24, 0.2, 0.32, 16)} mat={toon('#3f6f8f')} position={[0, 0.16, 0]} />
      <Solid geo={sph(0.2)} mat={toon('#efe6d2')} position={[0, 0.3, 0]} scale={[1, 0.4, 1]} line={0.008} />
    </group>
  </group>
);
