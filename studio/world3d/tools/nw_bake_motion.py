#!/usr/bin/env python3
"""Bake the Universal Animation Library (Quaternius, CC0) into joint positions the Nio World rig can read.

  nw_bake_motion.py assets/motion/ual_standard.glb src/nw3d/motion.json

For every clip, at 24 fps, it writes the world position of each joint the rig uses (metres, y up, the figure
facing +z) plus the head's forward and up directions. The rig keeps only the DIRECTION of each bone and rebuilds
the figure with its own proportions, so any humanoid motion fits any character.
"""
import json, struct, sys
import numpy as np

JOINTS = ['hips', 'spine.001', 'spine.003', 'neck', 'head',
          'upper_arm.L', 'forearm.L', 'hand.L', 'f_middle.01.L', 'thumb.02.L',
          'upper_arm.R', 'forearm.R', 'hand.R', 'f_middle.01.R', 'thumb.02.R',
          'thigh.L', 'shin.L', 'foot.L', 'toe.L', 'thigh.R', 'shin.R', 'foot.R', 'toe.R']
FPS = 24

def qmat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])

def slerp(a, b, t):
    d = float(np.dot(a, b))
    if d < 0: b, d = -b, -d
    if d > 0.9995:
        q = a + (b - a) * t
    else:
        th = np.arccos(d); q = (np.sin((1 - t) * th) * a + np.sin(t * th) * b) / np.sin(th)
    return q / np.linalg.norm(q)

def main(src, dst):
    raw = open(src, 'rb').read()
    jl = struct.unpack('<I', raw[12:16])[0]
    g = json.loads(raw[20:20 + jl])
    bin0 = raw[20 + jl + 8:]
    def acc(i):
        a = g['accessors'][i]; bv = g['bufferViews'][a['bufferView']]
        n = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4}[a['type']]
        off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        return np.frombuffer(bin0, np.float32, a['count'] * n, off).reshape(a['count'], n)
    nodes = g['nodes']
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []): parent[c] = i
    name_to = {n['name']: i for i, n in enumerate(nodes)}
    order = []
    def visit(i):
        order.append(i)
        for c in nodes[i].get('children', []): visit(c)
    for i in range(len(nodes)):
        if i not in parent: visit(i)
    out = {'fps': FPS, 'joints': JOINTS, 'clips': {}}
    for an in g['animations']:
        chans = {}
        tmax = 0.0
        for ch in an['channels']:
            s = an['samplers'][ch['sampler']]
            t = acc(s['input'])[:, 0]; v = acc(s['output'])
            chans[(ch['target']['node'], ch['target']['path'])] = (t, v)
            tmax = max(tmax, float(t[-1]))
        nf = max(1, int(round(tmax * FPS)) + (0 if an['name'].endswith('_Loop') else 1))
        frames = []
        for f in range(nf):
            tt = f / FPS
            world = {}
            for i in order:
                n = nodes[i]
                T = np.array(n.get('translation', [0, 0, 0]), float)
                R = np.array(n.get('rotation', [0, 0, 0, 1]), float)
                S = np.array(n.get('scale', [1, 1, 1]), float)
                for path in ('translation', 'rotation', 'scale'):
                    if (i, path) in chans:
                        t, v = chans[(i, path)]
                        k = int(np.searchsorted(t, tt, 'right')) - 1
                        k = max(0, min(k, len(t) - 1)); k2 = min(k + 1, len(t) - 1)
                        u = 0.0 if k2 == k or t[k2] == t[k] else (tt - t[k]) / (t[k2] - t[k])
                        u = max(0.0, min(1.0, u))
                        if path == 'rotation': R = slerp(v[k].astype(float), v[k2].astype(float), u)
                        elif path == 'translation': T = v[k] + (v[k2] - v[k]) * u
                        else: S = v[k] + (v[k2] - v[k]) * u
                M = np.eye(4); M[:3, :3] = qmat(R) * S; M[:3, 3] = T
                world[i] = world[parent[i]] @ M if i in parent else M
            row = []
            for j in JOINTS:
                row += [round(float(x), 4) for x in world[name_to['DEF-' + j]][:3, 3]]
            H = world[name_to['DEF-head']][:3, :3]
            up = H[:, 1] / np.linalg.norm(H[:, 1]); fw = H[:, 2] / np.linalg.norm(H[:, 2])
            row += [round(float(x), 4) for x in up] + [round(float(x), 4) for x in fw]
            frames.append(row)
        out['clips'][an['name']] = frames
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print(len(out['clips']), 'clips', sum(len(v) for v in out['clips'].values()), 'frames')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
