// A shot: camera + room + one character + hand props, drawn by the shader at the show's native 270x480.
import React, { useLayoutEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useFrame } from '@react-three/fiber';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { V, sub, norm, cross, mul } from './vec';
import { Prim, Skel } from './rig';
import { Face } from './face';
import { VERT, SCENE_FRAG, COMP_FRAG, NP, NB, NO } from './shader';

export type Cam3 = { pos: V; at: V; fov: number };
// A box in the room. yaw in degrees. `obj` groups boxes into one outlined object.
export type Box = { c: V; h: V; col: string; obj: number; yaw?: number; glow?: boolean; noShadow?: boolean };
// A prop that moves (a phone in a hand): centre, three unit axes, half sizes. The +z face is `screen` if given.
export type Obb = { c: V; x: V; y: V; z: V; h: V; col: string; screen?: string };
export type Scene3 = {
  cam: Cam3; room: V; boxes: Box[]; lamp: V; lampOn?: number;
  body: Prim[]; skel: Skel | null; skin: string; face: Face;
  props?: Obb[]; glow?: { p: V; c: V };
};
const W = 270, H = 480;
const rgb = (h: string): V => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const faceArr = (f: Face) => {
  const e = (x: Face['eyeL']) => [x.open, x.low, x.tilt, x.px, x.py, x.ps, x.wide, x.arc];
  const b = (x: Face['browL']) => [x.y, x.rot, x.bend];
  const m = f.mouth;
  return [...e(f.eyeL), ...e(f.eyeR), ...b(f.browL), ...b(f.browR), m.w, m.curve, m.open, m.teeth, m.tongue, m.skew, m.wobble, f.blush, f.gloom, f.stretch];
};

const Pass: React.FC<{ scene: Scene3 }> = ({ scene }) => {
  const { gl, invalidate } = useThree();
  const R = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(W, H, { count: 2, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });
    const u: Record<string, { value: any }> = {
      uRes: { value: new THREE.Vector2(W, H) }, uCamP: { value: new THREE.Vector3() }, uCamR: { value: new THREE.Vector3() }, uCamU: { value: new THREE.Vector3() }, uCamF: { value: new THREE.Vector3() }, uTan: { value: 0.3 },
      uA: { value: new Float32Array(NP * 4) }, uB: { value: new Float32Array(NP * 4) }, uM: { value: new Float32Array(NP * 4) }, uC: { value: new Float32Array(NP * 3) }, uN: { value: 0 }, uBound: { value: new THREE.Vector4(0, -50, 0, 0.1) },
      uHc: { value: new THREE.Vector3() }, uHr: { value: new THREE.Vector3(1, 0, 0) }, uHu: { value: new THREE.Vector3(0, 1, 0) }, uHf: { value: new THREE.Vector3(0, 0, 1) },
      uFace: { value: new Float32Array(32) }, uSkin: { value: new THREE.Vector3() }, uHasHead: { value: 0 },
      uBc: { value: new Float32Array(NB * 3) }, uBh: { value: new Float32Array(NB * 3) }, uBcol: { value: new Float32Array(NB * 3) }, uBm: { value: new Float32Array(NB * 4) }, uNB: { value: 0 },
      uOc: { value: new Float32Array(NO * 3) }, uOx: { value: new Float32Array(NO * 3) }, uOy: { value: new Float32Array(NO * 3) }, uOz: { value: new Float32Array(NO * 3) }, uOh: { value: new Float32Array(NO * 3) },
      uOcol: { value: new Float32Array(NO * 3) }, uOem: { value: new Float32Array(NO * 3) }, uNO: { value: 0 },
      uRoom: { value: new THREE.Vector3() }, uLamp: { value: new THREE.Vector3() }, uLampOn: { value: 1 }, uFill: { value: new THREE.Vector3(1.6, 2.5, 0.9) }, uGlowP: { value: new THREE.Vector3(0, -9, 0) }, uGlowC: { value: new THREE.Vector3() },
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    const sm = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: SCENE_FRAG, uniforms: u, depthTest: false, depthWrite: false });
    const cm = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: COMP_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tCol: { value: rt.textures[0] }, tAux: { value: rt.textures[1] }, uRes: { value: new THREE.Vector2(W, H) } } });
    const s1 = new THREE.Scene(); s1.add(new THREE.Mesh(geo, sm));
    const s2 = new THREE.Scene(); s2.add(new THREE.Mesh(geo, cm));
    return { rt, u, s1, s2, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, []);

  // uniforms are set during render so the very first frame is already right
  const u = R.u, sc = scene;
  const F = norm(sub(sc.cam.at, sc.cam.pos)), Rt = norm(cross(F, [0, 1, 0])), Up = cross(Rt, F);
  u.uCamP.value.set(...sc.cam.pos); u.uCamF.value.set(...F); u.uCamR.value.set(...Rt); u.uCamU.value.set(...Up);
  u.uTan.value = Math.tan((sc.cam.fov * Math.PI) / 360);
  const n = Math.min(sc.body.length, NP);
  let mn: V = [1e9, 1e9, 1e9], mx: V = [-1e9, -1e9, -1e9];
  const grow = (p: V, r: number) => { for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[k] - r); mx[k] = Math.max(mx[k], p[k] + r); } };
  for (let i = 0; i < n; i++) {
    const p = sc.body[i];
    u.uA.value.set([...p.a, p.ra], i * 4); u.uB.value.set([...p.b, p.rb], i * 4); u.uM.value.set([Math.min(p.g, 4), p.k, p.cutA ? 1 : 0, p.cutB ? 1 : 0], i * 4); u.uC.value.set(rgb(p.c), i * 3);
    grow(p.a, p.ra); grow(p.b, p.rb);
  }
  u.uN.value = n;
  if (sc.skel) {
    const s = sc.skel; grow(s.headC, 0.27);
    u.uHc.value.set(...s.headC); u.uHr.value.set(...s.headRt); u.uHu.value.set(...s.headUp); u.uHf.value.set(...s.headFw); u.uHasHead.value = 1;
  } else u.uHasHead.value = 0;
  if (n > 0 || sc.skel) { const c = mul([mn[0] + mx[0], mn[1] + mx[1], mn[2] + mx[2]], 0.5); u.uBound.value.set(c[0], c[1], c[2], Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2 + 0.02); }
  else u.uBound.value.set(0, -50, 0, 0.1);
  u.uFace.value.set(faceArr(sc.face)); u.uSkin.value.set(...rgb(sc.skin));
  const nb = Math.min(sc.boxes.length, NB);
  for (let i = 0; i < nb; i++) { const b = sc.boxes[i];
    u.uBc.value.set(b.c, i * 3); u.uBh.value.set(b.h, i * 3); u.uBcol.value.set(rgb(b.col), i * 3);
    u.uBm.value.set([((b.yaw ?? 0) * Math.PI) / 180, b.obj, b.glow ? 1 : 0, b.noShadow || b.glow ? 1 : 0], i * 4); }
  u.uNB.value = nb;
  const pr = sc.props ?? [];
  pr.slice(0, NO).forEach((o, i) => { u.uOc.value.set(o.c, i * 3); u.uOx.value.set(o.x, i * 3); u.uOy.value.set(o.y, i * 3); u.uOz.value.set(o.z, i * 3); u.uOh.value.set(o.h, i * 3);
    u.uOcol.value.set(rgb(o.col), i * 3); u.uOem.value.set(rgb(o.screen ?? o.col), i * 3); });
  u.uNO.value = Math.min(pr.length, NO);
  u.uRoom.value.set(...sc.room); u.uLamp.value.set(...sc.lamp); u.uLampOn.value = sc.lampOn ?? 1;
  if (sc.glow) { u.uGlowP.value.set(...sc.glow.p); u.uGlowC.value.set(...sc.glow.c); } else u.uGlowC.value.set(0, 0, 0);

  useLayoutEffect(() => { invalidate(); });
  useFrame(() => {
    gl.setRenderTarget(R.rt); gl.render(R.s1, R.cam);
    gl.setRenderTarget(null); gl.render(R.s2, R.cam);
  }, 1);
  return null;
};

export const SdfShot: React.FC<{ scene: Scene3 }> = ({ scene }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={W} height={H} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} flat linear>
      <Pass scene={scene} />
    </ThreeCanvas>
  </AbsoluteFill>
);
