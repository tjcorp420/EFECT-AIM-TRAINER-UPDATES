import { useMemo } from 'react';
import { useStore } from '../store/useStore';

const getDisplayName = (value: string) => {
  return value.replace(/efect/gi, 'emx').replace(/_/g, ' ').toUpperCase();
};

const getGrade = (accuracy: number, avgHps: number, score: number) => {
  if (accuracy >= 85 && avgHps >= 1.8 && score >= 1500) return 'S+';
  if (accuracy >= 78 && avgHps >= 1.4) return 'S';
  if (accuracy >= 68 && avgHps >= 1.1) return 'A';
  if (accuracy >= 55 && avgHps >= 0.75) return 'B';
  if (accuracy >= 40) return 'C';
  return 'D';
};

const getCoachNote = (accuracy: number, avgHps: number, shots: number, hits: number) => {
  if (shots === 0) return 'No shots recorded. Run the drill again to generate a full performance report.';
  if (accuracy >= 80 && avgHps >= 1.5) return 'Elite pacing. Keep this rhythm and start increasing target speed or precision size.';
  if (accuracy < 45 && shots > hits * 2) return 'You are over-shooting. Slow down slightly and prioritize clean confirmations.';
  if (avgHps < 0.75) return 'Pacing is low. Focus on faster target acquisition and shorter reset time between shots.';
  if (accuracy >= 70) return 'Solid session. Main upgrade path is speed while keeping accuracy above 70%.';
  return 'Good warmup. Build consistency first: smooth crosshair placement, then increase speed.';
};

export default function SessionReview() {
  const {
    score,
    shots,
    hitLog,
    drillDuration,
    color,
    scenario,
    highScores,
    goToScenarios,
    startGame,
  } = useStore();

  const hits = hitLog.length;
  const misses = Math.max(0, shots - hits);
  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;
  const pb = highScores[scenario] || 0;
  const isNewPB = score > pb;

  const chartData = useMemo(() => {
    const buckets = 10;
    const safeDuration = Math.max(1, drillDuration);
    const bucketSize = safeDuration / buckets;
    const data = Array(buckets).fill(0);

    hitLog.forEach((time) => {
      const bucketIndex = Math.min(Math.floor(time / bucketSize), buckets - 1);
      data[bucketIndex]++;
    });

    return data.map((bucketHits) => bucketHits / bucketSize);
  }, [hitLog, drillDuration]);

  const maxHPS = Math.max(...chartData, 1);
  const avgHpsNumber = drillDuration > 0 ? hits / drillDuration : 0;
  const avgHPS = avgHpsNumber.toFixed(1);
  const grade = getGrade(accuracy, avgHpsNumber, score);
  const coachNote = getCoachNote(accuracy, avgHpsNumber, shots, hits);
  const scenarioName = getDisplayName(scenario);

  const statCards = [
    {
      label: 'ACCURACY',
      value: `${accuracy}%`,
      sub: `${hits} hits / ${shots} shots`,
      accent: color,
    },
    {
      label: 'AVG HPS',
      value: avgHPS,
      sub: 'hits per second',
      accent: '#00ffcc',
    },
    {
      label: 'TARGETS HIT',
      value: hits.toLocaleString(),
      sub: `${misses.toLocaleString()} misses`,
      accent: '#b967ff',
    },
    {
      label: 'SESSION GRADE',
      value: grade,
      sub: isNewPB ? 'new personal best' : 'performance rating',
      accent: isNewPB ? '#ffd400' : '#ff3b8a',
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background:
          'radial-gradient(circle at 50% 0%, rgba(185,103,255,0.24), transparent 34%), radial-gradient(circle at 14% 82%, rgba(57,255,20,0.12), transparent 28%), linear-gradient(180deg, rgba(3,3,5,0.98), rgba(0,0,0,0.98))',
        backdropFilter: 'blur(22px)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        color: '#fff',
        overflow: 'hidden',
        padding: 28,
      }}
    >
      <style>{`
        @keyframes emxReviewRise {
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

        @keyframes emxReviewGrid {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-70px, -70px, 0);
          }
        }

        @keyframes emxReviewPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scaleX(0.75);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        .emx-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 28px ${color}66 !important;
        }

        .emx-review-ghost:hover {
          border-color: #ffffff !important;
          color: #ffffff !important;
          box-shadow: 0 0 22px rgba(255,255,255,0.18) !important;
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: '-120px',
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(185,103,255,0.095) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.07) 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          opacity: 0.38,
          animation: 'emxReviewGrid 18s linear infinite',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(rgba(255,255,255,0.026) 50%, rgba(0,0,0,0.22) 50%)',
          backgroundSize: '100% 4px',
          mixBlendMode: 'screen',
          opacity: 0.28,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: 'min(1320px, 94vw)',
          animation: 'emxReviewRise 0.55s ease both',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color,
              letterSpacing: 10,
              fontSize: 12,
              fontWeight: 900,
              textShadow: `0 0 18px ${color}`,
              marginBottom: 10,
            }}
          >
            EMX PERFORMANCE REPORT
          </div>

          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(2.5rem, 5vw, 5rem)',
              letterSpacing: 'clamp(8px, 1.8vw, 22px)',
              lineHeight: 0.95,
              textShadow: `0 0 30px ${color}88, 0 0 70px rgba(185,103,255,0.35)`,
              margin: 0,
              fontWeight: 900,
            }}
          >
            SESSION
            <br />
            REVIEW
          </h1>

          <div
            style={{
              width: 520,
              maxWidth: '70vw',
              height: 1,
              margin: '20px auto 0',
              background: `linear-gradient(90deg, transparent, ${color}, #b967ff, transparent)`,
              boxShadow: `0 0 18px ${color}`,
              animation: 'emxReviewPulse 2.4s ease-in-out infinite',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.45fr',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              border: `1px solid ${isNewPB ? '#ffd400' : color}66`,
              borderTop: `3px solid ${isNewPB ? '#ffd400' : color}`,
              borderRadius: 20,
              padding: 24,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.82))',
              boxShadow: `0 0 38px ${isNewPB ? '#ffd40033' : `${color}22`}, inset 0 0 42px rgba(255,255,255,0.035)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at 0% 0%, ${color}18, transparent 44%)`,
              }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 14,
                  alignItems: 'start',
                  marginBottom: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.42)',
                      fontSize: 11,
                      letterSpacing: 4,
                      fontWeight: 900,
                      marginBottom: 8,
                    }}
                  >
                    MODULE
                  </div>

                  <div
                    style={{
                      color: '#fff',
                      fontSize: 19,
                      letterSpacing: 3,
                      fontWeight: 900,
                      lineHeight: 1.25,
                    }}
                  >
                    {scenarioName}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 90,
                    height: 76,
                    borderRadius: 16,
                    border: `1px solid ${isNewPB ? '#ffd400' : color}`,
                    background: isNewPB ? 'rgba(255,212,0,0.12)' : `${color}12`,
                    display: 'grid',
                    placeItems: 'center',
                    color: isNewPB ? '#ffd400' : color,
                    fontSize: 32,
                    fontWeight: 900,
                    letterSpacing: 2,
                    boxShadow: `0 0 24px ${isNewPB ? '#ffd40055' : `${color}44`}`,
                  }}
                >
                  {grade}
                </div>
              </div>

              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 4 }}>
                FINAL SCORE
              </div>

              <div
                style={{
                  fontSize: 'clamp(3.4rem, 6vw, 5.5rem)',
                  lineHeight: 0.95,
                  fontWeight: 900,
                  color: isNewPB ? '#ffd400' : color,
                  textShadow: `0 0 22px ${isNewPB ? '#ffd400' : color}`,
                  margin: '8px 0 12px',
                }}
              >
                {score.toLocaleString()}
              </div>

              {isNewPB ? (
                <div
                  style={{
                    color: '#ffd400',
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: 3,
                    background: 'rgba(255,212,0,0.1)',
                    padding: '9px 12px',
                    display: 'inline-block',
                    borderRadius: 8,
                    border: '1px solid rgba(255,212,0,0.38)',
                    boxShadow: '0 0 18px rgba(255,212,0,0.22)',
                  }}
                >
                  🏆 NEW PERSONAL BEST
                </div>
              ) : (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.46)',
                    fontSize: 13,
                    letterSpacing: 2,
                  }}
                >
                  PERSONAL BEST: {pb.toLocaleString()}
                </div>
              )}

              <div
                style={{
                  marginTop: 26,
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.42)',
                }}
              >
                <div
                  style={{
                    color,
                    fontSize: 11,
                    letterSpacing: 4,
                    fontWeight: 900,
                    marginBottom: 10,
                  }}
                >
                  EMX COACH NOTE
                </div>

                <div
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 13,
                    lineHeight: 1.65,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                  }}
                >
                  {coachNote}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    minHeight: 120,
                    padding: 16,
                    borderRadius: 16,
                    border: `1px solid ${stat.accent}55`,
                    borderLeft: `4px solid ${stat.accent}`,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.68))',
                    boxShadow: `0 0 24px ${stat.accent}14`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.42)',
                      fontSize: 10,
                      letterSpacing: 3,
                      fontWeight: 900,
                      marginBottom: 12,
                    }}
                  >
                    {stat.label}
                  </div>

                  <div
                    style={{
                      color: stat.accent,
                      fontSize: 28,
                      fontWeight: 900,
                      textShadow: `0 0 16px ${stat.accent}`,
                      marginBottom: 8,
                    }}
                  >
                    {stat.value}
                  </div>

                  <div
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: 11,
                      letterSpacing: 1.4,
                      textTransform: 'uppercase',
                      lineHeight: 1.4,
                    }}
                  >
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.76))',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: `2px solid ${color}`,
                borderRadius: 20,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 0 34px ${color}16, inset 0 0 42px rgba(255,255,255,0.025)`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 20,
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#fff',
                      fontSize: 17,
                      fontWeight: 900,
                      letterSpacing: 4,
                      marginBottom: 7,
                    }}
                  >
                    PERFORMANCE HEATMAP
                  </div>

                  <div
                    style={{
                      color: 'rgba(255,255,255,0.44)',
                      fontSize: 12,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    Hits per second across the session
                  </div>
                </div>

                <div
                  style={{
                    color,
                    border: `1px solid ${color}55`,
                    background: `${color}10`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontWeight: 900,
                    letterSpacing: 2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  PEAK: {maxHPS.toFixed(1)} HPS
                </div>
              </div>

              <div
                style={{
                  height: 220,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 10,
                  borderBottom: '1px solid rgba(255,255,255,0.18)',
                  paddingBottom: 12,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '34px 34px',
                }}
              >
                {chartData.map((val, idx) => {
                  const heightPct = Math.max(5, (val / maxHPS) * 100);
                  const active = val > 0;
                  const peak = val === maxHPS && val > 0;

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <div
                        title={`${val.toFixed(1)} HPS`}
                        style={{
                          width: '100%',
                          height: `${heightPct}%`,
                          background: active
                            ? `linear-gradient(180deg, #ffffff, ${color}, #b967ff)`
                            : 'rgba(255,255,255,0.08)',
                          opacity: active ? 0.86 : 0.28,
                          boxShadow: peak ? `0 0 22px ${color}` : active ? `0 0 10px ${color}33` : 'none',
                          borderRadius: '8px 8px 2px 2px',
                          border: active ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.06)',
                          transition: 'height 0.45s ease-out',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'rgba(255,255,255,0.36)',
                  fontSize: 11,
                  letterSpacing: 3,
                  marginTop: 12,
                  fontWeight: 900,
                }}
              >
                <span>0s</span>
                <span>{Math.round(drillDuration / 2)}s</span>
                <span>{drillDuration}s</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginTop: 24,
          }}
        >
          <button
            className="emx-review-btn"
            onClick={startGame}
            style={{
              padding: '16px 42px',
              fontSize: '1rem',
              background: `linear-gradient(90deg, ${color}, #b967ff)`,
              border: `1px solid ${color}`,
              color: '#000',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: 3,
              transition: 'all 0.2s',
              borderRadius: 10,
              fontWeight: 900,
              boxShadow: `0 0 22px ${color}44`,
            }}
          >
            ↻ RUN IT BACK
          </button>

          <button
            className="emx-review-ghost"
            onClick={goToScenarios}
            style={{
              padding: '16px 42px',
              fontSize: '1rem',
              background: 'rgba(0,0,0,0.46)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.72)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: 3,
              transition: 'all 0.2s',
              borderRadius: 10,
              fontWeight: 900,
            }}
          >
            RETURN TO HUB
          </button>
        </div>
      </div>
    </div>
  );
}