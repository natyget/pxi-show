// What the rig has, and whether it accepts a shot. Run through studio/rig.py.
//   list            every set with its cameras and places, the actions, holds, faces, cast
//   list <set>      that set: which camera sees which place (in = the head whole in the picture)
//   check <spec>    ok, or every reason the shot is refused
//   atlas [--all] [sets]   the shots behind the pictures in look/rig.md, as JSON
import { readFileSync } from 'fs';
import { SETS, validate, framing, ACTIONS, HOLDS, WEAR, CHARACTERS } from '../src/nw3d/world';
import { FACES } from '../src/nw3d/face';
const [cmd, arg] = process.argv.slice(2);
const names = (o: object) => Object.keys(o).join(', ');
if (cmd === 'check') {
  const j = JSON.parse(readFileSync(arg, 'utf8')); const errs = validate(j.spec ?? j);
  if (errs.length) { console.log('REFUSED'); errs.forEach((e) => console.log(' - ' + e)); process.exit(1); }
  console.log('ok');
} else if (cmd === 'atlas') {
  // one shot per camera for the pictures in look/rig.md: Nio at the first place that camera sees whole and the world accepts
  const all = process.argv.includes('--all'), want = process.argv.slice(3).filter((x) => !x.startsWith('--')), out: object[] = [];
  for (const [sn, set] of Object.entries(SETS)) {
    if (want.length && !want.includes(sn)) continue;
    const cams = Object.keys(set.cameras).filter((c) => !(set.inserts ?? []).includes(c));
    const count = (c: string) => Object.values(set.marks).filter((mk) => framing(set.cameras[c], mk) === 'in').length;
    const pick = all ? cams : [...cams].sort((x, y) => count(y) - count(x)).slice(0, 1);
    for (const c of pick) {
      let done = false;
      for (const [mn, mk] of Object.entries(set.marks)) {
        if (framing(set.cameras[c], mk) !== 'in') continue;
        for (const facing of ['camera', undefined]) {
          const spec = { set: sn, camera: c, frames: 1, actors: [{ who: mk.who ?? 'nio', at: mn, action: mk.seat !== undefined ? 'sit' : 'stand', face: 'neutral', ...(facing ? { facing } : {}) }] };
          if (!validate(spec as never).length) { out.push({ set: sn, camera: c, mark: mn, spec }); done = true; break; }
        }
        if (done) break;
      }
      if (!done) out.push({ set: sn, camera: c, mark: null });
    }
  }
  console.log(JSON.stringify(out));
} else if (cmd === 'list' && arg) {
  const set = SETS[arg]; if (!set) { console.log(`no set "${arg}". Sets: ${names(SETS)}`); process.exit(1); }
  const cams = Object.keys(set.cameras), marks = Object.entries(set.marks);
  console.log(`${arg}: which camera sees a person at which place.`);
  console.log('in = the head is whole in the picture. cut = the edge slices it. steep, near = a bad angle. . = not seen.\n');
  const w = Math.max(...marks.map(([m]) => m.length)) + 2;
  for (const c of cams) {
    const seen = marks.filter(([, mk]) => framing(set.cameras[c], mk) === 'in').map(([m]) => m);
    const cut = marks.filter(([, mk]) => framing(set.cameras[c], mk) === 'cut').map(([m]) => m);
    console.log(c.padEnd(12) + (seen.length ? 'sees ' + seen.join(', ') : (set.inserts ?? []).includes(c) ? '(on a thing, not a person)' : 'sees no place whole') + (cut.length ? '   | cuts ' + cut.join(', ') : ''));
  }
  console.log('\nplaces: ' + marks.map(([m, mk]) => m + (mk.seat !== undefined ? ' (a seat)' : '') + (mk.who ? ` (${mk.who}'s)` : '')).join(', '));
  if (set.solids.length) console.log('furniture nobody stands in: ' + set.solids.map((s) => s.name).join(', '));
} else {
  console.log('SETS (python3 studio/rig.py list <set> shows which camera sees which place)');
  for (const [n, s] of Object.entries(SETS)) console.log('  ' + n.padEnd(11) + Object.keys(s.cameras).length + ' cameras, ' + Object.keys(s.marks).length + ' places');
  console.log('\nCAST      ' + names(CHARACTERS));
  console.log('ACTIONS   ' + names(ACTIONS));
  console.log('HOLDS     ' + HOLDS.join(', '));
  console.log('FACES     ' + names(FACES));
  console.log('WEAR      ' + WEAR.join(', '));
}
