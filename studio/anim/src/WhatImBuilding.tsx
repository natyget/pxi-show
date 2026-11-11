// REEL 2 — "What I'm Building"
// Nio at his desk, to the lens, the week after the pilot. What happened, what PXI is, and the ask. Deadpan to the end:
// "I'll know if you came. I'll have photos."
import React from 'react';
import { AbsoluteFill, Sequence, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { PixelShot, Cam, Fonts } from './lib/Pixel';
import { frame } from './lib/frame';
import { Character, NIO, Pose, headPos } from './world/Character';
import { Room } from './world/Room';
import { Laptop } from './world/Hallway';
import { useNoEvidenceScreens } from './ui/NoEvidenceScreens';
import { t12, sp, keys, blink, breathe } from './lib/motion';
import { plane } from './lib/toon';
import { talk, PhoneInHand, Insert, Card, toScreen } from './PilotNotMe';
import { Say, NoEvidenceThumbArt } from './PilotNoEvidence';

const S = (C: React.FC<{ t: number; f: number }>) => () => { const f = useCurrentFrame(); return <C t={t12(f)} f={f} />; };
const SEAT: Pose = { x: -1.38, z: 0.75, yaw: 0, y: -0.08, legL: { hip: 1.5, knee: 1.5 }, legR: { hip: 1.5, knee: 1.5 } };
const TYPE = { sx: -1.05, sz: 0.15, el: 0.95 };

/** Nio at the desk, MCU, to the lens. */
const Desk: React.FC<{ t: number; p?: Partial<Pose>; size?: 'mcu' | 'cu'; handR?: React.ReactNode }> = ({ t, p = {}, size = 'mcu', handR }) => {
  const h = headPos(SEAT, NIO);
  const f = frame(h, size, 0, { up: 0.03, fov: 36 });
  return (
    <PixelShot><Cam pos={f.pos} at={f.at} fov={f.fov} /><Room curtain={0.5} lampOn={1}>
      <group position={[-1.85, 0.787, 0.75]} rotation={[0, Math.PI / 2, 0]}><Laptop open={1} /></group>
      <Character look={NIO} p={{ ...SEAT, armL: TYPE, armR: TYPE, lid: 0.2 + blink(t, [1.2, 3.1]), breathe: breathe(t) * 0.5, ...p }} handR={handR} /></Room></PixelShot>
  );
};

const R1 = S(({ t }) => (   // "I moved here three weeks ago. I've been to one party."
  <AbsoluteFill><Desk t={t} p={{ mouth: Math.max(talk(t, 0.2, 1.4), talk(t, 2.1, 1.1)), brow: 0.05 }} />
    <Say t={t} who="nio" at={0.2} d={1.4} text="i moved here three weeks ago." until={1.8} />
    <Say t={t} who="nio" at={2.1} d={1.1} text="i've been to one party." /></AbsoluteFill>
));
const R2 = S(({ t }) => {   // INSERT: "I have three photos of it." A blur, an elbow, the back of his head.
  const s = useNoEvidenceScreens();
  return <AbsoluteFill><Insert screen={s?.three} tap={[200, 300]} tapK={keys(t, [[0, 0], [0.4, 0.5, 'lazy']])} />
    <Say t={t} who="nio" at={0.2} d={1.3} text="i have three photos of it." seed={13} /></AbsoluteFill>;
});
const R3 = S(({ t }) => (   // "Everyone else there has two hundred."
  <AbsoluteFill><Desk t={t} p={{ mouth: talk(t, 0.25, 1.5), brow: 0.15, lid: 0.3 }} />
    <Say t={t} who="nio" at={0.25} d={1.5} text="everyone else there has two hundred." seed={14} /></AbsoluteFill>
));
const R4 = S(({ t }) => {   // "So I'm building PXI." He holds his phone up to the lens.
  const up = sp(t, 0.15, 'snap');
  return <AbsoluteFill><Desk t={t} size="mcu" p={{ mouth: talk(t, 0.55, 1.0), smile: 0.15, armR: { sx: -0.7 - up * 0.55, sz: -0.25, el: 1.35 - up * 0.75 } }} handR={<PhoneInHand on={1} />} />
    <Say t={t} who="nio" at={0.55} d={1.0} text="so i'm building PXI." seed={15} /></AbsoluteFill>;
});

const TILES = ['party1', 'party4', 'party2', 'party3', 'face', 'party1', 'party2', 'party4', 'party3'];
const R5 = S(({ t }) => {   // INSERT: the push "You might be in 61 photos". Tap. The album fills with him, from everyone's phones.
  const s = useNoEvidenceScreens();
  const tapped = t > 1.0;
  return (
    <AbsoluteFill>
      <Insert screen={tapped ? s?.album : s?.lock} tap={[195, 365]} tapK={t < 1.0 ? keys(t, [[0, 0], [0.7, 1, 'snap']]) : Math.max(0, 1 - (t - 1.0) * 4)} press={t > 0.85 && t < 1.05 ? 1 : 0}>
        {s && !tapped && <Card tex={s.card61} k={sp(t, 0.1, 'pop')} />}
        {s && tapped && TILES.map((n, i) => {
          const k = sp(t, 1.15 + i * 0.12, 'pop');
          const [x, y, z] = toScreen(66 + (i % 3) * 129, 250 + Math.floor(i / 3) * 129);
          return k > 0.01 ? <mesh key={i} geometry={plane(0.0215, 0.0215)} position={[x, y, z + 0.0004]} scale={k}><meshBasicMaterial map={s[`tile_${n}`]} transparent toneMapped={false} /></mesh> : null;
        })}
      </Insert>
      <Say t={t} who="nio" at={1.2} d={2.4} text="every photo you're in, from everyone's phones." seed={16} />
    </AbsoluteFill>
  );
});
const R6 = S(({ t }) => {   // INSERT: the map, "Tonight near you". Pins pop in.
  const s = useNoEvidenceScreens();
  const n = Math.min(4, Math.floor((t - 0.2) / 0.35) + 1);
  return <AbsoluteFill><Insert screen={s ? (n >= 1 ? s[`map${n}`] : s.map) : undefined} tapK={0} />
    <Say t={t} who="nio" at={0.3} d={1.9} text="and everything on tonight, on one map." seed={17} /></AbsoluteFill>;
});
const R7 = S(({ t }) => (   // "It's free. Get it, so when I throw something, you can find it. And come."
  <AbsoluteFill><Desk t={t} p={{ mouth: Math.max(talk(t, 0.2, 0.6), talk(t, 2.0, 1.9), talk(t, 5.4, 0.7)), brow: 0.05, smile: 0.1 }} />
    <Say t={t} who="nio" at={0.2} d={0.6} text="it's free." until={1.7} />
    <Say t={t} who="nio" at={2.0} d={1.9} text="get it, so when i throw something, you can find it." until={3.2} />
    <Say t={t} who="nio" at={5.4} d={0.7} text="and come." /></AbsoluteFill>
));
const R8 = S(({ t }) => (   // A beat. "I'll know if you came." "I'll have photos."
  <AbsoluteFill><Desk t={t} size="cu" p={{ mouth: Math.max(talk(t, 0.6, 1.0), talk(t, 3.4, 0.85)), lid: 0.3, brow: 0.2, smile: t > 4.4 ? 0.25 : 0 }} />
    <Say t={t} who="nio" at={0.6} d={1.0} text="i'll know if you came." until={2.6} />
    <Say t={t} who="nio" at={3.4} d={0.85} text="i'll have photos." /></AbsoluteFill>
));
const R9 = S(({ t }) => {   // End card.
  const k = sp(t, 0.1, 'pop');
  return (
    <AbsoluteFill style={{ background: '#0b0a0d', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
      <Img src={staticFile('pxi-app-icon.png')} style={{ width: 300, height: 300, borderRadius: 66, imageRendering: 'pixelated', transform: `scale(${k})` }} />
      <div style={{ fontFamily: 'Pixelify', fontWeight: 700, fontSize: 140, color: '#efe6d2', letterSpacing: 8 }}>PXI</div>
      {t > 0.5 && <div style={{ fontFamily: 'Pixelify', fontWeight: 500, fontSize: 52, color: '#cfc4e8', textAlign: 'center', lineHeight: 1.3 }}>every photo you're in.<br />everything on tonight.</div>}
    </AbsoluteFill>
  );
});

export const WIB_SHOTS: [string, React.FC, number][] = [['R1', R1, 120], ['R2', R2, 76], ['R3', R3, 80], ['R4', R4, 72], ['R5', R5, 112], ['R6', R6, 90], ['R7', R7, 170], ['R8', R8, 136], ['R9', R9, 72]];
const START = WIB_SHOTS.reduce<number[]>((a, [, , d], i) => (a.push(i ? a[i - 1] + WIB_SHOTS[i - 1][2] : 0), a), []);
export const WIB_STARTS = START;
export const WIB_LEN = START[START.length - 1] + WIB_SHOTS[WIB_SHOTS.length - 1][2];
const at = (id: string, s = 0) => START[WIB_SHOTS.findIndex(([k]) => k === id)] + Math.round(s * 24);

export const WhatImBuilding: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}>
    <Fonts />
    {WIB_SHOTS.map(([id, C, d], i) => <Sequence key={id} from={START[i]} durationInFrames={d}><C /></Sequence>)}
    <Sequence from={0} durationInFrames={WIB_LEN} layout="none"><Audio src={staticFile('sfx/ne_room.wav')} volume={0.7} /></Sequence>
    <Sequence from={0} durationInFrames={at('R5')} layout="none"><Audio src={staticFile('sfx/ne_end.wav')} volume={0.55} loop /></Sequence>
    <Sequence from={at('R5')} durationInFrames={at('R9') - at('R5')} layout="none"><Audio src={staticFile('sfx/ne_groove.wav')} volume={0.6} startFrom={24 * 10} /></Sequence>
    <Sequence from={at('R5', 0.1)} layout="none"><Audio src={staticFile('sfx/buzz.wav')} volume={0.8} /></Sequence>
    <Sequence from={at('R5', 0.9)} layout="none"><Audio src={staticFile('sfx/ne_tap.wav')} volume={0.9} /></Sequence>
    {Array.from({ length: 9 }).map((_, i) => <Sequence key={i} from={at('R5', 1.15 + i * 0.12)} layout="none"><Audio src={staticFile('sfx/ne_tap.wav')} volume={0.5} /></Sequence>)}
    {[0, 1, 2, 3].map((i) => <Sequence key={`m${i}`} from={at('R6', 0.2 + i * 0.35)} layout="none"><Audio src={staticFile('sfx/ne_cash.wav')} volume={0.35} /></Sequence>)}
    <Sequence from={at('R9', 0.1)} layout="none"><Audio src={staticFile('sfx/ne_thump.wav')} volume={0.9} /></Sequence>
  </AbsoluteFill>
);

/** Covers: one strong image and a few words, big. */
const Big: React.FC<{ top?: string; bottom: string; sub?: string; color?: string }> = ({ top, bottom, sub, color = '#ffd34d' }) => {
  const ink = [[-8, 0], [8, 0], [0, -8], [0, 8], [-8, -8], [8, 8], [-8, 8], [8, -8], [0, 14]].map(([x, y]) => `${x}px ${y}px 0 #151216`).join(',');
  const st = (size: number, c: string): React.CSSProperties => ({ fontFamily: 'Pixelify', fontWeight: 700, fontSize: size, color: c, textAlign: 'center', lineHeight: 1.0, textShadow: ink, padding: '0 50px' });
  return (<>
    {top && <div style={{ position: 'absolute', top: 170, left: 0, right: 0, ...st(150, '#ffffff') }}>{top}</div>}
    <div style={{ position: 'absolute', bottom: 300, left: 0, right: 0, ...st(170, color) }}>{bottom}</div>
    {sub && <div style={{ position: 'absolute', bottom: 190, left: 0, right: 0, ...st(64, '#ffffff') }}>{sub}</div>}
  </>);
};
export const Thumb: React.FC<{ which: 'ne' | 'wib' }> = ({ which }) => (
  <AbsoluteFill style={{ background: '#0b0a0d' }}><Fonts />
    {which === 'ne' ? <><NoEvidenceThumbArt /><Big top="40 PHONES." bottom="0 PHOTOS." sub="pilot · no evidence" /></>
      : <><Desk t={0.4} size="mcu" p={{ smile: 0.2, armR: { sx: -1.25, sz: -0.25, el: 0.6 } }} handR={<PhoneInHand on={1} />} /><Big top="I'M BUILDING" bottom="THE FIX." sub="every photo you're in" /></>}
  </AbsoluteFill>
);
