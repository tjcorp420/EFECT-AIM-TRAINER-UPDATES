import { Suspense, useCallback, useState, useEffect, useRef, useMemo } from 'react';
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

const EMX_LOGO_SRC = '/emx-logo.png';

const hexToRgbString = (hex: string) => {
  const clean = hex.replace('#', '').trim();
  const normalized =
    clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;

  const value = Number.parseInt(normalized, 16);

  if (Number.isNaN(value)) return '0, 255, 204';

  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `${r}, ${g}, ${b}`;
};

const getTauriWindow = async () => {
  const tauriWindow = (await import('@tauri-apps/api/window')) as any;

  if (typeof tauriWindow.getCurrentWindow === 'function') {
    return tauriWindow.getCurrentWindow();
  }

  return tauriWindow.appWindow;
};

const minimizeAppWindow = async () => {
  try {
    const win = await getTauriWindow();
    await win?.minimize?.();
  } catch (error) {
    console.warn('Window minimize is only available inside Tauri.', error);
  }
};

const closeAppWindow = async () => {
  try {
    const win = await getTauriWindow();
    await win?.close?.();
  } catch (error) {
    window.close();
  }
};

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

const getPerformanceGrade = (
  score: number,
  accuracy: number,
  maxStreak: number,
  hitsPerSecond: number
) => {
  const gradeScore = score * 0.018 + accuracy * 2.7 + maxStreak * 6 + hitsPerSecond * 90;

  if (gradeScore >= 720) return { letter: 'S+', title: 'ELITE PERFORMANCE', color: '#ff00ff' };
  if (gradeScore >= 600) return { letter: 'S', title: 'PRO LEVEL CONTROL', color: '#b967ff' };
  if (gradeScore >= 460) return { letter: 'A', title: 'HIGH PERFORMANCE', color: '#39ff14' };
  if (gradeScore >= 330) return { letter: 'B', title: 'SOLID TRAINING RUN', color: '#00ffcc' };
  if (gradeScore >= 220) return { letter: 'C', title: 'BUILDING CONSISTENCY', color: '#ffaa00' };

  return { letter: 'D', title: 'WARMUP COMPLETE', color: '#ff0055' };
};

function HitMarkerUI() {
  const [show, setShow] = useState(false);

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

  return <div className="efect-hitmarker" />;
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

const getWeaponTitle = (weaponClass: string) => {
  if (weaponClass === 'smg') return 'SMG AUTOMATIC';
  if (weaponClass === 'sniper') return 'SNIPER HIGH IMPACT';
  if (weaponClass === 'nerf') return 'NERF TRAINING BLASTER';

  return 'PISTOL TACTICAL';
};

function WindowChrome() {
  return (
    <div className="emx-window-chrome">
      <button
        type="button"
        className="emx-window-btn emx-window-minimize"
        title="Minimize"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          minimizeAppWindow();
        }}
      >
        —
      </button>

      <button
        type="button"
        className="emx-window-btn emx-window-close"
        title="Exit"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeAppWindow();
        }}
      >
        ×
      </button>
    </div>
  );
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
    weaponClass,
  } = useStore();

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const deployGraceRef = useRef(0);

  const [booted, setBooted] = useState(false);
  const [maxStreak, setMaxStreak] = useState(0);
  const [activeStreak, setActiveStreak] = useState<{ msg: string; val: number } | null>(
    null
  );

  const accuracy = shots > 0 ? Math.round((hitTrigger / shots) * 100) : 0;
  const avgReaction = hitTrigger > 0 ? Math.round((drillDuration * 1000) / hitTrigger) : 0;
  const finalRank = getRankInfo(score, accuracy);
  const previousBest = highScores[scenario] || 0;
  const finalHitsPerSecond = drillDuration > 0 ? hitTrigger / drillDuration : 0;
  const isNewRecord = score > 0 && score >= previousBest;
  const performanceGrade = getPerformanceGrade(score, accuracy, maxStreak, finalHitsPerSecond);

  const hasStartedFiring = shots > 0;

  const elapsedTime = Math.max(0, drillDuration - timeLeft);
  const liveHitsPerSecond = elapsedTime > 0 ? hitTrigger / elapsedTime : 0;
  const weaponTitle = getWeaponTitle(weaponClass);
  const scenarioTitle = scenario.replace(/_/g, ' ').toUpperCase();

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

  const handlePointerUnlock = useCallback(() => {
    const msSinceDeploy = performance.now() - deployGraceRef.current;

    if (msSinceDeploy < 1200) {
      return;
    }

    if (timeLeft > 0 && gameState === 'playing') {
      goToCustomizer();
    }
  }, [timeLeft, gameState, goToCustomizer]);

  useEffect(() => {
    if (gameState === 'playing') {
      deployGraceRef.current = performance.now();
      setMaxStreak(0);
      setActiveStreak(null);
    }

    document.documentElement.style.setProperty('--theme-color', color);
    document.documentElement.style.setProperty('--theme-rgb', hexToRgbString(color));
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
      <WindowChrome />

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
        <div className="efect-ready-overlay">
          <div className="efect-ready-kicker">EMX TRAINING MODULE ONLINE</div>
          <div className="efect-ready-title">CLICK TO BEGIN</div>
          <div className="efect-ready-sub">
            LOCK CURSOR // START TIMER // ENGAGE TARGETS
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
        gameState !== 'customizer' &&
        gameState !== 'gameover' && (
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
        <div className="efect-game-hud">
          <div className="efect-hud-topbar">
            <div className="efect-hud-pill">
              <div className="efect-hud-label">TIME REMAINING</div>
              <div className="efect-hud-value">{timeLeft}s</div>
            </div>

            <div className="efect-hud-pill efect-hud-score">
              <div className="efect-hud-label">LIVE SCORE</div>
              <div className="efect-hud-value">{score}</div>
            </div>

            <div className="efect-hud-pill">
              <div className="efect-hud-label">STREAK CHAIN</div>
              <div className="efect-hud-value">x{combo}</div>
            </div>
          </div>

          <div className="efect-hud-side-left">
            <div className="efect-hud-mini">
              <div className="efect-hud-mini-title">ACTIVE MODULE</div>
              <div className="efect-hud-mini-value">{scenarioTitle}</div>
            </div>

            <div className="efect-hud-mini">
              <div className="efect-hud-mini-title">WEAPON PROFILE</div>
              <div className="efect-hud-mini-value">{weaponTitle}</div>
            </div>
          </div>

          <div className="efect-hud-side-right">
            <div className="efect-hud-mini">
              <div className="efect-hud-mini-title">ACCURACY</div>
              <div className="efect-hud-mini-value">{accuracy}%</div>
            </div>

            <div className="efect-hud-mini">
              <div className="efect-hud-mini-title">HITS PER SECOND</div>
              <div className="efect-hud-mini-value">{liveHitsPerSecond.toFixed(2)}</div>
            </div>
          </div>

          <div className="efect-hud-watermark">EMX AIM TRAINER</div>

          <div className="efect-hud-esc">
            <span>ESC</span> RETURN TO ARMORY
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="efect-session-shell emx-session-shell">
          <div className="efect-session-card emx-session-card">
            <div className="emx-session-scanline" />

            <div className="emx-session-header">
              <div className="emx-session-logo-wrap">
                <div className="emx-logo-orbit" />
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  className="emx-session-logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="emx-session-kicker">EMX TRAINING SUITE</div>
              <div className="emx-session-title">PERFORMANCE REPORT</div>

              {isNewRecord && (
                <div className="emx-record-banner">NEW PERSONAL BEST // {score} POINTS</div>
              )}
            </div>

            <div className="emx-report-grid">
              <div className="emx-grade-panel">
                <div className="emx-grade-letter" style={{ color: performanceGrade.color }}>
                  {performanceGrade.letter}
                </div>

                <div className="emx-grade-title" style={{ color: performanceGrade.color }}>
                  {performanceGrade.title}
                </div>

                <div className="emx-grade-rank-chip" style={{ borderColor: finalRank.color }}>
                  <span>{finalRank.icon}</span>
                  <div>
                    <small>RANK</small>
                    <strong style={{ color: finalRank.color }}>{finalRank.title}</strong>
                  </div>
                </div>
              </div>

              <div className="emx-report-stat emx-report-score">
                <div className="emx-report-label">FINAL SCORE</div>
                <div className="emx-report-value">{score}</div>
                <div className="emx-report-sub">BEST: {previousBest}</div>
              </div>

              <div className="emx-report-stat">
                <div className="emx-report-label">ACCURACY</div>
                <div className="emx-report-value">{accuracy}%</div>
                <div className="emx-report-sub">SHOTS: {shots}</div>
              </div>

              <div className="emx-report-stat">
                <div className="emx-report-label">MAX STREAK</div>
                <div className="emx-report-value">{maxStreak}</div>
                <div className="emx-report-sub">CHAIN CONTROL</div>
              </div>

              <div className="emx-report-stat">
                <div className="emx-report-label">AVG REACTION</div>
                <div className="emx-report-value">{avgReaction}ms</div>
                <div className="emx-report-sub">TARGET RESPONSE</div>
              </div>

              <div className="emx-report-stat">
                <div className="emx-report-label">HITS / SEC</div>
                <div className="emx-report-value">{finalHitsPerSecond.toFixed(2)}</div>
                <div className="emx-report-sub">SPEED OUTPUT</div>
              </div>

              <div className="emx-heatmap-panel">
                <div className="emx-heatmap-top">
                  <span>PERFORMANCE HEATMAP</span>
                  <strong>PEAK: {maxHPS.toFixed(1)} HPS</strong>
                </div>

                <div className="emx-heatmap-bars">
                  {chartData.map((val, idx) => {
                    const heightPct = (val / maxHPS) * 100;

                    return (
                      <div key={idx} className="emx-heatmap-bar-wrap">
                        <div
                          className="emx-heatmap-bar"
                          style={{
                            height: `${heightPct}%`,
                            opacity: val > 0 ? 0.88 : 0.14,
                            boxShadow:
                              val === maxHPS
                                ? `0 0 18px ${color}, 0 0 34px ${color}55`
                                : 'none',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="emx-heatmap-axis">
                  <span>0s</span>
                  <span>{drillDuration / 2}s</span>
                  <span>{drillDuration}s</span>
                </div>
              </div>
            </div>

            <div className="emx-report-notes">
              <div>
                <strong>MODULE</strong>
                <span>{scenarioTitle}</span>
              </div>
              <div>
                <strong>WEAPON</strong>
                <span>{weaponTitle}</span>
              </div>
              <div>
                <strong>NEXT STEP</strong>
                <span>
                  {accuracy < 70
                    ? 'Slow down and clean first-shot accuracy.'
                    : 'Increase speed or move into tracking drills.'}
                </span>
              </div>
            </div>

            <div className="emx-session-actions">
              <button onClick={startGame} className="emx-primary-action">
                REDEPLOY
              </button>

              <button onClick={goToCustomizer} className="emx-secondary-action">
                ARMORY
              </button>

              <button onClick={goToScenarios} className="emx-secondary-action">
                HUB
              </button>
            </div>
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
            onUnlock={handlePointerUnlock}
          />

          <Suspense fallback={null}>
            <RoomBackdrop />
          </Suspense>

          <AudioListener />

          {graphicsQuality === 'high' && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.76} intensity={0.28} />
            </EffectComposer>
          )}

          <ambientLight intensity={0.32} />
          <directionalLight position={[5, 10, 5]} intensity={0.92} />

          <FireController />
          <PlayerMovement />
          <Room />
          <Gun />

          {Array.from({ length: activeTargetAmount }).map((_, i) => (
            <Target key={i} />
          ))}
        </Canvas>
      )}

      {gameState === 'playing' && <div className="efect-brightness-shield" />}
    </div>
  );
}