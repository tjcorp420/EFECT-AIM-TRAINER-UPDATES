/**
 * ============================================================================
 * EFECT AIM TRAINER - SCENARIO DATA REGISTRY
 * VERSION: 0.6.0 "EFECT_TRAINING_SUITE_CORE"
 * ============================================================================
 *
 * SAFE DROP-IN:
 * - Keeps all original scenario IDs.
 * - Adds premium training categories.
 * - Adds EFECT routines / playlists.
 * - Adds ranked benchmark database.
 * - Adds helpers for ScenarioSelect, CoachEngine, SessionReview, future playlists.
 * ============================================================================
 */

export type ScenarioType =
  | 'SPECIAL'
  | 'FLICK'
  | 'PRECISION'
  | 'REACTION'
  | 'TRACKING'
  | 'TIMING'
  | 'DYNAMIC';

export type ScenarioDifficulty = 'STANDARD' | 'ADVANCED' | 'ELITE' | 'EXTREME';

export type ScenarioSkill =
  | 'FULL_MECHANICS'
  | 'TARGET_SWITCHING'
  | 'MICRO_CORRECTION'
  | 'REACTION_SPEED'
  | 'SMOOTH_TRACKING'
  | 'STRAFE_READING'
  | 'VERTICAL_TIMING'
  | 'SPATIAL_AWARENESS'
  | 'CENTER_RESET'
  | 'LONG_RANGE'
  | 'FORTNITE_PUMP'
  | 'MOVEMENT_READING';

export type ScenarioCategory =
  | 'FEATURED'
  | 'FLICK_TRAINING'
  | 'TRACKING_TRAINING'
  | 'PRECISION_TRAINING'
  | 'REACTION_TRAINING'
  | 'FORTNITE_TRAINING'
  | 'BENCHMARKS'
  | 'WARMUPS';

export interface ScenarioData {
  id: string;
  name: string;
  desc: string;
  type: ScenarioType;
  difficulty: ScenarioDifficulty;
  focus: string;

  icon: string;
  skill: ScenarioSkill;
  recommendedWeapon: 'pistol' | 'smg' | 'sniper';
  recommendedDuration: number;
  targetSpeedPreset: number;
  targetScalePreset: number;
  targetDistancePreset: number;
  tags: string[];
  coachUseCase: string;
  shortName: string;

  /**
   * Premium EFECT metadata
   */
  category?: ScenarioCategory;
  rankedEnabled?: boolean;
  benchmarkWeight?: number;
  playlistEligible?: boolean;
  fortniteRelevant?: boolean;
  aimGoal?: string;
  weaknessTarget?: string;
}

export interface TrainingRoutineStep {
  scenarioId: string;
  duration: number;
  label: string;
  note: string;
}

export interface TrainingRoutine {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  icon: string;
  difficulty: ScenarioDifficulty;
  estimatedMinutes: number;
  category: ScenarioCategory;
  tags: string[];
  steps: TrainingRoutineStep[];
}

export interface RankedBenchmark {
  id: string;
  name: string;
  desc: string;
  icon: string;
  requiredScenarios: string[];
  estimatedMinutes: number;
  ratingMultiplier: number;
}

const withDefaults = <T extends ScenarioData>(scenario: T): ScenarioData => ({
  rankedEnabled: scenario.difficulty === 'ELITE' || scenario.difficulty === 'EXTREME',
  benchmarkWeight:
    scenario.difficulty === 'STANDARD'
      ? 1
      : scenario.difficulty === 'ADVANCED'
        ? 1.25
        : scenario.difficulty === 'ELITE'
          ? 1.5
          : 2,
  playlistEligible: true,
  fortniteRelevant:
    scenario.tags.includes('fortnite') ||
    scenario.tags.includes('pump') ||
    scenario.skill === 'FORTNITE_PUMP' ||
    scenario.type === 'FLICK' ||
    scenario.type === 'TRACKING',
  category:
    scenario.type === 'SPECIAL'
      ? 'FEATURED'
      : scenario.type === 'FLICK'
        ? 'FLICK_TRAINING'
        : scenario.type === 'PRECISION'
          ? 'PRECISION_TRAINING'
          : scenario.type === 'REACTION'
            ? 'REACTION_TRAINING'
            : scenario.type === 'TRACKING'
              ? 'TRACKING_TRAINING'
              : scenario.skill === 'FORTNITE_PUMP'
                ? 'FORTNITE_TRAINING'
                : 'WARMUPS',
  aimGoal: scenario.focus,
  weaknessTarget: scenario.coachUseCase,
  ...scenario,
});

export const SCENARIOS: readonly ScenarioData[] = [
  withDefaults({
    id: 'efect_overdrive',
    name: 'EFECT OVERDRIVE',
    shortName: 'OVERDRIVE',
    desc: 'Maximum speed, zero delay tracking & flicking.',
    type: 'SPECIAL',
    difficulty: 'EXTREME',
    focus: 'FULL MECHANICS',
    icon: '⚡',
    skill: 'FULL_MECHANICS',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 2.6,
    targetScalePreset: 0.85,
    targetDistancePreset: -12,
    tags: ['speed', 'flick', 'tracking', 'pressure', 'ranked'],
    coachUseCase: 'Use this when accuracy is already strong and the player needs pressure training.',
    category: 'FEATURED',
    rankedEnabled: true,
    benchmarkWeight: 2.2,
  }),
  withDefaults({
    id: 'gridshot_standard',
    name: 'WALL GRIDSHOT',
    shortName: 'GRIDSHOT',
    desc: 'Standard 3-target flicking.',
    type: 'FLICK',
    difficulty: 'STANDARD',
    focus: 'TARGET SWITCHING',
    icon: '🎯',
    skill: 'TARGET_SWITCHING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1,
    targetScalePreset: 1,
    targetDistancePreset: -10,
    tags: ['flick', 'basic', 'switching', 'warmup'],
    coachUseCase: 'Use this as the baseline drill for general flick control.',
    rankedEnabled: true,
    benchmarkWeight: 1,
  }),
  withDefaults({
    id: 'gridshot_ultimate',
    name: 'GRIDSHOT ULTIMATE',
    shortName: 'ULTIMATE',
    desc: 'Faster spawns, more targets.',
    type: 'FLICK',
    difficulty: 'ELITE',
    focus: 'SPEED CONTROL',
    icon: '🔥',
    skill: 'TARGET_SWITCHING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1.7,
    targetScalePreset: 0.85,
    targetDistancePreset: -10,
    tags: ['flick', 'speed', 'advanced', 'ranked'],
    coachUseCase: 'Use this when the player is accurate but too slow.',
  }),
  withDefaults({
    id: 'gridshot_precision',
    name: 'GRIDSHOT PRECISION',
    shortName: 'PRECISION',
    desc: 'Tiny targets for micro-flicks.',
    type: 'PRECISION',
    difficulty: 'ADVANCED',
    focus: 'MICRO CORRECTION',
    icon: '✦',
    skill: 'MICRO_CORRECTION',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 0.9,
    targetScalePreset: 0.55,
    targetDistancePreset: -11,
    tags: ['precision', 'micro', 'flick', 'ranked'],
    coachUseCase: 'Use this when the player misses small targets or overflicks.',
    rankedEnabled: true,
  }),
  withDefaults({
    id: 'microflick_standard',
    name: 'MICROFLICK',
    shortName: 'MICRO',
    desc: 'Clustered precision focus.',
    type: 'PRECISION',
    difficulty: 'STANDARD',
    focus: 'SMALL ADJUSTMENTS',
    icon: '·',
    skill: 'MICRO_CORRECTION',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 0.85,
    targetScalePreset: 0.65,
    targetDistancePreset: -10,
    tags: ['micro', 'precision', 'correction', 'warmup'],
    coachUseCase: 'Use this when the player needs cleaner small corrections.',
  }),
  withDefaults({
    id: 'microflick_react',
    name: 'MICROFLICK REACT',
    shortName: 'MICRO REACT',
    desc: 'Tiny targets that vanish quickly.',
    type: 'REACTION',
    difficulty: 'ELITE',
    focus: 'REACTION SPEED',
    icon: '⚠',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.4,
    targetScalePreset: 0.55,
    targetDistancePreset: -10,
    tags: ['reaction', 'micro', 'speed', 'ranked'],
    coachUseCase: 'Use this when the player reacts slowly to small target spawns.',
  }),
  withDefaults({
    id: 'microflick_track',
    name: 'MICROFLICK TRACK',
    shortName: 'MICRO TRACK',
    desc: 'Tiny moving targets.',
    type: 'PRECISION',
    difficulty: 'ADVANCED',
    focus: 'PRECISION TRACKING',
    icon: '◇',
    skill: 'SMOOTH_TRACKING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 1.2,
    targetScalePreset: 0.6,
    targetDistancePreset: -11,
    tags: ['micro', 'tracking', 'precision'],
    coachUseCase: 'Use this when the player loses tracking on small moving targets.',
  }),
  withDefaults({
    id: 'tracking_dynamic',
    name: 'DYNAMIC TRACKING',
    shortName: 'DYNAMIC',
    desc: 'Evasive strafing AI.',
    type: 'TRACKING',
    difficulty: 'ADVANCED',
    focus: 'STRAFE READS',
    icon: '↔',
    skill: 'STRAFE_READING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 1.3,
    targetScalePreset: 1,
    targetDistancePreset: -14,
    tags: ['tracking', 'strafe', 'dynamic', 'ranked'],
    coachUseCase: 'Use this when tracking breaks during direction changes.',
    rankedEnabled: true,
  }),
  withDefaults({
    id: 'tracking_smooth',
    name: 'SMOOTH TRACKING',
    shortName: 'SMOOTH',
    desc: 'Long, predictable strafes.',
    type: 'TRACKING',
    difficulty: 'STANDARD',
    focus: 'SMOOTHNESS',
    icon: '━',
    skill: 'SMOOTH_TRACKING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 0.9,
    targetScalePreset: 1,
    targetDistancePreset: -14,
    tags: ['tracking', 'smooth', 'control', 'warmup'],
    coachUseCase: 'Use this when aim looks shaky or unstable while tracking.',
    rankedEnabled: true,
  }),
  withDefaults({
    id: 'tracking_fast',
    name: 'FAST TRACKING',
    shortName: 'FAST TRACK',
    desc: 'Aggressive, rapid direction changes.',
    type: 'TRACKING',
    difficulty: 'ELITE',
    focus: 'DIRECTION CHANGES',
    icon: '⇄',
    skill: 'STRAFE_READING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 2,
    targetScalePreset: 0.9,
    targetDistancePreset: -14,
    tags: ['tracking', 'fast', 'direction', 'ranked'],
    coachUseCase: 'Use this when the player cannot keep up with fast strafes.',
  }),
  withDefaults({
    id: 'popcorn_standard',
    name: 'POPCORN',
    shortName: 'POPCORN',
    desc: 'Vertical gravity arcs.',
    type: 'TIMING',
    difficulty: 'STANDARD',
    focus: 'VERTICAL TIMING',
    icon: '⌃',
    skill: 'VERTICAL_TIMING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1,
    targetScalePreset: 1,
    targetDistancePreset: -12,
    tags: ['vertical', 'timing', 'gravity'],
    coachUseCase: 'Use this when vertical aim timing is weak.',
  }),
  withDefaults({
    id: 'popcorn_small',
    name: 'POPCORN PRECISION',
    shortName: 'POP PRECISION',
    desc: 'Tiny vertical arcs.',
    type: 'PRECISION',
    difficulty: 'ADVANCED',
    focus: 'VERTICAL MICRO',
    icon: '⌃',
    skill: 'VERTICAL_TIMING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1.1,
    targetScalePreset: 0.55,
    targetDistancePreset: -12,
    tags: ['vertical', 'precision', 'micro'],
    coachUseCase: 'Use this when vertical correction and small target timing are weak.',
  }),
  withDefaults({
    id: 'popcorn_heavy',
    name: 'POPCORN HEAVY',
    shortName: 'HEAVY POP',
    desc: 'Fast fall rate gravity.',
    type: 'TIMING',
    difficulty: 'ELITE',
    focus: 'FAST TIMING',
    icon: '⇣',
    skill: 'VERTICAL_TIMING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.5,
    targetScalePreset: 0.85,
    targetDistancePreset: -12,
    tags: ['vertical', 'fast', 'gravity'],
    coachUseCase: 'Use this when the player reacts late to falling targets.',
  }),
  withDefaults({
    id: 'flick360_standard',
    name: '360 AWARENESS',
    shortName: '360',
    desc: 'Targets spawn all around you.',
    type: 'FLICK',
    difficulty: 'ADVANCED',
    focus: 'SPATIAL AWARENESS',
    icon: '⟳',
    skill: 'SPATIAL_AWARENESS',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1,
    targetScalePreset: 1,
    targetDistancePreset: -12,
    tags: ['360', 'flick', 'awareness'],
    coachUseCase: 'Use this when the player needs better full-turn target acquisition.',
  }),
  withDefaults({
    id: 'flick360_react',
    name: '360 REACT',
    shortName: '360 REACT',
    desc: 'Fast disappearing surround targets.',
    type: 'REACTION',
    difficulty: 'ELITE',
    focus: 'FULL TURN REACT',
    icon: '⟳',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.45,
    targetScalePreset: 0.85,
    targetDistancePreset: -12,
    tags: ['360', 'reaction', 'speed'],
    coachUseCase: 'Use this when the player is slow turning to targets.',
  }),
  withDefaults({
    id: 'flick360_tracking',
    name: '360 TRACKING',
    shortName: '360 TRACK',
    desc: 'Moving targets behind you.',
    type: 'TRACKING',
    difficulty: 'ELITE',
    focus: 'SURROUND TRACKING',
    icon: '⟳',
    skill: 'SPATIAL_AWARENESS',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 1.6,
    targetScalePreset: 0.9,
    targetDistancePreset: -14,
    tags: ['360', 'tracking', 'movement'],
    coachUseCase: 'Use this for full-space tracking and target recovery.',
  }),
  withDefaults({
    id: 'spidershot_standard',
    name: 'SPIDERSHOT',
    shortName: 'SPIDER',
    desc: 'Center-return flicking.',
    type: 'FLICK',
    difficulty: 'STANDARD',
    focus: 'CENTER RESET',
    icon: '✣',
    skill: 'CENTER_RESET',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1,
    targetScalePreset: 1,
    targetDistancePreset: -10,
    tags: ['center', 'reset', 'flick', 'warmup'],
    coachUseCase: 'Use this when crosshair reset discipline is weak.',
  }),
  withDefaults({
    id: 'spidershot_180',
    name: 'SPIDERSHOT 180',
    shortName: 'SPIDER 180',
    desc: 'Wide angle center returns.',
    type: 'FLICK',
    difficulty: 'ADVANCED',
    focus: 'WIDE FLICKS',
    icon: '✣',
    skill: 'CENTER_RESET',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1.2,
    targetScalePreset: 1,
    targetDistancePreset: -11,
    tags: ['wide', 'flick', 'center'],
    coachUseCase: 'Use this when wide flick recovery is inconsistent.',
  }),
  withDefaults({
    id: 'spidershot_rapid',
    name: 'SPIDERSHOT RAPID',
    shortName: 'SPIDER RAPID',
    desc: 'Fast paced center returns.',
    type: 'REACTION',
    difficulty: 'ELITE',
    focus: 'RAPID RESET',
    icon: '✣',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.6,
    targetScalePreset: 0.9,
    targetDistancePreset: -10,
    tags: ['rapid', 'center', 'reaction'],
    coachUseCase: 'Use this when center-return speed is too slow.',
  }),
  withDefaults({
    id: 'motionshot_standard',
    name: 'MOTIONSHOT',
    shortName: 'MOTION',
    desc: 'Targets drift after spawning.',
    type: 'DYNAMIC',
    difficulty: 'STANDARD',
    focus: 'MOVING FLICKS',
    icon: '➤',
    skill: 'MOVEMENT_READING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1,
    targetScalePreset: 1,
    targetDistancePreset: -12,
    tags: ['motion', 'flick', 'moving'],
    coachUseCase: 'Use this when the player flicks well on static targets but fails moving spawns.',
  }),
  withDefaults({
    id: 'motionshot_fast',
    name: 'MOTIONSHOT FAST',
    shortName: 'MOTION FAST',
    desc: 'High speed linear drift.',
    type: 'DYNAMIC',
    difficulty: 'ELITE',
    focus: 'SPEED READS',
    icon: '➤',
    skill: 'MOVEMENT_READING',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.9,
    targetScalePreset: 0.9,
    targetDistancePreset: -12,
    tags: ['motion', 'fast', 'reading'],
    coachUseCase: 'Use this when movement prediction is slow.',
  }),
  withDefaults({
    id: 'motionshot_small',
    name: 'MOTIONSHOT PRECISION',
    shortName: 'MOTION PREC',
    desc: 'Tiny drifting targets.',
    type: 'PRECISION',
    difficulty: 'ELITE',
    focus: 'SMALL MOVING TARGETS',
    icon: '➤',
    skill: 'MICRO_CORRECTION',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.4,
    targetScalePreset: 0.55,
    targetDistancePreset: -12,
    tags: ['motion', 'precision', 'small'],
    coachUseCase: 'Use this when the player cannot micro-correct onto moving targets.',
  }),
  withDefaults({
    id: 'snipershot_standard',
    name: 'SNIPERSHOT',
    shortName: 'SNIPER',
    desc: 'Long distance, high penalty.',
    type: 'PRECISION',
    difficulty: 'ADVANCED',
    focus: 'LONG RANGE',
    icon: '⌖',
    skill: 'LONG_RANGE',
    recommendedWeapon: 'sniper',
    recommendedDuration: 60,
    targetSpeedPreset: 0.8,
    targetScalePreset: 0.8,
    targetDistancePreset: -24,
    tags: ['sniper', 'long', 'precision'],
    coachUseCase: 'Use this for long-range first-shot discipline.',
  }),
  withDefaults({
    id: 'snipershot_moving',
    name: 'SNIPERSHOT MOVING',
    shortName: 'SNIPER MOVE',
    desc: 'Distant moving targets.',
    type: 'PRECISION',
    difficulty: 'ELITE',
    focus: 'LONG RANGE TRACK',
    icon: '⌖',
    skill: 'LONG_RANGE',
    recommendedWeapon: 'sniper',
    recommendedDuration: 60,
    targetSpeedPreset: 1.2,
    targetScalePreset: 0.75,
    targetDistancePreset: -26,
    tags: ['sniper', 'moving', 'long'],
    coachUseCase: 'Use this when long-range moving shots are weak.',
  }),
  withDefaults({
    id: 'snipershot_react',
    name: 'SNIPERSHOT REACT',
    shortName: 'SNIPER REACT',
    desc: 'Distant targets vanish quickly.',
    type: 'REACTION',
    difficulty: 'EXTREME',
    focus: 'LONG RANGE REACT',
    icon: '⌖',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'sniper',
    recommendedDuration: 45,
    targetSpeedPreset: 1.4,
    targetScalePreset: 0.7,
    targetDistancePreset: -28,
    tags: ['sniper', 'reaction', 'long'],
    coachUseCase: 'Use this when long-range reaction speed is weak.',
  }),
  withDefaults({
    id: 'reflex_standard',
    name: 'REFLEX SHOT',
    shortName: 'REFLEX',
    desc: 'Targets disappear instantly.',
    type: 'REACTION',
    difficulty: 'ADVANCED',
    focus: 'FIRST SHOT SPEED',
    icon: '⚡',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.35,
    targetScalePreset: 0.85,
    targetDistancePreset: -10,
    tags: ['reaction', 'reflex', 'speed'],
    coachUseCase: 'Use this when first-shot reaction is slow.',
  }),
  withDefaults({
    id: 'reflex_micro',
    name: 'REFLEX MICRO',
    shortName: 'REFLEX MICRO',
    desc: 'Tiny whack-a-mole targets.',
    type: 'PRECISION',
    difficulty: 'ELITE',
    focus: 'MICRO REFLEX',
    icon: '⚡',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.45,
    targetScalePreset: 0.55,
    targetDistancePreset: -10,
    tags: ['reaction', 'micro', 'precision'],
    coachUseCase: 'Use this when small target reaction is weak.',
  }),
  withDefaults({
    id: 'reflex_cluster',
    name: 'REFLEX CLUSTER',
    shortName: 'CLUSTER',
    desc: 'Tightly grouped reflex training.',
    type: 'REACTION',
    difficulty: 'ADVANCED',
    focus: 'CLUSTER REACTION',
    icon: '⚡',
    skill: 'REACTION_SPEED',
    recommendedWeapon: 'pistol',
    recommendedDuration: 45,
    targetSpeedPreset: 1.25,
    targetScalePreset: 0.85,
    targetDistancePreset: -10,
    tags: ['reaction', 'cluster', 'speed'],
    coachUseCase: 'Use this when grouped target switching is slow.',
  }),
  withDefaults({
    id: 'glider_tracking',
    name: 'GLIDER TRACKING',
    shortName: 'GLIDER',
    desc: 'Smooth diagonal descent tracking.',
    type: 'TRACKING',
    difficulty: 'ADVANCED',
    focus: 'DIAGONAL TRACK',
    icon: '↘',
    skill: 'SMOOTH_TRACKING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 1.15,
    targetScalePreset: 1,
    targetDistancePreset: -16,
    tags: ['tracking', 'diagonal', 'glider'],
    coachUseCase: 'Use this when diagonal tracking is unstable.',
  }),
  withDefaults({
    id: 'bounce_tracking',
    name: 'BOUNCE TRACKING',
    shortName: 'BOUNCE',
    desc: 'Vertical gravity bounce tracking.',
    type: 'TRACKING',
    difficulty: 'ELITE',
    focus: 'BOUNCE CONTROL',
    icon: '↕',
    skill: 'VERTICAL_TIMING',
    recommendedWeapon: 'smg',
    recommendedDuration: 60,
    targetSpeedPreset: 1.45,
    targetScalePreset: 0.9,
    targetDistancePreset: -14,
    tags: ['tracking', 'bounce', 'vertical'],
    coachUseCase: 'Use this when tracking breaks during vertical movement.',
  }),
  withDefaults({
    id: 'pump_flick',
    name: 'PUMP FLICK',
    shortName: 'PUMP',
    desc: 'Close-range wide wall flicks.',
    type: 'FLICK',
    difficulty: 'ADVANCED',
    focus: 'FORTNITE PUMP AIM',
    icon: '▣',
    skill: 'FORTNITE_PUMP',
    recommendedWeapon: 'pistol',
    recommendedDuration: 60,
    targetSpeedPreset: 1.15,
    targetScalePreset: 1,
    targetDistancePreset: -8,
    tags: ['fortnite', 'pump', 'wide-flick', 'ranked'],
    coachUseCase: 'Use this for Fortnite-style close-range flick discipline.',
    category: 'FORTNITE_TRAINING',
    rankedEnabled: true,
  }),
] as const;

export const SCENARIO_FILTERS = [
  'ALL',
  'SPECIAL',
  'FLICK',
  'PRECISION',
  'REACTION',
  'TRACKING',
  'TIMING',
  'DYNAMIC',
] as const;

export type ScenarioFilter = (typeof SCENARIO_FILTERS)[number];

export const TRAINING_CATEGORIES: {
  id: ScenarioCategory;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'FEATURED',
    label: 'FEATURED',
    desc: 'EFECT signature modules and high-pressure drills.',
    icon: '⚡',
  },
  {
    id: 'FLICK_TRAINING',
    label: 'FLICK TRAINING',
    desc: 'Fast target acquisition, wide flicks, and reset discipline.',
    icon: '🎯',
  },
  {
    id: 'TRACKING_TRAINING',
    label: 'TRACKING TRAINING',
    desc: 'Smooth aim, strafe reads, bounce control, and SMG tracking.',
    icon: '↔',
  },
  {
    id: 'PRECISION_TRAINING',
    label: 'PRECISION TRAINING',
    desc: 'Micro-corrections, small targets, long-range control.',
    icon: '✦',
  },
  {
    id: 'REACTION_TRAINING',
    label: 'REACTION TRAINING',
    desc: 'First-shot speed and short exposure targets.',
    icon: '⚠',
  },
  {
    id: 'FORTNITE_TRAINING',
    label: 'FORTNITE TRAINING',
    desc: 'Pump flicks, close-range control, Fortnite-style target discipline.',
    icon: '▣',
  },
  {
    id: 'BENCHMARKS',
    label: 'RANKED BENCHMARKS',
    desc: 'Official EFECT placement and ranked test modules.',
    icon: '🏆',
  },
  {
    id: 'WARMUPS',
    label: 'WARMUPS',
    desc: 'Quick prep routines before ranked, creative, or scrims.',
    icon: '◇',
  },
];

export const TRAINING_ROUTINES: readonly TrainingRoutine[] = [
  {
    id: 'efect_5_min_warmup',
    name: 'EFECT 5 MIN WARMUP',
    shortName: '5 MIN WARMUP',
    desc: 'Quick balanced warmup before ranked, creative, or scrims.',
    icon: '◇',
    difficulty: 'STANDARD',
    estimatedMinutes: 5,
    category: 'WARMUPS',
    tags: ['warmup', 'starter', 'balanced'],
    steps: [
      {
        scenarioId: 'gridshot_standard',
        duration: 60,
        label: 'BASELINE FLICK',
        note: 'Start with controlled target switching.',
      },
      {
        scenarioId: 'microflick_standard',
        duration: 45,
        label: 'MICRO CONTROL',
        note: 'Tighten small corrections.',
      },
      {
        scenarioId: 'tracking_smooth',
        duration: 60,
        label: 'SMOOTH TRACK',
        note: 'Stabilize tracking before speed.',
      },
      {
        scenarioId: 'spidershot_standard',
        duration: 60,
        label: 'CENTER RESET',
        note: 'Rebuild crosshair reset discipline.',
      },
      {
        scenarioId: 'pump_flick',
        duration: 60,
        label: 'FORTNITE FINISHER',
        note: 'End with close-range pump flicks.',
      },
    ],
  },
  {
    id: 'fortnite_mechanics_boost',
    name: 'FORTNITE MECHANICS BOOST',
    shortName: 'FN BOOST',
    desc: 'Fortnite-focused flick, pump, target switch, and tracking routine.',
    icon: '▣',
    difficulty: 'ADVANCED',
    estimatedMinutes: 8,
    category: 'FORTNITE_TRAINING',
    tags: ['fortnite', 'pump', 'flick', 'tracking'],
    steps: [
      {
        scenarioId: 'pump_flick',
        duration: 60,
        label: 'PUMP FLICK',
        note: 'Train close-range shot discipline.',
      },
      {
        scenarioId: 'spidershot_180',
        duration: 60,
        label: 'WIDE RESET',
        note: 'Practice wide correction and center return.',
      },
      {
        scenarioId: 'tracking_dynamic',
        duration: 60,
        label: 'STRAFE READ',
        note: 'Track moving players during pressure.',
      },
      {
        scenarioId: 'bounce_tracking',
        duration: 60,
        label: 'VERTICAL CONTROL',
        note: 'Control jump and bounce movement.',
      },
      {
        scenarioId: 'gridshot_ultimate',
        duration: 60,
        label: 'SPEED SWITCH',
        note: 'Force fast target switching.',
      },
      {
        scenarioId: 'efect_overdrive',
        duration: 60,
        label: 'OVERDRIVE',
        note: 'Finish under high pressure.',
      },
    ],
  },
  {
    id: 'headshot_control_routine',
    name: 'HEADSHOT CONTROL ROUTINE',
    shortName: 'HS CONTROL',
    desc: 'Build headshot discipline, micro-corrections, and cleaner first shots.',
    icon: '✦',
    difficulty: 'ADVANCED',
    estimatedMinutes: 7,
    category: 'PRECISION_TRAINING',
    tags: ['headshot', 'precision', 'micro'],
    steps: [
      {
        scenarioId: 'gridshot_precision',
        duration: 60,
        label: 'PRECISION BASE',
        note: 'Prioritize clean confirmation over speed.',
      },
      {
        scenarioId: 'microflick_standard',
        duration: 60,
        label: 'MICRO ALIGN',
        note: 'Tighten small target correction.',
      },
      {
        scenarioId: 'reflex_micro',
        duration: 45,
        label: 'MICRO REACT',
        note: 'React to small target windows.',
      },
      {
        scenarioId: 'snipershot_standard',
        duration: 60,
        label: 'LONG RANGE',
        note: 'Force first-shot discipline.',
      },
      {
        scenarioId: 'pump_flick',
        duration: 60,
        label: 'PUMP CONTROL',
        note: 'Apply precision to close-range targets.',
      },
    ],
  },
  {
    id: 'smg_tracking_routine',
    name: 'SMG TRACKING ROUTINE',
    shortName: 'SMG TRACK',
    desc: 'Full tracking stack for smooth, dynamic, fast, and vertical movement.',
    icon: '↔',
    difficulty: 'ADVANCED',
    estimatedMinutes: 7,
    category: 'TRACKING_TRAINING',
    tags: ['tracking', 'smg', 'smooth', 'strafe'],
    steps: [
      {
        scenarioId: 'tracking_smooth',
        duration: 60,
        label: 'SMOOTH BASE',
        note: 'Stabilize tracking before speed.',
      },
      {
        scenarioId: 'tracking_dynamic',
        duration: 60,
        label: 'STRAFE READ',
        note: 'Read direction changes.',
      },
      {
        scenarioId: 'tracking_fast',
        duration: 60,
        label: 'FAST STRAFE',
        note: 'Increase target pressure.',
      },
      {
        scenarioId: 'glider_tracking',
        duration: 60,
        label: 'DIAGONAL TRACK',
        note: 'Train diagonal movement control.',
      },
      {
        scenarioId: 'bounce_tracking',
        duration: 60,
        label: 'BOUNCE CONTROL',
        note: 'Keep tracking through vertical changes.',
      },
    ],
  },
  {
    id: 'ranked_benchmark_prep',
    name: 'RANKED BENCHMARK PREP',
    shortName: 'BENCH PREP',
    desc: 'Prepares every major skill before an official EFECT ranked test.',
    icon: '🏆',
    difficulty: 'ELITE',
    estimatedMinutes: 10,
    category: 'BENCHMARKS',
    tags: ['ranked', 'benchmark', 'placement'],
    steps: [
      {
        scenarioId: 'gridshot_ultimate',
        duration: 60,
        label: 'FLICK SPEED',
        note: 'Measure raw switching speed.',
      },
      {
        scenarioId: 'gridshot_precision',
        duration: 60,
        label: 'PRECISION',
        note: 'Measure accuracy discipline.',
      },
      {
        scenarioId: 'tracking_dynamic',
        duration: 60,
        label: 'TRACKING',
        note: 'Measure strafe tracking.',
      },
      {
        scenarioId: 'reflex_standard',
        duration: 45,
        label: 'REACTION',
        note: 'Measure first-shot speed.',
      },
      {
        scenarioId: 'pump_flick',
        duration: 60,
        label: 'FORTNITE',
        note: 'Measure close-range flick control.',
      },
      {
        scenarioId: 'efect_overdrive',
        duration: 60,
        label: 'OVERDRIVE',
        note: 'Measure pressure response.',
      },
    ],
  },
];

export const RANKED_BENCHMARKS: readonly RankedBenchmark[] = [
  {
    id: 'efect_placement_test',
    name: 'EFECT PLACEMENT TEST',
    desc: 'Official placement benchmark across flick, precision, tracking, reaction, and Fortnite control.',
    icon: '🏆',
    requiredScenarios: [
      'gridshot_standard',
      'gridshot_precision',
      'tracking_smooth',
      'tracking_dynamic',
      'reflex_standard',
      'pump_flick',
    ],
    estimatedMinutes: 8,
    ratingMultiplier: 1,
  },
  {
    id: 'efect_ranked_overdrive',
    name: 'EFECT RANKED OVERDRIVE',
    desc: 'Elite benchmark for high-pressure aim mechanics.',
    icon: '⚡',
    requiredScenarios: [
      'gridshot_ultimate',
      'tracking_fast',
      'reflex_micro',
      'snipershot_react',
      'pump_flick',
      'efect_overdrive',
    ],
    estimatedMinutes: 9,
    ratingMultiplier: 1.35,
  },
  {
    id: 'fortnite_ranked_control',
    name: 'FORTNITE RANKED CONTROL',
    desc: 'Fortnite-specific benchmark for pump flicks, wide resets, tracking, vertical control, and close-range mechanics.',
    icon: '▣',
    requiredScenarios: [
      'pump_flick',
      'spidershot_180',
      'tracking_dynamic',
      'bounce_tracking',
      'gridshot_precision',
    ],
    estimatedMinutes: 7,
    ratingMultiplier: 1.15,
  },
];

export const getScenarioById = (id: string): ScenarioData => {
  return SCENARIOS.find((scenario) => scenario.id === id) || SCENARIOS[0];
};

export const formatScenarioName = (id: string): string => {
  return getScenarioById(id)?.name || id.replace(/_/g, ' ').toUpperCase();
};

export const difficultyColor = (difficulty: ScenarioDifficulty): string => {
  if (difficulty === 'STANDARD') return '#8a8a8a';
  if (difficulty === 'ADVANCED') return '#00ffff';
  if (difficulty === 'ELITE') return '#b966ff';
  return '#ff0055';
};

export const typeColor = (type: ScenarioType): string => {
  if (type === 'SPECIAL') return '#39ff14';
  if (type === 'FLICK') return '#00ffff';
  if (type === 'PRECISION') return '#b966ff';
  if (type === 'REACTION') return '#ff0055';
  if (type === 'TRACKING') return '#00ffaa';
  if (type === 'TIMING') return '#ffaa00';
  return '#ffffff';
};

export const categoryColor = (category: ScenarioCategory): string => {
  if (category === 'FEATURED') return '#39ff14';
  if (category === 'FLICK_TRAINING') return '#00ffff';
  if (category === 'TRACKING_TRAINING') return '#00ffaa';
  if (category === 'PRECISION_TRAINING') return '#b966ff';
  if (category === 'REACTION_TRAINING') return '#ff0055';
  if (category === 'FORTNITE_TRAINING') return '#ffaa00';
  if (category === 'BENCHMARKS') return '#ffd700';
  return '#8a8a8a';
};

export const getRecommendedScenarioForWeakness = (weakness: string): ScenarioData => {
  const key = weakness.toLowerCase();

  if (key.includes('headshot') || key.includes('crosshair height')) {
    return getScenarioById('gridshot_precision');
  }

  if (key.includes('accuracy') || key.includes('miss') || key.includes('overflick')) {
    return getScenarioById('gridshot_precision');
  }

  if (key.includes('reaction') || key.includes('slow')) {
    return getScenarioById('reflex_standard');
  }

  if (key.includes('tracking') || key.includes('strafe')) {
    return getScenarioById('tracking_dynamic');
  }

  if (key.includes('vertical') || key.includes('bounce')) {
    return getScenarioById('bounce_tracking');
  }

  if (key.includes('360') || key.includes('awareness')) {
    return getScenarioById('flick360_standard');
  }

  if (key.includes('sniper') || key.includes('long')) {
    return getScenarioById('snipershot_standard');
  }

  if (key.includes('fortnite') || key.includes('pump')) {
    return getScenarioById('pump_flick');
  }

  return getScenarioById('gridshot_standard');
};

export const getScenarioPreset = (id: string) => {
  const scenario = getScenarioById(id);

  return {
    weaponClass: scenario.recommendedWeapon,
    drillDuration: scenario.recommendedDuration,
    targetSpeed: scenario.targetSpeedPreset,
    modelScale: scenario.targetScalePreset,
    targetDistance: scenario.targetDistancePreset,
  };
};

export const getScenarioLaunchSettings = (id: string) => {
  const scenario = getScenarioById(id);

  return {
    scenario: scenario.id,
    weaponClass: scenario.recommendedWeapon,
    drillDuration: scenario.recommendedDuration,
    targetSpeed: scenario.targetSpeedPreset,
    modelScale: scenario.targetScalePreset,
    targetDistance: scenario.targetDistancePreset,
  };
};

export const searchScenarios = (
  search: string,
  filter: ScenarioFilter = 'ALL'
): ScenarioData[] => {
  const clean = search.trim().toLowerCase();

  return SCENARIOS.filter((scenario) => {
    const matchesFilter = filter === 'ALL' || scenario.type === filter;

    const matchesSearch =
      clean.length === 0 ||
      scenario.name.toLowerCase().includes(clean) ||
      scenario.shortName.toLowerCase().includes(clean) ||
      scenario.desc.toLowerCase().includes(clean) ||
      scenario.type.toLowerCase().includes(clean) ||
      scenario.focus.toLowerCase().includes(clean) ||
      scenario.tags.some((tag) => tag.toLowerCase().includes(clean));

    return matchesFilter && matchesSearch;
  });
};

export const searchScenariosByCategory = (
  search: string,
  category?: ScenarioCategory
): ScenarioData[] => {
  const clean = search.trim().toLowerCase();

  return SCENARIOS.filter((scenario) => {
    const matchesCategory = !category || scenario.category === category;

    const matchesSearch =
      clean.length === 0 ||
      scenario.name.toLowerCase().includes(clean) ||
      scenario.shortName.toLowerCase().includes(clean) ||
      scenario.desc.toLowerCase().includes(clean) ||
      scenario.type.toLowerCase().includes(clean) ||
      scenario.focus.toLowerCase().includes(clean) ||
      scenario.tags.some((tag) => tag.toLowerCase().includes(clean));

    return matchesCategory && matchesSearch;
  });
};

export const getScenariosByType = (type: ScenarioType): ScenarioData[] => {
  return SCENARIOS.filter((scenario) => scenario.type === type);
};

export const getScenariosByCategory = (category: ScenarioCategory): ScenarioData[] => {
  return SCENARIOS.filter((scenario) => scenario.category === category);
};

export const getEliteScenarios = (): ScenarioData[] => {
  return SCENARIOS.filter(
    (scenario) => scenario.difficulty === 'ELITE' || scenario.difficulty === 'EXTREME'
  );
};

export const getStarterScenarios = (): ScenarioData[] => {
  return SCENARIOS.filter(
    (scenario) => scenario.difficulty === 'STANDARD' || scenario.id === 'gridshot_precision'
  );
};

export const getRankedScenarios = (): ScenarioData[] => {
  return SCENARIOS.filter((scenario) => scenario.rankedEnabled);
};

export const getFortniteScenarios = (): ScenarioData[] => {
  return SCENARIOS.filter((scenario) => scenario.fortniteRelevant);
};

export const getRoutineById = (id: string): TrainingRoutine | undefined => {
  return TRAINING_ROUTINES.find((routine) => routine.id === id);
};

export const getBenchmarkById = (id: string): RankedBenchmark | undefined => {
  return RANKED_BENCHMARKS.find((benchmark) => benchmark.id === id);
};

export const getScenarioCountByType = () => {
  return SCENARIO_FILTERS.reduce((acc, filter) => {
    if (filter === 'ALL') {
      acc[filter] = SCENARIOS.length;
    } else {
      acc[filter] = SCENARIOS.filter((scenario) => scenario.type === filter).length;
    }

    return acc;
  }, {} as Record<ScenarioFilter, number>);
};

export const getScenarioCountByCategory = () => {
  return TRAINING_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = SCENARIOS.filter((scenario) => scenario.category === category.id).length;
    return acc;
  }, {} as Record<ScenarioCategory, number>);
};