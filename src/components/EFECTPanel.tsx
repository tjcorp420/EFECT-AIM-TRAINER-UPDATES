import React from 'react';

type EFECTPanelSide = 'left' | 'top' | 'right' | 'none';
type EFECTPanelVariant = 'default' | 'glass' | 'solid' | 'danger';

interface EFECTPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
  title?: string;
  index?: string;
  side?: EFECTPanelSide;
  variant?: EFECTPanelVariant;
  glow?: boolean;
  compact?: boolean;
  hoverLift?: boolean;
  rightSlot?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function EFECTPanel({
  children,
  color = '#39ff14',
  title,
  index,
  side = 'left',
  variant = 'default',
  glow = true,
  compact = false,
  hoverLift = false,
  rightSlot,
  footer,
  style,
  className,
  ...divProps
}: EFECTPanelProps) {
  const activeColor = variant === 'danger' ? '#ff0055' : color;

  const background =
    variant === 'glass'
      ? 'linear-gradient(180deg, rgba(18,18,18,0.58), rgba(0,0,0,0.72))'
      : variant === 'solid'
        ? '#070707'
        : variant === 'danger'
          ? 'linear-gradient(180deg, rgba(35,0,12,0.72), rgba(0,0,0,0.94))'
          : 'linear-gradient(180deg, rgba(14,14,14,0.94), rgba(3,3,3,0.97))';

  const edgeBorder = `5px solid ${activeColor}`;
  const normalBorder = '1px solid rgba(255,255,255,0.08)';

  const baseShadow = glow
    ? `0 18px 45px rgba(0,0,0,0.5), 0 0 30px ${activeColor}14, inset 0 0 28px rgba(255,255,255,0.025)`
    : '0 18px 45px rgba(0,0,0,0.5), inset 0 0 28px rgba(255,255,255,0.025)';

  const hasHeader = Boolean(title || index || rightSlot);

  return (
    <div
      {...divProps}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background,
        border: normalBorder,
        borderLeft: side === 'left' ? edgeBorder : normalBorder,
        borderRight: side === 'right' ? edgeBorder : normalBorder,
        borderTop: side === 'top' ? edgeBorder : normalBorder,
        borderRadius: 12,
        padding: compact ? 20 : 30,
        boxShadow: baseShadow,
        backdropFilter: variant === 'glass' ? 'blur(18px)' : undefined,
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        divProps.onMouseEnter?.(e);

        if (!hoverLift) return;

        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 22px 60px rgba(0,0,0,0.58), 0 0 38px ${activeColor}24, inset 0 0 30px rgba(255,255,255,0.03)`;
      }}
      onMouseLeave={(e) => {
        divProps.onMouseLeave?.(e);

        if (!hoverLift) return;

        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = baseShadow;
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at top right, ${activeColor}13, transparent 45%)`,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent, ${activeColor}66, transparent)`,
          opacity: glow ? 0.8 : 0.3,
          zIndex: 0,
        }}
      />

      {hasHeader && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginBottom: compact ? 18 : 24,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 18,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {index && (
              <div
                style={{
                  color: activeColor,
                  fontSize: '0.75rem',
                  letterSpacing: 4,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                [{index}]
              </div>
            )}

            {title && (
              <h2
                style={{
                  margin: 0,
                  color: '#fff',
                  fontSize: compact ? '1rem' : '1.12rem',
                  letterSpacing: 4,
                  fontWeight: 900,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </h2>
            )}

            <div
              style={{
                marginTop: 12,
                height: 1,
                width: '100%',
                minWidth: 160,
                background: `linear-gradient(90deg, ${activeColor}, transparent)`,
                opacity: 0.5,
              }}
            />
          </div>

          {rightSlot && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              {rightSlot}
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: compact ? 18 : 24,
            paddingTop: compact ? 14 : 18,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}