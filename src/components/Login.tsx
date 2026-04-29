import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { auth, fetchCloudArmory } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const REMEMBER_KEY = 'efect_login_remember_v1';
const EMX_LOGO_SRC = '/emx-logo.png';

const DEFAULT_DISPLAY_NAME = 'EMX TWEAKS';
const OLD_DEFAULT_NAMES = ['efect2lit', 'emx2lit', 'exm2lit', 'emx_agent', 'emx agent'];

const cleanDisplayName = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return '';

  if (OLD_DEFAULT_NAMES.includes(trimmed.toLowerCase())) {
    return '';
  }

  return trimmed.substring(0, 16);
};

type RememberPayload = {
  remember: boolean;
  email: string;
  username: string;
};

const readRememberedLogin = (): RememberPayload => {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);

    if (!raw) {
      return {
        remember: false,
        email: '',
        username: '',
      };
    }

    const parsed = JSON.parse(raw) as Partial<RememberPayload>;

    return {
      remember: Boolean(parsed.remember),
      email: typeof parsed.email === 'string' ? parsed.email : '',
      username: typeof parsed.username === 'string' ? cleanDisplayName(parsed.username) : '',
    };
  } catch {
    return {
      remember: false,
      email: '',
      username: '',
    };
  }
};

const saveRememberedLogin = (payload: RememberPayload) => {
  try {
    if (!payload.remember) {
      localStorage.removeItem(REMEMBER_KEY);
      return;
    }

    localStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({
        remember: true,
        email: payload.email,
        username: payload.username,
      })
    );
  } catch {
    // no-op
  }
};

export default function Login() {
  const { color, setSettings } = useStore();

  const remembered = useMemo(() => readRememberedLogin(), []);

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState(remembered.email);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(remembered.username);
  const [rememberMe, setRememberMe] = useState(remembered.remember);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!rememberMe) return;

    saveRememberedLogin({
      remember: true,
      email,
      username,
    });
  }, [rememberMe, email, username]);

  const cleanFirebaseError = (message: string) => {
    return message
      .replace('Firebase: ', '')
      .replace('Error ', '')
      .replace(/\(auth\/(.*?)\)\.?/g, '$1')
      .replace(/-/g, ' ')
      .toUpperCase();
  };

  const handleAuth = async (e: FormEvent) => {
  e.preventDefault();

  if (isProcessing) return;

  setErrorMsg('');
  setIsProcessing(true);

  try {
    const cleanUsername = cleanDisplayName(username);

    if (isRegistering && cleanUsername.length < 3) {
      throw new Error('Callsign must be at least 3 characters.');
    }

    if (isRegistering) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: cleanUsername,
      });

      if (rememberMe) {
        saveRememberedLogin({
          remember: true,
          email,
          username: cleanUsername,
        });
      } else {
        saveRememberedLogin({
          remember: false,
          email: '',
          username: '',
        });
      }

      setSettings({
        username: cleanUsername,
        gameState: 'scenarioSelect',
      });

      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const chosenDisplayName =
      cleanUsername || userCredential.user.displayName || DEFAULT_DISPLAY_NAME;

    if (cleanUsername && userCredential.user.displayName !== cleanUsername) {
      await updateProfile(userCredential.user, {
        displayName: cleanUsername,
      });
    }

    if (rememberMe) {
      saveRememberedLogin({
        remember: true,
        email,
        username: chosenDisplayName,
      });
    } else {
      saveRememberedLogin({
        remember: false,
        email: '',
        username: '',
      });
    }

    const cloudSettings = await fetchCloudArmory(userCredential.user.uid);

    if (cloudSettings) {
      console.log('Cloud Armory Loaded Successfully.');

      setSettings({
        ...cloudSettings,
        username: chosenDisplayName,
        gameState: 'scenarioSelect',
      });
    } else {
      setSettings({
        username: chosenDisplayName,
        gameState: 'scenarioSelect',
      });
    }
  } catch (error: any) {
    const cleanError = cleanFirebaseError(error?.message || 'AUTHENTICATION FAILED');
    setErrorMsg(cleanError);
    setIsProcessing(false);
  }
};

const canSubmit = isRegistering
  ? email.trim().length > 0 && password.trim().length >= 6 && cleanDisplayName(username).length >= 3
  : email.trim().length > 0 && password.trim().length >= 6;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#030305',
        backgroundImage: `
          radial-gradient(circle at 50% 18%, ${color}20 0%, transparent 32%),
          radial-gradient(circle at 18% 76%, rgba(57,255,20,0.12) 0%, transparent 28%),
          radial-gradient(circle at 84% 72%, rgba(185,103,255,0.18) 0%, transparent 30%),
          linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px),
          radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.96) 82%)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 52px 52px, 52px 52px, 100% 100%',
        animation: 'emxLoginGrid 22s linear infinite',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes emxLoginGrid {
          0% { background-position: center, center, center, 0 0, 0 0, center; }
          100% { background-position: center, center, center, 0 52px, 52px 0, center; }
        }

        @keyframes emxLoginScanline {
          0% { transform: translateY(-115vh); opacity: 0; }
          10% { opacity: 0.48; }
          90% { opacity: 0.48; }
          100% { transform: translateY(115vh); opacity: 0; }
        }

        @keyframes emxLoginPanelRise {
          from {
            opacity: 0;
            transform: translateY(26px) scale(0.975);
            filter: blur(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes emxLogoFloatBounce {
          0%, 100% {
            transform: translateY(0) rotate(-1deg) scale(1);
          }

          24% {
            transform: translateY(-16px) rotate(1.5deg) scale(1.05);
          }

          46% {
            transform: translateY(-6px) rotate(-0.5deg) scale(1.025);
          }

          68% {
            transform: translateY(-11px) rotate(0.75deg) scale(1.04);
          }
        }

        @keyframes emxLogoPulseGlow {
          0%, 100% {
            filter:
              drop-shadow(0 0 18px rgba(57,255,20,0.76))
              drop-shadow(0 0 30px rgba(185,103,255,0.62))
              drop-shadow(0 0 52px rgba(255,0,255,0.26));
          }

          50% {
            filter:
              drop-shadow(0 0 32px rgba(57,255,20,1))
              drop-shadow(0 0 52px rgba(185,103,255,0.9))
              drop-shadow(0 0 82px rgba(255,0,255,0.48));
          }
        }

        @keyframes emxLogoOrbit {
          0% {
            transform: translate(-50%, -50%) rotate(-14deg) scale(1);
            opacity: 0.5;
          }

          50% {
            transform: translate(-50%, -50%) rotate(166deg) scale(1.08);
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -50%) rotate(346deg) scale(1);
            opacity: 0.5;
          }
        }

        @keyframes emxLogoOrbitReverse {
          0% {
            transform: translate(-50%, -50%) rotate(18deg) scale(1.04);
            opacity: 0.35;
          }

          50% {
            transform: translate(-50%, -50%) rotate(-162deg) scale(1);
            opacity: 0.78;
          }

          100% {
            transform: translate(-50%, -50%) rotate(-342deg) scale(1.04);
            opacity: 0.35;
          }
        }

        @keyframes emxLogoSweep {
          0% { transform: translateX(-135%) skewX(-18deg); opacity: 0; }
          22% { opacity: 0.95; }
          100% { transform: translateX(135%) skewX(-18deg); opacity: 0; }
        }

        @keyframes emxCardSheen {
          0% { transform: translateX(-130%) skewX(-24deg); opacity: 0; }
          28% { opacity: 0.65; }
          100% { transform: translateX(220%) skewX(-24deg); opacity: 0; }
        }

        @keyframes emxTerminalBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes emxMiniFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }

        @keyframes emxBootBar {
          0%, 100% { transform: scaleX(0.22); opacity: 0.35; }
          50% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes emxNoiseShift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, 6px, 0); }
        }

        @keyframes emxFallbackGlow {
          0%, 100% {
            letter-spacing: 14px;
            transform: translateY(0) scale(1);
            text-shadow:
              0 0 18px ${color}66,
              0 0 48px rgba(185,103,255,0.38);
          }

          50% {
            letter-spacing: 18px;
            transform: translateY(-10px) scale(1.05);
            text-shadow:
              0 0 28px #ffffffcc,
              0 0 70px ${color},
              0 0 105px rgba(185,103,255,0.62);
          }
        }

        @keyframes emxFeatureCardIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .emx-auth-input::placeholder {
          color: rgba(255,255,255,0.28);
          letter-spacing: 2px;
        }

        .emx-auth-input:focus {
          border-color: ${color} !important;
          background: rgba(0,0,0,0.72) !important;
          box-shadow:
            0 0 0 1px ${color}55,
            0 0 24px ${color}38,
            inset 0 0 22px rgba(255,255,255,0.035) !important;
        }

        .emx-auth-tab:hover {
          border-color: ${color} !important;
          color: ${color} !important;
          box-shadow: 0 0 18px ${color}30 !important;
        }

        .emx-password-btn:hover {
          color: #000 !important;
          background: ${color} !important;
          box-shadow: 0 0 20px ${color}66 !important;
        }

        .emx-auth-submit:not(:disabled):hover {
          transform: translateY(-2px);
          color: #000 !important;
          background: linear-gradient(90deg, ${color}, #b967ff) !important;
          box-shadow:
            0 0 28px ${color}70,
            0 0 48px rgba(185,103,255,0.42) !important;
        }

        .emx-auth-link:hover {
          color: ${color} !important;
          text-shadow: 0 0 14px ${color}AA;
        }

        .emx-remember-toggle:hover {
          border-color: ${color} !important;
          box-shadow: 0 0 18px ${color}35 !important;
        }

        @media (max-width: 980px) {
          .emx-login-shell {
            grid-template-columns: 1fr !important;
            width: min(520px, 92vw) !important;
            gap: 18px !important;
          }

          .emx-login-left {
            display: none !important;
          }

          .emx-login-panel {
            padding: 28px !important;
          }
        }

        @media (max-height: 760px) {
          .emx-login-logo-zone {
            margin-bottom: 8px !important;
          }

          .emx-login-panel {
            padding: 24px !important;
          }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.24) 50%)',
          backgroundSize: '100% 4px',
          mixBlendMode: 'screen',
          opacity: 0.28,
          animation: 'emxNoiseShift 1.8s linear infinite',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 150,
          background: `linear-gradient(to bottom, transparent, ${color}18, rgba(185,103,255,0.42), transparent)`,
          animation: 'emxLoginScanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 900,
          height: 900,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}12 0%, rgba(185,103,255,0.08) 34%, transparent 68%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        className="emx-login-shell"
        style={{
          position: 'relative',
          zIndex: 2,
          width: 'min(1160px, 92vw)',
          display: 'grid',
          gridTemplateColumns: '1fr 448px',
          gap: 42,
          alignItems: 'center',
          animation: 'emxLoginPanelRise 0.62s cubic-bezier(0.18, 0.9, 0.2, 1) both',
        }}
      >
        <div
          className="emx-login-left"
          style={{
            minHeight: 560,
            padding: '44px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            animation: 'emxMiniFloat 6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              color,
              letterSpacing: 9,
              fontSize: 13,
              fontWeight: 900,
              marginBottom: 18,
              textShadow: `0 0 18px ${color}`,
            }}
          >
            EMX PERFORMANCE TERMINAL
          </div>

          <div
            style={{
              position: 'relative',
              display: 'inline-grid',
              placeItems: 'center',
              width: 430,
              height: 205,
              marginBottom: 6,
              overflow: 'visible',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 360,
                height: 160,
                borderRadius: '50%',
                border: `1px solid ${color}55`,
                boxShadow: `0 0 28px ${color}33, inset 0 0 22px rgba(185,103,255,0.14)`,
                animation: 'emxLogoOrbit 6s linear infinite',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 440,
                height: 200,
                borderRadius: '50%',
                border: '1px dashed rgba(185,103,255,0.34)',
                animation: 'emxLogoOrbitReverse 9s linear infinite',
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                animation: 'emxLogoFloatBounce 2.2s ease-in-out infinite',
              }}
            >
              {!logoFailed ? (
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  onError={() => setLogoFailed(true)}
                  style={{
                    width: 356,
                    maxHeight: 188,
                    objectFit: 'contain',
                    animation: 'emxLogoPulseGlow 1.7s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    color: '#fff',
                    fontSize: '4.8rem',
                    fontWeight: 900,
                    letterSpacing: 14,
                    animation: 'emxFallbackGlow 2.25s ease-in-out infinite',
                  }}
                >
                  EMX
                </div>
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                inset: '18px -30px',
                background: `linear-gradient(90deg, transparent, ${color}24, rgba(255,255,255,0.42), rgba(185,103,255,0.28), transparent)`,
                mixBlendMode: 'screen',
                animation: 'emxLogoSweep 2.45s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          </div>

          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(3.1rem, 5.3vw, 6.2rem)',
              letterSpacing: 'clamp(4px, 0.55vw, 12px)',
              lineHeight: 0.93,
              margin: 0,
              textTransform: 'uppercase',
              fontWeight: 900,
              textShadow: `0 0 30px ${color}6F, 0 0 90px rgba(185,103,255,0.28)`,
              whiteSpace: 'nowrap',
            }}
          >
            EMX AIM
            <br />
            TRAINER
          </h1>

          <div
            style={{
              width: 500,
              maxWidth: '88%',
              height: 1,
              margin: '24px 0',
              background: `linear-gradient(90deg, ${color}, rgba(185,103,255,0.55), transparent)`,
              boxShadow: `0 0 22px ${color}`,
            }}
          />

          <div
            style={{
              color: '#fff',
              fontSize: 22,
              lineHeight: 1.25,
              letterSpacing: 3,
              maxWidth: 640,
              textTransform: 'uppercase',
              fontWeight: 900,
              textShadow: `0 0 20px ${color}38`,
              marginBottom: 16,
            }}
          >
            Train sharper. React faster. Lock every shot.
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 14,
              lineHeight: 1.85,
              letterSpacing: 2,
              maxWidth: 650,
              textTransform: 'uppercase',
            }}
          >
            EMX Aim Trainer is built for serious mouse control: precision flicks,
            smooth tracking, reaction drills, weapon profiles, custom crosshairs,
            performance reports, and 360 training arenas tuned for competitive aim.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 10,
              marginTop: 28,
              maxWidth: 690,
            }}
          >
            {[
              ['FLICK', 'PRECISION'],
              ['TRACK', 'CONTROL'],
              ['REACT', 'FASTER'],
              ['REVIEW', 'STATS'],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  padding: '13px 14px',
                  border: `1px solid ${color}34`,
                  borderLeft: `4px solid ${index % 2 === 0 ? color : '#b967ff'}`,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(0,0,0,0.44))',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderRadius: 12,
                  boxShadow: `0 0 18px ${color}12, inset 0 0 18px rgba(255,255,255,0.025)`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `emxFeatureCardIn 0.52s ease both`,
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${color}, #b967ff)`,
                    transformOrigin: 'left',
                    animation: `emxBootBar ${1.8 + index * 0.24}s ease-in-out infinite`,
                    boxShadow: `0 0 16px ${color}`,
                  }}
                />

                <div
                  style={{
                    color: 'rgba(255,255,255,0.44)',
                    fontSize: 10,
                    letterSpacing: 3,
                    marginBottom: 8,
                    fontWeight: 900,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    color: index % 2 === 0 ? color : '#b967ff',
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: 2,
                    textShadow: `0 0 12px ${index % 2 === 0 ? color : '#b967ff'}`,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="emx-login-panel"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.58) 24%, rgba(0,0,0,0.82))',
            backdropFilter: 'blur(28px) saturate(1.24)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.24)',
            border: '1px solid rgba(255, 255, 255, 0.13)',
            borderTop: `2px solid ${color}`,
            borderRadius: 20,
            padding: 34,
            boxShadow: `
              0 28px 70px rgba(0,0,0,0.68),
              0 0 42px ${color}18,
              0 0 58px rgba(185,103,255,0.14),
              inset 0 0 0 1px rgba(255,255,255,0.045),
              inset 0 0 42px ${color}0F
            `,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -80,
              left: '50%',
              width: 360,
              height: 180,
              transform: 'translateX(-50%)',
              background: `radial-gradient(circle, ${color}32, transparent 68%)`,
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 90,
              background: `linear-gradient(90deg, transparent, ${color}1E, rgba(255,255,255,0.18), transparent)`,
              animation: 'emxCardSheen 3.4s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'absolute', top: -2, left: -2, width: 28, height: 28, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '20px 0 0 0' }} />
          <div style={{ position: 'absolute', top: -2, right: -2, width: 28, height: 28, borderTop: `2px solid #b967ff`, borderRight: `2px solid #b967ff`, borderRadius: '0 20px 0 0' }} />
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 28, height: 28, borderBottom: `2px solid #b967ff`, borderLeft: `2px solid #b967ff`, borderRadius: '0 0 0 20px' }} />
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 0 20px 0' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              className="emx-login-logo-zone"
              style={{
                display: 'grid',
                justifyItems: 'center',
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 188,
                  height: 100,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 158,
                    height: 72,
                    borderRadius: '50%',
                    border: `1px solid ${color}50`,
                    boxShadow: `0 0 20px ${color}24, inset 0 0 16px rgba(185,103,255,0.18)`,
                    animation: 'emxLogoOrbit 5.4s linear infinite',
                  }}
                />

                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    animation: 'emxLogoFloatBounce 2.2s ease-in-out infinite',
                  }}
                >
                  {!logoFailed ? (
                    <img
                      src={EMX_LOGO_SRC}
                      alt="EMX"
                      onError={() => setLogoFailed(true)}
                      style={{
                        width: 162,
                        maxHeight: 96,
                        objectFit: 'contain',
                        animation: 'emxLogoPulseGlow 1.7s ease-in-out infinite',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '2.7rem',
                        fontWeight: 900,
                        letterSpacing: 9,
                        animation: 'emxFallbackGlow 2.35s ease-in-out infinite',
                      }}
                    >
                      EMX
                    </div>
                  )}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    inset: '18px -20px',
                    background: `linear-gradient(90deg, transparent, ${color}25, rgba(255,255,255,0.34), rgba(185,103,255,0.24), transparent)`,
                    mixBlendMode: 'screen',
                    animation: 'emxLogoSweep 2.45s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  color,
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 5,
                  textShadow: `0 0 14px ${color}`,
                  textTransform: 'uppercase',
                }}
              >
                EMX ACCESS PORTAL
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 24,
                padding: 5,
                background: 'rgba(0,0,0,0.38)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 13,
              }}
            >
              <button
                type="button"
                className="emx-auth-tab"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  border: isRegistering ? '1px solid transparent' : `1px solid ${color}`,
                  borderRadius: 9,
                  background: isRegistering
                    ? 'rgba(255,255,255,0.025)'
                    : `linear-gradient(90deg, ${color}, #b967ff)`,
                  color: isRegistering ? 'rgba(255,255,255,0.62)' : '#000',
                  cursor: 'pointer',
                  fontWeight: 900,
                  letterSpacing: 3,
                  transition: 'all 0.2s',
                }}
              >
                LOGIN
              </button>

              <button
                type="button"
                className="emx-auth-tab"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  border: isRegistering ? `1px solid ${color}` : '1px solid transparent',
                  borderRadius: 9,
                  background: isRegistering
                    ? `linear-gradient(90deg, ${color}, #b967ff)`
                    : 'rgba(255,255,255,0.025)',
                  color: isRegistering ? '#000' : 'rgba(255,255,255,0.62)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  letterSpacing: 3,
                  transition: 'all 0.2s',
                }}
              >
                REGISTER
              </button>
            </div>

            <h2
              style={{
                margin: '0 0 22px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 15,
                letterSpacing: 4,
                fontSize: '1.02rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                textShadow: '0 0 18px rgba(255,255,255,0.24)',
              }}
            >
              <span style={{ color, marginRight: 10 }}>&gt;</span>
              {isRegistering ? 'INIT_NEW_OPERATIVE' : 'DECRYPT_CREDENTIALS'}
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 18,
                  background: color,
                  marginLeft: 8,
                  animation: 'emxTerminalBlink 1s step-end infinite',
                  boxShadow: `0 0 16px ${color}`,
                }}
              />
            </h2>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(255, 0, 85, 0.15)',
                  border: '1px solid rgba(255, 0, 85, 0.44)',
                  borderLeft: '4px solid #ff0055',
                  color: '#ffb4c5',
                  padding: 14,
                  marginBottom: 20,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  borderRadius: 9,
                  textShadow: '0 0 10px rgba(255,0,85,0.48)',
                }}
              >
                [ERROR] {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ position: 'relative' }}>
  <label
    style={{
      display: 'block',
      marginBottom: 9,
      color: 'rgba(255,255,255,0.58)',
      fontSize: '0.7rem',
      letterSpacing: 3,
      fontWeight: 900,
    }}
  >
    {isRegistering ? 'CREATE DISPLAY NAME' : 'DISPLAY NAME'}
  </label>

  <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    maxLength={16}
    placeholder={isRegistering ? 'Enter Gamertag...' : 'Optional Display Name...'}
    required={isRegistering}
    className="emx-auth-input"
    autoComplete="nickname"
    style={{
      width: '100%',
      padding: 16,
      background: 'rgba(0,0,0,0.48)',
      color,
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 10,
      outline: 'none',
      fontFamily: 'inherit',
      fontSize: '1.04rem',
      transition: 'all 0.24s',
      fontWeight: 900,
      letterSpacing: 1,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.62)',
    }}
  />

  <div
    style={{
      marginTop: 8,
      color: 'rgba(255,255,255,0.34)',
      fontSize: '0.68rem',
      letterSpacing: 2,
      lineHeight: 1.45,
      textTransform: 'uppercase',
    }}
  >
    {isRegistering
      ? 'This name will show on your EMX profile.'
      : 'Optional. Leave blank to use your saved profile name.'}
  </div>
</div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 9, color: 'rgba(255,255,255,0.58)', fontSize: '0.7rem', letterSpacing: 3, fontWeight: 900 }}>
                  NETWORK EMAIL
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@network.com"
                  required
                  className="emx-auth-input"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: 16,
                    background: 'rgba(0,0,0,0.48)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 10,
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    transition: 'all 0.24s',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.62)',
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 9, color: 'rgba(255,255,255,0.58)', fontSize: '0.7rem', letterSpacing: 3, fontWeight: 900 }}>
                  ACCESS KEY
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="emx-auth-input"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    style={{
                      width: '100%',
                      padding: '16px 94px 16px 16px',
                      background: 'rgba(0,0,0,0.48)',
                      color,
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 10,
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '1.04rem',
                      transition: 'all 0.24s',
                      letterSpacing: showPassword ? 1 : 5,
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.62)',
                    }}
                  />

                  <button
                    type="button"
                    className="emx-password-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 9,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px 12px',
                      border: `1px solid ${color}55`,
                      borderRadius: 8,
                      background: 'rgba(0,0,0,0.72)',
                      color,
                      cursor: 'pointer',
                      fontWeight: 900,
                      letterSpacing: 2,
                      fontSize: 11,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="emx-remember-toggle"
                onClick={() => {
                  const next = !rememberMe;
                  setRememberMe(next);

                  if (!next) {
                    saveRememberedLogin({
                      remember: false,
                      email: '',
                      username: '',
                    });
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  padding: '12px 14px',
                  border: `1px solid ${rememberMe ? color : 'rgba(255,255,255,0.16)'}`,
                  borderRadius: 10,
                  background: rememberMe ? `${color}12` : 'rgba(0,0,0,0.32)',
                  color: rememberMe ? color : 'rgba(255,255,255,0.62)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  letterSpacing: 2,
                  transition: 'all 0.18s ease',
                }}
              >
                <span>REMEMBER ME</span>

                <span
                  style={{
                    width: 44,
                    height: 22,
                    borderRadius: 999,
                    border: `1px solid ${rememberMe ? color : 'rgba(255,255,255,0.22)'}`,
                    background: rememberMe ? `${color}22` : 'rgba(0,0,0,0.65)',
                    position: 'relative',
                    boxShadow: rememberMe ? `0 0 16px ${color}55` : 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: rememberMe ? 24 : 3,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: rememberMe ? color : 'rgba(255,255,255,0.45)',
                      boxShadow: rememberMe ? `0 0 12px ${color}` : 'none',
                      transition: 'left 0.18s ease',
                    }}
                  />
                </span>
              </button>

              <button
                type="submit"
                className="emx-auth-submit"
                disabled={isProcessing || !canSubmit}
                style={{
                  marginTop: 7,
                  padding: 18,
                  background:
                    isProcessing || !canSubmit
                      ? 'rgba(255,255,255,0.035)'
                      : `linear-gradient(45deg, ${color}24, rgba(185,103,255,0.18))`,
                  border: `1px solid ${isProcessing || !canSubmit ? 'rgba(255,255,255,0.10)' : color}`,
                  borderRadius: 10,
                  color: isProcessing || !canSubmit ? 'rgba(255,255,255,0.28)' : color,
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: isProcessing || !canSubmit ? 'not-allowed' : 'pointer',
                  letterSpacing: 4,
                  transition: 'all 0.24s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: isProcessing || !canSubmit ? 'none' : `0 0 20px ${color}22`,
                  textTransform: 'uppercase',
                }}
              >
                {isProcessing
                  ? 'CONNECTING...'
                  : isRegistering
                    ? 'INITIALIZE ACCOUNT'
                    : 'DECRYPT & ENTER'}
              </button>
            </form>

            <div
              style={{
                marginTop: 24,
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.38)',
                letterSpacing: 1,
              }}
            >
              {isRegistering ? 'ALREADY AN OPERATIVE?' : 'NEED A CALLSIGN?'}

              <span
                className="emx-auth-link"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                style={{
                  color: '#fff',
                  marginLeft: 12,
                  cursor: 'pointer',
                  fontWeight: 900,
                  transition: 'all 0.2s',
                  borderBottom: `1px dashed ${color}`,
                }}
              >
                {isRegistering ? 'LOGIN' : 'REGISTER'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}