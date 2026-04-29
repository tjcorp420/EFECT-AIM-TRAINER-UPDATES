import { useEffect, useState } from 'react';

type FloatingTextItem = {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  kind: 'normal' | 'headshot' | 'bonus' | 'tracking';
};

let nextFloatingTextId = 1;

const getFloatingTextKind = (text: string): FloatingTextItem['kind'] => {
  const normalized = text.toLowerCase();

  if (normalized.includes('headshot')) return 'headshot';
  if (normalized.includes('bonus')) return 'bonus';
  if (normalized.includes('tracking')) return 'tracking';

  return 'normal';
};

export default function FloatingTextLayer() {
  const [items, setItems] = useState<FloatingTextItem[]>([]);

  useEffect(() => {
    const handleFloatingText = (event: Event) => {
      const customEvent = event as CustomEvent<{
        text?: string;
        x?: number;
        y?: number;
        color?: string;
      }>;

      const detail = customEvent.detail || {};
      const text = detail.text || '+0';

      const item: FloatingTextItem = {
        id: nextFloatingTextId++,
        text,
        x: typeof detail.x === 'number' ? detail.x : window.innerWidth / 2,
        y: typeof detail.y === 'number' ? detail.y : window.innerHeight / 2,
        color: detail.color || '#39ff14',
        kind: getFloatingTextKind(text),
      };

      setItems((current) => [...current.slice(-12), item]);

      window.setTimeout(() => {
        setItems((current) => current.filter((existing) => existing.id !== item.id));
      }, 900);
    };

    window.addEventListener('floating-text', handleFloatingText);

    return () => {
      window.removeEventListener('floating-text', handleFloatingText);
    };
  }, []);

  return (
    <div className="emx-floating-text-layer">
      {items.map((item) => (
        <div
          key={item.id}
          className={`emx-floating-text emx-floating-text-${item.kind}`}
          style={{
            left: item.x,
            top: item.y,
            color: item.kind === 'headshot' ? '#ffd400' : item.kind === 'bonus' ? '#ff4df0' : item.color,
            textShadow:
              item.kind === 'headshot'
                ? '0 0 12px #ffd400, 0 0 34px #ffd400, 0 0 62px rgba(255, 77, 240, 0.65)'
                : item.kind === 'bonus'
                  ? '0 0 12px #ff4df0, 0 0 32px rgba(255, 77, 240, 0.75)'
                  : `0 0 12px ${item.color}, 0 0 28px ${item.color}`,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}