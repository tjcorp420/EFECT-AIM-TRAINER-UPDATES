import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
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
  if (OLD_DEFAULT_NAMES.includes(trimmed.toLowerCase())) return '';

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
    // Remember-me is optional.
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
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        background:
          'radial-gradient(circle at 50% 22%, rgba(185,103,255,0.28), transparent 34%), radial-gradient(circle at 12% 82%, rgba(57,255,20,0.16), transparent 30%), linear-gradient(135deg, #020203, #05060a 44%, #000)',
      }}
    >
      <style>{`
        @keyframes emxAuthGrid {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(56px, 56px, 0); }
        }

        @keyframes emxAuthScan {
          0% { transform: translateY(-120vh); opacity: 0; }
          12% { opacity: 0.65; }
          100% { transform: translateY(120vh); opacity: 0; }
        }

        @keyframes emxAuthPanelIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes emxAuthLogo {
          0%, 100% {
            transform: translateY(0) scale(1);
            filter:
              drop-shadow(0 0 24px rgba(57,255,20,0.9))
              drop-shadow(0 0 52px rgba(185,103,255,0.78));
          }
          50% {
            transform: translateY(-10px) scale(1.055);
            filter:
              drop-shadow(0 0 38px rgba(57,255,20,1))
              drop-shadow(0 0 78px rgba(185,103,255,1));
          }
        }

        @keyframes emxAuthOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes emxAuthOrbitReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes emxAuthSheen {
          0% { transform: translateX(-145%) skewX(-22deg); opacity: 0; }
          26% { opacity: 0.82; }
          100% { transform: translateX(170%) skewX(-22deg); opacity: 0; }
        }

        @keyframes emxAuthPulse {
          0%, 100% { opacity: 0.5; transform: scaleX(0.34); }
          50% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes emxAuthBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .emx-auth-field::placeholder {
          color: rgba(255,255,255,0.28);
          letter-spacing: 2px;
        }

        .emx-auth-field:focus {
          border-color: ${color} !important;
          box-shadow: 0 0 0 1px ${color}55, 0 0 26px ${color}44, inset 0 0 20px rgba(255,255,255,0.035) !important;
        }

        .emx-auth-action:not(:disabled):hover {
          transform: translateY(-2px);
          color: #000 !important;
          background: linear-gradient(90deg, #39ff14, ${color}, #b967ff) !important;
          box-shadow: 0 0 34px ${color}70, 0 0 64px rgba(57,255,20,0.24) !important;
        }

        .emx-auth-ghost:hover {
          border-color: ${color} !important;
          color: ${color} !important;
          box-shadow: 0 0 22px ${color}33 !important;
        }

        @media (max-width: 1040px) {
          .emx-auth-shell {
            grid-template-columns: 1fr !important;
            width: min(500px, 92vw) !important;
          }

          .emx-auth-showcase {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: '-80px',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          opacity: 0.34,
          animation: 'emxAuthGrid 18s linear infinite',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.042) 0px, rgba(255,255,255,0.042) 1px, transparent 3px, transparent 6px)',
          opacity: 0.08,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 220,
          background: `linear-gradient(to bottom, transparent, ${color}22, rgba(57,255,20,0.08), transparent)`,
          animation: 'emxAuthScan 7s linear infinite',
          pointerEvents: 'none',
        }}
      />

      <div
        className="emx-auth-shell"
        style={{
          position: 'relative',
          zIndex: 2,
          width: 'min(1180px, 92vw)',
          display: 'grid',
          gridTemplateColumns: '1fr 455px',
          gap: 34,
          alignItems: 'stretch',
          animation: 'emxAuthPanelIn 0.58s cubic-bezier(0.18, 0.9, 0.2, 1) both',
        }}
      >
        <section
          className="emx-auth-showcase"
          style={{
            position: 'relative',
            minHeight: 650,
            borderRadius: 26,
            border: '1px solid rgba(255,255,255,0.11)',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.66)), radial-gradient(circle at 28% 18%, rgba(57,255,20,0.13), transparent 34%), radial-gradient(circle at 72% 70%, rgba(185,103,255,0.18), transparent 38%)',
            boxShadow:
              '0 30px 90px rgba(0,0,0,0.62), inset 0 0 0 1px rgba(255,255,255,0.035)',
            overflow: 'hidden',
            padding: 42,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(105deg, transparent 0%, transparent 42%, rgba(255,255,255,0.16) 50%, transparent 58%, transparent 100%)',
              animation: 'emxAuthSheen 4.4s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                color,
                fontSize: 12,
                letterSpacing: 9,
                fontWeight: 900,
                textShadow: `0 0 18px ${color}`,
                marginBottom: 32,
              }}
            >
              EMX PERFORMANCE TERMINAL
            </div>

            <div
              style={{
                position: 'relative',
                width: 460,
                maxWidth: '100%',
                height: 220,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 420,
                  height: 180,
                  borderRadius: '50%',
                  border: `1px solid ${color}55`,
                  boxShadow: `0 0 35px ${color}26, inset 0 0 26px rgba(185,103,255,0.18)`,
                  animation: 'emxAuthOrbit 7s linear infinite',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 520,
                  height: 230,
                  borderRadius: '50%',
                  border: '1px dashed rgba(57,255,20,0.35)',
                  animation: 'emxAuthOrbitReverse 11s linear infinite',
                }}
              />

              {!logoFailed ? (
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  onError={() => setLogoFailed(true)}
                  style={{
                    width: 390,
                    maxWidth: '92%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    animation: 'emxAuthLogo 2.15s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    color: '#fff',
                    fontSize: 86,
                    fontWeight: 900,
                    letterSpacing: 18,
                    textShadow: `0 0 40px ${color}`,
                  }}
                >
                  EMX
                </div>
              )}
            </div>

            <h1
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 'clamp(3.3rem, 5vw, 6rem)',
                lineHeight: 0.92,
                letterSpacing: 10,
                fontWeight: 900,
                textTransform: 'uppercase',
                textShadow: `0 0 34px ${color}70, 0 0 90px rgba(185,103,255,0.28)`,
              }}
            >
              Elite Aim
              <br />
              Control
            </h1>

            <div
              style={{
                width: 'min(560px, 100%)',
                height: 1,
                margin: '28px 0',
                background: `linear-gradient(90deg, ${color}, #39ff14, transparent)`,
                boxShadow: `0 0 18px ${color}`,
              }}
            />

            <p
              style={{
                margin: 0,
                maxWidth: 640,
                color: 'rgba(255,255,255,0.72)',
                fontSize: 14,
                lineHeight: 1.8,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Precision flicks, smooth tracking, reactive switching, custom reticles,
              performance reports, XP progression, and competitive drill flow.
            </p>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 10,
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
                  minHeight: 62,
                  borderRadius: 12,
                  border: `1px solid ${index % 2 === 0 ? color : '#39ff14'}55`,
                  background: 'rgba(0,0,0,0.38)',
                  boxShadow: `0 0 18px ${index % 2 === 0 ? color : '#39ff14'}14`,
                }}
              >
                <div
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    letterSpacing: 3,
                    fontWeight: 900,
                    marginBottom: 7,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: index % 2 === 0 ? color : '#39ff14',
                    fontSize: 12,
                    letterSpacing: 2,
                    fontWeight: 900,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            position: 'relative',
            borderRadius: 26,
            border: '1px solid rgba(255,255,255,0.13)',
            borderTop: `2px solid ${color}`,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.11), rgba(0,0,0,0.72) 22%, rgba(0,0,0,0.9))',
            boxShadow: `0 30px 90px rgba(0,0,0,0.68), 0 0 54px ${color}18, inset 0 0 0 1px rgba(255,255,255,0.045)`,
            overflow: 'hidden',
            padding: 32,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 0%, ${color}24, transparent 48%)`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 110,
              background: `linear-gradient(90deg, transparent, ${color}22, rgba(255,255,255,0.18), transparent)`,
              animation: 'emxAuthSheen 3.7s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'grid',
                justifyItems: 'center',
                marginBottom: 20,
              }}
            >
              {!logoFailed ? (
                <img
                  src={EMX_LOGO_SRC}
                  alt="EMX"
                  onError={() => setLogoFailed(true)}
                  style={{
                    width: 185,
                    maxHeight: 105,
                    objectFit: 'contain',
                    animation: 'emxAuthLogo 2.15s ease-in-out infinite',
                  }}
                />
              ) : (
                <div style={{ color: '#fff', fontSize: 42, fontWeight: 900 }}>EMX</div>
              )}

              <div
                style={{
                  color,
                  fontSize: 10,
                  letterSpacing: 5,
                  fontWeight: 900,
                  textShadow: `0 0 16px ${color}`,
                  marginTop: 4,
                }}
              >
                SECURE ACCESS PORTAL
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                padding: 5,
                background: 'rgba(0,0,0,0.46)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                marginBottom: 22,
              }}
            >
              {([
                [false, 'LOGIN'],
                [true, 'REGISTER'],
              ] as const).map(([mode, label]) => {
                const active = isRegistering === mode;

                return (
                  <button
                    key={label as string}
                    type="button"
                    onClick={() => {
                      setIsRegistering(Boolean(mode));
                      setErrorMsg('');
                    }}
                    className="emx-auth-ghost"
                    style={{
                      padding: '13px 10px',
                      borderRadius: 10,
                      border: `1px solid ${active ? color : 'transparent'}`,
                      background: active
                        ? `linear-gradient(90deg, ${color}, #b967ff)`
                        : 'rgba(255,255,255,0.025)',
                      color: active ? '#000' : 'rgba(255,255,255,0.62)',
                      cursor: 'pointer',
                      fontWeight: 900,
                      letterSpacing: 3,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <h2
              style={{
                margin: '0 0 20px',
                paddingBottom: 15,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 16,
                letterSpacing: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <span style={{ color }}>{'>'}</span>
              {isRegistering ? 'CREATE_OPERATIVE' : 'DECRYPT_CREDENTIALS'}
              <span
                style={{
                  width: 8,
                  height: 18,
                  background: color,
                  boxShadow: `0 0 16px ${color}`,
                  animation: 'emxAuthBlink 1s step-end infinite',
                }}
              />
            </h2>

            {errorMsg && (
              <div
                style={{
                  padding: 13,
                  marginBottom: 16,
                  borderRadius: 10,
                  border: '1px solid rgba(255,0,85,0.48)',
                  borderLeft: '4px solid #ff0055',
                  background: 'rgba(255,0,85,0.14)',
                  color: '#ffbed0',
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                [ERROR] {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'grid', gap: 16 }}>
              <AuthField label={isRegistering ? 'CREATE DISPLAY NAME' : 'DISPLAY NAME'}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={16}
                  placeholder={isRegistering ? 'Enter callsign...' : 'Optional callsign...'}
                  required={isRegistering}
                  className="emx-auth-field"
                  autoComplete="nickname"
                  style={fieldStyle(color, true)}
                />
                <div
                  style={{
                    marginTop: 7,
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 10,
                    letterSpacing: 2,
                    lineHeight: 1.45,
                    textTransform: 'uppercase',
                  }}
                >
                  {isRegistering
                    ? 'This name appears on your EMX profile.'
                    : 'Optional. Blank uses your saved profile name.'}
                </div>
              </AuthField>

              <AuthField label="NETWORK EMAIL">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@network.com"
                  required
                  className="emx-auth-field"
                  autoComplete="email"
                  style={fieldStyle(color)}
                />
              </AuthField>

              <AuthField label="ACCESS KEY">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="emx-auth-field"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    style={{
                      ...fieldStyle(color, true),
                      paddingRight: 90,
                      letterSpacing: showPassword ? 1 : 5,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="emx-auth-ghost"
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px 11px',
                      borderRadius: 8,
                      border: `1px solid ${color}55`,
                      background: 'rgba(0,0,0,0.66)',
                      color,
                      cursor: 'pointer',
                      fontWeight: 900,
                      letterSpacing: 2,
                      fontSize: 11,
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </AuthField>

              <button
                type="button"
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
                className="emx-auth-ghost"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 14px',
                  borderRadius: 11,
                  border: `1px solid ${rememberMe ? color : 'rgba(255,255,255,0.14)'}`,
                  background: rememberMe ? `${color}13` : 'rgba(0,0,0,0.36)',
                  color: rememberMe ? color : 'rgba(255,255,255,0.62)',
                  cursor: 'pointer',
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                <span>REMEMBER ME</span>
                <span
                  style={{
                    width: 44,
                    height: 22,
                    borderRadius: 999,
                    border: `1px solid ${rememberMe ? color : 'rgba(255,255,255,0.2)'}`,
                    background: rememberMe ? `${color}24` : 'rgba(0,0,0,0.65)',
                    position: 'relative',
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
                      background: rememberMe ? color : 'rgba(255,255,255,0.46)',
                      boxShadow: rememberMe ? `0 0 14px ${color}` : 'none',
                      transition: 'left 0.18s ease',
                    }}
                  />
                </span>
              </button>

              <button
                type="submit"
                disabled={isProcessing || !canSubmit}
                className="emx-auth-action"
                style={{
                  marginTop: 4,
                  padding: 18,
                  borderRadius: 12,
                  border: `1px solid ${isProcessing || !canSubmit ? 'rgba(255,255,255,0.1)' : color}`,
                  background:
                    isProcessing || !canSubmit
                      ? 'rgba(255,255,255,0.035)'
                      : `linear-gradient(90deg, ${color}22, rgba(57,255,20,0.12), rgba(185,103,255,0.18))`,
                  color: isProcessing || !canSubmit ? 'rgba(255,255,255,0.28)' : color,
                  cursor: isProcessing || !canSubmit ? 'not-allowed' : 'pointer',
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  boxShadow: isProcessing || !canSubmit ? 'none' : `0 0 24px ${color}22`,
                  transition: 'all 0.22s ease',
                }}
              >
                {isProcessing
                  ? 'CONNECTING...'
                  : isRegistering
                    ? 'INITIALIZE ACCOUNT'
                    : 'DECRYPT AND ENTER'}
              </button>
            </form>

            <div
              style={{
                marginTop: 24,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.42)',
                fontSize: 12,
                letterSpacing: 2,
              }}
            >
              {isRegistering ? 'ALREADY AN OPERATIVE?' : 'NEED A CALLSIGN?'}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                className="emx-auth-ghost"
                style={{
                  marginLeft: 10,
                  border: 0,
                  borderBottom: `1px dashed ${color}`,
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                {isRegistering ? 'LOGIN' : 'REGISTER'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: 900,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldStyle = (color: string, accent = false): CSSProperties => ({
  width: '100%',
  padding: 15,
  borderRadius: 11,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.52)',
  color: accent ? color : '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: accent ? 900 : 700,
  letterSpacing: 1,
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.62)',
  transition: 'all 0.2s ease',
});
