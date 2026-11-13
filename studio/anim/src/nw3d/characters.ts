// The locked character models. A character is ONLY what is written here: proportions, skin, hair shape and the
// wardrobe. Nothing in a shot may change these numbers; a new look is a new entry, approved by the founder.
import { Props, Outfit, NIO } from './rig';

export type Character = {
  id: string; body: Props; skin: string;
  hairA: string; hairB: string; // the two close tones the hair texture is built from
  hair: number[][]; // the hair's clumps, root to tip: [x, y, z, radius, x, y, z, radius] in head space (x to his left, y up, z out of the face), metres
  wardrobe: Record<string, Outfit>; outfit: string; restFace: string;
  // the head's build. lashes: 1 draws two flicks off each eye. width: how wide the face is (1 = Nio). chin: how far down
  // the chin comes (1 = Nio). curls: 1 gives the hair a tight coiled texture instead of locks.
  // eyes: how big the eyes are (1 = Nio). glasses: small round glasses with a wire frame this colour.
  head?: { lashes?: number; width?: number; chin?: number; curls?: number; eyes?: number; glasses?: string };
  earrings?: string; // small hoops, this colour
  beard?: string; // a long beard, this colour, from the jaw down to the belt
  crown?: string[]; // a crown of small flowers round the head, in these colours
};

// Hair is built from soft lumps (L) for the mass and tapered locks (T, fat root to thin tip) for the fringe and flicks.
export const L = (x: number, y: number, z: number, r: number) => [x, y, z, r, x, y, z, r];
export const T = (x: number, y: number, z: number, r: number, x2: number, y2: number, z2: number, r2: number) => [x, y, z, r, x2, y2, z2, r2];

// NIO. Light brown skin. A soft chunky mop of dark brown hair: a lumpy mass a third bigger than his head, down over the
// ears, with a zigzag fringe swept toward his left and one cowlick. Muted plum tee, wide dark trousers, cream shoes.
export const NIO_CHAR: Character = {
  id: 'nio', body: NIO, skin: '#c99a7f', hairA: '#492b1f', hairB: '#3a221a',
  hair: [
    // the mass: big soft lumps that melt into one dome, half as wide again as his head
    L(0, 0.17, -0.03, 0.118), L(0.1, 0.15, 0.03, 0.112), L(-0.1, 0.155, 0.03, 0.112), L(0.1, 0.14, -0.1, 0.11), L(-0.1, 0.14, -0.1, 0.11), L(0, 0.175, 0.07, 0.098),
    L(0.19, 0.08, 0.0, 0.108), L(-0.19, 0.085, 0.0, 0.106), L(0.175, 0.07, -0.1, 0.1), L(-0.175, 0.07, -0.1, 0.1),
    L(0.075, 0.06, -0.185, 0.098), L(-0.075, 0.06, -0.185, 0.098), L(0, -0.04, -0.185, 0.086), L(0.125, -0.04, -0.15, 0.084), L(-0.125, -0.04, -0.15, 0.084),
    // down behind each ear, ending in a flick out
    L(0.215, -0.03, -0.075, 0.08), L(-0.215, -0.025, -0.075, 0.08),
    T(0.225, -0.07, -0.07, 0.06, 0.292, -0.135, -0.06, 0.026), T(-0.225, -0.065, -0.07, 0.06, -0.297, -0.118, -0.065, 0.028),
    // at each temple a short lock that frames the face and stops above the eye, so a profile still shows the eye
    T(0.168, 0.09, 0.085, 0.06, 0.196, 0.03, 0.05, 0.034), T(-0.168, 0.09, 0.085, 0.06, -0.194, 0.036, 0.05, 0.036),
    // the fringe: five locks, uneven, swept toward his left
    T(-0.125, 0.135, 0.115, 0.064, -0.1, 0.045, 0.165, 0.024), T(-0.06, 0.15, 0.14, 0.068, -0.025, 0.068, 0.195, 0.024),
    T(0, 0.155, 0.15, 0.068, 0.045, 0.03, 0.2, 0.022), T(0.065, 0.15, 0.14, 0.066, 0.105, 0.072, 0.168, 0.024),
    T(0.125, 0.135, 0.115, 0.062, 0.155, 0.045, 0.132, 0.024),
    // what breaks the outline: three uneven lumps on top, the tallest off-centre, and a tuft at his right
    L(0.045, 0.262, -0.035, 0.074), L(-0.085, 0.243, -0.02, 0.066), L(0.15, 0.225, -0.03, 0.062), L(-0.185, 0.19, -0.03, 0.06),
    T(-0.245, 0.11, -0.03, 0.062, -0.305, 0.128, -0.04, 0.03), L(0.255, 0.125, -0.03, 0.058),
  ],
  wardrobe: {
    home: { top: { color: '#6c5466', loose: 0.026, sleeve: 0.8 }, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.1 }, shoes: { color: '#e4d6c0' } },
    olive: { top: { color: '#666a48', loose: 0.026, sleeve: 0.8 }, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.1 }, shoes: { color: '#e4d6c0' } },
    bare: { top: null, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.1 }, shoes: { color: '#e4d6c0' } },
  },
  outfit: 'home', restFace: 'deadpan',
};

// A round puff of curls: one ball and a ring of lumps round it, so the outline is bumpy, not a circle.
export const puff = (cx: number, cy: number, cz: number, R: number, n: number, r: number): number[][] => {
  const out = [L(cx, cy, cz, R)];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, a = i * 2.39996, k = Math.sqrt(1 - y * y);
    out.push(L(cx + Math.cos(a) * k * R * 0.86, cy + y * R * 0.86, cz + Math.sin(a) * k * R * 0.86, r * (0.85 + 0.3 * ((i * 7) % 5) / 4)));
  }
  return out;
};

// MAYA. Deep brown skin, a round face, lashes. Her hair is pulled back tight and gathered in a big curly puff high on
// the back of her head. Small gold hoops. An oversized green varsity jacket with cream sleeves, wide dark trousers,
// cream trainers. A head shorter than Nio, and slighter.
export const MAYA: Props = {
  ankle: 0.055, shin: 0.29, thigh: 0.31, hipHalf: 0.07, torso: 0.37, neck: 0.12, headR: 0.2,
  shoulderHalf: 0.13, upperArm: 0.23, foreArm: 0.215, hand: 0.066, foot: 0.15,
  armR: 0.018, legR: 0.028, torsoR: 0.08,
};
export const MAYA_CHAR: Character = {
  id: 'maya', body: MAYA, skin: '#8d5a3d', hairA: '#2e1d18', hairB: '#1e1310',
  hair: [
    // the puff, high on the back of the head
    ...puff(0, 0.285, -0.11, 0.128, 12, 0.066),
    // where the hair is gathered into it: a little fuller than the tight cap
    L(0, 0.17, -0.09, 0.11),
  ],
  head: { lashes: 1, width: 1.07, chin: 0.92, curls: 1 }, earrings: '#c9a24c',
  wardrobe: {
    varsity: { top: { color: '#4f6142', loose: 0.034, sleeve: 0.8, long: true, sleeveColor: '#e2d6bd', trim: '#34402c', collar: '#34402c' },
      bottom: { color: '#3b3140', cuff: '#433847', width: 0.05 }, shoes: { color: '#ebe1cd' } },
    home: { top: { color: '#c98a6a', loose: 0.03, sleeve: 0.7 }, bottom: { color: '#3b3140', cuff: '#433847', width: 0.08 }, shoes: { color: '#ebe1cd' } },
  },
  outfit: 'varsity', restFace: 'neutral',
};

// SAMI. Tall and narrow, light olive skin, a longer face. Short black hair, combed neat, a side parting and a tidy
// lift at the front. Always slightly overdressed: a mustard knitted vest over a cream shirt with a collar, trousers
// with a fine check you have to squint at, dark brown loafers.
export const SAMI: Props = {
  ankle: 0.06, shin: 0.36, thigh: 0.37, hipHalf: 0.068, torso: 0.43, neck: 0.14, headR: 0.2,
  shoulderHalf: 0.125, upperArm: 0.27, foreArm: 0.25, hand: 0.072, foot: 0.165,
  armR: 0.018, legR: 0.027, torsoR: 0.078,
};
export const SAMI_CHAR: Character = {
  id: 'sami', body: SAMI, skin: '#d9ad88', hairA: '#2a2226', hairB: '#1b1518',
  hair: [
    // short at the sides (the cap alone) and neat on top, parted on his left: the front is combed across to his right in
    // one smooth sweep, so the hairline runs high on the parting side and low over his right temple.
    L(0.0, 0.13, -0.04, 0.125), L(-0.06, 0.15, 0.02, 0.1),
    T(0.11, 0.18, 0.09, 0.045, -0.03, 0.2, 0.13, 0.058), T(-0.03, 0.2, 0.13, 0.058, -0.165, 0.11, 0.115, 0.042),
  ],
  head: { width: 0.94, chin: 1.12 },
  wardrobe: {
    party: { top: { color: '#a8894a', loose: 0.02, sleeve: 0.8, long: true, sleeveColor: '#e6dcc8', cuffs: '#e6dcc8', collar: '#efe6d4', trim: '#8f7440' },
      bottom: { color: '#6b5a4f', cuff: '#6b5a4f', width: 0.035, check: true }, shoes: { color: '#3a2a24' } },
  },
  outfit: 'party', restFace: 'neutral',
};

// Short twists all over the top: little tapered locks standing out from the scalp, leaning up and back.
export const twists = (): number[][] => {
  const out: number[][] = [L(0, 0.14, -0.04, 0.15)];
  for (let i = 0; i < 17; i++) {
    const y = 0.25 + 0.75 * (1 - i / 16), a = i * 2.39996, k = Math.sqrt(1 - y * y);
    const d = [Math.cos(a) * k, y, Math.sin(a) * k * 1.05 - 0.15];
    if (d[2] > 0.55 && d[1] < 0.6) continue; // none over the forehead
    const r0 = 0.2, r1 = 0.275 + 0.02 * ((i * 5) % 3) / 2;
    out.push(T(d[0] * r0, 0.012 + d[1] * r0, -0.012 + d[2] * r0, 0.034, d[0] * r1, 0.03 + d[1] * r1, -0.03 + d[2] * r1, 0.016));
  }
  return out;
};

// THEO, at the party. Medium height and solid, warm brown skin, short twists. A rust hoodie, light
// khaki trousers, off-white trainers. Always holding a drink he is not drinking, to point with.
export const THEO: Props = { ...NIO, shoulderHalf: 0.14, torsoR: 0.098, armR: 0.022, legR: 0.032, torso: 0.39 };
export const THEO_CHAR: Character = {
  id: 'theo', body: THEO, skin: '#a06b4c', hairA: '#2b1d18', hairB: '#1c1310',
  hair: twists(),
  head: { width: 1.04, chin: 1.04, curls: 1 },
  wardrobe: { party: { top: { color: '#a85a42', loose: 0.03, sleeve: 0.8, long: true, trim: '#8e4a36' },
    bottom: { color: '#b3a07f', cuff: '#a8957a', width: 0.05 }, shoes: { color: '#ddd6c8' } } },
  outfit: 'party', restFace: 'neutral',
};

// IMANE, a year below, at the party. Small, light brown skin, lashes, straight black hair to the jaw with a middle
// parting. A burgundy long-sleeved top, light blue jeans, black shoes.
export const IMANE: Props = { ...MAYA, shoulderHalf: 0.118, torsoR: 0.077 };
export const IMANE_CHAR: Character = {
  id: 'imane', body: IMANE, skin: '#c38d68', hairA: '#241c1e', hairB: '#171214',
  hair: [
    L(0.06, 0.16, -0.02, 0.15), L(-0.06, 0.16, -0.02, 0.15), L(0, 0.12, -0.12, 0.15),
    // straight sides down to the jaw, in front of the ears, and the back down to the nape
    T(0.17, 0.1, 0.03, 0.08, 0.2, -0.13, 0.0, 0.06), T(-0.17, 0.1, 0.03, 0.08, -0.2, -0.13, 0.0, 0.06),
    T(0.15, 0.08, -0.1, 0.1, 0.17, -0.14, -0.1, 0.075), T(-0.15, 0.08, -0.1, 0.1, -0.17, -0.14, -0.1, 0.075), T(0, 0.06, -0.17, 0.11, 0, -0.14, -0.15, 0.09),
    // the middle parting: the hair falls away to each side from a line down the middle of the forehead
    T(0.02, 0.19, 0.12, 0.05, 0.14, 0.1, 0.13, 0.05), T(-0.02, 0.19, 0.12, 0.05, -0.14, 0.1, 0.13, 0.05),
  ],
  head: { lashes: 1, width: 0.98, chin: 1.02 },
  wardrobe: { party: { top: { color: '#7a3b47', loose: 0.022, sleeve: 0.8, long: true },
    bottom: { color: '#7f93ab', cuff: '#8a9db3', width: 0.035 }, shoes: { color: '#2b2427' } } },
  outfit: 'party', restFace: 'suspicious',
};

// PROFESSOR HAVERBROOK ("Prof H"), Office Hours. Enormous and soft: a head taller than Nio and nearly twice as wide, one
// round body from the jaw to the knees with no neck to speak of, big soft hands. A wide face with small eyes behind tiny
// round wire glasses. Soft ash-brown hair, combed neatly to one side. A camel cardigan worn open over a pale blue
// collared shirt, brown cords, brown shoes. He fills a doorway sideways.
export const PROF_H: Props = { ...NIO, ankle: 0.07, shin: 0.43, thigh: 0.43, hipHalf: 0.115, torso: 0.66, neck: 0.1,
  shoulderHalf: 0.27, upperArm: 0.33, foreArm: 0.3, hand: 0.09, foot: 0.19, armR: 0.042, legR: 0.062, torsoR: 0.2, belly: 0.06, handK: 1.45 };
export const PROF_H_CHAR: Character = {
  id: 'profH', body: PROF_H, skin: '#e2b49a', hairA: '#857262', hairB: '#665649',
  hair: [
    // the mass: full and soft at the back and over the ears, a little wider than his face
    L(0.03, 0.15, -0.05, 0.15), L(-0.09, 0.14, -0.02, 0.135), L(0.09, 0.13, -0.02, 0.13), L(0, 0.09, -0.13, 0.15),
    L(0.21, 0.04, -0.06, 0.085), L(-0.21, 0.05, -0.06, 0.085), L(0.15, -0.01, -0.14, 0.09), L(-0.15, 0.0, -0.14, 0.09), L(0, -0.03, -0.17, 0.1),
    T(0.225, 0.0, -0.04, 0.06, 0.255, -0.06, -0.02, 0.03), T(-0.225, 0.005, -0.04, 0.06, -0.26, -0.05, -0.02, 0.03),
    // a side parting high on his right; from it the hair is combed across his forehead in one soft wave that dips low
    // over his left brow and curls up at the temple
    L(-0.15, 0.16, 0.05, 0.07), T(-0.11, 0.2, 0.09, 0.06, -0.17, 0.14, 0.12, 0.045),
    T(-0.07, 0.205, 0.1, 0.06, 0.05, 0.15, 0.16, 0.055), T(0.05, 0.15, 0.16, 0.055, 0.15, 0.085, 0.15, 0.045),
    T(0.15, 0.085, 0.15, 0.045, 0.205, 0.075, 0.095, 0.026), T(-0.01, 0.19, 0.14, 0.05, 0.1, 0.12, 0.17, 0.03),
  ],
  head: { width: 1.24, chin: 1.12, eyes: 0.55, glasses: '#7a6040' },
  wardrobe: { lecture: { top: { color: '#a8834f', loose: 0.03, sleeve: 0.8, long: true, trim: '#94723f', open: '#c5cfd8' },
    bottom: { color: '#5c4a3e', cuff: '#54443a', width: 0.05 }, shoes: { color: '#3b2a24' } } },
  outfit: 'lecture', restFace: 'neutral',
};

// DARNELL, Office Hours: the one who has waited longest. Tall, thin and very calm, deep brown skin, a short black fade
// and a black beard down to his belt. A faded sage hoodie, grey joggers, old white trainers.
export const DARNELL: Props = { ...NIO, shin: 0.34, thigh: 0.36, torso: 0.42, shoulderHalf: 0.125, torsoR: 0.08, armR: 0.019, legR: 0.028 };
export const DARNELL_CHAR: Character = {
  id: 'darnell', body: DARNELL, skin: '#74472f', hairA: '#1e1517', hairB: '#130d0f',
  // a short fade: close to the head, a crisp line across the forehead, nothing standing up
  hair: [L(0, 0.1, -0.035, 0.14), L(0.06, 0.1, 0.02, 0.125), L(-0.06, 0.1, 0.02, 0.125), L(0, 0.06, -0.1, 0.14)],
  head: { width: 0.96, chin: 1.08 }, beard: '#1e1517',
  wardrobe: { out: { top: { color: '#7d8c78', loose: 0.03, sleeve: 0.8, long: true, trim: '#6f7d6a' },
    bottom: { color: '#6a6a70', cuff: '#606066', width: 0.04 }, shoes: { color: '#d8d2c4' } } },
  outfit: 'out', restFace: 'deadpan',
};
