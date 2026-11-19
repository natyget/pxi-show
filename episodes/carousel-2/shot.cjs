const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await pg.goto('file://' + path.resolve('tips.html')); await pg.evaluate(() => window.READY); await pg.waitForTimeout(300);
  for (let i = 0; i < 6; i++) { await pg.evaluate(i => S(i), i); await pg.screenshot({ path: process.argv[2] + `/party-flick-tips-${i + 1}.png` }); }
  await b.close(); })();
