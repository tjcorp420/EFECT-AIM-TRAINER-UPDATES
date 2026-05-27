import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import type { WeaponClass } from '../store/useStore';
import WeaponModel from './WeaponModel';
import * as THREE from 'three';

type Vec3 = [number, number, number];

type WeaponProfile = {
  recoilZ: number;
  recoilY: number;
  rotX: number;
  recovery: number;
  kickSpeed: number;

  baseX: number;
  baseY: number;
  baseZ: number;

  viewRotX: number;
  viewRotY: number;
  viewRotZ: number;

  viewScale: number;
  targetLength: number;
  modelPath: string;
  modelPosition: Vec3;
  modelRotation: Vec3;
  modelScale: number;
  muzzlePosition: Vec3;
};

const WEAPON_PROFILES: Record<WeaponClass, WeaponProfile> = {
  pistol: {
    recoilZ: 0.12,
    recoilY: 0.025,
    rotX: 0.1,
    recovery: 16,
    kickSpeed: 42,

    baseX: 0.47,
    baseY: -0.42,
    baseZ: -1.02,

    viewRotX: 0.01,
    viewRotY: -0.18,
    viewRotZ: -0.03,

    viewScale: 1,
    targetLength: 0.72,
    modelPath: '/models/weapons/pistol.glb',

    // flipped so barrel points forward instead of at camera
    modelPosition: [0, 0, 0],
    modelRotation: [0, -Math.PI / 2, 0],
    modelScale: 1,

    muzzlePosition: [0, 0.035, -0.46],
  },

  smg: {
    recoilZ: 0.075,
    recoilY: 0.012,
    rotX: 0.055,
    recovery: 21,
    kickSpeed: 52,

    baseX: 0.5,
    baseY: -0.43,
    baseZ: -1.12,

    viewRotX: 0.005,
    viewRotY: -0.16,
    viewRotZ: -0.025,

    viewScale: 1,
    targetLength: 0.94,
    modelPath: '/models/weapons/smg.glb',

    // was sideways with barrel to left, rotate to face forward
    modelPosition: [0, 0, 0],
    modelRotation: [0, 0, 0],
    modelScale: 1,

    muzzlePosition: [0, 0.04, -0.6],
  },

  sniper: {
    recoilZ: 0.3,
    recoilY: 0.075,
    rotX: 0.2,
    recovery: 9,
    kickSpeed: 28,

    baseX: 0.56,
    baseY: -0.44,
    baseZ: -1.28,

    viewRotX: 0.0,
    viewRotY: -0.13,
    viewRotZ: -0.02,

    viewScale: 1,
    targetLength: 1.24,
    modelPath: '/models/weapons/sniper.glb',

    // flipped so barrel points forward instead of at camera
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI / 2, 0],
    modelScale: 1,

    muzzlePosition: [0, 0.045, -0.78],
  },

  nerf: {
    recoilZ: 0.09,
    recoilY: 0.018,
    rotX: 0.075,
    recovery: 18,
    kickSpeed: 45,

    baseX: 0.53,
    baseY: -0.43,
    baseZ: -1.08,

    viewRotX: 0.005,
    viewRotY: -0.16,
    viewRotZ: -0.025,

    viewScale: 1,
    targetLength: 0.98,
    modelPath: '/models/weapons/nerf.glb',

    // flipped so barrel points forward instead of at camera
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI / 2, 0],
    modelScale: 1,

    muzzlePosition: [0, 0.035, -0.56],
  },

  scifi: {
    recoilZ: 0.16,
    recoilY: 0.026,
    rotX: 0.12,
    recovery: 13,
    kickSpeed: 36,

    baseX: 0.58,
    baseY: -0.51,
    baseZ: -1.3,

    viewRotX: 0.0,
    viewRotY: -0.14,
    viewRotZ: -0.025,

    viewScale: 1,
    targetLength: 0.78,
    modelPath: '/models/weapons/scifi/scifigun.fbx',

    modelPosition: [0, 0, 0],
    modelRotation: [0, -Math.PI / 2, 0],
    modelScale: 0.84,

    muzzlePosition: [0, 0.04, -0.5],
  },

  scifi2: {
    recoilZ: 0.105,
    recoilY: 0.018,
    rotX: 0.082,
    recovery: 17,
    kickSpeed: 46,

    baseX: 0.6,
    baseY: -0.5,
    baseZ: -1.18,

    viewRotX: 0.004,
    viewRotY: -0.16,
    viewRotZ: -0.025,

    viewScale: 1,
    targetLength: 0.62,
    modelPath: '/models/weapons/scifi2/scifi_gun_2.fbx',

    modelPosition: [0, 0, 0],
    modelRotation: [0, -Math.PI / 2, 0],
    modelScale: 0.82,

    muzzlePosition: [0, 0.034, -0.44],
  },
};

function FallbackGun({
  color,
  weaponClass,
}: {
  color: string;
  weaponClass: WeaponClass;
}) {
  const isSmg = weaponClass === 'smg';
  const isSniper = weaponClass === 'sniper';
  const isNerf = weaponClass === 'nerf';
  const isSciFi = weaponClass === 'scifi' || weaponClass === 'scifi2';

  const bodyLength = isSniper ? 0.58 : isSmg || isNerf || isSciFi ? 0.46 : 0.34;
  const barrelLength = isSniper ? 0.58 : isSmg || isNerf || isSciFi ? 0.34 : 0.28;

  const bodyColor = isNerf ? '#20202a' : isSciFi ? '#07141c' : '#090d0d';
  const accentColor = isNerf ? '#ff8a00' : isSciFi ? '#00aaff' : color;

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.09, 0.095, bodyLength]} />
        <meshStandardMaterial color={bodyColor} metalness={0.72} roughness={0.28} />
      </mesh>

      <mesh position={[0, 0.055, -0.025]}>
        <boxGeometry args={[0.102, 0.047, bodyLength * 0.92]} />
        <meshStandardMaterial color="#1a2324" metalness={0.78} roughness={0.22} />
      </mesh>

      <mesh position={[0, 0.018, -0.28 - barrelLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, barrelLength, 24]} />
        <meshStandardMaterial color="#2d3638" metalness={0.86} roughness={0.18} />
      </mesh>

      <mesh position={[0, -0.106, 0.085]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.058, 0.18, 0.078]} />
        <meshStandardMaterial color="#050505" metalness={0.08} roughness={0.88} />
      </mesh>

      <mesh position={[0, 0.123, -0.01]}>
        <boxGeometry args={[0.008, 0.006, bodyLength * 0.56]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={2.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function OptimizedSciFiGun({
  color,
  weaponClass,
}: {
  color: string;
  weaponClass: WeaponClass;
}) {
  const isSidearm = weaponClass === 'scifi2';
  const accent = isSidearm ? '#39ff14' : '#00ffcc';
  const bodyLength = isSidearm ? 0.58 : 0.86;
  const bodyWidth = isSidearm ? 0.16 : 0.2;
  const bodyHeight = isSidearm ? 0.13 : 0.15;
  const barrelLength = isSidearm ? 0.42 : 0.64;

  return (
    <group raycast={null as any}>
      <mesh position={[0, 0.01, -0.04]}>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyLength]} />
        <meshStandardMaterial
          color="#111719"
          metalness={0.58}
          roughness={0.46}
          envMapIntensity={0.12}
        />
      </mesh>

      <mesh position={[0, 0.09, -0.08]}>
        <boxGeometry args={[bodyWidth * 0.72, 0.035, bodyLength * 0.78]} />
        <meshStandardMaterial color="#2d3334" metalness={0.42} roughness={0.52} />
      </mesh>

      <mesh position={[0, 0.118, -0.08]}>
        <boxGeometry args={[bodyWidth * 0.58, 0.016, bodyLength * 0.58]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.42}
          roughness={0.36}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.02, -bodyLength / 2 - barrelLength / 2 + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.026, barrelLength, 24]} />
        <meshStandardMaterial color="#20282a" metalness={0.68} roughness={0.38} />
      </mesh>

      <mesh position={[0, 0.02, -bodyLength / 2 - barrelLength + 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.038, 0.08, 24]} />
        <meshStandardMaterial
          color="#0b0f10"
          emissive={color}
          emissiveIntensity={0.12}
          metalness={0.72}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0, -0.11, bodyLength * 0.22]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[bodyWidth * 0.55, 0.28, 0.12]} />
        <meshStandardMaterial color="#050606" metalness={0.08} roughness={0.86} />
      </mesh>

      {!isSidearm && (
        <mesh position={[0, -0.055, 0.28]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[bodyWidth * 0.7, 0.16, 0.24]} />
          <meshStandardMaterial color="#080b0c" metalness={0.18} roughness={0.78} />
        </mesh>
      )}
    </group>
  );
}

export default function Gun() {
  const rawWeaponClass = useStore((state) => state.weaponClass) as string;
  const color = useStore((state) => state.color);
  const shots = useStore((state) => state.shots);
  const weaponMode = useStore((state) => state.weaponMode);
  const bulletEffect = useStore((state) => state.bulletEffect);

  const { camera } = useThree();

  const gunContainerRef = useRef<THREE.Group>(null);
  const gunModelRef = useRef<THREE.Group>(null);
  const slideRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Group>(null);
  const projectileBeamRef = useRef<THREE.Group>(null);
  const muzzleFlashMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const projectileBeamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const projectileCoreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const prevShots = useRef(shots);

  const recoilTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentRecoil = useRef(new THREE.Vector3(0, 0, 0));
  const recoilRotTarget = useRef(0);
  const currentRecoilRot = useRef(0);

  const prevRotation = useRef(new THREE.Euler());
  const swayTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentSway = useRef(new THREE.Vector3(0, 0, 0));

  const muzzleFlash = useRef(0);
  const projectileLife = useRef(0);
  const time = useRef(0);

  const activeWeaponClass: WeaponClass =
    rawWeaponClass in WEAPON_PROFILES ? (rawWeaponClass as WeaponClass) : 'pistol';
  const isOptimizedSciFi = activeWeaponClass === 'scifi' || activeWeaponClass === 'scifi2';

  const profile = WEAPON_PROFILES[activeWeaponClass];
  const projectileColor =
    bulletEffect === 'spark'
      ? '#ffffff'
      : bulletEffect === 'plasma'
        ? '#b967ff'
        : bulletEffect === 'rail'
          ? '#00ffcc'
          : color;
  const projectileLength =
    bulletEffect === 'rail' ? 3.6 : bulletEffect === 'tracer' ? 2.8 : bulletEffect === 'plasma' ? 2.35 : 2.15;
  const projectileRadius =
    bulletEffect === 'rail' ? 0.012 : bulletEffect === 'tracer' ? 0.018 : bulletEffect === 'plasma' ? 0.03 : 0.015;

  useEffect(() => {
    prevRotation.current.copy(camera.rotation);
  }, [camera]);

  useFrame((_, dt) => {
    if (!gunContainerRef.current || !gunModelRef.current) return;

    gunContainerRef.current.position.copy(camera.position);
    gunContainerRef.current.quaternion.copy(camera.quaternion);

    if (shots !== prevShots.current) {
      recoilTarget.current.z += profile.recoilZ;
      recoilTarget.current.y += profile.recoilY;
      recoilRotTarget.current += profile.rotX;
      muzzleFlash.current = 1;
      projectileLife.current = weaponMode !== 'stealth' && bulletEffect !== 'none' ? 1 : 0;
      prevShots.current = shots;
    }

    recoilTarget.current.lerp(new THREE.Vector3(0, 0, 0), dt * profile.recovery);

    recoilRotTarget.current = THREE.MathUtils.lerp(
      recoilRotTarget.current,
      0,
      dt * profile.recovery
    );

    currentRecoil.current.lerp(recoilTarget.current, dt * profile.kickSpeed);

    currentRecoilRot.current = THREE.MathUtils.lerp(
      currentRecoilRot.current,
      recoilRotTarget.current,
      dt * profile.kickSpeed
    );

    const deltaX = camera.rotation.y - prevRotation.current.y;
    const deltaY = camera.rotation.x - prevRotation.current.x;

    swayTarget.current.x = THREE.MathUtils.clamp(deltaX * 0.62, -0.15, 0.15);
    swayTarget.current.y = THREE.MathUtils.clamp(deltaY * 0.62, -0.15, 0.15);

    currentSway.current.lerp(swayTarget.current, dt * 14);
    swayTarget.current.lerp(new THREE.Vector3(0, 0, 0), dt * 10);

    prevRotation.current.copy(camera.rotation);

    time.current += dt;

    const idleY = Math.sin(time.current * 2) * 0.003;
    const idleX = Math.cos(time.current * 1.5) * 0.003;

    gunModelRef.current.position.set(
      profile.baseX + currentSway.current.x + idleX,
      profile.baseY + currentRecoil.current.y + currentSway.current.y + idleY,
      profile.baseZ + currentRecoil.current.z
    );

    gunModelRef.current.rotation.set(
      profile.viewRotX + currentRecoilRot.current,
      profile.viewRotY + currentSway.current.x * -1.45,
      profile.viewRotZ + currentSway.current.x * -1.05
    );

    gunModelRef.current.scale.setScalar(profile.viewScale);

    muzzleFlash.current = THREE.MathUtils.lerp(muzzleFlash.current, 0, dt * 18);
    projectileLife.current = Math.max(0, projectileLife.current - dt * (bulletEffect === 'rail' ? 7 : 10));

    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.visible =
        muzzleFlash.current > 0.025 && weaponMode !== 'stealth' && bulletEffect !== 'none';
      muzzleFlashRef.current.scale.setScalar(0.65 + muzzleFlash.current * 0.9);
      muzzleFlashRef.current.rotation.z += dt * 18;
    }

    if (slideRef.current) {
      slideRef.current.position.set(
        0,
        0.107 + muzzleFlash.current * 0.012,
        -0.02 + muzzleFlash.current * 0.095
      );
      slideRef.current.rotation.x = -muzzleFlash.current * 0.055;
    }

    if (muzzleFlashMaterialRef.current) {
      muzzleFlashMaterialRef.current.opacity = muzzleFlash.current;
    }

    if (projectileBeamRef.current) {
      const visible =
        projectileLife.current > 0.025 && weaponMode !== 'stealth' && bulletEffect !== 'none';

      projectileBeamRef.current.visible = visible;
      projectileBeamRef.current.scale.set(
        1 + (1 - projectileLife.current) * 0.1,
        1 + (1 - projectileLife.current) * 0.1,
        1
      );
    }

    if (projectileBeamMaterialRef.current) {
      projectileBeamMaterialRef.current.opacity = projectileLife.current * 0.62;
    }

    if (projectileCoreMaterialRef.current) {
      projectileCoreMaterialRef.current.opacity = projectileLife.current;
    }
  });

  return (
    <group ref={gunContainerRef}>
      <group ref={gunModelRef}>
        {isOptimizedSciFi ? (
          <OptimizedSciFiGun color={color} weaponClass={activeWeaponClass} />
        ) : (
          <Suspense fallback={<FallbackGun color={color} weaponClass={activeWeaponClass} />}>
            <WeaponModel
              modelPath={profile.modelPath}
              color={color}
              targetLength={profile.targetLength}
              modelPosition={profile.modelPosition}
              modelRotation={profile.modelRotation}
              modelScale={profile.modelScale}
            />
          </Suspense>
        )}

        <group ref={slideRef} raycast={null as any}>
          <mesh>
            <boxGeometry args={[0.112, 0.022, profile.targetLength * 0.58]} />
            <meshStandardMaterial
              color="#13181b"
              emissive={color}
              emissiveIntensity={muzzleFlash.current > 0.04 ? 0.9 : 0.28}
              metalness={0.75}
              roughness={0.26}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.014, -profile.targetLength * 0.14]}>
            <boxGeometry args={[0.012, 0.006, profile.targetLength * 0.36]} />
            <meshBasicMaterial color={color} transparent opacity={0.82} toneMapped={false} />
          </mesh>
        </group>

        <group ref={muzzleFlashRef} position={profile.muzzlePosition} visible={false}>
          <mesh
            rotation={[
              bulletEffect === 'rail' ? Math.PI / 2 : Math.PI / 2,
              0,
              bulletEffect === 'spark' ? Math.PI / 7 : 0,
            ]}
            position={[0, 0, bulletEffect === 'rail' ? -0.34 : bulletEffect === 'tracer' ? -0.18 : 0]}
          >
            {bulletEffect === 'rail' ? (
              <cylinderGeometry args={[0.014, 0.014, 0.78, 16]} />
            ) : bulletEffect === 'plasma' ? (
              <sphereGeometry args={[0.09, 18, 18]} />
            ) : bulletEffect === 'spark' ? (
              <octahedronGeometry args={[0.11, 0]} />
            ) : (
              <coneGeometry args={[0.085, 0.26, 7]} />
            )}
            <meshBasicMaterial
              ref={muzzleFlashMaterialRef}
              color={
                bulletEffect === 'spark'
                  ? '#ffffff'
                  : bulletEffect === 'plasma'
                    ? '#b967ff'
                    : color
              }
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          <pointLight color={color} intensity={2.4} distance={2.4} />
        </group>

        <group ref={projectileBeamRef} position={profile.muzzlePosition} visible={false} raycast={null as any}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -projectileLength / 2]}>
            <cylinderGeometry
              args={[
                projectileRadius * (bulletEffect === 'plasma' ? 0.65 : 0.72),
                projectileRadius,
                projectileLength,
                bulletEffect === 'spark' ? 7 : 16,
              ]}
            />
            <meshBasicMaterial
              ref={projectileBeamMaterialRef}
              color={projectileColor}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          <mesh position={[0, 0, -projectileLength]}>
            {bulletEffect === 'plasma' ? (
              <sphereGeometry args={[0.085, 18, 18]} />
            ) : bulletEffect === 'spark' ? (
              <octahedronGeometry args={[0.105, 0]} />
            ) : bulletEffect === 'rail' ? (
              <boxGeometry args={[0.05, 0.05, 0.16]} />
            ) : (
              <coneGeometry args={[0.055, 0.18, 10]} />
            )}
            <meshBasicMaterial
              ref={projectileCoreMaterialRef}
              color={projectileColor}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          <pointLight color={projectileColor} intensity={0.9} distance={3.8} />
        </group>
      </group>
    </group>
  );
}
