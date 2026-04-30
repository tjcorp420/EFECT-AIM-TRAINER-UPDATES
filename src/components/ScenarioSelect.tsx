import { useStore, playUiSound, unlockAudio } from '../store/useStore';
import { useState, useEffect, useMemo } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { TRAINING_ROUTINES, getScenarioLaunchSettings } from '../store/scenarioData';

const EMX_LOGO_SRC = '/emx-logo.png';

const SCENARIOS = [
  { id: 'efect_overdrive', name: 'EMX OVERDRIVE', desc: 'Maximum speed, zero delay tracking & flicking.', type: 'SPECIAL' },
  { id: 'gridshot_standard', name: 'WALL GRIDSHOT', desc: 'Standard 3-target flicking.', type: 'FLICK' },
  { id: 'gridshot_ultimate', name: 'GRIDSHOT ULTIMATE', desc: 'Faster spawns, more targets.', type: 'FLICK' },
  { id: 'gridshot_precision', name: 'GRIDSHOT PRECISION', desc: 'Tiny targets for micro-flicks.', type: 'PRECISION' },
  { id: 'sixshot_precision', name: 'SIXSHOT PRECISION', desc: 'Six tiny targets for clean click timing.', type: 'PRECISION' },
  { id: 'tile_frenzy', name: 'TILE FRENZY', desc: 'Large high-speed wall targets for raw speed.', type: 'FLICK' },
  { id: 'tile_frenzy_mini', name: 'TILE FRENZY MINI', desc: 'Smaller tile field for speed plus accuracy.', type: 'PRECISION' },
  { id: 'multishot_speed', name: 'MULTISHOT SPEED', desc: 'Dense target field with fast confirmation rhythm.', type: 'FLICK' },
  { id: 'microflick_standard', name: 'MICROFLICK', desc: 'Clustered precision focus.', type: 'PRECISION' },
  { id: 'microflick_react', name: 'MICROFLICK REACT', desc: 'Tiny targets that vanish quickly.', type: 'REACTION' },
  { id: 'microflick_track', name: 'MICROFLICK TRACK', desc: 'Tiny moving targets.', type: 'PRECISION' },
  { id: 'microshot_speed', name: 'MICROSHOT SPEED', desc: 'Rapid small-target confirmations.', type: 'PRECISION' },
  { id: 'headshot_only', name: 'HEADSHOT ONLY', desc: 'Humanoid precision drill built around head conversion.', type: 'PRECISION' },
  { id: 'tracking_dynamic', name: 'DYNAMIC TRACKING', desc: 'Evasive strafing AI.', type: 'TRACKING' },
  { id: 'tracking_smooth', name: 'SMOOTH TRACKING', desc: 'Long, predictable strafes.', type: 'TRACKING' },
  { id: 'tracking_fast', name: 'FAST TRACKING', desc: 'Aggressive, rapid direction changes.', type: 'TRACKING' },
  { id: 'tracking_long_strafe', name: 'LONG STRAFE TRACK', desc: 'Wide predictable strafes for smooth mouse control.', type: 'TRACKING' },
  { id: 'tracking_dodge', name: 'DODGE TRACKING', desc: 'Targets dodge with short unpredictable bursts.', type: 'TRACKING' },
  { id: 'tracking_sphere', name: 'SPHERE TRACKING', desc: 'Floating target with mixed horizontal and vertical motion.', type: 'TRACKING' },
  { id: 'switchtrack_standard', name: 'SWITCHTRACK', desc: 'Swap between multiple moving targets cleanly.', type: 'TRACKING' },
  { id: 'switchtrack_micro', name: 'MICRO SWITCHTRACK', desc: 'Small moving targets for fast tracking swaps.', type: 'TRACKING' },
  { id: 'popcorn_standard', name: 'POPCORN', desc: 'Vertical gravity arcs.', type: 'TIMING' },
  { id: 'popcorn_small', name: 'POPCORN PRECISION', desc: 'Tiny vertical arcs.', type: 'PRECISION' },
  { id: 'popcorn_heavy', name: 'POPCORN HEAVY', desc: 'Fast fall rate gravity.', type: 'TIMING' },
  { id: 'pasu_standard', name: 'PASU JUMP', desc: 'Airborne targets with lateral drift and vertical timing.', type: 'DYNAMIC' },
  { id: 'vertical_switch', name: 'VERTICAL SWITCH', desc: 'High-low target swaps for elevation control.', type: 'DYNAMIC' },
  { id: 'flick360_standard', name: '360 AWARENESS', desc: 'Targets spawn all around you.', type: 'FLICK' },
  { id: 'flick360_react', name: '360 REACT', desc: 'Fast disappearing surround targets.', type: 'REACTION' },
  { id: 'flick360_tracking', name: '360 TRACKING', desc: 'Moving targets behind you.', type: 'TRACKING' },
  { id: 'flick360_precision', name: '360 PRECISION', desc: 'Small surround targets for controlled turns.', type: 'PRECISION' },
  { id: 'spidershot_standard', name: 'SPIDERSHOT', desc: 'Center-return flicking.', type: 'FLICK' },
  { id: 'spidershot_180', name: 'SPIDERSHOT 180', desc: 'Wide angle center returns.', type: 'FLICK' },
  { id: 'spidershot_rapid', name: 'SPIDERSHOT RAPID', desc: 'Fast paced center returns.', type: 'REACTION' },
  { id: 'spidershot_precision', name: 'SPIDERSHOT PRECISION', desc: 'Tiny center-return flicks.', type: 'PRECISION' },
  { id: 'motionshot_standard', name: 'MOTIONSHOT', desc: 'Targets drift after spawning.', type: 'DYNAMIC' },
  { id: 'motionshot_fast', name: 'MOTIONSHOT FAST', desc: 'High speed linear drift.', type: 'DYNAMIC' },
  { id: 'motionshot_small', name: 'MOTIONSHOT PRECISION', desc: 'Tiny drifting targets.', type: 'PRECISION' },
  { id: 'reactive_switch', name: 'REACTIVE SWITCH', desc: 'Targets appear in quick alternating lanes.', type: 'REACTION' },
  { id: 'close_strafe_flick', name: 'CLOSE STRAFE FLICK', desc: 'Close targets with lateral motion and fast scoring.', type: 'FLICK' },
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

const FILTERS = [
  'ALL',
  'FEATURED',
  'FLICK',
  'TRACKING',
  'PRECISION',
  'REACTION',
  'TIMING',
  'DYNAMIC',
] as const;

type FilterType = (typeof FILTERS)[number];

const getTypeAccent = (type: string, color: string) => {
  if (type === 'SPECIAL') return '#ff0055';
  if (type === 'FEATURED') return '#39ff14';
  if (type === 'TRACKING') return '#00aaff';
  if (type === 'PRECISION') return '#b967ff';
  if (type === 'REACTION') return '#ffaa00';
  if (type === 'TIMING') return '#ff3b8a';
  if (type === 'DYNAMIC') return '#00ffaa';
  return color;
};

export default function ScenarioSelect() {
  const store = useStore();
  const {
    color,
    setSettings,
    goToCustomizer,
    username,
    xp,
    level,
    xpToNextLevel,
    totalSessions,
    totalHitsLifetime,
    totalHeadshotsLifetime,
    bestScoreOverall,
    dailyStreak,
    badges,
    recentSessions,
  } = store;

  const [copied, setCopied] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateTone, setUpdateTone] = useState<'idle' | 'success' | 'error' | 'progress'>('idle');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    check()
      .then((update) => {
        if (update) {
          setPendingUpdate(update);
          setUpdateTone('progress');
          setUpdateMessage(`Update v${update.version} ready to install.`);
        }
      })
      .catch(() => {
        // Auto-check should never block the command center.
      });
  }, []);

  const handleManualCheck = async () => {
    await unlockAudio();
    playUiSound('soft');
    setIsChecking(true);
    setUpdateProgress(0);
    setUpdateTone('progress');
    setUpdateMessage('Scanning GitHub update channel...');

    try {
      const update = await check();

      if (update) {
        setPendingUpdate(update);
        setUpdateProgress(100);
        setUpdateTone('success');
        setUpdateMessage(`Update v${update.version} found. Ready to download and install.`);
        playUiSound('confirm');
      } else {
        setUpdateProgress(100);
        setUpdateTone('success');
        setUpdateMessage('System is already up to date.');
        playUiSound('confirm');
      }
    } catch (err) {
      setUpdateProgress(0);
      setUpdateTone('error');
      setUpdateMessage('Update check failed. Confirm network access or GitHub release metadata.');
      playUiSound('error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstall = async () => {
    if (!pendingUpdate) return;

    try {
      await unlockAudio();
      playUiSound('confirm');
      setIsInstalling(true);
      setUpdateProgress(0);
      setUpdateTone('progress');
      setUpdateMessage('Downloading secure EMX update package...');

      let downloaded = 0;
      let contentLength = 0;

      await pendingUpdate.downloadAndInstall((event: any) => {
        if (event.event === 'Started') {
          downloaded = 0;
          contentLength = event.data?.contentLength || 0;
          setUpdateProgress(contentLength > 0 ? 2 : 12);
          setUpdateMessage('Download started. Verifying package stream...');
        }

        if (event.event === 'Progress') {
          downloaded += event.data?.chunkLength || 0;
          const percent = contentLength > 0 ? Math.round((downloaded / contentLength) * 92) : 48;

          setUpdateProgress(Math.max(5, Math.min(92, percent)));
          setUpdateMessage('Installing latest EMX trainer files...');
        }

        if (event.event === 'Finished') {
          setUpdateProgress(100);
          setUpdateMessage('Install complete. Restarting app...');
        }
      });

      setUpdateProgress(100);
      setUpdateTone('success');
      setUpdateMessage('Update installed. Restarting EMX Aim Trainer...');
      playUiSound('confirm');

      try {
        await relaunch();
      } catch {
        setIsInstalling(false);
        setUpdateTone('error');
        setUpdateMessage('Update installed, but automatic restart failed. Restart the app manually.');
        playUiSound('error');
      }
    } catch (error) {
      console.error('Install failed:', error);
      setIsInstalling(false);
      setPendingUpdate(null);
      setUpdateProgress(0);
      setUpdateTone('error');
      setUpdateMessage('Update install failed. No files were applied. Try again from a stable connection.');
      playUiSound('error');
    }
  };

  const exportConfig = () => {
    const configString = `EMX_CFG[SENS:${store.gameSens}|FOV:${store.fov}|RETICLE:${store.size},${store.thickness},${store.gap}|CLR:${store.color}]`;

    navigator.clipboard.writeText(configString);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const filteredScenarios = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return SCENARIOS.filter((scenario) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'FEATURED' && scenario.type === 'SPECIAL') ||
        scenario.type === activeFilter;

      const matchesSearch =
        !normalized ||
        scenario.name.toLowerCase().includes(normalized) ||
        scenario.desc.toLowerCase().includes(normalized) ||
        scenario.type.toLowerCase().includes(normalized);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

const totalModules = SCENARIOS.length;
const visibleModules = filteredScenarios.length;

const DEFAULT_DISPLAY_NAME = 'EMX TWEAKS';

const displayUsername = username?.trim() || DEFAULT_DISPLAY_NAME;
const currentLevelStartXp = Math.pow(Math.max(1, level) - 1, 2) * 850;
const nextLevelTargetXp = Math.pow(Math.max(1, level), 2) * 850;
const levelProgressPct = Math.min(
  100,
  Math.round(((xp - currentLevelStartXp) / Math.max(1, nextLevelTargetXp - currentLevelStartXp)) * 100)
);
const featuredBadges = badges.slice(-4).reverse();
const recentSessionPreview = recentSessions.slice(0, 3);

return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        background:
          'radial-gradient(circle at 50% 0%, rgba(0,255,204,0.16), transparent 32%), radial-gradient(circle at 14% 84%, rgba(57,255,20,0.10), transparent 28%), radial-gradient(circle at 86% 78%, rgba(185,103,255,0.12), transparent 30%), linear-gradient(180deg, #050707 0%, #000 100%)',
      }}
    >
      <style>{`
        @keyframes commandFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes gridDrift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-80px, -80px, 0);
          }
        }

        @keyframes pulseLine {
          0%, 100% {
            opacity: 0.38;
            transform: scaleX(0.75);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes emxLogoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            filter: drop-shadow(0 0 16px ${color}) drop-shadow(0 0 28px rgba(185,103,255,0.75));
          }
          50% {
            transform: translateY(-5px) scale(1.035);
            filter: drop-shadow(0 0 24px ${color}) drop-shadow(0 0 42px rgba(255,0,255,0.85));
          }
        }

        @keyframes emxGlassSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes emxGlassPulse {
          0%, 100% {
            opacity: 0.64;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.045);
          }
        }

        @keyframes emxLogoScan {
          0% {
            transform: translateY(-135%);
            opacity: 0;
          }
          12% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(135%);
            opacity: 0;
          }
        }

        .emx-command-screen * {
          box-sizing: border-box;
        }

        .emx-command-screen button,
        .emx-command-screen input {
          font-family: inherit;
        }

        .emx-command-screen ::-webkit-scrollbar {
          width: 9px;
        }

        .emx-command-screen ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.85);
        }

        .emx-command-screen ::-webkit-scrollbar-thumb {
          background: ${color};
          border-radius: 999px;
          box-shadow: 0 0 16px ${color};
        }

        .emx-logo-glass-frame {
          position: relative;
          width: 190px;
          height: 132px;
          margin: 0 auto 10px;
          display: grid;
          place-items: center;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.18);
          background:
            linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.025)),
            radial-gradient(circle at 25% 20%, ${color}44, transparent 38%),
            radial-gradient(circle at 84% 78%, rgba(185,103,255,0.34), transparent 42%),
            rgba(0,0,0,0.46);
          box-shadow:
            0 0 32px ${color}44,
            0 0 54px rgba(185,103,255,0.22),
            inset 0 0 34px rgba(255,255,255,0.055);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          overflow: hidden;
        }

        .emx-logo-glass-frame::before {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          background:
            conic-gradient(
              from 0deg,
              transparent,
              ${color},
              #b967ff,
              #ff0055,
              transparent,
              ${color}
            );
          opacity: 0.42;
          animation: emxGlassSpin 5.8s linear infinite;
        }

        .emx-logo-glass-frame::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 28px;
          background:
            linear-gradient(135deg, rgba(2,6,6,0.82), rgba(0,0,0,0.62)),
            radial-gradient(circle at 50% 10%, rgba(255,255,255,0.14), transparent 42%);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .emx-logo-ring {
          position: absolute;
          z-index: 2;
          width: 154px;
          height: 82px;
          border-radius: 50%;
          border: 1px solid ${color}88;
          box-shadow:
            0 0 20px ${color}55,
            inset 0 0 18px rgba(185,103,255,0.25);
          transform: rotate(-12deg);
          animation: emxGlassPulse 2.6s ease-in-out infinite;
        }

        .emx-logo-scan {
          position: absolute;
          z-index: 4;
          left: 18px;
          right: 18px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #fff, ${color}, transparent);
          box-shadow: 0 0 18px ${color};
          animation: emxLogoScan 2.2s linear infinite;
          pointer-events: none;
        }

        .emx-main-logo {
          position: relative;
          z-index: 3;
          width: 150px;
          max-height: 96px;
          object-fit: contain;
          animation: emxLogoFloat 2.8s ease-in-out infinite;
        }

        .emx-module-card:hover .module-glow {
          opacity: 1;
          transform: translateX(0);
        }

        .emx-module-card:hover .module-index {
          color: #000 !important;
          background: ${color};
          box-shadow: 0 0 20px ${color};
        }

        .emx-filter-btn:hover {
          border-color: ${color} !important;
          color: ${color} !important;
          box-shadow: 0 0 20px ${color}33 !important;
          transform: translateY(-2px);
        }

        .emx-top-btn:hover {
          border-color: ${color} !important;
          color: #000 !important;
          background: ${color} !important;
          box-shadow: 0 0 24px ${color}66 !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div
        className="emx-command-screen"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-120px',
            opacity: 0.32,
            backgroundImage:
              'linear-gradient(rgba(0,255,204,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.12) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
            animation: 'gridDrift 18s linear infinite',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(rgba(255,255,255,0.025) 50%, rgba(0,0,0,0.2) 50%)',
            backgroundSize: '100% 4px',
            mixBlendMode: 'screen',
            opacity: 0.34,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            padding: '26px 28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            animation: 'commandFadeUp 0.55s ease both',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'start',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '12px 18px',
                  minWidth: 210,
                  borderLeft: `4px solid ${color}`,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,255,204,0.08))',
                  boxShadow: `0 0 26px ${color}22`,
                  letterSpacing: 2,
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                USER_ID:{' '}
                <span style={{ color, textShadow: `0 0 12px ${color}` }}>
                  {displayUsername}
                </span>
              </div>

              <button
                className="emx-top-btn"
                onClick={exportConfig}
                style={{
                  padding: '12px 18px',
                  minWidth: 150,
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(0,0,0,0.65)',
                  color: copied ? color : 'rgba(255,255,255,0.72)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  letterSpacing: 2,
                  transition: 'all 0.18s ease',
                }}
              >
                {copied ? '✓ COPIED' : '⎘ EXPORT'}
              </button>

              <button
                className="emx-top-btn"
                onClick={handleManualCheck}
                disabled={isChecking || pendingUpdate !== null}
                style={{
                  padding: '12px 18px',
                  minWidth: 210,
                  border: '1px solid rgba(255,255,255,0.22)',
                  background: 'rgba(0,0,0,0.65)',
                  color: 'rgba(255,255,255,0.72)',
                  cursor: isChecking || pendingUpdate ? 'not-allowed' : 'pointer',
                  fontWeight: 900,
                  letterSpacing: 2,
                  transition: 'all 0.18s ease',
                }}
              >
                {isChecking ? 'SCANNING...' : '⟳ CHECK FOR PATCH'}
              </button>
            </div>

            <div style={{ textAlign: 'center', paddingTop: 0 }}>
              <div className="emx-logo-glass-frame">
                <div className="emx-logo-ring" />
                <div className="emx-logo-scan" />
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  className="emx-main-logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div
                style={{
                  color,
                  letterSpacing: 10,
                  fontSize: 12,
                  fontWeight: 900,
                  textShadow: `0 0 16px ${color}`,
                  marginBottom: 8,
                }}
              >
                EMX TRAINING SUITE
              </div>

              <div
                style={{
                  color: '#fff',
                  fontSize: 48,
                  lineHeight: 0.95,
                  letterSpacing: 15,
                  fontWeight: 900,
                  textShadow: `0 0 22px ${color}88, 0 0 55px ${color}44`,
                }}
              >
                COMMAND
                <br />
                CENTER
              </div>

              <div
                style={{
                  width: 420,
                  maxWidth: '38vw',
                  height: 1,
                  margin: '18px auto 0',
                  transformOrigin: 'center',
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                  boxShadow: `0 0 18px ${color}`,
                  animation: 'pulseLine 2.6s ease-in-out infinite',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 14,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH MODULE..."
                style={{
                  width: 280,
                  maxWidth: '30vw',
                  padding: '14px 18px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(0,0,0,0.72)',
                  color: '#fff',
                  letterSpacing: 3,
                  fontWeight: 900,
                  boxShadow: 'inset 0 0 22px rgba(0,0,0,0.75)',
                }}
              />

              <a
                href="https://efect-macros-x-tweaks.vercel.app/"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#000',
                  backgroundColor: color,
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  padding: '14px 22px',
                  borderRadius: 6,
                  boxShadow: `0 0 26px ${color}88`,
                  transition: 'all 0.2s',
                  letterSpacing: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                EMX TWEAKS
              </a>
            </div>
          </div>

          {pendingUpdate && (
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              style={{
                width: 'min(920px, 86vw)',
                margin: '0 auto',
                padding: '15px 30px',
                background: isInstalling ? '#001b28' : 'rgba(0, 150, 255, 0.15)',
                border: '1px solid #0096ff',
                color: '#0096ff',
                cursor: isInstalling ? 'wait' : 'pointer',
                borderRadius: 10,
                transition: 'all 0.3s',
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: isInstalling ? 'none' : '0 0 25px rgba(0, 150, 255, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                {isInstalling
                  ? 'DOWNLOADING CORE FILES...'
                  : `⚠ SYSTEM UPDATE DETECTED (v${pendingUpdate.version})`}
              </span>
              <span>{isInstalling ? 'PLEASE WAIT' : 'CLICK TO INSTALL & RESTART'}</span>
            </button>
          )}

          {updateMessage && (
            <div
              style={{
                width: 'min(920px, 86vw)',
                margin: pendingUpdate ? '-8px auto 0' : '0 auto',
                padding: '12px 14px',
                borderRadius: 10,
                border:
                  updateTone === 'error'
                    ? '1px solid rgba(255,0,85,0.62)'
                    : updateTone === 'success'
                      ? `1px solid ${color}88`
                      : '1px solid rgba(0,255,204,0.42)',
                background:
                  updateTone === 'error'
                    ? 'rgba(255,0,85,0.08)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.68), rgba(185,103,255,0.1))',
                boxShadow:
                  updateTone === 'error'
                    ? '0 0 22px rgba(255,0,85,0.16)'
                    : `0 0 22px ${color}18`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  color: updateTone === 'error' ? '#ff0055' : color,
                  fontSize: 11,
                  letterSpacing: 2,
                  fontWeight: 900,
                }}
              >
                <span>UPDATER_STATUS // {updateMessage}</span>
                <span>{updateProgress}%</span>
              </div>

              <div
                style={{
                  height: 5,
                  marginTop: 8,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    width: `${updateProgress}%`,
                    height: '100%',
                    borderRadius: 999,
                    background:
                      updateTone === 'error'
                        ? '#ff0055'
                        : `linear-gradient(90deg, ${color}, #b967ff)`,
                    boxShadow:
                      updateTone === 'error'
                        ? '0 0 12px rgba(255,0,85,0.8)'
                        : `0 0 12px ${color}`,
                    transition: 'width 0.18s ease',
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 16,
                border: `1px solid ${color}55`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, rgba(185,103,255,0.16), rgba(0,0,0,0.68))',
                boxShadow: `0 0 22px ${color}22`,
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>OPERATOR_LEVEL</div>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>{level}</div>
              <div style={{ color, fontSize: 10, letterSpacing: 2, fontWeight: 900 }}>
                {xpToNextLevel.toLocaleString()} XP TO NEXT
              </div>
            </div>

            <div
              style={{
                padding: 16,
                border: `1px solid ${color}55`,
                borderLeft: '4px solid #39ff14',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.62)',
                boxShadow: `0 0 18px ${color}18`,
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>CAREER_RUNS</div>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>{totalSessions}</div>
              <div style={{ color: '#39ff14', fontSize: 10, letterSpacing: 2, fontWeight: 900 }}>
                {dailyStreak} DAY STREAK
              </div>
            </div>

            <div
              style={{
                padding: 16,
                border: `1px solid ${color}55`,
                borderLeft: '4px solid #ff0055',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.62)',
                boxShadow: `0 0 18px ${color}18`,
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>CAREER_HITS</div>
              <div style={{ color, fontSize: 24, fontWeight: 900 }}>
                {totalHitsLifetime.toLocaleString()}
              </div>
              <div style={{ color: '#ff4df0', fontSize: 10, letterSpacing: 2, fontWeight: 900 }}>
                {totalHeadshotsLifetime.toLocaleString()} HEADSHOTS
              </div>
            </div>

            <div
              style={{
                padding: 16,
                border: `1px solid ${color}55`,
                borderLeft: '4px solid #ffd400',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.62)',
                boxShadow: `0 0 18px ${color}18`,
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>BEST_SCORE</div>
              <div style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>
                {bestScoreOverall.toLocaleString()}
              </div>
              <div style={{ color: '#ffd400', fontSize: 10, letterSpacing: 2, fontWeight: 900 }}>
                {visibleModules}/{totalModules} MODULES VISIBLE
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 12,
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                padding: 16,
                border: '1px solid rgba(185,103,255,0.36)',
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, rgba(185,103,255,0.14), rgba(0,255,120,0.06), rgba(0,0,0,0.62))',
                boxShadow: `0 0 28px ${color}18, inset 0 0 30px rgba(255,255,255,0.035)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div style={{ color: '#777', fontSize: 11, letterSpacing: 4, fontWeight: 900 }}>
                  XP_CORE // {xp.toLocaleString()} TOTAL XP
                </div>

                <div style={{ color, fontSize: 11, letterSpacing: 3, fontWeight: 900 }}>
                  {levelProgressPct}% SYNCED
                </div>
              </div>

              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div
                  style={{
                    width: `${levelProgressPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: `linear-gradient(90deg, #39ff14, ${color}, #ff4df0)`,
                    boxShadow: `0 0 18px ${color}`,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 12,
                }}
              >
                {(featuredBadges.length > 0 ? featuredBadges : ['FIRST DEPLOY']).map((badge) => (
                  <span
                    key={badge}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.045)',
                      color: '#fff',
                      fontSize: 10,
                      letterSpacing: 2,
                      fontWeight: 900,
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                border: '1px solid rgba(57,255,20,0.25)',
                borderRadius: 12,
                background: 'rgba(0,0,0,0.56)',
                boxShadow: 'inset 0 0 28px rgba(255,255,255,0.028)',
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4, fontWeight: 900 }}>
                RECENT_RUN_STREAM
              </div>

              <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                {(recentSessionPreview.length > 0
                  ? recentSessionPreview
                  : [
                      {
                        id: 'empty',
                        scenario: 'NO RUN LOGGED',
                        score: 0,
                        grade: '--',
                        accuracy: 0,
                        xpEarned: 0,
                      },
                    ]
                ).map((session) => (
                  <div
                    key={session.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 10,
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.76)',
                      fontSize: 11,
                      letterSpacing: 2,
                      fontWeight: 900,
                    }}
                  >
                    <span>{session.scenario.replace(/efect/gi, 'emx').replace(/_/g, ' ')}</span>
                    <span style={{ color }}>
                      {session.grade} // {session.score.toLocaleString()} // +{session.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {TRAINING_ROUTINES.slice(0, 3).map((routine) => {
              const firstStep = routine.steps[0];

              return (
                <button
                  key={routine.id}
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...getScenarioLaunchSettings(firstStep.scenarioId),
                      drillDuration: firstStep.duration,
                    });
                    goToCustomizer();
                  }}
                  style={{
                    minHeight: 104,
                    padding: 16,
                    textAlign: 'left',
                    borderRadius: 14,
                    border: `1px solid ${color}44`,
                    borderLeft: `4px solid ${color}`,
                    background:
                      'linear-gradient(135deg, rgba(185,103,255,0.16), rgba(0,0,0,0.72))',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: `0 0 24px ${color}12`,
                  }}
                >
                  <div style={{ color, fontSize: 10, letterSpacing: 3, fontWeight: 900 }}>
                    BENCHMARK_PLAYLIST // {routine.estimatedMinutes} MIN
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 16,
                      letterSpacing: 3,
                      fontWeight: 900,
                    }}
                  >
                    {routine.name}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: 'rgba(255,255,255,0.58)',
                      fontSize: 11,
                      letterSpacing: 1.4,
                      lineHeight: 1.45,
                    }}
                  >
                    {firstStep.label}: {firstStep.note}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              padding: '2px 0 0',
            }}
          >
            {FILTERS.map((filter) => {
              const active = activeFilter === filter;

              return (
                <button
                  key={filter}
                  className="emx-filter-btn"
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    padding: '12px 18px',
                    border: active
                      ? `1px solid ${color}`
                      : '1px solid rgba(255,255,255,0.18)',
                    background: active
                      ? `linear-gradient(90deg, ${color}, #39ff14)`
                      : 'rgba(0,0,0,0.62)',
                    color: active ? '#000' : 'rgba(255,255,255,0.8)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 900,
                    letterSpacing: 3,
                    transition: 'all 0.18s ease',
                    boxShadow: active ? `0 0 22px ${color}66` : 'none',
                  }}
                >
                  {filter === 'FEATURED' ? '⚡ FEATURED' : filter}
                </button>
              );
            })}
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 18,
              border: '1px solid rgba(255,255,255,0.1)',
              borderTop: `2px solid ${color}`,
              borderRadius: 18,
              background:
                'linear-gradient(180deg, rgba(12,14,14,0.74), rgba(0,0,0,0.88))',
              boxShadow: `0 0 40px rgba(0,0,0,0.65), inset 0 0 70px ${color}08`,
              backdropFilter: 'blur(18px)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 18,
              }}
            >
              {filteredScenarios.map((scen, index) => {
                const accent = getTypeAccent(scen.type, color);
                const isSpecial = scen.type === 'SPECIAL';

                return (
                  <div
                    key={scen.id}
                    className="emx-module-card"
                    onClick={() => {
                      setSettings(getScenarioLaunchSettings(scen.id));
                      goToCustomizer();
                    }}
                    style={{
                      minHeight: 190,
                      position: 'relative',
                      overflow: 'hidden',
                      padding: 22,
                      borderRadius: 14,
                      border: `1px solid ${isSpecial ? '#ff0055aa' : 'rgba(255,255,255,0.16)'}`,
                      borderLeft: `4px solid ${accent}`,
                      background: isSpecial
                        ? 'linear-gradient(135deg, rgba(255,0,85,0.14), rgba(0,0,0,0.92))'
                        : 'linear-gradient(135deg, rgba(25,28,28,0.88), rgba(0,0,0,0.92))',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                      boxShadow: isSpecial
                        ? '0 0 30px rgba(255,0,85,0.14), inset 0 0 45px rgba(255,0,85,0.04)'
                        : '0 10px 26px rgba(0,0,0,0.42)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accent;
                      e.currentTarget.style.boxShadow = `0 0 30px ${accent}55, inset 0 0 42px ${accent}12`;
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isSpecial
                        ? '#ff0055aa'
                        : 'rgba(255,255,255,0.16)';
                      e.currentTarget.style.boxShadow = isSpecial
                        ? '0 0 30px rgba(255,0,85,0.14), inset 0 0 45px rgba(255,0,85,0.04)'
                        : '0 10px 26px rgba(0,0,0,0.42)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      className="module-glow"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        transform: 'translateX(-18px)',
                        transition: 'all 0.22s ease',
                        background: `radial-gradient(circle at 0% 0%, ${accent}33, transparent 42%)`,
                        pointerEvents: 'none',
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 14,
                        color: 'rgba(255,255,255,0.12)',
                        fontSize: 54,
                        fontWeight: 900,
                        letterSpacing: 2,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          color: accent,
                          fontSize: 11,
                          letterSpacing: 3,
                          fontWeight: 900,
                          textShadow: `0 0 14px ${accent}`,
                        }}
                      >
                        [{scen.type}]
                      </div>

                      <div
                        className="module-index"
                        style={{
                          color: accent,
                          border: `1px solid ${accent}`,
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 10,
                          fontWeight: 900,
                          letterSpacing: 2,
                          transition: 'all 0.18s ease',
                        }}
                      >
                        LOAD
                      </div>
                    </div>

                    <h3
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        margin: '0 0 12px',
                        color: '#fff',
                        fontSize: '1.2rem',
                        letterSpacing: 2,
                        lineHeight: 1.25,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      }}
                    >
                      {scen.name}
                    </h3>

                    <p
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        color: 'rgba(255,255,255,0.64)',
                        fontSize: '0.9rem',
                        lineHeight: 1.55,
                        minHeight: 46,
                        margin: 0,
                      }}
                    >
                      {scen.desc}
                    </p>

                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        marginTop: 20,
                        padding: '10px 12px',
                        border: `1px solid ${accent}22`,
                        background: 'rgba(0,0,0,0.45)',
                        color: accent,
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: 3,
                      }}
                    >
                      TARGETING_CORE // READY
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredScenarios.length === 0 && (
              <div
                style={{
                  height: 220,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: 4,
                  fontWeight: 900,
                }}
              >
                NO_MODULES_MATCH_SEARCH
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.28)',
              fontSize: 11,
              letterSpacing: 5,
              padding: '0 4px',
            }}
          >
            <span>LATENCY_ROUTE: LOCAL_LOW</span>
            <span>ENGINE: EMX_SUITE_HUB_SAFE</span>
            <span>© 2026 EMX BRANDING ELITE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
