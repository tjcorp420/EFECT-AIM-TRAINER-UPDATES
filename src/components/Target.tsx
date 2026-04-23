import { useRef, Suspense, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber'; 
import { useGLTF } from '@react-three/drei';
import { useStore, playHitSound } from '../store/useStore';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

function FortniteSkin({ color, skinMode }: { color: string, skinMode: string }) {
  const { scene } = useGLTF('/fortnite_skin.glb') as any; 
  const cloned = useMemo(() => SkeletonUtils.clone(scene as any), [scene]);
  
  useEffect(() => {
    cloned.traverse((o: any) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        if (skinMode === 'custom') {
          o.material = new THREE.MeshStandardMaterial({ 
            color, 
            emissive: color, 
            emissiveIntensity: 1.5 
          });
        }
      }
    });
  }, [cloned, color, skinMode]);
  
  return <primitive object={cloned as any} scale={[0.018, 0.018, 0.018]} position={[0, -1.2, 0]} />;
}

const BUSY = new Set<number>();
let spidershotCenter = true; 

export default function Target() {
  const { 
    registerHit, resetCombo, gameState, targetShape, targetColor, 
    targetSkinMode, modelScale, scenario, targetDistance, targetSpeed 
  } = useStore();
  
  const targetGroup = useRef<any>(null);
  const modelGroup = useRef<any>(null);
  const explosionGroup = useRef<any>(null);
  const healthBarRef = useRef<any>(null);
  
  const isAlive = useRef(true);
  const isExploding = useRef(false);
  const slotIndex = useRef<number | null>(null);
  const age = useRef(0);
  const lastTickTime = useRef(0); 
  
  const velocityY = useRef(0);
  const strafeDirection = useRef(Math.random() > 0.5 ? 1 : -1);
  const strafeSpeed = useRef((Math.random() * 4) + 4); 
  const nextDirChange = useRef(0); 
  const motionDrift = useRef(new THREE.Vector3(0, 0, 0)); 
  
  // NEW: Ground tracking for the Evasion AI jump mechanics
  const baseY = useRef(0); 
  
  const isHovered = useRef(false);
  const health = useRef(100);
  
  const explosionMat = useRef<any>(new THREE.MeshStandardMaterial({ 
    color: targetColor, 
    emissive: targetColor, 
    emissiveIntensity: 3, 
    transparent: true, 
    opacity: 1 
  }));

  const isPrecision = scenario.includes('micro') || scenario.includes('precision') || scenario.includes('small') || scenario.includes('snipershot');
  const activeScale = isPrecision ? modelScale * 0.35 : (scenario.includes('gridshot_ultimate') ? modelScale * 0.8 : modelScale);
  
  const isTrackingMode = scenario.includes('tracking') && !scenario.includes('flick360');
  const isPopcorn = scenario.includes('popcorn');
  const isBounce = scenario.includes('bounce');
  const isGlider = scenario.includes('glider');
  const isMotionshot = scenario.includes('motionshot');
  const is360 = scenario.includes('360');
  const isReact = scenario.includes('react') || scenario.includes('reflex') || scenario.includes('rapid');

  const respawn = (silent = false) => {
    if (slotIndex.current !== null) {
      BUSY.delete(slotIndex.current);
      slotIndex.current = null;
    }
    
    let x = 0; let y = 0; let z = targetDistance;

    if (scenario.includes('spidershot')) {
      if (spidershotCenter) {
        x = 0; y = 1.5; z = targetDistance;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = scenario.includes('180') ? 14 + Math.random() * 4 : 6 + Math.random() * 4; 
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius + 1.5;
        z = targetDistance;
      }
      spidershotCenter = !spidershotCenter;

    } else if (scenario.includes('gridshot') || scenario.includes('pump_flick') || scenario === 'microflick_standard') {
      const isPump = scenario.includes('pump_flick');
      const cols = isPump ? 5 : 5; // Use wider grid for pump
      const maxSlots = isPump ? 15 : 20; 
      
      let picked = Math.floor(Math.random() * maxSlots);
      while (BUSY.has(picked)) picked = Math.floor(Math.random() * maxSlots);
      BUSY.add(picked);
      slotIndex.current = picked;

      const col = (picked % cols) - Math.floor(cols / 2); 
      const row = Math.floor(picked / cols); 
      
      // FIX: Pump targets spawn massive, close up, and wrap around the screen.
      if (isPump) {
        const spacing = 3.5 * modelScale; 
        x = col * spacing;
        y = (row * spacing) + 0.5 + modelScale;
        z = targetDistance + 12; // PULLS THEM DIRECTLY IN FRONT OF THE CAMERA
      } else {
        const spacing = 2.5 * modelScale; 
        x = col * spacing;
        y = (row * spacing) + 1.2 + modelScale;
        z = targetDistance; 
      } 
      
    } else if (is360) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 5; 
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius; 
      y = (Math.random() * 6) + 1;

    } else if (scenario.includes('snipershot')) {
      x = (Math.random() - 0.5) * 20; 
      y = (Math.random() * 8) + 1; 
      z = targetDistance - 25; 

    } else if (isGlider) {
      const side = Math.random() > 0.5 ? 1 : -1;
      x = 16 * side; y = 8 + Math.random() * 4; z = targetDistance + (Math.random() * 4 - 2);
      strafeDirection.current = -side; 
      strafeSpeed.current = 5 + Math.random() * 3; 

    } else if (isBounce) {
      x = (Math.random() - 0.5) * 14; y = 1.0; z = targetDistance + (Math.random() * 6 - 3);
      velocityY.current = 18 + Math.random() * 6; 
      
    } else if (scenario.includes('cluster')) {
      x = (Math.random() - 0.5) * 4; 
      y = (Math.random() * 3) + 2; 
      z = targetDistance;

    } else {
      x = (Math.random() - 0.5) * 16; 
      y = (Math.random() * 6) + 2;    
      z = targetDistance + ((Math.random() * 10) - 5);
      
      if (isPopcorn) {
        velocityY.current = scenario.includes('heavy') ? 25 + Math.random() * 5 : 15 + Math.random() * 10;
      }
    }
    
    if (isMotionshot) {
      const driftSpeed = scenario.includes('fast') ? 10 : 5;
      motionDrift.current.set((Math.random() - 0.5) * driftSpeed, (Math.random() - 0.5) * driftSpeed, 0);
    }

    if (!isGlider && !isMotionshot) {
      strafeDirection.current = Math.random() > 0.5 ? 1 : -1;
      if (scenario.includes('tracking_smooth')) {
        strafeSpeed.current = 3 + Math.random() * 2; 
        nextDirChange.current = Math.random() * 3 + 2; 
      } else if (scenario.includes('tracking_fast')) {
        strafeSpeed.current = 8 + Math.random() * 4; 
        nextDirChange.current = Math.random() * 0.5 + 0.2; 
      } else {
        strafeSpeed.current = 4 + Math.random() * 4; 
        nextDirChange.current = Math.random() * 1.5 + 0.5;
      }
    }
    
    if (targetGroup.current) {
      targetGroup.current.position.set(x, y, z);
      baseY.current = y; // Lock in the ground level for this spawn
    }
    
    health.current = 100;
    isHovered.current = false;
    isAlive.current = true;
    isExploding.current = false;
    age.current = 0;
    
    if (healthBarRef.current) healthBarRef.current.scale.x = 1; 
    if (modelGroup.current) {
      modelGroup.current.visible = true;
      modelGroup.current.scale.setScalar(activeScale); 
    }
    if (explosionGroup.current) explosionGroup.current.visible = false;
    if (silent && !isTrackingMode) resetCombo();
  };

  useEffect(() => {
    if (gameState === 'playing') { 
      BUSY.clear(); 
      spidershotCenter = true; 
      respawn(); 
    }
  }, [gameState]);

  const onHit = () => {
    if (!isAlive.current || useStore.getState().shots === 0) return;
    isAlive.current = false;
    
    let points = 100;
    if (!isTrackingMode) {
      points = Math.max(100, Math.floor(1000 - (age.current * 800)));
    } else {
      points = 10; 
    }
    
    registerHit(points);
    window.dispatchEvent(new CustomEvent('hit-marker'));

    const storeState = useStore.getState();
    let textX = window.innerWidth / 2 + (Math.random() * 40 - 20);
    let textY = window.innerHeight / 2 + (Math.random() * 40 - 20);

    if (!isTrackingMode || storeState.combo % 10 === 0) {
      const displayTxt = isTrackingMode ? 'TRACKING' : `+${points}`;
      window.dispatchEvent(new CustomEvent('floating-text', { 
        detail: { text: displayTxt, x: textX, y: textY, color: storeState.color } 
      }));
    }

    if (!isTrackingMode && !isPopcorn && !isBounce) {
      respawn(); 
    } else {
      isExploding.current = true;
      explosionMat.current.opacity = 1;
      if (modelGroup.current) modelGroup.current.visible = false;
      if (explosionGroup.current) explosionGroup.current.visible = true;
    }
  };

  useFrame((_, dt) => {
    if (gameState !== 'playing' || !targetGroup.current || useStore.getState().shots === 0) return;
    
    const adjustedDt = dt * (targetSpeed || 1);

    if (isExploding.current) {
      explosionMat.current.opacity -= 0.05;
      if (explosionMat.current.opacity <= 0) respawn();
      return;
    }
    
    if (!isAlive.current) return;
    age.current += adjustedDt;

    // PHYSICS FLOOR GUARD
    if (targetGroup.current.position.y < 0.8 && (isBounce || isPopcorn)) {
      targetGroup.current.position.y = 0.8;
      velocityY.current = Math.abs(velocityY.current) * 0.7;
      if (velocityY.current < 2) respawn(true);
    } else if (targetGroup.current.position.y < -5) {
      respawn(true); // Failsafe for falling off map
    }

    if (isReact) {
      const timeLimit = scenario.includes('micro') ? 0.7 : 1.1;
      if (age.current > timeLimit) {
        respawn(true); 
        return;
      }
    }

    // GRAVITY PHYSICS (Popcorn/Bounce)
    if (isPopcorn || isBounce) {
      const grav = scenario.includes('heavy') ? 50 : 35;
      velocityY.current -= adjustedDt * grav; 
      targetGroup.current.position.y += velocityY.current * adjustedDt;
    }

    // MOTION DRIFT
    if (isMotionshot) {
      targetGroup.current.position.addScaledVector(motionDrift.current, adjustedDt);
      if (Math.abs(targetGroup.current.position.x) > 18 || targetGroup.current.position.y > 12) respawn(true);
    }

    // GLIDER
    if (isGlider) {
      targetGroup.current.position.x += strafeDirection.current * strafeSpeed.current * adjustedDt;
      targetGroup.current.position.y -= adjustedDt * 1.5; 
      if (Math.abs(targetGroup.current.position.x) > 18) respawn(true);
    }

    // --- PHASE 2: ADVANCED STRAFING & EVASION JUMPS ---
    if (scenario.includes('strafe') || (isTrackingMode && !isGlider && !isBounce && !is360)) {
      targetGroup.current.position.x += strafeDirection.current * strafeSpeed.current * adjustedDt;
      
      // A/D Spam logic
      if (age.current > nextDirChange.current) {
        strafeDirection.current *= -1;
        if (scenario.includes('tracking_smooth')) nextDirChange.current = age.current + Math.random() * 3 + 2;
        else if (scenario.includes('tracking_fast')) nextDirChange.current = age.current + Math.random() * 0.5 + 0.2;
        else nextDirChange.current = age.current + Math.random() * 1.5 + 0.5;
      }
      
      // Wall Bounce
      if (targetGroup.current.position.x > 14 || targetGroup.current.position.x < -14) {
        strafeDirection.current *= -1;
        targetGroup.current.position.x = targetGroup.current.position.x > 14 ? 13.9 : -13.9; 
      }

      // Evasive Jumping / Crouch Spam
      if (scenario.includes('dynamic')) {
        // Trigger Jump
        if (targetGroup.current.position.y <= baseY.current && Math.random() < 0.015) {
          velocityY.current = 12 + Math.random() * 6; 
        }
        
        // Apply Jump Physics
        if (targetGroup.current.position.y > baseY.current || velocityY.current > 0) {
          velocityY.current -= adjustedDt * 35; // Gravity pull
          targetGroup.current.position.y += velocityY.current * adjustedDt;
          
          // Landing
          if (targetGroup.current.position.y <= baseY.current) {
            targetGroup.current.position.y = baseY.current;
            velocityY.current = 0;
          }
        }
      }
    }

    // TRACKING DAMAGE TICKER
    if (isTrackingMode) {
      const isFiring = useStore.getState().isFiring;

      if (isHovered.current && isFiring) {
        health.current -= dt * 50; 
        if (age.current - lastTickTime.current > 0.1) {
          playHitSound(useStore.getState().hitSound);
          window.dispatchEvent(new CustomEvent('hit-marker'));
          lastTickTime.current = age.current;
        }
        if (healthBarRef.current) healthBarRef.current.scale.x = Math.max(0.001, health.current / 100);
        if (health.current <= 0) onHit();
      } else if (health.current < 100) {
        health.current = Math.min(100, health.current + dt * 20);
        if (healthBarRef.current) healthBarRef.current.scale.x = Math.max(0.001, health.current / 100);
      }
    }
  });

  return (
    <group ref={targetGroup}>
      <group ref={explosionGroup} visible={false}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} material={explosionMat.current}>
            <tetrahedronGeometry args={[0.2]} />
          </mesh>
        ))}
      </group>
      
      <group ref={modelGroup} scale={[activeScale, activeScale, activeScale]}>
        {isTrackingMode && (
          <group position={[0, targetShape === 'humanoid' ? 2.5 : 1.5, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.5, 0.2]} />
              <meshBasicMaterial color="#550000" depthTest={false} />
            </mesh>
            <mesh ref={healthBarRef} position={[0, 0, 0]}>
              <planeGeometry args={[1.5, 0.2]} />
              <meshBasicMaterial color="#00ff00" depthTest={false} />
            </mesh>
          </group>
        )}

        <mesh 
          position={targetShape === 'humanoid' ? [0, 0.5, 0] : [0, 0, 0]}
          onClick={(e: any) => {
            e.stopPropagation(); 
            if (!isTrackingMode) onHit();
          }}
          onPointerOver={(e: any) => { 
            e.stopPropagation();
            isHovered.current = true; 
          }}
          onPointerOut={() => { 
            isHovered.current = false; 
          }}
        >
          {targetShape === 'humanoid' ? (
            <capsuleGeometry args={[0.8, 2.2, 4, 16]} />
          ) : targetShape === 'cube' ? (
            <boxGeometry args={[2.2, 2.2, 2.2]} />
          ) : (
            <sphereGeometry args={[1.3]} />
          )}
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* VISUAL MESH UPGRADE: Spheres and Cubes correctly render */}
        <group raycast={(() => null) as any}>
          {targetShape === 'humanoid' ? (
            <Suspense fallback={null}>
              <FortniteSkin color={targetColor} skinMode={targetSkinMode} />
            </Suspense>
          ) : targetShape === 'sphere' ? (
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color={targetColor} emissive={targetColor} emissiveIntensity={1.5} />
            </mesh>
          ) : (
            <mesh>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial color={targetColor} emissive={targetColor} emissiveIntensity={1.5} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}