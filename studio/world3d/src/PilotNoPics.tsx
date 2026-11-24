// PILOT — "No Pics" (episodes/pilot3/room/03-script.md)
// The morning after his own party, Nio was the life of it and has zero photos. The group chat's only reply is
// "who is this". PXI finds the 38 photos he's in, and the same guy in a beanie is behind him in every one. That guy has
// been standing in the corner of Nio's room since the first shot.
// Direction: hard cuts, no dead air except the two held takes that ARE the jokes; faces carry every beat.
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { frame } from './lib/frame';
import { EXTRAS } from './world/Exterior';
import { Character, NIO, Look, Pose, headPos } from './world/Character';
import { Room } from './world/Room';
import { GlowStick } from './world/Hallway';
import { useNoPicsScreens } from './ui/NoPicsScreens';
import { t12, sp, keys, blink, breathe, nz } from './lib/motion';
import { Solid, toon, flat, sph, cyl, rbox, plane } from './lib/toon';
import { PhoneInHand, Insert, Card, toScreen } from './PilotNotMe';
import { voFor, voTalk } from './PilotNoEvidence';

// ---------------------------------------------------------------- cast
export const DEV: Look = { skin: '#6e4632', skinShade: '#55352a', hair: '#141011', hairDark: '#141011', iris: '#2a160c', top: '#3c4f86', topDark: '#2f3f6c',
  pants: '#2b2a33', shoes: '#efe6d2', shape: 'round', hairStyle: 'crop', build: 1.05 };
export const BEANIE: Look = { skin: '#e7cdbd', skinShade: '#c9ab99', hair: '#3a2a22', hairDark: '#3a2a22', iris: '#3f4a52', top: '#6b6e74', topDark: '#55585e',
  pants: '#2f3036', shoes: '#2a2a2e', shape: 'long', hairStyle: 'crop', build: 0.95, height: 1.08 };
const CROWD = (i: number): Look => ({ ...EXTRAS[i % EXTRAS.length], top: ['#5f8f5a', '#d9a441', '#3f6f8f', '#c75a4a', '#8f4f7f', '#4f7a8a'][(i * 5) % 6] });

// ---------------------------------------------------------------- speech (subtitles; voices are wired by key on the voice branch)
type Who = 'nio' | 'dev' | 'maya' | 'beanie';
/** Plays the approved voice for `text` (looked up by its words) and burns in the subtitle; `subs` splits a long line. */
export const Say: React.FC<{ t: number; who: Who; at: number; text: string; until?: number; y?: number; subs?: [number, string][] }> = ({ t, who, at, text, until, y, subs }) => {
  const l = voFor(text);
  const color = who === 'nio' ? '#ffffff' : who === 'beanie' ? '#c9d3dc' : '#ffd98a';
  const hold = Math.min(until ?? 99, Math.max(1, l.dur + 0.3));
  const parts = subs ?? [[0, text]];
  const cur = parts.filter(([o]) => t > at + o).pop();
  return (<>
    <Sequence from={Math.round(at * 24)} durationInFrames={Math.ceil(l.dur * 24) + 2} layout="none"><Audio src={staticFile(l.file)} /></Sequence>
    {t > at && t < at + hold && cur && <Sub text={cur[1]} y={y} color={color} />}
  </>);
};

// ---------------------------------------------------------------- props
const Heel: React.FC = () => (
  <group position={[0, -0.06, 0.03]} rotation={[0.3, 0, 0.4]}>
    <Solid geo={rbox(0.05, 0.03, 0.17, 0.012)} mat={toon('#c23a52')} position={[0, 0.02, 0]} rotation={[0.35, 0, 0]} line={0.006} />
    <Solid geo={cyl(0.008, 0.005, 0.09, 8)} mat={toon('#c23a52')} position={[0, -0.03, -0.07]} line={0.005} />
  </group>
);
const BeanieHat: React.FC = () => (
  <group position={[0, 0.06, -0.005]}>
    <Solid geo={sph(0.172, 32, 16, 0, Math.PI / 2)} mat={toon('#2c2d33')} scale={[1, 0.95, 1.02]} line={0.01} />
    <Solid geo={cyl(0.175, 0.175, 0.05, 32)} mat={toon('#24252a')} position={[0, 0.0, 0]} line={0.008} />
  </group>
);
const Bowl: React.FC = () => (
  <group position={[0, -0.07, 0.04]}>
    <Solid geo={sph(0.07, 20, 10, Math.PI / 2, Math.PI / 2)} mat={toon('#e9e1d3')} rotation={[Math.PI, 0, 0]} line={0.006} />
    <mesh geometry={cyl(0.066, 0.066, 0.005, 20)} material={flat('#f4ecd6')} position={[0, -0.005, 0]} />
  </group>
);
/** A fridge, door hinged on its left; open 0..1, light inside when open. Front faces +z. */
export const Fridge: React.FC<{ open?: number; color?: string }> = ({ open = 0, color = '#e8e6e0' }) => (
  <group>
    <Solid geo={rbox(0.7, 1.7, 0.65, 0.03)} mat={toon(color)} position={[0, 0.85, 0]} line={0.01} />
    <mesh geometry={plane(0.6, 1.0)} position={[0, 1.05, 0.326]} material={toon('#f6f4ee', '#fff6d8', open * 1.4)} />
    {[0.75, 1.05, 1.3].map((y) => <mesh key={y} geometry={rbox(0.6, 0.015, 0.5, 0.004)} position={[0, y, 0.06]} material={flat('#d8dde2')} />)}
    <Solid geo={rbox(0.06, 0.14, 0.08, 0.01)} mat={toon('#c23a3a')} position={[-0.15, 0.82, 0.1]} line={0.005} />
    <Solid geo={cyl(0.035, 0.035, 0.16, 10)} mat={toon('#f0e2a0')} position={[0.12, 1.12, 0.1]} line={0.005} />
    {/* door: freezer line + handle */}
    <group position={[-0.35, 0, 0.33]} rotation={[0, -open * 1.9, 0]}>
      <Solid geo={rbox(0.7, 1.68, 0.05, 0.02)} mat={toon(color)} position={[0.35, 0.85, 0.02]} line={0.01} />
      <mesh geometry={rbox(0.68, 0.012, 0.01, 0.004)} position={[0.35, 1.25, 0.05]} material={flat('#b8b6b0')} />
      <Solid geo={rbox(0.03, 0.3, 0.03, 0.01)} mat={toon('#9a9894')} position={[0.62, 1.0, 0.07]} line={0.006} />
    </group>
    {open > 0.05 && <pointLight position={[0, 1.1, 0.5]} intensity={1.6 * open} distance={1.6} decay={1.5} color="#f4f8ff" />}
  </group>
);

// ---------------------------------------------------------------- staging
const FLOOR = { y: -0.55, legL: { hip: 1.25, knee: 1.9 }, legR: { hip: 1.1, knee: 1.75 } };
const SIT = { y: -0.16, legL: { hip: 1.5, knee: 1.5 }, legR: { hip: 1.5, knee: 1.5 } };
const NIO_FLOOR: Pose = { x: -0.5, z: 0.85, yaw: 0, ...FLOOR, lean: -0.2 };
const NIO_BED: Pose = { x: -0.25, z: 0.62, yaw: 0, ...SIT };
const BEANIE_CORNER: Pose = { x: 1.82, z: -1.12, yaw: -0.55 };
const BEANIE_BEHIND: Pose = { x: 0.12, z: -0.2, yaw: -0.1, ...SIT };   // sitting on the bed right behind him
const FRIDGE_AT: [number, number, number] = [1.82, 0, 1.35];
const HEEL_ARM = { sx: -1.0, sz: 0.25, el: 1.95 };      // heel held on his chest like a trophy
const LOOSE = { sx: -0.15, sz: 0.2, el: 0.4 };
const WIPE = { sx: -1.25, sz: 0.1, el: 2.4 };            // back of the wrist to the eye

const NiosRoom: React.FC<{ children: React.ReactNode; beanie?: Pose | null; t?: number; fridgeOpen?: number }> = ({ children, beanie = BEANIE_CORNER, t = 0 }) => (
  <Room curtain={0.7} lampOn={1}>
    <group position={FRIDGE_AT} rotation={[0, -Math.PI / 2, 0]}><Fridge /></group>
    {beanie && <Character look={BEANIE} p={{ ...beanie, lid: 0.15 + blink(t, [2.9]), eyeX: 0, smile: 0 }} onHead={<BeanieHat />} />}
    {children}
  </Room>
);

/** Dev's kitchen, another city: a teal wall, a table, his fridge. */
const DevKitchen: React.FC<{ children: React.ReactNode; open?: number; pov?: boolean }> = ({ children, open = 0, pov = false }) => (
  <group>
    <ambientLight intensity={1.5} color="#d6ccc6" />
    <hemisphereLight args={['#c8c4d8', '#5a4640', 0.9]} />
    <directionalLight position={[1.5, 3, 2]} intensity={1.0} color="#ffe6c8" />
    <mesh geometry={plane(6, 3)} position={[0, 1.5, -1.2]} material={toon('#4f7d7a')} />
    <mesh geometry={plane(6, 6)} rotation={[-Math.PI / 2, 0, 0]} material={toon('#8a7a6a')} />
    <Solid geo={rbox(1.4, 0.92, 0.6, 0.02)} mat={toon('#d8cbb0')} position={[-1.5, 0.46, -0.9]} line={0.01} />
    {!pov && <group position={[1.1, 0, -0.85]}><Fridge open={open} color="#d9dde2" /></group>}
    {pov && <mesh geometry={plane(6, 3)} position={[0, 1.5, 2.6]} rotation={[0, Math.PI, 0]} material={toon('#4f7d7a')} />}
    {pov && <Solid geo={rbox(1.6, 2.1, 0.5, 0.02)} mat={toon('#c9b48e')} position={[2.2, 1.05, 2.3]} line={0.01} />}
    {pov && <group position={[1.1, 0, -0.62]}>
      {/* seen from inside: shelf edges, a jar, the door frame opening around the lens */}
      {[0.98, 1.72].map((y) => <mesh key={y} geometry={rbox(0.9, 0.02, 0.3, 0.004)} position={[0, y, 0]} material={flat('#e6eaee')} />)}
      <Solid geo={cyl(0.06, 0.06, 0.22, 12)} mat={toon('#f0e2a0')} position={[-0.3, 1.1, 0.02]} line={0.005} />
      <Solid geo={rbox(0.1, 0.24, 0.08, 0.01)} mat={toon('#c23a3a')} position={[0.32, 1.84, 0.02]} line={0.005} />
      {[-0.42, 0.42].map((x) => <mesh key={x} geometry={rbox(0.06, 1.8, 0.3, 0.004)} position={[x, 0.95, 0]} material={flat('#dfe3e7')} />)}
    </group>}
    <Solid geo={rbox(0.9, 0.05, 0.7, 0.015)} mat={toon('#7a5236')} position={[0, 0.74, 0.55]} line={0.01} />
    {children}
  </group>
);
const DEV_SEAT: Pose = { x: 0, z: 0.0, yaw: 0, ...SIT, y: -0.08 };

// ---------------------------------------------------------------- shots
const S = (C: React.FC<{ t: number; f: number }>) => () => { const f = useCurrentFrame(); return <C t={t12(f)} f={f} />; };
/** One half of a split-screen call; the 9:16 shot is clipped to its middle. */
const Half: React.FC<{ top: boolean; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: top ? 0 : 960, height: 960, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -480, height: 1920 }}>{children}</div>
  </div>
);
const Seam: React.FC = () => <div style={{ position: 'absolute', left: 0, right: 0, top: 954, height: 12, background: '#151216' }} />;

const nioFloorFace = (t: number, o: Partial<Pose> = {}): Pose => ({ ...NIO_FLOOR, breathe: breathe(t), armL: HEEL_ARM, armR: LOOSE, ...o });
const NioCallHalf: React.FC<{ t: number; p: Partial<Pose> }> = ({ t, p }) => {
  const nio = nioFloorFace(t, { armR: { sx: -1.2, sz: -0.2, el: 1.7 }, headPitch: -0.05, ...p });
  const h = headPos(nio, NIO);
  const f = frame(h, 'mcu', 0, { eyeAt: 0.5, up: 0.02 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<><PhoneInHand on={1} /><GlowStick /></>} /></NiosRoom></PixelShot>;
};
const DevCallHalf: React.FC<{ t: number; p: Partial<Pose> }> = ({ t, p }) => {
  const dev: Pose = { ...DEV_SEAT, breathe: breathe(t + 1), armL: { sx: -0.9, sz: 0.3, el: 1.6 }, armR: { sx: -1.1, sz: -0.2, el: 1.9 }, lid: 0.35 + blink(t, [1.3, 3.1]), ...p };
  const h = headPos(dev, DEV);
  const f = frame(h, 'mcu', 0, { eyeAt: 0.5, up: 0.02 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><DevKitchen><Character look={DEV} p={dev} handL={<Bowl />} /></DevKitchen></PixelShot>;
};

// S1 HOOK: wide. Slumped against his bed on the rug, grinning at the ceiling. The room is spotless. The guy in the corner.
const S1 = S(({ t }) => {
  const nio = nioFloorFace(t, { headPitch: -0.32, eyeY: 0.7, smile: 1, lid: 0.3 + blink(t, [1.9]), brow: -0.2, browUp: 0.3, mouth: voTalk(t, 0.45, 'i was the life of it.') });
  const push = sp(t, 0.1, 'lazy');
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[-1.35 + push * 0.1, 1.7 - push * 0.1, 3.5 - push * 0.3]} at={[0.25, 0.7, -0.15]} fov={58} />
        <NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<GlowStick />} /></NiosRoom></PixelShot>
      <Say t={t} who="nio" at={0.45} text="i was the life of it." />
    </AbsoluteFill>
  );
});

// S2 CALL: split screen. Dev, mouth full of cereal.
const S2 = S(({ t }) => (
  <AbsoluteFill>
    <Half top><NioCallHalf t={t} p={{ smile: keys(t, [[0, 0.9], [1.6, 0.25, 'sheet']]), lid: 0.25, eyeY: -0.2, brow: t > 1.6 ? 0.2 : -0.1 }} /></Half>
    <Half top={false}><DevCallHalf t={t} p={{ mouth: Math.max(voTalk(t, 0.45, "pics or it didn't happen."), (Math.sin(t * 9) > 0.3 && t < 0.4) ? 0.3 : 0), smirk: 0.3, brow: 0.3 }} /></Half>
    <Seam />
    <Say t={t} who="dev" at={0.45} text="pics or it didn't happen." y={1700} />
  </AbsoluteFill>
));

// S3 INSERT: camera roll. The newest photo: pasta. Three weeks ago.
const S3 = S(({ t }) => {
  const s = useNoPicsScreens();
  return <Insert screen={s?.roll} tap={[195, 160]} tapK={keys(t, [[0, 0.6], [0.4, 0, 'lazy']])} />;
});

// S4 INSERT: the group chat. Sent. Seen by 41. One reply.
const S4 = S(({ t }) => {
  const s = useNoPicsScreens();
  const scr = t < 0.6 ? s?.chat0 : t < 1.3 ? s?.chat1 : t < 2.6 ? s?.chat2 : s?.chat3;
  return <Insert screen={scr} tap={[350, 760]} tapK={keys(t, [[0, 0.3], [0.45, 1, 'snap'], [0.7, 0.2, 'lazy']])} press={t > 0.45 && t < 0.6 ? 1 : 0} />;
});

// S5 CU: his face. The held take.
const S5 = S(({ t }) => {
  const nio = nioFloorFace(t, { headPitch: 0.15, eyeY: -0.5, lid: 0.45 + blink(t, [1.0]) * 0.5, smile: -0.15, brow: 0.15 });
  const f = frame(headPos(nio, NIO), 'cu', 0, { up: 0.03 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<><PhoneInHand on={1} /><GlowStick /></>} /></NiosRoom></PixelShot>;
});

// S6 INSERT: Maya's voice note, playing.
const S6 = S(({ t }) => {
  const s = useNoPicsScreens();
  const k = Math.min(8, Math.floor(t / 0.55));
  return (
    <AbsoluteFill>
      <Insert screen={s?.[`voice${k}`]} tap={[64, 408]} tapK={keys(t, [[0, 0.8], [0.25, 0.1, 'lazy']])} press={t < 0.2 ? 1 : 0} />
      <Say t={t} who="maya" at={0.25} text="you danced on the fridge for an hour. nobody's posting that. also you have my shoe."
        subs={[[0, "you danced on the fridge for an hour."], [2.1, "nobody's posting that."], [3.5, 'also you have my shoe.']]} />
    </AbsoluteFill>
  );
});

// S7 MCU: he looks down at the heel in his hand. Then back up.
const S7 = S(({ t }) => {
  const look = keys(t, [[0, 0], [0.2, 1, 'snap'], [1.0, 0, 'sheet']]);
  const nio = nioFloorFace(t, { headPitch: 0.35 * look, eyeY: -0.9 * look, eyeX: 0.4 * look, lid: 0.3, brow: 0.35 * look, browUp: 0.4 * look, smile: 0 });
  const f = frame(headPos(nio, NIO), 'ms', 0, { up: 0.1 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<><PhoneInHand on={1} /><GlowStick /></>} /></NiosRoom></PixelShot>;
});

// S8 CALL: "you get anybody's number?" / the fridge has a light inside.
const S8 = S(({ t }) => (
  <AbsoluteFill>
    <Half top><NioCallHalf t={t} p={{ mouth: voTalk(t, 1.85, 'bro. the fridge has a light inside.'), lid: 0.2, eyeY: 0.1, browUp: t > 1.7 ? 0.6 : 0, brow: t > 1.7 ? -0.3 : 0, wide: t > 1.7 ? 0.15 : 0, smile: 0.1 }} /></Half>
    <Half top={false}><DevCallHalf t={t} p={{ mouth: voTalk(t, 0.2, "you get anybody's number?"), lid: t > 2.4 ? 0.1 : 0.35, browUp: t > 2.8 ? 0.5 : 0, eyeY: 0.1 }} /></Half>
    <Seam />
    <Say t={t} who="dev" at={0.2} text="you get anybody's number?" y={1700} until={1.8} />
    <Say t={t} who="nio" at={1.85} text="bro. the fridge has a light inside." y={700} />
  </AbsoluteFill>
));

// S9 CALL: "like when you open it?" / "every time."
const S9 = S(({ t }) => (
  <AbsoluteFill>
    <Half top><NioCallHalf t={t} p={{ mouth: voTalk(t, 1.3, 'every time.'), lid: 0.35, eyeY: 0, smile: 0.05, brow: -0.1 }} /></Half>
    <Half top={false}><DevCallHalf t={t} p={{ mouth: voTalk(t, 0.15, 'like when you open it?'), lid: 0, wide: 0.4, browUp: 0.8, eyeY: 0.1, armR: { sx: -0.3, sz: -0.1, el: 0.6 } }} /></Half>
    <Seam />
    <Say t={t} who="dev" at={0.15} text="like when you open it?" y={1700} until={1.25} />
    <Say t={t} who="nio" at={1.3} text="every time." y={700} />
  </AbsoluteFill>
));

// S10 FRIDGE POV (Dev's kitchen): the door opens on Dev, lit up, staring in. He forgets the call.
const S10 = S(({ t }) => {
  const open = sp(t, 0.3, 'sheet');
  const dev: Pose = { x: 1.15, z: 0.0, yaw: Math.PI, armL: { sx: -1.1, sz: 0.2, el: 0.4 }, armR: { sx: -0.2, sz: 0.1, el: 0.3 }, lid: 0, wide: 0.5 * open, browUp: 0.9 * open, mouth: 0.25 * open, eyeY: 0.2 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[1.1, 1.35, -0.75]} at={[1.12, 1.4, 0.4]} fov={60} />
        <DevKitchen open={open} pov><Character look={DEV} p={dev} handR={<PhoneInHand on={1} />} />
          <pointLight position={[1.1, 1.3, -0.6]} intensity={2.2 * open} distance={1.6} decay={1.2} color="#eef4ff" /></DevKitchen></PixelShot>
      {t > 2.2 && <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: 'Pixelify', fontWeight: 700, fontSize: 54, color: '#fff',
        textShadow: '0 6px 0 #151216, 0 -6px 0 #151216, 6px 0 0 #151216, -6px 0 0 #151216' }}>call ended</div>}
    </AbsoluteFill>
  );
});

// S11 MS: back on his bed edge. The glow stick goes out. "i was busy dancing." The wipe. "i'm just tired."
const S11 = S(({ t }) => {
  const wipe = keys(t, [[0, 0], [2.0, 1, 'snap'], [2.55, 0, 'sheet']]);
  const nio: Pose = { ...NIO_BED, breathe: breathe(t) * 0.5, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: wipe > 0.05 ? WIPE : { sx: -0.35, sz: -0.1, el: 1.1 },
    headPitch: 0.25 - wipe * 0.1, eyeY: -0.6, brow: -0.8, browUp: 0.5, smile: -0.7, lid: 0.35 + wipe * 0.4 + blink(t, [1.2]) * 0.6, mouth: Math.max(voTalk(t, 0.4, 'i was busy dancing.'), voTalk(t, 2.6, "i'm just tired.")) };
  const f = frame(headPos(nio, NIO), 'mcu', 0, { up: 0.05 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<GlowStick color={t < 0.25 ? '#9dff8a' : '#3a4a3a'} />} /></NiosRoom></PixelShot>
      <Say t={t} who="nio" at={0.4} text="i was busy dancing." until={2.0} />
      <Say t={t} who="nio" at={2.6} text="i'm just tired." />
    </AbsoluteFill>
  );
});

// S12 WIDE: "same." from the corner. Nio's head does not move. Only his eyes.
const S12 = S(({ t }) => {
  const nio: Pose = { ...NIO_BED, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: { sx: -0.35, sz: -0.1, el: 1.1 }, headPitch: 0.15, eyeY: -0.2,
    eyeX: keys(t, [[0, 0], [1.2, 0.95, 'snap']]), lid: 0.3, brow: 0.1, smile: -0.2 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[-0.6, 1.4, 2.9]} at={[0.55, 0.95, -0.4]} fov={46} />
        <NiosRoom t={t}><Character look={NIO} p={nio} handL={<Heel />} handR={<GlowStick color="#3a4a3a" />} /></NiosRoom></PixelShot>
      <Say t={t} who="beanie" at={0.35} text="same." />
    </AbsoluteFill>
  );
});

// S13 INSERT: buzz. PXI: You might be in 38 photos.
const S13 = S(({ t }) => {
  const s = useNoPicsScreens();
  return <Insert screen={s?.lock} buzz={t < 0.5 ? Math.sin(t * 90) : 0}>{s && <Card tex={s.card} k={sp(t, 0.15, 'pop')} />}</Insert>;
});

// S14 INSERT: the album fills. Fridge. Dance circle. Then the newest: "just now", a selfie by the guy, Nio crying behind.
const Tile: React.FC<{ tex: any; px: number; py: number; w: number; h: number; k: number }> = ({ tex, px, py, w, h, k }) => {
  const [x, y, z] = toScreen(px + w / 2, py + h / 2);
  const s = Math.min(1, k);
  return k > 0.01 ? <mesh position={[x, y, z + 0.0004]} scale={[s, s, 1]}><planeGeometry args={[(w / 390) * 0.066, (h / 844) * 0.142]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh> : null;
};
const S14 = S(({ t }) => {
  const s = useNoPicsScreens();
  const big = sp(t, 2.6, 'snap');
  return (
    <Insert screen={s?.album} tap={[100, 300]} tapK={keys(t, [[0, 0.5], [0.3, 0, 'lazy']])}>
      {s && <>
        <Tile tex={s.tile_fridge} px={16} py={186} w={176} h={235} k={sp(t, 0.2, 'pop')} />
        <Tile tex={s.tile_circle} px={198} py={186} w={176} h={235} k={sp(t, 0.6, 'pop')} />
        <Tile tex={s.tile_pasta} px={16} py={428} w={176} h={235} k={0} />
        <Tile tex={s.tile_selfie} px={16 + big * -4} py={428 - big * 250} w={176 + big * 182} h={235 + big * 245} k={sp(t, 1.4, 'pop')} />
      </>}
    </Insert>
  );
});

// S15 MCU: still not turning. "who are you?" The guy is right behind him now, sharp.
const S15 = S(({ t }) => {
  const nio: Pose = { ...NIO_BED, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: { sx: -0.9, sz: -0.2, el: 1.5 }, headPitch: 0.05, eyeX: 0.85, eyeY: 0, lid: 0.35, brow: 0.35, smile: -0.1,
    mouth: voTalk(t, 0.3, 'who are you?') };
  const beanie: Pose = { ...BEANIE_BEHIND, lid: 0.15, eyeX: -0.2, mouth: voTalk(t, 1.4, "i'm 'who is this.'") * 0.6, smile: 0.1 };
  const h = headPos(nio, NIO);
  const f = frame(h, 'ms', 0, { up: 0.1, side: -0.3 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><NiosRoom t={t} beanie={null}>
        <Character look={NIO} p={nio} handL={<Heel />} handR={<PhoneInHand on={1} />} />
        <Character look={BEANIE} p={beanie} onHead={<BeanieHat />} /></NiosRoom></PixelShot>
      <Say t={t} who="nio" at={0.3} text="who are you?" until={1.35} />
      <Say t={t} who="beanie" at={1.4} text="i'm 'who is this.'" />
    </AbsoluteFill>
  );
});

// S16 CU to the lens: "anyway. this my app, yo." / "it's free." / "saturday. my place." / "i'll know if you're there." The flash.
const S16 = S(({ t }) => {
  const eerie = sp(t, 5.6, 'lazy');
  const raise = sp(t, 7.5, 'snap');
  const nio: Pose = { ...NIO_BED, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: { sx: -0.9, sz: -0.2, el: 1.5 }, headPitch: 0.02 + eerie * 0.12, eyeY: eerie * 0.35,
    lid: 0.25 + eerie * 0.25 + blink(t, [2.3]), smile: 0.35 + eerie * 0.15, smirk: 0.5 * eerie, brow: eerie * 0.35, browUp: t < 2.3 ? 0.5 : 0,
    mouth: Math.max(voTalk(t, 0.15, 'anyway. this my app, yo.'), voTalk(t, 3.3, 'saturday. my place.'), voTalk(t, 5.9, "i'll know if you're there.") * 0.7) };
  const beanie: Pose = { ...BEANIE_BEHIND, lid: 0.15, mouth: voTalk(t, 2.45, "it's free.") * 0.6, armR: { sx: -1.1 * raise, sz: -0.1, el: 0.6 * raise } };
  const h = headPos(nio, NIO);
  const f0 = frame(h, 'mcu', 0, { up: 0.04, side: -0.3 }), f1 = frame(h, 'cu', 0, { up: 0.02, side: -0.2 });
  const k = sp(t, 5.4, 'lazy');
  const lerp = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={lerp(f0.pos, f1.pos)} at={lerp(f0.at, f1.at)} fov={f0.fov} /><NiosRoom t={t} beanie={null}>
        <Character look={NIO} p={nio} handL={<Heel />} handR={<PhoneInHand on={1} />} />
        <Character look={BEANIE} p={beanie} onHead={<BeanieHat />} handR={<PhoneInHand on={1} />} /></NiosRoom></PixelShot>
      <Say t={t} who="nio" at={0.15} text="anyway. this my app, yo." until={2.3} />
      <Say t={t} who="beanie" at={2.45} text="it's free." until={3.2} />
      <Say t={t} who="nio" at={3.3} text="saturday. my place." until={5.6} />
      <Say t={t} who="nio" at={5.9} text="i'll know if you're there." />
    </AbsoluteFill>
  );
});

// S17 BUTTON: flash, the picture slices sideways, then dissolves into pixels. Black.
const S17 = S(({ t, f }) => {
  const nio: Pose = { ...NIO_BED, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, armR: { sx: -0.9, sz: -0.2, el: 1.5 }, headPitch: 0.14, eyeY: 0.35, lid: 0.5, smile: 0.5, smirk: 0.5, brow: 0.35 };
  const beanie: Pose = { ...BEANIE_BEHIND, lid: 0.15, armR: { sx: -1.1, sz: -0.1, el: 0.6 } };
  const h = headPos(nio, NIO);
  const fr = frame(h, 'cu', 0, { up: 0.02, side: -0.2 });
  const flash = Math.max(0, 1 - f / 5);
  const g = Math.min(1, f / 10);
  const dissolve = Math.max(0, (f - 12) / 20);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${nz(1, Math.floor(f / 2)) * 40 * g}px)`, filter: g > 0.3 ? 'saturate(1.6) contrast(1.3)' : undefined }}>
        <PixelShot glitch={g}><Cam pos={fr.pos} at={fr.at} fov={fr.fov} /><NiosRoom t={t} beanie={null}>
          <Character look={NIO} p={nio} handL={<Heel />} handR={<PhoneInHand on={1} />} />
          <Character look={BEANIE} p={beanie} onHead={<BeanieHat />} handR={<PhoneInHand on={1} />} /></NiosRoom></PixelShot>
      </div>
      {/* pixel dissolve: blocks go black in a seeded order */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gridTemplateRows: 'repeat(32, 1fr)' }}>
        {Array.from({ length: 18 * 32 }).map((_, i) => <div key={i} style={{ background: (nz(i, 3) + 1) / 2 < dissolve ? '#000' : 'transparent' }} />)}
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
    </AbsoluteFill>
  );
});

export const NP_SHOTS: [string, React.FC, number][] = [
  ['S1', S1, 64], ['S2', S2, 60], ['S3', S3, 54], ['S4', S4, 96], ['S5', S5, 34], ['S6', S6, 136], ['S7', S7, 34],
  ['S8', S8, 116], ['S9', S9, 66], ['S10', S10, 72], ['S11', S11, 112], ['S12', S12, 58],
  ['S13', S13, 54], ['S14', S14, 100], ['S15', S15, 80], ['S16', S16, 200], ['S17', S17, 36],
];
const START = NP_SHOTS.reduce<number[]>((a, [, , d], i) => (a.push(i ? a[i - 1] + NP_SHOTS[i - 1][2] : 0), a), []);
export const NP_STARTS = START;
export const NP_LEN = START[START.length - 1] + NP_SHOTS[NP_SHOTS.length - 1][2] + 18;
const at = (id: string, s = 0) => START[NP_SHOTS.findIndex(([k]) => k === id)] + Math.round(s * 24);
const end = (id: string) => at(id) + NP_SHOTS[NP_SHOTS.findIndex(([k]) => k === id)][2];

type Cue = [string, number, number, number];
const CUES = (): Cue[] => [
  ['sfx/ne_room.wav', 0, at('S6') - 0, 0.7],
  ['sfx/buzz.wav', at('S2') - 8, 0, 0.7],
  ['sfx/ne_tap.wav', at('S4', 0.45), 0, 0.9], ['sfx/ne_tap.wav', at('S3', 0.05), 0, 0.6],
  ['sfx/ne_marker.wav', at('S4', 1.3), 0, 0.4],
  ['sfx/ne_tap.wav', at('S6', 0.05), 0, 0.8],
  ['sfx/ne_room.wav', at('S7'), end('S9') - at('S7'), 0.7],
  ['sfx/ne_thump.wav', at('S10', 0.3), 0, 0.5],
  ['sfx/ne_pad.wav', at('S11'), end('S12') - at('S11'), 0.8],
  ['sfx/buzz.wav', at('S13'), 0, 0.9], ['sfx/ne_chime.wav', at('S13', 0.15), 0, 0.9],
  ['sfx/ne_tap.wav', at('S14', 0.2), 0, 0.5], ['sfx/ne_tap.wav', at('S14', 0.6), 0, 0.5], ['sfx/ne_tap.wav', at('S14', 1.4), 0, 0.6],
  ['sfx/ne_night.wav', at('S15'), end('S17') - at('S15'), 0.7],
  ['sfx/shutter.wav', at('S17'), 0, 1.0], ['sfx/ne_thump.wav', at('S17', 0.4), 0, 0.9],
];

export const PilotNoPics: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Fonts />
    {NP_SHOTS.map(([id, C, d], i) => <Sequence key={id} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    {CUES().map(([src, from, d, v], i) => <Sequence key={i} from={Math.max(0, from)} durationInFrames={d || undefined} layout="none"><Audio src={staticFile(src)} volume={v} /></Sequence>)}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- the in-show photos (rendered into public/photos/np_*.png)
const Crowd: React.FC<{ spots: [number, number][]; phones?: boolean; t?: number }> = ({ spots, phones = true, t = 0.3 }) => <>{spots.map(([x, z], i) =>
  <Character key={i} look={CROWD(i)} p={{ x, z, yaw: Math.atan2(-x, -z + 0.4) * 0.6 + Math.PI * (z > 0.9 ? 1 : 0), smile: 0.9, lid: 0.2, mouth: i % 3 ? 0.6 : 0,
    armR: phones && i % 2 === 0 ? { sx: -1.4, sz: -0.12, el: 0.8 } : { sx: -2.6, sz: 0.3, el: 0.4 }, armL: { sx: -2.4 + nz(i, t) * 0.3, sz: 0.25, el: 0.4 } }}
    handR={phones && i % 2 === 0 ? <PhoneInHand on={1} /> : undefined} />)}</>;
const NightRoom: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Room curtain={0} lampOn={1}>
    <group position={FRIDGE_AT} rotation={[0, -Math.PI / 2, 0]}><Fridge /></group>
    <pointLight position={[0, 2.2, 1]} intensity={1.6} distance={5} color="#ff7ad8" />
    <pointLight position={[1.4, 2.0, 0.2]} intensity={1.4} distance={4} color="#6ad8ff" />
    {children}
  </Room>
);
export const NoPicsPhoto: React.FC<{ which: string }> = ({ which }) => {
  const R = (cam: { pos: [number, number, number]; at: [number, number, number]; fov: number }, kids: React.ReactNode, night = true) => (
    <PixelShot res={[360, 640]}><Cam pos={cam.pos} at={cam.at} fov={cam.fov} />{night ? <NightRoom>{kids}</NightRoom> : <NiosRoom beanie={null}>{kids}</NiosRoom>}</PixelShot>
  );
  const party = { smile: 1, lid: 0.15, mouth: 0.8, browUp: 0.4 };
  switch (which) {
    case 'pasta': return (
      <PixelShot res={[360, 640]}><Cam pos={[0, 1.0, 0.01]} at={[0, 0, 0]} fov={40} />
        <ambientLight intensity={1.8} /><directionalLight position={[1, 2, 1]} intensity={1} />
        <mesh geometry={plane(3, 3)} rotation={[-Math.PI / 2, 0, 0]} material={toon('#7a5236')} />
        <Solid geo={cyl(0.22, 0.2, 0.03, 32)} mat={toon('#f0ece4')} position={[0, 0.02, 0]} line={0.008} />
        {Array.from({ length: 70 }).map((_, i) => <Solid key={i} geo={cyl(0.006, 0.006, 0.16, 6)} mat={toon('#ecc865')} position={[nz(i, 1) * 0.11, 0.045 + (i % 4) * 0.006, nz(i, 2) * 0.11]} rotation={[Math.PI / 2, 0, i * 0.7]} line={0.002} />)}
        <Solid geo={sph(0.06)} mat={toon('#c23a3a')} position={[0.01, 0.07, 0]} scale={[1, 0.35, 1]} line={0.004} />
        <Solid geo={sph(0.02)} mat={toon('#5f8f5a')} position={[0.02, 0.09, 0.01]} scale={[1.4, 0.3, 1]} line={0.003} />
      </PixelShot>);
    case 'fridge': {   // Nio dancing on top of his fridge, arms up; the crowd below, phones up; the beanie guy behind him, looking at the lens
      const nio: Pose = { x: FRIDGE_AT[0], z: FRIDGE_AT[2], y: 1.7, yaw: -1.1, ...party, armL: { sx: -2.8, sz: 0.4, el: 0.3 }, armR: { sx: -2.6, sz: 0.5, el: 0.6 }, headTilt: 0.2, legL: { hip: 0.3, knee: 0.5 } };
      return R({ pos: [0.1, 1.55, 3.4], at: [1.55, 1.75, 1.2], fov: 56 }, <>
        <Character look={NIO} p={nio} handR={<GlowStick />} />
        <Crowd spots={[[0.9, 1.0], [0.5, 1.6], [1.0, 2.1], [0.2, 0.6], [1.3, 0.2]]} />
        <Character look={BEANIE} p={{ x: 1.3, z: 0.75, yaw: -0.74, lid: 0.15 }} onHead={<BeanieHat />} />
      </>);
    }
    case 'circle': {
      const nio: Pose = { x: 0.2, z: 0.6, yaw: 0.2, ...party, armL: { sx: -2.7, sz: 0.3, el: 0.3 }, armR: { sx: -1.2, sz: -0.6, el: 1.2 }, headTilt: -0.2, lean: 0.15, legR: { hip: 0.6, knee: 0.9 } };
      return R({ pos: [0.3, 1.5, 2.9], at: [0.2, 1.0, 0.4], fov: 50 }, <>
        <Character look={NIO} p={nio} handR={<GlowStick />} />
        <Crowd spots={[[-0.9, 0.9], [1.2, 0.9], [-0.6, -0.2], [1.0, -0.1], [-1.3, 0.2], [1.6, 0.4]]} phones={false} />
        <Character look={BEANIE} p={{ x: 0.35, z: -0.25, yaw: 0, lid: 0.15 }} onHead={<BeanieHat />} />
      </>);
    }
    case 'selfie': {   // the guy's selfie, this morning: him, blank, filling the frame; Nio on the bed behind, wiping his eye
      const nio: Pose = { ...NIO_BED, armR: WIPE, armL: { sx: -0.55, sz: 0.15, el: 1.3 }, headPitch: 0.2, eyeY: -0.6, brow: -0.8, browUp: 0.5, smile: -0.7, lid: 0.7 };
      const b: Pose = { x: 1.0, z: 1.7, yaw: 0.25, lid: 0.15, smile: 0.05, armR: { sx: -1.4, sz: -0.3, el: 0.6 } };
      return R({ pos: [1.2, 1.5, 2.45], at: [0.25, 1.05, 0.7], fov: 62 }, <>
        <Character look={NIO} p={nio} handL={<Heel />} />
        <Character look={BEANIE} p={b} onHead={<BeanieHat />} />
      </>, false);
    }
    default: return null;
  }
};
