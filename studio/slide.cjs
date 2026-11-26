// The two slides every carousel carries (founder, Nov 25): the first and the last.
//   node studio/slide.cjs intro "<headline, keyword in [brackets]>" <out.jpg> [--size 1080x1350]
//        one big headline, an arrow to swipe and the word "swipe" under it. Nothing else.
//   node studio/slide.cjs end <out.jpg> [--size 1080x1350]
//        the download slide: the app icon, "download PXI", "free", the App Store and Google Play badges.
// The headline carries the post's search phrase (growth.md, "Being found"); [words] turn purple.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2);
const kind = args[0];
const si = args.indexOf('--size'); const [W, H] = (si >= 0 ? args[si + 1] : '1080x1350').split('x').map(Number);
const root = path.resolve(__dirname, '..');
const data = (f, t) => `data:${t};base64,` + fs.readFileSync(path.join(root, f)).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
let body, out;
if (kind === 'intro') {
  const [, line, o] = args; out = o;
  if (!line || !out) { console.error('usage: node studio/slide.cjs intro "<headline>" <out.jpg>'); process.exit(1); }
  body = `<div class="intro"><h1>${esc(line).replace(/\[(.+?)\]/g, '<b>$1</b>')}</h1>
  <div class="go"><svg viewBox="0 0 240 90" width="240" height="90"><path d="M8 45 H214 M168 8 L222 45 L168 82" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>
  <div class="swipe">swipe</div></div></div>`;
} else if (kind === 'end') {
  out = args[1];
  if (!out) { console.error('usage: node studio/slide.cjs end <out.jpg>'); process.exit(1); }
  body = `<div class="end"><img class="icon" src="${data('look/brand/pxi-app-icon.png', 'image/png')}">
  <h2>download <b>PXI</b></h2><div class="free">free</div>
  <div class="badges"><img src="${data('look/brand/app-store-badge.svg', 'image/svg+xml')}"><img class="gp" src="${data('look/brand/google-play-badge.png', 'image/png')}"></div></div>`;
} else { console.error('kind is intro or end'); process.exit(1); }
const html = `<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${data('look/fonts/inter.woff2', 'font/woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:DMMono;src:url(${data('look/fonts/dm-mono-500.woff2', 'font/woff2')}) format('woff2')}
html,body{margin:0;width:${W}px;height:${H}px;background:#050505;overflow:hidden;color:#fff}
b{color:#C26BFF;font-weight:900}
.intro{position:absolute;inset:0;padding:0 90px;display:flex;flex-direction:column;justify-content:center}
h1{margin:0;font:900 128px/1.0 Inter;letter-spacing:-3px}
.go{margin-top:90px;display:flex;flex-direction:column;align-items:flex-start;gap:18px}
.swipe{font:500 40px DMMono;letter-spacing:2px;color:#fff;opacity:.85}
.end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.icon{width:260px;height:260px;border-radius:58px}
h2{margin:64px 0 0;font:900 120px/1 Inter;letter-spacing:-3px}
.free{margin-top:22px;font:500 44px DMMono;opacity:.85}
.badges{margin-top:80px;display:flex;gap:30px;align-items:center}
.badges img{height:104px}.badges img.gp{height:104px}
</style></head><body>${body}</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  if (kind === 'intro') await p.evaluate(() => { const h = document.querySelector('h1'); let f = 128;
    while (h.getBoundingClientRect().height > f * 4.05 && f > 80) { f -= 4; h.style.fontSize = f + 'px'; } });
  await p.screenshot({ path: out, type: out.endsWith('.png') ? 'png' : 'jpeg', ...(out.endsWith('.png') ? {} : { quality: 92 }) });
  await b.close(); console.log('wrote', out);
})();
