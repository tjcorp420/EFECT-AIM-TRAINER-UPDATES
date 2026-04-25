import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import WeaponModel from './WeaponModel';
import * as THREE from 'three';

type WeaponClass = 'pistol' | 'smg' | 'sniper' | 'nerf';

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

  const bodyLength = isSniper ? 0.58 : isSmg || isNerf ? 0.46 : 0.34;
  const barrelLength = isSniper ? 0.58 : isSmg || isNerf ? 0.34 : 0.28;

  const bodyColor = isNerf ? '#20202a' : '#090d0d';
  const accentColor = isNerf ? '#ff8a00' : color;

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

export default function Gun() {
  const rawWeaponClass = useStore((state) => state.weaponClass) as string;
  const color = useStore((state) => state.color);
  const shots = useStore((state) => state.shots);

  const { camera } = useThree();

  const gunContainerRef = useRef<THREE.Group>(null);
  const gunModelRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Group>(null);
  const muzzleFlashMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const prevShots = useRef(shots);

  const recoilTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentRecoil = useRef(new THREE.Vector3(0, 0, 0));
  const recoilRotTarget = useRef(0);
  const currentRecoilRot = useRef(0);

  const prevRotation = useRef(new THREE.Euler());
  const swayTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentSway = useRef(new THREE.Vector3(0, 0, 0));

  const muzzleFlash = useRef(0);
  const time = useRef(0);

  const activeWeaponClass: WeaponClass =
    rawWeaponClass === 'smg' ||
    rawWeaponClass === 'sniper' ||
    rawWeaponClass === 'nerf'
      ? rawWeaponClass
      : 'pistol';

  const profile = WEAPON_PROFILES[activeWeaponClass];

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

    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.visible = muzzleFlash.current > 0.025;
      muzzleFlashRef.current.scale.setScalar(0.65 + muzzleFlash.current * 0.75);
      muzzleFlashRef.current.rotation.z += dt * 18;
    }

    if (muzzleFlashMaterialRef.current) {
      muzzleFlashMaterialRef.current.opacity = muzzleFlash.current;
    }
  });

  return (
    <group ref={gunContainerRef}>
      <group ref={gunModelRef}>
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

        <group ref={muzzleFlashRef} position={profile.muzzlePosition} visible={false}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.085, 0.2, 7]} />
            <meshBasicMaterial
              ref={muzzleFlashMaterialRef}
              color={color}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>

          <pointLight color={color} intensity={2.4} distance={2.4} />
        </group>
      </group>
    </group>
  );
}