// The crisp phone screen for inserts: an iOS lock screen with a real PXI push.
// Copy is the app's own (FaceMatchCard.tsx: "You might be in a photo" / "Tap to review in <album>").
// Layout follows kit/lib/ios-notif.css (app = its real icon as a rounded square). Drawn at 390x844 pt, scaled by the caller.
import React from 'react';
import { staticFile } from 'remotion';

export const LockScreen: React.FC<{ notifIn: number; press: number; time: string; album: string }> = ({ notifIn, press, time, album }) => (
  <div style={{ width: 390, height: 844, position: 'relative', overflow: 'hidden', borderRadius: 46,
    background: 'radial-gradient(120% 80% at 30% 20%, #3b3f8f 0%, #1b1d45 45%, #0b0b1a 100%)',
    fontFamily: '-apple-system, "SF Pro Display", Inter, system-ui, sans-serif', color: '#fff' }}>
    {/* dynamic island */}
    <div style={{ position: 'absolute', top: 11, left: 140, width: 110, height: 33, borderRadius: 20, background: '#000' }} />
    {/* lock + time */}
    <svg width="14" height="18" viewBox="0 0 14 18" style={{ position: 'absolute', top: 64, left: 188 }}>
      <rect x="1" y="8" width="12" height="9.5" rx="2.2" fill="#fff" fillOpacity="0.9" />
      <path d="M3.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.8" fill="none" />
    </svg>
    <div style={{ position: 'absolute', top: 92, width: '100%', textAlign: 'center', fontSize: 92, fontWeight: 600, letterSpacing: -2, lineHeight: 1, opacity: 0.95 }}>{time}</div>
    {/* the notification */}
    <div style={{ position: 'absolute', left: 10, right: 10, top: 452, transform: `translateY(${(1 - notifIn) * 70}px) scale(${(0.92 + 0.08 * notifIn) * (1 - press * 0.03)})`,
      opacity: Math.min(1, notifIn * 1.6) }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '13px 14px', borderRadius: 22,
        background: press > 0.5 ? 'rgba(90,90,110,0.62)' : 'rgba(60,60,78,0.55)', backdropFilter: 'blur(30px) saturate(1.6)' }}>
        <img src={staticFile('pxi-app-icon.png')} style={{ width: 38, height: 38, borderRadius: '22%', flex: '0 0 auto' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <b style={{ fontSize: 15, fontWeight: 600 }}>You might be in a photo</b>
            <span style={{ fontSize: 13, opacity: 0.55 }}>now</span>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.25, opacity: 0.92 }}>Tap to review in {album}</div>
        </div>
      </div>
    </div>
    {/* bottom: flashlight + camera, home bar */}
    {[40, 300].map((x) => <div key={x} style={{ position: 'absolute', bottom: 46, left: x, width: 50, height: 50, borderRadius: 25, background: 'rgba(255,255,255,0.14)' }} />)}
    <div style={{ position: 'absolute', bottom: 9, left: 128, width: 134, height: 5, borderRadius: 3, background: '#fff', opacity: 0.85 }} />
  </div>
);
