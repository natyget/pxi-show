# Lists every spoken line per shot with its voice length, and flags a line that runs into the next one or past the shot.
import re, json, sys
sys.path.insert(0, '.')
from clean import norm
VO = {v['text']: v for v in json.load(open('../anim/src/vo_pilot.json')).values()}
def shots(src, name):
    s = open(src).read()
    durs = dict(re.findall(r"\['(\w+)', \w+, (\d+)\]", s))
    blocks = re.split(r"\nconst (\w+) = S\(", s)
    out = []
    for i in range(1, len(blocks), 2):
        sid, body = blocks[i], blocks[i+1]
        if sid not in durs: continue
        lines = []
        for m in re.finditer(r"<Say t=\{t\} who=\"(\w+)\" at=\{([\d.]+)\} d=\{[\d.]+\} text=\{?(['\"])((?:\\\\.|(?!\3).)*)\3\}?", body):
            lines.append((float(m.group(2)), m.group(4).replace("\\'", "'")))
        if 'said.map' in body:
            T = eval(re.search(r"const LIST_T = (\[.*?\])", s).group(1))
            said = re.search(r"const said = \[(.*)\];", body).group(1)
            said = [x.strip()[1:-1].replace("\\'", "'") for x in re.split(r",\s(?=['\"])", said)]
            lines += list(zip(T, said))
        lines.sort()
        D = int(durs[sid]) / 24
        for k, (a, txt) in enumerate(lines):
            v = VO.get(norm(txt))
            if v is None: print("MISSING", repr(txt), norm(txt)); continue
            e = a + v['dur']
            nxt = lines[k+1][0] if k + 1 < len(lines) else D
            flag = '  <-- OVERRUN by %.2fs' % (e + 0.1 - nxt) if e + 0.1 > nxt else ''
            print(f"{name} {sid:4} D={D:5.2f} at={a:4.2f} dur={v['dur']:4.2f} end={e:5.2f} next={nxt:5.2f} {txt!r}{flag}")
shots('../anim/src/PilotNoEvidence.tsx', 'NE'); shots('../anim/src/WhatImBuilding.tsx', 'WIB')
