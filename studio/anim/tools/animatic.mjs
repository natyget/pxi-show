// ANIMATIC: the Keys department's output and the blind reader's only input. One still per key frame of a skit (each
// shot's first picture, every face change, every line with its subtitle up), silent, tiled four across into sheets.
// The reader gets these sheets and nothing else (engine/studio/departments.md, Keys).
//
// usage: node tools/animatic.mjs <skit> <outdir> [--shots 1,2,3]     (run tools/story_check first: it needs out/story_check.js)
// One bundle, then one still per key: about 10 s a still after the first (the 3D shading is the cost).
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill, openBrowser } from '@remotion/renderer';
import { execFileSync } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';

const [skit, out] = process.argv.slice(2);
const si = process.argv.indexOf('--shots'), only = si > 0 ? process.argv[si + 1].split(',').map(Number) : null;
if (!skit || !out) { console.error('usage: node tools/animatic.mjs <skit> <outdir> [--shots 1,2,3]'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, '..');
let keys = JSON.parse(execFileSync('node', [path.join(root, 'out/story_check.js'), skit, '--keys']).toString());
if (only) keys = keys.filter((k) => only.includes(k.n));
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const inputProps = { skit };
const browserExecutable = process.env.PXI_CHROME ?? '/opt/pw-browsers/chromium', chromiumOptions = { gl: 'angle' };
const puppeteerInstance = await openBrowser('chrome', { browserExecutable, chromiumOptions }); // one browser for every still
const composition = await selectComposition({ serveUrl, id: 'Skit', inputProps, puppeteerInstance });
const opts = { serveUrl, composition, inputProps, puppeteerInstance, chromiumOptions, scale: 0.25 };
const files = [];
for (const [i, k] of keys.entries()) {
  const f = path.join(out, `k${String(i).padStart(3, '0')}.png`);
  await renderStill({ ...opts, frame: k.f, output: f });
  // label each still with its shot and second only (no intent: the reader must not be told what it means)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-vf', `drawtext=text='${k.n} · ${(k.f / 24).toFixed(1)}s':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6`, f + '.l.png']);
  files.push(f + '.l.png');
  process.stdout.write(`\r${i + 1}/${keys.length}`);
}
// sheets of 4 x 3 (twelve keys a sheet), in order
for (let s = 0; s * 12 < files.length; s++) {
  const part = files.slice(s * 12, s * 12 + 12); if (part.length === 1) { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', part[0], path.join(out, `animatic_${s + 1}.jpg`)]); continue; }
  const inputs = part.flatMap((f) => ['-i', f]);
  const layout = Array.from({ length: 12 }, (_, j) => `${(j % 4) * 270}_${Math.floor(j / 4) * 480}`).slice(0, part.length).join('|');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${part.map((_, j) => `[${j}:v]`).join('')}xstack=inputs=${part.length}:layout=${layout}:fill=black`, path.join(out, `animatic_${s + 1}.jpg`)]);
}
await puppeteerInstance.close({ silent: true });
console.log(`\nanimatic: ${keys.length} keys in ${Math.ceil(files.length / 12)} sheets -> ${out}`);
