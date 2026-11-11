// The locked character models. A character is ONLY what is written here: proportions, skin, hair shape and the
// wardrobe. Nothing in a shot may change these numbers; a new look is a new entry, approved by the founder.
import { Props, Outfit, NIO } from './rig';

export type Character = {
  id: string; body: Props; skin: string;
  hairA: string; hairB: string; // the two close tones the hair texture is built from
  hair: number[][]; // the hair's clumps, root to tip: [x, y, z, radius, x, y, z, radius] in head space (x to his left, y up, z out of the face), metres
  wardrobe: Record<string, Outfit>; outfit: string; restFace: string;
};

// NIO. Light brown skin. Short dark textured hair worn chunky on top: a soft uneven mass with a few loose clumps
// over the forehead and tight sides. Muted plum tee, wide dark trousers, cream shoes.
export const NIO_CHAR: Character = {
  id: 'nio', body: NIO, skin: '#e0b592', hairA: '#4d3a34', hairB: '#40302b',
  hair: [
    // the mass
    [0, 0.17, -0.03, 0.135, 0, 0.17, -0.03, 0.135], [0.02, 0.185, 0.07, 0.115, 0.02, 0.185, 0.07, 0.115],
    [0, 0.11, -0.15, 0.12, 0, -0.02, -0.18, 0.075],
    [0.17, 0.13, -0.02, 0.095, 0.2, 0.025, -0.05, 0.05], [-0.17, 0.13, -0.02, 0.09, -0.2, 0.035, -0.05, 0.048],
    [0.12, 0.08, -0.13, 0.09, 0.13, -0.01, -0.15, 0.06], [-0.12, 0.08, -0.13, 0.09, -0.13, -0.01, -0.15, 0.06],
    // loose clumps over the forehead, swept toward his left
    [0.03, 0.2, 0.13, 0.078, 0.09, 0.085, 0.195, 0.03], [-0.07, 0.2, 0.12, 0.072, -0.045, 0.095, 0.195, 0.028],
    [0.13, 0.17, 0.1, 0.07, 0.18, 0.075, 0.13, 0.03], [-0.14, 0.17, 0.09, 0.066, -0.185, 0.085, 0.112, 0.03],
    // short chunky tips that break the outline
    [0.06, 0.25, 0.0, 0.075, 0.13, 0.3, 0.015, 0.038], [-0.06, 0.25, -0.05, 0.07, -0.09, 0.275, -0.09, 0.046],
    [0.2, 0.16, -0.03, 0.065, 0.262, 0.185, -0.04, 0.036], [-0.2, 0.12, -0.04, 0.062, -0.258, 0.1, -0.05, 0.034],
    [0.02, 0.22, -0.12, 0.072, 0.04, 0.275, -0.17, 0.038],
  ],



  wardrobe: {
    home: { top: { color: '#6b5674', loose: 0.016, sleeve: 0.72 }, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.05 }, shoes: { color: '#e4d6c0' } },
    olive: { top: { color: '#666a48', loose: 0.016, sleeve: 0.72 }, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.05 }, shoes: { color: '#e4d6c0' } },
    bare: { top: null, bottom: { color: '#3a2e33', cuff: '#42353a', width: 0.05 }, shoes: { color: '#e4d6c0' } },
  },
  outfit: 'home', restFace: 'deadpan',
};
