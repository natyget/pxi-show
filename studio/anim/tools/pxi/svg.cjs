#!/usr/bin/env node
// svg.cjs <out-dir> file.svg:widthPx[:keep] ... : draws SVG files large and smooth (8 times the asked width);
// ui.py then reduces each to hard pixels at the asked width. Used for the app's stamps and small drawings.
// ":keep" leaves the lettering in the drawing (for a stamp that is turned, where it cannot sit on the pixel grid).
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [out, ...jobs] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  // The stamps are set in Georgia. Gelasio has Georgia's proportions and a free licence, so it stands in for it here.
  const gel = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'pxi-ui', 'fonts', 'Gelasio.ttf')).toString('base64');
  const black = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'pxi-ui', 'fonts', 'Inter-Black.otf')).toString('base64');
  const css = '<style>@font-face{font-family:Georgia;font-weight:100 900;src:url(data:font/ttf;base64,' + gel + ')}' +
    '@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/otf;base64,' + black + ')}text{font-kerning:none}</style>';
  const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 8 });
  for (const j of jobs) {
    const keep = j.endsWith(':keep'); const jj = keep ? j.slice(0, -5) : j;
    const i = jj.lastIndexOf(':'); const file = jj.slice(0, i), w = +jj.slice(i + 1);
    let svg = fs.readFileSync(file, 'utf8');
    // Lettering is lifted out here and set again by ui.py straight onto the pixel grid, so small type stays readable.
    const texts = [];
    svg = svg.replace(/<text([^>]*)>([^<]*)<\/text>/g, (all, at, str) => {
      if (keep || /transform=/.test(at)) return all;
      const g = (k) => { const m = at.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : null; };
      texts.push({ s: str, x: +g('x'), y: +g('y'), size: +g('font-size'), bold: g('font-weight') === 'bold', family: g('font-family'), anchor: g('text-anchor') || 'middle', fill: g('fill'), ls: +(g('letter-spacing') || 0), op: +(g('opacity') || 1) });
      return '';
    });
    const m = svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/); const h = Math.round(w * (+m[2]) / (+m[1]));
    fs.writeFileSync(path.join(out, path.basename(file, '.svg') + '_' + w + '.json'), JSON.stringify({ texts, unit: w / +m[1] }));
    svg = svg.replace(/width="[\d.]+" height="[\d.]+"/, 'width="' + w + '" height="' + h + '"');
    await pg.setViewportSize({ width: w, height: h });
    await pg.setContent(css + '<body style="margin:0;background:transparent">' + svg + '</body>');
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(out, path.basename(file, '.svg') + '_' + w + '.png'), omitBackground: true });
  }
  await b.close();
})();
