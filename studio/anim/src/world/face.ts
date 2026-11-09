// The face is drawn in 2D, flat, onto the front of the head (like a printed decal), so eyes can never poke through the
// skull when the head turns. Every expression is just a redraw: lids, brows, mouth, pupils. One texture per unique face.
import * as THREE from 'three';
import { FACE_W, FACE_H, FACE_Y } from './sculpt';

export type FaceParams = {
  eyeX: number; eyeY: number; lid: number; open: number; wide: number; brow: number; browUp: number; browR: number;
  mouth: number; smile: number; smirk: number; sneeze: number; sweat: number;
  iris: string; brows: string; eyeScale: number; lips: string; shade: string; blush: number; mustache: boolean; lashes: boolean;
};

const S = 256, INK = '#1a1416';
const X = (x: number) => S / 2 + (x / FACE_W) * S;
const Y = (y: number) => S / 2 - ((y - FACE_Y) / FACE_H) * S;
const q = (v: number, n = 12) => Math.round(v * n) / n;

const cache = new Map<string, THREE.CanvasTexture>();

export function faceTexture(f: FaceParams) {
  const key = [q(f.eyeX), q(f.eyeY), q(f.lid), q(f.open), q(f.wide), q(f.brow), q(f.browUp), q(f.browR), q(f.mouth, 8), q(f.smile), q(f.smirk), q(f.sneeze), q(f.sweat),
    f.iris, f.eyeScale, f.brows, f.lips, f.shade, f.blush, f.mustache, f.lashes].join('|');
  const hit = cache.get(key); if (hit) return hit;
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const c = cv.getContext('2d')!;
  c.lineCap = 'round'; c.lineJoin = 'round';

  if (f.blush > 0) {
    c.fillStyle = `rgba(220,110,110,${0.22 * f.blush})`;
    [-1, 1].forEach((s) => { c.beginPath(); c.ellipse(X(s * 0.075), Y(-0.05), 15, 8, 0, 0, Math.PI * 2); c.fill(); });
  }

  // ---- eyes
  const sneeze = f.sneeze > 0.5;
  [-1, 1].forEach((s) => {
    const cx = X(s * 0.06), cy = Y(0.0);
    const w = 23 * (1 + f.wide * 0.3) * f.eyeScale, h = 13.5 * f.open * (1 + f.wide * 0.8) * f.eyeScale;
    if (sneeze) {                                            // squeezed shut: > <
      c.strokeStyle = INK; c.lineWidth = 4.5; c.beginPath();
      c.moveTo(cx - s * 12, cy - 7); c.lineTo(cx + s * 6, cy); c.lineTo(cx - s * 12, cy + 7); c.stroke(); return;
    }
    const lid = Math.min(1, Math.max(0, f.lid));
    if (lid > 0.92) {                                        // closed: a soft downward curve with lashes
      c.strokeStyle = INK; c.lineWidth = 4.5; c.beginPath(); c.moveTo(cx - w, cy); c.quadraticCurveTo(cx, cy + 8, cx + w, cy); c.stroke(); return;
    }
    // almond: pointed corners, fuller top
    const almond = () => { c.beginPath(); c.moveTo(cx - w, cy + 1); c.bezierCurveTo(cx - w * 0.55, cy - h * 1.35, cx + w * 0.55, cy - h * 1.35, cx + w, cy - 1);
      c.bezierCurveTo(cx + w * 0.5, cy + h * 1.05, cx - w * 0.5, cy + h * 1.05, cx - w, cy + 1); c.closePath(); };
    almond(); c.fillStyle = '#f6f2ee'; c.fill();
    c.save(); almond(); c.clip();
    const ir = f.wide > 0.5 ? 4 : 10 * f.eyeScale;
    const ix = cx + Math.max(-1, Math.min(1, f.eyeX)) * (w - ir - 2) - s * 2.5, iy = cy + f.eyeY * 4;
    c.fillStyle = f.iris; c.beginPath(); c.arc(ix, iy, ir, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(ix, iy, ir * 0.48, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ix + ir * 0.35, iy - ir * 0.4, Math.max(1.4, ir * 0.24), 0, Math.PI * 2); c.fill();
    // upper lid closing from the top: skin-shade fill + the lash line on its edge
    const ly = cy - h * 1.05 + lid * h * 2.1;
    if (lid > 0.02) { c.fillStyle = f.shade; c.fillRect(cx - w - 2, cy - h * 2, w * 2 + 4, ly - (cy - h * 2)); }
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 2; almond(); c.stroke();
    // lash line: thick along the lid edge (or the top of the eye when open)
    c.lineWidth = f.lashes ? 5 : 4;
    c.beginPath();
    if (lid > 0.02) { c.moveTo(cx - w * 0.95, Math.max(ly, cy - 2)); c.quadraticCurveTo(cx, ly - 2, cx + w * 0.95, Math.max(ly, cy - 2)); }
    else { c.moveTo(cx - w, cy + 1); c.bezierCurveTo(cx - w * 0.55, cy - h * 1.35, cx + w * 0.55, cy - h * 1.35, cx + w, cy - 1); }
    c.stroke();
    if (f.lashes) { c.lineWidth = 3; c.beginPath(); c.moveTo(cx + s * w * 0.95, cy - 1); c.lineTo(cx + s * (w + 5), cy - 6); c.stroke(); }
  });

  // ---- brows: thick strokes; brow>0 inner ends down (annoyed), <0 inner ends up (worried)
  c.strokeStyle = f.brows; c.lineWidth = f.lashes ? 6 : 9;
  [-1, 1].forEach((s) => {
    const raise = (f.browUp + (s === 1 ? f.browR : 0)) * 7 - f.lid * 3 + f.wide * 6;
    const cx = X(s * 0.06), cy = Y(0.046) - raise;
    const inner = cx - s * 19, outer = cx + s * 21;
    c.beginPath(); c.moveTo(inner, cy + f.brow * 6); c.quadraticCurveTo(cx, cy - 4 - f.brow * 1, outer, cy + 1 - f.brow * 2); c.stroke();
  });

  // ---- nose: a small hook in a shade of the skin
  c.strokeStyle = f.shade; c.lineWidth = 3.5; c.beginPath(); c.moveTo(X(0.004), Y(-0.025)); c.quadraticCurveTo(X(0.016), Y(-0.05), X(-0.006), Y(-0.055)); c.stroke();

  if (f.mustache) { c.fillStyle = f.brows; c.beginPath(); c.ellipse(X(0), Y(-0.075), 20, 6, 0, Math.PI, 0); c.fill(); }

  // ---- mouth
  const my = Y(-0.095), mx = X(0);
  c.strokeStyle = INK; c.fillStyle = '#3a1418';
  if (sneeze) {
    c.lineWidth = 4; c.beginPath(); c.moveTo(mx - 12, my); for (let k = 0; k < 4; k++) c.lineTo(mx - 12 + (k + 0.5) * 6, my + (k % 2 ? -3 : 3)); c.lineTo(mx + 12, my); c.stroke();
  } else if (f.mouth > 0.1) {
    const mw = 15 - f.mouth * 3 + f.wide * 4, mh = 3 + f.mouth * 12 + f.wide * 8;
    c.beginPath(); c.ellipse(mx + f.smirk * 2, my + mh * 0.25, mw, mh / 2, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 2.5; c.stroke();
    if (f.mouth > 0.5) { c.save(); c.beginPath(); c.ellipse(mx + f.smirk * 2, my + mh * 0.25, mw, mh / 2, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = '#f2ece6'; c.fillRect(mx - mw, my + mh * 0.25 - mh / 2, mw * 2, mh * 0.22); c.restore(); }
  } else {
    // closed: a line that curves with smile; smirk lifts one corner
    const l = mx - 15, r = mx + 15, curve = f.smile * 6;
    c.lineWidth = 3.5; c.beginPath(); c.moveTo(l, my - f.smile * 2); c.quadraticCurveTo(mx, my + curve, r, my - f.smile * 2 - f.smirk * 6); c.stroke();
  }
  // lower lip hint
  c.strokeStyle = f.lips; c.lineWidth = 3; c.beginPath(); c.moveTo(mx - 5, my + 9); c.lineTo(mx + 5, my + 9); c.stroke();

  if (f.sweat > 0) {
    c.fillStyle = '#9fd0ff'; c.strokeStyle = INK; c.lineWidth = 2;
    const sx = X(0.12), sy = Y(0.07) + f.sweat * 10;
    c.beginPath(); c.moveTo(sx, sy - 10); c.quadraticCurveTo(sx + 7, sy + 2, sx, sy + 5); c.quadraticCurveTo(sx - 7, sy + 2, sx, sy - 10); c.fill(); c.stroke();
  }

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  if (cache.size > 400) cache.clear();
  cache.set(key, t);
  return t;
}
