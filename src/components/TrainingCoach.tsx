import { useStore } from '../store/useStore';
import { generateCoachReport } from '../store/coachEngine';

interface TrainingCoachProps {
  color?: string;
}

export default function TrainingCoach({ color = '#39ff14' }: TrainingCoachProps) {
  const lastSessionStats = useStore((s: any) => s.lastSessionStats);
  const sessionHistory = useStore((s: any) => s.sessionHistory || []);

  const report = generateCoachReport(lastSessionStats, sessionHistory);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(14,14,14,0.92), rgba(3,3,3,0.96))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `5px solid ${color}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: `0 18px 45px rgba(0,0,0,0.45), 0 0 25px ${color}16`,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ color, fontSize: '0.8rem', letterSpacing: 5, fontWeight: 900 }}>
        AI_COACH_LAYER
      </div>

      <h3
        style={{
          margin: '10px 0 16px',
          color: '#fff',
          letterSpacing: 3,
          fontSize: '1.1rem',
        }}
      >
        {report.title}
      </h3>

      <div style={{ color: '#bbb', lineHeight: 1.7, letterSpacing: 1, fontSize: '0.9rem' }}>
        {report.summary}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 16,
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid ${color}33`,
          borderRadius: 8,
          color,
          fontWeight: 900,
          letterSpacing: 2,
          fontSize: '0.85rem',
        }}
      >
        NEXT_DRILL: {report.nextDrill}
      </div>
    </div>
  );
}
