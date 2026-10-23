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

/** 단어 뒤에 올 ‘로/으로’를 받침에 맞춰 붙인다 (ㄹ 받침은 ‘로’) */
export const ro = (word: string) => {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return `${word}로`;
  const tail = (c - 0xac00) % 28;
  return `${word}${tail === 0 || tail === 8 ? "로" : "으로"}`;
};
