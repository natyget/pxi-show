// Render frames or stills of a scene. Serves the repo root itself, so a scene uses /look/... paths.
// node studio/render.cjs <videos/<slug>/scene.html> <style: nio|sketch> <pass: all|art|ui> <outdir> <"t1,t2,..." | frames:FPS:DUR | range:FPS:FROM:TO>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http');
const ROOT = path.resolve(__dirname, '..');
const [scene, style, pass, out, spec] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/${scene}?style=${style}`, { waitUntil: 'networkidle' });
  await p.evaluate(() => window.ready());
  let times, idx0 = 0; const seq = /^(frames|range):/.test(spec);
  if (spec.startsWith('frames:')) { const [, fps, dur] = spec.split(':').map(Number); times = Array.from({ length: Math.round(fps * dur) }, (_, i) => i / fps); }
  else if (spec.startsWith('range:')) { const [, fps, a, z] = spec.split(':').map(Number); idx0 = a; times = Array.from({ length: z - a }, (_, i) => (a + i) / fps); }
  else times = spec.split(',').map(Number);
  const jpg = seq && pass === 'art';
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(([t, ps]) => window.render(t, ps), [times[i], pass]);
    const name = seq ? `${out}/f${String(i + idx0).padStart(5, '0')}.${jpg ? 'jpg' : 'png'}` : `${out}/t${times[i].toFixed(2)}.png`;
    await p.screenshot({ path: name, type: jpg ? 'jpeg' : 'png', quality: jpg ? 93 : undefined, omitBackground: pass === 'ui' });
    if (i % 150 === 0) console.log(style, pass, i, '/', times.length);
  }
  await b.close(); server.close();
});
