// PILOT: "The Window"
// Nio gets "You might be in a photo". It's a picture of his own window, taken from a night market across the street
// that he has somehow never noticed. He goes down. The person who took it is Maya. Home -> out -> home.
// Every beat is its own shot; one bedroom set, one street set, one market set, all reused as places (never as shots).
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { Room } from './world/Room';
import { Exterior, EXTRAS, NIO_WIN, SceneBg } from './world/Exterior';
import { Character, NIO, MAYA, Look, Pose } from './world/Character';
import { Phone } from './world/Phone';
import { useLockScreen } from './ui/PixelScreen';
import { useFaceReview, useAlbum, ALBUM_SLOTS, SCREEN_W, SCREEN_H } from './ui/Screens';
import { t12, sp, keys, blink, breathe, nz, walk } from './lib/motion';
import { Solid, toon, sph, cap, plane, flat } from './lib/toon';
import audio from './audio.json';

type Line = { file: string; dur: number; env: number[] };
const A = audio as { lines: Record<string, Line>; sfx: Record<string, string> };
const mouthAt = (t: number, key: string, at: number) => {
  const l = A.lines[key]; const i = Math.floor((t - at) * 12);
  return i < 0 || i >= l.env.length ? 0 : Math.min(1, l.env[i] * 1.4);
};
const saying = (t: number, key: string, at: number) => t > at && t < at + A.lines[key].dur + 0.25;

const WEIRD: Look = { skin: '#d9b8a0', hair: '#1a1414', top: '#2b2a33', topDark: '#1f1e26', pants: '#2b2a33', shoes: '#111014', hairStyle: 'nio', shades: true, height: 1.12 };

// ---------------------------------------------------------------- shared bits
const SIT: Pose = { x: -0.5, y: -0.17, z: 0.42, yaw: 0.35, legL: { hip: 1.35, knee: 1.3, spread: 0.08 }, legR: { hip: 1.35, knee: 1.3, spread: -0.04 } };
const HOLD = { sx: -0.65, sy: 0, sz: -0.2, el: 1.35 };
const PhoneInHand: React.FC<{ on?: number; buzz?: number }> = (p) => (
  <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone {...p} /></group>
);
const toScreen = (px: number, py: number, w: number, h: number): [number, number, number] =>
  [((px + w / 2) / SCREEN_W) * 0.066 - 0.033, 0.071 - ((py + h / 2) / SCREEN_H) * 0.142, 0.0058];

/** Close-up of the phone in Nio's hand. The screen is a texture on the phone, so it is pixel art like everything else. */
const InsertPhone: React.FC<{ screen: any; children?: React.ReactNode; reach: number; press: number }> = ({ screen, children, reach, press }) => (
  <PixelShot bg="#2a2030" res={[216, 384]}>
    <Cam pos={[0, -0.005, 0.25]} at={[0, -0.005, 0]} fov={38} />
    <SceneBg color="#3a3040" />
    <ambientLight intensity={1.3} color="#9a8aa6" />
    <directionalLight position={[0.5, 1, 1]} intensity={1.2} color="#ffd9b0" />
    <mesh geometry={plane(3, 3)} position={[0, 0, -0.6]} material={toon('#d8ccb4')} />
    <Solid geo={cap(0.04, 1.2)} mat={toon('#c9bc9f')} position={[0.1, -0.15, -0.55]} rotation={[0, 0, 1.2]} line={0.01} />
    <group>
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

// ---------------------------------------------------------------- 1. bed, buzz
const S1: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const buzz = t > 1.6 && t < 2.3 ? nz(f, 1) : 0;
  const p: Pose = { ...SIT, breathe: breathe(t), headPitch: 0.42 - sp(t, 1.75) * 0.1, headYaw: -0.1, eyeY: -1, eyeX: 0.2,
    lid: Math.max(blink(t, [0.9]), 0.35), brow: 0.15, armR: HOLD, armL: { sx: -0.5, sz: 0.25, el: 1.2 } };
  return (
    <PixelShot>
      <Cam pos={[0.5 + t * 0.015, 1.15, 2.2]} at={[-0.45, 0.62, 0.3]} fov={40} />
      <Room><Character look={NIO} p={p} handR={<PhoneInHand buzz={buzz} on={1} />} /></Room>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 2. the push
const S2: React.FC = () => {
  const t = t12(useCurrentFrame());
  const ls = useLockScreen('11:47', 'Night Market');
  const nin = sp(t, 0.25, 'pop');
  const [x, y, z] = toScreen(10, 440, 370, 150);
  return (
    <InsertPhone screen={ls?.screen} reach={keys(t, [[0, 0], [1.4, 0.8, 'sheet']])} press={0}>
      {ls && <mesh geometry={plane(0.0626, 0.0254)} position={[x, y + (1 - nin) * 0.01, z + 0.0002]} scale={0.92 + 0.08 * nin}>
        <meshBasicMaterial map={ls.card} transparent opacity={Math.min(1, nin * 1.5)} toneMapped={false} />
      </mesh>}
    </InsertPhone>
  );
};

// ---------------------------------------------------------------- 3. "hold up"
const S3: React.FC = () => {
  const f = useCurrentFrame(), t = t12(f);
  const up = sp(t, 0.15, 'lazy');
  const dart = t > 2.1 && t < 2.9 ? (Math.floor(t * 3) % 2 ? 0.6 : -0.5) : 0;
  const snap = sp(t, 2.95, 'snap');
  const p: Pose = { ...SIT, breathe: breathe(t), headPitch: 0.4 - up * 0.44, headYaw: -0.1 + snap * 0.6 + dart * 0.15, headTilt: up * 0.06,
    eyeX: dart * (1 - snap) + snap * 0.6, eyeY: -0.9 + up * 0.9, lid: Math.max(blink(t, [1.7]), 0.3 * up - snap * 0.3),
    brow: 0.55 * up - snap * 0.9, browR: sp(t, 1.05) * 1.2 * (1 - snap), browUp: snap * 0.5, mouth: mouthAt(t, 'l1', 0.45) * 0.8,
    armR: { ...HOLD, el: HOLD.el - up * 0.25 }, armL: { sx: -0.5, sz: 0.25, el: 1.2 } };
  const glitch = t >= 2.95 && t < 3.25 ? 0.6 + nz(f, 9) * 0.4 : 0;
  return (
    <AbsoluteFill>
      <PixelShot glitch={glitch}>
        <Cam pos={[-0.12, 1.12, 1.6]} at={[-0.47, 1.0, 0.42]} fov={32} />
        <Room><Character look={NIO} p={p} handR={<PhoneInHand on={1} />} /></Room>
      </PixelShot>
      {saying(t, 'l1', 0.45) && <Sub text="hold up. somebody got pics of me?" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4. IS THIS YOU?
const S4: React.FC = () => {
  const t = t12(useCurrentFrame());
  const fr = useFaceReview('photos/window.png', [0.5, 0.33, 0.13]);
  return (
    <AbsoluteFill>
      <InsertPhone screen={fr} reach={keys(t, [[0, 0.3], [1.6, 0.9, 'sheet']])} press={0} />
      {saying(t, 'p_window', 0.9) && <Sub text="that's... my window." />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5. to the window, curtains open
const S5: React.FC = () => {
  const t = t12(useCurrentFrame());
  const go = sp(t, 0.1, 'sheet');
  const w = walk(t, 1.9, (1 - sp(t, 1.5, 'snap')) * 0.9);
  const open = sp(t, 1.9, 'snap');
  const p: Pose = { x: -0.2 + go * 1.15, z: 0.2 - go * 1.05, yaw: Math.PI - 0.15, y: w.bob, legL: w.legL, legR: w.legR,
    armL: open > 0.02 ? { sx: -1.6 + open * 0.3, sz: 0.4 + open * 0.6, el: 0.3 } : w.armL,
    armR: open > 0.02 ? { sx: -1.6 + open * 0.3, sz: 0.4 + open * 0.6, el: 0.3 } : w.armR, twist: w.twist };
  return (
    <PixelShot>
      <Cam pos={[-0.6, 1.5, 2.3]} at={[0.9, 1.2, -1.2]} fov={42} />
      <Room curtain={1 - open}><Character look={NIO} p={p} /></Room>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 6. at the window, from outside: the market lights his face
const S6: React.FC = () => {
  const t = t12(useCurrentFrame());
  const lean = sp(t, 0.1, 'lazy');
  const pose: Pose = { yaw: 0, lean: lean * 0.12, headPitch: 0.35, headTilt: 0.05, eyeY: -0.7, eyeOpen: 1.08, brow: -0.4, browUp: 0.7 * lean,
    lid: blink(t, [1.9]), mouth: mouthAt(t, 'p_market', 0.35) * 0.8, armL: { sx: -0.6, sz: 0.2, el: 0.9 }, armR: { sx: -0.6, sz: 0.2, el: 0.9 } };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[NIO_WIN.x + 0.15, NIO_WIN.y - 0.25, -2.5]} at={[NIO_WIN.x, NIO_WIN.y + 0.15, -4.8]} fov={34} />
        <Exterior curtain={0} nioInWindow={{ look: NIO, pose }} />
      </PixelShot>
      {saying(t, 'p_market', 0.35) && <Sub text="hold on. there's a whole market down there?" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- crowd
const Crowd: React.FC<{ t: number; skip?: number[] }> = ({ t, skip = [] }) => (
  <>
    {[[-6.5, 8.6, 1.57, 0], [-4.2, 8.2, -1.2, 1], [-0.2, 8.9, 3.0, 2], [1.8, 8.3, 0.2, 3], [4.4, 8.8, -2.6, 4], [6.0, 8.0, 1.2, 5], [-3.0, 9.4, 2.4, 0], [2.6, 9.6, -0.6, 2]].map(([x, z, yaw, k], i) => {
      if (skip.includes(i)) return null;
      const walking = i % 3 === 0;
      const w = walk(t + i * 0.37, 1.7, walking ? 0.8 : 0);
      const dx = walking ? Math.sin(yaw) * t * 0.55 : 0, dz = walking ? Math.cos(yaw) * t * 0.55 : 0;
      return <Character key={i} look={EXTRAS[k]} p={{ x: x + dx, z: z + dz, yaw, y: w.bob, legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR,
        breathe: breathe(t + i), headYaw: Math.sin(t * 0.7 + i) * 0.3, lid: blink(t, [0.8 + i * 0.4]) }} />;
    })}
  </>
);

// ---------------------------------------------------------------- 7. POV down on the market
const S7: React.FC = () => {
  const t = t12(useCurrentFrame());
  return (
    <PixelShot>
      <Cam pos={[NIO_WIN.x - 0.1 * t, NIO_WIN.y - 0.3, -4.0]} at={[-0.5, 0.5, 8.2]} fov={46} />
      <Exterior curtain={0}>
        <Crowd t={t} />
        <Character look={MAYA} p={{ x: -2.4, z: 7.1, yaw: Math.PI, breathe: breathe(t), headPitch: -0.2, armR: { sx: -0.7, sz: -0.2, el: 1.3 } }}
          handR={<group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone on={1} /></group>} />
      </Exterior>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 8. out the door, across the street
const S8: React.FC = () => {
  const t = t12(useCurrentFrame());
  const w = walk(t, 1.9, 1);
  const z = -4.0 + t * 1.85;
  const p: Pose = { x: -3.7 + t * 0.08, z, yaw: 0.04, y: w.bob, legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR, twist: w.twist,
    headYaw: t < 1.6 ? Math.sin(t * 2.2) * 0.45 : 0.2, eyeX: t < 1.6 ? Math.sin(t * 2.2) * 0.5 : 0.3, lid: 0.25, brow: 0.35, hoodUp: 1 };
  return (
    <PixelShot>
      <Cam pos={[0.8, 1.5, 4.9]} at={[-3.2, 1.0, -1.2 + t * 0.4]} fov={44} />
      <Exterior curtain={0}>
        <Character look={NIO} p={p} />
        <Crowd t={t} />
      </Exterior>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 9. down the aisle
const S9: React.FC = () => {
  const t = t12(useCurrentFrame());
  const w = walk(t, 1.8, 1);
  const x = -6.4 + t * 1.3;
  const p: Pose = { x, z: 8.5, yaw: Math.PI / 2, y: w.bob, legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR, twist: w.twist,
    headYaw: Math.sin(t * 1.6) * 0.5, eyeX: Math.sin(t * 1.6) * 0.4, lid: 0.15, hoodUp: 1 };
  return (
    <PixelShot>
      <Cam pos={[x + 0.4, 1.45, 12.4]} at={[x + 0.2, 1.1, 8.5]} fov={40} />
      <Exterior curtain={0}>
        <Character look={NIO} p={p} />
        <Crowd t={t} skip={[0, 6]} />
      </Exterior>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 10. Maya
const S10: React.FC = () => {
  const t = t12(useCurrentFrame());
  const turn = sp(t, 0.2, 'snap');
  const maya: Pose = { x: -2.25, z: 7.15, yaw: Math.PI - turn * 2.35, breathe: breathe(t), headYaw: turn * 0.25, eyeX: turn * 0.5,
    lid: 0.42, smirk: saying(t, 'p_maya1', 0.4) ? 0.0 : 0.5, brow: -0.1, browUp: 0.2, mouth: mouthAt(t, 'p_maya1', 0.4) * 0.8,
    armR: { sx: -0.6, sz: -0.15, el: 1.2 }, armL: { sx: 0.1, sz: 0.05, el: 0.4 } };
  const nio: Pose = { x: -3.15, z: 7.75, yaw: 1.0, breathe: breathe(t + 1), headYaw: 0.1, eyeX: 0.3, lid: 0.3 + blink(t, [2.4]) * 0.7, brow: 0.2, hoodUp: 1 };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[-1.55, 1.42, 9.3]} at={[-2.65, 1.12, 7.3]} fov={36} />
        <Exterior curtain={0}>
          <Character look={MAYA} p={maya} handR={<group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone on={1} /></group>} />
          <Character look={NIO} p={nio} />
          <Crowd t={t} skip={[1, 6]} />
        </Exterior>
      </PixelShot>
      {saying(t, 'p_maya1', 0.4) && <Sub text="you're the guy in the window. you stand there a lot." />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 11. Nio: the pivot
const S11: React.FC = () => {
  const t = t12(useCurrentFrame());
  const look = sp(t, 0.7, 'sheet');
  const nio: Pose = { x: -3.15, z: 7.75, yaw: 1.0, breathe: breathe(t), headYaw: 0.1 - look * 0.5, eyeX: 0.4 - look * 1.0, eyeY: -look * 0.3,
    lid: Math.max(0.25, blink(t, [0.35])), brow: 0.1, browR: look * 0.5, mouth: mouthAt(t, 'p_dumplings', 0.8) * 0.8, hoodUp: 1 };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[-2.3, 1.5, 8.9]} at={[-3.1, 1.36, 7.75]} fov={30} />
        <Exterior curtain={0}><Character look={NIO} p={nio} /><Crowd t={t} skip={[1]} /></Exterior>
      </PixelShot>
      {saying(t, 'p_dumplings', 0.8) && <Sub text="...are the dumplings here any good?" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 12. the left-shoe guy
const S12: React.FC = () => {
  const t = t12(useCurrentFrame());
  const weird: Pose = { x: -1.0, z: 11.35, yaw: Math.PI, breathe: breathe(t * 0.5), headYaw: Math.sin(t * 0.5) * 0.06, lid: 0, smile: 0.4,
    armL: { sx: -0.4, sz: 0.1, el: 0.8 }, armR: { sx: -0.4, sz: 0.1, el: 0.8 } };
  const nio: Pose = { x: -1.55, z: 9.3, yaw: Math.PI - 0.15, breathe: breathe(t), hoodUp: 1, headTilt: 0.12, mouth: mouthAt(t, 'p_shoes', 0.4) };
  const maya: Pose = { x: -0.45, z: 9.25, yaw: Math.PI + 0.2, breathe: breathe(t + 2), armR: { sx: -0.6, sz: -0.15, el: 1.2 } };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[-1.0, 1.55, 7.2]} at={[-1.0, 1.3, 11]} fov={44} />
        <Exterior curtain={0}>
          <Character look={WEIRD} p={weird} />
          <Character look={NIO} p={nio} />
          <Character look={MAYA} p={maya} />
        </Exterior>
      </PixelShot>
      {saying(t, 'p_shoes', 0.4) && <Sub text="why does he only sell left shoes?" />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 13. Maya: "yeah, weird. but he's cool."
const S13: React.FC = () => {
  const t = t12(useCurrentFrame());
  const maya: Pose = { x: -0.45, z: 9.25, yaw: -0.45, breathe: breathe(t), headYaw: -0.3, eyeX: -0.5, lid: 0.45, smirk: t > 2.6 ? 0.6 : 0.2,
    brow: -0.05, mouth: mouthAt(t, 'p_maya2', 0.2) * 0.8, armR: { sx: -0.6, sz: -0.15, el: 1.2 }, lean: Math.sin(t * 2) * 0.01 };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[-1.0, 1.42, 8.2]} at={[-0.45, 1.33, 9.25]} fov={30} />
        <Exterior curtain={0}><Character look={MAYA} p={maya} /></Exterior>
      </PixelShot>
      {saying(t, 'p_maya2', 0.2) && <Sub text="yeah, weird. but he's cool." />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 14. the shared album fills up
const S14: React.FC = () => {
  const t = t12(useCurrentFrame());
  const al = useAlbum('Night Market', ['photos/window.png', 'photos/dumplings.png', 'photos/shoes.png', 'photos/lights.png']);
  return (
    <InsertPhone screen={al?.screen} reach={0.2} press={0}>
      {al && al.thumbs.map((th, i) => {
        const k = sp(t, 0.3 + i * 0.45, 'pop'); const [px, py] = ALBUM_SLOTS[i]; const [x, y, z] = toScreen(px, py, 170, 220);
        return k > 0.01 ? (
          <mesh key={i} geometry={plane(0.0288, 0.037)} position={[x, y, z + 0.0002]} scale={0.6 + 0.4 * k}>
            <meshBasicMaterial map={th} transparent opacity={Math.min(1, k * 1.4)} toneMapped={false} />
          </mesh>
        ) : null;
      })}
    </InsertPhone>
  );
};

// ---------------------------------------------------------------- 15. later: Maya below, waving up
const S15: React.FC = () => {
  const t = t12(useCurrentFrame());
  const wave = Math.sin(t * 9) * 0.35;
  return (
    <PixelShot>
      <Cam pos={[NIO_WIN.x, NIO_WIN.y - 0.3, -4.0]} at={[-1.6, 0.6, 6.5]} fov={30} />
      <Exterior curtain={0}>
        <Crowd t={t} />
        <Character look={MAYA} p={{ x: -1.8, z: 4.4, yaw: Math.PI + 0.25, headPitch: -0.45, lid: 0.3, smirk: 0.6, breathe: breathe(t),
          armL: { sx: -0.2, sy: 0, sz: 2.4 + wave, el: 0.4 } }} />
      </Exterior>
    </PixelShot>
  );
};

// ---------------------------------------------------------------- 16. Nio in his window: a small wave back. "ight."
const S16: React.FC = () => {
  const t = t12(useCurrentFrame());
  const raise = sp(t, 0.9, 'snap') * (1 - sp(t, 2.1, 'sheet'));
  const pose: Pose = { yaw: 0, headPitch: 0.3, eyeY: -0.8, lid: 0.35 + blink(t, [0.4]) * 0.6, brow: 0.1, smirk: t > 2.0 ? 0.5 : 0,
    mouth: mouthAt(t, 'p_ight', 1.6), armR: { sx: -0.3 * raise, sz: 0.2 + raise * 2.0, el: 0.5 + raise * 0.6 }, armL: { sx: -0.5, sz: 0.2, el: 0.9 } };
  return (
    <AbsoluteFill>
      <PixelShot>
        <Cam pos={[NIO_WIN.x - 0.6, 4.6, 3.5]} at={[NIO_WIN.x, NIO_WIN.y, -4.6]} fov={20} />
        <Exterior curtain={0} nioInWindow={{ look: NIO, pose }} />
      </PixelShot>
      {saying(t, 'p_ight', 1.6) && <Sub text="ight." />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the cut
const SHOTS: [React.FC, number][] = [
  [S1, 66], [S2, 60], [S3, 90], [S4, 72], [S5, 84], [S6, 80], [S7, 60], [S8, 96],
  [S9, 72], [S10, 100], [S11, 72], [S12, 72], [S13, 96], [S14, 72], [S15, 48], [S16, 84],
];
const START: number[] = SHOTS.reduce<number[]>((a, [, d], i) => (a.push(i ? a[i - 1] + SHOTS[i - 1][1] : 0), a), []);
export const PILOT_LEN = START[START.length - 1] + SHOTS[SHOTS.length - 1][1];

// what plays when (shot index, seconds into the shot)
const VO: [string, number, number][] = [
  ['l1', 2, 0.45], ['p_window', 3, 0.9], ['p_market', 5, 0.35], ['p_maya1', 9, 0.4], ['p_dumplings', 10, 0.8],
  ['p_shoes', 11, 0.4], ['p_maya2', 12, 0.2], ['p_ight', 15, 1.6],
];
const SFX: [string, number, number, number][] = [
  ['buzz', 0, 1.6, 1], ['buzz', 1, 0.25, 0.8], ['glitch', 2, 2.95, 0.7], ['sting', 15, 3.0, 0.8],
];
const at = (shot: number, s: number) => START[shot] + Math.round(s * 24);

export const Pilot: React.FC = () => (
  <AbsoluteFill style={{ background: '#151216' }}>
    <Fonts />
    {SHOTS.map(([C, d], i) => <Sequence key={i} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    <Audio src={staticFile(A.sfx.room)} volume={0.3} />
    {/* the market's murmur, only while we're outside */}
    <Sequence from={START[5]} durationInFrames={START[14] - START[5]}><Audio src={staticFile('sfx/market.wav')} volume={0.45} /></Sequence>
    {VO.map(([k, s, o]) => <Sequence key={k} from={at(s, o)}><Audio src={staticFile(A.lines[k].file)} /></Sequence>)}
    {SFX.map(([k, s, o, v], i) => <Sequence key={i} from={at(s, o)}><Audio src={staticFile(A.sfx[k])} volume={v} /></Sequence>)}
    <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Pixelify', fontWeight: 700, fontSize: 60, color: '#efe6d2',
      textShadow: '0 6px 0 #151216, 5px 0 0 #151216, -5px 0 0 #151216, 0 -5px 0 #151216' }}>PILOT</div>
  </AbsoluteFill>
);

/** Stills for the in-show photos (rendered once into public/photos). */
export const PhotoStill: React.FC<{ which: string }> = ({ which }) => {
  const nioWin: Pose = { yaw: 0, headPitch: 0.25, lid: 0.3, eyeY: -0.6, armL: { sx: -0.5, sz: 0.2, el: 0.9 }, armR: { sx: -0.5, sz: 0.2, el: 0.9 } };
  return (
    <PixelShot res={[216, 384]}>
      {which === 'window' && <><Cam pos={[2.4, 1.6, 9.5]} at={[1.15, 6.2, -4.5]} fov={40} /><Exterior curtain={0} nioInWindow={{ look: NIO, pose: nioWin }}><Crowd t={0.4} /></Exterior></>}
      {which === 'dumplings' && <><Cam pos={[-2.65, 1.5, 10.9]} at={[-2.7, 1.2, 7.2]} fov={30} /><Exterior curtain={0}>
        <Character look={NIO} p={{ x: -3.0, z: 7.6, yaw: 0.25, lid: 0.25, smirk: 0.5, hoodUp: 1, headTilt: 0.08 }} />
        <Character look={MAYA} p={{ x: -2.4, z: 7.5, yaw: -0.25, lid: 0.35, smile: 0.7, headTilt: -0.1, armR: { sx: -1.7, sz: -0.1, el: 0.6 } }} /></Exterior></>}
      {which === 'shoes' && <><Cam pos={[-1.0, 1.5, 8.8]} at={[-1.0, 1.4, 11]} fov={34} /><Exterior curtain={0}><Character look={WEIRD} p={{ x: -1.0, z: 11.35, yaw: Math.PI, smile: 0.4 }} /></Exterior></>}
      {which === 'lights' && <><Cam pos={[-1.5, 1.6, 9.8]} at={[1.5, 2.2, 6.6]} fov={48} /><Exterior curtain={0}><Crowd t={1.2} /></Exterior></>}
    </PixelShot>
  );
};
