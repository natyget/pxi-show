// Fails any text or picture in the sharp layer (#ui: captions, labels, banners, the end card) outside the safe box
// (x 88-932, y 360-1440), four times a second. It finds them itself: nothing in the scene has to list them.
// Words inside the world (#art: a phone screen, a chat, a flyer) are not checked here; look at those as the viewer.
//   node studio/safe.cjs <videos/<slug>/scene.html> [seconds]      (seconds left out: the length of the voice)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http');
const ROOT = path.resolve(__dirname, '..'); const [scene, dur] = process.argv.slice(2);
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } fs.createReadStream(p).pipe(res); });
server.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('PAGEERR', e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/${scene}?style=nio`, { waitUntil: 'networkidle' }); await p.evaluate(() => window.ready());
  const bad = await p.evaluate(async (d) => {
    const o = new Map(), root = document.getElementById('ui') || document.body, end = d || (window.VO ? window.VO.duration + 0.4 : 40);
    const shown = (el) => { let op = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; op *= parseFloat(cs.opacity); } return op >= 0.05; };
    const test = (r, what, t) => { if (r.width < 2 || r.bottom <= 0 || r.top >= 1920 || r.right <= 0 || r.left >= 1080) return;
      if (r.left < 88 || r.right > 932 || r.top < 360 || r.bottom > 1440) { const k = what + ' [' + [r.left, r.top, r.right, r.bottom].map(Math.round) + ']'; if (!o.has(k)) o.set(k, t); } };
    for (let t = 0; t < end; t += 0.25) {
      await window.render(t, 'all');
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const s = n.textContent.trim(), el = n.parentElement; if (!s || !el || /^(SCRIPT|STYLE)$/.test(el.tagName) || !shown(el)) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); test(rg.getBoundingClientRect(), '"' + s.slice(0, 28) + '"', t); }
      root.querySelectorAll('img').forEach((im) => { if (shown(im)) test(im.getBoundingClientRect(), 'picture ' + (im.getAttribute('src') || '').split('/').pop(), t); });
    }
    return [...o].map(([k, t]) => t.toFixed(2) + 's ' + k);
  }, Number(dur || 0));
  console.log(bad.length ? 'FAIL: outside the safe box (x 88-932, y 360-1440), first seen at\n' + bad.slice(0, 40).join('\n') : 'PASS: every caption, label and end-card piece is inside the safe box');
  await b.close(); server.close(); process.exit(bad.length ? 1 : 0);
});
