// The locked character models. A character is ONLY what is written here: proportions, skin, hair shape and the
// wardrobe. Nothing in a shot may change these numbers; a new look is a new entry, approved by the founder.
import { Props, Outfit, NIO } from './rig';

export type Character = {
  id: string; body: Props; skin: string;
  hairA: string; hairB: string; // the two close tones the hair texture is built from
  hair: number[][]; // the hair's clumps, root to tip: [x, y, z, radius, x, y, z, radius] in head space (x to his left, y up, z out of the face), metres
  wardrobe: Record<string, Outfit>; outfit: string; restFace: string;
};

// Hair is built from soft lumps (L) for the mass and tapered locks (T, fat root to thin tip) for the fringe and flicks.
const L = (x: number, y: number, z: number, r: number) => [x, y, z, r, x, y, z, r];
const T = (x: number, y: number, z: number, r: number, x2: number, y2: number, z2: number, r2: number) => [x, y, z, r, x2, y2, z2, r2];

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
