// A feed still: one app screen, whole and centred on the app's black, with one caption line above it.
//   node studio/still.cjs <screen.png> "<line, keyword in [brackets]>" <out.png> [--size 1080x1350]
// The line is the search phrase or the pick in plain words (growth.md, "Being found"); [words] turn purple.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const [screen, line, out, ...rest] = process.argv.slice(2);
if (!screen || !line || !out) { console.error('usage: node studio/still.cjs <screen.png> "<line>" <out.png> [--size WxH]'); process.exit(1); }
const si = rest.indexOf('--size'); const [W, H] = (si >= 0 ? rest[si + 1] : '1080x1350').split('x').map(Number);
const root = path.resolve(__dirname, '..');
const font = 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'look/fonts/inter.woff2')).toString('base64');
const img = 'data:image/png;base64,' + fs.readFileSync(screen).toString('base64');
// 9:16 (a TikTok photo or a story): the line and the screen sit inside the safe zone, clear of the app's own overlays
const tall = H / W > 1.6, top = tall ? 300 : 0, bottom = tall ? 300 : 30;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/(\d) (AM|PM)/g, '$1\u00a0$2'); // a time never breaks before AM or PM
const html = `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${font}) format('woff2');font-weight:100 900}
html,body{margin:0;width:${W}px;height:${H}px;background:#050505;overflow:hidden}
.line{position:absolute;left:60px;right:60px;top:${top}px;height:200px;display:flex;align-items:center;justify-content:center;text-align:center;
 font:900 60px/1.08 Inter;color:#fff;-webkit-text-stroke:2px #000;paint-order:stroke fill;letter-spacing:-0.5px}
.line b{color:#C26BFF;font-weight:900}
img{position:absolute;left:50%;top:${top + 200}px;height:${H - top - 200 - bottom}px;transform:translateX(-50%);display:block}
</style></head><body><div class="line"><span>${esc(line).replace(/\[(.+?)\]/g, '<b>$1</b>')}</span></div><img src="${img}"></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  // two lines at most: shrink the type until the line fits
  await p.evaluate(() => { const s = document.querySelector('.line span'), d = s.parentElement; let f = 60;
    while (s.getBoundingClientRect().height > f * 1.08 * 2 + 2 && f > 40) { f -= 2; d.style.fontSize = f + 'px'; } });
  await p.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', ...(out.endsWith('.jpg') ? { quality: 92 } : {}) });
  await b.close(); console.log('wrote', out);
})();
