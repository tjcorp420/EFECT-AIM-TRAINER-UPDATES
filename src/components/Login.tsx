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
      backgroundColor: '#030305',
      backgroundImage: `
        radial-gradient(circle at center, transparent 0%, #000 100%), 
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), 
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 50px 50px, 50px 50px',
      animation: 'scrollGrid 20s linear infinite',
      zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'monospace', color: '#fff', overflow: 'hidden'
    }}>
      
      {/* --- ADVANCED CSS ANIMATIONS --- */}
      <style>{`
        @keyframes scrollGrid {
          0% { background-position: center, 0 0, 0 0; }
          100% { background-position: center, 0 50px, 50px 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { text-shadow: 0 0 20px ${color}80; }
          50% { text-shadow: 0 0 50px ${color}, 0 0 10px #fff; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .tech-input::placeholder {
          color: #444;
          letter-spacing: 2px;
        }
        .tech-input:focus {
          border-color: ${color} !important;
          box-shadow: 0 0 25px ${color}40 inset, 0 0 20px ${color}40 !important;
          background: rgba(0,0,0,0.9) !important;
        }
        .glitch-hover:hover {
          animation: pulseGlow 1.5s infinite;
        }
      `}</style>

      {/* SWEEPING SCANLINE */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '150px', background: `linear-gradient(to bottom, transparent, ${color}20, ${color}60, transparent)`, animation: 'scanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite', pointerEvents: 'none', zIndex: 1 }} />

      {/* GLOWING ORB BEHIND CONTAINER */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ textAlign: 'center', marginBottom: '35px', zIndex: 2 }}>
        <h1 className="glitch-hover" style={{ color: '#fff', fontSize: '5rem', letterSpacing: '25px', margin: 0, textTransform: 'uppercase', fontWeight: '900', transition: 'all 0.3s', textShadow: `0 0 30px ${color}80` }}>
          EFECT
        </h1>
        <div style={{ color: color, letterSpacing: '12px', fontSize: '1rem', marginTop: '10px', background: 'rgba(0,0,0,0.6)', padding: '8px 25px', border: `1px solid ${color}40`, display: 'inline-block', borderRadius: '4px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
          SYSTEM TERMINAL<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
      </div>

      {/* PRO GLASSMORPHISM CONTAINER */}
      <div style={{ 
        background: 'rgba(10, 10, 12, 0.5)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(255, 255, 255, 0.08)`, 
        borderRadius: '12px', padding: '45px', 
        boxShadow: `0 25px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 30px ${color}10`,
        width: '440px', position: 'relative', zIndex: 2,
        transition: 'height 0.3s ease'
      }}>
        
        {/* HIGH-TECH CORNER ACCENTS */}
        <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '12px 0 0 0' }} />
        <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 12px 0 0' }} />
        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '0 0 0 12px' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 0 12px 0' }} />

        <h2 style={{ margin: '0 0 30px 0', borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '15px', letterSpacing: '4px', fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: color, marginRight: '10px' }}>&gt;</span>
          {isRegistering ? 'INIT_NEW_OPERATIVE' : 'DECRYPT_CREDENTIALS'}
          <span style={{ display: 'inline-block', width: '8px', height: '18px', background: color, marginLeft: '8px', animation: 'blink 1s step-end infinite' }} />
        </h2>

        {errorMsg && (
          <div style={{ background: 'rgba(255, 0, 50, 0.15)', border: '1px solid rgba(255, 0, 50, 0.4)', borderLeft: '4px solid #ff0050', color: '#ffaaa0', padding: '15px', marginBottom: '25px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '4px', textShadow: '0 0 10px rgba(255,0,50,0.5)' }}>
            [ERROR] {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {isRegistering && (
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 'bold' }}>CALLSIGN (TAG)</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} maxLength={16} placeholder="Enter Gamertag..." required className="tech-input" style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.6)', color: color, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none', fontFamily: 'monospace', fontSize: '1.2rem', transition: 'all 0.3s', fontWeight: '900', letterSpacing: '1px' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 'bold' }}>NETWORK EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@network.com" required className="tech-input" style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'all 0.3s' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 'bold' }}>ACCESS KEY (PASS)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="tech-input" style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.6)', color: color, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none', fontFamily: 'monospace', fontSize: '1.2rem', transition: 'all 0.3s', letterSpacing: '6px' }} />
          </div>

          <button type="submit" disabled={isProcessing} style={{ 
            marginTop: '20px', padding: '20px', background: isProcessing ? '#111' : `linear-gradient(45deg, ${color}20, transparent)`, 
            border: `1px solid ${isProcessing ? '#333' : color}`, borderRadius: '6px',
            color: isProcessing ? '#555' : color, fontWeight: '900', fontSize: '1.1rem', cursor: isProcessing ? 'wait' : 'pointer', 
            letterSpacing: '5px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: isProcessing ? 'none' : `0 0 20px ${color}20`, textTransform: 'uppercase'
          }}
          onMouseEnter={e => { if(!isProcessing) { e.currentTarget.style.background = color; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = `0 0 30px ${color}60`; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
          onMouseLeave={e => { if(!isProcessing) { e.currentTarget.style.background = `linear-gradient(45deg, ${color}20, transparent)`; e.currentTarget.style.color = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}20`; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            {isProcessing ? 'CONNECTING...' : (isRegistering ? 'INITIALIZE ACCOUNT' : 'DECRYPT & ENTER')}
          </button>
        </form>

        <div style={{ marginTop: '35px', textAlign: 'center', fontSize: '0.9rem', color: '#666', letterSpacing: '1px' }}>
          {isRegistering ? "ALREADY AN OPERATIVE?" : "NEED A CALLSIGN?"}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }} 
            style={{ color: '#fff', marginLeft: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'color 0.2s', borderBottom: `1px dashed ${color}` }}
            onMouseEnter={e => e.currentTarget.style.color = color}
            onMouseLeave={e => e.currentTarget.style.color = '#fff'}
          >
            {isRegistering ? "LOGIN" : "REGISTER"}
          </span>
        </div>
      </div>
    </div>
  );
}