#!/usr/bin/env node
// icons.cjs <hugeicons-esm-dir> <out-dir> Name:size[:stroke] ...
// Draws the app's own icons (Hugeicons, the set pxi-mobile-app uses through AppHugeIcon, stroke 2 on a 24 box)
// large and smooth; icons.py then reduces each one to hard pixels at the show's phone-screen size.
// The icon set is not in this repo: `npm pack @hugeicons/core-free-icons@4.1.1`, untar, pass package/dist/esm.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
(async () => {
  const [src, out, ...jobs] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 8 });
  for (const j of jobs) {
    const [name, size, stroke] = j.split(':'); const s = +size, sw = stroke ? +stroke : 2;
    const js = fs.readFileSync(path.join(src, name + '.js'), 'utf8');
    const arr = eval(js.slice(js.indexOf('['), js.lastIndexOf(']') + 1));
    const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    const body = arr.map(([tag, at]) => '<' + tag + ' ' + Object.entries(at).filter(([k]) => k !== 'key').map(([k, v]) => {
      if (k === 'strokeWidth') v = sw; if (v === 'currentColor') v = '#fff';
      return kebab(k) + '="' + v + '"'; }).join(' ') + '/>').join('');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none">' + body + '</svg>';
    await pg.setViewportSize({ width: s, height: s });
    await pg.setContent('<body style="margin:0;background:transparent">' + svg + '</body>');
    await pg.screenshot({ path: path.join(out, name + '_' + s + '.png'), omitBackground: true });
  }
  await b.close();
})();
