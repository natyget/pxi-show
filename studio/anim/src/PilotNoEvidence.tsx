// PILOT — "No Evidence"
// The morning after the best night of his life, Nio has no photos of it. Forty phones were pointed at him and his own
// died. He goes door to door, then sets up a paid photo-return desk in the lobby, and ends up $65 down with a blur,
// an elbow and the back of his head. Then a note in green pen on his flyer: "I have 61. Same roof, Saturday."
// He opens his laptop and types the thing PXI will be. Tone: grounded, deadpan; he runs a procedure instead of asking.
// Direction: locked-off cameras, hard cuts. Every beat reads with the sound off (burned-in subtitles, inserts, a tally).
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts, Sub } from './lib/Pixel';
import { frame } from './lib/frame';
import { EXTRAS } from './world/Exterior';
import { Character, NIO, MAYA, Look, Pose, headPos } from './world/Character';
import { Room } from './world/Room';
import { Rooftop } from './world/Rooftop';
import { Hallway, Door, Board, ReturnsDesk, GlowStick, Laptop } from './world/Hallway';
import { useNoEvidenceScreens } from './ui/NoEvidenceScreens';
import { t12, sp, keys, blink, breathe, nz, walk } from './lib/motion';
import { Solid, toon, flat, sph, cyl, rbox, plane } from './lib/toon';
import vo from './vo_pilot.json';
import { talk, on, PhoneInHand, Insert, Card, Slide } from './PilotNotMe';

// ---------------------------------------------------------------- cast
const ex = (o: Partial<Look>): Look => ({ skin: '#c99a7a', skinShade: '#a87b5d', hair: '#1f1a1a', hairDark: '#1f1a1a', iris: '#2a1a12', top: '#3f6f8f',
  topDark: '#345d78', pants: '#2b2a33', shoes: '#efe6d2', shape: 'tri', hairStyle: 'crop', ...o });
/** 3A: answers the door in a towel. Bare chest, bare feet. */
export const TOWEL: Look = ex({ skin: '#e9c9b0', skinShade: '#c9a790', top: '#7d8796', topDark: '#646d7a', pants: '#eef2f4', shoes: '#e9c9b0', hair: '#6a3f24', hairDark: '#6a3f24', shape: 'long', build: 1.05 });
/** 4C: robe, never looks up from her phone. */
export const ROBE: Look = ex({ skin: '#a8765a', skinShade: '#875b43', hair: '#2a1d10', hairDark: '#2a1d10', top: '#d88aa0', topDark: '#b8708a', pants: '#d88aa0', shoes: '#efe6d2', shape: 'round', lashes: true, hoops: true });
/** The "actually" guy. */
export const GUY: Look = ex({ skin: '#efd2bf', skinShade: '#d1ae98', hair: '#c9a46a', hairDark: '#a8844a', top: '#e0b23c', topDark: '#c49a2e', pants: '#3b4258', shape: 'round', build: 1.1, mustache: true });
const TOPS = ['#5f8f5a', '#d9a441', '#3f6f8f', '#c75a4a', '#8f4f7f', '#efe6d2', '#4f7a8a', '#b8604a'];
const crowdLook = (i: number): Look => ({ ...EXTRAS[i % EXTRAS.length], top: TOPS[(i * 3) % TOPS.length], topDark: TOPS[(i * 3) % TOPS.length] });

// ---------------------------------------------------------------- poses
const HOLD = { sx: -0.7, sz: -0.22, el: 1.35 };       // phone held low, reading
const OFFER = { sx: -1.25, sz: -0.15, el: 0.35 };     // arm out, phone shown
const SHOOT = { sx: -1.35, sz: -0.12, el: 0.8 };      // phone up, taking a photo
const FLOOR = { y: -0.55, legL: { hip: 1.25, knee: 1.9 }, legR: { hip: 1.1, knee: 1.75 } };
const CHAIR = { y: -0.08, legL: { hip: 1.5, knee: 1.5 }, legR: { hip: 1.5, knee: 1.5 } };

// ---------------------------------------------------------------- speech: the approved voices + burned-in subtitles
type Who = 'nio' | 'maya' | 'hi' | 'lo';
type VoLine = { file: string; text: string; dur: number; env: number[] };
const VO = vo as Record<string, VoLine>;
const NUMS: Record<string, string> = { '212': 'two hundred and twelve' };
const norm = (s: string) => Object.entries(NUMS).reduce((a, [k, v]) => a.split(k).join(v), s.toLowerCase().replace(/\u2019/g, "'").replace(/\bpxi\b/g, 'pixie')).replace(/[^a-z' ]/g, '').trim();
/** The performed line for a subtitle (studio/voice/clean.py writes vo_pilot.json). Every Say line must have one. */
export const voFor = (text: string): VoLine => {
  const l = Object.values(VO).find((x) => x.text === norm(text));
  if (!l) throw new Error(`no voice line for "${text}"`);
  return l;
};
/** Mouth open amount from the line's own loudness envelope (12 fps). */
export const voTalk = (t: number, at: number, text: string) => {
  const l = voFor(text); const i = Math.floor((t - at) * 12);
  return i < 0 || i >= l.env.length ? 0 : Math.min(1, l.env[i] * 1.3);
};
/** Subtitle is held for the voice plus a beat (at least 1 s); `until` still cuts it where the next line follows. */
export const holdFor = (text: string, d: number) => Math.max(d, 1, voFor(text).dur + 0.25);
export const Say: React.FC<{ t: number; who: Who; at: number; d: number; text: string; seed?: number; until?: number; vol?: number }> = ({ t, who, at, d, text, until, vol = 1 }) => {
  const l = voFor(text);
  return (<>
    <Sequence from={Math.round(at * 24)} durationInFrames={Math.ceil(l.dur * 24) + 2} layout="none"><Audio src={staticFile(l.file)} volume={vol} /></Sequence>
    {t > at && t < at + Math.min(Math.max(until ?? 99, l.dur + 0.1), holdFor(text, d)) && <Sub text={text} color={who === 'nio' ? '#ffffff' : '#ffd98a'} />}
  </>);
};

// ---------------------------------------------------------------- props
const Flash: React.FC<{ k: boolean }> = ({ k }) => (k ? <mesh geometry={sph(0.04, 8, 6)} position={[0, -0.06, -0.03]}><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh> : null);
const Cup: React.FC = () => (<group position={[0, -0.05, 0.05]}><Solid geo={cyl(0.04, 0.03, 0.11, 12)} mat={toon('#c23a3a')} line={0.006} /><mesh geometry={cyl(0.041, 0.041, 0.012, 12)} position={[0, 0.05, 0]} material={flat('#efe6d2')} /></group>);
const Bill: React.FC<{ v: 5 | 20 }> = ({ v }) => <mesh geometry={plane(0.15, 0.07)} rotation={[-Math.PI / 2, 0, 0]} material={flat(v === 20 ? '#7fb07a' : '#a8c89a')} />;
const TowelNeck: React.FC<{ p: Pose }> = ({ p }) => { const h = headPos(p, TOWEL); return <mesh position={[h[0], h[1] - 0.2, h[2] + 0.01]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.11, 0.035, 8, 16]} /><meshToonMaterial color="#eef2f4" /></mesh>; };
const Boxes: React.FC = () => <>{[[0.75, 0.35, 0.5, 0.2], [1.05, 1.0, 0.4, -0.1], [0.2, 1.25, 0.3, 0.4], [1.6, -0.4, 0.45, 0.1]].map(([x, z, s, r], i) =>
  <Solid key={i} geo={rbox(s, s * 0.8, s, 0.01)} mat={toon(i % 2 ? '#b8875a' : '#a87a4e')} position={[x, s * 0.4, z]} rotation={[0, r, 0]} line={0.008} />)}</>;
const Litter: React.FC = () => <>{[[-1.2, 1.4], [0.9, 2.1], [1.6, -0.6], [-0.6, -1.4], [2.4, 1.0]].map(([x, z], i) =>
  <Solid key={i} geo={cyl(0.04, 0.03, 0.11, 10)} mat={toon('#c23a3a')} position={[x, 0.04, z]} rotation={[Math.PI / 2, i * 1.3, 0]} line={0.006} />)}</>;

// ---------------------------------------------------------------- the rooftop party (memory)
const NIO_R: Pose = { x: 0.28, z: 0.6, yaw: -0.4 };
const MAYA_R: Pose = { x: -0.32, z: 0.72, yaw: 0.45 };
const DANCERS: [number, number][] = [[-1.6, -0.9], [-0.7, -1.4], [0.5, -1.2], [1.5, -0.8], [-1.1, -2.3], [0.1, -2.5], [1.2, -2.2], [2.3, -1.6], [-2.4, -1.5]];
const Dancers: React.FC<{ t: number; spots?: [number, number][]; skip?: number[] }> = ({ t, spots = DANCERS, skip = [] }) => <>{spots.map(([x, z], i) => skip.includes(i) ? null :
  <Character key={i} look={crowdLook(i)} p={{ x, z, y: Math.abs(Math.sin(t * 4.6 + i)) * 0.035, yaw: 0.2 * Math.sin(i * 2.1), lid: 0.3, smile: 0.6, headTilt: Math.sin(t * 4.6 + i) * 0.1,
    armL: i % 3 === 0 ? { sx: -2.7, sz: 0.25, el: 0.3 } : { sx: -0.5, sz: 0.2, el: 1.2 }, armR: i % 2 === 0 ? { sx: -2.6, sz: 0.3, el: 0.4 } : { sx: -0.6, sz: 0.25, el: 1.3 } }} />)}</>;
/** The phones: a crowd facing the camera's side, phones up, flashing. */
const PHONERS: [number, number][] = [[-1.5, 2.0], [-0.55, 2.15], [0.4, 2.0], [1.35, 2.15], [-1.0, 2.8], [0.0, 2.95], [0.95, 2.8], [1.9, 2.75], [-2.0, 2.9], [-0.5, 3.6], [0.6, 3.6], [1.5, 3.5]];
const Phoners: React.FC<{ t: number }> = ({ t }) => <>{PHONERS.map(([x, z], i) => {
  const fl = ((t * 3.1 + i * 0.37) % 1) < 0.12 && t > 0.15;
  return <Character key={i} look={crowdLook(i + 3)} p={{ x, z, yaw: Math.PI + Math.atan2(x - 0, z - 0.65) * -0.6, smile: 0.7, lid: 0.2, breathe: breathe(t + i), armR: SHOOT, armL: i % 2 ? { sx: -1.2, sz: 0.3, el: 1.0 } : { sx: -0.3, sz: 0.2, el: 0.4 } }}
    handR={<><PhoneInHand on={1} /><Flash k={fl} /></>} />;
})}</>;

// ---------------------------------------------------------------- staging: room, hallway, lobby
const NIO_FLOOR: Pose = { x: -0.5, z: 0.85, yaw: 0, ...FLOOR };
const NIO_WALL: Pose = { x: -1.55, z: -0.75, yaw: -0.2 };
const PAPER: [number, number, number] = [-1.95, 1.38, -1.575];
const NIO_DESK: Pose = { x: 0, z: -0.5, yaw: 0 };
const DESK_Z = 0.05;
const QUEUE: [number, number][] = [[0.05, 0.78], [0.35, 1.45], [0.62, 2.05], [0.92, 2.65]];
const NIO_CHAIR: Pose = { x: -1.38, z: 0.75, yaw: -Math.PI / 2, ...CHAIR };

// ---------------------------------------------------------------- shots
const S = (C: React.FC<{ t: number; f: number }>) => () => { const f = useCurrentFrame(); return <C t={t12(f)} f={f} />; };
const PhoneLight: React.FC<{ at: [number, number, number] }> = ({ at }) => <pointLight position={at} intensity={0.3} distance={0.9} decay={1.8} color="#bcd4ff" />;

const P1 = S(({ t }) => {   // HOOK: CU on the floor, last night's clothes, glow-stick still lit, face lit by the phone. Grinning.
  const h = headPos(NIO_FLOOR, NIO);
  const nio: Pose = { ...NIO_FLOOR, breathe: breathe(t), armR: { ...HOLD, sx: -0.95 }, armL: { sx: -0.35, sz: 0.25, el: 1.4 }, headPitch: 0.28, eyeY: -0.8, smile: 0.95, lid: 0.25 + blink(t, [1.6]), brow: -0.1 };
  const f = frame(h, 'cu', 0, { up: 0.04 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.7} lampOn={1}><Boxes />
        <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} handL={<GlowStick />} /></Room></PixelShot>
      <Say t={t} who="nio" at={0.35} d={1.2} text="best night of my life." />
    </AbsoluteFill>
  );
});

const P2 = S(({ t }) => {   // INSERT: his camera roll. The newest photo is moving day. Nothing after it.
  const s = useNoEvidenceScreens();
  const tapK = keys(t, [[0, 0], [0.3, 0.6, 'snap'], [0.7, 0.2, 'lazy'], [1.2, 0.55, 'lazy']]);
  return <Insert screen={s?.roll} tap={[130, 620]} tapK={tapK} />;
});

const P3 = S(({ t }) => {   // CU: the grin drops. Eyes up, to the lens. "No evidence."
  const h = headPos(NIO_FLOOR, NIO);
  const up = sp(t, 0.75, 'lazy'), drop = sp(t, 0.3, 'sheet');
  const nio: Pose = { ...NIO_FLOOR, breathe: breathe(t) * 0.3, armR: { ...HOLD, sx: -0.95 }, armL: { sx: -0.35, sz: 0.25, el: 1.4 }, headPitch: 0.28 * (1 - up), eyeY: -0.8 + up * 0.85,
    smile: 0.95 * (1 - drop), lid: 0.25 + up * 0.1, brow: 0.25 * drop };
  const f0 = frame(h, 'cu', 0, { up: 0.04 }), f1 = frame(h, 'ecu', 0, { up: 0.0 });
  const push = sp(t, 2.6, 'lazy');
  const lerp = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * push) as [number, number, number];
  const f = { pos: lerp(f0.pos, f1.pos), at: lerp(f0.at, f1.at), fov: f0.fov };
  if (t > 2.4) { nio.eyeY = -0.1; nio.eyeX = 0.15; nio.lid = 0.3; nio.headPitch = 0.05; }
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.7} lampOn={1}><Boxes />
        <Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} handL={<GlowStick />} /></Room></PixelShot>
      <Say t={t} who="nio" at={1.15} d={0.8} text="no evidence." seed={1} until={1.3} />
    </AbsoluteFill>
  );
});

const P4 = S(({ t }) => {   // MEMORY: the roof. She laughs so hard she bends over. "You said 'actually' again!"
  const laugh = sp(t, 1.15, 'pop');
  const shake = t > 1.15 ? Math.sin(t * 22) * 0.04 : 0;
  const maya: Pose = { ...MAYA_R, lean: 0.5 * laugh + shake, breathe: breathe(t), lid: laugh * 0.85, smile: 1, mouth: Math.max(laugh * 0.45, voTalk(t, 1.3, 'you said "actually" again!')), headPitch: -0.2 * laugh,
    armL: { sx: -0.6 * laugh, sz: 0.3, el: 1.3 * laugh }, armR: { sx: -0.9 * laugh, sz: 0.2, el: 1.0 } };
  const nio: Pose = { ...NIO_R, breathe: breathe(t), headYaw: 0.5, eyeX: 0.7, mouth: voTalk(t, 0.1, "it's actually—"), smile: t > 1.3 ? 0.45 : 0.15, lid: 0.15, brow: t > 1.3 ? -0.2 : 0.1, browUp: t > 1.6 ? 0.4 : 0,
    armR: { sx: -0.4, sz: 0.2, el: 0.9 }, armL: { sx: -0.3, sz: 0.15, el: 0.6 } };
  const f = frame(headPos({ x: -0.02, z: 0.66 }, NIO), 'ms', 0, { fov: 40, up: 0.05 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Rooftop><Dancers t={t} />
        <Character look={NIO} p={nio} handL={<GlowStick />} /><Character look={MAYA} p={maya} handR={<Cup />} /></Rooftop></PixelShot>
      <Say t={t} who="nio" at={0.1} d={0.65} text="it's actually—" seed={2} until={1.25} />
      <Say t={t} who="maya" at={1.3} d={1.45} text={'you said "actually" again!'} />
    </AbsoluteFill>
  );
});

const P5 = S(({ t }) => {   // MEMORY, REVERSE: over their shoulders, forty phones up, flashing, all pointed at the two of them.
  const nio: Pose = { ...NIO_R, yaw: 0.1, armL: { sx: -2.6, sz: 0.3, el: 0.4 }, breathe: breathe(t) };
  const maya: Pose = { ...MAYA_R, yaw: -0.1, armR: { sx: -2.5, sz: 0.3, el: 0.5 }, y: Math.abs(Math.sin(t * 4.6)) * 0.03 };
  const flash = ((t * 3.1) % 1) < 0.06 && t > 0.2;
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[0.05, 1.85, -1.05]} at={[0.0, 1.35, 2.6]} fov={52} /><Rooftop><Phoners t={t} />
        <Character look={NIO} p={nio} handL={<GlowStick />} /><Character look={MAYA} p={maya} /></Rooftop></PixelShot>
      {flash && <AbsoluteFill style={{ background: '#fff', opacity: 0.35 }} />}
    </AbsoluteFill>
  );
});

const P6 = S(({ t }) => {   // MEMORY, INSERT: her thumb types her number into his phone. It dies in her hand.
  const s = useNoEvidenceScreens();
  const keysAt: [number, number][] = [[195, 535], [95, 440], [295, 440], [195, 630]];
  const k = Math.min(3, Math.floor(t / 0.3));
  const tapK = t < 1.25 ? 0.55 + 0.45 * Math.abs(Math.sin((t / 0.3) * Math.PI)) : Math.max(0, 0.6 - (t - 1.25) * 2);
  const dead = t > 1.25;
  return <Insert screen={dead ? s?.dead : s?.typing} tap={keysAt[k]} tapK={tapK} press={!dead && Math.abs(Math.sin((t / 0.3) * Math.PI)) > 0.9 ? 1 : 0} skin={MAYA.skin} sleeve={MAYA.sleeve} />;
});

const P7 = S(({ t }) => {   // MEMORY: she backs away into the crowd, waving. "I'll send you the pics!" The crowd swallows her.
  const back = Math.min(1, t / 2.0);
  const wm = walk(t, 1.6, 0.6);
  const maya: Pose = { x: -0.05, z: -0.1 - back * 1.5, yaw: 0, legL: wm.legL, legR: wm.legR, armR: { sx: -2.7, sz: 0.4 + Math.sin(t * 9) * 0.25, el: 0.3 }, armL: { sx: -0.4, sz: 0.2, el: 0.8 },
    mouth: voTalk(t, 0.3, "i'll send you the pics!"), smile: 0.8, browUp: 0.5, lid: 0.1 };
  const nio: Pose = { ...NIO_R, yaw: Math.PI + 0.1, armR: HOLD, armL: { sx: -0.2, sz: 0.15, el: 0.3 } };
  // two dancers drift across between them; by the end they stand in front of her
  const cross = sp(t, 1.1, 'lazy');
  const spots: [number, number][] = [[-1.6 + cross * 1.4, -0.75], [1.4 - cross * 1.3, -1.05], [-1.6, -1.9], [1.3, -2.2], [0.6, -2.8], [-0.9, -2.9], [2.2, -1.5]];
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[0.75, 1.65, 1.75]} at={[0.0, 1.3, -1.0]} fov={42} /><Rooftop><Dancers t={t} spots={spots} />
        <Character look={MAYA} p={maya} /><Character look={NIO} p={nio} handR={<PhoneInHand on={0} />} handL={<GlowStick />} /></Rooftop></PixelShot>
      <Say t={t} who="maya" at={0.3} d={1.3} text="i'll send you the pics!" seed={3} />
    </AbsoluteFill>
  );
});

const P8 = S(({ t }) => {   // DAY. INSERT: a sheet of paper on his wall. His list, numbered. The last line circled.
  const s = useNoEvidenceScreens();
  const T = [1.4, 2.6, 3.8, 5.0];
  const n = T.filter((x) => t > x + 0.45).length;
  const cur = Math.min(3, T.filter((x) => t > x).length - 1);
  const u = cur >= 0 ? Math.min(1, (t - T[cur]) / 0.45) : 0;
  const lineY = (i: number) => PAPER[1] + 0.2 - ((120 + i * 72 - 8) / 400) * 0.4;
  const hx = PAPER[0] - 0.12 + u * 0.22, hy = cur >= 0 ? lineY(cur) : PAPER[1] - 0.3;
  const away = t > 5.6 ? (t - 5.6) * 0.8 : 0;
  return (<AbsoluteFill>
    <PixelShot res={[360, 640]}><Cam pos={[PAPER[0], PAPER[1], PAPER[2] + 0.95]} at={PAPER} fov={38} /><Room curtain={0.5} lampOn={1}>
      <mesh geometry={plane(0.3, 0.4)} position={[PAPER[0], PAPER[1], PAPER[2] + 0.004]}>{s && <meshBasicMaterial map={n ? s[`paper${n}`] : s.paperBase} toneMapped={false} />}</mesh>
      {/* his hand + marker */}
      <group position={[hx + 0.03 + away, hy - 0.03 - away * 0.5, PAPER[2] + 0.04]} rotation={[0, 0, 0.5]} scale={0.6}>
        <mesh geometry={cyl(0.008, 0.008, 0.12, 8)} position={[-0.02, 0.045, 0]} rotation={[0, 0, 0.3]} material={flat('#1e2a52')} />
        <Solid geo={sph(0.035)} mat={toon(NIO.skin)} scale={[1.1, 0.9, 0.7]} line={0.006} />
        <Solid geo={cyl(0.04, 0.045, 0.2, 10)} mat={toon(NIO.top)} position={[0.04, -0.12, -0.02]} rotation={[0, 0, 0.4]} line={0.006} />
      </group></Room></PixelShot>
    <Say t={t} who="nio" at={0.0} d={0.5} text="okay. what do i know." until={1.35} />
  </AbsoluteFill>);
});

const P9 = S(({ t }) => {   // MCU by the list, to the lens: "Somewhere there are two hundred photos of me having friends."
  const s = useNoEvidenceScreens();
  const h = headPos(NIO_WALL, NIO);
  const nio: Pose = { ...NIO_WALL, breathe: breathe(t), armR: { sx: -0.5, sz: 0.1, el: 1.6 }, armL: { sx: -0.1, sz: 0.1, el: 0.3 }, mouth: voTalk(t, 0.35, 'and one of them has her in it.'), lid: 0.2 + blink(t, [0.2, 2.9]), brow: 0.05, smile: 0.05 };
  const f = frame(h, 'mcu', -0.45, { fov: 40, up: 0.03, side: -0.2 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.5} lampOn={1}>
        <mesh geometry={plane(0.3, 0.4)} position={[PAPER[0], PAPER[1], PAPER[2] + 0.004]}>{s && <meshBasicMaterial map={s.paper4} toneMapped={false} />}</mesh>
        <Character look={NIO} p={nio} handR={<mesh geometry={cyl(0.008, 0.008, 0.12, 8)} position={[0, -0.04, 0.02]} material={flat('#1e2a52')} />} /></Room></PixelShot>
      <Say t={t} who="nio" at={0.35} d={2.6} text="and one of them has her in it." seed={4} />
    </AbsoluteFill>
  );
});

// doors: 3A (towel), 4C (robe)
const D3 = -1.0, D4 = 1.0;
const TOWEL_P: Pose = { x: D3, z: -0.92, yaw: 0.15 };
const NIO_3A: Pose = { x: D3 + 0.5, z: 0.05, yaw: Math.PI + 0.45 };
const ROBE_P: Pose = { x: D4, z: -0.92, yaw: -0.1 };
const NIO_4C: Pose = { x: D4 - 0.5, z: 0.05, yaw: Math.PI - 0.45 };

const P10 = S(({ t }) => {   // HALLWAY, DOOR 3A. He knocks; a neighbour in a towel opens and holds out his phone, patient.
  const open = sp(t, 0.35, 'snap');
  const show = sp(t, 1.0, 'snap');
  const towel: Pose = { ...TOWEL_P, breathe: breathe(t), armR: { sx: -0.3 - show * 0.95, sz: -0.1, el: 0.9 - show * 0.55 }, lid: 0.3, smile: 0.1, headTilt: 0.05 };
  const nio: Pose = { ...NIO_3A, breathe: breathe(t), armR: t < 0.3 ? { sx: -1.4, sz: 0.1, el: 1.3 } : { sx: -0.3, sz: 0.1, el: 0.5 }, armL: { sx: -0.2, sz: 0.1, el: 0.3 }, eyeY: show > 0.5 ? -0.5 : 0, headPitch: show * 0.15 };
  return (
    <PixelShot><Cam pos={[1.9, 1.5, 1.0]} at={[-0.8, 1.2, -0.5]} fov={40} /><Hallway><Door x={D3} num="3A" open={open} /><Door x={2.6} num="3B" />
      {open > 0.2 && <><Character look={TOWEL} p={towel} handR={<PhoneInHand on={1} />} /></>}
      <Character look={NIO} p={nio} /></Hallway></PixelShot>
  );
});

const P11 = S(({ t }) => {   // INSERT: the neighbour's selfie. Behind him, a blur that might be Nio.
  const s = useNoEvidenceScreens();
  return <Insert screen={s?.v_selfie} skin={TOWEL.skin} sleeve={TOWEL.skin} tapK={0} />;
});

const P12 = S(({ t }) => {   // "Can I have it?" The neighbour steps back. The door closes.
  const close = sp(t, 1.35, 'snap');
  const towel: Pose = { ...TOWEL_P, z: TOWEL_P.z! - close * 0.7, breathe: breathe(t), armR: { sx: -0.3, sz: -0.1, el: 0.9 }, lid: 0.3, smile: 0, eyeX: 0.3 };
  const nio: Pose = { ...NIO_3A, breathe: breathe(t), mouth: 0, armL: { sx: -0.2, sz: 0.1, el: 0.3 }, armR: { sx: -0.3, sz: 0.1, el: 0.5 }, brow: 0.1, lid: 0.15 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[1.9, 1.5, 1.0]} at={[-0.8, 1.2, -0.5]} fov={40} /><Hallway><Door x={D3} num="3A" open={1 - close} /><Door x={2.6} num="3B" />
        {close < 0.8 && <><Character look={TOWEL} p={towel} handR={<PhoneInHand on={1} />} /></>}
        <Character look={NIO} p={nio} /></Hallway></PixelShot>
      <Say t={t} who="nio" at={0.2} d={0.75} text="can i have it?" seed={5} />
    </AbsoluteFill>
  );
});

const P13 = S(({ t }) => {   // DOOR 4C. A woman in a robe opens, eyes on her phone, and turns it to him without looking up.
  const open = sp(t, 0.15, 'snap');
  const show = sp(t, 0.8, 'snap');
  const robe: Pose = { ...ROBE_P, breathe: breathe(t), armR: { sx: -0.75 - show * 0.5, sz: -0.2 - show * 0.2, el: 1.35 - show * 0.95 }, headPitch: 0.35, eyeY: -0.9, lid: 0.35, smile: 0 };
  const nio: Pose = { ...NIO_4C, breathe: breathe(t), armL: { sx: -0.2, sz: 0.1, el: 0.3 }, armR: { sx: -0.2, sz: 0.1, el: 0.3 }, eyeY: show > 0.5 ? -0.5 : 0, headPitch: show * 0.15 };
  return (
    <PixelShot><Cam pos={[-1.9, 1.5, 1.0]} at={[0.8, 1.2, -0.5]} fov={40} /><Hallway><Door x={D4} num="4C" open={open} /><Door x={-1.6} num="4B" />
      {open > 0.2 && <Character look={ROBE} p={robe} handR={<PhoneInHand on={1} />} />}
      <Character look={NIO} p={nio} /></Hallway></PixelShot>
  );
});

const P14 = S(({ t }) => {   // INSERT: her story. Her drink. At the edge of the frame, an elbow.
  const s = useNoEvidenceScreens();
  return <Insert screen={s?.v_drink} skin={ROBE.skin} sleeve={ROBE.top} tapK={0} />;
});

const P15 = S(({ t }) => {   // "That's my elbow." "Okay." The door closes.
  const close = sp(t, 2.4, 'snap');
  const robe: Pose = { ...ROBE_P, z: ROBE_P.z! - close * 0.7, breathe: breathe(t), armR: { sx: -1.25, sz: -0.4, el: 0.4 }, headPitch: 0.35, eyeY: -0.9, lid: 0.35, mouth: voTalk(t, 1.8, 'okay.') };
  const nio: Pose = { ...NIO_4C, breathe: breathe(t), mouth: voTalk(t, 0.25, "that's my elbow."), armL: { sx: -0.2, sz: 0.1, el: 0.3 }, armR: { sx: -0.2, sz: 0.1, el: 0.3 }, lid: 0.2, brow: 0.15 };
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[-1.9, 1.5, 1.0]} at={[0.8, 1.2, -0.5]} fov={40} /><Hallway><Door x={D4} num="4C" open={1 - close} /><Door x={-1.6} num="4B" />
        {close < 0.8 && <Character look={ROBE} p={robe} handR={<PhoneInHand on={1} />} />}
        <Character look={NIO} p={nio} /></Hallway></PixelShot>
      <Say t={t} who="nio" at={0.25} d={0.85} text="that's my elbow." seed={6} />
      <Say t={t} who="hi" at={1.8} d={0.35} text="okay." />
    </AbsoluteFill>
  );
});

// the lobby
const Lobby: React.FC<{ t: number; sign?: any; queue?: boolean; guy?: Partial<Pose>; nio?: Partial<Pose>; nioHandR?: React.ReactNode; children?: React.ReactNode }> = ({ t, sign, queue = true, guy, nio = {}, nioHandR, children }) => (
  <Hallway lobby>
    <ReturnsDesk x={0} z={DESK_Z} sign={sign} />
    <Character look={NIO} p={{ ...NIO_DESK, breathe: breathe(t), lid: 0.2 + blink(t, [1.3]), armL: { sx: -0.5, sz: 0.15, el: 1.0 }, armR: { sx: -0.5, sz: -0.1, el: 1.0 }, ...nio }} handR={nioHandR} />
    {queue && QUEUE.map(([x, z], i) => i === 0 && !guy ? null :
      <Character key={i} look={i === 0 ? GUY : crowdLook(i + 1)} p={{ x, z, yaw: Math.PI - 0.15, breathe: breathe(t + i), lid: blink(t, [0.5 + i]), headYaw: i ? Math.sin(t * 0.5 + i) * 0.15 : 0, armR: i ? HOLD : undefined, ...(i === 0 ? guy : {}) }}
        handR={i ? <PhoneInHand on={1} /> : undefined} />)}
    {children}
  </Hallway>
);

const P16 = S(({ t }) => {   // LOBBY, LATER. Nio behind a folding table. A polite queue of neighbours, phones out.
  const s = useNoEvidenceScreens();
  return <PixelShot><Cam pos={[-2.5, 1.6, 3.1]} at={[0.25, 1.0, 0.7]} fov={44} /><Lobby t={t} sign={s?.sign} guy={{ armR: HOLD }} /></PixelShot>;
});

const P17 = S(({ t }) => {   // The sign, straight on, him behind it like a vendor: PHOTO RETURNS, $5 A PHOTO, $20 IF MY FACE IS IN IT.
  const s = useNoEvidenceScreens();
  return <PixelShot res={[360, 640]}><Cam pos={[0, 0.95, 2.15]} at={[0, 0.92, 0]} fov={44} /><Lobby t={t} sign={s?.sign} queue={false} nio={{ smile: 0.15, lid: 0.15, armL: { sx: -0.3, sz: 0.1, el: 1.5 }, armR: { sx: -0.3, sz: -0.1, el: 1.5 } }} /></PixelShot>;
});

// the montage: one photo after another, $5 each
export const MONTAGE: [string, string][] = [['v_sky', EXTRAS[2].skin], ['v_moon', EXTRAS[0].skin], ['v_thumb', EXTRAS[1].skin], ['v_dark', EXTRAS[3].skin], ['v_floor', EXTRAS[4].skin],
  ['v_blur', EXTRAS[5].skin], ['v_moon', EXTRAS[2].skin], ['v_sky', EXTRAS[0].skin], ['v_thumb', EXTRAS[3].skin]];
export const MONTAGE_STEP = 11;
const P18 = S(({ f }) => {   // INSERTS, fast: a ceiling. The moon. A thumb. Nothing. The floor. A blur. The moon again. ($5 each.)
  const s = useNoEvidenceScreens();
  const k = Math.min(MONTAGE.length - 1, Math.floor(f / MONTAGE_STEP));
  const [scr, skin] = MONTAGE[k];
  return <Insert screen={s?.[scr]} skin={skin} sleeve={TOPS[k % TOPS.length]} tapK={0} />;
});

const P19 = S(({ t }) => {   // The next guy reaches the table and lights up: "You're the 'actually' guy!"
  const s = useNoEvidenceScreens();
  const point = sp(t, 0.2, 'pop');
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={[2.6, 1.6, 1.7]} at={[0.0, 1.2, 0.15]} fov={44} /><Lobby t={t} sign={s?.sign} nio={{ lid: 0.3, eyeX: 0.4 }}
        guy={{ armR: { sx: -1.3 * point, sz: 0.1, el: 0.2 }, smile: 1, browUp: 0.8, wide: 0.3, mouth: voTalk(t, 0.3, 'you\'re the "actually" guy!'), headTilt: -0.1 }} /></PixelShot>
      <Say t={t} who="lo" at={0.3} d={1.2} text={'you\'re the "actually" guy!'} />
    </AbsoluteFill>
  );
});

const P20 = S(({ t }) => {   // INSERT: his photo. The back of Nio's head.
  const s = useNoEvidenceScreens();
  return <Insert screen={s?.v_backhead} skin={GUY.skin} sleeve={GUY.top} tapK={0} />;
});

const P21 = S(({ t }) => {   // CU Nio: "Is my face in it?"
  const s = useNoEvidenceScreens();
  const h = headPos(NIO_DESK, NIO);
  const f = frame(h, 'cu', 0.2, { up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Lobby t={t} sign={s?.sign} queue={false} nio={{ mouth: voTalk(t, 0.3, 'is my face in it?'), lid: 0.25, brow: 0.1, eyeX: 0.15 }} /></PixelShot>
      <Say t={t} who="nio" at={0.3} d={0.8} text="is my face in it?" seed={7} />
    </AbsoluteFill>
  );
});

const P22 = S(({ t }) => {   // MCU guy, happy to help: "It's the back of it."
  const s = useNoEvidenceScreens();
  const g: Pose = { x: QUEUE[0][0], z: QUEUE[0][1], yaw: Math.PI - 0.15 };
  const f = frame(headPos(g, GUY), 'mcu', Math.PI - 0.15, { fov: 44, up: 0.02 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Hallway lobby><ReturnsDesk x={0} z={DESK_Z} sign={s?.sign} />
        <Character look={GUY} p={{ ...g, smile: 0.9, browUp: 0.5, mouth: voTalk(t, 0.25, "it's the back of it."), armR: HOLD, breathe: breathe(t) }} handR={<PhoneInHand on={1} />} />
        {QUEUE.slice(1).map(([x, z], i) => <Character key={i} look={crowdLook(i + 2)} p={{ x, z, yaw: Math.PI - 0.15, armR: HOLD }} handR={<PhoneInHand on={1} />} />)}</Hallway></PixelShot>
      <Say t={t} who="lo" at={0.25} d={0.85} text="it's the back of it." seed={2} />
    </AbsoluteFill>
  );
});

const P23 = S(({ t }) => {   // A long look. He slides him a twenty.
  const s = useNoEvidenceScreens();
  const slide = sp(t, 1.15, 'lazy');
  const reach = keys(t, [[0, 0], [0.9, 1, 'snap'], [1.7, 0, 'lazy']]);
  return (
    <PixelShot><Cam pos={[2.6, 1.6, 1.7]} at={[0.0, 1.1, 0.15]} fov={44} /><Lobby t={t} sign={s?.sign} nio={{ lid: 0.35, brow: 0.1, smile: 0, armR: { sx: -0.5 - reach * 0.55, sz: -0.1, el: 1.0 - reach * 0.6 }, headPitch: reach * 0.15, eyeY: -reach * 0.4 }}
      guy={{ smile: 0.9, armR: HOLD, eyeY: -0.4 * slide, headPitch: 0.15 * slide }}>
      <group position={[0.02, 0.765, DESK_Z - 0.12 + slide * 0.32]}><Bill v={20} /></group></Lobby></PixelShot>
  );
});

const P24 = S(({ t }) => {   // ROOFTOP, NIGHT. Empty. The string lights are still up. He sits where they danced, scrolling. Hold.
  const nio: Pose = { x: 0, z: 0.4, yaw: 0, ...FLOOR, armR: { ...HOLD, sx: -0.95 }, armL: { sx: -0.35, sz: 0.25, el: 1.4 }, headPitch: 0.3, eyeY: -0.8, lid: 0.3 + blink(t, [1.4]), breathe: breathe(t, 0.18) };
  return <PixelShot><Cam pos={[0.35, 1.45, 4.3]} at={[0, 0.9, 0]} fov={46} /><Rooftop><Litter /><Character look={NIO} p={nio} handR={<PhoneInHand on={1} />} /></Rooftop></PixelShot>;
});

const P25 = S(({ t }) => {   // INSERT: his three photos. A blur, an elbow, the back of his head.
  const s = useNoEvidenceScreens();
  return <Insert screen={s?.three} tap={[200, 300]} tapK={keys(t, [[0, 0], [0.4, 0.5, 'lazy']])} />;
});

const NIO_STAIR_Z = 0.0;
const P26 = S(({ t }) => {   // STAIRWELL. Going down, he passes his flyer on the board. Stops. Backs up.
  const s = useNoEvidenceScreens();
  const fwd = Math.min(t, 1.05) * 1.45, back = Math.max(0, Math.min(t - 1.35, 0.7)) * 1.65;
  const moving = t < 1.05 || (t > 1.35 && t < 2.05);
  const w = walk(t, 1.9, moving ? 1 : 0);
  const x = 1.9 - fwd * 1.9 + back;
  const look = sp(t, 1.15, 'snap');
  const nio: Pose = { x, z: NIO_STAIR_Z, y: w.bob, yaw: -Math.PI / 2, legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR, headYaw: -look * 1.0, eyeX: -look, lid: 0.2, brow: look * 0.2 };
  return <PixelShot><Cam pos={[0.3, 1.5, 2.7]} at={[0.15, 1.2, -0.6]} fov={46} /><Hallway><Board x={0} flyer={s?.flyer_pen} /><Door x={-2.4} num="2A" /><Character look={NIO} p={nio} /></Hallway></PixelShot>;
});

const P27 = S(({ t }) => {   // INSERT: his flyer. DID YOU TAKE A PHOTO OF ME? Under his face, in green pen: "I have 61. Same roof, Saturday."
  const s = useNoEvidenceScreens();
  const k = sp(t, 1.0, 'lazy');
  const d = 1.1 - k * 0.38;
  const fp: [number, number, number] = [0.04, 1.47, -1.144];
  const y = fp[1] + 0.01 - k * 0.11;
  const x = fp[0] - k * 0.012;
  return <PixelShot res={[360, 640]}><Cam pos={[x, y, fp[2] + d]} at={[x, y, fp[2]]} fov={38} /><Hallway><Board x={0} flyer={s?.flyer_pen} /></Hallway></PixelShot>;
});

const P28 = S(({ t }) => {   // CU: he reads it twice. No number. No name.
  const h = headPos({ x: 0.15, z: NIO_STAIR_Z }, NIO);
  const read = Math.sin(t * 2.4);
  const nio: Pose = { x: 0.15, z: NIO_STAIR_Z, yaw: Math.PI, eyeY: -0.2 + read * 0.25, eyeX: Math.sin(t * 5) * 0.3, lid: 0.15, brow: 0.2, browUp: t > 1.3 ? 0.5 : 0, breathe: breathe(t) * 0.3 };
  const f = frame(h, 'cu', Math.PI, { fov: 50, up: 0.0 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Hallway><Character look={NIO} p={nio} /></Hallway></PixelShot>;
});

const P29 = S(({ t }) => {   // HIS ROOM. He opens his laptop.
  const open = sp(t, 0.3, 'sheet');
  const type = t > 1.0 ? Math.abs(Math.sin(t * 14)) * 0.08 : 0;
  const nio: Pose = { ...NIO_CHAIR, armL: { sx: -1.05 + type, sz: 0.15, el: 0.95 }, armR: { sx: -1.05 + (t > 1.0 ? Math.abs(Math.cos(t * 13)) * 0.08 : 0), sz: 0.15, el: 0.95 }, headPitch: 0.25, eyeY: -0.3, lid: 0.25, breathe: breathe(t) };
  return <PixelShot><Cam pos={[-0.85, 1.4, 2.3]} at={[-1.7, 1.0, 0.75]} fov={42} /><Room curtain={0.5} lampOn={1}>
    <group position={[-1.85, 0.787, 0.75]} rotation={[0, Math.PI / 2, 0]}><Laptop open={open} /></group>
    <Character look={NIO} p={nio} /></Room></PixelShot>;
});

const P30 = S(({ t }) => {   // INSERT: the laptop. A blank page. He types: every photo you're in, from everyone's phones.
  const s = useNoEvidenceScreens();
  const k = Math.max(0, Math.min(10, Math.floor((t - 0.25) / 0.17)));
  return <PixelShot res={[360, 640]}><Cam pos={[-1.5, 1.0, 0.75]} at={[-1.99, 0.9, 0.75]} fov={62} /><Room curtain={0.5} lampOn={1}>
    <group position={[-1.85, 0.787, 0.75]} rotation={[0, Math.PI / 2, 0]}><Laptop open={1} screen={s?.[`laptop${k}`]} /></group></Room></PixelShot>;
});

const P31 = S(({ t }) => {   // CU, to the lens: "Okay." Beat. "Never again."
  const p: Pose = { ...NIO_CHAIR, yaw: 0 };
  const h = headPos(p, NIO);
  const nio: Pose = { ...p, armL: { sx: -1.05, sz: 0.15, el: 0.95 }, armR: { sx: -1.05, sz: 0.15, el: 0.95 }, mouth: 0, lid: 0.25 + blink(t, [1.1]), brow: 0.15, smile: t > 3.0 ? 0.2 : 0, breathe: breathe(t) * 0.3 };
  const f = frame(h, 'cu', 0, { up: 0.03 });
  return (
    <AbsoluteFill>
      <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.5} lampOn={1}>
        <group position={[-1.85, 0.787, 0.75]} rotation={[0, Math.PI / 2, 0]}><Laptop open={1} /></group>
        <Character look={NIO} p={nio} /></Room></PixelShot>
      <Say t={t} who="nio" at={0.45} d={0.4} text="okay." seed={8} />
      <Say t={t} who="nio" at={1.9} d={0.75} text="never again." seed={9} />
    </AbsoluteFill>
  );
});

const P32 = S(({ t }) => (   // TAG: black. SATURDAY.
  <AbsoluteFill style={{ background: '#0b0a0d', alignItems: 'center', justifyContent: 'center' }}>
    {t > 0.3 && <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 120, color: '#efe6d2', letterSpacing: 6 }}>saturday.</div>}
  </AbsoluteFill>
));

// ---------------------------------------------------------------- cut
export const NE_SHOTS: [string, React.FC, number][] = [
  ['P1', P1, 74], ['P2', P2, 60], ['P3', P3, 118],
  ['P4', P4, 106], ['P5', P5, 52], ['P6', P6, 60], ['P7', P7, 72],
  ['P8', P8, 160], ['P9', P9, 104],
  ['P13', P13, 56], ['P14', P14, 72], ['P15', P15, 76],
  ['P17', P17, 72], ['P19', P19, 66], ['P20', P20, 64], ['P21', P21, 72], ['P22', P22, 72],
  ['P26', P26, 66], ['P27', P27, 108], ['P28', P28, 64],
  ['P32', P32, 60],
];
const START = NE_SHOTS.reduce<number[]>((a, [, , d], i) => (a.push(i ? a[i - 1] + NE_SHOTS[i - 1][2] : 0), a), []);
export const NE_STARTS = START;
export const NE_LEN = START[START.length - 1] + NE_SHOTS[NE_SHOTS.length - 1][2];
const idx = (id: string) => NE_SHOTS.findIndex(([k]) => k === id);
const at = (id: string, s = 0) => START[idx(id)] + Math.round(s * 24);
const end = (id: string) => at(id) + NE_SHOTS[idx(id)][2];

// what he has paid, as a running receipt in the corner

// sound: [file, from, frames or 0 for the whole file, volume]
type Cue = [string, number, number, number, number?];
const MEM = ['P4', 'P5', 'P6', 'P7'];
const CUES = (): Cue[] => [
  ['sfx/ne_room.wav', 0, at('P4'), 0.8],
  ['sfx/ne_happy.wav', 0, at('P3', 1.05), 0.9],
  // into the memory: a sound bridge (the party creeps in under his face before we see it) and a swell to the white flash
  ['sfx/ne_swell.wav', at('P4') - 48, 0, 0.9],
  ['sfx/ne_party_mem.wav', at('P4') - 30, end('P7') - at('P4') + 30, 1.0],
  // and out the same way, onto a dead silence, then the room
  ['sfx/ne_swell_out.wav', end('P7') - 10, 0, 0.9],
  ['sfx/ne_room.wav', at('P8'), end('P9') - at('P8'), 0.8],
  ['sfx/ne_groove.wav', at('P8', 1.2), end('P22') - at('P8', 1.2), 0.8],
  ['sfx/ne_hall.wav', at('P13'), end('P22') - at('P13'), 0.7],
  ['sfx/ne_night.wav', at('P26'), end('P28') - at('P26'), 0.9],
  ['sfx/ne_chime.wav', at('P27', 0.3), 0, 1.0],
  ['sfx/ne_thump.wav', at('P32', 0.3), 0, 1.0],
  // spot effects
  ['sfx/shutter.wav', at('P5', 0.25), 0, 0.5], ['sfx/shutter.wav', at('P5', 0.6), 0, 0.4], ['sfx/shutter.wav', at('P5', 0.9), 0, 0.5], ['sfx/shutter.wav', at('P5', 1.25), 0, 0.4],
  ['sfx/ne_tap.wav', at('P6', 0.15), 0, 0.7], ['sfx/ne_tap.wav', at('P6', 0.45), 0, 0.7], ['sfx/ne_tap.wav', at('P6', 0.75), 0, 0.7], ['sfx/ne_tap.wav', at('P6', 1.05), 0, 0.7],
  ['sfx/ne_die.wav', at('P6', 1.25), 0, 1.0],
  ...[1.4, 2.6, 3.8, 5.0].map((x): Cue => ['sfx/ne_marker.wav', at('P8', x), 0, 0.9]),
  ['sfx/ne_knock.wav', at('P13') - 12, 0, 1.0],
  ['sfx/ne_door.wav', at('P13', 0.1), 0, 0.8], ['sfx/ne_shut.wav', at('P15', 2.4), 0, 1.0],
  ['sfx/ne_steps.wav', at('P26'), 0, 0.8],
];

/** The memory look: warm, faded, soft, a heavier grain and a dark feathered edge. */
const MEMORY_GRADE = 'sepia(0.5) saturate(0.8) contrast(0.88) brightness(1.08) blur(1.2px)';
const WhiteFlash: React.FC<{ at: number }> = ({ at: a }) => {   // a white bloom peaking at frame `a`
  const f = useCurrentFrame(); const d = Math.abs(f - a);
  return d < 10 ? <AbsoluteFill style={{ background: 'radial-gradient(circle, #fffaf0 30%, #ffe8c8 100%)', opacity: Math.max(0, 1 - d / 10) }} /> : null;
};
const Stamp: React.FC<{ text: string; big?: boolean }> = ({ text, big }) => (
  <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: big ? 104 : 72, color: '#fff3dc', letterSpacing: 6, textShadow: '0 6px 0 #3a2418' }}>{text}</div>
  </div>
);

export const PilotNoEvidence: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {NE_SHOTS.map(([id, C, d], i) => <Sequence key={id} from={START[i]} durationInFrames={d}>
      {MEM.includes(id) ? <AbsoluteFill style={{ filter: MEMORY_GRADE }}><C /></AbsoluteFill> : <C />}
    </Sequence>)}
    {/* the memory: feathered warm edge and grain on top of the grade */}
    <Sequence from={at('P4')} durationInFrames={end('P7') - at('P4')}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at center, rgba(255,220,170,0) 55%, rgba(90,50,30,0.75) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grain.png')})`, backgroundSize: '540px 960px', imageRendering: 'pixelated', mixBlendMode: 'overlay', opacity: 0.35 }} />
      <Sequence durationInFrames={30}><Stamp text="last night" big /></Sequence>
    </Sequence>
    <WhiteFlash at={at('P4')} /><WhiteFlash at={end('P7')} />
    {CUES().map(([src, from, d, v], i) => <Sequence key={i} from={Math.max(0, from)} durationInFrames={d || undefined} layout="none"><Audio src={staticFile(src)} volume={v} /></Sequence>)}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- the in-show photos (rendered first into public/photos/ne_*.png)
export const NoEvidencePhoto: React.FC<{ which: string }> = ({ which }) => {
  const R = (cam: { pos: [number, number, number]; at: [number, number, number]; fov: number }, kids: React.ReactNode, set: 'roof' | 'room' = 'roof') => (
    <PixelShot res={[360, 640]}><Cam pos={cam.pos} at={cam.at} fov={cam.fov} />{set === 'roof' ? <Rooftop>{kids}</Rooftop> : <Room curtain={0} lampOn={0}>{kids}</Room>}</PixelShot>
  );
  const party = { smile: 1, lid: 0.2 };
  switch (which) {
    case 'apartment': return R({ pos: [1.7, 1.55, 2.3], at: [-0.5, 0.7, -0.6], fov: 58 }, <Boxes />, 'room');
    case 'selfie': { const p: Pose = { x: 0.05, z: 1.75, yaw: 0.1, ...party, headTilt: -0.15, armR: { sx: -1.5, sz: 0.2, el: 0.2 } }; const f = frame(headPos(p, TOWEL), 'mcu', 0.1, { fov: 62, side: -0.35, up: 0.1 });
      return R(f, <>
      <Character look={{ ...TOWEL, top: '#3f6f8f', topDark: '#345d78', pants: '#2b2a33', shoes: '#efe6d2' }} p={p} />
      <Dancers t={0.3} spots={[[-1.4, -0.6], [1.5, -1.2], [-0.3, -2.0]]} />
      <Character look={NIO} p={{ x: 0.75, z: -0.6, yaw: 0.6, armL: { sx: -2.6, sz: 0.3, el: 0.4 }, smile: 0.9, lid: 0.3, headTilt: 0.3 }} /></>); }
    case 'drink': return R({ pos: [0.12, 1.25, 0.55], at: [0.12, 1.15, 0.0], fov: 50 }, <>
      <Character look={ROBE} p={{ x: 0.0, z: -0.35, yaw: 0, armR: { sx: -1.3, sz: -0.5, el: 1.2 }, smile: 0.5 }} handR={<Cup />} />
      <Character look={NIO} p={{ x: 0.62, z: 0.05, yaw: -0.4, armR: { sx: -0.4, sz: 0.9, el: 1.8 }, armL: { sx: -2.6, sz: 0.3, el: 0.4 } }} /></>);
    case 'sky': return R({ pos: [-3.6, 1.4, 0.6], at: [2.5, 2.9, -0.2], fov: 55 }, null);
    case 'moon': return R({ pos: [2.2, 1.3, -4.6], at: [6, 9, -20], fov: 16 }, null);
    case 'backhead': { const p: Pose = { x: 0, z: 0.35, yaw: Math.PI + 0.15, armL: { sx: -2.6, sz: 0.3, el: 0.4 } }; const f = frame(headPos(p, NIO), 'cu', 0.15, { fov: 50, up: 0.08, side: 0.2 });
      return R(f, <><Character look={NIO} p={p} handL={<GlowStick />} /><Dancers t={0.5} /></>); }
    case 'face': { const p: Pose = { x: 0, z: 0.4, yaw: 0, smile: 0.35, lid: 0.15, brow: 0.05 }; const f = frame(headPos(p, NIO), 'cu', 0, { up: 0.02 });
      return R({ pos: f.pos, at: f.at, fov: f.fov }, <Character look={NIO} p={p} />, 'room'); }
    case 'party1': { const f = frame(headPos({ x: -0.02, z: 0.66 }, NIO), 'ms', 0.1, { fov: 44 });
      return R(f, <><Dancers t={1.2} /><Character look={NIO} p={{ ...NIO_R, headYaw: 0.4, smile: 1, mouth: 0.6, lid: 0.3, armL: { sx: -2.6, sz: 0.3, el: 0.4 } }} handL={<GlowStick />} />
        <Character look={MAYA} p={{ ...MAYA_R, lean: 0.4, smile: 1, mouth: 0.8, lid: 0.85, armR: { sx: -0.9, sz: 0.2, el: 1.0 } }} handR={<Cup />} /></>); }
    case 'party2': return R({ pos: [0.4, 1.5, 2.4], at: [0.2, 1.3, 0.3], fov: 50 }, <><Dancers t={2.1} />
      <Character look={NIO} p={{ x: 0.2, z: 0.5, yaw: 0.15, y: 0.03, armL: { sx: -2.7, sz: 0.3, el: 0.3 }, armR: { sx: -2.6, sz: 0.35, el: 0.3 }, smile: 1, mouth: 0.5, lid: 0.25, headTilt: 0.15 }} handL={<GlowStick />} /></>);
    case 'party3': return R({ pos: [0, 1.45, 2.5], at: [0, 1.2, 0.6], fov: 48 }, <>
      {[[-1.0, 0.65], [1.0, 0.7], [-0.5, 0.35], [0.55, 0.35]].map(([x, z], i) => <Character key={i} look={crowdLook(i + 1)} p={{ x, z, yaw: -x * 0.2, ...party, armR: { sx: -0.3, sz: 0.9, el: 0.6 } }} />)}
      <Character look={NIO} p={{ x: 0.18, z: 0.85, yaw: 0, ...party, armL: { sx: -2.6, sz: 0.3, el: 0.4 } }} handL={<GlowStick />} /><Character look={MAYA} p={{ x: -0.32, z: 0.9, yaw: 0.1, ...party, headTilt: 0.2 }} /></>);
    case 'party4': { const p: Pose = { ...NIO_R, yaw: 0.1, smile: 1, mouth: 0.7, lid: 0.35, headTilt: -0.15, headPitch: -0.1 }; const f = frame(headPos(p, NIO), 'mcu', 0.1, { fov: 40 });
      return R(f, <><Dancers t={0.8} /><Character look={NIO} p={p} /></>); }
  }
  return null;
};

/** Cover art for reel 1: the rooftop, phones flashing at him, his face lit and lost. */
export const NoEvidenceThumbArt: React.FC = () => {
  const h = headPos(NIO_FLOOR, NIO);
  const nio: Pose = { ...NIO_FLOOR, armR: { ...HOLD, sx: -0.95 }, armL: { sx: -0.35, sz: 0.25, el: 1.4 }, headPitch: 0.05, eyeY: -0.35, eyeX: 0.25, smile: 0, lid: 0.45, brow: 0.1, browUp: 0, wide: 0 };
  const f = frame(h, 'mcu', 0, { up: 0.04, fov: 40 });
  return <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.7} lampOn={1}><Boxes />
    <Character look={NIO} p={nio} handR={<PhoneInHand on={0} />} handL={<GlowStick />} /></Room></PixelShot>;
};
