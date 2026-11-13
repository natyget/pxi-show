// The people of Nio World who are not the main cast: the crowd at a club, the public in the street, and the
// strangers who get a line (the girl at the club). Everyone is drawn from the same few lists, so a stranger looks
// like she came out of the crowd behind her, and the crowd looks like people who could become characters.
//  - npc(seed): a full person on the same rig as the cast (faces, hands, every hold). Same seed, same person.
//  - the crowd shader (crowd.ts) draws hundreds of lighter people from the same lists, one per floor cell.
import { Character, L, T, puff, twists, MAYA } from './characters';
import { Props, NIO } from './rig';

// skin, from fair to deep; the cast's own tones are in here
export const SKINS = ['#f1cfb4', '#e6b998', '#d9ad88', '#c99a7f', '#c38d68', '#b07a56', '#a06b4c', '#8d5a3d', '#74472f', '#5c3726'];
// hair: the two close tones each texture is built from. Mostly natural, now and then dyed.
export const HAIRS: [string, string][] = [['#1e1517', '#130d0f'], ['#2e1d18', '#1e1310'], ['#492b1f', '#3a221a'], ['#6b3d24', '#56301c'],
  ['#8a5a34', '#704828'], ['#c4a06a', '#a8864f'], ['#9a3f2c', '#7c3022'], ['#b8607e', '#984a66'], ['#5464a8', '#424f8a'], ['#d9d2c8', '#bdb4a8']];
export const HAIR_W = [5, 5, 4, 2, 2, 1.5, 1, 0.5, 0.5, 0.4]; // how common each hair colour is
export const TOPS = ['#6c5466', '#a85a42', '#4f6142', '#c9a23a', '#3f6f78', '#e3d8c4', '#2c262e', '#a63d4a', '#4c5f8c', '#d27a9a', '#f0ebe2', '#7a3b47', '#8c7bb0', '#e0a03a'];
export const BOTTOMS = ['#3b4a66', '#25222a', '#b3a07f', '#5c5a64', '#7f93ab', '#4a3a32', '#3b3140', '#6b5a4f'];
export const SHOES = ['#ebe4d6', '#2b2427', '#6a4a34', '#c94a3a', '#e8e0d0'];
// hair styles, the same names in the crowd shader
export const STYLES = ['crop', 'puff', 'long', 'afro', 'buzz', 'ponytail', 'bun', 'bob', 'twists'] as const;
export type Style = (typeof STYLES)[number];

// a small seeded random, so a seed is always the same person
const rng = (seed: number) => { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const pick = <X,>(r: () => number, xs: readonly X[], w?: number[]) => {
  if (!w) return xs[Math.floor(r() * xs.length)];
  const tot = w.reduce((a, b) => a + b, 0); let v = r() * tot;
  for (let i = 0; i < xs.length; i++) { v -= w[i]; if (v <= 0) return xs[i]; } return xs[xs.length - 1];
};

// The hair of each style, as soft lumps and locks in head space (x to the person's left, y up, z out of the face; the
// head is 0.2 across). The scalp cap is always there under it.
export const hairOf = (style: Style, r: () => number): number[][] => {
  const v = (a: number) => a * (0.92 + 0.16 * r()); // no two heads of the same style quite alike
  switch (style) {
    case 'crop': return [L(0, 0.16, -0.03, v(0.15)), L(0.08, 0.15, 0.03, 0.13), L(-0.08, 0.15, 0.03, 0.13), L(0, 0.11, -0.12, 0.14),
      T(-0.06, 0.16, 0.12, 0.055, -0.02, 0.1, 0.17, 0.025), T(0.05, 0.16, 0.12, 0.055, 0.09, 0.1, 0.16, 0.025)];
    case 'puff': return [L(0, 0.14, -0.04, 0.15), ...puff(0, v(0.24), -0.12, 0.13, 12, 0.06)];
    case 'long': return [L(0.06, 0.16, -0.02, 0.15), L(-0.06, 0.16, -0.02, 0.15), L(0, 0.12, -0.12, 0.15),
      T(0.17, 0.1, 0.02, 0.08, 0.19, v(-0.32), -0.02, 0.06), T(-0.17, 0.1, 0.02, 0.08, -0.19, v(-0.32), -0.02, 0.06),
      T(0.12, 0.06, -0.13, 0.12, 0.13, -0.36, -0.12, 0.09), T(-0.12, 0.06, -0.13, 0.12, -0.13, -0.36, -0.12, 0.09), T(0, 0.05, -0.17, 0.12, 0, -0.38, -0.15, 0.1),
      T(0.02, 0.19, 0.12, 0.05, 0.15, 0.1, 0.12, 0.05), T(-0.02, 0.19, 0.12, 0.05, -0.15, 0.1, 0.12, 0.05)];
    case 'afro': return puff(0, 0.1, -0.05, v(0.25), 22, 0.1);
    case 'buzz': return [L(0, 0.1, -0.04, 0.14), L(0, 0.06, -0.1, 0.14)]; // close to the head: a buzz never stands up
    case 'ponytail': return [L(0.05, 0.16, -0.03, 0.15), L(-0.05, 0.16, -0.03, 0.15), L(0, 0.11, -0.12, 0.15),
      T(0, 0.14, -0.2, 0.07, 0, v(-0.1), -0.29, 0.05), T(0, -0.1, -0.29, 0.05, 0.01, -0.28, -0.26, 0.03)];
    case 'bun': return [L(0.05, 0.16, -0.03, 0.15), L(-0.05, 0.16, -0.03, 0.15), L(0, 0.11, -0.12, 0.15), ...puff(0, 0.27, -0.06, v(0.07), 6, 0.035)];
    case 'bob': return [L(0.06, 0.16, -0.02, 0.15), L(-0.06, 0.16, -0.02, 0.15), L(0, 0.12, -0.12, 0.15),
      T(0.17, 0.1, 0.03, 0.08, 0.2, -0.13, 0.0, 0.06), T(-0.17, 0.1, 0.03, 0.08, -0.2, -0.13, 0.0, 0.06),
      T(0.15, 0.08, -0.1, 0.1, 0.17, -0.14, -0.1, 0.075), T(-0.15, 0.08, -0.1, 0.1, -0.17, -0.14, -0.1, 0.075), T(0, 0.06, -0.17, 0.11, 0, -0.14, -0.15, 0.09),
      T(-0.13, 0.17, 0.12, 0.06, 0.12, 0.12, 0.16, 0.05)];
    case 'twists': return twists();
  }
};

export type NpcOver = Partial<{ skin: number; hair: number; style: Style; top: number; bottom: number; shoes: number; long: boolean; lashes: boolean; slight: boolean; height: number }>;
// A whole person from a seed. `over` pins any choice by its index in the lists above.
export const npc = (id: string, seed: number, over: NpcOver = {}): Character => {
  const r = rng(seed);
  const slight = over.slight ?? r() < 0.5, base: Props = slight ? MAYA : NIO;
  const ht = over.height ?? 0.94 + 0.12 * r();
  const body: Props = { ...base, shin: base.shin * ht, thigh: base.thigh * ht, torso: base.torso * (0.97 + 0.06 * r()), upperArm: base.upperArm * ht, foreArm: base.foreArm * ht,
    shoulderHalf: base.shoulderHalf * (0.92 + 0.14 * r()), torsoR: base.torsoR * (0.9 + 0.25 * r()) };
  const skin = SKINS[over.skin ?? Math.floor(r() * SKINS.length)];
  const hi = over.hair ?? HAIRS.indexOf(pick(r, HAIRS, HAIR_W)), [hairA, hairB] = HAIRS[hi];
  const style: Style = over.style ?? pick(r, STYLES);
  const long = over.long ?? r() < 0.45;
  const top = TOPS[over.top ?? Math.floor(r() * TOPS.length)], bottom = BOTTOMS[over.bottom ?? Math.floor(r() * BOTTOMS.length)], shoes = SHOES[over.shoes ?? Math.floor(r() * SHOES.length)];
  return {
    id, body, skin, hairA, hairB, hair: hairOf(style, r),
    head: { lashes: (over.lashes ?? (slight && r() < 0.7)) ? 1 : 0, width: 0.93 + 0.15 * r(), chin: 0.92 + 0.18 * r(), curls: style === 'afro' || style === 'puff' ? 1 : 0 },
    wardrobe: { out: { top: { color: top, loose: 0.02 + 0.015 * r(), sleeve: 0.55 + 0.3 * r(), long }, bottom: { color: bottom, cuff: bottom, width: 0.03 + 0.05 * r() }, shoes: { color: shoes } } },
    outfit: 'out', restFace: 'neutral',
  };
};

// The strangers who get a line in season 1, kept the same every time they appear.
// THE GIRL at the club in The Move: the one who decides Nio's search for his lens is a dance. A big curly puff, a red
// top, black jeans, white trainers. Her two friends copy her: one with a long ponytail in mustard, one with a bob in lilac.
export const GIRL = npc('girl', 41, { skin: 6, hair: 1, style: 'puff', top: 7, bottom: 1, shoes: 0, long: false, lashes: true, slight: true, height: 1.0 });
export const GIRL2 = npc('girl2', 77, { skin: 2, hair: 3, style: 'ponytail', top: 3, bottom: 0, shoes: 1, long: true, lashes: true, slight: true, height: 1.02 });
export const GIRL3 = npc('girl3', 93, { skin: 8, hair: 0, style: 'bob', top: 12, bottom: 3, shoes: 4, long: false, lashes: true, slight: true, height: 0.97 });
// THE DJ, up in the booth: short crop, a black tee.
export const DJ = npc('dj', 12, { skin: 5, hair: 0, style: 'crop', top: 6, bottom: 1, shoes: 1, long: false, lashes: false, slight: false, height: 1.04 });
// OFFICE HOURS. In the waiting room: a boy with a fidget spinner (buzz cut, an orange tee), a girl in a flower crown
// (long hair, a white top). In the lecture hall: a girl in a cap (her own colour and cap in campus.ts's cast).
export const SPINNER = npc('spinner', 211, { skin: 3, hair: 0, style: 'buzz', top: 13, bottom: 0, shoes: 2, long: false, lashes: false, slight: false, height: 0.97 });
export const CROWN = { ...npc('crown', 305, { skin: 1, hair: 4, style: 'long', top: 10, bottom: 4, shoes: 4, long: true, lashes: true, slight: true, height: 1.0 }),
  crown: ['#f0a6c0', '#f6d36a', '#ffffff', '#c58ad8'] };
export const STRANGERS: Record<string, Character> = { girl: GIRL, girl2: GIRL2, girl3: GIRL3, dj: DJ, spinner: SPINNER, crown: CROWN };
