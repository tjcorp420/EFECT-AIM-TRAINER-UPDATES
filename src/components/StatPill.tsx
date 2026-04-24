import React from 'react';

type StatPillVariant = 'default' | 'glass' | 'solid' | 'danger' | 'success';
type StatPillTrend = 'up' | 'down' | 'flat';
type StatPillAlign = 'left' | 'center' | 'right';

interface StatPillProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  color?: string;
  danger?: boolean;
  icon?: React.ReactNode;
  subValue?: string | number;
  trend?: StatPillTrend;
  variant?: StatPillVariant;
  compact?: boolean;
  pulse?: boolean;
  align?: StatPillAlign;
  style?: React.CSSProperties;
  className?: string;
}

const getTrendSymbol = (trend?: StatPillTrend) => {
  if (trend === 'up') return '▲';
  if (trend === 'down') return '▼';
  if (trend === 'flat') return '◆';
  return '';
};

const getTrendColor = (trend: StatPillTrend | undefined, baseColor: string) => {
  if (trend === 'up') return '#00ffaa';
  if (trend === 'down') return '#ff0055';
  if (trend === 'flat') return '#ffaa00';
  return baseColor;
};

export default function StatPill({
  label,
  value,
  color = '#39ff14',
  danger = false,
  icon,
  subValue,
  trend,
  variant = 'default',
  compact = false,
  pulse = false,
  align = 'left',
  style,
  className,
  ...divProps
}: StatPillProps) {
  const activeColor =
    danger || variant === 'danger'
      ? '#ff0055'
      : variant === 'success'
        ? '#00ffaa'
        : color;

  const trendColor = getTrendColor(trend, activeColor);

  const background =
    variant === 'glass'
      ? 'linear-gradient(180deg, rgba(8,8,8,0.5), rgba(0,0,0,0.72))'
      : variant === 'solid'
        ? '#070707'
        : variant === 'danger'
          ? 'linear-gradient(180deg, rgba(35,0,12,0.65), rgba(0,0,0,0.9))'
          : variant === 'success'
            ? 'linear-gradient(180deg, rgba(0,35,20,0.45), rgba(0,0,0,0.9))'
            : 'rgba(0,0,0,0.62)';

  return (
    <div
      {...divProps}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background,
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${activeColor}`,
        borderRadius: 8,
        padding: compact ? '10px 13px' : '13px 18px',
        boxShadow: `0 12px 28px rgba(0,0,0,0.38), 0 0 18px ${activeColor}14`,
        minWidth: compact ? 112 : 150,
        textAlign: align,
        backdropFilter: variant === 'glass' ? 'blur(12px)' : undefined,
        fontFamily: 'monospace',
        ...style,
      }}
    >
      <style>{`
        @keyframes statPillPulse {
          0%, 100% { opacity: 0.35; transform: translateX(-25%); }
          50% { opacity: 0.9; transform: translateX(25%); }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at top right, ${activeColor}16, transparent 48%)`,
        }}
      />

      {pulse && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-30%',
            width: '60%',
            background: `linear-gradient(90deg, transparent, ${activeColor}16, transparent)`,
            animation: 'statPillPulse 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent:
            align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          gap: 8,
          color: '#555',
          fontSize: compact ? '0.62rem' : '0.68rem',
          letterSpacing: compact ? 2 : 3,
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        {icon && (
          <span
            style={{
              color: activeColor,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}

        <span>{label}</span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          color: '#fff',
          fontWeight: 900,
          marginTop: compact ? 4 : 6,
          letterSpacing: 1,
          textShadow: `0 0 10px ${activeColor}33`,
          fontSize: compact ? '0.85rem' : '1rem',
          display: 'flex',
          justifyContent:
            align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          alignItems: 'baseline',
          gap: 8,
          lineHeight: 1.2,
        }}
      >
        {trend && (
          <span
            style={{
              color: trendColor,
              fontSize: compact ? '0.62rem' : '0.72rem',
              textShadow: `0 0 10px ${trendColor}55`,
            }}
          >
            {getTrendSymbol(trend)}
          </span>
        )}

        <span>{value}</span>
      </div>

      {subValue !== undefined && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            color: '#666',
            marginTop: 5,
            fontSize: compact ? '0.58rem' : '0.68rem',
            letterSpacing: 1,
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}