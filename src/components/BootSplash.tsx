import React, { useEffect, useMemo, useRef, useState } from 'react';

interface BootSplashProps {
  onComplete?: () => void;
  color?: string;
  duration?: number;
}

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type BootStep = {
  threshold: number;
  label: string;
  detail: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const BOOT_STEPS: BootStep[] = [
  { threshold: 4, label: 'SECURE_CHANNEL', detail: 'Establishing encrypted runtime tunnel' },
  { threshold: 10, label: 'CORE_HANDSHAKE', detail: 'Authenticating EFECT boot authority' },
  { threshold: 18, label: 'VISUAL_MATRIX', detail: 'Spinning up holographic compositor' },
  { threshold: 27, label: 'INPUT_PIPELINE', detail: 'Calibrating pointer and click response' },
  { threshold: 36, label: 'TARGET_ENGINE', detail: 'Mounting combat simulation targets' },
  { threshold: 46, label: 'BALLISTIC_LAYER', detail: 'Linking hit-detection and damage logic' },
  { threshold: 57, label: 'SESSION_MEMORY', detail: 'Syncing records, stats, and progression' },
  { threshold: 68, label: 'AUDIO_ENGINE', detail: 'Binding tactical audio feedback bus' },
  { threshold: 79, label: 'ARENA_SYSTEMS', detail: 'Loading scenario architecture and lighting' },
  { threshold: 89, label: 'UI_COMPOSITOR', detail: 'Rendering interface shell and diagnostics' },
  { threshold: 96, label: 'FINAL_VALIDATION', detail: 'Performing final integrity sweep' },
  { threshold: 100, label: 'LAUNCH_READY', detail: 'EFECT boot sequence complete' },
];

const MODULES = [
  'TARGETING_CORE',
  'INPUT_PIPELINE',
  'BALLISTICS_LAYER',
  'VISUAL_ENGINE',
  'ARMORY_SYSTEM',
  'SESSION_MEMORY',
  'RANKING_STACK',
  'COACH_ENGINE',
  'ARENA_RENDERER',
  'UI_COMPOSITOR',
];

const TELEMETRY_LEFT = ['LATENCY', 'FRAME_PIPE', 'AIM_SYNC'];
const TELEMETRY_RIGHT = ['MEMORY', 'PROFILE', 'THERMAL'];

const buildProgressDelta = (progress: number, turbo: boolean) => {
  const mult = turbo ? 2.2 : 1;

  if (progress < 18) return 1.6 * mult;
  if (progress < 38) return 1.25 * mult;
  if (progress < 58) return 1.05 * mult;
  if (progress < 74) return 0.82 * mult;
  if (progress < 88) return 0.6 * mult;
  if (progress < 95) return 0.36 * mult;
  if (progress < 99) return 0.22 * mult;

  return 0.72 * mult;
};

export default function BootSplash({
  onComplete,
  color = '#39ff14',
  duration = 5200,
}: BootSplashProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [turbo, setTurbo] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [tick, setTick] = useState(0);

  const completeTriggeredRef = useRef(false);
  const closeTimersRef = useRef<number[]>([]);

  const activeStepIndex = useMemo(() => {
    const idx = BOOT_STEPS.findIndex((step) => progress <= step.threshold);
    return idx === -1 ? BOOT_STEPS.length - 1 : idx;
  }, [progress]);

  const activeStep = BOOT_STEPS[activeStepIndex];

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${(i * 11.37) % 100}%`,
        top: `${(i * 7.91) % 100}%`,
        size: 1 + (i % 3),
        opacity: 0.18 + ((i * 17) % 45) / 100,
        delay: `${(i * 0.07) % 2.4}s`,
      })),
    []
  );

  const dataStreams = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 4.12) % 100}%`,
        height: 120 + ((i * 19) % 160),
        duration: `${2.2 + ((i * 0.23) % 2.8)}s`,
        delay: `${(i * 0.11) % 1.9}s`,
        opacity: 0.08 + ((i * 9) % 22) / 100,
      })),
    []
  );

  const moduleStates = useMemo(() => {
    return MODULES.map((name, index) => {
      const local = clamp((progress - index * 7.5) / 15, 0, 1);
      const percent = Math.round(local * 100);
      const status = percent >= 100 ? 'ONLINE' : percent > 0 ? 'SYNCING' : 'STANDBY';

      return { name, percent, status };
    });
  }, [progress]);

  const telemetryLeft = useMemo(() => {
    return [
      { name: TELEMETRY_LEFT[0], value: `${Math.max(1, Math.round(10 - progress / 12))}MS` },
      { name: TELEMETRY_LEFT[1], value: `${Math.round(165 + progress * 0.95)} FPS` },
      { name: TELEMETRY_LEFT[2], value: `${Math.round(progress)}%` },
    ];
  }, [progress]);

  const telemetryRight = useMemo(() => {
    return [
      { name: TELEMETRY_RIGHT[0], value: `${Math.round(42 + progress * 0.44)}%` },
      { name: TELEMETRY_RIGHT[1], value: progress > 72 ? 'BOUND' : 'SYNC' },
      { name: TELEMETRY_RIGHT[2], value: `${Math.round(34 + progress * 0.12)}C` },
    ];
  }, [progress]);

  const terminalLines = useMemo(() => {
    const reached = BOOT_STEPS.filter((step) => progress >= step.threshold);
    const lines = reached.map((step, idx) => {
      const pct = clamp(step.threshold, 0, 100);
      const prefix = pct >= 100 ? 'DONE' : 'OK';
      return `[${String(pct).padStart(3, '0')}%] ${step.label.toLowerCase()} :: ${prefix}`;
    });

    if (progress < 100) {
      lines.push(
        `[${String(Math.round(progress)).padStart(3, '0')}%] ${activeStep.label.toLowerCase()} :: ${activeStep.detail.toLowerCase()}`
      );
    } else {
      lines.push('[100%] launch_ready :: efect shell online');
    }

    return lines.slice(-8).reverse();
  }, [progress, activeStep]);

  useEffect(() => {
    const intervalMs = Math.max(16, Math.round(duration / 240));

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;

        const next = Math.min(100, prev + buildProgressDelta(prev, turbo));
        return Number(next.toFixed(2));
      });

      setTick((prev) => prev + 1);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [duration, turbo]);

  useEffect(() => {
    if (progress < 100 || completeTriggeredRef.current) return;

    completeTriggeredRef.current = true;
    setProgress(100);

    const fadeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 320);

    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, 860);

    closeTimersRef.current.push(fadeTimer, completeTimer);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [progress, onComplete]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    const triggerTurbo = (x: number, y: number) => {
      setTurbo(true);

      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-5), { id, x, y }]);

      const removeTimer = window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 900);

      closeTimersRef.current.push(removeTimer);
    };

    const handleClick = (event: MouseEvent) => {
      triggerTurbo(event.clientX, event.clientY);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        triggerTurbo(window.innerWidth / 2, window.innerHeight / 2);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKey);
      closeTimersRef.current.forEach((id) => window.clearTimeout(id));
      closeTimersRef.current = [];
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: 99999,
        background:
          'radial-gradient(circle at center, rgba(8,12,20,0.96) 0%, rgba(3,5,10,1) 40%, rgba(0,0,0,1) 100%)',
        fontFamily: 'monospace',
        color: '#ffffff',
        opacity: visible ? 1 : 0,
        transition: 'opacity 520ms ease',
      }}
    >
      <style>
        {`
          @keyframes bs-grid-drift {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(40px, 40px, 0); }
          }

          @keyframes bs-scan-vertical {
            0% { transform: translateY(-110%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(110%); opacity: 0; }
          }

          @keyframes bs-scan-horizontal {
            0% { transform: translateX(-120%); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateX(120%); opacity: 0; }
          }

          @keyframes bs-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes bs-ring-spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes bs-ring-spin-reverse {
            from { transform: translate(-50%, -50%) rotate(360deg); }
            to { transform: translate(-50%, -50%) rotate(0deg); }
          }

          @keyframes bs-pulse {
            0%, 100% {
              box-shadow:
                0 0 25px ${color}22,
                0 0 80px ${color}12,
                inset 0 0 30px rgba(255,255,255,0.02);
            }
            50% {
              box-shadow:
                0 0 45px ${color}44,
                0 0 120px ${color}22,
                inset 0 0 40px rgba(255,255,255,0.035);
            }
          }

          @keyframes bs-text-glow {
            0%, 100% {
              text-shadow: 0 0 18px ${color}28, 0 0 55px ${color}0f;
            }
            50% {
              text-shadow: 0 0 26px ${color}66, 0 0 85px ${color}1f;
            }
          }

          @keyframes bs-stream {
            0% { transform: translateY(-180px); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(calc(100vh + 180px)); opacity: 0; }
          }

          @keyframes bs-ripple {
            0% {
              transform: translate(-50%, -50%) scale(0.2);
              opacity: 0.95;
            }
            100% {
              transform: translate(-50%, -50%) scale(3.2);
              opacity: 0;
            }
          }

          @keyframes bs-panel-sheen {
            0% { transform: translateX(-120%) skewX(-24deg); opacity: 0; }
            30% { opacity: 0.6; }
            100% { transform: translateX(220%) skewX(-24deg); opacity: 0; }
          }

          @keyframes bs-star-blink {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}
      </style>

      {/* Mouse glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(420px circle at ${mouse.x}% ${mouse.y}%, ${color}20, transparent 58%)`,
          transition: 'background 80ms linear',
        }}
      />

      {/* Star field */}
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: '#dffcff',
            opacity: star.opacity,
            boxShadow: `0 0 8px rgba(255,255,255,0.35)`,
            animation: `bs-star-blink 2.8s ease-in-out infinite`,
            animationDelay: star.delay,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Data streams */}
      {dataStreams.map((stream) => (
        <div
          key={stream.id}
          style={{
            position: 'absolute',
            left: stream.left,
            top: -220,
            width: 1,
            height: stream.height,
            background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
            opacity: stream.opacity,
            boxShadow: `0 0 10px ${color}`,
            animation: `bs-stream ${stream.duration} linear infinite`,
            animationDelay: stream.delay,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.22,
          animation: 'bs-grid-drift 14s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Scan lines */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          top: 0,
          opacity: 0.55,
          boxShadow: `0 0 18px ${color}`,
          animation: 'bs-scan-vertical 3.8s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          left: 0,
          opacity: 0.32,
          boxShadow: `0 0 18px ${color}`,
          animation: 'bs-scan-horizontal 4.2s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Noise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 2px, transparent 4px)',
          opacity: 0.08,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            position: 'fixed',
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            boxShadow: `0 0 28px ${color}`,
            animation: 'bs-ripple 900ms ease-out forwards',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}

      {/* Top info */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          right: 28,
          top: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          letterSpacing: 5,
          fontSize: '0.72rem',
          color: '#7b879a',
          zIndex: 5,
        }}
      >
        <div>EFECT // AIM TRAINER // QUANTUM_BOOT_SEQUENCE</div>
        <div style={{ color, fontWeight: 900 }}>{Math.round(progress)}%</div>
      </div>

      {/* Left telemetry */}
      <div
        style={{
          position: 'absolute',
          left: 28,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 180,
          display: 'grid',
          gap: 12,
          zIndex: 5,
        }}
      >
        {telemetryLeft.map((item) => (
          <div
            key={item.name}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(5,10,18,0.68)',
              border: `1px solid ${color}30`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                color: '#728198',
                fontSize: '0.62rem',
                letterSpacing: 3,
                marginBottom: 6,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                color: '#f6fbff',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Right telemetry */}
      <div
        style={{
          position: 'absolute',
          right: 28,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 180,
          display: 'grid',
          gap: 12,
          zIndex: 5,
        }}
      >
        {telemetryRight.map((item) => (
          <div
            key={item.name}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(5,10,18,0.68)',
              border: `1px solid ${color}30`,
              backdropFilter: 'blur(10px)',
              textAlign: 'right',
            }}
          >
            <div
              style={{
                color: '#728198',
                fontSize: '0.62rem',
                letterSpacing: 3,
                marginBottom: 6,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                color: '#f6fbff',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main core panel */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(980px, 74vw)',
          minHeight: 640,
          borderRadius: 28,
          padding: '42px 40px 34px',
          background:
            'linear-gradient(180deg, rgba(8,12,22,0.88), rgba(2,4,9,0.94) 58%, rgba(0,0,0,0.96))',
          border: `1px solid ${color}42`,
          backdropFilter: 'blur(18px)',
          overflow: 'hidden',
          animation: 'bs-pulse 2.8s ease-in-out infinite',
          zIndex: 6,
        }}
      >
        {/* Holographic sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(110deg, transparent 0%, transparent 42%, ${color}12 50%, transparent 58%, transparent 100%)`,
            animation: 'bs-panel-sheen 3.4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Orbital rings */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '31%',
            width: 340,
            height: 340,
            borderRadius: '50%',
            border: `1px solid ${color}20`,
            boxShadow: `0 0 22px ${color}12`,
            transform: 'translate(-50%, -50%)',
            animation: 'bs-ring-spin 14s linear infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '31%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            border: `1px dashed ${color}18`,
            transform: 'translate(-50%, -50%)',
            animation: 'bs-ring-spin-reverse 20s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Corners */}
        {[
          { top: 16, left: 16 },
          { top: 16, right: 16 },
          { bottom: 16, left: 16 },
          { bottom: 16, right: 16 },
        ].map((corner, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 26,
              height: 26,
              borderTop: corner.top !== undefined ? `2px solid ${color}` : undefined,
              borderBottom: corner.bottom !== undefined ? `2px solid ${color}` : undefined,
              borderLeft: corner.left !== undefined ? `2px solid ${color}` : undefined,
              borderRight: corner.right !== undefined ? `2px solid ${color}` : undefined,
              opacity: 0.9,
              ...corner,
            }}
          />
        ))}

        <div
          style={{
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 26,
              animation: 'bs-float 4.5s ease-in-out infinite',
            }}
          >
            <div
              style={{
                color,
                fontSize: '0.74rem',
                letterSpacing: 8,
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              HOLOGRAPHIC_BOOT_PROTOCOL
            </div>

            <div
              style={{
                fontSize: '4.35rem',
                fontWeight: 900,
                letterSpacing: '18px',
                color: '#f2f7fb',
                marginBottom: 12,
                animation: 'bs-text-glow 2.2s ease-in-out infinite',
              }}
            >
              EFECT
            </div>

            <div
              style={{
                color: '#cfe2f5',
                opacity: 0.92,
                fontSize: '0.94rem',
                letterSpacing: 6,
                fontWeight: 700,
              }}
            >
              AIM TRAINER // SCI-FI COMBAT INIT
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
                gap: 20,
              }}
            >
              <div
                style={{
                  color: color,
                  fontWeight: 900,
                  letterSpacing: 4,
                  fontSize: '0.82rem',
                }}
              >
                {activeStep.label}
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 900,
                  letterSpacing: 3,
                  fontSize: '0.92rem',
                }}
              >
                {Math.round(progress)}%
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                height: 16,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                }}
              />
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${color}, #00ffe0, #8fe9ff)`,
                  boxShadow: `0 0 16px ${color}, 0 0 32px ${color}55`,
                  transition: 'width 80ms linear',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#8b9bb0',
                  letterSpacing: 3,
                  fontSize: '0.7rem',
                }}
              >
                {activeStep.detail}
              </div>

              <div
                style={{
                  color: turbo ? color : '#728198',
                  letterSpacing: 3,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {turbo ? 'TURBO_SYNC_ENABLED' : 'STANDARD_BOOT_RATE'}
              </div>
            </div>
          </div>

          {/* Modules */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              marginTop: 20,
              marginBottom: 24,
            }}
          >
            {moduleStates.map((module) => (
              <div
                key={module.name}
                style={{
                  padding: '12px 14px 11px',
                  borderRadius: 14,
                  background:
                    module.status === 'ONLINE'
                      ? `${color}12`
                      : module.status === 'SYNCING'
                        ? 'rgba(255,215,90,0.08)'
                        : 'rgba(255,255,255,0.03)',
                  border:
                    module.status === 'ONLINE'
                      ? `1px solid ${color}48`
                      : module.status === 'SYNCING'
                        ? '1px solid rgba(255,215,90,0.32)'
                        : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    alignItems: 'center',
                    marginBottom: 9,
                  }}
                >
                  <div
                    style={{
                      color: '#f4f8fd',
                      fontSize: '0.76rem',
                      fontWeight: 900,
                      letterSpacing: 2,
                    }}
                  >
                    {module.name}
                  </div>

                  <div
                    style={{
                      color:
                        module.status === 'ONLINE'
                          ? color
                          : module.status === 'SYNCING'
                            ? '#ffd761'
                            : '#64758c',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      letterSpacing: 2,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {module.status}
                  </div>
                </div>

                <div
                  style={{
                    height: 4,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${module.percent}%`,
                      height: '100%',
                      borderRadius: 999,
                      background:
                        module.status === 'ONLINE'
                          ? `linear-gradient(90deg, ${color}, #9dfff3)`
                          : module.status === 'SYNCING'
                            ? 'linear-gradient(90deg, #ffcf52, #ffe9a7)'
                            : '#283341',
                      transition: 'width 80ms linear',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Terminal */}
          <div
            style={{
              borderRadius: 18,
              padding: '16px 18px',
              background: 'rgba(2,5,10,0.82)',
              border: `1px solid ${color}22`,
              minHeight: 152,
            }}
          >
            <div
              style={{
                color: color,
                fontSize: '0.72rem',
                letterSpacing: 4,
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              LIVE_SYSTEM_TERMINAL
            </div>

            <div style={{ display: 'grid', gap: 7 }}>
              {terminalLines.map((line, index) => (
                <div
                  key={`${line}-${index}-${tick}`}
                  style={{
                    color: index === 0 ? '#ffffff' : '#6f8198',
                    fontSize: '0.72rem',
                    letterSpacing: 2,
                    lineHeight: 1.5,
                    opacity: index === 0 ? 1 : 0.82 - index * 0.07,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span style={{ color }}>{'>'}</span> {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 5,
        }}
      >
        <div
          style={{
            color: '#7a8aa0',
            fontSize: '0.68rem',
            letterSpacing: 4,
            marginBottom: 6,
          }}
        >
          CLICK ANYWHERE OR PRESS SPACE TO TURBO SYNC
        </div>
        <div
          style={{
            color: color,
            fontSize: '0.64rem',
            letterSpacing: 4,
            opacity: 0.85,
          }}
        >
          SYSTEM AUTO-LAUNCHES AT 100%
        </div>
      </div>
    </div>
  );
}