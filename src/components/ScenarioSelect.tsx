import { useStore } from '../store/useStore';
import { useState, useEffect, useMemo } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const SCENARIOS = [
  { id: 'efect_overdrive', name: 'EFECT OVERDRIVE', desc: 'Maximum speed, zero delay tracking & flicking.', type: 'SPECIAL' },
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
  const { color, setSettings, goToCustomizer, username } = store;

  const [copied, setCopied] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    check()
      .then((update) => {
        if (update) setPendingUpdate(update);
      })
      .catch(() => {});
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);

    try {
      const update = await check();

      if (update) {
        setPendingUpdate(update);
      } else {
        alert('System is currently up to date. No new version found on server.');
      }
    } catch (err) {
      alert('Network Error: Could not reach update server.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleInstall = async () => {
    if (!pendingUpdate) return;

    try {
      setIsInstalling(true);
      await pendingUpdate.downloadAndInstall();
      await relaunch();
    } catch (error) {
      console.error('Install failed:', error);
      setIsInstalling(false);
      setPendingUpdate(null);
      alert('Update installation failed. Check network connection.');
    }
  };

  const exportConfig = () => {
    const configString = `EFECT_CFG[SENS:${store.gameSens}|FOV:${store.fov}|RETICLE:${store.size},${store.thickness},${store.gap}|CLR:${store.color}]`;

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
          'radial-gradient(circle at 50% 0%, rgba(0,255,204,0.14), transparent 32%), radial-gradient(circle at 12% 82%, rgba(0,255,120,0.08), transparent 28%), linear-gradient(180deg, #050707 0%, #000 100%)',
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

        .efect-command-screen * {
          box-sizing: border-box;
        }

        .efect-command-screen button,
        .efect-command-screen input {
          font-family: inherit;
        }

        .efect-command-screen ::-webkit-scrollbar {
          width: 9px;
        }

        .efect-command-screen ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.85);
        }

        .efect-command-screen ::-webkit-scrollbar-thumb {
          background: ${color};
          border-radius: 999px;
          box-shadow: 0 0 16px ${color};
        }

        .efect-module-card:hover .module-glow {
          opacity: 1;
          transform: translateX(0);
        }

        .efect-module-card:hover .module-index {
          color: #000 !important;
          background: ${color};
          box-shadow: 0 0 20px ${color};
        }

        .efect-filter-btn:hover {
          border-color: ${color} !important;
          color: ${color} !important;
          box-shadow: 0 0 20px ${color}33 !important;
          transform: translateY(-2px);
        }

        .efect-top-btn:hover {
          border-color: ${color} !important;
          color: #000 !important;
          background: ${color} !important;
          box-shadow: 0 0 24px ${color}66 !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div
        className="efect-command-screen"
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
                  {username || 'efect2lit'}
                </span>
              </div>

              <button
                className="efect-top-btn"
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
                className="efect-top-btn"
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

            <div style={{ textAlign: 'center', paddingTop: 10 }}>
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
                EFECT TRAINING SUITE
              </div>

              <div
                style={{
                  color: '#fff',
                  fontSize: 56,
                  lineHeight: 0.95,
                  letterSpacing: 16,
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
                href="https://efectmacrosxtweaks.netlify.app/"
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
                EFECT MACROS & TWEAKS
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
                background: 'rgba(0,0,0,0.62)',
                boxShadow: `0 0 18px ${color}18`,
              }}
            >
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>TOTAL_MODULES</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{totalModules}</div>
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
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>MODULES_VISIBLE</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{visibleModules}</div>
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
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>ACTIVE_AGENT</div>
              <div style={{ color, fontSize: 18, fontWeight: 900 }}>{username || 'efect2lit'}</div>
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
              <div style={{ color: '#777', fontSize: 11, letterSpacing: 4 }}>BUILD_CHANNEL</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>SAFE_UI_REBUILD</div>
            </div>
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
                  className="efect-filter-btn"
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
                    className="efect-module-card"
                    onClick={() => {
                      setSettings({ scenario: scen.id });
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
            <span>ENGINE: EFECT_SUITE_HUB_SAFE</span>
            <span>© 2026 EFECT BRANDING ELITE</span>
          </div>
        </div>
      </div>
    </div>
  );
}