// The data a shot is made of. Pure types and constants: nothing here draws.
import { V } from './vec';
import { Prim } from './rig';
import { Face } from './face';

export const PW = 180, PH = 320; // native pixels, upright. Shown at 6x: 1080x1920.
export type Cam3 = { pos: V; at: V; fov: number };
// A box in the room. yaw in degrees. `obj` groups boxes into one outlined object.
// mat: 0 plain, 1 wood with grain, 2 flecked cloth, 3 curtain folds, 4 grooved boards
export type Box = { c: V; h: V; col: string; obj: number; yaw?: number; glow?: boolean; noShadow?: boolean; mat?: number };
// A prop that moves (a phone in a hand): centre, three unit axes, half sizes. The +z face is `screen` if given.
export type Obb = { c: V; x: V; y: V; z: V; h: V; col: string; screen?: string };
export type Head = { c: V; rt: V; up: V; fw: V; face: Face; skin: string; hairA: string; hairB: string; blobs: number[][];
  build?: [number, number, number, number] }; // lashes, face width, chin length, curls (see Character.head)
// A soft body: capsules blended per material slot. A character also has a head.
export type Soft = { prims: Prim[]; origin: V; character?: boolean; head?: Head };
export type Light = { p: V; r: number; col: V; halo?: number };
export type Scene3 = {
  cam: Cam3; room: V; amb: V; ambChar: V; boxes: Box[]; softs: Soft[]; lights: Light[];
  props?: Obb[]; screenTex?: string; shadows?: number[][]; time?: number; studio?: boolean;
};
