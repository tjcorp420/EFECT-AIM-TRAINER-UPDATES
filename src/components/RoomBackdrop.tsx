import { useEffect, useMemo } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

type BackdropSettings = {
  path: string;
  exposure: number;
  overlayOpacity: number;
  environmentIntensity: number;
  blur: number;
};

const BACKGROUNDS: Record<string, BackdropSettings> = {
  cosmic_space: {
    path: '/backgrounds/cosmic_space.png',
    exposure: 1.08,
    overlayOpacity: 0.12,
    environmentIntensity: 0.86,
    blur: 0.02,
  },
  skydeck_cloud_lab: {
    path: '/backgrounds/skydeck_cloud_lab.png',
    exposure: 0.82,
    overlayOpacity: 0.24,
    environmentIntensity: 0.68,
    blur: 0.03,
  },
  industrial_warehouse: {
    path: '/backgrounds/industrial_warehouse.png',
    exposure: 0.92,
    overlayOpacity: 0.2,
    environmentIntensity: 0.72,
    blur: 0.02,
  },
  jungle_temple_ruins: {
    path: '/backgrounds/jungle_temple_ruins.png',
    exposure: 0.95,
    overlayOpacity: 0.18,
    environmentIntensity: 0.78,
    blur: 0.02,
  },
  neon_rooftop_city: {
    path: '/backgrounds/neon_rooftop_city.png',
    exposure: 0.9,
    overlayOpacity: 0.2,
    environmentIntensity: 0.74,
    blur: 0.02,
  },
  tech_training_arena: {
    path: '/backgrounds/tech_training_arena.png',
    exposure: 0.9,
    overlayOpacity: 0.18,
    environmentIntensity: 0.78,
    blur: 0.018,
  },
  training_chamber: {
    path: '/backgrounds/training_chamber.png',
    exposure: 0.98,
    overlayOpacity: 0.16,
    environmentIntensity: 0.8,
    blur: 0.02,
  },
  efect_arena: {
    path: '/backgrounds/efect_arena.png',
    exposure: 0.94,
    overlayOpacity: 0.18,
    environmentIntensity: 0.78,
    blur: 0.02,
  },
  luxury_lounge: {
    path: '/backgrounds/luxury_lounge.png',
    exposure: 0.84,
    overlayOpacity: 0.26,
    environmentIntensity: 0.66,
    blur: 0.025,
  },
  cyber_rooftop: {
    path: '/backgrounds/cyber_rooftop.png',
    exposure: 0.9,
    overlayOpacity: 0.22,
    environmentIntensity: 0.72,
    blur: 0.02,
  },
};

const FALLBACK_THEME = 'luxury_lounge';

export default function RoomBackdrop() {
  const { scene, gl } = useThree();

  const mapTheme = useStore((s) => s.mapTheme);
  const graphicsQuality = useStore((s) => s.graphicsQuality);

  const settings = useMemo(() => {
    return BACKGROUNDS[mapTheme] || BACKGROUNDS[FALLBACK_THEME];
  }, [mapTheme]);

  const texture = useLoader(THREE.TextureLoader, settings.path);

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = graphicsQuality === 'high' ? 16 : 6;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    scene.background = texture;
    scene.environment = texture;

    if ('backgroundBlurriness' in scene) {
      scene.backgroundBlurriness = settings.blur;
    }

    if ('environmentIntensity' in scene) {
      scene.environmentIntensity = settings.environmentIntensity;
    }

    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure =
      graphicsQuality === 'high' ? settings.exposure : settings.exposure * 0.92;

    return () => {
      scene.background = null;
      scene.environment = null;

      if ('backgroundBlurriness' in scene) {
        scene.backgroundBlurriness = 0;
      }

      if ('environmentIntensity' in scene) {
        scene.environmentIntensity = 1;
      }
    };
  }, [scene, gl, texture, settings, graphicsQuality]);

  return (
    <>
      <mesh scale={[-120, 120, 120]} renderOrder={-999}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={settings.overlayOpacity}
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}