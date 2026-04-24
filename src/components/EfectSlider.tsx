import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';

type EfectSliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  color: string;
  onChange: (value: number) => void;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const getStepDecimals = (step: number) => {
  const stepText = String(step);

  if (!stepText.includes('.')) return 0;

  return stepText.split('.')[1]?.length || 0;
};

const snapToStep = (value: number, min: number, step: number) => {
  const decimals = getStepDecimals(step);
  const snapped = Math.round((value - min) / step) * step + min;

  return Number(snapped.toFixed(decimals));
};

export default function EfectSlider({
  value,
  min,
  max,
  step = 1,
  color,
  onChange,
}: EfectSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const draftValueRef = useRef(value);

  const [draftValue, setDraftValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (draggingRef.current) return;

    draftValueRef.current = value;
    setDraftValue(value);
  }, [value]);

  const getValueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return draftValueRef.current;

      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return draftValueRef.current;

      const rawPercent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = min + rawPercent * (max - min);
      const nextValue = clamp(snapToStep(rawValue, min, step), min, max);

      return nextValue;
    },
    [min, max, step]
  );

  const updateDraftFromClientX = useCallback(
    (clientX: number) => {
      const nextValue = getValueFromClientX(clientX);

      draftValueRef.current = nextValue;
      setDraftValue(nextValue);
    },
    [getValueFromClientX]
  );

  const beginDrag = useCallback(
    (clientX: number) => {
      draggingRef.current = true;
      setIsDragging(true);

      document.body.classList.add('efect-slider-dragging');

      try {
        window.getSelection()?.removeAllRanges();
      } catch {
        // Safe to ignore.
      }

      updateDraftFromClientX(clientX);
    },
    [updateDraftFromClientX]
  );

  const finishDrag = useCallback(() => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);
    document.body.classList.remove('efect-slider-dragging');

    onChange(draftValueRef.current);
  }, [onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      updateDraftFromClientX(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      finishDrag();
    };

    const handleWindowBlur = () => {
      finishDrag();
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('blur', handleWindowBlur);

      document.body.classList.remove('efect-slider-dragging');
    };
  }, [updateDraftFromClientX, finishDrag]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      beginDrag(e.clientX);
    },
    [beginDrag]
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      let nextValue = draftValueRef.current;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        nextValue = draftValueRef.current - step;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        nextValue = draftValueRef.current + step;
      }

      if (e.key === 'Home') {
        nextValue = min;
      }

      if (e.key === 'End') {
        nextValue = max;
      }

      if (nextValue !== draftValueRef.current) {
        e.preventDefault();
        e.stopPropagation();

        const finalValue = clamp(snapToStep(nextValue, min, step), min, max);

        draftValueRef.current = finalValue;
        setDraftValue(finalValue);
        onChange(finalValue);
      }
    },
    [min, max, step, onChange]
  );

  const percent = useMemo(() => {
    if (max === min) return 0;

    return clamp(((draftValue - min) / (max - min)) * 100, 0, 100);
  }, [draftValue, min, max]);

  return (
    <>
      <style>{`
        .efect-slider,
        .efect-slider * {
          -webkit-app-region: no-drag !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          pointer-events: auto !important;
        }

        .efect-slider-dragging,
        .efect-slider-dragging * {
          cursor: grabbing !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>

      <div
        ref={trackRef}
        className="efect-slider"
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={draftValue}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onDragStart={(e) => e.preventDefault()}
        style={{
          position: 'relative',
          width: '100%',
          height: 34,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 7,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.22)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: `inset 0 0 12px rgba(0,0,0,0.85), 0 0 12px ${color}44`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${percent}%`,
            height: 7,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.35))`,
            boxShadow: `0 0 14px ${color}88`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: `${percent}%`,
            transform: 'translateX(-50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: color,
            border: '2px solid #fff',
            boxShadow: `0 0 18px ${color}, 0 0 36px ${color}66`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
}