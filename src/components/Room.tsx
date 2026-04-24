import { useMemo } from 'react';
import { useStore } from '../store/useStore';

type ThemeStyle = {
  floor: string;
  platform: string;
  accent: string;
  ambient: number;
  directional: number;
  point: number;
  roughness: number;
  metalness: number;
};

const ROOM_STYLES: Record<string, ThemeStyle> = {
  cyber: {
    floor: '#050707',
    platform: '#0b1111',
    accent: '#00f5d4',
    ambient: 0.45,
    directional: 1.0,
    point: 0.8,
    roughness: 0.22,
    metalness: 0.65,
  },
  minimal: {
    floor: '#bfc5cb',
    platform: '#d7dde2',
    accent: '#8fe8ff',
    ambient: 0.95,
    directional: 1.2,
    point: 0.35,
    roughness: 0.85,
    metalness: 0.05,
  },
  galaxy: {
    floor: '#06070c',
    platform: '#0c1018',
    accent: '#39ffea',
    ambient: 0.38,
    directional: 0.7,
    point: 0.9,
    roughness: 0.18,
    metalness: 0.75,
  },
  synthwave: {
    floor: '#09070f',
    platform: '#130d1d',
    accent: '#ff4fd8',
    ambient: 0.42,
    directional: 0.9,
    point: 0.95,
    roughness: 0.2,
    metalness: 0.7,
  },
  zenith: {
    floor: '#f2f4f7',
    platform: '#ffffff',
    accent: '#9cecff',
    ambient: 1.0,
    directional: 1.35,
    point: 0.25,
    roughness: 0.55,
    metalness: 0.1,
  },

  inferno: {
    floor: '#17110d',
    platform: '#231711',
    accent: '#ff8c42',
    ambient: 0.55,
    directional: 1.0,
    point: 0.8,
    roughness: 0.45,
    metalness: 0.25,
  },
  tundra: {
    floor: '#dde4ea',
    platform: '#f2f5f8',
    accent: '#8edcff',
    ambient: 1.0,
    directional: 1.25,
    point: 0.3,
    roughness: 0.72,
    metalness: 0.08,
  },
  factory: {
    floor: '#262321',
    platform: '#31302e',
    accent: '#ffb14a',
    ambient: 0.5,
    directional: 0.95,
    point: 0.7,
    roughness: 0.68,
    metalness: 0.22,
  },
  temple: {
    floor: '#22251c',
    platform: '#2d3425',
    accent: '#34f0bf',
    ambient: 0.58,
    directional: 0.95,
    point: 0.75,
    roughness: 0.82,
    metalness: 0.06,
  },
  mirage: {
    floor: '#100d17',
    platform: '#181324',
    accent: '#8d5dff',
    ambient: 0.46,
    directional: 0.9,
    point: 0.85,
    roughness: 0.28,
    metalness: 0.58,
  },

  cosmic_space_360: {
    floor: '#06070c',
    platform: '#0c1018',
    accent: '#39ffea',
    ambient: 0.38,
    directional: 0.7,
    point: 0.9,
    roughness: 0.18,
    metalness: 0.75,
  },
  skydeck_cloud_lab: {
    floor: '#edf3f7',
    platform: '#ffffff',
    accent: '#8fe8ff',
    ambient: 1.0,
    directional: 1.35,
    point: 0.25,
    roughness: 0.58,
    metalness: 0.12,
  },
  industrial_warehouse: {
    floor: '#262321',
    platform: '#31302e',
    accent: '#ffb14a',
    ambient: 0.5,
    directional: 0.95,
    point: 0.7,
    roughness: 0.68,
    metalness: 0.22,
  },
  jungle_temple_ruins: {
    floor: '#22251c',
    platform: '#2d3425',
    accent: '#34f0bf',
    ambient: 0.58,
    directional: 0.95,
    point: 0.75,
    roughness: 0.82,
    metalness: 0.06,
  },
  neon_rooftop_city: {
    floor: '#09070f',
    platform: '#130d1d',
    accent: '#ff4fd8',
    ambient: 0.42,
    directional: 0.9,
    point: 0.95,
    roughness: 0.2,
    metalness: 0.7,
  },
  tech_training_arena: {
    floor: '#0b0d10',
    platform: '#11161a',
    accent: '#57ff9f',
    ambient: 0.48,
    directional: 1.05,
    point: 0.85,
    roughness: 0.25,
    metalness: 0.55,
  },
  training_chamber_360: {
    floor: '#0a0d10',
    platform: '#10161b',
    accent: '#57ff9f',
    ambient: 0.48,
    directional: 1.0,
    point: 0.8,
    roughness: 0.22,
    metalness: 0.6,
  },
  efect_arena_360: {
    floor: '#090c0a',
    platform: '#101410',
    accent: '#39ff14',
    ambient: 0.45,
    directional: 0.95,
    point: 0.95,
    roughness: 0.22,
    metalness: 0.62,
  },

  default: {
    floor: '#070909',
    platform: '#0c1111',
    accent: '#39ff14',
    ambient: 0.48,
    directional: 1.0,
    point: 0.8,
    roughness: 0.25,
    metalness: 0.55,
  },
};

export default function Room() {
  const { color, mapTheme } = useStore();

  const style = useMemo(() => {
    return ROOM_STYLES[mapTheme] || ROOM_STYLES.default;
  }, [mapTheme]);

  const accent = color || style.accent;

  return (
    <group>
      <ambientLight intensity={style.ambient} />
      <directionalLight position={[6, 8, 4]} intensity={style.directional} />
      <pointLight position={[0, 4, 0]} intensity={style.point} color={accent} distance={18} />
      <pointLight position={[0, 2, -8]} intensity={style.point * 0.35} color={accent} distance={14} />
      <pointLight position={[0, 2, 8]} intensity={style.point * 0.35} color={accent} distance={14} />

      {/* MAIN FLOOR - no old grid */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color={style.floor}
          roughness={style.roughness}
          metalness={style.metalness}
        />
      </mesh>

      {/* CENTER PLATFORM */}
      <mesh position={[0, -0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.15, 64]} />
        <meshStandardMaterial
          color={style.platform}
          emissive={accent}
          emissiveIntensity={0.06}
          roughness={0.3}
          metalness={0.45}
        />
      </mesh>

      {/* SUBTLE RING */}
      <mesh position={[0, -0.079, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.6, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.28} />
      </mesh>

      {/* SPAWN PADS / ACCENT LIGHTS */}
      <mesh position={[0, -0.078, -7]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.82, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} />
      </mesh>

      <mesh position={[-7, -0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.82, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} />
      </mesh>

      <mesh position={[7, -0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.82, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} />
      </mesh>

      <mesh position={[0, -0.078, 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.82, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} />
      </mesh>
    </group>
  );
}