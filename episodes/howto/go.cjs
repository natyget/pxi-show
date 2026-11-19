const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const P = JSON.parse(fs.readFileSync('posts.json')); const out = process.argv[2];
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await pg.goto('file://' + path.resolve('t.html')); await pg.evaluate(() => window.READY);
  for (const [name, slides] of Object.entries(P)) { fs.mkdirSync(path.join(out, name), { recursive: true });
    for (let i = 0; i < slides.length; i++) { await pg.evaluate(s => R(s), slides[i]);
      await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => 0)))); await pg.waitForTimeout(150);
      await pg.screenshot({ path: path.join(out, name, `${name}-${i + 1}.png`) }); } }
  await b.close(); })();
