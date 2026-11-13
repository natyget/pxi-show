// Check every built shot of Office Hours against the world rules (start, middle and end frame of each shot).
import { timeline } from '../src/ep/OfficeHours';
const SHOTS = timeline({ cut: 'long' });
import { validate } from '../src/nw3d/world';
let bad = 0;
for (const s of SHOTS) {
  if (!s.spec) { console.log(`${s.n}: not built`); continue; }
  for (const f of [0, Math.floor(s.frames / 2), s.frames - 1]) {
    const b = typeof s.spec === 'function' ? s.spec(f) : s.spec;
    const e = validate({ ...b, frames: s.frames });
    if (e.length) { bad++; console.log(`${s.n} @${f}: ${e.join(' | ')}`); break; }
  }
}
console.log(bad ? `RESULT FAIL (${bad})` : 'RESULT PASS'); process.exit(bad ? 1 : 0);
