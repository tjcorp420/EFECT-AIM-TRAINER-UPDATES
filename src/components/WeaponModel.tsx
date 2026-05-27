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

function upgradeMaterial(material: THREE.Material, softenHighlights = false): THREE.Material {
  const cloned = material.clone();

  if (cloned instanceof THREE.MeshStandardMaterial) {
    cloned.metalness = softenHighlights
      ? Math.min(Math.max(cloned.metalness, 0.2), 0.62)
      : Math.max(cloned.metalness, 0.35);
    cloned.roughness = softenHighlights
      ? Math.min(Math.max(cloned.roughness, 0.48), 0.84)
      : Math.min(Math.max(cloned.roughness, 0.22), 0.72);
    cloned.envMapIntensity = softenHighlights
      ? Math.min(cloned.envMapIntensity || 0.32, 0.32)
      : Math.max(cloned.envMapIntensity, 0.65);
  }

  if (cloned instanceof THREE.MeshPhysicalMaterial) {
    cloned.metalness = softenHighlights
      ? Math.min(Math.max(cloned.metalness, 0.2), 0.62)
      : Math.max(cloned.metalness, 0.35);
    cloned.roughness = softenHighlights
      ? Math.min(Math.max(cloned.roughness, 0.48), 0.84)
      : Math.min(Math.max(cloned.roughness, 0.22), 0.72);
    cloned.envMapIntensity = softenHighlights
      ? Math.min(cloned.envMapIntensity || 0.32, 0.32)
      : Math.max(cloned.envMapIntensity, 0.65);
  }

  if (softenHighlights) {
    const materialLike = cloned as any;

    if (materialLike.emissive instanceof THREE.Color) {
      materialLike.emissive.multiplyScalar(0.08);
    }

    if (typeof materialLike.emissiveIntensity === 'number') {
      materialLike.emissiveIntensity = Math.min(materialLike.emissiveIntensity, 0.08);
    }

    if (materialLike.color instanceof THREE.Color) {
      materialLike.color.lerp(new THREE.Color('#1b2528'), 0.34);
      materialLike.color.multiplyScalar(0.72);
    }

    if (materialLike.specular instanceof THREE.Color) {
      materialLike.specular.set('#1d2a2f');
    }

    if (typeof materialLike.shininess === 'number') {
      materialLike.shininess = Math.min(materialLike.shininess, 18);
    }

    materialLike.toneMapped = true;
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
  softenHighlights = false,
}: Omit<WeaponModelProps, 'modelPath'> & {
  source: THREE.Object3D;
  softenHighlights?: boolean;
}) {
  const processed = useMemo(() => {
    const clonedScene = source.clone(true);

    clonedScene.traverse((child) => {
      if (softenHighlights && (child as any).isLight) {
        child.visible = false;
        return;
      }

      const mesh = child as THREE.Mesh;

      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => upgradeMaterial(mat, softenHighlights));
      } else if (mesh.material) {
        mesh.material = upgradeMaterial(mesh.material, softenHighlights);
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
  }, [source, targetLength, modelScale, color, softenHighlights]);

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

  return <PreparedWeaponModel {...props} source={fbx} softenHighlights />;
}

export default function WeaponModel(props: WeaponModelProps) {
  const isFbx = props.modelPath.toLowerCase().endsWith('.fbx');

  return isFbx ? <FBXWeaponModel {...props} /> : <GLTFWeaponModel {...props} />;
}

useGLTF.preload('/models/weapons/pistol.glb');
useGLTF.preload('/models/weapons/smg.glb');
useGLTF.preload('/models/weapons/sniper.glb');
useGLTF.preload('/models/weapons/nerf.glb');
