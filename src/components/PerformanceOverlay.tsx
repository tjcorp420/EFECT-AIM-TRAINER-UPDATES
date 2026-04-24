import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';

export default function PerformanceOverlay() {
  const color = useStore((s) => s.color);
  const graphicsQuality = useStore((s) => s.graphicsQuality);
  const gameState = useStore((s) => s.gameState);

  const frames = useRef(0);
  const lastTime = useRef(performance.now());
  const raf = useRef<number | null>(null);

  const [fps, setFps] = useState(0);

  useEffect(() => {
    const tick = () => {
      frames.current += 1;
      const now = performance.now();

      if (now - lastTime.current >= 1000) {
        setFps(frames.current);
        frames.current = 0;
        lastTime.current = now;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (gameState === 'login') return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 18,
        bottom: 18,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.62)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: '10px 14px',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '0.72rem',
        letterSpacing: 2,
        pointerEvents: 'none',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ color: '#555' }}>PERFORMANCE</div>
      <div style={{ color }}>{fps} FPS</div>
      <div style={{ color: '#888' }}>{graphicsQuality.toUpperCase()}</div>
    </div>
  );
}