import EFECTButton from './EFECTButton';
import StatPill from './StatPill';

interface TopNavProps {
  title: string;
  subtitle?: string;
  color?: string;
  username?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function TopNav({
  title,
  subtitle,
  color = '#39ff14',
  username,
  onBack,
  backLabel = 'BACK',
  rightAction,
}: TopNavProps) {
  return (
    <div
      style={{
        width: '92%',
        maxWidth: 1600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 22,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 22,
        fontFamily: 'monospace',
      }}
    >
      <div>
        {onBack && (
          <EFECTButton color={color} variant="ghost" onClick={onBack}>
            &lt; {backLabel}
          </EFECTButton>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            color,
            letterSpacing: 8,
            fontSize: '0.78rem',
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          EFECT_SYSTEM_INTERFACE
        </div>

        <h1
          style={{
            margin: 0,
            color: '#fff',
            fontSize: 'clamp(2.4rem, 4vw, 4rem)',
            letterSpacing: 'clamp(8px, 1.5vw, 18px)',
            textShadow: `0 0 36px ${color}`,
            fontWeight: 900,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <div style={{ marginTop: 8, color: '#666', letterSpacing: 4 }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
        {username && <StatPill label="AGENT" value={username} color={color} />}

        {rightAction && (
          <EFECTButton color={color} variant="primary" onClick={rightAction.onClick}>
            {rightAction.label}
          </EFECTButton>
        )}
      </div>
    </div>
  );
}