// What every Discover body sits under and over, drawn once for all the screens: the phone's status bar, the header
// (DiscoverScreen.tsx: paddingTop insets.top + 12, a 44 row, the avatar, "Discover", the Create pill), the filter bar
// (DiscoverFilterBar.tsx), the view switch (when/ViewSwitch.tsx) and the floating tab bar.
//   chrome({ clock, when, city, me, view: 'cards' | 'second', second: 'Map' | 'All events', sortDotted })
// Needs icons.js. 390x844 points, insets 47/34. Returns a promise that settles when the bar's two values are fitted.
(function () {
  const css = `
@font-face{font-family:Inter;src:url(assets/inter.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:'Stack Sans Notch';src:url(assets/StackSansNotch-Bold.ttf);font-weight:700 900}
:root{--page:#000;--sheet:#1C1C1C;--pill:#232323;--input:#2E2E2E;--stampDisc:#161616;--purple:#A523EF;--purpleOnPhoto:#D651FB;--magenta:#FF10F0;--orange:#FF5A1F;--dim:rgba(255,255,255,.55);--dimmer:rgba(255,255,255,.35);--hair:rgba(255,255,255,.08);--hl:.3333px}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:390px;height:844px;background:#000;overflow:hidden;-webkit-font-smoothing:antialiased}
body{font-family:Inter,-apple-system,system-ui,'Noto Color Emoji',sans-serif;color:#fff;position:relative}
.disp{font-family:'Stack Sans Notch',Inter,sans-serif;font-weight:900;letter-spacing:-.4px}
.abs{position:absolute}
.tnum{font-variant-numeric:tabular-nums}
.sb{top:0;left:0;right:0;height:47px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 30px 9px 38px;font-weight:600;font-size:17px;z-index:50}
.hdr{top:59px;left:16px;right:16px;height:44px;display:flex;align-items:center;justify-content:space-between;z-index:50}
.hdr img{width:42px;height:42px;border-radius:21px;object-fit:cover}
.hdr .mid{position:absolute;left:0;right:0;top:3px;display:flex;justify-content:center;align-items:flex-start;pointer-events:none}
.hdr .t{font-size:33px;line-height:38px;letter-spacing:-1.22px}
.create{width:42px;height:42px;border-radius:21px;background:var(--purple);display:flex;align-items:center;justify-content:center}
/* DiscoverFilterBar: pill 56 high, 8 from each edge; chipsRow paddingLeft 18, paddingRight 8 */
.fb{top:115px;left:8px;right:8px;height:56px;border-radius:28px;background:var(--pill);display:flex;align-items:center;padding-left:18px;padding-right:8px;overflow:hidden;z-index:50}
.fb .grp{display:flex;align-items:center;height:100%;flex-shrink:0}
.fb .small{color:var(--dimmer);font-size:14px;font-weight:700}
.fb .val{font-size:20px;font-weight:800;letter-spacing:-.4px;white-space:nowrap;margin-left:18px}
.fb .chev{margin-left:2px;display:flex}
.fb .ggap{width:32px;flex-shrink:0}
.fb .spacer{flex:1;min-width:0}
.fb .div{width:calc(var(--hl)*2);height:26px;margin-left:6px;background:rgba(255,255,255,.22);flex-shrink:0}
.fb .ib{width:44px;height:56px;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.fb .sdot{position:absolute;left:30px;top:12px;width:8px;height:8px;border-radius:4px;background:var(--purple)}
/* ViewSwitch: row 44 (paddingTop 10, 8 each side), two words on one hairline, the purple line under the view on screen */
.vs{top:181px;left:8px;right:8px;height:34px;display:flex;border-bottom:var(--hl) solid rgba(255,255,255,.16);z-index:50}
.vs>div{flex:1;display:flex;justify-content:center;align-items:flex-end;color:var(--dim)}
.vs span{position:relative;height:34px;display:flex;align-items:center;font-size:15px;font-weight:800;letter-spacing:-.1px}
.vs .on{color:#fff}
.vs .on span:after{content:"";position:absolute;left:0;right:0;bottom:calc(var(--hl)*-1);height:2.5px;background:#A523EF}
/* the floating tab bar: bottom 24, 64 high */
.tb{left:81px;bottom:24px;width:228px;height:64px;border-radius:32px;background:rgba(26,26,26,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:flex;z-index:60}
.tb .slot{width:76px;display:flex;align-items:center;justify-content:center}`;
  const dim = 'rgba(255,255,255,.55)';
  window.chrome = function (o) {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const second = o.second || 'Map', onSecond = o.view === 'second';
    const html = `
<div class="abs sb"><span id="clock"></span>
  <span style="display:flex;gap:6px;align-items:center">
  <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 11.5l2.3-2.7a3.6 3.6 0 0 0-4.6 0z M3.9 6.6a6.4 6.4 0 0 1 8.2 0l1.6-1.8a8.8 8.8 0 0 0-11.4 0z M.5 3.2a11.4 11.4 0 0 1 15 0L17 1.4A13.7 13.7 0 0 0-1 1.4z"/></svg>
  <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".4"/><rect x="2" y="2" width="19" height="8" rx="2" fill="#fff"/><rect x="23.5" y="4" width="1.5" height="4" rx=".7" fill="#fff" fill-opacity=".4"/></svg></span></div>
<div class="abs hdr"><img id="me"><div class="mid"><span class="t disp">Discover</span><svg style="margin:12px 0 0 8px" width="14" height="14" viewBox="0 0 24 24"><path d="M18 9l-6 6-6-6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="create">${hugeicon('PlusSignIcon', 20, '#fff', 2.6)}</div></div>
<div class="abs fb" id="fb">
  <div class="grp"><span class="small">at</span><span class="val" id="when"></span><span class="chev">${hugeicon('ArrowDown01Icon', 14, dim)}</span></div>
  <div class="ggap" id="ggap"></div>
  <div class="grp"><span class="small">in</span><span class="val" id="city"></span><span class="chev">${hugeicon('ArrowDown01Icon', 14, dim)}</span></div>
  <div class="spacer"></div><div class="div"></div>
  <div class="ib">${hugeicon('Sorting01Icon', 22, '#fff')}${o.sortDotted ? '<div class="sdot"></div>' : ''}</div>
  <div class="ib">${hugeicon('Search01Icon', 22, '#fff')}</div>
</div>
<div class="abs vs"><div class="${onSecond ? '' : 'on'}"><span>Cards</span></div><div class="${onSecond ? 'on' : ''}"><span id="second"></span></div></div>
<div class="abs tb">
  <div class="slot"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v8.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V10"/><path d="M10 20v-4.5a2 2 0 0 1 4 0V20"/></svg></div>
  <div class="slot" style="opacity:.4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/></svg></div>
  <div class="slot" style="opacity:.4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z"/><path d="M14 5v2.5M14 10.5v3M14 16.5V19"/></svg></div>
</div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    const $ = (id) => document.getElementById(id);
    $('clock').textContent = o.clock; $('when').textContent = o.when; $('city').textContent = o.city; $('me').src = o.me || 'assets/me-nio.png'; $('second').textContent = second;
    // The bar's two values: the gap between the groups gives first (32 down to 10), then the values shrink together
    // on one line, down to 55%, before they are cut.
    return document.fonts.ready.then(() => {
      const fb = $('fb'), w = $('when'), c = $('city'), gap = $('ggap');
      const inner = fb.clientWidth - 18 - 8; let fixed = 18 * 2; // LABEL_GAP before each value
      fb.querySelectorAll('.small,.chev,.div,.ib').forEach((el) => { fixed += el.getBoundingClientRect().width + parseFloat(getComputedStyle(el).marginLeft); });
      const nat = w.scrollWidth + c.scrollWidth; let over = fixed + nat + 32 - inner;
      if (over <= 0) return;
      gap.style.width = Math.max(10, 32 - over) + 'px'; over -= 22;
      if (over <= 0) return;
      const k = Math.max(0.55, (nat - over) / nat);
      [w, c].forEach((el) => { el.style.fontSize = 20 * k + 'px'; el.style.letterSpacing = -0.4 * k + 'px'; });
      if (k === 0.55) [w, c].forEach((el) => { el.style.overflow = 'hidden'; el.style.textOverflow = 'ellipsis'; el.style.minWidth = '0'; el.parentElement.style.flexShrink = '1'; el.parentElement.style.minWidth = '0'; });
    });
  };
  // A seed: window.SEED, or ?seed= as JSON or as the path of a seed file (a bare name is looked up beside the scene that frames the page).
  window.readSeed = function () {
    if (window.SEED) return window.SEED;
    const v = new URLSearchParams(location.search).get('seed'); if (!v) return null;
    if (v.trim().startsWith('{')) return JSON.parse(v);
    const x = new XMLHttpRequest(); x.open('GET', new URL(v, parent !== window ? parent.location.href : location.href).href, false); x.send();
    if (x.status !== 200) throw new Error('no seed file ' + v); return JSON.parse(x.responseText);
  };
  // PosterFallback (allEvents/PosterFallback.tsx), from a posterLayout the seed tool worked out with the app's code.
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  window.esc = esc;
  window.posterHTML = function (p, radius) {
    const t = p.title, f = p.foot;
    return `<div class="po" style="position:relative;width:${p.width}px;height:${p.height}px;overflow:hidden;border-radius:${radius || 0}px;background:${p.ink}">${t.lines.map((l) => `<div class="pline disp" style="position:absolute;color:${p.paper};white-space:nowrap;overflow:hidden;left:${l.left}px;top:${l.top}px;width:${l.width}px;height:${t.box}px;font-size:${t.size}px;line-height:${t.box}px;letter-spacing:${t.tracking}px">${esc(l.text)}</div>`).join('')}
      <div style="position:absolute;background:${p.paper};opacity:.9;left:${p.rule.left}px;top:${p.rule.top}px;width:${p.rule.width}px;height:${p.rule.height}px"></div>
      ${f ? `<div style="position:absolute;left:${f.left}px;top:${f.top}px;width:${f.width}px;color:${p.paper};font-weight:800;font-size:${f.size}px;line-height:${f.line}px;letter-spacing:${f.tracking}px;white-space:nowrap;overflow:hidden">${p.where ? `<div style="overflow:hidden;text-overflow:ellipsis">${esc(p.where)}</div>` : ''}${p.when ? `<div class="tnum" style="opacity:.86">${esc(p.when)}</div>` : ''}</div>` : ''}
      <div style="position:absolute;inset:0;background:url('assets/poster-grain@3x.png') 0 0/128px 128px repeat"></div></div>`;
  };
  // A title line the browser sets wider than the app's own measure shrinks, as adjustsFontSizeToFit does (to 60%).
  window.fitPosters = function () { document.querySelectorAll('.pline').forEach((el) => { const fs0 = parseFloat(el.style.fontSize); let fs = fs0; while (el.scrollWidth > el.clientWidth + 0.5 && fs > fs0 * 0.6) { fs -= 0.25; el.style.fontSize = fs + 'px'; } }); };
})();
