import { useEffect, useMemo, useRef, useState } from 'react';

interface BootSplashProps {
  onComplete?: () => void;
  color?: string;
  duration?: number;
}

type BootStep = {
  threshold: number;
  label: string;
  detail: string;
};

const EMX_LOGO_SRC = '/emx-logo.png';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const BOOT_STEPS: BootStep[] = [
  { threshold: 8, label: 'CORE_WAKE', detail: 'Igniting EMX reactor shell' },
  { threshold: 17, label: 'PROFILE_SYNC', detail: 'Binding player profile and armory cache' },
  { threshold: 28, label: 'RETICLE_MATRIX', detail: 'Compiling crosshair render layer' },
  { threshold: 39, label: 'SCENARIO_GRID', detail: 'Indexing flick, track, react, and timing drills' },
  { threshold: 52, label: 'TARGET_AI', detail: 'Mounting movement logic and humanoid hit zones' },
  { threshold: 65, label: 'BALLISTICS_BUS', detail: 'Priming hit markers, bonus scoring, and feedback' },
  { threshold: 78, label: 'XP_ENGINE', detail: 'Loading level, streak, badge, and session telemetry' },
  { threshold: 91, label: 'VISUAL_STACK', detail: 'Charging glass HUD, bloom, and neon compositor' },
  { threshold: 100, label: 'DEPLOY_READY', detail: 'EMX Aim Trainer online' },
];

const MODULES = [
  'AIM_CORE',
  'TRACKING_LAB',
  'FLICK_GRID',
  'REACTION_NODE',
  'XP_PROTOCOL',
  'ARMORY_SYNC',
  'HUD_GLASS',
  'AUDIO_BUS',
];

const buildProgressDelta = (progress: number, turbo: boolean) => {
  const mult = turbo ? 2.35 : 1;

  if (progress < 20) return 1.45 * mult;
  if (progress < 44) return 1.1 * mult;
  if (progress < 68) return 0.82 * mult;
  if (progress < 88) return 0.56 * mult;
  if (progress < 97) return 0.28 * mult;

  return 0.7 * mult;
};

export default function BootSplash({
  onComplete,
  color = '#b967ff',
  duration = 5200,
}: BootSplashProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [turbo, setTurbo] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [logoFailed, setLogoFailed] = useState(false);
  const [tick, setTick] = useState(0);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const activeStep = useMemo(() => {
    return BOOT_STEPS.find((step) => progress <= step.threshold) || BOOT_STEPS[BOOT_STEPS.length - 1];
  }, [progress]);

  const gridNodes = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: `${(index * 13.19) % 100}%`,
        top: `${(index * 8.83) % 100}%`,
        delay: `${(index * 0.061) % 2.6}s`,
        size: 1 + (index % 3),
      })),
    []
  );

  const streamLines = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        left: `${(index * 5.37) % 100}%`,
        delay: `${(index * 0.13) % 2.2}s`,
        duration: `${2.4 + ((index * 0.17) % 2.4)}s`,
        height: 120 + ((index * 23) % 220),
      })),
    []
  );

  const moduleStates = useMemo(() => {
    return MODULES.map((module, index) => {
      const percent = clamp((progress - index * 9) / 22, 0, 1);
      const status = percent >= 1 ? 'ONLINE' : percent > 0 ? 'SYNCING' : 'WAITING';

      return {
        module,
        percent: Math.round(percent * 100),
        status,
      };
    });
  }, [progress]);

  const terminalLines = useMemo(() => {
    const reached = BOOT_STEPS.filter((step) => progress >= step.threshold);
    const lines = reached.map((step) => {
      return `[${String(step.threshold).padStart(3, '0')}%] ${step.label.toLowerCase()} :: ok`;
    });

    lines.push(
      `[${String(Math.round(progress)).padStart(3, '0')}%] ${activeStep.label.toLowerCase()} :: ${activeStep.detail.toLowerCase()}`
    );

    return lines.slice(-5).reverse();
  }, [progress, activeStep]);

  useEffect(() => {
    const intervalMs = Math.max(16, Math.round(duration / 245));

    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Number(Math.min(100, prev + buildProgressDelta(prev, turbo)).toFixed(2));
      });
      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [duration, turbo]);

  useEffect(() => {
    if (progress < 100 || completedRef.current) return;

    completedRef.current = true;

    const fadeTimer = window.setTimeout(() => setVisible(false), 420);
    const completeTimer = window.setTimeout(() => onComplete?.(), 980);

    timersRef.current.push(fadeTimer, completeTimer);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [progress, onComplete]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    const boost = () => setTurbo(true);

    const key = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') boost();
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('pointerdown', boost);
    window.addEventListener('keydown', key);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('pointerdown', boost);
      window.removeEventListener('keydown', key);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 560ms ease',
        background:
          'radial-gradient(circle at 50% 45%, rgba(52,10,78,0.58), rgba(4,8,8,0.96) 44%, #000 100%)',
        color: '#fff',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      }}
    >
      <style>{`
        @keyframes emxBootGrid {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(48px, 48px, 0); }
        }

        @keyframes emxBootStream {
          0% { transform: translateY(-240px); opacity: 0; }
          12% { opacity: 0.9; }
          100% { transform: translateY(calc(100vh + 240px)); opacity: 0; }
        }

        @keyframes emxLogoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            filter:
              drop-shadow(0 0 24px rgba(57,255,20,0.9))
              drop-shadow(0 0 50px rgba(185,103,255,0.84))
              drop-shadow(0 0 90px rgba(255,0,255,0.36));
          }
          50% {
            transform: translateY(-12px) scale(1.055);
            filter:
              drop-shadow(0 0 38px rgba(57,255,20,1))
              drop-shadow(0 0 70px rgba(185,103,255,1))
              drop-shadow(0 0 130px rgba(255,0,255,0.52));
          }
        }

        @keyframes emxOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes emxOrbitReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes emxSweep {
          0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
          24% { opacity: 0.8; }
          100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
        }

        @keyframes emxNodeBlink {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.8); }
        }

        @keyframes emxPanelPulse {
          0%, 100% {
            border-color: rgba(185,103,255,0.38);
            box-shadow: 0 0 45px rgba(185,103,255,0.22), inset 0 0 80px rgba(255,255,255,0.03);
          }
          50% {
            border-color: rgba(57,255,20,0.44);
            box-shadow: 0 0 75px rgba(57,255,20,0.2), 0 0 120px rgba(185,103,255,0.2), inset 0 0 90px rgba(255,255,255,0.05);
          }
        }

        @keyframes emxScan {
          0% { transform: translateY(-120%); opacity: 0; }
          15% { opacity: 0.85; }
          100% { transform: translateY(120%); opacity: 0; }
        }

        @keyframes emxFallbackGlow {
          0%, 100% { letter-spacing: 20px; text-shadow: 0 0 35px #39ff14, 0 0 70px #b967ff; }
          50% { letter-spacing: 26px; text-shadow: 0 0 50px #fff, 0 0 110px #b967ff; }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.3,
          animation: 'emxBootGrid 16s linear infinite',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(520px circle at ${mouse.x}% ${mouse.y}%, ${color}28, transparent 62%)`,
          transition: 'background 90ms linear',
        }}
      />

      {gridNodes.map((node) => (
        <div
          key={node.id}
          style={{
            position: 'absolute',
            left: node.left,
            top: node.top,
            width: node.size,
            height: node.size,
            borderRadius: '50%',
            background: node.id % 2 === 0 ? '#39ff14' : '#b967ff',
            boxShadow: `0 0 12px ${node.id % 2 === 0 ? '#39ff14' : '#b967ff'}`,
            animation: 'emxNodeBlink 3.2s ease-in-out infinite',
            animationDelay: node.delay,
          }}
        />
      ))}

      {streamLines.map((line) => (
        <div
          key={line.id}
          style={{
            position: 'absolute',
            left: line.left,
            top: -260,
            width: 1,
            height: line.height,
            background:
              line.id % 2 === 0
                ? 'linear-gradient(to bottom, transparent, #39ff14, transparent)'
                : 'linear-gradient(to bottom, transparent, #b967ff, transparent)',
            opacity: 0.28,
            boxShadow: `0 0 12px ${line.id % 2 === 0 ? '#39ff14' : '#b967ff'}`,
            animation: `emxBootStream ${line.duration} linear infinite`,
            animationDelay: line.delay,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 3px, transparent 6px)',
          opacity: 0.08,
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 'min(1180px, 88vw)',
          minHeight: 'min(760px, 82vh)',
          transform: 'translate(-50%, -50%)',
          borderRadius: 34,
          border: '1px solid rgba(185,103,255,0.38)',
          background:
            'linear-gradient(180deg, rgba(8,10,18,0.86), rgba(0,0,0,0.94)), radial-gradient(circle at 50% 20%, rgba(185,103,255,0.16), transparent 46%)',
          backdropFilter: 'blur(22px)',
          overflow: 'hidden',
          animation: 'emxPanelPulse 3.2s ease-in-out infinite',
          padding: '34px 42px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 180,
            top: 0,
            background: 'linear-gradient(to bottom, rgba(185,103,255,0.2), transparent)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #39ff14, #b967ff, transparent)',
            boxShadow: '0 0 24px rgba(185,103,255,0.9)',
            animation: 'emxScan 3.1s linear infinite',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: '1fr 1.45fr 1fr',
            gap: 24,
            height: '100%',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {moduleStates.slice(0, 4).map((module) => (
              <ModuleCard key={module.module} module={module} color={color} />
            ))}
          </div>

          <div style={{ textAlign: 'center', position: 'relative', minHeight: 560 }}>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 204,
                width: 560,
                height: 300,
                borderRadius: '50%',
                border: '1px solid rgba(57,255,20,0.32)',
                boxShadow: '0 0 40px rgba(57,255,20,0.16), inset 0 0 38px rgba(185,103,255,0.14)',
                animation: 'emxOrbit 7s linear infinite',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 204,
                width: 690,
                height: 380,
                borderRadius: '50%',
                border: '1px dashed rgba(185,103,255,0.34)',
                animation: 'emxOrbitReverse 12s linear infinite',
              }}
            />

            <div
              style={{
                color,
                fontSize: 13,
                letterSpacing: 10,
                fontWeight: 900,
                textShadow: `0 0 18px ${color}`,
                marginTop: 8,
                marginBottom: 18,
              }}
            >
              EMX TRAINING SYSTEM
            </div>

            <div
              style={{
                position: 'relative',
                display: 'inline-grid',
                placeItems: 'center',
                width: 620,
                height: 310,
                maxWidth: '100%',
                marginBottom: 18,
              }}
            >
              {!logoFailed ? (
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  onError={() => setLogoFailed(true)}
                  style={{
                    width: 520,
                    maxWidth: '94%',
                    maxHeight: 290,
                    objectFit: 'contain',
                    animation: 'emxLogoFloat 2.25s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    color: '#fff',
                    fontSize: 96,
                    fontWeight: 900,
                    animation: 'emxFallbackGlow 2.25s ease-in-out infinite',
                  }}
                >
                  EMX
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  inset: '30px 0',
                  background:
                    'linear-gradient(90deg, transparent, rgba(57,255,20,0.16), rgba(255,255,255,0.34), rgba(185,103,255,0.18), transparent)',
                  animation: 'emxSweep 2.6s ease-in-out infinite',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 34,
                letterSpacing: 12,
                fontWeight: 900,
                textShadow: '0 0 24px rgba(255,255,255,0.55), 0 0 60px rgba(185,103,255,0.34)',
              }}
            >
              AIM SYSTEM ONLINE
            </div>

            <div
              style={{
                width: 'min(640px, 100%)',
                margin: '28px auto 0',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 20,
                  color: '#b9c4d6',
                  fontWeight: 900,
                  letterSpacing: 4,
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                <span>{activeStep.label}</span>
                <span style={{ color: '#39ff14' }}>{Math.round(progress)}%</span>
              </div>

              <div
                style={{
                  height: 18,
                  borderRadius: 999,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #39ff14, #00ffcc, #b967ff, #ff4df0)',
                    boxShadow: '0 0 24px rgba(185,103,255,0.82), 0 0 34px rgba(57,255,20,0.42)',
                    transition: 'width 80ms linear',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: 'rgba(255,255,255,0.58)',
                  letterSpacing: 3,
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 18,
                }}
              >
                <span>{activeStep.detail}</span>
                <span style={{ color: turbo ? '#39ff14' : 'rgba(255,255,255,0.42)' }}>
                  {turbo ? 'TURBO_SYNC' : 'STANDARD_SYNC'}
                </span>
              </div>
            </div>

            <div
              style={{
                margin: '24px auto 0',
                width: 'min(640px, 100%)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.42)',
                padding: '12px 14px',
                textAlign: 'left',
              }}
            >
              {terminalLines.map((line, index) => (
                <div
                  key={`${line}-${tick}-${index}`}
                  style={{
                    color: index === 0 ? '#fff' : 'rgba(255,255,255,0.45)',
                    letterSpacing: 2,
                    fontSize: 11,
                    lineHeight: 1.65,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span style={{ color: index === 0 ? '#39ff14' : color }}>{'>'}</span> {line}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {moduleStates.slice(4).map((module) => (
              <ModuleCard key={module.module} module={module} color="#39ff14" alignRight />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 30,
          right: 30,
          top: 20,
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 3,
          color: 'rgba(255,255,255,0.48)',
          fontSize: 11,
          letterSpacing: 5,
          fontWeight: 900,
        }}
      >
        <span>EMX // PREMIUM AIM TRAINER BOOT</span>
        <span style={{ color: '#39ff14', textShadow: '0 0 16px #39ff14' }}>
          {Math.round(progress)} // 100
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.48)',
          fontSize: 11,
          letterSpacing: 5,
          textAlign: 'center',
        }}
      >
        CLICK OR PRESS SPACE TO ACCELERATE DEPLOYMENT
      </div>
    </div>
  );
}

function ModuleCard({
  module,
  color,
  alignRight = false,
}: {
  module: { module: string; percent: number; status: string };
  color: string;
  alignRight?: boolean;
}) {
  const online = module.status === 'ONLINE';
  const syncing = module.status === 'SYNCING';

  return (
    <div
      style={{
        padding: '13px 14px',
        borderRadius: 14,
        background: online
          ? `${color}13`
          : syncing
            ? 'rgba(185,103,255,0.12)'
            : 'rgba(255,255,255,0.035)',
        border: online ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.08)',
        textAlign: alignRight ? 'right' : 'left',
        boxShadow: online ? `0 0 22px ${color}18` : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: alignRight ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          gap: 10,
          color: '#fff',
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: 900,
          marginBottom: 9,
        }}
      >
        <span>{module.module}</span>
        <span style={{ color: online ? color : syncing ? '#b967ff' : 'rgba(255,255,255,0.34)' }}>
          {module.status}
        </span>
      </div>

      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${module.percent}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, #b967ff)`,
            boxShadow: `0 0 12px ${color}`,
            transition: 'width 80ms linear',
          }}
        />
      </div>
    </div>
  );
}
