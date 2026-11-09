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
import { Laundromat, BenchProps, Sock } from './world/Laundromat';
import { Exterior, SceneBg } from './world/Exterior';
import { Rooftop, Headphones } from './world/Rooftop';
import { Room } from './world/Room';
import { Character, NIO, MAYA, Look, Pose, headPos } from './world/Character';
import { Phone } from './world/Phone';
import { useEp1Screens } from './ui/Ep1Screens';
import { t12, sp, keys, blink, breathe, nz, walk } from './lib/motion';
import { Solid, toon, sph, cap, plane, rbox, cyl, useCanvasTex } from './lib/toon';
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
  pants: '#24232b', shoes: '#0f0e12', shape: 'long', hairStyle: 'bald', mustache: true, shades: true, suit: true, height: 1.12, build: 1.05,
};

// ---------------------------------------------------------------- staging (laundromat)
// Nio sits on the bench (seat top 0.44) facing the machines (-z). The sock guy sits facing his washer (x = 0.6).
const NIO_SIT: Pose = { x: -0.3, y: -0.15, z: 0.42, yaw: Math.PI, legL: { hip: 1.28, knee: 1.22, spread: 0.08 }, legR: { hip: 1.28, knee: 1.22, spread: -0.05 } };
const SOCK_SIT: Pose = { x: 1.8, y: -0.2 * 1.12, z: -1.55, yaw: Math.PI, legL: { hip: 1.35, knee: 1.35, spread: 0.1 }, legR: { hip: 1.35, knee: 1.35, spread: -0.1 },
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
    <Chair x={1.8} z={-1.55} />
    <Character look={SOCK} p={p ?? { ...SOCK_SIT, breathe: breathe(t * 0.4), headPitch: 0.12 }} />
  </>
);

// ---------------------------------------------------------------- phone inserts
const toScreen = (px: number, py: number, w: number, h: number): [number, number, number] =>
  [((px + w / 2) / 390) * 0.066 - 0.033, 0.071 - ((py + h / 2) / 844) * 0.142, 0.0058];
/**
 * Close-up of the phone in Nio's hand. The screen is a texture on the phone (pixel art like everything else).
 * The thumb rests on the frame edge, OFF the screen, and only travels in to tap: tap = [x, y] in screen px (390x844),
 * tapK 0 = resting, 1 = on the target. Hand skin = Nio's skin.
 */
const Insert: React.FC<{ screen?: any; tap?: [number, number]; tapK?: number; press?: number; buzz?: number; children?: React.ReactNode }> = ({ screen, tap = [195, 600], tapK = 0, press = 0, buzz = 0, children }) => {
  const base: [number, number] = [0.07, -0.115];
  const rest: [number, number] = [0.043, -0.06];
  const [tx, ty] = toScreen(tap[0], tap[1], 0, 0);
  const tip: [number, number] = [rest[0] + (tx - rest[0]) * tapK, rest[1] + (ty - rest[1]) * tapK];
  const dx = tip[0] - base[0], dy = tip[1] - base[1], len = Math.hypot(dx, dy);
  const ang = Math.atan2(-dx, dy);
  return (
    <PixelShot res={[216, 384]}>
      <SceneBg color="#cfd6cf" />
      <Cam pos={[0, -0.005, 0.25]} at={[0, -0.005, 0]} fov={38} />
      <ambientLight intensity={1.5} color="#eef4f4" />
      <directionalLight position={[0.5, 1, 1]} intensity={1.0} color="#ffffff" />
      <mesh geometry={plane(3, 3)} position={[0, 0, -0.6]} material={toon(NIO.pants)} />
      <Solid geo={cap(0.06, 1.2)} mat={toon(NIO.top)} position={[0.12, -0.22, -0.5]} rotation={[0, 0, 1.3]} line={0.012} />
      <group position={[buzz * 0.003, 0, 0]}>
        <Phone on={0} />
        {screen && <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0056]}><meshBasicMaterial map={screen} toneMapped={false} /></mesh>}
        {children}
        {/* palm under the phone, four fingers wrapped round the left edge, thumb */}
        <Solid geo={sph(0.06)} mat={toon(NIO.skin)} position={[0.012, -0.11, -0.02]} scale={[1.3, 0.85, 0.7]} line={0.012} />
        {[0, 1, 2, 3].map((i) => <Solid key={i} geo={cap(0.0095, 0.006)} mat={toon(NIO.skin)} position={[-0.046, -0.005 - i * 0.022, 0.002]} rotation={[0, 0, 1.45]} line={0.009} />)}
        <group position={[base[0] + dx / 2, base[1] + dy / 2, 0.012 - press * 0.003 + tapK * 0.004]} rotation={[0, 0, ang]}>
          <Solid geo={cap(0.014, Math.max(0.01, len - 0.028))} mat={toon(NIO.skin)} line={0.01} />
        </group>
      </group>
    </PixelShot>
  );
};

/** A push card sliding down over whatever is on screen. */
const Card: React.FC<{ tex: any; k: number }> = ({ tex, k }) => {
  const [x, y, z] = toScreen(10, 290, 370, 150);
  return k > 0.01 ? (
    <mesh geometry={plane(0.0626, 0.0254)} position={[x, y + (1 - k) * 0.02, z + 0.0003]}>
      <meshBasicMaterial map={tex} transparent opacity={Math.min(1, k * 1.5)} toneMapped={false} />
    </mesh>
  ) : null;
};

// ---------------------------------------------------------------- shots
// The way Gumball reacts (from the show's dialogue): no voice-over; he mutters out loud. A flat beat, a small dismissal,
// a scared quip, then panic once it's undeniable. Short lines. The face does the rest. Maya (Darwin-like) is sweet and
// literal, notices the obvious detail late, whispers when she's scared.
const REST_L = { sx: -0.35, sz: 0.12, el: 0.6 };                // left hand resting on his thigh
const nioSit = (t: number, extra: Pose): Pose => ({ ...NIO_SIT, breathe: breathe(t), armR: HOLD, armL: REST_L, ...extra });
const NIO_HEAD = headPos(NIO_SIT, NIO);
const say = (key: string, at: number, t: number) => mouthAt(t, key, at);

const S1: React.FC = () => {      // HOOK: one sock, spinning
  const t = t12(useCurrentFrame());
  return <PixelShot><Cam pos={[1.7, 0.62, -1.15]} at={[1.8, 0.5, -2.3]} fov={46} /><Laundromat t={t + 3} /></PixelShot>;
};

const S2: React.FC = () => {      // WIDE: Nio eats chips, half-watching the cooking show; phone in his other hand
  const t = t12(useCurrentFrame());
  const chip = (Math.sin(t * 3.2) + 1) / 2;
  const p = nioSit(t, { headYaw: -0.75, headPitch: -0.28, eyeX: -0.5, eyeY: 0.4, lid: Math.max(0.25, blink(t, [1.4])), smirk: 0.2,
    armL: { sx: -0.5 - chip * 0.9, sz: 0.2, el: 0.9 + chip * 1.0 }, mouth: chip > 0.85 ? 0.35 : 0, armR: { sx: -0.35, sz: 0.1, el: 0.8 } });
  return (
    <PixelShot>
      <Cam pos={[3.15 + t * 0.01, 1.45, -1.9]} at={[0.3, 0.85, -0.4]} fov={66} />
      <Laundromat t={t + 4}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={0} />} /><SockGuy t={t} /></Laundromat>
    </PixelShot>
  );
};

const S3: React.FC = () => {      // INSERT: the push
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  const buzz = t > 0.2 && t < 0.8 ? nz(f0, 2) : 0;
  return <Insert screen={s?.lock} buzz={buzz}>{s && <Card tex={s.card} k={sp(t, 0.25, 'pop')} />}</Insert>;
};

const S4: React.FC = () => {      // MCU: he reads it out, flat. "...Might?"
  const t = t12(useCurrentFrame());
  const p = nioSit(t, { headPitch: 0.4, eyeY: -0.9, lid: Math.max(blink(t, [0.9]), 0.25), brow: 0.15, browR: sp(t, 1.25) * 1.2, mouth: say('b_n1', 0.2, t), smirk: t > 1.25 ? 0.4 : 0 });
  const f = frame(NIO_HEAD, 'mcu', Math.PI, { up: 0.04 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Laundromat t={t + 6}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n1', 0.2) && <Sub text="you might be in a photo. ...might?" />}
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {      // INSERT: IS THIS YOU? — the back of his own head, on this bench, now
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return <Insert screen={t < 0.35 ? s?.lock : s?.review_behind} tap={[195, 365]} tapK={t < 0.35 ? 1 : Math.max(0, 1 - (t - 0.35) * 4)} press={t > 0.2 && t < 0.4 ? 1 : 0}>{s && t < 0.35 && <Card tex={s.card} k={1} />}</Insert>;
};

const S6: React.FC = () => {      // CU: a flat beat. "...That's my back." beat. "That's my back. Right now." Eyes go. Whip round.
  const t = t12(useCurrentFrame());
  const dawn = sp(t, 1.9, 'lazy');
  const whip = sp(t, 3.55, 'snap');
  const sq = t > 3.53 && t < 3.7 ? 0.1 : 0;
  const p = nioSit(t, { headPitch: 0.35 * (1 - whip), eyeY: -0.6 * (1 - whip), eyeX: whip * 0.9 + (t > 2.9 && t < 3.55 ? (Math.floor(t * 4) % 2 ? 0.5 : -0.5) : 0),
    lid: Math.max(0.3 * (1 - dawn), blink(t, [0.4])), wide: dawn * 0.35 + whip * 0.2, browUp: dawn * 0.8, brow: -0.2 * dawn,
    mouth: Math.max(say('b_n2', 0.55, t), say('b_n3', 1.9, t)), twist: whip * 0.55, headYaw: whip * 1.0, squash: sq, sweat: sp(t, 2.8) });
  const fr = frame(NIO_HEAD, 'cu', Math.PI, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 9}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n2', 0.55) && <Sub text="...that's my back." />}
      {saying(t, 'b_n3', 1.9) && <Sub text="that's my back. right now." />}
    </AbsoluteFill>
  );
};

const S7: React.FC = () => {      // POV: over his shoulder, the dark front window. Nobody. A streetlight.
  const t = t12(useCurrentFrame());
  return <PixelShot><Cam pos={[-0.45, 1.15, 0.78]} at={[-0.9, 1.4, 3.0]} fov={62} /><Laundromat t={t + 11} /></PixelShot>;
};

const S8: React.FC = () => {      // CU: talking himself down, too fast. "Okay. Okay okay. That's fine."
  const t = t12(useCurrentFrame());
  const nod = Math.sin(t * 14) * 0.06 * (t < 2.4 ? 1 : 0);
  const p = nioSit(t, { headPitch: 0.25 + nod, eyeY: -0.5, eyeX: Math.sin(t * 5) * 0.3, wide: 0.25, brow: -0.45, browUp: 0.5, sweat: 1, smile: 0.3, mouth: say('b_n4', 0.1, t) });
  const fr = frame(NIO_HEAD, 'cu', Math.PI - 0.15, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 13}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n4', 0.1) && <Sub text="okay. okay okay. that's fine." />}
    </AbsoluteFill>
  );
};

const S9: React.FC = () => {      // INSERT: the album fills up. Shutter on each. Then, flat: "...This is a whole album."
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  const slots: [number, number][] = [[20, 190], [200, 190], [20, 425], [200, 425]];
  return (
    <AbsoluteFill>
      <Insert screen={s?.album}>
        {s && slots.map(([px, py], i) => {
          const k = sp(t, 0.3 + i * 0.55, 'pop'); const [x, y, z] = toScreen(px, py, 170, 220);
          return k > 0.01 ? <mesh key={i} geometry={plane(0.0288, 0.037)} position={[x, y, z + 0.0003]} scale={0.6 + 0.4 * k}><meshBasicMaterial map={s[`thumb${i}`]} transparent opacity={Math.min(1, k * 1.4)} toneMapped={false} /></mesh> : null;
        })}
      </Insert>
      {saying(t, 'b_n5', 2.6) && <Sub text="...this is a whole album." />}
    </AbsoluteFill>
  );
};

const S10: React.FC = () => {     // CU: he dials, narrating his own calm. "Okay. Calling the cops. Normal thing. Normal person thing."
  const t = t12(useCurrentFrame());
  const tap = (Math.floor(t * 3) % 2) * 0.1;
  const p = nioSit(t, { headPitch: 0.35, eyeY: -0.8, lid: 0.15, wide: 0.2, brow: 0.35, smile: 0.2, sweat: 1, mouth: say('b_n6', 0.2, t), armR: { ...HOLD, el: HOLD.el + tap } });
  const fr = frame(NIO_HEAD, 'cu', Math.PI + 0.2, { up: 0.03 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 16}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n6', 0.2) && <Sub text="okay. calling the cops. normal thing. normal person thing." />}
    </AbsoluteFill>
  );
};

const S11: React.FC = () => {     // INSERT: 9... 1... and a new photo drops in
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  const tap = t < 0.9 ? (Math.floor(t * 4) % 2) : 0;
  return <Insert screen={s?.dial} tap={t < 0.45 ? [295, 510] : [95, 300]} tapK={t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) * 5)} press={tap} buzz={t > 1.0 && t < 1.5 ? nz(f0, 4) : 0}>{s && <Card tex={s.card} k={sp(t, 1.0, 'pop')} />}</Insert>;
};

const S12: React.FC = () => {     // INSERT: the photo — him and Maya on a roof. SAT NOV 14.
  const s = useEp1Screens();
  return <Insert screen={s?.review_future} />;
};

const S13: React.FC = () => {     // ECU: his face drops as he reads the date. "...It's Wednesday." Then the world tilts.
  const f0 = useCurrentFrame(), t = t12(f0);
  const drop = sp(t, 0.15, 'lazy'), C = 2.25, click = sp(t, C, 'pop');
  const p = nioSit(t, { headPitch: 0.32 - drop * 0.12, eyeY: -0.8 + drop * 0.5, lid: 0, wide: drop * 0.55 + click * 0.45, browUp: drop * 0.9 + click * 0.3, brow: -0.5 * drop,
    mouth: t > C ? 0.35 + Math.abs(Math.sin(t * 28)) * 0.15 : Math.max(drop * 0.15, say('b_n7', 1.0, t)), sweat: 1, squash: t > C && t < C + 0.2 ? 0.08 : 0 });
  const fr = frame(NIO_HEAD, 'cu', Math.PI, { up: 0.0, eyeAt: 0.42 });
  const glitch = t > C && t < C + 0.7 ? 0.7 + nz(f0, 3) * 0.3 : 0;
  return (
    <AbsoluteFill>
      <PixelShot glitch={glitch}><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 22}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n7', 1.0) && <Sub text="...it's wednesday." />}
    </AbsoluteFill>
  );
};

const S14: React.FC = () => {     // INSERT: he sends Maya the photo, then calls her
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  return <Insert screen={t < 1.1 ? s?.sent : s?.calling} tap={t < 1.1 ? [285, 570] : [195, 730]} tapK={t > 0.75 && t < 1.05 ? 1 : 0} />;
};

// ---- the call: split screen. Nio on top (laundromat), Maya below (her room). Each is framed from their phone.
const MAYA_SIT: Pose = { x: -0.5, y: -0.12, z: 0.42, yaw: 0.35, legL: { hip: 1.35, knee: 1.3, spread: 0.08 }, legR: { hip: 1.35, knee: 1.3, spread: -0.04 } };
const MAYA_HEAD = headPos(MAYA_SIT, MAYA);
const Half: React.FC<{ top: boolean; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: top ? 0 : 960, height: 960, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: -480, width: 1080, height: 1920 }}>{children}</div>
  </div>
);
const Call: React.FC<{ nio: Pose; maya: Pose; t: number; subs?: React.ReactNode }> = ({ nio, maya, t, subs }) => {
  const fn = frame(NIO_HEAD, 'ms', Math.PI, { up: -0.05, eyeAt: 0.42 });
  const fm = frame(MAYA_HEAD, 'ms', 0.35, { up: -0.05, eyeAt: 0.5 });
  return (
    <AbsoluteFill style={{ background: '#0b0a0d' }}>
      <Half top><PixelShot><Cam pos={fn.pos} at={fn.at} fov={fn.fov} /><Laundromat t={t + 30}><BenchProps /><Character look={NIO} p={{ ...NIO_SIT, ...nio, armR: REST_L, armL: REST_L }} /></Laundromat></PixelShot></Half>
      <Half top={false}><PixelShot><Cam pos={fm.pos} at={fm.at} fov={fm.fov} /><Room><Character look={MAYA} p={{ ...MAYA_SIT, ...maya, armR: REST_L, armL: REST_L }} /></Room></PixelShot></Half>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 954, height: 12, background: '#0b0a0d' }} />
      {subs}
    </AbsoluteFill>
  );
};

const S15: React.FC = () => {     // CALL: Maya picks up, delighted, then not. "Ooh, is that us? ...Wait. When did we go to a roof?"
  const t = t12(useCurrentFrame());
  const turn = sp(t, 1.6, 'sheet');
  const nio: Pose = { breathe: breathe(t), armR: HOLD, armL: REST_L, headPitch: 0.1, lid: 0.1, wide: 0.5, browUp: 0.8, brow: -0.4, sweat: 1, eyeY: -0.3 };
  const maya: Pose = { breathe: breathe(t + 1), armR: HOLD, armL: REST_L, headPitch: 0.15, headTilt: 0.1 * (1 - turn), eyeY: -0.6, lid: 0.15,
    smile: 1 - turn * 1.3, browUp: 0.4 + turn * 0.6, brow: -0.5 * turn, mouth: say('b_m1', 0.3, t) };
  return <Call t={t} nio={nio} maya={maya} subs={saying(t, 'b_m1', 0.3) && <Sub text="maya: ooh, is that us? ...wait. when did we go to a roof?" y={1640} size={62} />} />;
};

const S16: React.FC = () => {     // CALL: "We didn't. That's Saturday." / "...But it's Wednesday." / "I KNOW it's Wednesday!"
  const t = t12(useCurrentFrame());
  const yell = sp(t, 3.15, 'pop');
  const nio: Pose = { breathe: breathe(t), armR: HOLD, armL: REST_L, headPitch: 0.1 - yell * 0.1, lid: 0.05, wide: 0.5 + yell * 0.4, browUp: 0.8 + yell * 0.4, brow: -0.4 - yell * 0.3, sweat: 1,
    mouth: Math.max(say('b_n8', 0.1, t), say('b_n9', 3.15, t)), squash: t > 3.15 && t < 3.35 ? 0.1 : 0 };
  const maya: Pose = { breathe: breathe(t + 1), armR: HOLD, armL: REST_L, headPitch: 0.15, eyeY: -0.5, lid: 0.05, wide: 0.3, browUp: 1.0, brow: -0.7, mouth: say('b_m2', 1.6, t),
    squash: t > 3.2 && t < 3.4 ? -0.06 : 0 };
  return <Call t={t} nio={nio} maya={maya} subs={<>
    {saying(t, 'b_n8', 0.1) && <Sub text="we didn't. that's saturday." y={780} size={62} />}
    {saying(t, 'b_m2', 1.6) && <Sub text="maya: ...but it's wednesday." y={1700} size={62} />}
    {saying(t, 'b_n9', 3.15) && <Sub text="i KNOW it's wednesday!" y={780} size={62} />}
  </>} />;
};

const S17: React.FC = () => {     // CALL: Maya, small: "Nio... who took it?" He goes very still.
  const t = t12(useCurrentFrame());
  const still = sp(t, 1.5, 'lazy');
  const nio: Pose = { armR: HOLD, armL: REST_L, headPitch: 0.1, lid: 0, wide: 0.6 + still * 0.3, browUp: 1, brow: -0.6, sweat: 1, eyeX: still * 0.6 };
  const maya: Pose = { breathe: breathe(t + 1) * 0.3, armR: HOLD, armL: REST_L, headPitch: 0.2, eyeY: -0.6, lid: 0, wide: 0.5, browUp: 0.8, brow: -0.8, mouth: say('b_m3', 0.4, t) * 0.7, lean: 0.06 };
  return <Call t={t} nio={nio} maya={maya} subs={saying(t, 'b_m3', 0.4) && <Sub text="maya: nio... who took it?" y={1700} size={62} />} />;
};

const S18: React.FC = () => {     // CU: "Nope." Thumb already moving.
  const t = t12(useCurrentFrame());
  const p = nioSit(t, { headPitch: 0.35, eyeY: -0.8, lid: 0.2, brow: 0.8, smile: -0.4, mouth: say('b_n10', 0.25, t), sweat: 1 });
  const fr = frame(NIO_HEAD, 'cu', Math.PI, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 36}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n10', 0.25) && <Sub text="nope." />}
    </AbsoluteFill>
  );
};

const S19: React.FC = () => {     // INSERT: delete the app
  const t = t12(useCurrentFrame()); const s = useEp1Screens();
  const scr = t < 0.3 ? s?.home : t < 1.35 ? s?.home_alert : s?.home_gone;
  return <Insert screen={scr} tap={t < 0.3 ? [100, 125] : [268, 515]} tapK={t < 0.3 ? 1 : keys(t, [[0.3, 0], [0.95, 1, 'snap'], [1.5, 0, 'sheet']])} press={t > 1.15 && t < 1.35 ? 1 : 0} />;
};

const S20: React.FC = () => {     // MCU: relief. "...Okay." Shoulders drop. Then the buzz. He freezes.
  const t = t12(useCurrentFrame());
  const relief = sp(t, 0.1, 'lazy'), freeze = sp(t, 1.35, 'snap');
  const p = nioSit(t, { breathe: breathe(t) * (1 - freeze), headPitch: 0.3 - relief * 0.25 + freeze * 0.2, lid: freeze > 0.5 ? 0 : 0.55 * relief, smile: relief * 0.6 * (1 - freeze),
    wide: freeze * 0.6, browUp: freeze, eyeY: -freeze * 0.8, lean: -relief * 0.04, mouth: say('b_n11', 0.2, t) });
  const fr = frame(NIO_HEAD, 'mcu', Math.PI - 0.1, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 38}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} buzz={t > 1.35 && t < 1.9 ? 1 : 0} />} /></Laundromat></PixelShot>
      {saying(t, 'b_n11', 0.2) && <Sub text="...okay." />}
    </AbsoluteFill>
  );
};

const S21: React.FC = () => {     // INSERT: the app is gone. The push comes anyway.
  const f0 = useCurrentFrame(), t = t12(f0); const s = useEp1Screens();
  return <Insert screen={s?.home_gone} buzz={t < 0.5 ? nz(f0, 6) : 0}>{s && <Card tex={s.card} k={sp(t, 0.1, 'pop')} />}</Insert>;
};

const S22: React.FC = () => {     // INSERT: IS THIS YOU? — him, from behind, deleting the app
  const s = useEp1Screens();
  return <Insert screen={s?.review_deleting} />;
};

const S23: React.FC = () => {     // CU: a slow, slow look back over his left shoulder
  const t = t12(useCurrentFrame());
  const turn = sp(t, 0.2, 'lazy');
  const p = nioSit(t, { twist: turn * 0.5, headYaw: turn * 1.05, eyeX: turn * 0.9, wide: 0.5, lid: 0, browUp: 0.8, brow: -0.4, sweat: 1, mouth: 0.15 });
  const fr = frame(NIO_HEAD, 'cu', -1.25, { up: 0.02 });
  return <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><Laundromat t={t + 41}><BenchProps /><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Laundromat></PixelShot>;
};

// The sock guy, standing just behind the bench on Nio's left, holds the sock out to him.
const SOCK_STAND: Pose = { x: -1.25, z: 1.05, yaw: 2.2 };
const S24: React.FC = () => {     // MS: he holds the sock out. "...It's clean."
  const t = t12(useCurrentFrame());
  const offer = sp(t, 0.15, 'sheet');
  const sock: Pose = { ...SOCK_STAND, breathe: breathe(t * 0.3), armR: { sx: -0.35 - offer * 0.45, sz: -0.25, el: 0.6 + offer * 0.9 }, headPitch: 0.12, mouth: mouthAt(t, 'e1_w1', 0.75) };
  const fr = frame(headPos(sock, SOCK), 'ms', 2.2, { up: -0.15, fov: 50, eyeAt: 0.36 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={fr.pos} at={fr.at} fov={fr.fov} />
        <Laundromat t={t + 43}><Character look={SOCK} p={sock} handR={<group position={[0, -0.02, 0.02]} rotation={[Math.PI / 2 + 0.6, 0, 0]}><Sock scale={0.85} /></group>} /></Laundromat></PixelShot>
      {saying(t, 'e1_w1', 0.75) && <Sub text="...it's clean." />}
    </AbsoluteFill>
  );
};

const S25: React.FC = () => <AbsoluteFill style={{ background: '#0b0a0d' }} />;

// ---------------------------------------------------------------- the cut
const SHOTS: [React.FC, number][] = [
  [S1, 22], [S2, 40], [S3, 40], [S4, 53], [S5, 46], [S6, 92], [S7, 28], [S8, 60], [S9, 100], [S10, 94], [S11, 46],
  [S12, 36], [S13, 66], [S14, 50], [S15, 92], [S16, 142], [S17, 54], [S18, 26], [S19, 44], [S20, 52], [S21, 32],
  [S22, 38], [S23, 46], [S24, 54], [S25, 30],
];
const START = SHOTS.reduce<number[]>((a, [, d], i) => (a.push(i ? a[i - 1] + SHOTS[i - 1][1] : 0), a), []);
export const EP1_LEN = START[START.length - 1] + SHOTS[SHOTS.length - 1][1];
export const EP1_STARTS = START;
const END = SHOTS.length - 1;
const at = (shot: number, s: number) => START[shot] + Math.round(s * 24);

const VO: [string, number, number, number?][] = [
  ['e1_tv', 0, 0.05, 0.55], ['b_n1', 3, 0.2], ['b_n2', 5, 0.55], ['b_n3', 5, 1.9], ['b_n4', 7, 0.1], ['b_n5', 8, 2.6], ['b_n6', 9, 0.2],
  ['b_n7', 12, 1.0], ['b_m1', 14, 0.3], ['b_n8', 15, 0.1], ['b_m2', 15, 1.6], ['b_n9', 15, 3.15], ['b_m3', 16, 0.4], ['b_n10', 17, 0.25],
  ['b_n11', 19, 0.2], ['e1_w1', 23, 0.75],
];
const SFX: [string, number, number, number][] = [
  ['buzz', 2, 0.2, 0.9], ['sting', 4, 0.4, 0.6], ['shutter', 8, 0.3, 0.8], ['shutter', 8, 0.85, 0.8], ['shutter', 8, 1.4, 0.8], ['shutter', 8, 1.95, 0.8],
  ['buzz', 10, 1.0, 0.9], ['sting', 11, 0.05, 0.7], ['glitch', 12, 2.25, 0.8], ['drop', 12, 2.25, 0.7], ['poof', 18, 1.3, 0.8],
  ['buzz', 19, 1.35, 1], ['buzz', 20, 0.1, 0.8], ['sting', 21, 0.2, 0.8], ['sting', 24, 0.0, 1],
];

export const Ep1: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {SHOTS.map(([C, d], i) => <Sequence key={i} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    {/* the laundromat hums the whole time, and drops away for the black at the end */}
    <Sequence from={0} durationInFrames={START[END]}><Audio src={staticFile(A.sfx.laundromat)} volume={0.55} /></Sequence>
    {VO.map(([k, s, o, v], i) => <Sequence key={i} from={at(s, o)}><Audio src={staticFile(A.lines[k].file)} volume={v ?? 1} /></Sequence>)}
    {SFX.map(([k, s, o, v], i) => <Sequence key={`s${i}`} from={at(s, o)}><Audio src={staticFile(A.sfx[k])} volume={v} /></Sequence>)}
    {[[0, START[14]], [START[17], START[END]]].map(([a, b]) => <Sequence key={a} from={a} durationInFrames={b - a}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 52, color: '#efe6d2', background: 'rgba(21,18,22,0.78)', padding: '6px 26px 10px', borderRadius: 40 }}>PART 1</div>
      </div>
    </Sequence>)}
    <Sequence from={START[END]}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 96, color: '#efe6d2' }}>PART 2 SOON</div></AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

/** A phone showing the 'Delete "PXI"?' alert, readable from over his shoulder. */
const AlertPhone: React.FC = () => {
  const tx = useCanvasTex(40, 86, (c) => {
    c.fillStyle = '#26285a'; c.fillRect(0, 0, 40, 86);
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, 40, 86);
    c.fillStyle = '#4a4a56'; c.fillRect(2, 22, 36, 40);
    c.fillStyle = '#ffffff'; c.fillRect(6, 27, 28, 5); c.fillRect(8, 36, 24, 3);
    c.fillStyle = '#7ab8ff'; c.fillRect(4, 48, 14, 9); c.fillStyle = '#ff3b30'; c.fillRect(22, 48, 14, 9);
  });
  return (
    <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}>
      <Phone on={0} />
      <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0056]}><meshBasicMaterial map={tx} toneMapped={false} /></mesh>
    </group>
  );
};

/** In-show photos (rendered to public/photos/e1_*.png first). */
export const Ep1Photo: React.FC<{ which: string }> = ({ which }) => {
  const phoneUp = { sx: -1.0, sz: -0.4, el: 1.7 };
  if (which === 'behind') return (
    <PixelShot res={[216, 384]}><Cam pos={[-0.1, 1.95, 2.5]} at={[-0.3, 0.7, 0.1]} fov={44} />
      <Laundromat t={2}><BenchProps /><Character look={NIO} p={nioSit(0, { headPitch: 0.3 })} handR={<PhoneInHand on={1} />} /><SockGuy t={0} /></Laundromat></PixelShot>);
  if (which === 'deleting') return (
    <PixelShot res={[216, 384]}><Cam pos={[-0.5, 1.72, 0.95]} at={[-0.28, 0.82, 0.05]} fov={46} />
      <Laundromat t={5}><BenchProps /><Character look={NIO} p={nioSit(0, { headPitch: 0.45, armR: { sx: -0.85, sz: -0.3, el: 1.55 } })} handR={<group scale={1.5}><AlertPhone /></group>} /></Laundromat></PixelShot>);
  if (which === 'sneeze') { const p: Pose = { x: 4.2, z: -3.4, yaw: 0.2, sneeze: 1, headPitch: 0.35, squash: -0.05, lean: 0.12, armL: { sx: -1.4, sz: 0.3, el: 1.9 } };
    const f = frame(headPos(p, NIO), 'ms', 0.3); return <PixelShot res={[216, 384]}><Cam pos={f.pos} at={f.at} fov={f.fov} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'candle') { const p: Pose = { x: 3.5, z: 7.0, yaw: Math.PI, lean: 0.45, lid: 1, smile: 0.7, headPitch: 0.3, armR: { sx: -1.2, sz: -0.3, el: 1.2 } };
    return <PixelShot res={[216, 384]}><Cam pos={[3.3, 1.25, 5.75]} at={[3.5, 1.15, 7.0]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'asleep') { const p: Pose = { x: 2.2, y: -0.09, z: -3.9, yaw: 0, headPitch: -0.45, headTilt: 0.2, lid: 1, mouth: 0.6, legL: { hip: 1.3, knee: 1.25 }, legR: { hip: 1.3, knee: 1.25 }, armL: { sx: 0, sz: 0.4, el: 0.3 }, armR: { sx: 0, sz: 0.4, el: 0.3 } };
    return <PixelShot res={[216, 384]}><Cam pos={[2.6, 1.3, -1.6]} at={[2.3, 0.8, -3.8]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={p} /></Exterior></PixelShot>; }
  if (which === 'wave') { const nio: Pose = { x: -0.5, z: -3.4, yaw: 0.1, smile: 0.9, lid: 0.2, armR: { sx: -0.2, sz: 2.5, el: 0.4 }, headTilt: 0.1 };
    const other: Pose = { x: -0.2, z: -1.6, yaw: Math.PI, smile: 0.8, armL: { sx: -0.2, sz: 2.4, el: 0.4 } };
    return <PixelShot res={[216, 384]}><Cam pos={[1.6, 1.5, 0.6]} at={[-0.4, 1.1, -2.6]} fov={44} /><Exterior curtain={1}><Character look={NIO} p={nio} /><Character look={{ ...NIO, skin: '#efd2bf', skinShade: '#d1ae98', top: '#3f6f8f', topDark: '#3f6f8f', hair: '#c9a46a', hairDark: '#c9a46a', shape: 'round' }} p={other} /></Exterior></PixelShot>; }
  if (which === 'future') { const nio: Pose = { x: -0.25, z: 0, yaw: 0.15, smile: 1, lid: 0.15, browUp: 0.6, armR: { sx: -0.3, sz: 2.6, el: 0.3 }, armL: { sx: -0.3, sz: 2.4, el: 0.4 } };
    const maya: Pose = { x: 0.35, z: 0.05, yaw: -0.2, smile: 1, lid: 0.2, armL: { sx: -0.2, sz: 0.25, el: 0.4 }, armR: { sx: -0.2, sz: 0.25, el: 0.4 }, headTilt: -0.15 };
    return <PixelShot res={[216, 384]}><Cam pos={[0.05, 1.2, 2.5]} at={[0.05, 1.55, 0]} fov={46} /><Rooftop>
      <Character look={NIO} p={nio} onHead={<Headphones color="#6ad5ff" />} /><Character look={MAYA} p={maya} onHead={<Headphones color="#ff6ad5" />} /></Rooftop></PixelShot>; }
  return null;
};
