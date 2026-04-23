import { useMemo } from 'react';
import { useStore } from '../store/useStore';

export default function SessionReview() {
  const { score, shots, hitLog, drillDuration, color, scenario, highScores, goToScenarios, startGame } = useStore();

  const accuracy = shots > 0 ? Math.round((score / shots) * 100) : 0;
  const pb = highScores[scenario] || 0;
  const isNewPB = score > pb;

  // Process raw hits into a 10-segment Hits Per Second (HPS) chart
  const chartData = useMemo(() => {
    const buckets = 10;
    const bucketSize = drillDuration / buckets;
    const data = Array(buckets).fill(0);
    
    hitLog.forEach(time => {
      const bucketIndex = Math.min(Math.floor(time / bucketSize), buckets - 1);
      data[bucketIndex]++;
    });
    
    return data.map(hits => hits / bucketSize); // Convert to HPS
  }, [hitLog, drillDuration]);

  const maxHPS = Math.max(...chartData, 1);
  const avgHPS = (hitLog.length / drillDuration).toFixed(1);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 60,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'monospace', color: '#fff'
    }}>
      <h1 style={{ color: color, fontSize: '3rem', letterSpacing: '10px', textShadow: `0 0 20px ${color}`, margin: '0 0 10px 0', textTransform: 'uppercase' }}>
        SESSION REVIEW
      </h1>
      <h3 style={{ color: '#888', letterSpacing: '4px', margin: '0 0 40px 0', textTransform: 'uppercase' }}>
        MODULE: {scenario.replace('_', ' ')}
      </h3>

      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', width: '90%', maxWidth: '1200px' }}>
        
        {/* LEFT COLUMN: RAW STATS */}
        <div style={{ flex: 1, background: 'rgba(15,15,15,0.9)', border: `1px solid ${color}`, borderRadius: '12px', padding: '30px', boxShadow: `0 0 30px ${color}15` }}>
          <div style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '10px' }}>FINAL SCORE</div>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: color, textShadow: `0 0 15px ${color}`, marginBottom: '5px' }}>{score.toLocaleString()}</div>
          {isNewPB ? (
            <div style={{ color: '#00ffaa', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '2px', background: 'rgba(0,255,170,0.1)', padding: '5px 10px', display: 'inline-block', borderRadius: '4px' }}>🏆 NEW PERSONAL BEST</div>
          ) : (
            <div style={{ color: '#666', fontSize: '1rem' }}>Personal Best: {pb.toLocaleString()}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>ACCURACY</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{accuracy}%</div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>AVG HPS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{avgHPS}</div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>TARGETS HIT</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{hitLog.length}</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HPS CHART */}
        <div style={{ flex: 1.5, background: 'rgba(15,15,15,0.9)', border: `1px solid #333`, borderRadius: '12px', padding: '30px', position: 'relative' }}>
          <div style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <span>PERFORMANCE HEATMAP (HPS)</span>
            <span style={{ color: color }}>Peak: {maxHPS.toFixed(1)}</span>
          </div>
          
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
            {chartData.map((val, idx) => {
              const heightPct = (val / maxHPS) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${heightPct}%`, 
                    background: color, 
                    opacity: val > 0 ? 0.8 : 0.1,
                    boxShadow: val === maxHPS ? `0 0 15px ${color}` : 'none',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.5s ease-out'
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.8rem', marginTop: '10px' }}>
            <span>0s</span>
            <span>{drillDuration / 2}s</span>
            <span>{drillDuration}s</span>
          </div>
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={startGame} style={{ padding: '15px 40px', fontSize: '1.2rem', background: `${color}15`, border: `1px solid ${color}`, color: color, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '2px', transition: 'all 0.2s', borderRadius: '4px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color; }}
        >
          ↻ PLAY AGAIN
        </button>
        <button onClick={goToScenarios} style={{ padding: '15px 40px', fontSize: '1.2rem', background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '2px', transition: 'all 0.2s', borderRadius: '4px' }}
          onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid #fff'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid #555'; e.currentTarget.style.color = '#aaa'; }}
        >
          RETURN TO HUB
        </button>
      </div>
    </div>
  );
}