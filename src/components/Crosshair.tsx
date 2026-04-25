import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

type CrosshairStyle = 'compact' | 'clean' | 'micro' | 'wide' | 'dot' | 'box';

type Segment = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  opacity?: number;
};

const CROSSHAIR_STYLE_KEY = 'efect_crosshair_style';

const VALID_STYLES: CrosshairStyle[] = ['compact', 'clean', 'micro', 'wide', 'dot', 'box'];

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
  canvasSize: number;
  pulse: boolean;
}) {
  const segments = useMemo(
    () => buildSegments(styleName, gap, size, thickness),
    [styleName, gap, size, thickness]
  );

  const center = canvasSize / 2;

  const outlineShadow = crosshairOutline
    ? `0 0 0 1px rgba(0,0,0,0.98), 0 0 9px ${color}, 0 0 18px ${color}, 0 0 32px ${color}70`
    : `0 0 8px ${color}, 0 0 16px ${color}, 0 0 28px ${color}55`;

  const softGlow = crosshairOutline
    ? `0 0 0 1px rgba(0,0,0,0.95), 0 0 13px ${color}, 0 0 28px ${color}88`
    : `0 0 13px ${color}, 0 0 28px ${color}66`;

  const dotSize =
    styleName === 'dot'
      ? Math.max(5, thickness * 2.4)
      : styleName === 'micro'
        ? Math.max(2, thickness + 1)
        : Math.max(3, thickness + 1);

  const showDot = dot || styleName === 'dot';

  const pulseScale = pulse ? 1.12 : 1;
  const pulseOpacity = pulse ? 0.95 : 0.72;

  return (
    <div
      style={{
        position: 'relative',
        width: canvasSize,
        height: canvasSize,
        transform: `scale(${pulseScale})`,
        transition: 'transform 70ms ease-out',
      }}
    >
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

      {pulse && (
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
        canvasSize={170}
        pulse={pulse}
      />
    </div>
  );
}