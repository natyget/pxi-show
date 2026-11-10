// PILOT — "One Photo"
// Maya asks Nio to take one photo of her at the night market. Nio believes he is an artist. It escalates (Gumball ego,
// Regular Show escalation, Nathan Fielder commitment) until the candle stall's roof gives way under him. Then PXI does
// what it does: everyone at the market was filming, and the shared album is full of great photos of Maya. The best
// photo of the night is Nio mid-fall, taken by the sock guy. "That was the plan."
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { frame } from './lib/frame';
import { Exterior, EXTRAS, SceneBg } from './world/Exterior';
import { Character, NIO, MAYA, Look, Pose, headPos } from './world/Character';
import { Phone } from './world/Phone';
import { usePilotScreens, TILE } from './ui/PilotScreens';
import { t12, sp, keys, blink, breathe, nz } from './lib/motion';
import { Solid, toon, flat, sph, cap, plane, cyl, cone, rbox } from './lib/toon';
import audio from './audio.json';
import { SOCK } from './Ep1';

type Line = { file: string; dur: number; env: number[] };
const A = audio as { lines: Record<string, Line>; sfx: Record<string, string> };
const has = (k: string) => !!A.lines[k];
const dur = (k: string, d = 1.2) => (has(k) ? A.lines[k].dur : d);
const mouthAt = (t: number, key: string, at: number) => {
  if (!has(key)) return 0; const l = A.lines[key]; const i = Math.floor((t - at) * 12);
  return i < 0 || i >= l.env.length ? 0 : Math.min(1, l.env[i] * 1.3);
};
const saying = (t: number, key: string, at: number) => t > at && t < at + dur(key) + 0.15;

// ---------------------------------------------------------------- staging: the candle stall (x 3.5, z 6.2, faces +z)
const MAYA_SPOT: Pose = { x: 3.3, z: 7.2, yaw: 0.05 };
const NIO_SPOT: Pose = { x: 3.35, z: 8.85, yaw: Math.PI };
const POSE_MAYA: Partial<Pose> = { armL: { sx: 0.15, sz: 0.65, el: 1.3 }, armR: { sx: -2.4, sz: 0.25, el: 1.2 }, headTilt: 0.12, smile: 0.9, lid: 0.15 };
const SHOOT = { sx: -1.05, sz: -0.18, el: 1.05 };   // holding her phone up in front of him
const OWNER: Look = EXTRAS[0];
const HerPhone: React.FC = () => <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone on={1} /></group>;

/** A pigeon. */
const Pigeon: React.FC<{ p: [number, number, number]; yaw?: number; bob?: number }> = ({ p, yaw = 0, bob = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <Solid geo={sph(0.09)} mat={toon('#8d93a3')} scale={[0.8, 0.75, 1.2]} line={0.01} />
    <Solid geo={sph(0.055)} mat={toon('#6f7586')} position={[0, 0.09 + bob * 0.01, 0.08 + bob * 0.02]} line={0.01} />
    <mesh geometry={sph(0.012, 6, 6)} position={[0.03, 0.105 + bob * 0.01, 0.12 + bob * 0.02]} material={flat('#e8a33c')} />
    <Solid geo={cone(0.012, 0.035)} mat={toon('#d9a441')} position={[0, 0.08 + bob * 0.01, 0.14 + bob * 0.02]} rotation={[Math.PI / 2, 0, 0]} line={0.006} />
    <Solid geo={sph(0.06)} mat={toon('#5f6577')} position={[0, 0.0, -0.11]} scale={[0.6, 0.3, 1.2]} line={0.008} />
  </group>
);
/** The sock guy's reflector: a gold disc. */
const Reflector: React.FC = () => (
  <group position={[0, -0.05, 0.12]} rotation={[0.4, 0, 0]}>
    <mesh geometry={cyl(0.38, 0.38, 0.01, 28)} rotation={[Math.PI / 2, 0, 0]} material={toon('#f2c94c', '#f2c94c', 0.6)} />
    <mesh position={[0, 0, -0.006]} rotation={[0, 0, 0]}><torusGeometry args={[0.38, 0.015, 6, 28]} /><meshToonMaterial color="#3a3040" /></mesh>
  </group>
);
/** A clamp lamp, held out. */
const Lamp: React.FC = () => (
  <group position={[0, -0.06, 0.1]} rotation={[1.2, 0, 0]}>
    <Solid geo={cone(0.11, 0.16)} mat={toon('#e8e4da', '#fff1c9', 1.4)} position={[0, 0.06, 0]} line={0.008} />
    <mesh geometry={sph(0.05, 8, 6)} position={[0, 0.02, 0]} material={flat('#fff6d8')} />
    <pointLight position={[0, 0.2, 0.1]} intensity={2.5} distance={3} color="#fff1c9" />
  </group>
);

// ---------------------------------------------------------------- the crowd: gathers around them, phones up
const CROWD_SPOTS: [number, number, number][] = [[1.6, 8.3, 1.1], [1.9, 9.6, 2.1], [2.6, 10.3, 2.8], [4.3, 10.1, -2.6], [5.1, 9.3, -1.9], [5.3, 8.1, -1.2], [2.2, 7.4, 0.8], [4.8, 7.3, -0.9]];
const Crowd: React.FC<{ t: number; gather: number; phones?: boolean; still?: boolean }> = ({ t, gather, phones = true, still = false }) => (
  <>
    {CROWD_SPOTS.map(([x, z, yaw], i) => {
      const k = Math.min(1, Math.max(0, gather * 1.4 - i * 0.08));
      if (k <= 0) return null;
      const far: [number, number] = [x + (x - 3.4) * 1.6, z + (z - 8) * 1.6];
      const px = far[0] + (x - far[0]) * k, pz = far[1] + (z - far[1]) * k;
      const up = phones && k > 0.9;
      return <Character key={i} look={EXTRAS[(i + 1) % EXTRAS.length]} p={{ x: px, z: pz, yaw, breathe: still ? 0 : breathe(t + i), lid: still ? 0.1 : blink(t, [0.7 + i * 0.37]),
        armR: up ? { sx: -1.5, sz: -0.1, el: 0.6 } : { sx: 0, sz: 0.1, el: 0.2 }, headPitch: up ? -0.05 : 0 }} handR={up ? <HerPhone /> : undefined} />;
    })}
  </>
);

// ---------------------------------------------------------------- shots
const S = (C: React.FC<{ t: number }>) => () => { const t = t12(useCurrentFrame()); return <C t={t} />; };

const SH1 = S(({ t }) => {   // WS: Maya hands him her phone. "Can you take one of me?"
  const hand = sp(t, 1.4, 'snap');
  const maya: Pose = { ...MAYA_SPOT, z: MAYA_SPOT.z + 0.6, breathe: breathe(t), mouth: mouthAt(t, 'p_m1', 0.25), smile: 0.5, armR: { sx: -1.2 * (1 - hand * 0.4), sz: -0.1, el: 0.4 }, headTilt: 0.06 };
  const nio: Pose = { ...NIO_SPOT, z: NIO_SPOT.z - 0.8, breathe: breathe(t + 1), armR: { sx: -1.0 * hand, sz: -0.1, el: 0.6 * hand }, lid: blink(t, [0.9]) };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[5.6, 1.6, 8.6]} at={[3.3, 1.15, 7.95]} fov={44} />
        <Exterior curtain={1}><Character look={MAYA} p={maya} handR={hand < 0.5 ? <HerPhone /> : undefined} /><Character look={NIO} p={nio} handR={hand >= 0.5 ? <HerPhone /> : undefined} />
          <Character look={OWNER} p={{ x: 3.5, z: 5.75, yaw: 0, breathe: breathe(t + 2) }} /></Exterior></PixelShot>
      {saying(t, 'p_m1', 0.25) && <Sub text="can you take one of me?" />}
    </AbsoluteFill>
  );
});

const NIO_SHOOT_HEAD = headPos(NIO_SPOT, NIO);
const MAYA_HEAD = headPos(MAYA_SPOT, MAYA);

const SH2 = S(({ t }) => {   // MCU: he receives the phone like a newborn. A slow, serious nod.
  const nod = sp(t, 0.9, 'lazy') - sp(t, 1.25, 'lazy');
  const nio: Pose = { ...NIO_SPOT, breathe: breathe(t), armR: { sx: -0.9, sz: -0.35, el: 1.5 }, armL: { sx: -0.9, sz: -0.35, el: 1.5 }, headPitch: 0.2 + nod * 0.3, eyeY: -0.5, lid: 0.2, brow: 0.25, smile: 0 };
  const f = frame(NIO_SHOOT_HEAD, 'mcu', Math.PI + 0.15, { up: 0.03 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={NIO} p={nio} handR={<HerPhone />} /></Exterior></PixelShot>;
});

// phone inserts (her phone in his hand)
const toScreen = (px: number, py: number, w: number, h: number): [number, number, number] =>
  [((px + w / 2) / 390) * 0.066 - 0.033, 0.071 - ((py + h / 2) / 844) * 0.142, 0.0058];
const Insert: React.FC<{ screen?: any; children?: React.ReactNode; skin?: string; buzz?: number }> = ({ screen, children, skin = NIO.skin, buzz = 0 }) => (
  <PixelShot res={[216, 384]}>
    <SceneBg color="#191629" />
    <Cam pos={[0, -0.005, 0.25]} at={[0, -0.005, 0]} fov={38} />
    <ambientLight intensity={1.4} color="#d8d0e8" />
    <directionalLight position={[0.5, 1, 1]} intensity={1.0} color="#ffe9d0" />
    <mesh geometry={plane(3, 3)} position={[0, 0, -0.7]} material={toon('#3a3048')} />
    {[[-0.3, 0.2, '#ffd98a'], [0.25, 0.32, '#ff9e8a'], [0.1, -0.25, '#fff1c9'], [-0.2, -0.3, '#ffb07a']].map(([x, y, c], i) => (
      <mesh key={i} geometry={sph(0.03, 8, 6)} position={[x as number, y as number, -0.6]} material={toon(c as string, c as string, 1.6)} />
    ))}
    <group position={[buzz * 0.003, 0, 0]}>
      <Phone on={0} />
      {screen && <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0056]}><meshBasicMaterial map={screen} toneMapped={false} /></mesh>}
      {children}
      <Solid geo={sph(0.06)} mat={toon(skin)} position={[0.012, -0.11, -0.02]} scale={[1.3, 0.85, 0.7]} line={0.012} />
      {[0, 1, 2, 3].map((i) => <Solid key={i} geo={cap(0.0095, 0.006)} mat={toon(skin)} position={[-0.046, -0.005 - i * 0.022, 0.002]} rotation={[0, 0, 1.45]} line={0.009} />)}
      <group position={[0.062, -0.085, 0.012]} rotation={[0, 0, 0.35]}><Solid geo={cap(0.014, 0.04)} mat={toon(skin)} line={0.01} /></group>
    </group>
  </PixelShot>
);

const SH3 = S(() => { const s = usePilotScreens(); return <Insert screen={s?.cam_thumb} />; });   // the photo: his thumb

const SH4 = S(({ t }) => {   // CU Maya: "That's your thumb."
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, breathe: breathe(t), smile: 0.2, mouth: mouthAt(t, 'p_m2', 0.3), lid: 0.25 };
  const f = frame(MAYA_HEAD, 'cu', 0.05, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={MAYA} p={maya} /></Exterior></PixelShot>
      {saying(t, 'p_m2', 0.3) && <Sub text="that's your thumb." />}
    </AbsoluteFill>
  );
});

const SH5 = S(({ t }) => {   // CU Nio: "That's a choice." Dead serious.
  const nio: Pose = { ...NIO_SPOT, breathe: breathe(t), armR: SHOOT, headPitch: 0.05, lid: 0.3, brow: 0.45, smile: -0.1, mouth: mouthAt(t, 'p_n1', 0.25) };
  const f = frame(NIO_SHOOT_HEAD, 'cu', Math.PI, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={NIO} p={nio} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_n1', 0.25) && <Sub text="that's a choice." />}
    </AbsoluteFill>
  );
});

const LYING: Pose = { ...NIO_SPOT, y: -0.5, z: NIO_SPOT.z - 0.55, pitch: -Math.PI / 2 + 0.05, legL: { hip: 0, knee: 0.1 }, legR: { hip: 0, knee: 0.1 }, armR: { sx: -2.9, sz: -0.2, el: 0.4 }, armL: { sx: -2.9, sz: 0.2, el: 0.4 } };

const SH6 = S(({ t }) => {   // WS: he's on the floor at her feet, phone up. She holds the pose. "You can just press the button."
  const shake = Math.sin(t * 22) * 0.04 * sp(t, 1.0);
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, breathe: breathe(t), smile: 0.6, mouth: mouthAt(t, 'p_m3', 0.9), armR: { sx: -2.4 + shake, sz: 0.25, el: 1.2 } };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[5.2, 1.25, 9.9]} at={[3.3, 0.75, 7.7]} fov={46} />
        <Exterior curtain={1}><Character look={MAYA} p={maya} /><Character look={NIO} p={{ ...LYING, lid: 0.2 }} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_m3', 0.9) && <Sub text="you can just press the button." />}
    </AbsoluteFill>
  );
});

const SH7 = S(({ t }) => {   // low CU from the floor: "Nobody just presses the button."
  const nio: Pose = { ...LYING, lid: 0.25, brow: 0.5, eyeY: 0.6, mouth: mouthAt(t, 'p_n2', 0.2) };
  const hp: [number, number, number] = [NIO_SPOT.x!, 0.16, NIO_SPOT.z! - 0.55 - 0.95];
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[hp[0] + 0.05, 0.85, hp[2] - 0.05]} at={[hp[0], 0.1, hp[2] + 0.05]} fov={44} />
        <Exterior curtain={1}><Character look={NIO} p={nio} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_n2', 0.2) && <Sub text="nobody just presses the button." />}
    </AbsoluteFill>
  );
});

const SH8 = S(({ t }) => {   // the stall owner holds a lamp on her, because Nio is pointing at him
  const owner: Pose = { x: 2.55, z: 7.55, yaw: 0.9, breathe: breathe(t), armR: { sx: -1.6, sz: -0.2, el: 0.3 }, lid: 0.3, smile: -0.2 };
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, breathe: breathe(t), smile: 0.6, eyeX: -0.6 };
  return <PixelShot><Cam pos={[3.1, 1.45, 10.0]} at={[3.0, 1.1, 7.4]} fov={40} /><Exterior curtain={1}><Character look={MAYA} p={maya} /><Character look={OWNER} p={owner} handR={<Lamp />} />
    <Character look={NIO} p={{ ...NIO_SPOT, z: 8.95, armR: SHOOT, armL: { sx: -1.6, sz: 0.6, el: 0.1 } }} handR={<HerPhone />} /></Exterior></PixelShot>;
});

const SH9 = S(({ t }) => {   // the sock guy is just there, with a reflector. Nobody asks.
  const sock: Pose = { x: 4.4, z: 7.75, yaw: -1.3, breathe: breathe(t * 0.4), armR: { sx: -1.35, sz: -0.3, el: 0.6 }, armL: { sx: -1.35, sz: -0.3, el: 0.6 } };
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, breathe: breathe(t), smile: 0.6 };
  return <PixelShot><Cam pos={[3.7, 1.5, 10.3]} at={[3.9, 1.1, 7.4]} fov={40} /><Exterior curtain={1}><Character look={MAYA} p={maya} /><Character look={SOCK} p={sock} handR={<Reflector />} /></Exterior></PixelShot>;
});

const SH10 = S(() => { const s = usePilotScreens(); return <Insert screen={s?.cam_blurry} />; });
const SH11 = S(() => { const s = usePilotScreens(); return <Insert screen={s?.cam_pigeon} />; });

const SH12 = S(({ t }) => {   // WS: a crowd has formed. Phones up.
  const g = sp(t, 0.05, 'sheet');
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, breathe: breathe(t), smile: 0.5 };
  return <PixelShot><Cam pos={[3.4, 3.0, 12.6]} at={[3.4, 1.0, 7.8]} fov={46} /><Exterior curtain={1}><Character look={MAYA} p={maya} />
    <Character look={NIO} p={{ ...NIO_SPOT, armR: SHOOT }} handR={<HerPhone />} /><Crowd t={t} gather={g} /></Exterior></PixelShot>;
});

const ROOF: Pose = { x: 3.5, y: 2.42, z: 6.3, yaw: 0, armR: { sx: -0.3, sz: 1.3, el: 0.2 }, armL: { sx: -0.3, sz: 1.3, el: 0.2 } };

const SH13 = S(({ t }) => {   // low angle: he's on the stall's roof, arms out. "Everybody quiet."
  const nio: Pose = { ...ROOF, breathe: breathe(t), lid: 0.2, brow: 0.3, mouth: mouthAt(t, 'p_n3', 0.3), armR: { sx: -1.0, sz: -0.2, el: 0.9 } };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[3.3, 0.9, 9.6]} at={[3.5, 2.9, 6.3]} fov={46} /><Exterior curtain={1}><Character look={NIO} p={nio} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_n3', 0.3) && <Sub text="everybody quiet." />}
    </AbsoluteFill>
  );
});

const SH14 = S(({ t }) => {   // THE HOLD. Total silence. Everyone frozen, phones up. Her smile, trembling.
  const tremble = Math.sin(t * 30) * 0.02;
  const maya: Pose = { ...MAYA_SPOT, ...POSE_MAYA, smile: 0.7 + tremble * 6, headTilt: 0.12 + tremble };
  return <PixelShot><Cam pos={[3.3, 1.6, 11.2]} at={[3.4, 1.4, 7.0]} fov={44} /><Exterior curtain={1}><Character look={MAYA} p={maya} />
    <Character look={NIO} p={{ ...ROOF, armR: { sx: -1.0, sz: -0.2, el: 0.9 } }} handR={<HerPhone />} />
    <Character look={SOCK} p={{ x: 4.4, z: 7.75, yaw: -1.3, armR: { sx: -1.35, sz: -0.3, el: 0.6 }, armL: { sx: -1.35, sz: -0.3, el: 0.6 } }} handR={<Reflector />} />
    <Crowd t={t} gather={1} still /></Exterior></PixelShot>;
});

const SH15 = S(({ t }) => {   // CU Nio on the roof: "Three." The roof creaks. "Two."
  const wob = Math.sin(t * 9) * 0.03 * sp(t, 1.0);
  const nio: Pose = { ...ROOF, roll: wob, lid: 0.2, brow: 0.3, mouth: Math.max(mouthAt(t, 'p_n4', 0.2), mouthAt(t, 'p_n5', 1.5)), eyeY: t > 1.2 ? -1 : 0, wide: sp(t, 1.3) * 0.3,
    armR: { sx: -1.0, sz: -0.2, el: 0.9 } };
  const f = frame(headPos(ROOF, NIO), 'mcu', 0.1, { up: -0.15 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={NIO} p={nio} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_n4', 0.2) && <Sub text="three." />}
      {saying(t, 'p_n5', 1.5) && <Sub text="two." />}
    </AbsoluteFill>
  );
});

const SH16 = S(({ t }) => {   // WS: the collapse. Canopy folds, he drops with it.
  const c = sp(t, 0.15, 'pop');
  const fall = Math.min(1, Math.max(0, (t - 0.15) / 0.55));
  const nio: Pose = { ...ROOF, y: 2.42 - fall * fall * 1.75, pitch: -fall * 1.3, roll: fall * 0.4, wide: 1, mouth: 0.6, armR: { sx: -2.6, sz: 0.8, el: 0.3 }, armL: { sx: -2.6, sz: 0.8, el: 0.3 } };
  return <PixelShot><Cam pos={[6.6, 1.8, 10.4]} at={[3.5, 1.3, 6.6]} fov={42} /><Exterior curtain={1} collapse={c}>
    {fall < 1 && <Character look={NIO} p={nio} />}
    <Crowd t={t} gather={1} still /></Exterior></PixelShot>;
});

const SH17 = S(({ t }) => {   // after: silence, dust, his legs out of the wreck; the crowd lowers its phones
  return <PixelShot><Cam pos={[3.5, 1.4, 10.6]} at={[3.5, 0.9, 6.8]} fov={42} /><Exterior curtain={1} collapse={1}>
    <Character look={NIO} p={{ x: 3.4, y: 0.32, z: 6.95, yaw: 0, pitch: 1.45, legL: { hip: 0.2, knee: 0.4 }, legR: { hip: -0.1, knee: 0.2 } }} />
    <Crowd t={t} gather={1} phones={t < 1.0} /></Exterior></PixelShot>;
});

const SH18 = S(({ t }) => {   // INSERT, Maya's phone: "You might be in 214 photos"
  const s = usePilotScreens();
  return <Insert screen={s?.push} skin={MAYA.skin} buzz={t < 0.5 ? Math.sin(t * 90) : 0} />;
});

const SH19 = S(({ t }) => {   // INSERT: the album, GALLERY. It fills. "Ooh." She scrolls. "Ooh."
  const s = usePilotScreens();
  const tiles = ['maya1', 'maya2', 'maya3', 'maya4', 'maya5', 'maya6'];
  const scroll = keys(t, [[0, 0], [1.6, 1, 'sheet']]) * 0.35;
  return (
    <AbsoluteFill>
      <Insert screen={s?.album} skin={MAYA.skin}>
        {s && Array.from({ length: 21 }).map((_, i) => {
          const k = sp(t, 0.1 + i * 0.05, 'pop'); if (k <= 0.01) return null;
          const col = i % 3, row = Math.floor(i / 3), py = 172 + row * TILE - scroll * 844;
          if (py < 160 || py > 820) return null;
          const name = i === 13 ? 'fall' : tiles[(i * 5) % 6];
          const [x, y, z] = toScreen(col * TILE, py, TILE, TILE);
          return <mesh key={i} geometry={plane(0.066 / 3, 0.066 / 3)} position={[x, y, z + 0.0003]} scale={0.7 + 0.3 * k}><meshBasicMaterial map={s[`tile_${name}`]} transparent opacity={Math.min(1, k * 1.5)} toneMapped={false} /></mesh>;
        })}
      </Insert>
      {saying(t, 'p_m4', 0.4) && <Sub text="ooh." />}
    </AbsoluteFill>
  );
});

const SH20 = S(() => { const s = usePilotScreens(); return <Insert screen={s?.fullFall} skin={MAYA.skin} />; });   // she opens one

const SH21 = S(({ t }) => {   // CU Maya: "Who took this?"
  const maya: Pose = { ...MAYA_SPOT, z: 7.6, yaw: 0.4, breathe: breathe(t), armR: { sx: -0.9, sz: -0.3, el: 1.5 }, headPitch: 0.15, eyeY: -0.5, browUp: 0.8, smile: 0.4, mouth: mouthAt(t, 'p_m5', 0.3) };
  const f = frame(headPos(maya, MAYA), 'cu', 0.4, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1} collapse={1}><Character look={MAYA} p={maya} handR={<HerPhone />} /></Exterior></PixelShot>
      {saying(t, 'p_m5', 0.3) && <Sub text="who took this?" />}
    </AbsoluteFill>
  );
});

const SH22 = S(({ t }) => {   // MS: the sock guy, reflector under one arm, slowly raises a hand.
  const raise = sp(t, 0.5, 'lazy');
  const sock: Pose = { x: 4.4, z: 7.75, yaw: -1.9, breathe: breathe(t * 0.3), armR: { sx: -0.3 - raise * 2.4, sz: 0.1, el: 0.2 }, armL: { sx: -0.6, sz: -0.2, el: 1.2 } };
  const f = frame(headPos(sock, SOCK), 'ms', -1.9, { up: -0.1, fov: 44 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1} collapse={1}><Character look={SOCK} p={sock} handL={<Reflector />} /></Exterior></PixelShot>;
});

const SH23 = S(({ t }) => {   // CU: his face in the wreckage. "That was the plan."
  const nio: Pose = { x: 3.4, y: 0.32, z: 6.95, yaw: 0, pitch: 1.45, lid: 0.3, brow: 0.2, smile: 0.2, mouth: mouthAt(t, 'p_n6', 0.6) };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[3.45, 1.05, 7.55]} at={[3.4, 0.5, 6.4]} fov={34} /><Exterior curtain={1} collapse={1}><Character look={NIO} p={nio} /></Exterior></PixelShot>
      {saying(t, 'p_n6', 0.6) && <Sub text="that was the plan." />}
    </AbsoluteFill>
  );
});

const END = () => <AbsoluteFill style={{ background: '#0b0a0d' }} />;

// ---------------------------------------------------------------- cut + sound
const L = (k: string, extra: number, d: number) => Math.round((has(k) ? A.lines[k].dur + extra : d) * 24);
const SHOTS: [React.FC, number][] = [
  [SH1, L('p_m1', 1.6, 2.6)], [SH2, 38], [SH3, 30], [SH4, L('p_m2', 0.7, 1.5)], [SH5, L('p_n1', 0.75, 1.4)],
  [SH6, L('p_m3', 1.4, 2.8)], [SH7, L('p_n2', 0.7, 2.2)], [SH8, 30], [SH9, 34], [SH10, 22], [SH11, 22], [SH12, 50],
  [SH13, L('p_n3', 0.9, 1.8)], [SH14, 62], [SH15, 64], [SH16, 30], [SH17, 46], [SH18, 40], [SH19, 66], [SH20, 34],
  [SH21, L('p_m5', 0.8, 1.6)], [SH22, 48], [SH23, L('p_n6', 1.0, 2.0)], [END, 20],
];
const START = SHOTS.reduce<number[]>((a, [, d], i) => (a.push(i ? a[i - 1] + SHOTS[i - 1][1] : 0), a), []);
export const PILOT1_LEN = START[START.length - 1] + SHOTS[SHOTS.length - 1][1];
export const PILOT1_STARTS = START;
const at = (shot: number, s: number) => START[shot] + Math.round(s * 24);

const VO: [string, number, number][] = [
  ['p_m1', 0, 0.25], ['p_m2', 3, 0.3], ['p_n1', 4, 0.25], ['p_m3', 5, 0.9], ['p_n2', 6, 0.2], ['p_n3', 12, 0.3],
  ['p_n4', 14, 0.2], ['p_n5', 14, 1.5], ['p_m4', 18, 0.4], ['p_m5', 20, 0.3], ['p_n6', 22, 0.6],
];
const SFX: [string, number, number, number][] = [
  ['shutter', 2, 0.0, 0.8], ['shutter', 9, 0.0, 0.8], ['shutter', 10, 0.0, 0.8], ['creak', 14, 1.1, 0.9], ['crash', 15, 0.15, 1],
  ['buzz', 17, 0.05, 0.9], ['shutter', 18, 0.3, 0.4], ['shutter', 18, 0.7, 0.4], ['shutter', 18, 1.1, 0.4], ['sting', 22, 1.2, 0.8],
];

export const PilotOnePhoto: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {SHOTS.map(([C, d], i) => <Sequence key={i} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    {/* the market murmurs... until "Everybody quiet." Then nothing but the roof. */}
    <Sequence from={0} durationInFrames={at(12, 1.0)}><Audio src={staticFile(A.sfx.market)} volume={0.5} /></Sequence>
    <Sequence from={at(15, 1.2)} durationInFrames={START[23] - at(15, 1.2)}><Audio src={staticFile(A.sfx.market)} volume={0.35} /></Sequence>
    {VO.map(([k, s, o]) => has(k) ? <Sequence key={k} from={at(s, o)}><Audio src={staticFile(A.lines[k].file)} /></Sequence> : null)}
    {SFX.map(([k, s, o, v], i) => A.sfx[k] ? <Sequence key={`s${i}`} from={at(s, o)}><Audio src={staticFile(A.sfx[k])} volume={v} /></Sequence> : null)}
    <Sequence from={0} durationInFrames={START[23]}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 52, color: '#efe6d2', background: 'rgba(21,18,22,0.78)', padding: '6px 26px 10px', borderRadius: 40 }}>PILOT</div>
      </div>
    </Sequence>
  </AbsoluteFill>
);

/** The in-show photos (rendered first into public/photos/p_*.png). */
export const PilotPhoto: React.FC<{ which: string }> = ({ which }) => {
  const posed = (extra: Partial<Pose>): Pose => ({ ...MAYA_SPOT, ...POSE_MAYA, ...extra });
  const shots: Record<string, { cam: [number, number, number]; at: [number, number, number]; fov: number; maya?: Pose; extra?: React.ReactNode; collapse?: number }> = {
    thumb: { cam: [3.35, 1.4, 8.6], at: [3.3, 1.2, 7.2], fov: 50, maya: posed({}), extra: <Solid geo={sph(0.06)} mat={toon('#b9805c')} position={[3.38, 1.33, 8.52]} scale={[1.2, 1.4, 0.5]} line={0} /> },
    blurry: { cam: [3.3, 1.4, 8.7], at: [3.3, 1.2, 7.2], fov: 46, maya: posed({ lid: 1, smile: 0.4 }) },
    pigeon: { cam: [3.05, 1.12, 6.95], at: [3.2, 1.0, 6.5], fov: 40, maya: posed({}), extra: <Pigeon p={[3.25, 1.0, 6.45]} yaw={0.6} /> },
    maya1: { cam: [3.1, 1.45, 9.0], at: [3.3, 1.35, 7.2], fov: 32, maya: posed({ smile: 1, lid: 0.1 }) },
    maya2: { cam: [4.6, 1.3, 8.7], at: [3.3, 1.3, 7.2], fov: 30, maya: posed({ smile: 0.8, headTilt: 0.2, eyeX: 0.6 }) },
    maya3: { cam: [2.0, 1.6, 8.5], at: [3.3, 1.25, 7.2], fov: 34, maya: posed({ smile: 1, lid: 0.6 }) },
    maya4: { cam: [3.4, 1.3, 9.6], at: [3.3, 1.1, 7.2], fov: 44, maya: posed({ smile: 0.9, wide: 0.3, armR: { sx: -1.4, sz: -0.4, el: 1.8 } }) },
    maya5: { cam: [4.2, 1.9, 9.0], at: [3.3, 1.3, 7.2], fov: 34, maya: posed({ smile: 0.6, headTilt: -0.1, lid: 0.2 }) },
    maya6: { cam: [2.6, 1.2, 8.8], at: [3.3, 1.35, 7.2], fov: 30, maya: posed({ smile: 1, lid: 0.9, mouth: 0.6 }) },
    fall: { cam: [3.6, 0.8, 9.4], at: [3.5, 2.2, 6.3], fov: 40, collapse: 0.4,
      extra: <Character look={NIO} p={{ ...ROOF, y: 2.0, pitch: -0.5, roll: 0.25, wide: 0.6, mouth: 0.5, armR: { sx: -2.7, sz: 0.9, el: 0.2 }, armL: { sx: -2.7, sz: 0.9, el: 0.2 }, legL: { hip: 0.6, knee: 0.9 }, legR: { hip: -0.3, knee: 0.2 } }} /> },
  };
  const s = shots[which]; if (!s) return null;
  return (
    <PixelShot res={[216, 384]}><Cam pos={s.cam} at={s.at} fov={s.fov} />
      <Exterior curtain={1} collapse={s.collapse ?? 0}>{s.maya && <Character look={MAYA} p={s.maya} />}{s.extra}
        {which.startsWith('maya') || which === 'fall' ? <Crowd t={0.5} gather={1} /> : null}</Exterior>
    </PixelShot>
  );
};
