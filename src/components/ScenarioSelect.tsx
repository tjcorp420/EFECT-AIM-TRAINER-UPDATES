import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const SCENARIOS = [
  { id: 'gridshot_standard', name: 'WALL GRIDSHOT', desc: 'Standard 3-target flicking.', type: 'FLICK' },
  { id: 'gridshot_ultimate', name: 'GRIDSHOT ULTIMATE', desc: 'Faster spawns, more targets.', type: 'FLICK' },
  { id: 'gridshot_precision', name: 'GRIDSHOT PRECISION', desc: 'Tiny targets for micro-flicks.', type: 'PRECISION' },
  { id: 'microflick_standard', name: 'MICROFLICK', desc: 'Clustered precision focus.', type: 'PRECISION' },
  { id: 'microflick_react', name: 'MICROFLICK REACT', desc: 'Tiny targets that vanish quickly.', type: 'REACTION' },
  { id: 'microflick_track', name: 'MICROFLICK TRACK', desc: 'Tiny moving targets.', type: 'PRECISION' },
  { id: 'tracking_dynamic', name: 'DYNAMIC TRACKING', desc: 'Evasive strafing AI.', type: 'TRACKING' },
  { id: 'tracking_smooth', name: 'SMOOTH TRACKING', desc: 'Long, predictable strafes.', type: 'TRACKING' },
  { id: 'tracking_fast', name: 'FAST TRACKING', desc: 'Aggressive, rapid direction changes.', type: 'TRACKING' },
  { id: 'popcorn_standard', name: 'POPCORN', desc: 'Vertical gravity arcs.', type: 'TIMING' },
  { id: 'popcorn_small', name: 'POPCORN PRECISION', desc: 'Tiny vertical arcs.', type: 'PRECISION' },
  { id: 'popcorn_heavy', name: 'POPCORN HEAVY', desc: 'Fast fall rate gravity.', type: 'TIMING' },
  { id: 'flick360_standard', name: '360 AWARENESS', desc: 'Targets spawn all around you.', type: 'FLICK' },
  { id: 'flick360_react', name: '360 REACT', desc: 'Fast disappearing surround targets.', type: 'REACTION' },
  { id: 'flick360_tracking', name: '360 TRACKING', desc: 'Moving targets behind you.', type: 'TRACKING' },
  { id: 'spidershot_standard', name: 'SPIDERSHOT', desc: 'Center-return flicking.', type: 'FLICK' },
  { id: 'spidershot_180', name: 'SPIDERSHOT 180', desc: 'Wide angle center returns.', type: 'FLICK' },
  { id: 'spidershot_rapid', name: 'SPIDERSHOT RAPID', desc: 'Fast paced center returns.', type: 'REACTION' },
  { id: 'motionshot_standard', name: 'MOTIONSHOT', desc: 'Targets drift after spawning.', type: 'DYNAMIC' },
  { id: 'motionshot_fast', name: 'MOTIONSHOT FAST', desc: 'High speed linear drift.', type: 'DYNAMIC' },
  { id: 'motionshot_small', name: 'MOTIONSHOT PRECISION', desc: 'Tiny drifting targets.', type: 'PRECISION' },
  { id: 'snipershot_standard', name: 'SNIPERSHOT', desc: 'Long distance, high penalty.', type: 'PRECISION' },
  { id: 'snipershot_moving', name: 'SNIPERSHOT MOVING', desc: 'Distant moving targets.', type: 'PRECISION' },
  { id: 'snipershot_react', name: 'SNIPERSHOT REACT', desc: 'Distant targets vanish quickly.', type: 'REACTION' },
  { id: 'reflex_standard', name: 'REFLEX SHOT', desc: 'Targets disappear instantly.', type: 'REACTION' },
  { id: 'reflex_micro', name: 'REFLEX MICRO', desc: 'Tiny whack-a-mole targets.', type: 'PRECISION' },
  { id: 'reflex_cluster', name: 'REFLEX CLUSTER', desc: 'Tightly grouped reflex training.', type: 'REACTION' },
  { id: 'glider_tracking', name: 'GLIDER TRACKING', desc: 'Smooth diagonal descent tracking.', type: 'TRACKING' },
  { id: 'bounce_tracking', name: 'BOUNCE TRACKING', desc: 'Vertical gravity bounce tracking.', type: 'TRACKING' },
  { id: 'pump_flick', name: 'PUMP FLICK', desc: 'Close-range wide wall flicks.', type: 'FLICK' },
] as const;

export default function ScenarioSelect() {
  const store = useStore();
  const { color, setSettings, goToCustomizer, highScores, username } = store;
  const [copied, setCopied] = useState(false);

  // --- AUTO UPDATER STATES ---
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // --- SILENT BACKGROUND UPDATE CHECK ---
  useEffect(() => {
    check().then(update => {
      if (update) setPendingUpdate(update);
    }).catch(() => {}); 
  }, []);

  // --- MANUAL FORCE CHECK ---
  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const update = await check();
      if (update) {
        setPendingUpdate(update);
      } else {
        alert("System is currently up to date. No new version found on server.");
      }
    } catch (err) {
      alert("Network Error: Could not reach update server.");
    } finally {
      setIsChecking(false);
    }
  };

  // --- INSTALL AND RESTART ---
  const handleInstall = async () => {
    if (!pendingUpdate) return;
    try {
      setIsInstalling(true);
      await pendingUpdate.downloadAndInstall();
      await relaunch(); 
    } catch (error) {
      console.error("Install failed:", error);
      setIsInstalling(false);
      setPendingUpdate(null);
      alert("Update installation failed. Check network connection.");
    }
  };

  const exportConfig = () => {
    const configString = `EFECT_CFG[SENS:${store.gameSens}|FOV:${store.fov}|RETICLE:${store.size},${store.thickness},${store.gap}|CLR:${store.color}]`;
    navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'url(/bg-blur.jpg) center/cover, #0a0a0a', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px', fontFamily: 'monospace', color: '#fff', overflow: 'hidden' }}>
      
      <a href="https://efectmacrosxtweaks.netlify.app/" target="_blank" rel="noreferrer" style={{ position: 'absolute', top: '25px', right: '40px', color: '#000', backgroundColor: color, textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', padding: '10px 20px', borderRadius: '4px', boxShadow: `0 0 15px ${color}80`, transition: 'all 0.2s', zIndex: 100 }}>
        EFECT MACROS & TWEAKS
      </a>

      <div style={{ position: 'absolute', top: '25px', left: '40px', display: 'flex', gap: '15px', zIndex: 100 }}>
        <div style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${color}`, padding: '10px 20px', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}>
          AGENT: <span style={{ color: color, fontWeight: 'bold' }}>{username}</span>
        </div>
        <button 
          onClick={exportConfig}
          style={{ background: 'transparent', border: `1px solid #555`, padding: '10px 20px', borderRadius: '4px', color: '#aaa', cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#aaa'; }}
        >
          {copied ? '✓ COPIED' : '⎘ EXPORT'}
        </button>
        {/* MANUAL UPDATE BUTTON */}
        <button 
          onClick={handleManualCheck}
          disabled={isChecking || pendingUpdate !== null}
          style={{ background: 'transparent', border: `1px solid #555`, padding: '10px 20px', borderRadius: '4px', color: '#aaa', cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { if(!isChecking && !pendingUpdate) { e.currentTarget.style.borderColor = '#0096ff'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={(e) => { if(!isChecking && !pendingUpdate) { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#aaa'; } }}
        >
          {isChecking ? 'SCANNING...' : '⟳ CHECK FOR UPDATES'}
        </button>
      </div>

      {/* --- AUTO-UPDATE ALERT BANNER --- */}
      {pendingUpdate && (
        <div style={{ position: 'absolute', top: '90px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, width: '80%', maxWidth: '800px', animation: 'slideDown 0.5s ease-out' }}>
          <style>{`@keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 90px; opacity: 1; } }`}</style>
          <button 
            onClick={handleInstall} 
            disabled={isInstalling}
            style={{ 
              width: '100%', padding: '15px 30px', background: isInstalling ? '#003366' : 'rgba(0, 150, 255, 0.15)', 
              border: '1px solid #0096ff', color: '#0096ff', cursor: isInstalling ? 'wait' : 'pointer', 
              borderRadius: '8px', transition: 'all 0.3s', fontWeight: '900', letterSpacing: '2px',
              boxShadow: isInstalling ? 'none' : '0 0 25px rgba(0, 150, 255, 0.5)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
            onMouseEnter={(e) => { if(!isInstalling) { e.currentTarget.style.background = '#0096ff'; e.currentTarget.style.color = '#000'; } }}
            onMouseLeave={(e) => { if(!isInstalling) { e.currentTarget.style.background = 'rgba(0, 150, 255, 0.15)'; e.currentTarget.style.color = '#0096ff'; } }}
          >
            <span>{isInstalling ? 'DOWNLOADING CORE FILES...' : `⚠ SYSTEM UPDATE DETECTED (v${pendingUpdate.version})`}</span>
            <span>{isInstalling ? 'PLEASE WAIT' : 'CLICK TO INSTALL & RESTART'}</span>
          </button>
        </div>
      )}

      <h1 style={{ color: color, fontSize: '3rem', letterSpacing: '8px', textShadow: `0 0 20px ${color}`, margin: '0 0 10px 0', marginTop: pendingUpdate ? '60px' : '0', transition: 'margin 0.3s' }}>COMMAND CENTER</h1>
      <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '30px' }}>SELECT TRAINING MODULE</p>

      <div style={{ 
        width: '95%', maxWidth: '1600px', height: pendingUpdate ? '65vh' : '75vh', overflowY: 'auto', padding: '20px',
        background: 'rgba(15, 15, 15, 0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        transition: 'height 0.3s'
      }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {SCENARIOS.map((scen) => (
            <div 
              key={scen.id}
              onClick={() => { setSettings({ scenario: scen.id }); goToCustomizer(); }}
              style={{ 
                background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.8), rgba(20, 20, 20, 0.9))', 
                border: `1px solid rgba(255,255,255,0.15)`, 
                borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease', 
                position: 'relative', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = color; 
                e.currentTarget.style.boxShadow = `0 0 25px ${color}60`; 
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; 
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '10px', color: color, marginBottom: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>[{scen.type}]</div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{scen.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#bbb', margin: '0 0 20px 0', minHeight: '35px' }}>{scen.desc}</p>
              <div style={{ fontSize: '0.9rem', color: '#888', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                HIGH SCORE: <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{highScores[scen.id] || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}