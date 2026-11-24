// still.cjs <page?query> <out.png> [w] [h]
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [u, out, w, h] = process.argv.slice(2); const [p, q] = u.split('?');
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: +(w || 720), height: +(h || 1560) } });
  await pg.goto('file://' + path.resolve(p) + (q ? '?' + q : '')); await pg.evaluate(() => window.READY);
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => 0)))); await pg.waitForTimeout(200);
  await pg.screenshot({ path: out }); await b.close(); })();
