// Phone screens for Ep 1, drawn in the show's pixel world (the textures sit on the 3D phone and get pixelated with it).
// Wording that is PXI's own: "You might be in a photo", "Tap to review in <album>", "IS THIS YOU?", "Not me", "It's me",
// "TAP TO ZOOM FACE" (FaceMatchCard.tsx, app/face-review.tsx). iOS wording: 'Delete "PXI"?' alert.
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

export const W = 390, H = 844;
const FONT = 'PixelifyCanvas';
const img = (src: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = staticFile(src); });
const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const cover = (c: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
  c.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
};
const canvas = (w = W, h = H) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')!] as const; };
const island = (c: CanvasRenderingContext2D) => { c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill(); };
const wallpaper = (c: CanvasRenderingContext2D) => {
  const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
};

export type Ep1Tex = Record<string, THREE.Texture>;
let cached: Promise<Ep1Tex> | null = null;

async function build(): Promise<Ep1Tex> {
  const f = new FontFace(FONT, `url(${staticFile('PixelifySans.ttf')})`, { weight: '400 700' }); await f.load(); document.fonts.add(f);
  const [icon, behind, sneeze, candle, asleep, wave, future, deleting] = await Promise.all(
    ['pxi-app-icon.png', 'photos/e1_behind.png', 'photos/e1_sneeze.png', 'photos/e1_candle.png', 'photos/e1_asleep.png', 'photos/e1_wave.png', 'photos/e1_future.png', 'photos/e1_deleting.png'].map(img));
  const out: Ep1Tex = {};

  // lock screen (Wednesday) + the push card
  { const [cv, c] = canvas(); wallpaper(c); island(c); c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = `500 26px ${FONT}`; c.fillText('Wednesday, November 11', W / 2, 108);
    c.font = `700 120px ${FONT}`; c.fillText('11:47', W / 2, 228);
    c.fillStyle = 'rgba(255,255,255,0.16)'; [[60, 760], [330, 760]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 30, 0, 7); c.fill(); });
    c.fillStyle = '#fff'; rr(c, 125, 822, 140, 8, 4); c.fill(); out.lock = tex(cv); }
  const card = (key: string, title: string[], sub: string) => {
    const [cv, k] = canvas(370, 150);
    k.fillStyle = 'rgba(78,78,104,0.97)'; rr(k, 0, 0, 370, 150, 34); k.fill();
    k.save(); rr(k, 20, 37, 76, 76, 17); k.clip(); k.drawImage(icon, 20, 37, 76, 76); k.restore();
    k.fillStyle = '#fff'; k.textAlign = 'left'; k.font = `700 30px ${FONT}`; title.forEach((t, i) => k.fillText(t, 114, 60 + i * 33));
    k.font = `500 21px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.75)'; k.fillText(sub, 114, 132, 240);
    k.textAlign = 'right'; k.font = `500 20px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.55)'; k.fillText('now', 350, 30);
    out[key] = tex(cv);
  };
  card('card', ['You might be', 'in a photo'], 'Tap to review in nio being nio');

  // face review: the photo from behind, ring on the back of his head
  const review = (key: string, photo: HTMLImageElement, ring: [number, number, number], stamp?: string) => {
    const [cv, c] = canvas(); c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 40px ${FONT}`; c.fillText('IS THIS YOU?', W / 2, 115);
    if (stamp) { c.font = `500 22px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.65)'; c.fillText(stamp, W / 2, 145); }
    const px = 25, py = 160, pw = 340, ph = 460;
    c.save(); rr(c, px, py, pw, ph, 26); c.clip(); cover(c, photo, px, py, pw, ph); c.restore();
    c.strokeStyle = '#a523ef'; c.lineWidth = 7; c.beginPath(); c.arc(px + ring[0] * pw, py + ring[1] * ph, ring[2] * pw, 0, 7); c.stroke();
    c.font = `500 22px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText('TAP TO ZOOM FACE', W / 2, 660);
    c.fillStyle = '#2a2638'; rr(c, 25, 700, 160, 74, 37); c.fill();
    const g = c.createLinearGradient(205, 700, 365, 774); g.addColorStop(0, '#a523ef'); g.addColorStop(1, '#552bce');
    c.fillStyle = g; rr(c, 205, 700, 160, 74, 37); c.fill();
    c.fillStyle = '#fff'; c.font = `700 30px ${FONT}`; c.fillText('Not me', 105, 748); c.fillText("It's me", 285, 748);
    out[key] = tex(cv);
  };
  review('review_behind', behind, [0.5, 0.42, 0.14]);
  review('review_future', future, [0.38, 0.4, 0.13], 'Sat, Nov 14 · 11:52 PM');
  review('review_deleting', deleting, [0.5, 0.38, 0.14]);

  // the album: base screen + thumbs (pop in one by one)
  { const [cv, c] = canvas(); c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 40px ${FONT}`; c.fillText('nio being nio', 24, 122);
    c.font = `500 21px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText('Shared album · 1 person', 24, 156);
    c.fillStyle = '#6a6a7a'; c.beginPath(); c.arc(346, 128, 22, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 24px ${FONT}`; c.fillText('?', 346, 137);
    out.album = tex(cv);
    [sneeze, candle, asleep, wave].forEach((im, i) => { const [tv, t] = canvas(170, 220); t.save(); rr(t, 0, 0, 170, 220, 16); t.clip(); cover(t, im, 0, 0, 170, 220); t.restore(); out[`thumb${i}`] = tex(tv); });
  }

  // the dialler, "91" typed
  { const [cv, c] = canvas(); c.fillStyle = '#0b0b0f'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `500 64px ${FONT}`; c.fillText('9 1', W / 2, 190);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    keys.forEach((k, i) => { const x = 95 + (i % 3) * 100, y = 300 + Math.floor(i / 3) * 105;
      c.fillStyle = '#2a2a33'; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = `500 40px ${FONT}`; c.fillText(k, x, y + 14); });
    c.fillStyle = '#34c759'; c.beginPath(); c.arc(W / 2, 735, 40, 0, 7); c.fill();
    out.dial = tex(cv); }

  // Threads with Maya: his voice note, her voice note back
  { const [cv, c] = canvas(); c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#3f6b4f'; c.beginPath(); c.arc(W / 2, 92, 26, 0, 7); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 26px ${FONT}`; c.fillText('M', W / 2, 101);
    c.font = `700 24px ${FONT}`; c.fillText('Maya', W / 2, 146);
    const note = (x: number, y: number, mine: boolean, len: string) => {
      c.fillStyle = mine ? '#6b3fd0' : '#2f2c3a'; rr(c, x, y, 230, 64, 30); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 26, y + 20); c.lineTo(x + 44, y + 32); c.lineTo(x + 26, y + 44); c.fill();
      for (let k = 0; k < 18; k++) { const hh = 6 + ((k * 7) % 5) * 5; c.fillRect(x + 60 + k * 8, y + 32 - hh / 2, 4, hh); }
      c.font = `500 18px ${FONT}`; c.textAlign = 'right'; c.fillText(len, x + 220, y + 58);
    };
    note(140, 230, true, '0:03');
    { const [c1v, c1] = canvas(); c1.drawImage(cv, 0, 0); out.thread1 = tex(c1v); }   // snapshot: his note only
    note(20, 320, false, '0:03'); out.thread2 = tex(cv);                                  // then hers arrives
  }

  // home screen with generic icons (no real brands), PXI's real icon, and the delete alert
  const home = (key: string, alert: boolean, gone: boolean) => {
    const [cv, c] = canvas(); wallpaper(c); island(c);
    const cols = ['#e8b86e', '#7fa64a', '#6ad5ff', '#c75a4a', '#ff9ae0', '#efe6d2', '#3f6f8f', '#8f4f7f', '#d9a441', '#5f8f5a', '#a8d8f4', '#f4b8a8'];
    for (let i = 0; i < 16; i++) {
      const x = 30 + (i % 4) * 88, y = 90 + Math.floor(i / 4) * 110;
      if (i === 5) { if (!gone) { c.save(); rr(c, x, y, 68, 68, 16); c.clip(); c.drawImage(icon, x, y, 68, 68); c.restore(); } }
      else { c.fillStyle = cols[i % cols.length]; rr(c, x, y, 68, 68, 16); c.fill(); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(x + 34, y + 34, 14, 0, 7); c.fill(); }
      if (!(i === 5 && gone)) { c.fillStyle = '#fff'; c.font = `500 15px ${FONT}`; c.textAlign = 'center'; c.fillText(i === 5 ? 'PXI' : '', x + 34, y + 88); }
    }
    if (alert) {
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(52,52,60,0.98)'; rr(c, 50, 330, 290, 210, 26); c.fill();
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 28px ${FONT}`; c.fillText('Delete "PXI"?', W / 2, 382);
      c.font = `500 19px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillText('Deleting this app will also', W / 2, 420); c.fillText('delete its data.', W / 2, 446);
      c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(50, 470, 290, 2); c.fillRect(194, 472, 2, 68);
      c.font = `500 26px ${FONT}`; c.fillStyle = '#7ab8ff'; c.fillText('Cancel', 122, 515); c.fillStyle = '#ff5a52'; c.fillText('Delete', 268, 515);
    }
    out[key] = tex(cv);
  };
  home('home', false, false); home('home_alert', true, false); home('home_gone', false, true);
  return out;
}

export function useEp1Screens() {
  const [t, setT] = useState<Ep1Tex | null>(null);
  const [h] = useState(() => delayRender('ep1 screens'));
  useEffect(() => { (cached ??= build()).then((x) => { setT(x); continueRender(h); }); }, [h]);
  return t;
}
