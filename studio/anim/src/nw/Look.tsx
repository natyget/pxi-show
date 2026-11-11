import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NW, NH } from './ink';
import { NioHead } from './NioHead';
import { Nio, POSE_STAND, Hand } from './NioBody';
import { INK } from './ink';
import { FACES, track, mix } from './faces';
import { Face } from './NioHead';
import { Pose } from './NioBody';
import { Dither } from './Apartment';
import { Apartment, ApartmentFG, Cam, ROOM } from './Apartment';

export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = '#6b5a6e' }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg viewBox={`0 0 ${NW} ${NH}`} width="100%" height="100%" shapeRendering="crispEdges">
      <style>{`.nwink *{fill:${INK}!important;stroke:${INK}!important;stroke-width:var(--w)!important;stroke-linejoin:round;stroke-linecap:round}`}</style>
      {children}
    </svg>
  </AbsoluteFill>
);

export const NWHead: React.FC = () => (
  <Stage>
    <g transform="translate(15 20) scale(1.25)"><NioHead s={1.25} /></g>
    <g transform="translate(5 320) scale(0.62)"><NioHead s={0.62} uid="b" face={{ mouth: 'smirk', browL: { y: -5, rot: 6 } }} /></g>
    <g transform="translate(140 330) scale(0.36)"><NioHead s={0.36} uid="c" lod={1} /></g>
    <g transform="translate(140 400) scale(0.2)"><NioHead s={0.2} uid="d" lod={1} /></g>
  </Stage>
);

export const NWBody: React.FC = () => (
  <Stage>
    <g transform="translate(12 6) scale(0.62)"><Nio s={0.62} /></g>
    <g transform="translate(150 20) scale(0.36)"><Nio s={0.36} uid="b" lod={1} pose={{ ...POSE_STAND, elN: [-8, 330], wrN: [40, 290], handN: 'point', handNRot: -30, elF: [160, 330], wrF: [196, 262], handF: 'phone', handFRot: -70 }} face={{ mouth: 'smirk' }} /></g>
    <g transform="translate(140 300) scale(0.9)">{(['relaxed', 'point', 'open', 'fist', 'phone'] as const).map((h, i) => (
      <g key={h} transform={`translate(${(i % 2) * 60} ${Math.floor(i / 2) * 58 + 40})`}><Hand name={h} s={0.9} at={[0, 0]} /></g>
    ))}</g>
  </Stage>
);

export const NWHero: React.FC = () => {
  const z = 1.9, k = 0.37;
  return (
    <Stage bg="#000">
      <Cam x={106} y={262} z={z}>
        <Apartment z={z} />
        <g transform={`translate(54 176) scale(${k})`}>
          <Nio s={k * z} glow={ROOM.pxiSoft}
            pose={{ elN: [0, 352], wrN: [22, 420], handN: 'relaxed', handNRot: 70, elF: [168, 340], wrF: [206, 286], handF: 'phone', handFRot: -8, headRot: 4 }}
            face={{ mouth: 'smirk', bud: true, rim: '#e9c2ff', eyeL: { open: 0.62, px: 0.75, py: 0.5 }, eyeR: { open: 0.62, px: 0.7, py: 0.5 }, browL: { y: -7, rot: -3 }, browR: { y: 1, rot: 4 } }} />
        </g>
      </Cam>
    </Stage>
  );
};
export const NWWide: React.FC = () => (
  <Stage bg="#000">
    <Cam x={135} y={240} z={1}>
      <Apartment z={1} />
      <g transform="translate(54 176) scale(0.37)"><Nio s={0.37} lod={1} /></g>
      <ApartmentFG z={1} />
    </Cam>
  </Stage>
);

export const NWSheet: React.FC = () => (
  <Stage bg="#4d4264">
    {Object.keys(FACES).map((name, i) => {
      const x = (i % 3) * 90, y = Math.floor(i / 3) * 120;
      return (
        <g key={name}>
          <clipPath id={`cell${i}`}><rect x={x + 1} y={y + 1} width={88} height={118} /></clipPath>
          <g clipPath={`url(#cell${i})`}>
            <rect x={x} y={y} width={90} height={120} fill={['#665275', '#5a4a6c'][(i + Math.floor(i / 3)) % 2]} />
            <g transform={`translate(${x - 2} ${y + 2}) scale(0.5)`}><Nio s={0.5} uid={`s${i}`} legs={false} face={FACES[name]} /></g>
          </g>
        </g>
      );
    })}
  </Stage>
);

// The motion test: one beat of silent acting, then the wide, then the glitch button (added by the finisher).
export const CLIP_LEN = 192;
export const CLIP_CUT = 138;
const look = (f: Face, px: number, py: number): Face => ({ ...f, eyeL: { ...f.eyeL, px, py }, eyeR: { ...f.eyeR, px, py } });
const P_PHONE: Pose = { elN: [0, 352], wrN: [22, 420], handN: 'relaxed', handNRot: 70, elF: [168, 340], wrF: [206, 286], handF: 'phone', handFRot: -8, headRot: 4 };
const P_NEAR: Pose = { ...P_PHONE, elF: [164, 330], wrF: [190, 262], headRot: 9, headDx: 6, headDy: 4 };
const P_YES: Pose = { ...P_PHONE, elN: [-22, 300], wrN: [-12, 226], handN: 'fist', handNRot: -84, elF: [172, 336], wrF: [214, 300], headRot: -5, headDy: -6, lean: -2 };
const P_CAUGHT: Pose = { ...P_YES, headRot: 0, headDy: 0, lean: 0 };
export const NWClip: React.FC = () => {
  const raw = useCurrentFrame();
  const f = Math.floor(raw / 2) * 2; // on twos
  const wide = raw >= CLIP_CUT;
  const k = 0.37;
  const rim = '#e9c2ff';
  const base = { bud: true, rim };
  let face = track<Face>(f, [
    [0, { ...look(FACES.deadpan, 0.75, 0.5), ...base }],
    [30, { ...look(FACES.shock, 0.6, 0.45), ...base, rim: '#ffffff' }],
    [52, { ...look(FACES.suspicious, 0.85, 0.5), ...base }],
    [78, { ...look(FACES.hyped, 0.5, 0.3), ...base }],
    [106, { ...look(FACES.sheepish, -0.75, 0.1), ...base, sweat: true }],
    [122, { ...look(FACES.smug, 0.75, 0.5), ...base }],
  ]);
  const blink = (f >= 14 && f < 18) || (f >= 150 && f < 154);
  if (blink) face = { ...face, eyeL: { ...face.eyeL, arc: 'shut' }, eyeR: { ...face.eyeR, arc: 'shut' } };
  const pose = track<Pose>(f, [[0, P_PHONE], [30, { ...P_PHONE, headDy: -5 }], [52, P_NEAR], [78, P_YES], [106, P_CAUGHT], [122, P_PHONE]]);
  const cam = wide ? { x: 135, y: 240, z: 1 } : track(f, [[0, { x: 106, y: 262, z: 1.9 }], [52, { x: 112, y: 250, z: 2.3 }], [78, { x: 96, y: 254, z: 2.0 }], [122, { x: 106, y: 262, z: 1.9 }]], 3);
  const buzz = f >= 30 && f < 46;
  return (
    <Stage bg="#000">
      <Cam x={cam.x} y={cam.y} z={cam.z}>
        <Apartment z={cam.z} />
        {buzz && (
          <g>
            <Dither id="bz" color={ROOM.pxiSoft} z={cam.z} />
            <ellipse cx={132} cy={278} rx={f < 36 ? 34 : 24} ry={f < 36 ? 40 : 28} fill="url(#bz)" />
            <ellipse cx={132} cy={278} rx={f < 36 ? 20 : 12} ry={f < 36 ? 24 : 15} fill={ROOM.pxiSoft} />
          </g>
        )}
        <g transform={`translate(54 176) scale(${k})`}>
          <Nio s={k * cam.z} lod={wide ? 1 : 0} glow={buzz ? '#ffffff' : ROOM.pxiSoft} pose={pose} face={face} />
        </g>
        <ApartmentFG z={cam.z} />
      </Cam>
    </Stage>
  );
};
