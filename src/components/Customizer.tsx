import { useState } from 'react';
import { useStore, TRACK_LIST, GAME_PROFILES } from '../store/useStore';
import { auth, syncArmoryToCloud } from '../firebase';

export default function Customizer() {
  const { 
    color, size, thickness, gap, dot, crosshairOutline, skipClickToBegin,
    targetColor, targetShape, targetSkinMode, hitSound, 
    scenario, weaponMode, weaponClass, targetSpeed, modelScale, targetAmount, targetDistance,
    mapTheme, graphicsQuality, drillDuration, 
    musicTrack, musicVolume,
    gameProfile, gameSens, fov, username,
    setSettings, setWeapon, startGame, goToScenarios 
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const recommendedFov = GAME_PROFILES[gameProfile]?.defaultFov || 103;

  // --- CLOUD ARMORY SYNC FUNCTION ---
  const handleCloudSync = async () => {
    if (!auth.currentUser) return alert("System Error: No Active Agent Profile.");
    setIsSyncing(true);
    
    const state = useStore.getState();
    const payload = {
      color: state.color, size: state.size, thickness: state.thickness, gap: state.gap, dot: state.dot,
      crosshairOutline: state.crosshairOutline, skipClickToBegin: state.skipClickToBegin,
      targetColor: state.targetColor, targetShape: state.targetShape, targetSkinMode: state.targetSkinMode,
      hitSound: state.hitSound, weaponMode: state.weaponMode, weaponClass: state.weaponClass,
      targetSpeed: state.targetSpeed, modelScale: state.modelScale, targetAmount: state.targetAmount,
      targetDistance: state.targetDistance, mapTheme: state.mapTheme, graphicsQuality: state.graphicsQuality,
      drillDuration: state.drillDuration, musicTrack: state.musicTrack, musicVolume: state.musicVolume,
      gameProfile: state.gameProfile, gameSens: state.gameSens, fov: state.fov
    };

    await syncArmoryToCloud(auth.currentUser.uid, payload);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div style={{ 
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(20px)', zIndex: 50, 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'flex-start', /* FIX: Allows proper scrolling */
      fontFamily: 'monospace', color: '#fff', 
      overflowY: 'auto', overflowX: 'hidden', padding: '60px 0 120px 0' /* FIX: Massive bottom padding */
    }}>
      
      <a 
        href="https://www.tiktok.com/@efect2lit" 
        target="_blank" 
        rel="noreferrer" 
        style={{ 
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
          color: '#fff', textDecoration: 'none', fontSize: '1.1rem', background: 'rgba(20,20,20,0.9)', 
          padding: '10px 30px', borderRadius: '30px', border: `1px solid ${color}`, 
          boxShadow: `0 0 20px ${color}50`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100 
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'; e.currentTarget.style.backgroundColor = color; e.currentTarget.style.color = '#000'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(20,20,20,0.8)'; e.currentTarget.style.color = '#fff'; }}
      >
        TikTok: <span style={{ fontWeight: 'bold' }}>@efect2lit</span>
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '95%', maxWidth: '1600px', marginBottom: '25px', marginTop: '20px' }}>
        <button 
          onClick={goToScenarios} 
          style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '12px 25px', cursor: 'pointer', fontFamily: 'monospace', borderRadius: '4px', transition: 'all 0.2s ease-in-out' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#aaa'; }}
        >
          &lt; RETURN TO HUB
        </button>
        <div style={{ color: color, fontSize: '1.8rem', letterSpacing: '8px', textShadow: `0 0 15px ${color}`, fontWeight: '900', textTransform: 'uppercase' }}>
          MODULE: {scenario.replace('_', ' ')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '35px', width: '95%', maxWidth: '1600px' }}>
        
        {/* COLUMN 1 */}
        <div style={{ background: 'rgba(15,15,15,0.95)', border: `1px solid ${color}`, borderRadius: '16px', padding: '35px', boxShadow: `0 0 40px ${color}15` }}>
          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 0, fontSize: '1.1rem', letterSpacing: '2px' }}>[ PRO SENSITIVITY ]</h2>
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Player Callsign (Leaderboard Name)</label>
            <input type="text" value={username} onChange={(e) => setSettings({ username: e.target.value.substring(0, 16) })} placeholder="Enter Gamer Tag..." maxLength={16} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.5)', color: color, border: `1px solid ${color}`, fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Target Game Engine</label>
            <select value={gameProfile} onChange={(e) => setSettings({ gameProfile: e.target.value })} style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace', outline: 'none', cursor: 'pointer' }}>
              {Object.entries(GAME_PROFILES).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: 12 }}>
            <div style={{ flex: 1.5 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>In-Game Sens</label>
              <input type="number" step="0.001" value={gameSens} onChange={(e) => setSettings({ gameSens: Number(e.target.value) })} style={{ width: '100%', padding: '14px', background: '#000', color: color, border: `1px solid ${color}`, fontWeight: 'bold', fontFamily: 'monospace', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>FOV: {fov}</label>
              <input type="range" min="60" max="130" value={fov} onChange={(e) => setSettings({ fov: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '12px' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: fov === recommendedFov ? color : '#ffaa00', marginBottom: 25, fontStyle: 'italic', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
            {fov === recommendedFov ? '✓ Calibration Synced: 1:1 Engine Match.' : `⚠ Desync Detected: For ${GAME_PROFILES[gameProfile]?.name}, use FOV ${recommendedFov}.`}
          </div>

          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 15, fontSize: '1.1rem', letterSpacing: '2px' }}>[ ARSENAL SETUP ]</h2>
          <div style={{ display: 'flex', gap: '20px', marginBottom: 25 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Weapon Class</label>
              <select value={weaponClass} onChange={(e) => setWeapon(e.target.value as any)} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace' }}>
                <option value="pistol">Pistol (Tactical)</option><option value="smg">SMG (Automatic)</option><option value="sniper">Sniper (High Impact)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Weapon Mode</label>
              <select value={weaponMode} onChange={(e) => setSettings({ weaponMode: e.target.value as any })} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace' }}>
                <option value="laser">Hitscan Laser</option><option value="stealth">Stealth (No Tracer)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: 25 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Drill Length</label>
              <select value={drillDuration} onChange={(e) => setSettings({ drillDuration: Number(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace' }}>
                <option value={30}>30 Seconds</option><option value={60}>60 Seconds</option><option value={90}>90 Seconds</option><option value={120}>120 Seconds</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Hit Sound</label>
              <select value={hitSound} onChange={(e) => setSettings({ hitSound: e.target.value as any })} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace' }}>
                <option value="none">🔇 Muted</option><option value="tick">Digital Tick</option><option value="pop">Hollow Pop</option><option value="ding">Combat Ding</option>
              </select>
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div style={{ background: 'rgba(15,15,15,0.95)', border: `1px solid ${color}`, borderRadius: '16px', padding: '35px', boxShadow: `0 0 40px ${color}15` }}>
          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 0, fontSize: '1.1rem', letterSpacing: '2px' }}>[ TARGET VISUALS ]</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25, alignItems: 'center' }}>
            <label style={{ color: '#888', fontSize: '0.9rem' }}>Target Emissive Color</label>
            <input type="color" value={targetColor} onChange={(e) => setSettings({ targetColor: e.target.value })} style={{ width: 70, height: 35, border: 'none', background: 'transparent', cursor: 'pointer' }} />
          </div>
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Target Geometry</label>
            <select value={targetShape} onChange={(e) => setSettings({ targetShape: e.target.value as any })} style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace' }}>
              <option value="sphere">Sphere (High Accuracy)</option><option value="cube">Cube (Standard)</option><option value="humanoid">Humanoid (Character)</option>
            </select>
          </div>
          {targetShape === 'humanoid' && (
            <div style={{ marginBottom: 25 }}>
              <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Humanoid Shader</label>
              <select value={targetSkinMode} onChange={(e) => setSettings({ targetSkinMode: e.target.value as any })} style={{ width: '100%', padding: '14px', background: '#000', color: color, border: `1px solid ${color}`, fontFamily: 'monospace', fontWeight: 'bold' }}>
                <option value="custom">Glow (Performance)</option><option value="original">High-Fidelity Textures</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: '25px', marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Scale: {modelScale}x</label>
              <input type="range" min="0.5" max="3" step="0.1" value={modelScale} onChange={(e) => setSettings({ modelScale: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '12px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Speed: {targetSpeed}x</label>
              <input type="range" min="0.5" max="3" step="0.1" value={targetSpeed} onChange={(e) => setSettings({ targetSpeed: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '12px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '25px', marginBottom: 35 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Amount: {targetAmount}</label>
              <input type="range" min="1" max="25" value={targetAmount} onChange={(e) => setSettings({ targetAmount: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '12px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Distance: {Math.abs(targetDistance)}m</label>
              <input type="range" min="-25" max="-5" step="0.5" value={targetDistance} onChange={(e) => setSettings({ targetDistance: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '12px' }} />
            </div>
          </div>

          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 5, fontSize: '1.1rem', letterSpacing: '2px' }}>[ RETICLE TUNING ]</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
            <label style={{ color: '#888', fontSize: '0.9rem' }}>Crosshair & UI Glow Color</label>
            <input type="color" value={color} onChange={(e) => setSettings({ color: e.target.value })} style={{ width: 70, height: 35, border: 'none', background: 'transparent', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Gap: {gap}px</label>
              <input type="range" min="0" max="20" value={gap} onChange={(e) => setSettings({ gap: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '10px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Size: {size}px</label>
              <input type="range" min="2" max="40" value={size} onChange={(e) => setSettings({ size: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '10px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Thick: {thickness}px</label>
              <input type="range" min="1" max="10" value={thickness} onChange={(e) => setSettings({ thickness: Number(e.target.value) })} style={{ width: '100%', accentColor: color, marginTop: '10px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>Center Dot</span>
            <input type="checkbox" checked={dot} onChange={(e) => setSettings({ dot: e.target.checked })} style={{ accentColor: color, width: 22, height: 22, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>Outline Rendering</span>
            <input type="checkbox" checked={crosshairOutline} onChange={(e) => setSettings({ crosshairOutline: e.target.checked })} style={{ accentColor: color, width: 22, height: 22, cursor: 'pointer' }} />
          </div>
        </div>

        {/* COLUMN 3 */}
        <div style={{ background: 'rgba(15,15,15,0.95)', border: `1px solid ${color}`, borderRadius: '16px', padding: '35px', boxShadow: `0 0 40px ${color}15`, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 0, fontSize: '1.1rem', letterSpacing: '2px' }}>[ GLOBAL NETWORK ]</h2>
          <button 
            onClick={handleCloudSync} disabled={isSyncing}
            style={{ width: '100%', padding: '16px', background: isSyncing ? `${color}40` : `${color}20`, border: `1px solid ${color}`, color: isSyncing ? '#fff' : color, cursor: isSyncing ? 'wait' : 'pointer', borderRadius: '8px', marginBottom: '15px', transition: 'all 0.3s', fontWeight: 'bold', letterSpacing: '1px', boxShadow: isSyncing ? `0 0 20px ${color}80` : 'none' }}
            onMouseEnter={(e) => { if(!isSyncing) { e.currentTarget.style.background = color; e.currentTarget.style.color = '#000'; } }}
            onMouseLeave={(e) => { if(!isSyncing) { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.color = color; } }}
          >
            {isSyncing ? '⟳ SYNCING TO CLOUD...' : '☁ PUSH ARMORY TO CLOUD'}
          </button>

          <button 
            onClick={() => setSettings({ gameState: 'leaderboard' })}
            style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#fff', cursor: 'pointer', borderRadius: '8px', marginBottom: '30px', transition: 'all 0.3s', fontWeight: 'bold', letterSpacing: '1px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 15px ${color}30`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            🌎 VIEW GLOBAL LEADERBOARD
          </button>

          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 0, fontSize: '1.1rem', letterSpacing: '2px' }}>[ SYSTEM PREFERENCES ]</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid #222' }}>
            <div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>Instant Launch</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Bypass "Click to Begin"</div></div>
            <input type="checkbox" checked={skipClickToBegin} onChange={(e) => setSettings({ skipClickToBegin: e.target.checked })} style={{ accentColor: color, width: 24, height: 24, cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid #222' }}>
            <div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>Map Preset</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Environment Style</div></div>
            <select value={mapTheme} onChange={(e) => setSettings({ mapTheme: e.target.value as any })} style={{ padding: '8px', background: '#000', color: color, border: `1px solid ${color}`, fontFamily: 'monospace', outline: 'none' }}><option value="cyber">Cyber City</option><option value="minimal">Greybox Pro</option><option value="galaxy">Supernova</option><option value="night">Stealth Dark</option></select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid #222' }}>
            <div><div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>Graphics Engine</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Bloom & Processing</div></div>
            <select value={graphicsQuality} onChange={(e) => setSettings({ graphicsQuality: e.target.value as any })} style={{ padding: '8px', background: '#000', color: color, border: `1px solid ${color}`, fontFamily: 'monospace', outline: 'none' }}><option value="high">High (Bloom)</option><option value="performance">Performance</option></select>
          </div>

          <h2 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '12px', marginTop: 0, fontSize: '1.1rem', letterSpacing: '2px' }}>[ AUDIO ENGINE ]</h2>
          <div style={{ padding: '18px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid #222', marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: 10, color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Background Track</label>
            <select value={musicTrack} onChange={(e) => setSettings({ musicTrack: e.target.value, isMusicPlaying: e.target.value !== 'none' })} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: '1px solid #444', fontFamily: 'monospace', marginBottom: '15px' }}>{TRACK_LIST.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <label style={{ display: 'block', marginBottom: 10, color: '#888', fontSize: '0.9rem' }}>Music Volume</label>
            <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(e) => setSettings({ musicVolume: Number(e.target.value) })} style={{ width: '100%', accentColor: color }} />
          </div>
        </div>
      </div>

      {/* FIX: Scaled down deploy button, margin reduced */}
      <button 
        onClick={startGame} 
        style={{ 
          marginTop: '30px', padding: '20px 80px', fontSize: '2rem', backgroundColor: `${color}15`, 
          border: `2px solid ${color}`, color: color, cursor: 'pointer', fontFamily: 'monospace', 
          letterSpacing: '8px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          boxShadow: `0 0 40px ${color}30`, borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase' 
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color; e.currentTarget.style.color = '#000'; e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 15px 40px ${color}60`; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}15`; e.currentTarget.style.color = color; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 0 40px ${color}30`; }}
      >
        Deploy to Arena
      </button>

    {/* FORCE SCROLL SPACER */}
      <div style={{ height: '150px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}