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
};

const ROOM_STYLES: Record<string, ThemeStyle> = {
  cosmic_space: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.42,
    hemiSky: '#18404b',
    hemiGround: '#020406',
    hemi: 0.72,
    directional: 0.85,
    point: 0.9,
    roughness: 0.3,
    metalness: 0.62,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  skydeck_cloud_lab: {
    floor: '#dce7eb',
    platform: '#f7fbff',
    trim: '#c8d7de',
    accent: '#8fe8ff',
    ambient: 0.95,
    hemiSky: '#ffffff',
    hemiGround: '#6c7a80',
    hemi: 1.1,
    directional: 1.4,
    point: 0.42,
    roughness: 0.72,
    metalness: 0.08,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  industrial_warehouse: {
    floor: '#171513',
    platform: '#24211e',
    trim: '#46321f',
    accent: '#ffaa3c',
    ambient: 0.52,
    hemiSky: '#d6a765',
    hemiGround: '#080604',
    hemi: 0.75,
    directional: 1.0,
    point: 0.75,
    roughness: 0.62,
    metalness: 0.24,
    floorOpacity: 0.88,
    platformOpacity: 0.94,
  },

  jungle_temple_ruins: {
    floor: '#081008',
    platform: '#111a10',
    trim: '#1b3218',
    accent: '#34f0bf',
    ambient: 0.58,
    hemiSky: '#83d99a',
    hemiGround: '#050906',
    hemi: 0.82,
    directional: 1.0,
    point: 0.78,
    roughness: 0.82,
    metalness: 0.08,
    floorOpacity: 0.86,
    platformOpacity: 0.9,
  },

  neon_rooftop_city: {
    floor: '#05040a',
    platform: '#100b18',
    trim: '#1c1026',
    accent: '#ff3bd4',
    ambient: 0.46,
    hemiSky: '#835cff',
    hemiGround: '#050009',
    hemi: 0.74,
    directional: 0.95,
    point: 0.95,
    roughness: 0.24,
    metalness: 0.72,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  tech_training_arena: {
    floor: '#050908',
    platform: '#0c1210',
    trim: '#102822',
    accent: '#57ff9f',
    ambient: 0.56,
    hemiSky: '#baffdf',
    hemiGround: '#030706',
    hemi: 0.82,
    directional: 1.15,
    point: 0.88,
    roughness: 0.32,
    metalness: 0.56,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  training_chamber: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.52,
    hemiSky: '#69ffd8',
    hemiGround: '#020504',
    hemi: 0.78,
    directional: 1.0,
    point: 0.8,
    roughness: 0.36,
    metalness: 0.58,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  efect_arena: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.5,
    hemiSky: '#39ff14',
    hemiGround: '#020302',
    hemi: 0.78,
    directional: 1.05,
    point: 0.95,
    roughness: 0.3,
    metalness: 0.64,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
  },

  luxury_lounge: {
    floor: '#060604',
    platform: '#0e0d09',
    trim: '#2c2414',
    accent: '#ffd680',
    ambient: 0.58,
    hemiSky: '#f0d6a3',
    hemiGround: '#050403',
    hemi: 0.72,
    directional: 1.05,
    point: 0.62,
    roughness: 0.2,
    metalness: 0.72,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
  },

  cyber_rooftop: {
    floor: '#05040b',
    platform: '#0d0a18',
    trim: '#1d1230',
    accent: '#b967ff',
    ambient: 0.46,
    hemiSky: '#7c5cff',
    hemiGround: '#040008',
    hemi: 0.75,
    directional: 0.95,
    point: 0.88,
    roughness: 0.24,
    metalness: 0.68,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  cyber: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.5,
    hemiSky: '#39ff14',
    hemiGround: '#020302',
    hemi: 0.78,
    directional: 1.05,
    point: 0.95,
    roughness: 0.3,
    metalness: 0.64,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
  },

  minimal: {
    floor: '#dce7eb',
    platform: '#f7fbff',
    trim: '#c8d7de',
    accent: '#8fe8ff',
    ambient: 0.95,
    hemiSky: '#ffffff',
    hemiGround: '#6c7a80',
    hemi: 1.1,
    directional: 1.4,
    point: 0.42,
    roughness: 0.72,
    metalness: 0.08,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  galaxy: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.42,
    hemiSky: '#18404b',
    hemiGround: '#020406',
    hemi: 0.72,
    directional: 0.85,
    point: 0.9,
    roughness: 0.3,
    metalness: 0.62,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  night: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.52,
    hemiSky: '#69ffd8',
    hemiGround: '#020504',
    hemi: 0.78,
    directional: 1.0,
    point: 0.8,
    roughness: 0.36,
    metalness: 0.58,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  synthwave: {
    floor: '#05040b',
    platform: '#0d0a18',
    trim: '#1d1230',
    accent: '#b967ff',
    ambient: 0.46,
    hemiSky: '#7c5cff',
    hemiGround: '#040008',
    hemi: 0.75,
    directional: 0.95,
    point: 0.88,
    roughness: 0.24,
    metalness: 0.68,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  zenith: {
    floor: '#060604',
    platform: '#0e0d09',
    trim: '#2c2414',
    accent: '#ffd680',
    ambient: 0.58,
    hemiSky: '#f0d6a3',
    hemiGround: '#050403',
    hemi: 0.72,
    directional: 1.05,
    point: 0.62,
    roughness: 0.2,
    metalness: 0.72,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
  },

  factory: {
    floor: '#171513',
    platform: '#24211e',
    trim: '#46321f',
    accent: '#ffaa3c',
    ambient: 0.52,
    hemiSky: '#d6a765',
    hemiGround: '#080604',
    hemi: 0.75,
    directional: 1.0,
    point: 0.75,
    roughness: 0.62,
    metalness: 0.24,
    floorOpacity: 0.88,
    platformOpacity: 0.94,
  },

  temple: {
    floor: '#081008',
    platform: '#111a10',
    trim: '#1b3218',
    accent: '#34f0bf',
    ambient: 0.58,
    hemiSky: '#83d99a',
    hemiGround: '#050906',
    hemi: 0.82,
    directional: 1.0,
    point: 0.78,
    roughness: 0.82,
    metalness: 0.08,
    floorOpacity: 0.86,
    platformOpacity: 0.9,
  },

  mirage: {
    floor: '#05040a',
    platform: '#100b18',
    trim: '#1c1026',
    accent: '#ff3bd4',
    ambient: 0.46,
    hemiSky: '#835cff',
    hemiGround: '#050009',
    hemi: 0.74,
    directional: 0.95,
    point: 0.95,
    roughness: 0.24,
    metalness: 0.72,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  // Saved-name compatibility
  cosmic_space_360: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',
    ambient: 0.42,
    hemiSky: '#18404b',
    hemiGround: '#020406',
    hemi: 0.72,
    directional: 0.85,
    point: 0.9,
    roughness: 0.3,
    metalness: 0.62,
    floorOpacity: 0.82,
    platformOpacity: 0.92,
  },

  training_chamber_360: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',
    ambient: 0.52,
    hemiSky: '#69ffd8',
    hemiGround: '#020504',
    hemi: 0.78,
    directional: 1.0,
    point: 0.8,
    roughness: 0.36,
    metalness: 0.58,
    floorOpacity: 0.86,
    platformOpacity: 0.94,
  },

  efect_arena_360: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.5,
    hemiSky: '#39ff14',
    hemiGround: '#020302',
    hemi: 0.78,
    directional: 1.05,
    point: 0.95,
    roughness: 0.3,
    metalness: 0.64,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
  },

  default: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',
    ambient: 0.5,
    hemiSky: '#39ff14',
    hemiGround: '#020302',
    hemi: 0.78,
    directional: 1.05,
    point: 0.95,
    roughness: 0.3,
    metalness: 0.64,
    floorOpacity: 0.84,
    platformOpacity: 0.94,
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
      {/* Controlled lighting only. No wire cage, no grid helper. */}
      <ambientLight intensity={style.ambient} />

      <hemisphereLight
        args={[style.hemiSky, style.hemiGround, style.hemi]}
      />

      <directionalLight
        position={[6, 9, 4]}
        intensity={style.directional}
        color="#ffffff"
      />

      <directionalLight
        position={[-7, 5, -5]}
        intensity={style.directional * 0.36}
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
        intensity={style.point * 0.42}
        color={accent}
        distance={18}
      />

      <pointLight
        position={[0, 2.5, 9]}
        intensity={style.point * 0.28}
        color={accent}
        distance={16}
      />

      {/* Main premium floor. Transparent enough to let the 360 scene breathe. */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[96, 96]} />
        <meshStandardMaterial
          color={style.floor}
          roughness={style.roughness}
          metalness={style.metalness}
          transparent
          opacity={style.floorOpacity}
          envMapIntensity={0.38}
        />
      </mesh>

      {/* Soft center platform */}
      <mesh position={[0, -0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.15, 96]} />
        <meshStandardMaterial
          color={style.platform}
          emissive={accent}
          emissiveIntensity={0.08}
          roughness={0.28}
          metalness={0.5}
          transparent
          opacity={style.platformOpacity}
          envMapIntensity={0.45}
        />
      </mesh>

      {/* Premium rings */}
      <GlowRing radius={3.45} tube={0.08} opacity={0.34} color={accent} />
      <GlowRing radius={5.7} tube={0.035} opacity={0.18} color={accent} z={0.002} />
      <GlowRing radius={10.5} tube={0.025} opacity={0.08} color={accent} z={0.004} />

      {/* Minimal arena trim lines, not a full grid */}
      <LowTrimLine x={0} z={-11} width={18} depth={0.035} color={accent} opacity={0.2} />
      <LowTrimLine x={0} z={11} width={18} depth={0.035} color={accent} opacity={0.13} />
      <LowTrimLine x={-11} z={0} width={0.035} depth={18} color={accent} opacity={0.13} />
      <LowTrimLine x={11} z={0} width={0.035} depth={18} color={accent} opacity={0.13} />

      {/* Spawn / aim pads */}
      <SpawnPad x={0} z={-7.5} color={accent} opacity={0.2} />
      <SpawnPad x={-7.5} z={0} color={accent} opacity={0.14} />
      <SpawnPad x={7.5} z={0} color={accent} opacity={0.14} />
      <SpawnPad x={0} z={7.5} color={accent} opacity={0.12} />

      {/* Low side blocks for depth. They stay small so the 360 background remains visible. */}
      <mesh position={[-9.5, 0.18, -7.5]}>
        <boxGeometry args={[0.24, 0.55, 4.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.05}
          roughness={0.38}
          metalness={0.45}
        />
      </mesh>

      <mesh position={[9.5, 0.18, -7.5]}>
        <boxGeometry args={[0.24, 0.55, 4.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.05}
          roughness={0.38}
          metalness={0.45}
        />
      </mesh>

      <mesh position={[-9.5, 0.18, 7.5]}>
        <boxGeometry args={[0.24, 0.55, 3.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.035}
          roughness={0.38}
          metalness={0.45}
        />
      </mesh>

      <mesh position={[9.5, 0.18, 7.5]}>
        <boxGeometry args={[0.24, 0.55, 3.2]} />
        <meshStandardMaterial
          color={style.trim}
          emissive={accent}
          emissiveIntensity={0.035}
          roughness={0.38}
          metalness={0.45}
        />
      </mesh>
    </group>
  );
}