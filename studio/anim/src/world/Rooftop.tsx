// The rooftop silent disco (Saturday). Only ever seen in a photo from the future, for now.
import React from 'react';
import { Solid, toon, flat, rbox, sph, plane } from '../lib/toon';
import { SceneBg } from './Exterior';

export const Headphones: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.0, -0.01]}><torusGeometry args={[0.19, 0.016, 8, 24, Math.PI]} /><meshBasicMaterial color={color} /></mesh>
    {[1, -1].map((s) => <Solid key={s} geo={sph(0.055)} mat={toon(color, color, 1.2)} position={[s * 0.19, -0.01, -0.01]} scale={[0.6, 1, 1]} line={0.008} />)}
  </group>
);

export const Rooftop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <group>
    <SceneBg color="#140f26" />
    <mesh geometry={plane(14, 14)} rotation={[-Math.PI / 2, 0, 0]} material={toon('#3d3742')} />
    {[[0, -5], [-5, 0], [5, 0], [0, 5]].map(([x, z], i) => <Solid key={i} geo={rbox(i === 1 || i === 2 ? 0.25 : 10, 0.9, i === 1 || i === 2 ? 10 : 0.25, 0.03)} mat={toon('#5a5262')} position={[x, 0.45, z]} />)}
    {/* skyline, both ways */}
    {[0, Math.PI].map((ry) => <group key={ry} rotation={[0, ry, 0]}>{Array.from({ length: 9 }).map((_, i) => {
      const h = 6 + ((i * 7) % 5) * 2.2, x = -14 + i * 3.5;
      return (
        <group key={i} position={[x, 0, -14]}>
          <mesh geometry={plane(3, h)} position={[0, h / 2 - 3, 0]} material={toon(i % 2 ? '#2a2440' : '#332b4c')} />
          {Array.from({ length: Math.floor(h) }).map((_, k) => (k * 3 + i) % 4 < 2 ? <mesh key={k} geometry={plane(0.4, 0.5)} position={[(k % 3 - 1) * 0.9, -2 + k * 1.1, 0.02]} material={flat('#e8b86e')} /> : null)}
        </group>
      );
    })}</group>)}
    <mesh geometry={sph(1.6, 16, 12)} position={[6, 9, -20]} material={flat('#f3ead2')} />
    {/* string lights across */}
    {[-2.5, 0, 2.5].map((z, j) => Array.from({ length: 16 }).map((_, k) => {
      const u = k / 15, x = -4.5 + u * 9, y = 3.0 - 0.6 * 4 * u * (1 - u);
      const col = ['#ff6ad5', '#6ad5ff', '#f2c94c', '#9dff8a'][(k + j) % 4];
      return <mesh key={`${j}${k}`} geometry={sph(0.06, 8, 6)} position={[x, y, z]} material={toon(col, col, 1.6)} />;
    }))}
    {/* DJ table */}
    <Solid geo={rbox(1.6, 0.9, 0.6, 0.03)} mat={toon('#2b2a33')} position={[0, 0.45, -3.6]} />
    <Solid geo={rbox(1.5, 0.05, 0.5, 0.02)} mat={toon('#6ad5ff', '#6ad5ff', 0.8)} position={[0, 0.92, -3.6]} line={0} />
    <ambientLight intensity={1.0} color="#9a90c8" />
    <hemisphereLight args={['#c0a8ff', '#3a2a40', 0.8]} />
    <pointLight position={[0, 2.6, 0]} intensity={2.2} distance={9} color="#ff9ae0" />
    <pointLight position={[2, 2.6, -2]} intensity={2.2} distance={8} color="#8ad8ff" />
    <directionalLight position={[0, 3, 4]} intensity={1.0} color="#fff2e6" />
    {children}
  </group>
);
