// A shot: camera + room + soft bodies (characters, pillows, plants) + hand props + lamps, drawn by the shader
// at the show's native pixel size.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree, useFrame } from '@react-three/fiber';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import SIGNS from './signs.json';
import * as THREE from 'three';
import { V, sub, norm, cross } from './vec';
import { faceArr } from './face';
import { VERT, SCENE_FRAG, COMP_FRAG, NP, NC, NHD, NHB, NB, NO, NL, FS, NSH } from './shader';

export * from './types';
import { Scene3, PW, PH } from './types';
const rgb = (h: string): V => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

const Pass: React.FC<{ scene: Scene3; w: number; h: number }> = ({ scene, w, h }) => {
  const { gl, invalidate, advance } = useThree();
  const R = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(w, h, { count: 2, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });
    const f = (n: number) => ({ value: new Float32Array(n) });
    const u: Record<string, { value: any }> = {
      uRes: { value: new THREE.Vector2(w, h) }, uCamP: { value: new THREE.Vector3() }, uCamR: { value: new THREE.Vector3() }, uCamU: { value: new THREE.Vector3() }, uCamF: { value: new THREE.Vector3() }, uTan: { value: 0.3 }, uTime: { value: 0 },
      uA: f(NP * 4), uB: f(NP * 4), uM: f(NP * 4), uC: f(NP * 4),
      uCl: f(NC * 4), uCr: f(NC * 4), uCo: f(NC * 3), uNC: { value: 0 },
      uHc: f(NHD * 3), uHr: f(NHD * 3), uHu: f(NHD * 3), uHf: f(NHD * 3), uHk: f(NHD * 4), uSkin: f(NHD * 3), uHairA: f(NHD * 3), uHairB: f(NHD * 3), uHb: f(NHD * NHB * 4), uHn: { value: new Int32Array(NHD) }, uFace: f(NHD * 9 * 4),
      uBc: f(NB * 3), uBh: f(NB * 3), uBcol: f(NB * 4), uBm: f(NB * 4), uNB: { value: 0 },
      uOc: f(NO * 3), uOx: f(NO * 3), uOy: f(NO * 3), uOz: f(NO * 3), uOh: f(NO * 3), uOcol: f(NO * 3), uOem: f(NO * 3), uNO: { value: 0 },
      uL: f(NL * 4), uLc: f(NL * 4), uNL: { value: 0 }, uSh: f(NSH * 4),
      uScr: { value: null }, uScrOn: { value: new THREE.Vector3(-1, 360, 0) },
      uSet: { value: 0 }, uRoom: { value: new THREE.Vector3() }, uRoom0: { value: new THREE.Vector3() },
      uClub: { value: new THREE.Vector4() }, uClubF: { value: new THREE.Vector4() }, uBo: f(16), uBd: f(16), uBk: f(16), uNBm: { value: 0 },
      uCw0: { value: new THREE.Vector4() }, uCw1: { value: new THREE.Vector4() }, uCw2: { value: new THREE.Vector4() }, uCw3: { value: new THREE.Vector4() }, uCw4: { value: new THREE.Vector4() }, uHole: f(24), uAmb: { value: new THREE.Vector3() }, uAmbC: { value: new THREE.Vector3() },
      uCampus: { value: new THREE.Vector4() }, uSign: { value: null }, uSignSz: { value: new THREE.Vector2(1, 1) }, uBs: f(NB * 4),
    };
    const geo = new THREE.PlaneGeometry(2, 2);
    const sm = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: SCENE_FRAG, uniforms: u, depthTest: false, depthWrite: false });
    const cm = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: COMP_FRAG, depthTest: false, depthWrite: false,
      uniforms: { tCol: { value: rt.textures[0] }, tAux: { value: rt.textures[1] }, uRes: { value: new THREE.Vector2(w, h) }, uPxw: { value: 0.003 } } });
    const s1 = new THREE.Scene(); s1.add(new THREE.Mesh(geo, sm));
    const s2 = new THREE.Scene(); s2.add(new THREE.Mesh(geo, cm));
    return { rt, u, cm, s1, s2, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [w, h]);

  // The picture on a phone screen (scene.screenTex, a file under public/). The frame waits for it: while Remotion
  // renders, the canvas only draws when told to, so the frame is drawn again once the picture is in place.
  const [scr, setScr] = useState<THREE.Texture | null>(null);
  const hold = useRef<number | null>(null);
  useEffect(() => {
    if (!scene.screenTex) { setScr(null); return; }
    hold.current = delayRender('phone screen');
    new THREE.TextureLoader().load(scene.screenTex, (t) => {
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
      setScr(t);
    }, undefined, () => { throw new Error('phone screen not found: ' + scene.screenTex); });
  }, [scene.screenTex]);
  useEffect(() => {
    if (!scr || hold.current === null) return;
    advance(performance.now()); continueRender(hold.current); hold.current = null;
  }, [scr, advance]);
  // the sign atlas (tools/signs.py), when anything in the shot shows a sign. The frame waits for it the same way.
  const wantSigns = scene.boxes.some((b) => b.sign);
  const [sig, setSig] = useState<THREE.Texture | null>(null);
  const sigHold = useRef<number | null>(null);
  useEffect(() => {
    if (!wantSigns || sig) return;
    sigHold.current = delayRender('sign atlas');
    new THREE.TextureLoader().load(staticFile('signs/atlas.png'), (t) => {
      t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
      setSig(t);
    }, undefined, () => { throw new Error('sign atlas not found: run tools/signs.py'); });
  }, [wantSigns, sig]);
  useEffect(() => {
    if (!sig || sigHold.current === null) return;
    advance(performance.now()); continueRender(sigHold.current); sigHold.current = null;
  }, [sig, advance]);

  // uniforms are set during render so the very first frame is already right
  const u = R.u, sc = scene;
  const F = norm(sub(sc.cam.at, sc.cam.pos)), Rt = norm(cross(F, sc.cam.up ?? [0, 1, 0])), Up = cross(Rt, F);
  u.uCamP.value.set(...sc.cam.pos); u.uCamF.value.set(...F); u.uCamR.value.set(...Rt); u.uCamU.value.set(...Up);
  u.uTan.value = Math.tan((sc.cam.fov * Math.PI) / 360); u.uTime.value = sc.time ?? 0; u.uSet.value = sc.studio ? 1 : sc.set ?? 0;
  R.cm.uniforms.uPxw.value = (2 * u.uTan.value) / h;

  u.uFace.value.fill(0); u.uHn.value.fill(0);
  let pi = 0, hi = 0;
  const softs = sc.softs.slice(0, NC);
  softs.forEach((s, ci) => {
    const i0 = pi; const mn: V = [1e9, 1e9, 1e9], mx: V = [-1e9, -1e9, -1e9];
    const grow = (p: V, r: number) => { for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[k] - r); mx[k] = Math.max(mx[k], p[k] + r); } };
    s.prims.forEach((p) => {
      if (pi >= NP) return;
      u.uA.value.set([...p.a, p.ra], pi * 4); u.uB.value.set([...p.b, p.rb], pi * 4);
      u.uM.value.set([Math.min(p.g, 7), p.k, (p.cutA ? 1 : 0) + (p.cutB ? 2 : 0), p.sq ?? 1], pi * 4);
      u.uC.value.set([...rgb(p.c), (p.tex ?? 0) + Math.min(p.em ?? 0, 1) * 0.99], pi * 4);
      grow(p.a, p.ra); grow(p.b, p.rb); pi++;
    });
    let hIdx = -1;
    if (s.head && hi < NHD) {
      const hd = s.head; hIdx = hi; grow(hd.c, 0.48);
      u.uHc.value.set(hd.c, hi * 3); u.uHr.value.set(hd.rt, hi * 3); u.uHu.value.set(hd.up, hi * 3); u.uHf.value.set(hd.fw, hi * 3);
      u.uSkin.value.set(rgb(hd.skin), hi * 3); u.uHairA.value.set(rgb(hd.hairA), hi * 3); u.uHairB.value.set(rgb(hd.hairB), hi * 3);
      const nb = Math.min(hd.blobs.length, NHB / 2);
      for (let k = 0; k < nb; k++) u.uHb.value.set(hd.blobs[k], (hi * NHB + k * 2) * 4);
      u.uHn.value[hi] = nb; u.uFace.value.set(faceArr(hd.face), hi * FS); u.uHk.value.set((hd.build ?? [0, 1, 1, 0]).slice(0, 4), hi * 4);
      u.uFace.value[hi * FS + 34] = hd.build?.[4] ?? 1; // the eye size rides in a spare slot of the face
      hi++;
    }
    u.uCl.value.set([(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2, Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2 + 0.02], ci * 4);
    u.uCr.value.set([i0, pi, hIdx, s.character ? 1 : 0], ci * 4); u.uCo.value.set(s.origin, ci * 3);
  });
  u.uNC.value = softs.length;

  const nb = Math.min(sc.boxes.length, NB);
  for (let i = 0; i < nb; i++) { const b = sc.boxes[i];
    u.uBc.value.set(b.c, i * 3); u.uBh.value.set(b.h, i * 3); u.uBcol.value.set([...rgb(b.col), b.mat ?? 0], i * 4);
    u.uBm.value.set([((b.yaw ?? 0) * Math.PI) / 180, b.obj, b.glow ? 1 : 0, b.noShadow || b.glow ? 1 : 0], i * 4);
    const rc = b.sign ? (SIGNS.rects as Record<string, number[]>)[b.sign] : undefined; if (b.sign && !rc) throw new Error('no sign ' + b.sign + ' in the atlas (tools/signs.py)');
    u.uBs.value.set(rc ?? b.clock ?? [0, 0, 0], i * 4); }
  u.uSign.value = sig; u.uSignSz.value.set(SIGNS.size[0], SIGNS.size[1]); u.uCampus.value.set(...(sc.campus ?? [0, 0, 0, 0]));
  u.uNB.value = nb;
  const pr = (sc.props ?? []).slice(0, NO);
  pr.forEach((o, i) => { u.uOc.value.set(o.c, i * 3); u.uOx.value.set(o.x, i * 3); u.uOy.value.set(o.y, i * 3); u.uOz.value.set(o.z, i * 3); u.uOh.value.set(o.h, i * 3);
    u.uOcol.value.set(rgb(o.col), i * 3); u.uOem.value.set(rgb(o.screen ?? o.col), i * 3); });
  u.uNO.value = pr.length;
  u.uScr.value = scr; u.uScrOn.value.set(scr ? pr.findIndex((o) => o.screen) : -1, scr ? (scr.image as any).width : 360, 0);
  const ls = sc.lights.slice(0, NL);
  ls.forEach((l, i) => { u.uL.value.set([...l.p, l.r], i * 4); u.uLc.value.set([...l.col, l.halo ?? 0], i * 4); });
  u.uNL.value = ls.length;
  u.uSh.value.fill(0); (sc.shadows ?? []).slice(0, NSH).forEach((s, i) => u.uSh.value.set(s, i * 4));
  u.uRoom.value.set(...sc.room); u.uRoom0.value.set(...(sc.room0 ?? [0, 0, 0]));
  const cl = sc.club; u.uClub.value.set(cl?.mood ?? 0, cl?.bps ?? 2, cl?.led[0] ?? 0, cl?.led[1] ?? 0); u.uClubF.value.set(...(cl?.floor ?? [0, 0, 0, 0]));
  const bm = (sc.beams ?? []).slice(0, 4); u.uBo.value.fill(0); u.uBd.value.fill(0); u.uBk.value.fill(0);
  bm.forEach((b, i) => { const d = norm(b.d); u.uBo.value.set([...b.o, b.spread], i * 4); u.uBd.value.set([...d, b.k], i * 4); u.uBk.value.set([...b.col, 0], i * 4); });
  u.uNBm.value = bm.length;
  const cw = sc.crowd; u.uHole.value.fill(0);
  if (cw) {
    u.uCw0.value.set(cw.x0, cw.z0, cw.cw, cw.cd); u.uCw1.value.set(cw.nx, cw.nz, cw.seed, cw.fill); u.uCw2.value.set(cw.dance, cw.crouch, cw.armsUp, cw.headsUp);
    u.uCw3.value.set(...cw.clear, cw.spread); u.uCw4.value.set(...cw.face, cw.ring, cw.faces); cw.holes.slice(0, 6).forEach((h, i) => u.uHole.value.set([...h, 0], i * 4));
  } else u.uCw1.value.set(0, 0, 0, 0); u.uAmb.value.set(...sc.amb); u.uAmbC.value.set(...sc.ambChar);

  useLayoutEffect(() => { invalidate(); });
  useFrame(() => {
    gl.setRenderTarget(R.rt); gl.render(R.s1, R.cam);
    gl.setRenderTarget(null); gl.render(R.s2, R.cam);
  }, 1);
  return null;
};

export const SdfShot: React.FC<{ scene: Scene3; w?: number; h?: number }> = ({ scene, w = PW, h = PH }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={w} height={h} dpr={1} gl={{ antialias: false, preserveDrawingBuffer: true }} flat linear>
      <Pass scene={scene} w={w} h={h} />
    </ThreeCanvas>
  </AbsoluteFill>
);
