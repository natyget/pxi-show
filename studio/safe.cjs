// Fails any caption, label or end-card text outside the safe box (x 88-932, y 360-1440). node studio/safe.cjs <scene> <duration>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http');
const ROOT = path.resolve(__dirname, '..'); const [scene, dur] = process.argv.slice(2);
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } fs.createReadStream(p).pipe(res); });
server.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(`http://127.0.0.1:${server.address().port}/${scene}?style=nio`, { waitUntil: 'networkidle' }); await p.evaluate(() => window.ready());
  const bad = await p.evaluate((d) => { const o = []; for (let t = 0; t < d; t += 0.25) o.push(...window.safeCheck(t)); return o; }, Number(dur || 40));
  console.log(bad.length ? 'FAIL\n' + bad.slice(0, 30).join('\n') : 'PASS: all text inside the safe box'); await b.close(); server.close(); process.exit(bad.length ? 1 : 0);
});
