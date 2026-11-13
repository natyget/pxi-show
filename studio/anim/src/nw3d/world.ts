// THE WORLD RULES. A shot is described with names only: a set, one of its cameras, and for each character a place
// to be, an action, a face and an outfit. Every name must exist in the registries below. validate() refuses
// anything else, and buildShot() will not draw a shot that fails. So a later model cannot put a character inside
// the bed, invent a pose, change a face off-model, slide a walk, or point the camera through a wall.
// To add to the world (a new place, action, outfit, camera, set or character), add an entry here or in
// characters.ts, render it, and get the founder's approval. Never work around the check.
import { V, sub, norm, cross, dot } from './vec';
import { clipLength } from './rig';
import { Face, FACES, gaze } from './face';
import { lips, Cues } from '../lips/mouths';
import { Scene3, Cam3 } from './types';
import { Character, NIO_CHAR, MAYA_CHAR, SAMI_CHAR, THEO_CHAR, IMANE_CHAR, PROF_H_CHAR, DARNELL_CHAR } from './characters';
import { STRANGERS } from './people';
import { CLUB_W, CLUB_H, CLUB_D, CLUB_CAMS, ClubSpec, clubShot, clubAt } from './club';
import { CAMPUS_ROOMS, CampusRoom, CampusOpts, campusShot, WAIT_MARKS, WAIT_SOLIDS, WAIT_INSERTS, HALL_MARKS, HALL_SOLIDS, HALL_INSERTS } from './campus';
import { Act, shot, CAMS, ROOM, X, C } from './room';

export const CHARACTERS: Record<string, Character> = { nio: NIO_CHAR, maya: MAYA_CHAR, sami: SAMI_CHAR, theo: THEO_CHAR, imane: IMANE_CHAR, profH: PROF_H_CHAR, darnell: DARNELL_CHAR, ...STRANGERS };

// A place a character can be. s and z as in room.ts. yaw: the way he faces there by default. seat: sit height.
// on: stand on top of something this high (the desk, the bed). A place with `on` may be inside a piece of furniture.
// who: whose place this is, when it is one person's (the lectern is Prof H's): the world check frames his head, not an everyman's.
export type Mark = { s: number; z: number; yaw: number; seat?: number; on?: number; who?: string };
export type SetDef = {
  room: V; cameras: Record<string, Cam3>; marks: Record<string, Mark>;
  solids: { name: string; s: [number, number]; z: [number, number] }[]; // furniture footprints nobody may stand in
  dress?: string; // how the room is dressed: left out, the everyday room; 'party', the night of the party
  flash?: boolean; // every shot is a photo taken with the flash on (the party pictures on his phone)
  club?: true; // the club (club.ts): its own room, light and crowd. A shot there may carry `club` (mood, crowd)
  inserts?: string[]; // cameras on a thing (a sign, a clock), not on a person: they need not see a place
  campus?: CampusRoom; // a room of the campus (campus.ts). A shot there may carry `campus` (the door, NOW SERVING, the clock)
};
export const SETS: Record<string, SetDef> = {
  nioRoom: {
    room: ROOM,
    // Every camera stands inside the room and was looked at by a person. Each place below is seen by at least one.
    cameras: {
      wide: CAMS.wide, // the room, toward the window
      full: C([2.05, 1.0, 0.1], [2.05, 0.86, 2.45], 58), // head to toe across the rug: the camera for a walk
      mid: C([2.3, 1.3, 0.9], [2.0, 1.16, 2.5], 36), // waist up at the rug
      close: C([2.3, 1.44, 1.0], [2.0, 1.4, 2.5], 38), // his head at the rug
      low: CAMS.low, // from the floor, looking up at him
      side: C([0.6, 1.25, 2.0], [2.2, 1.05, 2.6], 46), // his profile at the rug, from the bed side
      high: CAMS.high, // from the top corner, down on the rug and the bed edge
      bed: CAMS.bed, // sitting on the edge of the bed
      atLamp: C([0.35, 1.36, 0.9], [0.7, 1.05, 2.65], 60), // at the nightstand, with the lamp
      atDresser: C([3.5, 1.36, 1.85], [2.85, 1.12, 3.1], 46), // at the dresser
      atDesk: C([1.25, 1.3, 0.45], [3.0, 1.05, 1.4], 42), // at the desk when he turns round from it
      screen: C([3.72, 1.12, 1.3], [2.8, 1.38, 1.3], 56), // from behind the laptop, when he is working at the desk
      atDoor: C([2.55, 1.35, 3.0], [1.05, 1.05, 0.6], 50), // the reverse angle: from the window end, back toward the door
    },
    marks: {
      rug: { s: 2.0, z: 2.5, yaw: 180 }, rugLeft: { s: 1.55, z: 2.45, yaw: 180 }, rugRight: { s: 2.55, z: 2.45, yaw: 180 },
      bedEdge: { s: 1.6, z: 3.02, yaw: 180, seat: 0.47 }, window: { s: 2.55, z: 3.85, yaw: 0 },
      nightstand: { s: 1.0, z: 2.55, yaw: 90 }, dresser: { s: 2.8, z: 3.1, yaw: 270 }, desk: { s: 2.8, z: 1.3, yaw: 270 },
      door: { s: 0.9, z: 0.7, yaw: 0 }, // just inside the door, facing into the room
    },
    solids: [
      { name: 'the bed', s: [0.0, 2.14], z: [3.1, 4.4] }, { name: 'the nightstand', s: [0.06, 0.7], z: [2.52, 3.04] },
      { name: 'the dresser', s: [3.06, 3.8], z: [2.78, 3.82] }, { name: 'the desk', s: [3.06, 3.78], z: [0.78, 1.82] },
      { name: 'the clothes basket', s: [3.34, 3.7], z: [2.3, 2.66] }, { name: 'the backpack', s: [3.3, 3.7], z: [0.36, 0.66] },
    ],
  },
};
// The night of the party, in the same room: the big light on, fairy lights, cups everywhere. Bright, so faces read.
// Every shot here is one of the photos on his phone the morning after, taken with the flash.
SETS.party = {
  ...SETS.nioRoom, dress: 'party', flash: true,
  marks: {
    ...SETS.nioRoom.marks,
    deskTop: { s: 3.38, z: 1.02, yaw: 270, on: 0.74 }, // standing on the desk
    bedEdgeLeft: { s: 1.0, z: 3.02, yaw: 180, seat: 0.47 }, // a second place on the edge of the bed
    doorLeft: { s: 0.7, z: 0.8, yaw: 0 }, doorRight: { s: 1.18, z: 0.78, yaw: 0 }, // two people by the door
    dance: { s: 2.15, z: 2.75, yaw: 180 }, // the middle of the rug, toward the window
  },
  cameras: {
    ...SETS.nioRoom.cameras,
    party: C([1.9, 1.42, 0.12], [1.85, 0.95, 3.0], 60), // the whole room from the door, the window and the fairy lights behind
    deskUp: C([2.1, 1.05, 1.9], [3.3, 1.75, 1.05], 62), // from the rug, up at whoever is on the desk
    doorPhoto: C([0.95, 1.5, 2.9], [0.94, 1.15, 0.8], 50), // from the middle of the room toward the door, at two people there
    bedPhoto: C([1.3, 1.12, 0.85], [1.3, 0.98, 3.0], 52), // at the edge of the bed, across the rug
    dancePhoto: C([2.15, 1.5, 1.55], [2.15, 1.25, 2.75], 46), // at the middle of the rug
    over: C([2.45, 2.15, 1.35], [2.15, 1.05, 2.75], 50), // from up high, over the rug
  },
};

// THE CLUB (club.ts), first used in The Move: a packed floor round a circle the crowd clears for Nio, the DJ booth up
// against the far wall, the bar on the right. Marks are where The Move's board puts people.
SETS.club = {
  room: [CLUB_W, CLUB_H, CLUB_D], club: true, cameras: CLUB_CAMS,
  marks: {
    circle: { s: 6.0, z: 6.4, yaw: 180 }, // the middle of the cleared circle, facing the back of the room
    circleFront: { s: 6.0, z: 5.6, yaw: 0 }, circleLeft: { s: 5.0, z: 6.6, yaw: 90 }, circleRight: { s: 7.0, z: 6.6, yaw: 270 },
    theo: { s: 5.0, z: 5.5, yaw: 45 }, // front left of the circle, filming
    maya: { s: 5.25, z: 7.0, yaw: 120 }, // in the circle, behind Theo's line
    girl: { s: 6.65, z: 6.5, yaw: 200 }, // right of Nio
    girl2: { s: 6.95, z: 7.3, yaw: 205 }, girl3: { s: 6.4, z: 7.5, yaw: 190 }, // her two friends, behind her
    dj: { s: 6.0, z: 12.45, yaw: 180, on: 0.85 }, // behind the decks, up on the booth
  },
  solids: [{ name: 'the DJ booth', s: [4.0, 8.0], z: [11.4, 14] }, { name: 'the bar', s: [10.7, 12], z: [2.5, 8.7] },
    { name: 'the left speakers', s: [2.6, 3.6], z: [12.6, 13.8] }, { name: 'the right speakers', s: [8.4, 9.4], z: [12.6, 13.8] }, { name: 'the low wall', s: [0.45, 0.75], z: [2.2, 10.8] }],
};

// OFFICE HOURS (campus.ts). THE WAITING ROOM outside Prof H's office: two rows of chairs facing across, the inner door
// with NOW SERVING over it, the clock, the ticket machine. Seats are numbered from the way in: L on the left, R on the right.
SETS.waiting = { room: CAMPUS_ROOMS.waiting.size, campus: 'waiting', cameras: CAMPUS_ROOMS.waiting.cams, inserts: WAIT_INSERTS, marks: WAIT_MARKS, solids: WAIT_SOLIDS };
// THE LECTURE HALL: seven rows of desks climbing from the lectern, an aisle with steps up the right. Students fill the
// rows (a shot's campus.crowd: how full, campus.turn: how far every head has turned to stare at Nio).
SETS.hall = { room: CAMPUS_ROOMS.hall.size, campus: 'hall', cameras: CAMPUS_ROOMS.hall.cams, inserts: HALL_INSERTS, marks: HALL_MARKS, solids: HALL_SOLIDS };

// What a body can do. Each is real human motion fitted to the character. speed: metres per second it must travel.
export type Action = { clip: string; loop: boolean; stance: number; arms: number; upright: number; seat?: boolean; speed?: number };
export const ACTIONS: Record<string, Action> = {
  stand: { clip: 'Idle_Loop', loop: true, stance: 0.5, arms: 0.35, upright: 0.85 },
  talk: { clip: 'Idle_Talking_Loop', loop: true, stance: 0.5, arms: 0.8, upright: 0.7 },
  walk: { clip: 'Walk_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, speed: 1.0 },
  jog: { clip: 'Jog_Fwd_Loop', loop: true, stance: 1, arms: 1, upright: 0.2, speed: 2.4 },
  sit: { clip: 'Sitting_Idle_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, seat: true },
  sitTalk: { clip: 'Sitting_Talking_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, seat: true },
  dance: { clip: 'Dance_Loop', loop: true, stance: 1, arms: 1, upright: 0 },
  crouch: { clip: 'Crouch_Idle_Loop', loop: true, stance: 1, arms: 1, upright: 0.55 },
  pickUp: { clip: 'PickUp_Table', loop: false, stance: 0.8, arms: 1, upright: 0 },
  touch: { clip: 'Interact', loop: false, stance: 0.8, arms: 1, upright: 0.3 },
};
// What the hands are doing, over whatever the action does with the body.
//  phone: reading it in one hand. selfie: at arm's length, up and out, looking into it. show-phone: held out at
//  shoulder height, the screen turned to whoever he is showing. phone-knee: sitting, the phone face up on his knee (a
//  call on speaker). arms-crossed. point: one arm out, the first finger pointing. arm-up: one fist straight up.
//  arms-up: both arms up in a V. cup: a party cup at the waist. cup-point: the cup held out, to point with.
//  asleep: sitting, the head dropped onto one shoulder (use the face "asleep").
//  photo: the phone up at eye height, taking a picture. sweep: crouched, both hands circling flat on the floor (with the action crouch).
export const HOLDS = ['phone', 'arms-crossed', 'selfie', 'show-phone', 'phone-knee', 'point', 'arm-up', 'arms-up', 'cup', 'cup-point', 'asleep', 'photo', 'sweep', 'spinner', 'capOff', 'pen'] as const;
const SEATED_HOLDS = ['phone-knee', 'asleep', 'spinner', 'pen'], TRAVEL_HOLDS = ['phone', 'cup'];

export type ActorSpec = {
  who: string; outfit?: string;
  at: string; to?: string; // marks of the set. `to` only with an action that travels
  facing?: string; // 'camera' or a mark to face. Left out: the mark's own facing, or the way he travels
  action: string; face: string | [number, string][]; // one face, or [frame, face] changes
  gaze?: [number, number]; hold?: (typeof HOLDS)[number]; look?: 'camera';
  back?: true; // say so when the shot means to show his back. Otherwise his face must be visible.
  speak?: [number, Cues][]; // the lines he says: [the frame the line starts, its mouth cues from engine/tools/lipsync.py]
  mouth?: number; // mouth size for this character (1 = Nio)
};
// Talking: the mouth follows the voice line, shape by shape (src/lips/mouths.ts), over the face he has.
const speaking = (f: Face, lines: [number, Cues][] | undefined, frame: number, size = 1): Face => {
  const l = lines && [...lines].reverse().find(([at]) => frame + 1 >= at);
  return l ? lips(f, l[1], frame - l[0], size) : f;
};
export type ShotSpec = { set: string; camera: string; frames: number; actors: ActorSpec[]; club?: ClubSpec; campus?: CampusOpts };

const names = (o: object) => Object.keys(o).join(', ');
const faceAt = (f: ActorSpec['face'], frame: number): string => typeof f === 'string' ? f : [...f].reverse().find(([at]) => frame >= at)?.[1] ?? f[0][1];
const yawTo = (from: Mark | { s: number; z: number }, s: number, z: number) => (Math.atan2(-(s - from.s), z - from.z) * 180) / Math.PI;

// Where a character standing (or sitting) at a place lands in a camera's picture.
// 'in': the whole head is inside. 'out': the whole body is outside. 'cut': the edge of the picture slices him.
export type Framing = 'in' | 'out' | 'cut' | 'steep' | 'near';
// where his head is at a place: an everyman's (Nio's height), or this character's, taller or shorter than Nio
const headOf = (mk: Mark, ch?: Character): V => {
  const b = (ch ?? CHARACTERS[mk.who ?? ''])?.body, up = b ? b.torso + b.neck + b.headR - 0.725 : 0, legs = b ? b.ankle + b.shin + b.thigh - 0.72 : 0;
  return [X(mk.s), (mk.seat !== undefined ? mk.seat + 0.75 + up : 1.42 + up + legs) + (mk.on ?? 0), mk.z];
};
export const framing = (cam: Cam3, mk: Mark, ch?: Character): Framing => {
  const F = norm(sub(cam.at, cam.pos)), R = norm(cross(F, [0, 1, 0])), U = cross(R, F), d = sub(headOf(mk, ch), cam.pos);
  const zc = dot(d, F); if (zc < 0.3) return 'out';
  const ty = Math.tan((cam.fov * Math.PI) / 360) * zc, tx = ty * (180 / 320); // half the picture, in metres, at his distance
  const x = Math.abs(dot(d, R)), y = dot(d, U);
  if (x - 0.4 >= tx) return 'out';
  if (!(x + 0.21 <= tx && y + 0.12 <= ty && y - 0.26 >= -ty)) return 'cut'; // brows to collar, the full width of the head. Hair may crop.
  const flat = Math.hypot(d[0], d[2]), el = (Math.atan2(-d[1], flat) * 180) / Math.PI; // how far above his head the camera is
  if (Math.hypot(flat, d[1]) < 0.7) return 'near'; // the lens would be in his face
  if (el > 32 || el < -45) return 'steep'; // from too far above only his hair shows
  return 'in';
};
// Does the camera see his face? yaw: the way he faces. True from the front round to a clean profile.
export const facesCamera = (cam: Cam3, mk: { s: number; z: number }, yaw: number) => {
  const a = (yaw * Math.PI) / 180, to = norm([cam.pos[0] - X(mk.s), 0, cam.pos[2] - mk.z]);
  return Math.sin(a) * to[0] + Math.cos(a) * to[2] > -0.35;
};
export const seenBy = (set: SetDef, mk: Mark, ch?: Character) => Object.keys(set.cameras).filter((c) => framing(set.cameras[c], mk, ch) === 'in').join(', ');

// Check the registries themselves. Run after adding a place, a camera or a set.
export const checkWorld = (): string[] => {
  const e: string[] = [];
  for (const [sn, set] of Object.entries(SETS)) {
    for (const [mn, mk] of Object.entries(set.marks)) {
      if (!(mk.s > 0.15 && mk.s < set.room[0] - 0.15 && mk.z > 0.15 && mk.z < set.room[2] - 0.15)) e.push(`${sn}: place "${mn}" is outside the room or inside a wall.`);
      const hit = mk.seat === undefined && mk.on === undefined && set.solids.find((o) => mk.s > o.s[0] && mk.s < o.s[1] && mk.z > o.z[0] && mk.z < o.z[1]);
      if (hit) e.push(`${sn}: place "${mn}" is inside ${hit.name}.`);
      if (!seenBy(set, mk)) e.push(`${sn}: no camera sees place "${mn}". Add a camera for it or remove the place.`);
    }
    for (const [cn, cam] of Object.entries(set.cameras)) {
      const s = X(0) - cam.pos[0]; // the room's left wall is at world x = X(0) in every set
      if (!(s > 0.02 && s < set.room[0] - 0.02 && cam.pos[1] > 0.1 && cam.pos[1] < set.room[1] - 0.05 && cam.pos[2] > 0.02 && cam.pos[2] < set.room[2] - 0.02)) e.push(`${sn}: camera "${cn}" is outside the room.`);
      const hit = set.solids.find((o) => s > o.s[0] && s < o.s[1] && cam.pos[2] > o.z[0] && cam.pos[2] < o.z[1] && cam.pos[1] < 1.0);
      if (hit) e.push(`${sn}: camera "${cn}" is inside ${hit.name}.`);
      if (!set.inserts?.includes(cn) && !Object.values(set.marks).some((mk) => framing(cam, mk) === 'in')) e.push(`${sn}: camera "${cn}" sees no place. Remove it or add a place.`);
    }
  }
  return e;
};

export const validate = (spec: ShotSpec): string[] => {
  const e: string[] = [];
  const set = SETS[spec.set];
  if (!set) return [`There is no set "${spec.set}". Sets: ${names(SETS)}.`];
  const cam = set.cameras[spec.camera];
  if (!cam) e.push(`There is no camera "${spec.camera}" in ${spec.set}. Cameras: ${names(set.cameras)}.`);
  if (!(spec.frames >= 1 && spec.frames <= 24 * 30)) e.push('frames must be between 1 and 720 (30 seconds).');
  if (!spec.actors || spec.actors.length > 5) e.push('A shot holds at most five characters.');
  const spots: { who: string; s: number; z: number }[] = [];
  (spec.actors ?? []).forEach((a) => {
    const ch = CHARACTERS[a.who];
    if (!ch) { e.push(`There is no character "${a.who}". Characters: ${names(CHARACTERS)}.`); return; }
    if (a.outfit && !ch.wardrobe[a.outfit]) e.push(`${a.who} has no outfit "${a.outfit}". Wardrobe: ${names(ch.wardrobe)}.`);
    const act = ACTIONS[a.action];
    if (!act) e.push(`There is no action "${a.action}". Actions: ${names(ACTIONS)}.`);
    (typeof a.face === 'string' ? [a.face] : a.face.map((f) => f[1])).forEach((f) => { if (!FACES[f]) e.push(`There is no face "${f}". Faces: ${names(FACES)}.`); });
    if (a.gaze && a.gaze.some((g) => !(g >= -1 && g <= 1))) e.push(`${a.who}: gaze runs from -1 to 1.`);
    if (a.hold && !HOLDS.includes(a.hold)) e.push(`${a.who} cannot hold "${a.hold}". Holds: ${HOLDS.join(', ')}.`);
    if (a.hold === 'capOff' && !ch.cap) e.push(`${a.who} has no cap to take off.`);
    const m = set.marks[a.at], m2 = a.to ? set.marks[a.to] : undefined;
    if (!m) { e.push(`There is no place "${a.at}" in ${spec.set}. Places: ${names(set.marks)}.`); return; }
    if (a.to && !m2) e.push(`There is no place "${a.to}" in ${spec.set}. Places: ${names(set.marks)}.`);
    if (a.facing && a.facing !== 'camera' && !set.marks[a.facing]) e.push(`${a.who} cannot face "${a.facing}". Face "camera" or a place: ${names(set.marks)}.`);
    if (!act) return;
    if (act.seat && m.seat === undefined) e.push(`${a.who} cannot ${a.action} at "${a.at}": there is nothing to sit on there.`);
    if (!act.seat && m.seat !== undefined) e.push(`"${a.at}" is a seat. ${a.who} can only sit or sitTalk there.`);
    if (act.speed && !m2) e.push(`${a.who}: "${a.action}" must go somewhere. Give "to". Nobody walks on the spot.`);
    if (!act.speed && m2) e.push(`${a.who}: "${a.action}" stays in one place. Use walk or jog to travel.`);
    if (act.speed && m2 && spec.frames > 1) {
      const d = Math.hypot(m2.s - m.s, m2.z - m.z), v = d / (spec.frames / 24);
      if (v < act.speed * 0.7 || v > act.speed * 1.3) e.push(`${a.who} would slide: ${a.action} covers ${act.speed} m a second, but ${a.at} to ${a.to} in ${spec.frames} frames is ${v.toFixed(2)}. Use about ${Math.round((d / act.speed) * 24)} frames.`);
      for (let k = 0; k <= 8; k++) { const s = m.s + ((m2.s - m.s) * k) / 8, z = m.z + ((m2.z - m.z) * k) / 8;
        const hit = set.solids.find((o) => s > o.s[0] - 0.12 && s < o.s[1] + 0.12 && z > o.z[0] - 0.12 && z < o.z[1] + 0.12);
        if (hit) { e.push(`${a.who} would walk through ${hit.name} going from ${a.at} to ${a.to}.`); break; } }
    }
    if (a.hold && act.speed && !TRAVEL_HOLDS.includes(a.hold)) e.push(`${a.who} cannot keep "${a.hold}" while travelling. Holds that can travel: ${TRAVEL_HOLDS.join(', ')}.`);
    if (a.hold && SEATED_HOLDS.includes(a.hold) && !act.seat) e.push(`${a.who}: "${a.hold}" is for sitting. Use sit or sitTalk.`);
    if (!act.loop && spec.frames > clipLength(act.clip)) e.push(`"${a.action}" lasts ${clipLength(act.clip)} frames; the shot asks for ${spec.frames}.`);
    spots.push({ who: a.who, s: m.s, z: m.z });
    // is he in the picture?
    if (cam) {
      const why = (name: string, f: Framing) => ({ in: '', out: `is not in the picture`, cut: `would be cut by the edge of the picture`, steep: `would be seen from too steep an angle to read his face`, near: `is too close to the lens` }[f]
        + ` from camera "${spec.camera}". Cameras that see "${name}": ${seenBy(set, set.marks[name], ch) || 'none'}.`);
      const low = (mk: Mark): Mark => (a.action === 'crouch' && mk.seat === undefined ? { ...mk, seat: 0.0 } : mk); // crouched, the head is down at a sitter's height
      const f1 = framing(cam, low(m), ch), f2 = m2 ? framing(cam, low(m2), ch) : undefined;
      if (!f2) { if (f1 !== 'in') e.push(`${a.who} at "${a.at}" ${why(a.at, f1)}`); }
      else { if (f1 !== 'in' && f1 !== 'out') e.push(`${a.who} at "${a.at}" ${why(a.at, f1)}`); if (f2 !== 'in' && f2 !== 'out') e.push(`${a.who} at "${a.to}" ${why(a.to!, f2)}`);
        if (f1 === 'out' && f2 === 'out') e.push(`${a.who} is never in the picture from camera "${spec.camera}" on the way from ${a.at} to ${a.to}.`); }
      // his face: the camera must see it, unless the shot says it means his back
      const yaw = m2 ? yawTo(m, m2.s, m2.z) : a.facing === 'camera' ? undefined : a.facing && set.marks[a.facing] ? yawTo(m, set.marks[a.facing].s, set.marks[a.facing].z) : m.yaw;
      const seen = yaw === undefined || facesCamera(cam, m2 ?? m, yaw);
      if (!seen && !a.back) e.push(`${a.who} would have his back to camera "${spec.camera}" at "${a.to ?? a.at}". Pick a camera in front of him, face him another way, or say "back": true if the shot means it.`);
      if (seen && a.back) e.push(`${a.who}: "back": true, but camera "${spec.camera}" sees his face at "${a.to ?? a.at}".`);
    }
  });
  spots.forEach((p, i) => spots.slice(i + 1).forEach((q) => { if (Math.hypot(p.s - q.s, p.z - q.z) < 0.4) e.push(`${p.who} and ${q.who} are standing inside each other.`); }));
  return e;
};

// Turn an approved spec into the scene for one frame. Bodies move on twos, like drawn animation.
export const buildShot = (spec: ShotSpec, frame: number): Scene3 => {
  const errs = validate(spec);
  if (errs.length) throw new Error('This shot is refused by the world rules:\n - ' + errs.join('\n - '));
  const set = SETS[spec.set], cam = set.cameras[spec.camera];
  const t = Math.floor(frame / 2) * 2;
  const acts: Act[] = spec.actors.map((a) => {
    const ch = CHARACTERS[a.who], act = ACTIONS[a.action], m = set.marks[a.at], m2 = a.to ? set.marks[a.to] : undefined;
    const k = m2 ? Math.min(1, t / Math.max(1, spec.frames - 1)) : 0;
    const s = m.s + ((m2?.s ?? m.s) - m.s) * k, z = m.z + ((m2?.z ?? m.z) - m.z) * k;
    let yaw = m2 ? yawTo(m, m2.s, m2.z) : m.yaw;
    if (!m2 && a.facing === 'camera') yaw = (Math.atan2(cam.pos[0] - X(s), cam.pos[2] - z) * 180) / Math.PI;
    else if (!m2 && a.facing) yaw = yawTo({ s, z }, set.marks[a.facing].s, set.marks[a.facing].z);
    let face: Face = FACES[faceAt(a.face, frame)]; if (a.gaze) face = gaze(face, a.gaze[0], a.gaze[1]);
    face = speaking(face, a.speak, frame, a.mouth);
    return { who: ch, clip: act.clip, t: act.loop ? t : Math.min(t, clipLength(act.clip) - 1), at: [s, z], yaw, face, outfit: a.outfit,
      stance: act.stance, arms: act.arms, upright: act.upright, seat: act.seat ? m.seat : undefined,
      phone: a.hold === 'phone' ? 1 : 0, crossed: a.hold === 'arms-crossed', look: a.look === 'camera' ? cam.pos : undefined, lookAmt: 0.7,
      pose: a.hold, lift: m.on };
  });
  if (set.campus) return campusShot(set.campus, cam, acts, { ...spec.campus, time: frame / 24 });
  return set.club ? clubShot(cam, acts, clubAt(spec.club, frame)) : shot(cam, acts, frame / 24, set.dress, set.flash);
};
