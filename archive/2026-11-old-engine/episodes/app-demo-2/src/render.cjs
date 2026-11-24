// render.cjs <html> <out> [fps] [t,t,...]   frames to stdout as raw PNG stream (ffmpeg image2pipe), or stills when times are given
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [html, out, fpsA, times] = process.argv.slice(2); const fps = +(fpsA || 30);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await pg.goto('file://' + path.resolve(html)); await pg.evaluate(() => window.READY); await pg.waitForTimeout(300); const DUR = await pg.evaluate(() => window.DUR || 21);
  if (times) { for (const t of times.split(',')) { await pg.evaluate(t => T(t), +t); await pg.screenshot({ path: `${out}_${t}.png` }); } }
  else { fs.mkdirSync(out, { recursive: true }); const n = Math.round(DUR * fps);
    for (let i = 0; i < n; i++) { await pg.evaluate(t => T(t), i / fps); await pg.screenshot({ path: `${out}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 95 }); } }
  await b.close();
})();
