import {
  getRecommendedScenarioForWeakness,
  getScenarioById,
} from './scenarioData';

export interface CoachReport {
  title: string;
  summary: string;
  nextDrill: string;
  severity: 'low' | 'medium' | 'high' | 'elite';
}

export interface CoachStats {
  scenario?: string;
  weaponClass?: string;
  score?: number;
  shots?: number;
  hits?: number;
  misses?: number;
  accuracy?: number;
  maxCombo?: number;
  averageHitDelay?: number;
  hitsPerMinute?: number;
  scorePerMinute?: number;
  duration?: number;
  coachNote?: string;
}

export interface WeaknessReport {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  nextScenarioId: string;
}

const safeNumber = (value: number | undefined, fallback = 0) => {
  if (typeof value !== 'number') return fallback;
  if (Number.isNaN(value)) return fallback;
  return value;
};

const getTrend = (stats: CoachStats, history: CoachStats[]) => {
  const previous = history[1];

  if (!previous) {
    return {
      accuracyDelta: 0,
      scoreDelta: 0,
      hpmDelta: 0,
      hasPrevious: false,
    };
  }

  return {
    accuracyDelta: safeNumber(stats.accuracy) - safeNumber(previous.accuracy),
    scoreDelta: safeNumber(stats.score) - safeNumber(previous.score),
    hpmDelta: safeNumber(stats.hitsPerMinute) - safeNumber(previous.hitsPerMinute),
    hasPrevious: true,
  };
};

export const detectWeaknesses = (stats: CoachStats): WeaknessReport[] => {
  const accuracy = safeNumber(stats.accuracy);
  const misses = safeNumber(stats.misses);
  const maxCombo = safeNumber(stats.maxCombo);
  const hits = safeNumber(stats.hits);
  const hpm = safeNumber(stats.hitsPerMinute);
  const averageHitDelay = safeNumber(stats.averageHitDelay);
  const shots = safeNumber(stats.shots);

  const weaknesses: WeaknessReport[] = [];

  if (shots <= 0) {
    weaknesses.push({
      id: 'no_shots',
      label: 'NO SHOT DATA',
      severity: 'high',
      reason: 'No shot events were recorded. The session ended without enough data.',
      nextScenarioId: 'gridshot_standard',
    });

    return weaknesses;
  }

  if (accuracy < 35) {
    weaknesses.push({
      id: 'low_accuracy',
      label: 'PRECISION FAILURE',
      severity: 'high',
      reason: `Accuracy was only ${accuracy}%. You are likely firing before confirming the crosshair.`,
      nextScenarioId: 'gridshot_precision',
    });
  } else if (accuracy < 55) {
    weaknesses.push({
      id: 'unstable_accuracy',
      label: 'UNSTABLE ACCURACY',
      severity: 'medium',
      reason: `Accuracy landed at ${accuracy}%. Your flicks need more controlled confirmation.`,
      nextScenarioId: 'microflick_standard',
    });
  }

  if (misses > 25) {
    weaknesses.push({
      id: 'shot_waste',
      label: 'SHOT WASTE',
      severity: 'high',
      reason: `${misses} missed shots detected. This usually comes from panic-clicking or overflicking.`,
      nextScenarioId: 'microflick_standard',
    });
  } else if (misses > 14) {
    weaknesses.push({
      id: 'miss_volume',
      label: 'MISS VOLUME',
      severity: 'medium',
      reason: `${misses} missed shots detected. Reduce unnecessary trigger pulls.`,
      nextScenarioId: 'gridshot_precision',
    });
  }

  if (maxCombo < 6 && hits > 12) {
    weaknesses.push({
      id: 'low_combo',
      label: 'CONSISTENCY BREAKPOINT',
      severity: 'medium',
      reason: `Max combo was ${maxCombo}. You can hit targets, but rhythm breaks too early.`,
      nextScenarioId: 'spidershot_standard',
    });
  }

  if (hpm > 0 && hpm < 18) {
    weaknesses.push({
      id: 'low_speed',
      label: 'LOW ENGAGEMENT SPEED',
      severity: 'medium',
      reason: `Hits per minute was ${hpm}. Target acquisition is too slow after spawn.`,
      nextScenarioId: 'gridshot_ultimate',
    });
  }

  if (averageHitDelay > 0 && averageHitDelay > 1.2) {
    weaknesses.push({
      id: 'slow_reaction',
      label: 'SLOW REACTION WINDOW',
      severity: 'medium',
      reason: `Average hit delay was ${averageHitDelay}s. You need faster first-shot response.`,
      nextScenarioId: 'reflex_standard',
    });
  }

  if ((stats.scenario || '').includes('tracking') && accuracy < 70) {
    weaknesses.push({
      id: 'tracking_break',
      label: 'TRACKING BREAKPOINT',
      severity: 'medium',
      reason: 'Tracking accuracy dropped during movement. You are losing the target during direction changes.',
      nextScenarioId: 'tracking_dynamic',
    });
  }

  if ((stats.scenario || '').includes('360') && accuracy < 70) {
    weaknesses.push({
      id: 'awareness_break',
      label: 'SPATIAL AWARENESS BREAK',
      severity: 'medium',
      reason: '360 scenario accuracy was low. Target acquisition around your camera needs work.',
      nextScenarioId: 'flick360_standard',
    });
  }

  if ((stats.scenario || '').includes('sniper') && accuracy < 75) {
    weaknesses.push({
      id: 'sniper_discipline',
      label: 'LONG RANGE DISCIPLINE',
      severity: 'medium',
      reason: 'Sniper accuracy is below the required precision threshold.',
      nextScenarioId: 'snipershot_standard',
    });
  }

  return weaknesses;
};

const pickMainWeakness = (weaknesses: WeaknessReport[]) => {
  const high = weaknesses.find((weakness) => weakness.severity === 'high');
  if (high) return high;

  const medium = weaknesses.find((weakness) => weakness.severity === 'medium');
  if (medium) return medium;

  return weaknesses[0] || null;
};

export const generateCoachReport = (
  stats: CoachStats | null,
  history: CoachStats[] = []
): CoachReport => {
  if (!stats) {
    return {
      title: 'NO SESSION DATA',
      summary: 'Run a drill to activate the EFECT coaching layer.',
      nextDrill: 'WALL GRIDSHOT',
      severity: 'low',
    };
  }

  const accuracy = safeNumber(stats.accuracy);
  const hpm = safeNumber(stats.hitsPerMinute);
  const misses = safeNumber(stats.misses);
  const maxCombo = safeNumber(stats.maxCombo);
  const hits = safeNumber(stats.hits);
  const score = safeNumber(stats.score);

  const trend = getTrend(stats, history);
  const weaknesses = detectWeaknesses(stats);
  const mainWeakness = pickMainWeakness(weaknesses);

  if (mainWeakness) {
    const recommended = getScenarioById(mainWeakness.nextScenarioId);

    return {
      title: mainWeakness.label,
      summary: `${mainWeakness.reason} Recommended correction module: ${recommended.name}.`,
      nextDrill: recommended.name,
      severity: mainWeakness.severity,
    };
  }

  if (accuracy >= 88 && hpm >= 32 && maxCombo >= 20) {
    const recommended = getScenarioById('efect_overdrive');

    return {
      title: 'ELITE MECHANICS ONLINE',
      summary: `Strong control detected. Accuracy ${accuracy}%, HPM ${hpm}, max combo ${maxCombo}. Increase pressure and push speed limits.`,
      nextDrill: recommended.name,
      severity: 'elite',
    };
  }

  if (accuracy >= 78 && hpm >= 26) {
    const recommended = getScenarioById('tracking_fast');

    return {
      title: 'HIGH PERFORMANCE WINDOW',
      summary: `You are stable at ${accuracy}% accuracy with ${hpm} HPM. Move into faster target movement to force cleaner corrections.`,
      nextDrill: recommended.name,
      severity: 'elite',
    };
  }

  if (trend.hasPrevious && trend.accuracyDelta >= 3 && trend.scoreDelta > 0) {
    const recommended = getScenarioById(stats.scenario || 'gridshot_ultimate');

    return {
      title: 'IMPROVEMENT DETECTED',
      summary: `Accuracy improved by ${trend.accuracyDelta.toFixed(1)}% and score increased by ${trend.scoreDelta.toLocaleString()}. Keep the same drill and raise speed slightly.`,
      nextDrill: recommended.name,
      severity: 'low',
    };
  }

  if (trend.hasPrevious && trend.accuracyDelta <= -5) {
    const recommended = getRecommendedScenarioForWeakness('accuracy');

    return {
      title: 'REGRESSION DETECTED',
      summary: `Accuracy dropped by ${Math.abs(trend.accuracyDelta).toFixed(1)}%. Lower speed and rebuild clean confirmation before pushing pace.`,
      nextDrill: recommended.name,
      severity: 'medium',
    };
  }

  if (score > 0 && misses <= 10 && accuracy >= 70) {
    const recommended = getScenarioById('gridshot_ultimate');

    return {
      title: 'BALANCED SESSION',
      summary:
        stats.coachNote ||
        `Solid baseline. Accuracy ${accuracy}%, HPM ${hpm}, max combo ${maxCombo}. Push speed while protecting clean shot discipline.`,
      nextDrill: recommended.name,
      severity: 'low',
    };
  }

  if (hits <= 5) {
    const recommended = getScenarioById('gridshot_standard');

    return {
      title: 'LOW SAMPLE SIZE',
      summary: 'Not enough hit data to generate a precise diagnosis. Run a full-length baseline drill.',
      nextDrill: recommended.name,
      severity: 'low',
    };
  }

  const fallback = getScenarioById('dynamic_tracking');

  return {
    title: 'BALANCED SESSION',
    summary:
      stats.coachNote ||
      `Accuracy ${accuracy}%, HPM ${hpm}, misses ${misses}. Continue building speed while keeping first-shot control clean.`,
    nextDrill: fallback.name,
    severity: 'low',
  };
};

export const generateDetailedDebrief = (
  accuracy: number,
  hits: number,
  headshotRatio: number,
  maxHps: number,
  misses: number
): string[] => {
  const feedback: string[] = [];

  if (maxHps > 4.5) {
    feedback.push(
      `[KINETIC_SPEED]: Elite pacing detected. Peak HPS of ${maxHps.toFixed(
        1
      )} means your mechanics are ready for harder pressure modules.`
    );
  } else if (maxHps > 2.5) {
    feedback.push(
      '[KINETIC_SPEED]: Solid operational speed. Reduce the delay between target acquisition and trigger pull.'
    );
  } else {
    feedback.push(
      '[KINETIC_SPEED]: Low pacing detected. Focus on rhythm, target spawn prediction, and faster confirmation.'
    );
  }

  if (accuracy > 95) {
    feedback.push(
      '[PRECISION_DATA]: Near-perfect accuracy. Increase target speed, lower target size, or move into a harder scenario.'
    );
  } else if (accuracy > 85) {
    feedback.push(
      '[PRECISION_DATA]: Strong tracking stability. Clean up small micro-corrections to push into higher performance tiers.'
    );
  } else if (misses > 20) {
    feedback.push(
      `[PRECISION_DATA]: ${misses} dropped shots detected. You are likely overflicking or firing before the crosshair stabilizes.`
    );
  } else if (accuracy < 55) {
    feedback.push(
      '[PRECISION_DATA]: Accuracy needs tightening. Slow down the first shot and verify sensitivity/FOV match your main game.'
    );
  } else {
    feedback.push(
      '[PRECISION_DATA]: Precision is stable enough to push speed. Increase target speed slightly next run.'
    );
  }

  if (headshotRatio > 60) {
    feedback.push(
      '[TACTICAL_OUTPUT]: High critical-hit output. Your crosshair height is strong and the 2.5x multiplier is being used well.'
    );
  } else if (headshotRatio < 20 && hits > 10) {
    feedback.push(
      '[TACTICAL_OUTPUT]: Body-shot bias detected. Raise crosshair placement toward upper chest, neck, and head hitbox.'
    );
  } else {
    feedback.push(
      '[TACTICAL_OUTPUT]: Center-mass consistency is stable. Add small vertical micro-adjustments before firing.'
    );
  }

  if (hits > 20 && misses < 8 && accuracy > 75) {
    feedback.push(
      '[CONSISTENCY_CORE]: Stable conversion detected. Move into a harder module or reduce target scale.'
    );
  } else if (misses > hits && hits > 0) {
    feedback.push(
      '[CONSISTENCY_CORE]: Miss volume exceeded confirmed hits. Prioritize accuracy over raw shot speed.'
    );
  } else {
    feedback.push(
      '[CONSISTENCY_CORE]: Baseline consistency is readable. Repeat the drill and aim for a longer combo chain.'
    );
  }

  return feedback;
};

export const getSeverityColor = (severity: CoachReport['severity']) => {
  if (severity === 'elite') return '#39ff14';
  if (severity === 'high') return '#ff0055';
  if (severity === 'medium') return '#ffaa00';
  return '#00ffff';
};

export const getSeverityLabel = (severity: CoachReport['severity']) => {
  if (severity === 'elite') return 'ELITE';
  if (severity === 'high') return 'CRITICAL';
  if (severity === 'medium') return 'WARNING';
  return 'STABLE';
};