const pad = (n: number) => String(n).padStart(2, "0");

/** 13:05 형식 */
export const hm = (d: Date = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** 초 → 3:05 형식 */
export const mss = (sec: number) => `${Math.floor(sec / 60)}:${pad(Math.max(0, sec) % 60)}`;

export const kmText = (km: number) => (km >= 1 ? `${km.toFixed(1)}km` : `${Math.round(km * 100) * 10}m`);

export const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* 지원하지 않는 기기 */
  }
};

export const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
