// Screens for the pilot "No Pics". Nio's own phone apps (photos, messages) are generic, never a real brand's UI.
// PXI wording from the app: "You might be in N photos" / "Tap to review in <album>" (FaceMatchCard.tsx);
// album THREAD / GALLERY toggle (app/album/[id].tsx).
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

export const W = 390, H = 844;
const FONT = 'PixelifyCanvas';
const PURPLE = '#a523ef';
const img = (src: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = staticFile(src); });
const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const cover = (c: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
  c.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
};
const canvas = (w = W, h = H) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')!] as const; };
const island = (c: CanvasRenderingContext2D) => { c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill(); };

export type NPTex = Record<string, THREE.Texture>;
let cached: Promise<NPTex> | null = null;
export const NP_PHOTOS = ['pasta', 'fridge', 'circle', 'selfie'] as const;

async function build(): Promise<NPTex> {
  const f = new FontFace(FONT, `url(${staticFile('PixelifyB.ttf')})`, { weight: '400 700' }); await f.load(); document.fonts.add(f);
  const icon = await img('pxi-app-icon.png');
  const ph: Record<string, HTMLImageElement> = {};
  await Promise.all(NP_PHOTOS.map(async (n) => { ph[n] = await img(`photos/np_${n}.png`); }));
  const out: NPTex = {};

  // his camera roll: the newest photo is pasta, three weeks ago
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 40px ${FONT}`; c.fillText('Recents', 20, 120);
    c.font = `700 24px ${FONT}`; c.fillText('Oct 20', 20, 180);
    cover(c, ph.pasta, 2, 200, 386, 386);
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.font = `500 20px ${FONT}`; c.fillText('3 weeks ago', 20, 620);
    out.roll = tex(cv); }

  // the group chat, three states
  const chat = (key: string, typed: string, sent: boolean, seen: boolean, reply: boolean) => {
    const [cv, c] = canvas(); c.fillStyle = '#101014'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#1c1c24'; c.fillRect(0, 60, W, 84);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 26px ${FONT}`; c.fillText("nio's place 🔥", W / 2, 100);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `500 18px ${FONT}`; c.fillText('41 people', W / 2, 128);
    c.textAlign = 'left';
    // older messages from last night, greyed
    [['fridge guy is back', 200], ['WHO IS ON THE FRIDGE', 262]].forEach(([m, y]) => {
      c.fillStyle = '#2a2a34'; c.font = `500 20px ${FONT}`; const w = c.measureText(m as string).width + 32; rr(c, 16, (y as number) - 30, w, 46, 20); c.fill();
      c.fillStyle = '#d8d8e0'; c.fillText(m as string, 32, (y as number) + 1); });
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.font = `500 16px ${FONT}`; c.textAlign = 'center'; c.fillText('last night 2:14 AM', W / 2, 330); c.fillText('today 11:02 AM', W / 2, 380);
    c.textAlign = 'left';
    if (sent) { const m = 'yo send pics'; c.font = `700 24px ${FONT}`; const w = c.measureText(m).width + 36;
      c.fillStyle = PURPLE; rr(c, W - 16 - w, 400, w, 52, 22); c.fill(); c.fillStyle = '#fff'; c.fillText(m, W - 16 - w + 18, 434); }
    if (seen) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.font = `500 16px ${FONT}`; c.textAlign = 'right'; c.fillText('Seen by 41', W - 20, 476); c.textAlign = 'left'; }
    if (reply) { const m = 'who is this'; c.font = `700 24px ${FONT}`; const w = c.measureText(m).width + 36;
      c.fillStyle = '#2a2a34'; rr(c, 16, 506, w, 52, 22); c.fill(); c.fillStyle = '#fff'; c.fillText(m, 34, 540); }
    // input bar
    c.fillStyle = '#1c1c24'; c.fillRect(0, H - 110, W, 110); c.fillStyle = '#2a2a34'; rr(c, 16, H - 92, W - 32, 52, 26); c.fill();
    c.fillStyle = typed ? '#fff' : 'rgba(255,255,255,0.35)'; c.font = `500 22px ${FONT}`; c.fillText(typed || 'Message', 36, H - 58);
    out[key] = tex(cv);
  };
  chat('chat0', 'yo send pics|', false, false, false);
  chat('chat1', '', true, false, false);
  chat('chat2', '', true, true, false);
  chat('chat3', '', true, true, true);

  // a voice note from Maya, playing: k = progress 0..8
  for (let k = 0; k <= 8; k++) {
    const [cv, c] = canvas(); c.fillStyle = '#101014'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#1c1c24'; c.fillRect(0, 60, W, 84); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 26px ${FONT}`; c.fillText('maya', W / 2, 112);
    c.fillStyle = '#2a2a34'; rr(c, 16, 360, W - 70, 96, 30); c.fill();
    c.fillStyle = '#8d5a3d'; c.beginPath(); c.arc(64, 408, 30, 0, 7); c.fill(); c.fillStyle = '#2a1d10'; c.beginPath(); c.arc(64, 386, 22, Math.PI, 0); c.fill();
    for (let i = 0; i < 24; i++) { const hh = 8 + Math.abs(Math.sin(i * 1.7) * 30) + (i % 3) * 4; c.fillStyle = i / 24 < k / 8 ? '#fff' : 'rgba(255,255,255,0.3)'; c.fillRect(110 + i * 9, 408 - hh / 2, 5, hh); }
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `500 16px ${FONT}`; c.textAlign = 'left'; c.fillText(`0:0${Math.min(6, Math.round(k * 0.75))}`, 110, 444);
    out[`voice${k}`] = tex(cv);
  }

  // PXI face match push: "You might be in 38 photos"
  { const [cv, k] = canvas(370, 150);
    k.fillStyle = 'rgba(78,78,104,0.97)'; rr(k, 0, 0, 370, 150, 34); k.fill();
    k.save(); rr(k, 20, 37, 76, 76, 17); k.clip(); k.drawImage(icon, 20, 37, 76, 76); k.restore();
    k.fillStyle = '#fff'; k.textAlign = 'left'; k.font = `700 30px ${FONT}`; k.fillText('You might be', 114, 60); k.fillText('in 38 photos', 114, 93);
    k.font = `500 21px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.75)'; k.fillText("Tap to review in nio's place", 114, 132, 240);
    k.textAlign = 'right'; k.font = `500 20px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.55)'; k.fillText('now', 350, 30);
    out.card = tex(cv); }
  // lock screen behind the card
  { const [cv, c] = canvas(); const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
    c.fillStyle = g; c.fillRect(0, 0, W, H); island(c); c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = `500 26px ${FONT}`; c.fillText('Sunday, November 15', W / 2, 108); c.font = `700 120px ${FONT}`; c.fillText('11:09', W / 2, 228);
    out.lock = tex(cv); }
  // the album, gallery tab
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 20px ${FONT}`; c.fillText("NIO'S PLACE", W / 2, 92);
    c.fillStyle = '#1c1c1c'; rr(c, 16, 116, W - 32, 50, 25); c.fill(); c.fillStyle = PURPLE; rr(c, 22 + (W - 44) / 2, 122, (W - 44) / 2, 38, 19); c.fill();
    c.font = `700 15px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillText('THREAD', 22 + (W - 44) / 4, 147); c.fillStyle = '#fff'; c.fillText('GALLERY', 22 + (W - 44) * 3 / 4, 147);
    out.album = tex(cv); }
  NP_PHOTOS.forEach((n) => { const [tv, t] = canvas(240, 320); t.save(); rr(t, 2, 2, 236, 316, 16); t.clip(); cover(t, ph[n], 2, 2, 236, 316); t.restore(); out[`tile_${n}`] = tex(tv); });
  return out;
}

export function useNoPicsScreens() {
  const [t, setT] = useState<NPTex | null>(null);
  const [h] = useState(() => delayRender('no-pics screens'));
  useEffect(() => { (cached ??= build()).then((x) => { setT(x); continueRender(h); }); }, [h]);
  return t;
}
