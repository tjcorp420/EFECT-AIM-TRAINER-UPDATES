import { useRef, Suspense, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useStore, playHitSound } from '../store/useStore';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

const BUSY = new Set<number>();
let spidershotCenter = true;

const NO_RAYCAST = (() => null) as any;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeOutCubic = (value: number) => {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
};

function FortniteSkin({ color, skinMode }: { color: string; skinMode: string }) {
  const { scene } = useGLTF('/fortnite_skin.glb') as any;
  const cloned = useMemo(() => SkeletonUtils.clone(scene as any), [scene, skinMode]);

  useEffect(() => {
    cloned.traverse((o: any) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = true;
        o.receiveShadow = true;

        if (skinMode === 'custom') {
          o.material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 1.5,
            roughness: 0.45,
            metalness: 0.12,
          });
        }
      }
    });
  }, [cloned, color, skinMode]);

  return (
    <primitive
      object={cloned as any}
      scale={[0.018, 0.018, 0.018]}
      position={[0, -1.2, 0]}
    />
  );
}

export default function Target() {
  const {
    registerHit,
    resetCombo,
    gameState,
    targetShape,
    targetColor,
    targetSkinMode,
    modelScale,
    scenario,
    targetDistance,
    targetSpeed,
  } = useStore();

  const targetGroup = useRef<any>(null);
  const modelGroup = useRef<any>(null);
  const explosionGroup = useRef<any>(null);
  const healthBarRef = useRef<any>(null);

  const spawnRingRef = useRef<any>(null);
  const spawnCoreRef = useRef<any>(null);
  const detachedBurstGroup = useRef<any>(null);

  const isAlive = useRef(true);
  const isExploding = useRef(false);
  const slotIndex = useRef<number | null>(null);
  const age = useRef(0);
  const spawnAge = useRef(999);
  const explosionAge = useRef(0);
  const detachedBurstAge = useRef(999);
  const lastTickTime = useRef(0);

  const velocityY = useRef(0);
  const strafeDirection = useRef(Math.random() > 0.5 ? 1 : -1);
  const strafeSpeed = useRef(Math.random() * 4 + 4);
  const nextDirChange = useRef(0);
  const motionDrift = useRef(new THREE.Vector3(0, 0, 0));

  const baseY = useRef(0);

  const isHovered = useRef(false);
  const health = useRef(100);

  const explosionMat = useRef(
    new THREE.MeshBasicMaterial({
      color: targetColor,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );

  const spawnRingMat = useRef(
    new THREE.MeshBasicMaterial({
      color: targetColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );

  const spawnCoreMat = useRef(
    new THREE.MeshBasicMaterial({
      color: targetColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );

  const detachedBurstMat = useRef(
    new THREE.MeshBasicMaterial({
      color: targetColor,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  );

  const explosionSeeds = useMemo(() => {
    return Array.from({ length: 10 }).map(() => {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() * 0.7 + 0.1,
        Math.random() - 0.5
      ).normalize();

      return {
        dir,
        spin: (Math.random() - 0.5) * 7,
        size: 0.07 + Math.random() * 0.08,
      };
    });
  }, []);

  const detachedBurstSeeds = useMemo(() => {
    return Array.from({ length: 14 }).map(() => {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.15,
        Math.random() - 0.5
      ).normalize();

      return {
        dir,
        spin: (Math.random() - 0.5) * 10,
        size: 0.035 + Math.random() * 0.045,
        distance: 0.22 + Math.random() * 0.55,
      };
    });
  }, []);

  const isPrecision =
    scenario.includes('micro') ||
    scenario.includes('precision') ||
    scenario.includes('small') ||
    scenario.includes('snipershot');

  const activeScale = isPrecision
    ? modelScale * 0.35
    : scenario.includes('gridshot_ultimate')
      ? modelScale * 0.8
      : modelScale;

  const isTrackingMode = scenario.includes('tracking') && !scenario.includes('flick360');
  const isPopcorn = scenario.includes('popcorn');
  const isBounce = scenario.includes('bounce');
  const isGlider = scenario.includes('glider');
  const isMotionshot = scenario.includes('motionshot');
  const is360 = scenario.includes('360');
  const isReact =
    scenario.includes('react') || scenario.includes('reflex') || scenario.includes('rapid');

  useEffect(() => {
    const mats = [
      explosionMat.current,
      spawnRingMat.current,
      spawnCoreMat.current,
      detachedBurstMat.current,
    ];

    mats.forEach((mat) => {
      mat.color.set(targetColor);
      mat.needsUpdate = true;
    });
  }, [targetColor]);

  const triggerDetachedBurst = () => {
    if (!targetGroup.current || !detachedBurstGroup.current) return;

    const worldPos = new THREE.Vector3();
    targetGroup.current.getWorldPosition(worldPos);

    detachedBurstGroup.current.position.copy(worldPos);
    detachedBurstGroup.current.visible = true;
    detachedBurstAge.current = 0;

    detachedBurstMat.current.opacity = 0.75;

    detachedBurstGroup.current.children.forEach((child: any, index: number) => {
      const seed = detachedBurstSeeds[index % detachedBurstSeeds.length];

      child.position.set(0, 0, 0);
      child.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      child.scale.setScalar(seed.size);
      child.visible = true;
    });
  };

  const respawn = (silent = false) => {
    if (slotIndex.current !== null) {
      BUSY.delete(slotIndex.current);
      slotIndex.current = null;
    }

    let x = 0;
    let y = 0;
    let z = targetDistance;

    if (scenario.includes('spidershot')) {
      if (spidershotCenter) {
        x = 0;
        y = 1.5;
        z = targetDistance;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = scenario.includes('180') ? 14 + Math.random() * 4 : 6 + Math.random() * 4;

        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius + 1.5;
        z = targetDistance;
      }

      spidershotCenter = !spidershotCenter;
    } else if (
      scenario.includes('gridshot') ||
      scenario.includes('pump_flick') ||
      scenario === 'microflick_standard'
    ) {
      const isPump = scenario.includes('pump_flick');
      const cols = isPump ? 5 : 5;
      const maxSlots = isPump ? 15 : 20;

      let picked = Math.floor(Math.random() * maxSlots);

      while (BUSY.has(picked)) {
        picked = Math.floor(Math.random() * maxSlots);
      }

      BUSY.add(picked);
      slotIndex.current = picked;

      const col = picked % cols - Math.floor(cols / 2);
      const row = Math.floor(picked / cols);

      if (isPump) {
        const spacing = 3.5 * modelScale;

        x = col * spacing;
        y = row * spacing + 0.5 + modelScale;
        z = targetDistance + 12;
      } else {
        const spacing = 2.5 * modelScale;

        x = col * spacing;
        y = row * spacing + 1.2 + modelScale;
        z = targetDistance;
      }
    } else if (is360) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 5;

      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = Math.random() * 6 + 1;
    } else if (scenario.includes('snipershot')) {
      x = (Math.random() - 0.5) * 20;
      y = Math.random() * 8 + 1;
      z = targetDistance - 25;
    } else if (isGlider) {
      const side = Math.random() > 0.5 ? 1 : -1;

      x = 16 * side;
      y = 8 + Math.random() * 4;
      z = targetDistance + (Math.random() * 4 - 2);
      strafeDirection.current = -side;
      strafeSpeed.current = 5 + Math.random() * 3;
    } else if (isBounce) {
      x = (Math.random() - 0.5) * 14;
      y = 1.0;
      z = targetDistance + (Math.random() * 6 - 3);
      velocityY.current = 18 + Math.random() * 6;
    } else if (scenario.includes('cluster')) {
      x = (Math.random() - 0.5) * 4;
      y = Math.random() * 3 + 2;
      z = targetDistance;
    } else {
      x = (Math.random() - 0.5) * 16;
      y = Math.random() * 6 + 2;
      z = targetDistance + (Math.random() * 10 - 5);

      if (isPopcorn) {
        velocityY.current = scenario.includes('heavy')
          ? 25 + Math.random() * 5
          : 15 + Math.random() * 10;
      }
    }

    if (isMotionshot) {
      const driftSpeed = scenario.includes('fast') ? 10 : 5;

      motionDrift.current.set(
        (Math.random() - 0.5) * driftSpeed,
        (Math.random() - 0.5) * driftSpeed,
        0
      );
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
      baseY.current = y;
    }

    health.current = 100;
    isHovered.current = false;
    isAlive.current = true;
    isExploding.current = false;
    age.current = 0;
    spawnAge.current = 0;
    explosionAge.current = 0;
    lastTickTime.current = 0;

    if (healthBarRef.current) {
      healthBarRef.current.scale.x = 1;
    }

    if (modelGroup.current) {
      modelGroup.current.visible = true;
      modelGroup.current.scale.setScalar(activeScale * 0.82);
    }

    if (explosionGroup.current) {
      explosionGroup.current.visible = false;
    }

    if (spawnRingRef.current) {
      spawnRingRef.current.visible = true;
      spawnRingRef.current.scale.setScalar(0.45);
      spawnRingRef.current.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }

    if (spawnCoreRef.current) {
      spawnCoreRef.current.visible = true;
      spawnCoreRef.current.scale.setScalar(0.75);
    }

    spawnRingMat.current.opacity = 0.58;
    spawnCoreMat.current.opacity = 0.22;
    explosionMat.current.opacity = 0.9;

    if (silent && !isTrackingMode) {
      resetCombo();
    }
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
    triggerDetachedBurst();

    let points = 100;

    if (!isTrackingMode) {
      points = Math.max(100, Math.floor(1000 - age.current * 800));
    } else {
      points = 10;
    }

    registerHit(points);
    window.dispatchEvent(new CustomEvent('hit-marker'));

    const storeState = useStore.getState();
    const textX = window.innerWidth / 2 + (Math.random() * 40 - 20);
    const textY = window.innerHeight / 2 + (Math.random() * 40 - 20);

    if (!isTrackingMode || storeState.combo % 10 === 0) {
      const displayTxt = isTrackingMode ? 'TRACKING' : `+${points}`;

      window.dispatchEvent(
        new CustomEvent('floating-text', {
          detail: {
            text: displayTxt,
            x: textX,
            y: textY,
            color: storeState.color,
          },
        })
      );
    }

    if (!isTrackingMode && !isPopcorn && !isBounce) {
      respawn();
    } else {
      isExploding.current = true;
      explosionAge.current = 0;
      explosionMat.current.opacity = 0.9;

      if (modelGroup.current) {
        modelGroup.current.visible = false;
      }

      if (explosionGroup.current) {
        explosionGroup.current.visible = true;
        explosionGroup.current.scale.setScalar(activeScale * 0.55);
      }
    }
  };

  const updateDetachedBurst = (dt: number) => {
    if (!detachedBurstGroup.current || !detachedBurstGroup.current.visible) return;

    detachedBurstAge.current += dt;

    const progress = clamp01(detachedBurstAge.current / 0.34);
    const eased = easeOutCubic(progress);
    const opacity = (1 - progress) * 0.75;

    detachedBurstMat.current.opacity = opacity;

    detachedBurstGroup.current.children.forEach((child: any, index: number) => {
      const seed = detachedBurstSeeds[index % detachedBurstSeeds.length];
      const distance = seed.distance * eased;

      child.position.set(seed.dir.x * distance, seed.dir.y * distance, seed.dir.z * distance);

      child.rotation.x += dt * seed.spin;
      child.rotation.y += dt * seed.spin * 0.7;
      child.scale.setScalar(Math.max(0.001, seed.size * (1 - progress * 0.5)));
    });

    if (progress >= 1) {
      detachedBurstGroup.current.visible = false;
      detachedBurstMat.current.opacity = 0;
    }
  };

  const updateSpawnVfx = (dt: number) => {
    if (!targetGroup.current) return;

    spawnAge.current += dt;

    const progress = clamp01(spawnAge.current / 0.34);
    const eased = easeOutCubic(progress);

    if (spawnAge.current <= 0.34) {
      if (spawnRingRef.current) {
        spawnRingRef.current.visible = true;
        spawnRingRef.current.scale.setScalar(0.42 + eased * 1.28);

        // IMPORTANT: keep ring flat. Spin on Y/world-up, not Z.
        spawnRingRef.current.rotation.x = 0;
        spawnRingRef.current.rotation.z = 0;
        spawnRingRef.current.rotation.y += dt * 2.2;
      }

      if (spawnCoreRef.current) {
        spawnCoreRef.current.visible = true;
        spawnCoreRef.current.scale.setScalar(0.7 + eased * 0.38);
        spawnCoreRef.current.rotation.y += dt * 3.0;
      }

      spawnRingMat.current.opacity = (1 - progress) * 0.58;
      spawnCoreMat.current.opacity = (1 - progress) * 0.22;

      if (modelGroup.current && modelGroup.current.visible) {
        modelGroup.current.scale.setScalar(activeScale * (0.78 + eased * 0.22));
      }
    } else {
      if (spawnRingRef.current) {
        spawnRingRef.current.visible = false;
      }

      if (spawnCoreRef.current) {
        spawnCoreRef.current.visible = false;
      }

      spawnRingMat.current.opacity = 0;
      spawnCoreMat.current.opacity = 0;

      if (modelGroup.current && modelGroup.current.visible) {
        modelGroup.current.scale.setScalar(activeScale);
      }
    }
  };

  useFrame((_, dt) => {
    updateDetachedBurst(dt);

    if (gameState !== 'playing' || !targetGroup.current) return;

    updateSpawnVfx(dt);

    if (useStore.getState().shots === 0) return;

    const adjustedDt = dt * (targetSpeed || 1);

    if (isExploding.current) {
      explosionAge.current += dt;

      const progress = clamp01(explosionAge.current / 0.26);
      const eased = easeOutCubic(progress);

      explosionMat.current.opacity = (1 - progress) * 0.9;

      if (explosionGroup.current) {
        explosionGroup.current.children.forEach((child: any, index: number) => {
          const seed = explosionSeeds[index % explosionSeeds.length];
          const distance = 0.08 + eased * 0.58;

          child.position.set(seed.dir.x * distance, seed.dir.y * distance, seed.dir.z * distance);

          child.rotation.x += dt * seed.spin;
          child.rotation.y += dt * seed.spin * 0.65;
          child.scale.setScalar(Math.max(0.001, seed.size * activeScale * (1 - progress * 0.35)));
        });
      }

      if (explosionMat.current.opacity <= 0.01) {
        respawn();
      }

      return;
    }

    if (!isAlive.current) return;

    age.current += adjustedDt;

    if (targetGroup.current.position.y < 0.8 && (isBounce || isPopcorn)) {
      targetGroup.current.position.y = 0.8;
      velocityY.current = Math.abs(velocityY.current) * 0.7;

      if (velocityY.current < 2) {
        respawn(true);
      }
    } else if (targetGroup.current.position.y < -5) {
      respawn(true);
    }

    if (isReact) {
      const timeLimit = scenario.includes('micro') ? 0.7 : 1.1;

      if (age.current > timeLimit) {
        respawn(true);
        return;
      }
    }

    if (isPopcorn || isBounce) {
      const grav = scenario.includes('heavy') ? 50 : 35;

      velocityY.current -= adjustedDt * grav;
      targetGroup.current.position.y += velocityY.current * adjustedDt;
    }

    if (isMotionshot) {
      targetGroup.current.position.addScaledVector(motionDrift.current, adjustedDt);

      if (Math.abs(targetGroup.current.position.x) > 18 || targetGroup.current.position.y > 12) {
        respawn(true);
      }
    }

    if (isGlider) {
      targetGroup.current.position.x += strafeDirection.current * strafeSpeed.current * adjustedDt;
      targetGroup.current.position.y -= adjustedDt * 1.5;

      if (Math.abs(targetGroup.current.position.x) > 18) {
        respawn(true);
      }
    }

    if (scenario.includes('strafe') || (isTrackingMode && !isGlider && !isBounce && !is360)) {
      targetGroup.current.position.x += strafeDirection.current * strafeSpeed.current * adjustedDt;

      if (age.current > nextDirChange.current) {
        strafeDirection.current *= -1;

        if (scenario.includes('tracking_smooth')) {
          nextDirChange.current = age.current + Math.random() * 3 + 2;
        } else if (scenario.includes('tracking_fast')) {
          nextDirChange.current = age.current + Math.random() * 0.5 + 0.2;
        } else {
          nextDirChange.current = age.current + Math.random() * 1.5 + 0.5;
        }
      }

      if (targetGroup.current.position.x > 14 || targetGroup.current.position.x < -14) {
        strafeDirection.current *= -1;
        targetGroup.current.position.x = targetGroup.current.position.x > 14 ? 13.9 : -13.9;
      }

      if (scenario.includes('dynamic')) {
        if (targetGroup.current.position.y <= baseY.current && Math.random() < 0.015) {
          velocityY.current = 12 + Math.random() * 6;
        }

        if (targetGroup.current.position.y > baseY.current || velocityY.current > 0) {
          velocityY.current -= adjustedDt * 35;
          targetGroup.current.position.y += velocityY.current * adjustedDt;

          if (targetGroup.current.position.y <= baseY.current) {
            targetGroup.current.position.y = baseY.current;
            velocityY.current = 0;
          }
        }
      }
    }

    if (isTrackingMode) {
      const isFiring = useStore.getState().isFiring;

      if (isHovered.current && isFiring) {
        health.current -= dt * 50;

        if (age.current - lastTickTime.current > 0.1) {
          playHitSound(useStore.getState().hitSound);
          window.dispatchEvent(new CustomEvent('hit-marker'));
          lastTickTime.current = age.current;
        }

        if (healthBarRef.current) {
          healthBarRef.current.scale.x = Math.max(0.001, health.current / 100);
        }

        if (health.current <= 0) {
          onHit();
        }
      } else if (health.current < 100) {
        health.current = Math.min(100, health.current + dt * 20);

        if (healthBarRef.current) {
          healthBarRef.current.scale.x = Math.max(0.001, health.current / 100);
        }
      }
    }
  });

  return (
    <>
      <group ref={detachedBurstGroup} visible={false}>
        {detachedBurstSeeds.map((_, index) => (
          <mesh
            key={`detached-burst-${index}`}
            material={detachedBurstMat.current}
            raycast={NO_RAYCAST}
          >
            <tetrahedronGeometry args={[1]} />
          </mesh>
        ))}
      </group>

      <group ref={targetGroup}>
        <group ref={explosionGroup} visible={false}>
          {explosionSeeds.map((_, index) => (
            <mesh
              key={`explosion-${index}`}
              material={explosionMat.current}
              raycast={NO_RAYCAST}
            >
              <tetrahedronGeometry args={[1]} />
            </mesh>
          ))}
        </group>

        <group
          ref={spawnRingRef}
          visible={false}
          position={[0, targetShape === 'humanoid' ? -1.05 : -0.9, 0]}
        >
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            material={spawnRingMat.current}
            raycast={NO_RAYCAST}
          >
            <torusGeometry args={[1.1, 0.027, 10, 72]} />
          </mesh>

          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            material={spawnRingMat.current}
            raycast={NO_RAYCAST}
          >
            <torusGeometry args={[0.62, 0.016, 8, 56]} />
          </mesh>
        </group>

        <group ref={spawnCoreRef} visible={false}>
          <mesh material={spawnCoreMat.current} raycast={NO_RAYCAST}>
            <icosahedronGeometry args={[1.08, 1]} />
          </mesh>
        </group>

        <group ref={modelGroup} scale={[activeScale, activeScale, activeScale]}>
          {isTrackingMode && (
            <group position={[0, targetShape === 'humanoid' ? 2.5 : 1.5, 0]}>
              <mesh position={[0, 0, -0.01]} raycast={NO_RAYCAST}>
                <planeGeometry args={[1.5, 0.2]} />
                <meshBasicMaterial color="#550000" depthTest={false} />
              </mesh>

              <mesh ref={healthBarRef} position={[0, 0, 0]} raycast={NO_RAYCAST}>
                <planeGeometry args={[1.5, 0.2]} />
                <meshBasicMaterial color="#00ff00" depthTest={false} />
              </mesh>
            </group>
          )}

          <mesh
            position={targetShape === 'humanoid' ? [0, 0.5, 0] : [0, 0, 0]}
            onClick={(e: any) => {
              e.stopPropagation();

              if (!isTrackingMode) {
                onHit();
              }
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

          <group raycast={NO_RAYCAST}>
            {targetShape === 'humanoid' ? (
              <Suspense fallback={null}>
                <FortniteSkin color={targetColor} skinMode={targetSkinMode} />
              </Suspense>
            ) : targetShape === 'sphere' ? (
              <mesh raycast={NO_RAYCAST}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                  color={targetColor}
                  emissive={targetColor}
                  emissiveIntensity={1.8}
                  roughness={0.38}
                  metalness={0.15}
                />
              </mesh>
            ) : (
              <mesh raycast={NO_RAYCAST}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial
                  color={targetColor}
                  emissive={targetColor}
                  emissiveIntensity={1.8}
                  roughness={0.34}
                  metalness={0.18}
                />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </>
  );
}

useGLTF.preload('/fortnite_skin.glb');