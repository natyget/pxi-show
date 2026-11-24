// Demo: "Somebody got pics of me?" (Part 1). Four beats, four new shots, one room.
//  S1 wide: Nio on the edge of his bed, scrolling. The phone buzzes.
//  S2 insert: the real PXI push, crisp: "You might be in a photo". His thumb goes for it.
//  S3 close: he looks up slowly. "Hold up. Somebody got pics of me?" Eyes snap to the window: glitch beat.
//  S4 wide, new angle: he yanks the curtains shut, turns: "Nah. I'm good. I'm staying in." The phone on the bed buzzes again.
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub, LW, LH, SCALE } from './lib/Pixel';
import { Room } from './world/Room';
import { Character, NIO, Pose } from './world/Character';
import { Phone } from './world/Phone';
import { LockScreen } from './ui/LockScreen';
import { t12, sp, keys, blink, breathe, nz } from './lib/motion';
import { Solid, toon, sph, cap, plane, flat } from './lib/toon';
import audio from './audio.json';

type Line = { file: string; dur: number; env: number[] };
const A = audio as { lines: Record<string, Line>; sfx: Record<string, string> };

/** Mouth from the voice envelope (sampled at 12 fps), starting at `at` seconds. */
const mouthAt = (t: number, line: Line, at: number) => {
  const i = Math.floor((t - at) * 12);
  if (i < 0 || i >= line.env.length) return 0;
  return Math.min(1, line.env[i] * 1.6);
};

// Sitting on the bed edge (mattress top ~0.38).
const SIT: Pose = { x: -0.5, y: -0.17, z: 0.42, yaw: 0.35, legL: { hip: 1.35, knee: 1.3, spread: 0.08 }, legR: { hip: 1.35, knee: 1.3, spread: -0.04 } };
const HOLD = { sx: -0.65, sy: 0, sz: -0.2, el: 1.35 };
const PhoneInHand: React.FC<{ on?: number; buzz?: number }> = (p) => (
  <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone {...p} /></group>
);

// ---------------------------------------------------------------- S1
const S1_LEN = 66;
const S1: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const buzz = t > 1.6 && t < 2.3 ? nz(f, 1) : 0;
  const p: Pose = { ...SIT, breathe: breathe(t), headPitch: 0.42 - sp(t, 1.75, 'snap') * 0.08, headYaw: -0.1, eyeY: -1, eyeX: 0.2,
    lid: Math.max(blink(t, [0.9]), 0.35), brow: 0.15, armR: HOLD, armL: { sx: -0.5, sz: 0.25, el: 1.2 }, mouth: 0 };
  return (
    <PixelShot>
      <Cam pos={[0.5 + t * 0.015, 1.15, 2.2]} at={[-0.45, 0.62, 0.3]} fov={40} />
      <Room><Character look={NIO} p={p} handR={<PhoneInHand buzz={buzz} on={1} />} /></Room>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- S2: the insert
const S2_LEN = 60;
const S2: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const nin = sp(t, 0.25, 'pop');
  const buzz = t > 0.25 && t < 0.8 ? nz(f, 3) * 0.004 : 0;
  const reach = keys(t, [[0, 0], [1.35, 1, 'sheet']]);
  const press = t > 2.05 ? 1 : 0;
  const drift = Math.sin(t * 1.3) * 0.0015;
  const dx = buzz + drift;
  // phone faces the camera; the crisp screen is laid over the 3D screen exactly (see Lock below)
  const camZ = 0.3, visH = 2 * camZ * Math.tan((35 / 2) * Math.PI / 180), visW = visH * (LW / LH);
  const pxPerM = (LW * SCALE) / visW;
  return (
    <AbsoluteFill>
      <PixelShot bg="#2a2030">
        <Cam pos={[0, 0, camZ]} at={[0, 0, 0]} fov={35} />
        <ambientLight intensity={1.3} color="#9a8aa6" />
        <directionalLight position={[0.5, 1, 1]} intensity={1.2} color="#ffd9b0" />
        {/* blanket far behind, a fold line */}
        <mesh geometry={plane(3, 3)} position={[0, 0, -0.6]} material={toon('#d8ccb4')} />
        <Solid geo={cap(0.04, 1.2)} mat={toon('#c9bc9f')} position={[0.1, -0.15, -0.55]} rotation={[0, 0, 1.2]} line={0.01} />
        <group position={[dx, 0, 0]}>
          <Phone on={0} />
          {/* his hand: palm under the phone, fingers around the left edge, thumb reaching in from the right */}
          <Solid geo={sph(0.06)} mat={toon(NIO.skin)} position={[0.01, -0.105, -0.02]} scale={[1.3, 0.9, 0.7]} line={0.012} />
          {[0, 1, 2].map((i) => <Solid key={i} geo={cap(0.011, 0.02)} mat={toon(NIO.skin)} position={[-0.041, -0.02 - i * 0.026, 0.0]} rotation={[0, 0, 0.2]} line={0.01} />)}
          <group position={[0.05, -0.085, 0.012]} rotation={[0, 0, 0.75 - reach * 0.35]}>
            <Solid geo={cap(0.014, 0.045 + reach * 0.025)} mat={toon(NIO.skin)} position={[0, 0.035 + reach * 0.012, press * -0.002]} line={0.01} />
          </group>
        </group>
      </PixelShot>
      {/* crisp screen, exactly over the phone's screen plane (0.066 x 0.142 m) */}
      <div style={{ position: 'absolute', left: 540 + dx * pxPerM - (0.066 * pxPerM) / 2, top: 960 - (0.142 * pxPerM) / 2,
        width: 0.066 * pxPerM, height: 0.142 * pxPerM, overflow: 'hidden', borderRadius: 0.009 * pxPerM }}>
        <div style={{ transform: `scale(${(0.066 * pxPerM) / 390})`, transformOrigin: '0 0' }}>
          <LockScreen notifIn={nin} press={press} time="11:47" album="Night Market" />
        </div>
      </div>
      {/* the thumb in front of the screen (re-drawn in DOM, pixel-sized, so it sits over the crisp UI) */}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- S3: close-up, the look-up
const S3_LEN = 90;
const S3: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const L1 = A.lines.l1;
  const up = sp(t, 0.15, 'lazy');
  const snap = sp(t, 3.05, 'snap');
  const dart = t > 2.1 && t < 3.05 ? (Math.floor(t * 3) % 2 ? 0.7 : -0.6) : 0;
  const p: Pose = { ...SIT, breathe: breathe(t), headPitch: 0.4 - up * 0.44, headYaw: -0.1 + snap * 0.6 + dart * 0.12, headTilt: up * 0.06 - snap * 0.04,
    eyeX: dart * (1 - snap) + snap * 1, eyeY: -0.9 + up * 0.9,
    // suspicious, not shocked: lids narrow, brows pull in, one brow goes up on "somebody"
    lid: Math.max(blink(t, [1.6]), 0.3 * up - snap * 0.3), eyeOpen: 1 + snap * 0.08,
    brow: 0.55 * up - snap * 0.9, browR: sp(t, 1.05, 'snap') * 1.2 * (1 - snap), browUp: snap * 0.5,
    mouth: mouthAt(t, L1, 0.55) * 0.8, smirk: 0,
    armR: { ...HOLD, el: HOLD.el - up * 0.25 }, armL: { sx: -0.5, sz: 0.25, el: 1.2 } };
  const glitch = t >= 3.05 && t < 3.35 ? 0.6 + nz(f, 9) * 0.4 : 0;
  const words = t > 0.55 && t < 0.55 + L1.dur + 0.3;
  return (
    <AbsoluteFill>
      <PixelShot glitch={glitch}>
        <Cam pos={[-0.12 + Math.sin(t) * 0.004, 1.12, 1.6]} at={[-0.47, 1.0, 0.42]} fov={32} />
        <Room><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Room>
      </PixelShot>
      {words && <Sub text="hold up. somebody got pics of me?" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- S4: the curtains, the turn, the second buzz
const S4_LEN = 108;
const S4: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const L2 = A.lines.l2;
  const pull = sp(t, 0.2, 'snap');
  const turn = sp(t, 0.95, 'pop');
  const buzzAt = 3.35;
  const buzz = t > buzzAt && t < buzzAt + 0.7 ? nz(f, 5) : 0;
  const look = sp(t, buzzAt + 0.25, 'snap');
  const armsUp = 1 - sp(t, 0.85, 'sheet');
  const p: Pose = { x: 1.05, z: -0.85, yaw: -Math.PI + turn * (Math.PI - 0.7), breathe: breathe(t),
    armL: { sx: -2.3 * armsUp + 0, sz: 0.5 * armsUp + (1 - pull) * 0.5 * armsUp, el: 0.3 },
    armR: { sx: -2.3 * armsUp, sz: 0.5 * armsUp + (1 - pull) * 0.5 * armsUp, el: 0.3 },
    headYaw: look * -0.75, headPitch: look * 0.1, eyeX: look * -1, eyeY: look * -0.4, eyeOpen: 1 + look * 0.1, browUp: look * 0.6, brow: 0.2 - look * 0.6,
    // deadpan on the line, then the buzz pulls the lids up a little and the eyes slide over
    lid: Math.max(blink(t, [2.2]), 0.5 - look * 0.5), mouth: mouthAt(t, L2, 1.25) * 0.8, smirk: t > 2.2 && look < 0.2 ? 0.6 : 0 };
  const words = t > 1.25 && t < 1.25 + L2.dur + 0.3;
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[-1.15 + t * 0.012, 1.35, 2.15]} at={[0.45, 0.9, -0.6]} fov={44} />
        <Room curtain={0.15 + pull * 0.85}>
          <Character look={NIO} p={p} />
          {/* the phone, left on the bed, screen up */}
          <group position={[-0.25 + buzz * 0.008, 0.425, 0.25]} rotation={[-Math.PI / 2, 0, 0.3]}><Phone on={t > buzzAt ? 1 : 0} /></group>
        </Room>
      </PixelShot>
      {words && <Sub text="nah. i'm good. i'm staying in." />}
    </AbsoluteFill>
  );
};

export const DEMO_LEN = S1_LEN + S2_LEN + S3_LEN + S4_LEN + 18;

export const Demo: React.FC = () => (
  <AbsoluteFill style={{ background: '#151216' }}>
    <Fonts />
    <Sequence from={0} durationInFrames={S1_LEN}><S1 /></Sequence>
    <Sequence from={S1_LEN} durationInFrames={S2_LEN}><S2 /></Sequence>
    <Sequence from={S1_LEN + S2_LEN} durationInFrames={S3_LEN}><S3 /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + S3_LEN} durationInFrames={S4_LEN + 18}><S4 /></Sequence>
    {/* sound */}
    <Audio src={staticFile(A.sfx.room)} volume={0.35} />
    <Sequence from={Math.round(1.6 * 24)}><Audio src={staticFile(A.sfx.buzz)} /></Sequence>
    <Sequence from={S1_LEN + 6}><Audio src={staticFile(A.sfx.buzz)} volume={0.8} /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + Math.round(0.55 * 24)}><Audio src={staticFile(A.lines.l1.file)} /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + Math.round(3.05 * 24)}><Audio src={staticFile(A.sfx.glitch)} volume={0.7} /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + S3_LEN + Math.round(1.25 * 24)}><Audio src={staticFile(A.lines.l2.file)} /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + S3_LEN + Math.round(3.35 * 24)}><Audio src={staticFile(A.sfx.buzz)} /></Sequence>
    <Sequence from={S1_LEN + S2_LEN + S3_LEN + S4_LEN - 6}><Audio src={staticFile(A.sfx.sting)} volume={0.8} /></Sequence>
    {/* top band: Part 1 */}
    <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Pixelify', fontWeight: 700, fontSize: 64, color: '#efe6d2',
      textShadow: '0 6px 0 #151216, 5px 0 0 #151216, -5px 0 0 #151216, 0 -5px 0 #151216' }}>PART 1</div>
  </AbsoluteFill>
);
