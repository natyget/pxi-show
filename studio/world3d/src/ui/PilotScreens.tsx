// Phone screens for the pilot, drawn 1:1 from the app's code, then pixelated with the world (textures on the 3D phone).
// Album: app/album/[id].tsx: black background; 56pt header (back arrow · ALBUM NAME uppercase, 900 weight, 14pt,
// letter-spacing 1.2 · "…"); THREAD / GALLERY toggle (track #1c1c1c, pill #A523EF, 11pt 900 tracking 2.4, inactive
// text 30% white); gallery = AlbumMasonryGrid: 3 columns, square tiles, 2pt inset, 14pt corner radius.
// Push: FaceMatchCard.tsx: "You might be in N photos" / "Tap to review in <album>".
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

export const SW = 390, SH = 844;
const PURPLE = '#A523EF';
const img = (src: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = staticFile(src); });
const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
const canvas = (w = SW, h = SH) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')!] as const; };
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const cover = (c: CanvasRenderingContext2D, im: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) => {
  const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
  c.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
};
const statusBar = (c: CanvasRenderingContext2D, time = '11:47') => {
  c.fillStyle = '#000'; rr(c, 135, 12, 120, 36, 18); c.fill();
  c.fillStyle = '#fff'; c.font = '600 17px Inter, system-ui, sans-serif'; c.textAlign = 'left'; c.fillText(time, 44, 37);
  c.fillRect(318, 26, 22, 11); c.fillRect(341, 29, 2, 5);                                  // battery
  [0, 1, 2, 3].forEach((i) => c.fillRect(290 + i * 5, 34 - i * 3, 3, 3 + i * 3));         // signal
};

export type PilotTex = Record<string, THREE.Texture>;
let cached: Promise<PilotTex> | null = null;

async function build(): Promise<PilotTex> {
  const names = ['thumb', 'blurry', 'pigeon', 'maya1', 'maya2', 'maya3', 'maya4', 'maya5', 'maya6', 'fall'];
  const ims = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await img(`photos/p_${n}.png`)] as const)));
  const icon = await img('pxi-app-icon.png');
  const out: PilotTex = {};

  // iOS camera, just after a shot: the photo fills the screen, black bars, shutter row (her phone in his hands)
  const review = (key: string, photo: CanvasImageSource & { width: number; height: number }) => {
    const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH); statusBar(c);
    cover(c, photo, 0, 110, SW, 560);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(SW / 2, 750, 34, 0, 7); c.fill();
    c.strokeStyle = '#000'; c.lineWidth = 4; c.beginPath(); c.arc(SW / 2, 750, 28, 0, 7); c.stroke();
    c.save(); rr(c, 40, 726, 48, 48, 8); c.clip(); cover(c, photo, 40, 726, 48, 48); c.restore();
    c.fillStyle = '#f6c945'; c.font = '600 14px Inter, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('PHOTO', SW / 2, 698);
    out[key] = tex(cv);
  };
  review('cam_thumb', ims.thumb); review('cam_blurry', ims.blurry); review('cam_pigeon', ims.pigeon);

  // lock screen + FaceMatch push
  { const [cv, c] = canvas(); const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
    c.fillStyle = g; c.fillRect(0, 0, SW, SH); c.fillStyle = '#000'; rr(c, 135, 12, 120, 36, 18); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '500 22px Inter, system-ui, sans-serif'; c.fillText('Saturday, November 14', SW / 2, 108);
    c.font = '700 96px Inter, system-ui, sans-serif'; c.fillText('11:47', SW / 2, 210);
    c.fillStyle = 'rgba(40,40,52,0.92)'; rr(c, 12, 300, 366, 92, 24); c.fill();
    c.save(); rr(c, 26, 318, 56, 56, 13); c.clip(); c.drawImage(icon, 26, 318, 56, 56); c.restore();
    c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = '700 19px Inter, system-ui, sans-serif'; c.fillText('You might be in 214 photos', 96, 344);
    c.font = '400 17px Inter, system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText('Tap to review in Night Market', 96, 370);
    c.textAlign = 'right'; c.font = '400 14px Inter, system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillText('now', 364, 330);
    out.push = tex(cv); }

  // album, GALLERY tab (1:1 layout), tiles drawn per frame from `tiles`
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH); statusBar(c);
    const top = 54;
    c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, top + 28); c.lineTo(20, top + 28); c.moveTo(20, top + 28); c.lineTo(27, top + 21); c.moveTo(20, top + 28); c.lineTo(27, top + 35); c.stroke();
    c.fillStyle = '#fff'; [354, 362, 370].forEach((x) => { c.beginPath(); c.arc(x, top + 28, 2.2, 0, 7); c.fill(); });
    c.textAlign = 'center'; c.font = '900 14px Inter, system-ui, sans-serif'; (c as any).letterSpacing = '1.2px'; c.fillText('NIGHT MARKET', SW / 2, top + 33);
    const ty = top + 56 + 6; c.fillStyle = '#1c1c1c'; rr(c, 16, ty, SW - 32, 50, 25); c.fill();
    c.fillStyle = PURPLE; rr(c, 16 + 6 + (SW - 44) / 2, ty + 6, (SW - 44) / 2, 38, 19); c.fill();
    c.font = '900 11px Inter, system-ui, sans-serif'; (c as any).letterSpacing = '2.4px';
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillText('THREAD', 16 + 6 + (SW - 44) / 4, ty + 30);
    c.fillStyle = '#fff'; c.fillText('GALLERY', 16 + 6 + (SW - 44) * 3 / 4, ty + 30);
    out.album = tex(cv); }
  const tile = SW / 3;
  ['maya1', 'maya2', 'maya3', 'maya4', 'maya5', 'maya6', 'fall'].forEach((n) => {
    const [cv, c] = canvas(Math.round(tile), Math.round(tile)); c.save(); rr(c, 2, 2, tile - 4, tile - 4, 14); c.clip(); cover(c, ims[n], 2, 2, tile - 4, tile - 4); c.restore(); out[`tile_${n}`] = tex(cv);
  });
  // one photo, opened full screen in the album viewer
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, SW, SH); statusBar(c); cover(c, ims.fall, 0, 150, SW, 520);
    c.fillStyle = '#fff'; c.font = '700 15px Inter, system-ui, sans-serif'; c.textAlign = 'left'; c.fillText('Night Market', 20, 120);
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.font = '400 13px Inter, system-ui, sans-serif'; c.fillText('11:46 PM', 20, 140);
    out.fullFall = tex(cv); }
  return out;
}

export function usePilotScreens() {
  const [t, setT] = useState<PilotTex | null>(null);
  const [h] = useState(() => delayRender('pilot screens'));
  useEffect(() => { (cached ??= build()).then((x) => { setT(x); continueRender(h); }); }, [h]);
  return t;
}
export const TILE = SW / 3;
