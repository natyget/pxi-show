// The phone screen drawn in the show's own style (pixel font, chunky shapes), as textures that live on the 3D phone,
// so the UI is pixelated and dithered with the world. It stays brighter than the room (unlit, no tone mapping).
// Copy is the app's own: FaceMatchCard.tsx ("You might be in a photo" / "Tap to review in <album>").
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

const W = 390, H = 844;

function useAssets() {
  const [ready, setReady] = useState<{ icon: HTMLImageElement } | null>(null);
  const [handle] = useState(() => delayRender('pixel screen assets'));
  useEffect(() => {
    const font = new FontFace('PixelifyCanvas', `url(${staticFile('PixelifyB.ttf')})`, { weight: '400 700' });
    const icon = new Image(); icon.src = staticFile('pxi-app-icon.png');
    Promise.all([font.load().then((f) => document.fonts.add(f)), new Promise((r) => { icon.onload = r; })]).then(() => {
      setReady({ icon }); continueRender(handle);
    });
  }, [handle]);
  return ready;
}

const tex = (cv: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; return t;
};

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

export function useLockScreen(time: string, album: string) {
  const a = useAssets();
  const [t, setT] = useState<{ screen: THREE.Texture; card: THREE.Texture; cardAspect: number } | null>(null);
  useEffect(() => {
    if (!a) return;
    // lock screen
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill();                           // island
    c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = '700 120px PixelifyCanvas'; c.fillText(time, W / 2, 230);
    c.globalAlpha = 0.85; rr(c, 182, 80, 26, 20, 4); c.fill(); c.globalAlpha = 1;           // lock
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(195, 80, 9, Math.PI, 0); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.16)'; [[60, 760], [330, 760]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = '#fff'; rr(c, 125, 822, 140, 8, 4); c.fill();
    // the notification card (big type: it is read at pixel size)
    const cw = 370, ch = 150;
    const cc = document.createElement('canvas'); cc.width = cw; cc.height = ch; const k = cc.getContext('2d')!;
    k.fillStyle = 'rgba(78,78,104,0.96)'; rr(k, 0, 0, cw, ch, 34); k.fill();
    k.save(); rr(k, 20, 37, 76, 76, 17); k.clip(); k.drawImage(a.icon, 20, 37, 76, 76); k.restore();
    k.fillStyle = '#fff'; k.textAlign = 'left';
    k.font = '700 32px PixelifyCanvas'; k.fillText('You might be', 114, 62); k.fillText('in a photo', 114, 96);
    k.font = '500 22px PixelifyCanvas'; k.fillStyle = 'rgba(255,255,255,0.75)'; k.fillText(`Tap to review in ${album}`, 114, 132, cw - 130);
    k.textAlign = 'right'; k.font = '500 22px PixelifyCanvas'; k.fillStyle = 'rgba(255,255,255,0.55)'; k.fillText('now', cw - 20, 30);
    setT({ screen: tex(cv), card: tex(cc), cardAspect: cw / ch });
  }, [a, time, album]);
  return t;
}
