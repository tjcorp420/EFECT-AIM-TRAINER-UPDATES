import { useEffect, useMemo } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const BACKGROUNDS: Record<string, string> = {
  // New customizer background IDs
  cosmic_space: '/backgrounds/cosmic_space.png',
  skydeck_cloud_lab: '/backgrounds/skydeck_cloud_lab.png',
  industrial_warehouse: '/backgrounds/industrial_warehouse.png',
  jungle_temple_ruins: '/backgrounds/jungle_temple_ruins.png',
  neon_rooftop_city: '/backgrounds/neon_rooftop_city.png',
  tech_training_arena: '/backgrounds/tech_training_arena.png',
  training_chamber: '/backgrounds/training_chamber.png',
  efect_arena: '/backgrounds/efect_arena.png',
  luxury_lounge: '/backgrounds/luxury_lounge.png',
  cyber_rooftop: '/backgrounds/cyber_rooftop.png',

  // Legacy IDs
  cyber: '/backgrounds/efect_arena.png',
  minimal: '/backgrounds/training_chamber.png',
  galaxy: '/backgrounds/cosmic_space.png',
  night: '/backgrounds/training_chamber.png',
  synthwave: '/backgrounds/cyber_rooftop.png',
  zenith: '/backgrounds/luxury_lounge.png',

  // Older/extra fallback names
  inferno: '/backgrounds/efect_arena.png',
  tundra: '/backgrounds/training_chamber.png',
  factory: '/backgrounds/industrial_warehouse.png',
  temple: '/backgrounds/jungle_temple_ruins.png',
  mirage: '/backgrounds/neon_rooftop_city.png',
};

const EXPOSURE_BY_THEME: Record<string, number> = {
  cosmic_space: 0.9,
  skydeck_cloud_lab: 0.78,
  industrial_warehouse: 0.82,
  jungle_temple_ruins: 0.84,
  neon_rooftop_city: 0.82,
  tech_training_arena: 0.86,
  training_chamber: 0.84,
  efect_arena: 0.86,
  luxury_lounge: 0.8,
  cyber_rooftop: 0.8,

  cyber: 0.86,
  minimal: 0.84,
  galaxy: 0.9,
  night: 0.84,
  synthwave: 0.8,
  zenith: 0.8,

  inferno: 0.86,
  tundra: 0.84,
  factory: 0.82,
  temple: 0.84,
  mirage: 0.82,
};

export default function RoomBackdrop() {
  const { scene, gl } = useThree();

  const mapTheme = useStore((s) => s.mapTheme);
  const graphicsQuality = useStore((s) => s.graphicsQuality);

  const bgPath = BACKGROUNDS[mapTheme] || BACKGROUNDS.cyber;

  const texture = useLoader(THREE.TextureLoader, bgPath);

  const exposure = useMemo(() => {
    return EXPOSURE_BY_THEME[mapTheme] ?? 0.84;
  }, [mapTheme]);

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = graphicsQuality === 'high' ? 16 : 4;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    scene.background = texture;
    scene.environment = texture;

    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = graphicsQuality === 'high' ? 1.08 : 0.98;

    return () => {
      scene.background = null;
      scene.environment = null;
    };
  }, [scene, gl, texture, graphicsQuality]);

  return (
    <>
      {/* Subtle darkening dome. Lower opacity = brighter 360 scene. */}
      <mesh scale={[-120, 120, 120]} renderOrder={-999}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={Math.max(0, Math.min(0.55, 1 - exposure))}
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}