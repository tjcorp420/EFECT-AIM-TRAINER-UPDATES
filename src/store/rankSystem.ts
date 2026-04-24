/**
 * ============================================================================
 * EFECT AIM TRAINER - RANK SYSTEM
 * VERSION: 0.5.0 "ELITE_RATING_CORE"
 * ============================================================================
 *
 * SAFE DROP-IN:
 * - Keeps existing exports.
 * - Adds rating/progress helpers.
 * - Adds rank progress calculation for SessionReview.
 * - Adds leaderboard badge helpers.
 * - Adds performance class helpers.
 * ============================================================================
 */

export interface RankData {
  rank: string;
  title: string;
  color: string;
  icon: string;
  glow: string;
  minRating: number;
}

export interface RankProgress {
  currentRank: RankData;
  nextRank: RankData | null;
  rating: number;
  progressPct: number;
  ratingIntoRank: number;
  ratingNeededForNext: number;
  isMaxRank: boolean;
}

export interface LeaderboardBadge {
  label: string;
  icon: string;
  color: string;
}

export type ScoreClass = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export const RANKS: RankData[] = [
  {
    rank: 'GM',
    title: 'GRANDMASTER',
    color: '#ff0055',
    icon: '💎',
    glow: '0 0 35px #ff0055',
    minRating: 130000,
  },
  {
    rank: 'M',
    title: 'MASTER',
    color: '#b966ff',
    icon: '🔮',
    glow: '0 0 25px #b966ff',
    minRating: 95000,
  },
  {
    rank: 'D',
    title: 'DIAMOND',
    color: '#00ffff',
    icon: '💠',
    glow: '0 0 20px #00ffff',
    minRating: 75000,
  },
  {
    rank: 'P',
    title: 'PLATINUM',
    color: '#00ffaa',
    icon: '❇️',
    glow: '0 0 15px #00ffaa',
    minRating: 55000,
  },
  {
    rank: 'G',
    title: 'GOLD',
    color: '#ffaa00',
    icon: '🏆',
    glow: '0 0 15px #ffaa00',
    minRating: 35000,
  },
  {
    rank: 'S',
    title: 'SILVER',
    color: '#aaaaaa',
    icon: '🥈',
    glow: 'none',
    minRating: 15000,
  },
  {
    rank: 'B',
    title: 'BRONZE',
    color: '#cd7f32',
    icon: '🥉',
    glow: 'none',
    minRating: 0,
  },
];

export const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const calculateRating = (
  score: number,
  accuracy: number,
  maxCombo = 0,
  hitsPerMinute = 0
): number => {
  const safeScore = Math.max(0, score);
  const safeAccuracy = clamp(accuracy, 0, 100);

  const accuracyMultiplier = safeAccuracy / 100;

  const comboBonus = Math.min(maxCombo * 65, 8500);
  const paceBonus = Math.min(hitsPerMinute * 120, 9000);

  const rating = safeScore * accuracyMultiplier + comboBonus + paceBonus;

  return Math.round(rating);
};

export const calculateEliteRank = (
  score: number,
  accuracy: number,
  maxCombo = 0,
  hitsPerMinute = 0
): RankData => {
  const rating = calculateRating(score, accuracy, maxCombo, hitsPerMinute);

  return RANKS.find((rank) => rating >= rank.minRating) || RANKS[RANKS.length - 1];
};

export const getRankProgress = (
  score: number,
  accuracy: number,
  maxCombo = 0,
  hitsPerMinute = 0
): RankProgress => {
  const rating = calculateRating(score, accuracy, maxCombo, hitsPerMinute);
  const currentRank = calculateEliteRank(score, accuracy, maxCombo, hitsPerMinute);

  const currentIndex = RANKS.findIndex((rank) => rank.rank === currentRank.rank);
  const nextRank = currentIndex > 0 ? RANKS[currentIndex - 1] : null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      rating,
      progressPct: 100,
      ratingIntoRank: rating - currentRank.minRating,
      ratingNeededForNext: 0,
      isMaxRank: true,
    };
  }

  const rankRange = nextRank.minRating - currentRank.minRating;
  const ratingIntoRank = rating - currentRank.minRating;
  const ratingNeededForNext = Math.max(0, nextRank.minRating - rating);

  const progressPct = clamp((ratingIntoRank / rankRange) * 100, 0, 100);

  return {
    currentRank,
    nextRank,
    rating,
    progressPct: Math.round(progressPct),
    ratingIntoRank,
    ratingNeededForNext,
    isMaxRank: false,
  };
};

export const getScoreClass = (score: number): ScoreClass => {
  if (score >= 100000) return 'S+';
  if (score >= 75000) return 'S';
  if (score >= 50000) return 'A';
  if (score >= 25000) return 'B';
  if (score >= 10000) return 'C';
  return 'D';
};

export const getScoreClassColor = (scoreClass: ScoreClass): string => {
  if (scoreClass === 'S+') return '#ff0055';
  if (scoreClass === 'S') return '#b966ff';
  if (scoreClass === 'A') return '#00ffff';
  if (scoreClass === 'B') return '#00ffaa';
  if (scoreClass === 'C') return '#ffaa00';
  return '#777777';
};

export const getLeaderboardBadge = (index: number): LeaderboardBadge => {
  if (index === 0) {
    return {
      label: 'CHAMPION',
      icon: '👑',
      color: '#ffd700',
    };
  }

  if (index === 1) {
    return {
      label: 'ELITE',
      icon: '🥈',
      color: '#c0c0c0',
    };
  }

  if (index === 2) {
    return {
      label: 'PRO',
      icon: '🥉',
      color: '#cd7f32',
    };
  }

  if (index < 10) {
    return {
      label: 'TOP 10',
      icon: '◆',
      color: '#00ffff',
    };
  }

  if (index < 25) {
    return {
      label: 'TOP 25',
      icon: '◇',
      color: '#b966ff',
    };
  }

  return {
    label: 'RANKED',
    icon: '•',
    color: '#777',
  };
};

export const getPerformanceLabel = (
  accuracy: number,
  hitsPerMinute: number,
  maxCombo: number
): string => {
  if (accuracy >= 90 && hitsPerMinute >= 32 && maxCombo >= 20) {
    return 'ELITE AIM OUTPUT';
  }

  if (accuracy >= 80 && hitsPerMinute >= 24) {
    return 'HIGH PERFORMANCE';
  }

  if (accuracy >= 65 && hitsPerMinute >= 18) {
    return 'STABLE CONTROL';
  }

  if (accuracy < 45) {
    return 'PRECISION FAILURE';
  }

  if (hitsPerMinute < 14) {
    return 'LOW ENGAGEMENT SPEED';
  }

  if (maxCombo < 5) {
    return 'CONSISTENCY BREAKPOINT';
  }

  return 'BALANCED SESSION';
};

export const getRankTone = (rank: RankData): string => {
  if (rank.rank === 'GM') return 'You are operating at elite mechanical output.';
  if (rank.rank === 'M') return 'Your aim profile is highly competitive.';
  if (rank.rank === 'D') return 'Strong precision and speed detected.';
  if (rank.rank === 'P') return 'Good mechanics with room to push speed.';
  if (rank.rank === 'G') return 'Solid baseline. Improve consistency.';
  if (rank.rank === 'S') return 'Develop cleaner confirmation before firing.';
  return 'Focus on accuracy, slower shots, and stable crosshair placement.';
};

export const getNextRankMessage = (progress: RankProgress): string => {
  if (progress.isMaxRank) {
    return 'MAX_RANK_REACHED';
  }

  if (!progress.nextRank) {
    return 'NO_NEXT_RANK';
  }

  return `${progress.ratingNeededForNext.toLocaleString()} rating needed for ${progress.nextRank.title}`;
};

export const getRankByTitle = (title: string): RankData | null => {
  const clean = title.trim().toLowerCase();

  return (
    RANKS.find(
      (rank) =>
        rank.title.toLowerCase() === clean ||
        rank.rank.toLowerCase() === clean
    ) || null
  );
};