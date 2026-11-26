// The closing slide as the app's own map (founder, Nov 26): the Discover map drawn from the app's MapLibre style
// (pxi-mobile-app src/components/discover/map/mapStyle.ts, OpenFreeMap tiles), a record for every venue with a listing
// that night (MapPin.tsx: the black disc, its grooves, the white label, the count when a venue has more than one), then
// the app icon, "get PXI", free, and the two store badges.
//   node studio/map.cjs <events/<city>/app.json> <YYYY-MM-DD night, or first..last> "<headline, [purple]>" <out.jpg> [--size 1080x1350] [--tz America/Los_Angeles]
// The map's own credit line (MAP_ATTRIBUTION) stays on it, as the app draws it. Not drawn: the app's clustering of
// venues into stacks when zoomed out (clustering.ts); every venue is its own record here.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const a = process.argv.slice(2);
const [appjson, night, line, out] = a;
if (!out) { console.error('usage: node studio/map.cjs <app.json> <YYYY-MM-DD> "<headline>" <out.jpg> [--size WxH] [--tz Zone]'); process.exit(1); }
const opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const [W, H] = (opt('--size') || '1080x1350').split('x').map(Number);
const tz = opt('--tz') || 'America/Los_Angeles';
const root = path.resolve(__dirname, '..');
const app = path.resolve(root, '..', 'pxi-mobile-app');
const look = JSON.parse(execFileSync('node', ['--experimental-strip-types', '--no-warnings', '-e',
  "import('./src/components/discover/map/mapStyle.ts').then(m=>process.stdout.write(JSON.stringify({style:m.MAP_STYLE,credit:m.MAP_ATTRIBUTION})))"], { cwd: app }).toString());
const data = (f, t) => `data:${t};base64,` + fs.readFileSync(path.join(root, f)).toString('base64');
const localDay = iso => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const [from, to] = night.includes('..') ? night.split('..') : [night, night]; // one night, or a run of them: 2026-11-26..2026-11-29
const ev = JSON.parse(fs.readFileSync(appjson, 'utf8')).events.filter(e => e.lat && e.lng && localDay(e.startsAt) >= from && localDay(e.startsAt) <= to);
if (!ev.length) { console.error('no listings with a place on', night); process.exit(1); }
const venues = {}; for (const e of ev) { const k = e.lat.toFixed(4) + ',' + e.lng.toFixed(4); (venues[k] ||= { lat: e.lat, lng: e.lng, n: 0 }).n++; }
const q = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s[Math.round(p * (s.length - 1))]; };
const lats = ev.map(e => e.lat), lngs = ev.map(e => e.lng);
const bounds = [[q(lngs, .05), q(lats, .05)], [q(lngs, .95), q(lats, .95)]];
const tall = H / W > 1.6;
const mapTop = tall ? 470 : 240, mapH = tall ? 860 : 600;
const ctaTop = mapTop + mapH + (tall ? 40 : 24);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><html><head>
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script><style>
@font-face{font-family:Inter;src:url(${data('look/fonts/inter.woff2', 'font/woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:DMMono;src:url(${data('look/fonts/dm-mono-500.woff2', 'font/woff2')}) format('woff2')}
html,body{margin:0;width:${W}px;height:${H}px;background:#000;overflow:hidden;color:#fff}
b{color:#C26BFF;font-weight:900}
h1{position:absolute;left:70px;right:70px;top:${mapTop - 210}px;height:190px;margin:0;display:flex;align-items:flex-end;justify-content:center;text-align:center;font:900 70px/1.05 Inter;letter-spacing:-1.5px}
#map{position:absolute;left:0;top:${mapTop}px;width:${W}px;height:${mapH}px}
.fade{position:absolute;left:0;top:${mapTop}px;width:${W}px;height:${mapH}px;pointer-events:none;box-shadow:inset 0 0 80px 36px #000}
.credit{position:absolute;z-index:5;background:#000;padding:2px 6px;right:18px;top:${mapTop + mapH - 30}px;font:500 15px DMMono;color:#6a6a70}
/* MapPin.tsx at 2.3x: DISC 30, grooves 25 and 20, label 12 (18 with a count), D.hairline, DISC_BLACK */
.rec{width:69px;height:69px;border-radius:50%;background:#111;border:2.3px solid rgba(255,255,255,.14);box-sizing:border-box;position:relative;display:flex;align-items:center;justify-content:center}
.rec .g{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.08)}
.rec .g1{width:57px;height:57px}.rec .g2{width:46px;height:46px}
.rec .l{border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font:900 23px Inter;color:#000;letter-spacing:-.4px;position:relative}
.cta{position:absolute;left:0;right:0;top:${ctaTop}px;display:flex;flex-direction:column;align-items:center}
.row{display:flex;align-items:center;gap:30px}
.icon{width:${tall ? 150 : 128}px;height:${tall ? 150 : 128}px;border-radius:30px}
h2{margin:0;font:900 ${tall ? 118 : 104}px/1 Inter;letter-spacing:-3px}
.free{margin-top:14px;font:500 38px DMMono;opacity:.85}
.badges{margin-top:${tall ? 40 : 28}px;display:flex;gap:26px}.badges img{height:${tall ? 96 : 84}px}
.maplibregl-ctrl-attrib{display:none}
.maplibregl-marker{position:absolute;top:0;left:0;will-change:transform}
.maplibregl-canvas{position:absolute;left:0;top:0}
</style></head><body><h1><span>${esc(line).replace(/\[(.+?)\]/g, '<b>$1</b>')}</span></h1>
<div id="map"></div><div class="fade"></div><div class="credit">${esc(look.credit)}</div>
<div class="cta"><div class="row"><img class="icon" src="${data('look/brand/pxi-app-icon.png', 'image/png')}"><h2>get <b>PXI</b></h2></div><div class="free">free</div>
<div class="badges"><img src="${data('look/brand/app-store-badge.svg', 'image/svg+xml')}"><img src="${data('look/brand/google-play-badge.png', 'image/png')}"></div></div>
<script>
const map = new maplibregl.Map({ container: 'map', style: ${JSON.stringify(look.style)}, bounds: ${JSON.stringify(bounds)},
  fitBoundsOptions: { padding: { top: 120, bottom: 80, left: 70, right: 70 } }, interactive: false, attributionControl: false, fadeDuration: 0, preserveDrawingBuffer: true });
for (const v of ${JSON.stringify(Object.values(venues))}) {
  const el = document.createElement('div'); el.className = 'rec'; const big = v.n > 1;
  el.innerHTML = '<div class="g g1"></div>' + (big ? '' : '<div class="g g2"></div>') + '<div class="l" style="width:' + (big ? 41 : 28) + 'px;height:' + (big ? 41 : 28) + 'px">' + (big ? (v.n > 99 ? '99+' : v.n) : '') + '</div>';
  new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([v.lng, v.lat]).addTo(map);
}
map.once('idle', () => { window.ready = document.querySelectorAll('.rec').length; }); map.on('error', e => { window.err = String(e.error && e.error.message || e); });
</script></body></html>`;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => window.ready || window.err, null, { timeout: 90000 });
  const err = await p.evaluate(() => window.err); if (err) console.error('map:', err); console.log('records drawn', await p.evaluate(() => window.ready));
  await p.waitForTimeout(500);
  await p.screenshot({ path: out, type: 'jpeg', quality: 92 }); await b.close();
  console.log('wrote', out, '-', ev.length, 'listings at', Object.keys(venues).length, 'venues on', night);
})();
