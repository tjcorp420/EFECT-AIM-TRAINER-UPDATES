import React from 'react';

type EFECTButtonVariant = 'primary' | 'dark' | 'ghost' | 'danger';
type EFECTButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface EFECTButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  variant?: EFECTButtonVariant;
  size?: EFECTButtonSize;
  fullWidth?: boolean;
  height?: number;
  fontSize?: string;
  letterSpacing?: number;
  subLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pulse?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

const getSizePreset = (size: EFECTButtonSize) => {
  if (size === 'sm') {
    return {
      height: 42,
      fontSize: '0.76rem',
      padding: '0 16px',
      letterSpacing: 2,
    };
  }

  if (size === 'lg') {
    return {
      height: 68,
      fontSize: '1rem',
      padding: '0 26px',
      letterSpacing: 4,
    };
  }

  if (size === 'xl') {
    return {
      height: 78,
      fontSize: '1.25rem',
      padding: '0 34px',
      letterSpacing: 6,
    };
  }

  return {
    height: 58,
    fontSize: '0.95rem',
    padding: '0 22px',
    letterSpacing: 3,
  };
};

export default function EFECTButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  color = '#39ff14',
  variant = 'dark',
  size = 'md',
  fullWidth = false,
  height,
  fontSize,
  letterSpacing,
  subLabel,
  leftIcon,
  rightIcon,
  pulse = false,
  style,
  type = 'button',
  className,
  ...buttonProps
}: EFECTButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const isInactive = disabled || loading;

  const sizePreset = getSizePreset(size);

  const finalHeight = height ?? sizePreset.height;
  const finalFontSize = fontSize ?? sizePreset.fontSize;
  const finalLetterSpacing = letterSpacing ?? sizePreset.letterSpacing;

  const activeColor = isDanger ? '#ff0055' : color;

  const bg = isInactive
    ? '#111'
    : isPrimary
      ? color
      : isDanger
        ? 'linear-gradient(145deg, rgba(255,0,85,0.3), rgba(0,0,0,0.92))'
        : isGhost
          ? 'rgba(0,0,0,0.34)'
          : 'linear-gradient(180deg, rgba(18,18,18,0.96), rgba(2,2,2,0.98))';

  const textColor = isInactive
    ? '#555'
    : isPrimary
      ? '#000'
      : isDanger
        ? '#ff7aa2'
        : '#fff';

  const borderColor = isInactive
    ? '#333'
    : isDanger
      ? '#ff0055'
      : isPrimary
        ? color
        : color + '66';

  const baseShadow = isInactive
    ? 'none'
    : isPrimary
      ? `0 0 32px ${color}55`
      : isDanger
        ? '0 0 24px rgba(255,0,85,0.25)'
        : `inset 0 0 20px rgba(255,255,255,0.025), 0 0 18px ${color}18`;

  const hoverShadow = isPrimary
    ? `0 0 46px ${color}88`
    : isDanger
      ? '0 0 36px rgba(255,0,85,0.45)'
      : `0 0 30px ${color}35, inset 0 0 24px rgba(255,255,255,0.045)`;

  return (
    <button
      {...buttonProps}
      type={type}
      className={className}
      disabled={isInactive}
      onClick={onClick}
      style={{
        width: fullWidth ? '100%' : undefined,
        height: finalHeight,
        padding: sizePreset.padding,
        background: bg,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 9,
        cursor: isInactive ? 'not-allowed' : 'pointer',
        fontFamily: 'monospace',
        fontWeight: 900,
        fontSize: finalFontSize,
        letterSpacing: finalLetterSpacing,
        textTransform: 'uppercase',
        boxShadow: baseShadow,
        transition:
          'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, color 160ms ease, filter 160ms ease',
        position: 'relative',
        overflow: 'hidden',
        opacity: isInactive ? 0.72 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        isolation: 'isolate',
        ...style,
      }}
      onMouseEnter={(e) => {
        buttonProps.onMouseEnter?.(e);

        if (isInactive) return;

        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = hoverShadow;
        e.currentTarget.style.borderColor = activeColor;

        if (!isPrimary && !isDanger) {
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        buttonProps.onMouseLeave?.(e);

        if (isInactive) return;

        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = baseShadow;
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.color = textColor;
      }}
      onMouseDown={(e) => {
        buttonProps.onMouseDown?.(e);

        if (isInactive) return;

        e.currentTarget.style.transform = 'translateY(0) scale(0.985)';
      }}
      onMouseUp={(e) => {
        buttonProps.onMouseUp?.(e);

        if (isInactive) return;

        e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: `radial-gradient(circle at center, ${activeColor}18, transparent 58%)`,
          opacity: isInactive ? 0 : 1,
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: `linear-gradient(90deg, transparent, ${activeColor}22, transparent)`,
          transform: 'translateX(-120%)',
          animation: pulse && !isInactive ? 'efectBtnSweep 1.8s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes efectBtnSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes efectBtnLoading {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: `2px solid ${isPrimary ? '#00000055' : activeColor + '55'}`,
            borderTopColor: isPrimary ? '#000' : activeColor,
            animation: 'efectBtnLoading 0.7s linear infinite',
            flexShrink: 0,
          }}
        />
      ) : (
        leftIcon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {leftIcon}
          </span>
        )
      )}

      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.05,
        }}
      >
        <span>{loading ? 'PROCESSING' : children}</span>

        {subLabel && (
          <span
            style={{
              marginTop: 6,
              fontSize: '0.58rem',
              letterSpacing: 2,
              opacity: isPrimary ? 0.7 : 0.62,
              fontWeight: 900,
            }}
          >
            {subLabel}
          </span>
        )}
      </span>

      {!loading && rightIcon && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}