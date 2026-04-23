import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function Gun() {
  const { weaponClass, color, mapTheme } = useStore();
  const { camera } = useThree();
  
  // Containers
  const gunContainerRef = useRef<THREE.Group>(null);
  const gunModelRef = useRef<THREE.Group>(null);
  
  // Store the total shots directly from Zustand to trigger recoil
  const shots = useStore(state => state.shots);
  const prevShots = useRef(shots);
  
  // Recoil State Physics
  const recoilTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentRecoil = useRef(new THREE.Vector3(0, 0, 0));
  const recoilRotTarget = useRef(0);
  const currentRecoilRot = useRef(0);
  
  // Sway State Physics (Mouse weight)
  const prevRotation = useRef(new THREE.Euler());
  const swayTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentSway = useRef(new THREE.Vector3(0, 0, 0));
  
  // Idle State
  const time = useRef(0);

  // Weapon Recoil Profiles (Aim Labs / KovaaK's style math)
  const weaponProfiles = {
    pistol: { recoilZ: 0.15, recoilY: 0.03, rotX: 0.12, recovery: 15, kickSpeed: 40 },
    smg:    { recoilZ: 0.08, recoilY: 0.01, rotX: 0.06, recovery: 20, kickSpeed: 50 },
    sniper: { recoilZ: 0.40, recoilY: 0.10, rotX: 0.25, recovery: 8,  kickSpeed: 25 }
  };

  useEffect(() => {
    // Initialize the camera tracking
    prevRotation.current.copy(camera.rotation);
  }, [camera]);

  useFrame((_, dt) => {
    if (!gunContainerRef.current || !gunModelRef.current) return;

    // 1. Lock the outer container strictly to the camera's position and rotation
    gunContainerRef.current.position.copy(camera.position);
    gunContainerRef.current.quaternion.copy(camera.quaternion);

    const stats = weaponProfiles[weaponClass] || weaponProfiles.pistol;

    // 2. Detect Shot Fired -> Add Kickback
    if (shots !== prevShots.current) {
      recoilTarget.current.z += stats.recoilZ;
      recoilTarget.current.y += stats.recoilY;
      recoilRotTarget.current += stats.rotX;
      prevShots.current = shots;
    }

    // 3. Recoil Recovery (Spring back to resting position)
    recoilTarget.current.lerp(new THREE.Vector3(0, 0, 0), dt * stats.recovery);
    recoilRotTarget.current = THREE.MathUtils.lerp(recoilRotTarget.current, 0, dt * stats.recovery);

    // Apply the fast punch & smooth recovery to the current visual model
    currentRecoil.current.lerp(recoilTarget.current, dt * stats.kickSpeed);
    currentRecoilRot.current = THREE.MathUtils.lerp(currentRecoilRot.current, recoilRotTarget.current, dt * stats.kickSpeed);

    // 4. Weapon Sway (Lags behind your crosshair to simulate weight)
    const deltaX = camera.rotation.y - prevRotation.current.y;
    const deltaY = camera.rotation.x - prevRotation.current.x;

    // Clamp the sway so the gun doesn't fly off the screen during massive flicks
    swayTarget.current.x = THREE.MathUtils.clamp(deltaX * 0.6, -0.15, 0.15);
    swayTarget.current.y = THREE.MathUtils.clamp(deltaY * 0.6, -0.15, 0.15);

    // Smooth the sway movement
    currentSway.current.lerp(swayTarget.current, dt * 15);
    
    // Decay sway back to center
    swayTarget.current.lerp(new THREE.Vector3(0, 0, 0), dt * 10);

    // Save camera rotation for next frame's comparison
    prevRotation.current.copy(camera.rotation);

    // 5. Idle Breathing Animation (Slow sine waves)
    time.current += dt;
    const idleY = Math.sin(time.current * 2) * 0.003;
    const idleX = Math.cos(time.current * 1.5) * 0.003;

    // 6. Apply all calculations to the Gun Model (Local Space relative to camera)
    
    // Base position (Tucked nicely in the bottom right)
    const baseX = 0.35;
    const baseY = -0.35;
    const baseZ = -0.7;

    // Position = Base + Recoil + Sway + Idle
    gunModelRef.current.position.set(
      baseX + currentSway.current.x + idleX,
      baseY + currentRecoil.current.y + currentSway.current.y + idleY,
      baseZ + currentRecoil.current.z
    );

    // Rotation = Base + Recoil Upwards + Sway Banking
    gunModelRef.current.rotation.set(
      currentRecoilRot.current,
      currentSway.current.x * -1.5, // Yaw slightly inward on turns
      currentSway.current.x * -1.0  // Roll slightly on turns
    );
  });

  // Adaptive aesthetics based on settings
  const bodyColor = mapTheme === 'minimal' ? '#444444' : '#141414';
  const metallicVal = mapTheme === 'cyber' ? 0.8 : 0.3;

  return (
    // Outer container locked perfectly to camera
    <group ref={gunContainerRef}>
      
      {/* Inner model getting bumped around by recoil and sway */}
      <group ref={gunModelRef}>
        
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.07, 0.09, 0.3]} />
          <meshStandardMaterial color={bodyColor} metalness={metallicVal} roughness={0.4} />
        </mesh>

        {/* Barrel */}
        <mesh position={[0, 0.015, -0.2]}>
          <boxGeometry args={[0.045, 0.045, 0.25]} />
          <meshStandardMaterial color={bodyColor} metalness={metallicVal + 0.2} roughness={0.3} />
        </mesh>

        {/* Grip */}
        <mesh position={[0, -0.1, 0.08]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.045, 0.14, 0.065]} />
          <meshStandardMaterial color="#080808" roughness={0.9} />
        </mesh>

        {/* Iron Sights (Glowing Accent) */}
        <mesh position={[0, 0.055, 0.08]}>
          <boxGeometry args={[0.01, 0.01, 0.08]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        
        {/* Barrel Glow Ring (Aim Labs visual cue) */}
        <mesh position={[0, 0.015, -0.3]}>
          <boxGeometry args={[0.05, 0.05, 0.015]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
        </mesh>

      </group>
    </group>
  );
}