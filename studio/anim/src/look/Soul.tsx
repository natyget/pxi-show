// Round 2 look: muted room light, painted texture inside every fill, depth blur behind and in front, tight off-centre
// framing, and faces built on big outlined eyes under heavy brows. Drawn smooth here; tools/soulfinish.sh reduces it to
// soft pixels and adds grain, so the pixel grid comes from one engineered pass, never from a shape.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';

const K = {
  ink: '#151215',
  wall: '#6b5d66', wallDk: '#54474f', shaft: '#8a7470',
  wood: '#5a4033', woodDk: '#3d2b24', woodLt: '#7a5846',
  sheet: '#9a9294', sheetDk: '#77707a',
  skin: '#c49474', skinSh: '#9c6f5a', skinLt: '#dcb091',
  hair: '#1d1719', hairLt: '#3a2f33', part: '#7d5a4e',
  top: '#b4532c', topSh: '#8a3b24', topLt: '#cc6a3e',
  maya: '#2f5e46', mayaSh: '#22463a', mayaHair: '#141012', cream: '#d9cdb4',
  white: '#ecebe8', phone: '#1c1a20',
};

const Defs: React.FC = () => (
  <defs>
    {/* painted mottle: low-frequency noise multiplied into a fill, so flat colour reads as brushed */}
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.38 0 0 0 0" result="g" />
      <feComposite in="g" in2="SourceGraphic" operator="in" result="gi" />
      <feBlend in="SourceGraphic" in2="gi" mode="soft-light" />
    </filter>
    <filter id="far" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id="near" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14" /></filter>
    <radialGradient id="lamp" cx="0.15" cy="0.25" r="0.9"><stop offset="0" stopColor="#ffd9a6" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <linearGradient id="faceSh" x1="0" x2="1" y1="0" y2="0.3"><stop offset="0.45" stopColor={K.skinSh} stopOpacity="0" /><stop offset="0.8" stopColor={K.skinSh} stopOpacity="0.9" /></linearGradient>
    <linearGradient id="topSh" x1="0" x2="1"><stop offset="0.35" stopColor={K.topSh} stopOpacity="0" /><stop offset="0.85" stopColor={K.topSh} stopOpacity="1" /></linearGradient>
  </defs>
);

export type Face = { hood: number; px: number; py: number; browL: number; browR: number; angL: number; angR: number; mouth: 'line' | 'o' | 'side' | 'flat'; lean: number };
export const DEADPAN: Face = { hood: 0.38, px: 0.35, py: 0.1, browL: 0, browR: 0, angL: 0.15, angR: 0.1, mouth: 'line', lean: 0 };
export const CLOCK: Face = { hood: 0.3, px: 0.95, py: 0, browL: 0.1, browR: 0.1, angL: 0.35, angR: 0.3, mouth: 'flat', lean: 0 };
export const WHAT: Face = { hood: 0.08, px: 0.9, py: -0.05, browL: 0.9, browR: -0.1, angL: -0.2, angR: 0.5, mouth: 'o', lean: -3 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixFace = (a: Face, b: Face, t: number): Face => ({
  hood: lerp(a.hood, b.hood, t), px: lerp(a.px, b.px, t), py: lerp(a.py, b.py, t), browL: lerp(a.browL, b.browL, t), browR: lerp(a.browR, b.browR, t),
  angL: lerp(a.angL, b.angL, t), angR: lerp(a.angR, b.angR, t), mouth: t < 0.5 ? a.mouth : b.mouth, lean: lerp(a.lean, b.lean, t),
});

const HEAD = 'M -122,-58 C -126,-172 -60,-206 8,-206 C 88,-206 132,-160 128,-58 C 126,22 118,88 84,128 C 58,156 26,168 -4,168 C -42,168 -76,150 -98,118 C -120,86 -118,12 -122,-58 Z';
const HAIR = 'M -130,-66 C -138,-186 -60,-222 8,-222 C 96,-222 142,-176 136,-66 L 124,-78 C 120,-110 100,-130 70,-136 C 40,-142 -20,-142 -56,-136 C -90,-130 -112,-110 -118,-78 Z';

/** One eye: a big white oval, a heavy black rim, the lid hooding it from the top, a small pupil. */
const Eye: React.FC<{ x: number; y: number; rx: number; ry: number; f: Face; id: string }> = ({ x, y, rx, ry, f, id }) => {
  const lidY = -ry + f.hood * ry * 1.1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={id}><ellipse rx={rx} ry={ry} /></clipPath>
      <ellipse rx={rx} ry={ry} fill={K.white} />
      <g clipPath={`url(#${id})`}>
        <circle cx={f.px * rx * 0.55} cy={f.py * ry * 0.4 + 4} r={rx * 0.3} fill={K.ink} />
        <path d={`M ${-rx - 4},${lidY + 4} C ${-rx / 2},${lidY - 6} ${rx / 2},${lidY - 6} ${rx + 4},${lidY + 6} L ${rx + 4},${-ry - 4} L ${-rx - 4},${-ry - 4} Z`} fill={K.skin} />
        <path d={`M ${-rx - 4},${lidY + 4} C ${-rx / 2},${lidY - 6} ${rx / 2},${lidY - 6} ${rx + 4},${lidY + 6}`} fill="none" stroke={K.ink} strokeWidth={9} />
      </g>
      <ellipse rx={rx} ry={ry} fill="none" stroke={K.ink} strokeWidth={7} />
      {/* tired underline */}
      <path d={`M ${-rx * 0.7},${ry + 9} C ${-rx * 0.2},${ry + 15} ${rx * 0.3},${ry + 14} ${rx * 0.75},${ry + 6}`} fill="none" stroke={K.skinSh} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

const Brow: React.FC<{ x: number; y: number; raise: number; ang: number; w: number; flip?: boolean }> = ({ x, y, raise, ang, w, flip }) => (
  <g transform={`translate(${x} ${y - raise * 22}) scale(${flip ? -1 : 1} 1) rotate(${-ang * 16})`}>
    <path d={`M ${-w / 2},6 C ${-w / 4},-6 ${w / 4},-10 ${w / 2},-4 L ${w / 2 - 2},-20 C ${w / 4},-26 ${-w / 4},-22 ${-w / 2 - 2},-10 Z`} fill={K.ink} />
  </g>
);

export const NioSoul: React.FC<{ f: Face }> = ({ f }) => (
  <g transform={`rotate(${f.lean})`}>
    {/* neck, shirt */}
    <path d="M -62,110 L 70,100 L 76,230 L -66,230 Z" fill={K.skinSh} stroke={K.ink} strokeWidth={7} />
    <g filter="url(#mottle)">
      <path d="M -300,760 C -300,420 -250,280 -150,216 C -100,194 -50,186 0,186 C 60,186 120,194 170,216 C 270,280 310,420 310,760 Z" fill={K.top} />
      <path d="M -300,760 C -300,420 -250,280 -150,216 C -100,194 -50,186 0,186 C 60,186 120,194 170,216 C 270,280 310,420 310,760 Z" fill="url(#topSh)" />
      <path d="M -260,760 C -262,520 -240,380 -190,300 C -220,420 -226,560 -220,760 Z" fill={K.topLt} />
    </g>
    <path d="M -300,760 C -300,420 -250,280 -150,216 C -100,194 -50,186 0,186 C 60,186 120,194 170,216 C 270,280 310,420 310,760" fill="none" stroke={K.ink} strokeWidth={8} />
    <path d="M -66,194 C -30,242 40,242 76,192" fill="none" stroke={K.topSh} strokeWidth={22} />
    <path d="M -66,194 C -30,242 40,242 76,192" fill="none" stroke={K.ink} strokeWidth={7} />
    {/* far ear */}
    <path d="M 118,-30 C 150,-44 166,0 150,30 C 140,48 124,46 118,36 Z" fill={K.skinSh} stroke={K.ink} strokeWidth={7} />
    {/* head */}
    <g filter="url(#mottle)">
      <path d={HEAD} fill={K.skin} />
      <path d={HEAD} fill="url(#faceSh)" />
      <path d="M -112,-40 C -108,-120 -70,-160 -30,-170 C -70,-130 -84,-80 -88,-30 Z" fill={K.skinLt} opacity={0.8} />
    </g>
    <path d={HEAD} fill="none" stroke={K.ink} strokeWidth={8} strokeLinejoin="round" />
    {/* cornrows: straight back from a rounded hairline, thin parts */}
    <clipPath id="hairc"><path d={HAIR} /></clipPath>
    <g filter="url(#mottle)"><path d={HAIR} fill={K.part} /></g>
    <g clipPath="url(#hairc)">
      {[-150, -112, -76, -40, -4, 32, 68, 104, 140].map((x, i) => (
        <g key={i}>
          <path d={`M ${x},-120 C ${x * 1.02},-170 ${x * 0.6},-215 ${x * 0.25},-250`} fill="none" stroke={K.hair} strokeWidth={30} strokeLinecap="round" />
          {[0, 1, 2].map((j) => <path key={j} d={`M ${x * (1 - j * 0.14) - 8},${-140 - j * 30} l 12,-14`} stroke={K.hairLt} strokeWidth={7} strokeLinecap="round" />)}
        </g>
      ))}
    </g>
    <path d={HAIR} fill="none" stroke={K.ink} strokeWidth={7} strokeLinejoin="round" />
    {/* face: turned a little to our left, so the near eye is bigger */}
    <Eye x={-52} y={-6} rx={38} ry={30} f={f} id="eL" />
    <Eye x={46} y={-8} rx={33} ry={28} f={f} id="eR" />
    <Brow x={-52} y={-50} raise={f.browL} ang={f.angL} w={76} />
    <Brow x={48} y={-50} raise={f.browR} ang={f.angR} w={66} flip />
    <path d="M -6,30 C -14,50 -12,60 4,62" fill="none" stroke={K.skinSh} strokeWidth={7} strokeLinecap="round" />
    {f.mouth === 'line' && <path d="M -36,100 C -16,104 10,104 30,98" fill="none" stroke={K.ink} strokeWidth={7} strokeLinecap="round" />}
    {f.mouth === 'flat' && <path d="M -30,100 L 22,100" fill="none" stroke={K.ink} strokeWidth={7} strokeLinecap="round" />}
    {f.mouth === 'side' && <path d="M -30,102 C -10,104 14,98 32,88" fill="none" stroke={K.ink} strokeWidth={7} strokeLinecap="round" />}
    {f.mouth === 'o' && <ellipse cx={-4} cy={104} rx={13} ry={17} fill={K.ink} />}
  </g>
);

const Room: React.FC = () => (
  <g filter="url(#far)">
    <rect x={-40} y={-40} width={1160} height={2000} fill={K.wall} />
    <path d="M -40,1200 L 1120,1200 L 1120,1960 L -40,1960 Z" fill={K.wallDk} />
    {/* evening light falling through a window we never see */}
    <path d="M 200,-40 L 520,-40 L 900,1200 L 560,1200 Z" fill={K.shaft} opacity={0.55} />
    {/* headboard */}
    <rect x={-40} y={980} width={760} height={260} fill={K.wood} />
    <rect x={20} y={1020} width={300} height={190} fill="none" stroke={K.woodDk} strokeWidth={16} />
    <rect x={370} y={1020} width={300} height={190} fill="none" stroke={K.woodDk} strokeWidth={16} />
    <rect x={-40} y={970} width={760} height={22} fill={K.woodLt} />
    <rect x={-40} y={1240} width={1160} height={700} fill={K.sheet} />
    <path d="M -40,1420 C 300,1380 700,1460 1120,1400 L 1120,1960 L -40,1960 Z" fill={K.sheetDk} />
    {/* lamp on the side table */}
    <rect x={860} y={1080} width={220} height={180} fill={K.woodDk} />
    <path d="M 900,900 L 1040,900 L 1010,800 L 930,800 Z" fill="#e8c38a" />
    <rect x={0} y={0} width={1080} height={1920} fill="url(#lamp)" />
  </g>
);

/** Maya from behind, close to camera and out of focus: the over-the-shoulder that frames him. */
const MayaShoulder: React.FC = () => (
  <g filter="url(#near)" transform="translate(900 1500)">
    <circle cx={-10} cy={-520} r={150} fill={K.mayaHair} />
    <circle cx={90} cy={-600} r={110} fill={K.mayaHair} />
    <path d="M -150,-360 C -150,-470 150,-470 150,-360 L 150,-250 L -150,-250 Z" fill={K.mayaHair} />
    <path d="M -330,500 C -330,0 -220,-230 0,-250 C 220,-230 340,0 340,500 Z" fill={K.maya} />
    <path d="M -330,500 C -330,100 -280,-80 -200,-160 C -250,40 -260,260 -250,500 Z" fill={K.cream} />
    <path d="M 120,-240 C 240,-180 330,0 340,500 L 220,500 C 220,200 190,-60 120,-240 Z" fill={K.mayaSh} />
  </g>
);

export const SoulFrame: React.FC<{ f?: Face }> = ({ f = DEADPAN }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920">
    <Defs />
    <Room />
    <g transform="translate(400 1060) scale(1.55)"><NioSoul f={f} /></g>
    <MayaShoulder />
  </svg>
);

export const SoulStill: React.FC = () => <AbsoluteFill><SoulFrame f={WHAT} /></AbsoluteFill>;

/** 3.5 s: he's fine, he clocks something, he can't believe it. Holds, then snaps. */
export const SOUL_LEN = 84;
export const SoulClip: React.FC = () => {
  const fr = Math.floor(useCurrentFrame() / 2) * 2;
  const snap = (at: number) => interpolate(fr - at, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) });
  let f = mixFace(DEADPAN, CLOCK, snap(30));
  f = mixFace(f, WHAT, snap(54));
  if ((fr >= 16 && fr < 20) || (fr >= 74 && fr < 78)) f = { ...f, hood: 1.9 };
  return (
    <AbsoluteFill>
      <SoulFrame f={f} />
      <Audio src={staticFile('sfx/room.wav')} />
    </AbsoluteFill>
  );
};
