// Renders a composition with textProbe=true and writes the per-frame DOM text timeline as JSON.
//   node tools/text_probe.mjs <Comp> <out.json> [--props '{"variant":"bad"}'] [--scale 0.1]
// Used by engine/tools/text_check.py. Text drawn inside the three.js canvas is not DOM and is not seen.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderFrames } from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const [comp, out, ...rest] = process.argv.slice(2);
if (!comp || !out) { console.error('usage: text_probe.mjs <Comp> <out.json> [--props json] [--scale n]'); process.exit(2); }
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
const extra = JSON.parse(opt('--props', '{}'));
const scale = Number(opt('--scale', '0.1'));
const inputProps = { ...extra, textProbe: true };
const browserExecutable = process.env.PXI_BROWSER || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : null);
const chromiumOptions = { gl: 'swangle' };

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const c = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable, chromiumOptions, logLevel: 'error' });
const frames = new Map();
await renderFrames({
  composition: c, serveUrl, inputProps, imageFormat: 'none', scale, browserExecutable, chromiumOptions,
  concurrency: Number(process.env.PXI_PROBE_CONCURRENCY || 4), logLevel: 'error', outputDir: null, onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (l) => {
    if (!l.text.startsWith('PXI_TEXT ')) return;
    try { const j = JSON.parse(l.text.slice(9)); frames.set(j.frame, j.items); } catch {}
  },
});
const timeline = { comp, fps: c.fps, durationInFrames: c.durationInFrames, frames: [...frames.entries()].sort((a, b) => a[0] - b[0]).map(([frame, items]) => ({ frame, items })) };
fs.writeFileSync(out, JSON.stringify(timeline));
console.error(`probed ${timeline.frames.length}/${c.durationInFrames} frames`);
