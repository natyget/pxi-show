// Screens and paper for the pilot "No Evidence" and reel 2 "What I'm Building", drawn in the show's pixel world.
// PXI wording from the app: "You might be in N photos" / "Tap to review in <album>" (src/components/notifications/
// FaceMatchCard.tsx); album THREAD / GALLERY toggle (app/album/[id].tsx). Nio's own phone apps (photos, story) are
// generic, never a real brand's UI.
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

export type NETex = Record<string, THREE.Texture>;
let cached: Promise<NETex> | null = null;
export const PHOTOS = ['apartment', 'selfie', 'drink', 'sky', 'moon', 'backhead', 'face', 'party1', 'party2', 'party3', 'party4'] as const;

async function build(): Promise<NETex> {
  const f = new FontFace(FONT, `url(${staticFile('PixelifyB.ttf')})`, { weight: '400 700' }); await f.load(); document.fonts.add(f);
  const icon = await img('pxi-app-icon.png');
  const ph: Record<string, HTMLImageElement> = {};
  await Promise.all(PHOTOS.map(async (n) => { ph[n] = await img(`photos/ne_${n}.png`); }));
  const out: NETex = {};

  // his camera roll: the newest photo is moving day. Nothing after.
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 40px ${FONT}`; c.fillText('Recents', 20, 120);
    c.font = `500 20px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillText('7 photos', 20, 150);
    const tiles = ['#5a6b7c', '#7a5a46', '#3f6f8f', '#8f4f7f', '#5f8f5a', '#a8765a'];
    tiles.forEach((col, i) => { const x = 2 + (i % 3) * 130, y = 180 + Math.floor(i / 3) * 130; c.fillStyle = col; c.fillRect(x, y, 126, 126); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + 30, y + 40, 66, 46); });
    c.fillStyle = '#fff'; c.font = `700 24px ${FONT}`; c.fillText('Oct 21 · moving day', 20, 470);
    cover(c, ph.apartment, 2, 490, 256, 256);
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(2, 490, 256, 256);
    out.roll = tex(cv); }

  // her thumb typing his number in, then the phone dies
  { const [cv, c] = canvas(); c.fillStyle = '#0b0b0f'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `500 30px ${FONT}`; c.fillText('New contact', W / 2, 120);
    c.font = `700 56px ${FONT}`; c.fillText('917 55', W / 2, 260);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `500 24px ${FONT}`; c.fillText('name?', W / 2, 330);
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].forEach((k, i) => { if (!k) return; const x = 95 + (i % 3) * 100, y = 440 + Math.floor(i / 3) * 95;
      c.fillStyle = '#2a2a33'; c.beginPath(); c.arc(x, y, 38, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = `500 36px ${FONT}`; c.fillText(k, x, y + 13); });
    out.typing = tex(cv); }
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#d23a3a'; c.lineWidth = 8; rr(c, 120, 380, 130, 66, 12); c.stroke(); c.fillStyle = '#d23a3a'; c.fillRect(252, 400, 12, 26); c.fillRect(134, 394, 14, 38);
    out.dead = tex(cv); }

  // a photo shown on someone else's phone (generic viewer); `story` adds story bars and no chrome
  const viewer = (key: string, im: HTMLImageElement, story = false) => {
    const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (story) { cover(c, im, 0, 0, W, H); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(12, 18, 170, 5); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(190, 18, 188, 5); }
    else { island(c); cover(c, im, 0, 150, W, 560); }
    out[key] = tex(cv);
  };
  // junk photos from the queue: a thumb, nothing, the floor, a smear of lights
  const junk = (draw: (c: CanvasRenderingContext2D) => void) => { const [cv, c] = canvas(390, 560); draw(c); return new Promise<HTMLImageElement>((r) => { const im = new Image(); im.onload = () => r(im); im.src = cv.toDataURL(); }); };
  const rnd = (i: number) => { const n = Math.sin(i * 12.9898) * 43758.5453; return n - Math.floor(n); };
  const jThumb = await junk((c) => { c.fillStyle = '#1b1626'; c.fillRect(0, 0, 390, 560); [[60, 120, '#ff6ad5'], [300, 90, '#6ad5ff'], [200, 60, '#f2c94c']].forEach(([x, y, col]) => { c.fillStyle = col as string; c.beginPath(); c.arc(x as number, y as number, 8, 0, 7); c.fill(); });
    const g = c.createRadialGradient(150, 420, 30, 150, 420, 330); g.addColorStop(0, '#f0a890'); g.addColorStop(0.7, '#c9705a'); g.addColorStop(1, '#7a3a34');
    c.fillStyle = g; c.beginPath(); c.ellipse(150, 430, 290, 260, -0.4, 0, 7); c.fill(); });
  const jDark = await junk((c) => { c.fillStyle = '#07060a'; c.fillRect(0, 0, 390, 560); for (let i = 0; i < 5; i++) { c.fillStyle = ['#ff6ad5', '#6ad5ff', '#f2c94c'][i % 3]; c.globalAlpha = 0.5; c.beginPath(); c.arc(60 + i * 70, 250 + rnd(i) * 40, 4, 0, 7); c.fill(); } c.globalAlpha = 1; });
  const jFloor = await junk((c) => { c.fillStyle = '#4a4450'; c.fillRect(0, 0, 390, 560); for (let i = 0; i < 300; i++) { c.fillStyle = rnd(i) > 0.5 ? '#55505c' : '#3e3946'; c.fillRect(rnd(i + 3) * 390, rnd(i + 7) * 560, 4, 4); }
    c.fillStyle = '#c23a3a'; c.beginPath(); c.moveTo(230, 300); c.lineTo(330, 300); c.lineTo(315, 420); c.lineTo(245, 420); c.closePath(); c.fill(); c.fillStyle = '#e8dcc4'; c.fillRect(230, 296, 100, 10);
    c.fillStyle = '#efe6d2'; c.beginPath(); c.ellipse(60, 520, 110, 60, 0.3, 0, 7); c.fill(); });
  const jBlur = await junk((c) => { c.fillStyle = '#140f26'; c.fillRect(0, 0, 390, 560); c.lineCap = 'round';
    for (let i = 0; i < 14; i++) { c.strokeStyle = ['#ff6ad5', '#6ad5ff', '#f2c94c', '#9dff8a'][i % 4]; c.globalAlpha = 0.7; c.lineWidth = 10; c.beginPath(); const x = rnd(i) * 390, y = rnd(i + 20) * 560; c.moveTo(x - 90, y + 30); c.lineTo(x + 90, y - 30); c.stroke(); } c.globalAlpha = 1; });
  viewer('v_thumb', jThumb); viewer('v_dark', jDark); viewer('v_floor', jFloor); viewer('v_blur', jBlur);
  viewer('v_selfie', ph.selfie); viewer('v_drink', ph.drink, true); viewer('v_sky', ph.sky); viewer('v_moon', ph.moon); viewer('v_backhead', ph.backhead);

  // his three photos, in his own roll
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 40px ${FONT}`; c.fillText('Recents', 20, 120);
    c.font = `700 24px ${FONT}`; c.fillText('Today', 20, 190);
    [ph.selfie, ph.drink, ph.backhead].forEach((im, i) => cover(c, im, 2 + i * 130, 210, 126, 170));
    c.fillText('Oct 21 · moving day', 20, 440); cover(c, ph.apartment, 2, 460, 126, 126);
    out.three = tex(cv); }

  // reel 2: PXI face match push, the album (photos of him from everyone's phones), the Discover map
  { const [cv, k] = canvas(370, 150);
    k.fillStyle = 'rgba(78,78,104,0.97)'; rr(k, 0, 0, 370, 150, 34); k.fill();
    k.save(); rr(k, 20, 37, 76, 76, 17); k.clip(); k.drawImage(icon, 20, 37, 76, 76); k.restore();
    k.fillStyle = '#fff'; k.textAlign = 'left'; k.font = `700 30px ${FONT}`; k.fillText('You might be', 114, 60); k.fillText('in 61 photos', 114, 93);
    k.font = `500 21px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.75)'; k.fillText('Tap to review in The Roof', 114, 132, 240);
    k.textAlign = 'right'; k.font = `500 20px ${FONT}`; k.fillStyle = 'rgba(255,255,255,0.55)'; k.fillText('now', 350, 30);
    out.card61 = tex(cv); }
  { const [cv, c] = canvas(); const g = c.createRadialGradient(120, 170, 20, 160, 300, 700); g.addColorStop(0, '#4b4fb0'); g.addColorStop(0.45, '#22245a'); g.addColorStop(1, '#0c0c1e');
    c.fillStyle = g; c.fillRect(0, 0, W, H); island(c); c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = `500 26px ${FONT}`; c.fillText('Saturday, November 14', W / 2, 108); c.font = `700 120px ${FONT}`; c.fillText('11:52', W / 2, 228);
    out.lock = tex(cv); }
  { const [cv, c] = canvas(); c.fillStyle = '#000'; c.fillRect(0, 0, W, H); island(c);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `700 20px ${FONT}`; c.fillText('THE ROOF', W / 2, 92);
    c.fillStyle = '#1c1c1c'; rr(c, 16, 116, W - 32, 50, 25); c.fill(); c.fillStyle = PURPLE; rr(c, 22 + (W - 44) / 2, 122, (W - 44) / 2, 38, 19); c.fill();
    c.font = `700 15px ${FONT}`; c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillText('THREAD', 22 + (W - 44) / 4, 147); c.fillStyle = '#fff'; c.fillText('GALLERY', 22 + (W - 44) * 3 / 4, 147);
    out.album = tex(cv);
    ['party1', 'party2', 'party3', 'party4', 'face'].forEach((n) => { const [tv, t] = canvas(124, 124); t.save(); rr(t, 2, 2, 120, 120, 14); t.clip(); cover(t, ph[n], 2, 2, 120, 120); t.restore(); out[`tile_${n}`] = tex(tv); }); }
  { const [cv, c] = canvas(); c.fillStyle = '#16141f'; c.fillRect(0, 0, W, H);
    // streets and blocks, in the night palette
    c.strokeStyle = '#2b2838'; c.lineWidth = 16; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, 60 + i * 100); c.lineTo(W, 20 + i * 100); c.stroke(); c.beginPath(); c.moveTo(30 + i * 60, 0); c.lineTo(i * 60 - 10, H); c.stroke(); }
    c.fillStyle = '#1f3a2a'; c.fillRect(220, 330, 120, 90);
    island(c);
    c.fillStyle = '#fff'; c.textAlign = 'left'; c.font = `700 30px ${FONT}`; c.fillText('Tonight near you', 20, 110);
    out.map = tex(cv);
    // pins pop in one by one: map1..map4
    const pins: [number, number, string, string][] = [[250, 360, 'the roof · 10pm', '#9dff8a'], [110, 250, 'open mic', '#ff6ad5'], [140, 560, 'night market', '#f2c94c'], [290, 650, 'karaoke, 4B', '#6ad5ff']];
    for (let n = 1; n <= 4; n++) { const [pv, pc] = canvas(); pc.drawImage(cv, 0, 0);
      pins.slice(0, n).forEach(([x, y, label, col]) => {
        pc.fillStyle = col; pc.strokeStyle = '#fff'; pc.lineWidth = 4; pc.beginPath(); pc.arc(x, y, 16, 0, 7); pc.fill(); pc.stroke();
        pc.font = `700 20px ${FONT}`; const w = pc.measureText(label).width + 24; const lx = Math.min(W - w - 8, Math.max(8, x - w / 2));
        pc.fillStyle = 'rgba(20,18,30,0.92)'; rr(pc, lx, y - 62, w, 34, 17); pc.fill(); pc.fillStyle = '#fff'; pc.textAlign = 'left'; pc.fillText(label, lx + 12, y - 38); });
      out[`map${n}`] = tex(pv); } }

  // paper: his list
  { const [cv, c] = canvas(300, 400); c.fillStyle = '#f2ecdc'; c.fillRect(0, 0, 300, 400);
    c.strokeStyle = '#b8c8e0'; c.lineWidth = 2; for (let y = 60; y < 400; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(300, y); c.stroke(); }
    c.fillStyle = '#1e2a52'; c.font = `700 30px ${FONT}`; c.textAlign = 'center'; c.fillText('WHAT I KNOW', 150, 44); c.fillRect(60, 52, 180, 4);
    out.paperBase = tex(cv); }
  const lines = ['1. GREEN JACKET', '2. LAUGHS AT "ACTUALLY"', '3. ~40 PHONES', '4. EST. 212 PHOTOS'];
  for (let n = 1; n <= 4; n++) { const [cv, c] = canvas(300, 400); c.fillStyle = '#f2ecdc'; c.fillRect(0, 0, 300, 400);
    c.strokeStyle = '#b8c8e0'; c.lineWidth = 2; for (let y = 60; y < 400; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(300, y); c.stroke(); }
    c.fillStyle = '#1e2a52'; c.font = `700 30px ${FONT}`; c.textAlign = 'center'; c.fillText('WHAT I KNOW', 150, 44); c.fillRect(60, 52, 180, 4);
    c.font = `700 24px ${FONT}`; c.textAlign = 'left';
    lines.slice(0, n).forEach((l, i) => c.fillText(l, 16, 120 + i * 72, 270));
    if (n === 4) { c.strokeStyle = '#c23a3a'; c.lineWidth = 4; c.beginPath(); c.ellipse(130, 337, 125, 32, 0, 0, 7); c.stroke(); }
    out[`paper${n}`] = tex(cv); }

  // the flyer (his face), and the same flyer with green pen on it
  const flyer = (key: string, pen: boolean) => {
    const [cv, c] = canvas(340, 460); c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, 340, 460);
    c.fillStyle = '#151216'; c.textAlign = 'center'; c.font = `700 34px ${FONT}`; c.fillText('DID YOU TAKE', 170, 50); c.fillText('A PHOTO OF ME?', 170, 88);
    cover(c, ph.face, 70, 105, 200, 200); c.strokeStyle = '#151216'; c.lineWidth = 3; c.strokeRect(70, 105, 200, 200);
    c.font = `500 20px ${FONT}`; c.fillText('last night, the roof.', 170, 336); c.fillText('slide it under 3B.', 170, 362);
    if (pen) { c.fillStyle = '#1f9a4a'; c.font = `700 28px ${FONT}`; c.save(); c.translate(170, 396); c.rotate(-0.04);
      c.fillText('I have 61.', 0, 0); c.font = `700 22px ${FONT}`; c.fillText('same roof, saturday', 0, 26); c.fillText('- green jacket', 40, 50); c.restore(); }
    out[key] = tex(cv);
  };
  flyer('flyer', false); flyer('flyer_pen', true);

  // the sign on the lobby desk
  { const [cv, c] = canvas(360, 200); c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, 360, 200);
    c.fillStyle = '#151216'; c.textAlign = 'center'; c.font = `700 40px ${FONT}`; c.fillText('PHOTO RETURNS', 180, 55);
    c.font = `700 30px ${FONT}`; c.fillText('$5 a photo', 180, 110); c.fillStyle = '#c23a3a'; c.fillText('$20 if my face', 180, 150); c.fillText('is in it', 180, 184);
    out.sign = tex(cv); }

  // the laptop: a blank page, then the line, typed
  const LINE = 'every photo you\'re in, from everyone\'s phones.';
  for (let k = 0; k <= 10; k++) { const [cv, c] = canvas(310, 200); c.fillStyle = '#f4f4f6'; c.fillRect(0, 0, 310, 200);
    c.fillStyle = '#d8d8de'; c.fillRect(0, 0, 310, 16);
    const s = LINE.slice(0, Math.round(LINE.length * k / 10)); c.fillStyle = '#151216'; c.font = `700 30px ${FONT}`; c.textAlign = 'left';
    const words = s.split(' '); let line = '', y = 62; words.forEach((wd) => { if (c.measureText(line + wd).width > 280) { c.fillText(line, 14, y); line = ''; y += 40; } line += wd + ' '; }); c.fillText(line + (k < 10 ? '|' : ''), 14, y);
    out[`laptop${k}`] = tex(cv); }
  return out;
}

export function useNoEvidenceScreens() {
  const [t, setT] = useState<NETex | null>(null);
  const [h] = useState(() => delayRender('no-evidence screens'));
  useEffect(() => { (cached ??= build()).then((x) => { setT(x); continueRender(h); }); }, [h]);
  return t;
}
