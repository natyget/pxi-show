// STORY CHECK: the checks a stranger makes about a skit, made on the shot list itself, before anything is drawn.
// Founder, Nov 19: "it should be self [supervised] each step of generation instead of trying something and hoping it
// passes review." The world check (world.ts validate) looks at one shot at a time and passed every launch skit the
// stranger then failed. This looks across shots: who is talking, who is looking at us, what changed off screen, who
// is not on a model sheet, which pictures repeat, and (with --lock) what a remake changed that nobody asked for.
//
// usage: node out/story_check.js <skit> [--json]                         the checks
//        node out/story_check.js <skit> --snapshot <lock.json>          record each shot's fingerprint (after a pass)
//        node out/story_check.js <skit> --lock <lock.json> --allow 4,9  a remake: fail any changed shot not in --allow
//        node out/story_check.js <skit> --keys                          the key frames, as JSON, for tools/animatic.mjs
// Build: ./node_modules/.bin/esbuild tools/story_check.ts --bundle --platform=node --log-level=error --outfile=out/story_check.js
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { skitTimeline, vo } from '../src/ep/Skit';
import { SETS, ShotSpec, ActorSpec } from '../src/nw3d/world';
import { X } from '../src/nw3d/room';

const args = process.argv.slice(2);
const skit = args.find((a) => !a.startsWith('--') && !/\.json$/.test(a) && !/^[\d,.]+$/.test(a)) ?? 'one-sip';
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const castFile = new URL('../../../engine/studio/cast.json', 'file://' + __filename).pathname;
const CAST: { approved: string[]; extras: string[] } = existsSync(castFile) ? JSON.parse(readFileSync(castFile, 'utf8')) : { approved: ['nio', 'maya', 'sami', 'theo', 'imane'], extras: [] };

type Hit = { check: string; shot: number; t: number; msg: string };
const hits: Hit[] = [];
const T = (fr: number) => +(fr / 24).toFixed(1);
const hit = (check: string, shot: number, fr: number, msg: string) => { if (!hits.some((h) => h.check === check && h.shot === shot && h.msg === msg)) hits.push({ check, shot, t: T(fr), msg }); };
const specAt = (s: { spec?: ShotSpec | ((f: number) => ShotSpec) }, f: number) => (typeof s.spec === 'function' ? s.spec(f) : s.spec);
const wearAt = (w: ActorSpec['wear'], f: number): string[] => !w || !w.length ? [] : typeof w[0] === 'string' ? (w as string[]) : ([...(w as [number, string[]][])].reverse().find(([at]) => f >= at)?.[1] ?? []);
const faceAt = (fc: ActorSpec['face'], f: number) => (typeof fc === 'string' ? fc : [...fc].reverse().find(([at]) => f >= at)?.[1] ?? fc[0][1]);
const sub = (k: string) => (vo[k]?.sub ? `"${vo[k].sub}"` : k);

// How straight at the lens a face points (1 = dead on). The same geometry as world.ts facesCamera.
const toLens = (spec: ShotSpec, a: ActorSpec) => {
  const set = SETS[spec.set], cam = set?.cameras[spec.camera], m = set?.marks[a.at];
  if (!cam || !m || a.to) return 0;
  const yawTo = (s: number, z: number) => (Math.atan2(-(s - m.s), z - m.z) * 180) / Math.PI;
  const yaw = a.facing === 'camera' ? undefined : a.facing && set.marks[a.facing] ? yawTo(set.marks[a.facing].s, set.marks[a.facing].z) : m.yaw;
  if (yaw === undefined) return 1;
  const r = (yaw * Math.PI) / 180, dx = cam.pos[0] - X(m.s), dz = cam.pos[2] - m.z, l = Math.hypot(dx, dz) || 1;
  return Math.sin(r) * (dx / l) + Math.cos(r) * (dz / l);
};
// Where a person lands across the picture (-1 left edge, 1 right edge) and how far he is from the lens.
const onScreen = (spec: ShotSpec, a: ActorSpec) => {
  const set = SETS[spec.set], cam = set?.cameras[spec.camera], m = set?.marks[a.at];
  if (!cam || !m) return undefined;
  const F = [cam.at[0] - cam.pos[0], cam.at[1] - cam.pos[1], cam.at[2] - cam.pos[2]], fl = Math.hypot(F[0], F[1], F[2]); F.forEach((v, i) => (F[i] = v / fl));
  const R = [-F[2], 0, F[0]], rl = Math.hypot(R[0], R[2]) || 1; R[0] /= rl; R[2] /= rl;
  const d = [X(m.s) - cam.pos[0], 0, m.z - cam.pos[2]], zc = d[0] * F[0] + d[2] * F[2];
  if (zc < 0.3) return undefined;
  const half = Math.tan((cam.fov * Math.PI) / 360) * zc * (180 / 320); // half the picture's width, in metres, at his distance
  return { x: (d[0] * R[0] + d[2] * R[2]) / half, z: zc, half };
};
const LOOKS_DOWN = ['phone', 'photo', 'selfie', 'show-phone', 'phone-knee', 'juicebox', 'sip', 'sipbox', 'pen', 'flyer', 'ticket', 'records', 'pizza'];

const tl = skitTimeline({ skit });
const lastWear: Record<string, { wear: string; shot: number }> = {};
const firstLine: Record<string, boolean> = {};
let prevKey = '';
for (const s of tl) {
  const at = (f: number) => s.from + f;
  const mid = Math.floor(s.frames / 2);
  // 1. WHO IS TALKING. A line is heard from someone the viewer can see saying it: in the picture, face to us, mouth
  //    moving, for the whole line. Off screen only when the board says why (line.off). (Wave Back v10: "Reunion's
  //    Sunday" said off screen; Marcus's first line over a back; One Sip v11: the first line read as Theo's.)
  for (const l of s.say ?? []) {
    const end = Math.min(s.frames - 1, l.at + Math.ceil((vo[l.key]?.dur ?? 1) * 24));
    if (l.off) continue;
    if (!s.spec) { hit('speaker', s.n, at(l.at), `${l.who}'s line ${sub(l.key)} plays over a picture with nobody in it (a screen). Show ${l.who} saying it, or mark it off: "<why>" on the board.`); continue; }
    for (let f = l.at; f <= end; f += 4) {
      const sp = specAt(s, f)!, a = sp.actors.find((x) => x.who === l.who);
      if (!a) { hit('speaker', s.n, at(f), `${l.who} says ${sub(l.key)} but is not in the picture; the viewer gives it to ${sp.actors.filter((x) => !x.back).map((x) => x.who).join(' or ') || 'nobody'}.`); break; }
      if (a.back) { hit('speaker', s.n, at(f), `${l.who} says ${sub(l.key)} with his back to us. Nobody can tell who is talking.`); break; }
      // someone nearer the lens stands in front of his face (Wave Back v10: "a back filling the frame")
      const me = onScreen(sp, a), wall = me && sp.actors.find((o) => { const p = o !== a && !o.to ? onScreen(sp, o) : undefined; return p && p.z < me.z - 0.3 && Math.abs(p.x - me.x) < 0.25 / p.half + 0.1 / me.half; }); // his head and hair (0.25 m each side) over the middle of the speaker's face
      if (wall) { hit('speaker', s.n, at(f), `${l.who} says ${sub(l.key)} but ${wall.who} is nearer the lens, in front of his face.`); break; }
    }
    // the first time a person speaks, nobody else's face competes with his in the picture
    if (!firstLine[l.who]) {
      firstLine[l.who] = true; const sp = specAt(s, l.at)!;
      const faces = sp.actors.filter((x) => !x.back && x.who !== l.who);
      if (faces.length >= 2) hit('speaker', s.n, at(l.at), `${l.who}'s first line ${sub(l.key)} is in a shot with ${faces.length} other faces (${faces.map((x) => x.who).join(', ')}). Introduce a voice on his own face first.`);
    }
  }
  if (!s.spec) { prevKey = 'img:' + (s.img ?? ''); continue; }
  for (let f = 0; f < s.frames; f += 2) {
    const sp = specAt(s, f)!;
    for (const a of sp.actors) {
      // 2. NOBODY LOOKS AT US unless the script says so (lens: true). A face that points at the lens with no
      //    eyeline on something else reads as playing to the viewer (stranger, every launch skit).
      if (!a.back && !a.lens && !(a.hold && LOOKS_DOWN.includes(a.hold)) && toLens(sp, a) > 0.97 && (!a.gaze || Math.hypot(a.gaze[0], a.gaze[1]) < 0.3))
        hit('lens', s.n, at(f), `${a.who} faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.`);
      // 3. NOTHING CHANGES OFF SCREEN. A costume piece goes on or off in a shot where we see his face, or it did not happen.
      const w = wearAt(a.wear, f).slice().sort().join('+'), lw = lastWear[a.who];
      if (lw && lw.wear !== w) {
        if (lw.shot !== s.n) hit('continuity', s.n, at(f), `${a.who} cut from [${lw.wear || 'nothing'}] (shot ${lw.shot}) to [${w || 'nothing'}] with no shot of it happening.`);
        else if (a.back) hit('continuity', s.n, at(f), `${a.who} changes to [${w || 'nothing'}] with his back to us. The viewer never sees him put it on (One Sip v11: "a coat I never saw him put on").`);
      }
      lastWear[a.who] = { wear: w, shot: s.n };
      // 4. ON MODEL. Anyone with a line or alone in the picture is on a model sheet the stranger has passed.
      if (!CAST.approved.includes(a.who) && !CAST.extras.includes(a.who) && ((s.say ?? []).some((l) => l.who === a.who) || sp.actors.length === 1))
        hit('cast', s.n, at(f), `${a.who} is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).`);
    }
    // 5. SOMETHING TO READ. A shot with no face and no line is an empty room (Group Photo v12: the empty skyline).
    if (f === mid && !sp.actors.some((a) => !a.back) && !(s.say ?? []).length) hit('empty', s.n, at(f), `No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.`);
  }
  // 6. A NEW PICTURE EVERY CUT. The same camera with the same people and faces twice in a row reads as a mistake.
  const sp = specAt(s, mid)!;
  const key = JSON.stringify([sp.set, sp.camera, sp.actors.map((a) => [a.who, a.at, a.to, faceAt(a.face, mid), a.hold, a.back])]);
  if (key === prevKey && !(s.say ?? []).length) hit('repeat', s.n, at(0), `Same camera, same people, same faces as the shot before, with no line. Cut it or change what we see.`);
  prevKey = key;
}

// 8. NO DEAD STRETCH. A shot over 3 s with no line, no face change, nobody travelling and nothing hitting is a long
//    still shot with nothing happening (stranger, all four launch skits). Give it something that
//    happens, or cut it under 3 s.
for (const s of tl) {
  if (!s.spec || s.frames <= 72 || (s.say ?? []).length || s.shake?.length || s.tap?.length || s.poof?.length) continue;
  const faces = new Set<string>(); let moves = false;
  for (let f = 0; f < s.frames; f += 2) { const sp = specAt(s, f)!; sp.actors.forEach((a) => { faces.add(a.who + faceAt(a.face, f)); if (a.to) moves = true; }); }
  if (!moves && faces.size <= specAt(s, 0)!.actors.length) hit('dead', s.n, s.from, `${T(s.frames)} s with no line, no face change and nobody moving. Give it a reaction or cut it to under 3 s.`);
}
// 9. NO STACKED SOUND. The same effect over itself, or more than three effects at once, piles into static (Aux v12:
//    the per-shot rain clips stacked). Every effect plays its whole file unless the shot gives it a length.
const wavFrames = (k: string) => { try { const b = readFileSync(new URL(`../public/sfx/${k}.wav`, 'file://' + __filename).pathname);
  let o = 12; while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') var rate = b.readUInt32LE(o + 16), ba = b.readUInt16LE(o + 20); if (id === 'data') return Math.ceil((n / (ba! || 1) / (rate! || 48000)) * 24); o += 8 + n + (n % 2); } } catch { /* no file */ } return 24; };
const fx: { k: string; a: number; b: number; n: number }[] = [];
for (const s of tl) {
  for (const [k, at, , len] of s.sfx ?? []) fx.push({ k, a: s.from + at, b: s.from + at + (len ?? wavFrames(k)), n: s.n });
  for (const at of s.shake ?? []) fx.push({ k: 'sk_hit', a: s.from + at, b: s.from + at + wavFrames('sk_hit'), n: s.n });
}
fx.forEach((e, i) => {
  const same = fx.find((o, j) => j < i && o.k === e.k && o.b > e.a + 2);
  if (same) hit('sound', e.n, e.a, `${e.k} starts over itself (it is still playing from shot ${same.n}). Give it a length, or play it once.`);
  const at = fx.filter((o) => o.a <= e.a && o.b > e.a).length;
  if (at > 3) hit('sound', e.n, e.a, `${at} effects play at once here. It piles into noise: keep three or fewer.`);
});

// 7. THE LOCK. A remake keeps every shot nobody asked to change (founder, Nov 19: "each remake is radically different").
const fp = (s: (typeof tl)[0]) => createHash('sha1').update(JSON.stringify([s.img, s.frames, s.say, s.sfx, s.spec ? [0, Math.floor(s.frames / 2), s.frames - 1].map((f) => specAt(s, f)) : null])).digest('hex').slice(0, 12);
const snap = opt('--snapshot'), lock = opt('--lock');
if (snap) { writeFileSync(snap, JSON.stringify({ skit, shots: tl.map((s) => ({ n: s.n, fp: fp(s), sub: (s.say ?? []).map((l) => vo[l.key]?.sub ?? l.key) })) }, null, 1)); console.log(`snapshot: ${tl.length} shots -> ${snap}`); }
if (lock) {
  const L: { shots: { n: number; fp: string }[] } = JSON.parse(readFileSync(lock, 'utf8'));
  const allow = (opt('--allow') ?? '').split(',').filter(Boolean).map(Number);
  const old = new Map(L.shots.map((x) => [x.n, x.fp])), now = new Map(tl.map((s) => [s.n, fp(s)]));
  for (const [n, f] of now) if (old.get(n) !== f && !allow.includes(n)) hit('lock', n, tl.find((s) => s.n === n)!.from, old.has(n) ? 'changed, but no note asked for it. Put it back, or name the note that asks for it in --allow.' : 'is new, but no note asked for it.');
  for (const n of old.keys()) if (!now.has(n) && !allow.includes(n)) hit('lock', n, 0, 'was cut, but no note asked for it.');
}

// THE KEYS. The frames the Keys department owns and the animatic shows: each shot's first picture, every face change,
// and every line (once its subtitle is up). Printed as JSON for tools/animatic.mjs.
if (args.includes('--keys')) {
  const keys: { f: number; n: number; why: string }[] = [];
  const put = (f: number, n: number, why: string) => { if (!keys.some((k) => Math.abs(k.f - f) < 6)) keys.push({ f, n, why }); };
  for (const s of tl) {
    put(s.from + 2, s.n, 'shot');
    if (s.spec) for (let f = 1; f < s.frames; f++) { const a = specAt(s, f - 1)!, b = specAt(s, f)!;
      b.actors.forEach((x) => { const y = a.actors.find((z) => z.who === x.who); if (y && faceAt(y.face, f - 1) !== faceAt(x.face, f)) put(s.from + Math.min(s.frames - 1, f + 3), s.n, `${x.who} ${faceAt(x.face, f)}`); }); }
    for (const l of s.say ?? []) put(s.from + Math.min(s.frames - 1, l.at + 10), s.n, `line ${l.who}`);
  }
  keys.sort((a, b) => a.f - b.f); console.log(JSON.stringify(keys)); process.exit(0);
}
const order = ['speaker', 'continuity', 'cast', 'lens', 'empty', 'repeat', 'dead', 'sound', 'lock'];
hits.sort((a, b) => order.indexOf(a.check) - order.indexOf(b.check) || a.t - b.t);
if (args.includes('--json')) console.log(JSON.stringify(hits, null, 1));
else { console.log(`Story check: ${skit}, ${tl.length} shots, ${T(tl.reduce((a, s) => a + s.frames, 0))} s`); for (const h of hits) console.log(`${h.check.padEnd(10)} shot ${String(h.shot).padEnd(4)} ${String(h.t).padStart(5)}s  ${h.msg}`); }
const counts = order.map((c) => [c, hits.filter((h) => h.check === c).length] as const).filter(([, n]) => n);
console.log(hits.length ? `RESULT FAIL (${counts.map(([c, n]) => `${c} ${n}`).join(', ')})` : 'RESULT PASS');
process.exit(hits.length ? 1 : 0);
