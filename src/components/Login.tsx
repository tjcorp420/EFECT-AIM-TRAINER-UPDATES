import { useState } from 'react';
import { useStore } from '../store/useStore';
import { auth, fetchCloudArmory } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function Login() {
  const { color, setSettings } = useStore();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsProcessing(true);

    try {
      if (isRegistering) {
        if (username.trim().length < 3) throw new Error("Callsign must be at least 3 characters.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await updateProfile(userCredential.user, { displayName: username });
        setSettings({ username, gameState: 'scenarioSelect' });
        
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || "Unknown_Agent";
        
        // --- CLOUD ARMORY: FETCH SETTINGS ON LOGIN ---
        const cloudSettings = await fetchCloudArmory(userCredential.user.uid);
        
        if (cloudSettings) {
          console.log("Cloud Armory Loaded Successfully.");
          setSettings({ ...cloudSettings, username: displayName, gameState: 'scenarioSelect' });
        } else {
          setSettings({ username: displayName, gameState: 'scenarioSelect' });
        }
      }
    } catch (error: any) {
      let cleanError = error.message.replace("Firebase: ", "");
      setErrorMsg(cleanError);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#050505',
      backgroundImage: `
        radial-gradient(circle at center, transparent 0%, #020202 100%), 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'monospace', color: '#fff', overflow: 'hidden'
    }}>
      
      {/* TECH SCANLINE ANIMATION */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .tech-input:focus {
          border-color: ${color} !important;
          box-shadow: 0 0 15px ${color}30 inset, 0 0 15px ${color}30 !important;
        }
        .glitch-text { text-shadow: 2px 0 0 red, -2px 0 0 blue; }
      `}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '20px', background: `linear-gradient(to bottom, transparent, ${color}40, transparent)`, animation: 'scanline 6s linear infinite', pointerEvents: 'none', opacity: 0.5 }} />

      <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 2 }}>
        <h1 style={{ color: color, fontSize: '4.5rem', letterSpacing: '20px', textShadow: `0 0 40px ${color}`, margin: 0, textTransform: 'uppercase', fontWeight: '900' }}>
          EFECT
        </h1>
        <div style={{ color: '#aaa', letterSpacing: '10px', fontSize: '1.2rem', marginTop: '10px', background: 'rgba(0,0,0,0.5)', padding: '5px 20px', border: `1px solid ${color}40`, display: 'inline-block' }}>
          SYSTEM TERMINAL_
        </div>
      </div>

      <div style={{ 
        background: 'rgba(10,10,12,0.95)', border: `1px solid ${color}80`, 
        borderRadius: '4px', padding: '40px', boxShadow: `0 0 80px ${color}15, inset 0 0 20px ${color}10`,
        width: '420px', position: 'relative', zIndex: 2
      }}>
        {/* CORNER ACCENTS */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 15, height: 15, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: 15, height: 15, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 15, height: 15, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 15, height: 15, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

        <h2 style={{ margin: '0 0 25px 0', borderBottom: `1px solid ${color}40`, paddingBottom: '15px', letterSpacing: '4px', fontSize: '1.1rem', color: '#ccc' }}>
          {isRegistering ? '> INIT_NEW_OPERATIVE' : '> DECRYPT_CREDENTIALS'}
        </h2>

        {errorMsg && (
          <div style={{ background: 'rgba(255,0,50,0.1)', borderLeft: '4px solid #ff0050', color: '#ffaaa0', padding: '12px', marginBottom: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            [ERROR]: {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {isRegistering && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', letterSpacing: '2px' }}>CALLSIGN (TAG)</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} maxLength={16} required className="tech-input" style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.8)', color: color, border: '1px solid #333', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'all 0.3s', fontWeight: 'bold' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', letterSpacing: '2px' }}>NETWORK EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="tech-input" style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #333', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'all 0.3s' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', letterSpacing: '2px' }}>ACCESS KEY (PASS)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="tech-input" style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #333', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'all 0.3s', letterSpacing: '4px' }} />
          </div>

          <button type="submit" disabled={isProcessing} style={{ 
            marginTop: '15px', padding: '18px', background: isProcessing ? '#333' : `${color}20`, border: `1px solid ${color}`, 
            color: isProcessing ? '#888' : color, fontWeight: '900', fontSize: '1.1rem', cursor: isProcessing ? 'wait' : 'pointer', letterSpacing: '4px', transition: 'all 0.2s',
            boxShadow: isProcessing ? 'none' : `0 0 20px ${color}20`
          }}
          onMouseEnter={e => { if(!isProcessing) { e.currentTarget.style.background = color; e.currentTarget.style.color = '#000'; } }}
          onMouseLeave={e => { if(!isProcessing) { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.color = color; } }}
          >
            {isProcessing ? 'CONNECTING...' : (isRegistering ? 'INITIALIZE ACCOUNT' : 'DECRYPT & ENTER')}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', color: '#666', letterSpacing: '1px' }}>
          {isRegistering ? "ALREADY AN OPERATIVE?" : "NEED A CALLSIGN?"}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }} 
            style={{ color: color, marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegistering ? "LOGIN" : "REGISTER"}
          </span>
        </div>
      </div>
    </div>
  );
}