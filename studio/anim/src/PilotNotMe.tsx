// PILOT — "Not Me"
// Nio sees himself mid-bite, sauce on his chin, in the back of a stranger family's selfie, in their PXI album
// "Our first night in the city". He walks over to ask the dad to delete it and never manages to say the word.
// Every time he should ask, he picks a politer way out, and the family's kindness makes it worse: he takes their photo,
// compliments them, ends up in their photos, becomes "our local", is invited to Sunday brunch (Maya already said yes),
// and the photo he wanted gone becomes the album's cover. The album renames itself "Our first friend in the city".
// Tone: grounded, deadpan, cringe. Nobody is weird on purpose except the kid, who just watches.
// Direction: locked-off camera, hard cuts, every beat a new shot; reaction shots and held silences do the comedy.
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { frame } from './lib/frame';
import { Exterior, EXTRAS, SceneBg } from './world/Exterior';
import { Character, NIO, MAYA, Look, Pose, headPos } from './world/Character';
import { Phone } from './world/Phone';
import { useNotMeScreens } from './ui/NotMeScreens';
import { t12, sp, keys, blink, breathe, nz, walk } from './lib/motion';
import { Solid, toon, flat, sph, cap, plane, cyl } from './lib/toon';
import audio from './audio.json';

const A = audio as { lines: Record<string, { file: string; dur: number; env: number[] }>; sfx: Record<string, string> };

// ---------------------------------------------------------------- cast
const ex = (o: Partial<Look>): Look => ({ skin: '#c99a7a', skinShade: '#a87b5d', hair: '#1f1a1a', hairDark: '#1f1a1a', iris: '#2a1a12', top: '#3f6f8f',
  topDark: '#345d78', pants: '#2b2a33', shoes: '#efe6d2', shape: 'tri', hairStyle: 'crop', ...o });
/** Dev: the dad. New in the city, delighted by everything. */
const DEV: Look = ex({ skin: '#b98262', skinShade: '#99674b', top: '#5f8f5a', topDark: '#4c7548', pants: '#4a4f63', shape: 'long', build: 1.1, mustache: true });
/** Priya: the mom. */
const PRIYA: Look = ex({ skin: '#a87458', skinShade: '#8a5c44', top: '#c75a4a', topDark: '#a84a3d', pants: '#2b2a33', shape: 'round', hairStyle: 'puff', puff: true, lashes: true, hoops: true, build: 0.95 });
/** The kid: seven, holds a balloon, never blinks. */
const KID: Look = ex({ skin: '#b98262', skinShade: '#99674b', top: '#e0b23c', topDark: '#c49a2e', pants: '#3f6f8f', shape: 'round', height: 0.62, build: 0.95 });

// ---------------------------------------------------------------- talking without recorded lines yet: mouth flaps from subtitle timing
const talk = (t: number, at: number, d: number) => (t > at && t < at + d ? 0.2 + 0.55 * Math.abs(Math.sin((t - at) * 13)) : 0);
const on = (t: number, at: number, d: number) => t > at && t < at + d + 0.25;

// ---------------------------------------------------------------- props
/** Sauce on the chin (the runner). Lives on the head. */
const Sauce: React.FC = () => (
  <group position={[0.045, -0.115, 0.152]} rotation={[-0.35, 0.25, 0.2]}>
    <mesh geometry={sph(0.022, 10, 8)} scale={[1.3, 0.75, 0.35]} material={flat('#8a3a1c')} />
    <mesh geometry={sph(0.012, 8, 6)} position={[-0.004, -0.018, 0.002]} scale={[0.8, 1.2, 0.4]} material={flat('#8a3a1c')} />
  </group>
);
/** A skewer: three chunks on a stick. Held like the phone (in the hand's frame, pointing past the fingers). */
const Skewer: React.FC<{ bitten?: number }> = ({ bitten = 0 }) => (
  <group position={[0, -0.03, 0.04]} rotation={[0.2, 0, 0]}>
    <mesh geometry={cyl(0.005, 0.005, 0.36, 6)} position={[0, -0.12, 0]} material={flat('#d8c39a')} />
    {[0, 1, 2].map((k) => k < 3 - bitten ? <Solid key={k} geo={sph(0.032)} mat={toon(k % 2 ? '#9c4a26' : '#b8602e')} position={[0, -0.2 - k * 0.055, 0]} scale={[1, 0.85, 1]} line={0.006} /> : null)}
  </group>
);
/** A paper boat of dumplings (Maya). */
const Dumplings: React.FC = () => (
  <group position={[0, -0.06, 0.08]} rotation={[-1.3, 0, 0]}>
    <Solid geo={cyl(0.09, 0.06, 0.05, 10)} mat={toon('#efe6d2')} line={0.006} />
    {[[-0.03, 0], [0.03, 0.01], [0, -0.03]].map(([x, z], i) => <Solid key={i} geo={sph(0.03)} mat={toon('#f2e3c0')} position={[x, 0.03, z]} scale={[1, 0.8, 1]} line={0.005} />)}
  </group>
);
const PhoneInHand: React.FC<{ on?: number; buzz?: number }> = (p) => <group position={[0, -0.04, 0.03]} rotation={[0, 0, Math.PI]}><Phone {...p} /></group>;
/** The kid's balloon, as a world object (the string runs down to his hand). */
const Balloon: React.FC<{ x: number; z: number; t: number }> = ({ x, z, t }) => {
  const sway = Math.sin(t * 1.3) * 0.04;
  return (
    <group>
      <mesh geometry={cyl(0.003, 0.003, 1.45, 4)} position={[x + sway / 2, 1.12, z]} rotation={[0, 0, -sway]} material={flat('#efe6d2')} />
      <Solid geo={sph(0.15)} mat={toon('#ff6a8a', '#ff6a8a', 0.15)} position={[x + sway, 1.98, z]} scale={[1, 1.15, 1]} line={0.01} />
    </group>
  );
};

// ---------------------------------------------------------------- staging (night market, see world/Exterior.tsx)
// Nio + Maya in front of the dumpling stall (x -2.5, z 6.2, faces +z). The family across the aisle at the fruit stall
// (x 2, z 10.8, faces -z): they stand at z 9.7 with their backs to it. Nio walks over and stands at z 8.45, facing them.
const NIO_A: Pose = { x: -2.05, z: 7.35, yaw: 0.15 };
const MAYA_A: Pose = { x: -2.85, z: 7.3, yaw: 0.25 };
const DEV_P: Pose = { x: 1.55, z: 9.7, yaw: Math.PI - 0.1 };
const PRIYA_P: Pose = { x: 2.35, z: 9.72, yaw: Math.PI + 0.1 };
const KID_P: Pose = { x: 1.95, z: 9.55, yaw: Math.PI };
const NIO_B: Pose = { x: 1.9, z: 8.45, yaw: 0 };
const HOLD = { sx: -0.7, sz: -0.22, el: 1.35 };       // phone held low, reading
const OFFER = { sx: -1.25, sz: -0.15, el: 0.35 };     // arm out, phone offered / shown
const SHOOT = { sx: -1.35, sz: -0.12, el: 0.8 };      // phone up, taking a photo
const KID_STRING = { sx: -0.25, sz: -0.25, el: 0.6 };

const Family: React.FC<{ t: number; dev?: Partial<Pose>; priya?: Partial<Pose>; kid?: Partial<Pose>; devPhone?: boolean; still?: boolean; bx?: number }> = ({ t, dev = {}, priya = {}, kid = {}, devPhone = true, still, bx = -0.2 }) => (
  <>
    <Character look={DEV} p={{ ...DEV_P, breathe: breathe(t), lid: blink(t, [1.1, 3.4]), smile: 0.5, ...dev }} handR={devPhone ? <PhoneInHand on={1} /> : undefined} />
    <Character look={PRIYA} p={{ ...PRIYA_P, breathe: breathe(t + 1), lid: blink(t, [0.6, 2.7]), smile: 0.5, ...priya }} />
    <Character look={KID} p={{ ...KID_P, breathe: still ? 0 : breathe(t + 2), armR: KID_STRING, ...kid }} />
    <Balloon x={(kid.x ?? KID_P.x!) + bx} z={(kid.z ?? KID_P.z!) + 0.05} t={t} />
  </>
);
/** A few shoppers so the market is never empty. */
const SHOPPERS: [number, number, number][] = [[-5.2, 7.2, 0.2], [0.4, 7.5, -0.4], [5.9, 7.4, 0.6], [-4.0, 9.8, 2.9], [-0.6, 10.0, 3.3], [5.4, 9.6, 2.8]];
const Shoppers: React.FC<{ t: number }> = ({ t }) => <>{SHOPPERS.map(([x, z, yaw], i) =>
  <Character key={i} look={EXTRAS[i % EXTRAS.length]} p={{ x, z, yaw, breathe: breathe(t + i * 0.7), lid: blink(t, [0.8 + i * 0.6]), headYaw: Math.sin(t * 0.4 + i) * 0.2 }} />)}</>;

const Market: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => <Exterior curtain={1}><Shoppers t={t} />{children}</Exterior>;

// ---------------------------------------------------------------- phone inserts (Insert = phone in a hand, screen = texture)
const toScreen = (px: number, py: number): [number, number, number] => [(px / 390) * 0.066 - 0.033, 0.071 - (py / 844) * 0.142, 0.0058];
const Insert: React.FC<{ screen?: any; tap?: [number, number]; tapK?: number; press?: number; buzz?: number; swipe?: number; skin?: string; sleeve?: string; children?: React.ReactNode }> =
  ({ screen, tap = [195, 600], tapK = 0, press = 0, buzz = 0, skin = NIO.skin, sleeve = NIO.top, children }) => {
  const base: [number, number] = [0.07, -0.115];
  const rest: [number, number] = [0.043, -0.06];
  const [tx, ty] = toScreen(tap[0], tap[1]);
  const tip: [number, number] = [rest[0] + (tx - rest[0]) * tapK, rest[1] + (ty - rest[1]) * tapK];
  const dx = tip[0] - base[0], dy = tip[1] - base[1], len = Math.hypot(dx, dy);
  return (
    <PixelShot res={[216, 384]}>
      <SceneBg color="#221c2e" />
      <Cam pos={[0, -0.005, 0.25]} at={[0, -0.005, 0]} fov={38} />
      <ambientLight intensity={1.3} color="#e8dcf0" />
      <directionalLight position={[0.5, 1, 1]} intensity={1.0} color="#ffe2c0" />
      {/* the market behind, out of focus: the ground and a few warm bokeh lights */}
      <mesh geometry={plane(3, 3)} position={[0, 0, -0.6]} material={toon('#3b3040')} />
      {[[-0.18, 0.2, '#ffd98a'], [0.16, 0.26, '#ff9e8a'], [0.21, -0.12, '#fff1c9'], [-0.2, -0.22, '#ffb07a'], [0.02, 0.33, '#ffd98a']].map(([x, y, c], i) =>
        <mesh key={i} geometry={sph(0.025, 8, 6)} position={[x as number, y as number, -0.5]} material={toon(c as string, c as string, 1.6)} />)}
      <Solid geo={cap(0.06, 1.2)} mat={toon(sleeve)} position={[0.12, -0.22, -0.5]} rotation={[0, 0, 1.3]} line={0.012} />
      <group position={[buzz * 0.003, 0, 0]}>
        <Phone on={0} />
        {screen && <mesh geometry={plane(0.066, 0.142)} position={[0, 0, 0.0056]}><meshBasicMaterial map={screen} toneMapped={false} /></mesh>}
        {children}
        <Solid geo={sph(0.06)} mat={toon(skin)} position={[0.012, -0.11, -0.02]} scale={[1.3, 0.85, 0.7]} line={0.012} />
        {[0, 1, 2, 3].map((i) => <Solid key={i} geo={cap(0.0095, 0.006)} mat={toon(skin)} position={[-0.046, -0.005 - i * 0.022, 0.002]} rotation={[0, 0, 1.45]} line={0.009} />)}
        <group position={[base[0] + dx / 2, base[1] + dy / 2, 0.012 - press * 0.003 + tapK * 0.004]} rotation={[0, 0, Math.atan2(-dx, dy)]}>
          <Solid geo={cap(0.014, Math.max(0.01, len - 0.028))} mat={toon(skin)} line={0.01} />
        </group>
      </group>
    </PixelShot>
  );
};
/** A push card sliding down over whatever is on screen. */
const Card: React.FC<{ tex: any; k: number }> = ({ tex, k }) => {
  const [x, y, z] = toScreen(195, 365);
  return k > 0.01 ? <mesh geometry={plane(0.0626, 0.0254)} position={[x, y + (1 - k) * 0.02, z + 0.0003]}><meshBasicMaterial map={tex} transparent opacity={Math.min(1, k * 1.5)} toneMapped={false} /></mesh> : null;
};
/** Slides screen B in over screen A from the right (u 0..1). */
const Slide: React.FC<{ a?: any; b?: any; u: number }> = ({ a, b, u }) => {
  const [, , z] = toScreen(0, 0);
  return (
    <group>
      {a && u < 1 && <mesh geometry={plane(0.066, 0.142)} position={[-0.066 * u, 0, z + 0.0002]}><meshBasicMaterial map={a} toneMapped={false} /></mesh>}
      {b && u > 0 && <mesh geometry={plane(0.066, 0.142)} position={[0.066 * (1 - u), 0, z + 0.0003]}><meshBasicMaterial map={b} toneMapped={false} /></mesh>}
      {/* mask the bits that slid off the glass */}
      <mesh geometry={plane(0.08, 0.16)} position={[0.073, 0, z + 0.0005]}><meshBasicMaterial color="#d9d2c5" /></mesh>
      <mesh geometry={plane(0.08, 0.16)} position={[-0.073, 0, z + 0.0005]}><meshBasicMaterial color="#d9d2c5" /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- shots
const S = (C: React.FC<{ t: number; f: number }>) => () => { const f = useCurrentFrame(); return <C t={t12(f)} f={f} />; };
const NIO_HEAD_A = headPos(NIO_A, NIO);
const BITE = { sx: -2.25, sz: -0.3, el: 1.9 };   // skewer at his mouth

const SH1 = S(({ t, f }) => {   // HOOK, CU: market noise, Nio takes an enormous bite off a skewer. Chews. Buzz. He looks down.
  const pull = sp(t, 0.55, 'snap');          // skewer pulled away from his mouth, one chunk lighter
  const look = sp(t, 1.45, 'snap');
  const chew = t > 0.5 ? Math.abs(Math.sin(t * 9)) * 0.35 : 0;
  const nio: Pose = { ...NIO_A, breathe: breathe(t), armR: { sx: -1.5 + pull * 0.5, sz: 0.5, el: 1.6 }, armL: { sx: -0.5 - look * 0.25, sz: 0.15, el: 1.1 + look * 0.3 },
    mouth: t < 0.55 ? 0.75 : chew, lid: t < 0.6 ? 0.75 : 0.15, headPitch: look * 0.35 - (1 - pull) * 0.05, eyeY: -look, smile: 0.1, squash: t < 0.55 ? 0.02 : 0 };
  const hp = NIO_HEAD_A, c = Math.cos(NIO_A.yaw!), s2 = Math.sin(NIO_A.yaw!);
  const mx = hp[0] + 0.16 * s2, mz = hp[2] + 0.16 * c, my = hp[1] - 0.075;
  const f2 = frame(NIO_HEAD_A, 'cu', 0.15, { up: 0.02 });
  return (
    <PixelShot><Cam pos={f2.pos} at={f2.at} fov={f2.fov} />
      <Market t={t}><Character look={NIO} p={nio} handL={<PhoneInHand on={1} buzz={t > 1.1 && t < 1.6 ? nz(f, 2) : 0} />} onHead={<Sauce />} />
        {/* the skewer, across his mouth, then pulled away to his right (out of frame) */}
        <group position={[mx - 0.04 - pull * 0.45, my - pull * 0.3, mz + 0.02]} rotation={[0, NIO_A.yaw!, Math.PI / 2 + 0.12 + pull * 0.25]}>
          <mesh geometry={cyl(0.005, 0.005, 0.5, 6)} position={[0, 0.2, 0]} material={flat('#d8c39a')} />
          {[0, 1, 2].map((k) => (k > 0 || t < 0.55) ? <Solid key={k} geo={sph(0.032)} mat={toon(k % 2 ? '#9c4a26' : '#b8602e')} position={[0, 0.02 + k * 0.065, 0]} scale={[1, 0.85, 1]} line={0.006} /> : null)}
        </group></Market></PixelShot>
  );
});

const SH2 = S(({ t, f }) => {   // INSERT: the push. Tap. IS THIS YOU?
  const s = useNotMeScreens();
  const tapped = t > 1.0;
  return <Insert screen={tapped ? s?.review1 : s?.lock} buzz={t < 0.5 ? nz(f, 3) : 0} tap={[195, 365]} tapK={t < 1.0 ? keys(t, [[0, 0], [0.7, 1, 'snap']]) : Math.max(0, 1 - (t - 1.0) * 4)} press={t > 0.85 && t < 1.05 ? 1 : 0}>
    {s && !tapped && <Card tex={s.card} k={sp(t, 0.1, 'pop')} />}</Insert>;
});

const SH3 = S(({ t }) => {   // INSERT: Not me. The next one is closer. Not me. Closer. The thumb hovers.
  const s = useNotMeScreens();
  const T1 = 0.55, T2 = 1.45;
  const u1 = sp(t, T1 + 0.12, 'snap'), u2 = sp(t, T2 + 0.12, 'snap');
  const tapK = keys(t, [[0, 0], [0.25, 1, 'snap'], [T1 + 0.15, 0.3, 'snap'], [T2 - 0.3, 1, 'snap'], [T2 + 0.15, 0.3, 'snap'], [T2 + 0.9, 0.85, 'lazy']]);
  const press = (t > T1 - 0.05 && t < T1 + 0.1) || (t > T2 - 0.05 && t < T2 + 0.1) ? 1 : 0;
  return <Insert tap={[105, 738]} tapK={tapK} press={press}>
    {s && (t < T2 ? <Slide a={s.review1} b={s.review2} u={u1} /> : <Slide a={s.review2} b={s.review3} u={u2} />)}</Insert>;
});

const SH4 = S(({ t }) => {   // CU Nio: chewing, slower and slower. He looks up.
  const chew = Math.abs(Math.sin(t * (9 - t * 3))) * Math.max(0, 0.35 - t * 0.15);
  const up = sp(t, 1.15, 'snap');
  const nio: Pose = { ...NIO_A, armL: HOLD, armR: { sx: -0.9, sz: -0.3, el: 1.4 }, mouth: chew, headPitch: 0.35 * (1 - up), eyeY: -1 + up * 1.1, eyeX: up * 0.5, lid: 0.3 - up * 0.15, brow: 0.2, smile: 0 };
  const f = frame(NIO_HEAD_A, 'cu', 0.15, { up: 0.02 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={NIO} p={nio} handL={<PhoneInHand on={1} />} handR={<Skewer bitten={1} />} onHead={<Sauce />} /></Market></PixelShot>;
});

const SH5 = S(({ t }) => {   // HIS POV across the aisle: the same family. Dev is swiping through his photos, smiling.
  const dev: Partial<Pose> = { armR: HOLD, headPitch: 0.3, eyeY: -0.8, smile: 0.8, yaw: Math.PI + 0.6 };
  return <PixelShot><Cam pos={[-1.6, 1.62, 7.6]} at={[1.9, 1.0, 9.7]} fov={30} /><Market t={t}><Family t={t} dev={dev} priya={{ yaw: Math.PI + 0.5, headYaw: -0.3 }} kid={{ yaw: Math.PI + 0.5 }} /></Market></PixelShot>;
});

const SH6 = S(({ t }) => {   // MS Nio + Maya. "Just ask him to delete it." He hands her the skewer without looking and goes.
  const L1 = 0.25, D1 = 1.35;
  const hand = keys(t, [[0, 0], [1.75, 1, 'snap'], [2.15, 0, 'snap']]);
  const go = Math.max(0, t - 2.1);
  const w = walk(go, 1.9, Math.min(1, go * 4));
  const nio: Pose = { ...NIO_A, x: NIO_A.x! + go * 1.2, yaw: go > 0 ? Math.PI / 2 - 0.2 : NIO_A.yaw, breathe: breathe(t), eyeX: 1, eyeY: 0.1, lid: 0.2, brow: 0.35,
    armL: go > 0 ? { sx: -0.9, sz: 0.1, el: 1.2 } : HOLD, armR: go > 0 ? w.armR : { sx: -0.3 - hand * 0.9, sz: 0.2 + hand * 0.5, el: 0.3 }, legL: go > 0 ? w.legL : undefined, legR: go > 0 ? w.legR : undefined, y: go > 0 ? w.bob : 0 };
  const maya: Pose = { ...MAYA_A, breathe: breathe(t + 1), armL: { sx: -0.7, sz: 0.1, el: 1.2 }, armR: { sx: -0.35 - hand * 0.6, sz: 0.1, el: 0.5 + hand * 0.3 }, headPitch: 0.2, eyeY: -0.6,
    mouth: talk(t, L1, D1), lid: blink(t, [2.6]) };
  const f = frame(headPos({ x: -2.45, z: 7.32 }, NIO), 'mws', 0.2, { up: 0.05, fov: 40 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}>
        <Character look={NIO} p={nio} handL={<PhoneInHand on={1} />} handR={t < 1.95 ? <Skewer bitten={1} /> : undefined} onHead={<Sauce />} />
        <Character look={MAYA} p={maya} handL={<Dumplings />} handR={t >= 1.95 ? <Skewer bitten={1} /> : undefined} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="just ask him to delete it." />}
    </AbsoluteFill>
  );
});

const SH7 = S(({ t }) => {   // TWO-SHOT at the family's stall. He arrives, phone out. "Hey, sorry—" "Oh, you want one?"
  const arrive = Math.min(1, t / 0.8);
  const w = walk(t, 1.9, 1 - arrive);
  const L1 = 0.9, D1 = 0.6, L2 = 1.55, D2 = 1.0;
  const offer = sp(t, 0.85, 'snap'), devOffer = sp(t, 1.75, 'snap');
  const nio: Pose = { ...NIO_B, x: NIO_B.x! - (1 - arrive) * 1.2, yaw: arrive < 1 ? 1.3 * (1 - arrive) + 0.05 : 0.05, breathe: breathe(t), legL: w.legL, legR: w.legR, armR: { sx: -0.3 - offer * 0.95, sz: -0.15, el: 0.6 - offer * 0.25 },
    armL: { sx: -0.1, sz: 0.1, el: 0.3 }, mouth: talk(t, L1, D1), smile: 0.35, brow: 0.15, lid: 0.15 };
  const dev: Partial<Pose> = { yaw: Math.PI, armR: { sx: -0.7 - devOffer * 0.6, sz: -0.2, el: 1.35 - devOffer * 1.0 }, headPitch: 0.05, smile: 0.9, browUp: 0.6, mouth: talk(t, L2, D2), wide: 0.15 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[1.05, 1.85, 10.7]} at={[1.85, 1.3, 8.45]} fov={40} /><Market t={t}>
        <Family t={t} dev={dev} priya={{ smile: 0.7, headYaw: -0.2 }} kid={{ headPitch: -0.2 }} />
        <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} onHead={<Sauce />} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="hey, sorry—" />}
      {on(t, L2, D2) && <Sub text="oh, you want one?" />}
    </AbsoluteFill>
  );
});

const NIO_HEAD_B = headPos(NIO_B, NIO);
const SH8 = S(({ t }) => {   // CU Nio: the take. Dev's phone held out, in the frame, not moving. Hold. "...Sure."
  const L1 = 1.9, D1 = 0.5;
  const nio: Pose = { ...NIO_B, breathe: breathe(t) * 0.3, armR: { sx: -0.6, sz: -0.15, el: 0.5 }, eyeY: t < 0.9 ? -0.5 : 0.1, eyeX: t < 0.9 ? -0.3 : 0, lid: 0.3, brow: 0.1, smile: t > 1.5 ? 0.2 : 0,
    mouth: talk(t, L1, D1), headPitch: t < 0.9 ? 0.12 : 0 };
  const f = frame(NIO_HEAD_B, 'cu', 0.25, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}>
        <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} onHead={<Sauce />} />
        {/* Dev's hand and phone, held out into the frame, perfectly still */}
        <group position={[NIO_B.x! - 0.1, NIO_HEAD_B[1] - 0.27, NIO_B.z! + 0.36]} rotation={[0.15, Math.PI + 0.3, 0]}>
          <Phone on={1} />
          <Solid geo={sph(0.05)} mat={toon(DEV.skin)} position={[0.0, -0.07, -0.01]} scale={[1.1, 0.9, 0.7]} line={0.01} />
          <Solid geo={cap(0.045, 0.3)} mat={toon(DEV.top)} position={[0.08, -0.2, 0.08]} rotation={[0.9, 0, -0.6]} line={0.01} />
        </group></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="...sure." />}
    </AbsoluteFill>
  );
});

const SH9 = S(({ t }) => {   // WS from behind Nio: he holds Dev's phone up. The family, posed perfectly. Flash.
  const flash = t > 0.8 && t < 0.92 ? 1 : 0;
  const nio: Pose = { ...NIO_B, armR: SHOOT, armL: { sx: -1.1, sz: 0.3, el: 0.6 }, breathe: breathe(t) };
  const pose = { smile: 1, lid: 0.1 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[2.75, 1.95, 6.9]} at={[1.95, 1.1, 9.6]} fov={40} /><Market t={t}>
        <Family t={t} devPhone={false} dev={{ ...pose, yaw: Math.PI, armL: { sx: -0.3, sz: 0.9, el: 0.6 } }} priya={{ ...pose, yaw: Math.PI, headTilt: 0.15, armR: { sx: -0.3, sz: 0.9, el: 0.6 } }} kid={{ yaw: Math.PI, lid: 0, smile: 0 }} still />
        <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} handL={<PhoneInHand on={1} />} /></Market></PixelShot>
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: 0.8 }} />}
    </AbsoluteFill>
  );
});

const SH10 = S(({ t }) => {   // INSERT, Dev's phone: the photo he took. Swipe back once: the bite. Thumb drifts to the trash can.
  const s = useNotMeScreens();
  const u = sp(t, 0.75, 'snap');
  const tapK = keys(t, [[0, 0], [0.45, 0.6, 'snap'], [0.85, 0.1, 'snap'], [1.3, 0.55, 'lazy'], [2.0, 0.92, 'lazy']]);
  return <Insert tap={t < 1.0 ? [80, 420] : [343, 758]} tapK={tapK}>{s && <Slide b={s.dev_new} a={s.dev_bite} u={1 - u} />}</Insert>;
});

const KID_HEAD = headPos(KID_P, KID);
const SH11 = S(({ t }) => {   // CU the kid, right next to him, holding the balloon. "That's my dad's phone."
  const L1 = 0.55, D1 = 1.1;
  const kid: Pose = { ...KID_P, x: 1.75, z: 8.95, yaw: Math.PI / 2 + 0.6, armR: KID_STRING, lid: 0, eyeX: -0.2, eyeY: 0.35, brow: 0.1, smile: -0.15, mouth: talk(t, L1, D1) * 0.6 };
  const f = frame(headPos(kid, KID), 'cu', Math.PI / 2 + 0.6, { up: 0.05 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={KID} p={kid} /><Balloon x={1.62} z={8.82} t={t} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="that's my dad's phone." />}
    </AbsoluteFill>
  );
});

const SH12 = S(({ t }) => {   // CU Nio. Thumb stops. "Get a good one?" (off) A full second of nothing. "You have a beautiful family."
  const L1 = 0.3, D1 = 0.9, L2 = 2.45, D2 = 1.35;
  const up = sp(t, 1.1, 'lazy');
  const nio: Pose = { ...NIO_B, breathe: breathe(t) * 0.2, armR: { sx: -0.75, sz: -0.2, el: 1.3 }, headPitch: 0.25 * (1 - up), eyeY: -0.8 * (1 - up) + up * 0.1, eyeX: up * 0.3,
    lid: 0.2, brow: 0.3 - up * 0.4, browUp: up * 0.5, smile: t > 2.3 ? 0.55 : 0, mouth: talk(t, L2, D2), sweat: t > 1.6 ? 0.5 : 0 };
  const f = frame(NIO_HEAD_B, 'cu', 0.3, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} onHead={<Sauce />} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="get a good one?" />}
      {on(t, L2, D2) && <Sub text="you have a beautiful family." />}
    </AbsoluteFill>
  );
});

const DEV_HEAD = headPos(DEV_P, DEV);
const SH13 = S(({ t }) => {   // MCU Dev, moved, eyes a little wet. "Man."
  const L1 = 0.6, D1 = 0.45;
  const hand = sp(t, 0.15, 'sheet');
  const dev: Pose = { ...DEV_P, yaw: Math.PI, breathe: breathe(t), smile: 0.6, browUp: 0.9, lid: 0.35 + hand * 0.15, headTilt: 0.12 * hand, headPitch: -0.05 * hand, mouth: talk(t, L1, D1) };
  const f = frame(DEV_HEAD, 'mcu', Math.PI, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={DEV} p={dev} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="man." />}
    </AbsoluteFill>
  );
});

// the group: Nio between Dev and Priya, facing out; Maya takes it with Dev's phone
const G_NIO: Pose = { x: 1.95, z: 9.62, yaw: Math.PI };
const SH14 = S(({ t }) => {   // WIDE: Priya pulls him in. Maya wanders over with two skewers; Dev hands her the phone. "Where you from?" "Here."
  const pull = Math.min(1, t / 0.7);
  const L1 = 1.0, D1 = 0.75, L2 = 1.95, D2 = 0.4;
  const nio: Pose = { ...G_NIO, x: 1.95, z: 8.45 + pull * 1.17, yaw: pull * Math.PI, breathe: breathe(t), lid: 0.2, smile: 0.3, mouth: talk(t, L2, D2), armL: { sx: 0, sz: 0.1, el: 0.2 }, armR: { sx: 0, sz: 0.1, el: 0.2 } };
  const mayaIn = Math.min(1, t / 1.2);
  const wm = walk(t, 1.8, 1 - mayaIn);
  const maya: Pose = { x: 0.2 + mayaIn * 0.9, z: 7.4 + mayaIn * 0.6, yaw: Math.PI / 2 * (1 - mayaIn) + 0.25 * mayaIn, breathe: breathe(t + 1), legL: wm.legL, legR: wm.legR, armL: { sx: -0.8, sz: 0.1, el: 1.3 },
    armR: t > 1.4 ? SHOOT : { sx: -0.5, sz: -0.1, el: 1.4 }, mouth: Math.abs(Math.sin(t * 6)) * 0.25, eyeY: 0.2 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[2.15, 1.6, 6.3]} at={[1.85, 1.1, 9.3]} fov={46} /><Market t={t}>
        <Family t={t} devPhone={t < 1.3} dev={{ x: 1.3, yaw: Math.PI - 0.4, mouth: talk(t, L1, D1), smile: 0.8, armL: { sx: -0.3, sz: 0.6, el: 0.4 } }}
          priya={{ x: 2.6, yaw: Math.PI + 0.3, armL: { sx: -0.5 - pull * 0.3, sz: -0.9, el: 0.5 }, smile: 0.9 }} kid={{ x: 2.3, z: 9.38, yaw: Math.PI, lid: 0, headYaw: 0.3 }} bx={0.25} />
        <Character look={NIO} p={nio} onHead={<Sauce />} />
        <Character look={MAYA} p={maya} handR={t > 1.4 ? <PhoneInHand on={1} /> : undefined} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="where you from?" />}
      {on(t, L2, D2) && <Sub text="here." />}
    </AbsoluteFill>
  );
});

const SH15 = S(({ t }) => {   // MCU Dev, thrilled: "A local!" to Priya, then to Maya: "Is he free Sunday?"
  const L1 = 0.15, D1 = 0.7, L2 = 1.2, D2 = 1.1;
  const turn = sp(t, 1.0, 'snap');
  const dev: Pose = { x: 1.3, z: 9.7, yaw: Math.PI - 0.4, breathe: breathe(t), headYaw: 0.7 - turn * 1.0, eyeX: 0.8 - turn * 1.4, smile: 0.9, browUp: 0.8, wide: 0.2,
    mouth: Math.max(talk(t, L1, D1), talk(t, L2, D2)), armL: { sx: -0.3, sz: 0.6, el: 0.4 } };
  const f = frame(headPos(dev, DEV), 'mcu', Math.PI - 0.4, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={DEV} p={dev} />
        <Character look={NIO} p={{ ...G_NIO, lid: 0.25, smile: 0.25 }} onHead={<Sauce />} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="a local!" />}
      {on(t, L2, D2) && <Sub text="is he free sunday?" />}
    </AbsoluteFill>
  );
});

const MAYA_SHOOT: Pose = { x: 1.95, z: 8.1, yaw: 0 };
const SH16 = S(({ t }) => {   // CU Maya behind Dev's phone, mouth full, cheerful: "Mm-hm."
  const L1 = 0.35, D1 = 0.5;
  const maya: Pose = { ...MAYA_SHOOT, breathe: breathe(t), armR: SHOOT, armL: { sx: -0.8, sz: 0.1, el: 1.3 }, smile: 0.6, lid: 0.25, mouth: Math.abs(Math.sin(t * 8)) * 0.3 + talk(t, L1, D1) * 0.3, browUp: 0.3, headTilt: -0.1 };
  const f = frame(headPos(MAYA_SHOOT, MAYA), 'cu', 0.25, { up: 0.02, side: 0.15 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Market t={t}><Character look={MAYA} p={maya} handR={<PhoneInHand on={1} />} handL={<Skewer bitten={1} />} /></Market></PixelShot>
      {on(t, L1, D1) && <Sub text="mm-hm." />}
    </AbsoluteFill>
  );
});

const SH17 = S(({ t }) => {   // the group photo, from Maya's side: flash. Nio in the middle, polite smile, sauce.
  const flash = t > 0.25 && t < 0.38 ? 1 : 0;
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[1.95, 1.45, 7.1]} at={[1.95, 1.15, 9.6]} fov={52} /><Market t={t}>
        <Family t={t} devPhone={false} dev={{ x: 1.3, yaw: Math.PI, smile: 1, lid: 0.1, armR: { sx: -0.2, sz: -1.0, el: 0.3 } }} priya={{ x: 2.6, yaw: Math.PI, smile: 1, headTilt: -0.15, armL: { sx: -0.2, sz: -1.0, el: 0.3 } }} kid={{ x: 1.75, z: 9.25, yaw: Math.PI, lid: 0 }} still />
        <Character look={NIO} p={{ ...G_NIO, smile: 0.45, lid: 0.25, brow: 0.2 }} onHead={<Sauce />} /></Market></PixelShot>
      {flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: 0.8 }} />}
    </AbsoluteFill>
  );
});

const SH18 = S(({ t, f }) => {   // MS: Nio and Maya walk back up the aisle toward us. Buzz. He looks down.
  const w = walk(t, 1.8), wm = walk(t + 0.3, 1.8);
  const x0 = 0.7 - t * 0.75;
  const nio: Pose = { x: x0, y: w.bob, z: 8.35, yaw: -Math.PI / 2, legL: w.legL, legR: w.legR, armL: w.armL, armR: { sx: -0.7, sz: -0.2, el: 1.35 }, lid: 0.25, eyeY: t > 0.9 ? -0.8 : 0, headPitch: t > 0.9 ? 0.3 : 0 };
  const maya: Pose = { x: x0 - 0.1, y: wm.bob, z: 8.9, yaw: -Math.PI / 2, legL: wm.legL, legR: wm.legR, armL: wm.armL, armR: { sx: -0.6, sz: 0.1, el: 1.4 }, mouth: Math.abs(Math.sin(t * 7)) * 0.3, eyeY: -0.3 };
  return <PixelShot><Cam pos={[-3.4, 1.45, 8.6]} at={[-0.5, 1.15, 8.6]} fov={40} /><Market t={t}>
    <Character look={NIO} p={nio} handR={<PhoneInHand on={1} buzz={t > 0.85 && t < 1.3 ? nz(f, 4) : 0} />} onHead={<Sauce />} />
    <Character look={MAYA} p={maya} handR={<Skewer bitten={1} />} /></Market></PixelShot>;
});

const SH19 = S(({ t }) => {   // FULL-SCREEN INSERT: the invite. Sunday brunch with our local. WHO'S GOING: Dev, Priya, Maya.
  const s = useNotMeScreens();
  return <Insert screen={s?.invite} tapK={0} />;
});

const SH20 = S(({ t }) => {   // MS: Nio stops. Turns his head to Maya. Maya, chewing, keeps looking at his skewer.
  const turn = sp(t, 0.35, 'lazy');
  const nio: Pose = { x: -0.45, z: 8.35, yaw: -Math.PI / 2, armR: HOLD, headYaw: -turn * 0.8, eyeX: -turn * 0.6, lid: 0.35, brow: 0.2, smile: 0 };
  const maya: Pose = { x: -0.6, z: 8.9, yaw: -Math.PI / 2 + 0.15, armR: { sx: -0.6, sz: 0.1, el: 1.4 }, mouth: Math.abs(Math.sin(t * 8)) * 0.3, eyeY: -0.7, headPitch: 0.15, lid: blink(t, [1.7]) };
  return <PixelShot><Cam pos={[-3.0, 1.5, 8.62]} at={[-0.5, 1.2, 8.62]} fov={44} /><Market t={t}>
    <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} onHead={<Sauce />} />
    <Character look={MAYA} p={maya} handR={<Skewer bitten={2} />} /></Market></PixelShot>;
});

const SH21 = S(({ t }) => {   // INSERT: the album. The cover flips to the bite. The title retypes itself: "first friend".
  const s = useNotMeScreens();
  let scr: any = s?.album_before;
  if (s) {
    if (t > 0.7) scr = s.album_cover;
    const d = Math.floor((t - 1.5) / 0.09); if (d >= 0 && d <= 8) scr = s[`album_del${d}`];
    const k = Math.floor((t - 2.4) / 0.09); if (k >= 0) scr = s[`album_type${Math.min(8, k)}`];
  }
  return <Insert screen={scr} />;
});

const END = () => <AbsoluteFill style={{ background: '#0b0a0d' }} />;

// ---------------------------------------------------------------- cut + sound
const SHOTS: [React.FC, number][] = [
  [SH1, 52], [SH2, 44], [SH3, 70], [SH4, 46], [SH5, 46], [SH6, 66], [SH7, 72], [SH8, 66], [SH9, 34], [SH10, 62], [SH11, 50],
  [SH12, 102], [SH13, 34], [SH14, 66], [SH15, 64], [SH16, 30], [SH17, 26], [SH18, 36], [SH19, 60], [SH20, 52], [SH21, 98], [END, 16],
];
const START = SHOTS.reduce<number[]>((a, [, d], i) => (a.push(i ? a[i - 1] + SHOTS[i - 1][1] : 0), a), []);
export const NOTME_LEN = START[START.length - 1] + SHOTS[SHOTS.length - 1][1];
export const NOTME_STARTS = START;
const at = (shot: number, s: number) => START[shot] + Math.round(s * 24);
const LAST = SHOTS.length - 1;

const SFX: [string, number, number, number][] = [
  ['buzz', 0, 1.1, 0.9], ['buzz', 1, 0.0, 0.6], ['shutter', 8, 0.8, 0.9], ['shutter', 16, 0.25, 0.9], ['buzz', 17, 0.85, 0.9],
];

export const PilotNotMe: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {SHOTS.map(([C, d], i) => <Sequence key={i} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    {/* the market the whole time; it dips under the long silence in shot 12, then comes back */}
    <Sequence from={0} durationInFrames={at(11, 1.2)}><Audio src={staticFile(A.sfx.market)} volume={0.55} /></Sequence>
    <Sequence from={at(11, 1.2)} durationInFrames={at(11, 2.4) - at(11, 1.2)}><Audio src={staticFile(A.sfx.market)} volume={0.18} startFrom={24 * 20} /></Sequence>
    <Sequence from={at(11, 2.4)} durationInFrames={START[LAST] - at(11, 2.4)}><Audio src={staticFile(A.sfx.market)} volume={0.55} startFrom={24 * 5} /></Sequence>
    {SFX.map(([k, s, o, v], i) => A.sfx[k] ? <Sequence key={i} from={at(s, o)}><Audio src={staticFile(A.sfx[k])} volume={v} /></Sequence> : null)}
    <Sequence from={0} durationInFrames={START[LAST]}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 52, color: '#efe6d2', background: 'rgba(21,18,22,0.78)', padding: '6px 26px 10px', borderRadius: 40 }}>PILOT</div>
      </div>
    </Sequence>
  </AbsoluteFill>
);

/** The in-show photos (rendered first into public/photos/nm_*.png). */
export const NotMePhoto: React.FC<{ which: string }> = ({ which }) => {
  // the selfie: the family in front of the candle stall, Dev's arm out; behind them, Nio at the dumpling stall, mid-bite
  if (which === 'bite') {
    const fam = { smile: 1, lid: 0.1 };
    return <PixelShot res={[216, 384]}><Cam pos={[-0.95, 1.7, 10.75]} at={[-1.3, 1.4, 8.0]} fov={58} /><Market t={0.4}>
      <Character look={DEV} p={{ x: -0.72, z: 9.2, yaw: 0.05, ...fam, headTilt: -0.1, armR: { sx: -1.5, sz: 0.2, el: 0.2 } }} />
      <Character look={PRIYA} p={{ x: -1.12, z: 9.1, yaw: 0.1, ...fam, headTilt: 0.2 }} />
      <Character look={KID} p={{ x: -0.92, z: 9.5, yaw: 0.1, ...fam, armR: KID_STRING }} /><Balloon x={-0.62} z={9.55} t={0} />
      <Character look={NIO} p={{ ...NIO_A, armR: BITE, mouth: 0.9, lid: 0.75, headPitch: -0.05, armL: HOLD }} handR={<Skewer />} onHead={<Sauce />} /></Market></PixelShot>;
  }
  // the photo Nio took of them
  if (which === 'family') return <PixelShot res={[216, 384]}><Cam pos={[1.95, 1.45, 7.0]} at={[1.95, 1.05, 9.7]} fov={46} /><Market t={0.4}>
    <Family t={0} devPhone={false} dev={{ smile: 1, lid: 0.1, yaw: Math.PI, armL: { sx: -0.3, sz: 0.9, el: 0.6 } }} priya={{ smile: 1, lid: 0.1, yaw: Math.PI, headTilt: 0.15 }} kid={{ yaw: Math.PI, lid: 0 }} still /></Market></PixelShot>;
  // the group photo: Nio in the middle, polite, sauce
  if (which === 'group') return <PixelShot res={[216, 384]}><Cam pos={[1.95, 1.45, 7.1]} at={[1.95, 1.15, 9.6]} fov={52} /><Market t={0.4}>
    <Family t={0} devPhone={false} dev={{ x: 1.3, yaw: Math.PI, smile: 1, lid: 0.1, armR: { sx: -0.2, sz: -1.0, el: 0.3 } }} priya={{ x: 2.6, yaw: Math.PI, smile: 1, armL: { sx: -0.2, sz: -1.0, el: 0.3 } }} kid={{ x: 1.75, z: 9.25, yaw: Math.PI, lid: 0 }} still />
    <Character look={NIO} p={{ ...G_NIO, smile: 0.45, lid: 0.25, brow: 0.2 }} onHead={<Sauce />} /></Market></PixelShot>;
  return null;
};
