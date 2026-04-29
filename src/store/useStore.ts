import { create } from 'zustand';

/* =========================================================
   EMX AIM TRAINER STORE
   Fully rebuilt state layer:
   - safer profile saving
   - clean hit / miss / combo tracking
   - headshot-ready stats
   - backward-compatible registerHit(points)
   - old EFECT storage keys kept so your current saves still load
========================================================= */

export const GAME_PROFILES: Record<
  string,
  { name: string; multiplier: number; defaultFov: number }
> = {
  valorant: { name: 'Valorant', multiplier: 1.0, defaultFov: 103 },
  cs2: { name: 'CS2 / Apex', multiplier: 3.1818, defaultFov: 106 },
  fortnite: { name: 'Fortnite (Percent)', multiplier: 12.5, defaultFov: 103 },
  overwatch: { name: 'Overwatch 2', multiplier: 10.6, defaultFov: 103 },
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
  { id: 'bass', name: 'Bass' },
];

export type WeaponClass = 'pistol' | 'smg' | 'sniper' | 'nerf';
export type WeaponMode = 'stealth' | 'laser';
export type TargetShape = 'sphere' | 'cube' | 'humanoid';
export type TargetSkinMode = 'custom' | 'original';
export type HitSound = 'tick' | 'pop' | 'ding' | 'none';
export type GraphicsQuality = 'high' | 'performance';

export type MapTheme =
  | 'cosmic_space'
  | 'skydeck_cloud_lab'
  | 'industrial_warehouse'
  | 'jungle_temple_ruins'
  | 'neon_rooftop_city'
  | 'tech_training_arena'
  | 'training_chamber'
  | 'efect_arena'
  | 'luxury_lounge'
  | 'cyber_rooftop'
  | 'cyber'
  | 'minimal'
  | 'galaxy'
  | 'night'
  | 'cosmic_space_360'
  | 'training_chamber_360'
  | 'efect_arena_360'
  | 'synthwave'
  | 'zenith'
  | 'factory'
  | 'temple'
  | 'mirage';

export type AppScreen =
  | 'login'
  | 'scenarioSelect'
  | 'customizer'
  | 'playing'
  | 'gameover'
  | 'leaderboard';

export type HitType = 'normal' | 'body' | 'headshot' | 'tracking' | 'perfect';

export type HitMeta = {
  type?: HitType;
  headshot?: boolean;
  basePoints?: number;
  bonusPoints?: number;
};

export type HitDetail = {
  time: number;
  points: number;
  basePoints: number;
  bonusPoints: number;
  type: HitType;
  combo: number;
  accuracyAfter: number;
};

const PROFILE_KEY = 'efect_profile';
const HIGHSCORES_KEY = 'efect_highscores';
const DEFAULT_USERNAME = 'EMX TWEAKS';

const OLD_DEFAULT_NAMES = new Set([
  'efect2lit',
  'emx2lit',
  'exm2lit',
  'emx_agent',
  'emx agent',
  'unknown_agent',
]);

const PROFILE_KEYS = [
  'username',
  'color',
  'size',
  'thickness',
  'gap',
  'dot',
  'crosshairOutline',
  'skipClickToBegin',
  'targetColor',
  'targetShape',
  'targetSkinMode',
  'hitSound',
  'scenario',
  'weaponMode',
  'weaponClass',
  'mapTheme',
  'graphicsQuality',
  'drillDuration',
  'musicTrack',
  'musicVolume',
  'targetSpeed',
  'modelScale',
  'targetAmount',
  'targetDistance',
  'gameProfile',
  'gameSens',
  'fov',
] as const;

let sharedAudioContext: AudioContext | null = null;

const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeNumber = (value: unknown, fallback: number, min?: number, max?: number) => {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  if (typeof min === 'number' && num < min) return min;
  if (typeof max === 'number' && num > max) return max;

  return num;
};

const safeBoolean = (value: unknown, fallback: boolean) => {
  return typeof value === 'boolean' ? value : fallback;
};

const sanitizeUsername = (value: unknown) => {
  if (typeof value !== 'string') return DEFAULT_USERNAME;

  const trimmed = value.trim();

  if (!trimmed) return DEFAULT_USERNAME;
  if (OLD_DEFAULT_NAMES.has(trimmed.toLowerCase())) return DEFAULT_USERNAME;

  return trimmed.substring(0, 16);
};

const normalizeWeaponClass = (value: unknown): WeaponClass => {
  if (value === 'smg' || value === 'sniper' || value === 'nerf') return value;
  return 'pistol';
};

const normalizeWeaponMode = (value: unknown): WeaponMode => {
  if (value === 'stealth') return 'stealth';
  return 'laser';
};

const normalizeTargetShape = (value: unknown): TargetShape => {
  if (value === 'cube' || value === 'humanoid') return value;
  return 'sphere';
};

const normalizeTargetSkinMode = (value: unknown): TargetSkinMode => {
  if (value === 'original') return 'original';
  return 'custom';
};

const normalizeHitSound = (value: unknown): HitSound => {
  if (value === 'pop' || value === 'ding' || value === 'none') return value;
  return 'tick';
};

const normalizeGraphicsQuality = (value: unknown): GraphicsQuality => {
  if (value === 'performance') return 'performance';
  return 'high';
};

const normalizeGameProfile = (value: unknown) => {
  if (typeof value === 'string' && GAME_PROFILES[value]) return value;
  return 'valorant';
};

const normalizeMapTheme = (value: unknown): MapTheme => {
  if (typeof value !== 'string') return 'efect_arena';

  const aliases: Record<string, MapTheme> = {
    cyber: 'efect_arena',
    minimal: 'skydeck_cloud_lab',
    galaxy: 'cosmic_space',
    night: 'training_chamber',
    synthwave: 'cyber_rooftop',
    zenith: 'luxury_lounge',
    factory: 'industrial_warehouse',
    temple: 'jungle_temple_ruins',
    mirage: 'neon_rooftop_city',
    cosmic_space_360: 'cosmic_space',
    training_chamber_360: 'training_chamber',
    efect_arena_360: 'efect_arena',
  };

  if (aliases[value]) return aliases[value];

  const validThemes = new Set([
    'cosmic_space',
    'skydeck_cloud_lab',
    'industrial_warehouse',
    'jungle_temple_ruins',
    'neon_rooftop_city',
    'tech_training_arena',
    'training_chamber',
    'efect_arena',
    'luxury_lounge',
    'cyber_rooftop',
  ]);

  if (validThemes.has(value)) return value as MapTheme;

  return 'efect_arena';
};

const loadProfile = () => {
  if (typeof window === 'undefined') return {};
  return safeJsonParse<Record<string, any>>(localStorage.getItem(PROFILE_KEY), {});
};

const loadHighScores = () => {
  if (typeof window === 'undefined') return {};
  return safeJsonParse<Record<string, number>>(localStorage.getItem(HIGHSCORES_KEY), {});
};

const buildPersistedProfile = (state: Partial<GameState>) => {
  const profile: Record<string, unknown> = {};

  PROFILE_KEYS.forEach((key) => {
    if (key in state) {
      profile[key] = state[key as keyof GameState];
    }
  });

  return profile;
};

const saveProfile = (state: Partial<GameState>) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(buildPersistedProfile(state)));
  } catch {
    // Profile saving is optional. Do not crash the trainer.
  }
};

const saveHighScores = (highScores: Record<string, number>) => {
  try {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highScores));
  } catch {
    // High score saving is optional. Do not crash the trainer.
  }
};

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
};

export const playHitSound = (type: string) => {
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();

    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.075, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'ding') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.105, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(780, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.09);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  } catch {
    // Audio is optional. Safe to ignore.
  }
};

const normalizeSettings = (settings: Partial<GameState>): Partial<GameState> => {
  const next: Partial<GameState> = { ...settings };

  if ('username' in next) next.username = sanitizeUsername(next.username);
  if ('weaponClass' in next) next.weaponClass = normalizeWeaponClass(next.weaponClass);
  if ('weaponMode' in next) next.weaponMode = normalizeWeaponMode(next.weaponMode);
  if ('targetShape' in next) next.targetShape = normalizeTargetShape(next.targetShape);
  if ('targetSkinMode' in next) next.targetSkinMode = normalizeTargetSkinMode(next.targetSkinMode);
  if ('hitSound' in next) next.hitSound = normalizeHitSound(next.hitSound);
  if ('graphicsQuality' in next) next.graphicsQuality = normalizeGraphicsQuality(next.graphicsQuality);
  if ('mapTheme' in next) next.mapTheme = normalizeMapTheme(next.mapTheme);
  if ('gameProfile' in next) next.gameProfile = normalizeGameProfile(next.gameProfile);

  if ('drillDuration' in next) next.drillDuration = safeNumber(next.drillDuration, 60, 10, 600);
  if ('musicVolume' in next) next.musicVolume = safeNumber(next.musicVolume, 0.2, 0, 1);
  if ('targetSpeed' in next) next.targetSpeed = safeNumber(next.targetSpeed, 1, 0.1, 5);
  if ('modelScale' in next) next.modelScale = safeNumber(next.modelScale, 1, 0.1, 5);
  if ('targetAmount' in next) next.targetAmount = Math.round(safeNumber(next.targetAmount, 10, 1, 50));
  if ('targetDistance' in next) next.targetDistance = safeNumber(next.targetDistance, -8.5, -80, 80);
  if ('gameSens' in next) next.gameSens = safeNumber(next.gameSens, 0.35, 0.01, 100);
  if ('fov' in next) next.fov = safeNumber(next.fov, 103, 60, 130);
  if ('size' in next) next.size = safeNumber(next.size, 8, 1, 80);
  if ('thickness' in next) next.thickness = safeNumber(next.thickness, 2, 1, 30);
  if ('gap' in next) next.gap = safeNumber(next.gap, 5, 0, 80);

  return next;
};

const profile = loadProfile();

interface GameState {
  username: string;

  color: string;
  size: number;
  thickness: number;
  gap: number;
  dot: boolean;
  crosshairOutline: boolean;
  skipClickToBegin: boolean;

  targetColor: string;
  targetShape: TargetShape;
  targetSkinMode: TargetSkinMode;
  hitSound: HitSound;

  scenario: string;

  weaponMode: WeaponMode;
  weaponClass: WeaponClass;

  mapTheme: MapTheme;
  graphicsQuality: GraphicsQuality;

  drillDuration: number;
  musicTrack: string;
  musicVolume: number;
  isMusicPlaying: boolean;

  isFiring: boolean;

  targetSpeed: number;
  modelScale: number;
  targetAmount: number;
  targetDistance: number;

  score: number;
  shots: number;
  misses: number;
  timeLeft: number;
  combo: number;
  bestCombo: number;

  gameProfile: string;
  gameSens: number;
  fov: number;

  gameState: AppScreen;

  hitTrigger: number;
  hitmarkerTrigger: number;
  hitLog: number[];
  hitDetails: HitDetail[];

  headshots: number;
  bodyHits: number;
  trackingHits: number;
  perfectHits: number;
  totalBonusPoints: number;

  lastHitType: HitType | null;
  lastHitPoints: number;
  lastHitBonus: number;

  highScores: Record<string, number>;

  setSettings: (settings: Partial<GameState>) => void;
  setWeapon: (wClass: WeaponClass) => void;
  setIsFiring: (val: boolean) => void;

  goToScenarios: () => void;
  goToCustomizer: () => void;

  startGame: () => void;
  endGame: () => void;
  tickTimer: () => void;

  fireShot: () => boolean;
  registerHit: (points?: number, meta?: HitMeta) => void;
  resetCombo: () => void;
}

export const useStore = create<GameState>((set, get) => ({
  username: sanitizeUsername(profile.username),

  color: typeof profile.color === 'string' ? profile.color : '#00ff00',
  size: safeNumber(profile.size, 8, 1, 80),
  thickness: safeNumber(profile.thickness, 2, 1, 30),
  gap: safeNumber(profile.gap, 5, 0, 80),
  dot: safeBoolean(profile.dot, true),
  crosshairOutline: safeBoolean(profile.crosshairOutline, true),
  skipClickToBegin: safeBoolean(profile.skipClickToBegin, false),

  targetColor: typeof profile.targetColor === 'string' ? profile.targetColor : '#00ff00',
  targetShape: normalizeTargetShape(profile.targetShape),
  targetSkinMode: normalizeTargetSkinMode(profile.targetSkinMode),
  hitSound: normalizeHitSound(profile.hitSound),

  weaponMode: normalizeWeaponMode(profile.weaponMode),
  weaponClass: normalizeWeaponClass(profile.weaponClass),

  mapTheme: normalizeMapTheme(profile.mapTheme || 'efect_arena'),
  graphicsQuality: normalizeGraphicsQuality(profile.graphicsQuality),

  drillDuration: safeNumber(profile.drillDuration, 60, 10, 600),
  targetSpeed: safeNumber(profile.targetSpeed, 1, 0.1, 5),
  modelScale: safeNumber(profile.modelScale, 1, 0.1, 5),
  targetAmount: Math.round(safeNumber(profile.targetAmount, 10, 1, 50)),
  targetDistance: safeNumber(profile.targetDistance, -8.5, -80, 80),

  musicTrack: typeof profile.musicTrack === 'string' ? profile.musicTrack : 'none',
  musicVolume: safeNumber(profile.musicVolume, 0.2, 0, 1),
  isMusicPlaying: false,

  scenario: typeof profile.scenario === 'string' ? profile.scenario : 'gridshot_standard',
  isFiring: false,

  score: 0,
  shots: 0,
  misses: 0,
  timeLeft: safeNumber(profile.drillDuration, 60, 10, 600),
  combo: 0,
  bestCombo: 0,

  gameState: 'login',

  hitTrigger: 0,
  hitmarkerTrigger: 0,
  hitLog: [],
  hitDetails: [],

  headshots: 0,
  bodyHits: 0,
  trackingHits: 0,
  perfectHits: 0,
  totalBonusPoints: 0,

  lastHitType: null,
  lastHitPoints: 0,
  lastHitBonus: 0,

  highScores: loadHighScores(),

  gameProfile: normalizeGameProfile(profile.gameProfile),
  gameSens: safeNumber(profile.gameSens, 0.35, 0.01, 100),
  fov: safeNumber(profile.fov, 103, 60, 130),

  setSettings: (newSettings) =>
    set((state) => {
      const normalizedSettings = normalizeSettings(newSettings);
      const nextState = {
        ...state,
        ...normalizedSettings,
      };

      saveProfile(nextState);

      return normalizedSettings;
    }),

  setWeapon: (wClass) =>
    set((state) => {
      const weaponClass = normalizeWeaponClass(wClass);
      const nextState = {
        ...state,
        weaponClass,
      };

      saveProfile(nextState);

      return {
        weaponClass,
      };
    }),

  setIsFiring: (val) =>
    set({
      isFiring: val,
    }),

  goToScenarios: () =>
    set({
      gameState: 'scenarioSelect',
      isFiring: false,
    }),

  goToCustomizer: () =>
    set({
      gameState: 'customizer',
      isFiring: false,
    }),

  startGame: () =>
    set((state) => {
      const safeDuration = safeNumber(state.drillDuration, 60, 10, 600);
      const initialShots = state.skipClickToBegin ? 1 : 0;

      return {
        gameState: 'playing',
        isFiring: false,

        score: 0,
        shots: initialShots,
        misses: 0,
        combo: 0,
        bestCombo: 0,

        hitTrigger: 0,
        hitmarkerTrigger: 0,
        hitLog: [],
        hitDetails: [],

        headshots: 0,
        bodyHits: 0,
        trackingHits: 0,
        perfectHits: 0,
        totalBonusPoints: 0,

        lastHitType: null,
        lastHitPoints: 0,
        lastHitBonus: 0,

        timeLeft: safeDuration,
      };
    }),

  endGame: () =>
    set((state) => {
      const currentHigh = state.highScores[state.scenario] || 0;
      const isNewHigh = state.score > currentHigh;

      const newHighScores = {
        ...state.highScores,
        [state.scenario]: isNewHigh ? state.score : currentHigh,
      };

      if (isNewHigh) {
        saveHighScores(newHighScores);
      }

      if (state.score > 0) {
        import('../firebase')
          .then(({ submitScore }) => {
            const accuracy =
              state.shots > 0 ? Math.round((state.hitTrigger / state.shots) * 100) : 0;

            submitScore(
              state.scenario,
              sanitizeUsername(state.username),
              state.score,
              accuracy
            );
          })
          .catch((err) => console.warn('Firebase not loaded:', err));
      }

      return {
        gameState: 'gameover',
        isFiring: false,
        highScores: newHighScores,
      };
    }),

  tickTimer: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  fireShot: () => {
    const state = get();

    if (state.gameState !== 'playing') {
      return false;
    }

    set((current) => {
      const nextShots = current.shots + 1;

      return {
        shots: nextShots,
        misses: Math.max(0, nextShots - current.hitTrigger),
      };
    });

    return true;
  },

  registerHit: (points = 1, meta = {}) =>
    set((state) => {
      playHitSound(state.hitSound);

      const timeElapsed = Math.max(0, state.drillDuration - state.timeLeft);

      const hitType: HitType =
        meta.type ||
        (meta.headshot ? 'headshot' : state.scenario.includes('tracking') ? 'tracking' : 'normal');

      const safePoints = Math.max(0, Math.round(points));
      const basePoints = Math.max(0, Math.round(meta.basePoints ?? safePoints));
      const bonusPoints = Math.max(
        0,
        Math.round(meta.bonusPoints ?? Math.max(0, safePoints - basePoints))
      );

      const nextHits = state.hitTrigger + 1;
      const nextCombo = state.combo + 1;
      const nextScore = state.score + safePoints;
      const nextAccuracy = state.shots > 0 ? Math.round((nextHits / state.shots) * 100) : 100;

      const hitDetail: HitDetail = {
        time: timeElapsed,
        points: safePoints,
        basePoints,
        bonusPoints,
        type: hitType,
        combo: nextCombo,
        accuracyAfter: nextAccuracy,
      };

      return {
        score: nextScore,
        hitTrigger: nextHits,
        combo: nextCombo,
        bestCombo: Math.max(state.bestCombo, nextCombo),
        hitmarkerTrigger: Date.now(),
        hitLog: [...state.hitLog, timeElapsed],
        hitDetails: [...state.hitDetails.slice(-499), hitDetail],

        misses: Math.max(0, state.shots - nextHits),

        headshots: state.headshots + (hitType === 'headshot' ? 1 : 0),
        bodyHits: state.bodyHits + (hitType === 'body' || hitType === 'normal' ? 1 : 0),
        trackingHits: state.trackingHits + (hitType === 'tracking' ? 1 : 0),
        perfectHits: state.perfectHits + (hitType === 'perfect' ? 1 : 0),
        totalBonusPoints: state.totalBonusPoints + bonusPoints,

        lastHitType: hitType,
        lastHitPoints: safePoints,
        lastHitBonus: bonusPoints,
      };
    }),

  resetCombo: () =>
    set({
      combo: 0,
    }),
}));