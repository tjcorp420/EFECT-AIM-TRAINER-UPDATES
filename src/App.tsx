import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

import BootSplash from './components/BootSplash';
import Crosshair from './components/Crosshair';
import Customizer from './components/Customizer';
import ScenarioSelect from './components/ScenarioSelect';
import Leaderboard from './components/Leaderboard';
import Target from './components/Target';
import Gun from './components/Gun';
import Room from './components/Room';
import RoomBackdrop from './components/RoomBackdrop';
import Login from './components/Login';
import { useStore, TRACK_LIST, GAME_PROFILES } from './store/useStore';
import './App.css';

function FloatingTextUI() {
  const [texts, setTexts] = useState<
    { id: number; text: string; x: number; y: number; color: string }[]
  >([]);

  useEffect(() => {
    const handleText = (e: any) => {
      const newText = {
        id: Date.now() + Math.random(),
        ...e.detail,
      };

      setTexts((prev) => [...prev, newText]);

      setTimeout(() => {
        setTexts((prev) => prev.filter((t) => t.id !== newText.id));
      }, 600);
    };

    window.addEventListener('floating-text', handleText);

    return () => {
      window.removeEventListener('floating-text', handleText);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatDmg {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1);
          }
        }
      `}</style>

      {texts.map((t) => (
        <div
          key={t.id}
          style={{
            position: 'absolute',
            top: t.y,
            left: t.x,
            color: '#fff',
            textShadow: `0 0 8px ${t.color}`,
            fontWeight: 900,
            fontSize: '1.5rem',
            zIndex: 200,
            fontFamily: 'monospace',
            pointerEvents: 'none',
            animation: 'floatDmg 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        >
          {t.text}
        </div>
      ))}
    </>
  );
}

const getRankInfo = (score: number, accuracy: number) => {
  const rating = score * (accuracy / 100);

  if (rating >= 120000) return { title: 'GRANDMASTER', color: '#ff0055', icon: '💎' };
  if (rating >= 90000) return { title: 'MASTER', color: '#b966ff', icon: '🔮' };
  if (rating >= 70000) return { title: 'DIAMOND', color: '#00ffff', icon: '💠' };
  if (rating >= 50000) return { title: 'PLATINUM', color: '#00ffaa', icon: '❇️' };
  if (rating >= 30000) return { title: 'GOLD', color: '#ffaa00', icon: '🏆' };
  if (rating >= 15000) return { title: 'SILVER', color: '#aaaaaa', icon: '🥈' };

  return { title: 'BRONZE', color: '#cd7f32', icon: '🥉' };
};

function HitMarkerUI() {
  const [show, setShow] = useState(false);
  const { color } = useStore();

  useEffect(() => {
    let timer: number;

    const handleHit = () => {
      setShow(true);
      clearTimeout(timer);

      timer = window.setTimeout(() => {
        setShow(false);
      }, 80);
    };

    window.addEventListener('hit-marker', handleHit);

    return () => {
      window.removeEventListener('hit-marker', handleHit);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '24px',
          height: '2px',
          background: color,
          transform: 'rotate(45deg)',
          opacity: 0.8,
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '24px',
          height: '2px',
          background: color,
          transform: 'rotate(-45deg)',
          opacity: 0.8,
        }}
      />
    </div>
  );
}

function AudioListener() {
  const { camera } = useThree();
  const [listener] = useState(() => new THREE.AudioListener());

  useEffect(() => {
    camera.add(listener);

    return () => {
      camera.remove(listener);
    };
  }, [camera, listener]);

  return null;
}

function FireController() {
  const { fireShot, weaponClass, gameState, isFiring, setIsFiring } = useStore();
  const flashLightRef = useRef<THREE.PointLight>(null);
  const lastShotTime = useRef(0);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (gameState === 'playing' && e.button === 0) {
        setIsFiring(true);
        fireShot();
      }
    };

    const handleUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsFiring(false);
      }
    };

    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [fireShot, gameState, setIsFiring]);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    if (isFiring && weaponClass === 'smg') {
      if (state.clock.elapsedTime - lastShotTime.current > 0.08) {
        if (fireShot()) {
          lastShotTime.current = state.clock.elapsedTime;

          if (flashLightRef.current) {
            flashLightRef.current.intensity = 15;
          }
        }
      }
    }

    if (flashLightRef.current) {
      if (isFiring && weaponClass !== 'smg') {
        flashLightRef.current.intensity = 15;
      } else {
        flashLightRef.current.intensity = THREE.MathUtils.lerp(
          flashLightRef.current.intensity,
          0,
          delta * 20
        );
      }
    }
  });

  return (
    <pointLight
      ref={flashLightRef}
      position={[0.5, 0, -1]}
      distance={15}
      color="#00ff00"
      intensity={0}
    />
  );
}

function PlayerMovement() {
  const { camera } = useThree();
  const gameState = useStore((s) => s.gameState);

  const keys = useRef({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ShiftLeft: false,
    ShiftRight: false,
  });

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const moveDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        keys.current[e.code as keyof typeof keys.current] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        keys.current[e.code as keyof typeof keys.current] = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (gameState !== 'playing') return;
    if (!document.pointerLockElement) return;

    moveDir.set(0, 0, 0);

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    if (keys.current.KeyW) moveDir.add(forward);
    if (keys.current.KeyS) moveDir.sub(forward);
    if (keys.current.KeyD) moveDir.add(right);
    if (keys.current.KeyA) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();

      const speed = keys.current.ShiftLeft || keys.current.ShiftRight ? 8.25 : 5.25;

      camera.position.addScaledVector(moveDir, speed * delta);
    }

    camera.position.y = 1.5;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -18, 18);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -18, 18);
  });

  return null;
}

export default function App() {
  const {
    score,
    shots,
    combo,
    hitTrigger,
    timeLeft,
    gameState,
    startGame,
    endGame,
    tickTimer,
    highScores,
    scenario,
    goToScenarios,
    goToCustomizer,
    color,
    graphicsQuality,
    drillDuration,
    musicTrack,
    musicVolume,
    isMusicPlaying,
    setSettings,
    gameSens,
    gameProfile,
    fov,
    hitLog,
  } = useStore();

  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const [booted, setBooted] = useState(false);
  const [maxStreak, setMaxStreak] = useState(0);
  const [activeStreak, setActiveStreak] = useState<{ msg: string; val: number } | null>(
    null
  );

  const accuracy = shots > 0 ? Math.round((hitTrigger / shots) * 100) : 0;
  const avgReaction = score > 0 ? Math.round((drillDuration * 1000) / hitTrigger) : 0;
  const finalRank = getRankInfo(score, accuracy);

  const hasStartedFiring = shots > 0;

  const profile = GAME_PROFILES[gameProfile] || GAME_PROFILES.valorant;
  const truePointerSpeed = (gameSens / profile.multiplier) * 1.1;

  const chartData = useMemo(() => {
    const buckets = 10;
    const bucketSize = drillDuration / buckets;
    const data = Array(buckets).fill(0);

    hitLog.forEach((time) => {
      const bucketIndex = Math.min(Math.floor(time / bucketSize), buckets - 1);
      data[bucketIndex]++;
    });

    return data.map((hits) => hits / bucketSize);
  }, [hitLog, drillDuration]);

  const maxHPS = Math.max(...chartData, 1);

  useEffect(() => {
    if (gameState === 'playing') {
      setMaxStreak(0);
      setActiveStreak(null);
    }

    document.documentElement.style.setProperty('--theme-color', color);
  }, [gameState, color]);

  useEffect(() => {
    if (gameState !== 'playing' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [gameState]);

  useEffect(() => {
    if (combo > maxStreak) {
      setMaxStreak(combo);
    }

    if (combo > 0 && combo % 10 === 0) {
      setActiveStreak({
        msg: 'PERFORMANCE STREAK',
        val: combo,
      });

      const timer = setTimeout(() => {
        setActiveStreak(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [combo, maxStreak]);

  useEffect(() => {
    let timer: number;

    if (gameState === 'playing' && hasStartedFiring && timeLeft > 0) {
      timer = window.setInterval(tickTimer, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();

      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }

    return () => clearInterval(timer);
  }, [gameState, hasStartedFiring, timeLeft, tickTimer, endGame]);

  useEffect(() => {
    if (!audioPlayerRef.current) return;

    audioPlayerRef.current.volume = musicVolume;

    if (musicTrack === 'none' || !isMusicPlaying) {
      audioPlayerRef.current.pause();
      return;
    }

    const newSrc = window.location.origin + `/${musicTrack}.mp3`;

    if (audioPlayerRef.current.src !== newSrc) {
      audioPlayerRef.current.src = newSrc;
    }

    audioPlayerRef.current.loop = true;
    audioPlayerRef.current.play().catch(() => {
      setSettings({
        isMusicPlaying: false,
      });
    });
  }, [musicTrack, musicVolume, isMusicPlaying, setSettings]);

  const getTargetAmount = () => {
    if (scenario === 'gridshot_ultimate') return 4;
    if (scenario === 'microflick_standard') return 6;
    if (scenario.includes('spidershot')) return 1;
    if (scenario.includes('react') || scenario.includes('reflex')) return 1;

    if (
      scenario.includes('tracking') ||
      scenario.includes('glider') ||
      scenario.includes('bounce')
    ) {
      return 1;
    }

    if (scenario.includes('gridshot')) return 3;
    if (scenario.includes('pump_flick')) return 5;
    if (scenario.includes('popcorn')) return 3;
    if (scenario.includes('360')) return 3;
    if (scenario.includes('motionshot')) return 3;
    if (scenario.includes('snipershot')) return 2;

    return 3;
  };

  const activeTargetAmount = getTargetAmount();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <audio ref={audioPlayerRef} />

      {!booted && (
        <BootSplash
          color={color}
          duration={5200}
          onComplete={() => {
            setBooted(true);
          }}
        />
      )}

      {gameState === 'playing' && <FloatingTextUI />}
      {gameState === 'playing' && hasStartedFiring && <HitMarkerUI />}

      {gameState === 'playing' && !hasStartedFiring && (
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              color: '#fff',
              fontWeight: '900',
              letterSpacing: '4px',
              textShadow: `0 0 15px ${color}`,
            }}
          >
            CLICK TO BEGIN
          </div>
        </div>
      )}

      {activeStreak && hasStartedFiring && (
        <div
          key={activeStreak.val}
          className="streak-toast glow-ui"
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: '#aaa',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {activeStreak.msg}
          </div>

          <div
            style={{
              fontSize: '2rem',
              color: '#fff',
              fontWeight: '900',
              textShadow: `0 0 10px ${color}`,
            }}
          >
            HIT CHAIN <span style={{ color }}>x{activeStreak.val}</span>
          </div>
        </div>
      )}

      {gameState !== 'playing' &&
        gameState !== 'leaderboard' &&
        gameState !== 'login' &&
        gameState !== 'customizer' && (
          <div
            className="glow-ui"
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              zIndex: 1000,
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(10,10,10,0.8)',
              backdropFilter: 'blur(5px)',
              border: '1px solid #333',
              color: '#fff',
              width: '280px',
              fontFamily: 'monospace',
            }}
          >
            <div
              style={{
                color,
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <span>AUDIO ENGINE</span>

              <button
                onClick={() =>
                  setSettings({
                    isMusicPlaying: !isMusicPlaying,
                  })
                }
                style={{
                  background: color,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                {isMusicPlaying ? 'PAUSE' : 'PLAY'}
              </button>
            </div>

            <select
              value={musicTrack}
              onChange={(e) =>
                setSettings({
                  musicTrack: e.target.value,
                  isMusicPlaying: true,
                })
              }
              style={{
                width: '100%',
                padding: '8px',
                background: '#000',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              {TRACK_LIST.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) =>
                setSettings({
                  musicVolume: Number(e.target.value),
                })
              }
              style={{
                width: '100%',
                accentColor: color,
              }}
            />
          </div>
        )}

      {gameState === 'login' && <Login />}
      {gameState === 'playing' && <Crosshair />}
      {gameState === 'scenarioSelect' && <ScenarioSelect />}
      {gameState === 'customizer' && <Customizer />}
      {gameState === 'leaderboard' && <Leaderboard />}

      {gameState === 'playing' && (
        <div
          className="hud-container"
          style={{
            position: 'absolute',
            inset: '20px',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            color,
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {timeLeft}s
          </div>

          <div
            style={{
              position: 'absolute',
              right: '0',
              textAlign: 'right',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: '900',
              }}
            >
              SCORE: {score}
            </div>

            <div
              style={{
                fontSize: '18px',
                opacity: 0.8,
              }}
            >
              STREAK: {combo}
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5,5,5,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
          }}
        >
          <h1
            style={{
              color,
              fontSize: '3rem',
              letterSpacing: '10px',
              marginBottom: '10px',
              textShadow: `0 0 20px ${color}`,
            }}
          >
            SESSION REVIEW
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '30px',
              background: 'rgba(20,20,20,0.6)',
              padding: '10px 30px',
              borderRadius: '50px',
              border: `1px solid ${finalRank.color}`,
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{finalRank.icon}</span>

            <div>
              <div
                style={{
                  color: '#aaa',
                  fontSize: '0.8rem',
                  letterSpacing: '2px',
                }}
              >
                PERFORMANCE RATING
              </div>

              <div
                style={{
                  color: finalRank.color,
                  fontSize: '1.8rem',
                  fontWeight: '900',
                  letterSpacing: '4px',
                  textShadow: `0 0 10px ${finalRank.color}80`,
                }}
              >
                {finalRank.title}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.5fr',
              gap: '30px',
              width: '95%',
              maxWidth: '1400px',
              marginBottom: '40px',
            }}
          >
            <div
              className="glow-ui"
              style={{
                padding: '40px 20px',
                borderRadius: '16px',
                background: 'rgba(20,20,20,0.6)',
                border: `1px solid ${color}`,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  color: '#aaa',
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                }}
              >
                FINAL SCORE
              </div>

              <div
                style={{
                  fontSize: '5.5rem',
                  color,
                  fontWeight: '900',
                  lineHeight: '1.1',
                  textShadow: `0 0 20px ${color}`,
                }}
              >
                {score}
              </div>

              <div
                style={{
                  color: '#666',
                  fontSize: '1.2rem',
                  marginTop: '10px',
                }}
              >
                BEST: {highScores[scenario] || 0}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
              }}
            >
              <div
                className="performance-card"
                style={{
                  background: 'rgba(20,20,20,0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #333',
                }}
              >
                <span
                  style={{
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  ACCURACY
                </span>

                <span
                  style={{
                    fontSize: '2.5rem',
                    color,
                    fontWeight: 'bold',
                  }}
                >
                  {accuracy}%
                </span>
              </div>

              <div
                className="performance-card"
                style={{
                  background: 'rgba(20,20,20,0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #333',
                }}
              >
                <span
                  style={{
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  MAX STREAK
                </span>

                <span
                  style={{
                    fontSize: '2.5rem',
                    color,
                    fontWeight: 'bold',
                  }}
                >
                  {maxStreak}
                </span>
              </div>

              <div
                className="performance-card"
                style={{
                  background: 'rgba(20,20,20,0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #333',
                }}
              >
                <span
                  style={{
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  AVG REACTION
                </span>

                <span
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {avgReaction}ms
                </span>
              </div>

              <div
                className="performance-card"
                style={{
                  background: 'rgba(20,20,20,0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #333',
                }}
              >
                <span
                  style={{
                    color: '#aaa',
                    display: 'block',
                    marginBottom: '5px',
                  }}
                >
                  HITS / SEC
                </span>

                <span
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {(hitTrigger / drillDuration).toFixed(2)}
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(20,20,20,0.6)',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontSize: '1rem',
                  color: '#aaa',
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>PERFORMANCE HEATMAP (HPS)</span>
                <span style={{ color }}>Peak: {maxHPS.toFixed(1)}</span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  borderBottom: '1px solid #444',
                  paddingBottom: '10px',
                }}
              >
                {chartData.map((val, idx) => {
                  const heightPct = (val / maxHPS) * 100;

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          background: color,
                          opacity: val > 0 ? 0.8 : 0.1,
                          boxShadow: val === maxHPS ? `0 0 10px ${color}` : 'none',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.4s ease-out',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#666',
                  fontSize: '0.8rem',
                  marginTop: '10px',
                }}
              >
                <span>0s</span>
                <span>{drillDuration / 2}s</span>
                <span>{drillDuration}s</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              width: '95%',
              maxWidth: '1400px',
            }}
          >
            <button
              onClick={startGame}
              className="glow-ui"
              style={{
                flex: 1,
                padding: '20px',
                background: color,
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: '900',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              REDEPLOY
            </button>

            <button
              onClick={goToCustomizer}
              style={{
                flex: 1,
                padding: '20px',
                background: 'rgba(30,30,30,0.8)',
                border: '1px solid #555',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ARMORY
            </button>

            <button
              onClick={goToScenarios}
              style={{
                flex: 1,
                padding: '20px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              HUB
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <Canvas
          camera={{ position: [0, 1.5, 0], fov }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'auto',
          }}
        >
          <PointerLockControls
            makeDefault
            pointerSpeed={truePointerSpeed}
            onUnlock={() => {
              if (timeLeft > 0) {
                goToCustomizer();
              }
            }}
          />

          <Suspense fallback={null}>
            <RoomBackdrop />
          </Suspense>

          <AudioListener />

          {graphicsQuality === 'high' && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.5} intensity={0.6} />
            </EffectComposer>
          )}

          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />

          <FireController />
          <PlayerMovement />
          <Room />
          <Gun />

          {Array.from({ length: activeTargetAmount }).map((_, i) => (
            <Target key={i} />
          ))}
        </Canvas>
      )}
    </div>
  );
}