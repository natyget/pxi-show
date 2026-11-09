// EP 1 — "You Might Be In A Photo" (Part 1)
// Wednesday, 11:47 PM. Nio is in the laundromat, half-watching a cooking show. PXI tells him he might be in a photo.
// It's a photo of him, from behind, right now. The album it's in ("nio being nio") is full of him, everywhere, all week.
// He goes to call the cops; a new photo lands: him, at the rooftop party Maya signed them up for. On Saturday.
// It is Wednesday. He deletes PXI. PXI tells him he might be in a photo. It's him, deleting PXI.
// (Mundane truth, revealed in Part 2: it's Maya's album; the "future" photo is last year's flyer shoot she edited him into.)
// Direction: locked-off camera, hard cuts, every beat a new shot. Faces framed from the head's real position (frame()).
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { frame } from './lib/frame';
import { Laundromat, BenchProps } from './world/Laundromat';
import { Exterior, SceneBg } from './world/Exterior';
import { Rooftop, Headphones } from './world/Rooftop';
import { Character, NIO, MAYA, Look, Pose, headPos } from './world/Character';
import { Phone } from './world/Phone';
import { useEp1Screens } from './ui/Ep1Screens';
import { t12, sp, keys, blink, breathe, nz, walk } from './lib/motion';
import { Solid, toon, sph, cap, plane, rbox, cyl } from './lib/toon';
import audio from './audio.json';

type Line = { file: string; dur: number; env: number[] };
const A = audio as { lines: Record<string, Line>; sfx: Record<string, string> };
const mouthAt = (t: number, key: string, at: number) => {
  const l = A.lines[key]; const i = Math.floor((t - at) * 12);
  return i < 0 || i >= l.env.length ? 0 : Math.min(1, l.env[i] * 1.3);
};
const saying = (t: number, key: string, at: number) => t > at && t < at + A.lines[key].dur + 0.2;

/** The sock guy: very tall, very still, bald, moustache, sunglasses indoors, a suit at midnight in a laundromat. */
export const SOCK: Look = {
  skin: '#e2c2a6', skinShade: '#c4a083', hair: '#3a2a22', hairDark: '#3a2a22', iris: '#2a1a12', top: '#24232b', topDark: '#1a1920',
  pants: '#24232b', shoes: '#0f0e12', shape: 'long', hairStyle: 'bald', mustache: true, shades: true, height: 1.12, build: 1.05,
};

// ---------------------------------------------------------------- staging (laundromat)
// Nio sits on the bench (seat top 0.44) facing the machines (-z). The sock guy sits facing his washer (x = 0.6).
const NIO_SIT: Pose = { x: -0.3, y: -0.15, z: 0.42, yaw: Math.PI, legL: { hip: 1.28, knee: 1.22, spread: 0.08 }, legR: { hip: 1.28, knee: 1.22, spread: -0.05 } };
const SOCK_SIT: Pose = { x: 0.6, y: -0.2 * 1.12, z: -1.55, yaw: Math.PI, legL: { hip: 1.35, knee: 1.35, spread: 0.1 }, legR: { hip: 1.35, knee: 1.35, spread: -0.1 },
  armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: { sx: -0.55, sz: 0.15, el: 1.3 } };
const HOLD = { sx: -0.65, sy: 0, sz: -0.22, el: 1.38 };
const PhoneInHand: React.FC<{ on?: number; buzz?: number }> = (p) => (
  <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone {...p} /></group>
);
const Chair: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <Solid geo={rbox(0.5, 0.05, 0.48, 0.02)} mat={toon('#e0b23c')} position={[0, 0.42, 0]} />
    <Solid geo={rbox(0.5, 0.45, 0.05, 0.02)} mat={toon('#e0b23c')} position={[0, 0.66, 0.22]} />
    {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([a, b]) => <Solid key={`${a}${b}`} geo={cyl(0.015, 0.015, 0.42, 6)} mat={toon('#6c747c')} position={[a, 0.21, b]} line={0.006} />)}
  </group>
);

const SockGuy: React.FC<{ t: number; p?: Pose }> = ({ t, p }) => (
  <>
    <Chair x={0.6} z={-1.55} />
    <Character look={SOCK} p={p ?? { ...SOCK_SIT, breathe: breathe(t * 0.4), headPitch: 0.12 }} />
  </>
);

// ---------------------------------------------------------------- phone inserts
const toScreen = (px: number, py: number, w: number, h: number): [number, number, number] =>
  [((px + w / 2) / 390) * 0.066 - 0.033, 0.071 - ((py + h / 2) / 844) * 0.142, 0.0058];
const Insert: React.FC<{ screen?: any; reach?: number; press?: number; buzz?: number; children?: React.ReactNode }> = ({ screen, reach = 0, press = 0, buzz = 0, children }) => (
  <PixelShot res={[216, 384]}>
    <SceneBg color="#cfd6cf" />
    <Cam pos={[0, -0.005, 0.25]} at={[0, -0.005, 0]} fov={38} />
    <ambientLight intensity={1.5} color="#eef4f4" />
    <directionalLight position={[0.5, 1, 1]} intensity={1.0} color="#ffffff" />
    {/* behind the phone: his lap / the bench, out of focus */}
    <mesh geometry={plane(3, 3)} position={[0, 0, -0.6]} material={toon(NIO.pants)} />
    <Solid geo={cap(0.06, 1.2)} mat={toon(NIO.top)} position={[0.12, -0.22, -0.5]} rotation={[0, 0, 1.3]} line={0.012} />
    <group position={[buzz * 0.003, 0, 0]}>
      <Phone on={0} />
      {screen && <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0056]}><meshBasicMaterial map={screen} toneMapped={false} /></mesh>}
      {children}
      <Solid geo={sph(0.06)} mat={toon(NIO.skin)} position={[0.01, -0.105, -0.02]} scale={[1.3, 0.9, 0.7]} line={0.012} />
      {[0, 1, 2].map((i) => <Solid key={i} geo={cap(0.011, 0.02)} mat={toon(NIO.skin)} position={[-0.041, -0.02 - i * 0.026, 0.0]} rotation={[0, 0, 0.2]} line={0.01} />)}
      <group position={[0.05, -0.085, 0.012 + press * -0.003]} rotation={[0, 0, 0.75 - reach * 0.55]}>
        <Solid geo={cap(0.014, 0.045 + reach * 0.03)} mat={toon(NIO.skin)} position={[0, 0.035 + reach * 0.015, 0]} line={0.01} />
      </group>
    </group>
  </PixelShot>
);
/** A push card sliding down over whatever is on screen. */
const Card: React.FC<{ tex: any; k: number }> = ({ tex, k }) => {
  const [x, y, z] = toScreen(10, 290, 370, 150);
  return k > 0.01 ? (
    <mesh geometry={plane(0.0626, 0.0254)} position={[x, y + (1 - k) * 0.02, z + 0.0003]}>
      <meshBasicMaterial map={tex} transparent opacity={Math.min(1, k * 1.5)} toneMapped={false} />
    </mesh>
  ) : null;
};

// Nio's sitting pose with the phone; head offsets are layered per shot.
const nioSit = (t: number, extra: Pose): Pose => ({ ...NIO_SIT, breathe: breathe(t), armR: HOLD, armL: { sx: -0.3, sz: 0.2, el: 0.9 }, ...extra });
const NIO_HEAD = headPos(NIO_SIT, NIO);

// ---------------------------------------------------------------- shots
const S1: React.FC = () => {      // HOOK: one sock, spinning
  const t = t12(useCurrentFrame());
  return (
    <PixelShot>
      <Cam pos={[0.45, 0.85, -0.6]} at={[0.6, 0.6, -2.3]} fov={50} />
      <Laundromat t={t + 3} />
    </PixelShot>
  );
};

const S2: React.FC = () => {      // WIDE: the laundromat; Nio eats chips, watching the cooking show
  const t = t12(useCurrentFrame());
  const chip = (Math.sin(t * 3.2) + 1) / 2;
  const p = nioSit(t, { headYaw: -0.75, headPitch: -0.28, eyeX: -0.5, eyeY: 0.4, lid: Math.max(0.25, blink(t, [1.4])), smirk: 0.2,
    armL: { sx: -0.9 - chip * 0.6, sz: 0.25, el: 1.4 + chip * 0.5 }, mouth: chip > 0.85 ? 0.4 : 0, armR: { sx: -0.1, sz: 0.1, el: 0.4 } });
  return (
    <PixelShot>
      <Cam pos={[-2.9 + t * 0.01, 2.0, 2.55]} at={[0.1, 0.85, -1.0]} fov={50} />
      <Laundromat t={t + 4}><BenchProps /><Character look={NIO} p={p} /><SockGuy t={t} /></Laundromat>
    </PixelShot>
  );
};

const S3: React.FC = () => {      // INSERT: the push
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  const buzz = t > 0.2 && t < 0.8 ? nz(f0, 2) : 0;
  return <Insert screen={s?.lock} buzz={buzz} reach={keys(t, [[0, 0], [1.2, 0.7, 'sheet']])}>{s && <Card tex={s.card} k={sp(t, 0.25, 'pop')} />}</Insert>;
};

const S4: React.FC = () => {      // MCU: chip frozen halfway; "a picture of me? ...in an album?"
  const t = t12(useCurrentFrame());
  const look = sp(t, 0.15, 'snap');
  const p = nioSit(t, { headPitch: 0.42 * look - 0.15 * (1 - look), headYaw: -0.6 * (1 - look), eyeY: -0.9 * look, eyeX: 0,
    lid: Math.max(blink(t, [2.1]), 0.2), brow: 0.35 * sp(t, 0.6), browR: sp(t, 1.4) * 1.1, mouth: 0,
    armL: { sx: -1.5, sz: 0.25, el: 1.9 } });   // the chip stays at mouth height, forgotten
  const f = frame(NIO_HEAD, 'mcu', Math.PI, { up: 0.04 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Laundromat t={t + 6}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'e1_t1', 0.3) && <Sub text="(a picture of me? ...in an album?)" />}
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {      // INSERT: IS THIS YOU? — the back of his own head, on this bench, now
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return <Insert screen={t < 0.35 ? s?.lock : s?.review_behind} reach={t < 0.35 ? 0.9 : 0.4} press={t > 0.2 && t < 0.4 ? 1 : 0}>{s && t < 0.35 && <Card tex={s.card} k={1} />}</Insert>;
};

const S6: React.FC = () => {      // CU: eyes slide... the chip falls... WHIP round
  const f0 = useCurrentFrame(), t = t12(f0);
  const slide = keys(t, [[0, 0], [0.25, -0.9, 'lazy'], [0.85, 0.9, 'lazy']]);
  const whip = sp(t, 1.35, 'snap');
  const sq = t > 1.33 && t < 1.5 ? 0.12 : 0;
  const p = nioSit(t, { headPitch: 0.35 * (1 - whip), eyeX: slide * (1 - whip) + whip * 0.9, eyeY: -0.5 * (1 - whip), lid: 0.15 * (1 - whip),
    wide: whip * 0.4, browUp: whip * 0.8, brow: -0.3 * whip, twist: whip * 0.55, headYaw: whip * 1.0, squash: sq, armL: { sx: -1.5, sz: 0.25, el: 1.9 } });
  const fr = frame(NIO_HEAD, 'cu', Math.PI, { up: 0.02 });
  const chipY = t > 0.9 ? Math.max(0.46, 0.95 - (t - 0.9) * (t - 0.9) * 4.9) : 0.95;
  return (
    <PixelShot>
      <Cam pos={fr.pos} at={fr.at} fov={fr.fov} />
      <Laundromat t={t + 9}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} />
        <mesh geometry={sph(0.02, 8, 6)} position={[-0.47, chipY, 0.2]} scale={[1.2, 0.4, 1]} material={toon('#e8c35a')} /></Laundromat>
    </PixelShot>
  );
};

const S7: React.FC = () => {      // REVERSE WIDE: behind him... the empty window. The sock guy, unbothered.
  const t = t12(useCurrentFrame());
  const p = nioSit(t, { twist: 0.55, headYaw: 1.0, eyeX: 0.9, wide: 0.35, browUp: 0.8, brow: -0.3, armL: { sx: -1.5, sz: 0.25, el: 1.9 } });
  return (
    <PixelShot>
      <Cam pos={[1.9, 1.55, -1.95]} at={[-0.2, 0.75, 1.0]} fov={52} />
      <Laundromat t={t + 11}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /><SockGuy t={t} /></Laundromat>
    </PixelShot>
  );
};

const S8: React.FC = () => {      // INSERT: the album fills up. Shutter on each.
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  const slots: [number, number][] = [[20, 190], [200, 190], [20, 425], [200, 425]];
  return (
    <AbsoluteFill>
      <Insert screen={s?.album} reach={0.3}>
        {s && slots.map(([px, py], i) => {
          const k = sp(t, 0.35 + i * 0.75, 'pop'); const [x, y, z] = toScreen(px, py, 170, 220);
          return k > 0.01 ? <mesh key={i} geometry={plane(0.0288, 0.037)} position={[x, y, z + 0.0003]} scale={0.6 + 0.4 * k}><meshBasicMaterial map={s[`thumb${i}`]} transparent opacity={Math.min(1, k * 1.4)} toneMapped={false} /></mesh> : null;
        })}
      </Insert>
      {saying(t, 'e1_t2', 0.15) && <Sub text="(what the heck is this even about)" />}
      {t > 2.4 && saying(t, 'e1_t3', 2.4) && <Sub text="(that's me sneezing. that's me smelling a candle...)" />}
    </AbsoluteFill>
  );
};

const S9: React.FC = () => {      // CU: who is out here documenting me? Sweat. Leaning into the phone.
  const t = t12(useCurrentFrame());
  const lean = sp(t, 0.1, 'lazy');
  const p = nioSit(t, { lean: lean * 0.15, headPitch: 0.3, eyeY: -0.7, eyeX: Math.sin(t * 7) * 0.25, wide: 0.15 + lean * 0.25, brow: -0.55, browUp: 0.5,
    sweat: sp(t, 0.6), mouth: 0, armL: { sx: -0.6, sz: 0.2, el: 1.1 } });
  const fr = frame(NIO_HEAD, 'cu', Math.PI, { up: 0.03 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={[fr.at[0], fr.at[1] - lean * 0.03, fr.at[2]]} fov={fr.fov} />
        <Laundromat t={t + 16}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'e1_t3', -1.8) && <Sub text="(who is out here... documenting me?)" />}
    </AbsoluteFill>
  );
};

const S10: React.FC = () => {     // MS: he stands. "Nah. I'm not playing this shit. I'm callin' the cops."
  const t = t12(useCurrentFrame());
  const dip = sp(t, 0.05, 'snap') - sp(t, 0.2, 'snap');     // anticipation: a little sink before the rise
  const up = sp(t, 0.2, 'snap');
  const p: Pose = { ...NIO_SIT, y: -0.15 * (1 - up) - dip * 0.04, z: 0.42 - up * 0.42, breathe: breathe(t),
    legL: { hip: 1.28 * (1 - up), knee: 1.22 * (1 - up), spread: 0.05 }, legR: { hip: 1.28 * (1 - up), knee: 1.22 * (1 - up), spread: -0.03 },
    lean: 0.35 * (1 - up) - 0.05 * sp(t, 0.9), armR: { ...HOLD, el: 1.1 }, armL: { sx: -0.3 + sp(t, 1.6) * -0.6, sz: 0.3, el: 0.8 },
    headPitch: 0.05, brow: 0.7, lid: 0.25, mouth: mouthAt(t, 'e1_s1', 0.55), smile: -0.3 };
  const standHead = headPos({ ...NIO_SIT, y: 0, z: 0.0 }, NIO);
  const fr = frame([standHead[0], standHead[1] - 0.2, standHead[2]], 'ms', Math.PI - 0.35, { up: -0.1, fov: 52 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} />
        <Laundromat t={t + 19}><BenchProps chips={false} /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /><SockGuy t={t} /></Laundromat></PixelShot>
      {saying(t, 'e1_s1', 0.55) && <Sub text="nah. i'm not playing this sh*t. i'm callin' the cops." />}
    </AbsoluteFill>
  );
};

const S11: React.FC = () => {     // INSERT: 9... 1... and a new photo drops in
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  const tap = t < 0.9 ? (Math.floor(t * 4) % 2) : 0;
  return <Insert screen={s?.dial} reach={0.85} press={tap} buzz={t > 1.0 && t < 1.5 ? nz(f0, 4) : 0}>{s && <Card tex={s.card} k={sp(t, 1.0, 'pop')} />}</Insert>;
};

const S12: React.FC = () => {     // INSERT: the photo from Saturday
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return (
    <AbsoluteFill>
      <Insert screen={s?.review_future} reach={0.3} />
      {saying(t, 'e1_t4', 1.0) && <Sub text="(...when is this?)" />}
    </AbsoluteFill>
  );
};

const STAND: Pose = { ...NIO_SIT, y: 0, z: 0.0, legL: { hip: 0, knee: 0, spread: 0.04 }, legR: { hip: 0, knee: 0, spread: -0.03 } };
const STAND_HEAD = headPos(STAND, NIO);

const S13: React.FC = () => {     // CU: phone to his mouth. "Maya. Ain't this the party you signed us up for?"
  const t = t12(useCurrentFrame());
  const raise = sp(t, 0.1, 'snap');
  const p: Pose = { ...STAND, breathe: breathe(t), armR: { sx: -0.65 - raise * 0.35, sz: -0.35 - raise * 0.2, el: 1.38 + raise * 0.5 },
    headPitch: 0.05, lid: 0.45, brow: 0.6, browR: 0.6, mouth: mouthAt(t, 'e1_s2', 0.3), eyeX: 0.2 };
  const fr = frame(STAND_HEAD, 'cu', Math.PI + 0.2, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 25}><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'e1_s2', 0.3) && <Sub text="maya. ain't this the party you signed us up for?" />}
    </AbsoluteFill>
  );
};

const S14: React.FC = () => {     // INSERT: Maya's voice note back
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return (
    <AbsoluteFill>
      <Insert screen={t < 0.35 ? s?.thread1 : s?.thread2} reach={0.2} />
      {saying(t, 'e1_m1', 0.45) && <Sub text="maya: yeah! it's on saturday! why?" />}
    </AbsoluteFill>
  );
};

const S15: React.FC = () => {     // ECU: "...it's wednesday." Then it clicks. The world tilts.
  const f0 = useCurrentFrame(), t = t12(f0);
  const click = sp(t, 1.75, 'pop');
  const p: Pose = { ...STAND, breathe: breathe(t), armR: { sx: -1.0, sz: -0.55, el: 1.88 }, headPitch: 0.02,
    lid: 0.5 * (1 - click), wide: click, browUp: click * 1.2, brow: -0.6 * click, mouth: t > 1.75 ? 0.3 + Math.abs(Math.sin(t * 30)) * 0.2 : mouthAt(t, 'e1_s3', 0.6),
    sweat: click, squash: t > 1.75 && t < 1.95 ? 0.15 : 0, headTilt: click * 0.08 };
  const fr = frame(STAND_HEAD, 'ecu', Math.PI + 0.15, { up: 0.0 });
  const glitch = t > 1.75 && t < 2.2 ? 0.5 + nz(f0, 3) * 0.5 : 0;
  return (
    <AbsoluteFill>
      <PixelShot glitch={glitch}><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 29}><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'e1_s3', 0.6) && t < 1.75 && <Sub text="...it's wednesday." />}
    </AbsoluteFill>
  );
};

const S16: React.FC = () => {     // INSERT: delete the app. "Aight. Bye."
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  const scr = t < 0.35 ? s?.home : t < 1.6 ? s?.home_alert : s?.home_gone;
  return (
    <AbsoluteFill>
      <Insert screen={scr} reach={t > 1.2 && t < 1.7 ? 0.9 : 0.5} press={t > 1.45 && t < 1.65 ? 1 : 0} />
      {saying(t, 'e1_s4', 0.55) && <Sub text="aight. bye." />}
    </AbsoluteFill>
  );
};

const S17: React.FC = () => {     // MCU: relief. Shoulders drop. Then the buzz.
  const t = t12(useCurrentFrame());
  const relief = sp(t, 0.1, 'lazy'), freeze = sp(t, 1.35, 'snap');
  const p: Pose = { ...STAND, breathe: breathe(t) * (1 - freeze), armR: { sx: -0.65, sz: -0.25, el: 1.38 }, armL: { sx: 0.05, sz: 0.1 + relief * 0.05, el: 0.2 },
    headPitch: 0.25 - relief * 0.2, lid: freeze ? 0.0 : 0.55 * relief, smile: relief * 0.6 * (1 - freeze), wide: freeze * 0.6, browUp: freeze, eyeY: -freeze * 0.6, lean: -relief * 0.03 };
  const fr = frame(STAND_HEAD, 'mcu', Math.PI - 0.1, { up: 0.02 });
  return (
    <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 33}><Character look={NIO} p={p} handR={<PhoneInHand on={1} buzz={t > 1.35 && t < 1.9 ? 1 : 0} />} /></Laundromat></PixelShot>
  );
};

const S18: React.FC = () => {     // INSERT: the app is gone. The push comes anyway.
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  return <Insert screen={s?.home_gone} reach={0.3} buzz={t < 0.5 ? nz(f0, 6) : 0}>{s && <Card tex={s.card} k={sp(t, 0.1, 'pop')} />}</Insert>;
};

const S19: React.FC = () => {     // INSERT: IS THIS YOU? — him, from behind, deleting the app
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return <Insert screen={s?.review_deleting} reach={0.3} />;
};

const S20: React.FC = () => {     // CU: a slow, slow turn
  const t = t12(useCurrentFrame());
  const turn = sp(t, 0.2, 'lazy');
  const p: Pose = { ...STAND, armR: { sx: -0.65, sz: -0.25, el: 1.38 }, twist: turn * 0.5, headYaw: turn * 1.05, eyeX: turn * 0.9, wide: 0.5, lid: 0, browUp: 0.8, brow: -0.4, sweat: 1, mouth: 0.15 };
  const fr = frame(STAND_HEAD, 'cu', -1.25, { up: 0.02 });   // he looks back over his left shoulder: we're there
  return <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 36}><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>;
};

const S21: React.FC = () => {     // REVERSE: the sock guy, standing right there, holding up the sock. "...it's clean."
  const t = t12(useCurrentFrame());
  const sock: Pose = { x: -1.35, z: 0.95, yaw: 2.3, breathe: breathe(t * 0.3), armR: { sx: -1.9, sz: -0.25, el: 0.9 }, headPitch: -0.05,
    mouth: mouthAt(t, 'e1_w1', 0.7), smile: 0 };
  const sockHead = headPos(sock, SOCK);
  const fr = frame(sockHead, 'ms', 2.3, { up: -0.15, fov: 50, eyeAt: 0.36 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} />
        <Laundromat t={t + 38}><Character look={SOCK} p={sock} handR={<mesh position={[0, -0.12, 0.02]} geometry={rbox(0.07, 0.2, 0.015, 0.03)} material={toon('#f2efe8')} />} /></Laundromat></PixelShot>
      {saying(t, 'e1_w1', 0.7) && <Sub text="...it's clean." />}
    </AbsoluteFill>
  );
};

const S22: React.FC = () => <AbsoluteFill style={{ background: '#0b0a0d' }} />;

// ---------------------------------------------------------------- the cut
const SHOTS: [React.FC, number][] = [
  [S1, 22], [S2, 58], [S3, 48], [S4, 62], [S5, 53], [S6, 48], [S7, 43], [S8, 101], [S9, 67], [S10, 82], [S11, 48],
  [S12, 66], [S13, 86], [S14, 86], [S15, 62], [S16, 58], [S17, 53], [S18, 38], [S19, 43], [S20, 48], [S21, 53], [S22, 28],
];
const START = SHOTS.reduce<number[]>((a, [, d], i) => (a.push(i ? a[i - 1] + SHOTS[i - 1][1] : 0), a), []);
export const EP1_LEN = START[START.length - 1] + SHOTS[SHOTS.length - 1][1];
export const EP1_STARTS = START;
const at = (shot: number, s: number) => START[shot] + Math.round(s * 24);

const VO: [string, number, number, number?][] = [
  ['e1_tv', 0, 0.05, 0.55], ['e1_t1', 3, 0.3], ['e1_t2', 7, 0.15], ['e1_t3', 7, 2.4], ['e1_s1', 9, 0.55], ['e1_t4', 11, 1.0],
  ['e1_s2', 12, 0.3], ['e1_m1', 13, 0.45], ['e1_s3', 14, 0.6], ['e1_s4', 15, 0.55], ['e1_w1', 20, 0.7],
];
const SFX: [string, number, number, number][] = [
  ['buzz', 2, 0.2, 0.9], ['sting', 4, 0.4, 0.6], ['shutter', 7, 0.35, 0.8], ['shutter', 7, 1.1, 0.8], ['shutter', 7, 1.85, 0.8], ['shutter', 7, 2.6, 0.8],
  ['buzz', 10, 1.0, 0.9], ['glitch', 14, 1.75, 0.8], ['drop', 14, 1.75, 0.7], ['poof', 15, 1.6, 0.8], ['buzz', 16, 1.35, 1], ['buzz', 17, 0.1, 0.8],
  ['sting', 18, 0.2, 0.8], ['sting', 21, 0.0, 1],
];

export const Ep1: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {SHOTS.map(([C, d], i) => <Sequence key={i} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    {/* the laundromat hums the whole time, and drops away for the black at the end */}
    <Sequence from={0} durationInFrames={START[21]}><Audio src={staticFile(A.sfx.laundromat)} volume={0.55} /></Sequence>
    {VO.map(([k, s, o, v], i) => <Sequence key={i} from={at(s, o)}><Audio src={staticFile(A.lines[k].file)} volume={v ?? 1} /></Sequence>)}
    {SFX.map(([k, s, o, v], i) => <Sequence key={`s${i}`} from={at(s, o)}><Audio src={staticFile(A.sfx[k])} volume={v} /></Sequence>)}
    <div style={{ position: 'absolute', top: 118, width: '100%', textAlign: 'center', fontFamily: 'Pixelify', fontWeight: 700, fontSize: 60, color: '#efe6d2',
      textShadow: '0 6px 0 #151216, 5px 0 0 #151216, -5px 0 0 #151216, 0 -5px 0 #151216' }}>PART 1</div>
  </AbsoluteFill>
);

/** In-show photos (rendered to public/photos/e1_*.png first). */
export const Ep1Photo: React.FC<{ which: string }> = ({ which }) => {
  const phoneUp = { sx: -1.0, sz: -0.4, el: 1.7 };
  if (which === 'behind') return (
    <PixelShot res={[216, 384]}><Cam pos={[-0.05, 1.3, 2.4]} at={[-0.3, 0.85, 0.0]} fov={44} />
      <Laundromat t={2}><BenchProps /><Character look={NIO} p={nioSit(0, { headPitch: 0.35, armL: { sx: -1.5, sz: 0.25, el: 1.9 } })} handR={<PhoneInHand on={1} />} /><SockGuy t={0} /></Laundromat></PixelShot>);
  if (which === 'deleting') return (
    <PixelShot res={[216, 384]}><Cam pos={[0.0, 1.45, 2.5]} at={[-0.3, 1.1, 0.0]} fov={44} />
      <Laundromat t={5}><BenchProps chips={false} /><Character look={NIO} p={{ ...STAND, armR: phoneUp, headPitch: 0.3 }} handR={<PhoneInHand on={1} />} /><SockGuy t={0} /></Laundromat></PixelShot>);
  if (which === 'sneeze') { const p: Pose = { x: 4.2, z: -3.4, yaw: 0.2, sneeze: 1, headPitch: 0.35, squash: -0.05, lean: 0.12, armL: { sx: -1.4, sz: 0.3, el: 1.9 } };
    const f = frame(headPos(p, NIO), 'ms', 0.3); return <PixelShot res={[216, 384]}><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'candle') { const p: Pose = { x: 3.5, z: 7.0, yaw: Math.PI, lean: 0.45, lid: 1, smile: 0.7, headPitch: 0.3, armR: { sx: -1.2, sz: -0.3, el: 1.2 } };
    return <PixelShot res={[216, 384]}><Cam pos={[3.3, 1.25, 5.75]} at={[3.5, 1.15, 7.0]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'asleep') { const p: Pose = { x: 2.2, y: -0.17, z: -3.85, yaw: 0, headPitch: -0.5, headTilt: 0.2, lid: 1, mouth: 0.6, legL: { hip: 1.4, knee: 1.4 }, legR: { hip: 1.4, knee: 1.4 }, armL: { sx: 0, sz: 0.4, el: 0.3 }, armR: { sx: 0, sz: 0.4, el: 0.3 } };
    return <PixelShot res={[216, 384]}><Cam pos={[2.6, 1.3, -1.6]} at={[2.3, 0.8, -3.8]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'wave') { const nio: Pose = { x: -0.5, z: -3.4, yaw: 0.1, smile: 0.9, lid: 0.2, armR: { sx: -0.2, sz: 2.5, el: 0.4 }, headTilt: 0.1 };
    const other: Pose = { x: -0.2, z: -1.6, yaw: Math.PI, smile: 0.8, armL: { sx: -0.2, sz: 2.4, el: 0.4 } };
    return <PixelShot res={[216, 384]}><Cam pos={[1.6, 1.5, 0.6]} at={[-0.4, 1.1, -2.6]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={nio} /><Character look={{ ...NIO, skin: '#efd2bf', skinShade: '#d1ae98', top: '#3f6f8f', topDark: '#3f6f8f', hair: '#c9a46a', hairDark: '#c9a46a', shape: 'round' }} p={other} /></Exterior></PixelShot>; }
  if (which === 'future') { const nio: Pose = { x: -0.25, z: 0, yaw: 0.15, smile: 1, lid: 0.15, browUp: 0.6, armR: { sx: -0.3, sz: 2.6, el: 0.3 }, armL: { sx: -0.3, sz: 2.4, el: 0.4 } };
    const maya: Pose = { x: 0.35, z: 0.05, yaw: -0.2, smile: 1, lid: 0.2, armL: { sx: -1.4, sz: 0.4, el: 1.7 }, headTilt: -0.12 };
    return <PixelShot res={[216, 384]}><Cam pos={[0.1, 1.4, 1.9]} at={[0.05, 1.15, 0]} fov={40} /><Rooftop>
      <Character look={NIO} p={nio} onHead={<Headphones color="#6ad5ff" />} /><Character look={MAYA} p={maya} onHead={<Headphones color="#ff6ad5" />} /></Rooftop></PixelShot>; }
  return null;
};
