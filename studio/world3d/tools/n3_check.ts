// n3_check: read shot specs (JSON files, one ShotSpec or a list) and say whether the world accepts them.
import { readFileSync } from 'fs';
import { validate, ShotSpec, checkWorld, SETS, framing } from '../src/nw3d/world';
let bad = 0;
// the world itself first: every place reachable and seen, every camera inside the room
const w = checkWorld(); bad += w.length; w.forEach((x) => console.log('WORLD: ' + x));
if (process.argv.includes('--table')) for (const [sn, set] of Object.entries(SETS)) {
  console.log(`\n${sn}: which camera sees which place (in = his head is whole in the picture; cut = sliced by the edge; steep, near = bad angle; . = not seen)`);
  console.log(''.padEnd(12) + Object.keys(set.cameras).map((c) => c.padEnd(10)).join(''));
  for (const [mn, mk] of Object.entries(set.marks)) console.log(mn.padEnd(12) + Object.values(set.cameras).map((c) => { const f = framing(c, mk); return (f === 'out' ? '.' : f).padEnd(10); }).join(''));
}
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const j = JSON.parse(readFileSync(f, 'utf8')); const specs: ShotSpec[] = Array.isArray(j) ? j : [j];
  specs.forEach((s, i) => { const e = validate(s); bad += e.length ? 1 : 0;
    console.log(`${f}#${i + 1}: ${e.length ? 'REFUSED' : 'ok'}`); e.forEach((x) => console.log('   - ' + x)); });
}
process.exit(bad ? 1 : 0);
