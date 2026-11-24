// A real modeled character (VRM: the open format VRoid Studio exports), driven frame by frame.
// The model brings its own head, hair (with spring-bone physics), MToon toon shading, 18 expressions and mouth shapes.
// Spring bones are simulated from frame 0 up to the current frame every time, so any frame renders the same on its own.
import React, { useEffect, useState } from 'react';
import { delayRender, continueRender, staticFile, useCurrentFrame } from 'remotion';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';

const cache = new Map<string, Promise<VRM>>();
const load = (file: string) => {
  if (!cache.has(file)) {
    const loader = new GLTFLoader(); loader.register((p) => new VRMLoaderPlugin(p));
    cache.set(file, loader.loadAsync(staticFile(file)).then((g) => {
      const vrm = g.userData.vrm as VRM;
      VRMUtils.rotateVRM0(vrm);
      vrm.scene.traverse((o) => { o.frustumCulled = false; });
      return vrm;
    }));
  }
  return cache.get(file)!;
};

export type Bones = Partial<Record<string, [number, number, number]>>;
export type VrmPose = {
  pos?: [number, number, number]; yaw?: number;
  bones?: Bones;                                    // normalized humanoid bone eulers (radians)
  face?: Partial<Record<string, number>>;           // expression weights: happy, angry, sad, relaxed, surprised, blink, aa, ih, ou, ee, oh...
  lookAt?: [number, number, number] | null;         // world point the eyes look at
};

const ARMS_DOWN: Bones = { leftUpperArm: [0, 0, -1.25], rightUpperArm: [0, 0, 1.25], leftLowerArm: [0, 0, -0.1], rightLowerArm: [0, 0, 0.1] };

export const VrmActor: React.FC<{ file: string; pose: (t: number) => VrmPose }> = ({ file, pose }) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [h] = useState(() => delayRender(`vrm ${file}`));
  const frame = useCurrentFrame();
  const [target] = useState(() => new THREE.Object3D());
  const { advance } = useThree();
  useEffect(() => { load(file).then((v) => setVrm(v)); }, [file]);
  // once the model is in the scene, draw the frame again, then let Remotion take the picture
  useEffect(() => { if (vrm) { advance(performance.now()); requestAnimationFrame(() => continueRender(h)); } }, [vrm, advance, h]);
  if (vrm) {
    const apply = (t: number) => {
      const p = pose(t);
      vrm.scene.position.set(...(p.pos ?? [0, 0, 0])); vrm.scene.rotation.set(0, p.yaw ?? 0, 0);
      vrm.humanoid.resetNormalizedPose();
      const bones = { ...ARMS_DOWN, ...(p.bones ?? {}) };
      for (const [name, r] of Object.entries(bones)) {
        const n = vrm.humanoid.getNormalizedBoneNode(name as never); if (n && r) n.rotation.set(r[0], r[1], r[2]);
      }
      const em = vrm.expressionManager;
      if (em) { for (const k of Object.keys(em.expressionMap)) em.setValue(k, 0); for (const [k, v] of Object.entries(p.face ?? {})) em.setValue(k, v ?? 0); }
      if (vrm.lookAt) {
        if (p.lookAt) { target.position.set(...p.lookAt); target.updateMatrixWorld(); vrm.lookAt.target = target; vrm.lookAt.autoUpdate = true; }
        else { vrm.lookAt.target = undefined; }
      }
      vrm.scene.updateMatrixWorld(true);
    };
    // replay the hair physics from the start of the shot, on twos (12 fps), so every frame is reproducible
    vrm.springBoneManager?.reset();
    const steps = Math.floor(frame / 2);
    for (let i = 0; i <= steps; i++) { apply(i / 12); vrm.update(1 / 12); }
  }
  return vrm ? <primitive object={vrm.scene} /> : null;
};
