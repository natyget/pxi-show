#!/usr/bin/env node
// svg.cjs <out-dir> file.svg:widthPx ... : draws SVG files large and smooth (8 times the asked width);
// ui.py then reduces each to hard pixels at the asked width. Used for the app's stamps.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [out, ...jobs] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  // The stamps are set in Georgia. Gelasio has Georgia's proportions and a free licence, so it stands in for it here.
  const gel = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'pxi-ui', 'fonts', 'Gelasio.ttf')).toString('base64');
  const css = '<style>@font-face{font-family:Georgia;font-weight:100 900;src:url(data:font/ttf;base64,' + gel + ')}text{font-kerning:none}</style>';
  const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 8 });
  for (const j of jobs) {
    const i = j.lastIndexOf(':'); const file = j.slice(0, i), w = +j.slice(i + 1);
    let svg = fs.readFileSync(file, 'utf8');
    // Lettering is lifted out here and set again by ui.py straight onto the pixel grid, so small type stays readable.
    const texts = [];
    svg = svg.replace(/<text([^>]*)>([^<]*)<\/text>/g, (all, at, str) => {
      if (/transform=/.test(at)) return all;
      const g = (k) => { const m = at.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : null; };
      texts.push({ s: str, x: +g('x'), y: +g('y'), size: +g('font-size'), bold: g('font-weight') === 'bold', family: g('font-family'), anchor: g('text-anchor') || 'middle', fill: g('fill'), ls: +(g('letter-spacing') || 0), op: +(g('opacity') || 1) });
      return '';
    });
    fs.writeFileSync(path.join(out, path.basename(file, '.svg') + '_' + w + '.json'), JSON.stringify({ texts, unit: w / +svg.match(/viewBox="0 0 ([\d.]+)/)[1] }));
    const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const h = Math.round(w * (+m[2]) / (+m[1]));
    svg = svg.replace(/width="[\d.]+" height="[\d.]+"/, 'width="' + w + '" height="' + h + '"');
    await pg.setViewportSize({ width: w, height: h });
    await pg.setContent(css + '<body style="margin:0;background:transparent">' + svg + '</body>');
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(out, path.basename(file, '.svg') + '_' + w + '.png'), omitBackground: true });
  }
  await b.close();
})();
