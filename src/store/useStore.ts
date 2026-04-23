import { create } from 'zustand';

// --- PRO SENSITIVITY CONSTANTS ---
export const GAME_PROFILES: Record<string, { name: string, multiplier: number, defaultFov: number }> = {
  valorant: { name: 'Valorant', multiplier: 1.0, defaultFov: 103 },
  cs2: { name: 'CS2 / Apex', multiplier: 3.1818, defaultFov: 106 },
  fortnite: { name: 'Fortnite (Percent)', multiplier: 12.5, defaultFov: 103 }, 
  overwatch: { name: 'Overwatch 2', multiplier: 10.6, defaultFov: 103 }
};

export const TRACK_LIST = [
  { id: 'none', name: '🔇 Muted' },
  { id: 'temptations', name: 'Temptations' },
  { id: 'usher', name: 'Usher' },
  { id: 'ckay', name: 'Ckay' },
  { id: 'Benson Boone', name: 'Benson Boone' },
  { id: 'pretty little baby', name: 'Pretty Little Baby' },
  { id: 'believer', name: 'Believer' },
  { id: 'sam smith', name: 'Sam Smith' },
  { id: 'I Thought I Saw Your Face Today', name: 'I Thought I Saw Your Face' },
  { id: 'jay hawkins', name: 'Jay Hawkins' },
  { id: 'chuck berry rudolph', name: 'Chuck Berry Rudolph' },
  { id: 'Sh-Boom', name: 'Sh-Boom' },
  { id: 'bak jay', name: 'Bak Jay' },
  { id: 'lonley child nba', name: 'Lonely Child - NBA' },
  { id: 'slime mentallity nba', name: 'Slime Mentality - NBA' },
  { id: 'i hate youngboy nba', name: 'I Hate Youngboy - NBA' },
  { id: 'cleaning out my closet eminem', name: 'Cleaning Out My Closet - Eminem' },
  { id: 'godzilla eminem', name: 'Godzilla - Eminem' },
  { id: 'mockingbird eminem', name: 'Mockingbird - Eminem' },
  { id: 'juice titanic', name: 'Titanic - Juice WRLD' },
  { id: 'juice conversations', name: 'Conversations - Juice WRLD' },
  { id: 'juice lucid dreams', name: 'Lucid Dreams - Juice WRLD' },
  { id: 'Juice Wrld Robbery', name: 'Robbery - Juice WRLD' },
  { id: 'untouchable nba', name: 'Untouchable - NBA' },
  { id: 'Role Model eminem', name: 'Role Model - Eminem' },
  { id: 'my world', name: 'My World' },
  { id: 'juice eminem', name: 'Juice & Eminem' },
  { id: 'otw', name: 'OTW' },
  { id: 'come closer wiz', name: 'Come Closer - Wiz' },
  { id: 'psycho post malone', name: 'Psycho - Post Malone' },
  { id: 'bazzooka', name: 'Bazzooka' },
  { id: 'rockstar post malone', name: 'Rockstar - Post Malone' },
  { id: 'cute', name: 'Cute' },
  { id: 'nunca', name: 'Nunca' },
  { id: 'judas', name: 'Judas' },
  { id: 'mont', name: 'Mont' },
  { id: 'funk', name: 'Funk' },
  { id: 'type', name: 'Type' },
  { id: 'lowd', name: 'Lowd' },
  { id: 'rah', name: 'Rah' },
  { id: 'bass', name: 'Bass' }
];

export const playHitSound = (type: string) => {
  if (type === 'none') return; 
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'tick') {
      osc.type = 'square'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    } else if (type === 'pop') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    } else if (type === 'ding') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    }
    
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

const loadHighScores = () => {
  const saved = localStorage.getItem('efect_highscores');
  return saved ? JSON.parse(saved) : {};
};

const loadProfile = () => {
  const saved = localStorage.getItem('efect_profile');
  return saved ? JSON.parse(saved) : {};
};
const p = loadProfile();

interface GameState {
  username: string; 
  color: string; size: number; thickness: number; gap: number; dot: boolean;
  crosshairOutline: boolean; skipClickToBegin: boolean; 
  targetColor: string; targetShape: 'sphere' | 'cube' | 'humanoid'; 
  targetSkinMode: 'custom' | 'original'; 
  hitSound: 'tick' | 'pop' | 'ding' | 'none'; 
  scenario: string; 
  weaponMode: 'stealth' | 'laser'; weaponClass: 'pistol' | 'smg' | 'sniper';
  mapTheme: 'cyber' | 'minimal' | 'galaxy' | 'night'; graphicsQuality: 'high' | 'performance';
  drillDuration: number; musicTrack: string; musicVolume: number;
  isMusicPlaying: boolean; isFiring: boolean; targetSpeed: number; modelScale: number;
  targetAmount: number; targetDistance: number; 
  score: number; shots: number; timeLeft: number;
  combo: number;
  gameProfile: string;
  gameSens: number;
  fov: number;
  gameState: 'login' | 'scenarioSelect' | 'customizer' | 'playing' | 'gameover' | 'leaderboard'; 
  hitTrigger: number;
  hitmarkerTrigger: number; 
  hitLog: number[]; // <-- PHASE 3: ANALYTICS LOG
  highScores: Record<string, number>;
  setSettings: (settings: Partial<GameState>) => void;
  setWeapon: (wClass: 'pistol' | 'smg' | 'sniper') => void; 
  setIsFiring: (val: boolean) => void;
  goToScenarios: () => void; goToCustomizer: () => void;
  startGame: () => void; endGame: () => void; tickTimer: () => void;
  fireShot: () => boolean; 
  registerHit: (points?: number) => void; 
  resetCombo: () => void;
}

export const useStore = create<GameState>((set) => ({
  username: p.username || `Player_${Math.floor(Math.random() * 9999)}`, 
  color: p.color || '#00ff00', size: p.size ?? 8, thickness: p.thickness ?? 2, gap: p.gap ?? 5, dot: p.dot ?? true,
  crosshairOutline: p.crosshairOutline ?? true, skipClickToBegin: p.skipClickToBegin ?? false, 
  targetColor: p.targetColor || '#00ff00', targetShape: p.targetShape || 'sphere', 
  targetSkinMode: p.targetSkinMode || 'custom',
  hitSound: p.hitSound || 'tick',
  weaponMode: p.weaponMode || 'laser', weaponClass: p.weaponClass || 'pistol',
  mapTheme: p.mapTheme || 'cyber', graphicsQuality: p.graphicsQuality || 'high',
  drillDuration: p.drillDuration || 60, targetSpeed: p.targetSpeed || 1,
  modelScale: p.modelScale ?? 1.0, 
  targetAmount: p.targetAmount ?? 10, targetDistance: p.targetDistance ?? -8.5,
  musicTrack: p.musicTrack || 'none', 
  musicVolume: p.musicVolume ?? 0.2,
  isMusicPlaying: false, 
  scenario: 'gridshot_standard', isFiring: false,
  score: 0, shots: 0, timeLeft: 60, combo: 0, 
  gameState: 'login', // <-- BOOTS TO SECURE GATEWAY
  hitTrigger: 0,
  hitmarkerTrigger: 0, 
  hitLog: [], // <-- PHASE 3: INIT STATE
  highScores: loadHighScores(),
  gameProfile: p.gameProfile || 'valorant',
  gameSens: p.gameSens ?? 0.35,
  fov: p.fov ?? 103,

  setSettings: (newSettings) => set((state) => {
    const nextState = { ...state, ...newSettings };
    localStorage.setItem('efect_profile', JSON.stringify(nextState));
    return nextState;
  }),
  
  setWeapon: (wClass) => set((state) => {
    state.setSettings({ weaponClass: wClass });
    return { weaponClass: wClass };
  }),
  
  setIsFiring: (val) => set({ isFiring: val }),
  goToScenarios: () => set({ gameState: 'scenarioSelect' }),
  goToCustomizer: () => set({ gameState: 'customizer' }),
  
  startGame: () => set((state) => {
    const initialShots = state.skipClickToBegin ? 1 : 0; 
    return { 
      gameState: 'playing', score: 0, shots: initialShots, combo: 0, 
      hitTrigger: 0, hitmarkerTrigger: 0, hitLog: [], // <-- RESET ON NEW GAME
      timeLeft: state.drillDuration 
    };
  }),
  
  endGame: () => set((state) => {
    const currentHigh = state.highScores[state.scenario] || 0;
    const isNewHigh = state.score > currentHigh;
    const newHighScores = { ...state.highScores, [state.scenario]: isNewHigh ? state.score : currentHigh };
    
    if (isNewHigh) {
      localStorage.setItem('efect_highscores', JSON.stringify(newHighScores));
    }
    
    if (state.score > 0) {
      import('../firebase').then(({ submitScore }) => {
        const accuracy = state.shots > 0 ? Math.round((state.score / state.shots) * 100) : 0;
        submitScore(state.scenario, state.username, state.score, accuracy);
      }).catch((err) => console.warn("Firebase not loaded: ", err));
    }
    
    return { gameState: 'gameover', highScores: newHighScores };
  }),
  
  tickTimer: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
  fireShot: () => { set((state) => ({ shots: state.shots + 1 })); return true; },
  registerHit: (points = 1) => set((state) => { 
    playHitSound(state.hitSound); 
    const timeElapsed = state.drillDuration - state.timeLeft; 
    return { 
      score: state.score + points, 
      hitTrigger: state.hitTrigger + 1, 
      combo: state.combo + 1,
      hitmarkerTrigger: Date.now(),
      hitLog: [...state.hitLog, timeElapsed] 
    }; 
  }),
  resetCombo: () => set({ combo: 0 }),
}));