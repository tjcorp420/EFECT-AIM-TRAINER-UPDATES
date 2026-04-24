import { useEffect, useMemo } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const BACKGROUNDS: Record<string, string> = {
  cyber: '/backgrounds/efect_arena.png',
  minimal: '/backgrounds/training_chamber.png',
  galaxy: '/backgrounds/cosmic_space.png',
  synthwave: '/backgrounds/cyber_rooftop.png',
  zenith: '/backgrounds/luxury_lounge.png',

  // optional fallbacks for your other mapTheme names
  inferno: '/backgrounds/efect_arena.png',
  tundra: '/backgrounds/training_chamber.png',
  factory: '/backgrounds/training_chamber.png',
  temple: '/backgrounds/luxury_lounge.png',
  mirage: '/backgrounds/cyber_rooftop.png',
};

export default function RoomBackdrop() {
  const { scene } = useThree();
  const mapTheme = useStore((s) => s.mapTheme);
  const graphicsQuality = useStore((s) => s.graphicsQuality);

  const bgPath = BACKGROUNDS[mapTheme] || BACKGROUNDS.cyber;

  const texture = useLoader(THREE.TextureLoader, bgPath);

  const exposure = useMemo(() => {
    if (mapTheme === 'galaxy') return 0.82;
    if (mapTheme === 'synthwave') return 0.78;
    if (mapTheme === 'zenith') return 0.72;
    if (mapTheme === 'minimal') return 0.68;
    return 0.7;
  }, [mapTheme]);

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = graphicsQuality === 'high' ? 16 : 4;
    texture.needsUpdate = true;

    scene.background = texture;

    // Use the 360 image for subtle reflections only.
    // Actual gameplay lighting stays controlled by your Room lights.
    scene.environment = texture;

    return () => {
      scene.background = null;
      scene.environment = null;
    };
  }, [scene, texture, graphicsQuality]);

  return (
    <>
      {/* This dark transparent sphere keeps the 360 image from being too bright. */}
      <mesh scale={[-120, 120, 120]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={1 - exposure}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}