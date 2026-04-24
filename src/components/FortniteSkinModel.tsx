/*
Auto-generated base by gltfjsx.
Fixed for Vite/Tauri asset loading + TypeScript JSX namespace errors.
*/

import * as THREE from 'three';
import React from 'react';
import { ThreeElements, useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { GLTF, SkeletonUtils } from 'three-stdlib';

import modelUrl from './fortnite_skin-transformed.glb?url';

type GLTFResult = GLTF & {
  nodes: {
    Object_191: THREE.SkinnedMesh;
    Object_199: THREE.SkinnedMesh;
    Object_193: THREE.SkinnedMesh;
    Object_195: THREE.SkinnedMesh;
    Object_197: THREE.SkinnedMesh;
    Object_201: THREE.SkinnedMesh;
    Object_203: THREE.SkinnedMesh;
    _rootJoint: THREE.Bone;
  };
  materials: {
    ['27_EyesREF02_1_16_16.001']: THREE.MeshStandardMaterial;
    ['27_EyesREF01_1_16_16.001']: THREE.MeshStandardMaterial;
    ['24_Hood_1_16_16']: THREE.MeshStandardMaterial;
    ['24_Head_1_16_16.001']: THREE.MeshStandardMaterial;
    ['24_Body_1_16_16']: THREE.MeshStandardMaterial;
    ['24_Mask.Mask_1_16_16.001']: THREE.MeshStandardMaterial;
  };
};

type FortniteSkinModelProps = ThreeElements['group'] & {
  glowColor?: string;
};

export default function FortniteSkinModel({
  glowColor = '#39ff14',
  ...props
}: FortniteSkinModelProps) {
  const { scene } = useGLTF(modelUrl) as GLTF;

  const clone = React.useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Object3D;

    cloned.traverse((obj: any) => {
      if (!obj.isMesh) return;

      obj.visible = true;
      obj.frustumCulled = false;
      obj.castShadow = true;
      obj.receiveShadow = true;

      if (obj.material) {
        const fixMat = (mat: any) => {
          const fixed = mat.clone();

          fixed.transparent = false;
          fixed.opacity = 1;
          fixed.depthWrite = true;
          fixed.depthTest = true;
          fixed.side = THREE.DoubleSide;
          fixed.alphaTest = 0;

          if ('roughness' in fixed) fixed.roughness = 0.42;
          if ('metalness' in fixed) fixed.metalness = 0.12;

          if ('color' in fixed) {
            fixed.color = new THREE.Color('#ffffff');
          }

          if ('emissive' in fixed) {
  fixed.emissive = new THREE.Color('#000000');
  fixed.emissiveIntensity = 0;
}

          fixed.needsUpdate = true;
          return fixed;
        };

        obj.material = Array.isArray(obj.material)
          ? obj.material.map(fixMat)
          : fixMat(obj.material);
      }
    });

    return cloned;
  }, [scene, glowColor]);

  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <primitive object={nodes._rootJoint} />

      <skinnedMesh
        geometry={nodes.Object_191.geometry}
        material={materials['27_EyesREF02_1_16_16.001']}
        skeleton={nodes.Object_191.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_199.geometry}
        material={materials['27_EyesREF02_1_16_16.001']}
        skeleton={nodes.Object_199.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_193.geometry}
        material={materials['27_EyesREF01_1_16_16.001']}
        skeleton={nodes.Object_193.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_195.geometry}
        material={materials['24_Hood_1_16_16']}
        skeleton={nodes.Object_195.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_197.geometry}
        material={materials['24_Head_1_16_16.001']}
        skeleton={nodes.Object_197.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_201.geometry}
        material={materials['24_Body_1_16_16']}
        skeleton={nodes.Object_201.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />

      <skinnedMesh
        geometry={nodes.Object_203.geometry}
        material={materials['24_Mask.Mask_1_16_16.001']}
        skeleton={nodes.Object_203.skeleton}
        position={[-4.438, 0, -6.163]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={83.661}
      />
    </group>
  );
}

useGLTF.preload(modelUrl);