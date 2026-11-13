// The data a shot is made of. Pure types and constants: nothing here draws.
import { V } from './vec';
import { Prim } from './rig';
import { Face } from './face';

export const PW = 180, PH = 320; // native pixels, upright. Shown at 6x: 1080x1920.
export type Cam3 = { pos: V; at: V; fov: number; up?: V }; // up: which way is up in the picture (default: the world's up)
// A box in the room. yaw in degrees. `obj` groups boxes into one outlined object.
// mat: 0 plain, 1 wood with grain, 2 flecked cloth, 3 curtain folds, 4 grooved boards
export type Box = { c: V; h: V; col: string; obj: number; yaw?: number; glow?: boolean; noShadow?: boolean; mat?: number;
  sign?: string; // mat 7: the front (+z) face shows this sign from the atlas (tools/signs.py); mat 9: the top face, its top toward -z
  clock?: [number, number, number] }; // mat 8, a round wall clock: [has hands, hour hand angle, minute hand angle] (radians, clockwise from 12)
// A prop that moves (a phone in a hand): centre, three unit axes, half sizes. The +z face is `screen` if given.
// sign: a paper or card; its +z face shows this sign from the atlas, lit (not glowing like a screen)
export type Obb = { c: V; x: V; y: V; z: V; h: V; col: string; screen?: string; sign?: string };
export type Head = { c: V; rt: V; up: V; fw: V; face: Face; skin: string; hairA: string; hairB: string; blobs: number[][];
  build?: number[] }; // lashes, face width, chin length, curls, eye size (see Character.head)
// A soft body: capsules blended per material slot. A character also has a head.
export type Soft = { prims: Prim[]; origin: V; character?: boolean; head?: Head };
export type Light = { p: V; r: number; col: V; halo?: number };
// A crowd on a floor (the club): one person per cell of a grid, in world x and z. See crowd.ts.
export type CrowdSpec = {
  x0: number; z0: number; cw: number; cd: number; nx: number; nz: number; seed: number; fill: number; // the grid, and the share of cells with someone in
  dance: number; crouch: number; armsUp: number; headsUp: number; // 0..1 each
  clear: [number, number, number]; spread: number; // a circle nobody stands in (x, z, r); the crouch has spread this far from its centre
  face: [number, number]; ring: number; faces: number; // the point they face; people this near the circle face it instead; 0 party, 1 laughing, 2 the floor, 3 chanting, 4 a blank stare
  holes: [number, number, number][]; // where the cast stand (and the camera, so no head fills the lens): x, z, r. At most 8
  sit?: [number, number]; // sitting in rows: the rise of each row (+ up toward +z, - up toward -z), and seat height
  turn?: number; lookAt?: V; // how far heads turn (0..1) to look at this point
};
// A cone of light from the rig, seen in the haze: origin, direction, how fast it spreads, strength, colour.
export type Beam = { o: V; d: V; spread: number; k: number; col: V };
export type Scene3 = {
  cam: Cam3; room: V; amb: V; ambChar: V; boxes: Box[]; softs: Soft[]; lights: Light[];
  props?: Obb[]; screenTex?: string; shadows?: number[][]; time?: number; studio?: boolean;
  room0?: V; set?: number; // where the room starts (its far corner is room0 + room); 0 a room, 1 the studio, 2 the club, 3 the campus
  club?: { mood: number; bps: number; led: [number, number]; floor: [number, number, number, number] }; // mood 0 party .. 1 low and green
  beams?: Beam[]; crowd?: CrowdSpec;
  campus?: [number, number, number, number]; // set 3, the campus (campus.ts): which room, how open its door is, the door's x, near wall/quad
  campus2?: [number, number, number, number]; // more of the campus room: the near door's opening, the stairwell door's, its z, spare
  outdoor?: boolean; // a big open set (the pitch): far surfaces seen edge-on get no ink from their own depth
};
