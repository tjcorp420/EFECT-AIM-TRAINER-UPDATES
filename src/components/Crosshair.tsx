import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

type CrosshairStyle =
  | 'compact'
  | 'clean'
  | 'micro'
  | 'wide'
  | 'dot'
  | 'box'
  | 'circle'
  | 'diamond'
  | 'brackets'
  | 'plus'
  | 'triad'
  | 'hybrid';

type Segment = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  opacity?: number;
  rotate?: number;
};

const CROSSHAIR_STYLE_KEY = 'efect_crosshair_style';

const VALID_STYLES: CrosshairStyle[] = [
  'compact',
  'clean',
  'micro',
  'wide',
  'dot',
  'box',
  'circle',
  'diamond',
  'brackets',
  'plus',
  'triad',
  'hybrid',
];

const readCrosshairStyle = (): CrosshairStyle => {
  if (typeof window === 'undefined') return 'compact';

  const saved = window.localStorage.getItem(CROSSHAIR_STYLE_KEY) as CrosshairStyle | null;

  if (saved && VALID_STYLES.includes(saved)) {
    return saved;
  }

  return 'compact';
};

const buildSegments = (
  style: CrosshairStyle,
  gap: number,
  size: number,
  thickness: number
): Segment[] => {
  const t = Math.max(1, thickness);
  const g = Math.max(0, gap);
  const s = Math.max(2, size);

  switch (style) {
    case 'clean': {
      // Fortnite-style clean T crosshair: left, right, bottom, open top.
      const side = Math.max(8, s);
      const bottom = Math.max(9, Math.round(s * 1.08));

      return [
        { x: -(g + side / 2), y: 0, w: side, h: t, radius: t },
        { x: g + side / 2, y: 0, w: side, h: t, radius: t },
        { x: 0, y: g + bottom / 2, w: t, h: bottom, radius: t },
      ];
    }

    case 'micro': {
      const ms = Math.max(3, Math.round(s * 0.55));
      const mg = Math.max(1, Math.round(g * 0.62));
      const mt = Math.max(1, Math.round(t * 0.9));

      return [
        { x: 0, y: -(mg + ms / 2), w: mt, h: ms, radius: mt },
        { x: 0, y: mg + ms / 2, w: mt, h: ms, radius: mt },
        { x: -(mg + ms / 2), y: 0, w: ms, h: mt, radius: mt },
        { x: mg + ms / 2, y: 0, w: ms, h: mt, radius: mt },
      ];
    }

    case 'wide': {
      const horizontal = Math.max(10, Math.round(s * 1.75));
      const vertical = Math.max(5, Math.round(s * 0.92));
      const wideGap = Math.max(6, Math.round(g * 1.25));

      return [
        { x: 0, y: -(wideGap + vertical / 2), w: t, h: vertical, radius: t },
        { x: 0, y: wideGap + vertical / 2, w: t, h: vertical, radius: t },
        { x: -(wideGap + horizontal / 2), y: 0, w: horizontal, h: t, radius: t },
        { x: wideGap + horizontal / 2, y: 0, w: horizontal, h: t, radius: t },
      ];
    }

    case 'box': {
      const d = Math.max(7, g + Math.round(s * 0.45));
      const len = Math.max(6, Math.round(s * 0.78));
      const bt = Math.max(1, t);

      return [
        // top-left
        { x: -d, y: -(d + len / 2), w: bt, h: len, radius: bt },
        { x: -(d + len / 2), y: -d, w: len, h: bt, radius: bt },

        // top-right
        { x: d, y: -(d + len / 2), w: bt, h: len, radius: bt },
        { x: d + len / 2, y: -d, w: len, h: bt, radius: bt },

        // bottom-left
        { x: -d, y: d + len / 2, w: bt, h: len, radius: bt },
        { x: -(d + len / 2), y: d, w: len, h: bt, radius: bt },

        // bottom-right
        { x: d, y: d + len / 2, w: bt, h: len, radius: bt },
        { x: d + len / 2, y: d, w: len, h: bt, radius: bt },
      ];
    }

    case 'brackets': {
      const d = Math.max(9, g + Math.round(s * 0.72));
      const len = Math.max(7, Math.round(s * 0.72));

      return [
        { x: -d, y: -(d + len / 2), w: t, h: len, radius: t },
        { x: -(d + len / 2), y: -d, w: len, h: t, radius: t },
        { x: d, y: -(d + len / 2), w: t, h: len, radius: t },
        { x: d + len / 2, y: -d, w: len, h: t, radius: t },
        { x: -d, y: d + len / 2, w: t, h: len, radius: t },
        { x: -(d + len / 2), y: d, w: len, h: t, radius: t },
        { x: d, y: d + len / 2, w: t, h: len, radius: t },
        { x: d + len / 2, y: d, w: len, h: t, radius: t },
      ];
    }

    case 'plus': {
      const len = Math.max(7, Math.round(s * 0.72));

      return [
        { x: 0, y: 0, w: t, h: len, radius: t },
        { x: 0, y: 0, w: len, h: t, radius: t },
      ];
    }

    case 'triad': {
      const len = Math.max(8, Math.round(s * 0.95));
      const triGap = Math.max(5, g);

      return [
        { x: 0, y: -(triGap + len / 2), w: t, h: len, radius: t },
        { x: -(triGap + len / 2), y: triGap * 0.72, w: len, h: t, radius: t, rotate: 28 },
        { x: triGap + len / 2, y: triGap * 0.72, w: len, h: t, radius: t, rotate: -28 },
      ];
    }

    case 'hybrid': {
      const inner = Math.max(5, Math.round(s * 0.52));
      const outer = Math.max(9, Math.round(s * 0.95));
      const outerGap = Math.max(6, Math.round(g * 1.3));

      return [
        { x: 0, y: -(g + inner / 2), w: t, h: inner, radius: t },
        { x: 0, y: g + inner / 2, w: t, h: inner, radius: t },
        { x: -(g + inner / 2), y: 0, w: inner, h: t, radius: t },
        { x: g + inner / 2, y: 0, w: inner, h: t, radius: t },
        { x: -(outerGap + outer / 2), y: 0, w: outer, h: Math.max(1, t - 1), radius: t, opacity: 0.42 },
        { x: outerGap + outer / 2, y: 0, w: outer, h: Math.max(1, t - 1), radius: t, opacity: 0.42 },
      ];
    }

    case 'circle':
    case 'diamond':
    case 'dot':
      return [];

    case 'compact':
    default:
      return [
        { x: 0, y: -(g + s / 2), w: t, h: s, radius: t },
        { x: 0, y: g + s / 2, w: t, h: s, radius: t },
        { x: -(g + s / 2), y: 0, w: s, h: t, radius: t },
        { x: g + s / 2, y: 0, w: s, h: t, radius: t },
      ];
  }
};

function CrosshairArt({
  styleName,
  color,
  gap,
  size,
  thickness,
  dot,
  crosshairOutline,
  crosshairOpacity,
  crosshairGlow,
  crosshairDotScale,
  crosshairHitReact,
  canvasSize,
  pulse,
}: {
  styleName: CrosshairStyle;
  color: string;
  gap: number;
  size: number;
  thickness: number;
  dot: boolean;
  crosshairOutline: boolean;
  crosshairOpacity: number;
  crosshairGlow: number;
  crosshairDotScale: number;
  crosshairHitReact: 'off' | 'pulse' | 'burst';
  canvasSize: number;
  pulse: boolean;
}) {
  const segments = useMemo(
    () => buildSegments(styleName, gap, size, thickness),
    [styleName, gap, size, thickness]
  );

  const center = canvasSize / 2;

  const glow = Math.max(0, crosshairGlow);
  const glowA = Math.round(8 * glow);
  const glowB = Math.round(17 * glow);
  const glowC = Math.round(30 * glow);

  const outlineShadow = crosshairOutline
    ? `0 0 0 1px rgba(0,0,0,0.98), 0 0 ${glowA}px ${color}, 0 0 ${glowB}px ${color}, 0 0 ${glowC}px ${color}70`
    : `0 0 ${glowA}px ${color}, 0 0 ${glowB}px ${color}, 0 0 ${glowC}px ${color}55`;

  const softGlow = crosshairOutline
    ? `0 0 0 1px rgba(0,0,0,0.95), 0 0 ${Math.round(12 * glow)}px ${color}, 0 0 ${Math.round(28 * glow)}px ${color}88`
    : `0 0 ${Math.round(12 * glow)}px ${color}, 0 0 ${Math.round(28 * glow)}px ${color}66`;

  const dotSize =
    styleName === 'dot'
      ? Math.max(5, thickness * 2.4 * crosshairDotScale)
      : styleName === 'micro'
        ? Math.max(2, (thickness + 1) * crosshairDotScale)
        : Math.max(3, (thickness + 1) * crosshairDotScale);

  const showDot = dot || styleName === 'dot';

  const shouldReact = crosshairHitReact !== 'off' && pulse;
  const pulseScale = shouldReact ? 1.12 : 1;
  const pulseOpacity = shouldReact ? 0.95 : 0.72;

  return (
    <div
      style={{
        position: 'relative',
        width: canvasSize,
        height: canvasSize,
        opacity: crosshairOpacity,
        transform: `scale(${pulseScale})`,
        transition: 'transform 70ms ease-out',
      }}
    >
      {(styleName === 'circle' || styleName === 'diamond') && (
        <div
          style={{
            position: 'absolute',
            left: center - Math.max(10, gap + size * 0.8),
            top: center - Math.max(10, gap + size * 0.8),
            width: Math.max(20, (gap + size * 0.8) * 2),
            height: Math.max(20, (gap + size * 0.8) * 2),
            borderRadius: styleName === 'circle' ? '50%' : 4,
            border: `${Math.max(1, thickness)}px solid ${color}`,
            opacity: styleName === 'circle' ? 0.9 : 0.84,
            transform: styleName === 'diamond' ? 'rotate(45deg)' : 'none',
            boxShadow: outlineShadow,
          }}
        />
      )}

      {styleName === 'box' && (
        <div
          style={{
            position: 'absolute',
            left: center - Math.max(12, size * 0.74),
            top: center - Math.max(12, size * 0.74),
            width: Math.max(24, size * 1.48),
            height: Math.max(24, size * 1.48),
            border: `1px solid ${color}`,
            opacity: 0.13,
            borderRadius: 4,
            boxShadow: `0 0 18px ${color}55`,
          }}
        />
      )}

      {styleName === 'dot' && (
        <div
          style={{
            position: 'absolute',
            left: center - Math.max(12, size * 1.6) / 2,
            top: center - Math.max(12, size * 1.6) / 2,
            width: Math.max(12, size * 1.6),
            height: Math.max(12, size * 1.6),
            borderRadius: '50%',
            border: `1px solid ${color}`,
            opacity: 0.22,
            boxShadow: `0 0 20px ${color}55`,
          }}
        />
      )}

      {segments.map((seg, index) => (
        <div
          key={`${styleName}-${index}`}
          style={{
            position: 'absolute',
            left: center + seg.x - seg.w / 2,
            top: center + seg.y - seg.h / 2,
            width: seg.w,
            height: seg.h,
            borderRadius: seg.radius ?? Math.max(1, thickness / 2),
            background: color,
            opacity: seg.opacity ?? 1,
            boxShadow: outlineShadow,
            transform: seg.rotate ? `rotate(${seg.rotate}deg)` : 'none',
          }}
        />
      ))}

      {showDot && (
        <div
          style={{
            position: 'absolute',
            left: center - dotSize / 2,
            top: center - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: color,
            boxShadow: softGlow,
          }}
        />
      )}

      {shouldReact && (
        <div
          style={{
            position: 'absolute',
            left: center - 19,
            top: center - 19,
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            opacity: pulseOpacity,
            boxShadow: `0 0 22px ${color}99`,
            transform: 'scale(1.18)',
            transition: 'opacity 80ms ease-out, transform 80ms ease-out',
          }}
        />
      )}

      {crosshairHitReact === 'burst' && pulse && (
        <>
          {[28, 40, 54].map((ring, index) => (
            <div
              key={ring}
              style={{
                position: 'absolute',
                left: center - ring / 2,
                top: center - ring / 2,
                width: ring,
                height: ring,
                borderRadius: '50%',
                border: `1px solid ${index === 1 ? '#39ff14' : color}`,
                opacity: 0.5 - index * 0.12,
                boxShadow: `0 0 ${16 + index * 6}px ${color}88`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default function Crosshair() {
  const {
    color,
    gap = 5,
    size = 8,
    thickness = 2,
    dot = true,
    crosshairOutline = true,
    crosshairOpacity = 1,
    crosshairGlow = 1,
    crosshairDotScale = 1,
    crosshairHitReact = 'pulse',
  } = useStore();

  const [styleName, setStyleName] = useState<CrosshairStyle>(readCrosshairStyle);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const syncStyle = () => {
      setStyleName(readCrosshairStyle());
    };

    window.addEventListener('storage', syncStyle);
    window.addEventListener('efect-crosshair-style', syncStyle as EventListener);

    return () => {
      window.removeEventListener('storage', syncStyle);
      window.removeEventListener('efect-crosshair-style', syncStyle as EventListener);
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    const triggerPulse = () => {
      setPulse(true);

      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        setPulse(false);
      }, 75);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        triggerPulse();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('hit-marker', triggerPulse);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('hit-marker', triggerPulse);

      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        zIndex: 120,
      }}
    >
      <CrosshairArt
        styleName={styleName}
        color={color}
        gap={gap}
        size={size}
        thickness={thickness}
        dot={dot}
        crosshairOutline={crosshairOutline}
        crosshairOpacity={crosshairOpacity}
        crosshairGlow={crosshairGlow}
        crosshairDotScale={crosshairDotScale}
        crosshairHitReact={crosshairHitReact}
        canvasSize={170}
        pulse={pulse}
      />
    </div>
  );
}
