import EFECTButton from './EFECTButton';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  color?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  color = '#39ff14',
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: 'calc(100vw - 36px)',
          background: 'linear-gradient(180deg, rgba(16,16,16,0.98), rgba(0,0,0,0.98))',
          border: `1px solid ${danger ? '#ff0055' : color}`,
          borderTop: `4px solid ${danger ? '#ff0055' : color}`,
          borderRadius: 14,
          padding: 30,
          boxShadow: `0 0 42px ${danger ? 'rgba(255,0,85,0.35)' : color + '55'}`,
        }}
      >
        <div
          style={{
            color: danger ? '#ff0055' : color,
            letterSpacing: 5,
            fontWeight: 900,
            fontSize: '0.8rem',
            marginBottom: 12,
          }}
        >
          SYSTEM_CONFIRMATION
        </div>

        <h2
          style={{
            margin: 0,
            color: '#fff',
            letterSpacing: 3,
            fontSize: '1.5rem',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: '#aaa',
            lineHeight: 1.7,
            marginTop: 18,
            marginBottom: 28,
            letterSpacing: 1,
          }}
        >
          {message}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <EFECTButton color={color} variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </EFECTButton>

          <EFECTButton color={color} variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </EFECTButton>
        </div>
      </div>
    </div>
  );
}
