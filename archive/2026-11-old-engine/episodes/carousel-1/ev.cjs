const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await pg.goto('file://' + path.resolve('ev.html')); await pg.evaluate(() => window.READY); await pg.waitForTimeout(300);
  await pg.screenshot({ path: process.argv[2] }); await b.close(); })();
