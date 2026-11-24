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
import { perform, actFace, Accents, ActSpec } from './acting';
import { Scene3, Cam3 } from './types';
import { Character, NIO_CHAR, MAYA_CHAR, SAMI_CHAR, THEO_CHAR, IMANE_CHAR, PROF_H_CHAR, DARNELL_CHAR, MARCUS_CHAR, MUM_CHAR, SIS_CHAR, TOBI_CHAR, CAMP1_CHAR, CAMP2_CHAR, CAMP3_CHAR } from './characters';
import { STRANGERS } from './people';
import { CLUB_W, CLUB_H, CLUB_D, CLUB_CAMS, ClubSpec, clubShot, clubAt } from './club';
import { CAMPUS_ROOMS, CampusRoom, CampusOpts, campusShot, WAIT_MARKS, WAIT_SOLIDS, WAIT_INSERTS, HALL_MARKS, HALL_SOLIDS, HALL_INSERTS, OFFICE_MARKS, OFFICE_SOLIDS, OFFICE_INSERTS, CORRIDOR_MARKS, CORRIDOR_INSERTS, PITCH_MARKS, PITCH_INSERTS, PITCH_SOLIDS, ROOF_MARKS, ROOF_SOLIDS, QUAD_MARKS, QUAD_SOLIDS, DINE_MARKS, DINE_SOLIDS, GARDEN_MARKS, GARDEN_SOLIDS, BATH_MARKS, BATH_SOLIDS, THEO_MARKS, THEO_SOLIDS, PORCH_MARKS, Keyed, keyed } from './campus';
import { Act, shot, CAMS, ROOM, X, C, CamArg, chaise, cake, sofa, hooks, floorLamp, blanket, blanketUp } from './room';

export const CHARACTERS: Record<string, Character> = { nio: NIO_CHAR, maya: MAYA_CHAR, sami: SAMI_CHAR, theo: THEO_CHAR, imane: IMANE_CHAR, profH: PROF_H_CHAR, darnell: DARNELL_CHAR, marcus: MARCUS_CHAR, mum: MUM_CHAR, sis: SIS_CHAR, tobi: TOBI_CHAR, camp1: CAMP1_CHAR, camp2: CAMP2_CHAR, camp3: CAMP3_CHAR, ...STRANGERS,
  guest1: STRANGERS.cap, guest2: STRANGERS.girl2, guest3: STRANGERS.spinner }; // Aux v10's three guests with lines

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
      rugLie: C([2.9, 0.9, 2.2], [2.0, 0.2, 3.4], 58), // down at him flat on his back on the rug
    },
    marks: {
      rug: { s: 2.0, z: 2.5, yaw: 180 }, rugLeft: { s: 1.55, z: 2.45, yaw: 180 }, rugRight: { s: 2.55, z: 2.45, yaw: 180 },
      bedEdge: { s: 1.6, z: 3.02, yaw: 180, seat: 0.47 }, window: { s: 2.55, z: 3.85, yaw: 0 },
      nightstand: { s: 1.0, z: 2.55, yaw: 90 }, dresser: { s: 2.8, z: 3.1, yaw: 270 }, desk: { s: 2.8, z: 1.3, yaw: 270 },
      door: { s: 0.9, z: 0.7, yaw: 0 }, // just inside the door, facing into the room
      rugLie: { s: 2.0, z: 2.0, yaw: 180 }, // flat on his back on the rug, head toward the bed (Wave Back v9)
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

// THE PARTY, LIVE (One Sip): the same party room, seen as it happens (no flash). Nio and Sami on the rug, by the
// desk and its cups; the fainting couch (ShotSpec.props 'chaise') appears behind Sami, between him and the window.
SETS.partyLive = {
  ...SETS.party, flash: false, dress: 'living', // the living room of the same apartment (founder, Nov 18)
  marks: { ...SETS.party.marks,
    samiL: { s: 1.7, z: 2.35, yaw: 90 }, nioR: { s: 2.4, z: 2.4, yaw: 270 },
    chaise: { s: 1.95, z: 2.3, yaw: 270, on: 0.3 },
    // AUX: the guests across the rug, Nio by the desk with his phone; the same four up by the ceiling; a queue facing the door
    g1: { s: 1.1, z: 2.7, yaw: 160 }, g2: { s: 1.7, z: 2.9, yaw: 175 }, g3: { s: 2.3, z: 2.85, yaw: 190 }, g4: { s: 2.9, z: 2.5, yaw: 210 },
    nioD: { s: 3.15, z: 1.98, yaw: 20 },
    f1: { s: 1.1, z: 2.7, yaw: 160, on: 0.95 }, f2: { s: 1.7, z: 2.9, yaw: 175, on: 1.05 }, f3: { s: 2.3, z: 2.85, yaw: 190, on: 0.9 }, f4: { s: 2.9, z: 2.5, yaw: 210, on: 1.0 },
    // ONE SIP v7 (Nov 18): the kickback round the rug; the life coach corners Imane by the wall; the duel by the desk; the
    // king up on the coffee table with everyone round him; Nio under him; Sami the next morning, crashed on the sofa
    osMaya: { s: 1.15, z: 3.0, yaw: 150 }, osTheo: { s: 1.65, z: 3.05, yaw: 210 }, osImane: { s: 1.15, z: 1.75, yaw: 40 }, osGirl: { s: 0.85, z: 2.6, yaw: 110 }, osCap: { s: 3.3, z: 2.2, yaw: 250 },
    coachI: { s: 1.2, z: 1.85, yaw: 90 }, coachS: { s: 1.65, z: 2.2, yaw: 270 }, coachC: { s: 0.7, z: 2.6, yaw: 200 },
    duelT: { s: 2.15, z: 1.8, yaw: 270 }, duelS: { s: 2.6, z: 2.2, yaw: 90 }, duelM: { s: 2.05, z: 2.85, yaw: 190 }, duelI: { s: 2.95, z: 2.8, yaw: 200 },
    king: { s: 1.6, z: 3.38, yaw: 180, on: 0.36 }, booM: { s: 0.95, z: 3.0, yaw: 90 }, booT: { s: 2.0, z: 2.3, yaw: 330 }, booI: { s: 1.25, z: 2.25, yaw: 20 }, booG: { s: 0.9, z: 2.5, yaw: 60 },
    nioK: { s: 2.55, z: 1.85, yaw: 320 }, couch: { s: 1.15, z: 3.72, yaw: 180, seat: 0.45 },
    // ONE SIP v10 (Nov 19): the coat hooks by the door, the floor lamp by the sofa, Imane and Sami on the sofa
    doorOut: { s: 0.95, z: 0.55, yaw: 180 }, // (v11) at the front door, his back to the room
    hookS: { s: 0.55, z: 2.0, yaw: 90 }, lampS: { s: 2.75, z: 3.7, yaw: 120 }, couchI: { s: 0.7, z: 3.72, yaw: 180, seat: 0.45 }, couchS: { s: 1.12, z: 3.72, yaw: 180, seat: 0.45 },
    q1: { s: 1.2, z: 1.45, yaw: 195 }, q2: { s: 1.4, z: 1.9, yaw: 195 }, q3: { s: 1.6, z: 2.35, yaw: 195 }, q4: { s: 1.8, z: 2.8, yaw: 195 },
  },
  cameras: { ...SETS.party.cameras,
    two: C([2.1, 1.25, 0.15], [2.03, 1.1, 2.4], 60), // the two of them, side on, from the door end
    twoS: C([3.0, 1.3, 0.55], [2.0, 1.12, 2.4], 58), // the two of them, favouring Sami's face (Nio's shoulder in the foreground)
    nio: C([1.45, 1.38, 0.8], [2.4, 1.28, 2.4], 40), // Nio, from Sami's side
    sami: C([2.65, 1.38, 0.8], [1.7, 1.28, 2.35], 40), // Sami, from Nio's side
    samiClose: C([2.5, 1.45, 1.1], [1.7, 1.4, 2.35], 40), // Sami's head and shoulders, for the pieces arriving
    auxWide: C([3.6, 1.7, 0.1], [2.1, 1.1, 2.4], 80), // the whole room from the desk corner, up high
    auxNio: C([0.3, 1.45, 2.3], [3.15, 1.38, 1.98], 40), // Nio by the desk, from across the room
    auxUp: C([0.3, 1.2, 0.2], [1.9, 2.0, 2.7], 64), // up at the ceiling
    queue2: C([0.7, 1.45, 0.35], [1.5, 1.3, 2.1], 36), // the queue from the front, down the line of faces
    theoQ: C([2.6, 1.45, 1.65], [1.8, 1.45, 2.8], 36), // Theo at the back of the queue, turned to Nio
    queueN: C([3.6, 1.45, 3.55], [1.5, 1.3, 2.1], 60), // the queue turned to Nio, from the window corner
    // AUX v8: singles for the lines (fitted with out/camfit2)
    theoG: C([2.5, 1.45, 1.05], [2.9, 1.4, 2.5], 40), // Theo at the party, from by the door
    imaneG: C([2.3, 1.45, 1.35], [2.3, 1.4, 2.85], 40), // Imane at the party
    queue: C([0.6, 1.95, 0.2], [1.05, 1.25, 2.2], 44), // the queue, from by the door, down the line of faces
    // ONE SIP v7 (fitted with out/camfit2: every face in, every face seen)
    kick: C([2.3, 1.65, 0.15], [2.05, 1.3, 2.4], 48), // the two of them on the rug, both faces
    imane: C([1.9, 1.45, 3.05], [1.15, 1.38, 1.75], 40), // Imane, from behind Sami's spot
    coach: C([0.46, 1.6, 1.84], [1.6, 1.3, 2.15], 52), // the life coach, from where Imane stands
    duel: C([1.2, 1.5, 1.05], [2.55, 1.35, 2.15], 44), // the duel: Sami, from where Theo stands
    duel2: C([3.4, 1.65, 3.05], [2.4, 1.35, 2.0], 36), // the duel: Theo, over Sami's shoulder
    kingWide: C([1.6, 1.25, 0.25], [1.6, 1.5, 2.9], 56), // low on the rug, up at the coffee table, two of them booing in front
    samiS: C([0.5, 1.5, 1.45], [1.7, 1.4, 2.35], 40), // Sami at the rug, from where Imane stands
    coachI: C([3.2, 1.45, 0.85], [1.0, 1.3, 2.2], 36), // Imane cornered, a friend behind taking a photo
    mayaK: C([2.1, 1.5, 1.85], [0.95, 1.38, 3.0], 50), // Maya, from the room side, facing her
    nioRev: C([1.8, 1.45, 3.15], [2.55, 1.3, 1.85], 44), // Nio, from the coffee table end
    couch: C([1.15, 1.45, 1.9], [1.15, 1.05, 3.72], 40), // whoever is on the sofa
    hooksC: C([1.6, 1.5, 0.9], [0.35, 1.4, 2.05], 58), lampC: C([2.3, 1.5, 2.4], [2.75, 1.3, 3.7], 40), juiceP: C([1.3, 2.0, 4.0], [2.4, 1.25, 1.9], 52), filmW: C([3.0, 1.7, 0.2], [1.58, 1.3, 2.27], 90), sofa2: C([0.95, 1.25, 2.2], [0.91, 1.05, 3.72], 60), // (v10)
        faint: C([1.55, 1.45, 0.85], [0.95, 0.6, 2.3], 60), // the couch, and whoever is on it
        three: C([0.4, 1.5, 1.9], [2.08, 1.3, 2.18], 66), // (One Sip v11) Nio, Sami and Theo on the rug, from the sofa end
        pour: C([2.2, 1.5, 1.3], [3.15, 1.25, 1.98], 44), // (v11) Nio at the desk from behind: what he pours, his back to the room
  },
};
// THE LIVING ROOM THE MORNING AFTER (One Sip's button): the same room and places, in daylight
SETS.livingDay = { ...SETS.partyLive, dress: 'livingDay' };
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
// PROF H'S OFFICE: tiny; his desk, the visitor's chair, the door behind it onto the sunny quad (campus.door), the improv
// flyer on the desk (campus.flyer; with his hold slideFlyer his hand pushes it across).
SETS.office = { room: CAMPUS_ROOMS.office.size, campus: 'office', cameras: CAMPUS_ROOMS.office.cams, inserts: OFFICE_INSERTS, marks: OFFICE_MARKS, solids: OFFICE_SOLIDS };
// THE CORRIDOR that loops: the same from both ends, Prof H's door open at each (campus.door far, campus.door2 near),
// the stairwell door halfway along (campus.stairs: Nio bursts through it).
SETS.corridor = { room: CAMPUS_ROOMS.corridor.size, campus: 'corridor', cameras: CAMPUS_ROOMS.corridor.cams, inserts: CORRIDOR_INSERTS, marks: CORRIDOR_MARKS, solids: [] };
// THE PITCH: the five-a-side cage at 5:01 PM, the low sun, the floodlights on. Nio comes on through the gate in the left fence.
SETS.pitch = { room: CAMPUS_ROOMS.pitch.size, campus: 'pitch', cameras: CAMPUS_ROOMS.pitch.cams, inserts: PITCH_INSERTS, marks: PITCH_MARKS, solids: PITCH_SOLIDS };

// THE ROOF (Group Photo): a flat roof at sunset; the folding chair when a shot's campus.chair says so.
SETS.roof = { room: CAMPUS_ROOMS.roof.size, campus: 'roof', cameras: CAMPUS_ROOMS.roof.cams, inserts: ['sunset'], marks: ROOF_MARKS, solids: ROOF_SOLIDS };
// THE QUAD and MUM'S DINING ROOM (Wave Back).
SETS.quad = { room: CAMPUS_ROOMS.quad.size, campus: 'quad', cameras: CAMPUS_ROOMS.quad.cams, marks: QUAD_MARKS, solids: QUAD_SOLIDS };
SETS.dining = { room: CAMPUS_ROOMS.dining.size, campus: 'dining', cameras: CAMPUS_ROOMS.dining.cams, marks: DINE_MARKS, solids: DINE_SOLIDS };
// Wave Back v9: Marcus's garden down to the camp lake (the shed, the mower's run), and his bathroom
SETS.garden = { room: CAMPUS_ROOMS.garden.size, campus: 'garden', cameras: CAMPUS_ROOMS.garden.cams, marks: GARDEN_MARKS, solids: GARDEN_SOLIDS };
// Aux v10: Theo's house and its front porch
SETS.theoHouse = { room: CAMPUS_ROOMS.theoHouse.size, campus: 'theoHouse', cameras: CAMPUS_ROOMS.theoHouse.cams, marks: THEO_MARKS, solids: THEO_SOLIDS };
SETS.porch = { room: CAMPUS_ROOMS.porch.size, campus: 'porch', cameras: CAMPUS_ROOMS.porch.cams, marks: PORCH_MARKS, solids: [] };
SETS.bath = { room: CAMPUS_ROOMS.bath.size, campus: 'bath', cameras: CAMPUS_ROOMS.bath.cams, marks: BATH_MARKS, solids: BATH_SOLIDS };

// What a body can do. Each is real human motion fitted to the character. speed: metres per second it must travel.
export type Action = { rest?: [string, number]; // a held pose (acting.ts): the body is this clip frame, still, and the acting pass moves it
  clip: string; loop: boolean; stance: number; arms: number; upright: number; seat?: boolean; speed?: number; back?: boolean; from?: number }; // from: start this far into the clip (a non-looping clip clamps at its end) // back: travels backwards (the clip run in reverse, facing away from where he goes)
export const ACTIONS: Record<string, Action> = {
  stand: { rest: ['Idle_Loop', 0], clip: 'Idle_Loop', loop: true, stance: 0.5, arms: 0.35, upright: 0.85 },
  talk: { rest: ['Idle_Loop', 0], clip: 'Idle_Talking_Loop', loop: true, stance: 0.5, arms: 0.8, upright: 0.7 },
  walk: { clip: 'Walk_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, speed: 1.0 },
  jog: { clip: 'Jog_Fwd_Loop', loop: true, stance: 1, arms: 1, upright: 0.2, speed: 2.4 },
  sprint: { clip: 'Sprint_Loop', loop: true, stance: 1, arms: 1, upright: 0.1, speed: 4.6 },
  stepBack: { clip: 'Walk_Loop', loop: true, stance: 1, arms: 0.6, upright: 0.4, speed: 0.8, back: true }, // a step or two backwards, still facing the way he was
  sit: { rest: ['Sitting_Idle_Loop', 0], clip: 'Sitting_Idle_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, seat: true },
  sitTalk: { rest: ['Sitting_Idle_Loop', 0], clip: 'Sitting_Talking_Loop', loop: true, stance: 1, arms: 1, upright: 0.3, seat: true },
  dance: { clip: 'Dance_Loop', loop: true, stance: 1, arms: 1, upright: 0 },
  crouch: { clip: 'Crouch_Idle_Loop', loop: true, stance: 1, arms: 1, upright: 0.55 },
  pickUp: { clip: 'PickUp_Table', loop: false, stance: 0.8, arms: 1, upright: 0 },
  touch: { clip: 'Interact', loop: false, stance: 0.8, arms: 1, upright: 0.3 },
  faint: { clip: 'Death01', loop: false, stance: 1, arms: 1, upright: 0 }, // falls backward, out cold (One Sip)
  lie: { clip: 'Death01', loop: false, stance: 1, arms: 1, upright: 0, from: 999 }, // already lying where he fell
};
// What the hands are doing, over whatever the action does with the body.
//  phone: reading it in one hand. selfie: at arm's length, up and out, looking into it. show-phone: held out at
//  shoulder height, the screen turned to whoever he is showing. phone-knee: sitting, the phone face up on his knee (a
//  call on speaker). arms-crossed. point: one arm out, the first finger pointing. arm-up: one fist straight up.
//  arms-up: both arms up in a V. cup: a party cup at the waist. cup-point: the cup held out, to point with.
//  asleep: sitting, the head dropped onto one shoulder (use the face "asleep").
//  photo: the phone up at eye height, taking a picture. sweep: crouched, both hands circling flat on the floor (with the action crouch).
//  Office Hours: spinner (sitting, a fidget spinner at the knees), capOff (the cap girl takes hers off), pen (sitting, writing),
//  juicebox: a kid's juice box held up to show. sipbox: sipping it through the straw.
//  wave: a hand up by the head, open, waving side to side (hand: 0 his left, 1 his right; sitting or standing).
//  slideFlyer (Prof H pushes the flyer across his desk), flyer (the flyer held up beside his face, toward whoever he faces),
//  mop (the cleaner, walking), ticket (Darnell, sitting: the lab report on his knees, his ticket 4 on it under his left hand).
export const HOLDS = ['phone', 'arms-crossed', 'selfie', 'show-phone', 'phone-knee', 'point', 'arm-up', 'arms-up', 'cup', 'cup-point', 'asleep', 'photo', 'sweep', 'spinner', 'capOff', 'pen', 'slideFlyer', 'flyer', 'mop', 'ticket', 'sip', 'sniff', 'wave', 'juicebox', 'sipbox', 'throttle', 'pizza', 'foldChair', 'shade', 'duvet', 'records', 'shush', 'hair', 'mic'] as const;
// Costume pieces worn over the outfit (One Sip). A shot may change them at a frame: wear: [[0, []], [12, ['bowtie']]].
export const WEAR = ['bowtie', 'monocle', 'tophat', 'sideburns', 'moustache', 'partyhat', 'lanyard', 'scarf', 'glasses', 'lampshade', 'beret', 'headset', 'longcoat', 'glove'];
const SEATED_HOLDS = ['phone-knee', 'asleep', 'spinner', 'pen', 'slideFlyer', 'ticket'], TRAVEL_HOLDS = ['phone', 'cup', 'mop', 'foldChair', 'throttle'];

export type ActorSpec = {
  who: string; outfit?: string;
  at: string; to?: string; // marks of the set. `to` only with an action that travels
  facing?: string; // 'camera' or a mark to face. Left out: the mark's own facing, or the way he travels
  action: string; face: string | [number, string][]; // one face, or [frame, face] changes
  gaze?: [number, number]; hold?: (typeof HOLDS)[number]; look?: 'camera'; lens?: boolean;
  back?: true; // say so when the shot means to show his back. Otherwise his face must be visible.
  speak?: [number, Cues][]; // the lines he says: [the frame the line starts, its mouth cues from engine/tools/lipsync.py]
  mouth?: number; // mouth size for this character (1 = Nio)
  acc?: [number, Accents][]; // the stressed beats of his lines (engine/tools/accents.py), same starts as speak
  heard?: [number, Accents][]; // the other people's lines in this shot, so he can listen
  act?: ActSpec; // the acting pass (acting.ts), the LAW for every shot (founder, Nov 17). Left out: on for sit, sitTalk, stand and talk
  compare?: true; // only a before/after comparison may turn the acting pass off (act: false), never a shot that ships
  glow?: number; // with hold 'phone': how much the screen lights his face from below, 0 to 1 (left out, the usual faint spill)
  wear?: string[] | [number, string[]][];
  hand?: 0 | 1; // the hand for a sip or a sniff
  tiptoe?: number; // walks or stands up on his toes, this high (metres)
  pale?: Keyed; // goes white (Theo, at the end): 0 his own skin, 1 drained white. A number, or [frame, value] keys that ease between
};
// Talking: the mouth follows the voice line, shape by shape (src/lips/mouths.ts), over the face he has.
const speaking = (f: Face, lines: [number, Cues][] | undefined, frame: number, size = 1): Face => {
  const l = lines && [...lines].reverse().find(([at]) => frame + 1 >= at);
  return l ? lips(f, l[1], frame - l[0], size) : f;
};
// phone: look through the first actor's phone instead (he must hold 'phone'): 'insert' over his hand at the screen, 'pov'
// his eyes. The named camera still has to see him, so the world check holds. screen: a PXI screen
// (public/pxi-ui/screens/<name>.png). thumb: where his thumb is on the glass, [frame, [across, up, lift]] keys.
export type ShotSpec = { set: string; camera: string; frames: number; actors: ActorSpec[]; club?: ClubSpec; campus?: CampusOpts;
  phone?: 'insert' | 'pov'; screen?: string; thumb?: [number, [number, number, number]][];
  push?: number; // a slow push in: the camera moves this many metres toward what it looks at over the shot
  props?: string[] }; // things a shot adds to the set: "chaise", the fainting couch (at the set's chaise mark)

const names = (o: object) => Object.keys(o).join(', ');
// a colour part of the way to another (#rrggbb)
const mixHex = (a: string, b: string, k: number) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
// drained of colour: the skin (and the hands, which are skin) toward a cold white. Clothes and hair stay.
const paled = (ch: Character, k: number): Character => (k > 0.001 ? { ...ch, skin: mixHex(ch.skin, '#eef0ee', k) } : ch);
const wearAt = (w: ActorSpec['wear'], frame: number): string[] => !w || !w.length ? [] : typeof w[0] === 'string' ? (w as string[]) : ([...(w as [number, string[]][])].reverse().find(([at]) => frame >= at)?.[1] ?? []);
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
  for (const p of spec.props ?? []) if (!((['chaise', 'chaiseUp', 'cake', 'lamp', 'lampBare', 'blanket', 'blanketUp'].includes(p) || /^hooks[bc]*$/.test(p)) && SETS[spec.set]?.marks.chaise)) e.push(`No prop "${p}" in ${spec.set}.`);
  const spots: { who: string; s: number; z: number }[] = [];
  (spec.actors ?? []).forEach((a) => {
    const ch = CHARACTERS[a.who];
    if (!ch) { e.push(`There is no character "${a.who}". Characters: ${names(CHARACTERS)}.`); return; }
    if (a.outfit && !ch.wardrobe[a.outfit]) e.push(`${a.who} has no outfit "${a.outfit}". Wardrobe: ${names(ch.wardrobe)}.`);
    const act = ACTIONS[a.action];
    if (!act) e.push(`There is no action "${a.action}". Actions: ${names(ACTIONS)}.`);
    (typeof a.face === 'string' ? [a.face] : a.face.map((f) => f[1])).forEach((f) => { if (!FACES[f]) e.push(`There is no face "${f}". Faces: ${names(FACES)}.`); });
    if (a.glow !== undefined && (a.hold !== 'phone' || !(a.glow >= 0 && a.glow <= 1))) e.push(`${a.who}: glow is for hold "phone", from 0 to 1.`);
    if (a.pale !== undefined && (typeof a.pale === 'number' ? [a.pale] : a.pale.map((k) => k[1])).some((v) => !(v >= 0 && v <= 1))) e.push(`${a.who}: pale runs from 0 to 1.`);
    if (a.gaze && a.gaze.some((g) => !(g >= -1 && g <= 1))) e.push(`${a.who}: gaze runs from -1 to 1.`);
    // a look into the lens is a choice the script makes, never a default (founder, Nov 18)
    if (a.look === 'camera' && !a.lens) e.push(`${a.who} looks into the lens. Only a scripted look to the viewer may, with lens: true.`);
    if (a.facing === 'camera' && !a.gaze && !a.lens) e.push(`${a.who} faces the camera with nothing to look at. Give a gaze (at a phone, at someone) or lens: true if the script calls for a look to us.`);
    if (a.act === false && !a.compare) e.push(`${a.who}: the acting pass is law (bible/acting.md). act: false is only for a before/after comparison.`);
    if (a.speak && (a.acc?.length ?? 0) < a.speak.length) e.push(`${a.who}: a line has no accents. Run engine/tools/accents.py on the voice manifest (bible/acting.md).`);
    if (a.hold && !HOLDS.includes(a.hold)) e.push(`${a.who} cannot hold "${a.hold}". Holds: ${HOLDS.join(', ')}.`);
    if (a.hold === 'capOff' && !ch.cap) e.push(`${a.who} has no cap to take off.`);
    for (const w of (a.wear ?? []).flatMap((x) => (typeof x === 'string' ? [x] : x[1]))) if (!WEAR.includes(w)) e.push(`${a.who} cannot wear "${w}". Wear: ${WEAR.join(', ')}.`);
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
    // is he in the picture? (An insert is on a thing: a hand or a sleeve may come into it, so anyone goes.)
    if (cam && !set.inserts?.includes(spec.camera)) {
      const why = (name: string, f: Framing) => ({ in: '', out: `is not in the picture`, cut: `would be cut by the edge of the picture`, steep: `would be seen from too steep an angle to read his face`, near: `is too close to the lens` }[f]
        + ` from camera "${spec.camera}". Cameras that see "${name}": ${seenBy(set, set.marks[name], ch) || 'none'}.`);
      const low = (mk: Mark): Mark => (a.action === 'crouch' && mk.seat === undefined ? { ...mk, seat: 0.0 } : mk); // crouched, the head is down at a sitter's height
      // lying (lie, or the end of faint): he went over backwards, so his head is about 1.45 m behind the mark, just above what he lies on
      const lying = (mk: Mark): Mark => { const r = (mk.yaw * Math.PI) / 180; return { ...mk, s: mk.s + Math.sin(r) * 1.45, z: mk.z - Math.cos(r) * 1.45, on: undefined, seat: (mk.on ?? 0) - 0.5 }; };
      const lowL = (mk: Mark): Mark => (a.action === 'lie' ? lying(mk) : low(mk));
      const f1 = framing(cam, lowL(m), ch), f2 = m2 ? framing(cam, lowL(m2), ch) : undefined;
      if (!f2) { if (f1 !== 'in') e.push(`${a.who} at "${a.at}" ${why(a.at, f1)}`); }
      else { if (f1 !== 'in' && f1 !== 'out') e.push(`${a.who} at "${a.at}" ${why(a.at, f1)}`); if (f2 !== 'in' && f2 !== 'out') e.push(`${a.who} at "${a.to}" ${why(a.to!, f2)}`);
        if (f1 === 'out' && f2 === 'out') e.push(`${a.who} is never in the picture from camera "${spec.camera}" on the way from ${a.at} to ${a.to}.`); }
      // his face: the camera must see it, unless the shot says it means his back
      const yaw = m2 ? (act.back ? yawTo(m2, m.s, m.z) : yawTo(m, m2.s, m2.z)) : a.facing === 'camera' ? undefined : a.facing && set.marks[a.facing] ? yawTo(m, set.marks[a.facing].s, set.marks[a.facing].z) : m.yaw;
      const end = m2 && f2 !== 'out' ? m2 : m; // where we see him last: a run that ends past the lens is judged where he is still in the picture
      const seen = yaw === undefined || a.action === 'lie' || facesCamera(cam, end, yaw); // lying, his face is to the ceiling
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
  const set = SETS[spec.set], cam0 = set.cameras[spec.camera];
  const k = spec.push ? (spec.push * frame) / Math.max(1, spec.frames - 1) : 0, dir = norm(sub(cam0.at, cam0.pos));
  const cam: Cam3 = k ? { ...cam0, pos: [cam0.pos[0] + dir[0] * k, cam0.pos[1] + dir[1] * k, cam0.pos[2] + dir[2] * k] } : cam0;
  const t = Math.floor(frame / 2) * 2;
  const acts: Act[] = spec.actors.map((a) => {
    const ch = CHARACTERS[a.who], act = ACTIONS[a.action], m = set.marks[a.at], m2 = a.to ? set.marks[a.to] : undefined;
    const k = m2 ? Math.min(1, t / Math.max(1, spec.frames - 1)) : 0;
    const s = m.s + ((m2?.s ?? m.s) - m.s) * k, z = m.z + ((m2?.z ?? m.z) - m.z) * k;
    let yaw = m2 ? (act.back ? yawTo(m2, m.s, m.z) : yawTo(m, m2.s, m2.z)) : m.yaw;
    if (!m2 && a.facing === 'camera') yaw = (Math.atan2(cam.pos[0] - X(s), cam.pos[2] - z) * 180) / Math.PI;
    else if (!m2 && a.facing) yaw = yawTo({ s, z }, set.marks[a.facing].s, set.marks[a.facing].z);
    let face: Face = FACES[faceAt(a.face, frame)];
    // eyes on the person he is facing (founder, Nov 18: characters act toward each other, not toward us): with a
    // facing mark and no gaze given, the pupils come in from the side of the face to nearly centre
    if (a.gaze) face = gaze(face, a.gaze[0], a.gaze[1]);
    else if (a.facing && a.facing !== 'camera') face = gaze(face, face.eyeL.px * 0.25, face.eyeL.py);
    face = speaking(face, a.speak, frame, a.mouth);
    const acting = act.rest && a.act !== false;
    const perf = acting ? perform({ who: a.who, frames: spec.frames, frame, faces: typeof a.face === 'string' ? [[0, a.face]] : a.face,
      speak: a.speak, acc: a.acc, heard: a.heard, holding: !!a.hold, act: a.act }) : undefined;
    if (perf) face = actFace(face, perf);
    return { perf, clipT: acting ? act.rest![1] : undefined, who: paled(ch, keyed(a.pale, frame, 0)), clip: acting ? act.rest![0] : act.clip, t: act.back ? clipLength(act.clip) * 20 - t : act.loop ? t : Math.min(t + (act.from ?? 0), clipLength(act.clip) - 1), at: [s, z], yaw, face, outfit: a.outfit,
      stance: act.stance, arms: act.arms, upright: act.upright, seat: act.seat ? m.seat : undefined,
      phone: a.hold === 'phone' ? 1 : 0, glow: a.glow, crossed: a.hold === 'arms-crossed', look: a.look === 'camera' ? cam.pos : undefined, lookAmt: 0.7,
      pose: a.hold, lift: m.on, tiptoe: a.tiptoe, wear: wearAt(a.wear, frame), hand: a.hand, thumb: spec.thumb && a === spec.actors[0] ? [...spec.thumb].reverse().find(([at]) => frame >= at)?.[1] ?? spec.thumb[0][1] : undefined };
  });
  const camP: CamArg = spec.phone ? [spec.phone, 0] : cam;
  if (set.campus) { const sc = campusShot(set.campus, camP, acts, { ...spec.campus, time: frame / 24 }); return sc; } // the screen picture (spec.screen) is set by the composition, which knows where public/ is
  const props = spec.props ?? [], up = props.includes('chaiseUp');
  // in the living room the couch is the room's own sofa: on the floor, or (chaiseUp) up on the ceiling
  const extras = props.filter((p) => !(set.dress?.startsWith('living') && p === 'chaiseUp')).map((p) => { const m = set.marks.chaise; return p === 'blanket' ? blanket() : p === 'blanketUp' ? blanketUp() : p.startsWith('hooks') ? hooks(p.slice(5)) : p === 'lamp' || p === 'lampBare' ? floorLamp(p === 'lamp') : p === 'cake' ? cake(3.35, 1.3, 0.745) : chaise(m.s - 0.85, m.z, p === 'chaiseUp' ? 1.55 : 0); });
  if (set.dress?.startsWith('living')) extras.push(sofa(up ? 1.55 : 0));
  return set.club ? clubShot(cam, acts, clubAt(spec.club, frame)) : shot(cam, acts, frame / 24, set.dress, set.flash, extras);
};
