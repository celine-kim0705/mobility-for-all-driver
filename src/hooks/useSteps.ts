import { useState } from "react";
import { useTimeout } from "./useTimers";

/** count개의 단계를 gap ms마다 하나씩 완료시킨다. 반환값은 현재 확인 중인 단계 번호. */
export function useSteps(count: number, gap: number, onDone?: () => void) {
  const [index, setIndex] = useState(0);
  const running = index < count;
  useTimeout(
    () => {
      const next = index + 1;
      setIndex(next);
      if (next >= count) onDone?.();
    },
    running ? gap : null,
    index,
  );
  return index;
}
