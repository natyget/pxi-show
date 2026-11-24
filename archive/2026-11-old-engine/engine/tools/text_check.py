#!/usr/bin/env python3
"""Check every string a composition draws as DOM text (subtitles, stamps, phone screens).

  python3 engine/tools/text_check.py <Comp> [--props '{"variant":"bad"}'] [--scale 0.1]   probe a real render, then check
  python3 engine/tools/text_check.py <Comp> --timeline file.json                           check a saved probe timeline
  --save file.json   keep the timeline from a probe run

Rules (FAIL on any):
  1. GLYPH   a character the pixel font (studio/anim/public/PixelifySans.ttf) lacks. Text whose computed font-family
             is not Pixelify (e.g. the Sub component's ( ) * pieces in DejaVu Sans Mono) is checked against that
             family's rule, i.e. allowed.
  2. STRAY   a digit followed by something that is not: end, a digit, whitespace, one of  : . , % / - ' ’ )
             or one of these unit/suffix words (case-insensitive, whole word): am pm s k m x st nd rd th h
  3. HOLD    text on screen for less than the reading time in bible/craft-library.md: 1 s + 1/3 s per word,
             never under 1.5 s. Subtitles are checked too and labelled [sub].

Limits: the text is collected from the committed DOM on every frame (studio/anim/src/lib/TextProbe.tsx), so text
drawn inside the three.js canvas is NOT seen. Text with opacity <= 0.05, display none or visibility hidden is ignored.
Needs fonttools (pip install fonttools) and a finished npm ci in studio/anim.
"""
import argparse, json, os, re, subprocess, sys, tempfile, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ANIM = os.path.join(ROOT, 'studio', 'anim')
FONT = os.path.join(ANIM, 'public', 'PixelifySans.ttf')
SUFFIX = r'(?:am|pm|st|nd|rd|th|s|k|m|x|h)'
STRAY = re.compile(r"(\d)(?![\d\s:.,%/'’)\-]|$)(?!" + SUFFIX + r"(?![A-Za-z]))(.)", re.I)


def cmap():
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        sys.exit('fonttools missing: pip install fonttools')
    return set(TTFont(FONT).getBestCmap())


def need_time(text):
    return max(1.5, 1 + len(text.split()) / 3)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('comp')
    ap.add_argument('--timeline')
    ap.add_argument('--props', default='{}')
    ap.add_argument('--scale', default='0.1')
    ap.add_argument('--save')
    a = ap.parse_args()
    t0 = time.time()
    tl_path = a.timeline
    if not tl_path:
        tl_path = a.save or tempfile.mktemp(suffix='.json')
        r = subprocess.run(['node', 'tools/text_probe.mjs', a.comp, tl_path, '--props', a.props, '--scale', a.scale], cwd=ANIM)
        if r.returncode:
            sys.exit('FAIL probe render failed')
    tl = json.load(open(tl_path))
    fps, n = tl['fps'], tl['durationInFrames']
    have = cmap()
    got = {f['frame'] for f in tl['frames']}
    if len(got) < n:
        print(f'WARN probe saw {len(got)} of {n} frames')

    # spans: consecutive frames with the same (kind, text)
    spans, open_ = [], {}
    for f in sorted(tl['frames'], key=lambda f: f['frame']):
        cur = {}
        for it in f['items']:
            cur[(it.get('kind') or 'text', it['text'])] = it
        for k in list(open_):
            if k not in cur or open_[k]['last'] != f['frame'] - 1:
                spans.append(open_.pop(k))
        for k, it in cur.items():
            if k in open_: open_[k]['last'] = f['frame']
            else: open_[k] = dict(key=k, item=it, first=f['frame'], last=f['frame'])
    spans += open_.values()
    spans.sort(key=lambda s: s['first'])

    fails = 0
    def fail(msg): 
        nonlocal fails; fails += 1; print('FAIL ' + msg)
    for s in spans:
        kind, text = s['key']
        it = s['item']
        tag = ' [sub]' if kind == 'sub' else ''
        when = f"{s['first']/fps:.2f}s-{(s['last']+1)/fps:.2f}s"
        segs = it.get('segs') or [dict(text=text, font=it['font'])]
        for seg in segs:
            if 'pixelify' not in seg['font'].lower(): continue
            bad = sorted({c for c in seg['text'] if not c.isspace() and ord(c) not in have})
            if bad:
                fail(f"glyph{tag} {text!r} at {when}: font lacks " + ' '.join(f"{c!r} U+{ord(c):04X}" for c in bad))
        m = STRAY.search(text)
        if m:
            fail(f"stray{tag} {text!r} at {when}: {m.group(2)!r} after digit {m.group(1)!r}")
        held = (s['last'] - s['first'] + 1) / fps
        need = need_time(text)
        if held + 1e-9 < need:
            fail(f"hold{tag} {text!r} at {when}: on screen {held:.2f}s, needs {need:.2f}s ({len(text.split())} words)")
    print(f"{len(spans)} strings checked ({sum(1 for s in spans if s['key'][0]=='sub')} subtitles), {time.time()-t0:.0f}s")
    print('RESULT ' + ('FAIL' if fails else 'PASS'))
    sys.exit(1 if fails else 0)


main()
