import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getScenarioGameplayConfig, type ScenarioArenaPropStyle } from '../store/scenarioData';

type ThemeStyle = {
  floor: string;
  platform: string;
  trim: string;
  accent: string;

  ambient: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;

  keyLight: number;
  fillLight: number;
  topPoint: number;
  frontPoint: number;
  rearPoint: number;

  roughness: number;
  metalness: number;
  floorOpacity: number;
  platformOpacity: number;
  envMapIntensity: number;

  platformGlow: number;
  trimGlow: number;
  ringOpacity: number;
};

const ROOM_STYLES: Record<string, ThemeStyle> = {
  cosmic_space: {
    floor: '#02060a',
    platform: '#071014',
    trim: '#0c2024',
    accent: '#00ffcc',

    ambient: 0.28,
    hemiSky: '#10333b',
    hemiGround: '#020406',
    hemi: 0.42,

    keyLight: 0.52,
    fillLight: 0.22,
    topPoint: 0.58,
    frontPoint: 0.26,
    rearPoint: 0.18,

    roughness: 0.44,
    metalness: 0.36,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.18,

    platformGlow: 0.06,
    trimGlow: 0.04,
    ringOpacity: 0.24,
  },

  skydeck_cloud_lab: {
    floor: '#293236',
    platform: '#384145',
    trim: '#1b2b31',
    accent: '#8fe8ff',

    ambient: 0.22,
    hemiSky: '#8fb5c3',
    hemiGround: '#171b1e',
    hemi: 0.28,

    keyLight: 0.34,
    fillLight: 0.14,
    topPoint: 0.24,
    frontPoint: 0.12,
    rearPoint: 0.1,

    roughness: 0.82,
    metalness: 0.04,
    floorOpacity: 0.78,
    platformOpacity: 0.84,
    envMapIntensity: 0.06,

    platformGlow: 0.035,
    trimGlow: 0.02,
    ringOpacity: 0.16,
  },

  industrial_warehouse: {
    floor: '#171310',
    platform: '#24201a',
    trim: '#46321f',
    accent: '#ffaa3c',

    ambient: 0.3,
    hemiSky: '#a37948',
    hemiGround: '#080604',
    hemi: 0.4,

    keyLight: 0.58,
    fillLight: 0.2,
    topPoint: 0.48,
    frontPoint: 0.24,
    rearPoint: 0.18,

    roughness: 0.72,
    metalness: 0.14,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.14,

    platformGlow: 0.045,
    trimGlow: 0.035,
    ringOpacity: 0.2,
  },

  jungle_temple_ruins: {
    floor: '#061006',
    platform: '#101a0f',
    trim: '#1b3218',
    accent: '#34f0bf',

    ambient: 0.32,
    hemiSky: '#5ea070',
    hemiGround: '#050906',
    hemi: 0.44,

    keyLight: 0.58,
    fillLight: 0.2,
    topPoint: 0.5,
    frontPoint: 0.22,
    rearPoint: 0.18,

    roughness: 0.86,
    metalness: 0.04,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.1,

    platformGlow: 0.045,
    trimGlow: 0.035,
    ringOpacity: 0.22,
  },

  neon_rooftop_city: {
    floor: '#05040a',
    platform: '#100b18',
    trim: '#1c1026',
    accent: '#ff3bd4',

    ambient: 0.28,
    hemiSky: '#5e43bd',
    hemiGround: '#050009',
    hemi: 0.4,

    keyLight: 0.52,
    fillLight: 0.22,
    topPoint: 0.56,
    frontPoint: 0.26,
    rearPoint: 0.22,

    roughness: 0.4,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.18,

    platformGlow: 0.06,
    trimGlow: 0.04,
    ringOpacity: 0.24,
  },

  tech_training_arena: {
    floor: '#050908',
    platform: '#0c1210',
    trim: '#102822',
    accent: '#57ff9f',

    ambient: 0.3,
    hemiSky: '#8fe8ba',
    hemiGround: '#030706',
    hemi: 0.42,

    keyLight: 0.58,
    fillLight: 0.22,
    topPoint: 0.52,
    frontPoint: 0.24,
    rearPoint: 0.18,

    roughness: 0.48,
    metalness: 0.32,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.16,

    platformGlow: 0.055,
    trimGlow: 0.035,
    ringOpacity: 0.23,
  },

  training_chamber: {
    floor: '#050808',
    platform: '#0b1111',
    trim: '#10201d',
    accent: '#00ffcc',

    ambient: 0.28,
    hemiSky: '#4ec4ac',
    hemiGround: '#020504',
    hemi: 0.4,

    keyLight: 0.54,
    fillLight: 0.2,
    topPoint: 0.5,
    frontPoint: 0.22,
    rearPoint: 0.18,

    roughness: 0.48,
    metalness: 0.36,
    floorOpacity: 0.84,
    platformOpacity: 0.9,
    envMapIntensity: 0.16,

    platformGlow: 0.055,
    trimGlow: 0.035,
    ringOpacity: 0.23,
  },

  efect_arena: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',

    ambient: 0.3,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.42,

    keyLight: 0.58,
    fillLight: 0.22,
    topPoint: 0.58,
    frontPoint: 0.26,
    rearPoint: 0.2,

    roughness: 0.44,
    metalness: 0.36,
    floorOpacity: 0.84,
    platformOpacity: 0.91,
    envMapIntensity: 0.18,

    platformGlow: 0.07,
    trimGlow: 0.045,
    ringOpacity: 0.28,
  },

  luxury_lounge: {
    floor: '#050403',
    platform: '#0d0b08',
    trim: '#2c2414',
    accent: '#ffd680',

    ambient: 0.24,
    hemiSky: '#bca777',
    hemiGround: '#050403',
    hemi: 0.34,

    keyLight: 0.44,
    fillLight: 0.14,
    topPoint: 0.34,
    frontPoint: 0.16,
    rearPoint: 0.12,

    roughness: 0.38,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.14,

    platformGlow: 0.04,
    trimGlow: 0.025,
    ringOpacity: 0.18,
  },

  cyber_rooftop: {
    floor: '#05040b',
    platform: '#0d0a18',
    trim: '#1d1230',
    accent: '#b967ff',

    ambient: 0.28,
    hemiSky: '#5e45c2',
    hemiGround: '#040008',
    hemi: 0.4,

    keyLight: 0.52,
    fillLight: 0.2,
    topPoint: 0.54,
    frontPoint: 0.24,
    rearPoint: 0.2,

    roughness: 0.4,
    metalness: 0.42,
    floorOpacity: 0.82,
    platformOpacity: 0.9,
    envMapIntensity: 0.18,

    platformGlow: 0.06,
    trimGlow: 0.04,
    ringOpacity: 0.24,
  },

  default: {
    floor: '#040604',
    platform: '#091009',
    trim: '#143014',
    accent: '#39ff14',

    ambient: 0.3,
    hemiSky: '#2ecc16',
    hemiGround: '#020302',
    hemi: 0.42,

    keyLight: 0.58,
    fillLight: 0.22,
    topPoint: 0.58,
    frontPoint: 0.26,
    rearPoint: 0.2,

    roughness: 0.44,
    metalness: 0.36,
    floorOpacity: 0.84,
    platformOpacity: 0.91,
    envMapIntensity: 0.18,

    platformGlow: 0.07,
    trimGlow: 0.045,
    ringOpacity: 0.28,
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
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
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
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.34}
          depthWrite={false}
          toneMapped={false}
        />
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
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function ScenarioWallGrid({ color }: { color: string }) {
  const gridLines = [-6, -3, 0, 3, 6];

  return (
    <group position={[0, 3.4, -12]}>
      {gridLines.map((x) => (
        <mesh key={`v-${x}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.035, 6.6, 0.035]} />
          <meshBasicMaterial color={color} transparent opacity={0.24} toneMapped={false} />
        </mesh>
      ))}

      {[-2.4, 0, 2.4].map((y) => (
        <mesh key={`h-${y}`} position={[0, y, 0]}>
          <boxGeometry args={[13.2, 0.035, 0.035]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
        </mesh>
      ))}

      <mesh>
        <boxGeometry args={[13.6, 6.9, 0.04]} />
        <meshBasicMaterial color={color} transparent opacity={0.035} toneMapped={false} />
      </mesh>
    </group>
  );
}

function TrackingLane({ color }: { color: string }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 3.4]}>
          <LowTrimLine x={0} z={0} width={26} depth={0.06} color={color} opacity={0.34} />
          {[-11, -5.5, 0, 5.5, 11].map((x) => (
            <SpawnPad key={`${side}-${x}`} x={x} z={0} color={color} opacity={0.08} />
          ))}
        </group>
      ))}
    </group>
  );
}

function VerticalGates({ color }: { color: string }) {
  return (
    <group position={[0, 3.2, -9]}>
      {[-4.5, 0, 4.5].map((x, index) => (
        <mesh key={x} position={[x, index === 1 ? 1.2 : 0, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.18, 0.025, 10, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.34} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CompassPads({ color }: { color: string }) {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 9.6;
        const z = Math.sin(angle) * 9.6;

        return (
          <group key={index} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <SpawnPad x={0} z={0} color={color} opacity={0.16} />
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.08, 1.7, 0.08]} />
              <meshBasicMaterial color={color} transparent opacity={0.22} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function PrecisionSightFrame({ color }: { color: string }) {
  return (
    <group position={[0, 2.9, -13]}>
      <mesh>
        <torusGeometry args={[2.35, 0.022, 10, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.26} toneMapped={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.82, 0.018, 8, 72]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5.5, 0.025, 0.035]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.025, 5.5, 0.035]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FortniteBoxProps({ color }: { color: string }) {
  return (
    <group>
      {[-4.5, 0, 4.5].map((x) => (
        <group key={x} position={[x, 1.65, -7.5]}>
          <mesh>
            <boxGeometry args={[2.2, 3.2, 0.05]} />
            <meshBasicMaterial color={color} transparent opacity={0.085} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.62, 0]}>
            <boxGeometry args={[2.2, 0.045, 0.08]} />
            <meshBasicMaterial color={color} transparent opacity={0.28} toneMapped={false} />
          </mesh>
          <mesh position={[0, -1.62, 0]}>
            <boxGeometry args={[2.2, 0.045, 0.08]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
          </mesh>
          {[-1.1, 1.1].map((side) => (
            <mesh key={side} position={[side, 0, 0]}>
              <boxGeometry args={[0.045, 3.2, 0.08]} />
              <meshBasicMaterial color={color} transparent opacity={0.24} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function ScenarioArenaDecor({
  propStyle,
  color,
}: {
  propStyle: ScenarioArenaPropStyle;
  color: string;
}) {
  const isTracking = propStyle === 'tracking_lane';
  const isGrid = propStyle === 'gridwall';
  const isVertical = propStyle === 'vertical_tower';
  const isPrecision = propStyle === 'benchmark_stage';
  const isFortnite = propStyle === 'fortnite_box';

  return (
    <group>
      {isTracking && <TrackingLane color={color} />}
      {isGrid && <ScenarioWallGrid color={color} />}
      {isVertical && <VerticalGates color={color} />}
      {isFortnite && <FortniteBoxProps color={color} />}
      {(isFortnite || isPrecision) && <CompassPads color={color} />}
      {isPrecision && <PrecisionSightFrame color={color} />}
    </group>
  );
}

export default function Room() {
  const { color, mapTheme, scenario } = useStore();

  const style = useMemo(() => {
    return ROOM_STYLES[mapTheme] || ROOM_STYLES.default;
  }, [mapTheme]);
  const scenarioConfig = useMemo(() => getScenarioGameplayConfig(scenario), [scenario]);

  const accent = color || style.accent;
  const brightness = scenarioConfig.arena.brightness;

  return (
    <group>
      <ambientLight intensity={style.ambient * brightness} />

      <hemisphereLight args={[style.hemiSky, style.hemiGround, style.hemi * brightness]} />

      <directionalLight position={[6, 9, 4]} intensity={style.keyLight * brightness} color="#f2fbff" />

      <directionalLight position={[-7, 5, -5]} intensity={style.fillLight * brightness} color={accent} />

      <pointLight position={[0, 4.5, 0]} intensity={style.topPoint * brightness} color={accent} distance={24} />

      <pointLight
        position={[0, 2.5, -9]}
        intensity={style.frontPoint * brightness}
        color={accent}
        distance={18}
      />

      <pointLight
        position={[0, 2.5, 9]}
        intensity={style.rearPoint * brightness}
        color={accent}
        distance={16}
      />

      <spotLight
        position={[0, 8, 2]}
        target-position={[0, 0, -8]}
        angle={0.5}
        penumbra={0.65}
        intensity={style.keyLight * 0.72 * brightness}
        color="#ffffff"
        distance={24}
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
          emissiveIntensity={style.platformGlow}
          roughness={0.46}
          metalness={0.28}
          transparent
          opacity={style.platformOpacity}
          envMapIntensity={style.envMapIntensity}
        />
      </mesh>

      <GlowRing radius={3.45} tube={0.08} opacity={style.ringOpacity} color={accent} />
      <GlowRing radius={5.7} tube={0.035} opacity={style.ringOpacity * 0.48} color={accent} z={0.002} />
      <GlowRing radius={10.5} tube={0.025} opacity={style.ringOpacity * 0.24} color={accent} z={0.004} />

      <LowTrimLine x={0} z={-11} width={18} depth={0.035} color={accent} opacity={style.ringOpacity * 0.56} />
      <LowTrimLine x={0} z={11} width={18} depth={0.035} color={accent} opacity={style.ringOpacity * 0.34} />
      <LowTrimLine x={-11} z={0} width={0.035} depth={18} color={accent} opacity={style.ringOpacity * 0.34} />
      <LowTrimLine x={11} z={0} width={0.035} depth={18} color={accent} opacity={style.ringOpacity * 0.34} />

      <SpawnPad x={0} z={-7.5} color={accent} opacity={style.ringOpacity * 0.58} />
      <SpawnPad x={-7.5} z={0} color={accent} opacity={style.ringOpacity * 0.4} />
      <SpawnPad x={7.5} z={0} color={accent} opacity={style.ringOpacity * 0.4} />
      <SpawnPad x={0} z={7.5} color={accent} opacity={style.ringOpacity * 0.32} />

      <ScenarioArenaDecor propStyle={scenarioConfig.arena.propStyle} color={accent} />

      {[
        [-9.5, 0.18, -7.5, 0.24, 0.55, 4.2],
        [9.5, 0.18, -7.5, 0.24, 0.55, 4.2],
        [-9.5, 0.18, 7.5, 0.24, 0.55, 3.2],
        [9.5, 0.18, 7.5, 0.24, 0.55, 3.2],
      ].map(([x, y, z, w, h, d], index) => (
        <mesh key={index} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={style.trim}
            emissive={accent}
            emissiveIntensity={style.trimGlow}
            roughness={0.54}
            metalness={0.24}
            envMapIntensity={style.envMapIntensity}
          />
        </mesh>
      ))}
    </group>
  );
}
