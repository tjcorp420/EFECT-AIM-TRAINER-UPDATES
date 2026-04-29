import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useStore, TRACK_LIST, GAME_PROFILES } from '../store/useStore';
import { auth, syncArmoryToCloud } from '../firebase';
import EfectSlider from './EfectSlider';

type CrosshairStyle = 'compact' | 'clean' | 'micro' | 'wide' | 'dot' | 'box';
type WeaponId = 'pistol' | 'smg' | 'sniper' | 'nerf';

type CrosshairPreset = {
  id: CrosshairStyle;
  name: string;
  tag: string;
  size: number;
  thickness: number;
  gap: number;
  dot: boolean;
  crosshairOutline: boolean;
};

type CrosshairSegment = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type WeaponPreset = {
  id: WeaponId;
  name: string;
  shortName: string;
  role: string;
  model: string;
  behavior: string;
  fireRate: number;
  recoil: number;
  control: number;
  range: number;
  mobility: number;
  loadout: string;
  perk: string;
  accent: string;
};

const CROSSHAIR_STYLE_KEY = 'efect_crosshair_style';

const CROSSHAIR_PRESETS: CrosshairPreset[] = [
  {
    id: 'compact',
    name: 'EFECT COMPACT',
    tag: 'FAST FLICK',
    size: 9,
    thickness: 2,
    gap: 5,
    dot: true,
    crosshairOutline: true,
  },
  {
    id: 'clean',
    name: 'FORTNITE CLEAN',
    tag: 'T-STYLE',
    size: 13,
    thickness: 3,
    gap: 7,
    dot: false,
    crosshairOutline: true,
  },
  {
    id: 'micro',
    name: 'VALORANT MICRO',
    tag: 'PRECISION',
    size: 7,
    thickness: 2,
    gap: 4,
    dot: true,
    crosshairOutline: false,
  },
  {
    id: 'wide',
    name: 'WIDE TRACKING',
    tag: 'SMOOTH AIM',
    size: 18,
    thickness: 2,
    gap: 10,
    dot: false,
    crosshairOutline: true,
  },
  {
    id: 'dot',
    name: 'DOT ONLY',
    tag: 'HEADSHOT',
    size: 2,
    thickness: 2,
    gap: 0,
    dot: true,
    crosshairOutline: true,
  },
  {
    id: 'box',
    name: 'NEON BOX',
    tag: 'TARGET LOCK',
    size: 22,
    thickness: 3,
    gap: 5,
    dot: true,
    crosshairOutline: true,
  },
];

const BACKGROUND_PRESETS = [
  {
    id: 'cosmic_space',
    name: 'COSMIC_SPACE_360',
    file: 'cosmic_space.png',
    desc: 'Deep teal nebula for clean dark visibility.',
    tone: 'DARK / SPACE',
  },
  {
    id: 'skydeck_cloud_lab',
    name: 'SKYDECK_CLOUD_LAB',
    file: 'skydeck_cloud_lab.png',
    desc: 'Bright luxury sky lab with clean white lighting.',
    tone: 'BRIGHT / CLEAN',
  },
  {
    id: 'industrial_warehouse',
    name: 'INDUSTRIAL_WAREHOUSE',
    file: 'industrial_warehouse.png',
    desc: 'Factory arena with warm tactical lighting.',
    tone: 'INDUSTRIAL',
  },
  {
    id: 'jungle_temple_ruins',
    name: 'JUNGLE_TEMPLE_RUINS',
    file: 'jungle_temple_ruins.png',
    desc: 'Ancient jungle temple with green energy glow.',
    tone: 'NATURE / RUINS',
  },
  {
    id: 'neon_rooftop_city',
    name: 'NEON_ROOFTOP_CITY',
    file: 'neon_rooftop_city.png',
    desc: 'Cyberpunk rooftop skyline with EFECT green glow.',
    tone: 'CYBER CITY',
  },
  {
    id: 'tech_training_arena',
    name: 'TECH_TRAINING_ARENA',
    file: 'tech_training_arena.png',
    desc: 'Clean sci-fi training room with balanced contrast.',
    tone: 'PRO ARENA',
  },
  {
    id: 'training_chamber',
    name: 'TRAINING_CHAMBER_360',
    file: 'training_chamber.png',
    desc: 'Dark tactical chamber with focused green lighting.',
    tone: 'DARK / CLEAN',
  },
  {
    id: 'efect_arena',
    name: 'EFECT_ARENA_360',
    file: 'efect_arena.png',
    desc: 'Premium EFECT stadium style combat arena.',
    tone: 'ELITE / STAGE',
  },
  {
    id: 'luxury_lounge',
    name: 'LUXURY_LOUNGE_360',
    file: 'luxury_lounge.png',
    desc: 'Black marble luxury lounge with green accents.',
    tone: 'LUXURY',
  },
  {
    id: 'cyber_rooftop',
    name: 'CYBER_ROOFTOP_360',
    file: 'cyber_rooftop.png',
    desc: 'Purple-blue rooftop skyline for aesthetic sessions.',
    tone: 'NEON / NIGHT',
  },
  {
    id: 'cyber',
    name: 'CYBER_GRID_LEGACY',
    file: 'built-in',
    desc: 'Original cyber grid fallback.',
    tone: 'BUILT-IN',
  },
  {
    id: 'minimal',
    name: 'GREYBOX_PRO_LEGACY',
    file: 'built-in',
    desc: 'Clean greybox fallback.',
    tone: 'BUILT-IN',
  },
  {
    id: 'galaxy',
    name: 'SUPERNOVA_LEGACY',
    file: 'built-in',
    desc: 'Original galaxy fallback.',
    tone: 'BUILT-IN',
  },
  {
    id: 'night',
    name: 'STEALTH_DARK_LEGACY',
    file: 'built-in',
    desc: 'Original dark fallback.',
    tone: 'BUILT-IN',
  },
];

const COLOR_SWATCHES = [
  '#00ffcc',
  '#39ff14',
  '#ff0055',
  '#00aaff',
  '#b967ff',
  '#ffaa00',
  '#ffffff',
  '#ff3b8a',
];

const TARGET_SWATCHES = [
  '#00ff00',
  '#39ff14',
  '#00ffcc',
  '#ff0055',
  '#ffaa00',
  '#b967ff',
];

const WEAPON_PRESETS: Record<WeaponId, WeaponPreset> = {
  pistol: {
    id: 'pistol',
    name: 'PISTOL TACTICAL',
    shortName: 'PISTOL',
    role: 'PRECISION SIDEARM',
    model: 'pistol.glb',
    behavior: 'Clean single-fire control for flicks and target confirmation.',
    fireRate: 55,
    recoil: 28,
    control: 88,
    range: 62,
    mobility: 92,
    loadout: 'Semi-auto / tactical sightline',
    perk: 'BEST FOR: clean first-shot accuracy',
    accent: '#b967ff',
  },
  smg: {
    id: 'smg',
    name: 'SMG AUTOMATIC',
    shortName: 'SMG',
    role: 'TRACKING SPRAYER',
    model: 'smg.glb',
    behavior: 'Fast automatic pressure for tracking, reaction, and close target chains.',
    fireRate: 94,
    recoil: 52,
    control: 70,
    range: 48,
    mobility: 86,
    loadout: 'Full-auto / rapid reset',
    perk: 'BEST FOR: smooth tracking and spray control',
    accent: '#00ffcc',
  },
  sniper: {
    id: 'sniper',
    name: 'SNIPER HIGH IMPACT',
    shortName: 'SNIPER',
    role: 'LONG RANGE FLICK',
    model: 'sniper.glb',
    behavior: 'Heavy high-impact feel for microflick discipline and precision timing.',
    fireRate: 22,
    recoil: 76,
    control: 54,
    range: 98,
    mobility: 42,
    loadout: 'Heavy shot / precision barrel',
    perk: 'BEST FOR: disciplined one-shot aim',
    accent: '#ffaa00',
  },
  nerf: {
    id: 'nerf',
    name: 'NERF TRAINING BLASTER',
    shortName: 'NERF',
    role: 'FUN REACTION TRAINER',
    model: 'nerf.glb',
    behavior: 'Larger playful profile for fast warmups and visual aim routines.',
    fireRate: 66,
    recoil: 34,
    control: 82,
    range: 52,
    mobility: 78,
    loadout: 'Training blaster / quick reaction',
    perk: 'BEST FOR: warmups and casual target flow',
    accent: '#ff8a00',
  },
};

const readCrosshairStyle = (): CrosshairStyle => {
  if (typeof window === 'undefined') return 'compact';

  const saved = window.localStorage.getItem(CROSSHAIR_STYLE_KEY) as CrosshairStyle | null;

  if (
    saved === 'compact' ||
    saved === 'clean' ||
    saved === 'micro' ||
    saved === 'wide' ||
    saved === 'dot' ||
    saved === 'box'
  ) {
    return saved;
  }

  return 'compact';
};

const writeCrosshairStyle = (style: CrosshairStyle) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(CROSSHAIR_STYLE_KEY, style);
  window.dispatchEvent(new CustomEvent('efect-crosshair-style', { detail: style }));
};

const buildCrosshairSegments = (
  style: CrosshairStyle,
  gap: number,
  size: number,
  thickness: number
): CrosshairSegment[] => {
  const t = Math.max(1, thickness);
  const g = Math.max(0, gap);
  const s = Math.max(2, size);

  switch (style) {
    case 'clean':
      return [
        { x: -(g + s / 2), y: 0, w: s, h: t },
        { x: g + s / 2, y: 0, w: s, h: t },
        { x: 0, y: g + s / 2, w: t, h: s },
      ];

    case 'micro': {
      const ms = Math.max(3, Math.round(s * 0.55));
      const mg = Math.max(1, Math.round(g * 0.65));

      return [
        { x: 0, y: -(mg + ms / 2), w: t, h: ms },
        { x: 0, y: mg + ms / 2, w: t, h: ms },
        { x: -(mg + ms / 2), y: 0, w: ms, h: t },
        { x: mg + ms / 2, y: 0, w: ms, h: t },
      ];
    }

    case 'wide': {
      const hs = Math.max(8, Math.round(s * 1.7));
      const hg = Math.max(6, Math.round(g * 1.25));
      const vs = Math.max(5, Math.round(s * 0.9));

      return [
        { x: 0, y: -(hg + vs / 2), w: t, h: vs },
        { x: 0, y: hg + vs / 2, w: t, h: vs },
        { x: -(hg + hs / 2), y: 0, w: hs, h: t },
        { x: hg + hs / 2, y: 0, w: hs, h: t },
      ];
    }

    case 'box': {
      const d = Math.max(7, g + Math.round(s * 0.45));
      const len = Math.max(6, Math.round(s * 0.8));

      return [
        { x: -d, y: -(d + len / 2), w: t, h: len },
        { x: -(d + len / 2), y: -d, w: len, h: t },

        { x: d, y: -(d + len / 2), w: t, h: len },
        { x: d + len / 2, y: -d, w: len, h: t },

        { x: -d, y: d + len / 2, w: t, h: len },
        { x: -(d + len / 2), y: d, w: len, h: t },

        { x: d, y: d + len / 2, w: t, h: len },
        { x: d + len / 2, y: d, w: len, h: t },
      ];
    }

    case 'dot':
      return [];

    case 'compact':
    default:
      return [
        { x: 0, y: -(g + s / 2), w: t, h: s },
        { x: 0, y: g + s / 2, w: t, h: s },
        { x: -(g + s / 2), y: 0, w: s, h: t },
        { x: g + s / 2, y: 0, w: s, h: t },
      ];
  }
};

function CrosshairPreviewArt({
  styleName,
  color,
  gap,
  size,
  thickness,
  dot,
  crosshairOutline,
  canvasSize = 72,
}: {
  styleName: CrosshairStyle;
  color: string;
  gap: number;
  size: number;
  thickness: number;
  dot: boolean;
  crosshairOutline: boolean;
  canvasSize?: number;
}) {
  const segments = buildCrosshairSegments(styleName, gap, size, thickness);
  const center = canvasSize / 2;

  const glow = crosshairOutline
    ? `0 0 0 1px rgba(0,0,0,0.95), 0 0 10px ${color}, 0 0 18px ${color}`
    : `0 0 10px ${color}, 0 0 18px ${color}`;

  const dotSize =
    styleName === 'dot'
      ? Math.max(5, thickness * 2.2)
      : styleName === 'micro'
        ? Math.max(2, thickness + 1)
        : Math.max(3, thickness + 1);

  const showDot = dot || styleName === 'dot';

  return (
    <div
      style={{
        position: 'relative',
        width: canvasSize,
        height: canvasSize,
      }}
    >
      {segments.map((seg, index) => (
        <div
          key={`${styleName}-${index}`}
          style={{
            position: 'absolute',
            left: center + seg.x - seg.w / 2,
            top: center + seg.y - seg.h / 2,
            width: seg.w,
            height: seg.h,
            borderRadius: Math.max(1, thickness / 2),
            background: color,
            boxShadow: glow,
          }}
        />
      ))}

      {showDot && (
        <div
          style={{
            position: 'absolute',
            left: center - dotSize / 2,
            top: center - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: color,
            boxShadow: glow,
          }}
        />
      )}
    </div>
  );
}

function WeaponSilhouette({
  weapon,
  color,
}: {
  weapon: WeaponPreset;
  color: string;
}) {
  const accent = weapon.accent || color;

  if (weapon.id === 'sniper') {
    return (
      <div className="weapon-silhouette weapon-silhouette-sniper">
        <span style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
        <i style={{ background: accent }} />
        <b style={{ borderColor: accent }} />
      </div>
    );
  }

  if (weapon.id === 'smg') {
    return (
      <div className="weapon-silhouette weapon-silhouette-smg">
        <span style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
        <i style={{ background: accent }} />
        <b style={{ borderColor: accent }} />
      </div>
    );
  }

  if (weapon.id === 'nerf') {
    return (
      <div className="weapon-silhouette weapon-silhouette-nerf">
        <span style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
        <i style={{ background: accent }} />
        <b style={{ borderColor: accent }} />
      </div>
    );
  }

  return (
    <div className="weapon-silhouette weapon-silhouette-pistol">
      <span style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
      <i style={{ background: accent }} />
      <b style={{ borderColor: accent }} />
    </div>
  );
}

function StatMeter({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          color: 'rgba(255,255,255,0.56)',
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>

      <div
        style={{
          height: 7,
          overflow: 'hidden',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.09)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.max(0, Math.min(100, value))}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.78))`,
            boxShadow: `0 0 16px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function Customizer() {
  const {
    color,
    size,
    thickness,
    gap,
    dot,
    crosshairOutline,
    skipClickToBegin,
    targetColor,
    targetShape,
    targetSkinMode,
    hitSound,
    scenario,
    weaponMode,
    weaponClass,
    targetSpeed,
    modelScale,
    targetAmount,
    targetDistance,
    mapTheme,
    graphicsQuality,
    drillDuration,
    musicTrack,
    musicVolume,
    gameProfile,
    gameSens,
    fov,
    username,
    setSettings,
    setWeapon,
    goToScenarios,
  } = useStore();

  const deployLockRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [crosshairStyle, setCrosshairStyle] = useState<CrosshairStyle>(readCrosshairStyle);
  const [activeBgCategory, setActiveBgCategory] = useState<'ALL' | 'DARK' | 'BRIGHT' | 'ARENA'>(
    'ALL'
  );

  const recommendedFov = GAME_PROFILES[gameProfile]?.defaultFov || 103;
  const activeWeapon = WEAPON_PRESETS[(weaponClass as WeaponId) || 'pistol'] || WEAPON_PRESETS.pistol;

  const forceDeploy = () => {
    if (deployLockRef.current) return;

    deployLockRef.current = true;
    useStore.getState().startGame();

    window.setTimeout(() => {
      deployLockRef.current = false;
    }, 250);
  };

  const activeBackground = useMemo(() => {
    return BACKGROUND_PRESETS.find((bg) => bg.id === mapTheme) || BACKGROUND_PRESETS[0];
  }, [mapTheme]);

    const filteredBackgrounds = useMemo(() => {
    if (activeBgCategory === 'ALL') return BACKGROUND_PRESETS;

    return BACKGROUND_PRESETS.filter((bg) => {
      if (activeBgCategory === 'DARK') {
        return (
          bg.tone.includes('DARK') ||
          bg.tone.includes('SPACE') ||
          bg.tone.includes('NIGHT') ||
          bg.id === 'cyber'
        );
      }

      if (activeBgCategory === 'BRIGHT') {
        return bg.tone.includes('BRIGHT') || bg.tone.includes('CLEAN') || bg.id === 'minimal';
      }

      return (
        bg.tone.includes('ARENA') ||
        bg.tone.includes('STAGE') ||
        bg.tone.includes('INDUSTRIAL') ||
        bg.id.includes('arena') ||
        bg.id.includes('warehouse')
      );
    });
  }, [activeBgCategory]);

  const chooseBgCategory = (filter: 'ALL' | 'DARK' | 'BRIGHT' | 'ARENA') => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();

    setActiveBgCategory(filter);
  };

  const chooseBackground = (bgId: string) => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();

    useStore.getState().setSettings({
      mapTheme: bgId as any,
    });

    window.requestAnimationFrame(() => {
      useStore.getState().setSettings({
        mapTheme: bgId as any,
      });
    });
  };

  const handleCloudSync = async () => {
    if (!auth.currentUser) {
      alert('System Error: No Active Agent Profile.');
      return;
    }

    setIsSyncing(true);

    const state = useStore.getState();

    const payload = {
      color: state.color,
      size: state.size,
      thickness: state.thickness,
      gap: state.gap,
      dot: state.dot,
      crosshairOutline: state.crosshairOutline,
      skipClickToBegin: state.skipClickToBegin,
      targetColor: state.targetColor,
      targetShape: state.targetShape,
      targetSkinMode: state.targetSkinMode,
      hitSound: state.hitSound,
      weaponMode: state.weaponMode,
      weaponClass: state.weaponClass,
      targetSpeed: state.targetSpeed,
      modelScale: state.modelScale,
      targetAmount: state.targetAmount,
      targetDistance: state.targetDistance,
      mapTheme: state.mapTheme,
      graphicsQuality: state.graphicsQuality,
      drillDuration: state.drillDuration,
      musicTrack: state.musicTrack,
      musicVolume: state.musicVolume,
      gameProfile: state.gameProfile,
      gameSens: state.gameSens,
      fov: state.fov,
    };

    await syncArmoryToCloud(auth.currentUser.uid, payload);

    setTimeout(() => {
      setIsSyncing(false);
    }, 1400);
  };

  const applyCrosshairPreset = (preset: CrosshairPreset) => {
    setCrosshairStyle(preset.id);
    writeCrosshairStyle(preset.id);

    setSettings({
      size: preset.size,
      thickness: preset.thickness,
      gap: preset.gap,
      dot: preset.dot,
      crosshairOutline: preset.crosshairOutline,
    });
  };

  const applyOptimalFov = () => {
    setSettings({
      fov: recommendedFov,
    });
  };

  const isCurrentCrosshair = (preset: CrosshairPreset) => {
    return (
      crosshairStyle === preset.id &&
      preset.size === size &&
      preset.thickness === thickness &&
      preset.gap === gap &&
      preset.dot === dot &&
      preset.crosshairOutline === crosshairOutline
    );
  };

  const Panel = ({
    children,
    title,
    index,
    sub,
  }: {
    children: ReactNode;
    title: string;
    index: string;
    sub?: string;
  }) => (
    <div
      style={{
        position: 'relative',
        minHeight: 0,
        background:
          'linear-gradient(180deg, rgba(14,14,14,0.88), rgba(0,0,0,0.92))',
        border: `1px solid ${color}66`,
        borderTop: `3px solid ${color}`,
        borderRadius: 18,
        padding: 24,
        boxShadow: `0 0 36px ${color}18, inset 0 0 42px rgba(255,255,255,0.025)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at top left, ${color}12, transparent 42%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginBottom: 22,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          paddingBottom: 14,
        }}
      >
        <div
          style={{
            color,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 5,
            marginBottom: 8,
          }}
        >
          [ {index} ]
        </div>

        <div
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 5,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>

        {sub && (
          <div
            style={{
              color: 'rgba(255,255,255,0.42)',
              fontSize: 12,
              letterSpacing: 2,
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {sub}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );

  const FieldLabel = ({ children }: { children: ReactNode }) => (
    <label
      style={{
        display: 'block',
        marginBottom: 9,
        color: 'rgba(255,255,255,0.48)',
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: 900,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </label>
  );

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    background: 'rgba(0,0,0,0.72)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontWeight: 900,
    letterSpacing: 1,
    outline: 'none',
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const toggleStyle: CSSProperties = {
    accentColor: color,
    width: 22,
    height: 22,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background:
          'radial-gradient(circle at 50% 0%, rgba(0,255,204,0.12), transparent 34%), linear-gradient(180deg, rgba(5,5,5,0.96), rgba(0,0,0,0.98))',
        backdropFilter: 'blur(20px)',
        zIndex: 5000,
        pointerEvents: 'auto',
        isolation: 'isolate',
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        color: '#fff',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '28px 28px 130px',
      }}
    >
      <style>{`
        @keyframes armoryGridDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-70px, -70px, 0); }
        }

        @keyframes armoryPulse {
          0%, 100% {
            opacity: 0.36;
            transform: scaleX(0.7);
          }

          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes armorySweep {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes weaponPulse {
          0%, 100% {
            opacity: 0.55;
            transform: translateX(-8%) scaleX(0.8);
          }

          50% {
            opacity: 1;
            transform: translateX(8%) scaleX(1);
          }
        }

        @keyframes weaponSweep {
          0% { transform: translateX(-160%); opacity: 0; }
          20% { opacity: 0.5; }
          100% { transform: translateX(160%); opacity: 0; }
        }

        .efect-armory * {
          box-sizing: border-box;
        }

        .efect-armory button,
        .efect-armory input,
        .efect-armory select {
          font-family: inherit;
        }

        .efect-armory input,
        .efect-armory select,
        .efect-armory button,
        .efect-armory a {
          -webkit-app-region: no-drag;
        }

        .efect-armory select {
          transform: none;
          backface-visibility: visible;
        }

        .efect-armory ::-webkit-scrollbar {
          width: 9px;
        }

        .efect-armory ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.9);
        }

        .efect-armory ::-webkit-scrollbar-thumb {
          background: ${color};
          border-radius: 999px;
          box-shadow: 0 0 16px ${color};
        }

        .stable-hover {
          will-change: border-color, box-shadow, background-color, color;
          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background-color 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease;
        }

        .stable-hover:hover {
          border-color: ${color} !important;
          box-shadow: 0 0 24px ${color}33, inset 0 0 20px ${color}08 !important;
        }

        .armory-btn:hover {
          border-color: ${color} !important;
          color: #000 !important;
          background: ${color} !important;
          box-shadow: 0 0 28px ${color}66 !important;
        }

        .armory-ghost:hover {
          border-color: ${color} !important;
          color: ${color} !important;
          box-shadow: 0 0 24px ${color}33 !important;
        }

        .armory-input:focus,
        .armory-select:focus {
          border-color: ${color} !important;
          box-shadow: 0 0 20px ${color}33 !important;
        }

        .bg-card:hover .bg-card-img {
          filter: saturate(1.1) contrast(1.08);
        }

        .preset-card:hover .preset-tag {
          color: #000 !important;
          background: ${color} !important;
        }

        .weapon-card:hover {
          border-color: ${color} !important;
          box-shadow: 0 0 26px ${color}40, inset 0 0 28px ${color}0f !important;
        }

        .weapon-silhouette {
          position: relative;
          width: 100%;
          height: 86px;
          border-radius: 14px;
          overflow: hidden;
          background:
            radial-gradient(circle at center, rgba(255,255,255,0.08), rgba(0,0,0,0.86)),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 100% 100%, 18px 18px, 18px 18px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .weapon-silhouette::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          animation: weaponSweep 3s ease-in-out infinite;
          pointer-events: none;
        }

        .weapon-silhouette span,
        .weapon-silhouette i,
        .weapon-silhouette b {
          position: absolute;
          display: block;
        }

        .weapon-silhouette-pistol span {
          width: 54%;
          height: 18px;
          left: 24%;
          top: 31px;
          border-radius: 5px;
        }

        .weapon-silhouette-pistol i {
          width: 22px;
          height: 42px;
          left: 58%;
          top: 40px;
          border-radius: 4px 4px 8px 8px;
          transform: rotate(-12deg);
          opacity: 0.9;
        }

        .weapon-silhouette-pistol b {
          width: 24px;
          height: 20px;
          left: 48%;
          top: 48px;
          border-width: 2px;
          border-style: solid;
          border-radius: 50%;
          opacity: 0.7;
        }

        .weapon-silhouette-smg span {
          width: 64%;
          height: 16px;
          left: 18%;
          top: 31px;
          border-radius: 6px;
        }

        .weapon-silhouette-smg i {
          width: 18px;
          height: 55px;
          left: 49%;
          top: 39px;
          border-radius: 3px;
          opacity: 0.9;
        }

        .weapon-silhouette-smg b {
          width: 32px;
          height: 28px;
          left: 73%;
          top: 37px;
          border-width: 2px;
          border-style: solid;
          border-radius: 5px;
          opacity: 0.65;
        }

        .weapon-silhouette-sniper span {
          width: 78%;
          height: 9px;
          left: 10%;
          top: 39px;
          border-radius: 999px;
        }

        .weapon-silhouette-sniper i {
          width: 15px;
          height: 48px;
          left: 62%;
          top: 43px;
          border-radius: 3px;
          opacity: 0.85;
        }

        .weapon-silhouette-sniper b {
          width: 44px;
          height: 18px;
          left: 40%;
          top: 21px;
          border-width: 2px;
          border-style: solid;
          border-radius: 999px;
          opacity: 0.72;
        }

        .weapon-silhouette-nerf span {
          width: 62%;
          height: 28px;
          left: 20%;
          top: 27px;
          border-radius: 10px;
        }

        .weapon-silhouette-nerf i {
          width: 28px;
          height: 42px;
          left: 60%;
          top: 46px;
          border-radius: 5px 5px 12px 12px;
          transform: rotate(-14deg);
          opacity: 0.9;
        }

        .weapon-silhouette-nerf b {
          width: 38px;
          height: 38px;
          left: 35%;
          top: 24px;
          border-width: 3px;
          border-style: solid;
          border-radius: 50%;
          opacity: 0.68;
        }

        @media (max-width: 1200px) {
          .armory-grid {
            grid-template-columns: 1fr !important;
          }

          .armory-header {
            grid-template-columns: 1fr !important;
          }

          .armory-title {
            text-align: left !important;
          }
        }
      `}</style>

      <div
        className="efect-armory"
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100%',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: '-120px',
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage:
              'linear-gradient(rgba(0,255,204,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.075) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            opacity: 0.38,
            animation: 'armoryGridDrift 18s linear infinite',
          }}
        />

        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background:
              'linear-gradient(rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.2) 50%)',
            backgroundSize: '100% 4px',
            mixBlendMode: 'screen',
            opacity: 0.3,
          }}
        />

        <div
          className="armory-header"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 20,
            alignItems: 'start',
            maxWidth: 1780,
            margin: '0 auto 24px',
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="armory-ghost stable-hover"
              onClick={goToScenarios}
              style={{
                padding: '14px 22px',
                minWidth: 170,
                background: 'rgba(0,0,0,0.62)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.74)',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 900,
                letterSpacing: 3,
              }}
            >
              &lt; BACK_TO_HUB
            </button>

            <a
              href="https://www.tiktok.com/@efect2lit"
              target="_blank"
              rel="noreferrer"
              className="armory-ghost stable-hover"
              style={{
                padding: '14px 22px',
                minWidth: 190,
                background: 'rgba(0,0,0,0.62)',
                border: `1px solid ${color}55`,
                color,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 900,
                letterSpacing: 2,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              TIKTOK: EFECT2LIT
            </a>
          </div>

          <div className="armory-title" style={{ textAlign: 'center' }}>
            <div
              style={{
                color,
                fontSize: 12,
                letterSpacing: 9,
                fontWeight: 900,
                marginBottom: 10,
                textShadow: `0 0 18px ${color}`,
              }}
            >
              EFECT AIM TRAINER // ARMORY
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 48,
                lineHeight: 0.95,
                letterSpacing: 18,
                fontWeight: 900,
                textShadow: `0 0 26px ${color}80, 0 0 70px ${color}33`,
              }}
            >
              LOADOUT
              <br />
              CONTROL
            </div>

            <div
              style={{
                width: 430,
                maxWidth: '70vw',
                height: 1,
                margin: '18px auto 0',
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                boxShadow: `0 0 18px ${color}`,
                animation: 'armoryPulse 2.4s ease-in-out infinite',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              justifySelf: 'end',
              minWidth: 360,
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                border: `1px solid ${color}44`,
                borderLeft: `4px solid ${color}`,
                background: 'rgba(0,0,0,0.62)',
                borderRadius: 10,
              }}
            >
              <div style={{ color: '#777', fontSize: 10, letterSpacing: 3 }}>AGENT</div>
              <div style={{ color, fontWeight: 900, letterSpacing: 1 }}>
                {username || 'efect2lit'}
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                border: `1px solid ${color}44`,
                borderLeft: '4px solid #ff0055',
                background: 'rgba(0,0,0,0.62)',
                borderRadius: 10,
              }}
            >
              <div style={{ color: '#777', fontSize: 10, letterSpacing: 3 }}>MODULE</div>
              <div style={{ color: '#fff', fontWeight: 900, letterSpacing: 1 }}>
                {scenario.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            <button
              className="armory-ghost stable-hover"
              onClick={handleCloudSync}
              disabled={isSyncing}
              style={{
                gridColumn: '1 / span 2',
                padding: '14px 16px',
                background: isSyncing ? `${color}25` : 'rgba(0,0,0,0.62)',
                border: `1px solid ${color}66`,
                color: isSyncing ? '#fff' : color,
                borderRadius: 10,
                cursor: isSyncing ? 'wait' : 'pointer',
                fontWeight: 900,
                letterSpacing: 3,
              }}
            >
              {isSyncing ? 'SYNCING_TO_CLOUD...' : 'CLOUD_SYNC_ARMORY'}
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                forceDeploy();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                forceDeploy();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                forceDeploy();
              }}
              className="stable-hover"
              style={{
                gridColumn: '1 / span 2',
                position: 'relative',
                zIndex: 99999,
                pointerEvents: 'auto',
                padding: '16px 18px',
                background: color,
                border: `1px solid ${color}`,
                color: '#000',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 900,
                letterSpacing: 4,
                boxShadow: `0 0 30px ${color}66`,
              }}
            >
              DEPLOY_TO_ARENA
            </button>
          </div>
        </div>

        <div
          className="armory-grid"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns:
              'minmax(330px, 0.95fr) minmax(380px, 1.05fr) minmax(430px, 1.25fr)',
            gap: 22,
            maxWidth: 1780,
            margin: '0 auto',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 22 }}>
            <Panel
              index="01"
              title="Kinetic Replication"
              sub="Sensitivity, FOV, duration, weapon behavior, and audio feedback."
            >
              <div style={{ display: 'grid', gap: 18 }}>
                <div>
                  <FieldLabel>Player Callsign</FieldLabel>
                  <input
                    className="armory-input"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setSettings({
                        username: e.target.value.substring(0, 16),
                      })
                    }
                    placeholder="Enter Gamer Tag..."
                    maxLength={16}
                    style={{
                      ...inputStyle,
                      color,
                      borderColor: `${color}77`,
                    }}
                  />
                </div>

                <div>
                  <FieldLabel>Target Game Engine</FieldLabel>
                  <select
                    className="armory-select"
                    value={gameProfile}
                    onChange={(e) =>
                      setSettings({
                        gameProfile: e.target.value,
                      })
                    }
                    style={selectStyle}
                  >
                    {Object.entries(GAME_PROFILES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <div>
                    <FieldLabel>In-Game Sens</FieldLabel>
                    <input
                      className="armory-input"
                      type="number"
                      step="0.001"
                      value={gameSens}
                      onChange={(e) =>
                        setSettings({
                          gameSens: Number(e.target.value),
                        })
                      }
                      style={{
                        ...inputStyle,
                        color,
                        borderColor: `${color}77`,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: 14,
                      background: 'rgba(0,0,0,0.42)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <FieldLabel>FOV: {fov}</FieldLabel>

                      <button
                        type="button"
                        className="stable-hover"
                        onClick={applyOptimalFov}
                        style={{
                          padding: '8px 10px',
                          background: fov === recommendedFov ? color : 'rgba(0,0,0,0.55)',
                          border: `1px solid ${color}88`,
                          color: fov === recommendedFov ? '#000' : color,
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontWeight: 900,
                          letterSpacing: 2,
                          fontSize: 10,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        APPLY_OPTIMAL_FOV
                      </button>
                    </div>

                    <EfectSlider
                      min={60}
                      max={130}
                      value={fov}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          fov: nextValue,
                        })
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: fov === recommendedFov ? color : '#ffaa00',
                    padding: '11px 12px',
                    background: 'rgba(0,0,0,0.45)',
                    border: `1px solid ${
                      fov === recommendedFov ? `${color}44` : 'rgba(255,170,0,0.42)'
                    }`,
                    borderRadius: 8,
                    letterSpacing: 1,
                    lineHeight: 1.45,
                  }}
                >
                  {fov === recommendedFov
                    ? '✓ CALIBRATION_SYNCED: 1:1 ENGINE MATCH'
                    : `⚠ DESYNC_DETECTED: FOR ${
                        GAME_PROFILES[gameProfile]?.name
                      }, USE FOV ${recommendedFov}`}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <FieldLabel>Weapon Class</FieldLabel>
                    <select
                      className="armory-select"
                      value={weaponClass}
                      onChange={(e) => setWeapon(e.target.value as any)}
                      style={selectStyle}
                    >
                      <option value="pistol">Pistol Tactical</option>
                      <option value="smg">SMG Automatic</option>
                      <option value="sniper">Sniper High Impact</option>
                      <option value="nerf">Nerf Training Blaster</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Weapon Mode</FieldLabel>
                    <select
                      className="armory-select"
                      value={weaponMode}
                      onChange={(e) =>
                        setSettings({
                          weaponMode: e.target.value as any,
                        })
                      }
                      style={selectStyle}
                    >
                      <option value="laser">Hitscan Laser</option>
                      <option value="stealth">Stealth No Tracer</option>
                    </select>
                  </div>
                </div>

                <div
                  className="weapon-card stable-hover"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 14,
                    borderRadius: 16,
                    border: `1px solid ${activeWeapon.accent}88`,
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.045), rgba(0,0,0,0.74))',
                    boxShadow: `0 0 26px ${activeWeapon.accent}20`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      background: `radial-gradient(circle at 16% 0%, ${activeWeapon.accent}22, transparent 48%)`,
                    }}
                  />

                  <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: 14 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: 12,
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: activeWeapon.accent,
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: 3,
                            marginBottom: 7,
                          }}
                        >
                          ACTIVE_WEAPON_PROFILE
                        </div>

                        <div
                          style={{
                            color: '#fff',
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: 3,
                          }}
                        >
                          {activeWeapon.name}
                        </div>

                        <div
                          style={{
                            color: 'rgba(255,255,255,0.48)',
                            fontSize: 12,
                            letterSpacing: 2,
                            marginTop: 7,
                            lineHeight: 1.45,
                          }}
                        >
                          {activeWeapon.role} // {activeWeapon.model}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '7px 9px',
                          borderRadius: 8,
                          border: `1px solid ${activeWeapon.accent}`,
                          background: `${activeWeapon.accent}18`,
                          color: activeWeapon.accent,
                          fontSize: 10,
                          fontWeight: 900,
                          letterSpacing: 2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        GLB_READY
                      </div>
                    </div>

                    <WeaponSilhouette weapon={activeWeapon} color={color} />

                    <div
                      style={{
                        color: 'rgba(255,255,255,0.68)',
                        fontSize: 12,
                        lineHeight: 1.55,
                        letterSpacing: 1,
                      }}
                    >
                      {activeWeapon.behavior}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10,
                      }}
                    >
                      <StatMeter label="Fire Rate" value={activeWeapon.fireRate} color={activeWeapon.accent} />
                      <StatMeter label="Control" value={activeWeapon.control} color={activeWeapon.accent} />
                      <StatMeter label="Range" value={activeWeapon.range} color={activeWeapon.accent} />
                      <StatMeter label="Mobility" value={activeWeapon.mobility} color={activeWeapon.accent} />
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 11px',
                          borderRadius: 10,
                          background: 'rgba(0,0,0,0.46)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: 2,
                        }}
                      >
                        LOADOUT: <span style={{ color: activeWeapon.accent }}>{activeWeapon.loadout}</span>
                      </div>

                      <div
                        style={{
                          padding: '10px 11px',
                          borderRadius: 10,
                          background: `${activeWeapon.accent}12`,
                          border: `1px solid ${activeWeapon.accent}55`,
                          color: activeWeapon.accent,
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: 2,
                        }}
                      >
                        {activeWeapon.perk}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <FieldLabel>Drill Length</FieldLabel>
                    <select
                      className="armory-select"
                      value={drillDuration}
                      onChange={(e) =>
                        setSettings({
                          drillDuration: Number(e.target.value),
                        })
                      }
                      style={selectStyle}
                    >
                      <option value={30}>30 Seconds</option>
                      <option value={60}>60 Seconds</option>
                      <option value={90}>90 Seconds</option>
                      <option value={120}>120 Seconds</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Hit Sound</FieldLabel>
                    <select
                      className="armory-select"
                      value={hitSound}
                      onChange={(e) =>
                        setSettings({
                          hitSound: e.target.value as any,
                        })
                      }
                      style={selectStyle}
                    >
                      <option value="none">Muted</option>
                      <option value="tick">Digital Tick</option>
                      <option value="pop">Hollow Pop</option>
                      <option value="ding">Combat Ding</option>
                    </select>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              index="02"
              title="Global Network"
              sub="Cloud sync, leaderboards, launch preferences, and music bus."
            >
              <div style={{ display: 'grid', gap: 14 }}>
                <button
                  className="armory-btn stable-hover"
                  onClick={() =>
                    setSettings({
                      gameState: 'leaderboard',
                    })
                  }
                  style={{
                    padding: '15px 16px',
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    cursor: 'pointer',
                    borderRadius: 10,
                    fontWeight: 900,
                    letterSpacing: 2,
                  }}
                >
                  VIEW_GLOBAL_LEADERBOARD
                </button>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'rgba(0,0,0,0.48)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
                      Instant Launch
                    </div>
                    <div style={{ color: '#666', fontSize: 12, marginTop: 5 }}>
                      Bypass click-to-begin overlay
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={skipClickToBegin}
                    onChange={(e) =>
                      setSettings({
                        skipClickToBegin: e.target.checked,
                      })
                    }
                    style={toggleStyle}
                  />
                </div>

                <div>
                  <FieldLabel>Graphics Engine</FieldLabel>
                  <select
                    className="armory-select"
                    value={graphicsQuality}
                    onChange={(e) =>
                      setSettings({
                        graphicsQuality: e.target.value as any,
                      })
                    }
                    style={selectStyle}
                  >
                    <option value="high">HIGH_FX / Bloom Enabled</option>
                    <option value="performance">PERFORMANCE / Low Bloom</option>
                  </select>
                </div>

                <div>
                  <FieldLabel>Background Track</FieldLabel>
                  <select
                    className="armory-select"
                    value={musicTrack}
                    onChange={(e) =>
                      setSettings({
                        musicTrack: e.target.value,
                        isMusicPlaying: e.target.value !== 'none',
                      })
                    }
                    style={selectStyle}
                  >
                    {TRACK_LIST.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Music Volume: {Math.round(musicVolume * 100)}%</FieldLabel>
                  <EfectSlider
                    min={0}
                    max={1}
                    step={0.01}
                    value={musicVolume}
                    color={color}
                    onChange={(nextValue) =>
                      setSettings({
                        musicVolume: nextValue,
                      })
                    }
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gap: 22 }}>
            <Panel
              index="03"
              title="Biometric Targets"
              sub="Target color, shape, humanoid skin mode, speed, amount, and distance."
            >
              <div style={{ display: 'grid', gap: 18 }}>
                <div>
                  <FieldLabel>Target Emissive Color</FieldLabel>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 10,
                    }}
                  >
                    {TARGET_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        className="stable-hover"
                        onClick={() =>
                          setSettings({
                            targetColor: swatch,
                          })
                        }
                        style={{
                          height: 38,
                          borderRadius: 10,
                          background: swatch,
                          border:
                            targetColor.toLowerCase() === swatch.toLowerCase()
                              ? '3px solid #fff'
                              : '1px solid rgba(255,255,255,0.18)',
                          boxShadow:
                            targetColor.toLowerCase() === swatch.toLowerCase()
                              ? `0 0 22px ${swatch}`
                              : `0 0 12px ${swatch}44`,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Target Geometry</FieldLabel>
                  <select
                    className="armory-select"
                    value={targetShape}
                    onChange={(e) =>
                      setSettings({
                        targetShape: e.target.value as any,
                      })
                    }
                    style={selectStyle}
                  >
                    <option value="sphere">Sphere / High Accuracy</option>
                    <option value="cube">Cube / Standard</option>
                    <option value="humanoid">Humanoid / Character</option>
                  </select>
                </div>

                {targetShape === 'humanoid' && (
                  <div>
                    <FieldLabel>Humanoid Shader</FieldLabel>
                    <select
                      className="armory-select"
                      value={targetSkinMode}
                      onChange={(e) =>
                        setSettings({
                          targetSkinMode: e.target.value as any,
                        })
                      }
                      style={{
                        ...selectStyle,
                        color,
                        borderColor: `${color}66`,
                      }}
                    >
                      <option value="custom">Glow Performance</option>
                      <option value="original">High-Fidelity Textures</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <FieldLabel>Scale: {modelScale}x</FieldLabel>
                    <EfectSlider
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={modelScale}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          modelScale: nextValue,
                        })
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>Speed: {targetSpeed}x</FieldLabel>
                    <EfectSlider
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={targetSpeed}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          targetSpeed: nextValue,
                        })
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>Amount: {targetAmount}</FieldLabel>
                    <EfectSlider
                      min={1}
                      max={25}
                      value={targetAmount}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          targetAmount: nextValue,
                        })
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>Distance: {Math.abs(targetDistance)}m</FieldLabel>
                    <EfectSlider
                      min={-25}
                      max={-5}
                      step={0.5}
                      value={targetDistance}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          targetDistance: nextValue,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel
              index="04"
              title="Reticle Tuning"
              sub="Preview your crosshair before deployment. Presets now use different shapes."
            >
              <div style={{ display: 'grid', gap: 18 }}>
                <div>
                  <FieldLabel>Live Reticle Preview</FieldLabel>

                  <div
                    style={{
                      height: 168,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 18,
                      border: `1px solid ${color}66`,
                      background:
                        'radial-gradient(circle at center, rgba(255,255,255,0.06), rgba(0,0,0,0.72)), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '100% 100%, 24px 24px, 24px 24px',
                      boxShadow: `inset 0 0 36px ${color}14`,
                      marginBottom: 2,
                    }}
                  >
                    <CrosshairPreviewArt
                      styleName={crosshairStyle}
                      color={color}
                      gap={gap}
                      size={size}
                      thickness={thickness}
                      dot={dot}
                      crosshairOutline={crosshairOutline}
                      canvasSize={132}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>UI / Crosshair Glow Color</FieldLabel>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: 8,
                    }}
                  >
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        className="stable-hover"
                        onClick={() =>
                          setSettings({
                            color: swatch,
                          })
                        }
                        style={{
                          height: 34,
                          borderRadius: 9,
                          background: swatch,
                          border:
                            color.toLowerCase() === swatch.toLowerCase()
                              ? '3px solid #fff'
                              : '1px solid rgba(255,255,255,0.18)',
                          boxShadow:
                            color.toLowerCase() === swatch.toLowerCase()
                              ? `0 0 22px ${swatch}`
                              : `0 0 10px ${swatch}44`,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  {CROSSHAIR_PRESETS.map((preset) => {
                    const active = isCurrentCrosshair(preset);

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className="preset-card stable-hover"
                        onClick={() => applyCrosshairPreset(preset)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '76px 1fr',
                          gap: 12,
                          alignItems: 'center',
                          minHeight: 96,
                          padding: 12,
                          background: active ? `${color}18` : 'rgba(0,0,0,0.48)',
                          border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
                          borderRadius: 14,
                          color: '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div
                          style={{
                            width: 76,
                            height: 76,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 14,
                            background:
                              'radial-gradient(circle at center, rgba(255,255,255,0.08), rgba(0,0,0,0.85))',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <CrosshairPreviewArt
                            styleName={preset.id}
                            color={color}
                            gap={preset.gap}
                            size={preset.size}
                            thickness={preset.thickness}
                            dot={preset.dot}
                            crosshairOutline={preset.crosshairOutline}
                            canvasSize={58}
                          />
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 900,
                              letterSpacing: 2,
                              fontSize: 12,
                              marginBottom: 8,
                            }}
                          >
                            {preset.name}
                          </div>

                          <div
                            className="preset-tag"
                            style={{
                              display: 'inline-block',
                              color: active ? '#000' : color,
                              background: active ? color : 'rgba(0,0,0,0.62)',
                              border: `1px solid ${color}55`,
                              padding: '4px 7px',
                              borderRadius: 5,
                              fontSize: 10,
                              fontWeight: 900,
                              letterSpacing: 2,
                            }}
                          >
                            {active ? 'ACTIVE' : preset.tag}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 14,
                  }}
                >
                  <div>
                    <FieldLabel>Gap: {gap}px</FieldLabel>
                    <EfectSlider
                      min={0}
                      max={20}
                      value={gap}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          gap: nextValue,
                        })
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>Size: {size}px</FieldLabel>
                    <EfectSlider
                      min={2}
                      max={40}
                      value={size}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          size: nextValue,
                        })
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>Thickness: {thickness}px</FieldLabel>
                    <EfectSlider
                      min={1}
                      max={10}
                      value={thickness}
                      color={color}
                      onChange={(nextValue) =>
                        setSettings({
                          thickness: nextValue,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 14,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: 'rgba(255,255,255,0.72)',
                      fontWeight: 900,
                      letterSpacing: 2,
                    }}
                  >
                    CENTER_DOT
                    <input
                      type="checkbox"
                      checked={dot}
                      onChange={(e) =>
                        setSettings({
                          dot: e.target.checked,
                        })
                      }
                      style={toggleStyle}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 14,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: 'rgba(255,255,255,0.72)',
                      fontWeight: 900,
                      letterSpacing: 2,
                    }}
                  >
                    OUTLINE
                    <input
                      type="checkbox"
                      checked={crosshairOutline}
                      onChange={(e) =>
                        setSettings({
                          crosshairOutline: e.target.checked,
                        })
                      }
                      style={toggleStyle}
                    />
                  </label>
                </div>
              </div>
            </Panel>
          </div>

          <div style={{ display: 'grid', gap: 22 }}>
            <Panel
              index="05"
              title="360 Background Library"
              sub="Choose a unique 360 scene for your room. These values map to public/backgrounds image names."
            >
              <div style={{ display: 'grid', gap: 16 }}>
                <div
                  style={{
                    padding: 16,
                    background: 'rgba(0,0,0,0.52)',
                    border: `1px solid ${color}55`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      color,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 4,
                      marginBottom: 8,
                    }}
                  >
                    ACTIVE_ENVIRONMENT
                  </div>

                  <div
                    style={{
                      color: '#fff',
                      fontSize: 17,
                      fontWeight: 900,
                      letterSpacing: 3,
                      marginBottom: 8,
                    }}
                  >
                    {activeBackground.name}
                  </div>

                  <div
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    FILE: /public/backgrounds/{activeBackground.file}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {(['ALL', 'DARK', 'BRIGHT', 'ARENA'] as const).map((filter) => {
                    const active = activeBgCategory === filter;

                    return (
                                            <button
                        key={filter}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          chooseBgCategory(filter);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          chooseBgCategory(filter);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          chooseBgCategory(filter);
                        }}
                        className={
                          active ? 'armory-btn stable-hover' : 'armory-ghost stable-hover'
                        }
                        style={{
  padding: '10px 13px',
  borderRadius: 8,
  border: `1px solid ${active ? color : 'rgba(255,255,255,0.14)'}`,
  background: active ? color : 'rgba(0,0,0,0.55)',
  color: active ? '#000' : 'rgba(255,255,255,0.75)',
  cursor: 'pointer',
  fontWeight: 900,
  letterSpacing: 2,
  pointerEvents: 'auto',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                    maxHeight: 640,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                >
                  {filteredBackgrounds.map((bg) => {
                    const active = mapTheme === bg.id;
                    const isImage = bg.file !== 'built-in';

                    return (
                      <button
  key={bg.id}
  type="button"
  className="bg-card stable-hover"
  onPointerDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    chooseBackground(bg.id);
  }}
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    chooseBackground(bg.id);
  }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    chooseBackground(bg.id);
  }}
  style={{
    position: 'relative',
    minHeight: 154,
    overflow: 'hidden',
    borderRadius: 14,
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    background: 'rgba(0,0,0,0.62)',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    padding: 0,
    boxShadow: active ? `0 0 24px ${color}44` : 'none',
    pointerEvents: 'auto',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  }}
>
                        {isImage ? (
                          <div
                            className="bg-card-img"
                            style={{
                              pointerEvents: 'none',
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: `url('/backgrounds/${bg.file}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              opacity: 0.42,
                              transition: 'filter 0.18s ease',
                            }}
                          />
                        ) : (
                          <div
                            className="bg-card-img"
                            style={{
                              pointerEvents: 'none',
                              position: 'absolute',
                              inset: 0,
                              background:
                                bg.id === 'minimal'
                                  ? 'linear-gradient(135deg, #888, #111)'
                                  : bg.id === 'galaxy'
                                    ? 'radial-gradient(circle, #30105c, #05000a)'
                                    : bg.id === 'night'
                                      ? 'linear-gradient(135deg, #08101f, #000)'
                                      : `radial-gradient(circle, ${color}33, #000)`,
                              opacity: 0.42,
                              transition: 'filter 0.18s ease',
                            }}
                          />
                        )}

                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.82))',
                          }}
                        />

                        <div
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            padding: 14,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 8,
                                alignItems: 'center',
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  color: active ? color : '#fff',
                                  fontSize: 12,
                                  fontWeight: 900,
                                  letterSpacing: 2,
                                  lineHeight: 1.25,
                                  textShadow: active ? `0 0 12px ${color}` : 'none',
                                }}
                              >
                                {bg.name}
                              </div>

                              {active && (
                                <span
                                  style={{
                                    background: color,
                                    color: '#000',
                                    fontSize: 9,
                                    fontWeight: 900,
                                    letterSpacing: 1,
                                    padding: '4px 6px',
                                    borderRadius: 5,
                                  }}
                                >
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: 11,
                                lineHeight: 1.45,
                              }}
                            >
                              {bg.desc}
                            </div>
                          </div>

                          <div
                            style={{
                              color: active ? color : 'rgba(255,255,255,0.42)',
                              fontSize: 10,
                              fontWeight: 900,
                              letterSpacing: 2,
                              marginTop: 12,
                            }}
                          >
                            {bg.tone}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 1780,
            margin: '24px auto 0',
            display: 'grid',
            gridTemplateColumns: '1fr minmax(420px, 680px) 1fr',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${color})`,
              boxShadow: `0 0 14px ${color}`,
            }}
          />

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              forceDeploy();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              forceDeploy();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              forceDeploy();
            }}
            className="stable-hover"
            style={{
              position: 'relative',
              zIndex: 99999,
              pointerEvents: 'auto',
              overflow: 'hidden',
              padding: '22px 28px',
              fontSize: 27,
              backgroundColor: color,
              border: `2px solid ${color}`,
              color: '#000',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: 10,
              boxShadow: `0 0 40px ${color}70`,
              borderRadius: 14,
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                animation: 'armorySweep 2.8s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />

            <span
              style={{
                position: 'relative',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              DEPLOY_TO_ARENA
            </span>
          </button>

          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${color}, transparent)`,
              boxShadow: `0 0 14px ${color}`,
            }}
          />
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}