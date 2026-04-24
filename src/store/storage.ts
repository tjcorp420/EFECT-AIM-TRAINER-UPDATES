export const canUseStorage = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

export const safeParse = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const safeWrite = (key: string, value: unknown) => {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`EFECT_STORAGE_WRITE_FAILED: ${key}`, err);
  }
};

export const safeRemove = (key: string) => {
  if (!canUseStorage()) return;

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`EFECT_STORAGE_REMOVE_FAILED: ${key}`, err);
  }
};

export const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};