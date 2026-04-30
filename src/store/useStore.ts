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
export type BulletEffect = 'none' | 'tracer' | 'plasma' | 'spark' | 'rail';
export type TargetShape = 'sphere' | 'cube' | 'humanoid';
export type TargetSkinMode = 'custom' | 'original';
export type HitSound = 'tick' | 'pop' | 'ding' | 'crit' | 'arcade' | 'none';
export type GraphicsQuality = 'high' | 'performance';
export type CrosshairHitReact = 'off' | 'pulse' | 'burst';

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
  side?: 'left' | 'center' | 'right';
};

export type HitDetail = {
  time: number;
  points: number;
  basePoints: number;
  bonusPoints: number;
  type: HitType;
  combo: number;
  accuracyAfter: number;
  side: 'left' | 'center' | 'right';
};

export type SessionSummary = {
  id: string;
  date: string;
  scenario: string;
  score: number;
  accuracy: number;
  hits: number;
  headshots: number;
  bestCombo: number;
  hps: number;
  grade: string;
  xpEarned: number;
};

type ProgressionState = {
  xp: number;
  level: number;
  xpToNextLevel: number;
  totalSessions: number;
  totalHitsLifetime: number;
  totalHeadshotsLifetime: number;
  bestScoreOverall: number;
  dailyStreak: number;
  lastPlayDate: string;
  badges: string[];
  recentSessions: SessionSummary[];
};

const PROFILE_KEY = 'efect_profile';
const HIGHSCORES_KEY = 'efect_highscores';
const PROGRESSION_KEY = 'emx_progression_v1';
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
  'crosshairOpacity',
  'crosshairGlow',
  'crosshairDotScale',
  'crosshairHitReact',
  'skipClickToBegin',
  'targetColor',
  'targetShape',
  'targetSkinMode',
  'hitSound',
  'scenario',
  'weaponMode',
  'bulletEffect',
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

const normalizeBulletEffect = (value: unknown): BulletEffect => {
  if (
    value === 'none' ||
    value === 'plasma' ||
    value === 'spark' ||
    value === 'rail'
  ) {
    return value;
  }

  return 'tracer';
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
  if (value === 'pop' || value === 'ding' || value === 'crit' || value === 'arcade' || value === 'none') {
    return value;
  }

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

const getXpForLevel = (level: number) => {
  return Math.max(0, Math.pow(Math.max(1, level) - 1, 2) * 850);
};

const getLevelFromXp = (xp: number) => {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 850)) + 1;
};

const getXpToNextLevel = (xp: number) => {
  const level = getLevelFromXp(xp);
  return Math.max(0, getXpForLevel(level + 1) - xp);
};

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const isYesterday = (dateKey: string, todayKey: string) => {
  const [year, month, day] = todayKey.split('-').map(Number);
  const yesterday = new Date(year, month - 1, day - 1);

  return dateKey === getLocalDateKey(yesterday);
};

const getGradeLetter = (
  score: number,
  accuracy: number,
  bestCombo: number,
  hps: number,
  headshots: number
) => {
  const gradeScore = score * 0.018 + accuracy * 2.7 + bestCombo * 6 + hps * 90 + headshots * 18;

  if (gradeScore >= 780) return 'S+';
  if (gradeScore >= 640) return 'S';
  if (gradeScore >= 480) return 'A';
  if (gradeScore >= 340) return 'B';
  if (gradeScore >= 220) return 'C';

  return 'D';
};

const calculateSessionXp = ({
  score,
  hits,
  headshots,
  accuracy,
  bestCombo,
  totalBonusPoints,
  isNewHigh,
}: {
  score: number;
  hits: number;
  headshots: number;
  accuracy: number;
  bestCombo: number;
  totalBonusPoints: number;
  isNewHigh: boolean;
}) => {
  const baseXp =
    score * 0.08 +
    hits * 20 +
    headshots * 55 +
    accuracy * 8 +
    bestCombo * 16 +
    totalBonusPoints * 0.25 +
    (isNewHigh ? 350 : 0);

  return Math.max(25, Math.round(baseXp));
};

const getUnlockedBadges = ({
  totalSessions,
  totalHitsLifetime,
  totalHeadshotsLifetime,
  bestScoreOverall,
  dailyStreak,
  bestCombo,
  accuracy,
  trackingHits,
}: {
  totalSessions: number;
  totalHitsLifetime: number;
  totalHeadshotsLifetime: number;
  bestScoreOverall: number;
  dailyStreak: number;
  bestCombo: number;
  accuracy: number;
  trackingHits: number;
}) => {
  const badges: string[] = ['FIRST DEPLOY'];

  if (totalSessions >= 10) badges.push('TEN RUN VETERAN');
  if (totalHitsLifetime >= 250) badges.push('TARGET BREAKER');
  if (totalHeadshotsLifetime >= 50) badges.push('HEADHUNTER');
  if (bestScoreOverall >= 25000) badges.push('SCORE CHASER');
  if (bestCombo >= 30) badges.push('CHAIN ARCHITECT');
  if (accuracy >= 85) badges.push('PRECISION CORE');
  if (dailyStreak >= 3) badges.push('STREAK ONLINE');
  if (trackingHits >= 25) badges.push('TRACKING SPECIALIST');

  return badges;
};

const normalizeProgression = (raw: Partial<ProgressionState>): ProgressionState => {
  const xp = safeNumber(raw.xp, 0, 0);
  const level = getLevelFromXp(xp);

  return {
    xp,
    level,
    xpToNextLevel: getXpToNextLevel(xp),
    totalSessions: Math.round(safeNumber(raw.totalSessions, 0, 0)),
    totalHitsLifetime: Math.round(safeNumber(raw.totalHitsLifetime, 0, 0)),
    totalHeadshotsLifetime: Math.round(safeNumber(raw.totalHeadshotsLifetime, 0, 0)),
    bestScoreOverall: Math.round(safeNumber(raw.bestScoreOverall, 0, 0)),
    dailyStreak: Math.round(safeNumber(raw.dailyStreak, 0, 0)),
    lastPlayDate: typeof raw.lastPlayDate === 'string' ? raw.lastPlayDate : '',
    badges: Array.isArray(raw.badges) ? raw.badges.filter((badge) => typeof badge === 'string') : [],
    recentSessions: Array.isArray(raw.recentSessions)
      ? raw.recentSessions
          .filter((session): session is SessionSummary => {
            return (
              typeof session === 'object' &&
              session !== null &&
              typeof session.id === 'string' &&
              typeof session.scenario === 'string'
            );
          })
          .map((session) => ({
            id: session.id,
            date: typeof session.date === 'string' ? session.date : '',
            scenario: session.scenario,
            score: Math.round(safeNumber(session.score, 0, 0)),
            accuracy: Math.round(safeNumber(session.accuracy, 0, 0, 100)),
            hits: Math.round(safeNumber(session.hits, 0, 0)),
            headshots: Math.round(safeNumber(session.headshots, 0, 0)),
            bestCombo: Math.round(safeNumber(session.bestCombo, 0, 0)),
            hps: safeNumber(session.hps, 0, 0),
            grade: typeof session.grade === 'string' ? session.grade : '--',
            xpEarned: Math.round(safeNumber(session.xpEarned, 0, 0)),
          }))
          .slice(0, 12)
      : [],
  };
};

const loadProgression = () => {
  if (typeof window === 'undefined') return normalizeProgression({});

  return normalizeProgression(
    safeJsonParse<Partial<ProgressionState>>(localStorage.getItem(PROGRESSION_KEY), {})
  );
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

const saveProgression = (progression: ProgressionState) => {
  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
  } catch {
    // Progression is a bonus layer. Never block the trainer.
  }
};

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
};

export const unlockAudio = async () => {
  try {
    const ctx = getAudioContext();

    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const gain = ctx.createGain();
    const osc = ctx.createOscillator();

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    osc.frequency.setValueAtTime(20, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.015);

    return true;
  } catch {
    return false;
  }
};

export const playUiSound = (kind: 'soft' | 'confirm' | 'error' | 'countdown' = 'soft') => {
  try {
    const ctx = getAudioContext();

    if (!ctx) return;

    const play = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = kind === 'error' ? 'sawtooth' : 'sine';

      if (kind === 'confirm') {
        osc.frequency.setValueAtTime(740, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1180, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
      } else if (kind === 'countdown') {
        osc.frequency.setValueAtTime(980, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1380, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
      } else if (kind === 'error') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.13, ctx.currentTime);
      } else {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.075, ctx.currentTime);
      }

      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    };

    if (ctx.state === 'suspended') {
      void ctx.resume().then(play).catch(() => null);
      return;
    }

    play();
  } catch {
    // UI sounds are non-critical.
  }
};

export const playHitSound = (type: string, hitType: HitType = 'normal') => {
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();

    if (!ctx) return;

    const play = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const isHeadshot = hitType === 'headshot';
      const volumeBoost = 1.75;

      if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(isHeadshot ? 1320 : 880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 640 : 300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime((isHeadshot ? 0.12 : 0.075) * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isHeadshot ? 760 : 420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.14 * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.11);
      } else if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isHeadshot ? 1680 : 1240, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1180 : 920, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime((isHeadshot ? 0.15 : 0.105) * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'crit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isHeadshot ? 1780 : 1180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime((isHeadshot ? 0.18 : 0.11) * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.stop(ctx.currentTime + 0.19);
      } else if (type === 'arcade') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isHeadshot ? 1420 : 920, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(isHeadshot ? 1820 : 1180, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime((isHeadshot ? 0.11 : 0.075) * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.stop(ctx.currentTime + 0.13);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(780, ctx.currentTime);
        gain.gain.setValueAtTime(0.07 * volumeBoost, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.09);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    };

    if (ctx.state === 'suspended') {
      void ctx.resume().then(play).catch(play);
      return;
    }

    play();
  } catch {
    // Audio is optional. Safe to ignore.
  }
};

const normalizeSettings = (settings: Partial<GameState>): Partial<GameState> => {
  const next: Partial<GameState> = { ...settings };

  if ('username' in next) next.username = sanitizeUsername(next.username);
  if ('weaponClass' in next) next.weaponClass = normalizeWeaponClass(next.weaponClass);
  if ('weaponMode' in next) next.weaponMode = normalizeWeaponMode(next.weaponMode);
  if ('bulletEffect' in next) next.bulletEffect = normalizeBulletEffect(next.bulletEffect);
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
  if ('crosshairOpacity' in next) {
    next.crosshairOpacity = safeNumber(next.crosshairOpacity, 1, 0.25, 1);
  }
  if ('crosshairGlow' in next) next.crosshairGlow = safeNumber(next.crosshairGlow, 1, 0, 2.5);
  if ('crosshairDotScale' in next) {
    next.crosshairDotScale = safeNumber(next.crosshairDotScale, 1, 0.45, 3.5);
  }
  if ('crosshairHitReact' in next) {
    next.crosshairHitReact =
      next.crosshairHitReact === 'off' || next.crosshairHitReact === 'burst'
        ? next.crosshairHitReact
        : 'pulse';
  }

  return next;
};

const profile = loadProfile();
const highScores = loadHighScores();
const progression = loadProgression();

interface GameState {
  username: string;

  color: string;
  size: number;
  thickness: number;
  gap: number;
  dot: boolean;
  crosshairOutline: boolean;
  crosshairOpacity: number;
  crosshairGlow: number;
  crosshairDotScale: number;
  crosshairHitReact: CrosshairHitReact;
  skipClickToBegin: boolean;

  targetColor: string;
  targetShape: TargetShape;
  targetSkinMode: TargetSkinMode;
  hitSound: HitSound;

  scenario: string;

  weaponMode: WeaponMode;
  bulletEffect: BulletEffect;
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

  xp: number;
  level: number;
  xpToNextLevel: number;
  totalSessions: number;
  totalHitsLifetime: number;
  totalHeadshotsLifetime: number;
  bestScoreOverall: number;
  dailyStreak: number;
  lastPlayDate: string;
  badges: string[];
  recentSessions: SessionSummary[];
  lastSessionXp: number;
  newlyUnlockedBadges: string[];
  previousBestBeforeSession: number;
  isSessionRecord: boolean;

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
  crosshairOpacity: safeNumber(profile.crosshairOpacity, 1, 0.25, 1),
  crosshairGlow: safeNumber(profile.crosshairGlow, 1, 0, 2.5),
  crosshairDotScale: safeNumber(profile.crosshairDotScale, 1, 0.45, 3.5),
  crosshairHitReact:
    profile.crosshairHitReact === 'off' || profile.crosshairHitReact === 'burst'
      ? profile.crosshairHitReact
      : 'pulse',
  skipClickToBegin: safeBoolean(profile.skipClickToBegin, false),

  targetColor: typeof profile.targetColor === 'string' ? profile.targetColor : '#00ff00',
  targetShape: normalizeTargetShape(profile.targetShape),
  targetSkinMode: normalizeTargetSkinMode(profile.targetSkinMode),
  hitSound: normalizeHitSound(profile.hitSound),

  weaponMode: normalizeWeaponMode(profile.weaponMode),
  bulletEffect: normalizeBulletEffect(profile.bulletEffect),
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

  highScores,

  xp: progression.xp,
  level: progression.level,
  xpToNextLevel: progression.xpToNextLevel,
  totalSessions: progression.totalSessions,
  totalHitsLifetime: progression.totalHitsLifetime,
  totalHeadshotsLifetime: progression.totalHeadshotsLifetime,
  bestScoreOverall: progression.bestScoreOverall,
  dailyStreak: progression.dailyStreak,
  lastPlayDate: progression.lastPlayDate,
  badges: progression.badges,
  recentSessions: progression.recentSessions,
  lastSessionXp: 0,
  newlyUnlockedBadges: [],
  previousBestBeforeSession: highScores[typeof profile.scenario === 'string' ? profile.scenario : 'gridshot_standard'] || 0,
  isSessionRecord: false,

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
      const previousBestBeforeSession = state.highScores[state.scenario] || 0;

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
        lastSessionXp: 0,
        newlyUnlockedBadges: [],
        previousBestBeforeSession,
        isSessionRecord: false,

        timeLeft: safeDuration,
      };
    }),

  endGame: () =>
    set((state) => {
      const currentHigh = state.highScores[state.scenario] || 0;
      const isNewHigh = state.score > currentHigh;
      const hits = state.hitTrigger;
      const accuracy = state.shots > 0 ? Math.round((hits / state.shots) * 100) : 0;
      const hps = state.drillDuration > 0 ? hits / state.drillDuration : 0;
      const todayKey = getLocalDateKey();
      const shouldRecordSession = state.shots > 0 || state.score > 0;

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
            submitScore(
              state.scenario,
              sanitizeUsername(state.username),
              state.score,
              accuracy
            );
          })
          .catch((err) => console.warn('Firebase not loaded:', err));
      }

      const sessionXp = shouldRecordSession
        ? calculateSessionXp({
            score: state.score,
            hits,
            headshots: state.headshots,
            accuracy,
            bestCombo: state.bestCombo,
            totalBonusPoints: state.totalBonusPoints,
            isNewHigh,
          })
        : 0;

      const nextXp = state.xp + sessionXp;
      const nextLevel = getLevelFromXp(nextXp);
      const nextTotalSessions = state.totalSessions + (shouldRecordSession ? 1 : 0);
      const nextTotalHits = state.totalHitsLifetime + hits;
      const nextTotalHeadshots = state.totalHeadshotsLifetime + state.headshots;
      const nextBestScore = Math.max(state.bestScoreOverall, state.score);
      const nextDailyStreak = shouldRecordSession
        ? state.lastPlayDate === todayKey
          ? Math.max(1, state.dailyStreak)
          : isYesterday(state.lastPlayDate, todayKey)
            ? state.dailyStreak + 1
            : 1
        : state.dailyStreak;
      const unlockedBadges = getUnlockedBadges({
        totalSessions: nextTotalSessions,
        totalHitsLifetime: nextTotalHits,
        totalHeadshotsLifetime: nextTotalHeadshots,
        bestScoreOverall: nextBestScore,
        dailyStreak: nextDailyStreak,
        bestCombo: state.bestCombo,
        accuracy,
        trackingHits: state.trackingHits,
      });
      const nextBadges = Array.from(new Set([...state.badges, ...unlockedBadges]));
      const newlyUnlockedBadges = nextBadges.filter((badge) => !state.badges.includes(badge));
      const sessionSummary: SessionSummary = {
        id: `${Date.now()}-${state.scenario}`,
        date: new Date().toISOString(),
        scenario: state.scenario,
        score: state.score,
        accuracy,
        hits,
        headshots: state.headshots,
        bestCombo: state.bestCombo,
        hps,
        grade: getGradeLetter(state.score, accuracy, state.bestCombo, hps, state.headshots),
        xpEarned: sessionXp,
      };
      const recentSessions = shouldRecordSession
        ? [sessionSummary, ...state.recentSessions].slice(0, 12)
        : state.recentSessions;
      const nextProgression: ProgressionState = {
        xp: nextXp,
        level: nextLevel,
        xpToNextLevel: getXpToNextLevel(nextXp),
        totalSessions: nextTotalSessions,
        totalHitsLifetime: nextTotalHits,
        totalHeadshotsLifetime: nextTotalHeadshots,
        bestScoreOverall: nextBestScore,
        dailyStreak: nextDailyStreak,
        lastPlayDate: shouldRecordSession ? todayKey : state.lastPlayDate,
        badges: nextBadges,
        recentSessions,
      };

      if (shouldRecordSession) {
        saveProgression(nextProgression);
      }

      return {
        gameState: 'gameover',
        isFiring: false,
        highScores: newHighScores,
        xp: nextProgression.xp,
        level: nextProgression.level,
        xpToNextLevel: nextProgression.xpToNextLevel,
        totalSessions: nextProgression.totalSessions,
        totalHitsLifetime: nextProgression.totalHitsLifetime,
        totalHeadshotsLifetime: nextProgression.totalHeadshotsLifetime,
        bestScoreOverall: nextProgression.bestScoreOverall,
        dailyStreak: nextProgression.dailyStreak,
        lastPlayDate: nextProgression.lastPlayDate,
        badges: nextProgression.badges,
        recentSessions: nextProgression.recentSessions,
        lastSessionXp: sessionXp,
        newlyUnlockedBadges,
        previousBestBeforeSession: currentHigh,
        isSessionRecord: isNewHigh,
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

    const ctx = getAudioContext();
    if (ctx?.state === 'suspended') void ctx.resume();

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
      const timeElapsed = Math.max(0, state.drillDuration - state.timeLeft);

      const hitType: HitType =
        meta.type ||
        (meta.headshot ? 'headshot' : state.scenario.includes('tracking') ? 'tracking' : 'normal');

      playHitSound(state.hitSound, hitType);

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
        side: meta.side || 'center',
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
