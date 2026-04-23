import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchTopScores } from '../firebase';

export default function Leaderboard() {
  const { color, setSettings, scenario, username } = useStore();
  const [topScores, setTopScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live scores from the global database on mount
  useEffect(() => {
    setIsLoading(true);
    fetchTopScores(scenario).then((data) => {
      setTopScores(data);
      setIsLoading(false);
    });
  }, [scenario]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ color, fontSize: '3rem', letterSpacing: '8px', textShadow: `0 0 20px ${color}`, margin: '0 0 10px 0', textTransform: 'uppercase' }}>GLOBAL TOP 100</h1>
      <h3 style={{ color: '#888', letterSpacing: '4px', margin: '0 0 40px 0', textTransform: 'uppercase' }}>MODULE: {scenario.replace('_', ' ')}</h3>
      
      <div style={{ width: '90%', maxWidth: '900px', background: 'rgba(15,15,15,0.9)', border: `1px solid ${color}`, borderRadius: '12px', padding: '30px', boxShadow: `0 0 40px ${color}15`, minHeight: '400px', maxHeight: '60vh', overflowY: 'auto' }}>
        
        {isLoading ? (
          <div style={{ color: color, textAlign: 'center', marginTop: '100px', fontSize: '1.5rem', letterSpacing: '2px' }}>
            <style>{`@keyframes pulseText { 0% { opacity: 0.4; } 50% { opacity: 1; text-shadow: 0 0 15px ${color}; } 100% { opacity: 0.4; } }`}</style>
            <div style={{ animation: 'pulseText 1.5s infinite' }}>DECRYPTING GLOBAL NETWORK...</div>
          </div>
        ) : topScores.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', letterSpacing: '2px' }}>
            NO DATA FOUND. BE THE FIRST TO SET A RECORD.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', textAlign: 'left', color: '#888', fontSize: '0.9rem', letterSpacing: '2px' }}>
                <th style={{ padding: '15px', width: '15%' }}>RANK</th>
                <th style={{ width: '45%' }}>OPERATIVE</th>
                <th style={{ width: '25%' }}>SCORE</th>
                <th style={{ width: '15%' }}>ACCURACY</th>
              </tr>
            </thead>
            <tbody>
              {topScores.map((s, i) => {
                // IDENTIFY LOGGED IN PLAYER
                const isMe = s.username === username;
                
                return (
                  <tr key={i} style={{ 
                    borderBottom: '1px solid #222', 
                    background: isMe ? `${color}15` : 'transparent',
                    boxShadow: isMe ? `inset 4px 0 0 ${color}` : 'none',
                    transition: 'all 0.2s'
                  }}>
                    <td style={{ padding: '15px', color: i < 3 ? color : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>
                      #{i + 1} {i === 0 && '👑'}
                    </td>
                    <td style={{ fontWeight: 'bold', color: isMe ? color : '#fff', letterSpacing: '1px' }}>
                      {s.username} 
                      {isMe && <span style={{ fontSize: '0.7rem', background: color, color: '#000', padding: '2px 6px', borderRadius: '4px', marginLeft: '10px', verticalAlign: 'middle', fontWeight: '900' }}>YOU</span>}
                    </td>
                    <td style={{ color: color, fontWeight: 'bold', letterSpacing: '1px' }}>{s.score.toLocaleString()}</td>
                    <td style={{ opacity: isMe ? 1 : 0.6, color: isMe ? '#fff' : 'inherit' }}>{s.accuracy}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <button 
        onClick={() => setSettings({ gameState: 'customizer' })}
        style={{ marginTop: '40px', padding: '15px 50px', background: 'none', border: `1px solid #555`, color: '#aaa', cursor: 'pointer', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', transition: 'all 0.2s', borderRadius: '4px' }}
        onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${color}`; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.border = `1px solid #555`; e.currentTarget.style.color = '#aaa'; }}
      >
        RETURN TO ARMORY
      </button>
    </div>
  );
}