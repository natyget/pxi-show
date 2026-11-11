// Three look options for the founder, all from the same 2D rig. Each renders at its own pixel resolution with
// anti-aliasing off, then is scaled up with nearest-neighbour (render.sh / look tools) to 1080x1920.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import { LOOKS, Look, PAL, INK, Shape, Defs, E, Expr, mix, NioBust, MayaBust, PhoneInHand, ln } from './Rig2D';

type P = { look: Look['id'] };

const Frame: React.FC<{ L: Look; children: React.ReactNode }> = ({ L, children }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <svg width={L.w} height={L.h} viewBox="0 0 1080 1920" shapeRendering={L.shade === 'soft' ? 'auto' : 'crispEdges'} style={{ display: 'block' }}>
      <Defs />
      {children}
    </svg>
  </AbsoluteFill>
);

// ---------- the apartment (one set, reused by the scene and the clip) ----------
const Apartment: React.FC<{ L: Look; id: string }> = ({ L, id }) => {
  const W = PAL.wall, F = PAL.floor, C = PAL.cream;
  return (
    <g>
      <Shape L={L} id={`${id}wall`} sw={W} d="M -20,-20 L 1100,-20 L 1100,1330 L -20,1330 Z" noLine
        shadow="M 900,-20 L 1100,-20 L 1100,1330 L 860,1330 C 900,900 880,400 900,-20 Z M -20,1200 L 1100,1200 L 1100,1330 L -20,1330 Z" light="M 520,-20 L 760,-20 L 820,1330 L 560,1330 Z" />
      {/* window, late afternoon */}
      <rect x={600} y={170} width={400} height={600} fill="#f6c27d" />
      <rect x={600} y={170} width={400} height={230} fill="#f2a46b" />
      <rect x={600} y={170} width={400} height={110} fill="#e7866a" />
      <circle cx={760} cy={520} r={70} fill="#ffe7a8" />
      <path d="M 600,770 L 600,560 L 650,560 L 650,500 L 720,500 L 720,600 L 790,600 L 790,450 L 860,450 L 860,540 L 930,540 L 930,480 L 1000,480 L 1000,770 Z" fill="#6d6f9a" />
      <path d="M 600,770 L 600,650 L 680,650 L 680,620 L 760,620 L 760,690 L 850,690 L 850,640 L 1000,640 L 1000,770 Z" fill="#4f5079" />
      {[[810, 480], [830, 520], [880, 570], [700, 540], [960, 520]].map(([x, y], i) => <rect key={i} x={x} y={y} width={14} height={18} fill="#ffd98a" />)}
      <path d="M 600,170 L 1000,170 L 1000,770 L 600,770 Z M 800,170 L 800,770 M 600,470 L 1000,470" fill="none" stroke={C[0]} strokeWidth={22} />
      <path d="M 589,159 L 1011,159 L 1011,781 L 589,781 Z" fill="none" {...ln(L, C, 0.8)} />
      <Shape L={L} id={`${id}sill`} sw={C} d="M 570,780 L 1030,780 L 1030,810 L 570,810 Z" />
      {/* one framed print, the kind a very tidy person hangs dead level */}
      <Shape L={L} id={`${id}frame`} sw={['#1f1c24', '#141218', '#3a3542', '#000']} d="M 110,250 L 400,250 L 400,640 L 110,640 Z" />
      <rect x={134} y={274} width={242} height={342} fill="#efe6d4" />
      <circle cx={255} cy={400} r={70} fill="#d9652e" />
      <rect x={160} y={480} width={190} height={110} fill="#33406a" />
      {/* floor and rug */}
      <Shape L={L} id={`${id}floor`} sw={F} d="M -20,1330 L 1100,1330 L 1100,1940 L -20,1940 Z" noLine light="M -20,1330 L 1100,1330 L 1100,1360 L -20,1360 Z" />
      <path d="M -20,1330 L 1100,1330" stroke={L.line === 'ink' ? INK : F[3]} strokeWidth={L.lw} />
      {[1450, 1590, 1760].map((y) => <path key={y} d={`M -20,${y} L 1100,${y}`} stroke={F[1]} strokeWidth={L.lw * 0.5} />)}
      <Shape L={L} id={`${id}rug`} sw={C} d="M 70,1560 C 70,1500 1010,1500 1010,1560 L 1050,1840 C 1050,1910 30,1910 30,1840 Z" shadow="M 30,1820 L 1050,1820 L 1050,1940 L 30,1940 Z" />
      {/* plant */}
      <Shape L={L} id={`${id}pot`} sw={['#e9e2d6', '#bdb4a6', '#fff', '#6d655a']} d="M 40,1160 L 170,1160 L 155,1340 L 55,1340 Z" shadow="M 120,1160 L 170,1160 L 155,1340 L 110,1340 Z" />
      {[[-40, 0], [-10, -30], [25, -10], [50, 20], [-60, 30]].map(([a, o], i) => (
        <Shape key={i} L={L} id={`${id}leaf${i}`} sw={['#3f8a5a', '#2c6640', '#5aab73', '#163a22']} k={0.7}
          transform={`translate(${105 + o * 0.6} 1160) rotate(${a})`} d="M 0,0 C -40,-80 -30,-200 0,-260 C 30,-200 40,-80 0,0 Z" shadow="M 0,0 C 30,-80 30,-200 0,-260 L 40,-260 L 40,0 Z" />
      ))}
      {/* floor lamp */}
      <path d="M 1020,1340 L 1020,880" stroke={INK} strokeWidth={L.lw * 1.4} />
      <Shape L={L} id={`${id}shade`} sw={['#f4dfb0', '#d8bd84', '#fff3cf', '#7a6233']} d="M 960,880 L 1080,880 L 1060,780 L 980,780 Z" />
    </g>
  );
};

const Couch: React.FC<{ L: Look; id: string; part: 'back' | 'front' }> = ({ L, id, part }) => {
  const K = PAL.couch;
  if (part === 'back') return (
    <Shape L={L} id={`${id}cb`} sw={K} d="M 150,1010 C 150,980 170,960 200,960 L 880,960 C 910,960 930,980 930,1010 L 930,1260 L 150,1260 Z"
      shadow="M 150,1180 L 930,1180 L 930,1260 L 150,1260 Z M 830,960 L 930,960 L 930,1260 L 850,1260 Z" light="M 200,960 L 880,960 L 880,985 L 200,985 Z" />
  );
  return (
    <g>
      <Shape L={L} id={`${id}seat`} sw={K} d="M 140,1230 L 940,1230 C 960,1230 970,1250 970,1270 L 970,1400 L 110,1400 L 110,1270 C 110,1250 120,1230 140,1230 Z"
        shadow="M 110,1340 L 970,1340 L 970,1400 L 110,1400 Z" light="M 140,1230 L 940,1230 L 940,1250 L 140,1250 Z" />
      {[[90, 220], [860, 990]].map(([a, b], i) => (
        <Shape key={i} L={L} id={`${id}arm${i}`} sw={K} d={`M ${a + 10},1120 C ${a + 10},1090 ${a + 30},1080 ${(a + b) / 2},1080 C ${b - 30},1080 ${b - 10},1090 ${b - 10},1120 L ${b - 10},1410 L ${a + 10},1410 Z`}
          shadow={`M ${a},1300 L ${b},1300 L ${b},1420 L ${a},1420 Z`} light={`M ${a + 20},1085 L ${b - 20},1085 L ${b - 20},1105 L ${a + 20},1105 Z`} />
      ))}
      <path d="M 170,1400 L 160,1460 M 910,1400 L 920,1460" stroke={INK} strokeWidth={L.lw * 2} strokeLinecap="round" />
    </g>
  );
};

/** Nio sitting, holding his phone up in his right hand, reading it. */
const NioSitting: React.FC<{ L: Look; id: string; e: Expr; tilt?: number }> = ({ L, id, e, tilt = 0 }) => {
  const Pn = PAL.pants, O = PAL.orange, Wt = PAL.white;
  return (
    <g>
      {/* legs: thighs come toward us, shins drop to the floor */}
      <Shape L={L} id={`${id}thighs`} sw={Pn} d="M 240,1250 L 620,1250 C 640,1300 640,1360 610,1400 L 250,1400 C 220,1360 220,1300 240,1250 Z" shadow="M 225,1350 L 640,1350 L 640,1410 L 225,1410 Z" />
      <Shape L={L} id={`${id}shinL`} sw={Pn} d="M 262,1390 L 400,1390 L 392,1640 L 280,1640 Z" shadow="M 350,1390 L 400,1390 L 392,1640 L 350,1640 Z" />
      <Shape L={L} id={`${id}shinR`} sw={Pn} d="M 470,1390 L 608,1390 L 596,1640 L 484,1640 Z" shadow="M 556,1390 L 608,1390 L 596,1640 L 556,1640 Z" />
      {[[256, 400], [466, 612]].map(([a, b], i) => (
        <Shape key={i} L={L} id={`${id}shoe${i}`} sw={Wt} d={`M ${a + 12},1630 L ${b - 16},1630 C ${b + 6},1640 ${b + 12},1680 ${b + 4},1700 L ${a - 4},1700 C ${a - 12},1680 ${a - 6},1640 ${a + 12},1630 Z`}
          shadow={`M ${a - 20},1684 L ${b + 20},1684 L ${b + 20},1710 L ${a - 20},1710 Z`} />
      ))}
      {/* the body */}
      <g transform="translate(430 800) scale(0.82)">
        <NioBust L={L} id={id} e={e} tilt={tilt} turn={-0.12} />
      </g>
      {/* left arm resting on the thigh */}
      <Shape L={L} id={`${id}armL`} sw={O} d="M 612,1030 C 670,1050 692,1150 684,1290 L 604,1292 C 612,1200 604,1120 586,1072 Z" shadow="M 660,1080 C 690,1150 690,1230 684,1290 L 656,1290 C 664,1210 664,1140 640,1080 Z" />
      <Shape L={L} id={`${id}handL`} sw={PAL.nioSkin} d="M 600,1286 C 596,1322 618,1346 646,1346 C 672,1346 690,1322 686,1286 Z" k={0.8} />
      {/* right arm: upper arm hangs to the elbow, forearm comes up to the phone */}
      <Shape L={L} id={`${id}armR`} sw={O} d="M 250,1030 C 192,1060 170,1170 180,1258 C 186,1300 240,1306 264,1276 L 342,1182 L 298,1146 L 238,1222 C 234,1160 242,1100 270,1062 Z"
        shadow="M 172,1180 C 176,1240 190,1296 236,1302 L 246,1300 C 210,1270 196,1220 198,1180 Z" />
      <g transform="translate(318 1090) rotate(-10) scale(0.72)"><PhoneInHand L={L} id={`${id}p`} /></g>
    </g>
  );
};

const Scene: React.FC<{ L: Look }> = ({ L }) => (
  <>
    <Apartment L={L} id="ap" />
    <g transform="translate(770 640) scale(0.66)"><MayaBust L={L} id="maya" e={{ ...E.smug, pupil: [-0.75, 0.35] }} tilt={-8} /></g>
    <Couch L={L} id="cc" part="back" />
    <Couch L={L} id="cc" part="front" />
    <NioSitting L={L} id="nio" e={E.phone} tilt={-5} />
  </>
);

// ---------- compositions ----------
export const LookScene: React.FC<P> = ({ look }) => { const L = LOOKS[look]; return <Frame L={L}><Scene L={L} /></Frame>; };

const SHEET: [keyof typeof E, string, number, number][] = [
  ['deadpan', '#9fc4bc', 0, 0], ['smug', '#e9b98a', 0.18, 4],
  ['hype', '#f2cf6b', 0, -6], ['crushed', '#8aa0c8', 0, 5],
  ['eerie', '#3a3446', 0, 0], ['unreal', '#d98c7a', 0, -3],
];
export const LookSheet: React.FC<P> = ({ look }) => {
  const L = LOOKS[look];
  return (
    <Frame L={L}>
      {SHEET.map(([k, bg, turn, tilt], i) => {
        const x = (i % 2) * 540, y = Math.floor(i / 2) * 640;
        return (
          <g key={k}>
            <clipPath id={`tile${i}`}><rect x={x} y={y} width={540} height={640} /></clipPath>
            <g clipPath={`url(#tile${i})`}>
              <rect x={x} y={y} width={540} height={640} fill={bg} />
              <g transform={`translate(${x + 270} ${y + 330}) scale(0.78)`}><NioBust L={L} id={`s${i}`} e={E[k]} turn={turn} tilt={tilt} /></g>
            </g>
            <rect x={x} y={y} width={540} height={640} fill="none" stroke={INK} strokeWidth={L.lw} />
          </g>
        );
      })}
    </Frame>
  );
};

/** 5 s close-up: deadpan → smug → hype → crushed → deadpan. Holds, then snaps. No idle bob. */
export const CLIP_LEN = 132;
const BEATS: [number, Expr, number, number][] = [
  // frame, expression, head tilt, turn
  [0, E.deadpan, 0, 0],
  [30, E.smug, 4, 0.18],
  [56, E.hype, -6, 0],
  [86, E.crushed, 5, 0],
  [112, { ...E.deadpan, tears: 1, lid: [0.55, 0.55], pupil: [0, 0.2] }, 0, 0],
];
const BLINKS = [18, 48, 76, 124];
export const LookClip: React.FC<P> = ({ look }) => {
  const L = LOOKS[look];
  const f = Math.floor(useCurrentFrame() / 2) * 2; // on twos
  let i = 0; while (i < BEATS.length - 1 && f >= BEATS[i + 1][0]) i++;
  const [f0, e0, t0, u0] = BEATS[Math.max(0, i - 1)];
  const [f1, e1, t1, u1] = BEATS[i];
  // 4-frame snap with a little overshoot into each new pose
  const k = i === 0 ? 1 : interpolate(f - f1, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2.2)) });
  void f0;
  let e = i === 0 ? e1 : mix(e0, e1, Math.min(1, k));
  if (k > 1) e = { ...e, brow: [e.brow[0] + (k - 1) * 0.8, e.brow[1] + (k - 1) * 0.8] };
  const tilt = i === 0 ? t1 : t0 + (t1 - t0) * k, turn = i === 0 ? u1 : u0 + (u1 - u0) * k;
  // tears run down over the crushed beat
  if (i === 3) e = { ...e, tears: Math.min(1, (f - f1) / 18) };
  if (BLINKS.some((b) => f >= b && f < b + 4)) e = { ...e, lid: [1, 1] };
  // a squash-and-stretch on the hype snap only
  const sq = i === 2 ? Math.max(0, 1 - (f - f1) / 6) * 0.06 : 0;
  return (
    <>
      <Frame L={L}>
        <g transform="translate(-700 -900) scale(2.2)"><Apartment L={L} id="ap" /></g>
        <g transform={`translate(540 1060) scale(${1.5 * (1 - sq)} ${1.5 * (1 + sq)})`}><NioBust L={L} id="nio" e={e} tilt={tilt} turn={turn} /></g>
      </Frame>
      <Audio src={staticFile('sfx/room.wav')} volume={0.9} />
    </>
  );
};
