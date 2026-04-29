import { useMemo } from 'react';
import { useStore } from '../store/useStore';

type ThemeStyle = {
  floor: string;
  platform: string;
  trim: string;
  accent: string;
  ambient: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  directional: number;
  point: number;
  roughness: number;
  metalness: number;
  floorOpacity: number;
  platformOpacity: number;
  envMapIntensity: number;
};

const ROOM_STYLES: Record<string, ThemeStyle> = {
  cosmic_space: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.32,
    hemiSky: '#10333b',
    hemiGround: '#020406',
    hemi: 0.48,
    directional: 0.62,
    point: 0.72,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.78,
    platformOpacity: 0.88,
    envMapIntensity: 0.22,
  },

  skydeck_cloud_lab: {
    floor: '#394448',
    platform: '#4b565a',
    trim: '#26343a',
    accent: '#8fe8ff',
    ambient: 0.38,
    hemiSky: '#8fb5c3',
    hemiGround: '#1b2023',
    hemi: 0.42,
    directional: 0.46,
    point: 0.28,
    roughness: 0.82,
    metalness: 0.02,
    floorOpacity: 0.78,
    platformOpacity: 0.86,
    envMapIntensity: 0.08,
  },

  industrial_warehouse: {
    floor: '#171513',
    platform: '#24211e',
    trim: '#46321f',
    accent: '#ffaa3c',
    ambient: 0.38,
    hemiSky: '#a37948',
    hemiGround: '#080604',
    hemi: 0.5,
    directional: 0.72,
    point: 0.62,
    roughness: 0.68,
    metalness: 0.18,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.18,
  },

  jungle_temple_ruins: {
    floor: '#081008',
    platform: '#111a10',
    trim: '#1b3218',
    accent: '#34f0bf',
    ambient: 0.38,
    hemiSky: '#5ea070',
    hemiGround: '#050906',
    hemi: 0.56,
    directional: 0.7,
    point: 0.62,
    roughness: 0.86,
    metalness: 0.05,
    floorOpacity: 0.82,
    platformOpacity: 0.88,
    envMapIntensity: 0.12,
  },

  neon_rooftop_city: {
    floor: '#05040a',
    platform: '#100b18',
    trim: '#1c1026',
    accent: '#ff3bd4',
    ambient: 0.34,
    hemiSky: '#5e43bd',
    hemiGround: '#050009',
    hemi: 0.5,
    directional: 0.65,
    point: 0.7,
    roughness: 0.38,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  tech_training_arena: {
    floor: '#050908',
    platform: '#0c1210',
    trim: '#102822',
    accent: '#57ff9f',
    ambient: 0.36,
    hemiSky: '#8fe8ba',
    hemiGround: '#030706',
    hemi: 0.52,
    directional: 0.74,
    point: 0.64,
    roughness: 0.44,
    metalness: 0.38,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  training_chamber: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.34,
    hemiSky: '#4ec4ac',
    hemiGround: '#020504',
    hemi: 0.5,
    directional: 0.68,
    point: 0.6,
    roughness: 0.46,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  efect_arena: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.34,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.52,
    directional: 0.7,
    point: 0.68,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  luxury_lounge: {
    floor: '#060604',
    platform: '#0e0d09',
    trim: '#2c2414',
    accent: '#ffd680',
    ambient: 0.38,
    hemiSky: '#bca777',
    hemiGround: '#050403',
    hemi: 0.5,
    directional: 0.7,
    point: 0.46,
    roughness: 0.36,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  cyber_rooftop: {
    floor: '#05040b',
    platform: '#0d0a18',
    trim: '#1d1230',
    accent: '#b967ff',
    ambient: 0.34,
    hemiSky: '#5e45c2',
    hemiGround: '#040008',
    hemi: 0.5,
    directional: 0.62,
    point: 0.68,
    roughness: 0.38,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  cyber: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.34,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.52,
    directional: 0.7,
    point: 0.68,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  minimal: {
    floor: '#394448',
    platform: '#4b565a',
    trim: '#26343a',
    accent: '#8fe8ff',
    ambient: 0.38,
    hemiSky: '#8fb5c3',
    hemiGround: '#1b2023',
    hemi: 0.42,
    directional: 0.46,
    point: 0.28,
    roughness: 0.82,
    metalness: 0.02,
    floorOpacity: 0.78,
    platformOpacity: 0.86,
    envMapIntensity: 0.08,
  },

  galaxy: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.32,
    hemiSky: '#10333b',
    hemiGround: '#020406',
    hemi: 0.48,
    directional: 0.62,
    point: 0.72,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.78,
    platformOpacity: 0.88,
    envMapIntensity: 0.22,
  },

  night: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.34,
    hemiSky: '#4ec4ac',
    hemiGround: '#020504',
    hemi: 0.5,
    directional: 0.68,
    point: 0.6,
    roughness: 0.46,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  synthwave: {
    floor: '#05040b',
    platform: '#0d0a18',
    trim: '#1d1230',
    accent: '#b967ff',
    ambient: 0.34,
    hemiSky: '#5e45c2',
    hemiGround: '#040008',
    hemi: 0.5,
    directional: 0.62,
    point: 0.68,
    roughness: 0.38,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  zenith: {
    floor: '#060604',
    platform: '#0e0d09',
    trim: '#2c2414',
    accent: '#ffd680',
    ambient: 0.38,
    hemiSky: '#bca777',
    hemiGround: '#050403',
    hemi: 0.5,
    directional: 0.7,
    point: 0.46,
    roughness: 0.36,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  factory: {
    floor: '#171513',
    platform: '#24211e',
    trim: '#46321f',
    accent: '#ffaa3c',
    ambient: 0.38,
    hemiSky: '#a37948',
    hemiGround: '#080604',
    hemi: 0.5,
    directional: 0.72,
    point: 0.62,
    roughness: 0.68,
    metalness: 0.18,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.18,
  },

  temple: {
    floor: '#081008',
    platform: '#111a10',
    trim: '#1b3218',
    accent: '#34f0bf',
    ambient: 0.38,
    hemiSky: '#5ea070',
    hemiGround: '#050906',
    hemi: 0.56,
    directional: 0.7,
    point: 0.62,
    roughness: 0.86,
    metalness: 0.05,
    floorOpacity: 0.82,
    platformOpacity: 0.88,
    envMapIntensity: 0.12,
  },

  mirage: {
    floor: '#05040a',
    platform: '#100b18',
    trim: '#1c1026',
    accent: '#ff3bd4',
    ambient: 0.34,
    hemiSky: '#5e43bd',
    hemiGround: '#050009',
    hemi: 0.5,
    directional: 0.65,
    point: 0.7,
    roughness: 0.38,
    metalness: 0.48,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  cosmic_space_360: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.32,
    hemiSky: '#10333b',
    hemiGround: '#020406',
    hemi: 0.48,
    directional: 0.62,
    point: 0.72,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.78,
    platformOpacity: 0.88,
    envMapIntensity: 0.22,
  },

  training_chamber_360: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.34,
    hemiSky: '#4ec4ac',
    hemiGround: '#020504',
    hemi: 0.5,
    directional: 0.68,
    point: 0.6,
    roughness: 0.46,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.2,
  },

  efect_arena_360: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.34,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.52,
    directional: 0.7,
    point: 0.68,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },

  default: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.34,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.52,
    directional: 0.7,
    point: 0.68,
    roughness: 0.42,
    metalness: 0.44,
    floorOpacity: 0.8,
    platformOpacity: 0.9,
    envMapIntensity: 0.22,
  },
};

function GlowRing({
  radius,
  tube,
  opacity,
  color,
  z = 0,
}: {
  radius: number;
  tube: number;
  opacity: number;
  color: string;
  z?: number;
}) {
  return (
    <mesh position={[0, -0.073 + z, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + tube, 96]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function SpawnPad({
  x,
  z,
  color,
  opacity = 0.16,
}: {
  x: number;
  z: number;
  color: string;
  opacity?: number;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, -0.071, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.82, 48]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>

      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 40]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.34} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LowTrimLine({
  x,
  z,
  width,
  depth,
  color,
  opacity,
}: {
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  opacity: number;
}) {
  return (
    <mesh position={[x, -0.068, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

export default function Room() {
  const { color, mapTheme } = useStore();

  const style = useMemo(() => {
    return ROOM_STYLES[mapTheme] || ROOM_STYLES.default;
  }, [mapTheme]);

  const accent = color || style.accent;

  return (
    <group>
      <ambientLight intensity={style.ambient} />

      <hemisphereLight args={[style.hemiSky, style.hemiGround, style.hemi]} />

      <directionalLight
        position={[6, 9, 4]}
        intensity={style.directional}
        color="#f2fbff"
      />

      <directionalLight
        position={[-7, 5, -5]}
        intensity={style.directional * 0.28}
        color={accent}
      />

      <pointLight
        position={[0, 4.5, 0]}
        intensity={style.point}
        color={accent}
        distance={24}
      />

      <pointLight
        position={[0, 2.5, -9]}
        intensity={style.point * 0.34}
        color={accent}
        distance={18}
      />

      <pointLight
        position={[0, 2.5, 9]}
        intensity={style.point * 0.22}
        color={accent}
        distance={16}
      />

      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[96, 96]} />
        <meshStandardMaterial
          color={style.floor}
          roughness={style.roughness}
          metalness={style.metalness}
          transparent
          opacity={style.floorOpacity}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <mesh position={[0, -0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.15, 96]} />
        <meshStandardMaterial
          color={style.platform}
          emissive={accent}
          emissiveIntensity={0.055}
          roughness={0.44}
          metalness={0.32}
          transparent
          opacity={style.platformOpacity}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <GlowRing radius={3.45} tube={0.08} opacity={0.26} color={accent} />
      <GlowRing radius={5.7} tube={0.035} opacity={0.12} color={accent} z={0.002} />
      <GlowRing radius={10.5} tube={0.025} opacity={0.055} color={accent} z={0.004} />

      <LowTrimLine x={0} z={-11} width={18} depth={0.035} color={accent} opacity={0.14} />
      <LowTrimLine x={0} z={11} width={18} depth={0.035} color={accent} opacity={0.09} />
      <LowTrimLine x={-11} z={0} width={0.035} depth={18} color={accent} opacity={0.09} />
      <LowTrimLine x={11} z={0} width={0.035} depth={18} color={accent} opacity={0.09} />

      <SpawnPad x={0} z={-7.5} color={accent} opacity={0.15} />
      <SpawnPad x={-7.5} z={0} color={accent} opacity={0.1} />
      <SpawnPad x={7.5} z={0} color={accent} opacity={0.1} />
      <SpawnPad x={0} z={7.5} color={accent} opacity={0.08} />

      <mesh position={[-9.5, 0.18, -7.5]}>
        <boxGeometry args={[0.24, 0.55, 4.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.035}
          roughness={0.52}
          metalness={0.28}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <mesh position={[9.5, 0.18, -7.5]}>
        <boxGeometry args={[0.24, 0.55, 4.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.035}
          roughness={0.52}
          metalness={0.28}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <mesh position={[-9.5, 0.18, 7.5]}>
        <boxGeometry args={[0.24, 0.55, 3.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.025}
          roughness={0.52}
          metalness={0.28}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <mesh position={[9.5, 0.18, 7.5]}>
        <boxGeometry args={[0.24, 0.55, 3.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.025}
          roughness={0.52}
          metalness={0.28}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>
    </group>
  );
}