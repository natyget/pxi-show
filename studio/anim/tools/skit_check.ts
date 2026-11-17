// Check every shot of a launch skit against the world rules (start, middle and end frame of each shot).
// usage: node out/skit_check.js <skit>
import { skitTimeline } from '../src/ep/Skit';
import { validate } from '../src/nw3d/world';
const skit = process.argv[2] ?? 'one-sip';
let bad = 0;
for (const s of skitTimeline({ skit })) {
  if (!s.spec) continue; // a picture, not a set
  for (const f of [0, Math.floor(s.frames / 2), s.frames - 1]) {
    const b = typeof s.spec === 'function' ? s.spec(f) : s.spec;
    const e = validate({ ...b, frames: s.frames });
    if (e.length) { bad++; console.log(`${s.n} @${f}: ${e.join(' | ')}`); break; }
  }
}
console.log(bad ? `RESULT FAIL (${bad})` : 'RESULT PASS'); process.exit(bad ? 1 : 0);
