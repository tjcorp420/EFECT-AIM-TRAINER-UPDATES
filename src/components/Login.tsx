import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { auth, fetchCloudArmory } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const REMEMBER_KEY = 'efect_login_remember_v1';

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
      username: typeof parsed.username === 'string' ? parsed.username : '',
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

  const remembered = readRememberedLogin();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState(remembered.email);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(remembered.username);
  const [rememberMe, setRememberMe] = useState(remembered.remember);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    setErrorMsg('');
    setIsProcessing(true);

    try {
      if (rememberMe) {
        saveRememberedLogin({
          remember: true,
          email,
          username,
        });
      } else {
        saveRememberedLogin({
          remember: false,
          email: '',
          username: '',
        });
      }

      if (isRegistering) {
        const cleanUsername = username.trim();

        if (cleanUsername.length < 3) {
          throw new Error('Callsign must be at least 3 characters.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: cleanUsername,
        });

        setSettings({
          username: cleanUsername,
          gameState: 'scenarioSelect',
        });

        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const displayName = userCredential.user.displayName || username || 'Unknown_Agent';

      const cloudSettings = await fetchCloudArmory(userCredential.user.uid);

      if (cloudSettings) {
        console.log('Cloud Armory Loaded Successfully.');

        setSettings({
          ...cloudSettings,
          username: displayName,
          gameState: 'scenarioSelect',
        });
      } else {
        setSettings({
          username: displayName,
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
    ? email.trim().length > 0 && password.trim().length >= 6 && username.trim().length >= 3
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
          radial-gradient(circle at center, transparent 0%, #000 100%),
          radial-gradient(circle at 50% 12%, ${color}18 0%, transparent 34%),
          radial-gradient(circle at 13% 76%, ${color}10 0%, transparent 30%),
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 52px 52px, 52px 52px',
        animation: 'scrollGrid 20s linear infinite',
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
        @keyframes scrollGrid {
          0% { background-position: center, center, center, 0 0, 0 0; }
          100% { background-position: center, center, center, 0 52px, 52px 0; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes loginRise {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes sideSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes titlePulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px ${color}80);
            text-shadow:
              0 0 18px ${color}75,
              0 0 44px ${color}38,
              0 0 90px ${color}1f;
            transform: translateY(0);
          }

          50% {
            filter: drop-shadow(0 0 26px ${color});
            text-shadow:
              0 0 24px #ffffffcc,
              0 0 52px ${color},
              0 0 120px ${color}70;
            transform: translateY(-2px);
          }
        }

        @keyframes titleSweep {
          0% { transform: translateX(-125%); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateX(125%); opacity: 0; }
        }

        @keyframes bootBar {
          0%, 100% { transform: scaleX(0.25); opacity: 0.35; }
          50% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes microFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -7px, 0); }
        }

        .tech-input::placeholder {
          color: rgba(255,255,255,0.26);
          letter-spacing: 2px;
        }

        .tech-input:focus {
          border-color: ${color} !important;
          box-shadow: 0 0 25px ${color}40 inset, 0 0 20px ${color}40 !important;
          background: rgba(0,0,0,0.9) !important;
        }

        .remember-toggle:hover {
          border-color: ${color} !important;
          box-shadow: 0 0 18px ${color}35 !important;
        }

        .auth-tab:hover {
          color: ${color} !important;
          border-color: ${color} !important;
        }

        .password-ghost-btn:hover {
          color: #000 !important;
          background: ${color} !important;
          box-shadow: 0 0 20px ${color}66 !important;
        }

        .reactive-title-wrap:hover .reactive-title {
          letter-spacing: clamp(5px, 0.9vw, 16px);
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 150,
          background: `linear-gradient(to bottom, transparent, ${color}20, ${color}60, transparent)`,
          animation: 'scanline 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 820,
          height: 820,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}16 0%, transparent 66%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(rgba(255,255,255,0.025) 50%, rgba(0,0,0,0.22) 50%)',
          backgroundSize: '100% 4px',
          mixBlendMode: 'screen',
          opacity: 0.34,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: 'min(1120px, 92vw)',
          display: 'grid',
          gridTemplateColumns: '1fr 440px',
          gap: 38,
          alignItems: 'center',
          animation: 'loginRise 0.55s ease both',
        }}
      >
        <div
          style={{
            minHeight: 520,
            padding: '42px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            animation: 'microFloat 6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              color,
              letterSpacing: 9,
              fontSize: 13,
              fontWeight: 900,
              marginBottom: 16,
              textShadow: `0 0 18px ${color}`,
            }}
          >
            EFECT DEPLOYMENT TERMINAL
          </div>

          <div
            className="reactive-title-wrap"
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 'fit-content',
              maxWidth: '100%',
              overflow: 'hidden',
              padding: '8px 0 14px',
            }}
          >
            <h1
              className="reactive-title"
              style={{
                color: '#fff',
                fontSize: 'clamp(3.2rem, 5.8vw, 6.5rem)',
                letterSpacing: 'clamp(4px, 0.65vw, 12px)',
                lineHeight: 0.93,
                margin: 0,
                textTransform: 'uppercase',
                fontWeight: 900,
                transition: 'all 0.28s ease',
                animation: 'titlePulse 3.2s ease-in-out infinite',
                textShadow: `0 0 30px ${color}80, 0 0 90px ${color}24`,
                whiteSpace: 'nowrap',
              }}
            >
              EFECT AIM
              <br />
              TRAINER
            </h1>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent, ${color}33, #ffffff66, ${color}33, transparent)`,
                mixBlendMode: 'screen',
                animation: 'titleSweep 3.7s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              width: 480,
              maxWidth: '86%',
              height: 1,
              margin: '24px 0',
              background: `linear-gradient(90deg, ${color}, transparent)`,
              boxShadow: `0 0 22px ${color}`,
            }}
          />

          <div
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 15,
              lineHeight: 1.8,
              letterSpacing: 2,
              maxWidth: 560,
              textTransform: 'uppercase',
            }}
          >
            Secure operator gateway for EFECT Aim Trainer. Load your cloud armory,
            sync your training profile, and deploy into the command center.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 12,
              marginTop: 34,
              maxWidth: 620,
            }}
          >
            {[
              ['LOW_LATENCY', 'ACTIVE'],
              ['CLOUD_ARMORY', 'SYNC'],
              ['AIM_CORE', 'ONLINE'],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  padding: '14px 16px',
                  border: `1px solid ${color}44`,
                  borderLeft: `4px solid ${color}`,
                  background: 'rgba(0,0,0,0.58)',
                  boxShadow: `0 0 18px ${color}16`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: color,
                    transformOrigin: 'left',
                    animation: `bootBar ${1.8 + index * 0.24}s ease-in-out infinite`,
                    boxShadow: `0 0 16px ${color}`,
                  }}
                />

                <div
                  style={{
                    color: 'rgba(255,255,255,0.38)',
                    fontSize: 10,
                    letterSpacing: 3,
                    marginBottom: 8,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    color,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: 2,
                    textShadow: `0 0 12px ${color}`,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(10, 12, 12, 0.64), rgba(0, 0, 0, 0.86))',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderTop: `2px solid ${color}`,
            borderRadius: 14,
            padding: 38,
            boxShadow: `0 25px 50px rgba(0,0,0,0.62), inset 0 0 0 1px rgba(255,255,255,0.045), inset 0 0 38px ${color}10`,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 90,
              background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
              animation: 'sideSweep 2.8s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'absolute', top: -2, left: -2, width: 28, height: 28, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '14px 0 0 0' }} />
          <div style={{ position: 'absolute', top: -2, right: -2, width: 28, height: 28, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 14px 0 0' }} />
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 28, height: 28, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderRadius: '0 0 0 14px' }} />
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderRadius: '0 0 14px 0' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 28,
                padding: 5,
                background: 'rgba(0,0,0,0.48)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
              }}
            >
              <button
                type="button"
                className="auth-tab"
                onClick={() => {
                  setIsRegistering(false);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  border: isRegistering ? '1px solid transparent' : `1px solid ${color}`,
                  borderRadius: 7,
                  background: isRegistering ? 'transparent' : color,
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
                className="auth-tab"
                onClick={() => {
                  setIsRegistering(true);
                  setErrorMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 10px',
                  border: isRegistering ? `1px solid ${color}` : '1px solid transparent',
                  borderRadius: 7,
                  background: isRegistering ? color : 'transparent',
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
                margin: '0 0 24px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 16,
                letterSpacing: 4,
                fontSize: '1.05rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
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
                  animation: 'blink 1s step-end infinite',
                }}
              />
            </h2>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(255, 0, 50, 0.15)',
                  border: '1px solid rgba(255, 0, 50, 0.4)',
                  borderLeft: '4px solid #ff0050',
                  color: '#ffaaa0',
                  padding: 14,
                  marginBottom: 22,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  borderRadius: 6,
                  textShadow: '0 0 10px rgba(255,0,50,0.5)',
                }}
              >
                [ERROR] {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {isRegistering && (
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: 10, color: '#aaa', fontSize: '0.72rem', letterSpacing: 3, fontWeight: 900 }}>
                    CALLSIGN TAG
                  </label>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={16}
                    placeholder="Enter Gamertag..."
                    required
                    className="tech-input"
                    style={{
                      width: '100%',
                      padding: 16,
                      background: 'rgba(0,0,0,0.62)',
                      color,
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 7,
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '1.05rem',
                      transition: 'all 0.3s',
                      fontWeight: 900,
                      letterSpacing: 1,
                    }}
                  />
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 10, color: '#aaa', fontSize: '0.72rem', letterSpacing: 3, fontWeight: 900 }}>
                  NETWORK EMAIL
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@network.com"
                  required
                  className="tech-input"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: 16,
                    background: 'rgba(0,0,0,0.62)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 7,
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: 10, color: '#aaa', fontSize: '0.72rem', letterSpacing: 3, fontWeight: 900 }}>
                  ACCESS KEY
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="tech-input"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    style={{
                      width: '100%',
                      padding: '16px 94px 16px 16px',
                      background: 'rgba(0,0,0,0.62)',
                      color,
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 7,
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: '1.05rem',
                      transition: 'all 0.3s',
                      letterSpacing: showPassword ? 1 : 5,
                    }}
                  />

                  <button
                    type="button"
                    className="password-ghost-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: 9,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px 12px',
                      border: `1px solid ${color}55`,
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.78)',
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
                className="remember-toggle"
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
                  borderRadius: 7,
                  background: rememberMe ? `${color}12` : 'rgba(0,0,0,0.36)',
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
                disabled={isProcessing || !canSubmit}
                style={{
                  marginTop: 8,
                  padding: 19,
                  background:
                    isProcessing || !canSubmit
                      ? '#111'
                      : `linear-gradient(45deg, ${color}24, transparent)`,
                  border: `1px solid ${isProcessing || !canSubmit ? '#333' : color}`,
                  borderRadius: 7,
                  color: isProcessing || !canSubmit ? '#555' : color,
                  fontWeight: 900,
                  fontSize: '1.02rem',
                  cursor: isProcessing || !canSubmit ? 'not-allowed' : 'pointer',
                  letterSpacing: 4,
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: isProcessing || !canSubmit ? 'none' : `0 0 20px ${color}22`,
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing && canSubmit) {
                    e.currentTarget.style.background = color;
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = `0 0 32px ${color}70`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing && canSubmit) {
                    e.currentTarget.style.background = `linear-gradient(45deg, ${color}24, transparent)`;
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${color}22`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
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
                marginTop: 26,
                textAlign: 'center',
                fontSize: '0.82rem',
                color: '#666',
                letterSpacing: 1,
              }}
            >
              {isRegistering ? 'ALREADY AN OPERATIVE?' : 'NEED A CALLSIGN?'}

              <span
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                style={{
                  color: '#fff',
                  marginLeft: 12,
                  cursor: 'pointer',
                  fontWeight: 900,
                  transition: 'color 0.2s',
                  borderBottom: `1px dashed ${color}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#fff';
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