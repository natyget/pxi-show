// More phone screens in the show's pixel style: PXI's face review ("IS THIS YOU?" / "Not me" / "It's me", the app's own
// words from app/face-review.tsx) and a shared album filling up. Photos are stills rendered from the show's own sets.
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

const W = 390, H = 844;
const img = (src: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = staticFile(src); });
const font = () => new FontFace('PixelifyCanvas', `url(${staticFile('PixelifySans.ttf')})`, { weight: '400 700' }).load().then((f) => { document.fonts.add(f); });
const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const cover = (c: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
  c.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
};

function useOnce<T>(make: () => Promise<T>, key: string) {
  const [v, setV] = useState<T | null>(null);
  const [h] = useState(() => delayRender(key));
  useEffect(() => { make().then((x) => { setV(x); continueRender(h); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

/** Face review: the photo with a ring on the face PXI found. ring = [x, y, r] in photo pixels (0..1). */
export function useFaceReview(photo: string, ring: [number, number, number]) {
  return useOnce(async () => {
    await font(); const im = await img(photo);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d')!;
    c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '700 40px PixelifyCanvas'; c.fillText('IS THIS YOU?', W / 2, 120);
    const px = 25, py = 150, pw = 340, ph = 470;
    c.save(); rr(c, px, py, pw, ph, 26); c.clip(); cover(c, im, px, py, pw, ph); c.restore();
    c.strokeStyle = '#a523ef'; c.lineWidth = 7; c.beginPath(); c.arc(px + ring[0] * pw, py + ring[1] * ph, ring[2] * pw, 0, Math.PI * 2); c.stroke();
    c.font = '500 22px PixelifyCanvas'; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText('TAP TO ZOOM FACE', W / 2, 660);
    c.fillStyle = '#2a2638'; rr(c, 25, 700, 160, 74, 37); c.fill();
    const g = c.createLinearGradient(205, 700, 365, 774); g.addColorStop(0, '#a523ef'); g.addColorStop(1, '#552bce');
    c.fillStyle = g; rr(c, 205, 700, 160, 74, 37); c.fill();
    c.fillStyle = '#fff'; c.font = '700 30px PixelifyCanvas'; c.fillText('Not me', 105, 748); c.fillText("It's me", 285, 748);
    return tex(cv);
  }, 'face review');
}

/** Shared album: title + a 2-column grid. Returns the base screen and one texture per photo (they pop in one by one). */
export function useAlbum(title: string, photos: string[]) {
  return useOnce(async () => {
    await font(); const ims = await Promise.all(photos.map(img));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d')!;
    c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = '700 44px PixelifyCanvas'; c.fillText(title, 26, 128);
    c.font = '500 22px PixelifyCanvas'; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText(`Shared album · ${photos.length} photos`, 26, 162);
    // avatars row: two people
    [['#4d63c4', 'N'], ['#9b5d80', 'M']].forEach(([col, l], i) => {
      c.fillStyle = col; c.beginPath(); c.arc(300 + i * 40, 140, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '700 22px PixelifyCanvas'; c.fillText(l, 300 + i * 40, 148);
    });
    const thumbs = ims.map((im) => {
      const t = document.createElement('canvas'); t.width = 170; t.height = 220; const k = t.getContext('2d')!;
      k.save(); rr(k, 0, 0, 170, 220, 16); k.clip(); cover(k, im, 0, 0, 170, 220); k.restore();
      return tex(t);
    });
    return { screen: tex(cv), thumbs };
  }, 'album');
}

/** Where album thumbs sit on the 390x844 screen (left, top), 170x220 each. */
export const ALBUM_SLOTS: [number, number][] = [[20, 190], [200, 190], [20, 425], [200, 425]];
export const SCREEN_W = W, SCREEN_H = H;
