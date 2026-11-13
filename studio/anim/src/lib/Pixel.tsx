// The pixel look: the 3D world renders at 270x480 and is scaled x4 with hard pixel edges, plus film grain at the
// same pixel size, plus the glitch beat (RGB split + horizontal slices) as an SVG filter.
import React, { useLayoutEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useFrame } from '@react-three/fiber';
import { AbsoluteFill, useCurrentFrame, staticFile } from 'remotion';
import * as THREE from 'three';

export const LW = 270, LH = 480, SCALE = 4;

export const Cam: React.FC<{ pos: [number, number, number]; at: [number, number, number]; fov?: number }> = ({ pos, at, fov = 35 }) => {
  const { camera, invalidate } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  // Set during render so the very first frame already uses this camera.
  c.position.set(...pos); c.fov = fov; c.aspect = LW / LH; c.near = 0.05; c.far = 30;
  c.updateProjectionMatrix(); c.lookAt(...at); c.updateMatrixWorld();
  useLayoutEffect(() => { invalidate(); });
  return null;
};

/** Renders the scene into a 270x480 target and draws it full-frame with nearest filtering: real pixels, whatever the canvas size. */
const LowRes: React.FC<{ res: [number, number] }> = ({ res }) => {
  const { gl } = useThree();
  const [rt, quad, qcam] = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(res[0], res[1], { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
    t.texture.colorSpace = THREE.SRGBColorSpace;
    const q = new THREE.Scene();
    q.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { tex: { value: t.texture }, res: { value: new THREE.Vector2(res[0], res[1]) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      // 4x4 Bayer dither, then 6 levels per channel: a deliberate limited palette, like hand-made pixel art.
      fragmentShader: `uniform sampler2D tex; uniform vec2 res; varying vec2 vUv;
        float bayer(vec2 p){ float x = mod(p.x, 4.0), y = mod(p.y, 4.0);
          vec4 r0 = vec4(0.0, 8.0, 2.0, 10.0), r1 = vec4(12.0, 4.0, 14.0, 6.0), r2 = vec4(3.0, 11.0, 1.0, 9.0), r3 = vec4(15.0, 7.0, 13.0, 5.0);
          vec4 r = y < 1.0 ? r0 : y < 2.0 ? r1 : y < 3.0 ? r2 : r3;
          float v = x < 1.0 ? r.x : x < 2.0 ? r.y : x < 3.0 ? r.z : r.w; return v / 16.0; }
        void main(){ vec2 px = floor(vUv * res); vec4 c = texture2D(tex, (px + 0.5) / res);
          vec3 col = pow(c.rgb, vec3(1.0 / 2.2));
          float L = 9.0; float d = (bayer(px) - 0.5) * 0.55 / L;
          col = floor((col + d) * L + 0.5) / L;
          gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0); }`,
    })));

    return [t, q, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)];
  }, [res[0], res[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ scene, camera }) => {
    gl.setRenderTarget(rt); gl.clear(); gl.render(scene, camera);
    gl.setRenderTarget(null); gl.render(quad, qcam);
  }, 1);
  return null;
};

export const Glitch: React.FC<{ amt: number; seed: number }> = ({ amt, seed }) => {
  // amt 0..1: channel offset + row displacement
  const off = Math.round(amt * 3);
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="glitch" x="-5%" y="0" width="110%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={`0.0001 ${0.02 + (seed % 5) * 0.012}`} numOctaves="1" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={amt * 60} xChannelSelector="R" yChannelSelector="A" result="d" />
        <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={off} dy="0" result="r2" />
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
        <feOffset in="gb" dx={-off} dy="0" result="gb2" />
        <feBlend in="r2" in2="gb2" mode="screen" />
      </filter>
    </svg>
  );
};

/** A 3D shot in the pixel look. `glitch` 0..1 turns the glitch beat on for this frame. */
export const PixelShot: React.FC<{ children: React.ReactNode; glitch?: number; bg?: string; res?: [number, number] }> = ({ children, glitch = 0, bg = '#151216', res = [LW, LH] }) => {
  const f = useCurrentFrame();
  const g = glitch > 0.01;
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      {g && <Glitch amt={glitch} seed={f % 17} />}
      <div style={{ width: LW * SCALE, height: LH * SCALE, filter: g ? 'url(#glitch)' : undefined }}>
        <ThreeCanvas width={LW * SCALE} height={LH * SCALE} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} linear={false} flat>
          <LowRes res={res} />
          {children}
        </ThreeCanvas>
      </div>
      {/* grain at the pixel size, moves every frame */}
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grain.png')})`, backgroundSize: `${LW * SCALE}px ${LH * SCALE}px`, imageRendering: 'pixelated',
        backgroundPosition: `${(Math.floor(f / 2) * 37) % 64 * SCALE}px ${(Math.floor(f / 2) * 53) % 64 * SCALE}px`, mixBlendMode: 'overlay', opacity: 0.12 }} />
    </AbsoluteFill>
  );
};

/** Subtitles in a chunky pixel font with a hard ink outline, like the reference. */
export const Sub: React.FC<{ text: string; y?: number; size?: number; color?: string }> = ({ text, y = 1450, size = 84, color = '#fff' }) => (
  <div data-kind="sub" style={{ position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', fontFamily: 'Pixelify', fontWeight: 700, fontSize: size, fontVariantLigatures: 'none', fontFeatureSettings: '"liga" 0, "clig" 0',
    color, lineHeight: 1.05,
    textShadow: [[-6, 0], [6, 0], [0, -6], [0, 6], [-6, -6], [6, 6], [-6, 6], [6, -6], [0, 10]].map(([x, y2]) => `${x}px ${y2}px 0 #151216`).join(',') }}>
    {text.split(/([()*])/).map((part, i) => /^[()*]$/.test(part) ? <span key={i} style={{ fontFamily: 'DejaVu Sans Mono, monospace', fontWeight: 700 }}>{part}</span> : <React.Fragment key={i}>{part}</React.Fragment>)}
  </div>
);

export const Fonts: React.FC = () => (
  <style>{`@font-face { font-family: 'Pixelify'; src: url(${staticFile('PixelifyR.ttf')}) format('truetype'); font-weight: 400 599; } @font-face { font-family: 'Pixelify'; src: url(${staticFile('PixelifyB.ttf')}) format('truetype'); font-weight: 600 900; }`}</style>
);
