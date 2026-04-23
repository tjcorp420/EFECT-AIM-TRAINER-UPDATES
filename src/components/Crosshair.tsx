import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export default function Crosshair() {
  const { color, size, thickness, gap, dot, crosshairOutline, hitmarkerTrigger, isFiring, mapTheme } = useStore();
  const [showHitmarker, setShowHitmarker] = useState(false);

  // Dynamic recoil gap expands further when firing
  const dynamicGap = isFiring ? gap + (size * 0.4) : gap;

  // Listens for the exact millisecond a hit registers
  useEffect(() => {
    if (hitmarkerTrigger > 0) {
      setShowHitmarker(true);
      // 250ms exactly matches the CSS animation duration for a clean unmount
      const timer = setTimeout(() => setShowHitmarker(false), 250); 
      return () => clearTimeout(timer);
    }
  }, [hitmarkerTrigger]);

  const isMinimal = mapTheme === 'minimal';
  
  // Standard CSS trick for a crisp 1px black outline around the reticle
  const outlineFilter = crosshairOutline 
    ? 'drop-shadow(1px 1px 0px #000) drop-shadow(-1px -1px 0px #000) drop-shadow(1px -1px 0px #000) drop-shadow(-1px 1px 0px #000)'
    : 'none';

  // Glow is disabled in minimal mode, or if outlines are on (outlines + glow looks muddy)
  const glow = (isMinimal || crosshairOutline)
    ? 'none' 
    : `0 0 8px ${color}, 0 0 4px ${color}`;
    
  const blendModeStr = isMinimal ? 'normal' : 'screen';

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 100 }}>
      
      {/* EFECT COMBAT HITMARKER (The Red X) */}
      {showHitmarker && (
        <div key={hitmarkerTrigger} className="hitmarker-container">
          <div className="hitmarker-line" style={{ width: Math.max(thickness * 1.5, 2), height: size * 1.5, top: -size * 0.75 - gap, left: -Math.max(thickness * 0.75, 1), transform: 'rotate(45deg)' }} />
          <div className="hitmarker-line" style={{ width: Math.max(thickness * 1.5, 2), height: size * 1.5, top: -size * 0.75 - gap, left: -Math.max(thickness * 0.75, 1), transform: 'rotate(-45deg)' }} />
          <div className="hitmarker-line" style={{ width: Math.max(thickness * 1.5, 2), height: size * 1.5, top: gap, left: -Math.max(thickness * 0.75, 1), transform: 'rotate(45deg)' }} />
          <div className="hitmarker-line" style={{ width: Math.max(thickness * 1.5, 2), height: size * 1.5, top: gap, left: -Math.max(thickness * 0.75, 1), transform: 'rotate(-45deg)' }} />
        </div>
      )}

      {/* CORE RETICLE */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        mixBlendMode: blendModeStr as any,
        filter: outlineFilter 
      }}>
        
        {/* Crosshair Lines */}
        <div style={{ position: 'absolute', bottom: dynamicGap, left: -thickness / 2, width: thickness, height: size, backgroundColor: color, boxShadow: glow, transition: 'bottom 0.05s ease-out' }} />
        <div style={{ position: 'absolute', top: dynamicGap, left: -thickness / 2, width: thickness, height: size, backgroundColor: color, boxShadow: glow, transition: 'top 0.05s ease-out' }} />
        <div style={{ position: 'absolute', right: dynamicGap, top: -thickness / 2, width: size, height: thickness, backgroundColor: color, boxShadow: glow, transition: 'right 0.05s ease-out' }} />
        <div style={{ position: 'absolute', left: dynamicGap, top: -thickness / 2, width: size, height: thickness, backgroundColor: color, boxShadow: glow, transition: 'left 0.05s ease-out' }} />
        
        {/* Center Dot */}
        {dot && <div style={{ position: 'absolute', top: -thickness / 2, left: -thickness / 2, width: thickness, height: thickness, backgroundColor: color, boxShadow: glow }} />}
      </div>
    </div>
  );
}