import { useMemo } from 'react';
import { useFBX, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Vec3 = [number, number, number];

type WeaponModelProps = {
  modelPath: string;
  color: string;
  targetLength: number;
  modelPosition?: Vec3;
  modelRotation?: Vec3;
  modelScale?: number;
};

function upgradeMaterial(material: THREE.Material): THREE.Material {
  const cloned = material.clone();

  if (cloned instanceof THREE.MeshStandardMaterial) {
    cloned.metalness = Math.max(cloned.metalness, 0.35);
    cloned.roughness = Math.min(Math.max(cloned.roughness, 0.22), 0.72);
    cloned.envMapIntensity = Math.max(cloned.envMapIntensity, 0.65);
  }

  if (cloned instanceof THREE.MeshPhysicalMaterial) {
    cloned.metalness = Math.max(cloned.metalness, 0.35);
    cloned.roughness = Math.min(Math.max(cloned.roughness, 0.22), 0.72);
    cloned.envMapIntensity = Math.max(cloned.envMapIntensity, 0.65);
  }

  return cloned;
}

function PreparedWeaponModel({
  source,
  color,
  targetLength,
  modelPosition = [0, 0, 0],
  modelRotation = [0, 0, 0],
  modelScale = 1,
}: Omit<WeaponModelProps, 'modelPath'> & { source: THREE.Object3D }) {
  const processed = useMemo(() => {
    const clonedScene = source.clone(true);

    clonedScene.traverse((child) => {
      const mesh = child as THREE.Mesh;

      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => upgradeMaterial(mat));
      } else if (mesh.material) {
        mesh.material = upgradeMaterial(mesh.material);
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    clonedScene.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
    const normalizedScale = targetLength / maxDimension;

    return {
      scene: clonedScene,
      scale: normalizedScale * modelScale,
    };
  }, [source, targetLength, modelScale, color]);

  return (
    <group position={modelPosition} rotation={modelRotation} scale={processed.scale}>
      <primitive object={processed.scene} />
    </group>
  );
}

function GLTFWeaponModel(props: WeaponModelProps) {
  const gltf = useGLTF(props.modelPath);

  return <PreparedWeaponModel {...props} source={gltf.scene} />;
}

function FBXWeaponModel(props: WeaponModelProps) {
  const fbx = useFBX(props.modelPath);

  return <PreparedWeaponModel {...props} source={fbx} />;
}

export default function WeaponModel(props: WeaponModelProps) {
  const isFbx = props.modelPath.toLowerCase().endsWith('.fbx');

  return isFbx ? <FBXWeaponModel {...props} /> : <GLTFWeaponModel {...props} />;
}

useGLTF.preload('/models/weapons/pistol.glb');
useGLTF.preload('/models/weapons/smg.glb');
useGLTF.preload('/models/weapons/sniper.glb');
useGLTF.preload('/models/weapons/nerf.glb');
useFBX.preload('/models/weapons/scifi/scifigun.fbx');
useFBX.preload('/models/weapons/scifi2/scifi_gun_2.fbx');
