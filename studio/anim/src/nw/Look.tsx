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
import { Room, Camera, C3 } from './Room3D';
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

const look = (f: Face, px: number, py: number): Face => ({ ...f, eyeL: { ...f.eyeL, px, py }, eyeR: { ...f.eyeR, px, py } });
const P_PHONE: Pose = { elN: [44, 278], wrN: [48, 328], handN: 'relaxed', handNRot: 96, handNFlip: true, elF: [146, 272], wrF: [172, 246], handF: 'phone', handFRot: -6, headRot: 4 };
const P_NEAR: Pose = { ...P_PHONE, elF: [146, 264], wrF: [166, 232], headRot: 9, headDx: 5, headDy: 3 };
const P_YES: Pose = { ...P_PHONE, elN: [26, 262], wrN: [32, 212], handN: 'fist', handNRot: -84, handNFlip: false, elF: [150, 274], wrF: [178, 254], headRot: -5, headDy: -4, lean: -2 };
const P_CAUGHT: Pose = { ...P_YES, headRot: 0, headDy: 0, lean: 0 };
export const NWBody: React.FC = () => (
  <Stage bg="#51485a">
    <g transform="translate(0 20) scale(0.95)"><Nio s={0.95} /></g>
    <g transform="translate(150 16) scale(0.5)"><Nio s={0.5} uid="b" pose={P_PHONE} face={{ ...FACES.smug, bud: true }} /></g>
    <g transform="translate(150 250) scale(0.5)"><Nio s={0.5} uid="c" pose={P_YES} face={FACES.hyped} /></g>
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
            <g transform={`translate(${x - 4} ${y - 2}) scale(0.54)`}><Nio s={0.56} uid={`s${i}`} legs={false} face={FACES[name]} /></g>
          </g>
        </g>
      );
    })}
  </Stage>
);

// The motion test: one beat of silent acting, then the wide, then the glitch button (added by the finisher).
export const CLIP_LEN = 192;
export const CLIP_CUT = 138;
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

// ---- round 2: the room has depth, the camera stands in it ----
export const SHOTS: Record<string, Camera> = {
  low: { pos: [330, 62, 95], yaw: -33, pitch: 15, f: 330 }, // low and close, looking up at him
  tight: { pos: [296, 112, 150], yaw: -38, pitch: 8, f: 400 }, // face close-up
  side: { pos: [92, 70, 70], yaw: 30, pitch: 9, f: 300 }, // from the shelf side, the window behind him
  high: { pos: [478, 250, 30], yaw: -40, pitch: -30, f: 250 }, // from the ceiling corner
};
const P_DOWN: Pose = P_PHONE;
const nioActor = (at: [number, number], pose: Pose, face: Face, glow: string = C3.pxiSoft, halo = 0) => ({
  at, render: (s: number) => (
    <>
      {halo > 0 && <><ellipse cx={190} cy={222} rx={70 * halo} ry={80 * halo} fill="#7e5ab0" /><ellipse cx={190} cy={222} rx={40 * halo} ry={46 * halo} fill={C3.pxiSoft} /></>}
      <Nio s={s} lod={s < 0.5 ? 1 : 0} pose={pose} face={face} glow={glow} />
    </>
  ),
});
export const NWShot: React.FC<{ shot: string }> = ({ shot }) => {
  const smug = { ...look(FACES.smug, 0.75, 0.5), bud: true, rim: '#e9c2ff' };
  return (
    <Stage bg="#000">
      <Room cam={SHOTS[shot]} actors={[nioActor([215, 235], P_DOWN, smug)]} />
    </Stage>
  );
};

export const CLIP2_LEN = 192;
export const NWClip2: React.FC = () => {
  const raw = useCurrentFrame();
  const f = Math.floor(raw / 2) * 2;
  const base = { bud: true, rim: '#e9c2ff' };
  let face = track<Face>(f, [
    [0, { ...look(FACES.deadpan, 0.75, 0.5), ...base }],
    [30, { ...look(FACES.shock, 0.6, 0.45), ...base, rim: '#ffffff' }],
    [52, { ...look(FACES.suspicious, 0.85, 0.5), ...base }],
    [78, { ...look(FACES.hyped, 0.5, 0.3), ...base }],
    [106, { ...look(FACES.sheepish, -0.75, 0.1), ...base, sweat: true }],
    [122, { ...look(FACES.smug, 0.75, 0.5), ...base }],
  ]);
  if ((f >= 14 && f < 18) || (f >= 156 && f < 160)) face = { ...face, eyeL: { ...face.eyeL, arc: 'shut' }, eyeR: { ...face.eyeR, arc: 'shut' } };
  const pose = track<Pose>(f, [[0, P_DOWN], [30, { ...P_DOWN, headDy: -5 }], [52, P_NEAR], [78, P_YES], [106, P_CAUGHT], [122, P_DOWN]]);
  // each beat gets its own angle: we move around him, he does not stand in front of a wall
  const cam: Camera = raw < 52 ? { ...SHOTS.low, f: raw >= 30 ? 356 : 330 } : raw < 78 ? SHOTS.tight : raw < 106 ? SHOTS.side : raw < 138 ? SHOTS.low : SHOTS.high;
  const buzz = f >= 30 && f < 46;
  return (
    <Stage bg="#000">
      <Room cam={cam} actors={[nioActor([215, 235], pose, face, buzz ? '#ffffff' : C3.pxiSoft, buzz ? (f < 36 ? 1 : 0.7) : 0)]} />
    </Stage>
  );
};
