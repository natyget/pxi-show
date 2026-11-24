// Phone screens for the pilot "Not Me", drawn in the show's pixel world (textures on the 3D phone, pixelated with it).
// PXI wording from the app: "You might be in a photo" / "Tap to review in <album>" (FaceMatchCard.tsx), "IS THIS YOU?",
// "Not me" / "It's me" (app/face-review.tsx), "<name> invited you to" + RSVP and "WHO'S GOING" (AlbumInviteCard.tsx,
// EventSections.tsx). Dev's phone uses a generic photo viewer (no real brand UI).
import { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile } from 'remotion';
import * as THREE from 'three';

export const W = 390, H = 844;
const FONT = 'PixelifyCanvas';
const PURPLE = '#a523ef';
export const ALBUM = 'Our first night in the city';
const img = (src: string) => new Promise<HTMLImageElement>((r) => { const i = new Image(); i.onload = () => r(i); i.src = staticFile(src); });
const tex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const cover = (c: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number, zoom = 1, fx = 0.5, fy = 0.5) => {
  const s = Math.max(w / im.width, h / im.height) * zoom, sw = w / s, sh = h / s;
  const sx = Math.min(im.width - sw, Math.max(0, im.width * fx - sw / 2)), sy = Math.min(im.height - sh, Math.max(0, im.height * fy - sh / 2));
  c.drawImage(im, sx, sy, sw, sh, x, y, w, h);
};
const canvas = (w = W, h = H) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')!] as const; };
const island = (c: CanvasRenderingContext2D) => { c.fillStyle = '#000'; rr(c, 135, 14, 120, 36, 18); c.fill(); };
const wallpaper = (c: CanvasRenderingContext2D) => {
  const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
};
const emoji = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {   // a little teary smiley, drawn (no emoji font)
  c.fillStyle = '#ffcf4a'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = '#3a2a10'; c.fillRect(x - r * 0.45, y - r * 0.25, r * 0.22, r * 0.3); c.fillRect(x + r * 0.23, y - r * 0.25, r * 0.22, r * 0.3);
  c.fillStyle = '#6ad5ff'; c.fillRect(x - r * 0.48, y + r * 0.08, r * 0.2, r * 0.35); c.fillRect(x + r * 0.28, y + r * 0.08, r * 0.2, r * 0.35);
  c.fillStyle = '#3a2a10'; c.fillRect(x - r * 0.25, y + r * 0.45, r * 0.5, r * 0.12);
};

export type NMTex = Record<string, THREE.Texture>;
let cached: Promise<NMTex> | null = null;

async function build(): Promise<NMTex> {
  const f = new FontFace(FONT, `url(${staticFile('PixelifyB.ttf')})`, { weight: '400 700' }); await f.load(); document.fonts.add(f);
  const [icon, bite, family, group] = await Promise.all(['pxi-app-icon.png', 'photos/nm_bite.png', 'photos/nm_family.png', 'photos/nm_group.png'].map(img));
  const out: NMTex = {};

  // lock screen + the push card
  { const [cv, c] = canvas(); wallpaper(c); island(c); c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = `500 26px ${FONT}`; c.fillText('Friday, November 13', W / 2, 108);
    c.font = `700 120px ${FONT}`; c.fillText('11:12', W / 2, 228);
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
  card('card', ['You might be', 'in a photo'], `Tap to review in ${ALBUM}`);

  // face review: the same burst, closer each time. Ring on his face (he's behind the family, top right of the frame).
  // his face in the photo (fraction of the image); each review crops tighter around it
  const FACE: [number, number] = [0.2, 0.555];
  const review = (key: string, zoom: number) => {
    const [cv, c] = canvas(); c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 44px ${FONT}`; c.fillText('IS THIS YOU?', W / 2, 118);
    const px = 25, py = 150, pw = 340, ph = 470;
    const s0 = Math.max(pw / bite.width, ph / bite.height) * zoom, sw = pw / s0, sh = ph / s0;
    const sx = Math.min(bite.width - sw, Math.max(0, bite.width * FACE[0] - sw / 2)), sy = Math.min(bite.height - sh, Math.max(0, bite.height * FACE[1] - sh / 2));
    c.save(); rr(c, px, py, pw, ph, 26); c.clip(); c.drawImage(bite, sx, sy, sw, sh, px, py, pw, ph); c.restore();
    const rx = px + (bite.width * FACE[0] - sx) * s0, ry = py + (bite.height * FACE[1] - sy) * s0;
    c.strokeStyle = PURPLE; c.lineWidth = 7; c.beginPath(); c.arc(rx, ry, 0.075 * pw * zoom, 0, 7); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.font = `500 21px ${FONT}`; c.fillText(`in ${ALBUM}`, W / 2 - 14, 660); emoji(c, W / 2 + 152, 653, 11);
    c.fillStyle = '#2a2638'; rr(c, 25, 700, 160, 74, 37); c.fill();
    const g = c.createLinearGradient(205, 700, 365, 774); g.addColorStop(0, PURPLE); g.addColorStop(1, '#552bce');
    c.fillStyle = g; rr(c, 205, 700, 160, 74, 37); c.fill();
    c.fillStyle = '#fff'; c.font = `700 30px ${FONT}`; c.fillText('Not me', 105, 748); c.fillText("It's me", 285, 748);
    out[key] = tex(cv);
  };
  review('review1', 1); review('review2', 1.6); review('review3', 2.4);

  // Dev's phone: a plain photo viewer (camera just took one), then swiped back to the bite. Trash can bottom right.
  const viewer = (key: string, im: HTMLImageElement, label: string) => {
    const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 24px ${FONT}`; c.fillText('Today', W / 2, 100);
    c.font = `500 18px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText(label, W / 2, 126);
    cover(c, im, 0, 170, W, 520);
    c.fillStyle = '#fff'; c.lineWidth = 4; c.strokeStyle = '#fff';
    // share, heart, info (simple outlines), trash
    c.strokeRect(40, 742, 26, 26); c.beginPath(); c.moveTo(53, 728); c.lineTo(53, 752); c.stroke();
    c.beginPath(); c.arc(140, 752, 9, Math.PI, 0); c.arc(158, 752, 9, Math.PI, 0); c.lineTo(149, 775); c.closePath(); c.stroke();
    c.beginPath(); c.arc(245, 755, 14, 0, 7); c.stroke(); c.fillRect(243, 752, 4, 12); c.fillRect(243, 745, 4, 4);
    c.fillRect(326, 740, 34, 4); c.fillRect(337, 734, 12, 6); c.strokeRect(330, 746, 26, 30);
    out[key] = tex(cv);
  };
  viewer('dev_new', family, '11:14 PM'); viewer('dev_bite', bite, '11:11 PM');

  // the invite (full screen, big type: it has to read in one glance)
  { const [cv, c] = canvas(); c.fillStyle = '#0d0b14'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 30px ${FONT}`; c.fillText('Notifications', 24, 112);
    c.fillStyle = '#1c1a26'; rr(c, 16, 150, W - 32, 560, 30); c.fill();
    c.save(); rr(c, 16, 150, W - 32, 250, 30); c.clip(); cover(c, group, 16, 150, W - 32, 250); c.restore();
    c.fillStyle = '#c4683a'; c.beginPath(); c.arc(60, 448, 26, 0, 7); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 26px ${FONT}`; c.fillText('D', 60, 457);
    c.textAlign = 'left'; c.font = `700 26px ${FONT}`; c.fillStyle = '#fff'; c.fillText('Dev', 100, 445);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = `500 24px ${FONT}`; c.fillText('invited you to', 152, 445);
    c.fillStyle = '#fff'; c.font = `700 38px ${FONT}`; c.fillText('Sunday brunch', 36, 512); c.fillText('with our local', 36, 554);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.font = `500 24px ${FONT}`; c.fillText('Sun · 10:00 AM', 36, 596);
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.font = `700 16px ${FONT}`; c.fillText('WHO’S GOING', 36, 640);
    c.fillStyle = '#fff'; c.font = `700 24px ${FONT}`; c.fillText('Dev, Priya, Maya', 36, 676);
    const g = c.createLinearGradient(16, 730, W - 16, 800); g.addColorStop(0, PURPLE); g.addColorStop(1, '#552bce');
    c.fillStyle = g; rr(c, 16, 730, W - 32, 70, 35); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 30px ${FONT}`; c.fillText('RSVP', W / 2, 776);
    out.invite = tex(cv); }

  // the album: header (cover photo + title), then the gallery grid. Title and cover change; drawn per state.
  const album = (key: string, coverIm: HTMLImageElement, title: string, typed = 1) => {
    const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.save(); rr(c, 16, 70, W - 32, 330, 28); c.clip(); cover(c, coverIm, 16, 70, W - 32, 330, coverIm === bite ? 2.2 : 1, coverIm === bite ? 0.2 : 0.5, coverIm === bite ? 0.5 : 0.5);
    const g = c.createLinearGradient(0, 250, 0, 400); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); c.fillStyle = g; c.fillRect(16, 250, W - 32, 150); c.restore();
    const shown = title.slice(0, Math.round(title.length * typed));
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 34px ${FONT}`;
    const words = shown.split(' '); const l1 = words.slice(0, 3).join(' '), l2 = words.slice(3).join(' ');
    c.fillText(l1, 36, 330); c.fillText(l2, 36, 370);
    if (typed >= 1) emoji(c, 36 + c.measureText(l2).width + 26, 358, 15);
    if (typed < 1 && Math.floor(typed * 20) % 2 === 0) { c.fillRect(36 + c.measureText(l2).width + 4, 344, 3, 30); }
    // THREAD / GALLERY toggle
    c.fillStyle = '#1c1c1c'; rr(c, 16, 420, W - 32, 50, 25); c.fill();
    c.fillStyle = PURPLE; rr(c, 22 + (W - 44) / 2, 426, (W - 44) / 2, 38, 19); c.fill();
    c.textAlign = 'center'; c.font = `700 15px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillText('THREAD', 22 + (W - 44) / 4, 451);
    c.fillStyle = '#fff'; c.fillText('GALLERY', 22 + (W - 44) * 3 / 4, 451);
    const tiles = [group, family, group, bite, group, family];
    tiles.forEach((im, i) => { const x = 16 + (i % 3) * 120, y = 486 + Math.floor(i / 3) * 120; c.save(); rr(c, x + 2, y + 2, 116, 116, 14); c.clip(); cover(c, im, x + 2, y + 2, 116, 116, 1.6, 0.55, 0.42); c.restore(); });
    out[key] = tex(cv);
  };
  album('album_before', family, ALBUM);
  album('album_cover', bite, ALBUM);
  const T2 = 'Our first friend in the city';
  // retype: delete back to "Our first ", then type "friend in the city"
  for (let k = 0; k <= 8; k++) {
    const del = ALBUM.slice(0, ALBUM.length - Math.round((ALBUM.length - 10) * (k / 8)));
    album(`album_del${k}`, bite, del, 1.0001);
  }
  for (let k = 0; k <= 8; k++) album(`album_type${k}`, bite, T2.slice(0, 10 + Math.round((T2.length - 10) * (k / 8))), k === 8 ? 1 : 1.0001);
  return out;
}

export function useNotMeScreens() {
  const [t, setT] = useState<NMTex | null>(null);
  const [h] = useState(() => delayRender('not-me screens'));
  useEffect(() => { (cached ??= build()).then((x) => { setT(x); continueRender(h); }); }, [h]);
  return t;
}
