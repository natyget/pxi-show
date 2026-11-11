"""Reduce a smooth 1080x1920 frame to a pixel grid and snap every pixel to the fixed palette in Nio34.tsx.
usage: pixelize.py in.png out.png [scale=3]"""
import re, sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
k = int(sys.argv[3]) if len(sys.argv) > 3 else 3
txt = open(__file__.replace('tools/pixelize.py', 'src/look/Nio34.tsx')).read()
pal = sorted(set(re.findall(r"#[0-9a-fA-F]{6}", txt[txt.index('export const C'):txt.index('};')])))
rgb = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in pal]
im = Image.open(src).convert('RGB')
small = im.resize((im.width // k, im.height // k), Image.BOX)
p = Image.new('P', (1, 1)); flat = [c for t in rgb for c in t]; p.putpalette(flat + [0] * (768 - len(flat)))
q = small.quantize(palette=p, dither=Image.Dither.NONE).convert('RGB')
q.resize((q.width * k, q.height * k), Image.NEAREST).save(dst)
