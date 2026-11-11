// Toon look: 3-band cel shading, an ink outline on every solid (inverted hull), rounded boxes so outlines never split.
import * as THREE from 'three';
import React, { useMemo } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const INK = '#151216';

const grad = (() => {
  const d = new Uint8Array([170, 170, 170, 255, 218, 218, 218, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
})();

const mats = new Map<string, THREE.Material>();
export const toon = (color: string, emissive?: string, ei = 0) => {
  const k = `${color}|${emissive}|${ei}`;
  if (!mats.has(k)) mats.set(k, new THREE.MeshToonMaterial({ color, gradientMap: grad, emissive: emissive ?? '#000', emissiveIntensity: ei }));
  return mats.get(k)!;
};
export const flat = (color: string) => {
  const k = `flat|${color}`;
  if (!mats.has(k)) mats.set(k, new THREE.MeshBasicMaterial({ color }));
  return mats.get(k)!;
};

const hullMats = new Map<number, THREE.ShaderMaterial>();
export const hull = (w: number) => {
  if (!hullMats.has(w)) hullMats.set(w, new THREE.ShaderMaterial({
    uniforms: { w: { value: w }, c: { value: new THREE.Color(INK) } },
    vertexShader: `uniform float w; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
      vec3 n = normalize(normalMatrix * normal); mv.xyz += n * w * (-mv.z) * 0.6; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 c; void main(){ gl_FragColor = vec4(c,1.0); }`,
    side: THREE.BackSide,
  }));
  return hullMats.get(w)!;
};

type P = JSX.IntrinsicElements['group'] & { geo: THREE.BufferGeometry; mat: THREE.Material; line?: number };
/** A solid with an ink outline. line = outline thickness (screen-relative); 0 = none. */
export const Solid: React.FC<P> = ({ geo, mat, line = 0.012, children, ...g }) => (
  <group {...g}>
    <mesh geometry={geo} material={mat} />
    {line > 0 && <mesh geometry={geo} material={hull(line)} />}
    {children}
  </group>
);

const geos = new Map<string, THREE.BufferGeometry>();
const memo = (k: string, f: () => THREE.BufferGeometry) => { if (!geos.has(k)) geos.set(k, f()); return geos.get(k)!; };
export const rbox = (w: number, h: number, d: number, r = 0.02) =>
  memo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 5, Math.min(r, w / 2.01, h / 2.01, d / 2.01)));
export const sph = (r: number, ws = 36, hs = 24, t0 = 0, tl = Math.PI) =>
  memo(`s${r},${ws},${hs},${t0},${tl}`, () => new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, t0, tl));
export const cap = (r: number, len: number) => memo(`c${r},${len}`, () => new THREE.CapsuleGeometry(r, len, 10, 24));
export const cyl = (rt: number, rb: number, h: number, s = 32) => memo(`y${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
export const disc = (r: number) => memo(`d${r}`, () => new THREE.CircleGeometry(r, 40));
export const plane = (w: number, h: number) => memo(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h));

export const useCanvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, deps: unknown[] = []) =>
  useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d')!);
    const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
export const cone = (r: number, h: number) => memo(`k${r},${h}`, () => new THREE.ConeGeometry(r, h, 10, 1));
/** Toon material that takes its colour from vertex colours (sculpted hair with a fade). */
export const toonVC = () => {
  const k = 'vc';
  if (!mats.has(k)) mats.set(k, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad }));
  return mats.get(k)!;
};
