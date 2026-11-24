const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await pg.goto('file://' + path.resolve('car.html')); await pg.evaluate(() => window.READY);
  for (let i = 0; i < 5; i++) { await pg.evaluate(i => S(i), i); await pg.screenshot({ path: process.argv[2] + `/flash-on-carousel-${i + 1}.png` }); }
  await b.close(); })();
