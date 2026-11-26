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
const font = 'file://' + path.join(root, 'look/fonts/inter.woff2');
const img = 'data:image/png;base64,' + fs.readFileSync(screen).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${font}) format('woff2');font-weight:100 900}
html,body{margin:0;width:${W}px;height:${H}px;background:#050505;overflow:hidden}
.line{position:absolute;left:60px;right:60px;top:0;height:200px;display:flex;align-items:center;justify-content:center;text-align:center;
 font:900 60px/1.08 Inter;color:#fff;-webkit-text-stroke:2px #000;paint-order:stroke fill;letter-spacing:-0.5px}
.line b{color:#C26BFF;font-weight:900}
img{position:absolute;left:50%;top:200px;height:${H - 230}px;transform:translateX(-50%);display:block}
</style></head><body><div class="line"><span>${esc(line).replace(/\[(.+?)\]/g, '<b>$1</b>')}</span></div><img src="${img}"></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', ...(out.endsWith('.jpg') ? { quality: 92 } : {}) });
  await b.close(); console.log('wrote', out);
})();
